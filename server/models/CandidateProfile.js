import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: String, company: String,
  startDate: Date, endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new mongoose.Schema({
  degree: String, school: String, year: Number,
});

const projectSchema = new mongoose.Schema({
  name: String, description: String,
  url: String, techStack: [String],
});

const candidateProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  headline: String,
  bio: { type: String, maxlength: 500 },
  skills: [String],
  experienceYears: Number,
  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  desiredSalaryMin: Number,
  desiredSalaryMax: Number,
  desiredEquity: { type: Boolean, default: false },
  workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
  location: String,
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  resumeUrl: String,
  resumePublicId: String,
  profileViews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  featuredUntil: Date,
  visibility: { type: String, enum: ['public', 'private', 'recruiters'], default: 'public' },
  completionScore: { type: Number, default: 0 },
}, { timestamps: true });

// Static: calculate profile completion score
candidateProfileSchema.statics.calculateCompletion = function (profile) {
  let score = 0;
  if (profile.headline) score += 10;
  if (profile.bio) score += 10;
  if (profile.skills?.length >= 3) score += 15;
  if (profile.experience?.length >= 1) score += 15;
  if (profile.education?.length >= 1) score += 10;
  if (profile.resumeUrl) score += 20;
  if (profile.linkedinUrl) score += 10;
  if (profile.portfolioUrl || profile.githubUrl) score += 10;
  return score;
};

export default mongoose.model('CandidateProfile', candidateProfileSchema);
