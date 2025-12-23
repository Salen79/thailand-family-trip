import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStateContext } from '../context/AppContext';
import './HomeScreen.css';

export const HomeScreen = () => {
    const { state, setAppState } = useAppStateContext();
    const currentUser = state.familyMembers[state.currentFamily];

    // Данные для ежедневного виджета
    const photoPool = [
        { url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200', title: 'Закат над Чао Прайя', location: 'Бангкок' },
        { url: 'https://images.unsplash.com/photo-1563492065213-f0e6c7d29e52?w=1200', title: 'Изумрудный Будда', location: 'Большой Королевский дворец' },
        { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', title: 'Субботний шум', location: 'Рынок Чатучак' },
        { url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200', title: 'Тайский шелк и сады', location: 'Дом Джима Томпсона' },
        { url: 'https://images.unsplash.com/photo-1578986175247-7d60c6df07e7?w=1200', title: 'Неон и уличная еда', location: 'Khao San Road' }
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

    // Функция для получения приветствия в зависимости от времени суток
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Доброе утро';
        if (hour >= 12 && hour < 17) return 'Добрый день';
        if (hour >= 17 && hour < 23) return 'Добрый вечер';
        return 'Доброй ночи';
    };

    // Проверка на приближающиеся дни рождения
    const getUpcomingBirthday = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        
        const upcomingBirthdays = state.familyMembers.filter(member => {
            if (!member.birthday) return false;
            
            // Создаём дату дня рождения в текущем году
            const originalBirthday = new Date(member.birthday);
            const birthdayThisYear = new Date(
                currentYear,
                originalBirthday.getMonth(),
                originalBirthday.getDate()
            );
            
            const daysUntil = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 10; // Показываем за 10 дней
        });
        
        return upcomingBirthdays[0];
    };

    const upcomingBirthday = getUpcomingBirthday();

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

    // Подсчёт статистики
    const completedQuizCount = state.quizQuestions.filter(q => q.isCorrectByUser[state.currentFamily]).length;
    const totalQuizCount = state.quizQuestions.length;
    const quizProgress = totalQuizCount > 0 ? Math.round((completedQuizCount / totalQuizCount) * 100) : 0;

    return (
        <div className="home-screen">
            <div className="home-hero">
                <button className="logout-button" onClick={handleLogout}>
                    Выйти
                </button>
                <div className="today-date">Сегодня {capitalizedDate}</div>
                <h1>{getTimeBasedGreeting()}, {currentUser.name}! 👋</h1>
                <p className="trip-target">Новый год 2026 в Тайланде</p>
                
                {upcomingBirthday && (
                    <div className="birthday-reminder">
                        🎂 Скоро день рождения у {upcomingBirthday.name}!
                    </div>
                )}

                <div className="countdown-container">
                    <div className="countdown-label">До начала путешествия</div>
                    <div className="countdown-timer">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stat-item">
                    <div className="stat-icon">📍</div>
                    <div className="stat-value">{state.places.length}</div>
                    <div className="stat-label">Мест для посещения</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{quizProgress}%</div>
                    <div className="stat-label">Прогресс квиза</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon">👨‍👩‍👧‍👦</div>
                    <div className="stat-value">{state.familyMembers.length}</div>
                    <div className="stat-label">Участников</div>
                </div>
            </div>

            <div className="section-header">
                <h2>Разделы приложения</h2>
            </div>

            <div className="modules-grid">
                <Link to="/plan" className="module-card">
                    <div className="module-icon">🗓️</div>
                    <div className="module-title">План поездки</div>
                </Link>

                <Link to="/quiz" className="module-card">
                    <div className="module-icon">🧩</div>
                    <div className="module-title">Квиз</div>
                    <div className="module-status">
                        {state.documentsUnlocked ? '🔓 Открыто' : '🔒 Закрыто'}
                    </div>
                    {!state.documentsUnlocked && (
                        <div className="quiz-progress">
                            {completedQuizCount}/{totalQuizCount} ответов
                        </div>
                    )}
                </Link>
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
                        <div className="widget-card info-card">
                            <div className="info-text">Каждый день новое фото, цитата и погода — вдохновение перед приключением.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};