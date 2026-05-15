const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }
  try {
    const { text, groupId, apiKey, voiceId } = JSON.parse(event.body);

    if (!text || !apiKey) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_resp: { status_code: 400, status_msg: 'Missing text or apiKey' } })
      };
    }

    const url = groupId
      ? `https://api.minimax.io/v1/t2a_v2?GroupId=${groupId}`
      : `https://api.minimax.io/v1/t2a_v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
