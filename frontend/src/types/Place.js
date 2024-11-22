export const PlaceType = {
  RESTAURANT: "restaurant",
  SHOP: "shop",
  CULTURAL: "cultural",
  BUSINESS: "business",
  WORSHIP: "worship"
};

export const MenuItem = {
  id: '',
  name: '',
  description: '',
  price: 0
};

export const Place = {
  id: '',
  name: '',
  type: PlaceType.RESTAURANT,
  address: '',
  contact: '',
  description: '',
  menu: [],
  rating: 0,
  createdAt: new Date(),
  ownerId: '',
  status: 'pending',
  coordinate: {
    latitude: 0,
    longitude: 0
  }
}; 