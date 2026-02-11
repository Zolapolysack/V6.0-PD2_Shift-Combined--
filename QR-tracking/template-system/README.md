# Template System

ระบบสร้าง Excel Template แบบสมบูรณ์แบบ 100%

## โครงสร้างโฟล์เดอร์

```
template-system/
├── source/                          # ไฟล์ต้นฉบับ
│   └── TEMPLATE-PERFECT.xlsx        # Template ที่ต้องการคัดลอก
├── generated/                       # ไฟล์ผลลัพธ์
│   └── TEMPLATE-GENERATED.xlsx      # Template ที่สร้างขึ้น
├── scripts/                         # Python scripts
│   ├── perfect-template-generator.py # Script หลัก
│   ├── create-perfect-template.py
│   ├── deep-analyze-template.py
│   └── find-diff.py
├── analysis/                        # ไฟล์วิเคราะห์
│   ├── TEMPLATE-PERFECT-ANALYSIS.json
│   ├── template-structure.json
│   └── source-structure.json
├── images/                          # รูปภาพที่ extract
│   └── template_perfect_img_ฟรอมร์_1.png
└── run-generator.py                 # 🚀 ไฟล์รันหลัก

## วิธีใช้งาน

### 1. สร้าง Template ใหม่

```bash
cd template-system
python run-generator.py
```

หรือ

```bash
cd template-system
python scripts/perfect-template-generator.py
```

### 2. ผลลัพธ์ที่ได้

- ✅ `generated/TEMPLATE-GENERATED.xlsx` - ไฟล์ template ที่สร้างขึ้น (100% เหมือนต้นฉบับ)
- ✅ `analysis/TEMPLATE-PERFECT-ANALYSIS.json` - ข้อมูลวิเคราะห์โครงสร้าง template
- ✅ `images/template_perfect_img_*.png` - รูปภาพที่ extract จาก template

### 3. การทำงานของ Generator

Script จะดำเนินการ 3 ขั้นตอน:

**STEP 1: วิเคราะห์ Template**
- อ่านโครงสร้างทั้งหมดจาก TEMPLATE-PERFECT.xlsx
- วิเคราะห์: columns widths, row heights, merged cells, fonts, borders, fills, alignment, images
- บันทึกผลลัพธ์ใน `analysis/TEMPLATE-PERFECT-ANALYSIS.json`

**STEP 2: สร้าง Perfect Copy**
- คัดลอก Template โดยใช้ 10 ขั้นตอน:
  1. Column widths
  2. Row heights
  3. Merged cells
  4. Cell values
  5. Fonts
  6. Fills
  7. Borders
  8. Alignment & Number Format
  9. Images
  10. Fix checkbox characters (o → □)
- บันทึกผลลัพธ์ใน `generated/TEMPLATE-GENERATED.xlsx`

**STEP 3: เปรียบเทียบความเหมือน**
- เปรียบเทียบไฟล์ต้นฉบับกับไฟล์ที่สร้าง
- ตรวจสอบ: dimensions, column widths, row heights, merged cells, cell values, borders
- แสดงรายงานความแตกต่าง (ถ้ามี)

## ข้อมูลเทคนิค

- **Python Version**: 3.11+
- **Library**: openpyxl
- **Template Size**: 67 rows × 29 columns (A-AC)
- **Special Features**:
  - 69 merged cell ranges
  - 106+ cells with borders (style: "hair")
  - 1 embedded image (336×101 pixels)
  - Thai language UTF-8 support
  - Checkbox characters: □ (U+25A1)

## การแก้ปัญหา

### PermissionError: [Errno 13] Permission denied
- **สาเหตุ**: ไฟล์ TEMPLATE-GENERATED.xlsx กำลังเปิดอยู่ใน Excel
- **แก้ไข**: ปิดไฟล์ใน Excel แล้วรันใหม่

### ไฟล์ไม่เหมือนกัน 100%
- ตรวจสอบ output จาก STEP 3
- ดู log ว่าส่วนไหนแตกต่าง
- โดยปกติจะเหมือนกัน 100% ยกเว้น empty string vs None (ถือว่าเหมือนกัน)

## ไฟล์สำคัญ

| ไฟล์ | คำอธิบาย |
|------|----------|
| `run-generator.py` | 🚀 ไฟล์รันหลัก - ใช้ไฟล์นี้ในการสร้าง template |
| `scripts/perfect-template-generator.py` | Engine หลักที่ทำการวิเคราะห์และสร้าง template |
| `source/TEMPLATE-PERFECT.xlsx` | ไฟล์ template ต้นฉบับ (แม่แบบอ้างอิง) |
| `generated/TEMPLATE-GENERATED.xlsx` | ไฟล์ template ที่สร้างขึ้น (ผลลัพธ์) |

## หมายเหตุ

- System นี้สร้างขึ้นเพื่อคัดลอก template อย่างสมบูรณ์แบบ 100%
- รักษารูปแบบ, สี, ขนาด, เส้นขอบ, รูปภาพ ทุกอย่างเหมือนเดิม
- ใช้ deep copy เพื่อให้แน่ใจว่าทุก style object เป็นอิสระ
- รองรับภาษาไทยและ special characters
