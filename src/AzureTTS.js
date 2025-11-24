// src/AzureTTS.js
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

/**
 * Convert meditation markers into SSML-safe content.
 * - [pause], [pause:short|medium|long] => <break/> tags
 * - [breathe] => short <break/>
 * - strips any unknown [marker]
 */
function convertMarkersToSSML(text) {
  const escape = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const DUR = {
    short: "2500ms",
    medium: "6000ms",
    long: "10000ms",
    breathe: "800ms",
  };

  let body = escape(text);

  // Replace known markers
  body = body.replace(/\[pause:(short|medium|long)\]/gi, (_, kind) =>
    `<break time="${DUR[kind.toLowerCase()]}" />`
  );
  body = body.replace(/\[pause\]/gi, `<break time="${DUR.medium}" />`);
  body = body.replace(/\[breathe\]/gi, `<break time="${DUR.breathe}" />`);

  // Remove any other [marker]
  body = body.replace(/\[[^\]]+\]/g, "");

  return `<p>${body}</p>`;
}

/**
 * Speak meditation script with Azure TTS.
 *
 * Defaults: en-US-NancyNeural in a gentle whisper.
 * You can override with the final `opts` object:
 *   { voiceName, style, rate, pitch, volume }
 *
 * Examples:
 *   speakWithAzure(text) // Nancy whisper default
 *   speakWithAzure(text, undefined, undefined, "en-US-JennyNeural", { style: "whispering", pitch: "0%", volume: "medium" })
 */
export function speakWithAzure(
  text,
  subscriptionKey = process.env.REACT_APP_AZURE_SPEECH_KEY,
  serviceRegion = process.env.REACT_APP_AZURE_REGION,
  voiceName = "en-US-NancyNeural",
  opts = {}
) {
  if (!subscriptionKey || !serviceRegion) {
    console.error("❌ Azure Speech key or region is missing.");
    return;
  }

  // ✅ Single, correct destructuring (no duplicates)
  const {
    style = "whispering", // ASMR-like
    rate = "-10%",        // a touch slower
    pitch = "0%",         // neutral pitch
    volume = "medium",    // normal loudness
  } = opts;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );
  speechConfig.speechSynthesisVoiceName = voiceName;

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  const ssmlBody = convertMarkersToSSML(text);

  // SSML with whisper style
  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts"
       xml:lang="en-US">
  <voice name="${voiceName}">
    <mstts:express-as style="${style}">
      <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
        ${ssmlBody}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>`.trim();

  synthesizer.speakSsmlAsync(
    ssml,
    (result) => {
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log(`✅ Speech synthesized with ${voiceName} (${style}, pitch ${pitch}, volume ${volume}).`);
      } else {
        console.error("❌ Speech synthesis failed:", result.errorDetails);
      }
      synthesizer.close();
    },
    (error) => {
      console.error("❌ Error during synthesis:", error);
      synthesizer.close();
    }
  );
}
