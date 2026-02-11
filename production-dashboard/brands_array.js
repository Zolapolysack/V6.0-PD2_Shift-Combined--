/**
 * Production Dashboard - Brands & Products Data
 * ข้อมูลรหัสผ้า สี และข้อมูลที่เกี่ยวข้องสำหรับการผลิต
 * Version: 1.0.0
 */

// ========================================
// BRANDS DATA - รหัสผ้าทั้งหมด
// ========================================
const BRANDS_ARRAY = [
  // PD1 Series
  { code: "PD1-001", name: "ผ้าซับใน Premium", color: "#ffffff", category: "PD1" },
  { code: "PD1-002", name: "ผ้าซับใน Standard", color: "#f0f0f0", category: "PD1" },
  { code: "PD1-003", name: "ผ้าซับใน Economy", color: "#e0e0e0", category: "PD1" },
  
  // PD2 Series - Main Production
  { code: "PD2-101", name: "ผ้าคอตตอน 100%", color: "#ffffff", category: "PD2" },
  { code: "PD2-102", name: "ผ้าโพลีเอสเตอร์", color: "#f5f5f5", category: "PD2" },
  { code: "PD2-103", name: "ผ้าผสม Cotton-Poly", color: "#fafafa", category: "PD2" },
  { code: "PD2-201", name: "ผ้าสีดำ Premium", color: "#000000", category: "PD2" },
  { code: "PD2-202", name: "ผ้าสีกรมท่า", color: "#1e3a8a", category: "PD2" },
  { code: "PD2-203", name: "ผ้าสีเทา", color: "#6b7280", category: "PD2" },
  { code: "PD2-204", name: "ผ้าสีน้ำเงิน", color: "#3b82f6", category: "PD2" },
  { code: "PD2-301", name: "ผ้าลายทาง", color: "#e5e7eb", category: "PD2" },
  { code: "PD2-302", name: "ผ้าลายจุด", color: "#d1d5db", category: "PD2" },
  { code: "PD2-303", name: "ผ้าลายดอก", color: "#fecaca", category: "PD2" },
  
  // PD3 Series
  { code: "PD3-401", name: "ผ้ายืด Spandex", color: "#dbeafe", category: "PD3" },
  { code: "PD3-402", name: "ผ้ายืด 4 ทิศ", color: "#bfdbfe", category: "PD3" },
  { code: "PD3-501", name: "ผ้ากันน้ำ", color: "#93c5fd", category: "PD3" },
  { code: "PD3-502", name: "ผ้ากันรังสี UV", color: "#60a5fa", category: "PD3" },
  
  // Special Series
  { code: "SP-001", name: "ผ้าพิเศษ Premium Plus", color: "#fef3c7", category: "SPECIAL" },
  { code: "SP-002", name: "ผ้าพิเศษ Gold Edition", color: "#fde047", category: "SPECIAL" },
  { code: "SP-003", name: "ผ้าพิเศษ Limited", color: "#facc15", category: "SPECIAL" },
];

// ========================================
// CATEGORY MAPPING
// ========================================
const CATEGORIES = {
  PD1: { name: "PD1 - ผ้าซับใน", color: "#10b981", icon: "📦" },
  PD2: { name: "PD2 - ผ้าหลัก", color: "#3b82f6", icon: "🏭" },
  PD3: { name: "PD3 - ผ้าพิเศษ", color: "#8b5cf6", icon: "⚡" },
  SPECIAL: { name: "Special - ผ้าพรีเมียม", color: "#f59e0b", icon: "⭐" }
};

// ========================================
// SHIFT CONFIGURATIONS
// ========================================
const SHIFT_CONFIG = {
  A: {
    name: "กะ A",
    time: "08:00 - 16:00",
    color: "#10b981",
    icon: "🌅"
  },
  B: {
    name: "กะ B", 
    time: "16:00 - 00:00",
    color: "#ef4444",
    icon: "🌆"
  }
};

// ========================================
// UNIT TYPES
// ========================================
const UNIT_TYPES = {
  METER: { name: "เมตร", symbol: "m", abbr: "M" },
  YARD: { name: "หลา", symbol: "yd", abbr: "Y" },
  ROLL: { name: "ม้วน", symbol: "rolls", abbr: "R" },
  PIECE: { name: "ชิ้น", symbol: "pcs", abbr: "P" }
};

// ========================================
// QUALITY GRADES
// ========================================
const QUALITY_GRADES = {
  A: { name: "เกรด A", description: "คุณภาพดีเยี่ยม", color: "#10b981", score: 100 },
  B: { name: "เกรด B", description: "คุณภาพดี", color: "#3b82f6", score: 85 },
  C: { name: "เกรด C", description: "คุณภาพปานกลาง", color: "#f59e0b", score: 70 },
  D: { name: "เกรด D", description: "คุณภาพต่ำ", color: "#ef4444", score: 50 }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * หารหัสผ้าจาก code
 * @param {string} code - รหัสผ้า
 * @returns {object|null} - ข้อมูลผ้า หรือ null ถ้าไม่พบ
 */
function findBrandByCode(code) {
  return BRANDS_ARRAY.find(brand => brand.code === code) || null;
}

/**
 * กรองรหัสผ้าตาม category
 * @param {string} category - ชื่อ category
 * @returns {array} - อาร์เรย์ของรหัสผ้าในหมวดหมู่นั้น
 */
function filterBrandsByCategory(category) {
  return BRANDS_ARRAY.filter(brand => brand.category === category);
}

/**
 * ค้นหารหัสผ้าจากชื่อ (partial match)
 * @param {string} searchTerm - คำค้นหา
 * @returns {array} - อาร์เรย์ของรหัสผ้าที่ตรงกับการค้นหา
 */
function searchBrands(searchTerm) {
  const term = searchTerm.toLowerCase();
  return BRANDS_ARRAY.filter(brand => 
    brand.code.toLowerCase().includes(term) || 
    brand.name.toLowerCase().includes(term)
  );
}

/**
 * สร้าง dropdown options HTML สำหรับรหัสผ้า
 * @param {string} selectedCode - รหัสผ้าที่ถูกเลือก (optional)
 * @returns {string} - HTML options
 */
function generateBrandOptions(selectedCode = null) {
  const grouped = BRANDS_ARRAY.reduce((acc, brand) => {
    if (!acc[brand.category]) acc[brand.category] = [];
    acc[brand.category].push(brand);
    return acc;
  }, {});
  
  let html = '<option value="">-- เลือกรหัสผ้า --</option>';
  
  Object.keys(grouped).forEach(category => {
    const catInfo = CATEGORIES[category] || { name: category };
    html += `<optgroup label="${catInfo.icon || ''} ${catInfo.name}">`;
    grouped[category].forEach(brand => {
      const selected = brand.code === selectedCode ? 'selected' : '';
      html += `<option value="${brand.code}" ${selected}>${brand.code} - ${brand.name}</option>`;
    });
    html += '</optgroup>';
  });
  
  return html;
}

/**
 * Validate รหัสผ้า
 * @param {string} code - รหัสผ้าที่ต้องการตรวจสอบ
 * @returns {object} - { valid: boolean, message: string }
 */
function validateBrandCode(code) {
  if (!code || code.trim() === '') {
    return { valid: false, message: 'กรุณาระบุรหัสผ้า' };
  }
  
  const brand = findBrandByCode(code);
  if (!brand) {
    return { valid: false, message: `ไม่พบรหัสผ้า: ${code}` };
  }
  
  return { valid: true, message: 'รหัสผ้าถูกต้อง', brand };
}

/**
 * คำนวณสถิติการผลิตแบบง่าย
 * @param {array} productionData - ข้อมูลการผลิต
 * @returns {object} - สถิติต่างๆ
 */
function calculateProductionStats(productionData) {
  if (!Array.isArray(productionData) || productionData.length === 0) {
    return {
      totalItems: 0,
      totalQuantity: 0,
      averageQuantity: 0,
      uniqueBrands: 0
    };
  }
  
  const totalQuantity = productionData.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const uniqueBrands = new Set(productionData.map(item => item.brandCode)).size;
  
  return {
    totalItems: productionData.length,
    totalQuantity: totalQuantity.toFixed(2),
    averageQuantity: (totalQuantity / productionData.length).toFixed(2),
    uniqueBrands
  };
}

/**
 * Format ตัวเลขให้มี comma
 * @param {number} num - ตัวเลข
 * @returns {string} - ตัวเลขที่ format แล้ว
 */
function formatNumber(num) {
  return parseFloat(num).toLocaleString('th-TH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

/**
 * Format วันที่เป็นรูปแบบไทย
 * @param {Date|string} date - วันที่
 * @returns {string} - วันที่รูปแบบไทย
 */
function formatThaiDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    locale: 'th-TH'
  };
  return d.toLocaleDateString('th-TH', options);
}

/**
 * สร้างสีสุ่มสำหรับ chart
 * @param {number} count - จำนวนสี
 * @returns {array} - อาร์เรย์ของสี
 */
function generateChartColors(count) {
  const colors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRANDS_ARRAY,
    CATEGORIES,
    SHIFT_CONFIG,
    UNIT_TYPES,
    QUALITY_GRADES,
    findBrandByCode,
    filterBrandsByCategory,
    searchBrands,
    generateBrandOptions,
    validateBrandCode,
    calculateProductionStats,
    formatNumber,
    formatThaiDate,
    generateChartColors
  };
}

// ========================================
// CONSOLE LOG FOR DEBUGGING
// ========================================
console.log('✅ brands_array.js loaded successfully');
console.log(`📦 Total brands: ${BRANDS_ARRAY.length}`);
console.log(`📂 Categories: ${Object.keys(CATEGORIES).length}`);
