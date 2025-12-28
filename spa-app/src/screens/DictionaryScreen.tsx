import { useState } from 'react';
import './DictionaryScreen.css';

interface DictionaryEntry {
    id: number;
    thai: string;
    transcription: string;
    russian: string;
    category: 'greeting' | 'food' | 'navigation' | 'shopping' | 'emergency' | 'polite';
}

const DICTIONARY_DATA: DictionaryEntry[] = [
    // Приветствия
    { id: 1, thai: 'สวัสดี', transcription: 'sawátdee', russian: 'Здравствуйте / Привет', category: 'greeting' },
    { id: 2, thai: 'ขอบคุณ', transcription: 'khob-khun', russian: 'Спасибо', category: 'greeting' },
    { id: 3, thai: 'ขอโทษ', transcription: 'khob-tôht', russian: 'Извините', category: 'greeting' },
    { id: 4, thai: 'ใช่', transcription: 'chai', russian: 'Да', category: 'greeting' },
    { id: 5, thai: 'ไม่', transcription: 'mai', russian: 'Нет', category: 'greeting' },
    { id: 6, thai: 'ยินดีที่ได้รู้จัก', transcription: 'yin-dii thi dai ruu-chak', russian: 'Рад познакомиться', category: 'greeting' },

    // Еда и напитки
    { id: 7, thai: 'อาหาร', transcription: 'aa-haan', russian: 'Еда', category: 'food' },
    { id: 8, thai: 'น้ำ', transcription: 'nam', russian: 'Вода', category: 'food' },
    { id: 9, thai: 'กาแฟ', transcription: 'gaa-fae', russian: 'Кофе', category: 'food' },
    { id: 10, thai: 'ชา', transcription: 'chaa', russian: 'Чай', category: 'food' },
    { id: 11, thai: 'เบียร์', transcription: 'bian', russian: 'Пиво', category: 'food' },
    { id: 12, thai: 'ข้าว', transcription: 'khao', russian: 'Рис', category: 'food' },
    { id: 13, thai: 'ปลา', transcription: 'plaa', russian: 'Рыба', category: 'food' },
    { id: 14, thai: 'เนื้อ', transcription: 'neuua', russian: 'Мясо', category: 'food' },
    { id: 15, thai: 'ผัก', transcription: 'phak', russian: 'Овощи', category: 'food' },
    { id: 16, thai: 'ผลไม้', transcription: 'phon-lam-ai', russian: 'Фрукты', category: 'food' },
    { id: 17, thai: 'หวาน', transcription: 'waan', russian: 'Сладко / Сладкое', category: 'food' },
    { id: 18, thai: 'เผ็ด', transcription: 'phet', russian: 'Острое / Острая', category: 'food' },

    // Навигация и транспорт
    { id: 19, thai: 'ที่ห้องน้ำ?', transcription: 'thi hong nam?', russian: 'Где туалет?', category: 'navigation' },
    { id: 20, thai: 'สถานีอนุรักษ์', transcription: 'sathaanii anu-rak', russian: 'Станция', category: 'navigation' },
    { id: 21, thai: 'ถนน', transcription: 'thanon', russian: 'Улица', category: 'navigation' },
    { id: 22, thai: 'แท็กซี่', transcription: 'thae-ksi', russian: 'Такси', category: 'navigation' },
    { id: 23, thai: 'รถบัส', transcription: 'rot-bus', russian: 'Автобус', category: 'navigation' },
    { id: 24, thai: 'เรือ', transcription: 'ruua', russian: 'Лодка', category: 'navigation' },
    { id: 25, thai: 'นี่ไหน?', transcription: 'nii nai?', russian: 'Это где?', category: 'navigation' },

    // Покупки и цены
    { id: 26, thai: 'เท่าไร?', transcription: 'thao-rai?', russian: 'Сколько стоит?', category: 'shopping' },
    { id: 27, thai: 'แพง', transcription: 'phaeng', russian: 'Дорого', category: 'shopping' },
    { id: 28, thai: 'ถูก', transcription: 'thuuk', russian: 'Дешево', category: 'shopping' },
    { id: 29, thai: 'ลด ราคา', transcription: 'lod raa-khaa', russian: 'Скидка', category: 'shopping' },
    { id: 30, thai: 'เงิน', transcription: 'ngen', russian: 'Деньги', category: 'shopping' },
    { id: 31, thai: 'ร้านค้า', transcription: 'raan-khaa', russian: 'Магазин', category: 'shopping' },
    { id: 32, thai: 'บัตร เครดิต', transcription: 'bat-khredit', russian: 'Кредитная карта', category: 'shopping' },

    // Чрезвычайные ситуации
    { id: 33, thai: 'ช่วย!', transcription: 'chuuay!', russian: 'Помощь!', category: 'emergency' },
    { id: 34, thai: 'โรงพยาบาล', transcription: 'rohng-phaya-baan', russian: 'Больница', category: 'emergency' },
    { id: 35, thai: 'ตำรวจ', transcription: 'tamruat', russian: 'Полиция', category: 'emergency' },
    { id: 36, thai: 'ฉันไม่สบาย', transcription: 'chan mai sa-bai', russian: 'Мне плохо', category: 'emergency' },
    { id: 37, thai: 'ถ้ำน้ำ', transcription: 'tham-nam', russian: 'Пещера', category: 'emergency' },

    // Вежливые фразы
    { id: 38, thai: 'เพิ่มเติม', transcription: 'phoem-thoem', russian: 'Ещё', category: 'polite' },
    { id: 39, thai: 'ไม่เป็นไร', transcription: 'mai pen rai', russian: 'Ничего страшного', category: 'polite' },
    { id: 40, thai: 'สวยมาก', transcription: 'suay mak', russian: 'Очень красиво', category: 'polite' },
];

const CATEGORY_LABELS = {
    greeting: 'Приветствия',
    food: 'Еда и напитки',
    navigation: 'Навигация',
    shopping: 'Покупки',
    emergency: 'Чрезвычайные ситуации',
    polite: 'Вежливые фразы',
};

const CATEGORY_EMOJIS = {
    greeting: '👋',
    food: '🍜',
    navigation: '🗺️',
    shopping: '🛍️',
    emergency: '🚨',
    polite: '🤝',
};

export const DictionaryScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORY_LABELS | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState<number | null>(null);

    const filteredData = DICTIONARY_DATA.filter(entry => {
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        const matchesSearch = 
            entry.thai.includes(searchQuery) ||
            entry.russian.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.transcription.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handlePlayAudio = (id: number) => {
        const entry = DICTIONARY_DATA.find(e => e.id === id);
        if (!entry) return;

        // Останавливаем предыдущее озвучивание
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(entry.thai);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            setPlayingId(id);
        };

        utterance.onend = () => {
            setPlayingId(null);
        };

        utterance.onerror = (event) => {
            console.warn('Ошибка синтеза речи:', event.error);
            setPlayingId(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="dictionary-screen">
            <div className="dictionary-header">
                <h1>📚 Словарь туриста</h1>
                <p>Полезные тайские слова и фразы</p>
            </div>

            <div className="dictionary-search">
                <input
                    type="text"
                    placeholder="Поиск по русскому, тайскому или транскрипции..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="category-filter">
                <button
                    className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    Все
                </button>
                {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map(cat => (
                    <button
                        key={cat}
                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>

            <div className="dictionary-list">
                {filteredData.length === 0 ? (
                    <div className="empty-state">
                        <p>Ничего не найдено 🔍</p>
                    </div>
                ) : (
                    filteredData.map(entry => (
                        <div key={entry.id} className="dictionary-card">
                            <div className="card-content">
                                <div className="thai-word">{entry.thai}</div>
                                <div className="transcription">{entry.transcription}</div>
                                <div className="russian-translation">{entry.russian}</div>
                                <div className="category-badge">
                                    {CATEGORY_EMOJIS[entry.category]} {CATEGORY_LABELS[entry.category]}
                                </div>
                            </div>
                            <button
                                className={`play-button ${playingId === entry.id ? 'playing' : ''}`}
                                onClick={() => handlePlayAudio(entry.id)}
                                title="Озвучить"
                            >
                                🔊
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
