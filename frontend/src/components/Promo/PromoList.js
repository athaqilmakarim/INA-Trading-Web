import React from 'react';
import { format } from 'date-fns';

const PromoList = ({ promos, onDelete, showActions = false }) => {
  const isPromoActive = (promo) => {
    const now = new Date();
    return now >= promo.startDate && now <= promo.endDate;
  };

  return (
    <div className="space-y-4">
      {promos.map(promo => (
        <div 
          key={promo.id} 
          className={`bg-white p-4 rounded-lg shadow border-l-4 ${
            isPromoActive(promo) ? 'border-green-500' : 'border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{promo.title}</h3>
              <p className="text-gray-600 mt-1">{promo.description}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-red-600">
                {promo.discountPercentage}% OFF
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Start Date:</span>
              <br />
              {format(promo.startDate, 'PPP p')}
            </div>
            <div>
              <span className="text-gray-500">End Date:</span>
              <br />
              {format(promo.endDate, 'PPP p')}
            </div>
          </div>

          {promo.terms && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Terms & Conditions:</span>
              <p className="text-sm mt-1">{promo.terms}</p>
            </div>
          )}

          {showActions && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onDelete(promo.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete Promotion
              </button>
            </div>
          )}

          <div className="mt-2">
            <span className={`text-sm px-2 py-1 rounded ${
              isPromoActive(promo) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isPromoActive(promo) ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}

      {promos.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No promotions available at the moment.
        </div>
      )}
    </div>
  );
};

export default PromoList; 