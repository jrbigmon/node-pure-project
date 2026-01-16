import { resolve } from "node:path";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 5432,
});

const connected = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT NOW()", (err, res) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        return reject(err);
      } else {
        console.log("Database connected successfully at:", res.rows[0].now);
        resolve();
      }
    });
  });
};

const runMigrations = async () => {
  const migrations = resolve("src/infra/database/migrations");

  for (const file of await import("node:fs/promises").then((fs) =>
    fs.readdir(migrations)
  )) {
    const alreadyRun = await pool.query(
      "SELECT 1 FROM migrations WHERE name = $1",
      [file]
    );

    if (alreadyRun.rowCount > 0) {
      console.log(`Skipping already run migration: ${file}`);
      continue;
    }

    if (file.endsWith(".js")) {
      const migration = await import(resolve(migrations, file));
      console.log(`Running migration: ${file}`);
      await migration.up(pool);
      console.log(`Migration ${file} completed.`);
      await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
    }
  }
};

const init = async ({ runMigration = false }) => {
  await new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS migrations (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, timestamps TIMESTAMP NOT NULL DEFAULT NOW())",
      (err) => {
        if (err) {
          console.error("Error creating migrations table:", err);
          return reject(err);
        } else {
          console.log("Migrations table is ready.");
          resolve();
        }
      }
    );
  });

  const promises = [];

  if (runMigration) {
    promises.push(runMigrations());
  }

  await Promise.all(promises);
};

export const PostgresDatabase = {
  query: (text, params) => pool.query(text, params),
  connected,
  init,
  migrations: {
    up: runMigrations,
    down: async () => {
      throw new Error("Not implemented yet");
    },
  },
};
