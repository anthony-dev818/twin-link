// Vercel Serverless Function
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'TwinLink API is running',
    timestamp: new Date().toISOString(),
  });
}
