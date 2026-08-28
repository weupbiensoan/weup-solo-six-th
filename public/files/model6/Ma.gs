/************************************************************************************
 * HỆ THỐNG GIỚI THIỆU SẢN PHẨM VẬN HÀNH BẰNG AI — CHƯƠNG 8 — TỆP 1/3: Mã.gs
 * ----------------------------------------------------------------------------------
 * Dự án gồm BA tệp (giống cấu trúc các chương trước có bảng điều khiển):
 *   1. Mã.gs                 — tệp này: CẤU HÌNH + MENU + toàn bộ nghiệp vụ
 *                              (mục 1–10). Là tệp gốc có sẵn của Apps Script —
 *                              chỉ dán đè, không cần tạo mới.
 *   2. BangDieuKhien.gs      — phần máy chủ của bảng điều khiển (gom số liệu)
 *   3. BangDieuKhien (HTML)  — giao diện bảng điều khiển, mở từ menu
 *
 * Cách cài: mở Tiện ích mở rộng → Apps Script, dán tệp này đè lên Mã.gs. Ở cột trái
 * mục "Tệp": bấm + → Tập lệnh → đặt tên BangDieuKhien → dán tệp 2; bấm + → HTML →
 * đặt tên ĐÚNG là BangDieuKhien (không gõ đuôi .html) → dán tệp 3. Bấm Lưu (Ctrl+S),
 * tải lại bảng tính, chạy theo menu HỆ THỐNG GIỚI THIỆU. Các tệp dùng chung một
 * không gian tên nên gọi lẫn nhau bình thường; riêng tên tệp HTML phải khớp chính
 * xác BangDieuKhien.
 *
 * Khóa API lưu tại: Cài đặt dự án → Thuộc tính tập lệnh → API_KEY
 *   - Khóa bắt đầu bằng "sk-ant" → hệ thống gọi Claude (Anthropic)
 *   - Khóa khác → hệ thống gọi ChatGPT (OpenAI)
 *   - Thuộc tính MODEL (không bắt buộc) cho phép đổi tên mô hình.
 *
 * Khối CẤU HÌNH ngay dưới đây là nơi duy nhất cần chỉnh khi muốn đổi ngưỡng
 * (90 ngày, 70%), bảng màu hay tên cột.
 *
 * BA RANH GIỚI AN TOÀN ĐƯỢC VIẾT CỨNG TRONG MÃ:
 *   1. Prompt phân loại khách CHỈ đọc SAN_PHAM đã kiểm tra và nhu cầu khách,
 *      KHÔNG BAO GIỜ đọc mức hoa hồng hay bất kỳ dữ liệu nào của DOI_TAC.
 *   2. Hệ thống CHỈ tạo thư nháp trong Gmail, KHÔNG tự gửi thư cho khách.
 *   3. Khách MỨC 3 (chuyển dữ liệu cũ, tích hợp phức tạp, dữ liệu nhạy cảm,
 *      hợp đồng dài hạn) không được tạo thư tư vấn tự động.
 ************************************************************************************/

/*================================== CẤU HÌNH =====================================*/

var CAU_HINH = {
  TEN_THU_MUC_GOC: 'HE_THONG_GIOI_THIEU_AI',
  NGUONG_QUA_HAN_NGAY: 90,      // dữ liệu sản phẩm quá 90 ngày phải kiểm tra lại
  NGUONG_TAP_TRUNG: 0.7,        // cảnh báo khi một đối tác chiếm >= 70% hoa hồng
  MODEL_ANTHROPIC: 'claude-sonnet-4-5',
  MODEL_OPENAI: 'gpt-4o'
};

var MAU = { // bảng màu của hệ thống
  NAVY: '#1E3A5F', XANH_DUONG: '#1E88E5', VANG: '#F9A825', CAM: '#EF6C00',
  XANH_LA: '#2E7D32', XANH_LA_NHAT: '#43A047', CHAM: '#3949AB', NGOC: '#00897B',
  DO: '#C62828', XAM: '#607D8B', NEN_NHAT: '#F5F7FA',
  DO_NHAT: '#FDE7E9', VANG_NHAT: '#FFF6DE', XANH_NHAT: '#E8F3EC'
};

var TIEU_DE = {
  SAN_PHAM: ['MA_SP','TEN_SAN_PHAM','NHOM_VAN_DE','KHACH_PHU_HOP','KHACH_CHUA_PHU_HOP',
    'MUC_GIA','TINH_NANG_CHINH','GIOI_HAN','NGUON_CHINH_THUC','NGAY_KIEM_TRA',
    'TRANG_THAI_DU_LIEU','LINK_NOI_DUNG','LINK_HO_SO','GHI_CHU'],
  DOI_TAC: ['MA_DT','TEN_CHUONG_TRINH','MA_SP_LIEN_QUAN','LINK_DANG_KY','LINK_GIOI_THIEU',
    'CACH_GHI_NHAN','THOI_GIAN_GHI_NHAN','MUC_HOA_HONG','DIEU_KIEN_DAO','KY_THANH_TOAN',
    'GIOI_HAN_QUANG_BA','NGUOI_LIEN_HE','NGUON_DIEU_KHOAN','NGAY_KIEM_TRA',
    'TRANG_THAI_DUYET','LINK_HO_SO','GHI_CHU'],
  KHACH_HANG: ['MA_KHACH','NGAY_NHAN','EMAIL','NGUON_KHACH','QUY_MO_NHAN_SU','SO_NGUOI_DUNG',
    'VAN_DE_CAN_GIAI_QUYET','CONG_CU_HIEN_TAI','NGAN_SACH_THANG','TIEU_CHI_BAT_BUOC',
    'THOI_GIAN_TRIEN_KHAI','KET_QUA_AI','DE_XUAT','THONG_TIN_CON_THIEU','MUC_XU_LY',
    'TRANG_THAI_DUYET','NGAY_GUI','GHI_CHU'],
  HOA_HONG: ['MA_KHACH','MA_DOI_TAC','MA_GIAO_DICH','NGAY_GHI_NHAN','TRANG_THAI',
    'HOA_HONG_DU_KIEN','HOA_HONG_DA_DUYET','TIEN_DA_NHAN','NGAY_DU_KIEN_NHAN',
    'CHENH_LECH_DOI_SOAT','TIEN_CON_PHAI_THU','NGUON_BAO_CAO','GHI_CHU'],
  NHAT_KY_HE_THONG: ['THOI_GIAN','HANH_DONG','CHI_TIET','KET_QUA']
};

var TRANG_THAI = {
  SP: ['CHO_DUYET','DA_KIEM_TRA','CAN_CAP_NHAT'],
  DT: ['CHO_DUYET','DA_DUYET','CAN_XAC_NHAN','KHONG_THAM_GIA'],
  KH: ['MOI','CHO_DUYET','CAN_HOI_THEM','CHUYEN_NGUOI','DA_DUYET','DA_GUI'],
  MUC: ['MUC_1','MUC_2','MUC_3'],
  HH: ['DA_GHI_NHAN','DU_DIEU_KIEN','DA_DUYET','DA_NHAN_TIEN','BI_HUY_DAO']
};

/* Tên cột hiển thị trên trang tính (tiếng Việt có dấu). Mảng song song 1-1 với TIEU_DE;
 * toàn bộ mã vẫn làm việc theo vị trí cột nên đổi tên hiển thị không ảnh hưởng xử lý. */
var TEN_COT = {
  SAN_PHAM: ['MÃ SP','TÊN SẢN PHẨM','NHÓM VẤN ĐỀ','KHÁCH PHÙ HỢP','KHÁCH CHƯA PHÙ HỢP',
    'MỨC GIÁ','TÍNH NĂNG CHÍNH','GIỚI HẠN','NGUỒN CHÍNH THỨC','NGÀY KIỂM TRA',
    'TRẠNG THÁI DỮ LIỆU','LINK NỘI DUNG','LINK HỒ SƠ','GHI CHÚ'],
  DOI_TAC: ['MÃ ĐT','TÊN CHƯƠNG TRÌNH','MÃ SP LIÊN QUAN','LINK ĐĂNG KÝ','LINK GIỚI THIỆU',
    'CÁCH GHI NHẬN','THỜI GIAN GHI NHẬN','MỨC HOA HỒNG','ĐIỀU KIỆN ĐẢO','KỲ THANH TOÁN',
    'GIỚI HẠN QUẢNG BÁ','NGƯỜI LIÊN HỆ','NGUỒN ĐIỀU KHOẢN','NGÀY KIỂM TRA',
    'TRẠNG THÁI DUYỆT','LINK HỒ SƠ','GHI CHÚ'],
  KHACH_HANG: ['MÃ KHÁCH','NGÀY NHẬN','EMAIL','NGUỒN KHÁCH','QUY MÔ NHÂN SỰ','SỐ NGƯỜI DÙNG',
    'VẤN ĐỀ CẦN GIẢI QUYẾT','CÔNG CỤ HIỆN TẠI','NGÂN SÁCH THÁNG','TIÊU CHÍ BẮT BUỘC',
    'THỜI GIAN TRIỂN KHAI','KẾT QUẢ AI','ĐỀ XUẤT','THÔNG TIN CÒN THIẾU','MỨC XỬ LÝ',
    'TRẠNG THÁI DUYỆT','NGÀY GỬI','GHI CHÚ'],
  HOA_HONG: ['MÃ KHÁCH','MÃ ĐỐI TÁC','MÃ GIAO DỊCH','NGÀY GHI NHẬN','TRẠNG THÁI',
    'HOA HỒNG DỰ KIẾN','HOA HỒNG ĐÃ DUYỆT','TIỀN ĐÃ NHẬN','NGÀY DỰ KIẾN NHẬN',
    'CHÊNH LỆCH ĐỐI SOÁT','TIỀN CÒN PHẢI THU','NGUỒN BÁO CÁO','GHI CHÚ'],
  NHAT_KY_HE_THONG: ['THỜI GIAN','HÀNH ĐỘNG','CHI TIẾT','KẾT QUẢ']
};

/*==================================== MENU =======================================*/

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('HỆ THỐNG GIỚI THIỆU')
    .addItem('1. Khởi tạo hệ thống', 'khoiTaoHeThong')
    .addItem('2. Nạp dữ liệu nghiên cứu (AI)', 'napDuLieuNghienCuu')
    .addItem('3. Tạo biểu mẫu nhu cầu', 'taoBieuMauNhuCau')
    .addItem('4. Phân loại khách mới (AI)', 'phanLoaiKhachMoi')
    .addItem('5. Tạo thư nháp gửi khách', 'taoThuNhapGuiKhach')
    .addItem('6. Đánh dấu đã gửi (dòng đang chọn)', 'danhDauDaGui')
    .addItem('7. Nhập báo cáo hoa hồng', 'nhapBaoCaoHoaHong')
    .addItem('8. Đối soát hoa hồng', 'doiSoatHoaHong')
    .addItem('9. Kiểm tra rủi ro', 'kiemTraRuiRo')
    .addItem('10. Đặt lịch tự động', 'datLichTuDong')
    .addSeparator()
    .addItem('Mở bảng điều khiển', 'moBangDieuKhien')
    .addItem('Tạo cây thư mục Drive', 'taoCayThuMucDrive')
    .addItem('Xem liên kết hệ thống', 'xemLienKetHeThong')
    .addItem('Kiểm tra kết nối API', 'kiemTraKetNoiAPI')
    .addToUi();
}


/*============================ MỤC 1 — KHỞI TẠO HỆ THỐNG ==========================*/
/* An toàn khi chạy lặp lại: trang tính chỉ bổ sung khi thiếu, thư mục dùng lại theo tên. */

function khoiTaoHeThong() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  taoTrang_(ss, 'SAN_PHAM', TIEU_DE.SAN_PHAM, MAU.NGOC);
  taoTrang_(ss, 'DOI_TAC', TIEU_DE.DOI_TAC, MAU.CHAM);
  taoTrang_(ss, 'KHACH_HANG', TIEU_DE.KHACH_HANG, MAU.XANH_DUONG);
  taoTrang_(ss, 'HOA_HONG', TIEU_DE.HOA_HONG, MAU.VANG);
  taoTrang_(ss, 'NHAT_KY_HE_THONG', TIEU_DE.NHAT_KY_HE_THONG, MAU.XAM);

  datKiemTraDuLieu_(ss);
  datDinhDangCanhBao_(ss);
  taoCayThuMuc_();

  ['Sheet1', 'Trang tính1'].forEach(function (tenTab) {
    var thua = ss.getSheetByName(tenTab);
    if (thua && thua.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(thua);
  });

  ghiNhatKy_('Khởi tạo hệ thống', 'Tạo/kiểm tra trang tính, thư mục', 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Khởi tạo xong.\n\n' +
    '• 5 trang dữ liệu đã sẵn sàng.\n' +
    '• Bảng điều khiển xem qua menu → Mở bảng điều khiển (tự tải số liệu mới mỗi lần mở).\n' +
    '• Thư mục NAP_DU_LIEU và NAP_HOA_HONG đã tạo trên Drive (xem menu → Xem liên kết hệ thống).\n\n' +
    'Bước tiếp theo: soạn hồ sơ SP_/DT_ (Google Docs) HOẶC điền tệp mẫu MAU_TONG_HOP_NGHIEN_CUU,\nthả vào NAP_DU_LIEU rồi chạy mục 2.');
}

function taoTrang_(ss, ten, tieuDe, mauTab) {
  var trang = ss.getSheetByName(ten);
  if (!trang) trang = ss.insertSheet(ten);
  trang.setTabColor(mauTab);

  // ghi tên cột hiển thị tiếng Việt có dấu; xử lý dữ liệu vẫn theo vị trí cột
  var nhan = TEN_COT[ten] || tieuDe;
  var soCotHienCo = Math.max(trang.getLastColumn(), 1);
  var dongDau = trang.getRange(1, 1, 1, Math.max(soCotHienCo, tieuDe.length)).getValues()[0];
  for (var i = 0; i < tieuDe.length; i++) {
    if (String(dongDau[i] || '') !== nhan[i]) trang.getRange(1, i + 1).setValue(nhan[i]);
  }
  var vungTieuDe = trang.getRange(1, 1, 1, tieuDe.length);
  vungTieuDe.setBackground(MAU.NAVY).setFontColor('#FFFFFF').setFontWeight('bold')
            .setVerticalAlignment('middle').setWrap(true);
  trang.setRowHeight(1, 34);
  trang.setFrozenRows(1);
  if (!trang.getFilter()) {
    trang.getRange(1, 1, Math.max(trang.getMaxRows(), 2), tieuDe.length).createFilter();
  }
}

function datKiemTraDuLieu_(ss) {
  datDS_(ss, 'SAN_PHAM', 'TRANG_THAI_DU_LIEU', TRANG_THAI.SP);
  datDS_(ss, 'DOI_TAC', 'TRANG_THAI_DUYET', TRANG_THAI.DT);
  datDS_(ss, 'KHACH_HANG', 'TRANG_THAI_DUYET', TRANG_THAI.KH);
  datDS_(ss, 'KHACH_HANG', 'MUC_XU_LY', TRANG_THAI.MUC);
  datDS_(ss, 'HOA_HONG', 'TRANG_THAI', TRANG_THAI.HH);
}

function datDS_(ss, tenTrang, tenCot, danhSach) {
  var trang = ss.getSheetByName(tenTrang);
  var cot = TIEU_DE[tenTrang].indexOf(tenCot) + 1;
  if (cot < 1) return;
  var quyTac = SpreadsheetApp.newDataValidation()
    .requireValueInList(danhSach, true).setAllowInvalid(false).build();
  trang.getRange(2, cot, trang.getMaxRows() - 1, 1).setDataValidation(quyTac);
}

function datDinhDangCanhBao_(ss) {
  themQuyTacMau_(ss, 'SAN_PHAM', 'TRANG_THAI_DU_LIEU', [
    ['CAN_CAP_NHAT', MAU.DO_NHAT], ['CHO_DUYET', MAU.VANG_NHAT], ['DA_KIEM_TRA', MAU.XANH_NHAT]]);
  themQuyTacMau_(ss, 'DOI_TAC', 'TRANG_THAI_DUYET', [
    ['CAN_XAC_NHAN', MAU.VANG_NHAT], ['KHONG_THAM_GIA', MAU.DO_NHAT], ['DA_DUYET', MAU.XANH_NHAT]]);
  themQuyTacMau_(ss, 'KHACH_HANG', 'TRANG_THAI_DUYET', [
    ['CHUYEN_NGUOI', MAU.DO_NHAT], ['CAN_HOI_THEM', MAU.VANG_NHAT], ['DA_GUI', MAU.XANH_NHAT]]);
  // HOA_HONG: cảnh báo hai cột đối soát
  var trang = ss.getSheetByName('HOA_HONG');
  var quyTac = trang.getConditionalFormatRules();
  var cotLech = TIEU_DE.HOA_HONG.indexOf('CHENH_LECH_DOI_SOAT') + 1;
  var cotThu = TIEU_DE.HOA_HONG.indexOf('TIEN_CON_PHAI_THU') + 1;
  quyTac.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberNotEqualTo(0).setBackground(MAU.DO_NHAT)
    .setRanges([trang.getRange(2, cotLech, trang.getMaxRows() - 1, 1)]).build());
  quyTac.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0).setBackground(MAU.VANG_NHAT)
    .setRanges([trang.getRange(2, cotThu, trang.getMaxRows() - 1, 1)]).build());
  trang.setConditionalFormatRules(quyTac);
}

function themQuyTacMau_(ss, tenTrang, tenCot, capGiaTriMau) {
  var trang = ss.getSheetByName(tenTrang);
  var cot = TIEU_DE[tenTrang].indexOf(tenCot) + 1;
  var vung = trang.getRange(2, cot, trang.getMaxRows() - 1, 1);
  var quyTac = trang.getConditionalFormatRules();
  capGiaTriMau.forEach(function (cap) {
    quyTac.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(cap[0]).setBackground(cap[1]).setRanges([vung]).build());
  });
  trang.setConditionalFormatRules(quyTac);
}

function taoCayThuMuc_() {
  var kho = PropertiesService.getScriptProperties();
  var goc = layThuMucTheoTen_(null, CAU_HINH.TEN_THU_MUC_GOC);
  var napDuLieu = layThuMucTheoTen_(goc, 'NAP_DU_LIEU');
  var napHoaHong = layThuMucTheoTen_(goc, 'NAP_HOA_HONG');

  // tệp mẫu CSV báo cáo hoa hồng
  var tenMau = 'MAU_HOA_HONG.csv';
  var daCo = napHoaHong.getFilesByName(tenMau);
  var tepMau;
  if (daCo.hasNext()) {
    tepMau = daCo.next();
  } else {
    var noiDung = 'MÃ KHÁCH,MÃ ĐỐI TÁC,MÃ GIAO DỊCH,NGÀY GHI NHẬN,TRẠNG THÁI,HOA HỒNG DỰ KIẾN,HOA HỒNG ĐÃ DUYỆT,TIỀN ĐÃ NHẬN,NGÀY DỰ KIẾN NHẬN,NGUỒN BÁO CÁO,GHI CHÚ\n' +
      'KH-TEST,DT-TEST,GD-TEST,01/08/2026,DA_GHI_NHAN,500000,0,0,30/09/2026,Bảng báo cáo đối tác,Dòng minh họa - xóa trước khi dùng\n';
    tepMau = napHoaHong.createFile(tenMau, noiDung, MimeType.CSV);
  }
  kho.setProperties({
    ID_THU_MUC_GOC: goc.getId(), ID_NAP_DU_LIEU: napDuLieu.getId(),
    ID_NAP_HOA_HONG: napHoaHong.getId(), ID_MAU_CSV: tepMau.getId()
  });

  // tệp mẫu bảng tổng hợp nghiên cứu (Google Trang tính) trong NAP_DU_LIEU
  var idMauTH = kho.getProperty('ID_MAU_TONG_HOP');
  var daCoMauTH = false;
  if (idMauTH) { try { DriveApp.getFileById(idMauTH).getName(); daCoMauTH = true; } catch (e) {} }
  if (!daCoMauTH) {
    var mauTH = SpreadsheetApp.create('MAU_TONG_HOP_NGHIEN_CUU');
    var tabSP = mauTH.getSheets()[0];
    tabSP.setName('SAN_PHAM');
    veTabMau_(tabSP, TEN_COT_MAU.SAN_PHAM,
      ['VD-SP01', 'Tên phần mềm', 'Nhóm vấn đề giải quyết', 'Phù hợp với ai', 'Chưa phù hợp với ai',
       'Giá từng gói', 'Tính năng chính', 'Giới hạn gói', 'Link nguồn chính thức', '19/08/2026',
       'Dòng ví dụ — mã bắt đầu VD sẽ không được nạp']);
    veTabMau_(mauTH.insertSheet('DOI_TAC'), TEN_COT_MAU.DOI_TAC,
      ['VD-DT01', 'Tên chương trình', 'VD-SP01', 'Link đăng ký', 'Link giới thiệu (nếu đã có)',
       'Link/biểu mẫu/đăng ký cơ hội', 'Cửa sổ ghi nhận', 'Mức hoa hồng', 'Điều kiện hủy/đảo',
       'Kỳ thanh toán', 'Giới hạn quảng bá', 'Đầu mối liên hệ', 'Link trang điều khoản', '19/08/2026',
       'Dòng ví dụ — mã bắt đầu VD sẽ không được nạp']);
    DriveApp.getFileById(mauTH.getId()).moveTo(napDuLieu);
    kho.setProperty('ID_MAU_TONG_HOP', mauTH.getId());
  }
}

function veTabMau_(tab, tieuDe, dongViDu) {
  tab.getRange(1, 1, 1, tieuDe.length).setValues([tieuDe])
    .setBackground(MAU.NAVY).setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
  tab.getRange(2, 1, 1, dongViDu.length).setValues([dongViDu])
    .setFontStyle('italic').setFontColor('#8A8FA0');
  tab.setFrozenRows(1);
  for (var c = 1; c <= tieuDe.length; c++) tab.setColumnWidth(c, 170);
}

/* Mục menu riêng: tạo (hoặc kiểm tra lại) cây thư mục Drive và tệp mẫu.
 * An toàn khi chạy lặp — thư mục, tệp mẫu đã có thì dùng lại, không tạo trùng. */
function taoCayThuMucDrive() {
  taoCayThuMuc_();
  ghiNhatKy_('Tạo cây thư mục Drive', 'HE_THONG_GIOI_THIEU_AI / NAP_DU_LIEU / NAP_HOA_HONG + tệp mẫu', 'THANH_CONG');
  xemLienKetHeThong();
}

function layThuMucTheoTen_(cha, ten) {
  var ds = cha ? cha.getFoldersByName(ten) : DriveApp.getFoldersByName(ten);
  return ds.hasNext() ? ds.next() : (cha ? cha.createFolder(ten) : DriveApp.createFolder(ten));
}

/*==================== MỤC 2 — NẠP DỮ LIỆU NGHIÊN CỨU (AI) ========================*/
/* Đọc các tệp hồ sơ trong NAP_DU_LIEU:
 *   SP_<MA>_<Ten>  → AI chuẩn hóa 9 trường → đổ vào SAN_PHAM (trạng thái CHO_DUYET)
 *   DT_<MA>_<Ten>  → AI trích điều khoản   → đổ vào DOI_TAC   (trạng thái CHO_DUYET)
 * AI chỉ được dùng nội dung trong tệp; trường thiếu ghi "CẦN KIỂM TRA".
 * Tệp đã nạp được đổi tên với tiền tố DA_NHAP_ để không nạp trùng. */

function napDuLieuNghienCuu() {
  var kho = PropertiesService.getScriptProperties();
  var idThuMuc = kho.getProperty('ID_NAP_DU_LIEU');
  if (!idThuMuc) { SpreadsheetApp.getUi().alert('Chưa có thư mục NAP_DU_LIEU. Chạy mục 1 trước.'); return; }

  var thuMuc = DriveApp.getFolderById(idThuMuc);
  var ds = thuMuc.getFiles();
  var soSP = 0, soDT = 0, loi = [];

  while (ds.hasNext()) {
    var tep = ds.next();
    var ten = tep.getName();
    if (ten.indexOf('DA_NHAP_') === 0 || ten.indexOf('MAU_') === 0 || ten.indexOf('TAM_DOI_') === 0) continue;

    // Đường 2: bảng tổng hợp (Google Trang tính hoặc Excel theo mẫu) — nhập thẳng, không gọi AI
    var loaiTep = tep.getMimeType();
    var laBang = loaiTep === MimeType.GOOGLE_SHEETS || loaiTep === MimeType.MICROSOFT_EXCEL ||
                 loaiTep === MimeType.MICROSOFT_EXCEL_LEGACY || /\.xlsx?$/i.test(ten);
    if (laBang) {
      try {
        var kqBang = napBangTongHop_(tep);
        soSP += kqBang.sp; soDT += kqBang.dt;
        if (kqBang.boQua.length) loi.push(ten + ' — bỏ qua ' + kqBang.boQua.length + ' dòng: ' + kqBang.boQua.join('; '));
        tep.setName('DA_NHAP_' + ten);
      } catch (eBang) {
        loi.push(ten + ' — ' + eBang.message);
        ghiNhatKy_('Nạp bảng tổng hợp', ten, 'LOI: ' + eBang.message);
      }
      continue;
    }

    // Đường 1: hồ sơ văn bản SP_/DT_ — AI chuẩn hóa
    var khop = ten.match(/^(SP|DT)_([A-Za-z0-9\-]+)_/);
    if (!khop) { loi.push(ten + ' — hồ sơ (Docs/TXT/Word/PDF/ảnh) phải đặt tên SP_MA_Ten hoặc DT_MA_Ten; riêng bảng tổng hợp (Trang tính/Excel) không cần quy ước tên. Bỏ qua.'); continue; }

    try {
      var noiDung = docNoiDungTep_(tep);
      if (!noiDung || noiDung.length < 50) throw new Error('nội dung quá ngắn hoặc không đọc được');
      var loai = khop[1].toUpperCase();
      var ma = khop[2].toUpperCase();
      if (loai === 'SP') { napMotSanPham_(ma, noiDung, tep.getUrl()); soSP++; }
      else { napMotDoiTac_(ma, noiDung, tep.getUrl()); soDT++; }
      tep.setName('DA_NHAP_' + ten);
    } catch (e) {
      loi.push(ten + ' — ' + e.message);
      ghiNhatKy_('Nạp dữ liệu nghiên cứu', ten, 'LOI: ' + e.message);
    }
  }

  ghiNhatKy_('Nạp dữ liệu nghiên cứu', soSP + ' sản phẩm, ' + soDT + ' đối tác', loi.length ? loi.length + ' lỗi' : 'THANH_CONG');
  var thongBao = 'Đã nạp ' + soSP + ' sản phẩm và ' + soDT + ' đối tác (từ hồ sơ văn bản và bảng tổng hợp).\n' +
    'Tất cả ở trạng thái CHO_DUYET — bạn phải rà từng dòng, đối chiếu nguồn rồi mới chuyển ' +
    'DA_KIEM_TRA (sản phẩm) hoặc DA_DUYET (đối tác).' +
    (loi.length ? '\n\nTệp bị bỏ qua:\n• ' + loi.join('\n• ') : '');
  SpreadsheetApp.getUi().alert(thongBao);
}

function docNoiDungTep_(tep) {
  var loai = tep.getMimeType();
  if (loai === MimeType.GOOGLE_DOCS) return DocumentApp.openById(tep.getId()).getBody().getText();
  if (loai === MimeType.PLAIN_TEXT || loai === MimeType.CSV || /\.(txt|csv)$/i.test(tep.getName())) {
    return tep.getBlob().getDataAsString('UTF-8');
  }
  // Word / PDF / ảnh chụp màn hình: Drive tự chuyển sang Google Docs (kèm OCR tiếng Việt),
  // đọc chữ xong xóa bản tạm. Chất lượng OCR tùy tệp — kết quả luôn ở CHO_DUYET để bạn rà.
  var chuyenDuoc = loai === MimeType.MICROSOFT_WORD || loai === MimeType.MICROSOFT_WORD_LEGACY ||
    loai === MimeType.PDF || loai === MimeType.PNG || loai === MimeType.JPEG ||
    /\.(docx?|pdf|png|jpe?g)$/i.test(tep.getName());
  if (!chuyenDuoc) {
    throw new Error('định dạng không được hỗ trợ. Hồ sơ nhận: Google Docs, TXT, Word, PDF, ảnh PNG/JPG; ' +
      'bảng số liệu nhận: Google Trang tính, Excel theo mẫu MAU_TONG_HOP_NGHIEN_CUU.');
  }
  var idTam = doiSangGoogleDocs_(tep);
  try {
    return DocumentApp.openById(idTam).getBody().getText();
  } finally {
    try { DriveApp.getFileById(idTam).setTrashed(true); } catch (e) {}
  }
}

/* Chuyển Word/PDF/ảnh sang Google Docs tạm để lấy chữ (OCR tiếng Việt cho PDF và ảnh).
 * Dùng quyền sẵn có, không phải cài thêm; bản tạm bị xóa ngay sau khi đọc. */
function doiSangGoogleDocs_(tep) {
  var phanHoi = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + tep.getId() + '/copy?ocrLanguage=vi', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ name: 'TAM_DOI_' + tep.getName(), mimeType: MimeType.GOOGLE_DOCS })
  });
  if (phanHoi.getResponseCode() !== 200) {
    throw new Error('không đọc được tệp (mã ' + phanHoi.getResponseCode() +
      '). Cách khác: mở tệp, sao chép phần chữ, dán vào Google Docs cùng tên rồi nạp lại.');
  }
  return JSON.parse(phanHoi.getContentText()).id;
}

/*----------- Đường nạp 2: bảng tổng hợp (Google Trang tính / Excel) --------------*/
/* Đọc tab SAN_PHAM và DOI_TAC theo TÊN CỘT ở dòng 1 (thứ tự cột tùy ý).
 * Dòng có mã bắt đầu bằng "VD" là dòng ví dụ của tệp mẫu — luôn bị bỏ qua.
 * Ô trống ở trường quan trọng được điền "CẦN KIỂM TRA". Không gọi AI, không tốn phí. */

var MAU_TH = {
  SAN_PHAM: { khoa: 'MA_SP', cot: ['TEN_SAN_PHAM','NHOM_VAN_DE','KHACH_PHU_HOP','KHACH_CHUA_PHU_HOP',
    'MUC_GIA','TINH_NANG_CHINH','GIOI_HAN','NGUON_CHINH_THUC'] },
  DOI_TAC: { khoa: 'MA_DT', cot: ['TEN_CHUONG_TRINH','MA_SP_LIEN_QUAN','LINK_DANG_KY','LINK_GIOI_THIEU',
    'CACH_GHI_NHAN','THOI_GIAN_GHI_NHAN','MUC_HOA_HONG','DIEU_KIEN_DAO','KY_THANH_TOAN',
    'GIOI_HAN_QUANG_BA','NGUOI_LIEN_HE','NGUON_DIEU_KHOAN'] }
};

var TEN_COT_MAU = {
  SAN_PHAM: ['MÃ SP','TÊN SẢN PHẨM','NHÓM VẤN ĐỀ','KHÁCH PHÙ HỢP','KHÁCH CHƯA PHÙ HỢP',
    'MỨC GIÁ','TÍNH NĂNG CHÍNH','GIỚI HẠN','NGUỒN CHÍNH THỨC','NGÀY KIỂM TRA','GHI CHÚ'],
  DOI_TAC: ['MÃ ĐT','TÊN CHƯƠNG TRÌNH','MÃ SP LIÊN QUAN','LINK ĐĂNG KÝ','LINK GIỚI THIỆU',
    'CÁCH GHI NHẬN','THỜI GIAN GHI NHẬN','MỨC HOA HỒNG','ĐIỀU KIỆN ĐẢO','KỲ THANH TOÁN',
    'GIỚI HẠN QUẢNG BÁ','NGƯỜI LIÊN HỆ','NGUỒN ĐIỀU KHOẢN','NGÀY KIỂM TRA','GHI CHÚ']
};

function napBangTongHop_(tep) {
  var idTam = null, bang;
  if (tep.getMimeType() === MimeType.GOOGLE_SHEETS) {
    bang = SpreadsheetApp.openById(tep.getId());
  } else {
    idTam = doiExcelSangTrangTinh_(tep);
    bang = SpreadsheetApp.openById(idTam);
  }
  var kq = { sp: 0, dt: 0, boQua: [] };
  try {
    kq.sp = napMotTabTongHop_(bang, 'SAN_PHAM', tep.getUrl(), kq.boQua);
    kq.dt = napMotTabTongHop_(bang, 'DOI_TAC', tep.getUrl(), kq.boQua);
    if (kq.sp === 0 && kq.dt === 0 && !kq.boQua.length) {
      throw new Error('không thấy tab SAN_PHAM hoặc DOI_TAC có dữ liệu — dùng đúng tệp mẫu MAU_TONG_HOP_NGHIEN_CUU');
    }
  } finally {
    if (idTam) { try { DriveApp.getFileById(idTam).setTrashed(true); } catch (e) {} }
  }
  return kq;
}

function napMotTabTongHop_(bang, tenTab, linkHoSo, boQua) {
  var tab = bang.getSheetByName(tenTab);
  if (!tab || tab.getLastRow() < 2) return 0;
  var giaTriTho = tab.getDataRange().getValues();
  var viTri = {};
  giaTriTho[0].forEach(function (c, i) { viTri[maCot_(c)] = i; });
  var cauHinh = MAU_TH[tenTab];
  if (viTri[cauHinh.khoa] === undefined) {
    boQua.push('tab ' + tenTab + ' thiếu cột ' + cauHinh.khoa);
    return 0;
  }
  var trangDich = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tenTab);
  var soNap = 0;
  for (var d = 1; d < giaTriTho.length; d++) {
    var hang = giaTriTho[d];
    var ma = String(hang[viTri[cauHinh.khoa]] || '').trim().toUpperCase();
    if (!ma) continue;
    if (ma.indexOf('VD') === 0) continue; // dòng ví dụ của tệp mẫu
    var giaTri = {};
    giaTri[cauHinh.khoa] = ma;
    cauHinh.cot.forEach(function (cot) {
      var o = viTri[cot] !== undefined ? String(hang[viTri[cot]] || '').trim() : '';
      giaTri[cot] = o || 'CẦN KIỂM TRA';
    });
    // hai cột không bắt buộc: để trống được
    if (tenTab === 'DOI_TAC') {
      if (giaTri.LINK_GIOI_THIEU === 'CẦN KIỂM TRA') giaTri.LINK_GIOI_THIEU = '';
      if (giaTri.NGUOI_LIEN_HE === 'CẦN KIỂM TRA') giaTri.NGUOI_LIEN_HE = '';
      if (giaTri.MA_SP_LIEN_QUAN === 'CẦN KIỂM TRA') giaTri.MA_SP_LIEN_QUAN = '';
    }
    var ngayGoc = viTri.NGAY_KIEM_TRA !== undefined ? hang[viTri.NGAY_KIEM_TRA] : '';
    giaTri.NGAY_KIEM_TRA = chuyenNgay_(ngayGoc) ? hienNgay_(ngayGoc) : ngayHomNay_();
    if (viTri.GHI_CHU !== undefined && String(hang[viTri.GHI_CHU] || '').trim()) {
      giaTri.GHI_CHU = String(hang[viTri.GHI_CHU]).trim();
    }
    giaTri[tenTab === 'SAN_PHAM' ? 'TRANG_THAI_DU_LIEU' : 'TRANG_THAI_DUYET'] = 'CHO_DUYET';
    giaTri.LINK_HO_SO = linkHoSo;
    ghiHoacCapNhatDong_(trangDich, TIEU_DE[tenTab], cauHinh.khoa, ma, giaTri);
    soNap++;
  }
  return soNap;
}

/* Đổi tệp Excel sang Google Trang tính tạm để đọc (dùng quyền sẵn có, không cần cài thêm).
 * Bản tạm được xóa ngay sau khi đọc xong. */
function doiExcelSangTrangTinh_(tep) {
  var phanHoi = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + tep.getId() + '/copy', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ name: 'TAM_DOI_' + tep.getName(), mimeType: MimeType.GOOGLE_SHEETS })
  });
  if (phanHoi.getResponseCode() !== 200) {
    throw new Error('không đổi được Excel sang Trang tính (mã ' + phanHoi.getResponseCode() +
      '). Cách khác: mở tệp trong Drive → Tệp → Lưu dưới dạng Google Trang tính rồi chạy lại.');
  }
  return JSON.parse(phanHoi.getContentText()).id;
}

function napMotSanPham_(ma, noiDung, linkHoSo) {
  var prompt =
    'Bạn nhận một hồ sơ nghiên cứu sản phẩm do người kinh doanh tự thu thập từ nguồn chính thức.\n' +
    'CHỈ SỬ DỤNG thông tin có trong hồ sơ dưới đây. KHÔNG bổ sung tính năng, giá hay kết luận từ kiến thức ngoài.\n' +
    'Trường nào hồ sơ không có đủ căn cứ thì ghi đúng chuỗi "CẦN KIỂM TRA".\n' +
    'KHÔNG đưa mức hoa hồng hay thông tin chương trình đối tác vào bất kỳ trường nào.\n\n' +
    'Trả về DUY NHẤT một đối tượng JSON, không kèm lời dẫn, không kèm ```:\n' +
    '{"ten_san_pham":"","nhom_van_de":"","khach_phu_hop":"","khach_chua_phu_hop":"",' +
    '"muc_gia":"","tinh_nang_chinh":"","gioi_han":"","nguon_chinh_thuc":"","ghi_chu":""}\n\n' +
    '--- HỒ SƠ ---\n' + noiDung.substring(0, 30000);

  var kq = bocJSON_(goiAI_(prompt));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('SAN_PHAM');
  var giaTri = {
    MA_SP: ma, TEN_SAN_PHAM: kq.ten_san_pham || 'CẦN KIỂM TRA',
    NHOM_VAN_DE: kq.nhom_van_de || 'CẦN KIỂM TRA', KHACH_PHU_HOP: kq.khach_phu_hop || 'CẦN KIỂM TRA',
    KHACH_CHUA_PHU_HOP: kq.khach_chua_phu_hop || 'CẦN KIỂM TRA', MUC_GIA: kq.muc_gia || 'CẦN KIỂM TRA',
    TINH_NANG_CHINH: kq.tinh_nang_chinh || 'CẦN KIỂM TRA', GIOI_HAN: kq.gioi_han || 'CẦN KIỂM TRA',
    NGUON_CHINH_THUC: kq.nguon_chinh_thuc || 'CẦN KIỂM TRA',
    NGAY_KIEM_TRA: ngayHomNay_(), TRANG_THAI_DU_LIEU: 'CHO_DUYET',
    LINK_HO_SO: linkHoSo, GHI_CHU: kq.ghi_chu || ''
  };
  ghiHoacCapNhatDong_(trang, TIEU_DE.SAN_PHAM, 'MA_SP', ma, giaTri);
}

function napMotDoiTac_(ma, noiDung, linkHoSo) {
  var prompt =
    'Bạn nhận văn bản điều khoản một chương trình đối tác/tiếp thị liên kết do người kinh doanh dán từ nguồn chính thức.\n' +
    'CHỈ SỬ DỤNG thông tin trong văn bản dưới đây. Trường thiếu căn cứ ghi đúng chuỗi "CẦN KIỂM TRA".\n\n' +
    'Trả về DUY NHẤT một đối tượng JSON, không kèm lời dẫn, không kèm ```:\n' +
    '{"ten_chuong_trinh":"","ma_sp_lien_quan":"","link_dang_ky":"","cach_ghi_nhan":"",' +
    '"thoi_gian_ghi_nhan":"","muc_hoa_hong":"","dieu_kien_dao":"","ky_thanh_toan":"",' +
    '"gioi_han_quang_ba":"","nguoi_lien_he":"","nguon_dieu_khoan":"","ghi_chu":""}\n\n' +
    '--- VĂN BẢN ĐIỀU KHOẢN ---\n' + noiDung.substring(0, 30000);

  var kq = bocJSON_(goiAI_(prompt));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DOI_TAC');
  var giaTri = {
    MA_DT: ma, TEN_CHUONG_TRINH: kq.ten_chuong_trinh || 'CẦN KIỂM TRA',
    MA_SP_LIEN_QUAN: kq.ma_sp_lien_quan || '', LINK_DANG_KY: kq.link_dang_ky || 'CẦN KIỂM TRA',
    CACH_GHI_NHAN: kq.cach_ghi_nhan || 'CẦN KIỂM TRA', THOI_GIAN_GHI_NHAN: kq.thoi_gian_ghi_nhan || 'CẦN KIỂM TRA',
    MUC_HOA_HONG: kq.muc_hoa_hong || 'CẦN KIỂM TRA', DIEU_KIEN_DAO: kq.dieu_kien_dao || 'CẦN KIỂM TRA',
    KY_THANH_TOAN: kq.ky_thanh_toan || 'CẦN KIỂM TRA', GIOI_HAN_QUANG_BA: kq.gioi_han_quang_ba || 'CẦN KIỂM TRA',
    NGUOI_LIEN_HE: kq.nguoi_lien_he || '', NGUON_DIEU_KHOAN: kq.nguon_dieu_khoan || 'CẦN KIỂM TRA',
    NGAY_KIEM_TRA: ngayHomNay_(), TRANG_THAI_DUYET: 'CHO_DUYET',
    LINK_HO_SO: linkHoSo, GHI_CHU: kq.ghi_chu || ''
  };
  ghiHoacCapNhatDong_(trang, TIEU_DE.DOI_TAC, 'MA_DT', ma, giaTri);
}

/*======================= MỤC 3 — TẠO BIỂU MẪU NHU CẦU ============================*/

function taoBieuMauNhuCau() {
  var kho = PropertiesService.getScriptProperties();
  if (kho.getProperty('FORM_ID')) {
    SpreadsheetApp.getUi().alert('Biểu mẫu đã có. Xem liên kết tại menu → Xem liên kết hệ thống.\n' +
      'Muốn tạo lại, xóa thuộc tính FORM_ID trong Cài đặt dự án rồi chạy lại mục này.');
    return;
  }
  var form = FormApp.create('Biểu mẫu nhu cầu chọn phần mềm')
    .setDescription('Bạn điền 7 câu ngắn dưới đây. Chúng tôi đối chiếu với dữ liệu sản phẩm đã kiểm tra ' +
      'và gửi lại bản so sánh phù hợp với doanh nghiệp của bạn.');
  try { form.setCollectEmail(true); } catch (e) {}

  form.addTextItem().setTitle('Doanh nghiệp của bạn có bao nhiêu nhân sự?').setRequired(true);
  form.addTextItem().setTitle('Bao nhiêu người sẽ trực tiếp dùng phần mềm?').setRequired(true);
  form.addParagraphTextItem().setTitle('Bạn cần phần mềm giải quyết những việc gì? (liệt kê cụ thể)').setRequired(true);
  form.addTextItem().setTitle('Hiện bạn đang quản lý bằng công cụ nào?').setRequired(true);
  form.addTextItem().setTitle('Ngân sách tối đa mỗi tháng (VNĐ)?').setRequired(true);
  form.addParagraphTextItem().setTitle('Tính năng nào là bắt buộc phải có?').setRequired(true);
  form.addTextItem().setTitle('Bạn muốn triển khai trong bao lâu?').setRequired(true);

  // chuyển tệp biểu mẫu vào thư mục gốc của hệ thống
  try {
    var goc = DriveApp.getFolderById(kho.getProperty('ID_THU_MUC_GOC'));
    DriveApp.getFileById(form.getId()).moveTo(goc);
  } catch (e) {}

  // trình kích hoạt: mỗi phản hồi mới tự chảy vào KHACH_HANG
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onGuiBieuMau') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onGuiBieuMau').forForm(form).onFormSubmit().create();

  kho.setProperties({ FORM_ID: form.getId(), FORM_URL_SUA: form.getEditUrl(), FORM_URL_GUI: form.getPublishedUrl() });
  ghiNhatKy_('Tạo biểu mẫu', form.getPublishedUrl(), 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Đã tạo biểu mẫu 7 câu và gắn trình kích hoạt.\n\n' +
    'Liên kết gửi khách:\n' + form.getPublishedUrl() + '\n\n' +
    'Mỗi phản hồi sẽ tự tạo một dòng MỚI trong KHACH_HANG kèm MA_KHACH riêng.');
}

function onGuiBieuMau(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('KHACH_HANG');
    var traLoi = e.response.getItemResponses().map(function (r) { return String(r.getResponse()); });
    var email = '';
    try { email = e.response.getRespondentEmail() || ''; } catch (err) {}
    var maKhach = 'KH-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMddHHmmss');

    var giaTri = {
      MA_KHACH: maKhach, NGAY_NHAN: ngayHomNay_(), EMAIL: email, NGUON_KHACH: 'Biểu mẫu nhu cầu',
      QUY_MO_NHAN_SU: traLoi[0] || '', SO_NGUOI_DUNG: traLoi[1] || '',
      VAN_DE_CAN_GIAI_QUYET: traLoi[2] || '', CONG_CU_HIEN_TAI: traLoi[3] || '',
      NGAN_SACH_THANG: traLoi[4] || '', TIEU_CHI_BAT_BUOC: traLoi[5] || '',
      THOI_GIAN_TRIEN_KHAI: traLoi[6] || '', TRANG_THAI_DUYET: 'MOI'
    };
    var dong = TIEU_DE.KHACH_HANG.map(function (c) { return giaTri[c] !== undefined ? giaTri[c] : ''; });
    trang.appendRow(dong);
    ghiNhatKy_('Nhận phản hồi biểu mẫu', maKhach + ' — ' + email, 'THANH_CONG');
  } catch (err) {
    ghiNhatKy_('Nhận phản hồi biểu mẫu', '', 'LOI: ' + err.message);
  }
}

/*===================== MỤC 4 — PHÂN LOẠI KHÁCH MỚI (AI) ==========================*/
/* RÀNG BUỘC CỨNG: prompt chỉ chứa SAN_PHAM đã DA_KIEM_TRA (và còn hạn) cùng nhu cầu
 * khách. Không một trường nào của DOI_TAC — kể cả mức hoa hồng — được đưa vào prompt. */

function phanLoaiKhachMoi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trangKH = ss.getSheetByName('KHACH_HANG');
  var trangSP = ss.getSheetByName('SAN_PHAM');
  if (!trangKH || !trangSP) { SpreadsheetApp.getUi().alert('Chạy mục 1 trước.'); return; }

  // 1) Lập danh mục sản phẩm hợp lệ: DA_KIEM_TRA và chưa quá 90 ngày
  var dsSP = layDuLieu_(trangSP, TIEU_DE.SAN_PHAM);
  var homNay = new Date();
  var spHopLe = [], spQuaHan = 0;
  dsSP.forEach(function (sp) {
    if (sp.TRANG_THAI_DU_LIEU !== 'DA_KIEM_TRA') return;
    var ngay = chuyenNgay_(sp.NGAY_KIEM_TRA);
    if (!ngay || (homNay - ngay) / 86400000 > CAU_HINH.NGUONG_QUA_HAN_NGAY) {
      trangSP.getRange(sp._dong, TIEU_DE.SAN_PHAM.indexOf('TRANG_THAI_DU_LIEU') + 1).setValue('CAN_CAP_NHAT');
      spQuaHan++;
      return;
    }
    spHopLe.push({
      MA_SP: sp.MA_SP, TEN_SAN_PHAM: sp.TEN_SAN_PHAM, NHOM_VAN_DE: sp.NHOM_VAN_DE,
      KHACH_PHU_HOP: sp.KHACH_PHU_HOP, KHACH_CHUA_PHU_HOP: sp.KHACH_CHUA_PHU_HOP,
      MUC_GIA: sp.MUC_GIA, TINH_NANG_CHINH: sp.TINH_NANG_CHINH, GIOI_HAN: sp.GIOI_HAN
    });
  });
  if (!spHopLe.length) {
    SpreadsheetApp.getUi().alert('Không có sản phẩm nào ở trạng thái DA_KIEM_TRA còn trong hạn ' +
      CAU_HINH.NGUONG_QUA_HAN_NGAY + ' ngày.' + (spQuaHan ? '\n' + spQuaHan + ' sản phẩm vừa bị chuyển CAN_CAP_NHAT.' : '') +
      '\nCập nhật dữ liệu sản phẩm trước khi phân loại khách.');
    return;
  }

  // 2) Phân loại từng khách MOI
  var dsKH = layDuLieu_(trangKH, TIEU_DE.KHACH_HANG).filter(function (k) { return k.TRANG_THAI_DUYET === 'MOI'; });
  if (!dsKH.length) { SpreadsheetApp.getUi().alert('Không có khách nào ở trạng thái MOI.'); return; }

  var maHopLe = {};
  spHopLe.forEach(function (sp) { maHopLe[String(sp.MA_SP).toUpperCase()] = true; });
  var soXong = 0, soLoi = 0;

  dsKH.forEach(function (kh) {
    try {
      var kq = bocJSON_(goiAI_(promptPhanLoai_(kh, spHopLe)));
      var mucXuLy = TRANG_THAI.MUC.indexOf(kq.muc_xu_ly) >= 0 ? kq.muc_xu_ly : 'MUC_2';
      var luaChon = (kq.lua_chon || []).slice(0, 3);
      luaChon.forEach(function (lc) {
        if (!maHopLe[String(lc.ma_sp || '').toUpperCase()]) {
          throw new Error('AI trả về mã sản phẩm không tồn tại: ' + lc.ma_sp);
        }
      });
      var trangThaiMoi = mucXuLy === 'MUC_1' ? 'CHO_DUYET' : (mucXuLy === 'MUC_2' ? 'CAN_HOI_THEM' : 'CHUYEN_NGUOI');
      var deXuat = luaChon.map(function (lc) { return lc.ma_sp; }).join('; ');
      var conThieu = (kq.thong_tin_con_thieu || []).join('; ');

      ghiO_(trangKH, kh._dong, 'KET_QUA_AI', JSON.stringify(kq));
      ghiO_(trangKH, kh._dong, 'DE_XUAT', deXuat);
      ghiO_(trangKH, kh._dong, 'THONG_TIN_CON_THIEU', conThieu);
      ghiO_(trangKH, kh._dong, 'MUC_XU_LY', mucXuLy);
      ghiO_(trangKH, kh._dong, 'TRANG_THAI_DUYET', trangThaiMoi);
      soXong++;
    } catch (e) {
      ghiO_(trangKH, kh._dong, 'GHI_CHU', 'Lỗi phân loại: ' + e.message);
      ghiNhatKy_('Phân loại khách', kh.MA_KHACH, 'LOI: ' + e.message);
      soLoi++;
    }
  });

  ghiNhatKy_('Phân loại khách mới', soXong + ' khách', soLoi ? soLoi + ' lỗi' : 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Đã phân loại ' + soXong + ' khách' + (soLoi ? ', ' + soLoi + ' lỗi (xem GHI_CHU và NHAT_KY_HE_THONG)' : '') + '.\n\n' +
    'MUC_1 → CHO_DUYET: bạn đọc lại từng lý do rồi mới chuyển DA_DUYET.\n' +
    'MUC_2 → CAN_HOI_THEM: hệ thống sẽ tạo thư hỏi bổ sung, không tự suy đoán.\n' +
    'MUC_3 → CHUYEN_NGUOI: bạn xử lý trực tiếp, hệ thống không tạo thư tư vấn.');
}

function promptPhanLoai_(kh, dsSP) {
  return 'Bạn hỗ trợ phân loại nhu cầu mua phần mềm cho doanh nghiệp nhỏ.\n' +
    'CHỈ SỬ DỤNG dữ liệu sản phẩm được cung cấp dưới đây. Danh sách này KHÔNG chứa mức hoa hồng ' +
    'và bạn không được dùng bất kỳ tiêu chí thương mại nào để xếp hạng.\n' +
    'KHÔNG dùng các từ "tốt nhất", "số một", "phù hợp nhất", "tiết kiệm nhất".\n' +
    'Nếu dữ liệu khách chưa đủ (thiếu quy mô, ngân sách, tiêu chí bắt buộc...), KHÔNG suy đoán — ' +
    'đặt muc_xu_ly = "MUC_2" và liệt kê thong_tin_con_thieu.\n' +
    'Nếu khách cần chuyển dữ liệu từ hệ thống cũ, tích hợp phức tạp, có dữ liệu nhạy cảm hoặc hợp đồng ' +
    'dài hạn/giá trị lớn, đặt muc_xu_ly = "MUC_3".\n' +
    'Trường hợp còn lại đặt muc_xu_ly = "MUC_1" và chọn tối đa 3 sản phẩm, mỗi sản phẩm phải dùng đúng ' +
    'MA_SP trong danh sách.\n\n' +
    'Trả về DUY NHẤT một đối tượng JSON, không kèm lời dẫn, không kèm ```:\n' +
    '{"muc_xu_ly":"MUC_1|MUC_2|MUC_3","ly_do_phan_muc":"",' +
    '"lua_chon":[{"ma_sp":"","ly_do":["","",""],"diem_chua_phu_hop":"","dieu_kien_loai":""}],' +
    '"thong_tin_con_thieu":[""]}\n\n' +
    '--- NHU CẦU CỦA KHÁCH ---\n' +
    'Quy mô nhân sự: ' + kh.QUY_MO_NHAN_SU + '\n' +
    'Số người dùng: ' + kh.SO_NGUOI_DUNG + '\n' +
    'Việc cần giải quyết: ' + kh.VAN_DE_CAN_GIAI_QUYET + '\n' +
    'Công cụ hiện tại: ' + kh.CONG_CU_HIEN_TAI + '\n' +
    'Ngân sách mỗi tháng: ' + kh.NGAN_SACH_THANG + '\n' +
    'Tiêu chí bắt buộc: ' + kh.TIEU_CHI_BAT_BUOC + '\n' +
    'Thời gian triển khai: ' + kh.THOI_GIAN_TRIEN_KHAI + '\n\n' +
    '--- DANH SÁCH SẢN PHẨM ĐÃ KIỂM TRA (không có dữ liệu hoa hồng) ---\n' +
    JSON.stringify(dsSP);
}

/*===================== MỤC 5 — TẠO THƯ NHÁP GỬI KHÁCH ============================*/
/* Hệ thống CHỈ tạo thư nháp trong Gmail. Người kinh doanh mở thư, kiểm tra và tự bấm Gửi.
 * Liên kết giới thiệu chỉ được chèn từ đối tác DA_DUYET. Khách CHUYEN_NGUOI không có thư tư vấn. */

function taoThuNhapGuiKhach() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trangKH = ss.getSheetByName('KHACH_HANG');
  var dsKH = layDuLieu_(trangKH, TIEU_DE.KHACH_HANG);
  var dsSP = layDuLieu_(ss.getSheetByName('SAN_PHAM'), TIEU_DE.SAN_PHAM);
  var dsDT = layDuLieu_(ss.getSheetByName('DOI_TAC'), TIEU_DE.DOI_TAC);

  var tenSP = {};
  dsSP.forEach(function (sp) { tenSP[String(sp.MA_SP).toUpperCase()] = sp.TEN_SAN_PHAM; });

  // chỉ đối tác DA_DUYET mới được cấp liên kết
  var linkTheoSP = {};
  dsDT.forEach(function (dt) {
    if (dt.TRANG_THAI_DUYET !== 'DA_DUYET') return;
    String(dt.MA_SP_LIEN_QUAN || '').split(/[,;]+/).forEach(function (ma) {
      ma = ma.trim().toUpperCase();
      // chỉ chèn ĐÚNG liên kết giới thiệu; link đăng ký là trang đăng ký làm đối tác,
      // không được gửi cho khách — thiếu link giới thiệu thì thư nháp hiện cảnh báo đỏ
      if (ma && !linkTheoSP[ma]) linkTheoSP[ma] = dt.LINK_GIOI_THIEU || '';
    });
  });

  var soTuVan = 0, soHoiThem = 0, boQua = [];

  dsKH.forEach(function (kh) {
    if (kh.NGAY_GUI) return;
    if (!kh.EMAIL) {
      if (kh.TRANG_THAI_DUYET === 'DA_DUYET' || kh.TRANG_THAI_DUYET === 'CAN_HOI_THEM') {
        boQua.push(kh.MA_KHACH + ' (thiếu email)');
      }
      return;
    }

    if (kh.TRANG_THAI_DUYET === 'DA_DUYET') {
      var kq;
      try { kq = JSON.parse(kh.KET_QUA_AI || '{}'); } catch (e) { boQua.push(kh.MA_KHACH + ' (KET_QUA_AI lỗi)'); return; }
      var phan = [];
      (kq.lua_chon || []).slice(0, 3).forEach(function (lc, i) {
        var ma = String(lc.ma_sp || '').toUpperCase();
        var khoi = '<p style="margin:14px 0 4px"><b>' + (i + 1) + '. ' + (tenSP[ma] || ma) + '</b></p>' +
          '<ul style="margin:0 0 4px 18px">' +
          (lc.ly_do || []).map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
          (lc.diem_chua_phu_hop ? '<p style="margin:2px 0"><i>Điểm cần cân nhắc:</i> ' + lc.diem_chua_phu_hop + '</p>' : '');
        if (linkTheoSP[ma]) {
          khoi += '<p style="margin:2px 0">Đăng ký/dùng thử: <a href="' + linkTheoSP[ma] + '">' + linkTheoSP[ma] + '</a></p>';
        } else {
          khoi += '<p style="margin:2px 0;color:#C62828">[Chưa có liên kết của đối tác DA_DUYET cho sản phẩm này — bổ sung trước khi gửi]</p>';
        }
        phan.push(khoi);
      });
      var noiDung = '<p>Chào bạn,</p>' +
        '<p>Dựa trên nhu cầu bạn gửi (quy mô ' + kh.QUY_MO_NHAN_SU + ' nhân sự, ngân sách ' + kh.NGAN_SACH_THANG +
        '/tháng), dưới đây là các lựa chọn phù hợp theo dữ liệu chúng tôi đã kiểm tra:</p>' +
        phan.join('') +
        '<p style="margin-top:14px">Các nhận xét trên dựa trên tiêu chí bạn cung cấp và dữ liệu đã kiểm tra đến ngày gần nhất; ' +
        'nếu bạn cần làm rõ điểm nào trước khi quyết định, cứ trả lời thư này.</p>' +
        '<p>Trân trọng,<br>[Tên của bạn]</p>';
      GmailApp.createDraft(kh.EMAIL, 'Bản so sánh lựa chọn phần mềm cho doanh nghiệp của bạn — ' + kh.MA_KHACH, '', { htmlBody: noiDung });
      ghiO_(trangKH, kh._dong, 'GHI_CHU', 'Đã tạo thư nháp tư vấn ' + gioHienTai_());
      soTuVan++;
    }

    if (kh.TRANG_THAI_DUYET === 'CAN_HOI_THEM') {
      var cauHoi = String(kh.THONG_TIN_CON_THIEU || 'thông tin bổ sung về nhu cầu của bạn')
        .split(/;\s*/).filter(String).map(function (c) { return '<li>' + c + '</li>'; }).join('');
      var thu = '<p>Chào bạn,</p>' +
        '<p>Cảm ơn bạn đã gửi nhu cầu. Để bản so sánh chính xác thay vì suy đoán, chúng tôi cần bạn bổ sung:</p>' +
        '<ul style="margin:0 0 8px 18px">' + cauHoi + '</ul>' +
        '<p>Bạn trả lời trực tiếp thư này là đủ.</p><p>Trân trọng,<br>[Tên của bạn]</p>';
      GmailApp.createDraft(kh.EMAIL, 'Xin bổ sung thông tin để tư vấn chính xác — ' + kh.MA_KHACH, '', { htmlBody: thu });
      ghiO_(trangKH, kh._dong, 'GHI_CHU', 'Đã tạo thư nháp hỏi thêm ' + gioHienTai_());
      soHoiThem++;
    }
    // CHUYEN_NGUOI: cố ý không tạo thư — ranh giới bắt buộc của chương
  });

  ghiNhatKy_('Tạo thư nháp', soTuVan + ' thư tư vấn, ' + soHoiThem + ' thư hỏi thêm', 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Đã tạo ' + soTuVan + ' thư nháp tư vấn và ' + soHoiThem + ' thư nháp hỏi bổ sung trong Gmail.\n' +
    'KHÔNG thư nào được gửi tự động — bạn mở Gmail, kiểm tra người nhận, liên kết, câu chữ rồi tự bấm Gửi.\n' +
    'Gửi xong, chọn dòng khách và chạy mục 6 để đánh dấu DA_GUI.' +
    (boQua.length ? '\n\nBỏ qua: ' + boQua.join('; ') : ''));
}

function danhDauDaGui() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getActiveSheet();
  if (trang.getName() !== 'KHACH_HANG') { SpreadsheetApp.getUi().alert('Mở trang KHACH_HANG và chọn dòng khách trước.'); return; }
  var dong = trang.getActiveRange().getRow();
  if (dong < 2) { SpreadsheetApp.getUi().alert('Chọn một dòng khách (từ dòng 2 trở xuống).'); return; }
  var maKhach = trang.getRange(dong, TIEU_DE.KHACH_HANG.indexOf('MA_KHACH') + 1).getValue();
  var xacNhan = SpreadsheetApp.getUi().alert('Xác nhận bạn ĐÃ TỰ BẤM GỬI thư cho khách ' + maKhach + ' trong Gmail?',
    SpreadsheetApp.getUi().ButtonSet.YES_NO);
  if (xacNhan !== SpreadsheetApp.getUi().Button.YES) return;
  ghiO_(trang, dong, 'TRANG_THAI_DUYET', 'DA_GUI');
  ghiO_(trang, dong, 'NGAY_GUI', ngayHomNay_());
  ghiNhatKy_('Đánh dấu đã gửi', String(maKhach), 'THANH_CONG');
}

/*===================== MỤC 7 — NHẬP BÁO CÁO HOA HỒNG =============================*/
/* Đọc các tệp CSV trong NAP_HOA_HONG (theo mẫu MAU_HOA_HONG.csv). Ghép theo cặp
 * MA_DOI_TAC + MA_GIAO_DICH: có rồi thì cập nhật, chưa có thì thêm dòng mới.
 * Tệp đã nhập được đổi tên DA_NHAP_ để tránh nhập lại. */

function nhapBaoCaoHoaHong() {
  var kho = PropertiesService.getScriptProperties();
  var idThuMuc = kho.getProperty('ID_NAP_HOA_HONG');
  if (!idThuMuc) { SpreadsheetApp.getUi().alert('Chưa có thư mục NAP_HOA_HONG. Chạy mục 1 trước.'); return; }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('HOA_HONG');
  var thuMuc = DriveApp.getFolderById(idThuMuc);
  var ds = thuMuc.getFiles();
  var soMoi = 0, soCapNhat = 0, soTep = 0, loi = [];

  while (ds.hasNext()) {
    var tep = ds.next();
    var ten = tep.getName();
    if (ten.indexOf('DA_NHAP_') === 0 || ten === 'MAU_HOA_HONG.csv') continue;
    if (!/\.csv$/i.test(ten) && tep.getMimeType() !== MimeType.CSV) { loi.push(ten + ' — không phải CSV, bỏ qua'); continue; }
    try {
      var bang = Utilities.parseCsv(tep.getBlob().getDataAsString('UTF-8'));
      if (bang.length < 2) throw new Error('tệp không có dòng dữ liệu');
      var viTri = {};
      bang[0].forEach(function (c, i) { viTri[maCot_(c)] = i; });
      ['MA_DOI_TAC', 'MA_GIAO_DICH'].forEach(function (bd) {
        if (viTri[bd] === undefined) throw new Error('thiếu cột bắt buộc ' + bd);
      });
      for (var d = 1; d < bang.length; d++) {
        var h = bang[d];
        if (!h.join('').trim()) continue;
        var lay = function (c) { return viTri[c] !== undefined ? String(h[viTri[c]]).trim() : ''; };
        var giaTri = {
          MA_KHACH: lay('MA_KHACH'), MA_DOI_TAC: lay('MA_DOI_TAC'), MA_GIAO_DICH: lay('MA_GIAO_DICH'),
          NGAY_GHI_NHAN: lay('NGAY_GHI_NHAN'), TRANG_THAI: lay('TRANG_THAI') || 'DA_GHI_NHAN',
          HOA_HONG_DU_KIEN: soTien_(lay('HOA_HONG_DU_KIEN')), HOA_HONG_DA_DUYET: soTien_(lay('HOA_HONG_DA_DUYET')),
          TIEN_DA_NHAN: soTien_(lay('TIEN_DA_NHAN')), NGAY_DU_KIEN_NHAN: lay('NGAY_DU_KIEN_NHAN'),
          NGUON_BAO_CAO: lay('NGUON_BAO_CAO') || ten, GHI_CHU: lay('GHI_CHU')
        };
        var khoa = giaTri.MA_DOI_TAC.toUpperCase() + '|' + giaTri.MA_GIAO_DICH.toUpperCase();
        var ketQua = ghiHoacCapNhatDong_(trang, TIEU_DE.HOA_HONG, '_GHEP_HH', khoa, giaTri);
        if (ketQua === 'MOI') soMoi++; else soCapNhat++;
      }
      tep.setName('DA_NHAP_' + ten);
      soTep++;
    } catch (e) { loi.push(ten + ' — ' + e.message); }
  }

  ghiNhatKy_('Nhập báo cáo hoa hồng', soTep + ' tệp: ' + soMoi + ' dòng mới, ' + soCapNhat + ' cập nhật',
    loi.length ? loi.length + ' lỗi' : 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Đã nhập ' + soTep + ' tệp: ' + soMoi + ' giao dịch mới, ' + soCapNhat + ' giao dịch cập nhật.\n' +
    'Chạy tiếp mục 8 để đối soát.' + (loi.length ? '\n\nLỗi:\n• ' + loi.join('\n• ') : ''));
}

/*======================== MỤC 8 — ĐỐI SOÁT HOA HỒNG ==============================*/
/* CHENH_LECH_DOI_SOAT = HOA_HONG_DU_KIEN − HOA_HONG_DA_DUYET
 * TIEN_CON_PHAI_THU  = HOA_HONG_DA_DUYET − TIEN_DA_NHAN                              */

function doiSoatHoaHong() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('HOA_HONG');
  if (!trang || trang.getLastRow() < 2) { thongBaoHoacThu_('Đối soát hoa hồng', 'Chưa có dòng hoa hồng nào.'); return; }

  var ds = layDuLieu_(trang, TIEU_DE.HOA_HONG);
  var soLech = 0, soPhaiThu = 0, tongDuKien = 0, tongDaDuyet = 0, tongDaNhan = 0;

  ds.forEach(function (h) {
    var duKien = soTien_(h.HOA_HONG_DU_KIEN), daDuyet = soTien_(h.HOA_HONG_DA_DUYET), daNhan = soTien_(h.TIEN_DA_NHAN);
    var lech = duKien - daDuyet, phaiThu = daDuyet - daNhan;
    ghiO_(trang, h._dong, 'CHENH_LECH_DOI_SOAT', lech);
    ghiO_(trang, h._dong, 'TIEN_CON_PHAI_THU', phaiThu);
    if (lech !== 0) soLech++;
    if (phaiThu > 0) soPhaiThu++;
    tongDuKien += duKien; tongDaDuyet += daDuyet; tongDaNhan += daNhan;
  });

  var baoCao = 'ĐỐI SOÁT HOA HỒNG — ' + gioHienTai_() + '\n\n' +
    'Hoa hồng dự kiến:  ' + tienVN_(tongDuKien) + '\n' +
    'Hoa hồng đã duyệt: ' + tienVN_(tongDaDuyet) + '\n' +
    'Tiền đã nhận:      ' + tienVN_(tongDaNhan) + '\n\n' +
    soLech + ' giao dịch có chênh lệch dự kiến/duyệt (ô tô đỏ) — kiểm tra từng mã với bảng báo cáo đối tác.\n' +
    soPhaiThu + ' giao dịch còn tiền phải thu (ô tô vàng).\n\n' +
    'Chỉ TIEN_DA_NHAN mới là dòng tiền đã về. Không dùng hoa hồng dự kiến làm doanh thu.';
  ghiNhatKy_('Đối soát hoa hồng', soLech + ' lệch, ' + soPhaiThu + ' còn phải thu', 'THANH_CONG');
  thongBaoHoacThu_('Đối soát hoa hồng — Hệ thống giới thiệu', baoCao);
}

/*========================= MỤC 9 — KIỂM TRA RỦI RO ===============================*/

function kiemTraRuiRo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var homNay = new Date();
  var dong = [];

  // 1) Dữ liệu sản phẩm quá hạn
  var trangSP = ss.getSheetByName('SAN_PHAM');
  var spQuaHan = [];
  layDuLieu_(trangSP, TIEU_DE.SAN_PHAM).forEach(function (sp) {
    if (!sp.MA_SP) return;
    var ngay = chuyenNgay_(sp.NGAY_KIEM_TRA);
    if (!ngay || (homNay - ngay) / 86400000 > CAU_HINH.NGUONG_QUA_HAN_NGAY) {
      if (sp.TRANG_THAI_DU_LIEU !== 'CAN_CAP_NHAT') {
        ghiO_(trangSP, sp._dong, 'TRANG_THAI_DU_LIEU', 'CAN_CAP_NHAT');
      }
      spQuaHan.push(sp.MA_SP + ' — ' + sp.TEN_SAN_PHAM);
    }
  });
  dong.push('1. DỮ LIỆU SẢN PHẨM QUÁ HẠN ' + CAU_HINH.NGUONG_QUA_HAN_NGAY + ' NGÀY: ' + spQuaHan.length);
  spQuaHan.forEach(function (t) { dong.push('   • ' + t + ' → mở lại NGUON_CHINH_THUC, kiểm tra xong mới đổi DA_KIEM_TRA'); });

  // 2) Tỷ trọng hoa hồng theo đối tác 90 ngày
  var dsHH = layDuLieu_(ss.getSheetByName('HOA_HONG'), TIEU_DE.HOA_HONG);
  var theoDT = {}, tongDuyet = 0;
  dsHH.forEach(function (h) {
    var ngay = chuyenNgay_(h.NGAY_GHI_NHAN);
    if (ngay && (homNay - ngay) / 86400000 > 90) return;
    var t = soTien_(h.HOA_HONG_DA_DUYET);
    theoDT[h.MA_DOI_TAC] = (theoDT[h.MA_DOI_TAC] || 0) + t;
    tongDuyet += t;
  });
  dong.push('');
  dong.push('2. PHỤ THUỘC ĐỐI TÁC (hoa hồng đã duyệt, 90 ngày gần nhất):');
  if (tongDuyet > 0) {
    Object.keys(theoDT).sort(function (a, b) { return theoDT[b] - theoDT[a]; }).forEach(function (ma) {
      var tyLe = theoDT[ma] / tongDuyet;
      dong.push('   • ' + ma + ': ' + tienVN_(theoDT[ma]) + ' (' + Math.round(tyLe * 100) + '%)' +
        (tyLe >= CAU_HINH.NGUONG_TAP_TRUNG ? '  ⚠ VƯỢT NGƯỠNG ' + Math.round(CAU_HINH.NGUONG_TAP_TRUNG * 100) + '% — cần đối tác thay thế' : ''));
    });
  } else { dong.push('   • Chưa có hoa hồng được duyệt trong 90 ngày.'); }

  // 3) Khách DA_GUI nhưng chưa có dòng hoa hồng
  var maCoHH = {};
  dsHH.forEach(function (h) { if (h.MA_KHACH) maCoHH[String(h.MA_KHACH).toUpperCase()] = true; });
  var chuaGhiNhan = [];
  layDuLieu_(ss.getSheetByName('KHACH_HANG'), TIEU_DE.KHACH_HANG).forEach(function (k) {
    if (k.TRANG_THAI_DUYET === 'DA_GUI' && !maCoHH[String(k.MA_KHACH).toUpperCase()]) chuaGhiNhan.push(String(k.MA_KHACH));
  });
  dong.push('');
  dong.push('3. KHÁCH ĐÃ GỬI GIỚI THIỆU NHƯNG CHƯA CÓ GHI NHẬN: ' + chuaGhiNhan.length +
    (chuaGhiNhan.length ? ' (' + chuaGhiNhan.join(', ') + ') — truy theo MA_KHACH với bảng báo cáo đối tác' : ''));

  // 4) Khoản đã duyệt quá ngày dự kiến nhận
  var quaHanThu = [];
  dsHH.forEach(function (h) {
    var ngay = chuyenNgay_(h.NGAY_DU_KIEN_NHAN);
    var phaiThu = soTien_(h.HOA_HONG_DA_DUYET) - soTien_(h.TIEN_DA_NHAN);
    if (ngay && ngay < homNay && phaiThu > 0) quaHanThu.push(h.MA_DOI_TAC + '/' + h.MA_GIAO_DICH + ': ' + tienVN_(phaiThu));
  });
  dong.push('');
  dong.push('4. KHOẢN ĐÃ DUYỆT QUÁ NGÀY DỰ KIẾN NHẬN: ' + quaHanThu.length);
  quaHanThu.forEach(function (t) { dong.push('   • ' + t + ' — hỏi đối tác, ghi trao đổi vào GHI_CHU, không xóa số lệch'); });

  dong.push('');
  dong.push('Nguyên tắc: không chỉ thay NGAY_KIEM_TRA để xóa cảnh báo; sản phẩm/điều khoản đã đổi thì phải sửa dữ liệu, nội dung và bản tư vấn liên quan.');

  var baoCao = 'BÁO CÁO KIỂM TRA RỦI RO — ' + gioHienTai_() + '\n\n' + dong.join('\n');
  // luôn gửi một bản vào hộp thư của chính tài khoản đang chạy mã
  try {
    GmailApp.sendEmail(Session.getActiveUser().getEmail(), 'Kiểm tra rủi ro hằng tuần — Hệ thống giới thiệu', baoCao);
  } catch (e) {}
  ghiNhatKy_('Kiểm tra rủi ro', spQuaHan.length + ' SP quá hạn, ' + quaHanThu.length + ' khoản quá hạn', 'THANH_CONG');
  // đã gửi email ở trên; ở đây chỉ thử mở hộp thoại nếu đang có giao diện
  try {
    var html = HtmlService.createHtmlOutput(
      '<pre style="font-family:Consolas,monospace;font-size:12px;white-space:pre-wrap;padding:6px">' +
      baoCao.replace(/</g, '&lt;') + '</pre>').setWidth(640).setHeight(480);
    SpreadsheetApp.getUi().showModalDialog(html, 'Báo cáo kiểm tra rủi ro');
  } catch (e) {}
}

/*========================= MỤC 10 — ĐẶT LỊCH TỰ ĐỘNG =============================*/

function datLichTuDong() {
  ['kiemTraRuiRo', 'doiSoatHoaHong'].forEach(function (ham) {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (t.getHandlerFunction() === ham && t.getTriggerSource() === ScriptApp.TriggerSource.CLOCK) ScriptApp.deleteTrigger(t);
    });
  });
  ScriptApp.newTrigger('kiemTraRuiRo').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  ScriptApp.newTrigger('doiSoatHoaHong').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(16).create();
  ghiNhatKy_('Đặt lịch tự động', 'Rủi ro T2 8h, đối soát T6 16h', 'THANH_CONG');
  SpreadsheetApp.getUi().alert('Đã đặt lịch:\n• Kiểm tra rủi ro: sáng thứ Hai (8h) — báo cáo gửi vào hộp thư của bạn.\n' +
    '• Đối soát hoa hồng: chiều thứ Sáu (16h).\n' +
    'Bảng điều khiển không cần lịch: mỗi lần mở từ menu, nó tự tải số liệu mới nhất.\n' +
    '(Trình kích hoạt nhận khách từ biểu mẫu đã được tạo khi bạn chạy mục 3.)');
}

/*============================== TIỆN ÍCH CHUNG ===================================*/

function xemLienKetHeThong() {
  var kho = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dong = function (nhan, url) {
    return url ? '<p style="margin:6px 0"><b>' + nhan + ':</b><br><a href="' + url + '" target="_blank">' + url + '</a></p>'
               : '<p style="margin:6px 0;color:#999"><b>' + nhan + ':</b> chưa tạo</p>';
  };
  var html = '<div style="font-family:Arial;font-size:13px;padding:4px">' +
    dong('Bảng tính trung tâm', ss.getUrl()) +
    dong('Thư mục gốc', kho.getProperty('ID_THU_MUC_GOC') ? 'https://drive.google.com/drive/folders/' + kho.getProperty('ID_THU_MUC_GOC') : '') +
    dong('Thư mục NAP_DU_LIEU (hồ sơ SP_/DT_)', kho.getProperty('ID_NAP_DU_LIEU') ? 'https://drive.google.com/drive/folders/' + kho.getProperty('ID_NAP_DU_LIEU') : '') +
    dong('Thư mục NAP_HOA_HONG (báo cáo CSV)', kho.getProperty('ID_NAP_HOA_HONG') ? 'https://drive.google.com/drive/folders/' + kho.getProperty('ID_NAP_HOA_HONG') : '') +
    dong('Tệp mẫu MAU_HOA_HONG.csv', kho.getProperty('ID_MAU_CSV') ? 'https://drive.google.com/file/d/' + kho.getProperty('ID_MAU_CSV') : '') +
    dong('Tệp mẫu bảng tổng hợp MAU_TONG_HOP_NGHIEN_CUU', kho.getProperty('ID_MAU_TONG_HOP') ? 'https://docs.google.com/spreadsheets/d/' + kho.getProperty('ID_MAU_TONG_HOP') : '') +
    dong('Biểu mẫu — liên kết gửi khách', kho.getProperty('FORM_URL_GUI')) +
    dong('Biểu mẫu — liên kết chỉnh sửa', kho.getProperty('FORM_URL_SUA')) +
    '</div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Liên kết hệ thống');
}

function kiemTraKetNoiAPI() {
  try {
    var traLoi = goiAI_('Trả lời đúng một từ: OK');
    var kho = PropertiesService.getScriptProperties();
    var khoa = kho.getProperty('API_KEY') || '';
    var nha = khoa.indexOf('sk-ant') === 0 ? 'Claude (Anthropic)' : 'ChatGPT (OpenAI)';
    var model = kho.getProperty('MODEL') || (khoa.indexOf('sk-ant') === 0 ? CAU_HINH.MODEL_ANTHROPIC : CAU_HINH.MODEL_OPENAI);
    SpreadsheetApp.getUi().alert('Kết nối thành công.\nNhà cung cấp: ' + nha + '\nMô hình: ' + model +
      '\nAI trả lời: ' + String(traLoi).substring(0, 80));
  } catch (e) {
    SpreadsheetApp.getUi().alert('Kết nối THẤT BẠI: ' + e.message +
      '\n\nKiểm tra: Cài đặt dự án → Thuộc tính tập lệnh → API_KEY đã dán đúng khóa chưa, tài khoản đã nạp tiền chưa.');
  }
}

/* Gọi mô hình AI. Khóa "sk-ant..." → Anthropic, còn lại → OpenAI.
 * Thuộc tính MODEL (nếu có) sẽ ghi đè tên mô hình mặc định. */
function goiAI_(prompt) {
  var kho = PropertiesService.getScriptProperties();
  var khoa = kho.getProperty('API_KEY');
  if (!khoa) throw new Error('Chưa có API_KEY. Vào Cài đặt dự án → Thuộc tính tập lệnh, thêm API_KEY rồi chạy lại.');
  var laAnthropic = khoa.indexOf('sk-ant') === 0;
  var model = kho.getProperty('MODEL') || (laAnthropic ? CAU_HINH.MODEL_ANTHROPIC : CAU_HINH.MODEL_OPENAI);

  var url, tuyChon;
  if (laAnthropic) {
    url = 'https://api.anthropic.com/v1/messages';
    tuyChon = {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { 'x-api-key': khoa, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({ model: model, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
    };
  } else {
    url = 'https://api.openai.com/v1/chat/completions';
    tuyChon = {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + khoa },
      payload: JSON.stringify({ model: model, temperature: 0.2, messages: [{ role: 'user', content: prompt }] })
    };
  }

  var phanHoi = UrlFetchApp.fetch(url, tuyChon);
  var ma = phanHoi.getResponseCode();
  var than = phanHoi.getContentText();
  if (ma !== 200) throw new Error('API trả mã ' + ma + ': ' + than.substring(0, 300));
  var json = JSON.parse(than);
  if (laAnthropic) return json.content.map(function (k) { return k.text || ''; }).join('');
  return json.choices[0].message.content;
}

function bocJSON_(vanBan) {
  var sach = String(vanBan).replace(/```json/gi, '').replace(/```/g, '').trim();
  var dau = sach.indexOf('{'), cuoi = sach.lastIndexOf('}');
  if (dau < 0 || cuoi < dau) throw new Error('AI không trả về JSON hợp lệ');
  try { return JSON.parse(sach.substring(dau, cuoi + 1)); }
  catch (e) { throw new Error('JSON sai cấu trúc: ' + e.message); }
}

/* Đọc toàn bộ một trang thành mảng đối tượng theo tiêu đề; kèm _dong (số dòng thật). */
function layDuLieu_(trang, tieuDe) {
  if (!trang || trang.getLastRow() < 2) return [];
  var giaTri = trang.getRange(2, 1, trang.getLastRow() - 1, tieuDe.length).getValues();
  var ketQua = [];
  giaTri.forEach(function (hang, i) {
    if (!hang.join('').toString().trim()) return;
    var doiTuong = { _dong: i + 2 };
    tieuDe.forEach(function (cot, j) { doiTuong[cot] = hang[j]; });
    ketQua.push(doiTuong);
  });
  return ketQua;
}

/* Ghi hoặc cập nhật một dòng theo khóa. Khóa '_GHEP_HH' = MA_DOI_TAC|MA_GIAO_DICH.
 * Trả về 'MOI' hoặc 'CAP_NHAT'. Chỉ ghi đè các trường có trong giaTri. */
function ghiHoacCapNhatDong_(trang, tieuDe, cotKhoa, khoa, giaTri) {
  var ds = layDuLieu_(trang, tieuDe);
  var dongCu = null;
  for (var i = 0; i < ds.length; i++) {
    var k = cotKhoa === '_GHEP_HH'
      ? String(ds[i].MA_DOI_TAC).toUpperCase() + '|' + String(ds[i].MA_GIAO_DICH).toUpperCase()
      : String(ds[i][cotKhoa]).toUpperCase();
    if (k === String(khoa).toUpperCase()) { dongCu = ds[i]._dong; break; }
  }
  if (dongCu) {
    tieuDe.forEach(function (cot, j) {
      if (giaTri[cot] !== undefined) trang.getRange(dongCu, j + 1).setValue(giaTri[cot]);
    });
    return 'CAP_NHAT';
  }
  trang.appendRow(tieuDe.map(function (cot) { return giaTri[cot] !== undefined ? giaTri[cot] : ''; }));
  return 'MOI';
}

function ghiO_(trang, dong, tenCot, giaTri) {
  var tieuDe = TIEU_DE[trang.getName()];
  var cot = tieuDe.indexOf(tenCot) + 1;
  if (cot > 0) trang.getRange(dong, cot).setValue(giaTri);
}

function ghiNhatKy_(hanhDong, chiTiet, ketQua) {
  try {
    var trang = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NHAT_KY_HE_THONG');
    if (trang) trang.appendRow([gioHienTai_(), hanhDong, chiTiet, ketQua]);
  } catch (e) {}
}

/* Hiện hộp thoại khi có giao diện; khi chạy theo lịch (không có UI) thì gửi thư. */
function thongBaoHoacThu_(tieuDe, noiDung, dungHtml) {
  try {
    if (dungHtml) {
      var html = HtmlService.createHtmlOutput(
        '<pre style="font-family:Consolas,monospace;font-size:12px;white-space:pre-wrap;padding:6px">' +
        noiDung.replace(/</g, '&lt;') + '</pre>').setWidth(640).setHeight(480);
      SpreadsheetApp.getUi().showModalDialog(html, 'Báo cáo kiểm tra rủi ro');
    } else {
      SpreadsheetApp.getUi().alert(noiDung);
    }
  } catch (e) {
    try { GmailApp.sendEmail(Session.getActiveUser().getEmail(), tieuDe || 'Báo cáo hệ thống giới thiệu', noiDung); } catch (e2) {}
  }
}

function anToan_(ham, macDinh) { try { return ham(); } catch (e) { return macDinh; } }

/* Chuẩn hóa tên cột về mã không dấu: "MÃ SP LIÊN QUAN" → "MA_SP_LIEN_QUAN".
 * Nhờ đó tệp mẫu dùng tiêu đề tiếng Việt có dấu hay mã đều đọc được. */
function maCot_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function soTien_(v) {
  if (typeof v === 'number') return v;
  var s = String(v || '').replace(/[^\d\-]/g, '');
  return s ? parseInt(s, 10) : 0;
}

/* Định dạng số tiền kiểu Việt Nam cho báo cáo văn bản: 1500000 → "1.500.000 đ" */
function tienVN_(so) {
  return String(Math.round(soTien_(so))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
}

function chuyenNgay_(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  var s = String(v || '').trim();
  if (!s) return null;
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  var d = new Date(s);
  return isNaN(d) ? null : d;
}

function hienNgay_(v) {
  var d = chuyenNgay_(v);
  return d ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy') : 'chưa có';
}

function ngayHomNay_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
}

function gioHienTai_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
}