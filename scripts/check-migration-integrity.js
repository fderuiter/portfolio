/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const fs = require("fs");
const path = require("path");

function readProvider(source, pattern, sourceName) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Could not read the datasource provider from ${sourceName}.`);
  }
  return match[1];
}

function getSchemaProvider(schema) {
  const datasource = schema.match(/datasource\s+\w+\s*\{([\s\S]*?)\}/);
  if (!datasource) {
    throw new Error("Could not find a datasource block in prisma/schema.prisma.");
  }
  return readProvider(
    datasource[1],
    /provider\s*=\s*["']([^"']+)["']/,
    "prisma/schema.prisma",
  );
}

function getLockProvider(lock) {
  return readProvider(
    lock,
    /^provider\s*=\s*["']([^"']+)["']/m,
    "prisma/migrations/migration_lock.toml",
  );
}

function validateMigrationFiles(directory) {
  const migrations = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (migrations.length === 0) {
    throw new Error("No migration directories were found.");
  }

  for (const migration of migrations) {
    const sqlPath = path.join(directory, migration, "migration.sql");
    if (!fs.existsSync(sqlPath) || fs.readFileSync(sqlPath, "utf8").trim() === "") {
      throw new Error(`Migration ${migration} has no non-empty migration.sql file.`);
    }
  }

  return migrations;
}

function getDocMigrations(docContent) {
  if (typeof docContent !== "string") return [];
  const matches = docContent.match(/\b\d{14}_[a-z0-9_]+\b/gi) || [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase()))).sort();
}

function validateDocMigrations(docPath, migrationsPath) {
  if (!fs.existsSync(docPath)) {
    throw new Error(`Migration documentation file not found at ${docPath}.`);
  }
  const docContent = fs.readFileSync(docPath, "utf8");
  const documentedMigrations = getDocMigrations(docContent);
  const actualMigrations = validateMigrationFiles(migrationsPath);

  const actualLowerMap = new Map(actualMigrations.map((m) => [m.toLowerCase(), m]));
  const missingInDoc = actualMigrations.filter(
    (m) => !documentedMigrations.includes(m.toLowerCase()),
  );
  const extraInDoc = documentedMigrations.filter(
    (m) => !actualLowerMap.has(m),
  );

  if (missingInDoc.length > 0 || extraInDoc.length > 0) {
    const details = [];
    if (missingInDoc.length > 0) {
      details.push(`Missing in documentation: ${missingInDoc.join(", ")}`);
    }
    if (extraInDoc.length > 0) {
      details.push(`Extra/mismatched in documentation: ${extraInDoc.join(", ")}`);
    }
    throw new Error(
      `Documentation drift detected in ${path.basename(docPath)}:\n  ${details.join("\n  ")}\nPlease update ${path.basename(docPath)} to match active repository migrations.`,
    );
  }

  return documentedMigrations;
}

function checkMigrationIntegrity(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, "..");
  const schemaFile = options.schemaPath || path.join(rootDir, "prisma/schema.prisma");
  const lockFile = options.lockPath || path.join(rootDir, "prisma/migrations/migration_lock.toml");
  const migrationsDir = options.migrationsPath || path.join(rootDir, "prisma/migrations");
  const docFile = options.docPath || path.join(rootDir, "DATABASE_MIGRATIONS.md");

  const schemaProvider = getSchemaProvider(fs.readFileSync(schemaFile, "utf8"));
  const lockProvider = getLockProvider(fs.readFileSync(lockFile, "utf8"));

  if (schemaProvider !== lockProvider) {
    throw new Error(
      `Datasource provider mismatch: schema.prisma uses ${schemaProvider}, ` +
        `but migration_lock.toml uses ${lockProvider}.`,
    );
  }

  const migrations = validateMigrationFiles(migrationsDir);
  const docMigrations = validateDocMigrations(docFile, migrationsDir);

  console.log(
    `Migration integrity check passed: provider=${schemaProvider}, migrations=${migrations.length}, docMigrations=${docMigrations.length}.`,
  );
}

if (require.main === module) {
  try {
    checkMigrationIntegrity();
  } catch (error) {
    console.error(`Migration integrity check failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  checkMigrationIntegrity,
  getDocMigrations,
  getLockProvider,
  getSchemaProvider,
  validateDocMigrations,
  validateMigrationFiles,
};
