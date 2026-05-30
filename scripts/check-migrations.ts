import { env } from "../env";
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const overrideFlag = env.ALLOW_DESTRUCTIVE_MIGRATIONS === 'true';

if (!fs.existsSync(migrationsDir)) process.exit(0);

const dirs = fs.readdirSync(migrationsDir).filter((f: string) => fs.statSync(path.join(migrationsDir, f)).isDirectory());

let hasDestructive = false;

for (const dir of dirs) {
  const sqlFile = path.join(migrationsDir, dir, 'migration.sql');
  if (fs.existsSync(sqlFile)) {
    const content = fs.readFileSync(sqlFile, 'utf8').toUpperCase();
    if (/DROP\s+COLUMN/i.test(content) || /DROP\s+TABLE/i.test(content)) {
      console.warn(`\n⚠️  WARNING: Destructive change detected in migration: ${dir}`);
      hasDestructive = true;
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
