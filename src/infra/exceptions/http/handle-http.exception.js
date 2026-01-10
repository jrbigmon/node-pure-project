export const httpExceptionHandler = ({ error, req: _req, res }) => {
  console.error("HTTP Exception:", error);

  res.writeHead(error.statusCode || 500, {
    "Content-Type": "application/json",
  });
  res.end(
    JSON.stringify({
      message: error.message || "Internal Server Error",
    })
  );
};
