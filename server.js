// Conecta 60+ — API REST dos tutoriais.
// Sem variáveis DB_*, lê data/tutorials.json. Com DB_NAME definido, lê do MySQL (db/schema.sql).
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function loadTutorials() {
  if (!process.env.DB_NAME) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'data/tutorials.json'), 'utf8'));
  }
  const mysql = require('mysql2/promise');
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME
  });
  const [tuts] = await db.query('SELECT * FROM tutorials');
  const [steps] = await db.query('SELECT * FROM steps ORDER BY tutorial_id, position');
  await db.end();
  return tuts.map(t => ({
    id: t.id, task: t.task, title: t.title, description: t.description, brand: t.brand,
    os: t.os, model: t.model, version: t.version, compat: t.compat, reviewed: t.reviewed,
    steps: steps.filter(s => s.tutorial_id === t.id)
      .map(s => ({ title: s.title, text: s.text, audio: s.audio, image: s.image }))
  }));
}

// GET /api/tutorials?task=fonte  -> todas as versões (por marca/SO) da tarefa
app.get('/api/tutorials', async (req, res) => {
  try {
    const all = await loadTutorials();
    res.json(req.query.task ? all.filter(t => t.task === req.query.task) : all);
  } catch (e) { res.status(500).json({ erro: 'Não foi possível carregar os tutoriais.' }); }
});

app.listen(process.env.PORT || 3000, () => console.log('Conecta 60+ em http://localhost:' + (process.env.PORT || 3000)));
