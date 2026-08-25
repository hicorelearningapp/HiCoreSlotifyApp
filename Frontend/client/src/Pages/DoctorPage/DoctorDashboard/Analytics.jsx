import React, { useEffect, useMemo, useState } from 'react';

// Import icons from your assets folder
import cancelIcon from '../../../assets/DoctorDashboard/close.png';
import noShowIcon from '../../../assets/DoctorDashboard/caution.png';
import clockIcon from '../../../assets/DoctorDashboard/time.png';
import userIcon from '../../../assets/DoctorDashboard/profile.png';


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || "/api";


// Single source of truth for doctor ID
const getDoctorId = () => {
  const doctorId = localStorage.getItem("doctorId");

  console.log(
    "[Auth] doctorId from localStorage:",
    doctorId
  );

  return doctorId;
};


// ============================================================
// MONTH CONFIGURATION
// ============================================================

// Backend returns:
// 10, 11, 12, 01, 02, 03 ... 09
//
// We preserve the backend order exactly.

const monthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};


// Backend month order
const backendMonthOrder = [
  "10",
  "11",
  "12",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
];


// ============================================================
// NUMBER HELPER
// ============================================================

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(
    String(value).replace(/,/g, "")
  );

  return Number.isFinite(number) ? number : 0;
};


// ============================================================
// FORMAT REVENUE
// ============================================================

const formatRevenue = (value) => {
  const number = toNumber(value);

  return new Intl.NumberFormat("en-IN").format(
    number
  );
};


// ============================================================
// ANALYTICS COMPONENT
// ============================================================

const Analytics = () => {

  // ==========================================================
  // API STATE
  // ==========================================================

  const [analyticsData, setAnalyticsData] = useState({
    CancellationRate: "0%",
    NoShow: 0,
    PatientRetention: "0%",
    Appointments: [],
    Revenue: [],
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================================
  // FETCH ANALYTICS
  // ==========================================================

  const fetchAnalytics = async () => {
    const doctorId = getDoctorId();

    if (!doctorId) {
      console.error(
        "[Analytics] Doctor ID not found in localStorage"
      );

      setError(
        "Doctor ID not found. Please login again."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const url =
        `${API_BASE}/doctors/${encodeURIComponent(
          doctorId
        )}/analytics`;

      console.log(
        "[Analytics] API URL:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        "[Analytics] Response status:",
        response.status
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "[Analytics] API Error:",
          errorText
        );

        throw new Error(
          `Failed to fetch analytics (${response.status})`
        );
      }

      const data =
        await response.json();

      console.log(
        "[Analytics] Backend response:",
        data
      );

      setAnalyticsData({
        CancellationRate:
          data?.CancellationRate ??
          "0%",

        NoShow:
          toNumber(data?.NoShow),

        PatientRetention:
          data?.PatientRetention ??
          "0%",

        Appointments:
          Array.isArray(data?.Appointments)
            ? data.Appointments
            : [],

        Revenue:
          Array.isArray(data?.Revenue)
            ? data.Revenue
            : [],
      });

    } catch (err) {
      console.error(
        "[Analytics] Fetch error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load analytics."
      );

      setAnalyticsData({
        CancellationRate: "0%",
        NoShow: 0,
        PatientRetention: "0%",
        Appointments: [],
        Revenue: [],
      });

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // FETCH WHEN COMPONENT LOADS
  // ==========================================================

  useEffect(() => {
    fetchAnalytics();
  }, []);


  // ==========================================================
  // APPOINTMENT CHART DATA
  // ==========================================================

  const chartData = useMemo(() => {

    const appointmentObject =
      analyticsData?.Appointments?.[0] || {};

    return backendMonthOrder.map(
      (monthKey) => {

        const value = toNumber(
          appointmentObject?.[monthKey]
        );

        return {
          month:
            monthNames[monthKey] ||
            monthKey,

          monthKey,

          value,

          // Maximum chart scale = 1000
          // because existing chart used 1000.
          heightPercent:
            value > 0
              ? `${Math.min(
                  (value / 1000) * 100,
                  100
                )}%`
              : "0%",
        };
      }
    );

  }, [analyticsData]);


  // ==========================================================
  // REVENUE CHART DATA
  // ==========================================================

  const revenueData = useMemo(() => {

    const revenueObject =
      analyticsData?.Revenue?.[0] || {};

    return backendMonthOrder.map(
      (monthKey) => {

        const value = toNumber(
          revenueObject?.[monthKey]
        );

        return {
          month:
            monthNames[monthKey] ||
            monthKey,

          monthKey,

          value,
        };
      }
    );

  }, [analyticsData]);


  // ==========================================================
  // REVENUE MAX VALUE
  // ==========================================================

  const maxRevenue = useMemo(() => {

    const values =
      revenueData.map(
        (item) => item.value
      );

    const maximum =
      Math.max(...values, 0);

    // If backend has no revenue yet,
    // keep a useful default scale.
    if (maximum <= 0) {
      return 160000;
    }

    // Add 20% headroom above the largest value
    const calculatedMax =
      maximum * 1.2;

    // Round up to a readable scale
    const rounded =
      Math.ceil(
        calculatedMax / 10000
      ) * 10000;

    return Math.max(
      rounded,
      10000
    );

  }, [revenueData]);


  // ==========================================================
  // SVG DIMENSIONS
  // ==========================================================

  const svgWidth = 1000;

  const svgHeight = 260;


  // ==========================================================
  // REVENUE GRAPH POINTS
  // ==========================================================

  const points = useMemo(() => {

    if (revenueData.length === 0) {
      return [];
    }

    return revenueData.map(
      (item, index) => {

        // Keep every point horizontally aligned with its month label.
        // The X-axis labels use a 36px width, so the first/last
        // point is placed at the center of those labels.
        const x =
          revenueData.length === 1
            ? svgWidth / 2
            : 18 +
              (
                index /
                (revenueData.length - 1)
              ) *
                (svgWidth - 36);

        // Keep zero-value points exactly on the purple ₹0 border line.
        const y =
          item.value <= 0
            ? svgHeight
            : svgHeight -
              (
                item.value /
                maxRevenue
              ) *
                svgHeight;

        return {
          x,
          y: Math.max(
            0,
            Math.min(
              svgHeight,
              y
            )
          ),
        };
      }
    );

  }, [
    revenueData,
    maxRevenue,
  ]);


  // ==========================================================
  // SVG SMOOTH CURVE
  // ==========================================================

  const pathString = useMemo(() => {

    if (points.length === 0) {
      return "";
    }

    return points.reduce(
      (
        acc,
        curr,
        idx,
        arr
      ) => {

        if (idx === 0) {
          return `M ${curr.x} ${curr.y}`;
        }

        const prev =
          arr[idx - 1];

        const cpX1 =
          prev.x +
          (curr.x - prev.x) /
            2;

        const cpY1 =
          prev.y;

        const cpX2 =
          prev.x +
          (curr.x - prev.x) /
            2;

        const cpY2 =
          curr.y;

        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      },
      ""
    );

  }, [points]);


  // ==========================================================
  // METRIC CARDS
  // ==========================================================

  const metricCards = [
    {
      value:
        analyticsData.CancellationRate ||
        "0%",

      label:
        "Cancellation Rate",

      icon:
        cancelIcon,

      alt:
        "Cancel Icon",
    },

    {
      value:
        analyticsData.NoShow ?? 0,

      label:
        "No-Shows",

      icon:
        noShowIcon,

      alt:
        "No-Show Icon",
    },

    {
      // Backend does not currently provide
      // Average Consultation Time.
      value:
        "-",

      label:
        "Average Consultation Time",

      icon:
        clockIcon,

      alt:
        "Clock Icon",
    },

    {
      value:
        analyticsData.PatientRetention ||
        "0%",

      label:
        "Patient Retention",

      icon:
        userIcon,

      alt:
        "User Icon",
    },
  ];


  // ==========================================================
  // REVENUE Y-AXIS VALUES
  // ==========================================================

  const revenueAxisValues = useMemo(() => {

    return [
      maxRevenue,
      maxRevenue * 0.75,
      maxRevenue * 0.5,
      maxRevenue * 0.25,
      0,
    ];

  }, [maxRevenue]);


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen  text-[#333333] font-sans">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <h1
        style={{
          color: "#346739",
        }}
        className="text-lg md:text-xl font-bold uppercase tracking-wide mb-6"
      >
        Analytics - Business Growth
      </h1>


      {/* ======================================================
          ERROR MESSAGE
      ======================================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>
            {error}
          </span>

          <button
            onClick={fetchAnalytics}
            className="ml-4 font-semibold underline cursor-pointer"
          >
            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          METRIC CARDS
      ======================================================= */}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        style={{
          gap: "16px",
        }}
      >

        {metricCards.map(
          (card, index) => (

            <div
              key={index}
              style={{
                width: "100%",
                maxWidth: "276px",
                height: "140px",
                borderRadius: "8px",
                borderWidth: "1px",
                borderColor: "#D9D9D9",
                paddingTop: "16px",
                paddingRight: "20px",
                paddingBottom: "16px",
                paddingLeft: "20px",
                opacity: 1,
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                justifyContent:
                  "space-between",
              }}
              className="shadow-sm transition-all duration-300 hover:border-[#346739] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040]"
            >

              {/* Top Line */}

              <div className="flex items-center justify-between w-full">

                <div
                  style={{
                    fontFamily:
                      "Poppins, sans-serif",

                    fontWeight: 600,

                    fontStyle: "normal",

                    fontSize: "20px",

                    lineHeight: "28px",

                    letterSpacing: "0%",

                    color: "#346739",
                  }}
                >

                  {loading ? (
                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}

                </div>


                <div className="w-14 h-14 flex items-center justify-center shrink-0">

                  <img
                    src={card.icon}
                    alt={card.alt}
                    className="w-10 h-10 object-contain"
                  />

                </div>

              </div>


              {/* Bottom Label */}

              <div
                style={{
                  fontFamily:
                    "Roboto, sans-serif",

                  fontWeight: 400,

                  fontStyle: "normal",

                  fontSize: "14px",

                  lineHeight: "20px",

                  letterSpacing: "0%",

                  color: "#346739",
                }}
                className="uppercase tracking-wider"
              >
                {card.label}
              </div>

            </div>

          )
        )}

      </div>


      {/* ======================================================
          APPOINTMENTS THIS MONTH
      ======================================================= */}

      <div
        style={{
          borderColor: "#D9D9D9",
        }}
        className="bg-white border rounded-2xl p-6 shadow-sm mb-8"
      >

        <h2
          style={{
            color: "#346739",
          }}
          className="text-sm font-bold uppercase tracking-wider mb-8"
        >
          Appointments This Month
        </h2>


        {/* Loading */}

        {loading ? (

          <div className="h-80 flex items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />

              <span className="text-sm text-gray-500">
                Loading appointments...
              </span>

            </div>

          </div>

        ) : (

          <div className="relative h-80 w-full flex items-end pt-6 pb-1 pl-12 pr-4">

            {/* ==================================================
                Y AXIS
            =================================================== */}

            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-12 pr-4">

              <div className="w-full border-b border-gray-100 flex items-center">

                <span className="text-xs text-blue-500 pr-3 -ml-10">
                  1000
                </span>

              </div>


              <div className="w-full border-b border-gray-100 flex items-center">

                <span className="text-xs text-blue-500 pr-3 -ml-10">
                  750
                </span>

              </div>


              <div className="w-full border-b border-gray-100 flex items-center">

                <span className="text-xs text-blue-500 pr-3 -ml-10">
                  500
                </span>

              </div>


              <div className="w-full border-b border-gray-100 flex items-center">

                <span className="text-xs text-blue-500 pr-3 -ml-10">
                  250
                </span>

              </div>


              <div className="w-full border-b border-purple-300 flex items-center">

                <span className="text-xs text-blue-500 pr-3 -ml-10">
                  0
                </span>

              </div>

            </div>


            {/* ==================================================
                BARS
            =================================================== */}

            <div className="w-full flex justify-around items-end h-full relative z-10 px-2">

              {chartData.map(
                (item, index) => (

                  <div
                    key={`${item.monthKey}-${index}`}
                    className="flex flex-col items-center h-full justify-end group"
                  >

                    {/* Bar */}

                    <div
                      style={{
                        height:
                          item.heightPercent,

                        background:
                          "linear-gradient(180deg, #115920 0%, #89D188 83.65%)",

                        width:
                          "36px",

                        minHeight:
                          item.value > 0
                            ? "4px"
                            : "0px",

                        borderTopLeftRadius:
                          "6px",

                        borderTopRightRadius:
                          "6px",
                      }}
                      className="transition-all duration-300 group-hover:opacity-90"
                      title={`${item.month}: ${item.value} appointments`}
                    />


                    {/* Month */}

                    <span className="text-xs text-gray-500 font-medium mt-3">
                      {item.month}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          REVENUE TRENDS
      ======================================================= */}

      <div
        style={{
          borderColor: "#D9D9D9",
        }}
        className="bg-white border rounded-2xl p-6 shadow-sm"
      >

        <h2
          style={{
            color: "#346739",
          }}
          className="text-sm font-bold uppercase tracking-wider mb-8"
        >
          Revenue Trends
        </h2>


        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading ? (

          <div className="h-80 flex items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />

              <span className="text-sm text-gray-500">
                Loading revenue...
              </span>

            </div>

          </div>

        ) : (

          <>

            {/* ==================================================
                GRAPH
            =================================================== */}

            <div className="relative h-80 w-full">

              {/* =================================================
                  REVENUE PLOT AREA
                  Keep the grid and SVG inside the exact same
                  top/bottom area so ₹0 points sit on the border.
              ================================================== */}

              <div className="absolute top-6 bottom-12 left-16 right-4">

                {/* =================================================
                    Y AXIS
                ================================================== */}

                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">

                  {revenueAxisValues.map(
                    (value, index) => (

                      <div
                        key={index}
                        className={`w-full flex items-center ${
                          index ===
                          revenueAxisValues.length - 1
                            ? "border-b border-purple-300"
                            : "border-b border-gray-100"
                        }`}
                      >

                        <span className="text-xs text-blue-500 pr-3 -ml-14">
                          ₹{formatRevenue(value)}
                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* =================================================
                    SVG LINE CHART
                ================================================== */}

                <div className="absolute inset-0 z-10">

                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >

                    {/* Smooth Trend Line */}

                    {pathString && (

                      <path
                        d={pathString}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                    )}


                    {/* Data Points */}

                    {points.map(
                      (point, index) => (

                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="4.5"
                          fill="#2563EB"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />

                      )
                    )}

                  </svg>

                </div>

              </div>

            </div>


            {/* ==================================================
                X AXIS
            =================================================== */}

            <div className="flex justify-between pl-16 pr-4 mt-2">

              {revenueData.map(
                (item, index) => (

                  <span
                    key={`${item.monthKey}-${index}`}
                    className="text-xs text-blue-600 font-medium text-center"
                    style={{
                      width: "36px",
                    }}
                    title={`₹${formatRevenue(
                      item.value
                    )}`}
                  >
                    {item.month}
                  </span>

                )
              )}

            </div>

          </>

        )}

      </div>

    </div>
  );
};


export default Analytics;