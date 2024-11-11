import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        required: true,
        enum: ['category', 'area'], // Tipo puede ser "category" o "area"
        default: 'category'
    },
    description: { type: String }, // Descripción opcional para áreas
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Referencia para subcategorías
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para obtener las subcategorías asociadas a un área
categorySchema.virtual('subcategories', {
    ref: 'Category', // Modelo a referenciar
    localField: '_id', // Campo local
    foreignField: 'parentCategory' // Campo de la otra colección que hace referencia a éste
});

const Category = mongoose.model('Category', categorySchema);
export default Category;