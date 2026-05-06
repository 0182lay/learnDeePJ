import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const QuizPlayer = ({ questions, onComplete, onClose }: QuizPlayerProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selectedAnswer;
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate score
      const correct = answers.reduce(
        (sum, a, i) => sum + (a === questions[i].correctAnswer ? 1 : 0),
        0
      ) + (selectedAnswer === q.correctAnswer ? 1 : 0);
      // Recount properly
      const finalAnswers = [...answers];
      finalAnswers[currentQ] = selectedAnswer;
      const finalScore = finalAnswers.reduce(
        (sum, a, i) => sum + (a === questions[i].correctAnswer ? 1 : 0),
        0
      );
      const percentage = Math.round((finalScore / questions.length) * 100);
      setFinished(true);
      onComplete(percentage);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers(new Array(questions.length).fill(null));
    setFinished(false);
  };

  if (finished) {
    const finalAnswers = [...answers];
    finalAnswers[currentQ] = selectedAnswer;
    const correct = finalAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center space-y-6 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${
            passed ? "bg-accent/20" : "bg-destructive/20"
          }`}
        >
          {passed ? (
            <Trophy className="h-10 w-10 text-accent" />
          ) : (
            <XCircle className="h-10 w-10 text-destructive" />
          )}
        </motion.div>
        <h2 className="font-heading text-2xl font-bold">
          {passed ? "ຍິນດີດ້ວຍ! ທ່ານຜ່ານແລ້ວ!" : "ຍັງບໍ່ຜ່ານ"}
        </h2>
        <div className="text-4xl font-heading font-bold text-secondary">{score}%</div>
        <p className="text-muted-foreground">
          ຕອບຖືກ {correct}/{questions.length} ຂໍ້
        </p>
        <div className="flex gap-3 justify-center">
          {!passed && (
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-1" /> ເຮັດໃໝ່
            </Button>
          )}
          <Button onClick={onClose}>
            {passed ? "ສືບຕໍ່ຮຽນ" : "ກັບຄືນ"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ຂໍ້ {currentQ + 1} / {questions.length}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <h3 className="font-heading font-semibold text-lg">{q.question}</h3>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let state = "";
            if (showResult) {
              if (i === q.correctAnswer) state = "correct";
              else if (i === selectedAnswer && i !== q.correctAnswer) state = "wrong";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  state === "correct"
                    ? "border-accent bg-accent/10"
                    : state === "wrong"
                    ? "border-destructive bg-destructive/10"
                    : selectedAnswer === i
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      state === "correct"
                        ? "bg-accent text-accent-foreground"
                        : state === "wrong"
                        ? "bg-destructive text-destructive-foreground"
                        : selectedAnswer === i
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {state === "correct" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : state === "wrong" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
            ຢືນຢັນຄຳຕອບ
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQ < questions.length - 1 ? (
              <>ຂໍ້ຕໍ່ໄປ <ArrowRight className="h-4 w-4 ml-1" /></>
            ) : (
              "ເບິ່ງຜົນ"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
