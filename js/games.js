/* ══════════════════════════════════════════
   games.js — Games: minesweeper, color sort
   ══════════════════════════════════════════ */

function ensureGameStats(){if(!S.gameStats)S.gameStats={mineWins:0,sortWins:0,totalAff:0};}
function renderGameStats(){
  ensureGameStats();
  const el1=document.getElementById('mineWins');if(el1)el1.textContent=S.gameStats.mineWins;
  const el2=document.getElementById('sortWins');if(el2)el2.textContent=S.gameStats.sortWins;
  const el3=document.getElementById('totalAffFromGames');if(el3)el3.textContent=S.gameStats.totalAff;
}
function gameAffUp(amt){
  ensureGameStats();
  S.aff=(S.aff||0)+amt;
  S.gameStats.totalAff+=amt;
  sv();uab();
}

/* ══ 扫雷（对战模式） ══ */
let _mine={};
let _mineChar='yukimura';
function openMinesweeper(){
  os('💣 网球扫雷 · 对战',`
    <div id="mineContainer" style="text-align:center">
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.6">选择对手，轮流翻格子，谁踩雷谁输！</div>
      <div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px;flex-wrap:wrap" id="mineCharBar">
        ${Object.entries(CHAR_PACKS).filter(([k,v])=>v.active&&S.unlockedChars.includes(k)).map(([cid,ch])=>`<div onclick="pickMineChar('${cid}')" data-mc="${cid}" style="padding:5px 10px;border-radius:14px;border:2px solid ${cid==='yukimura'?ch.color:'var(--border)'};background:${cid==='yukimura'?ch.color+'18':'white'};color:${cid==='yukimura'?ch.color:'var(--muted)'};font-size:11px;font-weight:600;cursor:pointer;transition:all .2s">${ch.ico} ${ch.name}</div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px">
        <button onclick="initMine(8,8,10,'easy')" class="mine-diff" id="md-easy" style="padding:6px 14px;border-radius:10px;border:2px solid var(--p400);background:var(--p100);color:var(--p600);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">简单 8×8</button>
        <button onclick="initMine(10,10,15,'med')" class="mine-diff" id="md-med" style="padding:6px 14px;border-radius:10px;border:2px solid var(--border);background:white;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">中等 10×10</button>
        <button onclick="initMine(12,10,25,'hard')" class="mine-diff" id="md-hard" style="padding:6px 14px;border-radius:10px;border:2px solid var(--border);background:white;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">困难 12×10</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;padding:0 4px">
        <span id="mineCount" style="font-size:13px;font-weight:700;color:#E53935">🎾 10</span>
        <span id="mineTurn" style="font-size:12px;font-weight:600;color:var(--p500)">你的回合</span>
        <span id="mineTimer" style="font-size:13px;font-weight:700;color:var(--p600)">⏱ 0s</span>
      </div>
      <div id="mineDanmaku" style="min-height:24px;margin-bottom:6px;font-size:12px;font-weight:600;line-height:1.5"></div>
      <div id="mineGrid" style="display:inline-grid;gap:2px;background:var(--p100);padding:4px;border-radius:12px;border:2px solid var(--border);touch-action:manipulation"></div>
      <div id="mineResult" style="margin-top:12px;display:none"></div>
    </div>
  `);
  setTimeout(()=>initMine(8,8,10,'easy'),100);
}
function pickMineChar(cid){
  _mineChar=cid;const ch=CHAR_PACKS[cid];
  document.querySelectorAll('#mineCharBar [data-mc]').forEach(el=>{const a=el.dataset.mc===cid;el.style.borderColor=a?ch.color:'var(--border)';el.style.background=a?ch.color+'18':'white';el.style.color=a?ch.color:'var(--muted)';});
  showMineDanmaku(pick(MINE_COMMENTS[cid]?.taunt||['来吧。']));
}
function showMineDanmaku(text){
  const el=document.getElementById('mineDanmaku');if(!el)return;
  const ch=CHAR_PACKS[_mineChar];
  el.innerHTML=`<span style="color:${ch.color}">${ch.ico} ${ch.name}：「${text}」</span>`;
  if(hasVoiceAccess()&&Math.random()<0.25){
    translateToJP(text).then(jp=>{
      const vid=ch.voiceId||VOICE_ID;
      return fetch('/.netlify/functions/tts',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(ttsBody(jp,vid))});
    }).then(r=>r.json()).then(d=>{
      if(d.data?.audio){const a=new Audio('data:audio/mp3;base64,'+d.data.audio);a.play().catch(()=>{});}
    }).catch(()=>{});
  }
}
function initMine(rows,cols,mines,diff){
  document.querySelectorAll('.mine-diff').forEach(b=>{b.style.borderColor='var(--border)';b.style.background='white';b.style.color='var(--muted)'});
  const btn=document.getElementById('md-'+diff);
  if(btn){btn.style.borderColor='var(--p400)';btn.style.background='var(--p100)';btn.style.color='var(--p600)';}
  if(_mine.timer)clearInterval(_mine.timer);
  const grid=[];
  for(let r=0;r<rows;r++){grid[r]=[];for(let c=0;c<cols;c++)grid[r][c]={mine:false,revealed:false,flagged:false,adj:0};}
  let placed=0;
  while(placed<mines){const r=Math.floor(Math.random()*rows),c=Math.floor(Math.random()*cols);if(!grid[r][c].mine){grid[r][c].mine=true;placed++;}}
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(grid[r][c].mine)continue;let cnt=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc].mine)cnt++;}grid[r][c].adj=cnt;}
  _mine={grid,rows,cols,mines,flagged:0,revealed:0,over:false,won:false,time:0,timer:null,diff,playerTurn:true};
  _mine.timer=setInterval(()=>{if(!_mine.over){_mine.time++;const el=document.getElementById('mineTimer');if(el)el.textContent='⏱ '+_mine.time+'s';}},1000);
  document.getElementById('mineResult').style.display='none';
  showMineDanmaku(pick(MINE_COMMENTS[_mineChar]?.taunt||['来吧。']));
  updateMineTurn();renderMineGrid();
}
function updateMineTurn(){
  const el=document.getElementById('mineTurn');if(!el)return;
  const ch=CHAR_PACKS[_mineChar];
  el.textContent=_mine.playerTurn?'🫵 你的回合':ch.ico+' '+ch.name+'思考中…';
  el.style.color=_mine.playerTurn?'var(--p500)':ch.color;
}
function renderMineGrid(){
  const{grid,rows,cols}=_mine;const el=document.getElementById('mineGrid');if(!el)return;
  const sz=Math.min(Math.floor((window.innerWidth-80)/cols),32);
  el.style.gridTemplateColumns=`repeat(${cols},${sz}px)`;el.innerHTML='';
  const NC=['','#1976D2','#388E3C','#D32F2F','#7B1FA2','#FF8F00','#0097A7','#424242','#78909C'];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const cell=grid[r][c];const d=document.createElement('div');
    d.style.cssText=`width:${sz}px;height:${sz}px;border-radius:${sz>24?6:4}px;display:flex;align-items:center;justify-content:center;font-size:${sz>24?13:11}px;font-weight:700;cursor:pointer;user-select:none;-webkit-user-select:none;transition:all .12s`;
    if(cell.revealed){
      d.style.background=cell.revBy==='ai'?'rgba(200,230,255,.9)':'rgba(255,255,255,.9)';
      d.style.boxShadow='inset 0 1px 3px rgba(0,0,0,.08)';
      if(cell.mine){d.textContent='💣';d.style.background='#FFCDD2';}
      else if(cell.adj>0){d.textContent=cell.adj;d.style.color=NC[cell.adj];}
    }else{
      d.style.background='linear-gradient(135deg,#A5D6A7,#66BB6A)';
      d.style.boxShadow='0 2px 4px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.3)';
      if(cell.flagged){d.textContent='🚩';d.style.background='linear-gradient(135deg,#FFE082,#FFB74D)';}
    }
    d.addEventListener('click',()=>mineClick(r,c));
    let lt;
    d.addEventListener('touchstart',(e)=>{lt=setTimeout(()=>{e.preventDefault();mineFlag(r,c);},400);},{passive:false});
    d.addEventListener('touchend',()=>clearTimeout(lt));d.addEventListener('touchmove',()=>clearTimeout(lt));
    d.addEventListener('contextmenu',(e)=>{e.preventDefault();mineFlag(r,c);});
    el.appendChild(d);
  }
  document.getElementById('mineCount').textContent='🎾 '+(_mine.mines-_mine.flagged);
}
function mineClick(r,c){
  if(_mine.over||!_mine.playerTurn)return;
  const cell=_mine.grid[r][c];if(cell.flagged||cell.revealed)return;
  if(cell.mine){cell.revealed=true;cell.revBy='player';_mine.over=true;revealAll();showMineResult(false);return;}
  floodReveal(r,c,'player');
  if(Math.random()<0.35)showMineDanmaku(pick(MINE_COMMENTS[_mineChar]?.safe||['嗯。']));
  if(checkMineWin(true))return;
  _mine.playerTurn=false;updateMineTurn();renderMineGrid();
  setTimeout(()=>aiMineTurn(),600+Math.random()*800);
}
function aiMineTurn(){
  if(_mine.over)return;const{grid,rows,cols}=_mine;
  const unrevealed=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(!grid[r][c].revealed&&!grid[r][c].flagged)unrevealed.push({r,c});}
  if(!unrevealed.length)return;
  /* AI策略按角色风格 */
  const safeCand=unrevealed.filter(({r,c})=>{for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc].revealed&&grid[nr][nc].adj>0)return true;}return false;});
  const sw=_mineChar==='yukimura'?0.85:_mineChar==='fuji'?0.65:0.4;
  const choice=safeCand.length&&Math.random()<sw?safeCand[Math.floor(Math.random()*safeCand.length)]:unrevealed[Math.floor(Math.random()*unrevealed.length)];
  const cell=grid[choice.r][choice.c];
  if(cell.mine){cell.revealed=true;cell.revBy='ai';_mine.over=true;revealAll();showMineDanmaku(pick(MINE_COMMENTS[_mineChar]?.aiBoom||['失误了。']));showMineResult(true);return;}
  floodReveal(choice.r,choice.c,'ai');
  if(Math.random()<0.3)showMineDanmaku(pick(MINE_COMMENTS[_mineChar]?.aiSafe||['轮到你了。']));
  if(checkMineWin(false))return;
  _mine.playerTurn=true;updateMineTurn();renderMineGrid();
}
function mineFlag(r,c){if(_mine.over||!_mine.playerTurn)return;const cell=_mine.grid[r][c];if(cell.revealed)return;cell.flagged=!cell.flagged;_mine.flagged+=cell.flagged?1:-1;renderMineGrid();}
function floodReveal(r,c,by){const{grid,rows,cols}=_mine;if(r<0||r>=rows||c<0||c>=cols)return;const cell=grid[r][c];if(cell.revealed||cell.flagged||cell.mine)return;cell.revealed=true;cell.revBy=by;_mine.revealed++;if(cell.adj===0){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)floodReveal(r+dr,c+dc,by);}}
function checkMineWin(playerWon){const total=_mine.rows*_mine.cols;if(_mine.revealed>=total-_mine.mines){_mine.over=true;_mine.won=true;revealAll();showMineResult(playerWon);return true;}return false;}
function revealAll(){_mine.grid.forEach(row=>row.forEach(c=>{c.revealed=true}));renderMineGrid();}
function showMineResult(playerWon){
  clearInterval(_mine.timer);ensureGameStats();
  const affAmt=playerWon?(_mine.diff==='hard'?5:_mine.diff==='med'?3:2):0;
  if(playerWon){S.gameStats.mineWins++;gameAffUp(affAmt);}sv();
  const ch=CHAR_PACKS[_mineChar];
  const comments=MINE_COMMENTS[_mineChar]||MINE_COMMENTS.yukimura;
  const msg=playerWon?pick(comments.aiBoom||['你赢了。']):pick(comments.playerBoom||['再来。']);
  const el=document.getElementById('mineResult');
  if(el){el.style.display='block';
    el.innerHTML=`<div style="background:${playerWon?'linear-gradient(135deg,#E8F5E9,#C8E6C9)':'linear-gradient(135deg,#FFEBEE,#FFCDD2)'};border-radius:14px;padding:16px;text-align:center">
      <div style="font-size:32px;margin-bottom:6px">${playerWon?'🎉':'💥'}</div>
      <div style="font-size:16px;font-weight:700;color:${playerWon?'#2E7D32':'#C62828'};margin-bottom:4px">${playerWon?'你赢了！':ch.name+'赢了'}</div>
      <div style="font-size:13px;color:var(--text);margin-bottom:4px;line-height:1.6">${ch.ico} ${ch.name}：「${msg}」</div>
      ${playerWon?`<div style="font-size:12px;color:${ch.color};font-weight:700">好感 +${affAmt} · 用时 ${_mine.time}s</div>`:''}
      <button onclick="initMine(${_mine.rows},${_mine.cols},${_mine.mines},'${_mine.diff}')" style="margin-top:10px;padding:8px 24px;border-radius:12px;background:linear-gradient(135deg,var(--p500),var(--p700));color:white;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">再来一局</button>
    </div>`;}
}

/* ══ 色彩整理（Color Sort） ══ */
let _sort={};
function openColorSort(){
  os('🧪 网球色彩整理',`
    <div id="sortContainer" style="text-align:center">
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.6">把同色的球归到同一个管子里<br/>点击管子选取最上面的球，再点目标管放入</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px">
        <button onclick="initSort(4,4)" class="sort-diff" id="sd-easy" style="padding:6px 14px;border-radius:10px;border:2px solid var(--p400);background:var(--p100);color:var(--p600);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">简单 4色</button>
        <button onclick="initSort(5,4)" class="sort-diff" id="sd-med" style="padding:6px 14px;border-radius:10px;border:2px solid var(--border);background:white;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">中等 5色</button>
        <button onclick="initSort(6,4)" class="sort-diff" id="sd-hard" style="padding:6px 14px;border-radius:10px;border:2px solid var(--border);background:white;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">困难 6色</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 4px">
        <span style="font-size:13px;font-weight:700;color:var(--p600)" id="sortMoves">步数：0</span>
        <button onclick="undoSort()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border);background:var(--p50);color:var(--p500);font-size:11px;cursor:pointer;font-family:inherit;font-weight:600">↩ 撤销</button>
      </div>
      <div id="sortArea" style="display:flex;gap:6px;justify-content:center;align-items:flex-end;flex-wrap:wrap;min-height:200px;padding:10px 0"></div>
      <div id="sortResult" style="margin-top:10px;display:none"></div>
    </div>
  `);
  setTimeout(()=>initSort(4,4),100);
}
function initSort(numColors,perTube){
  document.querySelectorAll('.sort-diff').forEach(b=>{b.style.borderColor='var(--border)';b.style.background='white';b.style.color='var(--muted)'});
  const diffId=numColors<=4?'sd-easy':numColors<=5?'sd-med':'sd-hard';
  const btn=document.getElementById(diffId);
  if(btn){btn.style.borderColor='var(--p400)';btn.style.background='var(--p100)';btn.style.color='var(--p600)';}
  const colors=SORT_COLORS.slice(0,numColors);
  const balls=[];
  colors.forEach((c,ci)=>{for(let i=0;i<perTube;i++)balls.push(ci);});
  /* shuffle */
  for(let i=balls.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[balls[i],balls[j]]=[balls[j],balls[i]];}
  /* fill tubes */
  const tubes=[];
  for(let t=0;t<numColors;t++){tubes.push(balls.slice(t*perTube,(t+1)*perTube));}
  /* add 2 empty tubes */
  tubes.push([]);tubes.push([]);
  _sort={tubes,numColors,perTube,colors,selected:null,moves:0,history:[],over:false};
  document.getElementById('sortResult').style.display='none';
  renderSort();
}
function renderSort(){
  const{tubes,colors,perTube,selected}=_sort;
  const area=document.getElementById('sortArea');if(!area)return;
  document.getElementById('sortMoves').textContent='步数：'+_sort.moves;
  const tubeH=perTube*32+16;
  area.innerHTML=tubes.map((tube,ti)=>{
    const isSelected=selected===ti;
    const balls=tube.map((ci,bi)=>{
      const c=colors[ci];
      const isTop=bi===tube.length-1;
      return `<div style="width:36px;height:28px;border-radius:14px;background:${c.hex};box-shadow:inset 0 -3px 0 ${c.dark},inset 0 3px 6px ${c.light},0 1px 3px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s ease${isTop&&isSelected?';transform:translateY(-12px);box-shadow:inset 0 -3px 0 '+c.dark+',inset 0 3px 6px '+c.light+',0 4px 12px rgba(0,0,0,.25)':''}">${isTop?c.emoji:''}</div>`;
    }).reverse().join('');
    return `<div onclick="sortTap(${ti})" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:transform .15s${isSelected?';transform:scale(1.05)':''}">
      <div style="width:44px;min-height:${tubeH}px;background:${isSelected?'rgba(139,107,192,.15)':'rgba(232,224,245,.4)'};border:2px solid ${isSelected?'var(--p400)':'var(--border)'};border-radius:0 0 16px 16px;border-top:none;padding:4px 2px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;transition:all .2s">
        ${balls}
      </div>
    </div>`;
  }).join('');
}
function sortTap(ti){
  if(_sort.over)return;
  const{tubes,perTube}=_sort;
  if(_sort.selected===null){
    if(tubes[ti].length===0)return;
    _sort.selected=ti;
  }else{
    const from=_sort.selected;
    if(from===ti){_sort.selected=null;renderSort();return;}
    const to=ti;
    if(tubes[to].length>=perTube){_sort.selected=null;renderSort();toast('管子满了');return;}
    const ball=tubes[from][tubes[from].length-1];
    if(tubes[to].length>0){
      const topTo=tubes[to][tubes[to].length-1];
      if(topTo!==ball){_sort.selected=null;renderSort();toast('只能放同色球');return;}
    }
    /* move */
    _sort.history.push({from,to});
    tubes[from].pop();
    tubes[to].push(ball);
    _sort.moves++;
    _sort.selected=null;
    checkSortWin();
  }
  renderSort();
}
function undoSort(){
  if(_sort.over||!_sort.history.length)return;
  const{from,to}=_sort.history.pop();
  const ball=_sort.tubes[to].pop();
  _sort.tubes[from].push(ball);
  _sort.moves--;
  _sort.selected=null;
  renderSort();
}
function checkSortWin(){
  const{tubes,numColors,perTube,colors}=_sort;
  let solved=0;
  tubes.forEach(t=>{
    if(t.length===perTube&&t.every(b=>b===t[0]))solved++;
    if(t.length===0){}/* empty is ok */
  });
  if(solved>=numColors){
    _sort.over=true;
    ensureGameStats();
    const affAmt=3;
    S.gameStats.sortWins++;
    gameAffUp(affAmt);
    sv();
    const msg=YUKI_WIN[Math.floor(Math.random()*YUKI_WIN.length)];
    const el=document.getElementById('sortResult');
    if(el){
      el.style.display='block';
      el.innerHTML=`
        <div style="background:linear-gradient(135deg,#EDE7F6,#D1C4E9);border-radius:14px;padding:16px;text-align:center">
          <div style="font-size:32px;margin-bottom:6px">✨</div>
          <div style="font-size:16px;font-weight:700;color:var(--p700);margin-bottom:4px">完美整理！</div>
          <div style="font-size:13px;color:var(--text);margin-bottom:4px;line-height:1.6">幸村：「${msg}」</div>
          <div style="font-size:12px;color:var(--p500);font-weight:700">好感 +${affAmt} · ${_sort.moves}步完成</div>
          <button onclick="initSort(${_sort.numColors},${_sort.perTube})" style="margin-top:10px;padding:8px 24px;border-radius:12px;background:linear-gradient(135deg,var(--p500),var(--p700));color:white;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">再来一局</button>
        </div>`;
    }
  }
}

