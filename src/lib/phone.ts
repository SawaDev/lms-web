export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = cleanPhoneNumber(value);
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 6) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  if (phoneNumberLength < 9) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      5
    )}-${phoneNumber.slice(5)}`;
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
    2,
    5
  )}-${phoneNumber.slice(5, 7)}-${phoneNumber.slice(7, 9)}`;
};
