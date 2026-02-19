export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
};
