/* ══════════════════════════════════════════
   garden.js — Garden system
   ══════════════════════════════════════════ */

function ensureGarden(){
  if(!S.garden) S.garden={plants:[null,null,null],deskDecor:[],shelfDecor:[],flowers:{},desserts:[]};
  if(!S.garden.plants) S.garden.plants=[null,null,null];
  if(!S.garden.deskDecor) S.garden.deskDecor=[];
  if(!S.garden.shelfDecor) S.garden.shelfDecor=[];
  if(!S.garden.flowers) S.garden.flowers={};
  if(!S.garden.desserts) S.garden.desserts=[];
}

function showGardenArea(area){
  ['room','balcony','kitchen'].forEach(a=>{
    const el=document.getElementById('garden-'+a);
    if(el) el.style.display=a===area?'flex':'none';
    const btn=document.getElementById('ga-'+a);
    if(btn){btn.style.borderColor=a===area?'var(--p500)':'var(--border)';btn.style.background=a===area?'var(--p100)':'white';btn.style.color=a===area?'var(--p600)':'var(--muted)';}
  });
  if(area==='room') renderRoom();
  if(area==='balcony') renderBalcony();
  if(area==='kitchen') renderKitchen();
}

/* ── 房间 ── */
function renderRoom(){
  ensureGarden();
  const totalMerch=MERCH_POOL.length;
  const owned=(S.bag?.merch||[]).length;
  const uniqueOwned=[...new Set((S.bag?.merch||[]).map(m=>m.name))].length;
  const rate=totalMerch?Math.round(uniqueOwned/totalMerch*100):0;
  document.getElementById('collectRate').textContent=rate+'%';
  document.getElementById('collectBar').style.width=rate+'%';
  document.getElementById('collectDetail').textContent='已收集 '+uniqueOwned+' / '+totalMerch+' 种';
  /* 书桌 */
  const desk=document.getElementById('deskArea');
  if(desk){
    if(S.garden.deskDecor.length){
      desk.innerHTML=S.garden.deskDecor.map((d,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer" onclick="removeDecor('desk',${i})" title="点击移除"><div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,var(--p100),var(--p50));display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid var(--border);box-shadow:0 2px 6px rgba(0,0,0,.06)">${d.img}</div><span style="font-size:8px;color:var(--muted);max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.name.split('·')[1]||d.name}</span></div>`).join('');
    }else{
      desk.innerHTML='<div style="width:100%;text-align:center;padding:12px 0;color:var(--muted);font-size:12px">空空的桌面…去桃宝买些周边来装饰吧</div>';
    }
  }
  /* 书架 */
  const shelf=document.getElementById('shelfArea');
  if(shelf){
    if(S.garden.shelfDecor.length){
      shelf.innerHTML=S.garden.shelfDecor.map((d,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer" onclick="removeDecor('shelf',${i})" title="点击移除"><div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#FFF3E0,#FFE0B2);display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid #FFE0B2;box-shadow:0 2px 6px rgba(0,0,0,.06)">${d.img}</div><span style="font-size:8px;color:var(--muted);max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.name.split('·')[1]||d.name}</span></div>`).join('');
    }else{
      shelf.innerHTML='<div style="width:100%;text-align:center;padding:12px 0;color:var(--muted);font-size:12px">空空的书架…放些收藏品上去？</div>';
    }
  }
  /* 花瓶 */
  const vase=document.getElementById('vaseArea');
  if(vase){
    const fl=S.garden.flowers;
    const keys=Object.keys(fl).filter(k=>fl[k]>0);
    if(keys.length){
      vase.innerHTML=keys.map(k=>`<div style="padding:4px 10px;border-radius:10px;background:#FCE4EC;font-size:11px;border:1px solid #F8BBD0">${FLOWER_ICO[k]||'🌸'} ${k} ×${fl[k]}</div>`).join('');
    }else{
      vase.innerHTML='<div style="font-size:12px;color:var(--muted)">还没有收获花朵</div>';
    }
  }
}


function decorDesk(){
  ensureGarden();
  const avail=(S.bag?.merch||[]).filter(m=>!S.garden.deskDecor.some(d=>d.ts===m.ts)&&!S.garden.shelfDecor.some(d=>d.ts===m.ts));
  if(!avail.length){toast('没有可用的周边，去桃宝买一些吧');return;}
  let btns=avail.map((m,i)=>`<button onclick="placeDecor('desk',${i})" style="padding:6px 10px;border-radius:10px;background:var(--p50);border:1px solid var(--border);cursor:pointer;font-family:inherit;font-size:11px;text-align:center">${m.img} ${m.name}</button>`).join('');
  os('装饰书桌',`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">选择要摆在桌上的周边</div><div style="display:flex;flex-direction:column;gap:6px">${btns}</div>`);
  window._decorAvail=avail;
}
function decorShelf(){
  ensureGarden();
  const avail=(S.bag?.merch||[]).filter(m=>!S.garden.deskDecor.some(d=>d.ts===m.ts)&&!S.garden.shelfDecor.some(d=>d.ts===m.ts));
  if(!avail.length){toast('没有可用的周边，去桃宝买一些吧');return;}
  let btns=avail.map((m,i)=>`<button onclick="placeDecor('shelf',${i})" style="padding:6px 10px;border-radius:10px;background:var(--p50);border:1px solid var(--border);cursor:pointer;font-family:inherit;font-size:11px;text-align:center">${m.img} ${m.name}</button>`).join('');
  os('装饰书架',`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">选择要放在书架上的周边</div><div style="display:flex;flex-direction:column;gap:6px">${btns}</div>`);
  window._decorAvail=avail;
}
function placeDecor(where,idx){
  const m=window._decorAvail?.[idx];if(!m)return;
  ensureGarden();
  if(where==='desk') S.garden.deskDecor.push(m);
  else S.garden.shelfDecor.push(m);
  sv();cs();renderRoom();toast('✨ 已装饰！');
}
function removeDecor(where,idx){
  ensureGarden();
  if(where==='desk') S.garden.deskDecor.splice(idx,1);
  else S.garden.shelfDecor.splice(idx,1);
  sv();renderRoom();toast('已移除');
}

/* ── 阳台 ── */
function renderBalcony(){
  ensureGarden();
  const area=document.getElementById('potArea');if(!area)return;
  area.innerHTML='';
  for(let i=0;i<3;i++){
    const p=S.garden.plants[i];
    const div=document.createElement('div');
    div.style.cssText='background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border)';
    if(!p){
      /* 空花盆 */
      div.innerHTML=`<div style="padding:16px;text-align:center">
        <div style="font-size:36px;margin-bottom:6px;opacity:.3">🪴</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:10px">花盆 ${i+1} · 空</div>
        <button onclick="plantFlower(${i})" style="padding:8px 20px;border-radius:14px;background:linear-gradient(135deg,#66BB6A,#388E3C);color:white;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">🌱 种花</button>
      </div>`;
    }else{
      const now=Date.now();
      const elapsed=now-p.plantedAt;
      const sinceWater=now-(p.lastWatered||p.plantedAt);
      const growTime=10*3600000;/* 10h */
      const wiltTime=5*3600000;/* 5h */
      const isWilted=sinceWater>=wiltTime;
      const isReady=elapsed>=growTime&&!isWilted;
      const progress=Math.min(elapsed/growTime*100,100);
      const waterPct=Math.max(0,100-sinceWater/wiltTime*100);
      const flowerIco=FLOWER_ICO[p.flower]||'🌱';

      if(isWilted){
        div.innerHTML=`<div style="padding:16px;text-align:center">
          <div style="font-size:36px;margin-bottom:4px;filter:grayscale(1) opacity(.5)">🥀</div>
          <div style="font-size:13px;font-weight:600;color:#B71C1C">枯萎了…</div>
          <div style="font-size:11px;color:var(--muted);margin:4px 0 10px">${p.flower} · 超过5小时没有浇水</div>
          <button onclick="removePlant(${i})" style="padding:8px 20px;border-radius:14px;background:#E57373;color:white;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">铲掉重新种</button>
        </div>`;
      }else if(isReady){
        div.innerHTML=`<div style="padding:16px;text-align:center">
          <div style="font-size:42px;margin-bottom:4px;animation:chibiBob 2s ease-in-out infinite">${flowerIco}</div>
          <div style="font-size:14px;font-weight:700;color:#2E7D32">${p.flower} 成熟啦！</div>
          <div style="font-size:11px;color:var(--muted);margin:4px 0 10px">点击收获</div>
          <button onclick="harvestFlower(${i})" style="padding:8px 24px;border-radius:14px;background:linear-gradient(135deg,#FFB74D,#FF9800);color:white;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(255,152,0,.3)">🌸 收获</button>
        </div>`;
      }else{
        const growLeft=growTime-elapsed;
        const gh=Math.floor(growLeft/3600000);
        const gm=Math.floor((growLeft%3600000)/60000);
        div.innerHTML=`<div style="padding:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:32px">${progress<30?'🌱':progress<70?'🌿':flowerIco}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${p.flower}</div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px">成熟还需 ${gh}时${gm}分</div>
              <div style="height:5px;background:var(--p100);border-radius:3px;margin-top:6px;overflow:hidden"><div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#66BB6A,#2E7D32);border-radius:3px;transition:width .5s"></div></div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
            <div style="flex:1">
              <div style="font-size:10px;color:${waterPct<30?'#E53935':'var(--muted)'}">💧 水分 ${Math.round(waterPct)}%</div>
              <div style="height:4px;background:#E3F2FD;border-radius:2px;margin-top:3px;overflow:hidden"><div style="height:100%;width:${waterPct}%;background:${waterPct<30?'#E53935':'#42A5F5'};border-radius:2px;transition:width .5s"></div></div>
            </div>
            <button onclick="waterPlant(${i})" style="padding:5px 14px;border-radius:12px;background:#42A5F5;color:white;border:none;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">💧 浇水</button>
          </div>
        </div>`;
      }
    }
    area.appendChild(div);
  }
}

function plantFlower(potIdx){
  ensureGarden();
  if(!S.bag?.seeds?.length){toast('没有种子，去桃宝买一些吧');return;}
  let btns=S.bag.seeds.map((s,i)=>`<button onclick="doPlant(${potIdx},${i})" style="padding:8px 12px;border-radius:12px;background:#E8F5E9;border:1px solid #C8E6C9;cursor:pointer;font-family:inherit;font-size:12px;display:flex;align-items:center;gap:6px"><span style="font-size:20px">${s.img}</span>${s.name}</button>`).join('');
  os('🌱 选择种子',`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">选择要种在花盆${potIdx+1}的种子</div><div style="display:flex;flex-direction:column;gap:6px">${btns}</div>`);
}
function doPlant(potIdx,seedIdx){
  const seed=S.bag.seeds[seedIdx];if(!seed)return;
  ensureGarden();
  S.garden.plants[potIdx]={flower:seed.flower,img:seed.img,plantedAt:Date.now(),lastWatered:Date.now()};
  S.bag.seeds.splice(seedIdx,1);
  sv();cs();renderBalcony();toast('🌱 '+seed.flower+'已种下！');
}
function waterPlant(idx){
  ensureGarden();
  const p=S.garden.plants[idx];if(!p)return;
  p.lastWatered=Date.now();sv();renderBalcony();toast('💧 浇水成功！');
}
function removePlant(idx){
  ensureGarden();S.garden.plants[idx]=null;sv();renderBalcony();toast('已铲掉，可以重新种了');
}
function harvestFlower(idx){
  ensureGarden();
  const p=S.garden.plants[idx];if(!p)return;
  const count=Math.random()<0.02?3:1;
  S.garden.flowers[p.flower]=(S.garden.flowers[p.flower]||0)+count;
  S.garden.plants[idx]=null;
  sv();renderBalcony();
  if(count===3) toast('🌸🌸🌸 大丰收！收获了3朵'+p.flower+'！');
  else toast('🌸 收获了1朵'+p.flower+'！');
}
/* 阳台定时刷新 */
setInterval(()=>{if(document.getElementById('garden-balcony')?.style.display!=='none')renderBalcony();},30000);

/* ── 厨房 ── */
function renderKitchen(){
  ensureGarden();
  const bag=document.getElementById('dessertBag');if(!bag)return;
  const ds=S.garden.desserts||[];
  if(!ds.length){bag.innerHTML='<div style="font-size:12px;color:var(--muted);text-align:center;padding:8px">还没有做过甜点</div>';return;}
  bag.innerHTML=ds.map((d,i)=>{
    const qColor={普通:'#78909C',美味:'#7B1FA2',超绝:'#FF6F00'};
    const qBg={普通:'#ECEFF1',美味:'#F3E5F5',超绝:'#FFF3E0'};
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${qBg[d.quality]};border-radius:12px;border:1px solid ${d.quality==='超绝'?'#FFE0B2':d.quality==='美味'?'#CE93D8':'#CFD8DC'}">
      <span style="font-size:22px">${d.quality==='超绝'?'🎂':d.quality==='美味'?'🍰':'🧁'}</span>
      <div style="flex:1"><div style="font-size:12px;font-weight:600">${d.name}</div><div style="font-size:10px;color:${qColor[d.quality]};font-weight:700">${d.quality} · 得分${d.score}</div></div>
      <button onclick="giftDessert(${i})" style="padding:4px 10px;border-radius:10px;background:var(--p500);color:white;border:none;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit">赠送</button>
    </div>`;
  }).join('');
}


function startKitchenGame(){
  /* 叠叠乐小游戏 - 在sheet里展示 */
  os('🍰 叠叠乐',`
    <div style="text-align:center">
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px">点击屏幕叠放方块，时机越准得分越高</div>
      <div style="position:relative;width:100%;height:280px;background:linear-gradient(180deg,#FFF8E1,#FFECB3);border-radius:14px;overflow:hidden;margin-bottom:10px;border:1px solid #FFE082" id="stackArena">
        <canvas id="stackCanvas" width="300" height="280" style="width:100%;height:100%"></canvas>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:10px">
        <span style="font-size:14px;font-weight:700;color:var(--p600)" id="stackScore">得分：0</span>
        <span style="font-size:12px;color:var(--muted)" id="stackCombo"></span>
      </div>
      <button onclick="stackDrop()" id="stackBtn" style="padding:12px 40px;border-radius:16px;background:linear-gradient(135deg,#FF8A65,#E64A19);color:white;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 12px rgba(230,74,25,.3)">叠！</button>
    </div>
  `);
  setTimeout(initStackGame,100);
}

let _stack={blocks:[],moving:null,score:0,combo:0,running:false,anim:null};
/* roundRect polyfill */
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);}}
function initStackGame(){
  const canvas=document.getElementById('stackCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  _stack={blocks:[],moving:null,score:0,combo:0,running:true,anim:null,ctx,canvas,w:300,h:280};
  /* 底座 */
  _stack.blocks.push({x:100,y:250,w:100,h:20});
  /* 生成移动方块 */
  spawnBlock();
  drawStack();
}
function spawnBlock(){
  if(!_stack.running)return;
  const last=_stack.blocks[_stack.blocks.length-1];
  const w=Math.max(last.w-2,30);
  _stack.moving={x:0,y:last.y-22,w,h:20,dir:1,speed:2+_stack.blocks.length*0.3};
  animateBlock();
}
function animateBlock(){
  if(!_stack.running||!_stack.moving)return;
  const m=_stack.moving;
  m.x+=m.dir*m.speed;
  if(m.x+m.w>_stack.w) m.dir=-1;
  if(m.x<0) m.dir=1;
  drawStack();
  _stack.anim=requestAnimationFrame(animateBlock);
}
function drawStack(){
  const{ctx,w,h,blocks,moving}=_stack;
  ctx.clearRect(0,0,w,h);
  const hues=['#FF8A65','#FFB74D','#FFD54F','#AED581','#81C784','#4FC3F7','#7986CB','#BA68C8','#F06292','#E57373'];
  blocks.forEach((b,i)=>{
    ctx.fillStyle=hues[i%hues.length];
    ctx.beginPath();
    ctx.roundRect(b.x,b.y,b.w,b.h,4);
    ctx.fill();
  });
  if(moving){
    ctx.fillStyle='#E53935';
    ctx.beginPath();
    ctx.roundRect(moving.x,moving.y,moving.w,moving.h,4);
    ctx.fill();
  }
  document.getElementById('stackScore').textContent='得分：'+_stack.score;
}
function stackDrop(){
  if(!_stack.running||!_stack.moving)return;
  cancelAnimationFrame(_stack.anim);
  const m=_stack.moving;
  const last=_stack.blocks[_stack.blocks.length-1];
  /* 计算重叠 */
  const overlapLeft=Math.max(m.x,last.x);
  const overlapRight=Math.min(m.x+m.w,last.x+last.w);
  const overlap=overlapRight-overlapLeft;
  if(overlap<=0){
    /* 掉落，游戏结束 */
    _stack.running=false;_stack.moving=null;
    drawStack();
    endKitchenGame();return;
  }
  const perfect=overlap>=last.w-4;
  if(perfect){_stack.combo++;_stack.score+=10+_stack.combo*2;document.getElementById('stackCombo').textContent='🔥 Perfect ×'+_stack.combo;}
  else{_stack.combo=0;_stack.score+=Math.round(overlap/last.w*10);document.getElementById('stackCombo').textContent='';}
  _stack.blocks.push({x:overlapLeft,y:m.y,w:overlap,h:m.h});
  _stack.moving=null;
  drawStack();
  /* 画面上移 */
  if(_stack.blocks.length>10){
    _stack.blocks.forEach(b=>b.y+=22);
  }
  if(_stack.blocks.length>=20){_stack.running=false;endKitchenGame();return;}
  spawnBlock();
}
function endKitchenGame(){
  const score=_stack.score;
  const quality=score>=80?'超绝':score>=40?'美味':'普通';
  const affUp=quality==='超绝'?5:quality==='美味'?3:1;
  const name=DESSERT_NAMES[Math.floor(Math.random()*DESSERT_NAMES.length)];
  ensureGarden();
  S.garden.desserts.push({name,quality,score,affUp,ts:Date.now()});
  sv();
  setTimeout(()=>{
    cs();
    os('🍰 甜点完成！',`<div style="text-align:center">
      <div style="font-size:48px;margin-bottom:8px">${quality==='超绝'?'🎂':quality==='美味'?'🍰':'🧁'}</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:4px">${name}</div>
      <div style="font-size:14px;font-weight:700;color:${quality==='超绝'?'#FF6F00':quality==='美味'?'#7B1FA2':'#78909C'};margin-bottom:4px">${quality}！</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px">得分 ${score} · 赠送可增加好感 +${affUp}</div>
      <button class="shbtn p" onclick="cs();showGardenArea('kitchen')">收下甜点</button>
    </div>`);
  },500);
}

function giftDessert(idx){
  ensureGarden();
  const d=S.garden.desserts[idx];if(!d)return;cs();
  let btns=getActivePrinces().map(p=>`<button onclick="giveDessertTo(${idx},'${p.id}')" style="padding:8px 4px;border-radius:12px;background:var(--p50);border:1px solid var(--border);cursor:pointer;font-family:inherit;font-size:11px;text-align:center">${p.ico}<br/>${p.name}</button>`).join('');
  os('🍰 赠送 '+d.name,`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${d.quality} · 好感+${d.affUp}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${btns}</div>`);
}
function giveDessertTo(idx,pid){
  const d=S.garden.desserts[idx];if(!d)return;
  if(!S.princeAff)S.princeAff={};
  S.princeAff[pid]=(S.princeAff[pid]||0)+d.affUp;
  if(pid==='yukimura')S.aff=(S.aff||0)+d.affUp;
  S.garden.desserts.splice(idx,1);sv();uab();cs();
  const reactions={普通:['嗯，谢谢。','收到了。','还不错。'],美味:['很好吃。谢谢你。','手艺不错。','……想再吃一个。'],超绝:['……这个，很好吃。你做的？','每一口都很认真。谢谢。','下次还做给我吧。']};
  const react=(reactions[d.quality]||reactions['普通']);
  toast('🍰 '+princeName(pid)+'：「'+react[Math.floor(Math.random()*react.length)]+'」好感+'+d.affUp);
}

function renderGarden(){ensureGarden();showGardenArea('room');}

