// Файл: spa-app/src/types.ts

// Тип для ответов на вопросы квиза
export type AnswerMap = Record<string, string>;

// Исходный формат вопросов в initialState (до добавления runtime полей)
export interface RawQuizQuestion {
    id?: number;
    day: number;
    question: string;
    answer: string;
    answers?: AnswerMap;
    correctAnswer?: string;
}

// Полный интерфейс для вопроса квиза (включая свойства, добавляемые логикой)
export interface QuizQuestion {
    id: number;
    day: number;
    question: string;
    answer: string;
    answers: AnswerMap;
    correctAnswer: string;

    // Свойства, добавляемые нашей логикой в App.tsx:
    // Храним ответы каждого члена семьи по индексу
    answersByUser: Record<number, string>; // familyIndex -> answerKey
    isCorrectByUser: Record<number, boolean>; // familyIndex -> isCorrect
}

export interface FamilyMember {
    name: string;
    role: string;
    emoji?: string;
    birthday?: string | null;
}

export interface Place {
    name: string;
    nameEn?: string;
    category?: string;
    description?: string;
    history?: string;
    facts?: string[];
    hours?: string;
    price?: string;
    tips?: string;
    mapLink?: string;
    image?: string;
    emoji?: string;
}

export interface ItineraryEvent {
    time: string;
    title: string;
    description?: string;
    icon?: string;
}

export interface ItineraryDay {
    date: string;
    title: string;
    events: ItineraryEvent[];
}

// Интерфейс для всей структуры данных приложения
export interface AppState {
    currentFamily: number;
    familyMembers: FamilyMember[];
    places: Place[];
    itinerary: ItineraryDay[];
    quizQuestions: QuizQuestion[];
    documentsUnlocked: boolean;
    currentScreen: string;
    isAuthenticated: boolean;
    userPin?: string;
}