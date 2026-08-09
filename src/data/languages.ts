export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', nativeName: 'English', short: 'EN' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', short: 'HI' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', short: 'BN' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', short: 'TA' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', short: 'TE' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', short: 'MR' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', short: 'GU' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', short: 'KN' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', short: 'ML' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', short: 'PA' },
  { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', short: 'OR' },
  { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو', short: 'UR' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export function getLanguage(code: string) {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code) || SUPPORTED_LANGUAGES[0];
}
