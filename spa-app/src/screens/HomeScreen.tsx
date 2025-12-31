import { useState, useEffect } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { collection, query, getDocs, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { itinerary } from '../data/itinerary';
import { places } from '../data/places';
import './HomeScreen.css';

interface WeatherData {
    temp: number;
    feels: number;
    condition: string;
    icon: string;
    windSpeed: number;
    windGusts: number;
    windDir: number;
    humidity: number;
    uv: number;
    locationName: string;
}

export const HomeScreen = () => {
    const { state, setAppState } = useAppStateContext();
    const currentUser = state.familyMembers[state.currentFamily];
    const [diaryPoints, setDiaryPoints] = useState<Record<number, number>>({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Загрузка погоды
    useEffect(() => {
        const fetchWeather = async () => {
            const today = new Date();
            const isSamui = today.getMonth() === 0 && today.getDate() >= 1; // Январь и позже
            const lat = isSamui ? 9.5120 : 13.7563;
            const lon = isSamui ? 100.0136 : 100.5018;
            const locationName = isSamui ? 'Самуи' : 'Бангкок';

            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=uv_index_max&timezone=Asia%2FBangkok&forecast_days=1`
                );
                const data = await response.json();
                
                const code = data.current.weather_code;
                let condition = 'Ясно';
                let icon = '☀️';
                
                if (code >= 1 && code <= 3) { condition = 'Переменная облачность'; icon = '🌤️'; }
                else if (code >= 45 && code <= 48) { condition = 'Туман'; icon = '🌫️'; }
                else if (code >= 51 && code <= 67) { condition = 'Дождь'; icon = '🌦️'; }
                else if (code >= 80 && code <= 82) { condition = 'Ливень'; icon = '🌧️'; }
                else if (code >= 95) { condition = 'Гроза'; icon = '⛈️'; }

                setWeather({
                    temp: Math.round(data.current.temperature_2m),
                    feels: Math.round(data.current.apparent_temperature),
                    condition,
                    icon,
                    windSpeed: Math.round(data.current.wind_speed_10m),
                    windGusts: Math.round(data.current.wind_gusts_10m),
                    windDir: data.current.wind_direction_10m,
                    humidity: data.current.relative_humidity_2m,
                    uv: Math.round(data.daily.uv_index_max[0]),
                    locationName
                });
            } catch (error) {
                console.error("Weather fetch error:", error);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 1800000); // Обновлять каждые 30 мин
        return () => clearInterval(interval);
    }, []);

    // Загрузка очков за дневник
    useEffect(() => {
        const fetchDiaryPoints = async () => {
            try {
                const q = query(collection(db, 'diary_posts'), orderBy('timestamp', 'asc'));
                const querySnapshot = await getDocs(q);
                const pointsMap: Record<number, number> = {};
                const userDailyCounts: Record<string, Record<string, number>> = {};
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const authorId = parseInt(data.author.id);
                    if (isNaN(authorId)) return;

                    let points = data.points;
                    
                    // Если очков нет в БД, рассчитываем их на лету для таблицы
                    if (points === undefined) {
                        const ts = data.timestamp?.toDate() || new Date();
                        const dateKey = ts.toISOString().split('T')[0];
                        
                        if (!userDailyCounts[authorId]) userDailyCounts[authorId] = {};
                        if (!userDailyCounts[authorId][dateKey]) userDailyCounts[authorId][dateKey] = 0;
                        
                        const count = userDailyCounts[authorId][dateKey];
                        const hasPhoto = !!data.media;
                        const hasCaption = !!(data.content && data.content.trim());
                        
                        if (hasPhoto && hasCaption) {
                            if (count === 0) points = 3;
                            else if (count === 1) points = 2;
                            else if (count === 2) points = 1;
                            else points = 0.1;
                        } else {
                            if (count === 0) points = 2;
                            else if (count === 1) points = 1;
                            else if (count === 2) points = 0.5;
                            else points = 0.1;
                        }
                        userDailyCounts[authorId][dateKey]++;
                    }
                    
                    pointsMap[authorId] = (pointsMap[authorId] || 0) + (points || 0);
                });
                
                setDiaryPoints(pointsMap);
            } catch (error) {
                console.error("Error fetching diary points:", error);
            }
        };

        fetchDiaryPoints();
    }, [state.currentFamily]);

    // Функция для администратора: проставить баллы всем старым постам и ответам квиза в БД
    const syncAllPoints = async () => {
        if (!window.confirm('Начислить очки за все старые посты и ответы квиза в базе данных?')) return;
        setIsSyncing(true);
        try {
            const batch = writeBatch(db);
            let updateCount = 0;

            // 1. Синхронизация Дневника
            const diaryQ = query(collection(db, 'diary_posts'), orderBy('timestamp', 'asc'));
            const diarySnapshot = await getDocs(diaryQ);
            const userDailyCounts: Record<string, Record<string, number>> = {};

            diarySnapshot.forEach((document) => {
                const data = document.data();
                const authorId = data.author.id;
                const ts = data.timestamp?.toDate() || new Date();
                const dateKey = ts.toISOString().split('T')[0];

                if (!userDailyCounts[authorId]) userDailyCounts[authorId] = {};
                if (!userDailyCounts[authorId][dateKey]) userDailyCounts[authorId][dateKey] = 0;

                const count = userDailyCounts[authorId][dateKey];
                
                if (data.points === undefined) {
                    const hasPhoto = !!data.media;
                    const hasCaption = !!(data.content && data.content.trim());
                    
                    let points = 0;
                    if (hasPhoto && hasCaption) {
                        if (count === 0) points = 3;
                        else if (count === 1) points = 2;
                        else if (count === 2) points = 1;
                        else points = 0.1;
                    } else {
                        if (count === 0) points = 2;
                        else if (count === 1) points = 1;
                        else if (count === 2) points = 0.5;
                        else points = 0.1;
                    }

                    batch.update(doc(db, 'diary_posts', document.id), { points });
                    updateCount++;
                }
                userDailyCounts[authorId][dateKey]++;
            });

            // 2. Синхронизация Квиза
            const quizSnapshot = await getDocs(collection(db, 'quiz_answers'));
            quizSnapshot.forEach((document) => {
                const data = document.data();
                // Если ответ правильный, но очков 0 или нет поля points
                if (data.isCorrect === true && (data.points === undefined || data.points === 0)) {
                    batch.update(doc(db, 'quiz_answers', document.id), { points: 3 });
                    updateCount++;
                }
            });

            if (updateCount > 0) {
                await batch.commit();
                alert(`Успешно обновлено объектов: ${updateCount}`);
                window.location.reload();
            } else {
                alert('Все данные уже актуальны.');
            }
        } catch (error) {
            console.error("Error syncing points:", error);
            alert('Ошибка при синхронизации');
        } finally {
            setIsSyncing(false);
        }
    };

    // Подсчет очков для всех участников семьи
    const leaderboard = state.familyMembers.map((member, idx) => {
        const quizPoints = state.quizQuestions.reduce((sum, q) => {
            return sum + (q.pointsByUser?.[idx] || 0);
        }, 0);
        const dPoints = diaryPoints[idx] || 0;
        const totalPoints = quizPoints + dPoints;

        return { 
            ...member, 
            quizPoints, 
            diaryPoints: dPoints, 
            totalPoints, 
            isCurrentUser: idx === state.currentFamily 
        };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    // Данные для ежедневного виджета
    const wisdomPool = [
        'Хорошие дела возвращаются к тому, кто их совершает.',
        'Терпение — ключ к счастью.',
        'Тот, кто знает, когда остановиться, избежит беды.',
        'Счастье растёт там, где его делят.',
        'Спокойная вода глубока.',
        'Не бойся идти медленно, бойся стоять на месте.',
        'Улыбка открывает все двери.',
        'Тот, кто сажает дерево, знает, что не он будет отдыхать в его тени.',
        'Мудрость — это умение слушать свое сердце.',
        'Каждый шаг оставляет след.',
        'Жизнь — это путешествие, а не пункт назначения.',
        'Истинное богатство — в довольстве малым.'
    ];

    const today = new Date();
    
    // Логика выбора фото дня на основе плана
    const getPhotoOfDay = () => {
        const dayStr = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }).replace(' г.', '');
        const dayPlan = itinerary.find(d => d.date.toLowerCase() === dayStr.toLowerCase());
        
        if (dayPlan) {
            // Ищем первое событие с placeName, для которого есть фото в places
            for (const event of dayPlan.events) {
                if (event.placeName) {
                    const place = places.find(p => p.name === event.placeName);
                    if (place && place.image) {
                        return {
                            url: place.image,
                            title: place.name,
                            location: place.category || 'Таиланд'
                        };
                    }
                }
            }
        }
        
        // Дефолтное фото, если ничего не нашли
        return { 
            url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200', 
            title: 'Закат над Чао Прайя', 
            location: 'Бангкок' 
        };
    };

    const selectedPhoto = getPhotoOfDay();
    const selectedWisdom = wisdomPool[today.getDate() % wisdomPool.length];
    
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
    // Установлена дата: 2025 год, 11 (декабрь), 28 число, 18:45:00
    const targetDate = new Date(2025, 11, 28, 18, 45, 0).getTime();
    
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const isTripStarted = currentTime >= targetDate;
    const timeDiff = Math.abs(targetDate - currentTime);

    const formatTime = (time: number) => {
        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        const parts = [];
        if (days > 0) parts.push(`${days}д`);
        parts.push(`${hours.toString().padStart(2, '0')}ч`);
        parts.push(`${minutes.toString().padStart(2, '0')}м`);
        parts.push(`${seconds.toString().padStart(2, '0')}с`);

        return parts.join(' ');
    };

    // --- ЛОГИКА ТЕКУЩЕЙ ДАТЫ ---
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = today.toLocaleDateString('ru-RU', dateOptions);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

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
                    <div className="countdown-label">
                        {isTripStarted ? "Наше путешествие началось! 🌴" : "До начала путешествия"}
                    </div>
                    <div className="countdown-timer">
                        {isTripStarted ? `Мы в пути ${formatTime(timeDiff)}` : formatTime(timeDiff)}
                    </div>
                </div>
            </div>

            <div className="daily-widget">
                <div className="widget-card wisdom-card">
                    <div className="wisdom-label">Тайская мудрость дня</div>
                    <div className="wisdom-text">“{selectedWisdom}”</div>
                </div>

                <div className="widget-photo" style={{ backgroundImage: `url("${selectedPhoto.url}")` }}>
                    <div className="widget-photo-overlay">
                        <div className="photo-label">Сегодня в плане</div>
                        <div className="photo-title">{selectedPhoto.title}</div>
                        <div className="photo-location">{selectedPhoto.location}</div>
                    </div>
                </div>

                <div className="widget-content">
                    <div className="widget-card weather-card">
                        {weather ? (
                            <div className="weather-top">
                                <div>
                                    <div className="weather-label">Погода сегодня · {weather.locationName}</div>
                                    <div className="weather-temp">{weather.icon} {weather.temp}°C</div>
                                    <div className="weather-sub">Ощущается как {weather.feels}°C — {weather.condition}</div>
                                </div>
                                <div className="weather-meta">
                                    <div className="wind-info">
                                        <span title="Скорость ветра">💨 {weather.windSpeed} км/ч</span>
                                        <span title="Порывы ветра" className="wind-gusts"> (до {weather.windGusts})</span>
                                    </div>
                                    <div className="wind-dir" style={{ transform: `rotate(${weather.windDir}deg)`, display: 'inline-block' }}>⬆️</div>
                                    <div>UV {weather.uv} · Влажность {weather.humidity}%</div>
                                </div>
                            </div>
                        ) : (
                            <div className="weather-loading">Загрузка погоды...</div>
                        )}
                    </div>

                    {/* Виджет Турнирной таблицы */}
                    <div className="widget-card leaderboard-card">
                        <div className="leaderboard-header">
                            <span className="leaderboard-label">Турнирная таблица 🏆</span>
                            {state.currentFamily === 0 && (
                                <button 
                                    className="sync-points-btn" 
                                    onClick={syncAllPoints}
                                    disabled={isSyncing}
                                    title="Синхронизировать очки за старые посты"
                                >
                                    {isSyncing ? '⏳' : '🔄'}
                                </button>
                            )}
                        </div>
                        <div className="leaderboard-table">
                            <div className="table-header">
                                <div className="col-member">Участник</div>
                                <div className="col-stat">Квиз</div>
                                <div className="col-stat">Заметки</div>
                                <div className="col-stat total">Итого</div>
                            </div>
                            <div className="leaderboard-list">
                                {leaderboard.map((member, index) => (
                                    <div key={index} className={`leaderboard-item ${member.isCurrentUser ? 'current-user' : ''}`}>
                                        <div className="member-info col-member">
                                            <span className="member-rank">{index + 1}</span>
                                            <span className="member-emoji">{member.emoji}</span>
                                            <span className="member-name">{member.name}</span>
                                        </div>
                                        <div className="col-stat">{member.quizPoints}</div>
                                        <div className="col-stat">{member.diaryPoints.toFixed(1).replace('.0', '')}</div>
                                        <div className="col-stat total">{member.totalPoints.toFixed(1).replace('.0', '')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                    ) : null}
                </div>
            </div>
        </div>
    );
};