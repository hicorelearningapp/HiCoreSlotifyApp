import React, { useMemo, useState } from 'react';

import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEye,
  FiX,
  FiPhone,
  FiMail,
  FiShoppingBag,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMessageCircle,
  FiMoreHorizontal,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiUserPlus,
  FiTrendingUp,
} from 'react-icons/fi';

const Customers = () => {
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
    pink: '#EC4899',
    pinkBg: '#FDF2F8',
  };

  const [customers] = useState([
    {
      id: 1,
      name: 'Ananya Sharma',
      initials: 'AS',
      avatarBg: '#F3E8FF',
      phone: '+91 98765 43210',
      email: 'ananya.sharma@gmail.com',
      location: 'Chennai, Tamil Nadu',
      type: 'Repeat Customer',
      status: 'Active',
      orders: 8,
      totalSpent: 78500,
      lastOrder: '24 Aug 2026',
      joined: '12 Jan 2026',
      favoriteProduct: 'Diamond Pendant Necklace',
      notes: 'Prefers premium jewellery and new arrivals.',
      orderHistory: [
        { id: 'ORD-1048', product: 'Diamond Pendant Necklace', amount: 24500, date: '24 Aug 2026', status: 'Delivered' },
        { id: 'ORD-1024', product: 'Classic Gold Chain', amount: 28500, date: '14 Jul 2026', status: 'Delivered' },
        { id: 'ORD-987', product: 'Traditional Gold Earrings', amount: 15500, date: '08 Jun 2026', status: 'Delivered' },
      ],
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      initials: 'RK',
      avatarBg: '#EFF6FF',
      phone: '+91 99887 66554',
      email: 'rahul.kumar@gmail.com',
      location: 'Bengaluru, Karnataka',
      type: 'Repeat Customer',
      status: 'Active',
      orders: 5,
      totalSpent: 54200,
      lastOrder: '23 Aug 2026',
      joined: '08 Feb 2026',
      favoriteProduct: 'Classic Gold Chain',
      notes: 'Regular customer. Usually purchases jewellery.',
      orderHistory: [
        { id: 'ORD-1047', product: 'Classic Gold Chain', amount: 28500, date: '23 Aug 2026', status: 'Processing' },
        { id: 'ORD-963', product: 'Gold Bracelet', amount: 15700, date: '19 Jun 2026', status: 'Delivered' },
      ],
    },
    {
      id: 3,
      name: 'Priya Menon',
      initials: 'PM',
      avatarBg: '#FDF2F8',
      phone: '+91 91234 56789',
      email: 'priya.menon@gmail.com',
      location: 'Kochi, Kerala',
      type: 'New Customer',
      status: 'Active',
      orders: 1,
      totalSpent: 12900,
      lastOrder: '22 Aug 2026',
      joined: '20 Aug 2026',
      favoriteProduct: 'Kanchipuram Silk Saree',
      notes: 'Interested in saree and traditional collections.',
      orderHistory: [
        { id: 'ORD-1046', product: 'Kanchipuram Silk Saree', amount: 12900, date: '22 Aug 2026', status: 'Delivered' },
      ],
    },
    {
      id: 4,
      name: 'Vikram Singh',
      initials: 'VS',
      avatarBg: '#ECFDF5',
      phone: '+91 90123 45678',
      email: 'vikram.singh@gmail.com',
      location: 'Hyderabad, Telangana',
      type: 'Repeat Customer',
      status: 'Active',
      orders: 6,
      totalSpent: 63400,
      lastOrder: '21 Aug 2026',
      joined: '04 Mar 2026',
      favoriteProduct: 'Pearl Bracelet',
      notes: 'Frequently purchases gifts.',
      orderHistory: [
        { id: 'ORD-1042', product: 'Pearl Bracelet', amount: 18500, date: '21 Aug 2026', status: 'Delivered' },
        { id: 'ORD-998', product: 'Designer Watch', amount: 22900, date: '10 Jul 2026', status: 'Delivered' },
      ],
    },
    {
      id: 5,
      name: 'Meera Iyer',
      initials: 'MI',
      avatarBg: '#FFF7ED',
      phone: '+91 93456 78901',
      email: 'meera.iyer@gmail.com',
      location: 'Chennai, Tamil Nadu',
      type: 'New Customer',
      status: 'Active',
      orders: 2,
      totalSpent: 18700,
      lastOrder: '20 Aug 2026',
      joined: '15 Aug 2026',
      favoriteProduct: 'Traditional Gold Earrings',
      notes: 'Recently joined customer.',
      orderHistory: [
        { id: 'ORD-1038', product: 'Traditional Gold Earrings', amount: 18700, date: '20 Aug 2026', status: 'Delivered' },
      ],
    },
    {
      id: 6,
      name: 'Arjun Reddy',
      initials: 'AR',
      avatarBg: '#EFF6FF',
      phone: '+91 98712 34567',
      email: 'arjun.reddy@gmail.com',
      location: 'Vijayawada, Andhra Pradesh',
      type: 'Repeat Customer',
      status: 'Active',
      orders: 4,
      totalSpent: 42800,
      lastOrder: '19 Aug 2026',
      joined: '17 Apr 2026',
      favoriteProduct: 'Designer Watch',
      notes: 'Interested in watches and accessories.',
      orderHistory: [
        { id: 'ORD-1039', product: 'Designer Watch', amount: 22800, date: '19 Aug 2026', status: 'Delivered' },
      ],
    },
    {
      id: 7,
      name: 'Sneha Nair',
      initials: 'SN',
      avatarBg: '#F3E8FF',
      phone: '+91 90001 23456',
      email: 'sneha.nair@gmail.com',
      location: 'Coimbatore, Tamil Nadu',
      type: 'Inactive',
      status: 'Inactive',
      orders: 3,
      totalSpent: 24500,
      lastOrder: '02 Jun 2026',
      joined: '21 Feb 2026',
      favoriteProduct: 'Gold Earrings',
      notes: 'No recent activity.',
      orderHistory: [
        { id: 'ORD-876', product: 'Gold Earrings', amount: 9500, date: '02 Jun 2026', status: 'Delivered' },
      ],
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.location.toLowerCase().includes(search);

      let matchesFilter = true;

      if (activeFilter === 'New Customers') {
        matchesFilter = customer.type === 'New Customer';
      }

      if (activeFilter === 'Repeat Customers') {
        matchesFilter = customer.type === 'Repeat Customer';
      }

      if (activeFilter === 'Inactive') {
        matchesFilter = customer.status === 'Inactive';
      }

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchText, activeFilter]);

  const totalCustomers = customers.length;

  const newCustomers = customers.filter(
    (customer) => customer.type === 'New Customer'
  ).length;

  const repeatCustomers = customers.filter(
    (customer) => customer.type === 'Repeat Customer'
  ).length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === 'Active'
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor }) => (
    <div className="bg-white border rounded-2xl p-5 hover:shadow-md transition-all" style={{ borderColor: COLORS.border }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: COLORS.muted }}>{title}</p>
          <h3 className="text-2xl font-bold mt-2" style={{ color: COLORS.heading }}>{value}</h3>
          <p className="text-xs mt-1" style={{ color: COLORS.muted }}>{subtitle}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const isActive = status === 'Active';

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: isActive ? COLORS.successBg : COLORS.redBg, color: isActive ? COLORS.success : COLORS.red }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? COLORS.success : COLORS.red }} />
        {status}
      </span>
    );
  };

  const CustomerTypeBadge = ({ type }) => {
    const isNew = type === 'New Customer';

    return (
      <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ backgroundColor: isNew ? COLORS.blueBg : COLORS.primaryLight, color: isNew ? COLORS.blue : COLORS.primaryDark }}>
        {type}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-full p-5 lg:p-8 pb-12" style={{ backgroundColor: COLORS.background }}>

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
                <FiUsers size={23} />
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: COLORS.heading }}>
                Customers
              </h1>
            </div>

            <p className="text-sm lg:text-base mt-2 lg:ml-[55px]" style={{ color: COLORS.muted }}>
              Manage your customers, orders and customer activity
            </p>
          </div>

          <button type="button" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: COLORS.primary }}>
            <FiPlus size={17} />
            Add Customer
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <StatCard
            title="Total Customers"
            value={totalCustomers}
            subtitle="All customers"
            icon={<FiUsers size={20} />}
            iconBg={COLORS.primaryLight}
            iconColor={COLORS.primary}
          />

          <StatCard
            title="New Customers"
            value={newCustomers}
            subtitle="Recently joined"
            icon={<FiUserPlus size={20} />}
            iconBg={COLORS.blueBg}
            iconColor={COLORS.blue}
          />

          <StatCard
            title="Repeat Customers"
            value={repeatCustomers}
            subtitle="Returning customers"
            icon={<FiTrendingUp size={20} />}
            iconBg={COLORS.successBg}
            iconColor={COLORS.success}
          />

          <StatCard
            title="Customer Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle="Total customer spend"
            icon={<FiShoppingBag size={20} />}
            iconBg={COLORS.orangeBg}
            iconColor={COLORS.orange}
          />

        </div>

        {/* CUSTOMER LIST */}
        <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: COLORS.border }}>

          {/* LIST HEADER */}
          <div className="p-5 border-b" style={{ borderColor: COLORS.border }}>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                  Customer List
                </h2>

                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                  {filteredCustomers.length} customers found
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative w-full xl:w-[320px]">

                <FiSearch size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: COLORS.placeholder }} />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search customer..."
                  className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  style={{ borderColor: COLORS.borderDark }}
                />

              </div>

            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto">

              {['All', 'New Customers', 'Repeat Customers', 'Inactive'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition"
                  style={
                    activeFilter === filter
                      ? { backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark }
                      : { backgroundColor: '#F8FAFC', color: COLORS.muted }
                  }
                >
                  {filter}
                </button>
              ))}

            </div>

          </div>

          {/* TABLE */}
          {filteredCustomers.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="bg-gray-50 border-b" style={{ borderColor: COLORS.border }}>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Customer
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Contact
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Type
                    </th>

                    <th className="text-center px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Orders
                    </th>

                    <th className="text-right px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Total Spent
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Last Order
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Status
                    </th>

                    <th className="text-center px-5 py-3.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map((customer) => (

                    <tr key={customer.id} className="border-b last:border-b-0 hover:bg-gray-50 transition" style={{ borderColor: COLORS.border }}>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: customer.avatarBg, color: COLORS.primaryDark }}>
                            {customer.initials}
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-bold truncate" style={{ color: COLORS.heading }}>
                              {customer.name}
                            </p>

                            <p className="text-[11px] mt-0.5" style={{ color: COLORS.muted }}>
                              ID: CUST-{String(customer.id).padStart(4, '0')}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CONTACT */}
                      <td className="px-5 py-4">

                        <div>

                          <div className="flex items-center gap-1.5">

                            <FiPhone size={12} style={{ color: COLORS.muted }} />

                            <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                              {customer.phone}
                            </span>

                          </div>

                          <div className="flex items-center gap-1.5 mt-1">

                            <FiMail size={12} style={{ color: COLORS.muted }} />

                            <span className="text-[11px] truncate max-w-[180px]" style={{ color: COLORS.muted }}>
                              {customer.email}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* TYPE */}
                      <td className="px-5 py-4">
                        <CustomerTypeBadge type={customer.type} />
                      </td>

                      {/* ORDERS */}
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold" style={{ color: COLORS.heading }}>
                          {customer.orders}
                        </span>
                      </td>

                      {/* SPENT */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold" style={{ color: COLORS.heading }}>
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </td>

                      {/* LAST ORDER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-1.5">

                          <FiCalendar size={13} style={{ color: COLORS.muted }} />

                          <span className="text-xs" style={{ color: COLORS.text }}>
                            {customer.lastOrder}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <StatusBadge status={customer.status} />
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-1">

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-purple-50"
                            style={{ color: COLORS.primary }}
                            title="View Customer"
                          >
                            <FiEye size={17} />
                          </button>

                          <button
                            type="button"
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                            style={{ color: COLORS.muted }}
                            title="More"
                          >
                            <FiMoreHorizontal size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            /* EMPTY STATE */
            <div className="py-20 text-center">

              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
                <FiUsers size={28} />
              </div>

              <h3 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                No customers found
              </h3>

              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Try changing your search or filter.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (

        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomer(null)}
        >

          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: selectedCustomer.avatarBg, color: COLORS.primaryDark }}>
                  {selectedCustomer.initials}
                </div>

                <div>

                  <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                    {selectedCustomer.name}
                  </h2>

                  <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                    Customer ID: CUST-{String(selectedCustomer.id).padStart(4, '0')}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{ color: COLORS.muted }}
              >
                <FiX size={19} />
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* CUSTOMER SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

                {/* CONTACT */}
                <div className="border rounded-xl p-4" style={{ borderColor: COLORS.border }}>

                  <div className="flex items-center gap-2 mb-3">

                    <FiUser size={16} style={{ color: COLORS.primary }} />

                    <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>
                      Contact
                    </h3>

                  </div>

                  <div className="flex items-center gap-2 mb-2">

                    <FiPhone size={13} style={{ color: COLORS.muted }} />

                    <span className="text-xs" style={{ color: COLORS.text }}>
                      {selectedCustomer.phone}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <FiMail size={13} style={{ color: COLORS.muted }} />

                    <span className="text-xs truncate" style={{ color: COLORS.text }}>
                      {selectedCustomer.email}
                    </span>

                  </div>

                </div>

                {/* LOCATION */}
                <div className="border rounded-xl p-4" style={{ borderColor: COLORS.border }}>

                  <div className="flex items-center gap-2 mb-3">

                    <FiMapPin size={16} style={{ color: COLORS.primary }} />

                    <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>
                      Location
                    </h3>

                  </div>

                  <p className="text-xs" style={{ color: COLORS.text }}>
                    {selectedCustomer.location}
                  </p>

                  <p className="text-[11px] mt-2" style={{ color: COLORS.muted }}>
                    Joined {selectedCustomer.joined}
                  </p>

                </div>

                {/* CUSTOMER STATS */}
                <div className="border rounded-xl p-4" style={{ borderColor: COLORS.border }}>

                  <div className="flex items-center justify-between mb-3">

                    <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>
                      Customer Value
                    </h3>

                    <StatusBadge status={selectedCustomer.status} />

                  </div>

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-lg font-bold" style={{ color: COLORS.heading }}>
                        {selectedCustomer.orders}
                      </p>

                      <p className="text-[10px]" style={{ color: COLORS.muted }}>
                        Orders
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-lg font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </p>

                      <p className="text-[10px]" style={{ color: COLORS.muted }}>
                        Total Spent
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* QUICK ACTIONS */}
              <div className="flex flex-wrap gap-2 mb-5">

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <FiMessageCircle size={14} />
                  WhatsApp
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
                >
                  <FiPhone size={14} />
                  Call
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: COLORS.borderDark, color: COLORS.text }}
                >
                  <FiMail size={14} />
                  Email
                </button>

              </div>

              {/* FAVORITE PRODUCT */}
              <div className="p-4 rounded-xl mb-5" style={{ backgroundColor: COLORS.primarySoft }}>

                <div className="flex items-center gap-2 mb-2">

                  <FiShoppingBag size={15} style={{ color: COLORS.primary }} />

                  <p className="text-xs font-bold" style={{ color: COLORS.heading }}>
                    Favorite Product
                  </p>

                </div>

                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  {selectedCustomer.favoriteProduct}
                </p>

                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                  {selectedCustomer.notes}
                </p>

              </div>

              {/* ORDER HISTORY */}
              <div>

                <div className="flex items-center justify-between mb-3">

                  <div>

                    <h3 className="text-lg font-bold" style={{ color: COLORS.heading }}>
                      Order History
                    </h3>

                    <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                      Recent orders from this customer
                    </p>

                  </div>

                  <button
                    type="button"
                    className="text-xs font-semibold"
                    style={{ color: COLORS.primary }}
                  >
                    View All
                  </button>

                </div>

                <div className="border rounded-xl overflow-hidden" style={{ borderColor: COLORS.border }}>

                  {selectedCustomer.orderHistory.map((order) => (

                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b last:border-b-0"
                      style={{ borderColor: COLORS.border }}
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
                          <FiShoppingBag size={16} />
                        </div>

                        <div>

                          <p className="text-xs font-bold" style={{ color: COLORS.heading }}>
                            {order.id}
                          </p>

                          <p className="text-xs mt-1" style={{ color: COLORS.text }}>
                            {order.product}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-5">

                        <div>

                          <p className="text-xs" style={{ color: COLORS.muted }}>
                            Date
                          </p>

                          <p className="text-xs font-semibold mt-1" style={{ color: COLORS.text }}>
                            {order.date}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs" style={{ color: COLORS.muted }}>
                            Amount
                          </p>

                          <p className="text-xs font-bold mt-1" style={{ color: COLORS.heading }}>
                            {formatCurrency(order.amount)}
                          </p>

                        </div>

                        <span
                          className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: order.status === 'Delivered' ? COLORS.successBg : COLORS.orangeBg,
                            color: order.status === 'Delivered' ? COLORS.success : COLORS.orange,
                          }}
                        >
                          {order.status}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Customers;