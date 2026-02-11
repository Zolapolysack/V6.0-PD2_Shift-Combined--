# Apps Script URLs Configuration

อัพเดทล่าสุด: 28 มกราคม 2026

## 📋 PD2 Shift System

### ✅ กะ A (PD2_Shift-A_V4.0)
**Apps Script Endpoint:**
```
https://script.google.com/macros/s/AKfycbzyHeKF4D1A5OnyAdmogDIBiTkkzmyaMjHdj29XMnwcLYLeC39Eb8YPfNc2Zy4yHp2V/exec
```

**Sheet Configuration:**
- **Google Sheet ID:** `1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc`
- **Folder ID:** `1O07zs3-Vm7W42DvkHg1RU6BKcw60zljV`
- **Location:** `ปรับ script PD2_Shift-A_V4.0/index.html` (line 1032)
- **Version:** v2.3 (Timestamp Fixed)
- **Last Updated:** 2026-01-28 ✅ ACTIVE

---

### ✅ กะ B (PD2_Shift-B_V4.0)
**Apps Script Endpoint:**
```
https://script.google.com/macros/s/AKfycbwh2viO76_yCWxKtCKW1svuFZX-x-QWKfpIgFkLKuXmsIp0RKVSXTvWfio-zlp0OB0AEA/exec
```

**Sheet Configuration:**
- **Google Sheet ID:** `1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU`
- **Folder ID:** `1vGSCN4Qf8XZNewfhpscW4BNZaHV8lvpe`
- **Location:** `ปรับ script PD2_Shift-B_V4.0/index.html` (line 1007)
- **Version:** v2.3 (Timestamp Fixed)
- **Last Updated:** 2026-01-28 ✅ ACTIVE

---

### 🔄 ตัดม้วน PD2
**Apps Script Endpoint:**
```
https://script.google.com/macros/s/AKfycbzA2gzgLmT5sGuFra-rilh2qeoQDseYasEpNrbUhEK0h9tBkMfQRS4jccL6BgEa5ZiDlg/exec
```

**Location:** `ตัดม้วน PD2/index.html` (line 1033)

---

## 📝 API Configuration Details

### Timeout และ Retry Settings
```javascript
timeout: 30000,        // 30 วินาที
maxRetries: 5,         // ลองใหม่สูงสุด 5 ครั้ง
retryDelay: 2000,      // รอ 2 วินาทีระหว่างการลองใหม่
apiVersion: '1.0'
```

### Backup Endpoints
ทั้ง 3 ระบบมี backup endpoints เตรียมไว้:
```javascript
backupEndpoints: [
    'https://script.google.com/macros/s/BACKUP_URL_1/exec',
    'https://script.google.com/macros/s/BACKUP_URL_2/exec'
]
```

---

## 🔗 Quick Links

### Google Sheets
- **กะ A:** https://docs.google.com/spreadsheets/d/1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc
- **กะ B:** https://docs.google.com/spreadsheets/d/1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU

### Google Drive Folders
- **กะ A:** https://drive.google.com/drive/folders/1O07zs3-Vm7W42DvkHg1RU6BKcw60zljV
- **กะ B:** https://drive.google.com/drive/folders/1vGSCN4Qf8XZNewfhpscW4BNZaHV8lvpe

---

## 🛠️ การแก้ไข Apps Script

### เข้าถึง Script Editor:
1. เปิด Google Sheet ที่ต้องการ
2. Extensions → Apps Script
3. แก้ไขโค้ดตามต้องการ
4. Deploy → New deployment
5. คัดลอก Web App URL ใหม่
6. อัพเดทใน `index.html` ของระบบที่เกี่ยวข้อง

### สำคัญ!
- ต้อง Deploy as "Web app" และเลือก "Anyone" access
- Execute as "Me" เพื่อใช้สิทธิ์ของเจ้าของ
- หลังจากแก้ไข ต้อง Deploy เป็น "New deployment" เสมอ
- อย่าลืมอัพเดท URL ในไฟล์ HTML

---

## ✅ Status Check

| System | Status | Last Verified |
|--------|--------|---------------|
| PD2 Shift-A | ✅ Active | 2026-01-22 |
| PD2 Shift-B | ✅ Active | 2026-01-22 |
| ตัดม้วน PD2 | ✅ Active | 2026-01-22 |

---

## 📞 Support

หากมีปัญหาเกี่ยวกับ Apps Script:
1. ตรวจสอบ Logs ใน Apps Script Editor (Executions)
2. ตรวจสอบสิทธิ์การเข้าถึง Google Sheet และ Drive
3. ตรวจสอบ Deployment settings (Anyone access)
4. ลอง Deploy version ใหม่

