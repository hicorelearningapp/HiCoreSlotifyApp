import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiChevronDown,
  FiArrowUpRight,
  FiArrowDownRight,
} from 'react-icons/fi';

const Reports = () => {
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

    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    background: '#F8F9FA',

    success: '#16A34A',
    successBg: '#ECFDF5',

    blue: '#2563EB',
    blueBg: '#EFF6FF',

    orange: '#F59E0B',
    orangeBg: '#FFFBEB',

    red: '#DC2626',
    redBg: '#FEF2F2',
  };

  // =========================================================
  // STATE
  // =========================================================
  const [dateRange, setDateRange] = useState('Month');
  const [loading, setLoading] = useState(true);

  const [reportData, setReportData] = useState({
    summary: {
      revenue: 0, orders: 0, customers: 0, productsSold: 0,
      revenueGrowth: 0, ordersGrowth: 0, customersGrowth: 0, productsSoldGrowth: 0,
      averageOrderValue: 0, revenuePerCustomer: 0
    },
    chartData: [],
    topProducts: [],
    recentSales: []
  });

  // =========================================================
  // FETCH REPORT DATA FROM API
  // =========================================================
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const sellerId = localStorage.getItem('sellerId');
        if (!sellerId) return;

        let periodParam = 'month';
        if (dateRange === 'Today') periodParam = 'day';
        if (dateRange === 'Week') periodParam = 'week';
        if (dateRange === 'All') periodParam = 'all';

        const apiBase = import.meta.env.VITE_API_BASE || "/api";
        const response = await fetch(`${apiBase}/ecommerce/reports?seller_id=${sellerId}&period=${periodParam}`);
        
        if (response.ok) {
          const data = await response.json();
          const parseGrowth = (str) => str ? parseFloat(String(str).replace(/[+%]/g, '')) || 0 : 0;
          const summary = data.summary || {};
          
          const overview = data.revenueOverview || {};
          const mappedChartData = Object.keys(overview).map(key => ({
            label: key.includes('(') ? key.split('(')[0].substring(0, 3) : key,
            value: overview[key]?.Sales || 0
          }));

          setReportData({
            summary: {
              revenue: summary.Revenue || summary.revenue || 0,
              revenueGrowth: parseGrowth(summary.RevenueGrowth || summary.revenueGrowth),
              orders: summary.Orders || summary.orders || 0,
              ordersGrowth: parseGrowth(summary.OrdersGrowth || summary.ordersGrowth),
              customers: summary.Customers || summary.customers || 0,
              customersGrowth: parseGrowth(summary.CustomersGrowth || summary.customersGrowth),
              productsSold: summary.ProductsSold || summary.productsSold || 0,
              productsSoldGrowth: parseGrowth(summary.ProductsSoldGrowth || summary.productsSoldGrowth),
              averageOrderValue: summary.averageOrderValue || ((summary.Revenue || 0) / Math.max(summary.Orders || 1, 1)),
              revenuePerCustomer: summary.revenuePerCustomer || ((summary.Revenue || 0) / Math.max(summary.Customers || 1, 1))
            },
            chartData: mappedChartData,
            topProducts: (data.TopProducts || data.topProducts || []).map(p => ({
              name: p.ProductName || p.name || 'Unknown',
              category: p.Category || p.category || 'Retail',
              sold: p.UnitSold || p.sold || 0,
              revenue: p.Revenue || p.revenue || 0,
              growth: parseGrowth(p.Revenuegrowth || p.RevenueGrowth || p.growth)
            })),
            recentSales: (data.RecentSales || data.recentSales || []).map(s => ({
              id: s.OrdeId || s.OrderId || s.id || 'N/A',
              customer: s.CustomerName || s.customer || 'Guest',
              product: s.product || s.ProductName || 'Product',
              amount: s.Amount || s.amount || 0,
              status: s.Status || s.status || 'New',
              date: s.Date || s.date || ''
            }))
          });
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  const maxChartValue = Math.max(...reportData.chartData.map((item) => item.value), 100);
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  // =========================================================
  // REUSABLE COMPONENTS
  // =========================================================
  const StatCard = ({ title, value, subtitle, icon, iconClass, growth }) => (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#64748B]">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-[#0F172A]">{value}</h3>
          <div className="flex items-center gap-1 mt-2">
            {growth >= 0 ? <FiArrowUpRight size={13} className="text-[#16A34A]" /> : <FiArrowDownRight size={13} className="text-[#DC2626]" />}
            <span className={`text-xs font-semibold ${growth >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{Math.abs(growth || 0)}%</span>
            <span className="text-xs ml-1 text-[#64748B]">vs previous period</span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}>{icon}</div>
      </div>
      <p className="text-[11px] mt-3 text-[#64748B]">{subtitle}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const completed = status === 'Completed' || status === 'Delivered';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold ${completed ? 'bg-[#ECFDF5] text-[#16A34A]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-full p-5 lg:p-8 pb-12 bg-[#F8F9FA]">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#F2F7F4] text-[#2A723D]">
              <FiBarChart2 size={23} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A]">Reports</h1>
          </div>
          <p className="text-sm lg:text-base mt-2 lg:ml-[55px] text-[#64748B]">Track your sales, orders, customers and business performance</p>
        </div>

        <div className="relative">
          <FiCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none bg-white border border-[#CBD5E1] text-[#334155] rounded-xl pl-10 pr-10 py-3 text-sm font-medium outline-none cursor-pointer"
          >
            <option>Today</option>
            <option>Week</option>
            <option>Month</option>
            <option>All</option>
          </select>
          <FiChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500 font-medium">Loading report metrics...</div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Revenue" value={formatCurrency(reportData.summary.revenue)} subtitle={`Revenue for ${dateRange.toLowerCase()}`} icon={<FiDollarSign size={20} />} iconClass="bg-[#F2F7F4] text-[#2A723D]" growth={reportData.summary.revenueGrowth} />
            <StatCard title="Total Orders" value={reportData.summary.orders} subtitle={`Orders received during ${dateRange.toLowerCase()}`} icon={<FiShoppingBag size={20} />} iconClass="bg-[#EFF6FF] text-[#2563EB]" growth={reportData.summary.ordersGrowth} />
            <StatCard title="Customers" value={reportData.summary.customers} subtitle="Customers who purchased" icon={<FiUsers size={20} />} iconClass="bg-[#ECFDF5] text-[#16A34A]" growth={reportData.summary.customersGrowth} />
            <StatCard title="Products Sold" value={reportData.summary.productsSold} subtitle="Total units sold" icon={<FiPackage size={20} />} iconClass="bg-[#FFFBEB] text-[#F59E0B]" growth={reportData.summary.productsSoldGrowth} />
          </div>

          {/* CHART & PERFORMANCE BOX */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-6">
            
            {/* CHART */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Revenue Overview</h2>
                  <p className="text-xs mt-1 text-[#64748B]">Revenue performance for {dateRange.toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2A723D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A723D]" /> Revenue
                </div>
              </div>

              <div className="h-[280px] flex items-end gap-3 sm:gap-5 border-b border-[#E2E8F0] relative">
                <div className="absolute inset-x-0 top-[25%] border-t border-dashed border-[#E2E8F0]" />
                <div className="absolute inset-x-0 top-[50%] border-t border-dashed border-[#E2E8F0]" />
                <div className="absolute inset-x-0 top-[75%] border-t border-dashed border-[#E2E8F0]" />

                {reportData.chartData.length > 0 ? reportData.chartData.map((item, index) => {
                  const height = (item.value / maxChartValue) * 85;
                  return (
                    <div key={index} className="flex-1 h-full flex flex-col items-center justify-end relative z-10">
                      <div className="w-full max-w-[55px] rounded-t-lg hover:opacity-80 transition-all cursor-pointer bg-[#2A723D]" style={{ height: `${height}%` }} title={formatCurrency(item.value)} />
                      <span className="absolute -bottom-7 text-[10px] font-medium text-[#64748B]">{item.label}</span>
                    </div>
                  );
                }) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">No chart data available</div>
                )}
              </div>
            </div>

            {/* PERFORMANCE SUMMARY */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-1 text-[#0F172A]">Performance</h2>
              <p className="text-xs mb-6 text-[#64748B]">Business performance summary</p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#334155]">Revenue Growth</span>
                  <span className={`text-xs font-bold ${reportData.summary.revenueGrowth >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {reportData.summary.revenueGrowth >= 0 ? '+' : ''}{reportData.summary.revenueGrowth}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${reportData.summary.revenueGrowth >= 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} style={{ width: `${Math.min(Math.abs(reportData.summary.revenueGrowth) * 3, 100)}%` }} />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#334155]">Order Growth</span>
                  <span className="text-xs font-bold text-[#2A723D]">+{reportData.summary.ordersGrowth}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2A723D]" style={{ width: `${Math.min(Math.abs(reportData.summary.ordersGrowth) * 4, 100)}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl mb-4 bg-[#F9FCFA]">
                <div className="flex items-center gap-2 mb-2 text-[#2A723D]">
                  <FiShoppingBag size={15} />
                  <span className="text-xs font-semibold text-[#334155]">Average Order Value</span>
                </div>
                <p className="text-xl font-bold text-[#0F172A]">{formatCurrency(reportData.summary.averageOrderValue)}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#EFF6FF]">
                <div className="flex items-center gap-2 mb-2 text-[#2563EB]">
                  <FiUsers size={15} />
                  <span className="text-xs font-semibold text-[#334155]">Revenue / Customer</span>
                </div>
                <p className="text-xl font-bold text-[#0F172A]">{formatCurrency(reportData.summary.revenuePerCustomer)}</p>
              </div>
            </div>

          </div>

          {/* TOP PRODUCTS */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6">
            <div className="p-5 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0F172A]">Top Products</h2>
              <p className="text-xs mt-1 text-[#64748B]">Best performing products</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Product</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#64748B]">Units Sold</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#64748B]">Revenue</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#64748B]">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold bg-[#F2F7F4] text-[#2A723D]">{index + 1}</div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{product.name}</p>
                            <p className="text-[11px] mt-0.5 text-[#64748B]">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-sm font-bold text-[#0F172A]">{product.sold}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-[#0F172A]">{formatCurrency(product.revenue)}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${product.growth >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {product.growth >= 0 ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
                          {product.growth >= 0 ? '+' : ''}{product.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reportData.topProducts.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-sm text-gray-500">No product data available for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT SALES */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0F172A]">Recent Sales</h2>
              <p className="text-xs mt-1 text-[#64748B]">Latest transactions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Order</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Customer</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Product</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#64748B]">Amount</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.recentSales.map((sale, index) => (
                    <tr key={sale.id || index} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-xs font-bold text-[#2A723D]">{sale.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#0F172A]">{sale.customer}</td>
                      <td className="px-5 py-4 text-xs text-[#334155]">{sale.product}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-[#0F172A]">{formatCurrency(sale.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={sale.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={13} className="text-[#64748B]" />
                          <span className="text-xs text-[#334155]">{sale.date}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reportData.recentSales.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-6 text-sm text-gray-500">No recent sales available for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;