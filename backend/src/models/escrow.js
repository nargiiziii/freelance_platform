import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: false,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "funded", "released", "rejected", "disputed"],
    default: "pending",
  },
  type: {
    type: String,
    enum: ["escrow", "topup"],
    default: "escrow", // по умолчанию обычный escrow
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Escrow", escrowSchema);
