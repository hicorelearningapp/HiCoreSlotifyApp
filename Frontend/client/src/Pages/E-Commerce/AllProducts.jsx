import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  FiHome,
  FiChevronRight,
  FiShoppingBag,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiChevronDown,
  FiPackage,
  FiTag,
  FiLayers,
  FiCheckCircle,
  FiImage,
  FiInstagram,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiAlertTriangle
} from 'react-icons/fi';

const DEFAULT_IMAGE = "https://via.placeholder.com/400x400?text=No+Image+Available";

// =========================================================
// REUSABLE UI COMPONENTS
// =========================================================
const InfoBox = ({ icon: Icon, label, value, danger = false }) => (
  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8F9FA]">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={15} className="text-[#2A723D]" />
      <span className="text-xs text-[#64748B]">{label}</span>
    </div>
    <div className={`text-sm font-bold ${danger ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>
      {value}
    </div>
  </div>
);

const DetailTags = ({ title, items, isHighlight = false }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold mb-3 text-[#0F172A]">{title}</h4>

      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              isHighlight
                ? 'bg-[#F2F7F4] text-[#2A723D]'
                : 'border border-[#E2E8F0] text-[#334155]'
            }`}
          >
            {isHighlight ? `✓ ${item}` : item}
          </span>
        ))}
      </div>
    </div>
  );
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

// =========================================================
// MAIN COMPONENT
// =========================================================
const AllProducts = ({ setActivePage }) => {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryType, setCategoryType] = useState('Jewellery');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const sellerId = localStorage.getItem('sellerId');

      if (!sellerId) {
        throw new Error("No Seller ID found. Please log in again.");
      }

      const apiBase = import.meta.env.VITE_API_BASE || "/api";

      const response = await fetch(
        `${apiBase}/ecommerce/products?seller_id=${sellerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      const standardKeys = [
        "StockQuantity",
        "Unit",
        "Material",
        "Weight",
        "CareInstructions",
        "Colors",
        "Sizes",
        "Tags",
        "Highlights",
        "ChainLengths",
        "PendantDesigns"
      ];

      const formattedProducts = data.map((item) => {
        const prodData = item.ProductData || {};
        const otherData = {};

        Object.keys(prodData).forEach(key => {
          if (!standardKeys.includes(key) && prodData[key]) {
            otherData[key] = prodData[key];
          }
        });

        const price1 = Number(item.Price) || 0;
        const price2 = item.CompareAtPrice
          ? Number(item.CompareAtPrice)
          : null;

        let sellingPrice = price1;
        let mrpPrice = price2;

        if (price2 && price1 > price2) {
          sellingPrice = price2;
          mrpPrice = price1;
        }

        const productImages = (item.Images || []).map((image) => {
          if (!image) return DEFAULT_IMAGE;

          return image.startsWith("http")
            ? image
            : `${apiBase.replace(/\/$/, "")}${image}`;
        });

        return {
          id: item.Sku || item.Id,
          name: item.ProductName || "Unnamed Product",
          category: item.Category || "Uncategorized",
          type: prodData.ProductType || item.Category || "Product",
          price: sellingPrice,
          compareAtPrice: mrpPrice,
          status: item.Active ? 'Active' : 'Draft',
          description: item.Description || "No description provided.",

          images: productImages,
          reelLink: item.ReelLink || null,

          // Store Raw Dynamic JSON for Editing
          rawProductData: prodData,

          // Mapped Data for the Read-Only Details View
          stock: Number(prodData.StockQuantity) || 0,
          unit: prodData.Unit || 'Pieces',
          material: prodData.Material || null,
          weight: prodData.Weight || null,
          careInstructions: prodData.CareInstructions || null,
          colors: prodData.Colors || [],
          sizes: prodData.Sizes || [],
          tags: prodData.Tags || [],
          highlights: prodData.Highlights || [],
          chainLengths: prodData.ChainLengths || [],
          pendantDesigns: prodData.PendantDesigns || [],
          otherData: otherData
        };
      });

      setApiProducts(formattedProducts);

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const sellerId = localStorage.getItem('sellerId');
      if (!sellerId) throw new Error("No Seller ID found. Please log in again.");

      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const formData = new FormData();

      // Top Level Fields
      formData.append("SellerId", sellerId);
      formData.append("ProductName", editData.name || "");
      formData.append("Category", editData.category || "");
      formData.append("Price", editData.price || 0);
      if (editData.compareAtPrice) {
        formData.append("CompareAtPrice", editData.compareAtPrice);
      }
      formData.append("Description", editData.description || "");
      formData.append("ReelLink", editData.reelLink || "");
      formData.append("Active", editData.status === 'Active');

      // Clean up arrays inside dynamic JSON before submitting
      const cleanedProductData = { ...(editData.rawProductData || {}) };
      Object.keys(cleanedProductData).forEach(key => {
        if (Array.isArray(cleanedProductData[key])) {
          cleanedProductData[key] = cleanedProductData[key].filter(Boolean);
        }
      });
      
      formData.append("ProductData", JSON.stringify(cleanedProductData));

      // Append new images if selected
      if (editData.newImages && editData.newImages.length > 0) {
        Array.from(editData.newImages).forEach((file) => {
          formData.append("Images", file);
        });
      }

      const response = await fetch(`${apiBase}/ecommerce/products/${editData.id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to update product. Please try again.");
      }

      // Close modal and refresh data on success
      setIsEditing(false);
      setSelectedProduct(null);
      await fetchProducts();

    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const response = await fetch(`${apiBase}/ecommerce/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete product. Please try again.");
      }

      // Close modals and refresh on success
      setDeleteConfirmOpen(false);
      setSelectedProduct(null);
      await fetchProducts();

    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper for dynamic ProductData object updates
  const handleRawProductDataChange = (key, value) => {
    setEditData(prev => ({
      ...prev,
      rawProductData: {
        ...(prev.rawProductData || {}),
        [key]: value
      }
    }));
  };

  const products = useMemo(() => {
    let data = apiProducts.filter(
      p => p.category.toLowerCase() === categoryType.toLowerCase()
    );

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      data = data.filter(
        p =>
          p.name.toLowerCase().includes(search) ||
          p.type?.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
      );
    }

    const sorted = [...data];

    if (sortBy === 'priceLow') {
      sorted.sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'priceHigh') {
      sorted.sort((a, b) => b.price - a.price);
    }

    if (sortBy === 'stockLow') {
      sorted.sort((a, b) => a.stock - b.stock);
    }

    return sorted;

  }, [categoryType, searchText, sortBy, apiProducts]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-[#64748B] font-semibold">
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-[#EF4444] font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-12 font-sans bg-[#F8F9FA] text-[#0F172A]">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm mb-6 text-[#64748B]">
        <FiHome
          size={16}
          className="cursor-pointer"
          onClick={() =>
            setActivePage && setActivePage('Dashboard')
          }
        />

        <FiChevronRight size={14} />

        <span className="font-semibold">
          Products
        </span>
      </div>


      {/* HEADER & TABS */}
      <div className="mb-7 flex flex-col xl:flex-row xl:items-center justify-between gap-5">

        <div>
          <div className="flex items-center gap-3 mb-1">

            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F2F7F4] text-[#2A723D]">
              <FiShoppingBag size={24} />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              All Products
            </h1>

          </div>

          <p className="text-sm lg:text-base ml-0 lg:ml-[52px] text-[#64748B]">
            Manage and view all your products
          </p>
        </div>


        <div className="bg-white border border-[#D4E3D9] rounded-xl p-1.5 shadow-sm inline-flex w-fit overflow-x-auto">

          {['Jewellery', 'Accessories', 'Sarees'].map((type) => (

            <button
              key={type}
              onClick={() => {
                setCategoryType(type);
                setSearchText('');
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                categoryType === type
                  ? 'bg-[#F2F7F4] text-[#2A723D]'
                  : 'bg-transparent text-[#334155]'
              }`}
            >
              {type}
            </button>

          ))}

        </div>

      </div>


      {/* SEARCH / FILTER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center justify-between">

        <div className="relative flex-1 max-w-xl">

          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`Search ${categoryType.toLowerCase()}...`}
            className="w-full border border-[#CBD5E1] rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F2F7F4] focus:border-[#2A723D]"
          />

        </div>


        <div className="flex gap-3">

          <div className="relative">

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none border border-[#CBD5E1] rounded-xl pl-10 pr-10 py-3 text-sm outline-none bg-white cursor-pointer text-[#334155]"
            >
              <option value="latest">Latest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="stockLow">Low Stock</option>
            </select>

            <FiFilter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2A723D]"
            />

            <FiChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"
            />

          </div>


          <div className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap bg-[#F2F7F4] text-[#2A723D]">

            <FiPackage size={16} />

            {products.length} Products

          </div>

        </div>

      </div>


      {/* PRODUCT GRID */}
      {products.length > 0 ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

          {products.map((product) => (

            <div
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setSelectedImage(0);
                setIsEditing(false); // Reset editing mode when opening a new one
              }}
              className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              {/* IMAGE AREA */}
              <div className="relative aspect-square overflow-hidden bg-[#F8F9FA]">

                {product.images.length > 0 ? (

                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                ) : (

                  <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8]">

                    <FiImage
                      size={24}
                      className="mb-1 opacity-50"
                    />

                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      No Photo
                    </span>

                  </div>

                )}


                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  product.status === 'Active'
                    ? 'bg-[#ECFDF5] text-[#15803D]'
                    : 'bg-[#FEF2F2] text-[#991B1B]'
                }`}>

                  <FiCheckCircle size={12} />

                  {product.status}

                </div>


                {product.images.length > 1 && (

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white">

                    {product.images.length} Photos

                  </div>

                )}


                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/35">

                  <div className="px-4 py-2 bg-white rounded-lg text-sm font-semibold flex items-center gap-2 text-[#2A723D]">

                    <FiEye size={16} />

                    View Details

                  </div>

                </div>

              </div>


              {/* DETAILS AREA */}
              <div className="p-4">

                <div className="flex items-center justify-between gap-2 mb-2">

                  <span
                    className="text-[11px] truncate font-medium max-w-[120px] text-[#64748B]"
                    title={product.id}
                  >
                    {product.id}
                  </span>

                  <span className="text-[11px] px-2 py-1 rounded-md font-semibold truncate bg-[#F2F7F4] text-[#2A723D]">
                    {product.type}
                  </span>

                </div>


                <h3 className="text-base font-bold mb-2 line-clamp-1">
                  {product.name}
                </h3>


                <div className="flex items-end justify-between gap-3">

                  <div>

                    <div className="text-lg font-bold text-[#2A723D]">
                      {formatPrice(product.price)}
                    </div>

                    {product.compareAtPrice && (

                      <div className="text-xs line-through text-[#94A3B8]">
                        {formatPrice(product.compareAtPrice)}
                      </div>

                    )}

                  </div>


                  <div className="text-right">

                    <div className="text-xs text-[#64748B]">
                      Stock
                    </div>

                    <div className={`text-sm font-bold ${
                      product.stock <= 5
                        ? 'text-[#EF4444]'
                        : 'text-[#334155]'
                    }`}>

                      {product.stock}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="bg-white rounded-2xl border border-[#E2E8F0] py-20 flex flex-col items-center justify-center text-center">

          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#F2F7F4] text-[#2A723D]">

            <FiPackage size={28} />

          </div>

          <h3 className="text-lg font-bold mb-1">
            No products found
          </h3>

          <p className="text-sm text-[#64748B]">
            Try changing your search or category.
          </p>

        </div>

      )}


      {/* =====================================================
          PRODUCT DETAIL & EDIT MODAL
      ===================================================== */}

      {selectedProduct && (

        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedProduct(null);
            setIsEditing(false);
          }}
        >

          <div
            className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">

              <div>

                <div className="text-xs font-semibold mb-1 text-[#2A723D]">
                  {selectedProduct.id}
                </div>

                <h2 className="text-xl lg:text-2xl font-bold">
                  {isEditing ? `Edit: ${selectedProduct.name}` : selectedProduct.name}
                </h2>

              </div>


              <div className="flex items-center gap-3">
                {/* Delete Button */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors bg-[#FEF2F2] text-[#991B1B] hover:bg-red-100"
                  >
                    <FiTrash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) {
                      setEditData({ ...selectedProduct, newImages: null });
                    }
                    setIsEditing(!isEditing);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                    isEditing 
                    ? 'bg-[#FEF2F2] text-[#991B1B] hover:bg-red-100' 
                    : 'bg-[#F2F7F4] text-[#2A723D] hover:bg-[#D4E3D9]'
                  }`}
                >
                  <FiEdit2 size={16} />
                  <span className="hidden sm:inline">{isEditing ? 'Cancel Edit' : 'Edit'}</span>
                </button>

                {/* Close Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsEditing(false);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#F8F9FA] text-[#334155] hover:bg-gray-200 ml-1"
                >
                  <FiX size={20} />
                </button>
              </div>

            </div>


            {/* MODAL BODY */}
            {isEditing ? (
              
              <form onSubmit={handleUpdateProduct} className="p-6 lg:p-8 flex flex-col gap-6">
                
                <h3 className="text-lg font-bold text-[#0F172A] border-b pb-2 mb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Product Name</label>
                    <input 
                      type="text" 
                      value={editData.name || ''} 
                      onChange={e => handleEditChange('name', e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                      required 
                    />
                  </div>
                  
                  {/* Reel Link - Changed from type="url" to type="text" to allow IDs */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Instagram Reel ID </label>
                    <input 
                      type="text" 
                      value={editData.reelLink || ''} 
                      onChange={e => handleEditChange('reelLink', e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                      placeholder="URL or Reel ID" 
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Selling Price (₹)</label>
                    <input 
                      type="number" 
                      value={editData.price || ''} 
                      onChange={e => handleEditChange('price', e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                      required 
                    />
                  </div>

                  {/* MRP Price */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Compare At Price (MRP ₹)</label>
                    <input 
                      type="number" 
                      value={editData.compareAtPrice || ''} 
                      onChange={e => handleEditChange('compareAtPrice', e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Status</label>
                    <select 
                      value={editData.status || 'Active'} 
                      onChange={e => handleEditChange('status', e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D] bg-white cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  {/* Images Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Add/Replace Images</label>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={e => handleEditChange('newImages', e.target.files)} 
                      className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2A723D] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F2F7F4] file:text-[#2A723D] hover:file:bg-[#D4E3D9]" 
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Description</label>
                  <textarea 
                    value={editData.description || ''} 
                    onChange={e => handleEditChange('description', e.target.value)} 
                    className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                    rows={4} 
                    required 
                  ></textarea>
                </div>


                {/* JSON ATTRIBUTES: DYNAMICALLY RENDERED */}
                {editData.rawProductData && Object.keys(editData.rawProductData).length > 0 && (
                  <>
                    <h3 className="text-lg font-bold text-[#0F172A] border-b pb-2 mt-4 mb-2">
                      Product Attributes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(editData.rawProductData).map(([key, value]) => {
                        const isArray = Array.isArray(value);
                        const isNumber = typeof value === 'number';
                        const isBoolean = typeof value === 'boolean';
                        
                        // Capitalize and add spaces to the JSON key for the UI label
                        const formattedLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();

                        return (
                          <div key={key} className={typeof value === 'string' && value.length > 50 ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-semibold mb-2 text-[#0F172A]">
                              {formattedLabel}
                              {isArray && <span className="text-xs text-gray-500 font-normal ml-1">(Comma separated)</span>}
                            </label>
                            
                            {isBoolean ? (
                              <select 
                                value={value ? 'true' : 'false'} 
                                onChange={e => handleRawProductDataChange(key, e.target.value === 'true')} 
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D] bg-white cursor-pointer"
                              >
                                <option value="true">True</option>
                                <option value="false">False</option>
                              </select>
                            ) : typeof value === 'string' && value.length > 50 ? (
                              <textarea 
                                value={value || ''} 
                                onChange={e => handleRawProductDataChange(key, e.target.value)} 
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                                rows={3} 
                              />
                            ) : (
                              <input 
                                type={isNumber ? "number" : "text"} 
                                value={isArray ? value.join(', ') : (value !== null && value !== undefined ? value : '')} 
                                onChange={e => {
                                  let val = e.target.value;
                                  if (isArray) {
                                    val = val.split(',').map(s => s.trimStart());
                                  } else if (isNumber && val !== '') {
                                    val = Number(val);
                                  }
                                  handleRawProductDataChange(key, val);
                                }} 
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-1 focus:ring-[#2A723D]" 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {/* Form Action */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="px-6 py-3 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#334155] hover:bg-[#F8F9FA] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#2A723D] text-white hover:bg-[#1f562d] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiSave size={18} />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              
            ) : (
              <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* IMAGE GALLERY */}
                <div>

                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 flex items-center justify-center bg-[#F8F9FA]">

                    {selectedProduct.images.length > 0 ? (

                      <img
                        src={selectedProduct.images[selectedImage]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain bg-white"
                      />

                    ) : (

                      <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] min-h-[300px]">

                        <FiImage
                          size={48}
                          className="mb-2 opacity-50"
                        />

                        <span className="text-sm font-medium">
                          No Photo Provided
                        </span>

                      </div>

                    )}

                  </div>


                  {selectedProduct.images.length > 1 && (

                    <div className="grid grid-cols-4 gap-3">

                      {selectedProduct.images.map((image, index) => (

                        <button
                          type="button"
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? 'border-[#2A723D]'
                              : 'border-[#E2E8F0]'
                          }`}
                        >

                          <img
                            src={image}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />

                        </button>

                      ))}

                    </div>

                  )}

                </div>


                {/* PRODUCT DETAILS */}
                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F2F7F4] text-[#2A723D]">
                      {selectedProduct.category}
                    </span>

                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      selectedProduct.status === 'Active'
                        ? 'bg-[#ECFDF5] text-[#15803D]'
                        : 'bg-[#FEF2F2] text-[#991B1B]'
                    }`}>

                      {selectedProduct.status}

                    </span>

                  </div>


                  <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-[#0F172A]">
                    {selectedProduct.name}
                  </h3>


                  <div className="flex items-center gap-3 mb-5">

                    <span className="text-2xl font-bold text-[#2A723D]">
                      {formatPrice(selectedProduct.price)}
                    </span>

                    {selectedProduct.compareAtPrice && (

                      <span className="text-sm line-through text-[#94A3B8]">
                        {formatPrice(selectedProduct.compareAtPrice)}
                      </span>

                    )}

                  </div>


                  <div className="mb-6">

                    <h4 className="text-sm font-bold mb-2 text-[#0F172A]">
                      Description
                    </h4>

                    <p className="text-sm leading-6 whitespace-pre-wrap text-[#64748B]">
                      {selectedProduct.description}
                    </p>

                  </div>


                  {/* INSTAGRAM REEL LINK */}
                  {selectedProduct.reelLink && (

                    <div className="mb-6">

                      <h4 className="text-sm font-bold mb-3 text-[#0F172A]">
                        Instagram Link
                      </h4>

                      <a
                        href={selectedProduct.reelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-semibold text-[#2A723D] bg-[#F2F7F4] px-4 py-2.5 rounded-xl w-fit hover:bg-[#D4E3D9] transition-colors"
                      >

                        <FiInstagram size={18} />

                        View Reel / Post

                      </a>

                    </div>

                  )}


                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-3 mb-6">

                    {selectedProduct.type && (

                      <InfoBox
                        icon={FiTag}
                        label="Product Type"
                        value={selectedProduct.type}
                      />

                    )}

                    <InfoBox
                      icon={FiPackage}
                      label="Stock"
                      value={`${selectedProduct.stock} ${selectedProduct.unit}`}
                      danger={selectedProduct.stock <= 5}
                    />

                    {selectedProduct.material && (

                      <InfoBox
                        icon={FiLayers}
                        label="Material"
                        value={selectedProduct.material}
                      />

                    )}

                    {selectedProduct.weight && (

                      <InfoBox
                        icon={FiLayers}
                        label="Approx. Weight"
                        value={`${selectedProduct.weight} grams`}
                      />

                    )}

                  </div>


                  {/* TAGS & LISTS */}

                  <DetailTags
                    title="Product Highlights"
                    items={selectedProduct.highlights}
                    isHighlight={true}
                  />

                  <DetailTags
                    title="Available Colors"
                    items={selectedProduct.colors}
                  />

                  <DetailTags
                    title="Available Sizes"
                    items={selectedProduct.sizes}
                  />

                  <DetailTags
                    title="Chain Lengths"
                    items={selectedProduct.chainLengths}
                  />

                  <DetailTags
                    title="Pendant Designs"
                    items={selectedProduct.pendantDesigns}
                  />


                  {selectedProduct.tags &&
                    selectedProduct.tags.length > 0 && (

                      <div className="mb-6">

                        <h4 className="text-sm font-bold mb-3 text-[#0F172A]">
                          Tags
                        </h4>

                        <div className="flex flex-wrap gap-2">

                          {selectedProduct.tags.map(tag => (

                            <span
                              key={tag}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8F0] bg-[#F8F9FA] text-[#64748B]"
                            >
                              #{tag}
                            </span>

                          ))}

                        </div>

                      </div>

                    )}


                  {selectedProduct.careInstructions && (

                    <div className="p-4 rounded-xl mb-6 bg-[#F8F9FA]">

                      <div className="text-xs font-bold mb-1 text-[#0F172A]">
                        Care Instructions
                      </div>

                      <p className="text-xs text-[#64748B]">
                        {selectedProduct.careInstructions}
                      </p>

                    </div>

                  )}


                  {selectedProduct.otherData &&
                    Object.keys(selectedProduct.otherData).length > 0 && (

                      <div className="mb-6">

                        <h4 className="text-sm font-bold mb-3 text-[#0F172A]">
                          Additional Details
                        </h4>

                        <div className="grid grid-cols-2 gap-3">

                          {Object.entries(selectedProduct.otherData).map(([k, v]) => (

                            <div
                              key={k}
                              className="p-3 border rounded-lg border-[#E2E8F0] bg-[#F8F9FA]"
                            >

                              <div className="text-xs font-semibold mb-1 text-[#64748B]">
                                {k}
                              </div>

                              <div className="text-sm font-bold text-[#0F172A]">
                                {v}
                              </div>

                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                </div>

              </div>
            )}

            {/* =====================================================
                DELETE CONFIRMATION MODAL (POPUP)
            ===================================================== */}
            {deleteConfirmOpen && (
              <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
                <div 
                  className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in-up"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-4">
                    <FiAlertTriangle size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">Delete Product?</h3>
                  
                  <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-[#0F172A]">"{selectedProduct.name}"</span>? This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      disabled={isDeleting}
                      className="px-4 py-2.5 text-sm font-semibold text-[#334155] bg-[#F8F9FA] hover:bg-[#E2E8F0] rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={isDeleting}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default AllProducts;