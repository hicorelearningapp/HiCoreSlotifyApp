import React, { useMemo, useState } from 'react';

import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiDownload,
  FiChevronDown,
  FiArrowUpRight,
  FiArrowDownRight,
} from 'react-icons/fi';

const Reports = () => {
  // =========================================================
  // COLORS
  // =========================================================

  const COLORS = {
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#F3E8FF',
    primarySoft: '#FAF5FF',

    heading: '#0F172A',
    text: '#334155',
    muted: '#64748B',

    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    background: '#F8FAFC',

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

  const [dateRange, setDateRange] =
    useState('Last 30 Days');

  // =========================================================
  // SAMPLE REPORT DATA
  // =========================================================

  const reportData = {
    'Today': {
      revenue: 24500,
      orders: 18,
      customers: 12,
      productsSold: 24,
      revenueGrowth: 8.4,
      ordersGrowth: 5.2,
    },

    'Last 7 Days': {
      revenue: 148500,
      orders: 96,
      customers: 67,
      productsSold: 142,
      revenueGrowth: 12.8,
      ordersGrowth: 9.6,
    },

    'Last 30 Days': {
      revenue: 582400,
      orders: 384,
      customers: 246,
      productsSold: 618,
      revenueGrowth: 18.6,
      ordersGrowth: 14.2,
    },

    'Last 90 Days': {
      revenue: 1687400,
      orders: 1128,
      customers: 724,
      productsSold: 1846,
      revenueGrowth: 22.4,
      ordersGrowth: 19.8,
    },
  };

  const currentData =
    reportData[dateRange];

  // =========================================================
  // SALES CHART DATA
  // =========================================================

  const chartData = useMemo(() => {
    if (dateRange === 'Today') {
      return [
        { label: '9 AM', value: 1800 },
        { label: '11 AM', value: 3200 },
        { label: '1 PM', value: 2700 },
        { label: '3 PM', value: 4100 },
        { label: '5 PM', value: 5300 },
        { label: '7 PM', value: 7400 },
      ];
    }

    if (dateRange === 'Last 7 Days') {
      return [
        { label: 'Mon', value: 18200 },
        { label: 'Tue', value: 24500 },
        { label: 'Wed', value: 19200 },
        { label: 'Thu', value: 28700 },
        { label: 'Fri', value: 22600 },
        { label: 'Sat', value: 31400 },
        { label: 'Sun', value: 23900 },
      ];
    }

    if (dateRange === 'Last 90 Days') {
      return [
        { label: 'Apr', value: 420000 },
        { label: 'May', value: 485000 },
        { label: 'Jun', value: 512000 },
        { label: 'Jul', value: 548000 },
        { label: 'Aug', value: 582400 },
      ];
    }

    return [
      { label: 'Week 1', value: 112500 },
      { label: 'Week 2', value: 138400 },
      { label: 'Week 3', value: 154200 },
      { label: 'Week 4', value: 177300 },
    ];
  }, [dateRange]);

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.value)
  );

  // =========================================================
  // TOP PRODUCTS
  // =========================================================

  const topProducts = [
    {
      name: 'Diamond Pendant Necklace',
      category: 'Jewellery',
      sold: 84,
      revenue: 214500,
      growth: 24.5,
    },
    {
      name: 'Classic Gold Chain',
      category: 'Jewellery',
      sold: 72,
      revenue: 184200,
      growth: 18.2,
    },
    {
      name: 'Traditional Gold Earrings',
      category: 'Jewellery',
      sold: 61,
      revenue: 145800,
      growth: 14.8,
    },
    {
      name: 'Pearl Bracelet',
      category: 'Accessories',
      sold: 48,
      revenue: 92400,
      growth: 9.4,
    },
    {
      name: 'Designer Watch',
      category: 'Watches',
      sold: 36,
      revenue: 76400,
      growth: 6.7,
    },
  ];

  // =========================================================
  // RECENT SALES
  // =========================================================

  const recentSales = [
    {
      id: 'ORD-1052',
      customer: 'Ananya Sharma',
      product: 'Diamond Pendant Necklace',
      amount: 24500,
      status: 'Completed',
      date: '24 Aug 2026',
    },
    {
      id: 'ORD-1051',
      customer: 'Rahul Kumar',
      product: 'Classic Gold Chain',
      amount: 28500,
      status: 'Processing',
      date: '24 Aug 2026',
    },
    {
      id: 'ORD-1050',
      customer: 'Priya Menon',
      product: 'Silk Saree',
      amount: 12900,
      status: 'Completed',
      date: '23 Aug 2026',
    },
    {
      id: 'ORD-1049',
      customer: 'Vikram Singh',
      product: 'Pearl Bracelet',
      amount: 18500,
      status: 'Completed',
      date: '23 Aug 2026',
    },
  ];

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // =========================================================
  // STAT CARD
  // =========================================================

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
    growth,
  }) => {
    const positive = growth >= 0;

    return (
      <div
        className="bg-white border rounded-2xl p-5 hover:shadow-md transition"
        style={{
          borderColor: COLORS.border,
        }}
      >
        <div className="flex items-start justify-between">

          <div>
            <p
              className="text-sm"
              style={{
                color: COLORS.muted,
              }}
            >
              {title}
            </p>

            <h3
              className="text-2xl font-bold mt-2"
              style={{
                color: COLORS.heading,
              }}
            >
              {value}
            </h3>

            <div
              className="flex items-center gap-1 mt-2"
            >
              {positive ? (
                <FiArrowUpRight
                  size={13}
                  style={{
                    color: COLORS.success,
                  }}
                />
              ) : (
                <FiArrowDownRight
                  size={13}
                  style={{
                    color: COLORS.red,
                  }}
                />
              )}

              <span
                className="text-xs font-semibold"
                style={{
                  color: positive
                    ? COLORS.success
                    : COLORS.red,
                }}
              >
                {Math.abs(growth)}%
              </span>

              <span
                className="text-xs ml-1"
                style={{
                  color: COLORS.muted,
                }}
              >
                vs previous period
              </span>
            </div>
          </div>

          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
            }}
          >
            {icon}
          </div>

        </div>

        <p
          className="text-[11px] mt-3"
          style={{
            color: COLORS.muted,
          }}
        >
          {subtitle}
        </p>
      </div>
    );
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    const completed =
      status === 'Completed';

    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
        style={{
          backgroundColor: completed
            ? COLORS.successBg
            : COLORS.orangeBg,

          color: completed
            ? COLORS.success
            : COLORS.orange,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: completed
              ? COLORS.success
              : COLORS.orange,
          }}
        />

        {status}
      </span>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div
      className="min-h-full p-5 lg:p-8 pb-12"
      style={{
        backgroundColor: COLORS.background,
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7"
      >

        <div>

          <div
            className="flex items-center gap-3"
          >

            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor:
                  COLORS.primaryLight,
                color:
                  COLORS.primary,
              }}
            >
              <FiBarChart2 size={23} />
            </div>

            <h1
              className="text-3xl lg:text-4xl font-bold tracking-tight"
              style={{
                color: COLORS.heading,
              }}
            >
              Reports
            </h1>

          </div>

          <p
            className="text-sm lg:text-base mt-2 lg:ml-[55px]"
            style={{
              color: COLORS.muted,
            }}
          >
            Track your sales, orders,
            customers and business performance
          </p>

        </div>

        <div
          className="flex flex-col sm:flex-row gap-3"
        >

          {/* DATE FILTER */}

          <div className="relative">

            <FiCalendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: COLORS.muted,
              }}
            />

            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value)
              }
              className="appearance-none bg-white border rounded-xl pl-10 pr-10 py-3 text-sm font-medium outline-none cursor-pointer"
              style={{
                borderColor: COLORS.borderDark,
                color: COLORS.text,
              }}
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>

            <FiChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                color: COLORS.muted,
              }}
            />

          </div>

          {/* EXPORT */}

          <button
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border bg-white hover:bg-gray-50 transition"
            style={{
              borderColor: COLORS.borderDark,
              color: COLORS.text,
            }}
          >
            <FiDownload size={16} />

            Export Report
          </button>

        </div>

      </div>

      {/* =====================================================
          OVERVIEW CARDS
      ===================================================== */}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
      >

        <StatCard
          title="Total Revenue"
          value={formatCurrency(
            currentData.revenue
          )}
          subtitle={`Revenue for ${dateRange.toLowerCase()}`}
          icon={
            <FiDollarSign size={20} />
          }
          iconBg={COLORS.primaryLight}
          iconColor={COLORS.primary}
          growth={currentData.revenueGrowth}
        />

        <StatCard
          title="Total Orders"
          value={currentData.orders}
          subtitle={`Orders received during ${dateRange.toLowerCase()}`}
          icon={
            <FiShoppingBag size={20} />
          }
          iconBg={COLORS.blueBg}
          iconColor={COLORS.blue}
          growth={currentData.ordersGrowth}
        />

        <StatCard
          title="Customers"
          value={currentData.customers}
          subtitle="Customers who purchased"
          icon={
            <FiUsers size={20} />
          }
          iconBg={COLORS.successBg}
          iconColor={COLORS.success}
          growth={11.4}
        />

        <StatCard
          title="Products Sold"
          value={currentData.productsSold}
          subtitle="Total units sold"
          icon={
            <FiPackage size={20} />
          }
          iconBg={COLORS.orangeBg}
          iconColor={COLORS.orange}
          growth={16.8}
        />

      </div>

      {/* =====================================================
          SALES CHART + SUMMARY
      ===================================================== */}

      <div
        className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-6"
      >

        {/* SALES CHART */}

        <div
          className="bg-white border rounded-2xl p-5"
          style={{
            borderColor: COLORS.border,
          }}
        >

          <div
            className="flex items-center justify-between mb-6"
          >

            <div>

              <h2
                className="text-lg font-bold"
                style={{
                  color: COLORS.heading,
                }}
              >
                Revenue Overview
              </h2>

              <p
                className="text-xs mt-1"
                style={{
                  color: COLORS.muted,
                }}
              >
                Revenue performance for{' '}
                {dateRange.toLowerCase()}
              </p>

            </div>

            <div
              className="flex items-center gap-2 text-xs font-semibold"
              style={{
                color: COLORS.primary,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    COLORS.primary,
                }}
              />

              Revenue
            </div>

          </div>

          {/* CHART */}

          <div
            className="h-[280px] flex items-end gap-3 sm:gap-5 border-b relative"
            style={{
              borderColor: COLORS.border,
            }}
          >

            {/* GRID LINES */}

            <div
              className="absolute inset-x-0 top-[25%] border-t border-dashed"
              style={{
                borderColor: COLORS.border,
              }}
            />

            <div
              className="absolute inset-x-0 top-[50%] border-t border-dashed"
              style={{
                borderColor: COLORS.border,
              }}
            />

            <div
              className="absolute inset-x-0 top-[75%] border-t border-dashed"
              style={{
                borderColor: COLORS.border,
              }}
            />

            {chartData.map(
              (item, index) => {

                const height =
                  (item.value /
                    maxChartValue) *
                  85;

                return (
                  <div
                    key={item.label}
                    className="flex-1 h-full flex flex-col items-center justify-end relative z-10"
                  >

                    <div
                      className="absolute -top-1 opacity-0 group-hover:opacity-100"
                    />

                    <div
                      className="w-full max-w-[55px] rounded-t-lg hover:opacity-80 transition-all cursor-pointer"
                      style={{
                        height: `${height}%`,
                        backgroundColor:
                          COLORS.primary,
                      }}
                      title={formatCurrency(
                        item.value
                      )}
                    />

                    <span
                      className="absolute -bottom-7 text-[10px] font-medium"
                      style={{
                        color: COLORS.muted,
                      }}
                    >
                      {item.label}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* PERFORMANCE SUMMARY */}

        <div
          className="bg-white border rounded-2xl p-5"
          style={{
            borderColor: COLORS.border,
          }}
        >

          <h2
            className="text-lg font-bold mb-1"
            style={{
              color: COLORS.heading,
            }}
          >
            Performance
          </h2>

          <p
            className="text-xs mb-6"
            style={{
              color: COLORS.muted,
            }}
          >
            Business performance summary
          </p>

          {/* REVENUE */}

          <div className="mb-6">

            <div
              className="flex items-center justify-between mb-2"
            >

              <span
                className="text-xs font-medium"
                style={{
                  color: COLORS.text,
                }}
              >
                Revenue Growth
              </span>

              <span
                className="text-xs font-bold"
                style={{
                  color: COLORS.success,
                }}
              >
                +{currentData.revenueGrowth}%
              </span>

            </div>

            <div
              className="h-2 rounded-full bg-gray-100 overflow-hidden"
            >

              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    currentData.revenueGrowth * 3,
                    100
                  )}%`,
                  backgroundColor:
                    COLORS.success,
                }}
              />

            </div>

          </div>

          {/* ORDERS */}

          <div className="mb-6">

            <div
              className="flex items-center justify-between mb-2"
            >

              <span
                className="text-xs font-medium"
                style={{
                  color: COLORS.text,
                }}
              >
                Order Growth
              </span>

              <span
                className="text-xs font-bold"
                style={{
                  color: COLORS.primary,
                }}
              >
                +{currentData.ordersGrowth}%
              </span>

            </div>

            <div
              className="h-2 rounded-full bg-gray-100 overflow-hidden"
            >

              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    currentData.ordersGrowth * 4,
                    100
                  )}%`,
                  backgroundColor:
                    COLORS.primary,
                }}
              />

            </div>

          </div>

          {/* AVERAGE ORDER */}

          <div
            className="p-4 rounded-xl mb-4"
            style={{
              backgroundColor:
                COLORS.primarySoft,
            }}
          >

            <div
              className="flex items-center gap-2 mb-2"
            >

              <FiShoppingBag
                size={15}
                style={{
                  color:
                    COLORS.primary,
                }}
              />

              <span
                className="text-xs font-semibold"
                style={{
                  color:
                    COLORS.text,
                }}
              >
                Average Order Value
              </span>

            </div>

            <p
              className="text-xl font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              {formatCurrency(
                currentData.revenue /
                  Math.max(
                    currentData.orders,
                    1
                  )
              )}
            </p>

          </div>

          {/* CUSTOMER VALUE */}

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor:
                COLORS.blueBg,
            }}
          >

            <div
              className="flex items-center gap-2 mb-2"
            >

              <FiUsers
                size={15}
                style={{
                  color:
                    COLORS.blue,
                }}
              />

              <span
                className="text-xs font-semibold"
                style={{
                  color:
                    COLORS.text,
                }}
              >
                Revenue / Customer
              </span>

            </div>

            <p
              className="text-xl font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              {formatCurrency(
                currentData.revenue /
                  Math.max(
                    currentData.customers,
                    1
                  )
              )}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          TOP PRODUCTS
      ===================================================== */}

      <div
        className="bg-white border rounded-2xl overflow-hidden mb-6"
        style={{
          borderColor: COLORS.border,
        }}
      >

        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            borderColor: COLORS.border,
          }}
        >

          <div>

            <h2
              className="text-lg font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              Top Products
            </h2>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Best performing products
            </p>

          </div>

          <button
            type="button"
            className="text-xs font-semibold"
            style={{
              color:
                COLORS.primary,
            }}
          >
            View Products
          </button>

        </div>

        <div className="overflow-x-auto">

          <table
            className="w-full min-w-[700px]"
          >

            <thead>

              <tr
                className="bg-gray-50 border-b"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Product
                </th>

                <th
                  className="text-center px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Units Sold
                </th>

                <th
                  className="text-right px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Revenue
                </th>

                <th
                  className="text-right px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Growth
                </th>

              </tr>

            </thead>

            <tbody>

              {topProducts.map(
                (product, index) => (

                  <tr
                    key={product.name}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <td className="px-5 py-4">

                      <div
                        className="flex items-center gap-3"
                      >

                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor:
                              COLORS.primaryLight,
                            color:
                              COLORS.primary,
                          }}
                        >
                          {index + 1}
                        </div>

                        <div>

                          <p
                            className="text-sm font-semibold"
                            style={{
                              color:
                                COLORS.heading,
                            }}
                          >
                            {product.name}
                          </p>

                          <p
                            className="text-[11px] mt-0.5"
                            style={{
                              color:
                                COLORS.muted,
                            }}
                          >
                            {product.category}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td
                      className="px-5 py-4 text-center"
                    >

                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {product.sold}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4 text-right"
                    >

                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {formatCurrency(
                          product.revenue
                        )}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4 text-right"
                    >

                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold"
                        style={{
                          color:
                            COLORS.success,
                        }}
                      >
                        <FiTrendingUp
                          size={13}
                        />

                        +{product.growth}%
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          RECENT SALES
      ===================================================== */}

      <div
        className="bg-white border rounded-2xl overflow-hidden"
        style={{
          borderColor:
            COLORS.border,
        }}
      >

        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          <div>

            <h2
              className="text-lg font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              Recent Sales
            </h2>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Latest transactions
            </p>

          </div>

          <button
            type="button"
            className="text-xs font-semibold"
            style={{
              color:
                COLORS.primary,
            }}
          >
            View All Orders
          </button>

        </div>

        <div className="overflow-x-auto">

          <table
            className="w-full min-w-[850px]"
          >

            <thead>

              <tr
                className="bg-gray-50 border-b"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Order
                </th>

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Customer
                </th>

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Product
                </th>

                <th
                  className="text-right px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Amount
                </th>

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Status
                </th>

                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {recentSales.map(
                (sale) => (

                  <tr
                    key={sale.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <td
                      className="px-5 py-4"
                    >

                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      >
                        {sale.id}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4"
                    >

                      <span
                        className="text-sm font-semibold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {sale.customer}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4"
                    >

                      <span
                        className="text-xs"
                        style={{
                          color:
                            COLORS.text,
                        }}
                      >
                        {sale.product}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4 text-right"
                    >

                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {formatCurrency(
                          sale.amount
                        )}
                      </span>

                    </td>

                    <td
                      className="px-5 py-4"
                    >
                      <StatusBadge
                        status={
                          sale.status
                        }
                      />
                    </td>

                    <td
                      className="px-5 py-4"
                    >

                      <div
                        className="flex items-center gap-1.5"
                      >

                        <FiCalendar
                          size={13}
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        />

                        <span
                          className="text-xs"
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {sale.date}
                        </span>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Reports;