import { useState } from 'react';
import type { Place } from '../types';
import './PlaceCard.css';

interface PlaceCardProps {
    place: Place;
    onClose: () => void;
}

export const PlaceCard = ({ place, onClose }: PlaceCardProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'details'>('info');

    const handleGoogleMapsClick = () => {
        if (place.mapLink) {
            window.open(place.mapLink, '_blank');
        }
    };

    return (
        <div className="place-card-overlay" onClick={onClose}>
            <div className="place-card-modal" onClick={(e) => e.stopPropagation()}>
                {/* Кнопка закрытия */}
                <button className="place-card-close" onClick={onClose}>
                    ✕
                </button>

                {/* Изображение */}
                {place.image && (
                    <div className="place-card-image">
                        <img src={place.image} alt={place.name} />
                        <div className="place-card-emoji">{place.emoji}</div>
                    </div>
                )}

                {/* Название и основная информация */}
                <div className="place-card-header">
                    <h2 className="place-card-title">{place.name}</h2>
                    {place.nameEn && <p className="place-card-name-en">{place.nameEn}</p>}
                    {place.category && <span className="place-card-category">{place.category}</span>}
                </div>

                {/* Табы */}
                <div className="place-card-tabs">
                    <button
                        className={`place-card-tab ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        📋 Инфо
                    </button>
                    <button
                        className={`place-card-tab ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        📖 Детали
                    </button>
                    <button
                        className={`place-card-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        ⭐ Отзывы
                    </button>
                </div>

                {/* Содержимое табов */}
                <div className="place-card-content">
                    {/* Информация и часы работы */}
                    {activeTab === 'info' && (
                        <div className="place-card-info">
                            {place.description && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">Описание</h4>
                                    <p className="place-info-text">{place.description}</p>
                                </div>
                            )}

                            {place.hours && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">⏰ Часы работы</h4>
                                    <p className="place-info-text">{place.hours}</p>
                                </div>
                            )}

                            {place.price && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">💰 Стоимость</h4>
                                    <p className="place-info-text">{place.price}</p>
                                </div>
                            )}

                            {place.tips && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">💡 Советы</h4>
                                    <p className="place-info-text">{place.tips}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Детали и история */}
                    {activeTab === 'details' && (
                        <div className="place-card-details">
                            {place.history && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">📚 История</h4>
                                    <p className="place-info-text">{place.history}</p>
                                </div>
                            )}

                            {place.facts && place.facts.length > 0 && (
                                <div className="place-info-section">
                                    <h4 className="place-info-title">🎯 Интересные факты</h4>
                                    <ul className="place-facts-list">
                                        {place.facts.map((fact, idx) => (
                                            <li key={idx} className="place-fact-item">
                                                {fact}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Отзывы туристов */}
                    {activeTab === 'reviews' && (
                        <div className="place-card-reviews">
                            <div className="place-review">
                                <div className="review-header">
                                    <span className="review-author">👨 Турист</span>
                                    <span className="review-rating">⭐⭐⭐⭐⭐ 4.8/5</span>
                                </div>
                                <p className="review-text">
                                    Потрясающее место! Архитектура просто невероятная. Приходите рано утром, чтобы избежать толп.
                                </p>
                            </div>

                            <div className="place-review">
                                <div className="review-header">
                                    <span className="review-author">👩 Туристка</span>
                                    <span className="review-rating">⭐⭐⭐⭐ 4.5/5</span>
                                </div>
                                <p className="review-text">
                                    Красивое место для фото. Не забудьте закрытую одежду для храмов. Рекомендую!
                                </p>
                            </div>

                            <div className="place-review">
                                <div className="review-header">
                                    <span className="review-author">👦 Путешественник</span>
                                    <span className="review-rating">⭐⭐⭐⭐⭐ 5/5</span>
                                </div>
                                <p className="review-text">
                                    Отличное место для посещения с семьей. Дети были в восторге от деталей и культуры.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Кнопка Google Maps */}
                <button className="place-card-maps-button" onClick={handleGoogleMapsClick}>
                    🗺️ Открыть в Google Maps
                </button>
            </div>
        </div>
    );
};
