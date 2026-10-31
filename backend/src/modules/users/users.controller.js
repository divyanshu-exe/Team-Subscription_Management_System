// OWNER: BE-1
// PURPOSE: HTTP handlers for staff management routes

const usersService = require('./users.service');
const { ok } = require('../../utils/apiResponse');

async function createStaff(req, res, next) {
  try {
    const data = await usersService.createStaff(req.body);
    return ok(res, data, 'Staff created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function listStaff(req, res, next) {
  try {
    const data = await usersService.listStaff(req.query);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function updateStaff(req, res, next) {
  try {
    const data = await usersService.updateStaff(req.params.id, req.body);
    return ok(res, data, 'Staff updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createStaff,
  listStaff,
  updateStaff,
};
