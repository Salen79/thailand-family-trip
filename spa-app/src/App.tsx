import { useState, createContext, useContext, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

import type { AppState, QuizQuestion } from './types'; 
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { BottomNav } from './components/BottomNav';

// --- КОНТЕКСТ ---
interface AppContextType {
    state: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>;
    handleQuizAnswer: (quizId: number, answerKey: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Упрощенный хук: теперь не нужно передавать AppContext как аргумент
export const useAppStateContext = () => { 
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppStateContext must be used within a Provider');
    return ctx; 
};

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ ---
const AIChatScreen = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>AI-Ассистент 🤖</h2>
        <Link to="/">← На главную</Link>
    </div>
);

function App() {
  const [appState, setAppState] = useState<AppState>(({
    currentFamily: 0,
    documentsUnlocked: false,
    currentScreen: 'home',
    familyMembers: appStateData.familyMembers,
    places: appStateData.places,
    quizQuestions: (appStateData.quizQuestions as any[]).map((q: any) => ({
        id: q.id,
        day: q.day,
        question: q.question,
        answer: q.answer,
        answers: q.answers || {},
        correctAnswer: q.correctAnswer,
    })) as QuizQuestion[], 
  }));
  
  const handleQuizAnswer = (quizId: number, answerKey: string) => {
    console.log(`[QUIZ] Обработка: вопрос ${quizId}, ответ ${answerKey}`);
    
    setAppState(prevState => {
        const updatedQuestions = prevState.quizQuestions.map(q => {
            if (q.id === quizId) {
                return {
                    ...q,
                    userAnswer: answerKey, 
                    isAnswered: true,      
                    isCorrect: answerKey === q.correctAnswer, 
                };
            }
            return q;
        });

        const allCorrect = updatedQuestions.every(q => q.isCorrect === true);
        
        return {
            ...prevState,
            quizQuestions: updatedQuestions,
            documentsUnlocked: allCorrect,
        };
    });
  };

  // Используем useMemo правильно, чтобы не пересоздавать объект зря, 
  // но следим за изменением appState
  const contextValue = useMemo(() => ({ 
      state: appState, 
      setAppState, 
      handleQuizAnswer 
  }), [appState]);

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
                        <Route path="/chat" element={<AIChatScreen />} />
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