// controllers/categoryController.js
import Category from '../models/category.js';

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ status: 400, message: 'El nombre de la categoría es requerido.' });
    }

    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ status: 201, message: 'Categoría creada con éxito', category: newCategory });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear la categoría', error: error.message });
    }
};

// Obtener todas las categorías
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ status: 200, categories });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener las categorías', error: error.message });
    }
};

// Actualizar una categoría
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ status: 400, message: 'El nombre de la categoría es requerido.' });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        
        if (!updatedCategory) {
            return res.status(404).json({ status: 404, message: 'Categoría no encontrada' });
        }

        res.status(200).json({ status: 200, message: 'Categoría actualizada con éxito', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al actualizar la categoría', error: error.message });
    }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            return res.status(404).json({ status: 404, message: 'Categoría no encontrada' });
        }

        res.status(200).json({ status: 200, message: 'Categoría eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar la categoría', error: error.message });
    }
};