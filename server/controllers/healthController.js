export const getHealthStatus = (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabNation API is running.',
    timestamp: new Date().toISOString(),
  });
};

