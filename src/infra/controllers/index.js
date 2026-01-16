import { extractParams } from "../../helpers/extract-params.js";
import { UserController } from "./users/index.js";

export const controllers = ({ req, res: _res }) => {
  const routes = {
    ...UserController,
    DEFAULT: (_req, res) => {
      return new Promise((resolve) => {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
        resolve();
      });
    },
  };

  const { method, url } = req;
  const routeKey = `(${method.toUpperCase()})${url}`;

  for (const [route, fn] of Object.entries(routes)) {
    if (route === routeKey) return fn;

    const method = route.match(/^\((.*?)\)/)?.[1];
    const routeWithoutMethod = route.replace(/^\(.*?\)/, "");
    const params = extractParams(routeWithoutMethod, url);

    if (params && method === req.method) {
      req.params = params;
      return fn;
    }
  }

  return routes["DEFAULT"];
};
