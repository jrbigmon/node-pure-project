import http from "node:http";
import { httpExceptionHandler } from "./infra/exceptions/http/handle-http.exception.js";
import { controllers } from "./infra/controllers/index.js";
import { compose as middlewares } from "./infra/middlewares/compose.js";
import { getBody } from "./infra/middlewares/get-body.middleware.js";

const bootstrap = ({ port }) => {
  http
    .createServer(async (req, res) => {
      try {
        await middlewares([getBody])(req, res);
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
