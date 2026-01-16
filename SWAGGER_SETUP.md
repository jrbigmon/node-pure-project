# 📚 Configuração do Swagger em Node Puro

## O que foi configurado?

### 1. **Arquivo de Especificação OpenAPI** (`src/docs/swagger.json`)
   - Define toda a documentação da API em formato OpenAPI 3.0
   - Descreve endpoints, parâmetros, requisições e respostas
   - É possível adicionar mais rotas conforme necessário

### 2. **Módulo Swagger** (`src/docs/swagger.js`)
   - Carrega o arquivo `swagger.json`
   - Gera HTML com a interface do Swagger UI
   - Fornece a especificação em JSON via endpoint

### 3. **Controlador de Documentação** (`src/infra/controllers/docs/docs.controller.js`)
   - Rota `(GET)/docs` → Retorna HTML do Swagger UI
   - Rota `(GET)/docs/swagger` → Retorna JSON da especificação OpenAPI

### 4. **Integração nos Controllers** (`src/infra/controllers/index.js`)
   - Registra as rotas de documentação no sistema de rotas

---

## 🚀 Como usar?

### Iniciar o servidor:
```bash
yarn start
# ou
yarn start:dev
```

### Acessar a documentação:
- **UI interativa**: http://localhost:3000/docs
- **Especificação JSON**: http://localhost:3000/docs/swagger

---

## 📝 Como adicionar novas rotas à documentação?

1. Edite o arquivo `src/docs/swagger.json`
2. Adicione o endpoint na seção `paths:`

**Exemplo:**
```json
"/products/{id}": {
  "get": {
    "summary": "Get product by ID",
    "tags": ["Products"],
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": { "type": "string" }
      }
    ],
    "responses": {
      "200": {
        "description": "Product found",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🔧 Estrutura criada

```
src/
├── docs/
│   ├── swagger.js          ← Módulo Swagger
│   └── swagger.json        ← Especificação OpenAPI
└── infra/
    └── controllers/
        ├── docs/
        │   └── docs.controller.js  ← Controlador de docs
        └── index.js                ← Registro de rotas
```

---

## 💡 Vantagens desta abordagem

✅ **Sem dependências externas** - Usa apenas `node:fs` e `node:path`
✅ **Swagger UI via CDN** - Carregado do CDN, não requer npm install
✅ **Integrado ao seu sistema de rotas** - Funciona perfeitamente com seu setup atual
✅ **Fácil manutenção** - Especificação em arquivo JSON separado
✅ **Totalmente testável** - Sem código mágico ou frameworks pesados

---

## 📖 Referências

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
