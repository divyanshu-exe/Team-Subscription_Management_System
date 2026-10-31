// OWNER: BE-1
// PURPOSE: HTTP request handlers for authentication module

const authService = require('./auth.service');
const { ok } = require('../../utils/apiResponse');

async function signup(req, res, next) {
  try {
    const data = await authService.signup(req.body);
    return ok(res, data, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return ok(res, data, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const data = await authService.forgotPassword(req.body);
    return ok(res, data, data.message);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const data = await authService.resetPassword(req.body);
    return ok(res, data, data.message);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
