// netlify/functions/speech.js
import axios from "axios";

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_REGION;

    if (!key || !region) {
      console.error("Missing Azure env vars:", { key, region });
      return {
        statusCode: 500,
        body: "Azure environment variables not set"
      };
    }

    // 1️⃣ Get Azure Access Token
    const tokenResponse = await axios.post(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const token = tokenResponse.data;

    // 2️⃣ Build SSML (Nancy whispering)
    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-NancyNeural" style="whispering">
          <prosody rate="-10%" pitch="0%" volume="medium">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // 3️⃣ Request TTS Audio (MP3)
    const audioResponse = await axios.post(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      ssml,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3"
        },
        responseType: "arraybuffer"
      }
    );

    // 4️⃣ Return Base64 MP3 (RAW, not JSON)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*"
      },
      body: Buffer.from(audioResponse.data).toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    console.error("Azure speech error:", err.response?.data || err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Azure speech function failed" })
    };
  }
};
