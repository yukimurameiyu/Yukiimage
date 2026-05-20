/* ══════════════════════════════════════════
   phone.js — Phone system
   ══════════════════════════════════════════ */

let _phoneAudio=null;
let _phoneTimer=null;
let _phoneSeconds=0;
let _phoneCallIdx=-1;

function renderPhone(){
  const list=document.getElementById('phoneReadyList');if(!list)return;
  const ready=(S.phoneReady||[]).filter(r=>S.unlockedChars.includes(r.prince));
  if(!ready.length){list.innerHTML='<div style="font-size:12px;color:var(--muted);text-align:center;padding:12px">暂无待接来电<br/><span style="font-size:11px">在桃宝购买电话卡后激活</span></div>';}
  else{ list.innerHTML=ready.map((r,i)=>{
    const ch=CHAR_PACKS[r.prince]||{name:r.prince,ico:'👤',color:'#666'};
    const realIdx=S.phoneReady.indexOf(r);
    return`<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--p50);border-radius:12px;margin-bottom:6px">
      <div style="width:40px;height:40px;border-radius:12px;background:${ch.color};display:flex;align-items:center;justify-content:center;font-size:20px;color:white">${ch.ico}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${ch.name}</div><div style="font-size:10px;color:var(--muted)">来电已激活 · ${new Date(r.ts).toLocaleDateString('zh-CN')}</div></div>
      <button onclick="startPhoneCall(${realIdx})" style="padding:6px 14px;border-radius:12px;background:#4CAF50;color:white;border:none;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">📞 接听</button>
    </div>`;
  }).join(''); }
  /* 通话记录 */
  const logEl=document.getElementById('phoneLogList');if(!logEl)return;
  const logs=S.phoneLogs||[];
  if(!logs.length){logEl.innerHTML='<div style="font-size:12px;color:var(--muted);text-align:center;padding:12px">暂无通话记录</div>';return;}
  logEl.innerHTML=logs.slice(0,20).map((log,i)=>{
    const ch=CHAR_PACKS[log.prince]||{name:log.prince,ico:'👤',color:'#666'};
    const dur=log.duration?Math.floor(log.duration/60)+':'+('0'+log.duration%60).slice(-2):'--';
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:18px">${ch.ico}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:600">${ch.name}</div><div style="font-size:10px;color:var(--muted)">${new Date(log.ts).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} · ${dur}</div></div>
      ${log.hasAudio?`<button onclick="replayLog(${i})" style="padding:4px 10px;border-radius:8px;background:var(--p50);border:1px solid var(--border);font-size:10px;cursor:pointer;font-family:inherit;color:var(--p600)">▶ 回听</button>`:''}
    </div>`;
  }).join('');
}

async function startPhoneCall(idx){
  const r=(S.phoneReady||[])[idx];if(!r)return;
  const ch=CHAR_PACKS[r.prince]||{name:r.prince,ico:'👤',color:'#666'};
  const s=S.set;
  _phoneCallIdx=idx;

  /* 检查API配置 */
  if(!s.key){toast('⚠️ 请先在设置里配置AI接口');return;}

  /* ★ 移动端音频解锁：在用户手势上下文中预创建Audio并播放静音 */
  _phoneAudio=new Audio();
  try{
    const silenceB64='SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYlMZijAAAAAAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYlMZijAAAAAAAAAAAAAAAAAAAA';
    _phoneAudio.src='data:audio/mp3;base64,'+silenceB64;
    await _phoneAudio.play().catch(()=>{});
    _phoneAudio.pause();
    _phoneAudio.currentTime=0;
  }catch(e){/* 静默处理 */}

  /* 打开电话界面 */
  document.getElementById('phoneAva').textContent=ch.ico;
  document.getElementById('phoneAva').style.background=ch.color;
  document.getElementById('phoneName').textContent=ch.name;
  document.getElementById('phoneCallStatus').textContent='来电中…';
  document.getElementById('phonePfill').style.width='0%';
  document.getElementById('phonePtext').textContent='';
  document.getElementById('phoneProgressWrap').style.display='';
  document.getElementById('phoneWaveWrap').style.display='none';
  document.getElementById('phoneTimer').style.display='none';
  document.getElementById('phoneText').style.display='none';
  document.getElementById('phoneReplayBtn').style.display='none';
  document.getElementById('phoneOverlay').classList.add('open');

  try{
    /* Step 1: AI生成通话内容 */
    await sleep(800);
    document.getElementById('phoneCallStatus').textContent='正在接通…';
    document.getElementById('phonePtext').textContent='正在生成通话内容…';
    document.getElementById('phonePfill').style.width='15%';

    const charSys=ch.sys||`你是${ch.name}，${ch.school}${ch.pos}。`;
    const userName=s.name||'你';
    const aff=(r.prince==='yukimura')?(S.aff||0):((S.princeAff&&S.princeAff[r.prince])||0);
    const affHint=aff>=50?'你们关系非常亲密。':aff>=30?'你们已经很熟悉了。':'你们是朋友关系。';

    const phonePrompt=charSys+'\n\n【场景】你正在给'+userName+'打电话。'+affHint+'请生成一段你在电话里会说的内容，语气自然亲切，像真的在打电话一样。内容可以包括：问候、分享近况、表达关心、聊些日常。字数控制在150-250字，不要写动作描写，只写你说的话（对白），用中文。分2-3段，每段换行。';

    const pc=PC[s.prov];if(!pc)throw new Error('无效的AI provider');
    const apiR=await fetch(pc.url(s.model,s.key),{method:'POST',headers:pc.hd(s.key),
      body:JSON.stringify(pc.body(phonePrompt,[{role:'user',content:'请打电话给我吧，我想听你说话。'}]))});
    if(!apiR.ok)throw new Error('AI API错误:'+apiR.status);
    const apiD=await apiR.json();
    const cnText=pc.parse(apiD);
    if(!cnText)throw new Error('AI返回为空');

    document.getElementById('phonePfill').style.width='40%';
    document.getElementById('phonePtext').textContent='通话内容已生成…';

    /* Step 2: 翻译成日文 */
    let jpText=cnText;
    let hasVoice=false;
    if(hasVoiceAccess()){
      document.getElementById('phonePtext').textContent='正在翻译为日文…';
      document.getElementById('phonePfill').style.width='55%';
      jpText=await translateToJP(cnText);
      document.getElementById('phonePfill').style.width='65%';

      /* Step 3: TTS语音生成 */
      document.getElementById('phonePtext').textContent='正在生成语音…';
      const vid=ch.voiceId||VOICE_ID;
      try{
        const ttsR=await fetch('/.netlify/functions/tts',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(ttsBody(jpText,vid))});
        const ttsD=await ttsR.json();
        if(ttsD.data?.audio){
          _phoneAudio.src='data:audio/mp3;base64,'+ttsD.data.audio;
          hasVoice=true;
          /* 扣减语音额度（电话算3条） */
          deductVoiceCredit(3);

          /* 保存通话记录（音频存IndexedDB） */
          if(!S.phoneLogs)S.phoneLogs=[];
          const logTs=Date.now();
          const logEntry={prince:r.prince,ts:logTs,cnText,jpText,hasAudio:true,duration:0};
          /* 异步存音频到IndexedDB（不阻塞播放） */
          savePhoneAudio(logTs,ttsD.data.audio).catch(e=>console.warn('savePhoneAudio fail:',e));

          document.getElementById('phonePfill').style.width='100%';
          document.getElementById('phonePtext').textContent='连接成功！';
          await sleep(500);

          /* 开始播放 */
          document.getElementById('phoneCallStatus').textContent='通话中';
          document.getElementById('phoneProgressWrap').style.display='none';
          document.getElementById('phoneWaveWrap').style.display='flex';
          document.getElementById('phoneTimer').style.display='';
          document.getElementById('phoneText').style.display='';
          document.getElementById('phoneText').textContent=cnText;
          document.getElementById('phoneReplayBtn').style.display='';

          _phoneSeconds=0;
          _phoneTimer=setInterval(()=>{
            _phoneSeconds++;
            document.getElementById('phoneTimer').textContent=
              Math.floor(_phoneSeconds/60)+':'+('0'+_phoneSeconds%60).slice(-2);
          },1000);

          _phoneAudio.load();
          await new Promise(res=>{_phoneAudio.oncanplaythrough=res;setTimeout(res,3000);});
          _phoneAudio.play().catch(e=>console.warn('Phone audio play failed:',e));
          _phoneAudio.onended=()=>{
            logEntry.duration=_phoneSeconds;
            document.getElementById('phoneCallStatus').textContent='通话结束';
            document.getElementById('phoneWaveWrap').style.display='none';
            if(_phoneTimer){clearInterval(_phoneTimer);_phoneTimer=null;}
          };

          /* 移除待接来电，保存记录 */
          S.phoneReady.splice(idx,1);
          S.phoneLogs.unshift(logEntry);
          if(S.phoneLogs.length>20)S.phoneLogs=S.phoneLogs.slice(0,20);
          sv();
          return;
        }
      }catch(e){console.error('TTS error:',e);}
    }

    /* 无语音时：只显示文字 */
    document.getElementById('phonePfill').style.width='100%';
    document.getElementById('phonePtext').textContent='已接通（文字模式）';
    await sleep(500);
    document.getElementById('phoneCallStatus').textContent='通话中（文字）';
    document.getElementById('phoneProgressWrap').style.display='none';
    document.getElementById('phoneText').style.display='';
    document.getElementById('phoneText').innerHTML=cnText.replace(/\n/g,'<br/>');
    if(jpText!==cnText){
      document.getElementById('phoneText').innerHTML+='<br/><br/><span style="font-size:12px;color:rgba(255,255,255,.4)">'+jpText.replace(/\n/g,'<br/>')+'</span>';
    }
    S.phoneReady.splice(idx,1);
    if(!S.phoneLogs)S.phoneLogs=[];
    S.phoneLogs.unshift({prince:r.prince,ts:Date.now(),cnText,duration:0});
    if(S.phoneLogs.length>20)S.phoneLogs=S.phoneLogs.slice(0,20);
    sv();

  }catch(e){
    console.error('Phone call error:',e);
    document.getElementById('phoneCallStatus').textContent='连接失败';
    document.getElementById('phonePtext').textContent=e.message||'请检查API设置';
    document.getElementById('phonePfill').style.width='0%';
  }
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function endPhoneCall(){
  if(_phoneAudio){_phoneAudio.pause();_phoneAudio=null;}
  if(_phoneTimer){clearInterval(_phoneTimer);_phoneTimer=null;}
  document.getElementById('phoneOverlay').classList.remove('open');
  renderPhone();
}

function replayPhoneAudio(){
  if(_phoneAudio){
    _phoneAudio.currentTime=0;
    _phoneAudio.play();
    _phoneSeconds=0;
    document.getElementById('phoneCallStatus').textContent='通话中';
    document.getElementById('phoneWaveWrap').style.display='flex';
    if(_phoneTimer)clearInterval(_phoneTimer);
    _phoneTimer=setInterval(()=>{
      _phoneSeconds++;
      document.getElementById('phoneTimer').textContent=
        Math.floor(_phoneSeconds/60)+':'+('0'+_phoneSeconds%60).slice(-2);
    },1000);
    _phoneAudio.onended=()=>{
      document.getElementById('phoneCallStatus').textContent='通话结束';
      document.getElementById('phoneWaveWrap').style.display='none';
      if(_phoneTimer){clearInterval(_phoneTimer);_phoneTimer=null;}
    };
  }
}

async function replayLog(idx){
  const log=(S.phoneLogs||[])[idx];if(!log||!log.hasAudio)return;
  const ch=CHAR_PACKS[log.prince]||{name:log.prince,ico:'👤',color:'#666'};
  document.getElementById('phoneAva').textContent=ch.ico;
  document.getElementById('phoneAva').style.background=ch.color;
  document.getElementById('phoneName').textContent=ch.name;
  document.getElementById('phoneCallStatus').textContent='加载中…';
  document.getElementById('phoneProgressWrap').style.display='none';
  document.getElementById('phoneWaveWrap').style.display='none';
  document.getElementById('phoneTimer').style.display='none';
  document.getElementById('phoneText').style.display='';
  document.getElementById('phoneText').textContent=log.cnText;
  document.getElementById('phoneReplayBtn').style.display='';
  document.getElementById('phoneOverlay').classList.add('open');

  /* 从IndexedDB读取音频 */
  const audioB64=await getPhoneAudio(log.ts);
  if(!audioB64){
    document.getElementById('phoneCallStatus').textContent='音频已过期';
    return;
  }
  _phoneAudio=new Audio('data:audio/mp3;base64,'+audioB64);
  document.getElementById('phoneCallStatus').textContent='回听中';
  document.getElementById('phoneWaveWrap').style.display='flex';
  document.getElementById('phoneTimer').style.display='';
  _phoneSeconds=0;
  _phoneTimer=setInterval(()=>{
    _phoneSeconds++;
    document.getElementById('phoneTimer').textContent=
      Math.floor(_phoneSeconds/60)+':'+('0'+_phoneSeconds%60).slice(-2);
  },1000);
  _phoneAudio.play();
  _phoneAudio.onended=()=>{
    document.getElementById('phoneCallStatus').textContent='回听结束';
    document.getElementById('phoneWaveWrap').style.display='none';
    if(_phoneTimer){clearInterval(_phoneTimer);_phoneTimer=null;}
  };
}

