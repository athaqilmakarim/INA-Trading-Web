import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessType: 'UMKM',
    exportImportType: 'Exportir',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      emailjs.init("xmB_UOpDAUz1u0wa-");
      console.log('Attempting to send email...');

      const templateParams = {
        to_name: 'Admin INA Trading',
        to_email: 'admin@inatrading.co.id',
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        business_type: formData.businessType,
        export_import_type: formData.exportImportType,
        subject: formData.subject,
        message: formData.message,
        template_message: `Name: ${formData.fullName}
Email: ${formData.email}
Phone number: ${formData.phone}
Business type: ${formData.businessType}
Export/Import Type: ${formData.exportImportType}
Subject: ${formData.subject}

Message:
${formData.message}`
      };

      console.log('Email parameters:', templateParams);

      const response = await emailjs.send(
        'service_73gha14',
        'template_oebp56m',
        templateParams
      );

      console.log('Email sent successfully:', response);
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        businessType: 'UMKM',
        exportImportType: 'Exportir',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Detailed email error:', err);
      setError(`Failed to send message: ${err.message}. Please try again or contact us directly at admin@inatrading.co.id`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8">
              Have questions about INA TRADING? We're here to help you learn more about our facilities and features.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="businessType"
                      value="UMKM"
                      checked={formData.businessType === 'UMKM'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">UMKM</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="businessType"
                      value="KOPERASI"
                      checked={formData.businessType === 'KOPERASI'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">KOPERASI</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="businessType"
                      value="INDUSTRI"
                      checked={formData.businessType === 'INDUSTRI'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">INDUSTRI</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="businessType"
                      value="Other"
                      checked={formData.businessType === 'Other'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export/Import Type
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="exportImportType"
                      value="Exportir"
                      checked={formData.exportImportType === 'Exportir'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">Exportir</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="exportImportType"
                      value="Importir"
                      checked={formData.exportImportType === 'Importir'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">Importir</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="exportImportType"
                      value="Aggregator"
                      checked={formData.exportImportType === 'Aggregator'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">Aggregator</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="exportImportType"
                      value="Other"
                      checked={formData.exportImportType === 'Other'}
                      onChange={handleInputChange}
                      className="form-radio text-red-600"
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>

              {error && (
                <div className="text-red-600 mt-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 mt-4">
                  Message sent successfully!
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Perum PERURI</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Address:</p>
                    <p className="text-gray-600">Jl. Palatehan No.4 Blok K-V, Kebayoran Baru, Jakarta 12160</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Phone: +62 21 7395 000</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Email: <a href="mailto:info.inadigital@peruri.co.id" className="text-red-600 hover:underline">info.inadigital@peruri.co.id</a></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">INA TRADING</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">WhatsApp: <a href="https://wa.me/6281181190222" className="text-red-600 hover:underline">+62 811 8119 0222</a></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Email: <a href="mailto:info@inatrading.co.id" className="text-red-600 hover:underline">info@inatrading.co.id</a></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Monday - Friday: 09:00 - 16:00</p>
                    <p className="text-gray-700">Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 