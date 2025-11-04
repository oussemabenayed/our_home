import mongoose from 'mongoose';

const neighborhoodSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  amenities: {
    type: [{
      id: { type: String },
      name: { type: String },
      type: { type: String },
      lat: { type: Number },
      lng: { type: Number },
      distance: { type: Number },
      walkTime: { type: Number },
      driveTime: { type: Number },
      amenityTag: { type: String }
    }],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Index for automatic expiration
neighborhoodSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Note: propertyId index is automatically created by unique: true constraint

const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);

export default Neighborhood;