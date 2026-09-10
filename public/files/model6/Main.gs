/** WEUP SoloSix — โมเดล 6: ระบบแนะนำและพันธมิตรด้วย AI */
var CONFIG = {
    ROOT_FOLDER_NAME: "WEUP_SOLOSIX_AFFILIATE_AI",
    STALE_AFTER_DAYS: 90,
    CONCENTRATION_THRESHOLD: 0.7,
    ANTHROPIC_MODEL: "claude-sonnet-4-5",
    OPENAI_MODEL: "gpt-4o"
};

var SHEET_NAMES = {
  PRODUCTS: "สินค้า",
  PARTNERS: "พันธมิตร",
  LEADS: "ลูกค้า",
  COMMISSIONS: "ค่าคอมมิชชัน",
  SYSTEM_LOG: "บันทึกระบบ"
};
function getSheetName_(key) { return SHEET_NAMES[key] || key; }
function getSheetKey_(name) {
  var keys = Object.keys(SHEET_NAMES);
  for (var i = 0; i < keys.length; i++) if (SHEET_NAMES[keys[i]] === name) return keys[i];
  return name;
}

var COLORS = {
    NAVY: "#1E3A5F", BLUE: "#1E88E5", AMBER: "#F9A825", ORANGE: "#EF6C00",
    GREEN: "#2E7D32", BRIGHT_GREEN: "#43A047", INDIGO: "#3949AB", TEAL: "#00897B",
    RED: "#C62828", GRAY: "#607D8B", LIGHT_BACKGROUND: "#F5F7FA",
    LIGHT_RED: "#FDE7E9", LIGHT_AMBER: "#FFF6DE", LIGHT_GREEN: "#E8F3EC"
};
var FIELDS = {
    PRODUCTS: ["PRODUCT_CODE", "PRODUCT_NAME", "PROBLEM_GROUP", "SUITABLE_CUSTOMERS", "UNSUITABLE_CUSTOMERS",
        "PRICE_RANGE", "MAIN_FEATURES", "LIMITATIONS", "OFFICIAL_SOURCE", "VERIFIED_DATE",
        "DATA_STATUS", "CONTENT_LINK", "SOURCE_FILE_LINK", "NOTES"],
    PARTNERS: ["PARTNER_CODE", "PROGRAM_NAME", "RELATED_PRODUCT_CODE", "SIGNUP_LINK", "REFERRAL_LINK",
        "ATTRIBUTION_METHOD", "ATTRIBUTION_WINDOW", "COMMISSION_RATE", "REVERSAL_TERMS", "PAYMENT_CYCLE",
        "PROMOTION_LIMITS", "CONTACT_PERSON", "TERMS_SOURCE", "VERIFIED_DATE",
        "APPROVAL_STATUS", "SOURCE_FILE_LINK", "NOTES"],
    LEADS: ["LEAD_CODE", "RECEIVED_DATE", "EMAIL", "LEAD_SOURCE", "COMPANY_SIZE", "USER_COUNT",
        "PROBLEMS_TO_SOLVE", "CURRENT_TOOLS", "MONTHLY_BUDGET", "REQUIRED_CRITERIA",
        "IMPLEMENTATION_TIMELINE", "AI_RESULT", "RECOMMENDATION", "MISSING_INFO", "HANDLING_LEVEL",
        "APPROVAL_STATUS", "SENT_DATE", "NOTES"],
    COMMISSIONS: ["LEAD_CODE", "PARTNER_CODE", "TRANSACTION_CODE", "RECORDED_DATE", "STATUS",
        "ESTIMATED_COMMISSION", "APPROVED_COMMISSION", "AMOUNT_RECEIVED", "EXPECTED_PAYMENT_DATE",
        "RECONCILIATION_DIFFERENCE", "AMOUNT_OUTSTANDING", "REPORT_SOURCE", "NOTES"],
    SYSTEM_LOG: ["TIMESTAMP", "ACTION", "DETAILS", "RESULT"]
};
var STATUS = {
    PRODUCTS: ["รออนุมัติ", "ตรวจสอบแล้ว", "ต้องอัปเดต"],
    PARTNERS: ["รออนุมัติ", "อนุมัติ", "ต้องยืนยัน", "ไม่เข้าร่วม"],
    LEADS: ["ใหม่", "รออนุมัติ", "ต้องสอบถามเพิ่ม", "ส่งให้ผู้ดูแล", "อนุมัติ", "ส่งแล้ว"],
    LEVELS: ["ระดับ 1", "ระดับ 2", "ระดับ 3"],
    COMMISSIONS: ["บันทึกแล้ว", "เข้าเกณฑ์", "อนุมัติ", "ได้รับเงินแล้ว", "ถูกยกเลิกหรือเรียกคืน"]
};
var COLUMN_LABELS = {
  PRODUCTS: ["รหัสสินค้า", "ชื่อสินค้า", "กลุ่มปัญหา", "ลูกค้าที่เหมาะสม", "ลูกค้าที่ไม่เหมาะสม", "ช่วงราคา", "คุณสมบัติหลัก", "ข้อจำกัด", "แหล่งข้อมูลทางการ", "วันที่ตรวจสอบ", "สถานะข้อมูล", "ลิงก์เนื้อหา", "ลิงก์เอกสาร", "หมายเหตุ"],
  PARTNERS: ["รหัสพันธมิตร", "ชื่อโปรแกรม", "รหัสสินค้าที่เกี่ยวข้อง", "ลิงก์สมัคร", "ลิงก์แนะนำ", "วิธีบันทึก", "ระยะเวลาบันทึก", "อัตราค่าคอมมิชชัน", "เงื่อนไขการยกเลิก", "รอบชำระเงิน", "ข้อจำกัดการโปรโมต", "ผู้ติดต่อ", "แหล่งเงื่อนไข", "วันที่ตรวจสอบ", "สถานะอนุมัติ", "ลิงก์เอกสาร", "หมายเหตุ"],
  LEADS: ["รหัสลูกค้า", "วันที่รับ", "อีเมล", "แหล่งลูกค้า", "จำนวนพนักงาน", "จำนวนผู้ใช้", "ปัญหาที่ต้องแก้", "เครื่องมือปัจจุบัน", "งบประมาณต่อเดือน", "เกณฑ์ที่จำเป็น", "ระยะเวลาติดตั้ง", "ผลลัพธ์ AI", "คำแนะนำ", "ข้อมูลที่ขาด", "ระดับการดำเนินการ", "สถานะอนุมัติ", "วันที่ส่ง", "หมายเหตุ"],
  COMMISSIONS: ["รหัสลูกค้า", "รหัสพันธมิตร", "รหัสธุรกรรม", "วันที่บันทึก", "สถานะ", "ค่าคอมมิชชันโดยประมาณ", "ค่าคอมมิชชันที่อนุมัติ", "ยอดที่ได้รับ", "วันที่คาดว่าจะได้รับ", "ส่วนต่างกระทบยอด", "ยอดค้างรับ", "แหล่งรายงาน", "หมายเหตุ"],
  SYSTEM_LOG: ["เวลา", "การดำเนินการ", "รายละเอียด", "ผลลัพธ์"]
};
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("WEUP SoloSix — ระบบแนะนำ")
        .addItem("1. เริ่มต้นระบบ", "setupSystem")
        .addItem("2. นำเข้าข้อมูลการวิจัย (AI)", "importResearchData")
        .addItem("3. สร้างแบบฟอร์มความต้องการ", "createNeedsForm")
        .addItem("4. จำแนกลูกค้าใหม่ (AI)", "classifyNewLeads")
        .addItem("5. สร้างอีเมลร่างสำหรับลูกค้า", "createCustomerDrafts")
        .addItem("6. ทำเครื่องหมายว่าส่งแล้ว (แถวที่เลือก)", "markSelectedLeadSent")
        .addItem("7. นำเข้ารายงานค่าคอมมิชชัน", "importCommissionReport")
        .addItem("8. กระทบยอดค่าคอมมิชชัน", "reconcileCommissions")
        .addItem("9. ตรวจสอบความเสี่ยง", "checkRisks")
        .addItem("10. ตั้งเวลาอัตโนมัติ", "installAutomation")
        .addSeparator()
        .addItem("เปิดแดชบอร์ด", "openDashboard")
        .addItem("สร้างโครงสร้างโฟลเดอร์ไดรฟ์", "createDriveFolders")
        .addItem("ดูลิงก์ระบบ", "showSystemLinks")
        .addItem("ทดสอบการเชื่อมต่อ API", "testApiConnection")
        .addToUi();
}
function setupSystem() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    createSheet_(ss, "PRODUCTS", FIELDS.PRODUCTS, COLORS.TEAL);
    createSheet_(ss, "PARTNERS", FIELDS.PARTNERS, COLORS.INDIGO);
    createSheet_(ss, "LEADS", FIELDS.LEADS, COLORS.BLUE);
    createSheet_(ss, "COMMISSIONS", FIELDS.COMMISSIONS, COLORS.AMBER);
    createSheet_(ss, "SYSTEM_LOG", FIELDS.SYSTEM_LOG, COLORS.GRAY);
    applyDataValidation_(ss);
    applyWarningFormatting_(ss);
    ensureFolderStructure_();
    ["Sheet1", "ใบงานที่ 1"].forEach(function (sheetKey) {
        var defaultSheet = ss.getSheetByName(getSheetName_(sheetKey));
        if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1)
            ss.deleteSheet(defaultSheet);
    });
    logEvent_("เริ่มต้นระบบ", "สร้างและตรวจสอบชีตกับโฟลเดอร์", "สำเร็จ");
    SpreadsheetApp.getUi().alert("เริ่มต้นระบบเรียบร้อย\n\n" +
        "• ชีตข้อมูล 5 ชีตพร้อมใช้งาน\n" +
        "• เปิดแดชบอร์ดได้จากเมนู เปิดแดชบอร์ด\n" +
        "• สร้างโฟลเดอร์ RESEARCH_INBOX และ COMMISSION_INBOX ใน Google Drive แล้ว\n\n" +
        "ขั้นตอนถัดไป: เตรียมเอกสารชื่อ PRODUCT_<รหัส>_<ชื่อ> หรือ PARTNER_<รหัส>_<ชื่อ> " +
        "หรือกรอกไฟล์ RESEARCH_TEMPLATE แล้ววางใน RESEARCH_INBOX จากนั้นเรียกใช้ขั้นตอนที่ 2");
}
function createSheet_(ss, name, headers, tabColor) {
    var sheet = ss.getSheetByName(getSheetName_(name));
    if (!sheet)
        sheet = ss.insertSheet(getSheetName_(name));
    sheet.setTabColor(tabColor);
    var label = COLUMN_LABELS[name] || headers;
    var existingColumnCount = Math.max(sheet.getLastColumn(), 1);
    var headerRow = sheet.getRange(1, 1, 1, Math.max(existingColumnCount, headers.length)).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
        if (String(headerRow[i] || "") !== label[i])
            sheet.getRange(1, i + 1).setValue(label[i]);
    }
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(COLORS.NAVY).setFontColor("#FFFFFF").setFontWeight("bold")
        .setVerticalAlignment("middle").setWrap(true);
    sheet.setRowHeight(1, 34);
    sheet.setFrozenRows(1);
    if (!sheet.getFilter()) {
        sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).createFilter();
    }
}
function applyDataValidation_(ss) {
    setValidationList_(ss, "PRODUCTS", "DATA_STATUS", STATUS.PRODUCTS);
    setValidationList_(ss, "PARTNERS", "APPROVAL_STATUS", STATUS.PARTNERS);
    setValidationList_(ss, "LEADS", "APPROVAL_STATUS", STATUS.LEADS);
    setValidationList_(ss, "LEADS", "HANDLING_LEVEL", STATUS.LEVELS);
    setValidationList_(ss, "COMMISSIONS", "STATUS", STATUS.COMMISSIONS);
}
function setValidationList_(ss, sheetKey, columnName, items) {
    var sheet = ss.getSheetByName(getSheetName_(sheetKey));
    var column = FIELDS[sheetKey].indexOf(columnName) + 1;
    if (column < 1)
        return;
    var rules = SpreadsheetApp.newDataValidation()
        .requireValueInList(items, true).setAllowInvalid(false).build();
    sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setDataValidation(rules);
}
function applyWarningFormatting_(ss) {
    addColorRule_(ss, "PRODUCTS", "DATA_STATUS", [
        ["ต้องอัปเดต", COLORS.LIGHT_RED], ["รออนุมัติ", COLORS.LIGHT_AMBER], ["ตรวจสอบแล้ว", COLORS.LIGHT_GREEN]
    ]);
    addColorRule_(ss, "PARTNERS", "APPROVAL_STATUS", [
        ["ต้องยืนยัน", COLORS.LIGHT_AMBER], ["ไม่เข้าร่วม", COLORS.LIGHT_RED], ["อนุมัติ", COLORS.LIGHT_GREEN]
    ]);
    addColorRule_(ss, "LEADS", "APPROVAL_STATUS", [
        ["ส่งให้ผู้ดูแล", COLORS.LIGHT_RED], ["ต้องสอบถามเพิ่ม", COLORS.LIGHT_AMBER], ["ส่งแล้ว", COLORS.LIGHT_GREEN]
    ]);
    var sheet = ss.getSheetByName(getSheetName_("COMMISSIONS"));
    var rules = sheet.getConditionalFormatRules();
    var differenceColumn = FIELDS.COMMISSIONS.indexOf("RECONCILIATION_DIFFERENCE") + 1;
    var outstandingColumn = FIELDS.COMMISSIONS.indexOf("AMOUNT_OUTSTANDING") + 1;
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberNotEqualTo(0).setBackground(COLORS.LIGHT_RED)
        .setRanges([sheet.getRange(2, differenceColumn, sheet.getMaxRows() - 1, 1)]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(0).setBackground(COLORS.LIGHT_AMBER)
        .setRanges([sheet.getRange(2, outstandingColumn, sheet.getMaxRows() - 1, 1)]).build());
    sheet.setConditionalFormatRules(rules);
}
function addColorRule_(ss, sheetKey, columnName, valueColorPairs) {
    var sheet = ss.getSheetByName(getSheetName_(sheetKey));
    var column = FIELDS[sheetKey].indexOf(columnName) + 1;
    var vung = sheet.getRange(2, column, sheet.getMaxRows() - 1, 1);
    var rules = sheet.getConditionalFormatRules();
    valueColorPairs.forEach(function (pair) {
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo(pair[0]).setBackground(pair[1]).setRanges([vung]).build());
    });
    sheet.setConditionalFormatRules(rules);
}
function ensureFolderStructure_() {
    var properties = PropertiesService.getScriptProperties();
    var goc = findFolderByName_(null, CONFIG.ROOT_FOLDER_NAME);
    var researchInbox = findFolderByName_(goc, "RESEARCH_INBOX");
    var napHoaHong = findFolderByName_(goc, "COMMISSION_INBOX");
    var templateName = "COMMISSION_TEMPLATE.csv";
    var existing = napHoaHong.getFilesByName(templateName);
    var templateFile;
    if (existing.hasNext()) {
        templateFile = existing.next();
    }
    else {
        var contentText = "รหัสลูกค้า,รหัสพันธมิตร,รหัสธุรกรรม,วันที่บันทึก,สถานะ,ค่าคอมมิชชันโดยประมาณ,ค่าคอมมิชชันที่อนุมัติ,ยอดที่ได้รับ,วันที่คาดว่าจะได้รับ,แหล่งรายงาน,หมายเหตุ\n" +
            "LEAD-TEST,PARTNER-TEST,TX-TEST,01/08/2026,บันทึกแล้ว,5000,0,0,30/09/2026,รายงานพันธมิตร,แถวตัวอย่าง - ลบก่อนใช้งาน";
        templateFile = napHoaHong.createFile(templateName, contentText, MimeType.CSV);
    }
    properties.setProperties({
        ROOT_FOLDER_ID: goc.getId(), RESEARCH_INBOX_FOLDER_ID: researchInbox.getId(),
        COMMISSION_INBOX_FOLDER_ID: napHoaHong.getId(), COMMISSION_TEMPLATE_FILE_ID: templateFile.getId()
    });
    var researchTemplateId = properties.getProperty("RESEARCH_TEMPLATE_FILE_ID");
    var hasResearchTemplate = false;
    if (researchTemplateId) {
        try {
            DriveApp.getFileById(researchTemplateId).getName();
            hasResearchTemplate = true;
        }
        catch (e) { }
    }
    if (!hasResearchTemplate) {
        var researchTemplate = SpreadsheetApp.create("RESEARCH_TEMPLATE");
        var tabSP = researchTemplate.getSheets()[0];
        tabSP.setName(getSheetName_("PRODUCTS"));
        formatTemplateSheet_(tabSP, TEMPLATE_HEADERS.PRODUCTS, ["EXAMPLE-PRODUCT01", "ชื่อซอฟต์แวร์", "กลุ่มปัญหาที่แก้ไข", "ลูกค้าที่เหมาะสม", "ลูกค้าที่ไม่เหมาะสม",
            "ราคาต่อแพ็กเกจ", "คุณสมบัติหลัก", "ข้อจำกัดของแพ็กเกจ", "ลิงก์แหล่งข้อมูลทางการ", "19/08/2026",
            "แถวตัวอย่าง — รหัสที่ขึ้นต้นด้วย EXAMPLE จะไม่ถูกนำเข้า"]);
        formatTemplateSheet_(researchTemplate.insertSheet(getSheetName_("PARTNERS")), TEMPLATE_HEADERS.PARTNERS, ["EXAMPLE-PARTNER01", "ชื่อโปรแกรม", "EXAMPLE-PRODUCT01", "ลิงก์สมัคร", "ลิงก์แนะนำ (ถ้ามี)",
            "ลิงก์หรือแบบฟอร์มที่ใช้บันทึกการแนะนำ", "ระยะเวลาบันทึก", "อัตราค่าคอมมิชชัน", "เงื่อนไขการยกเลิกหรือเรียกคืน",
            "รอบชำระเงิน", "ข้อจำกัดการโปรโมต", "ผู้ติดต่อ", "ลิงก์หน้าข้อกำหนด", "19/08/2026",
            "แถวตัวอย่าง — รหัสที่ขึ้นต้นด้วย EXAMPLE จะไม่ถูกนำเข้า"]);
        DriveApp.getFileById(researchTemplate.getId()).moveTo(researchInbox);
        properties.setProperty("RESEARCH_TEMPLATE_FILE_ID", researchTemplate.getId());
    }
}
function formatTemplateSheet_(tab, headers, exampleRow) {
    tab.getRange(1, 1, 1, headers.length).setValues([headers])
        .setBackground(COLORS.NAVY).setFontColor("#FFFFFF").setFontWeight("bold").setWrap(true);
    tab.getRange(2, 1, 1, exampleRow.length).setValues([exampleRow])
        .setFontStyle("italic").setFontColor("#8A8FA0");
    tab.setFrozenRows(1);
    for (var c = 1; c <= headers.length; c++)
        tab.setColumnWidth(c, 170);
}
function createDriveFolders() {
    ensureFolderStructure_();
    logEvent_("สร้างโครงสร้างโฟลเดอร์ไดรฟ์", "WEUP_SOLOSIX_AFFILIATE_AI / RESEARCH_INBOX / COMMISSION_INBOX + ไฟล์ตัวอย่าง", "สำเร็จ");
    showSystemLinks();
}
function findFolderByName_(cha, name) {
    var ds = cha ? cha.getFoldersByName(name) : DriveApp.getFoldersByName(name);
    return ds.hasNext() ? ds.next() : (cha ? cha.createFolder(name) : DriveApp.createFolder(name));
}
function importResearchData() {
    var properties = PropertiesService.getScriptProperties();
    var folderId = properties.getProperty("RESEARCH_INBOX_FOLDER_ID");
    if (!folderId) {
        SpreadsheetApp.getUi().alert("ยังไม่มีโฟลเดอร์ RESEARCH_INBOX โปรดเรียกขั้นตอนที่ 1 ก่อน");
        return;
    }
    var folder = DriveApp.getFolderById(folderId);
    var ds = folder.getFiles();
    var productCount = 0, partnerCount = 0, errors = [];
    while (ds.hasNext()) {
        var file = ds.next();
        var name = file.getName();
        if (name.indexOf("IMPORTED_") === 0 || name.indexOf("TEMPLATE_") === 0 || name.indexOf("TEMP_CONVERTED_") === 0)
            continue;
        var loaiTep = file.getMimeType();
        var isSpreadsheet = loaiTep === MimeType.GOOGLE_SHEETS || loaiTep === MimeType.MICROSOFT_EXCEL ||
            loaiTep === MimeType.MICROSOFT_EXCEL_LEGACY || /\.xlsx?$/i.test(name);
        if (isSpreadsheet) {
            try {
                var workbookResult = importResearchWorkbook_(file);
                productCount += workbookResult.sp;
                partnerCount += workbookResult.dt;
                if (workbookResult.boQua.length)
                    errors.push(name + " — ข้าม " + workbookResult.boQua.length + " รายการ: " + workbookResult.boQua.join("; "));
                file.setName("IMPORTED_" + name);
            }
            catch (eBang) {
                errors.push(name + " — " + eBang.message);
                logEvent_("นำเข้าตารางสรุป", name, "ข้อผิดพลาด: " + eBang.message);
            }
            continue;
        }
        var matchResult = name.match(/^(PRODUCT|PARTNER)_([A-Za-z0-9\-]+)_/);
        if (!matchResult) {
            errors.push(name + " — เอกสาร Docs/TXT/Word/PDF/รูปภาพต้องตั้งชื่อ PRODUCT_<รหัส>_<ชื่อ> หรือ PARTNER_<รหัส>_<ชื่อ> " +
                "ส่วนไฟล์ Google Sheets/Excel ที่ใช้ RESEARCH_TEMPLATE ไม่ต้องใช้รูปแบบชื่อนี้ ระบบจึงข้ามไฟล์");
            continue;
        }
        try {
            var contentText = readFileContent_(file);
            if (!contentText || contentText.length < 50)
                throw new Error("เนื้อหาสั้นเกินไปหรืออ่านไม่ออก");
            var loai = matchResult[1].toUpperCase();
            var code = matchResult[2].toUpperCase();
            if (loai === "PRODUCT") {
                importProduct_(code, contentText, file.getUrl());
                productCount++;
            }
            else {
                importPartner_(code, contentText, file.getUrl());
                partnerCount++;
            }
            file.setName("IMPORTED_" + name);
        }
        catch (e) {
            errors.push(name + " — " + e.message);
            logEvent_("นำเข้าข้อมูลการวิจัย", name, "ข้อผิดพลาด: " + e.message);
        }
    }
    logEvent_("นำเข้าข้อมูลการวิจัย", productCount + " สินค้า, " + partnerCount + " พันธมิตร", errors.length ? errors.length + " ข้อผิดพลาด" : "สำเร็จ");
    var message = "นำเข้าแล้ว " + productCount + " สินค้า และ " + partnerCount + " พันธมิตร จากเอกสารและตารางสรุป\n\n" +
        "ข้อมูลใหม่ทั้งหมดอยู่ในสถานะรออนุมัติ โปรดตรวจแต่ละแถวกับแหล่งข้อมูล แล้วเปลี่ยนเป็น ตรวจสอบแล้ว สำหรับสินค้า หรือ อนุมัติ สำหรับพันธมิตร" +
        (errors.length ? "\n\nไฟล์หรือรายการที่ข้าม:\n• " + errors.join("\n• ") : "");
    SpreadsheetApp.getUi().alert(message);
}
function readFileContent_(file) {
    var loai = file.getMimeType();
    if (loai === MimeType.GOOGLE_DOCS)
        return DocumentApp.openById(file.getId()).getBody().getText();
    if (loai === MimeType.PLAIN_TEXT || loai === MimeType.CSV || /\.(txt|csv)$/i.test(file.getName())) {
        return file.getBlob().getDataAsString("UTF-8");
    }
    var convertible = loai === MimeType.MICROSOFT_WORD || loai === MimeType.MICROSOFT_WORD_LEGACY ||
        loai === MimeType.PDF || loai === MimeType.PNG || loai === MimeType.JPEG ||
        /\.(docx?|pdf|png|jpe?g)$/i.test(file.getName());
    if (!convertible) {
        throw new Error("ไม่รองรับรูปแบบไฟล์นี้ ระบบรองรับ Google Docs, TXT, Word, PDF, PNG/JPG และ Google Sheets/Excel ตามแม่แบบ RESEARCH_TEMPLATE");
    }
    var idTam = convertToGoogleDocs_(file);
    try {
        return DocumentApp.openById(idTam).getBody().getText();
    }
    finally {
        try {
            DriveApp.getFileById(idTam).setTrashed(true);
        }
        catch (e) { }
    }
}
function convertToGoogleDocs_(file) {
    var response = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + file.getId() + "/copy?ocrLanguage=th", {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        payload: JSON.stringify({ name: "TEMP_CONVERTED_" + file.getName(), mimeType: MimeType.GOOGLE_DOCS })
    });
    if (response.getResponseCode() !== 200) {
        throw new Error("อ่านไฟล์ไม่สำเร็จ (รหัส " + response.getResponseCode() +
            ") ทางเลือก: เปิดไฟล์ คัดลอกข้อความไปยัง Google Docs ชื่อเดิม แล้วนำเข้าอีกครั้ง");
    }
    return JSON.parse(response.getContentText()).id;
}
var TEMPLATE_IMPORT_SCHEMA = {
    PRODUCTS: { key: "PRODUCT_CODE", column: ["PRODUCT_NAME", "PROBLEM_GROUP", "SUITABLE_CUSTOMERS", "UNSUITABLE_CUSTOMERS",
            "PRICE_RANGE", "MAIN_FEATURES", "LIMITATIONS", "OFFICIAL_SOURCE"] },
    PARTNERS: { key: "PARTNER_CODE", column: ["PROGRAM_NAME", "RELATED_PRODUCT_CODE", "SIGNUP_LINK", "REFERRAL_LINK",
            "ATTRIBUTION_METHOD", "ATTRIBUTION_WINDOW", "COMMISSION_RATE", "REVERSAL_TERMS", "PAYMENT_CYCLE",
            "PROMOTION_LIMITS", "CONTACT_PERSON", "TERMS_SOURCE"] }
};
var TEMPLATE_HEADERS = {
  PRODUCTS: ["รหัสสินค้า", "ชื่อสินค้า", "กลุ่มปัญหา", "ลูกค้าที่เหมาะสม", "ลูกค้าที่ไม่เหมาะสม", "ช่วงราคา", "คุณสมบัติหลัก", "ข้อจำกัด", "แหล่งข้อมูลทางการ", "วันที่ตรวจสอบ", "หมายเหตุ"],
  PARTNERS: ["รหัสพันธมิตร", "ชื่อโปรแกรม", "รหัสสินค้าที่เกี่ยวข้อง", "ลิงก์สมัคร", "ลิงก์แนะนำ", "วิธีบันทึก", "ระยะเวลาบันทึก", "อัตราค่าคอมมิชชัน", "เงื่อนไขการยกเลิก", "รอบชำระเงิน", "ข้อจำกัดการโปรโมต", "ผู้ติดต่อ", "แหล่งเงื่อนไข", "วันที่ตรวจสอบ", "หมายเหตุ"]
};
function importResearchWorkbook_(file) {
    var idTam = null, spreadsheet;
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        spreadsheet = SpreadsheetApp.openById(file.getId());
    }
    else {
        idTam = convertExcelToSpreadsheet_(file);
        spreadsheet = SpreadsheetApp.openById(idTam);
    }
    var kq = { sp: 0, dt: 0, boQua: [] };
    try {
        kq.sp = importResearchSheet_(spreadsheet, "PRODUCTS", file.getUrl(), kq.boQua);
        kq.dt = importResearchSheet_(spreadsheet, "PARTNERS", file.getUrl(), kq.boQua);
        if (kq.sp === 0 && kq.dt === 0 && !kq.boQua.length) {
            throw new Error("ไม่เห็นแท็บสินค้าหรือพันธมิตรที่มีข้อมูล — ใช้ไฟล์เทมเพลตที่ถูกต้อง RESEARCH_TEMPLATE");
        }
    }
    finally {
        if (idTam) {
            try {
                DriveApp.getFileById(idTam).setTrashed(true);
            }
            catch (e) { }
        }
    }
    return kq;
}
function importResearchSheet_(spreadsheet, sheetKey, sourceFileLink, boQua) {
    var tab = spreadsheet.getSheetByName(getSheetName_(sheetKey));
    if (!tab || tab.getLastRow() < 2)
        return 0;
    var rawValues = tab.getDataRange().getValues();
    var viTri = {};
    rawValues[0].forEach(function (c, i) { viTri[columnNumber_(c)] = i; });
    var schema = TEMPLATE_IMPORT_SCHEMA[sheetKey];
    if (viTri[schema.key] === undefined) {
        boQua.push("ชีต " + getSheetName_(sheetKey) + " ขาดคอลัมน์ " + (COLUMN_LABELS[sheetKey][FIELDS[sheetKey].indexOf(schema.key)] || schema.key));
        return 0;
    }
    var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getSheetName_(sheetKey));
    var importedCount = 0;
    for (var d = 1; d < rawValues.length; d++) {
        var sourceRow = rawValues[d];
        var code = String(sourceRow[viTri[schema.key]] || "").trim().toUpperCase();
        if (!code)
            continue;
        if (code.indexOf("EXAMPLE") === 0)
            continue;
        var values = {};
        values[schema.key] = code;
        schema.column.forEach(function (column) {
            var o = viTri[column] !== undefined ? String(sourceRow[viTri[column]] || "").trim() : "";
            values[column] = o || "จำเป็นต้องตรวจสอบ";
        });
        if (sheetKey === "PARTNERS") {
            if (values.REFERRAL_LINK === "จำเป็นต้องตรวจสอบ")
                values.REFERRAL_LINK = "";
            if (values.CONTACT_PERSON === "จำเป็นต้องตรวจสอบ")
                values.CONTACT_PERSON = "";
            if (values.RELATED_PRODUCT_CODE === "จำเป็นต้องตรวจสอบ")
                values.RELATED_PRODUCT_CODE = "";
        }
        var sourceDate = viTri.VERIFIED_DATE !== undefined ? sourceRow[viTri.VERIFIED_DATE] : "";
        values.VERIFIED_DATE = parseDate_(sourceDate) ? formatDate_(sourceDate) : today_();
        if (viTri.NOTES !== undefined && String(sourceRow[viTri.NOTES] || "").trim()) {
            values.NOTES = String(sourceRow[viTri.NOTES]).trim();
        }
        values[sheetKey === "PRODUCTS" ? "DATA_STATUS" : "APPROVAL_STATUS"] = "รออนุมัติ";
        values.SOURCE_FILE_LINK = sourceFileLink;
        upsertRow_(targetSheet, FIELDS[sheetKey], schema.key, code, values);
        importedCount++;
    }
    return importedCount;
}
function convertExcelToSpreadsheet_(file) {
    var response = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + file.getId() + "/copy", {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        payload: JSON.stringify({ name: "TEMP_CONVERTED_" + file.getName(), mimeType: MimeType.GOOGLE_SHEETS })
    });
    if (response.getResponseCode() !== 200) {
        throw new Error("แปลง Excel เป็น Google Sheets ไม่สำเร็จ (รหัส " + response.getResponseCode() +
            ") ทางเลือก: เปิดไฟล์ใน Drive แล้วบันทึกเป็น Google Sheets ก่อนนำเข้าอีกครั้ง");
    }
    return JSON.parse(response.getContentText()).id;
}
function importProduct_(code, contentText, sourceFileLink) {
    var prompt = "คุณกำลังอ่านข้อมูลวิจัยผลิตภัณฑ์จากแหล่งข้อมูลทางการ " +
        "ใช้เฉพาะข้อมูลในเอกสารด้านล่าง ห้ามเติมคุณสมบัติ ราคา หรือข้อสรุปจากความรู้ภายนอก " +
        "หากเอกสารไม่มีหลักฐานเพียงพอ ให้ใส่ข้อความ \"ต้องตรวจสอบ\" " +
        "ห้ามใส่อัตราค่าคอมมิชชันหรือข้อมูลโปรแกรมพันธมิตรในฟิลด์ผลิตภัณฑ์ " +
        "ตอบกลับเป็นออบเจ็กต์ JSON เดียวเท่านั้น ห้ามใช้ Markdown หรือใส่ข้อความอื่น:" +
        "{\"product_name\":\"\",\"problem_group\":\"\",\"suitable_customers\":\"\",\"unsuitable_customers\":\"\"," +
        "\"price_range\":\"\",\"main_features\":\"\",\"limitations\":\"\",\"official_source\":\"\",\"notes\":\"\"}\n\n" +
        "--- ไฟล์ ---" + contentText.substring(0, 30000);
    var kq = parseJson_(callAi_(prompt));
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(getSheetName_("PRODUCTS"));
    var values = {
        PRODUCT_CODE: code, PRODUCT_NAME: kq.product_name || "จำเป็นต้องตรวจสอบ",
        PROBLEM_GROUP: kq.problem_group || "จำเป็นต้องตรวจสอบ", SUITABLE_CUSTOMERS: kq.suitable_customers || "จำเป็นต้องตรวจสอบ",
        UNSUITABLE_CUSTOMERS: kq.unsuitable_customers || "จำเป็นต้องตรวจสอบ", PRICE_RANGE: kq.price_range || "จำเป็นต้องตรวจสอบ",
        MAIN_FEATURES: kq.main_features || "จำเป็นต้องตรวจสอบ", LIMITATIONS: kq.limitations || "จำเป็นต้องตรวจสอบ",
        OFFICIAL_SOURCE: kq.official_source || "จำเป็นต้องตรวจสอบ",
        VERIFIED_DATE: today_(), DATA_STATUS: "รออนุมัติ",
        SOURCE_FILE_LINK: sourceFileLink, NOTES: kq.notes || ""
    };
    upsertRow_(sheet, FIELDS.PRODUCTS, "PRODUCT_CODE", code, values);
}
function importPartner_(code, contentText, sourceFileLink) {
    var prompt = "คุณกำลังอ่านข้อกำหนดและเงื่อนไขของโปรแกรมพันธมิตรจากแหล่งข้อมูลทางการ " +
        "ใช้เฉพาะข้อมูลในเอกสารด้านล่าง ช่องที่ไม่มีหลักฐานให้ใส่ข้อความ \"ต้องตรวจสอบ\" " +
        "ตอบกลับเป็นออบเจ็กต์ JSON เดียวเท่านั้น ห้ามใช้ Markdown หรือใส่ข้อความอื่น:" +
        "{\"program_name\":\"\",\"related_product_code\":\"\",\"signup_link\":\"\",\"attribution_method\":\"\"," +
        "\"attribution_window\":\"\",\"commission_rate\":\"\",\"reversal_terms\":\"\",\"payment_cycle\":\"\"," +
        "\"promotion_limits\":\"\",\"contact_person\":\"\",\"terms_source\":\"\",\"notes\":\"\"}\n\n" +
        "--- เอกสารข้อกำหนด ---" + contentText.substring(0, 30000);
    var kq = parseJson_(callAi_(prompt));
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(getSheetName_("PARTNERS"));
    var values = {
        PARTNER_CODE: code, PROGRAM_NAME: kq.program_name || "จำเป็นต้องตรวจสอบ",
        RELATED_PRODUCT_CODE: kq.related_product_code || "", SIGNUP_LINK: kq.signup_link || "จำเป็นต้องตรวจสอบ",
        ATTRIBUTION_METHOD: kq.attribution_method || "จำเป็นต้องตรวจสอบ", ATTRIBUTION_WINDOW: kq.attribution_window || "จำเป็นต้องตรวจสอบ",
        COMMISSION_RATE: kq.commission_rate || "จำเป็นต้องตรวจสอบ", REVERSAL_TERMS: kq.reversal_terms || "จำเป็นต้องตรวจสอบ",
        PAYMENT_CYCLE: kq.payment_cycle || "จำเป็นต้องตรวจสอบ", PROMOTION_LIMITS: kq.promotion_limits || "จำเป็นต้องตรวจสอบ",
        CONTACT_PERSON: kq.contact_person || "", TERMS_SOURCE: kq.terms_source || "จำเป็นต้องตรวจสอบ",
        VERIFIED_DATE: today_(), APPROVAL_STATUS: "รออนุมัติ",
        SOURCE_FILE_LINK: sourceFileLink, NOTES: kq.notes || ""
    };
    upsertRow_(sheet, FIELDS.PARTNERS, "PARTNER_CODE", code, values);
}
function createNeedsForm() {
    var properties = PropertiesService.getScriptProperties();
    if (properties.getProperty("NEEDS_FORM_ID")) {
        SpreadsheetApp.getUi().alert("มีแบบฟอร์มอยู่แล้ว ดูลิงก์ได้จากเมนู ดูลิงก์ระบบ\n" +
            "หากต้องการสร้างใหม่ ให้ลบค่า NEEDS_FORM_ID ใน Script Properties แล้วเรียกขั้นตอนนี้อีกครั้ง");
        return;
    }
    var form = FormApp.create("แบบฟอร์มคำขอเลือกซอฟต์แวร์")
        .setDescription("กรุณาตอบคำถาม 7 ข้อด้านล่าง ระบบจะเปรียบเทียบความต้องการกับข้อมูลผลิตภัณฑ์ที่ตรวจสอบแล้ว " +
        "เพื่อจัดทำตัวเลือกที่เหมาะกับบริบทธุรกิจของคุณ");
    try {
        form.setCollectEmail(true);
    }
    catch (e) { }
    form.addTextItem().setTitle("ธุรกิจของคุณมีพนักงานกี่คน?").setRequired(true);
    form.addTextItem().setTitle("จะมีคนใช้ซอฟต์แวร์นี้โดยตรงกี่คน?").setRequired(true);
    form.addParagraphTextItem().setTitle("คุณต้องการซอฟต์แวร์อะไรในการแก้ปัญหา? (รายการโดยเฉพาะ)").setRequired(true);
    form.addTextItem().setTitle("คุณกำลังจัดการเครื่องมือใดอยู่ในปัจจุบัน?").setRequired(true);
    form.addTextItem().setTitle("งบประมาณสูงสุดต่อเดือน (บาท)?").setRequired(true);
    form.addParagraphTextItem().setTitle("คุณสมบัติใดบ้างที่ต้องมี?").setRequired(true);
    form.addTextItem().setTitle("คุณต้องการปรับใช้นานแค่ไหน?").setRequired(true);
    try {
        var goc = DriveApp.getFolderById(properties.getProperty("ROOT_FOLDER_ID"));
        DriveApp.getFileById(form.getId()).moveTo(goc);
    }
    catch (e) { }
    ScriptApp.getProjectTriggers().forEach(function (t) {
        if (t.getHandlerFunction() === "handleNeedsFormSubmit")
            ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger("handleNeedsFormSubmit").forForm(form).onFormSubmit().create();
    properties.setProperties({ NEEDS_FORM_ID: form.getId(), NEEDS_FORM_EDIT_URL: form.getEditUrl(), NEEDS_FORM_PUBLIC_URL: form.getPublishedUrl() });
    logEvent_("สร้างแบบฟอร์ม", form.getPublishedUrl(), "สำเร็จ");
    SpreadsheetApp.getUi().alert("สร้างแบบฟอร์ม 7 ข้อและติดตั้งทริกเกอร์แล้ว\n" +
        "ลิงก์สำหรับส่งให้ลูกค้า: " + form.getPublishedUrl() + "\n\n" +
        "คำตอบแต่ละชุดจะสร้างแถวใหม่ในชีตลูกค้าพร้อมรหัสเฉพาะ");
}
function handleNeedsFormSubmit(e) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(getSheetName_("LEADS"));
        var answers = e.response.getItemResponses().map(function (r) { return String(r.getResponse()); });
        var email = "";
        try {
            email = e.response.getRespondentEmail() || "";
        }
        catch (err) { }
        var leadCode = "LEAD-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyMMddHHmmss");
        var values = {
            LEAD_CODE: leadCode, RECEIVED_DATE: today_(), EMAIL: email, LEAD_SOURCE: "แบบฟอร์มความต้องการ",
            COMPANY_SIZE: answers[0] || "", USER_COUNT: answers[1] || "",
            PROBLEMS_TO_SOLVE: answers[2] || "", CURRENT_TOOLS: answers[3] || "",
            MONTHLY_BUDGET: answers[4] || "", REQUIRED_CRITERIA: answers[5] || "",
            IMPLEMENTATION_TIMELINE: answers[6] || "", APPROVAL_STATUS: "ใหม่"
        };
        var row = FIELDS.LEADS.map(function (c) { return values[c] !== undefined ? values[c] : ""; });
        sheet.appendRow(row);
        logEvent_("รับการตอบกลับแบบฟอร์ม", leadCode + " — " + email, "สำเร็จ");
    }
    catch (err) {
        logEvent_("รับการตอบกลับแบบฟอร์ม", "", "ข้อผิดพลาด: " + err.message);
    }
}
function classifyNewLeads() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var leadSheet = ss.getSheetByName(getSheetName_("LEADS"));
    var productSheet = ss.getSheetByName(getSheetName_("PRODUCTS"));
    if (!leadSheet || !productSheet) {
        SpreadsheetApp.getUi().alert("รันรายการที่ 1 ก่อน");
        return;
    }
    var dsSP = readRows_(productSheet, FIELDS.PRODUCTS);
    var homNay = new Date();
    var spHopLe = [], staleProducts = 0;
    dsSP.forEach(function (sp) {
        if (sp.DATA_STATUS !== "ตรวจสอบแล้ว")
            return;
        var date = parseDate_(sp.VERIFIED_DATE);
        if (!date || (homNay - date) / 86400000 > CONFIG.STALE_AFTER_DAYS) {
            productSheet.getRange(sp._row, FIELDS.PRODUCTS.indexOf("DATA_STATUS") + 1).setValue("ต้องอัปเดต");
            staleProducts++;
            return;
        }
        spHopLe.push({
            PRODUCT_CODE: sp.PRODUCT_CODE, PRODUCT_NAME: sp.PRODUCT_NAME, PROBLEM_GROUP: sp.PROBLEM_GROUP,
            SUITABLE_CUSTOMERS: sp.SUITABLE_CUSTOMERS, UNSUITABLE_CUSTOMERS: sp.UNSUITABLE_CUSTOMERS,
            PRICE_RANGE: sp.PRICE_RANGE, MAIN_FEATURES: sp.MAIN_FEATURES, LIMITATIONS: sp.LIMITATIONS
        });
    });
    if (!spHopLe.length) {
        SpreadsheetApp.getUi().alert("ไม่มีสินค้าที่อยู่ในสถานะ ตรวจสอบแล้ว และตรวจล่าสุดไม่เกิน " +
            CONFIG.STALE_AFTER_DAYS + " วัน" + (staleProducts ? "\nระบบเปลี่ยนสินค้า " + staleProducts + " รายการเป็น ต้องอัปเดต" : "") +
            "\nโปรดอัปเดตและตรวจสอบข้อมูลสินค้าก่อนจำแนกลูกค้า");
        return;
    }
    var dsKH = readRows_(leadSheet, FIELDS.LEADS).filter(function (k) { return k.APPROVAL_STATUS === "ใหม่"; });
    if (!dsKH.length) {
        SpreadsheetApp.getUi().alert("ไม่มีลูกค้าใหม่ที่รอการจำแนก");
        return;
    }
    var validProductCodes = {};
    spHopLe.forEach(function (sp) { validProductCodes[String(sp.PRODUCT_CODE).toUpperCase()] = true; });
    var processedCount = 0, errorCount = 0;
    dsKH.forEach(function (kh) {
        try {
            var kq = parseJson_(callAi_(buildClassificationPrompt_(kh, spHopLe)));
            var mucXuLy = STATUS.LEVELS.indexOf(kq.handling_level) >= 0 ? kq.handling_level : "ระดับ 2";
            var choicesList = (kq.choices || []).slice(0, 3);
            choicesList.forEach(function (lc) {
                if (!validProductCodes[String(lc.product_code || "").toUpperCase()]) {
                    throw new Error("AI ส่งคืนรหัสสินค้าที่ไม่มีอยู่ในรายการ: " + lc.product_code);
                }
            });
            var newStatus = mucXuLy === "ระดับ 1" ? "รออนุมัติ" : (mucXuLy === "ระดับ 2" ? "ต้องสอบถามเพิ่ม" : "ส่งให้ผู้ดูแล");
            var recommendation = choicesList.map(function (lc) { return lc.product_code; }).join("; ");
            var missingInfo = (kq.missing_info || []).join("; ");
            writeCell_(leadSheet, kh._row, "AI_RESULT", JSON.stringify(kq));
            writeCell_(leadSheet, kh._row, "RECOMMENDATION", recommendation);
            writeCell_(leadSheet, kh._row, "MISSING_INFO", missingInfo);
            writeCell_(leadSheet, kh._row, "HANDLING_LEVEL", mucXuLy);
            writeCell_(leadSheet, kh._row, "APPROVAL_STATUS", newStatus);
            processedCount++;
        }
        catch (e) {
            writeCell_(leadSheet, kh._row, "NOTES", "จำแนกไม่สำเร็จ: " + e.message);
            logEvent_("จำแนกลูกค้า", kh.LEAD_CODE, "ข้อผิดพลาด: " + e.message);
            errorCount++;
        }
    });
    logEvent_("จำแนกลูกค้าใหม่", processedCount + " ราย", errorCount ? errorCount + " ข้อผิดพลาด" : "สำเร็จ");
    SpreadsheetApp.getUi().alert("จำแนกลูกค้าแล้ว " + processedCount + " ราย" + (errorCount ? " และพบข้อผิดพลาด " + errorCount + " รายการ (ดูหมายเหตุและบันทึกระบบ)" : "") + "\n\n" +
        "ระดับ 1 → รออนุมัติ: โปรดอ่านเหตุผลก่อนดำเนินการต่อ\n" +
        "ระดับ 2 → ต้องสอบถามเพิ่ม: ระบบจะสร้างอีเมลขอข้อมูล ห้ามคาดเดา\n" +
        "ระดับ 3 → ส่งให้ผู้ดูแล: ผู้ดูแลดำเนินการโดยตรง ระบบไม่สร้างอีเมลแนะนำ");
}
function buildClassificationPrompt_(kh, dsSP) {
    return "คุณช่วยจำแนกความต้องการซื้อซอฟต์แวร์สำหรับธุรกิจขนาดเล็ก " +
        "ใช้เฉพาะข้อมูลสินค้าที่ให้ไว้ด้านล่าง รายการนี้ไม่มีข้อมูลค่าคอมมิชชันและห้ามใช้ผลประโยชน์ทางการค้าในการให้คะแนน " +
        "ห้ามใช้คำว่า ดีที่สุด อันดับหนึ่ง เหมาะสมที่สุด หรือประหยัดที่สุด " +
        "หากข้อมูลลูกค้าไม่เพียงพอ เช่น ขาดขนาดองค์กร งบประมาณ หรือเกณฑ์จำเป็น ห้ามคาดเดา ให้ตั้ง handling_level เป็น ระดับ 2 และระบุ missing_info " +
        "หากต้องย้ายข้อมูลจากระบบเดิม มีการเชื่อมต่อซับซ้อน ข้อมูลละเอียดอ่อน หรือสัญญาระยะยาวมูลค่าสูง ให้ตั้ง handling_level เป็น ระดับ 3 " +
        "กรณีอื่นให้ตั้ง handling_level เป็น ระดับ 1 และเลือกสินค้าไม่เกิน 3 รายการ โดยใช้เฉพาะ product_code ที่อยู่ในรายการ " +
        "ตอบกลับเป็นออบเจ็กต์ JSON เดียวเท่านั้น ห้ามใช้ Markdown หรือใส่ข้อความอื่น:" +
        "{\"handling_level\":\"ระดับ 1\",\"classification_reason\":\"\"," +
        "\"choices\":[{\"product_code\":\"\",\"reasons\":[\"\",\"\",\"\"],\"concerns\":\"\",\"exclusion_condition\":\"\"}]," +
        "\"missing_info\":[\"\"]}\n\n" +
        "--- ความต้องการของลูกค้า ---\n" +
        "จำนวนพนักงาน: " + kh.COMPANY_SIZE + "\n" +
        "จำนวนผู้ใช้: " + kh.USER_COUNT + "\n" +
        "ปัญหาที่ต้องแก้: " + kh.PROBLEMS_TO_SOLVE + "\n" +
        "เครื่องมือปัจจุบัน: " + kh.CURRENT_TOOLS + "\n" +
        "งบประมาณต่อเดือน: " + kh.MONTHLY_BUDGET + "\n" +
        "เกณฑ์จำเป็น: " + kh.REQUIRED_CRITERIA + "\n" +
        "ระยะเวลาติดตั้ง: " + kh.IMPLEMENTATION_TIMELINE + "\n\n" +
        "--- รายการสินค้าที่ตรวจสอบแล้ว (ไม่มีข้อมูลค่าคอมมิชชัน) ---\n" +
        JSON.stringify(dsSP);
}
function createCustomerDrafts() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var leadSheet = ss.getSheetByName(getSheetName_("LEADS"));
    var dsKH = readRows_(leadSheet, FIELDS.LEADS);
    var dsSP = readRows_(ss.getSheetByName(getSheetName_("PRODUCTS")), FIELDS.PRODUCTS);
    var dsDT = readRows_(ss.getSheetByName(getSheetName_("PARTNERS")), FIELDS.PARTNERS);
    var productName = {};
    dsSP.forEach(function (sp) { productName[String(sp.PRODUCT_CODE).toUpperCase()] = sp.PRODUCT_NAME; });
    var referralByProduct = {};
    dsDT.forEach(function (dt) {
        if (dt.APPROVAL_STATUS !== "อนุมัติ")
            return;
        String(dt.RELATED_PRODUCT_CODE || "").split(/[,;]+/).forEach(function (code) {
            code = code.trim().toUpperCase();
            if (code && !referralByProduct[code])
                referralByProduct[code] = dt.REFERRAL_LINK || "";
        });
    });
    var adviceCount = 0, followupCount = 0, boQua = [];
    dsKH.forEach(function (kh) {
        if (kh.SENT_DATE)
            return;
        if (!kh.EMAIL) {
            if (kh.APPROVAL_STATUS === "อนุมัติ" || kh.APPROVAL_STATUS === "ต้องสอบถามเพิ่ม") {
                boQua.push(kh.LEAD_CODE + " (ไม่มีอีเมล)");
            }
            return;
        }
        if (kh.APPROVAL_STATUS === "อนุมัติ") {
            var kq;
            try {
                kq = JSON.parse(kh.AI_RESULT || "{}");
            }
            catch (e) {
                boQua.push(kh.LEAD_CODE + " (ข้อมูล AI_RESULT ไม่ใช่ JSON ที่ถูกต้อง)");
                return;
            }
            var part = [];
            (kq.choices || []).slice(0, 3).forEach(function (lc, i) {
                var code = String(lc.product_code || "").toUpperCase();
                var sections = "<p style=\"margin:14px 0 4px\"><b>" + (i + 1) + ". " + (productName[code] || code) + "</b></p>" +
                    "<ul style=\"margin:0 0 4px 18px\">" +
                    (lc.reasons || []).map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" +
                    (lc.concerns ? "<p style=\"margin:2px 0\"><i>สิ่งที่ควรพิจารณา:</i>" + lc.concerns + "</p>" : "");
                if (referralByProduct[code]) {
                    sections += "<p style=\"margin:2px 0\">สมัคร/ลอง: <a href=\"" + referralByProduct[code] + "\">" + referralByProduct[code] + "</a></p>";
                }
                else {
                    sections += "<p style=\"margin:2px 0;color:#C62828\">[ไม่มีลิงก์พันธมิตรอนุมัติสำหรับผลิตภัณฑ์นี้ — เพิ่มก่อนส่ง]</p>";
                }
                part.push(sections);
            });
            var contentText = "<p>สวัสดี</p>" +
                "<p>จากความต้องการที่คุณส่งมา (จำนวนพนักงาน " + kh.COMPANY_SIZE + " คน งบประมาณ " + kh.MONTHLY_BUDGET +
                " บาทต่อเดือน) ด้านล่างคือตัวเลือกที่สอดคล้องกับข้อมูลที่เราตรวจสอบ:</p>" +
                part.join("") +
                "<p style=\"margin-top:14px\">คำแนะนำข้างต้นอ้างอิงเกณฑ์ที่คุณระบุและข้อมูลที่ตรวจสอบล่าสุด " +
                "หากต้องการข้อมูลเพิ่มเติมก่อนตัดสินใจ โปรดตอบกลับอีเมลนี้</p>" +
                "<p>ขอแสดงความนับถือ<br>[ชื่อของคุณ]</p>";
            GmailApp.createDraft(kh.EMAIL, "เปรียบเทียบตัวเลือกซอฟต์แวร์สำหรับธุรกิจของคุณ — " + kh.LEAD_CODE, "", { htmlBody: contentText });
            writeCell_(leadSheet, kh._row, "NOTES", "สร้างอีเมลร่างสำหรับคำแนะนำแล้ว " + currentTime_());
            adviceCount++;
        }
        if (kh.APPROVAL_STATUS === "ต้องสอบถามเพิ่ม") {
            var questions = String(kh.MISSING_INFO || "ข้อมูลเพิ่มเติมเกี่ยวกับความต้องการของคุณ")
                .split(/;\s*/).filter(String).map(function (c) { return "<li>" + c + "</li>"; }).join("");
            var emailMessage = "<p>สวัสดี</p>" +
                "<p>ขอขอบคุณสำหรับการส่งคำขอของคุณ เพื่อการเปรียบเทียบที่แม่นยำแทนที่จะคาดเดา เราต้องการให้คุณเพิ่ม:</p>" +
                "<ul style=\"margin:0 0 8px 18px\">" + questions + "</ul>" +
                "<p>หากคุณตอบกลับจดหมายฉบับนี้โดยตรงก็เพียงพอแล้ว</p><p>ขอแสดงความนับถือ<br>[ชื่อของคุณ]</p>";
            GmailApp.createDraft(kh.EMAIL, "โปรดให้ข้อมูลเพิ่มเติมเพื่อขอคำแนะนำที่ถูกต้อง —" + kh.LEAD_CODE, "", { htmlBody: emailMessage });
            writeCell_(leadSheet, kh._row, "NOTES", "สร้างอีเมลร่างเพื่อขอข้อมูลเพิ่มเติมแล้ว " + currentTime_());
            followupCount++;
        }
    });
    logEvent_("สร้างอีเมลร่าง", adviceCount + " อีเมลแนะนำ, " + followupCount + " อีเมลขอข้อมูลเพิ่ม", "สำเร็จ");
    SpreadsheetApp.getUi().alert("สร้างอีเมลร่างใน Gmail แล้ว: คำแนะนำ " + adviceCount + " ฉบับ และขอข้อมูลเพิ่ม " + followupCount + " ฉบับ\n\n" +
        "ระบบยังไม่ได้ส่งอีเมล โปรดเปิด Gmail ตรวจผู้รับ ลิงก์ และข้อความก่อนกดส่งด้วยตนเอง\n" +
        "หลังส่งแล้ว ให้เลือกแถวลูกค้าและเรียกขั้นตอนที่ 6 เพื่อทำเครื่องหมายว่าส่งแล้ว" +
        (boQua.length ? "\n\nรายการที่ข้าม: " + boQua.join("; ") : ""));
}
function markSelectedLeadSent() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    if (sheet.getName() !== getSheetName_("LEADS")) {
        SpreadsheetApp.getUi().alert("โปรดเปิดชีตลูกค้าและเลือกแถวที่ต้องการก่อน");
        return;
    }
    var row = sheet.getActiveRange().getRow();
    if (row < 2) {
        SpreadsheetApp.getUi().alert("โปรดเลือกแถวข้อมูลลูกค้า ตั้งแต่แถวที่ 2 ลงไป");
        return;
    }
    var leadCode = sheet.getRange(row, FIELDS.LEADS.indexOf("LEAD_CODE") + 1).getValue();
    var confirmed = SpreadsheetApp.getUi().alert("ยืนยันว่าคุณส่งอีเมลให้ลูกค้า " + leadCode + " ใน Gmail แล้วใช่หรือไม่?", SpreadsheetApp.getUi().ButtonSet.YES_NO);
    if (confirmed !== SpreadsheetApp.getUi().Button.YES)
        return;
    writeCell_(sheet, row, "APPROVAL_STATUS", "ส่งแล้ว");
    writeCell_(sheet, row, "SENT_DATE", today_());
    logEvent_("ทำเครื่องหมายว่าส่งแล้ว", String(leadCode), "สำเร็จ");
}
function importCommissionReport() {
    var properties = PropertiesService.getScriptProperties();
    var folderId = properties.getProperty("COMMISSION_INBOX_FOLDER_ID");
    if (!folderId) {
        SpreadsheetApp.getUi().alert("ยังไม่มีโฟลเดอร์ COMMISSION_INBOX โปรดเรียกขั้นตอนที่ 1 ก่อน");
        return;
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(getSheetName_("COMMISSIONS"));
    var folder = DriveApp.getFolderById(folderId);
    var ds = folder.getFiles();
    var newCountValue = 0, updatedCount = 0, fileCount = 0, errors = [];
    while (ds.hasNext()) {
        var file = ds.next();
        var name = file.getName();
        if (name.indexOf("IMPORTED_") === 0 || name === "COMMISSION_TEMPLATE.csv")
            continue;
        if (!/\.csv$/i.test(name) && file.getMimeType() !== MimeType.CSV) {
            errors.push(name + " — ไม่ใช่ไฟล์ CSV ระบบจึงข้าม");
            continue;
        }
        try {
            var spreadsheet = Utilities.parseCsv(file.getBlob().getDataAsString("UTF-8"));
            if (spreadsheet.length < 2)
                throw new Error("ไฟล์ไม่มีแถวข้อมูล");
            var viTri = {};
            spreadsheet[0].forEach(function (c, i) { viTri[columnNumber_(c)] = i; });
            ["PARTNER_CODE", "TRANSACTION_CODE"].forEach(function (bd) {
                if (viTri[bd] === undefined)
                    throw new Error("ขาดคอลัมน์ที่จำเป็น: " + bd);
            });
            for (var d = 1; d < spreadsheet.length; d++) {
                var h = spreadsheet[d];
                if (!h.join("").trim())
                    continue;
                var retrieved = function (c) { return viTri[c] !== undefined ? String(h[viTri[c]]).trim() : ""; };
                var values = {
                    LEAD_CODE: retrieved("LEAD_CODE"), PARTNER_CODE: retrieved("PARTNER_CODE"), TRANSACTION_CODE: retrieved("TRANSACTION_CODE"),
                    RECORDED_DATE: retrieved("RECORDED_DATE"), STATUS: retrieved("STATUS") || "บันทึกแล้ว",
                    ESTIMATED_COMMISSION: toAmount_(retrieved("ESTIMATED_COMMISSION")), APPROVED_COMMISSION: toAmount_(retrieved("APPROVED_COMMISSION")),
                    AMOUNT_RECEIVED: toAmount_(retrieved("AMOUNT_RECEIVED")), EXPECTED_PAYMENT_DATE: retrieved("EXPECTED_PAYMENT_DATE"),
                    REPORT_SOURCE: retrieved("REPORT_SOURCE") || name, NOTES: retrieved("NOTES")
                };
                var key = values.PARTNER_CODE.toUpperCase() + "|" + values.TRANSACTION_CODE.toUpperCase();
                var result = upsertRow_(sheet, FIELDS.COMMISSIONS, "_COMMISSION_KEY", key, values);
                if (result === "CREATED")
                    newCountValue++;
                else
                    updatedCount++;
            }
            file.setName("IMPORTED_" + name);
            fileCount++;
        }
        catch (e) {
            errors.push(name + " — " + e.message);
        }
    }
    logEvent_("นำเข้ารายงานค่าคอมมิชชัน", fileCount + " ไฟล์: ใหม่ " + newCountValue + " แถว อัปเดต " + updatedCount + " แถว", errors.length ? errors.length + " ข้อผิดพลาด" : "สำเร็จ");
    SpreadsheetApp.getUi().alert("นำเข้าแล้ว " + fileCount + " ไฟล์: ธุรกรรมใหม่ " + newCountValue + " รายการ และอัปเดต " + updatedCount + " รายการ\n" +
        "โปรดดำเนินการขั้นตอนที่ 8 เพื่อกระทบยอด" + (errors.length ? "\n\nข้อผิดพลาด:\n• " + errors.join("\n• ") : ""));
}
function reconcileCommissions() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(getSheetName_("COMMISSIONS"));
    if (!sheet || sheet.getLastRow() < 2) {
        notifyOrEmail_("กระทบยอดค่าคอมมิชชัน", "ยังไม่มีข้อมูลค่าคอมมิชชัน");
        return;
    }
    var ds = readRows_(sheet, FIELDS.COMMISSIONS);
    var differenceCount = 0, outstandingCount = 0, totalEstimated = 0, totalApproved = 0, totalReceived = 0;
    ds.forEach(function (h) {
        var estimated = toAmount_(h.ESTIMATED_COMMISSION), approved = toAmount_(h.APPROVED_COMMISSION), received = toAmount_(h.AMOUNT_RECEIVED);
        var lech = estimated - approved, outstandingAmount = approved - received;
        writeCell_(sheet, h._row, "RECONCILIATION_DIFFERENCE", lech);
        writeCell_(sheet, h._row, "AMOUNT_OUTSTANDING", outstandingAmount);
        if (lech !== 0)
            differenceCount++;
        if (outstandingAmount > 0)
            outstandingCount++;
        totalEstimated += estimated;
        totalApproved += approved;
        totalReceived += received;
    });
    var report = "รายงานกระทบยอดค่าคอมมิชชัน — " + currentTime_() + "\n\n" +
        "ค่าคอมมิชชันโดยประมาณ: " + formatThb_(totalEstimated) + "\n" +
        "ค่าคอมมิชชันที่อนุมัติ: " + formatThb_(totalApproved) + "\n" +
        "ยอดที่ได้รับ: " + formatThb_(totalReceived) + "\n\n" +
        "ธุรกรรมที่ยอดประมาณการกับยอดอนุมัติต่างกัน: " + differenceCount + " รายการ — ตรวจแต่ละรหัสกับรายงานพันธมิตร\n" +
        "ธุรกรรมที่ยังมียอดค้างรับ: " + outstandingCount + " รายการ\n\n" +
        "ยอดที่ได้รับเท่านั้นคือกระแสเงินสดจริง อย่านับค่าคอมมิชชันโดยประมาณเป็นรายได้";
    logEvent_("กระทบยอดค่าคอมมิชชัน", differenceCount + " รายการมีส่วนต่าง, " + outstandingCount + " รายการมียอดค้างรับ", "สำเร็จ");
    notifyOrEmail_("กระทบยอดค่าคอมมิชชัน — ระบบแนะนำ", report);
}
function checkRisks() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var homNay = new Date();
    var row = [];
    var productSheet = ss.getSheetByName(getSheetName_("PRODUCTS"));
    var staleProducts = [];
    readRows_(productSheet, FIELDS.PRODUCTS).forEach(function (sp) {
        if (!sp.PRODUCT_CODE)
            return;
        var date = parseDate_(sp.VERIFIED_DATE);
        if (!date || (homNay - date) / 86400000 > CONFIG.STALE_AFTER_DAYS) {
            if (sp.DATA_STATUS !== "ต้องอัปเดต") {
                writeCell_(productSheet, sp._row, "DATA_STATUS", "ต้องอัปเดต");
            }
            staleProducts.push(sp.PRODUCT_CODE + " — " + sp.PRODUCT_NAME);
        }
    });
    row.push("1. สินค้าที่ไม่ได้ตรวจสอบภายใน " + CONFIG.STALE_AFTER_DAYS + " วัน: " + staleProducts.length + " รายการ");
    staleProducts.forEach(function (t) { row.push("   • " + t + " → เปิดแหล่งข้อมูลทางการ ตรวจสอบใหม่ แล้วจึงอัปเดตสถานะ"); });
    var dsHH = readRows_(ss.getSheetByName(getSheetName_("COMMISSIONS")), FIELDS.COMMISSIONS);
    var byPartner = {}, approvedTotal = 0;
    dsHH.forEach(function (h) {
        var date = parseDate_(h.RECORDED_DATE);
        if (date && (homNay - date) / 86400000 > 90)
            return;
        var t = toAmount_(h.APPROVED_COMMISSION);
        byPartner[h.PARTNER_CODE] = (byPartner[h.PARTNER_CODE] || 0) + t;
        approvedTotal += t;
    });
    row.push("");
    row.push("2. การพึ่งพาพันธมิตร (ค่าคอมมิชชันที่อนุมัติใน 90 วันที่ผ่านมา):");
    if (approvedTotal > 0) {
        Object.keys(byPartner).sort(function (a, b) { return byPartner[b] - byPartner[a]; }).forEach(function (code) {
            var percentage = byPartner[code] / approvedTotal;
            row.push("   • " + code + ": " + formatThb_(byPartner[code]) + " (" + Math.round(percentage * 100) + "%)" +
                (percentage >= CONFIG.CONCENTRATION_THRESHOLD ? " ⚠ เกินเกณฑ์ " + Math.round(CONFIG.CONCENTRATION_THRESHOLD * 100) + "% — ควรมีพันธมิตรสำรอง" : ""));
        });
    }
    else {
        row.push("• ไม่มีค่าคอมมิชชันที่อนุมัติในช่วง 90 วัน");
    }
    var commissionLeadCodes = {};
    dsHH.forEach(function (h) { if (h.LEAD_CODE)
        commissionLeadCodes[String(h.LEAD_CODE).toUpperCase()] = true; });
    var unrecorded = [];
    readRows_(ss.getSheetByName(getSheetName_("LEADS")), FIELDS.LEADS).forEach(function (k) {
        if (k.APPROVAL_STATUS === "ส่งแล้ว" && !commissionLeadCodes[String(k.LEAD_CODE).toUpperCase()])
            unrecorded.push(String(k.LEAD_CODE));
    });
    row.push("");
    row.push("3. ลูกค้าที่ส่งคำแนะนำแล้วแต่ยังไม่มีรายการค่าคอมมิชชัน: " + unrecorded.length +
        (unrecorded.length ? " (" + unrecorded.join(", ") + ") — ติดตามรหัสลูกค้าในรายงานของพันธมิตร" : ""));
    var overdueReceivables = [];
    dsHH.forEach(function (h) {
        var date = parseDate_(h.EXPECTED_PAYMENT_DATE);
        var outstandingAmount = toAmount_(h.APPROVED_COMMISSION) - toAmount_(h.AMOUNT_RECEIVED);
        if (date && date < homNay && outstandingAmount > 0)
            overdueReceivables.push(h.PARTNER_CODE + "/" + h.TRANSACTION_CODE + ": " + formatThb_(outstandingAmount));
    });
    row.push("");
    row.push("4. ค่าคอมมิชชันที่อนุมัติแล้วแต่เลยวันที่คาดว่าจะได้รับ: " + overdueReceivables.length + " รายการ");
    overdueReceivables.forEach(function (t) { row.push("   • " + t + " — ติดตามกับพันธมิตรและบันทึกการติดต่อในหมายเหตุ ห้ามลบยอดค้างรับ"); });
    row.push("");
    row.push("หลักการ: ห้ามเปลี่ยนวันที่ตรวจสอบเพียงเพื่อล้างคำเตือน หากสินค้า หรือข้อกำหนดเปลี่ยน ต้องอัปเดตข้อมูล เนื้อหา และคำแนะนำที่เกี่ยวข้องด้วย");
    var report = "รายงานตรวจสอบความเสี่ยง — " + currentTime_() + "\n\n" + row.join("\n");
    try {
        GmailApp.sendEmail(Session.getActiveUser().getEmail(), "ตรวจสอบความเสี่ยงรายสัปดาห์ — ระบบแนะนำ", report);
    }
    catch (e) { }
    logEvent_("ตรวจสอบความเสี่ยง", staleProducts.length + " สินค้าถึงกำหนดทบทวน, " + overdueReceivables.length + " รายการค้างรับ", "สำเร็จ");
    try {
        var html = HtmlService.createHtmlOutput("<pre style=\"font-family:Consolas,monospace;font-size:12px;white-space:pre-wrap;padding:6px\">" +
            report.replace(/</g, "&lt;") + "</pre>").setWidth(640).setHeight(480);
        SpreadsheetApp.getUi().showModalDialog(html, "รายงานการตรวจสอบความเสี่ยง");
    }
    catch (e) { }
}
function installAutomation() {
    ["checkRisks", "reconcileCommissions"].forEach(function (ham) {
        ScriptApp.getProjectTriggers().forEach(function (t) {
            if (t.getHandlerFunction() === ham && t.getTriggerSource() === ScriptApp.TriggerSource.CLOCK)
                ScriptApp.deleteTrigger(t);
        });
    });
    ScriptApp.newTrigger("checkRisks").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
    ScriptApp.newTrigger("reconcileCommissions").timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(16).create();
    logEvent_("ตั้งเวลาทำงานอัตโนมัติ", "ตรวจความเสี่ยงวันจันทร์ 08:00 และกระทบยอดวันศุกร์ 16:00", "สำเร็จ");
    SpreadsheetApp.getUi().alert("ตั้งเวลาทำงานอัตโนมัติแล้ว:\n" +
        "• ตรวจสอบความเสี่ยง: ทุกวันจันทร์ 08:00 และส่งรายงานทางอีเมล\n" +
        "• กระทบยอดค่าคอมมิชชัน: ทุกวันศุกร์ 16:00\n" +
        "• แดชบอร์ดโหลดข้อมูลล่าสุดทุกครั้งที่เปิด\n" +
        "ทริกเกอร์รับแบบฟอร์มจะสร้างเมื่อเรียกขั้นตอนที่ 3");
}
function showSystemLinks() {
    var properties = PropertiesService.getScriptProperties();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var row = function (label, url) {
        return url ? "<p style=\"margin:6px 0\"><b>" + label + ":</b><br><a href=\"" + url + "\" target=\"_blank\">" + url + "</a></p>"
            : "<p style=\"margin:6px 0;color:#999\"><b>" + label + ":</b> ยังไม่ได้สร้าง</p>";
    };
    var html = "<div style=\"font-family:Arial;font-size:13px;padding:4px\">" +
        row("สเปรดชีตกลาง", ss.getUrl()) +
        row("ไดเรกทอรีราก", properties.getProperty("ROOT_FOLDER_ID") ? "https://drive.google.com/drive/folders/" + properties.getProperty("ROOT_FOLDER_ID") : "") +
        row("โฟลเดอร์ RESEARCH_INBOX (ระเบียน PRODUCT_/PARTNER_)", properties.getProperty("RESEARCH_INBOX_FOLDER_ID") ? "https://drive.google.com/drive/folders/" + properties.getProperty("RESEARCH_INBOX_FOLDER_ID") : "") +
        row("โฟลเดอร์ COMMISSION_INBOX (รายงาน CSV)", properties.getProperty("COMMISSION_INBOX_FOLDER_ID") ? "https://drive.google.com/drive/folders/" + properties.getProperty("COMMISSION_INBOX_FOLDER_ID") : "") +
        row("ไฟล์ตัวอย่าง COMMISSION_TEMPLATE.csv", properties.getProperty("COMMISSION_TEMPLATE_FILE_ID") ? "https://drive.google.com/file/d/" + properties.getProperty("COMMISSION_TEMPLATE_FILE_ID") : "") +
        row("ไฟล์ตัวอย่างตาราง Pivot RESEARCH_TEMPLATE", properties.getProperty("RESEARCH_TEMPLATE_FILE_ID") ? "https://docs.google.com/spreadsheets/d/" + properties.getProperty("RESEARCH_TEMPLATE_FILE_ID") : "") +
        row("แบบฟอร์ม — ลิงก์สำหรับลูกค้า", properties.getProperty("NEEDS_FORM_PUBLIC_URL")) +
        row("แบบฟอร์ม — ลิงก์แก้ไข", properties.getProperty("NEEDS_FORM_EDIT_URL")) +
        "</div>";
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), "ลิงก์ระบบ");
}
function testApiConnection() {
    try {
        var answers = callAi_("ตอบคำเดียวว่า ตกลง");
        var properties = PropertiesService.getScriptProperties();
        var key = properties.getProperty("API_KEY") || "";
        var nha = key.indexOf("sk-ant") === 0 ? "Claude (Anthropic)" : "ChatGPT (OpenAI)";
        var model = properties.getProperty("MODEL") || (key.indexOf("sk-ant") === 0 ? CONFIG.ANTHROPIC_MODEL : CONFIG.OPENAI_MODEL);
        SpreadsheetApp.getUi().alert("เชื่อมต่อสำเร็จ\nผู้ให้บริการ: " + nha + "\nโมเดล: " + model +
            "\nคำตอบจาก AI: " + String(answers).substring(0, 80));
    }
    catch (e) {
        SpreadsheetApp.getUi().alert("เชื่อมต่อล้มเหลว: " + e.message +
            "\nโปรดตรวจสอบ Settings → Script properties → API_KEY ว่าคีย์ถูกต้องและบัญชี API มียอดคงเหลือ");
    }
}
function callAi_(prompt) {
    var properties = PropertiesService.getScriptProperties();
    var key = properties.getProperty("API_KEY");
    if (!key)
        throw new Error("ยังไม่มี API_KEY โปรดไปที่ Settings → Script properties เพิ่ม API_KEY แล้วเรียกใช้อีกครั้ง");
    var isAnthropic = key.indexOf("sk-ant") === 0;
    var model = properties.getProperty("MODEL") || (isAnthropic ? CONFIG.ANTHROPIC_MODEL : CONFIG.OPENAI_MODEL);
    var url, options;
    if (isAnthropic) {
        url = "https://api.anthropic.com/v1/messages";
        options = {
            method: "post", contentType: "application/json", muteHttpExceptions: true,
            headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
            payload: JSON.stringify({ model: model, max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
        };
    }
    else {
        url = "https://api.openai.com/v1/chat/completions";
        options = {
            method: "post", contentType: "application/json", muteHttpExceptions: true,
            headers: { Authorization: "Bearer " + key },
            payload: JSON.stringify({ model: model, temperature: 0.2, messages: [{ role: "user", content: prompt }] })
        };
    }
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var than = response.getContentText();
    if (code !== 200)
        throw new Error("รหัสส่งคืน API" + code + ": " + than.substring(0, 300));
    var json = JSON.parse(than);
    if (isAnthropic)
        return json.content.map(function (k) { return k.text || ""; }).join("");
    return json.choices[0].message.content;
}
function parseJson_(textValue) {
    var cleanText = String(textValue).replace(/```json/gi, "").replace(/```/g, "").trim();
    var startIndex = cleanText.indexOf("{"), lastIndex = cleanText.lastIndexOf("}");
    if (startIndex < 0 || lastIndex < startIndex)
        throw new Error("AI ไม่ส่งคืน JSON ที่ถูกต้อง");
    try {
        return JSON.parse(cleanText.substring(startIndex, lastIndex + 1));
    }
    catch (e) {
        throw new Error("โครงสร้าง JSON ไม่ถูกต้อง:" + e.message);
    }
}
function readRows_(sheet, headers) {
    if (!sheet || sheet.getLastRow() < 2)
        return [];
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    var ketQua = [];
    values.forEach(function (sourceRow, i) {
        if (!sourceRow.join("").toString().trim())
            return;
        var record = { _row: i + 2 };
        headers.forEach(function (column, j) { record[column] = sourceRow[j]; });
        ketQua.push(record);
    });
    return ketQua;
}
function upsertRow_(sheet, headers, keyColumn, key, values) {
    var ds = readRows_(sheet, headers);
    var existingRow = null;
    for (var i = 0; i < ds.length; i++) {
        var k = keyColumn === "_COMMISSION_KEY"
            ? String(ds[i].PARTNER_CODE).toUpperCase() + "|" + String(ds[i].TRANSACTION_CODE).toUpperCase()
            : String(ds[i][keyColumn]).toUpperCase();
        if (k === String(key).toUpperCase()) {
            existingRow = ds[i]._row;
            break;
        }
    }
    if (existingRow) {
        headers.forEach(function (column, j) {
            if (values[column] !== undefined)
                sheet.getRange(existingRow, j + 1).setValue(values[column]);
        });
        return "UPDATED";
    }
    sheet.appendRow(headers.map(function (column) { return values[column] !== undefined ? values[column] : ""; }));
    return "CREATED";
}
function writeCell_(sheet, row, columnName, values) {
    var headers = FIELDS[getSheetKey_(sheet.getName())];
    var column = headers.indexOf(columnName) + 1;
    if (column > 0)
        sheet.getRange(row, column).setValue(values);
}
function logEvent_(action, details, ketQua) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getSheetName_("SYSTEM_LOG"));
        if (sheet)
            sheet.appendRow([currentTime_(), action, details, ketQua]);
    }
    catch (e) { }
}
function notifyOrEmail_(headers, contentText, useHtml) {
    try {
        if (useHtml) {
            var html = HtmlService.createHtmlOutput("<pre style=\"font-family:Consolas,monospace;font-size:12px;white-space:pre-wrap;padding:6px\">" +
                contentText.replace(/</g, "&lt;") + "</pre>").setWidth(640).setHeight(480);
            SpreadsheetApp.getUi().showModalDialog(html, "รายงานการตรวจสอบความเสี่ยง");
        }
        else {
            SpreadsheetApp.getUi().alert(contentText);
        }
    }
    catch (e) {
        try {
            GmailApp.sendEmail(Session.getActiveUser().getEmail(), headers || "รายงานระบบแนะนำ", contentText);
        }
        catch (e2) { }
    }
}
function safely_(ham, fallback) { try {
    return ham();
}
catch (e) {
    return fallback;
} }
function columnNumber_(value) {
  var text = String(value || '').trim();
  var sheetKeys = Object.keys(COLUMN_LABELS);
  for (var i = 0; i < sheetKeys.length; i++) {
    var labels = COLUMN_LABELS[sheetKeys[i]];
    var index = labels.indexOf(text);
    if (index > -1) return FIELDS[sheetKeys[i]][index];
  }
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function toAmount_(v) {
    if (typeof v === "number")
        return v;
    var s = String(v || "").replace(/[^\d\-]/g, "");
    return s ? parseInt(s, 10) : 0;
}
function formatThb_(amount) {
    return String(Math.round(toAmount_(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " บาท";
}
function parseDate_(v) {
    if (v instanceof Date && !isNaN(v))
        return v;
    var s = String(v || "").trim();
    if (!s)
        return null;
    var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m)
        return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    var d = new Date(s);
    return isNaN(d) ? null : d;
}
function formatDate_(v) {
    var d = parseDate_(v);
    return d ? Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy") : "ไม่ระบุ";
}
function today_() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
}
function currentTime_() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
}
