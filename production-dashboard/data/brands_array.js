/**
 * Static Brand Codes Data
 * รหัสผ้าที่ใช้ในระบบผลิต
 */

const BRANDS_ARRAY = [
  {
    code: '1425800',
    name: 'ผ้า 1425800',
    category: 'A',
    description: 'ผ้าประเภท 14-25-800'
  },
  {
    code: '1825800SM',
    name: 'ผ้า 1825800SM',
    category: 'A',
    description: 'ผ้าประเภท 18-25-800 SM'
  },
  {
    code: '1921720',
    name: 'ผ้า 1921720',
    category: 'B',
    description: 'ผ้าประเภท 19-21-720'
  },
  {
    code: '2021850',
    name: 'ผ้า 2021850',
    category: 'B',
    description: 'ผ้าประเภท 20-21-850'
  },
  {
    code: '2025800SM',
    name: 'ผ้า 2025800SM',
    category: 'B',
    description: 'ผ้าประเภท 20-25-800 SM'
  },
  {
    code: '2025800SMN',
    name: 'ผ้า 2025800SMN',
    category: 'B',
    description: 'ผ้าประเภท 20-25-800 SMN'
  },
  {
    code: '2025850',
    name: 'ผ้า 2025850',
    category: 'B',
    description: 'ผ้าประเภท 20-25-850'
  },
  {
    code: '2121670SM',
    name: 'ผ้า 2121670SM',
    category: 'C',
    description: 'ผ้าประเภท 21-21-670 SM'
  },
  {
    code: '2121670SMN',
    name: 'ผ้า 2121670SMN',
    category: 'C',
    description: 'ผ้าประเภท 21-21-670 SMN'
  },
  {
    code: '2321750',
    name: 'ผ้า 2321750',
    category: 'C',
    description: 'ผ้าประเภท 23-21-750'
  },
  {
    code: '2625800',
    name: 'ผ้า 2625800',
    category: 'D',
    description: 'ผ้าประเภท 26-25-800'
  },
  {
    code: '2625850SM',
    name: 'ผ้า 2625850SM',
    category: 'D',
    description: 'ผ้าประเภท 26-25-850 SM'
  },
  {
    code: '2825850',
    name: 'ผ้า 2825850',
    category: 'D',
    description: 'ผ้าประเภท 28-25-850'
  }
];

/**
 * Get all brand codes
 */
function getAllBrands() {
  return BRANDS_ARRAY;
}

/**
 * Get brand by code
 */
function getBrandByCode(code) {
  return BRANDS_ARRAY.find(brand => brand.code === code);
}

/**
 * Get brands by category
 */
function getBrandsByCategory(category) {
  return BRANDS_ARRAY.filter(brand => brand.category === category);
}

/**
 * Check if brand code exists
 */
function isBrandCodeValid(code) {
  return BRANDS_ARRAY.some(brand => brand.code === code);
}

/**
 * Get all brand codes as array
 */
function getBrandCodes() {
  return BRANDS_ARRAY.map(brand => brand.code);
}

/**
 * Get brand categories
 */
function getCategories() {
  const categories = [...new Set(BRANDS_ARRAY.map(brand => brand.category))];
  return categories.sort();
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.BRANDS_ARRAY = BRANDS_ARRAY;
  window.BrandUtils = {
    getAllBrands,
    getBrandByCode,
    getBrandsByCategory,
    isBrandCodeValid,
    getBrandCodes,
    getCategories
  };
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRANDS_ARRAY,
    getAllBrands,
    getBrandByCode,
    getBrandsByCategory,
    isBrandCodeValid,
    getBrandCodes,
    getCategories
  };
}