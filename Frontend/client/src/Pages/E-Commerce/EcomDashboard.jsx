import React, { useState, useEffect } from 'react';

import {
  FiShoppingBag,
  FiPackage,
  FiAlertTriangle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiChevronRight,
  FiPlus,
  FiEye,
  FiBox,
  FiDollarSign,
} from 'react-icons/fi';

const EcomDashboard = ({ setActivePage }) => {
  const COLORS = {
    primary: '#2A723D',
    primaryDark: '#235d32',
    primaryLight: '#F2F7F4',
    primarySoft: '#F9FCFA',
    heading: '#0F172A',
    text: '#334155',
    muted: '#64748B',
    placeholder: '#94A3B8',
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    background: '#F8F9FA',
    success: '#16A34A',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    blue: '#2563EB',
    blueBg: '#EFF6FF',
  };

  // =========================================================
  // STATE
  // =========================================================
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('week1');

  // =========================================================
  // API FETCH
  // =========================================================
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const sellerId = localStorage.getItem('sellerId');
        if (!sellerId) return;

        const apiBase = import.meta.env.VITE_API_BASE || "/api";
        const response = await fetch(`${apiBase}/ecommerce/dashboard?seller_id=${sellerId}`);
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);

          // Set default month to current month short name (e.g., 'Sep')
          const currentMonthShort = new Date().toLocaleString('default', { month: 'short' });
          
          if (data.OrdersAndSales && data.OrdersAndSales[currentMonthShort]) {
            setSelectedMonth(currentMonthShort);
            const weeks = Object.keys(data.OrdersAndSales[currentMonthShort]);
            if (weeks.length > 0) {
              setSelectedWeek(weeks[weeks.length - 1]); // Default to latest week
            }
          } else if (data.OrdersAndSales) {
            // Fallback to the first available month if current month has no data
            const availableMonths = Object.keys(data.OrdersAndSales).filter(m => Object.keys(data.OrdersAndSales[m]).length > 0);
            if (availableMonths.length > 0) {
              setSelectedMonth(availableMonths[0]);
              const weeks = Object.keys(data.OrdersAndSales[availableMonths[0]]);
              setSelectedWeek(weeks[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error);
      }
    };

    fetchDashboardMetrics();
  }, []);

  // =========================================================
  // CHART DATA CALCULATION
  // =========================================================
  const monthData = dashboardData?.OrdersAndSales?.[selectedMonth] || {};
  const weekData = monthData[selectedWeek] || {};

  let weeklySales = 0;
  let weeklyOrders = 0;
  
  // Base structure for the 7 days
  const chartData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  Object.entries(weekData).forEach(([dayKey, stats]) => {
    // Expected dayKey format from API: "Tuesday(01.09.2026)"
    weeklySales += stats.Sales || 0;
    weeklyOrders += stats.Orders || 0;
    
    const shortDay = dayKey.substring(0, 3); // Extracts "Tue"
    if (chartData[shortDay] !== undefined) {
      chartData[shortDay] = stats.Sales || 0;
    }
  });

  const maxSales = Math.max(...Object.values(chartData), 100); // Ensures no divide by 0 and gives base scale

  // =========================================================
  // HELPERS
  // =========================================================
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);

  const goTo = (page) => {
    if (setActivePage) setActivePage(page);
  };

  // Mocking Inventory alerts as empty since API doesn't provide it
  const lowStockProducts = [];
  const outOfStockProducts = [];

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBackground,
    iconColor,
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

      {/* STAT CARDS (Top Box) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={dashboardData?.TotalProducts || 0}
          subtitle="products listed"
          icon={<FiShoppingBag size={22} />}
          iconBackground={COLORS.primaryLight}
          iconColor={COLORS.primary}
        />
        <StatCard
          title="Total Stock"
          value="-"
          subtitle="units available"
          icon={<FiPackage size={22} />}
          iconBackground={COLORS.blueBg}
          iconColor={COLORS.blue}
        />
        <StatCard
          title="Inventory Value"
          value="-"
          subtitle="current stock value"
          icon={<FiDollarSign size={22} />}
          iconBackground={COLORS.successBg}
          iconColor={COLORS.success}
        />
        <StatCard
          title="Low Stock"
          value="-"
          subtitle="need attention"
          icon={<FiAlertTriangle size={22} />}
          iconBackground={COLORS.warningBg}
          iconColor={COLORS.warning}
        />
      </div>

      {/* SALES + INVENTORY ALERTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

        {/* SALES OVERVIEW (Spans 2 columns) */}
        <div className="xl:col-span-2 bg-white border rounded-2xl p-5 lg:p-6" style={{ borderColor: COLORS.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                Sales Overview
              </h2>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Your store performance based on selection
              </p>
            </div>

            {/* MONTH AND WEEK SELECTORS */}
            <div className="flex items-center gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => {
                  const newMonth = e.target.value;
                  setSelectedMonth(newMonth);
                  const weeksAvailable = Object.keys(dashboardData?.OrdersAndSales?.[newMonth] || {});
                  setSelectedWeek(weeksAvailable.length > 0 ? weeksAvailable[0] : 'week1');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F2F7F4] text-[#2A723D] outline-none cursor-pointer border-none"
              >
                {dashboardData?.OrdersAndSales && Object.keys(dashboardData.OrdersAndSales).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F2F7F4] text-[#2A723D] outline-none cursor-pointer border-none capitalize"
              >
                {dashboardData?.OrdersAndSales?.[selectedMonth] && Object.keys(dashboardData.OrdersAndSales[selectedMonth]).map(w => (
                  <option key={w} value={w}>{w.replace('week', 'Week ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SALES NUMBERS */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primarySoft }}>
              <div className="text-xs mb-1" style={{ color: COLORS.muted }}>
                Total Sales
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.heading }}>
                {formatPrice(weeklySales)}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.background }}>
              <div className="text-xs mb-1" style={{ color: COLORS.muted }}>
                Orders
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.heading }}>
                {weeklyOrders}
              </div>
            </div>
          </div>

          {/* DYNAMIC CHART */}
          <div className="h-[180px] relative">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border-t border-dashed" style={{ borderColor: '#E5E7EB' }} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-between gap-3 px-2 pt-3 pb-5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const heightPercentage = (chartData[day] / maxSales) * 100;
                
                return (
                  <div key={index} className="flex-1 h-full flex items-end justify-center group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {formatPrice(chartData[day])}
                    </div>

                    <div
                      className="w-full max-w-[44px] rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        height: `${heightPercentage}%`,
                        background: chartData[day] > 0 ? COLORS.primary : '#D4E3D9',
                        minHeight: chartData[day] > 0 ? '4px' : '0'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day} className="text-[10px] w-[44px] text-center" style={{ color: COLORS.muted }}>
                  {day}
                </span>
              ))}
            </div>
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

            {/* NEEDS ATTENTION (Empty State) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>
                  Needs Attention
                </h3>
                <span className="text-[11px]" style={{ color: COLORS.muted }}>
                  Stock ≤ 5
                </span>
              </div>

              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                <div className="text-center py-5 text-xs" style={{ color: COLORS.muted }}>
                  All products have sufficient stock.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => goTo('Inventory')}
              className="w-full mt-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F2F7F4]"
              style={{ borderColor: '#C2D6C8', color: COLORS.primaryDark }}
            >
              Manage Inventory
              <FiChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

        <button
          type="button"
          onClick={() => goTo('Add Product')}
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[#2A723D] hover:shadow-sm transition-all"
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
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[#2A723D] hover:shadow-sm transition-all"
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
          onClick={() => goTo('All Products')}
          className="bg-white border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[#2A723D] hover:shadow-sm transition-all"
          style={{ borderColor: COLORS.border }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.blueBg, color: COLORS.blue }}>
            <FiShoppingBag size={21} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: COLORS.heading }}>
              All Products
            </div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              View and manage catalog
            </div>
          </div>
          <FiChevronRight className="ml-auto" style={{ color: COLORS.placeholder }} />
        </button>

      </div>

    </div>
  );
};

export default EcomDashboard;