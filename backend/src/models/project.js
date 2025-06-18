// backend/src/models/project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: { type: [String], default: [] },
  budget: { type: Number, required: true },
  status: {
    type: String,
    enum: ["open", "in_progress", "submitted", "completed", "closed"], // ✅ добавлены все нужные
    default: "open",
  },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Proposal" }],
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Escrow",
    default: null,
  }, 
  createdAt: { type: Date, default: Date.now },
  category: { type: String, required: true },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
