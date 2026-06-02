"use strict";

const https = require("https");
const http = require("http");
const { URL } = require("url");

const DEFAULT_HEADERS = { "Content-Type": "application/json" };

/**
 * DataDumper — lightweight HTTP client for making API requests.
 */
class DataDumper {
  /**
   * @param {string} url - Base URL for requests.
   * @param {string} [method='GET'] - HTTP method.
   * @param {Object} [headers] - Default request headers.
   */
  constructor(url, method = "GET", headers = DEFAULT_HEADERS) {
    if (!url || typeof url !== "string") {
      throw new TypeError("DataDumper: `url` must be a non-empty string.");
    }
    this.url = url;
    this.method = method.toUpperCase();
    this.headers = headers;
  }

  /**
   * Make an HTTP/HTTPS request.
   *
   * @param {Object}  [options={}]            - Per-request overrides.
   * @param {string}  [options.url]           - Override the base URL.
   * @param {string}  [options.method]        - Override the HTTP method.
   * @param {Object}  [options.body]          - Request body (will be JSON-stringified).
   * @param {Object}  [options.headers]       - Override headers.
   * @param {boolean} [rawResponse=false]     - If true, resolves with the raw body string.
   * @returns {Promise<{body: any, error: Error|null, statusCode: number}>}
   */
  async syncAPIRequest(options = {}, rawResponse = false) {
    const url = options.url || this.url;
    const method = (options.method || this.method).toUpperCase();
    const headers = options.headers || this.headers;
    const body = options.body ? JSON.stringify(options.body) : undefined;

    if (body) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    return new Promise((resolve) => {
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        return resolve({
          body: null,
          error: new Error(`Invalid URL: ${url}`),
          statusCode: null,
        });
      }

      const transport = parsed.protocol === "https:" ? https : http;
      const reqOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method,
        headers,
      };

      const req = transport.request(reqOptions, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");

          if (rawResponse) {
            return resolve({
              body: raw,
              error: null,
              statusCode: res.statusCode,
            });
          }

          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }

          resolve({ body: parsed, error: null, statusCode: res.statusCode });
        });
      });

      req.on("error", (error) => {
        resolve({ body: null, error, statusCode: null });
      });

      if (body) req.write(body);
      req.end();
    });
  }
}

module.exports = DataDumper;
