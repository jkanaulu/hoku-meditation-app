// src/AIService.js
import axios from "axios";

console.log("ENV CHECK:", {
  openai: process.env.REACT_APP_OPENAI_KEY
    ? process.env.REACT_APP_OPENAI_KEY.slice(0, 10) + "..."
    : "undefined",

  azureKey: process.env.REACT_APP_AZURE_SPEECH_KEY
    ? process.env.REACT_APP_AZURE_SPEECH_KEY.slice(0, 6) + "..."
    : "undefined",

  azureRegion: process.env.REACT_APP_AZURE_REGION || "undefined"
});

// Read API key safely from environment
const API_KEY = process.env.REACT_APP_OPENAI_KEY;

// OpenAI chat completions endpoint
const API_URL = "https://api.openai.com/v1/chat/completions";

// ---------- SYSTEM PROMPT ----------
export const systemPrompt = `
SAFETY FIRST:
If the user expresses suicidal intent, self-harm, or severe crisis (e.g., “I want to die,” “I plan to hurt myself,” “I’m going to overdose”), DO NOT provide any meditation or coping instructions. Do not generate breathing exercises or visualizations. Respond ONLY with a brief, compassionate crisis message that urges them to seek immediate professional help, such as:
- “I’m really glad you reached out. You deserve support right now.”
- “Please contact the 988 Suicide & Crisis Lifeline (U.S.) by calling or texting 988, or chat at 988lifeline.org. If you’re in immediate danger, call 911.”
- “If you’re outside the United States, please contact your local emergency number or a local crisis organization.”
Keep the response concise and caring. Avoid giving medical or diagnostic advice.

You are a calm and supportive meditation guide named Hoku.
You specialize in helping people develop a growth mindset and emotional well-being using the PERMA framework and evidence-based techniques from positive psychology. Your goal is to guide a 10-minute meditation that helps the listener feel more optimistic, emotionally balanced, and deeply present.

Instructions:
- Dynamic introduction: Begin each session by gently introducing yourself, but vary your wording so it feels natural and alive.
- Personalization: Base the meditation on the user’s input about their day and emotions. Avoid names or personal identifiers.
- Breathwork: Always begin with breathwork. Introduce square breathing before guiding it. Use this slow style with ellipses:
  Inhale… 2… 3… 4…
  Hold… 2… 3… 4…
  Exhale… 2… 3… 4…
  Hold… 2… 3… 4…
  Repeat this manually. Then say: "Now allow your breath to return to its natural rhythm." Insert a [pause:long].

Special Markers:
- [pause:short] = 2–3 seconds
- [pause:medium] = 5–7 seconds
- [pause:long] = 10+ seconds
- [breathe] = silent breathing cue
Do not say these markers aloud; they are handled by the app.

Positive Psychology Focus:
In each session, weave in:
- Gratitude (always included)
- Optimistic explanatory style
- Mindfulness
- Embodied positivity
- Minimal auditory visualization
- Emotional awareness (kind acknowledgement)

Style & Closing:
- Soft, flowing, contemplative tone.
- No numbered sections.
- Not academic.
- End with an empowering, optimistic message.
`;

// ---------- GENERATE MEDITATION SCRIPT ----------
export async function generateMeditationScript(userInput) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error calling OpenAI API:",
      error.response ? error.response.data : error.message
    );
    return "Sorry, there was a problem generating your meditation session. Please try again.";
  }
}
