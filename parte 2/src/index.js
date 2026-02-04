require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const swaggerDocument = YAML.load('./src/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'festival_manager'
};

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

app.post('/api/artistas', async (req, res) => {
    try {
        const { nome, genero, pais_origem, cachet } = req.body;
        const [result] = await req.db.execute(
            'INSERT INTO artistas (nome, genero, pais_origem, cachet) VALUES (?, ?, ?, ?)',
            [nome, genero, pais_origem, cachet]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/palcos', async (req, res) => {
    const [rows] = await req.db.execute('SELECT * FROM palcos');
    res.json(rows);
});

app.post('/api/palcos', async (req, res) => {
    const { nome, capacidade, localizacao, responsavel } = req.body;
    const [result] = await req.db.execute(
        'INSERT INTO palcos (nome, capacidade, localizacao, responsavel) VALUES (?, ?, ?, ?)',
        [nome, capacidade, localizacao, responsavel]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
});

// Relação 1:N
app.get('/api/concertos', async (req, res) => {
    let query = 'SELECT * FROM concertos';
    const params = [];

    if (req.query.palco_id) {
        query += ' WHERE palco_id = ?';
        params.push(req.query.palco_id);
    }

    const [rows] = await req.db.execute(query, params);
    res.json(rows);
});

app.post('/api/concertos', async (req, res) => {
    const { data_hora, duracao_minutos, palco_id } = req.body;
    const [result] = await req.db.execute(
        'INSERT INTO concertos (data_hora, duracao_minutos, palco_id) VALUES (?, ?, ?)',
        [data_hora, duracao_minutos, palco_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
});

//  M:N
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
        
        if (rows.length === 0) {
            return res.json([]); 
        } 
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/artistas/:id', async (req, res) => {
    const { nome, genero, cachet } = req.body;
    const { id } = req.params;
    try {
        const [result] = await req.db.execute(
            'UPDATE artistas SET nome = ?, genero = ?, cachet = ? WHERE id = ?',
            [nome, genero, cachet, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Artista não encontrado' });
        }
        res.json({ message: 'Artista atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/artistas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await req.db.execute('DELETE FROM artistas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Artista não encontrado' });
        }
        res.json({ message: 'Artista eliminado. RIP.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Festival API a correr! Documentação em /api-docs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor na porta: ${PORT}`);
    console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});