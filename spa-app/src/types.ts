// Файл: spa-app/src/types.ts

// Тип для ответов на вопросы квиза
type AnswerMap = {
    [key: string]: string;
};

// Полный интерфейс для вопроса квиза (включая свойства, добавляемые логикой)
export interface QuizQuestion {
    id: number;
    day: number;
    question: string;
    answer: string;
    answers: AnswerMap;
    correctAnswer: string;

    // Свойства, добавляемые нашей логикой в App.tsx:
    userAnswer?: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
}

// Интерфейс для всей структуры данных приложения
export interface AppState {
    currentFamily: number;
    familyMembers: any[]; // Оставляем any, пока не импортируем из initialState
    places: any[];
    quizQuestions: QuizQuestion[];
    documentsUnlocked: boolean;
    currentScreen: string;
}