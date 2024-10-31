import Course from '../models/course.js'; // Asegúrate de tener la ruta correcta
import mongoose from 'mongoose';

// Crear un nuevo curso
export const createCourse = async (req, res) => {
  const { title, description, url, creatorId, categoryId } = req.body;

  // Validación de IDs
  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'ID de creador o categoría no válidos', status: 400 });
  }

  try {
    const newCourse = new Course({
      title,
      description,
      url,
      creatorId: new mongoose.Types.ObjectId(creatorId), // Convertir el id a ObjectId
      categoryId: new mongoose.Types.ObjectId(categoryId),
    });

    await newCourse.save();
    res.status(201).json({ message: 'Curso creado exitosamente', status: 200, course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el curso', status: 500 });
  }
};

// Actualizar un curso existente
export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, categoryId } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        categoryId: mongoose.Types.ObjectId(categoryId), // Convertir el id a ObjectId
      },
      { new: true } // Retorna el curso actualizado
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso actualizado', course: updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el curso' });
  }
};

// Eliminar un curso
export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el curso' });
  }
};

// Comentar en un curso
export const addComment = async (req, res) => {
  const { courseId } = req.params;
  const { userId, comment } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Agregar el comentario
    course.comments.push({
      userId: mongoose.Types.ObjectId(userId),
      comment,
    });

    await course.save();
    res.status(200).json({ message: 'Comentario agregado exitosamente', comments: course.comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el comentario' });
  }
};

// Calificar un curso
export const rateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 5' });
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Buscar si el usuario ya calificó el curso
    const existingRating = course.ratings.find(r => r.userId.toString() === userId);

    if (existingRating) {
      // Actualizar calificación existente
      existingRating.rating = rating;
    } else {
      // Agregar nueva calificación
      course.ratings.push({ userId: mongoose.Types.ObjectId(userId), rating });
    }

    // Calcular el promedio de calificaciones
    const totalRatings = course.ratings.length;
    const sumRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = sumRatings / totalRatings;

    await course.save();
    res.status(200).json({ message: 'Calificación actualizada', averageRating: course.averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al calificar el curso' });
  }
};

// Controlador para obtener los cursos
export const getCourses = async (req, res) => {
  const { courseId } = req.params; // Obtiene courseId de los parámetros de la ruta
  const { categoryId, title, rating, startDate, endDate } = req.query; // Extrae los filtros de la query

  try {
    // Si se proporciona un ID de curso, devuelve solo ese curso
    if (courseId) {
      const course = await Course.findById(courseId)
        .populate('categoryId', 'name') // Mostrar información de la categoría
        .populate('creatorId', 'name'); // Mostrar nombre del creador

      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      return res.status(200).json(course); // Devuelve el curso específico
    }

    // Si no se proporciona un ID, aplica los filtros para obtener una lista de cursos
    let filters = {};

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (title) {
      filters.title = { $regex: title, $options: 'i' };
    }

    if (rating) {
      filters.averageRating = { $gte: Number(rating) };
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }

    const courses = await Course.find(filters)
      .populate('categoryId', 'name')
      .populate('creatorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(courses); // Devuelve la lista de cursos
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los cursos.' });
  }
};