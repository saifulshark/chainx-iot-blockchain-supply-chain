/*
 * A collection of simple validation helpers for user input. These
 * functions are used to ensure that the data provided by the client
 * adheres to the expected format before being saved to the database.
 */

export function isCertNoValid(certNo) {
  return typeof certNo === 'string' && /^\d{8,10}$/.test(certNo);
}

export function isProductIdValid(id) {
  return Number.isInteger(id);
}

export function validateAddProductInput(body) {
  const { productId, senderCertNo, receiverCertNo } = body;
  if (!isProductIdValid(productId)) return false;
  if (!isCertNoValid(senderCertNo) || !isCertNoValid(receiverCertNo)) return false;
  return true;
}