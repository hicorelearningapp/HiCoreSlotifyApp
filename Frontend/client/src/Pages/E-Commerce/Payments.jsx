import React, { useMemo, useState } from 'react';

import {
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiSearch,
  FiDownload,
  FiEye,
  FiX,
  FiCalendar,
  FiUser,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiChevronDown,
  FiArrowUpRight,
  FiArrowDownRight,
} from 'react-icons/fi';

const Payments = () => {
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

    blue: '#2563EB',
    blueBg: '#EFF6FF',

    orange: '#F59E0B',
    orangeBg: '#FFFBEB',

    red: '#DC2626',
    redBg: '#FEF2F2',
  };

  // =========================================================
  // PAYMENT DATA
  // =========================================================

  const [payments] = useState([
    {
      id: 'PAY-1052',
      orderId: 'ORD-1052',
      customer: 'Ananya Sharma',
      email: 'ananya.sharma@gmail.com',
      product: 'Diamond Pendant Necklace',
      amount: 24500,
      method: 'UPI',
      status: 'Paid',
      date: '24 Aug 2026',
      time: '10:42 AM',
      transactionId: 'TXN92837461',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1051',
      orderId: 'ORD-1051',
      customer: 'Rahul Kumar',
      email: 'rahul.kumar@gmail.com',
      product: 'Classic Gold Chain',
      amount: 28500,
      method: 'Credit Card',
      status: 'Paid',
      date: '24 Aug 2026',
      time: '09:35 AM',
      transactionId: 'TXN82736492',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1050',
      orderId: 'ORD-1050',
      customer: 'Priya Menon',
      email: 'priya.menon@gmail.com',
      product: 'Kanchipuram Silk Saree',
      amount: 12900,
      method: 'UPI',
      status: 'Paid',
      date: '23 Aug 2026',
      time: '06:20 PM',
      transactionId: 'TXN73625190',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1049',
      orderId: 'ORD-1049',
      customer: 'Vikram Singh',
      email: 'vikram.singh@gmail.com',
      product: 'Pearl Bracelet',
      amount: 18500,
      method: 'Debit Card',
      status: 'Paid',
      date: '23 Aug 2026',
      time: '04:15 PM',
      transactionId: 'TXN62519384',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1048',
      orderId: 'ORD-1048',
      customer: 'Meera Iyer',
      email: 'meera.iyer@gmail.com',
      product: 'Traditional Gold Earrings',
      amount: 18700,
      method: 'Net Banking',
      status: 'Pending',
      date: '23 Aug 2026',
      time: '02:48 PM',
      transactionId: 'TXN51428376',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1047',
      orderId: 'ORD-1047',
      customer: 'Arjun Reddy',
      email: 'arjun.reddy@gmail.com',
      product: 'Designer Watch',
      amount: 22800,
      method: 'UPI',
      status: 'Paid',
      date: '22 Aug 2026',
      time: '01:32 PM',
      transactionId: 'TXN48372615',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1046',
      orderId: 'ORD-1046',
      customer: 'Sneha Nair',
      email: 'sneha.nair@gmail.com',
      product: 'Gold Earrings',
      amount: 9500,
      method: 'UPI',
      status: 'Refunded',
      date: '22 Aug 2026',
      time: '11:24 AM',
      transactionId: 'TXN37261584',
      gateway: 'Razorpay',
    },
    {
      id: 'PAY-1045',
      orderId: 'ORD-1045',
      customer: 'Karthik Raj',
      email: 'karthik.raj@gmail.com',
      product: 'Gold Bracelet',
      amount: 15700,
      method: 'Cash on Delivery',
      status: 'Paid',
      date: '21 Aug 2026',
      time: '05:40 PM',
      transactionId: 'COD-261548',
      gateway: 'COD',
    },
  ]);

  // =========================================================
  // STATE
  // =========================================================

  const [searchText, setSearchText] = useState('');

  const [activeFilter, setActiveFilter] =
    useState('All');

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [dateRange, setDateRange] =
    useState('Last 30 Days');

  // =========================================================
  // CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // =========================================================
  // PAYMENT FILTER
  // =========================================================

  const filteredPayments = useMemo(() => {
    const search =
      searchText.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesSearch =
        !search ||
        payment.id
          .toLowerCase()
          .includes(search) ||
        payment.orderId
          .toLowerCase()
          .includes(search) ||
        payment.customer
          .toLowerCase()
          .includes(search) ||
        payment.email
          .toLowerCase()
          .includes(search) ||
        payment.product
          .toLowerCase()
          .includes(search) ||
        payment.transactionId
          .toLowerCase()
          .includes(search);

      let matchesFilter = true;

      if (activeFilter === 'Paid') {
        matchesFilter =
          payment.status === 'Paid';
      }

      if (activeFilter === 'Pending') {
        matchesFilter =
          payment.status === 'Pending';
      }

      if (activeFilter === 'Refunded') {
        matchesFilter =
          payment.status === 'Refunded';
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    payments,
    searchText,
    activeFilter,
  ]);

  // =========================================================
  // PAYMENT TOTALS
  // =========================================================

  const paidPayments =
    payments.filter(
      (payment) =>
        payment.status === 'Paid'
    );

  const pendingPayments =
    payments.filter(
      (payment) =>
        payment.status === 'Pending'
    );

  const refundedPayments =
    payments.filter(
      (payment) =>
        payment.status === 'Refunded'
    );

  const totalReceived =
    paidPayments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  const totalPending =
    pendingPayments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  const totalRefunded =
    refundedPayments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    let bg = COLORS.successBg;
    let color = COLORS.success;
    let icon = <FiCheckCircle size={12} />;

    if (status === 'Pending') {
      bg = COLORS.orangeBg;
      color = COLORS.orange;
      icon = <FiClock size={12} />;
    }

    if (status === 'Refunded') {
      bg = COLORS.redBg;
      color = COLORS.red;
      icon = <FiRefreshCw size={12} />;
    }

    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
        style={{
          backgroundColor: bg,
          color,
        }}
      >
        {icon}

        {status}
      </span>
    );
  };

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const PaymentMethodBadge = ({
    method,
  }) => {
    let bg = COLORS.primaryLight;
    let color = COLORS.primaryDark;

    if (method === 'UPI') {
      bg = COLORS.blueBg;
      color = COLORS.blue;
    }

    if (
      method === 'Credit Card' ||
      method === 'Debit Card'
    ) {
      bg = COLORS.primaryLight;
      color = COLORS.primaryDark;
    }

    if (method === 'Net Banking') {
      bg = COLORS.successBg;
      color = COLORS.success;
    }

    if (method === 'Cash on Delivery') {
      bg = COLORS.orangeBg;
      color = COLORS.orange;
    }

    return (
      <span
        className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold"
        style={{
          backgroundColor: bg,
          color,
        }}
      >
        {method}
      </span>
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
    iconBg,
    iconColor,
    growth,
  }) => {
    return (
      <div
        className="bg-white border rounded-2xl p-5 hover:shadow-md transition"
        style={{
          borderColor: COLORS.border,
        }}
      >

        <div
          className="flex items-start justify-between"
        >

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

              <FiArrowUpRight
                size={13}
                style={{
                  color: COLORS.success,
                }}
              />

              <span
                className="text-xs font-semibold"
                style={{
                  color: COLORS.success,
                }}
              >
                +{growth}%
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
  // RETURN
  // =========================================================

  return (
    <>
      <div
        className="min-h-full p-5 lg:p-8 pb-12"
        style={{
          backgroundColor:
            COLORS.background,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

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
                <FiCreditCard
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
                Payments
              </h1>

            </div>

            <p
              className="text-sm lg:text-base mt-2 lg:ml-[55px]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Track payments, transactions,
              refunds and payment activity
            </p>

          </div>

          <div
            className="flex flex-col sm:flex-row gap-3"
          >

            {/* DATE FILTER */}

            <div
              className="relative w-full sm:w-auto"
            >

              <FiCalendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{
                  color:
                    COLORS.muted,
                }}
              />

              <select
                value={dateRange}
                onChange={(e) =>
                  setDateRange(
                    e.target.value
                  )
                }
                className="appearance-none bg-white border rounded-xl pl-10 pr-10 py-3 text-sm font-medium outline-none cursor-pointer w-full"
                style={{
                  borderColor:
                    COLORS.borderDark,
                  color:
                    COLORS.text,
                }}
              >
                <option>
                  Today
                </option>

                <option>
                  Last 7 Days
                </option>

                <option>
                  Last 30 Days
                </option>

                <option>
                  Last 90 Days
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

            {/* EXPORT BUTTON */}

            <button
              type="button"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border bg-white hover:bg-gray-50 transition"
              style={{
                borderColor:
                  COLORS.borderDark,
                color:
                  COLORS.text,
              }}
            >
              <FiDownload
                size={16}
              />

              Export
            </button>

          </div>

        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
        >

          <StatCard
            title="Total Received"
            value={formatCurrency(
              totalReceived
            )}
            subtitle="Successfully received payments"
            icon={
              <FiDollarSign
                size={20}
              />
            }
            iconBg={
              COLORS.primaryLight
            }
            iconColor={
              COLORS.primary
            }
            growth={18.6}
          />

          <StatCard
            title="Pending Payments"
            value={formatCurrency(
              totalPending
            )}
            subtitle="Payments waiting for confirmation"
            icon={
              <FiClock
                size={20}
              />
            }
            iconBg={
              COLORS.orangeBg
            }
            iconColor={
              COLORS.orange
            }
            growth={4.8}
          />

          <StatCard
            title="Refunded"
            value={formatCurrency(
              totalRefunded
            )}
            subtitle="Total amount refunded"
            icon={
              <FiRefreshCw
                size={20}
              />
            }
            iconBg={
              COLORS.redBg
            }
            iconColor={
              COLORS.red
            }
            growth={-2.4}
          />

          <StatCard
            title="Transactions"
            value={
              payments.length
            }
            subtitle="Total payment transactions"
            icon={
              <FiCreditCard
                size={20}
              />
            }
            iconBg={
              COLORS.blueBg
            }
            iconColor={
              COLORS.blue
            }
            growth={12.4}
          />

        </div>

        {/* =================================================
            PAYMENT OVERVIEW
        ================================================= */}

        <div
          className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6"
        >

          {/* PAYMENT BREAKDOWN */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <h2
              className="text-lg font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              Payment Overview
            </h2>

            <p
              className="text-xs mt-1 mb-6"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Payment status breakdown
            </p>

            {/* PAID */}

            <div
              className="flex items-center justify-between mb-5"
            >

              <div
                className="flex items-center gap-3"
              >

                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      COLORS.successBg,
                    color:
                      COLORS.success,
                  }}
                >
                  <FiCheckCircle
                    size={17}
                  />
                </div>

                <div>

                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        COLORS.text,
                    }}
                  >
                    Paid
                  </p>

                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    {
                      paidPayments.length
                    }{' '}
                    transactions
                  </p>

                </div>

              </div>

              <span
                className="text-sm font-bold"
                style={{
                  color:
                    COLORS.success,
                }}
              >
                {formatCurrency(
                  totalReceived
                )}
              </span>

            </div>

            {/* PENDING */}

            <div
              className="flex items-center justify-between mb-5"
            >

              <div
                className="flex items-center gap-3"
              >

                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      COLORS.orangeBg,
                    color:
                      COLORS.orange,
                  }}
                >
                  <FiClock
                    size={17}
                  />
                </div>

                <div>

                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        COLORS.text,
                    }}
                  >
                    Pending
                  </p>

                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    {
                      pendingPayments.length
                    }{' '}
                    transactions
                  </p>

                </div>

              </div>

              <span
                className="text-sm font-bold"
                style={{
                  color:
                    COLORS.orange,
                }}
              >
                {formatCurrency(
                  totalPending
                )}
              </span>

            </div>

            {/* REFUNDED */}

            <div
              className="flex items-center justify-between"
            >

              <div
                className="flex items-center gap-3"
              >

                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      COLORS.redBg,
                    color:
                      COLORS.red,
                  }}
                >
                  <FiRefreshCw
                    size={17}
                  />
                </div>

                <div>

                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        COLORS.text,
                    }}
                  >
                    Refunded
                  </p>

                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    {
                      refundedPayments.length
                    }{' '}
                    transactions
                  </p>

                </div>

              </div>

              <span
                className="text-sm font-bold"
                style={{
                  color:
                    COLORS.red,
                }}
              >
                {formatCurrency(
                  totalRefunded
                )}
              </span>

            </div>

          </div>

          {/* PAYMENT METHODS */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <h2
              className="text-lg font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              Payment Methods
            </h2>

            <p
              className="text-xs mt-1 mb-6"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              How customers are paying
            </p>

            {[
              {
                name: 'UPI',
                count: 4,
                amount: 75600,
                bg: COLORS.blueBg,
                color: COLORS.blue,
              },
              {
                name: 'Credit / Debit Card',
                count: 2,
                amount: 47200,
                bg: COLORS.primaryLight,
                color: COLORS.primary,
              },
              {
                name: 'Net Banking',
                count: 1,
                amount: 18700,
                bg: COLORS.successBg,
                color: COLORS.success,
              },
              {
                name: 'Cash on Delivery',
                count: 1,
                amount: 15700,
                bg: COLORS.orangeBg,
                color: COLORS.orange,
              },
            ].map((method) => (

              <div
                key={method.name}
                className="flex items-center justify-between mb-4 last:mb-0"
              >

                <div
                  className="flex items-center gap-3"
                >

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        method.bg,
                      color:
                        method.color,
                    }}
                  >
                    ₹
                  </div>

                  <div>

                    <p
                      className="text-xs font-semibold"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {method.name}
                    </p>

                    <p
                      className="text-[10px] mt-0.5"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {method.count}{' '}
                      transactions
                    </p>

                  </div>

                </div>

                <span
                  className="text-xs font-bold"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {formatCurrency(
                    method.amount
                  )}
                </span>

              </div>

            ))}

          </div>

          {/* SETTLEMENT */}

          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{
              backgroundColor:
                COLORS.primary,
            }}
          >

            <div
              className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10"
            />

            <div
              className="absolute -right-5 bottom-[-45px] w-32 h-32 rounded-full bg-white/10"
            />

            <div className="relative z-10">

              <p
                className="text-sm font-medium text-purple-100"
              >
                Available for Settlement
              </p>

              <h2
                className="text-3xl font-bold mt-2"
              >
                {formatCurrency(
                  totalReceived -
                    totalRefunded
                )}
              </h2>

              <p
                className="text-xs text-purple-100 mt-2"
              >
                Estimated amount available
                after refunds
              </p>

              <div
                className="border-t border-white/20 mt-6 pt-5"
              >

                <div
                  className="flex items-center justify-between mb-3"
                >

                  <span
                    className="text-xs text-purple-100"
                  >
                    Total Received
                  </span>

                  <span
                    className="text-xs font-semibold"
                  >
                    {formatCurrency(
                      totalReceived
                    )}
                  </span>

                </div>

                <div
                  className="flex items-center justify-between"
                >

                  <span
                    className="text-xs text-purple-100"
                  >
                    Refunds
                  </span>

                  <span
                    className="text-xs font-semibold"
                  >
                    - {formatCurrency(
                      totalRefunded
                    )}
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="w-full mt-6 py-2.5 rounded-xl bg-white text-sm font-semibold hover:bg-purple-50 transition"
                style={{
                  color:
                    COLORS.primary,
                }}
              >
                View Settlement Details
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <div
          className="bg-white border rounded-2xl overflow-hidden"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          {/* HEADER */}

          <div
            className="p-5 border-b"
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <div
              className="flex flex-col xl:flex-row xl:items-center justify-between gap-4"
            >

              <div>

                <h2
                  className="text-lg font-bold"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Payment Transactions
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  {filteredPayments.length}{' '}
                  transactions found
                </p>

              </div>

              {/* SEARCH */}

              <div
                className="relative w-full xl:w-[320px]"
              >

                <FiSearch
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
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
                  placeholder="
                    Search payment...
                  "
                  className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  style={{
                    borderColor:
                      COLORS.borderDark,
                  }}
                />

              </div>

            </div>

            {/* FILTERS */}

            <div
              className="flex items-center gap-2 mt-4 overflow-x-auto"
            >

              {[
                'All',
                'Paid',
                'Pending',
                'Refunded',
              ].map((filter) => (

                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter
                    )
                  }
                  className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition"
                  style={
                    activeFilter ===
                    filter
                      ? {
                          backgroundColor:
                            COLORS.primaryLight,
                          color:
                            COLORS.primaryDark,
                        }
                      : {
                          backgroundColor:
                            '#F8FAFC',
                          color:
                            COLORS.muted,
                        }
                  }
                >
                  {filter}
                </button>

              ))}

            </div>

          </div>

          {/* TABLE */}

          {filteredPayments.length >
          0 ? (

            <div className="overflow-x-auto">

              <table
                className="w-full min-w-[1100px]"
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
                      Payment
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
                      Order
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
                      Method
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

                    <th
                      className="text-center px-5 py-3.5 text-xs font-semibold"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPayments.map(
                    (payment) => (

                      <tr
                        key={payment.id}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        style={{
                          borderColor:
                            COLORS.border,
                        }}
                      >

                        {/* PAYMENT */}

                        <td className="px-5 py-4">

                          <div
                            className="flex items-center gap-3"
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
                              <FiCreditCard
                                size={16}
                              />
                            </div>

                            <div>

                              <p
                                className="text-xs font-bold"
                                style={{
                                  color:
                                    COLORS.heading,
                                }}
                              >
                                {
                                  payment.id
                                }
                              </p>

                              <p
                                className="text-[10px] mt-1"
                                style={{
                                  color:
                                    COLORS.muted,
                                }}
                              >
                                {
                                  payment.transactionId
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div>

                            <p
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  COLORS.heading,
                              }}
                            >
                              {
                                payment.customer
                              }
                            </p>

                            <p
                              className="text-[10px] mt-1 truncate max-w-[180px]"
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {
                                payment.email
                              }
                            </p>

                          </div>

                        </td>

                        {/* ORDER */}

                        <td className="px-5 py-4">

                          <div>

                            <p
                              className="text-xs font-bold"
                              style={{
                                color:
                                  COLORS.primary,
                              }}
                            >
                              {
                                payment.orderId
                              }
                            </p>

                            <p
                              className="text-[10px] mt-1"
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {
                                payment.product
                              }
                            </p>

                          </div>

                        </td>

                        {/* AMOUNT */}

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
                              payment.amount
                            )}
                          </span>

                        </td>

                        {/* METHOD */}

                        <td className="px-5 py-4">

                          <PaymentMethodBadge
                            method={
                              payment.method
                            }
                          />

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              payment.status
                            }
                          />

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div
                            className="flex items-center gap-1.5"
                          >

                            <FiCalendar
                              size={12}
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            />

                            <div>

                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    COLORS.text,
                                }}
                              >
                                {
                                  payment.date
                                }
                              </p>

                              <p
                                className="text-[10px] mt-0.5"
                                style={{
                                  color:
                                    COLORS.muted,
                                }}
                              >
                                {
                                  payment.time
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <div
                            className="flex items-center justify-center"
                          >

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPayment(
                                  payment
                                )
                              }
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-purple-50 transition"
                              style={{
                                color:
                                  COLORS.primary,
                              }}
                              title="View Payment"
                            >
                              <FiEye
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div
              className="py-20 text-center"
            >

              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiCreditCard
                  size={28}
                />
              </div>

              <h3
                className="text-lg font-bold"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                No payments found
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

      </div>

      {/* =====================================================
          PAYMENT DETAILS MODAL
      ===================================================== */}

      {selectedPayment && (

        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() =>
            setSelectedPayment(null)
          }
        >

          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="px-5 py-4 border-b flex items-center justify-between"
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
                  Payment Details
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  {
                    selectedPayment.id
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                <FiX
                  size={19}
                />
              </button>

            </div>

            {/* MODAL BODY */}

            <div
              className="p-5 overflow-y-auto"
            >

              {/* PAYMENT AMOUNT */}

              <div
                className="rounded-xl p-5 text-center mb-5"
                style={{
                  backgroundColor:
                    COLORS.primarySoft,
                }}
              >

                <p
                  className="text-xs mb-2"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Payment Amount
                </p>

                <h3
                  className="text-3xl font-bold"
                  style={{
                    color:
                      COLORS.primary,
                  }}
                >
                  {formatCurrency(
                    selectedPayment.amount
                  )}
                </h3>

                <div className="mt-3">

                  <StatusBadge
                    status={
                      selectedPayment.status
                    }
                  />

                </div>

              </div>

              {/* PAYMENT INFORMATION */}

              <div
                className="border rounded-xl overflow-hidden mb-5"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <div
                  className="px-4 py-3 bg-gray-50 border-b"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  <h3
                    className="text-sm font-bold"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Transaction Information
                  </h3>

                </div>

                <div className="p-4 space-y-4">

                  {/* TRANSACTION ID */}

                  <div
                    className="flex items-center justify-between gap-4"
                  >

                    <span
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Transaction ID
                    </span>

                    <span
                      className="text-xs font-semibold text-right"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {
                        selectedPayment.transactionId
                      }
                    </span>

                  </div>

                  {/* ORDER */}

                  <div
                    className="flex items-center justify-between gap-4"
                  >

                    <span
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Order ID
                    </span>

                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          COLORS.primary,
                      }}
                    >
                      {
                        selectedPayment.orderId
                      }
                    </span>

                  </div>

                  {/* METHOD */}

                  <div
                    className="flex items-center justify-between gap-4"
                  >

                    <span
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Payment Method
                    </span>

                    <PaymentMethodBadge
                      method={
                        selectedPayment.method
                      }
                    />

                  </div>

                  {/* GATEWAY */}

                  <div
                    className="flex items-center justify-between gap-4"
                  >

                    <span
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Payment Gateway
                    </span>

                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {
                        selectedPayment.gateway
                      }
                    </span>

                  </div>

                  {/* DATE */}

                  <div
                    className="flex items-center justify-between gap-4"
                  >

                    <span
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Date & Time
                    </span>

                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {
                        selectedPayment.date
                      }{' '}
                      •{' '}
                      {
                        selectedPayment.time
                      }
                    </span>

                  </div>

                </div>

              </div>

              {/* CUSTOMER */}

              <div
                className="border rounded-xl p-4"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <div
                  className="flex items-center gap-3 mb-4"
                >

                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        COLORS.primaryLight,
                      color:
                        COLORS.primary,
                    }}
                  >
                    <FiUser
                      size={18}
                    />
                  </div>

                  <div>

                    <h3
                      className="text-sm font-bold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {
                        selectedPayment.customer
                      }
                    </h3>

                    <p
                      className="text-[11px] mt-0.5"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {
                        selectedPayment.email
                      }
                    </p>

                  </div>

                </div>

                <div
                  className="flex items-center gap-3"
                >

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        COLORS.blueBg,
                      color:
                        COLORS.blue,
                    }}
                  >
                    <FiShoppingBag
                      size={16}
                    />
                  </div>

                  <div>

                    <p
                      className="text-[10px]"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Product
                    </p>

                    <p
                      className="text-xs font-semibold mt-0.5"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {
                        selectedPayment.product
                      }
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              className="px-5 py-4 border-t flex justify-end"
              style={{
                borderColor:
                  COLORS.border,
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor:
                    COLORS.primary,
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Payments;