import CandidateProfile from '../models/CandidateProfile.js';
import User from '../models/User.js';
import { Application } from '../models/index.js';
import Job from '../models/Job.js';
import cloudinary from '../config/cloudinary.js';

// ── Get My Profile ────────────────────────────────────────
export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id }).populate('user', 'name email avatar');
    if (!profile) profile = await CandidateProfile.create({ user: req.user._id });
    res.json({ profile });
  } catch (err) { next(err); }
};

// ── Create or Update Profile ──────────────────────────────
export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['headline','bio','skills','experienceYears','experience','education','projects','desiredSalaryMin','desiredSalaryMax','desiredEquity','workMode','location','linkedinUrl','githubUrl','portfolioUrl','visibility'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    let profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    profile.completionScore = CandidateProfile.calculateCompletion(profile);
    await profile.save();

    res.json({ profile, message: 'Profile updated successfully.' });
  } catch (err) { next(err); }
};

// ── Upload Resume ─────────────────────────────────────────
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.cloudinaryResult) return res.status(400).json({ message: 'Upload failed.' });
    const profile = await CandidateProfile.findOne({ user: req.user._id });

    // Delete old file from Cloudinary
    if (profile?.resumePublicId) {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    }

    const updated = await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl: req.cloudinaryResult.secure_url, resumePublicId: req.cloudinaryResult.public_id },
      { new: true, upsert: true }
    );
    res.json({ resumeUrl: updated.resumeUrl, message: 'Resume uploaded.' });
  } catch (err) { next(err); }
};

// ── Get Public Profile ────────────────────────────────────
export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.params.userId }).populate('user', 'name email avatar createdAt');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    if (profile.visibility === 'private') return res.status(403).json({ message: 'This profile is private.' });
    if (profile.visibility === 'recruiters' && req.user?.role !== 'recruiter' && req.user?.role !== 'admin')
      return res.status(403).json({ message: 'This profile is only visible to recruiters.' });

    await CandidateProfile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });
    res.json({ profile });
  } catch (err) { next(err); }
};

// ── Toggle Save Job ───────────────────────────────────────
export const toggleSaveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;
    const idx = user.savedJobs.indexOf(jobId);
    if (idx > -1) {
      user.savedJobs.splice(idx, 1);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    res.json({ saved: idx === -1, savedJobs: user.savedJobs });
  } catch (err) { next(err); }
};

// ── Get Saved Jobs ────────────────────────────────────────
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo stage' },
    });
    res.json({ savedJobs: user.savedJobs });
  } catch (err) { next(err); }
};

// ── Dashboard Data ────────────────────────────────────────
export const getDashboardData = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user._id });
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title slug').populate('company', 'name logo')
      .sort({ appliedAt: -1 }).limit(10);

    const stats = {
      totalApplied: await Application.countDocuments({ candidate: req.user._id }),
      reviewing: await Application.countDocuments({ candidate: req.user._id, status: 'reviewing' }),
      interviews: await Application.countDocuments({ candidate: req.user._id, status: 'interview' }),
      profileViews: profile?.profileViews || 0,
      savedJobsCount: req.user.savedJobs?.length || 0,
    };

    // Recommended jobs based on profile skills
    let recommendedJobs = [];
    if (profile?.skills?.length) {
      recommendedJobs = await Job.find({
        skills: { $in: profile.skills },
        status: 'active',
      }).limit(6).populate('company', 'name logo stage');
    }

    res.json({
      applications,
      stats,
      recommendedJobs,
      profileCompletion: profile?.completionScore || 0,
    });
  } catch (err) { next(err); }
};

// ── Search Candidates (for recruiters) ───────────────────
export const searchCandidates = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 18 } = req.query;
    const query = { visibility: { $ne: 'private' } };
    if (q) {
      query.$or = [
        { headline: new RegExp(q, 'i') },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { bio: new RegExp(q, 'i') },
      ];
    }
    const profiles = await CandidateProfile.find(query)
      .populate('user', 'name avatar email')
      .sort({ completionScore: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ candidates: profiles, total: profiles.length });
  } catch (err) { next(err); }
};