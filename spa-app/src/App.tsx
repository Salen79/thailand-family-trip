import { useState, createContext, useContext, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react'; 
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

import type { AppState, QuizQuestion } from './types'; 
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { BottomNav } from './components/BottomNav';

interface AppContextType {
    state: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>;
    handleQuizAnswer: (quizId: number, answerKey: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Хук без аргументов
export const useAppStateContext = () => { 
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppStateContext must be used within a Provider');
    return ctx; 
};

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
    console.log("Клик дошел до App.tsx!", quizId, answerKey);
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
        return { ...prevState, quizQuestions: updatedQuestions, documentsUnlocked: allCorrect };
    });
  };

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
                        <Route path="/chat" element={<div>Чат</div>} />
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