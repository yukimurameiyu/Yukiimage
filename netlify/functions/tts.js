exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { text, groupId, apiKey, voiceId } = JSON.parse(event.body);
    const response = await fetch(
      `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'speech-02-turbo',
          text,
          voice_setting: { voice_id: voiceId, speed: 1.0, vol: 1.0, pitch: 0 },
          audio_setting: { format: 'mp3', sample_rate: 32000 }
        })
      }
    );
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

