import React, { useState, createContext, useMemo, useContext } from 'react'; // <-- ИСПРАВЛЕНО: Добавлен React и useContext
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appStateData } from './data/initialState.ts';
import './App.css'; 

// -----------------------------------------------------
// 1. ОПРЕДЕЛЕНИЕ СТРУКТУРЫ ДАННЫХ (STATE)
// -----------------------------------------------------

// Используем упрощенный набор данных для компонента
interface AppState {
  currentFamily: number;
  familyMembers: typeof appStateData.familyMembers;
  places: typeof appStateData.places;
  quizQuestions: typeof appStateData.quizQuestions;
  documentsUnlocked: boolean;
  currentScreen: string;
}

// Контекст для передачи состояния по всему приложению
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
// 2. КОМПОНЕНТЫ ЗАГЛУШКИ
// -----------------------------------------------------

// Вспомогательный хук для использования контекста
const useAppStateContext = (context: React.Context<AppContextType | undefined>) => { // <-- ИСПРАВЛЕНО: Переименовано
    const ctx = useContext(context); // <-- Используем useContext напрямую
    if (ctx === undefined) {
        throw new Error('useAppStateContext must be used within a Provider');
    }
    return ctx;
};


// Заглушка для Главного экрана (Home)
const HomeScreen = () => {
    const context = useAppStateContext(AppContext);
    if (!context) return <div>Ошибка загрузки контекста</div>;
    
    const currentUser = context.state.familyMembers[context.state.currentFamily];

    return (
        <div className="home-hero" style={{ padding: '30px', background: '#FF6B35', color: 'white' }}>
            <h1>Привет, {currentUser.name}! 👋</h1>
            <p>Вы находитесь в ветке {currentUser.role}.</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/plan" style={{ color: 'white', marginRight: '15px' }}>План 🗓️</Link>
                <Link to="/chat" style={{ color: 'white', marginRight: '15px' }}>Чат AI 🤖</Link>
                <Link to="/quiz" style={{ color: 'white' }}>Квиз 🧩</Link>
            </div>
        </div>
    );
};

// Заглушка для AI-Ассистента
const AIChatScreen = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>AI-Ассистент 🤖 (Заглушка)</h2>
            <p>Здесь будет чат с Gemini (реализация API завтра).</p>
            <Link to="/">← На главную</Link>
        </div>
    );
};

// -----------------------------------------------------
// 3. ГЛАВНОЕ ПРИЛОЖЕНИЕ (РОУТЕР)
// -----------------------------------------------------

function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  
  // Оборачиваем контекст в useMemo для производительности
  const contextValue = useMemo(() => ({ state: appState, setAppState }), [appState]);

  return (
    <AppContext.Provider value={contextValue}>
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/chat" element={<AIChatScreen />} />
                    <Route path="/plan" element={<div>План поездки (Скоро)</div>} />
                    <Route path="/quiz" element={<div>Квиз (Скоро)</div>} />
                    <Route path="*" element={<div>404 | Страница не найдена</div>} />
                </Routes>
            </div>
        </Router>
    </AppContext.Provider>
  );
}

export default App;