/* ══════════════════════════════════════════
   shop.js — Shop + character packs
   ══════════════════════════════════════════ */

/* active:true 表示已安装角色包（有素材），false 表示锁定 */
/* 添加新角色：1.在此注册 2.准备素材 3.设active:true */
/* 获取已激活角色列表（兼容旧PRINCES引用） */
/* getActivePrinces：只返回已解锁的角色（用于所有用户交互） */
function getActivePrinces(){return Object.entries(CHAR_PACKS).filter(([k,v])=>v.active&&S.unlockedChars.includes(k)).map(([k,v])=>({id:k,...v}));}
/* getInstalledPrinces：返回所有已安装角色（不管是否解锁，用于激活码选择器等） */
function getInstalledPrinces(){return Object.entries(CHAR_PACKS).filter(([k,v])=>v.active).map(([k,v])=>({id:k,...v}));}
function getAllPrinces(){return Object.entries(CHAR_PACKS).map(([k,v])=>({id:k,...v}));}
function princeName(id){return CHAR_PACKS[id]?.name||id}
function princeIco(id){return CHAR_PACKS[id]?.ico||'👤'}


function getShopDate(){return new Date().toLocaleDateString('zh-CN')}
function getRefreshTime(){const n=new Date(),nx=new Date(n);nx.setHours(8,0,0,0);if(n>=nx)nx.setDate(nx.getDate()+1);return nx;}
function needsRefresh(){
  if(!S.shop||!S.shop.date)return true;
  const now=new Date(),today=getShopDate();
  if(S.shop.date!==today&&now.getHours()>=8)return true;
  if(S.shop.date!==today&&S.shop.date!==new Date(Date.now()-86400000).toLocaleDateString('zh-CN'))return true;
  return false;
}
function generateShopItems(){
  const rr=Math.random();
  const activeIds=getActivePrinces().map(p=>p.id);
  const activeMerch=MERCH_POOL.filter(m=>activeIds.includes(m.prince));
  const mPool=rr<0.12?activeMerch.filter(m=>m.rarity==='rare'):activeMerch.filter(m=>m.rarity==='normal');
  const merch=(mPool.length?mPool:activeMerch)[Math.floor(Math.random()*(mPool.length||activeMerch.length))];
  const seed=SEED_POOL_SHOP[Math.floor(Math.random()*SEED_POOL_SHOP.length)];
  const gi=Math.floor(Math.random()*GIFT_POOL.length);
  const gift=GIFT_POOL[gi];
  const sh=[...CARD_SHOP_POOL].sort(()=>Math.random()-0.5);
  return[
    {sid:rid(),cat:'merch',name:merch.name,prince:merch.prince,type:merch.type,price:merch.price,rarity:merch.rarity,img:merch.img,limit:1,bought:0},
    {sid:rid(),cat:'seed',name:seed.name,flower:seed.flower,price:seed.price,img:seed.img,limit:3,bought:0},
    {sid:rid(),cat:'gift',name:gift.name,price:gift.price,affUp:gift.affUp,img:gift.img,limit:1,bought:0},
    {sid:rid(),cat:'card',cardId:sh[0].id,name:sh[0].name,desc:sh[0].desc,price:sh[0].price,img:sh[0].img,limit:sh[0].limit,bought:0},
    {sid:rid(),cat:'card',cardId:sh[1].id,name:sh[1].name,desc:sh[1].desc,price:sh[1].price,img:sh[1].img,limit:sh[1].limit,bought:0},
  ];
}
function refreshShop(){if(!S.shop)S.shop={};S.shop.date=getShopDate();S.shop.items=generateShopItems();sv();}
function ensureShop(){if(needsRefresh())refreshShop();}

function renderShop(){
  ensureShop();
  document.getElementById('shopWallet').textContent='¥'+(S.wallet||0).toFixed(0);
  document.getElementById('shopDateLabel').textContent=S.shop.date+' 上新';
  const grid=document.getElementById('shopGrid');if(!grid)return;
  grid.innerHTML='';
  const catLabel={merch:'👑 王子周边',seed:'🌱 花花种子',gift:'🎁 限定礼物',card:'🃏 道具卡'};
  const catBg={merch:'linear-gradient(135deg,#FFD700,#FF8C00)',seed:'linear-gradient(135deg,#66BB6A,#388E3C)',gift:'linear-gradient(135deg,#EC407A,#AD1457)',card:'linear-gradient(135deg,var(--p400),var(--p600))'};
  (S.shop.items||[]).forEach((item,i)=>{
    const out=item.bought>=item.limit;
    const d=document.createElement('div');
    d.style.cssText='background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border);'+(out?'opacity:.5;':'');
    d.innerHTML=`<div style="display:flex;gap:12px;padding:14px">
      <div style="width:54px;height:54px;border-radius:14px;background:${catBg[item.cat]};display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)">${item.img}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
          <span style="font-size:8.5px;padding:1px 5px;border-radius:6px;color:white;background:${catBg[item.cat]};font-weight:700">${catLabel[item.cat]}</span>
          ${item.rarity==='rare'?'<span style="font-size:8.5px;padding:1px 5px;border-radius:6px;background:linear-gradient(135deg,#FFD700,#FF6B00);color:white;font-weight:700">✦稀有</span>':''}
        </div>
        <div style="font-size:14px;font-weight:600;margin-top:3px">${esc(item.name)}</div>
        ${item.desc?`<div style="font-size:11px;color:var(--muted);margin-top:1px">${esc(item.desc)}</div>`:''}
        ${item.prince?`<div style="font-size:10px;color:var(--p400);margin-top:1px">${princeIco(item.prince)} ${princeName(item.prince)}</div>`:''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
          <div><span style="font-size:16px;font-weight:800;color:var(--p600)">¥${item.price}</span><span style="font-size:10px;color:var(--muted);margin-left:4px">限购${item.limit}</span></div>
          ${out?'<span style="font-size:11px;color:var(--muted);font-weight:600;padding:5px 12px;background:var(--bg);border-radius:14px">已售罄</span>':`<button onclick="buyShopItem(${i})" style="padding:5px 14px;border-radius:14px;background:linear-gradient(135deg,var(--p600),var(--p400));color:white;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(94,63,168,.3)">购买</button>`}
        </div>
      </div>
    </div>`;
    grid.appendChild(d);
  });
}

function buyShopItem(idx){
  ensureShop();const item=S.shop.items[idx];if(!item)return;
  if(item.bought>=item.limit){toast('今日已售罄');return;}
  if((S.wallet||0)<item.price){toast('💰 余额不足！需要¥'+item.price);return;}
  S.wallet=+((S.wallet||0)-item.price).toFixed(2);item.bought++;
  if(!S.bag)S.bag={merch:[],seeds:[],gifts:[],cards:{}};
  if(item.cat==='merch') S.bag.merch.push({name:item.name,prince:item.prince,type:item.type,rarity:item.rarity,img:item.img,ts:Date.now()});
  else if(item.cat==='seed') S.bag.seeds.push({name:item.name,flower:item.flower,img:item.img,ts:Date.now()});
  else if(item.cat==='gift') S.bag.gifts.push({name:item.name,affUp:item.affUp,img:item.img,ts:Date.now()});
  else if(item.cat==='card') S.bag.cards[item.cardId]=(S.bag.cards[item.cardId]||0)+1;
  sv();uwb();renderShop();toast('🛍️ 购买成功！'+item.name);
}

function openBag(){
  if(!S.bag)S.bag={merch:[],seeds:[],gifts:[],cards:{}};
  const b=S.bag;
  let h='<div style="display:flex;flex-direction:column;gap:10px;max-height:58vh;overflow-y:auto;text-align:left">';
  /* 道具卡 */
  h+='<div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px">🃏 道具卡</div>';
  const cn={likeCard:{n:'好感卡',i:'💗'},phoneCard:{n:'电话卡',i:'📞'},advLikeCard:{n:'高级好感卡',i:'💖'},fertCard:{n:'施肥卡',i:'🌿'}};
  let hc=false;
  Object.entries(b.cards||{}).forEach(([k,v])=>{if(v<=0)return;hc=true;const c=cn[k]||{n:k,i:'🃏'};
    h+=`<div style="display:flex;align-items:center;gap:10px;background:var(--p50);padding:8px 12px;border-radius:12px"><span style="font-size:20px">${c.i}</span><div style="flex:1"><div style="font-size:13px;font-weight:600">${c.n}</div><div style="font-size:11px;color:var(--muted)">×${v}</div></div><button onclick="useCard('${k}')" style="padding:4px 12px;border-radius:12px;background:var(--p500);color:white;border:none;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">使用</button></div>`;
  });
  if(!hc) h+='<div style="font-size:12px;color:var(--muted);padding:4px 0">暂无</div>';
  /* 周边 */
  h+='<div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-top:2px">👑 周边 ('+b.merch.length+')</div>';
  if(b.merch.length){h+='<div style="display:flex;flex-wrap:wrap;gap:5px">';b.merch.forEach(m=>{h+=`<div style="padding:3px 8px;border-radius:8px;background:${m.rarity==='rare'?'#FFF3E0':'var(--p50)'};font-size:10px;border:1px solid ${m.rarity==='rare'?'#FFB74D':'var(--border)'}">${m.img} ${m.name}</div>`;});h+='</div>';}
  else h+='<div style="font-size:12px;color:var(--muted);padding:4px 0">暂无</div>';
  /* 种子 */
  h+='<div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-top:2px">🌱 种子 ('+b.seeds.length+')</div>';
  if(b.seeds.length){h+='<div style="display:flex;flex-wrap:wrap;gap:5px">';b.seeds.forEach(s=>{h+=`<div style="padding:3px 8px;border-radius:8px;background:#E8F5E9;font-size:10px;border:1px solid #C8E6C9">${s.img} ${s.name}</div>`;});h+='</div>';}
  else h+='<div style="font-size:12px;color:var(--muted);padding:4px 0">暂无</div>';
  /* 礼物 */
  h+='<div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-top:2px">🎁 礼物 ('+b.gifts.length+')</div>';
  if(b.gifts.length){h+='<div style="display:flex;flex-direction:column;gap:4px">';b.gifts.forEach((g,i)=>{h+=`<div style="display:flex;align-items:center;gap:8px;background:#FCE4EC;padding:6px 10px;border-radius:10px;font-size:11px;border:1px solid #F8BBD0"><span style="font-size:18px">${g.img}</span><span style="flex:1">${g.name}</span><button onclick="useGift(${i})" style="padding:3px 10px;border-radius:10px;background:#EC407A;color:white;border:none;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit">赠送</button></div>`;});h+='</div>';}
  else h+='<div style="font-size:12px;color:var(--muted);padding:4px 0">暂无</div>';
  h+='</div>';os('🎒 我的背包',h);
}

function useCard(cardId){
  if(!S.bag?.cards?.[cardId]||S.bag.cards[cardId]<=0){toast('没有这张卡了');return;}cs();
  if(!S.princeAff)S.princeAff={};
  if(cardId==='likeCard'){
    const sh=[...getActivePrinces()].sort(()=>Math.random()-0.5);const p1=sh[0],p2=sh[1];
    S.princeAff[p1.id]=(S.princeAff[p1.id]||0)+3;S.princeAff[p2.id]=(S.princeAff[p2.id]||0)+3;
    if(p1.id==='yukimura'||p2.id==='yukimura')S.aff=(S.aff||0)+3;
    S.bag.cards[cardId]--;sv();uab();toast('💗 '+p1.name+' 和 '+p2.name+' 好感+3！');
  }else if(cardId==='advLikeCard'){
    let btns=getActivePrinces().map(p=>`<button onclick="applyAdvLike('${p.id}')" style="padding:8px 4px;border-radius:12px;background:var(--p50);border:1px solid var(--border);cursor:pointer;font-family:inherit;font-size:11px;text-align:center">${p.ico}<br/>${p.name}<br/><span style="font-size:9px;color:var(--p400)">Lv${(S.princeAff[p.id])||0}</span></button>`).join('');
    os('💖 选择角色',`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">选择一名角色 好感+3</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${btns}</div>`);
  }else if(cardId==='phoneCard'){
    let btns=getActivePrinces().map(p=>{const af=(S.princeAff[p.id])||0;const yaf=p.id==='yukimura'?(S.aff||0):af;const ok=yaf>=50;
      return`<button ${ok?`onclick="activatePhone('${p.id}')"`:'disabled'} style="padding:8px 4px;border-radius:12px;background:${ok?'var(--p50)':'#f5f5f5'};border:1px solid ${ok?'var(--border)':'#eee'};cursor:${ok?'pointer':'not-allowed'};font-family:inherit;font-size:11px;text-align:center;${ok?'':'opacity:.5'}">${p.ico}<br/>${p.name}<br/><span style="font-size:9px;color:${ok?'#4CAF50':'var(--muted)'}">Lv${yaf}${ok?' ✓':''}</span></button>`;
    }).join('');
    os('📞 选择角色',`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">好感≥50可激活来电</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${btns}</div>`);
  }else if(cardId==='fertCard'){
    S.bag.cards[cardId]--;
    if(S.garden?.plants){S.garden.plants.forEach(p=>{if(p?.plantedAt)p.plantedAt-=2*3600000;});};
    sv();toast('🌿 施肥卡已使用！植物加速2小时');
  }
}
function applyAdvLike(pid){
  if(!S.bag?.cards?.advLikeCard||S.bag.cards.advLikeCard<=0){toast('没有高级好感卡了');return;}
  if(!S.princeAff)S.princeAff={};S.princeAff[pid]=(S.princeAff[pid]||0)+3;
  if(pid==='yukimura')S.aff=(S.aff||0)+3;S.bag.cards.advLikeCard--;sv();uab();cs();
  toast('💖 '+princeName(pid)+' 好感+3！');
}
function activatePhone(pid){
  if(!S.bag?.cards?.phoneCard||S.bag.cards.phoneCard<=0){toast('没有电话卡了');return;}
  S.bag.cards.phoneCard--;if(!S.phoneReady)S.phoneReady=[];
  S.phoneReady.push({prince:pid,ts:Date.now()});sv();cs();
  toast('📞 '+princeName(pid)+' 的来电已激活！');
}
function useGift(idx){
  if(!S.bag?.gifts?.[idx]){toast('找不到礼物');return;}
  const g=S.bag.gifts[idx];cs();
  let btns=getActivePrinces().map(p=>`<button onclick="giveGiftTo(${idx},'${p.id}')" style="padding:8px 4px;border-radius:12px;background:var(--p50);border:1px solid var(--border);cursor:pointer;font-family:inherit;font-size:11px;text-align:center">${p.ico}<br/>${p.name}</button>`).join('');
  os('🎁 赠送 '+g.name,`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">好感+${g.affUp}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${btns}</div>`);
}
function giveGiftTo(gi,pid){
  const g=S.bag.gifts[gi];if(!g)return;
  if(!S.princeAff)S.princeAff={};S.princeAff[pid]=(S.princeAff[pid]||0)+g.affUp;
  if(pid==='yukimura')S.aff=(S.aff||0)+g.affUp;
  S.bag.gifts.splice(gi,1);sv();uab();cs();
  toast('🎁 '+princeName(pid)+' 收到了'+g.name+'！好感+'+g.affUp);
}
function updateShopTimer(){
  const diff=getRefreshTime()-Date.now();if(diff<=0){ensureShop();renderShop();return;}
  const hh=Math.floor(diff/3600000),mm=Math.floor((diff%3600000)/60000),ss=Math.floor((diff%60000)/1000);
  const el=document.getElementById('shopRefreshHint');
  if(el)el.textContent='下次上新：'+hh.toString().padStart(2,'0')+':'+mm.toString().padStart(2,'0')+':'+ss.toString().padStart(2,'0');
}
setInterval(updateShopTimer,1000);

