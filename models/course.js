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
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 0, max: 5 } // Calificación de 0 a 5
  }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

// Exportar el modelo de curso
const Course = mongoose.model('Course', courseSchema);
export default Course;