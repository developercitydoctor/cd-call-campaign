/**
 * Global estimated response time (minutes). Random integer between 3 and 5,
 * fixed for the session so it shows the same everywhere.
 */
export const ESTIMATED_RESPONSE_MINS = 3 + Math.floor(Math.random() * 3);

/** Display label e.g. "4 mins" */
export const ESTIMATED_RESPONSE_LABEL = `${ESTIMATED_RESPONSE_MINS} mins`;
