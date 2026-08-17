/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { checkMigrationIntegrity } = require('./check-migration-integrity.js');

// 1. Run migration file integrity and datasource provider consistency checks first
try {
  checkMigrationIntegrity();
} catch (error) {
  console.error(`\n❌ ERROR: Migration integrity check failed: ${error.message}`);
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const overrideFlag = process.env.ALLOW_DESTRUCTIVE_MIGRATIONS === 'true';

let hasDestructive = false;

// Tokenizer implementation
function tokenize(sql) {
  const tokens = [];
  let i = 0;
  const n = sql.length;

  while (i < n) {
    const char = sql[i];

    // 1. Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // 2. Block comments: /* ... */
    if (char === '/' && sql[i + 1] === '*') {
      i += 2;
      while (i < n && !(sql[i] === '*' && sql[i + 1] === '/')) {
        i++;
      }
      if (i < n) {
        i += 2;
      }
      continue;
    }

    // 3. Line comments: -- ...
    if (char === '-' && sql[i + 1] === '-') {
      i += 2;
      while (i < n && sql[i] !== '\n' && sql[i] !== '\r') {
        i++;
      }
      continue;
    }

    // 4. Quoted identifiers: "..."
    if (char === '"') {
      let value = '"';
      i++;
      while (i < n && sql[i] !== '"') {
        value += sql[i];
        i++;
      }
      if (i < n) {
        value += '"';
        i++;
      }
      tokens.push({ type: 'QUOTED_IDENTIFIER', value });
      continue;
    }

    // 5. String literals: '...'
    if (char === "'") {
      let value = "'";
      i++;
      while (i < n && sql[i] !== "'") {
        value += sql[i];
        i++;
      }
      if (i < n) {
        value += "'";
        i++;
      }
      tokens.push({ type: 'STRING_LITERAL', value });
      continue;
    }

    // 6. Symbols
    if (char === ';' || char === ',' || char === '(' || char === ')') {
      tokens.push({ type: 'SYMBOL', value: char });
      i++;
      continue;
    }

    // 7. Words (keywords or unquoted identifiers)
    if (/[a-zA-Z0-9_$]/.test(char)) {
      let value = '';
      while (i < n && /[a-zA-Z0-9_$]/.test(sql[i])) {
        value += sql[i];
        i++;
      }
      tokens.push({ type: 'WORD', value: value.toUpperCase() });
      continue;
    }

    // 8. Operators or other chars
    tokens.push({ type: 'OPERATOR', value: char });
    i++;
  }

  return tokens;
}

function splitStatements(tokens) {
  const statements = [];
  let current = [];
  for (const token of tokens) {
    if (token.type === 'SYMBOL' && token.value === ';') {
      if (current.length > 0) {
        statements.push(current);
        current = [];
      }
    } else {
      current.push(token);
    }
  }
  if (current.length > 0) {
    statements.push(current);
  }
  return statements;
}

function hasColumnTypeChange(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'WORD' && t.value === 'ALTER') {
      if (tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'TABLE') {
        continue;
      }
      let nextIdx = i + 1;
      if (tokens[nextIdx]?.type === 'WORD' && tokens[nextIdx].value === 'COLUMN') {
        nextIdx++;
      }
      if (nextIdx < tokens.length) {
        nextIdx++;
        if (tokens[nextIdx]?.type === 'WORD') {
          if (tokens[nextIdx].value === 'TYPE') {
            return true;
          }
          if (tokens[nextIdx].value === 'SET' &&
              tokens[nextIdx + 1]?.type === 'WORD' && tokens[nextIdx + 1].value === 'DATA' &&
              tokens[nextIdx + 2]?.type === 'WORD' && tokens[nextIdx + 2].value === 'TYPE') {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function hasSetNotNull(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'WORD' && tokens[i].value === 'SET' &&
        tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'NOT' &&
        tokens[i + 2]?.type === 'WORD' && tokens[i + 2].value === 'NULL') {
      return true;
    }
  }
  return false;
}

function analyzeStatement(tokens) {
  // 1. Check for Drop Column / Drop Table
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'WORD' && tokens[i].value === 'DROP') {
      if (tokens[i + 1]?.type === 'WORD' && (tokens[i + 1].value === 'COLUMN' || tokens[i + 1].value === 'TABLE')) {
        return {
          unsafe: true,
          reason: `DROP ${tokens[i + 1].value}`
        };
      }
    }
  }

  // 2. Check for Rename Column / Rename To
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'WORD' && tokens[i].value === 'RENAME') {
      if (tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'COLUMN') {
        return {
          unsafe: true,
          reason: 'RENAME COLUMN'
        };
      }
      if (tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'TO') {
        return {
          unsafe: true,
          reason: 'RENAME TO'
        };
      }
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'WORD' && (tokens[j].value === 'COLUMN' || tokens[j].value === 'TO')) {
          return {
            unsafe: true,
            reason: `RENAME ... ${tokens[j].value}`
          };
        }
      }
    }
  }

  // 3. Check for Column Type Change
  if (hasColumnTypeChange(tokens)) {
    return {
      unsafe: true,
      reason: 'ALTER COLUMN TYPE'
    };
  }

  // 4. Check for Set Not Null
  if (hasSetNotNull(tokens)) {
    return {
      unsafe: true,
      reason: 'SET NOT NULL'
    };
  }

  return { unsafe: false };
}

function getTableName(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'WORD' && tokens[i].value === 'ALTER' &&
        tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'TABLE') {
      const next = tokens[i + 2];
      if (next) {
        return next.value;
      }
    }
  }
  return 'unknown';
}

function getColumnName(tokens, reason) {
  if (reason.includes('DROP COLUMN')) {
    const idx = tokens.findIndex(t => t.type === 'WORD' && t.value === 'COLUMN');
    if (idx !== -1 && tokens[idx + 1]) {
      return tokens[idx + 1].value;
    }
  }
  if (reason.includes('RENAME COLUMN')) {
    const idx = tokens.findIndex(t => t.type === 'WORD' && t.value === 'COLUMN');
    if (idx !== -1 && tokens[idx + 1]) {
      return tokens[idx + 1].value;
    }
  }
  if (reason.includes('ALTER COLUMN TYPE') || reason.includes('SET NOT NULL')) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'WORD' && tokens[i].value === 'ALTER') {
        if (tokens[i + 1]?.type === 'WORD' && tokens[i + 1].value === 'TABLE') {
          continue;
        }
        let nextIdx = i + 1;
        if (tokens[nextIdx]?.type === 'WORD' && tokens[nextIdx].value === 'COLUMN') {
          nextIdx++;
        }
        if (nextIdx < tokens.length) {
          return tokens[nextIdx].value;
        }
      }
    }
  }
  return 'N/A';
}

function runCheck() {
  if (!fs.existsSync(migrationsDir)) process.exit(0);

  const dirs = fs.readdirSync(migrationsDir).filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());

  for (const dir of dirs) {
    const sqlFile = path.join(migrationsDir, dir, 'migration.sql');
    if (fs.existsSync(sqlFile)) {
      const content = fs.readFileSync(sqlFile, 'utf8');
      const tokens = tokenize(content);
      const statements = splitStatements(tokens);

      for (const statement of statements) {
        const result = analyzeStatement(statement);
        if (result.unsafe) {
          const tableName = getTableName(statement);
          const columnName = getColumnName(statement, result.reason);
          const reconstructed = statement.map(t => t.value).join(' ');
          
          console.warn(`\n⚠️  WARNING: Destructive change detected in migration: ${dir}`);
          console.warn(`Reason: ${result.reason}`);
          console.warn(`Table: ${tableName}`);
          console.warn(`Column: ${columnName}`);
          console.warn(`Statement: ${reconstructed}\n`);
          
          hasDestructive = true;
        }
      }
    }
  }

  if (hasDestructive) {
    if (overrideFlag) {
      console.log("Override flag ALLOW_DESTRUCTIVE_MIGRATIONS is set. Proceeding...");
    } else {
      console.error("\n❌ ERROR: Destructive migrations are blocked. Set ALLOW_DESTRUCTIVE_MIGRATIONS=true to override.");
      process.exit(1);
    }
  }

  console.log("Migration check passed.");
}

if (require.main === module) {
  try {
    runCheck();
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  tokenize,
  splitStatements,
  hasColumnTypeChange,
  hasSetNotNull,
  analyzeStatement,
  getTableName,
  getColumnName,
  runCheck,
};


