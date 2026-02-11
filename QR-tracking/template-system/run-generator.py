#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
รัน Template Generator ง่ายๆ
ใช้สร้าง Template ใหม่จาก TEMPLATE-PERFECT.xlsx
"""

import sys
import os

# เปลี่ยน working directory ไปที่โฟล์เดอร์ของ script นี้
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# เพิ่ม scripts folder เข้า Python path
scripts_path = os.path.join(script_dir, 'scripts')
sys.path.insert(0, scripts_path)

# Import perfect-template-generator.py module
import importlib.util
spec = importlib.util.spec_from_file_location("perfect_template_generator", 
                                              os.path.join(scripts_path, "perfect-template-generator.py"))
generator_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator_module)

# Get functions
deep_analyze_perfect_template = generator_module.deep_analyze_perfect_template
create_perfect_copy = generator_module.create_perfect_copy
compare_templates = generator_module.compare_templates

if __name__ == '__main__':
    print("\n" + "="*100)
    print("Template Generator - สร้าง Excel Template สมบูรณ์แบบ 100%")
    print("="*100)
    
    # กำหนด path ของไฟล์
    source = 'source/TEMPLATE-PERFECT.xlsx'
    target = 'generated/TEMPLATE-GENERATED.xlsx'
    
    # ตรวจสอบว่าไฟล์ต้นฉบับมีอยู่หรือไม่
    if not os.path.exists(source):
        print(f"\n❌ Error: ไม่พบไฟล์ต้นฉบับ {source}")
        print("กรุณาตรวจสอบว่าไฟล์ TEMPLATE-PERFECT.xlsx อยู่ในโฟล์เดอร์ source/")
        sys.exit(1)
    
    print(f"\n📂 Source: {source}")
    print(f"📂 Target: {target}")
    
    # Step 1: วิเคราะห์
    print("\n" + "="*100)
    print("STEP 1: วิเคราะห์ Template สมบูรณ์")
    print("="*100)
    template_data = deep_analyze_perfect_template(source)
    
    # Step 2: สร้าง Copy
    print("\n" + "="*100)
    print("STEP 2: สร้าง Perfect Copy")
    print("="*100)
    create_perfect_copy(source, target)
    
    # Step 3: เปรียบเทียบ
    print("\n" + "="*100)
    print("STEP 3: เปรียบเทียบความเหมือน")
    print("="*100)
    is_identical = compare_templates(source, target)
    
    # สรุป
    print("\n" + "="*100)
    print("✅ สรุปผลการทำงาน")
    print("="*100)
    print(f"📄 Source: {source}")
    print(f"📄 Generated: {target}")
    print(f"📄 Analysis: analysis/TEMPLATE-PERFECT-ANALYSIS.json")
    
    if is_identical:
        print(f"\n✓✓✓ สำเร็จ! ไฟล์ที่สร้างเหมือนต้นฉบับ 100% ✓✓✓")
        print(f"\nไฟล์ที่สร้าง: {os.path.abspath(target)}")
    else:
        print(f"\n⚠️ พบความแตกต่าง กรุณาตรวจสอบ")
    
    print("="*100 + "\n")
