export const validateProfileUpdate = ({ name, phone }) => {
  const errors = {};

  const cleanName = name ? String(name).trim() : "";
  if (!cleanName) {
    errors.name = "Please enter your name.";
  } else if (cleanName.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAvatarFile = (file) => {
  if (!file) {
    return { isValid: false, error: "Please select an image file to upload." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Please select a supported image format (JPEG, PNG, or WebP)." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: "Profile photo cannot exceed 5MB." };
  }

  return { isValid: true, error: null };
};

