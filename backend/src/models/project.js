import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, // новое поле для изображения
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // если назначен
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;
