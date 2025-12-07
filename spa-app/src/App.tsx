import { useState, createContext, useMemo, useContext } from 'react'; // Context УБРАН
import type { Dispatch, SetStateAction, Context } from 'react'; // <-- Context ПЕРЕНЕСЕН СЮДА
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// ----------------------------------------------------------------------
// АКТИВИРУЕМ ИМПОРТЫ КОМПОНЕНТОВ (Всё, что вы только что создали)
// ----------------------------------------------------------------------
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
    quizQuestions: QuizQuestion[];
  documentsUnlocked: boolean;
  currentScreen: string;
}

// Описание структуры вопроса квиза
interface QuizQuestion {
    id: number; // используем day как уникальный id
    day: number;
    question: string;
    answer: string; // оригинальное корректное значение из initialState
    correctAnswer?: string; // дублирует `answer` для явности в логике квиза
    answers: Record<string, boolean>;
    userAnswer?: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
}

interface AppContextType {
    state: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    handleQuizAnswer: (quizId: number, answerKey: string) => void;
}

const initialAppState: AppState = {
    currentFamily: 0,
    documentsUnlocked: false,
    currentScreen: 'home',
    familyMembers: appStateData.familyMembers,
    places: appStateData.places,
    quizQuestions: appStateData.quizQuestions.map(q => ({
        ...q,
        id: q.day,
        correctAnswer: q.answer,
        answers: q.answers || {},
        userAnswer: undefined,
        isAnswered: false,
        isCorrect: false,
    } as QuizQuestion)),
};

export const AppContext = createContext<AppContextType | undefined>(undefined);


// ХУК ДЛЯ ИСПОЛЬЗОВАНИЯ КОНТЕКСТА (Экспортируем для использования в других файлах)
export const useAppStateContext = (context: Context<AppContextType | undefined>) => {
    const ctx = useContext(context);
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    return ctx;
};


// -----------------------------------------------------
// 2. ГЛАВНОЕ ПРИЛОЖЕНИЕ (РОУТЕР)
// -----------------------------------------------------

// Заглушка для AI-Ассистента (пока пустая)
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
  
  const handleQuizAnswer = (quizId: number, answerKey: string) => {
    setAppState(prevState => {
        const updatedQuizQuestions = prevState.quizQuestions.map(q => {
            if (q.id === quizId) {
                // Отмечаем ответ как выбранный
                const updatedAnswers = { ...q.answers, [answerKey]: true };
                
                // Проверяем, соответствует ли выбранный ответ правильному
                const isCorrect = answerKey === q.correctAnswer;
                
                return {
                    ...q,
                    answers: updatedAnswers,
                    userAnswer: answerKey, // Записываем ответ пользователя
                    isAnswered: true,      // Отмечаем как отвеченный
                    isCorrect: isCorrect,  // Сохраняем результат
                };
            }
            return q;
        });

        // Проверяем, разблокированы ли все документы (если все ответы правильные)
        const allCorrect = updatedQuizQuestions.every(q => q.isCorrect);

        return {
            ...prevState,
            quizQuestions: updatedQuizQuestions,
            documentsUnlocked: allCorrect,
        };
    });
};

  const contextValue = useMemo(() => ({ state: appState, setAppState, handleQuizAnswer }), [appState]);

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-container">
                <div className="content-area" style={{ paddingBottom: '70px' }}> {/* Добавляем отступ для навигации */}
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
                <BottomNav /> {/* АКТИВИРУЕМ НАВИГАЦИЮ */}
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;