/**
 * DEBUGGING SCRIPT - ใส่ใน Apps Script เพื่อตรวจสอบข้อมูล
 * วิธีใช้: Copy ไปวางใน Apps Script → Run function debugSheetData()
 */

// ใช้ CONFIG เดียวกับ Code.gs
const DEBUG_CONFIG = {
  SHEET_A_ID: '1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc',
  SHEET_B_ID: '1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU',
  SHEET_A_NAME: 'แผนกผลิต2_กะA',
  SHEET_B_NAME: 'แผนกผลิต2_กะB'
};

/**
 * ฟังก์ชันหลักสำหรับ Debug
 * Run ใน Apps Script Editor: debugSheetData()
 */
function debugSheetData() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('🔍 DEBUGGING SHEET DATA');
  Logger.log('========================================\n');
  
  // Debug Shift A
  Logger.log('--- Checking Shift A ---');
  debugSingleSheet(DEBUG_CONFIG.SHEET_A_ID, DEBUG_CONFIG.SHEET_A_NAME, 'A');
  
  Logger.log('\n');
  
  // Debug Shift B
  Logger.log('--- Checking Shift B ---');
  debugSingleSheet(DEBUG_CONFIG.SHEET_B_ID, DEBUG_CONFIG.SHEET_B_NAME, 'B');
  
  Logger.log('\n========================================');
  Logger.log('✅ Debug Complete - Check logs above');
  Logger.log('========================================');
}

/**
 * ตรวจสอบ Sheet แต่ละตัว - DETAILED DEBUG
 */
function debugSingleSheet(sheetId, sheetName, shift) {
  try {
    // 1. เปิด Spreadsheet
    Logger.log(`📂 Opening Sheet ${shift}...`);
    const ss = SpreadsheetApp.openById(sheetId);
    Logger.log(`  ✓ Spreadsheet Name: ${ss.getName()}`);
    Logger.log(`  ✓ Spreadsheet ID: ${sheetId}`);
    Logger.log(`  ✓ Direct Link: https://docs.google.com/spreadsheets/d/${sheetId}`);
    
    // 2. เปิด Sheet tab
    Logger.log(`\n📄 Looking for tab: "${sheetName}"`);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`  ❌ Sheet "${sheetName}" NOT FOUND!`);
      Logger.log(`  Available sheets:`);
      ss.getSheets().forEach(s => {
        Logger.log(`    - "${s.getName()}" (ID: ${s.getSheetId()})`);
      });
      return;
    }
    
    Logger.log(`  ✓ Sheet found: "${sheet.getName()}"`);
    Logger.log(`  ✓ Sheet ID: ${sheet.getSheetId()}`);
    
    // 3. ดึงข้อมูล
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    Logger.log(`\n📊 Sheet Dimensions:`);
    Logger.log(`  Total rows: ${lastRow}`);
    Logger.log(`  Total columns: ${lastCol}`);
    
    if (lastRow === 0) {
      Logger.log(`  ❌ Sheet is EMPTY!`);
      return;
    }
    
    // 4. ดึงข้อมูลทั้งหมดมาวิเคราะห์
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    
    // 5. หา Row ที่มีข้อมูลครบ (Date + Lot.No + Production)
    Logger.log(`\n🔍 ANALYZING ALL ROWS FOR COMPLETE DATA:`);
    Logger.log(`Looking for rows with: Date (C) + Lot.No (H) + Production (${shift === 'A' ? 'J' : 'K'})\n`);
    
    const prodColIndex = shift === 'A' ? 9 : 10; // 0-indexed
    let completeDataRows = [];
    let firstCompleteRow = null;
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const rowNum = i + 1;
      const dateCell = row[2]; // Column C
      const lotNoCell = row[7]; // Column H
      const prodCell = row[prodColIndex]; // Column J or K
      
      const hasDate = dateCell instanceof Date;
      const hasLotNo = lotNoCell && lotNoCell.toString().trim() !== '';
      const hasProd = prodCell && !isNaN(parseFloat(prodCell)) && parseFloat(prodCell) > 0;
      
      if (hasDate && hasLotNo && hasProd) {
        if (!firstCompleteRow) firstCompleteRow = rowNum;
        
        if (completeDataRows.length < 5) {
          completeDataRows.push({
            row: rowNum,
            date: Utilities.formatDate(dateCell, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
            lotNo: lotNoCell.toString().trim(),
            production: parseFloat(prodCell),
            machine: row[3] || '' // Column D
          });
        }
      }
    }
    
    if (firstCompleteRow) {
      Logger.log(`✅ FOUND COMPLETE DATA!`);
      Logger.log(`  First complete row: ${firstCompleteRow}`);
      Logger.log(`  Total complete rows: ${completeDataRows.length > 0 ? '5+' : completeDataRows.length}`);
      Logger.log(`\n📋 Sample Complete Records (First 5):`);
      
      completeDataRows.forEach((record, idx) => {
        Logger.log(`\n  Record ${idx + 1} (Row ${record.row}):`);
        Logger.log(`    Date: ${record.date}`);
        Logger.log(`    Machine: ${record.machine}`);
        Logger.log(`    Lot.No: ${record.lotNo}`);
        Logger.log(`    Production: ${record.production}`);
      });
      
      // แสดงข้อมูลเฉพาะวันที่ 28 มกราคม 2026
      Logger.log(`\n🎯 Filtering for 2026-01-28:`);
      const jan28Records = completeDataRows.filter(r => r.date === '2026-01-28');
      if (jan28Records.length > 0) {
        Logger.log(`  ✅ Found ${jan28Records.length} record(s) for Jan 28, 2026`);
        jan28Records.forEach(r => {
          Logger.log(`    Row ${r.row}: Machine ${r.machine}, Lot ${r.lotNo}, Prod ${r.production}`);
        });
      } else {
        Logger.log(`  ⚠️ No records found for 2026-01-28`);
        Logger.log(`  Available dates in sample:`);
        const uniqueDates = [...new Set(completeDataRows.map(r => r.date))];
        uniqueDates.forEach(d => Logger.log(`    - ${d}`));
      }
      
    } else {
      Logger.log(`❌ NO COMPLETE DATA FOUND!`);
      Logger.log(`No rows have all three: Date + Lot.No + Production`);
      
      // แสดงสถิติแต่ละ column
      Logger.log(`\n📊 Column Statistics:`);
      
      let dateCount = 0, lotCount = 0, prodCount = 0;
      for (let i = 0; i < allData.length; i++) {
        if (allData[i][2] instanceof Date) dateCount++;
        if (allData[i][7] && allData[i][7].toString().trim() !== '') lotCount++;
        if (allData[i][prodColIndex] && !isNaN(parseFloat(allData[i][prodColIndex]))) prodCount++;
      }
      
      Logger.log(`  Rows with Date (C): ${dateCount}`);
      Logger.log(`  Rows with Lot.No (H): ${lotCount}`);
      Logger.log(`  Rows with Production (${shift === 'A' ? 'J' : 'K'}): ${prodCount}`);
    }
    
    // 6. แสดง rows 1-20 แบบละเอียด - ทุกคอลัมน์
    Logger.log(`\n\n📖 DETAILED VIEW: Rows 1-20 (ALL COLUMNS)`);
    for (let i = 0; i < Math.min(20, allData.length); i++) {
      const row = allData[i];
      const rowNum = i + 1;
      
      Logger.log(`\n=== Row ${rowNum} ===`);
      
      // แสดงทุก column ที่มีข้อมูล
      for (let col = 0; col < row.length; col++) {
        const cellValue = row[col];
        const colLetter = String.fromCharCode(65 + col);
        
        // Skip ถ้าเซลล์ว่าง
        if (cellValue === '' || cellValue === null || cellValue === undefined) {
          continue;
        }
        
        // แสดงข้อมูล
        let valueDisplay = cellValue;
        if (cellValue instanceof Date) {
          valueDisplay = `${cellValue} [DATE: ${Utilities.formatDate(cellValue, Session.getScriptTimeZone(), 'yyyy-MM-dd')}]`;
        } else if (typeof cellValue === 'number') {
          valueDisplay = `${cellValue} [NUMBER]`;
        } else {
          valueDisplay = `"${cellValue}" [TEXT]`;
        }
        
        Logger.log(`  ${colLetter}: ${valueDisplay}`);
      }
    }
    
  } catch (error) {
    Logger.log(`\n❌ ERROR: ${error.toString()}`);
    Logger.log(`Stack: ${error.stack}`);
  }
}

/**
 * ทดสอบการ format วันที่
 */
function testDateFormatting() {
  Logger.clear();
  Logger.log('========================================');
  Logger.log('📅 TESTING DATE FORMATTING');
  Logger.log('========================================\n');
  
  const testDates = [
    new Date(2026, 1, 9), // February 9, 2026
    new Date(2025, 0, 28), // January 28, 2025
    '2026-02-09',
    '9/2/2026'
  ];
  
  testDates.forEach(date => {
    Logger.log(`Input: ${date}`);
    Logger.log(`  Type: ${typeof date}`);
    Logger.log(`  instanceof Date: ${date instanceof Date}`);
    
    if (date instanceof Date) {
      const formatted = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      Logger.log(`  Formatted: ${formatted}`);
    }
    Logger.log('');
  });
}
