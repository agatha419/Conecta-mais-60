// Conecta 60+ — controle do fluxo, seleção de aparelho, etapas e áudio.
const $ = s => document.querySelector(s);
const state = { brand: null, os: null, tut: null, i: 0, audioOn: true, all: [] };
const BRANDS = [['Samsung','android','Samsung'],['Motorola','android','Motorola'],['Xiaomi','android','Xiaomi'],
                ['iPhone (Apple)','ios','Apple'],['Outra marca',null,'*']];
const HOME_TUTORIALS = [
  { title: 'Aumentar letras e volume', description: 'Tutorial de letras disponível; orientação sobre volume em breve.', icon: '🔠', task: 'fonte' },
  { title: 'Fazer chamadas de vídeo', description: 'Tutorial em breve.', icon: '📹' },
  { title: 'Enviar fotos e mensagens', description: 'Tutorial em breve.', icon: '💬' },
  { title: 'Conectar ao Wi-Fi', description: 'Tutorial em breve.', icon: '📶' },
  { title: 'Usar serviços digitais com segurança', description: 'Tutorial em breve.', icon: '🔐' },
  { title: 'Identificar possíveis golpes', description: 'Tutorial em breve.', icon: '🛡️' }
];

function renderHome(query = ''){
  const cards = $('#tutorialCards');
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  cards.innerHTML = '';
  const visibleTutorials = HOME_TUTORIALS.filter(t =>
    `${t.title} ${t.description}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
  );
  visibleTutorials.forEach(t => {
    const card = document.createElement('article');
    card.className = 'tutorial-card';
    const heading = document.createElement('h3');
    heading.textContent = `${t.icon} ${t.title}`;
    const description = document.createElement('p');
    description.textContent = t.description;
    card.append(heading, description);
    if (t.task){
      const button = document.createElement('button');
      button.className = 'primary';
      button.textContent = 'Começar';
      button.onclick = () => startTutorial(t.task);
      card.append(button);
    } else {
      const status = document.createElement('p');
      status.className = 'tutorial-status';
      status.textContent = 'Em breve';
      card.append(status);
    }
    cards.append(card);
  });
  $('#noTutorials').hidden = visibleTutorials.length > 0;
}
$('#tutorialSearch').addEventListener('input', event => renderHome(event.target.value));
renderHome();

function show(id){ document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== id); window.scrollTo(0,0); stopVoice(); }
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));

// ---- Tamanho da letra do próprio app (lembrado no navegador, se possível)
let base = 20; try { base = +localStorage.getItem('c60size') || 20; } catch(e){}
function setBase(n){ base = Math.min(32, Math.max(16, n)); document.documentElement.style.setProperty('--base', base + 'px'); try{ localStorage.setItem('c60size', base);}catch(e){} }
setBase(base); $('#fontUp').onclick = () => setBase(base + 3); $('#fontDown').onclick = () => setBase(base - 3);

// ---- Escolha do aparelho
function renderDevice(){
  $('#brands').innerHTML = ''; $('#oses').innerHTML = '';
  BRANDS.forEach(([label, os, brand]) => {
    const b = document.createElement('button'); b.textContent = label;
    b.className = state.brand === brand ? 'sel' : '';
    b.onclick = () => { state.brand = brand; state.os = os; renderDevice(); }; // "Outra marca": o usuário escolhe o sistema
    $('#brands').append(b);
  });
  $('#osBox').hidden = !state.brand;
  [['Android','android'],['iOS (iPhone)','ios']].forEach(([label, os]) => {
    const b = document.createElement('button'); b.textContent = label; b.className = state.os === os ? 'sel' : '';
    b.onclick = () => { state.os = os; renderDevice(); }; $('#oses').append(b);
  });
  $('#toMatch').disabled = !(state.brand && state.os);
}
async function startTutorial(task){
  try { state.all = await (await fetch('/api/tutorials?task=' + encodeURIComponent(task))).json(); }
  catch(e){ alert('Não conseguimos carregar o tutorial agora. Tente novamente em instantes.'); return; }
  if (!state.all.length){ alert('Este tutorial ainda não está disponível.'); return; }
  renderDevice(); show('device');
}

// ---- Escolha do tutorial: específico da marca > genérico do sistema. Nunca promete compatibilidade não confirmada.
const NOTES = {
  especifica: 'Este tutorial foi feito para o seu tipo de aparelho. Mesmo assim, o nome de alguma opção pode ser um pouco diferente.',
  parcial: 'Este tutorial foi feito para a sua marca, mas não confirmamos o seu modelo e versão. Os nomes dos menus podem ser um pouco diferentes.',
  generica: 'Não temos um tutorial exato para o seu celular. Estas são instruções gerais: os nomes e a localização das opções podem variar. Vamos ajudar você a procurar.'
};
$('#toMatch').onclick = () => {
  const c = state.all.filter(t => t.os === state.os);
  state.tut = c.find(t => t.brand === state.brand) || c.find(t => t.brand === '*');
  if (!state.tut){ alert('Não encontramos instruções para este sistema.'); return; }
  $('#notice').textContent = NOTES[state.tut.compat];
  $('#summary').textContent = state.tut.title + ' — ' + state.tut.steps.length + ' etapas, sem pressa. Última revisão: ' + state.tut.reviewed.split('-').reverse().join('/') + '.';
  show('match');
};
$('#begin').onclick = () => { state.i = 0; showStep(); };

// ---- Ilustrações genéricas em SVG (sempre identificadas como ilustração, nunca como captura real)
function art(k){
  const hi = (x,y,w,h,t) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="var(--mark)" stroke-width="5"/><text x="${x+w/2}" y="${y+h+18}" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--mark)">${t}</text>`;
  let inner = '';
  if (k === 'icone'){
    for (let r=0;r<3;r++) for (let c=0;c<3;c++) inner += `<rect x="${28+c*48}" y="${60+r*56}" width="38" height="38" rx="9" fill="var(--soft)" stroke="var(--line)"/>`;
    inner += `<text x="95" y="143" text-anchor="middle" font-size="26" fill="var(--fg)">⚙</text>` + hi(70,110,50,50,'Toque aqui');
  } else if (k === 'menu'){
    ['Conexões','Tela ou Visor','Sons'].forEach((t,n) => inner += `<rect x="24" y="${70+n*50}" width="142" height="40" rx="8" fill="var(--soft)" stroke="var(--line)"/><text x="36" y="${95+n*50}" font-size="13" fill="var(--fg)">${t}</text>`);
    inner += hi(20,116,150,48,'Toque aqui');
  } else {
    inner = `<text x="32" y="100" font-size="14" fill="var(--fg)">Aa</text><text x="125" y="102" font-size="28" fill="var(--fg)">Aa</text><rect x="32" y="130" width="126" height="8" rx="4" fill="var(--soft)" stroke="var(--line)"/><circle cx="110" cy="134" r="11" fill="var(--primary)"/>` + hi(94,118,32,32,'Arraste');
  }
  return `<svg viewBox="0 0 190 320" role="img" aria-label="Ilustração genérica do passo"><rect x="6" y="6" width="178" height="308" rx="22" fill="var(--bg)" stroke="var(--line)" stroke-width="4"/>${inner}</svg>`;
}

// ---- Etapas
function showStep(){
  const s = state.tut.steps[state.i];
  $('#progress').textContent = `Etapa ${state.i + 1} de ${state.tut.steps.length}`;
  $('#stepTitle').textContent = `Etapa ${state.i + 1} — ${s.title}`;
  $('#stepText').textContent = s.text;
  $('#art').innerHTML = art(s.image);
  $('#cap').textContent = 'Ilustração genérica. O seu celular pode ser um pouco diferente.';
  $('#helpBox').hidden = true; $('#voiceMsg').hidden = true;
  $('#next').textContent = state.i === state.tut.steps.length - 1 ? 'Concluir ✔' : 'Próxima etapa ➡';
  show('step');
}
$('#next').onclick = () => state.i < state.tut.steps.length - 1 ? (state.i++, showStep()) : show('done');
$('#back').onclick = () => state.i > 0 ? (state.i--, showStep()) : show('match');
$('#again').onclick = () => { state.i = 0; showStep(); };

const helpText = () => 'Sem problema, isso é comum: os nomes mudam de um celular para outro. ' +
  'Dica: abra as Configurações e use a lupa (campo de busca) no alto da tela. Digite "fonte" ou "texto" e toque no resultado. ' +
  'Se quiser, volte uma etapa e tente de novo, no seu tempo. Você também pode pedir ajuda a alguém de confiança.';
$('#notFound').onclick = $('#help').onclick = () => { $('#helpBox').textContent = helpText(); $('#helpBox').hidden = false; };

// ---- Áudio (Web Speech API)
const hasVoice = 'speechSynthesis' in window;
function stopVoice(){ if (hasVoice) speechSynthesis.cancel(); $('#pause').textContent = '⏸ Pausar'; }
function speak(){
  if (!state.audioOn) return;
  if (!hasVoice){ $('#voiceMsg').hidden = false; return; }
  stopVoice();
  const u = new SpeechSynthesisUtterance(state.tut.steps[state.i].audio);
  u.lang = 'pt-BR'; u.rate = 0.85;
  speechSynthesis.speak(u);
}
$('#listen').onclick = $('#repeat').onclick = speak;
$('#pause').onclick = () => {
  if (!hasVoice) { $('#voiceMsg').hidden = false; return; }
  if (speechSynthesis.paused){ speechSynthesis.resume(); $('#pause').textContent = '⏸ Pausar'; }
  else if (speechSynthesis.speaking){ speechSynthesis.pause(); $('#pause').textContent = '▶ Continuar'; }
};
$('#audioToggle').onclick = () => {
  state.audioOn = !state.audioOn; if (!state.audioOn) stopVoice();
  $('#audioToggle').textContent = state.audioOn ? '🔈 Áudio: ligado' : '🔇 Áudio: desligado';
  ['listen','repeat','pause'].forEach(id => $('#' + id).disabled = !state.audioOn);
};
