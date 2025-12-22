import mongoose from "mongoose";
const { Types } = mongoose;

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['hanabi', 'toritetsu', 'seasonal', 'other'],
    required: true
  },
  subtype: { type: String },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  created_by: { type: Types.ObjectId, ref: 'User', required: true },
  photos: [
    {
      url: { type: String, required: true },
      uploaded_by: { type: Types.ObjectId, ref: 'User', required: true },
      publicId: { type: String },
      caption: { type: String },
      created_at: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false }
    }
  ],
  shootingConditions: { type: String },
  peakSeason: { type: String },
  recommendedFocalLength: {
    type: [Number],
    enum: [0,1,2,3,4],
    default: []
  },
  tripodUsage: { type: String },
  accessTime: {
    days: { type: [Number] },
    openTime: { type: String },
    closeTime: { type: String },
    infoUrl: { type: String },
  },
  accessFees: { type: String, default:"無料"},
  accessRules: { type: String },
  reviews: [{
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, required: true }
  }],
  ratingSummary: {
    average: { type: Number },
    count: { type: Number }
  },
  seasonReports: [{
    year: { type: Number, required: true },
    date: { type: Date, required: true },
    status: {
      type: Number,
      required: true,
      default: 0
    },
    note: { type: String },
    userId: { type: Types.ObjectId, ref: 'User', required: true }
  }]
}, { timestamps: true, versionKey: false });

spotSchema.index({ location: '2dsphere' });

export default mongoose.model("Spot", spotSchema);
