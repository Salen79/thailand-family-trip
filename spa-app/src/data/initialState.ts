import { places } from './places';
import { itinerary } from './itinerary';
import { quizQuestions } from './quizQuestions';
import { phrases } from './phrases';

// Функция для генерации статичного порядка паззла (используется один раз при инициализации)
// Используем детерминированный алгоритм на основе константного seed, чтобы порядок был одинаковым для всех
function generateStaticPuzzleOrder(totalPieces: number): number[] {
  // Простой детерминированный shuffle на основе seed (всегда одинаковый результат)
  const indices = Array.from({ length: totalPieces }, (_, i) => i);
  
  // Используем фиксированный seed для reproducible shuffle
  const seed = 12345;
  let rng = seed;
  
  // Linear Congruential Generator (простой, но детерминированный PRNG)
  const random = () => {
    rng = (rng * 1103515245 + 12345) % 2147483648;
    return rng / 2147483648;
  };
  
  // Fisher-Yates shuffle с детерминированным генератором
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  return indices;
}

export const appStateData = {
  currentScreen: 'home',
  currentFamily: -1,
  currentPhraseCategory: 'greetings',
  currentQuizIndex: 0,
  documentsUnlocked: false,
  isAuthenticated: false,
  familyMembers: [
    { name: 'Сергей', role: 'Папа', emoji: '👨', birthday: null },
    { name: 'Алена', role: 'Мама', emoji: '👩', birthday: null },
    { name: 'Варвара', role: 'Дочь', emoji: '👧', birthday: '2025-12-29' },
    { name: 'Иван', role: 'Сын', emoji: '👦', birthday: null }
  ],
  places,
  itinerary,
  currentFilter: 'Все',
  searchQuery: '',
  quizQuestions,
  puzzlePieces: Array(15).fill(false),
  puzzlePieceOrder: generateStaticPuzzleOrder(15), // Статичный порядок паззла (15 кусочков)
  puzzleImageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', // Изображение паззла
  phrases,
  voting: {
    question: 'Куда пойдем завтра?',
    options: [
      { place: 'Большой Королевский Дворец', votes: [] },
      { place: 'Океанариум Siam Ocean World', votes: [] },
      { place: 'Плавучий рынок', votes: [] }
    ]
  }
};
