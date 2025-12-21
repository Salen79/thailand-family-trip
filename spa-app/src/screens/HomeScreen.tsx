import { useState, useEffect } from 'react';
import { useAppStateContext } from '../context/AppContext';
import './HomeScreen.css';

export const HomeScreen = () => {
    const { state, setAppState } = useAppStateContext();
    const currentUser = state.familyMembers[state.currentFamily];

    // Данные для ежедневного виджета
    const photoPool = [
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chao_Phraya_River_Bangkok_sunset.jpg/1280px-Chao_Phraya_River_Bangkok_sunset.jpg', title: 'Закат над Чао Прайя', location: 'Бангкок' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Grand_Palace_Bangkok.jpg/1280px-Grand_Palace_Bangkok.jpg', title: 'Изумрудный Будда', location: 'Большой Королевский дворец' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Chatuchak_Weekend_Market_Bangkok.jpg/1280px-Chatuchak_Weekend_Market_Bangkok.jpg', title: 'Субботний шум', location: 'Рынок Чатучак' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Jim_Thompson_House_Bangkok.jpg/1280px-Jim_Thompson_House_Bangkok.jpg', title: 'Тайский шелк и сады', location: 'Дом Джима Томпсона' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Khao_San_Road_Bangkok_night.jpg/1280px-Khao_San_Road_Bangkok_night.jpg', title: 'Неон и уличная еда', location: 'Khao San Road' }
    ];

    const weatherPool = [
        { temp: 33, feels: 37, condition: 'Солнечно', icon: '☀️', uv: 10, humidity: 58 },
        { temp: 31, feels: 35, condition: 'Переменная облачность', icon: '🌤️', uv: 8, humidity: 64 },
        { temp: 30, feels: 33, condition: 'Лёгкий дождь', icon: '🌦️', uv: 7, humidity: 72 },
        { temp: 32, feels: 36, condition: 'Жарко и влажно', icon: '🌡️', uv: 11, humidity: 70 }
    ];

    const wisdomPool = [
        'Хорошие дела возвращаются к тому, кто их совершает.',
        'Терпение — ключ к счастью.',
        'Тот, кто знает, когда остановиться, избежит беды.',
        'Счастье растёт там, где его делят.'
    ];

    const today = new Date();
    const dayIndex = today.getDate();
    const selectedPhoto = photoPool[dayIndex % photoPool.length];
    const selectedWeather = weatherPool[dayIndex % weatherPool.length];
    const selectedWisdom = wisdomPool[dayIndex % wisdomPool.length];
    const isVarvaraBirthday = today.getMonth() === 11 && today.getDate() === 29; // 29 декабря
    const birthdayVideoUrl = 'https://example.com/varvara-birthday-video'; // заменить на готовое видео

    const handleLogout = () => {
        // Удаляем данные из localStorage
        localStorage.removeItem('thailand-trip-auth');
        
        // Сбрасываем состояние
        setAppState(prev => ({
            ...prev,
            currentFamily: -1,
            isAuthenticated: false,
            userPin: undefined
        }));
    };

    // --- ЛОГИКА ПРОГРЕССА ---
    const quizAnswered = state.quizQuestions.filter(q => q.isAnswered).length;
    const quizProgress = Math.round((quizAnswered / state.quizQuestions.length) * 100);
    const diaryEntries = 1; // Пока захардкодим, позже будет из состояния
    const diaryProgress = Math.round((diaryEntries / 10) * 100);
    const phrasesLearned = 5; // Пока захардкодим
    const phrasesProgress = Math.round((phrasesLearned / 30) * 100);

    // --- ЛОГИКА ТАЙМЕРА ---
    // Установлена дата: 2025 год, 11 (декабрь), 28 число, 18:00:00
    const targetDate = new Date(2025, 11, 28, 18, 0, 0).getTime();
    
    const [timeLeft, setTimeLeft] = useState(() => targetDate - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const difference = targetDate - Date.now();
            setTimeLeft(difference);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatTime = (time: number) => {
        if (time <= 0) return "Путешествие началось! 🎉";

        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        return `${days}д ${hours.toString().padStart(2, '0')}ч ${minutes.toString().padStart(2, '0')}м ${seconds.toString().padStart(2, '0')}с`;
    };

    // --- ЛОГИКА ТЕКУЩЕЙ ДАТЫ ---
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = today.toLocaleDateString('ru-RU', dateOptions);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="home-screen">
            <div className="home-hero">
                <button className="logout-button" onClick={handleLogout}>
                    Выйти
                </button>
                <div className="today-date">Сегодня {capitalizedDate}</div>
                <h1>Привет, {currentUser.name}! 👋</h1>
                <p className="trip-target">Новый год 2026 в Тайланде</p>
                
                <div className="countdown-container">
                    <div className="countdown-label">До начала путешествия</div>
                    <div className="countdown-timer">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="daily-widget">
                <div className="widget-photo" style={{ backgroundImage: `url(${selectedPhoto.url})` }}>
                    <div className="widget-photo-overlay">
                        <div className="photo-label">Сегодня в Таиланде</div>
                        <div className="photo-title">{selectedPhoto.title}</div>
                        <div className="photo-location">{selectedPhoto.location}</div>
                    </div>
                </div>

                <div className="widget-content">
                    <div className="widget-card weather-card">
                        <div className="weather-top">
                            <div>
                                <div className="weather-label">Погода сегодня · Бангкок</div>
                                <div className="weather-temp">{selectedWeather.icon} {selectedWeather.temp}°C</div>
                                <div className="weather-sub">Ощущается как {selectedWeather.feels}°C — {selectedWeather.condition}</div>
                            </div>
                            <div className="weather-meta">
                                <div>UV {selectedWeather.uv}</div>
                                <div>Влажность {selectedWeather.humidity}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="widget-card wisdom-card">
                        <div className="wisdom-label">Тайская мудрость дня</div>
                        <div className="wisdom-text">“{selectedWisdom}”</div>
                    </div>

                    {isVarvaraBirthday ? (
                        <div className="widget-card birthday-card">
                            <div className="birthday-left">
                                <div className="birthday-emoji">🎂</div>
                                <div>
                                    <div className="birthday-title">29 декабря — День Варвары!</div>
                                    <div className="birthday-sub">Мы приготовили поздравление 💌</div>
                                </div>
                            </div>
                            <a className="birthday-button" href={birthdayVideoUrl} target="_blank" rel="noreferrer">
                                Смотреть видео
                            </a>
                        </div>
                    ) : (
                        <div className="widget-card progress-card">
                            <div className="progress-title">Прогресс подготовки 🚀</div>
                            <div className="progress-item">
                                <div className="progress-label"><span>🧩 Квиз</span><span className="progress-value">{quizAnswered}/{state.quizQuestions.length}</span></div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${quizProgress}%` }}></div></div>
                            </div>
                            <div className="progress-item">
                                <div className="progress-label"><span>📔 Дневник</span><span className="progress-value">{diaryEntries}/10</span></div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${diaryProgress}%` }}></div></div>
                            </div>
                            <div className="progress-item">
                                <div className="progress-label"><span>🗣️ Фразы</span><span className="progress-value">{phrasesLearned}/30</span></div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${phrasesProgress}%` }}></div></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};