// OWNER: BE-2
// PURPOSE: Transactional sequence counter generator (SUB-00001, INV-00001)

/**
 * Increments Counter row inside the given Prisma transaction and returns padded sequence string
 * @param {Object} tx - Prisma transaction client
 * @param {string} key - e.g. "SUB" or "INV"
 * @param {string} prefix - e.g. "SUB" or "INV"
 * @param {number} [padLength=5]
 * @returns {Promise<string>} e.g. "SUB-00001"
 */
async function nextNumber(tx, key, prefix, padLength = 5) {
  const counter = await tx.counter.upsert({
    where: { key },
    update: {
      value: { increment: 1 },
    },
    create: {
      key,
      value: 1,
    },
  });

  const padded = String(counter.value).padStart(padLength, '0');
  return `${prefix}-${padded}`;
}

module.exports = {
  nextNumber,
};
