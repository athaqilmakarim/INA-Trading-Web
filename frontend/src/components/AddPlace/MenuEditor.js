import React, { useState } from 'react';

const MenuEditor = ({
  menuItems,
  setMenuItems,
  onClose
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddItem = () => {
    if (newItemName && newItemPrice) {
      setMenuItems([
        ...menuItems,
        {
          id: Date.now().toString(),
          name: newItemName,
          description: newItemDescription,
          price: Number(newItemPrice)
        }
      ]);
      setNewItemName('');
      setNewItemDescription('');
      setNewItemPrice('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Menu Items</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleAddItem}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Add Item
          </button>
        </div>

        <div className="mt-4">
          {menuItems.map((item) => (
            <div key={item.id} className="p-2 border rounded mb-2">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
              <div>Rp {item.price}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 p-2 rounded mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MenuEditor; 