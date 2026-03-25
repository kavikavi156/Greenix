import React, { useState, useRef } from 'react';

const FertilizerShop = () => {
  // 1. References for smooth scrolling
  const filterSectionRef = useRef(null);
  const productsSectionRef = useRef(null);

  // Filter state
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100);

  // Dummy product data
  const productsData = [
    { id: 1, name: 'Organic Compost', type: 'Organic', price: 25, image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400' },
    { id: 2, name: 'Urea Fertilizer', type: 'Chemical', price: 40, image: 'https://images.unsplash.com/photo-1588602613145-88d447f52554?auto=format&fit=crop&q=80&w=400' },
    { id: 3, name: 'Bone Meal', type: 'Organic', price: 30, image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=400' },
    { id: 4, name: 'NPK 10-10-10', type: 'Chemical', price: 45, image: 'https://images.unsplash.com/photo-1628172605370-55e1074e64f7?auto=format&fit=crop&q=80&w=400' },
    { id: 5, name: 'Seaweed Extract', type: 'Organic', price: 50, image: 'https://images.unsplash.com/photo-1582216514434-7cd5046247c4?auto=format&fit=crop&q=80&w=400' },
    { id: 6, name: 'Ammonium Sulfate', type: 'Chemical', price: 35, image: 'https://images.unsplash.com/photo-1596541530182-d45ff29df21d?auto=format&fit=crop&q=80&w=400' },
  ];

  // 2. Scroll handler function using scrollIntoView
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter products based on selected states
  const filteredProducts = productsData.filter((product) => {
    const isTypeError = selectedType !== 'All' && product.type !== selectedType;
    const isPriceError = product.price > maxPrice;
    return !isTypeError && !isPriceError;
  });

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* 3. Navbar with Icons */}
      <nav className="fixed top-0 w-full bg-white shadow-sm border-b border-gray-100 z-50 flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-3 cursor-pointer">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-4M8 11l4 4 4-4m-4-8v12" />
          </svg>
          <span className="text-2xl font-extrabold text-green-800 tracking-tight">Fertili<span className="text-green-500">Shop</span></span>
        </div>

        <div className="flex items-center gap-8">
          {/* Filter Navigation Button */}
          <button 
            onClick={() => scrollToSection(filterSectionRef)}
            className="group flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold transition-all focus:outline-none"
          >
            <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>

          {/* Products Navigation Button */}
          <button 
            onClick={() => scrollToSection(productsSectionRef)}
            className="group flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold transition-all focus:outline-none"
          >
            <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Fertilizer Products
          </button>
        </div>
      </nav>

      {/* Hero Header Space */}
      <header className="pt-32 pb-20 px-8 text-center bg-gradient-to-br from-green-50 to-green-100">
        <h1 className="text-5xl font-extrabold text-green-900 mb-6 tracking-tight">
          Nurture Your Soil, <br/> Maximize Your Yield
        </h1>
        <p className="text-lg text-green-700 max-w-2xl mx-auto font-medium">
           Explore our wide range of premium fertilizers carefully curated for both commercial and personal use.
        </p>
      </header>

      {/* 4. Filter Section */}
      <section ref={filterSectionRef} className="py-16 px-8 max-w-7xl mx-auto cursor-default">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Filter Selection</h2>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          {/* Fertilizer Type Filter */}
          <div className="flex flex-col gap-3 w-full md:w-1/3">
            <label className="font-semibold text-gray-700">Fertilizer Type</label>
            <div className="relative">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-gray-50 text-gray-800 font-medium transition-all"
              >
                <option value="All">All Types</option>
                <option value="Organic">Organic Fertilizers</option>
                <option value="Chemical">Chemical Fertilizers</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-3 w-full md:w-1/2 md:ml-auto">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-gray-700">Price Range</label>
              <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">Up to ${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600 mt-2"
            />
            <div className="flex justify-between text-sm font-medium text-gray-400 mt-1">
              <span>$0</span>
              <span>$50</span>
              <span>$100</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Products Listing Section */}
      <section ref={productsSectionRef} className="py-16 px-8 max-w-7xl mx-auto min-h-screen">
        <div className="flex justify-between items-end mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Fertilizer Products</h2>
          </div>
          <p className="text-gray-500 font-medium hidden sm:block">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 && 's'}
          </p>
        </div>
        
        {/* Dynamic Display of Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group cursor-pointer">
                
                {/* Product Image */}
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                  
                  {/* Category Badge */}
                  <div className={`absolute top-4 left-4 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm text-white flex items-center gap-1 ${product.type === 'Organic' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full opacity-75"></span>
                    {product.type}
                  </div>
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-green-50">
                       <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       Quick Add
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                    Premium {product.type.toLowerCase()} fertilizer designed to enrich your soil and promote healthy growth.
                  </p>
                  
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">${product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Footer Minimal */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
           <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-4M8 11l4 4 4-4m-4-8v12" /></svg>
           <span className="text-xl font-bold text-white tracking-tight">FertiliShop</span>
        </div>
        <p className="text-sm">&copy; 2026 FertiliShop. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default FertilizerShop;
