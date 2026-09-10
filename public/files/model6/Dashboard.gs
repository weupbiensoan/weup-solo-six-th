/** WEUP SoloSix — โมเดล 6: แดชบอร์ดระบบแนะนำและพันธมิตร */
function openDashboard() {
  var html = HtmlService.createHtmlOutputFromFile("Dashboard")
    .setWidth(1180)
    .setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, "แดชบอร์ดระบบแนะนำและพันธมิตร");
}

function getDashboardData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var leads = safely_(function () {
    return readRows_(spreadsheet.getSheetByName(getSheetName_("LEADS")), FIELDS.LEADS);
  }, []);
  var products = safely_(function () {
    return readRows_(spreadsheet.getSheetByName(getSheetName_("PRODUCTS")), FIELDS.PRODUCTS);
  }, []);
  var commissions = safely_(function () {
    return readRows_(spreadsheet.getSheetByName(getSheetName_("COMMISSIONS")), FIELDS.COMMISSIONS);
  }, []);

  function countByValue(rows, field, value) {
    return rows.filter(function (row) { return row[field] === value; }).length;
  }

  var newCount = countByValue(leads, "APPROVAL_STATUS", "ใหม่");
  var pendingApproval = countByValue(leads, "APPROVAL_STATUS", "รออนุมัติ");
  var needsInfo = countByValue(leads, "APPROVAL_STATUS", "ต้องสอบถามเพิ่ม");
  var humanReview = countByValue(leads, "APPROVAL_STATUS", "ส่งให้ผู้ดูแล");
  var sentCount = countByValue(leads, "APPROVAL_STATUS", "ส่งแล้ว");
  var productsPendingReview = countByValue(products, "DATA_STATUS", "รออนุมัติ");
  var staleProducts = products.filter(function (product) {
    return product.DATA_STATUS === "ต้องอัปเดต";
  });

  var today = new Date();
  var totalEstimated = 0;
  var totalApproved = 0;
  var totalReceived = 0;
  var overduePayments = 0;
  var commissionByPartner = {};
  var approvedLast90Days = 0;

  commissions.forEach(function (commission) {
    totalEstimated += toAmount_(commission.ESTIMATED_COMMISSION);
    totalApproved += toAmount_(commission.APPROVED_COMMISSION);
    totalReceived += toAmount_(commission.AMOUNT_RECEIVED);

    var expectedPaymentDate = parseDate_(commission.EXPECTED_PAYMENT_DATE);
    var outstanding = toAmount_(commission.APPROVED_COMMISSION) - toAmount_(commission.AMOUNT_RECEIVED);
    if (expectedPaymentDate && expectedPaymentDate < today && outstanding > 0) overduePayments++;

    var recordedDate = parseDate_(commission.RECORDED_DATE);
    if (!recordedDate || (today - recordedDate) / 86400000 <= 90) {
      var approvedAmount = toAmount_(commission.APPROVED_COMMISSION);
      if (commission.PARTNER_CODE) {
        commissionByPartner[commission.PARTNER_CODE] =
          (commissionByPartner[commission.PARTNER_CODE] || 0) + approvedAmount;
        approvedLast90Days += approvedAmount;
      }
    }
  });

  var actions = [];
  if (newCount) {
    actions.push({ text: "ลูกค้าใหม่ " + newCount + " รายรอการจำแนก", instruction: "เรียกใช้เมนูขั้นตอน 4" });
  }
  if (pendingApproval) {
    actions.push({ text: "ข้อเสนอ " + pendingApproval + " รายการรออนุมัติ", instruction: "เปิดชีตลูกค้า อ่านเหตุผล แล้วเปลี่ยนเป็น อนุมัติ" });
  }
  if (needsInfo) {
    actions.push({ text: "ลูกค้า " + needsInfo + " รายต้องสอบถามเพิ่ม", instruction: "เรียกใช้เมนูขั้นตอน 5" });
  }
  if (humanReview) {
    actions.push({ text: "ลูกค้าระดับ 3 จำนวน " + humanReview + " ราย", instruction: "ผู้ดูแลต้องดำเนินการโดยตรง" });
  }
  if (productsPendingReview) {
    actions.push({ text: "สินค้า " + productsPendingReview + " รายการรอตรวจสอบ", instruction: "ตรวจแหล่งข้อมูลแล้วเปลี่ยนเป็น ตรวจสอบแล้ว" });
  }
  if (staleProducts.length) {
    actions.push({ text: "สินค้า " + staleProducts.length + " รายการถึงกำหนดทบทวน", instruction: "ตรวจแหล่งข้อมูลทางการและอัปเดตข้อมูล" });
  }
  if (overduePayments) {
    actions.push({ text: "ค่าคอมมิชชัน " + overduePayments + " รายการเลยกำหนดรับเงิน", instruction: "ติดตามกับพันธมิตรและบันทึกในหมายเหตุ" });
  }

  var partners = Object.keys(commissionByPartner)
    .sort(function (a, b) { return commissionByPartner[b] - commissionByPartner[a]; })
    .slice(0, 6)
    .map(function (code) {
      var ratio = approvedLast90Days ? commissionByPartner[code] / approvedLast90Days : 0;
      return {
        code: String(code),
        commission: commissionByPartner[code],
        percentage: Math.round(ratio * 100),
        exceedsThreshold: ratio >= CONFIG.CONCENTRATION_THRESHOLD
      };
    });

  return {
    updatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm — dd/MM/yyyy"),
    concentrationThreshold: Math.round(CONFIG.CONCENTRATION_THRESHOLD * 100),
    staleDaysThreshold: CONFIG.STALE_AFTER_DAYS,
    leads: {
      newCount: newCount,
      pendingApproval: pendingApproval,
      needsInfo: needsInfo,
      humanReview: humanReview,
      sent: sentCount
    },
    commission: {
      estimated: totalEstimated,
      approved: totalApproved,
      received: totalReceived
    },
    alerts: {
      staleProducts: staleProducts.length,
      overduePayments: overduePayments,
      total: staleProducts.length + overduePayments
    },
    actions: actions,
    partners: partners,
    staleProducts: staleProducts.slice(0, 8).map(function (product) {
      return {
        code: String(product.PRODUCT_CODE),
        name: String(product.PRODUCT_NAME || ""),
        date: formatDate_(product.VERIFIED_DATE)
      };
    })
  };
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Dashboard")
    .setTitle("WEUP SoloSix — แดชบอร์ดระบบแนะนำและพันธมิตร");
}
