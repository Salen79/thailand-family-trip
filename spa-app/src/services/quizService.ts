import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { CloudQuizAnswer, QuizQuestion } from '../types';

const QUIZ_ANSWERS_COLLECTION = 'quiz_answers';

/**
 * Сохраняет ответ участника в Firestore
 */
export const saveQuizAnswerToCloud = async (
  questionId: number,
  familyIndex: number,
  userName: string,
  answerKey: string,
  isCorrect: boolean,
  points: number
): Promise<void> => {
  try {
    const docId = `q${questionId}_f${familyIndex}`;
    const docRef = doc(db, QUIZ_ANSWERS_COLLECTION, docId);
    
    await setDoc(docRef, {
      questionId,
      familyIndex,
      userName,
      answerKey,
      isCorrect,
      points,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Ошибка при сохранении ответа в облако:', error);
    throw error;
  }
};

/**
 * Загружает все ответы для конкретного вопроса
 */
export const loadQuestionAnswersFromCloud = async (
  questionId: number
): Promise<CloudQuizAnswer[]> => {
  try {
    const q = query(
      collection(db, QUIZ_ANSWERS_COLLECTION),
      where('questionId', '==', questionId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        questionId: data.questionId,
        familyIndex: data.familyIndex,
        answerKey: data.answerKey,
        isCorrect: data.isCorrect,
        points: data.points || 0,
        timestamp: data.timestamp?.toMillis?.() || 0,
      } as CloudQuizAnswer;
    });
  } catch (error) {
    console.error('Ошибка при загрузке ответов из облака:', error);
    return [];
  }
};

/**
 * Загружает все ответы для всех вопросов
 */
export const loadAllQuizAnswersFromCloud = async (): Promise<CloudQuizAnswer[]> => {
  try {
    const snapshot = await getDocs(collection(db, QUIZ_ANSWERS_COLLECTION));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        questionId: data.questionId,
        familyIndex: data.familyIndex,
        answerKey: data.answerKey,
        isCorrect: data.isCorrect,
        points: data.points || 0,
        timestamp: data.timestamp?.toMillis?.() || 0,
      } as CloudQuizAnswer;
    });
  } catch (error) {
    console.error('Ошибка при загрузке всех ответов из облака:', error);
    return [];
  }
};

/**
 * Подписывается на изменения ответов для конкретного вопроса (real-time)
 */
export const subscribeToQuestionAnswers = (
  questionId: number,
  onUpdate: (answers: CloudQuizAnswer[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, QUIZ_ANSWERS_COLLECTION),
      where('questionId', '==', questionId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const answers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          questionId: data.questionId,
          familyIndex: data.familyIndex,
          answerKey: data.answerKey,
          isCorrect: data.isCorrect,
          points: data.points || 0,
          timestamp: data.timestamp?.toMillis?.() || 0,
        } as CloudQuizAnswer;
      });
      onUpdate(answers);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Ошибка при подписке на ответы:', error);
    return () => {};
  }
};

/**
 * Подписывается на изменения ВСЕХ ответов (real-time)
 */
export const subscribeToAllQuizAnswers = (
  onUpdate: (answers: CloudQuizAnswer[]) => void
): (() => void) => {
  try {
    const unsubscribe = onSnapshot(collection(db, QUIZ_ANSWERS_COLLECTION), (snapshot) => {
      const answers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          questionId: data.questionId,
          familyIndex: data.familyIndex,
          answerKey: data.answerKey,
          isCorrect: data.isCorrect,
          points: data.points || 0,
          timestamp: data.timestamp?.toMillis?.() || 0,
        } as CloudQuizAnswer;
      });
      onUpdate(answers);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Ошибка при подписке на все ответы:', error);
    return () => {};
  }
};

/**
 * Применяет облачные ответы к вопросам в локальном состоянии
 */
export const applyCloudAnswersToQuestions = (
  questions: QuizQuestion[],
  cloudAnswers: CloudQuizAnswer[]
): QuizQuestion[] => {
  return questions.map(question => {
    const questionAnswers = cloudAnswers.filter(a => a.questionId === question.id);
    
    if (questionAnswers.length === 0) {
      return question;
    }
    
    const answersByUser: Record<number, string> = {};
    const isCorrectByUser: Record<number, boolean> = {};
    const pointsByUser: Record<number, number> = {};
    
    questionAnswers.forEach(answer => {
      answersByUser[answer.familyIndex] = answer.answerKey;
      isCorrectByUser[answer.familyIndex] = answer.isCorrect;
      
      // Ретроспективное начисление: если ответ верный, но очков 0 или нет (старая запись), даем 3 балла
      let points = answer.points || 0;
      if (answer.isCorrect && points === 0) {
        points = 3;
      }
      
      pointsByUser[answer.familyIndex] = points;
    });
    
    return {
      ...question,
      answersByUser,
      isCorrectByUser,
      pointsByUser,
      attemptsByUser: question.attemptsByUser || {} 
    };
  });
};
