/* ══════════════════════════════════════════
   init.js — Initialization
   ══════════════════════════════════════════ */

/* ══ 初始化（所有模块加载完毕后执行） ══ */
lsi();  /* 初始化设置面板 */
setInterval(()=>{uc();checkAlarms();},1000);  /* 时钟+闹钟检查 */
document.getElementById('tm').textContent=TM[Math.floor(Math.random()*TM.length)];
document.getElementById('hs').textContent=IM[Math.floor(Math.random()*IM.length)];
renderGallery();renderAlarms();initXhs();
updateMyAva();
if(S.yukiStatus) document.getElementById('yukiStatus').textContent=S.yukiStatus;

/* 启动时迁移旧版音频数据到IndexedDB */
migrateAudioData();

/* ══ 七天签到系统（一次性） ══ */
function checkSignIn(){
  if(!S.signIn) S.signIn={day:0,lastDate:'',claimed:[]};
  if(S.signIn.completed) return; /* 七天全部领完，永不再弹 */
  var today=new Date().toLocaleDateString('zh-CN');
  if(S.signIn.lastDate===today) return; /* 今天已签 */
  var nextDay=(S.signIn.day||0)%7;
  showSignInPopup(nextDay);
}
function showSignInPopup(dayIdx){
  var rewards=SIGN_IN_REWARDS;
  var todayReward=rewards[dayIdx];
  var html='<div style="text-align:center">'+
    '<div style="font-size:14px;font-weight:700;margin-bottom:12px">🎁 七天好礼 · 第'+(dayIdx+1)+'天</div>'+
    '<div style="display:flex;gap:4px;justify-content:center;margin-bottom:14px;flex-wrap:wrap">'+
    rewards.map(function(r,i){
      var done=i<dayIdx;
      var cur=i===dayIdx;
      return '<div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:'+(cur?'16px':'12px')+';font-weight:700;border:2px solid '+(cur?'var(--p500)':done?'#A5D6A7':'var(--border)')+';background:'+(cur?'var(--p100)':done?'#E8F5E9':'var(--bg2)')+';color:'+(cur?'var(--p700)':done?'#66BB6A':'var(--muted)')+'">'+(done?'✓':(i+1))+'</div>';
    }).join('')+
    '</div>'+
    '<div style="font-size:40px;margin-bottom:8px">'+(dayIdx===0?'💰':dayIdx===1?'🎁':dayIdx===2?'💰':dayIdx===3?'📞':dayIdx===4?'💰':dayIdx===5?'🃏':'🎉')+'</div>'+
    '<div style="font-size:16px;font-weight:700;color:var(--p700);margin-bottom:4px">'+todayReward.desc+'</div>'+
    '<div style="font-size:11px;color:var(--muted);margin-bottom:14px">'+(dayIdx===6?'最后一天！领完七天好礼就结束啦~':'明天还有更好的奖励哦~')+'</div>'+
    '<button class="shbtn p" onclick="claimSignIn('+dayIdx+')">签到领取 🎁</button>'+
  '</div>';
  os('🗓️ 每日签到',html);
}
function claimSignIn(dayIdx){
  var r=SIGN_IN_REWARDS[dayIdx];
  if(r.coins) S.wallet=(S.wallet||0)+r.coins;
  if(r.voice) S.voiceCredits=(S.voiceCredits||0)+r.voice;
  if(r.phoneCard){
    if(!S.bag)S.bag={};if(!S.bag.cards)S.bag.cards={};
    S.bag.cards.phoneCard=(S.bag.cards.phoneCard||0)+r.phoneCard;
  }
  if(r.gachaTicket){
    if(!S.bag)S.bag={};if(!S.bag.cards)S.bag.cards={};
    S.bag.cards.gachaTicket=(S.bag.cards.gachaTicket||0)+r.gachaTicket;
  }
  if(r.gift){
    var gift=GIFT_POOL[Math.floor(Math.random()*GIFT_POOL.length)];
    if(!S.bag)S.bag={};if(!S.bag.gifts)S.bag.gifts=[];
    S.bag.gifts.push({name:gift.name,price:gift.price,img:gift.img,ts:Date.now()});
  }
  if(r.limitedCard){
    if(!S.unlocked)S.unlocked=[];
    var pool=CARD_POOL.filter(function(c){return c.rarity==='SSR'||c.rarity==='SR';});
    if(pool.length) S.unlocked.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  var today=new Date().toLocaleDateString('zh-CN');
  S.signIn.day=dayIdx+1;
  S.signIn.lastDate=today;
  if(!S.signIn.claimed)S.signIn.claimed=[];
  S.signIn.claimed[dayIdx]=true;
  /* 第7天领完 → 标记completed，永不再弹 */
  if(dayIdx>=6) S.signIn.completed=true;
  sv();uwb();updateVoiceCreditsUI();cs();
  toast('🎁 签到成功！'+r.desc);
}
/* 延迟1秒检查签到，让页面先渲染完 */
setTimeout(checkSignIn,1000);
