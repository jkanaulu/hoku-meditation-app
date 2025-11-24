// netlify/functions/speech.js
import axios from "axios";

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_REGION;

    if (!key || !region) {
      console.error("Azure env vars missing:", { key, region });
      return {
        statusCode: 500,
        body: "Missing Azure Speech environment variables"
      };
    }

    const ssml = `
      <speak version="1.0" xml:lang="en-US"
             xmlns:mstts="https://www.w3.org/2001/mstts">
        <voice name="en-US-NancyNeural">
          <mstts:express-as style="whispering">
            <prosody rate="-10%" pitch="0%" volume="medium">
              ${text}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `;

    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await axios.post(ttsUrl, ssml, {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"
      },
      responseType: "arraybuffer"
    });

    const base64Audio = Buffer.from(response.data).toString("base64");

    return {
      statusCode: 200,
      body: base64Audio
    };

  } catch (err) {
    console.error("Azure TTS error:", err.response?.data || err.message);

    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Azure TTS failed" })
    };
  }
};
