import { randomUUID } from "node:crypto";

export const createUserController = (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const user = JSON.parse(body);
    user.id = randomUUID();
    user.createdAt = new Date();
    user.updatedAt = new Date();

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
  });
};
