import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import ProductForm from '../components/ProductForm';
import { useConfirmDialog } from '../components/ConfirmDialog';

const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { openConfirmDialog } = useConfirmDialog();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 6; 

    // Category filter state
    const [selectedCategory, setSelectedCategory] = useState('');
    const categories = ['', 'Accessories', 'Toys', 'Housing', 'Food', 'Health', 'Others'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/api/products`);
            setProducts(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch products');
        }
    };

    const handleDelete = async (id) => {
        openConfirmDialog({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/products/${id}`);
                    toast.success('Product deleted successfully');
                    fetchProducts();
                } catch (error) {
                    toast.error('Failed to delete product');
                }
            }
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct._id}`, formData);
                toast.success('Product updated successfully');
            } else {
                await axios.post('/api/products', formData);
                toast.success('Product added successfully');
            }
            setIsFormOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    // Filtering Logic
    const filteredProducts = selectedCategory 
        ? products.filter(product => product.category === selectedCategory)
        : products;

    // Pagination Logic
    const offset = currentPage * itemsPerPage;
    const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    // Reset current page when category changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory]);

    return (
        <div className="container h-100 mx-auto px-6 py-8 mx-auto">
            <h1 className="text-3xl font-extrabold mb-4">Product Management</h1>

            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setIsFormOpen(true);
                    }}
                    className="bg-rose-300 border text-white px-4 py-2 rounded hover:bg-rose-400"
                >
                    Add New Product
                </button>

                <div className="flex items-center">
                    <label htmlFor="category-filter" className="mr-2 text-gray-700">
                        Filter by Category:
                    </label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-pink-300 rounded px-2 py-1"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category || 'All Categories'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 z-50">
                    <ProductForm
                        product={editingProduct}
                        onSubmit={handleFormSubmit}
                        onClose={() => setIsFormOpen(false)}
                    />
                </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-pink-200 border border-pink-300 rounded-full">
                    <thead className="bg-pink-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (LKR)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-200">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-pink-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{product.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{product.category}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{product.quantity}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium"><a href={product.imageUrl} target="_blank" rel="noopener noreferrer" className='text-pink-400'>View Image</a></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(product.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(product.updatedAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center px-4 py-2 border">
                                    {selectedCategory 
                                        ? `No products in ${selectedCategory} category.` 
                                        : 'No products available.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {filteredProducts.length > itemsPerPage && (
                <div className="flex justify-center mt-8 py-4">
                    <ReactPaginate
                        previousLabel={"← Previous"}
                        nextLabel={"Next →"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination flex gap-2"}
                        pageClassName={"px-4 py-2 rounded bg-pink-300 hover:bg-gray-300"}
                        activeClassName={"bg-rose-400 text-white"}
                        previousClassName={"px-4 py-2 rounded bg-white hover:bg-gray-300"}
                        nextClassName={"px-4 py-2 rounded bg-white hover:bg-gray-300"}
                        disabledClassName={"opacity-50 cursor-not-allowed"}
                    
                        className="flex flex-wrap gap-2 justify-center items-center"
                    />
                </div>
            )}
        </div>
    );
};

export default ProductManagementPage;