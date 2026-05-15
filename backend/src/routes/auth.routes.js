// ============================================================
// ResumeIQ — Authentication Routes
// ============================================================

'use strict';

const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
