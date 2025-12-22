const verificationSchema = new Schema({
  spot: { type: Types.ObjectId, ref: 'Spot', required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['verified', 'upvote'], required: true },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = model('Verification', verificationSchema);
