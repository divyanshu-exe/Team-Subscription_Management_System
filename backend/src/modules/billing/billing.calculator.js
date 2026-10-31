// OWNER: BE-2
// PURPOSE: Pure billing math: line calculations, proportional discount distribution, and invoice totals

/**
 * Calculates line base price and tax amount
 * @param {Object} params
 * @param {number} params.quantity
 * @param {number} params.unitPrice
 * @param {Object} [params.tax]
 * @returns {{ base: number, taxAmount: number }}
 */
function calcLine({ quantity, unitPrice, tax }) {
  const qty = Number(quantity || 0);
  const price = Number(unitPrice || 0);
  const base = Number((qty * price).toFixed(2));

  let taxAmount = 0;
  if (tax && tax.value !== undefined) {
    const taxVal = Number(tax.value);
    if (tax.type === 'PERCENT') {
      taxAmount = Number(((base * taxVal) / 100).toFixed(2));
    } else if (tax.type === 'FIXED') {
      taxAmount = Number(taxVal.toFixed(2));
    }
  }

  return { base, taxAmount };
}

/**
 * Applies a discount across lines and returns an array of per-line discount amounts
 * @param {Object} params
 * @param {Array} params.lines - array of { productId, quantity, unitPrice, base? }
 * @param {Object} [params.discount] - { type, value, appliesTo, productIds? }
 * @returns {number[]} array of discount amounts corresponding to each input line
 */
function applyDiscount({ lines, discount }) {
  if (!discount || !lines || lines.length === 0) {
    return (lines || []).map(() => 0);
  }

  const discountVal = Number(discount.value || 0);
  const allowedProductIds = Array.isArray(discount.productIds)
    ? discount.productIds.map(Number)
    : [];

  const lineBases = lines.map((line) => {
    if (line.base !== undefined) return Number(line.base);
    return Number((Number(line.quantity || 0) * Number(line.unitPrice || 0)).toFixed(2));
  });

  const isEligible = lines.map((line) => {
    if (discount.appliesTo === 'SUBSCRIPTION') return true;
    if (discount.appliesTo === 'PRODUCTS') {
      return allowedProductIds.includes(Number(line.productId));
    }
    return false;
  });

  if (discount.type === 'PERCENT') {
    return lineBases.map((base, idx) => {
      if (!isEligible[idx]) return 0;
      const amount = Number(((base * discountVal) / 100).toFixed(2));
      return Math.min(base, amount);
    });
  }

  if (discount.type === 'FIXED') {
    const totalEligibleBase = lineBases.reduce(
      (sum, base, idx) => (isEligible[idx] ? sum + base : sum),
      0
    );

    if (totalEligibleBase <= 0) {
      return lines.map(() => 0);
    }

    const cappedDiscount = Math.min(discountVal, totalEligibleBase);
    let remainingDiscountToDistribute = cappedDiscount;
    const eligibleIndices = lineBases
      .map((_, idx) => idx)
      .filter((idx) => isEligible[idx]);

    const result = lines.map(() => 0);

    eligibleIndices.forEach((idx, i) => {
      const isLast = i === eligibleIndices.length - 1;
      if (isLast) {
        result[idx] = Math.min(lineBases[idx], Number(remainingDiscountToDistribute.toFixed(2)));
      } else {
        const ratio = lineBases[idx] / totalEligibleBase;
        const allocated = Math.min(
          lineBases[idx],
          Number((cappedDiscount * ratio).toFixed(2))
        );
        result[idx] = allocated;
        remainingDiscountToDistribute -= allocated;
      }
    });

    return result;
  }

  return lines.map(() => 0);
}

/**
 * Computes invoice totals where tax is calculated AFTER discount
 * @param {Array} lines - array of { quantity, unitPrice, tax, discountAmount }
 * @returns {{ subtotal: number, discountTotal: number, taxTotal: number, total: number }}
 */
function calcInvoiceTotals(lines) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const base =
      line.base !== undefined
        ? Number(line.base)
        : Number((Number(line.quantity || 0) * Number(line.unitPrice || 0)).toFixed(2));

    const lineDiscount = Math.min(base, Number(Number(line.discountAmount || 0).toFixed(2)));
    const taxableBase = Math.max(0, Number((base - lineDiscount).toFixed(2)));

    let lineTax = 0;
    if (line.tax && line.tax.value !== undefined) {
      const taxVal = Number(line.tax.value);
      if (line.tax.type === 'PERCENT') {
        lineTax = Number(((taxableBase * taxVal) / 100).toFixed(2));
      } else if (line.tax.type === 'FIXED') {
        lineTax = Number(taxVal.toFixed(2));
      }
    }

    subtotal = Number((subtotal + base).toFixed(2));
    discountTotal = Number((discountTotal + lineDiscount).toFixed(2));
    taxTotal = Number((taxTotal + lineTax).toFixed(2));
  }

  const total = Number((subtotal - discountTotal + taxTotal).toFixed(2));

  return {
    subtotal,
    discountTotal,
    taxTotal,
    total,
  };
}

module.exports = {
  calcLine,
  applyDiscount,
  calcInvoiceTotals,
};