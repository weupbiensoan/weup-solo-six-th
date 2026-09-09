/**
 * WEUP SoloSix — โมเดล 2
 * ระบบผลิตวิดีโอสั้น 12 คลิปต่อเดือนสำหรับธุรกิจขนาดเล็กในประเทศไทย
 *
 * วิธีติดตั้ง
 * 1) วางไฟล์นี้ใน Code.gs หรือ Main.gs ของโปรเจ็กต์ Apps Script ที่ผูกกับ Google Sheets
 * 2) เพิ่ม Script Property ชื่อ OPENAI_API_KEY
 * 3) เพิ่ม WebApp.gs และไฟล์ HTML ชื่อ Dashboard ในโปรเจ็กต์เดียวกัน
 * 4) โหลด Google Sheets ใหม่ แล้วเลือกเมนู “การผลิตวิดีโอ” → “1. เตรียมระบบและชีต”
 *
 * ระบบไม่ลบข้อมูลเดิม ไม่เปิดโฟลเดอร์หลักเป็นสาธารณะ และไม่ส่งข้อมูลติดต่อให้ AI
 */

var VIDEO = {
  timeZone: 'Asia/Bangkok',
  locale: 'th_TH',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'gpt-4.1-mini',
  maxItemsPerRun: 4,
  maxRuntimeMs: 270000,
  sheets: {
    customers: 'ลูกค้า',
    profiles: 'โปรไฟล์',
    ideas: 'ไอเดีย',
    scripts: 'สคริปต์',
    shots: 'แผนภาพ',
    production: 'การผลิต',
    feedback: 'ฟีดแบ็ก',
    metrics: 'ตัวชี้วัด',
    settings: 'การตั้งค่า'
  },
  properties: {
    apiKey: 'OPENAI_API_KEY',
    model: 'OPENAI_MODEL',
    spreadsheetId: 'SOLOSIX_M2_SPREADSHEET_ID',
    formId: 'SOLOSIX_M2_FORM_ID',
    rootFolderId: 'SOLOSIX_M2_ROOT_FOLDER_ID',
    customerCounter: 'SOLOSIX_M2_CUSTOMER_COUNTER',
    operatorEmail: 'OPERATOR_EMAIL',
    dashboardUrl: 'LINK_DASHBOARD'
  },
  folders: {
    root: 'VIDEO_PRODUCTION',
    profile: '01_PROFILE',
    scripts: '02_SCRIPTS',
    raw: '03_VIDEO_RAW',
    final: '04_VIDEO_FINAL',
    scenes: '05_AI_SCENES',
    product: 'PRODUCT',
    presenter: 'PRESENTER',
    logo: 'LOGO'
  },
  status: {
    newCustomer: 'ลูกค้าใหม่',
    waitingFiles: 'รอไฟล์ต้นฉบับ',
    needsMore: 'ต้องขอข้อมูลเพิ่ม',
    complete: 'ข้อมูลครบ',
    waitingReview: 'รอตรวจสอบ',
    approved: 'อนุมัติ',
    rejected: 'ไม่ใช้',
    readyForQc: 'พร้อมตรวจ QC',
    needsFix: 'ต้องแก้ไข',
    passedQc: 'ผ่าน QC',
    delivered: 'ส่งมอบแล้ว'
  },
  promptKeys: {
    profile: 'PROMPT_PROFILE_REVIEW',
    ideas: 'PROMPT_CONTENT_IDEAS',
    script: 'PROMPT_VIDEO_SCRIPT',
    shots: 'PROMPT_SHOT_PLAN',
    feedback: 'PROMPT_FEEDBACK_CLASSIFICATION'
  }
};

var VIDEO_QUESTIONS = {
  email: 'อีเมลสำหรับรับมอบงาน',
  businessName: 'ชื่อธุรกิจ',
  industry: 'ประเภทธุรกิจและพื้นที่ให้บริการ',
  service: 'สินค้าหรือบริการที่ต้องการโปรโมต',
  audience: 'กลุ่มลูกค้าเป้าหมาย',
  problems: 'ปัญหาหลัก 3 ข้อของลูกค้า',
  price: 'ราคาและเงื่อนไขที่อนุญาตให้กล่าวถึง',
  evidence: 'ข้อมูลจริง หลักฐาน หรือคำรับรองที่อนุญาตให้ใช้',
  forbiddenClaims: 'ข้อความหรือคำสัญญาที่ห้ามกล่าวถึง',
  brandStyle: 'สไตล์และน้ำเสียงของแบรนด์',
  social: 'ช่องทางโซเชียลมีเดียของธุรกิจ',
  products: 'รายการสินค้าที่ต้องปรากฏในวิดีโอ',
  presenter: 'รายละเอียดผู้แทนธุรกิจหรือบุคคลอ้างอิง',
  imageRights: 'การยืนยันสิทธิ์ใช้รูปภาพ'
};

var VIDEO_CUSTOMER_SYSTEM_HEADERS = [
  'CUSTOMER_ID', 'DRIVE_URL', 'SOURCE_IMAGES_URL', 'FINAL_VIDEO_URL',
  'PROFILE_STATUS', 'IDEA_APPROVAL', 'SCRIPT_APPROVAL', 'FINAL_APPROVAL',
  'DELIVERY_BATCH', 'VIDEOS_EXPECTED', 'SOURCE_IMAGE_COUNT',
  'SOURCE_LINK_SENT_AT', 'DELIVERED_AT', 'WORKFLOW_STATUS', 'SYSTEM_NOTE'
];

var VIDEO_HEADERS = {
  profiles: [
    'CUSTOMER_ID', 'RUN_AT', 'BUSINESS_SUMMARY', 'PRIMARY_SERVICE', 'TARGET_AUDIENCE',
    'MISSING_DATA', 'MISSING_IMAGES', 'NEEDS_CONFIRMATION', 'PROFILE_STATUS',
    'REQUEST_SENT_AT', 'RAW_JSON', 'ERROR'
  ],
  ideas: [
    'CUSTOMER_ID', 'IDEA_ID', 'CONTENT_ANGLE', 'PROBLEM_SOLVED', 'CORE_MESSAGE',
    'TARGET_AUDIENCE', 'VIDEO_FORMAT', 'PRODUCT_FEATURED', 'NEEDS_CONFIRMATION',
    'APPROVAL', 'CREATED_AT', 'RAW_JSON', 'ERROR'
  ],
  scripts: [
    'CUSTOMER_ID', 'VIDEO_ID', 'IDEA_ID', 'TOPIC', 'HOOK', 'SCRIPT_BODY', 'CTA',
    'DURATION_SECONDS', 'NEEDS_CONFIRMATION', 'APPROVAL', 'DELIVERY_BATCH',
    'CREATED_AT', 'RAW_JSON', 'ERROR'
  ],
  shots: [
    'CUSTOMER_ID', 'VIDEO_ID', 'SCENE_ORDER', 'VOICEOVER', 'VISUAL_DESCRIPTION',
    'SCENE_TYPE', 'REFERENCE_IMAGE', 'GENERATION_PROMPT', 'TOOL', 'ON_SCREEN_TEXT',
    'CAPCUT_NOTE', 'CREATED_AT', 'RAW_JSON', 'ERROR'
  ],
  production: [
    'CUSTOMER_ID', 'VIDEO_ID', 'DELIVERY_BATCH', 'TOPIC', 'FILE_NAME', 'FILE_SIZE_MB',
    'FILE_STATUS', 'IMAGE_MATCH_CHECK', 'SUBTITLE_CHECK', 'CLAIM_CHECK', 'QC_RESULT',
    'QC_BY', 'QC_AT', 'FINAL_APPROVAL', 'QC_NOTE'
  ],
  feedback: [
    'CUSTOMER_ID', 'RECEIVED_AT', 'MESSAGE_ID', 'REQUEST_INDEX', 'EMAIL_SUBJECT',
    'SENDER', 'REQUEST_TEXT', 'CATEGORY', 'RELATED_VIDEO_ID', 'CLASSIFICATION_REASON',
    'RECOMMENDED_ACTION', 'RAW_JSON', 'PROCESSED'
  ],
  metrics: [
    'CUSTOMER_ID', 'VIDEO_ID', 'PLATFORM', 'PUBLISHED_AT', 'VIEWS', 'ENGAGEMENTS',
    'SAVES', 'INQUIRIES', 'NOTE'
  ],
  settings: ['KEY', 'VALUE', 'NOTE']
};

var VIDEO_COMMON_RULES =
  'กติกาบังคับ:\n' +
  '1. ห้ามแต่งตัวเลข ผลลัพธ์ รางวัล ใบรับรอง ราคา หรือคำรับรองที่ไม่มีในข้อมูลต้นทาง\n' +
  '2. ข้อมูลที่ยังไม่ยืนยันต้องอยู่ใน NEEDS_CONFIRMATION และห้ามกล่าวเป็นข้อเท็จจริง\n' +
  '3. ใช้เฉพาะชื่อไฟล์ภาพที่มีอยู่จริงในรายการที่ส่งให้ ห้ามสร้างชื่อไฟล์ขึ้นเอง\n' +
  '4. วิดีโอสร้างจากรูปภาพที่ลูกค้าอนุญาตให้ใช้ ไม่กำหนดฉากที่ต้องถ่ายลูกค้าหรือสถานที่จริงเพิ่มเติม\n' +
  '5. ใช้บริบทธุรกิจขนาดเล็กในประเทศไทย ราคาเป็นเงินบาท และเขียนภาษาไทยธรรมชาติ\n' +
  '6. AI ทำหน้าที่ร่างและจัดหมวดหมู่เท่านั้น มนุษย์ต้องอนุมัติไอเดีย สคริปต์ และวิดีโอสุดท้าย\n' +
  '7. ตอบเป็น JSON ที่ถูกต้องเพียงหนึ่ง object ห้ามใส่ markdown หรือข้อความนอก JSON\n';

var VIDEO_DEFAULT_SETTINGS = [
  ['MODEL', 'gpt-4.1-mini', 'ชื่อโมเดล OpenAI ใช้ OPENAI_MODEL ใน Script Properties เพื่อแทนค่านี้ได้'],
  ['MAX_COMPLETION_TOKENS', '5000', 'จำนวนโทเค็นสูงสุดสำหรับงานสร้างเนื้อหา'],
  ['TEMPERATURE', '0.3', 'ค่าความหลากหลายของคำตอบ 0 ถึง 1'],
  ['VIDEOS_PER_PACKAGE', '12', 'จำนวนวิดีโอที่ต้องมีครบก่อนส่งมอบ'],
  ['MAX_ITEMS_PER_RUN', '4', 'จำนวนสูงสุดต่อการเรียกหนึ่งครั้ง'],
  ['MIN_PRODUCT_IMAGES', '3', 'จำนวนรูปสินค้าขั้นต่ำ'],
  ['MIN_PRESENTER_IMAGES', '3', 'จำนวนรูปผู้แทนธุรกิจขั้นต่ำ'],
  ['MIN_LOGO_FILES', '1', 'จำนวนไฟล์โลโก้ขั้นต่ำ'],
  ['REVISION_SCOPE', 'แก้ไขได้ 1 รอบต่อวิดีโอ ไม่เกิน 2 จุด และไม่เปลี่ยนทิศทางจากสคริปต์ที่อนุมัติแล้ว', 'ข้อความที่ใส่ในอีเมลส่งมอบ'],
  ['REVISION_DEADLINE', 'ภายใน 3 วันทำการนับจากวันที่ได้รับอีเมลส่งมอบ', 'กำหนดเวลารับคำขอแก้ไข'],
  ['EMAIL_SIGNATURE', 'ขอแสดงความนับถือ\nทีมผลิตคอนเทนต์ WEUP SoloSix', 'ลายเซ็นอีเมล'],
  ['PROMPT_PROFILE_REVIEW',
    'คุณเป็นผู้ช่วยตรวจข้อมูลเริ่มต้นสำหรับบริการผลิตวิดีโอสั้น 12 คลิปต่อเดือน ตรวจข้อมูลธุรกิจและรายการไฟล์ภาพ แล้วตอบ JSON: {"business_summary":"","primary_service":"","target_audience":"","missing_data":[],"missing_images":[],"needs_confirmation":[],"profile_status":"ต้องขอข้อมูลเพิ่ม หรือ ข้อมูลครบ"} หากจำนวนรูปไม่ถึงเกณฑ์หรือยังไม่ยืนยันสิทธิ์ใช้ภาพ ให้ profile_status เป็น ต้องขอข้อมูลเพิ่ม',
    'พรอมต์ตรวจโปรไฟล์'],
  ['PROMPT_CONTENT_IDEAS',
    'คุณเป็นนักวางแผนคอนเทนต์วิดีโอสั้นสำหรับธุรกิจขนาดเล็กในประเทศไทย สร้างแนวคิดที่ผลิตได้จากรูปสินค้า รูปผู้แทนธุรกิจ โลโก้ ฉาก AI และกราฟิกตัวอักษรเท่านั้น ตอบ JSON: {"ideas":[{"content_angle":"","problem_solved":"","core_message":"","target_audience":"","video_format":"","product_featured":"","needs_confirmation":""}]} ต้องมี 20 รายการและห้ามกำหนดฉากที่ต้องถ่ายใหม่',
    'พรอมต์สร้างไอเดีย 20 แนว'],
  ['PROMPT_VIDEO_SCRIPT',
    'คุณเป็นผู้เขียนสคริปต์วิดีโอแนวตั้ง 30-60 วินาทีสำหรับตลาดไทย ใช้เฉพาะไอเดียและข้อมูลที่อนุมัติแล้ว ตอบ JSON: {"topic":"","hook":"","script_body":"แต่ละประโยคขึ้นบรรทัดใหม่","cta":"","duration_seconds":0,"needs_confirmation":""}',
    'พรอมต์เขียนสคริปต์'],
  ['PROMPT_SHOT_PLAN',
    'คุณเป็นผู้วางแผนภาพสำหรับวิดีโอที่สร้างจากรูปภาพอ้างอิง แบ่งสคริปต์เป็นฉากและตอบ JSON: {"scenes":[{"scene_order":1,"voiceover":"","visual_description":"","scene_type":"PRODUCT หรือ PRESENTER หรือ ILLUSTRATION หรือ GRAPHIC","reference_image":"","generation_prompt":"","tool":"VEO หรือ SEEDANCE หรือ CAPCUT","on_screen_text":"","capcut_note":""}]} PRODUCT และ PRESENTER ต้องอ้างอิงชื่อไฟล์จริง หากไม่มีให้ใส่ MISSING_IMAGE ส่วน ILLUSTRATION และ GRAPHIC ให้ reference_image ว่าง',
    'พรอมต์สร้างแผนภาพ'],
  ['PROMPT_FEEDBACK_CLASSIFICATION',
    'คุณเป็นผู้ช่วยจัดหมวดหมู่อีเมลหลังส่งมอบวิดีโอ แยกแต่ละคำขอเป็นหนึ่งรายการและตอบ JSON: {"requests":[{"request_text":"","category":"ข้อผิดพลาดจากผู้ให้บริการ หรือ อยู่ในรอบแก้ไข หรือ งานเพิ่มเติม","related_video_id":"","classification_reason":"","recommended_action":""}]} ห้ามตอบลูกค้า ห้ามกำหนดราคา และห้ามรับปากแทนผู้ให้บริการ',
    'พรอมต์จัดหมวดหมู่ฟีดแบ็ก']
];

function onOpen() {
  var ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (noUi) {
    console.log('เมนูจะถูกสร้างอัตโนมัติเมื่อเปิด Google Sheets');
    return;
  }
  ui
    .createMenu('การผลิตวิดีโอ')
    .addItem('1. เตรียมระบบและชีต', 'setupVideoSystem')
    .addItem('2. สร้างแบบฟอร์มรับข้อมูล', 'createVideoIntakeForm')
    .addItem('3. สร้างโฟลเดอร์สำหรับแถวที่เลือก', 'createSelectedCustomerFolders')
    .addItem('4. ตรวจสอบข้อมูลลูกค้า', 'reviewSelectedCustomerProfile')
    .addItem('5. ส่งอีเมลขอข้อมูลเพิ่ม', 'sendSelectedMissingInfoEmail')
    .addSeparator()
    .addItem('6. สร้างมุมเนื้อหา 20 แนว', 'generateSelectedContentIdeas')
    .addItem('7. เขียนสคริปต์ที่อนุมัติแล้ว', 'writeApprovedVideoScripts')
    .addItem('8. สร้างแผนภาพที่อนุมัติแล้ว', 'buildApprovedShotPlans')
    .addSeparator()
    .addItem('9. บันทึกผล QC จากไฟล์จริง', 'syncSelectedProductionQc')
    .addItem('10. ส่งมอบวิดีโอผ่าน Gmail', 'deliverSelectedVideos')
    .addItem('11. อ่านและจัดหมวดหมู่อีเมลตอบกลับ', 'processVideoFeedback')
    .addSeparator()
    .addItem('12. เปิด Dashboard', 'openVideoDashboard')
    .addItem('13. ทดสอบ OpenAI API', 'testVideoOpenAIConnection')
    .addItem('14. ติดตั้งทริกเกอร์', 'installVideoTriggers')
    .addToUi();
}

function setupVideoSystem() {
  try {
    videoSetupSystem_();
    videoNotify_('เตรียมระบบเรียบร้อย', 'สร้างชีต หัวตาราง ค่าเริ่มต้น และรายการสถานะสำหรับตลาดประเทศไทยแล้ว โดยไม่ลบข้อมูลเดิม');
  } catch (error) {
    videoFail_('เตรียมระบบไม่สำเร็จ', error);
  }
}

function videoSetupSystem_() {
  var ss = videoSpreadsheet_();
  PropertiesService.getScriptProperties().setProperty(VIDEO.properties.spreadsheetId, ss.getId());
  ss.setSpreadsheetTimeZone(VIDEO.timeZone);
  try { ss.setSpreadsheetLocale(VIDEO.locale); } catch (ignoreLocale) {}
  videoEnsureCustomerSheet_();
  videoEnsureSheet_(VIDEO.sheets.profiles, VIDEO_HEADERS.profiles);
  videoEnsureSheet_(VIDEO.sheets.ideas, VIDEO_HEADERS.ideas);
  videoEnsureSheet_(VIDEO.sheets.scripts, VIDEO_HEADERS.scripts);
  videoEnsureSheet_(VIDEO.sheets.shots, VIDEO_HEADERS.shots);
  videoEnsureSheet_(VIDEO.sheets.production, VIDEO_HEADERS.production);
  videoEnsureSheet_(VIDEO.sheets.feedback, VIDEO_HEADERS.feedback);
  videoEnsureSheet_(VIDEO.sheets.metrics, VIDEO_HEADERS.metrics);
  videoEnsureSheet_(VIDEO.sheets.settings, VIDEO_HEADERS.settings);
  videoSeedSettings_();
  videoApplyValidations_();
}

function createVideoIntakeForm() {
  try {
    videoSetupSystem_();
    var ss = videoSpreadsheet_();
    var props = PropertiesService.getScriptProperties();
    var existingId = props.getProperty(VIDEO.properties.formId);
    if (existingId) {
      try {
        var existingForm = FormApp.openById(existingId);
        videoNotify_('มีแบบฟอร์มอยู่แล้ว', 'ลิงก์สำหรับลูกค้า:\n' + existingForm.getPublishedUrl() + '\n\nลิงก์แก้ไข:\n' + existingForm.getEditUrl());
        return;
      } catch (ignoreMissingForm) {}
    }

    var oldCustomerSheet = ss.getSheetByName(VIDEO.sheets.customers);
    if (oldCustomerSheet && oldCustomerSheet.getLastRow() > 1) {
      throw new Error('ชีต “' + VIDEO.sheets.customers + '” มีข้อมูลแล้ว ระบบจึงไม่แทนที่เพื่อป้องกันข้อมูลสูญหาย');
    }
    var oldSheetIds = {};
    ss.getSheets().forEach(function (sheet) { oldSheetIds[sheet.getSheetId()] = true; });

    var form = FormApp.create('แบบฟอร์มเริ่มต้นงานวิดีโอสั้น 12 คลิป');
    form.setDescription(
      'กรุณากรอกข้อมูลจริงที่อนุญาตให้ใช้ในการผลิตวิดีโอ ระบบจะสร้างลิงก์โฟลเดอร์ส่วนตัวสำหรับอัปโหลดรูปสินค้า รูปผู้แทนธุรกิจ และโลโก้ภายหลัง\n\n' +
      'ห้ามส่งข้อมูลส่วนบุคคลของลูกค้าปลายทางหรือหลักฐานที่คุณไม่มีสิทธิ์ใช้งาน');
    form.setCollectEmail(false);
    form.setProgressBar(true);
    videoAddThaiQuestions_(form);
    if (typeof form.setPublished === 'function') form.setPublished(true);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    SpreadsheetApp.flush();
    var responseSheet = null;
    for (var attempt = 0; attempt < 10 && !responseSheet; attempt++) {
      Utilities.sleep(1000);
      SpreadsheetApp.flush();
      ss.getSheets().forEach(function (sheet) {
        if (!oldSheetIds[sheet.getSheetId()] && !responseSheet) responseSheet = sheet;
      });
    }
    if (!responseSheet) throw new Error('สร้างแบบฟอร์มแล้วแต่ยังไม่พบชีตคำตอบ กรุณารอสักครู่แล้วลองใหม่');
    if (oldCustomerSheet && oldCustomerSheet.getSheetId() !== responseSheet.getSheetId()) {
      oldCustomerSheet.setName('ลูกค้า_สำรอง_' + Utilities.formatDate(new Date(), VIDEO.timeZone, 'yyyyMMdd_HHmmss'));
    }
    responseSheet.setName(VIDEO.sheets.customers);
    videoEnsureCustomerColumns_(responseSheet);
    responseSheet.setFrozenRows(1);
    props.setProperty(VIDEO.properties.formId, form.getId());
    videoInstallFormTrigger_();
    videoNotify_('สร้างแบบฟอร์มเรียบร้อย', 'ลิงก์สำหรับลูกค้า:\n' + form.getPublishedUrl() + '\n\nลิงก์แก้ไข:\n' + form.getEditUrl());
  } catch (error) {
    videoFail_('สร้างแบบฟอร์มไม่สำเร็จ', error);
  }
}

function videoAddThaiQuestions_(form) {
  form.addSectionHeaderItem().setTitle('1. ข้อมูลติดต่อและธุรกิจ');
  form.addTextItem().setTitle(VIDEO_QUESTIONS.email).setRequired(true).setValidation(
    FormApp.createTextValidation().requireTextIsEmail().setHelpText('กรุณากรอกอีเมลที่ใช้งานได้').build());
  form.addTextItem().setTitle(VIDEO_QUESTIONS.businessName).setRequired(true);
  form.addTextItem().setTitle(VIDEO_QUESTIONS.industry).setHelpText('ตัวอย่าง: ร้านสกินแคร์ออนไลน์ ส่งทั่วประเทศไทย').setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.service).setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.audience).setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.problems).setHelpText('ระบุ 3 ข้อจากข้อมูลจริงของธุรกิจ').setRequired(true);

  form.addSectionHeaderItem().setTitle('2. ข้อมูลที่อนุญาตให้ใช้ในวิดีโอ');
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.price).setHelpText('ระบุเป็นเงินบาท พร้อมเงื่อนไขและช่วงเวลาที่ใช้ได้').setRequired(false);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.evidence).setHelpText('เช่น คุณสมบัติสินค้า รีวิวที่ได้รับอนุญาต หรือปล่อยว่าง').setRequired(false);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.forbiddenClaims).setHelpText('เช่น ห้ามรับประกันผลลัพธ์ หรือห้ามกล่าวถึงคู่แข่ง').setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.brandStyle).setHelpText('ตัวอย่าง: เป็นกันเอง กระชับ ไม่ขายตรงเกินไป').setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.social).setRequired(false);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.products).setRequired(true);
  form.addParagraphTextItem().setTitle(VIDEO_QUESTIONS.presenter).setHelpText('หากไม่มีผู้แทนธุรกิจ ให้ระบุว่าไม่มี').setRequired(true);
  form.addMultipleChoiceItem().setTitle(VIDEO_QUESTIONS.imageRights).setChoiceValues([
    'ยืนยันว่ามีสิทธิ์ใช้รูปทั้งหมดเพื่อผลิตและเผยแพร่วิดีโอ',
    'ยังไม่ยืนยัน ต้องตรวจสอบเพิ่มเติม'
  ]).setRequired(true);
}

function onVideoIntakeSubmit(event) {
  try {
    if (!event || !event.range) return;
    var sheet = event.range.getSheet();
    if (sheet.getName() !== VIDEO.sheets.customers) return;
    videoEnsureCustomerColumns_(sheet);
    var row = event.range.getRow();
    var customerId = videoAssignCustomerId_(sheet, row);
    videoWriteNamedValues_(sheet, row, videoHeaderMap_(sheet), {
      'PROFILE_STATUS': VIDEO.status.waitingFiles,
      'WORKFLOW_STATUS': VIDEO.status.newCustomer,
      'VIDEOS_EXPECTED': videoNumberSetting_('VIDEOS_PER_PACKAGE', 12)
    });
    videoNotifyOperator_(customerId, sheet);
  } catch (error) {
    console.error('onVideoIntakeSubmit: ' + error.message);
  }
}

function createSelectedCustomerFolders() {
  try {
    var context = videoSelectedCustomer_();
    var links = videoCreateFoldersForCustomer_(context.customerId, context.row);
    var emailNote = links.emailSent ? '\n\nส่งลิงก์รับรูปให้ลูกค้าแล้ว' : '\n\nลิงก์เคยถูกส่งแล้ว ระบบจึงไม่ส่งอีเมลซ้ำ';
    videoNotify_('สร้างโฟลเดอร์เรียบร้อย', 'รหัสลูกค้า: ' + context.customerId + '\n\nโฟลเดอร์รับรูป:\n' + links.sourceImagesUrl + '\n\nโฟลเดอร์วิดีโอสุดท้าย:\n' + links.finalVideoUrl + emailNote);
  } catch (error) {
    videoFail_('สร้างโฟลเดอร์ไม่สำเร็จ', error);
  }
}

function videoCreateFoldersForCustomer_(customerId, rowNumber) {
  var sheet = videoSheet_(VIDEO.sheets.customers);
  var map = videoHeaderMap_(sheet);
  var currentCustomer = videoCustomerByRow_(rowNumber);
  var sourceLinkSentAt = videoCustomerValue_(currentCustomer, 'SOURCE_LINK_SENT_AT');
  var email = videoText_(sheet.getRange(rowNumber, videoRequiredColumn_(map, VIDEO_QUESTIONS.email) + 1).getValue());
  var root = videoRootFolder_();
  var customerFolder = videoGetOrCreateFolder_(root, customerId);
  var profileFolder = videoGetOrCreateFolder_(customerFolder, VIDEO.folders.profile);
  videoGetOrCreateFolder_(customerFolder, VIDEO.folders.scripts);
  videoGetOrCreateFolder_(customerFolder, VIDEO.folders.raw);
  var finalFolder = videoGetOrCreateFolder_(customerFolder, VIDEO.folders.final);
  videoGetOrCreateFolder_(customerFolder, VIDEO.folders.scenes);
  videoGetOrCreateFolder_(profileFolder, VIDEO.folders.product);
  videoGetOrCreateFolder_(profileFolder, VIDEO.folders.presenter);
  videoGetOrCreateFolder_(profileFolder, VIDEO.folders.logo);

  if (email) {
    try { profileFolder.addEditor(email); }
    catch (permissionError) { console.warn('เพิ่มสิทธิ์โฟลเดอร์ไม่ได้: ' + permissionError.message); }
  }
  var links = {
    driveUrl: customerFolder.getUrl(),
    sourceImagesUrl: profileFolder.getUrl(),
    finalVideoUrl: finalFolder.getUrl()
  };
  videoWriteNamedValues_(sheet, rowNumber, map, {
    'DRIVE_URL': links.driveUrl,
    'SOURCE_IMAGES_URL': links.sourceImagesUrl,
    'FINAL_VIDEO_URL': links.finalVideoUrl,
    'PROFILE_STATUS': VIDEO.status.waitingFiles,
    'WORKFLOW_STATUS': VIDEO.status.waitingFiles,
    'SYSTEM_NOTE': 'สร้างโฟลเดอร์เมื่อ ' + videoNow_()
  });
  if (!sourceLinkSentAt) {
    videoSendSourceImageEmail_(customerId, rowNumber, links.sourceImagesUrl);
    videoWriteNamedValues_(sheet, rowNumber, map, { 'SOURCE_LINK_SENT_AT': videoNow_() });
  }
  links.emailSent = !sourceLinkSentAt;
  return links;
}

function videoSendSourceImageEmail_(customerId, rowNumber, sourceUrl) {
  var customer = videoCustomerByRow_(rowNumber);
  var email = videoCustomerValue_(customer, VIDEO_QUESTIONS.email);
  var business = videoCustomerValue_(customer, VIDEO_QUESTIONS.businessName) || customerId;
  if (!email) throw new Error('ไม่พบอีเมลสำหรับรับมอบงาน');
  var body =
    'สวัสดีทีม ' + business + '\n\n' +
    'ระบบสร้างพื้นที่รับไฟล์สำหรับรหัส ' + customerId + ' แล้ว กรุณาอัปโหลดเฉพาะรูปที่คุณมีสิทธิ์ใช้ลงในโฟลเดอร์นี้:\n' + sourceUrl + '\n\n' +
    'PRODUCT: รูปสินค้าอย่างน้อย 3 รูปต่อสินค้า พื้นหลังชัด เห็นฉลากและบรรจุภัณฑ์\n' +
    'PRESENTER: รูปคนเดียวกันอย่างน้อย 3 มุม หากต้องการใช้ผู้แทนธุรกิจ\n' +
    'LOGO: ไฟล์ PNG พื้นหลังโปร่งใสหรือ SVG อย่างน้อย 1 ไฟล์\n\n' +
    'ตั้งชื่อไฟล์ให้สื่อความหมาย เช่น PRODUCT_01.jpg, PRESENTER_01.jpg และ LOGO.png ห้ามใส่ข้อมูลส่วนบุคคลของลูกค้าปลายทางในชื่อไฟล์\n\n' +
    videoSetting_('EMAIL_SIGNATURE', 'ทีมผลิตคอนเทนต์ WEUP SoloSix');
  GmailApp.sendEmail(email, 'ส่งรูปสำหรับผลิตวิดีโอ · ' + customerId, body);
}

function reviewSelectedCustomerProfile() {
  try {
    var context = videoSelectedCustomer_();
    var result = videoReviewCustomerProfile_(context.customerId, context.row);
    videoNotify_('ตรวจข้อมูลเรียบร้อย', 'รหัสลูกค้า: ' + context.customerId + '\nสถานะ: ' + result.profileStatus + '\nรูปที่พบ: ' + result.totalImages + ' ไฟล์');
  } catch (error) {
    videoFail_('ตรวจข้อมูลไม่สำเร็จ', error);
  }
}

function videoReviewCustomerProfile_(customerId, rowNumber) {
  var inventory = videoSourceInventory_(customerId);
  var customer = videoCustomerByRow_(rowNumber);
  var safeCustomer = videoSafeCustomerPayload_(customer);
  var requirements = videoImageRequirements_(inventory, customer);
  var userMessage =
    'ข้อมูลธุรกิจที่ตัดข้อมูลติดต่อแล้ว:\n' + JSON.stringify(safeCustomer, null, 2) + '\n\n' +
    'รายการไฟล์ที่มีอยู่จริง:\n' + JSON.stringify(inventory.files, null, 2) + '\n\n' +
    'ผลตรวจจำนวนไฟล์ตามเกณฑ์:\n' + JSON.stringify(requirements, null, 2);
  var raw = videoCallOpenAI_(videoPrompt_(VIDEO.promptKeys.profile), userMessage);
  var data;
  try {
    data = videoParseJson_(raw);
  } catch (parseError) {
    videoUpsertByKey_(VIDEO.sheets.profiles, VIDEO_HEADERS.profiles, 'CUSTOMER_ID', customerId, {
      'CUSTOMER_ID': customerId,
      'RUN_AT': videoNow_(),
      'PROFILE_STATUS': VIDEO.status.needsMore,
      'RAW_JSON': raw,
      'ERROR': parseError.message
    });
    throw new Error(parseError.message + ' ระบบบันทึกคำตอบดิบไว้ในชีต “' + VIDEO.sheets.profiles + '” แล้ว');
  }
  var missingImages = videoArray_(data.missing_images);
  requirements.missing.forEach(function (item) {
    if (missingImages.indexOf(item) === -1) missingImages.push(item);
  });
  var rights = videoCustomerValue_(customer, VIDEO_QUESTIONS.imageRights);
  var rightsConfirmed = rights.indexOf('ยืนยันว่ามีสิทธิ์') === 0;
  if (!rightsConfirmed) missingImages.push('ยังไม่ยืนยันสิทธิ์ใช้รูปภาพ');
  var profileStatus = (requirements.missing.length || !rightsConfirmed || videoArray_(data.missing_data).length) ? VIDEO.status.needsMore : VIDEO.status.complete;
  var values = {
    'CUSTOMER_ID': customerId,
    'RUN_AT': videoNow_(),
    'BUSINESS_SUMMARY': videoText_(data.business_summary),
    'PRIMARY_SERVICE': videoText_(data.primary_service),
    'TARGET_AUDIENCE': videoText_(data.target_audience),
    'MISSING_DATA': videoBulletList_(data.missing_data),
    'MISSING_IMAGES': videoBulletList_(missingImages),
    'NEEDS_CONFIRMATION': videoBulletList_(data.needs_confirmation),
    'PROFILE_STATUS': profileStatus,
    'RAW_JSON': JSON.stringify(data),
    'ERROR': ''
  };
  videoUpsertByKey_(VIDEO.sheets.profiles, VIDEO_HEADERS.profiles, 'CUSTOMER_ID', customerId, values);
  videoWriteCustomerValues_(rowNumber, {
    'SOURCE_IMAGE_COUNT': inventory.total,
    'PROFILE_STATUS': profileStatus,
    'WORKFLOW_STATUS': profileStatus
  });
  return { profileStatus: profileStatus, totalImages: inventory.total };
}

function sendSelectedMissingInfoEmail() {
  try {
    var context = videoSelectedCustomer_();
    var email = videoSendMissingInfoEmail_(context.customerId, context.row);
    videoNotify_('ส่งอีเมลเรียบร้อย', 'ส่งรายการข้อมูลที่ยังขาดไปยัง ' + email + ' แล้ว');
  } catch (error) {
    videoFail_('ส่งอีเมลไม่สำเร็จ', error);
  }
}

function videoSendMissingInfoEmail_(customerId, rowNumber) {
  var profile = videoFindByKey_(VIDEO.sheets.profiles, 'CUSTOMER_ID', customerId);
  var status = videoText_(videoValue_(profile, 'PROFILE_STATUS'));
  if (status !== VIDEO.status.needsMore) throw new Error('ส่งอีเมลได้เฉพาะโปรไฟล์ที่มีสถานะ “' + VIDEO.status.needsMore + '”');
  var customer = videoCustomerByRow_(rowNumber);
  var email = videoCustomerValue_(customer, VIDEO_QUESTIONS.email);
  var business = videoCustomerValue_(customer, VIDEO_QUESTIONS.businessName) || customerId;
  var sourceUrl = videoCustomerValue_(customer, 'SOURCE_IMAGES_URL');
  if (!email) throw new Error('ไม่พบอีเมลสำหรับรับมอบงาน');
  var body =
    'สวัสดีทีม ' + business + '\n\n' +
    'เพื่อเริ่มผลิตวิดีโอสำหรับรหัส ' + customerId + ' กรุณาส่งข้อมูลเพิ่มเติมดังนี้:\n\n' +
    'ข้อมูลที่ยังขาด:\n' + (videoText_(videoValue_(profile, 'MISSING_DATA')) || 'ไม่มี') + '\n\n' +
    'รูปหรือการยืนยันที่ยังขาด:\n' + (videoText_(videoValue_(profile, 'MISSING_IMAGES')) || 'ไม่มี') + '\n\n' +
    'โฟลเดอร์อัปโหลดรูป:\n' + sourceUrl + '\n\n' +
    'กรุณาตอบกลับอีเมลฉบับนี้โดยคงรหัสลูกค้าไว้ในหัวเรื่อง\n\n' +
    videoSetting_('EMAIL_SIGNATURE', 'ทีมผลิตคอนเทนต์ WEUP SoloSix');
  GmailApp.sendEmail(email, 'ขอข้อมูลเพิ่มเติม · ' + customerId, body);
  videoWriteNamedValues_(profile.sheet, profile.row, profile.map, { 'REQUEST_SENT_AT': videoNow_() });
  return email;
}

function generateSelectedContentIdeas() {
  try {
    var context = videoSelectedCustomer_();
    var count = videoGenerateContentIdeas_(context.customerId, context.row);
    videoNotify_('สร้างไอเดียเรียบร้อย', 'บันทึกไอเดีย ' + count + ' รายการในชีต “' + VIDEO.sheets.ideas + '” กรุณาตรวจและเลือกสถานะ “' + VIDEO.status.approved + '” เฉพาะรายการที่จะผลิต');
  } catch (error) {
    videoFail_('สร้างไอเดียไม่สำเร็จ', error);
  }
}

function videoGenerateContentIdeas_(customerId, rowNumber) {
  var profile = videoFindByKey_(VIDEO.sheets.profiles, 'CUSTOMER_ID', customerId);
  if (videoText_(videoValue_(profile, 'PROFILE_STATUS')) !== VIDEO.status.complete) {
    throw new Error('โปรไฟล์ต้องมีสถานะ “' + VIDEO.status.complete + '” ก่อนสร้างไอเดีย');
  }
  var customer = videoCustomerByRow_(rowNumber);
  var inventory = videoSourceInventory_(customerId);
  var userMessage =
    'โปรไฟล์ที่ตรวจแล้ว:\n' + JSON.stringify({
      business_summary: videoValue_(profile, 'BUSINESS_SUMMARY'),
      primary_service: videoValue_(profile, 'PRIMARY_SERVICE'),
      target_audience: videoValue_(profile, 'TARGET_AUDIENCE'),
      needs_confirmation: videoValue_(profile, 'NEEDS_CONFIRMATION'),
      safe_customer_data: videoSafeCustomerPayload_(customer),
      source_files: inventory.files
    }, null, 2) + '\n\nสร้างไอเดีย 20 รายการ';
  var raw = videoCallOpenAI_(videoPrompt_(VIDEO.promptKeys.ideas), userMessage);
  var data;
  try { data = videoParseJson_(raw); }
  catch (parseError) {
    videoAppendNamedValues_(VIDEO.sheets.ideas, VIDEO_HEADERS.ideas, {
      'CUSTOMER_ID': customerId, 'IDEA_ID': customerId + '-ERROR-' + Date.now(),
      'APPROVAL': VIDEO.status.waitingReview, 'CREATED_AT': videoNow_(),
      'RAW_JSON': raw, 'ERROR': parseError.message
    });
    throw new Error(parseError.message + ' ระบบบันทึกคำตอบดิบไว้แล้ว');
  }
  var ideas = Array.isArray(data.ideas) ? data.ideas.slice(0, 20) : [];
  if (!ideas.length) throw new Error('AI ไม่ได้ส่งรายการไอเดียกลับมา');
  for (var i = 0; i < ideas.length; i++) {
    var item = ideas[i] || {};
    var ideaId = customerId + '-I' + videoPad_(i + 1, 2);
    videoUpsertByKey_(VIDEO.sheets.ideas, VIDEO_HEADERS.ideas, 'IDEA_ID', ideaId, {
      'CUSTOMER_ID': customerId,
      'IDEA_ID': ideaId,
      'CONTENT_ANGLE': videoText_(item.content_angle),
      'PROBLEM_SOLVED': videoText_(item.problem_solved),
      'CORE_MESSAGE': videoText_(item.core_message),
      'TARGET_AUDIENCE': videoText_(item.target_audience),
      'VIDEO_FORMAT': videoText_(item.video_format),
      'PRODUCT_FEATURED': videoText_(item.product_featured),
      'NEEDS_CONFIRMATION': videoText_(item.needs_confirmation),
      'APPROVAL': VIDEO.status.waitingReview,
      'CREATED_AT': videoNow_(),
      'RAW_JSON': JSON.stringify(item),
      'ERROR': ''
    });
  }
  videoWriteCustomerValues_(rowNumber, {
    'IDEA_APPROVAL': VIDEO.status.waitingReview,
    'WORKFLOW_STATUS': 'รออนุมัติไอเดีย'
  });
  videoApplyValidations_();
  return ideas.length;
}

function writeApprovedVideoScripts() {
  try {
    var count = videoWriteApprovedScripts_('');
    videoNotify_('เขียนสคริปต์เรียบร้อย', count ? 'สร้างสคริปต์ ' + count + ' รายการ กรุณาตรวจและตั้ง APPROVAL เป็น “' + VIDEO.status.approved + '” ก่อนสร้างแผนภาพ' : 'ไม่พบไอเดียที่อนุมัติและยังไม่มีสคริปต์');
  } catch (error) {
    videoFail_('เขียนสคริปต์ไม่สำเร็จ', error);
  }
}

function videoWriteApprovedScripts_(customerId) {
  var startedAt = Date.now();
  var maxItems = videoBatchSize_();
  var ideaTable = videoReadTable_(videoSheet_(VIDEO.sheets.ideas));
  var count = 0;
  for (var i = 0; i < ideaTable.rows.length && count < maxItems; i++) {
    if (Date.now() - startedAt > VIDEO.maxRuntimeMs) break;
    var idea = ideaTable.rows[i];
    if (customerId && videoText_(videoCell_(idea, ideaTable.map, 'CUSTOMER_ID')) !== customerId) continue;
    if (videoText_(videoCell_(idea, ideaTable.map, 'APPROVAL')) !== VIDEO.status.approved) continue;
    var ideaId = videoText_(videoCell_(idea, ideaTable.map, 'IDEA_ID'));
    if (!ideaId || videoFindByKey_(VIDEO.sheets.scripts, 'IDEA_ID', ideaId, true)) continue;
    videoWriteScriptForIdea_(ideaTable, idea);
    count++;
  }
  return count;
}

function videoWriteScriptForIdea_(table, idea) {
  var customerId = videoText_(videoCell_(idea, table.map, 'CUSTOMER_ID'));
  var ideaId = videoText_(videoCell_(idea, table.map, 'IDEA_ID'));
  var customer = videoFindCustomerById_(customerId);
  var userMessage = 'ข้อมูลธุรกิจและไอเดียที่อนุมัติแล้ว:\n' + JSON.stringify({
    customer: videoSafeCustomerPayload_(customer),
    idea: videoRowObject_(table.headers, idea)
  }, null, 2);
  var raw = videoCallOpenAI_(videoPrompt_(VIDEO.promptKeys.script), userMessage);
  var data;
  try { data = videoParseJson_(raw); }
  catch (parseError) {
    videoAppendNamedValues_(VIDEO.sheets.scripts, VIDEO_HEADERS.scripts, {
      'CUSTOMER_ID': customerId, 'VIDEO_ID': ideaId.replace('-I', '-V'), 'IDEA_ID': ideaId,
      'APPROVAL': VIDEO.status.waitingReview, 'CREATED_AT': videoNow_(), 'RAW_JSON': raw, 'ERROR': parseError.message
    });
    return;
  }
  var videoId = ideaId.replace('-I', '-V');
  videoUpsertByKey_(VIDEO.sheets.scripts, VIDEO_HEADERS.scripts, 'VIDEO_ID', videoId, {
    'CUSTOMER_ID': customerId,
    'VIDEO_ID': videoId,
    'IDEA_ID': ideaId,
    'TOPIC': videoText_(data.topic),
    'HOOK': videoText_(data.hook),
    'SCRIPT_BODY': videoText_(data.script_body),
    'CTA': videoText_(data.cta),
    'DURATION_SECONDS': Number(data.duration_seconds || 0),
    'NEEDS_CONFIRMATION': videoText_(data.needs_confirmation),
    'APPROVAL': VIDEO.status.waitingReview,
    'DELIVERY_BATCH': 'B01',
    'CREATED_AT': videoNow_(),
    'RAW_JSON': JSON.stringify(data),
    'ERROR': ''
  });
  videoWriteCustomerValues_(customer.row, {
    'IDEA_APPROVAL': VIDEO.status.approved,
    'SCRIPT_APPROVAL': VIDEO.status.waitingReview,
    'WORKFLOW_STATUS': 'รออนุมัติสคริปต์'
  });
}

function buildApprovedShotPlans() {
  try {
    var count = videoBuildApprovedShotPlans_('');
    videoNotify_('สร้างแผนภาพเรียบร้อย', count ? 'สร้างแผนภาพสำหรับ ' + count + ' วิดีโอแล้ว' : 'ไม่พบสคริปต์ที่อนุมัติและยังไม่มีแผนภาพ');
  } catch (error) {
    videoFail_('สร้างแผนภาพไม่สำเร็จ', error);
  }
}

function videoBuildApprovedShotPlans_(customerId) {
  var startedAt = Date.now();
  var maxItems = videoBatchSize_();
  var scriptTable = videoReadTable_(videoSheet_(VIDEO.sheets.scripts));
  var count = 0;
  for (var i = 0; i < scriptTable.rows.length && count < maxItems; i++) {
    if (Date.now() - startedAt > VIDEO.maxRuntimeMs) break;
    var script = scriptTable.rows[i];
    if (customerId && videoText_(videoCell_(script, scriptTable.map, 'CUSTOMER_ID')) !== customerId) continue;
    if (videoText_(videoCell_(script, scriptTable.map, 'APPROVAL')) !== VIDEO.status.approved) continue;
    var videoId = videoText_(videoCell_(script, scriptTable.map, 'VIDEO_ID'));
    if (!videoId || videoFindByKey_(VIDEO.sheets.shots, 'VIDEO_ID', videoId, true)) continue;
    videoBuildShotPlanForScript_(scriptTable, script);
    count++;
  }
  return count;
}

function videoBuildShotPlanForScript_(table, script) {
  var customerId = videoText_(videoCell_(script, table.map, 'CUSTOMER_ID'));
  var videoId = videoText_(videoCell_(script, table.map, 'VIDEO_ID'));
  var inventory = videoSourceInventory_(customerId);
  var userMessage = 'สคริปต์ที่อนุมัติแล้ว:\n' + JSON.stringify(videoRowObject_(table.headers, script), null, 2) +
    '\n\nรายชื่อไฟล์รูปที่อนุญาตให้อ้างอิง:\n' + JSON.stringify(inventory.files, null, 2);
  var raw = videoCallOpenAI_(videoPrompt_(VIDEO.promptKeys.shots), userMessage);
  var data;
  try { data = videoParseJson_(raw); }
  catch (parseError) {
    videoAppendNamedValues_(VIDEO.sheets.shots, VIDEO_HEADERS.shots, {
      'CUSTOMER_ID': customerId, 'VIDEO_ID': videoId, 'SCENE_ORDER': 0,
      'CREATED_AT': videoNow_(), 'RAW_JSON': raw, 'ERROR': parseError.message
    });
    return;
  }
  var scenes = Array.isArray(data.scenes) ? data.scenes : [];
  var allowedFiles = {};
  inventory.files.forEach(function (file) { allowedFiles[file.name] = true; });
  scenes.forEach(function (scene, index) {
    var type = videoText_(scene.scene_type).toUpperCase();
    var reference = videoText_(scene.reference_image);
    if ((type === 'PRODUCT' || type === 'PRESENTER') && !allowedFiles[reference]) reference = 'MISSING_IMAGE';
    if (type === 'ILLUSTRATION' || type === 'GRAPHIC') reference = '';
    var tool = videoText_(scene.tool).toUpperCase();
    if (['VEO', 'SEEDANCE', 'CAPCUT'].indexOf(tool) === -1) tool = type === 'GRAPHIC' ? 'CAPCUT' : 'VEO';
    videoAppendNamedValues_(VIDEO.sheets.shots, VIDEO_HEADERS.shots, {
      'CUSTOMER_ID': customerId,
      'VIDEO_ID': videoId,
      'SCENE_ORDER': Number(scene.scene_order || index + 1),
      'VOICEOVER': videoText_(scene.voiceover),
      'VISUAL_DESCRIPTION': videoText_(scene.visual_description),
      'SCENE_TYPE': type,
      'REFERENCE_IMAGE': reference,
      'GENERATION_PROMPT': videoText_(scene.generation_prompt),
      'TOOL': tool,
      'ON_SCREEN_TEXT': videoText_(scene.on_screen_text),
      'CAPCUT_NOTE': videoText_(scene.capcut_note),
      'CREATED_AT': videoNow_(),
      'RAW_JSON': JSON.stringify(scene),
      'ERROR': reference === 'MISSING_IMAGE' ? 'ไม่พบไฟล์อ้างอิงที่มีอยู่จริง' : ''
    });
  });
  var customer = videoFindCustomerById_(customerId);
  videoWriteCustomerValues_(customer.row, {
    'SCRIPT_APPROVAL': VIDEO.status.approved,
    'WORKFLOW_STATUS': 'กำลังผลิตวิดีโอ'
  });
}

function syncSelectedProductionQc() {
  try {
    var context = videoSelectedCustomer_();
    var result = videoSyncProductionQc_(context.customerId);
    videoNotify_('อัปเดตข้อมูล QC แล้ว', 'พบไฟล์วิดีโอสุดท้าย ' + result.fileCount + ' ไฟล์ และบันทึกรายการผลิต ' + result.rowCount + ' รายการ\n\nระบบไม่เขียนทับหมายเหตุ QC หรือผลอนุมัติเดิม');
  } catch (error) {
    videoFail_('อัปเดต QC ไม่สำเร็จ', error);
  }
}

function videoSyncProductionQc_(customerId) {
  var customer = videoFindCustomerById_(customerId);
  var finalUrl = videoCustomerValue_(customer, 'FINAL_VIDEO_URL');
  if (!finalUrl) throw new Error('ยังไม่มีโฟลเดอร์ 04_VIDEO_FINAL สำหรับ ' + customerId);
  var finalFolder = DriveApp.getFolderById(videoIdFromUrl_(finalUrl));
  var files = videoListFiles_(finalFolder).filter(videoIsVideoFile_);
  var scripts = videoReadTable_(videoSheet_(VIDEO.sheets.scripts));
  var rowCount = 0;
  for (var i = 0; i < scripts.rows.length; i++) {
    var row = scripts.rows[i];
    if (videoText_(videoCell_(row, scripts.map, 'CUSTOMER_ID')) !== customerId) continue;
    var videoId = videoText_(videoCell_(row, scripts.map, 'VIDEO_ID'));
    var matched = videoFindMatchingFile_(files, videoId);
    var existing = videoFindByKey_(VIDEO.sheets.production, 'VIDEO_ID', videoId, true);
    var preserved = existing ? {
      imageMatch: videoValue_(existing, 'IMAGE_MATCH_CHECK'),
      subtitle: videoValue_(existing, 'SUBTITLE_CHECK'),
      claim: videoValue_(existing, 'CLAIM_CHECK'),
      qcResult: videoValue_(existing, 'QC_RESULT'),
      qcBy: videoValue_(existing, 'QC_BY'),
      qcAt: videoValue_(existing, 'QC_AT'),
      finalApproval: videoValue_(existing, 'FINAL_APPROVAL'),
      note: videoValue_(existing, 'QC_NOTE')
    } : {};
    videoUpsertByKey_(VIDEO.sheets.production, VIDEO_HEADERS.production, 'VIDEO_ID', videoId, {
      'CUSTOMER_ID': customerId,
      'VIDEO_ID': videoId,
      'DELIVERY_BATCH': videoText_(videoCell_(row, scripts.map, 'DELIVERY_BATCH')) || 'B01',
      'TOPIC': videoCell_(row, scripts.map, 'TOPIC'),
      'FILE_NAME': matched ? matched.name : '',
      'FILE_SIZE_MB': matched ? Math.round(matched.size / 1048576 * 100) / 100 : '',
      'FILE_STATUS': matched ? VIDEO.status.readyForQc : 'ไม่พบไฟล์',
      'IMAGE_MATCH_CHECK': preserved.imageMatch || '',
      'SUBTITLE_CHECK': preserved.subtitle || '',
      'CLAIM_CHECK': preserved.claim || '',
      'QC_RESULT': preserved.qcResult || '',
      'QC_BY': preserved.qcBy || '',
      'QC_AT': preserved.qcAt || '',
      'FINAL_APPROVAL': preserved.finalApproval || VIDEO.status.waitingReview,
      'QC_NOTE': preserved.note || ''
    });
    rowCount++;
  }
  videoApplyValidations_();
  videoWriteCustomerValues_(customer.row, {
    'WORKFLOW_STATUS': 'รอตรวจ QC'
  });
  return { fileCount: files.length, rowCount: rowCount };
}

function deliverSelectedVideos() {
  try {
    var context = videoSelectedCustomer_();
    var result = videoDeliverCustomer_(context.customerId, context.row, true);
    if (result) videoNotify_('ส่งมอบเรียบร้อย', 'ส่งลิงก์วิดีโอไปยัง ' + result.email + ' แล้ว');
  } catch (error) {
    videoFail_('ส่งมอบไม่สำเร็จ', error);
  }
}

function videoDeliverCustomer_(customerId, rowNumber, requireSheetConfirmation) {
  var check = videoDeliveryCheck_(customerId);
  if (!check.ready) throw new Error(check.reasons.join('\n'));
  var customer = videoCustomerByRow_(rowNumber);
  var email = videoCustomerValue_(customer, VIDEO_QUESTIONS.email);
  var business = videoCustomerValue_(customer, VIDEO_QUESTIONS.businessName) || customerId;
  var deliveredAt = videoCustomerValue_(customer, 'DELIVERED_AT');
  if (!email) throw new Error('ไม่พบอีเมลสำหรับรับมอบงาน');
  if (deliveredAt) throw new Error('ชุดงานนี้ส่งมอบแล้วเมื่อ ' + deliveredAt + ' ระบบป้องกันการส่งซ้ำ');
  if (requireSheetConfirmation && !videoConfirm_('ยืนยันการส่งมอบ', 'ผู้รับ: ' + email + '\nรหัสลูกค้า: ' + customerId + '\nจำนวนวิดีโอ: ' + check.fileCount + '\n\nยืนยันว่าได้ตรวจผู้รับและวิดีโอครบทุกไฟล์แล้วหรือไม่?')) return null;
  var finalUrl = videoCustomerValue_(customer, 'FINAL_VIDEO_URL');
  var batch = videoCustomerValue_(customer, 'DELIVERY_BATCH') || 'B01';
  var body =
    'สวัสดีทีม ' + business + '\n\n' +
    'วิดีโอชุด ' + batch + ' สำหรับรหัส ' + customerId + ' พร้อมรับมอบแล้ว:\n' + finalUrl + '\n\n' +
    'จำนวนไฟล์: ' + check.fileCount + ' คลิป\n' +
    'ขอบเขตการแก้ไข: ' + videoSetting_('REVISION_SCOPE', '') + '\n' +
    'กำหนดส่งคำขอแก้ไข: ' + videoSetting_('REVISION_DEADLINE', '') + '\n\n' +
    'กรุณาตอบกลับอีเมลฉบับนี้โดยคงรหัสลูกค้าและรหัสชุดไว้ในหัวเรื่อง\n\n' +
    videoSetting_('EMAIL_SIGNATURE', 'ทีมผลิตคอนเทนต์ WEUP SoloSix');
  GmailApp.sendEmail(email, 'ส่งมอบวิดีโอ ' + batch + ' · ' + customerId, body);
  videoWriteCustomerValues_(rowNumber, {
    'DELIVERED_AT': videoNow_(),
    'WORKFLOW_STATUS': VIDEO.status.delivered,
    'FINAL_APPROVAL': VIDEO.status.approved,
    'DELIVERY_BATCH': batch
  });
  return { email: email, fileCount: check.fileCount, batch: batch };
}

function videoDeliveryCheck_(customerId) {
  var customer = videoFindCustomerById_(customerId);
  var expected = Number(videoCustomerValue_(customer, 'VIDEOS_EXPECTED') || videoNumberSetting_('VIDEOS_PER_PACKAGE', 12));
  var finalUrl = videoCustomerValue_(customer, 'FINAL_VIDEO_URL');
  var reasons = [];
  if (!finalUrl) return { ready: false, reasons: ['ยังไม่มีโฟลเดอร์วิดีโอสุดท้าย'], fileCount: 0 };
  var files = videoListFiles_(DriveApp.getFolderById(videoIdFromUrl_(finalUrl))).filter(videoIsVideoFile_);
  if (files.length < expected) reasons.push('พบวิดีโอ ' + files.length + ' ไฟล์ แต่ต้องมีอย่างน้อย ' + expected + ' ไฟล์');
  var table = videoReadTable_(videoSheet_(VIDEO.sheets.production));
  var approved = 0;
  for (var i = 0; i < table.rows.length; i++) {
    if (videoText_(videoCell_(table.rows[i], table.map, 'CUSTOMER_ID')) === customerId &&
        videoText_(videoCell_(table.rows[i], table.map, 'FINAL_APPROVAL')) === VIDEO.status.approved) approved++;
  }
  if (approved < expected) reasons.push('มีวิดีโอที่อนุมัติสุดท้ายเพียง ' + approved + ' รายการ จาก ' + expected + ' รายการ');
  return { ready: reasons.length === 0, reasons: reasons, fileCount: files.length, approvedCount: approved, expected: expected };
}

function processVideoFeedback() {
  try {
    var result = videoProcessFeedback_();
    videoNotify_('อ่านฟีดแบ็กเรียบร้อย', result);
  } catch (error) {
    videoFail_('อ่านฟีดแบ็กไม่สำเร็จ', error);
  }
}

function processVideoFeedbackScheduled() {
  try { console.log(videoProcessFeedback_()); }
  catch (error) { console.error(error.message); }
}

function videoProcessFeedback_() {
  var customers = videoReadTable_(videoSheet_(VIDEO.sheets.customers));
  var processedIds = videoProcessedMessageIds_();
  var processedCount = 0;
  for (var i = 0; i < customers.rows.length && processedCount < videoBatchSize_(); i++) {
    var customerId = videoText_(videoCell_(customers.rows[i], customers.map, 'CUSTOMER_ID'));
    var deliveredAt = videoText_(videoCell_(customers.rows[i], customers.map, 'DELIVERED_AT'));
    if (!customerId || !deliveredAt) continue;
    var email = videoText_(videoCell_(customers.rows[i], customers.map, VIDEO_QUESTIONS.email)).toLowerCase();
    var threads = GmailApp.search('subject:"' + customerId + '" is:unread -in:chats', 0, 10);
    for (var t = 0; t < threads.length && processedCount < videoBatchSize_(); t++) {
      var messages = threads[t].getMessages();
      for (var m = 0; m < messages.length && processedCount < videoBatchSize_(); m++) {
        var message = messages[m];
        if (!message.isUnread() || processedIds[message.getId()]) continue;
        if (email && videoText_(message.getFrom()).toLowerCase().indexOf(email) === -1) continue;
        videoClassifyFeedbackMessage_(customerId, message);
        processedIds[message.getId()] = true;
        message.markRead();
        processedCount++;
      }
    }
  }
  return 'จัดหมวดหมู่อีเมลใหม่ ' + processedCount + ' ฉบับ ระบบไม่ได้ส่งคำตอบกลับลูกค้าอัตโนมัติ';
}

function videoClassifyFeedbackMessage_(customerId, message) {
  var plainBody = videoCleanEmailBody_(message.getPlainBody()).substring(0, 12000);
  var userMessage =
    'ขอบเขตการแก้ไข:\n' + videoSetting_('REVISION_SCOPE', '') + '\n\n' +
    'หัวข้ออีเมล:\n' + message.getSubject() + '\n\nข้อความใหม่:\n' + plainBody;
  var raw = videoCallOpenAI_(videoPrompt_(VIDEO.promptKeys.feedback), userMessage);
  var data;
  try { data = videoParseJson_(raw); }
  catch (parseError) {
    videoAppendNamedValues_(VIDEO.sheets.feedback, VIDEO_HEADERS.feedback, {
      'CUSTOMER_ID': customerId, 'RECEIVED_AT': videoNow_(), 'MESSAGE_ID': message.getId(),
      'REQUEST_INDEX': 1, 'EMAIL_SUBJECT': message.getSubject(), 'SENDER': message.getFrom(),
      'REQUEST_TEXT': plainBody, 'RAW_JSON': raw, 'PROCESSED': 'เกิดข้อผิดพลาด: ' + parseError.message
    });
    return;
  }
  var requests = Array.isArray(data.requests) ? data.requests : [data];
  requests.forEach(function (request, index) {
    var category = videoText_(request.category);
    var allowed = ['ข้อผิดพลาดจากผู้ให้บริการ', 'อยู่ในรอบแก้ไข', 'งานเพิ่มเติม'];
    if (allowed.indexOf(category) === -1) category = 'ต้องให้ผู้ดำเนินงานตรวจสอบ';
    videoAppendNamedValues_(VIDEO.sheets.feedback, VIDEO_HEADERS.feedback, {
      'CUSTOMER_ID': customerId,
      'RECEIVED_AT': videoNow_(),
      'MESSAGE_ID': message.getId(),
      'REQUEST_INDEX': index + 1,
      'EMAIL_SUBJECT': message.getSubject(),
      'SENDER': message.getFrom(),
      'REQUEST_TEXT': videoText_(request.request_text) || plainBody,
      'CATEGORY': category,
      'RELATED_VIDEO_ID': videoText_(request.related_video_id),
      'CLASSIFICATION_REASON': videoText_(request.classification_reason),
      'RECOMMENDED_ACTION': videoText_(request.recommended_action),
      'RAW_JSON': JSON.stringify(request),
      'PROCESSED': 'จัดหมวดหมู่แล้ว'
    });
  });
}

function testVideoOpenAIConnection() {
  try {
    var raw = videoCallOpenAI_('ตอบเป็น JSON เท่านั้น: {"status":"OK","message":"ภาษาไทยสั้น ๆ"}', 'ตรวจสอบการเชื่อมต่อระบบผลิตวิดีโอ');
    var data = videoParseJson_(raw);
    videoNotify_('เชื่อมต่อ OpenAI สำเร็จ', 'โมเดล: ' + videoModel_() + '\nคำตอบ: ' + (videoText_(data.message) || videoText_(data.status)));
  } catch (error) {
    videoFail_('เชื่อมต่อ OpenAI ไม่สำเร็จ', error);
  }
}

function installVideoTriggers() {
  try {
    videoInstallFormTrigger_();
    videoInstallTimeTrigger_('processVideoFeedbackScheduled', 6);
    videoInstallTimeTrigger_('syncAllCustomerFileCountsScheduled', 12);
    videoNotify_('ติดตั้งทริกเกอร์เรียบร้อย', 'ระบบตรวจฟีดแบ็กทุก 6 ชั่วโมงและตรวจจำนวนไฟล์ทุก 12 ชั่วโมง โดยไม่สร้างทริกเกอร์ซ้ำ');
  } catch (error) {
    videoFail_('ติดตั้งทริกเกอร์ไม่สำเร็จ', error);
  }
}

function syncAllCustomerFileCountsScheduled() {
  try {
    var table = videoReadTable_(videoSheet_(VIDEO.sheets.customers));
    for (var i = 0; i < table.rows.length; i++) {
      var customerId = videoText_(videoCell_(table.rows[i], table.map, 'CUSTOMER_ID'));
      var sourceUrl = videoText_(videoCell_(table.rows[i], table.map, 'SOURCE_IMAGES_URL'));
      if (!customerId || !sourceUrl) continue;
      try {
        var inventory = videoSourceInventory_(customerId);
        videoWriteNamedValues_(table.sheet, i + 2, table.map, { 'SOURCE_IMAGE_COUNT': inventory.total });
      } catch (countError) { console.warn(customerId + ': ' + countError.message); }
    }
  } catch (error) { console.error(error.message); }
}

function videoInstallFormTrigger_() {
  var ss = videoSpreadsheet_();
  videoDeleteDuplicateTriggers_('onVideoIntakeSubmit', ScriptApp.EventType.ON_FORM_SUBMIT);
  var exists = ScriptApp.getProjectTriggers().some(function (trigger) {
    return trigger.getHandlerFunction() === 'onVideoIntakeSubmit' && trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT;
  });
  if (!exists) ScriptApp.newTrigger('onVideoIntakeSubmit').forSpreadsheet(ss).onFormSubmit().create();
}

function videoInstallTimeTrigger_(handler, hours) {
  var matching = ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === handler; });
  for (var i = 1; i < matching.length; i++) ScriptApp.deleteTrigger(matching[i]);
  if (!matching.length) ScriptApp.newTrigger(handler).timeBased().everyHours(hours).create();
}

function videoDeleteDuplicateTriggers_(handler, eventType) {
  var matching = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === handler && trigger.getEventType() === eventType;
  });
  for (var i = 1; i < matching.length; i++) ScriptApp.deleteTrigger(matching[i]);
}

function videoCallOpenAI_(systemPrompt, userPrompt) {
  var key = videoText_(PropertiesService.getScriptProperties().getProperty(VIDEO.properties.apiKey));
  if (!key) throw new Error('ยังไม่ได้ตั้งค่า Script Property ชื่อ ' + VIDEO.properties.apiKey);
  var payload = {
    model: videoModel_(),
    messages: [
      { role: 'system', content: VIDEO_COMMON_RULES + '\n\n' + systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: videoNumberSetting_('TEMPERATURE', 0.3),
    max_completion_tokens: Math.max(4000, videoNumberSetting_('MAX_COMPLETION_TOKENS', 5000))
  };
  var response = UrlFetchApp.fetch(VIDEO.apiUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var status = response.getResponseCode();
  var body = response.getContentText();
  if (status < 200 || status >= 300) throw new Error('OpenAI API ตอบกลับ HTTP ' + status + ': ' + body);
  var parsed;
  try { parsed = JSON.parse(body); }
  catch (parseResponseError) { throw new Error('อ่านคำตอบ OpenAI ไม่ได้: ' + body); }
  if (!parsed.choices || !parsed.choices.length || !parsed.choices[0].message) throw new Error('OpenAI ไม่ส่งเนื้อหากลับมา: ' + body);
  return videoText_(parsed.choices[0].message.content);
}

function videoParseJson_(text) {
  var cleaned = videoText_(text).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); }
  catch (firstError) {
    var start = cleaned.indexOf('{');
    var end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.substring(start, end + 1)); }
      catch (secondError) {}
    }
    throw new Error('AI ส่ง JSON ไม่ถูกต้อง');
  }
}

function videoModel_() {
  return videoText_(PropertiesService.getScriptProperties().getProperty(VIDEO.properties.model)) || videoSetting_('MODEL', VIDEO.defaultModel);
}

function videoPrompt_(key) {
  var value = videoSetting_(key, '');
  if (!value) throw new Error('ไม่พบพรอมต์ ' + key + ' ในชีต “' + VIDEO.sheets.settings + '”');
  return value;
}

function videoBatchSize_() {
  return Math.min(VIDEO.maxItemsPerRun, Math.max(1, videoNumberSetting_('MAX_ITEMS_PER_RUN', VIDEO.maxItemsPerRun)));
}

function videoRootFolder_() {
  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty(VIDEO.properties.rootFolderId);
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); }
    catch (missingFolder) {}
  }
  var folders = DriveApp.getFoldersByName(VIDEO.folders.root);
  var root = folders.hasNext() ? folders.next() : DriveApp.createFolder(VIDEO.folders.root);
  props.setProperty(VIDEO.properties.rootFolderId, root.getId());
  return root;
}

function videoSourceInventory_(customerId) {
  var customer = videoFindCustomerById_(customerId);
  var sourceUrl = videoCustomerValue_(customer, 'SOURCE_IMAGES_URL');
  if (!sourceUrl) throw new Error('ยังไม่มีโฟลเดอร์รับรูปสำหรับ ' + customerId);
  var profileFolder = DriveApp.getFolderById(videoIdFromUrl_(sourceUrl));
  var groups = {};
  groups.PRODUCT = videoFolderFilesByName_(profileFolder, VIDEO.folders.product);
  groups.PRESENTER = videoFolderFilesByName_(profileFolder, VIDEO.folders.presenter);
  groups.LOGO = videoFolderFilesByName_(profileFolder, VIDEO.folders.logo);
  var files = [];
  Object.keys(groups).forEach(function (group) {
    groups[group].forEach(function (file) { files.push({ group: group, name: file.name, mimeType: file.mimeType, size: file.size }); });
  });
  return { total: files.length, groups: groups, files: files };
}

function videoImageRequirements_(inventory, customer) {
  var presenterDescription = customer ? videoCustomerValue_(customer, VIDEO_QUESTIONS.presenter) : '';
  var presenterNotUsed = /ไม่มี|ไม่ใช้|ไม่ต้องการ/.test(presenterDescription);
  var minimum = {
    PRODUCT: videoNumberSetting_('MIN_PRODUCT_IMAGES', 3),
    PRESENTER: presenterNotUsed ? 0 : videoNumberSetting_('MIN_PRESENTER_IMAGES', 3),
    LOGO: videoNumberSetting_('MIN_LOGO_FILES', 1)
  };
  var missing = [];
  Object.keys(minimum).forEach(function (group) {
    var actual = inventory.groups[group] ? inventory.groups[group].length : 0;
    if (actual < minimum[group]) missing.push(group + ': พบ ' + actual + ' ไฟล์ ต้องมีอย่างน้อย ' + minimum[group] + ' ไฟล์');
  });
  return { minimum: minimum, missing: missing };
}

function videoFolderFilesByName_(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (!folders.hasNext()) return [];
  return videoListFiles_(folders.next()).filter(videoIsImageFile_);
}

function videoListFiles_(folder) {
  var files = [];
  var iterator = folder.getFiles();
  while (iterator.hasNext()) {
    var file = iterator.next();
    files.push({ id: file.getId(), name: file.getName(), mimeType: file.getMimeType(), size: file.getSize(), url: file.getUrl() });
  }
  return files;
}

function videoIsImageFile_(file) {
  var mime = videoText_(file.mimeType).toLowerCase();
  var name = videoText_(file.name).toLowerCase();
  return mime.indexOf('image/') === 0 || /\.(png|jpe?g|webp|gif|svg|heic|heif)$/i.test(name);
}

function videoIsVideoFile_(file) {
  var mime = videoText_(file.mimeType).toLowerCase();
  var name = videoText_(file.name).toLowerCase();
  return mime.indexOf('video/') === 0 || /\.(mp4|mov|m4v|webm|avi)$/i.test(name);
}

function videoFindMatchingFile_(files, videoId) {
  var normalizedId = videoNormalize_(videoId);
  for (var i = 0; i < files.length; i++) {
    if (videoNormalize_(files[i].name).indexOf(normalizedId) !== -1) return files[i];
  }
  return null;
}

function videoGetOrCreateFolder_(parent, name) {
  var folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function videoIdFromUrl_(url) {
  var match = videoText_(url).match(/[-\w]{20,}/);
  if (!match) throw new Error('ลิงก์ Google Drive ไม่ถูกต้อง: ' + url);
  return match[0];
}

function videoEnsureCustomerSheet_() {
  var ss = videoSpreadsheet_();
  var sheet = ss.getSheetByName(VIDEO.sheets.customers) || ss.insertSheet(VIDEO.sheets.customers);
  if (sheet.getLastColumn() === 0) {
    var headers = ['Timestamp'].concat(Object.keys(VIDEO_QUESTIONS).map(function (key) { return VIDEO_QUESTIONS[key]; })).concat(VIDEO_CUSTOMER_SYSTEM_HEADERS);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else videoEnsureCustomerColumns_(sheet);
  sheet.setFrozenRows(1);
  return sheet;
}

function videoEnsureCustomerColumns_(sheet) {
  VIDEO_CUSTOMER_SYSTEM_HEADERS.forEach(function (header) { videoEnsureColumn_(sheet, header); });
}

function videoEnsureSheet_(name, headers) {
  var ss = videoSpreadsheet_();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastColumn() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else headers.forEach(function (header) { videoEnsureColumn_(sheet, header); });
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#eee7f8');
  sheet.setFrozenRows(1);
  return sheet;
}

function videoEnsureColumn_(sheet, header) {
  var map = videoHeaderMap_(sheet);
  var key = videoNormalize_(header);
  if (map[key] !== undefined) return map[key] + 1;
  var column = sheet.getLastColumn() + 1;
  sheet.getRange(1, column).setValue(header).setFontWeight('bold');
  return column;
}

function videoSeedSettings_() {
  var sheet = videoSheet_(VIDEO.sheets.settings);
  var table = videoReadTable_(sheet);
  var existing = {};
  table.rows.forEach(function (row) {
    var key = videoText_(videoCell_(row, table.map, 'KEY'));
    if (key) existing[key] = true;
  });
  VIDEO_DEFAULT_SETTINGS.forEach(function (item) {
    if (!existing[item[0]]) sheet.appendRow(item);
  });
  sheet.setColumnWidth(2, 720);
  sheet.getDataRange().setWrap(true);
}

function videoSetting_(key, fallback) {
  var sheet = videoSpreadsheet_().getSheetByName(VIDEO.sheets.settings);
  if (!sheet || sheet.getLastRow() < 2) {
    for (var d = 0; d < VIDEO_DEFAULT_SETTINGS.length; d++) if (VIDEO_DEFAULT_SETTINGS[d][0] === key) return VIDEO_DEFAULT_SETTINGS[d][1];
    return fallback;
  }
  var table = videoReadTable_(sheet);
  for (var i = 0; i < table.rows.length; i++) {
    if (videoText_(videoCell_(table.rows[i], table.map, 'KEY')) === key) return videoText_(videoCell_(table.rows[i], table.map, 'VALUE')) || fallback;
  }
  return fallback;
}

function videoNumberSetting_(key, fallback) {
  var value = Number(videoSetting_(key, fallback));
  return isFinite(value) ? value : fallback;
}

function videoApplyValidations_() {
  videoValidation_(VIDEO.sheets.ideas, 'APPROVAL', [VIDEO.status.waitingReview, VIDEO.status.approved, VIDEO.status.rejected]);
  videoValidation_(VIDEO.sheets.scripts, 'APPROVAL', [VIDEO.status.waitingReview, VIDEO.status.approved, VIDEO.status.rejected]);
  videoValidation_(VIDEO.sheets.production, 'FINAL_APPROVAL', [VIDEO.status.waitingReview, VIDEO.status.approved, VIDEO.status.needsFix]);
}

function videoValidation_(sheetName, header, values) {
  var sheet = videoSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) return;
  var map = videoHeaderMap_(sheet);
  var column = map[videoNormalize_(header)];
  if (column === undefined) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, column + 1, Math.max(1, sheet.getMaxRows() - 1), 1).setDataValidation(rule);
}

function videoSelectedCustomer_() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (!sheet || sheet.getName() !== VIDEO.sheets.customers) throw new Error('กรุณาเปิดชีต “' + VIDEO.sheets.customers + '” และเลือกแถวลูกค้าที่ต้องการ');
  var range = sheet.getActiveRange();
  if (!range || range.getRow() < 2) throw new Error('กรุณาเลือกเซลล์ในแถวข้อมูลลูกค้า');
  videoEnsureCustomerColumns_(sheet);
  var customerId = videoAssignCustomerId_(sheet, range.getRow());
  return { sheet: sheet, row: range.getRow(), customerId: customerId };
}

function videoAssignCustomerId_(sheet, row) {
  var map = videoHeaderMap_(sheet);
  var column = videoRequiredColumn_(map, 'CUSTOMER_ID');
  var current = videoText_(sheet.getRange(row, column + 1).getValue());
  if (current) return current;
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var counter = Number(props.getProperty(VIDEO.properties.customerCounter) || 0) + 1;
    props.setProperty(VIDEO.properties.customerCounter, String(counter));
    current = 'THV-' + Utilities.formatDate(new Date(), VIDEO.timeZone, 'yyMMdd') + '-' + videoPad_(counter, 4);
    sheet.getRange(row, column + 1).setValue(current);
  } finally { lock.releaseLock(); }
  return current;
}

function videoFindCustomerById_(customerId) {
  var found = videoFindByKey_(VIDEO.sheets.customers, 'CUSTOMER_ID', customerId);
  found.headers = videoReadHeaders_(found.sheet);
  found.values = found.sheet.getRange(found.row, 1, 1, found.sheet.getLastColumn()).getValues()[0];
  return found;
}

function videoCustomerByRow_(row) {
  var sheet = videoSheet_(VIDEO.sheets.customers);
  return { sheet: sheet, row: row, headers: videoReadHeaders_(sheet), values: sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0], map: videoHeaderMap_(sheet) };
}

function videoCustomerValue_(customer, header) {
  return videoText_(videoCell_(customer.values, customer.map, header));
}

function videoWriteCustomerValues_(row, values) {
  var sheet = videoSheet_(VIDEO.sheets.customers);
  videoWriteNamedValues_(sheet, row, videoHeaderMap_(sheet), values);
}

function videoSafeCustomerPayload_(customer) {
  var blocked = {};
  [VIDEO_QUESTIONS.email, 'CUSTOMER_ID', 'DRIVE_URL', 'SOURCE_IMAGES_URL', 'FINAL_VIDEO_URL', 'Timestamp', 'ประทับเวลา'].forEach(function (name) { blocked[videoNormalize_(name)] = true; });
  var safe = {};
  for (var i = 0; i < customer.headers.length; i++) {
    var header = videoText_(customer.headers[i]);
    if (!header || blocked[videoNormalize_(header)] || VIDEO_CUSTOMER_SYSTEM_HEADERS.indexOf(header) !== -1) continue;
    var value = videoText_(customer.values[i]);
    if (value) safe[header] = value;
  }
  return safe;
}

function videoUpsertByKey_(sheetName, headers, keyHeader, keyValue, values) {
  var found = videoFindByKey_(sheetName, keyHeader, keyValue, true);
  if (found) {
    videoWriteNamedValues_(found.sheet, found.row, found.map, values);
    return found.row;
  }
  return videoAppendNamedValues_(sheetName, headers, values);
}

function videoAppendNamedValues_(sheetName, headers, values) {
  var sheet = videoEnsureSheet_(sheetName, headers);
  var map = videoHeaderMap_(sheet);
  var row = new Array(sheet.getLastColumn()).fill('');
  Object.keys(values).forEach(function (header) {
    var index = map[videoNormalize_(header)];
    if (index !== undefined) row[index] = values[header];
  });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function videoWriteNamedValues_(sheet, row, map, values) {
  Object.keys(values).forEach(function (header) {
    var index = map[videoNormalize_(header)];
    if (index !== undefined) sheet.getRange(row, index + 1).setValue(values[header]);
  });
}

function videoFindByKey_(sheetName, keyHeader, keyValue, optional) {
  var sheet = videoSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    if (optional) return null;
    throw new Error('ไม่พบข้อมูลในชีต “' + sheetName + '”');
  }
  var table = videoReadTable_(sheet);
  for (var i = 0; i < table.rows.length; i++) {
    if (videoText_(videoCell_(table.rows[i], table.map, keyHeader)) === videoText_(keyValue)) {
      return { sheet: sheet, row: i + 2, values: table.rows[i], headers: table.headers, map: table.map };
    }
  }
  if (optional) return null;
  throw new Error('ไม่พบ ' + keyHeader + ' = ' + keyValue + ' ในชีต “' + sheetName + '”');
}

function videoValue_(found, header) {
  return videoCell_(found.values, found.map, header);
}

function videoSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    PropertiesService.getScriptProperties().setProperty(VIDEO.properties.spreadsheetId, ss.getId());
    return ss;
  }
  var savedId = videoText_(PropertiesService.getScriptProperties().getProperty(VIDEO.properties.spreadsheetId));
  if (savedId) {
    try { return SpreadsheetApp.openById(savedId); }
    catch (openError) { throw new Error('เปิด Google Sheets ที่บันทึกไว้ไม่ได้: ' + openError.message); }
  }
  throw new Error('ไม่พบ Google Sheets ที่ผูกกับโปรเจ็กต์นี้ กรุณาเปิด Apps Script จาก ส่วนขยาย → Apps Script ของสเปรดชีต แล้วเลือก “1. เตรียมระบบและชีต” หนึ่งครั้ง');
}

function videoSheet_(name) {
  var sheet = videoSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบชีต “' + name + '” กรุณาเลือก “1. เตรียมระบบและชีต” ก่อน');
  return sheet;
}

function videoReadHeaders_(sheet) {
  if (!sheet.getLastColumn()) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function videoHeaderMap_(sheet) {
  var map = {};
  videoReadHeaders_(sheet).forEach(function (header, index) { map[videoNormalize_(header)] = index; });
  return map;
}

function videoReadTable_(sheet) {
  var headers = videoReadHeaders_(sheet);
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues() : [];
  return { sheet: sheet, headers: headers, rows: rows, map: videoHeaderMap_(sheet) };
}

function videoCell_(row, map, header) {
  var index = map[videoNormalize_(header)];
  return index === undefined ? '' : row[index];
}

function videoRequiredColumn_(map, header) {
  var index = map[videoNormalize_(header)];
  if (index === undefined) throw new Error('ไม่พบคอลัมน์ ' + header);
  return index;
}

function videoRowObject_(headers, row) {
  var result = {};
  for (var i = 0; i < headers.length; i++) if (videoText_(row[i])) result[videoText_(headers[i])] = row[i];
  return result;
}

function videoProcessedMessageIds_() {
  var result = {};
  var table = videoReadTable_(videoSheet_(VIDEO.sheets.feedback));
  table.rows.forEach(function (row) {
    var id = videoText_(videoCell_(row, table.map, 'MESSAGE_ID'));
    if (id) result[id] = true;
  });
  return result;
}

function videoCleanEmailBody_(body) {
  var text = videoText_(body);
  var markers = ['\nOn ', '\nเมื่อวันที่ ', '\nFrom:', '\nจาก:'];
  markers.forEach(function (marker) {
    var index = text.indexOf(marker);
    if (index > 0) text = text.substring(0, index);
  });
  return text.trim();
}

function videoNotifyOperator_(customerId, sheet) {
  var props = PropertiesService.getScriptProperties();
  var recipient = videoText_(props.getProperty(VIDEO.properties.operatorEmail)) || videoText_(Session.getEffectiveUser().getEmail());
  if (!recipient) return;
  var dashboardUrl = videoText_(props.getProperty(VIDEO.properties.dashboardUrl));
  var link = dashboardUrl || (videoSpreadsheet_().getUrl() + '#gid=' + sheet.getSheetId());
  GmailApp.sendEmail(recipient, 'มีลูกค้าใหม่ในระบบวิดีโอ · ' + customerId,
    'มีข้อมูลเริ่มต้นรายการใหม่\n\nรหัสลูกค้า: ' + customerId + '\nเวลารับข้อมูล: ' + videoNow_() + '\n\nเปิดระบบ: ' + link + '\n\nอีเมลนี้ไม่แสดงข้อมูลติดต่อหรือรายละเอียดธุรกิจ');
}

function videoConfirm_(title, message) {
  try {
    return SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.YES_NO) === SpreadsheetApp.getUi().Button.YES;
  } catch (noUi) {
    throw new Error('การดำเนินการนี้ต้องยืนยันจากเมนูใน Google Sheets หรือจาก Dashboard');
  }
}

function videoNotify_(title, message) {
  console.log('[' + title + '] ' + message);
  try { SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (noUi) {}
}

function videoFail_(title, error) {
  videoNotify_(title, error.message || String(error));
  throw error;
}

function videoText_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') return Utilities.formatDate(value, VIDEO.timeZone, 'dd/MM/yyyy HH:mm:ss');
  return String(value).trim();
}

function videoNormalize_(value) {
  return videoText_(value).toUpperCase().replace(/\s+/g, ' ').trim();
}

function videoArray_(value) {
  if (Array.isArray(value)) return value.map(videoText_).filter(function (item) { return item; });
  var text = videoText_(value);
  return text ? [text] : [];
}

function videoBulletList_(value) {
  var items = videoArray_(value);
  return items.length ? items.map(function (item) { return '• ' + item; }).join('\n') : '';
}

function videoPad_(value, length) {
  var text = String(value);
  while (text.length < length) text = '0' + text;
  return text;
}

function videoNow_() {
  return Utilities.formatDate(new Date(), VIDEO.timeZone, 'dd/MM/yyyy HH:mm:ss');
}
