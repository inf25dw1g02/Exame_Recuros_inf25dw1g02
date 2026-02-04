require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'festival_admin', 
    password: process.env.DB_PASSWORD || 'password', 
    database: process.env.DB_NAME || 'festival_manager',
    port: 3306 
};

const main = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        await connection.execute('DELETE FROM alinhamento'); // tabela M:N
        await connection.execute('DELETE FROM concertos');
        await connection.execute('DELETE FROM artistas');
        await connection.execute('DELETE FROM palcos');
        await connection.execute('DELETE FROM bilhetes');
        
        //palcos
        const palcosData = [
            ['Palco NOS', 85000, 'Relvado Principal', 'Roberto Medina'],
            ['Palco Heineken', 15000, 'Tenda Norte', 'Zé da Tenda'],
            ['Palco Comédia', 5000, 'Auditório', 'Ricardo Araújo'],
            ['Palco Som', 2000, 'Piscina', 'DJ Vibe']
        ];
        
        for (let p of palcosData) {
            await connection.execute('INSERT INTO palcos (nome, capacidade, localizacao, responsavel) VALUES (?, ?, ?, ?)', p);
        }
        
        const [palcos] = await connection.execute('SELECT id FROM palcos');
        const palcoIds = palcos.map(p => p.id);

        //artistas
        const nomes = ['Metallica', 'Muse', 'Daft Punk', 'Foo Fighters', 'Pearl Jam', 'Arctic Monkeys', 'Coldplay', 'Red Hot Chili Peppers', 'The Strokes', 'Radiohead', 'Gorillaz', 'Queen', 'Nirvana', 'AC/DC', 'Pink Floyd', 'Led Zeppelin', 'The Beatles', 'David Bowie', 'Prince', 'U2', 'Green Day', 'Linkin Park', 'System of a Down', 'Rammstein', 'Iron Maiden', 'Black Sabbath', 'Slipknot', 'Korn', 'Limp Bizkit', 'The Killers'];
        
        for (let i = 0; i < 30; i++) {
            const nome = nomes[i] || `Artista Genérico ${i}`;
            const genero = i % 2 === 0 ? 'Rock' : 'Pop/Alternative';
            const cachet = Math.floor(Math.random() * 50000) + 10000;
            await connection.execute('INSERT INTO artistas (nome, genero, pais_origem, cachet) VALUES (?, ?, ?, ?)', [nome, genero, 'Internacional', cachet]);
        }

        const [artistas] = await connection.execute('SELECT id FROM artistas');
        const artistaIds = artistas.map(a => a.id);

        //1:N com Palcos
        const concertosIds = [];
        for (let i = 0; i < 30; i++) {
            const palcoRandom = palcoIds[Math.floor(Math.random() * palcoIds.length)];
            const data = new Date();
            data.setDate(data.getDate() + i); // 1 concerto por dia nos próximos 30 dias
            
            const [res] = await connection.execute(
                'INSERT INTO concertos (data_hora, duracao_minutos, palco_id) VALUES (?, ?, ?)',
                [data, 90, palcoRandom]
            );
            concertosIds.push(res.insertId);
        }

        //bilhetes
        for (let i = 0; i < 35; i++) {
            const tipo = i % 3 === 0 ? 'VIP' : 'Geral';
            const preco = tipo === 'VIP' ? 120.00 : 65.00;
            await connection.execute('INSERT INTO bilhetes (tipo, preco, estado) VALUES (?, ?, ?)', [tipo, preco, 'vendido']);
        }

        // RELAÇÃO M:N (Alinhamento - Artistas em Concertos)
        // associar artistas aleatórios a concertos
        for (let concertoId of concertosIds) {
            // cada concerto tem 1 ou 2 artistas
            const artista1 = artistaIds[Math.floor(Math.random() * artistaIds.length)];
            
            await connection.execute('INSERT IGNORE INTO alinhamento (concerto_id, artista_id, ordem_atuacao) VALUES (?, ?, ?)', [concertoId, artista1, 1]);
            
            if (Math.random() > 0.5) { // 50% de chance de ter um segundo artista
                let artista2 = artistaIds[Math.floor(Math.random() * artistaIds.length)];
                if (artista2 !== artista1) {
                    await connection.execute('INSERT IGNORE INTO alinhamento (concerto_id, artista_id, ordem_atuacao) VALUES (?, ?, ?)', [concertoId, artista2, 2]);
                }
            }
        }

        console.log('sucesso');

    } catch (err) {
        console.error('erro', err);
    } finally {
        if (connection) connection.end();
        process.exit();
    }
};

main();