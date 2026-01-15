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
  const routeKey = `${method.toUpperCase()}:${url}`;
  return routes[routeKey] || routes["DEFAULT"];
};
