/* ══════════════════════════════════════════
   work.js — 打工系统
   · 每日2-3个任务可接，按时段刷新
   · 三种小游戏：快速点击 / 分类整理 / 订单配对
   · 角色联动 + 好感度奖励
   ══════════════════════════════════════════ */

/* ── 状态初始化 ── */
function initWorkState(){
  if(!S.work) S.work={done:[],lastDate:'',cooldownEnd:0};
  const today=new Date().toDateString();
  if(S.work.lastDate!==today){
    S.work.done=[];
    S.work.lastDate=today;
    S.work.cooldownEnd=0;
    S.work.todayJobs=null;
  }
}

/* ── 当前时段 ── */
function getCurrentShift(){
  const h=new Date().getHours();
  if(h>=6&&h<12) return 'morning';
  if(h>=12&&h<18) return 'afternoon';
  if(h>=18&&h<23) return 'evening';
  return null;
}

/* ── 生成今日任务（每天固定，根据日期seed） ── */
function getTodayJobs(){
  initWorkState();
  if(S.work.todayJobs&&S.work.todayJobs.length) return S.work.todayJobs;

  const today=new Date();
  const seed=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
  function seededRand(i){let x=Math.sin(seed+i)*10000;return x-Math.floor(x);}

  /* 从每个时段各选1个任务 */
  const shifts=['morning','afternoon','evening'];
  const picked=[];
  shifts.forEach((sh,si)=>{
    const pool=WORK_JOBS.filter(j=>j.shift===sh);
    if(pool.length){
      const idx=Math.floor(seededRand(si*7)*pool.length);
      picked.push(pool[idx]);
    }
  });

  S.work.todayJobs=picked.map(j=>j.id);
  sv();
  return S.work.todayJobs;
}

/* ── 渲染打工页面 ── */
function renderWorkPage(){
  initWorkState();
  const todayIds=getTodayJobs();
  const shift=getCurrentShift();
  const doneCount=S.work.done.length;

  /* 余额 & 计数 */
  const balEl=document.getElementById('workBalance');
  const doneEl=document.getElementById('workDoneCount');
  const maxEl=document.getElementById('workMaxCount');
  if(balEl) balEl.textContent='¥'+S.wallet;
  if(doneEl) doneEl.textContent=doneCount;
  if(maxEl) maxEl.textContent=WORK_MAX_DAILY;

  /* 时段提示 */
  const shiftEl=document.getElementById('workShiftInfo');
  if(shiftEl){
    if(!shift){
      shiftEl.innerHTML='🌙 打工时间：6:00 - 23:00<br><span style="font-size:12px;opacity:.6">现在是休息时间，明天再来吧</span>';
    } else {
      const info=WORK_SHIFTS[shift];
      shiftEl.innerHTML=info.ico+' 当前时段：<b>'+info.label+'</b>（'+info.hours[0]+':00 - '+info.hours[1]+':00）';
    }
  }

  /* 冷却检查 */
  const coolEl=document.getElementById('workCooldown');
  const now=Date.now();
  if(S.work.cooldownEnd&&now<S.work.cooldownEnd){
    if(coolEl){
      coolEl.style.display='block';
      const remain=Math.ceil((S.work.cooldownEnd-now)/60000);
      coolEl.innerHTML='⏳ 休息中…还需 '+remain+' 分钟<br><span style="font-size:12px;opacity:.6">刚干完活，歇会儿再接</span>';
    }
  } else {
    if(coolEl) coolEl.style.display='none';
  }

  /* 任务列表 */
  const listEl=document.getElementById('workJobList');
  if(!listEl) return;
  listEl.innerHTML='';

  if(doneCount>=WORK_MAX_DAILY){
    listEl.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--muted)"><div style="font-size:36px;margin-bottom:12px">🎉</div><div style="font-size:15px;font-weight:600;margin-bottom:6px">今日打工已完成</div><div style="font-size:13px">明天再来吧，辛苦了！</div></div>';
    return;
  }

  todayIds.forEach(id=>{
    const job=WORK_JOBS.find(j=>j.id===id);
    if(!job) return;
    const isDone=S.work.done.includes(id);
    const isCurrentShift=job.shift===shift;
    const isCooling=S.work.cooldownEnd&&now<S.work.cooldownEnd;
    const canDo=isCurrentShift&&!isDone&&!isCooling&&doneCount<WORK_MAX_DAILY;

    const princeName=job.prince?CHAR_PACKS[job.prince]?.name:'通用';
    const princeIco=job.prince?CHAR_PACKS[job.prince]?.ico:'📋';
    const shiftInfo=WORK_SHIFTS[job.shift];

    const card=document.createElement('div');
    card.style.cssText='background:var(--card);border-radius:16px;padding:16px;border:1px solid var(--border);'+(isDone?'opacity:.5;':'')+(canDo?'cursor:pointer;':'');
    card.innerHTML=`
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="width:44px;height:44px;border-radius:12px;background:${isDone?'rgba(255,255,255,.05)':'linear-gradient(135deg,#E8A838,#C07828)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${isDone?'✅':princeIco}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:600;margin-bottom:2px">${job.name}</div>
          <div style="font-size:12px;color:var(--muted)">${job.desc}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:15px;font-weight:700;color:#FFD54F">¥${job.pay[0]}-${job.pay[1]}</div>
          <div style="font-size:11px;color:var(--muted)">${shiftInfo.ico} ${shiftInfo.label}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${job.prince?`<span style="font-size:11px;padding:2px 8px;background:rgba(255,255,255,.08);border-radius:8px">👤 ${princeName}</span>`:''}
        ${job.affUp?`<span style="font-size:11px;padding:2px 8px;background:rgba(255,100,100,.1);border-radius:8px;color:#FF8A80">❤️ 好感+${job.affUp}</span>`:''}
        <span style="font-size:11px;padding:2px 8px;background:rgba(255,255,255,.06);border-radius:8px;color:var(--muted)">${isDone?'已完成':!isCurrentShift?'非当前时段':'可接取'}</span>
      </div>
    `;
    if(canDo) card.onclick=()=>startWorkGame(job);
    listEl.appendChild(card);
  });
}

/* ── 启动打工小游戏 ── */
let _workGame=null;

function startWorkGame(job){
  const overlay=document.getElementById('workGameOverlay');
  if(!overlay) return;
  overlay.style.display='flex';

  _workGame={job,score:0,target:job.gameData.target,timer:job.gameData.timeLimit,running:true,interval:null};

  document.getElementById('workGameTitle').textContent=job.name;
  document.getElementById('workGameDialog').textContent=job.dialog.start;
  document.getElementById('workGameTimer').textContent=_workGame.timer;
  document.getElementById('workGameScore').textContent='0';
  document.getElementById('workGameTarget').textContent=_workGame.target;
  document.getElementById('workGameBar').style.width='100%';
  document.getElementById('workGameResult').style.display='none';
  document.getElementById('workGameArea').innerHTML='';

  /* 根据游戏类型初始化 */
  if(job.game==='tap') initTapGame(job);
  else if(job.game==='sort') initSortGame(job);
  else if(job.game==='match') initMatchGame(job);

  /* 倒计时 */
  _workGame.interval=setInterval(()=>{
    if(!_workGame||!_workGame.running) return;
    _workGame.timer--;
    document.getElementById('workGameTimer').textContent=_workGame.timer;
    document.getElementById('workGameBar').style.width=(_workGame.timer/job.gameData.timeLimit*100)+'%';
    if(_workGame.timer<=0) endWorkGame(false);
  },1000);
}

/* ── 快速点击游戏 ── */
function initTapGame(job){
  const area=document.getElementById('workGameArea');
  area.style.cssText='width:100%;max-width:340px;min-height:280px;position:relative;display:block;';
  spawnTapItem(job);
}

function spawnTapItem(job){
  if(!_workGame||!_workGame.running) return;
  const area=document.getElementById('workGameArea');
  if(!area) return;

  const item=document.createElement('div');
  const x=Math.random()*80+5;
  const y=Math.random()*70+5;
  item.style.cssText=`position:absolute;left:${x}%;top:${y}%;font-size:36px;cursor:pointer;
    animation:workPop .3s ease-out;user-select:none;-webkit-user-select:none;
    transition:transform .15s,opacity .15s;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3));`;
  item.textContent=job.gameData.icon;
  item.ontouchstart=item.onclick=function(e){
    e.preventDefault();
    if(!_workGame||!_workGame.running) return;
    _workGame.score++;
    document.getElementById('workGameScore').textContent=_workGame.score;
    item.style.transform='scale(1.5)';
    item.style.opacity='0';
    setTimeout(()=>item.remove(),200);
    if(_workGame.score>=_workGame.target){
      endWorkGame(true);
    } else {
      /* 随机延迟生成下一个 */
      setTimeout(()=>spawnTapItem(job), 100+Math.random()*300);
    }
  };
  area.appendChild(item);

  /* 同时可能出现多个目标 */
  if(Math.random()<0.4&&_workGame.score>3){
    setTimeout(()=>{
      if(_workGame&&_workGame.running) spawnTapItem(job);
    },200+Math.random()*400);
  }

  /* 超时消失并重新生成 */
  setTimeout(()=>{
    if(item.parentNode&&_workGame&&_workGame.running){
      item.style.opacity='0';
      setTimeout(()=>{item.remove();if(_workGame&&_workGame.running)spawnTapItem(job);},200);
    }
  },2000+Math.random()*1000);
}

/* ── 分类整理游戏（点击正确颜色的物品）── */
function initSortGame(job){
  const area=document.getElementById('workGameArea');
  area.style.cssText='width:100%;max-width:340px;min-height:280px;display:flex;flex-direction:column;align-items:center;gap:16px;';

  const items=job.gameData.items;
  _workGame._sortTarget=items[Math.floor(Math.random()*items.length)];

  /* 显示目标提示 */
  const hint=document.createElement('div');
  hint.id='sortHint';
  hint.style.cssText='font-size:14px;color:rgba(255,255,255,.7);margin-bottom:4px;';
  hint.innerHTML='找到所有 <span style="font-size:24px;vertical-align:middle">'+_workGame._sortTarget+'</span> 并点击它';
  area.appendChild(hint);

  /* 网格 */
  const grid=document.createElement('div');
  grid.id='sortGrid';
  grid.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;max-width:300px;';
  area.appendChild(grid);

  fillSortGrid(job);
}

function fillSortGrid(job){
  const grid=document.getElementById('sortGrid');
  if(!grid||!_workGame||!_workGame.running) return;
  grid.innerHTML='';

  const items=job.gameData.items;
  const target=_workGame._sortTarget;
  const cells=[];

  /* 保证有2-4个目标 */
  const targetCount=2+Math.floor(Math.random()*3);
  for(let i=0;i<targetCount;i++) cells.push(target);
  while(cells.length<15){
    const r=items[Math.floor(Math.random()*items.length)];
    if(r!==target||Math.random()<0.15) cells.push(r===target?items[(items.indexOf(r)+1)%items.length]:r);
  }
  /* shuffle */
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}

  cells.forEach(emoji=>{
    const btn=document.createElement('div');
    btn.style.cssText='font-size:28px;text-align:center;padding:8px;border-radius:10px;background:rgba(255,255,255,.06);cursor:pointer;transition:all .2s;user-select:none;-webkit-user-select:none;';
    btn.textContent=emoji;
    btn.ontouchstart=btn.onclick=function(e){
      e.preventDefault();
      if(!_workGame||!_workGame.running) return;
      if(emoji===target){
        _workGame.score++;
        document.getElementById('workGameScore').textContent=_workGame.score;
        btn.style.background='rgba(76,175,80,.3)';
        btn.style.transform='scale(1.2)';
        btn.style.pointerEvents='none';
        setTimeout(()=>{btn.style.opacity='.3';btn.style.transform='scale(.8)';},200);
        if(_workGame.score>=_workGame.target){
          endWorkGame(true);
        } else {
          /* 检查当前网格是否还有目标 */
          const remaining=grid.querySelectorAll('div');
          let hasTarget=false;
          remaining.forEach(d=>{if(d.textContent===target&&d.style.opacity!=='.3') hasTarget=true;});
          if(!hasTarget) setTimeout(()=>fillSortGrid(job),500);
        }
      } else {
        btn.style.background='rgba(244,67,54,.3)';
        btn.style.transform='scale(.9)';
        setTimeout(()=>{btn.style.background='rgba(255,255,255,.06)';btn.style.transform='scale(1)';},300);
      }
    };
    grid.appendChild(btn);
  });
}

/* ── 订单配对游戏 ── */
function initMatchGame(job){
  const area=document.getElementById('workGameArea');
  area.style.cssText='width:100%;max-width:340px;min-height:280px;display:flex;flex-direction:column;align-items:center;gap:16px;';

  _workGame._matchItems=job.gameData.items;
  _workGame._ordersDone=0;
  _workGame._ordersTarget=job.gameData.orders;
  _workGame.target=job.gameData.orders;
  document.getElementById('workGameTarget').textContent=_workGame.target;

  showNextOrder(job);
}

function showNextOrder(job){
  if(!_workGame||!_workGame.running) return;
  const area=document.getElementById('workGameArea');
  area.innerHTML='';

  const items=_workGame._matchItems;
  const target=items[Math.floor(Math.random()*items.length)];
  _workGame._currentOrder=target;

  /* 订单显示 */
  const orderDiv=document.createElement('div');
  orderDiv.style.cssText='text-align:center;padding:12px 20px;background:rgba(255,255,255,.08);border-radius:14px;font-size:14px;';
  orderDiv.innerHTML='📝 客人要的：<span style="font-size:32px;vertical-align:middle;margin-left:8px">'+target+'</span>';
  area.appendChild(orderDiv);

  /* 选项按钮 */
  const opts=document.createElement('div');
  opts.style.cssText='display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:12px;';

  const shuffled=[...items];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}

  shuffled.forEach(emoji=>{
    const btn=document.createElement('div');
    btn.style.cssText='font-size:36px;padding:12px 18px;border-radius:14px;background:rgba(255,255,255,.08);cursor:pointer;transition:all .2s;user-select:none;-webkit-user-select:none;';
    btn.textContent=emoji;
    btn.ontouchstart=btn.onclick=function(e){
      e.preventDefault();
      if(!_workGame||!_workGame.running) return;
      if(emoji===target){
        _workGame.score++;
        _workGame._ordersDone++;
        document.getElementById('workGameScore').textContent=_workGame.score;
        btn.style.background='rgba(76,175,80,.3)';
        btn.style.transform='scale(1.2)';
        if(_workGame.score>=_workGame.target){
          endWorkGame(true);
        } else {
          setTimeout(()=>showNextOrder(job),400);
        }
      } else {
        btn.style.background='rgba(244,67,54,.3)';
        btn.style.transform='scale(.9)';
        setTimeout(()=>{btn.style.background='rgba(255,255,255,.08)';btn.style.transform='scale(1)';},300);
      }
    };
    opts.appendChild(btn);
  });
  area.appendChild(opts);
}

/* ── 结束游戏 ── */
function endWorkGame(success){
  if(!_workGame) return;
  _workGame.running=false;
  if(_workGame.interval) clearInterval(_workGame.interval);

  const job=_workGame.job;
  const resultEl=document.getElementById('workGameResult');
  const textEl=document.getElementById('workGameResultText');
  const rewardEl=document.getElementById('workGameReward');
  const areaEl=document.getElementById('workGameArea');
  const dialogEl=document.getElementById('workGameDialog');

  /* 隐藏游戏区域的交互 */
  areaEl.style.pointerEvents='none';
  areaEl.style.opacity='.3';

  if(success){
    const pay=job.pay[0]+Math.floor(Math.random()*(job.pay[1]-job.pay[0]+1));
    S.wallet+=pay;
    S.work.done.push(job.id);
    S.work.cooldownEnd=Date.now()+WORK_COOLDOWN*60000;

    /* 角色好感 */
    let affText='';
    if(job.prince&&job.affUp){
      if(!S.princeAff) S.princeAff={};
      S.princeAff[job.prince]=(S.princeAff[job.prince]||0)+job.affUp;
      const charName=CHAR_PACKS[job.prince]?.name||job.prince;
      affText='<br>❤️ '+charName+' 好感+'+job.affUp;
    }

    sv();
    textEl.textContent='🎉 干得漂亮！';
    rewardEl.innerHTML='💰 获得 ¥'+pay+affText;
    dialogEl.textContent=job.dialog.done;
  } else {
    /* 失败也给少量奖励 */
    const consolation=Math.floor(job.pay[0]*0.3);
    S.wallet+=consolation;
    S.work.cooldownEnd=Date.now()+Math.floor(WORK_COOLDOWN*0.5)*60000;
    sv();
    textEl.textContent='⏰ 时间到了';
    rewardEl.innerHTML='💰 辛苦费 ¥'+consolation;
    dialogEl.textContent=job.dialog.fail;
  }

  resultEl.style.display='block';
}

function closeWorkGame(){
  const overlay=document.getElementById('workGameOverlay');
  if(overlay) overlay.style.display='none';
  if(_workGame&&_workGame.interval) clearInterval(_workGame.interval);
  _workGame=null;
  renderWorkPage();
}

/* ── 添加动画keyframe ── */
(function(){
  if(document.getElementById('workAnimStyle')) return;
  const style=document.createElement('style');
  style.id='workAnimStyle';
  style.textContent=`
    @keyframes workPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
  `;
  document.head.appendChild(style);
})();

/* ── 页面切换时刷新 ── */
const _origSp=window.sp;
if(typeof _origSp==='function'){
  window.sp=function(pg){
    _origSp(pg);
    if(pg==='pg-work') renderWorkPage();
  };
}
