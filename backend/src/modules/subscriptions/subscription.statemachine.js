// OWNER: BE-2
// PURPOSE: Subscription status state machine and transition validator

const ALLOWED_TRANSITIONS = {
  DRAFT: ['QUOTATION', 'CLOSED'],
  QUOTATION: ['CONFIRMED', 'DRAFT', 'CLOSED'],
  CONFIRMED: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
};

/**
 * Checks whether transitioning from one state to another is legal
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
function canTransition(from, to) {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Asserts that transitioning from one state to another is legal, or throws a 400 error
 * @param {string} from
 * @param {string} to
 * @throws {Error} with status 400 if illegal
 */
function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const error = new Error(`Illegal subscription transition from '${from}' to '${to}'`);
    error.status = 400;
    throw error;
  }
}

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransition,
  assertTransition,
};