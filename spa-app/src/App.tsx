import { useState, useMemo } from 'react';
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
            quizQuestions: (appStateData.quizQuestions as RawQuizQuestion[]).map((q, i) => ({
                id: q.id ?? i + 1,
                day: q.day,
                question: q.question,
                answer: q.answer,
                answers: q.answers || {},
                correctAnswer: q.correctAnswer ?? Object.keys(q.answers || {})[0] ?? '',
                placeName: q.placeName,
                answersByUser: {},
                isCorrectByUser: {}
            })) as QuizQuestion[], 
        };
    })());
  
    const handleQuizAnswer = (quizId: number, answerKey: string) => {
        setAppState(prevState => {
            const currentFamilyIndex = prevState.currentFamily;
            if (currentFamilyIndex === -1) return prevState;

            const updatedQuestions = prevState.quizQuestions.map(q => {
                if (q.id === quizId) {
                    const isCorrect = answerKey === q.correctAnswer;
                    return {
                        ...q,
                        answersByUser: {
                            ...q.answersByUser,
                            [currentFamilyIndex]: answerKey
                        },
                        isCorrectByUser: {
                            ...q.isCorrectByUser,
                            [currentFamilyIndex]: isCorrect
                        }
                    };
                }
                return q;
            });
            
            return { ...prevState, quizQuestions: updatedQuestions };
        });
    };

    const updateAppState = (updates: Partial<AppState>) => {
        setAppState(prevState => ({ ...prevState, ...updates }));
    };

    const contextValue = useMemo(() => ({ 
            state: appState, 
            setAppState, 
            updateAppState,
            handleQuizAnswer 
    }), [appState]);

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