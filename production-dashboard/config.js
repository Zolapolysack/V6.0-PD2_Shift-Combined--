/**
 * Production Dashboard - Configuration File
 * ไฟล์ config หลักสำหรับตั้งค่าระบบ
 * Version: 1.0.0
 * 
 * คำแนะนำ:
 * 1. แก้ไข API_URL ให้ตรงกับ Google Apps Script Web App URL ของคุณ
 * 2. ปรับค่า CACHE_DURATION ตามความต้องการ
 * 3. เปิด DEBUG_MODE = true เมื่อต้องการ debug
 */

// ========================================
// API CONFIGURATION
// ========================================

/**
 * Google Apps Script Web App URL
 * ✅ DEPLOYED: URL updated with actual deployment
 * 
 * Deployment Info:
 * - Date: 2026-02-09 15:20
 * - Version: 2.0.3 (Fixed machineNo type + Bug fixes)
 * - Status: Active
 * - Changes: 
 *   1. Fixed merge by brand+machineNo (each machine shown separately)
 *   2. Changed all "หลา" to "เมตร"
 *   3. Fixed localeCompare error (convert machineNo to string)
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbxqdy6kx-bWccNV3rp1pyp8-Zc97fxQX2W1pkWcQ80jY5DVnQUKq5HSq8QAMfAVjqRn/exec';

/**
 * API Request Timeout (milliseconds)
 * ระยะเวลาที่รอ response จาก API ก่อนจะ timeout
 */
const API_TIMEOUT = 30000; // 30 seconds

/**
 * API Retry Configuration
 * การตั้งค่าสำหรับลองใหม่เมื่อ request ล้มเหลว
 */
const API_RETRY = {
  maxRetries: 3,           // จำนวนครั้งที่ลองใหม่
  retryDelay: 1000,        // เวลารอระหว่างการลอง (ms)
  retryableStatus: [408, 429, 500, 502, 503, 504] // HTTP status ที่ควรลองใหม่
};

// ========================================
// APPLICATION SETTINGS
// ========================================

/**
 * Application Information
 */
const APP_CONFIG = {
  name: 'Production Dashboard PD2',
  version: '1.0.0',
  author: 'ZP1048 - Production Team',
  description: 'ระบบแสดงข้อมูลยอดผลิตแผนก PD2'
};

/**
 * Debug Mode
 * เปิดเพื่อดู console.log และข้อมูล debug
 */
const DEBUG_MODE = false;

/**
 * Environment
 * 'development' | 'production'
 */
const ENVIRONMENT = 'production';

// ========================================
// DISPLAY SETTINGS
// ========================================

/**
 * Date & Time Configuration
 */
const DATE_CONFIG = {
  format: 'DD/MM/YYYY',              // รูปแบบวันที่แสดง
  inputFormat: 'YYYY-MM-DD',         // รูปแบบวันที่ส่งไป API
  locale: 'th-TH',                   // Locale สำหรับ Date
  timezone: 'Asia/Bangkok',          // Timezone
  firstDayOfWeek: 1,                 // 0 = อาทิตย์, 1 = จันทร์
};

/**
 * Number Format Configuration
 */
const NUMBER_CONFIG = {
  locale: 'th-TH',
  decimals: 2,                       // จำนวนทศนิยม
  thousandSeparator: ',',            // ตัวคั่นหลักพัน
  decimalSeparator: '.',             // ตัวคั่นทศนิยม
};

/**
 * Table Configuration
 */
const TABLE_CONFIG = {
  rowsPerPage: 50,                   // จำนวนแถวต่อหน้า
  showPagination: true,              // แสดง pagination
  sortable: true,                    // เปิดใช้งานการเรียงลำดับ
  filterable: true,                  // เปิดใช้งานการกรอง
  exportable: true,                  // เปิดใช้งานการ export
};

// ========================================
// CACHE SETTINGS
// ========================================

/**
 * Cache Configuration
 * การตั้งค่า cache สำหรับประหยัด API calls
 */
const CACHE_CONFIG = {
  enabled: true,                     // เปิดใช้งาน cache
  duration: 5 * 60 * 1000,          // ระยะเวลา cache (5 นาที)
  storageType: 'sessionStorage',     // 'sessionStorage' | 'localStorage'
  keyPrefix: 'pd2_dashboard_',       // prefix สำหรับ cache key
};

// ========================================
// UI/UX SETTINGS
// ========================================

/**
 * Loading Configuration
 */
const LOADING_CONFIG = {
  showSpinner: true,                 // แสดง loading spinner
  minimumDuration: 500,              // ระยะเวลา loading ขั้นต่ำ (ms)
  overlayOpacity: 0.8,               // ความโปร่งใสของ overlay
};

/**
 * Toast Notification Configuration
 */
const TOAST_CONFIG = {
  duration: 3000,                    // ระยะเวลาแสดง toast (ms)
  position: 'top-right',             // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  autoClose: true,                   // ปิดอัตโนมัติ
  pauseOnHover: true,                // หยุดนับเวลาเมื่อ hover
  showProgress: true,                // แสดง progress bar
};

/**
 * Animation Configuration
 */
const ANIMATION_CONFIG = {
  enabled: true,                     // เปิดใช้งาน animation
  duration: 300,                     // ระยะเวลา animation (ms)
  easing: 'ease-in-out',            // timing function
};

// ========================================
// CHART SETTINGS (สำหรับอนาคต)
// ========================================

/**
 * Chart Configuration
 * ใช้สำหรับ Chart.js หรือ library อื่นๆ
 */
const CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  colors: [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ],
  defaultType: 'bar',                // 'bar' | 'line' | 'pie' | 'doughnut'
};

// ========================================
// GOOGLE SHEETS CONFIGURATION
// ========================================

/**
 * Google Sheets Structure
 * โครงสร้างคอลัมน์ที่คาดหวัง
 */
const SHEETS_CONFIG = {
  shiftA: {
    name: 'กะ A',
    columns: {
      date: 0,              // Column A
      brandCode: 1,         // Column B
      brandName: 2,         // Column C
      quantity: 3,          // Column D
      unit: 4,              // Column E
      note: 5,              // Column F
    }
  },
  shiftB: {
    name: 'กะ B',
    columns: {
      date: 0,
      brandCode: 1,
      brandName: 2,
      quantity: 3,
      unit: 4,
      note: 5,
    }
  }
};

// ========================================
// VALIDATION RULES
// ========================================

/**
 * Data Validation Rules
 */
const VALIDATION_RULES = {
  date: {
    required: true,
    minDate: '2020-01-01',
    maxDate: null,                    // null = no limit
  },
  shift: {
    required: true,
    allowedValues: ['A', 'B'],
  },
  quantity: {
    min: 0,
    max: 999999,
    decimals: 2,
  },
  brandCode: {
    required: true,
    pattern: /^[A-Z0-9-]+$/,         // ตัวอักษรใหญ่, ตัวเลข, และ dash
    minLength: 3,
    maxLength: 20,
  }
};

// ========================================
// ERROR MESSAGES (ภาษาไทย)
// ========================================

const ERROR_MESSAGES = {
  // API Errors
  apiTimeout: 'หมดเวลารอข้อมูล กรุณาลองใหม่อีกครั้ง',
  apiError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่',
  networkError: 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้',
  serverError: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง',
  
  // Validation Errors
  dateRequired: 'กรุณาเลือกวันที่',
  shiftRequired: 'กรุณาเลือกกะ',
  invalidDate: 'รูปแบบวันที่ไม่ถูกต้อง',
  invalidShift: 'กะไม่ถูกต้อง กรุณาเลือก A หรือ B',
  
  // Data Errors
  noData: 'ไม่พบข้อมูลในวันที่และกะที่เลือก',
  emptyResponse: 'ไม่มีข้อมูลที่จะแสดง',
  invalidData: 'ข้อมูลที่ได้รับไม่ถูกต้อง',
  
  // General Errors
  unknown: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
};

// ========================================
// SUCCESS MESSAGES (ภาษาไทย)
// ========================================

const SUCCESS_MESSAGES = {
  dataLoaded: 'โหลดข้อมูลสำเร็จ',
  dataRefreshed: 'รีเฟรชข้อมูลสำเร็จ',
  exportSuccess: 'ส่งออกข้อมูลสำเร็จ',
};

// ========================================
// FEATURE FLAGS
// ========================================

/**
 * Feature Toggles
 * เปิด/ปิด feature ต่างๆ
 */
const FEATURES = {
  showCharts: true,                  // แสดง charts
  allowExport: true,                 // อนุญาตให้ export ข้อมูล
  allowPrint: true,                  // อนุญาตให้พิมพ์
  showStatistics: true,              // แสดงสถิติ
  enableOfflineMode: false,          // โหมด offline (future)
  enableNotifications: true,         // การแจ้งเตือน
  enableAutoRefresh: false,          // รีเฟรชอัตโนมัติ
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * ดึงค่า config แบบ safe (มี default value)
 * @param {string} key - config key
 * @param {*} defaultValue - default value ถ้าไม่พบ key
 */
function getConfig(key, defaultValue = null) {
  const keys = key.split('.');
  let value = window;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value !== undefined ? value : defaultValue;
}

/**
 * Validate configuration
 * ตรวจสอบว่า config สำคัญครบถ้วน
 */
function validateConfig() {
  const errors = [];
  
  // Check API URL
  if (!API_URL || API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    errors.push('⚠️ API_URL ยังไม่ได้กำหนด กรุณาแก้ไขใน config.js');
  }
  
  // Check required configs
  if (!APP_CONFIG.name) {
    errors.push('⚠️ APP_CONFIG.name ต้องกำหนด');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach(err => console.error(err));
    return false;
  }
  
  if (DEBUG_MODE) {
    console.log('✅ Configuration validated successfully');
  }
  
  return true;
}

/**
 * Log configuration (debug mode only)
 */
function logConfig() {
  if (!DEBUG_MODE) return;
  
  console.group('📋 Configuration');
  console.log('App:', APP_CONFIG);
  console.log('Environment:', ENVIRONMENT);
  console.log('API URL:', API_URL);
  console.log('Cache:', CACHE_CONFIG.enabled ? 'Enabled' : 'Disabled');
  console.log('Features:', FEATURES);
  console.groupEnd();
}

// ========================================
// INITIALIZATION
// ========================================

// Validate config on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    validateConfig();
    logConfig();
  });
}

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_URL,
    API_TIMEOUT,
    API_RETRY,
    APP_CONFIG,
    DEBUG_MODE,
    ENVIRONMENT,
    DATE_CONFIG,
    NUMBER_CONFIG,
    TABLE_CONFIG,
    CACHE_CONFIG,
    LOADING_CONFIG,
    TOAST_CONFIG,
    ANIMATION_CONFIG,
    CHART_CONFIG,
    SHEETS_CONFIG,
    VALIDATION_RULES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    FEATURES,
    getConfig,
    validateConfig,
    logConfig,
  };
}

// ========================================
// CONSOLE INFO
// ========================================

console.log(`✅ ${APP_CONFIG.name} v${APP_CONFIG.version} - Config loaded`);
if (DEBUG_MODE) {
  console.log('🔧 Debug mode is ON');
}
