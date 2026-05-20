/* ══════════════════════════════════════════
   core.js — Core: error handler, clock, sparkles, nav, Settings, tabs, wallet
   ══════════════════════════════════════════ */

window.onerror=function(msg,url,line){
  var d=document.createElement('div');d.style.cssText='position:fixed;top:50px;left:10px;right:10px;background:red;color:white;padding:12px;border-radius:10px;z-index:9999;font-size:11px;word-break:break-all';
  d.textContent='JS ERROR L'+line+': '+msg;document.body.appendChild(d);setTimeout(function(){d.remove()},8000);
};
/* ── 语音ID引用自 data.js ── */

/* clock */
function uc(){
  const n=new Date();
  const hm=n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
  document.getElementById('bc').textContent=hm;
  document.getElementById('sc').textContent=hm;
  const wd=['日','一','二','三','四','五','六'];
  document.getElementById('ds').textContent=(n.getMonth()+1)+'月'+n.getDate()+'日 星期'+wd[n.getDay()];
  ud();
}
function ud(){
  const d=S.set.date;
  if(!d){document.getElementById('dc').textContent='?';return;}
  const diff=Math.floor((Date.now()-new Date(d).getTime())/86400000);
  document.getElementById('dc').textContent=diff;
  document.getElementById('dd').textContent=d.replace(/-/g,'/');
}
uc();setInterval(()=>{uc();checkAlarms();},1000);

/* sparkles */
(function(){
  const c=document.getElementById('heroSparkles');if(!c)return;
  for(let i=0;i<12;i++){
    const s=document.createElement('div');s.className='sparkle';
    s.style.left=Math.random()*100+'%';
    s.style.bottom=Math.random()*30+'%';
    s.style.animationDuration=(5+Math.random()*5)+'s';
    s.style.animationDelay=(Math.random()*6)+'s';
    s.style.width=s.style.height=(1.5+Math.random()*2.5)+'px';
    c.appendChild(s);
  }
})();

/* nav */
function sp(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if(id==='pg-inspect')setTimeout(renderInspect,50);
  if(id==='pg-gallery')setTimeout(renderGallery,50);
  if(id==='pg-world')setTimeout(()=>{if(!S.worldEntries)S.worldEntries=[];renderWorldEntries();},50);
  if(id==='pg-memory')setTimeout(()=>{if(!S.memoryEntries)S.memoryEntries=[];renderMemoryEntries();},50);
  if(id==='pg-xhs')setTimeout(()=>{renderXhs();generateDailyPosts();},50);
  if(id==='pg-gacha')setTimeout(updateGachaUI,50);
  if(id==='pg-taobao')setTimeout(renderShop,50);
  if(id==='pg-garden')setTimeout(renderGarden,50);
  if(id==='pg-phone')setTimeout(renderPhone,50);
  if(id==='pg-mail')setTimeout(renderMail,50);
  if(id==='pg-games')setTimeout(renderGameStats,50);
  if(id==='pg-set')setTimeout(updateStorageInfo,50);
}

function st(el){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active')}

/* settings */
function sp2(el){document.querySelectorAll('.pb').forEach(b=>b.classList.remove('active'));el.classList.add('active');const m={gemini:'gemini-2.5-flash',openai:'gpt-4o-mini',claude:'claude-haiku-4-5-20251001',deepseek:'deepseek-chat'};document.getElementById('mi').value=m[el.dataset.p]||''}
function saveSt(){const p=document.querySelector('.pb.active')?.dataset.p||'gemini';S.set={prov:p,model:document.getElementById('mi').value.trim(),key:document.getElementById('ki').value.trim(),name:document.getElementById('ni').value.trim(),date:document.getElementById('di').value,mmgid:document.getElementById('mmgid').value.trim(),mmkey:document.getElementById('mmkey').value.trim(),mmSite:S.set.mmSite||'cn'};sv();ud();uwb();updateMyAva();updateVoiceCreditsUI();toast('✅ 设置已保存')}
function lsi(){const s=S.set;document.querySelectorAll('.pb').forEach(b=>b.classList.toggle('active',b.dataset.p===s.prov));document.getElementById('mi').value=s.model||'';document.getElementById('ki').value=s.key||'';document.getElementById('ni').value=s.name||'';document.getElementById('di').value=s.date||'';document.getElementById('mmgid').value=s.mmgid||'';document.getElementById('mmkey').value=s.mmkey||'';updateVoiceCreditsUI()}
/* MiniMax站点选择 */
function pickMmSite(site){
  S.set.mmSite=site;
  document.getElementById('mmSiteCn').style.borderColor=site==='cn'?'var(--p500)':'var(--border)';
  document.getElementById('mmSiteCn').style.background=site==='cn'?'var(--p100)':'white';
  document.getElementById('mmSiteCn').style.color=site==='cn'?'var(--p700)':'var(--muted)';
  document.getElementById('mmSiteIntl').style.borderColor=site==='intl'?'var(--p500)':'var(--border)';
  document.getElementById('mmSiteIntl').style.background=site==='intl'?'var(--p100)':'white';
  document.getElementById('mmSiteIntl').style.color=site==='intl'?'var(--p700)':'var(--muted)';
  document.getElementById('mmSiteHint').textContent=site==='cn'?'api.minimax.chat':'api.minimaxi.chat';
}
(function(){var s=S.set.mmSite||'cn';pickMmSite(s);})();
function uwb(){document.getElementById('wd').textContent='¥'+(S.wallet||200).toFixed(2);const sw=document.getElementById('shopWallet');if(sw)sw.textContent='¥'+(S.wallet||0).toFixed(0);}
uwb();

/* chat */
