import { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

import type { AppState, QuizQuestion, RawQuizQuestion } from './types';
import { AppContext } from './context/AppContext';
import { useAudioUnlock } from './hooks/useAudioUnlock';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { DictionaryScreen } from './screens/DictionaryScreen.tsx';
import { BottomNav } from './components/BottomNav';
import { 
    loadAllQuizAnswersFromCloud, 
    applyCloudAnswersToQuestions,
    saveQuizAnswerToCloud,
    subscribeToQuestionAnswers
} from './services/quizService';

// Контекст и хук вынесены в `src/context/AppContext.tsx`

function App() {
    // Разблокируем звук при первом взаимодействии пользователя (для iOS)
    useAudioUnlock();

    const [appState, setAppState] = useState<AppState>((() => { 
        // Проверяем localStorage при инициализации
        const savedAuth = localStorage.getItem('thailand-trip-auth');
        let currentFamily = -1;
        let isAuthenticated = false;
        let userPin: string | undefined;

        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                currentFamily = authData.familyIndex;
                userPin = authData.pin;
                isAuthenticated = true;
            } catch (e) {
                console.error('Ошибка при чтении данных авторизации', e);
            }
        }

        return {
            currentFamily,
            currentQuizIndex: 0,
            documentsUnlocked: false,
            currentScreen: 'home',
            isAuthenticated,
            userPin,
            familyMembers: appStateData.familyMembers,
            places: appStateData.places,
            itinerary: appStateData.itinerary,
            puzzlePieceOrder: appStateData.puzzlePieceOrder,
            puzzleImageUrl: appStateData.puzzleImageUrl,
            quizQuestions: (appStateData.quizQuestions as RawQuizQuestion[]).map((q, i) => ({
                id: q.id ?? i + 1,
                day: q.day,
                question: q.question,
                answer: q.answer,
                answers: q.answers || {},
                correctAnswer: q.correctAnswer ?? Object.keys(q.answers || {})[0] ?? '',
                placeName: q.placeName,
                answersByUser: {},
                isCorrectByUser: {},
                pointsByUser: {},
                attemptsByUser: {}
            })) as QuizQuestion[], 
        };
    })());

    // Загружаем облачные ответы при инициализации
    useEffect(() => {
        if (appState.isAuthenticated && appState.currentFamily !== -1) {
            loadAllQuizAnswersFromCloud()
                .then(cloudAnswers => {
                    setAppState(prevState => ({
                        ...prevState,
                        quizQuestions: applyCloudAnswersToQuestions(
                            prevState.quizQuestions,
                            cloudAnswers
                        )
                    }));
                })
                .catch(error => {
                    console.error('Ошибка при загрузке облачных ответов:', error);
                });
        }
    }, [appState.isAuthenticated, appState.currentFamily]);

    // Подписываемся на real-time обновления текущего вопроса
    useEffect(() => {
        if (!appState.isAuthenticated || appState.currentFamily === -1) {
            return;
        }

        const currentQuestion = appState.quizQuestions[appState.currentQuizIndex];
        if (!currentQuestion) {
            return;
        }

        const unsubscribe = subscribeToQuestionAnswers(currentQuestion.id, (cloudAnswers) => {
            setAppState(prevState => ({
                ...prevState,
                quizQuestions: applyCloudAnswersToQuestions(
                    prevState.quizQuestions,
                    cloudAnswers
                )
            }));
        });

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.isAuthenticated, appState.currentFamily, appState.currentQuizIndex]);
  
    const handleQuizAnswer = useCallback(async (quizId: number, answerKey: string) => {
        let calculatedPoints = 0;
        let isCorrect = false;

        setAppState(prevState => {
            const currentFamilyIndex = prevState.currentFamily;
            if (currentFamilyIndex === -1) return prevState;

            const updatedQuestions = prevState.quizQuestions.map(q => {
                if (q.id === quizId) {
                    isCorrect = answerKey === q.correctAnswer;
                    const currentAttempts = (q.attemptsByUser[currentFamilyIndex] || 0) + 1;
                    
                    if (isCorrect) {
                        // 1-й раз = 3, 2-й = 2, 3-й = 1, 4-й+ = 0
                        calculatedPoints = Math.max(0, 4 - currentAttempts);
                    }

                    return {
                        ...q,
                        attemptsByUser: {
                            ...q.attemptsByUser,
                            [currentFamilyIndex]: currentAttempts
                        },
                        answersByUser: {
                            ...q.answersByUser,
                            [currentFamilyIndex]: answerKey
                        },
                        isCorrectByUser: {
                            ...q.isCorrectByUser,
                            [currentFamilyIndex]: isCorrect
                        },
                        pointsByUser: {
                            ...q.pointsByUser,
                            [currentFamilyIndex]: isCorrect ? calculatedPoints : (q.pointsByUser[currentFamilyIndex] || 0)
                        }
                    };
                }
                return q;
            });
            
            return { ...prevState, quizQuestions: updatedQuestions };
        });

        // Сохраняем ответ в облако (только если ответили правильно или это окончательный выбор)
        // Для простоты сохраняем каждый ответ, но очки фиксируем при правильном
        const currentState = appState; // Note: this might be stale, but we'll use the values we just calculated
        const currentFamilyMember = currentState.familyMembers[currentState.currentFamily];
        
        try {
            await saveQuizAnswerToCloud(
                quizId, 
                currentState.currentFamily, 
                currentFamilyMember.name,
                answerKey, 
                isCorrect,
                calculatedPoints
            );
        } catch (error) {
            console.error('Ошибка при сохранении ответа в облако:', error);
        }
    }, [appState]);

    const updateAppState = useCallback((updates: Partial<AppState>) => {
        setAppState(prevState => ({ ...prevState, ...updates }));
    }, []);

    const contextValue = useMemo(() => ({ 
            state: appState, 
            setAppState, 
            updateAppState,
            handleQuizAnswer 
    }), [appState, updateAppState, handleQuizAnswer]);

    // Если пользователь не авторизован, показываем экран входа
    if (!appState.isAuthenticated) {
        return (
            <AppContext.Provider value={contextValue}>
                <LoginScreen />
            </AppContext.Provider>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <main className="content-area" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/plan" element={<PlanScreen />} />
                        <Route path="/quiz" element={<QuizScreen />} />
                        <Route path="/diary" element={<DiaryScreen />} />
                        <Route path="/phrases" element={<PhrasebookScreen />} />
                        <Route path="/dictionary" element={<DictionaryScreen />} />
                        <Route path="*" element={<div>404</div>} />
                    </Routes>
                </main>
                <BottomNav />
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;