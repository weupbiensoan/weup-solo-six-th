/**
 * WEUP SoloSix — โมเดล 2
 * ฝั่งเซิร์ฟเวอร์ของ Dashboard
 *
 * สร้างไฟล์ Script ชื่อ WebApp ในโปรเจ็กต์เดียวกับ Main.gs แล้ววางไฟล์นี้
 * จากนั้นเลือก Deploy → New deployment → Web app และกำหนด Execute as: Me
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('SoloSix — ศูนย์ควบคุมการผลิตวิดีโอ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function openVideoDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(1180)
    .setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'ศูนย์ควบคุมการผลิตวิดีโอ');
}

function getVideoDashboardData() {
  return videoWebSafe_(function () {
    var ss = videoSpreadsheet_();
    var customerSheet = ss.getSheetByName(VIDEO.sheets.customers);
    if (!customerSheet) {
      return {
        ready: false,
        message: 'ยังไม่พบชีต “' + VIDEO.sheets.customers + '” กรุณาเตรียมระบบจาก Google Sheets ก่อน',
        generatedAt: videoNow_(),
        counts: { intake: 0, content: 0, production: 0, delivered: 0 },
        lanes: videoEmptyDashboardLanes_()
      };
    }
    videoEnsureCustomerColumns_(customerSheet);
    var customers = videoReadTable_(customerSheet);
    var contexts = videoDashboardContexts_();
    var lanes = videoEmptyDashboardLanes_();
    for (var i = 0; i < customers.rows.length; i++) {
      var customerId = videoText_(videoCell_(customers.rows[i], customers.map, 'CUSTOMER_ID'));
      if (!customerId) continue;
      var item = videoDashboardCustomer_(customers, customers.rows[i], i + 2, contexts);
      lanes[item.lane].items.push(item);
    }
    return {
      ready: true,
      message: '',
      generatedAt: videoNow_(),
      model: videoModel_(),
      counts: {
        intake: lanes.intake.items.length,
        content: lanes.content.items.length,
        production: lanes.production.items.length,
        delivered: lanes.delivered.items.length
      },
      lanes: lanes
    };
  });
}

function getVideoCustomerDetails(customerId) {
  return videoWebSafe_(function () {
    customerId = videoWebCustomerId_(customerId);
    var customer = videoFindCustomerById_(customerId);
    var details = {
      customerId: customerId,
      businessName: videoCustomerValue_(customer, VIDEO_QUESTIONS.businessName) || 'ไม่ระบุชื่อธุรกิจ',
      email: videoCustomerValue_(customer, VIDEO_QUESTIONS.email),
      industry: videoCustomerValue_(customer, VIDEO_QUESTIONS.industry),
      service: videoCustomerValue_(customer, VIDEO_QUESTIONS.service),
      audience: videoCustomerValue_(customer, VIDEO_QUESTIONS.audience),
      profileStatus: videoCustomerValue_(customer, 'PROFILE_STATUS'),
      workflowStatus: videoCustomerValue_(customer, 'WORKFLOW_STATUS'),
      sourceImagesUrl: videoCustomerValue_(customer, 'SOURCE_IMAGES_URL'),
      finalVideoUrl: videoCustomerValue_(customer, 'FINAL_VIDEO_URL'),
      deliveredAt: videoCustomerValue_(customer, 'DELIVERED_AT'),
      ideas: videoWebRowsForCustomer_(VIDEO.sheets.ideas, customerId, 24),
      scripts: videoWebRowsForCustomer_(VIDEO.sheets.scripts, customerId, 16),
      production: videoWebRowsForCustomer_(VIDEO.sheets.production, customerId, 16),
      feedback: videoWebRowsForCustomer_(VIDEO.sheets.feedback, customerId, 12)
    };
    try { details.deliveryCheck = videoDeliveryCheck_(customerId); }
    catch (checkError) { details.deliveryCheck = { ready: false, reasons: [checkError.message], fileCount: 0 }; }
    return details;
  });
}

function runVideoDashboardAction(action, customerId) {
  return videoWebSafe_(function () {
    customerId = videoWebCustomerId_(customerId);
    var customer = videoFindCustomerById_(customerId);
    var row = customer.row;
    var ss = videoSpreadsheet_();
    var customerSheet = videoSheet_(VIDEO.sheets.customers);
    ss.setActiveSheet(customerSheet);
    ss.setActiveRange(customerSheet.getRange(row, 1));
    var messages = {
      createFolders: 'สร้างโฟลเดอร์และส่งลิงก์รับรูปเรียบร้อย',
      reviewProfile: 'ตรวจข้อมูลลูกค้าเรียบร้อย',
      sendMissing: 'ส่งอีเมลขอข้อมูลเพิ่มเรียบร้อย',
      generateIdeas: 'สร้างไอเดียเรียบร้อย กรุณาตรวจและอนุมัติในชีต “' + VIDEO.sheets.ideas + '”',
      writeScripts: 'เขียนสคริปต์ที่อนุมัติเรียบร้อย',
      buildShots: 'สร้างแผนภาพของสคริปต์ที่อนุมัติเรียบร้อย',
      syncQc: 'ตรวจไฟล์จริงและอัปเดตชีต QC เรียบร้อย',
      deliver: 'ส่งมอบวิดีโอเรียบร้อย',
      feedback: 'อ่านและจัดหมวดหมู่อีเมลตอบกลับเรียบร้อย'
    };
    if (!messages[action]) throw new Error('คำสั่งนี้ไม่ได้รับอนุญาต');

    if (action === 'createFolders') {
      var folderResult = videoCreateFoldersForCustomer_(customerId, row);
      messages[action] = folderResult.emailSent ? 'สร้างโฟลเดอร์และส่งลิงก์รับรูปเรียบร้อย' : 'ตรวจพบโฟลเดอร์เดิม ระบบไม่ส่งอีเมลซ้ำ';
    }
    else if (action === 'reviewProfile') videoReviewCustomerProfile_(customerId, row);
    else if (action === 'sendMissing') videoSendMissingInfoEmail_(customerId, row);
    else if (action === 'generateIdeas') videoGenerateContentIdeas_(customerId, row);
    else if (action === 'writeScripts') {
      var scriptCount = videoWriteApprovedScripts_(customerId);
      messages[action] = scriptCount ? 'สร้างสคริปต์ ' + scriptCount + ' รายการ' : 'ไม่พบไอเดียที่อนุมัติและยังไม่มีสคริปต์';
    }
    else if (action === 'buildShots') {
      var shotCount = videoBuildApprovedShotPlans_(customerId);
      messages[action] = shotCount ? 'สร้างแผนภาพสำหรับ ' + shotCount + ' วิดีโอ' : 'ไม่พบสคริปต์ที่อนุมัติและยังไม่มีแผนภาพ';
    }
    else if (action === 'syncQc') videoSyncProductionQc_(customerId);
    else if (action === 'deliver') videoDeliverCustomer_(customerId, row, false);
    else if (action === 'feedback') messages[action] = videoProcessFeedback_();

    return { message: messages[action], data: getVideoDashboardData() };
  });
}

function videoDashboardContexts_() {
  return {
    profiles: videoWebIndexByCustomer_(VIDEO.sheets.profiles),
    ideas: videoWebGroupByCustomer_(VIDEO.sheets.ideas),
    scripts: videoWebGroupByCustomer_(VIDEO.sheets.scripts),
    shots: videoWebGroupByCustomer_(VIDEO.sheets.shots),
    production: videoWebGroupByCustomer_(VIDEO.sheets.production),
    feedback: videoWebGroupByCustomer_(VIDEO.sheets.feedback)
  };
}

function videoDashboardCustomer_(table, row, rowNumber, contexts) {
  var customerId = videoText_(videoCell_(row, table.map, 'CUSTOMER_ID'));
  var workflow = videoText_(videoCell_(row, table.map, 'WORKFLOW_STATUS')) || VIDEO.status.newCustomer;
  var profileStatus = videoText_(videoCell_(row, table.map, 'PROFILE_STATUS')) || VIDEO.status.waitingFiles;
  var deliveredAt = videoText_(videoCell_(row, table.map, 'DELIVERED_AT'));
  var ideas = contexts.ideas[customerId] || [];
  var scripts = contexts.scripts[customerId] || [];
  var shots = contexts.shots[customerId] || [];
  var production = contexts.production[customerId] || [];
  var feedback = contexts.feedback[customerId] || [];
  var approvedIdeas = videoWebCount_(ideas, 'APPROVAL', VIDEO.status.approved);
  var approvedScripts = videoWebCount_(scripts, 'APPROVAL', VIDEO.status.approved);
  var approvedVideos = videoWebCount_(production, 'FINAL_APPROVAL', VIDEO.status.approved);
  var expected = Number(videoCell_(row, table.map, 'VIDEOS_EXPECTED') || 12);
  var lane = 'intake';
  var nextAction = 'สร้างโฟลเดอร์รับรูป';
  var action = 'createFolders';

  if (deliveredAt || workflow === VIDEO.status.delivered) {
    lane = 'delivered'; nextAction = 'ตรวจฟีดแบ็กใหม่'; action = 'feedback';
  } else if (production.length || shots.length) {
    lane = 'production'; nextAction = approvedVideos >= expected ? 'ส่งมอบวิดีโอ' : 'ตรวจไฟล์จริงและบันทึก QC'; action = approvedVideos >= expected ? 'deliver' : 'syncQc';
  } else if (ideas.length || scripts.length || profileStatus === VIDEO.status.complete) {
    lane = 'content';
    if (!ideas.length) { nextAction = 'สร้างไอเดีย 20 แนว'; action = 'generateIdeas'; }
    else if (!scripts.length) { nextAction = 'เขียนสคริปต์ที่อนุมัติ'; action = 'writeScripts'; }
    else { nextAction = 'สร้างแผนภาพที่อนุมัติ'; action = 'buildShots'; }
  } else if (profileStatus === VIDEO.status.needsMore) {
    nextAction = 'ส่งอีเมลขอข้อมูลเพิ่ม'; action = 'sendMissing';
  } else if (videoText_(videoCell_(row, table.map, 'SOURCE_IMAGES_URL'))) {
    nextAction = 'ตรวจข้อมูลและไฟล์ลูกค้า'; action = 'reviewProfile';
  }

  return {
    lane: lane,
    rowNumber: rowNumber,
    customerId: customerId,
    businessName: videoText_(videoCell_(row, table.map, VIDEO_QUESTIONS.businessName)) || 'ไม่ระบุชื่อธุรกิจ',
    email: videoText_(videoCell_(row, table.map, VIDEO_QUESTIONS.email)),
    profileStatus: profileStatus,
    workflowStatus: workflow,
    sourceImageCount: Number(videoCell_(row, table.map, 'SOURCE_IMAGE_COUNT') || 0),
    expectedVideos: expected,
    progress: {
      ideas: ideas.length,
      approvedIdeas: approvedIdeas,
      scripts: scripts.length,
      approvedScripts: approvedScripts,
      plannedScenes: shots.length,
      production: production.length,
      approvedVideos: approvedVideos,
      feedback: feedback.length
    },
    nextAction: nextAction,
    action: action
  };
}

function videoEmptyDashboardLanes_() {
  return {
    intake: { title: 'รับข้อมูลและไฟล์', description: 'สร้างโฟลเดอร์ ตรวจรูป และขอข้อมูลที่ยังขาด', items: [] },
    content: { title: 'ไอเดียและสคริปต์', description: 'ตรวจและอนุมัติก่อนให้ AI ทำขั้นตอนถัดไป', items: [] },
    production: { title: 'ผลิตและตรวจ QC', description: 'เทียบกับไฟล์จริงและอนุมัติวิดีโอสุดท้าย', items: [] },
    delivered: { title: 'ส่งมอบและฟีดแบ็ก', description: 'ติดตามคำตอบโดยไม่ตอบลูกค้าอัตโนมัติ', items: [] }
  };
}

function videoWebRowsForCustomer_(sheetName, customerId, limit) {
  var sheet = videoSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var table = videoReadTable_(sheet);
  var result = [];
  for (var i = 0; i < table.rows.length && result.length < limit; i++) {
    if (videoText_(videoCell_(table.rows[i], table.map, 'CUSTOMER_ID')) === customerId) result.push(videoRowObject_(table.headers, table.rows[i]));
  }
  return result;
}

function videoWebIndexByCustomer_(sheetName) {
  var grouped = videoWebGroupByCustomer_(sheetName);
  var result = {};
  Object.keys(grouped).forEach(function (key) { result[key] = grouped[key][0]; });
  return result;
}

function videoWebGroupByCustomer_(sheetName) {
  var result = {};
  var sheet = videoSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return result;
  var table = videoReadTable_(sheet);
  table.rows.forEach(function (row) {
    var customerId = videoText_(videoCell_(row, table.map, 'CUSTOMER_ID'));
    if (!customerId) return;
    if (!result[customerId]) result[customerId] = [];
    result[customerId].push({ values: row, map: table.map, headers: table.headers });
  });
  return result;
}

function videoWebCount_(items, header, expectedValue) {
  var count = 0;
  items.forEach(function (item) {
    if (videoText_(videoCell_(item.values, item.map, header)) === expectedValue) count++;
  });
  return count;
}

function videoWebCustomerId_(customerId) {
  var value = videoText_(customerId);
  if (!/^THV-\d{6}-\d{4,}$/.test(value)) throw new Error('รหัสลูกค้าไม่ถูกต้อง');
  return value;
}

function videoWebSafe_(callback) {
  try { return { ok: true, result: callback() }; }
  catch (error) {
    console.error(error.stack || error.message || error);
    return { ok: false, error: error.message || String(error) };
  }
}
