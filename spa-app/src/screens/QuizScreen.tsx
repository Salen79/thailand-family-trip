import React, { useMemo, useEffect } from 'react';
import { AppContext, useAppStateContext } from '../App';
import { useNavigate } from 'react-router-dom';
import './QuizScreen.css';

export const QuizScreen: React.FC = () => {
    const context = useAppStateContext(AppContext);
    const { state, handleQuizAnswer } = context;
    const navigate = useNavigate();

    // Проверка связи в консоли при загрузке экрана
    useEffect(() => {
        console.log("QuizScreen загружен. Контекст получен:", !!handleQuizAnswer);
    }, [handleQuizAnswer]);

    // Расчет прогресса для шкалы
    const answeredCount = useMemo(() => 
        state.quizQuestions.filter(q => q.isAnswered).length, 
    [state.quizQuestions]);
    
    const progressWidth = (answeredCount / state.quizQuestions.length) * 100;

    return (
        <div className="quiz-container">
            {/* Header с прогресс-баром */}
            <div className="quiz-header">
                <div className="progress-info">
                    <span>Выполнено: {answeredCount} из {state.quizQuestions.length}</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressWidth}%` }}></div>
                </div>
                <h1 className="quiz-title">Семейный Квиз 🧩</h1>
            </div>

            <div className="questions-list">
                {state.quizQuestions.map((q) => (
                    <div key={q.id} className={`quiz-card ${q.isAnswered ? (q.isCorrect ? 'correct' : 'wrong') : ''}`}>
                        <h3 className="question-text">Вопрос {q.id}: {q.question}</h3>
                        
                        <div className="answers-grid">
                            {Object.entries(q.answers).map(([key, value]) => (
                                <button
                                    key={key}
                                    className={`answer-button ${q.userAnswer === key ? 'selected' : ''}`}
                                    onClick={() => {
                                        console.log(`Клик по вопросу ${q.id}, ответ: ${key}`);
                                        handleQuizAnswer(q.id, key);
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

            {/* Золотая карточка награды */}
            {state.documentsUnlocked && (
                <div className="golden-card-overlay">
                    <div className="golden-card">
                        <div className="golden-content">
                            <h2>🎉 УРА!</h2>
                            <p>Вы подготовились к поездке. Документы разблокированы!</p>
                            <button className="gold-action-button" onClick={() => navigate('/plan')}>
                                Перейти в План →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};