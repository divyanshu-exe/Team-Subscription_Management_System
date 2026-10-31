// OWNER: BE-1
// PURPOSE: Common pagination parser and wrapper

/**
 * Parses query parameters for pagination
 * @param {Object} query
 * @param {number} [defaultLimit=20]
 * @param {number} [maxLimit=100]
 */
function parsePagination(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || defaultLimit;
  if (limit < 1) limit = 1;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take,
  };
}

/**
 * Wraps items and pagination metadata into standardized response shape
 * @param {Array} items
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
function paginated(items, total, page, limit) {
  return {
    items,
    page,
    limit,
    total,
  };
}

module.exports = {
  parsePagination,
  paginated,
};