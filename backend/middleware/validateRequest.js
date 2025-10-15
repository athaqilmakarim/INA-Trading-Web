const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const data = req[property];
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.errors
      .map((issue) => issue.message)
      .join(', ');

    return res.status(400).json({
      error: message || 'Invalid request payload'
    });
  }

  req[property] = result.data;
  next();
};

module.exports = { validateRequest };
