import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});

// Exportar el modelo de curso
const Course = mongoose.model('Course', courseSchema);
export default Course;