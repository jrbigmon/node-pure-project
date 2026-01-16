# 📚 Node Study - Documentação Técnica

> Projeto Node.js puro com arquitetura Clean Architecture, sem frameworks pesados.

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Como Usar](#como-usar)
4. [Swagger/Documentação](#swaggerdocumentação)
5. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
6. [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🎯 Visão Geral

Este é um projeto Node.js **sem frameworks** (sem Express, Fastify, etc.) que implementa:
- ✅ **Clean Architecture** - Separação clara de responsabilidades
- ✅ **Domain-Driven Design (DDD)** - Lógica de negócio isolada
- ✅ **HTTP Nativo** - Usa apenas `node:http`
- ✅ **Testes com Jest** - Cobertura de código
- ✅ **Documentação com Swagger** - OpenAPI 3.0

---

## 🏗️ Arquitetura

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│      Controllers (HTTP Layer)       │ ← Recebe requisições HTTP
├─────────────────────────────────────┤
│      Services (Application Layer)   │ ← Lógica de aplicação
├─────────────────────────────────────┤
│      Use Cases (Domain Layer)       │ ← Lógica de negócio pura
├─────────────────────────────────────┤
│      Entities (Domain Layer)        │ ← Modelos de domínio
├─────────────────────────────────────┤
│      Repository (Data Layer)        │ ← Abstração de dados
└─────────────────────────────────────┘
```

### Fluxo de uma Requisição

```
HTTP Request
    ↓
Controller (parse request)
    ↓
Service (aplica lógica de aplicação)
    ↓
Use Case (aplica regras de negócio)
    ↓
Repository (persiste/recupera dados)
    ↓
HTTP Response
```

---

## 🚀 Como Usar

### Iniciar o servidor:
```bash
yarn start
# ou com auto-reload
yarn start:dev
```

### Executar testes:
```bash
yarn test
```

### Acessar a API:
- **Base URL**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/docs
- **Especificação JSON**: http://localhost:3000/docs/swagger

---

## 📝 Swagger/Documentação

### O que foi configurado?

1. **Arquivo de Especificação OpenAPI** (`src/docs/swagger.json`)
   - Define toda a documentação da API em formato OpenAPI 3.0
   - Descreve endpoints, parâmetros, requisições e respostas

2. **Módulo Swagger** (`src/docs/swagger.js`)
   - Carrega o arquivo `swagger.json`
   - Gera HTML com a interface do Swagger UI
   - Fornece a especificação em JSON via endpoint

3. **Controlador de Documentação** (`src/infra/controllers/docs/docs.controller.js`)
   - Rota `(GET)/docs` → Retorna HTML do Swagger UI
   - Rota `(GET)/docs/swagger` → Retorna JSON da especificação OpenAPI

4. **Integração nos Controllers** (`src/infra/controllers/index.js`)
   - Registra as rotas de documentação no sistema de rotas

### Como adicionar novos endpoints na documentação

Edite `src/docs/swagger.json` e adicione na seção `paths`:

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

## �️ Guia de Desenvolvimento

### 1. Criando uma Nova Entity

Uma Entity é um modelo de domínio que encapsula as regras de negócio da entidade.

**Arquivo**: `src/domain/entity/product/product.entity.js`

```javascript
import { v4 as uuid } from "uuid";

export class ProductEntity {
  constructor({ id, name, price, description }) {
    this.id = id ?? uuid();
    this.name = name;
    this.price = price;
    this.description = description;
  }

  // Validações de negócio
  isValid() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Product name is required");
    }
    if (this.price <= 0) {
      throw new Error("Price must be greater than zero");
    }
    return true;
  }

  // Métodos de negócio
  applyDiscount(percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Invalid discount percentage");
    }
    this.price *= (1 - percentage / 100);
  }
}
```

### 2. Criando um Use Case

Um Use Case implementa um fluxo de negócio específico.

**Arquivo**: `src/domain/usercase/product/create-product.usecase.js`

```javascript
import { ProductEntity } from "../../entity/product/product.entity.js";

export class CreateProductUseCase {
  constructor({ repository }) {
    this.repository = repository;
  }

  async execute({ name, price, description }) {
    // Validar entrada
    if (!name || !price) {
      throw new Error("Name and price are required");
    }

    // Criar entidade
    const product = new ProductEntity({
      name,
      price,
      description,
    });

    // Validar regras de negócio
    product.isValid();

    // Persistir
    const savedProduct = await this.repository.save(product);

    return savedProduct;
  }
}
```

### 3. Criando um Repository

Um Repository abstrai o acesso aos dados.

**Arquivo**: `src/domain/repository/product/product.repository.js`

```javascript
export class ProductRepository {
  // Interface (abstrata)
  async save(product) {
    throw new Error("save() must be implemented");
  }

  async findById(id) {
    throw new Error("findById() must be implemented");
  }

  async findAll() {
    throw new Error("findAll() must be implemented");
  }

  async delete(id) {
    throw new Error("delete() must be implemented");
  }
}
```

**Implementação em Memória**: `src/infra/repository/product/product.memory.repository.js`

```javascript
import { ProductRepository } from "../../../domain/repository/product/product.repository.js";

export class ProductMemoryRepository extends ProductRepository {
  constructor() {
    super();
    this.products = [];
  }

  async save(product) {
    const exists = this.products.find((p) => p.id === product.id);
    if (exists) {
      const index = this.products.indexOf(exists);
      this.products[index] = product;
    } else {
      this.products.push(product);
    }
    return product;
  }

  async findById(id) {
    return this.products.find((p) => p.id === id);
  }

  async findAll() {
    return [...this.products];
  }

  async delete(id) {
    this.products = this.products.filter((p) => p.id !== id);
  }
}
```

### 4. Criando um Service

Um Service orquestra a aplicação (coordena Use Cases, validações, etc).

**Arquivo**: `src/application/services/products/create-product.service.js`

```javascript
import { CreateProductUseCase } from "../../../domain/usercase/product/create-product.usecase.js";

export class CreateProductService {
  constructor({ repository }) {
    this.useCase = new CreateProductUseCase({ repository });
  }

  async execute(input) {
    try {
      // Validação de entrada
      if (!input.name || input.name.trim().length === 0) {
        const error = new Error("Product name is required");
        error.statusCode = 400;
        throw error;
      }

      if (!input.price || isNaN(input.price)) {
        const error = new Error("Price must be a valid number");
        error.statusCode = 400;
        throw error;
      }

      // Executar o use case
      const product = await this.useCase.execute(input);

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
      };
    } catch (error) {
      error.statusCode = error.statusCode || 500;
      throw error;
    }
  }
}
```

### 5. Criando um Controller

Um Controller recebe requisições HTTP e retorna respostas.

**Arquivo**: `src/infra/controllers/products/create-product.controller.js`

```javascript
import { CreateProductService } from "../../../application/services/products/create-product.service.js";
import { ProductMemoryRepository } from "../../repository/product/product.memory.repository.js";

const repository = new ProductMemoryRepository();
const service = new CreateProductService({ repository });

export const CreateProductController = {
  "(POST)/products": async (req, res) => {
    try {
      const body = JSON.parse(req.body || "{}");

      const product = await service.execute({
        name: body.name,
        price: body.price,
        description: body.description,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: error.message }));
    }
  },
};
```

### 6. Registrando o Controller

Adicione o novo controller em `src/infra/controllers/index.js`:

```javascript
import { CreateProductController } from "./products/create-product.controller.js";

export const controllers = ({ req, res: _res }) => {
  const routes = {
    ...CreateProductController,
    // ... outros controllers
  };
  // ... resto do código
};
```

### 7. Documentando no Swagger

Adicione em `src/docs/swagger.json`:

```json
"/products": {
  "post": {
    "summary": "Create a new product",
    "tags": ["Products"],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "price": { "type": "number" },
              "description": { "type": "string" }
            },
            "required": ["name", "price"]
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "Product created successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "price": { "type": "number" },
                "description": { "type": "string" }
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

## 📂 Estrutura de Pastas

```
node-study/
├── src/
│   ├── main.js                          # Ponto de entrada da aplicação
│   ├── docs/                            # Documentação
│   │   ├── swagger.js                   # Gerador do Swagger UI
│   │   └── swagger.json                 # Especificação OpenAPI
│   │
│   ├── domain/                          # Camada de Domínio (Lógica de Negócio)
│   │   ├── entity/                      # Entidades
│   │   │   └── user/
│   │   │       └── user.entity.js
│   │   ├── exception/                   # Exceções customizadas
│   │   │   ├── base.exception.js
│   │   │   ├── entity.exception.js
│   │   │   ├── bad-request.exception.js
│   │   │   └── not-found.exception.js
│   │   ├── repository/                  # Interfaces de Repository
│   │   │   └── user/
│   │   │       └── user.repository.js
│   │   └── usercase/                    # Use Cases
│   │       └── user/
│   │           ├── create-user.usecase.js
│   │           ├── get-user.usecase.js
│   │           └── get-users.usecase.js
│   │
│   ├── application/                     # Camada de Aplicação
│   │   └── services/                    # Serviços
│   │       └── users/
│   │           ├── create-user.service.js
│   │           ├── get-user.service.js
│   │           └── list-users.service.js
│   │
│   ├── infra/                           # Camada de Infraestrutura
│   │   ├── controllers/                 # Controllers HTTP
│   │   │   ├── index.js                 # Roteador
│   │   │   ├── docs/
│   │   │   │   └── docs.controller.js
│   │   │   └── users/
│   │   │       ├── create-user.controller.js
│   │   │       ├── get-user.controller.js
│   │   │       ├── get-users.controller.js
│   │   │       └── index.js
│   │   ├── database/                    # Conexões de banco
│   │   │   └── db.memory.js
│   │   ├── exceptions/                  # Tratamento de erros HTTP
│   │   │   └── http/
│   │   │       └── handle-http.exception.js
│   │   ├── middlewares/                 # Middlewares HTTP
│   │   │   ├── get-body.middleware.js
│   │   │   └── index.js
│   │   └── repository/                  # Implementações de Repository
│   │       └── user/
│   │           └── user.memory.repository.js
│   │
│   └── helpers/                         # Utilitários
│       ├── extract-params.js
│       ├── json.parse.js
│       ├── password-hash.js
│       └── uuid.js
│
├── coverage/                            # Cobertura de testes
├── jest.config.mjs                      # Configuração do Jest
├── package.json
└── README.md                            # Este arquivo
```

---

## ✅ Checklist para Criar um Novo Módulo

Ao criar uma nova feature (ex: Produtos), siga este checklist:

- [ ] **1. Criar Entity** (`src/domain/entity/product/product.entity.js`)
  - [ ] Construtor
  - [ ] Validações de negócio (método `isValid()`)
  - [ ] Métodos de domínio

- [ ] **2. Criar Repository Interface** (`src/domain/repository/product/product.repository.js`)
  - [ ] Assinatura dos métodos abstratos
  - [ ] Documentar cada método

- [ ] **3. Implementar Repository** (`src/infra/repository/product/product.memory.repository.js`)
  - [ ] Estender a interface
  - [ ] Implementar todos os métodos

- [ ] **4. Criar Use Cases** (`src/domain/usercase/product/`)
  - [ ] `create-product.usecase.js`
  - [ ] `get-product.usecase.js`
  - [ ] `list-products.usecase.js`
  - [ ] `update-product.usecase.js` (se necessário)
  - [ ] `delete-product.usecase.js` (se necessário)

- [ ] **5. Criar Services** (`src/application/services/products/`)
  - [ ] Um service por use case
  - [ ] Validações de entrada
  - [ ] Tratamento de erros

- [ ] **6. Criar Controllers** (`src/infra/controllers/products/`)
  - [ ] Um controller por rota
  - [ ] Parsing de request body
  - [ ] Resposta correta com status codes

- [ ] **7. Registrar Controllers** (`src/infra/controllers/index.js`)
  - [ ] Importar o novo controller
  - [ ] Adicionar ao objeto `routes`

- [ ] **8. Criar Testes** (spec files)
  - [ ] Testes da entity
  - [ ] Testes do use case
  - [ ] Testes do service
  - [ ] Testes do controller

- [ ] **9. Documentar no Swagger** (`src/docs/swagger.json`)
  - [ ] Adicionar endpoints na seção `paths`
  - [ ] Descrever requisições e respostas
  - [ ] Adicionar exemplos

---

## 🧪 Testes

### Executar todos os testes:
```bash
yarn test
```

### Executar com cobertura:
```bash
yarn test --coverage
```

### Estrutura de testes

Use o padrão `.spec.js` para testes:

```javascript
// src/domain/entity/product/product.entity.spec.js
import { ProductEntity } from "./product.entity.js";

describe("ProductEntity", () => {
  it("should create a valid product", () => {
    const product = new ProductEntity({
      name: "Product A",
      price: 100,
    });

    expect(product.name).toBe("Product A");
    expect(product.price).toBe(100);
  });

  it("should throw error if name is empty", () => {
    const product = new ProductEntity({
      name: "",
      price: 100,
    });

    expect(() => product.isValid()).toThrow();
  });
});
```

---

## 🔐 Tratamento de Erros

O projeto inclui exceções customizadas:

```javascript
import { BadRequestException } from "../../../domain/exception/bad-request.exception.js";
import { NotFoundException } from "../../../domain/exception/not-found.exception.js";

// Use assim:
if (!product) {
  throw new NotFoundException("Product not found");
}

if (!name) {
  throw new BadRequestException("Name is required");
}
```

---

## 💡 Boas Práticas

### 1. Separação de Responsabilidades
- **Domain**: Regras de negócio puras (sem dependências externas)
- **Application**: Orquestração de use cases
- **Infrastructure**: Detalhes técnicos (HTTP, BD, etc)

### 2. Validações
- Validações de entrada → Service
- Validações de negócio → Entity/Use Case
- Validações HTTP → Controller

### 3. Tratamento de Erros
- Adicione `statusCode` ao erro para que o handler HTTP trate
- Use exceções customizadas da camada de domínio

### 4. Naming Conventions
- Classes em **PascalCase**: `UserEntity`, `CreateUserService`
- Arquivos em **kebab-case**: `create-user.service.js`
- Funções em **camelCase**: `getUserById()`, `validateEmail()`

### 5. Injeção de Dependência
```javascript
// ❌ Ruim
export class UserService {
  constructor() {
    this.repository = new UserMemoryRepository();
  }
}

// ✅ Bom
export class UserService {
  constructor({ repository }) {
    this.repository = repository;
  }
}
```

---

## 📊 Exemplo Completo: Feature de Usuários

A feature de usuários já está implementada como exemplo:

1. **Entity**: `src/domain/entity/user/user.entity.js`
2. **Repository**: `src/domain/repository/user/user.repository.js`
3. **Memory Repository**: `src/infra/repository/user/user.memory.repository.js`
4. **Use Cases**: `src/domain/usercase/user/`
5. **Services**: `src/application/services/users/`
6. **Controllers**: `src/infra/controllers/users/`
7. **Testes**: `*.spec.js` files

Estude essa implementação como base para novas features!

---

## 🚀 Próximos Passos

1. Implemente suas entidades de negócio seguindo o padrão de `User`
2. Escreva testes unitários conforme desenvolve
3. Documente suas rotas no Swagger
4. Mantenha a arquitetura limpa e independente de frameworks

---

## 📖 Referências

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3)
- [Jest Testing Framework](https://jestjs.io/)
- [Node.js HTTP Module](https://nodejs.org/api/http.html)
