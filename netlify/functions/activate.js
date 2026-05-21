const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/*
  激活码验证系统
  ─────────────
  POT-XXXX-XXXX   → 单角色码（解锁1个角色）
  SPOT-XXXX-XXXXX → VIP全套码（解锁全部角色）
  VOX-XXXX-XXXX   → 语音包码（解锁语音额度）
  
  码由 HMAC-SHA256(SECRET, prefix+index) 生成
  SECRET 存储在 Netlify 环境变量 ACTIVATE_SECRET 中
  
  防重复激活：使用 Netlify Blobs 记录已激活的码
  每个码激活后写入 { fingerprint, activatedAt } 
  同一个码不可再次激活（不同设备也不行）
  
  设置方法：
  1. 去 Netlify → Site settings → Environment variables
  2. 添加 ACTIVATE_SECRET = 你的密钥
  3. npm install @netlify/blobs
  4. 重新部署
*/

const SECRET = process.env.ACTIVATE_SECRET || 'default-dev-secret-change-me';
const MAX_POT = 500;
const MAX_SPOT = 100;
const MAX_VOX = 900;

/* VOX码额度分段 */
function getVoxCredits(index) {
  if (index <= 500) return 100;
  if (index <= 800) return 300;
  return 500;
}

/* 生成HMAC哈希 */
function hmac(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

/* 从哈希生成格式化的码 */
function hashToCode(hash, len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    const byte = parseInt(hash.substr(i * 2, 2), 16);
    result += chars[byte % chars.length];
  }
  return result;
}

/* 生成指定序号的码 */
function generateCode(type, index) {
  const h = hmac(`${type}-${index}`);
  if (type === 'POT') {
    const raw = hashToCode(h, 8);
    return `POT-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  } else if (type === 'SPOT') {
    const raw = hashToCode(h, 9);
    return `SPOT-${raw.slice(0, 4)}-${raw.slice(4, 9)}`;
  } else {
    const raw = hashToCode(h, 8);
    return `VOX-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  }
}

/* 验证码是否合法 */
function validateCode(code) {
  const upperCode = code.toUpperCase().trim();

  if (upperCode.startsWith('POT-')) {
    for (let i = 1; i <= MAX_POT; i++) {
      if (generateCode('POT', i) === upperCode) {
        return { valid: true, type: 'pot', index: i };
      }
    }
  }

  if (upperCode.startsWith('SPOT-')) {
    for (let i = 1; i <= MAX_SPOT; i++) {
      if (generateCode('SPOT', i) === upperCode) {
        return { valid: true, type: 'spot', index: i };
      }
    }
  }

  if (upperCode.startsWith('VOX-')) {
    for (let i = 1; i <= MAX_VOX; i++) {
      if (generateCode('VOX', i) === upperCode) {
        return { valid: true, type: 'vox', index: i, credits: getVoxCredits(i) };
      }
    }
  }

  return { valid: false };
}

/* 生成激活令牌（绑定设备指纹） */
function generateToken(code, fingerprint) {
  return hmac(`TOKEN:${code}:${fingerprint}:${SECRET}`);
}

/* 获取 Blobs 存储实例 */
function getActivationStore() {
  return getStore('activations');
}

/* 检查码是否已被激活 */
async function isCodeUsed(store, code) {
  try {
    const record = await store.get(code, { type: 'json' });
    return record || null;
  } catch {
    return null;
  }
}

/* 标记码为已激活 */
async function markCodeUsed(store, code, fingerprint, type, extra = {}) {
  await store.setJSON(code, {
    fingerprint,
    type,
    activatedAt: new Date().toISOString(),
    ...extra,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  const json = (data, status = 200) => ({
    statusCode: status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  try {
    const body = JSON.parse(event.body);
    const { code, fingerprint, action } = body;
    const store = getActivationStore();

    /* ── 批量生成码（管理员接口） ── */
    if (action === 'generate') {
      const { adminKey, type, count, startIndex } = body;
      if (adminKey !== SECRET) {
        return json({ error: '无权限' }, 403);
      }
      const codes = [];
      const t = (type || 'POT').toUpperCase();
      const max = t === 'SPOT' ? MAX_SPOT : t === 'VOX' ? MAX_VOX : MAX_POT;
      const start = Math.max(1, startIndex || 1);
      const end = Math.min(start + (count || 10) - 1, max);
      for (let i = start; i <= end; i++) {
        const entry = { index: i, code: generateCode(t, i) };
        if (t === 'VOX') entry.credits = getVoxCredits(i);
        codes.push(entry);
      }
      return json({ codes, type: t, range: `${start}-${end}` });
    }

    /* ── 激活码 ── */
    if (action === 'activate') {
      if (!code) {
        return json({ valid: false, msg: '请输入激活码' });
      }

      const result = validateCode(code);
      if (!result.valid) {
        return json({ valid: false, msg: '激活码无效' });
      }

      // ★ 检查是否已被激活
      const normalizedCode = code.toUpperCase().trim();
      const existing = await isCodeUsed(store, normalizedCode);

      if (existing) {
        // 如果是同一设备 + 同一码 → 返回已有令牌（允许恢复）
        if (existing.fingerprint === (fingerprint || 'unknown')) {
          const token = generateToken(normalizedCode, fingerprint || 'unknown');
          const response = { valid: true, type: result.type, token, restored: true };
          if (result.type === 'vox') response.credits = result.credits;
          return json(response);
        }
        // 不同设备 → 拒绝
        return json({
          valid: false,
          msg: '该激活码已在其他设备上使用',
        });
      }

      // ★ 首次激活：写入记录
      const fp = fingerprint || 'unknown';
      const token = generateToken(normalizedCode, fp);
      const extra = result.type === 'vox' ? { credits: result.credits } : {};
      await markCodeUsed(store, normalizedCode, fp, result.type, extra);

      const response = { valid: true, type: result.type, token };
      if (result.type === 'vox') response.credits = result.credits;
      return json(response);
    }

    /* ── 验证已保存的令牌 ── */
    if (action === 'verify') {
      const { token: savedToken } = body;
      if (!code || !fingerprint || !savedToken) {
        return json({ valid: false });
      }
      const normalizedCode = code.toUpperCase().trim();
      const expectedToken = generateToken(normalizedCode, fingerprint);
      const tokenMatch = savedToken === expectedToken;

      // 同时检查 Blobs 中该码是否确实激活到了这个设备
      if (tokenMatch) {
        const existing = await isCodeUsed(store, normalizedCode);
        if (!existing || existing.fingerprint !== fingerprint) {
          return json({ valid: false });
        }
      }

      return json({ valid: tokenMatch });
    }

    /* ── 查询码状态（管理员） ── */
    if (action === 'status') {
      const { adminKey } = body;
      if (adminKey !== SECRET) {
        return json({ error: '无权限' }, 403);
      }
      if (!code) {
        return json({ error: '请提供码' }, 400);
      }
      const normalizedCode = code.toUpperCase().trim();
      const result = validateCode(normalizedCode);
      const existing = await isCodeUsed(store, normalizedCode);
      return json({
        code: normalizedCode,
        validFormat: result.valid,
        type: result.type || null,
        activated: !!existing,
        activationInfo: existing || null,
      });
    }

    /* ── 重置码（管理员，用于售后） ── */
    if (action === 'reset') {
      const { adminKey } = body;
      if (adminKey !== SECRET) {
        return json({ error: '无权限' }, 403);
      }
      if (!code) {
        return json({ error: '请提供码' }, 400);
      }
      const normalizedCode = code.toUpperCase().trim();
      await store.delete(normalizedCode);
      return json({ success: true, msg: `${normalizedCode} 已重置，可再次激活` });
    }

    return json({ error: 'Invalid action' }, 400);

  } catch (e) {
    console.error('Activate function error:', e);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
