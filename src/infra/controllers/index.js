import { extractParams } from "../../helpers/extract-params.js";
import { UserController } from "./users/index.js";
import { DocsController } from "./docs/docs.controller.js";

export const controllers = ({ req, res: _res }) => {
  const routes = {
    ...DocsController,
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

  if (routes[routeKey]) {
    return routes[routeKey];
  }

  for (const [route, fn] of Object.entries(routes)) {
    if (route === "DEFAULT") continue;

    const routeMethod = route.match(/^\((.*?)\)/)?.[1];
    const routeWithoutMethod = route.replace(/^\(.*?\)/, "");
    const params = extractParams(routeWithoutMethod, url);

    if (params && routeMethod === req.method) {
      req.params = params;
      return fn;
    }
  }

  return routes["DEFAULT"];
};
