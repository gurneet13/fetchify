# resolvo

> A zero-dependency, promise-based HTTP/HTTPS client for Node.js.

[![npm version](https://img.shields.io/npm/v/resolvo.svg)](https://www.npmjs.com/package/resolvo)
[![license](https://img.shields.io/npm/l/resolvo.svg)](LICENSE)

---

## Why?

`resolvo` is a lightweight wrapper around Node's built-in `http`/`https` modules. No heavy dependencies, no `axios`, no `node-fetch` — just a clean class-based API that returns structured `{ body, error, statusCode }` objects so you never have to `try/catch` a network call again.

---

## Installation

```bash
npm install resolvo
```

Requires **Node.js ≥ 14**.

---

## Quick Start

```js
const ResolvoClient = require("resolvo");

const client = new ResolvoClient("https://jsonplaceholder.typicode.com");

(async () => {
  const { body, error, statusCode } = await client.syncAPIRequest({
    url: "https://jsonplaceholder.typicode.com/posts/1",
  });

  if (error) {
    console.error("Request failed:", error.message);
  } else {
    console.log(`[${statusCode}]`, body);
  }
})();
```

---

## API

### `new ResolvoClient(url, [method], [headers])`

Creates a reusable client instance with default request parameters.

| Parameter | Type   | Default                                  | Description                                 |
| --------- | ------ | ---------------------------------------- | ------------------------------------------- |
| `url`     | string | **required**                             | Base URL used when no override is provided. |
| `method`  | string | `'GET'`                                  | Default HTTP method.                        |
| `headers` | Object | `{ 'Content-Type': 'application/json' }` | Default request headers.                    |

```js
const client = new ResolvoClient("https://api.example.com", "POST", {
  "Content-Type": "application/json",
  Authorization: "Bearer TOKEN",
});
```

---

### `client.syncAPIRequest([options], [rawResponse])`

Makes an HTTP/HTTPS request and resolves — never rejects.

```js
const result = await client.syncAPIRequest(options, rawResponse);
```

#### `options` _(Object, optional)_

All fields are optional and override the constructor defaults for this single call.

| Field     | Type   | Description                                |
| --------- | ------ | ------------------------------------------ |
| `url`     | string | Full URL to request.                       |
| `method`  | string | HTTP method (`GET`, `POST`, `PUT`, etc.).  |
| `body`    | Object | Request body. Will be `JSON.stringify`-ed. |
| `headers` | Object | Request headers.                           |

#### `rawResponse` _(boolean, default `false`)_

When `true`, the `body` field in the resolved value is the raw response string rather than a parsed object.

#### Return value

Always resolves with:

```js
{
  body: Object | string | null,  // Parsed JSON, raw string, or null on network error
  error: Error | null,           // Network-level error, null on success
  statusCode: number | null      // HTTP status code, null on network error
}
```

> The method always **resolves** (never rejects). Check `error` and `statusCode` to handle failures.

---

## Examples

### GET request

```js
const client = new ResolvoClient("https://api.example.com");

const { body, statusCode } = await client.syncAPIRequest({
  url: "https://api.example.com/users/42",
});

console.log(statusCode, body);
```

### POST request with a body

```js
const client = new ResolvoClient("https://api.example.com", "POST");

const { body, error } = await client.syncAPIRequest({
  body: { name: "Alice", role: "admin" },
});

if (!error) console.log("Created:", body);
```

### Override the method per-call

```js
const client = new ResolvoClient("https://api.example.com");

// Default is GET, but override for this call:
const { body } = await client.syncAPIRequest({
  url: "https://api.example.com/items/7",
  method: "DELETE",
});
```

### Read the raw response string

```js
const { body } = await client.syncAPIRequest({}, true);
console.log(typeof body); // 'string'
```

---

## Changelog

### 2.x (current)

- Removed `request` dependency — now uses Node built-in `http`/`https`.
- Response object now includes `statusCode`.
- Constructor validates the `url` argument.
- Fixed typo: `actucalResponse` → `rawResponse`.
- All non-200 responses still resolve (check `statusCode`).

### 1.x

- Initial release using the `request` package.

---

## License

MITs
