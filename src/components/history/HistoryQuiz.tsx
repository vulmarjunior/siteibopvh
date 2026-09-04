import React, { useState } from 'react';
import { HISTORY_QUIZ_QUESTIONS } from '../../data/baptistHistoryData';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';

export const HistoryQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const question = HISTORY_QUIZ_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIndex === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOptionIndex === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < HISTORY_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <section id="quiz-historico" className="py-16 bg-stone-900 border-t border-stone-800 text-stone-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Desafio Lúdico e Instrutivo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white font-bold tracking-tight">
            Desafio do Sentinela da História
          </h2>
          <p className="text-stone-400 text-sm max-w-xl mx-auto mt-2">
            Teste os seus conhecimentos sobre a jornada de 1609 até a fundação da IBO em 1959.
          </p>
        </div>

        <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {!isQuizCompleted ? (
            <div>
              {/* Progresso do Quiz */}
              <div className="flex items-center justify-between text-xs text-stone-400 mb-6">
                <span className="font-semibold uppercase tracking-wider text-amber-400">
                  Pergunta {currentQuestionIndex + 1} de {HISTORY_QUIZ_QUESTIONS.length}
                </span>
                <span className="font-mono bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
                  Acertos: {score}
                </span>
              </div>

              {/* Pergunta Atual */}
              <h3 className="text-lg md:text-xl font-serif font-bold text-stone-100 mb-6 leading-relaxed">
                {question.question}
              </h3>

              {/* Opcoes de Resposta */}
              <div className="space-y-3 mb-6">
                {question.options.map((option, idx) => {
                  let buttonStyle = 'bg-stone-900/80 hover:bg-stone-800/90 border-stone-800 text-stone-300';

                  if (selectedOptionIndex === idx) {
                    buttonStyle = 'bg-amber-950/40 border-amber-500 text-amber-200';
                  }

                  if (isAnswerSubmitted) {
                    if (idx === question.correctIndex) {
                      buttonStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (selectedOptionIndex === idx) {
                      buttonStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      buttonStyle = 'bg-stone-900/40 border-stone-900 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${buttonStyle}`}
                    >
                      <span className="flex-1">{option}</span>
                      {isAnswerSubmitted && idx === question.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedOptionIndex === idx && idx !== question.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explicacao Pedagogica apos confirmacao */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-300 mb-6 animate-fade-in leading-relaxed">
                  <strong className="text-amber-400 block mb-1">Nota Histórica:</strong>
                  {question.explanation}
                </div>
              )}

              {/* Botao de Avanco */}
              <div className="flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOptionIndex === null}
                    className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold transition-colors shadow-md"
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                  >
                    <span>{currentQuestionIndex < HISTORY_QUIZ_QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Tela de Resultado Final */
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                Desafio Concluído!
              </h3>

              <p className="text-stone-300 text-sm mb-4">
                Você acertou <strong className="text-amber-400 text-lg font-mono">{score}</strong> de <strong className="font-mono">{HISTORY_QUIZ_QUESTIONS.length}</strong> perguntas.
              </p>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 mb-6">
                {score === HISTORY_QUIZ_QUESTIONS.length && (
                  <p className="text-amber-300 font-semibold">
                    🏆 Parabéns! Você é um verdadeiro Sentinela da Memória Batista! Conhece com fidelidade o fio da história desde 1609 até a nossa IBO.
                  </p>
                )}
                {score < HISTORY_QUIZ_QUESTIONS.length && score >= 2 && (
                  <p className="text-amber-200/90 font-medium">
                    👏 Muito bom! Você já compreende os marcos centrais da nossa herança. Continue explorando a linha do tempo e o Baú do Historiador!
                  </p>
                )}
                {score < 2 && (
                  <p className="text-stone-400">
                    📖 Vale a pena reler os relatos da linha do tempo para mergulhar ainda mais na coragem e fé dos nossos pioneiros.
                  </p>
                )}
              </div>

              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Refazer Desafio
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
