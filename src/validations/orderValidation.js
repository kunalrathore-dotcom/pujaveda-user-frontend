import { isValidIndianPin } from "./commonValidation";

export const validateCheckoutAddress = ({ name, street, city, state, postalCode }) => {
  const errors = {};

  const cleanName = name ? String(name).trim() : "";
  if (!cleanName) {
    errors.name = "Please enter the recipient full name.";
  } else if (cleanName.length < 2) {
    errors.name = "Recipient name must be at least 2 characters.";
  }

  const cleanStreet = street ? String(street).trim() : "";
  if (!cleanStreet) {
    errors.street = "Please enter the delivery street address.";
  }

  const cleanCity = city ? String(city).trim() : "";
  if (!cleanCity) {
    errors.city = "Please enter the city.";
  }

  const cleanState = state ? String(state).trim() : "";
  if (!cleanState) {
    errors.state = "Please enter the state.";
  }

  const cleanPin = postalCode ? String(postalCode).trim() : "";
  if (!cleanPin) {
    errors.postalCode = "Please enter the 6-digit PIN code.";
  } else if (!isValidIndianPin(cleanPin)) {
    errors.postalCode = "Please enter a valid 6-digit Indian PIN code.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
