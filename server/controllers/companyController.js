import Company from '../models/Company.js';
import { Review } from '../models/index.js';
import Job from '../models/Job.js';
import cloudinary from '../config/cloudinary.js';

// ── Create Company ────────────────────────────────────────
export const createCompany = async (req, res, next) => {
  try {
    const existing = await Company.findOne({ createdBy: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already have a company profile.' });
    const company = await Company.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ company });
  } catch (err) { next(err); }
};

// ── Get My Company ────────────────────────────────────────
export const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ createdBy: req.user._id });
    if (!company) return res.status(404).json({ message: 'No company profile found.' });
    res.json({ company });
  } catch (err) { next(err); }
};

// ── Update Company ────────────────────────────────────────
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { createdBy: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json({ company });
  } catch (err) { next(err); }
};

// ── Upload Logo ───────────────────────────────────────────
export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.cloudinaryResult) return res.status(400).json({ message: 'Upload failed.' });
    const company = await Company.findOneAndUpdate(
      { createdBy: req.user._id },
      { logo: req.cloudinaryResult.secure_url },
      { new: true }
    );
    res.json({ logo: company.logo });
  } catch (err) { next(err); }
};

// ── Search Companies ──────────────────────────────────────
export const searchCompanies = async (req, res, next) => {
  try {
    const { q, industry, stage, teamSize, location, hiring, page = 1, limit = 12 } = req.query;
    const query = {};
    if (q) query.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (industry) query.industry = industry;
    if (stage) query.stage = stage;
    if (teamSize) query.teamSize = teamSize;
    if (location) query.hqLocation = new RegExp(location, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const companies = await Company.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    // Add open job count to each company
    const companiesWithJobs = await Promise.all(companies.map(async (c) => {
      const openJobsCount = await Job.countDocuments({ company: c._id, status: 'active' });
      return { ...c.toObject(), openJobsCount };
    }));

    if (hiring === 'true') {
      const filtered = companiesWithJobs.filter(c => c.openJobsCount > 0);
      return res.json({ companies: filtered, totalCount: filtered.length });
    }

    const totalCount = await Company.countDocuments(query);
    res.json({ companies: companiesWithJobs, totalCount, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) { next(err); }
};

// ── Get Company by Slug ───────────────────────────────────
export const getCompanyBySlug = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug }).populate('createdBy', 'name avatar');
    if (!company) return res.status(404).json({ message: 'Company not found.' });

    const openJobs = await Job.find({ company: company._id, status: 'active' }).limit(6);
    const reviews = await Review.find({ company: company._id }).populate('reviewer', 'name avatar').sort({ createdAt: -1 }).limit(5);

    res.json({ company, openJobs, reviews });
  } catch (err) { next(err); }
};

// ── Create Review ─────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { rating, title, pros, cons, isAnonymous } = req.body;
    const review = await Review.create({ company: req.params.id, reviewer: req.user._id, rating, title, pros, cons, isAnonymous });

    // Recalculate average rating
    const allReviews = await Review.find({ company: req.params.id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Company.findByIdAndUpdate(req.params.id, { averageRating: avg.toFixed(1), totalReviews: allReviews.length });

    res.status(201).json({ review, message: 'Review submitted.' });
  } catch (err) { next(err); }
};
