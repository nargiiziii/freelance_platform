// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const projectSchema = new Schema({
//   ownerId: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User',               // заказчик — ссылка на пользователя
//     required: true 
//   },
//   title: { 
//     type: String, 
//     required: true 
//   },
//   description: { 
//     type: String, 
//     required: true 
//   },
//   budget: { 
//     type: Number, 
//     required: true, 
//     min: 0 
//   },
//   deadline: { 
//     type: Date, 
//     required: true 
//   },
//   category: { 
//     type: String, 
//     required: true 
//   },
//   status: { 
//     type: String, 
//     enum: ['open', 'in_progress', 'completed', 'cancelled'], 
//     default: 'open' 
//   },
//   selectedFreelancerId: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User'                // исполнитель — тоже ссылка на пользователя
//   },
  
//   // --- Эскроу-система ---
//   escrowAmount: {
//     type: Number,
//     default: 0,               // сколько средств "заблокировано" в эскроу для этого проекта
//     min: 0
//   },
//   escrowStatus: {
//     type: String,
//     enum: ['pending', 'released', 'refunded'],
//     default: 'pending'        // статус эскроу
//   }
// }, {
//   collection: 'projects',
//   timestamps: true
// });

// export default model('Project', projectSchema);
