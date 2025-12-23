import React, { useMemo } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './QuizScreen.css';
import type { QuizQuestion } from '../types';

export const QuizScreen: React.FC = () => {
    const { state, handleQuizAnswer } = useAppStateContext();
    const navigate = useNavigate();
    const currentUserIndex = state.currentFamily;

    // Логика пазла
    const puzzleImage = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"; 
    
    // Проверяем, решен ли вопрос ВСЕМИ членами семьи
    const isQuestionFullySolved = (q: QuizQuestion) => {
        const totalMembers = state.familyMembers.length;
        const answersCount = Object.keys(q.isCorrectByUser || {}).length;
        const allCorrect = Object.values(q.isCorrectByUser || {}).every(v => v === true);
        return answersCount === totalMembers && allCorrect;
    };

    const puzzlePieces = useMemo(() => {
        return state.quizQuestions.map(q => isQuestionFullySolved(q));
    }, [state.quizQuestions, state.familyMembers]);

    const isPuzzleComplete = puzzlePieces.every(p => p === true);
    const solvedCount = puzzlePieces.filter(p => p).length;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h1 className="quiz-title">Тайский Пазл 🧩</h1>
                <p className="quiz-subtitle">Отвечайте всей семьей, чтобы открыть картину!</p>
            </div>

            {/* Блок Пазла */}
            <div className="puzzle-wrapper">
                <div className="puzzle-board" style={{ backgroundImage: `url(${puzzleImage})` }}>
                    {puzzlePieces.map((isSolved, index) => (
                        <div 
                            key={index} 
                            className={`puzzle-piece ${isSolved ? 'solved' : 'locked'}`}
                        >
                            {!isSolved && <span className="piece-number">{index + 1}</span>}
                        </div>
                    ))}
                </div>
                <div className="puzzle-stats">
                    Открыто {solvedCount} из {state.quizQuestions.length} фрагментов
                </div>
            </div>

            {isPuzzleComplete && (
                <div className="victory-banner">
                    <h2>🎉 Пазл собран!</h2>
                    <p>Вам доступен секретный фильм о путешествии!</p>
                    <button className="watch-video-btn" onClick={() => navigate('/diary')}>
                        🎬 Смотреть в Дневнике
                    </button>
                </div>
            )}

            <div className="questions-list">
                {state.quizQuestions.map((q) => {
                    const currentUserAnswered = q.answersByUser?.[currentUserIndex] !== undefined;
                    const isFullySolved = isQuestionFullySolved(q);

                    return (
                        <div key={`q-${q.id}`} className={`quiz-card ${isFullySolved ? 'fully-solved' : ''}`}>
                            <div className="card-header">
                                <span className="day-badge">День {q.day}</span>
                                {isFullySolved && <span className="solved-badge">✨ Разгадано</span>}
                            </div>
                            
                            <h3 className="question-text">{q.question}</h3>
                            
                            {/* Статус ответов семьи */}
                            <div className="family-status-row">
                                {state.familyMembers.map((member, idx) => {
                                    const hasAnswered = q.answersByUser?.[idx] !== undefined;
                                    const isCorrect = q.isCorrectByUser?.[idx];
                                    
                                    let statusClass = 'pending';
                                    if (hasAnswered) statusClass = isCorrect ? 'correct' : 'wrong';

                                    return (
                                        <div key={idx} className={`member-status ${statusClass}`} title={member.name}>
                                            <span className="member-emoji">{member.emoji}</span>
                                            {hasAnswered && (
                                                <span className="status-icon">
                                                    {isCorrect ? '✅' : '❌'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="answers-grid">
                                {Object.entries(q.answers).map(([key, value]) => {
                                    const isSelected = q.answersByUser?.[currentUserIndex] === key;
                                    const isCorrectAnswer = key === q.correctAnswer;
                                    
                                    let btnClass = 'answer-button';
                                    if (currentUserAnswered) {
                                        if (isSelected) btnClass += isCorrectAnswer ? ' correct-choice' : ' wrong-choice';
                                        if (isCorrectAnswer && !isSelected) btnClass += ' missed-correct';
                                    } else if (isSelected) {
                                        btnClass += ' selected';
                                    }

                                    return (
                                        <button
                                            key={`${q.id}-${key}`}
                                            className={btnClass}
                                            onClick={() => {
                                                if (!currentUserAnswered) {
                                                    handleQuizAnswer(q.id, key);
                                                }
                                            }}
                                            disabled={currentUserAnswered}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {currentUserAnswered && !q.isCorrectByUser?.[currentUserIndex] && (
                                <div className="feedback-msg">
                                    Попробуйте обсудить с семьей правильный ответ!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};