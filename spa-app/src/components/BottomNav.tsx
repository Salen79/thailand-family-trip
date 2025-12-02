import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
    const location = useLocation(); // Хук для получения текущего пути

    // Функция для определения, активна ли ссылка
    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: 0, 
            width: '100%', 
            background: 'var(--color-surface, #fff)', 
            borderTop: '1px solid #ddd', 
            padding: '10px 0', 
            display: 'flex', 
            justifyContent: 'space-around',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            maxWidth: '428px', // Ограничиваем ширину для мобильного вида
            left: '50%',
            transform: 'translateX(-50%)',
        }}>
            <Link to="/" style={{ color: isActive('/') ? 'var(--color-primary, #333)' : '#888', fontWeight: isActive('/') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>
                🏠<br/>Главная
            </Link>
            <Link to="/plan" style={{ color: isActive('/plan') ? 'var(--color-primary, #333)' : '#888', fontWeight: isActive('/plan') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>
                🗓️<br/>План
            </Link>
            <Link to="/quiz" style={{ color: isActive('/quiz') ? 'var(--color-primary, #333)' : '#888', fontWeight: isActive('/quiz') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>
                🧩<br/>Квиз
            </Link>
            <Link to="/diary" style={{ color: isActive('/diary') ? 'var(--color-primary, #333)' : '#888', fontWeight: isActive('/diary') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>
                📔<br/>Дневник
            </Link>
            <Link to="/chat" style={{ color: isActive('/chat') ? 'var(--color-primary, #333)' : '#888', fontWeight: isActive('/chat') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>
                🤖<br/>Чат AI
            </Link>
        </div>
    );
};