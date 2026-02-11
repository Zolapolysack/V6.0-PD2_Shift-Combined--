# 🏭 Production Dashboard - PD2 System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

**ระบบ Dashboard สำหรับแสดงข้อมูลยอดผลิตแผนก PD2**

[🚀 เริ่มใช้งาน](#-การติดตั้ง) • [📖 เอกสาร](#-คู่มือการใช้งาน) • [🔧 Configuration](#-configuration) • [🎨 Features](#-features)

</div>

---

## 📋 สารบัญ

- [ภาพรวมโปรเจค](#-ภาพรวมโปรเจค)
- [Features หลัก](#-features)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [การติดตั้ง](#-การติดตั้ง)
- [Configuration](#-configuration)
- [คู่มือการใช้งาน](#-คู่มือการใช้งาน)
- [Google Apps Script Setup](#-google-apps-script-setup)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)

---

## 🎯 ภาพรวมโปรเจค

**Production Dashboard** เป็นระบบ web application สำหรับแสดงและวิเคราะห์ข้อมูลการผลิตของแผนก PD2 โดยดึงข้อมูลจาก Google Sheets และแสดงผลในรูปแบบ Dashboard ที่ทันสมัย เป็นมืออาชีพ

### 🎯 วัตถุประสงค์
- แสดงข้อมูลยอดผลิตแบบ Real-time
- สรุปผลการผลิตแยกตามวันที่และกะ (A/B)
- วิเคราะห์ข้อมูลและแสดงสถิติที่สำคัญ
- รองรับการใช้งานบนอุปกรณ์ทุกขนาด (Responsive Design)

---

## ✨ Features

### 📊 การแสดงข้อมูล
- ✅ Dashboard แสดงยอดผลิตแบบเรียลไทม์
- ✅ ตัวกรองข้อมูลตามวันที่และกะ (Shift A/B)
- ✅ ตารางสรุปข้อมูลผลิตรายวัน
- ✅ แสดงสถิติและ KPI ที่สำคัญ
- ✅ Chart และกราฟแสดงข้อมูล

### 🎨 UI/UX
- ✅ Modern Design ด้วย Tailwind CSS
- ✅ Responsive - ใช้งานได้บนทุกอุปกรณ์
- ✅ Loading States และ Error Handling
- ✅ Toast Notifications
- ✅ Smooth Animations

### 🔧 Technical
- ✅ Integration กับ Google Sheets API
- ✅ Offline-first approach
- ✅ Client-side data processing
- ✅ Clean code architecture
- ✅ Extensive documentation

---

## 📁 โครงสร้างโปรเจค

```
production-dashboard/
│
├── index.html              # Landing page (redirect to dashboard)
├── dashboard.html          # หน้า Dashboard หลัก
├── brands_array.js         # ข้อมูลรหัสผ้าและ helper functions
├── config.js              # Configuration file
├── styles.css             # Custom styles (optional)
├── Code.gs                # Google Apps Script (backend API)
│
├── assets/                # Assets folder (optional)
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── docs/                  # เอกสารเพิ่มเติม
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── README.md              # เอกสารนี้
```

---

## 🚀 การติดตั้ง

### ข้อกำหนดเบื้องต้น
- ✅ Google Account (สำหรับ Google Sheets & Apps Script)
- ✅ Web Browser ที่ทันสมัย (Chrome, Firefox, Safari, Edge)
- ✅ Text Editor หรือ IDE (VS Code แนะนำ)

### ขั้นตอนการติดตั้ง

#### 1️⃣ Clone หรือ Download โปรเจค
```bash
# ถ้าใช้ Git
git clone <repository-url>
cd production-dashboard

# หรือ Download ZIP และแตกไฟล์
```

#### 2️⃣ Setup Google Sheets
1. สร้าง Google Sheets ใหม่สำหรับเก็บข้อมูล
2. ตั้งชื่อ Sheet ว่า **"กะ A"** และ **"กะ B"**
3. กำหนดโครงสร้างคอลัมน์:
   ```
   | วันที่ | รหัสผ้า | ชื่อผ้า | จำนวน | หน่วย | หมายเหตุ |
   ```

#### 3️⃣ Setup Google Apps Script
1. เปิด Google Sheets → **Extensions** → **Apps Script**
2. Copy code จาก `Code.gs` ไปวาง
3. แก้ไข `SPREADSHEET_ID` เป็น ID ของ Sheet ของคุณ
4. Deploy as **Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy **Deployment URL**

#### 4️⃣ Configuration
1. เปิดไฟล์ `config.js`
2. แก้ไข `API_URL` เป็น URL ที่ได้จาก Apps Script
   ```javascript
   const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
   ```

#### 5️⃣ เปิดใช้งาน
```bash
# วิธีที่ 1: เปิดไฟล์ HTML โดยตรง
# Double-click ที่ index.html

# วิธีที่ 2: ใช้ Local Server (แนะนำ)
# ถ้ามี Python
python -m http.server 8000

# ถ้ามี Node.js
npx http-server -p 8000

# เปิด browser ที่ http://localhost:8000
```

---

## ⚙️ Configuration

### config.js

```javascript
// API Configuration
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
const API_TIMEOUT = 30000; // 30 seconds

// App Settings
const APP_NAME = 'Production Dashboard PD2';
const VERSION = '1.0.0';
const DEBUG_MODE = false; // เปิดใช้งาน console.log

// Date Format
const DATE_FORMAT = 'DD/MM/YYYY';
const LOCALE = 'th-TH';

// Cache Settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### brands_array.js
แก้ไขข้อมูลรหัสผ้าตามความเหมาะสม:

```javascript
const BRANDS_ARRAY = [
  { code: "PD2-101", name: "ผ้าคอตตอน 100%", color: "#ffffff", category: "PD2" },
  // เพิ่มรหัสผ้าของคุณที่นี่
];
```

---

## 📖 คู่มือการใช้งาน

### 1. เลือกวันที่และกะ
1. เปิดหน้า Dashboard
2. เลือกวันที่จาก Date Picker
3. เลือกกะ A หรือ B จาก Dropdown
4. กดปุ่ม **"โหลดข้อมูล"**

### 2. ดูข้อมูลสรุป
- **Cards ด้านบน**: แสดงสถิติรวมทั้งหมด
  - ยอดผลิตรวม
  - จำนวนรายการ
  - จำนวนรหัสผ้า
  - ค่าเฉลี่ย

### 3. ตารางข้อมูล
- แสดงรายละเอียดการผลิตทั้งหมด
- สามารถ scroll ดูข้อมูลได้
- บนมือถือจะแสดงแบบ responsive

### 4. Refresh ข้อมูล
- กดปุ่ม Refresh เพื่อโหลดข้อมูลใหม่
- ระบบจะ cache ข้อมูล 5 นาที

---

## 🔌 Google Apps Script Setup

### Code.gs - Backend API

```javascript
// 1. เปิด Google Sheets
// 2. Extensions → Apps Script
// 3. วาง code จาก Code.gs
// 4. แก้ไข SPREADSHEET_ID
// 5. Deploy → New deployment
// 6. Type: Web app
// 7. Execute as: Me
// 8. Access: Anyone
// 9. Copy Web App URL
```

### Permissions
Apps Script จะขออนุญาต:
- ✅ อ่านข้อมูลจาก Google Sheets
- ✅ รัน Web App

---

## 📡 API Documentation

### Endpoint: `doGet(e)`

**Method:** GET

**Parameters:**
- `date` (required): วันที่ในรูปแบบ YYYY-MM-DD
- `shift` (required): กะ A หรือ B

**Example Request:**
```
GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?date=2026-02-09&shift=A
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "09/02/2026",
      "brandCode": "PD2-101",
      "brandName": "ผ้าคอตตอน 100%",
      "quantity": 150.50,
      "unit": "เมตร",
      "note": ""
    }
  ],
  "summary": {
    "totalQuantity": 150.50,
    "itemCount": 1,
    "uniqueBrands": 1
  }
}
```

---

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถโหลดข้อมูลได้
**สาเหตุ:**
- URL API ไม่ถูกต้อง
- Apps Script ยังไม่ Deploy
- ไม่มีข้อมูลในวันที่เลือก

**แก้ไข:**
```javascript
// ตรวจสอบ console browser (F12)
// ตรวจสอบ URL ใน config.js
// ตรวจสอบ Apps Script logs
```

#### 2. CORS Error
**สาเหตุ:**
- Apps Script ไม่ได้ Deploy เป็น Web App
- ไม่ได้ตั้งค่า "Anyone can access"

**แก้ไข:**
- Deploy ใหม่และตั้งค่า Access เป็น "Anyone"

#### 3. ข้อมูลไม่อัพเดท
**สาเหตุ:**
- Browser cache

**แก้ไข:**
```javascript
// กด Ctrl + Shift + R (Hard Reload)
// หรือเปิด DevTools และ Disable cache
```

---

## 💻 Development

### การพัฒนาต่อ

#### เพิ่ม Feature ใหม่
1. สร้าง branch ใหม่
2. เพิ่มโค้ดใน `dashboard.html`
3. Test ให้ครบทุก case
4. Commit และ Push

#### เพิ่มรหัสผ้าใหม่
แก้ไขไฟล์ `brands_array.js`:
```javascript
{ code: "PD2-XXX", name: "ชื่อผ้า", color: "#hexcolor", category: "PD2" }
```

#### Customize Styles
สร้างไฟล์ `styles.css`:
```css
/* Custom styles here */
:root {
  --primary-color: #10b981;
  --secondary-color: #3b82f6;
}
```

### Testing
```bash
# Test บน browsers ต่างๆ
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅
```

---

## 📝 License

MIT License - สามารถนำไปใช้และแก้ไขได้อย่างอิสระ

---

## 👨‍💻 Author

**ZP1048 - Production PD2 Team**

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. เปิด Issue ใน Repository
2. ติดต่อทีม IT
3. อ่านเอกสารใน `/docs`

---

## 🔄 Changelog

### v1.0.0 (2026-02-09)
- ✨ Initial release
- ✅ Dashboard พื้นฐาน
- ✅ Integration กับ Google Sheets
- ✅ Responsive design
- ✅ Brand data management

---

<div align="center">

**🏭 Production Dashboard PD2 v1.0.0**

Made with ❤️ by Production Team

</div>
