// src/AzureTTS.js

export async function speakWithAzure(text) {
  try {
    const res = await fetch("/.netlify/functions/speech", {
      method: "POST",
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      throw new Error("Azure TTS failed: " + res.status);
    }

    // Backend returns raw base64 string (NOT JSON)
    const base64Audio = await res.text();

    // Create audio object (MP3 output from Azure)
    const audio = new Audio("data:audio/mp3;base64," + base64Audio);

    audio.play();
  } catch (err) {
    console.error("Azure speech function error:", err);
  }
}
