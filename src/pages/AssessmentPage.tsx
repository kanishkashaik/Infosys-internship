import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import { API_BASE_URL } from "../config/env";
import "./AssessmentPage.css";
import roboGif from "../assets/robo.gif";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssessmentSentence {
  id: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

type PhonemeResult = {
  symbol: string;
  accuracy: number;
};

type WordResult = {
  text: string;
  correct: boolean;
};

// Fallback sentence if backend fetch fails
const assessmentSentences: AssessmentSentence[] = [
  {
    id: 1,
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "easy",
  },
];

const SCORE_PHRASES: string[] = [
  "Zero the hero - every journey starts here!",
  "One and done? No way, you've just begun!",
  "Two steps in - let's begin!",
  "Three's the key to victory!",
  "Four and ready for more!",
  "High five! You're alive in this!",
  "Six in the mix - building your fix!",
  "Seven - lucky start, keep going smart!",
  "Eight feels great - you're on your way!",
  "Nine and fine - you're on the climb!",
  "Perfect ten foundation - nice sensation!",
  "Eleven - you're on your way to heaven!",
  "A dozen delights - you're taking flight!",
  "Thirteen keen - sharp and seen!",
  "Fourteen's lean and mean machine!",
  "Fifteen's sheen - you're on the scene!",
  "Sweet sixteen - making moves unseen!",
  "Seventeen supreme - living the dream!",
  "Eighteen's great - accelerate!",
  "Nineteen shine - you're doing fine!",
  "Twenty plenty - momentum aplenty!",
  "Twenty-one guns - fun's just begun!",
  "Twenty-two breakthrough - you know what to do!",
  "Twenty-three spree - growing free!",
  "Twenty-four, there's more in store!",
  "Quarter century - energy and synergy!",
  "Twenty-six sticks - learning new tricks!",
  "Twenty-seven heaven - skills are leaven!",
  "Twenty-eight's straight - feeling great!",
  "Twenty-nine fine wine - you shine!",
  "Thrilling thirty - strong and sturdy!",
  "Thirty-one, having fun!",
  "Thirty-two crew - you're breaking through!",
  "Thirty-three glee - wild and free!",
  "Thirty-four score - you're soaring more!",
  "Thirty-five alive - watch you thrive!",
  "Thirty-six fix - in the mix!",
  "Thirty-seven's heaven - you're even steven!",
  "Thirty-eight great - elevate!",
  "Thirty-nine divine - right on time!",
  "Fabulous forty - feeling sporty!",
  "Forty-one champion - you're the one!",
  "Forty-two true blue - breakthrough view!",
  "Forty-three free - climbing the tree!",
  "Forty-four roar - hear the score!",
  "Forty-five high jive - you're alive!",
  "Forty-six kicks - magical tricks!",
  "Forty-seven heaven - perfectly leaven!",
  "Forty-eight's straight - first-rate!",
  "Forty-nine sublime - perfect time!",
  "Nifty fifty - halfway shifty!",
  "Fifty-one stun - you've won!",
  "Fifty-two breakthrough - you flew through!",
  "Fifty-three spree - soaring free!",
  "Fifty-four score - wanting more!",
  "Fifty-five drive - fully alive!",
  "Fifty-six slick - you're the pick!",
  "Fifty-seven heaven - rising leaven!",
  "Fifty-eight great - celebrate!",
  "Fifty-nine fine - stars align!",
  "Sensational sixty - skills are nifty!",
  "Sixty-one fun - you've outdone!",
  "Sixty-two crew - champion through and through!",
  "Sixty-three decree - mastery!",
  "Sixty-four soar - lion's roar!",
  "Sixty-five thrive - skills arrive!",
  "Sixty-six tricks - perfect mix!",
  "Sixty-seven heaven - excellence is given!",
  "Sixty-eight mate - absolutely great!",
  "Sixty-nine shine - simply divine!",
  "Superb seventy - excellence aplenty!",
  "Seventy-one ton - you're number one!",
  "Seventy-two grew - brilliant you!",
  "Seventy-three glee - peak degree!",
  "Seventy-four raw score - hear the roar!",
  "Seventy-five alive - champion drive!",
  "Seventy-six slicks - elite picks!",
  "Seventy-seven's heaven - perfection's leaven!",
  "Seventy-eight first-rate - celebrate!",
  "Seventy-nine fine wine - you're prime!",
  "Awesome eighty - skills are weighty!",
  "Eighty-one stun - you've won big!",
  "Eighty-two flew - genius breakthrough!",
  "Eighty-three free - pure mastery!",
  "Eighty-four roar - legendary score!",
  "Eighty-five jive - elite and alive!",
  "Eighty-six fix - champion tricks!",
  "Eighty-seven heaven - absolute perfection given!",
  "Eighty-eight great - world-class rate!",
  "Eighty-nine divine - brilliant shine!",
  "Magnificent ninety - excellence infinitely!",
  "Ninety-one champion - second to none!",
  "Ninety-two guru - genius through and through!",
  "Ninety-three decree - pure brilliancy!",
  "Ninety-four score - legendary core!",
  "Ninety-five thrive - top of the hive!",
  "Ninety-six tricks - perfection's mix!",
  "Ninety-seven heaven - flawless and leaven!",
  "Ninety-eight first-rate - nearly perfect state!",
  "Ninety-nine divine - one step from sublime!",
  "💯 PERFECT HUNDRED - ABSOLUTE WONDER! 💯",
];

/* Mic Icon Component */
const MicIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="4" width="6" height="10" rx="3" fill="currentColor" opacity="0.9" />
    <path
      d="M6 10a6 6 0 0012 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M12 16v3.5M9.5 19.5h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const USE_DEMO_RESULTS = false; // disable demo bypass — use real backend

// DEV bypass: temporary UI to jump straight to results for verification.
// Remove this block when verification is complete.

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  // Single sentence fetched from backend (frontend unaware which will arrive)
  const [fetchedSentence, setFetchedSentence] = useState<AssessmentSentence | null>(null);
  const [currentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<{
    fluency_score?: number;
    phoneme_accuracy?: number;
    word_accuracy?: number;
  } | null>(null);
  const [animatedMetrics, setAnimatedMetrics] = useState<{
    fluency_score?: number;
    phoneme_accuracy?: number;
    word_accuracy?: number;
  }>({});

  const [detailedResults, setDetailedResults] = useState<{
    overallScore?: number;
    mistakesSummary?: string;
    phonemes?: PhonemeResult[];
    words?: WordResult[];
    referenceAudioUrl?: string;
  } | null>(null);

  // Timer state (no time limit)
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const metricsAnimationFrameRef = useRef<number | null>(null);
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
  

  const currentSentence = assessmentSentences[currentSentenceIndex];
  // expose a safe getter for the sentence text (fallback to legacy hardcoded text)
  const sentenceText = fetchedSentence?.text ?? (assessmentSentences && assessmentSentences[currentSentenceIndex]?.text) ?? "Please read the sentence provided.";

  // fetch one sentence from backend: GET /assessment/recommend
  useEffect(() => {
    let cancelled = false;

    const attempt = async () => {
      try {
        const res = await apiClient.get("/assessment/recommend");
        const body = res?.data ?? {};
        const text = body.text;
        // Note: Contract doesn't show sentence_id in response, but upload requires it.
        // Using fallback to 1 if not present. Backend may return it despite not being in contract example.
        const id = body.sentence_id || body.id || 1;
        if (text) {
          const sent: AssessmentSentence = { id, text, difficulty: body.difficulty || "easy" };
          if (!cancelled) {
            setFetchedSentence(sent);
          }
          return;
        }
      } catch (e) {
        // ignore
      }

      if (!cancelled) {
        const fallback = assessmentSentences[0];
        setFetchedSentence(fallback);
      }
    };

    attempt();

    return () => {
      cancelled = true;
    };
  }, []);

  // Start recording and start timer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setRecordTime(0);
      setUploadMessage("");

      // start timer
      timerRef.current = window.setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

      recorder.ondataavailable = (evt: BlobEvent) => {
        if (evt.data && evt.data.size > 0) audioChunksRef.current.push(evt.data);
      };

      recorder.onstop = () => {
        // stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setRecordedAudio(blob);
        setAudioURL(URL.createObjectURL(blob));
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Error accessing microphone. Please allow microphone permission.");
      console.error(err);
    }
  };

  // Temporary handler to bypass analysis and show demo results immediately.
  // DEV bypass removed: analysis now requires backend.

  // Stop recording and stop timer
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Re-record: clear previously recorded audio and start new recording
  const reRecord = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordedAudio(null);
    setAudioURL("");
    setRecordTime(0);
    startRecording();
  };

  const { user, token } = useAuth();

  // Upload audio to backend
  const uploadAudio = async () => {
    if (!recordedAudio) {
      alert("Please record audio first.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    setLastMetrics(null);

    // Demo mode: bypass backend and fabricate results so UI works even if API is down.
    if (USE_DEMO_RESULTS) {
      setTimeout(() => {
        const demoMetrics = {
          fluency_score: 82,
          phoneme_accuracy: 76,
          word_accuracy: 88,
        };
        setLastMetrics(demoMetrics);

        setDetailedResults({
          overallScore: 81,
          mistakesSummary:
            "You tended to shorten vowel sounds in 'quick' and 'lazy', and your final consonant in 'dog' was slightly dropped.",
          phonemes: [
            { symbol: "/ð/", accuracy: 78 },
            { symbol: "/ɪ/", accuracy: 70 },
            { symbol: "/k/", accuracy: 90 },
            { symbol: "/b/", accuracy: 88 },
            { symbol: "/r/", accuracy: 60 },
            { symbol: "/ɔː/", accuracy: 72 },
          ],
          words: [
            { text: "The", correct: true },
            { text: "quick", correct: false },
            { text: "brown", correct: true },
            { text: "fox", correct: true },
            { text: "jumps", correct: true },
            { text: "over", correct: true },
            { text: "the", correct: true },
            { text: "lazy", correct: false },
            { text: "dog.", correct: false },
          ],
          referenceAudioUrl: undefined,
        });

        // hide any previous upload text once scores are shown
        setUploadMessage("");
        setIsUploading(false);
      }, 900);
      return;
    }

    const userId = String(user?.id ?? localStorage.getItem("user_id") ?? "1");
    const sentenceId = String(fetchedSentence?.id ?? currentSentence.id);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("sentence_id", sentenceId);
      formData.append("audio_file", recordedAudio, "assessment_audio.wav");

      const uploadUrl = `${API_BASE_URL}/assessement/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken") || ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const statusCode = data?.StatusCode ?? data?.statusCode;
        const metrics = data?.data || {};

        if (statusCode && Number(statusCode) !== 201) {
          throw new Error(data?.message || "Upload failed");
        }

        setLastMetrics({
          fluency_score: metrics.fluency_score,
          phoneme_accuracy: metrics.phoneme_accuracy,
          word_accuracy: metrics.word_accuracy,
          weak_Phoneme: Array.isArray(metrics.weak_Phoneme) ? metrics.weak_Phoneme : undefined,
        });

        // Store weak_Phoneme for practice recommendations
        if (Array.isArray(metrics.weak_Phoneme)) {
          try {
            sessionStorage.setItem("weak_Phoneme", JSON.stringify(metrics.weak_Phoneme));
          } catch {}
        }

        // Build richer results module if backend provides more detail.
        const root: any = data || {};
        const metricRoot: any = metrics || {};

        const rawPhonemes: any[] | undefined =
          metricRoot.phonemes ||
          metricRoot.phoneme_results ||
          root.phonemes ||
          root.phoneme_results;

        const phonemes: PhonemeResult[] | undefined = Array.isArray(rawPhonemes)
          ? rawPhonemes
              .map((p) => ({
                symbol: String(p.symbol ?? p.phoneme ?? p.phone ?? "?"),
                accuracy:
                  typeof p.accuracy === "number"
                    ? p.accuracy
                    : typeof p.score === "number"
                    ? p.score
                    : undefined,
              }))
              .filter((p) => typeof p.accuracy === "number") as PhonemeResult[]
          : undefined;

        const rawWords: any[] | undefined =
          metricRoot.words || metricRoot.word_results || root.words || root.word_results;

        const words: WordResult[] | undefined = Array.isArray(rawWords)
          ? rawWords.map((w) => ({
              text: String(w.text ?? w.word ?? ""),
              correct: w.correct === undefined ? w.is_correct !== false : !!w.correct,
            }))
          : undefined;

        const overallScore: number | undefined =
          typeof metricRoot.overall_score === "number"
            ? metricRoot.overall_score
            : typeof metricRoot.sentence_score === "number"
            ? metricRoot.sentence_score
            : typeof root.overall_score === "number"
            ? root.overall_score
            : undefined;

        const mistakesSummary: string | undefined =
          metricRoot.mistakes_summary ?? root.mistakes_summary ?? root.summary;

        // Accept multiple possible key names for reference audio coming from backend
        const rawRefCandidates = [
          metricRoot?.reference_audio_url,
          metricRoot?.referenceAudioUrl,
          metricRoot?.reference_audio,
          metricRoot?.reference_url,
          metricRoot?.reference,
          root?.reference_audio_url,
          root?.referenceAudioUrl,
          root?.reference_audio,
          root?.reference_url,
          root?.reference,
        ];

        let referenceAudioUrl: string | undefined = undefined;
        for (const cand of rawRefCandidates) {
          if (typeof cand === "string" && cand.trim() !== "") {
            referenceAudioUrl = cand.trim();
            break;
          }
        }

        // If we have a relative path, build a full URL using the apiClient baseURL
        if (referenceAudioUrl) {
          const isAbsolute = /^https?:\/\//i.test(referenceAudioUrl);
          if (!isAbsolute) {
            try {
              const apiBase = (apiClient.defaults.baseURL as string) || "";
              // remove trailing /api or /api/ from base to get host root
              const hostRoot = apiBase.replace(/\/?api\/?$/i, "");
              // ensure leading slash on path
              const path = referenceAudioUrl.startsWith("/") ? referenceAudioUrl : "/" + referenceAudioUrl;
              referenceAudioUrl = hostRoot ? hostRoot + path : referenceAudioUrl;
            } catch (e) {
              // fallback: leave as-is
            }
          }
        }

        setDetailedResults({
          overallScore,
          mistakesSummary,
          phonemes,
          words,
          referenceAudioUrl,
        });
      } else {
        setUploadMessage("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUploadMessage("Upload error. Check network or backend.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (metricsAnimationFrameRef.current !== null) {
        cancelAnimationFrame(metricsAnimationFrameRef.current);
      }
    };
  }, []);

  // Smoothly animate metrics numbers when new scores arrive
  useEffect(() => {
    if (!lastMetrics) return;

    const hasNumericMetrics =
      typeof lastMetrics.fluency_score === "number" ||
      typeof lastMetrics.phoneme_accuracy === "number" ||
      typeof lastMetrics.word_accuracy === "number";

    if (!hasNumericMetrics) {
      setAnimatedMetrics(lastMetrics);
      return;
    }

    const startTimestamp = performance.now();
    const duration = 800; // ms

    const startValues = {
      fluency_score: 0,
      phoneme_accuracy: 0,
      word_accuracy: 0,
    };

    const targetValues = {
      fluency_score: lastMetrics.fluency_score ?? 0,
      phoneme_accuracy: lastMetrics.phoneme_accuracy ?? 0,
      word_accuracy: lastMetrics.word_accuracy ?? 0,
    };

    const animate = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedMetrics({
        fluency_score:
          lastMetrics.fluency_score !== undefined
            ? startValues.fluency_score + (targetValues.fluency_score - startValues.fluency_score) * easeOut
            : undefined,
        phoneme_accuracy:
          lastMetrics.phoneme_accuracy !== undefined
            ? startValues.phoneme_accuracy +
              (targetValues.phoneme_accuracy - startValues.phoneme_accuracy) * easeOut
            : undefined,
        word_accuracy:
          lastMetrics.word_accuracy !== undefined
            ? startValues.word_accuracy + (targetValues.word_accuracy - startValues.word_accuracy) * easeOut
            : undefined,
      });

      if (progress < 1) {
        metricsAnimationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (metricsAnimationFrameRef.current !== null) {
      cancelAnimationFrame(metricsAnimationFrameRef.current);
    }
    metricsAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [lastMetrics]);

  // format timer mm:ss
  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getScorePhrase = (score?: number) => {
    if (score === undefined || Number.isNaN(score)) return "";
    const clamped = Math.min(100, Math.max(0, Math.round(score)));
    return SCORE_PHRASES[clamped] ?? "";
  };

  return (
    <div className="assessment-container">
      <header className="assessment-header">
        <div className="assessment-header-inner">
          <div className="assessment-title-block">
            <div className="assessment-wave-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <h1 className="assessment-title">Speech Assessment</h1>
              <p className="assessment-subtitle">
              </p>
            </div>
          </div>
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="assessment-content">
        <div className="assessment-wrapper">
          {/* Progress bar */}
          <div className="assessment-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "100%" }} />
            </div>
            <p className="progress-text">
              Sentence {currentSentenceIndex + 1} of {assessmentSentences.length}
            </p>
          </div>

          {/* Sentence card */}
          <div className="sentence-card">
            <div className="sentence-display">
              <h2 className="sentence-text">{sentenceText}</h2>
              <p className="sentence-instruction">Read the sentence aloud clearly and naturally</p>
            </div>
          </div>

          {/* Recording card */}
          <div className={`recording-card ${isRecording ? "recording-active" : ""}`}>
            {isUploading && (
              <div className="upload-overlay" aria-label="Uploading audio">
                <span className="spinner dark" aria-hidden />
                <span className="overlay-text">Uploading audio…</span>
              </div>
            )}
            <h3 className="recording-title">Record Your Speech</h3>

            {/* Recording controls: compact start button + waveform + timer */}
            {!recordedAudio ? (
              <div className="recording-controls">
                {!isRecording ? (
                  <button
                    className="record-button pulse"
                    onClick={startRecording}
                    aria-label="Start Recording"
                  >
                    <span className="record-icon"><MicIcon /></span>
                    Start Recording
                  </button>
                ) : (
                  <button className="record-button recording" onClick={stopRecording} aria-label="Stop Recording">
                    <span className="dot-indicator" /> Stop Recording
                  </button>
                )}

                {/* waveform-like animation while recording */}
                {isRecording && (
                  <div className="recording-visualizer" aria-hidden>
                    <span className="bar b1" />
                    <span className="bar b2" />
                    <span className="bar b3" />
                    <span className="bar b4" />
                    <span className="bar b5" />
                  </div>
                )}

                {/* timer */}
                {isRecording && (
                  <div className="timer-box">
                    <span className="record-timer">{formatTime(recordTime)}</span>
                  </div>
                )}

                {/* hint */}
                <p className="recording-hint">
                  {isRecording ? "Recording... click Stop when finished." : "Click Start to begin recording."}
                </p>

                {/* DEV bypass removed in production; analysis uses backend only. */}

                {/* decorative ambient sound waves in free space */}
                <div className="ambient-waves" aria-hidden="true">
                  <div className="ambient-wave ambient-wave-1" />
                  <div className="ambient-wave ambient-wave-2" />
                  <div className="ambient-wave ambient-wave-3" />
                </div>
              </div>
            ) : (
              /* Playback + actions */
              <div className="playback-controls">
                <div className="audio-player">
                  <span className="replay-caption">Your recording</span>
                  <audio
                    ref={audioElementRef}
                    src={audioURL}
                    controls
                    className="audio-element"
                    onPlay={() => setIsPlaybackPlaying(true)}
                    onPause={() => setIsPlaybackPlaying(false)}
                    onEnded={() => setIsPlaybackPlaying(false)}
                  />
                  {isPlaybackPlaying && (
                    <div className="playback-visualizer" aria-hidden>
                      <span className="p-bar pb1" />
                      <span className="p-bar pb2" />
                      <span className="p-bar pb3" />
                      <span className="p-bar pb4" />
                      <span className="p-bar pb5" />
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <button
                    className="action-btn rerecord-btn"
                    onClick={reRecord}
                    disabled={isUploading}
                  >
                    Re-record
                  </button>

                  <button
                    className="action-btn upload-btn"
                    onClick={uploadAudio}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner" aria-hidden />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze"
                    )}
                  </button>
                </div>

                {uploadMessage && (
                  <p className={`upload-message ${uploadMessage.startsWith("✓") ? "success" : "error"}`}>
                    {uploadMessage}
                  </p>
                )}

                {lastMetrics && (
                  <div className="metrics-card">
                    <div className="metric">
                      <span className="metric-label">Fluency</span>
                      <span className="metric-value">
                        {lastMetrics.fluency_score === undefined
                          ? "N/A"
                          : Math.round(
                              animatedMetrics.fluency_score ?? lastMetrics.fluency_score
                            )}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Phoneme acc.</span>
                      <span className="metric-value">
                        {lastMetrics.phoneme_accuracy === undefined
                          ? "N/A"
                          : Math.round(
                              animatedMetrics.phoneme_accuracy ?? lastMetrics.phoneme_accuracy
                            )}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Word acc.</span>
                      <span className="metric-value">
                        {lastMetrics.word_accuracy === undefined
                          ? "N/A"
                          : Math.round(
                              animatedMetrics.word_accuracy ?? lastMetrics.word_accuracy
                            )}
                      </span>
                    </div>
                  </div>
                )}

                {detailedResults && (
                  <div className="results-module">
                    {typeof detailedResults.overallScore === "number" && (
  <div className="results-section overall">
    <div className="results-overall-left">
      <div className="results-label">Overall sentence score</div>
      <div className="results-overall-value" style={{ marginBottom: "10px", fontSize: "2.1rem" }}>
        {Math.round(detailedResults.overallScore)}
      </div>
      {getScorePhrase(detailedResults.overallScore) && (
        <div className="results-phrase one-line-bold">
          <b>{getScorePhrase(detailedResults.overallScore)}</b>
        </div>
      )}
      {/* Animated chart for main metrics */}
      {lastMetrics && (
        <div style={{padding: "18px 0", width: "100%", maxWidth: 470, margin: "0 auto"}}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={[
                { name: "Fluency", Score: Math.round(animatedMetrics.fluency_score ?? lastMetrics.fluency_score ?? 0) },
                { name: "Phoneme", Score: Math.round(animatedMetrics.phoneme_accuracy ?? lastMetrics.phoneme_accuracy ?? 0) },
                { name: "Word", Score: Math.round(animatedMetrics.word_accuracy ?? lastMetrics.word_accuracy ?? 0) },
              ]}
              margin={{ top: 8, right: 18, left: 6, bottom: 12 }}
              barSize={38}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontFamily: 'Doto, sans-serif', fontWeight: 700, fontSize: 16, fill: '#4f46e5' }}/>
              <YAxis domain={[0, 100]} tick={{ fontWeight: 600, fontSize: 15, fill: '#6366F1' }} />
              <Tooltip cursor={{fill: '#f3f4fa'}} contentStyle={{fontWeight: 700, borderRadius: 10, border: '1px solid #818cf8'}} />
              <Bar
                dataKey="Score"
                fill="url(#barGradient)"
                radius={[12, 12, 8, 8]}
                animationDuration={1200}
                isAnimationActive={true}
                label={{ position: 'top', fontWeight: 'bold', fill: '#4f46e5', fontSize: 18, fontFamily: 'Doto, sans-serif' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
)}

                    {detailedResults.phonemes && detailedResults.phonemes.length > 0 && (
                      <div className="results-section">
                        <div className="results-label">Per-phoneme</div>
                        <div className="phoneme-grid">
                          {detailedResults.phonemes.map((p, idx) => {
                            const acc = p.accuracy;
                            const band = acc >= 80 ? "good" : acc >= 50 ? "ok" : "bad";
                            return (
                              <div
                                key={`${p.symbol}-${idx}`}
                                className={`phoneme-chip ${band}`}
                              >
                                <span className="phoneme-symbol">{p.symbol}</span>
                                <span className="phoneme-score">{Math.round(acc)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {detailedResults.words && detailedResults.words.length > 0 && (
                      <div className="results-section">
                        <div className="results-label">Words (red = mispronounced)</div>
                        <p className="results-words-line">
                          {detailedResults.words.map((w, idx) => (
                            <span
                              key={`${w.text}-${idx}`}
                              className={`results-word${
                                w.correct ? "" : " results-word-mistake"
                              }`}
                            >
                              {w.text}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}

                    {detailedResults.mistakesSummary && (
                      <div className="results-section">
                        <div className="results-label">Your mistakes</div>
                        <p className="results-summary">
                          {detailedResults.mistakesSummary}
                        </p>
                      </div>
                    )}

                    <div className="results-section">
                      <div className="results-label">Replay options</div>
                      <div className="replay-players">
                        <div className="replay-block">
                          <span className="replay-caption subtle">Your recording</span>
                          <audio
                            src={audioURL}
                            controls
                            className="audio-element small"
                            onPlay={() => setIsPlaybackPlaying(true)}
                            onPause={() => setIsPlaybackPlaying(false)}
                            onEnded={() => setIsPlaybackPlaying(false)}
                          />
                          {isPlaybackPlaying && (
                            <div className="playback-visualizer" aria-hidden>
                              <span className="p-bar pb1" />
                              <span className="p-bar pb2" />
                              <span className="p-bar pb3" />
                              <span className="p-bar pb4" />
                              <span className="p-bar pb5" />
                            </div>
                          )}
                        </div>
                        <div className="replay-block">
                          <span className="replay-caption subtle">Reference audio</span>
                            {detailedResults.referenceAudioUrl ? (
                              <div className="reference-with-audio" aria-live="polite">
                                <div className="ref-badge ref-available">Reference available</div>
                                <div className="ref-audio-row">
                                  <audio
                                    src={detailedResults.referenceAudioUrl}
                                    controls
                                    className="audio-element small"
                                    onPlay={() => setIsPlaybackPlaying(true)}
                                    onPause={() => setIsPlaybackPlaying(false)}
                                    onEnded={() => setIsPlaybackPlaying(false)}
                                  />
                                  <div className="ref-wave" aria-hidden>
                                    <span className="rw-bar rw1" />
                                    <span className="rw-bar rw2" />
                                    <span className="rw-bar rw3" />
                                    <span className="rw-bar rw4" />
                                    <span className="rw-bar rw5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="reference-placeholder" aria-live="polite">
                                <div className="ref-cartoon" aria-hidden>
                                  <img src={roboGif} alt="Robot placeholder" className="robot-asset" />
                                </div>
                                <div>
                                  <div className="ref-text">Reference audio will appear here soon</div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
                    
                    <div className="results-actions" style={{textAlign: 'center', marginTop: 14}}>
                      <button
                        className="action-btn recommendations-btn"
                        onClick={() => {
                          // Navigate to recommendations - popup will appear if no assessment data
                          const payload = detailedResults ? {
                            detailedResults: detailedResults,
                            lastMetrics: lastMetrics,
                            audioURL: audioURL,
                            sentence: sentenceText,
                          } : null;
                          try {
                            if (payload) {
                              sessionStorage.setItem("last_assessment", JSON.stringify(payload));
                            }
                          } catch (e) {}
                          navigate("/recommendations", { state: payload });
                        }}
                      >
                        View Recommendations
                      </button>
                    </div>

                  </div>
  );
};

export default AssessmentPage;
