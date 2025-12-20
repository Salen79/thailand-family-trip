import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStateContext } from '../App';
import './HomeScreen.css';

export const HomeScreen = () => {
    const { state } = useAppStateContext();
    const currentUser = state.familyMembers[state.currentFamily];

    // --- ЛОГИКА ТАЙМЕРА ---
    // Установлена дата: 2025 год, 11 (декабрь), 28 число, 18:00:00
    const targetDate = new Date(2025, 11, 28, 18, 0, 0).getTime();
    
    const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

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
    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = today.toLocaleDateString('ru-RU', dateOptions);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="home-screen">
            <div className="home-hero">
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
                </Link>

                <Link to="/diary" className="module-card">
                    <div className="module-icon">📖</div>
                    <div className="module-title">Дневник</div>
                </Link>

                <Link to="/phrases" className="module-card">
                    <div className="module-icon">🗣️</div>
                    <div className="module-title">Разговорник</div>
                </Link>
            </div>
        </div>
    );
};