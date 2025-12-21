import { useState, useMemo } from 'react';
import { useAppStateContext } from '../context/AppContext';
import type { Place } from '../types';
import './PlanScreen.css';

export const PlanScreen = () => {
    const { state } = useAppStateContext();
    const [selectedCategory, setSelectedCategory] = useState<string>('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(state.places.map(p => p.category || 'Другое'));
        return ['Все', ...Array.from(cats).sort()];
    }, [state.places]);

    const filteredPlaces = useMemo(() => {
        return state.places.filter(place => {
            const categoryMatch = selectedCategory === 'Все' || place.category === selectedCategory;
            const searchMatch = 
                place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (place.nameEn && place.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return categoryMatch && searchMatch;
        });
    }, [state.places, selectedCategory, searchQuery]);

    return (
        <div className="plan-screen">
            <div className="plan-header">
                <h1>🗺️ План поездки</h1>
                <div className="search-box">
                    <input type="text" placeholder="🔍 Поиск место..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                </div>
                <div className="category-filters">
                    {categories.map(cat => (<button key={cat} className={`category-button ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>))}
                </div>
            </div>

            <div className="places-grid">
                {filteredPlaces.length > 0 ? (
                    filteredPlaces.map((place, idx) => (
                        <div key={idx} className="place-card" onClick={() => setSelectedPlace(place)}>
                            <div className="place-image-container"><div className="place-emoji">{place.emoji || '📍'}</div></div>
                            <div className="place-content">
                                <h3 className="place-name">{place.name}</h3>
                                {place.nameEn && <p className="place-name-en">{place.nameEn}</p>}
                                <p className="place-description">{place.description}</p>
                                <div className="place-meta">
                                    {place.price && <div className="meta-item"><span>💰</span><span>{place.price}</span></div>}
                                    {place.hours && <div className="meta-item"><span>��</span><span>{place.hours.split(',')[0]}</span></div>}
                                </div>
                                <button className="view-details-btn">Подробнее →</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results"><p>😔 Ничего не найдено</p></div>
                )}
            </div>

            <div className="places-counter">Показано {filteredPlaces.length} из {state.places.length} мест</div>

            {selectedPlace && (
                <div className="modal-overlay" onClick={() => setSelectedPlace(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedPlace(null)}>✕</button>
                        <div className="modal-header">
                            <div className="modal-emoji">{selectedPlace.emoji}</div>
                            <h2>{selectedPlace.name}</h2>
                            {selectedPlace.nameEn && <p className="modal-name-en">{selectedPlace.nameEn}</p>}
                        </div>
                        <div className="modal-body">
                            <p>{selectedPlace.description}</p>
                            {selectedPlace.history && <div className="modal-section"><h4>📖 История</h4><p>{selectedPlace.history}</p></div>}
                            {selectedPlace.facts && <div className="modal-section"><h4>✨ Факты</h4><ul>{selectedPlace.facts.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
                            <div className="modal-info-grid">
                                {selectedPlace.hours && <div className="info-item"><span>🕐</span><span>{selectedPlace.hours}</span></div>}
                                {selectedPlace.price && <div className="info-item"><span>💰</span><span>{selectedPlace.price}</span></div>}
                            </div>
                            {selectedPlace.tips && <div className="modal-section"><h4>💡 Советы</h4><p>{selectedPlace.tips}</p></div>}
                        </div>
                        <div className="modal-actions">
                            {selectedPlace.mapLink && <a href={selectedPlace.mapLink} target="_blank" rel="noreferrer" className="action-button">📍 На карте</a>}
                            <button className="action-button">📔 В дневник</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
