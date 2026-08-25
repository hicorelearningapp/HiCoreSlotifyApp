import React, { useState, useRef } from 'react';
import { FiHome, FiChevronRight, FiShoppingBag, FiUploadCloud, FiPlus, FiX } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';

const AddProduct = ({ setActivePage }) => {
  // State for Layout Toggle
  const [categoryType, setCategoryType] = useState('Jewellery'); // 'Jewellery', 'Accessories', 'Sarees'

  // Common State
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  
  // Dynamic Option States
  const [highlights, setHighlights] = useState([]);
  const [chainLengths, setChainLengths] = useState([]);
  const [pendantDesigns, setPendantDesigns] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [tags, setTags] = useState([]);
  
  const fileInputRef = useRef(null);

  // --- Dynamic Option Handlers ---
  const handleAddItem = (setter, currentState, promptText) => {
    const newValue = window.prompt(promptText);
    if (newValue && newValue.trim() !== '') {
      setter([...currentState, newValue.trim()]);
    }
  };

  const handleRemoveItem = (setter, currentState, indexToRemove) => {
    setter(currentState.filter((_, index) => index !== indexToRemove));
  };

  // Helper to get color hex for dots based on text name
  const getColorHex = (name) => {
    const map = { white: '#ffffff', pink: '#ffc0cb', black: '#000000', red: '#ef4444', blue: '#3b82f6', green: '#22c55e' };
    return map[name.toLowerCase()] || '#e5e7eb';
  };

  // --- Image Handlers ---
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Reusable Tag Component ---
  const TagItem = ({ text, onRemove, showColorDot }) => (
    <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
      {showColorDot && (
        <div 
          className="w-3.5 h-3.5 rounded-full border border-gray-300" 
          style={{ backgroundColor: getColorHex(text) }}
        ></div>
      )}
      {text}
      <FiX className="cursor-pointer text-gray-400 hover:text-gray-600 ml-1" onClick={onRemove} />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 w-full pb-12 font-sans">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <FiHome 
          className="cursor-pointer hover:text-gray-800 transition-colors" 
          onClick={() => setActivePage && setActivePage('Dashboard')} 
        />
        <FiChevronRight size={14} />
        <span 
          className="cursor-pointer hover:text-gray-800 transition-colors" 
          onClick={() => setActivePage && setActivePage('All Products')}
        >
          Products
        </span>
        <FiChevronRight size={14} />
        <span className="font-medium text-gray-800">Add Product</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FiShoppingBag size={28} className="text-purple-700" />
            <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
          </div>
          <p className="text-gray-500 text-sm md:ml-10">Add a new product and start selling on Instagram & WhatsApp</p>
        </div>
        
        {/* Category Layout Switcher */}
        <div className="bg-white border border-purple-200 rounded-lg p-1.5 shadow-sm inline-flex w-fit">
           <button onClick={() => setCategoryType('Jewellery')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${categoryType === 'Jewellery' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Jewellery</button>
           <button onClick={() => setCategoryType('Accessories')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${categoryType === 'Accessories' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Accessories</button>
           <button onClick={() => setCategoryType('Sarees')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${categoryType === 'Sarees' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Sarees</button>
        </div>
      </div>

      {/* Main Grid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Product Information</h2>

            <div className="space-y-6">
              
              {/* === ACCESSORIES LAYOUT UNIQUE HEADER === */}
              {categoryType === 'Accessories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. Pearl Fashion Bracelet" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none bg-white">
                      <option>General Accessory</option>
                      <option>Hair Accessory</option>
                    </select>
                  </div>
                </div>
              )}

              {/* === SAREES & JEWELLERY STANDARD HEADER === */}
              {categoryType !== 'Accessories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder={categoryType === 'Sarees' ? "e.g. Kanchipuram Silk Saree" : "e.g. Gold Chain"} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                </div>
              )}

              {/* Common Accessories Category Select */}
              {categoryType === 'Accessories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between bg-white cursor-pointer">
                     <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-1 rounded text-purple-700"><FiShoppingBag size={14}/></div>
                        <span>Accessories</span>
                     </div>
                     <FiChevronRight className="text-gray-400 rotate-90" />
                  </div>
                </div>
              )}

              {/* Common Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea rows="4" placeholder="Enter product description..." className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-600 outline-none resize-none"></textarea>
                <div className="text-right text-xs text-gray-400 mt-1">0/500</div>
              </div>

              {/* === LAYOUT SPECIFIC: PRICE & STOCK === */}
              {categoryType === 'Accessories' ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price (₹)</label>
                      <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price (₹)</label>
                      <input type="number" placeholder={categoryType === 'Sarees' ? "e.g. 3,499" : "0"} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                    </div>
                 </div>
              )}

              {/* === LAYOUT SPECIFIC: SKU, CATEGORY, MATERIAL, QTY === */}
              {categoryType !== 'Accessories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Product ID (Auto)</label>
                    <input type="text" disabled value="Auto generated" className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none bg-white">
                      <option>{categoryType === 'Sarees' ? 'Sarees' : 'Jewellery'}</option>
                    </select>
                  </div>
                </div>
              )}

              {categoryType === 'Jewellery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white">
                      <option>Select Material</option>
                      <option>22K Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Approx.) <span className="text-red-500">*</span></label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-600">
                      <input type="number" placeholder="0" className="w-full px-4 py-2.5 text-sm outline-none" />
                      <span className="bg-gray-50 border-l border-gray-300 px-4 py-2.5 text-sm text-gray-600 flex items-center">grams</span>
                    </div>
                  </div>
                </div>
              )}

              {categoryType !== 'Accessories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white">
                      <option>Pieces</option>
                    </select>
                  </div>
                </div>
              )}

              {/* === LAYOUT SPECIFIC: VARIANTS (Sarees & Accessories) === */}
              {(categoryType === 'Accessories' || categoryType === 'Sarees') && (
                 <div className={categoryType === 'Accessories' ? '' : 'pt-4 border-t border-gray-100'}>
                    {categoryType === 'Sarees' && (
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-gray-900">Variants</h3>
                        <p className="text-xs text-gray-500">Add colors and sizes available</p>
                      </div>
                    )}
                    
                    <div className="space-y-5">
                      {/* Colors */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Colors</label>
                        {categoryType === 'Accessories' && <p className="text-xs text-gray-500 mb-2">Add available colors</p>}
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color, idx) => (
                            <TagItem key={idx} text={color} showColorDot={true} onRemove={() => handleRemoveItem(setColors, colors, idx)} />
                          ))}
                          <button onClick={() => handleAddItem(setColors, colors, "Enter color name:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                            <FiPlus /> Add Color
                          </button>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Size <span className="font-normal text-gray-500">(Optional)</span></label>
                        {categoryType === 'Accessories' && <p className="text-xs text-gray-500 mb-2">Add sizes or other options (optional)</p>}
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((size, idx) => (
                            <TagItem key={idx} text={size} onRemove={() => handleRemoveItem(setSizes, sizes, idx)} />
                          ))}
                          <button onClick={() => handleAddItem(setSizes, sizes, "Enter size option:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                            <FiPlus /> {categoryType === 'Accessories' ? 'Add Size / Option' : 'Add Size'}
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
              )}

              {/* === LAYOUT SPECIFIC: ACCESSORIES DETAILS === */}
              {categoryType === 'Accessories' && (
                <div className="space-y-5 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Material <span className="font-normal text-gray-500">(Optional)</span></label>
                    <input type="text" placeholder="e.g. Alloy with Pearl" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Care Instructions <span className="font-normal text-gray-500">(Optional)</span></label>
                    <input type="text" placeholder="e.g. Wipe with soft cloth" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Tags <span className="font-normal text-gray-500">(Optional)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                         <TagItem key={idx} text={tag} onRemove={() => handleRemoveItem(setTags, tags, idx)} />
                      ))}
                      <button onClick={() => handleAddItem(setTags, tags, "Enter tag:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                        <FiPlus /> Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === LAYOUT SPECIFIC: JEWELLERY HIGHLIGHTS === */}
              {categoryType === 'Jewellery' && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Product Highlights <span className="text-gray-400 font-normal">(Optional)</span></h3>
                  <p className="text-xs text-gray-500 mb-4">Add key features to stand out</p>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 border border-purple-200 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                         <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">✓</div>
                         {highlight}
                      </div>
                    ))}
                    <button onClick={() => handleAddItem(setHighlights, highlights, "Enter highlight:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-600 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      <FiPlus /> Add Highlight
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Product Images Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Product Images <span className="text-red-500">*</span></h2>
            <p className="text-xs text-gray-500 mb-4">Upload high quality images {categoryType !== 'Sarees' && "(JPG, PNG or WEBP. Max. 5MB each)"}</p>

            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            <div className={`grid ${categoryType === 'Accessories' ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
              
              {/* Display uploaded images */}
              {images.map((imgUrl, index) => (
                <div key={index} className="aspect-square relative rounded-lg border border-gray-200 overflow-hidden group">
                  <img src={imgUrl} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                     <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">✓</div>
                  )}
                  <button onClick={() => removeImage(index)} className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={14} />
                  </button>
                </div>
              ))}

              {/* Accessories layout shows a square upload block next to images */}
              {categoryType === 'Accessories' && images.length < 10 && (
                 <div onClick={handleImageClick} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-purple-700 hover:bg-purple-50 hover:border-purple-400 cursor-pointer transition-colors">
                    <FiUploadCloud size={20} className="mb-1" />
                    <span className="text-[10px] font-semibold text-center">Upload<br/>More</span>
                 </div>
              )}

              {/* Standard layout placeholders if empty */}
              {categoryType !== 'Accessories' && images.length === 0 && (
                <>
                  <div onClick={handleImageClick} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                    <FiUploadCloud size={24} className="mb-2" />
                    <span className="text-xs font-medium text-gray-600">Main Image</span>
                  </div>
                  <div onClick={handleImageClick} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer">
                    <FiPlus size={24} />
                  </div>
                </>
              )}
            </div>

            {/* Sarees & Jewellery layout shows the upload block at the bottom */}
            {categoryType !== 'Accessories' && (
              <div onClick={handleImageClick} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 cursor-pointer transition-colors bg-gray-50/50">
                <FiUploadCloud size={24} className="text-gray-400 mb-1" />
                <span className="font-semibold text-gray-700">Click to upload or drag and drop</span>
                <span className="text-[11px]">PNG, JPG or WEBP (Max. 5MB each)</span>
              </div>
            )}
            
            {categoryType === 'Accessories' && (
               <p className="text-xs text-gray-400 mt-2">You can upload up to 10 images</p>
            )}
          </div>

          {/* Jewellery Specific: Product Variants (Chain / Pendant) */}
          {categoryType === 'Jewellery' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Product Variants <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
              <p className="text-xs text-gray-500 mb-4">Add options like size, length etc.</p>
              
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chain Length</label>
                <div className="flex flex-wrap gap-2">
                  {chainLengths.map((length, idx) => (
                    <span key={idx} className="border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium">{length}</span>
                  ))}
                  <button onClick={() => handleAddItem(setChainLengths, chainLengths, "Enter length:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
                    <FiPlus /> Add Option
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pendant Design</label>
                <div className="flex flex-wrap gap-2">
                  {pendantDesigns.map((design, idx) => (
                    <span key={idx} className="border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium">{design}</span>
                  ))}
                  <button onClick={() => handleAddItem(setPendantDesigns, pendantDesigns, "Enter design:")} className="flex items-center gap-1 border border-dashed border-purple-400 text-purple-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
                    <FiPlus /> Add Option
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Link */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Instagram Reel / Post <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
            <p className="text-xs text-gray-500 mb-4">Link this product to an Instagram Reel or Post</p>

            <div className="relative mb-3">
              <input type="text" placeholder="Paste Instagram Reel URL here" className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none" />
              <FaInstagram className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={18} />
            </div>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <FaInstagram /> Select from Connected Account
            </button>
          </div>

          {/* Interactive Product Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Product Status</h2>
            <p className="text-xs text-gray-500 mb-4">Set product visibility</p>

            <div className="flex items-center gap-3">
              <div onClick={() => setIsActive(!isActive)} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isActive ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{isActive ? 'Active' : 'Draft'}</div>
                <div className="text-xs text-gray-500">{isActive ? 'Product will be visible to customers' : 'Product is hidden from customers'}</div>
              </div>
            </div>
          </div>

          {/* Accessories Layout Tip Box */}
          {categoryType === 'Accessories' && (
             <div className="bg-purple-50 rounded-xl p-4 flex gap-3 items-start text-purple-800">
               <BsStars size={20} className="mt-0.5 flex-shrink-0" />
               <div>
                  <h4 className="text-sm font-bold mb-1">Tip</h4>
                  <p className="text-xs leading-relaxed">After saving, you can generate a WhatsApp link and QR code for this product.</p>
               </div>
             </div>
          )}

        </div>
      </div>

      {/* Buttons Moved to the Bottom Inside the Page Container */}
      <div className="mt-10 pt-6 flex flex-wrap items-center justify-end gap-4 border-t border-gray-200">
        <button className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
          Cancel
        </button>
        <button className="px-6 py-2.5 bg-white border border-purple-600 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer">
          Save as Draft
        </button>
        <button className="px-6 py-2.5 bg-purple-600 rounded-lg text-sm font-semibold text-white hover:bg-purple-700 shadow-sm transition-colors cursor-pointer">
          Save & Publish
        </button>
      </div>

    </div>
  );
};

export default AddProduct;