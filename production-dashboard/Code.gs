/**
 * Production Dashboard Backend API - Enhanced Version
 * Google Apps Script for fetching production data from Google Sheets
 * Version: 2.0.0 - Fixed for Dashboard Integration
 * 
 * ⚠️ IMPORTANT: Before deploying, update these Sheet IDs with your actual Google Sheets
 * 
 * Sheet URLs (EXAMPLE - Replace with yours):
 * - Shift A: https://docs.google.com/spreadsheets/d/YOUR_SHEET_A_ID/edit
 * - Shift B: https://docs.google.com/spreadsheets/d/YOUR_SHEET_B_ID/edit
 */

// ========================================
// CONFIGURATION - ⚠️ UPDATE THESE VALUES
// ========================================
const CONFIG = {
  // TODO: Replace with your actual Sheet IDs
  SHEET_A_ID: '1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc',
  SHEET_B_ID: '1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU',
  
  // Sheet names (tab names in Google Sheets)
  // ✅ Verified from apps-script-A-COMPLETE.js and apps-script-B-COMPLETE.js
  SHEET_A_NAME: 'แผนกผลิต2_กะA',
  SHEET_B_NAME: 'แผนกผลิต2_กะB',
  
  // Column mappings (0-indexed) - ✅ FIXED from Debug results
  // โครงสร้างจริงจาก Google Sheets (debugged 2026-02-09)
  COLUMNS: {
    DATE: 2,           // Column C: วันที่
    MACHINE_NO: 3,     // Column D: เครื่องทอ NO
    EMPLOYEE_A: 4,     // Column E: พนักงานทอ กะ A
    EMPLOYEE_B: 5,     // Column F: พนักงานทอ กะ B
    LOT_NO: 6,         // Column G: ขนาดหน้าผ้า (ใช้เป็น Lot.No/Brand Code) ← FIXED!
    // Column H: ว่างเปล่า (Lot.No header เท่านั้น)
    // Column I: เลขที่ใบสั่งผลิต
    
    // Shift A Data (กะ A) - Columns J, K are EMPTY, use meter calculations
    PRODUCTION_A: 9,   // Column J: ยอดทอ กะ A (ว่างเปล่า - ต้องคำนวณ)
    METER_START_A: 15, // Column P: มิเตอร์เริ่มงาน กะ A
    METER_END_A: 16,   // Column Q: มิเตอร์เลิกงาน กะ A
    CUTTING_LENGTH_A: 19, // Column T: ความยาวตัดม้วน กะ A
    
    // Shift B Data (กะ B)
    PRODUCTION_B: 10,  // Column K: ยอดทอ กะ B (ว่างเปล่า - ต้องคำนวณ)
    METER_START_B: 17, // Column R: มิเตอร์เริ่มงาน กะ B
    METER_END_B: 18,   // Column S: มิเตอร์เลิกงาน กะ B
    CUTTING_LENGTH_B: 20  // Column U: ความยาวตัดม้วน กะ B
  },
  
  // Cache duration (minutes)
  CACHE_DURATION: 5,
  
  // Enable debug logging
  DEBUG: true
};

// ========================================
// MAIN API HANDLERS
// ========================================

/**
 * Main doGet handler for HTTP GET requests
 * Supports both old format (dateA/dateB) and new format (date/shift)
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    
    // Support both API formats
    let date = params.date || null;
    let shift = params.shift || null;
    
    // Fallback to old format
    const dateA = params.dateA || null;
    const dateB = params.dateB || null;
    
    if (CONFIG.DEBUG) {
      Logger.log('=== API Request ===');
      Logger.log('Parameters: ' + JSON.stringify(params));
    }
    
    // Handle new format (date + shift)
    if (date && shift) {
      const data = getShiftData(date, shift.toUpperCase());
      
      return createResponse({
        success: true,
        data: data,
        metadata: {
          date: date,
          shift: shift,
          recordCount: data.length,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Handle old format (dateA + dateB)
    if (dateA || dateB) {
      const data = getProductionData(dateA, dateB);
      
      return createResponse({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    }
    
    // No valid parameters
    return createResponse({
      success: false,
      error: 'Missing required parameters. Use either: date & shift OR dateA & dateB',
      usage: {
        format1: '?date=2026-02-09&shift=A',
        format2: '?dateA=2026-02-09&dateB=2026-02-09'
      }
    }, 400);
    
  } catch (error) {
    Logger.log('❌ Error in doGet: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return createResponse({
      success: false,
      error: error.toString(),
      details: CONFIG.DEBUG ? error.stack : undefined
    }, 500);
  }
}


/**
 * Main doPost handler for HTTP POST requests
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const date = requestData.date || null;
    const shift = requestData.shift || null;
    const dateA = requestData.dateA || null;
    const dateB = requestData.dateB || null;
    
    if (CONFIG.DEBUG) {
      Logger.log('=== POST Request ===');
      Logger.log('Body: ' + JSON.stringify(requestData));
    }
    
    // New format
    if (date && shift) {
      const data = getShiftData(date, shift.toUpperCase());
      
      return createResponse({
        success: true,
        data: data,
        metadata: {
          date: date,
          shift: shift,
          recordCount: data.length,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Old format
    if (dateA || dateB) {
      const data = getProductionData(dateA, dateB);
      
      return createResponse({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    }
    
    return createResponse({
      success: false,
      error: 'Missing required parameters'
    }, 400);
    
  } catch (error) {
    Logger.log('❌ Error in doPost: ' + error.toString());
    return createResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

// ========================================
// DATA FETCHING FUNCTIONS
// ========================================

/**
 * Get data for a single shift (NEW - for dashboard.html)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} shift - 'A' or 'B'
 * @returns {Array} Array of production records
 */
function getShiftData(date, shift) {
  // Validate inputs
  if (!date || !shift) {
    throw new Error('Date and shift are required');
  }
  
  if (shift !== 'A' && shift !== 'B') {
    throw new Error('Shift must be A or B');
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  const sheetId = shift === 'A' ? CONFIG.SHEET_A_ID : CONFIG.SHEET_B_ID;
  const sheetName = shift === 'A' ? CONFIG.SHEET_A_NAME : CONFIG.SHEET_B_NAME;
  
  // Validate Sheet IDs
  if (!sheetId || sheetId === 'YOUR_SHEET_A_ID' || sheetId === 'YOUR_SHEET_B_ID') {
    throw new Error('Sheet ID not configured. Please update CONFIG.SHEET_A_ID and CONFIG.SHEET_B_ID');
  }
  
  if (CONFIG.DEBUG) {
    Logger.log(`Fetching data for Shift ${shift} on ${date}`);
    Logger.log(`Sheet ID: ${sheetId}`);
  }
  
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    
    if (!ss) {
      throw new Error(`Cannot open spreadsheet with ID: ${sheetId}`);
    }
    
    const sheet = ss.getSheetByName(sheetName) || ss.getActiveSheet();
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (!values || values.length === 0) {
      Logger.log('⚠️ Sheet is empty');
      return [];
    }
    
    if (values.length <= 1) {
      Logger.log('⚠️ No data rows found (only header or empty)');
      return [];
    }
    
    // Skip first 6 rows (header rows in Google Sheets)
    // Row 1: Headers
    // Rows 2-6: Title rows, labels, formatting
    // Row 7+: Actual data
    const dataRows = values.slice(6); // Start from row 7 (0-indexed = 6)
    
    // Use Map to detect and remove duplicate records
    // Check ALL columns in the row (create fingerprint of entire row)
    const dataMap = new Map();
    const skippedDuplicates = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowDate = formatDate(row[CONFIG.COLUMNS.DATE]);
      
      if (rowDate === date) {
        // Use Lot.No as identifier (no "รหัสผ้า" in actual sheets)
        const lotNo = row[CONFIG.COLUMNS.LOT_NO];
        const machineNo = row[CONFIG.COLUMNS.MACHINE_NO] || '';
        
        // Skip rows without lot number
        if (!lotNo || lotNo.toString().trim() === '') {
          continue;
        }
        
        const trimmedLotNo = lotNo.toString().trim();
        
        // Extract data based on shift (A or B)
        let production, meterStart, meterEnd, cuttingLength;
        
        if (shift === 'A') {
          // Column J is empty - calculate from meter difference
          meterStart = parseNumber(row[CONFIG.COLUMNS.METER_START_A]);
          meterEnd = parseNumber(row[CONFIG.COLUMNS.METER_END_A]);
          cuttingLength = parseNumber(row[CONFIG.COLUMNS.CUTTING_LENGTH_A]);
          
          // Calculate production from meter readings if not in sheet
          production = parseNumber(row[CONFIG.COLUMNS.PRODUCTION_A]);
          if (!production && meterStart !== null && meterEnd !== null) {
            production = Math.abs(meterEnd - meterStart);
          }
        } else { // Shift B
          // Column K is empty - calculate from meter difference
          meterStart = parseNumber(row[CONFIG.COLUMNS.METER_START_B]);
          meterEnd = parseNumber(row[CONFIG.COLUMNS.METER_END_B]);
          cuttingLength = parseNumber(row[CONFIG.COLUMNS.CUTTING_LENGTH_B]);
          
          // Calculate production from meter readings if not in sheet
          production = parseNumber(row[CONFIG.COLUMNS.PRODUCTION_B]);
          if (!production && meterStart !== null && meterEnd !== null) {
            production = Math.abs(meterEnd - meterStart);
          }
        }
        
        // Skip if no production data (even after calculation)
        if (!production || production === 0) {
          continue;
        }
        
        // Create unique fingerprint from ALL columns in the row
        // This ensures we check EVERY field, not just specific columns
        const rowFingerprint = createRowFingerprint(row);
        
        // Check if exact same record already exists
        if (dataMap.has(rowFingerprint)) {
          // This is a duplicate - skip it
          skippedDuplicates.push({
            row: i + 2,
            lotNo: trimmedLotNo,
            fingerprint: rowFingerprint.substring(0, 50) + '...'
          });
          
          if (CONFIG.DEBUG) {
            Logger.log(`  🗑️ Skipped duplicate at row ${i + 2}: ${trimmedLotNo}`);
          }
        } else {
          // First occurrence - keep it
          dataMap.set(rowFingerprint, {
            date: date,
            lotNo: trimmedLotNo,
            brandCode: trimmedLotNo, // Use lotNo as brandCode for compatibility
            production: production,
            cutting: cuttingLength, // Use cuttingLength from sheet
            machineNo: machineNo,
            meterStart: meterStart,
            meterEnd: meterEnd,
            cuttingLength: cuttingLength,
            shift: shift,
            rowNumber: i + 7 // +7 because: data starts at row 7 (0-indexed)
          });
        }
      }
    }
    
    // Convert Map to Array
    const results = Array.from(dataMap.values());
    
    if (CONFIG.DEBUG) {
      const totalRecords = dataRows.filter(row => formatDate(row[CONFIG.COLUMNS.DATE]) === date).length;
      Logger.log(`✓ Found ${results.length} unique records for ${date} Shift ${shift}`);
      if (skippedDuplicates.length > 0) {
        Logger.log(`  🗑️ Removed ${skippedDuplicates.length} exact duplicate records`);
      }
    }
    
    return results;
    
  } catch (error) {
    Logger.log(`❌ Error accessing sheet: ${error.toString()}`);
    throw new Error(`Cannot access ${shift === 'A' ? 'Shift A' : 'Shift B'} sheet: ${error.message}`);
  }
}


/**
 * Get production data from both sheets (OLD FORMAT - backward compatible)
 */
function getProductionData(dateA, dateB) {
  const shiftAData = dateA ? getSheetData(CONFIG.SHEET_A_ID, dateA, 'A') : null;
  const shiftBData = dateB ? getSheetData(CONFIG.SHEET_B_ID, dateB, 'B') : null;
  
  // Combine and summarize data
  const summary = {
    productionShiftA: shiftAData ? calculateTotal(shiftAData, 'production') : 0,
    productionShiftB: shiftBData ? calculateTotal(shiftBData, 'production') : 0,
    cuttingShiftA: shiftAData ? calculateTotal(shiftAData, 'cutting') : 0,
    cuttingShiftB: shiftBData ? calculateTotal(shiftBData, 'cutting') : 0,
    dateShiftA: dateA,
    dateShiftB: dateB
  };
  
  // Merge details by brand code
  const details = mergeShiftData(shiftAData, shiftBData);
  
  return {
    summary: summary,
    details: details,
    metadata: {
      dateA: dateA,
      dateB: dateB,
      recordCountA: shiftAData ? shiftAData.length : 0,
      recordCountB: shiftBData ? shiftBData.length : 0
    }
  };
}

/**
 * Get data from a specific sheet for a specific date (LEGACY)
 */
function getSheetData(sheetId, targetDate, shift) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheetName = shift === 'A' ? CONFIG.SHEET_A_NAME : CONFIG.SHEET_B_NAME;
    const sheet = ss.getSheetByName(sheetName) || ss.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) return [];
    
    // Skip first 6 rows (header rows in Google Sheets)
    // Row 1: Headers
    // Rows 2-6: Title rows, labels, formatting
    // Row 7+: Actual data
    const dataRows = values.slice(6); // Start from row 7 (0-indexed = 6)
    
    // Use Map to detect and remove exact duplicates
    // Create fingerprint from entire row
    const dataMap = new Map();
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowDate = formatDate(row[CONFIG.COLUMNS.DATE]);
      
      if (rowDate === targetDate) {
        const lotNo = row[CONFIG.COLUMNS.LOT_NO];
        const machineNo = row[CONFIG.COLUMNS.MACHINE_NO] || '';
        
        if (!lotNo || lotNo.toString().trim() === '') {
          continue;
        }
        
        const key = lotNo.toString().trim();
        
        // Extract data based on shift
        let production, meterStart, meterEnd, cuttingLength;
        
        if (shift === 'A') {
          meterStart = parseNumber(row[CONFIG.COLUMNS.METER_START_A]);
          meterEnd = parseNumber(row[CONFIG.COLUMNS.METER_END_A]);
          cuttingLength = parseNumber(row[CONFIG.COLUMNS.CUTTING_LENGTH_A]);
          
          production = parseNumber(row[CONFIG.COLUMNS.PRODUCTION_A]);
          if (!production && meterStart !== null && meterEnd !== null) {
            production = Math.abs(meterEnd - meterStart);
          }
        } else {
          meterStart = parseNumber(row[CONFIG.COLUMNS.METER_START_B]);
          meterEnd = parseNumber(row[CONFIG.COLUMNS.METER_END_B]);
          cuttingLength = parseNumber(row[CONFIG.COLUMNS.CUTTING_LENGTH_B]);
          
          production = parseNumber(row[CONFIG.COLUMNS.PRODUCTION_B]);
          if (!production && meterStart !== null && meterEnd !== null) {
            production = Math.abs(meterEnd - meterStart);
          }
        }
        
        // Skip if no production data (even after calculation)
        if (!production || production === 0) {
          continue;
        }
        
        // Create fingerprint from entire row to detect exact duplicates
        const rowFingerprint = createRowFingerprint(row);
        
        // Only keep first occurrence of exact duplicate
        if (!dataMap.has(rowFingerprint)) {
          dataMap.set(rowFingerprint, {
            brand: key,
            production: production,
            cutting: cuttingLength,
            machineNo: machineNo,
            meterStart: meterStart,
            meterEnd: meterEnd,
            cuttingLength: cuttingLength,
            shift: shift
          });
        }
        // If fingerprint exists, skip this duplicate record
      }
    }
    
    // Convert Map to Array
    const filteredData = Array.from(dataMap.values());
    
    return filteredData;
    
  } catch (error) {
    Logger.log(`❌ Error getting data from sheet ${sheetId}: ${error.toString()}`);
    return [];
  }
}

/**
 * Merge data from both shifts by brand code AND machine number
 * CRITICAL: Each machine must be shown separately!
 */
function mergeShiftData(shiftAData, shiftBData) {
  const machineMap = {};
  
  // Add Shift A data - Key by brand + machine
  if (shiftAData) {
    shiftAData.forEach(item => {
      const key = `${item.brand}_${item.machineNo || 'UNKNOWN'}`;
      
      if (!machineMap[key]) {
        machineMap[key] = {
          brand: item.brand,
          machineNo: item.machineNo || '',
          productionA: 0,
          productionB: 0,
          cuttingA: 0,
          cuttingB: 0,
          meterStartA: 0,
          meterEndA: 0,
          cuttingLengthA: 0,
          meterStartB: 0,
          meterEndB: 0,
          cuttingLengthB: 0
        };
      }
      // DO NOT ADD - assign directly (one machine = one set of data)
      machineMap[key].productionA = item.production;
      machineMap[key].cuttingA = item.cutting;
      machineMap[key].meterStartA = item.meterStart || 0;
      machineMap[key].meterEndA = item.meterEnd || 0;
      machineMap[key].cuttingLengthA = item.cuttingLength || 0;
    });
  }
  
  // Add Shift B data - Key by brand + machine
  if (shiftBData) {
    shiftBData.forEach(item => {
      const key = `${item.brand}_${item.machineNo || 'UNKNOWN'}`;
      
      if (!machineMap[key]) {
        machineMap[key] = {
          brand: item.brand,
          machineNo: item.machineNo || '',
          productionA: 0,
          productionB: 0,
          cuttingA: 0,
          cuttingB: 0,
          meterStartA: 0,
          meterEndA: 0,
          cuttingLengthA: 0,
          meterStartB: 0,
          meterEndB: 0,
          cuttingLengthB: 0
        };
      }
      // DO NOT ADD - assign directly (one machine = one set of data)
      machineMap[key].productionB = item.production;
      machineMap[key].cuttingB = item.cutting;
      machineMap[key].meterStartB = item.meterStart || 0;
      machineMap[key].meterEndB = item.meterEnd || 0;
      machineMap[key].cuttingLengthB = item.cuttingLength || 0;
    });
  }
  
  // Convert to array and calculate totals
  const result = Object.values(machineMap).map(item => ({
    brand: item.brand,
    production: item.productionA + item.productionB,
    cutting: item.cuttingA + item.cuttingB,
    productionA: item.productionA,
    productionB: item.productionB,
    cuttingA: item.cuttingA,
    cuttingB: item.cuttingB,
    machineNo: item.machineNo,
    meterStartA: item.meterStartA,
    meterEndA: item.meterEndA,
    cuttingLengthA: item.cuttingLengthA,
    meterStartB: item.meterStartB,
    meterEndB: item.meterEndB,
    cuttingLengthB: item.cuttingLengthB
  }));
  
  // Sort by brand code, then by machine number
  result.sort((a, b) => {
    const brandCompare = String(a.brand || '').localeCompare(String(b.brand || ''));
    if (brandCompare !== 0) return brandCompare;
    // Convert machineNo to string before comparing (it might be a number)
    return String(a.machineNo || '').localeCompare(String(b.machineNo || ''));
  });
  
  return result;
}

/**
 * Calculate total for a specific field
 */
function calculateTotal(data, field) {
  return data.reduce((sum, item) => sum + (item[field] || 0), 0);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format date to YYYY-MM-DD (handles multiple input formats)
 */
function formatDate(date) {
  if (!date) return '';
  
  // If already a Date object
  if (date instanceof Date && !isNaN(date)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If string, try to parse
  if (typeof date === 'string') {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // Try DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
      const parts = date.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as Date
    const parsed = new Date(date);
    if (!isNaN(parsed)) {
      return formatDate(parsed);
    }
  }
  
  // Fallback: return as string
  return String(date);
}

/**
 * Parse number from cell value
 */
function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Create unique fingerprint from entire row
 * This checks ALL columns to detect exact duplicates
 * Excludes timestamp column (column 0 if it's a timestamp)
 * 
 * @param {Array} row - Array of cell values from a row
 * @returns {string} - Unique fingerprint string
 */
function createRowFingerprint(row) {
  const fingerprint = [];
  
  // Iterate through all columns in the row
  for (let col = 0; col < row.length; col++) {
    const cellValue = row[col];
    
    // Skip empty cells
    if (cellValue === null || cellValue === undefined || cellValue === '') {
      fingerprint.push('_EMPTY_');
      continue;
    }
    
    // Handle different data types
    if (cellValue instanceof Date) {
      // Format dates consistently
      fingerprint.push(formatDate(cellValue));
    } else if (typeof cellValue === 'number') {
      // Use number as-is (with precision)
      fingerprint.push(cellValue.toFixed(4));
    } else if (typeof cellValue === 'string') {
      // Trim and use string
      fingerprint.push(cellValue.trim().toLowerCase());
    } else {
      // Convert other types to string
      fingerprint.push(String(cellValue));
    }
  }
  
  // Join all values with separator
  return fingerprint.join('|');
}


/**
 * Create JSON response with CORS headers
 */
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data, null, 2));
  response.setMimeType(ContentService.MimeType.JSON);
  
  // Note: Apps Script Web Apps automatically handle CORS
  // No additional headers needed for GET requests
  
  if (statusCode !== 200 && CONFIG.DEBUG) {
    Logger.log(`Response status: ${statusCode}`);
  }
  
  return response;
}

// ========================================
// TESTING & SETUP FUNCTIONS
// ========================================

/**
 * Test function - call this to test the API locally
 * Run this in Apps Script editor: testAPI()
 */
function testAPI() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🧪 Testing Production Dashboard API');
  Logger.log('========================================\n');
  
  const today = new Date();
  const dateStr = formatDate(today);
  
  Logger.log('📅 Test Date: ' + dateStr);
  Logger.log('');
  
  // Test Shift A
  Logger.log('--- Testing Shift A ---');
  try {
    const shiftAData = getShiftData(dateStr, 'A');
    Logger.log(`✓ Shift A: ${shiftAData.length} records`);
    if (shiftAData.length > 0) {
      Logger.log('Sample record: ' + JSON.stringify(shiftAData[0], null, 2));
    }
  } catch (e) {
    Logger.log('✗ Shift A Error: ' + e.toString());
  }
  
  Logger.log('');
  
  // Test Shift B
  Logger.log('--- Testing Shift B ---');
  try {
    const shiftBData = getShiftData(dateStr, 'B');
    Logger.log(`✓ Shift B: ${shiftBData.length} records`);
    if (shiftBData.length > 0) {
      Logger.log('Sample record: ' + JSON.stringify(shiftBData[0], null, 2));
    }
  } catch (e) {
    Logger.log('✗ Shift B Error: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('✅ Test Complete');
  Logger.log('========================================');
}

/**
 * Setup function - run once to grant permissions and verify access
 * Run this in Apps Script editor: setup()
 */
function setup() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('⚙️ Production Dashboard - Setup');
  Logger.log('========================================\n');
  
  Logger.log('📋 Configuration:');
  Logger.log('  Sheet A ID: ' + CONFIG.SHEET_A_ID);
  Logger.log('  Sheet B ID: ' + CONFIG.SHEET_B_ID);
  Logger.log('  Sheet A Name: ' + CONFIG.SHEET_A_NAME);
  Logger.log('  Sheet B Name: ' + CONFIG.SHEET_B_NAME);
  Logger.log('');
  
  // Test access to Sheet A
  Logger.log('--- Testing Sheet A Access ---');
  try {
    const sheetA = SpreadsheetApp.openById(CONFIG.SHEET_A_ID);
    const sheet = sheetA.getSheetByName(CONFIG.SHEET_A_NAME) || sheetA.getActiveSheet();
    const rowCount = sheet.getLastRow();
    Logger.log('✓ Access successful');
    Logger.log('  Spreadsheet: ' + sheetA.getName());
    Logger.log('  Sheet: ' + sheet.getName());
    Logger.log('  Rows: ' + rowCount);
  } catch (e) {
    Logger.log('✗ Cannot access Sheet A');
    Logger.log('  Error: ' + e.toString());
    Logger.log('  Fix: Check Sheet ID and permissions');
  }
  
  Logger.log('');
  
  // Test access to Sheet B
  Logger.log('--- Testing Sheet B Access ---');
  try {
    const sheetB = SpreadsheetApp.openById(CONFIG.SHEET_B_ID);
    const sheet = sheetB.getSheetByName(CONFIG.SHEET_B_NAME) || sheetB.getActiveSheet();
    const rowCount = sheet.getLastRow();
    Logger.log('✓ Access successful');
    Logger.log('  Spreadsheet: ' + sheetB.getName());
    Logger.log('  Sheet: ' + sheet.getName());
    Logger.log('  Rows: ' + rowCount);
  } catch (e) {
    Logger.log('✗ Cannot access Sheet B');
    Logger.log('  Error: ' + e.toString());
    Logger.log('  Fix: Check Sheet ID and permissions');
  }
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('✅ Setup Complete');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('📝 Next Steps:');
  Logger.log('1. If all tests passed, Deploy as Web App');
  Logger.log('2. Copy the Web App URL');
  Logger.log('3. Update config.js with the URL');
  Logger.log('4. Test from dashboard.html');
}

/**
 * Get API info - useful for debugging
 */
function getAPIInfo() {
  return {
    version: '2.0.0',
    endpoints: {
      singleShift: '?date=YYYY-MM-DD&shift=A',
      bothShifts: '?dateA=YYYY-MM-DD&dateB=YYYY-MM-DD'
    },
    config: {
      sheetAId: CONFIG.SHEET_A_ID,
      sheetBId: CONFIG.SHEET_B_ID,
      debug: CONFIG.DEBUG
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Pre-deployment validation
 * Run this before deploying to check everything is ready
 */
function validateBeforeDeployment() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🔍 PRE-DEPLOYMENT VALIDATION');
  Logger.log('========================================\n');
  
  let errors = 0;
  let warnings = 0;
  
  // Check 1: Sheet IDs configured
  Logger.log('📋 Check 1: Configuration');
  if (!CONFIG.SHEET_A_ID || CONFIG.SHEET_A_ID.includes('YOUR_SHEET')) {
    Logger.log('  ❌ SHEET_A_ID not configured');
    errors++;
  } else {
    Logger.log('  ✓ SHEET_A_ID configured');
  }
  
  if (!CONFIG.SHEET_B_ID || CONFIG.SHEET_B_ID.includes('YOUR_SHEET')) {
    Logger.log('  ❌ SHEET_B_ID not configured');
    errors++;
  } else {
    Logger.log('  ✓ SHEET_B_ID configured');
  }
  Logger.log('');
  
  // Check 2: Sheet Access
  Logger.log('📋 Check 2: Sheet Access');
  try {
    const ssA = SpreadsheetApp.openById(CONFIG.SHEET_A_ID);
    const sheetA = ssA.getSheetByName(CONFIG.SHEET_A_NAME);
    if (!sheetA) {
      Logger.log(`  ⚠️ Sheet "${CONFIG.SHEET_A_NAME}" not found in Shift A spreadsheet`);
      warnings++;
    } else {
      Logger.log(`  ✓ Shift A sheet accessible (${sheetA.getLastRow()} rows)`);
    }
  } catch (e) {
    Logger.log('  ❌ Cannot access Shift A sheet: ' + e.message);
    errors++;
  }
  
  try {
    const ssB = SpreadsheetApp.openById(CONFIG.SHEET_B_ID);
    const sheetB = ssB.getSheetByName(CONFIG.SHEET_B_NAME);
    if (!sheetB) {
      Logger.log(`  ⚠️ Sheet "${CONFIG.SHEET_B_NAME}" not found in Shift B spreadsheet`);
      warnings++;
    } else {
      Logger.log(`  ✓ Shift B sheet accessible (${sheetB.getLastRow()} rows)`);
    }
  } catch (e) {
    Logger.log('  ❌ Cannot access Shift B sheet: ' + e.message);
    errors++;
  }
  Logger.log('');
  
  // Check 3: Test API functions
  Logger.log('📋 Check 3: API Functions');
  try {
    const today = formatDate(new Date());
    Logger.log(`  Testing with date: ${today}`);
    
    const testDataA = getShiftData(today, 'A');
    Logger.log(`  ✓ getShiftData(A): ${testDataA.length} records`);
    
    const testDataB = getShiftData(today, 'B');
    Logger.log(`  ✓ getShiftData(B): ${testDataB.length} records`);
  } catch (e) {
    Logger.log('  ❌ API function error: ' + e.message);
    errors++;
  }
  Logger.log('');
  
  // Check 4: Helper functions
  Logger.log('📋 Check 4: Helper Functions');
  try {
    const testDate = formatDate(new Date());
    Logger.log(`  ✓ formatDate: ${testDate}`);
    
    const testNum = parseNumber('1,234.56');
    Logger.log(`  ✓ parseNumber: ${testNum}`);
    
    const testRow = ['2026-02-09', 'TEST', 100, 200];
    const testFingerprint = createRowFingerprint(testRow);
    Logger.log(`  ✓ createRowFingerprint: ${testFingerprint.substring(0, 30)}...`);
  } catch (e) {
    Logger.log('  ❌ Helper function error: ' + e.message);
    errors++;
  }
  Logger.log('');
  
  // Summary
  Logger.log('========================================');
  if (errors === 0 && warnings === 0) {
    Logger.log('✅ ALL CHECKS PASSED - READY TO DEPLOY');
  } else if (errors === 0 && warnings > 0) {
    Logger.log(`⚠️ ${warnings} WARNING(S) - CAN DEPLOY WITH CAUTION`);
  } else {
    Logger.log(`❌ ${errors} ERROR(S) - FIX BEFORE DEPLOYMENT`);
  }
  Logger.log('========================================\n');
  
  Logger.log('📝 Deployment Checklist:');
  Logger.log('  1. All errors fixed');
  Logger.log('  2. Deploy → New deployment → Web app');
  Logger.log('  3. Execute as: Me');
  Logger.log('  4. Who has access: Anyone');
  Logger.log('  5. Copy Web App URL');
  Logger.log('  6. Update config.js with URL');
  Logger.log('  7. Test from dashboard');
  
  return {
    errors: errors,
    warnings: warnings,
    ready: errors === 0
  };
}