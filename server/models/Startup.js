import mongoose from 'mongoose';

const startupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    stage: {
      type: String,
      enum: ['idea', 'mvp', 'growth'],
      default: 'idea',
    },
    neededRoles: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    isOpenForApplications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Startup = mongoose.models.Startup || mongoose.model('Startup', startupSchema);

export default Startup;

