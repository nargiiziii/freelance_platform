// // models/Review.js

// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const reviewSchema = new Schema({
//   fromUserId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   toUserId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   projectId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   rating: {
//     type: Number,
//     min: 1,
//     max: 5,
//     required: true
//   },
//   comment: {
//     type: String
//   }
// }, {
//   collection: 'reviews',
//   timestamps: { createdAt: true, updatedAt: false }
// });

// export default model('Review', reviewSchema);
