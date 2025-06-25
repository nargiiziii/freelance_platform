import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coverLetter: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "rejected",
      "submitted",
      "refunded",
      "closed",
    ],
    default: "pending",
  },
  workFile: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Proposal", proposalSchema);
