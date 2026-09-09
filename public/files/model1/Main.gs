/**
 * WEUP SoloSix — โมเดล 1
 * ระบบให้คำปรึกษาด้านโภชนาการ 28 วันสำหรับผู้ประกอบการคนเดียวในประเทศไทย
 *
 * วิธีติดตั้ง
 * 1) วางไฟล์นี้ใน Code.gs หรือ Main.gs ของโปรเจ็กต์ Apps Script ที่ผูกกับ Google Sheets
 * 2) เพิ่ม Script Property ชื่อ OPENAI_API_KEY และใส่ API key เป็นค่า
 * 3) จะเพิ่ม OPENAI_MODEL ก็ได้ ถ้าไม่เพิ่มระบบใช้ gpt-4.1-mini
 * 4) จะเพิ่ม CONSULTANT_EMAIL เพื่อรับการแจ้งเตือนเมื่อมีลูกค้าใหม่ก็ได้
 * 5) เรียกใช้ setupSystem หนึ่งครั้ง แล้วโหลด Google Sheets ใหม่
 *
 * ระบบไม่ลบชีตหรือข้อมูลเดิม และไม่ส่งชื่อ อีเมล หรือเบอร์โทรศัพท์ไปยัง AI
 */

var SOLO = {
  timeZone: 'Asia/Bangkok',
  locale: 'th_TH',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'gpt-4.1-mini',
  maxRowsPerRun: 3,
  sheets: {
    clients: 'ลูกค้า',
    drafts: 'AI_ร่างแผน',
    finals: 'แผนฉบับสุดท้าย',
    replies: 'อีเมลตอบกลับ',
    settings: 'การตั้งค่า'
  },
  properties: {
    apiKey: 'OPENAI_API_KEY',
    model: 'OPENAI_MODEL',
    consultantEmail: 'CONSULTANT_EMAIL',
    dashboardUrl: 'LINK_DASHBOARD',
    formId: 'SOLOSIX_FORM_ID',
    clientCounter: 'SOLOSIX_CLIENT_COUNTER'
  },
  status: {
    newClient: 'โปรไฟล์ใหม่',
    waitingReview: 'รอตรวจสอบ',
    needsChanges: 'ต้องแก้ไข',
    agreed: 'ตกลง',
    waitingFinal: 'รออนุมัติขั้นสุดท้าย',
    approvedToSend: 'อนุมัติให้ส่ง',
    sent: 'ส่งแล้ว'
  },
  promptCodes: {
    draft: 'PROMPT_DRAFT',
    revise: 'PROMPT_REVISE',
    final: 'PROMPT_FINAL',
    reply: 'PROMPT_REPLY'
  }
};

var SOLO_HEADERS = {
  drafts: [
    'รหัสลูกค้า', 'สร้างเมื่อ', 'ธงคัดกรองสุขภาพ', 'สรุปสถานการณ์',
    'ข้อมูลที่ยังขาด', 'คำถามสำหรับพูดคุย', 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ',
    'ร่างแผน 4 สัปดาห์', 'JSON ร่างแผน', 'สถานะตรวจสอบรอบแรก',
    'ข้อเสนอแนะ', 'จำนวนครั้งที่แก้ไข', 'รายการที่แก้ไข', 'แก้ไขล่าสุด',
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด'
  ],
  finals: [
    'รหัสลูกค้า', 'ย้ายเมื่อ', 'ชื่อ-นามสกุล', 'อีเมล', 'สรุปสถานการณ์',
    'เนื้อหาแผนสำหรับลูกค้า', 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ',
    'สถานะอนุมัติขั้นสุดท้าย', 'หัวข้ออีเมล', 'ส่งเมื่อ', 'บันทึกการส่ง',
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด'
  ],
  replies: [
    'รหัสลูกค้า', 'อ่านเมื่อ', 'วันที่อีเมล', 'สิ่งที่ลูกค้าทำได้', 'อุปสรรค',
    'คำถามของลูกค้า', 'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ',
    'รหัสอีเมล', 'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด'
  ],
  settings: ['รหัสพรอมต์', 'ชื่อพรอมต์', 'เนื้อหาพรอมต์', 'เวอร์ชัน', 'อัปเดตเมื่อ']
};

var SOLO_COMMON_RULES =
  'กติกาวิชาชีพที่ต้องปฏิบัติตาม:\n' +
  '1. ห้ามวินิจฉัยโรค ห้ามสั่งยา อาหารเสริม หรือระบุปริมาณสารอาหารเพื่อการรักษา\n' +
  '2. ห้ามเดาข้อมูลที่แบบฟอร์มไม่ได้ระบุ ให้บันทึกเป็นข้อมูลที่ยังขาด\n' +
  '3. คำแนะนำต้องเน้นพฤติกรรมที่ปลอดภัย เช่น เวลาอาหาร โครงสร้างมื้ออาหาร การเตรียมอาหาร และการติดตามตนเอง\n' +
  '4. ห้ามกำหนดแคลอรี น้ำหนักเป้าหมาย หรือสัญญาว่าจะรักษาโรค\n' +
  '5. หากพบการตั้งครรภ์ ให้นมบุตร โรคที่กำลังรักษา การใช้ยาตามแพทย์ หรือประวัติความผิดปกติด้านการกิน ให้หยุดคำแนะนำเฉพาะบุคคลและส่งต่อให้ผู้ให้คำปรึกษาตรวจสอบ\n' +
  '6. ใช้บริบทประเทศไทย: อาหารและวัตถุดิบที่หาได้จริง ร้านอาหารตามสั่ง ฟู้ดคอร์ท ตลาด และงบประมาณเป็นเงินบาท\n' +
  '7. เคารพข้อจำกัดด้านศาสนา อาหารฮาลาล มังสวิรัติ อาหารเจ การแพ้อาหาร และวิถีชีวิตของลูกค้า\n' +
  '8. เขียนภาษาไทยธรรมชาติ สุภาพ ชัดเจน และไม่ใช้ถ้อยคำโฆษณาเกินจริง\n';

var SOLO_PROMPTS = {};

SOLO_PROMPTS.draft =
  'คุณเป็นผู้ช่วยร่างงานให้ผู้ให้คำปรึกษาด้านโภชนาการในประเทศไทย โปรแกรม 28 วัน ผลลัพธ์ของคุณเป็นเพียงร่างที่มนุษย์ต้องตรวจสอบก่อนใช้\n\n' +
  SOLO_COMMON_RULES + '\n' +
  'ตอบเป็น JSON object ที่ถูกต้องเพียงหนึ่งชุด ห้ามใส่ markdown หรือคำอธิบายนอก JSON โดยใช้โครงสร้างนี้:\n' +
  '{\n' +
  '  "summary": "สรุปตามข้อมูลจริง 3-6 ประโยค",\n' +
  '  "missing_information": ["ข้อมูลที่ยังขาด"],\n' +
  '  "discussion_questions": ["คำถามที่ควรถามลูกค้า"],\n' +
  '  "consultant_review": ["ประเด็นที่มนุษย์ต้องตรวจสอบ"],\n' +
  '  "four_week_plan": [\n' +
  '    {"week": 1, "objective": "เป้าหมาย", "actions": ["สิ่งที่ทำ"], "frequency": "ความถี่", "tracking": "วิธีบันทึกผล"}\n' +
  '  ]\n' +
  '}\n' +
  'four_week_plan ต้องมี 4 รายการสำหรับสัปดาห์ที่ 1-4 ถ้ามีธงคัดกรองสุขภาพ ให้เว้นแผนและอธิบายสิ่งที่ต้องตรวจสอบใน consultant_review';

SOLO_PROMPTS.revise =
  'คุณเป็นผู้ช่วยแก้ร่างแผนโภชนาการตามข้อเสนอแนะของผู้ให้คำปรึกษา\n\n' +
  SOLO_COMMON_RULES + '\n' +
  'แก้เฉพาะส่วนที่ข้อเสนอแนะระบุ รักษาส่วนอื่นไว้ ไม่เพิ่มข้อเสนอใหม่ที่ไม่ได้ร้องขอ หากข้อเสนอขัดกับกติกาความปลอดภัยให้บันทึกเหตุผลใน consultant_review\n' +
  'ตอบเป็น JSON object เพียงหนึ่งชุดโดยคงโครงสร้างเดิม และเพิ่ม "changes": ["รายการที่แก้ไข"]';

SOLO_PROMPTS.final =
  'คุณเป็นผู้ช่วยเรียบเรียงร่างที่ผู้ให้คำปรึกษาอนุมัติแล้วให้เป็นข้อความภาษาไทยสำหรับส่งถึงลูกค้าในประเทศไทย\n\n' +
  SOLO_COMMON_RULES + '\n' +
  'ห้ามเพิ่มคำแนะนำใหม่ ห้ามนำบันทึกภายในหรือข้อมูลระบุตัวบุคคลไปใส่ในข้อความ\n' +
  'จัดลำดับเป็น: คำเกริ่นสั้น ๆ → จุดเริ่มต้น → แผนสัปดาห์ 1-4 → วิธีติดตามตนเอง → ข้อควรระวัง → เชิญให้ตอบกลับอีเมลเดิม\n' +
  'ระบุชัดว่านี่เป็นคำแนะนำด้านพฤติกรรมการกิน ไม่แทนการวินิจฉัยหรือรักษาทางการแพทย์\n' +
  'ตอบเป็น JSON object เพียงหนึ่งชุด: {"client_message":"ข้อความพร้อมขึ้นบรรทัดใหม่", "consultant_review":["จุดที่ควรตรวจอีกครั้ง"]}';

SOLO_PROMPTS.reply =
  'คุณเป็นผู้ช่วยสรุปอีเมลตอบกลับของลูกค้าในโปรแกรมโภชนาการ 28 วัน\n\n' +
  SOLO_COMMON_RULES + '\n' +
  'สรุปเฉพาะสิ่งที่ลูกค้าเขียน ห้ามตอบคำถาม ห้ามให้คำแนะนำ และตัดข้อความอ้างอิงอีเมลเก่า ลายเซ็น หรือโฆษณาท้ายอีเมลออก\n' +
  'ตอบเป็น JSON object เพียงหนึ่งชุด: {"completed":["สิ่งที่ทำได้"], "obstacles":["อุปสรรค"], "client_questions":["คำถาม"], "consultant_review":["ประเด็นสำคัญที่ต้องตรวจ"]}';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AI ที่ปรึกษา')
    .addItem('1. เตรียมระบบและชีต', 'setupSystem')
    .addItem('2. สร้างแบบฟอร์มรับข้อมูล', 'createIntakeForm')
    .addSeparator()
    .addItem('3. สร้างร่างจากแถวที่เลือก', 'generateSelectedDraft')
    .addItem('4. แก้ร่างที่มีสถานะ “ต้องแก้ไข”', 'reviseDraftsNeedingChanges')
    .addItem('5. ย้ายร่างที่ “ตกลง” ไปแผนฉบับสุดท้าย', 'moveApprovedDraftsToFinal')
    .addItem('6. ส่งแผนที่ “อนุมัติให้ส่ง”', 'sendApprovedPlans')
    .addItem('7. อ่านอีเมลตอบกลับใหม่', 'processUnreadReplies')
    .addSeparator()
    .addItem('8. ทดสอบ OpenAI API', 'testOpenAIConnection')
    .addItem('9. ติดตั้งทริกเกอร์', 'installTriggers')
    .addItem('เปิด Dashboard', 'openDashboard')
    .addToUi();
}

function setupSystem() {
  try {
    soloSetupSystem_();

    soloAlert_('เตรียมระบบเรียบร้อย',
      'สร้างหรือปรับโครงสร้างชีตสำหรับตลาดประเทศไทยแล้ว โดยไม่ลบข้อมูลเดิม\n\n' +
      'ขั้นตอนถัดไป: สร้างแบบฟอร์มรับข้อมูล และติดตั้งทริกเกอร์');
  } catch (error) {
    soloAlert_('เกิดข้อผิดพลาด', error.message);
    throw error;
  }
}

function createIntakeForm() {
  try {
    soloSetupSystem_();
    var ss = soloSpreadsheet_();
    var props = PropertiesService.getScriptProperties();
    var savedId = props.getProperty(SOLO.properties.formId);
    if (savedId) {
      try {
        var savedForm = FormApp.openById(savedId);
        soloAlert_('มีแบบฟอร์มอยู่แล้ว',
          'ลิงก์สำหรับลูกค้า:\n' + savedForm.getPublishedUrl() + '\n\n' +
          'ลิงก์แก้ไข:\n' + savedForm.getEditUrl());
        return;
      } catch (ignoreOldForm) {}
    }

    var clientSheet = ss.getSheetByName(SOLO.sheets.clients);
    if (clientSheet && clientSheet.getLastRow() > 1) {
      throw new Error('พบข้อมูลในชีต “' + SOLO.sheets.clients + '” อยู่แล้ว ระบบจึงไม่สร้างแบบฟอร์มใหม่เพื่อป้องกันข้อมูลเสียหาย หากต้องการใช้แบบฟอร์มเดิม ให้เชื่อมแบบฟอร์มนั้นกับชีตนี้');
    }

    var oldSheetIds = {};
    ss.getSheets().forEach(function (sheet) { oldSheetIds[sheet.getSheetId()] = true; });

    var form = FormApp.create('แบบฟอร์มข้อมูลลูกค้า — โปรแกรมโภชนาการ 28 วัน');
    form.setDescription(
      'ข้อมูลนี้ช่วยให้ผู้ให้คำปรึกษาเข้าใจตารางชีวิต พฤติกรรมการกิน และข้อจำกัดของคุณ เพื่อจัดทำร่างแผน 28 วันที่เหมาะกับบริบทในประเทศไทย\n\n' +
      'บริการนี้ให้คำแนะนำด้านพฤติกรรมการกินทั่วไป ไม่แทนการวินิจฉัยหรือรักษาทางการแพทย์');
    form.setCollectEmail(false);
    form.setProgressBar(true);
    soloAddThaiFormQuestions_(form);
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
    if (!responseSheet) throw new Error('สร้างแบบฟอร์มแล้ว แต่ยังไม่พบชีตคำตอบ กรุณารอเล็กน้อยแล้วลองอีกครั้ง');

    if (clientSheet && clientSheet.getSheetId() !== responseSheet.getSheetId()) {
      if (clientSheet.getLastRow() <= 1) {
        clientSheet.setName('ลูกค้า_สำรอง_' + Utilities.formatDate(new Date(), SOLO.timeZone, 'yyyyMMdd_HHmmss'));
      }
      else throw new Error('มีชีตชื่อ “' + SOLO.sheets.clients + '” อยู่แล้วและไม่สามารถแทนที่ได้');
    }
    responseSheet.setName(SOLO.sheets.clients);
    soloEnsureColumn_(responseSheet, 'รหัสลูกค้า');
    soloEnsureColumn_(responseSheet, 'สถานะเวิร์กโฟลว์');
    responseSheet.setFrozenRows(1);
    props.setProperty(SOLO.properties.formId, form.getId());

    installTriggers();
    soloAlert_('สร้างแบบฟอร์มเรียบร้อย',
      'ลิงก์สำหรับส่งให้ลูกค้า:\n' + form.getPublishedUrl() + '\n\n' +
      'ลิงก์แก้ไขแบบฟอร์ม:\n' + form.getEditUrl());
  } catch (error) {
    soloAlert_('สร้างแบบฟอร์มไม่สำเร็จ', error.message);
    throw error;
  }
}

function soloSetupSystem_() {
  var ss = soloSpreadsheet_();
  ss.setSpreadsheetTimeZone(SOLO.timeZone);
  try { ss.setSpreadsheetLocale(SOLO.locale); } catch (ignoreLocale) {}
  soloEnsureSheet_(SOLO.sheets.drafts, SOLO_HEADERS.drafts);
  soloEnsureSheet_(SOLO.sheets.finals, SOLO_HEADERS.finals);
  soloEnsureSheet_(SOLO.sheets.replies, SOLO_HEADERS.replies);
  soloEnsureSheet_(SOLO.sheets.settings, SOLO_HEADERS.settings);
  soloSeedPrompts_();
  soloApplyValidations_();
  onOpen();
}

function soloAddThaiFormQuestions_(form) {
  form.addSectionHeaderItem().setTitle('1. ข้อมูลติดต่อ').setHelpText('ใช้สำหรับส่งแผนและติดตามผลตลอด 28 วัน');
  form.addTextItem().setTitle('ชื่อ-นามสกุล').setRequired(true);
  form.addTextItem().setTitle('อีเมล').setRequired(true).setValidation(
    FormApp.createTextValidation().requireTextIsEmail().setHelpText('กรุณากรอกอีเมลให้ถูกต้อง').build());
  form.addTextItem().setTitle('เบอร์โทรศัพท์').setHelpText('ไม่บังคับ').setRequired(false);

  form.addSectionHeaderItem().setTitle('2. งานและกิจวัตรประจำวัน');
  form.addTextItem().setTitle('เวลาทำงานตามปกติ').setHelpText('ตัวอย่าง: 09:00-18:00 น. ทำงานล่วงเวลา 2 วันต่อสัปดาห์').setRequired(true);
  form.addMultipleChoiceItem().setTitle('รูปแบบสถานที่ทำงาน').setChoiceValues([
    'ทำงานที่สำนักงานเป็นหลัก', 'ทำงานที่บ้านเป็นหลัก', 'ทำงานแบบผสม', 'ทำงานเป็นกะ', 'อื่น ๆ'
  ]).setRequired(true);
  form.addMultipleChoiceItem().setTitle('จำนวนมื้อที่ซื้อจากร้านอาหารหรือสั่งเดลิเวอรีต่อสัปดาห์').setChoiceValues([
    '0-2 มื้อ', '3-5 มื้อ', '6-10 มื้อ', 'มากกว่า 10 มื้อ'
  ]).setRequired(true);
  form.addTextItem().setTitle('เวลานอนและเวลาตื่นโดยทั่วไป').setHelpText('ตัวอย่าง: นอน 00:00 น. ตื่น 06:30 น.').setRequired(true);
  form.addMultipleChoiceItem().setTitle('ระดับกิจกรรมทางกายในปัจจุบัน').setChoiceValues([
    'แทบไม่ได้เคลื่อนไหว', 'เดินหรือทำกิจกรรมเบา ๆ สัปดาห์ละ 1-2 วัน',
    'ออกกำลังกายสัปดาห์ละ 1-2 วัน', 'ออกกำลังกายสัปดาห์ละ 3 วันขึ้นไป'
  ]).setRequired(true);

  form.addSectionHeaderItem().setTitle('3. พฤติกรรมการกินและบริบทในประเทศไทย');
  form.addParagraphTextItem().setTitle('เล่ารูปแบบอาหารในวันทำงานหนึ่งวัน').setHelpText('เช่น มื้อเช้า อาหารตามสั่งหรือฟู้ดคอร์ท ของว่าง เครื่องดื่ม และมื้อเย็น').setRequired(true);
  form.addCheckboxItem().setTitle('พฤติกรรมที่เกิดขึ้นเป็นประจำ').setChoiceValues([
    'ข้ามมื้อเช้า', 'กินมื้อกลางวันไม่เป็นเวลา', 'กินมื้อดึก', 'กินเร็ว',
    'ดื่มเครื่องดื่มหวานเป็นประจำ', 'กินผักน้อย', 'ดื่มน้ำน้อย', 'ไม่มีข้อใดตรง'
  ]).setRequired(true);
  form.addMultipleChoiceItem().setTitle('งบประมาณค่าอาหารต่อวันโดยประมาณ').setChoiceValues([
    'ต่ำกว่า 150 บาท', '150-250 บาท', '251-400 บาท', 'มากกว่า 400 บาท', 'ไม่สะดวกตอบ'
  ]).setRequired(true);
  form.addMultipleChoiceItem().setTitle('ความสะดวกในการเตรียมอาหาร').setChoiceValues([
    'ทำอาหารได้เป็นประจำ', 'ทำได้เฉพาะเมนูง่าย ๆ', 'มีเพียงตู้เย็นหรือไมโครเวฟ', 'ซื้ออาหารเกือบทุกมื้อ'
  ]).setRequired(true);
  form.addParagraphTextItem().setTitle('อาหารที่แพ้ อาหารที่หลีกเลี่ยง หรือข้อกำหนดด้านศาสนา').setHelpText('เช่น แพ้กุ้ง ฮาลาล มังสวิรัติ อาหารเจ หรือไม่มีข้อจำกัด').setRequired(true);
  form.addParagraphTextItem().setTitle('อาหารไทยหรือเมนูที่กินบ่อยและต้องการเก็บไว้ในแผน').setRequired(false);

  form.addSectionHeaderItem().setTitle('4. เป้าหมายและรูปแบบการสนับสนุน');
  form.addParagraphTextItem().setTitle('สิ่งที่ต้องการปรับปรุงใน 28 วัน').setHelpText('เน้นพฤติกรรมหรือกิจวัตร ไม่จำเป็นต้องระบุน้ำหนักเป้าหมาย').setRequired(true);
  form.addParagraphTextItem().setTitle('อุปสรรคที่ทำให้เปลี่ยนพฤติกรรมได้ยาก').setRequired(true);
  form.addCheckboxItem().setTitle('รูปแบบคำแนะนำที่ช่วยคุณได้มากที่สุด').setChoiceValues([
    'รายการสิ่งที่ทำได้ทันที', 'ตัวอย่างการเลือกอาหารนอกบ้าน', 'แนวทางเตรียมอาหารล่วงหน้า',
    'ตารางติดตามแบบง่าย', 'การทบทวนทุกสัปดาห์'
  ]).setRequired(true);

  form.addSectionHeaderItem().setTitle('5. คำถามคัดกรองเพื่อความปลอดภัย');
  form.addMultipleChoiceItem().setTitle('คุณกำลังตั้งครรภ์หรือให้นมบุตรหรือไม่?').setChoiceValues(['ใช่', 'ไม่ใช่', 'ไม่สะดวกตอบ']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('คุณกำลังรักษาโรคหรือใช้ยาตามคำสั่งแพทย์หรือไม่?').setChoiceValues(['ใช่', 'ไม่ใช่', 'ไม่สะดวกตอบ']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('คุณเคยได้รับการวินิจฉัยหรือกำลังรับการรักษาความผิดปกติด้านการกินหรือไม่?').setChoiceValues(['ใช่', 'ไม่ใช่', 'ไม่สะดวกตอบ']).setRequired(true);
  form.addParagraphTextItem().setTitle('หากตอบ “ใช่” ในข้อใดข้อหนึ่ง โปรดให้ข้อมูลเพิ่มเติมเท่าที่สะดวก').setRequired(false);
  form.addCheckboxItem().setTitle('การยืนยัน').setChoiceValues([
    'ฉันเข้าใจว่าบริการนี้เป็นคำแนะนำด้านพฤติกรรมการกิน และไม่แทนการวินิจฉัยหรือการรักษาทางการแพทย์'
  ]).setRequired(true);
}

function onIntakeFormSubmit(event) {
  try {
    if (!event || !event.range) return;
    var sheet = event.range.getSheet();
    if (sheet.getName() !== SOLO.sheets.clients) return;
    soloEnsureClientColumns_(sheet);
    var clientId = soloAssignClientId_(sheet, event.range.getRow());
    soloNotifyConsultant_(clientId, sheet);
  } catch (error) {
    console.error('onIntakeFormSubmit: ' + error.message);
  }
}

function soloNotifyConsultant_(clientId, sheet) {
  var props = PropertiesService.getScriptProperties();
  var recipient = soloText_(props.getProperty(SOLO.properties.consultantEmail));
  if (!recipient) recipient = soloText_(Session.getEffectiveUser().getEmail());
  if (!recipient) return;
  var dashboard = soloText_(props.getProperty(SOLO.properties.dashboardUrl));
  var link = dashboard || (soloSpreadsheet_().getUrl() + '#gid=' + sheet.getSheetId());
  var subject = 'มีแบบฟอร์มลูกค้าใหม่ · ' + clientId;
  var body = 'มีข้อมูลลูกค้าใหม่ในระบบ SoloSix\n\nรหัสลูกค้า: ' + clientId +
    '\nเวลารับข้อมูล: ' + soloNow_() + '\n\nเปิดรายการ: ' + link +
    '\n\nอีเมลนี้ไม่แสดงข้อมูลสุขภาพหรือข้อมูลติดต่อของลูกค้า';
  MailApp.sendEmail(recipient, subject, body);
}

function generateSelectedDraft() {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    if (!sheet || sheet.getName() !== SOLO.sheets.clients) {
      throw new Error('กรุณาเปิดชีต “' + SOLO.sheets.clients + '” และเลือกแถวของลูกค้าที่ต้องการสร้างร่าง');
    }
    var row = sheet.getActiveRange().getRow();
    if (row < 2) throw new Error('กรุณาเลือกแถวข้อมูลลูกค้า ไม่ใช่แถวหัวตาราง');
    soloEnsureClientColumns_(sheet);
    var clientId = soloAssignClientId_(sheet, row);
    soloGenerateDraftByClientId_(clientId, false);
    soloAlert_('สร้างร่างเรียบร้อย', 'บันทึกร่างของ ' + clientId + ' ในชีต “' + SOLO.sheets.drafts + '” แล้ว');
  } catch (error) {
    soloAlert_('สร้างร่างไม่สำเร็จ', error.message);
    throw error;
  }
}

function soloGenerateDraftByClientId_(clientId, overwrite) {
  var client = soloFindRowById_(SOLO.sheets.clients, clientId);
  var existing = soloFindRowById_(SOLO.sheets.drafts, clientId, true);
  if (existing && soloText_(soloCell_(existing.values, existing.map, 'ร่างแผน 4 สัปดาห์')) && !overwrite) {
    throw new Error('รหัส ' + clientId + ' มีร่างอยู่แล้ว หากต้องการแก้ ให้ใส่ข้อเสนอแนะและใช้ขั้นตอนแก้ร่าง');
  }

  var risk = soloHealthRisk_(client.headers, client.values);
  var safeIntake = soloBuildSafeIntake_(client.headers, client.values);
  var userMessage =
    'ข้อมูลแบบฟอร์มที่ตัดข้อมูลระบุตัวบุคคลแล้ว:\n' + safeIntake + '\n\n' +
    'ผลคัดกรองสุขภาพ: ' + (risk.flagged ? 'มีประเด็นที่ต้องให้มนุษย์ตรวจสอบ\n' + risk.details.join('\n') : 'ยังไม่พบธงจากคำตอบในแบบฟอร์ม') + '\n\n' +
    'สร้างร่างตามโครงสร้าง JSON ที่กำหนด';

  var raw = soloCallOpenAI_(soloGetPrompt_(SOLO.promptCodes.draft), userMessage, true);
  var data;
  try {
    data = soloParseJson_(raw);
  } catch (parseError) {
    soloUpsertById_(SOLO.sheets.drafts, SOLO_HEADERS.drafts, clientId, {
      'รหัสลูกค้า': clientId,
      'สร้างเมื่อ': soloNow_(),
      'ธงคัดกรองสุขภาพ': risk.flagged ? risk.details.join('\n') : 'ไม่พบธงจากแบบฟอร์ม',
      'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview,
      'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': raw
    });
    soloSetClientWorkflow_(clientId, SOLO.status.waitingReview);
    throw new Error(parseError.message + ' ระบบเก็บคำตอบดิบไว้ในชีต “' + SOLO.sheets.drafts + '” แล้ว');
  }
  if (!Array.isArray(data.four_week_plan)) data.four_week_plan = [];

  var values = {
    'รหัสลูกค้า': clientId,
    'สร้างเมื่อ': soloNow_(),
    'ธงคัดกรองสุขภาพ': risk.flagged ? risk.details.join('\n') : 'ไม่พบธงจากแบบฟอร์ม',
    'สรุปสถานการณ์': soloText_(data.summary),
    'ข้อมูลที่ยังขาด': soloList_(data.missing_information),
    'คำถามสำหรับพูดคุย': soloList_(data.discussion_questions),
    'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ': soloList_(data.consultant_review),
    'ร่างแผน 4 สัปดาห์': soloFormatPlan_(data.four_week_plan),
    'JSON ร่างแผน': JSON.stringify(data),
    'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview,
    'จำนวนครั้งที่แก้ไข': existing ? soloCell_(existing.values, existing.map, 'จำนวนครั้งที่แก้ไข') || 0 : 0,
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': ''
  };
  soloUpsertById_(SOLO.sheets.drafts, SOLO_HEADERS.drafts, clientId, values);
  soloSetClientWorkflow_(clientId, SOLO.status.waitingReview);
  soloApplyValidations_();
  return values;
}

function reviseDraftsNeedingChanges() {
  try {
    var count = 0;
    var draftSheet = soloSheet_(SOLO.sheets.drafts);
    var table = soloReadTable_(draftSheet);
    for (var i = 0; i < table.rows.length && count < SOLO.maxRowsPerRun; i++) {
      if (soloText_(soloCell_(table.rows[i], table.map, 'สถานะตรวจสอบรอบแรก')) !== SOLO.status.needsChanges) continue;
      var clientId = soloText_(soloCell_(table.rows[i], table.map, 'รหัสลูกค้า'));
      var feedback = soloText_(soloCell_(table.rows[i], table.map, 'ข้อเสนอแนะ'));
      if (!feedback) continue;
      soloReviseDraftByClientId_(clientId, feedback);
      count++;
    }
    soloAlert_('แก้ร่างเรียบร้อย', count ? 'แก้ร่างจำนวน ' + count + ' รายการแล้ว' : 'ไม่พบรายการที่มีสถานะ “' + SOLO.status.needsChanges + '” และมีข้อเสนอแนะ');
  } catch (error) {
    soloAlert_('แก้ร่างไม่สำเร็จ', error.message);
    throw error;
  }
}

function soloReviseDraftByClientId_(clientId, feedback) {
  var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
  var oldJson = soloText_(soloCell_(draft.values, draft.map, 'JSON ร่างแผน'));
  var oldReadable = soloText_(soloCell_(draft.values, draft.map, 'ร่างแผน 4 สัปดาห์'));
  if (!oldJson && !oldReadable) throw new Error('ยังไม่มีร่างสำหรับ ' + clientId);

  var raw = soloCallOpenAI_(soloGetPrompt_(SOLO.promptCodes.revise),
    'ร่างเดิม:\n' + (oldJson || oldReadable) + '\n\nข้อเสนอแนะของผู้ให้คำปรึกษา:\n' + feedback + '\n\nส่งคืน JSON ฉบับแก้ไข', true);
  var data;
  try {
    data = soloParseJson_(raw);
  } catch (parseError) {
    soloWriteNamedValues_(draft.sheet, draft.row, draft.map, {
      'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview,
      'แก้ไขล่าสุด': soloNow_(),
      'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': raw
    });
    throw new Error(parseError.message + ' ระบบเก็บคำตอบดิบไว้ในแถวเดิมแล้ว');
  }
  var revisionCount = Number(soloCell_(draft.values, draft.map, 'จำนวนครั้งที่แก้ไข') || 0) + 1;
  var updates = {
    'สรุปสถานการณ์': soloText_(data.summary),
    'ข้อมูลที่ยังขาด': soloList_(data.missing_information),
    'คำถามสำหรับพูดคุย': soloList_(data.discussion_questions),
    'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ': soloList_(data.consultant_review),
    'ร่างแผน 4 สัปดาห์': soloFormatPlan_(data.four_week_plan || []),
    'JSON ร่างแผน': JSON.stringify(data),
    'สถานะตรวจสอบรอบแรก': SOLO.status.waitingReview,
    'จำนวนครั้งที่แก้ไข': revisionCount,
    'รายการที่แก้ไข': soloList_(data.changes),
    'แก้ไขล่าสุด': soloNow_(),
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': ''
  };
  soloWriteNamedValues_(draft.sheet, draft.row, draft.map, updates);
  soloSetClientWorkflow_(clientId, SOLO.status.waitingReview);
  return updates;
}

function moveApprovedDraftsToFinal() {
  try {
    var count = 0;
    var table = soloReadTable_(soloSheet_(SOLO.sheets.drafts));
    for (var i = 0; i < table.rows.length && count < SOLO.maxRowsPerRun; i++) {
      if (soloText_(soloCell_(table.rows[i], table.map, 'สถานะตรวจสอบรอบแรก')) !== SOLO.status.agreed) continue;
      var clientId = soloText_(soloCell_(table.rows[i], table.map, 'รหัสลูกค้า'));
      if (soloFindRowById_(SOLO.sheets.finals, clientId, true)) continue;
      soloMoveDraftToFinalById_(clientId);
      count++;
    }
    soloAlert_('ย้ายไปแผนฉบับสุดท้ายแล้ว', count ? 'สร้างแผนฉบับสุดท้ายจำนวน ' + count + ' รายการ' : 'ไม่พบร่างใหม่ที่มีสถานะ “' + SOLO.status.agreed + '”');
  } catch (error) {
    soloAlert_('ย้ายแผนไม่สำเร็จ', error.message);
    throw error;
  }
}

function soloMoveDraftToFinalById_(clientId) {
  var draft = soloFindRowById_(SOLO.sheets.drafts, clientId);
  var client = soloFindRowById_(SOLO.sheets.clients, clientId);
  var readableDraft = soloText_(soloCell_(draft.values, draft.map, 'ร่างแผน 4 สัปดาห์'));
  if (!readableDraft) throw new Error('ร่างแผนของ ' + clientId + ' ยังว่าง');

  var raw = soloCallOpenAI_(soloGetPrompt_(SOLO.promptCodes.final),
    'สรุปสถานการณ์ที่อนุมัติแล้ว:\n' + soloText_(soloCell_(draft.values, draft.map, 'สรุปสถานการณ์')) +
    '\n\nร่างแผนที่อนุมัติแล้ว:\n' + readableDraft + '\n\nเรียบเรียงเป็นข้อความสำหรับลูกค้าตาม JSON ที่กำหนด', true);
  var data;
  try {
    data = soloParseJson_(raw);
  } catch (parseError) {
    soloUpsertById_(SOLO.sheets.finals, SOLO_HEADERS.finals, clientId, {
      'รหัสลูกค้า': clientId,
      'ย้ายเมื่อ': soloNow_(),
      'ชื่อ-นามสกุล': soloClientIdentity_(client, ['ชื่อ-นามสกุล', 'ชื่อและนามสกุล', 'ชื่อ']),
      'อีเมล': soloClientEmail_(client),
      'สรุปสถานการณ์': soloText_(soloCell_(draft.values, draft.map, 'สรุปสถานการณ์')),
      'สถานะอนุมัติขั้นสุดท้าย': SOLO.status.waitingFinal,
      'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': raw
    });
    soloSetClientWorkflow_(clientId, SOLO.status.waitingFinal);
    throw new Error(parseError.message + ' ระบบเก็บคำตอบดิบไว้ในชีต “' + SOLO.sheets.finals + '” แล้ว');
  }
  var subject = 'แผนโภชนาการ 28 วัน · รหัสลูกค้า ' + clientId;
  var values = {
    'รหัสลูกค้า': clientId,
    'ย้ายเมื่อ': soloNow_(),
    'ชื่อ-นามสกุล': soloClientIdentity_(client, ['ชื่อ-นามสกุล', 'ชื่อและนามสกุล', 'ชื่อ']),
    'อีเมล': soloClientEmail_(client),
    'สรุปสถานการณ์': soloText_(soloCell_(draft.values, draft.map, 'สรุปสถานการณ์')),
    'เนื้อหาแผนสำหรับลูกค้า': soloText_(data.client_message),
    'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ': soloList_(data.consultant_review),
    'สถานะอนุมัติขั้นสุดท้าย': SOLO.status.waitingFinal,
    'หัวข้ออีเมล': subject,
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': ''
  };
  soloUpsertById_(SOLO.sheets.finals, SOLO_HEADERS.finals, clientId, values);
  soloSetClientWorkflow_(clientId, SOLO.status.waitingFinal);
  soloApplyValidations_();
  return values;
}

function sendApprovedPlans() {
  try {
    var count = 0;
    var table = soloReadTable_(soloSheet_(SOLO.sheets.finals));
    for (var i = 0; i < table.rows.length; i++) {
      var status = soloText_(soloCell_(table.rows[i], table.map, 'สถานะอนุมัติขั้นสุดท้าย'));
      var sentAt = soloText_(soloCell_(table.rows[i], table.map, 'ส่งเมื่อ'));
      if (status !== SOLO.status.approvedToSend || sentAt) continue;
      var clientId = soloText_(soloCell_(table.rows[i], table.map, 'รหัสลูกค้า'));
      soloSendPlanByClientId_(clientId, false);
      count++;
    }
    soloAlert_('ส่งอีเมลเรียบร้อย', count ? 'ส่งแผนจำนวน ' + count + ' ฉบับแล้ว' : 'ไม่พบแผนที่มีสถานะ “' + SOLO.status.approvedToSend + '” และยังไม่เคยส่ง');
  } catch (error) {
    soloAlert_('ส่งอีเมลไม่สำเร็จ', error.message);
    throw error;
  }
}

function soloSendPlanByClientId_(clientId, allowResend) {
  var finalRow = soloFindRowById_(SOLO.sheets.finals, clientId);
  var email = soloText_(soloCell_(finalRow.values, finalRow.map, 'อีเมล'));
  var name = soloText_(soloCell_(finalRow.values, finalRow.map, 'ชื่อ-นามสกุล'));
  var subject = soloText_(soloCell_(finalRow.values, finalRow.map, 'หัวข้ออีเมล')) || ('แผนโภชนาการ 28 วัน · รหัสลูกค้า ' + clientId);
  var message = soloText_(soloCell_(finalRow.values, finalRow.map, 'เนื้อหาแผนสำหรับลูกค้า'));
  var sentAt = soloText_(soloCell_(finalRow.values, finalRow.map, 'ส่งเมื่อ'));
  if (!email || email.indexOf('@') < 1) throw new Error('ไม่พบอีเมลที่ถูกต้องของ ' + clientId);
  if (!message) throw new Error('เนื้อหาแผนสำหรับลูกค้ายังว่าง');
  if (sentAt && !allowResend) throw new Error('แผนนี้ส่งแล้วเมื่อ ' + sentAt + ' ระบบยกเลิกการส่งซ้ำ');

  var body = (name ? 'สวัสดีคุณ ' + name : 'สวัสดีค่ะ/ครับ') + '\n\n' + message + '\n\n' +
    '---\nกรุณาตอบกลับอีเมลฉบับนี้โดยคงหัวข้อเดิมไว้ เพื่อให้ระบบจับคู่กับรหัสลูกค้าของคุณได้ถูกต้อง\n' +
    'คำแนะนำนี้มุ่งเน้นพฤติกรรมการกินทั่วไป ไม่แทนการวินิจฉัยหรือการรักษาทางการแพทย์ หากมีอาการผิดปกติ โปรดพบแพทย์';
  GmailApp.sendEmail(email, subject, body);

  var note = (allowResend && sentAt ? 'ส่งซ้ำ' : 'ส่ง') + 'ถึง ' + email + ' · ' + soloNow_();
  soloWriteNamedValues_(finalRow.sheet, finalRow.row, finalRow.map, {
    'สถานะอนุมัติขั้นสุดท้าย': SOLO.status.sent,
    'ส่งเมื่อ': soloNow_(),
    'บันทึกการส่ง': note
  });
  soloSetClientWorkflow_(clientId, SOLO.status.sent);
  return note;
}

function processUnreadReplies() {
  try {
    var result = soloProcessUnreadReplies_();
    soloAlert_('อ่านอีเมลตอบกลับ', result);
  } catch (error) {
    soloAlert_('อ่านอีเมลไม่สำเร็จ', error.message);
    throw error;
  }
}

function processUnreadRepliesScheduled() {
  try { console.log(soloProcessUnreadReplies_()); }
  catch (error) { console.error(error.message); }
}

function soloProcessUnreadReplies_() {
  var finalTable = soloReadTable_(soloSheet_(SOLO.sheets.finals));
  var replyIds = soloExistingEmailIds_();
  var processed = 0;
  var errors = [];

  for (var i = 0; i < finalTable.rows.length && processed < SOLO.maxRowsPerRun; i++) {
    var clientId = soloText_(soloCell_(finalTable.rows[i], finalTable.map, 'รหัสลูกค้า'));
    var email = soloText_(soloCell_(finalTable.rows[i], finalTable.map, 'อีเมล')).toLowerCase();
    var sentAt = soloText_(soloCell_(finalTable.rows[i], finalTable.map, 'ส่งเมื่อ'));
    if (!clientId || !email || !sentAt) continue;

    var threads = GmailApp.search('subject:"' + clientId + '" is:unread -in:chats', 0, 10);
    for (var t = 0; t < threads.length && processed < SOLO.maxRowsPerRun; t++) {
      var messages = threads[t].getMessages();
      for (var m = 0; m < messages.length && processed < SOLO.maxRowsPerRun; m++) {
        var mail = messages[m];
        if (!mail.isUnread()) continue;
        if (replyIds[mail.getId()]) { mail.markRead(); continue; }
        if (soloText_(mail.getFrom()).toLowerCase().indexOf(email) === -1) continue;
        try {
          soloSummarizeReply_(clientId, mail);
          replyIds[mail.getId()] = true;
          mail.markRead();
          processed++;
        } catch (error) {
          errors.push(clientId + ': ' + error.message);
        }
      }
    }
  }
  var summary = 'สรุปอีเมลตอบกลับใหม่ ' + processed + ' ฉบับ';
  if (errors.length) summary += '\n\nข้อผิดพลาด:\n' + errors.join('\n');
  return summary;
}

function soloSummarizeReply_(clientId, mail) {
  var body = soloText_(mail.getPlainBody());
  if (!body) throw new Error('อีเมลไม่มีเนื้อหาแบบข้อความ');
  if (body.length > 12000) body = body.substring(0, 12000);
  var raw = soloCallOpenAI_(soloGetPrompt_(SOLO.promptCodes.reply),
    'อีเมลตอบกลับของลูกค้า:\n---\n' + body + '\n---\nสรุปตาม JSON ที่กำหนด', true);
  var data;
  try {
    data = soloParseJson_(raw);
  } catch (parseError) {
    soloAppendNamedValues_(SOLO.sheets.replies, SOLO_HEADERS.replies, {
      'รหัสลูกค้า': clientId,
      'อ่านเมื่อ': soloNow_(),
      'วันที่อีเมล': Utilities.formatDate(mail.getDate(), SOLO.timeZone, 'dd/MM/yyyy HH:mm'),
      'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ': 'AI ส่ง JSON ไม่ถูกต้อง กรุณาอ่านอีเมลต้นฉบับ',
      'รหัสอีเมล': mail.getId(),
      'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': raw
    });
    throw new Error(parseError.message + ' ระบบเก็บคำตอบดิบไว้ในชีต “' + SOLO.sheets.replies + '” แล้ว');
  }
  soloAppendNamedValues_(SOLO.sheets.replies, SOLO_HEADERS.replies, {
    'รหัสลูกค้า': clientId,
    'อ่านเมื่อ': soloNow_(),
    'วันที่อีเมล': Utilities.formatDate(mail.getDate(), SOLO.timeZone, 'dd/MM/yyyy HH:mm'),
    'สิ่งที่ลูกค้าทำได้': soloList_(data.completed),
    'อุปสรรค': soloList_(data.obstacles),
    'คำถามของลูกค้า': soloList_(data.client_questions),
    'ประเด็นที่ผู้ให้คำปรึกษาต้องตรวจสอบ': soloList_(data.consultant_review),
    'รหัสอีเมล': mail.getId(),
    'ข้อมูลดิบเมื่อเกิดข้อผิดพลาด': ''
  });
}

function testOpenAIConnection() {
  try {
    var started = new Date().getTime();
    var answer = soloCallOpenAI_('ตอบคำถามสั้น ๆ เป็นภาษาไทยเท่านั้น', 'ตอบเพียงว่า: ระบบพร้อมใช้งาน', false);
    soloAlert_('เชื่อมต่อ OpenAI สำเร็จ',
      'โมเดล: ' + soloModel_() + '\nเวลา: ' + (new Date().getTime() - started) + ' มิลลิวินาที\nคำตอบ: ' + answer);
  } catch (error) {
    soloAlert_('เชื่อมต่อ OpenAI ไม่สำเร็จ', error.message);
    throw error;
  }
}

function installTriggers() {
  try {
    var ss = soloSpreadsheet_();
    var handlers = ['onIntakeFormSubmit', 'processUnreadRepliesScheduled'];
    ScriptApp.getProjectTriggers().forEach(function (trigger) {
      if (handlers.indexOf(trigger.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(trigger);
    });
    ScriptApp.newTrigger('onIntakeFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
    ScriptApp.newTrigger('processUnreadRepliesScheduled').timeBased().everyHours(6).create();
    soloAlert_('ติดตั้งทริกเกอร์แล้ว',
      '1) เพิ่มรหัสลูกค้าเมื่อมีการส่งแบบฟอร์ม\n2) ตรวจอีเมลตอบกลับทุก 6 ชั่วโมง');
  } catch (error) {
    soloAlert_('ติดตั้งทริกเกอร์ไม่สำเร็จ', error.message);
    throw error;
  }
}

function openDashboard() {
  var url = PropertiesService.getScriptProperties().getProperty(SOLO.properties.dashboardUrl);
  if (!url) {
    soloAlert_('ยังไม่มีลิงก์ Dashboard',
      'หลังจาก Deploy เป็น Web app ให้เพิ่ม Script Property ชื่อ ' + SOLO.properties.dashboardUrl + ' และใส่ URL ที่ลงท้ายด้วย /exec');
    return;
  }
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:18px"><a href="' + soloEscapeHtml_(url) + '" target="_blank" ' +
    'style="display:inline-block;background:#7c1936;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">เปิด Dashboard</a></div>')
    .setWidth(300).setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dashboard');
}

function soloCallOpenAI_(systemPrompt, userMessage, jsonMode) {
  var key = soloApiKey_();
  var payload = {
    model: soloModel_(),
    temperature: 0.3,
    max_completion_tokens: 5000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  };
  if (jsonMode) payload.response_format = { type: 'json_object' };

  var response = UrlFetchApp.fetch(SOLO.apiUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var status = response.getResponseCode();
  var text = response.getContentText();
  var data;
  try { data = JSON.parse(text); }
  catch (parseError) { throw new Error('OpenAI ส่งข้อมูลที่อ่านไม่ได้ (HTTP ' + status + ')'); }
  if (status < 200 || status >= 300 || data.error) {
    var detail = data.error && data.error.message ? data.error.message : text;
    throw new Error('OpenAI API ไม่สำเร็จ (HTTP ' + status + '): ' + soloText_(detail).substring(0, 500));
  }
  var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error('OpenAI ไม่ส่งเนื้อหากลับมา กรุณาตรวจชื่อโมเดลและเครดิต API');
  return soloText_(content);
}

function soloApiKey_() {
  var key = soloText_(PropertiesService.getScriptProperties().getProperty(SOLO.properties.apiKey));
  key = key.replace(/^["'“‘]+|["'”’]+$/g, '').trim();
  if (!key) throw new Error('ยังไม่ได้ตั้ง Script Property ชื่อ ' + SOLO.properties.apiKey);
  if (key.length < 40 || /[^\x20-\x7E]/.test(key)) {
    throw new Error('ค่า ' + SOLO.properties.apiKey + ' ดูไม่สมบูรณ์ กรุณาคัดลอก secret key ใหม่โดยตรงจากแพลตฟอร์ม OpenAI');
  }
  return key;
}

function soloModel_() {
  return soloText_(PropertiesService.getScriptProperties().getProperty(SOLO.properties.model)) || SOLO.defaultModel;
}

function soloParseJson_(text) {
  var cleaned = soloText_(text).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(cleaned); }
  catch (firstError) {
    var start = cleaned.indexOf('{');
    var end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.substring(start, end + 1)); }
      catch (secondError) {}
    }
    throw new Error('AI ส่ง JSON ไม่ถูกต้อง กรุณาลองใหม่ ตรวจข้อความดิบในบันทึกการทำงานหากปัญหาเกิดซ้ำ');
  }
}

function soloSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('ไม่พบ Google Sheets ที่ผูกกับโปรเจ็กต์นี้');
  return ss;
}

function soloSheet_(name) {
  var sheet = soloSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบชีต “' + name + '” กรุณาเรียกใช้ setupSystem ก่อน');
  return sheet;
}

function soloEnsureSheet_(name, headers) {
  var ss = soloSpreadsheet_();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    headers.forEach(function (header) { soloEnsureColumn_(sheet, header); });
  }
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#f4e8ec');
  sheet.setFrozenRows(1);
  return sheet;
}

function soloEnsureColumn_(sheet, header) {
  var table = soloReadTable_(sheet);
  if (table.map[soloNormalize_(header)] !== undefined) return table.map[soloNormalize_(header)] + 1;
  var column = sheet.getLastColumn() + 1;
  sheet.getRange(1, column).setValue(header).setFontWeight('bold');
  return column;
}

function soloEnsureClientColumns_(sheet) {
  soloEnsureColumn_(sheet, 'รหัสลูกค้า');
  soloEnsureColumn_(sheet, 'สถานะเวิร์กโฟลว์');
}

function soloReadTable_(sheet) {
  var lastColumn = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  if (lastColumn < 1) return { sheet: sheet, headers: [], map: {}, rows: [] };
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var key = soloNormalize_(headers[i]);
    if (key) map[key] = i;
  }
  return {
    sheet: sheet,
    headers: headers,
    map: map,
    rows: lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues() : []
  };
}

function soloNormalize_(value) {
  return soloText_(value).replace(/\s+/g, ' ').toLowerCase();
}

function soloCell_(row, map, header) {
  var index = map[soloNormalize_(header)];
  return index === undefined ? '' : row[index];
}

function soloFindRowById_(sheetName, clientId, optional) {
  var ss = soloSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    if (optional) return null;
    throw new Error('ไม่พบชีต “' + sheetName + '”');
  }
  var table = soloReadTable_(sheet);
  var idIndex = table.map[soloNormalize_('รหัสลูกค้า')];
  if (idIndex === undefined) {
    if (optional) return null;
    throw new Error('ชีต “' + sheetName + '” ไม่มีคอลัมน์ “รหัสลูกค้า”');
  }
  for (var i = 0; i < table.rows.length; i++) {
    if (soloText_(table.rows[i][idIndex]) === clientId) {
      return { sheet: sheet, row: i + 2, values: table.rows[i], headers: table.headers, map: table.map };
    }
  }
  if (optional) return null;
  throw new Error('ไม่พบรหัสลูกค้า ' + clientId + ' ในชีต “' + sheetName + '”');
}

function soloAssignClientId_(sheet, rowNumber) {
  var table = soloReadTable_(sheet);
  var idIndex = table.map[soloNormalize_('รหัสลูกค้า')];
  var statusIndex = table.map[soloNormalize_('สถานะเวิร์กโฟลว์')];
  if (idIndex === undefined || statusIndex === undefined) throw new Error('ชีตลูกค้ายังไม่มีคอลัมน์ระบบ');
  var current = soloText_(sheet.getRange(rowNumber, idIndex + 1).getValue());
  if (current) return current;

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    current = soloText_(sheet.getRange(rowNumber, idIndex + 1).getValue());
    if (current) return current;
    var props = PropertiesService.getScriptProperties();
    var counter = Number(props.getProperty(SOLO.properties.clientCounter) || 0) + 1;
    props.setProperty(SOLO.properties.clientCounter, String(counter));
    var dateCode = Utilities.formatDate(new Date(), SOLO.timeZone, 'yyMMdd');
    var id = 'TH-' + dateCode + '-' + ('0000' + counter).slice(-4);
    sheet.getRange(rowNumber, idIndex + 1).setValue(id);
    sheet.getRange(rowNumber, statusIndex + 1).setValue(SOLO.status.newClient);
    return id;
  } finally {
    lock.releaseLock();
  }
}

function soloUpsertById_(sheetName, headers, clientId, values) {
  var sheet = soloEnsureSheet_(sheetName, headers);
  var existing = soloFindRowById_(sheetName, clientId, true);
  var table = soloReadTable_(sheet);
  if (existing) {
    soloWriteNamedValues_(sheet, existing.row, table.map, values);
    return existing.row;
  }
  var row = new Array(table.headers.length).fill('');
  Object.keys(values).forEach(function (header) {
    var index = table.map[soloNormalize_(header)];
    if (index !== undefined) row[index] = values[header];
  });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function soloAppendNamedValues_(sheetName, headers, values) {
  var sheet = soloEnsureSheet_(sheetName, headers);
  var table = soloReadTable_(sheet);
  var row = new Array(table.headers.length).fill('');
  Object.keys(values).forEach(function (header) {
    var index = table.map[soloNormalize_(header)];
    if (index !== undefined) row[index] = values[header];
  });
  sheet.appendRow(row);
}

function soloWriteNamedValues_(sheet, rowNumber, map, values) {
  Object.keys(values).forEach(function (header) {
    var index = map[soloNormalize_(header)];
    if (index !== undefined) sheet.getRange(rowNumber, index + 1).setValue(values[header]);
  });
}

function soloSetClientWorkflow_(clientId, status) {
  var client = soloFindRowById_(SOLO.sheets.clients, clientId);
  soloWriteNamedValues_(client.sheet, client.row, client.map, { 'สถานะเวิร์กโฟลว์': status });
}

function soloBuildSafeIntake_(headers, values) {
  var blocked = ['ชื่อ', 'นามสกุล', 'อีเมล', 'email', 'เบอร์โทร', 'โทรศัพท์', 'รหัสลูกค้า', 'timestamp', 'การประทับเวลา', 'สถานะเวิร์กโฟลว์'];
  var lines = [];
  for (var i = 0; i < headers.length; i++) {
    var header = soloText_(headers[i]);
    if (!header) continue;
    var normalized = soloNormalize_(header);
    if (blocked.some(function (word) { return normalized.indexOf(soloNormalize_(word)) !== -1; })) continue;
    var value = soloText_(values[i]);
    if (value) lines.push('- ' + header + ': ' + value);
  }
  return lines.join('\n');
}

function soloHealthRisk_(headers, values) {
  var details = [];
  for (var i = 0; i < headers.length; i++) {
    var header = soloText_(headers[i]);
    var answer = soloText_(values[i]);
    var isScreening = /ตั้งครรภ์|ให้นมบุตร|รักษาโรค|คำสั่งแพทย์|ความผิดปกติด้านการกิน/.test(header);
    if (isScreening && (/^ใช่/.test(answer) || /ไม่สะดวกตอบ/.test(answer))) details.push('- ' + header + ': ' + answer);
  }
  return { flagged: details.length > 0, details: details };
}

function soloClientIdentity_(client, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var value = soloText_(soloCell_(client.values, client.map, candidates[i]));
    if (value) return value;
  }
  return '';
}

function soloClientEmail_(client) {
  var direct = soloClientIdentity_(client, ['อีเมล', 'อีเมลติดต่อ', 'Email Address']);
  if (direct) return direct;
  for (var i = 0; i < client.values.length; i++) {
    var value = soloText_(client.values[i]);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return value;
  }
  return '';
}

function soloApplyValidations_() {
  var draft = soloSpreadsheet_().getSheetByName(SOLO.sheets.drafts);
  var finalSheet = soloSpreadsheet_().getSheetByName(SOLO.sheets.finals);
  if (draft) {
    var draftMap = soloReadTable_(draft).map;
    var draftColumn = draftMap[soloNormalize_('สถานะตรวจสอบรอบแรก')];
    if (draftColumn !== undefined) {
      var draftRule = SpreadsheetApp.newDataValidation()
        .requireValueInList([SOLO.status.waitingReview, SOLO.status.needsChanges, SOLO.status.agreed], true)
        .setAllowInvalid(false).build();
      draft.getRange(2, draftColumn + 1, Math.max(1, draft.getMaxRows() - 1), 1).setDataValidation(draftRule);
    }
  }
  if (finalSheet) {
    var finalMap = soloReadTable_(finalSheet).map;
    var finalColumn = finalMap[soloNormalize_('สถานะอนุมัติขั้นสุดท้าย')];
    if (finalColumn !== undefined) {
      var finalRule = SpreadsheetApp.newDataValidation()
        .requireValueInList([SOLO.status.waitingFinal, SOLO.status.approvedToSend, SOLO.status.sent], true)
        .setAllowInvalid(false).build();
      finalSheet.getRange(2, finalColumn + 1, Math.max(1, finalSheet.getMaxRows() - 1), 1).setDataValidation(finalRule);
    }
  }
}

function soloSeedPrompts_() {
  var sheet = soloSheet_(SOLO.sheets.settings);
  var table = soloReadTable_(sheet);
  var existing = {};
  table.rows.forEach(function (row) {
    var code = soloText_(soloCell_(row, table.map, 'รหัสพรอมต์'));
    if (code) existing[code] = true;
  });
  var prompts = [
    [SOLO.promptCodes.draft, 'สร้างร่างจากแบบฟอร์ม', SOLO_PROMPTS.draft],
    [SOLO.promptCodes.revise, 'แก้ร่างตามข้อเสนอแนะ', SOLO_PROMPTS.revise],
    [SOLO.promptCodes.final, 'เรียบเรียงแผนสำหรับลูกค้า', SOLO_PROMPTS.final],
    [SOLO.promptCodes.reply, 'สรุปอีเมลตอบกลับ', SOLO_PROMPTS.reply]
  ];
  prompts.forEach(function (item) {
    if (!existing[item[0]]) {
      soloAppendNamedValues_(SOLO.sheets.settings, SOLO_HEADERS.settings, {
        'รหัสพรอมต์': item[0], 'ชื่อพรอมต์': item[1], 'เนื้อหาพรอมต์': item[2],
        'เวอร์ชัน': 'TH-1.0', 'อัปเดตเมื่อ': soloNow_()
      });
    }
  });
  sheet.setColumnWidth(3, 640);
  sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), sheet.getLastColumn()).setWrap(true);
}

function soloGetPrompt_(code) {
  var sheet = soloSheet_(SOLO.sheets.settings);
  var table = soloReadTable_(sheet);
  for (var i = 0; i < table.rows.length; i++) {
    if (soloText_(soloCell_(table.rows[i], table.map, 'รหัสพรอมต์')) === code) {
      var content = soloText_(soloCell_(table.rows[i], table.map, 'เนื้อหาพรอมต์'));
      if (content) return content;
    }
  }
  var fallback = {};
  fallback[SOLO.promptCodes.draft] = SOLO_PROMPTS.draft;
  fallback[SOLO.promptCodes.revise] = SOLO_PROMPTS.revise;
  fallback[SOLO.promptCodes.final] = SOLO_PROMPTS.final;
  fallback[SOLO.promptCodes.reply] = SOLO_PROMPTS.reply;
  if (fallback[code]) return fallback[code];
  throw new Error('ไม่พบพรอมต์รหัส ' + code);
}

function soloExistingEmailIds_() {
  var ids = {};
  var table = soloReadTable_(soloSheet_(SOLO.sheets.replies));
  table.rows.forEach(function (row) {
    var id = soloText_(soloCell_(row, table.map, 'รหัสอีเมล'));
    if (id) ids[id] = true;
  });
  return ids;
}

function soloList_(items) {
  if (!Array.isArray(items) || !items.length) return 'ไม่มี';
  return items.map(function (item) { return '• ' + soloText_(item); }).join('\n');
}

function soloFormatPlan_(weeks) {
  if (!Array.isArray(weeks) || !weeks.length) return 'ยังไม่มีร่างแผน — ต้องให้ผู้ให้คำปรึกษาตรวจสอบก่อน';
  return weeks.map(function (week, index) {
    return 'สัปดาห์ที่ ' + (week.week || index + 1) + '\n' +
      'เป้าหมาย: ' + soloText_(week.objective || 'ยังไม่ระบุ') + '\n' +
      'สิ่งที่ทำ:\n' + soloList_(week.actions) + '\n' +
      'ความถี่: ' + soloText_(week.frequency || 'ยังไม่ระบุ') + '\n' +
      'วิธีบันทึกผล: ' + soloText_(week.tracking || 'ยังไม่ระบุ');
  }).join('\n\n');
}

function soloNow_() {
  return Utilities.formatDate(new Date(), SOLO.timeZone, 'dd/MM/yyyy HH:mm:ss');
}

function soloText_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, SOLO.timeZone, 'dd/MM/yyyy HH:mm:ss');
  }
  return String(value).trim();
}

function soloAlert_(title, message) {
  console.log('[' + title + '] ' + message);
  try { SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (noUi) {}
}

function soloEscapeHtml_(value) {
  return soloText_(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
