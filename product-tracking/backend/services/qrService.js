import QRCode from 'qrcode';

/*
 * Generates a QR code as a data URI from a given JavaScript object. The
 * object is stringified to JSON before being encoded. The resulting
 * string can be used directly as the src of an <img> element in the
 * frontend.
 */
export async function generateQRCode(dataObject) {
  const jsonString = JSON.stringify(dataObject);
  try {
    const dataUrl = await QRCode.toDataURL(jsonString);
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error.message);
    throw error;
  }
}