/* ══════════════════════════════════════════
   init.js — Initialization
   ══════════════════════════════════════════ */

/* ══ 初始化（所有模块加载完毕后执行） ══ */
lsi();  /* 初始化设置面板 */
document.getElementById('tm').textContent=TM[Math.floor(Math.random()*TM.length)];
document.getElementById('hs').textContent=IM[Math.floor(Math.random()*IM.length)];
renderGallery();renderAlarms();initXhs();
updateMyAva();
if(S.yukiStatus) document.getElementById('yukiStatus').textContent=S.yukiStatus;

/* 启动时迁移旧版音频数据到IndexedDB */
migrateAudioData();
