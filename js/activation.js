/* ══════════════════════════════════════════
   activation.js — Activation code system
   ══════════════════════════════════════════ */

let _actSelectedChar=null;
let _actValidatedCode=null;
let _actCodeType=null;

/* 设备指纹生成 */
function getDeviceFP(){
  if(S._deviceFP)return S._deviceFP;
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  ctx.textBaseline='top';ctx.font='14px Arial';ctx.fillText('fp:yw',2,2);
  const raw=canvas.toDataURL()+navigator.userAgent+(screen.width||0)+'x'+(screen.height||0)+navigator.language+(new Date().getTimezoneOffset());
  let hash=0;for(let i=0;i<raw.length;i++){hash=((hash<<5)-hash)+raw.charCodeAt(i);hash|=0;}
  const fp='FP'+Math.abs(hash).toString(36);
  S._deviceFP=fp;sv();
  return fp;
}

/* 打开添加好友弹窗 */
function showAddFriend(){
  _actSelectedChar=null;_actValidatedCode=null;_actCodeType=null;
  document.getElementById('actStep1').style.display='';
  document.getElementById('actStep2').style.display='none';
  document.getElementById('actCodeInput').value='';
  document.getElementById('actErr').textContent='';
  document.getElementById('actOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('actCodeInput').focus(),300);
}
function closeActivation(){
  document.getElementById('actOverlay').classList.remove('open');
}

/* 自动格式化激活码输入 */
function fmtActCode(el){
  let v=el.value.toUpperCase().replace(/[^A-Z0-9\-]/g,'');
  el.value=v;
  el.classList.remove('err');
  document.getElementById('actErr').textContent='';
}

/* 提交激活码验证 */
async function submitActCode(){
  const input=document.getElementById('actCodeInput');
  const code=input.value.trim().toUpperCase();
  const errEl=document.getElementById('actErr');
  const btn=document.getElementById('actSubmitBtn');
  
  if(!code){errEl.textContent='请输入激活码';input.classList.add('err');return;}
  
  /* 格式校验 */
  const isPOT=/^POT-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
  const isSPOT=/^SPOT-[A-Z0-9]{4}-[A-Z0-9]{5}$/.test(code);
  const isVOX=/^VOX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
  if(!isPOT&&!isSPOT&&!isVOX){
    errEl.textContent='激活码格式不正确';input.classList.add('err');return;
  }
  
  btn.disabled=true;btn.textContent='验证中…';
  
  try{
    const fp=getDeviceFP();
    const r=await fetch('/.netlify/functions/activate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({code,fingerprint:fp,action:'activate'})
    });
    const data=await r.json();
    
    if(!data.valid){
      errEl.textContent=data.msg||'激活码无效或已被使用';
      input.classList.add('err');
      btn.disabled=false;btn.textContent='验证';
      return;
    }
    
    _actValidatedCode=code;
    _actCodeType=data.type;
    
    if(data.type==='vox'){
      /* 语音包充值 */
      S.voiceCredits=(S.voiceCredits||0)+(data.credits||100);
      S.actTokens.push({code,type:'vox',credits:data.credits,token:data.token,time:Date.now()});
      sv();
      closeActivation();
      showFriendRequest([]);/* 特殊：语音包动画 */
      const overlay=document.getElementById('frOverlay');
      overlay.innerHTML=`<div class="fr-card"><div class="fr-ico">🎧</div><div class="fr-msg">语音包充值成功！</div><div class="fr-sub">+${data.credits}条语音额度<br/>当前剩余：${S.voiceCredits}条</div></div>`;
      overlay.classList.add('open');
      setTimeout(()=>overlay.classList.remove('open'),3000);
    }else if(data.type==='spot'){
      doUnlockAll(data.token);
    }else{
      showCharSelector(data.token);
    }
  }catch(e){
    console.error('Activation error:',e);
    errEl.textContent='网络错误，请稍后重试';
    btn.disabled=false;btn.textContent='验证';
  }
}

/* 显示角色选择器 */
function showCharSelector(token){
  _actToken=token;
  document.getElementById('actStep1').style.display='none';
  document.getElementById('actStep2').style.display='';
  const grid=document.getElementById('actCharGrid');
  /* 显示所有active角色，已解锁的灰显 */
  const chars=Object.entries(CHAR_PACKS).filter(([k,v])=>v.active);
  grid.innerHTML=chars.map(([cid,ch])=>{
    const already=S.unlockedChars.includes(cid);
    return`<div class="act-char${already?' disabled':''}" data-cid="${cid}" onclick="selectActChar('${cid}')">
      <div class="act-char-ico" style="background:${ch.color}">${ch.ico}</div>
      <div class="act-char-name">${ch.name}${already?'<br><span style="font-size:9px;color:var(--muted)">已添加</span>':''}</div>
    </div>`;
  }).join('');
  _actSelectedChar=null;
  document.getElementById('actUnlockBtn').disabled=true;
}
let _actToken=null;

function selectActChar(cid){
  if(S.unlockedChars.includes(cid))return;
  _actSelectedChar=cid;
  document.querySelectorAll('.act-char').forEach(el=>{
    el.classList.toggle('selected',el.dataset.cid===cid);
  });
  document.getElementById('actUnlockBtn').disabled=false;
}

function actBackToStep1(){
  document.getElementById('actStep1').style.display='';
  document.getElementById('actStep2').style.display='none';
  document.getElementById('actSubmitBtn').disabled=false;
  document.getElementById('actSubmitBtn').textContent='验证';
}

/* 确认解锁单个角色 */
function confirmUnlock(){
  if(!_actSelectedChar)return;
  const cid=_actSelectedChar;
  if(!S.unlockedChars.includes(cid)){
    S.unlockedChars.push(cid);
  }
  /* 保存激活记录 */
  S.actTokens.push({code:_actValidatedCode,type:'pot',char:cid,token:_actToken,time:Date.now()});
  sv();
  closeActivation();
  showFriendRequest([cid]);
}

/* VIP全套解锁 */
function doUnlockAll(token){
  const allActive=Object.entries(CHAR_PACKS).filter(([k,v])=>v.active).map(([k])=>k);
  const newChars=[];
  allActive.forEach(cid=>{
    if(!S.unlockedChars.includes(cid)){
      S.unlockedChars.push(cid);
      newChars.push(cid);
    }
  });
  S.actTokens.push({code:_actValidatedCode,type:'spot',chars:allActive,token,time:Date.now()});
  sv();
  closeActivation();
  showFriendRequest(newChars.length?newChars:allActive);
}

/* 好友请求通过动画 */
function showFriendRequest(charIds){
  const overlay=document.getElementById('frOverlay');
  overlay.innerHTML='';
  
  if(charIds.length===1){
    /* 单角色解锁 */
    const ch=CHAR_PACKS[charIds[0]];
    overlay.innerHTML=`<div class="fr-card">
      <div class="fr-ico">${ch.ico}</div>
      <div class="fr-msg">${ch.name}</div>
      <div class="fr-sub">已通过您的好友请求 ✦</div>
    </div>`;
  }else{
    /* 多角色VIP解锁 */
    const icons=charIds.map(cid=>CHAR_PACKS[cid]?.ico||'👤').join(' ');
    const names=charIds.map(cid=>CHAR_PACKS[cid]?.name||cid);
    overlay.innerHTML=`<div class="fr-card" style="max-width:320px">
      <div style="font-size:36px;margin-bottom:12px;letter-spacing:4px">${icons}</div>
      <div class="fr-msg">🎉 VIP全员解锁</div>
      <div class="fr-sub">${names.join('、')}<br/>已全部通过您的好友请求 ✦</div>
    </div>`;
  }
  
  overlay.classList.add('open');
  
  /* 撒花效果 */
  const emojis=['✨','⭐','💫','🌟','✦','♡'];
  for(let i=0;i<12;i++){
    setTimeout(()=>{
      const sp=document.createElement('div');
      sp.className='fr-sparkle';
      sp.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      sp.style.left=50+Math.random()*40-20+'%';
      sp.style.top=50+Math.random()*30-15+'%';
      sp.style.setProperty('--tx',(Math.random()*120-60)+'px');
      sp.style.setProperty('--ty',(Math.random()*120-60)+'px');
      overlay.appendChild(sp);
    },i*80);
  }
  
  /* 自动关闭 */
  setTimeout(()=>closeFriendRequest(),3000);
}

function closeFriendRequest(){
  document.getElementById('frOverlay').classList.remove('open');
  renderChatList();
  /* 更新图鉴计数 */
  const ac=document.getElementById('unlockCharCount');
  if(ac)ac.textContent=S.unlockedChars.length;
}

/* 检查角色是否已解锁（供其他模块调用） */
function isCharUnlocked(cid){return S.unlockedChars.includes(cid);}

/* ══════ /激活码系统 ══════ */
