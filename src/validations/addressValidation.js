import { isValidIndianPin, isValidPhone } from "./commonValidation";

export const validateAddressForm = (form, existingAddressesCount = 0, isEditing = false) => {
  const errors = {};

  if (!isEditing && existingAddressesCount >= 3) {
    errors.general = "You can save a maximum of 3 addresses in your account.";
    return { isValid: false, errors };
  }

  const name = form.name ? String(form.name).trim() : "";
  if (!name) {
    errors.name = "Please enter the recipient's name.";
  } else if (name.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  }

  const phone = form.phone ? String(form.phone).trim() : "";
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Please enter a valid 10-digit mobile number.";
  }

  const street = form.street ? String(form.street).trim() : "";
  if (!street) {
    errors.street = "Please enter your street or house address.";
  } else if (street.length < 3) {
    errors.street = "Street address must be at least 3 characters.";
  }

  const city = form.city ? String(form.city).trim() : "";
  if (!city) {
    errors.city = "Please enter your city.";
  }

  const state = form.state ? String(form.state).trim() : "";
  if (!state) {
    errors.state = "Please enter your state.";
  }

  const postalCode = form.postalCode ? String(form.postalCode).trim() : "";
  if (!postalCode) {
    errors.postalCode = "Please enter your 6-digit PIN code.";
  } else if (!isValidIndianPin(postalCode)) {
    errors.postalCode = "Please enter a valid 6-digit PIN code.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

