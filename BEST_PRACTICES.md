# 🏆 Boas Práticas & Padrões

> Convenções e padrões para manter o código limpo e consistente.

## 📏 Padrões de Código

### 1. Nomeação de Arquivos

```
✅ CORRETO                          ❌ ERRADO
user.entity.js                      UserEntity.js
create-user.usecase.js              createUserUseCase.js
user.memory.repository.js           UserMemoryRepository.js
create-user.service.js              CreateUserService.js
create-user.controller.js           createUserController.js
user.entity.spec.js                 user.test.js
```

**Regra**: Use **kebab-case** em arquivos, **PascalCase** em classes.

### 2. Importações

```javascript
// ✅ CORRETO - Imports em ordem
import { v4 as uuid } from "uuid";
import { UserEntity } from "../../entity/user/user.entity.js";
import { UserRepository } from "../../repository/user/user.repository.js";

// ❌ ERRADO - Imports desorganizados
import { UserRepository } from "../../repository/user/user.repository.js";
import { UserEntity } from "../../entity/user/user.entity.js";
import { v4 as uuid } from "uuid";
```

**Ordem de imports**:
1. Módulos do Node.js (`node:*`)
2. Pacotes NPM
3. Imports locais (camadas externas → internas)

### 3. Estrutura de Classes

```javascript
export class UserEntity {
  // 1. Construtor
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // 2. Validações
  isValid() {
    if (!this.name) throw new Error("Name is required");
    return true;
  }

  // 3. Métodos de domínio
  changeEmail(newEmail) {
    // Lógica de negócio
    this.email = newEmail;
  }

  // 4. Serialização
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }
}
```

---

## 🎯 Responsabilidades por Camada

### Domain Layer (Puro)
```javascript
// ✅ Permitido
- Classes e entities
- Lógica de negócio pura
- Validações de regras
- Interfaces abstratas

// ❌ Proibido
- HTTP requests
- Banco de dados
- Frameworks externos
- Código técnico
```

### Application Layer (Services)
```javascript
// ✅ Permitido
- Orquestração de use cases
- Validações de entrada
- Transformação de dados
- Tratamento de erros aplicação

// ❌ Proibido
- Acesso direto a HTTP
- Queries SQL diretas
- Dependências circulares
```

### Infrastructure Layer (Técnico)
```javascript
// ✅ Permitido
- Controllers HTTP
- Implementações de Repository
- Detalhes técnicos
- Middleware HTTP

// ❌ Proibido
- Lógica de negócio
- Validações complexas
- Dependências do domínio
```

---

## 🔄 Padrões de Desenvolvimento

### Padrão: Service + Use Case + Repository

```javascript
// ✅ CORRETO - Separação de responsabilidades
// Controller
export const CreateUserController = {
  "(POST)/users": async (req, res) => {
    const service = new CreateUserService({ repository });
    const user = await service.execute(body);
    res.end(JSON.stringify(user));
  },
};

// Service - Validação de entrada
export class CreateUserService {
  constructor({ repository }) {
    this.useCase = new CreateUserUseCase({ repository });
  }

  async execute(input) {
    if (!input.email) throw new Error("Email required");
    return this.useCase.execute(input);
  }
}

// Use Case - Lógica de negócio
export class CreateUserUseCase {
  constructor({ repository }) {
    this.repository = repository;
  }

  async execute({ email, name }) {
    const user = new UserEntity({ email, name });
    user.isValid();
    return this.repository.save(user);
  }
}
```

### Padrão: Exception Handling

```javascript
// ✅ CORRETO
export class UserService {
  async execute(input) {
    try {
      // Validar
      if (!input.email) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
      }

      // Processar
      const user = await this.useCase.execute(input);
      return user;
    } catch (error) {
      error.statusCode = error.statusCode || 500;
      throw error;
    }
  }
}

// Controller
export const CreateUserController = {
  "(POST)/users": async (req, res) => {
    try {
      const user = await service.execute(body);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: error.message }));
    }
  },
};
```

### Padrão: Dependency Injection

```javascript
// ✅ CORRETO - Injeção de dependência
export class UserService {
  constructor({ repository, logger, emailService }) {
    this.repository = repository;
    this.logger = logger;
    this.emailService = emailService;
  }

  async execute(input) {
    const user = await this.repository.save(input);
    await this.emailService.sendWelcome(user.email);
    this.logger.info(`User created: ${user.id}`);
    return user;
  }
}

// No controller
const service = new UserService({
  repository: new UserMemoryRepository(),
  logger: new ConsoleLogger(),
  emailService: new SmtpEmailService(),
});
```

---

## ✅ Checklist de Qualidade

Antes de fazer commit, verifique:

### Code Quality
- [ ] Nomes de variáveis são descritivos
- [ ] Funções fazem uma única coisa
- [ ] Sem código duplicado (DRY)
- [ ] Sem lógica complexa em controllers

### Testing
- [ ] Entities têm testes
- [ ] Use Cases têm testes
- [ ] Services têm testes
- [ ] Cobertura acima de 80%

### Documentation
- [ ] Métodos complexos têm comentários
- [ ] Swagger está atualizado
- [ ] README está atualizado
- [ ] Exemplo de uso no DEVELOPMENT_GUIDE

### Architecture
- [ ] Sem dependências circulares
- [ ] Domain layer é independente
- [ ] Respeita camadas (Domain → App → Infra)
- [ ] Injeção de dependência está implementada

### Error Handling
- [ ] Todos os errors têm statusCode
- [ ] Mensagens são claras
- [ ] Sem stack traces no cliente
- [ ] Logging de erros está correto

---

## 🚨 Anti-Padrões

### ❌ Anti-Padrão: Entity com lógica técnica

```javascript
// ❌ RUIM
export class UserEntity {
  async save() {
    // Acesso HTTP?? NO!
    const response = await fetch('/api/users', {...});
    return response.json();
  }
}

// ✅ BOM
export class UserEntity {
  isValid() {
    // Apenas validação de negócio
    if (!this.email) throw new Error("Email required");
    return true;
  }
}
```

### ❌ Anti-Padrão: Validação repetida

```javascript
// ❌ RUIM
// Validar no controller, service, use case...
export const CreateUserController = {
  "(POST)/users": async (req, res) => {
    if (!body.email) throw new Error("Email required");
    const user = await service.execute(body); // valida novamente!
  },
};

// ✅ BOM
// Validar no service (entrada) e entity (negócio)
export class CreateUserService {
  execute(input) {
    if (!input.email) throw new Error("Email required");
    return this.useCase.execute(input);
  }
}
```

### ❌ Anti-Padrão: Repository retornando entidades do BD

```javascript
// ❌ RUIM
export class UserRepository {
  async findById(id) {
    const row = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return row; // Retorna dados brutos do BD
  }
}

// ✅ BOM
export class UserRepository {
  async findById(id) {
    const row = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return new UserEntity(row); // Retorna entidade
  }
}
```

### ❌ Anti-Padrão: Controllers com lógica de negócio

```javascript
// ❌ RUIM
export const CreateUserController = {
  "(POST)/users": async (req, res) => {
    // Lógica de negócio aqui? NO!
    const hashedPassword = await bcrypt.hash(body.password);
    const user = new UserEntity({...body, password: hashedPassword});
    // ...
  },
};

// ✅ BOM
export class CreateUserService {
  execute(input) {
    // Lógica de negócio aqui
    const hashedPassword = await bcrypt.hash(input.password);
    return this.useCase.execute({...input, password: hashedPassword});
  }
}
```

---

## 📊 Complexidade Ciclomática

Mantenha funções simples:

```javascript
// ✅ Bom - Complexidade baixa
export function validateEmail(email) {
  if (!email) return false;
  return email.includes("@");
}

// ❌ Ruim - Complexidade alta
export function validateEmail(email) {
  if (!email) return false;
  if (email.length < 5) return false;
  if (!email.includes("@")) return false;
  const [local, domain] = email.split("@");
  if (!local) return false;
  if (!domain) return false;
  if (!domain.includes(".")) return false;
  // ... mais 10 validações
  return true;
}

// ✅ Melhor - Dividir em funções
export function validateEmail(email) {
  return isPresent(email) && hasValidFormat(email);
}

function isPresent(email) {
  return !!email && email.length >= 5;
}

function hasValidFormat(email) {
  const [local, domain] = email.split("@");
  return local && domain && domain.includes(".");
}
```

---

## 🔐 Segurança

### Validações de Entrada

```javascript
// ✅ CORRETO
export class CreateUserService {
  execute(input) {
    // Sanitizar
    const email = input.email?.trim().toLowerCase();
    
    // Validar tamanho
    if (email.length > 255) throw new Error("Email too long");
    
    // Validar formato
    if (!this.isValidEmail(email)) throw new Error("Invalid email");
    
    // Passar para use case
    return this.useCase.execute({ ...input, email });
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

### Nunca exponha dados sensíveis

```javascript
// ❌ RUIM - Exponha o hash da senha!
export const GetUserController = {
  "(GET)/users/:id": async (req, res) => {
    const user = await service.execute(req.params.id);
    res.end(JSON.stringify(user)); // Inclui password_hash!
  },
};

// ✅ BOM - Apenas dados públicos
export class GetUserService {
  execute(input) {
    const user = await this.useCase.execute(input);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      // Sem password, password_hash, etc.
    };
  }
}
```

---

## 📚 Referências

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Code Smells](https://refactoring.guru/refactoring/smells)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
