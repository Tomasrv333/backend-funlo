import Course from '../models/course.js'; // Asegúrate de tener el modelo de Course

// Crear un nuevo curso
const createCourse = async (req, res) => {
  const { title, description } = req.body;

  try {
    const newCourse = new Course({
      title,
      description,
      createdBy: req.user.id, // Suponiendo que el usuario está en req.user después de autenticarse
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el curso', error });
  }
};

// Obtener todos los cursos
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: 'Error al obtener los cursos', error });
  }
};

export { createCourse, getCourses };