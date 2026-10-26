# 1. Базовый образ
FROM node:18

# 2. Устанавливаем рабочую директорию
WORKDIR /app

# 3. Копируем файлы зависимостей
COPY package*.json ./

# 4. Устанавливаем зависимости
RUN npm install --omit=dev

# 5. Копируем весь остальной код
COPY . .

# 6. Открываем порт (у тебя в server.js PORT=3000)
EXPOSE 3000

# 7. Команда для запуска
CMD ["node", "server.js"]