# SmartFridge
мобильное приложение для автоматизированного учёта продуктов питания с использованием OCR-сканирования чеков, контроля сроков годности и семейной синхронизации.

## Команда
- Машталер Полина: Frontend часть приложения
- Рабаданов Имран: backend, работа с чеками
- Тимкова София: дизайнер
- Хасянов Никита: backend, работа с чеками
- Ченцов Артём: Frontend часть приложения, ответственный за Git в команде

## Цель проекта
Разработать прототип (MVP) мобильного приложения, которое позволяет домашним пользователям (семьям, занятым людям, студентам) автоматизировать учёт продуктов, минимизировать ручной ввод, отслеживать сроки годности и синхронизировать списки с членами семьи, сокращая пищевые отходы и материальные расходы.

## Технологии
- Frontend: React Native, Expo, Zustand, React Navigation
- Backend: Node.js, Express.js, JWT
- База данных: MongoDB
- OCR и облачные сервисы: Google Cloud Vision API, Firebase Cloud Messaging (FCM), Firebase Storage
- Дизайн: Figma
- Инструменты: Git, GitHub

## Как запустить проект
1. склонировать репозиторий: git clone https://github.com/Products-TeamU/SmartFridge.git (Либо если уже есть репозиторий: git fetch и: git pull)
2. перейти на нужную ветку: git switch имя_ветки
3. перейти в саму папку проекта: cd путь_проекта
4. установить все зависимости: npm install
5. 1. если используете QR код: npx expo start
   2. если используете Android-эмуляторе: npx expo run:android (если возникает ошибка, перед этой командой используйте: echo "sdk.dir=C:/Users/ИМЯ_ПОЛЬЗОВАТЕЛЯ/AppData/Local/Android/Sdk" > android/local.properties) 

## Ссылки 
- [Макет в Figma](https://www.figma.com/design/TWKHY0VRF0p6aSaJPgIigM/%D0%B4%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD%D0%B8?node-id=0-1&t=SXsdiuiUKbgyqHsi-1)
