import React, { useMemo, useState } from 'react';
import {
  FiHome,
  FiChevronRight,
  FiShoppingBag,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronDown,
  FiPackage,
  FiTag,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';
import productData from '../../data/productData';

const AllProducts = ({ setActivePage }) => {

  // =========================================================
  // STATE
  // =========================================================
  const [categoryType, setCategoryType] = useState('Jewellery');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('latest');

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

    danger: '#EF4444',
    success: '#16A34A',
  };

  // =========================================================
  // CURRENT PRODUCTS
  // =========================================================
  const products = useMemo(() => {
    let data = productData[categoryType] || [];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      data = data.filter((product) => {
        return (
          product.name.toLowerCase().includes(search) ||
          product.type?.toLowerCase().includes(search) ||
          product.material?.toLowerCase().includes(search) ||
          product.id.toLowerCase().includes(search)
        );
      });
    }

    const sorted = [...data];

    if (sortBy === 'priceLow') {
      sorted.sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'priceHigh') {
      sorted.sort((a, b) => b.price - a.price);
    }

    if (sortBy === 'stockLow') {
      sorted.sort((a, b) => a.stock - b.stock);
    }

    return sorted;
  }, [categoryType, searchText, sortBy]);

  // =========================================================
  // OPEN PRODUCT
  // =========================================================
  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImage(0);
  };

  // =========================================================
  // CLOSE PRODUCT
  // =========================================================
  const closeProduct = () => {
    setSelectedProduct(null);
    setSelectedImage(0);
  };

  // =========================================================
  // TAB
  // =========================================================
  const CategoryTab = ({ type }) => {
    const active = categoryType === type;

    return (
      <button
        type="button"
        onClick={() => {
          setCategoryType(type);
          setSearchText('');
        }}
        className="
          px-5
          py-2.5
          rounded-lg
          text-sm
          font-semibold
          transition-all
          whitespace-nowrap
        "
        style={{
          backgroundColor: active
            ? COLORS.primaryLight
            : 'transparent',
          color: active
            ? COLORS.primaryDark
            : COLORS.text,
        }}
      >
        {type}
      </button>
    );
  };

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

  return (
    <>
      <div
        className="
          min-h-screen
          p-5
          lg:p-8
          pb-12
          font-sans
        "
        style={{
          backgroundColor: COLORS.background,
          color: COLORS.heading,
        }}
      >
        {/* ===================================================
            BREADCRUMB
        =================================================== */}
        <div
          className="flex items-center gap-2 text-sm mb-6"
          style={{ color: COLORS.muted }}
        >
          <FiHome
            size={16}
            className="cursor-pointer"
            onClick={() =>
              setActivePage &&
              setActivePage('Dashboard')
            }
          />

          <FiChevronRight size={14} />

          <span className="font-semibold">
            Products
          </span>
        </div>

        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="mb-7 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                }}
              >
                <FiShoppingBag
                  size={24}
                  style={{
                    color: COLORS.primary,
                  }}
                />
              </div>

              <h1
                className="
                  text-3xl
                  lg:text-4xl
                  font-bold
                  tracking-tight
                "
                style={{
                  color: COLORS.heading,
                }}
              >
                All Products
              </h1>
            </div>

            <p
              className="text-sm lg:text-base ml-0 lg:ml-[52px]"
              style={{
                color: COLORS.muted,
              }}
            >
              Manage and view all your products
            </p>
          </div>

          {/* =================================================
              CATEGORY TABS
          ================================================= */}
          <div
            className="
              bg-white
              border
              rounded-xl
              p-1.5
              shadow-sm
              inline-flex
              w-fit
            "
            style={{
              borderColor: '#DDD6FE',
            }}
          >
            <CategoryTab type="Jewellery" />
            <CategoryTab type="Accessories" />
            <CategoryTab type="Sarees" />
          </div>
        </div>

        {/* ===================================================
            SEARCH / FILTER BAR
        =================================================== */}
        <div
          className="
            bg-white
            border
            rounded-2xl
            p-4
            mb-6
            flex
            flex-col
            md:flex-row
            gap-3
            md:items-center
            justify-between
          "
          style={{
            borderColor: COLORS.border,
          }}
        >
          <div className="relative flex-1 max-w-xl">
            <FiSearch
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
              "
              style={{
                color: COLORS.placeholder,
              }}
            />

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              placeholder={`Search ${categoryType.toLowerCase()}...`}
              className="
                w-full
                border
                rounded-xl
                pl-11
                pr-4
                py-3
                text-sm
                outline-none
                focus:ring-2
                focus:ring-purple-100
                focus:border-purple-500
              "
              style={{
                borderColor: COLORS.borderDark,
              }}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="
                  appearance-none
                  border
                  rounded-xl
                  pl-10
                  pr-10
                  py-3
                  text-sm
                  outline-none
                  bg-white
                  cursor-pointer
                "
                style={{
                  borderColor: COLORS.borderDark,
                  color: COLORS.text,
                }}
              >
                <option value="latest">
                  Latest
                </option>

                <option value="priceLow">
                  Price: Low to High
                </option>

                <option value="priceHigh">
                  Price: High to Low
                </option>

                <option value="stockLow">
                  Low Stock
                </option>
              </select>

              <FiFilter
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  pointer-events-none
                "
                style={{
                  color: COLORS.primary,
                }}
              />

              <FiChevronDown
                size={15}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  pointer-events-none
                "
                style={{
                  color: COLORS.muted,
                }}
              />
            </div>

            <div
              className="
                px-4
                py-3
                rounded-xl
                text-sm
                font-semibold
                flex
                items-center
                gap-2
              "
              style={{
                backgroundColor:
                  COLORS.primaryLight,
                color: COLORS.primaryDark,
              }}
            >
              <FiPackage size={16} />
              {products.length} Products
            </div>
          </div>
        </div>

        {/* ===================================================
            PRODUCT GRID
        =================================================== */}
        {products.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-5
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  openProduct(product)
                }
                className="
                  bg-white
                  rounded-2xl
                  border
                  overflow-hidden
                  cursor-pointer
                  group
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-lg
                "
                style={{
                  borderColor: COLORS.border,
                }}
              >
                {/* PRODUCT IMAGE */}
                <div
                  className="
                    relative
                    aspect-square
                    overflow-hidden
                  "
                  style={{
                    backgroundColor:
                      COLORS.background,
                  }}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  {/* STATUS */}
                  <div
                    className="
                      absolute
                      top-3
                      left-3
                      px-2.5
                      py-1
                      rounded-full
                      text-[11px]
                      font-bold
                      flex
                      items-center
                      gap-1
                    "
                    style={{
                      backgroundColor:
                        '#ECFDF5',
                      color: '#15803D',
                    }}
                  >
                    <FiCheckCircle size={12} />
                    {product.status}
                  </div>

                  {/* IMAGE COUNT */}
                  <div
                    className="
                      absolute
                      bottom-3
                      right-3
                      px-2.5
                      py-1
                      rounded-full
                      text-[11px]
                      font-semibold
                      bg-black/60
                      text-white
                    "
                  >
                    4 Photos
                  </div>

                  {/* VIEW BUTTON */}
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                    "
                    style={{
                      backgroundColor:
                        'rgba(15,23,42,0.35)',
                    }}
                  >
                    <div
                      className="
                        px-4
                        py-2
                        bg-white
                        rounded-lg
                        text-sm
                        font-semibold
                        flex
                        items-center
                        gap-2
                      "
                      style={{
                        color: COLORS.primaryDark,
                      }}
                    >
                      <FiEye size={16} />
                      View Details
                    </div>
                  </div>
                </div>

                {/* PRODUCT CONTENT */}
                <div className="p-4">
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                      mb-2
                    "
                  >
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: COLORS.muted,
                      }}
                    >
                      {product.id}
                    </span>

                    <span
                      className="
                        text-[11px]
                        px-2
                        py-1
                        rounded-md
                        font-semibold
                      "
                      style={{
                        backgroundColor:
                          COLORS.primaryLight,
                        color:
                          COLORS.primaryDark,
                      }}
                    >
                      {product.type}
                    </span>
                  </div>

                  <h3
                    className="
                      text-base
                      font-bold
                      mb-2
                      line-clamp-1
                    "
                    style={{
                      color: COLORS.heading,
                    }}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div
                        className="text-lg font-bold"
                        style={{
                          color: COLORS.primaryDark,
                        }}
                      >
                        {formatPrice(product.price)}
                      </div>

                      {product.compareAtPrice && (
                        <div
                          className="
                            text-xs
                            line-through
                          "
                          style={{
                            color:
                              COLORS.placeholder,
                          }}
                        >
                          {formatPrice(
                            product.compareAtPrice
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div
                        className="text-xs"
                        style={{
                          color: COLORS.muted,
                        }}
                      >
                        Stock
                      </div>

                      <div
                        className="text-sm font-bold"
                        style={{
                          color:
                            product.stock <= 5
                              ? COLORS.danger
                              : COLORS.text,
                        }}
                      >
                        {product.stock}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */
          <div
            className="
              bg-white
              rounded-2xl
              border
              py-20
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
            style={{
              borderColor: COLORS.border,
            }}
          >
            <div
              className="
                w-16
                h-16
                rounded-full
                flex
                items-center
                justify-center
                mb-4
              "
              style={{
                backgroundColor:
                  COLORS.primaryLight,
                color: COLORS.primary,
              }}
            >
              <FiPackage size={28} />
            </div>

            <h3
              className="text-lg font-bold mb-1"
              style={{
                color: COLORS.heading,
              }}
            >
              No products found
            </h3>

            <p
              className="text-sm"
              style={{
                color: COLORS.muted,
              }}
            >
              Try changing your search or category.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          PRODUCT DETAIL MODAL
      ===================================================== */}
      {selectedProduct && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closeProduct}
        >
          <div
            className="
              bg-white
              w-full
              max-w-5xl
              max-h-[92vh]
              overflow-y-auto
              scrollbar-hide
              rounded-2xl
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div
              className="
                sticky
                top-0
                z-10
                bg-white
                border-b
                px-6
                py-4
                flex
                items-center
                justify-between
              "
              style={{
                borderColor: COLORS.border,
              }}
            >
              <div>
                <div
                  className="text-xs font-semibold mb-1"
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  {selectedProduct.id}
                </div>

                <h2
                  className="
                    text-xl
                    lg:text-2xl
                    font-bold
                  "
                  style={{
                    color: COLORS.heading,
                  }}
                >
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeProduct}
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  transition-colors
                "
                style={{
                  backgroundColor:
                    COLORS.background,
                  color: COLORS.text,
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div
              className="
                p-6
                lg:p-8
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-8
              "
            >
              {/* ===========================================
                  IMAGE GALLERY
              =========================================== */}
              <div>
                <div
                  className="
                    aspect-square
                    rounded-2xl
                    overflow-hidden
                    mb-4
                  "
                    style={{
                      backgroundColor:
                        COLORS.background,
                    }}
                  >
                    <img
                      src={
                        selectedProduct.images[
                          selectedImage
                        ]
                      }
                      alt={selectedProduct.name}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  </div>

                  {/* THUMBNAILS */}
                  <div className="grid grid-cols-4 gap-3">
                    {selectedProduct.images.map(
                      (image, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() =>
                            setSelectedImage(index)
                          }
                          className="
                            aspect-square
                            rounded-xl
                            overflow-hidden
                            border-2
                            transition-all
                          "
                          style={{
                            borderColor:
                              selectedImage ===
                              index
                                ? COLORS.primary
                                : COLORS.border,
                          }}
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${
                              index + 1
                            }`}
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />
                        </button>
                      )
                    )}
                  </div>
              </div>

              {/* ===========================================
                  PRODUCT DETAILS
              =========================================== */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="
                      px-3
                      py-1.5
                      rounded-full
                      text-xs
                      font-bold
                    "
                    style={{
                      backgroundColor:
                        COLORS.primaryLight,
                      color:
                        COLORS.primaryDark,
                    }}
                  >
                    {selectedProduct.category}
                  </span>

                  <span
                    className="
                      px-3
                      py-1.5
                      rounded-full
                      text-xs
                      font-bold
                    "
                    style={{
                      backgroundColor:
                        '#ECFDF5',
                      color: '#15803D',
                    }}
                  >
                    {selectedProduct.status}
                  </span>
                </div>

                <h3
                  className="
                    text-2xl
                    lg:text-3xl
                    font-bold
                    mb-3
                  "
                  style={{
                    color: COLORS.heading,
                  }}
                >
                  {selectedProduct.name}
                </h3>

                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="
                      text-2xl
                      font-bold
                    "
                    style={{
                      color: COLORS.primaryDark,
                    }}
                  >
                    {formatPrice(
                      selectedProduct.price
                    )}
                  </span>

                  {selectedProduct.compareAtPrice && (
                    <span
                      className="
                        text-sm
                        line-through
                      "
                      style={{
                        color:
                          COLORS.placeholder,
                      }}
                    >
                      {formatPrice(
                        selectedProduct.compareAtPrice
                      )}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div className="mb-6">
                  <h4
                    className="
                      text-sm
                      font-bold
                      mb-2
                    "
                    style={{
                      color: COLORS.heading,
                    }}
                  >
                    Description
                  </h4>

                  <p
                    className="
                      text-sm
                      leading-6
                    "
                    style={{
                      color: COLORS.muted,
                    }}
                  >
                    {selectedProduct.description}
                  </p>
                </div>

                {/* INFO GRID */}
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    mb-6
                  "
                >
                  <div
                    className="
                      p-4
                      rounded-xl
                      border
                    "
                    style={{
                      borderColor:
                        COLORS.border,
                      backgroundColor:
                        COLORS.background,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FiTag
                        size={15}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <span
                        className="text-xs"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Product Type
                      </span>
                    </div>

                    <div
                      className="text-sm font-bold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {selectedProduct.type}
                    </div>
                  </div>

                  <div
                    className="
                      p-4
                      rounded-xl
                      border
                    "
                    style={{
                      borderColor:
                        COLORS.border,
                      backgroundColor:
                        COLORS.background,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FiPackage
                        size={15}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <span
                        className="text-xs"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Stock
                      </span>
                    </div>

                    <div
                      className="text-sm font-bold"
                      style={{
                        color:
                          selectedProduct.stock <=
                          5
                            ? COLORS.danger
                            : COLORS.heading,
                      }}
                    >
                      {selectedProduct.stock}{' '}
                      {selectedProduct.unit}
                    </div>
                  </div>

                  {selectedProduct.material && (
                    <div
                      className="
                        p-4
                        rounded-xl
                        border
                      "
                      style={{
                        borderColor:
                          COLORS.border,
                        backgroundColor:
                          COLORS.background,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FiLayers
                          size={15}
                          style={{
                            color:
                              COLORS.primary,
                          }}
                        />

                        <span
                          className="text-xs"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          Material
                        </span>
                      </div>

                      <div
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          selectedProduct.material
                        }
                      </div>
                    </div>
                  )}

                  {selectedProduct.weight && (
                    <div
                      className="
                        p-4
                        rounded-xl
                        border
                      "
                      style={{
                        borderColor:
                          COLORS.border,
                        backgroundColor:
                          COLORS.background,
                      }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Approx. Weight
                      </div>

                      <div
                        className="text-sm font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {
                          selectedProduct.weight
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* HIGHLIGHTS */}
                {selectedProduct.highlights &&
                  selectedProduct.highlights
                    .length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="
                          text-sm
                          font-bold
                          mb-3
                        "
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        Product Highlights
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.highlights.map(
                          (highlight) => (
                            <span
                              key={highlight}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                font-semibold
                              "
                              style={{
                                backgroundColor:
                                  COLORS.primaryLight,
                                color:
                                  COLORS.primaryDark,
                              }}
                            >
                              ✓ {highlight}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* COLORS */}
                {selectedProduct.colors &&
                  selectedProduct.colors
                    .length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="
                          text-sm
                          font-bold
                          mb-3
                        "
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        Available Colors
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map(
                          (color) => (
                            <span
                              key={color}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                border
                                text-xs
                                font-medium
                              "
                              style={{
                                borderColor:
                                  COLORS.border,
                                color:
                                  COLORS.text,
                              }}
                            >
                              {color}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* SIZES */}
                {selectedProduct.sizes &&
                  selectedProduct.sizes
                    .length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="
                          text-sm
                          font-bold
                          mb-3
                        "
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        Available Sizes
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(
                          (size) => (
                            <span
                              key={size}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                border
                                text-xs
                                font-medium
                              "
                              style={{
                                borderColor:
                                  COLORS.border,
                                color:
                                  COLORS.text,
                              }}
                            >
                              {size}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* ACCESSORIES TAGS */}
                {selectedProduct.tags &&
                  selectedProduct.tags.length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="
                          text-sm
                          font-bold
                          mb-3
                        "
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        Tags
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map(
                          (tag) => (
                            <span
                              key={tag}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                font-medium
                              "
                              style={{
                                backgroundColor:
                                  COLORS.background,
                                color:
                                  COLORS.muted,
                                border:
                                  `1px solid ${COLORS.border}`,
                              }}
                            >
                              #{tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* JEWELLERY VARIANTS */}
                {selectedProduct.variants && (
                  <div
                    className="
                      p-4
                      rounded-xl
                      mb-6
                    "
                    style={{
                      backgroundColor:
                        COLORS.primarySoft,
                    }}
                  >
                    <h4
                      className="
                        text-sm
                        font-bold
                        mb-3
                      "
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      Product Variants
                    </h4>

                    {selectedProduct.variants
                      .chainLength?.length >
                      0 && (
                      <div className="mb-3">
                        <div
                          className="text-xs mb-2"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          Chain Length
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.variants.chainLength.map(
                            (item) => (
                              <span
                                key={item}
                                className="
                                  px-3
                                  py-1.5
                                  bg-white
                                  rounded-lg
                                  text-xs
                                  font-semibold
                                "
                                style={{
                                  color:
                                    COLORS.text,
                                  border:
                                    `1px solid ${COLORS.border}`,
                                }}
                              >
                                {item}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedProduct.variants
                      .pendantDesign?.length >
                      0 && (
                      <div>
                        <div
                          className="text-xs mb-2"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          Pendant Design
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.variants.pendantDesign.map(
                            (item) => (
                              <span
                                key={item}
                                className="
                                  px-3
                                  py-1.5
                                  bg-white
                                  rounded-lg
                                  text-xs
                                  font-semibold
                                "
                                style={{
                                  color:
                                    COLORS.text,
                                  border:
                                    `1px solid ${COLORS.border}`,
                                }}
                              >
                                {item}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CARE INSTRUCTIONS */}
                {selectedProduct.careInstructions && (
                  <div
                    className="
                      p-4
                      rounded-xl
                    "
                    style={{
                      backgroundColor:
                        COLORS.background,
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-1"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      Care Instructions
                    </div>

                    <p
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {
                        selectedProduct.careInstructions
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllProducts;