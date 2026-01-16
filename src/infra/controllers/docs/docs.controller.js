import { swaggerDocs, generateSwaggerHTML } from "../../../docs/swagger.js";

export const DocsController = {
  "(GET)/docs": (_req, res) => {
    return new Promise((resolve) => {
      const html = generateSwaggerHTML();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      resolve();
    });
  },

  "(GET)/docs/swagger": (_req, res) => {
    return new Promise((resolve) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(swaggerDocs));
      resolve();
    });
  },
};
