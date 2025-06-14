import mongoose from "mongoose";

// Отзывы (для фрилансеров и, опционально, нанимателей)
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
);


const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String },
    description: { type: String },
    technologies: { type: [String], default: [] },
    date: { type: String },
    image: { type: String }, 
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

    // Только для фрилансеров
    skills: { type: [String], default: [] },
    portfolio: { type: [portfolioItemSchema], default: [] },
    rating: { type: Number, default: 0 },
    completedProjectsCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },

    // Общие
    balance: { type: Number, default: 0 }, // escrow: пополняет employer, получает freelancer
    reviews: { type: [reviewSchema], default: [] },
    refreshToken: { type: String, default: "" },

    // Только для нанимателей
    postedProjectsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
