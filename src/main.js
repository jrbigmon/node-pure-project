import http from "node:http";
import { httpExceptionHandler } from "./infra/exceptions/http/handle-http.exception.js";
import { controllers } from "./infra/controllers/index.js";
import { middlewares } from "./infra/middlewares/index.js";
import dotenv from "dotenv";
import { PostgresDatabase } from "./infra/database/db.pg.js";
dotenv.config();

const bootstrap = async ({ port }) => {
  await PostgresDatabase.connected();
  await PostgresDatabase.init({ runMigration: true });

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
    });
};

bootstrap({ port: 3000 });
