/**
 * WEUP SoloSix — โมเดล 3
 * ฟังก์ชันฝั่งเซิร์ฟเวอร์สำหรับ Dashboard
 * ไฟล์นี้ไม่ประกาศ onOpen และใช้ข้อมูลจากชีตเท่านั้นเมื่อเปิดหน้า
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('WEUP SoloSix — ผลิตภัณฑ์ความรู้')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function openKnowledgeDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('Dashboard').setWidth(1160).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'แดชบอร์ดผลิตภัณฑ์ความรู้');
}

function getKnowledgeDashboardData() {
  return knowledgeDashboardSafe_(function () {
    var research = knowledgeRead_(KNOWLEDGE.sheets.research);
    var map = knowledgeRead_(KNOWLEDGE.sheets.map);
    var structure = knowledgeRead_(KNOWLEDGE.sheets.structure);
    var documents = knowledgeRead_(KNOWLEDGE.sheets.documents);
    var scenes = knowledgeRead_(KNOWLEDGE.sheets.scenes);
    var orders = knowledgeRead_(KNOWLEDGE.sheets.orders);
    var feedback = knowledgeRead_(KNOWLEDGE.sheets.feedback);
    var support = knowledgeRead_(KNOWLEDGE.sheets.support);

    var orderRows = orders.rows.map(function (row) { return knowledgeRowObject_(orders.headers, row); }).filter(function (row) { return row.ORDER_ID; });
    var paidRevenue = orderRows.reduce(function (sum, row) {
      return ['PAID', 'ACCESS_GRANTED', 'IN_PROGRESS', 'COMPLETED'].indexOf(row.STATUS) >= 0 ? sum + (Number(row.PRICE) || 0) : sum;
    }, 0);
    var warnings = [];
    if (!PropertiesService.getScriptProperties().getProperty(KNOWLEDGE.property.apiKey)) warnings.push('ยังไม่ได้บันทึก OPENAI_API_KEY ขั้นตอนที่ใช้ AI จะยังทำงานไม่ได้');
    if (!knowledgeConfig_('PUBLISHED_FOLDER_ID', '')) warnings.push('ยังไม่มีโฟลเดอร์ “05_ฉบับเผยแพร่” กรุณาสร้างโครงสร้าง Drive');
    var invalidPaid = orderRows.filter(function (row) { return row.STATUS === 'PAID' && !knowledgeValidEmail_(row.EMAIL); }).length;
    if (invalidPaid) warnings.push('มีคำสั่งซื้อที่ชำระแล้ว ' + invalidPaid + ' รายการ แต่อีเมลไม่ถูกต้อง');
    var unreviewedDocuments = documents.rows.filter(function (row) {
      var object = knowledgeRowObject_(documents.headers, row);
      return object.DOCUMENT_ID && object.STATUS !== 'APPROVED_TO_PUBLISH';
    }).length;
    if (unreviewedDocuments) warnings.push('มีร่างเอกสาร ' + unreviewedDocuments + ' รายการที่ยังไม่ผ่านการอนุมัติเผยแพร่');

    return {
      ok: true,
      updatedAt: Utilities.formatDate(new Date(), KNOWLEDGE.timeZone, 'dd/MM/yyyy HH:mm:ss'),
      kpis: [
        { label: 'ข้อมูลวิจัย', value: knowledgeCountRows_(research, 'CUSTOMER_QUOTE'), note: 'ข้อความลูกค้าที่เก็บไว้เป็นต้นฉบับ' },
        { label: 'โมดูลผลิตภัณฑ์', value: knowledgeCountRows_(structure, 'MODULE_ID'), note: 'โมดูลที่มีผลลัพธ์ให้ลูกค้า' },
        { label: 'เอกสารพร้อมเผยแพร่', value: knowledgeCountValue_(documents, 'STATUS', 'APPROVED_TO_PUBLISH'), note: 'ผ่านผู้ตรวจและบรรณาธิการแล้ว' },
        { label: 'รายได้ที่ยืนยัน', value: paidRevenue, money: true, note: orderRows.length + ' คำสั่งซื้อทั้งหมด' }
      ],
      workflow: [
        { label: 'ความต้องการที่ AI จัดกลุ่ม', value: knowledgeCountRows_(research, 'AI_GROUP'), total: knowledgeCountRows_(research, 'CUSTOMER_QUOTE') },
        { label: 'แหล่งข้อมูลที่อนุมัติ', value: knowledgeCountValue_(map, 'SOURCE_STATUS', 'APPROVED'), total: knowledgeCountRows_(map, 'TOPIC') },
        { label: 'เอกสารร่าง', value: knowledgeCountRows_(documents, 'DOCUMENT_ID'), total: Math.max(knowledgeCountRows_(structure, 'MODULE_ID'), 1) },
        { label: 'ฉากที่วางแผนแล้ว', value: knowledgeCountRows_(scenes, 'SCENE_ID'), total: Math.max(knowledgeCountRows_(documents, 'DOCUMENT_ID'), 1) }
      ],
      checkpoints: [
        { label: 'อนุมัติกลุ่มความต้องการ', pending: knowledgePendingBlank_(research, 'CUSTOMER_QUOTE', 'HUMAN_APPROVAL'), field: 'วิจัย → การอนุมัติโดยผู้ขาย' },
        { label: 'อนุมัติแหล่งข้อมูล', pending: knowledgeCountValue_(map, 'SOURCE_STATUS', 'NEEDS_MORE_INFO'), field: 'แผนที่ความรู้ → สถานะแหล่ง' },
        { label: 'อนุมัติเอกสารเผยแพร่', pending: unreviewedDocuments, field: 'สถานะเอกสาร → สถานะ' },
        { label: 'ตัดสินใจจากฟีดแบ็ก', pending: knowledgePendingBlank_(feedback, 'ORIGINAL_TEXT', 'DECISION'), field: 'ฟีดแบ็ก → การตัดสินใจ' }
      ],
      orders: orderRows.slice(-50).reverse().map(knowledgeDashboardOrder_),
      support: {
        pending: knowledgeCountValue_(support, 'PROCESSED', 'NO'),
        complaints: knowledgeCountValue_(support, 'AI_GROUP', 'COMPLAINT'),
        inScope: knowledgeCountValue_(support, 'AI_GROUP', 'IN_SCOPE'),
        feedbackWaiting: knowledgePendingBlank_(feedback, 'ORIGINAL_TEXT', 'AI_GROUP')
      },
      warnings: warnings
    };
  });
}

function runKnowledgeOrderAction(action, orderId) {
  return knowledgeDashboardSafe_(function () {
    var allowed = ['MARK_PAID', 'GRANT_ACCESS', 'SEND_WELCOME', 'REMIND_DAY_3', 'REMIND_DAY_7', 'MARK_COMPLETED'];
    if (allowed.indexOf(action) < 0) throw new Error('ไม่อนุญาตการดำเนินการนี้');
    var found = knowledgeFind_(KNOWLEDGE.sheets.orders, 'ORDER_ID', orderId);
    if (!found) throw new Error('ไม่พบรหัสคำสั่งซื้อ: ' + orderId);
    var message = '';
    if (action === 'MARK_PAID') {
      if (!knowledgeValidEmail_(found.object.EMAIL)) throw new Error('อีเมลไม่ถูกต้อง กรุณาแก้ไขก่อนยืนยันการชำระเงิน');
      if (found.object.STATUS !== 'NEW') throw new Error('ยืนยันการชำระเงินได้เฉพาะสถานะ “ใหม่”');
      knowledgeWrite_(found.table, found.rowNumber, { STATUS: 'PAID', PAID_AT: new Date(), SYSTEM_NOTES: '' });
      knowledgeAudit_('MARK_PAID', 'SUCCESS', orderId);
      message = 'เปลี่ยนสถานะเป็น “ชำระแล้ว” แล้ว';
    }
    if (action === 'GRANT_ACCESS') message = grantKnowledgeAccess_(orderId);
    if (action === 'SEND_WELCOME') message = sendKnowledgeWelcome_(orderId);
    if (action === 'REMIND_DAY_3') message = knowledgeSendReminder_(orderId, 3);
    if (action === 'REMIND_DAY_7') message = knowledgeSendReminder_(orderId, 7);
    if (action === 'MARK_COMPLETED') message = markKnowledgeCompleted_(orderId);
    return { ok: true, message: message, data: getKnowledgeDashboardData() };
  });
}

function saveKnowledgeApiKey(apiKey) {
  return knowledgeDashboardSafe_(function () {
    var key = knowledgeText_(apiKey);
    if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) throw new Error('รูปแบบคีย์ไม่ถูกต้อง กรุณาตรวจสอบก่อนบันทึก');
    PropertiesService.getScriptProperties().setProperty(KNOWLEDGE.property.apiKey, key);
    knowledgeAudit_('SAVE_API_KEY', 'SUCCESS', 'บันทึกใน Script Properties');
    return { ok: true, message: 'บันทึก OPENAI_API_KEY ใน Script Properties แล้ว' };
  });
}

function knowledgeDashboardOrder_(row) {
  var action = '';
  if (row.STATUS === 'NEW') action = 'MARK_PAID';
  if (row.STATUS === 'PAID') action = 'GRANT_ACCESS';
  if (row.STATUS === 'ACCESS_GRANTED' && !row.WELCOME_SENT_AT) action = 'SEND_WELCOME';
  if (row.STATUS === 'IN_PROGRESS' && !row.REMINDER_DAY_3) action = 'REMIND_DAY_3';
  if (row.STATUS === 'IN_PROGRESS' && row.REMINDER_DAY_3 && !row.REMINDER_DAY_7) action = 'REMIND_DAY_7';
  if (row.STATUS === 'IN_PROGRESS' && row.REMINDER_DAY_7) action = 'MARK_COMPLETED';
  return {
    orderId: knowledgeText_(row.ORDER_ID), fullName: knowledgeText_(row.FULL_NAME), email: knowledgeText_(row.EMAIL),
    product: knowledgeText_(row.PRODUCT), price: Number(row.PRICE) || 0, status: knowledgeStatusLabel_(row.STATUS),
    accessAt: knowledgeDashboardDate_(row.ACCESS_GRANTED_AT), nextAction: action,
    note: knowledgeText_(row.SYSTEM_NOTES), documentLink: knowledgeText_(row.DOCUMENT_LINK)
  };
}

function knowledgeCountRows_(table, header) {
  return table.rows.filter(function (row) { return knowledgeText_(knowledgeCell_(row, table.map, header)) !== ''; }).length;
}

function knowledgeCountValue_(table, header, expected) {
  return table.rows.filter(function (row) { return knowledgeText_(knowledgeCell_(row, table.map, header)) === expected; }).length;
}

function knowledgePendingBlank_(table, sourceHeader, targetHeader) {
  return table.rows.filter(function (row) {
    return knowledgeText_(knowledgeCell_(row, table.map, sourceHeader)) && !knowledgeText_(knowledgeCell_(row, table.map, targetHeader));
  }).length;
}

function knowledgeDashboardDate_(value) {
  var date = knowledgeDate_(value);
  return date ? Utilities.formatDate(date, KNOWLEDGE.timeZone, 'dd/MM/yyyy HH:mm') : '';
}

function knowledgeDashboardSafe_(callback) {
  try { return callback(); }
  catch (error) { return { ok: false, message: error && error.message ? error.message : String(error) }; }
}
