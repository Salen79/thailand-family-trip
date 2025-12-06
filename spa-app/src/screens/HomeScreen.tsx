import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStateContext } from '../App';

export const HomeScreen = () => {
    const { state } = useAppStateContext();
    const currentUser = state.familyMembers[state.currentFamily];

    // Временно жестко заданная функция-заглушка для обратного отсчета
    const countdownTimer = '10д 15ч 30м 45с';

    return (
        <div className="home-screen">
            <div className="home-hero" style={{ background: '#FF6B35', color: 'white', padding: '32px 16px', textAlign: 'center' }}>
                <h1>Привет, {currentUser.name}! 👋</h1>
                <p>Новый год 2026 в Тайланде</p>
                <div className="countdown" style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '16px', margin: '24px 0' }}>
                    <div className="countdown-label" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>До начала путешествия</div>
                    <div className="countdown-timer" style={{ fontSize: '24px', fontWeight: '700' }}>{countdownTimer}</div>
                </div>
            </div>

            <div className="modules-grid" style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <Link to="/plan" className="module-card" style={{ padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', borderRadius: '12px', textDecoration: 'none', color: '#333' }}>
                    <div className="module-icon" style={{ fontSize: '48px' }}>🗓️</div>
                    <div className="module-title" style={{ fontSize: '14px', fontWeight: '600' }}>План поездки</div>
                </Link>
                <Link to="/quiz" className="module-card" style={{ padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', borderRadius: '12px', textDecoration: 'none', color: '#333' }}>
                    <div className="module-icon" style={{ fontSize: '48px' }}>🧩</div>
                    <div className="module-title" style={{ fontSize: '14px', fontWeight: '600' }}>Наш квиз</div>
                </Link>
                <Link to="/diary" className="module-card" style={{ padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', borderRadius: '12px', textDecoration: 'none', color: '#333' }}>
                    <div className="module-icon" style={{ fontSize: '48px' }}>📔</div>
                    <div className="module-title" style={{ fontSize: '14px', fontWeight: '600' }}>Дневник</div>
                </Link>
                <Link to="/chat" className="module-card" style={{ padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', borderRadius: '12px', textDecoration: 'none', color: '#333' }}>
                    <div className="module-icon" style={{ fontSize: '48px' }}>🤖</div>
                    <div className="module-title" style={{ fontSize: '14px', fontWeight: '600' }}>AI Ассистент</div>
                </Link>
            </div>
        </div>
    );
};