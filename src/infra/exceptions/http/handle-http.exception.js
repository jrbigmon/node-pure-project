export const httpExceptionHandler = ({ error, req: _req, res }) => {
  console.error("HTTP Exception:", error);

  if (error.statusCode >= 400 && error.statusCode <= 499) {
    res.writeHead(error.statusCode || 400, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(error.toJSON()));
  } else {
    res.writeHead(error.statusCode || 500, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      })
    );
  }
};
