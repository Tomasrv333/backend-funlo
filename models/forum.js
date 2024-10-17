import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});

// Exportar el modelo de foro
const Forum = mongoose.model('Forum', forumSchema);
export default Forum;