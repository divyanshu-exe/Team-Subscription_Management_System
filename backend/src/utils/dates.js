// OWNER: BE-2
// PURPOSE: UTC date-only arithmetic and overdue calculations

/**
 * Normalizes any date to UTC Midnight (00:00:00.000Z)
 * @param {Date|string|number} d
 * @returns {Date}
 */
function toUtcMidnight(d) {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Adds one period to a UTC date with end-of-month clamping
 * @param {Date|string} dateInput
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} period
 * @returns {Date}
 */
function addPeriod(dateInput, period) {
  const d = toUtcMidnight(dateInput);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();

  switch (period) {
    case 'DAILY':
      return new Date(Date.UTC(year, month, day + 1));
    case 'WEEKLY':
      return new Date(Date.UTC(year, month, day + 7));
    case 'MONTHLY': {
      const targetYear = month === 11 ? year + 1 : year;
      const targetMonth = (month + 1) % 12;
      const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const clampedDay = Math.min(day, maxDaysInTargetMonth);
      return new Date(Date.UTC(targetYear, targetMonth, clampedDay));
    }
    case 'YEARLY': {
      const targetYear = year + 1;
      const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
      const clampedDay = Math.min(day, maxDaysInTargetMonth);
      return new Date(Date.UTC(targetYear, month, clampedDay));
    }
    default:
      throw new Error(`Unknown period: ${period}`);
  }
}

/**
 * Computes period end (addPeriod minus 1 day)
 * @param {Date|string} start
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} period
 * @returns {Date}
 */
function periodEnd(start, period) {
  const nextStart = addPeriod(start, period);
  return new Date(Date.UTC(nextStart.getUTCFullYear(), nextStart.getUTCMonth(), nextStart.getUTCDate() - 1));
}

/**
 * Checks if an invoice is overdue
 * @param {Object} invoice
 * @param {Date|string} [today=new Date()]
 * @returns {boolean}
 */
function isOverdue(invoice, today = new Date()) {
  if (invoice.status !== 'CONFIRMED') return false;
  const dueDateUtc = toUtcMidnight(invoice.dueDate);
  const todayUtc = toUtcMidnight(today);
  const balance = Number(invoice.total || 0) - Number(invoice.amountPaid || 0);

  return dueDateUtc.getTime() < todayUtc.getTime() && balance > 0;
}

module.exports = {
  toUtcMidnight,
  addPeriod,
  periodEnd,
  isOverdue,
};