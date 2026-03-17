import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import { Application, AdminLog } from '../models/index.js';
import { sendEmail } from '../utils/sendEmail.js';

const logAction = (adminId, action, target, details) =>
  AdminLog.create({ admin: adminId, action, target, details });

// ── Dashboard Stats ───────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [totalUsers, newUsersToday, totalJobs, activeJobs, totalApplications, totalCompanies, pendingCompanies] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Company.countDocuments(),
      Company.countDocuments({ isVerified: false }),
    ]);

    // Signups last 30 days (for chart)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const signupData = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalUsers, newUsersToday, totalJobs, activeJobs, totalApplications, totalCompanies, pendingCompanies, signupData });
  } catch (err) { next(err); }
};

// ── Users ─────────────────────────────────────────────────
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search,'i') }, { email: new RegExp(search,'i') }];
    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash -verifyToken -resetToken').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, totalPages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = ['isBanned','role','isVerified'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await logAction(req.user._id, 'update_user', req.params.id, updates);
    res.json({ user });
  } catch (err) { next(err); }
};

// ── Jobs ──────────────────────────────────────────────────
export const getJobs = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = new RegExp(search, 'i');
    const [jobs, total] = await Promise.all([
      Job.find(query).populate('company','name').populate('postedBy','name email').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit)),
      Job.countDocuments(query),
    ]);
    res.json({ jobs, total, totalPages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

export const updateJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    await logAction(req.user._id, 'update_job_status', req.params.id, { status: req.body.status });
    res.json({ job });
  } catch (err) { next(err); }
};

// ── Companies ─────────────────────────────────────────────
export const getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isVerified: false }).populate('createdBy','name email').sort({ createdAt: -1 });
    res.json({ companies });
  } catch (err) { next(err); }
};

export const approveCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true }).populate('createdBy','name email');
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    await sendEmail({ to: company.createdBy.email, subject: 'Your company is approved on Collab Nation!', html: `<p>Hi ${company.createdBy.name}, <strong>${company.name}</strong> has been approved. Start posting jobs!</p>` });
    await logAction(req.user._id, 'approve_company', req.params.id, { name: company.name });
    res.json({ message: 'Company approved.', company });
  } catch (err) { next(err); }
};

export const rejectCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('createdBy','name email');
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    await sendEmail({ to: company.createdBy.email, subject: 'Company profile update — Collab Nation', html: `<p>Hi ${company.createdBy.name}, your company <strong>${company.name}</strong> was not approved. Reason: ${req.body.reason || 'Does not meet our guidelines.'}</p>` });
    await Company.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'reject_company', req.params.id, { reason: req.body.reason });
    res.json({ message: 'Company rejected and removed.' });
  } catch (err) { next(err); }
};
