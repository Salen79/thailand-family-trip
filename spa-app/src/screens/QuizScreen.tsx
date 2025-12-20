import React, { useMemo, useEffect } from 'react';
import { AppContext, useAppStateContext } from '../App';
import { useNavigate } from 'react-router-dom';
import './QuizScreen.css';

export const QuizScreen: React.FC = () => {
    const { state, handleQuizAnswer } = useAppStateContext(AppContext);
    const navigate = useNavigate();

    // Проверка загрузки данных в консоли браузера
    useEffect(() => {
        console.log("QuizScreen: Данные квиза загружены", state.quizQuestions);
    }, [state.quizQuestions]);

    const answeredCount = useMemo(() => 
        state.quizQuestions.filter(q => q.isAnswered).length, 
    [state.quizQuestions]);
    
    const progressWidth = (answeredCount / state.quizQuestions.length) * 100;

    return (
        <div className="quiz-container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="quiz-header">
                <div className="progress-info">
                    Прогресс: {answeredCount} из {state.quizQuestions.length}
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressWidth}%` }}></div>
                </div>
                <h1 className="quiz-title">Семейный Квиз 🧩</h1>
            </div>

            <div className="questions-list">
                {state.quizQuestions.map((q) => (
                    <div key={q.id} className={`quiz-card ${q.isAnswered ? (q.isCorrect ? 'correct' : 'wrong') : ''}`}>
                        <h3 className="question-text">{q.question}</h3>
                        
                        <div className="answers-grid" style={{ pointerEvents: 'auto' }}>
                            {Object.entries(q.answers).map(([key, value]) => (
                                <button
                                    key={key}
                                    className={`answer-button ${q.userAnswer === key ? 'selected' : ''}`}
                                    // Используем onPointerDown для мгновенного отклика на iPhone
                                    onPointerDown={() => {
                                        if (!q.isAnswered) {
                                            console.log("Касание (PointerDown):", value);
                                            handleQuizAnswer(q.id, key);
                                        }
                                    }}
                                    // Дублируем кликом для десктопа
                                    onClick={() => {
                                        if (!q.isAnswered) {
                                            console.log("Клик (Click):", value);
                                            handleQuizAnswer(q.id, key);
                                        }
                                    }}
                                    disabled={q.isAnswered}
                                    style={{ 
                                        cursor: 'pointer', 
                                        pointerEvents: 'auto', 
                                        touchAction: 'manipulation',
                                        zIndex: 20
                                    }}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        {q.isAnswered && (
                            <div className="result-feedback">
                                {q.isCorrect ? '✅ Супер!' : `❌ Ошибка. Правильно: ${q.answers[q.correctAnswer]}`}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {state.documentsUnlocked && (
                <div className="golden-card-overlay">
                    <div className="golden-card">
                        <div className="golden-content">
                            <h2>🎉 ПУТЕШЕСТВИЕ НАЧИНАЕТСЯ!</h2>
                            <p>Вы успешно прошли проверку. Все документы доступны в плане!</p>
                            <button 
                                className="gold-action-button" 
                                onClick={() => navigate('/plan')}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                            >
                                Открыть План →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};