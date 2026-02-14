export const DEBOUNCE_TIME_MS = 500;
export const MAX_SCRAPE_PAGES = 500;
export const MAX_DISPLAYED_PRODUCTS = 10;
export const SCRAPE_TIMEOUT_MS = 60000;
export const NAVIGATION_TIMEOUT_MS = 30000;
export const SELECTOR_TIMEOUT_MS = 10000;

export const ANMAT_SELECTORS = {
  searchButton: '#ctl00_ContentPlaceHolder1_cmdBuscar',
  resultsTable: '#ctl00_ContentPlaceHolder1_GridView1',
  nextPageLink: 'a[href*="Page$Next"]',
} as const;

export const ANMAT_URL = 'https://listadoalg.anmat.gob.ar/Home';

export const REDIS_KEY_PREFIX = 'sintacc:v1:';

export const PRODUCT_STATUS = {
  VIGENTE: 'VIGENTE',
} as const;
