import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProductForm = ({ product, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: 'Accessories',
        description: '',
        imageUrl: '',
        quantity: 1,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
                imageUrl: product.imageUrl,
                quantity: product.quantity,
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'price' || name === 'quantity') {
            const numValue = parseFloat(value);
            if (numValue < 1 || isNaN(numValue)) {
                toast.warn(`${name.charAt(0).toUpperCase() + name.slice(1)} must be greater than 0.`);
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (formData.name.trim() === '') {
            toast.warn('Product name is required.');
            return;
        }

        const trimmedData = {
            ...formData,
            name: formData.name.trim(),
            description: formData.description.trim(),
            imageUrl: formData.imageUrl.trim(),
        };
        
        onSubmit(trimmedData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-[var(--main-color)]/70">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-lg">✖</button>
                <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} maxLength={50} className="w-full px-4 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (LKR)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded" required>
                            <option value="Accessories">Accessories</option>
                            <option value="Toys">Toys</option>
                            <option value="Housing">Housing</option>
                            <option value="Food">Food</option>
                            <option value="Health">Health</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} maxLength={1000} className="w-full px-4 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{product ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
