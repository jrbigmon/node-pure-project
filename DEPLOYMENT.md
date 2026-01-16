# 🚀 Deployment & Produção

> Guia para colocar a aplicação em produção.

## 📦 Build & Deployment

### 1. Preparação para Produção

```bash
# Instalar dependências
yarn install --production

# Verificar se tudo está ok
yarn test

# Gerar cobertura de testes
yarn test --coverage
```

### 2. Variáveis de Ambiente

Crie arquivo `.env.production`:

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgresql://user:password@host:5432/db
```

Use no código:

```javascript
// src/config/env.js
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  logLevel: process.env.LOG_LEVEL || "debug",
  databaseUrl: process.env.DATABASE_URL,
};
```

### 3. Scripts do Package.json

```json
{
  "scripts": {
    "start": "NODE_ENV=production node ./src/main.js",
    "start:dev": "node --watch ./src/main.js",
    "test": "NODE_OPTIONS=--experimental-vm-modules yarn jest",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules yarn jest --watch",
    "test:coverage": "NODE_OPTIONS=--experimental-vm-modules yarn jest --coverage",
    "lint": "eslint src",
    "build": "echo 'No build needed for ES modules'"
  }
}
```

---

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package.json yarn.lock ./

# Instalar dependências
RUN yarn install --production

# Copiar código
COPY src ./src

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/docs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "./src/main.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

Executar:

```bash
docker-compose up -d
```

---

## ☁️ Deployment em Plataformas

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create seu-app-name

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

**Procfile**:

```
web: node ./src/main.js
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### DigitalOcean App Platform

```yaml
name: node-study-api
services:
- name: web
  source:
    type: github
    repo: jrbigmon/node-study
    branch: main
  github:
    deploy_on_push: true
  build_command: "yarn install --production"
  run_command: "node ./src/main.js"
  http_port: 3000
  health_check:
    http_path: /docs
```

---

## 📊 Monitoring & Logging

### Logging Estruturado

```javascript
// src/infra/logger/logger.js
export class Logger {
  constructor(level = "info") {
    this.level = level;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
  }

  log(level, message, data = {}) {
    if (this.levels[level] >= this.levels[this.level]) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
      }));
    }
  }

  debug(message, data) { this.log("debug", message, data); }
  info(message, data) { this.log("info", message, data); }
  warn(message, data) { this.log("warn", message, data); }
  error(message, error, data) {
    this.log("error", message, {
      ...data,
      error: error?.message,
      stack: error?.stack,
    });
  }
}
```

Uso:

```javascript
const logger = new Logger(process.env.LOG_LEVEL);

logger.info("Server started", { port: 3000 });
logger.error("Failed to create user", error, { userId: "123" });
```

### Tratamento de Erros Global

```javascript
// src/main.js
import http from "node:http";
import { httpExceptionHandler } from "./infra/exceptions/http/handle-http.exception.js";
import { controllers } from "./infra/controllers/index.js";
import { middlewares } from "./infra/middlewares/index.js";
import { Logger } from "./infra/logger/logger.js";

const logger = new Logger(process.env.LOG_LEVEL || "info");

const bootstrap = ({ port }) => {
  http
    .createServer(async (req, res) => {
      const startTime = Date.now();
      
      try {
        logger.info("Incoming request", {
          method: req.method,
          url: req.url,
        });

        await middlewares(req, res);
        await controllers({ req, res })(req, res);

        const duration = Date.now() - startTime;
        logger.info("Request completed", {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        });
      } catch (error) {
        logger.error("Request failed", error, {
          method: req.method,
          url: req.url,
        });
        return httpExceptionHandler({ error, req, res });
      }
    })
    .listen(port ?? 3000)
    .on("listening", () => {
      logger.info(`Server is running on http://localhost:${port}`);
    })
    .on("error", (error) => {
      logger.error("Server error", error);
      process.exit(1);
    });
};

bootstrap({ port: process.env.PORT || 3000 });

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});
```

---

## 🔒 Segurança em Produção

### CORS

```javascript
// src/infra/middlewares/cors.middleware.js
export async function corsMiddleware(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
}
```

### Rate Limiting

```javascript
// src/infra/middlewares/rate-limit.middleware.js
const requestCounts = new Map();

export function rateLimitMiddleware(req, res) {
  const key = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const count = requestCounts.get(key) || 0;

  if (count > 100) { // 100 requisições por minuto
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Too many requests" }));
    return false;
  }

  requestCounts.set(key, count + 1);
  
  // Limpar a cada minuto
  setTimeout(() => {
    requestCounts.delete(key);
  }, 60000);

  return true;
}
```

### HTTPS

```javascript
// src/main.js
import https from "node:https";
import fs from "node:fs";

const bootstrap = ({ port, useHttps }) => {
  let server;

  if (useHttps) {
    const options = {
      key: fs.readFileSync(process.env.KEY_FILE),
      cert: fs.readFileSync(process.env.CERT_FILE),
    };
    server = https.createServer(options, requestHandler);
  } else {
    server = http.createServer(requestHandler);
  }

  server.listen(port);
};

bootstrap({
  port: process.env.PORT || 3000,
  useHttps: process.env.USE_HTTPS === "true",
});
```

---

## 🧪 Testes em Produção

### Health Check

```javascript
// src/infra/controllers/health/health.controller.js
export const HealthController = {
  "(GET)/health": async (_req, res) => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(health));
  },
};
```

### Smoke Tests

```bash
#!/bin/bash
# scripts/smoke-test.sh

echo "Testing health endpoint..."
curl -f http://localhost:3000/health || exit 1

echo "Testing docs endpoint..."
curl -f http://localhost:3000/docs || exit 1

echo "Testing swagger spec..."
curl -f http://localhost:3000/docs/swagger || exit 1

echo "All smoke tests passed!"
```

---

## 📈 Performance

### Compressão de Resposta

```javascript
// src/infra/middlewares/compression.middleware.js
export async function compressionMiddleware(req, res) {
  const acceptEncoding = req.headers["accept-encoding"] || "";

  if (acceptEncoding.includes("gzip")) {
    res.setHeader("Content-Encoding", "gzip");
    const zlib = await import("node:zlib");
    return zlib.createGzip();
  }

  return null;
}
```

### Caching

```javascript
// src/infra/middlewares/cache.middleware.js
const cache = new Map();

export async function cacheMiddleware(req, res) {
  if (req.method !== "GET") return;

  const cached = cache.get(req.url);
  if (cached) {
    res.writeHead(200, { "X-Cache": "HIT", ...cached.headers });
    res.end(cached.body);
    return true;
  }

  return false;
}
```

---

## 📋 Checklist de Deploy

- [ ] Todos os testes passam: `yarn test`
- [ ] Cobertura acima de 80%: `yarn test:coverage`
- [ ] Variáveis de ambiente configuradas
- [ ] Logs estruturados implementados
- [ ] Health check endpoint funciona
- [ ] CORS configurado corretamente
- [ ] Segurança (rate limiting, HTTPS)
- [ ] Documentação Swagger atualizada
- [ ] Docker image construída com sucesso
- [ ] Smoke tests passam em produção
- [ ] Monitoring configurado
- [ ] Backup automático configurado (se BD)
- [ ] Plano de rollback definido

---

## 🚨 Rollback Strategy

```bash
#!/bin/bash
# scripts/rollback.sh

VERSION=$1
CURRENT=$(heroku releases -n 5 --app seu-app | grep "Web" | head -1 | awk '{print $1}')

echo "Rolling back from $CURRENT to $VERSION"
heroku releases:rollback $VERSION --app seu-app

echo "Verifying health..."
curl -f https://seu-app.herokuapp.com/health || {
  echo "Rollback failed!"
  exit 1
}

echo "Rollback successful!"
```

---

## 📞 Support & Debugging

### Logs em Produção

```bash
# Heroku
heroku logs --tail --app seu-app

# Docker
docker logs -f container-name

# Railway
railway logs
```

### Debugging Remoto

```javascript
// src/main.js com node debugger
if (process.env.DEBUG_ENABLED === "true") {
  const inspector = await import("node:inspector");
  inspector.open(9229, "0.0.0.0");
  console.log("Debugger listening on 0.0.0.0:9229");
}
```

Conectar com VS Code:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Production",
  "address": "seu-ip-producao",
  "port": 9229,
  "skipFiles": ["<node_internals>/**"]
}
```

---

## 📚 Referências

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker Deployment](https://docs.docker.com/develop/dev-best-practices/)
- [Heroku Node.js](https://devcenter.heroku.com/articles/nodejs-support)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [CloudFlare Workers](https://workers.cloudflare.com/)
