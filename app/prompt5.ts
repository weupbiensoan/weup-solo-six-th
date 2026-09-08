export const promptText5 = `ฉันต้องการสร้างระบบปฏิบัติการอีคอมเมิร์ซสำหรับผู้ประกอบการหนึ่งคนด้วย Google Sheets และ Google Apps Script โดยผู้ประกอบการยังเป็นผู้ตัดสินใจทุกเรื่องสำคัญ ส่วน AI มีหน้าที่จัดกลุ่มข้อมูล สร้างร่าง และสรุปเท่านั้น ห้าม AI ตัดสินใจเรื่องการสั่งผลิต การอนุมัติตัวอย่าง การส่งสินค้า การคืนเงิน หรือการปิดรอบบัญชี

บริบทการติดตั้ง: ฉันจะสร้าง Google Sheets เปล่า เปิด Apps Script จากสเปรดชีตนั้น และวางโค้ดลงไป โปรดส่งคืนไฟล์ที่สมบูรณ์สองไฟล์ในคำตอบเดียว โดยแยกเป็นบล็อกโค้ดและระบุชื่อชัดเจน ได้แก่ Main.gs สำหรับตรรกะหลัก เมนู และฝั่งเซิร์ฟเวอร์ของแดชบอร์ด และ dashboard.html สำหรับส่วนติดต่อผู้ใช้

ข้อกำหนดด้านสถาปัตยกรรม:
- ใช้ SpreadsheetApp.getActiveSpreadsheet() และห้ามใช้ SpreadsheetApp.create()
- ให้ Main.gs เป็นไฟล์เดียวที่ประกาศ onOpen และสร้างเมนู “การดำเนินงานคำสั่งซื้อ”
- ชื่อฟังก์ชัน ตัวแปร ไฟล์ ชีต คอลัมน์ สถานะ คีย์กำหนดค่า โฟลเดอร์ และรหัสระบบทั้งหมดต้องใช้ภาษาอังกฤษ ส่วนคำอธิบาย เมนู ข้อความแจ้งเตือน อีเมล และพรอมต์ที่ส่งให้ AI ให้ใช้ภาษาไทย
- ค้นหาคอลัมน์ตามชื่อหัวตาราง ห้ามผูกกับตำแหน่งคอลัมน์ และห้ามใช้ getLastRow(), getLastColumn() หรือ appendRow() เพื่อกำหนดขอบเขตข้อมูล
- เก็บหมายเลขโทรศัพท์ รหัสคำสั่งซื้อ และรหัสล็อตเป็นข้อความธรรมดา เพื่อรักษาเลขศูนย์นำหน้าและป้องกันการเปลี่ยนรูปแบบ
- ทุกการทำงานที่ส่งอีเมล เรียกบริการภายนอก หรือสร้างข้อมูลต้องมีเงื่อนไขป้องกันการทำซ้ำ โดยใช้รหัสเฉพาะ สถานะ วันที่ดำเนินการ หรือตราประทับการประมวลผล
- ห้ามใช้ eval ทุกปุ่มบนแดชบอร์ดต้องเรียกชื่อฟังก์ชันที่มีอยู่จริงผ่าน switch ที่ระบุรายการชัดเจน
- ฟังก์ชันทุกตัวที่ dashboard.html เรียกต้องประกาศอยู่ใน Main.gs และเมื่อจบคำตอบให้แสดงตารางจับคู่ชื่อฟังก์ชัน หน้าที่ และปุ่มที่เรียกใช้

การเชื่อมต่อ AI:
- อ่าน API key จาก PropertiesService.getScriptProperties() ด้วยชื่อ API_KEY เท่านั้น ห้ามเขียนคีย์ลงในโค้ดหรือชีต
- อ่าน AI_PROVIDER จาก CONFIG และรองรับ OPENAI กับ ANTHROPIC อ่านชื่อโมเดลจาก AI_MODEL และจำนวนโทเค็นจาก MAX_OUTPUT_TOKENS โดยกำหนดค่าเริ่มต้นไม่น้อยกว่า 4000
- ทุกคำสั่ง UrlFetchApp.fetch ต้องตั้ง muteHttpExceptions: true หาก API ผิดพลาด ให้แสดงรหัส HTTP พร้อมเนื้อหาตอบกลับเดิม
- หาก AI ส่ง JSON ไม่ถูกต้อง ให้เก็บข้อความดิบไว้ใน RAW_JSON หรือแจ้งผู้ใช้ชัดเจน โดยระบบส่วนอื่นต้องยังทำงานต่อได้

สร้างชีต 12 ชีตตามลำดับและใช้หัวคอลัมน์ดังนี้:
1. CONFIG: KEY, VALUE, NOTES
2. PRODUCTS: SKU, PRODUCT_NAME, VERSION, INGREDIENTS, DIMENSIONS, MATERIALS, PACKAGING, SALE_PRICE, LANDED_COST, BATCH_ID, SAMPLE_STATUS, SAMPLE_APPROVED_AT
3. PRODUCT_CHECKLIST: QUESTION, CHECK_LOCATION, ACTUAL_DATA, CONCLUSION
4. RAW_DEMAND: COLLECTED_AT, SOURCE, SOURCE_TYPE, VERBATIM_TEXT, REFERENCE_PRODUCT, AI_CLUSTER, APPROVED_CLUSTER, DEDUP_KEY
5. SUPPLIERS: SUPPLIER_ID, NAME, CATEGORY, CONTACT_PERSON, EMAIL, MOQ, QUOTED_PRICE, PRODUCTION_LEAD_TIME, PAYMENT_TERMS, REQUEST_SENT, SENT_AT, QUOTE_RECEIVED, SAMPLE_STATUS, ROLE
6. INVENTORY: SKU, AVAILABLE_TO_SELL, IN_PRODUCTION, PENDING_INSPECTION, DEFECTIVE, IN_TRANSIT, RETURNS_PENDING_INSPECTION, AVERAGE_DAILY_SALES, DAYS_OF_STOCK, REORDER_POINT, INVENTORY_VALUE, UPDATED_AT, DATA_SOURCE
7. ORDERS: ORDER_ID, ORDER_DATE, SALES_CHANNEL, SKU, QUANTITY, CUSTOMER_PAID, CUSTOMER_NAME, PHONE, ADDRESS, STATUS, TRACKING_ID, SENT_TO_WAREHOUSE_AT, BATCH_ID, NOTES
8. RETURNS_CANCELLATIONS: DATE, ORDER_ID, CHANNEL, REQUEST_TYPE, PRIORITY, SUMMARY, MISSING_INFORMATION, DRAFT_REPLY, HUMAN_REVIEW_REQUIRED, HANDLER, STATUS, REPLIED_AT, BATCH_ID, ROOT_CAUSE, RESPONSIBLE_PARTY, CONTENT_ID
9. RECONCILIATION: ORDER_ID, DATE, RECORDED_REVENUE, PLATFORM_FEE, PAYMENT_FEE, SHIPPING_SUPPORT, ACTUAL_PAYOUT, VARIANCE, RECONCILIATION_PERIOD, NOTES
10. CONTENT: CONTENT_ID, SKU, TYPE, CHANNEL, TITLE, BODY, SOURCE_REF, STATUS, APPROVER, APPROVED_AT, VERSION, LINK, RAW_JSON
11. UNIT_ECONOMICS: ITEM, PLANNED_AMOUNT, ACTUAL_AMOUNT, ACTUAL_SOURCE, NOTES
12. ALERTS: DATE, ALERT_TYPE, SKU, DETAILS, THRESHOLD, RESOLVED

เมื่อสร้างโครงสร้าง ให้จัดรูปแบบหัวตาราง ตรึงแถวแรก สร้างรายการแบบเลือก และรันซ้ำได้โดยไม่ลบข้อมูลเดิม ใช้ค่ามาตรฐานต่อไปนี้:
- ROLE: PRIMARY, BACKUP
- SAMPLE_STATUS: PENDING_APPROVAL, APPROVED, REJECTED
- CONTENT STATUS: AI_DRAFT, PENDING_APPROVAL, APPROVED
- ORDER STATUS: PENDING_CONFIRMATION, READY_TO_FULFILL, SENT_TO_WAREHOUSE, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED
- ค่าตรรกะใช้ YES หรือ NO

สร้างค่ากำหนดเริ่มต้นใน CONFIG ได้แก่ BRAND_NAME, PRIMARY_SKU, SALE_PRICE, PRIMARY_CHANNEL, SUPPLIER, AI_PROVIDER, AI_MODEL, MAX_OUTPUT_TOKENS, CLUSTER_BATCH_SIZE, MAX_IMPORT_ROWS, WAREHOUSE_EMAIL, MANAGER_EMAIL, REVIEWER_EMAIL, DEFAULT_HANDLER, PRODUCTION_LEAD_TIME_DAYS, SAFETY_STOCK, PLATFORM_FEE_RATE, PAYMENT_FEE_RATE, SHIPPING_SUPPORT, ROOT_CAUSE_RATE_THRESHOLD, BATCH_RATE_THRESHOLD, DEMAND_IMPORT_FOLDER_ID, ORDER_IMPORT_FOLDER_ID, SUPPLIER_FILES_FOLDER_ID, ROOT_FOLDER_ID, DEMAND_FORM_LINK ตลอดจนพรอมต์ AI หกรายการและแม่แบบอีเมลสามรายการที่ระบบต้องใช้

สร้างโครงสร้างโฟลเดอร์ใน Drive โดยมีโฟลเดอร์หลักชื่อ ECOMMERCE_OPERATIONS และโฟลเดอร์ย่อย DEMAND_IMPORT, ORDER_IMPORT และ SUPPLIER_FILES บันทึก ID ของทุกโฟลเดอร์ลง CONFIG และห้ามสร้างโฟลเดอร์ซ้ำเมื่อเรียกอีกครั้ง

เมนู “การดำเนินงานคำสั่งซื้อ” ต้องมีฟังก์ชันต่อไปนี้และทำงานครบ:
1. createSpreadsheetStructure สร้างชีต คอลัมน์ รายการแบบเลือก สูตร และค่ากำหนดโดยไม่ลบข้อมูลที่มีอยู่
2. editConfig เปิดตำแหน่งกำหนดค่าให้ผู้ใช้ตรวจแก้
3. createFolderTree สร้างโฟลเดอร์ Drive และบันทึก ID
4. checkFolders ตรวจสิทธิ์และรายงานโฟลเดอร์ที่ขาด
5. installTriggers สร้าง Trigger ตามเวลาและ Trigger ของแบบฟอร์มโดยไม่สร้างซ้ำ
6. testApiConnection ส่งคำขอสั้นและแยกข้อผิดพลาด 401, 404, 429 และข้อผิดพลาดอื่นอย่างชัดเจน
7. openDashboard เปิด dashboard.html ในหน้าต่างขนาดใหญ่
8. createDemandForm สร้าง Google Form สี่คำถาม เชื่อมคำตอบกับสเปรดชีต และบันทึกลิงก์ใน DEMAND_FORM_LINK
9. importDemandData อ่านไฟล์ CSV ใหม่จาก DEMAND_IMPORT ตรวจหัวคอลัมน์ จำกัดจำนวนตาม MAX_IMPORT_ROWS และป้องกันการนำเข้าซ้ำด้วย DEDUP_KEY
10. clusterDemand ลบอีเมลและหมายเลขโทรศัพท์ก่อนส่งข้อมูลเป็นชุดให้ AI บันทึกผลใน AI_CLUSTER และห้ามคัดลอกไป APPROVED_CLUSTER อัตโนมัติ
11. createProductRequirements อ่านเฉพาะ APPROVED_CLUSTER แล้วสร้างรายการ CONTENT ประเภท PRODUCT_REQUIREMENTS สถานะ AI_DRAFT โดยทำเครื่องหมาย NEEDS_CONFIRMATION ในข้อมูลที่คนต้องตัดสินใจ
12. createNewProductRequirementsVersion สร้างเวอร์ชันใหม่โดยรักษาเวอร์ชันเดิมไว้
13. sendQuoteRequests ส่งเฉพาะข้อกำหนดสถานะ APPROVED สร้าง PDF ใน SUPPLIER_FILES ส่งให้ซัพพลายเออร์ที่มีอีเมล และบันทึก REQUEST_SENT กับ SENT_AT เพื่อป้องกันการส่งซ้ำ
14. resetSupplierRequestRound เปิดรอบขอราคาใหม่โดยไม่ลบหลักฐานรอบเดิม
15. createSampleChecklist อ่านข้อกำหนดที่ APPROVED แล้วสร้าง CONTENT ประเภท SAMPLE_CHECKLIST พร้อมเกณฑ์ วิธีตรวจ และค่าที่ยอมรับได้
16. createSalesContent อ่านเฉพาะสินค้าและข้อกำหนดที่ APPROVED แล้วสร้างสามรายการ PRODUCT_DESCRIPTION, FAQ และ VIDEO_SCRIPT ด้วยสถานะ AI_DRAFT ห้ามสร้างคำกล่าวอ้างที่ไม่มีแหล่งอ้างอิง
17. importOrders อ่านไฟล์ CSV ใหม่จาก ORDER_IMPORT ตรวจข้อมูลบังคับ รักษารหัสเป็นข้อความ และป้องกันคำสั่งซื้อซ้ำด้วย ORDER_ID
18. validateOrders ตรวจ SKU จำนวน สต็อก ที่อยู่ และโทรศัพท์ เปลี่ยนเฉพาะรายการที่ผ่านเป็น READY_TO_FULFILL ส่วนรายการผิดคง PENDING_CONFIRMATION พร้อมเหตุผลเฉพาะเจาะจง
19. sendToWarehouse ส่งอีเมลเฉพาะรายการ READY_TO_FULFILL ที่ยังไม่มี SENT_TO_WAREHOUSE_AT จากนั้นบันทึกวันที่ รหัสล็อต และเปลี่ยนสถานะเป็น SENT_TO_WAREHOUSE
20. inventoryAlerts คำนวณ AVERAGE_DAILY_SALES, DAYS_OF_STOCK, REORDER_POINT และ INVENTORY_VALUE ด้วยโค้ด บันทึก ALERTS เมื่อถึงเกณฑ์ และห้ามสร้างใบสั่งซื้อหรือโอนเงินอัตโนมัติ
21. classifySupportEmails อ่านเฉพาะอีเมลติดป้าย SUPPORT_PENDING ใช้ AI จัดประเภท สรุป และร่างคำตอบ บันทึกลง RETURNS_CANCELLATIONS และสร้าง Gmail draft เท่านั้น ห้ามส่งอัตโนมัติ
22. summarizeReturnsCancellations สรุปย้อนหลังเจ็ดวันตาม ROOT_CAUSE และ BATCH_ID บันทึกการแจ้งเตือนเมื่อเกินเกณฑ์ แต่ห้ามตัดสินใจคืนเงิน หยุดขาย หรือกล่าวโทษพันธมิตรอัตโนมัติ
23. reconcilePeriod นำเข้าไฟล์ที่มีคำว่า RECONCILIATION คำนวณ VARIANCE ด้วยโค้ด ป้องกันแถวซ้ำ และห้ามปิดรอบหรืออัปเดตต้นทุนจริงเมื่อ VARIANCE ไม่เท่ากับศูนย์

ข้อกำหนดด้านความปลอดภัยและการควบคุม:
- AI ใช้เฉพาะข้อมูลที่มีอยู่ ห้ามสร้างความต้องการ ข้อกำหนด ราคา สรรพคุณ นโยบาย หรือคำยืนยันใหม่
- การอนุมัติข้อกำหนด ตัวอย่าง เนื้อหา ซัพพลายเออร์ จำนวนผลิต การส่งคลัง การคืนเงิน และการปิดรอบต้องเกิดจากการกระทำของคนจริง
- เก็บเวอร์ชัน เอกสารส่งออก สถานะ วันที่ และผู้อนุมัติให้ตรวจย้อนกลับได้
- แดชบอร์ดอ่านข้อมูลจากชีตเท่านั้นเมื่อเปิดหน้า ห้ามเรียก Drive หรือ API ระหว่างโหลด และต้องแสดงสถานะรวม คำเตือน งานถัดไป สต็อก คำสั่งซื้อ งานสนับสนุน และการกระทบยอด
- แดชบอร์ดต้องมีปุ่มรีเฟรช ปุ่มดำเนินงานถัดไป ช่องบันทึก API_KEY ลง Script Properties และส่วนแสดงข้อผิดพลาดที่ผู้ใช้เข้าใจได้

สุดท้าย โปรดอธิบายโดยละเอียดตั้งแต่การสร้าง Google Sheets การเปิด Apps Script การสร้างไฟล์ Main.gs และ dashboard.html การรัน createSpreadsheetStructure เพื่อขอสิทธิ์ การกรอก CONFIG การบันทึก API_KEY การสร้างโฟลเดอร์ แบบฟอร์ม และ Trigger ไปจนถึงลำดับรวบรวมความต้องการ อนุมัติข้อกำหนด ขอราคา ตรวจตัวอย่าง สร้างเนื้อหา นำเข้าคำสั่งซื้อ ส่งคลัง จัดการอีเมล แจ้งเตือนสต็อก กระทบยอด และสรุปการคืนสินค้า พร้อมวิธีตรวจผลและแก้ข้อผิดพลาดที่พบบ่อย ห้ามย่อโค้ด ห้ามละฟังก์ชันช่วย และห้ามใช้ข้อความแทนโค้ด เช่น “ทำต่อในลักษณะเดียวกัน”`;
