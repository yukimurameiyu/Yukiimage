/* ══════════════════════════════════════════
   store.js — 存储层（localStorage + IndexedDB）
   · 文字数据 → localStorage（5MB）
   · 音频数据 → IndexedDB（几百MB）
   ══════════════════════════════════════════ */

const K = 'yw_v1';
const DB_NAME = 'yw_audio_db';
const DB_VER = 1;
const AUDIO_STORE = 'audio';

let _db = null;

/* toast安全封装（store.js先于app.js加载，toast可能尚未定义） */
function _storeToast(msg){ if(typeof toast==='function') toast(msg); else console.log(msg); }

/* ── IndexedDB ── */
function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = () => { console.warn('IndexedDB open failed'); resolve(null); };
  });
}

async function saveAudio(key, base64) {
  try {
    const db = await openDB(); if (!db) return false;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).put(base64, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => { console.warn('saveAudio failed'); resolve(false); };
    });
  } catch (e) { console.warn('saveAudio error:', e); return false; }
}

async function getAudio(key) {
  try {
    const db = await openDB(); if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

async function deleteAudio(key) {
  try {
    const db = await openDB(); if (!db) return;
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).delete(key);
  } catch (e) { /* ignore */ }
}

async function listAudioKeys() {
  try {
    const db = await openDB(); if (!db) return [];
    return new Promise(resolve => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) { return []; }
}

/* ── localStorage 存取 ── */
const DEFAULT_STATE = {
  msgs: [], aff: 0, wallet: 100,
  set: { prov: 'gemini', model: 'gemini-2.5-flash', key: '', name: '', date: '' },
  mem: [], myAvatar: '', myStatus: '', myPrompt: '',
  yukiAvatar: '', yukiStatus: '',
  unlocked: [], alarms: [],
  bag: { merch: [], seeds: [], gifts: [], cards: { phoneCard: 5 } },
  princeAff: {}, shop: {},
  phoneReady: [], unlockedChars: [], actTokens: [],
  phoneLogs: [], _phoneCardGiven: true, voiceCredits: 0,
  signIn: { day: 0, lastDate: '', claimed: [] }
};

function ls() {
  try {
    const d = JSON.parse(localStorage.getItem(K));
    if (d) {
      if (!d.unlockedChars) d.unlockedChars = [];
      if (!d.actTokens) d.actTokens = [];
      if (!d.phoneLogs) d.phoneLogs = [];
      if (d.voiceCredits === undefined) d.voiceCredits = 0;
      /* 一次性发放5张测试电话卡 */
      if (!d._phoneCardGiven) {
        if (!d.bag) d.bag = {};
        if (!d.bag.cards) d.bag.cards = {};
        d.bag.cards.phoneCard = (d.bag.cards.phoneCard || 0) + 5;
        d._phoneCardGiven = true;
      }
      /* 确保bag结构完整 */
      if (!d.bag) d.bag = {};
      if (!d.bag.merch) d.bag.merch = [];
      if (!d.bag.seeds) d.bag.seeds = [];
      if (!d.bag.gifts) d.bag.gifts = [];
      if (!d.bag.cards) d.bag.cards = {};
      return d;
    }
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

let S = ls();

function sv() {
  try {
    /* 保存前剥离音频base64，只保留 hasAudio 标记 */
    if (S.phoneLogs) {
      S.phoneLogs.forEach(log => {
        if (log.audioB64) {
          log.hasAudio = true;
          delete log.audioB64;
        }
      });
    }
    /* 剥离聊天语音缓存 */
    if (S.chatMsgs) {
      Object.values(S.chatMsgs).forEach(msgs => {
        msgs.forEach(m => { delete m._audioB64; delete m._chatId; });
      });
    }
    if (S.msgs) {
      S.msgs.forEach(m => { delete m._audioB64; delete m._chatId; });
    }
    localStorage.setItem(K, JSON.stringify(S));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      /* 存储满了，进一步压缩 */
      if (S.xhsPosts && S.xhsPosts.length > 20) S.xhsPosts = S.xhsPosts.slice(0, 20);
      if (S.chatMsgs) {
        Object.keys(S.chatMsgs).forEach(k => {
          if (S.chatMsgs[k].length > 150) S.chatMsgs[k] = S.chatMsgs[k].slice(-150);
        });
      }
      try {
        localStorage.setItem(K, JSON.stringify(S));
        _storeToast('⚠️ 存储接近上限，已自动清理缓存');
      } catch (e2) {
        _storeToast('❌ 存储已满！请去设置清除部分数据');
      }
    }
  }
}

/* ── 音频存储辅助（phone专用key格式: phone_<timestamp>） ── */
async function savePhoneAudio(logTs, audioB64) {
  const key = 'phone_' + logTs;
  return saveAudio(key, audioB64);
}

async function getPhoneAudio(logTs) {
  return getAudio('phone_' + logTs);
}

/* ── 语音缓存辅助（voice专用key格式: voice_<msgId>） ── */
async function saveVoiceAudio(msgId, audioB64) {
  const key = 'voice_' + msgId;
  return saveAudio(key, audioB64);
}

async function getVoiceAudio(msgId) {
  return getAudio('voice_' + msgId);
}

async function deleteVoiceAudio(msgId) {
  return deleteAudio('voice_' + msgId);
}

/* ── 数据迁移：把旧版 phoneLogs 里的 audioB64 搬到 IndexedDB ── */
async function migrateAudioData() {
  if (!S.phoneLogs || S._audioMigrated) return;
  let migrated = 0;
  for (const log of S.phoneLogs) {
    if (log.audioB64) {
      const ok = await savePhoneAudio(log.ts, log.audioB64);
      if (ok) {
        log.hasAudio = true;
        delete log.audioB64;
        migrated++;
      }
    }
  }
  if (migrated > 0) {
    S._audioMigrated = true;
    sv();
    console.log('[migrate] moved', migrated, 'audio(s) to IndexedDB');
  }
}

/* ── 存储管理 ── */
function getStorageSize() {
  try { var d = localStorage.getItem(K); return d ? d.length : 0; } catch (e) { return 0; }
}
function updateStorageInfo() {
  var el = document.getElementById('storageInfo'); if (!el) return;
  var bytes = getStorageSize();
  var kb = Math.round(bytes / 1024);
  var pct = Math.round(bytes / 5242880 * 100);
  /* 同时显示IndexedDB音频条数 */
  listAudioKeys().then(function(keys){
    var audioCount = keys.length;
    var phoneCount = keys.filter(function(k){return k.startsWith('phone_');}).length;
    var voiceCount = keys.filter(function(k){return k.startsWith('voice_');}).length;
    el.innerHTML = '文字存储：' + kb + 'KB / 5120KB (' + pct + '%)<br/>' +
      '<span style="font-size:11px">语音存储（IndexedDB）：' + phoneCount + ' 条通话 · ' + voiceCount + ' 条语音缓存</span>';
    el.style.color = pct > 80 ? '#C62828' : pct > 50 ? '#F57F17' : 'var(--muted)';
  }).catch(function(){
    el.textContent = '存储使用：' + kb + 'KB / 5120KB (' + pct + '%)';
    el.style.color = pct > 80 ? '#C62828' : pct > 50 ? '#F57F17' : 'var(--muted)';
  });
}
function cleanStorage() {
  var cleaned = 0;
  if (S.xhsPosts && S.xhsPosts.length > 15) { cleaned += S.xhsPosts.length - 15; S.xhsPosts = S.xhsPosts.slice(0, 15); }
  if (S.chatMsgs) {
    Object.keys(S.chatMsgs).forEach(function (k) {
      var m = S.chatMsgs[k]; if (m.length > 200) { cleaned += m.length - 200; S.chatMsgs[k] = m.slice(-200); }
    });
  }
  if (S.msgs && S.msgs.length > 200) { cleaned += S.msgs.length - 200; S.msgs = S.msgs.slice(-200); }
  if (S.mem && S.mem.length > 5) { cleaned += S.mem.length - 5; S.mem = S.mem.slice(0, 5); }
  sv(); updateStorageInfo();
  _storeToast('🧹 已清理 ' + cleaned + ' 项缓存数据');
}

/* 首次加载自动压缩 */
try { if (JSON.stringify(S).length > 4000000) cleanStorage(); } catch (e) { }
