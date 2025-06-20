import { connectToDatabase } from '../src/utils/db.js';
import { corsMiddleware } from '../src/utils/vercelMiddleware.js';

export default async function handler(req, res) {
  if (corsMiddleware(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'EOCS Platform Backend is running'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
} 