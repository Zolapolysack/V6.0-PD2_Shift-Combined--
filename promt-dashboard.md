
production/
├── dashboard.html              # หน้า Dashboard หลัก
├── index.html                  # Landing Page (Redirect)
├── Code.gs                     # Backend API (Google Apps Script)
└── data/
    └── brands_array.js         # Static Data


googlesheet กะ A     https://docs.google.com/spreadsheets/d/1K9e_VNW34yF_nVFCXW3v6W8v7FAt33Gr9xnuwCHBadc/edit?gid=118527011#gid=118527011

googlesheet กะ B     https://docs.google.com/spreadsheets/d/1ZhDdKmzZSK0koExN2u_JsiF_SLAOanYyGtuewNAkFYU/edit?gid=371622632#gid=371622632


Frontend (HTML/JS) -> Backend (Google Apps Script) -> Database Layer


- Code.gs  สำหรับ appscript ที่สามารถเข้าไปดึงข้อมูล โดยกำหนดให้  googlesheet กะ A  and googlesheet กะ B  เป็นฐาน database 

- dashboard.html  ทำหน้าที่แสดงข้อมูลยอดผลิตที่ได้จาก ข้อมูลใน googlesheet กะ A  and googlesheet กะ B โดยผู้ใช้สามารถกำหนด วันที่ เพื่อดูยอดการผลิต

- มี dropdown ให้เลือก  วันที่ ... กะ A       วันที่ .... กะ  B    ผู้ใช้สามารถ เลือกได้ทั้ง 2 หรืออย่างใด อย่าง 1 เพื่อนำมาวิเคราะห์สรุปผล 

- การแสดงผล จะเป้นการแสดงแบบสรุปผล  เป็นตารางสรุปข้อมูล 


ยกตัวอย่าง 

สรุปยอดผลิตประจำวันที่ (04-02-2569)	                                           
	
	
ยอดทอกะ A  	 ยอดทอกะ B      
	
54,903	      52,795

	
	
ยอดตัดม้วนกะ A 	ยอดตัดม้วนกะ B 
	
56,688	       23,640



สรุปผลผลิตตามรหัสผ้า	สรุปยอดทอ	สรุปยอดตัดม้วน
1425800         	1,623	2,500
1825800SM	        1,891	2,000
1921720	            32,141	22,700
2021850	            7,688	3,512
2025800SM	        954	    2,000
2025800SMN	        12,748	8,000
2025850	            17,596	15,736
2121670SM	        11,348	12,000
2121670SMN	        1,918	2,000
2321750	            815	    1,205
2625800	            3,586	4,000
2625850SM	        2,041	2,000
2825850	            6,476	4,675



































