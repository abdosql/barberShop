export const validatePhoneNumber = (phoneNumber: string): string | null => {
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneNumber) {
    return "Le numéro de téléphone est requis.";
  }
  if (!phoneRegex.test(phoneNumber)) {
    return "Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Le mot de passe ne doit pas être vide.";
  }
  if (password.length < 3) {
    return "Le mot de passe doit contenir au moins 3 caractères.";
  }
  return null;
};