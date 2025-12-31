import { useState } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { PlaceCard } from '../components/PlaceCard';
import type { Place } from '../types';
import './PlanScreen.css';

export const PlanScreen = () => {
    const { state } = useAppStateContext();
    const { itinerary, places } = state;
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    // Улучшенная функция для поиска места по названию события или placeName
    const findPlaceByEvent = (eventTitle: string, placeName?: string): Place | undefined => {
        // Сначала проверяем точное совпадение по placeName
        if (placeName) {
            const found = places.find(p => p.name === placeName || p.nameEn === placeName);
            if (found) return found;
        }

        // Нормализуем текст для поиска
        const normalizedTitle = eventTitle.toLowerCase().trim();
        
        // Если есть явные ключевые слова для Бангкока, ищем их только если мы не на Самуи (упрощенно)
        // Но лучше полагаться на точные совпадения или placeName
        
        return places.find(p => {
            const name = (p.name || '').toLowerCase();
            const nameEn = (p.nameEn || '').toLowerCase();
            
            if (name === normalizedTitle || nameEn === normalizedTitle) return true;
            
            // Специальные случаи для Бангкока (оставляем для совместимости, но делаем строже)
            if (normalizedTitle.includes('iconsiam') && (name.includes('iconsiam'))) return true;
            if (normalizedTitle.includes('chatrium') && (name.includes('chatrium'))) return true;
            if (normalizedTitle.includes('mahanakhon') && (name.includes('mahanakhon'))) return true;
            
            return false;
        });
    };

    // Обработчик клика на текст события
    const handleEventClick = (eventTitle: string, placeName?: string) => {
        const place = findPlaceByEvent(eventTitle, placeName);
        if (place) {
            setSelectedPlace(place);
        }
    };

    return (
        <div className="plan-screen">
            <h2 className="plan-title">🗓️ План поездки</h2>
            
            <div className="itinerary-list">
                {itinerary && itinerary.map((day, index) => (
                    <div key={index} className="day-card">
                        <h3 className="day-header">
                            <div className="day-date">{day.date}</div>
                            <div className="day-title">{day.title}</div>
                        </h3>
                        
                        <div className="events-list">
                            {day.events.map((event, evtIndex) => {
                                const relatedPlace = findPlaceByEvent(event.title, event.placeName);
                                const isClickable = !!relatedPlace;
                                
                                return (
                                    <div 
                                        key={evtIndex} 
                                        className={`event-item ${isClickable ? 'event-item-clickable' : ''}`}
                                        onClick={() => isClickable && handleEventClick(event.title, event.placeName)}
                                    >
                                        <div className="event-icon">{event.icon}</div>
                                        <div className="event-details">
                                            <div className="event-time">{event.time}</div>
                                            <div className={`event-title ${isClickable ? 'event-title-link' : ''}`}>
                                                {event.title}
                                                {isClickable && <span className="event-link-icon">→</span>}
                                            </div>
                                            {event.description && (
                                                <div className="event-description">{event.description}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="tips-card">
                <h4 className="tips-title">💡 Советы</h4>
                <ul className="tips-list">
                    <li>Скачайте Grab для такси (категория Premium/SUV)</li>
                    <li>Для храмов: закрытые плечи и колени</li>
                    <li>Используйте лодку-шаттл от отеля до пирса Sathorn</li>
                </ul>
            </div>

            {/* Модальное окно с информацией о месте */}
            {selectedPlace && (
                <PlaceCard 
                    place={selectedPlace} 
                    onClose={() => setSelectedPlace(null)}
                />
            )}
        </div>
    );
};