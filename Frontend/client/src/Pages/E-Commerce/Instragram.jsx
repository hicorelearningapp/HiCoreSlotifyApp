import React, { useMemo, useState } from 'react';

import {
  FiInstagram,
  FiSearch,
  FiChevronDown,
  FiHeart,
  FiMessageCircle,
  FiPlay,
  FiEye,
  FiX,
  FiExternalLink,
  FiShoppingBag,
  FiCalendar,
  FiLink,
  FiCheckCircle,
  FiMoreHorizontal,
  FiPlus,
} from 'react-icons/fi';

const Instragram = () => {
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

    pink: '#EC4899',
    pinkBg: '#FDF2F8',

    blue: '#2563EB',
    blueBg: '#EFF6FF',
  };

  // =========================================================
  // STATE
  // =========================================================

  const [activeContentTab, setActiveContentTab] =
    useState('All');

  const [searchText, setSearchText] =
    useState('');

  const [selectedPost, setSelectedPost] =
    useState(null);

  // =========================================================
  // INSTAGRAM CONTENT DATA
  // =========================================================

  const [instagramPosts] = useState([
    {
      id: 1,
      type: 'Post',
      image:
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85',
      caption:
        'Elegant gold chain collection ✨ Designed for everyday luxury.',
      likes: 1248,
      comments: 86,
      views: 0,
      date: '24 Aug 2026',
      product: 'Classic Gold Chain',
      sku: 'JWL-GC-001',
      status: 'Published',
    },

    {
      id: 2,
      type: 'Reel',
      image:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
      caption:
        'A closer look at our latest diamond pendant collection 💎',
      likes: 2389,
      comments: 142,
      views: 18450,
      date: '23 Aug 2026',
      product: 'Diamond Pendant Necklace',
      sku: 'JWL-DP-002',
      status: 'Published',
    },

    {
      id: 3,
      type: 'Post',
      image:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
      caption:
        'Traditional jewellery with a modern touch.',
      likes: 986,
      comments: 54,
      views: 0,
      date: '22 Aug 2026',
      product: 'Traditional Gold Earrings',
      sku: 'JWL-EA-003',
      status: 'Published',
    },

    {
      id: 4,
      type: 'Reel',
      image:
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85',
      caption:
        'Find your perfect statement piece with our new arrivals.',
      likes: 3142,
      comments: 198,
      views: 25680,
      date: '21 Aug 2026',
      product: 'Pearl Bracelet',
      sku: 'JWL-PB-004',
      status: 'Published',
    },

    {
      id: 5,
      type: 'Post',
      image:
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85',
      caption:
        'Minimal accessories for your everyday style.',
      likes: 742,
      comments: 38,
      views: 0,
      date: '20 Aug 2026',
      product: 'Designer Watch',
      sku: 'ACC-WT-001',
      status: 'Published',
    },

    {
      id: 6,
      type: 'Reel',
      image:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
      caption:
        'Explore our latest saree collection ❤️',
      likes: 4125,
      comments: 267,
      views: 32100,
      date: '19 Aug 2026',
      product: 'Kanchipuram Silk Saree',
      sku: 'SAR-KS-001',
      status: 'Published',
    },
  ]);

  // =========================================================
  // FILTER CONTENT
  // =========================================================

  const filteredPosts = useMemo(() => {
    const search = searchText
      .toLowerCase()
      .trim();

    return instagramPosts.filter((post) => {
      const matchesTab =
        activeContentTab === 'All' ||
        post.type === activeContentTab;

      const matchesSearch =
        !search ||
        post.caption
          .toLowerCase()
          .includes(search) ||
        post.product
          .toLowerCase()
          .includes(search) ||
        post.sku
          .toLowerCase()
          .includes(search);

      return (
        matchesTab &&
        matchesSearch
      );
    });
  }, [
    instagramPosts,
    activeContentTab,
    searchText,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const totalPosts =
    instagramPosts.filter(
      (item) =>
        item.type === 'Post'
    ).length;

  const totalReels =
    instagramPosts.filter(
      (item) =>
        item.type === 'Reel'
    ).length;

  const totalLikes =
    instagramPosts.reduce(
      (sum, item) =>
        sum + item.likes,
      0
    );

  const totalComments =
    instagramPosts.reduce(
      (sum, item) =>
        sum + item.comments,
      0
    );

  const totalViews =
    instagramPosts.reduce(
      (sum, item) =>
        sum + item.views,
      0
    );

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (
        (number / 1000000).toFixed(1) +
        'M'
      );
    }

    if (number >= 1000) {
      return (
        (number / 1000).toFixed(1) +
        'K'
      );
    }

    return number;
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
        <div className="flex items-start justify-between">

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
    <>
      <div
        className="min-h-full p-5 lg:p-8 pb-12 font-sans"
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
                <FiInstagram
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
                Instagram
              </h1>

            </div>

            <p
              className="text-sm lg:text-base mt-2 lg:ml-[55px]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Manage your Instagram
              content and product posts
            </p>

          </div>

          {/* CONNECTED ACCOUNT */}

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
                  COLORS.pinkBg,
                color:
                  COLORS.pink,
              }}
            >
              <FiInstagram
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
                  @hicore_jewellery
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

        {/* =================================================
            ACCOUNT OVERVIEW
        ================================================= */}

        <div
          className="bg-white border rounded-2xl p-5 mb-6"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          <div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5"
          >

            <div>

              <h2
                className="text-lg font-bold"
                style={{
                  color:
                    COLORS.heading,
                }}
              >
                Instagram Overview
              </h2>

              <p
                className="text-xs mt-1"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Performance of your
                connected Instagram account
              </p>

            </div>

            <div
              className="flex items-center gap-2"
            >

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    COLORS.primaryLight,
                  color:
                    COLORS.primary,
                }}
              >
                <FiInstagram
                  size={16}
                />
              </div>

              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    COLORS.text,
                }}
              >
                HiCore
              </span>

            </div>

          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >

            <StatCard
              title="Posts"
              value={totalPosts}
              subtitle="Published posts"
              icon={
                <FiInstagram
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
              title="Reels"
              value={totalReels}
              subtitle="Published reels"
              icon={
                <FiPlay
                  size={20}
                />
              }
              iconBg={
                COLORS.pinkBg
              }
              iconColor={
                COLORS.pink
              }
            />

            <StatCard
              title="Likes"
              value={formatNumber(
                totalLikes
              )}
              subtitle="Total likes"
              icon={
                <FiHeart
                  size={20}
                />
              }
              iconBg={
                COLORS.pinkBg
              }
              iconColor={
                COLORS.pink
              }
            />

            <StatCard
              title="Views"
              value={formatNumber(
                totalViews
              )}
              subtitle="Reel views"
              icon={
                <FiEye
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

          </div>

        </div>

        {/* =================================================
            CONTENT HEADER
        ================================================= */}

        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5"
        >

          <div>

            <h2
              className="text-xl font-bold"
              style={{
                color:
                  COLORS.heading,
              }}
            >
              Instagram Content
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              View posts and reels linked
              with your products
            </p>

          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{
              backgroundColor:
                COLORS.primary,
            }}
          >
            <FiPlus
              size={17}
            />

            Create Content
          </button>

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div
          className="bg-white border rounded-2xl p-4 mb-5"
          style={{
            borderColor:
              COLORS.border,
          }}
        >

          <div
            className="flex flex-col lg:flex-row gap-3"
          >

            {/* SEARCH */}

            <div
              className="relative flex-1"
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
                placeholder="
                  Search product, SKU or caption...
                "
                className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                style={{
                  borderColor:
                    COLORS.borderDark,
                }}
              />

            </div>

            {/* CONTENT TABS */}

            <div
              className="flex items-center bg-gray-50 border rounded-xl p-1 overflow-x-auto"
              style={{
                borderColor:
                  COLORS.border,
              }}
            >

              {[
                'All',
                'Post',
                'Reel',
              ].map((tab) => (

                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveContentTab(
                      tab
                    )
                  }
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition"
                  style={
                    activeContentTab ===
                    tab
                      ? {
                          backgroundColor:
                            COLORS.primaryLight,
                          color:
                            COLORS.primaryDark,
                        }
                      : {
                          color:
                            COLORS.muted,
                        }
                  }
                >
                  {tab === 'Post'
                    ? 'Posts'
                    : tab === 'Reel'
                    ? 'Reels'
                    : 'All'}
                </button>

              ))}

            </div>

          </div>

        </div>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        {filteredPosts.length > 0 ? (

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          >

            {filteredPosts.map(
              (post) => (

                <div
                  key={post.id}
                  className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  {/* IMAGE */}

                  <div
                    className="relative aspect-square overflow-hidden bg-gray-100"
                  >

                    <img
                      src={post.image}
                      alt={
                        post.product
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* DARK OVERLAY */}

                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition"
                    />

                    {/* TYPE */}

                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/95"
                      style={{
                        color:
                          post.type ===
                          'Reel'
                            ? COLORS.pink
                            : COLORS.primary,
                      }}
                    >

                      {post.type ===
                      'Reel' ? (
                        <FiPlay
                          size={12}
                        />
                      ) : (
                        <FiInstagram
                          size={12}
                        />
                      )}

                      {post.type}

                    </div>

                    {/* STATUS */}

                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor:
                          COLORS.successBg,
                        color:
                          COLORS.success,
                      }}
                    >

                      <FiCheckCircle
                        size={11}
                      />

                      Published

                    </div>

                    {/* VIEW BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPost(
                          post
                        )
                      }
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-purple-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >
                      <FiEye
                        size={19}
                      />
                    </button>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-4">

                    {/* PRODUCT */}

                    <div
                      className="flex items-start justify-between gap-3"
                    >

                      <div className="min-w-0">

                        <h3
                          className="text-sm font-bold truncate"
                          style={{
                            color:
                              COLORS.heading,
                          }}
                        >
                          {post.product}
                        </h3>

                        <p
                          className="text-xs mt-1"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          SKU: {post.sku}
                        </p>

                      </div>

                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 flex-shrink-0"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        <FiMoreHorizontal
                          size={17}
                        />
                      </button>

                    </div>

                    {/* CAPTION */}

                    <p
                      className="text-xs leading-5 mt-3 line-clamp-2"
                      style={{
                        color:
                          COLORS.text,
                      }}
                    >
                      {post.caption}
                    </p>

                    {/* METRICS */}

                    <div
                      className="flex items-center gap-4 mt-4 pt-3 border-t"
                      style={{
                        borderColor:
                          COLORS.border,
                      }}
                    >

                      <div
                        className="flex items-center gap-1.5"
                      >

                        <FiHeart
                          size={14}
                          style={{
                            color:
                              COLORS.pink,
                          }}
                        />

                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {formatNumber(
                            post.likes
                          )}
                        </span>

                      </div>

                      <div
                        className="flex items-center gap-1.5"
                      >

                        <FiMessageCircle
                          size={14}
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
                          {formatNumber(
                            post.comments
                          )}
                        </span>

                      </div>

                      {post.type ===
                        'Reel' && (
                        <div
                          className="flex items-center gap-1.5"
                        >

                          <FiEye
                            size={14}
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
                            {formatNumber(
                              post.views
                            )}
                          </span>

                        </div>
                      )}

                    </div>

                    {/* DATE + LINK */}

                    <div
                      className="flex items-center justify-between mt-4"
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
                          className="text-[11px]"
                          style={{
                            color:
                              COLORS.muted,
                          }}
                        >
                          {post.date}
                        </span>

                      </div>

                      <div
                        className="flex items-center gap-1 text-[11px] font-semibold"
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      >

                        <FiLink
                          size={12}
                        />

                        Product Linked

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="bg-white border rounded-2xl py-20 text-center"
            style={{
              borderColor:
                COLORS.border,
            }}
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
              <FiInstagram
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
              No content found
            </h3>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Try changing your search
              or content filter.
            </p>

          </div>

        )}

      </div>

      {/* =====================================================
          POST DETAILS MODAL
      ===================================================== */}

      {selectedPost && (

        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() =>
            setSelectedPost(null)
          }
        >

          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* IMAGE */}

            <div
              className="w-full md:w-1/2 bg-black flex items-center justify-center max-h-[45vh] md:max-h-none"
            >

              <img
                src={
                  selectedPost.image
                }
                alt={
                  selectedPost.product
                }
                className="w-full h-full object-cover"
              />

            </div>

            {/* DETAILS */}

            <div
              className="w-full md:w-1/2 flex flex-col max-h-[45vh] md:max-h-none overflow-y-auto"
            >

              {/* HEADER */}

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

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        COLORS.primaryLight,
                      color:
                        COLORS.primary,
                    }}
                  >
                    <FiInstagram
                      size={17}
                    />
                  </div>

                  <div>

                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      @hicore_jewellery
                    </p>

                    <p
                      className="text-[11px]"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      {selectedPost.type}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPost(null)
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

              {/* BODY */}

              <div className="p-5">

                {/* STATUS */}

                <div
                  className="flex items-center justify-between mb-5"
                >

                  <div>

                    <p
                      className="text-xs"
                      style={{
                        color:
                          COLORS.muted,
                      }}
                    >
                      Status
                    </p>

                    <div
                      className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor:
                          COLORS.successBg,
                        color:
                          COLORS.success,
                      }}
                    >
                      <FiCheckCircle
                        size={12}
                      />

                      {selectedPost.status}
                    </div>

                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold"
                    style={{
                      borderColor:
                        COLORS.borderDark,
                      color:
                        COLORS.text,
                    }}
                  >
                    <FiExternalLink
                      size={13}
                    />

                    View on Instagram
                  </button>

                </div>

                {/* PRODUCT */}

                <div
                  className="border rounded-xl p-4 mb-5"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  <div
                    className="flex items-center gap-2 mb-3"
                  >

                    <FiShoppingBag
                      size={16}
                      style={{
                        color:
                          COLORS.primary,
                      }}
                    />

                    <h3
                      className="text-sm font-bold"
                      style={{
                        color:
                          COLORS.heading,
                      }}
                    >
                      Linked Product
                    </h3>

                  </div>

                  <p
                    className="text-sm font-bold"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    {selectedPost.product}
                  </p>

                  <p
                    className="text-xs mt-1"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    SKU: {selectedPost.sku}
                  </p>

                </div>

                {/* CAPTION */}

                <div className="mb-5">

                  <h3
                    className="text-sm font-bold mb-2"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Caption
                  </h3>

                  <p
                    className="text-sm leading-6"
                    style={{
                      color:
                        COLORS.text,
                    }}
                  >
                    {selectedPost.caption}
                  </p>

                </div>

                {/* METRICS */}

                <div>

                  <h3
                    className="text-sm font-bold mb-3"
                    style={{
                      color:
                        COLORS.heading,
                    }}
                  >
                    Engagement
                  </h3>

                  <div
                    className="grid grid-cols-3 gap-3"
                  >

                    <div
                      className="border rounded-xl p-3"
                      style={{
                        borderColor:
                          COLORS.border,
                      }}
                    >

                      <FiHeart
                        size={16}
                        style={{
                          color:
                            COLORS.pink,
                        }}
                      />

                      <p
                        className="text-lg font-bold mt-2"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {formatNumber(
                          selectedPost.likes
                        )}
                      </p>

                      <p
                        className="text-[10px]"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Likes
                      </p>

                    </div>

                    <div
                      className="border rounded-xl p-3"
                      style={{
                        borderColor:
                          COLORS.border,
                      }}
                    >

                      <FiMessageCircle
                        size={16}
                        style={{
                          color:
                            COLORS.primary,
                        }}
                      />

                      <p
                        className="text-lg font-bold mt-2"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {formatNumber(
                          selectedPost.comments
                        )}
                      </p>

                      <p
                        className="text-[10px]"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Comments
                      </p>

                    </div>

                    <div
                      className="border rounded-xl p-3"
                      style={{
                        borderColor:
                          COLORS.border,
                      }}
                    >

                      <FiEye
                        size={16}
                        style={{
                          color:
                            COLORS.blue,
                        }}
                      />

                      <p
                        className="text-lg font-bold mt-2"
                        style={{
                          color:
                            COLORS.heading,
                        }}
                      >
                        {selectedPost.views
                          ? formatNumber(
                              selectedPost.views
                            )
                          : '-'}
                      </p>

                      <p
                        className="text-[10px]"
                        style={{
                          color:
                            COLORS.muted,
                        }}
                      >
                        Views
                      </p>

                    </div>

                  </div>

                </div>

                {/* DATE */}

                <div
                  className="flex items-center gap-2 mt-5 pt-4 border-t"
                  style={{
                    borderColor:
                      COLORS.border,
                  }}
                >

                  <FiCalendar
                    size={14}
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  />

                  <span
                    className="text-xs"
                    style={{
                      color:
                        COLORS.muted,
                    }}
                  >
                    Published on{' '}
                    {selectedPost.date}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Instragram;