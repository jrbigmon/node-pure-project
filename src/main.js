import http from "node:http";
import { httpExceptionHandler } from "./infra/exceptions/http/handle-http.exception.js";
import { controllers } from "./infra/controllers/index.js";
import { middlewares } from "./infra/middlewares/index.js";
import dotenv from "dotenv";
import { PostgresDatabase } from "./infra/database/db.pg.js";
dotenv.config();

const bootstrap = async ({ port }) => {
  try {
    await PostgresDatabase.connected();
    await PostgresDatabase.init({ runMigration: true });
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }

  http
    .createServer(async (req, res) => {
      try {
        await middlewares(req, res);
        await controllers({ req, res })(req, res);
      } catch (error) {
        return httpExceptionHandler({ error, req, res });
      }
    })
    .listen(port ?? 3000)
    .on("listening", () => {
      console.log(`Server is running on http://localhost:${port}`);
    })
    .on("error", async (error) => {
      console.error("Error starting server:", error);
      await PostgresDatabase.down();
      process.exit(1);
    })
    .on("close", async () => {
      console.error("Closed server");
      await PostgresDatabase.down();
      process.exit(1);
    });
};

bootstrap({ port: 3000 });
