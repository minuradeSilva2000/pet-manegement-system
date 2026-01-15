import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import CartButton from '../components/CartButton';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';

const ProductsShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories] = useState(['All', 'Accessories', 'Toys', 'Housing', 'Food', 'Health', 'Others']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 8; 

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products'); 
                console.log("API Response:", response.data); // for debugging
                if (response.data && Array.isArray(response.data.data)) {
                    setProducts(response.data.data);
                } else {
                    throw new Error("API did not return an array");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to fetch products");
            } finally {
                setLoading(false); 
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product => 
        (selectedCategory === 'All' || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reference: https://www.npmjs.com/package/react-paginate

    // Calculate pagination
    const offset = currentPage * itemsPerPage;
    const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

    // Handle page change
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    if (loading) return (
        <div className="text-center py-8" style={{ backgroundColor: 'var(--background-light)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
                 style={{ borderColor: 'var(--main-color)' }}></div>
            <p className="mt-2" style={{ color: 'var(--dark-brown)' }}>Loading Products...</p>
        </div>
    );
    
    if (error) return (
        <div className="text-center py-8" style={{ color: 'var(--dark-brown)', backgroundColor: 'var(--background-light)' }}>
            {error}
        </div>
    );

    return (
        <div style={{ backgroundColor: 'var(--background-light)' }} className="min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8 p-4 rounded-lg min-h-[250px]"
                    style={{
                        backgroundImage: 'url("../assets/pet-shop-banner.png")',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                    <div className="flex justify-between items-center w-full mt-auto p-4 rounded-lg">
                        <h1 className="text-5xl font-extrabold" style={{ color: 'var(--dark-brown)' }}>
                            Petopia Pet Shop
                        </h1>
                        <CartButton />
                    </div>
                </div>

                {/* Search and Category Filter */}
                <div className="mb-8 flex flex-wrap gap-4 items-center p-4 rounded-lg" 
                     style={{ backgroundColor: 'var(--light-grey)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {/* Search Input */}
                    <div className="flex-grow">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="w-full px-4 py-2 rounded focus:outline-none focus:ring-2"
                            style={{ 
                                border: '1px solid var(--light-purple)',
                                backgroundColor: 'var(--white)',
                                color: 'var(--dark-brown)',
                                focusRing: 'var(--main-color)'
                            }}
                        />
                    </div>

                    {/* Category Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setCurrentPage(0);
                                }}
                                className="px-4 py-2 rounded transition-all duration-200"
                                style={{
                                    backgroundColor: selectedCategory === category 
                                        ? 'var(--main-color)' 
                                        : 'var(--light-purple)',
                                    color: selectedCategory === category 
                                        ? 'var(--white)' 
                                        : 'var(--dark-brown)',
                                    boxShadow: selectedCategory === category 
                                        ? '0 2px 4px rgba(0,0,0,0.2)' 
                                        : 'none'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center mt-8 p-8 rounded-lg" 
                         style={{ backgroundColor: 'var(--light-grey)', color: 'var(--dark-brown)' }}>
                        <p className="text-xl">No products found</p>
                        <p className="mt-2">Try adjusting your search or category filter</p>
                    </div>
                )}

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
        </div>
    );
};

export default ProductsShopPage;