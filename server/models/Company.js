import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  logo: String,
  coverImage: String,
  website: String,
  description: String,
  mission: String,
  industry: String,
  stage: {
    type: String,
    enum: ['pre-seed','seed','series-a','series-b','series-c','series-d+','unicorn','bootstrapped'],
  },
  teamSize: { type: String, enum: ['1-10','11-50','51-200','201-500','500+'] },
  hqLocation: String,
  remotePolicy: { type: String, enum: ['remote','hybrid','onsite'] },
  techStack: [String],
  perks: [String],
  linkedinUrl: String,
  twitterUrl: String,
  foundedYear: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from name
companySchema.pre('validate', function (next) {
  if (this.isNew && this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

export default mongoose.model('Company', companySchema);
