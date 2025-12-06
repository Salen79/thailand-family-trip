import { useState, createContext, useMemo, useContext } from 'react';
import type { Context } from 'react'; // <-- ИСПРАВЛЕНИЕ: Импорт только для типа
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// Импорт новых компонентов и экранов
// Обратите внимание: HomeScreen, PlanScreen и т.д. должны быть импортированы здесь!
// Пока мы не слили их, они остаются закомментированными или заменены на заглушки.
// import { HomeScreen } from './screens/HomeScreen';
// import { PlanScreen } from './screens/PlanScreen';
// import { QuizScreen } from './screens/QuizScreen';
// import { DiaryScreen } from './screens/DiaryScreen';
// import { PhrasebookScreen } from './screens/PhrasebookScreen';
// import { BottomNav } from './components/BottomNav';


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

interface AppContextType {
    state: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
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
// 2. ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ И ХУК
// -----------------------------------------------------

// ХУК ДЛЯ ИСПОЛЬЗОВАНИЯ КОНТЕКСТА (ЭКСПОРТИРУЕМ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ)
export const useAppStateContext = (context: Context<AppContextType | undefined>) => { // <-- ИСПРАВЛЕН ТИП Context И ДОБАВЛЕН export
    const ctx = useContext(context);
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    return ctx;
};


// -----------------------------------------------------
// 3. ГЛАВНОЕ ПРИЛОЖЕНИЕ (РОУТЕР)
// -----------------------------------------------------

// Временно используем заглушку, пока не сольем фикс
const PlaceholderScreen = ({ title }: { title: string }) => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>{title}</h2>
            <p>Вернитесь на главную страницу, чтобы проверить навигацию.</p>
        </div>
    );
};


function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  
  const contextValue = useMemo(() => ({ state: appState, setAppState }), [appState]);

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-container">
                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<PlaceholderScreen title="Главная страница (Синхронизация)" />} />
                        <Route path="/plan" element={<PlaceholderScreen title="План поездки" />} />
                        <Route path="/quiz" element={<PlaceholderScreen title="Квиз" />} />
                        <Route path="/diary" element={<PlaceholderScreen title="Дневник" />} />
                        <Route path="/phrases" element={<PlaceholderScreen title="Разговорник" />} />
                        <Route path="/chat" element={<PlaceholderScreen title="AI Ассистент" />} />
                        <Route path="*" element={<div>404 | Страница не найдена</div>} />
                    </Routes>
                </div>
                {/* Компонент BottomNav будет работать после слияния ветки feature-rebuild-ui-content */}
                {/* <BottomNav /> */}
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;