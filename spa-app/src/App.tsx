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
    subscribeToAllQuizAnswers
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

    // Загружаем облачные ответы при инициализации и подписываемся на ВСЕ обновления
    useEffect(() => {
        if (!appState.isAuthenticated || appState.currentFamily === -1) {
            return;
        }

        // 1. Первоначальная загрузка
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

        // 2. Подписка на изменения ВСЕХ ответов (чтобы таблица лидеров обновлялась сразу)
        const unsubscribe = subscribeToAllQuizAnswers((cloudAnswers) => {
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
    }, [appState.isAuthenticated, appState.currentFamily]);

    const handleQuizAnswer = useCallback(async (quizId: number, answerKey: string) => {
        setAppState(prevState => {
            const currentFamilyIndex = prevState.currentFamily;
            if (currentFamilyIndex === -1) return prevState;

            const questionIndex = prevState.quizQuestions.findIndex(q => q.id === quizId);
            if (questionIndex === -1) return prevState;

            const q = prevState.quizQuestions[questionIndex];
            const isCorrect = answerKey === q.correctAnswer;
            const currentAttempts = (q.attemptsByUser[currentFamilyIndex] || 0) + 1;
            
            let calculatedPoints = 0;
            if (isCorrect) {
                // 1-й раз = 3, 2-й = 2, 3-й = 1, 4-й+ = 0
                calculatedPoints = Math.max(0, 4 - currentAttempts);
            }

            const updatedQuestions = [...prevState.quizQuestions];
            updatedQuestions[questionIndex] = {
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

            // Сохраняем в облако, используя актуальные данные из текущего обновления
            const currentFamilyMember = prevState.familyMembers[currentFamilyIndex];
            saveQuizAnswerToCloud(
                quizId, 
                currentFamilyIndex, 
                currentFamilyMember.name,
                answerKey, 
                isCorrect,
                isCorrect ? calculatedPoints : (q.pointsByUser[currentFamilyIndex] || 0)
            ).catch(error => {
                console.error('Ошибка при сохранении ответа в облако:', error);
            });
            
            return { ...prevState, quizQuestions: updatedQuestions };
        });
    }, []); // Убираем зависимость от appState, так как используем функциональное обновление

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