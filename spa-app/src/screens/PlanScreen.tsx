import { useAppStateContext } from '../context/AppContext';

export const PlanScreen = () => {
    const { state } = useAppStateContext();
    const { itinerary } = state;

    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>🗓️ План поездки</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {itinerary && itinerary.map((day, index) => (
                    <div key={index} style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '15px', 
                        padding: '15px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ 
                            color: '#FF6B6B', 
                            borderBottom: '2px solid #eee', 
                            paddingBottom: '10px',
                            marginBottom: '15px'
                        }}>
                            {day.date}
                            <div style={{ fontSize: '0.9em', color: '#666', fontWeight: 'normal', marginTop: '5px' }}>
                                {day.title}
                            </div>
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {day.events.map((event, evtIndex) => (
                                <div key={evtIndex} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '24px', minWidth: '30px' }}>{event.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>{event.time}</div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{event.title}</div>
                                        {event.description && (
                                            <div style={{ fontSize: '0.9em', color: '#666' }}>{event.description}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '30px', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>💡 Советы</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9em', color: '#444' }}>
                    <li style={{ marginBottom: '5px' }}>Скачайте Grab для такси (категория Premium/SUV)</li>
                    <li style={{ marginBottom: '5px' }}>Для храмов: закрытые плечи и колени</li>
                    <li>Используйте лодку-шаттл от отеля до пирса Sathorn</li>
                </ul>
            </div>
        </div>
    );
};