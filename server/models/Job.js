import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  responsibilities: [String],
  requirements: [String],
  skills: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salaryMin: { type: Number, required: true },
  salaryMax: { type: Number, required: true },
  equity: String,
  jobType: { type: String, enum: ['full-time','part-time','contract','internship'], default: 'full-time' },
  workMode: { type: String, enum: ['remote','hybrid','onsite'], default: 'hybrid' },
  experienceLevel: { type: String, enum: ['entry','mid','senior','lead'], default: 'mid' },
  location: String,
  status: { type: String, enum: ['draft','active','paused','closed'], default: 'active' },
  views: { type: Number, default: 0 },
  applicantCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

// Text index for search
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, expiresAt: 1 });

// Auto-generate slug
jobSchema.pre('validate', function (next) {
  if (this.isNew && this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

// Static: increment views
jobSchema.statics.incrementViews = function (jobId) {
  return this.findByIdAndUpdate(jobId, { $inc: { views: 1 } });
};

export default mongoose.model('Job', jobSchema);
