export const PlaceType = {
  RESTAURANT: "Restaurant",
  SHOP: "Shop",
  CULTURAL: "Cultural",
  BUSINESS: "Business",
  WORSHIP: "Worship"
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