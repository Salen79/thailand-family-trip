import React from 'react';
import { AppContext, useAppStateContext } from '../App';

export const QuizScreen: React.FC = () => {
    // Достаем состояние и функцию обработки ответа из нашего контекста
    const { state, handleQuizAnswer } = useAppStateContext(AppContext);

    return (
        <div className="quiz-screen" style={{ padding: '20px', color: '#fff' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Семейный Квиз 🧩</h1>
            
            {state.quizQuestions.map((q) => (
                <div key={q.id} className="quiz-card" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '15px',
                    marginBottom: '20px',
                    border: q.isAnswered ? (q.isCorrect ? '2px solid #4CAF50' : '2px solid #f44336') : '1px solid #ccc'
                }}>
                    <h3>Вопрос {q.id}: {q.question}</h3>
                    
                    <div className="answers-grid" style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
                        {Object.entries(q.answers).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => !q.isAnswered && handleQuizAnswer(q.id, key)}
                                disabled={q.isAnswered}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: q.isAnswered ? 'default' : 'pointer',
                                    backgroundColor: q.userAnswer === key 
                                        ? (q.isCorrect ? '#4CAF50' : '#f44336') 
                                        : '#fff',
                                    color: q.userAnswer === key ? '#fff' : '#333',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {value}
                            </button>
                        ))}
                    </div>

                    {q.isAnswered && (
                        <p style={{ marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                            {q.isCorrect ? '✅ Правильно!' : `❌ Ошибка. Правильный ответ: ${q.answers[q.correctAnswer]}`}
                        </p>
                    )}
                </div>
            ))}

            {state.documentsUnlocked && (
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    🎉 УРА! Все документы разблокированы! Теперь проверьте раздел "План".
                </div>
            )}
        </div>
    );
};