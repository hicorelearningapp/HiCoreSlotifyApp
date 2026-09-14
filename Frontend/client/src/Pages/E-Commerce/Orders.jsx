import React, { useMemo, useState, useEffect } from 'react';

import {
  FiBox,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiShoppingBag,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiX,
  FiCreditCard,
} from 'react-icons/fi';

const Orders = () => {
  // =========================================================
  // COLORS
  // =========================================================

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

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState('New');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH ORDERS (API INTEGRATION)
  // =========================================================

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const sellerId = localStorage.getItem('sellerId');
      if (!sellerId) return;

      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const response = await fetch(`${apiBase}/ecommerce/orders?seller_id=${sellerId}&limit=500`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.Orders && Array.isArray(data.Orders)) {
          const mappedOrders = data.Orders.map((o) => {
            const d = new Date(o.CreatedAt);
            const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // Standardize Statuses
            let mappedStatus = o.Status;
            if (mappedStatus === 'Pending') mappedStatus = 'New';

            return {
              id: o.OrderNumber || o.Id,
              rawId: o.Id,
              customer: o.CustomerName || 'Unknown',
              phone: o.CustomerPhone || '-',
              email: o.CustomerEmail || '-',
              product: o.Items && o.Items.length > 0 ? o.Items[0].ProductName : 'Products',
              category: o.Items && o.Items.length > 0 ? (o.Items[0].Category || 'Retail') : 'Retail',
              quantity: o.Items && o.Items.length > 0 ? o.Items[0].Quantity : 1,
              amount: o.Total || 0,
              status: mappedStatus,
              payment: o.PaymentStatus || 'Unpaid',
              paymentMethod: o.PaymentMethod || 'COD',
              date: dateStr,
              time: timeStr,
              isoDate: o.CreatedAt, // Kept for exact filtering
              address: [o.ShippingAddress, o.City, o.State].filter(Boolean).join(', '),
            };
          });
          setOrders(mappedOrders);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New':
        return {
          backgroundColor: COLORS.primaryLight,
          color: COLORS.primaryDark,
        };
      case 'Processing':
        return {
          backgroundColor: COLORS.warningBg,
          color: COLORS.warning,
        };
      case 'Shipped':
        return {
          backgroundColor: COLORS.blueBg,
          color: COLORS.blue,
        };
      case 'Delivered':
        return {
          backgroundColor: COLORS.successBg,
          color: COLORS.success,
        };
      case 'Cancelled':
        return {
          backgroundColor: COLORS.dangerBg,
          color: COLORS.danger,
        };
      default:
        return {
          backgroundColor: COLORS.background,
          color: COLORS.muted,
        };
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const StatusIcon = ({ status }) => {
    if (status === 'New') return <FiBox size={13} />;
    if (status === 'Processing') return <FiClock size={13} />;
    if (status === 'Shipped') return <FiTruck size={13} />;
    if (status === 'Delivered') return <FiCheckCircle size={13} />;
    return <FiXCircle size={13} />;
  };

  // =========================================================
  // FILTER ORDERS (Dynamic date calculation)
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchText.toLowerCase().trim();

      const matchesSearch =
        order.id.toLowerCase().includes(search) ||
        order.customer.toLowerCase().includes(search) ||
        order.product.toLowerCase().includes(search) ||
        order.category.toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      let matchesDate = true;
      if (order.isoDate) {
        if (dateFilter === 'Today') {
          const today = new Date().toISOString().split('T')[0];
          matchesDate = order.isoDate.startsWith(today);
        }

        if (dateFilter === 'Yesterday') {
          const yest = new Date();
          yest.setDate(yest.getDate() - 1);
          const yesterdayStr = yest.toISOString().split('T')[0];
          matchesDate = order.isoDate.startsWith(yesterdayStr);
        }

        if (dateFilter === 'Last 7 Days') {
          const orderDate = new Date(order.isoDate);
          const now = new Date();
          const diffTime = now - orderDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchesDate = diffDays <= 7 && diffDays >= 0;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchText, statusFilter, dateFilter]);

  // =========================================================
  // UPDATE ORDER STATUS (API INTEGRATION)
  // =========================================================

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setStatusToUpdate(order.status);
  };

  const saveOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const response = await fetch(`${apiBase}/ecommerce/orders/${selectedOrder.rawId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ Status: statusToUpdate })
      });

      if (response.ok) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === selectedOrder.id ? { ...order, status: statusToUpdate } : order
          )
        );

        setSelectedOrder((currentOrder) =>
          currentOrder ? { ...currentOrder, status: statusToUpdate } : currentOrder
        );
      } else {
        console.error("Failed to update status on server");
      }
    } catch (error) {
      console.error("API Error updating status:", error);
    }
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const totalOrders = orders.length;
  const newOrders = orders.filter((order) => order.status === 'New').length;
  const processingOrders = orders.filter((order) => order.status === 'Processing').length;
  const shippedOrders = orders.filter((order) => order.status === 'Shipped').length;
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered').length;
  const cancelledOrders = orders.filter((order) => order.status === 'Cancelled').length;

  // =========================================================
  // TOTAL SALES
  // =========================================================

  const totalSales = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((total, order) => total + Number(order.amount), 0);

  // =========================================================
  // STAT CARD
  // =========================================================

  const StatCard = ({ title, value, subtitle, icon, background, color }) => {
    return (
      <div
        className="bg-white border rounded-2xl p-5 hover:shadow-md transition-all"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm" style={{ color: COLORS.muted }}>{title}</p>
            <h3 className="text-2xl font-bold mt-2" style={{ color: COLORS.heading }}>
              {value}
            </h3>
            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>{subtitle}</p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: background, color }}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      <div
        className="min-h-full p-5 lg:p-8 pb-12 font-sans"
        style={{ backgroundColor: COLORS.background }}
      >

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: COLORS.muted }}>
          <FiBox size={16} />
          <FiChevronRight size={14} />
          <span className="font-semibold" style={{ color: COLORS.text }}>Orders</span>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              >
                <FiBox size={23} />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: COLORS.heading }}>
                Orders
              </h1>
            </div>
            <p className="text-sm lg:text-base mt-2 lg:ml-[55px]" style={{ color: COLORS.muted }}>
              Manage and track all your customer orders
            </p>
          </div>

          {/* TOTAL SALES */}
          <div className="bg-white border rounded-xl px-5 py-3" style={{ borderColor: COLORS.border }}>
            <p className="text-xs" style={{ color: COLORS.muted }}>Total Sales</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: COLORS.heading }}>
              {formatPrice(totalSales)}
            </p>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard title="All Orders" value={totalOrders} subtitle="total orders" icon={<FiShoppingBag size={21} />} background={COLORS.primaryLight} color={COLORS.primary} />
          <StatCard title="New" value={newOrders} subtitle="need attention" icon={<FiBox size={21} />} background={COLORS.primaryLight} color={COLORS.primary} />
          <StatCard title="Processing" value={processingOrders} subtitle="being prepared" icon={<FiClock size={21} />} background={COLORS.warningBg} color={COLORS.warning} />
          <StatCard title="Shipped" value={shippedOrders} subtitle="on the way" icon={<FiTruck size={21} />} background={COLORS.blueBg} color={COLORS.blue} />
          <StatCard title="Delivered" value={deliveredOrders} subtitle="completed" icon={<FiCheckCircle size={21} />} background={COLORS.successBg} color={COLORS.success} />
          <StatCard title="Cancelled" value={cancelledOrders} subtitle="cancelled orders" icon={<FiXCircle size={21} />} background={COLORS.dangerBg} color={COLORS.danger} />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="bg-white border rounded-2xl p-4 mb-5" style={{ borderColor: COLORS.border }}>
          <div className="flex flex-col xl:flex-row gap-3 xl:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.placeholder }} />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search order ID, customer or product..."
                className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F2F7F4] focus:border-[#2A723D]"
                style={{ borderColor: COLORS.borderDark }}
              />
            </div>

            {/* STATUS */}
            <div className="relative">
              <FiFilter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.primary }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border rounded-xl pl-10 pr-10 py-3 text-sm bg-white outline-none cursor-pointer min-w-[170px]"
                style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <FiChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.muted }} />
            </div>

            {/* DATE */}
            <div className="relative">
              <FiCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.primary }} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none border rounded-xl pl-10 pr-10 py-3 text-sm bg-white outline-none cursor-pointer min-w-[170px]"
                style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days</option>
              </select>
              <FiChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.muted }} />
            </div>

            {/* RESULTS */}
            <div
              className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark }}
            >
              <FiBox size={16} />
              {filteredOrders.length}
            </div>

          </div>
        </div>

        {/* =================================================
            ORDERS TABLE
        ================================================= */}

        <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: COLORS.border }}>

          {/* TABLE TITLE */}
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: COLORS.border }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>All Orders</h2>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>View and manage all customer orders</p>
            </div>
            <div className="text-xs font-medium" style={{ color: COLORS.muted }}>
              {filteredOrders.length} orders displayed
            </div>
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden lg:block overflow-x-auto">
            {loading ? (
               <div className="p-10 text-center text-gray-500 font-semibold">Loading orders...</div>
            ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: COLORS.border, backgroundColor: '#FAFAFA' }}>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>ORDER</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>CUSTOMER</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>PRODUCT</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>AMOUNT</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>PAYMENT</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>STATUS</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold" style={{ color: COLORS.muted }}>DATE</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold" style={{ color: COLORS.muted }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.border }}>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>{order.id}</div>
                      <div className="text-[11px] mt-1" style={{ color: COLORS.muted }}>{order.time}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark }}
                        >
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: COLORS.heading }}>{order.customer}</div>
                          <div className="text-[11px]" style={{ color: COLORS.muted }}>{order.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium" style={{ color: COLORS.text }}>{order.product}</div>
                      <div className="text-[11px] mt-1" style={{ color: COLORS.muted }}>
                        {order.category} {' • '} Qty: {order.quantity}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold" style={{ color: COLORS.heading }}>{formatPrice(order.amount)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium" style={{ color: COLORS.text }}>{order.payment}</div>
                      <div className="text-[11px] mt-1" style={{ color: COLORS.muted }}>{order.paymentMethod}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold" style={getStatusStyle(order.status)}>
                        <StatusIcon status={order.status} /> {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium" style={{ color: COLORS.text }}>{order.date}</div>
                      <div className="text-[11px] mt-1" style={{ color: COLORS.muted }}>{order.time}</div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openOrderDetails(order)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center ml-auto hover:bg-[#F2F7F4]"
                        style={{ color: COLORS.primary }}
                        title="View Order"
                      >
                        <FiEye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="lg:hidden">
            {!loading && filteredOrders.map((order) => (
              <div key={order.id} className="p-4 border-b last:border-b-0" style={{ borderColor: COLORS.border }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>{order.id}</div>
                    <div className="text-sm font-semibold mt-1" style={{ color: COLORS.heading }}>{order.customer}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={getStatusStyle(order.status)}>
                    <StatusIcon status={order.status} /> {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Product</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: COLORS.text }}>{order.product}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Amount</p>
                    <p className="text-xs font-bold mt-1" style={{ color: COLORS.heading }}>{formatPrice(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Payment</p>
                    <p className="text-xs font-medium mt-1" style={{ color: COLORS.success }}>{order.payment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Date</p>
                    <p className="text-xs font-medium mt-1" style={{ color: COLORS.text }}>{order.date}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openOrderDetails(order)}
                  className="w-full mt-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2"
                  style={{ borderColor: '#C2D6C8', color: COLORS.primaryDark }}
                >
                  <FiEye size={14} /> View Order Details
                </button>
              </div>
            ))}
          </div>

          {/* EMPTY */}
          {!loading && filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <div
                className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              >
                <FiBox size={25} />
              </div>
              <h3 className="text-base font-bold" style={{ color: COLORS.heading }}>No orders found</h3>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>Try changing your search or filters.</p>
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 px-1">
          <p className="text-xs" style={{ color: COLORS.muted }}>
            Showing <span className="font-semibold" style={{ color: COLORS.text }}>{filteredOrders.length}</span> of <span className="font-semibold" style={{ color: COLORS.text }}>{totalOrders}</span> orders
          </p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: COLORS.success }}>
            <FiCheckCircle size={14} /> Order information is up to date
          </p>
        </div>
      </div>

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                  >
                    <FiBox size={18} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>Order Details</h2>
                </div>
                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>{selectedOrder.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{ color: COLORS.muted }}
              >
                <FiX size={19} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5">

              {/* STATUS UPDATE */}
              <div className="p-4 rounded-xl mb-5" style={{ backgroundColor: COLORS.primarySoft }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Update Order Status</p>
                    <p className="text-sm font-bold mt-1" style={{ color: COLORS.heading }}>Current: {selectedOrder.status}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={getStatusStyle(statusToUpdate)}
                  >
                    <StatusIcon status={statusToUpdate} /> {statusToUpdate}
                  </span>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Change Status</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <select
                        value={statusToUpdate}
                        onChange={(e) => setStatusToUpdate(e.target.value)}
                        className="w-full appearance-none border rounded-xl px-4 py-3 pr-10 text-sm bg-white outline-none cursor-pointer focus:ring-2 focus:ring-[#F2F7F4] focus:border-[#2A723D]"
                        style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
                      >
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <FiChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.muted }} />
                    </div>
                    <button
                      type="button"
                      onClick={saveOrderStatus}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}
              <h3 className="text-sm font-bold mb-3" style={{ color: COLORS.heading }}>Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="border rounded-xl p-3" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FiUser size={14} style={{ color: COLORS.primary }} />
                    <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Customer</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.customer}</p>
                </div>

                <div className="border rounded-xl p-3" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FiPhone size={14} style={{ color: COLORS.primary }} />
                    <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Phone</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.phone}</p>
                </div>

                <div className="border rounded-xl p-3 sm:col-span-2" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FiMapPin size={14} style={{ color: COLORS.primary }} />
                    <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Delivery Address</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.address}</p>
                </div>
              </div>

              {/* PRODUCT */}
              <h3 className="text-sm font-bold mb-3" style={{ color: COLORS.heading }}>Product Details</h3>
              <div className="border rounded-xl overflow-hidden mb-5" style={{ borderColor: COLORS.border }}>
                <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: COLORS.border }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.product}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                      {selectedOrder.category} {' • '} Quantity: {selectedOrder.quantity}
                    </p>
                  </div>
                  <p className="text-base font-bold" style={{ color: COLORS.heading }}>{formatPrice(selectedOrder.amount)}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar size={13} style={{ color: COLORS.primary }} />
                      <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Date</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.date}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiClock size={13} style={{ color: COLORS.primary }} />
                      <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Time</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: COLORS.heading }}>{selectedOrder.time}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiCreditCard size={13} style={{ color: COLORS.primary }} />
                      <span className="text-[10px] uppercase" style={{ color: COLORS.muted }}>Payment</span>
                    </div>
                    <p className="text-sm font-medium mt-1" style={{ color: COLORS.success }}>{selectedOrder.payment}</p>
                  </div>
                </div>
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: COLORS.successBg }}>
                <div>
                  <p className="text-xs" style={{ color: COLORS.muted }}>Payment Method</p>
                  <p className="text-sm font-bold mt-1" style={{ color: COLORS.success }}>{selectedOrder.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: COLORS.muted }}>Order Total</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.heading }}>{formatPrice(selectedOrder.amount)}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;