// Structured logger for server code, built on console so it needs no
// dependency and runs in every runtime (Node, Edge, instrumentation).
//
// In production each entry is a single JSON line on stdout/stderr, which is
// what CloudWatch, Loki, Datadog and friends ingest and index. In development
// it prints a short human-readable line instead.
//
//   logger.info("User signed in", { userId });
//   logger.error("Upload failed", { err, key });
//
// Put the error under `err` — Error instances (and their `cause` chain) are
// serialized with name, message and stack, which JSON.stringify would drop.
//
// LOG_LEVEL  — debug | info | warn | error (default: info in prod, debug in dev)
// LOG_FORMAT — json | pretty (default: json in prod, pretty in dev)

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const isProd = process.env.NODE_ENV === "production";

const minLevel =
  LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ??
  (isProd ? LEVELS.info : LEVELS.debug);

const pretty = process.env.LOG_FORMAT
  ? process.env.LOG_FORMAT === "pretty"
  : !isProd;

// console.debug/console.log are stripped from production builds by
// `compiler.removeConsole` in next.config.mjs, so every level goes through one
// of the methods that config keeps.
const WRITERS = {
  debug: console.info,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

function serializeError(err, depth = 0) {
  if (!(err instanceof Error)) return err;
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err.digest && { digest: err.digest }),
    ...(err.code && { code: err.code }),
    ...(err.cause !== undefined &&
      depth < 3 && { cause: serializeError(err.cause, depth + 1) }),
  };
}

function stringify(entry) {
  const seen = new WeakSet();
  return JSON.stringify(entry, (_, value) => {
    if (value instanceof Error) return serializeError(value);
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });
}

function write(level, msg, context = {}) {
  if (LEVELS[level] < minLevel) return;

  const out = WRITERS[level];

  if (pretty) {
    const { err, ...rest } = context;
    const time = new Date().toISOString().slice(11, 23);
    const extra = Object.keys(rest).length ? ` ${stringify(rest)}` : "";
    out(`${time} ${level.toUpperCase().padEnd(5)} ${msg}${extra}`);
    if (err) out(err);
    return;
  }

  out(
    stringify({
      time: new Date().toISOString(),
      level,
      msg,
      ...context,
    }),
  );
}

export const logger = {
  debug: (msg, context) => write("debug", msg, context),
  info: (msg, context) => write("info", msg, context),
  warn: (msg, context) => write("warn", msg, context),
  error: (msg, context) => write("error", msg, context),
};
