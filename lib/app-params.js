const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const STORAGE_PREFIX = 'tracesafe';
const LEGACY_STORAGE_PREFIX = 'base44';

const storageKeyFor = (paramName) => `${STORAGE_PREFIX}_${toSnakeCase(paramName)}`;
const legacyStorageKeyFor = (paramName) => `${LEGACY_STORAGE_PREFIX}_${toSnakeCase(paramName)}`;

const migrateLegacyAppParam = (paramName) => {
  if (isNode) return;
  const next = storageKeyFor(paramName);
  const prev = legacyStorageKeyFor(paramName);
  if (storage.getItem(next) == null && storage.getItem(prev) != null) {
    storage.setItem(next, storage.getItem(prev));
  }
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  migrateLegacyAppParam(paramName);
  const storageKey = storageKeyFor(paramName);
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''
      }${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
};

const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

const getAppParams = () => {
  if (getAppParamValue('clear_access_token') === 'true') {
    storage.removeItem('tracesafe_access_token');
    storage.removeItem('base44_access_token');
    storage.removeItem('token');
  }
  return {
    appId: getAppParamValue('app_id', {
      defaultValue: env.VITE_APP_ID ?? env.VITE_BASE44_APP_ID,
    }),
    token: getAppParamValue('access_token', { removeFromUrl: true }),
    fromUrl: getAppParamValue('from_url', { defaultValue: typeof window !== 'undefined' ? window.location.href : '' }),
    functionsVersion: getAppParamValue('functions_version', {
      defaultValue: env.VITE_FUNCTIONS_VERSION ?? env.VITE_BASE44_FUNCTIONS_VERSION,
    }),
    appBaseUrl: getAppParamValue('app_base_url', {
      defaultValue: env.VITE_APP_API_BASE_URL ?? env.VITE_BASE44_APP_BASE_URL,
    }),
  };
};

export const appParams = {
  ...getAppParams(),
};
