/**
 * DEBUG: Date Synchronization Checker
 * ตรวจสอบว่าวันที่ใน Column C sync กับ API parameter หรือไม่
 * 
 * วิธีใช้:
 * 1. Copy ทั้งหมดไปวางใน Apps Script Editor
 * 2. Run function: debugDateSync()
 * 3. ดูผลใน Logs
 */

const DEBUG_CONFIG = {
  SHEET_A_ID: '1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc',
  SHEET_B_ID: '1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU',
  SHEET_A_NAME: 'แผนกผลิต2_กะA',
  SHEET_B_NAME: 'แผนกผลิต2_กะB'
};

/**
 * Main debug function
 */
function debugDateSync() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🔍 DATE SYNCHRONIZATION DEBUG');
  Logger.log('========================================\n');
  
  // Test both sheets
  debugSheetDates(DEBUG_CONFIG.SHEET_A_ID, DEBUG_CONFIG.SHEET_A_NAME, 'Shift A');
  Logger.log('\n');
  debugSheetDates(DEBUG_CONFIG.SHEET_B_ID, DEBUG_CONFIG.SHEET_B_NAME, 'Shift B');
  
  Logger.log('\n========================================');
  Logger.log('✅ Debug Complete');
  Logger.log('========================================');
}

/**
 * Debug dates in a sheet
 */
function debugSheetDates(sheetId, sheetName, label) {
  Logger.log(`--- ${label} ---`);
  
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`❌ Sheet "${sheetName}" not found!`);
      return;
    }
    
    Logger.log(`✓ Sheet opened: ${sheet.getName()}`);
    
    const lastRow = sheet.getLastRow();
    Logger.log(`✓ Total rows: ${lastRow}`);
    
    // Get all dates from Column C (skip first 6 header rows)
    const dateRange = sheet.getRange(7, 3, Math.min(50, lastRow - 6), 1);
    const dates = dateRange.getValues();
    
    // Collect unique dates
    const dateMap = new Map();
    const dateFormats = [];
    
    for (let i = 0; i < dates.length; i++) {
      const cellValue = dates[i][0];
      const rowNum = i + 7;
      
      if (!cellValue) continue;
      
      // Check type
      const isDate = cellValue instanceof Date;
      const type = typeof cellValue;
      
      // Format date
      let formatted = '';
      if (isDate) {
        formatted = formatDateForAPI(cellValue);
      } else {
        formatted = String(cellValue);
      }
      
      // Record format info
      if (dateFormats.length < 5) {
        dateFormats.push({
          row: rowNum,
          raw: cellValue,
          type: type,
          isDate: isDate,
          formatted: formatted
        });
      }
      
      // Count occurrences
      if (!dateMap.has(formatted)) {
        dateMap.set(formatted, {
          count: 0,
          firstRow: rowNum,
          isDate: isDate
        });
      }
      dateMap.get(formatted).count++;
    }
    
    // Show format examples
    Logger.log('\n📋 Date Format Examples (First 5):');
    dateFormats.forEach((info, idx) => {
      Logger.log(`\n  Example ${idx + 1} (Row ${info.row}):`);
      Logger.log(`    Raw value: ${info.raw}`);
      Logger.log(`    Type: ${info.type}`);
      Logger.log(`    Is Date object: ${info.isDate}`);
      Logger.log(`    Formatted as: "${info.formatted}"`);
    });
    
    // Show unique dates
    Logger.log('\n📅 Unique Dates Found:');
    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    
    sortedDates.forEach(([date, info]) => {
      Logger.log(`  ${date}: ${info.count} records (First at row ${info.firstRow}) ${info.isDate ? '[DATE]' : '[TEXT]'}`);
    });
    
    // Test API format matching
    Logger.log('\n🧪 API Format Test:');
    const testDates = ['2026-01-28', '2026-02-06', '2026-02-07', '2026-02-08', '2026-02-09'];
    testDates.forEach(testDate => {
      const hasMatch = dateMap.has(testDate);
      const count = hasMatch ? dateMap.get(testDate).count : 0;
      Logger.log(`  ${testDate}: ${hasMatch ? '✓ MATCH' : '✗ NO MATCH'} (${count} records)`);
    });
    
  } catch (error) {
    Logger.log(`❌ Error: ${error.toString()}`);
  }
}

/**
 * Format date exactly like the API does
 */
function formatDateForAPI(date) {
  if (!date) return '';
  
  if (date instanceof Date && !isNaN(date)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  }
  
  return String(date);
}

/**
 * Test specific date query
 */
function testDateQuery() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🧪 DATE QUERY TEST');
  Logger.log('========================================\n');
  
  const testDate = '2026-01-28';
  Logger.log(`Testing date: ${testDate}\n`);
  
  // Test Shift A
  Logger.log('--- Shift A ---');
  const sheetA = SpreadsheetApp.openById(DEBUG_CONFIG.SHEET_A_ID)
    .getSheetByName(DEBUG_CONFIG.SHEET_A_NAME);
  
  const dataA = sheetA.getRange(7, 1, sheetA.getLastRow() - 6, 21).getValues();
  let matchCountA = 0;
  
  for (let i = 0; i < dataA.length; i++) {
    const rowDate = dataA[i][2]; // Column C (0-indexed = 2)
    const formatted = formatDateForAPI(rowDate);
    
    if (formatted === testDate) {
      matchCountA++;
      if (matchCountA <= 3) {
        Logger.log(`  Row ${i + 7}: ${rowDate} → "${formatted}" ✓`);
      }
    }
  }
  
  Logger.log(`Total matches: ${matchCountA}`);
  
  // Test Shift B
  Logger.log('\n--- Shift B ---');
  const sheetB = SpreadsheetApp.openById(DEBUG_CONFIG.SHEET_B_ID)
    .getSheetByName(DEBUG_CONFIG.SHEET_B_NAME);
  
  const dataB = sheetB.getRange(7, 1, sheetB.getLastRow() - 6, 21).getValues();
  let matchCountB = 0;
  
  for (let i = 0; i < dataB.length; i++) {
    const rowDate = dataB[i][2];
    const formatted = formatDateForAPI(rowDate);
    
    if (formatted === testDate) {
      matchCountB++;
      if (matchCountB <= 3) {
        Logger.log(`  Row ${i + 7}: ${rowDate} → "${formatted}" ✓`);
      }
    }
  }
  
  Logger.log(`Total matches: ${matchCountB}`);
  
  Logger.log('\n========================================');
  Logger.log(`✅ Should return ${matchCountA + matchCountB} records for ${testDate}`);
  Logger.log('========================================');
}

/**
 * Compare with actual API behavior
 */
function compareWithAPI() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🔄 COMPARING WITH ACTUAL API');
  Logger.log('========================================\n');
  
  const testDate = '2026-01-28';
  
  // Simulate API call
  Logger.log(`Simulating API call with date: ${testDate}\n`);
  
  // Get data using the actual getShiftData logic
  const resultA = simulateGetShiftData(testDate, 'A');
  const resultB = simulateGetShiftData(testDate, 'B');
  
  Logger.log('\n--- Results ---');
  Logger.log(`Shift A: ${resultA.length} records`);
  Logger.log(`Shift B: ${resultB.length} records`);
  Logger.log(`Total: ${resultA.length + resultB.length} records`);
  
  if (resultA.length > 0) {
    Logger.log('\nSample from Shift A:');
    Logger.log(`  Date: ${resultA[0].date}`);
    Logger.log(`  Machine: ${resultA[0].machineNo}`);
    Logger.log(`  Lot.No: ${resultA[0].lotNo}`);
  }
  
  Logger.log('\n========================================');
  Logger.log('✅ Comparison Complete');
  Logger.log('========================================');
}

function simulateGetShiftData(date, shift) {
  const sheetId = shift === 'A' ? DEBUG_CONFIG.SHEET_A_ID : DEBUG_CONFIG.SHEET_B_ID;
  const sheetName = shift === 'A' ? DEBUG_CONFIG.SHEET_A_NAME : DEBUG_CONFIG.SHEET_B_NAME;
  
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const dataRows = values.slice(6);
  
  const results = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowDate = formatDateForAPI(row[2]); // Column C
    
    if (rowDate === date) {
      const lotNo = row[6]; // Column G
      if (lotNo && lotNo.toString().trim() !== '') {
        results.push({
          date: date,
          lotNo: lotNo.toString().trim(),
          machineNo: row[3] || '',
          rowNumber: i + 7
        });
      }
    }
  }
  
  return results;
}
