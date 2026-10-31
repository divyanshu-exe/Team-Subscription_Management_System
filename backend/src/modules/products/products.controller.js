// OWNER: BE-1
// PURPOSE: HTTP handlers for products and variants

const productsService = require('./products.service');
const { ok } = require('../../utils/apiResponse');

async function listProducts(req, res, next) {
  try {
    const data = await productsService.listProducts(req.query);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const data = await productsService.getProductById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = await productsService.createProduct(req.body);
    return ok(res, data, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const data = await productsService.updateProduct(req.params.id, req.body);
    return ok(res, data, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const data = await productsService.deleteProduct(req.params.id);
    return ok(res, data, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
