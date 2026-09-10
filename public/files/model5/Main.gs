/** WEUP SoloSix — โมเดล 5: ระบบอีคอมเมิร์ซสำหรับผู้ประกอบการคนเดียว */
var SHEET_KEYS = ["CONFIG", "PRODUCTS", "PRODUCT_CHECK", "RAW_DATA", "SUPPLIERS", "INVENTORY", "ORDERS", "RETURNS_CANCELS", "RECONCILIATION", "CONTENT", "UNIT_ECONOMICS", "ALERTS"];
var COLUMNS = {
    CONFIG: ["KEY", "VALUE", "NOTES"],
    PRODUCTS: ["PRODUCT_CODE", "PRODUCT_NAME", "VERSION", "COMPONENTS", "DIMENSIONS", "MATERIAL", "PACKAGING",
        "SELLING_PRICE", "LANDED_COST", "BATCH_CODE", "SAMPLE_STATUS", "SAMPLE_APPROVAL_DATE"],
    PRODUCT_CHECK: ["QUESTION", "CHECK_LOCATION", "ACTUAL_DATA", "CONCLUSION"],
    RAW_DATA: ["COLLECTED_DATE", "SOURCE", "SOURCE_TYPE", "RAW_TEXT", "PRODUCT_REFERENCE",
        "AI_GROUP", "APPROVED_GROUP", "DUPLICATE_HASH"],
    SUPPLIERS: ["SUPPLIER_CODE", "NAME", "CATEGORY", "CONTACT_PERSON", "EMAIL", "MINIMUM_ORDER_QTY",
        "QUOTED_PRICE", "PRODUCTION_LEAD_TIME", "PAYMENT_TERMS", "QUOTE_REQUEST_SENT", "SENT_DATE",
        "QUOTE_RECEIVED", "SAMPLE_STATUS", "ROLE"],
    INVENTORY: ["PRODUCT_CODE", "AVAILABLE_STOCK", "IN_PRODUCTION", "PENDING_INSPECTION", "DEFECTIVE_STOCK", "IN_TRANSIT",
        "UNINSPECTED_RETURNS", "AVERAGE_DAILY_SALES", "DAYS_OF_STOCK", "REORDER_POINT", "INVENTORY_VALUE",
        "UPDATED_DATE", "DATA_SOURCE"],
    ORDERS: ["ORDER_CODE", "ORDER_DATE", "SALES_CHANNEL", "PRODUCT_CODE", "QUANTITY", "CUSTOMER_PAID", "CUSTOMER_NAME",
        "PHONE_NUMBER", "ADDRESS", "STATUS", "TRACKING_CODE", "WAREHOUSE_SENT_DATE", "BATCH_CODE", "NOTES"],
    RETURNS_CANCELS: ["DATE", "ORDER_CODE", "CHANNEL", "REQUEST_GROUP", "PRIORITY", "SUMMARY", "MISSING_INFO",
        "REPLY_TEMPLATE", "REQUIRES_HUMAN_APPROVAL", "ASSIGNEE", "STATUS", "REPLY_DATE", "BATCH_CODE",
        "ROOT_CAUSE", "RESPONSIBLE_PARTY", "CONTENT_CODE"],
    RECONCILIATION: ["ORDER_CODE", "DATE", "RECOGNIZED_REVENUE", "PLATFORM_FEE", "PAYMENT_FEE",
        "SHIPPING_SUBSIDY", "ACTUAL_RECEIVED", "DIFFERENCE", "RECONCILIATION_PERIOD", "NOTES"],
    CONTENT: ["CONTENT_CODE", "PRODUCT_CODE", "TYPE", "CHANNEL", "TITLE", "CONTENT_TEXT", "SOURCE_LINK",
        "STATUS", "APPROVER", "APPROVAL_DATE", "VERSION", "LINK", "RAW_JSON"],
    UNIT_ECONOMICS: ["COST_ITEM", "PLANNED_AMOUNT", "ACTUAL_AMOUNT", "ACTUAL_SOURCE", "NOTES"],
    ALERTS: ["DATE", "ALERT_TYPE", "PRODUCT_CODE", "CONTENT_TEXT", "THRESHOLD", "RESOLVED"]
};

var SHEET_NAMES = {
  CONFIG: "การตั้งค่า",
  PRODUCTS: "สินค้า",
  PRODUCT_CHECK: "ตรวจสอบสินค้า",
  RAW_DATA: "ข้อมูลดิบ",
  SUPPLIERS: "ซัพพลายเออร์",
  INVENTORY: "สต็อก",
  ORDERS: "คำสั่งซื้อ",
  RETURNS_CANCELS: "คืนสินค้าและยกเลิก",
  RECONCILIATION: "กระทบยอด",
  CONTENT: "เนื้อหา",
  UNIT_ECONOMICS: "กำไรต่อคำสั่งซื้อ",
  ALERTS: "การแจ้งเตือน"
};
var COLUMN_LABELS = {
  CONFIG: [
    "คีย์",
    "ค่า",
    "หมายเหตุ"
  ],
  PRODUCTS: [
    "รหัสสินค้า",
    "ชื่อสินค้า",
    "เวอร์ชัน",
    "ส่วนประกอบ",
    "ขนาด",
    "วัสดุ",
    "บรรจุภัณฑ์",
    "ราคาขาย",
    "ต้นทุนเข้าคลัง",
    "รหัสล็อต",
    "สถานะตัวอย่าง",
    "วันที่อนุมัติตัวอย่าง"
  ],
  PRODUCT_CHECK: [
    "คำถาม",
    "ตรวจสอบที่ใด",
    "ข้อมูลจริง",
    "ผลสรุป"
  ],
  RAW_DATA: [
    "วันที่เก็บ",
    "แหล่งที่มา",
    "ประเภทแหล่ง",
    "ข้อความต้นฉบับ",
    "สินค้าอ้างอิง",
    "กลุ่มจาก AI",
    "กลุ่มที่อนุมัติ",
    "รหัสตรวจซ้ำ"
  ],
  SUPPLIERS: [
    "รหัสซัพพลายเออร์",
    "ชื่อ",
    "หมวดหมู่",
    "ผู้ติดต่อ",
    "อีเมล",
    "จำนวนสั่งซื้อขั้นต่ำ",
    "ราคาที่เสนอ",
    "ระยะเวลาผลิต",
    "เงื่อนไขการชำระเงิน",
    "ส่งคำขอราคาแล้ว",
    "วันที่ส่ง",
    "ได้รับใบเสนอราคาแล้ว",
    "สถานะตัวอย่าง",
    "บทบาท"
  ],
  INVENTORY: [
    "รหัสสินค้า",
    "สต็อกพร้อมขาย",
    "กำลังผลิต",
    "รอตรวจสอบ",
    "สินค้าชำรุด",
    "กำลังจัดส่ง",
    "สินค้าคืนรอตรวจ",
    "ยอดขายเฉลี่ยต่อวัน",
    "จำนวนวันคงเหลือ",
    "จุดสั่งซื้อใหม่",
    "มูลค่าสต็อก",
    "วันที่อัปเดต",
    "แหล่งข้อมูล"
  ],
  ORDERS: [
    "รหัสคำสั่งซื้อ",
    "วันที่สั่งซื้อ",
    "ช่องทางขาย",
    "รหัสสินค้า",
    "จำนวน",
    "ยอดที่ลูกค้าชำระ",
    "ชื่อลูกค้า",
    "หมายเลขโทรศัพท์",
    "ที่อยู่",
    "สถานะ",
    "เลขพัสดุ",
    "วันที่ส่งคลัง",
    "รหัสล็อต",
    "หมายเหตุ"
  ],
  RETURNS_CANCELS: [
    "วันที่",
    "รหัสคำสั่งซื้อ",
    "ช่องทาง",
    "กลุ่มคำขอ",
    "ระดับความสำคัญ",
    "สรุป",
    "ข้อมูลที่ขาด",
    "ข้อความตอบกลับ",
    "ต้องให้ผู้ดูแลอนุมัติ",
    "ผู้รับผิดชอบ",
    "สถานะ",
    "วันที่ตอบกลับ",
    "รหัสล็อต",
    "สาเหตุหลัก",
    "ฝ่ายรับผิดชอบ",
    "รหัสเนื้อหา"
  ],
  RECONCILIATION: [
    "รหัสคำสั่งซื้อ",
    "วันที่",
    "รายได้ที่บันทึก",
    "ค่าธรรมเนียมแพลตฟอร์ม",
    "ค่าธรรมเนียมชำระเงิน",
    "เงินสนับสนุนค่าจัดส่ง",
    "ยอดรับจริง",
    "ส่วนต่าง",
    "รอบกระทบยอด",
    "หมายเหตุ"
  ],
  CONTENT: [
    "รหัสเนื้อหา",
    "รหัสสินค้า",
    "ประเภท",
    "ช่องทาง",
    "ชื่อเรื่อง",
    "เนื้อหา",
    "ลิงก์แหล่งที่มา",
    "สถานะ",
    "ผู้อนุมัติ",
    "วันที่อนุมัติ",
    "เวอร์ชัน",
    "ลิงก์",
    "JSON ดิบ"
  ],
  UNIT_ECONOMICS: [
    "รายการต้นทุน",
    "ยอดประมาณการ",
    "ยอดจริง",
    "แหล่งยอดจริง",
    "หมายเหตุ"
  ],
  ALERTS: [
    "วันที่",
    "ประเภทการแจ้งเตือน",
    "รหัสสินค้า",
    "เนื้อหา",
    "เกณฑ์",
    "ดำเนินการแล้ว"
  ]
};

function getSheetName_(key) { return SHEET_NAMES[key] || key; }
function getSheetKey_(name) {
  var keys = Object.keys(SHEET_NAMES);
  for (var i = 0; i < keys.length; i++) if (SHEET_NAMES[keys[i]] === name) return keys[i];
  return name;
}
function normalizeHeader_(value) {
  var text = String(value || '').trim();
  var key = getSheetKey_(text);
  if (key !== text) return key;
  var sheets = Object.keys(COLUMN_LABELS);
  for (var i = 0; i < sheets.length; i++) {
    var labels = COLUMN_LABELS[sheets[i]];
    var index = labels.indexOf(text);
    if (index > -1) return COLUMNS[sheets[i]][index];
  }
  return text.toUpperCase();
}

var TEXT_COLUMNS = {
    ORDERS: ["PHONE_NUMBER", "ORDER_CODE", "BATCH_CODE"],
    CONFIG: ["VALUE"],
    PRODUCTS: ["BATCH_CODE"],
    RETURNS_CANCELS: ["BATCH_CODE"],
    RECONCILIATION: ["ORDER_CODE"]
};
var DEFAULT_CONFIG = [
  ["BRAND_NAME", "", "ชื่อแบรนด์ที่ใช้ในอีเมลและเนื้อหาการขาย"],
  ["PRIMARY_PRODUCT_CODE", "", "รหัสสินค้าหลัก ต้องตรงกับรหัสสินค้าในชีตสินค้า"],
  ["SELLING_PRICE", "", "ราคาขายต่อชุด หน่วยเป็นบาท กรอกเฉพาะตัวเลข"],
  ["PRIMARY_SALES_CHANNEL", "", "ชื่อช่องทางขายหลัก"],
  ["AI_PROVIDER", "OPENAI", "กรอก OPENAI หรือ ANTHROPIC"],
  ["AI_MODEL", "", "ชื่อโมเดลที่บัญชี API ของคุณใช้งานได้"],
  ["MAX_TOKENS", "4000", "จำนวนโทเคนสูงสุด ระบบจะใช้ไม่น้อยกว่า 4000"],
  ["CLASSIFICATION_BATCH_SIZE", "40", "จำนวนข้อความต่อชุดในการจัดกลุ่มขั้นตอนที่ 3"],
  ["IMPORT_BATCH_SIZE", "300", "จำนวนแถวสูงสุดต่อการนำเข้าหนึ่งครั้งในขั้นตอนที่ 8"],
  ["WAREHOUSE_EMAIL", "", "อีเมลคลังสินค้าที่รับรายการจัดส่งในขั้นตอนที่ 10"],
  ["MANAGER_EMAIL", "", "อีเมลผู้จัดการที่รับการแจ้งเตือนสต็อกและสรุปคืนสินค้า"],
  ["APPROVER_EMAIL", "", "อีเมลผู้อนุมัติเนื้อหาและอีเมลลูกค้า"],
  ["DEFAULT_ASSIGNEE", "", "ชื่อผู้รับผิดชอบเริ่มต้นในชีตคืนสินค้าและยกเลิก"],
  ["PRODUCTION_LEAD_DAYS", "18", "จำนวนวันตั้งแต่สั่งผลิตจนรับสินค้า ใช้คำนวณจุดสั่งซื้อใหม่"],
  ["SAFETY_STOCK", "40", "จำนวนสต็อกสำรอง ใช้คำนวณจุดสั่งซื้อใหม่"],
  ["PLATFORM_FEE_RATE", "", "อัตราค่าธรรมเนียมแพลตฟอร์มเป็นเปอร์เซ็นต์ เช่น 9"],
  ["PAYMENT_FEE_RATE", "", "อัตราค่าธรรมเนียมการชำระเงินเป็นเปอร์เซ็นต์"],
  ["SHIPPING_SUBSIDY", "", "เงินสนับสนุนค่าจัดส่งต่อคำสั่งซื้อ หน่วยเป็นบาท"],
  ["ROOT_CAUSE_ALERT_PERCENT", "30", "แจ้งเตือนเมื่อสาเหตุหนึ่งเกินเปอร์เซ็นต์นี้"],
  ["BATCH_ALERT_MULTIPLIER", "2", "แจ้งเตือนเมื่อล็อตหนึ่งมีอัตราคืนสูงกว่าค่าเฉลี่ยตามจำนวนเท่านี้"],
  ["ROOT_FOLDER_ID", "", "ระบบกรอกให้อัตโนมัติเมื่อสร้างโครงสร้างโฟลเดอร์"],
  ["DATA_INBOX_FOLDER_ID", "", "ระบบกรอกให้อัตโนมัติ"],
  ["ORDER_INBOX_FOLDER_ID", "", "ระบบกรอกให้อัตโนมัติ"],
  ["SUPPLIER_FILES_FOLDER_ID", "", "ระบบกรอกให้อัตโนมัติ"],
  ["DEMAND_FORM_URL", "", "ระบบกรอกให้อัตโนมัติเมื่อสร้างแบบฟอร์ม"],
  ["DEMAND_GROUPING_PROMPT", "คุณจะได้รับอาร์เรย์ JSON แต่ละรายการมี row_number และ text ให้จัดข้อความแต่ละรายการเข้ากลุ่มปัญหาที่ตรงกับเนื้อหาเท่านั้น ใช้ชื่อกลุ่มภาษาไทยสั้นไม่เกิน 4 คำ ห้ามสร้างข้อมูลที่ไม่มีในข้อความ หากไม่ชัดเจนให้ใช้กลุ่ม ไม่ชัดเจน ส่งคืนอาร์เรย์ JSON เท่านั้น แต่ละรายการต้องมี row_number และ group ห้ามใส่คำอธิบายอื่น"],
  ["PRODUCT_BRIEF_PROMPT", "เขียนข้อกำหนดสินค้า 3 ส่วน: 1) ลูกค้า สถานการณ์ใช้งาน และปัญหาที่ต้องแก้ 2) โครงสร้างสินค้า ส่วนประกอบ ขนาด วัสดุ บรรจุภัณฑ์ และเกณฑ์ตรวจตัวอย่าง 3) ข้อจำกัดทางธุรกิจ ราคาเป้าหมาย ต้นทุนสูงสุด สิ่งที่ซัพพลายเออร์ห้ามเปลี่ยน และข้อความที่ห้ามกล่าวอ้าง หากข้อมูลส่วนใดไม่ชัดเจนให้เขียน ต้องยืนยัน ห้ามเลือกซัพพลายเออร์หรือแต่งข้อมูลรับรอง วัสดุ หรือคุณสมบัติที่ไม่มีในข้อมูล ส่งคืนข้อความล้วนภาษาไทย ไม่ใช้ Markdown หรือตาราง"],
  ["SAMPLE_CHECK_PROMPT", "อ่านข้อกำหนดสินค้าแล้วสร้างรายการตรวจตัวอย่าง แต่ละรายการหนึ่งบรรทัดในรูปแบบ รหัสเกณฑ์ | ชื่อเกณฑ์ | วิธีตรวจหรือวัด | เกณฑ์ยอมรับ ห้ามประเมินจากความรู้สึกหรือสรุปว่าล็อตผ่านหรือไม่ผ่าน ส่งคืนข้อความล้วนภาษาไทย ไม่ใช้ Markdown"],
  ["PRODUCT_EXTRACTION_PROMPT", "อ่านข้อกำหนดสินค้าแล้วส่งคืนออบเจ็กต์ JSON เดียวที่มีฟิลด์ product_name, components, dimensions, material, packaging, selling_price, landed_cost เท่านั้น selling_price และ landed_cost ต้องเป็นตัวเลขโดยไม่มีหน่วย ฟิลด์ที่ไม่มีหลักฐานหรือระบุว่าต้องยืนยันให้เป็นสตริงว่าง ห้ามคาดเดาและห้ามใส่ข้อความนอก JSON"],
  ["SALES_CONTENT_PROMPT", "ใช้เฉพาะข้อมูลในเอกสารที่ให้มา เขียนภาษาไทย 3 ส่วนคั่นด้วยบรรทัด --- ได้แก่ คำอธิบายสินค้าสำหรับหน้าขาย คำถามที่พบบ่อย และสคริปต์วิดีโอสั้นไม่เกิน 3 นาที ห้ามกล่าวอ้างคุณสมบัติที่ไม่มีหลักฐาน ตัวเลขทุกตัวต้องตรวจย้อนกลับได้ และห้ามใช้คำสุดโต่ง เช่น ดีที่สุด หรือ หนึ่งเดียว ส่งคืนข้อความล้วน ไม่ใช้ Markdown"],
  ["SUPPORT_CLASSIFICATION_PROMPT", "อ่านอีเมลลูกค้าแล้วส่งคืนออบเจ็กต์ JSON เดียวที่มี summary, request_group, priority, missing_info, reply_template, requires_human_approval เท่านั้น priority ต้องเป็น สูง กลาง หรือต่ำ และ requires_human_approval ต้องเป็น ใช่ หรือ ไม่ หากเป็นการคืนเงิน ยกเลิกคำสั่งซื้อ ร้องเรียนคุณภาพ ความปลอดภัย โฆษณาไม่ตรง หรือขอชดเชย ต้องเป็น ใช่ reply_template ต้องสุภาพและห้ามสัญญาค่าชดเชยหรือวันส่งที่ยังไม่ยืนยัน ห้ามใส่ข้อความนอก JSON"],
  ["QUOTE_EMAIL_TEMPLATE", "เรียนพันธมิตรซัพพลายเออร์ เราแนบข้อกำหนดสินค้าและขอใบเสนอราคา จำนวนสั่งซื้อขั้นต่ำ ระยะเวลาผลิต และเงื่อนไขการชำระเงิน"],
  ["WAREHOUSE_EMAIL_TEMPLATE", "เรียนทีมคลังสินค้า นี่คือรายการคำสั่งซื้อที่ต้องจัดส่ง โปรดตรวจรหัสสินค้าและรหัสล็อตก่อนแพ็กสินค้า"],
  ["INVENTORY_ALERT_EMAIL_TEMPLATE", "แจ้งเตือนสต็อก: สินค้าต่อไปนี้ถึงจุดสั่งซื้อใหม่แล้ว โปรดตรวจสอบแผนการสั่งผลิตล็อตถัดไป"]
];
var PRODUCT_CHECK_QUESTIONS = [
  "สินค้าขนส่งง่ายและมีความเสี่ยงเสียหายต่ำหรือไม่",
  "กำไรคงเหลือต่อคำสั่งซื้อเท่าใด",
  "จัดเก็บง่ายและมีอายุสินค้าเพียงพอหรือไม่",
  "อัตราคืนสินค้าที่คาดการณ์อยู่ในระดับยอมรับได้หรือไม่",
  "ซัพพลายเออร์รองรับจำนวนสั่งซื้อเริ่มต้นหรือไม่",
  "ต้องใช้ใบอนุญาต เอกสาร หรือข้อกำหนดทางกฎหมายใดบ้าง",
  "ข้อความขายสามารถตรวจสอบหลักฐานได้หรือไม่",
  "มีแหล่งสำรองเมื่อซัพพลายเออร์หลักมีปัญหาหรือไม่"
];
var UNIT_ECONOMICS_ITEMS = ["SELLING_PRICE", "LANDED_COST", "PACKAGING", "ค่าคลังและแพ็กสินค้า",
    "ค่าจัดส่ง", "PLATFORM_FEE", "PAYMENT_FEE", "SHIPPING_SUBSIDY", "สำรองคืนและยกเลิก",
    "ค่าโฆษณา", "ค่าใช้จ่ายอื่น"];
var VALIDATIONS = [
  ["ORDERS", "STATUS", ["รอยืนยัน", "พร้อมส่งคลัง", "ส่งคลังแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก", "คืนสินค้า", "กระทบยอดแล้ว"]],
  ["SUPPLIERS", "ROLE", ["หลัก", "สำรอง"]],
  ["SUPPLIERS", "SAMPLE_STATUS", ["รออนุมัติ", "อนุมัติ", "ปฏิเสธ"]],
  ["PRODUCTS", "SAMPLE_STATUS", ["รออนุมัติ", "อนุมัติ", "ปฏิเสธ"]],
  ["CONTENT", "STATUS", ["ร่างโดย AI", "รออนุมัติ", "อนุมัติ"]],
  ["RETURNS_CANCELS", "ROOT_CAUSE", ["สินค้า", "บรรจุภัณฑ์", "การจัดส่ง", "เนื้อหาโฆษณา", "ลูกค้าเปลี่ยนใจ", "อื่นๆ"]],
  ["RETURNS_CANCELS", "REQUIRES_HUMAN_APPROVAL", ["ใช่", "ไม่"]],
  ["RETURNS_CANCELS", "STATUS", ["รอดำเนินการ", "สร้างร่างแล้ว", "ตอบแล้ว", "ปิดแล้ว"]],
  ["RETURNS_CANCELS", "PRIORITY", ["สูง", "กลาง", "ต่ำ"]],
  ["ALERTS", "RESOLVED", ["ใช่", "ไม่"]]
];
var SYSTEM_PREFIX = "[WEUP SoloSix]";
var PENDING_LABEL = "WEUP-รอดำเนินการ";
var PROCESSED_LABEL = "WEUP-ดำเนินการแล้ว";
var FORMULA_ROW_COUNT = 60;
var ROOT_FOLDER_NAME = "WEUP_SOLOSIX_ECOMMERCE";
function onOpen() {
    SpreadsheetApp.getUi().createMenu("WEUP SoloSix")
        .addItem("ตั้งค่าระบบ", "setupSystem")
        .addItem("ซ่อมแซมการตั้งค่า", "repairConfig")
        .addItem("สร้างโครงสร้างโฟลเดอร์", "createFolderStructure")
        .addItem("ตรวจสอบโฟลเดอร์", "diagnoseFolders")
        .addItem("ตั้งค่าการทำงานอัตโนมัติ", "installTriggers")
        .addItem("ตรวจสอบการเชื่อมต่อ API", "testApiConnection")
        .addItem("เปิดแดชบอร์ด", "openDashboard")
        .addSeparator()
        .addItem("1. สร้างแบบฟอร์มเก็บข้อมูล", "step01CreateDemandForm")
        .addItem("2. นำเข้าข้อมูลความต้องการ", "step02ImportDemandData")
        .addItem("3. จัดกลุ่มความต้องการ", "step03GroupDemand")
        .addItem("4. สร้างข้อกำหนดสินค้า", "step04CreateProductBrief")
        .addItem("4B. สร้างข้อกำหนดเวอร์ชันใหม่", "step04bCreateNewProductBrief")
        .addItem("5. ส่งคำขอใบเสนอราคา", "step05SendQuoteRequests")
        .addItem("5B. เริ่มรอบขอราคาใหม่", "resetSupplierQuoteRound")
        .addItem("6. สร้างรายการตรวจตัวอย่าง", "step06CreateSampleChecklist")
        .addItem("7. สร้างเนื้อหาการขาย", "step07CreateSalesContent")
        .addSeparator()
        .addItem("8. นำเข้าคำสั่งซื้อ", "step08ImportOrders")
        .addItem("9. ตรวจสอบคำสั่งซื้อ", "step09ValidateOrders")
        .addItem("10. ส่งรายการไปคลังสินค้า", "step10SendToWarehouse")
        .addItem("11. ตรวจสอบการแจ้งเตือนสต็อก", "step11InventoryAlerts")
        .addItem("12. จำแนกอีเมลช่วยเหลือ", "step12ClassifySupportEmail")
        .addItem("13. สรุปคืนสินค้าและยกเลิก", "step13SummarizeReturns")
        .addItem("14. กระทบยอดประจำรอบ", "step14ReconcilePeriod")
        .addToUi();
}
function ui_() { return SpreadsheetApp.getUi(); }
var DASHBOARD_STATE = { capturing: false, messages: [] };
function notify_(td, nd) {
    if (DASHBOARD_STATE.capturing) {
        DASHBOARD_STATE.messages.push(td + ": " + nd);
        return;
    }
    try {
        ui_().alert(td, nd, ui_().ButtonSet.OK);
    }
    catch (e) {
        console.log(td + ": " + nd);
    }
}
function isAutomaticRun_() { try {
    SpreadsheetApp.getUi();
    return false;
}
catch (e) {
    return true;
} }
function today_() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}
function timestamp_() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HHmmss");
}
function getSheet_(name) {
    var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getSheetName_(name));
    if (!s)
        throw new Error("ไม่พบชีต " + getSheetName_(name) + " โปรดเรียกใช้เมนู ตั้งค่าระบบ ก่อน");
    return s;
}
function getColumns_(sheet) {
  var schema = COLUMNS[getSheetKey_(sheet.getName())] || [];
  return schema.slice();
}
function getColumnIndex(sheet, name) { return getColumns_(sheet).indexOf(name) + 1; }
function getFirstEmptyRow_(sheet) {
    var het = sheet.getMaxRows();
    var cot1 = sheet.getRange(1, 1, het, 1).getValues();
    for (var i = 1; i < cot1.length; i++) {
        if (String(cot1[i][0]).trim() === "")
            return i + 1;
    }
    return het + 1;
}
function readTable_(sheet) {
    var head = getColumns_(sheet);
    var lastRow = getFirstEmptyRow_(sheet) - 1;
    if (lastRow < 2)
        return { head: head, rows: [] };
    return { head: head, rows: sheet.getRange(2, 1, lastRow - 1, head.length).getValues() };
}
function appendRecord_(sheet, obj) {
    var head = getColumns_(sheet), row = [];
    for (var i = 0; i < head.length; i++) {
        row.push(obj.hasOwnProperty(head[i]) ? obj[head[i]] : "");
    }
    var r = getFirstEmptyRow_(sheet);
    if (r > sheet.getMaxRows() - 1)
        sheet.insertRowsAfter(sheet.getMaxRows(), 50);
    sheet.getRange(r, 1, 1, head.length).setValues([row]);
    SpreadsheetApp.flush();
    return r;
}
function getConfig(key) {
    var d = readTable_(getSheet_("CONFIG"));
    var cK = d.head.indexOf("KEY"), cG = d.head.indexOf("VALUE");
    if (cK === -1 || cG === -1)
        throw new Error("ชีตการตั้งค่าขาดคอลัมน์คีย์หรือค่า โปรดเรียกใช้เมนู ซ่อมแซมการตั้งค่า");
    for (var i = 0; i < d.rows.length; i++) {
        if (String(d.rows[i][cK]).trim() === key)
            return String(d.rows[i][cG]).trim();
    }
    return "";
}
function setConfig(key, value) {
    var s = getSheet_("CONFIG"), d = readTable_(s);
    var cK = d.head.indexOf("KEY"), cG = d.head.indexOf("VALUE");
    for (var i = 0; i < d.rows.length; i++) {
        if (String(d.rows[i][cK]).trim() === key) {
            s.getRange(i + 2, cG + 1).setValue(value);
            return true;
        }
    }
    return false;
}
function getNumericConfig_(key) {
    var v = String(getConfig(key)).replace(/[^0-9.\-]/g, "");
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}
function getFolder_(key, name) {
    var id = getConfig(key);
    if (!id) {
        throw new Error("ยังไม่ได้กำหนดค่า " + key +
            " โปรดเรียกใช้เมนู สร้างโครงสร้างโฟลเดอร์ เพื่อให้ระบบบันทึกรหัสโฟลเดอร์");
    }
    var f;
    try {
        f = DriveApp.getFolderById(id);
    }
    catch (e) {
        throw new Error("เปิดโฟลเดอร์จากค่า " + key + " ไม่สำเร็จ (" + id + ") " +
            "โฟลเดอร์อาจถูกลบหรือบัญชีนี้ไม่มีสิทธิ์เข้าถึง " +
            "โปรดล้างค่านี้แล้วเรียกใช้เมนู สร้างโครงสร้างโฟลเดอร์ อีกครั้ง");
    }
    if (f.isTrashed()) {
        throw new Error("โฟลเดอร์ " + name + " อยู่ในถังขยะ (ID " + id + ") " +
            "โปรดกู้คืนโฟลเดอร์หรือล้างค่า " + key +
            " แล้วเรียกใช้เมนู สร้างโครงสร้างโฟลเดอร์ อีกครั้ง");
    }
    return f;
}
function getFormulaSeparator_() {
    var p = PropertiesService.getDocumentProperties();
    var existing = p.getProperty("FORMULA_SEPARATOR");
    if (existing)
        return existing;
    var s = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var o = s.getRange(s.getMaxRows(), s.getMaxColumns());
    var cu = o.getFormula();
    o.setFormula("=IF(1=1,1,2)");
    SpreadsheetApp.flush();
    var separator = String(o.getDisplayValue()).indexOf("#ERROR") > -1 ? ";" : ",";
    if (cu)
        o.setFormula(cu);
    else
        o.clearContent();
    p.setProperty("FORMULA_SEPARATOR", separator);
    return separator;
}
function hash_(s) {
    var normalized = String(s).toLowerCase().replace(/[.,;:!?"'()\-]/g, "").replace(/\s+/g, " ").trim();
    return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, normalized)
        .map(function (b) { return ((b & 0xFF) + 0x100).toString(16).slice(1); }).join("");
}
function redactPersonalData_(s) {
    return String(s).replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
        .replace(/(?:\+66|0)\d{8,9}/g, "[phone]");
}
function stripMarkdown_(s) {
    return String(s).replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "").replace(/^\s*\|/gm, "");
}
function getField_(o, name) {
    if (!o || typeof o !== "object")
        return "";
    var normalized = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
    for (var k in o) {
        if (String(k).toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) {
            var v = o[k];
            if (v === null || v === undefined)
                return "";
            if (Array.isArray(v))
                return v.join("; ");
            if (typeof v === "object")
                return JSON.stringify(v);
            return String(v);
        }
    }
    return "";
}
function parseJson_(s) {
    var t = String(s).replace(/```json|```/g, "").trim();
    var iMoc = t.indexOf("{"), iVuong = t.indexOf("[");
    var moc, row;
    if (iMoc === -1 && iVuong === -1) {
        throw new Error("คำตอบจาก AI ไม่มีข้อมูล JSON: " + t.substring(0, 300));
    }
    if (iVuong === -1 || (iMoc > -1 && iMoc < iVuong)) {
        moc = "{";
        row = "}";
    }
    else {
        moc = "[";
        row = "]";
    }
    var d = t.indexOf(moc);
    var c = t.lastIndexOf(row);
    if (d === -1 || c === -1 || c < d) {
        throw new Error("คำตอบจาก AI ไม่มีข้อมูล JSON ที่สมบูรณ์: " + t.substring(0, 300));
    }
    try {
        return JSON.parse(t.substring(d, c + 1));
    }
    catch (e) {
        var sau = 0, insideString = false, thoat = false;
        for (var i = d; i < t.length; i++) {
            var ch = t.charAt(i);
            if (thoat) {
                thoat = false;
                continue;
            }
            if (ch === "\\") {
                thoat = true;
                continue;
            }
            if (ch === "\"") {
                insideString = !insideString;
                continue;
            }
            if (insideString)
                continue;
            if (ch === moc)
                sau++;
            else if (ch === row) {
                sau--;
                if (sau === 0)
                    return JSON.parse(t.substring(d, i + 1));
            }
        }
        throw new Error("อ่าน JSON ไม่สำเร็จ: " + e.message + " | " + t.substring(0, 300));
    }
}
function createId_(sheet, column, prefix) {
    var d = readTable_(sheet), i = d.head.indexOf(column), max = 0;
    d.rows.forEach(function (r) {
        var m = String(r[i]).match(/(\d+)$/);
        if (m)
            max = Math.max(max, parseInt(m[1], 10));
    });
    return prefix + ("000" + (max + 1)).slice(-4);
}
function sendOperationsNotice_(title, body, urgent) {
    var mail = getConfig("APPROVER_EMAIL") || getConfig("MANAGER_EMAIL");
    if (!mail) {
        console.error("ส่งการแจ้งเตือนไม่ได้: ยังไม่ได้กำหนด APPROVER_EMAIL หรือ MANAGER_EMAIL");
        return [];
    }
    try {
        MailApp.sendEmail(mail, SYSTEM_PREFIX + (urgent ? " [เร่งด่วน] " : " ") + title, body);
        return ["อีเมล"];
    }
    catch (e) {
        console.error("ส่งอีเมลแจ้งเตือนไม่สำเร็จ: " + e.message);
        return [];
    }
}
function setupSystem() {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), notices = [];
    SHEET_KEYS.forEach(function (name) {
        var sheet = ss.getSheetByName(getSheetName_(name));
        if (!sheet) {
            sheet = ss.insertSheet(getSheetName_(name));
            notices.push("สร้างชีต " + getSheetName_(name));
        }
        var column = COLUMNS[name];
        if (sheet.getMaxColumns() < column.length) {
            sheet.insertColumnsAfter(sheet.getMaxColumns(), column.length - sheet.getMaxColumns());
        }
        var ht = sheet.getRange(1, 1, 1, column.length).getValues()[0]
            .map(function (v) { return String(v).trim(); });
        var pendingItems = false;
        for (var i = 0; i < column.length; i++)
            if (ht[i] !== column[i])
                pendingItems = true;
        if (pendingItems) {
            sheet.getRange(1, 1, 1, column.length).setValues([column])
                .setFontWeight("bold").setBackground("#1e4620").setFontColor("#ffffff");
            sheet.setFrozenRows(1);
        }
        (TEXT_COLUMNS[name] || []).forEach(function (columnName) {
            var c = column.indexOf(columnName) + 1;
            if (c > 0)
                sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setNumberFormat("@");
        });
    });
    ["Sheet1", "ชีต1"].forEach(function (t) {
        var s = ss.getSheetByName(t);
        if (s && ss.getSheets().length > 1) {
            ss.deleteSheet(s);
            notices.push("ลบชีตเริ่มต้น " + t);
        }
    });
    [["จัดระเบียบการตั้งค่า", dedupeConfig_], ["เติมข้อมูลเริ่มต้น", seedDefaults_],
        ["ตั้งค่ารายการเลือก", applyValidations_], ["ตั้งค่าสูตรสต็อก", applyInventoryFormulas_],
        ["ป้องกันแถวหัวตาราง", protectHeaders_]].forEach(function (b) {
        try {
            notices = notices.concat(b[1]());
        }
        catch (e) {
            notices.push("เกิดข้อผิดพลาดในขั้นตอน " + b[0] + ": " + e.message);
            console.error(b[0] + ": " + e.message);
        }
    });
    notify_("ตั้งค่าระบบ", notices.length ? notices.join("\n") : "ระบบพร้อมใช้งาน ไม่มีรายการที่ต้องแก้ไข");
}
function dedupeConfig_() {
    var s = getSheet_("CONFIG"), notices = [];
    var d = readTable_(s), existingByKey = {}, trung = 0;
    d.rows.forEach(function (r) {
        var k = String(r[0]).trim();
        if (!k)
            return;
        var v = String(r[1]).trim();
        if (!existingByKey.hasOwnProperty(k) || (!existingByKey[k] && v)) {
            if (existingByKey.hasOwnProperty(k))
                trung++;
            existingByKey[k] = v;
        }
        else {
            trung++;
        }
    });
    var rows = DEFAULT_CONFIG.map(function (k) {
        return [k[0], existingByKey.hasOwnProperty(k[0]) ? existingByKey[k[0]] : k[1], k[2]];
    });
    Object.keys(existingByKey).forEach(function (k) {
        var exists = DEFAULT_CONFIG.some(function (x) { return x[0] === k; });
        if (!exists)
            rows.push([k, existingByKey[k], "รายการที่ผู้ใช้เพิ่มเอง"]);
    });
    if (s.getMaxRows() < rows.length + 1) {
        s.insertRowsAfter(s.getMaxRows(), rows.length + 1 - s.getMaxRows());
    }
    s.getRange(2, 1, s.getMaxRows() - 1, 3).clearContent();
    s.getRange(2, 1, rows.length, 3).setValues(rows);
    if (s.getMaxColumns() > 3)
        s.getRange(1, 4, s.getMaxRows(), s.getMaxColumns() - 3).clearContent();
    notices.push("จัดระเบียบการตั้งค่า " + rows.length + " รายการ" + (trung ? " และลบรายการซ้ำ " + trung + " รายการ" : ""));
    return notices;
}
function seedDefaults_() {
    var notices = [];
    var sK = getSheet_("PRODUCT_CHECK");
    if (getFirstEmptyRow_(sK) < 3) {
        sK.getRange(2, 1, PRODUCT_CHECK_QUESTIONS.length, 1)
            .setValues(PRODUCT_CHECK_QUESTIONS.map(function (c) { return [c]; }));
        notices.push("เพิ่มคำถามตรวจสอบสินค้า " + PRODUCT_CHECK_QUESTIONS.length + " ข้อ");
    }
    var sL = getSheet_("UNIT_ECONOMICS");
    if (getFirstEmptyRow_(sL) < 3) {
        var d = getFormulaSeparator_();
        var rows = UNIT_ECONOMICS_ITEMS.map(function (k) { return [k, "", "", "", ""]; });
        sL.getRange(2, 1, rows.length, 5).setValues(rows);
        var lastDataRow = 1 + rows.length, dTong = lastDataRow + 1;
        sL.getRange(dTong, 1).setValue("ต้นทุนผันแปรรวม");
        sL.getRange(dTong, 2).setFormula("=SUM(B3:B" + lastDataRow + ")");
        sL.getRange(dTong, 3).setFormula("=SUM(C3:C" + lastDataRow + ")");
        sL.getRange(dTong + 1, 1).setValue("กำไรก่อนภาษี");
        sL.getRange(dTong + 1, 2).setFormula("=IF(B2=\"\"" + d + "\"\"" + d + "B2-B" + dTong + ")");
        sL.getRange(dTong + 1, 3).setFormula("=IF(C2=\"\"" + d + "\"\"" + d + "C2-C" + dTong + ")");
        notices.push("เพิ่มรายการต้นทุนและสูตรคำนวณกำไร");
    }
    return notices;
}
function applyValidations_() {
    var xong = 0, hong = [];
    VALIDATIONS.forEach(function (dd) {
        try {
            var sheet = getSheet_(dd[0]), c = getColumnIndex(sheet, dd[1]);
            if (c < 1)
                return;
            var qt = SpreadsheetApp.newDataValidation().requireValueInList(dd[2], true)
                .setAllowInvalid(false).build();
            sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setDataValidation(qt);
            xong++;
        }
        catch (e) {
            hong.push(dd[0] + "." + dd[1]);
            console.error("ตั้งค่ารายการเลือกไม่สำเร็จ " + dd[0] + "." + dd[1] + ": " + e.message);
        }
    });
    var notices = ["ตั้งค่ารายการเลือกแล้ว " + xong + "/" + VALIDATIONS.length + " คอลัมน์"];
    if (hong.length) {
        notices.push("ตั้งค่าไม่สำเร็จสำหรับ " + hong.join(", ") +
            " โปรดตรวจว่าชีตและหัวคอลัมน์ตรงกับแม่แบบ แล้วเรียกใช้ ตั้งค่าระบบ อีกครั้ง");
    }
    return notices;
}
function inventoryFormula_(r) {
    var d = getFormulaSeparator_(), s = getSheet_("INVENTORY");
    var K = function (n) { return String.fromCharCode(64 + n); };
    var Ma = K(getColumnIndex(s, "PRODUCT_CODE")) + r;
    var Co = K(getColumnIndex(s, "AVAILABLE_STOCK")) + r;
    var Tb = K(getColumnIndex(s, "AVERAGE_DAILY_SALES")) + r;
    var configSheet = "'" + getSheetName_("CONFIG").replace(/'/g, "''") + "'";
    var productSheet = "'" + getSheetName_("PRODUCTS").replace(/'/g, "''") + "'";
    return {
        days: "=IF(OR(" + Tb + "=\"\"" + d + Tb + "=0)" + d + "\"\"" + d + Co + "/" + Tb + ")",
        diem: "=IF(" + Tb + "=\"\"" + d + "\"\"" + d + Tb +
            "*IFERROR(VALUE(VLOOKUP(\"PRODUCTION_LEAD_DAYS\"" + d + configSheet + "!A:B" + d + "2" + d +
            "FALSE))" + d + "0)+IFERROR(VALUE(VLOOKUP(\"SAFETY_STOCK\"" + d + configSheet + "!A:B" + d + "2" + d +
            "FALSE))" + d + "0))",
        amountByOrder: "=IF(" + Ma + "=\"\"" + d + "\"\"" + d + Co +
            "*IFERROR(VLOOKUP(" + Ma + d + productSheet + "!A:I" + d + "9" + d + "FALSE)" + d + "0))"
    };
}
function applyInventoryFormulas_() {
    var s = getSheet_("INVENTORY");
    var cNg = getColumnIndex(s, "DAYS_OF_STOCK"), cDi = getColumnIndex(s, "REORDER_POINT"), cTi = getColumnIndex(s, "INVENTORY_VALUE");
    for (var r = 2; r <= FORMULA_ROW_COUNT; r++) {
        var ct = inventoryFormula_(r);
        s.getRange(r, cNg).setFormula(ct.days);
        s.getRange(r, cDi).setFormula(ct.diem);
        s.getRange(r, cTi).setFormula(ct.amountByOrder);
    }
    return ["เพิ่มสูตรคำนวณจำนวนวันคงเหลือ จุดสั่งซื้อใหม่ และมูลค่าสต็อกแล้ว"];
}
function protectHeaders_() {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), me = Session.getEffectiveUser(), countMatching = 0;
    SHEET_KEYS.forEach(function (name) {
        var s = ss.getSheetByName(getSheetName_(name));
        if (!s)
            return;
        s.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
            if (p.getDescription() === "WEUP_HEADER_PROTECTION")
                p.remove();
        });
        try {
            var p = s.getRange(1, 1, 1, s.getMaxColumns()).protect();
            p.setDescription("WEUP_HEADER_PROTECTION");
            p.addEditor(me);
            p.removeEditors(p.getEditors().filter(function (u) { return u.getEmail() !== me.getEmail(); }));
            countMatching++;
        }
        catch (e) {
            console.error("ป้องกันหัวตารางของชีต " + getSheetName_(name) + " ไม่สำเร็จ: " + e.message);
        }
    });
    return ["ป้องกันหัวตารางแล้ว " + countMatching + "/" + SHEET_KEYS.length + " ชีต"];
}
function repairConfig() {
    var s = getSheet_("CONFIG"), notices = [];
    var n = Math.max(s.getMaxColumns(), 3);
    var td = s.getRange(1, 1, 1, n).getValues()[0].map(function (v) { return String(v).trim(); });
    var normalized = ["KEY", "VALUE", "NOTES"];
    for (var i = 0; i < 3; i++) {
        if (td[i] !== normalized[i]) {
            s.getRange(1, i + 1).setValue(normalized[i]);
            notices.push("ซ่อมหัวคอลัมน์ที่ " + (i + 1));
        }
    }
    if (n > 3) {
        s.getRange(1, 4, 1, n - 3).clearContent();
    }
    notices = notices.concat(dedupeConfig_());
    notify_("ซ่อมแซมการตั้งค่า", notices.join("\n"));
}
function countFiles_(f) {
    var it = f.getFiles(), n = 0;
    while (it.hasNext()) {
        it.next();
        n++;
    }
    return n;
}
function getUsableChildFolders_(cha, name) {
    var it = cha.getFoldersByName(name), ds = [];
    while (it.hasNext()) {
        var f = it.next();
        if (!f.isTrashed())
            ds.push(f);
    }
    return ds;
}
function findUsableFoldersInDrive_(name) {
    var it = DriveApp.getFoldersByName(name), ds = [];
    while (it.hasNext()) {
        var f = it.next();
        if (!f.isTrashed())
            ds.push(f);
    }
    return ds;
}
function createFolderStructure() {
    var notices = [];
    var goc, dsGoc = getUsableChildFolders_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
    if (dsGoc.length) {
        goc = dsGoc[0];
        notices.push("ใช้โฟลเดอร์หลักเดิม " + ROOT_FOLDER_NAME);
        if (dsGoc.length > 1) {
            notices.push("คำเตือน: พบโฟลเดอร์หลักชื่อเดียวกัน " + dsGoc.length + " โฟลเดอร์ ระบบจะใช้โฟลเดอร์แรก");
        }
    }
    else {
        goc = DriveApp.getRootFolder().createFolder(ROOT_FOLDER_NAME);
        notices.push("สร้างโฟลเดอร์หลักใหม่ " + ROOT_FOLDER_NAME);
    }
    setConfig("ROOT_FOLDER_ID", goc.getId());
    var pendingItems = [["DATA_INBOX", "DATA_INBOX_FOLDER_ID"],
        ["ORDER_INBOX", "ORDER_INBOX_FOLDER_ID"],
        ["SUPPLIER_FILES", "SUPPLIER_FILES_FOLDER_ID"]];
    pendingItems.forEach(function (d) {
        var name = d[0], f;
        notices.push("");
        notices.push("--- " + name + " ---");
        var insideRoot = getUsableChildFolders_(goc, name);
        if (insideRoot.length) {
            f = insideRoot[0];
            notices.push("ใช้โฟลเดอร์เดิมภายใน " + ROOT_FOLDER_NAME +
                " (มี " + countFiles_(f) + " ไฟล์)");
            if (insideRoot.length > 1) {
                notices.push("คำเตือน: พบโฟลเดอร์ชื่อนี้ซ้ำ " + insideRoot.length + " โฟลเดอร์ภายในโฟลเดอร์หลัก");
            }
        }
        else {
            var ngoai = findUsableFoldersInDrive_(name);
            if (ngoai.length === 1) {
                f = ngoai[0];
                try {
                    f.moveTo(goc);
                    notices.push("ย้ายโฟลเดอร์เดิมเข้า " + ROOT_FOLDER_NAME +
                        " (คงไว้ทั้งหมด " + countFiles_(f) + " ไฟล์)");
                }
                catch (e) {
                    notices.push("ใช้โฟลเดอร์เดิมในตำแหน่งปัจจุบัน เพราะย้ายไม่สำเร็จ: " + e.message);
                }
            }
            else if (ngoai.length > 1) {
                f = goc.createFolder(name);
                notices.push("สร้างโฟลเดอร์ใหม่ เพราะพบโฟลเดอร์ชื่อนี้ " + ngoai.length +
                    " แห่งในไดรฟ์และไม่สามารถเลือกแทนผู้ใช้ได้");
                notices.push("โฟลเดอร์เดิมที่พบ:");
                ngoai.forEach(function (g, k) {
                    notices.push("  " + (k + 1) + ". " + countFiles_(g) + " ไฟล์ — " + g.getUrl());
                });
                notices.push("โปรดตรวจสอบและย้ายไฟล์ที่ต้องการมาไว้ในโฟลเดอร์ใหม่");
            }
            else {
                f = goc.createFolder(name);
                notices.push("สร้างโฟลเดอร์ใหม่");
            }
        }
        setConfig(d[1], f.getId());
        notices.push("บันทึกค่า " + d[1] + ": " + f.getId());
        notices.push("ลิงก์: " + f.getUrl());
    });
    notices.push("");
    notices.push("โฟลเดอร์หลัก: " + goc.getUrl());
    notify_("สร้างโครงสร้างโฟลเดอร์", notices.join("\n"));
}
function diagnoseFolders() {
    var pendingItems = [["WEUP_SOLOSIX_ECOMMERCE", "ROOT_FOLDER_ID"],
        ["DATA_INBOX", "DATA_INBOX_FOLDER_ID"],
        ["ORDER_INBOX", "ORDER_INBOX_FOLDER_ID"],
        ["SUPPLIER_FILES", "SUPPLIER_FILES_FOLDER_ID"]];
    var notices = [], needsUpdate = 0;
    pendingItems.forEach(function (d) {
        notices.push("--- " + d[0] + " ---");
        var id = getConfig(d[1]);
        if (!id) {
            notices.push("ยังไม่มีค่า " + d[1] + " โปรดเรียกใช้เมนู สร้างโครงสร้างโฟลเดอร์");
            needsUpdate++;
        }
        else {
            try {
                var f = DriveApp.getFolderById(id);
                notices.push("ID       : " + id);
                notices.push("ชื่อจริง  : " + f.getName());
                notices.push("ถังขยะ    : " + (f.isTrashed() ? "ใช่ — ต้องแก้ไข" : "ไม่"));
                notices.push("จำนวนไฟล์: " + countFiles_(f));
                notices.push("ลิงก์     : " + f.getUrl());
                if (f.isTrashed())
                    needsUpdate++;
                if (f.getName() !== d[0]) {
                    notices.push("คำเตือน: ชื่อโฟลเดอร์ไม่ตรงกับชื่อที่คาดไว้");
                    needsUpdate++;
                }
            }
            catch (e) {
                notices.push("เปิดโฟลเดอร์จาก ID ไม่สำเร็จ: " + e.message);
                needsUpdate++;
            }
        }
        var trung = findUsableFoldersInDrive_(d[0]);
        notices.push("จำนวนโฟลเดอร์ชื่อนี้ในไดรฟ์: " + trung.length +
            (trung.length > 1 ? " — ควรรวมและลบรายการซ้ำ" : ""));
        notices.push("");
    });
    notices.push(needsUpdate ? "สรุป: พบ " + needsUpdate + " จุดที่ต้องแก้ไข " +
        "ให้เรียกใช้เมนู สร้างโครงสร้างโฟลเดอร์ อีกครั้ง"
        : "สรุป: โครงสร้างโฟลเดอร์ถูกต้อง ไม่ต้องแก้ไข");
    notify_("ตรวจสอบโฟลเดอร์", notices.join("\n"));
}
function installTriggers() {
    ScriptApp.getProjectTriggers().forEach(function (t) {
        if (t.getHandlerFunction() !== "handleFormSubmit")
            ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger("step02ImportDemandData").timeBased().everyHours(1).create();
    ScriptApp.newTrigger("step08ImportOrders").timeBased().everyHours(1).create();
    ScriptApp.newTrigger("step11InventoryAlerts").timeBased().everyDays(1).atHour(7).create();
    ScriptApp.newTrigger("step12ClassifySupportEmail").timeBased().everyHours(1).create();
    ScriptApp.newTrigger("step13SummarizeReturns").timeBased()
        .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(16).create();
    ScriptApp.newTrigger("sendDailySummary").timeBased().everyDays(1).atHour(18).create();
    [PENDING_LABEL, PROCESSED_LABEL].forEach(function (n) {
        if (!GmailApp.getUserLabelByName(n))
            GmailApp.createLabel(n);
    });
    notify_("ตั้งค่าการทำงานอัตโนมัติ", "สร้างทริกเกอร์ตามเวลา 6 รายการและป้ายกำกับ Gmail 2 รายการแล้ว\n" +
        "โปรดสร้างตัวกรอง Gmail ด้วยตนเองเพื่อเพิ่มป้ายกำกับ " + PENDING_LABEL + " ให้กับอีเมลช่วยเหลือที่ต้องประมวลผล\n" +
        "ควรยกเว้นอีเมลที่มีหัวเรื่องขึ้นต้นด้วย \"" + SYSTEM_PREFIX + "\" เพื่อป้องกันระบบประมวลผลอีเมลแจ้งเตือนของตัวเอง");
}
function callAi(systemPrompt, contentText) {
    var key = String(PropertiesService.getScriptProperties()
        .getProperty("API_KEY") || "").trim();
    if (!key)
        throw new Error("โปรดกำหนด API_KEY ใน Script Properties ของโปรเจกต์");
    var ncc = getConfig("AI_PROVIDER").toUpperCase();
    var model = getConfig("AI_MODEL");
    var tok = parseInt(getConfig("MAX_TOKENS"), 10);
    if (isNaN(tok) || tok < 4000)
        tok = 4000;
    if (!ncc)
        throw new Error("ยังไม่ได้กำหนด AI_PROVIDER โปรดกรอก OPENAI หรือ ANTHROPIC ในชีตการตั้งค่า");
    if (!model)
        throw new Error("ยังไม่ได้กำหนด AI_MODEL ในชีตการตั้งค่า");
    var url, opt;
    if (ncc === "OPENAI") {
        url = "https://api.openai.com/v1/responses";
        opt = { method: "post", contentType: "application/json",
            headers: { "Authorization": "Bearer " + key }, muteHttpExceptions: true,
            payload: JSON.stringify({ model: model, instructions: systemPrompt, input: contentText,
                max_output_tokens: tok }) };
    }
    else if (ncc === "ANTHROPIC") {
        url = "https://api.anthropic.com/v1/messages";
        opt = { method: "post", contentType: "application/json",
            headers: { "x-api-key": key, "anthropic-version": "2023-06-01" }, muteHttpExceptions: true,
            payload: JSON.stringify({ model: model, max_tokens: tok, system: systemPrompt,
                messages: [{ role: "user", content: contentText }] }) };
    }
    else {
        throw new Error("AI_PROVIDER ต้องเป็น OPENAI หรือ ANTHROPIC แต่พบค่า: " + ncc);
    }
    var res = UrlFetchApp.fetch(url, opt);
    var code = res.getResponseCode(), tho = res.getContentText();
    if (code !== 200) {
        throw new Error("API ตอบกลับด้วยรหัส " + code + "\nเซิร์ฟเวอร์: " + url + "\nโมเดล: " + model +
            "\nรายละเอียด: " + tho.substring(0, 400));
    }
    return { text: getAiText_(JSON.parse(tho), ncc), tho: tho };
}
function getAiText_(data, ncc) {
    var ket = [];
    if (ncc === "OPENAI") {
        if (data.output_text)
            return String(data.output_text);
        (data.output || []).forEach(function (o) {
            (o.content || []).forEach(function (c) { if (c.text)
                ket.push(c.text); });
        });
    }
    else {
        (data.content || []).forEach(function (c) { if (c.type === "text" && c.text)
            ket.push(c.text); });
    }
    return ket.join("\n");
}
function testApiConnection() {
    try {
        var kq = callAi("ตอบกลับเป็นภาษาไทยสั้นๆ เท่านั้น", "ตอบข้อความว่า: เชื่อมต่อสำเร็จ");
        notify_("การเชื่อมต่อ API ใช้งานได้", "ผู้จัดหา:" + getConfig("AI_PROVIDER") +
            "\nโมเดล: " + getConfig("AI_MODEL") +
            "\nคำตอบทดสอบ: " + kq.text);
    }
    catch (e) {
        notify_("การเชื่อมต่อ API ไม่ทำงาน", String(e.message));
    }
}
function step01CreateDemandForm() {
    var existingByKey = getConfig("DEMAND_FORM_URL");
    if (existingByKey) {
        notify_("มีแบบฟอร์มอยู่แล้ว", "พบลิงก์ในค่า DEMAND_FORM_URL: " + existingByKey +
            "\nระบบจะไม่สร้างแบบฟอร์มซ้ำ หากต้องการสร้างใหม่ให้ล้างค่านี้ก่อน");
        return;
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var previousValue = ss.getSheets().map(function (s) { return s.getName(); });
    var th = getConfig("BRAND_NAME") || "สินค้า";
    var form = FormApp.create(th + " — แบบสำรวจความต้องการ");
    form.setDescription("แบบสำรวจเพื่อทำความเข้าใจปัญหา วิธีแก้ปัจจุบัน และงบประมาณของลูกค้า");
    form.addParagraphTextItem().setTitle("ปัญหาที่สำคัญที่สุดในงานของคุณคืออะไร?").setRequired(true);
    form.addParagraphTextItem().setTitle("ปัจจุบันคุณแก้ปัญหานี้อย่างไร?").setRequired(true);
    form.addParagraphTextItem().setTitle("วิธีแก้ปัจจุบันยังมีข้อจำกัดอะไร?").setRequired(true);
    form.addTextItem().setTitle("คุณยินดีจ่ายเท่าใดเพื่อแก้ปัญหานี้?");
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    SpreadsheetApp.flush();
    var newValue = ss.getSheets().filter(function (s) { return previousValue.indexOf(s.getName()) === -1; });
    if (newValue.length)
        newValue[0].setName("RAW_DEMAND");
    setConfig("DEMAND_FORM_URL", form.getPublishedUrl());
    ScriptApp.getProjectTriggers().forEach(function (t) {
        if (t.getHandlerFunction() === "handleFormSubmit")
            ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger("handleFormSubmit").forSpreadsheet(ss).onFormSubmit().create();
    notify_("สร้างแบบฟอร์มแล้ว", "สร้างแบบฟอร์มและเชื่อมกับสเปรดชีตเรียบร้อย\n" +
        "ระบบบันทึกคำตอบใหม่ลงในชีตข้อมูลดิบโดยอัตโนมัติ");
}
function handleFormSubmit(e) {
    try {
        if (!e || !e.values)
            return;
        var text = [e.values[1], e.values[2], e.values[3]].filter(String).join(" | ");
        if (!text)
            return;
        appendRecord_(getSheet_("RAW_DATA"), {
            COLLECTED_DATE: today_(), SOURCE: "แบบฟอร์ม", SOURCE_TYPE: "FORM",
            RAW_TEXT: text, DUPLICATE_HASH: hash_(text)
        });
    }
    catch (err) {
        console.error(err);
    }
}
function step02ImportDemandData() {
    var automaticRun = isAutomaticRun_(), sheet, folder;
    try {
        sheet = getSheet_("RAW_DATA");
        folder = getFolder_("DATA_INBOX_FOLDER_ID", "DATA_INBOX");
    }
    catch (e) {
        if (!automaticRun)
            notify_("ข้อผิดพลาด", e.message);
        else
            console.error(e.message);
        return;
    }
    var d = readTable_(sheet), cTrung = d.head.indexOf("DUPLICATE_HASH"), existingByKey = {};
    d.rows.forEach(function (r) { if (r[cTrung])
        existingByKey[String(r[cTrung])] = true; });
    var files = folder.getFiles(), fileCount = 0, rowCount = 0;
    while (files.hasNext()) {
        var f = files.next(), name = f.getName();
        if (name.indexOf("IMPORTED_") === 0)
            continue;
        if (name.toLowerCase().indexOf(".csv") === -1)
            continue;
        var rows;
        try {
            rows = Utilities.parseCsv(f.getBlob().getDataAsString());
        }
        catch (err) {
            continue;
        }
        if (rows.length < 2) {
            f.setName("IMPORTED_" + name);
            fileCount++;
            continue;
        }
        var head = rows[0].map(normalizeHeader_);
        var iCau = head.indexOf("RAW_TEXT");
        if (iCau === -1)
            iCau = head.indexOf("CONTENT_TEXT");
        if (iCau === -1)
            iCau = 0;
        for (var i = 1; i < rows.length; i++) {
            var text = String(rows[i][iCau] || "").trim();
            if (!text)
                continue;
            var h = hash_(text);
            if (existingByKey[h])
                continue;
            existingByKey[h] = true;
            var obj = { COLLECTED_DATE: today_(), SOURCE: name, SOURCE_TYPE: "CSV",
                RAW_TEXT: text, DUPLICATE_HASH: h };
            head.forEach(function (hd, j) {
                if (COLUMNS.RAW_DATA.indexOf(hd) > -1 && !obj[hd] && rows[i][j])
                    obj[hd] = rows[i][j];
            });
            appendRecord_(sheet, obj);
            rowCount++;
        }
        f.setName("IMPORTED_" + name);
        fileCount++;
    }
    if (!automaticRun)
        notify_("นำเข้าข้อมูลความต้องการ", "ประมวลผล " + fileCount + " ไฟล์ และเพิ่มข้อมูลใหม่ " + rowCount + " แถว");
}
function step03GroupDemand() {
    var sheet = getSheet_("RAW_DATA");
    var cVan = getColumnIndex(sheet, "RAW_TEXT"), groupColumn = getColumnIndex(sheet, "AI_GROUP");
    var d = readTable_(sheet);
    if (!d.rows.length) {
        notify_("จัดกลุ่มความต้องการ", "ยังไม่มีข้อมูลให้จัดกลุ่ม");
        return;
    }
    var lo = parseInt(getConfig("CLASSIFICATION_BATCH_SIZE"), 10) || 40;
    var pendingItems = [];
    d.rows.forEach(function (r, i) {
        var textValue = String(r[cVan - 1]).trim();
        if (textValue && !String(r[groupColumn - 1]).trim())
            pendingItems.push({ row_number: i + 2, text: redactPersonalData_(textValue) });
    });
    if (!pendingItems.length) {
        notify_("จัดกลุ่มความต้องการ", "ไม่มีแถวใหม่ที่รอการจัดกลุ่ม");
        return;
    }
    var xong = 0;
    for (var b = 0; b < pendingItems.length; b += lo) {
        var batch = pendingItems.slice(b, b + lo);
        try {
            var kq = callAi(getConfig("DEMAND_GROUPING_PROMPT"), JSON.stringify(batch));
            parseJson_(kq.text).forEach(function (o) {
                if (o.row_number && o.group) {
                    sheet.getRange(o.row_number, groupColumn).setValue(o.group);
                    xong++;
                }
            });
        }
        catch (e) {
            notify_("จัดกลุ่มไม่สำเร็จ เริ่มที่แถว " + batch[0].row_number, String(e.message) + "\nจัดกลุ่มสำเร็จแล้ว " + xong + " แถวก่อนเกิดข้อผิดพลาด");
            return;
        }
    }
    notify_("จัดกลุ่มความต้องการ", "จัดกลุ่มแล้ว " + xong + " แถว\n" +
        "โปรดตรวจสอบและกรอกคอลัมน์ กลุ่มที่อนุมัติ ก่อนทำขั้นตอนที่ 4");
}
function step04CreateProductBrief() {
    var sN = getSheet_("CONTENT");
    var dn = readTable_(sN), iLoai = dn.head.indexOf("TYPE"), iPb = dn.head.indexOf("VERSION");
    var existingByKey = dn.rows.filter(function (r) { return String(r[iLoai]).trim() === "ข้อกำหนดสินค้า"; });
    if (existingByKey.length) {
        var ds = existingByKey.map(function (r) { return String(r[iPb] || "v?"); }).join(", ");
        notify_("มีข้อกำหนดสินค้าอยู่แล้ว", "พบเนื้อหาประเภท ข้อกำหนดสินค้า " + existingByKey.length + " รายการ (" + ds + ")\n" +
            "ขั้นตอนที่ 4 จะไม่เรียก API ซ้ำ หากต้องการสร้างเวอร์ชันใหม่ให้ใช้เมนู 4B");
        return;
    }
    createProductBrief_("v1.0");
}
function step04bCreateNewProductBrief() {
    createProductBrief_(nextVersion_());
}
function nextVersion_() {
    var sN = getSheet_("CONTENT"), d = readTable_(sN);
    var iLoai = d.head.indexOf("TYPE"), iPb = d.head.indexOf("VERSION"), max = 0;
    d.rows.forEach(function (r) {
        if (String(r[iLoai]).trim() !== "ข้อกำหนดสินค้า")
            return;
        var m = String(r[iPb]).match(/v(\d+)/i);
        if (m)
            max = Math.max(max, parseInt(m[1], 10));
    });
    return "v" + (max + 1) + ".0";
}
function createProductBrief_(version) {
    var sD = getSheet_("RAW_DATA"), sN = getSheet_("CONTENT");
    var d = readTable_(sD);
    var iVan = d.head.indexOf("RAW_TEXT"), iDuyet = d.head.indexOf("APPROVED_GROUP");
    var lieu = d.rows.filter(function (r) { return String(r[iDuyet]).trim(); })
        .map(function (r) { return String(r[iDuyet]).trim() + ": " + r[iVan]; });
    if (!lieu.length) {
        notify_("ยังสร้างข้อกำหนดสินค้าไม่ได้", "ยังไม่มีข้อมูลดิบที่กรอกคอลัมน์ กลุ่มที่อนุมัติ");
        return;
    }
    var context = "ชื่อแบรนด์: " + getConfig("BRAND_NAME") +
        "\nรหัสสินค้าหลัก: " + getConfig("PRIMARY_PRODUCT_CODE") +
        "\nราคาเป้าหมาย: " + getConfig("SELLING_PRICE") +
        "\nข้อมูลความต้องการที่อนุมัติแล้ว:\n" + lieu.slice(0, 150).join("\n");
    try {
        var kq = callAi(getConfig("PRODUCT_BRIEF_PROMPT"), context);
        appendRecord_(sN, {
            CONTENT_CODE: createId_(sN, "CONTENT_CODE", "ND-"),
            PRODUCT_CODE: getConfig("PRIMARY_PRODUCT_CODE"), TYPE: "ข้อกำหนดสินค้า",
            TITLE: "ข้อกำหนดสินค้า " + version, CONTENT_TEXT: stripMarkdown_(kq.text),
            SOURCE_LINK: "ข้อมูลดิบ: " + lieu.length + " รายการที่อนุมัติ",
            STATUS: "ร่างโดย AI", VERSION: version
        });
        notify_("สร้างข้อกำหนดสินค้าแล้ว", "เพิ่มข้อกำหนดสินค้าเวอร์ชัน " + version + " ในชีตเนื้อหา\n" +
            "โปรดตรวจสอบ แก้ไขข้อมูลที่ระบุว่าต้องยืนยัน แล้วเปลี่ยนสถานะเป็น อนุมัติ\n" +
            "ขั้นตอนที่ 5 จะใช้เฉพาะข้อกำหนดสินค้าล่าสุดที่มีสถานะ อนุมัติ");
    }
    catch (e) {
        notify_("ข้อผิดพลาด", String(e.message));
    }
}
function step05SendQuoteRequests() {
    var sN = getSheet_("CONTENT"), sC = getSheet_("SUPPLIERS");
    var dn = readTable_(sN);
    var iLoai = dn.head.indexOf("TYPE"), iTt = dn.head.indexOf("STATUS");
    var iNd = dn.head.indexOf("CONTENT_TEXT"), iMa = dn.head.indexOf("CONTENT_CODE");
    var iPb = dn.head.indexOf("VERSION"), iLink = dn.head.indexOf("LINK");
    var source = null, sourceRow = 0;
    dn.rows.forEach(function (r, k) {
        if (String(r[iLoai]).trim() === "ข้อกำหนดสินค้า" && String(r[iTt]).trim() === "อนุมัติ") {
            source = r;
            sourceRow = k + 2;
        }
    });
    if (!source) {
        notify_("ยังส่งคำขอใบเสนอราคาไม่ได้", "ยังไม่มีข้อกำหนดสินค้าที่อนุมัติแล้ว " +
            "โปรดเปิดชีตเนื้อหา ตรวจสอบรายการประเภท ข้อกำหนดสินค้า แล้วเปลี่ยนสถานะเป็น อนุมัติ");
        return;
    }
    var tep;
    try {
        tep = createProductBriefPdf_(String(source[iNd]), String(source[iMa]), String(source[iPb] || "v1.0"));
    }
    catch (e) {
        notify_("ไม่สามารถสร้าง PDF ได้", String(e.message));
        return;
    }
    sN.getRange(sourceRow, iLink + 1).setValue(tep.getUrl());
    var dc = readTable_(sC);
    var iEmail = dc.head.indexOf("EMAIL"), iDaGui = dc.head.indexOf("QUOTE_REQUEST_SENT");
    var iTen = dc.head.indexOf("NAME"), iHm = dc.head.indexOf("CATEGORY");
    var sentColumn = iDaGui + 1, dateColumn = getColumnIndex(sC, "SENT_DATE");
    var gui = 0, missingEmails = 0, alreadySent = 0, errors = [];
    for (var k = 0; k < dc.rows.length; k++) {
        var email = String(dc.rows[k][iEmail]).trim();
        if (!email || email.indexOf("@") === -1) {
            missingEmails++;
            continue;
        }
        if (String(dc.rows[k][iDaGui]).trim()) {
            alreadySent++;
            continue;
        }
        try {
            MailApp.sendEmail({
                to: email,
                subject: "[" + getConfig("BRAND_NAME") + "] ขอใบเสนอราคา — " +
                    getConfig("PRIMARY_PRODUCT_CODE"),
                body: "เรียน " + (dc.rows[k][iTen] || "ฝ่ายที่เกี่ยวข้อง") + ",\n\n" +
                    getConfig("QUOTE_EMAIL_TEMPLATE") + "\n\n" +
                    "หมวดหมู่: " + (dc.rows[k][iHm] || "") + "\n" +
                    "รหัสสินค้า: " + getConfig("PRIMARY_PRODUCT_CODE") + "\n\n" +
                    "ขอแสดงความนับถือ,\n" + getConfig("BRAND_NAME"),
                attachments: [tep.getAs(MimeType.PDF)]
            });
            sC.getRange(k + 2, sentColumn).setValue("ใช่");
            sC.getRange(k + 2, dateColumn).setValue(today_());
            gui++;
        }
        catch (e) {
            errors.push(email + ": " + e.message);
        }
    }
    var messages = "สร้าง PDF ใหม่: " + tep.getName() +
        "\nเก็บไว้ในโฟลเดอร์ SUPPLIER_FILES และบันทึกลิงก์ในชีตเนื้อหา" +
        "\nลิงก์: " + tep.getUrl() +
        "\nส่งอีเมลแล้ว: " + gui + " ฉบับ" +
        "\nข้ามเพราะไม่มีอีเมล: " + missingEmails +
        "\nข้ามเพราะเคยส่งแล้ว: " + alreadySent;
    if (alreadySent && !gui) {
        messages += "\nซัพพลายเออร์ที่มีอีเมลถูกทำเครื่องหมายว่าส่งแล้วทั้งหมด ระบบจึงไม่ส่งซ้ำ" +
            "\nหากต้องการเริ่มรอบใหม่ให้ใช้เมนู 5B. เริ่มรอบขอราคาใหม่";
    }
    if (errors.length)
        messages += "\nส่งบางรายการไม่สำเร็จ:\n- " + errors.join("\n- ");
    notify_("ส่งคำขอใบเสนอราคา", messages);
}
function resetSupplierQuoteRound() {
    var sC = getSheet_("SUPPLIERS"), d = readTable_(sC);
    if (!d.rows.length) {
        notify_("เริ่มรอบขอราคาใหม่", "ยังไม่มีข้อมูลซัพพลายเออร์");
        return;
    }
    var sentColumn = getColumnIndex(sC, "QUOTE_REQUEST_SENT"), dateColumn = getColumnIndex(sC, "SENT_DATE");
    var n = d.rows.length;
    sC.getRange(2, sentColumn, n, 1).clearContent();
    sC.getRange(2, dateColumn, n, 1).clearContent();
    SpreadsheetApp.flush();
    notify_("เริ่มรอบขอราคาใหม่", "ล้างสถานะการส่งและวันที่ส่งของซัพพลายเออร์ " + n + " รายการแล้ว\n\n" +
        "ครั้งถัดไปที่เรียกขั้นตอนที่ 5 ระบบจะส่งใหม่ไปยังทุกแถวที่มีอีเมล " +
        "โปรดตรวจสอบรายชื่อก่อนดำเนินการเพื่อป้องกันการส่งซ้ำโดยไม่ตั้งใจ");
}
function createProductBriefPdf_(contentText, contentCode, version) {
    var folder = getFolder_("SUPPLIER_FILES_FOLDER_ID", "SUPPLIER_FILES");
    var productCode = getConfig("PRIMARY_PRODUCT_CODE");
    if (!productCode) {
        throw new Error("ยังไม่ได้กำหนด PRIMARY_PRODUCT_CODE โปรดกรอกรหัสสินค้าหลักก่อนสร้าง PDF");
    }
    var brandName = getConfig("BRAND_NAME") || "สินค้า";
    var name = "PRODUCT_BRIEF_" + productCode + "_" + version + "_" + timestamp_();
    var doc = DocumentApp.create(name), than = doc.getBody();
    than.appendParagraph(brandName + " — ข้อกำหนดสินค้า")
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    than.appendParagraph("รหัสเนื้อหา: " + contentCode + " | เวอร์ชัน: " + version +
        " | วันที่: " + today_());
    than.appendHorizontalRule();
    stripMarkdown_(contentText).split("\n").forEach(function (row) { than.appendParagraph(row); });
    doc.saveAndClose();
    var copy = DriveApp.getFileById(doc.getId());
    var pdf = folder.createFile(copy.getAs(MimeType.PDF)).setName(name + ".pdf");
    copy.setTrashed(true);
    return pdf;
}
function step06CreateSampleChecklist() {
    var sN = getSheet_("CONTENT"), d = readTable_(sN);
    var iLoai = d.head.indexOf("TYPE"), iTt = d.head.indexOf("STATUS"), iNd = d.head.indexOf("CONTENT_TEXT"), iMa = d.head.indexOf("CONTENT_CODE");
    var source = null, hasValidations = false;
    d.rows.forEach(function (r) {
        var l = String(r[iLoai]).trim();
        if (l === "ข้อกำหนดสินค้า" && String(r[iTt]).trim() === "อนุมัติ")
            source = r;
        if (l === "รายการตรวจตัวอย่าง")
            hasValidations = true;
    });
    if (!source) {
        notify_("ยังสร้างรายการตรวจตัวอย่างไม่ได้", "ยังไม่มีข้อกำหนดสินค้าที่อนุมัติแล้ว");
        return;
    }
    if (hasValidations) {
        notify_("มีรายการตรวจตัวอย่างอยู่แล้ว", "ระบบจะไม่สร้างเนื้อหาซ้ำและไม่เรียก API เพิ่มเติม\n" +
            createProductRow_(source, d.head));
        return;
    }
    try {
        var kq = callAi(getConfig("SAMPLE_CHECK_PROMPT"), String(source[iNd]));
        appendRecord_(sN, {
            CONTENT_CODE: createId_(sN, "CONTENT_CODE", "ND-"),
            PRODUCT_CODE: getConfig("PRIMARY_PRODUCT_CODE"), TYPE: "รายการตรวจตัวอย่าง",
            TITLE: "รายการตรวจตัวอย่างสินค้า", CONTENT_TEXT: stripMarkdown_(kq.text),
            SOURCE_LINK: String(source[iMa]), STATUS: "ร่างโดย AI", VERSION: "v1.0"
        });
        notify_("สร้างรายการตรวจตัวอย่าง", "เพิ่มรายการตรวจตัวอย่างในชีตเนื้อหาแล้ว โปรดตรวจสอบก่อนเปลี่ยนสถานะเป็น อนุมัติ\n" +
            createProductRow_(source, d.head));
    }
    catch (e) {
        notify_("ข้อผิดพลาด", String(e.message));
    }
}
function createProductRow_(source, head) {
    var sS = getSheet_("PRODUCTS"), sT = getSheet_("INVENTORY");
    var productCode = getConfig("PRIMARY_PRODUCT_CODE");
    if (!productCode)
        return "ข้ามการสร้างแถวสินค้า เพราะยังไม่ได้กำหนด PRIMARY_PRODUCT_CODE";
    var ds = readTable_(sS), iMa = ds.head.indexOf("PRODUCT_CODE");
    for (var i = 0; i < ds.rows.length; i++) {
        if (String(ds.rows[i][iMa]).trim() === productCode)
            return "มีสินค้า " + productCode + " อยู่ในชีตสินค้าแล้ว";
    }
    var iNd = head.indexOf("CONTENT_TEXT"), iPb = head.indexOf("VERSION");
    var o;
    try {
        o = parseJson_(callAi(getConfig("PRODUCT_EXTRACTION_PROMPT"), String(source[iNd])).text);
    }
    catch (e) {
        return "ข้ามการสร้างแถวสินค้า เพราะอ่านข้อมูลไม่สำเร็จ: " + e.message;
    }
    var sellingPrice = String(o.selling_price || "").replace(/[^0-9]/g, "") || getConfig("SELLING_PRICE");
    var landedCost = String(o.landed_cost || "").replace(/[^0-9]/g, "");
    appendRecord_(sS, {
        PRODUCT_CODE: productCode, PRODUCT_NAME: o.product_name || "", VERSION: String(source[iPb] || "v1.0"),
        COMPONENTS: o.components || "", DIMENSIONS: o.dimensions || "",
        MATERIAL: o.material || "", PACKAGING: o.packaging || "",
        SELLING_PRICE: sellingPrice ? Number(sellingPrice) : "", LANDED_COST: landedCost ? Number(landedCost) : "",
        BATCH_CODE: "", SAMPLE_STATUS: "รออนุมัติ", SAMPLE_APPROVAL_DATE: ""
    });
    var dt = readTable_(sT), iMaT = dt.head.indexOf("PRODUCT_CODE"), hasInventory = false;
    dt.rows.forEach(function (r) { if (String(r[iMaT]).trim() === productCode)
        hasInventory = true; });
    if (!hasInventory) {
        var r = appendRecord_(sT, {
            PRODUCT_CODE: productCode, AVAILABLE_STOCK: 0, IN_PRODUCTION: 0, PENDING_INSPECTION: 0,
            DEFECTIVE_STOCK: 0, IN_TRANSIT: 0, UNINSPECTED_RETURNS: 0, AVERAGE_DAILY_SALES: 0,
            UPDATED_DATE: today_(), DATA_SOURCE: "สร้างโดยระบบ"
        });
        var ct = inventoryFormula_(r);
        sT.getRange(r, getColumnIndex(sT, "DAYS_OF_STOCK")).setFormula(ct.days);
        sT.getRange(r, getColumnIndex(sT, "REORDER_POINT")).setFormula(ct.diem);
        sT.getRange(r, getColumnIndex(sT, "INVENTORY_VALUE")).setFormula(ct.amountByOrder);
    }
    return "สร้างสินค้า " + productCode + " ในชีตสินค้าและสต็อกแล้ว\n" +
        "ระบบตั้งค่าสต็อกเริ่มต้นเป็น 0 เพราะยังไม่มีข้อมูลจริง โปรดกรอก:\n" +
        "- ชีตสินค้า > รหัสล็อต: ใช้ข้อมูลจากใบรับสินค้า\n" +
        "- ชีตสต็อก > สต็อกพร้อมขาย: ใช้จำนวนที่คลังยืนยัน\n" +
        "อย่าคาดเดาตัวเลขสต็อก";
}
function step07CreateSalesContent() {
    var sN = getSheet_("CONTENT"), d = readTable_(sN);
    var iLoai = d.head.indexOf("TYPE"), iTt = d.head.indexOf("STATUS"), iNd = d.head.indexOf("CONTENT_TEXT"), iMa = d.head.indexOf("CONTENT_CODE");
    var source = null;
    d.rows.forEach(function (r) {
        var l = String(r[iLoai]).trim();
        if ((l === "ข้อมูลสินค้า" || l === "ข้อกำหนดสินค้า") && String(r[iTt]).trim() === "อนุมัติ")
            source = r;
    });
    if (!source) {
        notify_("ยังสร้างเนื้อหาการขายไม่ได้", "ยังไม่มีข้อมูลสินค้าหรือข้อกำหนดสินค้าที่อนุมัติแล้ว");
        return;
    }
    try {
        var kq = callAi(getConfig("SALES_CONTENT_PROMPT"), String(source[iNd]));
        var batch = stripMarkdown_(kq.text).split(/\n-{3,}\n/);
        var name = ["คำอธิบายสินค้า", "คำถามที่พบบ่อย", "สคริปต์วิดีโอ"];
        var countMatching = 0;
        for (var i = 0; i < batch.length && i < 3; i++) {
            if (!batch[i].trim())
                continue;
            appendRecord_(sN, {
                CONTENT_CODE: createId_(sN, "CONTENT_CODE", "ND-"),
                PRODUCT_CODE: getConfig("PRIMARY_PRODUCT_CODE"), TYPE: name[i],
                CHANNEL: getConfig("PRIMARY_SALES_CHANNEL"), TITLE: name[i].replace(/_/g, " "),
                CONTENT_TEXT: batch[i].trim(), SOURCE_LINK: String(source[iMa]),
                STATUS: "ร่างโดย AI", VERSION: "v1.0"
            });
            countMatching++;
        }
        notify_("สร้างเนื้อหาการขาย", "เพิ่มเนื้อหา " + countMatching + " รายการในชีตเนื้อหา\n" +
            "โปรดตรวจสอบคำกล่าวอ้าง ขนาด ราคา และนโยบายก่อนเผยแพร่");
    }
    catch (e) {
        notify_("ข้อผิดพลาด", String(e.message));
    }
}
function step08ImportOrders() {
    var automaticRun = isAutomaticRun_(), sheet, folder;
    try {
        sheet = getSheet_("ORDERS");
        folder = getFolder_("ORDER_INBOX_FOLDER_ID", "ORDER_INBOX");
    }
    catch (e) {
        if (!automaticRun)
            notify_("ข้อผิดพลาด", e.message);
        else
            console.error(e.message);
        return;
    }
    var limit = parseInt(getConfig("IMPORT_BATCH_SIZE"), 10) || 300;
    var d = readTable_(sheet), iMa = d.head.indexOf("ORDER_CODE"), existingByKey = {};
    d.rows.forEach(function (r) { if (r[iMa])
        existingByKey[String(r[iMa]).trim()] = true; });
    var files = folder.getFiles(), rowCount = 0, fileCount = 0;
    while (files.hasNext() && rowCount < limit) {
        var f = files.next(), name = f.getName();
        if (name.indexOf("IMPORTED_") === 0)
            continue;
        if (name.toLowerCase().indexOf(".csv") === -1)
            continue;
        if (name.toUpperCase().indexOf("RECONCILIATION") > -1)
            continue;
        var rows;
        try {
            rows = Utilities.parseCsv(f.getBlob().getDataAsString());
        }
        catch (err) {
            continue;
        }
        if (rows.length < 2) {
            f.setName("IMPORTED_" + name);
            fileCount++;
            continue;
        }
        var head = rows[0].map(normalizeHeader_);
        for (var i = 1; i < rows.length && rowCount < limit; i++) {
            var obj = {};
            head.forEach(function (h, j) { if (COLUMNS.ORDERS.indexOf(h) > -1)
                obj[h] = rows[i][j]; });
            var orderCode = String(obj.ORDER_CODE || "").trim();
            if (!orderCode || existingByKey[orderCode])
                continue;
            existingByKey[orderCode] = true;
            if (!obj.ORDER_DATE)
                obj.ORDER_DATE = today_();
            if (!obj.SALES_CHANNEL)
                obj.SALES_CHANNEL = getConfig("PRIMARY_SALES_CHANNEL");
            obj.STATUS = "รอยืนยัน";
            appendRecord_(sheet, obj);
            rowCount++;
        }
        if (rowCount < limit) {
            f.setName("IMPORTED_" + name);
            fileCount++;
        }
    }
    if (!automaticRun)
        notify_("นำเข้าคำสั่งซื้อ", "ประมวลผล " + fileCount + " ไฟล์ และเพิ่มคำสั่งซื้อใหม่ " + rowCount + " รายการ");
}
function step09ValidateOrders() {
    var sD = getSheet_("ORDERS"), sS = getSheet_("PRODUCTS"), sT = getSheet_("INVENTORY");
    var dd = readTable_(sD);
    if (!dd.rows.length) {
        notify_("ตรวจสอบคำสั่งซื้อ", "ยังไม่มีคำสั่งซื้อให้ตรวจสอบ");
        return;
    }
    var ds = readTable_(sS), iMaSp = ds.head.indexOf("PRODUCT_CODE"), validProducts = {};
    ds.rows.forEach(function (r) { if (r[iMaSp])
        validProducts[String(r[iMaSp]).trim()] = true; });
    if (!Object.keys(validProducts).length) {
        notify_("ยังตรวจสอบคำสั่งซื้อไม่ได้", "ยังไม่มีข้อมูลสินค้า โปรดดำเนินการขั้นตอนที่ 6 ก่อน");
        return;
    }
    var dt = readTable_(sT), ton = {};
    var iMaT = dt.head.indexOf("PRODUCT_CODE"), iCo = dt.head.indexOf("AVAILABLE_STOCK");
    dt.rows.forEach(function (r) {
        if (r[iMaT])
            ton[String(r[iMaT]).trim()] = Number(r[iCo]) || 0;
    });
    var c = {};
    ["ORDER_CODE", "PRODUCT_CODE", "QUANTITY", "CUSTOMER_NAME", "PHONE_NUMBER", "ADDRESS", "STATUS", "NOTES"]
        .forEach(function (t) { c[t] = getColumnIndex(sD, t); });
    var thay = {}, ok = 0, errors = 0, boQua = 0;
    var statusColumn = [], notesColumn = [];
    for (var i = 0; i < dd.rows.length; i++) {
        var r = dd.rows[i], ls = [];
        var orderCode = String(r[c.ORDER_CODE - 1]).trim();
        var tt = String(r[c.STATUS - 1]).trim();
        var gc = String(r[c.NOTES - 1]);
        if (!orderCode ||
            ["ส่งคลังแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก", "คืนสินค้า", "กระทบยอดแล้ว"].indexOf(tt) > -1) {
            if (orderCode)
                boQua++;
            statusColumn.push([tt]);
            notesColumn.push([gc]);
            continue;
        }
        if (thay[orderCode])
            ls.push("รหัสคำสั่งซื้อซ้ำ");
        thay[orderCode] = true;
        var mh = String(r[c.PRODUCT_CODE - 1]).trim();
        if (!mh)
            ls.push("ไม่มีรหัสสินค้า");
        else if (!validProducts[mh])
            ls.push("รหัสสินค้าไม่อยู่ในสินค้า");
        var sl = Number(r[c.QUANTITY - 1]) || 0;
        if (sl <= 0)
            ls.push("จำนวนสินค้าไม่ถูกต้อง");
        else if (ton[mh] !== undefined && sl > ton[mh])
            ls.push("จำนวนเกินสต็อกพร้อมขาย (" + ton[mh] + ")");
        ["CUSTOMER_NAME", "PHONE_NUMBER", "ADDRESS"].forEach(function (t) {
            if (!String(r[c[t] - 1]).trim())
                ls.push("ขาดข้อมูล " + COLUMN_LABELS.ORDERS[COLUMNS.ORDERS.indexOf(t)]);
        });
        if (ls.length) {
            statusColumn.push(["รอยืนยัน"]);
            notesColumn.push([ls.join("; ")]);
            errors++;
        }
        else {
            statusColumn.push(["พร้อมส่งคลัง"]);
            notesColumn.push([""]);
            ok++;
        }
    }
    if (statusColumn.length) {
        sD.getRange(2, c.STATUS, statusColumn.length, 1).setValues(statusColumn);
        sD.getRange(2, c.NOTES, notesColumn.length, 1).setValues(notesColumn);
    }
    notify_("ตรวจสอบคำสั่งซื้อ", "พร้อมส่งคลัง: " + ok + " | ต้องแก้ไข: " + errors +
        (boQua ? " | ข้ามรายการที่ประมวลผลแล้ว: " + boQua : ""));
}
function step10SendToWarehouse() {
    var sD = getSheet_("ORDERS"), sS = getSheet_("PRODUCTS"), sT = getSheet_("INVENTORY");
    var email = getConfig("WAREHOUSE_EMAIL");
    if (!email) {
        notify_("ยังไม่ได้ตั้งค่าอีเมลคลังสินค้า", "โปรดกรอก WAREHOUSE_EMAIL ในชีตการตั้งค่า");
        return;
    }
    var ds = readTable_(sS), lo = {};
    var iMaSp = ds.head.indexOf("PRODUCT_CODE"), iLo = ds.head.indexOf("BATCH_CODE");
    ds.rows.forEach(function (r) { if (r[iMaSp])
        lo[String(r[iMaSp]).trim()] = r[iLo]; });
    var c = {};
    ["ORDER_CODE", "PRODUCT_CODE", "QUANTITY", "CUSTOMER_NAME", "PHONE_NUMBER", "ADDRESS", "STATUS",
        "WAREHOUSE_SENT_DATE", "BATCH_CODE"].forEach(function (t) { c[t] = getColumnIndex(sD, t); });
    var d = readTable_(sD), gui = [];
    d.rows.forEach(function (r, i) {
        if (String(r[c.STATUS - 1]).trim() !== "พร้อมส่งคลัง")
            return;
        if (String(r[c.WAREHOUSE_SENT_DATE - 1]).trim())
            return;
        gui.push({ row: i + 2, code: r[c.ORDER_CODE - 1], mh: String(r[c.PRODUCT_CODE - 1]).trim(),
            sl: Number(r[c.QUANTITY - 1]) || 0, name: r[c.CUSTOMER_NAME - 1],
            sdt: r[c.PHONE_NUMBER - 1], dc: r[c.ADDRESS - 1] });
    });
    if (!gui.length) {
        notify_("ส่งรายการไปคลังสินค้า", "ไม่มีคำสั่งซื้อที่พร้อมส่งและยังไม่เคยส่งไปคลัง");
        return;
    }
    var table = gui.map(function (g) {
        return [g.code, g.mh, g.sl, g.name, g.sdt, g.dc, lo[g.mh] || ""].join(" | ");
    }).join("\n");
    MailApp.sendEmail(email, "[" + getConfig("BRAND_NAME") + "] รายการจัดส่ง " + today_(), getConfig("WAREHOUSE_EMAIL_TEMPLATE") + "\n\n" +
        "รหัสคำสั่งซื้อ | รหัสสินค้า | จำนวน | ชื่อลูกค้า | โทรศัพท์ | ที่อยู่ | รหัสล็อต\n" + table);
    var date = today_();
    gui.forEach(function (g) {
        sD.getRange(g.row, c.WAREHOUSE_SENT_DATE).setValue(date);
        sD.getRange(g.row, c.STATUS).setValue("ส่งคลังแล้ว");
        sD.getRange(g.row, c.BATCH_CODE).setValue(lo[g.mh] || "");
    });
    SpreadsheetApp.flush();
    var deductByProduct = {};
    gui.forEach(function (g) { deductByProduct[g.mh] = (deductByProduct[g.mh] || 0) + g.sl; });
    var dt = readTable_(sT);
    var iMaT = dt.head.indexOf("PRODUCT_CODE"), availableColumn = getColumnIndex(sT, "AVAILABLE_STOCK"), inTransitColumn = getColumnIndex(sT, "IN_TRANSIT"), dateColumn = getColumnIndex(sT, "UPDATED_DATE");
    dt.rows.forEach(function (r, i) {
        var mh = String(r[iMaT]).trim();
        if (!deductByProduct[mh])
            return;
        sT.getRange(i + 2, availableColumn).setValue(Math.max((Number(r[availableColumn - 1]) || 0) - deductByProduct[mh], 0));
        sT.getRange(i + 2, inTransitColumn).setValue((Number(r[inTransitColumn - 1]) || 0) + deductByProduct[mh]);
        sT.getRange(i + 2, dateColumn).setValue(today_());
    });
    notify_("ส่งรายการไปคลังสินค้า", "ส่งคำสั่งซื้อ " + gui.length + " รายการไปยังคลังแล้ว\n" +
        "ระบบบันทึกวันที่ส่ง รหัสล็อต และปรับยอดสต็อกพร้อมขายกับยอดกำลังจัดส่งแล้ว");
}
function step11InventoryAlerts() {
    var automaticRun = isAutomaticRun_(), sT, sC, sD;
    try {
        sT = getSheet_("INVENTORY");
        sC = getSheet_("ALERTS");
        sD = getSheet_("ORDERS");
    }
    catch (e) {
        if (!automaticRun)
            notify_("ข้อผิดพลาด", e.message);
        return;
    }
    var moc = new Date();
    moc.setDate(moc.getDate() - 14);
    var dd = readTable_(sD), salesByProduct = {};
    var iTt = dd.head.indexOf("STATUS"), iMh = dd.head.indexOf("PRODUCT_CODE"), iSl = dd.head.indexOf("QUANTITY"), iNgayGui = dd.head.indexOf("WAREHOUSE_SENT_DATE");
    dd.rows.forEach(function (r) {
        var tt = String(r[iTt]).trim();
        if (["ส่งคลังแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "กระทบยอดแล้ว"].indexOf(tt) === -1)
            return;
        var n = r[iNgayGui] instanceof Date ? r[iNgayGui] : new Date(String(r[iNgayGui]));
        if (isNaN(n.getTime()) || n < moc)
            return;
        var mh = String(r[iMh]).trim();
        salesByProduct[mh] = (salesByProduct[mh] || 0) + (Number(r[iSl]) || 0);
    });
    var dt = readTable_(sT);
    var iMa = dt.head.indexOf("PRODUCT_CODE"), iCo = dt.head.indexOf("AVAILABLE_STOCK"), iDi = dt.head.indexOf("REORDER_POINT"), iNg = dt.head.indexOf("DAYS_OF_STOCK");
    var cTb = getColumnIndex(sT, "AVERAGE_DAILY_SALES");
    dt.rows.forEach(function (r, i) {
        var mh = String(r[iMa]).trim();
        if (!mh)
            return;
        if (salesByProduct[mh])
            sT.getRange(i + 2, cTb).setValue(Math.round(salesByProduct[mh] / 14 * 100) / 100);
    });
    SpreadsheetApp.flush();
    dt = readTable_(sT);
    var dc = readTable_(sC);
    var iLoai = dc.head.indexOf("ALERT_TYPE"), iMaC = dc.head.indexOf("PRODUCT_CODE"), iNdC = dc.head.indexOf("CONTENT_TEXT"), iXuLy = dc.head.indexOf("RESOLVED");
    var previous = {};
    dc.rows.forEach(function (r) {
        if (String(r[iLoai]).trim() !== "INVENTORY")
            return;
        var m = String(r[iNdC]).match(/สต็อกพร้อมขาย (\d+)/);
        previous[String(r[iMaC]).trim()] = {
            ton: m ? parseInt(m[1], 10) : null,
            processed: String(r[iXuLy]).trim().toUpperCase() === "ใช่"
        };
    });
    var productionLeadTime = getNumericConfig_("PRODUCTION_LEAD_DAYS");
    var date = today_(), them = [], boQua = [];
    dt.rows.forEach(function (r) {
        var code = String(r[iMa]).trim();
        if (!code)
            return;
        var exists = Number(r[iCo]) || 0;
        var di = Math.round(Number(r[iDi]) || 0);
        var days = Number(r[iNg]);
        if (di <= 0 || exists > di)
            return;
        var previousValue = previous[code];
        if (previousValue && !previousValue.processed && previousValue.ton !== null && exists >= previousValue.ton) {
            boQua.push(code + " (มีการแจ้งเตือนที่ยังไม่ดำเนินการ)");
            return;
        }
        var daysText = isNaN(days) ? "ไม่ทราบ"
            : (Math.round(days * 10) / 10) + " วัน";
        var them2 = "";
        if (!isNaN(days) && productionLeadTime > 0 && days < productionLeadTime) {
            them2 = " ระยะเวลาผลิต " + productionLeadTime +
                " วัน ซึ่งยาวกว่าสต็อกที่เหลือ หากสั่งวันนี้อาจเกิดสินค้าขาดช่วง";
        }
        them.push([date, "INVENTORY", code,
            "สต็อกพร้อมขาย " + exists + " หน่วย ถึงจุดสั่งซื้อใหม่ " + di +
                " หน่วย คาดว่าเหลือ " + daysText + "." + them2, di, "ไม่"]);
    });
    if (!them.length) {
        if (!automaticRun)
            notify_("ตรวจสอบการแจ้งเตือนสต็อก", "อัปเดตยอดขายเฉลี่ยต่อวันจากข้อมูล 14 วันล่าสุดแล้ว " +
                (boQua.length ? "ไม่สร้างแจ้งเตือนซ้ำสำหรับ: " + boQua.join(", ") +
                    "\nหากต้องการรับแจ้งเตือนใหม่ ให้เปลี่ยนสถานะเดิมเป็น ดำเนินการแล้ว"
                    : "ยังไม่มีสินค้าถึงจุดสั่งซื้อใหม่"));
        return;
    }
    var r0 = getFirstEmptyRow_(sC);
    sC.getRange(r0, 1, them.length, 6).setValues(them);
    sendOperationsNotice_("แจ้งเตือนสต็อก " + date, getConfig("INVENTORY_ALERT_EMAIL_TEMPLATE") + "\n\n" +
        them.map(function (t) { return "- " + t[2] + ": " + t[3]; }).join("\n") +
        "\n\nโปรดตรวจสอบแผนสั่งผลิตหรือสั่งซื้อใหม่ และเปลี่ยนสถานะในชีตการแจ้งเตือนเมื่อดำเนินการแล้ว", true);
    if (!automaticRun)
        notify_("ตรวจสอบการแจ้งเตือนสต็อก", "สร้างการแจ้งเตือน " + them.length + " รายการและส่งอีเมลแล้ว");
}
function step12ClassifySupportEmail() {
    var automaticRun = isAutomaticRun_();
    var hour = new Date().getHours();
    if (automaticRun && (hour < 8 || hour > 20))
        return;
    var pendingLabel = GmailApp.getUserLabelByName(PENDING_LABEL);
    var processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL);
    if (!pendingLabel || !processedLabel) {
        if (!automaticRun)
            notify_("ไม่พบป้ายกำกับ Gmail", "โปรดเรียกใช้เมนู ตั้งค่าการทำงานอัตโนมัติ ก่อน");
        return;
    }
    var sheet = getSheet_("RETURNS_CANCELS");
    var startedAt = new Date().getTime();
    var HAN = 4 * 60 * 1000;
    var EMAILS_PER_RUN = 3;
    var requeued = 0;
    try {
        var dh = readTable_(sheet);
        var iMaCh = dh.head.indexOf("CONTENT_CODE"), iNgayH = dh.head.indexOf("DATE");
        var lastSeen = {};
        dh.rows.forEach(function (r) {
            var mc = String(r[iMaCh]).trim();
            if (!mc)
                return;
            var n = r[iNgayH] instanceof Date ? r[iNgayH] : new Date(String(r[iNgayH]));
            if (!isNaN(n.getTime()) && (!lastSeen[mc] || n > lastSeen[mc]))
                lastSeen[mc] = n;
        });
        processedLabel.getThreads(0, 30).forEach(function (t) {
            var mc = t.getId();
            var msgs2 = t.getMessages();
            var latestMessage = msgs2[msgs2.length - 1];
            if (latestMessage.getFrom().indexOf(Session.getEffectiveUser().getEmail()) > -1)
                return;
            var previousValue = lastSeen[mc];
            if (!previousValue || latestMessage.getDate() > previousValue) {
                t.removeLabel(processedLabel).addLabel(pendingLabel);
                requeued++;
            }
        });
    }
    catch (e) {
        console.error("ตรวจอีเมลที่ต้องนำกลับมาประมวลผลไม่สำเร็จ: " + e.message);
    }
    var threads = pendingLabel.getThreads(0, EMAILS_PER_RUN), xong = 0, errors = [];
    for (var i = 0; i < threads.length; i++) {
        if (new Date().getTime() - startedAt > HAN) {
            errors.push("ใกล้ถึงเวลาทำงานสูงสุด ระบบหยุดรอบนี้และเก็บอีเมลที่เหลือไว้สำหรับรอบถัดไป");
            break;
        }
        var th = threads[i], msgs = th.getMessages(), msg = msgs[msgs.length - 1];
        var title = th.getFirstMessageSubject();
        try {
            var kq = callAi(getConfig("SUPPORT_CLASSIFICATION_PROMPT"), "หัวเรื่อง: " + title + "\nเนื้อหา: " + msg.getPlainBody().substring(0, 2000));
            var o = parseJson_(kq.text);
            var tomTat = getField_(o, "summary");
            var group = getField_(o, "request_group");
            var priority = getField_(o, "priority").toUpperCase();
            var missingInfo = getField_(o, "missing_info");
            var replyTemplate = getField_(o, "reply_template");
            var requiresApproval = getField_(o, "requires_human_approval").toUpperCase();
            var goc = (title + " " + msg.getPlainBody()).toLowerCase();
            var keywords = ["คืนเงิน", "ขอเงินคืน", "ยกเลิกคำสั่งซื้อ", "ร้องเรียน", "คุณภาพสินค้า",
                "โฆษณาไม่ตรง", "ความปลอดภัย", "ชดเชย"];
            if (keywords.some(function (t) { return goc.indexOf(t) > -1; }))
                requiresApproval = "ใช่";
            var parsedSuccessfully = tomTat || group || replyTemplate;
            appendRecord_(sheet, {
                DATE: today_(), CHANNEL: "EMAIL",
                REQUEST_GROUP: group, PRIORITY: priority,
                SUMMARY: parsedSuccessfully ? tomTat : ("อ่านโครงสร้างคำตอบไม่สำเร็จ ข้อความจาก AI: " + kq.text.substring(0, 1500)),
                MISSING_INFO: missingInfo, REPLY_TEMPLATE: replyTemplate,
                REQUIRES_HUMAN_APPROVAL: (requiresApproval === "ใช่") ? "ใช่" : "ไม่",
                ASSIGNEE: getConfig("DEFAULT_ASSIGNEE"), STATUS: "รอดำเนินการ",
                CONTENT_CODE: th.getId()
            });
            if (replyTemplate)
                msg.createDraftReply(replyTemplate);
            else
                errors.push(title + ": AI ไม่ส่งคืนฟิลด์ reply_template จึงไม่ได้สร้างอีเมลร่าง");
            if (requiresApproval === "ใช่") {
                var kenhXong = notifyApprovalRequired_(title, group, priority, tomTat, th.getPermalink());
                if (!kenhXong.length) {
                    errors.push(title + ": รายการต้องอนุมัติโดยผู้ดูแลแต่ส่งการแจ้งเตือนไม่สำเร็จ " +
                        "โปรดตรวจสอบ APPROVER_EMAIL และ MANAGER_EMAIL ในชีตการตั้งค่า");
                }
            }
            th.removeLabel(pendingLabel).addLabel(processedLabel);
            xong++;
        }
        catch (e) {
            errors.push(title + ": " + e.message);
            console.error(title + ": " + e.message);
        }
    }
    var remaining = pendingLabel.getThreads(0, 50).length;
    if (!automaticRun) {
        notify_("จำแนกอีเมลช่วยเหลือ", "ประมวลผลแล้ว " + xong + " อีเมล\n" +
            "คงเหลือในคิว " + remaining + " อีเมล" +
            (requeued ? "\nนำกลับมาประมวลผลอีกครั้ง " + requeued + " เธรดที่มีข้อความใหม่จากลูกค้า" : "") +
            "\nโปรดเปิด Gmail เพื่อตรวจและแก้ไขอีเมลร่างก่อนส่ง" +
            (errors.length ? "\nข้อผิดพลาด:\n- " + errors.join("\n- ") : ""));
    }
}
function notifyApprovalRequired_(title, group, priority, tomTat, link) {
    return sendOperationsNotice_("ต้องอนุมัติ: " + title, "ระบบจำแนกรายการนี้ว่าต้องให้ผู้ดูแลตัดสินใจ\n" +
        "กลุ่มคำขอ: " + (group || "ไม่ระบุ") + "\n" +
        "ระดับความสำคัญ: " + (priority || "ไม่ระบุ") + "\n\n" +
        "สรุป:\n" + (tomTat || "ไม่มีสรุป") + "\n\n" +
        "เปิดเธรด: " + link + "\n\n" +
        "โปรดอ่านอีเมลต้นฉบับและอีเมลร่างใน Gmail ระบบยังไม่ได้ตอบลูกค้าอัตโนมัติ", true);
}
function sendDailySummary() {
    var sheet;
    try {
        sheet = getSheet_("RETURNS_CANCELS");
    }
    catch (e) {
        console.error(e);
        return;
    }
    var d = readTable_(sheet);
    var iTt = d.head.indexOf("STATUS"), iDuyet = d.head.indexOf("REQUIRES_HUMAN_APPROVAL"), iTom = d.head.indexOf("SUMMARY"), iNhom = d.head.indexOf("REQUEST_GROUP"), iUu = d.head.indexOf("PRIORITY"), iNgay = d.head.indexOf("DATE");
    var gap = [], standardItems = [];
    d.rows.forEach(function (r) {
        var tt = String(r[iTt]).trim();
        if (tt === "ตอบแล้ว" || tt === "ปิดแล้ว")
            return;
        var row = "- [" + (String(r[iUu]).trim() || "ไม่ระบุ") + "] " +
            (String(r[iNhom]).trim() || "ไม่ระบุ") + ": " +
            String(r[iTom]).substring(0, 200);
        if (String(r[iDuyet]).trim().toUpperCase() === "ใช่")
            gap.push(row);
        else
            standardItems.push(row);
    });
    if (!gap.length && !standardItems.length)
        return;
    var than = "สรุปรายการช่วยเหลือลูกค้าที่ยังไม่ปิด ณ วันที่ " + today_() + "\n\n";
    if (gap.length)
        than += "ต้องให้ผู้ดูแลอนุมัติ (" + gap.length + "):\n" + gap.join("\n") + "\n\n";
    if (standardItems.length)
        than += "มีอีเมลร่างจาก AI (" + standardItems.length + "):\n" + standardItems.join("\n") + "\n\n";
    than += "โปรดตรวจสอบใน Gmail แล้วอัปเดตสถานะเป็น ตอบแล้ว หรือ ปิดแล้ว เพื่อไม่ให้รายการกลับมาในสรุปครั้งถัดไป";
    sendOperationsNotice_("งานบริการลูกค้าคงค้าง: " + (gap.length + standardItems.length) + " รายการ", than, gap.length > 0);
}
function step13SummarizeReturns() {
    var automaticRun = isAutomaticRun_(), sH, sC, sD;
    try {
        sH = getSheet_("RETURNS_CANCELS");
        sC = getSheet_("ALERTS");
        sD = getSheet_("ORDERS");
    }
    catch (e) {
        if (!automaticRun)
            notify_("ข้อผิดพลาด", e.message);
        return;
    }
    var moc = new Date();
    moc.setDate(moc.getDate() - 7);
    var d = readTable_(sH);
    var iNgay = d.head.indexOf("DATE"), iNg = d.head.indexOf("ROOT_CAUSE"), iLo = d.head.indexOf("BATCH_CODE");
    var byRootCause = {}, byBatch = {}, tong = 0;
    d.rows.forEach(function (r) {
        var n = r[iNgay] instanceof Date ? r[iNgay] : new Date(String(r[iNgay]));
        if (isNaN(n.getTime()) || n < moc)
            return;
        var nn = String(r[iNg]).trim() || "KHAC";
        byRootCause[nn] = (byRootCause[nn] || 0) + 1;
        var lo = String(r[iLo]).trim();
        if (lo)
            byBatch[lo] = (byBatch[lo] || 0) + 1;
        tong++;
    });
    if (!tong) {
        if (!automaticRun)
            notify_("สรุปคืนสินค้าและยกเลิก", "ไม่มีรายการคืนสินค้าหรือยกเลิกใน 7 วันที่ผ่านมา");
        return;
    }
    var dd = readTable_(sD), iTt = dd.head.indexOf("STATUS");
    var deliveredCount = dd.rows.filter(function (r) {
        return String(r[iTt]).trim() === "จัดส่งสำเร็จ";
    }).length || tong;
    var rootCauseThreshold = getNumericConfig_("ROOT_CAUSE_ALERT_PERCENT") || 30;
    var batchThreshold = getNumericConfig_("BATCH_ALERT_MULTIPLIER") || 2;
    var date = today_(), them = [];
    Object.keys(byRootCause).forEach(function (nn) {
        var tl = byRootCause[nn] / tong * 100;
        them.push([date, "RETURNS_CANCELS", nn,
            nn + ": " + byRootCause[nn] + " รายการ คิดเป็น " + tl.toFixed(1) + "% ของรายการคืนและยกเลิก " +
                "และ " + (byRootCause[nn] / deliveredCount * 100).toFixed(1) + "% ของคำสั่งซื้อที่จัดส่งสำเร็จ" +
                (tl > rootCauseThreshold ? " — เกินเกณฑ์แจ้งเตือน" : ""), rootCauseThreshold, "ไม่"]);
    });
    var tbLo = tong / Math.max(Object.keys(byBatch).length, 1);
    Object.keys(byBatch).forEach(function (lo) {
        if (byBatch[lo] >= tbLo * batchThreshold) {
            them.push([date, "HOAN_HUY_LO", lo,
                "ล็อต " + lo + " มีรายการคืนหรือยกเลิก " + byBatch[lo] + " รายการ " +
                    "สูงกว่าค่าเฉลี่ย " + (byBatch[lo] / tbLo).toFixed(1) + " เท่า — เกินเกณฑ์แจ้งเตือน", batchThreshold, "ไม่"]);
        }
    });
    if (!them.length) {
        if (!automaticRun)
            notify_("สรุปคืนสินค้าและยกเลิก", "ไม่มีข้อมูลที่ถึงเกณฑ์แจ้งเตือน");
        return;
    }
    var r0 = getFirstEmptyRow_(sC);
    sC.getRange(r0, 1, them.length, 6).setValues(them);
    sendOperationsNotice_("สรุปคืนสินค้าและยกเลิกรายสัปดาห์ " + date, them.map(function (t) { return "- " + t[3]; }).join("\n"), false);
    if (!automaticRun)
        notify_("สรุปคืนสินค้าและยกเลิก", "เพิ่มการแจ้งเตือน " + them.length + " รายการในชีตการแจ้งเตือน");
}
function step14ReconcilePeriod() {
    var sO = getSheet_("RECONCILIATION"), sD = getSheet_("ORDERS");
    var folder;
    try {
        folder = getFolder_("ORDER_INBOX_FOLDER_ID", "ORDER_INBOX");
    }
    catch (e) {
        notify_("ข้อผิดพลาด", e.message);
        return;
    }
    var dd = readTable_(sD), amountByOrder = {};
    var iMa = dd.head.indexOf("ORDER_CODE"), iTien = dd.head.indexOf("CUSTOMER_PAID");
    dd.rows.forEach(function (r) {
        if (r[iMa])
            amountByOrder[String(r[iMa]).trim()] = Number(r[iTien]) || 0;
    });
    var doc = readTable_(sO), iMaO = doc.head.indexOf("ORDER_CODE"), existingByKey = {};
    doc.rows.forEach(function (r) { if (r[iMaO])
        existingByKey[String(r[iMaO]).trim()] = true; });
    var files = folder.getFiles(), rowCount = 0, ky = today_();
    while (files.hasNext()) {
        var f = files.next(), name = f.getName();
        if (name.indexOf("IMPORTED_") === 0)
            continue;
        if (name.toUpperCase().indexOf("RECONCILIATION") === -1)
            continue;
        var rows;
        try {
            rows = Utilities.parseCsv(f.getBlob().getDataAsString());
        }
        catch (e) {
            continue;
        }
        if (rows.length < 2)
            continue;
        var head = rows[0].map(normalizeHeader_);
        for (var i = 1; i < rows.length; i++) {
            var o = {};
            head.forEach(function (h, j) { if (COLUMNS.RECONCILIATION.indexOf(h) > -1)
                o[h] = rows[i][j]; });
            var code = String(o.ORDER_CODE || "").trim();
            if (!code || existingByKey[code])
                continue;
            existingByKey[code] = true;
            var actualAmount = Number(o.ACTUAL_RECEIVED) || 0;
            var ghiNhan = Number(o.RECOGNIZED_REVENUE) || amountByOrder[code] || 0;
            var phi = (Number(o.PLATFORM_FEE) || 0) + (Number(o.PAYMENT_FEE) || 0)
                - (Number(o.SHIPPING_SUBSIDY) || 0);
            o.RECOGNIZED_REVENUE = ghiNhan;
            o.DIFFERENCE = ghiNhan - phi - actualAmount;
            o.RECONCILIATION_PERIOD = o.RECONCILIATION_PERIOD || ky;
            if (!o.DATE)
                o.DATE = ky;
            appendRecord_(sO, o);
            rowCount++;
        }
        f.setName("IMPORTED_" + name);
    }
    notify_("กระทบยอดประจำรอบ", rowCount
        ? "นำเข้ารายการกระทบยอด " + rowCount + " แถวแล้ว\nโปรดตรวจสอบให้คอลัมน์ส่วนต่างเป็น 0"
        : "ไม่พบไฟล์ CSV สำหรับกระทบยอดในโฟลเดอร์ ORDER_INBOX");
}
var ACTION_LABELS = {
    step01CreateDemandForm: "1. สร้างแบบฟอร์มเก็บข้อมูล",
    step02ImportDemandData: "2. นำเข้าข้อมูลความต้องการ",
    step03GroupDemand: "3. จัดกลุ่มความต้องการ",
    step04CreateProductBrief: "4. สร้างข้อกำหนดสินค้า",
    step04bCreateNewProductBrief: "4B. สร้างข้อกำหนดเวอร์ชันใหม่",
    step05SendQuoteRequests: "5. ส่งคำขอใบเสนอราคา",
    resetSupplierQuoteRound: "5B. เริ่มรอบขอราคาใหม่",
    step06CreateSampleChecklist: "6. สร้างรายการตรวจตัวอย่าง",
    step07CreateSalesContent: "7. สร้างเนื้อหาการขาย",
    step08ImportOrders: "8. นำเข้าคำสั่งซื้อ",
    step09ValidateOrders: "9. ตรวจสอบคำสั่งซื้อ",
    step10SendToWarehouse: "10. ส่งรายการไปคลังสินค้า",
    step11InventoryAlerts: "11. ตรวจสอบการแจ้งเตือนสต็อก",
    step12ClassifySupportEmail: "12. จำแนกอีเมลช่วยเหลือ",
    step13SummarizeReturns: "13. สรุปคืนสินค้าและยกเลิก",
    step14ReconcilePeriod: "14. กระทบยอดประจำรอบ"
};
var ACTION_HANDLERS = {
    step01CreateDemandForm: step01CreateDemandForm, step02ImportDemandData: step02ImportDemandData,
    step03GroupDemand: step03GroupDemand, step04CreateProductBrief: step04CreateProductBrief,
    step04bCreateNewProductBrief: step04bCreateNewProductBrief,
    step05SendQuoteRequests: step05SendQuoteRequests, resetSupplierQuoteRound: resetSupplierQuoteRound,
    step06CreateSampleChecklist: step06CreateSampleChecklist,
    step07CreateSalesContent: step07CreateSalesContent, step08ImportOrders: step08ImportOrders,
    step09ValidateOrders: step09ValidateOrders, step10SendToWarehouse: step10SendToWarehouse,
    step11InventoryAlerts: step11InventoryAlerts, step12ClassifySupportEmail: step12ClassifySupportEmail,
    step13SummarizeReturns: step13SummarizeReturns, step14ReconcilePeriod: step14ReconcilePeriod
};
function runDashboardAction(name) {
    if (!ACTION_HANDLERS[name])
        return "ไม่พบขั้นตอน: " + name;
    DASHBOARD_STATE.capturing = true;
    DASHBOARD_STATE.messages = [];
    try {
        ACTION_HANDLERS[name]();
        return DASHBOARD_STATE.messages.length ? DASHBOARD_STATE.messages.join("\n") : "ดำเนินการเสร็จสิ้น: " + ACTION_LABELS[name];
    }
    catch (e) {
        return "ข้อผิดพลาด: " + e.message;
    }
    finally {
        DASHBOARD_STATE.capturing = false;
    }
}
function getDashboardData() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    function countMatching(sheetKey, column, dk) {
        var s = ss.getSheetByName(getSheetName_(sheetKey));
        if (!s)
            return 0;
        var d = readTable_(s), i = d.head.indexOf(column);
        if (i === -1)
            return 0;
        return d.rows.filter(function (r) { return dk(String(r[i]).trim()); }).length;
    }
    function tong(sheetKey) {
        var s = ss.getSheetByName(getSheetName_(sheetKey));
        return s ? readTable_(s).rows.length : 0;
    }
    var khac = function (v) { return v !== ""; };
    var equalsValue = function (x) { return function (v) { return v === x; }; };
    return {
        approvedDemand: countMatching("RAW_DATA", "APPROVED_GROUP", khac) + " / " + tong("RAW_DATA"),
        backupSuppliers: countMatching("SUPPLIERS", "ROLE", equalsValue("สำรอง")),
        contentPendingApproval: countMatching("CONTENT", "STATUS", function (v) { return v === "ร่างโดย AI" || v === "รออนุมัติ"; }),
        orders: {
            PENDING_CONFIRMATION: countMatching("ORDERS", "STATUS", equalsValue("รอยืนยัน")),
            READY_FOR_WAREHOUSE: countMatching("ORDERS", "STATUS", equalsValue("พร้อมส่งคลัง")),
            SENT_TO_WAREHOUSE: countMatching("ORDERS", "STATUS", equalsValue("ส่งคลังแล้ว")),
            IN_TRANSIT: countMatching("ORDERS", "STATUS", equalsValue("กำลังจัดส่ง")),
            DELIVERED: countMatching("ORDERS", "STATUS", equalsValue("จัดส่งสำเร็จ")),
            RETURNS_OR_CANCELS: countMatching("ORDERS", "STATUS", function (v) { return v === "ยกเลิก" || v === "คืนสินค้า"; })
        },
        alerts: countMatching("ALERTS", "RESOLVED", function (v) { return v !== "ใช่"; }),
        approvalRequired: countMatching("RETURNS_CANCELS", "REQUIRES_HUMAN_APPROVAL", equalsValue("ใช่")),
        brandName: getConfig("BRAND_NAME") || "ยังไม่ได้ตั้งชื่อแบรนด์",
        updatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm dd/MM/yyyy")
    };
}
function openDashboard() {
    var t;
    try {
        t = HtmlService.createTemplateFromFile("Dashboard");
    }
    catch (e) {
        notify_("ไม่พบไฟล์แดชบอร์ด", "โปรเจกต์นี้ยังไม่มีไฟล์ HTML ชื่อ Dashboard " +
            "โปรดสร้างไฟล์ HTML ชื่อ Dashboard (ไม่ต้องพิมพ์ .html) " +
            "แล้ววางโค้ดจากไฟล์ Dashboard.html");
        return;
    }
    SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(960).setHeight(700), "แดชบอร์ดการดำเนินงาน");
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('WEUP SoloSix — แดชบอร์ดอีคอมเมิร์ซ');
}
