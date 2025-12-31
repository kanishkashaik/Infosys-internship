import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AssessmentPage.css";
import roboGif from "../assets/robo3.gif";
import apiClient from "../api/apiClient";

type PhonemeResult = { symbol: string; accuracy: number };
type WordResult = { text: string; correct: boolean };

const PHONEME_EXAMPLES: Record<string, string[]> = {
  "/ð/": ["this", "that", "these"],
  "/θ/": ["think", "bath", "thumb"],
  "/ɪ/": ["sit", "bit", "kit"],
  "/k/": ["cat", "quick", "kick"],
  "/b/": ["bad", "blue", "back"],
  "/r/": ["red", "run", "rock"],
  "/ɔː/": ["law", "saw", "draw"],
  default: ["play", "say", "try"],
};

const buildSentencesForPhoneme = (symbol: string): string[] => {
  const examples = PHONEME_EXAMPLES[symbol] || PHONEME_EXAMPLES["default"];
  const out: string[] = [];
  for (const w of examples) {
    out.push(`Say the word: ${w}`);
    out.push(`Try this sentence: ${w} is easy to say.`);
  }
  return out;
};

const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const payloadFromNav = (location.state as any) || null;
  const [payload, setPayload] = useState<any | null>(null);

  useEffect(() => {
    if (payloadFromNav) {
      setPayload(payloadFromNav);
      try {
        sessionStorage.setItem("last_assessment", JSON.stringify(payloadFromNav));
      } catch {}
      return;
    }
    try {
      const raw = sessionStorage.getItem("last_assessment");
      if (raw) setPayload(JSON.parse(raw));
    } catch {}
  }, [payloadFromNav]);

  const detailed = payload?.detailedResults ?? payload ?? null;
  const lastMetrics = payload?.lastMetrics ?? null;
  const sentence = payload?.sentence ?? "";

  const phonemes: PhonemeResult[] = Array.isArray(detailed?.phonemes) ? detailed.phonemes : [];
  const words: WordResult[] = Array.isArray(detailed?.words) ? detailed.words : [];

  const phonemesToPractice = phonemes
    .filter((p) => typeof p.accuracy === "number" && p.accuracy < 80)
    .sort((a, b) => a.accuracy - b.accuracy);

  const wordsToPractice = words.filter((w) => !w.correct).slice(0, 20);

  // Practice generation from API
  const [practiceSentences, setPracticeSentences] = useState<Array<{ text: string; sentence_id: number }>>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPracticeRecommendations = async () => {
      try {
        const weakPhonemes = lastMetrics?.weak_Phoneme || [];
        if (weakPhonemes.length === 0) {
          try {
            const stored = sessionStorage.getItem("weak_Phoneme");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                weakPhonemes.push(...parsed);
              }
            }
          } catch {}
        }
        if (weakPhonemes.length > 0) {
          const phonemesParam = weakPhonemes.join(",");
          const res = await apiClient.get(`/practice/recommendation?phonemes=${phonemesParam}`);
          const body = res?.data ?? {};
          const recommendations = Array.isArray(body.recommendations) ? body.recommendations : [];
          const practiceItems = recommendations.map((r: any) => ({
            text: r.text,
            sentence_id: r.sentence_id,
          }));
          setPracticeSentences(practiceItems);
          setCurrentPracticeIndex(practiceItems.length > 0 ? 0 : null);
          return;
        }
      } catch (e) {
        // ignore
      }
      setPracticeSentences([]);
      setCurrentPracticeIndex(null);
    };

    fetchPracticeRecommendations();
  }, [lastMetrics]);

  const currentPracticeText = currentPracticeIndex !== null && practiceSentences[currentPracticeIndex] ? practiceSentences[currentPracticeIndex].text : null;
  const currentPracticeSentenceId = currentPracticeIndex !== null && practiceSentences[currentPracticeIndex] ? practiceSentences[currentPracticeIndex].sentence_id : null;

  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [practiceResults, setPracticeResults] = useState<any | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert("Microphone access required to record practice attempts.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playReference = (text: string) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const utt = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices() || [];
      const findFemale = (v: SpeechSynthesisVoice) => {
        const name = (v.name || "").toLowerCase();
        return /female|woman|zira|amy|susan|kathy|google us english female|google uk english female/.test(name);
      };
      utt.voice = voices.find(findFemale) || voices.find((v) => /^en/i.test(v.lang)) || voices[0];
      utt.rate = 0.95;
      speechSynthesis.cancel();
      speechSynthesis.speak(utt);
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  if (!detailed) {
    return (
      <div className="assessment-container">
        <header className="assessment-header">
          <div className="assessment-header-inner">
            <div className="assessment-title-block">
              <h1 className="assessment-title">Recommendations</h1>
            </div>
            <button className="back-button recommendations-btn" onClick={() => { window.location.href = "/dashboard"; }}>
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="assessment-content">
          <div className="assessment-wrapper" style={{ padding: 24 }}>
            <p>No assessment data available. Complete an assessment to see personalized recommendations.</p>
            <div style={{ marginTop: 18 }}>
              <button className="action-btn recommendations-btn" onClick={() => { window.location.href = "/assessment"; }}>
                Go to Assessment
              </button>
            </div>
          </div>
        </main>

        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 16,
              maxWidth: 520,
              width: "90%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <img 
                src={roboGif} 
                alt="Robot illustration" 
                style={{ 
                  width: 120, 
                  height: "auto",
                  animation: "robot-bob 2s ease-in-out infinite"
                }} 
              />
            </div>
            <h2 
              style={{ 
                marginTop: 0,
                marginBottom: 12,
                fontFamily: '"Krona One", serif',
                fontSize: "1.8rem",
                color: "#4f46e5",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}
            >
              Assessment required
            </h2>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "0.95rem",
              marginBottom: 20,
              lineHeight: 1.6
            }}>
              You need to complete at least one assessment before viewing recommendations.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
              <button 
                className="action-btn recommendations-btn" 
                onClick={() => {
                  window.location.href = "/assessment";
                }}
              >
                Back to Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <header className="assessment-header">
        <div className="assessment-header-inner">
          <div className="assessment-title-block">
            <h1 className="assessment-title">Recommendations</h1>
            <p className="assessment-subtitle">Exercises tailored from your recent assessment</p>
          </div>
          <button className="back-button recommendations-btn" onClick={() => { window.location.href = "/dashboard"; }}>← Back to Dashboard</button>
        </div>
      </header>

      <main className="assessment-content">
        <div className="assessment-wrapper">
          <div style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Sentence assessed:</strong>
              <div style={{ marginTop: 6 }}>{sentence}</div>
            </div>

            {lastMetrics && (
              <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                <div className="metric">Fluency: <span className="metric-value">{Math.round(lastMetrics.fluency_score ?? 0)}</span></div>
                <div className="metric">Phoneme acc.: <span className="metric-value">{Math.round(lastMetrics.phoneme_accuracy ?? 0)}</span></div>
                <div className="metric">Word acc.: <span className="metric-value">{Math.round(lastMetrics.word_accuracy ?? 0)}</span></div>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <h3>Phonemes to practice</h3>
              {phonemesToPractice.length === 0 ? (
                <p>None detected — keep practicing the full sentence.</p>
              ) : (
                <div className="phoneme-grid">
                  {phonemesToPractice.map((p, idx) => (
                    <div key={`${p.symbol}-${idx}`} className="phoneme-chip bad">
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{p.symbol}</div>
                      <div style={{ fontSize: 13 }}>Accuracy: {Math.round(p.accuracy)}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <h3>Words to practice</h3>
              {wordsToPractice.length === 0 ? (
                <p>No mispronounced words detected.</p>
              ) : (
                <div className="results-words-line">
                  {wordsToPractice.map((w, i) => (
                    <span key={`${w.text}-${i}`} style={{ display: "inline-block", marginRight: 8, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 999 }}>
                      {w.text}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <h3>Practice area</h3>
              <p className="subtle">Select an exercise, then record your attempt.</p>

              <div style={{ marginTop: 12 }}>
                <h4>Exercises</h4>
                {practiceSentences.length === 0 ? (
                  <p className="subtle">No exercises available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {practiceSentences.map((ps, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentPracticeIndex(idx);
                          setPracticeResults(null);
                          setRecordedUrl(null);
                          setRecordedBlob(null);
                          try {
                            sessionStorage.setItem("selected_practice", JSON.stringify({ text: ps.text, sentence_id: ps.sentence_id }));
                          } catch {}
                        }}
                        style={{ cursor: "pointer", padding: 10, borderRadius: 10, border: idx === currentPracticeIndex ? "2px solid #4f46e5" : "1px solid #e5e7eb" }}
                      >
                        {ps.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {currentPracticeText && <div style={{ fontStyle: "italic" }}>{currentPracticeText}</div>}
                {!isRecording ? (
                  <button className="record-button pulse recommendations-btn" onClick={() => startRecording()}>Start Recording</button>
                ) : (
                  <button className="record-button recording recommendations-btn" onClick={() => stopRecording()}>Stop</button>
                )}
                {recordedUrl && (
                  <>
                    <audio src={recordedUrl} controls style={{ marginLeft: 8 }} />
                    <button 
                      className="action-btn recommendations-btn" 
                      onClick={async () => {
                        if (!recordedBlob || !currentPracticeSentenceId) return;
                        try {
                          const formData = new FormData();
                          formData.append("audio", recordedBlob, "practice_audio.webm");
                          formData.append("Sentence_id", String(currentPracticeSentenceId));
                          const res = await apiClient.post("/practice/submit", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          const body = res?.data ?? {};
                          setPracticeResults(body.data || {});
                        } catch (e) {
                          console.error("Practice submit failed", e);
                        }
                      }}
                    >
                      Submit Practice
                    </button>
                  </>
                )}
              </div>
              {practiceResults && (
                <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                  <h4>Practice Results</h4>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    {practiceResults.fluency_score !== undefined && (
                      <div className="metric">Fluency: <span className="metric-value">{Math.round(practiceResults.fluency_score)}</span></div>
                    )}
                    {practiceResults.phoneme_accuracy !== undefined && (
                      <div className="metric">Phoneme acc.: <span className="metric-value">{Math.round(practiceResults.phoneme_accuracy)}</span></div>
                    )}
                    {practiceResults.word_accuracy !== undefined && (
                      <div className="metric">Word acc.: <span className="metric-value">{Math.round(practiceResults.word_accuracy)}</span></div>
                    )}
                  </div>
                  {Array.isArray(practiceResults.computed_weak_phonemes) && practiceResults.computed_weak_phonemes.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Weak Phonemes:</strong> {practiceResults.computed_weak_phonemes.join(", ")}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <button className="action-btn recommendations-btn" onClick={() => { window.location.href = "/assessment"; }}>Back to Assessment</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RecommendationPage;
