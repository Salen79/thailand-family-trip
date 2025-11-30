import { useState } from 'react';
// Импортируем наши данные
import { appStateData } from './data/initialState';
import './App.css';

// Начальное состояние приложения - берем старые данные
interface AppState {
  currentScreen: string;
  currentFamily: number;
  familyMembers: typeof appStateData.familyMembers;
  places: typeof appStateData.places;
  quizQuestions: typeof appStateData.quizQuestions;
  // Добавьте другие необходимые поля из appStateData
}

function App() {
  // Хук useState для управления состоянием (вместо глобального appState)
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'home',
    currentFamily: 0,
    familyMembers: appStateData.familyMembers,
    places: appStateData.places,
    quizQuestions: appStateData.quizQuestions,
  });

  // --- ВРЕМЕННЫЙ UI ДЛЯ ПРОВЕРКИ ---
  return (
    <div className="App">
      <h1>Модернизация SPA завершена!</h1>
      <p>
        Текущий экран: <strong>{appState.currentScreen}</strong>
      </p>
      <p>
        Количество мест: <strong>{appState.places.length}</strong>
      </p>
      <p>
        Текущий пользователь: <strong>{appState.familyMembers[appState.currentFamily].name}</strong>
      </p>
      
      <button 
        onClick={() => setAppState(prev => ({...prev, currentFamily: (prev.currentFamily + 1) % prev.familyMembers.length }))}
      >
        Переключить пользователя (Тест)
      </button>
    </div>
  );
}

export default App;