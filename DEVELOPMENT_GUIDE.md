# 🚀 Guia Rápido de Desenvolvimento

> Instruções passo-a-passo para adicionar novos endpoints à API.

## 📌 Exemplo Prático: Feature de Produtos

Vamos implementar uma feature completa de Produtos.

### Passo 1: Criar a Entity

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

  isValid() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Product name is required");
    }
    if (!this.price || this.price <= 0) {
      throw new Error("Price must be greater than zero");
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      description: this.description,
    };
  }
}
```

### Passo 2: Criar a Interface do Repository

**Arquivo**: `src/domain/repository/product/product.repository.js`

```javascript
export class ProductRepository {
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

### Passo 3: Implementar o Repository em Memória

**Arquivo**: `src/infra/repository/product/product.memory.repository.js`

```javascript
import { ProductRepository } from "../../../domain/repository/product/product.repository.js";

export class ProductMemoryRepository extends ProductRepository {
  constructor() {
    super();
    this.products = [];
  }

  async save(product) {
    const exists = this.products.findIndex((p) => p.id === product.id);
    if (exists !== -1) {
      this.products[exists] = product;
    } else {
      this.products.push(product);
    }
    return product;
  }

  async findById(id) {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async findAll() {
    return [...this.products];
  }

  async delete(id) {
    const exists = this.products.findIndex((p) => p.id === id);
    if (exists !== -1) {
      this.products.splice(exists, 1);
      return true;
    }
    return false;
  }
}
```

### Passo 4: Criar os Use Cases

**Arquivo**: `src/domain/usercase/product/create-product.usecase.js`

```javascript
import { ProductEntity } from "../../entity/product/product.entity.js";

export class CreateProductUseCase {
  constructor({ repository }) {
    this.repository = repository;
  }

  async execute({ name, price, description }) {
    if (!name || !price) {
      throw new Error("Name and price are required");
    }

    const product = new ProductEntity({ name, price, description });
    product.isValid();

    return await this.repository.save(product);
  }
}
```

**Arquivo**: `src/domain/usercase/product/get-product.usecase.js`

```javascript
export class GetProductUseCase {
  constructor({ repository }) {
    this.repository = repository;
  }

  async execute({ id }) {
    if (!id) {
      throw new Error("ID is required");
    }

    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }
}
```

**Arquivo**: `src/domain/usercase/product/list-products.usecase.js`

```javascript
export class ListProductsUseCase {
  constructor({ repository }) {
    this.repository = repository;
  }

  async execute() {
    return await this.repository.findAll();
  }
}
```

### Passo 5: Criar os Services

**Arquivo**: `src/application/services/products/create-product.service.js`

```javascript
import { CreateProductUseCase } from "../../../domain/usercase/product/create-product.usecase.js";

export class CreateProductService {
  constructor({ repository }) {
    this.useCase = new CreateProductUseCase({ repository });
  }

  async execute(input) {
    try {
      if (!input.name || input.name.trim().length === 0) {
        const error = new Error("Product name is required");
        error.statusCode = 400;
        throw error;
      }

      if (!input.price || isNaN(input.price) || input.price <= 0) {
        const error = new Error("Price must be a positive number");
        error.statusCode = 400;
        throw error;
      }

      const product = await this.useCase.execute(input);
      return product.toJSON();
    } catch (error) {
      error.statusCode = error.statusCode || 500;
      throw error;
    }
  }
}
```

**Arquivo**: `src/application/services/products/get-product.service.js`

```javascript
import { GetProductUseCase } from "../../../domain/usercase/product/get-product.usecase.js";

export class GetProductService {
  constructor({ repository }) {
    this.useCase = new GetProductUseCase({ repository });
  }

  async execute(input) {
    try {
      const product = await this.useCase.execute(input);
      return product.toJSON();
    } catch (error) {
      const statusCode = error.message === "Product not found" ? 404 : 400;
      error.statusCode = statusCode;
      throw error;
    }
  }
}
```

**Arquivo**: `src/application/services/products/list-products.service.js`

```javascript
import { ListProductsUseCase } from "../../../domain/usercase/product/list-products.usecase.js";

export class ListProductsService {
  constructor({ repository }) {
    this.useCase = new ListProductsUseCase({ repository });
  }

  async execute() {
    try {
      const products = await this.useCase.execute();
      return products.map((p) => p.toJSON());
    } catch (error) {
      error.statusCode = error.statusCode || 500;
      throw error;
    }
  }
}
```

**Arquivo**: `src/application/services/products/index.js`

```javascript
import { ProductMemoryRepository } from "../../infra/repository/product/product.memory.repository.js";
import { CreateProductService } from "./create-product.service.js";
import { GetProductService } from "./get-product.service.js";
import { ListProductsService } from "./list-products.service.js";

const repository = new ProductMemoryRepository();

export const productServices = {
  createProduct: new CreateProductService({ repository }),
  getProduct: new GetProductService({ repository }),
  listProducts: new ListProductsService({ repository }),
};
```

### Passo 6: Criar os Controllers

**Arquivo**: `src/infra/controllers/products/create-product.controller.js`

```javascript
import { productServices } from "../../../application/services/products/index.js";

export const CreateProductController = {
  "(POST)/products": async (req, res) => {
    try {
      const body = JSON.parse(req.body || "{}");

      const product = await productServices.createProduct.execute({
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

**Arquivo**: `src/infra/controllers/products/get-product.controller.js`

```javascript
import { productServices } from "../../../application/services/products/index.js";

export const GetProductController = {
  "(GET)/products/:id": async (req, res) => {
    try {
      const product = await productServices.getProduct.execute({
        id: req.params.id,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: error.message }));
    }
  },
};
```

**Arquivo**: `src/infra/controllers/products/list-products.controller.js`

```javascript
import { productServices } from "../../../application/services/products/index.js";

export const ListProductsController = {
  "(GET)/products": async (_req, res) => {
    try {
      const products = await productServices.listProducts.execute();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(products));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: error.message }));
    }
  },
};
```

**Arquivo**: `src/infra/controllers/products/index.js`

```javascript
import { CreateProductController } from "./create-product.controller.js";
import { GetProductController } from "./get-product.controller.js";
import { ListProductsController } from "./list-products.controller.js";

export const ProductController = {
  ...CreateProductController,
  ...GetProductController,
  ...ListProductsController,
};
```

### Passo 7: Registrar no Router Principal

**Edite**: `src/infra/controllers/index.js`

```javascript
import { extractParams } from "../../helpers/extract-params.js";
import { UserController } from "./users/index.js";
import { DocsController } from "./docs/docs.controller.js";
import { ProductController } from "./products/index.js";  // ← Adicione isto

export const controllers = ({ req, res: _res }) => {
  const routes = {
    ...DocsController,
    ...UserController,
    ...ProductController,  // ← Adicione isto
    DEFAULT: (_req, res) => {
      return new Promise((resolve) => {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
        resolve();
      });
    },
  };
  // ... resto do código
};
```

### Passo 8: Documentar no Swagger

**Edite**: `src/docs/swagger.json` - Adicione em `paths`:

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
              "name": { "type": "string", "example": "Laptop" },
              "price": { "type": "number", "example": 999.99 },
              "description": { "type": "string", "example": "A powerful laptop" }
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
      },
      "400": { "description": "Invalid input" }
    }
  },
  "get": {
    "summary": "List all products",
    "tags": ["Products"],
    "responses": {
      "200": {
        "description": "List of products",
        "content": {
          "application/json": {
            "schema": {
              "type": "array",
              "items": {
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
},
"/products/{id}": {
  "get": {
    "summary": "Get a product by ID",
    "tags": ["Products"],
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": { "type": "string" },
        "description": "Product ID"
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
                "name": { "type": "string" },
                "price": { "type": "number" },
                "description": { "type": "string" }
              }
            }
          }
        }
      },
      "404": { "description": "Product not found" }
    }
  }
}
```

Adicione também em `tags`:

```json
{
  "name": "Products",
  "description": "Product management endpoints"
}
```

### Passo 9: Testar

Inicie o servidor:

```bash
yarn start:dev
```

Teste os endpoints:

```bash
# Criar produto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99}'

# Listar produtos
curl http://localhost:3000/products

# Obter produto específico
curl http://localhost:3000/products/{id}
```

Acesse http://localhost:3000/docs e teste via Swagger UI!

---

## 🧪 Escrevendo Testes

**Arquivo**: `src/domain/entity/product/product.entity.spec.js`

```javascript
import { ProductEntity } from "./product.entity.js";

describe("ProductEntity", () => {
  it("should create a valid product", () => {
    const product = new ProductEntity({
      name: "Laptop",
      price: 999.99,
    });

    expect(product.name).toBe("Laptop");
    expect(product.price).toBe(999.99);
    expect(product.id).toBeDefined();
  });

  it("should throw error when name is empty", () => {
    const product = new ProductEntity({
      name: "",
      price: 100,
    });

    expect(() => product.isValid()).toThrow("Product name is required");
  });

  it("should throw error when price is invalid", () => {
    const product = new ProductEntity({
      name: "Test",
      price: -50,
    });

    expect(() => product.isValid()).toThrow("Price must be greater than zero");
  });
});
```

Execute testes:

```bash
yarn test
```

---

## 💡 Dicas Finais

1. **Sempre valide na Service** - Validações de entrada
2. **Sempre valide na Entity** - Regras de negócio
3. **Sempre trate erros** - Com `statusCode` apropriado
4. **Sempre documente** - No Swagger, assim que criar o controller
5. **Sempre teste** - Especialmente a lógica de domínio

Boa codificação! 🚀
