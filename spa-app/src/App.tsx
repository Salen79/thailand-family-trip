import { useState, createContext, useContext } from 'react';
import type { Dispatch, SetStateAction, Context } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// Импорты типов и компонентов
import type { AppState, QuizQuestion } from './types'; 
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { BottomNav } from './components/BottomNav';

// 1. ОПРЕДЕЛЕНИЕ КОНТЕКСТА
interface AppContextType {
    state: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>;
    handleQuizAnswer: (quizId: number, answerKey: string) => void;
}

const initialAppState: AppState = {
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
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStateContext = (context: Context<AppContextType | undefined>): AppContextType => { 
    const ctx = useContext(context);
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    return ctx as AppContextType; 
};

// Заглушка чата
const AIChatScreen = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>AI-Ассистент 🤖</h2>
        <Link to="/">← На главную</Link>
    </div>
);

function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  
  const handleQuizAnswer = (quizId: number, answerKey: string) => {
    console.log(`App.tsx: Получен ответ для вопроса ${quizId}: ${answerKey}`);
    setAppState(prevState => {
        const updatedQuizQuestions = prevState.quizQuestions.map(q => {
            if (q.id === quizId) {
                const isCorrect = answerKey === q.correctAnswer;
                return { ...q, userAnswer: answerKey, isAnswered: true, isCorrect };
            }
            return q;
        });
        const allCorrect = updatedQuizQuestions.every(q => q.isCorrect);
        return { ...prevState, quizQuestions: updatedQuizQuestions, documentsUnlocked: allCorrect };
    });
  };

  // Передаем объект напрямую без useMemo для исключения блокировок
  const contextValue = { 
      state: appState, 
      setAppState, 
      handleQuizAnswer 
  };

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            {/* Используем Flex-контейнер на весь экран */}
            <div className="app-wrapper" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100vh', 
                width: '100vw',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                {/* Область контента занимает всё свободное место */}
                <main className="content-area" style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    WebkitOverflowScrolling: 'touch',
                    position: 'relative',
                    zIndex: 1
                }}>
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

                {/* Навигация жестко прижата к низу и не перекрывает контент */}
                <footer style={{ flexShrink: 0, zIndex: 10 }}>
                    <BottomNav />
                </footer>
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;