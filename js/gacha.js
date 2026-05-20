/* ══════════════════════════════════════════
   gacha.js — Gacha system
   ══════════════════════════════════════════ */

function pullOne(guaranteeSR){
  const r=Math.random()*100;
  let rarity;
  if(r<3) rarity='SSR';
  else if(r<18||guaranteeSR) rarity='SR';
  else rarity='R';
  const pool=CARD_POOL.filter(c=>c.rarity===rarity);
  return pool[Math.floor(Math.random()*pool.length)];
}

function doPull(n){
  if(!S.gachaPulls)S.gachaPulls=0;
  if(!S.gachaTotal)S.gachaTotal=0;
  /* wallet check */
  const cost=n===1?5:45;
  if((S.wallet||0)<cost){toast('余额不足！当前¥'+(S.wallet||0).toFixed(2));return;}
  S.wallet=+((S.wallet||0)-cost).toFixed(2);
  uwb();
  /* pull */
  const results=[];
  for(let i=0;i<n;i++){
    const isLast=i===n-1;
    const needSR=isLast&&n===10&&!results.some(c=>c.rarity==='SSR'||c.rarity==='SR');
    results.push(pullOne(needSR));
  }
  S.gachaPulls=(S.gachaPulls||0)+n;
  S.gachaTotal=(S.gachaTotal||0)+n;
  /* unlock gallery cards */
  results.forEach(c=>{
    if(c.galleryIdx>=0){
      if(!S.unlocked)S.unlocked=[];
      if(!S.unlocked.includes(c.galleryIdx))S.unlocked.push(c.galleryIdx);
    }
    if(!S.ownedCards)S.ownedCards=[];
    if(!S.ownedCards.includes(c.id))S.ownedCards.push(c.id);
  });
  sv();
  showGachaAnim(results);
  updateGachaUI();
}

function showGachaAnim(cards){
  const anim=document.getElementById('gachaAnim');
  const cardsEl=document.getElementById('gachaCards');
  const btn=document.getElementById('gachaCloseBtn');
  anim.style.display='flex';
  cardsEl.innerHTML='';
  btn.style.display='none';
  const hasSSR=cards.some(c=>c.rarity==='SSR');
  const hasSR=cards.some(c=>c.rarity==='SR');
  /* SSR golden flash */
  if(hasSSR){
    const flash=document.createElement('div');flash.className='gacha-flash';
    document.body.appendChild(flash);setTimeout(()=>flash.remove(),900);
    /* golden particles */
    const ptc=document.createElement('div');ptc.className='gacha-particles';
    for(let i=0;i<30;i++){
      const p=document.createElement('div');p.className='gacha-particle';
      p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';
      p.style.setProperty('--px',(Math.random()-0.5)*200+'px');
      p.style.setProperty('--py',(Math.random()-0.5)*200+'px');
      p.style.background=`hsl(${40+Math.random()*20},100%,${60+Math.random()*30}%)`;
      p.style.width=p.style.height=(2+Math.random()*5)+'px';
      p.style.animationDelay=Math.random()*0.5+'s';
      ptc.appendChild(p);
    }
    document.body.appendChild(ptc);setTimeout(()=>ptc.remove(),2500);
    /* SSR voice placeholder - plays audio/ssr-voice.mp3 if exists */
    try{
      const ssrAudio=new Audio('audio/ssr-voice.mp3');
      ssrAudio.volume=0.8;
      ssrAudio.play().catch(()=>{});
    }catch(e){}
  }
  /* canvas background particles */
  const canvas=document.getElementById('gachaCanvas');
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const baseHue=hasSSR?40:hasSR?270:220;
  let balls=Array.from({length:hasSSR?24:14},()=>({
    x:Math.random()*canvas.width,y:Math.random()*canvas.height,
    vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,
    r:2+Math.random()*6,angle:0,va:(Math.random()-0.5)*0.2,
    color:`hsla(${baseHue+Math.random()*60},80%,${50+Math.random()*30}%,${0.4+Math.random()*0.4})`,
    trail:[]
  }));
  let animRunning=true;
  function drawBall(b){
    /* trail */
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>8)b.trail.shift();
    for(let i=0;i<b.trail.length;i++){
      const a=i/b.trail.length*0.15;
      ctx.beginPath();ctx.arc(b.trail[i].x,b.trail[i].y,b.r*(i/b.trail.length),0,Math.PI*2);
      ctx.fillStyle=b.color.replace(/[\d.]+\)$/,a+')');ctx.fill();
    }
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
    ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);
    ctx.fillStyle=b.color;ctx.fill();
    if(hasSSR){ctx.shadowBlur=12;ctx.shadowColor='rgba(255,200,0,.5)';}
    ctx.restore();
  }
  function animate(){
    if(!animRunning)return;
    ctx.fillStyle=hasSSR?'rgba(20,10,0,.12)':'rgba(13,0,32,.12)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    balls.forEach(b=>{
      b.x+=b.vx;b.y+=b.vy;b.angle+=b.va;
      if(b.x<0||b.x>canvas.width)b.vx*=-1;
      if(b.y<0||b.y>canvas.height)b.vy*=-1;
      drawBall(b);
    });
    requestAnimationFrame(animate);
  }
  animate();
  /* set bg color based on rarity */
  anim.style.background=hasSSR?'linear-gradient(160deg,#1a0a00,#2d1a00)':'#0d0020';
  /* show cards with delay */
  cards.forEach((c,i)=>{
    setTimeout(()=>{
      const div=document.createElement('div');
      div.className='gacha-card '+(c.rarity==='SSR'?'ssr':c.rarity==='SR'?'sr':'');
      div.style.animationDelay=i*0.1+'s';
      const rar=document.createElement('div');
      rar.className='gc-rar';
      rar.style.background=RARITY_COLOR[c.rarity];
      rar.textContent=c.rarity;
      const ph=document.createElement('div');
      ph.className='gacha-card-ph';
      ph.style.background=RARITY_COLOR[c.rarity];
      ph.innerHTML=`<span>${c.rarity==='SSR'?'👑':c.rarity==='SR'?'⭐':'🎾'}</span><span style="font-size:9px;margin-top:4px;color:white;opacity:.8">${c.name}</span>`;
      const img=document.createElement('img');
      img.src=c.img;
      img.onerror=()=>img.style.display='none';
      img.onload=()=>ph.style.display='none';
      div.appendChild(ph);div.appendChild(img);div.appendChild(rar);
      cardsEl.appendChild(div);
      if(i===cards.length-1){
        setTimeout(()=>{btn.style.display='block';animRunning=false;},500);
      }
    },i*(hasSSR?180:120)+(hasSSR?600:300));
  });
}

function closeGachaAnim(){
  document.getElementById('gachaAnim').style.display='none';
  renderGallery();
  updateGachaUI();
}

function updateGachaUI(){
  const pulls=S.gachaPulls||0;
  const total=S.gachaTotal||0;
  const left=10-(pulls%10);
  document.getElementById('pullCount').textContent=total;
  document.getElementById('pullLeft').textContent=left===10?10:left;
  /* owned cards mini display */
  const el=document.getElementById('gachaUnlocked');if(!el)return;
  el.innerHTML=CARD_POOL.map(c=>{
    const owned=(S.ownedCards||[]).includes(c.id);
    const clickFn=owned&&c.galleryIdx>=0?`vc(${c.galleryIdx})`:'';
    return`<div class="unlock-thumb" onclick="${clickFn}" style="cursor:${owned&&c.galleryIdx>=0?'pointer':'default'}">
      ${owned?`<img src="${c.img}" onerror="this.style.display='none'"/><div style="position:absolute;bottom:0;left:0;right:0;padding:3px;background:rgba(0,0,0,.6);font-size:8px;color:white;text-align:center">${c.name}</div>`:
      `<div style="width:100%;aspect-ratio:3/2;background:var(--p100);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:18px;opacity:.3">🔒</div><div style="font-size:8px;color:var(--muted);margin-top:2px;text-align:center">${c.rarity}</div></div>`}
    </div>`;
  }).join('');
}

