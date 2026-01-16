import { BadRequestException } from "../../domain/exception/bad-request.exception.js";

export function getBody(req, _res, next) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        resolve(req.body);
        next?.();
      } catch {
        reject(new BadRequestException("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}
