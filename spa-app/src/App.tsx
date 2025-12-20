import { useState, createContext, useContext } from 'react';
import type { Dispatch, SetStateAction, Context } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// 1. Импортируем типы из нового файла types.ts
import type { AppState, QuizQuestion } from './types'; 

// 2. Активируем импорты всех компонентов
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { BottomNav } from './components/BottomNav';


// -----------------------------------------------------
// 1. ОПРЕДЕЛЕНИЕ КОНТЕКСТА (ИСПОЛЬЗУЕМ ИМПОРТИРОВАННЫЕ ТИПЫ)
// -----------------------------------------------------

// Обновленный контракт контекста
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
    
    // МЫ ДОБАВЛЯЕМ (appStateData.quizQuestions as any[]), 
    // чтобы TS не блокировал доступ к id и correctAnswer
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


// ХУК ДЛЯ ИСПОЛЬЗОВАНИЯ КОНТЕКСТА
export const useAppStateContext = (context: Context<AppContextType | undefined>): AppContextType => { 
    const ctx = useContext(context);
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    return ctx as AppContextType; 
};


// -----------------------------------------------------
// 2. ГЛАВНОЕ ПРИЛОЖЕНИЕ (ЛОГИКА И РОУТЕР)
// -----------------------------------------------------

// Заглушка для AI-Ассистента
const AIChatScreen = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>AI-Ассистент 🤖</h2>
            <Link to="/">← На главную</Link>
        </div>
    );
};


function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  
  // ФУНКЦИЯ ОБРАБОТКИ ОТВЕТОВ КВИЗА
  const handleQuizAnswer = (quizId: number, answerKey: string) => {
    setAppState(prevState => {
        const updatedQuizQuestions = prevState.quizQuestions.map(q => {
            // TypeScript теперь знает, что q имеет id и correctAnswer
            if (q.id === quizId) {
                const isCorrect = answerKey === q.correctAnswer;
                
                return {
                    ...q,
                    userAnswer: answerKey, 
                    isAnswered: true,      
                    isCorrect: isCorrect, 
                };
            }
            return q;
        });

        const allCorrect = updatedQuizQuestions.every(q => q.isCorrect);

        return {
            ...prevState,
            quizQuestions: updatedQuizQuestions,
            documentsUnlocked: allCorrect,
        };
    });
  };

const contextValue = { 
      state: appState, 
      setAppState, 
      handleQuizAnswer 
  };

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-container">
                <div className="content-area" style={{ paddingBottom: '70px' }}>
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/plan" element={<PlanScreen />} />
                        <Route path="/quiz" element={<QuizScreen />} />
                        <Route path="/diary" element={<DiaryScreen />} />
                        <Route path="/phrases" element={<PhrasebookScreen />} />
                        <Route path="/chat" element={<AIChatScreen />} />
                        <Route path="*" element={<div>404 | Страница не найдена</div>} />
                    </Routes>
                </div>
                <BottomNav />
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;