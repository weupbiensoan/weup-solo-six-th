export const promptText6 = `ฉันต้องการสร้างระบบแนะนำผลิตภัณฑ์และรับค่าคอมมิชชันด้วย AI สำหรับธุรกิจที่ดำเนินการโดยคนเดียว ระบบต้องช่วยตรวจสอบข้อมูลผลิตภัณฑ์ จัดการโปรแกรมพาร์ตเนอร์ เก็บความต้องการของลูกค้า จำแนกระดับการดูแล สร้างอีเมลฉบับร่างที่ต้องผ่านการตรวจทาน นำเข้ารายงานค่าคอมมิชชัน กระทบยอดเงิน และแจ้งเตือนความเสี่ยง AI มีหน้าที่ช่วยจัดโครงสร้างข้อมูลและจำแนกเท่านั้น ส่วนผู้ประกอบการเป็นผู้อนุมัติและส่งข้อความทุกครั้ง

บริบทการติดตั้ง: ฉันจะสร้าง Google Sheets เปล่าชื่อ AI_REFERRAL_SYSTEM เปิด Apps Script จากสเปรดชีตนั้น แล้ววางโค้ดลงไป โปรดส่งคืนไฟล์ที่สมบูรณ์สามไฟล์ในคำตอบเดียว โดยแยกเป็นบล็อกโค้ดและระบุชื่อให้ชัดเจน:
1. Main.gs สำหรับการกำหนดค่า onOpen เมนู และตรรกะการทำงานทั้งหมด
2. Dashboard.gs สำหรับฝั่งเซิร์ฟเวอร์ของแดชบอร์ด
3. Dashboard.html สำหรับส่วนติดต่อผู้ใช้ของแดชบอร์ด

ข้อกำหนดด้านสถาปัตยกรรม:
- ให้ Main.gs เป็นไฟล์เดียวที่ประกาศ onOpen เมนูต้องชื่อ “WEUP SoloSix — ระบบแนะนำ” และมีรายการดังนี้: 1. เริ่มต้นระบบ; 2. นำเข้าข้อมูลวิจัย (AI); 3. สร้างแบบฟอร์มความต้องการ; 4. จำแนกลูกค้าใหม่ (AI); 5. สร้างอีเมลฉบับร่าง; 6. ทำเครื่องหมายว่าส่งแล้ว (แถวที่เลือก); 7. นำเข้ารายงานค่าคอมมิชชัน; 8. กระทบยอดค่าคอมมิชชัน; 9. ตรวจสอบความเสี่ยง; 10. ตั้งเวลาทำงานอัตโนมัติ; เปิดแดชบอร์ด; สร้างโครงสร้างโฟลเดอร์ Drive; ดูลิงก์ระบบ; และทดสอบการเชื่อมต่อ API
- ใช้ SpreadsheetApp.getActiveSpreadsheet() สำหรับไฟล์ศูนย์กลาง การเริ่มต้นระบบต้องรันซ้ำได้อย่างปลอดภัยโดยไม่ลบข้อมูลของผู้ใช้ รักษาลำดับคอลัมน์ตามอาร์เรย์หัวตารางที่ประกาศไว้ และห้ามลบหรือย้ายคอลัมน์หลังสร้างระบบ
- ชื่อฟังก์ชัน ตัวแปร ไฟล์ ชีต คอลัมน์ สถานะ คีย์กำหนดค่า โฟลเดอร์ และรหัสระบบทั้งหมดต้องใช้ภาษาอังกฤษ ส่วนคำอธิบาย เมนู ข้อความแจ้งเตือน อีเมล และพรอมต์ที่ส่งให้ AI ให้ใช้ภาษาไทย
- อ่านคีย์ API จาก PropertiesService.getScriptProperties() ด้วยชื่อ API_KEY เท่านั้น ห้ามบันทึกคีย์ในโค้ดหรือชีต หากคีย์ขึ้นต้นด้วย sk-ant ให้เรียก Anthropic มิฉะนั้นให้เรียก OpenAI รองรับคุณสมบัติ MODEL แบบไม่บังคับ โดยใช้ claude-sonnet-4-5 เป็นค่าเริ่มต้นสำหรับ Anthropic และ gpt-4o สำหรับ OpenAI
- ทุกคำสั่ง UrlFetchApp.fetch ต้องกำหนด muteHttpExceptions: true เมื่อ API ผิดพลาด ให้ส่งข้อผิดพลาดที่มีรหัส HTTP และเนื้อหาตอบกลับเดิม ต้องจัดการอย่างปลอดภัยเมื่อ AI ส่ง JSON ที่มีรั้วโค้ด ฟิลด์ไม่ครบ หรือรูปแบบไม่ถูกต้อง ความผิดพลาดของไฟล์หรือลูกค้าหนึ่งรายต้องไม่หยุดการประมวลผลทั้งชุด
- ทุกฟังก์ชันที่ Dashboard.html เรียกต้องมีอยู่จริงในไฟล์ .gs และชื่อไฟล์ HTML ต้องเป็น Dashboard เพื่อให้ตรงกับ createHtmlOutputFromFile('Dashboard')

สร้างชีตห้าชีตตามลำดับและใช้หัวคอลัมน์ดังนี้:
1. PRODUCTS: PRODUCT_ID, PRODUCT_NAME, PROBLEM_GROUP, BEST_FIT_CUSTOMER, NOT_FIT_CUSTOMER, PRICE_RANGE, KEY_FEATURES, LIMITATIONS, OFFICIAL_SOURCE, REVIEWED_AT, DATA_STATUS, CONTENT_LINK, PROFILE_LINK, NOTES
2. PARTNERS: PARTNER_ID, PROGRAM_NAME, RELATED_PRODUCT_ID, SIGNUP_LINK, REFERRAL_LINK, ATTRIBUTION_METHOD, ATTRIBUTION_WINDOW, COMMISSION_RATE, REVERSAL_CONDITIONS, PAYMENT_CYCLE, PROMOTION_LIMITATIONS, CONTACT, TERMS_SOURCE, REVIEWED_AT, APPROVAL_STATUS, PROFILE_LINK, NOTES
3. CUSTOMERS: CUSTOMER_ID, RECEIVED_AT, EMAIL, LEAD_SOURCE, TEAM_SIZE, USER_COUNT, PROBLEM_TO_SOLVE, CURRENT_TOOLS, MONTHLY_BUDGET, MUST_HAVE_REQUIREMENTS, IMPLEMENTATION_TIMELINE, AI_RESULT, RECOMMENDATIONS, MISSING_INFORMATION, HANDLING_LEVEL, APPROVAL_STATUS, SENT_AT, NOTES
4. COMMISSIONS: CUSTOMER_ID, PARTNER_ID, TRANSACTION_ID, RECORDED_AT, STATUS, ESTIMATED_COMMISSION, APPROVED_COMMISSION, AMOUNT_RECEIVED, EXPECTED_PAYMENT_DATE, RECONCILIATION_VARIANCE, OUTSTANDING_RECEIVABLE, REPORT_SOURCE, NOTES
5. SYSTEM_LOG: TIMESTAMP, ACTION, DETAILS, RESULT

สร้างรายการแบบเลือกพร้อมสีเตือนสำหรับสถานะต่อไปนี้:
- PRODUCTS: PENDING_REVIEW, VERIFIED, NEEDS_UPDATE
- PARTNERS: PENDING_REVIEW, APPROVED, NEEDS_CONFIRMATION, DECLINED
- CUSTOMERS: NEW, PENDING_APPROVAL, NEEDS_MORE_INFO, HANDOFF_TO_HUMAN, APPROVED, SENT
- HANDLING_LEVEL: LEVEL_1, LEVEL_2, LEVEL_3
- COMMISSIONS: RECORDED, ELIGIBLE, APPROVED, PAID, REVERSED

สร้างฟังก์ชันต่อไปนี้ให้ทำงานครบถ้วน:
1. initializeSystem สร้างชีตทั้งห้า หัวตาราง ตัวกรอง การตรึงแถวแรก รายการแบบเลือก รูปแบบแจ้งเตือน และบันทึกระบบ สร้างโฟลเดอร์หลัก AI_REFERRAL_SYSTEM พร้อมโฟลเดอร์ย่อย DATA_IMPORT และ COMMISSION_IMPORT สร้างไฟล์ COMMISSION_TEMPLATE.csv และชีตตัวอย่าง RESEARCH_SUMMARY_TEMPLATE แล้วบันทึก ID ทั้งหมดลง Script Properties
2. importResearchData อ่านแฟ้มข้อมูลจาก DATA_IMPORT ไฟล์ชื่อ PRODUCT_<CODE>_<NAME> ต้องให้ AI จัดโครงสร้างลง PRODUCTS ส่วนไฟล์ชื่อ PARTNER_<CODE>_<NAME> ต้องสกัดข้อกำหนดลง PARTNERS รองรับ Google Docs, TXT, PDF, รูปภาพ และสเปรดชีต แต่ละไฟล์ต้องสร้างหรืออัปเดตเพียงรหัสเดียว บันทึกลิงก์โปรไฟล์ ตั้งสถานะ PENDING_REVIEW และเปลี่ยนชื่อด้วยคำนำหน้า IMPORTED_ หลังนำเข้าเพื่อป้องกันข้อมูลซ้ำ หากข้อมูลไม่ครบให้ระบุส่วนที่ต้องตรวจสอบ ห้ามแต่งราคา คุณสมบัติ ข้อจำกัด หรือเงื่อนไขขึ้นเอง
3. createNeedsForm สร้าง Google Form ที่เก็บอีเมลผู้ตอบและมีคำถามเจ็ดข้อเท่านั้น ได้แก่ ขนาดทีม จำนวนผู้ใช้ซอฟต์แวร์โดยตรง ปัญหาที่ต้องการแก้ไข เครื่องมือปัจจุบัน งบประมาณสูงสุดต่อเดือน คุณสมบัติที่จำเป็น และช่วงเวลาที่ต้องการเริ่มใช้งาน ให้ระบบบันทึก LEAD_SOURCE เป็น “แบบฟอร์มความต้องการ” โดยอัตโนมัติ เชื่อมคำตอบกับสเปรดชีตปัจจุบัน สร้าง CUSTOMER_ID ที่ไม่ซ้ำ ตั้งสถานะ NEW และติดตั้งทริกเกอร์ส่งแบบฟอร์มโดยไม่สร้างซ้ำ
4. classifyNewCustomers จำแนกเฉพาะลูกค้าที่มีสถานะ NEW โดยใช้เฉพาะข้อมูล PRODUCTS ที่มีสถานะ VERIFIED และตรวจสอบมาไม่เกิน 90 วัน ห้ามส่ง COMMISSION_RATE หรือข้อมูลจาก PARTNERS เข้าไปในพรอมต์โดยเด็ดขาด AI ต้องส่ง JSON ซึ่งมีระดับการดูแล เหตุผล ผลิตภัณฑ์แนะนำไม่เกินสามรายการ และข้อมูลที่ยังขาด LEVEL_1 ให้เปลี่ยนเป็น PENDING_APPROVAL, LEVEL_2 เป็น NEEDS_MORE_INFO และ LEVEL_3 เป็น HANDOFF_TO_HUMAN หากรหัสผลิตภัณฑ์ไม่มีอยู่จริง ให้คงลูกค้าไว้ที่ NEW พร้อมบันทึกข้อผิดพลาด
5. createCustomerDrafts สร้างเฉพาะ Gmail draft และห้ามส่งอัตโนมัติ ลูกค้าที่ APPROVED ต้องได้รับร่างคำแนะนำซึ่งมีตัวเลือก เหตุผล ข้อควรพิจารณา และ REFERRAL_LINK ของพาร์ตเนอร์ที่ APPROVED ลูกค้าที่ NEEDS_MORE_INFO ต้องได้รับร่างคำถามเฉพาะข้อมูลที่ขาด ส่วนลูกค้าที่ HANDOFF_TO_HUMAN ต้องไม่มีร่างคำแนะนำอัตโนมัติ
6. markSelectedAsSent เปลี่ยนเฉพาะแถวที่ผู้ใช้เลือกเป็น SENT และบันทึก SENT_AT หลังผู้ใช้ตรวจทานและส่งอีเมลด้วยตนเอง
7. importCommissionReports นำเข้าไฟล์ CSV จาก COMMISSION_IMPORT โดยใช้ PARTNER_ID + TRANSACTION_ID เป็นคีย์ร่วม เพิ่มรายการใหม่หรืออัปเดตรายการเดิมให้ตรงธุรกรรม และเปลี่ยนชื่อไฟล์ด้วยคำนำหน้า IMPORTED_ เพื่อป้องกันการนำเข้าซ้ำ
8. reconcileCommissions คำนวณ RECONCILIATION_VARIANCE = ESTIMATED_COMMISSION - APPROVED_COMMISSION และ OUTSTANDING_RECEIVABLE = APPROVED_COMMISSION - AMOUNT_RECEIVED ด้วยโค้ด พร้อมไฮไลต์ค่าที่ต้องตรวจสอบ แต่ห้ามลบหรือปรับค่าความต่างโดยอัตโนมัติ
9. checkRisks ตรวจผลิตภัณฑ์ที่ไม่มี REVIEWED_AT หรือเกิน 90 วัน คำนวณสัดส่วน APPROVED_COMMISSION ของแต่ละพาร์ตเนอร์ย้อนหลัง 90 วันและเตือนเมื่อรายเดียวมีสัดส่วนตั้งแต่ 70% ตรวจลูกค้าที่ SENT แต่ยังไม่มีรายการค่าคอมมิชชันตาม CUSTOMER_ID และตรวจรายการ APPROVED ที่เลย EXPECTED_PAYMENT_DATE รายงานต้องแสดงบนหน้าจอ ส่งสำเนาไปยังอีเมลของบัญชีที่รันสคริปต์ และบันทึกใน SYSTEM_LOG
10. installSchedules ลบทริกเกอร์ตามเวลาเก่าของระบบก่อนเพื่อป้องกันรายการซ้ำ จากนั้นตั้ง checkRisks เวลา 08:00 น. ทุกวันจันทร์ และ reconcileCommissions เวลา 16:00 น. ทุกวันศุกร์ แดชบอร์ดไม่ต้องมีทริกเกอร์และต้องอ่านข้อมูลล่าสุดทุกครั้งที่เปิด
11. openDashboard เปิดกล่องโต้ตอบขนาดใหญ่จาก Dashboard.html
12. createDriveFolderTree สร้างโครงสร้าง Drive และบันทึก ID โดยไม่สร้างโฟลเดอร์หรือไฟล์ตัวอย่างซ้ำ
13. showSystemLinks แสดงลิงก์ของสเปรดชีต แบบฟอร์ม และโฟลเดอร์ระบบที่สร้างแล้ว
14. testApiConnection ส่งคำขอสั้น แจ้งชื่อโมเดลที่กำลังใช้ และแสดงข้อความที่เข้าใจง่ายเมื่อคีย์ผิด โมเดลผิด หรือโควตาหมด

ข้อกำหนดของแดชบอร์ด:
- เปิดเป็นกล่องโต้ตอบขนาดใหญ่และอ่านข้อมูลจากชีตเท่านั้นเมื่อโหลดหน้า ห้ามเรียก Drive หรือ AI ระหว่างเปิดแดชบอร์ด
- แสดงจำนวนลูกค้าแยกตามสถานะ ยอด ESTIMATED_COMMISSION, APPROVED_COMMISSION และ AMOUNT_RECEIVED รายการแจ้งเตือน งานที่ควรทำต่อ สัดส่วนตามพาร์ตเนอร์ และผลิตภัณฑ์ที่ตรวจสอบเกินกำหนด
- ทุกปุ่มต้องเรียกฟังก์ชันที่มีอยู่จริงผ่านรายการ switch ที่ชัดเจน ห้ามใช้ eval และต้องแสดงข้อผิดพลาดเป็นภาษาไทยที่ผู้ใช้เข้าใจได้

ขอบเขตความปลอดภัยที่ต้องเขียนไว้ทั้งในโค้ดและพรอมต์:
- AI ห้ามจัดอันดับผลิตภัณฑ์ตามค่าคอมมิชชัน และขั้นตอนจำแนกลูกค้าต้องไม่ได้รับ COMMISSION_RATE หรือข้อมูลใดจาก PARTNERS
- ระบบสร้างได้เฉพาะอีเมลฉบับร่าง ห้ามส่งแทนผู้ประกอบการหรือให้คำมั่นกับลูกค้า
- LEVEL_3 ครอบคลุมการย้ายข้อมูลเดิม การเชื่อมต่อที่ซับซ้อน ข้อมูลอ่อนไหว หรือสัญญามูลค่าสูง ต้องตั้งเป็น HANDOFF_TO_HUMAN และห้ามสร้างร่างคำแนะนำอัตโนมัติ
- ห้ามแต่งผลิตภัณฑ์ ราคา คุณสมบัติ ข้อจำกัด เงื่อนไข อัตราค่าคอมมิชชัน หลักฐาน หรือผลลัพธ์ หากข้อมูลขาดให้ระบุว่าขาดและรอผู้ใช้ยืนยัน
- เฉพาะ AMOUNT_RECEIVED เท่านั้นที่ถือเป็นเงินรับจริง ห้ามนำ ESTIMATED_COMMISSION ไปนับเป็นรายได้

ท้ายคำตอบ โปรดอธิบายอย่างละเอียดว่าต้องวางแต่ละไฟล์ที่ใด วิธีสร้าง API_KEY ฟังก์ชันแรกที่ต้องรันเพื่อขอสิทธิ์ เมนูที่ต้องรันก่อน วิธีสร้างและนำเข้าไฟล์ PRODUCT_/PARTNER_ วิธีตรวจและอนุมัติข้อมูล วิธีทดสอบแบบฟอร์ม การจำแนกลูกค้า อีเมลฉบับร่าง รายงานค่าคอมมิชชัน การกระทบยอด การตรวจความเสี่ยง ตารางอัตโนมัติ และแดชบอร์ด พร้อมตารางจับคู่ทุกฟังก์ชันที่ HTML เรียกกับไฟล์ .gs ที่ประกาศฟังก์ชันนั้น ห้ามย่อโค้ด ห้ามตัดฟังก์ชันช่วย และห้ามใช้ข้อความแทนโค้ด เช่น “ทำส่วนที่เหลือในลักษณะเดียวกัน”`;
