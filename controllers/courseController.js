import Course from '../models/course.js'; // Asegúrate de tener la ruta correcta
import mongoose from 'mongoose';

// Crear un nuevo curso
export const createCourse = async (req, res) => {
  const { title, description, videos, creatorId, categoryId, areaId, thumbnailUrl } = req.body;

  // Validación de IDs
  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(areaId)) {
    return res.status(400).json({ message: 'ID de creador, categoría o área no válidos', status: 400 });
  }

  // Validación de los videos (debe ser un arreglo de objetos con la URL de YouTube válida)
  if (videos && !Array.isArray(videos)) {
    return res.status(400).json({ message: 'El campo "videos" debe ser un arreglo de objetos' });
  }
  if (videos) {
    for (const video of videos) {
      if (!video.title || !video.url || !youtubeUrlRegex.test(video.url)) {
        return res.status(400).json({ message: 'URL del video no válida en el arreglo de videos', status: 400 });
      }
    }
  }

  try {
    const newCourse = new Course({
      title,
      description,
      videos,
      creatorId: new mongoose.Types.ObjectId(creatorId),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      areaId: new mongoose.Types.ObjectId(areaId),
      thumbnailUrl,
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
  const { title, description, videos, categoryId, areaId, thumbnailUrl } = req.body;

  // Validación de los videos (si se proporcionan)
  if (videos && !Array.isArray(videos)) {
    return res.status(400).json({ message: 'El campo "videos" debe ser un arreglo de objetos' });
  }
  if (videos) {
    for (const video of videos) {
      if (!video.title || !video.url || !youtubeUrlRegex.test(video.url)) {
        return res.status(400).json({ message: 'URL del video no válida en el arreglo de videos', status: 400 });
      }
    }
  }

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        videos,
        categoryId: mongoose.Types.ObjectId(categoryId),
        areaId: mongoose.Types.ObjectId(areaId),
        thumbnailUrl,
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
  const { areaId, categoryId, title, rating, startDate, endDate } = req.query; // Extrae los filtros de la query

  try {
    // Si se proporciona un ID de curso, devuelve solo ese curso
    if (courseId) {
      const course = await Course.findById(courseId)
        .populate('categoryId', 'name') // Mostrar información de la categoría
        .populate('creatorId', 'name') // Mostrar nombre del creador
        .populate('areaId', 'name'); // Información del área

      if (!course) {
        return res.status(204).json({ message: 'Curso no encontrado' });
      }

      return res.status(200).json(course); // Devuelve el curso específico
    }

    // Construcción de filtros para la consulta
    let filters = {};

    if (areaId) {
      filters.areaId = areaId;
      if (categoryId) {
        filters.categoryId = categoryId;
      }
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

    // Consultar cursos según los filtros
    const courses = await Course.find(filters)
      .populate('categoryId', 'name')
      .populate('creatorId', 'username')
      .populate('areaId', 'name')
      .select('url title description averageRating creatorId thumbnailUrl videos createdAt')
      .sort({ createdAt: -1 });

    // Si no hay cursos y existen filtros, enviar un mensaje adecuado
    if (!courses.length && Object.keys(filters).length > 0) {
      return res.status(204).json({ message: 'No se encontraron cursos con los filtros aplicados.' });
    }

    // Procesar cursos para responder en formato deseado
    const coursesData = courses.map(course => ({
      _id: course._id,
      url: course.url,
      title: course.title,
      description: course.description,
      author: course.creatorId.username,
      date: course.createdAt,
      rating: course.averageRating,
      thumbnailUrl: course.thumbnailUrl,
      videos: course.videos.map(video => ({
        title: video.title,
        url: video.url,
        createdAt: video.createdAt,
      })),
    }));

    res.status(200).json(coursesData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los cursos.' });
  }
};