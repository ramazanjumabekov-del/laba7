# Доска объявлений

React + TypeScript + Vite. Интерфейс находится в `src/main.tsx`, стили — в `src/styles.css`.

`GET /ads` загружает объявления, `POST /ads` публикует новое объявление через `FormData`.
API: https://inai-col1.fishrungames.com

## Запуск

- `npm ci`
- `npm run dev`

Сборка: `npm run build`.

GitHub Actions собирает сайт и публикует содержимое `dist` в GitHub Pages. В Settings → Pages → Build and deployment выберите GitHub Actions.
