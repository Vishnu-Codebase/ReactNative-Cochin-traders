// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://cochin-express.vercel.app/api',
  API_KEY: '2a54ff0c0b16c5eccf1f88c633119f3c37c3b9a697c89e875a48b435400bb755',
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health & Stats
  HEALTH: '/health',
  STATS: '/stats',
  
  // Companies
  COMPANIES: '/companies',
  COMPANY_NAMES: '/company-names',
  COMPANIES_DATA: '/companies-data',
  COMPANY: (name: string) => `/company/${encodeURIComponent(name)}`,
  DELETE_COMPANY: (name: string) => `/company/${encodeURIComponent(name)}`,
  
  // Data by Company
  LEDGERS: (name: string) => `/ledgers/${encodeURIComponent(name)}`,
  STOCKS: (name: string) => `/stocks/${encodeURIComponent(name)}`,
  STOCKS_WITH_BATCH: (name: string) => `/stocks-with-batch/${encodeURIComponent(name)}`,
  PARTIES: (name: string) => `/parties/${encodeURIComponent(name)}`,
  
  // Batches
  ADD_BATCHES: '/add-batches',
  GET_BATCHES: (companyName: string, stockItem: string) => 
    `/batches/${encodeURIComponent(companyName)}/${encodeURIComponent(stockItem)}`,
  GET_ALL_BATCHES: (companyName: string) => `/get-batches/${encodeURIComponent(companyName)}`,
  
  // Orders
  PLACE_ORDER: (companyName: string, shopName: string) => 
    `/orders/${encodeURIComponent(companyName)}/${encodeURIComponent(shopName)}`,
  SEND_ORDER: '/send-order',
  
  // Collection & Punch-in
  SEND_COLLECTION: '/send-collection',
  COLLECTION: '/collection',
  PUNCH_IN: '/punch-in',
  
  // Counts
  COUNT_COMPANIES: '/counts/companies',
  COUNT_LEDGERS: '/counts/ledgers',
  COUNT_STOCKS: '/counts/stocks',
  COUNT_PARTIES: '/counts/parties',
};

// Storage Keys
export const STORAGE_KEYS = {
  SELECTED_COMPANY: '@selected_company',
  USER_PREFERENCES: '@user_preferences',
  CACHED_COMPANIES: '@cached_companies',
  LAST_SYNC: '@last_sync',
};

// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'Cochin Traders',
  VERSION: '1.0.0',
  REFRESH_INTERVAL: 300000, // 5 minutes
};