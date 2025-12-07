import { useState, createContext, useMemo, useContext } from 'react';
// Импортируем типы отдельно, как того требует строгий компилятор (TS1484)
import type { Dispatch, SetStateAction, Context } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// Активируем импорты всех компонентов, которые вы создали
import { HomeScreen } from './screens/HomeScreen';
import { PlanScreen } from './screens/PlanScreen';
import { QuizScreen } from './screens/QuizScreen';
import { DiaryScreen } from './screens/DiaryScreen';
import { PhrasebookScreen } from './screens/PhrasebookScreen';
import { BottomNav } from './components/BottomNav';


// -----------------------------------------------------
// 1. ОПРЕДЕЛЕНИЕ СТРУКТУРЫ ДАННЫХ (STATE)
// -----------------------------------------------------

interface AppState {
  currentFamily: number;
  familyMembers: typeof appStateData.familyMembers;
  places: typeof appStateData.places;
  quizQuestions: typeof appStateData.quizQuestions;
  documentsUnlocked: boolean;
  currentScreen: string;
}

// Обновленный контракт контекста (включая логику квиза)
interface AppContextType {
    state: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>;
    handleQuizAnswer: (quizId: number, answerKey: string) => void; // Логика квиза
}

const initialAppState: AppState = {
    currentFamily: 0,
    documentsUnlocked: false,
    currentScreen: 'home',
    familyMembers: appStateData.familyMembers,
    places: appStateData.places,
    quizQuestions: appStateData.quizQuestions.map(q => ({
        ...q,
        answers: q.answers || {}, 
    })),
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

// -----------------------------------------------------
// 2. ВСПОМОГАТЕЛЬНЫЙ ХУК (С ФИКСОМ TS2339)
// -----------------------------------------------------

// Хук с явным указанием возвращаемого типа AppContextType, чтобы устранить TS2339
export const useAppStateContext = (context: Context<AppContextType | undefined>): AppContextType => { 
    const ctx = useContext(context);
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    // Приведение типа гарантирует, что компилятор видит все свойства (state, handleQuizAnswer)
    return ctx as AppContextType; 
};


// -----------------------------------------------------
// 3. ГЛАВНОЕ ПРИЛОЖЕНИЕ (РОУТЕР И ЛОГИКА)
// -----------------------------------------------------

// Заглушка для AI-Ассистента
const AIChatScreen = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>AI-Ассистент 🤖 (Заглушка)</h2>
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

  // Передаем логику квиза через контекст
  const contextValue = useMemo(() => ({ 
      state: appState, 
      setAppState, 
      handleQuizAnswer // Передача функции
  }), [appState]);

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-container">
                <div className="content-area" style={{ paddingBottom: '70px' }}>
                    <Routes>
                        {/* АКТИВИРОВАННЫЕ ЭКРАНЫ */}
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