/**
 * WEUP SoloSix — โมเดล 3
 * ระบบเปลี่ยนความเชี่ยวชาญให้เป็นผลิตภัณฑ์ความรู้สำหรับตลาดประเทศไทย
 *
 * วิธีติดตั้ง
 * 1) วางไฟล์นี้ใน Code.gs หรือ Main.gs ของ Apps Script ที่ผูกกับ Google Sheets
 * 2) เพิ่ม WebApp.gs และไฟล์ HTML ชื่อ Dashboard ในโปรเจ็กต์เดียวกัน
 * 3) โหลด Google Sheets ใหม่ เมนู “ผลิตภัณฑ์ความรู้” จะปรากฏโดยอัตโนมัติ
 * 4) เลือก “ติดตั้งระบบทั้งหมด” แล้วบันทึก OPENAI_API_KEY ใน Script Properties
 *
 * ระบบสร้างเฉพาะส่วนที่ยังขาด ไม่ลบข้อมูลเดิม และไม่ส่งข้อมูลระบุตัวบุคคลให้ AI
 */

var KNOWLEDGE = {
  timeZone: 'Asia/Bangkok',
  locale: 'th_TH',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'gpt-4.1-mini',
  property: {
    apiKey: 'OPENAI_API_KEY',
    spreadsheetId: 'SOLOSIX_M3_SPREADSHEET_ID',
    rootFolderId: 'SOLOSIX_M3_ROOT_FOLDER_ID',
    interviewFormId: 'SOLOSIX_M3_INTERVIEW_FORM_ID',
    feedbackFormId: 'SOLOSIX_M3_FEEDBACK_FORM_ID',
    testFormId: 'SOLOSIX_M3_TEST_FORM_ID'
  },
  sheets: {
    config: 'CONFIG', research: 'RESEARCH', map: 'KNOWLEDGE_MAP', structure: 'PRODUCT_STRUCTURE',
    documents: 'DOCUMENT_STATUS', scenes: 'SCENE_PLAN', orders: 'ORDERS', feedback: 'FEEDBACK',
    testers: 'TEST_USERS', support: 'SUPPORT_MAIL', aiTests: 'AI_TESTS', releases: 'RELEASES', audit: 'AUDIT_LOG',
    rawInterview: 'RAW_INTERVIEW', rawFeedback: 'RAW_FEEDBACK', rawTesters: 'RAW_TEST_USERS'
  },
  status: {
    order: ['NEW', 'PAID', 'ACCESS_GRANTED', 'IN_PROGRESS', 'COMPLETED', 'STOPPED'],
    document: ['AI_DRAFT', 'EXPERT_REVIEW', 'EDITORIAL_REVIEW', 'APPROVED_TO_PUBLISH'],
    source: ['NEEDS_MORE_INFO', 'APPROVED'],
    support: ['IN_SCOPE', 'OUT_OF_SCOPE', 'COMPLAINT'],
    feedback: ['ANSWER_EXISTS_HARD_TO_FIND', 'UNCLEAR_GUIDANCE', 'OUT_OF_SCOPE', 'FUTURE_RELEASE'],
    scene: ['REAL_SCREEN', 'INSTRUCTOR', 'VEO_SCENE', 'SEEDANCE_SCENE'],
    yesNo: ['YES', 'NO'],
    correct: ['CORRECT', 'INCORRECT']
  },
  folders: ['00_INTERNAL_EXPERIENCE', '01_CUSTOMER_DATA', '02_APPROVED_SOURCES', '03_AI_DRAFTS', '04_PENDING_REVIEW', '05_PUBLISHED']
};

var KNOWLEDGE_HEADERS = {
  CONFIG: ['KEY', 'VALUE', 'DESCRIPTION'],
  RESEARCH: ['DATA_SOURCE', 'CUSTOMER_QUOTE', 'PROBLEM', 'CURRENT_WORKAROUND', 'CONSEQUENCE_COST', 'PAID_BEFORE', 'AI_GROUP', 'HUMAN_APPROVAL', 'CONTACT_EMAIL', 'RECEIVED_AT', 'RAW_JSON'],
  KNOWLEDGE_MAP: ['NEED_GROUP', 'MODULE_ID', 'MODULE', 'TOPIC', 'CORE_QUESTION', 'REQUIRED_KNOWLEDGE', 'SOURCE', 'SOURCE_STATUS', 'SOURCE_REVIEWER', 'SOURCE_REVIEWED_AT', 'RAW_JSON'],
  PRODUCT_STRUCTURE: ['MODULE_ID', 'NAME', 'GOAL', 'CUSTOMER_DELIVERABLE', 'REQUIRED_ASSETS', 'ORDER_INDEX', 'RAW_JSON'],
  DOCUMENT_STATUS: ['DOCUMENT_ID', 'NAME', 'TYPE', 'MODULE_ID', 'STATUS', 'SOURCE', 'REVIEWER', 'REVIEWED_AT', 'VERSION', 'LINK', 'RAW_JSON'],
  SCENE_PLAN: ['SCENE_ID', 'SOURCE_DOCUMENT_ID', 'TIMECODE', 'NARRATION', 'SCENE_TYPE', 'TOOL', 'REQUIRED_CONTENT', 'SCENE_PROMPT', 'SOURCE_ASSET', 'HUMAN_CHECKPOINT', 'CAPCUT_NOTES', 'RAW_JSON'],
  ORDERS: ['ORDER_ID', 'FULL_NAME', 'EMAIL', 'PRODUCT', 'PRICE', 'PAID_AT', 'STATUS', 'ACCESS_GRANTED_AT', 'DOCUMENT_LINK', 'MILESTONE_1_COMPLETE', 'REMINDER_DAY_3', 'REMINDER_DAY_7', 'COMPLETED_AT', 'SYSTEM_NOTES', 'WELCOME_SENT_AT'],
  FEEDBACK: ['ORDER_ID', 'EMAIL', 'SENT_AT', 'ORIGINAL_TEXT', 'AI_GROUP', 'RELATED_DOCUMENT', 'NEEDS_HUMAN', 'DECISION', 'TARGET_VERSION', 'QUOTE_CONSENT', 'SYSTEM_NOTES', 'RAW_JSON'],
  TEST_USERS: ['RECEIVED_AT', 'START_STEP', 'COMPLETION_TIME', 'QUESTIONS', 'DOCUMENTS_OPENED', 'STOP_POINT', 'UNDERSTANDING', 'OUTPUT_CREATED', 'NEEDS_MORE_EXPLANATION'],
  SUPPORT_MAIL: ['MAIL_ID', 'RECEIVED_AT', 'SENDER_EMAIL', 'SUBJECT', 'EXCERPT', 'AI_GROUP', 'CLASSIFICATION_REASON', 'SUGGESTED_ACTION', 'RELATED_ORDER_ID', 'PROCESSED', 'RAW_JSON'],
  AI_TESTS: ['DATE', 'QUESTION', 'ANSWER', 'SOURCE_DOCUMENT', 'CORRECT'],
  RELEASES: ['VERSION', 'RELEASE_DATE', 'CHANGELOG', 'SOURCES_USED', 'UPDATED_ASSETS'],
  AUDIT_LOG: ['TIME', 'STEP', 'RESULT', 'DETAILS']
};

var KNOWLEDGE_DEFAULT_CONFIG = [
  ['MODEL', 'gpt-4.1-mini', 'โมเดล OpenAI ที่บัญชีของคุณมีสิทธิ์ใช้'],
  ['MAX_TOKENS', '5000', 'จำนวนโทเค็นสูงสุดต่อคำขอ'],
  ['TOKEN_PARAMETER', 'max_completion_tokens', 'ระบบจะสลับเป็น max_tokens อัตโนมัติเมื่อจำเป็น'],
  ['EMAIL_LIMIT_PER_RUN', '20', 'จำนวนอีเมลสูงสุดต่อรอบ'],
  ['SUPPORT_MINUTES_PER_EMAIL', '5', 'เวลามาตรฐานสำหรับประเมินงานสนับสนุน'],
  ['DOCUMENTS_PER_RUN', '3', 'จำนวนร่างเอกสารสูงสุดต่อรอบ'],
  ['DOCUMENT_CHARACTER_LIMIT', '30000', 'จำนวนอักขระสูงสุดที่อ่านเพื่อสร้างแผนฉาก'],
  ['DEFAULT_PRICE', '2990', 'ราคามาตรฐานเป็นบาท'],
  ['DEFAULT_PRODUCT_NAME', 'ชุดความรู้เชิงปฏิบัติ', 'ชื่อผลิตภัณฑ์มาตรฐานสำหรับตลาดไทย'],
  ['SUPPORT_LABEL', 'SOLOSIX_M3_SUPPORT', 'ป้าย Gmail สำหรับอีเมลสนับสนุนที่รอจัดหมวดหมู่'],
  ['SUPPORT_DONE_LABEL', 'SOLOSIX_M3_PROCESSED', 'ป้าย Gmail หลังบันทึกอีเมลแล้ว'],
  ['ROOT_FOLDER_ID', '', 'รหัสโฟลเดอร์หลัก สร้างโดยระบบ'],
  ['PUBLISHED_FOLDER_ID', '', 'รหัสโฟลเดอร์สำหรับส่งมอบ สร้างโดยระบบ'],
  ['INTERVIEW_FORM_URL', '', 'ลิงก์แบบฟอร์มสัมภาษณ์สำหรับผู้ตอบ'],
  ['INTERVIEW_FORM_EDIT_URL', '', 'ลิงก์แก้ไขแบบฟอร์มสัมภาษณ์'],
  ['FEEDBACK_FORM_URL', '', 'ลิงก์แบบฟอร์มฟีดแบ็กสำหรับผู้เรียน'],
  ['FEEDBACK_FORM_EDIT_URL', '', 'ลิงก์แก้ไขแบบฟอร์มฟีดแบ็ก'],
  ['TEST_USER_FORM_URL', '', 'ลิงก์แบบฟอร์มผู้ใช้ทดลอง'],
  ['TEST_USER_FORM_EDIT_URL', '', 'ลิงก์แก้ไขแบบฟอร์มผู้ใช้ทดลอง'],
  ['PROMPT_GROUP_RESEARCH', 'จัดกลุ่มข้อความลูกค้าโดยยึดเฉพาะข้อมูลที่ให้มา ตอบ JSON {"problem":"","ai_group":""} ห้ามเดาข้อมูล ห้ามใส่ชื่อ อีเมล เบอร์โทร หรือข้อมูลส่วนบุคคล', 'พรอมต์ขั้นตอน 2'],
  ['PROMPT_KNOWLEDGE_MAP', 'สร้างแผนที่ความรู้จากความต้องการที่มนุษย์อนุมัติแล้ว ตอบ JSON {"items":[{"need_group":"","module":"","topic":"","core_question":"","required_knowledge":""}]} ห้ามสร้างแหล่งอ้างอิงขึ้นเอง', 'พรอมต์ขั้นตอน 3'],
  ['PROMPT_PRODUCT_STRUCTURE', 'ออกแบบโครงสร้างผลิตภัณฑ์จากแผนที่ความรู้ที่มีแหล่ง APPROVED เท่านั้น ตอบ JSON {"modules":[{"name":"","goal":"","customer_deliverable":"","required_assets":"","order_index":1}]} ทุกโมดูลต้องมีผลลัพธ์ที่ลูกค้านำไปใช้ได้จริง', 'พรอมต์ขั้นตอน 4'],
  ['PROMPT_DOCUMENT_DRAFT', 'ร่างเอกสารภาษาไทยจากข้อมูลและแหล่งอ้างอิงที่ให้มาเท่านั้น ตอบ JSON {"documents":[{"name":"","type":"GUIDE","body":"","source":""}]} หากข้อมูลไม่พอให้ใส่ [NEEDS_MORE_INFO: ...] ห้ามแต่งกรณีศึกษา ตัวเลข ผลลัพธ์ หรือคำรับรอง', 'พรอมต์ขั้นตอน 5'],
  ['PROMPT_SCENE_PLAN', 'สร้างแผนฉากจากเอกสารที่อนุมัติแล้ว ตอบ JSON {"scenes":[{"timecode":"","narration":"","scene_type":"REAL_SCREEN","tool":"","required_content":"","scene_prompt":"","source_asset":"","human_checkpoint":"","capcut_notes":""}]} การสาธิตขั้นตอนต้องเป็น REAL_SCREEN เท่านั้น VEO_SCENE และ SEEDANCE_SCENE ใช้เป็นภาพประกอบ ห้ามทำเป็นหลักฐานจริง', 'พรอมต์ขั้นตอน 6'],
  ['PROMPT_SUPPORT_CLASSIFICATION', 'จัดหมวดหมู่อีเมลสนับสนุน ตอบ JSON {"ai_group":"IN_SCOPE","classification_reason":"","suggested_action":""} โดย ai_group ต้องเป็น IN_SCOPE, OUT_OF_SCOPE หรือ COMPLAINT เท่านั้น เสนอการดำเนินการแต่ห้ามตอบหรือรับปากแทนผู้ขาย', 'พรอมต์ขั้นตอน 12'],
  ['PROMPT_FEEDBACK_REVIEW', 'วิเคราะห์ฟีดแบ็กจากข้อความเดิมและรหัสเอกสารจริง ตอบ JSON {"ai_group":"UNCLEAR_GUIDANCE","related_document":""} โดย ai_group ต้องเป็น ANSWER_EXISTS_HARD_TO_FIND, UNCLEAR_GUIDANCE, OUT_OF_SCOPE หรือ FUTURE_RELEASE เท่านั้น ห้ามตัดสินใจแก้ผลิตภัณฑ์', 'พรอมต์ขั้นตอน 14'],
  ['WELCOME_SUBJECT', 'ยินดีต้อนรับสู่ {{PRODUCT}}', 'หัวข้ออีเมลต้อนรับ'],
  ['WELCOME_BODY', 'สวัสดี {{FULL_NAME}}\n\nระบบเปิดสิทธิ์เอกสารให้คุณแล้ว: {{DOCUMENT_LINK}}\n\nเริ่มจากเอกสารแรกและทำตามลำดับ หากมีคำถามให้ตอบกลับอีเมลนี้\n\nทีม WEUP SoloSix', 'แม่แบบอีเมลต้อนรับ'],
  ['REMINDER_DAY_3_SUBJECT', 'วันที่ 3: ตรวจความคืบหน้าของ {{PRODUCT}}', 'หัวข้ออีเมลวันที่ 3'],
  ['REMINDER_DAY_3_BODY', 'สวัสดี {{FULL_NAME}}\n\nวันนี้เป็นวันที่ 3 ลองเปิด {{DOCUMENT_LINK}} และทำผลลัพธ์แรกให้เสร็จ หากติดขัดให้ตอบกลับอีเมลนี้\n\nทีม WEUP SoloSix', 'แม่แบบอีเมลวันที่ 3'],
  ['REMINDER_DAY_7_SUBJECT', 'วันที่ 7: สรุปผลและส่งฟีดแบ็ก', 'หัวข้ออีเมลวันที่ 7'],
  ['REMINDER_DAY_7_BODY', 'สวัสดี {{FULL_NAME}}\n\nครบ 7 วันแล้ว กรุณาตรวจผลลัพธ์ของคุณ และส่งฟีดแบ็กที่ {{FEEDBACK_FORM_URL}}\n\nทีม WEUP SoloSix', 'แม่แบบอีเมลวันที่ 7']
];

function onOpen() {
  var ui;
  try { ui = SpreadsheetApp.getUi(); }
  catch (noUi) { console.log('เมนูจะปรากฏอัตโนมัติเมื่อเปิด Google Sheets'); return; }
  ui.createMenu('ผลิตภัณฑ์ความรู้')
    .addItem('1. สร้างแบบฟอร์มสัมภาษณ์', 'createKnowledgeForms')
    .addItem('2. จัดกลุ่มความต้องการ', 'groupResearchNeeds')
    .addItem('3. สร้างแผนที่ความรู้', 'buildKnowledgeMap')
    .addItem('4. เสนอโครงสร้างผลิตภัณฑ์', 'proposeProductStructure')
    .addItem('5. สร้างร่างเอกสาร', 'createDocumentDrafts')
    .addItem('6. สร้างแผนฉาก', 'createScenePlans')
    .addItem('7. บันทึกคำสั่งซื้อ', 'recordKnowledgeOrder')
    .addItem('8. ให้สิทธิ์เอกสาร', 'grantKnowledgeAccess')
    .addItem('9. ส่งอีเมลต้อนรับ', 'sendKnowledgeWelcome')
    .addItem('10. เตือนวันที่ 3', 'sendKnowledgeDay3Reminder')
    .addItem('11. เตือนวันที่ 7', 'sendKnowledgeDay7Reminder')
    .addItem('12. อ่านและจัดหมวดหมู่อีเมลสนับสนุน', 'processKnowledgeSupportMail')
    .addItem('13. บันทึกการเรียนจบ', 'markKnowledgeCompleted')
    .addItem('14. อ่านฟีดแบ็กและระบุส่วนที่ต้องแก้ไข', 'reviewKnowledgeFeedback')
    .addSeparator()
    .addItem('เปิดแดชบอร์ด', 'openKnowledgeDashboard')
    .addItem('สร้างโครงสร้างชีต', 'createKnowledgeSheets')
    .addItem('สร้างโครงสร้างโฟลเดอร์ Drive', 'createKnowledgeDrive')
    .addItem('ตรวจสอบการเชื่อมต่อ API', 'testKnowledgeOpenAI')
    .addSeparator()
    .addItem('ติดตั้งระบบทั้งหมด', 'installSystem')
    .addToUi();
}

function installSystem() {
  try {
    createKnowledgeSheets_(false);
    createKnowledgeDrive_(false);
    createKnowledgeForms_(false);
    installKnowledgeTriggers_();
    var missing = knowledgeInstallationGaps_();
    knowledgeAudit_('INSTALL_SYSTEM', missing.length ? 'WARNING' : 'SUCCESS', missing.join(', ') || 'ติดตั้งครบ');
    knowledgeNotify_('ติดตั้งระบบเรียบร้อย', missing.length ? 'ยังต้องตรวจสอบ: ' + missing.join(', ') : 'สร้างชีต โฟลเดอร์ แบบฟอร์ม และทริกเกอร์ครบแล้ว');
  } catch (error) { knowledgeFail_('ติดตั้งระบบไม่สำเร็จ', error); }
}

function createKnowledgeSheets() {
  try { createKnowledgeSheets_(true); }
  catch (error) { knowledgeFail_('สร้างโครงสร้างชีตไม่สำเร็จ', error); }
}

function createKnowledgeSheets_(showMessage) {
  var ss = knowledgeSpreadsheet_();
  PropertiesService.getScriptProperties().setProperty(KNOWLEDGE.property.spreadsheetId, ss.getId());
  ss.setSpreadsheetTimeZone(KNOWLEDGE.timeZone);
  try { ss.setSpreadsheetLocale(KNOWLEDGE.locale); } catch (ignoreLocale) {}
  Object.keys(KNOWLEDGE_HEADERS).forEach(function (name) { knowledgeEnsureSheet_(name, KNOWLEDGE_HEADERS[name]); });
  knowledgeEnsureSheet_(KNOWLEDGE.sheets.rawInterview, ['RECEIVED_AT', 'FORM_ID', 'RAW_RESPONSE']);
  knowledgeEnsureSheet_(KNOWLEDGE.sheets.rawFeedback, ['RECEIVED_AT', 'FORM_ID', 'RAW_RESPONSE']);
  knowledgeEnsureSheet_(KNOWLEDGE.sheets.rawTesters, ['RECEIVED_AT', 'FORM_ID', 'RAW_RESPONSE']);
  knowledgeSeedConfig_();
  knowledgeApplyValidations_();
  knowledgeAudit_('CREATE_SHEETS', 'SUCCESS', 'ตรวจสอบ 13 ชีตระบบและ 3 ชีตข้อมูลดิบแล้ว');
  if (showMessage) knowledgeNotify_('สร้างโครงสร้างชีตแล้ว', 'ระบบเพิ่มเฉพาะชีตและคอลัมน์ที่ยังขาด โดยไม่ลบข้อมูลเดิม');
}

function createKnowledgeDrive() {
  try { createKnowledgeDrive_(true); }
  catch (error) { knowledgeFail_('สร้างโครงสร้าง Drive ไม่สำเร็จ', error); }
}

function createKnowledgeDrive_(showMessage) {
  createKnowledgeSheets_(false);
  var props = PropertiesService.getScriptProperties();
  var rootId = props.getProperty(KNOWLEDGE.property.rootFolderId) || knowledgeConfig_('ROOT_FOLDER_ID', '');
  var root = null;
  if (rootId) { try { root = DriveApp.getFolderById(rootId); } catch (ignoreMissingRoot) {} }
  if (!root) {
    root = DriveApp.createFolder('SOLOSIX_M3_' + knowledgeSpreadsheet_().getName());
    props.setProperty(KNOWLEDGE.property.rootFolderId, root.getId());
    knowledgeSetConfig_('ROOT_FOLDER_ID', root.getId(), 'รหัสโฟลเดอร์หลัก สร้างโดยระบบ');
  }
  var links = [];
  KNOWLEDGE.folders.forEach(function (name) {
    var folder = knowledgeGetOrCreateFolder_(root, name);
    knowledgeSetConfig_(name + '_FOLDER_ID', folder.getId(), 'รหัสโฟลเดอร์ ' + name);
    if (name === '05_PUBLISHED') knowledgeSetConfig_('PUBLISHED_FOLDER_ID', folder.getId(), 'รหัสโฟลเดอร์สำหรับส่งมอบ');
    links.push(name + ': ' + folder.getUrl());
  });
  knowledgeAudit_('CREATE_DRIVE', 'SUCCESS', root.getUrl());
  if (showMessage) knowledgeNotify_('สร้างโครงสร้าง Drive แล้ว', 'โฟลเดอร์หลัก: ' + root.getUrl() + '\n\n' + links.join('\n'));
  return root;
}

function createKnowledgeForms() {
  try { createKnowledgeForms_(true); }
  catch (error) { knowledgeFail_('สร้างแบบฟอร์มไม่สำเร็จ', error); }
}

function createKnowledgeForms_(showMessage) {
  createKnowledgeSheets_(false);
  var definitions = [
    {
      property: KNOWLEDGE.property.interviewFormId,
      title: 'แบบสัมภาษณ์ความต้องการ — WEUP SoloSix',
      description: 'แบบฟอร์มนี้ใช้เก็บปัญหาและวิธีทำงานจริงเพื่อออกแบบผลิตภัณฑ์ความรู้ กรุณาไม่ใส่ข้อมูลลับของลูกค้า',
      urlKey: 'INTERVIEW_FORM_URL', editKey: 'INTERVIEW_FORM_EDIT_URL',
      questions: [
        ['แหล่งข้อมูลหรือบริบทของคุณ', true], ['คำพูดหรือปัญหาที่เกิดขึ้นจริง', true],
        ['ปัจจุบันแก้ปัญหานี้อย่างไร', true], ['ผลกระทบหรือค่าใช้จ่ายจากปัญหานี้', false],
        ['เคยจ่ายเงินเพื่อแก้ปัญหานี้หรือไม่ และอย่างไร', false], ['อีเมลสำหรับติดต่อกลับ', false]
      ]
    },
    {
      property: KNOWLEDGE.property.feedbackFormId,
      title: 'แบบฟีดแบ็กหลังเรียน — WEUP SoloSix',
      description: 'บอกสิ่งที่ทำได้จริง จุดที่หาไม่พบ และส่วนที่ต้องอธิบายให้ชัดขึ้น',
      urlKey: 'FEEDBACK_FORM_URL', editKey: 'FEEDBACK_FORM_EDIT_URL',
      questions: [
        ['รหัสคำสั่งซื้อ (ถ้ามี)', false], ['อีเมลที่ใช้สั่งซื้อ', true], ['ฟีดแบ็กหรือปัญหาที่พบ', true],
        ['อนุญาตให้นำข้อความไปอ้างอิงแบบไม่เปิดเผยตัวตนหรือไม่', false]
      ]
    },
    {
      property: KNOWLEDGE.property.testFormId,
      title: 'บันทึกผู้ใช้ทดลอง — WEUP SoloSix',
      description: 'ใช้บันทึกการทดลองทำงานด้วยตนเองก่อนเปิดขาย',
      urlKey: 'TEST_USER_FORM_URL', editKey: 'TEST_USER_FORM_EDIT_URL',
      questions: [
        ['เริ่มต้นที่ขั้นตอนไหน', true], ['ใช้เวลาจนเสร็จเท่าไร', true], ['มีคำถามอะไรเกิดขึ้นบ้าง', false],
        ['เปิดเอกสารใดบ้าง', false], ['หยุดหรือติดขัดตรงไหน', false], ['เข้าใจว่าต้องทำอะไร', false],
        ['สร้างผลลัพธ์อะไรได้', false], ['ส่วนใดต้องอธิบายเพิ่ม', false]
      ]
    }
  ];
  definitions.forEach(function (def) {
    var form = knowledgeOpenOrCreateForm_(def);
    knowledgeSetConfig_(def.urlKey, form.getPublishedUrl(), 'ลิงก์สำหรับผู้ตอบ');
    knowledgeSetConfig_(def.editKey, form.getEditUrl(), 'ลิงก์สำหรับผู้ดูแล');
  });
  installKnowledgeTriggers_();
  knowledgeAudit_('CREATE_FORMS', 'SUCCESS', 'ตรวจสอบแบบฟอร์ม 3 รายการแล้ว');
  if (showMessage) knowledgeNotify_('สร้างแบบฟอร์มแล้ว', 'ลิงก์สำหรับผู้ตอบและผู้ดูแลอยู่ในชีต CONFIG');
}

function knowledgeOpenOrCreateForm_(def) {
  var props = PropertiesService.getScriptProperties();
  var formId = props.getProperty(def.property);
  var form = null;
  if (formId) { try { form = FormApp.openById(formId); } catch (ignoreMissingForm) {} }
  if (!form) {
    form = FormApp.create(def.title);
    form.setDescription(def.description).setCollectEmail(false);
    def.questions.forEach(function (question) {
      form.addParagraphTextItem().setTitle(question[0]).setRequired(question[1]);
    });
    form.setDestination(FormApp.DestinationType.SPREADSHEET, knowledgeSpreadsheet_().getId());
    props.setProperty(def.property, form.getId());
  }
  return form;
}

function installKnowledgeTriggers_() {
  var handler = 'onKnowledgeFormSubmit';
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === handler) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger(handler).forSpreadsheet(knowledgeSpreadsheet_()).onFormSubmit().create();
}

function onKnowledgeFormSubmit(event) {
  try {
    if (!event || !event.namedValues) return;
    var named = event.namedValues;
    var raw = JSON.stringify(named);
    var formId = event.range && event.range.getSheet ? event.range.getSheet().getFormUrl() : '';
    var titleKeys = Object.keys(named);
    var joined = titleKeys.join('|');
    if (joined.indexOf('ฟีดแบ็ก') >= 0 || joined.indexOf('รหัสคำสั่งซื้อ') >= 0) {
      knowledgeAppend_(KNOWLEDGE.sheets.rawFeedback, { RECEIVED_AT: new Date(), FORM_ID: formId, RAW_RESPONSE: raw });
      knowledgeAppend_(KNOWLEDGE.sheets.feedback, {
        ORDER_ID: knowledgeNamed_(named, 'รหัสคำสั่งซื้อ (ถ้ามี)'), EMAIL: knowledgeNamed_(named, 'อีเมลที่ใช้สั่งซื้อ'),
        SENT_AT: new Date(), ORIGINAL_TEXT: knowledgeNamed_(named, 'ฟีดแบ็กหรือปัญหาที่พบ'),
        QUOTE_CONSENT: knowledgeNamed_(named, 'อนุญาตให้นำข้อความไปอ้างอิงแบบไม่เปิดเผยตัวตนหรือไม่'), RAW_JSON: raw
      });
    } else if (joined.indexOf('เริ่มต้นที่ขั้นตอนไหน') >= 0) {
      knowledgeAppend_(KNOWLEDGE.sheets.rawTesters, { RECEIVED_AT: new Date(), FORM_ID: formId, RAW_RESPONSE: raw });
      knowledgeAppend_(KNOWLEDGE.sheets.testers, {
        RECEIVED_AT: new Date(), START_STEP: knowledgeNamed_(named, 'เริ่มต้นที่ขั้นตอนไหน'), COMPLETION_TIME: knowledgeNamed_(named, 'ใช้เวลาจนเสร็จเท่าไร'),
        QUESTIONS: knowledgeNamed_(named, 'มีคำถามอะไรเกิดขึ้นบ้าง'), DOCUMENTS_OPENED: knowledgeNamed_(named, 'เปิดเอกสารใดบ้าง'),
        STOP_POINT: knowledgeNamed_(named, 'หยุดหรือติดขัดตรงไหน'), UNDERSTANDING: knowledgeNamed_(named, 'เข้าใจว่าต้องทำอะไร'),
        OUTPUT_CREATED: knowledgeNamed_(named, 'สร้างผลลัพธ์อะไรได้'), NEEDS_MORE_EXPLANATION: knowledgeNamed_(named, 'ส่วนใดต้องอธิบายเพิ่ม')
      });
    } else {
      knowledgeAppend_(KNOWLEDGE.sheets.rawInterview, { RECEIVED_AT: new Date(), FORM_ID: formId, RAW_RESPONSE: raw });
      knowledgeAppend_(KNOWLEDGE.sheets.research, {
        DATA_SOURCE: knowledgeNamed_(named, 'แหล่งข้อมูลหรือบริบทของคุณ'), CUSTOMER_QUOTE: knowledgeNamed_(named, 'คำพูดหรือปัญหาที่เกิดขึ้นจริง'),
        CURRENT_WORKAROUND: knowledgeNamed_(named, 'ปัจจุบันแก้ปัญหานี้อย่างไร'), CONSEQUENCE_COST: knowledgeNamed_(named, 'ผลกระทบหรือค่าใช้จ่ายจากปัญหานี้'),
        PAID_BEFORE: knowledgeNamed_(named, 'เคยจ่ายเงินเพื่อแก้ปัญหานี้หรือไม่ และอย่างไร'), CONTACT_EMAIL: knowledgeNamed_(named, 'อีเมลสำหรับติดต่อกลับ'),
        RECEIVED_AT: new Date(), RAW_JSON: raw
      });
    }
  } catch (error) { knowledgeAudit_('FORM_SUBMIT', 'ERROR', error.message); }
}

function groupResearchNeeds() {
  try {
    createKnowledgeSheets_(false);
    var table = knowledgeRead_(KNOWLEDGE.sheets.research);
    var processed = 0;
    table.rows.forEach(function (row, index) {
      var quote = knowledgeCell_(row, table.map, 'CUSTOMER_QUOTE');
      if (!quote || knowledgeCell_(row, table.map, 'AI_GROUP')) return;
      var safePayload = {
        customer_quote: knowledgeRedact_(quote),
        current_workaround: knowledgeRedact_(knowledgeCell_(row, table.map, 'CURRENT_WORKAROUND')),
        consequence_cost: knowledgeRedact_(knowledgeCell_(row, table.map, 'CONSEQUENCE_COST')),
        paid_before: knowledgeRedact_(knowledgeCell_(row, table.map, 'PAID_BEFORE'))
      };
      var raw = knowledgeCallOpenAI_('คุณเป็นผู้ช่วยวิจัยความต้องการสำหรับตลาดไทย ยึดข้อมูลจริงเท่านั้น', knowledgePrompt_('PROMPT_GROUP_RESEARCH') + '\nข้อมูลที่ลบข้อมูลส่วนบุคคลแล้ว:\n' + JSON.stringify(safePayload));
      var data = knowledgeParseJson_(raw);
      if (!data) { knowledgeWrite_(table, index + 2, { RAW_JSON: raw }); return; }
      knowledgeWrite_(table, index + 2, { PROBLEM: knowledgeText_(data.problem), AI_GROUP: knowledgeText_(data.ai_group), RAW_JSON: raw });
      processed++;
    });
    knowledgeAudit_('GROUP_RESEARCH', 'SUCCESS', 'ประมวลผล ' + processed + ' แถว');
    knowledgeNotify_('จัดกลุ่มความต้องการแล้ว', 'ประมวลผล ' + processed + ' แถว กรุณาตรวจและกรอก HUMAN_APPROVAL ด้วยตนเอง');
  } catch (error) { knowledgeFail_('จัดกลุ่มความต้องการไม่สำเร็จ', error); }
}

function buildKnowledgeMap() {
  try {
    createKnowledgeSheets_(false);
    var source = knowledgeRead_(KNOWLEDGE.sheets.research);
    var approved = source.rows.filter(function (row) {
      return knowledgeIsApproved_(knowledgeCell_(row, source.map, 'HUMAN_APPROVAL')) && knowledgeCell_(row, source.map, 'CUSTOMER_QUOTE');
    }).map(function (row) {
      return { group: knowledgeCell_(row, source.map, 'AI_GROUP'), problem: knowledgeCell_(row, source.map, 'PROBLEM'), quote: knowledgeRedact_(knowledgeCell_(row, source.map, 'CUSTOMER_QUOTE')) };
    });
    if (!approved.length) throw new Error('ยังไม่มีแถว RESEARCH ที่ผู้รับผิดชอบกรอก HUMAN_APPROVAL');
    var raw = knowledgeCallOpenAI_('คุณออกแบบแผนที่ความรู้โดยไม่สร้างแหล่งอ้างอิงขึ้นเอง', knowledgePrompt_('PROMPT_KNOWLEDGE_MAP') + '\nข้อมูลที่อนุมัติแล้ว:\n' + JSON.stringify(approved));
    var data = knowledgeParseJson_(raw);
    if (!data || !data.items) { knowledgeAppend_(KNOWLEDGE.sheets.map, { RAW_JSON: raw, SOURCE_STATUS: 'NEEDS_MORE_INFO' }); throw new Error('AI ส่ง JSON ไม่ถูกต้อง ระบบเก็บข้อความไว้ใน RAW_JSON แล้ว'); }
    var moduleIds = {};
    knowledgeArray_(data.items).forEach(function (item, index) {
      var moduleName = knowledgeText_(item.module) || 'โมดูล ' + (index + 1);
      if (!moduleIds[moduleName]) moduleIds[moduleName] = 'MOD-' + knowledgePad_(Object.keys(moduleIds).length + 1, 2);
      knowledgeAppend_(KNOWLEDGE.sheets.map, {
        NEED_GROUP: knowledgeText_(item.need_group), MODULE_ID: moduleIds[moduleName], MODULE: moduleName,
        TOPIC: knowledgeText_(item.topic), CORE_QUESTION: knowledgeText_(item.core_question), REQUIRED_KNOWLEDGE: knowledgeText_(item.required_knowledge),
        SOURCE: '', SOURCE_STATUS: 'NEEDS_MORE_INFO', RAW_JSON: raw
      });
    });
    knowledgeAudit_('BUILD_KNOWLEDGE_MAP', 'SUCCESS', 'สร้าง ' + knowledgeArray_(data.items).length + ' รายการ');
    knowledgeNotify_('สร้างแผนที่ความรู้แล้ว', 'กรุณาเพิ่ม SOURCE และให้ผู้รับผิดชอบเปลี่ยน SOURCE_STATUS เป็น APPROVED');
  } catch (error) { knowledgeFail_('สร้างแผนที่ความรู้ไม่สำเร็จ', error); }
}

function proposeProductStructure() {
  try {
    createKnowledgeSheets_(false);
    var table = knowledgeRead_(KNOWLEDGE.sheets.map);
    var approved = table.rows.filter(function (row) { return knowledgeCell_(row, table.map, 'SOURCE_STATUS') === 'APPROVED'; }).map(function (row) {
      return knowledgeRowObject_(table.headers, row);
    });
    if (!approved.length) throw new Error('ยังไม่มีแหล่งข้อมูลที่ SOURCE_STATUS เป็น APPROVED');
    var raw = knowledgeCallOpenAI_('คุณออกแบบผลิตภัณฑ์ความรู้เชิงปฏิบัติสำหรับตลาดไทย', knowledgePrompt_('PROMPT_PRODUCT_STRUCTURE') + '\nแผนที่ความรู้ที่อนุมัติ:\n' + JSON.stringify(approved));
    var data = knowledgeParseJson_(raw);
    if (!data || !data.modules) { knowledgeAppend_(KNOWLEDGE.sheets.structure, { RAW_JSON: raw }); throw new Error('AI ส่ง JSON ไม่ถูกต้อง ระบบเก็บข้อความไว้ใน RAW_JSON แล้ว'); }
    knowledgeArray_(data.modules).forEach(function (item, index) {
      var moduleId = knowledgeText_(item.module_id) || 'MOD-' + knowledgePad_(index + 1, 2);
      knowledgeUpsert_(KNOWLEDGE.sheets.structure, 'MODULE_ID', moduleId, {
        MODULE_ID: moduleId, NAME: knowledgeText_(item.name), GOAL: knowledgeText_(item.goal),
        CUSTOMER_DELIVERABLE: knowledgeText_(item.customer_deliverable), REQUIRED_ASSETS: knowledgeText_(item.required_assets),
        ORDER_INDEX: Number(item.order_index) || index + 1, RAW_JSON: raw
      });
    });
    knowledgeAudit_('PROPOSE_STRUCTURE', 'SUCCESS', 'สร้าง ' + knowledgeArray_(data.modules).length + ' โมดูล');
    knowledgeNotify_('เสนอโครงสร้างผลิตภัณฑ์แล้ว', 'ตรวจผลลัพธ์ใน PRODUCT_STRUCTURE ก่อนสร้างร่างเอกสาร');
  } catch (error) { knowledgeFail_('เสนอโครงสร้างผลิตภัณฑ์ไม่สำเร็จ', error); }
}

function createDocumentDrafts() {
  try {
    createKnowledgeSheets_(false);
    createKnowledgeDrive_(false);
    var moduleId = knowledgeAsk_('สร้างร่างเอกสาร', 'กรอก MODULE_ID ที่ต้องการ เช่น MOD-01');
    if (!moduleId) return;
    createDocumentDraftsForModule_(moduleId);
  } catch (error) { knowledgeFail_('สร้างร่างเอกสารไม่สำเร็จ', error); }
}

function createDocumentDraftsForModule_(moduleId) {
  var structure = knowledgeFind_(KNOWLEDGE.sheets.structure, 'MODULE_ID', moduleId);
  if (!structure) throw new Error('ไม่พบ MODULE_ID: ' + moduleId);
  var map = knowledgeRead_(KNOWLEDGE.sheets.map);
  var sources = map.rows.filter(function (row) {
    return knowledgeCell_(row, map.map, 'MODULE_ID') === moduleId && knowledgeCell_(row, map.map, 'SOURCE_STATUS') === 'APPROVED' && knowledgeCell_(row, map.map, 'SOURCE');
  }).map(function (row) { return knowledgeRowObject_(map.headers, row); });
  if (!sources.length) throw new Error('โมดูลนี้ยังไม่มี SOURCE ที่ได้รับ APPROVED');
  var raw = knowledgeCallOpenAI_('คุณร่างเอกสารจากหลักฐานที่ผ่านการอนุมัติแล้วเท่านั้น', knowledgePrompt_('PROMPT_DOCUMENT_DRAFT') + '\nโครงสร้าง:\n' + JSON.stringify(structure.object) + '\nแหล่งข้อมูล:\n' + JSON.stringify(sources));
  var data = knowledgeParseJson_(raw);
  if (!data || !data.documents) { knowledgeAppend_(KNOWLEDGE.sheets.documents, { MODULE_ID: moduleId, STATUS: 'AI_DRAFT', RAW_JSON: raw }); throw new Error('AI ส่ง JSON ไม่ถูกต้อง ระบบเก็บข้อความไว้ใน RAW_JSON แล้ว'); }
  var limit = Math.max(1, Math.min(3, knowledgeNumberConfig_('DOCUMENTS_PER_RUN', 3)));
  var folder = DriveApp.getFolderById(knowledgeConfig_('03_AI_DRAFTS_FOLDER_ID', ''));
  var created = 0;
  knowledgeArray_(data.documents).slice(0, limit).forEach(function (item) {
    var documentId = knowledgeNextId_('DOC', KNOWLEDGE.sheets.documents, 'DOCUMENT_ID');
    var name = knowledgeText_(item.name) || ('ร่างเอกสาร ' + documentId);
    var doc = DocumentApp.create(name);
    doc.getBody().setText(knowledgeText_(item.body) || '[NEEDS_MORE_INFO: ยังไม่มีเนื้อหาเพียงพอ]');
    doc.saveAndClose();
    knowledgeMoveFile_(doc.getId(), folder);
    knowledgeAppend_(KNOWLEDGE.sheets.documents, {
      DOCUMENT_ID: documentId, NAME: name, TYPE: knowledgeText_(item.type) || 'GUIDE', MODULE_ID: moduleId,
      STATUS: 'AI_DRAFT', SOURCE: knowledgeText_(item.source) || sources.map(function (s) { return s.SOURCE; }).join('; '),
      VERSION: 'v0.1', LINK: doc.getUrl(), RAW_JSON: raw
    });
    created++;
  });
  knowledgeAudit_('CREATE_DOCUMENT_DRAFTS', 'SUCCESS', moduleId + ': ' + created + ' เอกสาร');
  knowledgeNotify_('สร้างร่างเอกสารแล้ว', 'สร้าง ' + created + ' รายการใน 03_AI_DRAFTS ร่างทั้งหมดมีสถานะ AI_DRAFT และต้องผ่านการตรวจโดยมนุษย์');
}

function createScenePlans() {
  try {
    createKnowledgeSheets_(false);
    var documentId = knowledgeAsk_('สร้างแผนฉาก', 'กรอก DOCUMENT_ID ที่มีสถานะ APPROVED_TO_PUBLISH');
    if (!documentId) return;
    createScenePlanForDocument_(documentId);
  } catch (error) { knowledgeFail_('สร้างแผนฉากไม่สำเร็จ', error); }
}

function createScenePlanForDocument_(documentId) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.documents, 'DOCUMENT_ID', documentId);
  if (!found) throw new Error('ไม่พบ DOCUMENT_ID: ' + documentId);
  var item = found.object;
  if (item.STATUS !== 'APPROVED_TO_PUBLISH' || !item.REVIEWER || !item.REVIEWED_AT || !item.LINK) {
    throw new Error('เอกสารต้องมี STATUS = APPROVED_TO_PUBLISH พร้อม REVIEWER, REVIEWED_AT และ LINK');
  }
  var googleId = knowledgeIdFromUrl_(item.LINK);
  if (!googleId) throw new Error('อ่านรหัส Google Docs จาก LINK ไม่ได้');
  var maxChars = knowledgeNumberConfig_('DOCUMENT_CHARACTER_LIMIT', 30000);
  var content = DocumentApp.openById(googleId).getBody().getText().slice(0, maxChars);
  var raw = knowledgeCallOpenAI_('คุณวางแผนวิดีโอจากเอกสารที่มนุษย์อนุมัติแล้ว ห้ามทำภาพจำลองให้ดูเหมือนหลักฐานจริง', knowledgePrompt_('PROMPT_SCENE_PLAN') + '\nDOCUMENT_ID: ' + documentId + '\nเนื้อหา:\n' + content);
  var data = knowledgeParseJson_(raw);
  if (!data || !data.scenes) { knowledgeAppend_(KNOWLEDGE.sheets.scenes, { SOURCE_DOCUMENT_ID: documentId, RAW_JSON: raw }); throw new Error('AI ส่ง JSON ไม่ถูกต้อง ระบบเก็บข้อความไว้ใน RAW_JSON แล้ว'); }
  knowledgeArray_(data.scenes).forEach(function (scene, index) {
    var sceneType = knowledgeAllowed_(knowledgeText_(scene.scene_type), KNOWLEDGE.status.scene, 'REAL_SCREEN');
    knowledgeAppend_(KNOWLEDGE.sheets.scenes, {
      SCENE_ID: documentId + '-SC-' + knowledgePad_(index + 1, 2), SOURCE_DOCUMENT_ID: documentId,
      TIMECODE: knowledgeText_(scene.timecode), NARRATION: knowledgeText_(scene.narration), SCENE_TYPE: sceneType,
      TOOL: knowledgeText_(scene.tool), REQUIRED_CONTENT: knowledgeText_(scene.required_content), SCENE_PROMPT: knowledgeText_(scene.scene_prompt),
      SOURCE_ASSET: knowledgeText_(scene.source_asset), HUMAN_CHECKPOINT: knowledgeText_(scene.human_checkpoint),
      CAPCUT_NOTES: knowledgeText_(scene.capcut_notes), RAW_JSON: raw
    });
  });
  knowledgeAudit_('CREATE_SCENE_PLAN', 'SUCCESS', documentId + ': ' + knowledgeArray_(data.scenes).length + ' ฉาก');
  knowledgeNotify_('สร้างแผนฉากแล้ว', 'ตรวจ SCENE_PLAN และตัดต่อขั้นสุดท้ายด้วยมนุษย์ใน CapCut');
}

function recordKnowledgeOrder() {
  try {
    createKnowledgeSheets_(false);
    var fullName = knowledgeAsk_('บันทึกคำสั่งซื้อ', 'ชื่อผู้ซื้อ');
    if (!fullName) return;
    var email = knowledgeAsk_('บันทึกคำสั่งซื้อ', 'อีเมลผู้ซื้อ');
    if (!email) return;
    var product = knowledgeAsk_('บันทึกคำสั่งซื้อ', 'ชื่อผลิตภัณฑ์ (เว้นว่างเพื่อใช้ค่ามาตรฐาน)') || knowledgeConfig_('DEFAULT_PRODUCT_NAME', 'ชุดความรู้เชิงปฏิบัติ');
    var paid = knowledgeConfirm_('ยืนยันการชำระเงิน', 'ตรวจสอบยอดเงินจริงแล้วหรือไม่? เลือก “ใช่” เฉพาะเมื่อยืนยันแล้ว');
    var orderId = recordKnowledgeOrder_(fullName, email, product, paid);
    knowledgeNotify_('บันทึกคำสั่งซื้อแล้ว', 'ORDER_ID: ' + orderId + (paid ? '\nสถานะ: PAID' : '\nสถานะ: NEW'));
  } catch (error) { knowledgeFail_('บันทึกคำสั่งซื้อไม่สำเร็จ', error); }
}

function recordKnowledgeOrder_(fullName, email, product, paid) {
  var valid = knowledgeValidEmail_(email);
  var orderId = knowledgeNextId_('TH-KP', KNOWLEDGE.sheets.orders, 'ORDER_ID');
  knowledgeAppend_(KNOWLEDGE.sheets.orders, {
    ORDER_ID: orderId, FULL_NAME: fullName, EMAIL: email, PRODUCT: product,
    PRICE: knowledgeNumberConfig_('DEFAULT_PRICE', 2990), PAID_AT: paid ? new Date() : '', STATUS: paid ? 'PAID' : 'NEW',
    MILESTONE_1_COMPLETE: 'NO', SYSTEM_NOTES: valid ? '' : 'อีเมลไม่ถูกต้อง: ห้ามให้สิทธิ์จนกว่าจะแก้ไข'
  });
  knowledgeAudit_('RECORD_ORDER', valid ? 'SUCCESS' : 'WARNING', orderId);
  return orderId;
}

function grantKnowledgeAccess() { knowledgeRunOrderPrompt_('ให้สิทธิ์เอกสาร', 'grantKnowledgeAccess_'); }

function grantKnowledgeAccess_(orderId) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.orders, 'ORDER_ID', orderId);
  if (!found) throw new Error('ไม่พบ ORDER_ID: ' + orderId);
  var order = found.object;
  if (order.STATUS !== 'PAID') throw new Error('ให้สิทธิ์ได้เฉพาะคำสั่งซื้อที่มี STATUS = PAID');
  if (!knowledgeValidEmail_(order.EMAIL)) throw new Error('อีเมลไม่ถูกต้อง กรุณาแก้ไขก่อนให้สิทธิ์');
  var folderId = knowledgeConfig_('PUBLISHED_FOLDER_ID', '');
  if (!folderId) throw new Error('ยังไม่มีโฟลเดอร์ 05_PUBLISHED กรุณาสร้างโครงสร้าง Drive ก่อน');
  var folder = DriveApp.getFolderById(folderId);
  folder.addViewer(order.EMAIL);
  knowledgeWrite_(found.table, found.rowNumber, { STATUS: 'ACCESS_GRANTED', ACCESS_GRANTED_AT: new Date(), DOCUMENT_LINK: folder.getUrl(), SYSTEM_NOTES: '' });
  knowledgeAudit_('GRANT_ACCESS', 'SUCCESS', orderId + ' -> ' + order.EMAIL);
  return 'เปิดสิทธิ์เอกสารแล้ว';
}

function sendKnowledgeWelcome() { knowledgeRunOrderPrompt_('ส่งอีเมลต้อนรับ', 'sendKnowledgeWelcome_'); }

function sendKnowledgeWelcome_(orderId) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.orders, 'ORDER_ID', orderId);
  if (!found) throw new Error('ไม่พบ ORDER_ID: ' + orderId);
  var order = found.object;
  if (order.STATUS !== 'ACCESS_GRANTED' && order.STATUS !== 'IN_PROGRESS') throw new Error('ต้องให้สิทธิ์ก่อนส่งอีเมลต้อนรับ');
  if (order.WELCOME_SENT_AT) return 'เคยส่งอีเมลต้อนรับแล้ว ระบบจึงไม่ส่งซ้ำ';
  knowledgeSendTemplate_(order, 'WELCOME_SUBJECT', 'WELCOME_BODY');
  knowledgeWrite_(found.table, found.rowNumber, { WELCOME_SENT_AT: new Date(), STATUS: 'IN_PROGRESS' });
  knowledgeAudit_('SEND_WELCOME', 'SUCCESS', orderId);
  return 'ส่งอีเมลต้อนรับแล้ว';
}

function sendKnowledgeDay3Reminder() { knowledgeRunReminderBatch_(3); }
function sendKnowledgeDay7Reminder() { knowledgeRunReminderBatch_(7); }

function knowledgeRunReminderBatch_(day) {
  try {
    createKnowledgeSheets_(false);
    var table = knowledgeRead_(KNOWLEDGE.sheets.orders);
    var limit = Math.min(20, knowledgeNumberConfig_('EMAIL_LIMIT_PER_RUN', 20));
    var sent = 0;
    table.rows.forEach(function (row) {
      if (sent >= limit) return;
      var order = knowledgeRowObject_(table.headers, row);
      if (order.STATUS !== 'IN_PROGRESS' || order.MILESTONE_1_COMPLETE === 'YES') return;
      var accessDate = knowledgeDate_(order.ACCESS_GRANTED_AT);
      var sentField = day === 3 ? 'REMINDER_DAY_3' : 'REMINDER_DAY_7';
      if (!accessDate || order[sentField] || knowledgeDaysBetween_(accessDate, new Date()) < day) return;
      knowledgeSendReminder_(order.ORDER_ID, day);
      sent++;
    });
    knowledgeNotify_('ส่งข้อความเตือนแล้ว', 'ส่ง ' + sent + ' อีเมลสำหรับวันที่ ' + day + ' และไม่ส่งซ้ำรายการเดิม');
  } catch (error) { knowledgeFail_('ส่งข้อความเตือนไม่สำเร็จ', error); }
}

function knowledgeSendReminder_(orderId, day) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.orders, 'ORDER_ID', orderId);
  if (!found) throw new Error('ไม่พบ ORDER_ID: ' + orderId);
  var order = found.object;
  var field = day === 3 ? 'REMINDER_DAY_3' : 'REMINDER_DAY_7';
  if (order[field]) return 'เคยส่งข้อความเตือนแล้ว';
  if (order.STATUS !== 'IN_PROGRESS' || order.MILESTONE_1_COMPLETE === 'YES') throw new Error('คำสั่งซื้อนี้ยังไม่ถึงเงื่อนไขการเตือน');
  var accessDate = knowledgeDate_(order.ACCESS_GRANTED_AT);
  if (!accessDate || knowledgeDaysBetween_(accessDate, new Date()) < day) throw new Error('ยังไม่ถึงวันที่ ' + day + ' หลังเปิดสิทธิ์');
  knowledgeSendTemplate_(order, day === 3 ? 'REMINDER_DAY_3_SUBJECT' : 'REMINDER_DAY_7_SUBJECT', day === 3 ? 'REMINDER_DAY_3_BODY' : 'REMINDER_DAY_7_BODY');
  var values = {}; values[field] = new Date();
  knowledgeWrite_(found.table, found.rowNumber, values);
  knowledgeAudit_('REMINDER_DAY_' + day, 'SUCCESS', orderId);
  return 'ส่งข้อความเตือนวันที่ ' + day + ' แล้ว';
}

function processKnowledgeSupportMail() {
  try {
    createKnowledgeSheets_(false);
    var inputName = knowledgeConfig_('SUPPORT_LABEL', 'SOLOSIX_M3_SUPPORT');
    var doneName = knowledgeConfig_('SUPPORT_DONE_LABEL', 'SOLOSIX_M3_PROCESSED');
    var inputLabel = GmailApp.getUserLabelByName(inputName) || GmailApp.createLabel(inputName);
    var doneLabel = GmailApp.getUserLabelByName(doneName) || GmailApp.createLabel(doneName);
    var existing = knowledgeExistingValues_(KNOWLEDGE.sheets.support, 'MAIL_ID');
    var threads = inputLabel.getThreads(0, 20);
    var processed = 0;
    threads.forEach(function (thread) {
      if (processed >= 20) return;
      var messages = thread.getMessages();
      var message = messages[messages.length - 1];
      if (existing[message.getId()]) { thread.addLabel(doneLabel); return; }
      var sender = knowledgeEmailFrom_(message.getFrom());
      var excerpt = knowledgeText_(message.getPlainBody()).slice(0, 3000);
      var safe = knowledgeRedact_(excerpt);
      var raw = knowledgeCallOpenAI_('คุณคัดแยกงานสนับสนุน แต่ไม่ตอบลูกค้าและไม่รับปากแทนผู้ขาย', knowledgePrompt_('PROMPT_SUPPORT_CLASSIFICATION') + '\nหัวข้อ: ' + knowledgeRedact_(message.getSubject()) + '\nข้อความ: ' + safe);
      var data = knowledgeParseJson_(raw);
      var group = data ? knowledgeAllowed_(data.ai_group, KNOWLEDGE.status.support, 'OUT_OF_SCOPE') : '';
      var orderId = knowledgeFindOrderByEmail_(sender);
      knowledgeAppend_(KNOWLEDGE.sheets.support, {
        MAIL_ID: message.getId(), RECEIVED_AT: message.getDate(), SENDER_EMAIL: sender, SUBJECT: message.getSubject(),
        EXCERPT: excerpt, AI_GROUP: group, CLASSIFICATION_REASON: data ? knowledgeText_(data.classification_reason) : '',
        SUGGESTED_ACTION: data ? knowledgeText_(data.suggested_action) : '', RELATED_ORDER_ID: orderId,
        PROCESSED: data ? 'YES' : 'NO', RAW_JSON: raw
      });
      thread.addLabel(doneLabel);
      processed++;
    });
    knowledgeAudit_('PROCESS_SUPPORT_MAIL', 'SUCCESS', 'บันทึก ' + processed + ' เธรด');
    knowledgeNotify_('จัดหมวดหมู่อีเมลแล้ว', 'บันทึก ' + processed + ' เธรด AI เสนอแนวทางเท่านั้น ผู้ดูแลต้องตอบด้วยตนเอง');
  } catch (error) { knowledgeFail_('อ่านอีเมลสนับสนุนไม่สำเร็จ', error); }
}

function markKnowledgeCompleted() { knowledgeRunOrderPrompt_('บันทึกการเรียนจบ', 'markKnowledgeCompleted_'); }

function markKnowledgeCompleted_(orderIdOrEmail) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.orders, 'ORDER_ID', orderIdOrEmail) || knowledgeFind_(KNOWLEDGE.sheets.orders, 'EMAIL', orderIdOrEmail);
  if (!found) throw new Error('ไม่พบคำสั่งซื้อจาก ORDER_ID หรืออีเมลนี้');
  if (['ACCESS_GRANTED', 'IN_PROGRESS'].indexOf(found.object.STATUS) < 0) throw new Error('บันทึกการเรียนจบได้เฉพาะสถานะ ACCESS_GRANTED หรือ IN_PROGRESS');
  knowledgeWrite_(found.table, found.rowNumber, { STATUS: 'COMPLETED', COMPLETED_AT: new Date(), MILESTONE_1_COMPLETE: 'YES' });
  knowledgeAudit_('MARK_COMPLETED', 'SUCCESS', found.object.ORDER_ID);
  return 'บันทึก COMPLETED แล้ว กรุณาเชิญผู้เรียนกรอก FEEDBACK_FORM_URL';
}

function reviewKnowledgeFeedback() {
  try {
    createKnowledgeSheets_(false);
    var documents = knowledgeRead_(KNOWLEDGE.sheets.documents);
    var realDocumentIds = documents.rows.map(function (row) { return knowledgeCell_(row, documents.map, 'DOCUMENT_ID'); }).filter(String);
    var table = knowledgeRead_(KNOWLEDGE.sheets.feedback);
    var processed = 0;
    table.rows.forEach(function (row, index) {
      var original = knowledgeCell_(row, table.map, 'ORIGINAL_TEXT');
      if (!original || knowledgeCell_(row, table.map, 'AI_GROUP')) return;
      var raw = knowledgeCallOpenAI_('คุณวิเคราะห์ฟีดแบ็กเพื่อช่วยมนุษย์ตัดสินใจ ห้ามแก้ DECISION หรือ TARGET_VERSION', knowledgePrompt_('PROMPT_FEEDBACK_REVIEW') + '\nDOCUMENT_ID ที่มีจริง: ' + JSON.stringify(realDocumentIds) + '\nข้อความที่ลบข้อมูลส่วนบุคคลแล้ว: ' + knowledgeRedact_(original));
      var data = knowledgeParseJson_(raw);
      if (!data) { knowledgeWrite_(table, index + 2, { RAW_JSON: raw, NEEDS_HUMAN: 'YES' }); return; }
      var group = knowledgeAllowed_(data.ai_group, KNOWLEDGE.status.feedback, 'OUT_OF_SCOPE');
      var related = realDocumentIds.indexOf(knowledgeText_(data.related_document)) >= 0 ? knowledgeText_(data.related_document) : '';
      var needsHuman = ['UNCLEAR_GUIDANCE', 'OUT_OF_SCOPE', 'FUTURE_RELEASE'].indexOf(group) >= 0 ? 'YES' : 'NO';
      knowledgeWrite_(table, index + 2, { AI_GROUP: group, RELATED_DOCUMENT: related, NEEDS_HUMAN: needsHuman, RAW_JSON: raw });
      processed++;
    });
    knowledgeAudit_('REVIEW_FEEDBACK', 'SUCCESS', 'ประมวลผล ' + processed + ' แถว');
    knowledgeNotify_('วิเคราะห์ฟีดแบ็กแล้ว', 'ประมวลผล ' + processed + ' แถว ผู้ขายต้องกรอก DECISION และ TARGET_VERSION ด้วยตนเอง');
  } catch (error) { knowledgeFail_('วิเคราะห์ฟีดแบ็กไม่สำเร็จ', error); }
}

function testKnowledgeOpenAI() {
  try {
    createKnowledgeSheets_(false);
    var reply = knowledgeCallOpenAI_('ตอบสั้นและเป็นภาษาไทย', 'ตอบว่า “การเชื่อมต่อพร้อมใช้งาน” เท่านั้น');
    knowledgeAudit_('TEST_OPENAI', 'SUCCESS', 'MODEL=' + knowledgeConfig_('MODEL', KNOWLEDGE.defaultModel) + ', TOKEN_PARAMETER=' + knowledgeConfig_('TOKEN_PARAMETER', 'max_completion_tokens'));
    knowledgeNotify_('เชื่อมต่อ OpenAI สำเร็จ', reply);
  } catch (error) { knowledgeFail_('ตรวจสอบ API ไม่สำเร็จ', error); }
}

function knowledgeCallOpenAI_(systemPrompt, userPrompt) {
  var key = PropertiesService.getScriptProperties().getProperty(KNOWLEDGE.property.apiKey);
  if (!key) throw new Error('ยังไม่มี OPENAI_API_KEY ใน Script Properties');
  var model = knowledgeConfig_('MODEL', KNOWLEDGE.defaultModel);
  var tokenParameter = knowledgeConfig_('TOKEN_PARAMETER', 'max_completion_tokens');
  var maxTokens = Math.max(4000, knowledgeNumberConfig_('MAX_TOKENS', 5000));
  var payload = { model: model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] };
  payload[tokenParameter] = maxTokens;
  var response = knowledgeFetchOpenAI_(key, payload);
  if (response.code === 400 && response.body.indexOf(tokenParameter) >= 0) {
    delete payload[tokenParameter];
    tokenParameter = tokenParameter === 'max_tokens' ? 'max_completion_tokens' : 'max_tokens';
    payload[tokenParameter] = maxTokens;
    response = knowledgeFetchOpenAI_(key, payload);
    if (response.code >= 200 && response.code < 300) knowledgeSetConfig_('TOKEN_PARAMETER', tokenParameter, 'ระบบเลือกพารามิเตอร์ที่โมเดลรองรับ');
  }
  if (response.code < 200 || response.code >= 300) throw new Error(knowledgeApiError_(response.code, response.body));
  var parsed;
  try { parsed = JSON.parse(response.body); }
  catch (error) { throw new Error('OpenAI ส่งข้อมูลที่อ่านไม่ได้: ' + response.body); }
  if (!parsed.choices || !parsed.choices.length) throw new Error('OpenAI ไม่ส่งคำตอบ: ' + response.body);
  return knowledgeText_(parsed.choices[0].message.content);
}

function knowledgeFetchOpenAI_(key, payload) {
  var response = UrlFetchApp.fetch(KNOWLEDGE.apiUrl, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + key }, payload: JSON.stringify(payload)
  });
  return { code: response.getResponseCode(), body: response.getContentText() };
}

function knowledgeApiError_(code, body) {
  var meaning = 'เกิดข้อผิดพลาดจาก API';
  if (code === 401) meaning = 'คีย์ API ไม่ถูกต้องหรือหมดอายุ';
  if (code === 429) meaning = 'เกินโควตาหรือเรียกถี่เกินไป';
  if (code === 404) meaning = 'ชื่อโมเดลไม่ถูกต้องหรือบัญชีไม่มีสิทธิ์ใช้';
  if (code === 400) meaning = 'โครงสร้างคำขอหรือพารามิเตอร์ไม่ถูกต้อง';
  return 'HTTP ' + code + ' — ' + meaning + '\nคำตอบเดิม: ' + body;
}

function knowledgeParseJson_(text) {
  var cleaned = knowledgeText_(text).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch (firstError) {}
  var objectStart = cleaned.indexOf('{');
  var objectEnd = cleaned.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) {
    try { return JSON.parse(cleaned.slice(objectStart, objectEnd + 1)); } catch (secondError) {}
  }
  return null;
}

function knowledgeEnsureSheet_(name, headers) {
  var ss = knowledgeSpreadsheet_();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var lastColumn = sheet.getLastColumn();
  var existing = lastColumn ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(knowledgeText_) : [];
  headers.forEach(function (header) {
    if (existing.indexOf(header) < 0) { existing.push(header); sheet.getRange(1, existing.length).setValue(header); }
  });
  if (existing.length) {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, existing.length).setBackground('#7f1734').setFontColor('#ffffff').setFontWeight('bold').setWrap(true);
    sheet.autoResizeColumns(1, existing.length);
  }
  return sheet;
}

function knowledgeSeedConfig_() {
  var existing = knowledgeExistingValues_(KNOWLEDGE.sheets.config, 'KEY');
  KNOWLEDGE_DEFAULT_CONFIG.forEach(function (row) {
    if (!existing[row[0]]) knowledgeSheet_(KNOWLEDGE.sheets.config).appendRow(row);
  });
}

function knowledgeApplyValidations_() {
  knowledgeValidation_(KNOWLEDGE.sheets.orders, 'STATUS', KNOWLEDGE.status.order);
  knowledgeValidation_(KNOWLEDGE.sheets.orders, 'MILESTONE_1_COMPLETE', KNOWLEDGE.status.yesNo);
  knowledgeValidation_(KNOWLEDGE.sheets.documents, 'STATUS', KNOWLEDGE.status.document);
  knowledgeValidation_(KNOWLEDGE.sheets.map, 'SOURCE_STATUS', KNOWLEDGE.status.source);
  knowledgeValidation_(KNOWLEDGE.sheets.support, 'AI_GROUP', KNOWLEDGE.status.support);
  knowledgeValidation_(KNOWLEDGE.sheets.support, 'PROCESSED', KNOWLEDGE.status.yesNo);
  knowledgeValidation_(KNOWLEDGE.sheets.feedback, 'AI_GROUP', KNOWLEDGE.status.feedback);
  knowledgeValidation_(KNOWLEDGE.sheets.feedback, 'NEEDS_HUMAN', KNOWLEDGE.status.yesNo);
  knowledgeValidation_(KNOWLEDGE.sheets.scenes, 'SCENE_TYPE', KNOWLEDGE.status.scene);
  knowledgeValidation_(KNOWLEDGE.sheets.aiTests, 'CORRECT', KNOWLEDGE.status.correct);
}

function knowledgeValidation_(sheetName, header, values) {
  var sheet = knowledgeSheet_(sheetName);
  var map = knowledgeHeaderMap_(sheet);
  if (map[header] === undefined) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, map[header] + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function knowledgeRead_(sheetName) {
  var sheet = knowledgeSheet_(sheetName);
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(knowledgeText_);
  var lastRow = sheet.getLastRow();
  var rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues() : [];
  return { sheet: sheet, headers: headers, map: knowledgeMapHeaders_(headers), rows: rows };
}

function knowledgeAppend_(sheetName, values) {
  var sheet = knowledgeSheet_(sheetName);
  var headers = knowledgeHeaders_(sheet);
  sheet.appendRow(headers.map(function (header) { return values[header] === undefined ? '' : values[header]; }));
  return sheet.getLastRow();
}

function knowledgeWrite_(table, rowNumber, values) {
  var protectedColumns = { HUMAN_APPROVAL: true, DECISION: true, TARGET_VERSION: true };
  Object.keys(values).forEach(function (header) {
    if (protectedColumns[header]) throw new Error('คอลัมน์ ' + header + ' ให้มนุษย์กรอกเท่านั้น');
    if (table.map[header] === undefined) throw new Error('ไม่พบคอลัมน์ ' + header);
    table.sheet.getRange(rowNumber, table.map[header] + 1).setValue(values[header]);
  });
}

function knowledgeUpsert_(sheetName, keyHeader, keyValue, values) {
  var found = knowledgeFind_(sheetName, keyHeader, keyValue);
  if (found) { knowledgeWrite_(found.table, found.rowNumber, values); return found.rowNumber; }
  return knowledgeAppend_(sheetName, values);
}

function knowledgeFind_(sheetName, keyHeader, keyValue) {
  var table = knowledgeRead_(sheetName);
  var normalized = knowledgeText_(keyValue).toLowerCase();
  for (var i = 0; i < table.rows.length; i++) {
    if (knowledgeText_(knowledgeCell_(table.rows[i], table.map, keyHeader)).toLowerCase() === normalized) {
      return { table: table, row: table.rows[i], rowNumber: i + 2, object: knowledgeRowObject_(table.headers, table.rows[i]) };
    }
  }
  return null;
}

function knowledgeHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(knowledgeText_);
}

function knowledgeHeaderMap_(sheet) { return knowledgeMapHeaders_(knowledgeHeaders_(sheet)); }

function knowledgeMapHeaders_(headers) {
  var map = {};
  headers.forEach(function (header, index) { if (header) map[header] = index; });
  return map;
}

function knowledgeCell_(row, map, header) { return map[header] === undefined ? '' : row[map[header]]; }

function knowledgeRowObject_(headers, row) {
  var result = {};
  headers.forEach(function (header, index) { if (header) result[header] = row[index]; });
  return result;
}

function knowledgeExistingValues_(sheetName, header) {
  var table = knowledgeRead_(sheetName);
  var result = {};
  table.rows.forEach(function (row) { var value = knowledgeText_(knowledgeCell_(row, table.map, header)); if (value) result[value] = true; });
  return result;
}

function knowledgeConfig_(key, fallback) {
  var found = knowledgeFind_(KNOWLEDGE.sheets.config, 'KEY', key);
  if (!found) return fallback;
  var value = knowledgeText_(found.object.VALUE);
  return value === '' ? fallback : value;
}

function knowledgeNumberConfig_(key, fallback) {
  var value = Number(knowledgeConfig_(key, fallback));
  return isNaN(value) ? fallback : value;
}

function knowledgeSetConfig_(key, value, description) {
  knowledgeUpsert_(KNOWLEDGE.sheets.config, 'KEY', key, { KEY: key, VALUE: value, DESCRIPTION: description || '' });
}

function knowledgePrompt_(key) {
  var prompt = knowledgeConfig_(key, '');
  if (!prompt) throw new Error('ไม่พบพรอมต์ ' + key + ' ใน CONFIG');
  return prompt;
}

function knowledgeSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var id = PropertiesService.getScriptProperties().getProperty(KNOWLEDGE.property.spreadsheetId);
  if (!id) throw new Error('ไม่พบสเปรดชีตหลัก ให้เปิด Apps Script จาก Google Sheets แล้วรัน createKnowledgeSheets หนึ่งครั้ง');
  return SpreadsheetApp.openById(id);
}

function knowledgeSheet_(name) {
  var sheet = knowledgeSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบชีต ' + name + ' กรุณารัน createKnowledgeSheets ก่อน');
  return sheet;
}

function knowledgeGetOrCreateFolder_(parent, name) {
  var folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function knowledgeMoveFile_(fileId, folder) {
  var file = DriveApp.getFileById(fileId);
  folder.addFile(file);
  try { DriveApp.getRootFolder().removeFile(file); } catch (ignoreRoot) {}
}

function knowledgeNextId_(prefix, sheetName, header) {
  var table = knowledgeRead_(sheetName);
  var max = 0;
  table.rows.forEach(function (row) {
    var match = knowledgeText_(knowledgeCell_(row, table.map, header)).match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]) || 0);
  });
  return prefix + '-' + Utilities.formatDate(new Date(), KNOWLEDGE.timeZone, 'yyyyMMdd') + '-' + knowledgePad_(max + 1, 3);
}

function knowledgeRunOrderPrompt_(title, handlerName) {
  try {
    createKnowledgeSheets_(false);
    var key = knowledgeAsk_(title, 'กรอก ORDER_ID หรืออีเมลตามที่ขั้นตอนรองรับ');
    if (!key) return;
    var handlers = {
      grantKnowledgeAccess_: grantKnowledgeAccess_, sendKnowledgeWelcome_: sendKnowledgeWelcome_, markKnowledgeCompleted_: markKnowledgeCompleted_
    };
    if (!handlers[handlerName]) throw new Error('ไม่อนุญาตการดำเนินการนี้');
    knowledgeNotify_(title + 'เรียบร้อย', handlers[handlerName](key));
  } catch (error) { knowledgeFail_(title + 'ไม่สำเร็จ', error); }
}

function knowledgeSendTemplate_(order, subjectKey, bodyKey) {
  if (!knowledgeValidEmail_(order.EMAIL)) throw new Error('อีเมลผู้ซื้อไม่ถูกต้อง');
  var subject = knowledgeTemplate_(knowledgeConfig_(subjectKey, ''), order);
  var body = knowledgeTemplate_(knowledgeConfig_(bodyKey, ''), order);
  if (!subject || !body) throw new Error('แม่แบบอีเมลใน CONFIG ยังไม่ครบ');
  GmailApp.sendEmail(order.EMAIL, subject, body, { name: 'WEUP SoloSix' });
}

function knowledgeTemplate_(template, order) {
  var values = {
    FULL_NAME: order.FULL_NAME, PRODUCT: order.PRODUCT, ORDER_ID: order.ORDER_ID,
    DOCUMENT_LINK: order.DOCUMENT_LINK, FEEDBACK_FORM_URL: knowledgeConfig_('FEEDBACK_FORM_URL', '')
  };
  return Object.keys(values).reduce(function (text, key) {
    return text.split('{{' + key + '}}').join(knowledgeText_(values[key]));
  }, knowledgeText_(template));
}

function knowledgeFindOrderByEmail_(email) {
  var table = knowledgeRead_(KNOWLEDGE.sheets.orders);
  var normalized = knowledgeText_(email).toLowerCase();
  for (var i = table.rows.length - 1; i >= 0; i--) {
    if (knowledgeText_(knowledgeCell_(table.rows[i], table.map, 'EMAIL')).toLowerCase() === normalized) return knowledgeText_(knowledgeCell_(table.rows[i], table.map, 'ORDER_ID'));
  }
  return '';
}

function knowledgeInstallationGaps_() {
  var gaps = [];
  Object.keys(KNOWLEDGE_HEADERS).forEach(function (name) { if (!knowledgeSpreadsheet_().getSheetByName(name)) gaps.push('ชีต ' + name); });
  ['ROOT_FOLDER_ID', 'PUBLISHED_FOLDER_ID', 'INTERVIEW_FORM_URL', 'FEEDBACK_FORM_URL', 'TEST_USER_FORM_URL'].forEach(function (key) { if (!knowledgeConfig_(key, '')) gaps.push(key); });
  var hasTrigger = ScriptApp.getProjectTriggers().some(function (trigger) { return trigger.getHandlerFunction() === 'onKnowledgeFormSubmit'; });
  if (!hasTrigger) gaps.push('ทริกเกอร์แบบฟอร์ม');
  return gaps;
}

function knowledgeAudit_(step, result, details) {
  var sheet = knowledgeSpreadsheet_().getSheetByName(KNOWLEDGE.sheets.audit);
  if (!sheet) return;
  sheet.appendRow([new Date(), step, result, knowledgeText_(details).slice(0, 5000)]);
}

function knowledgeNamed_(named, title) {
  var value = named[title];
  return value && value.length ? knowledgeText_(value[0]) : '';
}

function knowledgeEmailFrom_(value) {
  var match = knowledgeText_(value).match(/<([^>]+)>/);
  return (match ? match[1] : knowledgeText_(value)).trim().toLowerCase();
}

function knowledgeRedact_(value) {
  return knowledgeText_(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL_REMOVED]')
    .replace(/(?:\+?66|0)[\s-]?\d(?:[\s-]?\d){7,9}/g, '[PHONE_REMOVED]')
    .replace(/\b\d{13}\b/g, '[ID_REMOVED]');
}

function knowledgeIdFromUrl_(url) {
  var match = knowledgeText_(url).match(/[-\w]{25,}/);
  return match ? match[0] : '';
}

function knowledgeDate_(value) {
  if (!value) return null;
  var date = Object.prototype.toString.call(value) === '[object Date]' ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function knowledgeDaysBetween_(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function knowledgeIsApproved_(value) {
  return ['YES', 'APPROVED', 'อนุมัติ', 'ผ่าน'].indexOf(knowledgeText_(value).toUpperCase()) >= 0 || knowledgeText_(value) === 'อนุมัติ';
}

function knowledgeAllowed_(value, allowed, fallback) {
  var normalized = knowledgeText_(value).toUpperCase();
  return allowed.indexOf(normalized) >= 0 ? normalized : fallback;
}

function knowledgeValidEmail_(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(knowledgeText_(email)); }

function knowledgeArray_(value) { return Object.prototype.toString.call(value) === '[object Array]' ? value : []; }

function knowledgeText_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Array]') return value.map(knowledgeText_).join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim();
}

function knowledgePad_(value, length) {
  var text = String(value);
  while (text.length < length) text = '0' + text;
  return text;
}

function knowledgeAsk_(title, message) {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(title, message, ui.ButtonSet.OK_CANCEL);
  return response.getSelectedButton() === ui.Button.OK ? response.getResponseText().trim() : '';
}

function knowledgeConfirm_(title, message) {
  var ui = SpreadsheetApp.getUi();
  return ui.alert(title, message, ui.ButtonSet.YES_NO) === ui.Button.YES;
}

function knowledgeNotify_(title, message) {
  try { SpreadsheetApp.getUi().alert(title, knowledgeText_(message), SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (noUi) { console.log(title + ': ' + knowledgeText_(message)); }
}

function knowledgeFail_(title, error) {
  var message = error && error.message ? error.message : knowledgeText_(error);
  knowledgeAudit_(title, 'ERROR', message);
  knowledgeNotify_(title, message);
}

