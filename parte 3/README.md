# Relatório de Implementação Full-Stack: API LoopBack 4 e Backoffice React

## 1. Introdução

Nesta terceira fase do projeto, o objetivo principal foi a migração e evolução da arquitetura do sistema de gestão de festivais para uma abordagem Full-Stack robusta e escalável. Abandonando a implementação manual da Parte 2, adotou-se a framework LoopBack 4 para o desenvolvimento da API REST seguindo uma estratégia Code-First, e integrou-se uma interface de administração (Backoffice) desenvolvida com React-Admin.

Todo o ecossistema foi contentorizado utilizando Docker, orquestrando três serviços distintos: a base de dados MySQL, a API Backend e a Aplicação Frontend.

## 2. Arquitetura da Solução

A solução adota uma arquitetura de microsserviços simplificada, onde cada componente reside no seu próprio contentor, comunicando através de uma rede interna gerida pelo Docker Compose.

### 2.1. Componentes do Sistema

*   **Base de Dados (MySQL 8.0):** Responsável pela persistência dos dados.
*   **API REST (LoopBack 4):** Camada de serviços que expõe os recursos e regras de negócio.
*   **Frontend (React-Admin):** Cliente web para gestão administrativa (CRUD) dos recursos.

### 2.2. Orquestração (Docker Compose)

A infraestrutura é definida no ficheiro docker-compose.yaml. Destaca-se a configuração de redes e variáveis de ambiente para garantir que a API consegue localizar a base de dados independentemente do ambiente de execução.

```yaml
services:
  db_parte3:
    image: mysql:8.0
    container_name: festival_db_parte3
    environment:
      MYSQL_DATABASE: festival_loopback
    ports:
      - "3307:3306" # Porta externa 3307 para evitar conflitos locais

  api:
    build: ./festival-api
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db_parte3 # Nome do serviço da DB na rede Docker
      DB_PORT: 3306
    depends_on:
      - db_parte3

  admin:
    build: ./festival-admin
    ports:
      - "5173:5173"
    depends_on:
      - api
```

## 3. Desenvolvimento Backend (LoopBack 4)

A API foi desenvolvida utilizando a metodologia Code-First, onde as classes TypeScript definem a estrutura da base de dados e os endpoints da API.

### 3.1. Configuração da Datasource

A conexão à base de dados foi configurada para ser resiliente e adaptável. O ficheiro `db.datasource.ts` utiliza variáveis de ambiente (`process.env.DB_HOST`) para determinar dinamicamente se deve conectar-se ao host do Docker ou a localhost, facilitando o desenvolvimento híbrido.

```typescript
const config = {
  name: 'db',
  connector: 'mysql',
  url: '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'festival_loopback',
}
```

### 3.2. Modelação de Dados (Models)

Os modelos representam as entidades do negócio. Utilizando decoradores como `@model` e `@property`, definiu-se o esquema das tabelas.

**Modelo Artista:** A classe `Artista` define propriedades como `nome` (obrigatório), `genero` e `cachet`. O LoopBack encarrega-se de mapear estas propriedades para colunas na base de dados MySQL.

```typescript
@model()
export class Artista extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true, 
  })
  nome: string;

  @property({
    type: 'string',
  })
  genero?: string;
  // ...
}
```

**Modelo de Relação M:N (Alinhamento):** Para suportar a relação complexa entre Concertos e Artistas, criou-se explicitamente o modelo `Alinhamento`, que atua como tabela intermédia contendo as chaves estrangeiras.

```typescript
@model()
export class Alinhamento extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  concertoId: number;

  @property({
    type: 'number',
    required: true,
  })
  artistaId: number;
}
```

### 3.3. Controladores e Lógica REST

Os controladores expõem as operações CRUD via HTTP. O `ArtistaController` demonstra a implementação standard de métodos como `create`, `find` (com filtros), `update` e `delete`.

```typescript
@get('/artistas')
@response(200, {
  description: 'Array of Artista model instances',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(Artista, {includeRelations: true}),
      },
    },
  },
})
async find(
  @param.filter(Artista) filter?: Filter<Artista>,
): Promise<Artista[]> {
  return this.artistaRepository.find(filter)
}
```

Adicionalmente, implementou-se o controlador `ConcertoArtistaController` para gerir a relação M:N, permitindo consultar quais os artistas associados a um concerto específico.

```typescript
@get('/concertos/{id}/artistas', {
  responses: {
    '200': {
      description: 'Array of Concerto has many Artista through Alinhamento',
      content: {
        'application/json': {
          schema: {type: 'array', items: getModelSchemaRef(Artista)},
        },
      },
    },
  },
})
async find(
  @param.path.number('id') id: number,
  @param.query.object('filter') filter?: Filter<Artista>,
): Promise<Artista[]> {
  return this.concertoRepository.artistas(id).find(filter)
}
```
## 4. Desenvolvimento Frontend (React-Admin)

A aplicação cliente foi construída sobre a biblioteca react-admin, que oferece componentes pré-construídos para interfaces de administração. O maior desafio técnico nesta camada foi a integração com a API do LoopBack 4, que não segue por defeito o padrão esperado pelo React-Admin.

### 4.1. Custom Data Provider

Para resolver a incompatibilidade de formatos, implementou-se um DataProvider personalizado no ficheiro `App.tsx`. Este adaptador traduz as chamadas do React-Admin (`getList`, `getOne`, `create`, etc.) para os endpoints específicos da nossa API.

Exemplo da adaptação do método `getList`:

```typescript
const myDataProvider: DataProvider = {
    getList: (resource, params) => {
        const url = `${apiUrl}/${resource}`
        return httpClient(url).then(({ json }) => ({
            data: json,
            total: json.length, // LoopBack retorna array direto, calculamos o total aqui
        }))
    },
    // ... implementações de update, create, delete ...
}
```
### 4.2. Definição de Recursos

Com o provider configurado, a aplicação foi estruturada mapeando os recursos da API para componentes visuais de listagem (`ListGuesser`), permitindo a prototipagem rápida da interface.

```typescript
const App = () => (
  <Admin dataProvider={myDataProvider}>
    <Resource name="artistas" list={ListGuesser} />
    <Resource name="palcos" list={ListGuesser} />
    <Resource name="concertos" list={ListGuesser} />
    <Resource name="bilhetes" list={ListGuesser} />
  </Admin>
)
```
## 5. Conclusão

A implementação da Parte 3 representa um salto qualitativo na arquitetura do projeto. A utilização do LoopBack 4 permitiu gerar automaticamente grande parte do código repetitivo (scaffolding) de acesso a dados, garantindo tipagem forte e segurança através do TypeScript. A integração com o React-Admin providenciou uma interface funcional e profissional com esforço reduzido de coding no frontend. Finalmente, a orquestração via Docker assegurou que todos os componentes funcionam harmoniosamente, eliminando problemas de compatibilidade entre ambientes de desenvolvimento.