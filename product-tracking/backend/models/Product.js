import mongoose from 'mongoose';

const gpsSchema = new mongoose.Schema(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    datetime: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true },
    senderCertNo: { type: String, required: true },
    receiverCertNo: { type: String, required: true },
    gpsHistory: [gpsSchema],
    status: { type: String, default: 'In Progress' },
    blockchainHash: { type: String, default: '' },
    blockchainTx: { type: String, default: '' },
    qrCode: { type: String, default: '' }, // Store QR code as base64 data URL
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;