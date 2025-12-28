import { useAppStateContext } from '../context/AppContext';
import './PlanScreen.css';

export const PlanScreen = () => {
    const { state } = useAppStateContext();
    const { itinerary } = state;

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
                            {day.events.map((event, evtIndex) => (
                                <div key={evtIndex} className="event-item">
                                    <div className="event-icon">{event.icon}</div>
                                    <div className="event-details">
                                        <div className="event-time">{event.time}</div>
                                        <div className="event-title">{event.title}</div>
                                        {event.description && (
                                            <div className="event-description">{event.description}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
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
        </div>
    );
};