// controllers/categoryController.js
import Category from '../models/category.js';

// Crear una nueva categoría o área
export const createCategoryOrArea = async (req, res) => {
    try {
        const { name, description, type, parentCategoryId } = req.body;

        // Verificar que se ha proporcionado el nombre y el tipo
        if (!name || !type) {
            return res.status(400).json({ message: 'El nombre y el tipo (category o area) son obligatorios.' });
        }

        // Validar que el tipo sea correcto
        if (!['category', 'area'].includes(type)) {
            return res.status(400).json({ message: 'El tipo debe ser "category" o "area".' });
        }

        // Si es una categoría, verificar que se haya proporcionado un ID de área (parentCategoryId)
        if (type === 'category' && !parentCategoryId) {
            return res.status(400).json({ message: 'El ID del área (parentCategoryId) es obligatorio para una categoría.' });
        }

        // Si se trata de una categoría, verificar que el área exista
        if (type === 'category') {
            const area = await Category.findById(parentCategoryId);
            if (!area || area.type !== 'area') {
                return res.status(404).json({ message: 'El área no existe o no es válida.' });
            }
        }

        const newCategoryOrArea = new Category({
            name,
            description,
            type,
            parentCategory: type === 'category' ? parentCategoryId : undefined // Solo asignar parentCategory si es una categoría
        });

        await newCategoryOrArea.save();
        return res.status(201).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} creado/a exitosamente`, data: newCategoryOrArea });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear la categoría o área', error });
    }
};

export const getCategoriesAndAreas = async (req, res) => {
    try {
        const { type } = req.query; // Obtenemos el tipo de filtro si se pasa

        // Si se pasa un 'type', lo usamos como filtro; si no, buscamos tanto áreas como categorías
        const filter = type ? { type } : {}; // Filtra por 'type' si está definido, sino trae todo

        // Obtiene todas las categorías, incluyendo las áreas con sus subcategorías
        const areas = await Category.find({ type: 'area' })
            .populate({
                path: 'subcategories', // Relaciona subcategorías con su área
                match: { type: 'category' }, // Filtra solo las categorías (subcategorías)
            })
            .exec();

        // Devolver las áreas con las subcategorías asociadas
        return res.status(200).json({ data: areas });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener las categorías y áreas', error });
    }
};

// Actualizar una categoría o área
export const updateCategoryOrArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, parentCategoryId } = req.body;

        // Verificar que el tipo sea válido
        if (type && !['category', 'area'].includes(type)) {
            return res.status(400).json({ message: 'El tipo debe ser "category" o "area".' });
        }

        const categoryOrArea = await Category.findById(id);
        if (!categoryOrArea) {
            return res.status(204).json({ message: 'Categoría o área no encontrada' });
        }

        // Si es una categoría, verificar que el área exista (si es necesario)
        if (type === 'category' && parentCategoryId) {
            const area = await Category.findById(parentCategoryId);
            if (!area || area.type !== 'area') {
                return res.status(204).json({ message: 'El área proporcionada no es válida.' });
            }
        }

        // Actualizar los campos
        categoryOrArea.name = name || categoryOrArea.name;
        categoryOrArea.description = description || categoryOrArea.description;
        categoryOrArea.type = type || categoryOrArea.type;
        categoryOrArea.parentCategory = parentCategoryId || categoryOrArea.parentCategory;

        await categoryOrArea.save();
        return res.status(200).json({ message: 'Categoría o área actualizada exitosamente', data: categoryOrArea });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar la categoría o área', error });
    }
};

// Eliminar una categoría o área
export const deleteCategoryOrArea = async (req, res) => {
    try {
        const { id } = req.params;

        const categoryOrArea = await Category.findById(id);
        if (!categoryOrArea) {
            return res.status(204).json({ message: 'Categoría o área no encontrada' });
        }

        await categoryOrArea.remove();
        return res.status(200).json({ message: 'Categoría o área eliminada exitosamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar la categoría o área', error });
    }
};