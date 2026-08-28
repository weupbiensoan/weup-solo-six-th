/************************************************************************************
 * BẢNG ĐIỀU KHIỂN (PHẦN MÁY CHỦ) — CHƯƠNG 8 — TỆP 2/3: BangDieuKhien.gs
 * ----------------------------------------------------------------------------------
 * Cách cài: trong Apps Script, bấm dấu + cạnh mục "Tệp" → Tập lệnh → đặt tên
 * BangDieuKhien → dán tệp này. Giao diện nằm ở tệp HTML cùng tên (tệp 3/3):
 * bấm + → HTML → đặt tên ĐÚNG là BangDieuKhien (không gõ đuôi .html) → dán tệp HTML.
 * Tên tệp HTML phải khớp với dòng createHtmlOutputFromFile('BangDieuKhien') dưới đây;
 * nếu lệch tên, menu Mở bảng điều khiển sẽ báo không tìm thấy tệp.
 *
 * Cách hoạt động: menu → Mở bảng điều khiển → hộp thoại HTML hiện ra và tự gọi
 * layDuLieuBangDieuKhien() để lấy số liệu mới nhất. Nút "Tải lại dữ liệu" gọi lại
 * đúng hàm đó. Không cần trình kích hoạt theo lịch cho bảng điều khiển.
 ************************************************************************************/

function moBangDieuKhien() {
  var html = HtmlService.createHtmlOutputFromFile('BangDieuKhien')
    .setWidth(1180).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'Bảng điều khiển — Hệ thống giới thiệu');
}

/* Gom toàn bộ số liệu cho giao diện. Trả về một đối tượng duy nhất;
 * mọi định dạng hiển thị (dấu chấm nghìn, phần trăm) làm ở phía HTML. */
function layDuLieuBangDieuKhien() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dsKH = anToan_(function () { return layDuLieu_(ss.getSheetByName('KHACH_HANG'), TIEU_DE.KHACH_HANG); }, []);
  var dsSP = anToan_(function () { return layDuLieu_(ss.getSheetByName('SAN_PHAM'), TIEU_DE.SAN_PHAM); }, []);
  var dsHH = anToan_(function () { return layDuLieu_(ss.getSheetByName('HOA_HONG'), TIEU_DE.HOA_HONG); }, []);
  var dem = function (ds, cot, gia) { return ds.filter(function (r) { return r[cot] === gia; }).length; };

  var soMoi = dem(dsKH, 'TRANG_THAI_DUYET', 'MOI');
  var soChoDuyet = dem(dsKH, 'TRANG_THAI_DUYET', 'CHO_DUYET');
  var soCanHoi = dem(dsKH, 'TRANG_THAI_DUYET', 'CAN_HOI_THEM');
  var soChuyenNguoi = dem(dsKH, 'TRANG_THAI_DUYET', 'CHUYEN_NGUOI');
  var soDaGui = dem(dsKH, 'TRANG_THAI_DUYET', 'DA_GUI');
  var spChoDuyet = dem(dsSP, 'TRANG_THAI_DU_LIEU', 'CHO_DUYET');
  var spQuaHan = dsSP.filter(function (s) { return s.TRANG_THAI_DU_LIEU === 'CAN_CAP_NHAT'; });

  var homNay = new Date();
  var tongDuKien = 0, tongDaDuyet = 0, tongDaNhan = 0, khoanTre = 0;
  var theoDT = {}, tongDuyet90 = 0;
  dsHH.forEach(function (h) {
    tongDuKien += soTien_(h.HOA_HONG_DU_KIEN);
    tongDaDuyet += soTien_(h.HOA_HONG_DA_DUYET);
    tongDaNhan += soTien_(h.TIEN_DA_NHAN);
    var ngayNhan = chuyenNgay_(h.NGAY_DU_KIEN_NHAN);
    if (ngayNhan && ngayNhan < homNay && soTien_(h.HOA_HONG_DA_DUYET) - soTien_(h.TIEN_DA_NHAN) > 0) khoanTre++;
    var ngayGhi = chuyenNgay_(h.NGAY_GHI_NHAN);
    if (!ngayGhi || (homNay - ngayGhi) / 86400000 <= 90) {
      var t = soTien_(h.HOA_HONG_DA_DUYET);
      if (h.MA_DOI_TAC) { theoDT[h.MA_DOI_TAC] = (theoDT[h.MA_DOI_TAC] || 0) + t; tongDuyet90 += t; }
    }
  });

  var viec = [];
  if (soMoi) viec.push({ chu: soMoi + ' khách MỚI chờ phân loại', muc: 'Chạy menu mục 4' });
  if (soChoDuyet) viec.push({ chu: soChoDuyet + ' bản đề xuất chờ bạn duyệt', muc: 'Mở KHACH_HANG, đọc lý do → DA_DUYET' });
  if (soCanHoi) viec.push({ chu: soCanHoi + ' khách cần thư hỏi bổ sung', muc: 'Chạy menu mục 5' });
  if (soChuyenNguoi) viec.push({ chu: soChuyenNguoi + ' khách MỨC 3 — bạn xử lý trực tiếp', muc: 'Hệ thống không tư vấn thay' });
  if (spChoDuyet) viec.push({ chu: spChoDuyet + ' sản phẩm CHO_DUYET chờ bạn rà', muc: 'Đối chiếu nguồn → DA_KIEM_TRA' });
  if (spQuaHan.length) viec.push({ chu: spQuaHan.length + ' sản phẩm quá hạn kiểm tra', muc: 'Mở lại nguồn chính thức, cập nhật' });
  if (khoanTre) viec.push({ chu: khoanTre + ' khoản quá ngày dự kiến nhận', muc: 'Liên hệ đối tác, ghi vào GHI_CHU' });

  var doiTac = Object.keys(theoDT).sort(function (a, b) { return theoDT[b] - theoDT[a]; })
    .slice(0, 6).map(function (ma) {
      var tyLe = tongDuyet90 ? theoDT[ma] / tongDuyet90 : 0;
      return { ma: String(ma), tien: theoDT[ma], tyLe: Math.round(tyLe * 100), vuot: tyLe >= CAU_HINH.NGUONG_TAP_TRUNG };
    });

  return {
    capNhatLuc: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm — dd/MM/yyyy'),
    nguongTapTrung: Math.round(CAU_HINH.NGUONG_TAP_TRUNG * 100),
    nguongQuaHan: CAU_HINH.NGUONG_QUA_HAN_NGAY,
    khach: { moi: soMoi, choDuyet: soChoDuyet, canHoi: soCanHoi, chuyenNguoi: soChuyenNguoi, daGui: soDaGui },
    tien: { duKien: tongDuKien, daDuyet: tongDaDuyet, daNhan: tongDaNhan },
    canhBao: { spQuaHan: spQuaHan.length, khoanTre: khoanTre, tong: spQuaHan.length + khoanTre },
    viec: viec,
    doiTac: doiTac,
    spQuaHan: spQuaHan.slice(0, 8).map(function (sp) {
      return { ma: String(sp.MA_SP), ten: String(sp.TEN_SAN_PHAM || ''), ngay: hienNgay_(sp.NGAY_KIEM_TRA) };
    })
  };
}
