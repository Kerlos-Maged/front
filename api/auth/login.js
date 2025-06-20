import { login } from '../../src/controllers/auth.js';
import { body } from 'express-validator';
import { runValidation, corsMiddleware } from '../../src/utils/vercelMiddleware.js';
import { connectToDatabase } from '../../src/utils/db.js';

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').exists().withMessage('Password is required')
];

export default async function handler(req, res) {
  if (corsMiddleware(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    await runValidation(req, res, loginValidation);
    
    return login(req, res, (error) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 