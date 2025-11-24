// src/AzureTTS.js
import axios from "axios";

export async function speakWithAzure(text) {
  try {
    const response = await axios.post("/.netlify/functions/speech", {
      text
    });

    const audioBase64 = response.data;
    const audio = new Audio("data:audio/mp3;base64," + audioBase64);

    await audio.play();
  } catch (err) {
    console.error("Azure TTS function error:", err);
    throw new Error("Azure TTS failed: " + err.message);
  }
}
