import React, { useMemo } from 'react';
import { useAppStateContext } from '../App'; // Обратите внимание: импортируем только хук
import { useNavigate } from 'react-router-dom';
import './QuizScreen.css';

export const QuizScreen: React.FC = () => {
    // Вызываем хук БЕЗ аргументов
    const { state, handleQuizAnswer } = useAppStateContext();
    const navigate = useNavigate();

    const answeredCount = useMemo(() => 
        state.quizQuestions.filter(q => q.isAnswered).length, 
    [state.quizQuestions]);
    
    const progressWidth = (answeredCount / state.quizQuestions.length) * 100;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <div className="progress-info">Выполнено: {answeredCount} из {state.quizQuestions.length}</div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressWidth}%` }}></div>
                </div>
                <h1 className="quiz-title">Семейный Квиз 🧩</h1>
            </div>

            <div className="questions-list">
                {state.quizQuestions.map((q) => (
                    <div key={`q-${q.id}`} className={`quiz-card ${q.isAnswered ? (q.isCorrect ? 'correct' : 'wrong') : ''}`}>
                        <h3 className="question-text">{q.question}</h3>
                        
                        <div className="answers-grid">
                            {Object.entries(q.answers).map(([key, value]) => (
                                <button
                                    key={`${q.id}-${key}`}
                                    className={`answer-button ${q.userAnswer === key ? 'selected' : ''}`}
                                    // ПРАВИЛЬНЫЙ ОБРАБОТЧИК: обернут в анонимную функцию
                                    onClick={() => {
                                        if (!q.isAnswered) {
                                            handleQuizAnswer(q.id, key);
                                        }
                                    }}
                                    disabled={q.isAnswered}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        {q.isAnswered && (
                            <div className="result-feedback">
                                {q.isCorrect ? '✅ Правильно!' : `❌ Ошибка. Верно: ${q.answers[q.correctAnswer]}`}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {state.documentsUnlocked && (
                <div className="golden-card-overlay">
                    <div className="golden-card">
                        <div className="golden-content">
                            <h2>🎉 ПОБЕДА!</h2>
                            <p>Документы разблокированы!</p>
                            <button className="gold-action-button" onClick={() => navigate('/plan')}>
                                В План →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};