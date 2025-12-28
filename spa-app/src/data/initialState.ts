import { places } from './places';
import { itinerary } from './itinerary';
import { quizQuestions } from './quizQuestions';
import { phrases } from './phrases';

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
