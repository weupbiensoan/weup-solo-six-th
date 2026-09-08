export const promptText4 = `ฉันต้องการสร้างระบบรายงานยอดขายรายสัปดาห์สำหรับธุรกิจขนาดเล็กด้วย Google Sheets และ Google Apps Script ระบบต้องตรวจสอบข้อมูลโดยอัตโนมัติ คำนวณตัวชี้วัดทั้งหมดด้วยโค้ด ใช้ AI เฉพาะการเขียนคำอธิบาย กำหนดให้ผู้จัดการตรวจและอนุมัติก่อนส่งอีเมล และมีแดชบอร์ดที่อ่านง่าย

บริบทการติดตั้ง: ฉันจะสร้าง Google Sheets เปล่า เปิด Apps Script จากสเปรดชีตนั้น และวางโค้ดลงไป โปรดส่งคืนไฟล์ที่สมบูรณ์จำนวนสามไฟล์ในคำตอบเดียว โดยแยกแต่ละไฟล์เป็นบล็อกโค้ดและระบุชื่อให้ชัดเจน ได้แก่ Main.gs สำหรับตรรกะหลักและเมนู, dashboard.gs สำหรับฝั่งเซิร์ฟเวอร์ของแดชบอร์ด และ dashboard.html สำหรับส่วนติดต่อผู้ใช้

ข้อกำหนดด้านสถาปัตยกรรม:
- ใช้ SpreadsheetApp.getActiveSpreadsheet() และห้ามใช้ SpreadsheetApp.create()
- ให้ Main.gs เป็นไฟล์เดียวที่ประกาศ onOpen และสร้างเมนู “รายงานประจำสัปดาห์” เมนูประกอบด้วย เปิดแดชบอร์ด; 1. สร้างโครงสร้างชีต; 2. ตรวจสอบข้อมูลประจำสัปดาห์; 3. คำนวณตัวชี้วัดประจำสัปดาห์; 4. สร้างความเห็นด้วย AI; 5. ส่งรายงานที่อนุมัติแล้ว; 6. ทดสอบการเชื่อมต่อ API; 7. ตั้งเวลาทำงานอัตโนมัติ
- อ่านคีย์ API จาก PropertiesService.getScriptProperties() โดยใช้ชื่อ OPENAI_API_KEY เท่านั้น ห้ามเขียนคีย์ลงในโค้ดหรือสเปรดชีต
- ใช้ OpenAI Responses API ทุกคำสั่ง UrlFetchApp.fetch ต้องตั้ง muteHttpExceptions: true หาก API ผิดพลาด ให้แสดงรหัส HTTP พร้อมเนื้อหาตอบกลับเดิม อ่าน MODEL และ MAX_OUTPUT_TOKENS จาก CONFIG โดยใช้ค่าเริ่มต้น gpt-5.6 และกำหนด MAX_OUTPUT_TOKENS อย่างน้อย 4000
- ค้นหาคอลัมน์ด้วยชื่อหัวตาราง ห้ามใช้ตำแหน่งคอลัมน์แบบตายตัว ชื่อฟังก์ชัน ตัวแปร ไฟล์ ชีต คอลัมน์ สถานะ และคีย์กำหนดค่าให้ใช้ภาษาอังกฤษ ส่วนคำอธิบาย ข้อความแจ้งเตือน อีเมล และคำสั่งที่ส่งให้ AI ให้ใช้ภาษาไทย
- ฟังก์ชันทั้งหมดที่ dashboard.html เรียกต้องมีอยู่จริงในไฟล์ .gs เมื่อจบคำตอบให้แสดงตารางจับคู่ชื่อฟังก์ชัน ไฟล์ที่ประกาศ และหน้าที่ของฟังก์ชัน

สร้างชีตระบบห้าชีตตามลำดับและใช้ชื่อคอลัมน์ภาษาอังกฤษดังนี้:
1. CONFIG: KEY, VALUE, NOTES
2. DAILY_DATA: DATE, EMPLOYEE, NEW_LEADS, CONTACTED_LEADS, APPOINTMENTS, SUCCESSFUL_ORDERS, RECOGNIZED_REVENUE, CASH_COLLECTED, CANCELLED_ORDERS, RETURNED_ORDERS, NOTES
3. WEEKLY_METRICS: WEEK_ID, START_DATE, END_DATE, NEW_LEADS, CONTACTED_LEADS, APPOINTMENTS, SUCCESSFUL_ORDERS, RECOGNIZED_REVENUE, CASH_COLLECTED, CANCELLED_ORDERS, RETURNED_ORDERS, CONTACT_RATE, CLOSE_RATE, CANCELLATION_RATE, RETURN_RATE, WEEKLY_KPI, KPI_ACHIEVEMENT, VS_PREVIOUS_WEEK, DATA_STATUS, CALCULATED_AT
4. AI_REPORT: REPORT_ID, WEEK_ID, CREATED_AT, OVERVIEW, WARNINGS, RECOMMENDED_ACTIONS, QUESTIONS_FOR_MANAGER, STATUS, APPROVER, APPROVED_AT, SENT_AT, RECIPIENTS, RAW_JSON
5. SYSTEM_LOG: TIME, FUNCTION, WEEK_ID, STATUS, DETAILS, REPORT_ID

เมื่อสร้างโครงสร้าง ให้จัดรูปแบบแถวหัวตาราง ตรึงแถวแรก และสร้างรายการแบบเลือกสำหรับ STATUS ได้แก่ NEEDS_DATA_FIX, PENDING_APPROVAL, APPROVED_TO_SEND, SENT และ ERROR พร้อมสร้างค่ากำหนดเริ่มต้นใน CONFIG ได้แก่ COMPANY_NAME, CUSTOMER_FILE_ID, CUSTOMER_SHEET_NAME, REPORT_PERIOD, WEEKLY_KPI, MAX_EMPTY_CELL_RATE, CASH_COLLECTED_DROP_THRESHOLD, CLOSE_RATE_DROP_THRESHOLD, EMAIL_RECIPIENTS, MODEL, MAX_OUTPUT_TOKENS, EMAILS_PER_RUN, SYSTEM_PROMPT, USER_PROMPT, EMAIL_SUBJECT และ EMAIL_BODY

REPORT_PERIOD รองรับ CURRENT_WEEK, PREVIOUS_WEEK หรือวันที่รูปแบบ yyyy-MM-dd สำหรับเรียกใช้รายงานของสัปดาห์เก่า สัปดาห์เริ่มวันจันทร์และสิ้นสุดวันอาทิตย์ หาก REPORT_PERIOD เป็นวันที่คงที่ ฟังก์ชันตามเวลาต้องข้ามการทำงานเพื่อไม่ให้สร้างรายงานของสัปดาห์เดิมซ้ำ

ฟังก์ชันที่ต้องทำงานครบ:
1. สร้างชีต คอลัมน์ รายการแบบเลือก และค่ากำหนดเริ่มต้นโดยไม่ลบข้อมูลที่มีอยู่ และต้องรันซ้ำได้อย่างปลอดภัย
2. อ่าน DAILY_DATA จากไฟล์ปัจจุบัน หรืออ่าน Google Sheets อื่นโดยใช้ CUSTOMER_FILE_ID และ CUSTOMER_SHEET_NAME แดชบอร์ดต้องรับได้ทั้ง URL และรหัสไฟล์ ตรวจสิทธิ์เข้าถึง แล้วบันทึกรหัสลง CONFIG
3. ตรวจสอบข้อมูลของสัปดาห์ก่อนคำนวณ ได้แก่ วันที่อ่านไม่ได้ วันที่ในอนาคต ชื่อพนักงานว่าง ค่าติดลบ แถวซ้ำตาม DATE กับ EMPLOYEE และสัดส่วนช่องบังคับว่างเกิน MAX_EMPTY_CELL_RATE ให้ข้ามข้อมูลนอกช่วงเพราะไฟล์อาจเก็บหลายสัปดาห์ หากไม่มีข้อมูลในช่วงที่เลือก ให้แนะนำให้เปลี่ยน REPORT_PERIOD และบันทึกผลตรวจสอบกับข้อผิดพลาดลง SYSTEM_LOG
4. คำนวณผลรวมและอัตรารายสัปดาห์ทั้งหมดด้วยโค้ด ห้ามให้ AI คำนวณ หากตัวหารเป็นศูนย์ให้เว้นอัตรานั้นและบันทึกคำเตือน ดึงหรือคำนวณสัปดาห์ก่อนเพื่อเปรียบเทียบ NEW_LEADS, SUCCESSFUL_ORDERS, CASH_COLLECTED และ CLOSE_RATE จากนั้นเพิ่มหรืออัปเดตแถว WEEK_ID ที่ถูกต้องใน WEEKLY_METRICS
5. สร้างความเห็นด้วย AI เฉพาะเมื่อมีตัวชี้วัดแล้วและยังไม่มีรายงานของสัปดาห์นั้น ส่งเฉพาะตัวชี้วัดที่คำนวณแล้ว ข้อมูลสัปดาห์ก่อน KPI ระดับการบรรลุ KPI และเกณฑ์แจ้งเตือน AI ต้องตอบ JSON ที่มีสี่ฟิลด์เท่านั้น ได้แก่ OVERVIEW, WARNINGS, RECOMMENDED_ACTIONS และ QUESTIONS_FOR_MANAGER ห้าม AI คำนวณหรือสร้างตัวเลขใหม่ ห้ามเดาสาเหตุเมื่อข้อมูลไม่พอ ห้ามระบุชื่อหรือประเมินความสามารถของพนักงาน ห้ามเสนอรางวัลหรือบทลงโทษ แต่ละส่วนไม่เกินห้าประโยคและใช้โทนเป็นกลาง รายงานใหม่ต้องมีสถานะ PENDING_APPROVAL
6. หาก AI ล้มเหลว ตอบว่าง หรือส่ง JSON ไม่ถูกต้อง ให้บันทึกข้อความเดิมใน RAW_JSON ตั้งสถานะ ERROR เก็บ WEEKLY_METRICS ไว้ และดำเนินระบบส่วนอื่นต่อได้ ผู้จัดการต้องสามารถเขียนความเห็นเองได้
7. การอนุมัติเกิดขึ้นเมื่อบุคคลจริงกรอกชื่อและกดปุ่มอนุมัติบนแดชบอร์ดเท่านั้น จากนั้นจึงบันทึก APPROVER และ APPROVED_AT และเปลี่ยน PENDING_APPROVAL เป็น APPROVED_TO_SEND ห้ามฟังก์ชันอัตโนมัติเรียกฟังก์ชันอนุมัติ
8. ส่งอีเมลเฉพาะรายงานสถานะ APPROVED_TO_SEND ที่มี APPROVER และ APPROVED_AT และยังไม่มี SENT_AT อ่านผู้รับจาก EMAIL_RECIPIENTS ตรวจรูปแบบอีเมล และจำกัดไม่เกิน 20 คนต่อการทำงาน ใช้แม่แบบ EMAIL_SUBJECT และ EMAIL_BODY จาก CONFIG และแทนตัวแปรด้วย split().join() เมื่อส่งสำเร็จให้บันทึก SENT_AT และเปลี่ยนสถานะเป็น SENT เพื่อป้องกันการส่งซ้ำ
9. ทดสอบ API ด้วยคำขอสั้นและแยกกรณี 401 คีย์ไม่ถูกต้อง, 429 เกินโควตาหรือถูกจำกัดอัตรา, 404 ชื่อโมเดลไม่ถูกต้อง และข้อผิดพลาดอื่นอย่างชัดเจน
10. สร้างทริกเกอร์ runScheduledReport สำหรับช่วงเย็นวันศุกร์โดยไม่สร้างซ้ำ ฟังก์ชันตามเวลาต้องทำตามลำดับ ตรวจข้อมูล → คำนวณตัวชี้วัด → สร้างร่างด้วย AI แล้วหยุดที่ PENDING_APPROVAL ห้ามอนุมัติหรือส่งอัตโนมัติ หากมีข้อผิดพลาดให้บันทึกใน SYSTEM_LOG และสามารถแจ้งผู้รับผิดชอบคนแรกทางอีเมลได้

ข้อกำหนดของแดชบอร์ด:
- openDashboard ใช้ HtmlService.createHtmlOutputFromFile('dashboard') และเปิดหน้าต่างขนาดใหญ่
- getDashboardData อ่านเฉพาะข้อมูลจากสเปรดชีตเมื่อโหลดหน้า ห้ามเรียก Drive หรือ API ระหว่างเปิดแดชบอร์ด
- แสดงช่วงรายงาน KPI หลัก คำเตือน งานถัดไป ผลตรวจข้อมูล ตัวชี้วัดรายสัปดาห์ เนื้อหารายงาน AI ทั้งสี่ส่วน สถานะ และผู้อนุมัติ
- มีปุ่มรีเฟรช ปุ่มดำเนินงานถัดไปผ่าน switch ที่ระบุรายการชัดเจนและห้ามใช้ eval ช่องกรอกชื่อพร้อมปุ่มอนุมัติ ช่องเชื่อมไฟล์ข้อมูลลูกค้า และช่องบันทึก OPENAI_API_KEY ลง Script Properties
- ต้องมีฟังก์ชัน openDashboard, getDashboardData, runAction, approveReport, saveCustomerFile และ saveApiKey

สุดท้าย โปรดอธิบายโดยละเอียดว่าต้องสร้าง Google Sheets อย่างไร เปิด Apps Script ที่ใด สร้างและวางไฟล์ทั้งสามอย่างไร ชื่อไฟล์ HTML ที่ต้องตรงกับ createHtmlOutputFromFile ฟังก์ชันแรกที่ต้องรันเพื่อขอสิทธิ์ วิธีเติม CONFIG และบันทึก OPENAI_API_KEY ลำดับการตรวจข้อมูล คำนวณตัวชี้วัด สร้างความเห็น อนุมัติ และส่งรายงาน วิธีเปิดแดชบอร์ดและตั้งเวลาทำงาน ตลอดจนวิธีตรวจผลหลังแต่ละขั้นตอนและแก้ข้อผิดพลาดที่พบบ่อย ห้ามย่อโค้ด ห้ามละฟังก์ชันช่วย และห้ามใช้ข้อความแทนโค้ด เช่น “ทำต่อในลักษณะเดียวกัน”`;
