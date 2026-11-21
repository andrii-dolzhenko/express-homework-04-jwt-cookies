# Express.js · Homework 04 · Static Files, Cookies & JWT

Local preparation based on the presentation's assignment slide (45/45). The final
LMS requirements and lecture recording have not been published/reviewed yet.

## Baseline

This is a standalone copy of the completed Express HW03 project, preserving its
REST CRUD API, PUG/EJS server-rendered pages, middleware, sessions, and 52 tests.
The HW04 implementation will be introduced in three isolated feature branches:

1. `feature/hw04-static-favicon` — `/favicon.ico` and all four HTML templates.
2. `feature/hw04-theme-cookies` — Light/Dark settings using `cookie-parser`.
3. `feature/hw04-jwt-auth` — register/login, JWT, protected route, HttpOnly cookie.

## Local baseline commands

```bash
npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile
npm test
npm start
```

Node.js 24 and Yarn Classic 1.22.22 are expected. The server runs at port 3000.
These are **preliminary** requirements until checked against the official LMS
and the lesson recording. Do not submit this baseline as the final homework.
