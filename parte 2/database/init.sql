USE festival_manager;

CREATE TABLE IF NOT EXISTS palcos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    capacidade INT NOT NULL,
    localizacao VARCHAR(100),
    responsavel VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS artistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    genero VARCHAR(50),
    pais_origem VARCHAR(50),
    cachet DECIMAL(10, 2)
);

    --FK para Palcos (Relação 1:N)
CREATE TABLE IF NOT EXISTS concertos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_hora DATETIME NOT NULL,
    duracao_minutos INT DEFAULT 60,
    palco_id INT,
    FOREIGN KEY (palco_id) REFERENCES palcos(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS bilhetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, 
    preco DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponivel'
);

-- tabela de ligação: concertos <-> artistas (relação M:N)
CREATE TABLE IF NOT EXISTS alinhamento (
    concerto_id INT,
    artista_id INT,
    ordem_atuacao INT, 
    PRIMARY KEY (concerto_id, artista_id),
    FOREIGN KEY (concerto_id) REFERENCES concertos(id) ON DELETE CASCADE,
    FOREIGN KEY (artista_id) REFERENCES artistas(id) ON DELETE CASCADE
);