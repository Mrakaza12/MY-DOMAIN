export const locales = [
  { code: "en-GB", label: "English (UK)", short: "English", flag: "🇬🇧" },
  { code: "en-US", label: "English (US)", short: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", label: "Español", short: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "Français", short: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "Deutsch", short: "Deutsch", flag: "🇩🇪" },
  { code: "pt-BR", label: "Português", short: "Português", flag: "🇧🇷" },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];
export const DEFAULT_LOCALE: LocaleCode = "en-GB";

export type AuthStrings = {
  emailPlaceholder: string;
  passwordPlaceholder: string;
  forgotEmail: string;
  forgotPassword: string;
  next: string;
  or: string;
  signUp: string;
  logIn: string;
  changeEmail: string;
  signedInAs: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordIncorrect: string;
  accountNotFound: string;
  firstNameRequired: string;
  lastNameRequired: string;
  passwordTooShort: string;
  passwordMismatch: string;
  emailTaken: string;
  termsRequired: string;
  phoneInvalid: string;
  firstName: string;
  lastName: string;
  createPassword: string;
  confirmPassword: string;
  mobileOptional: string;
  country: string;
  terms: string;
  createAccount: string;
  alreadyHaveAccount: string;
  welcomeBack: string;
  enterPasswordFor: string;
};

const en: AuthStrings = {
  emailPlaceholder: "Email address or mobile number",
  passwordPlaceholder: "Password",
  forgotEmail: "Forgotten your email address?",
  forgotPassword: "Forgotten your password?",
  next: "Next",
  or: "or",
  signUp: "Sign Up",
  logIn: "Log In",
  changeEmail: "Change email or mobile number",
  signedInAs: "Signed in as",
  emailRequired: "Please enter your email address or mobile number.",
  emailInvalid: "That doesn't look like a valid email address or mobile number.",
  passwordRequired: "Please enter your password.",
  passwordIncorrect: "The password you entered isn't correct. Please try again.",
  accountNotFound: "We couldn't find an account with those details.",
  firstNameRequired: "Please enter your first name.",
  lastNameRequired: "Please enter your last name.",
  passwordTooShort: "Your password needs to be at least 8 characters.",
  passwordMismatch: "Those passwords don't match. Please try again.",
  emailTaken: "An account with this email already exists.",
  termsRequired: "Please accept the user agreement to continue.",
  phoneInvalid: "Please enter a valid mobile number.",
  firstName: "First name",
  lastName: "Last name",
  createPassword: "Create password",
  confirmPassword: "Confirm password",
  mobileOptional: "Mobile number (optional)",
  country: "Country of residence",
  terms: "I agree to the User Agreement and Privacy Policy.",
  createAccount: "Create Account",
  alreadyHaveAccount: "Already have an account?",
  welcomeBack: "Welcome back",
  enterPasswordFor: "Enter your password to continue",
};

const overrides: Partial<Record<LocaleCode, Partial<AuthStrings>>> = {
  "en-US": {
    emailPlaceholder: "Email address or mobile number",
    forgotEmail: "Forgot your email address?",
    forgotPassword: "Forgot your password?",
    mobileOptional: "Mobile number (optional)",
  },
  "es-ES": {
    emailPlaceholder: "Correo electrónico o número de móvil",
    passwordPlaceholder: "Contraseña",
    forgotEmail: "¿Olvidaste tu correo electrónico?",
    forgotPassword: "¿Olvidaste tu contraseña?",
    next: "Siguiente",
    or: "o",
    signUp: "Registrarse",
    logIn: "Iniciar sesión",
    changeEmail: "Cambiar correo o número de móvil",
    signedInAs: "Sesión iniciada como",
    welcomeBack: "Bienvenido de nuevo",
    enterPasswordFor: "Introduce tu contraseña para continuar",
    firstName: "Nombre",
    lastName: "Apellidos",
    createPassword: "Crear contraseña",
    confirmPassword: "Confirmar contraseña",
    mobileOptional: "Número de móvil (opcional)",
    country: "País de residencia",
    terms: "Acepto el Acuerdo de usuario y la Política de privacidad.",
    createAccount: "Crear cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    emailRequired: "Introduce tu correo electrónico o número de móvil.",
    emailInvalid: "Introduce un correo electrónico o número de móvil válido.",
    passwordRequired: "Introduce tu contraseña.",
    passwordIncorrect: "La contraseña no es correcta. Inténtalo de nuevo.",
    accountNotFound: "No encontramos ninguna cuenta con esos datos.",
  },
  "fr-FR": {
    emailPlaceholder: "Adresse e-mail ou numéro de mobile",
    passwordPlaceholder: "Mot de passe",
    forgotEmail: "Adresse e-mail oubliée ?",
    forgotPassword: "Mot de passe oublié ?",
    next: "Suivant",
    or: "ou",
    signUp: "S'inscrire",
    logIn: "Se connecter",
    changeEmail: "Modifier l'e-mail ou le numéro de mobile",
    signedInAs: "Connecté en tant que",
    welcomeBack: "Bon retour",
    enterPasswordFor: "Saisissez votre mot de passe pour continuer",
    firstName: "Prénom",
    lastName: "Nom",
    createPassword: "Créer un mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    mobileOptional: "Numéro de mobile (facultatif)",
    country: "Pays de résidence",
    terms: "J'accepte le Contrat d'utilisation et la Politique de confidentialité.",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    emailRequired: "Saisissez votre adresse e-mail ou votre numéro de mobile.",
    emailInvalid: "Saisissez une adresse e-mail ou un numéro valide.",
    passwordRequired: "Saisissez votre mot de passe.",
    passwordIncorrect: "Mot de passe incorrect. Veuillez réessayer.",
    accountNotFound: "Aucun compte ne correspond à ces informations.",
  },
  "de-DE": {
    emailPlaceholder: "E-Mail-Adresse oder Handynummer",
    passwordPlaceholder: "Passwort",
    forgotEmail: "E-Mail-Adresse vergessen?",
    forgotPassword: "Passwort vergessen?",
    next: "Weiter",
    or: "oder",
    signUp: "Registrieren",
    logIn: "Anmelden",
    changeEmail: "E-Mail oder Handynummer ändern",
    signedInAs: "Angemeldet als",
    welcomeBack: "Willkommen zurück",
    enterPasswordFor: "Geben Sie Ihr Passwort ein, um fortzufahren",
    firstName: "Vorname",
    lastName: "Nachname",
    createPassword: "Passwort erstellen",
    confirmPassword: "Passwort bestätigen",
    mobileOptional: "Handynummer (optional)",
    country: "Wohnsitzland",
    terms: "Ich stimme der Nutzungsvereinbarung und der Datenschutzrichtlinie zu.",
    createAccount: "Konto erstellen",
    alreadyHaveAccount: "Sie haben bereits ein Konto?",
    emailRequired: "Bitte geben Sie Ihre E-Mail-Adresse oder Handynummer ein.",
    emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse oder Handynummer ein.",
    passwordRequired: "Bitte geben Sie Ihr Passwort ein.",
    passwordIncorrect: "Das Passwort ist falsch. Bitte versuchen Sie es erneut.",
    accountNotFound: "Zu diesen Angaben wurde kein Konto gefunden.",
  },
  "pt-BR": {
    emailPlaceholder: "E-mail ou número de celular",
    passwordPlaceholder: "Senha",
    forgotEmail: "Esqueceu seu e-mail?",
    forgotPassword: "Esqueceu sua senha?",
    next: "Avançar",
    or: "ou",
    signUp: "Cadastrar-se",
    logIn: "Entrar",
    changeEmail: "Alterar e-mail ou celular",
    signedInAs: "Conectado como",
    welcomeBack: "Bem-vindo de volta",
    enterPasswordFor: "Digite sua senha para continuar",
    firstName: "Nome",
    lastName: "Sobrenome",
    createPassword: "Criar senha",
    confirmPassword: "Confirmar senha",
    mobileOptional: "Celular (opcional)",
    country: "País de residência",
    terms: "Aceito o Contrato do Usuário e a Política de Privacidade.",
    createAccount: "Criar conta",
    alreadyHaveAccount: "Já tem uma conta?",
    emailRequired: "Digite seu e-mail ou número de celular.",
    emailInvalid: "Digite um e-mail ou número de celular válido.",
    passwordRequired: "Digite sua senha.",
    passwordIncorrect: "A senha está incorreta. Tente novamente.",
    accountNotFound: "Não encontramos uma conta com esses dados.",
  },
};

export function isLocale(value: string | undefined): value is LocaleCode {
  return locales.some((locale) => locale.code === value);
}

export function getLocale(value: string | undefined): LocaleCode {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getStrings(locale: string | undefined): AuthStrings {
  const code = getLocale(locale);
  return { ...en, ...(overrides[code] ?? {}) };
}
