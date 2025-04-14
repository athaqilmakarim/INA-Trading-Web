import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService, { UserType } from '../services/UserService';
import AddressAutocomplete from '../components/AddressAutocomplete';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    userType: UserType.B2C_CONSUMER,
    companyName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await userService.register(
        formData.email,
        formData.password,
        formData.userType,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName
        }
      );
      
      toast.success(result.message);
      navigate('/verify-email-required');
    } catch (error) {
      console.error('Registration error:', error);
      // Show the error message from Firebase or our custom error
      const errorMessage = error.message || 'Failed to register';
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 transition-all duration-500 ease-in-out">
      <div className="w-full max-w-md px-6 py-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Create a new account
          </h2>
          <p className="text-center text-gray-300 text-sm">
            Join us today! Please enter your details.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-200 mb-1">
                Account Type
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value={UserType.B2C_CONSUMER} className="text-gray-900">B2C Consumer (Foreign Consumer)</option>
                <option value={UserType.B2C_BUSINESS_OWNER} className="text-gray-900">B2C Business Owner</option>
                <option value={UserType.B2B_IMPORTER} className="text-gray-900">B2B Importer</option>
                <option value={UserType.B2B_SUPPLIER} className="text-gray-900">B2B Supplier/Exporter</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-200 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-1">
                Address
              </label>
              <AddressAutocomplete
                onAddressSelect={(address) => {
                  setFormData(currentFormData => ({
                    ...currentFormData,
                    address: address
                  }));
                }}
                placeholder="Enter your address"
                initialValue={formData.address}
              />
            </div>

            {formData.userType === UserType.B2B_SUPPLIER && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-200 mb-1">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required={formData.userType === UserType.B2B_SUPPLIER}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Sign up'
            )}
          </button>

          <div className="text-center text-sm text-gray-300">
            <span>Already have an account?</span>{' '}
            <Link 
              to="/login" 
              className="font-medium text-white hover:text-red-400 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 