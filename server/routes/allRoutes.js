// ── Job Routes ────────────────────────────────────────────
import { Router as JR } from 'express';
import {
  createJob, searchJobs, getJobBySlug, updateJob,
  deleteJob, getMyJobs, applyToJob, getJobApplicants,
  updateApplicationStatus, updateApplicationNotes,
  getApplicationById
} from '../controllers/jobController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadResume, uploadAvatar, uploadLogo, uploadToCloudinary } from '../middleware/upload.js';

const jobRouter = JR();
jobRouter.get('/',                   optionalAuth, searchJobs);
jobRouter.post('/',                  protect, restrictTo('recruiter'), createJob);
jobRouter.get('/my-jobs',            protect, restrictTo('recruiter'), getMyJobs);
jobRouter.get('/:slug',              optionalAuth, getJobBySlug);
jobRouter.patch('/:id',              protect, restrictTo('recruiter','admin'), updateJob);
jobRouter.delete('/:id',             protect, restrictTo('recruiter','admin'), deleteJob);
jobRouter.post('/:id/apply',         protect, restrictTo('candidate'), applyToJob);
jobRouter.get('/:id/applicants',     protect, restrictTo('recruiter','admin'), getJobApplicants);
jobRouter.patch('/applications/:id/status', protect, restrictTo('recruiter','admin'), updateApplicationStatus);
jobRouter.get('/applications/:id', protect, restrictTo('recruiter','admin'), getApplicationById);
jobRouter.patch('/applications/:id/notes',  protect, restrictTo('recruiter'), updateApplicationNotes);
export { jobRouter };

// ── Candidate Routes ──────────────────────────────────────
import { Router as CR } from 'express';
import {
  getMyProfile, createOrUpdateProfile,
  uploadResume as uploadResumeCtrl,
  getPublicProfile, toggleSaveJob,
  getSavedJobs, getDashboardData, searchCandidates
} from '../controllers/candidateController.js';

const candidateRouter = CR();
candidateRouter.get('/me',              protect, getMyProfile);
candidateRouter.put('/me',              protect, createOrUpdateProfile);
candidateRouter.post('/resume',         protect, uploadResume, uploadToCloudinary('resumes','raw'), uploadResumeCtrl);
candidateRouter.get('/saved-jobs',      protect, getSavedJobs);
candidateRouter.post('/save-job/:jobId',protect, toggleSaveJob);
candidateRouter.get('/dashboard',       protect, getDashboardData);
candidateRouter.get('/search',          protect, searchCandidates);
candidateRouter.get('/:userId',         optionalAuth, getPublicProfile);
export { candidateRouter };

// ── Company Routes ────────────────────────────────────────
import { Router as CoR } from 'express';
import {
  createCompany, getMyCompany, updateCompany,
  uploadLogo as uploadLogoCtrl,
  searchCompanies, getCompanyBySlug, createReview
} from '../controllers/companyController.js';

const companyRouter = CoR();

// ── Specific routes FIRST ──
companyRouter.get('/mine',           protect, restrictTo('recruiter'), getMyCompany);
companyRouter.patch('/mine',         protect, restrictTo('recruiter'), updateCompany);
companyRouter.post('/mine/logo',     protect, restrictTo('recruiter'), uploadLogo, uploadToCloudinary('logos'), uploadLogoCtrl);

// ── General routes AFTER ──
companyRouter.get('/',               searchCompanies);
companyRouter.post('/',              protect, restrictTo('recruiter'), createCompany);
companyRouter.get('/:slug',          optionalAuth, getCompanyBySlug);
companyRouter.post('/:id/reviews',   protect, restrictTo('candidate'), createReview);

export { companyRouter };

// ── Message Routes ────────────────────────────────────────
import { Router as MR } from 'express';
import {
  getConversations, getMessages, getUnreadCount
} from '../controllers/messageController.js';

const messageRouter = MR();
messageRouter.get('/',                protect, getConversations);
messageRouter.get('/unread-count',    protect, getUnreadCount);
messageRouter.get('/:userId',         protect, getMessages);
export { messageRouter };

// ── Notification Routes ───────────────────────────────────
import { Router as NR } from 'express';
import {
  getNotifications, markAllRead,
  markOneRead, getNotifUnreadCount
} from '../controllers/messageController.js';

const notifRouter = NR();
notifRouter.get('/',                  protect, getNotifications);
notifRouter.get('/unread-count',      protect, getNotifUnreadCount);
notifRouter.patch('/read-all',        protect, markAllRead);
notifRouter.patch('/:id/read',        protect, markOneRead);
export { notifRouter };

// ── Admin Routes ──────────────────────────────────────────
import { Router as AR } from 'express';
import {
  getDashboardStats, getUsers, updateUser,
  getJobs, updateJobStatus,
  getPendingCompanies, approveCompany, rejectCompany
} from '../controllers/adminController.js';

const adminRouter = AR();
const adminGuard = [protect, restrictTo('admin')];
adminRouter.get('/stats',                    ...adminGuard, getDashboardStats);
adminRouter.get('/users',                    ...adminGuard, getUsers);
adminRouter.patch('/users/:id',              ...adminGuard, updateUser);
adminRouter.get('/jobs',                     ...adminGuard, getJobs);
adminRouter.patch('/jobs/:id/status',        ...adminGuard, updateJobStatus);
adminRouter.get('/companies/pending',        ...adminGuard, getPendingCompanies);
adminRouter.patch('/companies/:id/approve',  ...adminGuard, approveCompany);
adminRouter.patch('/companies/:id/reject',   ...adminGuard, rejectCompany);
export { adminRouter };