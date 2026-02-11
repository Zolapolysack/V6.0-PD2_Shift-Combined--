# 📊 บทวิเคราะห์การแก้ไข Machine Grouping Bug

**วันที่:** February 10, 2026  
**Version:** Code.gs v2.0.3  
**ผู้แก้ไข:** Development Team  
**สถานะ:** ✅ Fixed & Deployed

---

## 🔴 ปัญหาที่พบ (Problem Statement)

### อาการของปัญหา
ระบบ Dashboard แสดงข้อมูลการผลิตไม่ถูกต้องเมื่อมี **brand เดียวกันในหลายเครื่องทอ**

### ตัวอย่างปัญหา

**สถานการณ์:**
- Brand Code: `1921720`
- มีเครื่องทอทั้งหมด 3 เครื่อง:
  - เครื่อง 1: ยอดทอ 900 เมตร
  - เครื่อง 2: ยอดทอ 1,200 เมตร  
  - เครื่อง 3: ยอดทอ 800 เมตร

**ผลลัพธ์ที่ผิด:**
```
┌─────┬─────────┬─────────────┐
│ลำดับ│ รหัสผ้า │  ยอดทอ     │
├─────┼─────────┼─────────────┤
│  1  │1921720  │ 2,900 เมตร │ ← รวมทุกเครื่อง!
└─────┴─────────┴─────────────┘
```

❌ **ปัญหา:** ระบบรวมยอดทั้ง 3 เครื่องเป็นแถวเดียว แยกไม่ได้ว่าเครื่องไหนทำได้เท่าไหร่

---

## 🔍 สาเหตุของปัญหา (Root Cause)

### Code ที่ผิดพลาด

**ไฟล์:** `Code.gs`  
**Function:** `mergeShiftData()`  
**บรรทัด:** ~505

```javascript
// ❌ WRONG - รวมตาม brand เท่านั้น
function mergeShiftData(shiftAData, shiftBData) {
  const machineMap = {};
  
  shiftAData.forEach(item => {
    const key = item.brand; // ← ปัญหาอยู่ตรงนี้!
    
    if (!machineMap[key]) {
      machineMap[key] = { /* ... */ };
    }
    // ถ้า key ซ้ำ (brand เดียวกัน) จะ overwrite ข้อมูลเดิม
    machineMap[key].production += item.production; // รวมยอด
  });
  
  return Object.values(machineMap);
}
```

### ทำไมถึงผิด?

1. **Key ไม่ Unique:** ใช้ `brand` เป็น key → brand เดียวกันหลายเครื่อง = key ซ้ำ
2. **Data Overwrite:** เมื่อ key ซ้ำ ข้อมูลเครื่องใหม่จะทับข้อมูลเครื่องเก่า
3. **ผลลัพธ์:** แสดงได้แค่เครื่องสุดท้าย หรือรวมยอดผิดพลาด

---

## ✅ วิธีแก้ไข (Solution)

### การเปลี่ยนแปลงหลัก

**เปลี่ยน Key จาก:**
```javascript
const key = item.brand; // brand เท่านั้น
```

**เป็น:**
```javascript
const key = `${item.brand}_${item.machineNo || 'UNKNOWN'}`; // brand + เครื่อง
```

### Code ที่แก้ไขแล้ว (Fixed Code)

**ไฟล์:** `production-dashboard/Code.gs`  
**บรรทัด:** 499-600

```javascript
// ✅ CORRECT - รวมตาม brand + machineNo
function mergeShiftData(shiftAData, shiftBData) {
  const machineMap = {};
  
  // Add Shift A data - Key by brand + machine
  if (shiftAData) {
    shiftAData.forEach(item => {
      // ✅ Key = brand_machineNo (unique per machine)
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
      
      // ✅ Assign directly (not add) - one machine = one record
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
  
  // ✅ Sort by brand, then by machine number
  result.sort((a, b) => {
    const brandCompare = String(a.brand || '').localeCompare(String(b.brand || ''));
    if (brandCompare !== 0) return brandCompare;
    
    // ✅ Convert machineNo to String (might be Number type)
    return String(a.machineNo || '').localeCompare(String(b.machineNo || ''));
  });
  
  return result;
}
```

### การแก้ไขเพิ่มเติม

#### 1. Sorting Fix
**ปัญหา:** `localeCompare()` ใช้ได้กับ String เท่านั้น แต่ `machineNo` อาจเป็น Number

**แก้ไข:**
```javascript
// ❌ BEFORE - TypeError if machineNo is Number
return a.machineNo.localeCompare(b.machineNo);

// ✅ AFTER - Convert to String first
return String(a.machineNo || '').localeCompare(String(b.machineNo || ''));
```

---

## 🎨 การแก้ไข UI (dashboard.html)

### เพิ่มการแสดงหมายเลขเครื่องทอ

**ไฟล์:** `production-dashboard/dashboard.html`  
**บรรทัด:** 721

```html
<!-- ✅ แสดงเครื่องทอ NO ในรายละเอียด -->
<div class="mb-4 pb-3 border-b border-blue-200">
  <h4 class="text-base font-bold text-gray-900">รายละเอียดเครื่องทอ</h4>
  <p class="text-sm text-gray-600 mt-1">
    เครื่องทอ NO: 
    <span class="font-bold text-blue-600">${item.machineNo || 'N/A'}</span>
  </p>
</div>
```

### การเพิ่มหน่วย "เมตร" (เพิ่มเติมวันนี้)

**บรรทัด:** 354-355, 809-810

```html
<!-- Table Header -->
<th class="px-6 py-4 text-right text-sm font-bold">ยอดทอ (เมตร)</th>
<th class="px-6 py-4 text-right text-sm font-bold">ยอดตัดม้วน (เมตร)</th>

<!-- Total Row -->
<td class="px-6 py-4 text-sm text-right number-cell text-gray-900">
  ${formatNumber(totalProduction)} เมตร
</td>
<td class="px-6 py-4 text-sm text-right number-cell text-gray-900">
  ${formatNumber(totalCutting)} เมตร
</td>
```

---

## 📊 ผลลัพธ์หลังแก้ไข (After Fix)

### ตารางแสดงผลที่ถูกต้อง

```
┌─────┬─────────┬─────────┬──────────────┬──────────────────┐
│ลำดับ│ รหัสผ้า │เครื่อง NO│ยอดทอ (เมตร) │ยอดตัดม้วน (เมตร)│
├─────┼─────────┼─────────┼──────────────┼──────────────────┤
│  1  │1921720  │    1    │   900 เมตร   │      0 เมตร      │
│  2  │1921720  │    2    │ 1,200 เมตร   │    500 เมตร      │
│  3  │1921720  │    3    │   800 เมตร   │    300 เมตร      │
├─────┼─────────┼─────────┼──────────────┼──────────────────┤
│รวมทั้งหมด                │ 2,900 เมตร   │    800 เมตร      │
└─────┴─────────┴─────────┴──────────────┴──────────────────┘
```

✅ **ผลลัพธ์:** แสดงแยกแต่ละเครื่องได้อย่างถูกต้อง!

---

## 🧪 การทดสอบ (Testing)

### Test Cases

#### Test 1: Brand เดียวกัน หลายเครื่อง
**Input:**
```javascript
shiftAData = [
  { brand: '1921720', machineNo: 1, production: 900 },
  { brand: '1921720', machineNo: 2, production: 1200 },
  { brand: '1921720', machineNo: 3, production: 800 }
]
```

**Expected Output:** 3 แถว (แยกแต่ละเครื่อง)
**Actual Result:** ✅ PASS - แสดง 3 แถว

#### Test 2: Brand ต่างกัน
**Input:**
```javascript
shiftAData = [
  { brand: '1921720', machineNo: 1, production: 900 },
  { brand: '1825800SM', machineNo: 2, production: 1200 }
]
```

**Expected Output:** 2 แถว
**Actual Result:** ✅ PASS - แสดง 2 แถว

#### Test 3: machineNo เป็น undefined/null
**Input:**
```javascript
shiftAData = [
  { brand: '1921720', machineNo: null, production: 900 }
]
```

**Expected Output:** Key = `1921720_UNKNOWN`
**Actual Result:** ✅ PASS - ใช้ fallback ได้ถูกต้อง

---

## 📈 Benefits ของการแก้ไข

### 1️⃣ ความถูกต้องของข้อมูล
- ✅ แสดงยอดผลิตแต่ละเครื่องได้อย่างแม่นยำ
- ✅ ไม่มีการรวมยอดผิดพลาด
- ✅ ข้อมูลตรงตามความเป็นจริง

### 2️⃣ การจัดการข้อมูล
- ✅ Key ที่ Unique: `brand_machineNo`
- ✅ ไม่มี Data Collision
- ✅ รองรับหลายเครื่องต่อ brand

### 3️⃣ ประสิทธิภาพการทำงาน
- ✅ ตรวจสอบผลผลิตแต่ละเครื่องได้ชัดเจน
- ✅ วิเคราะห์ปัญหาเครื่องที่ผลิตได้น้อย
- ✅ เพิ่มความโปร่งใสในการจัดการ

### 4️⃣ UI/UX Improvements
- ✅ แสดงหมายเลขเครื่องทอในรายละเอียด
- ✅ หน่วย "เมตร" ชัดเจนทั้งหัวข้อและรวม
- ✅ Zebra Striping อ่านง่าย

---

## 🔄 Version History

### v2.0.3 (Current) - February 10, 2026
**Changes:**
- ✅ Fixed Machine Grouping (brand + machineNo)
- ✅ Fixed localeCompare TypeError
- ✅ Added machineNo display in detail view
- ✅ Added unit "เมตร" to headers and totals
- ✅ Added zebra striping to table

**Status:** ✅ Deployed & Active

### v2.0.2
- Fixed column mapping (G for LOT_NO)
- Added production calculation from meters

### v2.0.1
- Initial dashboard deployment
- Bug: Machine grouping by brand only ❌

---

## 🎯 Deployment Status

### API Endpoint
**URL:** `https://script.google.com/macros/s/AKfycbxqdy6kx-bWccNV3rp1pyp8-Zc97fxQX2W1pkWcQ80jY5DVnQUKq5HSq8QAMfAVjqRn/exec`

**Version:** v2.0.3  
**Status:** ✅ Active  
**Last Updated:** February 10, 2026

### Files Modified
1. ✅ `Code.gs` - Backend API (Lines 499-600)
2. ✅ `dashboard.html` - Frontend UI (Lines 354-355, 721, 809-810)
3. ✅ `config.js` - API URL updated

---

## 📝 Notes for Future Development

### Considerations
1. **machineNo Type:** ปัจจุบันรองรับทั้ง String และ Number แล้ว
2. **Missing machineNo:** ใช้ fallback `'UNKNOWN'` ป้องกัน key collision
3. **Sorting:** เรียงตาม brand ก่อน จากนั้นเรียงตาม machineNo

### Potential Enhancements
- [ ] เพิ่มฟิลเตอร์ตามเครื่องทอ
- [ ] กราฟแสดงประสิทธิภาพแต่ละเครื่อง
- [ ] Export รายงานแยกตามเครื่อง
- [ ] Alert เมื่อเครื่องผลิตได้ต่ำกว่าเกณฑ์

---

## 👥 Contributors
- Development Team
- Testing Team
- Production Department

**Document Version:** 1.0  
**Last Updated:** February 10, 2026
