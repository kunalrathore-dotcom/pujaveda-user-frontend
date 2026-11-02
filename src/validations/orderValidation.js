import { isValidIndianPin, isValidPhone } from "./commonValidation";

export const validateCheckoutAddress = ({ name, phone, street, city, state, postalCode }) => {
  const errors = {};

  const cleanName = name ? String(name).trim() : "";
  if (!cleanName) {
    errors.name = "Please enter the recipient's name.";
  } else if (cleanName.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  }

  const cleanPhone = phone ? String(phone).trim() : "";
  if (!cleanPhone) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(cleanPhone)) {
    errors.phone = "Please enter a valid 10-digit mobile number.";
  }

  const cleanStreet = street ? String(street).trim() : "";
  if (!cleanStreet) {
    errors.street = "Please enter your street or house address.";
  } else if (cleanStreet.length < 3) {
    errors.street = "Street address must be at least 3 characters.";
  }

  const cleanCity = city ? String(city).trim() : "";
  if (!cleanCity) {
    errors.city = "Please enter your city.";
  }

  const cleanState = state ? String(state).trim() : "";
  if (!cleanState) {
    errors.state = "Please enter your state.";
  }

  const cleanPin = postalCode ? String(postalCode).trim() : "";
  if (!cleanPin) {
    errors.postalCode = "Please enter your 6-digit PIN code.";
  } else if (!isValidIndianPin(cleanPin)) {
    errors.postalCode = "Please enter a valid 6-digit PIN code.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

