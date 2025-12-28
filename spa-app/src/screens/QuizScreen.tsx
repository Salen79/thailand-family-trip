import React, { useMemo, useCallback, useState } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './QuizScreen.css';
import type { QuizQuestion } from '../types';

export const QuizScreen: React.FC = () => {
    const { state, handleQuizAnswer, updateAppState } = useAppStateContext();
    const navigate = useNavigate();
    const currentUserIndex = state.currentFamily;
    const [pieceOrder] = useState<number[]>(() => {
        const totalPieces = state.quizQuestions.length;
        if (totalPieces === 0) return [];
        
        const indices = Array.from({ length: totalPieces }, (_, i) => i);
        // Перетасовываем (Fisher-Yates shuffle)
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    });

    // Логика пазла
    const puzzleImage = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800";
    
    // Параметры сетки паззла
    const GRID_COLS = 5;
    const GRID_ROWS = 3;
    
    // Функция для вычисления background-position для каждого кусочка
    const getBackgroundPositionForPiece = (index: number) => {
        const col = index % GRID_COLS;
        const row = Math.floor(index / GRID_COLS);
        
        // Вычисляем процент смещения
        const bgPositionX = (col / GRID_COLS) * 100;
        const bgPositionY = (row / GRID_ROWS) * 100;
        
        return `${bgPositionX}% ${bgPositionY}%`;
    };
    
    // Helper for render - обернут в useCallback
    const isQuestionFullySolved = useCallback((q: QuizQuestion) => {
        const totalMembers = state.familyMembers.length;
        const answersCount = Object.keys(q.isCorrectByUser || {}).length;
        const allCorrect = Object.values(q.isCorrectByUser || {}).every(v => v === true);
        return answersCount === totalMembers && allCorrect;
    }, [state.familyMembers.length]);

    const puzzlePieces = useMemo(() => {
        return state.quizQuestions.map(q => isQuestionFullySolved(q));
    }, [state.quizQuestions, isQuestionFullySolved]);

    const isPuzzleComplete = puzzlePieces.every(p => p === true);
    const solvedCount = puzzlePieces.filter(p => p).length;

    // Маппим индексы на случайный порядок для визуального отображения
    const visualPieceOrder = pieceOrder.length > 0 
        ? pieceOrder.map(originalIdx => puzzlePieces[originalIdx])
        : puzzlePieces;

    // Получаем только текущий вопрос
    const currentQuestionIndex = state.currentQuizIndex || 0;
    const currentQuestion = state.quizQuestions[currentQuestionIndex];
    const hasNextQuestion = currentQuestionIndex < state.quizQuestions.length - 1;

    // Проверяем, ответили ли все члены семьи на текущий вопрос
    const allMembersAnswered = currentQuestion && 
        state.familyMembers.every((_, idx) => currentQuestion.answersByUser?.[idx] !== undefined);

    // Обработчик для переход к следующему вопросу
    const handleNextQuestion = () => {
        if (hasNextQuestion && allMembersAnswered) {
            updateAppState({ currentQuizIndex: currentQuestionIndex + 1 });
        }
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h1 className="quiz-title">Тайский Пазл 🧩</h1>
                <p className="quiz-subtitle">Отвечайте всей семьей, чтобы открыть картину!</p>
            </div>

            {/* Блок Пазла */}
            <div className="puzzle-wrapper">
                <div className="puzzle-board">
                    {visualPieceOrder.map((isSolved, visualIndex) => {
                        // Находим оригинальный индекс для текста и позиции
                        const originalIndex = pieceOrder.length > 0 
                            ? pieceOrder[visualIndex] 
                            : visualIndex;
                        
                        // Вычисляем background-position для этого кусочка
                        const bgPosition = getBackgroundPositionForPiece(originalIndex);
                        
                        return (
                            <div 
                                key={`piece-${originalIndex}`}
                                className={`puzzle-piece ${isSolved ? 'solved' : 'locked'}`}
                                data-index={originalIndex}
                                style={isSolved ? { 
                                    backgroundImage: `url(${puzzleImage})`,
                                    backgroundPosition: bgPosition,
                                    backgroundSize: `${GRID_COLS * 100}% ${GRID_ROWS * 100}%`
                                } : {}}
                            >
                                {!isSolved && <span className="piece-number">{originalIndex + 1}</span>}
                            </div>
                        );
                    })}
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

            {/* Отображаем только текущий вопрос */}
            <div className="questions-list">
                {currentQuestion && (
                    <div key={`q-${currentQuestion.id}`} className={`quiz-card ${isQuestionFullySolved(currentQuestion) ? 'fully-solved' : ''}`}>
                        {/* Прогресс вопросов */}
                        <div className="quiz-progress">
                            <span className="progress-text">Вопрос {currentQuestionIndex + 1} из {state.quizQuestions.length}</span>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${((currentQuestionIndex + 1) / state.quizQuestions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="card-header">
                            <span className="day-badge">День {currentQuestion.day}</span>
                            {isQuestionFullySolved(currentQuestion) && <span className="solved-badge">✨ Разгадано</span>}
                            {currentQuestion.placeName && (
                                <span className="place-badge">{currentQuestion.placeName}</span>
                            )}
                        </div>
                        
                        <h3 className="question-text">{currentQuestion.question}</h3>
                        
                        {/* Статус ответов семьи */}
                        <div className="family-status-row">
                            {state.familyMembers.map((member, idx) => {
                                const hasAnswered = currentQuestion.answersByUser?.[idx] !== undefined;
                                const isCorrect = currentQuestion.isCorrectByUser?.[idx];
                                
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
                            {Object.entries(currentQuestion.answers).map(([key, value]) => {
                                const isSelected = currentQuestion.answersByUser?.[currentUserIndex] === key;
                                const isCorrectAnswer = key === currentQuestion.correctAnswer;
                                
                                let btnClass = 'answer-button';
                                if (currentQuestion.answersByUser?.[currentUserIndex] !== undefined) {
                                    if (isSelected) btnClass += isCorrectAnswer ? ' correct-choice' : ' wrong-choice';
                                    if (isCorrectAnswer && !isSelected) btnClass += ' missed-correct';
                                } else if (isSelected) {
                                    btnClass += ' selected';
                                }

                                return (
                                    <button
                                        key={`${currentQuestion.id}-${key}`}
                                        className={btnClass}
                                        onClick={() => {
                                            if (currentQuestion.answersByUser?.[currentUserIndex] === undefined) {
                                                handleQuizAnswer(currentQuestion.id, key);
                                            }
                                        }}
                                        disabled={currentQuestion.answersByUser?.[currentUserIndex] !== undefined}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {currentQuestion.answersByUser?.[currentUserIndex] !== undefined && !currentQuestion.isCorrectByUser?.[currentUserIndex] && (
                            <div className="feedback-msg">
                                Попробуйте обсудить с семьей правильный ответ!
                            </div>
                        )}

                        {/* Кнопка для перехода к следующему вопросу */}
                        {allMembersAnswered && hasNextQuestion && (
                            <button className="next-question-btn" onClick={handleNextQuestion}>
                                Следующий вопрос →
                            </button>
                        )}

                        {currentQuestionIndex === state.quizQuestions.length - 1 && allMembersAnswered && (
                            <div className="quiz-complete-msg">
                                ✨ Все вопросы отвечены! Смотрите пазл выше.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};