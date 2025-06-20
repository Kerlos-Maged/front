import { register } from '../../src/controllers/auth.js';
import { body } from 'express-validator';
import { runValidation, corsMiddleware } from '../../src/utils/vercelMiddleware.js';
import { connectToDatabase } from '../../src/utils/db.js';

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain a special character'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
];

export default async function handler(req, res) {
  // Handle CORS
  if (corsMiddleware(req, res)) {
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Run validation
    await runValidation(req, res, registerValidation);

    // Call the register controller
    return register(req, res, (error) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 