/**
 * WEUP SoloSix — โมเดล 4
 * ระบบรายงานยอดขายรายสัปดาห์สำหรับตลาดประเทศไทย
 *
 * โค้ดเป็นผู้ตรวจและคำนวณตัวเลขทั้งหมด ส่วน AI เขียนเฉพาะคำอธิบาย
 * รายงานจะไม่ถูกส่งจนกว่าผู้จัดการจะตรวจและอนุมัติด้วยตนเอง
 */

const MENU_NAME = 'รายงานประจำสัปดาห์';
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const API_KEY_PROPERTY = 'OPENAI_API_KEY';

const SHEETS = {
  CONFIG: 'ตั้งค่า',
  DAILY_DATA: 'ข้อมูลรายวัน',
  WEEKLY_METRICS: 'ตัวชี้วัดรายสัปดาห์',
  AI_REPORTS: 'รายงาน AI',
  AUDIT_LOG: 'บันทึกระบบ'
};

const FIELD_LABELS = {
  KEY: 'คีย์', VALUE: 'ค่า', DESCRIPTION: 'คำอธิบาย',
  DATE: 'วันที่', EMPLOYEE: 'พนักงาน', NEW_LEADS: 'ลูกค้าเป้าหมายใหม่',
  CONTACTED_LEADS: 'ติดต่อแล้ว', APPOINTMENTS: 'นัดหมาย', SUCCESSFUL_ORDERS: 'คำสั่งซื้อสำเร็จ',
  RECORDED_REVENUE: 'ยอดขายที่บันทึก', CASH_COLLECTED: 'เงินรับจริง', CANCELLED_ORDERS: 'ยกเลิก',
  RETURNED_ORDERS: 'คืนสินค้า', EXCEPTION_NOTES: 'หมายเหตุผิดปกติ', WEEK_ID: 'รหัสสัปดาห์',
  FROM_DATE: 'ตั้งแต่วันที่', TO_DATE: 'ถึงวันที่', CONTACT_RATE: 'อัตราการติดต่อ (%)',
  CLOSE_RATE: 'อัตราปิดการขาย (%)', CANCELLATION_RATE: 'อัตรายกเลิก (%)', RETURN_RATE: 'อัตราคืนสินค้า (%)',
  WEEKLY_KPI: 'เป้าหมายรายสัปดาห์ (บาท)', KPI_ACHIEVEMENT: 'เทียบเป้าหมาย (%)',
  WEEK_OVER_WEEK: 'เทียบกับสัปดาห์ก่อน', DATA_STATUS: 'สถานะข้อมูล', CALCULATED_AT: 'วันที่คำนวณ',
  REPORT_ID: 'รหัสรายงาน', CREATED_AT: 'วันที่สร้าง', OVERVIEW: 'ภาพรวม', WARNINGS: 'คำเตือน',
  RECOMMENDED_ACTIONS: 'การดำเนินการที่แนะนำ', MANAGER_QUESTIONS: 'คำถามสำหรับผู้จัดการ',
  STATUS: 'สถานะ', APPROVED_BY: 'ผู้อนุมัติ', APPROVED_AT: 'วันที่อนุมัติ', SENT_AT: 'วันที่ส่ง',
  RECIPIENTS: 'ผู้รับ', RAW_JSON: 'JSON ดิบ', TIMESTAMP: 'เวลา', STEP: 'ขั้นตอน',
  REPORTING_PERIOD: 'รอบรายงาน', RESULT: 'ผลลัพธ์', DETAILS: 'รายละเอียด', ACTOR: 'ผู้ดำเนินการ'
};

const STATUS_LABELS = {
  NEEDS_DATA_FIX: 'ต้องแก้ข้อมูล', PENDING_APPROVAL: 'รออนุมัติ', APPROVED_TO_SEND: 'อนุมัติให้ส่ง',
  SENT: 'ส่งแล้ว', ERROR: 'ข้อผิดพลาด', PASSED: 'ผ่าน', OK: 'สำเร็จ', STOPPED: 'หยุด',
  WARNING: 'คำเตือน', INVALID_FORMAT: 'รูปแบบไม่ถูกต้อง', SKIPPED: 'ข้าม'
};

const CONFIG_KEY_ALIASES = {
  BUSINESS_NAME: 'BUSINESS_NAME', CUSTOMER_FILE_ID: 'CUSTOMER_FILE_ID', CUSTOMER_SHEET_NAME: 'CUSTOMER_SHEET_NAME',
  REPORTING_PERIOD: 'REPORTING_PERIOD', WEEKLY_KPI: 'WEEKLY_KPI', MAX_BLANK_RATE: 'MAX_BLANK_RATE',
  CASH_DROP_ALERT_PERCENT: 'CASH_DROP_ALERT_PERCENT', CLOSE_RATE_DROP_ALERT_POINTS: 'CLOSE_RATE_DROP_ALERT_POINTS',
  REPORT_RECIPIENTS: 'REPORT_RECIPIENTS', MODEL: 'MODEL', MAX_OUTPUT_TOKENS: 'MAX_OUTPUT_TOKENS',
  EMAIL_LIMIT_PER_RUN: 'EMAIL_LIMIT_PER_RUN', SYSTEM_PROMPT: 'SYSTEM_PROMPT', USER_PROMPT: 'USER_PROMPT',
  EMAIL_SUBJECT_TEMPLATE: 'EMAIL_SUBJECT_TEMPLATE', EMAIL_BODY_TEMPLATE: 'EMAIL_BODY_TEMPLATE'
};

const REPORT_STATUS_KEYS = ['NEEDS_DATA_FIX', 'PENDING_APPROVAL', 'APPROVED_TO_SEND', 'SENT', 'ERROR'];

/** คอลัมน์ตัวเลขสำหรับตรวจค่าติดลบและคำนวณผลรวม */
const NUMERIC_FIELDS = ['NEW_LEADS', 'CONTACTED_LEADS', 'APPOINTMENTS', 'SUCCESSFUL_ORDERS',
  'RECORDED_REVENUE', 'CASH_COLLECTED', 'CANCELLED_ORDERS', 'RETURNED_ORDERS'];

/** คอลัมน์บังคับสำหรับคำนวณสัดส่วนช่องว่าง */
const REQUIRED_FIELDS = ['DATE', 'EMPLOYEE'].concat(NUMERIC_FIELDS);

const SHEET_SCHEMAS = {
  CONFIG: ['KEY', 'VALUE', 'DESCRIPTION'],
  DAILY_DATA: ['DATE', 'EMPLOYEE', 'NEW_LEADS', 'CONTACTED_LEADS', 'APPOINTMENTS',
    'SUCCESSFUL_ORDERS', 'RECORDED_REVENUE', 'CASH_COLLECTED', 'CANCELLED_ORDERS', 'RETURNED_ORDERS', 'EXCEPTION_NOTES'],
  WEEKLY_METRICS: ['WEEK_ID', 'FROM_DATE', 'TO_DATE', 'NEW_LEADS', 'CONTACTED_LEADS',
    'APPOINTMENTS', 'SUCCESSFUL_ORDERS', 'RECORDED_REVENUE', 'CASH_COLLECTED', 'CANCELLED_ORDERS', 'RETURNED_ORDERS',
    'CONTACT_RATE', 'CLOSE_RATE', 'CANCELLATION_RATE', 'RETURN_RATE', 'WEEKLY_KPI', 'KPI_ACHIEVEMENT',
    'WEEK_OVER_WEEK', 'DATA_STATUS', 'CALCULATED_AT'],
  AI_REPORTS: ['REPORT_ID', 'WEEK_ID', 'CREATED_AT', 'OVERVIEW', 'WARNINGS', 'RECOMMENDED_ACTIONS',
    'MANAGER_QUESTIONS', 'STATUS', 'APPROVED_BY', 'APPROVED_AT', 'SENT_AT', 'RECIPIENTS', 'RAW_JSON'],
  AUDIT_LOG: ['TIMESTAMP', 'STEP', 'REPORTING_PERIOD', 'RESULT', 'DETAILS', 'REPORT_ID', 'ACTOR']
};

/** คอลัมน์ที่มนุษย์เป็นผู้กรอกเท่านั้น */
const HUMAN_ONLY_FIELDS = {
  AI_REPORTS: ['APPROVED_BY', 'APPROVED_AT']
};

/* --------------------------------- MENU ---------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu(MENU_NAME)
    .addItem('เปิดแดชบอร์ด', 'openDashboard')
    .addSeparator()
    .addItem('1. สร้างโครงสร้างชีต', 'setupSystem')
    .addItem('2. ตรวจสอบข้อมูลรายสัปดาห์', 'validateWeeklyData')
    .addItem('3. คำนวณตัวชี้วัดรายสัปดาห์', 'calculateWeeklyMetrics')
    .addItem('4. สร้างความเห็นด้วย AI', 'generateAIReport')
    .addItem('5. ส่งรายงานที่อนุมัติแล้ว', 'sendApprovedReport')
    .addSeparator()
    .addItem('6. ตรวจสอบการเชื่อมต่อ API', 'testApiConnection')
    .addItem('7. ตั้งเวลาทำงานอัตโนมัติ', 'installAutomationTrigger')
    .addToUi();
}

/* --------------------------- ฟังก์ชันช่วยทั่วไป -------------------------- */

function getSpreadsheet_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function getTimeZone_() { return getSpreadsheet_().getSpreadsheetTimeZone(); }

function getTimestamp_() {
  return Utilities.formatDate(new Date(), getTimeZone_(), 'yyyy-MM-dd HH:mm:ss');
}

function formatDate_(d) {
  if (!d) return '';
  const x = parseDateValue_(d);
  return x ? Utilities.formatDate(x, getTimeZone_(), 'yyyy-MM-dd') : String(d);
}

function parseDateValue_(v) {
  if (!v && v !== 0) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }
  const m = String(v).match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const m2 = String(v).match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m2) return new Date(Number(m2[3]), Number(m2[2]) - 1, Number(m2[1]));
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getToday_() {
  const s = Utilities.formatDate(new Date(), getTimeZone_(), 'yyyy/MM/dd');
  return new Date(s + ' 00:00:00');
}

function addDays_(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function toNumber_(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function toText_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Array]') {
    return v.map(function (x) { return toText_(x); }).filter(String).join('; ');
  }
  if (typeof v === 'object') {
    return Object.keys(v).map(function (k) { return toText_(v[k]); }).filter(String).join('; ');
  }
  return String(v);
}

function normalizeSheetKey_(name) {
  const text = String(name || '').trim();
  if (SHEET_SCHEMAS[text]) return text;
  const keys = Object.keys(SHEET_SCHEMAS);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const property = key === 'DAILY_DATA' ? 'DAILY_DATA' : key === 'WEEKLY_METRICS' ? 'WEEKLY_METRICS' :
      key === 'AI_REPORTS' ? 'AI_REPORTS' : key === 'AUDIT_LOG' ? 'AUDIT_LOG' : key;
    if (SHEETS[property] === text) return key;
  }
  return text;
}

function getSheetName_(canonical) {
  const property = canonical === 'DAILY_DATA' ? 'DAILY_DATA' : canonical === 'WEEKLY_METRICS' ? 'WEEKLY_METRICS' :
    canonical === 'AI_REPORTS' ? 'AI_REPORTS' : canonical === 'AUDIT_LOG' ? 'AUDIT_LOG' : canonical;
  return SHEETS[property] || canonical;
}

function getFieldLabel_(canonical) { return FIELD_LABELS[canonical] || canonical; }

function normalizeFieldKey_(visible) {
  const text = String(visible || '').trim();
  if (FIELD_LABELS[text]) return text;
  const keys = Object.keys(FIELD_LABELS);
  for (let i = 0; i < keys.length; i++) {
    if (FIELD_LABELS[keys[i]] === text) return keys[i];
  }
  const normalized = text.toUpperCase().replace(/\s+/g, '_');
  return FIELD_LABELS[normalized] ? normalized : text;
}

function normalizeStatusKey_(visible) {
  const text = String(visible || '').trim();
  const upper = text.toUpperCase();
  if (STATUS_LABELS[upper]) return upper;
  const keys = Object.keys(STATUS_LABELS);
  for (let i = 0; i < keys.length; i++) {
    if (STATUS_LABELS[keys[i]] === text) return keys[i];
  }
  return upper;
}

function getStatusLabel_(canonical) {
  const key = normalizeStatusKey_(canonical);
  return STATUS_LABELS[key] || String(canonical === undefined || canonical === null ? '' : canonical);
}

function getDisplayValue_(field, value) {
  return ['STATUS', 'DATA_STATUS', 'RESULT'].indexOf(field) >= 0
    ? getStatusLabel_(value) : value;
}

function normalizeConfigKey_(key) { return CONFIG_KEY_ALIASES[key] || key; }

function getSheet_(name, required) {
  const sh = getSpreadsheet_().getSheetByName(name);
  if (!sh && required !== false) {
    throw new Error('ยังไม่มีชีต “' + name + '” กรุณาเรียกเมนู 1. สร้างโครงสร้างชีตก่อน');
  }
  return sh;
}

/** อ่านข้อมูลรายวันจากไฟล์ลูกค้าที่เชื่อมไว้ หรือจากชีตในไฟล์ปัจจุบัน */
function readDailyData_() {
  const id = String(getConfig_('CUSTOMER_FILE_ID', '')).trim();
  if (!id) return readTable_(SHEETS.DAILY_DATA);

  const sheetName = String(getConfig_('CUSTOMER_SHEET_NAME', SHEETS.DAILY_DATA)).trim();
  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(extractFileId_(id));
  } catch (e) {
    throw new Error('ไม่สามารถเปิดไฟล์ข้อมูลลูกค้าได้ กรุณาตรวจลิงก์และสิทธิ์เข้าถึง รายละเอียด: ' + e.message);
  }
  const sh = spreadsheet.getSheetByName(sheetName);
  if (!sh) {
    throw new Error('ไฟล์ลูกค้าไม่มีชีตชื่อ “' + sheetName + '” กรุณาแก้ค่า CUSTOMER_SHEET_NAME ในชีต “' + SHEETS.CONFIG + '”');
  }

  const fieldCount = Math.max(sh.getLastColumn(), 1);
  const rowCount = sh.getLastRow();
  const title = sh.getRange(1, 1, 1, fieldCount).getValues()[0];
  const h = {};
  title.forEach(function (v, i) {
    const k = normalizeFieldKey_(v);
    if (k) h[k] = i;
  });
  const missingKeys = SHEET_SCHEMAS.DAILY_DATA.filter(function (c) { return h[c] === undefined; });
  if (missingKeys.length) {
    throw new Error('ไฟล์ลูกค้าขาดคอลัมน์: ' + missingKeys.map(getFieldLabel_).join(', ') +
      ' กรุณาส่งเทมเพลต 11 คอลัมน์ให้ลูกค้ากรอกใหม่');
  }
  const rows = rowCount > 1 ? sh.getRange(2, 1, rowCount - 1, fieldCount).getValues() : [];
  return { sh: sh, h: h, rows: rows, sheetName: sheetName, canonicalName: 'DAILY_DATA', fromCustomerFile: true, fileName: spreadsheet.getName() };
}

/** รับได้ทั้งรหัสไฟล์และลิงก์ Google Sheets แบบเต็ม */
function extractFileId_(v) {
  const m = String(v).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : String(v).trim();
}

function readTable_(name) {
  const sh = getSheet_(name);
  const canonicalName = normalizeSheetKey_(name);
  const fieldCount = Math.max(sh.getLastColumn(), 1);
  const rowCount = sh.getLastRow();
  const title = sh.getRange(1, 1, 1, fieldCount).getValues()[0];
  const h = {};
  title.forEach(function (v, i) { const key = normalizeFieldKey_(v); if (key) h[key] = i; });
  const rows = rowCount > 1 ? sh.getRange(2, 1, rowCount - 1, fieldCount).getValues() : [];
  ['STATUS', 'DATA_STATUS', 'RESULT'].forEach(function (field) {
    if (h[field] === undefined) return;
    rows.forEach(function (row) { row[h[field]] = normalizeStatusKey_(row[h[field]]); });
  });
  return { sh: sh, h: h, rows: rows, sheetName: name, canonicalName: canonicalName };
}

function writeCell_(b, tableRowIndex, field, value) {
  const protectedFields = HUMAN_ONLY_FIELDS[b.canonicalName] || [];
  if (protectedFields.indexOf(field) >= 0) {
    throw new Error('คอลัมน์ “' + getFieldLabel_(field) + '” ในชีต “' + b.sheetName + '” ให้มนุษย์กรอกเท่านั้น');
  }
  if (b.h[field] === undefined) throw new Error('ชีต “' + b.sheetName + '” ไม่มีคอลัมน์ “' + getFieldLabel_(field) + '”');
  b.sh.getRange(tableRowIndex + 2, b.h[field] + 1).setValue(getDisplayValue_(field, value));
  b.rows[tableRowIndex][b.h[field]] = value;
}

function appendObjectRow_(sheetName, obj) {
  const sh = getSheet_(sheetName);
  const title = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const canonicalName = normalizeSheetKey_(sheetName);
  const protectedFields = HUMAN_ONLY_FIELDS[canonicalName] || [];
  protectedFields.forEach(function (c) {
    if (obj[c] !== undefined && obj[c] !== '') {
      throw new Error('คอลัมน์ “' + getFieldLabel_(c) + '” ในชีต “' + sheetName + '” ให้มนุษย์กรอกเท่านั้น');
    }
  });
  sh.appendRow(title.map(function (t) {
    const k = normalizeFieldKey_(t);
    return obj[k] === undefined ? '' : getDisplayValue_(k, obj[k]);
  }));
  return sh.getLastRow();
}

/** บันทึกเหตุการณ์ได้ทั้งจากเมนูและทริกเกอร์ที่ทำงานเบื้องหลัง */
function writeAuditLog_(step, reportingPeriod, result, details, reportId) {
  const sh = getSheet_(SHEETS.AUDIT_LOG, false);
  if (!sh) return;
  let actor = '';
  try { actor = Session.getActiveUser().getEmail(); } catch (e) { actor = 'ทริกเกอร์อัตโนมัติ'; }
  appendObjectRow_(SHEETS.AUDIT_LOG, {
    TIMESTAMP: getTimestamp_(), STEP: step, REPORTING_PERIOD: reportingPeriod || '', RESULT: result,
    DETAILS: String(details).slice(0, 5000), REPORT_ID: reportId || '', ACTOR: actor
  });
}

function isValidEmail_(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}

function showNotice_(title, message) {
  SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ------------------------------- การตั้งค่า ------------------------------- */

var _configCache = null;

function getConfig_(key, defaultValue) {
  const canonical = normalizeConfigKey_(key);
  if (!_configCache) {
    const b = readTable_(SHEETS.CONFIG);
    _configCache = {};
    b.rows.forEach(function (r) {
      const k = String(r[b.h.KEY] || '').trim();
      if (k) _configCache[k] = r[b.h.VALUE];
    });
  }
  const v = _configCache[canonical] !== undefined ? _configCache[canonical] : _configCache[key];
  if (v === undefined || v === null || String(v).trim() === '') return defaultValue;
  return v;
}

function setConfig_(key, value, description) {
  const canonical = normalizeConfigKey_(key);
  const b = readTable_(SHEETS.CONFIG);
  for (let i = 0; i < b.rows.length; i++) {
    const existing = String(b.rows[i][b.h.KEY]).trim();
    if (existing === canonical || existing === key) {
      if (existing !== canonical) b.sh.getRange(i + 2, b.h.KEY + 1).setValue(canonical);
      b.sh.getRange(i + 2, b.h.VALUE + 1).setValue(value);
      _configCache = null;
      return;
    }
  }
  b.sh.appendRow([canonical, value, description || '']);
  _configCache = null;
}

/* -------------------------- รอบรายงานรายสัปดาห์ ------------------------- */

/** แปลงค่ารอบรายงานให้เป็นข้อความรูปแบบเดียวกันก่อนนำไปใช้ */
function getReportingPeriodValue_() {
  const v = getConfig_('REPORTING_PERIOD', 'CURRENT_WEEK');
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, getTimeZone_(), 'yyyy-MM-dd');
  }
  const text = String(v).trim();
  if (text === 'สัปดาห์ปัจจุบัน') return 'CURRENT_WEEK';
  if (text === 'สัปดาห์ก่อน') return 'PREVIOUS_WEEK';
  return text;
}

/** อ่านวันที่รูปแบบ yyyy-MM-dd และคืนค่า null เมื่อรูปแบบหรือวันที่ไม่ถูกต้อง */
function parseIsoDate_(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text).trim());
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), date = Number(m[3]);
  const d = new Date(year, month - 1, date);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== date) return null;
  return d;
}

/** รอบรายงานเริ่มวันจันทร์และสิ้นสุดวันอาทิตย์ตามเขตเวลาของสเปรดชีต */
function getReportingPeriod_(anchor) {
  const value = getReportingPeriodValue_();
  let baseDate;
  let usePreviousWeek = false;

  if (anchor) {
    baseDate = parseDateValue_(anchor);
    if (!baseDate) throw new Error('ไม่สามารถอ่านวันที่อ้างอิงได้: ' + anchor);
  } else {
    const fixedDate = parseIsoDate_(value);
    if (fixedDate) {
      baseDate = fixedDate;
    } else if (value === 'CURRENT_WEEK' || value === 'PREVIOUS_WEEK') {
      baseDate = getToday_();
      usePreviousWeek = (value === 'PREVIOUS_WEEK');
    } else {
      throw new Error('ค่า REPORTING_PERIOD ในชีต “' + SHEETS.CONFIG + '” คือ “' + value +
        '” กรุณาใช้ “สัปดาห์ปัจจุบัน”, “สัปดาห์ก่อน” หรือวันที่รูปแบบ yyyy-MM-dd เช่น 2026-08-10');
    }
  }

  const dayOfWeek = baseDate.getDay(); // 0 คือวันอาทิตย์
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  let startDate = addDays_(baseDate, -daysFromMonday);
  if (usePreviousWeek) startDate = addDays_(startDate, -7);
  const endDate = addDays_(startDate, 6);
  return { startDate: startDate, endDate: endDate, id: getWeekId_(startDate) };
}

function getWeekId_(startDate) {
  const year = Utilities.formatDate(startDate, getTimeZone_(), 'yyyy');
  const weekNumber = Utilities.formatDate(startDate, getTimeZone_(), 'ww');
  return 'WEEK-' + year + '-W' + weekNumber;
}

/* ------------------ เมนู 1 — สร้างโครงสร้างชีต -------------------------- */

function setupSystem() {
  const result = buildSheetStructure_();
  writeAuditLog_('1. สร้างโครงสร้างชีต', '', 'OK', result);
  showNotice_('สร้างโครงสร้างชีต', result +
    '\n\nขั้นตอนถัดไป: บันทึก OPENAI_API_KEY ใน Script Properties แล้วเรียกเมนู 6 เพื่อตรวจสอบการเชื่อมต่อ');
}

function buildSheetStructure_() {
  const spreadsheet = getSpreadsheet_();
  spreadsheet.setSpreadsheetTimeZone('Asia/Bangkok');
  try { spreadsheet.setSpreadsheetLocale('th_TH'); } catch (ignoreLocale) {}
  Object.keys(SHEET_SCHEMAS).forEach(function (canonicalName) {
    const name = getSheetName_(canonicalName);
    let sh = spreadsheet.getSheetByName(name);
    if (!sh) sh = spreadsheet.insertSheet(name);
    const field = SHEET_SCHEMAS[canonicalName];
    const currentHeaders = sh.getLastColumn() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (v) { return String(v).trim(); }) : [];
    if (currentHeaders.filter(String).length === 0) {
      sh.getRange(1, 1, 1, field.length).setValues([field.map(getFieldLabel_)]);
    } else {
      field.forEach(function (canonical) {
        const label = getFieldLabel_(canonical);
        const labelIndex = currentHeaders.indexOf(label);
        const legacyIndex = currentHeaders.indexOf(canonical);
        if (labelIndex < 0 && legacyIndex >= 0) {
          sh.getRange(1, legacyIndex + 1).setValue(label);
          currentHeaders[legacyIndex] = label;
        } else if (labelIndex < 0 && legacyIndex < 0) {
          currentHeaders.push(label);
          sh.getRange(1, currentHeaders.length).setValue(label);
        }
      });
    }
    sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), field.length))
      .setFontWeight('bold').setBackground('#144080').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  });

  const bb = readTable_(SHEETS.AI_REPORTS);
  if (bb.h.STATUS !== undefined) {
    const visibleValues = REPORT_STATUS_KEYS.map(getStatusLabel_);
    const range = bb.sh.getRange(2, bb.h.STATUS + 1, Math.max(bb.sh.getMaxRows() - 1, 1));
    const existing = range.getValues();
    let changed = false;
    existing.forEach(function (row) {
      const current = String(row[0] || '').trim();
      if (!current) return;
      const canonical = normalizeStatusKey_(current);
      if (REPORT_STATUS_KEYS.indexOf(canonical) < 0) return;
      const localized = getStatusLabel_(canonical);
      if (current !== localized) { row[0] = localized; changed = true; }
    });
    if (changed) range.setValues(existing);
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(visibleValues, true)
      .setAllowInvalid(false).build();
    range.setDataValidation(rule);
  }

  seedDefaultConfig_();
  normalizeStatusValues_();
  return 'ตรวจสอบและสร้างชีตภาษาไทยครบ ' + Object.keys(SHEET_SCHEMAS).length + ' ชีต พร้อมการตั้งค่าเริ่มต้นแล้ว';
}

function normalizeStatusValues_() {
  [[SHEETS.AI_REPORTS, 'STATUS'], [SHEETS.WEEKLY_METRICS, 'DATA_STATUS'], [SHEETS.AUDIT_LOG, 'RESULT']]
    .forEach(function (definition) {
      const b = readTable_(definition[0]);
      const field = definition[1];
      if (b.h[field] === undefined || !b.rows.length) return;
      const range = b.sh.getRange(2, b.h[field] + 1, b.rows.length, 1);
      const values = range.getValues();
      let changed = false;
      values.forEach(function (row) {
        const current = String(row[0] || '').trim();
        if (!current) return;
        const canonical = normalizeStatusKey_(current);
        if (!STATUS_LABELS[canonical]) return;
        const localized = getStatusLabel_(canonical);
        if (current !== localized) { row[0] = localized; changed = true; }
      });
      if (changed) range.setValues(values);
    });
}

function seedDefaultConfig_() {
  const defaultValue = [
    ['BUSINESS_NAME', '', 'ชื่อธุรกิจที่แสดงในหัวเรื่องอีเมล'],
    ['CUSTOMER_FILE_ID', '', 'รหัสหรือลิงก์ Google Sheets ของลูกค้า เว้นว่างเพื่ออ่านชีต “ข้อมูลรายวัน” ในไฟล์นี้'],
    ['CUSTOMER_SHEET_NAME', SHEETS.DAILY_DATA, 'ชื่อชีตข้อมูลรายวันในไฟล์ลูกค้า'],
    ['REPORTING_PERIOD', 'สัปดาห์ปัจจุบัน', 'ใช้ “สัปดาห์ปัจจุบัน”, “สัปดาห์ก่อน” หรือวันที่รูปแบบ yyyy-MM-dd เพื่อเรียกข้อมูลสัปดาห์เก่า'],
    ['WEEKLY_KPI', 400000, 'เป้าหมายเงินรับจริงต่อสัปดาห์ หน่วยเป็นบาท'],
    ['MAX_BLANK_RATE', 5, 'หยุดคำนวณเมื่อสัดส่วนช่องบังคับว่างเกินค่านี้'],
    ['CASH_DROP_ALERT_PERCENT', 5, 'แจ้งเตือนเมื่อเงินรับจริงลดลงเกินเปอร์เซ็นต์นี้เมื่อเทียบสัปดาห์ก่อน'],
    ['CLOSE_RATE_DROP_ALERT_POINTS', 1, 'แจ้งเตือนเมื่ออัตราปิดการขายลดลงเกินจำนวนจุดเปอร์เซ็นต์นี้'],
    ['REPORT_RECIPIENTS', '', 'อีเมลผู้รับรายงาน คั่นด้วยเครื่องหมายจุลภาค'],
    ['MODEL', 'gpt-5.6', 'ชื่อโมเดล OpenAI ที่บัญชีของคุณมีสิทธิ์ใช้'],
    ['MAX_OUTPUT_TOKENS', 4000, 'ความยาวสูงสุดของคำตอบ AI เพิ่มเมื่อเนื้อหาถูกตัด'],
    ['EMAIL_LIMIT_PER_RUN', 20, 'จำนวนผู้รับสูงสุดต่อการทำงานหนึ่งครั้ง ระบบจำกัดไม่เกิน 20'],

    ['SYSTEM_PROMPT',
      'คุณเขียนความคิดเห็นประกอบรายงานยอดขายรายสัปดาห์สำหรับธุรกิจขนาดเล็ก\n' +
      'ใช้เฉพาะตัวชี้วัดที่ระบบคำนวณให้ ห้ามคำนวณใหม่ บวก ลบ หรือสร้างตัวเลขเพิ่ม\n' +
      'ห้ามระบุชื่อพนักงาน ห้ามประเมินความสามารถรายบุคคล และห้ามเสนอรางวัลหรือบทลงโทษ\n' +
      'หากข้อมูลไม่พอให้ระบุว่าข้อมูลยังไม่เพียงพอ ห้ามเดาสาเหตุ\n' +
      'ตอบเป็นภาษาไทยด้วยน้ำเสียงเป็นกลาง แต่ละส่วนไม่เกิน 5 ประโยค',
      'พรอมต์ระบบสำหรับ AI ในเมนู 4'],

    ['USER_PROMPT',
      'นี่คือตารางตัวชี้วัดที่คำนวณแล้ว พร้อมข้อมูลสัปดาห์ก่อนและเป้าหมาย\n' +
      'ภาพรวม: สรุปสถานการณ์ด้วยตัวเลขที่ให้เท่านั้น\n' +
      'คำเตือน: ระบุตัวชี้วัดที่ลดลงหรือเกินเกณฑ์ พร้อมระดับการเปลี่ยนแปลง\n' +
      'การดำเนินการที่แนะนำ: เสนอสิ่งที่ผู้จัดการควรตรวจสอบในสัปดาห์ถัดไปโดยไม่รับประกันผล\n' +
      'คำถามสำหรับผู้จัดการ: ถามเฉพาะข้อมูลที่ยังขาดและต้องให้ผู้จัดการยืนยัน',
      'พรอมต์ผู้ใช้ที่ส่งพร้อมตัวชี้วัดในเมนู 4'],

    ['EMAIL_SUBJECT_TEMPLATE', 'รายงานยอดขายรายสัปดาห์ {{WEEK_ID}} — {{BUSINESS_NAME}}', 'ตัวแปรที่ใช้ได้: {{WEEK_ID}} และ {{BUSINESS_NAME}}'],
    ['EMAIL_BODY_TEMPLATE',
      'เรียนผู้รับรายงาน\n\nนี่คือรายงานยอดขายรายสัปดาห์ตั้งแต่ {{FROM_DATE}} ถึง {{TO_DATE}} ซึ่งผู้จัดการตรวจและอนุมัติแล้ว\n\n' +
      'ตัวชี้วัดรายสัปดาห์\n{{KPI_TABLE}}\n\n' +
      'ภาพรวม\n{{OVERVIEW}}\n\n' +
      'คำเตือน\n{{WARNINGS}}\n\n' +
      'การดำเนินการที่แนะนำ\n{{RECOMMENDED_ACTIONS}}\n\n' +
      'คำถามสำหรับผู้จัดการ\n{{MANAGER_QUESTIONS}}\n\n' +
      'ความคิดเห็นจัดทำโดย AI จากตัวชี้วัดที่ระบบคำนวณ และผ่านการตรวจอนุมัติจากผู้จัดการแล้ว\n\n' +
      'รหัสรายงาน: {{REPORT_ID}}',
      'เนื้อหาอีเมลที่ส่งให้ผู้รับ']
  ];

  const b = readTable_(SHEETS.CONFIG);
  const defaultsByKey = {};
  defaultValue.forEach(function (row) { defaultsByKey[row[0]] = row; });
  const hasCustomerFile = b.rows.some(function (row) {
    const key = normalizeConfigKey_(String(row[b.h.KEY] || '').trim());
    return key === 'CUSTOMER_FILE_ID' && String(row[b.h.VALUE] || '').trim() !== '';
  });
  const existing = {};
  b.rows.forEach(function (r, i) {
    const legacy = String(r[b.h.KEY] || '').trim();
    const canonical = normalizeConfigKey_(legacy);
    if (legacy && legacy !== canonical) b.sh.getRange(i + 2, b.h.KEY + 1).setValue(canonical);
    const defaultRow = defaultsByKey[canonical];
    const currentValue = String(r[b.h.VALUE] === undefined || r[b.h.VALUE] === null ? '' : r[b.h.VALUE]);
    if (defaultRow && b.h.DESCRIPTION !== undefined) b.sh.getRange(i + 2, b.h.DESCRIPTION + 1).setValue(defaultRow[2]);
    if (canonical === 'WEEKLY_KPI' && legacy === 'WEEKLY_KPI' && Number(currentValue) === 400000000) {
      b.sh.getRange(i + 2, b.h.VALUE + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'REPORTING_PERIOD') {
      const current = currentValue.trim();
      if (current === 'CURRENT_WEEK') b.sh.getRange(i + 2, b.h.VALUE + 1).setValue('สัปดาห์ปัจจุบัน');
      if (current === 'PREVIOUS_WEEK') b.sh.getRange(i + 2, b.h.VALUE + 1).setValue('สัปดาห์ก่อน');
    }
    if (!hasCustomerFile && canonical === 'CUSTOMER_SHEET_NAME' && String(r[b.h.VALUE] || '').trim() === 'DAILY_DATA') {
      b.sh.getRange(i + 2, b.h.VALUE + 1).setValue(SHEETS.DAILY_DATA);
    }
    if (canonical) existing[canonical] = true;
  });
  const missingDefaults = defaultValue.filter(function (d) { return !existing[d[0]]; });
  if (missingDefaults.length) b.sh.getRange(b.sh.getLastRow() + 1, 1, missingDefaults.length, 3).setValues(missingDefaults);
  b.sh.setColumnWidth(1, 230);
  b.sh.setColumnWidth(2, 560);
  b.sh.setColumnWidth(3, 320);
  _configCache = null;
}

/* ---------------- เมนู 2 — ตรวจสอบข้อมูลรายสัปดาห์ ---------------------- */

function validateWeeklyData() {
  const period = getReportingPeriod_();
  const result = validateData_(period);
  writeAuditLog_('2. ตรวจสอบข้อมูลรายสัปดาห์', period.id, result.passed ? 'OK' : 'NEEDS_DATA_FIX', result.summary);
  showNotice_('ตรวจสอบข้อมูลรายสัปดาห์ ' + period.id, result.summary);
}

/** หยุดเมื่อพนักงานว่าง วันที่ผิดรอบ ตัวเลขติดลบ ข้อมูลซ้ำ หรือช่องบังคับว่างเกินเกณฑ์ */
function validateData_(period) {
  const b = readDailyData_();
  const errors = [];
  const rowsInPeriod = [];
  let blankCellCount = 0, requiredCellCount = 0, outsidePeriod = 0;
  const seen = {};

  b.rows.forEach(function (r, i) {
    const rows = i + 2;
    const date = parseDateValue_(r[b.h.DATE]);
    const hasData = r.some(function (v) { return String(v).trim() !== ''; });
    if (!hasData) return;

    if (!date) { errors.push('แถว ' + rows + ': คอลัมน์ “' + getFieldLabel_('DATE') + '” ว่างหรืออ่านค่าไม่ได้'); return; }
    // ไฟล์อาจเก็บหลายสัปดาห์ แถวจากรอบอื่นจะถูกข้ามเพื่อให้เปรียบเทียบย้อนหลังได้
    if (date.getTime() < period.startDate.getTime() || date.getTime() > period.endDate.getTime()) {
      outsidePeriod++;
      return;
    }
    if (date.getTime() > getToday_().getTime()) {
      errors.push('แถว ' + rows + ': วันที่ ' + formatDate_(date) + ' อยู่ในอนาคต');
      return;
    }
    rowsInPeriod.push(i);

    const employee = String(r[b.h.EMPLOYEE] || '').trim();
    if (!employee) errors.push('แถว ' + rows + ': คอลัมน์ “' + getFieldLabel_('EMPLOYEE') + '” ว่าง');

    const key = formatDate_(date) + '|' + employee.toLowerCase();
    if (employee) {
      if (seen[key]) errors.push('แถว ' + rows + ': ซ้ำกับแถว ' + seen[key] + ' ในคู่วันที่และพนักงาน');
      else seen[key] = rows;
    }

    NUMERIC_FIELDS.forEach(function (c) {
      const v = r[b.h[c]];
      const n = toNumber_(v);
      if (n !== null && n < 0) errors.push('แถว ' + rows + ': คอลัมน์ “' + getFieldLabel_(c) + '” มีค่าติดลบ (' + n + ')');
    });

    REQUIRED_FIELDS.forEach(function (c) {
      requiredCellCount++;
      if (String(r[b.h[c]] === undefined ? '' : r[b.h[c]]).trim() === '') blankCellCount++;
    });
  });

  const blankRateLimit = Number(getConfig_('MAX_BLANK_RATE', 5)) || 5;
  const blankRate = requiredCellCount ? Math.round(blankCellCount / requiredCellCount * 1000) / 10 : 0;
  if (blankRate > blankRateLimit) {
    errors.push('ช่องบังคับว่าง ' + blankRate + '% ซึ่งเกินเกณฑ์ ' + blankRateLimit + '%');
  }
  if (!rowsInPeriod.length) {
    errors.push('ไม่มีข้อมูลในรอบ ' + formatDate_(period.startDate) + ' ถึง ' + formatDate_(period.endDate) +
      (outsidePeriod ? ' ไฟล์มี ' + outsidePeriod + ' แถวจากรอบอื่น' : '') +
      ' กรุณาเปลี่ยน REPORTING_PERIOD ในชีต “' + SHEETS.CONFIG + '” เป็น “สัปดาห์ก่อน” หรือวันที่ yyyy-MM-dd ที่มีข้อมูล');
  }

  const passed = errors.length === 0;
  const summary = passed
    ? ('ข้อมูลผ่านการตรวจสอบ มี ' + rowsInPeriod.length + ' แถวในรอบ ' + formatDate_(period.startDate) + ' ถึง ' +
      formatDate_(period.endDate) + ' และช่องว่าง ' + blankRate + '%' +
      (outsidePeriod ? ' ข้ามข้อมูลจากรอบอื่น ' + outsidePeriod + ' แถว' : ''))
    : (getStatusLabel_('NEEDS_DATA_FIX') + ' — พบข้อผิดพลาด ' + errors.length + ' รายการ:\n' + errors.slice(0, 30).join('\n') +
      (errors.length > 30 ? '\n... ยังมีอีก ' + (errors.length - 30) + ' รายการ โปรดดูชีต “' + SHEETS.AUDIT_LOG + '”' : ''));

  return { passed: passed, errors: errors, rows: rowsInPeriod, blankRate: blankRate, outsidePeriod: outsidePeriod, summary: summary };
}

/* ---------------- เมนู 3 — คำนวณตัวชี้วัดรายสัปดาห์ --------------------- */

function calculateWeeklyMetrics() {
  const period = getReportingPeriod_();
  const result = calculateMetrics_(period);
  writeAuditLog_('3. คำนวณตัวชี้วัดรายสัปดาห์', period.id, result.ok ? 'OK' : 'STOPPED', result.message);
  showNotice_('คำนวณตัวชี้วัดรายสัปดาห์ ' + period.id, result.message);
}

function calculateMetrics_(period, skipPreviousWeek) {
  const validation = validateData_(period);
  if (!validation.passed) {
    writeAuditLog_('3. คำนวณตัวชี้วัดรายสัปดาห์', period.id, 'NEEDS_DATA_FIX', validation.summary);
    return { ok: false, message: 'ยังคำนวณไม่ได้ เนื่องจากข้อมูลไม่ผ่านการตรวจสอบ\n\n' + validation.summary };
  }

  const b = readDailyData_();
  const totals = {};
  NUMERIC_FIELDS.forEach(function (c) { totals[c] = 0; });
  validation.rows.forEach(function (i) {
    NUMERIC_FIELDS.forEach(function (c) { totals[c] += toNumber_(b.rows[i][b.h[c]]) || 0; });
  });

  const calculationWarnings = [];
  function rate(numerator, denominator, name) {
    if (!denominator) {
      calculationWarnings.push('คำนวณ' + name + 'ไม่ได้ เนื่องจากตัวหารเป็นศูนย์');
      return '';
    }
    return Math.round(numerator / denominator * 1000) / 10;
  }

  const contactRate = rate(totals.CONTACTED_LEADS, totals.NEW_LEADS, 'อัตราการติดต่อ');
  const closeRate = rate(totals.SUCCESSFUL_ORDERS, totals.CONTACTED_LEADS, 'อัตราปิดการขาย');
  const cancellationRate = rate(totals.CANCELLED_ORDERS, totals.SUCCESSFUL_ORDERS, 'อัตรายกเลิก');
  const returnRate = rate(totals.RETURNED_ORDERS, totals.SUCCESSFUL_ORDERS, 'อัตราคืนสินค้า');
  const kpi = Number(getConfig_('WEEKLY_KPI', 0)) || 0;
  const kpiAchievement = kpi ? Math.round(totals.CASH_COLLECTED / kpi * 1000) / 10 : '';
  if (!kpi) calculationWarnings.push('ยังไม่ได้กำหนด WEEKLY_KPI ในชีต “' + SHEETS.CONFIG + '” จึงคำนวณเปอร์เซ็นต์เทียบเป้าหมายไม่ได้');

  // อ่านสัปดาห์ก่อนจากชีตตัวชี้วัด หากยังไม่มีให้คำนวณจากข้อมูลรายวัน
  const previousPeriod = {
    startDate: addDays_(period.startDate, -7),
    endDate: addDays_(period.endDate, -7),
    id: getWeekId_(addDays_(period.startDate, -7))
  };
  let previous = readMetricsRow_(previousPeriod.id);
  if (!previous && !skipPreviousWeek) {
    const previousResult = calculateMetrics_(previousPeriod, true);
    if (previousResult.ok) previous = readMetricsRow_(previousPeriod.id);
  }
  const comparison = previous ? comparePreviousWeek_(totals, closeRate, previous)
    : 'ยังไม่มีข้อมูลสัปดาห์ก่อนสำหรับเปรียบเทียบ';

  const obj = {
    WEEK_ID: period.id,
    FROM_DATE: formatDate_(period.startDate),
    TO_DATE: formatDate_(period.endDate),
    CONTACT_RATE: contactRate,
    CLOSE_RATE: closeRate,
    CANCELLATION_RATE: cancellationRate,
    RETURN_RATE: returnRate,
    WEEKLY_KPI: kpi,
    KPI_ACHIEVEMENT: kpiAchievement,
    WEEK_OVER_WEEK: comparison,
    DATA_STATUS: 'PASSED',
    CALCULATED_AT: getTimestamp_()
  };
  NUMERIC_FIELDS.forEach(function (c) { obj[c] = totals[c]; });

  upsertMetrics_(obj);
  const message = 'คำนวณสัปดาห์ ' + period.id + ' เรียบร้อยแล้ว\n' +
    'เงินรับจริง ' + totals.CASH_COLLECTED.toLocaleString('th-TH') + ' บาท อัตราปิดการขาย ' + closeRate + '%\n' +
    comparison + (calculationWarnings.length ? '\n\nหมายเหตุ:\n' + calculationWarnings.join('\n') : '');
  return { ok: true, message: message, metrics: obj };
}

function readMetricsRow_(weekId) {
  const b = readTable_(SHEETS.WEEKLY_METRICS);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.WEEK_ID]).trim() === weekId) {
      const o = {};
      Object.keys(b.h).forEach(function (c) { o[c] = b.rows[i][b.h[c]]; });
      o._rowIndex = i;
      return o;
    }
  }
  return null;
}

function comparePreviousWeek_(totals, closeRate, previous) {
  const part = [];
  function delta(currentValue, previousValue, name, suffix) {
    const t = toNumber_(previousValue);
    if (t === null || t === 0) return;
    const change = Math.round((currentValue - t) / t * 1000) / 10;
    part.push(name + ' ' + (change >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(change) + '%' + (suffix || ''));
  }
  delta(totals.NEW_LEADS, previous.NEW_LEADS, 'ลูกค้าเป้าหมายใหม่');
  delta(totals.SUCCESSFUL_ORDERS, previous.SUCCESSFUL_ORDERS, 'คำสั่งซื้อสำเร็จ');
  delta(totals.CASH_COLLECTED, previous.CASH_COLLECTED, 'เงินรับจริง');
  const previousCloseRate = toNumber_(previous.CLOSE_RATE);
  if (previousCloseRate !== null && closeRate !== '') {
    const d = Math.round((closeRate - previousCloseRate) * 10) / 10;
    part.push('อัตราปิดการขาย' + (d >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(d) + ' จุดเปอร์เซ็นต์');
  }
  return 'เทียบกับสัปดาห์ก่อน: ' + part.join('; ');
}

function upsertMetrics_(obj) {
  const b = readTable_(SHEETS.WEEKLY_METRICS);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.WEEK_ID]).trim() === obj.WEEK_ID) {
      Object.keys(obj).forEach(function (c) {
        if (b.h[c] !== undefined) b.sh.getRange(i + 2, b.h[c] + 1).setValue(getDisplayValue_(c, obj[c]));
      });
      return;
    }
  }
  appendObjectRow_(SHEETS.WEEKLY_METRICS, obj);
}

/* ------------------- เมนู 4 — สร้างความเห็นด้วย AI ---------------------- */

function generateAIReport() {
  const period = getReportingPeriod_();
  const result = createAIReport_(period);
  showNotice_('สร้างความเห็นด้วย AI — ' + period.id, result.message);
}

function createAIReport_(period) {
  const metrics = readMetricsRow_(period.id);
  if (!metrics) {
    return { ok: false, message: 'ยังไม่มีตัวชี้วัดสำหรับ ' + period.id + ' กรุณาเรียกเมนู 3 ก่อน' };
  }
  if (readReport_(period.id)) {
    return { ok: false, message: 'สัปดาห์ ' + period.id + ' มีรายงานแล้ว หากต้องการสร้างใหม่ให้ลบแถวเดิมในชีต “' + SHEETS.AI_REPORTS + '” ก่อน' };
  }

  const previous = readMetricsRow_(getWeekId_(addDays_(period.startDate, -7)));
  const requestData = {
    week_id: period.id,
    from_date: formatDate_(period.startDate),
    to_date: formatDate_(period.endDate),
    current_week_metrics: summarizeMetrics_(metrics),
    previous_week_metrics: previous ? summarizeMetrics_(previous) : null,
    weekly_target: metrics.WEEKLY_KPI,
    target_achievement_percent: metrics.KPI_ACHIEVEMENT,
    calculated_comparison: metrics.WEEK_OVER_WEEK,
    alert_thresholds: {
      cash_drop_percent: Number(getConfig_('CASH_DROP_ALERT_PERCENT', 5)),
      close_rate_drop_points: Number(getConfig_('CLOSE_RATE_DROP_ALERT_POINTS', 1))
    }
  };

  const reportId = createReportId_();
  let result;
  try {
    result = callOpenAI_(
      toText_(getConfig_('SYSTEM_PROMPT', '')),
      toText_(getConfig_('USER_PROMPT', '')) + '\n\nข้อมูลที่ผ่านการคำนวณ:\n' + JSON.stringify(requestData)
    );
  } catch (e) {
    appendObjectRow_(SHEETS.AI_REPORTS, {
      REPORT_ID: reportId, WEEK_ID: period.id, CREATED_AT: getTimestamp_(),
      STATUS: 'ERROR', RAW_JSON: e.message
    });
    writeAuditLog_('4. สร้างความเห็นด้วย AI', period.id, 'ERROR', e.message, reportId);
    return {
      ok: false, message: 'เรียก AI ไม่สำเร็จ: ' + e.message +
        '\n\nตัวชี้วัดเดิมยังอยู่ คุณสามารถเขียนความคิดเห็นทั้ง 4 ส่วนด้วยตนเอง แล้วเปลี่ยนสถานะเป็น “' + getStatusLabel_('PENDING_APPROVAL') + '”'
    };
  }

  if (!result.ok) {
    appendObjectRow_(SHEETS.AI_REPORTS, {
      REPORT_ID: reportId, WEEK_ID: period.id, CREATED_AT: getTimestamp_(),
      STATUS: 'ERROR', RAW_JSON: String(result.rawText).slice(0, 45000)
    });
    writeAuditLog_('4. สร้างความเห็นด้วย AI', period.id, 'INVALID_FORMAT', 'ดูข้อความในคอลัมน์ “' + getFieldLabel_('RAW_JSON') + '”', reportId);
    return {
      ok: false, message: 'AI ส่งคำตอบว่างหรือรูปแบบไม่ถูกต้อง ระบบบันทึกคำตอบเดิมไว้ในคอลัมน์ “' + getFieldLabel_('RAW_JSON') + '” แล้ว' +
        '\n\nหากคำตอบถูกตัด ให้เพิ่มค่า MAX_OUTPUT_TOKENS ในชีต “' + SHEETS.CONFIG + '”'
    };
  }

  appendObjectRow_(SHEETS.AI_REPORTS, {
    REPORT_ID: reportId,
    WEEK_ID: period.id,
    CREATED_AT: getTimestamp_(),
    OVERVIEW: toText_(result.data.OVERVIEW),
    WARNINGS: toText_(result.data.WARNINGS),
    RECOMMENDED_ACTIONS: toText_(result.data.RECOMMENDED_ACTIONS),
    MANAGER_QUESTIONS: toText_(result.data.MANAGER_QUESTIONS),
    STATUS: 'PENDING_APPROVAL',
    RECIPIENTS: toText_(getConfig_('REPORT_RECIPIENTS', ''))
  });
  writeAuditLog_('4. สร้างความเห็นด้วย AI', period.id, 'OK', 'สร้างร่างรายงานแล้ว', reportId);

  return {
    ok: true, reportId: reportId,
    message: 'สร้างร่าง ' + reportId + ' แล้ว สถานะ “' + getStatusLabel_('PENDING_APPROVAL') + '”\n\n' +
      'ขั้นตอนถัดไป: อ่านความคิดเห็นทั้ง 4 ส่วน แก้ไขเมื่อจำเป็น แล้วกรอก “' + getFieldLabel_('APPROVED_BY') +
      '” และ “' + getFieldLabel_('APPROVED_AT') + '” ก่อนเปลี่ยน “' + getFieldLabel_('STATUS') + '” เป็น “' +
      getStatusLabel_('APPROVED_TO_SEND') + '” ระบบจะไม่อนุมัติแทนคุณ'
  };
}

function summarizeMetrics_(c) {
  return {
    new_leads: c.NEW_LEADS, contacted_leads: c.CONTACTED_LEADS, appointments: c.APPOINTMENTS,
    successful_orders: c.SUCCESSFUL_ORDERS, recorded_sales_thb: c.RECORDED_REVENUE,
    cash_received_thb: c.CASH_COLLECTED, cancelled_orders: c.CANCELLED_ORDERS, returned_orders: c.RETURNED_ORDERS,
    contact_rate_percent: c.CONTACT_RATE, close_rate_percent: c.CLOSE_RATE,
    cancellation_rate_percent: c.CANCELLATION_RATE, return_rate_percent: c.RETURN_RATE
  };
}

function createReportId_() {
  const b = readTable_(SHEETS.AI_REPORTS);
  let max = 0;
  b.rows.forEach(function (r) {
    const m = String(r[b.h.REPORT_ID] || '').match(/^BC-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'BC-' + Utilities.formatString('%04d', max + 1);
}

function readReport_(weekId) {
  const b = readTable_(SHEETS.AI_REPORTS);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.WEEK_ID]).trim() === weekId) {
      const o = {};
      Object.keys(b.h).forEach(function (c) { o[c] = b.rows[i][b.h[c]]; });
      o._rowIndex = i;
      return o;
    }
  }
  return null;
}

/* -------------------------- OPENAI API ---------------------------------- */

function getApiKey_() {
  const k = PropertiesService.getScriptProperties().getProperty(API_KEY_PROPERTY);
  if (!k) {
    throw new Error('ยังไม่มี API key กรุณาไปที่การตั้งค่าโปรเจกต์ → Script Properties แล้วเพิ่ม ' + API_KEY_PROPERTY);
  }
  return k;
}

function describeApiError_(id, body) {
  if (id === 401) return 'ข้อผิดพลาด 401: API key ไม่ถูกต้องหรือถูกเพิกถอนแล้ว';
  if (id === 429) return 'ข้อผิดพลาด 429: โควตาหมดหรือเรียกถี่เกินไป กรุณาตรวจ Billing ของ OpenAI';
  if (id === 404) return 'ข้อผิดพลาด 404: ชื่อโมเดลไม่ถูกต้อง กรุณาตรวจค่า MODEL ในชีต “' + SHEETS.CONFIG + '”';
  if (id === 400) return 'ข้อผิดพลาด 400: โครงสร้างคำขอไม่ถูกต้อง ' + String(body).slice(0, 400);
  return 'ข้อผิดพลาด HTTP ' + id + ': ' + String(body).slice(0, 400);
}

/** โครงสร้างผลลัพธ์ 4 ส่วน ทุกส่วนจำเป็นและไม่อนุญาตฟิลด์เพิ่มเติม */
function getReportSchema_() {
  return {
    type: 'object',
    properties: {
      OVERVIEW: { type: 'string' },
      WARNINGS: { type: 'string' },
      RECOMMENDED_ACTIONS: { type: 'string' },
      MANAGER_QUESTIONS: { type: 'string' }
    },
    required: ['OVERVIEW', 'WARNINGS', 'RECOMMENDED_ACTIONS', 'MANAGER_QUESTIONS'],
    additionalProperties: false
  };
}

/** เรียก OpenAI Responses API และบังคับผลลัพธ์ตาม JSON schema */
function callOpenAI_(systemPrompt, userPrompt) {
  const key = getApiKey_();
  const payload = {
    model: String(getConfig_('MODEL', 'gpt-5.6')).trim(),
    input: [
      { role: 'system', content: String(systemPrompt || '') },
      { role: 'user', content: String(userPrompt || '') }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'weekly_sales_commentary',
        strict: true,
        schema: getReportSchema_()
      }
    },
    max_output_tokens: Math.max(4000, Number(getConfig_('MAX_OUTPUT_TOKENS', 4000)) || 4000)
  };

  const res = UrlFetchApp.fetch(OPENAI_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const id = res.getResponseCode();
  const body = res.getContentText();
  if (id !== 200) throw new Error(describeApiError_(id, body));

  const data = JSON.parse(body);
  if (data.status === 'incomplete') {
    return {
      ok: false, data: null,
      rawText: 'คำตอบถูกตัดเพราะถึงขีดจำกัด โปรดเพิ่ม MAX_OUTPUT_TOKENS ในชีต “' + SHEETS.CONFIG + '”\n' + body
    };
  }

  const responseText = extractResponseText_(data);
  if (!responseText) return { ok: false, data: null, rawText: body };

  try {
    return { ok: true, data: JSON.parse(responseText), rawText: responseText };
  } catch (e) {
    return { ok: false, data: null, rawText: responseText };
  }
}

/** อ่านข้อความจากผลลัพธ์ทุกส่วน เพราะโมเดลที่มีการให้เหตุผลอาจไม่ตอบในรายการแรก */
function extractResponseText_(data) {
  if (data && typeof data.output_text === 'string' && data.output_text) return data.output_text;
  const items = (data && data.output) || [];
  for (let i = 0; i < items.length; i++) {
    const part = items[i];
    if (!part || part.type !== 'message' || !part.content) continue;
    for (let j = 0; j < part.content.length; j++) {
      const c = part.content[j];
      if (c && c.type === 'output_text' && c.text) return c.text;
    }
  }
  return '';
}

/* ---------------- เมนู 5 — ส่งรายงานที่อนุมัติแล้ว ---------------------- */

function sendApprovedReport() {
  const result = sendApprovedReport_();
  showNotice_('ส่งรายงานที่อนุมัติแล้ว', result.message);
}

function sendApprovedReport_(requestedReportId) {
  const b = readTable_(SHEETS.AI_REPORTS);
  const limit = Math.min(20, Number(getConfig_('EMAIL_LIMIT_PER_RUN', 20)) || 20);
  const messages = [];
  let sentCount = 0;

  for (let i = 0; i < b.rows.length; i++) {
    const id = String(b.rows[i][b.h.REPORT_ID] || '').trim();
    if (!id) continue;
    if (requestedReportId && id !== requestedReportId) continue;

    const statusKey = String(b.rows[i][b.h.STATUS] || '').trim();
    if (statusKey !== 'APPROVED_TO_SEND') {
      if (requestedReportId) {
        return { ok: false, message: id + ': สถานะปัจจุบันคือ “' + (statusKey ? getStatusLabel_(statusKey) : 'ว่าง') +
          '” ส่งได้เฉพาะสถานะ “' + getStatusLabel_('APPROVED_TO_SEND') + '”' };
      }
      continue;
    }
    if (String(b.rows[i][b.h.SENT_AT] || '').trim()) {
      messages.push(id + ': ส่งไปแล้ว ระบบจึงไม่ส่งซ้ำ');
      continue;
    }
    if (!String(b.rows[i][b.h.APPROVED_BY] || '').trim()) {
      messages.push(id + ': ยังไม่ได้กรอก “' + getFieldLabel_('APPROVED_BY') + '” จึงยังไม่ส่ง');
      continue;
    }
    if (sentCount >= limit) { messages.push('ถึงขีดจำกัด ' + limit + ' รายงานต่อรอบแล้ว ระบบหยุดส่ง'); break; }

    const recipientList = String(b.rows[i][b.h.RECIPIENTS] || getConfig_('REPORT_RECIPIENTS', ''))
      .split(',').map(function (s) { return s.trim(); }).filter(String);
    const invalid = recipientList.filter(function (e) { return !isValidEmail_(e); });
    if (!recipientList.length || invalid.length) {
      messages.push(id + ': อีเมลผู้รับว่างหรือรูปแบบไม่ถูกต้อง (' + invalid.join(', ') + ') จึงยังไม่ส่ง');
      writeAuditLog_('5. ส่งรายงาน', String(b.rows[i][b.h.WEEK_ID]), 'WARNING', 'อีเมลไม่ถูกต้อง: ' + invalid.join(', '), id);
      continue;
    }

    const weekId = String(b.rows[i][b.h.WEEK_ID]).trim();
    const metrics = readMetricsRow_(weekId) || {};
    const message = buildEmailContent_(b, i, metrics);

    MailApp.sendEmail(recipientList.join(','), message.title, message.body);
    b.sh.getRange(i + 2, b.h.STATUS + 1).setValue(getStatusLabel_('SENT'));
    b.sh.getRange(i + 2, b.h.SENT_AT + 1).setValue(getTimestamp_());
    writeAuditLog_('5. ส่งรายงาน', weekId, 'OK', 'ส่งให้ ' + recipientList.join(', '), id);
    messages.push(id + ': ส่งให้ ' + recipientList.join(', ') + ' แล้ว');
    sentCount++;
  }

  if (!messages.length) {
    return { ok: false, message: 'ไม่มีรายงานที่มีสถานะ “' + getStatusLabel_('APPROVED_TO_SEND') +
      '”\n\nระบบจะส่งรายงานหลังจากคุณตรวจและอนุมัติด้วยตนเองเท่านั้น' };
  }
  return { ok: true, message: messages.join('\n') };
}

function buildEmailContent_(b, i, metrics) {
  const replacements = {
    '{{REPORT_ID}}': String(b.rows[i][b.h.REPORT_ID] || ''),
    '{{WEEK_ID}}': String(b.rows[i][b.h.WEEK_ID] || ''),
    '{{BUSINESS_NAME}}': toText_(getConfig_('BUSINESS_NAME', '')),
    '{{FROM_DATE}}': formatDate_(metrics.FROM_DATE),
    '{{TO_DATE}}': formatDate_(metrics.TO_DATE),
    '{{OVERVIEW}}': String(b.rows[i][b.h.OVERVIEW] || ''),
    '{{WARNINGS}}': String(b.rows[i][b.h.WARNINGS] || ''),
    '{{RECOMMENDED_ACTIONS}}': String(b.rows[i][b.h.RECOMMENDED_ACTIONS] || ''),
    '{{MANAGER_QUESTIONS}}': String(b.rows[i][b.h.MANAGER_QUESTIONS] || ''),
    '{{KPI_TABLE}}': formatMetricsTable_(metrics)
  };
  function applyTemplate(s) {
    Object.keys(replacements).forEach(function (k) { s = s.split(k).join(replacements[k]); });
    return s;
  }
  return {
    title: applyTemplate(toText_(getConfig_('EMAIL_SUBJECT_TEMPLATE', 'รายงานยอดขายรายสัปดาห์'))),
    body: applyTemplate(toText_(getConfig_('EMAIL_BODY_TEMPLATE', '')))
  };
}

function formatMetricsTable_(c) {
  function d(n) { return (toNumber_(n) === null ? '' : toNumber_(n).toLocaleString('th-TH')); }
  return [
    'ลูกค้าเป้าหมายใหม่: ' + d(c.NEW_LEADS),
    'ติดต่อแล้ว: ' + d(c.CONTACTED_LEADS) + ' (อัตราการติดต่อ ' + c.CONTACT_RATE + '%)',
    'นัดหมาย: ' + d(c.APPOINTMENTS),
    'คำสั่งซื้อสำเร็จ: ' + d(c.SUCCESSFUL_ORDERS) + ' (อัตราปิดการขาย ' + c.CLOSE_RATE + '%)',
    'ยอดขายที่บันทึก: ' + d(c.RECORDED_REVENUE) + ' บาท',
    'เงินรับจริง: ' + d(c.CASH_COLLECTED) + ' บาท (เทียบเป้าหมาย ' + c.KPI_ACHIEVEMENT + '%)',
    'ยกเลิก: ' + d(c.CANCELLED_ORDERS) + ' — คืนสินค้า: ' + d(c.RETURNED_ORDERS),
    String(c.WEEK_OVER_WEEK || '')
  ].join('\n');
}

/* ------------------ เมนู 6 — ตรวจสอบการเชื่อมต่อ API -------------------- */

function testApiConnection() {
  const ui = SpreadsheetApp.getUi();
  let key;
  try { key = getApiKey_(); } catch (e) {
    ui.alert('ตรวจสอบการเชื่อมต่อ API', e.message, ui.ButtonSet.OK);
    return;
  }
  const model = String(getConfig_('MODEL', 'gpt-5.6')).trim();
  const res = UrlFetchApp.fetch(OPENAI_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({
      model: model,
      input: [{ role: 'user', content: 'ping' }],
      max_output_tokens: 4000
    }),
    muteHttpExceptions: true
  });
  const id = res.getResponseCode();
  const body = res.getContentText();

  let conclusion;
  if (id === 200) {
    conclusion = 'เชื่อมต่อสำเร็จ\nโมเดล: ' + model + '\nAPI: Responses API';
  } else if (id === 401) {
    conclusion = 'API KEY ไม่ถูกต้อง (401)\nค่า ' + API_KEY_PROPERTY +
      ' ไม่ถูกต้องหรือถูกเพิกถอน กรุณาสร้างคีย์ใหม่แล้วบันทึกอีกครั้ง';
  } else if (id === 429) {
    conclusion = 'โควตาไม่เพียงพอ (429)\nบัญชีหมดโควตาหรือเรียกถี่เกินไป กรุณาตรวจ Billing ของ OpenAI';
  } else if (id === 404) {
    conclusion = 'ชื่อโมเดลไม่ถูกต้อง (404)\nโมเดล “' + model + '” ไม่มีอยู่หรือบัญชียังไม่มีสิทธิ์ใช้ ' +
      'กรุณาแก้ค่า MODEL ในชีต “' + SHEETS.CONFIG + '”';
  } else {
    conclusion = 'ข้อผิดพลาดอื่น (' + id + ')\n' + body.slice(0, 700);
  }
  writeAuditLog_('6. ตรวจสอบการเชื่อมต่อ API', '', id === 200 ? 'OK' : 'ERROR', conclusion);
  ui.alert('ตรวจสอบการเชื่อมต่อ API', conclusion, ui.ButtonSet.OK);
}

/* ------------------ เมนู 7 — ตั้งเวลาทำงานอัตโนมัติ --------------------- */

function installAutomationTrigger() {
  const existing = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'runScheduledReport';
  });
  if (existing) {
    showNotice_('ตั้งเวลาทำงานอัตโนมัติ', 'มีทริกเกอร์นี้อยู่แล้ว ระบบจึงไม่สร้างซ้ำ\n\nดูหรือลบได้ที่เมนูทริกเกอร์ใน Apps Script');
    return;
  }
  ScriptApp.newTrigger('runScheduledReport').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(17).create();
  writeAuditLog_('7. ตั้งเวลาทำงานอัตโนมัติ', '', 'OK', 'สร้างทริกเกอร์วันศุกร์ช่วง 17:00 น.');
  showNotice_('ตั้งเวลาทำงานอัตโนมัติ',
    'สร้างทริกเกอร์ช่วงเย็นวันศุกร์แล้ว\n\n' +
    'Google จะเรียกทำงานระหว่าง 17:00–18:00 น. ตามเขตเวลาของโปรเจกต์ ไม่รับประกันนาทีที่แน่นอน\n' +
    'ระบบจะสร้างร่างและหยุดที่สถานะ “' + getStatusLabel_('PENDING_APPROVAL') + '” คุณยังต้องกดส่งจากเมนู 5\n\n' +
    'หาก REPORTING_PERIOD เป็นวันที่คงที่ ระบบจะข้ามงานตามเวลา เพื่อป้องกันการสร้างรายงานสัปดาห์เก่าซ้ำ ' +
    'เปลี่ยนกลับเป็น “สัปดาห์ปัจจุบัน” เมื่อต้องการใช้ทริกเกอร์');
}

/** ฟังก์ชันสำหรับทริกเกอร์ ไม่เปิดกล่องโต้ตอบและบันทึกผลลงชีตบันทึกระบบ */
function runScheduledReport() {
  // วันที่คงที่ใช้สำหรับเรียกข้อมูลย้อนหลังด้วยตนเอง จึงต้องข้ามงานตามเวลา
  const reportingPeriodSetting = getReportingPeriodValue_();
  if (parseIsoDate_(reportingPeriodSetting)) {
    writeAuditLog_('ทำงานตามเวลา', reportingPeriodSetting, 'SKIPPED',
      'REPORTING_PERIOD กำหนดเป็นวันที่คงที่ ' + reportingPeriodSetting + ' จึงข้ามการทำงานอัตโนมัติ ' +
      'เปลี่ยนเป็น “สัปดาห์ปัจจุบัน” ในชีต “' + SHEETS.CONFIG + '” เพื่อเปิดใช้งานอีกครั้ง');
    return;
  }

  const period = getReportingPeriod_();
  try {
    const validation = validateData_(period);
    if (!validation.passed) {
      writeAuditLog_('ทำงานตามเวลา', period.id, 'NEEDS_DATA_FIX', validation.summary);
      notifyOwnerOfError_(period, validation.summary);
      return;
    }
    const calculationResult = calculateMetrics_(period);
    if (!calculationResult.ok) {
      writeAuditLog_('ทำงานตามเวลา', period.id, 'STOPPED', calculationResult.message);
      notifyOwnerOfError_(period, calculationResult.message);
      return;
    }
    const reportResult = createAIReport_(period);
    writeAuditLog_('ทำงานตามเวลา', period.id, reportResult.ok ? 'OK' : 'ERROR', reportResult.message, reportResult.reportId);
    if (!reportResult.ok) notifyOwnerOfError_(period, reportResult.message);
  } catch (e) {
    writeAuditLog_('ทำงานตามเวลา', period.id, 'ERROR', e.message);
    notifyOwnerOfError_(period, e.message);
  }
}

function notifyOwnerOfError_(period, message) {
  const recipient = String(getConfig_('REPORT_RECIPIENTS', '')).split(',')[0].trim();
  if (!isValidEmail_(recipient)) return;
  try {
    MailApp.sendEmail(recipient, 'ยังสร้างรายงานสัปดาห์ ' + period.id + ' ไม่สำเร็จ',
      'ระบบทำงานตามเวลาแล้วแต่ยังสร้างรายงานไม่สำเร็จ\n\n' + message +
      '\n\nยังไม่มีการส่งรายงาน โปรดดูรายละเอียดในชีต “' + SHEETS.AUDIT_LOG + '”');
  } catch (e) {
    writeAuditLog_('แจ้งข้อผิดพลาดให้ผู้รับผิดชอบ', period.id, 'ERROR', e.message);
  }
}

