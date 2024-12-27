import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const sections = [
    {
      title: "Apakah INA TRADING",
      content: "INA TRADING adalah Platform B2B & B2C yang digunakan oleh UKM, KOPERASI & INDUSTRI di Indonesia untuk melakukan Ekspor, Promosi, Pemasaran & Penjualan di Luar Negeri dan digunakan oleh masyarakat di seluruh dunia seperti Importir, Distributor, pengusaha restaurant, cafe, toko dan pembeli umum untuk mendapatkan dan membeli produk Indonesia diluar negeriatau di negara mereka berada.",
      footer: "Dikelola oleh PERURI & Indonesia In Your Hand"
    },
    {
      title: "Siapa pengguna INA TRADING",
      content: [
        "UKM, KOPERASI & INDUSTRI",
        "Aggregator di dalam & luar negeri",
        "Ekportir & Importir",
        "Masyarakat, pemilik usaha di luar negeri"
      ],
      footer: "Dikelola oleh PERURI & Indonesia In Your Hand"
    },
    {
      title: "Keunggulan Aplikasi Mobile INA TRADING",
      content: [
        "Fitur searching lokasi restoraunt, cafe, toko yang menjual produk Indonesia di kota dan negara tertentu.",
        "Fitur pembelian produk Indonesia yang ada di UKM BOX Fulfillment Center di Australia & Eropa",
        "Fitur pemesanan produk / pemesanan tempat di sebuah restaurant / cafe di kota dan negara tertentu.",
        "Business Matching",
        "Fitur transaksi B2B"
      ],
      footer: "Dikelola oleh PERURI, MATRIK & Indonesia In Your Hand"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-black py-24">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tentang INA TRADING
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {section.title}
                </h2>
                
                {Array.isArray(section.content) ? (
                  <ul className="space-y-4 mb-6">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-3">
                          {idx + 1}
                        </span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {section.content}
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 italic">
                    {section.footer}
                  </p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About; 