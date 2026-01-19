import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Volume2, VolumeX, CheckCircle } from "lucide-react";
import { RecordAnswer } from "./record-answer";
import { Button } from "./ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface QuestionSectionProps {
  questions: { question: string; answer: string }[];
}

export const QuestionSection = ({ questions }: QuestionSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [autoReadEnabled, setAutoReadEnabled] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Detect full-screen mode changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  // Apply full-screen styles to body when in full-screen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      
      // Hide header, footer, and all other layout elements
      const style = document.createElement('style');
      style.id = 'fullscreen-interview-style';
      style.textContent = `
        header, footer, nav, .header, .footer, .navigation { display: none !important; }
        body > div:not([data-fullscreen-interview]) { display: none !important; }
        [data-fullscreen-interview] { display: block !important; }
      `;
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      
      // Remove the full-screen styles
      const style = document.getElementById('fullscreen-interview-style');
      if (style) {
        document.head.removeChild(style);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      const style = document.getElementById('fullscreen-interview-style');
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, [isFullScreen]);

  const handlePlayQuestion = (qst: string) => {
    if (isPlaying && currentSpeech) {
      // stop the speech if already playing
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(qst);
        
        // Try to set Indian accent voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(voice => 
          voice.lang.includes('en-IN') || 
          voice.name.toLowerCase().includes('indian') ||
          voice.name.toLowerCase().includes('india')
        );
        
        if (indianVoice) {
          speech.voice = indianVoice;
        } else {
          // Fallback to any English voice
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          if (englishVoice) {
            speech.voice = englishVoice;
          }
        }
        
        // Set speech properties for better Indian accent simulation
        speech.rate = 0.7; // Slightly slower
        speech.pitch = 2.5; // Slightly higher pitch
        speech.volume = 1.8;
        
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);

        // handle the speech end
        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  const handleStopReading = () => {
    if (isPlaying && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    }
  };

  // Auto-read current question when it changes
  useEffect(() => {
    if (autoReadEnabled && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex].question;
      handlePlayQuestion(currentQuestion);
    }
  }, [currentQuestionIndex, autoReadEnabled]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsAdvancing(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAdvancing(false);
      }, 500);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitInterview = async () => {
    // Exit full-screen mode if active
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    // Calculate score (average rating from feedbacks, or set your own logic)
    try {
      // Fetch all user answers for this interview
      const userAnswersSnap = await getDocs(query(collection(db, "userAnswers"), where("mockIdRef", "==", interviewId)));
      const userAnswers = userAnswersSnap.docs.map(doc => doc.data());
      let score = 0;
      if (userAnswers.length > 0) {
        score = userAnswers.reduce((acc, ans) => acc + (ans.rating || 0), 0) / userAnswers.length;
        score = Math.round(score * 10) / 10; // round to 1 decimal
      }
      // Update interview status and score
      if (interviewId) {
        await updateDoc(doc(db, "interviews", interviewId), {
          status: 'attempted',
          score,
          updateAt: serverTimestamp(),
        });
      }
    } catch (e) {
      // fallback: still navigate
      console.error(e);
    }
    navigate(`/generate/feedback/${interviewId}`, { replace: true });
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div 
      data-fullscreen-interview
      className={cn(
        "w-full min-h-96 border rounded-md p-4",
        isFullScreen && "fixed inset-0 z-50 bg-white border-0 rounded-none p-8 overflow-auto"
      )}>
      {/* Question Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoReadEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoReadEnabled(!autoReadEnabled)}
          >
            {autoReadEnabled ? "Auto-read ON" : "Auto-read OFF"}
          </Button>
          
          {currentQuestionIndex === questions.length - 1 && (
            <Button
              onClick={handleSubmitInterview}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Interview
            </Button>
          )}
        </div>
      </div>

      {/* Current Question Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1}</h3>
        <p className="text-base text-left tracking-wide text-neutral-500 mb-4">
          {currentQuestion.question}
        </p>

        <div className="w-full flex items-center justify-end">
          <TooltipButton
            content={isPlaying ? "Stop" : "Read Question"}
            icon={
              isPlaying ? (
                <VolumeX className="min-w-5 min-h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="min-w-5 min-h-5 text-muted-foreground" />
              )
            }
            onClick={isPlaying ? handleStopReading : () => handlePlayQuestion(currentQuestion.question)}
          />
        </div>
      </div>

      {/* Answer Recording Section */}
      {isAdvancing ? (
        <div className="w-full flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Advancing to next question...</p>
          </div>
        </div>
      ) : (
        <RecordAnswer
          question={currentQuestion}
          isWebCam={isWebCam}
          setIsWebCam={setIsWebCam}
          onAnswerSaved={handleNextQuestion}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          onInterviewComplete={handleSubmitInterview}
        />
      )}

      {/* Question Progress */}
      <div className="mt-6">
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full",
                index === currentQuestionIndex
                  ? "bg-blue-500"
                  : index < currentQuestionIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
