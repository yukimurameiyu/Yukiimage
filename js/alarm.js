/* ══════════════════════════════════════════
   alarm.js — Alarm system
   ══════════════════════════════════════════ */

function renderAlarms(){
  if(!S.alarms)S.alarms=[];
  const list=document.getElementById('alarmList');if(!list)return;
  list.innerHTML='';
  if(!S.alarms.length){
    const empty=document.createElement('div');
    empty.style.cssText='text-align:center;padding:40px 20px;color:var(--muted);font-size:13px';
    empty.innerHTML='还没有闹钟<br/><span style="font-size:11px;opacity:.7">点下方按钮添加</span>';
    list.appendChild(empty);return;
  }
  S.alarms.forEach((a,i)=>{
    const div=document.createElement('div');div.className='alarm-item';
    const days=a.days.length===7?'每天':a.days.length===0?'仅一次':a.days.map(d=>DAY_NAMES[d]).join(' ');
    div.innerHTML=`
      <div style="flex:1;cursor:pointer" onclick="editAlarm(${i})">
        <div class="alarm-t">${a.time}</div>
        <div class="alarm-d">${days}</div>
      </div>
      <div class="alarm-toggle ${a.on?'on':''}" onclick="toggleAlarm(${i})"></div>
      <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:18px;margin-left:8px" onclick="deleteAlarm(${i})">×</div>
    `;
    list.appendChild(div);
  });
}

function addAlarm(){
  os('添加闹钟',`
    <div>
      <div style="text-align:center;margin-bottom:16px">
        <input type="time" id="at" value="07:00" style="font-size:36px;font-weight:200;border:none;outline:none;color:var(--p700);letter-spacing:-1px;background:transparent;font-family:inherit;text-align:center"/>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;letter-spacing:.5px">重复</div>
      <div style="display:flex;gap:6px;margin-bottom:16px" id="dayPicker">
        ${DAY_NAMES.map((d,i)=>`<div onclick="this.classList.toggle('active');this.style.background=this.classList.contains('active')?'var(--p500)':'var(--p100)';this.style.color=this.classList.contains('active')?'white':'var(--p600)'" data-day="${i}" style="flex:1;padding:8px 0;text-align:center;border-radius:10px;background:var(--p100);color:var(--p600);font-size:12px;cursor:pointer;transition:all .2s">${d}</div>`).join('')}
      </div>
      <button class="shbtn p" onclick="saveAlarm()">保存闹钟</button>
    </div>
  `);
}

/* 全局闹钟AudioContext —— 在用户设闹钟时解锁，闹钟响时复用 */
let _alarmCtx=null;
function ensureAlarmCtx(){
  if(!_alarmCtx||_alarmCtx.state==='closed'){
    _alarmCtx=new(window.AudioContext||window.webkitAudioContext)();
  }
  if(_alarmCtx.state==='suspended') _alarmCtx.resume();
  /* 播放一帧静音保持解锁 */
  const b=_alarmCtx.createBuffer(1,1,22050);
  const s=_alarmCtx.createBufferSource();s.buffer=b;s.connect(_alarmCtx.destination);s.start(0);
  return _alarmCtx;
}

function saveAlarm(){
  const t=document.getElementById('at')?.value;if(!t)return;
  const days=Array.from(document.querySelectorAll('#dayPicker [data-day].active')).map(el=>+el.dataset.day);
  if(!S.alarms)S.alarms=[];
  S.alarms.push({time:t,days,on:true});
  try{ensureAlarmCtx();}catch(e){}
  sv();renderAlarms();
  /* 保存后弹出日历同步选项 */
  const dayLabel=days.length===7?'每天':days.length===0?'仅一次':days.map(d=>DAY_NAMES[d]).join('、');
  os('⏰ 闹钟已设置',`
    <div style="text-align:center">
      <div style="font-size:48px;margin-bottom:8px">⏰</div>
      <div style="font-size:20px;font-weight:200;color:var(--p700);margin-bottom:4px">${t}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:20px">${dayLabel}</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.8;margin-bottom:16px">
        网页闹钟需要页面保持打开才能响<br/>建议同步到系统日历，通知点开即可听语音
      </div>
      <button class="shbtn p" style="margin-bottom:10px" onclick="downloadICS('${t}',[${days}]);cs()">📅 同步到系统日历</button>
      <div style="color:var(--muted);font-size:12px;cursor:pointer;padding:8px" onclick="cs()">不用了</div>
    </div>
  `);
}

/* 生成 .ics 日历文件 */
function downloadICS(time, days){
  const [hh,mm]=time.split(':').map(Number);
  const now=new Date();
  /* 找到下一个触发日期 */
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate(),hh,mm,0);
  if(start<=now) start.setDate(start.getDate()+1);
  if(days.length>0&&days.length<7){
    /* 找到最近的匹配星期 */
    for(let i=0;i<7;i++){
      if(days.includes(start.getDay())) break;
      start.setDate(start.getDate()+1);
    }
  }
  const end=new Date(start.getTime()+5*60*1000);/* 5分钟时长 */
  const fmt=d=>{
    const p=n=>String(n).padStart(2,'0');
    return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
  };
  /* RRULE */
  let rrule='';
  if(days.length===7){
    rrule='RRULE:FREQ=DAILY';
  }else if(days.length>0){
    const dayMap=['SU','MO','TU','WE','TH','FR','SA'];
    rrule='RRULE:FREQ=WEEKLY;BYDAY='+days.map(d=>dayMap[d]).join(',');
  }
  const siteUrl=location.origin||'https://yuraworld.netlify.app';
  const uid='yukimura-alarm-'+Date.now()+'@yuraworld';
  const ics=[
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YukimuraWorld//Alarm//CN',
    'BEGIN:VEVENT',
    'UID:'+uid,
    'DTSTART:'+fmt(start),
    'DTEND:'+fmt(end),
    'SUMMARY:⏰ 幸村精市叫早',
    'DESCRIPTION:点击链接打开网页\\n听幸村的语音叫早 💜',
    'URL:'+siteUrl,
    rrule,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:幸村精市叫你起床了',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  /* iOS Safari: window.open 比 a.click 更可靠 */
  const opened=window.open(url,'_blank');
  if(!opened){
    /* 弹窗被拦截时 fallback 到 a.click */
    const a=document.createElement('a');
    a.href=url;a.download='yukimura-alarm.ics';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }
  setTimeout(()=>URL.revokeObjectURL(url),5000);
  toast('📅 打开日历文件中…');
}

function editAlarm(i){
  const a=S.alarms[i];
  os('编辑闹钟',`
    <div>
      <div style="text-align:center;margin-bottom:16px">
        <input type="time" id="at2" value="${a.time}" style="font-size:36px;font-weight:200;border:none;outline:none;color:var(--p700);letter-spacing:-1px;background:transparent;font-family:inherit;text-align:center"/>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;letter-spacing:.5px">重复</div>
      <div style="display:flex;gap:6px;margin-bottom:16px" id="dayPicker2">
        ${DAY_NAMES.map((d,di)=>`<div onclick="this.classList.toggle('active');this.style.background=this.classList.contains('active')?'var(--p500)':'var(--p100)';this.style.color=this.classList.contains('active')?'white':'var(--p600)'" data-day="${di}" class="${a.days.includes(di)?'active':''}" style="flex:1;padding:8px 0;text-align:center;border-radius:10px;background:${a.days.includes(di)?'var(--p500)':'var(--p100)'};color:${a.days.includes(di)?'white':'var(--p600)'};font-size:12px;cursor:pointer;transition:all .2s">${d}</div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="shbtn p" style="flex:1" onclick="updateAlarm(${i})">保存</button>
        <button class="shbtn" style="flex:0 0 auto;background:#E05050;width:48px" onclick="deleteAlarm(${i});cs()">删</button>
      </div>
    </div>
  `);
}

function updateAlarm(i){
  const t=document.getElementById('at2')?.value;if(!t)return;
  const days=Array.from(document.querySelectorAll('#dayPicker2 [data-day].active')).map(el=>+el.dataset.day);
  S.alarms[i]={...S.alarms[i],time:t,days};
  ensureAlarmCtx();
  sv();cs();renderAlarms();toast('⏰ 闹钟已更新');
}

function toggleAlarm(i){S.alarms[i].on=!S.alarms[i].on;ensureAlarmCtx();sv();renderAlarms();}
function deleteAlarm(i){S.alarms.splice(i,1);sv();renderAlarms();}

/* 检查闹钟 */
let lastAlarmMinute='';
function checkAlarms(){
  if(!S.alarms?.length)return;
  const now=new Date();
  const hm=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const day=now.getDay();
  if(hm===lastAlarmMinute)return;
  for(const a of S.alarms){
    if(!a.on||a.time!==hm)continue;
    if(a.days.length>0&&!a.days.includes(day))continue;
    triggerAlarm(hm);
    lastAlarmMinute=hm;
    break;
  }
}

function triggerAlarm(timeStr){
  const h=parseInt(timeStr.split(':')[0]);
  /* 随机选一个已激活角色叫早 */
  const activeChars=Object.entries(CHAR_PACKS).filter(([k,v])=>v.active&&S.unlockedChars.includes(k)&&ALARM_MSGS[k]);
  const [charId,charData]=activeChars.length?activeChars[Math.floor(Math.random()*activeChars.length)]:['yukimura',CHAR_PACKS.yukimura];
  const charMsgs=ALARM_MSGS[charId]||ALARM_MSGS.yukimura;
  let pool=h<9?charMsgs.morning:h<12?charMsgs.late:h<14?charMsgs.noon:charMsgs.default;
  const msg=pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('alarmMsg').textContent=charData.ico+' '+charData.name+'：'+msg;
  document.getElementById('alarmTimeDisplay').textContent=timeStr;
  document.getElementById('alarmOverlay').classList.add('ring');
  if('Notification' in window&&Notification.permission==='granted'){
    new Notification(charData.name+'叫早',{body:msg,icon:charData.img||'chibi-normal.png'});
  }else if('Notification' in window&&Notification.permission!=='denied'){
    Notification.requestPermission();
  }
  /* 语音叫早：优先用预解锁的AudioContext */
  if(hasVoiceAccess()){
    translateToJP(msg).then(jp=>genVoice(jp)).then(b64=>{
      if(!b64)return;
      /* 尝试用预解锁的AudioContext */
      const actx=_alarmCtx&&_alarmCtx.state!=='closed'?_alarmCtx:null;
      if(actx){
        if(actx.state==='suspended') actx.resume();
        const raw=atob(b64);const arr=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
        actx.decodeAudioData(arr.buffer).then(buf=>{
          const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);src.start(0);
        }).catch(()=>{});
      }else{
        /* AudioContext不可用，fallback到Audio元素尝试+手动按钮 */
        const a=new Audio('data:audio/mp3;base64,'+b64);
        a.play().catch(()=>{
          let pb=document.getElementById('alarmPlayBtn');
          if(!pb){
            pb=document.createElement('button');pb.id='alarmPlayBtn';
            pb.textContent='🔊 播放幸村语音';
            pb.style.cssText='background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.3);color:white;border-radius:20px;padding:10px 24px;font-size:14px;cursor:pointer;font-family:inherit;margin-top:12px';
            document.getElementById('alarmOverlay').insertBefore(pb,document.querySelector('.alarm-dismiss'));
          }
          pb.onclick=()=>{
            const ctx2=new(window.AudioContext||window.webkitAudioContext)();
            const r2=atob(b64);const a2=new Uint8Array(r2.length);
            for(let i=0;i<r2.length;i++) a2[i]=r2.charCodeAt(i);
            ctx2.decodeAudioData(a2.buffer).then(buf=>{
              const s2=ctx2.createBufferSource();s2.buffer=buf;s2.connect(ctx2.destination);s2.start(0);
              pb.textContent='▶ 播放中';s2.onended=()=>{pb.remove();ctx2.close();};
            }).catch(()=>{pb.remove();ctx2.close();});
          };
        });
      }
    });
  }
}

function dismissAlarm(){document.getElementById('alarmOverlay').classList.remove('ring');const pb=document.getElementById('alarmPlayBtn');if(pb)pb.remove();}
function snoozeAlarm(){
  dismissAlarm();
  setTimeout(()=>triggerAlarm(document.getElementById('alarmTimeDisplay').textContent),5*60*1000);
  toast('⏰ 5分钟后再叫你');
}
