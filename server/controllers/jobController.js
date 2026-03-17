import sanitizeHtml from 'sanitize-html';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import { Application } from '../models/index.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';
import { createNotification } from '../utils/notify.js';
import User from '../models/User.js';

// ── Create Job ────────────────────────────────────────────
export const createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ createdBy: req.user._id });
    if (!company) return res.status(400).json({ message: 'Please create a company profile first.' });

    const { title, description, responsibilities, requirements, skills, salaryMin, salaryMax, equity, jobType, workMode, experienceLevel, location } = req.body;

    if (!title || !description || !salaryMin || !salaryMax || !skills?.length)
      return res.status(400).json({ message: 'Title, description, salary range and skills are required.' });

    const job = await Job.create({
      title,
      description: sanitizeHtml(description),
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      skills,
      salaryMin, salaryMax, equity,
      jobType, workMode, experienceLevel, location,
      company: company._id,
      postedBy: req.user._id,
    });

    const populated = await job.populate('company', 'name logo stage');
    res.status(201).json({ job: populated });
  } catch (err) { next(err); }
};

// ── Search Jobs ───────────────────────────────────────────
export const searchJobs = async (req, res, next) => {
  try {
    const { q, workMode, jobType, experienceLevel, salaryMin, salaryMax, location, page = 1, limit = 20, sort = 'newest' } = req.query;

    const query = { status: 'active', expiresAt: { $gt: new Date() } };
    if (q) query.$text = { $search: q };
    if (workMode) query.workMode = workMode;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = new RegExp(location, 'i');
    if (salaryMin) query.salaryMax = { $gte: Number(salaryMin) };
    if (salaryMax) query.salaryMin = { $lte: Number(salaryMax) };

    const sortMap = { newest: { createdAt: -1 }, 'salary-high': { salaryMax: -1 }, 'salary-low': { salaryMin: 1 }, 'most-applied': { applicantCount: -1 } };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, totalCount] = await Promise.all([
      Job.find(query).sort(sortOption).skip(skip).limit(Number(limit)).populate('company', 'name logo stage teamSize hqLocation'),
      Job.countDocuments(query),
    ]);

    res.json({ jobs, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: Number(page) });
  } catch (err) { next(err); }
};

// ── Get Job by Slug ───────────────────────────────────────
export const getJobBySlug = async (req, res, next) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug }).populate('company').populate('postedBy', 'name avatar');
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    await Job.incrementViews(job._id);

    let userHasApplied = false;
    if (req.user) {
      const app = await Application.findOne({ job: job._id, candidate: req.user._id });
      userHasApplied = !!app;
    }

    res.json({ job, userHasApplied });
  } catch (err) { next(err); }
};

// ── Update Job ────────────────────────────────────────────
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized.' });
    if (req.body.description) req.body.description = sanitizeHtml(req.body.description);
    Object.assign(job, req.body);
    await job.save();
    res.json({ job });
  } catch (err) { next(err); }
};

// ── Delete Job ────────────────────────────────────────────
export const deleteJob = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, postedBy: req.user._id };
    const job = await Job.findOneAndDelete(query);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
  } catch (err) { next(err); }
};

// ── My Jobs (Recruiter) ───────────────────────────────────
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).populate('company', 'name logo');
    res.json({ jobs });
  } catch (err) { next(err); }
};

// ── Apply to Job ──────────────────────────────────────────
export const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job || job.status !== 'active') {
      return res.status(404).json({ message: 'Job not found or no longer active.' });
    }

    // Check duplicate application
    const existingApp = await Application.findOne({
      job: job._id,
      candidate: req.user._id
    });
    if (existingApp) {
      return res.status(409).json({ message: 'You have already applied to this job.' });
    }

    // Create the application
    const newApplication = await Application.create({
      job: job._id,
      candidate: req.user._id,
      company: job.company._id,
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

    // Notify recruiter
    const recruiter = await User.findById(job.postedBy);
    if (recruiter) {
      await createNotification({
        recipientId: recruiter._id,
        type: 'new_application',
        title: 'New application received',
        message: `${req.user.name} applied for ${job.title}`,
        link: `/recruiter/applications/${newApplication._id}`,
      });

      if (recruiter.notificationPrefs?.emailOnApply !== false) {
        await sendEmail({
          to: recruiter.email,
          subject: `New application for ${job.title}`,
          html: emailTemplates.newApplication(
            recruiter.name,
            req.user.name,
            job.title,
            `${process.env.FRONTEND_URL}/recruiter/applications/${newApplication._id}`
          ),
        });
      }
    }

    res.status(201).json({
      message: 'Application submitted!',
      applicationId: newApplication._id
    });
  } catch (err) { next(err); }
};

// ── Get Applicants ────────────────────────────────────────
export const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const query = { job: req.params.id };
    if (req.query.status) query.status = req.query.status;

    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar')
      .populate({ path: 'candidate', populate: { path: '_id', model: 'CandidateProfile', localField: 'candidate', foreignField: 'user', select: 'headline skills resumeUrl completionScore' } })
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (err) { next(err); }
};

// ── Update Application Status ─────────────────────────────
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job', 'title').populate('candidate', 'name email notificationPrefs');
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    await application.save();

    // Notify candidate
    await createNotification({
      recipientId: application.candidate._id,
      type: 'status_changed',
      title: 'Application update',
      message: `Your application for ${application.job.title} is now ${status}`,
      link: `/candidate/dashboard`,
    });
    if (application.candidate.notificationPrefs?.emailOnStatusChange) {
      await sendEmail({
        to: application.candidate.email,
        subject: `Application update: ${application.job.title}`,
        html: emailTemplates.statusUpdate(application.candidate.name, application.job.title, status),
      });
    }

    res.json({ application });
  } catch (err) { next(err); }
};

// ── Update Recruiter Notes ────────────────────────────────
export const updateApplicationNotes = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { recruiterNotes: req.body.notes },
      { new: true }
    );
    res.json({ application });
  } catch (err) { next(err); }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title slug salaryMin salaryMax')
      .populate('candidate', 'name email avatar headline bio skills experience education projects resumeUrl linkedinUrl githubUrl portfolioUrl desiredSalaryMin desiredSalaryMax workMode experienceYears location');

    if (!application) return res.status(404).json({ message: 'Application not found.' });
    res.json({ application });
  } catch (err) { next(err); }
};