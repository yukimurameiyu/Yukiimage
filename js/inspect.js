/* ══════════════════════════════════════════
   inspect.js — Inspect system
   ══════════════════════════════════════════ */

/* ── 不二周助 查岗数据 ── */

/* ── 越前龙马 查岗数据 ── */

let _inspectChar='yukimura';
function switchInspect(cid){
  _inspectChar=cid;
  const ch=CHAR_PACKS[cid];if(!ch)return;
  document.querySelectorAll('.insp-char').forEach(el=>{
    const active=el.dataset.cid===cid;
    el.style.borderColor=active?ch.color:'var(--border)';
    el.style.background=active?ch.color+'18':'white';
    el.style.color=active?ch.color:'var(--muted)';
  });
  document.getElementById('inspectSubtitle').textContent=ch.name+' · 实时行踪';
  renderInspect();
}



function getHour(){ return new Date().getHours()+(new Date().getMinutes()/60); }
function isWeekend(){ const d=new Date().getDay();return d===0||d===6; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getCurrentStatus(){
  const h=getHour();
  if(isWeekend()){
    /* 周末按时间段 */
    if(h<6) return {label:'💤 灭五感中',detail:'请勿打扰。',img:'chibi-down.png'};
    if(h<9) return {label:'🌅 起床中',detail:pick(['难得睡到8点多','今天7点多就起了，习惯了','在阳台浇花']),img:'chibi-normal.png'};
    const ev=pick(WEEKEND_EVENTS);
    return {label:ev.label,detail:typeof ev.detail==='function'?ev.detail():ev.detail,img:'chibi-normal.png'};
  }
  const slot=WEEKDAY_SCHEDULE.find(s=>h>=s.s&&h<s.e)||WEEKDAY_SCHEDULE[0];
  return {
    label:slot.label,
    detail:typeof slot.detail==='function'?slot.detail():slot.detail,
    img:slot.img||'chibi-normal.png'
  };
}

function renderInspect(){
  /* 动态生成角色切换栏（只显示已解锁角色） */
  const bar=document.getElementById('inspectCharBar');
  if(bar){
    const unlocked=Object.entries(CHAR_PACKS).filter(([k,v])=>v.active&&S.unlockedChars.includes(k));
    bar.innerHTML=unlocked.map(([cid,ch])=>{
      const active=cid===_inspectChar;
      return`<div class="insp-char" data-cid="${cid}" onclick="switchInspect('${cid}')" style="padding:6px 14px;border-radius:20px;border:2px solid ${active?ch.color:'var(--border)'};background:${active?ch.color+'18':'white'};color:${active?ch.color:'var(--muted)'};font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .2s">${ch.ico} ${ch.name}</div>`;
    }).join('');
    if(unlocked.length&&!unlocked.find(([k])=>k===_inspectChar)){_inspectChar=unlocked[0][0];}
  }
  const cid=_inspectChar||'yukimura';
  const ch=CHAR_PACKS[cid]||CHAR_PACKS.yukimura;
  const schedule=cid==='fuji'?FUJI_SCHEDULE:cid==='ryoma'?RYOMA_SCHEDULE:WEEKDAY_SCHEDULE;
  const weekendEvts=cid==='fuji'?FUJI_WEEKEND_EVENTS:cid==='ryoma'?RYOMA_WEEKEND_EVENTS:WEEKEND_EVENTS;
  const shopRecords=cid==='fuji'?FUJI_SHOPPING:cid==='ryoma'?RYOMA_SHOPPING:SHOPPING_RECORDS;

  /* 当前状态 */
  const h=getHour();
  let st;
  if(isWeekend()){
    if(h<6) st={label:'💤 睡眠中',detail:'请勿打扰。',img:'chibi-down.png'};
    else if(h<9) st={label:'🌅 起床中',detail:cid==='ryoma'?pick(['被卡鲁宾踩醒了','还想再睡……']):cid==='fuji'?pick(['在阳台拍朝霞','给仙人掌浇水']):pick(['难得睡到8点多','今天7点多就起了']),img:'chibi-normal.png'};
    else{const ev=pick(weekendEvts);st={label:ev.label,detail:typeof ev.detail==='function'?ev.detail():ev.detail,img:'chibi-normal.png'};}
  }else{
    const slot=schedule.find(s=>h>=s.s&&h<s.e)||schedule[0];
    st={label:slot.label,detail:typeof slot.detail==='function'?slot.detail():slot.detail,img:slot.img||'chibi-normal.png'};
  }
  const now=new Date();
  document.getElementById('inspectStatus').textContent=st.label;
  document.getElementById('inspectDetail').textContent=st.detail;
  document.getElementById('inspectTime').textContent=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+' · '+(isWeekend()?'周末':'工作日');
  const chi=document.getElementById('inspectChibi');
  if(chi){chi.src=ch.img||st.img;chi.onerror=()=>chi.style.display='none';}

  /* 今日行程 */
  const list=document.getElementById('scheduleList');
  if(list){
    const slots=isWeekend()?[
      {s:0,e:6,label:'💤 睡眠中'},{s:6,e:9,label:'🌅 起床/早晨时光'},
      {s:9,e:12,label:'☀️ 上午自由活动'},{s:12,e:13.5,label:'🍱 午餐'},
      {s:13.5,e:18,label:'☀️ 下午自由活动'},{s:18,e:20,label:'🍜 晚餐/休息'},
      {s:20,e:24,label:'🌙 晚间时光'},
    ]:schedule;
    list.innerHTML=slots.map(s=>{
      const isPast=h>s.e;const isCurr=h>=s.s&&h<s.e;
      const sh=Math.floor(s.s).toString().padStart(2,'0')+':'+(s.s%1===0.5?'30':'00');
      return `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 12px;border-radius:12px;background:${isCurr?ch.color+'18':'white'};border:1px solid ${isCurr?ch.color+'40':'var(--border)'}">
        <div style="font-size:10px;white-space:nowrap;margin-top:2px;font-weight:${isCurr?'700':'400'};color:${isCurr?ch.color:'var(--muted)'}">${sh}</div>
        <div style="font-size:13px;color:${isPast?'var(--muted)':isCurr?ch.color:'var(--text)'};${isPast?'text-decoration:line-through;opacity:.6':''};font-weight:${isCurr?'600':'400'}">${s.label}</div>
        ${isCurr?`<div style="margin-left:auto;font-size:10px;color:${ch.color};font-weight:700;white-space:nowrap">← 现在</div>`:''}
      </div>`;
    }).join('');
  }

  /* 论坛足迹 - 按角色 */
  const fl=document.getElementById('forumList');
  if(fl){
    const FORUM_DATA={
      yukimura:[
        {type:'发布',time:'2小时前',title:'请问哪里有好的白茶推荐？',tag:'生活',likes:12,content:'最近在找一款清淡的白毫银针，有了解的吗。'},
        {type:'点赞',time:'昨天',title:'立海大网球部本周训练记录整理',tag:'网球',likes:87},
        {type:'浏览',time:'昨天',title:'花道入门：剑山的正确使用方法',tag:'花道',likes:34},
        {type:'发布',time:'3天前',title:'推荐一首适合练习时听的纯音乐',tag:'音乐',likes:45,content:'安静的曲子更能让人专注。不需要歌词。'},
      ],
      fuji:[
        {type:'发布',time:'3小时前',title:'今天拍到的光影很好看',tag:'摄影',likes:23,content:'阳光穿过树叶的缝隙洒在球场上。'},
        {type:'点赞',time:'昨天',title:'世界各地的仙人掌品种图鉴',tag:'植物',likes:156},
        {type:'发布',time:'2天前',title:'有人推荐超辣的料理店吗？',tag:'美食',likes:8,content:'最近觉得普通的辣已经不够了。'},
        {type:'浏览',time:'3天前',title:'胶片摄影入门指南',tag:'摄影',likes:89},
      ],
      ryoma:[
        {type:'浏览',time:'4小时前',title:'Ponta新出了草莓味',tag:'饮料',likes:342},
        {type:'浏览',time:'昨天',title:'猫粮评测：哪款最适合挑食的猫',tag:'宠物',likes:67},
        {type:'浏览',time:'3天前',title:'最新款游戏测评',tag:'游戏',likes:230},
      ],
    };
    const FORUM=FORUM_DATA[cid]||FORUM_DATA.yukimura;
    const typeColor={'发布':'var(--p500)','点赞':'#E05080','浏览':'var(--muted)'};
    fl.innerHTML=FORUM.map(f=>`
      <div style="background:white;border-radius:var(--r);padding:14px 16px;box-shadow:var(--shadow);border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:10px;font-weight:700;color:${typeColor[f.type]||'var(--muted)'};background:${f.type==='发布'?'var(--p100)':f.type==='点赞'?'#FEE0EA':'var(--bg)'};padding:2px 8px;border-radius:10px">${f.type}</span>
          <span style="font-size:10px;color:var(--muted)">${f.time}</span>
          <span style="font-size:10px;color:${ch.color};background:${ch.color}15;padding:2px 8px;border-radius:10px;margin-left:auto">${f.tag}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${f.title}</div>
        ${f.content?`<div style="font-size:12px;color:var(--muted);line-height:1.6">${f.content}</div>`:''}
        ${f.likes?`<div style="font-size:11px;color:var(--muted);margin-top:6px">❤️ ${f.likes}</div>`:''}
      </div>`).join('');
  }

  /* 购物记录 */
  const sl=document.getElementById('shoppingList');
  if(sl){
    sl.innerHTML=shopRecords.map(r=>`
      <div style="background:white;border-radius:var(--r);padding:14px 16px;box-shadow:var(--shadow);border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
          <div style="font-size:14px;font-weight:600">${r.item}</div>
          <div style="font-size:14px;color:${ch.color};font-weight:700">${r.price}</div>
        </div>
        <div style="font-size:11px;color:var(--muted)">${r.date} · ${r.note}</div>
      </div>`).join('');
  }
}

function showInspectTab(tab){
  ['schedule','diary','shopping','forum'].forEach(t=>{
    document.getElementById('inspect-'+t).style.display=t===tab?'block':'none';
    const btn=document.getElementById('itab-'+t);
    if(btn){
      btn.style.borderColor=t===tab?'var(--p500)':'var(--border)';
      btn.style.background=t===tab?'var(--p100)':'white';
      btn.style.color=t===tab?'var(--p600)':'var(--muted)';
    }
  });
  if(tab==='diary'&&document.getElementById('diaryContent').textContent==='加载中…') genDiary();
}

let _diaryCache='';
async function genDiary(){
  const el=document.getElementById('diaryContent');if(!el)return;
  el.textContent='正在翻看他的日记…';
  const s=S.set;
  if(!s.key){el.textContent='（需要填写API Key才能生成日记）';return;}
  const now=new Date();
  const dayStr=['周日','周一','周二','周三','周四','周五','周六'][now.getDay()];
  const isWknd=isWeekend();
  const recentMsgs=getChatMsgs('yukimura').filter(m=>m.text&&m.type!=='sys').slice(-10).map(m=>(m.sender==='me'?'对方':'我')+':'+m.text).join('\n');
  const userName=S.set.name||'她';
  const prompt=`你是幸村精市，今天是${dayStr}，${isWknd?'周末':'工作日'}。请用第一人称写今天的日记，100字左右，简练克制，有细节感，结尾留一点对"${userName}"若有若无的在意。提到对方时用"${userName}"，性别为女性，用"她"。参考今日对话：\n${recentMsgs||'（今天没有特别的对话）'}`;
  try{
    const pc=PC[s.prov];if(!pc){el.textContent='（引擎未配置）';return;}
    const r=await fetch(pc.url(s.model,s.key),{method:'POST',headers:pc.hd(s.key),
      body:JSON.stringify(pc.body(prompt,[{role:'user',content:'写今天的日记'}]))});
    const d=await r.json();
    const text=pc.parse(d);
    _diaryCache=text||'今天没什么特别的。';
    el.textContent=_diaryCache;
  }catch(e){el.textContent='（生成失败：'+e.message+'）';}
}

/* ══ 查岗：幸村查你 ══ */
setInterval(()=>{
  if(Math.random()>0.15)return;/* 约15%概率触发 */
  const chat=document.getElementById('co');
  if(!chat||!chat.classList.contains('open'))return;
  const msg=pick(YUKI_CHECK_MSGS);
  if(_curChatId==='yukimura'){getChatMsgs('yukimura').push({id:rid(),sender:'c',text:msg,time:Date.now(),type:'txt'});}
  else{getChatMsgs('yukimura').push({id:rid(),sender:'c',text:msg,time:Date.now(),type:'txt'});}
  sv();if(_curChatId==='yukimura')rm();
},10*60*1000);/* 每10分钟检查一次 */

