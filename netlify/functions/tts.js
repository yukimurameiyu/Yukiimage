const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/*
  语音合成代理 — 服务端Key路由版
  ─────────────────────────────
  voiceId → 自动匹配对应的 GroupID + API Key
  Key 全部存在 Netlify 环境变量中，前端不接触任何密钥
  
  环境变量：
  MM_GID_1 / MM_KEY_1  → 幸村、不二、龙马
  MM_GID_2 / MM_KEY_2  → 迹部、仁王、白石
  MM_GID_3 / MM_KEY_3  → 切原、丸井、手冢
*/

/* voiceId → Group 映射表 */
const VOICE_GROUPS = {
  /* Group 1: 幸村、不二、龙马 */
  'moss_audio_7640a205-1c01-11f0-8444-ae62a3be7263': 1,
  'moss_audio_046b037b-5268-11f1-a392-62a1f5ede8a7': 1,
  'moss_audio_acd1bb6d-76bb-11f0-bf4e-36eebb3a5cd2': 1,
  /* Group 2: 迹部、仁王、白石 */
  'moss_audio_92a7b9ad-45f7-11f1-9a65-82cf71cc1704': 2,
  'moss_audio_b04d0bbc-d724-11f0-800d-c27e4a692e29': 2,
  'moss_audio_5bb25b05-46f6-11f1-aea0-d66da573c477': 2,
  /* Group 3: 切原、丸井、手冢 */
  'moss_audio_7977ae67-4766-11f1-aea0-d66da573c477': 3,
  'moss_audio_cf472ecd-4765-11f1-aea0-d66da573c477': 3,
  'moss_audio_64399ad7-4765-11f1-a5fa-da25f7b561f0': 3,
};

function getGroupCredentials(voiceId) {
  const groupNum = VOICE_GROUPS[voiceId];
  if (groupNum) {
    const gid = process.env[`MM_GID_${groupNum}`];
    const key = process.env[`MM_KEY_${groupNum}`];
    if (gid && key) return { groupId: gid, apiKey: key };
  }
  /* 回退：尝试 Group 1 作为默认 */
  const fallbackGid = process.env.MM_GID_1;
  const fallbackKey = process.env.MM_KEY_1;
  if (fallbackGid && fallbackKey) return { groupId: fallbackGid, apiKey: fallbackKey };
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body);
    const { text, voiceId, site } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_resp: { status_code: 400, status_msg: 'Missing text' } })
      };
    }

    /* 优先用服务端 Key，回退到客户端传入的（兼容站长本地测试） */
    let credentials = getGroupCredentials(voiceId || '');
    if (!credentials && body.apiKey && body.groupId) {
      credentials = { groupId: body.groupId, apiKey: body.apiKey };
    }
    if (!credentials) {
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_resp: { status_code: 401, status_msg: '语音服务未配置' } })
      };
    }

    /* 频率限制：简单的每分钟限制（基于IP） */
    // 可后续扩展

    const apiHost = (site === 'intl') ? 'api.minimax.io' : 'api.minimax.chat';
    const url = `https://${apiHost}/v1/t2a_v2?GroupId=${credentials.groupId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'speech-02-turbo',
        text,
        stream: false,
        voice_setting: {
          voice_id: voiceId || 'Calm_Woman',
          speed: 1.0,
          vol: 1.0,
          pitch: 0
        },
        audio_setting: {
          format: 'mp3',
          sample_rate: 32000,
          bitrate: 128000
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('MiniMax API error:', response.status, errText);
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_resp: { status_code: response.status, status_msg: errText.slice(0, 200) }
        })
      };
    }

    const data = await response.json();

    /* MiniMax 默认返回 hex 编码的音频，前端需要 base64，在这里转换 */
    if (data.data && data.data.audio) {
      const raw = data.data.audio;
      const isHex = /^[0-9a-fA-F]+$/.test(raw.slice(0, 100));
      if (isHex) {
        data.data.audio = Buffer.from(raw, 'hex').toString('base64');
      }
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.error('TTS function error:', e);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: e.message,
        base_resp: { status_code: 500, status_msg: e.message }
      })
    };
  }
};
