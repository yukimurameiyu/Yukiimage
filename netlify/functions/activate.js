const crypto = require('crypto');

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
  
  码由 HMAC-SHA256(SECRET, prefix+index) 生成
  SECRET 存储在 Netlify 环境变量 ACTIVATE_SECRET 中
  
  设置方法：
  1. 去 Netlify → Site settings → Environment variables
  2. 添加 ACTIVATE_SECRET = 你的密钥（随便一个长字符串，比如 "yura-world-2026-secret-key"）
  3. 重新部署
*/

const SECRET = process.env.ACTIVATE_SECRET || 'default-dev-secret-change-me';
const MAX_POT = 500;   // 最多500个单角色码
const MAX_SPOT = 100;  // 最多100个VIP码
const MAX_VOX = 900;   // 最多900个语音包码

/* VOX码额度分段：1-500=100条，501-800=300条，801-900=500条 */
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
  // 取前len个字符，转大写字母+数字
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉容易混淆的0OI1
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
    return `POT-${raw.slice(0,4)}-${raw.slice(4,8)}`;
  } else if (type === 'SPOT') {
    const raw = hashToCode(h, 9);
    return `SPOT-${raw.slice(0,4)}-${raw.slice(4,9)}`;
  } else {
    const raw = hashToCode(h, 8);
    return `VOX-${raw.slice(0,4)}-${raw.slice(4,8)}`;
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  try {
    const { code, fingerprint, action } = JSON.parse(event.body);

    if (action === 'generate') {
      /* 
        批量生成码（管理员接口）
        需要在请求中带上 adminKey = ACTIVATE_SECRET 才能使用
      */
      const { adminKey, type, count, startIndex } = JSON.parse(event.body);
      if (adminKey !== SECRET) {
        return {
          statusCode: 403,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: '无权限' })
        };
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
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes, type: t, range: `${start}-${end}` })
      };
    }

    if (action === 'activate') {
      if (!code) {
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ valid: false, msg: '请输入激活码' })
        };
      }

      const result = validateCode(code);
      if (!result.valid) {
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ valid: false, msg: '激活码无效' })
        };
      }

      const token = generateToken(code, fingerprint || 'unknown');

      const response = {
        valid: true,
        type: result.type,
        token: token
      };
      if (result.type === 'vox') response.credits = result.credits;

      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      };
    }

    if (action === 'verify') {
      /* 验证已保存的令牌是否有效 */
      const { token: savedToken } = JSON.parse(event.body);
      if (!code || !fingerprint || !savedToken) {
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ valid: false })
        };
      }
      const expectedToken = generateToken(code, fingerprint);
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: savedToken === expectedToken })
      };
    }

    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (e) {
    console.error('Activate function error:', e);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
