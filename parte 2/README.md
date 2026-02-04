# Relatório de Implementação - Parte 2: API RESTful para Gestão de Festival

## 1. Introdução

O presente relatório descreve o desenvolvimento da segunda fase do projeto de Desenvolvimento Web, que consistiu na implementação de uma API RESTful para a gestão de um Festival de Música. O objetivo principal foi criar uma camada de backend robusta utilizando Node.js e Express, suportada por uma base de dados relacional MySQL.

A arquitetura do sistema foi desenhada para suportar operações CRUD (Create, Read, Update, Delete), filtragem de dados e gestão de relações complexas entre entidades (1:N e M:N), seguindo uma abordagem Design-First através da especificação OpenAPI 3.0.

## 2. Tecnologias e Arquitetura

Para a implementação desta solução, foram selecionadas as seguintes tecnologias, justificadas pela sua eficiência e escalabilidade:

*   **Node.js & Express:** Para a construção do servidor e gestão de rotas HTTP.
*   **MySQL:** Sistema de Gestão de Base de Dados (SGBD) para persistência de dados.
*   **Docker & Docker Compose:** Para containerização da aplicação e da base de dados, garantindo um ambiente de desenvolvimento isolado e replicável.
*   **Swagger UI:** Para documentação interativa da API.

A estrutura do projeto foi organizada da seguinte forma:

*   `src/`: Contém todo o código fonte (`index.js`, `seed.js`, `setup_db.js`).
*   `database/`: Scripts SQL de inicialização.
*   `docker-compose.yaml`: Orquestração dos contentores.

## 3. Modelação da Base de Dados

A base de dados `festival_manager` foi estruturada para refletir as necessidades do negócio, contendo as seguintes tabelas principais:

*   **Palcos:** Locais onde ocorrem os concertos.
*   **Artistas:** Músicos ou bandas que atuam no festival.
*   **Concertos:** Eventos com data e hora, associados a um palco (Relação 1:N).
*   **Bilhetes:** Ingressos para o evento.
*   **Alinhamento:** Tabela de associação entre Concertos e Artistas (Relação M:N).

O esquema SQL foi definido para garantir a integridade referencial, utilizando chaves estrangeiras (`FOREIGN KEY`) com ações de `ON DELETE CASCADE` ou `SET NULL` conforme necessário.

**Excerto do Script de Criação (`src/setup_db.js`):**

```javascript
const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS palcos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        capacidade INT NOT NULL,
        localizacao VARCHAR(100),
        responsavel VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS concertos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_hora DATETIME NOT NULL,
        duracao_minutos INT DEFAULT 60,
        palco_id INT,
        FOREIGN KEY (palco_id) REFERENCES palcos(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS alinhamento (
        concerto_id INT,
        artista_id INT,
        ordem_atuacao INT,
        PRIMARY KEY (concerto_id, artista_id),
        FOREIGN KEY (concerto_id) REFERENCES concertos(id) ON DELETE CASCADE,
        FOREIGN KEY (artista_id) REFERENCES artistas(id) ON DELETE CASCADE
    );
`;
```
## 4. Implementação da API REST

A API foi desenvolvida no ficheiro `src/index.js`, onde se centralizou a lógica de conexão à base de dados e a definição das rotas.

### 4.1. Gestão de Conexão (Middleware)

Para otimizar a gestão de ligações ao MySQL, foi implementado um middleware que cria uma ligação no início de cada pedido e garante o seu encerramento no final. Isto previne fugas de memória e conexões "penduradas".

```javascript
// middleware para injetar a conexão de DB em todos os pedidos
app.use(async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        req.db = connection;
        res.on('finish', () => connection.end()); 
        next();
    } catch (error) {
        console.error('Erro de conexão à DB:', error);
        res.status(500).json({ error: 'Erro de conexão à base de dados' });
    }
});
```
### 4.2. CRUD de Recursos e Filtragem

Implementaram-se operações completas de CRUD. Um destaque importante é a funcionalidade de filtragem via parâmetros HTTP (query params). Por exemplo, na listagem de artistas, é possível filtrar por género musical.

**Rota GET /api/artistas com Filtro:**

```javascript
app.get('/api/artistas', async (req, res) => {
    try {
        let query = 'SELECT * FROM artistas';
        const params = [];
        
        if (req.query.genero) {
            query += ' WHERE genero = ?';
            params.push(req.query.genero);
        }
        
        const [rows] = await req.db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

### 4.3. Implementação de Relações Complexas (M:N)

Um dos requisitos mais exigentes foi a implementação da relação "Muitos para Muitos" entre Concertos e Artistas. Um concerto pode ter vários artistas, e um artista pode atuar em vários concertos.

Para resolver isto, criou-se um endpoint específico que insere dados na tabela intermédia `alinhamento` e outro que recupera os dados utilizando `INNER JOIN`.

**Adicionar Artista ao Alinhamento (POST):**

```javascript
app.post('/api/concertos/:id/artistas', async (req, res) => {
    const concertoId = req.params.id;
    const { artista_id, ordem_atuacao } = req.body;
    try {
        await req.db.execute(
            'INSERT INTO alinhamento (concerto_id, artista_id, ordem_atuacao) VALUES (?, ?, ?)',
            [concertoId, artista_id, ordem_atuacao]
        );
        res.status(201).json({ message: 'Artista adicionado ao concerto com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```
**Listar Artistas de um Concerto (GET com JOIN):**

```javascript
app.get('/api/concertos/:id/artistas', async (req, res) => {
    const concertoId = req.params.id;
    try {
        const query = `
            SELECT artistas.*, alinhamento.ordem_atuacao 
            FROM artistas 
            INNER JOIN alinhamento ON artistas.id = alinhamento.artista_id 
            WHERE alinhamento.concerto_id = ?
            ORDER BY alinhamento.ordem_atuacao ASC
        `;
        const [rows] = await req.db.execute(query, [concertoId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```
## 5. Povoamento da Base de Dados (Seeding)

Para facilitar os testes e a apresentação do trabalho, desenvolvi um script de seeding (`src/seed.js`) que popula a base de dados com dados iniciais robustos, cumprindo o requisito de volume de dados (30 registos).

O script limpa as tabelas existentes e insere dados programaticamente, incluindo a geração de relações aleatórias entre concertos e artistas.

```javascript
// Geração de 30 artistas
for (let i = 0; i < 30; i++) {
    const nome = nomes[i] || `Artista Genérico ${i}`;
    const genero = i % 2 === 0 ? 'Rock' : 'Pop/Alternative';
    const cachet = Math.floor(Math.random() * 50000) + 10000;
    await connection.execute(
        'INSERT INTO artistas (nome, genero, pais_origem, cachet) VALUES (?, ?, ?, ?)', 
        [nome, genero, 'Internacional', cachet]
    );
}
```

## 6. Documentação (OpenAPI)

Seguindo a metodologia Design-First, a API foi documentada utilizando a especificação OpenAPI 3.0. O ficheiro `src/openapi.yaml` descreve todos os endpoints, esquemas de dados e respostas esperadas. Esta documentação é servida visualmente através do Swagger UI na rota `/api-docs`.

**Exemplo de Definição de Rota (YAML):**

```yaml
  /artistas:
    get:
      summary: Listar todos os artistas
      description: Retorna uma lista de artistas. Suporta filtros por género.
      parameters:
        - in: query
          name: genero
          schema:
            type: string
          description: Filtra artistas pelo estilo musical (Ex. Rock, Jazz)
```
## 7. Containerização (Docker)

Para garantir que a aplicação funciona em qualquer ambiente (como o computador da escola), toda a solução foi "dockerizada".

*   **Dockerfile:** Define a imagem da API, baseada em `node:18`, instalando as dependências e expondo a porta 3000.
*   **docker-compose.yaml:** Orquestra os dois serviços essenciais (`api` e `db`). Define variáveis de ambiente, portas e volumes para persistência de dados.

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
```
## 8. Conclusão

O desenvolvimento desta API permitiu consolidar conhecimentos fundamentais de desenvolvimento Backend. A solução apresentada cumpre todos os requisitos propostos: implementa uma arquitetura REST, utiliza os verbos HTTP corretamente (GET, POST, PUT, DELETE), gere relações complexas (1:N e M:N) e está devidamente documentada e containerizada. A inclusão de scripts de seed e a gestão eficiente de conexões à base de dados demonstram a robustez da solução.