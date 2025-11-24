// src/AzureTTS.js

export async function speakWithAzure(text) {
  try {
    const res = await fetch("/.netlify/functions/speech", {
      method: "POST",
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error("Azure TTS failed: " + res.status);

    // Function returns raw base64
    const base64 = await res.text();

    const audio = new Audio("data:audio/mp3;base64," + base64);
    await audio.play();
  } catch (err) {
    console.error("Azure speech function error:", err);
  }
}
