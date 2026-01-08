export const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  const phoneRegex = /^(09|\+639)\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const isProfileComplete = (user: {
  phone?: string | null;
  barangay?: string | null;
  street?: string | null;
}): boolean => {
  return !!(user.phone && user.barangay && user.street);
};
