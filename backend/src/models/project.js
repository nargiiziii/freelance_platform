// backend/src/models/project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: { type: [String], default: [] },
  budget: { type: Number, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
