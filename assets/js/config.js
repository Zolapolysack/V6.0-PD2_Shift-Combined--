// Lightweight runtime config for PD2 Shift Combined
// Ensures a single source of API base URL (override via window.PD2_CONFIG before this script)
(function(){
  // If already provided somewhere earlier, honor that and exit
  if (window.PD2_CONFIG && window.PD2_CONFIG.API_BASE_URL) return;

  const isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost';

  // IMPORTANT: For production, you MUST deploy the /server directory to a Node.js hosting service
  // (like Vercel, Render, Heroku) and replace the placeholder URL below with your actual API server URL.
  // You can also set it at runtime without code changes using either:
  //   1) localStorage.setItem('PD2_API_URL', 'https://your-api.example.com')
  //   2) <meta name="pd2-api" content="https://your-api.example.com">
  const PRODUCTION_API_URL = 'https://YOUR_DEPLOYED_API_SERVER_URL_HERE';

  // Runtime override sources
  let metaApi = '';
  try { metaApi = (document.querySelector('meta[name="pd2-api"]') || {}).content || ''; } catch(_) {}
  let savedApi = '';
  try { savedApi = localStorage.getItem('PD2_API_URL') || ''; } catch(_) {}

  const chosen = savedApi || metaApi || PRODUCTION_API_URL;

  window.PD2_CONFIG = Object.assign({}, window.PD2_CONFIG || {}, {
    API_BASE_URL: isLocal ? 'http://127.0.0.1:8787' : (window.PD2_CONFIG?.API_BASE_URL || chosen),
    // Google Sheets configuration
    SHEET_ID: window.PD2_CONFIG?.SHEET_ID || 'YOUR_GOOGLE_SHEET_ID_HERE',
    // Default sheet names
    SHEETS: {
      SHIFT_A: 'Shift-A',
      SHIFT_B: 'Shift-B',
      REPORT: 'Report'
    },
    // ====COLOR CONFIGURATION - ปรับสีได้ที่นี่ =====
    // วิธีใช้: เปลี่ยนค่า hex code เช่น '#f97316' (สีส้ม) ให้เป็นสีที่ต้องการ
    COLORS: {
      // Primary button colors (ปุ่มหลัก)
      PRIMARY_BTN: '#00ff08ff', // สีส้ม (Orange)
      PRIMARY_BTN_HOVER: '#00ff08ff',
      
      // Shift A button colors (ปุ่มกะ A)
      SHIFT_A_BTN: '#16a34a', // สีเขียว (Green)
      SHIFT_A_BTN_HOVER: '#15803d',
      
      // Shift B button colors (ปุ่มกะ B)
      SHIFT_B_BTN: '#ef4444', // สีแดง (Red)
      SHIFT_B_BTN_HOVER: '#dc2626',
      
      // Report button colors (ปุ่มรายงาน)
      REPORT_BTN: '#6d28d9', // สีม่วง (Purple)
      REPORT_BTN_HOVER: '#5b21b6'
    }
  });
})();