import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiMessageCircle, FiBarChart2, FiArrowLeft, FiX } from 'react-icons/fi';

const EcommerceLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for popups
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // New state for login success
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simulate login and token storage
    if (username && password) {
      localStorage.setItem('sellerToken', 'sample-seller-token-12345');
      window.dispatchEvent(new Event('authChange'));
      // Show success popup instead of navigating immediately
      setShowSuccess(true);
    } else {
      alert('Please enter your username and password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col justify-between py-6 px-4 sm:px-8 lg:px-16 relative">
      
      {/* Top Back Navigation */}
      <div className="w-full max-w-7xl mx-auto mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-purple-700 font-semibold transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      {/* Main Grid Container */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-6">
        
        {/* LEFT COLUMN: Hero Copy & Feature Grid */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Run Your Store Smarter
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-xl">
            All the tools you need to manage your e-commerce business from anywhere, anytime.
          </p>

          {/* UI Mockup Placeholder Card */}
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs font-medium text-gray-400">HiCoreSlotify Dashboard Preview</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-lg font-bold text-purple-700">1,240</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                <p className="text-lg font-bold text-purple-700">₹2,45,680</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Customers</p>
                <p className="text-lg font-bold text-purple-700">3,456</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Total Products</p>
                <p className="text-lg font-bold text-purple-700">856</p>
              </div>
            </div>
          </div>

          {/* Feature Grid Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-700 mb-2 shadow-sm">
                <FiBox size={22} />
              </div>
              <span className="text-xs font-semibold text-gray-700">Inventory Management</span>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-700 mb-2 shadow-sm">
                <FiShoppingBag size={22} />
              </div>
              <span className="text-xs font-semibold text-gray-700">Order Processing</span>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-700 mb-2 shadow-sm">
                <FiMessageCircle size={22} />
              </div>
              <span className="text-xs font-semibold text-gray-700">WhatsApp Assistant</span>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-700 mb-2 shadow-sm">
                <FiBarChart2 size={22} />
              </div>
              <span className="text-xs font-semibold text-gray-700">Growth Analytics</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Login Form & Register Box */}
        <div className="lg:col-span-5 w-full flex flex-col gap-6">
          
          {/* Main Login Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Seller!</h2>
              <p className="text-sm text-gray-500">Sign in to manage your orders, products, and grow your store.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer text-sm"
              >
                Login
              </button>
            </form>

          </div>

          {/* Secondary Register Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <h3 className="text-sm font-bold text-gray-900 mb-1">New to HiCoreSlotify?</h3>
            <p className="text-xs text-gray-500 mb-4">Create your store account and start accepting orders online.</p>
            <Link 
              to="/ecommerce-register" 
              className="block w-full py-3 bg-white border border-purple-700 hover:bg-purple-50 text-purple-700 font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Create Store Account
            </Link>
          </div>

          {/* Footer Terms Note */}
          <p className="text-center text-xs text-gray-400">
            By continuing, you agree to HiCoreSlotify's{' '}
            <span 
              className="underline cursor-pointer hover:text-purple-700 transition-colors"
              onClick={() => setShowTerms(true)}
            >
              Terms of Service
            </span>{' '}
            and{' '}
            <span 
              className="underline cursor-pointer hover:text-purple-700 transition-colors"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </span>.
          </p>

        </div>

      </div>

      {/* ================= SUCCESS POPUP MODAL ================= */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-sm w-full text-center shadow-2xl transform transition-all animate-fade-in-up">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Login Successful!
            </h3>
            
            <p className="text-gray-500 mb-8 text-sm md:text-base">
              Welcome back to your store dashboard.
            </p>
            
            <button 
              onClick={() => {
                setShowSuccess(false);
                navigate('/ecommerce-dashboard'); // Updated routing here
              }}
              className="w-full bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-purple-800 transition-colors shadow-sm hover:shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ================= TERMS OF SERVICE MODAL ================= */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h3>
            <div className="text-gray-600 text-sm space-y-4">
              <p>Welcome to HiCoreSlotify. By operating a seller account on our e-commerce platform, you agree to the following terms:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-gray-800">Account Responsibility:</strong> Sellers are responsible for maintaining the accuracy of their inventory, pricing, and business information.</li>
                <li><strong className="text-gray-800">Prohibited Goods:</strong> The listing and sale of illegal, counterfeit, or hazardous materials are strictly prohibited.</li>
                <li><strong className="text-gray-800">Order Fulfillment:</strong> You agree to process and dispatch customer orders within the stated delivery windows and honor standard return policies.</li>
                <li><strong className="text-gray-800">Fees & Payments:</strong> Sellers agree to the transaction fees, platform charges, and payout schedules outlined in the seller agreement.</li>
              </ul>
              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowTerms(false)}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRIVACY POLICY MODAL ================= */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h3>
            <div className="text-gray-600 text-sm space-y-4">
              <p>HiCoreSlotify respects your privacy and is committed to protecting your business data. Here is how we handle your information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-gray-800">Data Collection:</strong> We collect store operational data, transaction history, and metrics strictly to provide and improve our dashboard services.</li>
                <li><strong className="text-gray-800">Customer Privacy:</strong> As a seller, you must handle end-buyer data securely and only use it for order fulfillment and authorized communication.</li>
                <li><strong className="text-gray-800">Third-Party Sharing:</strong> We securely share necessary data with authorized payment gateways and logistics partners to facilitate your sales.</li>
                <li><strong className="text-gray-800">Data Security:</strong> Your financial details, product data, and credentials are encrypted and stored using industry-standard security protocols.</li>
              </ul>
              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EcommerceLogin;