export const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "unknown endpoint" });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  res.status(500).json({
    message: error.message,
  });
};

export const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
};
