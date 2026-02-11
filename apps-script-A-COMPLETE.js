/**
 * ระบบจัดการข้อมูลรายงานแผนกผลิต 2 - กะ A
 * Version: 2.3.1 (Strict Mapping)
 * Updated: 2026-01-28
 *
 * @description Script นี้ทำหน้าที่เป็น Web App สำหรับรับข้อมูลจากฟอร์ม
 * และบันทึกลงใน Google Sheets พร้อมทั้งสร้างไฟล์สำรองข้อมูล (Backup)
 * 
 * Changelog v2.3.1:
 * - ปรับปรุงการ Map ข้อมูลให้ Strict มากขึ้น (กำหนดค่าว่างสำหรับกะ B อย่างชัดเจน)
 * - ทำให้ Logic ตรงกับกะ B ที่ทำงานได้ปกติ
 * 
 * Changelog v2.3:
 * - แก้ไขปัญหาการบันทึก timestamp ที่แสดงเป็น 1899-12-31, 1900-01-01 ฯลฯ
 * - เปลี่ยนจาก timestamp.toLocaleString('th-TH') เป็น Utilities.formatDate()
 * - แก้ไขปัญหาข้อมูลเลื่อนคอลัมน์ทางขวา
 */

// ===================== CONFIGURATION =====================
const CONFIG = {
  SHEET_ID: '1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc',
  FOLDER_ID: '1O07zs3-Vm7W42DvkHg1RU6BKcw60zljV',
  SHEET_NAME: 'แผนกผลิต2_กะA',
  HEADERS: [
    'เวลาบันทึก', 'ลำดับชุดข้อมูลที่', 'วันที่', 'เครื่องทอ NO', 'พนักงานทอ กะ A',
    'พนักงานทอ กะ B', 'ขนาดหน้าผ้า', 'Lot.No', 'เลขที่ใบสั่งผลิต', 'ยอดทอ กะ A',
    'ยอดทอ กะ B', 'ความเร็วรอบ กะ A', 'ความเร็วรอบ กะ B', 'ประสิทธิภาพ กะ A',
    'ประสิทธิภาพ กะ B', 'มิเตอร์เริ่มงาน กะ A', 'มิเตอร์เลิกงาน กะ A', 'มิเตอร์เริ่มงาน กะ B',
    'มิเตอร์เลิกงาน กะ B', 'ความยาวตัดม้วน กะ A', 'ความยาวตัดม้วน กะ B'
  ],
  MAX_RETRIES: 3,
  BACKUP_ENABLED: true,
  LOG_ENABLED: true,
  VERSION: '2.3',
  SHIFT: 'A'
};

// Global instance
let _SHEETS_MANAGER = null;

// ===================== LOGGER =====================
class Logger {
  static log(level, message, data = null) {
    if (!CONFIG.LOG_ENABLED) return;
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data, version: CONFIG.VERSION };
    console.log(`[${level}] ${timestamp}: ${message}`, data || '');
    try {
      const props = PropertiesService.getScriptProperties();
      const existing = props.getProperty('systemLogs');
      let logs = existing ? JSON.parse(existing) : [];
      logs.unshift(logEntry);
      if (logs.length > 100) logs = logs.slice(0, 100);
      props.setProperty('systemLogs', JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to save log:', err);
    }
  }
  static info(m, d = null) { this.log('INFO', m, d); }
  static warn(m, d = null) { this.log('WARN', m, d); }
  static error(m, d = null) { this.log('ERROR', m, d); }
  static success(m, d = null) { this.log('SUCCESS', m, d); }
}

// ===================== SHEETS MANAGER =====================
class SheetsManager {
  constructor() {
    this.spreadsheet = null;
    this.worksheet = null;
    this.initializeSheet();
  }

  initializeSheet() {
    try {
      Logger.info('Initializing Google Sheets connection...');
      this.spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      this.worksheet = this.spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

      if (!this.worksheet) {
        Logger.info(`Sheet "${CONFIG.SHEET_NAME}" not found. Creating new one.`);
        this.worksheet = this.spreadsheet.insertSheet(CONFIG.SHEET_NAME);
      }
      this.setupHeaders();
      Logger.success('Sheets initialization complete.');
    } catch (err) {
      Logger.error('Sheets initialization failed', err.toString());
      throw new Error(`Sheet initialization failed: ${err.message}`);
    }
  }

  setupHeaders() {
    try {
      if (this.worksheet.getLastRow() === 0) {
        const range = this.worksheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
        range.setValues([CONFIG.HEADERS]);
        range.setFontWeight('bold').setHorizontalAlignment('center');
        this.worksheet.setFrozenRows(1);
        for (let i = 1; i <= CONFIG.HEADERS.length; i++) {
          this.worksheet.autoResizeColumn(i);
        }
        Logger.success('Headers created and formatted.');
      } else {
        // ตรวจสอบและซ่อมแซม headers ที่มีอยู่แล้ว
        this.validateAndRepairHeaders();
      }
    } catch (err) {
      Logger.error('Header setup failed', err.toString());
      throw err;
    }
  }

  /**
   * ตรวจสอบและซ่อมแซม headers ที่หายไปหรือไม่ถูกต้อง
   */
  validateAndRepairHeaders() {
    try {
      if (this.worksheet.getLastRow() === 0) {
        Logger.info('Sheet is empty, skipping header validation.');
        return;
      }

      const headerRow = 1;
      const existingHeaders = this.worksheet.getRange(headerRow, 1, 1, this.worksheet.getLastColumn()).getValues()[0];
      const existingHeadersStr = existingHeaders.map(h => String(h || '').trim());
      
      Logger.info('Validating headers...', { 
        expected: CONFIG.HEADERS.length, 
        found: existingHeadersStr.length 
      });

      let needsRepair = false;
      const missingHeaders = [];
      const extraHeaders = [];

      // ตรวจสอบว่า headers ตรงกันหรือไม่
      if (existingHeadersStr.length !== CONFIG.HEADERS.length) {
        needsRepair = true;
        Logger.warn('Header count mismatch', { 
          expected: CONFIG.HEADERS.length, 
          found: existingHeadersStr.length 
        });
      }

      // ตรวจสอบแต่ละคอลัมน์
      for (let i = 0; i < CONFIG.HEADERS.length; i++) {
        if (existingHeadersStr[i] !== CONFIG.HEADERS[i]) {
          needsRepair = true;
          if (!existingHeadersStr[i] || existingHeadersStr[i] === '') {
            missingHeaders.push({ index: i, name: CONFIG.HEADERS[i] });
          }
        }
      }

      // ตรวจสอบคอลัมน์เกิน
      if (existingHeadersStr.length > CONFIG.HEADERS.length) {
        for (let i = CONFIG.HEADERS.length; i < existingHeadersStr.length; i++) {
          if (existingHeadersStr[i] && existingHeadersStr[i] !== '') {
            extraHeaders.push({ index: i, name: existingHeadersStr[i] });
          }
        }
      }

      if (needsRepair) {
        Logger.warn('Headers need repair', { 
          missing: missingHeaders.length,
          extra: extraHeaders.length 
        });
        
        // ซ่อมแซม headers
        const range = this.worksheet.getRange(headerRow, 1, 1, CONFIG.HEADERS.length);
        range.setValues([CONFIG.HEADERS]);
        range.setFontWeight('bold').setHorizontalAlignment('center');
        
        // ตรวจสอบว่า frozen rows ถูกต้องหรือไม่
        if (this.worksheet.getFrozenRows() !== 1) {
          this.worksheet.setFrozenRows(1);
        }
        
        Logger.success('Headers repaired successfully', { 
          fixed: CONFIG.HEADERS.length 
        });
      } else {
        Logger.info('Headers are valid.');
      }
    } catch (err) {
      Logger.error('Header validation failed', err.toString());
      // ไม่ throw error เพื่อไม่ให้ระบบหยุดทำงาน
    }
  }
  
  _parseNumber(v) {
    if (v === '' || v === null || v === undefined) return '';
    const n = parseFloat(v);
    return isNaN(n) ? '' : n;
  }

  saveData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data provided to save.');
    }
    try {
      // ตรวจสอบและซ่อมแซม headers ก่อนบันทึกข้อมูล
      this.validateAndRepairHeaders();
      
      const timestamp = new Date();
      // แปลงเป็น พ.ศ. (พุทธศักราช) รูปแบบ: 24/1/2569 16:52:18
      const buddhistYear = timestamp.getFullYear() + 543;
      const day = timestamp.getDate();
      const month = timestamp.getMonth() + 1;
      const time = Utilities.formatDate(timestamp, 'Asia/Bangkok', 'HH:mm:ss');
      const timestampStr = `${day}/${month}/${buddhistYear} ${time}`;
      
      const dataMap = (item, index) => ({
        'เวลาบันทึก': timestampStr,
        'ลำดับชุดข้อมูลที่': item.setNumber || (index + 1),
        'วันที่': item.date || '',
        'เครื่องทอ NO': item.machine || '',
        'พนักงานทอ กะ A': item.employeeA || '',
        'พนักงานทอ กะ B': '', // ปล่อยว่าง
        'ขนาดหน้าผ้า': item.fabricSize || '',
        'Lot.No': item.lotNo || '',
        'เลขที่ใบสั่งผลิต': item.orderNo || '',
        'ยอดทอ กะ A': this._parseNumber(item.productionA),
        'ยอดทอ กะ B': '', // ปล่อยว่าง
        'ความเร็วรอบ กะ A': this._parseNumber(item.speedA),
        'ความเร็วรอบ กะ B': '', // ปล่อยว่าง
        'ประสิทธิภาพ กะ A': this._parseNumber(item.efficiencyA),
        'ประสิทธิภาพ กะ B': '', // ปล่อยว่าง
        'มิเตอร์เริ่มงาน กะ A': this._parseNumber(item.meterStartA),
        'มิเตอร์เลิกงาน กะ A': this._parseNumber(item.meterEndA),
        'มิเตอร์เริ่มงาน กะ B': '', // ปล่อยว่าง
        'มิเตอร์เลิกงาน กะ B': '', // ปล่อยว่าง
        'ความยาวตัดม้วน กะ A': this._parseNumber(item.lengthA),
        'ความยาวตัดม้วน กะ B': '' // ปล่อยว่าง
      });
      
      const rows = data.map((item, index) => {
        const mappedData = dataMap(item, index);
        return CONFIG.HEADERS.map(header => mappedData[header] !== undefined ? mappedData[header] : '');
      });

      const startRow = this.worksheet.getLastRow() + 1;
      const range = this.worksheet.getRange(startRow, 1, rows.length, CONFIG.HEADERS.length);
      range.setValues(rows);
      this.formatNewData(startRow, rows.length);
      
      Logger.success(`Successfully saved ${rows.length} rows.`);
      return { success: true, rowsAdded: rows.length, startRow };
    } catch (err) {
      Logger.error('Save data failed', err.toString());
      throw err;
    }
  }

  formatNewData(startRow, numRows) {
    try {
      const range = this.worksheet.getRange(startRow, 1, numRows, CONFIG.HEADERS.length);
      range.setHorizontalAlignment('center')
           .setVerticalAlignment('middle')
           .setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    } catch (err) {
      Logger.warn('Formatting new rows failed', err.toString());
    }
  }
}

// ===================== BACKUP MANAGER =====================
class BackupManager {
  static createBackup(data) {
    if (!CONFIG.BACKUP_ENABLED) return null;
    try {
      const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
      const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss');
      const filename = `Backup_ShiftA_${timestamp}.json`;
      const content = JSON.stringify({ timestamp: new Date(), data: data }, null, 2);
      const file = folder.createFile(filename, content, MimeType.PLAIN_TEXT);
      Logger.success('Backup created', { filename, fileId: file.getId() });
      return { filename, fileId: file.getId(), url: file.getUrl() };
    } catch (err) {
      Logger.error('Backup creation failed', err.toString());
      return null;
    }
  }
}

// ===================== HELPERS =====================
function getSheetsManager() {
  if (!_SHEETS_MANAGER) {
    _SHEETS_MANAGER = new SheetsManager();
  }
  return _SHEETS_MANAGER;
}

function createJsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonpOutput(obj, callback) {
  const json = JSON.stringify(obj);
  return ContentService.createTextOutput(`${callback}(${json});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ===================== REQUEST PARSING =====================
function parseIncoming(e) {
  try {
    // Handle POST data
    if (e && e.postData && e.postData.contents) {
      const parsed = JSON.parse(e.postData.contents);
      Logger.info('Parsed POST data', { keys: Object.keys(parsed) });
      return parsed;
    }
    
    // Handle GET parameters
    if (e && e.parameter) {
      Logger.info('Parsed GET parameters', { keys: Object.keys(e.parameter) });
      return e.parameter;
    }
    
    return {};
  } catch (err) {
    Logger.error('Parse incoming failed', err.toString());
    throw new Error('Invalid request data');
  }
}

function normalizeRequest(raw) {
  // Normalize data structure
  const data = raw.data || raw;
  const dataArray = data.data || data;
  
  return {
    date: raw.date || '',
    shift: raw.shift || CONFIG.SHIFT,
    reporter: raw.reporter || '',
    data: Array.isArray(dataArray) ? dataArray : []
  };
}

// ===================== MAIN HANDLER =====================
function handleSaveAction(requestData) {
  try {
    Logger.info('Processing save request', { 
      dataCount: requestData.data ? requestData.data.length : 0 
    });
    
    if (!requestData.data || requestData.data.length === 0) {
      throw new Error('No data to save');
    }
    
    const manager = getSheetsManager();
    const result = manager.saveData(requestData.data);
    
    // Create backup
    const backup = BackupManager.createBackup(requestData);
    
    return {
      success: true,
      message: `บันทึกข้อมูลสำเร็จ: ${result.rowsAdded} รายการ`,
      result: result,
      backup: backup,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    Logger.error('Handle save action failed', err.toString());
    throw err;
  }
}

// ===================== HTTP HANDLERS =====================
/**
 * Handle GET requests (for testing and JSONP)
 */
function doGet(e) {
  try {
    Logger.info('GET request received', e ? e.parameter : null);
    
    // JSONP callback support
    const callback = e && e.parameter ? e.parameter.callback : null;
    
    const response = {
      success: true,
      message: `Shift ${CONFIG.SHIFT} endpoint OK`,
      version: CONFIG.VERSION,
      timestamp: new Date().toISOString(),
      shift: CONFIG.SHIFT
    };
    
    if (callback) {
      Logger.info('Returning JSONP response', { callback });
      return createJsonpOutput(response, callback);
    }
    
    return createJsonOutput(response);
  } catch (err) {
    Logger.error('doGet failed', err.toString());
    return createJsonOutput({
      success: false,
      error: err.toString(),
      shift: CONFIG.SHIFT
    });
  }
}

/**
 * Handle POST requests (main data submission)
 */
function doPost(e) {
  try {
    Logger.info('POST request received');
    
    // Parse incoming data
    const rawData = parseIncoming(e);
    const requestData = normalizeRequest(rawData);
    
    // Validate
    if (!requestData.data || requestData.data.length === 0) {
      throw new Error('No data provided in request');
    }
    
    // Process save
    const result = handleSaveAction(requestData);
    
    Logger.success('POST request completed successfully');
    return createJsonOutput(result);
    
  } catch (err) {
    Logger.error('doPost failed', err.toString());
    return createJsonOutput({
      success: false,
      error: err.toString(),
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      shift: CONFIG.SHIFT,
      timestamp: new Date().toISOString()
    });
  }
}

// ===================== UTILITY FUNCTIONS =====================
/**
 * Test function to verify setup
 */
function testSetup() {
  try {
    Logger.info('Running setup test...');
    const manager = getSheetsManager();
    Logger.success('Setup test passed', {
      sheetName: CONFIG.SHEET_NAME,
      sheetId: CONFIG.SHEET_ID,
      headers: CONFIG.HEADERS.length
    });
    return true;
  } catch (err) {
    Logger.error('Setup test failed', err.toString());
    return false;
  }
}

/**
 * Get system logs
 */
function getSystemLogs() {
  try {
    const props = PropertiesService.getScriptProperties();
    const logs = props.getProperty('systemLogs');
    return logs ? JSON.parse(logs) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Clear system logs
 */
function clearSystemLogs() {
  try {
    PropertiesService.getScriptProperties().deleteProperty('systemLogs');
    Logger.success('System logs cleared');
    return true;
  } catch (err) {
    Logger.error('Failed to clear logs', err.toString());
    return false;
  }
}
