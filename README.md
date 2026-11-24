# Express.js · Homework 04 · JWT · Cookies

**Express Studio E4** is an Express 5 application that combines server-rendered PUG and EJS pages, REST endpoints, persistent Light/Dark preferences, and JWT-based authentication. An interactive dashboard demonstrates the full workflow against the running Express backend.

Built with Node.js 24. All application records and demo accounts are stored in memory.

## Features

- **Static assets:** Express serves shared styles, browser scripts, and `favicon.ico` at `/favicon.ico`. Both PUG and EJS templates reference the icon.
- **Cookie-based preferences:** The Light/Dark theme is stored as `hw04.theme` via `cookie-parser` and applied consistently across the dashboard and server-rendered pages.
- **JWT authentication:** Register, sign in, inspect the protected current-user endpoint, and sign out. Signed JWTs are stored in an `HttpOnly` cookie (`hw04.token`); Bearer authentication is supported for API requests.
- **Password handling:** `bcryptjs` password hashes, input validation, and case-insensitive duplicate-username prevention.
- **Existing Express API:** User/article CRUD, request logging, validation, educational authorization examples, and a server-side session counter.
- **Responsive UI:** Consistent navigation and theme controls across Demo, Users, and Articles, including mobile layouts.

## Technology

Node.js 24 · Express 5 · PUG · EJS · cookie-parser · jsonwebtoken · bcryptjs · express-session · Vitest · Supertest

## Installation and local development

**Prerequisites:** Node.js 24 and npm. Dependencies are locked with Yarn Classic 1.22.22 (`yarn.lock`).

```bash
git clone https://github.com/andrii-dolzhenko/express-homework-04-jwt-cookies.git
cd express-homework-04-jwt-cookies

npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile
npm test
JWT_SECRET="$(openssl rand -hex 32)" npm start
```

Open **http://localhost:3000/demo**. Additional pages: [Users](http://localhost:3000/users) (PUG) and [Articles](http://localhost:3000/articles) (EJS).

The server currently listens on port `3000`. The command above generates a JWT signing secret for the current server process. Without `JWT_SECRET`, the application generates a random secret at startup; previously issued JWTs become invalid after restart.

For local HTTP testing, do not set `NODE_ENV=production`: production mode marks JWT and theme cookies as `Secure`, requiring HTTPS.

## Interactive demo

The `/demo` page runs against the real local Express application, not mocked API responses. It supports:

1. Switching Light/Dark themes and verifying the preference survives reloads and navigation.
2. Registering a demo account or signing in again.
3. Calling `GET /auth/me` to inspect authenticated (`200`) and unauthenticated (`401`) responses.
4. Signing out, verifying that access is denied, and signing back in.
5. Using the separate `express-session` visit counter.
6. Opening PUG/EJS pages and the navigable favicon preview at `/demo/icon`.

Usernames accept 3–32 letters, digits, underscores, or hyphens. Passwords must be 8–72 characters long.

**Preview:** [Open the static GitHub Pages preview](https://andrii-dolzhenko.github.io/express-homework-04-jwt-cookies/). It contains Express-rendered pages, responsive navigation, and browser-only theme appearance. Registration, JWT, cookie persistence, server sessions, and API mutations are deliberately disabled in the preview. Run `npm start` locally to test those features with the real backend.

## Routes

### Pages and static files

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Original plain-text root response |
| `GET` | `/demo` | Interactive PUG dashboard |
| `GET` | `/demo/icon` | Favicon preview |
| `GET` | `/users` | PUG directory when requesting HTML; otherwise JSON |
| `GET` | `/users/:userId` | PUG details or JSON |
| `GET` | `/articles` | EJS directory when requesting HTML; otherwise JSON |
| `GET` | `/articles/:articleId` | EJS details or JSON |
| `GET` | `/favicon.ico` | ICO favicon |
| `GET` | `/assets/favicon.svg` | SVG favicon |
| `GET` | `/assets/css/styles.css` | Shared responsive styles |
| `GET` | `/assets/css/demo.css` | Dashboard styles |
| `GET` | `/assets/js/demo.js` | Dashboard JavaScript |

### Authentication and preferences

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/theme` | Read the selected theme (JSON) |
| `POST` | `/theme` | Save `light` or `dark`; JSON `200` or form redirect `303` |
| `POST` | `/auth/register` | Register, hash password, and set JWT cookie (`201`) |
| `POST` | `/auth/login` | Verify credentials and set JWT cookie (`200`) |
| `GET` | `/auth/me` | JWT-protected account endpoint (`200` or `401`) |
| `POST` | `/auth/logout` | Clear JWT cookie (`204`) |

### REST resources and sessions

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create user (`201`) |
| `PUT` | `/users/:userId` | Update user |
| `DELETE` | `/users/:userId` | Delete user (`204`) |
| `POST` | `/articles` | Create article (`201`) |
| `PUT` | `/articles/:articleId` | Update article |
| `DELETE` | `/articles/:articleId` | Delete article (`204`) |
| `POST` | `/users/strict` | Earlier educational Basic-header authentication example |
| `POST` | `/articles/strict` | Earlier educational Basic-header authentication example |
| `GET` | `/session` | Increment session visit counter |
| `DELETE` | `/session` | Reset current session (`204`) |

The Basic-header examples are separate from JWT authentication and remain available for compatibility with earlier exercises.

## Example: authenticate using cookies

Start the server in another terminal, then run:

```bash
COOKIE_JAR="$(mktemp)"
TEST_USER="student_$(date +%s)"

curl -i -c "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"SafePass123\"}" \
  http://localhost:3000/auth/register

# Authenticated request (HTTP 200)
curl -i -b "$COOKIE_JAR" http://localhost:3000/auth/me

# Sign out; the protected endpoint will then return HTTP 401
curl -i -X POST -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  http://localhost:3000/auth/logout
curl -i -b "$COOKIE_JAR" http://localhost:3000/auth/me

rm -f "$COOKIE_JAR"
```

## Testing and CI

```bash
npm test
```

**100 automated tests across 11 files:** 52 existing Express tests, 5 favicon tests, 8 theme/cookie tests, 10 JWT tests, 13 interactive demo tests, and 12 shared-header tests. Vitest and Supertest cover both API responses and server-rendered HTML.

GitHub Actions runs syntax checks and the complete test suite on Node.js 24 for pushes and pull requests targeting `main`.

## Project structure

```text
src/
├── __test__/       # Vitest and Supertest
├── config/         # JWT and theme settings
├── controllers/    # Resources, preferences, and authentication
├── data/           # In-memory stores
├── middlewares/    # Auth, validation, logging, sessions
├── public/         # Favicon, CSS, browser JavaScript
├── routes/         # API and page routes
├── utils/          # Shared helpers
├── views/          # PUG and EJS templates
└── server.mjs      # Express setup and HTTP server
```

## Security and limitations

- This is an educational application, **not a production authentication service**. Accounts and other in-memory records are lost on restart; Express's default session store is not production-ready.
- JWTs use HS256 signatures, issuer validation, and a one-hour expiration. Passwords are stored as bcrypt hashes, not plaintext.
- Authentication and theme cookies use `HttpOnly` and `SameSite=Lax`. Their `Secure` flag is enabled in production mode.
- A production deployment would additionally require HTTPS, durable account/session storage, CSRF protection, rate limiting, and managed secrets. Do not commit `JWT_SECRET` or other credentials.

---

Copyright © 2026 Andrii Dolzhenko.
