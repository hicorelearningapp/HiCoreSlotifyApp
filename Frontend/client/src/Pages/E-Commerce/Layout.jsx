import React, { useState } from 'react';

import {
  FiGrid,
  FiInbox,
  FiBox,
  FiShoppingBag,
  FiInstagram,
  FiMessageCircle,
  FiUsers,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiChevronDown,
  FiMenu,
  FiHelpCircle,
  FiBell,
  FiChevronUp,
} from 'react-icons/fi';

import { BiStore } from 'react-icons/bi';

import AddProduct from './AddProduct';
import AllProducts from './AllProducts';
import Categories from './Categories';
import Inventory from './Inventory';
import EcomDashboard from './EcomDashboard';
import Inbox from './Inbox';
import Orders from './Orders';
import Instragram from './Instragram';
import Whatsapp from './Whatsapp';
import Customers from './Customers';
import Reports from './Reports';
// import Payments from './Payments';
// import Settings from './Settings';
// import ContactSupport from './ContactSupport';


// =========================================================
// FALLBACK
// =========================================================

const ComingSoon = ({ pageName }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 w-full min-h-[500px]">

    <h2 className="text-3xl font-bold text-gray-800 mb-3">
      {pageName}
    </h2>

    <p className="text-lg">
      This page is coming soon.
    </p>

  </div>
);


// =========================================================
// LAYOUT
// =========================================================

const Layout = () => {

  const [isProductsOpen, setIsProductsOpen] = useState(true);

  const [activePage, setActivePage] = useState('Add Product');


  // =======================================================
  // RENDER PAGE
  // =======================================================

  const renderContent = () => {

    if (activePage === 'Dashboard') {
      return (
        <EcomDashboard
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Inbox') {
      return (
        <Inbox
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Orders') {
      return (
        <Orders
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'All Products') {
      return (
        <AllProducts
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Add Product') {
      return (
        <AddProduct
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Categories') {
      return (
        <Categories
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Inventory') {
      return (
        <Inventory
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Instagram') {
      return (
        <Instragram
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'WhatsApp') {
      return (
        <Whatsapp
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Customers') {
      return (
        <Customers
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === 'Reports') {
      return (
        <Reports
          setActivePage={setActivePage}
        />
      );
    }

    // if (activePage === 'Payments') {
    //   return (
    //     <Payments
    //       setActivePage={setActivePage}
    //     />
    //   );
    // }

    // if (activePage === 'Settings') {
    //   return (
    //     <Settings
    //       setActivePage={setActivePage}
    //     />
    //   );
    // }

    // // =====================================================
    // // CONTACT SUPPORT
    // // =====================================================

    // if (activePage === 'Contact Support') {
    //   return (
    //     <ContactSupport
    //       setActivePage={setActivePage}
    //     />
    //   );
    // }

    return (
      <ComingSoon
        pageName={activePage}
      />
    );
  };


  return (
    <div className="
      flex
      h-screen
      bg-[#F8F9FA]
      font-sans
      text-gray-800
      overflow-hidden
    ">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="
        w-[260px]
        bg-white
        border-r
        border-gray-200
        flex
        flex-col
        h-full
        flex-shrink-0
      ">


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="
          flex
          items-center
          gap-3
          px-6
          py-5
          flex-shrink-0
        ">

          <div className="
            bg-purple-100
            p-2
            rounded-lg
            text-purple-700
          ">
            <FiShoppingBag size={24} />
          </div>

          <span className="
            text-2xl
            font-bold
            text-gray-900
            tracking-tight
          ">
            Slotify
          </span>

        </div>


        {/* =================================================
            STORE
        ================================================= */}

        <div className="
          px-4
          mb-4
          flex-shrink-0
        ">

          <div className="
            flex
            items-center
            justify-between
            bg-white
            border
            border-gray-200
            rounded-xl
            p-3
            cursor-pointer
            hover:bg-gray-50
            transition-colors
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                bg-gray-100
                p-2
                rounded-md
              ">

                <BiStore
                  size={20}
                  className="text-gray-600"
                />

              </div>

              <div className="
                flex
                flex-col
              ">

                <span className="
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  HiCore
                </span>

                <span className="
                  text-xs
                  text-gray-500
                ">
                  ID: HC-10001
                </span>

              </div>

            </div>

            <FiChevronDown
              className="text-gray-400"
            />

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="
          flex-1
          overflow-y-auto
          px-4
          pb-4
          space-y-1
          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        ">


          {/* DASHBOARD */}

          <NavItem
            icon={<FiGrid />}
            label="Dashboard"
            active={
              activePage === 'Dashboard'
            }
            onClick={() =>
              setActivePage('Dashboard')
            }
          />


          {/* INBOX */}

          <NavItem
            icon={<FiInbox />}
            label="Inbox"
            active={
              activePage === 'Inbox'
            }
            onClick={() =>
              setActivePage('Inbox')
            }
          />


          {/* ORDERS */}

          <NavItem
            icon={<FiBox />}
            label="Orders"
            active={
              activePage === 'Orders'
            }
            onClick={() =>
              setActivePage('Orders')
            }
          />


          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div>

            <div
              className={`
                flex
                items-center
                justify-between
                px-3
                py-2.5
                rounded-lg
                cursor-pointer
                transition-colors
                ${
                  isProductsOpen ||
                  activePage === 'All Products' ||
                  activePage === 'Add Product' ||
                  activePage === 'Categories' ||
                  activePage === 'Inventory'
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() =>
                setIsProductsOpen(
                  !isProductsOpen
                )
              }
            >

              <div className="
                flex
                items-center
                gap-3
              ">

                <FiShoppingBag size={18} />

                <span className="
                  font-medium
                  text-sm
                ">
                  Products
                </span>

              </div>

              {isProductsOpen ? (
                <FiChevronUp size={16} />
              ) : (
                <FiChevronDown size={16} />
              )}

            </div>


            {isProductsOpen && (
              <div className="
                ml-9
                mt-1
                space-y-1
              ">

                <SubNavItem
                  label="All Products"
                  active={
                    activePage === 'All Products'
                  }
                  onClick={() =>
                    setActivePage(
                      'All Products'
                    )
                  }
                />

                <SubNavItem
                  label="Add Product"
                  active={
                    activePage === 'Add Product'
                  }
                  onClick={() =>
                    setActivePage(
                      'Add Product'
                    )
                  }
                />

                <SubNavItem
                  label="Categories"
                  active={
                    activePage === 'Categories'
                  }
                  onClick={() =>
                    setActivePage(
                      'Categories'
                    )
                  }
                />

                <SubNavItem
                  label="Inventory"
                  active={
                    activePage === 'Inventory'
                  }
                  onClick={() =>
                    setActivePage(
                      'Inventory'
                    )
                  }
                />

              </div>
            )}

          </div>


          {/* INSTAGRAM */}

          <NavItem
            icon={<FiInstagram />}
            label="Instagram"
            active={
              activePage === 'Instagram'
            }
            onClick={() =>
              setActivePage(
                'Instagram'
              )
            }
          />


          {/* WHATSAPP */}

          <NavItem
            icon={<FiMessageCircle />}
            label="WhatsApp"
            active={
              activePage === 'WhatsApp'
            }
            onClick={() =>
              setActivePage(
                'WhatsApp'
              )
            }
          />


          {/* CUSTOMERS */}

          <NavItem
            icon={<FiUsers />}
            label="Customers"
            active={
              activePage === 'Customers'
            }
            onClick={() =>
              setActivePage(
                'Customers'
              )
            }
          />


          {/* REPORTS */}

          <NavItem
            icon={<FiBarChart2 />}
            label="Reports"
            active={
              activePage === 'Reports'
            }
            onClick={() =>
              setActivePage(
                'Reports'
              )
            }
          />


          {/* PAYMENTS */}

          <NavItem
            icon={<FiCreditCard />}
            label="Payments"
            active={
              activePage === 'Payments'
            }
            onClick={() =>
              setActivePage(
                'Payments'
              )
            }
          />


          {/* SETTINGS */}

          <NavItem
            icon={<FiSettings />}
            label="Settings"
            active={
              activePage === 'Settings'
            }
            onClick={() =>
              setActivePage(
                'Settings'
              )
            }
          />

        </nav>


        {/* =================================================
            SUPPORT
        ================================================= */}

        <div className="
          p-4
          mt-auto
          flex-shrink-0
          border-t
          border-gray-100
        ">

          <div className="
            bg-[#F8F7FF]
            rounded-2xl
            p-4
            flex
            flex-col
            items-center
            text-center
          ">

            <div className="
              w-12
              h-12
              bg-purple-200
              rounded-full
              mb-3
              flex
              items-center
              justify-center
              text-purple-700
            ">

              <FiHelpCircle size={24} />

            </div>


            <h4 className="
              text-sm
              font-bold
              text-gray-900
              mb-1
            ">
              Need Help?
            </h4>


            <p className="
              text-xs
              text-gray-500
              mb-4
            ">
              Chat with our support team
            </p>


            {/* =================================================
                CONTACT SUPPORT BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setActivePage(
                  'Contact Support'
                )
              }
              className="
                w-full
                py-2
                bg-white
                border
                border-gray-200
                rounded-lg
                text-sm
                font-semibold
                text-gray-700
                hover:bg-gray-50
                hover:border-purple-200
                hover:text-purple-700
                transition-colors
              "
            >
              Contact Support
            </button>

          </div>

        </div>

      </aside>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="
        flex-1
        flex
        flex-col
        min-w-0
        overflow-hidden
      ">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="
          h-16
          bg-white
          border-b
          border-gray-200
          flex
          items-center
          justify-between
          px-6
          flex-shrink-0
          z-10
        ">


          <div className="
            flex
            items-center
          ">

            <button
              type="button"
              className="
                p-2
                -ml-2
                text-gray-500
                hover:bg-gray-100
                rounded-lg
                lg:hidden
              "
            >
              <FiMenu size={20} />
            </button>


            <FiMenu
              size={20}
              className="
                text-gray-500
                hidden
                lg:block
                cursor-pointer
                hover:text-gray-700
              "
            />

          </div>


          <div className="
            flex
            items-center
            gap-5
          ">


            {/* HELP */}

            <FiHelpCircle
              size={20}
              className="
                text-gray-500
                cursor-pointer
                hover:text-gray-700
              "
              onClick={() =>
                setActivePage(
                  'Contact Support'
                )
              }
            />


            {/* NOTIFICATION */}

            <FiBell
              size={20}
              className="
                text-gray-500
                cursor-pointer
                hover:text-gray-700
              "
            />


            {/* PROFILE */}

            <div className="
              flex
              items-center
              gap-3
              pl-4
              border-l
              border-gray-200
              cursor-pointer
            ">

              <div className="
                w-8
                h-8
                rounded-full
                bg-gray-200
                flex
                items-center
                justify-center
                text-sm
                font-bold
                text-gray-600
              ">
                HC
              </div>


              <div className="
                hidden
                md:flex
                flex-col
              ">

                <span className="
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  HiCore
                </span>

                <span className="
                  text-xs
                  text-gray-500
                ">
                  Seller
                </span>

              </div>


              <FiChevronDown
                className="text-gray-400"
              />

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="
          flex-1
          overflow-y-auto
          relative
        ">

          {renderContent()}

        </main>

      </div>

    </div>
  );
};


// =========================================================
// NAV ITEM
// =========================================================

const NavItem = ({
  icon,
  label,
  active,
  onClick,
}) => (

  <div
    onClick={onClick}
    className={`
      flex
      items-center
      gap-3
      px-3
      py-2.5
      rounded-lg
      cursor-pointer
      transition-colors
      ${
        active
          ? 'bg-purple-50 text-purple-700'
          : 'text-gray-600 hover:bg-gray-50'
      }
    `}
  >

    <div className="text-lg">
      {icon}
    </div>

    <span className="
      font-medium
      text-sm
    ">
      {label}
    </span>

  </div>
);


// =========================================================
// SUB NAV
// =========================================================

const SubNavItem = ({
  label,
  active,
  onClick,
}) => (

  <div
    onClick={onClick}
    className="
      flex
      items-center
      gap-2
      py-2
      px-3
      rounded-lg
      cursor-pointer
      transition-colors
      group
    "
  >

    <div
      className={`
        w-1.5
        h-1.5
        rounded-full
        ${
          active
            ? 'bg-purple-600'
            : 'bg-transparent group-hover:bg-gray-300'
        }
      `}
    />


    <span
      className={`
        text-sm
        ${
          active
            ? 'text-purple-700 font-semibold bg-purple-50 px-2 py-1.5 rounded-md w-full'
            : 'text-gray-500 hover:text-gray-800'
        }
      `}
    >
      {label}
    </span>

  </div>
);


export default Layout;