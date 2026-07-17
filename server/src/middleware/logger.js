// Request logging middleware
export default function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const method = req.method.padEnd(6);
    const status = res.statusCode;
    const icon = status >= 400 ? "⚠️" : "✅";
    console.log(`${icon} ${method} ${req.originalUrl} → ${status} (${ms}ms)`);
  });
  next();
}
