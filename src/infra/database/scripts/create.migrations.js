import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
export const createMigrations = async () => {
  const args = process.argv.slice(2);
  const name = args[0];
  if (!name) {
    console.error("Please provide a name for the migration.");
    process.exit(1);
  }

  const migrations = resolve("src/infra/database/migrations");

  writeFile(
    `${migrations}/${Date.now()}_${name}.js`,
    `
    export const up = async (db) => {
      // Write your migration here
    };

    export const down = async (db) => {
      // Write your rollback here
    };
    `
  );

  console.log(`Migration ${name} created successfully.`);
};

createMigrations();
