## Цель
Короткие, практические инструкции для AI-агентов, работающих с этим репозиторием — чтобы быстро стать продуктивным при изменениях UI, логики приложения и интеграции с Firebase.

## Краткая архитектура (big picture)
- Проект содержит одностраничное приложение React + TypeScript в `spa-app/` (Vite). Основной вход: `spa-app/src/main.tsx` и `spa-app/src/App.tsx`.
- Глобальное состояние хранится в `AppContext` (см. `spa-app/src/App.tsx`) и инициализируется из `spa-app/src/data/initialState.ts`.
- UI разделён на `src/screens/` (экраны) и `src/components/` (повторно используемые части). Роутинг через `react-router-dom` в `App.tsx`.
- Хостинг и БД: корневой `firebase.json` настраивает Hosting (SPA rewrite) и Firestore (rules/indexes). Клиентская библиотека: `firebase` в `spa-app/package.json`.

## Быстрые команды (dev / build / lint)
- Разработчику (в корне):
  - `cd spa-app`
  - `npm install` (или используемый пакетный менеджер)
  - `npm run dev` — запускает Vite dev сервер (HMR)
  - `npm run build` — запускает `tsc -b` и затем `vite build` (production build)
  - `npm run preview` — локально превью собранного билда
  - `npm run lint` — запускает ESLint

## Важные проектные конвенции и паттерны
- Импорты иногда включают расширения `.ts`/`.tsx` (см. `spa-app/src/main.tsx` и `App.tsx`). Следуй существующему стилю при добавлении импортов.
- Состояние приложения централизовано: используйте `useAppStateContext()` (определён в `App.tsx`) для доступа/изменения состояния вместо изобретения локальных менеджеров состояний.
- Типы и shape состояния описаны в `spa-app/src/types.ts` и инициализируются в `spa-app/src/data/initialState.ts` — при изменениях типов обновляйте обе точки.
- UI-стили — простые CSS-файлы в `src/screens` и `src/components`. Добавляй CSS рядом с компонентом.

## Интеграция и внешние зависимости
- Firebase: клиентская зависимость в `spa-app/package.json` и конфиг в `firebase.json`. Hosting использует rewrite всех путей на `/index.html`.
- Нет backend-кода в этом репозитории — assume static hosting + Firestore rules. Любые изменения, влияющие на Firestore, должны сопровождаться изменением `firestore.rules`/`firestore.indexes.json`.

## Примеры поиска изменений (concrete examples)
- Добавить новый экран: создать `spa-app/src/screens/MyScreen.tsx`, добавить маршрут в `spa-app/src/App.tsx` (Routes/Route) и добавить ссылку в `BottomNav` при необходимости.
- Изменить логику викторины: `handleQuizAnswer` находится в `spa-app/src/App.tsx` — оно обновляет `quizQuestions` и флаг `documentsUnlocked`.

## PR / общий рабочий процесс
- Малые PR — отдельные изменения UI или состояние. Перед PR: запусти `npm run lint` и `npm run build` в `spa-app`.
- Описывай в PR, какие файлы состояния/типы изменились (types + initialState + AppContext).

## Ограничения и что не менять
- Не удаляй структуру `AppContext` без полного плана миграции: многие экраны полагаются на `useAppStateContext()`.
- Не изменяй `firebase.json` хостинг-настройки без проверки поведения SPA rewrite.

## Где смотреть примеры
- Основные файлы: spa-app/package.json, spa-app/src/App.tsx, spa-app/src/data/initialState.ts, firebase.json

Если что-то неясно — предложи изменения в этом файле, укажи, что нужно добавить (CI, тесты, дополнительные скрипты). Оставь обратную связь, и я подправлю инструкцию.
