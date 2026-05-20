/* ══════════════════════════════════════════
   chat.js — Chat start: curChatId, utils, chat list, Chat body: messaging, API, voice, profiles, gallery, games-in-chat
   ══════════════════════════════════════════ */

let _curChatId='yukimura'; /* 当前聊天角色 */
/* 各角色离线消息池 */
function or(t,cid){const tp=t||'';const ops=CHAR_OP[cid||_curChatId]||OP;const tk=['训练','比赛','食物','情绪','天气'].find(k=>({训练:['训练','球','练'],比赛:['比赛','输'],食物:['吃','饿'],情绪:['累','烦','难过','开心'],天气:['天气','雨','冷','热']}[k]||[]).some(w=>tp.includes(w)))||'日常';const p=ops[tk];return p[Math.floor(Math.random()*p.length)]}
function rid(){return Math.random().toString(36).slice(2,10)}
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

/* 获取当前角色的消息数组 */
function getChatMsgs(cid){
  if(!S.chatMsgs)S.chatMsgs={};
  const id=cid||_curChatId;
  /* 向后兼容：把旧S.msgs迁移到chatMsgs.yukimura */
  if(id==='yukimura'&&S.msgs&&S.msgs.length&&(!S.chatMsgs.yukimura||!S.chatMsgs.yukimura.length)){
    S.chatMsgs.yukimura=S.msgs;
  }
  if(!S.chatMsgs[id])S.chatMsgs[id]=[];
  return S.chatMsgs[id];
}

/* 打开联系人列表 */
function openChat(){
  renderChatList();
  updateVoiceCreditsUI();
  document.getElementById('chatListOverlay').classList.add('open');
}
function closeChatList(){
  document.getElementById('chatListOverlay').classList.remove('open');
}

function renderChatList(){
  const el=document.getElementById('chatContacts');if(!el)return;
  /* 只显示已解锁且active的角色 */
  const chars=Object.entries(CHAR_PACKS).filter(([k,v])=>v.active&&S.unlockedChars.includes(k));
  if(chars.length===0){
    el.innerHTML=`<div class="cl-empty">
      <div class="cl-empty-ico">📱</div>
      <div class="cl-empty-title">通讯录空空如也</div>
      <div class="cl-empty-sub">输入激活码，添加角色好友<br/>开启专属聊天吧~</div>
      <button class="cl-empty-btn" onclick="showAddFriend()">＋ 添加好友</button>
    </div>`;
    return;
  }
  el.innerHTML=chars.map(([cid,ch])=>{
    const msgs=getChatMsgs(cid);
    const last=msgs.length?msgs[msgs.length-1]:null;
    const preview=last?(last.sender==='me'?'我：':'')+((last.type==='hb'?'🧧 红包':last.type==='tf'?'💰 转账':last.text)||'').slice(0,20):'开始聊天吧~';
    const time=last?fmtChatTime(last.time):'';
    const customAva=(S.charAvatars&&S.charAvatars[cid])?S.charAvatars[cid]:(cid==='yukimura'&&S.yukiAvatar?S.yukiAvatar:'');
    const ava=customAva?`<img src="${customAva}"/>`:ch.img?`<img src="${ch.img}" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex'"/><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:22px">${ch.ico}</div>`:ch.ico;
    const schoolTag=ch.school==='青春学园'?'青学':ch.school==='冰帝学园'?'冰帝':'立海';
    return`<div class="cl-card" onclick="openCharChat('${cid}')">
      <div class="cl-ava" style="background:${ch.color}">${ava}<span class="cl-school">${schoolTag}</span></div>
      <div class="cl-info">
        <div class="cl-name">${ch.name}</div>
        <div class="cl-preview">${esc(preview)}</div>
      </div>
      <div class="cl-meta"><div class="cl-time">${time}</div></div>
    </div>`;
  }).join('');
}

function fmtChatTime(ts){
  if(!ts)return'';
  const d=Date.now()-ts;
  if(d<60000)return'刚刚';
  if(d<3600000)return Math.floor(d/60000)+'分前';
  if(d<86400000)return Math.floor(d/3600000)+'时前';
  return Math.floor(d/86400000)+'天前';
}


/* 打开指定角色的聊天 */
function openCharChat(cid){
  _curChatId=cid;
  const ch=CHAR_PACKS[cid];if(!ch)return;
  closeChatList();
  document.getElementById('co').classList.add('open');
  /* 更新聊天头部 */
  const img=document.getElementById('chatAvaImg');
  const charAva=(S.charAvatars&&S.charAvatars[cid])?S.charAvatars[cid]:(cid==='yukimura'&&S.yukiAvatar?S.yukiAvatar:'');
  if(charAva){img.src=charAva;}
  else if(ch.img){img.src=ch.img;img.onerror=()=>{img.src='chibi-normal.png';};}
  document.querySelector('#co .cn').textContent=ch.name;
  const statusEl=document.getElementById('yukiStatus');
  const charStatus=(S.charStatuses&&S.charStatuses[cid])?S.charStatuses[cid]:(cid==='yukimura'&&S.yukiStatus?S.yukiStatus:'');
  statusEl.textContent=charStatus||getDefaultStatus(cid)||ch.bio.slice(0,15);
  rm();uab();
  /* time-based auto greeting */
  const msgs=getChatMsgs(cid);
  const lastMsg=msgs.length?msgs[msgs.length-1]:null;
  const timeSinceLastMsg=lastMsg?Date.now()-lastMsg.time:Infinity;
  if(timeSinceLastMsg>30*60*1000){
    const h=new Date().getHours();
    const imPool=CHAR_IM[cid]||CHAR_IM.yukimura;
    let greetPool;
    if(cid==='yukimura'){
      if(h>=5&&h<9)greetPool=['早。醒了？','早上好。','起来了？'];
      else if(h>=9&&h<12)greetPool=['上午好。','在吗。','嗯，你来了。'];
      else if(h>=12&&h<14)greetPool=['吃了吗。','午安。'];
      else if(h>=14&&h<18)greetPool=['下午好。','嗯。','来了。'];
      else if(h>=18&&h<22)greetPool=['晚上好。','今天怎么样。','吃晚饭了吗。'];
      else greetPool=['还不睡？','这么晚了。','嗯，睡不着？'];
    }else if(cid==='fuji'){
      if(h>=5&&h<9)greetPool=['早上好呢。','嗯，起得挺早的。'];
      else if(h>=12&&h<14)greetPool=['午饭吃了吗？','下午好呢。'];
      else if(h>=18&&h<22)greetPool=['晚上好。','呐，今天怎么样？'];
      else greetPool=['还没睡吗。','夜深了呢。'];
    }else if(cid==='ryoma'){
      if(h>=5&&h<9)greetPool=['……这么早。','啊，早。'];
      else if(h>=12&&h<14)greetPool=['哦。','……饿了。'];
      else if(h>=18&&h<22)greetPool=['嗯。','……有事？'];
      else greetPool=['……你不睡觉吗。','这么晚。'];
    }else{greetPool=imPool;}
    setTimeout(()=>{
      getChatMsgs(cid).push({id:rid(),sender:'c',text:greetPool[Math.floor(Math.random()*greetPool.length)],time:Date.now(),type:'auto'});
      sv();rm();
    },1200+Math.random()*1000);
  }
  /* 语音按钮事件委托 */
  const box=document.getElementById('msgs');
  if(!box._voiceDelegated){
    box._voiceDelegated=true;
    box.addEventListener('click',function(e){
      const btn=e.target.closest('.voice-play-btn');
      if(!btn)return;
      e.stopPropagation();
      const mid=btn.dataset.mid;
      const m=window._vm&&window._vm[mid];
      if(!m){toast('找不到消息');return;}
      const s=S.set;
      const chatId=m._chatId||_curChatId;
      const ch=CHAR_PACKS[chatId];
      const vid=ch&&ch.voiceId?ch.voiceId:VOICE_ID;
      if(!hasVoiceAccess()){toast('🎧 语音额度已用完，请充值语音包');return;}
      /* iOS需要在用户点击的瞬间解锁音频播放权限 */
      const actx=new(window.AudioContext||window.webkitAudioContext)();
      const unlock=actx.createBuffer(1,1,22050);
      const unlockSrc=actx.createBufferSource();
      unlockSrc.buffer=unlock;unlockSrc.connect(actx.destination);unlockSrc.start(0);

      /* 有缓存：直接解码播放 */
      if(m._audioB64){
        const raw=atob(m._audioB64);const arr=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
        actx.decodeAudioData(arr.buffer).then(buf=>{
          if(!buf){actx.close();return;}
          const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);src.start(0);
          btn.textContent='⏸';
          src.onended=()=>{btn.textContent='▶ 语音';actx.close();};
        }).catch(e=>{toast('❌ '+e.message);btn.textContent='▶ 语音';actx.close();});
        return;
      }

      /* 无缓存：翻译→TTS→播放 */
      if(!hasVoiceAccess()){toast('🎧 语音额度已用完');btn.textContent='▶ 语音';actx.close();return;}
      btn.textContent='⏳';
      translateToJP(m.text).then(jp=>{
        return fetch('/.netlify/functions/tts',{method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(ttsBody(jp,vid))});
      }).then(r=>r.json()).then(d=>{
        if(!d.data?.audio){toast('❌ '+(d.base_resp?.status_msg||'音频失败'));btn.textContent='▶ 语音';actx.close();return;}
        deductVoiceCredit(1);
        m._audioB64=d.data.audio;
        const raw=atob(d.data.audio);
        const arr=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
        return actx.decodeAudioData(arr.buffer);
      }).then(buf=>{
        if(!buf){actx.close();return;}
        const src=actx.createBufferSource();
        src.buffer=buf;src.connect(actx.destination);src.start(0);
        btn.textContent='⏸';
        src.onended=()=>{btn.textContent='▶ 语音';actx.close();};
      }).catch(e=>{toast('❌ '+e.message);btn.textContent='▶ 语音';try{actx.close();}catch(_){}});
    });
  }
}
function cc(){document.getElementById('co').classList.remove('open');document.getElementById('cm').classList.remove('open');openChat();}
function tcm(){document.getElementById('cm').classList.toggle('open')}
document.addEventListener('click',e=>{if(!e.target.closest('.cmw'))document.getElementById('cm').classList.remove('open')})
function ar(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,80)+'px'}
function uab(){
  const cid=_curChatId;
  const a=(cid==='yukimura')?(S.aff||0):((S.princeAff&&S.princeAff[cid])||0);
  const h=a>=50?'💖':a>=30?'❤️':a>=15?'🧡':a>=5?'💛':'🤍';
  document.getElementById('ab').textContent=h+' 好感 '+a;
}

/* ── 角色资料（根据当前聊天角色） ── */
function openCharProfile(){
  document.getElementById('cm').classList.remove('open');
  const cid=_curChatId;
  const ch=CHAR_PACKS[cid];if(!ch)return;
  /* 统一存储初始化 */
  if(!S.charAvatars)S.charAvatars={};
  if(!S.charStatuses)S.charStatuses={};
  if(!S.charPrompts)S.charPrompts={};
  /* 向后兼容幸村旧字段 */
  if(cid==='yukimura'){
    if(S.yukiAvatar&&!S.charAvatars.yukimura)S.charAvatars.yukimura=S.yukiAvatar;
    if(S.yukiStatus&&!S.charStatuses.yukimura)S.charStatuses.yukimura=S.yukiStatus;
    if(S.myPrompt&&!S.charPrompts.yukimura)S.charPrompts.yukimura=S.myPrompt;
  }
  const ava=S.charAvatars[cid];
  const status=S.charStatuses[cid]||getDefaultStatus(cid);
  const prompt=S.charPrompts[cid]||'';
  const aff=(cid==='yukimura')?(S.aff||0):((S.princeAff&&S.princeAff[cid])||0);
  const avaHtml=ava?`<img src="${ava}" style="width:100%;height:100%;object-fit:cover"/>`:(ch.img?`<img src="${ch.img}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px\\'>${ch.ico}</div>'">`:`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px">${ch.ico}</div>`);
  os(ch.name+' · 资料',`
    <div style="text-align:center;margin-bottom:16px">
      <div style="width:80px;height:80px;border-radius:20px;overflow:hidden;margin:0 auto 8px;border:3px solid ${ch.color}50;cursor:pointer;position:relative" onclick="document.getElementById('charAvaInput').click()">
        ${avaHtml}
        <div style="position:absolute;bottom:0;right:0;width:22px;height:22px;background:${ch.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px">✏️</div>
      </div>
      <input type="file" id="charAvaInput" accept="image/*" style="display:none" onchange="loadCharAva(this)"/>
      <div style="font-size:11px;color:var(--muted)">点击更换${ch.name}头像</div>
    </div>
    <div style="background:var(--p50);border-radius:14px;padding:12px 16px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:600;color:var(--muted);letter-spacing:1px;margin-bottom:6px">💜 好感度</div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:8px;background:var(--p100);border-radius:4px;overflow:hidden"><div style="height:100%;width:${Math.min(aff,100)}%;background:linear-gradient(90deg,${ch.color},${ch.color}CC);border-radius:4px;transition:width .5s"></div></div>
        <span style="font-size:14px;font-weight:700;color:${ch.color}">${aff}</span>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">${ch.name}状态签名</div>
      <input class="si" id="charStatus" value="${esc(status)}" placeholder="${ch.name}的状态…"/>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">角色Prompt（留空用默认）</div>
      <textarea class="si" id="charPrompt" rows="5" style="resize:vertical;line-height:1.5" placeholder="${ch.sys?ch.sys.slice(0,40)+'…':ch.name+'的人设…'}">${esc(prompt)}</textarea>
    </div>
    <button class="shbtn p" onclick="saveCharProfile()">保存${ch.name}资料</button>
  `);
}
function getDefaultStatus(cid){
  const defaults={yukimura:'🌸 茶道课结束了',fuji:'📷 在拍照',ryoma:'🐱 和卡鲁宾在一起'};
  return defaults[cid]||'';
}
function loadCharAva(input){
  const file=input.files[0];if(!file)return;
  const cid=_curChatId;
  const reader=new FileReader();
  reader.onload=e=>{
    if(!S.charAvatars)S.charAvatars={};
    S.charAvatars[cid]=e.target.result;
    /* 向后兼容幸村旧字段 */
    if(cid==='yukimura')S.yukiAvatar=e.target.result;
    sv();
    /* 更新聊天头像 */
    const ci=document.getElementById('chatAvaImg');if(ci)ci.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function saveCharProfile(){
  const cid=_curChatId;
  const ch=CHAR_PACKS[cid];
  if(!S.charStatuses)S.charStatuses={};
  if(!S.charPrompts)S.charPrompts={};
  S.charStatuses[cid]=document.getElementById('charStatus').value.trim();
  S.charPrompts[cid]=document.getElementById('charPrompt').value.trim();
  /* 向后兼容幸村旧字段 */
  if(cid==='yukimura'){
    S.yukiStatus=S.charStatuses[cid];
    S.myPrompt=S.charPrompts[cid];
  }
  sv();
  /* 更新聊天头部状态 */
  const el=document.getElementById('yukiStatus');
  if(el)el.textContent=S.charStatuses[cid]||getDefaultStatus(cid);
  cs();toast('✅ '+ch.name+'资料已保存');
}

function updateMyAva(){
  const img=document.getElementById('myAvaImg');
  const ph=document.getElementById('myAvaPlaceholder');
  if(S.myAvatar){img.src=S.myAvatar;img.style.display='block';ph.style.display='none';}
  else{img.style.display='none';ph.style.display='flex';}
  const n=S.set.name||'我';
  ph.textContent=n.slice(-1)||'🧡';
  const wt=document.getElementById('worldTitle');
  if(wt) wt.textContent='✦ '+(S.set.name||'我')+'の世界 ✦';
}

/* ── 幸村资料 ── */
function openYukiProfile(){
  document.getElementById('cm').classList.remove('open');
  const ya=S.yukiAvatar?`<img src="${S.yukiAvatar}" style="width:100%;height:100%;object-fit:cover"/>`:`<img src="chibi-normal.png" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/>`;
  os('幸村精市 · 资料',`
    <div style="text-align:center;margin-bottom:16px">
      <div style="width:80px;height:80px;border-radius:20px;overflow:hidden;margin:0 auto 8px;border:3px solid var(--p300);cursor:pointer;position:relative" onclick="document.getElementById('yukiAvaInput').click()">
        ${ya}
        <div style="position:absolute;bottom:0;right:0;width:22px;height:22px;background:var(--p500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px">✏️</div>
      </div>
      <input type="file" id="yukiAvaInput" accept="image/*" style="display:none" onchange="loadYukiAva(this)"/>
      <div style="font-size:11px;color:var(--muted)">点击更换幸村头像</div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">幸村状态签名</div>
      <input class="si" id="ys" value="${S.yukiStatus||'🌸 茶道课结束了'}" placeholder="幸村的状态…"/>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">角色Prompt（留空用默认）</div>
      <textarea class="si" id="yp" rows="5" style="resize:vertical;line-height:1.5" placeholder="你是幸村精市，立海大网球部部长……">${S.myPrompt||''}</textarea>
    </div>
    <button class="shbtn p" onclick="saveYukiProfile()">保存幸村资料</button>
  `);
}
function loadYukiAva(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    S.yukiAvatar=e.target.result;sv();
    document.querySelectorAll('.ma img').forEach(i=>{i.src=S.yukiAvatar;});
    const ci=document.getElementById('chatAvaImg');if(ci)ci.src=S.yukiAvatar;
  };
  reader.readAsDataURL(file);
}
function saveYukiProfile(){
  S.yukiStatus=document.getElementById('ys').value.trim();
  S.myPrompt=document.getElementById('yp').value.trim();
  sv();
  const el=document.getElementById('yukiStatus');
  if(el)el.textContent=S.yukiStatus||'🌸 茶道课结束了';
  cs();toast('✅ 幸村资料已保存');
}

/* ── 我的资料 ── */
function openMyProfile(){
  document.getElementById('cm').classList.remove('open');
  const ava=S.myAvatar?`<img src="${S.myAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:17px"/>`:`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;background:linear-gradient(135deg,var(--p400),var(--p600));border-radius:17px">${(S.set.name||'我').slice(-1)||'🧡'}</div>`;
  os('我的资料',`
    <div style="text-align:center;margin-bottom:16px">
      <div class="prof-ava-wrap" onclick="document.getElementById('avaInput').click()">
        <div class="prof-ava">${ava}</div>
        <div class="prof-ava-edit">✏️</div>
      </div>
      <input type="file" id="avaInput" accept="image/*" style="display:none" onchange="loadAva(this)"/>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">点击更换头像</div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">我的名字</div>
      <input class="si" id="pn" value="${S.set.name||''}" placeholder="输入你的名字…"/>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px">我的状态</div>
      <input class="si" id="ps" value="${S.myStatus||''}" placeholder="输入状态…"/>
    </div>
    <button class="shbtn p" onclick="saveMyProfile()">保存我的资料</button>
  `);
}
function loadAva(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    S.myAvatar=e.target.result;sv();
    const wrap=document.querySelector('.prof-ava');
    if(wrap)wrap.innerHTML=`<img src="${S.myAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:17px"/>`;
    updateMyAva();
  };
  reader.readAsDataURL(file);
}
function saveMyProfile(){
  S.set.name=document.getElementById('pn').value.trim();
  S.myStatus=document.getElementById('ps').value.trim();
  sv();updateMyAva();cs();toast('✅ 我的资料已保存');
}

function rm(){
  const box=document.getElementById('msgs');box.innerHTML='';
  const msgs=getChatMsgs(_curChatId);
  const ch=CHAR_PACKS[_curChatId]||CHAR_PACKS.yukimura;
  let lt=0;
  for(const m of msgs){
    if(m.time-lt>5*60*1000){const t=document.createElement('div');t.className='ts';t.textContent=new Date(m.time).toLocaleString('zh-CN',{hour:'2-digit',minute:'2-digit',month:'short',day:'numeric'});box.appendChild(t);lt=m.time}
    if(m.type==='sys'){const d=document.createElement('div');d.className='sys';d.textContent=m.text;box.appendChild(d);continue}
    const mine=m.sender==='me';
    const row=document.createElement('div');row.className='mr'+(mine?' me':'');
    if(!mine){const a=document.createElement('div');a.className='ma';
      const charAva2=(S.charAvatars&&S.charAvatars[_curChatId])?S.charAvatars[_curChatId]:(_curChatId==='yukimura'&&S.yukiAvatar?S.yukiAvatar:'');
      const avaSrc=charAva2||(ch.img||'chibi-normal.png');
      a.innerHTML=`<img src="${avaSrc}" onerror="this.src='chibi-normal.png'"/>`;row.appendChild(a)}
    const b=document.createElement('div');b.className='bub '+(mine?'me':'ot');
    if(m.type==='hb')rhb(b,m,mine);
    else if(m.type==='tf')rtf(b,m,mine);
    else if(m.type==='voice'&&m.audioB64)makeAudioBubble(b,m.audioB64,m.jpText||m.text,m.text,mine);
    else{
      const mid=m.id||(m.id=rid());
      if(!mine&&hasVoiceAccess()&&ch.voiceId){
        window._vm=window._vm||{};window._vm[mid]=m;
        window._vm[mid]._chatId=_curChatId;
        b.innerHTML=esc(m.text||'')+'<br><button class="voice-play-btn" data-mid="'+mid+'" style="margin-top:6px;padding:4px 12px;border-radius:16px;background:var(--p100);border:1px solid var(--border);color:var(--p600);font-size:12px;cursor:pointer;font-family:inherit">▶ 语音</button>';
      }else{
        b.innerHTML=esc(m.text||'');
      }
    }
    if(mine){
      const ua=document.createElement('div');ua.className='my-ava';ua.style.cssText='width:34px;height:34px;border-radius:10px;overflow:hidden;flex-shrink:0';
      if(S.myAvatar){ua.innerHTML=`<img src="${S.myAvatar}" style="width:100%;height:100%;object-fit:cover"/>`;}
      else{ua.innerHTML=`<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--p400),var(--p600));display:flex;align-items:center;justify-content:center;color:white;font-size:16px">${(S.set.name||'我').slice(-1)||'🧡'}</div>`;}
      row.insertBefore(ua, row.firstChild);
    }
    /* 长按气泡弹出菜单（角色消息） */
    if(!mine){
      const mid=m.id||(m.id=rid());
      window._vm=window._vm||{};
      window._vm[mid]=m;
      window._vm[mid]._chatId=_curChatId;
      let pt=null;
      b.dataset.mid=mid;
      b.addEventListener('touchstart',function(){pt=setTimeout(()=>{showBubbleMenu(mid,b,false);},500);},{passive:true});
      b.addEventListener('touchend',function(){if(pt)clearTimeout(pt);},{passive:true});
      b.addEventListener('touchmove',function(){if(pt)clearTimeout(pt);},{passive:true});
      b.addEventListener('contextmenu',function(e){e.preventDefault();showBubbleMenu(mid,b,false);});
    }
    /* 长按气泡弹出菜单（我的消息 - 撤回） */
    if(mine&&m.type==='txt'){
      (function(_m,_b){
        var _mid=_m.id||(_m.id=rid());
        window._vm=window._vm||{};window._vm[_mid]=_m;_m._chatId=_curChatId;
        _b.dataset.mid=_mid;
        var _pt=null;
        _b.addEventListener('touchstart',function(){_pt=setTimeout(function(){showBubbleMenu(_mid,_b,true);},500);},{passive:true});
        _b.addEventListener('touchend',function(){if(_pt)clearTimeout(_pt);},{passive:true});
        _b.addEventListener('touchmove',function(){if(_pt)clearTimeout(_pt);},{passive:true});
        _b.addEventListener('contextmenu',function(e){e.preventDefault();showBubbleMenu(_mid,_b,true);});
      })(m,b);
    }
    row.appendChild(b);
    box.appendChild(row);
  }
  setTimeout(()=>box.scrollTop=box.scrollHeight,30);
}
function rhb(b,m,mine){
  b.style.cssText='padding:0;background:transparent;border:none;box-shadow:none';
  const op=Array.isArray(m.ob)&&m.ob.includes('me');
  b.innerHTML=`<div class="hbc${op?' op':''}"><div class="hbt"><div class="hbi">🧧</div><div class="hbn">${esc(m.note||'恭喜发财')}</div><div class="hbf">${mine?'你发出的红包':'点击领取红包'}</div></div><div class="hbb">${!mine&&!op?'<button class="hbo">拆开红包</button>':op?`<span class="hba">+¥${m.amount.toFixed(2)}</span><span class="hbl">已领取</span>`:'<span class="hbl">红包已发出</span>'}</div></div>`;
  b.querySelector('.hbo')?.addEventListener('click',()=>{if(!Array.isArray(m.ob))m.ob=[];m.ob.push('me');S.wallet=+(S.wallet+m.amount).toFixed(2);sv();rm();uwb();toast('🧧 你领取了 ¥'+m.amount.toFixed(2))});
}
function rtf(b,m,mine){
  b.style.cssText='padding:0;background:transparent;border:none;box-shadow:none';
  const st=m.ac===true?'ac':m.ac===false?'de':'';
  b.innerHTML=`<div class="tfc ${st}"><div class="tft"><div class="tfi">💰</div><div class="tfa">¥${parseFloat(m.amount).toFixed(2)}</div>${m.note?`<div class="tfn">${esc(m.note)}</div>`:''}</div><div class="tfb">${!mine&&!st?'<button class="tfac">收款</button><button class="tfde">退回</button>':st==='ac'?'<span class="tfs">✓ 已收款</span>':st==='de'?'<span class="tfs">已退回</span>':mine&&!st?'<span class="tfs">等待收款</span>':''}</div></div>`;
  b.querySelector('.tfac')?.addEventListener('click',()=>{m.ac=true;S.wallet=+(S.wallet+m.amount).toFixed(2);sv();rm();uwb();toast('💰 已收款 ¥'+m.amount.toFixed(2))});
  b.querySelector('.tfde')?.addEventListener('click',()=>{m.ac=false;sv();rm();toast('已退回转账')});
}
function sty(){const box=document.getElementById('msgs');const r=document.createElement('div');r.className='tr';r.id='tr';const a=document.createElement('div');a.className='ma';const ch=CHAR_PACKS[_curChatId];const charAva3=(S.charAvatars&&S.charAvatars[_curChatId])?S.charAvatars[_curChatId]:(_curChatId==='yukimura'&&S.yukiAvatar?S.yukiAvatar:'');const avaSrc=charAva3||(ch&&ch.img?ch.img:'chibi-normal.png');a.innerHTML=`<img src="${avaSrc}" onerror="this.src='chibi-normal.png'"/>`;const tb=document.createElement('div');tb.className='tb';tb.innerHTML='<div class="td"></div><div class="td"></div><div class="td"></div>';r.appendChild(a);r.appendChild(tb);box.appendChild(r);box.scrollTop=box.scrollHeight}
function hty(){document.getElementById('tr')?.remove()}

/* API */
async function callApi(charId){
  const cid=charId||_curChatId;
  const s=S.set;if(!s.key)return null;
  const pc=PC[s.prov];if(!pc)return null;
  const ch=CHAR_PACKS[cid];
  const a=(cid==='yukimura')?(S.aff||0):((S.princeAff&&S.princeAff[cid])||0);
  const ih=a>=50?'【关系非常亲密，情感浓烈，言语间透着默契与在乎。】':a>=30?'【关系亲密，温柔体贴，称呼更亲昵。】':a>=15?'【比较熟悉，说话自然随意。】':a>=5?'【有点熟悉，语气轻松些。】':'【普通朋友，保持礼貌距离。】';
  const mem=S.mem?.length&&cid==='yukimura'?'【对话记忆】'+S.mem.map(m=>m.t).join('；'):'';
  const customPrompt=(S.charPrompts&&S.charPrompts[cid])?S.charPrompts[cid]:((cid==='yukimura'&&S.myPrompt)?S.myPrompt:'');
  const charSys=customPrompt||(ch&&ch.sys?ch.sys:SYS);
  const sys=[charSys,cid==='yukimura'?getWorldBookText():'',ih,mem,cid==='yukimura'?getMemoryLibText():''].filter(Boolean).join('\n');
  const msgs=getChatMsgs(cid);
  const _IM_SET=new Set(IM);const _OP_ALL=[];Object.values(OP).forEach(a=>a.forEach(v=>_OP_ALL.push(v)));const _OP_SET=new Set(_OP_ALL);
  const raw=msgs.filter(m=>m.text&&m.type!=='sys'&&m.type!=='hb'&&m.type!=='tf'&&m.type!=='auto')
    .filter(m=>!(m.sender!=='me'&&(_IM_SET.has(m.text)||_OP_SET.has(m.text))))
    .slice(-20).map(m=>({role:m.sender==='me'?'user':'assistant',content:m.text}));
  const rm2=[];
  for(const m of raw){
    if(rm2.length&&rm2[rm2.length-1].role===m.role) rm2[rm2.length-1].content+='\n'+m.content;
    else rm2.push({...m});
  }
  while(rm2.length&&rm2[0].role==='assistant') rm2.shift();
  if(!rm2.length)rm2.push({role:'user',content:'你好'});
  try{const r=await fetch(pc.url(s.model,s.key),{method:'POST',headers:pc.hd(s.key),body:JSON.stringify(pc.body(sys,rm2))});const d=await r.json();return pc.parse(d)||null}catch(e){return null}
}

async function send(){
  const inp=document.getElementById('inp');const t=inp.value.trim();if(!t)return;
  inp.value='';inp.style.height='auto';
  const msgs=getChatMsgs(_curChatId);
  msgs.push({id:rid(),sender:'me',text:t,time:Date.now(),type:'txt'});
  /* 向后兼容：幸村的消息同步到S.msgs */
  if(_curChatId==='yukimura')S.msgs=msgs;
  sv();rm();
  setTimeout(async()=>{
    sty();let rep='';
    if(S.set.key)rep=await callApi(_curChatId)||'';
    if(!rep)rep=or(t,_curChatId);
    hty();
    const msgs2=getChatMsgs(_curChatId);
    msgs2.push({id:rid(),sender:'c',text:rep,time:Date.now(),type:'txt'});
    if(_curChatId==='yukimura'){S.msgs=msgs2;S.aff=(S.aff||0)+1;}
    else{if(!S.princeAff)S.princeAff={};S.princeAff[_curChatId]=(S.princeAff[_curChatId]||0)+1;}
    sv();rm();uab();
    if(_curChatId==='yukimura'&&Math.random()<.1&&msgs2.length>4)setTimeout(yhb,2000+Math.random()*3000);
    if(_curChatId==='yukimura'&&msgs2.length%10===0)umem();
  },800+Math.random()*1500);
}

/* memory */
async function umem(){
  if(!S.set.key)return;
  const msgs=getChatMsgs('yukimura');
  const r=msgs.filter(m=>m.text&&m.type==='txt').slice(-30);if(r.length<8)return;
  const dl=r.map(m=>(m.sender==='me'?'我':'幸村')+':'+m.text).join('\n');
  const pc=PC[S.set.prov];if(!pc)return;
  try{
    const sys='你是记忆整理助手，帮幸村精市记住和用户的重要对话。';
    const msgs=[{role:'user',content:`用2句话总结用户说了什么重要的事：\n${dl}\n直接输出总结。`}];
    const r2=await fetch(pc.url(S.set.model,S.set.key),{method:'POST',headers:pc.hd(S.set.key),body:JSON.stringify(pc.body(sys,msgs))});
    const d=await r2.json();const s=pc.parse(d);
    if(s){if(!S.mem)S.mem=[];S.mem.unshift({ts:Date.now(),t:s.trim()});S.mem=S.mem.slice(0,5);sv()}
  }catch(e){}
}

/* auto init — 标记为auto类型，不会混入AI对话上下文 */
setInterval(()=>{try{
  if(!document.getElementById('co').classList.contains('open'))return;
  const msgs=getChatMsgs(_curChatId);
  const imPool=CHAR_IM[_curChatId]||CHAR_IM.yukimura;
  msgs.push({id:rid(),sender:'c',text:imPool[Math.floor(Math.random()*imPool.length)],time:Date.now(),type:'auto'});sv();rm();
}catch(e){}},120000+Math.random()*180000);

/* pat pat */
function dopp(){document.getElementById('cm').classList.remove('open');const msgs=getChatMsgs(_curChatId);const ch=CHAR_PACKS[_curChatId];msgs.push({id:rid(),sender:'sys',text:'👋 你拍了拍'+ch.name,time:Date.now(),type:'sys'});sv();rm();const PAP={ryoma:['……干嘛。','别碰我。','……哦。','切。','……（拉低帽檐）'],fuji:['呐，怎么了？','嗯？……（微笑）','你拍我做什么呢。','……有趣。','被你发现了。'],akaya:['哇啊别突然拍我！','干嘛干嘛！','嘿嘿，怎么了？','前辈？！','吓我一跳！'],marui:['天才被拍了~','嗯？干嘛~','别打扰天才吃东西。','哈？','泡泡糖差点吞了！'],niou:['Puri♪','……嗯？','你拍的是真的我吗？','Puri。','有趣。'],atobe:['你在对本大爷做什么。','……哼。','大胆。','嗯？本大爷允许了吗。','……算了，本大爷不跟你计较。'],tezuka:['……别闹。','嗯。','……','油断するな。','注意场合。'],shiraishi:['嗯？怎么了？','啊哈哈，怎么突然拍我。','エクスタシー……不是，你干嘛。','被你拍到了。']};const rs=PAP[_curChatId]||['……你干嘛。','被你拍到了。','嗯？','……','又来。','手感怎么样。','……（微微笑了一下）','别闹。','嗯，你在。','拍够了？'];setTimeout(()=>{msgs.push({id:rid(),sender:'c',text:rs[Math.floor(Math.random()*rs.length)],time:Date.now(),type:'txt'});if(_curChatId==='yukimura')S.aff=(S.aff||0)+1;else{if(!S.princeAff)S.princeAff={};S.princeAff[_curChatId]=(S.princeAff[_curChatId]||0)+1;}sv();rm();uab()},800+Math.random()*1500)}

/* quick actions */
function toggleQuickActions(){
  const qa=document.getElementById('quickActions');
  const show=qa.style.display==='none';
  qa.style.display=show?'block':'none';
  document.getElementById('stickerBtn').style.background=show?'var(--p100)':'var(--p50)';
}
function hideQuickActions(){document.getElementById('quickActions').style.display='none';document.getElementById('stickerBtn').style.background='var(--p50)';}
function sendQuick(text){hideQuickActions();document.getElementById('inp').value=text;send();}
function sendSticker(emoji){
  hideQuickActions();
  const msgs=getChatMsgs(_curChatId);
  msgs.push({id:rid(),sender:'me',text:emoji,time:Date.now(),type:'txt'});sv();rm();
  const STICKER_REPLIES_YUKI={
    '💋':['……','……嗯。','别在这里。','看到了。'],
    '😘':['……（偏过头）','嗯。','收到了。','别闹。'],
    '🥺':['怎么了。','别做那个表情。','好了好了，过来。','……说吧，想要什么。'],
    '❤️‍🔥':['……你又来。','嗯。','收到。','……我也是。'],
  };
  const STICKER_REPLIES_FUJI={
    '💋':['呐……（笑）','嗯。','有意思。'],
    '😘':['你很可爱呢。','嗯……（微笑）','收到了。'],
    '🥺':['怎么了？','嗯，说来听听。','不要做那种表情。'],
    '❤️‍🔥':['……嗯。','你这样啊。','……（笑了笑）'],
  };
  const STICKER_REPLIES_RYOMA={
    '💋':['……啊？','切。','……别にいいけど。'],
    '😘':['……（拉低帽檐）','哦。','干嘛啦。'],
    '🥺':['……你怎么了。','别，别做那个表情。','切……'],
    '❤️‍🔥':['……（移开视线）','哦。','……まだまだだね。'],
  };
  const replyMap={yukimura:STICKER_REPLIES_YUKI,fuji:STICKER_REPLIES_FUJI,ryoma:STICKER_REPLIES_RYOMA};
  const replies=(replyMap[_curChatId]||STICKER_REPLIES_YUKI)[emoji]||['嗯。','看到了。'];
  setTimeout(()=>{
    msgs.push({id:rid(),sender:'c',text:replies[Math.floor(Math.random()*replies.length)],time:Date.now(),type:'txt'});
    if(_curChatId==='yukimura')S.aff=(S.aff||0)+1;else{if(!S.princeAff)S.princeAff={};S.princeAff[_curChatId]=(S.princeAff[_curChatId]||0)+1;}
    sv();rm();uab();
  },800+Math.random()*1500);
}
function clr(){document.getElementById('cm').classList.remove('open');if(!confirm('确定清空聊天记录吗？'))return;if(!S.chatMsgs)S.chatMsgs={};S.chatMsgs[_curChatId]=[];if(_curChatId==='yukimura')S.msgs=[];sv();rm()}

/* dice */
function doDice(){
  document.getElementById('cm').classList.remove('open');
  const msgs=getChatMsgs(_curChatId);const ch=CHAR_PACKS[_curChatId];
  const myDice=Math.ceil(Math.random()*6);
  msgs.push({id:rid(),sender:'me',text:'🎲 掷出了 '+myDice+' 点',time:Date.now(),type:'sys'});sv();rm();
  setTimeout(()=>{
    const hisDice=Math.ceil(Math.random()*6);
    msgs.push({id:rid(),sender:'sys',text:'🎲 '+ch.name+'掷出了 '+hisDice+' 点',time:Date.now(),type:'sys'});
    const winC=_curChatId==='ryoma'?['切，运气好。','……下次不会输。','哦。']:_curChatId==='fuji'?['呐，你赢了呢。','运气不错。','有意思。']:['……运气不错。','嗯，你赢了。','下次不会让你了。'];
    const loseC=_curChatId==='ryoma'?['まだまだだね。','哼。','正常。']:_curChatId==='fuji'?['嗯。','这种事我运气一向不差。']:['嗯。','这种事我不会输的。','正常发挥。'];
    const drawC=_curChatId==='ryoma'?['再来。','切。']:_curChatId==='fuji'?['再来一次？','有趣。']:['再来一次？','打平了。','有意思。'];
    const comments=myDice>hisDice?winC:myDice<hisDice?loseC:drawC;
    setTimeout(()=>{
      msgs.push({id:rid(),sender:'c',text:comments[Math.floor(Math.random()*comments.length)],time:Date.now(),type:'txt'});
      if(_curChatId==='yukimura')S.aff=(S.aff||0)+1;else{if(!S.princeAff)S.princeAff={};S.princeAff[_curChatId]=(S.princeAff[_curChatId]||0)+1;}
      sv();rm();uab();
    },600);
  },1200);
}

/* rock paper scissors */
function doRPS(){
  document.getElementById('cm').classList.remove('open');
  const ch=CHAR_PACKS[_curChatId];
  os('猜拳',`<div style="text-align:center"><div style="font-size:14px;color:var(--muted);margin-bottom:16px">和${ch.name}猜拳</div><div style="display:flex;gap:12px;justify-content:center"><button onclick="playRPS('石头')" style="font-size:36px;padding:14px 20px;border-radius:16px;border:2px solid var(--border);background:white;cursor:pointer;transition:transform .15s">✊</button><button onclick="playRPS('剪刀')" style="font-size:36px;padding:14px 20px;border-radius:16px;border:2px solid var(--border);background:white;cursor:pointer;transition:transform .15s">✌️</button><button onclick="playRPS('布')" style="font-size:36px;padding:14px 20px;border-radius:16px;border:2px solid var(--border);background:white;cursor:pointer;transition:transform .15s">🖐</button></div></div>`);
}
function playRPS(my){
  cs();
  const msgs=getChatMsgs(_curChatId);const ch=CHAR_PACKS[_curChatId];
  const choices=['石头','剪刀','布'];
  const emoji={'石头':'✊','剪刀':'✌️','布':'🖐'};
  const his=choices[Math.floor(Math.random()*3)];
  msgs.push({id:rid(),sender:'sys',text:`猜拳：你出了${emoji[my]}  ${ch.name}出了${emoji[his]}`,time:Date.now(),type:'sys'});
  const win=(my==='石头'&&his==='剪刀')||(my==='剪刀'&&his==='布')||(my==='布'&&his==='石头');
  const lose=(my!==his)&&!win;
  const comments=win?['……你赢了。','嗯，运气好。','不会有下次了。']:lose?['正常。','这种事我不会输。','嗯。']:['再来。','打平了。'];
  setTimeout(()=>{
    msgs.push({id:rid(),sender:'c',text:comments[Math.floor(Math.random()*comments.length)],time:Date.now(),type:'txt'});
    if(_curChatId==='yukimura'){if(win)S.aff=(S.aff||0)+2;else S.aff=(S.aff||0)+1;}
    else{if(!S.princeAff)S.princeAff={};S.princeAff[_curChatId]=(S.princeAff[_curChatId]||0)+(win?2:1);}
    sv();rm();uab();
  },1000);
}

/* hongbao */
function dohb(){document.getElementById('cm').classList.remove('open');os('发红包',`<div class="shi">🧧</div><div class="shar"><span class="shy">¥</span><input class="sham r" id="ha" type="number" min="0.01" max="9999" step="0.01" value="6.66"/></div><input class="shno" id="hn" placeholder="恭喜发财，大吉大利" maxlength="20"/><button class="shbtn r" onclick="sendhb()">塞进红包 🧧</button>`)}
function sendhb(){const a=parseFloat(document.getElementById('ha').value)||6.66;const n=document.getElementById('hn').value||'恭喜发财，大吉大利';if((S.wallet||200)<a){toast('余额不足！');return}S.wallet=+(S.wallet-a).toFixed(2);const msgs=getChatMsgs(_curChatId);const m={id:rid(),sender:'me',type:'hb',amount:a,note:n,ob:[],time:Date.now()};msgs.push(m);sv();rm();uwb();cs();setTimeout(()=>{if(!Array.isArray(m.ob))m.ob=[];m.ob.push('c');const ch=CHAR_PACKS[_curChatId];const rs=['收到了，谢谢你。','……谢谢。','嗯，不必客气。'];msgs.push({id:rid(),sender:'c',text:rs[Math.floor(Math.random()*rs.length)],time:Date.now(),type:'txt'});sv();rm()},1500+Math.random()*2000)}
function yhb(){const ns=['给你的','拿去，别客气','小心意','想给你'];const as=[1,2,3.33,5,6.66,8.88,13.14,52];const msgs=getChatMsgs(_curChatId);msgs.push({id:rid(),sender:'c',type:'hb',amount:as[Math.floor(Math.random()*as.length)],note:ns[Math.floor(Math.random()*ns.length)],ob:[],time:Date.now()});sv();rm()}

/* transfer */
function dotf(){document.getElementById('cm').classList.remove('open');const ch=CHAR_PACKS[_curChatId];os('转账',`<div class="shi">💰</div><div style="font-size:12px;color:var(--muted);margin-bottom:8px">转账给 ${ch.name}</div><div class="shar"><span class="shyp">¥</span><input class="sham p" id="ta" type="number" min="0.01" max="99999" step="0.01" value="100.00"/></div><input class="shno" id="tn" placeholder="转账备注（可选）" maxlength="20"/><button class="shbtn p" onclick="sendtf()">确认转账 💰</button>`)}
function sendtf(){const a=parseFloat(document.getElementById('ta').value)||100;const n=document.getElementById('tn').value||'';if((S.wallet||200)<a){toast('余额不足！');return}S.wallet=+(S.wallet-a).toFixed(2);const msgs=getChatMsgs(_curChatId);const m={id:rid(),sender:'me',type:'tf',amount:a,note:n,ac:null,time:Date.now()};msgs.push(m);sv();rm();uwb();cs();setTimeout(()=>{m.ac=true;msgs.push({id:rid(),sender:'c',text:'收到了。',time:Date.now(),type:'txt'});sv();rm()},2000+Math.random()*2000)}

/* sheet */
function os(t,h){document.getElementById('sht').textContent=t;document.getElementById('shb').innerHTML=h;document.getElementById('sho').classList.add('open');document.getElementById('sh').classList.add('open')}
function cs(){document.getElementById('sho').classList.remove('open');document.getElementById('sh').classList.remove('open')}

/* gallery */
function renderGallery(){
  if(!S.unlocked)S.unlocked=[];
  const uc=document.getElementById('unlockCount');if(uc)uc.textContent=S.unlocked.length;
  /* 角色图鉴 */
  const all=getAllPrinces();
  const tc=document.getElementById('totalCharCount');if(tc)tc.textContent=all.length;
  const ac=document.getElementById('unlockCharCount');if(ac)ac.textContent=S.unlockedChars.length;
  const gallery=document.getElementById('charGallery');if(!gallery)return;
  gallery.innerHTML='';
  all.forEach(ch=>{
    const unlocked=S.unlockedChars.includes(ch.id);
    const aff=ch.id==='yukimura'?(S.aff||0):(S.princeAff?.[ch.id]||0);
    const affLv=aff>=50?'💖 亲密':aff>=30?'❤️ 喜欢':aff>=15?'🧡 熟悉':aff>=5?'💛 友好':'🤍 初识';
    const d=document.createElement('div');
    d.style.cssText='background:white;border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border);'+(!unlocked?'opacity:.6':'');
    d.innerHTML=`<div style="display:flex;gap:12px;padding:14px;position:relative">
      <div style="width:60px;height:60px;border-radius:16px;overflow:hidden;flex-shrink:0;background:${ch.color};display:flex;align-items:center;justify-content:center;font-size:28px;color:white;box-shadow:0 3px 10px ${ch.color}40;position:relative">
        <img src="${ch.img}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" onerror="this.style.display='none'"/>
        <span style="position:relative;z-index:0">${ch.ico}</span>
        ${!unlocked?'<div style="position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font-size:16px">🔒</div>':''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span style="font-size:15px;font-weight:700">${ch.name}</span>
          ${unlocked?`<span style="font-size:8.5px;padding:1px 6px;border-radius:6px;background:${ch.color};color:white;font-weight:700">已解锁</span>`:ch.active?'<span style="font-size:8.5px;padding:1px 6px;border-radius:6px;background:#FF9800;color:white;font-weight:700">待激活</span>':'<span style="font-size:8.5px;padding:1px 6px;border-radius:6px;background:#9E9E9E;color:white;font-weight:700">未安装</span>'}
        </div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${ch.school} · ${ch.pos}</div>
        <div style="font-size:11px;color:var(--text);margin-top:3px;line-height:1.5;opacity:.7">${ch.bio}</div>
        ${unlocked?`<div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <span style="font-size:11px">${affLv}</span>
          <div style="flex:1;height:4px;background:var(--p100);border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.min(aff,100)}%;background:linear-gradient(90deg,var(--p400),var(--p600));border-radius:2px"></div></div>
          <span style="font-size:10px;color:var(--p500);font-weight:700">Lv${aff}</span>
        </div>`:ch.active?'<div style="font-size:10px;color:#FF9800;margin-top:6px">🔑 输入激活码解锁</div>':'<div style="font-size:10px;color:var(--muted);margin-top:6px">🔒 角色包未安装</div>'}
      </div>
    </div>`;
    if(unlocked){d.style.cursor='pointer';d.onclick=()=>openCharDetail(ch.id);}
    gallery.appendChild(d);
  });
}
function openCharDetail(cid){
  const ch=CHAR_PACKS[cid];if(!ch)return;
  const aff=cid==='yukimura'?(S.aff||0):(S.princeAff?.[cid]||0);
  const merchCount=(S.bag?.merch||[]).filter(m=>m.prince===cid).length;
  os(ch.ico+' '+ch.name,`<div style="text-align:center">
    <div style="width:80px;height:80px;border-radius:20px;background:${ch.color};margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;overflow:hidden;position:relative;box-shadow:0 4px 16px ${ch.color}40">
      <img src="${ch.img}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" onerror="this.style.display='none'"/><span style="position:relative;z-index:0">${ch.ico}</span>
    </div>
    <div style="font-size:18px;font-weight:700">${ch.name}</div>
    <div style="font-size:12px;color:var(--muted);margin:4px 0 12px">${ch.school} · ${ch.pos}</div>
    <div style="font-size:13px;color:var(--text);line-height:1.7;margin-bottom:12px;font-style:italic">${ch.bio}</div>
    <div style="display:flex;justify-content:center;gap:16px;margin-bottom:8px">
      <div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--p500)">${aff}</div><div style="font-size:10px;color:var(--muted)">好感度</div></div>
      <div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--p500)">${merchCount}</div><div style="font-size:10px;color:var(--muted)">周边</div></div>
    </div>
  </div>`);
}
function unlockCard(idx){
  if(!S.unlocked)S.unlocked=[];
  if(!S.unlocked.includes(idx))S.unlocked.push(idx);
  sv();renderGallery();toast('🎊 解锁了新卡面！');
}
function vc(i){const c=CARDS[i];os(c.t,`<div style="text-align:center"><img src="${c.i}" style="width:100%;border-radius:14px;margin-bottom:12px;aspect-ratio:3/2;object-fit:cover" onerror="this.outerHTML='<div style=&quot;width:100%;aspect-ratio:3/2;background:linear-gradient(135deg,var(--p200),var(--p400));border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:60px;margin-bottom:12px&quot;>${c.ico}</div>'"/><div style="font-size:10px;font-weight:700;background:linear-gradient(135deg,#FFD700,#FF8C00);color:white;border-radius:8px;padding:2px 10px;display:inline-block;margin-bottom:10px">${c.r}</div><div style="font-size:13px;color:var(--muted);line-height:1.8;font-style:italic">${c.d}</div></div>`)}


/* ── MiniMax TTS ── */
async function translateToJP(text){
  const s=S.set;if(!s.key){console.warn('[translateToJP] 无API Key，跳过翻译');return text;}
  const pc=PC[s.prov];if(!pc){console.warn('[translateToJP] 未知provider:',s.prov);return text;}
  try{
    const r=await fetch(pc.url(s.model,s.key),{method:'POST',headers:pc.hd(s.key),
      body:JSON.stringify(pc.body('你是翻译助手。只输出日文翻译结果，不加任何解释、注释、括号或原文。直接输出日语。',[{role:'user',content:'请将下面的中文翻译成自然的日语，只输出日语：\n'+text}]))});
    if(!r.ok){console.error('[translateToJP] HTTP',r.status);return text;}
    const d=await r.json();
    const result=pc.parse(d);
    if(!result||result===text){console.warn('[translateToJP] 翻译失败或返回原文');return text;}
    /* 简单验证：结果应包含至少一个日文字符 */
    const hasJP=/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(result);
    if(!hasJP){console.warn('[translateToJP] 结果不含日文:',result);return text;}
    console.log('[translateToJP]',text,'→',result);
    return result.trim();
  }catch(e){console.error('[translateToJP] Error:',e.message);return text;}
}

async function genVoice(text,vid){
  const s=S.set;
  const voiceId=vid||VOICE_ID;
  const hasOwnKey=s.mmkey&&s.mmgid;
  /* 没有自己的Key就走服务端+扣额度 */
  if(!hasOwnKey&&(S.voiceCredits||0)<=0) return null;
  try{
    const body={text,voiceId,site:hasOwnKey?(s.mmSite||'intl'):'intl'};
    if(hasOwnKey){body.apiKey=s.mmkey;body.groupId=s.mmgid;}
    const r=await fetch('/.netlify/functions/tts',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const d=await r.json();
    if(d.base_resp?.status_code!==0){
      if(d.base_resp?.status_msg)toast('❌ '+d.base_resp.status_msg);
      return null;
    }
    if(!d.data?.audio) return null;
    /* 只有走服务端时才扣额度 */
    if(!hasOwnKey){S.voiceCredits=Math.max(0,(S.voiceCredits||0)-1);sv();updateVoiceCreditsUI();}
    return d.data.audio;
  }catch(e){return null;}
}
/* 检查是否有语音能力（自有Key或有额度） */
function hasVoiceAccess(){return(S.set.mmkey&&S.set.mmgid)||(S.voiceCredits||0)>0;}
function ttsBody(text,vid){
  const s=S.set;const b={text,voiceId:vid||VOICE_ID,site:s.mmkey?(s.mmSite||'intl'):'intl'};
  if(s.mmkey&&s.mmgid){b.apiKey=s.mmkey;b.groupId=s.mmgid;}
  return b;
}
function deductVoiceCredit(n){
  if(!(S.set.mmkey&&S.set.mmgid)){S.voiceCredits=Math.max(0,(S.voiceCredits||0)-(n||1));sv();updateVoiceCreditsUI();}
}
function updateVoiceCreditsUI(){
  const el=document.getElementById('voiceCreditsBadge');
  const credits=S.voiceCredits||0;
  if(el)el.textContent='🎧 '+credits;
  const sd=document.getElementById('voiceCreditsDisplay');
  if(sd)sd.innerHTML=credits+' <span style="font-size:12px;font-weight:400;color:var(--muted)">条</span>';
}

function makeAudioBubble(b, audioB64, jpText, cnText, mine){
  b.style.cssText='padding:0;background:transparent;border:none;box-shadow:none';
  const wrap=document.createElement('div');
  const vc2=document.createElement('div');
  vc2.className='voice-bub'+(mine?' me':'');
  vc2.innerHTML=`<div class="voice-play">▶</div><div class="voice-wave"></div><span style="font-size:11px;color:${mine?'rgba(45,26,90,.7)':'var(--muted)'}">语音</span>`;
  const sub=document.createElement('div');
  sub.className='voice-sub';
  sub.innerHTML=`🇯🇵 ${esc(jpText)}<br/><span style="color:var(--text)">📝 ${esc(cnText)}</span>`;
  let audio=null;
  vc2.addEventListener('click',()=>{
    if(!audio){
      audio=new Audio('data:audio/mp3;base64,'+audioB64);
      const dur=audio.duration||3;
      vc2.style.setProperty('--dur',dur+'s');
      audio.addEventListener('ended',()=>{vc2.classList.remove('playing');vc2.querySelector('.voice-play').textContent='▶'});
    }
    if(vc2.classList.contains('playing')){audio.pause();audio.currentTime=0;vc2.classList.remove('playing');vc2.querySelector('.voice-play').textContent='▶';}
    else{audio.play();vc2.classList.add('playing');vc2.querySelector('.voice-play').textContent='⏸';}
  });
  wrap.appendChild(vc2);wrap.appendChild(sub);b.appendChild(wrap);
}

async function playMsgVoice(m, btn){
  if(!hasVoiceAccess()){toast('🎧 语音额度已用完');return;}
  btn.innerHTML='⏳';
  try{
    const cid=m._chatId||_curChatId;
    const ch=CHAR_PACKS[cid];
    const vid=ch&&ch.voiceId?ch.voiceId:VOICE_ID;
    const jp=await translateToJP(m.text);
    const s=S.set;const hasOwnKey=s.mmkey&&s.mmgid;
    const body={text:jp,voiceId:vid,site:hasOwnKey?(s.mmSite||'intl'):'intl'};
    if(hasOwnKey){body.apiKey=s.mmkey;body.groupId=s.mmgid;}
    const r=await fetch('/.netlify/functions/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json();
    if(!d.data?.audio){toast('❌ '+(d.base_resp?.status_msg||'音频失败'));btn.innerHTML='▶';return;}
    deductVoiceCredit(1);
    const audio=new Audio('data:audio/mp3;base64,'+d.data.audio);
    btn.innerHTML='⏸';
    audio.addEventListener('ended',()=>{btn.innerHTML='▶';});
    audio.play();
  }catch(e){
    toast('❌ '+e.message);
    btn.innerHTML='▶';
  }
}

/* ── 气泡菜单 ── */
let _curMid=null,_curBub=null;
function showBubbleMenu(mid,bub,isMine){
  _curMid=mid;_curBub=bub;
  var menu=document.getElementById('bubbleMenu');
  var r=bub.getBoundingClientRect();
  menu.style.left=Math.min(r.left,window.innerWidth-150)+'px';
  menu.style.top=(r.bottom+6)+'px';
  menu.querySelectorAll('.bm-char').forEach(function(el){el.style.display=isMine?'none':'flex'});
  menu.querySelectorAll('.bm-me').forEach(function(el){el.style.display=isMine?'flex':'none'});
  menu.classList.add('show');
  setTimeout(()=>document.addEventListener('touchstart',function _bmc(e){
    var m=document.getElementById('bubbleMenu');
    if(m&&!m.contains(e.target)){closeBubbleMenu();document.removeEventListener('touchstart',_bmc);}
  },{once:true,passive:true}),300);
}
function closeBubbleMenu(){document.getElementById('bubbleMenu').classList.remove('show');}
function bmCopy(){
  const m=window._vm&&window._vm[_curMid];
  if(m&&navigator.clipboard)navigator.clipboard.writeText(m.text||'');
  closeBubbleMenu();toast('📋 已复制');
}
function bmPlayVoice(){
  closeBubbleMenu();
  const m=window._vm&&window._vm[_curMid];
  if(!m){toast('找不到消息');return;}
  const s=S.set;
  if(!hasVoiceAccess()){toast('🎧 语音额度已用完');return;}
  const chatId=m._chatId||_curChatId;
  const ch=CHAR_PACKS[chatId];
  const vid=ch&&ch.voiceId?ch.voiceId:VOICE_ID;
  const actx=new(window.AudioContext||window.webkitAudioContext)();
  const unlock=actx.createBuffer(1,1,22050);
  const us=actx.createBufferSource();us.buffer=unlock;us.connect(actx.destination);us.start(0);

  /* 有缓存直接播 */
  if(m._audioB64){
    const raw=atob(m._audioB64);const arr=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
    actx.decodeAudioData(arr.buffer).then(buf=>{
      const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);src.start(0);
      toast('▶ 播放中');src.onended=()=>actx.close();
    }).catch(()=>actx.close());
    return;
  }

  toast('🎙️ 生成语音中…');
  translateToJP(m.text).then(jp=>{
    return fetch('/.netlify/functions/tts',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(ttsBody(jp,vid))});
  }).then(r=>r.json()).then(d=>{
    if(!d.data?.audio){toast('❌ '+(d.base_resp?.status_msg||'音频为空'));actx.close();return;}
    m._audioB64=d.data.audio;
    const raw=atob(d.data.audio);const arr=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
    return actx.decodeAudioData(arr.buffer);
  }).then(buf=>{
    if(!buf){actx.close();return;}
    const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);src.start(0);
    toast('▶ 播放中');src.onended=()=>actx.close();
  }).catch(e=>{toast('❌ '+e.message);try{actx.close();}catch(_){}});
}

/* toast */
function toast(t){const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2800)}

/* ── 重新生成 ── */
async function bmRegen(){
  closeBubbleMenu();
  const m=window._vm&&window._vm[_curMid];
  if(!m){toast('找不到消息');return;}
  const cid=m._chatId||_curChatId;
  const msgs=getChatMsgs(cid);
  const idx=msgs.findIndex(x=>x.id===_curMid);
  if(idx<0){toast('消息未找到');return;}
  toast('🔄 重新生成中…');
  let rep='';
  if(S.set.key)rep=await callApi(cid)||'';
  if(!rep)rep=or('',cid);
  msgs[idx].text=rep;
  msgs[idx].time=Date.now();
  delete msgs[idx]._audioB64; /* 清除语音缓存 */
  sv();rm();
  toast('✅ 已重新生成');
}

/* ── 删除消息 ── */
function bmDelete(){
  closeBubbleMenu();
  const m=window._vm&&window._vm[_curMid];
  if(!m)return;
  const cid=m._chatId||_curChatId;
  const msgs=getChatMsgs(cid);
  const idx=msgs.findIndex(x=>x.id===_curMid);
  if(idx<0)return;
  msgs.splice(idx,1);
  if(cid==='yukimura')S.msgs=msgs;
  sv();rm();
  toast('🗑️ 已删除');
}

/* ── 撤回消息 ── */
function bmRecall(){
  closeBubbleMenu();
  var m=window._vm&&window._vm[_curMid];
  if(!m)return;
  var cid=m._chatId||_curChatId;
  var msgs=getChatMsgs(cid);
  var idx=msgs.findIndex(function(x){return x.id===_curMid});
  if(idx<0)return;
  var ch=CHAR_PACKS[cid];
  msgs.splice(idx,1,{id:rid(),sender:'sys',text:'你撤回了一条消息',time:Date.now(),type:'sys'});
  if(cid==='yukimura')S.msgs=msgs;
  sv();rm();
  var RECALL_REACT={
    yukimura:['……我看到了。','撤回也没用，我记得。','嗯？','想说什么。','……被我看到了。'],
    fuji:['呐，我已经看到了哦。','撤回了？有意思。','来不及了呢。'],
    ryoma:['切，我已经看到了。','……哦。','干嘛撤回。'],
  };
  var pool=RECALL_REACT[cid]||RECALL_REACT.yukimura;
  if(Math.random()<0.7){
    setTimeout(function(){
      msgs.push({id:rid(),sender:'c',text:pool[Math.floor(Math.random()*pool.length)],time:Date.now(),type:'txt'});
      sv();rm();
    },800+Math.random()*1500);
  }
}


