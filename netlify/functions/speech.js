// netlify/functions/speech.js
import axios from "axios";

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const region = process.env.AZURE_REGION;
    const key = process.env.AZURE_SPEECH_KEY;

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-NancyNeural">
          <prosody rate="-10%" pitch="0%" volume="medium">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await axios.post(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      ssml,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm"
        },
        responseType: "arraybuffer"
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        audio: Buffer.from(response.data).toString("base64")
      })
    };
  } catch (err) {
    console.error("Azure TTS error:", err.response?.data || err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Azure TTS failed" })
    };
  }
};
