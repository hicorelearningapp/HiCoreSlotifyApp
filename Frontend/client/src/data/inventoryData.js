const inventoryData = [
  // =========================================================
  // JEWELLERY
  // =========================================================

  {
    id: 'INV-001',
    sku: 'JWL-GC-001',
    name: 'Classic Gold Chain',
    category: 'Jewellery',
    productType: 'Gold Chain',
    price: 28500,
    stock: 12,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-002',
    sku: 'JWL-DP-002',
    name: 'Diamond Pendant Necklace',
    category: 'Jewellery',
    productType: 'Pendant',
    price: 45000,
    stock: 4,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'Low Stock',
    image:
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-003',
    sku: 'JWL-EA-003',
    name: 'Traditional Gold Earrings',
    category: 'Jewellery',
    productType: 'Earrings',
    price: 18500,
    stock: 15,
    unit: 'Pairs',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-004',
    sku: 'JWL-RG-004',
    name: 'Elegant Gold Ring',
    category: 'Jewellery',
    productType: 'Ring',
    price: 12500,
    stock: 0,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'Out of Stock',
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85',
  },

  // =========================================================
  // ACCESSORIES
  // =========================================================

  {
    id: 'INV-005',
    sku: 'ACC-PB-005',
    name: 'Pearl Fashion Bracelet',
    category: 'Accessories',
    productType: 'Bracelet',
    price: 1299,
    stock: 24,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-006',
    sku: 'ACC-HC-006',
    name: 'Designer Hair Clip Set',
    category: 'Accessories',
    productType: 'Hair Accessory',
    price: 599,
    stock: 3,
    unit: 'Sets',
    lowStockLimit: 5,
    status: 'Low Stock',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-007',
    sku: 'ACC-FH-007',
    name: 'Fashion Handbag',
    category: 'Accessories',
    productType: 'Handbag',
    price: 2499,
    stock: 18,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-008',
    sku: 'ACC-SG-008',
    name: 'Premium Sunglasses',
    category: 'Accessories',
    productType: 'Sunglasses',
    price: 1799,
    stock: 0,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'Out of Stock',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=85',
  },

  // =========================================================
  // SAREES
  // =========================================================

  {
    id: 'INV-009',
    sku: 'SAR-KS-009',
    name: 'Kanchipuram Silk Saree',
    category: 'Sarees',
    productType: 'Silk Saree',
    price: 8499,
    stock: 10,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-010',
    sku: 'SAR-BS-010',
    name: 'Designer Banarasi Saree',
    category: 'Sarees',
    productType: 'Banarasi Saree',
    price: 6999,
    stock: 2,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'Low Stock',
    image:
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-011',
    sku: 'SAR-CH-011',
    name: 'Cotton Handloom Saree',
    category: 'Sarees',
    productType: 'Cotton Saree',
    price: 1899,
    stock: 30,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=700&q=85',
  },

  {
    id: 'INV-012',
    sku: 'SAR-DS-012',
    name: 'Designer Festive Saree',
    category: 'Sarees',
    productType: 'Designer Saree',
    price: 5499,
    stock: 0,
    unit: 'Pieces',
    lowStockLimit: 5,
    status: 'Out of Stock',
    image:
      'https://images.unsplash.com/photo-1590735213920-68192a487bc2?auto=format&fit=crop&w=700&q=85',
  },
];

export default inventoryData;