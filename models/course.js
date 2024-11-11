import mongoose from 'mongoose';

// Expresión regular para validar URL de YouTube
const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Agregar videos como un arreglo de objetos
  videos: [{
    title: { type: String, required: true }, // Título del video
    url: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return youtubeUrlRegex.test(v); // Validar que la URL sea válida de YouTube
        },
        message: props => `${props.value} no es una URL válida de YouTube!`
      }
    },
    createdAt: { type: Date, default: Date.now } // Fecha de creación del video
  }],
  // Miniatura principal del curso
  thumbnailUrl: { 
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i.test(v); // Validar que sea una URL de imagen
      },
      message: props => `${props.value} no es una URL válida de imagen!`
    }
  },
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
  // Agregar un campo para el área
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
});

// Exportar el modelo de curso
const Course = mongoose.model('Course', courseSchema);
export default Course;