# Conecta 60+ — Tutoriais com imagens e áudio

## Executar
    npm install
    npm start        # abre em http://localhost:3000

Sem MySQL, a API lê `data/tutorials.json`. Para usar MySQL: rode `db/schema.sql`, importe os dados e inicie com
`DB_NAME=conecta DB_USER=... DB_PASS=... npm start`.

## Adicionar um tutorial
Inclua novos itens em `data/tutorials.json` (ou nas tabelas) com outro `task`, `brand`, `os`, `compat` e `steps`.
Novas ilustrações entram na função `art()` em `public/app.js` (chave usada em `image`).
