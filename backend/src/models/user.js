import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    comment: { type: String, required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
); // _id: false чтобы у каждого отзыва не было собственного _id, но это по желанию

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["freelancer", "employer"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, 
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    portfolio: { type: [portfolioItemSchema], default: [] },
    rating: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
