/**
 * WEUP SoloSix — โมเดล 1
 * ฝั่งเซิร์ฟเวอร์ของ Dashboard
 *
 * สร้างไฟล์ Script ชื่อ WebApp ในโปรเจ็กต์เดียวกับ Main.gs แล้ววางไฟล์นี้
 * จากนั้น Deploy > New deployment > Web app และกำหนด Execute as: Me
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('SoloSix — ศูนย์ควบคุมงานให้คำปรึกษา')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function getDashboardData() {
  return soloWebSafe_(function () {
    var ss = soloSpreadsheet_();
    var clientSheet = ss.getSheetByName(SOLO.sheets.clients);
    if (!clientSheet) {
      return {
        ready: false,
        message: 'ยังไม่พบชีต “' + SOLO.sheets.clients + '” กรุณาสร้างแบบฟอร์มรับข้อมูลก่อน',
        counts: { newClient: 0, review: 0, finalReview: 0, sent: 0 },
        lanes: soloEmptyLanes_(),
        generatedAt: soloNow_()
      };
    }

    soloEnsureClientColumns_(clientSheet);
    var clients = soloReadTable_(clientSheet);
    var draftIndex = soloWebIndexById_(SOLO.sheets.drafts);
    var finalIndex = soloWebIndexById_(SOLO.sheets.finals);
    var replyCount = soloWebReplyCount_();
    var lanes = soloEmptyLanes_();

    for (var i = 0; i < clients.rows.length; i++) {
      var row = clients.rows[i];
      var clientId = soloText_(soloCell_(row, clients.map, 'รหัสลูกค้า'));
      if (!clientId) continue;
      var workflow = soloText_(soloCell_(row, clients.map, 'สถานะเวิร์กโฟลว์')) || SOLO.status.newClient;
      var draft = draftIndex[clientId];
      var finalRow = finalIndex[clientId];
      var laneKey = soloWebLane_(workflow, draft, finalRow);
      var name = soloWebFindValue_(clients.headers, row, ['ชื่อ-นามสกุล', 'ชื่อและนามสกุล', 'ชื่อ']);
      var email = soloClientEmail_({ headers: clients.headers, values: row, map: clients.map });
      var summary = draft ? soloText_(soloCell_(draft.values, draft.map, 'สรุปสถานการณ์')) : '';
      var status = workflow;
      if (finalRow) status = soloText_(soloCell_(finalRow.values, finalRow.map, 'สถานะอนุมัติขั้นสุดท้าย')) || workflow;
      else if (draft) status = soloText_(soloCell_(draft.values, draft.map, 'สถานะตรวจสอบรอบแรก')) || workflow;

      lanes[laneKey].items.push({
        clientId: clientId,
        name: name || 'ไม่ระบุชื่อ',
        email: email,
        status: status,
        summary: summary || 'ยังไม่มีสรุป',
        replies: replyCount[clientId] || 0
      });
    }

    return {
      ready: true,
      message: '',
      counts: {
        newClient: lanes.newClient.items.length,
        review: lanes.review.items.length,
        finalReview: lanes.finalReview.items.length,
        sent: lanes.sent.items.length
      },
      lanes: lanes,
      generatedAt: soloNow_(),
      model: soloModel_()
    };
  });
}

function getClientDetails(clientId) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    var client = soloFindRowById_(SOLO.sheets.clients, clientId);
    var draft = soloFindRowById_(SOLO.sheets.drafts, clientId, true);
    var finalRow = soloFindRowById_(SOLO.sheets.finals, clientId, true);
    var intake = [];

    for (var i = 0; i < client.headers.length; i++) {
      var label = soloText_(client.headers[i]);
      var value = soloText_(client.values[i]);
      if (label && value && label !== 'สถานะเวิร์กโฟลว์') intake.push({ label: label, value: value });
    }

    return {
      clientId: clientId,
      name: soloWebFindValue_(client.headers, client.values, ['ชื่อ-นามสกุล', 'ชื่อและนามสกุล', 'ชื่อ']) || 'ไม่ระบุชื่อ',
      workflow: soloText_(soloCell_(client.values, client.map, 'สถานะเวิร์กโฟลว์')) || SOLO.status.newClient,
      intake: intake,
      draft: draft ? {
        content: soloText_(soloCell_(draft.values, draft.map, 'ร่างแผน 4 สัปดาห์')),
        summary: soloText_(soloCell_(draft.values, draft.map, 'สรุปสถานการณ์')),
        feedback: soloText_(soloCell_(draft.values, draft.map, 'ข้อเสนอแนะ')),
        review: soloText_(soloCell_(draft.values, draft.map, 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ')),
        changes: soloText_(soloCell_(draft.values, draft.map, 'รายการที่แก้ไข')),
        risk: soloText_(soloCell_(draft.values, draft.map, 'ธงคัดกรองสุขภาพ')),
        status: soloText_(soloCell_(draft.values, draft.map, 'สถานะตรวจสอบรอบแรก'))
      } : null,
      finalPlan: finalRow ? {
        content: soloText_(soloCell_(finalRow.values, finalRow.map, 'เนื้อหาแผนสำหรับลูกค้า')),
        subject: soloText_(soloCell_(finalRow.values, finalRow.map, 'หัวข้ออีเมล')),
        email: soloText_(soloCell_(finalRow.values, finalRow.map, 'อีเมล')),
        review: soloText_(soloCell_(finalRow.values, finalRow.map, 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ')),
        status: soloText_(soloCell_(finalRow.values, finalRow.map, 'สถานะอนุมัติขั้นสุดท้าย')),
        sentAt: soloText_(soloCell_(finalRow.values, finalRow.map, 'ส่งเมื่อ')),
        note: soloText_(soloCell_(finalRow.values, finalRow.map, 'บันทึกการส่ง'))
      } : null,
      replies: soloWebReplies_(clientId)
    };
  });
}

function createDraftFromDashboard(clientId) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    soloGenerateDraftByClientId_(clientId, false);
    return { message: 'AI สร้างร่างเรียบร้อย กรุณาตรวจทุกส่วนก่อนอนุมัติ', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function saveDraftFromDashboard(clientId, content) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    content = soloText_(content);
    if (!content) throw new Error('เนื้อหาร่างยังว่าง');
    var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
    soloWriteNamedValues_(draft.sheet, draft.row, draft.map, {
      'ร่างแผน 4 สัปดาห์': content,
      'JSON ร่างแผน': '',
      'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview,
      'รายการที่แก้ไข': '• ผู้ให้คำปรึกษาแก้ไขเนื้อหาด้วยตนเองผ่าน Dashboard',
      'แก้ไขล่าสุด': soloNow_()
    });
    soloSetClientWorkflow_(clientId, SOLO.status.waitingReview);
    return { message: 'บันทึกร่างที่แก้ไขด้วยตนเองแล้ว', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function reviseDraftFromDashboard(clientId, feedback) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    feedback = soloText_(feedback);
    if (!feedback) throw new Error('กรุณาเขียนข้อเสนอแนะให้ชัดเจนก่อนส่งให้ AI');
    var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
    soloWriteNamedValues_(draft.sheet, draft.row, draft.map, {
      'ข้อเสนอแนะ': feedback,
      'สถานะตรวจสอบรอบแรก': SOLO.status.needsChanges
    });
    soloReviseDraftByClientId_(clientId, feedback);
    return { message: 'AI แก้ร่างตามข้อเสนอแนะแล้ว กรุณาตรวจอีกครั้ง', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function approveDraftFromDashboard(clientId) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
    if (!soloText_(soloCell_(draft.values, draft.map, 'ร่างแผน 4 สัปดาห์'))) throw new Error('ยังไม่มีเนื้อหาร่างให้อนุมัติ');
    soloWriteNamedValues_(draft.sheet, draft.row, draft.map, { 'สถานะตรวจสอบรอบแรก': SOLO.status.agreed });
    soloMoveDraftToFinalById_(clientId);
    return { message: 'อนุมัติร่างและสร้างข้อความสำหรับลูกค้าแล้ว กรุณาตรวจขั้นสุดท้าย', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function saveFinalPlanFromDashboard(clientId, subject, content) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    subject = soloText_(subject);
    content = soloText_(content);
    if (!subject) throw new Error('หัวข้ออีเมลยังว่าง');
    if (!content) throw new Error('เนื้อหาอีเมลยังว่าง');
    var finalRow = soloFindRowById_(SOLO.sheets.finals, clientId);
    soloWriteNamedValues_(finalRow.sheet, finalRow.row, finalRow.map, {
      'หัวข้ออีเมล': subject,
      'เนื้อหาแผนสำหรับลูกค้า': content,
      'สถานะอนุมัติขั้นสุดท้าย': SOLO.status.waitingFinal
    });
    soloSetClientWorkflow_(clientId, SOLO.status.waitingFinal);
    return { message: 'บันทึกข้อความฉบับสุดท้ายแล้ว', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function approveAndSendFromDashboard(clientId, subject, content) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    subject = soloText_(subject);
    content = soloText_(content);
    if (!subject || !content) throw new Error('กรุณาตรวจและกรอกหัวข้อกับเนื้อหาให้ครบก่อนส่ง');
    var finalRow = soloFindRowById_(SOLO.sheets.finals, clientId);
    soloWriteNamedValues_(finalRow.sheet, finalRow.row, finalRow.map, {
      'หัวข้ออีเมล': subject,
      'เนื้อหาแผนสำหรับลูกค้า': content,
      'สถานะอนุมัติขั้นสุดท้าย': SOLO.status.approvedToSend
    });
    soloSendPlanByClientId_(clientId, false);
    return { message: 'ส่งอีเมลถึงลูกค้าเรียบร้อย', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function resendFromDashboard(clientId) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    soloSendPlanByClientId_(clientId, true);
    return { message: 'ส่งอีเมลซ้ำเรียบร้อย โปรดตรวจบันทึกการส่ง', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function moveBackToReviewFromDashboard(clientId) {
  return soloWebSafe_(function () {
    clientId = soloWebRequireId_(clientId);
    var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
    soloWriteNamedValues_(draft.sheet, draft.row, draft.map, { 'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview });
    soloSetClientWorkflow_(clientId, SOLO.status.waitingReview);
    return { message: 'ย้ายกลับไปขั้นตรวจร่างแล้ว ข้อมูลฉบับสุดท้ายเดิมยังถูกเก็บไว้', details: soloWebUnwrap_(getClientDetails(clientId)) };
  });
}

function getSystemStatus() {
  return soloWebSafe_(function () {
    var ss = soloSpreadsheet_();
    var props = PropertiesService.getScriptProperties();
    var triggerHandlers = ScriptApp.getProjectTriggers().map(function (trigger) { return trigger.getHandlerFunction(); });
    return {
      spreadsheet: ss.getName(),
      timeZone: ss.getSpreadsheetTimeZone(),
      locale: ss.getSpreadsheetLocale(),
      model: soloModel_(),
      apiKeyConfigured: !!props.getProperty(SOLO.properties.apiKey),
      consultantEmail: props.getProperty(SOLO.properties.consultantEmail) || Session.getEffectiveUser().getEmail() || '',
      dashboardUrlConfigured: !!props.getProperty(SOLO.properties.dashboardUrl),
      sheets: Object.keys(SOLO.sheets).map(function (key) {
        var name = SOLO.sheets[key];
        return { name: name, exists: !!ss.getSheetByName(name) };
      }),
      triggers: {
        formSubmit: triggerHandlers.indexOf('onIntakeFormSubmit') !== -1,
        emailReader: triggerHandlers.indexOf('processUnreadRepliesScheduled') !== -1
      }
    };
  });
}

function soloEmptyLanes_() {
  return {
    newClient: { title: 'โปรไฟล์ใหม่', hint: 'ยังไม่ได้สร้างร่าง', items: [] },
    review: { title: 'รอตรวจร่าง', hint: 'AI ร่างแล้ว มนุษย์ต้องตรวจ', items: [] },
    finalReview: { title: 'รออนุมัติส่ง', hint: 'ข้อความพร้อมตรวจขั้นสุดท้าย', items: [] },
    sent: { title: 'ส่งแล้ว', hint: 'ติดตามผลและอีเมลตอบกลับ', items: [] }
  };
}

function soloWebLane_(workflow, draft, finalRow) {
  if (workflow === SOLO.status.sent) return 'sent';
  if (workflow === SOLO.status.waitingReview || workflow === SOLO.status.needsChanges || workflow === SOLO.status.agreed) return 'review';
  if (workflow === SOLO.status.waitingFinal || workflow === SOLO.status.approvedToSend) return 'finalReview';
  if (finalRow) {
    var finalStatus = soloText_(soloCell_(finalRow.values, finalRow.map, 'สถานะอนุมัติขั้นสุดท้าย'));
    if (finalStatus === SOLO.status.sent || soloText_(soloCell_(finalRow.values, finalRow.map, 'ส่งเมื่อ'))) return 'sent';
    return 'finalReview';
  }
  if (draft) return 'review';
  return 'newClient';
}

function soloWebIndexById_(sheetName) {
  var index = {};
  var sheet = soloSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) return index;
  var table = soloReadTable_(sheet);
  for (var i = 0; i < table.rows.length; i++) {
    var id = soloText_(soloCell_(table.rows[i], table.map, 'รหัสลูกค้า'));
    if (id) index[id] = { values: table.rows[i], map: table.map, row: i + 2, sheet: sheet };
  }
  return index;
}

function soloWebReplyCount_() {
  var count = {};
  var sheet = soloSpreadsheet_().getSheetByName(SOLO.sheets.replies);
  if (!sheet) return count;
  var table = soloReadTable_(sheet);
  table.rows.forEach(function (row) {
    var id = soloText_(soloCell_(row, table.map, 'รหัสลูกค้า'));
    if (id) count[id] = (count[id] || 0) + 1;
  });
  return count;
}

function soloWebReplies_(clientId) {
  var result = [];
  var sheet = soloSpreadsheet_().getSheetByName(SOLO.sheets.replies);
  if (!sheet) return result;
  var table = soloReadTable_(sheet);
  table.rows.forEach(function (row) {
    if (soloText_(soloCell_(row, table.map, 'รหัสลูกค้า')) !== clientId) return;
    result.push({
      readAt: soloText_(soloCell_(row, table.map, 'อ่านเมื่อ')),
      completed: soloText_(soloCell_(row, table.map, 'สิ่งที่ลูกค้าทำได้')),
      obstacles: soloText_(soloCell_(row, table.map, 'อุปสรรค')),
      questions: soloText_(soloCell_(row, table.map, 'คำถามของลูกค้า')),
      review: soloText_(soloCell_(row, table.map, 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ'))
    });
  });
  return result.reverse();
}

function soloWebFindValue_(headers, row, candidates) {
  for (var c = 0; c < candidates.length; c++) {
    for (var i = 0; i < headers.length; i++) {
      if (soloNormalize_(headers[i]) === soloNormalize_(candidates[c])) return soloText_(row[i]);
    }
  }
  return '';
}

function soloWebRequireId_(clientId) {
  clientId = soloText_(clientId);
  if (!clientId || !/^[A-Za-z0-9._-]{3,64}$/.test(clientId)) throw new Error('รหัสลูกค้าไม่ถูกต้อง');
  return clientId;
}

function soloWebSafe_(work) {
  try { return { ok: true, data: work() }; }
  catch (error) { return { ok: false, error: soloText_(error && error.message ? error.message : error) }; }
}

function soloWebUnwrap_(result) {
  if (!result || !result.ok) throw new Error(result && result.error ? result.error : 'ไม่สามารถอ่านรายละเอียดลูกค้าได้');
  return result.data;
}
