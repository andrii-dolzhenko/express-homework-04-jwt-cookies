# Express.js · Homework 04 · Static Files, Cookies & JWT

An Express 5 application with server-rendered PUG and EJS pages, a persistent
Light/Dark theme via cookies, JWT registration/login, and a protected endpoint.
This is a **preliminary HW04 implementation** based on presentation slide 45.
It will be checked against the Monday lecture and official LMS specification.

## Features

- Four server-rendered HTML pages: PUG users, EJS articles (list + details)
- Shared responsive CSS and `/favicon.ico` on every page (original SVG retained)
- User preference cookie `hw04.theme` (`light` or `dark`) via `cookie-parser`
- JWT-based account registration/login and authentication middleware
- JWT stored in an HttpOnly cookie `hw04.token`, with an optional Bearer header
- Passwords hashed with `bcryptjs`; user accounts kept in memory
- Existing REST CRUD, logging, validation, article access checks, and sessions

## Requirements / install / run

Node.js 24, Yarn Classic 1.22.22, Express 5. This coursework project is for
local development, not public production hosting.

```bash
npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile
npm test
npm start
```

Open <http://localhost:3000/users> and <http://localhost:3000/articles>. Use the
Light/Dark buttons to store your preferred appearance. The chosen theme persists
across pages. Run a second terminal for the API commands below.

To keep JWTs valid across server restarts, set a local secret before running:

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
npm start
```

Without `JWT_SECRET`, a secure random in-process secret is generated, so tokens
are invalidated when the server restarts. Never commit an actual secret.

## Routes

| Method | Route | Response / purpose |
| --- | --- | --- |
| GET | `/` | Existing plain-text root response |
| GET | `/users` | PUG HTML with `Accept: text/html`, otherwise JSON user list |
| GET | `/users/:userId` | PUG user detail page or JSON user object |
| POST | `/users` | Create user, JSON, status 201 |
| PUT | `/users/:userId` | Update user, JSON |
| DELETE | `/users/:userId` | Remove user, 204 |
| POST | `/users/strict` | Existing demo Basic auth route |
| GET | `/articles` | EJS HTML with `Accept: text/html`, otherwise JSON article list |
| GET | `/articles/:articleId` | EJS article detail page or JSON object |
| POST | `/articles` | Create article, JSON, status 201 |
| PUT | `/articles/:articleId` | Update article, JSON |
| DELETE | `/articles/:articleId` | Remove article, 204 |
| POST | `/articles/strict` | Existing demo Basic auth route |
| GET | `/session` | Increment session visit count |
| DELETE | `/session` | Delete current session, 204 |
| GET | `/theme` | Current selected theme as JSON |
| POST | `/theme` | Save `light`/`dark` cookie; JSON 200 or HTML form redirect 303 |
| POST | `/auth/register` | Register username/password; hash password, set JWT cookie, 201 |
| POST | `/auth/login` | Verify credentials; set JWT cookie, 200 |
| GET | `/auth/me` | JWT-protected current account, 200 or 401 |
| POST | `/auth/logout` | Clear JWT cookie, 204 |
| GET | `/favicon.ico` | ICO icon served from `src/public/` |
| GET | `/assets/css/styles.css` | Responsive stylesheet |
| GET | `/assets/favicon.svg` | Preserved SVG favicon |

All data stores use in-memory Maps. Records and registered accounts are lost after
a process restart. The application retains the previous HW03 session cookie
name (`hw03.sid`) to preserve its original regression tests.

## API examples

```bash
# Create an account and keep its JWT cookie
curl -i -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"username":"student1","password":"SafePass123!"}' \
  http://localhost:3000/auth/register

# Authenticated request using the stored cookie
curl -i -b cookies.txt http://localhost:3000/auth/me

# Save and read a preferred theme
curl -i -c theme-cookies.txt -H 'Content-Type: application/json' \
  -H 'Accept: application/json' -d '{"theme":"dark"}' \
  http://localhost:3000/theme
curl -i -b theme-cookies.txt http://localhost:3000/theme

# Logout
curl -i -X POST -b cookies.txt http://localhost:3000/auth/logout
```

## Security / limitations

- Passwords are hashed, and the JWT is signed with HS256 and expires after 1 hour.
- Cookies use HttpOnly and SameSite=Lax. `Secure` is enabled in production mode;
  localhost HTTP uses `Secure=false`.
- Cookie auth on state-changing routes needs CSRF mitigation in production.
- No database, password reset, rate limiting, or production session store.
- The previous demo `Basic` auth remains separate from the new JWT mechanism.
- The public GitHub Pages preview from HW03 does not run this backend; HW04 has
  **no published live backend or Pages demo yet**.

## Automated tests

```bash
npm test
```

Expected preliminary suite: 52 existing HW03 tests + 5 favicon + 8 theme +
10 JWT tests = **75 tests**. Tests use Vitest and Supertest.

## Structure

```text
src/
├── __test__/          # Existing tests + HW04 features
├── config/            # JWT and theme configuration
├── controllers/       # REST CRUD, auth, theme handlers
├── data/              # Users, articles, in-memory accounts
├── middlewares/       # Logging, validation, sessions, JWT, theme
├── public/            # favicon.ico, favicon.svg, CSS
├── routes/            # Users, articles, auth, theme, session
├── utils/             # Accept: text/html detection
├── views/             # PUG user pages and EJS article pages
└── server.mjs         # Express setup and server
```

---

Copyright © 2026 Andrii Dolzhenko.

## Local interactive demo (optional)

Start the Express backend (`npm start`) and open **http://localhost:3000/demo**.
The interactive dashboard calls the actual backend; it does not simulate JWT.

1. Switch Light/Dark and open Users (PUG) or Articles (EJS) to confirm the cookie.
2. Register a unique username (3–32 letters, numbers, `_` or `-`) with a password
   8–72 characters long. The server stores only a bcrypt password hash.
3. Check the protected `/auth/me` endpoint: it responds `200` when signed in.
4. Sign out and check again: it responds `401` without a JWT.
5. Switch to Sign in to repeat the flow and optionally test the HW03 session counter.

GET `/demo` renders a PUG dashboard. Static assets are served at
`/assets/js/demo.js` and `/assets/css/demo.css`. The dashboard uses
`fetch` with same-origin cookies and never reads the HttpOnly JWT token.

**Note:** This is an **optional local teaching demo**, not an additional
requirement from the presentation. GitHub Pages cannot execute Express,
so a Pages-hosted copy would only be a static visual preview.


## Demo navigation

The **Express Studio** logo and the **Demo** link on all four PUG/EJS user/article
pages return to `/demo`. The user and article list pages also show a visible
"Back to demo" link. The **Site icon** tile on `/demo` opens `/demo/icon`, a
navigable PUG preview of the real `/favicon.ico` file. The original favicon
remains directly available at `/favicon.ico`, as required by the assignment.


## Unified responsive header

All six server-rendered pages (Demo, Site icon, two PUG pages, two EJS pages)
use the same header: logo on the left, **Demo / Users / Articles** centered,
and Light/Dark controls on the right. At medium widths the navigation moves to
a centered second row; on narrow mobile screens the header stacks into three
consistent rows. All theme buttons write the same validated cookie, including
on `/demo` and `/demo/icon` (with safe local form redirects). The inline theme
control on the Demo dashboard also updates header button state without a reload.
