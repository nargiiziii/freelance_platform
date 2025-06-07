// // models/Message.js

// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const messageSchema = new Schema({
//   senderId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   receiverId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   projectId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   read: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   collection: 'messages',
//   timestamps: { createdAt: true, updatedAt: false }
// });

// export default model('Message', messageSchema);
