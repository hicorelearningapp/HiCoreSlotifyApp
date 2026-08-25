import React, { useState } from 'react';

import {
  FiHome,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiPackage,
  FiCheckCircle,
  FiX,
  FiSave,
  FiTag,
} from 'react-icons/fi';

import categoryData from '../../data/categoryData';

const Categories = ({ setActivePage }) => {
  // =========================================================
  // STATE
  // =========================================================

  const [categories, setCategories] = useState(
    categoryData
  );

  const [searchText, setSearchText] = useState('');

  const [activeTab, setActiveTab] =
    useState('All');

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [categoryToDelete, setCategoryToDelete] =
    useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productCount: 0,
    status: 'Active',
    icon: '📦',
  });

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

    danger: '#EF4444',
    dangerBg: '#FEF2F2',
  };

  // =========================================================
  // FILTER CATEGORIES
  // =========================================================

  const filteredCategories = categories.filter(
    (category) => {
      const matchesSearch =
        category.name
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          ) ||
        category.description
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      const matchesTab =
        activeTab === 'All' ||
        category.name === activeTab;

      return (
        matchesSearch &&
        matchesTab
      );
    }
  );

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const handleAddCategory = () => {
    setEditingCategory(null);

    setFormData({
      name: '',
      description: '',
      productCount: 0,
      status: 'Active',
      icon: '📦',
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEditCategory = (
    category
  ) => {
    setEditingCategory(category);

    setFormData({
      name: category.name,
      description:
        category.description,
      productCount:
        category.productCount,
      status: category.status,
      icon: category.icon,
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      alert(
        'Please enter category name.'
      );
      return;
    }

    if (
      !formData.description.trim()
    ) {
      alert(
        'Please enter category description.'
      );
      return;
    }

    // EDIT
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id ===
          editingCategory.id
            ? {
                ...category,
                name: formData.name,
                description:
                  formData.description,
                productCount:
                  Number(
                    formData.productCount
                  ),
                status:
                  formData.status,
                icon: formData.icon,
              }
            : category
        )
      );
    }

    // ADD
    else {
      const newCategory = {
        id: `CAT-${String(
          categories.length + 1
        ).padStart(3, '0')}`,
        name: formData.name,
        description:
          formData.description,
        productCount:
          Number(
            formData.productCount
          ),
        status: formData.status,
        icon: formData.icon,
        color: 'purple',
      };

      setCategories((prev) => [
        ...prev,
        newCategory,
      ]);
    }

    closeModal();
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const handleDeleteClick = (
    category
  ) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const handleDeleteCategory = () => {
    if (!categoryToDelete) {
      return;
    }

    setCategories((prev) =>
      prev.filter(
        (category) =>
          category.id !==
          categoryToDelete.id
      )
    );

    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  // =========================================================
  // CATEGORY CARD
  // =========================================================

  const CategoryCard = ({
    category,
  }) => {
    return (
      <div
        className="
          bg-white
          rounded-2xl
          border
          p-5
          transition-all
          duration-200
          hover:shadow-lg
          hover:-translate-y-1
        "
        style={{
          borderColor:
            COLORS.border,
        }}
      >
        {/* TOP */}
        <div className="flex items-start justify-between">

          <div
            className="
              w-14
              h-14
              rounded-xl
              flex
              items-center
              justify-center
              text-3xl
            "
            style={{
              backgroundColor:
                COLORS.primaryLight,
            }}
          >
            {category.icon}
          </div>

          <div className="flex items-center gap-1">

            {/* EDIT */}
            <button
              type="button"
              onClick={() =>
                handleEditCategory(
                  category
                )
              }
              className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                hover:bg-purple-50
                transition-colors
              "
              style={{
                color:
                  COLORS.primary,
              }}
              title="Edit"
            >
              <FiEdit2 size={16} />
            </button>

            {/* DELETE */}
            <button
              type="button"
              onClick={() =>
                handleDeleteClick(
                  category
                )
              }
              className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                hover:bg-red-50
                transition-colors
              "
              style={{
                color:
                  COLORS.danger,
              }}
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>

          </div>
        </div>

        {/* CATEGORY NAME */}
        <div className="mt-5">

          <div className="flex items-center gap-2">

            <h3
              className="
                text-lg
                font-bold
              "
              style={{
                color:
                  COLORS.heading,
              }}
            >
              {category.name}
            </h3>

            {category.status ===
              'Active' && (
              <span
                className="
                  px-2
                  py-1
                  rounded-full
                  text-[10px]
                  font-bold
                "
                style={{
                  backgroundColor:
                    COLORS.successBg,
                  color:
                    COLORS.success,
                }}
              >
                Active
              </span>
            )}

          </div>

          {/* DESCRIPTION */}
          <p
            className="
              text-sm
              leading-6
              mt-2
              min-h-[72px]
            "
            style={{
              color:
                COLORS.muted,
            }}
          >
            {category.description}
          </p>

        </div>

        {/* DIVIDER */}
        <div
          className="
            border-t
            my-4
          "
          style={{
            borderColor:
              COLORS.border,
          }}
        />

        {/* BOTTOM INFO */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
              "
              style={{
                backgroundColor:
                  COLORS.primarySoft,
                color:
                  COLORS.primary,
              }}
            >
              <FiPackage
                size={16}
              />
            </div>

            <div>
              <div
                className="
                  text-xs
                "
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Products
              </div>

              <div
                className="
                  text-sm
                  font-bold
                "
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                {
                  category.productCount
                }
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => {
              // You can later connect this
              // to All Products filtering.
              setActivePage &&
                setActivePage(
                  'All Products'
                );
            }}
            className="
              text-sm
              font-semibold
              flex
              items-center
              gap-1
              hover:underline
            "
            style={{
              color:
                COLORS.primary,
            }}
          >
            View Products
            <FiChevronRight
              size={14}
            />
          </button>

        </div>
      </div>
    );
  };

  return (
    <>
      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div
        className="
          min-h-full
          p-5
          lg:p-8
          pb-12
        "
        style={{
          backgroundColor:
            COLORS.background,
        }}
      >

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            mb-6
          "
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
            className="
              font-semibold
            "
          >
            Products
          </span>

          <FiChevronRight
            size={14}
          />

          <span>
            Categories
          </span>

        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            justify-between
            gap-5
            mb-7
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-3
                mb-1
              "
            >

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
                  color:
                    COLORS.primary,
                }}
              >
                <FiTag
                  size={23}
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
                  color:
                    COLORS.heading,
                }}
              >
                Categories
              </h1>

            </div>

            <p
              className="
                text-sm
                lg:text-base
                lg:ml-[52px]
              "
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Organize and manage your
              product categories
            </p>

          </div>

          {/* ADD CATEGORY */}
          <button
            type="button"
            onClick={
              handleAddCategory
            }
            className="
              px-5
              py-3
              rounded-xl
              text-sm
              font-semibold
              text-white
              flex
              items-center
              justify-center
              gap-2
              shadow-sm
              hover:shadow-md
              transition-all
              w-fit
            "
            style={{
              backgroundColor:
                COLORS.primary,
            }}
          >
            <FiPlus
              size={18}
            />

            Add Category
          </button>

        </div>

        {/* ===================================================
            SEARCH + TABS
        =================================================== */}

        <div
          className="
            bg-white
            border
            rounded-2xl
            p-4
            mb-6
          "
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              justify-between
              gap-4
            "
          >

            {/* SEARCH */}
            <div
              className="
                relative
                w-full
                lg:max-w-md
              "
            >

              <FiSearch
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                "
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
                placeholder="Search categories..."
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
                  borderColor:
                    COLORS.borderDark,
                }}
              />

            </div>

            {/* CATEGORY TABS */}
            <div
              className="
                flex
                items-center
                gap-1
                p-1
                rounded-xl
                border
                w-fit
                overflow-x-auto
              "
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
                  activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab
                      )
                    }
                    className="
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      whitespace-nowrap
                      transition-all
                    "
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

          </div>

        </div>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            mb-6
          "
        >

          {/* TOTAL CATEGORIES */}
          <div
            className="
              bg-white
              border
              rounded-2xl
              p-5
            "
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <div className="flex items-center justify-between">

              <div>
                <p
                  className="
                    text-sm
                  "
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Total Categories
                </p>

                <h3
                  className="
                    text-2xl
                    font-bold
                    mt-1
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {categories.length}
                </h3>
              </div>

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiTag
                  size={20}
                />
              </div>

            </div>

          </div>

          {/* ACTIVE */}
          <div
            className="
              bg-white
              border
              rounded-2xl
              p-5
            "
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <div className="flex items-center justify-between">

              <div>
                <p
                  className="text-sm"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  Active Categories
                </p>

                <h3
                  className="
                    text-2xl
                    font-bold
                    mt-1
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {
                    categories.filter(
                      (item) =>
                        item.status ===
                        'Active'
                    ).length
                  }
                </h3>
              </div>

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
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

          {/* TOTAL PRODUCTS */}
          <div
            className="
              bg-white
              border
              rounded-2xl
              p-5
            "
            style={{
              borderColor:
                COLORS.border,
            }}
          >

            <div className="flex items-center justify-between">

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
                  className="
                    text-2xl
                    font-bold
                    mt-1
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {categories.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.productCount
                      ),
                    0
                  )}
                </h3>
              </div>

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor:
                    COLORS.primarySoft,
                  color:
                    COLORS.primary,
                }}
              >
                <FiPackage
                  size={20}
                />
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            CATEGORY GRID
        =================================================== */}

        {filteredCategories.length >
        0 ? (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-5
            "
          >
            {filteredCategories.map(
              (category) => (
                <CategoryCard
                  key={
                    category.id
                  }
                  category={
                    category
                  }
                />
              )
            )}
          </div>
        ) : (
          <div
            className="
              bg-white
              border
              rounded-2xl
              py-20
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
            style={{
              borderColor:
                COLORS.border,
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
                color:
                  COLORS.primary,
              }}
            >
              <FiTag
                size={28}
              />
            </div>

            <h3
              className="
                text-lg
                font-bold
                mb-1
              "
              style={{
                color:
                  COLORS.heading,
              }}
            >
              No categories found
            </h3>

            <p
              className="
                text-sm
              "
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Try changing your
              search.
            </p>

          </div>
        )}

      </div>

      {/* =====================================================
          ADD / EDIT CATEGORY MODAL
      ===================================================== */}

      {showModal && (
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
          onClick={closeModal}
        >

          <div
            className="
              bg-white
              w-full
              max-w-lg
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}
            <div
              className="
                px-6
                py-5
                border-b
                flex
                items-center
                justify-between
              "
              style={{
                borderColor:
                  COLORS.border,
              }}
            >

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  {editingCategory
                    ? 'Edit Category'
                    : 'Add Category'}
                </h2>

                <p
                  className="
                    text-sm
                    mt-1
                  "
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  {editingCategory
                    ? 'Update category information'
                    : 'Create a new product category'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                "
              >
                <FiX
                  size={19}
                />
              </button>

            </div>

            {/* FORM */}
            <div className="p-6 space-y-5">

              {/* ICON */}
              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Category Icon
                </label>

                <input
                  type="text"
                  name="icon"
                  value={
                    formData.icon
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="💎"
                  className="
                    w-full
                    border
                    rounded-xl
                    px-4
                    py-3
                    text-xl
                    outline-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-100
                  "
                  style={{
                    borderColor:
                      COLORS.borderDark,
                  }}
                />
              </div>

              {/* NAME */}
              <div>

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Category Name
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Jewellery"
                  className="
                    w-full
                    border
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-100
                  "
                  style={{
                    borderColor:
                      COLORS.borderDark,
                  }}
                />

              </div>

              {/* DESCRIPTION */}
              <div>

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Description
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Enter category description..."
                  className="
                    w-full
                    border
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    outline-none
                    resize-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-100
                  "
                  style={{
                    borderColor:
                      COLORS.borderDark,
                  }}
                />

              </div>

              {/* PRODUCT COUNT + STATUS */}
              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      mb-2
                    "
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Product Count
                  </label>

                  <input
                    type="number"
                    name="productCount"
                    value={
                      formData.productCount
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    className="
                      w-full
                      border
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-purple-500
                      focus:ring-2
                      focus:ring-purple-100
                    "
                    style={{
                      borderColor:
                        COLORS.borderDark,
                    }}
                  />

                </div>

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      mb-2
                    "
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      border
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      outline-none
                      bg-white
                      focus:border-purple-500
                      focus:ring-2
                      focus:ring-purple-100
                    "
                    style={{
                      borderColor:
                        COLORS.borderDark,
                    }}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div
              className="
                px-6
                py-4
                border-t
                flex
                justify-end
                gap-3
              "
              style={{
                borderColor:
                  COLORS.border,
              }}
            >

              <button
                type="button"
                onClick={closeModal}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  text-sm
                  font-semibold
                  hover:bg-gray-50
                "
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
                  handleSaveCategory
                }
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  text-white
                  text-sm
                  font-semibold
                  flex
                  items-center
                  gap-2
                "
                style={{
                  backgroundColor:
                    COLORS.primary,
                }}
              >

                <FiSave
                  size={16}
                />

                {editingCategory
                  ? 'Update Category'
                  : 'Save Category'}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal &&
        categoryToDelete && (
          <div
            className="
              fixed
              inset-0
              z-[60]
              bg-black/50
              flex
              items-center
              justify-center
              p-4
            "
            onClick={() =>
              setShowDeleteModal(
                false
              )
            }
          >

            <div
              className="
                bg-white
                w-full
                max-w-md
                rounded-2xl
                shadow-2xl
                p-6
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="flex items-start gap-4">

                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                  style={{
                    backgroundColor:
                      COLORS.dangerBg,
                    color:
                      COLORS.danger,
                  }}
                >
                  <FiTrash2
                    size={21}
                  />
                </div>

                <div>

                  <h3
                    className="
                      text-lg
                      font-bold
                    "
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Delete Category?
                  </h3>

                  <p
                    className="
                      text-sm
                      leading-6
                      mt-1
                    "
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    Are you sure you want
                    to delete{' '}
                    <strong
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      {
                        categoryToDelete.name
                      }
                    </strong>
                    ? This action cannot
                    be undone.
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-6
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    text-sm
                    font-semibold
                  "
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
                    handleDeleteCategory
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    text-white
                  "
                  style={{
                    backgroundColor:
                      COLORS.danger,
                  }}
                >
                  Delete Category
                </button>

              </div>

            </div>

          </div>
        )}

    </>
  );
};

export default Categories;