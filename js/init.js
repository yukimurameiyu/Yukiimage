/* ══════════════════════════════════════════
   init.js — Initialization
   ══════════════════════════════════════════ */

document.getElementById('tm').textContent=TM[Math.floor(Math.random()*TM.length)];
document.getElementById('hs').textContent=IM[Math.floor(Math.random()*IM.length)];
renderGallery();renderAlarms();initXhs();
updateMyAva();
if(S.yukiStatus) document.getElementById('yukiStatus').textContent=S.yukiStatus;

/* 启动时迁移旧版音频数据到IndexedDB */
migrateAudioData();
