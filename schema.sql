CREATE TABLE tutorials (
  id VARCHAR(40) PRIMARY KEY, task VARCHAR(40) NOT NULL, title VARCHAR(120) NOT NULL,
  description TEXT, brand VARCHAR(40) NOT NULL DEFAULT '*',      -- '*' = qualquer marca
  os ENUM('android','ios') NOT NULL, model VARCHAR(60), version VARCHAR(30),
  compat ENUM('especifica','parcial','generica') NOT NULL, reviewed DATE NOT NULL
);
CREATE TABLE steps (
  id INT AUTO_INCREMENT PRIMARY KEY, tutorial_id VARCHAR(40) NOT NULL, position INT NOT NULL,
  title VARCHAR(120) NOT NULL, text TEXT NOT NULL, audio TEXT NOT NULL,
  image VARCHAR(60) NOT NULL,                                    -- chave da ilustração (ex.: 'icone')
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);
-- Para popular: converta data/tutorials.json em INSERTs (um por tutorial e um por etapa).
