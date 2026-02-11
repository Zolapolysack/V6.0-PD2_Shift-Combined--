/**
 * PD2 Multi-Language Translation System
 * Supported Languages: Thai (th), English (en), Burmese (my), Mon (mnw)
 * Generated with Google Translate - Please review accuracy
 */

const translations = {
    th: {
        // Header & Navigation
        'system.title': 'ระบบบันทึกข้อมูลรายงานแผนกผลิต 2',
        'nav.back': 'กลับหน้าหลัก',
        'status.ready': 'สถานะ: พร้อมใช้งาน',
        'shift.a': 'สำหรับ กะ A (08:00-20:00 น.)',
        'shift.b': 'สำหรับ กะ B (20:00-08:00 น.)',
        
        // Language Selector
        'lang.select': 'เลือกภาษา',
        'lang.thai': 'ไทย',
        'lang.english': 'English',
        'lang.burmese': 'မြန်မာ',
        'lang.mon': 'မွန်',
        
        // Data Set Info
        'dataset.count': 'จำนวนชุดข้อมูล',
        'dataset.number': 'ชุดข้อมูลที่',
        
        // Form Sections
        'section.basic': 'ข้อมูลพื้นฐาน',
        'section.meter': 'เลขมิเตอร์ประจำวัน',
        'section.length': 'ความยาวตัดม้วน และ ค่าแรงพนักงาน',
        
        // Form Fields
        'field.date': 'วันที่',
        'field.machine': 'เครื่องทอ NO',
        'field.machine.select': 'เลือกเครื่องทอ',
        'field.machine.custom': 'เครื่องทอ NO (กรอกเอง)',
        'field.machine.placeholder': 'พิมพ์หมายเลขเครื่อง เช่น CL96',
        'field.employee': 'ชื่อพนักงานทอ',
        'field.employee.a': 'ชื่อพนักงานทอ กะ A',
        'field.employee.b': 'ชื่อพนักงานทอ กะ B',
        'field.employee.select': 'เลือกพนักงาน',
        'field.employee.custom': 'ชื่อพนักงานทอ (กรอกเอง)',
        'field.employee.custom.a': 'ชื่อพนักงานทอ กะ A (กรอกเอง)',
        'field.employee.custom.b': 'ชื่อพนักงานทอ กะ B (กรอกเอง)',
        'field.employee.placeholder': 'พิมพ์รหัสหรือชื่อ',
        'field.fabric.size': 'ขนาดหน้าผ้า',
        'field.fabric.select': 'เลือกขนาดหน้าผ้า',
        'field.fabric.custom': 'ขนาดหน้าผ้า (กรอกเอง)',
        'field.fabric.placeholder': 'พิมพ์ขนาดหน้าผ้า',
        'field.meter.start': 'กะ A: เริ่มงาน',
        'field.meter.end': 'กะ A: เลิกงาน',
        'field.meter.start.b': 'กะ B: เริ่มงาน',
        'field.meter.end.b': 'กะ B: เลิกงาน',
        'field.meter.placeholder': 'เช่น 500',
        'field.meter.placeholder.end': 'เช่น 1000',
        'field.length': 'ความยาวตัดม้วน (เมตร)',
        'field.length.placeholder': 'เช่น 2500',
        'field.wage': 'ค่าแรงพนักงาน',
        'field.wage.a': 'ค่าแรงพนักงาน (กะ A)',
        'field.wage.b': 'ค่าแรงพนักงาน (กะ B)',
        'field.wage.placeholder': 'ค่าแรงพนักงาน',
        
        // Buttons
        'btn.add': 'เพิ่มชุดข้อมูลใหม่',
        'btn.copy': 'คัดลอกโดยเพิ่มชุดข้อมูล',
        'btn.reset': 'รีเซ็ตการบันทึกข้อมูล',
        'btn.export': 'บันทึกเป็นรูปภาพ',
        'btn.save': 'บันทึกข้อมูลทั้งหมด',
        
        // Modals
        'modal.success.title': 'บันทึกข้อมูลสำเร็จ',
        'modal.success.message': 'รายการ ถูกบันทึกเรียบร้อย',
        'modal.loading.title': 'กำลังบันทึกข้อมูล',
        'modal.loading.status': 'กำลังเตรียมข้อมูล...',
        
        // Footer
        'footer.copyright': '© 2026 Production PD2 • แผงควบคุมการผลิตรวม เวอร์ชัน 5.04',
        'footer.support': 'รองรับการใช้งานบนอุปกรณ์พกพา และเบราว์เซอร์หลัก',
        
        // Helper Text
        'helper.select': 'เลือกได้ 2 ทาง: เลือกจากรายการ หรือกรอกเอง'
    },
    
    en: {
        // Header & Navigation
        'system.title': 'Production Unit 2 Data Recording System',
        'nav.back': 'Back to Home',
        'status.ready': 'Status: Ready',
        'shift.a': 'For Shift A (08:00-20:00)',
        'shift.b': 'For Shift B (20:00-08:00)',
        
        // Language Selector
        'lang.select': 'Select Language',
        'lang.thai': 'Thai',
        'lang.english': 'English',
        'lang.burmese': 'Burmese',
        'lang.mon': 'Mon',
        
        // Data Set Info
        'dataset.count': 'Data Sets',
        'dataset.number': 'Data Set',
        
        // Form Sections
        'section.basic': 'Basic Information',
        'section.meter': 'Daily Meter Reading',
        'section.length': 'Roll Length & Wages',
        
        // Form Fields
        'field.date': 'Date',
        'field.machine': 'Loom NO',
        'field.machine.select': 'Select Loom',
        'field.machine.custom': 'Loom NO (Custom)',
        'field.machine.placeholder': 'Enter machine number e.g. CL96',
        'field.employee': 'Weaver Name',
        'field.employee.a': 'Weaver Name Shift A',
        'field.employee.b': 'Weaver Name Shift B',
        'field.employee.select': 'Select Employee',
        'field.employee.custom': 'Weaver Name (Custom)',
        'field.employee.custom.a': 'Weaver Name Shift A (Custom)',
        'field.employee.custom.b': 'Weaver Name Shift B (Custom)',
        'field.employee.placeholder': 'Enter ID or Name',
        'field.fabric.size': 'Fabric Width',
        'field.fabric.select': 'Select Fabric Width',
        'field.fabric.custom': 'Fabric Width (Custom)',
        'field.fabric.placeholder': 'Enter fabric width',
        'field.meter.start': 'Shift A: Start',
        'field.meter.end': 'Shift A: End',
        'field.meter.start.b': 'Shift B: Start',
        'field.meter.end.b': 'Shift B: End',
        'field.meter.placeholder': 'e.g. 500',
        'field.meter.placeholder.end': 'e.g. 1000',
        'field.length': 'Roll Length (meters)',
        'field.length.placeholder': 'e.g. 2500',
        'field.wage': 'Employee Wage',
        'field.wage.a': 'Employee Wage (Shift A)',
        'field.wage.b': 'Employee Wage (Shift B)',
        'field.wage.placeholder': 'Employee Wage',
        
        // Buttons
        'btn.add': 'Add New Data Set',
        'btn.copy': 'Copy & Add Data Set',
        'btn.reset': 'Reset Data Entry',
        'btn.export': 'Save as Image',
        'btn.save': 'Save All Data',
        
        // Modals
        'modal.success.title': 'Data Saved Successfully',
        'modal.success.message': 'items saved successfully',
        'modal.loading.title': 'Saving Data',
        'modal.loading.status': 'Preparing data...',
        
        // Footer
        'footer.copyright': '© 2026 Production PD2 • Unified Production Console v5.04',
        'footer.support': 'Supports mobile devices and major browsers',
        
        // Helper Text
        'helper.select': 'Choose either: Select from list or enter manually'
    },
    
    my: {
        // Header & Navigation (Burmese - Myanmar)
        'system.title': 'ထုတ်လုပ်မှုယူနစ် ၂ ဒေတာမှတ်တမ်းစနစ်',
        'nav.back': 'ပင်မစာမျက်နှာသို့',
        'status.ready': 'အခြေအနေ: အသင့်ရှိ',
        'shift.a': 'အပိုင်း A အတွက် (08:00-20:00)',
        'shift.b': 'အပိုင်း B အတွက် (20:00-08:00)',
        
        // Language Selector
        'lang.select': 'ဘာသာစကားရွေးချယ်ရန်',
        'lang.thai': 'ထိုင်း',
        'lang.english': 'အင်္ဂလိပ်',
        'lang.burmese': 'မြန်မာ',
        'lang.mon': 'မွန်',
        
        // Data Set Info
        'dataset.count': 'ဒေတာအစုအရေအတွက်',
        'dataset.number': 'ဒေတာအစု',
        
        // Form Sections
        'section.basic': 'အခြေခံအချက်အလက်',
        'section.meter': 'နေ့စဉ်မီတာဖတ်ခြင်း',
        'section.length': 'လိပ်အရှည်နှင့် လုပ်ခ',
        
        // Form Fields
        'field.date': 'ရက်စွဲ',
        'field.machine': 'ရက်ကန်းစက် NO',
        'field.machine.select': 'စက်ရွေးချယ်ရန်',
        'field.machine.custom': 'ရက်ကန်းစက် NO (ကိုယ်တိုင်ရိုက်)',
        'field.machine.placeholder': 'စက်နံပါတ်ရိုက်ပါ ဥပမာ CL96',
        'field.employee': 'ရက်သမားအမည်',
        'field.employee.a': 'ရက်သမားအမည် အပိုင်း A',
        'field.employee.b': 'ရက်သမားအမည် အပိုင်း B',
        'field.employee.select': 'ဝန်ထမ်းရွေးချယ်ရန်',
        'field.employee.custom': 'ရက်သမားအမည် (ကိုယ်တိုင်ရိုက်)',
        'field.employee.custom.a': 'ရက်သမားအမည် အပိုင်း A (ကိုယ်တိုင်ရိုက်)',
        'field.employee.custom.b': 'ရက်သမားအမည် အပိုင်း B (ကိုယ်တိုင်ရိုက်)',
        'field.employee.placeholder': 'ID သို့မဟုတ် အမည်ရိုက်ပါ',
        'field.fabric.size': 'အထည်အကျယ်',
        'field.fabric.select': 'အထည်အကျယ်ရွေးချယ်ရန်',
        'field.fabric.custom': 'အထည်အကျယ် (ကိုယ်တိုင်ရိုက်)',
        'field.fabric.placeholder': 'အထည်အကျယ်ရိုက်ပါ',
        'field.meter.start': 'အပိုင်း A: စတင်',
        'field.meter.end': 'အပိုင်း A: ပြီးဆုံး',
        'field.meter.start.b': 'အပိုင်း B: စတင်',
        'field.meter.end.b': 'အပိုင်း B: ပြီးဆုံး',
        'field.meter.placeholder': 'ဥပမာ 500',
        'field.meter.placeholder.end': 'ဥပမာ 1000',
        'field.length': 'လိပ်အရှည် (မီတာ)',
        'field.length.placeholder': 'ဥပမာ 2500',
        'field.wage': 'ဝန်ထမ်းလုပ်ခ',
        'field.wage.a': 'ဝန်ထမ်းလုပ်ခ (အပိုင်း A)',
        'field.wage.b': 'ဝန်ထမ်းလုပ်ခ (အပိုင်း B)',
        'field.wage.placeholder': 'ဝန်ထမ်းလုပ်ခ',
        
        // Buttons
        'btn.add': 'ဒေတာအစုအသစ်ထည့်ရန်',
        'btn.copy': 'ကူးယူ၍ ဒေတာအစုထည့်ရန်',
        'btn.reset': 'ဒေတာထည့်သွင်းမှုပြန်လည်စတင်ရန်',
        'btn.export': 'ပုံအဖြစ်သိမ်းရန်',
        'btn.save': 'ဒေတာအားလုံးသိမ်းရန်',
        
        // Modals
        'modal.success.title': 'ဒေတာသိမ်းဆည်းအောင်မြင်ပါသည်',
        'modal.success.message': 'ပစ္စည်းများ အောင်မြင်စွာသိမ်းဆည်းပြီးပါပြီ',
        'modal.loading.title': 'ဒေတာသိမ်းဆည်းနေသည်',
        'modal.loading.status': 'ဒေတာပြင်ဆင်နေသည်...',
        
        // Footer
        'footer.copyright': '© 2026 Production PD2 • Unified Production Console v5.04',
        'footer.support': 'မိုဘိုင်းစက်ပစ္စည်းများနှင့် အဓိကဘရောက်ဆာများကို ပံ့ပိုးသည်',
        
        // Helper Text
        'helper.select': 'ရွေးချယ်မှု: စာရင်းမှရွေးချယ်ပါ သို့မဟုတ် ကိုယ်တိုင်ရိုက်ထည့်ပါ'
    },
    
    mnw: {
        // Header & Navigation (Mon Language - using Myanmar script)
        'system.title': 'ဂကောံထုတ်လုပ်မှု ၂ စနစ်မှတ်တမ်းဒေတာ',
        'nav.back': 'ကလေၚ်စိုပ်မုက်ဇၞော်',
        'status.ready': 'အခြေအနေ: အသင့်ဒှ်ပြဲ',
        'shift.a': 'ကဏ္ဍသ္ကုတ် A (08:00-20:00 နာဍဳ)',
        'shift.b': 'ကဏ္ဍသ္ကုတ် B (20:00-08:00 နာဍဳ)',
        
        // Language Selector
        'lang.select': 'ရုဲစှ်ဘာသာစကား',
        'lang.thai': 'ဘာသာထဲ',
        'lang.english': 'ဘာသာအၚ်္ဂလိက်',
        'lang.burmese': 'ဘာသာဗၟာ',
        'lang.mon': 'ဘာသာမန်',
        
        // Data Set Info
        'dataset.count': 'ဂၞန်သ္ကုတ်ဒေတာ',
        'dataset.number': 'သ္ကုတ်ဒေတာမ္ဂး',
        
        // Form Sections
        'section.basic': 'အခြေခံသတင်းမူလ',
        'section.meter': 'နံပါတ်မီတာနေ့တ္ၚဲ',
        'section.length': 'ဂၠံၚ်ကြေပ်လိပ် ကေုာံ ဝါတ်သမား',
        
        // Form Fields
        'field.date': 'နေ့တ္ၚဲ',
        'field.machine': 'စက်ရက် NO',
        'field.machine.select': 'ရုဲစှ်စက်ရက်',
        'field.machine.custom': 'စက်ရက် NO (ရိုက်ဇကု)',
        'field.machine.placeholder': 'ရိုက်နံပါတ်စက် ဗီု CL96',
        'field.employee': 'အမည်သမားရက်',
        'field.employee.a': 'အမည်သမားရက် ကဏ္ဍ A',
        'field.employee.b': 'အမည်သမားရက် ကဏ္ဍ B',
        'field.employee.select': 'ရုဲစှ်သမား',
        'field.employee.custom': 'အမည်သမားရက် (ရိုက်ဇကု)',
        'field.employee.custom.a': 'အမည်သမားရက် ကဏ္ဍ A (ရိုက်ဇကု)',
        'field.employee.custom.b': 'အမည်သမားရက် ကဏ္ဍ B (ရိုက်ဇကု)',
        'field.employee.placeholder': 'ရိုက် ID ဟွံသာင် အမည်',
        'field.fabric.size': 'ဇမၠိၚ်မုက်အထည်',
        'field.fabric.select': 'ရုဲစှ်ဇမၠိၚ်မုက်အထည်',
        'field.fabric.custom': 'ဇမၠိၚ်မုက်အထည် (ရိုက်ဇကု)',
        'field.fabric.placeholder': 'ရိုက်ဇမၠိၚ်မုက်အထည်',
        'field.meter.start': 'ကဏ္ဍ A: စ',
        'field.meter.end': 'ကဏ္ဍ A: ဒှ်',
        'field.meter.start.b': 'ကဏ္ဍ B: စ',
        'field.meter.end.b': 'ကဏ္ဍ B: ဒှ်',
        'field.meter.placeholder': 'ဗီု 500',
        'field.meter.placeholder.end': 'ဗီု 1000',
        'field.length': 'ဂၠံၚ်ကြေပ်လိပ် (မီတာ)',
        'field.length.placeholder': 'ဗီု 2500',
        'field.wage': 'ဝါတ်သမား',
        'field.wage.a': 'ဝါတ်သမား (ကဏ္ဍ A)',
        'field.wage.b': 'ဝါတ်သမား (ကဏ္ဍ B)',
        'field.wage.placeholder': 'ဝါတ်သမား',
        
        // Buttons
        'btn.add': 'ထပ်သ္ကုတ်ဒေတာတၟိ',
        'btn.copy': 'ကော်ပဳကေုာံထပ်သ္ကုတ်ဒေတာ',
        'btn.reset': 'ပြန်စ စမ်ရံၚ်ဒေတာ',
        'btn.export': 'သိမ်းဗီုရုပ်',
        'btn.save': 'သိမ်းဒေတာဖအိုတ်',
        
        // Modals
        'modal.success.title': 'သိမ်းဒေတာအောင်မြင်ပြေပြစ',
        'modal.success.message': 'ပစ္စည်းသိမ်းပြီးပြေပြစ',
        'modal.loading.title': 'စှေ်ဒေတာဒၞဲါ',
        'modal.loading.status': 'ပြင်ဆင်ဒေတာဒၞဲါ...',
        
        // Footer
        'footer.copyright': '© 2026 Production PD2 • ဘဝ်ကဵုဂကောံထုတ်လုပ်မှု ဗဳရေဝ်ရှေန် 5.04',
        'footer.support': 'ပံ့ပိုးကဵု မိုဘိုင်း ကေုာံ ဘရောက်ဆာဇၞော်',
        
        // Helper Text
        'helper.select': 'ရုဲစှ်ဒှ် ၂ ဗီု: ရုဲစှ်နူစရၚ် ဟွံသာင် ရိုက်ဇကု'
    }
};

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}
