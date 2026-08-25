import React, { useMemo, useState } from 'react';

import {
  FiHome,
  FiChevronRight,
  FiSearch,
  FiPackage,
  FiAlertTriangle,
  FiXCircle,
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiMinus,
  FiSave,
  FiX,
  FiFilter,
  FiChevronDown,
  FiBox,
} from 'react-icons/fi';

import inventoryData from '../../data/inventoryData';

const Inventory = ({ setActivePage }) => {
  // =========================================================
  // STATE
  // =========================================================

  const [inventory, setInventory] =
    useState(inventoryData);

  const [activeTab, setActiveTab] =
    useState('All');

  const [searchText, setSearchText] =
    useState('');

  const [stockFilter, setStockFilter] =
    useState('All');

  const [sortBy, setSortBy] =
    useState('latest');

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [stockValue, setStockValue] =
    useState(0);

  const [showStockModal, setShowStockModal] =
    useState(false);

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
  };

  // =========================================================
  // GET CURRENT STATUS
  // =========================================================

  const getStockStatus = (stock, limit) => {
    if (stock === 0) {
      return 'Out of Stock';
    }

    if (stock <= limit) {
      return 'Low Stock';
    }

    return 'In Stock';
  };

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredInventory = useMemo(() => {
    let result = [...inventory];

    // CATEGORY
    if (activeTab !== 'All') {
      result = result.filter(
        (item) =>
          item.category === activeTab
      );
    }

    // SEARCH
    if (searchText.trim()) {
      const search =
        searchText.toLowerCase();

      result = result.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(search) ||
          item.sku
            .toLowerCase()
            .includes(search) ||
          item.productType
            .toLowerCase()
            .includes(search)
      );
    }

    // STOCK FILTER
    if (stockFilter !== 'All') {
      result = result.filter(
        (item) =>
          getStockStatus(
            item.stock,
            item.lowStockLimit
          ) === stockFilter
      );
    }

    // SORT
    if (sortBy === 'stockLow') {
      result.sort(
        (a, b) => a.stock - b.stock
      );
    }

    if (sortBy === 'stockHigh') {
      result.sort(
        (a, b) => b.stock - a.stock
      );
    }

    if (sortBy === 'priceLow') {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === 'priceHigh') {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    return result;
  }, [
    inventory,
    activeTab,
    searchText,
    stockFilter,
    sortBy,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalProducts =
    inventory.length;

  const totalUnits = inventory.reduce(
    (total, item) =>
      total + Number(item.stock),
    0
  );

  const inStockCount =
    inventory.filter(
      (item) =>
        getStockStatus(
          item.stock,
          item.lowStockLimit
        ) === 'In Stock'
    ).length;

  const lowStockCount =
    inventory.filter(
      (item) =>
        getStockStatus(
          item.stock,
          item.lowStockLimit
        ) === 'Low Stock'
    ).length;

  const outOfStockCount =
    inventory.filter(
      (item) =>
        getStockStatus(
          item.stock,
          item.lowStockLimit
        ) === 'Out of Stock'
    ).length;

  // =========================================================
  // PRICE FORMAT
  // =========================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }
    ).format(price);
  };

  // =========================================================
  // OPEN STOCK MODAL
  // =========================================================

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockValue(product.stock);
    setShowStockModal(true);
  };

  // =========================================================
  // CLOSE STOCK MODAL
  // =========================================================

  const closeStockModal = () => {
    setSelectedProduct(null);
    setStockValue(0);
    setShowStockModal(false);
  };

  // =========================================================
  // SAVE STOCK
  // =========================================================

  const saveStock = () => {
    if (!selectedProduct) {
      return;
    }

    const newStock = Math.max(
      0,
      Number(stockValue)
    );

    setInventory((prev) =>
      prev.map((item) => {
        if (
          item.id === selectedProduct.id
        ) {
          return {
            ...item,
            stock: newStock,
            status: getStockStatus(
              newStock,
              item.lowStockLimit
            ),
          };
        }

        return item;
      })
    );

    closeStockModal();
  };

  // =========================================================
  // QUICK INCREASE
  // =========================================================

  const increaseStock = (product) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === product.id) {
          const newStock =
            Number(item.stock) + 1;

          return {
            ...item,
            stock: newStock,
            status: getStockStatus(
              newStock,
              item.lowStockLimit
            ),
          };
        }

        return item;
      })
    );
  };

  // =========================================================
  // QUICK DECREASE
  // =========================================================

  const decreaseStock = (product) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === product.id) {
          const newStock = Math.max(
            0,
            Number(item.stock) - 1
          );

          return {
            ...item,
            stock: newStock,
            status: getStockStatus(
              newStock,
              item.lowStockLimit
            ),
          };
        }

        return item;
      })
    );
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    if (status === 'In Stock') {
      return {
        backgroundColor:
          COLORS.successBg,
        color: COLORS.success,
      };
    }

    if (status === 'Low Stock') {
      return {
        backgroundColor:
          COLORS.warningBg,
        color: COLORS.warning,
      };
    }

    return {
      backgroundColor:
        COLORS.dangerBg,
      color: COLORS.danger,
    };
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const StatusIcon = ({ status }) => {
    if (status === 'In Stock') {
      return (
        <FiCheckCircle
          size={13}
        />
      );
    }

    if (status === 'Low Stock') {
      return (
        <FiAlertTriangle
          size={13}
        />
      );
    }

    return (
      <FiXCircle
        size={13}
      />
    );
  };

  return (
    <>
      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div
        className="min-h-full p-5 lg:p-8 pb-12"
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
          <FiHome
            size={16}
            className="cursor-pointer"
            onClick={() =>
              setActivePage &&
              setActivePage(
                'Dashboard'
              )
            }
          />

          <FiChevronRight
            size={14}
          />

          <span
            className="font-semibold"
          >
            Products
          </span>

          <FiChevronRight
            size={14}
          />

          <span>
            Inventory
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
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiPackage
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
                Inventory
              </h1>

            </div>

            <p
              className="text-sm lg:text-base lg:ml-[52px]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Monitor and manage your
              product stock
            </p>

          </div>

          {/* ADD STOCK BUTTON */}

          <button
            type="button"
            onClick={() => {
              if (
                inventory.length > 0
              ) {
                openStockModal(
                  inventory[0]
                );
              }
            }}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 w-fit shadow-sm hover:shadow-md transition-all"
            style={{
              backgroundColor:
                COLORS.primary,
            }}
          >
            <FiPlus
              size={18}
            />

            Update Stock
          </button>
        </div>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >

          {/* TOTAL PRODUCTS */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <div
              className="flex items-center justify-between"
            >
              <div>

                <p
                  className="text-sm"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Total Products
                </p>

                <h3
                  className="text-2xl font-bold mt-1"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {totalProducts}
                </h3>

              </div>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiBox
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* IN STOCK */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <div
              className="flex items-center justify-between"
            >
              <div>

                <p
                  className="text-sm"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  In Stock
                </p>

                <h3
                  className="text-2xl font-bold mt-1"
                  style={{
                    color:
                      COLORS.success,
                  }}
                >
                  {inStockCount}
                </h3>

              </div>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.successBg,
                  color:
                    COLORS.success,
                }}
              >
                <FiCheckCircle
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* LOW STOCK */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <div
              className="flex items-center justify-between"
            >
              <div>

                <p
                  className="text-sm"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Low Stock
                </p>

                <h3
                  className="text-2xl font-bold mt-1"
                  style={{
                    color:
                      COLORS.warning,
                  }}
                >
                  {lowStockCount}
                </h3>

              </div>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.warningBg,
                  color:
                    COLORS.warning,
                }}
              >
                <FiAlertTriangle
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* OUT OF STOCK */}

          <div
            className="bg-white border rounded-2xl p-5"
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <div
              className="flex items-center justify-between"
            >
              <div>

                <p
                  className="text-sm"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Out of Stock
                </p>

                <h3
                  className="text-2xl font-bold mt-1"
                  style={{
                    color:
                      COLORS.danger,
                  }}
                >
                  {outOfStockCount}
                </h3>

              </div>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.dangerBg,
                  color:
                    COLORS.danger,
                }}
              >
                <FiXCircle
                  size={20}
                />
              </div>
            </div>
          </div>

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
            className="flex flex-col xl:flex-row xl:items-center justify-between gap-4"
          >

            {/* SEARCH */}

            <div
              className="relative w-full xl:max-w-lg"
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
                value={
                  searchText
                }
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
                placeholder="Search product, SKU or type..."
                className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                style={{
                  borderColor:
                    COLORS.borderDark,
                }}
              />

            </div>

            {/* FILTERS */}

            <div
              className="flex flex-wrap items-center gap-3"
            >

              {/* CATEGORY TABS */}

              <div
                className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto"
                style={{
                  borderColor:
                    '#DDD6FE',
                }}
              >

                {[
                  'All',
                  'Jewellery',
                  'Accessories',
                  'Sarees',
                ].map((tab) => {

                  const active =
                    activeTab ===
                    tab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab
                        )
                      }
                      className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor:
                          active
                            ? COLORS.primaryLight
                            : 'transparent',
                        color: active
                          ? COLORS.primaryDark
                          : COLORS.text,
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}

              </div>

              {/* STOCK FILTER */}

              <div
                className="relative flex-shrink-0"
              >

                <FiFilter
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color:
                      COLORS.primary,
                  }}
                />

                <select
                  value={
                    stockFilter
                  }
                  onChange={(e) =>
                    setStockFilter(
                      e.target.value
                    )
                  }
                  className="appearance-none border rounded-xl pl-9 pr-9 py-2.5 text-sm bg-white outline-none cursor-pointer"
                  style={{
                    borderColor:
                      COLORS.borderDark,
                    color:
                      COLORS.text,
                  }}
                >

                  <option value="All">
                    All Stock
                  </option>

                  <option value="In Stock">
                    In Stock
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

                <FiChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                />

              </div>

              {/* SORT */}

              <div
                className="relative flex-shrink-0"
              >

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                  className="appearance-none border rounded-xl pl-4 pr-9 py-2.5 text-sm bg-white outline-none cursor-pointer"
                  style={{
                    borderColor:
                      COLORS.borderDark,
                    color:
                      COLORS.text,
                  }}
                >

                  <option value="latest">
                    Latest
                  </option>

                  <option value="stockLow">
                    Stock: Low to High
                  </option>

                  <option value="stockHigh">
                    Stock: High to Low
                  </option>

                  <option value="priceLow">
                    Price: Low to High
                  </option>

                  <option value="priceHigh">
                    Price: High to Low
                  </option>

                </select>

                <FiChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                />

              </div>

            </div>

          </div>
        </div>

        {/* ===================================================
            INVENTORY TABLE
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
                Inventory Items
              </h2>

              <p
                className="text-xs mt-1"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                {filteredInventory.length}{' '}
                products displayed
              </p>

            </div>

            <div
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                backgroundColor:
                  COLORS.primaryLight,
                color:
                  COLORS.primaryDark,
              }}
            >
              {totalUnits} Total Units
            </div>

          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr
                  className="border-b"
                  style={{
                    borderColor:
                      COLORS.border,
                    backgroundColor:
                      '#FCFCFD',
                  }}
                >

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Product
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    SKU
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Category
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Price
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Stock
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>

                  <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Update
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInventory.map(
                  (product) => {

                    const currentStatus =
                      getStockStatus(
                        product.stock,
                        product.lowStockLimit
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                        className="border-b last:border-b-0 hover:bg-purple-50/30 transition-colors"
                        style={{
                          borderColor:
                            COLORS.border,
                        }}
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                              style={{
                                backgroundColor:
                                  COLORS.background,
                              }}
                            >

                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="w-full h-full object-cover"
                              />

                            </div>

                            <div>

                              <div
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    COLORS.heading,
                                }}
                              >
                                {
                                  product.name
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
                                  product.productType
                                }
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* SKU */}

                        <td
                          className="px-5 py-4 text-sm font-medium"
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {product.sku}
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <span
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{
                              backgroundColor:
                                COLORS.primaryLight,
                              color:
                                COLORS.primaryDark,
                            }}
                          >
                            {
                              product.category
                            }
                          </span>

                        </td>

                        {/* PRICE */}

                        <td
                          className="px-5 py-4 text-sm font-semibold"
                          style={{
                            color:
                              COLORS.heading,
                          }}
                        >
                          {formatPrice(
                            product.price
                          )}
                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseStock(
                                  product
                                )
                              }
                              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                              style={{
                                borderColor:
                                  COLORS.borderDark,
                                color:
                                  COLORS.text,
                              }}
                            >
                              <FiMinus
                                size={13}
                              />
                            </button>

                            <div className="min-w-[70px] text-center">

                              <div
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    currentStatus ===
                                    'Out of Stock'
                                      ? COLORS.danger
                                      : currentStatus ===
                                        'Low Stock'
                                      ? COLORS.warning
                                      : COLORS.heading,
                                }}
                              >
                                {
                                  product.stock
                                }
                              </div>

                              <div
                                className="text-[10px]"
                                style={{
                                  color:
                                    COLORS.muted,
                                }}
                              >
                                {
                                  product.unit
                                }
                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                increaseStock(
                                  product
                                )
                              }
                              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-purple-50"
                              style={{
                                borderColor:
                                  COLORS.borderDark,
                                color:
                                  COLORS.primary,
                              }}
                            >
                              <FiPlus
                                size={13}
                              />
                            </button>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={getStatusStyle(
                              currentStatus
                            )}
                          >

                            <StatusIcon
                              status={
                                currentStatus
                              }
                            />

                            {
                              currentStatus
                            }

                          </span>

                        </td>

                        {/* UPDATE */}

                        <td className="px-5 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              openStockModal(
                                product
                              )
                            }
                            className="w-9 h-9 rounded-lg inline-flex items-center justify-center hover:bg-purple-50 transition-colors"
                            style={{
                              color:
                                COLORS.primary,
                            }}
                            title="Edit Stock"
                          >
                            <FiEdit2
                              size={16}
                            />
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="lg:hidden">

            {filteredInventory.map(
              (product) => {

                const currentStatus =
                  getStockStatus(
                    product.stock,
                    product.lowStockLimit
                  );

                return (
                  <div
                    key={
                      product.id
                    }
                    className="p-4 border-b last:border-b-0"
                    style={{
                      borderColor:
                        COLORS.border,
                    }}
                  >

                    <div className="flex gap-3">

                      {/* IMAGE */}

                      <div
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      >

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="w-full h-full object-cover"
                        />

                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-2">

                          <div>

                            <h3
                              className="text-sm font-bold"
                              style={{
                                color:
                                  COLORS.heading,
                              }}
                            >
                              {
                                product.name
                              }
                            </h3>

                            <p
                              className="text-xs mt-1"
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {
                                product.sku
                              }
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openStockModal(
                                product
                              )
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor:
                                COLORS.primaryLight,
                              color:
                                COLORS.primary,
                            }}
                          >
                            <FiEdit2
                              size={14}
                            />
                          </button>

                        </div>

                        <div className="flex items-center justify-between mt-3">

                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                COLORS.primaryDark,
                            }}
                          >
                            {formatPrice(
                              product.price
                            )}
                          </span>

                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                            style={getStatusStyle(
                              currentStatus
                            )}
                          >
                            <StatusIcon
                              status={
                                currentStatus
                              }
                            />

                            {
                              currentStatus
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* MOBILE STOCK */}

                    <div
                      className="mt-4 flex items-center justify-between p-3 rounded-xl"
                      style={{
                        backgroundColor:
                          COLORS.background,
                      }}
                    >

                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Available Stock
                      </span>

                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseStock(
                              product
                            )
                          }
                          className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center"
                          style={{
                            borderColor:
                              COLORS.borderDark,
                          }}
                        >
                          <FiMinus
                            size={14}
                          />
                        </button>

                        <span
                          className="text-sm font-bold min-w-[40px] text-center"
                          style={{
                            color:
                              COLORS.heading,
                          }}
                        >
                          {
                            product.stock
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseStock(
                              product
                            )
                          }
                          className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center"
                          style={{
                            borderColor:
                              COLORS.borderDark,
                            color:
                              COLORS.primary,
                          }}
                        >
                          <FiPlus
                            size={14}
                          />
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* EMPTY */}

          {filteredInventory.length ===
            0 && (
            <div
              className="py-20 flex flex-col items-center justify-center text-center"
            >

              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiPackage
                  size={28}
                />
              </div>

              <h3
                className="text-lg font-bold mb-1"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                No inventory found
              </h3>

              <p
                className="text-sm"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Try changing your
                search or filters.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          UPDATE STOCK MODAL
      ===================================================== */}

      {showStockModal &&
        selectedProduct && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={
              closeStockModal
            }
          >

            <div
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div
                className="px-6 py-5 border-b flex items-center justify-between"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <div>

                  <h2
                    className="text-xl font-bold"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Update Stock
                  </h2>

                  <p
                    className="text-xs mt-1"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    Change available
                    inventory quantity
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeStockModal
                  }
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <FiX
                    size={18}
                  />
                </button>

              </div>

              {/* PRODUCT */}

              <div className="p-6">

                <div
                  className="flex items-center gap-4 p-4 rounded-xl mb-6"
                  style={{
                    backgroundColor:
                      COLORS.background,
                  }}
                >

                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  >

                    <img
                      src={
                        selectedProduct.image
                      }
                      alt={
                        selectedProduct.name
                      }
                      className="w-full h-full object-cover"
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
                        selectedProduct.name
                      }
                    </h3>

                    <p
                      className="text-xs mt-1"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {
                        selectedProduct.sku
                      }
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{
                        color:
                          COLORS.primary,
                      }}
                    >
                      Current stock:{' '}
                      {
                        selectedProduct.stock
                      }
                    </p>

                  </div>

                </div>

                {/* STOCK INPUT */}

                <div>

                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Stock Quantity
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      value={
                        stockValue
                      }
                      onChange={(e) =>
                        setStockValue(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl px-4 py-3 text-lg font-semibold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      style={{
                        borderColor:
                          COLORS.borderDark,
                      }}
                    />

                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {
                        selectedProduct.unit
                      }
                    </span>

                  </div>

                </div>

                {/* PREVIEW STATUS */}

                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    backgroundColor:
                      COLORS.primarySoft,
                  }}
                >

                  <div
                    className="text-xs mb-2"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    New Stock Status
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={getStatusStyle(
                      getStockStatus(
                        Number(
                          stockValue
                        ),
                        selectedProduct.lowStockLimit
                      )
                    )}
                  >

                    <StatusIcon
                      status={getStockStatus(
                        Number(
                          stockValue
                        ),
                        selectedProduct.lowStockLimit
                      )}
                    />

                    {getStockStatus(
                      Number(
                        stockValue
                      ),
                      selectedProduct.lowStockLimit
                    )}

                  </span>

                </div>

              </div>

              {/* FOOTER */}

              <div
                className="px-6 py-4 border-t flex justify-end gap-3"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeStockModal
                  }
                  className="px-5 py-2.5 rounded-xl border text-sm font-semibold"
                  style={{
                    borderColor:
                      COLORS.borderDark,
                    color:
                      COLORS.text,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    saveStock
                  }
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                  style={{
                    backgroundColor:
                      COLORS.primary,
                  }}
                >

                  <FiSave
                    size={16}
                  />

                  Save Stock

                </button>

              </div>

            </div>

          </div>
        )}

    </>
  );
};

export default Inventory;