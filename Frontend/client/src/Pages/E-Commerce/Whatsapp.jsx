import React, { useMemo, useState } from 'react';

import {
  FiMessageCircle,
  FiSearch,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
  FiPaperclip,
  FiSmile,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiPackage,
  FiUser,
  FiX,
  FiChevronDown,
  FiExternalLink,
} from 'react-icons/fi';

const Whatsapp = () => {
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

    whatsapp: '#25D366',
    whatsappBg: '#ECFDF3',

    blue: '#2563EB',
    blueBg: '#EFF6FF',

    orange: '#F59E0B',
    orangeBg: '#FFFBEB',

    red: '#DC2626',
    redBg: '#FEF2F2',
  };

  // =========================================================
  // CONVERSATIONS DATA
  // =========================================================

  const [conversations, setConversations] = useState([
    {
      id: 1,
      customer: 'Ananya Sharma',
      phone: '+91 98765 43210',
      avatar: 'AS',
      avatarBg: '#F3E8FF',

      lastMessage:
        'Is the Diamond Pendant Necklace available?',
      time: '09:42 AM',

      unread: 2,
      category: 'Product Enquiry',

      product: 'Diamond Pendant Necklace',
      sku: 'JWL-DP-002',

      orderId: null,

      online: true,

      messages: [
        {
          id: 1,
          from: 'customer',
          text:
            'Hi, I saw your Diamond Pendant Necklace on Instagram.',
          time: '09:35 AM',
        },
        {
          id: 2,
          from: 'customer',
          text:
            'Is it available right now?',
          time: '09:37 AM',
        },
        {
          id: 3,
          from: 'seller',
          text:
            'Hi Ananya! Yes, it is currently available.',
          time: '09:39 AM',
        },
        {
          id: 4,
          from: 'customer',
          text:
            'Is the Diamond Pendant Necklace available?',
          time: '09:42 AM',
        },
      ],
    },

    {
      id: 2,
      customer: 'Rahul Kumar',
      phone: '+91 99887 66554',
      avatar: 'RK',
      avatarBg: '#EFF6FF',

      lastMessage:
        'Thank you. I will confirm the order.',
      time: '09:15 AM',

      unread: 0,
      category: 'Order',

      product: 'Classic Gold Chain',
      sku: 'JWL-GC-001',

      orderId: 'ORD-1048',

      online: false,

      messages: [
        {
          id: 1,
          from: 'customer',
          text:
            'I want to order the Classic Gold Chain.',
          time: '08:50 AM',
        },
        {
          id: 2,
          from: 'seller',
          text:
            'Sure Rahul. The price is ₹28,500.',
          time: '08:53 AM',
        },
        {
          id: 3,
          from: 'customer',
          text:
            'Thank you. I will confirm the order.',
          time: '09:15 AM',
        },
      ],
    },

    {
      id: 3,
      customer: 'Priya Menon',
      phone: '+91 91234 56789',
      avatar: 'PM',
      avatarBg: '#FDF2F8',

      lastMessage:
        'Can you show me the latest saree collection?',
      time: 'Yesterday',

      unread: 4,
      category: 'Product Enquiry',

      product: 'Kanchipuram Silk Saree',
      sku: 'SAR-KS-001',

      orderId: null,

      online: true,

      messages: [
        {
          id: 1,
          from: 'customer',
          text:
            'Hello, I am looking for a Kanchipuram silk saree.',
          time: 'Yesterday',
        },
        {
          id: 2,
          from: 'customer',
          text:
            'Can you show me the latest saree collection?',
          time: 'Yesterday',
        },
      ],
    },

    {
      id: 4,
      customer: 'Vikram Singh',
      phone: '+91 90123 45678',
      avatar: 'VS',
      avatarBg: '#ECFDF5',

      lastMessage:
        'My order has been delivered. Thank you!',
      time: 'Yesterday',

      unread: 0,
      category: 'Order',

      product: 'Pearl Bracelet',
      sku: 'JWL-PB-004',

      orderId: 'ORD-1042',

      online: false,

      messages: [
        {
          id: 1,
          from: 'seller',
          text:
            'Hi Vikram, your order has been delivered.',
          time: 'Yesterday',
        },
        {
          id: 2,
          from: 'customer',
          text:
            'My order has been delivered. Thank you!',
          time: 'Yesterday',
        },
      ],
    },

    {
      id: 5,
      customer: 'Meera Iyer',
      phone: '+91 93456 78901',
      avatar: 'MI',
      avatarBg: '#FFF7ED',

      lastMessage:
        'What is the delivery time for Chennai?',
      time: 'Monday',

      unread: 1,
      category: 'General',

      product: null,
      sku: null,

      orderId: null,

      online: false,

      messages: [
        {
          id: 1,
          from: 'customer',
          text:
            'What is the delivery time for Chennai?',
          time: 'Monday',
        },
      ],
    },

    {
      id: 6,
      customer: 'Arjun Reddy',
      phone: '+91 98712 34567',
      avatar: 'AR',
      avatarBg: '#EFF6FF',

      lastMessage:
        'Please send the payment details.',
      time: 'Monday',

      unread: 0,
      category: 'Order',

      product: 'Designer Watch',
      sku: 'ACC-WT-001',

      orderId: 'ORD-1039',

      online: true,

      messages: [
        {
          id: 1,
          from: 'customer',
          text:
            'I would like to buy the Designer Watch.',
          time: 'Monday',
        },
        {
          id: 2,
          from: 'customer',
          text:
            'Please send the payment details.',
          time: 'Monday',
        },
      ],
    },
  ]);

  // =========================================================
  // STATE
  // =========================================================

  const [selectedConversationId, setSelectedConversationId] =
    useState(1);

  const [searchText, setSearchText] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState('All');

  const [messageText, setMessageText] =
    useState('');

  // =========================================================
  // SELECTED CONVERSATION
  // =========================================================

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    );

  // =========================================================
  // FILTER CONVERSATIONS
  // =========================================================

  const filteredConversations = useMemo(() => {
    const search =
      searchText
        .toLowerCase()
        .trim();

    return conversations.filter(
      (conversation) => {
        const matchesSearch =
          !search ||
          conversation.customer
            .toLowerCase()
            .includes(search) ||
          conversation.phone
            .toLowerCase()
            .includes(search) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(search) ||
          (
            conversation.product || ''
          )
            .toLowerCase()
            .includes(search);

        let matchesFilter = true;

        if (activeFilter === 'Unread') {
          matchesFilter =
            conversation.unread > 0;
        }

        if (activeFilter === 'Orders') {
          matchesFilter =
            conversation.category ===
            'Order';
        }

        if (
          activeFilter ===
          'Product Enquiries'
        ) {
          matchesFilter =
            conversation.category ===
            'Product Enquiry';
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    conversations,
    searchText,
    activeFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const totalUnread =
    conversations.reduce(
      (sum, conversation) =>
        sum + conversation.unread,
      0
    );

  const totalOrders =
    conversations.filter(
      (conversation) =>
        conversation.category ===
        'Order'
    ).length;

  const totalProductEnquiries =
    conversations.filter(
      (conversation) =>
        conversation.category ===
        'Product Enquiry'
    ).length;

  // =========================================================
  // SELECT CONVERSATION
  // =========================================================

  const handleSelectConversation = (
    conversation
  ) => {
    setSelectedConversationId(
      conversation.id
    );

    // Mark as read
    setConversations(
      (currentConversations) =>
        currentConversations.map(
          (item) =>
            item.id ===
            conversation.id
              ? {
                  ...item,
                  unread: 0,
                }
              : item
        )
    );
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = () => {
    const message =
      messageText.trim();

    if (!message || !selectedConversation) {
      return;
    }

    const newMessage = {
      id:
        Date.now(),
      from: 'seller',
      text: message,
      time: 'Just now',
    };

    setConversations(
      (currentConversations) =>
        currentConversations.map(
          (conversation) =>
            conversation.id ===
            selectedConversation.id
              ? {
                  ...conversation,
                  lastMessage:
                    message,
                  time: 'Just now',
                  messages: [
                    ...conversation.messages,
                    newMessage,
                  ],
                }
              : conversation
        )
    );

    setMessageText('');
  };

  // =========================================================
  // HANDLE ENTER
  // =========================================================

  const handleKeyDown = (e) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSendMessage();
    }
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
                iconBg,
              color:
                iconColor,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div
      className="min-h-full p-5 lg:p-8 pb-10"
      style={{
        backgroundColor:
          COLORS.background,
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
                  COLORS.whatsappBg,
                color:
                  COLORS.whatsapp,
              }}
            >
              <FiMessageCircle
                size={24}
              />
            </div>

            <h1
              className="text-3xl lg:text-4xl font-bold tracking-tight"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              WhatsApp
            </h1>
          </div>

          <p
            className="text-sm lg:text-base mt-2 lg:ml-[55px]"
            style={{
              color:
                COLORS.muted,
            }}
          >
            Manage customer conversations
            and WhatsApp orders
          </p>
        </div>

        {/* CONNECTION */}

        <div
          className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            borderColor:
              COLORS.border,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor:
                COLORS.whatsappBg,
              color:
                COLORS.whatsapp,
            }}
          >
            <FiMessageCircle
              size={20}
            />
          </div>

          <div>
            <div
              className="flex items-center gap-2"
            >
              <p
                className="text-sm font-bold"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                +91 98765 00000
              </p>

              <FiCheckCircle
                size={14}
                style={{
                  color:
                    COLORS.success,
                }}
              />
            </div>

            <p
              className="text-xs mt-0.5"
              style={{
                color:
                  COLORS.success,
              }}
            >
              ● Connected
            </p>
          </div>

          <button
            type="button"
            className="ml-2 px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-gray-50"
            style={{
              borderColor:
                COLORS.borderDark,
              color:
                COLORS.text,
            }}
          >
            Manage
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          title="Total Conversations"
          value={conversations.length}
          subtitle="Active conversations"
          icon={
            <FiMessageCircle
              size={20}
            />
          }
          iconBg={
            COLORS.primaryLight
          }
          iconColor={
            COLORS.primary
          }
        />

        <StatCard
          title="Unread Messages"
          value={totalUnread}
          subtitle="Need your attention"
          icon={
            <FiMessageCircle
              size={20}
            />
          }
          iconBg={
            COLORS.orangeBg
          }
          iconColor={
            COLORS.orange
          }
        />

        <StatCard
          title="Order Chats"
          value={totalOrders}
          subtitle="Customer orders"
          icon={
            <FiPackage
              size={20}
            />
          }
          iconBg={
            COLORS.blueBg
          }
          iconColor={
            COLORS.blue
          }
        />

        <StatCard
          title="Product Enquiries"
          value={totalProductEnquiries}
          subtitle="Product questions"
          icon={
            <FiShoppingBag
              size={20}
            />
          }
          iconBg={
            COLORS.whatsappBg
          }
          iconColor={
            COLORS.whatsapp
          }
        />
      </div>

      {/* =====================================================
          MAIN WHATSAPP PANEL
      ===================================================== */}

      <div
        className="bg-white border rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px]"
        style={{
          borderColor:
            COLORS.border,
        }}
      >
        {/* ===================================================
            LEFT CONVERSATION LIST
        =================================================== */}

        <div
          className="w-full lg:w-[380px] xl:w-[410px] border-r flex flex-col flex-shrink-0"
          style={{
            borderColor:
              COLORS.border,
          }}
        >
          {/* LIST HEADER */}

          <div
            className="p-4 border-b"
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <div
              className="flex items-center justify-between mb-4"
            >
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  Conversations
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  {conversations.length}{' '}
                  conversations
                </p>
              </div>

              <button
                type="button"
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                <FiMoreVertical
                  size={18}
                />
              </button>
            </div>

            {/* SEARCH */}

            <div className="relative">
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
                placeholder="Search conversations..."
                className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                style={{
                  borderColor:
                    COLORS.borderDark,
                }}
              />
            </div>

            {/* FILTERS */}

            <div
              className="flex gap-1.5 mt-3 overflow-x-auto"
            >
              {[
                'All',
                'Unread',
                'Orders',
                'Product Enquiries',
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
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

          {/* CONVERSATION ITEMS */}

          <div
            className="flex-1 overflow-y-auto"
          >
            {filteredConversations.length >
            0 ? (
              filteredConversations.map(
                (conversation) => {
                  const isSelected =
                    conversation.id ===
                    selectedConversationId;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectConversation(
                          conversation
                        )
                      }
                      className="w-full text-left px-4 py-4 border-b transition-colors"
                      style={{
                        borderColor:
                          COLORS.border,

                        backgroundColor:
                          isSelected
                            ? COLORS.primarySoft
                            : '#FFFFFF',
                      }}
                    >
                      <div
                        className="flex items-start gap-3"
                      >
                        {/* AVATAR */}

                        <div
                          className="relative flex-shrink-0"
                        >
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor:
                                conversation.avatarBg,
                              color:
                                COLORS.primaryDark,
                            }}
                          >
                            {
                              conversation.avatar
                            }
                          </div>

                          {conversation.online && (
                            <span
                              className="absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-white"
                              style={{
                                backgroundColor:
                                  COLORS.success,
                              }}
                            />
                          )}
                        </div>

                        {/* DETAILS */}

                        <div
                          className="min-w-0 flex-1"
                        >
                          <div
                            className="flex items-start justify-between gap-2"
                          >
                            <p
                              className="text-sm font-bold truncate"
                              style={{
                                color:
                                  COLORS.heading,
                              }}
                            >
                              {
                                conversation.customer
                              }
                            </p>

                            <span
                              className="text-[10px] flex-shrink-0"
                              style={{
                                color:
                                  COLORS.muted,
                              }}
                            >
                              {
                                conversation.time
                              }
                            </span>
                          </div>

                          <p
                            className="text-xs mt-1 truncate"
                            style={{
                              color:
                                COLORS.muted,
                            }}
                          >
                            {
                              conversation.lastMessage
                            }
                          </p>

                          <div
                            className="flex items-center justify-between gap-2 mt-2"
                          >
                            <span
                              className="text-[10px] font-semibold px-2 py-1 rounded-md"
                              style={{
                                backgroundColor:
                                  conversation.category ===
                                  'Order'
                                    ? COLORS.blueBg
                                    : conversation.category ===
                                      'Product Enquiry'
                                    ? COLORS.primaryLight
                                    : '#F1F5F9',

                                color:
                                  conversation.category ===
                                  'Order'
                                    ? COLORS.blue
                                    : conversation.category ===
                                      'Product Enquiry'
                                    ? COLORS.primaryDark
                                    : COLORS.muted,
                              }}
                            >
                              {
                                conversation.category
                              }
                            </span>

                            {conversation.unread >
                              0 && (
                              <span
                                className="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor:
                                    COLORS.primary,
                                }}
                              >
                                {
                                  conversation.unread
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            ) : (
              <div
                className="p-10 text-center"
              >
                <FiMessageCircle
                  size={28}
                  className="mx-auto mb-3"
                  style={{
                    color:
                      COLORS.placeholder,
                  }}
                />

                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      COLORS.heading,
                  }}
                >
                  No conversations
                </p>

                <p
                  className="text-xs mt-1"
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

        {/* ===================================================
            RIGHT CHAT WINDOW
        =================================================== */}

        {selectedConversation ? (
          <div
            className="flex-1 min-w-0 flex flex-col bg-white"
          >
            {/* CHAT HEADER */}

            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{
                borderColor:
                  COLORS.border,
              }}
            >
              <div
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor:
                        selectedConversation.avatarBg,
                      color:
                        COLORS.primaryDark,
                    }}
                  >
                    {
                      selectedConversation.avatar
                    }
                  </div>

                  {selectedConversation.online && (
                    <span
                      className="absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-white"
                      style={{
                        backgroundColor:
                          COLORS.success,
                      }}
                    />
                  )}
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
                      selectedConversation.customer
                    }
                  </h3>

                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color:
                        selectedConversation.online
                          ? COLORS.success
                          : COLORS.muted,
                    }}
                  >
                    {selectedConversation.online
                      ? 'Online'
                      : selectedConversation.phone}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="flex items-center gap-1"
              >
                <button
                  type="button"
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  <FiPhone
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  <FiVideo
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  <FiMoreVertical
                    size={18}
                  />
                </button>
              </div>
            </div>

            {/* CHAT AREA */}

            <div
              className="flex-1 overflow-y-auto p-5"
              style={{
                backgroundColor:
                  '#FAFAFA',
              }}
            >
              {/* DATE LABEL */}

              <div
                className="flex justify-center mb-5"
              >
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white border"
                  style={{
                    borderColor:
                      COLORS.border,
                    color:
                      COLORS.muted,
                  }}
                >
                  Today
                </span>
              </div>

              {/* MESSAGES */}

              <div
                className="max-w-3xl mx-auto space-y-3"
              >
                {selectedConversation.messages.map(
                  (message) => {
                    const isSeller =
                      message.from ===
                      'seller';

                    return (
                      <div
                        key={message.id}
                        className={`
                          flex
                          ${
                            isSeller
                              ? 'justify-end'
                              : 'justify-start'
                          }
                        `}
                      >
                        <div
                          className={`
                            max-w-[75%]
                            px-4
                            py-3
                            rounded-2xl
                            ${
                              isSeller
                                ? 'rounded-br-md'
                                : 'rounded-bl-md'
                            }
                          `}
                          style={{
                            backgroundColor:
                              isSeller
                                ? COLORS.primary
                                : '#FFFFFF',

                            color:
                              isSeller
                                ? '#FFFFFF'
                                : COLORS.text,

                            border:
                              isSeller
                                ? 'none'
                                : `1px solid ${COLORS.border}`,
                          }}
                        >
                          <p
                            className="text-sm leading-5"
                          >
                            {
                              message.text
                            }
                          </p>

                          <div
                            className={`
                              flex
                              items-center
                              justify-end
                              gap-1.5
                              mt-1.5
                            `}
                          >
                            <span
                              className="text-[10px]"
                              style={{
                                color:
                                  isSeller
                                    ? 'rgba(255,255,255,0.75)'
                                    : COLORS.muted,
                              }}
                            >
                              {
                                message.time
                              }
                            </span>

                            {isSeller && (
                              <FiCheckCircle
                                size={11}
                                style={{
                                  color:
                                    'rgba(255,255,255,0.8)',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                LINKED PRODUCT / ORDER
            ================================================= */}

            {(selectedConversation.product ||
              selectedConversation.orderId) && (
              <div
                className="px-5 py-3 border-t bg-white"
                style={{
                  borderColor:
                    COLORS.border,
                }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 border rounded-xl px-3 py-2.5"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >
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
                      {selectedConversation.orderId ? (
                        <FiPackage
                          size={16}
                        />
                      ) : (
                        <FiShoppingBag
                          size={16}
                        />
                      )}
                    </div>

                    <div>
                      <p
                        className="text-xs font-bold"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {selectedConversation.orderId
                          ? `Order ${selectedConversation.orderId}`
                          : selectedConversation.product}
                      </p>

                      <p
                        className="text-[10px] mt-0.5"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        {selectedConversation.sku
                          ? `SKU: ${selectedConversation.sku}`
                          : 'Product enquiry'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border bg-white"
                    style={{
                      borderColor:
                        COLORS.borderDark,
                      color:
                        COLORS.primary,
                    }}
                  >
                    View Details
                    <FiExternalLink
                      size={12}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                MESSAGE INPUT
            ================================================= */}

            <div
              className="px-5 py-4 border-t bg-white"
              style={{
                borderColor:
                  COLORS.border,
              }}
            >
              <div
                className="flex items-end gap-2"
              >
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 flex-shrink-0"
                  style={{
                    color:
                      COLORS.muted,
                  }}
                >
                  <FiPaperclip
                    size={18}
                  />
                </button>

                <div
                  className="flex-1 relative"
                >
                  <textarea
                    value={
                      messageText
                    }
                    onChange={(e) =>
                      setMessageText(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    rows={1}
                    placeholder="Type a message..."
                    className="w-full resize-none border rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                    style={{
                      borderColor:
                        COLORS.borderDark,
                    }}
                  />

                  <button
                    type="button"
                    className="absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    <FiSmile
                      size={17}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    handleSendMessage
                  }
                  disabled={
                    !messageText.trim()
                  }
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      COLORS.primary,
                  }}
                >
                  <FiSend
                    size={17}
                  />
                </button>
              </div>

              <p
                className="text-[10px] mt-2"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Press Enter to send
                message
              </p>
            </div>
          </div>
        ) : (
          /* ===================================================
             NO CHAT SELECTED
          =================================================== */

          <div
            className="flex-1 flex items-center justify-center p-10"
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor:
                    COLORS.whatsappBg,
                  color:
                    COLORS.whatsapp,
                }}
              >
                <FiMessageCircle
                  size={30}
                />
              </div>

              <h3
                className="text-lg font-bold"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                Select a conversation
              </h3>

              <p
                className="text-sm mt-1"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Select a customer from the
                list to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whatsapp;