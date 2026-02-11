# 📊 Dashboard Development Guide
### แนวทางการพัฒนา Dashboard สำหรับระบบ Production Tracking

---

## 📑 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
3. [โครงสร้างไฟล์](#โครงสร้างไฟล์)
4. [องค์ประกอบหลัก](#องค์ประกอบหลัก)
5. [การทำงานของระบบ](#การทำงานของระบบ)
6. [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
7. [การติดตั้งและใช้งาน](#การติดตั้งและใช้งาน)
8. [การปรับแต่งและขยายระบบ](#การปรับแต่งและขยายระบบ)
9. [Best Practices](#best-practices)

---

## ภาพรวมระบบ

### 🎯 วัตถุประสงค์
ระบบ Dashboard นี้พัฒนาขึ้นเพื่อ:
- **ติดตามความคืบหน้า** ของยอดผลิตแต่ละ S/O (Sales Order)
- **แสดงข้อมูลเชิงภาพ** ผ่าน KPI Cards, Progress Bar, Charts และ Tables
- **วิเคราะห์ประสิทธิภาพ** การผลิตแบบ Real-time
- **รองรับการตัดสินใจ** ด้วยข้อมูลที่แม่นยำและทันสมัย

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (HTML/JS)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Dashboard UI (dashboard.html)                        │  │
│  │  - KPI Cards                                          │  │
│  │  - Charts (Chart.js)                                  │  │
│  │  - Data Tables                                        │  │
│  │  - Interactive Controls                               │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Google Apps Script)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Layer (Code.gs)                                  │  │
│  │  - doGet() → Handle API Requests                      │  │
│  │  - getSOList() → รายการ S/O ทั้งหมด                  │  │
│  │  - getSOProgress() → ข้อมูลความคืบหน้า               │  │
│  │  - Data Processing & Aggregation                      │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Google Sheets                                        │  │
│  │  - Database Sheet (Master Data)                       │  │
│  │  - Daily Report Sheets                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## สถาปัตยกรรมระบบ

### 1. **Frontend Architecture** (Client-Side)

```
dashboard.html
├── HTML Structure
│   ├── Header (Navigation & Branding)
│   ├── Control Panel (Filters & Inputs)
│   ├── KPI Cards Section
│   ├── Progress Bar Section
│   ├── Charts Section (Bar Chart)
│   └── Data Table Section
│
├── CSS Styling
│   ├── Apple-inspired Design System
│   ├── Responsive Grid Layout
│   ├── Animation & Transitions
│   └── Custom Components
│
└── JavaScript Logic
    ├── Data Fetching (Async/Await)
    ├── State Management
    ├── Chart Rendering (Chart.js)
    ├── Data Processing
    └── Event Handlers
```

### 2. **Backend Architecture** (Server-Side)

```
Code.gs (Google Apps Script)
├── API Endpoints
│   ├── doGet(e) → Main Request Handler
│   ├── getSOList() → S/O Master List
│   ├── getSOProgress(soNumber, dates) → Progress Data
│   └── saveToDatabaseSheet() → Data Persistence
│
├── Data Processing
│   ├── Query Google Sheets
│   ├── Filter & Aggregate Data
│   ├── Calculate Metrics
│   └── Format Response
│
└── Utility Functions
    ├── Date Formatting
    ├── Data Validation
    └── Error Handling
```

---

## โครงสร้างไฟล์

### 📁 ไฟล์หลักของระบบ

```
production/
├── dashboard.html              # หน้า Dashboard หลัก
├── pd3_production_v3.html      # ฟอร์มบันทึกข้อมูล
├── index.html                  # Landing Page (Redirect)
├── Code.gs                     # Backend API (Google Apps Script)
└── data/
    └── brands_array.js         # Static Data (Product Brands)
```

### 📄 คำอธิบายแต่ละไฟล์

#### **1. dashboard.html** (1,874 บรรทัด)
- **หน้าที่**: แสดงผล Dashboard และวิเคราะห์ข้อมูล
- **ขนาด**: ~80 KB
- **ส่วนประกอบ**:
  - HTML Structure (บรรทัด 1-600)
  - CSS Styling (บรรทัด 12-500)
  - JavaScript Logic (บรรทัด 600-1874)

#### **2. pd3_production_v3.html** (4,080 บรรทัด)
- **หน้าที่**: ฟอร์มบันทึกยอดผลิตรายวัน
- **ขนาด**: ~165 KB
- **ส่วนประกอบ**:
  - Form UI (เลือกวันที่, เครื่องจักร, กะ)
  - Product Entry System
  - Data Validation
  - API Integration

#### **3. Code.gs** (910 บรรทัด)
- **หน้าที่**: Backend API สำหรับ Google Sheets
- **ขนาด**: ~32 KB
- **ส่วนประกอบ**:
  - API Request Handling
  - Google Sheets Operations
  - Data Aggregation Logic
  - Database Management

#### **4. brands_array.js** (742 บรรทัด)
- **หน้าที่**: รายการสินค้าที่ใช้ในระบบ
- **ขนาด**: ~8 KB
- **รูปแบบ**: JavaScript Array

---

## องค์ประกอบหลัก

### 1. 🎨 **User Interface Components**

#### **A. KPI Cards** - แสดงตัวเลขสำคัญ

```html
<!-- 5 Cards หลัก -->
<div class="kpi-card">
  <div class="kpi-label">เป้าหมาย</div>
  <div class="kpi-value" id="kpiTarget">0</div>
</div>
```

**KPI Cards ที่มี:**
1. **เป้าหมาย (Target)** - ยอดผลิตที่ต้องการ
2. **ยอดผลิตจริง (Actual)** - ยอดที่ผลิตได้แล้ว
3. **คงเหลือ (Remaining)** - ยอดที่ต้องทำต่อ
4. **ชื่อสินค้า (Product)** - รายละเอียดสินค้า
5. **ความคืบหน้า (Progress %)** - เปอร์เซ็นต์ที่ทำได้

#### **B. Progress Bar** - แสดงความคืบหน้าแบบภาพ

```html
<div class="progress-container">
  <div class="progress-bar" id="progressBar" style="width: 0%"></div>
</div>
```

**คุณสมบัติ:**
- แสดงเปอร์เซ็นต์แบบ Real-time
- Animation ที่ Smooth
- Gradient Color (Blue → Green)
- Shimmer Effect

#### **C. Bar Chart** - กราฟแท่งแสดงข้อมูล

```javascript
// ใช้ Chart.js
const chart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: chartOptions
});
```

**รองรับ 3 โหมด:**
1. **Daily View** - ดูข้อมูลรายวัน
2. **Weekly View** - ดูข้อมูลรายสัปดาห์
3. **Monthly View** - ดูข้อมูลรายเดือน

#### **D. Data Table** - ตารางข้อมูลละเอียด

```html
<table class="data-table">
  <thead>
    <tr>
      <th>วันที่</th>
      <th>เครื่องจักร</th>
      <th>กะ</th>
      <th>จำนวน</th>
    </tr>
  </thead>
  <tbody id="dataTableBody"></tbody>
</table>
```

**คุณสมบัติ:**
- Sortable Columns
- Search/Filter
- Export to Excel (ถ้าต้องการ)
- Pagination (สำหรับข้อมูลเยอะ)

---

### 2. 🔧 **Core Functions**

#### **A. Data Fetching Functions**

```javascript
// โหลดรายการ S/O ทั้งหมด
async function loadSOList() {
  const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getSOList`;
  const response = await fetch(url);
  const result = await response.json();
  // Process data...
}

// โหลดข้อมูล S/O ที่เลือก
async function loadSOData() {
  const soNumber = document.getElementById('soInput').value;
  const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getSOProgress&soNumber=${soNumber}`;
  const response = await fetch(url);
  // Process data...
}
```

#### **B. Chart Rendering Functions**

```javascript
// อัพเดทกราฟแท่ง
function updateBarChart(records, progress) {
  // Destroy old chart
  if (barChartInstance) barChartInstance.destroy();
  
  // Process data based on view mode
  let labels, dataValues, colors;
  switch(viewMode) {
    case 'daily': // ...
    case 'weekly': // ...
    case 'monthly': // ...
  }
  
  // Create new chart
  barChartInstance = new Chart(ctx, config);
}
```

#### **C. Data Processing Functions**

```javascript
// คำนวณข้อมูลสถิติ
function calculateStatistics(records) {
  const total = records.reduce((sum, r) => sum + r.quantity, 0);
  const avg = total / records.length;
  const max = Math.max(...records.map(r => r.quantity));
  return { total, avg, max };
}

// จัดกลุ่มข้อมูลตามวัน/สัปดาห์/เดือน
function groupByPeriod(records, period) {
  // Group logic...
}
```

#### **D. UI Update Functions**

```javascript
// อัพเดท KPI Cards
function updateKPICards(data) {
  document.getElementById('kpiTarget').textContent = data.target.toLocaleString();
  document.getElementById('kpiActual').textContent = data.actual.toLocaleString();
  // ...
}

// อัพเดท Progress Bar
function updateProgressBar(percentage) {
  document.getElementById('progressBar').style.width = percentage + '%';
  document.getElementById('progressPercent').textContent = percentage + '%';
}
```

---

### 3. 🎛️ **Control Panel Components**

#### **A. S/O Selector**

```html
<div class="so-selector-container">
  <div class="so-select-wrapper">
    <label class="so-select-label">เลขที่ S/O</label>
    <input type="text" id="soInput" class="so-manual-input" 
           placeholder="พิมพ์เลข S/O...">
  </div>
</div>
```

**คุณสมบัติ:**
- Autocomplete (ค้นหาอัตโนมัติ)
- Dropdown List
- Manual Input

#### **B. Date Range Picker**

```html
<div class="date-range-container">
  <input type="date" id="startDateInput" class="apple-input">
  <span>ถึง</span>
  <input type="date" id="endDateInput" class="apple-input">
</div>
```

**คุณสมบัติ:**
- เลือกช่วงวันที่ผลิต
- Filter ข้อมูลตามช่วงเวลา
- Validation (วันเริ่มต้น < วันสิ้นสุด)

#### **C. Target Input**

```html
<input type="text" id="targetInput" class="apple-input"
       placeholder="ระบุเป้าหมาย (ถ้าต้องการ)"
       oninput="formatNumberInput(this)">
```

**คุณสมบัติ:**
- กำหนดเป้าหมายเอง (Custom Target)
- Format ตัวเลขด้วย Comma
- Override เป้าหมายจากฐานข้อมูล

---

## การทำงานของระบบ

### 📊 **Data Flow Diagram**

```
[User] → [Dashboard UI] → [AJAX Request] → [Google Apps Script API]
                                                      ↓
                                          [Query Google Sheets]
                                                      ↓
                                          [Process & Aggregate Data]
                                                      ↓
                                          [Return JSON Response]
                                                      ↓
[Display Results] ← [Update Charts/Tables] ← [Parse JSON]
```

### 🔄 **Sequence Diagram**

```
1. User Action
   ↓
2. Select S/O from Dropdown
   ↓
3. (Optional) Set Date Range & Target
   ↓
4. Click "คำนวณ" Button
   ↓
5. JavaScript: loadSOData()
   ↓
6. Fetch API Call to Google Apps Script
   ↓
7. Code.gs: doGet(e) → getSOProgress()
   ↓
8. Query Google Sheets Database
   ↓
9. Filter Records by S/O, Date Range
   ↓
10. Calculate: Total, Progress %, Remaining
   ↓
11. Return JSON Response
   ↓
12. JavaScript: displayDashboard(data)
   ↓
13. Update All UI Components:
    - KPI Cards
    - Progress Bar
    - Bar Chart
    - Data Table
   ↓
14. User Sees Results
```

### 🔍 **ตัวอย่างการทำงานแบบละเอียด**

#### **Step 1: การโหลดรายการ S/O**

```javascript
// Frontend: dashboard.html
async function loadSOList() {
  showLoading(true);
  const url = 'https://script.google.com/.../exec?action=getSOList';
  const response = await fetch(url);
  const result = await response.json();
  
  // Populate dropdown
  soList = result.data;
  // ...
}
```

```javascript
// Backend: Code.gs
function getSOList() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dbSheet = ss.getSheetByName('Database');
  const data = dbSheet.getDataRange().getValues();
  
  // Extract unique S/O numbers
  const soMap = new Map();
  data.forEach((row, index) => {
    if (index > 0 && row[4]) { // Column E = S/O
      const soNumber = row[4].toString().trim();
      if (!soMap.has(soNumber)) {
        soMap.set(soNumber, {
          soNumber: soNumber,
          productName: row[3], // Column D
          target: row[7]       // Column H
        });
      }
    }
  });
  
  return Array.from(soMap.values());
}
```

#### **Step 2: การคำนวณความคืบหน้า**

```javascript
// Backend: Code.gs
function getSOProgress(soNumber, startDate, endDate, customTarget) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dbSheet = ss.getSheetByName('Database');
  const data = dbSheet.getDataRange().getValues();
  
  // Filter records
  const records = data.filter((row, index) => {
    if (index === 0) return false; // Skip header
    
    const rowSO = row[4].toString().trim();
    const rowDate = new Date(row[0]); // Column A
    
    // Match S/O
    if (rowSO !== soNumber) return false;
    
    // Date range filter
    if (startDate && rowDate < new Date(startDate)) return false;
    if (endDate && rowDate > new Date(endDate)) return false;
    
    return true;
  });
  
  // Calculate totals
  const actual = records.reduce((sum, row) => sum + (row[5] || 0), 0);
  const target = customTarget || records[0]?.[7] || 0;
  const remaining = target - actual;
  const progress = target > 0 ? (actual / target * 100) : 0;
  
  return {
    soNumber: soNumber,
    productName: records[0]?.[3],
    target: target,
    actual: actual,
    remaining: remaining,
    progress: progress,
    records: records.map(row => ({
      date: row[0],
      machine: row[1],
      shift: row[2],
      quantity: row[5]
    }))
  };
}
```

---

## เทคโนโลยีที่ใช้

### 🛠️ **Frontend Technologies**

| เทคโนโลยี | Version | หน้าที่ | เหตุผลที่เลือกใช้ |
|----------|---------|---------|-------------------|
| **HTML5** | Latest | Structure | มาตรฐาน, Semantic Tags, Accessibility |
| **CSS3** | Latest | Styling | Custom Properties, Flexbox, Grid, Animations |
| **JavaScript ES6+** | Latest | Logic | Async/Await, Arrow Functions, Template Literals |
| **Tailwind CSS** | 3.4.10 | Utility CSS | Rapid Development, Responsive Design |
| **Chart.js** | 4.4.0 | Data Visualization | Easy to Use, Customizable, Responsive Charts |
| **Google Fonts (Kanit)** | - | Typography | Thai Font Support, Professional Look |

### 🔧 **Backend Technologies**

| เทคโนโลยี | หน้าที่ | ข้อดี |
|----------|---------|-------|
| **Google Apps Script** | Server-side Logic | Free, Integrated with Google Workspace |
| **Google Sheets API** | Database | No Setup, Visual Interface, Real-time Updates |
| **Apps Script Web Apps** | API Deployment | Auto HTTPS, CORS Support, Authentication |

### 📦 **External Dependencies**

```html
<!-- CDN Links -->
<script src="https://cdn.tailwindcss.com/3.4.10"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600&display=swap" rel="stylesheet">
```

**ข้อดีของการใช้ CDN:**
- ไม่ต้องติดตั้ง Package
- Load เร็วจาก Global Cache
- อัพเดทง่าย
- ไม่มี Build Process

---

## การติดตั้งและใช้งาน

### 📥 **Setup Instructions**

#### **Phase 1: Google Sheets Setup**

1. **สร้าง Google Spreadsheet ใหม่**
   ```
   ชื่อ: "PD3 Production Database"
   ```

2. **สร้าง Sheet ชื่อ "Database"**
   ```
   Columns:
   A: Date (วันที่)
   B: Machine (เครื่องจักร)
   C: Shift (กะ)
   D: Product Name (ชื่อสินค้า)
   E: S/O Number (เลขที่ S/O)
   F: Quantity (จำนวน)
   G: Brand (ยี่ห้อ)
   H: Target (เป้าหมาย)
   I: Due Date (กำหนดส่ง)
   ```

3. **ตั้งค่า Header Row**
   ```
   Row 1: ชื่อ Column (Bold, Background Color)
   Row 2+: Data
   ```

#### **Phase 2: Google Apps Script Setup**

1. **เปิด Script Editor**
   ```
   Extensions → Apps Script
   ```

2. **Copy Code.gs เข้าไป**
   ```javascript
   // Paste ทั้งหมดจากไฟล์ Code.gs
   ```

3. **Update SPREADSHEET_ID**
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   
   **หา Spreadsheet ID:**
   ```
   URL: https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
   ```

4. **Deploy as Web App**
   ```
   1. คลิก Deploy → New Deployment
   2. Type: Web app
   3. Execute as: Me
   4. Who has access: Anyone
   5. คลิก Deploy
   6. Copy Web app URL
   ```

#### **Phase 3: Frontend Setup**

1. **Update API URL ใน dashboard.html**
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
   ```
   
   **ตำแหน่ง:** ประมาณบรรทัด 900-950

2. **Upload Files**
   ```
   - dashboard.html → GitHub Pages / Web Host
   - pd3_production_v3.html → GitHub Pages / Web Host
   - data/brands_array.js → Same Location
   ```

3. **Test Connection**
   ```
   1. เปิด dashboard.html ในเบราว์เซอร์
   2. เปิด Developer Console (F12)
   3. ดูว่า API Call สำเร็จหรือไม่
   ```

---

### 🚀 **Deployment Options**

#### **Option 1: GitHub Pages (แนะนำ)**

```bash
# 1. Create Repository
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 3. Enable GitHub Pages
Settings → Pages → Source: main branch → Save

# 4. Access at:
https://USERNAME.github.io/REPO/dashboard.html
```

#### **Option 2: Google Drive (ง่ายที่สุด)**

```
1. Upload .html files to Google Drive
2. Right-click → Share → Anyone with link can view
3. Get shareable link
4. แก้ URL จาก:
   https://drive.google.com/file/d/FILE_ID/view
   เป็น:
   https://drive.google.com/uc?export=download&id=FILE_ID
```

#### **Option 3: Local Development**

```bash
# ใช้ Python HTTP Server
python -m http.server 8000

# หรือใช้ Node.js
npx http-server -p 8000

# เปิดเบราว์เซอร์:
http://localhost:8000/dashboard.html
```

---

## การปรับแต่งและขยายระบบ

### 🎨 **1. Customizing Design**

#### **เปลี่ยน Color Scheme**

```css
/* ใน dashboard.html, ส่วน <style> */
:root {
  --apple-blue: #0071e3;      /* เปลี่ยนเป็นสีหลักของบริษัท */
  --apple-green: #34c759;     /* สีสำเร็จ */
  --apple-red: #ff3b30;       /* สีเตือน */
  --apple-orange: #ff9500;    /* สีระหว่างทาง */
}
```

#### **เปลี่ยน Font**

```html
<!-- แทนที่ Google Fonts Link -->
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@200;300;400;500;600&display=swap" rel="stylesheet">

<!-- Update CSS -->
<style>
  * {
    font-family: 'Prompt', sans-serif;
  }
</style>
```

#### **ปรับ Layout**

```css
/* เปลี่ยนจาก 5 cards เป็น 3 cards */
.kpi-grid {
  grid-template-columns: repeat(3, 1fr); /* เดิม: repeat(5, 1fr) */
}
```

---

### 📊 **2. Adding New Chart Types**

#### **เพิ่ม Pie Chart**

```javascript
// 1. เพิ่ม HTML Canvas
<canvas id="pieChart"></canvas>

// 2. เพิ่ม JavaScript Function
function createPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['เครื่อง PT1', 'เครื่อง PT2', 'เครื่อง PT3'],
      datasets: [{
        data: [data.pt1, data.pt2, data.pt3],
        backgroundColor: ['#0071e3', '#34c759', '#ff9500']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
```

#### **เพิ่ม Line Chart (แสดง Trend)**

```javascript
function createTrendChart(records) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  
  // Group by date
  const dailyTotals = records.reduce((acc, r) => {
    const date = r.date.toLocaleDateString('th-TH');
    acc[date] = (acc[date] || 0) + r.quantity;
    return acc;
  }, {});
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(dailyTotals),
      datasets: [{
        label: 'ยอดผลิตรายวัน',
        data: Object.values(dailyTotals),
        borderColor: '#0071e3',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(0, 113, 227, 0.1)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'แนวโน้มการผลิต'
        }
      }
    }
  });
}
```

---

### 🔌 **3. Adding New API Endpoints**

#### **Backend: Code.gs**

```javascript
function doGet(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'getSOList':
      return sendJSON(getSOList());
    
    case 'getSOProgress':
      return sendJSON(getSOProgress(e.parameter));
    
    // ✨ เพิ่ม Endpoint ใหม่
    case 'getMachineStats':
      return sendJSON(getMachineStats());
    
    case 'getEmployeePerformance':
      return sendJSON(getEmployeePerformance(e.parameter.shift));
    
    default:
      return sendJSON({status: 'error', message: 'Invalid action'});
  }
}

// ตัวอย่าง Function ใหม่
function getMachineStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dbSheet = ss.getSheetByName('Database');
  const data = dbSheet.getDataRange().getValues();
  
  const stats = {};
  data.forEach((row, index) => {
    if (index === 0) return;
    const machine = row[1]; // Column B
    const quantity = row[5]; // Column F
    
    if (!stats[machine]) {
      stats[machine] = { total: 0, count: 0 };
    }
    stats[machine].total += quantity;
    stats[machine].count += 1;
  });
  
  return {
    status: 'success',
    data: Object.entries(stats).map(([machine, data]) => ({
      machine: machine,
      total: data.total,
      average: data.total / data.count
    }))
  };
}
```

#### **Frontend: Call New API**

```javascript
async function loadMachineStats() {
  const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getMachineStats`;
  const response = await fetch(url);
  const result = await response.json();
  
  if (result.status === 'success') {
    displayMachineStats(result.data);
  }
}

function displayMachineStats(stats) {
  const container = document.getElementById('machineStatsContainer');
  container.innerHTML = stats.map(s => `
    <div class="stat-card">
      <h3>${s.machine}</h3>
      <p>Total: ${s.total.toLocaleString()}</p>
      <p>Avg: ${Math.round(s.average).toLocaleString()}</p>
    </div>
  `).join('');
}
```

---

### 📱 **4. Making it Mobile Responsive**

```css
/* เพิ่ม Media Queries */
@media (max-width: 768px) {
  /* KPI Cards: 1 column on mobile */
  .kpi-grid {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }
  
  /* Hide some elements on mobile */
  .chart-legend {
    display: none;
  }
  
  /* Adjust font sizes */
  .kpi-value {
    font-size: 2rem;
  }
  
  /* Stack controls vertically */
  .so-selector-container {
    flex-direction: column;
  }
  
  /* Full-width buttons */
  .so-add-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  /* Extra small screens */
  .apple-header h1 {
    font-size: 1.2rem;
  }
  
  .kpi-card {
    padding: 1rem;
  }
}
```

---

### 🔐 **5. Adding Authentication**

#### **Simple Password Protection**

```javascript
// เพิ่มใน <script> ส่วนบนสุดของ dashboard.html
(function() {
  const DASHBOARD_PASSWORD = 'pd3secure123';
  const savedPassword = sessionStorage.getItem('dashboard_auth');
  
  if (savedPassword !== DASHBOARD_PASSWORD) {
    const password = prompt('กรุณาใส่รหัสผ่าน:');
    if (password !== DASHBOARD_PASSWORD) {
      alert('รหัสผ่านไม่ถูกต้อง');
      window.location.href = 'about:blank';
      return;
    }
    sessionStorage.setItem('dashboard_auth', password);
  }
})();
```

#### **Google OAuth Integration**

```javascript
// ใน Code.gs
function doGet(e) {
  // ตรวจสอบ Authentication
  const user = Session.getActiveUser().getEmail();
  const allowedUsers = ['user1@company.com', 'user2@company.com'];
  
  if (!allowedUsers.includes(user)) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unauthorized access'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Continue with normal logic...
}
```

---

### 📈 **6. Advanced Features**

#### **A. Export to Excel**

```javascript
function exportToExcel() {
  const table = document.getElementById('dataTable');
  const workbook = XLSX.utils.table_to_book(table);
  XLSX.writeFile(workbook, `report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Include library:
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

#### **B. Real-time Updates**

```javascript
// Poll for updates every 30 seconds
setInterval(async () => {
  const currentSO = document.getElementById('soInput').value;
  if (currentSO) {
    await loadSOData();
    console.log('Dashboard refreshed');
  }
}, 30000); // 30 seconds
```

#### **C. Email Notifications**

```javascript
// ใน Code.gs
function sendProgressAlert(soNumber, progress) {
  if (progress >= 90 && progress < 100) {
    MailApp.sendEmail({
      to: 'manager@company.com',
      subject: `S/O ${soNumber} ใกล้ครบเป้าหมาย`,
      body: `ยอดผลิต S/O ${soNumber} อยู่ที่ ${progress}% แล้ว`
    });
  }
}
```

#### **D. Push Notifications**

```javascript
// Request permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Send notification
function notifyUser(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icon.png'
    });
  }
}
```

---

## Best Practices

### ✅ **Code Organization**

```javascript
// 1. แยก Code เป็น Sections ชัดเจน
// ==========================================
// SECTION: Configuration
// ==========================================
const CONFIG = {
  API_URL: 'https://...',
  REFRESH_INTERVAL: 30000,
  CHART_COLORS: ['#0071e3', '#34c759', '#ff9500']
};

// ==========================================
// SECTION: API Functions
// ==========================================
async function fetchData() { ... }

// ==========================================
// SECTION: UI Functions
// ==========================================
function updateUI() { ... }

// ==========================================
// SECTION: Utility Functions
// ==========================================
function formatNumber(num) { ... }
```

### 🎯 **Performance Optimization**

```javascript
// 1. Debounce input handlers
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage:
searchInput.addEventListener('input', debounce(function(e) {
  performSearch(e.target.value);
}, 300));

// 2. Lazy load heavy components
document.addEventListener('DOMContentLoaded', async () => {
  await loadEssentialData();
  requestIdleCallback(() => {
    loadOptionalFeatures();
  });
});

// 3. Cache API responses
const cache = new Map();
async function fetchWithCache(url, ttl = 60000) {
  if (cache.has(url)) {
    const { data, timestamp } = cache.get(url);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

### 🔒 **Security Best Practices**

```javascript
// 1. Validate all inputs
function validateSONumber(so) {
  const pattern = /^[A-Z0-9-]+$/i;
  if (!pattern.test(so)) {
    throw new Error('Invalid S/O format');
  }
  return so.toUpperCase();
}

// 2. Sanitize output
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 3. Use HTTPS only
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### 📱 **User Experience**

```javascript
// 1. Show loading states
function showLoading(isLoading) {
  const spinner = document.getElementById('loadingSpinner');
  const content = document.getElementById('mainContent');
  spinner.style.display = isLoading ? 'block' : 'none';
  content.style.opacity = isLoading ? '0.5' : '1';
}

// 2. Handle errors gracefully
async function safeAPICall(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error('API Error:', error);
    showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
    return fallback;
  }
}

// 3. Provide feedback
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
```

### 📊 **Data Management**

```javascript
// 1. Normalize data structure
function normalizeRecord(rawRecord) {
  return {
    date: new Date(rawRecord[0]),
    machine: String(rawRecord[1]).trim(),
    shift: String(rawRecord[2]).trim(),
    product: String(rawRecord[3]).trim(),
    soNumber: String(rawRecord[4]).trim().toUpperCase(),
    quantity: Number(rawRecord[5]) || 0,
    brand: String(rawRecord[6]).trim(),
    target: Number(rawRecord[7]) || 0,
    dueDate: rawRecord[8] ? new Date(rawRecord[8]) : null
  };
}

// 2. Use immutable updates
function updateData(oldData, changes) {
  return { ...oldData, ...changes };
}

// 3. Validate data integrity
function validateData(data) {
  const errors = [];
  if (!data.soNumber) errors.push('Missing S/O number');
  if (data.quantity < 0) errors.push('Negative quantity');
  if (data.target < data.actual) errors.push('Target < Actual');
  return errors;
}
```

---

## 📚 **Additional Resources**

### 📖 **Documentation Links**

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Google Apps Script Guide](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [MDN Web Docs](https://developer.mozilla.org/)

### 🎓 **Learning Path**

1. **Beginner**: HTML/CSS/JavaScript Basics
2. **Intermediate**: Async/Await, Fetch API, Chart.js
3. **Advanced**: Google Apps Script, API Design, Performance Optimization

### 🛠️ **Tools & Extensions**

- **VS Code**: Code Editor
- **Chrome DevTools**: Debugging
- **Postman**: API Testing
- **Git**: Version Control
- **GitHub Pages**: Deployment

---

## 🎯 **Summary Checklist**

### ✅ **สิ่งที่ต้องมี (Must-Have)**

- [ ] `dashboard.html` - หน้า Dashboard หลัก
- [ ] `Code.gs` - Backend API
- [ ] Google Spreadsheet - Database
- [ ] Chart.js Library - สำหรับ Charts
- [ ] API URL Configuration - เชื่อมต่อ Frontend-Backend

### ✨ **สิ่งที่ควรมี (Nice-to-Have)**

- [ ] Responsive Design - รองรับมือถือ
- [ ] Loading States - แสดงสถานะการโหลด
- [ ] Error Handling - จัดการ Error
- [ ] Data Caching - เพิ่มความเร็ว
- [ ] Export Feature - ส่งออกข้อมูล

### 🚀 **สิ่งที่ขยายได้ (Future Enhancements)**

- [ ] Authentication - ระบบล็อกอิน
- [ ] Real-time Updates - อัพเดทอัตโนมัติ
- [ ] Email Notifications - แจ้งเตือนทาง Email
- [ ] Advanced Analytics - การวิเคราะห์ขั้นสูง
- [ ] Mobile App - แอพมือถือ

---

## 📞 **Support & Contact**

หากมีคำถามหรือต้องการความช่วยเหลือ:
- 📧 Email: pd@zolapolysack.com
- 🌐 GitHub: [PD3-Production-System](https://github.com/Zolapolysack/PD3-Production-System)
- 📚 Documentation: [README.md](README.md)

---

**Created by**: PD3 Development Team  
**Last Updated**: February 2026  
**Version**: 3.0.0  

---

> **สรุป**: Dashboard นี้ถูกออกแบบมาให้ **ใช้งานง่าย**, **ปรับแต่งได้**, และ **ขยายระบบได้** เหมาะสำหรับการนำไปพัฒนาต่อยอดในโปรเจกต์อื่นๆ ที่ต้องการติดตามข้อมูลแบบ Real-time ด้วย Dashboard

