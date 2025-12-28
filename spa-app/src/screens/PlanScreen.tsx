import { useState } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { PlaceCard } from '../components/PlaceCard';
import type { Place } from '../types';
import './PlanScreen.css';

export const PlanScreen = () => {
    const { state } = useAppStateContext();
    const { itinerary, places } = state;
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    // Улучшенная функция для поиска места по названию события
    const findPlaceByName = (eventTitle: string): Place | undefined => {
        // Нормализуем текст для поиска (в нижний регистр, без лишних пробелов)
        const normalizedTitle = eventTitle.toLowerCase().trim();
        
        return places.find(p => {
            const name = (p.name || '').toLowerCase();
            const nameEn = (p.nameEn || '').toLowerCase();
            
            // Проверяем точное совпадение названия
            if (name === normalizedTitle || nameEn === normalizedTitle) {
                return true;
            }
            
            // Проверяем, содержится ли название места в названии события
            if (normalizedTitle.includes(name) || normalizedTitle.includes(nameEn)) {
                return true;
            }
            
            // Проверяем, содержится ли название события в названии места
            if (name.includes(normalizedTitle) || nameEn.includes(normalizedTitle)) {
                return true;
            }
            
            // Специальные случаи для коротких названий
            if (name.includes('arun') && normalizedTitle.includes('arun')) return true;
            if (name.includes('pho') && normalizedTitle.includes('pho')) return true;
            if (name.includes('safari') && normalizedTitle.includes('safari')) return true;
            if (name.includes('mahanakhon') && normalizedTitle.includes('mahanakhon')) return true;
            if (name.includes('asiatique') && normalizedTitle.includes('asiatique')) return true;
            if (name.includes('chatrium') && normalizedTitle.includes('chatrium')) return true;
            if (name.includes('iconsiam') && normalizedTitle.includes('iconsiam')) return true;
            
            return false;
        });
    };

    // Обработчик клика на текст события
    const handleEventClick = (eventTitle: string) => {
        const place = findPlaceByName(eventTitle);
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
                                const relatedPlace = findPlaceByName(event.title);
                                const isClickable = !!relatedPlace;
                                
                                return (
                                    <div 
                                        key={evtIndex} 
                                        className={`event-item ${isClickable ? 'event-item-clickable' : ''}`}
                                        onClick={() => isClickable && handleEventClick(event.title)}
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