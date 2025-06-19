import mongoose from "mongoose";

// Схема отзыва, включающая информацию о пользователе, проекте, комментарий и оценку
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

// Схема элемента портфолио фрилансера: информация о выполненной работе
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

// Основная схема пользователя: общие поля, а также специфичные для фрилансеров и нанимателей
const userSchema = new mongoose.Schema(
  {
    // Роль пользователя (фрилансер или наниматель)
    role: { type: String, enum: ["freelancer", "employer"], required: true },

    // Основные личные данные
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Профиль и описание
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },

    // Поля, актуальные только для фрилансеров
    skills: { type: [String], default: [] },
    portfolio: { type: [portfolioItemSchema], default: [] },
    rating: { type: Number, default: 0 },
    completedProjectsCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    category: { type: String }, // специализация фрилансера

    // Общие поля, связанные с деньгами и отзывами
    balance: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    refreshToken: { type: String, default: "" },

    // Поле, актуальное только для нанимателей
    postedProjectsCount: { type: Number, default: 0 },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", userSchema);

export default User;
