import React, { useMemo, useState } from 'react';

import {
  FiInbox,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiPackage,
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
} from 'react-icons/fi';

const Inbox = ({ setActivePage }) => {
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

  // =========================================================
  // STATE
  // =========================================================

  const [searchText, setSearchText] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // =========================================================
  // LAST 24 HOURS ORDERS
  // =========================================================

  const [orders] = useState([
    {
      id: 'ORD-1048',
      customer: 'Ananya Sharma',
      phone: '+91 98765 43210',
      product: 'Blue Stone Necklace',
      category: 'Jewellery',
      quantity: 1,
      amount: 2499,
      status: 'New',
      payment: 'Paid',
      time: '10:42 AM',
      date: 'Today',
      address: 'Chennai, Tamil Nadu',
    },

    {
      id: 'ORD-1047',
      customer: 'Rahul Kumar',
      phone: '+91 98765 12345',
      product: 'Classic Silk Saree',
      category: 'Sarees',
      quantity: 1,
      amount: 5499,
      status: 'Processing',
      payment: 'Paid',
      time: '09:35 AM',
      date: 'Today',
      address: 'Bangalore, Karnataka',
    },

    {
      id: 'ORD-1046',
      customer: 'Priya Raj',
      phone: '+91 98432 76543',
      product: 'Gold Finish Earrings',
      category: 'Jewellery',
      quantity: 2,
      amount: 1899,
      status: 'Shipped',
      payment: 'Paid',
      time: '08:51 AM',
      date: 'Today',
      address: 'Coimbatore, Tamil Nadu',
    },

    {
      id: 'ORD-1045',
      customer: 'Vikram Singh',
      phone: '+91 98761 23456',
      product: 'Designer Handbag',
      category: 'Accessories',
      quantity: 1,
      amount: 3299,
      status: 'Delivered',
      payment: 'Paid',
      time: '07:28 AM',
      date: 'Today',
      address: 'Hyderabad, Telangana',
    },

    {
      id: 'ORD-1044',
      customer: 'Meera Krishnan',
      phone: '+91 99887 65432',
      product: 'Diamond Pendant',
      category: 'Jewellery',
      quantity: 1,
      amount: 6799,
      status: 'Processing',
      payment: 'Paid',
      time: '06:43 AM',
      date: 'Today',
      address: 'Chennai, Tamil Nadu',
    },

    {
      id: 'ORD-1043',
      customer: 'Arjun Patel',
      phone: '+91 98765 99887',
      product: 'Cotton Silk Saree',
      category: 'Sarees',
      quantity: 2,
      amount: 4199,
      status: 'Cancelled',
      payment: 'Refund Pending',
      time: '11:48 PM',
      date: 'Yesterday',
      address: 'Mumbai, Maharashtra',
    },

    {
      id: 'ORD-1042',
      customer: 'Divya Menon',
      phone: '+91 98456 77889',
      product: 'Pearl Bracelet',
      category: 'Jewellery',
      quantity: 1,
      amount: 2299,
      status: 'New',
      payment: 'Paid',
      time: '10:26 PM',
      date: 'Yesterday',
      address: 'Kochi, Kerala',
    },

    {
      id: 'ORD-1041',
      customer: 'Karthik R',
      phone: '+91 99001 22334',
      product: 'Leather Wallet',
      category: 'Accessories',
      quantity: 1,
      amount: 1499,
      status: 'Delivered',
      payment: 'Paid',
      time: '09:15 PM',
      date: 'Yesterday',
      address: 'Bangalore, Karnataka',
    },
  ]);

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
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search =
        searchText.toLowerCase();

      const matchesSearch =
        order.id
          .toLowerCase()
          .includes(search) ||
        order.customer
          .toLowerCase()
          .includes(search) ||
        order.product
          .toLowerCase()
          .includes(search) ||
        order.category
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    searchText,
    statusFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalOrders =
    orders.length;

  const newOrders =
    orders.filter(
      (order) =>
        order.status === 'New'
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status === 'Processing'
    ).length;

  const completedOrders =
    orders.filter(
      (order) =>
        order.status === 'Delivered'
    ).length;

  const totalRevenue =
    orders
      .filter(
        (order) =>
          order.status !==
          'Cancelled'
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.amount),
        0
      );

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New':
        return {
          backgroundColor:
            COLORS.primaryLight,
          color:
            COLORS.primaryDark,
        };

      case 'Processing':
        return {
          backgroundColor:
            COLORS.warningBg,
          color:
            COLORS.warning,
        };

      case 'Shipped':
        return {
          backgroundColor:
            COLORS.blueBg,
          color:
            COLORS.blue,
        };

      case 'Delivered':
        return {
          backgroundColor:
            COLORS.successBg,
          color:
            COLORS.success,
        };

      case 'Cancelled':
        return {
          backgroundColor:
            COLORS.dangerBg,
          color:
            COLORS.danger,
        };

      default:
        return {
          backgroundColor:
            COLORS.background,
          color:
            COLORS.muted,
        };
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const StatusIcon = ({ status }) => {
    if (status === 'New') {
      return (
        <FiInbox size={13} />
      );
    }

    if (
      status === 'Processing'
    ) {
      return (
        <FiClock size={13} />
      );
    }

    if (status === 'Shipped') {
      return (
        <FiTruck size={13} />
      );
    }

    if (status === 'Delivered') {
      return (
        <FiCheckCircle
          size={13}
        />
      );
    }

    return (
      <FiXCircle size={13} />
    );
  };

  // =========================================================
  // STAT CARD
  // =========================================================

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    background,
    color,
  }) => {
    return (
      <div
        className="bg-white border rounded-2xl p-5 hover:shadow-md transition-all"
        style={{
          borderColor:
            COLORS.border,
        }}
      >
        <div
          className="flex items-start justify-between"
        >
          <div>
            <p
              className="text-sm"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              {title}
            </p>

            <h3
              className="text-2xl font-bold mt-2"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              {value}
            </h3>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor:
                background,
              color,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="min-h-full p-5 lg:p-8 pb-12 font-sans"
        style={{
          backgroundColor:
            COLORS.background,
        }}
      >

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div
          className="flex items-center gap-2 text-sm mb-6"
          style={{
            color:
              COLORS.muted,
          }}
        >
          <FiInbox size={16} />

          <FiChevronRight
            size={14}
          />

          <span
            className="font-semibold"
          >
            Inbox
          </span>
        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7"
        >
          <div>

            <div
              className="flex items-center gap-3 mb-1"
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
                <FiInbox
                  size={23}
                />
              </div>

              <h1
                className="text-3xl lg:text-4xl font-bold tracking-tight"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                Inbox
              </h1>
            </div>

            <p
              className="text-sm lg:text-base lg:ml-[55px]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Manage and track orders
              received in the last 24 hours
            </p>
          </div>

          {/* LIVE INDICATOR */}

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit"
            style={{
              backgroundColor:
                COLORS.successBg,
              color:
                COLORS.success,
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-green-500"
            />

            <span
              className="text-sm font-semibold"
            >
              Live Orders
            </span>

            <span
              className="text-xs font-medium"
            >
              • Last 24 hours
            </span>
          </div>
        </div>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
        >

          <StatCard
            title="Total Orders"
            value={totalOrders}
            subtitle="received in 24 hours"
            icon={
              <FiShoppingBag
                size={21}
              />
            }
            background={
              COLORS.primaryLight
            }
            color={
              COLORS.primary
            }
          />

          <StatCard
            title="New Orders"
            value={newOrders}
            subtitle="waiting for action"
            icon={
              <FiInbox
                size={21}
              />
            }
            background={
              COLORS.primaryLight
            }
            color={
              COLORS.primary
            }
          />

          <StatCard
            title="Processing"
            value={processingOrders}
            subtitle="currently processing"
            icon={
              <FiClock
                size={21}
              />
            }
            background={
              COLORS.warningBg
            }
            color={
              COLORS.warning
            }
          />

          <StatCard
            title="24h Revenue"
            value={formatPrice(
              totalRevenue
            )}
            subtitle="from active orders"
            icon={
              <FiCheckCircle
                size={21}
              />
            }
            background={
              COLORS.successBg
            }
            color={
              COLORS.success
            }
          />

        </div>

        {/* ===================================================
            SEARCH + FILTER
        =================================================== */}

        <div
          className="bg-white border rounded-2xl p-4 mb-5"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          <div
            className="flex flex-col md:flex-row gap-3 md:items-center justify-between"
          >

            {/* SEARCH */}

            <div
              className="relative flex-1 max-w-xl"
            >
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{
                  color:
                    COLORS.placeholder,
                }}
              />

              <input
                type="text"
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
                placeholder="Search order, customer or product..."
                className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                style={{
                  borderColor:
                    COLORS.borderDark,
                }}
              />
            </div>

            {/* FILTER */}

            <div className="flex gap-3">

              <div
                className="relative"
              >
                <FiFilter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color:
                      COLORS.primary,
                  }}
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="appearance-none border rounded-xl pl-10 pr-10 py-3 text-sm outline-none bg-white cursor-pointer"
                  style={{
                    borderColor:
                      COLORS.borderDark,
                    color:
                      COLORS.text,
                  }}
                >
                  <option value="All">
                    All Orders
                  </option>

                  <option value="New">
                    New
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Shipped">
                    Shipped
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>

                <FiChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                />
              </div>

              <div
                className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primaryDark,
                }}
              >
                <FiPackage
                  size={16}
                />

                {filteredOrders.length}
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            ORDERS TABLE
        =================================================== */}

        <div
          className="bg-white border rounded-2xl overflow-hidden"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          {/* TABLE HEADER */}

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
                Recent Orders
              </h2>

              <p
                className="text-xs mt-1"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Orders received during
                the last 24 hours
              </p>

            </div>

            <div
              className="hidden sm:flex items-center gap-2 text-xs"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              <FiClock
                size={14}
              />

              Updated just now
            </div>

          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden lg:block overflow-x-auto scrollbar-hide">

            <table className="w-full">

              <thead>

                <tr
                  className="border-b"
                  style={{
                    borderColor:
                      COLORS.border,
                    backgroundColor:
                      '#FAFAFA',
                  }}
                >

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    ORDER
                  </th>

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    CUSTOMER
                  </th>

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    PRODUCT
                  </th>

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    AMOUNT
                  </th>

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    STATUS
                  </th>

                  <th
                    className="px-5 py-3.5 text-left text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    TIME
                  </th>

                  <th
                    className="px-5 py-3.5 text-right text-xs font-semibold"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor:
                          COLORS.border,
                      }}
                    >

                      {/* ORDER */}

                      <td
                        className="px-5 py-4"
                      >
                        <div
                          className="text-sm font-bold"
                          style={{
                            color:
                              COLORS.primaryDark,
                          }}
                        >
                          {order.id}
                        </div>

                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          {order.date}
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td
                        className="px-5 py-4"
                      >

                        <div
                          className="flex items-center gap-2"
                        >

                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor:
                                COLORS.primaryLight,
                              color:
                                COLORS.primaryDark,
                            }}
                          >
                            {order.customer
                              .charAt(0)}
                          </div>

                          <div>

                            <div
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  COLORS.heading,
                              }}
                            >
                              {
                                order.customer
                              }
                            </div>

                            <div
                              className="text-[11px]"
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {order.phone}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* PRODUCT */}

                      <td
                        className="px-5 py-4"
                      >

                        <div
                          className="text-sm font-medium"
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {
                            order.product
                          }
                        </div>

                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          {
                            order.category
                          }{' '}
                          • Qty:{' '}
                          {order.quantity}
                        </div>

                      </td>

                      {/* AMOUNT */}

                      <td
                        className="px-5 py-4"
                      >

                        <div
                          className="text-sm font-bold"
                          style={{
                            color:
                              COLORS.heading,
                          }}
                        >
                          {formatPrice(
                            order.amount
                          )}
                        </div>

                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              COLORS.success,
                          }}
                        >
                          {order.payment}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td
                        className="px-5 py-4"
                      >

                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
                          style={getStatusStyle(
                            order.status
                          )}
                        >
                          <StatusIcon
                            status={
                              order.status
                            }
                          />

                          {order.status}
                        </span>

                      </td>

                      {/* TIME */}

                      <td
                        className="px-5 py-4"
                      >

                        <div
                          className="text-sm font-medium"
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {order.time}
                        </div>

                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          {order.date}
                        </div>

                      </td>

                      {/* ACTION */}

                      <td
                        className="px-5 py-4 text-right"
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center ml-auto hover:bg-purple-50"
                          style={{
                            color:
                              COLORS.primary,
                          }}
                          title="View Order"
                        >
                          <FiEye
                            size={17}
                          />
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE ORDER CARDS
          ================================================= */}

          <div className="lg:hidden">

            {filteredOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="p-4 border-b last:border-b-0"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  <div
                    className="flex items-start justify-between gap-3"
                  >

                    <div>

                      <div
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.primaryDark,
                        }}
                      >
                        {order.id}
                      </div>

                      <div
                        className="text-sm font-semibold mt-1"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          order.customer
                        }
                      </div>

                    </div>

                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={getStatusStyle(
                        order.status
                      )}
                    >
                      <StatusIcon
                        status={
                          order.status
                        }
                      />

                      {order.status}
                    </span>

                  </div>

                  <div
                    className="mt-4 grid grid-cols-2 gap-3"
                  >

                    <div>

                      <div
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Product
                      </div>

                      <div
                        className="text-xs font-medium mt-1"
                        style={{
                          color:
                            COLORS.text,
                        }}
                      >
                        {
                          order.product
                        }
                      </div>

                    </div>

                    <div>

                      <div
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Amount
                      </div>

                      <div
                        className="text-xs font-bold mt-1"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {formatPrice(
                          order.amount
                        )}
                      </div>

                    </div>

                    <div>

                      <div
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Time
                      </div>

                      <div
                        className="text-xs font-medium mt-1"
                        style={{
                          color:
                            COLORS.text,
                        }}
                      >
                        {order.time}
                      </div>

                    </div>

                    <div>

                      <div
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Payment
                      </div>

                      <div
                        className="text-xs font-medium mt-1"
                        style={{
                          color:
                            COLORS.success,
                        }}
                      >
                        {order.payment}
                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrder(
                        order
                      )
                    }
                    className="w-full mt-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2"
                    style={{
                      borderColor:
                        '#DDD6FE',
                      color:
                        COLORS.primaryDark,
                    }}
                  >
                    <FiEye
                      size={14}
                    />

                    View Order Details
                  </button>

                </div>
              )
            )}

          </div>

          {/* EMPTY STATE */}

          {filteredOrders.length ===
            0 && (
            <div
              className="py-16 text-center"
            >

              <div
                className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-3"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiInbox
                  size={25}
                />
              </div>

              <h3
                className="text-base font-bold"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                No orders found
              </h3>

              <p
                className="text-sm mt-1"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Try changing your search
                or filter.
              </p>

            </div>
          )}

        </div>

        {/* ===================================================
            FOOTER SUMMARY
        =================================================== */}

        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 px-1"
        >

          <div
            className="text-xs"
            style={{
              color:
                COLORS.muted,
            }}
          >
            Showing{' '}
            <span
              className="font-semibold"
              style={{
                color:
                  COLORS.text,
              }}
            >
              {filteredOrders.length}
            </span>{' '}
            of{' '}
            <span
              className="font-semibold"
              style={{
                color:
                  COLORS.text,
              }}
            >
              {totalOrders}
            </span>{' '}
            orders from the last
            24 hours
          </div>

          <div
            className="flex items-center gap-2 text-xs font-medium"
            style={{
              color:
                COLORS.success,
            }}
          >
            <FiCheckCircle
              size={14}
            />

            All order data is up to date
          </div>

        </div>

      </div>

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                borderColor:
                  COLORS.border,
              }}
            >

              <div>

                <div
                  className="flex items-center gap-2"
                >

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        COLORS.primaryLight,
                      color:
                        COLORS.primary,
                    }}
                  >
                    <FiShoppingBag
                      size={18}
                    />
                  </div>

                  <h2
                    className="text-lg font-bold"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Order Details
                  </h2>

                </div>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  {selectedOrder.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                <FiX size={19} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-5">

              {/* STATUS */}

              <div
                className="flex items-center justify-between p-4 rounded-xl mb-5"
                style={{
                  backgroundColor:
                    COLORS.primarySoft,
                }}
              >

                <div>

                  <div
                    className="text-xs"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    Order Status
                  </div>

                  <div
                    className="text-sm font-bold mt-1"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    {
                      selectedOrder.status
                    }
                  </div>

                </div>

                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={getStatusStyle(
                    selectedOrder.status
                  )}
                >
                  <StatusIcon
                    status={
                      selectedOrder.status
                    }
                  />

                  {
                    selectedOrder.status
                  }
                </span>

              </div>

              {/* CUSTOMER */}

              <div className="mb-5">

                <h3
                  className="text-sm font-bold mb-3"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Customer Information
                </h3>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >

                  <div
                    className="p-3 border rounded-xl"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div
                      className="flex items-center gap-2 mb-1"
                    >
                      <FiUser
                        size={14}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <span
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Customer
                      </span>
                    </div>

                    <div
                      className="text-sm font-semibold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {
                        selectedOrder.customer
                      }
                    </div>

                  </div>

                  <div
                    className="p-3 border rounded-xl"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div
                      className="flex items-center gap-2 mb-1"
                    >
                      <FiPhone
                        size={14}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <span
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Phone
                      </span>
                    </div>

                    <div
                      className="text-sm font-semibold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {
                        selectedOrder.phone
                      }
                    </div>

                  </div>

                  <div
                    className="p-3 border rounded-xl sm:col-span-2"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div
                      className="flex items-center gap-2 mb-1"
                    >
                      <FiMapPin
                        size={14}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <span
                        className="text-[10px] uppercase"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Delivery Address
                      </span>
                    </div>

                    <div
                      className="text-sm font-semibold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {
                        selectedOrder.address
                      }
                    </div>

                  </div>

                </div>

              </div>

              {/* ORDER INFORMATION */}

              <div className="mb-5">

                <h3
                  className="text-sm font-bold mb-3"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Order Information
                </h3>

                <div
                  className="border rounded-xl overflow-hidden"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  <div
                    className="p-4 flex items-center justify-between border-b"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div>

                      <div
                        className="text-sm font-semibold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          selectedOrder.product
                        }
                      </div>

                      <div
                        className="text-xs mt-1"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        {
                          selectedOrder.category
                        }{' '}
                        • Quantity:{' '}
                        {
                          selectedOrder.quantity
                        }
                      </div>

                    </div>

                    <div
                      className="text-sm font-bold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {formatPrice(
                        selectedOrder.amount
                      )}
                    </div>

                  </div>

                  <div
                    className="grid grid-cols-2 divide-x"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div className="p-4">

                      <div
                        className="flex items-center gap-2 mb-1"
                      >
                        <FiCalendar
                          size={13}
                          style={{
                            color:
                              COLORS.primary,
                          }}
                        />

                        <span
                          className="text-[10px] uppercase"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          Date
                        </span>
                      </div>

                      <div
                        className="text-sm font-semibold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          selectedOrder.date
                        }
                      </div>

                    </div>

                    <div className="p-4">

                      <div
                        className="flex items-center gap-2 mb-1"
                      >
                        <FiClock
                          size={13}
                          style={{
                            color:
                              COLORS.primary,
                          }}
                        />

                        <span
                          className="text-[10px] uppercase"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          Time
                        </span>
                      </div>

                      <div
                        className="text-sm font-semibold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          selectedOrder.time
                        }
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* PAYMENT */}

              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  backgroundColor:
                    COLORS.successBg,
                }}
              >

                <div>

                  <div
                    className="text-xs"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    Payment Status
                  </div>

                  <div
                    className="text-sm font-bold mt-1"
                    style={{
                      color:
                        COLORS.success,
                    }}
                  >
                    {
                      selectedOrder.payment
                    }
                  </div>

                </div>

                <div
                  className="text-lg font-bold"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {formatPrice(
                    selectedOrder.amount
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </>
  );
};

export default Inbox;