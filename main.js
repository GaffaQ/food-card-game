// Core state
const state = {
  players: [], // { id, name, ldlPoints, hdlPoints, cholesterol, hand: Card[] }
  turnIndex: 0,
  deck: [],
  discard: [],
  started: false,
};

// Card factories
const JUNK_CARDS = [
  { name: 'Burger keju', ldl: 30, key: 'burger_keju' },
  { name: 'Ayam goreng tepung', ldl: 20, key: 'ayam_goreng_tepung' },
  { name: 'Kentang goreng', ldl: 15, key: 'kentang_goreng' },
  { name: 'Pizza sosis keju', ldl: 25, key: 'pizza_sosis_keju' },
  { name: 'Donat & kue manis', ldl: 30, key: 'donat_kue_manis' },
  { name: 'Es krim full cream', ldl: 15, key: 'es_krim_full_cream' },
  { name: 'Hotdog', ldl: 15, key: 'hotdog' },
  { name: 'Daging olahan (sosis, nugget)', ldl: 20, key: 'daging_olahan' },
  { name: 'Susu kental manis', ldl: 15, key: 'susu_kental_manis' },
  { name: 'Keju leleh berlebihan', ldl: 20, key: 'keju_leleh_berlebihan' },
  { name: 'Mie instan dengan bumbu lengkap', ldl: 15, key: 'mie_instan_bumbu_lengkap' },
  { name: 'Martabak telur daging', ldl: 30, key: 'martabak_telur_daging' },
  { name: 'Kulit ayam goreng', ldl: 25, key: 'kulit_ayam_goreng' },
  { name: 'Kue tart krim mentega', ldl: 30, key: 'kue_tart_krim_mentega' },
];

const HEAL_CARDS = [
  { name: 'Alpukat', hdl: 15, key: 'alpukat' },
  { name: 'Oatmeal', hdl: 25, key: 'oatmeal' },
  { name: 'Ikan salmon / tuna', hdl: 20, key: 'ikan_salmon_tuna' },
  { name: 'Kacang almond', hdl: 15, key: 'kacang_almond' },
  { name: 'Sayuran hijau (bayam, brokoli)', hdl: 30, key: 'sayuran_hijau' },
  { name: 'Buah apel pir', hdl: 25, key: 'buah_apel_pir' },
  { name: 'Minyak zaitun', hdl: 10, key: 'minyak_zaitun' },
  { name: 'Yoghurt rendah lemak', hdl: 15, key: 'yoghurt_rendah_lemak' },
  { name: 'Tempe tahu kukus', hdl: 20, key: 'tempe_tahu_kukus' },
  { name: 'Jeruk dan buah beri', hdl: 25, key: 'jeruk_buah_beri' },
  { name: 'Teh hijau tanpa gula', hdl: 10, key: 'teh_hijau_tanpa_gula' },
  { name: 'Bawang putih', hdl: 15, key: 'bawang_putih' },
  { name: 'Kacang merah lentil', hdl: 20, key: 'kacang_merah_lentil' },
  { name: 'Air putih hangat rutin', hdl: 10, key: 'air_putih_hangat_rutin' },
];

const POWER_CARDS = [
  { name: 'Plus Card', type: 'plus', key: 'power_plus' },
  { name: 'Minus Card', type: 'minus', key: 'power_minus' },
];

function buildDeck(){
  const deck = [];
  // Duplicate sets to make a richer deck
  for(let i=0;i<4;i++){
    JUNK_CARDS.forEach(j=> deck.push({ id: uid(), kind:'junk', name:j.name, ldl:j.ldl, img:`assets/junk.jpg` }));
    HEAL_CARDS.forEach(h=> deck.push({ id: uid(), kind:'heal', name:h.name, hdl:h.hdl, img:`assets/healty.jpg` }));
  }
  for(let i=0;i<6;i++){
    POWER_CARDS.forEach(p=> deck.push({ id: uid(), kind:'power', power:p.type, name:p.name, img:`assets/power.png` }));
  }
  return shuffle(deck);
}

// Utils
function uid(){ return Math.random().toString(36).slice(2,9); }
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// DOM refs
const modalCount = document.getElementById('modal-count');
const modalNames = document.getElementById('modal-names');
const modalSummary = document.getElementById('modal-summary');
const formCount = document.getElementById('form-count');
const inputCount = document.getElementById('input-count');
const formNames = document.getElementById('form-names');
const scoreboard = document.getElementById('scoreboard');
const playerHand = document.getElementById('player-hand');
const centerPile = document.getElementById('center-pile');
const turnIndicator = document.getElementById('turn-indicator');
const summaryBody = document.getElementById('summary-body');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnCloseSummary = document.getElementById('btn-close-summary');
const btnRestart = document.getElementById('btn-restart');

// Init
function resetGame(){
  state.players = [];
  state.turnIndex = 0;
  state.deck = buildDeck();
  state.discard = [];
  state.started = false;
  renderAll();
}

function startGame(){
  state.started = true;
  dealCardsAnimated(10).then(()=>{
    updateTurnUI();
    renderAll();
  });
}

// Forms
formCount.addEventListener('submit', (e)=>{
  e.preventDefault();
  const n = parseInt(inputCount.value,10);
  if(isNaN(n) || n<2 || n>4) return;
  buildNamesForm(n);
  modalCount.classList.remove('visible');
  modalNames.classList.add('visible');
});

function buildNamesForm(n){
  formNames.innerHTML = '';
  for(let i=0;i<n;i++){
    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `<label>Player ${i+1}</label><input type="text" name="p${i}" placeholder="Nama pemain ${i+1}" required />`;
    formNames.appendChild(row);
  }
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  actions.innerHTML = '<button class="btn" type="button" id="cancel-names">Kembali</button><button class="btn primary" type="submit">Mulai</button>';
  formNames.appendChild(actions);
  formNames.querySelector('#cancel-names').addEventListener('click', ()=>{
    modalNames.classList.remove('visible');
    modalCount.classList.add('visible');
  });
}

formNames.addEventListener('submit', (e)=>{
  e.preventDefault();
  const formData = new FormData(formNames);
  const names = [];
  for(const [k,v] of formData.entries()){
    const name = String(v).trim() || 'Pemain';
    names.push(name);
  }
  state.players = names.map((name, idx)=>({
    id: uid(),
    name,
    ldlPoints: 0,
    hdlPoints: 0,
    cholesterol: 0,
    hand: [],
    finished: false,
    order: idx,
  }));
  modalNames.classList.remove('visible');
  startGame();
});

btnPlayAgain.addEventListener('click', ()=>{
  modalSummary.classList.remove('visible');
  location.reload();
});
btnCloseSummary.addEventListener('click', ()=>{
  modalSummary.classList.remove('visible');
});
btnRestart.addEventListener('click', ()=>{
  location.reload();
});

// Rendering
function renderScoreboard(){
  scoreboard.innerHTML = '';
  state.players.forEach((p, idx)=>{
    const div = document.createElement('div');
    div.className = 'player-card'+(idx===state.turnIndex && !p.finished?' turn':'');
    const isTurn = idx === state.turnIndex && !p.finished;
    div.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="stats">
        <div class="chip ldl">LDL +${p.ldlPoints}</div>
        <div class="chip hdl">HDL -${p.hdlPoints}</div>
        <div class="chip total">Total ${p.cholesterol}</div>
      </div>
      <div style="margin-top:6px; opacity:.8; font-weight:700">Kartu: ${p.hand.length}</div>
    `;
    scoreboard.appendChild(div);
  });
}

function cardEl(card){
  const el = document.createElement('div');
  el.className = `card ${card.kind==='junk'?'junk':card.kind==='heal'?'heal':'power'}`;
  el.dataset.id = card.id;
  el.innerHTML = `
    <div class="img" style="background-image:url('${card.img}')"></div>
    <div class="type">${card.kind==='power'?card.power.toUpperCase():card.kind.toUpperCase()}</div>
    <div class="title">${card.name}</div>
    <div class="points">${card.kind==='junk'?`+${card.ldl}`:card.kind==='heal'?`-${card.hdl}`:card.power==='plus'?'+?':'-?'}</div>
  `;
  el.addEventListener('click', ()=> onPlayCard(card.id));
  return el;
}

function renderHands(){
  playerHand.innerHTML = '';
  const current = state.players[state.turnIndex];
  if(!current) return;
  // scale to avoid overflow
  const maxPerRow = Math.floor((window.innerWidth - 80) / 110);
  const scale = current.hand.length > maxPerRow ? Math.max(0.7, maxPerRow / current.hand.length) : 1;
  playerHand.style.transform = `scale(${scale})`;
  playerHand.style.transformOrigin = 'center bottom';
  current.hand.forEach((c,i)=>{
    const el = cardEl(c);
    el.style.animationDelay = `${i*40}ms`;
    el.classList.add('deal-anim');
    playerHand.appendChild(el);
  });
}

function renderPiles(){
  centerPile.innerHTML = '';
  const top = state.discard[state.discard.length-1];
  if(top){
    const el = cardEl(top);
    el.onclick = null;
    centerPile.appendChild(el);
  } else {
    centerPile.innerHTML = '<div style="opacity:.6;font-weight:800">PUSAT</div>';
  }
}

function updateTurnUI(){
  const p = state.players[state.turnIndex];
  turnIndicator.textContent = p?`Giliran: ${p.name}`:'Giliran: -';
}

function renderAll(){
  renderScoreboard();
  renderPiles();
  renderHands();
}

// Dealing animation
async function dealCardsAnimated(num){
  // Round-robin dealing to each player
  for(let r=0; r<num; r++){
    for(let i=0; i<state.players.length; i++){
      const card = state.deck.pop();
      if(!card) continue;
      state.players[i].hand.push(card);
      renderScoreboard();
      renderHands();
      await sleep(90);
    }
  }
}

function sleep(ms){ return new Promise(res=>setTimeout(res, ms)); }

// Turn and play logic
function onPlayCard(cardId){
  const player = state.players[state.turnIndex];
  if(!player || player.finished) return;
  const idx = player.hand.findIndex(c=>c.id===cardId);
  if(idx===-1) return;
  const card = player.hand.splice(idx,1)[0];

  // animate throw from side based on player seat
  animateThrowFromSeat(card, player.order);

  // Apply effect
  if(card.kind==='junk'){
    player.ldlPoints += card.ldl;
    player.cholesterol += card.ldl;
  } else if(card.kind==='heal'){
    player.hdlPoints += card.hdl;
    player.cholesterol -= card.hdl;
  } else if(card.kind==='power'){
    if(card.power==='plus'){
      const n = 1 + Math.floor(Math.random()*4);
      for(let i=0;i<n;i++){
        const draw = state.deck.pop(); if(draw) player.hand.push(draw);
      }
    } else if(card.power==='minus'){
      const n = 1 + Math.floor(Math.random()*4);
      for(let i=0;i<n && player.hand.length>0;i++){
        const j = Math.floor(Math.random()*player.hand.length);
        player.hand.splice(j,1);
      }
    }
  }

  state.discard.push(card);
  renderAll();

  // Check finish for player
  if(player.hand.length===0){
    player.finished = true;
  }

  advanceTurn();
}

function advanceTurn(){
  // Is the game over? All players finished?
  if(state.players.every(p=>p.finished)){
    endGame();
    return;
  }
  // Move to next player with cards
  const n = state.players.length;
  for(let step=1; step<=n; step++){
    const next = (state.turnIndex + step) % n;
    if(!state.players[next].finished){
      state.turnIndex = next;
      break;
    }
  }
  updateTurnUI();
  renderAll();
}

function endGame(){
  // Winner: smallest cholesterol
  const sorted = [...state.players].sort((a,b)=> a.cholesterol - b.cholesterol);
  const winner = sorted[0];
  summaryBody.innerHTML = `
    <div style="font-size:24px; font-weight:900; margin-bottom:10px">Leaderboard</div>
    <div class="table-wrap">
      <table class="lb-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>LDL Point</th>
            <th>HDL Point</th>
            <th>Kolesterol Point</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((p,i)=>`
            <tr class="win-pop">
              <td>${i+1}</td>
              <td>${p.name}</td>
              <td>+${p.ldlPoints}</td>
              <td>-${p.hdlPoints}</td>
              <td>${p.cholesterol}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  modalSummary.classList.add('visible');
}

function rankMedal(index){
  if(index===0) return '🏆';
  if(index===1) return '🥈';
  if(index===2) return '🥉';
  return '🎖️';
}

function playerIcon(player){
  // Unique, simple semantic icon: healthy if <=0 else junk
  return player.cholesterol <= 0 ? '🥑' : '🍔';
}

function animateThrowFromSeat(card, seatIdx){
  renderHands();
  const ghost = cardEl(card);
  ghost.onclick = null;
  ghost.style.position='fixed';
  ghost.style.zIndex='1000';
  const rect = bottomHandOrigin();
  ghost.style.left = rect.left+'px';
  ghost.style.top = rect.top+'px';
  document.body.appendChild(ghost);
  const target = pileCenterRect();
  ghost.animate([
    { transform: 'translate(0,0) scale(1)', offset:0 },
    { transform: `translate(${target.x - rect.left}px, ${target.y - rect.top}px) rotate(-10deg) scale(1)`, offset:1 }
  ], { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' });
  setTimeout(()=>{ ghost.remove(); renderPiles(); }, 520);
}

function seatRect(seatIdx){
  const center = viewportCenter();
  const offset = 80;
  if(seatIdx===0) return { left:center.x-40, top: window.innerHeight - 120 };
  if(seatIdx===1) return { left: window.innerWidth - 160, top: center.y-60 };
  if(seatIdx===2) return { left: 40, top: center.y-60 };
  return { left:center.x-40, top: 40 };
}

function viewportCenter(){
  return { x: window.innerWidth/2, y: window.innerHeight/2 };
}

function pileCenterRect(){
  const r = centerPile.getBoundingClientRect();
  return { x: r.left + r.width/2 - 60, y: r.top + r.height/2 - 90 };
}

function bottomHandOrigin(){
  // approximate origin from bottom center
  return { left: window.innerWidth/2 - 60, top: window.innerHeight - 160 };
}

// Kick off
resetGame();



