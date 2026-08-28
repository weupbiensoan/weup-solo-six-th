/**
 * =============================================================================
 *  HỆ THỐNG TƯ VẤN DINH DƯỠNG 28 NGÀY — GOOGLE APPS SCRIPT (BẢN DÙNG OPENAI)
 *  Dành cho người vận hành một mình. Toàn bộ quy trình chạy trên 1 bảng tính.
 *
 *  Luồng: Biểu mẫu → KHACH_HANG → AI_DU_THAO → (duyệt/sửa) → KE_HOACH_CUOI
 *         → Gửi Gmail → PHAN_HOI_EMAIL
 *
 *  KHOÁ API: đọc từ Thuộc tính tập lệnh, tên thuộc tính là OPENAI_API_KEY.
 *  MÔ HÌNH: đặt ở hằng số MO_HINH bên dưới. Nếu gặp lỗi model_not_found,
 *           chạy mục menu "9. Liệt kê mô hình khả dụng" để lấy đúng mã.
 *
 *  LƯU Ý VỀ CÁCH ĐẶT TÊN: tên hàm và biến dùng tiếng Việt không dấu để tránh
 *  lỗi mã hoá khi sao chép giữa các trình soạn thảo. Chú thích, tiêu đề cột,
 *  thông báo và câu lệnh gửi AI dùng tiếng Việt có dấu đầy đủ.
 * =============================================================================
 */

// ============================ HẰNG SỐ CẤU HÌNH ==============================

/** Tên các trang tính */
var TRANG_KHACH_HANG = 'KHACH_HANG';
var TRANG_DU_THAO    = 'AI_DU_THAO';
var TRANG_KE_HOACH   = 'KE_HOACH_CUOI';
var TRANG_PHAN_HOI   = 'PHAN_HOI_EMAIL';
var TRANG_CAU_HINH   = 'CAU_HINH';

/** Thông số API OpenAI */
var DIA_CHI_API      = 'https://api.openai.com/v1/chat/completions';
var DIA_CHI_MO_HINH  = 'https://api.openai.com/v1/models';
var TEN_THUOC_TINH   = 'OPENAI_API_KEY';   // Tên thuộc tính tập lệnh chứa khoá
var MO_HINH          = 'gpt-5.6-luna';     // Chạy "Liệt kê mô hình khả dụng" để lấy đúng mã
var TOKEN_DAI        = 8000;               // Tối thiểu 4000; nâng lên 8000 vì model suy luận tiêu token nội bộ
var TOKEN_NGAN       = 256;                // Chỉ dùng cho lệnh kiểm tra kết nối

/** Giới hạn số dòng xử lý mỗi lần chạy, tránh vượt 6 phút của Apps Script */
var GIOI_HAN_MOI_LAN = 3;

/** Mã các câu lệnh lưu trong trang CAU_HINH */
var MA_CL_DU_THAO    = 'CL_DU_THAO';
var MA_CL_SUA_GOP_Y  = 'CL_SUA_GOP_Y';
var MA_CL_KE_HOACH   = 'CL_KE_HOACH';
var MA_CL_PHAN_HOI   = 'CL_PHAN_HOI';

/** Các trạng thái */
var TT_CHO_DUYET      = 'Chờ duyệt';
var TT_CAN_SUA        = 'Cần sửa';
var TT_DONG_Y         = 'Đồng ý';
var TT_CHO_DUYET_CUOI = 'Chờ duyệt cuối';
var TT_DA_DUYET_GUI   = 'Đã duyệt gửi';

/** Tiền tố tiêu đề thư — không chứa thông tin sức khỏe */
var TIEN_TO_TIEU_DE = 'Chương trình 28 ngày';

/**
 * Các cột nhận diện sẽ bị loại bỏ trước khi gửi dữ liệu sang AI.
 * So khớp chính xác (không phân biệt hoa thường, đã bỏ khoảng trắng thừa).
 */
var COT_NHAN_DIEN = [
  'họ và tên',
  'email liên hệ',
  'số điện thoại',
  'dấu thời gian',
  'timestamp',
  'mã khách'
];

/** Từ khoá phòng hờ: cột nào chứa các chuỗi này cũng bị loại */
var TU_KHOA_NHAN_DIEN = ['email', 'e-mail', 'điện thoại', 'sđt', 'họ tên', 'họ và tên'];

/** Tiêu đề các câu hỏi sàng lọc — dùng để dựng cờ chuyển chuyên môn y tế */
var COT_SANG_LOC = [
  'Bạn có đang mang thai hoặc cho con bú không?',
  'Bạn có đang điều trị bệnh hoặc dùng thuốc theo chỉ định của bác sĩ không?',
  'Bạn từng được chẩn đoán hoặc đang điều trị rối loạn ăn uống không?'
];

/** Hàng tiêu đề của từng trang tính */
var TIEU_DE_DU_THAO = [
  'Mã khách', 'Thời điểm tạo', 'Cờ sàng lọc y tế', 'Tóm tắt tình trạng',
  'Thông tin còn thiếu', 'Câu hỏi cần trao đổi', 'Điểm cần người tư vấn kiểm tra',
  'Kế hoạch dự thảo 4 tuần', 'Kế hoạch dự thảo (JSON)', 'Trạng thái duyệt 1',
  'Góp ý', 'Số lần sửa', 'Những gì đã thay đổi', 'Thời điểm sửa gần nhất',
  'Nội dung thô khi lỗi'
];

var TIEU_DE_KE_HOACH = [
  'Mã khách', 'Thời điểm chuyển', 'Họ và tên', 'Email liên hệ',
  'Tóm tắt tình trạng', 'Nội dung kế hoạch gửi khách',
  'Điểm cần người tư vấn kiểm tra', 'Trạng thái duyệt cuối',
  'Thời điểm gửi', 'Ghi chú gửi', 'Nội dung thô khi lỗi'
];

var TIEU_DE_PHAN_HOI = [
  'Mã khách', 'Thời điểm đọc', 'Ngày thư', 'Khách đã thực hiện được gì',
  'Khó khăn', 'Câu hỏi của khách', 'Điểm cần người tư vấn xem',
  'ID thư', 'Nội dung thô khi lỗi'
];

var TIEU_DE_CAU_HINH = [
  'Mã câu lệnh', 'Tên câu lệnh', 'Nội dung câu lệnh', 'Phiên bản', 'Ngày cập nhật'
];


// ======================= NỘI DUNG BỐN CÂU LỆNH GỬI AI =======================
// Các chuỗi dưới đây CHỈ dùng để điền sẵn vào trang CAU_HINH lần đầu.
// Khi chạy, mã luôn đọc câu lệnh từ trang CAU_HINH, không dùng biến này.

var RANG_BUOC_CHUNG =
'RÀNG BUỘC CHUYÊN MÔN — BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI:\n' +
'1. KHÔNG chẩn đoán bệnh. Không nêu tên bệnh. Không suy đoán tình trạng y tế của khách.\n' +
'2. KHÔNG kê thuốc, không kê thực phẩm chức năng, không nêu liều lượng vi chất.\n' +
'3. KHÔNG suy diễn dữ liệu còn thiếu. Nếu phiếu không có thông tin nào đó, ghi thẳng vào\n' +
'   mục "thong_tin_con_thieu". Tuyệt đối không tự điền giá trị giả định để cho đủ.\n' +
'4. KHÔNG tự trả lời thay người tư vấn. Mọi nội dung cần quyết định chuyên môn phải đưa\n' +
'   vào mục dành cho người tư vấn kiểm tra.\n' +
'5. Nội dung chưa đủ thông tin để kết luận thì chuyển sang mục cần người tư vấn kiểm tra,\n' +
'   không được viết như thể đã đủ căn cứ.\n' +
'6. Kế hoạch tập trung vào HÀNH VI và THÓI QUEN (giờ ăn, cấu trúc bữa ăn, cách chuẩn bị,\n' +
'   cách tự theo dõi). Không đặt chỉ tiêu calo, không đặt chỉ tiêu cân nặng, không đặt\n' +
'   định lượng dinh dưỡng cụ thể — đó là phần thuộc thẩm quyền của người tư vấn.\n' +
'7. Nếu dữ liệu cho thấy dấu hiệu cần chuyên môn y tế (thai kỳ, đang điều trị bệnh,\n' +
'   tiền sử rối loạn ăn uống, triệu chứng bất thường), DỪNG phần kế hoạch và nêu rõ\n' +
'   ở mục cần người tư vấn kiểm tra.\n' +
'8. Toàn bộ nội dung viết bằng tiếng Việt.\n';

var CAU_LENH_DU_THAO =
'Bạn là trợ lý soạn thảo cho một người tư vấn dinh dưỡng đang phục vụ khách hàng làm việc\n' +
'văn phòng trong chương trình 28 ngày. Bạn KHÔNG phải là người tư vấn. Sản phẩm của bạn là\n' +
'BẢN DỰ THẢO để người tư vấn đọc, sửa và chịu trách nhiệm cuối cùng.\n\n' +
RANG_BUOC_CHUNG + '\n' +
'ĐỊNH DẠNG TRẢ VỀ:\n' +
'Chỉ trả về MỘT đối tượng JSON hợp lệ. Không kèm lời dẫn. Không kèm dấu ```.\n' +
'{\n' +
'  "tom_tat_tinh_trang": "chuỗi, 3-6 câu, chỉ mô tả lại những gì phiếu có",\n' +
'  "thong_tin_con_thieu": ["chuỗi"],\n' +
'  "cau_hoi_can_trao_doi": ["chuỗi"],\n' +
'  "diem_can_nguoi_tu_van_kiem_tra": ["chuỗi"],\n' +
'  "ke_hoach_du_thao": [\n' +
'    {\n' +
'      "tuan": 1,\n' +
'      "muc_tieu": "chuỗi",\n' +
'      "viec_can_lam": ["chuỗi"],\n' +
'      "tan_suat": "chuỗi",\n' +
'      "cach_tu_ghi_nhan": "chuỗi"\n' +
'    }\n' +
'  ]\n' +
'}\n' +
'Mảng "ke_hoach_du_thao" phải có đúng 4 phần tử, ứng với tuần 1 đến tuần 4.';

var CAU_LENH_SUA_GOP_Y =
'Bạn là trợ lý soạn thảo cho một người tư vấn dinh dưỡng. Người tư vấn đã đọc bản dự thảo\n' +
'và ghi góp ý. Nhiệm vụ của bạn là VIẾT LẠI bản dự thảo theo đúng góp ý đó.\n\n' +
'QUY TẮC SỬA:\n' +
'- CHỈ sửa đúng phần được góp ý. Giữ nguyên toàn bộ phần còn lại, giữ nguyên cả câu chữ.\n' +
'- Không tự ý thêm ý mới ngoài phạm vi góp ý.\n' +
'- Nếu góp ý mâu thuẫn với ràng buộc chuyên môn bên dưới, KHÔNG thực hiện phần mâu thuẫn\n' +
'  và ghi lý do vào "diem_can_nguoi_tu_van_kiem_tra".\n' +
'- Nếu góp ý không rõ, không đoán ý. Ghi câu hỏi làm rõ vào "cau_hoi_can_trao_doi".\n' +
'- Liệt kê đầy đủ những gì đã thay đổi vào "nhung_gi_da_thay_doi".\n\n' +
RANG_BUOC_CHUNG + '\n' +
'ĐỊNH DẠNG TRẢ VỀ:\n' +
'Chỉ trả về MỘT đối tượng JSON hợp lệ, không lời dẫn, không dấu ```.\n' +
'Giữ nguyên cấu trúc của bản dự thảo gốc, bổ sung thêm một khoá:\n' +
'{\n' +
'  "tom_tat_tinh_trang": "chuỗi",\n' +
'  "thong_tin_con_thieu": ["chuỗi"],\n' +
'  "cau_hoi_can_trao_doi": ["chuỗi"],\n' +
'  "diem_can_nguoi_tu_van_kiem_tra": ["chuỗi"],\n' +
'  "ke_hoach_du_thao": [{"tuan": 1, "muc_tieu": "", "viec_can_lam": [], "tan_suat": "", "cach_tu_ghi_nhan": ""}],\n' +
'  "nhung_gi_da_thay_doi": ["chuỗi, mỗi dòng một thay đổi cụ thể"]\n' +
'}';

var CAU_LENH_KE_HOACH =
'Bạn là trợ lý soạn thảo. Người tư vấn đã DUYỆT bản dự thảo. Nhiệm vụ của bạn là chuyển bản\n' +
'dự thảo đó thành nội dung thư gửi cho khách, dễ đọc, không dùng thuật ngữ chuyên môn nặng.\n\n' +
'QUY TẮC SOẠN:\n' +
'- Giữ nguyên nội dung chuyên môn đã được duyệt. Không thêm khuyến nghị mới.\n' +
'- Không đưa các câu hỏi nội bộ hay ghi chú dành cho người tư vấn vào thư gửi khách.\n' +
'- Cấu trúc: lời chào ngắn → tóm tắt điểm xuất phát → kế hoạch tuần 1 đến tuần 4 →\n' +
'  cách tự ghi nhận → phần lưu ý an toàn → lời mời phản hồi.\n' +
'- Phần lưu ý an toàn phải nêu rõ: đây là tư vấn thói quen ăn uống, không thay thế chẩn đoán\n' +
'  hoặc điều trị y tế; nếu xuất hiện triệu chứng bất thường, khách cần đi khám bác sĩ.\n' +
'- Lời mời phản hồi phải hướng dẫn khách trả lời ngay trên thư này và GIỮ NGUYÊN tiêu đề thư.\n' +
'- Không nhắc tên khách, không nhắc email hay số điện thoại trong nội dung.\n' +
'- Xưng hô: dùng "bạn" cho khách và "chúng tôi" cho bên tư vấn.\n\n' +
RANG_BUOC_CHUNG + '\n' +
'ĐỊNH DẠNG TRẢ VỀ:\n' +
'Chỉ trả về MỘT đối tượng JSON hợp lệ, không lời dẫn, không dấu ```.\n' +
'{\n' +
'  "noi_dung_gui_khach": "chuỗi văn bản thuần, dùng ký tự xuống dòng \\n để phân đoạn",\n' +
'  "diem_can_nguoi_tu_van_kiem_tra": ["chuỗi, những chỗ bạn không chắc và người tư vấn nên đọc lại trước khi gửi"]\n' +
'}';

var CAU_LENH_PHAN_HOI =
'Bạn là trợ lý xử lý thư phản hồi cho một người tư vấn dinh dưỡng. Bạn nhận nội dung thư\n' +
'khách gửi trong quá trình theo chương trình 28 ngày.\n\n' +
'NHIỆM VỤ: TÓM TẮT thư thành bốn mục. Chỉ tóm tắt những gì thư thực sự nói.\n\n' +
'QUY TẮC:\n' +
'- KHÔNG trả lời câu hỏi của khách. Chỉ ghi lại câu hỏi đó.\n' +
'- KHÔNG đưa lời khuyên, không đề xuất điều chỉnh kế hoạch.\n' +
'- KHÔNG suy diễn. Thư không nói thì không ghi.\n' +
'- Nếu thư có dấu hiệu cần chuyên môn y tế (triệu chứng bất thường, đau, choáng, sụt cân\n' +
'  nhanh, dấu hiệu liên quan rối loạn ăn uống), đưa vào "diem_can_nguoi_tu_van_xem" và\n' +
'  ghi rõ mức độ ưu tiên cao.\n' +
'- Bỏ qua phần trích dẫn thư cũ, chữ ký, chân thư quảng cáo.\n\n' +
RANG_BUOC_CHUNG + '\n' +
'ĐỊNH DẠNG TRẢ VỀ:\n' +
'Chỉ trả về MỘT đối tượng JSON hợp lệ, không lời dẫn, không dấu ```.\n' +
'{\n' +
'  "da_thuc_hien_duoc": ["chuỗi"],\n' +
'  "kho_khan": ["chuỗi"],\n' +
'  "cau_hoi_cua_khach": ["chuỗi"],\n' +
'  "diem_can_nguoi_tu_van_xem": ["chuỗi"]\n' +
'}';


// ================================= MENU =====================================

/**
 * Tạo menu "Tư vấn AI" mỗi khi mở bảng tính.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tư vấn AI')
    .addItem('1. Tạo khung trang tính', 'taoKhungTrangTinh')
    .addItem('2. Tạo biểu mẫu thu thông tin', 'taoBieuMau')
    .addSeparator()
    .addItem('3. Tạo bản dự thảo', 'taoBanDuThao')
    .addItem('4. Sửa theo góp ý', 'suaTheoGopY')
    .addItem('5. Chuyển sang bảng kế hoạch hoàn chỉnh', 'chuyenSangKeHoachCuoi')
    .addItem('6. Gửi kế hoạch qua Gmail', 'guiKeHoachQuaGmail')
    .addItem('7. Đọc thư phản hồi', 'docThuPhanHoi')
    .addSeparator()
    .addItem('8. Kiểm tra kết nối API', 'kiemTraKetNoiApi')
    .addItem('9. Liệt kê mô hình khả dụng', 'lietKeMoHinh')
    .addItem('Hướng dẫn cài kích hoạt', 'huongDanCaiKichHoat')
    .addToUi();
}


// ========================= HÀM TIỆN ÍCH DÙNG CHUNG ==========================

/** Lấy bảng tính đang mở. Không bao giờ tạo bảng tính mới. */
function layBangTinh_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Lấy trang tính theo tên, ném lỗi rõ ràng nếu chưa có.
 */
function layTrang_(tenTrang) {
  var trang = layBangTinh_().getSheetByName(tenTrang);
  if (!trang) {
    throw new Error('Chưa có trang tính "' + tenTrang + '". ' +
      'Hãy chạy mục "1. Tạo khung trang tính" (và mục "2. Tạo biểu mẫu" nếu là KHACH_HANG).');
  }
  return trang;
}

/**
 * Tạo bản đồ tiêu đề cột → chỉ số cột (bắt đầu từ 0).
 * Toàn bộ mã tra cột theo TÊN, không dùng vị trí cố định.
 */
function docBanDoCot_(trang) {
  var soCot = trang.getLastColumn();
  if (soCot === 0) {
    throw new Error('Trang tính "' + trang.getName() + '" chưa có hàng tiêu đề.');
  }
  var hangTieuDe = trang.getRange(1, 1, 1, soCot).getValues()[0];
  var banDo = {};
  for (var i = 0; i < hangTieuDe.length; i++) {
    var ten = chuanHoa_(hangTieuDe[i]);
    if (ten !== '') {
      banDo[ten] = i;
    }
  }
  return banDo;
}

/** Chuẩn hoá chuỗi tiêu đề: bỏ khoảng trắng thừa, chuyển thường. */
function chuanHoa_(giaTri) {
  return String(giaTri === null || giaTri === undefined ? '' : giaTri)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Lấy giá trị một ô theo tên cột. Trả về chuỗi rỗng nếu không có cột đó.
 */
function layO_(dongDuLieu, banDoCot, tenCot) {
  var viTri = banDoCot[chuanHoa_(tenCot)];
  if (viTri === undefined) return '';
  var giaTri = dongDuLieu[viTri];
  return giaTri === null || giaTri === undefined ? '' : giaTri;
}

/**
 * Lấy chỉ số cột (1-based) theo tên. Ném lỗi nếu thiếu cột.
 */
function layChiSoCot_(banDoCot, tenCot, tenTrang) {
  var viTri = banDoCot[chuanHoa_(tenCot)];
  if (viTri === undefined) {
    throw new Error('Trang "' + tenTrang + '" thiếu cột "' + tenCot + '". ' +
      'Hãy kiểm tra lại hàng tiêu đề, không đổi tên cột thủ công.');
  }
  return viTri + 1;
}

/** Định dạng thời gian hiện tại theo múi giờ của bảng tính. */
function thoiDiemHienTai_() {
  return Utilities.formatDate(new Date(), layBangTinh_().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Thông báo cho người dùng. Chạy được cả khi gọi từ menu lẫn từ kích hoạt tự động.
 */
function thongBao_(tieuDe, noiDung) {
  Logger.log('[' + tieuDe + '] ' + noiDung);
  try {
    var giaoDien = SpreadsheetApp.getUi();
    giaoDien.alert(tieuDe, noiDung, giaoDien.ButtonSet.OK);
  } catch (loi) {
    // Đang chạy từ kích hoạt tự động, không có giao diện. Bỏ qua.
  }
}

/** Chuyển mảng thành chuỗi gạch đầu dòng để ghi vào ô. */
function ganhSachThanhChuoi_(mang) {
  if (!mang || !mang.length) return '(không có)';
  var ketQua = [];
  for (var i = 0; i < mang.length; i++) {
    ketQua.push('- ' + String(mang[i]));
  }
  return ketQua.join('\n');
}

/** Định dạng kế hoạch 4 tuần thành văn bản dễ đọc cho người tư vấn. */
function dinhDangKeHoach_(keHoach) {
  if (!keHoach || !keHoach.length) return '(AI không trả về kế hoạch)';
  var doan = [];
  for (var i = 0; i < keHoach.length; i++) {
    var tuan = keHoach[i] || {};
    var khoi = 'TUẦN ' + (tuan.tuan || (i + 1));
    khoi += '\nMục tiêu: ' + (tuan.muc_tieu || '(trống)');
    khoi += '\nViệc cần làm:\n' + ganhSachThanhChuoi_(tuan.viec_can_lam);
    khoi += '\nTần suất: ' + (tuan.tan_suat || '(trống)');
    khoi += '\nCách tự ghi nhận: ' + (tuan.cach_tu_ghi_nhan || '(trống)');
    doan.push(khoi);
  }
  return doan.join('\n\n');
}


// ============================ GỌI OPENAI API ================================

/** Đọc khoá API từ thuộc tính script. Không bao giờ viết khoá trong mã. */
function layKhoaApi_() {
  var khoa = PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH);
  if (!khoa) {
    throw new Error('Chưa cấu hình khoá API. Vào Apps Script → Cài đặt dự án → ' +
      'Thuộc tính tập lệnh → thêm thuộc tính tên ' + TEN_THUOC_TINH + ' với giá trị là khoá của bạn.');
  }

  // Cắt khoảng trắng, xuống dòng và dấu nháy dính theo khi sao chép
  khoa = khoa.trim().replace(/^["'\u201C\u2018]+|["'\u201D\u2019]+$/g, '').trim();

  if (/[^\x20-\x7E]/.test(khoa)) {
    throw new Error('Khoá API chứa ký tự lạ, nhiều khả năng do sao chép qua Word hoặc Google Docs. ' +
      'Hãy tạo khoá mới trên platform.openai.com và dán thẳng vào Thuộc tính tập lệnh.');
  }
  if (khoa.length < 40) {
    throw new Error('Khoá API chỉ dài ' + khoa.length + ' ký tự, nhiều khả năng bị cắt cụt khi sao chép. ' +
      'Trang khoá chỉ hiện đầy đủ một lần lúc tạo, hãy tạo khoá mới và bấm nút sao chép.');
  }
  return khoa;
}

/**
 * Gọi OpenAI Chat Completions API.
 * @param {string} cauLenhHeThong Câu lệnh hệ thống, đọc từ trang CAU_HINH.
 * @param {string} noiDungNguoiDung Dữ liệu gửi kèm.
 * @param {number} soTokenToiDa Giới hạn token đầu ra.
 * @param {boolean} epKieuJson Bật chế độ ép trả về JSON hợp lệ.
 * @return {string} Văn bản mô hình trả về.
 */
function goiOpenAi_(cauLenhHeThong, noiDungNguoiDung, soTokenToiDa, epKieuJson) {
  var duLieuGui = {
    model: MO_HINH,
    max_completion_tokens: soTokenToiDa || TOKEN_DAI,
    messages: [
      { role: 'system', content: cauLenhHeThong },
      { role: 'user', content: noiDungNguoiDung }
    ]
  };

  // Chỉ bật khi thực sự cần JSON. OpenAI yêu cầu câu lệnh phải nhắc tới JSON khi bật cờ này.
  if (epKieuJson) {
    duLieuGui.response_format = { type: 'json_object' };
  }

  var tuyChon = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + layKhoaApi_()
    },
    payload: JSON.stringify(duLieuGui),
    muteHttpExceptions: true   // Bắt buộc: tự xử lý lỗi thay vì để Apps Script nuốt nội dung trả về
  };

  var phanHoi = UrlFetchApp.fetch(DIA_CHI_API, tuyChon);
  var maTrangThai = phanHoi.getResponseCode();
  var noiDungTraVe = phanHoi.getContentText();

  if (maTrangThai !== 200) {
    throw new Error('Gọi OpenAI API thất bại. Mã trạng thái HTTP: ' + maTrangThai +
      '\nMô hình đang dùng: ' + MO_HINH +
      '\nNguyên văn nội dung trả về:\n' + noiDungTraVe);
  }

  var ketQua;
  try {
    ketQua = JSON.parse(noiDungTraVe);
  } catch (loi) {
    throw new Error('Không đọc được phản hồi API dưới dạng JSON.' +
      '\nNguyên văn nội dung trả về:\n' + noiDungTraVe);
  }

  if (!ketQua.choices || !ketQua.choices.length) {
    throw new Error('Phản hồi API không có phần choices.' +
      '\nNguyên văn nội dung trả về:\n' + noiDungTraVe);
  }

  var luaChon = ketQua.choices[0];
  var vanBan = luaChon.message && luaChon.message.content ? String(luaChon.message.content).trim() : '';

  // Model suy luận có thể tiêu hết token cho phần suy luận nội bộ, trả về nội dung rỗng
  if (vanBan === '' && luaChon.finish_reason === 'length') {
    throw new Error('Mô hình đã dùng hết ' + (soTokenToiDa || TOKEN_DAI) +
      ' token mà chưa sinh ra nội dung. Hãy tăng hằng số TOKEN_DAI ở đầu file, ' +
      'ví dụ lên 16000, rồi chạy lại.');
  }
  if (vanBan === '') {
    throw new Error('Phản hồi API không chứa nội dung văn bản.' +
      '\nLý do dừng: ' + (luaChon.finish_reason || 'không rõ') +
      '\nNguyên văn nội dung trả về:\n' + noiDungTraVe);
  }
  return vanBan;
}

/**
 * Cố gắng đọc JSON từ văn bản mô hình trả về.
 * @return {{thanhCong: boolean, duLieu: Object, thoNguyenVan: string}}
 *   Nếu thất bại, thoNguyenVan giữ nguyên văn để ghi vào cột lỗi, bảng không bị hỏng.
 */
function phanTichJson_(vanBan) {
  var chuoi = String(vanBan || '').trim();

  // Gỡ rào ``` nếu mô hình vẫn thêm vào
  chuoi = chuoi.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  // Cắt từ dấu { đầu tiên tới dấu } cuối cùng
  var batDau = chuoi.indexOf('{');
  var ketThuc = chuoi.lastIndexOf('}');
  if (batDau !== -1 && ketThuc !== -1 && ketThuc > batDau) {
    chuoi = chuoi.substring(batDau, ketThuc + 1);
  }

  try {
    var duLieu = JSON.parse(chuoi);
    if (duLieu && typeof duLieu === 'object') {
      return { thanhCong: true, duLieu: duLieu, thoNguyenVan: '' };
    }
  } catch (loi) {
    // Rơi xuống nhánh thất bại bên dưới
  }
  return { thanhCong: false, duLieu: null, thoNguyenVan: String(vanBan || '') };
}


// ========================== ĐỌC CÂU LỆNH TỪ CAU_HINH ========================

/**
 * Đọc nội dung câu lệnh theo mã từ trang CAU_HINH.
 * Mã không bao giờ viết cứng câu lệnh khi chạy.
 */
function docCauLenh_(maCauLenh) {
  var trang = layTrang_(TRANG_CAU_HINH);
  var duLieu = trang.getDataRange().getValues();
  var banDoCot = docBanDoCot_(trang);

  for (var i = 1; i < duLieu.length; i++) {
    if (String(layO_(duLieu[i], banDoCot, 'Mã câu lệnh')).trim() === maCauLenh) {
      var noiDung = String(layO_(duLieu[i], banDoCot, 'Nội dung câu lệnh')).trim();
      if (noiDung === '') {
        throw new Error('Câu lệnh "' + maCauLenh + '" trong trang CAU_HINH đang để trống.');
      }
      return noiDung;
    }
  }
  throw new Error('Không tìm thấy câu lệnh có mã "' + maCauLenh + '" trong trang CAU_HINH. ' +
    'Hãy chạy lại mục "1. Tạo khung trang tính".');
}


// ==================== CHỨC NĂNG 1: TẠO KHUNG TRANG TÍNH =====================

/**
 * Tạo bốn trang tính kèm hàng tiêu đề và điền sẵn bốn câu lệnh vào CAU_HINH.
 * Trang KHACH_HANG do biểu mẫu tạo ra ở bước 2.
 */
function taoKhungTrangTinh() {
  try {
    var bang = layBangTinh_();

    taoTrangNeuThieu_(bang, TRANG_DU_THAO, TIEU_DE_DU_THAO);
    taoTrangNeuThieu_(bang, TRANG_KE_HOACH, TIEU_DE_KE_HOACH);
    taoTrangNeuThieu_(bang, TRANG_PHAN_HOI, TIEU_DE_PHAN_HOI);
    taoTrangNeuThieu_(bang, TRANG_CAU_HINH, TIEU_DE_CAU_HINH);

    dienCauLenhMacDinh_();
    apDanhSachXoDuyet1_();
    apDanhSachXoDuyetCuoi_();

    thongBao_('Hoàn tất',
      'Đã tạo 4 trang tính: AI_DU_THAO, KE_HOACH_CUOI, PHAN_HOI_EMAIL, CAU_HINH.\n\n' +
      'Bốn câu lệnh đã được điền sẵn vào trang CAU_HINH — bạn có thể sửa trực tiếp ở đó.\n\n' +
      'Bước tiếp theo: chạy mục "2. Tạo biểu mẫu thu thông tin".');
  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Tạo một trang tính nếu chưa có, đồng thời bổ sung cột tiêu đề còn thiếu. */
function taoTrangNeuThieu_(bang, tenTrang, hangTieuDe) {
  var trang = bang.getSheetByName(tenTrang);
  if (!trang) {
    trang = bang.insertSheet(tenTrang);
    trang.getRange(1, 1, 1, hangTieuDe.length).setValues([hangTieuDe]);
    trang.getRange(1, 1, 1, hangTieuDe.length).setFontWeight('bold');
    trang.setFrozenRows(1);
    trang.setColumnWidths(1, hangTieuDe.length, 180);
    return trang;
  }

  // Trang đã có: bổ sung những cột tiêu đề còn thiếu vào cuối, không xoá dữ liệu cũ
  var banDoCot = trang.getLastColumn() > 0 ? docBanDoCot_(trang) : {};
  var cotThem = [];
  for (var i = 0; i < hangTieuDe.length; i++) {
    if (banDoCot[chuanHoa_(hangTieuDe[i])] === undefined) {
      cotThem.push(hangTieuDe[i]);
    }
  }
  if (cotThem.length) {
    var cotBatDau = trang.getLastColumn() + 1;
    trang.getRange(1, cotBatDau, 1, cotThem.length).setValues([cotThem]).setFontWeight('bold');
  }
  return trang;
}

/** Điền bốn câu lệnh mặc định vào trang CAU_HINH nếu chưa có. */
function dienCauLenhMacDinh_() {
  var trang = layTrang_(TRANG_CAU_HINH);
  var banDoCot = docBanDoCot_(trang);
  var duLieu = trang.getDataRange().getValues();

  var daCo = {};
  for (var i = 1; i < duLieu.length; i++) {
    var ma = String(layO_(duLieu[i], banDoCot, 'Mã câu lệnh')).trim();
    if (ma) daCo[ma] = true;
  }

  var ngay = thoiDiemHienTai_();
  var danhSach = [
    [MA_CL_DU_THAO,   'Tạo bản dự thảo từ phiếu khách',        CAU_LENH_DU_THAO,   'v1', ngay],
    [MA_CL_SUA_GOP_Y, 'Sửa bản dự thảo theo góp ý',            CAU_LENH_SUA_GOP_Y, 'v1', ngay],
    [MA_CL_KE_HOACH,  'Soạn kế hoạch hoàn chỉnh gửi khách',    CAU_LENH_KE_HOACH,  'v1', ngay],
    [MA_CL_PHAN_HOI,  'Tóm tắt thư phản hồi của khách',        CAU_LENH_PHAN_HOI,  'v1', ngay]
  ];

  var canThem = [];
  for (var j = 0; j < danhSach.length; j++) {
    if (!daCo[danhSach[j][0]]) canThem.push(danhSach[j]);
  }

  if (canThem.length) {
    var dongBatDau = trang.getLastRow() + 1;
    trang.getRange(dongBatDau, 1, canThem.length, 5).setValues(canThem);
    trang.getRange(dongBatDau, 3, canThem.length, 1).setWrap(true);
    trang.setColumnWidth(3, 600);
  }
}

/** Áp danh sách xổ 3 giá trị cho cột Trạng thái duyệt 1. */
function apDanhSachXoDuyet1_() {
  var trang = layTrang_(TRANG_DU_THAO);
  var banDoCot = docBanDoCot_(trang);
  var cot = layChiSoCot_(banDoCot, 'Trạng thái duyệt 1', TRANG_DU_THAO);
  var kiemTra = SpreadsheetApp.newDataValidation()
    .requireValueInList([TT_CHO_DUYET, TT_CAN_SUA, TT_DONG_Y], true)
    .setAllowInvalid(false)
    .setHelpText('Chọn một trong ba giá trị: Chờ duyệt / Cần sửa / Đồng ý.')
    .build();
  trang.getRange(2, cot, trang.getMaxRows() - 1, 1).setDataValidation(kiemTra);
}

/** Áp danh sách xổ 2 giá trị cho cột Trạng thái duyệt cuối. */
function apDanhSachXoDuyetCuoi_() {
  var trang = layTrang_(TRANG_KE_HOACH);
  var banDoCot = docBanDoCot_(trang);
  var cot = layChiSoCot_(banDoCot, 'Trạng thái duyệt cuối', TRANG_KE_HOACH);
  var kiemTra = SpreadsheetApp.newDataValidation()
    .requireValueInList([TT_CHO_DUYET_CUOI, TT_DA_DUYET_GUI], true)
    .setAllowInvalid(false)
    .setHelpText('Chọn một trong hai giá trị: Chờ duyệt cuối / Đã duyệt gửi.')
    .build();
  trang.getRange(2, cot, trang.getMaxRows() - 1, 1).setDataValidation(kiemTra);
}


// ======================== CHỨC NĂNG 2: TẠO BIỂU MẪU =========================

/**
 * Tạo Google Form thu thông tin, nối phản hồi về chính bảng tính đang mở,
 * đổi tên trang phản hồi thành KHACH_HANG và thêm cột Mã khách.
 */
function taoBieuMau() {
  try {
    var bang = layBangTinh_();

    // Ghi lại danh sách trang hiện có, để nhận diện trang phản hồi mới sinh ra
    var tenTrangCu = {};
    var cacTrangCu = bang.getSheets();
    for (var i = 0; i < cacTrangCu.length; i++) {
      tenTrangCu[cacTrangCu[i].getName()] = true;
    }

    var bieuMau = FormApp.create('Phiếu thông tin — Tư vấn dinh dưỡng 28 ngày');
    bieuMau.setDescription(
      'Phiếu này giúp chúng tôi hiểu nhịp làm việc và thói quen ăn uống hiện tại của bạn ' +
      'để xây dựng kế hoạch 28 ngày phù hợp.\n\n' +
      'Lưu ý: đây là dịch vụ tư vấn thói quen ăn uống, không thay thế chẩn đoán hoặc điều trị y tế. ' +
      'Thông tin của bạn chỉ dùng cho mục đích tư vấn.');
    bieuMau.setCollectEmail(false);
    bieuMau.setProgressBar(true);

    themCauHoiBieuMau_(bieuMau);

    // Nối phản hồi về bảng tính ĐANG MỞ. Tuyệt đối không tạo bảng tính mới.
    bieuMau.setDestination(FormApp.DestinationType.SPREADSHEET, bang.getId());
    SpreadsheetApp.flush();
    Utilities.sleep(3000);

    var trangPhanHoi = timTrangPhanHoiMoi_(bang, tenTrangCu);
    if (!trangPhanHoi) {
      throw new Error('Đã tạo biểu mẫu nhưng chưa thấy trang phản hồi. ' +
        'Hãy mở lại bảng tính sau vài giây rồi đổi tên trang phản hồi thành KHACH_HANG thủ công.');
    }

    // Nếu đã tồn tại KHACH_HANG cũ thì đổi tên trang cũ để giữ lại dữ liệu
    var trangCu = bang.getSheetByName(TRANG_KHACH_HANG);
    if (trangCu && trangCu.getSheetId() !== trangPhanHoi.getSheetId()) {
      trangCu.setName(TRANG_KHACH_HANG + '_cu_' +
        Utilities.formatDate(new Date(), bang.getSpreadsheetTimeZone(), 'yyyyMMdd_HHmmss'));
    }
    trangPhanHoi.setName(TRANG_KHACH_HANG);

    themCotMaKhach_(trangPhanHoi);

    var duongDan = bieuMau.getPublishedUrl();
    var duongDanSua = bieuMau.getEditUrl();
    Logger.log('Đường dẫn biểu mẫu gửi khách: ' + duongDan);
    Logger.log('Đường dẫn chỉnh sửa biểu mẫu: ' + duongDanSua);

    thongBao_('Đã tạo biểu mẫu',
      'Đường dẫn gửi khách:\n' + duongDan + '\n\n' +
      'Đường dẫn chỉnh sửa:\n' + duongDanSua + '\n\n' +
      'Trang phản hồi đã được đổi tên thành KHACH_HANG và thêm cột "Mã khách".\n' +
      'Hai đường dẫn này cũng có trong Nhật ký thực thi (Ctrl+Enter trong trình soạn thảo).');
  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Tìm trang tính mới xuất hiện sau khi nối biểu mẫu. */
function timTrangPhanHoiMoi_(bang, tenTrangCu) {
  var cacTrang = bang.getSheets();
  for (var i = 0; i < cacTrang.length; i++) {
    if (!tenTrangCu[cacTrang[i].getName()]) {
      return cacTrang[i];
    }
  }
  // Phòng hờ: tìm trang có nối biểu mẫu
  for (var j = 0; j < cacTrang.length; j++) {
    if (cacTrang[j].getFormUrl()) {
      return cacTrang[j];
    }
  }
  return null;
}

/** Thêm cột "Mã khách" vào cuối hàng tiêu đề của trang KHACH_HANG. */
function themCotMaKhach_(trang) {
  var banDoCot = trang.getLastColumn() > 0 ? docBanDoCot_(trang) : {};
  if (banDoCot[chuanHoa_('Mã khách')] === undefined) {
    var cot = trang.getLastColumn() + 1;
    trang.getRange(1, cot).setValue('Mã khách').setFontWeight('bold');
    trang.setColumnWidth(cot, 160);
  }
  trang.setFrozenRows(1);
}

/** Dựng toàn bộ câu hỏi của biểu mẫu. */
function themCauHoiBieuMau_(bieuMau) {

  // --- Phần 1: Thông tin liên hệ ---
  bieuMau.addSectionHeaderItem()
    .setTitle('1. Thông tin liên hệ')
    .setHelpText('Dùng để gửi kế hoạch và trao đổi trong 28 ngày.');

  bieuMau.addTextItem().setTitle('Họ và tên').setRequired(true);

  var oEmail = bieuMau.addTextItem().setTitle('Email liên hệ').setRequired(true);
  oEmail.setValidation(FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText('Vui lòng nhập đúng định dạng email.')
    .build());

  bieuMau.addTextItem().setTitle('Số điện thoại').setRequired(false);

  // --- Phần 2: Nhịp làm việc và sinh hoạt ---
  bieuMau.addSectionHeaderItem().setTitle('2. Nhịp làm việc và sinh hoạt');

  bieuMau.addTextItem()
    .setTitle('Khung giờ làm việc thường ngày của bạn')
    .setHelpText('Ví dụ: 8h30 - 18h, có 1-2 buổi tăng ca mỗi tuần.')
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle('Số buổi ăn ngoài hoặc đặt đồ ăn mỗi tuần')
    .setChoiceValues(['0 - 2 buổi', '3 - 5 buổi', '6 - 10 buổi', 'Trên 10 buổi'])
    .setRequired(true);

  bieuMau.addTextItem()
    .setTitle('Giờ đi ngủ và giờ thức dậy thường ngày')
    .setHelpText('Ví dụ: ngủ khoảng 0h, dậy 6h30.')
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle('Mức độ vận động hiện tại')
    .setChoiceValues([
      'Hầu như không vận động',
      'Đi bộ nhẹ vài buổi mỗi tuần',
      'Tập 1 - 2 buổi mỗi tuần',
      'Tập 3 buổi trở lên mỗi tuần'
    ])
    .setRequired(true);

  bieuMau.addScaleItem()
    .setTitle('Mức độ căng thẳng trong công việc gần đây')
    .setBounds(1, 5)
    .setLabels('Rất thấp', 'Rất cao')
    .setRequired(true);

  // --- Phần 3: Thói quen ăn uống hiện tại ---
  bieuMau.addSectionHeaderItem().setTitle('3. Thói quen ăn uống hiện tại');

  bieuMau.addParagraphTextItem()
    .setTitle('Mô tả một ngày ăn uống điển hình của bạn')
    .setHelpText('Bữa sáng, bữa trưa, bữa tối: ăn gì, ăn lúc mấy giờ, ăn ở đâu.')
    .setRequired(true);

  bieuMau.addCheckboxItem()
    .setTitle('Đồ uống bạn thường dùng trong ngày')
    .setChoiceValues(['Nước lọc', 'Cà phê', 'Trà', 'Nước ngọt', 'Nước ép hoặc sinh tố', 'Bia rượu'])
    .showOtherOption(true)
    .setRequired(true);

  bieuMau.addParagraphTextItem()
    .setTitle('Thói quen ăn vặt: tần suất và món hay ăn')
    .setHelpText('Nếu không ăn vặt, ghi "không".')
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle('Số bữa chính bạn thường bỏ qua trong một tuần')
    .setChoiceValues(['Không bỏ bữa', '1 - 2 bữa', '3 - 5 bữa', 'Trên 5 bữa'])
    .setRequired(true);

  // --- Phần 4: Ràng buộc và sở thích ---
  bieuMau.addSectionHeaderItem().setTitle('4. Ràng buộc và sở thích');

  bieuMau.addParagraphTextItem()
    .setTitle('Dị ứng hoặc thực phẩm bạn không dùng được')
    .setHelpText('Nếu không có, ghi "không".')
    .setRequired(true);

  bieuMau.addCheckboxItem()
    .setTitle('Chế độ ăn bạn đang theo')
    .setChoiceValues([
      'Không theo chế độ nào', 'Ăn chay', 'Ăn thuần chay',
      'Ăn kiêng theo tín ngưỡng', 'Giảm tinh bột', 'Nhịn ăn gián đoạn'
    ])
    .showOtherOption(true)
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle('Điều kiện nấu ăn của bạn')
    .setChoiceValues([
      'Tự nấu gần như hằng ngày',
      'Nấu được vài buổi mỗi tuần',
      'Hầu như không nấu, chủ yếu ăn ngoài'
    ])
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle('Thời gian bạn có thể dành cho việc chuẩn bị bữa ăn mỗi ngày')
    .setChoiceValues(['Dưới 15 phút', '15 - 30 phút', '30 - 60 phút', 'Trên 60 phút'])
    .setRequired(true);

  bieuMau.addParagraphTextItem()
    .setTitle('Món ăn bạn thích và món bạn không thích')
    .setRequired(false);

  // --- Phần 5: Mục tiêu ---
  bieuMau.addSectionHeaderItem().setTitle('5. Mục tiêu trong 28 ngày');

  bieuMau.addParagraphTextItem()
    .setTitle('Bạn muốn đạt được điều gì sau 28 ngày?')
    .setHelpText('Ví dụ: ăn sáng đều đặn, bớt ăn khuya, ăn trưa chủ động hơn.')
    .setRequired(true);

  bieuMau.addParagraphTextItem()
    .setTitle('Điều gì khiến bạn khó duy trì thói quen ăn uống hiện nay?')
    .setRequired(true);

  bieuMau.addParagraphTextItem()
    .setTitle('Bạn đã từng thử cách nào chưa và kết quả ra sao?')
    .setRequired(false);

  // --- Phần 6: Sàng lọc ---
  bieuMau.addSectionHeaderItem()
    .setTitle('6. Phần sàng lọc')
    .setHelpText('Phần này giúp chúng tôi xác định trường hợp cần chuyển sang chuyên môn y tế. ' +
      'Nếu bạn thuộc một trong các trường hợp bên dưới, chúng tôi sẽ trao đổi riêng trước khi bắt đầu.');

  bieuMau.addMultipleChoiceItem()
    .setTitle(COT_SANG_LOC[0])
    .setChoiceValues(['Có', 'Không', 'Không muốn trả lời'])
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle(COT_SANG_LOC[1])
    .setChoiceValues(['Có', 'Không', 'Không muốn trả lời'])
    .setRequired(true);

  bieuMau.addMultipleChoiceItem()
    .setTitle(COT_SANG_LOC[2])
    .setChoiceValues(['Có', 'Không', 'Không muốn trả lời'])
    .setRequired(true);

  bieuMau.addParagraphTextItem()
    .setTitle('Nếu bạn chọn "Có" ở bất kỳ mục nào phía trên, vui lòng mô tả thêm')
    .setHelpText('Không bắt buộc. Chỉ ghi những gì bạn thấy thoải mái chia sẻ.')
    .setRequired(false);

  bieuMau.addCheckboxItem()
    .setTitle('Xác nhận')
    .setChoiceValues([
      'Tôi hiểu đây là dịch vụ tư vấn thói quen ăn uống, không thay thế chẩn đoán hoặc điều trị y tế.'
    ])
    .setRequired(true);
}


// ============================== CẤP MÃ KHÁCH ================================

/**
 * Hàm chạy khi biểu mẫu được gửi. Cài đặt kích hoạt thủ công (xem hướng dẫn).
 */
function khiBieuMauDuocGui(e) {
  try {
    capMaKhachChoDongThieu_();
  } catch (loi) {
    Logger.log('Lỗi khi cấp mã khách: ' + loi.message);
  }
}

/** Cấp mã khách cho mọi dòng trong KHACH_HANG còn trống mã. */
function capMaKhachChoDongThieu_() {
  var trang = layTrang_(TRANG_KHACH_HANG);
  var soDong = trang.getLastRow();
  if (soDong < 2) return 0;

  var banDoCot = docBanDoCot_(trang);
  var cotMa = layChiSoCot_(banDoCot, 'Mã khách', TRANG_KHACH_HANG);
  var giaTriMa = trang.getRange(2, cotMa, soDong - 1, 1).getValues();

  var mui = layBangTinh_().getSpreadsheetTimeZone();
  var ngay = Utilities.formatDate(new Date(), mui, 'yyyyMMdd');

  // Đếm số mã đã cấp trong ngày để tránh trùng
  var demTrongNgay = 0;
  for (var i = 0; i < giaTriMa.length; i++) {
    if (String(giaTriMa[i][0]).indexOf('KH-' + ngay + '-') === 0) demTrongNgay++;
  }

  var soCap = 0;
  for (var j = 0; j < giaTriMa.length; j++) {
    if (String(giaTriMa[j][0]).trim() === '') {
      demTrongNgay++;
      giaTriMa[j][0] = 'KH-' + ngay + '-' + ('00' + demTrongNgay).slice(-3);
      soCap++;
    }
  }

  if (soCap > 0) {
    trang.getRange(2, cotMa, soDong - 1, 1).setValues(giaTriMa);
  }
  return soCap;
}


// ===================== CHỨC NĂNG 3: TẠO BẢN DỰ THẢO =========================

/**
 * Đọc các dòng khách chưa có bản dự thảo, loại bỏ cột nhận diện,
 * gửi phần còn lại sang OpenAI API và ghi kết quả vào AI_DU_THAO.
 */
function taoBanDuThao() {
  try {
    capMaKhachChoDongThieu_();

    var trangKhach = layTrang_(TRANG_KHACH_HANG);
    var trangDuThao = layTrang_(TRANG_DU_THAO);

    var duLieuKhach = trangKhach.getDataRange().getValues();
    if (duLieuKhach.length < 2) {
      thongBao_('Không có dữ liệu', 'Trang KHACH_HANG chưa có phản hồi nào.');
      return;
    }

    var banDoKhach = docBanDoCot_(trangKhach);
    var tieuDeKhach = trangKhach.getRange(1, 1, 1, trangKhach.getLastColumn()).getValues()[0];
    var daCoDuThao = layTapMaKhachDaCo_(trangDuThao);
    var cauLenh = docCauLenh_(MA_CL_DU_THAO);

    var soXuLy = 0, soLoi = 0, danhSachLoi = [];

    for (var i = 1; i < duLieuKhach.length && soXuLy < GIOI_HAN_MOI_LAN; i++) {
      var maKhach = String(layO_(duLieuKhach[i], banDoKhach, 'Mã khách')).trim();
      if (!maKhach || daCoDuThao[maKhach]) continue;

      try {
        xuLyMotBanDuThao_(trangDuThao, duLieuKhach[i], tieuDeKhach, maKhach, cauLenh);
        soXuLy++;
      } catch (loiDong) {
        soLoi++;
        danhSachLoi.push(maKhach + ': ' + loiDong.message);
      }
    }

    apDanhSachXoDuyet1_();

    var thongDiep = 'Đã tạo ' + soXuLy + ' bản dự thảo.';
    if (soLoi > 0) thongDiep += '\n\nCó ' + soLoi + ' dòng lỗi:\n' + danhSachLoi.join('\n');
    if (soXuLy === GIOI_HAN_MOI_LAN) {
      thongDiep += '\n\nĐã chạm giới hạn ' + GIOI_HAN_MOI_LAN +
        ' dòng mỗi lần. Chạy lại mục này để xử lý tiếp các dòng còn lại.';
    }
    thongBao_('Tạo bản dự thảo', thongDiep);

  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Xử lý một dòng khách thành một dòng dự thảo. */
function xuLyMotBanDuThao_(trangDuThao, dongKhach, tieuDeKhach, maKhach, cauLenh) {
  var coSangLoc = kiemTraCoSangLoc_(dongKhach, tieuDeKhach);

  // Trường hợp cần chuyển chuyên môn y tế: KHÔNG gọi AI, KHÔNG sinh kế hoạch
  if (coSangLoc !== '') {
    ghiDongDuThao_(trangDuThao, {
      maKhach: maKhach,
      coSangLoc: coSangLoc,
      tomTat: 'DỪNG TỰ ĐỘNG. Phiếu có dấu hiệu cần chuyên môn y tế nên hệ thống không sinh kế hoạch.',
      thongTinThieu: '(không xử lý)',
      cauHoi: '(không xử lý)',
      canKiemTra: 'Bạn cần trực tiếp trao đổi với khách và quyết định có tiếp nhận hay giới thiệu ' +
        'sang chuyên môn y tế.\nSau khi xử lý xong, xoá nội dung ô "Cờ sàng lọc y tế" rồi chạy lại ' +
        'mục "3. Tạo bản dự thảo" nếu muốn sinh kế hoạch.',
      keHoachVanBan: '(không sinh kế hoạch)',
      keHoachJson: '',
      thoNguyenVan: ''
    });
    return;
  }

  var duLieuGui = dungDuLieuGuiAi_(dongKhach, tieuDeKhach);
  var vanBan = goiOpenAi_(cauLenh,
    'Dưới đây là phiếu thông tin của một khách hàng, đã loại bỏ thông tin nhận diện.\n' +
    'Hãy tạo bản dự thảo theo đúng định dạng JSON đã quy định.\n\n' + duLieuGui,
    TOKEN_DAI, true);

  var ketQua = phanTichJson_(vanBan);

  if (!ketQua.thanhCong) {
    // AI trả về nội dung không phải JSON: ghi nguyên văn, không làm hỏng bảng
    ghiDongDuThao_(trangDuThao, {
      maKhach: maKhach,
      coSangLoc: '',
      tomTat: 'LỖI ĐỌC JSON — xem cột "Nội dung thô khi lỗi"',
      thongTinThieu: '',
      cauHoi: '',
      canKiemTra: 'AI trả về nội dung không phải JSON hợp lệ. Đọc cột "Nội dung thô khi lỗi" ' +
        'rồi chạy lại mục "3. Tạo bản dự thảo" sau khi xoá dòng này.',
      keHoachVanBan: '',
      keHoachJson: '',
      thoNguyenVan: ketQua.thoNguyenVan
    });
    return;
  }

  var d = ketQua.duLieu;
  ghiDongDuThao_(trangDuThao, {
    maKhach: maKhach,
    coSangLoc: '',
    tomTat: d.tom_tat_tinh_trang || '(trống)',
    thongTinThieu: ganhSachThanhChuoi_(d.thong_tin_con_thieu),
    cauHoi: ganhSachThanhChuoi_(d.cau_hoi_can_trao_doi),
    canKiemTra: ganhSachThanhChuoi_(d.diem_can_nguoi_tu_van_kiem_tra),
    keHoachVanBan: dinhDangKeHoach_(d.ke_hoach_du_thao),
    keHoachJson: JSON.stringify(d),
    thoNguyenVan: ''
  });
}

/**
 * Kiểm tra các câu hỏi sàng lọc. Trả về chuỗi mô tả cờ, hoặc rỗng nếu không có.
 */
function kiemTraCoSangLoc_(dongKhach, tieuDeKhach) {
  var co = [];
  for (var i = 0; i < tieuDeKhach.length; i++) {
    var tieuDe = String(tieuDeKhach[i] || '').trim();
    for (var j = 0; j < COT_SANG_LOC.length; j++) {
      if (chuanHoa_(tieuDe) === chuanHoa_(COT_SANG_LOC[j])) {
        var traLoi = String(dongKhach[i] || '').trim();
        if (chuanHoa_(traLoi) === 'có' || chuanHoa_(traLoi) === 'không muốn trả lời') {
          co.push(tieuDe + ' → ' + traLoi);
        }
      }
    }
  }
  return co.length ? 'CẦN XEM XÉT CHUYÊN MÔN Y TẾ:\n' + co.join('\n') : '';
}

/**
 * Dựng chuỗi dữ liệu gửi AI, đã loại bỏ toàn bộ cột nhận diện.
 */
function dungDuLieuGuiAi_(dongKhach, tieuDeKhach) {
  var cacDong = [];
  for (var i = 0; i < tieuDeKhach.length; i++) {
    var tieuDe = String(tieuDeKhach[i] || '').trim();
    if (tieuDe === '') continue;
    if (laCotNhanDien_(tieuDe)) continue;

    var giaTri = dongKhach[i];
    if (giaTri === null || giaTri === undefined || String(giaTri).trim() === '') {
      cacDong.push(tieuDe + ': (khách không trả lời)');
    } else {
      cacDong.push(tieuDe + ': ' + String(giaTri).trim());
    }
  }
  return cacDong.join('\n');
}

/** Xác định một cột có phải cột nhận diện hay không. */
function laCotNhanDien_(tieuDe) {
  var ten = chuanHoa_(tieuDe);
  for (var i = 0; i < COT_NHAN_DIEN.length; i++) {
    if (ten === COT_NHAN_DIEN[i]) return true;
  }
  for (var j = 0; j < TU_KHOA_NHAN_DIEN.length; j++) {
    if (ten.indexOf(TU_KHOA_NHAN_DIEN[j]) !== -1) return true;
  }
  return false;
}

/** Ghi một dòng vào AI_DU_THAO theo đúng tên cột. */
function ghiDongDuThao_(trang, thongTin) {
  var banDoCot = docBanDoCot_(trang);
  var soCot = trang.getLastColumn();
  var dong = new Array(soCot).fill('');

  function dat(tenCot, giaTri) {
    var viTri = banDoCot[chuanHoa_(tenCot)];
    if (viTri !== undefined) dong[viTri] = giaTri;
  }

  dat('Mã khách', thongTin.maKhach);
  dat('Thời điểm tạo', thoiDiemHienTai_());
  dat('Cờ sàng lọc y tế', thongTin.coSangLoc);
  dat('Tóm tắt tình trạng', thongTin.tomTat);
  dat('Thông tin còn thiếu', thongTin.thongTinThieu);
  dat('Câu hỏi cần trao đổi', thongTin.cauHoi);
  dat('Điểm cần người tư vấn kiểm tra', thongTin.canKiemTra);
  dat('Kế hoạch dự thảo 4 tuần', thongTin.keHoachVanBan);
  dat('Kế hoạch dự thảo (JSON)', thongTin.keHoachJson);
  dat('Trạng thái duyệt 1', TT_CHO_DUYET);
  dat('Số lần sửa', 0);
  dat('Nội dung thô khi lỗi', thongTin.thoNguyenVan);

  trang.appendRow(dong);
}

/** Lấy tập hợp mã khách đã có trong một trang tính. */
function layTapMaKhachDaCo_(trang) {
  var tap = {};
  if (trang.getLastRow() < 2) return tap;
  var banDoCot = docBanDoCot_(trang);
  var cotMa = layChiSoCot_(banDoCot, 'Mã khách', trang.getName());
  var giaTri = trang.getRange(2, cotMa, trang.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < giaTri.length; i++) {
    var ma = String(giaTri[i][0]).trim();
    if (ma) tap[ma] = true;
  }
  return tap;
}


// ==================== CHỨC NĂNG 4: SỬA THEO GÓP Ý ===========================

/**
 * Với các dòng trạng thái "Cần sửa" và có nội dung trong cột Góp ý,
 * gửi bản dự thảo kèm góp ý sang AI để viết lại.
 */
function suaTheoGopY() {
  try {
    var trang = layTrang_(TRANG_DU_THAO);
    if (trang.getLastRow() < 2) {
      thongBao_('Không có dữ liệu', 'Trang AI_DU_THAO chưa có dòng nào.');
      return;
    }

    var duLieu = trang.getDataRange().getValues();
    var banDoCot = docBanDoCot_(trang);
    var cauLenh = docCauLenh_(MA_CL_SUA_GOP_Y);

    var soXuLy = 0, soLoi = 0, danhSachLoi = [];

    for (var i = 1; i < duLieu.length && soXuLy < GIOI_HAN_MOI_LAN; i++) {
      var trangThai = String(layO_(duLieu[i], banDoCot, 'Trạng thái duyệt 1')).trim();
      var gopY = String(layO_(duLieu[i], banDoCot, 'Góp ý')).trim();
      var maKhach = String(layO_(duLieu[i], banDoCot, 'Mã khách')).trim();

      if (trangThai !== TT_CAN_SUA || gopY === '') continue;

      try {
        suaMotDong_(trang, i + 1, duLieu[i], banDoCot, gopY, cauLenh);
        soXuLy++;
      } catch (loiDong) {
        soLoi++;
        danhSachLoi.push(maKhach + ': ' + loiDong.message);
      }
    }

    var thongDiep = 'Đã sửa ' + soXuLy + ' bản dự thảo. Các dòng đã sửa được đưa về trạng thái "' +
      TT_CHO_DUYET + '" để bạn đọc lại.';
    if (soLoi > 0) thongDiep += '\n\nCó ' + soLoi + ' dòng lỗi:\n' + danhSachLoi.join('\n');
    thongBao_('Sửa theo góp ý', thongDiep);

  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Gửi một bản dự thảo kèm góp ý sang AI và cập nhật lại dòng đó. */
function suaMotDong_(trang, soDong, dongDuLieu, banDoCot, gopY, cauLenh) {
  var banGoc = String(layO_(dongDuLieu, banDoCot, 'Kế hoạch dự thảo (JSON)')).trim();
  if (banGoc === '') {
    throw new Error('Dòng này chưa có bản dự thảo dạng JSON nên không sửa được.');
  }

  var noiDung =
    'BẢN DỰ THẢO HIỆN TẠI (JSON):\n' + banGoc + '\n\n' +
    'GÓP Ý CỦA NGƯỜI TƯ VẤN:\n' + gopY + '\n\n' +
    'Hãy viết lại bản dự thảo theo đúng góp ý trên và trả về JSON theo định dạng đã quy định.';

  var vanBan = goiOpenAi_(cauLenh, noiDung, TOKEN_DAI, true);
  var ketQua = phanTichJson_(vanBan);

  function ghi(tenCot, giaTri) {
    var viTri = banDoCot[chuanHoa_(tenCot)];
    if (viTri !== undefined) trang.getRange(soDong, viTri + 1).setValue(giaTri);
  }

  if (!ketQua.thanhCong) {
    ghi('Nội dung thô khi lỗi', ketQua.thoNguyenVan);
    ghi('Những gì đã thay đổi', 'LỖI ĐỌC JSON — bản dự thảo cũ được giữ nguyên. ' +
      'Xem cột "Nội dung thô khi lỗi".');
    ghi('Thời điểm sửa gần nhất', thoiDiemHienTai_());
    return;
  }

  var d = ketQua.duLieu;
  var soLanSuaCu = Number(layO_(dongDuLieu, banDoCot, 'Số lần sửa')) || 0;

  ghi('Tóm tắt tình trạng', d.tom_tat_tinh_trang || '(trống)');
  ghi('Thông tin còn thiếu', ganhSachThanhChuoi_(d.thong_tin_con_thieu));
  ghi('Câu hỏi cần trao đổi', ganhSachThanhChuoi_(d.cau_hoi_can_trao_doi));
  ghi('Điểm cần người tư vấn kiểm tra', ganhSachThanhChuoi_(d.diem_can_nguoi_tu_van_kiem_tra));
  ghi('Kế hoạch dự thảo 4 tuần', dinhDangKeHoach_(d.ke_hoach_du_thao));
  ghi('Kế hoạch dự thảo (JSON)', JSON.stringify(d));
  ghi('Những gì đã thay đổi', ganhSachThanhChuoi_(d.nhung_gi_da_thay_doi));
  ghi('Số lần sửa', soLanSuaCu + 1);
  ghi('Thời điểm sửa gần nhất', thoiDiemHienTai_());
  ghi('Nội dung thô khi lỗi', '');
  ghi('Trạng thái duyệt 1', TT_CHO_DUYET);
}


// ============ CHỨC NĂNG 5: CHUYỂN SANG BẢNG KẾ HOẠCH HOÀN CHỈNH =============

/**
 * Với các dòng "Đồng ý", soạn kế hoạch gửi khách và ghi sang KE_HOACH_CUOI.
 */
function chuyenSangKeHoachCuoi() {
  try {
    var trangDuThao = layTrang_(TRANG_DU_THAO);
    var trangKeHoach = layTrang_(TRANG_KE_HOACH);

    if (trangDuThao.getLastRow() < 2) {
      thongBao_('Không có dữ liệu', 'Trang AI_DU_THAO chưa có dòng nào.');
      return;
    }

    var duLieu = trangDuThao.getDataRange().getValues();
    var banDoCot = docBanDoCot_(trangDuThao);
    var daCo = layTapMaKhachDaCo_(trangKeHoach);
    var thongTinLienHe = docThongTinLienHe_();
    var cauLenh = docCauLenh_(MA_CL_KE_HOACH);

    var soXuLy = 0, soBoQua = 0, soLoi = 0, danhSachLoi = [], danhSachBoQua = [];

    for (var i = 1; i < duLieu.length && soXuLy < GIOI_HAN_MOI_LAN; i++) {
      var trangThai = String(layO_(duLieu[i], banDoCot, 'Trạng thái duyệt 1')).trim();
      var maKhach = String(layO_(duLieu[i], banDoCot, 'Mã khách')).trim();
      var coSangLoc = String(layO_(duLieu[i], banDoCot, 'Cờ sàng lọc y tế')).trim();

      if (trangThai !== TT_DONG_Y || !maKhach || daCo[maKhach]) continue;

      // Chặn an toàn: dòng còn cờ sàng lọc thì không tự động chuyển tiếp
      if (coSangLoc !== '') {
        soBoQua++;
        danhSachBoQua.push(maKhach);
        continue;
      }

      try {
        chuyenMotDong_(trangKeHoach, duLieu[i], banDoCot, maKhach, thongTinLienHe, cauLenh);
        soXuLy++;
      } catch (loiDong) {
        soLoi++;
        danhSachLoi.push(maKhach + ': ' + loiDong.message);
      }
    }

    apDanhSachXoDuyetCuoi_();

    var thongDiep = 'Đã chuyển ' + soXuLy + ' kế hoạch sang KE_HOACH_CUOI với trạng thái "' +
      TT_CHO_DUYET_CUOI + '".';
    if (soBoQua > 0) {
      thongDiep += '\n\nBỏ qua ' + soBoQua + ' dòng còn cờ sàng lọc y tế: ' +
        danhSachBoQua.join(', ') + '.\nHãy xử lý và xoá nội dung ô "Cờ sàng lọc y tế" trước.';
    }
    if (soLoi > 0) thongDiep += '\n\nCó ' + soLoi + ' dòng lỗi:\n' + danhSachLoi.join('\n');
    thongBao_('Chuyển sang kế hoạch cuối', thongDiep);

  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Soạn nội dung gửi khách cho một dòng và ghi sang KE_HOACH_CUOI. */
function chuyenMotDong_(trangKeHoach, dongDuThao, banDoCot, maKhach, thongTinLienHe, cauLenh) {
  var banJson = String(layO_(dongDuThao, banDoCot, 'Kế hoạch dự thảo (JSON)')).trim();
  if (banJson === '') {
    throw new Error('Dòng này chưa có bản dự thảo dạng JSON.');
  }

  var vanBan = goiOpenAi_(cauLenh,
    'Bản dự thảo đã được người tư vấn duyệt (JSON):\n' + banJson + '\n\n' +
    'Hãy soạn nội dung thư gửi khách theo đúng định dạng JSON đã quy định.',
    TOKEN_DAI, true);

  var ketQua = phanTichJson_(vanBan);
  var lienHe = thongTinLienHe[maKhach] || { hoTen: '', email: '' };

  var noiDungGui, canKiemTra, thoNguyenVan;
  if (!ketQua.thanhCong) {
    noiDungGui = '';
    canKiemTra = 'LỖI ĐỌC JSON — xem cột "Nội dung thô khi lỗi". Chưa có nội dung gửi khách.';
    thoNguyenVan = ketQua.thoNguyenVan;
  } else {
    noiDungGui = ketQua.duLieu.noi_dung_gui_khach || '';
    canKiemTra = ganhSachThanhChuoi_(ketQua.duLieu.diem_can_nguoi_tu_van_kiem_tra);
    thoNguyenVan = '';
  }

  var banDoKeHoach = docBanDoCot_(trangKeHoach);
  var dong = new Array(trangKeHoach.getLastColumn()).fill('');

  function dat(tenCot, giaTri) {
    var viTri = banDoKeHoach[chuanHoa_(tenCot)];
    if (viTri !== undefined) dong[viTri] = giaTri;
  }

  dat('Mã khách', maKhach);
  dat('Thời điểm chuyển', thoiDiemHienTai_());
  dat('Họ và tên', lienHe.hoTen);
  dat('Email liên hệ', lienHe.email);
  dat('Tóm tắt tình trạng', layO_(dongDuThao, banDoCot, 'Tóm tắt tình trạng'));
  dat('Nội dung kế hoạch gửi khách', noiDungGui);
  dat('Điểm cần người tư vấn kiểm tra', canKiemTra);
  dat('Trạng thái duyệt cuối', TT_CHO_DUYET_CUOI);
  dat('Nội dung thô khi lỗi', thoNguyenVan);

  trangKeHoach.appendRow(dong);
}

/** Đọc bảng tra cứu mã khách → họ tên và email từ trang KHACH_HANG. */
function docThongTinLienHe_() {
  var trang = layTrang_(TRANG_KHACH_HANG);
  var banDo = {};
  if (trang.getLastRow() < 2) return banDo;

  var duLieu = trang.getDataRange().getValues();
  var banDoCot = docBanDoCot_(trang);

  for (var i = 1; i < duLieu.length; i++) {
    var ma = String(layO_(duLieu[i], banDoCot, 'Mã khách')).trim();
    if (!ma) continue;
    banDo[ma] = {
      hoTen: String(layO_(duLieu[i], banDoCot, 'Họ và tên')).trim(),
      email: String(layO_(duLieu[i], banDoCot, 'Email liên hệ')).trim()
    };
  }
  return banDo;
}


// ================== CHỨC NĂNG 6: GỬI KẾ HOẠCH QUA GMAIL =====================

/**
 * Chỉ gửi với dòng có trạng thái đúng bằng "Đã duyệt gửi" và chưa có thời điểm gửi.
 * Tiêu đề thư chứa mã khách, không chứa thông tin sức khỏe.
 */
function guiKeHoachQuaGmail() {
  try {
    var trang = layTrang_(TRANG_KE_HOACH);
    if (trang.getLastRow() < 2) {
      thongBao_('Không có dữ liệu', 'Trang KE_HOACH_CUOI chưa có dòng nào.');
      return;
    }

    var duLieu = trang.getDataRange().getValues();
    var banDoCot = docBanDoCot_(trang);

    var soGui = 0, soLoi = 0, danhSachLoi = [];

    for (var i = 1; i < duLieu.length; i++) {
      var trangThai = String(layO_(duLieu[i], banDoCot, 'Trạng thái duyệt cuối')).trim();
      var thoiDiemGui = String(layO_(duLieu[i], banDoCot, 'Thời điểm gửi')).trim();
      var maKhach = String(layO_(duLieu[i], banDoCot, 'Mã khách')).trim();

      // So sánh ĐÚNG BẰNG, và bỏ qua dòng đã có thời điểm gửi để không gửi trùng
      if (trangThai !== TT_DA_DUYET_GUI) continue;
      if (thoiDiemGui !== '') continue;

      try {
        guiMotThu_(trang, i + 1, duLieu[i], banDoCot, maKhach);
        soGui++;
      } catch (loiDong) {
        soLoi++;
        danhSachLoi.push(maKhach + ': ' + loiDong.message);
      }
    }

    var thongDiep = 'Đã gửi ' + soGui + ' thư.';
    if (soLoi > 0) thongDiep += '\n\nCó ' + soLoi + ' dòng lỗi:\n' + danhSachLoi.join('\n');
    if (soGui === 0 && soLoi === 0) {
      thongDiep = 'Không có dòng nào đủ điều kiện gửi.\n' +
        'Điều kiện: Trạng thái duyệt cuối = "' + TT_DA_DUYET_GUI + '" và cột "Thời điểm gửi" còn trống.';
    }
    thongBao_('Gửi kế hoạch', thongDiep);

  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Gửi thư cho một dòng và ghi lại thời điểm gửi. */
function guiMotThu_(trang, soDong, dongDuLieu, banDoCot, maKhach) {
  var email = String(layO_(dongDuLieu, banDoCot, 'Email liên hệ')).trim();
  var hoTen = String(layO_(dongDuLieu, banDoCot, 'Họ và tên')).trim();
  var noiDung = String(layO_(dongDuLieu, banDoCot, 'Nội dung kế hoạch gửi khách')).trim();

  if (email === '') throw new Error('Thiếu email liên hệ.');
  if (noiDung === '') throw new Error('Nội dung kế hoạch gửi khách đang trống.');

  // Tiêu đề chỉ chứa mã khách, tuyệt đối không chứa thông tin sức khỏe
  var tieuDe = TIEN_TO_TIEU_DE + ' — Mã khách ' + maKhach;

  var thanThu =
    (hoTen ? 'Chào ' + hoTen + ',' : 'Chào bạn,') + '\n\n' +
    noiDung + '\n\n' +
    '-----\n' +
    'Để phản hồi, bạn vui lòng bấm Trả lời ngay trên thư này và GIỮ NGUYÊN tiêu đề thư ' +
    '(mã khách trong tiêu đề giúp chúng tôi ghép đúng hồ sơ của bạn).\n' +
    'Nội dung trong thư này là tư vấn thói quen ăn uống, không thay thế chẩn đoán hoặc điều trị y tế. ' +
    'Nếu bạn xuất hiện triệu chứng bất thường, vui lòng đi khám bác sĩ.';

  GmailApp.sendEmail(email, tieuDe, thanThu);

  function ghi(tenCot, giaTri) {
    var viTri = banDoCot[chuanHoa_(tenCot)];
    if (viTri !== undefined) trang.getRange(soDong, viTri + 1).setValue(giaTri);
  }

  ghi('Thời điểm gửi', thoiDiemHienTai_());
  ghi('Ghi chú gửi', 'Đã gửi tới ' + email + ' với tiêu đề: ' + tieuDe);
}


// ==================== CHỨC NĂNG 7: ĐỌC THƯ PHẢN HỒI =========================

/** Chạy từ menu. */
function docThuPhanHoi() {
  try {
    var ketQua = xuLyThuPhanHoi_();
    thongBao_('Đọc thư phản hồi', ketQua);
  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}

/** Chạy từ kích hoạt theo lịch. Không hiện hộp thoại. */
function docThuPhanHoiTuDong() {
  try {
    Logger.log(xuLyThuPhanHoi_());
  } catch (loi) {
    Logger.log('Lỗi khi đọc thư phản hồi tự động: ' + loi.message);
  }
}

/**
 * Tìm thư trả lời của khách theo mã khách trong tiêu đề, tóm tắt bằng AI,
 * ghi vào PHAN_HOI_EMAIL rồi đánh dấu thư đã đọc.
 */
function xuLyThuPhanHoi_() {
  var trangKeHoach = layTrang_(TRANG_KE_HOACH);
  var trangPhanHoi = layTrang_(TRANG_PHAN_HOI);

  if (trangKeHoach.getLastRow() < 2) {
    return 'Trang KE_HOACH_CUOI chưa có dòng nào.';
  }

  var duLieu = trangKeHoach.getDataRange().getValues();
  var banDoCot = docBanDoCot_(trangKeHoach);
  var idDaGhi = layTapIdThuDaGhi_(trangPhanHoi);
  var cauLenh = docCauLenh_(MA_CL_PHAN_HOI);

  var soGhi = 0, soLoi = 0, danhSachLoi = [];

  for (var i = 1; i < duLieu.length && soGhi < GIOI_HAN_MOI_LAN; i++) {
    var maKhach = String(layO_(duLieu[i], banDoCot, 'Mã khách')).trim();
    var thoiDiemGui = String(layO_(duLieu[i], banDoCot, 'Thời điểm gửi')).trim();
    var emailKhach = String(layO_(duLieu[i], banDoCot, 'Email liên hệ')).trim().toLowerCase();

    // Chỉ tìm thư của khách đã thực sự được gửi kế hoạch
    if (!maKhach || thoiDiemGui === '' || emailKhach === '') continue;

    var cacChuoi;
    try {
      cacChuoi = GmailApp.search('subject:"' + maKhach + '" is:unread -in:chats', 0, 10);
    } catch (loiTim) {
      soLoi++;
      danhSachLoi.push(maKhach + ': lỗi tìm thư — ' + loiTim.message);
      continue;
    }

    for (var c = 0; c < cacChuoi.length && soGhi < GIOI_HAN_MOI_LAN; c++) {
      var cacThu = cacChuoi[c].getMessages();
      for (var t = 0; t < cacThu.length && soGhi < GIOI_HAN_MOI_LAN; t++) {
        var thu = cacThu[t];
        if (!thu.isUnread()) continue;
        if (idDaGhi[thu.getId()]) { thu.markRead(); continue; }

        // Chỉ xử lý thư do chính khách gửi, bỏ qua thư mình đã gửi đi
        var nguoiGui = String(thu.getFrom() || '').toLowerCase();
        if (nguoiGui.indexOf(emailKhach) === -1) continue;

        try {
          ghiMotPhanHoi_(trangPhanHoi, thu, maKhach, cauLenh);
          thu.markRead();
          idDaGhi[thu.getId()] = true;
          soGhi++;
        } catch (loiThu) {
          soLoi++;
          danhSachLoi.push(maKhach + ': ' + loiThu.message);
        }
      }
    }
  }

  var thongDiep = 'Đã đọc và tóm tắt ' + soGhi + ' thư phản hồi.';
  if (soLoi > 0) thongDiep += '\n\nCó ' + soLoi + ' lỗi:\n' + danhSachLoi.join('\n');
  if (soGhi === GIOI_HAN_MOI_LAN) {
    thongDiep += '\n\nĐã chạm giới hạn ' + GIOI_HAN_MOI_LAN + ' thư mỗi lần chạy.';
  }
  return thongDiep;
}

/** Tóm tắt một thư và ghi vào PHAN_HOI_EMAIL. */
function ghiMotPhanHoi_(trang, thu, maKhach, cauLenh) {
  var noiDungThu = String(thu.getPlainBody() || '').trim();
  if (noiDungThu === '') throw new Error('Thư không có nội dung dạng văn bản.');
  if (noiDungThu.length > 12000) noiDungThu = noiDungThu.substring(0, 12000);

  var vanBan = goiOpenAi_(cauLenh,
    'Nội dung thư phản hồi của khách:\n---\n' + noiDungThu + '\n---\n' +
    'Hãy tóm tắt thành bốn mục theo đúng định dạng JSON đã quy định.',
    TOKEN_DAI, true);

  var ketQua = phanTichJson_(vanBan);
  var banDoCot = docBanDoCot_(trang);
  var dong = new Array(trang.getLastColumn()).fill('');

  function dat(tenCot, giaTri) {
    var viTri = banDoCot[chuanHoa_(tenCot)];
    if (viTri !== undefined) dong[viTri] = giaTri;
  }

  var mui = layBangTinh_().getSpreadsheetTimeZone();

  dat('Mã khách', maKhach);
  dat('Thời điểm đọc', thoiDiemHienTai_());
  dat('Ngày thư', Utilities.formatDate(thu.getDate(), mui, 'yyyy-MM-dd HH:mm:ss'));
  dat('ID thư', thu.getId());

  if (!ketQua.thanhCong) {
    dat('Khách đã thực hiện được gì', 'LỖI ĐỌC JSON — xem cột "Nội dung thô khi lỗi"');
    dat('Điểm cần người tư vấn xem', 'AI trả về nội dung không phải JSON hợp lệ. Hãy đọc thư gốc.');
    dat('Nội dung thô khi lỗi', ketQua.thoNguyenVan);
  } else {
    var d = ketQua.duLieu;
    dat('Khách đã thực hiện được gì', ganhSachThanhChuoi_(d.da_thuc_hien_duoc));
    dat('Khó khăn', ganhSachThanhChuoi_(d.kho_khan));
    dat('Câu hỏi của khách', ganhSachThanhChuoi_(d.cau_hoi_cua_khach));
    dat('Điểm cần người tư vấn xem', ganhSachThanhChuoi_(d.diem_can_nguoi_tu_van_xem));
    dat('Nội dung thô khi lỗi', '');
  }

  trang.appendRow(dong);
}

/** Lấy tập ID thư đã ghi để không xử lý trùng. */
function layTapIdThuDaGhi_(trang) {
  var tap = {};
  if (trang.getLastRow() < 2) return tap;
  var banDoCot = docBanDoCot_(trang);
  var cot = layChiSoCot_(banDoCot, 'ID thư', trang.getName());
  var giaTri = trang.getRange(2, cot, trang.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < giaTri.length; i++) {
    var id = String(giaTri[i][0]).trim();
    if (id) tap[id] = true;
  }
  return tap;
}


// ================== CHỨC NĂNG 8: KIỂM TRA KẾT NỐI API =======================

/**
 * Gọi một lệnh rất ngắn để xác nhận khoá API và tên mô hình đúng.
 * Không bật chế độ ép JSON vì đây chỉ là phép thử một từ.
 */
function kiemTraKetNoiApi() {
  try {
    var batDau = new Date().getTime();
    var traLoi = goiOpenAi_(
      'Bạn chỉ trả lời đúng một từ, không giải thích.',
      'Trả lời đúng một từ: OK',
      TOKEN_NGAN,
      false);
    var thoiGian = new Date().getTime() - batDau;

    thongBao_('Kết nối API thành công',
      'Mô hình: ' + MO_HINH + '\n' +
      'Thời gian phản hồi: ' + thoiGian + ' mili giây\n' +
      'Nội dung trả về: ' + traLoi);
  } catch (loi) {
    thongBao_('Kết nối API thất bại', loi.message);
    throw loi;
  }
}

/**
 * Liệt kê các mô hình mà khoá API của bạn được phép dùng.
 * Chạy hàm này khi gặp lỗi model_not_found để lấy đúng mã mô hình.
 */
function lietKeMoHinh() {
  try {
    var phanHoi = UrlFetchApp.fetch(DIA_CHI_MO_HINH, {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + layKhoaApi_() },
      muteHttpExceptions: true
    });

    var maTrangThai = phanHoi.getResponseCode();
    var noiDungTraVe = phanHoi.getContentText();

    if (maTrangThai !== 200) {
      throw new Error('Không lấy được danh sách mô hình. Mã trạng thái HTTP: ' + maTrangThai +
        '\nNguyên văn nội dung trả về:\n' + noiDungTraVe);
    }

    var ketQua = JSON.parse(noiDungTraVe);
    var danhSach = [];
    for (var i = 0; i < ketQua.data.length; i++) {
      danhSach.push(ketQua.data[i].id);
    }
    danhSach.sort();

    // Lọc riêng nhóm mô hình sinh văn bản để dễ nhìn
    var nhomGpt = [];
    for (var j = 0; j < danhSach.length; j++) {
      if (danhSach[j].indexOf('gpt') === 0 || danhSach[j].indexOf('o') === 0) {
        nhomGpt.push(danhSach[j]);
      }
    }

    Logger.log('===== TOÀN BỘ MÔ HÌNH KHẢ DỤNG (' + danhSach.length + ') =====');
    Logger.log(danhSach.join('\n'));
    Logger.log('\n===== NHÓM SINH VĂN BẢN =====');
    Logger.log(nhomGpt.join('\n'));

    thongBao_('Danh sách mô hình',
      'Tìm thấy ' + danhSach.length + ' mô hình. Danh sách đầy đủ nằm trong Nhật ký thực thi ' +
      '(trình soạn thảo Apps Script → Nhật ký thực thi).\n\n' +
      'Một vài mã đầu tiên trong nhóm sinh văn bản:\n' + nhomGpt.slice(0, 12).join('\n') + '\n\n' +
      'Chọn một mã phù hợp rồi gán vào hằng số MO_HINH ở đầu file.');

  } catch (loi) {
    thongBao_('Lỗi', loi.message);
    throw loi;
  }
}


// ===================== HƯỚNG DẪN CÀI HAI KÍCH HOẠT ==========================

/**
 * Hiển thị hướng dẫn cài hai kích hoạt cần thiết.
 */
function huongDanCaiKichHoat() {
  thongBao_('Hướng dẫn cài kích hoạt',
    'Vào trình soạn thảo Apps Script → biểu tượng đồng hồ "Trình kích hoạt" ở cột trái → ' +
    'nút "Thêm trình kích hoạt" ở góc dưới phải.\n\n' +
    'KÍCH HOẠT 1 — cấp mã khách khi biểu mẫu được gửi:\n' +
    '• Hàm cần chạy: khiBieuMauDuocGui\n' +
    '• Nguồn sự kiện: Từ bảng tính\n' +
    '• Loại sự kiện: Khi gửi biểu mẫu\n\n' +
    'KÍCH HOẠT 2 — đọc thư phản hồi theo lịch:\n' +
    '• Hàm cần chạy: docThuPhanHoiTuDong\n' +
    '• Nguồn sự kiện: Dựa trên thời gian\n' +
    '• Loại kích hoạt: Bộ hẹn giờ theo ngày → chọn khung giờ, ví dụ 7h - 8h sáng\n\n' +
    'Lưu ý: kích hoạt 2 gọi API tính phí. Mỗi lần chạy xử lý tối đa ' + GIOI_HAN_MOI_LAN +
    ' thư (đổi hằng số GIOI_HAN_MOI_LAN nếu cần).');
}