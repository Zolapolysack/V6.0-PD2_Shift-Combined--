// ========================================
// PD2 Upload Module - Data Processor
// Pure JavaScript implementation matching ref.py 100%
// ========================================

// Constants from ref.py
const PRIMARY_MACHINE_ORDER = [
    'CL1','CL2','CL3','CL4','CL5','CL6','CL7','CL8','CL9','CL12','CL13','CL14','CL15',
    'CL16','CL17','CL19','CL25','CL26','CL27','CL28','CL29','CL30','CL31','CL32','CL33',
    'CL44','CL45','CL46','CL47','CL48','CL49','CL50','CL51','CL52','CL53','CL54','CL55',
    'CL56','CL57','CL58','CL59','CL60','CL61','CL62','CL63','CL64','CL65','CL66','CL67',
    'CL68','CL69','CL70','CL71','CL72','CL73','CL74','CL75','CL76','CL77','CL78','CL79',
    'CL80','CL81','CL82','CL83','CL84','CL85','CL86','CL87','CL88','CL89','CL90','CL91',
    'CL92','CL93','CL94','CL95','CL34','CL35','CL36'
];

const CODE_MAPPING = {
    '1625800':'01','1825800':'02','1825800SM':'03','1925800':'04','1925800SM':'05',
    '1921720':'06','2025700':'07','2025800':'08','2025800SM':'09','2021750':'10',
    '2125650':'11','2121670SM':'12','2325650':'13','1425800':'14','2625650':'15',
    '262575051':'16','1725800':'17','2625800':'18','2025850':'19','2221940':'20',
    'SCL0223211125':'21','SCL052325650':'22','2321750':'23','2421112512551':'24',
    '20251000':'25','2625850SM':'26','2325800SM':'27','2825850':'28','2125800SMN':'29',
    '19251000SM':'30','1625800SM':'31','2021720UV':'32','23211125130':'33',
    '2321112512551':'34','2321112514051':'35','2025650':'36','2125700':'37',
    '2125800':'38','2021850UV':'39','1R042325650':'40','1621720SMFX':'41',
    'FCL022325650':'42','23211125120SMFX':'43'
};

// File storage
let uploadedFiles = {
    A: null,
    B: null,
    C: null
};

let processedData = null;

// Load SheetJS dynamically for reading files
if (!window.XLSX) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(script);
}

// ========================================
// Utility Functions
// ========================================

function normalizeCode(val) {
    if (!val) return '';
    return String(val).trim().replace(/\s+/g, '').toUpperCase();
}

function mapCode(rawValue) {
    const key = normalizeCode(rawValue);
    if (!key) return null;
    
    let code = CODE_MAPPING[key];
    if (!code && key.endsWith('SM')) {
        code = CODE_MAPPING[key.slice(0, -2)];
    }
    return code;
}

function assignProductionCode(row) {
    const now = new Date();
    const buddhistYear = now.getFullYear() + 543;
    const prefix = `${String(buddhistYear % 100).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const sizeCode = row['ขนาดหน้าผ้า (รหัส)'] || row['ขนาดหน้าผ้า_รหัส'] || '';
    const code2 = mapCode(sizeCode);
    
    if (code2) {
        row['เลขที่ใบสั่งผลิต'] = prefix + code2;
    }
    return row;
}

function extractMachineNumber(machineName) {
    if (!machineName) return 0;
    const match = String(machineName).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

function detectCutIteration(machineName) {
    if (!machineName) return 0;
    const name = String(machineName);
    if (name.includes('ตัดม้วนครั้งที่ 2')) return 2;
    if (name.includes('ตัดม้วนครั้งที่ 3')) return 3;
    return 0;
}

function normalizeColumnName(name) {
    if (!name) return '';
    const str = String(name).trim();
    
    // Normalize machine column
    if (str.includes('เครื่อง') && str.toUpperCase().includes('NO')) {
        return 'เครื่องทอ NO';
    }
    
    // Normalize size column
    if (str.includes('ขนาด') && str.includes('หน้าผ้า')) {
        if (str.includes('รหัส')) return 'ขนาดหน้าผ้า (รหัส)';
        return 'ขนาดหน้าผ้า_รหัส';
    }
    
    return str;
}

// ========================================
// File Upload Handlers
// ========================================

function setupFileUpload(fileType) {
    const dropZone = document.getElementById(`dropZone${fileType}`);
    const fileInput = document.getElementById(`fileInput${fileType}`);
    const fileInfo = document.getElementById(`fileInfo${fileType}`);

    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0], fileType);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], fileType);
        }
    });
}

function handleFileSelect(file, fileType) {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
        showNotification('กรุณาเลือกไฟล์ Excel หรือ CSV เท่านั้น', 'error');
        return;
    }

    uploadedFiles[fileType] = file;
    displayFileInfo(file, fileType);
    checkReadyToProcess();
    showNotification(`อัพโหลดไฟล์ ${fileType} สำเร็จ`, 'success');
}

function displayFileInfo(file, fileType) {
    const fileInfo = document.getElementById(`fileInfo${fileType}`);
    const dropZone = document.getElementById(`dropZone${fileType}`);
    
    const fileSize = (file.size / 1024).toFixed(2);
    const fileSizeUnit = fileSize < 1024 ? 'KB' : 'MB';
    const fileSizeDisplay = fileSize < 1024 ? fileSize : (fileSize / 1024).toFixed(2);
    
    fileInfo.innerHTML = `
        <div class="file-item glass-strong rounded-lg p-3 flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">${file.name}</p>
                    <p class="text-xs text-blue-200/60">${fileSizeDisplay} ${fileSizeUnit}</p>
                </div>
            </div>
            <button onclick="removeFile('${fileType}')" class="flex-shrink-0 ml-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-colors">
                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    fileInfo.classList.remove('hidden');
    dropZone.classList.add('hidden');
}

function removeFile(fileType) {
    uploadedFiles[fileType] = null;
    document.getElementById(`fileInfo${fileType}`).classList.add('hidden');
    document.getElementById(`dropZone${fileType}`).classList.remove('hidden');
    document.getElementById(`fileInput${fileType}`).value = '';
    checkReadyToProcess();
    showNotification(`ลบไฟล์ ${fileType} แล้ว`, 'warning');
}

function checkReadyToProcess() {
    const processBtn = document.getElementById('processBtn');
    const hasRequiredFiles = uploadedFiles.A && uploadedFiles.B;
    processBtn.disabled = !hasRequiredFiles;
}

// ========================================
// File Reading Functions
// ========================================

async function readFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
        return await readCSVFile(file);
    } else {
        return await readExcelFile(file);
    }
}

async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (typeof XLSX === 'undefined') {
                    reject(new Error('XLSX library not loaded'));
                    return;
                }
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const data = lines.map(line => {
                    // Simple CSV parsing
                    return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
                });
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
    });
}

function findHeaderRow(data) {
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        for (let cell of row) {
            const cellStr = String(cell).trim();
            if (cellStr.includes('เครื่อง') && cellStr.toUpperCase().includes('NO')) {
                return i;
            }
        }
    }
    return -1;
}

// ========================================
// Data Processing (matching ref.py 100%)
// ========================================

async function processFiles() {
    try {
        // Show progress
        document.getElementById('progressSection').classList.remove('hidden');
        updateProgress(10, 'กำลังอ่านไฟล์...');

        // Read files
        const fileAData = await readFile(uploadedFiles.A);
        updateProgress(30, 'ประมวลผลไฟล์กะ A...');

        const fileBData = await readFile(uploadedFiles.B);
        updateProgress(50, 'ประมวลผลไฟล์กะ B...');

        let fileCData = null;
        if (uploadedFiles.C) {
            fileCData = await readFile(uploadedFiles.C);
            updateProgress(60, 'ประมวลผลไฟล์เสริม...');
        }

        // Process data
        updateProgress(70, 'จัดเรียงและรวมข้อมูล...');
        const processed = await processData(fileAData, fileBData, fileCData);

        updateProgress(80, 'สร้างรายงาน Excel พร้อม formatting...');
        
        // Use ExcelJS generator for full formatting (100% compatible with ref.py)
        const generator = new PD2ExcelGenerator(
            processed.primaryData,
            processed.extraData,
            processed.hasFileC
        );
        const excelFile = await generator.generate();

        updateProgress(100, 'เสร็จสิ้น!');
        
        // Show results
        setTimeout(() => {
            document.getElementById('progressSection').classList.add('hidden');
            displayResults(processed, excelFile);
        }, 500);

    } catch (error) {
        console.error('Error processing files:', error);
        showNotification('เกิดข้อผิดพลาดในการประมวลผล: ' + error.message, 'error');
        document.getElementById('progressSection').classList.add('hidden');
    }
}

async function processData(dataA, dataB, dataC) {
    // Find headers
    const headerRowA = findHeaderRow(dataA);
    const headerRowB = findHeaderRow(dataB);
    
    if (headerRowA === -1 || headerRowB === -1) {
        throw new Error('ไม่พบหัวตารางในไฟล์ กรุณาตรวจสอบรูปแบบไฟล์');
    }

    // Extract data
    const headersA = dataA[headerRowA];
    const rowsA = dataA.slice(headerRowA + 1).filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));
    
    const headersB = dataB[headerRowB];
    const rowsB = dataB.slice(headerRowB + 1).filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));

    // Convert to objects
    const processedA = rowsA.map(row => {
        const obj = {};
        headersA.forEach((header, idx) => {
            const key = normalizeColumnName(header);
            obj[key] = row[idx] || '';
        });
        return assignProductionCode(obj);
    });

    const processedB = rowsB.map(row => {
        const obj = {};
        headersB.forEach((header, idx) => {
            const key = normalizeColumnName(header);
            obj[key] = row[idx] || '';
        });
        return assignProductionCode(obj);
    });

    // Process file C if exists
    let processedC = [];
    if (dataC && dataC.length > 0) {
        const headerRowC = findHeaderRow(dataC);
        if (headerRowC !== -1) {
            const headersC = dataC[headerRowC];
            const rowsC = dataC.slice(headerRowC + 1).filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));
            processedC = rowsC.map(row => {
                const obj = {};
                headersC.forEach((header, idx) => {
                    const key = normalizeColumnName(header);
                    obj[key] = row[idx] || '';
                });
                return obj;
            });
        }
    }

    // Build primary block (83 machines from PRIMARY_MACHINE_ORDER)
    const primaryData = buildPrimaryBlock(processedA, processedB, processedC);

    // Build extra block (cut rounds 2 & 3)
    const extraData = buildExtraBlock(processedA, processedB);

    // Assign Lot.No to all data
    assignLotNumbers([...primaryData, ...extraData]);

    return {
        primaryData: primaryData,
        extraData: extraData,
        combined: [...primaryData, ...extraData],
        countA: processedA.length,
        countB: processedB.length,
        hasFileC: processedC.length > 0
    };
}

function buildPrimaryBlock(dataA, dataB, dataC) {
    const machineMapA = new Map();
    const machineMapB = new Map();
    const machineMapC = new Map();

    // Map data by machine (primary machines only, no cut rounds)
    dataA.forEach(row => {
        const machine = row['เครื่องทอ NO'];
        if (machine && !String(machine).includes('ตัดม้วนครั้งที่')) {
            machineMapA.set(machine, row);
        }
    });

    dataB.forEach(row => {
        const machine = row['เครื่องทอ NO'];
        if (machine && !String(machine).includes('ตัดม้วนครั้งที่')) {
            machineMapB.set(machine, row);
        }
    });

    dataC.forEach(row => {
        const machine = row['เครื่องทอ NO'];
        if (machine) {
            machineMapC.set(machine, row);
        }
    });

    // Build rows following PRIMARY_MACHINE_ORDER (83 machines)
    const rows = [];
    PRIMARY_MACHINE_ORDER.forEach(machine => {
        const rowA = machineMapA.get(machine) || {};
        const rowB = machineMapB.get(machine) || {};
        const rowC = machineMapC.get(machine) || {};

        // Merge data from all sources
        const merged = {
            'เครื่องทอ NO': machine,
            'พนักงานทอ กะ A': rowA['พนักงานทอ กะ A'] || '',
            'พนักงานทอ กะ B': rowB['พนักงานทอ กะ B'] || '',
            'ขนาดหน้าผ้า (รหัส)': rowA['ขนาดหน้าผ้า (รหัส)'] || rowA['ขนาดหน้าผ้า_รหัส'] || rowB['ขนาดหน้าผ้า (รหัส)'] || rowB['ขนาดหน้าผ้า_รหัส'] || '',
            'Lot.No': rowA['Lot.No'] || rowB['Lot.No'] || '',
            'เลขที่ใบสั่งผลิต': rowA['เลขที่ใบสั่งผลิต'] || rowB['เลขที่ใบสั่งผลิต'] || '',
            'ความเร็วรอบ กะ A': rowA['ความเร็วรอบ กะ A'] || '',
            'ความเร็วรอบ กะ B': rowB['ความเร็วรอบ กะ B'] || '',
            'ประสิทธิภาพ กะ A': rowA['ประสิทธิภาพ กะ A'] || '',
            'ประสิทธิภาพ กะ B': rowB['ประสิทธิภาพ กะ B'] || '',
            'มิเตอร์เริ่มงาน กะ A': rowA['มิเตอร์เริ่มงาน กะ A'] || '',
            'มิเตอร์เลิกงาน กะ A': rowA['มิเตอร์เลิกงาน กะ A'] || '',
            'มิเตอร์เริ่มงาน กะ B': rowB['มิเตอร์เริ่มงาน กะ B'] || '',
            'มิเตอร์เลิกงาน กะ B': rowB['มิเตอร์เลิกงาน กะ B'] || '',
            'ความยาวตัดม้วน กะ A': rowA['ความยาวตัดม้วน กะ A'] || '',
            'ความยาวตัดม้วน กะ B': rowB['ความยาวตัดม้วน กะ B'] || '',
            'Y': rowC['ความยาวตัดม้วน กะ A'] || rowC['Y'] || '',
            'Z': rowC['ความยาวตัดม้วน กะ B'] || rowC['Z'] || ''
        };

        rows.push(merged);
    });

    return rows;
}

function buildExtraBlock(dataA, dataB) {
    const extraMachines = new Map();

    // Collect all cut round machines
    [...dataA, ...dataB].forEach(row => {
        const machine = row['เครื่องทอ NO'];
        if (machine && (String(machine).includes('ตัดม้วนครั้งที่ 2') || String(machine).includes('ตัดม้วนครั้งที่ 3'))) {
            if (!extraMachines.has(machine)) {
                extraMachines.set(machine, {
                    machine: machine,
                    A: null,
                    B: null
                });
            }

            // Detect if this is shift A or B
            const hasShiftAData = row['พนักงานทอ กะ A'] || row['ความเร็วรอบ กะ A'] || row['มิเตอร์เริ่มงาน กะ A'];
            if (hasShiftAData) {
                extraMachines.get(machine).A = row;
            } else {
                extraMachines.get(machine).B = row;
            }
        }
    });

    // Build rows for extra machines
    const rows = [];
    extraMachines.forEach((data, machine) => {
        const rowA = data.A || {};
        const rowB = data.B || {};

        rows.push({
            'เครื่องทอ NO': machine,
            'พนักงานทอ กะ A': rowA['พนักงานทอ กะ A'] || '',
            'พนักงานทอ กะ B': rowB['พนักงานทอ กะ B'] || '',
            'ขนาดหน้าผ้า (รหัส)': rowA['ขนาดหน้าผ้า (รหัส)'] || rowA['ขนาดหน้าผ้า_รหัส'] || rowB['ขนาดหน้าผ้า (รหัส)'] || rowB['ขนาดหน้าผ้า_รหัส'] || '',
            'Lot.No': rowA['Lot.No'] || rowB['Lot.No'] || '',
            'เลขที่ใบสั่งผลิต': rowA['เลขที่ใบสั่งผลิต'] || rowB['เลขที่ใบสั่งผลิต'] || '',
            'ความเร็วรอบ กะ A': rowA['ความเร็วรอบ กะ A'] || '',
            'ความเร็วรอบ กะ B': rowB['ความเร็วรอบ กะ B'] || '',
            'ประสิทธิภาพ กะ A': rowA['ประสิทธิภาพ กะ A'] || '',
            'ประสิทธิภาพ กะ B': rowB['ประสิทธิภาพ กะ B'] || '',
            'มิเตอร์เริ่มงาน กะ A': rowA['มิเตอร์เริ่มงาน กะ A'] || '',
            'มิเตอร์เลิกงาน กะ A': rowA['มิเตอร์เลิกงาน กะ A'] || '',
            'มิเตอร์เริ่มงาน กะ B': rowB['มิเตอร์เริ่มงาน กะ B'] || '',
            'มิเตอร์เลิกงาน กะ B': rowB['มิเตอร์เลิกงาน กะ B'] || '',
            'ความยาวตัดม้วน กะ A': rowA['ความยาวตัดม้วน กะ A'] || '',
            'ความยาวตัดม้วน กะ B': rowB['ความยาวตัดม้วน กะ B'] || ''
        });
    });

    // Sort by machine number and cut iteration
    rows.sort((a, b) => {
        const numA = extractMachineNumber(a['เครื่องทอ NO']);
        const numB = extractMachineNumber(b['เครื่องทอ NO']);
        if (numA !== numB) return numA - numB;

        const iterA = detectCutIteration(a['เครื่องทอ NO']);
        const iterB = detectCutIteration(b['เครื่องทอ NO']);
        return iterA - iterB;
    });

    return rows;
}

function assignLotNumbers(rows) {
    const now = new Date();
    const buddhistYear = now.getFullYear() + 543;
    const yearStr = String(buddhistYear % 100).padStart(2, '0');
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const prefix = `${yearStr}${monthStr}${dayStr}`;

    let seq = 1;
    rows.forEach(row => {
        const cutA = row['ความยาวตัดม้วน กะ A'];
        const cutB = row['ความยาวตัดม้วน กะ B'];
        
        const hasA = cutA && parseFloat(cutA) > 0;
        const hasB = cutB && parseFloat(cutB) > 0;

        if (hasA || hasB) {
            row['Lot.No'] = `${prefix}${String(seq).padStart(2, '0')}`;
            seq++;
        }
    });
}

// ========================================
// UI Updates
// ========================================

function updateProgress(percent, text) {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = percent + '%';
    if (progressPercent) progressPercent.textContent = percent + '%';
    if (progressText) progressText.textContent = text;
}

function displayResults(data, excelFile) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsContent.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
            <div class="glass-strong rounded-lg p-4 text-center">
                <p class="text-sm text-blue-200/80 mb-1">กะ A</p>
                <p class="text-2xl font-bold text-emerald-400">${data.countA}</p>
                <p class="text-xs text-blue-200/60">รายการ</p>
            </div>
            <div class="glass-strong rounded-lg p-4 text-center">
                <p class="text-sm text-blue-200/80 mb-1">กะ B</p>
                <p class="text-2xl font-bold text-purple-400">${data.countB}</p>
                <p class="text-xs text-blue-200/60">รายการ</p>
            </div>
            <div class="glass-strong rounded-lg p-4 text-center">
                <p class="text-sm text-blue-200/80 mb-1">รวมทั้งหมด</p>
                <p class="text-2xl font-bold text-indigo-400">${data.combined.length}</p>
                <p class="text-xs text-blue-200/60">รายการ</p>
            </div>
        </div>
        ${data.hasFileC ? '<div class="mt-3 text-sm text-amber-300 flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>รวมข้อมูลจากไฟล์เสริม (C) แล้ว</span></div>' : ''}
    `;
    
    resultsSection.classList.remove('hidden');
    
    // Store file for download
    processedData = { data, excelFile };
    
    showNotification('สร้างรายงานสำเร็จแล้ว!', 'success');
}

function showNotification(message, type = 'info') {
    // Use pd2-notify.js if available
    if (typeof showPD2Notification === 'function') {
        showPD2Notification(message, type);
    } else {
        // Fallback to console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ========================================
// Download Handler
// ========================================

function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!processedData) {
                showNotification('ไม่พบข้อมูลที่จะดาวน์โหลด', 'error');
                return;
            }

            // Generate filename matching ref.py format: รายงานสรุปผลผลิตรายเครื่อง_DD-MM-YYYY_HHMMSS.xlsx
            const now = new Date();
            const buddhistYear = now.getFullYear() + 543;
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timestamp = `${day}-${month}-${buddhistYear}_${hours}${minutes}${seconds}`;
            
            const filename = `รายงานสรุปผลผลิตรายเครื่อง_${timestamp}.xlsx`;
            
            const url = URL.createObjectURL(processedData.excelFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('ดาวน์โหลดรายงานสำเร็จ!', 'success');
        });
    }
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Setup file uploads
    setupFileUpload('A');
    setupFileUpload('B');
    setupFileUpload('C');
    
    // Process button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.addEventListener('click', processFiles);
    }
    
    // Download button
    setupDownloadButton();
    
    console.log('PD2 Upload Module initialized');
});
