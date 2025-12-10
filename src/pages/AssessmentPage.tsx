import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentPage.css";

interface AssessmentSentence {
  id: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

const AssessmentPage = () => {
  const navigate = useNavigate();

  // Sample assessment sentences
  const assessmentSentences: AssessmentSentence[] = [
    {
      id: 1,
      text: "The quick brown fox jumps over the lazy dog.",
      difficulty: "easy",
    },
    {
      id: 2,
      text: "Speech therapy helps improve communication skills.",
      difficulty: "medium",
    },
    {
      id: 3,
      text: "Articulation exercises strengthen your pronunciation ability.",
      difficulty: "hard",
    },
  ];

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedSentences, setUploadedSentences] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  const currentSentence = assessmentSentences[currentSentenceIndex];

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setUploadMessage("");
    } catch (error) {
      alert("Error accessing microphone. Please check permissions.");
      console.error(error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Re-record (clear and start over)
  const reRecord = () => {
    setRecordedAudio(null);
    setAudioURL("");
    setUploadMessage("");
    startRecording();
  };

  // Upload audio to backend
  const uploadAudio = async () => {
    if (!recordedAudio) {
      alert("Please record audio first.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("sentenceId", currentSentence.id.toString());
      formData.append("sentenceText", currentSentence.text);
      formData.append("audio", recordedAudio, "assessment_audio.wav");

      // Replace with your backend URL
      const response = await fetch(
        "http://localhost:8000/api/assessments/upload", // Update with your backend URL
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploadMessage(
          `✓ Assessment uploaded successfully! Score: ${data.score || "N/A"}`
        );
        setUploadedSentences([...uploadedSentences, currentSentence.id]);

        // Clear recording after successful upload
        setTimeout(() => {
          setRecordedAudio(null);
          setAudioURL("");
          setUploadMessage("");
        }, 2000);
      } else {
        setUploadMessage(
          "Upload failed. Please try again or check your connection."
        );
      }
    } catch (error) {
      setUploadMessage("Error uploading audio. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Move to next sentence
  const nextSentence = () => {
    if (currentSentenceIndex < assessmentSentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setRecordedAudio(null);
      setAudioURL("");
      setUploadMessage("");
    } else {
      alert(
        "Assessment complete! You have completed all sentences. Return to dashboard."
      );
    }
  };

  // Move to previous sentence
  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setRecordedAudio(null);
      setAudioURL("");
      setUploadMessage("");
    }
  };

  return (
    <div className="assessment-container">
      <header className="assessment-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 className="assessment-title">Speech Assessment</h1>
      </header>

      <main className="assessment-content">
        <div className="assessment-wrapper">
          {/* Progress */}
          <div className="assessment-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentSentenceIndex + 1) / assessmentSentences.length) * 100}%`,
                }}
              ></div>
            </div>
            <p className="progress-text">
              Sentence {currentSentenceIndex + 1} of {assessmentSentences.length}
            </p>
          </div>

          {/* Sentence Display */}
          <div className="sentence-card">
            <div className="difficulty-badge">
              <span className={`badge-${currentSentence.difficulty}`}>
                {currentSentence.difficulty.toUpperCase()}
              </span>
            </div>
            <div className="sentence-display">
              <h2 className="sentence-text">{currentSentence.text}</h2>
              <p className="sentence-instruction">
                Read the sentence aloud clearly and naturally
              </p>
            </div>
          </div>

          {/* Recording UI */}
          <div className="recording-card">
            <h3 className="recording-title">Record Your Speech</h3>

            {!recordedAudio ? (
              <div className="recording-controls">
                {!isRecording ? (
                  <button
                    className="record-button"
                    onClick={startRecording}
                    disabled={isUploading}
                  >
                    <span className="record-icon">🎤</span>
                    Start Recording
                  </button>
                ) : (
                  <button className="record-button recording" onClick={stopRecording}>
                    <span className="record-indicator"></span>
                    Stop Recording
                  </button>
                )}
                <p className="recording-hint">
                  {isRecording
                    ? "Recording... Click 'Stop Recording' when done."
                    : "Click the button above to start recording"}
                </p>
              </div>
            ) : (
              <div className="playback-controls">
                <div className="audio-player">
                  <span className="playback-icon">▶</span>
                  <audio
                    ref={audioElementRef}
                    src={audioURL}
                    controls
                    className="audio-element"
                  />
                </div>

                <div className="action-buttons">
                  <button
                    className="action-btn rerecord-btn"
                    onClick={reRecord}
                    disabled={isUploading}
                  >
                    🔄 Re-record
                  </button>
                  <button
                    className="action-btn upload-btn"
                    onClick={uploadAudio}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "✓ Upload & Continue"}
                  </button>
                </div>

                {uploadMessage && (
                  <p
                    className={`upload-message ${
                      uploadMessage.startsWith("✓") ? "success" : "error"
                    }`}
                  >
                    {uploadMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="navigation-controls">
            <button
              className="nav-button prev-btn"
              onClick={prevSentence}
              disabled={currentSentenceIndex === 0}
            >
              ← Previous
            </button>

            <div className="sentence-indicators">
              {assessmentSentences.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${
                    index === currentSentenceIndex
                      ? "active"
                      : uploadedSentences.includes(assessmentSentences[index].id)
                      ? "completed"
                      : ""
                  }`}
                ></div>
              ))}
            </div>

            <button
              className="nav-button next-btn"
              onClick={nextSentence}
              disabled={!uploadedSentences.includes(currentSentence.id)}
            >
              Next →
            </button>
          </div>

          {/* Summary */}
          <div className="assessment-summary">
            <p className="summary-text">
              Completed: {uploadedSentences.length}/{assessmentSentences.length}
            </p>
            {uploadedSentences.length === assessmentSentences.length && (
              <div className="completion-message">
                <span className="completion-icon">✨</span>
                <p>Great job! You've completed the assessment.</p>
                <button
                  className="return-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentPage;
