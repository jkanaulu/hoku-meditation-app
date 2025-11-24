// src/App.js
import React, { useMemo, useState } from "react";
import { generateMeditationScript } from "./AIService";
import { speakWithAzure } from "./AzureTTS";
import HokuAvatar from "./components/HokuAvatar";
import Starfield from "./components/Starfield";
import { motion, AnimatePresence } from "framer-motion";
import { detectCrisis, getCrisisMessage } from "./safety";

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);

  // 🚫 Are we inside an iframe? (e.g., embedded in Wix)
  const isIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true; // if access is blocked, assume iframe
    }
  })();

  const handleGenerateScript = async () => {
    try {
      setLoading(true);

      // 1. Crisis detection first
      if (detectCrisis(userInput)) {
        const crisisText = getCrisisMessage();
        setScript(crisisText);
        setIsCrisis(true);
        return; // no AI, no TTS
      }

      setIsCrisis(false);

      // 2. Normal meditation flow
      const aiScript = await generateMeditationScript(userInput);
      setScript(aiScript);

      await speakWithAzure(aiScript);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating or speaking the meditation.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // 👉 If we’re embedded (e.g., Wix iframe), warn and bail
    if (isIframe) {
      alert(
        "Voice input isn’t available when Hoku is embedded.\n\nPlease open the meditation app in a new tab to use voice."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) =>
      setUserInput(event.results[0][0].transcript);
    recognition.onerror = (event) =>
      alert(`Voice input failed. Error: ${event.error}`);
    recognition.start();
  };

  const voiceButtonLabel = useMemo(
    () => (
      <>
        <span className="mr-1">🎤</span>{" "}
        {isIframe ? "Voice Input (Open in New Tab)" : "Voice Input"}
      </>
    ),
    [isIframe]
  );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020] to-[#1F2B60]" />

      {/* Stars */}
      <Starfield />

      {/* Main UI */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <HokuAvatar size={56} paused={loading} />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Hoku • AI-Guided Meditation
            </h1>
            <p className="text-stone-300/80 text-sm">
              10 minutes • gratitude • square breathing
            </p>
            {isIframe && (
              <p className="mt-1 text-xs text-amber-200/90">
                Voice input is limited when embedded. For full features, open
                Hoku in a new tab.
              </p>
            )}
          </div>
        </header>

        {/* Card */}
        <section className="rounded-2xl bg-white/5 border border-white/10 shadow-xl p-6 md:p-8">
          <label
            htmlFor="feeling"
            className="block text-sm text-stone-300 mb-2"
          >
            Describe how you’re feeling today
          </label>

          <textarea
            id="feeling"
            rows={4}
            className="w-full rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-teal-300/40 placeholder:text-stone-400 p-4"
            placeholder="A few words about your day…"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateScript}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition shadow-sm
                ${
                  loading
                    ? "bg-white/10 text-stone-300 cursor-not-allowed"
                    : "bg-teal-500/90 hover:bg-teal-500 text-white hover:shadow-lg hover:shadow-teal-400/40"
                }
              `}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  Generating…
                </>
              ) : (
                <>Generate Meditation</>
              )}
            </button>

            <button
              onClick={handleVoiceInput}
              disabled={loading}
              className="rounded-xl px-4 py-2 bg-indigo-500/80 hover:bg-indigo-500 transition text-white shadow-sm hover:shadow-lg hover:shadow-indigo-400/40"
              title={
                isIframe
                  ? "Voice input only works when Hoku is opened directly."
                  : "Use your microphone to describe your day"
              }
            >
              {voiceButtonLabel}
            </button>
          </div>

          {/* Crisis or Meditation Script */}
          <AnimatePresence>
            {script && (
              <motion.div
                key="script"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {isCrisis ? "You Are Not Alone 💛" : "Meditation Script"}
                </h2>

                <div
                  className={`rounded-xl border p-4 max-h-[50vh] overflow-auto
                    ${
                      isCrisis
                        ? "bg-red-900/40 border-red-400/40"
                        : "bg-black/30 border-white/10"
                    }
                  `}
                >
                  <pre
                    className={`whitespace-pre-wrap break-words text-base leading-relaxed ${
                      isCrisis ? "text-red-100" : "text-stone-100/95"
                    }`}
                  >
                    {script}
                  </pre>
                </div>

                {isCrisis && (
                  <p className="mt-3 text-xs text-red-200">
                    Meditation is turned off right now for your safety.  
                    Please reach out to someone who can support you. 💛
                  </p>
                )}

                {!isCrisis && (
                  <p className="mt-2 text-xs text-stone-400">
                    The app silently handles markers like <code>[pause]</code>{" "}
                    and <code>[breathe]</code>.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
