# Инициализация Git-репозитория
git init

# Добавление всех файлов в индекс
git add .

# Создание первого коммита
git commit -m "Initial commit"

# Добавление удаленного репозитория (замените YOUR_USERNAME на ваше имя пользователя GitHub)
git remote add origin https://github.com/YOUR_USERNAME/toolsList.git

# Установка основной ветки как main (или master, если предпочитаете)
git branch -M main

# Загрузка кода в удаленный репозиторий
git push -u origin main
