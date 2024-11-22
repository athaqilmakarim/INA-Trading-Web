export const UserType = {
  ADMIN: "Admin",
  B2C_CONSUMER: "B2C Consumer (Foreign Consumer)",
  B2C_BUSINESS_OWNER: "B2C Business Owner",
  B2B_IMPORTER: "B2B Importer",
  B2B_SUPPLIER: "B2B Supplier/Exporter"
};

export const User = {
  id: '',
  email: '',
  userType: UserType.B2C_CONSUMER,
  createdAt: new Date()
}; 