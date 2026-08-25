import React, { useMemo, useState } from 'react';

import {
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiChevronRight,
  FiPlus,
  FiEye,
  FiBox,
  FiLayers,
  FiCheckCircle,
  FiDollarSign,
} from 'react-icons/fi';

import productData from '../../data/productData';

const EcomDashboard = ({ setActivePage }) => {
  const COLORS = {
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#F3E8FF',
    primarySoft: '#FAF5FF',
    heading: '#0F172A',
    text: '#334155',
    muted: '#64748B',
    placeholder: '#94A3B8',
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    background: '#F8FAFC',
    success: '#16A34A',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    blue: '#2563EB',
    blueBg: '#EFF6FF',
  };

  const [activeCategory, setActiveCategory] = useState('All');

  const allProducts = useMemo(() => {
    const jewellery = productData?.Jewellery || [];
    const accessories = productData?.Accessories || [];
    const sarees = productData?.Sarees || [];

    return [
      ...jewellery.map((product) => ({ ...product, category: 'Jewellery' })),
      ...accessories.map((product) => ({ ...product, category: 'Accessories' })),
      ...sarees.map((product) => ({ ...product, category: 'Sarees' })),
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts;
    return allProducts.filter((product) => product.category === activeCategory);
  }, [allProducts, activeCategory]);

  const totalProducts = allProducts.length;

  const totalStock = allProducts.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const inventoryValue = allProducts.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.stock || 0),
    0
  );

  const lowStockProducts = allProducts.filter(
    (product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5
  );

  const outOfStockProducts = allProducts.filter(
    (product) => Number(product.stock || 0) === 0
  );

  const jewelleryProducts = allProducts.filter(
    (product) => product.category === 'Jewellery'
  );

  const accessoryProducts = allProducts.filter(
    (product) => product.category === 'Accessories'
  );

  const sareeProducts = allProducts.filter(
    (product) => product.category === 'Sarees'
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);

  const getCategoryValue = (products) =>
    products.reduce(
      (total, product) =>
        total + Number(product.price || 0) * Number(product.stock || 0),
      0
    );

  const getCategoryStock = (products) =>
    products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0
    );

  const topProducts = [...filteredProducts]
    .sort(
      (a, b) =>
        Number(b.price || 0) * Number(b.stock || 0) -
        Number(a.price || 0) * Number(a.stock || 0)
    )
    .slice(0, 5);

  const recentProducts = [...filteredProducts].slice(0, 4);

  const categoryData = [
    {
      name: 'Jewellery',
      products: jewelleryProducts,
      icon: '💎',
    },
    {
      name: 'Accessories',
      products: accessoryProducts,
      icon: '👜',
    },
    {
      name: 'Sarees',
      products: sareeProducts,
      icon: '🥻',
    },
  ];

  const goTo = (page) => {
    if (setActivePage) setActivePage(page);
  };

  const getStockStatus = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) return 'Out of Stock';
    if (value <= 5) return 'Low Stock';

    return 'In Stock';
  };

  const getStatusStyle = (status) => {
    if (status === 'In Stock') {
      return {
        backgroundColor: COLORS.successBg,
        color: COLORS.success,
      };
    }

    if (status === 'Low Stock') {
      return {
        backgroundColor: COLORS.warningBg,
        color: COLORS.warning,
      };
    }

    return {
      backgroundColor: COLORS.dangerBg,
      color: COLORS.danger,
    };
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBackground,
    iconColor,
    trend,
    trendUp,
  }) => (
    <div className="bg-white border rounded-2xl p-5 transition-all hover:shadow-md" style={{ borderColor: COLORS.border }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
            {title}
          </p>

          <h3 className="text-2xl lg:text-3xl font-bold mt-2" style={{ color: COLORS.heading }}>
            {value}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: trendUp ? COLORS.success : COLORS.danger }}>
                {trendUp ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
                {trend}
              </span>
            )}

            <span className="text-xs" style={{ color: COLORS.muted }}>
              {subtitle}
            </span>
          </div>
        </div>

        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBackground, color: iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full p-5 lg:p-8 pb-12 font-sans" style={{ backgroundColor: COLORS.background }}>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-7">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
              <FiShoppingBag size={23} />
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: COLORS.heading }}>
                Dashboard
              </h1>

              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Welcome back, HiCore
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => goTo('All Products')}
            className="px-4 py-2.5 rounded-xl border bg-white text-sm font-semibold flex items-center gap-2 hover:bg-gray-50"
            style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
          >
            <FiEye size={16} />
            View Products
          </button>

          <button
            type="button"
            onClick={() => goTo('Add Product')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            style={{ backgroundColor: COLORS.primary }}
          >
            <FiPlus size={17} />
            Add Product
          </button>

        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle="products listed"
          trend="+12%"
          trendUp
          icon={<FiShoppingBag size={22} />}
          iconBackground={COLORS.primaryLight}
          iconColor={COLORS.primary}
        />

        <StatCard
          title="Total Stock"
          value={totalStock}
          subtitle="units available"
          trend="+8.4%"
          trendUp
          icon={<FiPackage size={22} />}
          iconBackground={COLORS.blueBg}
          iconColor={COLORS.blue}
        />

        <StatCard
          title="Inventory Value"
          value={formatPrice(inventoryValue)}
          subtitle="current stock value"
          trend="+14.2%"
          trendUp
          icon={<FiDollarSign size={22} />}
          iconBackground={COLORS.successBg}
          iconColor={COLORS.success}
        />

        <StatCard
          title="Low Stock"
          value={lowStockProducts.length}
          subtitle="need attention"
          icon={<FiAlertTriangle size={22} />}
          iconBackground={COLORS.warningBg}
          iconColor={COLORS.warning}
        />

      </div>

      {/* SALES + STORE SUMMARY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

        {/* SALES OVERVIEW */}
        <div className="xl:col-span-2 bg-white border rounded-2xl p-5 lg:p-6" style={{ borderColor: COLORS.border }}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                Sales Overview
              </h2>

              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Your store performance over the last 7 days
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: COLORS.successBg, color: COLORS.success }}>
              +18.6% this week
            </div>

          </div>

          {/* SALES NUMBERS */}
          <div className="grid grid-cols-2 gap-4 mb-6">

            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primarySoft }}>
              <div className="text-xs mb-1" style={{ color: COLORS.muted }}>
                Total Sales
              </div>

              <div className="text-2xl font-bold" style={{ color: COLORS.heading }}>
                ₹1,24,850
              </div>

              <div className="text-xs mt-1" style={{ color: COLORS.success }}>
                ↑ 18.6% vs last week
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.background }}>
              <div className="text-xs mb-1" style={{ color: COLORS.muted }}>
                Orders
              </div>

              <div className="text-2xl font-bold" style={{ color: COLORS.heading }}>
                86
              </div>

              <div className="text-xs mt-1" style={{ color: COLORS.success }}>
                ↑ 11.2% vs last week
              </div>
            </div>

          </div>

          {/* SIMPLE CHART */}
          <div className="h-[180px] relative">

            <div className="absolute inset-0 flex flex-col justify-between">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border-t border-dashed" style={{ borderColor: '#E5E7EB' }} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-between gap-3 px-2 pt-3 pb-5">

              {[42, 60, 48, 76, 65, 88, 72].map((height, index) => (
                <div key={index} className="flex-1 h-full flex items-end justify-center">

                  <div
                    className="w-full max-w-[44px] rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${height}%`,
                      background: index === 5 ? COLORS.primary : '#DDD6FE',
                    }}
                  />

                </div>
              ))}

            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">

              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day} className="text-[10px]" style={{ color: COLORS.muted }}>
                  {day}
                </span>
              ))}

            </div>

          </div>
        </div>

        {/* STORE SUMMARY */}
        <div className="bg-white border rounded-2xl p-5 lg:p-6" style={{ borderColor: COLORS.border }}>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                Store Summary
              </h2>

              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Product distribution
              </p>
            </div>

            <FiLayers size={20} style={{ color: COLORS.primary }} />

          </div>

          <div className="space-y-5">

            {categoryData.map((category) => {
              const count = category.products.length;

              const percentage =
                totalProducts > 0
                  ? Math.round((count / totalProducts) * 100)
                  : 0;

              const stock = getCategoryStock(category.products);
              const value = getCategoryValue(category.products);

              return (
                <div key={category.name}>

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-2">

                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: COLORS.primarySoft }}>
                        {category.icon}
                      </div>

                      <div>
                        <div className="text-sm font-semibold" style={{ color: COLORS.heading }}>
                          {category.name}
                        </div>

                        <div className="text-[11px]" style={{ color: COLORS.muted }}>
                          {count} products
                        </div>
                      </div>

                    </div>

                    <span className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>
                      {percentage}%
                    </span>

                  </div>

                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(percentage, count > 0 ? 4 : 0)}%`,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px]" style={{ color: COLORS.muted }}>
                      {stock} units
                    </span>

                    <span className="text-[10px] font-medium" style={{ color: COLORS.muted }}>
                      {formatPrice(value)}
                    </span>
                  </div>

                </div>
              );
            })}

          </div>

          <button
            type="button"
            onClick={() => goTo('All Products')}
            className="w-full mt-6 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-50"
            style={{ borderColor: '#DDD6FE', color: COLORS.primaryDark }}
          >
            View All Products
            <FiChevronRight size={15} />
          </button>

        </div>

      </div>

      {/* CATEGORY TABS */}
      <div className="bg-white border rounded-2xl p-4 mb-5" style={{ borderColor: COLORS.border }}>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
              Product Overview
            </h2>

            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Quickly monitor your products
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-xl p-1 flex items-center w-fit">

            {['All', 'Jewellery', 'Accessories', 'Sarees'].map((tab) => {
              const active = activeCategory === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategory(tab)}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: active ? COLORS.primaryLight : 'transparent',
                    color: active ? COLORS.primaryDark : COLORS.text,
                  }}
                >
                  {tab}
                </button>
              );
            })}

          </div>

        </div>
      </div>

      {/* TOP PRODUCTS + INVENTORY ALERTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* TOP PRODUCTS */}
        <div className="xl:col-span-2 bg-white border rounded-2xl overflow-hidden" style={{ borderColor: COLORS.border }}>

          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>

            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                Top Products
              </h2>

              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Your most valuable products
              </p>
            </div>

            <button
              type="button"
              onClick={() => goTo('All Products')}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: COLORS.primary }}
            >
              View All
              <FiChevronRight size={14} />
            </button>

          </div>

          <div className="p-2">

            {topProducts.length > 0 ? (
              topProducts.map((product, index) => {
                const status = getStockStatus(product.stock);

                return (
                  <div key={product.id || index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">

                    <div className="w-6 text-center text-xs font-bold" style={{ color: COLORS.muted }}>
                      #{index + 1}
                    </div>

                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: COLORS.background }}>

                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: COLORS.primary }}>
                          <FiPackage size={20} />
                        </div>
                      )}

                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="text-sm font-bold truncate" style={{ color: COLORS.heading }}>
                        {product.name}
                      </div>

                      <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
                        {product.category} • {product.type || product.material || 'Product'}
                      </div>

                    </div>

                    <div className="hidden sm:block text-right">

                      <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
                        {formatPrice(product.price)}
                      </div>

                      <div className="text-[11px] mt-1" style={{ color: COLORS.muted }}>
                        {product.stock || 0} in stock
                      </div>

                    </div>

                    <span
                      className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={getStatusStyle(status)}
                    >
                      <FiCheckCircle size={11} />
                      {status}
                    </span>

                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm" style={{ color: COLORS.muted }}>
                No products found.
              </div>
            )}

          </div>
        </div>

        {/* INVENTORY ALERTS */}
        <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: COLORS.border }}>

          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>

            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                Inventory Alerts
              </h2>

              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Products needing attention
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.warningBg, color: COLORS.warning }}>
              <FiAlertTriangle size={18} />
            </div>

          </div>

          <div className="p-4">

            {/* LOW STOCK */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-3" style={{ backgroundColor: COLORS.warningBg }}>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center" style={{ color: COLORS.warning }}>
                  <FiAlertTriangle size={17} />
                </div>

                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
                    Low Stock
                  </div>

                  <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                    Needs restocking
                  </div>
                </div>

              </div>

              <span className="text-lg font-bold" style={{ color: COLORS.warning }}>
                {lowStockProducts.length}
              </span>

            </div>

            {/* OUT OF STOCK */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-5" style={{ backgroundColor: COLORS.dangerBg }}>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center" style={{ color: COLORS.danger }}>
                  <FiBox size={17} />
                </div>

                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
                    Out of Stock
                  </div>

                  <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                    Currently unavailable
                  </div>
                </div>

              </div>

              <span className="text-lg font-bold" style={{ color: COLORS.danger }}>
                {outOfStockProducts.length}
              </span>

            </div>

            {/* NEEDS ATTENTION */}
            <div>

              <div className="flex items-center justify-between mb-3">

                <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>
                  Needs Attention
                </h3>

                <span className="text-[11px]" style={{ color: COLORS.muted }}>
                  Stock ≤ 5
                </span>

              </div>

              {[...lowStockProducts, ...outOfStockProducts]
                .slice(0, 4)
                .map((product, index) => (
                  <div key={product.id || index} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: COLORS.border }}>

                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">

                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
                          <FiPackage size={15} />
                        </div>
                      )}

                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="text-xs font-semibold truncate" style={{ color: COLORS.heading }}>
                        {product.name}
                      </div>

                      <div className="text-[10px] mt-1" style={{ color: COLORS.muted }}>
                        {product.stock || 0} {product.stock === 1 ? 'unit' : 'units'} left
                      </div>

                    </div>

                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color:
                          Number(product.stock || 0) === 0
                            ? COLORS.danger
                            : COLORS.warning,
                      }}
                    >
                      {Number(product.stock || 0) === 0 ? 'Out' : 'Low'}
                    </span>

                  </div>
                ))}

              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                <div className="text-center py-5 text-xs" style={{ color: COLORS.muted }}>
                  All products have sufficient stock.
                </div>
              )}

            </div>

            <button
              type="button"
              onClick={() => goTo('Inventory')}
              className="w-full mt-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-50"
              style={{ borderColor: '#DDD6FE', color: COLORS.primaryDark }}
            >
              Manage Inventory
              <FiChevronRight size={15} />
            </button>

          </div>
        </div>

      </div>

      {/* RECENT PRODUCTS */}
      <div className="bg-white border rounded-2xl mt-5 overflow-hidden" style={{ borderColor: COLORS.border }}>

        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>

          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
              Recent Products
            </h2>

            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Recently added products
            </p>
          </div>

          <button
            type="button"
            onClick={() => goTo('All Products')}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: COLORS.primary }}
          >
            View All
            <FiChevronRight size={14} />
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">

          {recentProducts.map((product, index) => {
            const status = getStockStatus(product.stock);

            return (
              <div
                key={product.id || index}
                className="border rounded-xl overflow-hidden cursor-pointer group hover:shadow-md transition-all"
                style={{ borderColor: COLORS.border }}
                onClick={() => goTo('All Products')}
              >

                {/* IMAGE */}
                <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: COLORS.background }}>

                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: COLORS.primary }}>
                      <FiShoppingBag size={30} />
                    </div>
                  )}

                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: COLORS.successBg, color: COLORS.success }}
                  >
                    Active
                  </span>

                </div>

                {/* CONTENT */}
                <div className="p-4">

                  <div className="text-[10px] font-medium mb-1" style={{ color: COLORS.muted }}>
                    {product.category}
                  </div>

                  <h3 className="text-sm font-bold truncate" style={{ color: COLORS.heading }}>
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-3">

                    <span className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>
                      {formatPrice(product.price)}
                    </span>

                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color:
                          status === 'In Stock'
                            ? COLORS.success
                            : status === 'Low Stock'
                            ? COLORS.warning
                            : COLORS.danger,
                      }}
                    >
                      {product.stock || 0} stock
                    </span>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {recentProducts.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: COLORS.muted }}>
            No products available.
          </div>
        )}

      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

        <button
          type="button"
          onClick={() => goTo('Add Product')}
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-purple-300 hover:shadow-sm transition-all"
          style={{ borderColor: COLORS.border }}
        >

          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
            <FiPlus size={21} />
          </div>

          <div>
            <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
              Add Product
            </div>

            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Add a new product
            </div>
          </div>

          <FiChevronRight className="ml-auto" style={{ color: COLORS.placeholder }} />

        </button>

        <button
          type="button"
          onClick={() => goTo('Inventory')}
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-purple-300 hover:shadow-sm transition-all"
          style={{ borderColor: COLORS.border }}
        >

          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.warningBg, color: COLORS.warning }}>
            <FiPackage size={21} />
          </div>

          <div>
            <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
              Manage Inventory
            </div>

            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Update your stock
            </div>
          </div>

          <FiChevronRight className="ml-auto" style={{ color: COLORS.placeholder }} />

        </button>

        <button
          type="button"
          onClick={() => goTo('Categories')}
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-purple-300 hover:shadow-sm transition-all"
          style={{ borderColor: COLORS.border }}
        >

          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.blueBg, color: COLORS.blue }}>
            <FiLayers size={21} />
          </div>

          <div>
            <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
              Categories
            </div>

            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Organize products
            </div>
          </div>

          <FiChevronRight className="ml-auto" style={{ color: COLORS.placeholder }} />

        </button>

      </div>

    </div>
  );
};

export default EcomDashboard;