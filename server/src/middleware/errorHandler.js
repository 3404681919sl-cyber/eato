// Global error handler middleware
export default function errorHandler(err, req, res, _next) {
  console.error("❌ Server Error:", err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
