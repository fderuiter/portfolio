/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "prisma/schema.prisma");
const migrationsPath = path.join(root, "prisma/migrations");
const lockPath = path.join(migrationsPath, "migration_lock.toml");

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

function checkMigrationIntegrity() {
  const schemaProvider = getSchemaProvider(fs.readFileSync(schemaPath, "utf8"));
  const lockProvider = getLockProvider(fs.readFileSync(lockPath, "utf8"));

  if (schemaProvider !== lockProvider) {
    throw new Error(
      `Datasource provider mismatch: schema.prisma uses ${schemaProvider}, ` +
        `but migration_lock.toml uses ${lockProvider}.`,
    );
  }

  const migrations = validateMigrationFiles(migrationsPath);
  console.log(
    `Migration integrity check passed: provider=${schemaProvider}, migrations=${migrations.length}.`,
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
  getLockProvider,
  getSchemaProvider,
  validateMigrationFiles,
};
