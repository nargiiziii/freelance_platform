// // models/Proposal.js

// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const proposalSchema = new Schema({
//   projectId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Project',     // ссылка на проект
//     required: true
//   },
//   freelancerId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',        // ссылка на пользователя-фрилансера
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   proposedBudget: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   proposedDeadline: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'accepted', 'rejected'],
//     default: 'pending'
//   }
// }, {
//   collection: 'proposals',
//   timestamps: { createdAt: true, updatedAt: false }  // только createdAt
// });

// export default model('Proposal', proposalSchema);
