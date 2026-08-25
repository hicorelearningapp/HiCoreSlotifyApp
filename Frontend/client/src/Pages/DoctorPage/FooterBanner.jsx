import React from 'react';

// Replace with your uploaded/generated banner image
import bannerImage from '../../assets/footer-banner.png';

const FooterBanner = () => {
  return (
    <section className="w-full bg-white">

      {/* =====================================================
          BANNER IMAGE
      ===================================================== */}
      <div className="w-full overflow-hidden">

        <img
          src={bannerImage}
          alt="Modern clinic reception with medical professionals"
          className="
            block
            w-full
            h-[220px]
            sm:h-[260px]
            md:h-[300px]
            lg:h-[580px]
            object-cover
            object-center
          "
        />

      </div>

      {/* =====================================================
          COPYRIGHT
      ===================================================== */}
      <div className="w-full bg-white border-t border-[#E5EDE7]">

        <div
          className="
            mx-auto
            px-4
            sm:px-6
            md:px-8
            py-3
            flex
            items-center
            justify-center
          "
        >

          <p
            className="
              font-['Roboto',_sans-serif]
              text-[12px]
              sm:text-[13px]
              md:text-[14px]
              font-medium
              text-[#346739]
              text-center
              m-0
            "
          >
            © {new Date().getFullYear()} HiCoreSlotify. All rights reserved.
          </p>

        </div>

      </div>

    </section>
  );
};

export default FooterBanner;