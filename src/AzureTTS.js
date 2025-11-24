// src/AzureTTS.js

import axios from "axios";

export async function speakWithAzure(text) {
  try {
    const response = await axios.post("/.netlify/functions/speech", {
      text
    });

    // The function returns a base64 audio buffer
    const audioBase64 = response.data.audio;
    const audio = new Audio("data:audio/wav;base64," + audioBase64);
    audio.play();
  } catch (err) {
    console.error("Azure speech function error:", err);
  }
}
