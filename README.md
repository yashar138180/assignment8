# Assignment 8 - Applied Web Studies Server

A small Node.js and Express 5 server for a made-up study programme. It serves a web page from
`public/`, offers several routes that return text, JSON, errors and a redirect, logs every
request and counts how many requests it has served.

## How to install and run

```bash
npm install
npm start
```

For development with automatic restart on file changes (built into Node, no extra package):

```bash
npm run dev
```

Then open http://localhost:3000. To use another port:

```bash
$env:PORT=4000; npm start
```

## File Organization

```
assignment8/
├── public/
│   ├── index.html    the browser page (one button per API route)
│   ├── styles.css    styles for the page
│   └── app.js        calls the routes with fetch() and shows status + body
├── server.js         Express app, data, middleware, routes and 404 fallback
├── package.json      "type": "module", express dependency, start and dev scripts
├── package-lock.json exact dependency versions
├── .gitignore        excludes node_modules/ and .env
└── README.md
```

## Routes

| Method and path      | Response                                              |
| -------------------- | ----------------------------------------------------- |
| GET /                | public/index.html (served by express.static)          |
| GET /hello           | plain text: Hello from Yashar's server                |
| GET /robots.txt      | plain text, Content-Type text/plain                   |
| GET /old-page        | 301 redirect to /hello                                |
| GET /api/courses     | JSON array of courses (id, title, credits)            |
| GET /api/status      | JSON { status, nodeVersion, uptimeSeconds }           |
| GET /api/headers     | JSON with the User-Agent and Accept request headers   |
| POST /api/subscribe  | 201 with JSON { "subscribed": true }                  |
| GET /api/admin       | 403 with JSON { "error": "Forbidden" }                |
| GET /api/stats       | JSON { "requestsServed": number }                     |
| anything else        | 404: JSON { "error": "Not found" } under /api, text otherwise |

## Middleware and request counting

Order in `server.js`: request logger, request counter, `express.static`, routes, 404 fallback.

The logger and the counter are registered first, before `express.static` and all routes, because
Express runs middleware in the order it is registered. In this position they see every request.
So the counter counts **all** requests: pages, static files (styles.css, app.js, favicon.ico),
API calls, 404 responses and the /api/stats request itself. I chose this because the task says
"how many requests it has served", and every one of these requests gets a response from the server.
Both middlewares call `next()` so the request continues to the next handler.

The 404 fallback is registered last with `app.use()` (no path), so it only runs when no other
route has answered and never hides a real route. I did not use `app.get('*')` because Express 5
does not accept it.

## Testing Evidence (curl --include)

```text
$ curl --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 190
ETag: W/"be-5Vt/PqUj7qc1LMluV5/q1M+TE4I"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Web Programming","credits":6},{"id":2,"title":"Databases","credits":5},{"id":3,"title":"Computer Networks","credits":5},{"id":4,"title":"Software Engineering","credits":4}]


$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}


$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}


$ curl --include http://localhost:3000/old-page
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 40
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to /hello


$ curl --include http://localhost:3000/api/unknown
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}


$ curl --include http://localhost:3000/unknown-page
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 20
ETag: W/"14-uqvetqrE8oeY4r2Xn8/CTahXnYE"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

404 - Page not found


$ curl --include http://localhost:3000/robots.txt
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 35
ETag: W/"23-AFlBEdGVlEiTRhyly9yF5dDLJM0"
Date: Mon, 16 Nov 2026 16:56:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/admin
```