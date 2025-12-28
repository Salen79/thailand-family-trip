import { useEffect } from 'react';

/**
 * Хук для разблокировки AudioContext на iOS Safari при первом взаимодействии пользователя.
 * Это необходимо для того, чтобы SpeechSynthesis работал на iPhone.
 */
export const useAudioUnlock = () => {
    useEffect(() => {
        const unlockAudio = async () => {
            console.log('🔓 Попытка разблокировки AudioContext...');
            
            try {
                // Создаём временный AudioContext для разблокировки
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                
                // Создаём пустой буфер и проигрываем его (это требуется для разблокировки)
                const bufferSize = audioContext.sampleRate * 0.1; // 0.1 сек
                const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);
                
                console.log('✅ AudioContext разблокирован успешно');
                
                // Также загружаем доступные голоса для SpeechSynthesis
                await loadVoices();
            } catch (error) {
                console.warn('⚠️ Ошибка при разблокировке AudioContext:', error);
            }
        };

        // Слушаем первое взаимодействие пользователя
        const events = ['click', 'touchstart', 'keydown'];
        
        events.forEach(event => {
            document.addEventListener(event, unlockAudio, { once: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, unlockAudio);
            });
        };
    }, []);
};

/**
 * Загружает доступные голоса для SpeechSynthesis API
 */
export const loadVoices = async (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            console.log(`📢 Найдено ${voices.length} голосов`);
            resolve(voices);
            return;
        }

        // Ждём загрузки голосов
        const voicesChangedHandler = () => {
            const loadedVoices = window.speechSynthesis.getVoices();
            console.log(`📢 Голоса загружены: ${loadedVoices.length} голосов`);
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            resolve(loadedVoices);
        };

        window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
    });
};

/**
 * Получает лучший голос для указанного языка
 */
export const getBestVoiceForLanguage = (lang: string): SpeechSynthesisVoice | undefined => {
    const voices = window.speechSynthesis.getVoices();
    
    // Сначала ищем точное совпадение языка
    let voice = voices.find(v => v.lang === lang);
    if (voice) {
        console.log(`🎤 Выбран голос: ${voice.name} (${voice.lang})`);
        return voice;
    }

    // Потом ищем по префиксу языка (например, 'th' для 'th-TH')
    const langPrefix = lang.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix));
    if (voice) {
        console.log(`🎤 Выбран голос с префиксом: ${voice.name} (${voice.lang})`);
        return voice;
    }

    // Если ничего не найдено, берём первый доступный голос
    if (voices.length > 0) {
        console.log(`🎤 Выбран голос по умолчанию: ${voices[0].name} (${voices[0].lang})`);
        return voices[0];
    }

    console.warn('⚠️ Голоса не найдены');
    return undefined;
};
