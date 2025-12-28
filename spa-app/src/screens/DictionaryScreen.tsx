import { useState, useRef } from 'react';
import './DictionaryScreen.css';

interface DictionaryEntry {
    id: number;
    thai: string;
    transcription: string;
    russian: string;
    category: 'greeting' | 'food' | 'navigation' | 'shopping' | 'emergency' | 'polite';
    audioUrl?: string;
}

const DICTIONARY_DATA: DictionaryEntry[] = [
    // Приветствия
    { id: 1, thai: 'สวัสดี', transcription: 'sawátdee', russian: 'Здравствуйте / Привет', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/sawatdee.mp3' },
    { id: 2, thai: 'ขอบคุณ', transcription: 'khob-khun', russian: 'Спасибо', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/khobkhun.mp3' },
    { id: 3, thai: 'ขอโทษ', transcription: 'khob-tôht', russian: 'Извините', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/khobtohd.mp3' },
    { id: 4, thai: 'ใช่', transcription: 'chai', russian: 'Да', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/chai.mp3' },
    { id: 5, thai: 'ไม่', transcription: 'mai', russian: 'Нет', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/mai.mp3' },
    { id: 6, thai: 'ยินดีที่ได้รู้จัก', transcription: 'yin-dii thi dai ruu-chak', russian: 'Рад познакомиться', category: 'greeting', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/yindee.mp3' },

    // Еда и напитки
    { id: 7, thai: 'อาหาร', transcription: 'aa-haan', russian: 'Еда', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/aahan.mp3' },
    { id: 8, thai: 'น้ำ', transcription: 'nam', russian: 'Вода', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/nam.mp3' },
    { id: 9, thai: 'กาแฟ', transcription: 'gaa-fae', russian: 'Кофе', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/gaafae.mp3' },
    { id: 10, thai: 'ชา', transcription: 'chaa', russian: 'Чай', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/chaa.mp3' },
    { id: 11, thai: 'เบียร์', transcription: 'bian', russian: 'Пиво', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/bian.mp3' },
    { id: 12, thai: 'ข้าว', transcription: 'khao', russian: 'Рис', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/khao.mp3' },
    { id: 13, thai: 'ปลา', transcription: 'plaa', russian: 'Рыба', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/plaa.mp3' },
    { id: 14, thai: 'เนื้อ', transcription: 'neuua', russian: 'Мясо', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/neuua.mp3' },
    { id: 15, thai: 'ผัก', transcription: 'phak', russian: 'Овощи', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/phak.mp3' },
    { id: 16, thai: 'ผลไม้', transcription: 'phon-lam-ai', russian: 'Фрукты', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/phonlamai.mp3' },
    { id: 17, thai: 'หวาน', transcription: 'waan', russian: 'Сладко / Сладкое', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/waan.mp3' },
    { id: 18, thai: 'เผ็ด', transcription: 'phet', russian: 'Острое / Острая', category: 'food', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/phet.mp3' },

    // Навигация и транспорт
    { id: 19, thai: 'ที่ห้องน้ำ?', transcription: 'thi hong nam?', russian: 'Где туалет?', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thihongnam.mp3' },
    { id: 20, thai: 'สถานีอนุรักษ์', transcription: 'sathaanii anu-rak', russian: 'Станция', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/sathaanii.mp3' },
    { id: 21, thai: 'ถนน', transcription: 'thanon', russian: 'Улица', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thanon.mp3' },
    { id: 22, thai: 'แท็กซี่', transcription: 'thae-ksi', russian: 'Такси', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thaeksi.mp3' },
    { id: 23, thai: 'รถบัส', transcription: 'rot-bus', russian: 'Автобус', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/rotbus.mp3' },
    { id: 24, thai: 'เรือ', transcription: 'ruua', russian: 'Лодка', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/ruua.mp3' },
    { id: 25, thai: 'นี่ไหน?', transcription: 'nii nai?', russian: 'Это где?', category: 'navigation', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/niinai.mp3' },

    // Покупки и цены
    { id: 26, thai: 'เท่าไร?', transcription: 'thao-rai?', russian: 'Сколько стоит?', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thaorai.mp3' },
    { id: 27, thai: 'แพง', transcription: 'phaeng', russian: 'Дорого', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/phaeng.mp3' },
    { id: 28, thai: 'ถูก', transcription: 'thuuk', russian: 'Дешево', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thuuk.mp3' },
    { id: 29, thai: 'ลด ราคา', transcription: 'lod raa-khaa', russian: 'Скидка', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/lodraakhaa.mp3' },
    { id: 30, thai: 'เงิน', transcription: 'ngen', russian: 'Деньги', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/ngen.mp3' },
    { id: 31, thai: 'ร้านค้า', transcription: 'raan-khaa', russian: 'Магазин', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/raankhaa.mp3' },
    { id: 32, thai: 'บัตร เครดิต', transcription: 'bat-khredit', russian: 'Кредитная карта', category: 'shopping', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/batkredit.mp3' },

    // Чрезвычайные ситуации
    { id: 33, thai: 'ช่วย!', transcription: 'chuuay!', russian: 'Помощь!', category: 'emergency', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/chuuay.mp3' },
    { id: 34, thai: 'โรงพยาบาล', transcription: 'rohng-phaya-baan', russian: 'Больница', category: 'emergency', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/rohngphaya.mp3' },
    { id: 35, thai: 'ตำรวจ', transcription: 'tamruat', russian: 'Полиция', category: 'emergency', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/tamruat.mp3' },
    { id: 36, thai: 'ฉันไม่สบาย', transcription: 'chan mai sa-bai', russian: 'Мне плохо', category: 'emergency', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/chanmaisabai.mp3' },
    { id: 37, thai: 'ถ้ำน้ำ', transcription: 'tham-nam', russian: 'Перевод...', category: 'emergency', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/thamnam.mp3' },

    // Вежливые фразы
    { id: 38, thai: 'เพิ่มเติม', transcription: 'phoem-thoem', russian: 'Ещё', category: 'polite', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/phoemthoem.mp3' },
    { id: 39, thai: 'ไม่เป็นไร', transcription: 'mai pen rai', russian: 'Ничего страшного', category: 'polite', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/maipenrai.mp3' },
    { id: 40, thai: 'สวยมาก', transcription: 'suay mak', russian: 'Очень красиво', category: 'polite', audioUrl: 'https://d1kqdc0u1y4y7y.cloudfront.net/thai/suaymak.mp3' },
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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const filteredData = DICTIONARY_DATA.filter(entry => {
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        const matchesSearch = 
            entry.thai.includes(searchQuery) ||
            entry.russian.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.transcription.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handlePlayAudio = (id: number, audioUrl?: string) => {
        if (!audioUrl) {
            // Fallback на Web Speech API если нет URL
            useSpeechSynthesis(id);
            return;
        }
        
        setPlayingId(id);
        
        // Удаляем старый audio элемент если существует
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        // Создаём новый audio элемент
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        
        // Для iOS нужно загрузить аудио перед воспроизведением
        audio.preload = 'metadata';
        
        audio.onloadedmetadata = () => {
            audio.play().catch(error => {
                console.warn('Ошибка воспроизведения audio:', error);
                // Fallback на Web Speech API если audio не работает
                useSpeechSynthesis(id);
                setPlayingId(null);
            });
        };

        audio.onerror = () => {
            console.warn('Ошибка загрузки аудиофайла:', audioUrl);
            // Fallback на Web Speech API если ошибка загрузки
            useSpeechSynthesis(id);
            setPlayingId(null);
        };

        audio.onended = () => {
            setPlayingId(null);
            audioRef.current = null;
        };

        audio.src = audioUrl;
        audioRef.current = audio;
    };

    const useSpeechSynthesis = (id: number) => {
        const entry = DICTIONARY_DATA.find(e => e.id === id);
        if (!entry) return;

        // Останавливаем предыдущее озвучивание
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(entry.thai);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = () => {
            setPlayingId(id);
        };

        utterance.onend = () => {
            setPlayingId(null);
        };

        utterance.onerror = (error) => {
            console.warn('Ошибка синтеза речи:', error);
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
                                onClick={() => handlePlayAudio(entry.id, entry.audioUrl)}
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
