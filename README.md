# ДЗ 63.1 — Робота зі статичними файлами, Cookies та JWT на сервері Express

**Express Studio E4** — навчальний застосунок на Node.js 24 та Express 5. Проєкт продовжує попередні ДЗ: зберігає REST CRUD для користувачів і статей, рендеринг PUG/EJS, middleware та сесії. У ДЗ 63.1 додано favicon, збереження теми в cookies і JWT-автентифікацію. Для демонстрації реалізовано інтерактивну сторінку `/demo`.

## Реалізовані вимоги ДЗ 63.1

- **Статичні файли:** `src/public/favicon.ico` доступний за `/favicon.ico` та підключений у всіх PUG/EJS HTML-шаблонах. Стилі й клієнтський JS передаються через `express.static()`.
- **Cookies:** `cookie-parser` зчитує вибір теми (`light` або `dark`) з cookie `hw04.theme`. Маршрут `POST /theme` зберігає тему; вона застосовується на сторінках PUG, EJS і демо.
- **JWT:** `POST /auth/register` і `POST /auth/login` створюють підписаний JWT. Middleware `requireJwt` перевіряє токен для `GET /auth/me`. Токен зберігається в cookie `hw04.token` з атрибутом `HttpOnly`.
- **Додатково:** паролі зберігаються як bcrypt-хеші; передбачені вихід з облікового запису, валідація введення, захист від повторної реєстрації однакового username та автоматичні тести.

## Встановлення та запуск

**Передумови:** Node.js 24 і npm. Для відтворюваного встановлення використовується Yarn Classic 1.22.22 і файл `yarn.lock`.

```bash
git clone https://github.com/andrii-dolzhenko/express-homework-04-jwt-cookies.git
cd express-homework-04-jwt-cookies

npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile
npm test

# Для поточного запуску створюємо локальний секрет JWT.
# Не додавайте реальний секрет до Git-репозиторію.
JWT_SECRET="$(openssl rand -hex 32)" npm start
```

Відкрийте **http://localhost:3000/demo**. Сервер використовує порт `3000`. Для перевірки шаблонів напряму також доступні `/users` і `/articles` (у браузері сторінки віддаються як HTML).

Якщо змінна `JWT_SECRET` не задана, застосунок створює випадковий ключ під час запуску. Після перезапуску попередні JWT перестануть бути дійсними. `NODE_ENV=production` вмикає атрибут `Secure` для cookies, тому для локального HTTP не встановлюйте цей режим.

## Інтерактивне демо

На сторінці `/demo` можна послідовно перевірити:

1. Перемикання теми **Light / Dark**, оновлення сторінки й переходи між Users (PUG) та Articles (EJS).
2. Реєстрацію: username довжиною 3–32 символи (латинські літери, цифри, `_`, `-`) та пароль довжиною 8–72 символи.
3. Виклик захищеного `GET /auth/me`: після входу відповідь `200`, без авторизації — `401`.
4. Вихід через `POST /auth/logout`, після якого доступ до `/auth/me` зникає.
5. Повторний вхід і окремий лічильник відвідувань на базі `express-session`.

Сторінка `/demo/icon` показує favicon із можливістю повернутися до демо. Спільний адаптивний header використовується на Demo, PUG та EJS-сторінках. Усі кнопки Light/Dark звертаються до одного серверного механізму збереження теми.

**Це реальне локальне демо Express, а не статичний макет.** GitHub Pages не запускає Node.js, тому авторизація та серверні сесії працюють після локального запуску `npm start`.

## HTTP-маршрути

| Метод | Маршрут | Призначення / результат |
| --- | --- | --- |
| `GET` | `/` | Початкова текстова відповідь Express |
| `GET` | `/demo` | Інтерактивне демо (PUG) |
| `GET` | `/demo/icon` | Сторінка перегляду favicon (PUG) |
| `GET` | `/users` | Список користувачів: PUG при `Accept: text/html`, інакше JSON |
| `GET` | `/users/:userId` | Користувач за ID: PUG або JSON |
| `POST` | `/users` | Створити користувача (`201`) |
| `PUT` | `/users/:userId` | Оновити користувача |
| `DELETE` | `/users/:userId` | Видалити користувача (`204`) |
| `POST` | `/users/strict` | Навчальна демонстрація Basic Authorization |
| `GET` | `/articles` | Список статей: EJS при `Accept: text/html`, інакше JSON |
| `GET` | `/articles/:articleId` | Стаття за ID: EJS або JSON |
| `POST` | `/articles` | Створити статтю (`201`) |
| `PUT` | `/articles/:articleId` | Оновити статтю |
| `DELETE` | `/articles/:articleId` | Видалити статтю (`204`) |
| `POST` | `/articles/strict` | Навчальна демонстрація Basic Authorization |
| `GET` | `/session` | Збільшити лічильник відвідувань у сесії |
| `DELETE` | `/session` | Скинути поточну сесію (`204`) |
| `GET` | `/theme` | Отримати поточну тему у форматі JSON |
| `POST` | `/theme` | Зберегти тему в cookie: JSON `200` або redirect `303` для форми |
| `POST` | `/auth/register` | Реєстрація, bcrypt-хеш пароля, JWT cookie (`201`) |
| `POST` | `/auth/login` | Перевірка облікових даних і JWT cookie (`200`) |
| `GET` | `/auth/me` | Захищений JWT-маршрут: `200` або `401` |
| `POST` | `/auth/logout` | Очистити JWT cookie (`204`) |
| `GET` | `/favicon.ico` | ICO favicon зі статичної папки `public` |
| `GET` | `/assets/favicon.svg` | Додатковий SVG favicon |
| `GET` | `/assets/css/styles.css` | Спільні стилі сторінок |
| `GET` | `/assets/css/demo.css` | Стилі демо |
| `GET` | `/assets/js/demo.js` | Клієнтська логіка інтерактивного демо |

## Приклади запитів через curl

Запустіть сервер в окремому терміналі, а потім:

```bash
# Реєстрація й збереження HttpOnly cookie у тимчасовому файлі
COOKIE_JAR="$(mktemp)"
TEST_USER="student_$(date +%s)"

curl -i -c "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"SafePass123\"}" \
  http://localhost:3000/auth/register

# Доступ із JWT cookie (200)
curl -i -b "$COOKIE_JAR" http://localhost:3000/auth/me

# Вихід і перевірка відсутності доступу (401)
curl -i -X POST -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  http://localhost:3000/auth/logout
curl -i -b "$COOKIE_JAR" http://localhost:3000/auth/me

rm -f "$COOKIE_JAR"
```

## Автоматичні перевірки

```bash
npm test
```

**100 тестів у 11 файлах**: 52 перевірки з попереднього ДЗ, 5 — favicon, 8 — Cookies/тема, 10 — JWT, 13 — інтерактивне демо й навігація, 12 — спільний адаптивний header. Використовуються Vitest та Supertest. GitHub Actions CI повторює тести на Node.js 24 для Pull Requests до `main`.

## Архітектура

```text
src/
├── __test__/       # Vitest / Supertest
├── config/         # JWT і тема
├── controllers/    # REST, cookies, auth
├── data/           # Дані в пам'яті
├── middlewares/    # JWT, логування, сесії, валідація
├── public/         # favicon.ico, favicon.svg, CSS, JS
├── routes/         # API і сторінки Demo
├── utils/          # Допоміжні функції
├── views/          # PUG і EJS
└── server.mjs      # Конфігурація Express і запуск
```

## Обмеження й безпека

- Навчальний проєкт: користувачі, статті та облікові записи зберігаються **в пам'яті** й зникають після перезапуску сервера. Для сесій використовується стандартне сховище Express, не призначене для production.
- JWT підписується HS256, перевіряється middleware і має строк дії 1 годину. Паролі зберігаються лише у вигляді bcrypt-хешів.
- Cookies налаштовані з `HttpOnly` та `SameSite=Lax`; у production-режимі використовується `Secure`. Для реального продукту також потрібні HTTPS, захист від CSRF, rate limiting, постійне сховище та керування секретами.
- Попередні навчальні `Basic`-маршрути (`/users/strict`, `/articles/strict`) **не є** JWT-автентифікацією і залишені для сумісності з попереднім ДЗ.

---

Copyright © 2026 Andrii Dolzhenko.
