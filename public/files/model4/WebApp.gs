/** WEUP SoloSix — โมเดล 4: ฟังก์ชันฝั่งเซิร์ฟเวอร์ของแดชบอร์ด */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('WEUP SoloSix — รายงานยอดขายรายสัปดาห์');
}

function openDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(1120).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'แดชบอร์ด — รายงานยอดขายรายสัปดาห์');
}

/* ------------------------- DASHBOARD DATA ------------------------- */

function getDashboardData() {
  const period = getReportingPeriod_();
  const validation = validateData_(period);
  const metrics = readMetricsRow_(period.id);
  const report = readReport_(period.id);

  return {
    updatedAt: Utilities.formatDate(new Date(), getTimeZone_(), 'HH:mm:ss'),
    period: {
      id: period.id,
      fromDate: formatDate_(period.startDate),
      toDate: formatDate_(period.endDate),
      calculationMode: String(getConfig_('REPORTING_PERIOD', 'CURRENT_WEEK'))
    },
    kpi: buildKpiCards_(validation, metrics, report),
    warnings: buildWarnings_(),
    source: buildDataSource_(),
    data: {
      passed: validation.passed,
      rowCount: validation.rows.length,
      outsidePeriod: validation.outsidePeriod || 0,
      blankRate: validation.blankRate,
      errors: validation.errors.slice(0, 12),
      errorCount: validation.errors.length,
      emptyMessage: 'ยังไม่มีข้อมูลในรอบนี้ กรุณากรอกข้อมูลในชีต “' + SHEETS.DAILY_DATA + '”'
    },
    metrics: metrics ? buildMetricsList_(metrics) : null,
    report: report ? {
      id: String(report.REPORT_ID),
      status: String(report.STATUS || ''),
      statusLabel: getStatusLabel_(report.STATUS || ''),
      approvedBy: String(report.APPROVED_BY || ''),
      sentAt: formatDate_(report.SENT_AT),
      recipients: String(report.RECIPIENTS || ''),
      overview: String(report.OVERVIEW || ''),
      warnings: String(report.WARNINGS || ''),
      action: String(report.RECOMMENDED_ACTIONS || ''),
      managerQuestions: String(report.MANAGER_QUESTIONS || ''),
      rawJson: String(report.RAW_JSON || '')
    } : null,
    nextAction: getNextAction_(validation, metrics, report),
    reminders: [
      { task: 'แก้ข้อมูลต้นทางเมื่อระบบแจ้งข้อผิดพลาด', note: 'ระบบไม่แก้ตัวเลขของลูกค้าโดยอัตโนมัติ แต่จะแจ้งแถวและคอลัมน์ที่ต้องแก้' },
      { task: 'อ่านและอนุมัติความคิดเห็น', note: 'ไม่มีฟังก์ชันใดเปลี่ยนสถานะเป็น “' + getStatusLabel_('APPROVED_TO_SEND') + '” โดยอัตโนมัติ' },
      { task: 'ตัดสินใจเมื่อพบตัวเลขผิดปกติ', note: 'AI อธิบายการเปลี่ยนแปลงเท่านั้น ไม่สรุปสาเหตุและไม่เสนอรางวัลหรือบทลงโทษ' }
    ]
  };
}

function buildDataSource_() {
  const id = String(getConfig_('CUSTOMER_FILE_ID', '')).trim();
  if (!id) {
    return { location: 'ชีต “' + SHEETS.DAILY_DATA + '” ในไฟล์นี้', id: '', name: '',
      description: 'ยังไม่ได้เชื่อมไฟล์ลูกค้า วางลิงก์ด้านล่างเพื่อให้ระบบอ่านข้อมูลโดยตรงโดยไม่ต้องคัดลอก' };
  }
  let name = '';
  try { name = SpreadsheetApp.openById(id).getName(); } catch (e) { name = ''; }
  return {
    location: name ? ('ไฟล์ลูกค้า: ' + name) : 'ไฟล์ลูกค้า (ไม่สามารถเปิดได้)',
    id: id, name: name,
    description: name ? 'ระบบจะอ่านไฟล์นี้ทุกครั้งที่ทำงาน ลูกค้าเป็นผู้กรอก คุณไม่ต้องคัดลอกข้อมูล'
      : 'ไม่สามารถเปิดไฟล์จากรหัสที่บันทึกไว้ กรุณาตรวจสิทธิ์แชร์หรือวางลิงก์ใหม่'
  };
}

function buildKpiCards_(validation, metrics, report) {
  const kpi = Number(getConfig_('WEEKLY_KPI', 0)) || 0;
  return [
    {
      label: 'เงินรับจริงสัปดาห์นี้',
      value: metrics ? Number(metrics.CASH_COLLECTED) || 0 : 0,
      type: 'currency',
      description: metrics ? ('ทำได้ ' + metrics.KPI_ACHIEVEMENT + '% จากเป้าหมาย ' + kpi.toLocaleString('th-TH') + ' บาท')
        : 'ยังไม่ได้คำนวณ กรุณาเรียกเมนู 3'
    },
    {
      label: 'อัตราปิดการขาย',
      value: metrics ? (metrics.CLOSE_RATE + '%') : '—',
      type: 'text',
      description: metrics ? ((metrics.SUCCESSFUL_ORDERS || 0) + ' คำสั่งซื้อสำเร็จ จาก ' + (metrics.CONTACTED_LEADS || 0) + ' รายที่ติดต่อแล้ว')
        : 'ยังไม่ได้คำนวณ'
    },
    {
      label: 'สถานะข้อมูล',
      value: validation.passed ? getStatusLabel_('PASSED') : getStatusLabel_('NEEDS_DATA_FIX'),
      type: 'text',
      description: validation.passed ? (validation.rows.length + ' แถวในรอบนี้ ช่องว่าง ' + validation.blankRate + '%')
        : (validation.errors.length + ' ข้อผิดพลาดที่ต้องแก้ก่อนคำนวณ')
    },
    {
      label: 'สถานะรายงาน',
      value: report ? getStatusLabel_(report.STATUS || '') : 'ยังไม่ได้สร้าง',
      type: 'text',
      description: report ? ('รหัส ' + report.REPORT_ID + (report.SENT_AT ? ', ส่งเมื่อ ' + formatDate_(report.SENT_AT) : ''))
        : 'เรียกเมนู 4 เพื่อสร้างร่าง'
    }
  ];
}

function buildMetricsList_(c) {
  function n(v) { return toNumber_(v) === null ? '' : toNumber_(v); }
  return [
    { name: 'ลูกค้าเป้าหมายใหม่', value: n(c.NEW_LEADS), suffix: '' },
    { name: 'ติดต่อแล้ว', value: n(c.CONTACTED_LEADS), suffix: ' (' + c.CONTACT_RATE + '%)' },
    { name: 'นัดหมาย', value: n(c.APPOINTMENTS), suffix: '' },
    { name: 'คำสั่งซื้อสำเร็จ', value: n(c.SUCCESSFUL_ORDERS), suffix: ' (' + c.CLOSE_RATE + '%)' },
    { name: 'ยอดขายที่บันทึก', value: n(c.RECORDED_REVENUE), suffix: ' บาท' },
    { name: 'เงินรับจริง', value: n(c.CASH_COLLECTED), suffix: ' บาท' },
    { name: 'ยกเลิก', value: n(c.CANCELLED_ORDERS), suffix: ' (' + c.CANCELLATION_RATE + '%)' },
    { name: 'คืนสินค้า', value: n(c.RETURNED_ORDERS), suffix: ' (' + c.RETURN_RATE + '%)' },
    { name: 'เทียบกับสัปดาห์ก่อน', value: String(c.WEEK_OVER_WEEK || ''), suffix: '', wide: true }
  ];
}

function buildWarnings_() {
  const items = [];
  if (!PropertiesService.getScriptProperties().getProperty(API_KEY_PROPERTY)) {
    items.push({ label: 'ยังไม่ได้บันทึก API key', message: 'เมนู 4 จะหยุดทำงาน กรุณาบันทึกคีย์ในส่วนการตั้งค่าด้านล่าง' });
  }
  const missingKeys = ['WEEKLY_KPI', 'REPORT_RECIPIENTS', 'MODEL'].filter(function (k) {
    return String(getConfig_(k, '')).trim() === '';
  });
  if (missingKeys.length) items.push({ label: 'ชีต “' + SHEETS.CONFIG + '” ยังมีค่าที่จำเป็นว่างอยู่:', message: missingKeys.map(normalizeConfigKey_).join(', ') });

  try {
    const hasTrigger = ScriptApp.getProjectTriggers().some(function (t) {
      return t.getHandlerFunction() === 'runScheduledReport';
    });
    if (!hasTrigger) items.push({ label: 'ยังไม่ได้ตั้งเวลาทำงานอัตโนมัติ', message: 'ระบบจะทำงานเมื่อคุณกดเท่านั้น ใช้เมนู 7 เพื่อตั้งเวลาช่วงเย็นวันศุกร์' });
  } catch (e) { }

  const timeZone = getTimeZone_();
  if (timeZone.indexOf('Asia') < 0) {
    items.push({ label: 'เขตเวลาปัจจุบันคือ ' + timeZone, message: 'กรุณาตั้งเป็น Asia/Bangkok ในการตั้งค่าโปรเจกต์ เพื่อไม่ให้รอบรายงานคลาดเคลื่อน' });
  }
  return items;
}

function getNextAction_(validation, metrics, report) {
  if (!validation.passed) {
    return { task: 'แก้ข้อมูลต้นทางตามรายการข้อผิดพลาดด้านล่าง แล้วตรวจสอบอีกครั้ง', action: 'VALIDATE_DATA', label: 'ตรวจสอบข้อมูลอีกครั้ง' };
  }
  if (!metrics) {
    return { task: 'ข้อมูลผ่านแล้ว คำนวณตัวชี้วัดสำหรับสัปดาห์นี้', action: 'CALCULATE_METRICS', label: 'คำนวณตัวชี้วัด' };
  }
  if (!report) {
    return { task: 'มีตัวชี้วัดแล้ว สร้างร่างความคิดเห็นด้วย AI', action: 'GENERATE_AI_REPORT', label: 'สร้างความเห็นด้วย AI' };
  }
  const statusKey = String(report.STATUS || '').trim();
  if (statusKey === 'PENDING_APPROVAL') {
    return { task: 'อ่านความคิดเห็นทั้ง 4 ส่วนด้านล่าง หากต้องแก้ข้อความให้เปิดชีต “' + SHEETS.AI_REPORTS + '” เมื่อพร้อมแล้วกรอกชื่อและกดอนุมัติ', action: '', label: '' };
  }
  if (statusKey === 'APPROVED_TO_SEND') {
    return { task: 'รายงานได้รับอนุมัติแล้ว ส่งให้ผู้รับได้', action: 'SEND_REPORT', label: 'ส่งรายงานที่อนุมัติแล้ว' };
  }
  if (statusKey === 'SENT') {
    return { task: 'ส่งรายงานของสัปดาห์นี้แล้ว ไม่มีงานค้าง', action: '', label: '' };
  }
  if (statusKey === 'ERROR') {
    return { task: 'การเรียก AI ครั้งก่อนผิดพลาด โปรดดูคอลัมน์ “' + getFieldLabel_('RAW_JSON') + '” แก้สาเหตุ ลบแถวเดิม แล้วเรียกเมนู 4 อีกครั้ง หรือเขียนความคิดเห็นด้วยตนเอง', action: '', label: '' };
  }
  return { task: 'ตรวจสถานะรายงานในชีต “' + SHEETS.AI_REPORTS + '”', action: '', label: '' };
}

/* -------------------------- ปุ่มบนแดชบอร์ด ------------------------------- */

function runDashboardAction(action) {
  const period = getReportingPeriod_();
  try {
    if (action === 'VALIDATE_DATA') return validateData_(period).summary;
    if (action === 'CALCULATE_METRICS') return calculateMetrics_(period).message;
    if (action === 'GENERATE_AI_REPORT') return createAIReport_(period).message;
    if (action === 'SEND_REPORT') return sendApprovedReport_().message;
    return 'ไม่รู้จักการดำเนินการ: ' + action;
  } catch (e) {
    writeAuditLog_('แดชบอร์ด', period.id, 'ERROR', action + ' | ' + e.message);
    return 'ข้อผิดพลาด: ' + e.message;
  }
}

/** จุดอนุมัติของมนุษย์ ฟังก์ชันอัตโนมัติจะไม่เรียกใช้งานส่วนนี้ */
function approveReport(reportId, approverName) {
  const name = String(approverName || '').trim();
  if (!name) return 'ยังไม่ได้กรอกชื่อผู้อนุมัติ รายงานต้องระบุผู้รับผิดชอบอย่างชัดเจน';

  const b = readTable_(SHEETS.AI_REPORTS);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.REPORT_ID]).trim() !== String(reportId).trim()) continue;
    const statusKey = String(b.rows[i][b.h.STATUS] || '').trim();
    if (statusKey !== 'PENDING_APPROVAL') {
      return 'รายงานมีสถานะ “' + (statusKey ? getStatusLabel_(statusKey) : 'ว่าง') + '” อนุมัติได้เฉพาะสถานะ “' + getStatusLabel_('PENDING_APPROVAL') + '”';
    }
    b.sh.getRange(i + 2, b.h.APPROVED_BY + 1).setValue(name);
    b.sh.getRange(i + 2, b.h.APPROVED_AT + 1).setValue(getTimestamp_());
    b.sh.getRange(i + 2, b.h.STATUS + 1).setValue(getStatusLabel_('APPROVED_TO_SEND'));
    writeAuditLog_('อนุมัติรายงาน', String(b.rows[i][b.h.WEEK_ID]), 'OK', 'ผู้อนุมัติ: ' + name, reportId);
    return 'อนุมัติ ' + reportId + ' โดย ' + name + ' แล้ว ตอนนี้สามารถกด “ส่งรายงานที่อนุมัติแล้ว” ได้';
  }
  return 'ไม่พบรายงาน ' + reportId;
}

/** บันทึกลิงก์หรือรหัสไฟล์ข้อมูลลูกค้า */
function saveCustomerFile(pathOrUrl) {
  const v = String(pathOrUrl || '').trim();
  if (!v) {
    setConfig_('CUSTOMER_FILE_ID', '');
    return 'ลบการเชื่อมต่อแล้ว ระบบจะกลับไปอ่านชีต “' + SHEETS.DAILY_DATA + '” ในไฟล์นี้';
  }
  const id = extractFileId_(v);
  let name;
  try {
    name = SpreadsheetApp.openById(id).getName();
  } catch (e) {
    return 'ไม่สามารถเปิดไฟล์ได้ กรุณาตรวจลิงก์และตรวจว่าบัญชีนี้ได้รับสิทธิ์ดูไฟล์แล้ว';
  }
  setConfig_('CUSTOMER_FILE_ID', id);
  writeAuditLog_('การตั้งค่า', '', 'OK', 'เชื่อมไฟล์ข้อมูล: ' + name);
  return 'เชื่อมกับไฟล์ “' + name + '” แล้ว จากนี้ระบบจะอ่านไฟล์โดยตรงโดยไม่ต้องคัดลอกข้อมูล';
}

/** บันทึก API key ใน Script Properties เท่านั้น */
function saveApiKey(key) {
  const k = String(key || '').trim();
  if (!k) return 'ยังไม่ได้กรอก API key';
  PropertiesService.getScriptProperties().setProperty(API_KEY_PROPERTY, k);
  writeAuditLog_('การตั้งค่า', '', 'OK', 'อัปเดต ' + API_KEY_PROPERTY + ' แล้ว');
  return 'บันทึก API key ใน Script Properties แล้ว กรุณาเรียกเมนู 6 เพื่อตรวจสอบการเชื่อมต่อ';
}

