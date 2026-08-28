/**
 * ===========================================================================
 *  BẢNG ĐIỀU KHIỂN SẢN XUẤT VIDEO — PHẦN MÁY CHỦ (bang_dieu_khien.gs)
 *  Dùng kèm tệp giao diện bang_dieu_khien.html và tệp Ma.gs phiên bản 2.1.
 * ---------------------------------------------------------------------------
 *  CÀI ĐẶT (làm đúng thứ tự)
 *   1) XÓA tệp menu_bang_dieu_khien.gs cũ. Tệp này đã gộp toàn bộ phần menu;
 *      để lại hai tệp sẽ khai báo trùng tên hàm và một trong hai bị ghi đè.
 *   2) Tạo tệp Tập lệnh mới đặt tên bang_dieu_khien, dán toàn bộ nội dung này.
 *   3) Tạo tệp HTML đặt tên bang_dieu_khien (không gõ đuôi .html), dán nội dung
 *      tệp giao diện vào.
 *   4) Mở Ma.gs, thêm một dòng vào CUỐI hàm onOpen() đã có:
 *        try { themMenuBangDieuKhien(); } catch (loi) { }
 *      Apps Script chỉ chạy một hàm onOpen cho cả dự án, nên tệp này cố tình
 *      KHÔNG khai báo onOpen lần thứ hai.
 *   5) Tải lại bảng tính. Nếu không muốn sửa Ma.gs, chạy một lần hàm
 *      caiMenuBangDieuKhien() từ trình soạn thảo để cài kích hoạt dựng menu.
 * ---------------------------------------------------------------------------
 *  TÙY CHỌN NÊN LÀM: để bảng điều khiển hiện đúng câu thông báo của từng bước
 *  thay vì câu chung chung, sửa hai hàm sau trong Ma.gs, mỗi hàm thêm một dòng
 *  ở ngay đầu thân hàm:
 *
 *    function thongBao_(noiDung) {
 *      if (CHAY_TU_GIAO_DIEN) { THONG_DIEP_GOM.push(String(noiDung)); return; }
 *      ... phần cũ giữ nguyên ...
 *    }
 *
 *    function hopThoai_(tieuDe, noiDung) {
 *      if (CHAY_TU_GIAO_DIEN) { THONG_DIEP_GOM.push(tieuDe + ': ' + noiDung); return; }
 *      ... phần cũ giữ nguyên ...
 *    }
 * ---------------------------------------------------------------------------
 *  NGUYÊN TẮC THIẾT KẾ
 *   - Bảng điều khiển CHỈ ĐỌC trang tính. Không gọi Drive, không gọi API, nên
 *     mở nhanh và không phát sinh chi phí. Số tệp video lấy từ trang SAN_XUAT,
 *     vì vậy phải chạy bước "Ghi kết quả QC" thì cột đó mới cập nhật.
 *   - Mọi thao tác ghi đều gọi lại đúng hàm có sẵn trong Ma.gs, không viết lại
 *     logic, để hai cổng khóa duyệt và các bước kiểm tra vẫn được tôn trọng.
 * ===========================================================================
 */

/* =========================== HẰNG SỐ =========================== */

/** Tên menu và tên tệp giao diện. */
var TEN_MENU_BDK = 'Bảng điều khiển';
var TEN_TEP_HTML = 'bang_dieu_khien';

/** Cờ và nơi gom thông báo khi chạy từ hộp thoại (xem phần TÙY CHỌN ở trên). */
var CHAY_TU_GIAO_DIEN = false;
var THONG_DIEP_GOM = [];

/**
 * Danh sách bước được phép chạy từ giao diện. Giá trị true nghĩa là bước đó
 * bắt buộc phải có một dòng khách hàng cụ thể. Đây cũng là danh sách trắng:
 * tên hàm không nằm ở đây sẽ bị từ chối.
 */
var BUOC_CAN_DONG = {
  taoKhungTrangTinh: false,
  taoBieuMauThuThapThongTin: false,
  taoThuMucVaGuiLinkAnh: true,
  demAnhKhachNop: false,
  kiemTraHoSoDauVao: true,
  guiThuYeuCauBoSung: true,
  taoGocNoiDung: true,
  vietKichBan: true,
  taoKeHoachHinh: true,
  ghiKetQuaQC: true,
  banGiaoQuaGmail: true,
  docThuPhanHoi: false,
  kiemTraKetNoiAPI: false,
  caiDatKichHoatTuDong: false
};

/* =========================== MENU =========================== */

/**
 * Dựng mục menu. KHÔNG được đổi tên hàm này thành onOpen: Ma.gs đã có onOpen,
 * mà các tệp .gs dùng chung một vùng tên nên hàm nạp sau sẽ ghi đè hàm nạp trước.
 */
function themMenuBangDieuKhien() {
  SpreadsheetApp.getUi()
    .createMenu(TEN_MENU_BDK)
    .addItem('Mở bảng điều khiển', 'moBangDieuKhien')
    .addSeparator()
    .addItem('Kiểm tra cài đặt bảng điều khiển', 'kiemTraCaiDatBangDieuKhien')
    .addToUi();
}

/** Dự phòng khi không sửa được Ma.gs: cài kích hoạt tự dựng menu lúc mở bảng tính. */
function caiMenuBangDieuKhien() {
  var bang = SpreadsheetApp.getActive();
  var daCo = ScriptApp.getProjectTriggers();
  var soXoa = 0;

  for (var i = 0; i < daCo.length; i++) {
    if (daCo[i].getHandlerFunction() === 'themMenuBangDieuKhien') {
      ScriptApp.deleteTrigger(daCo[i]);
      soXoa++;
    }
  }
  ScriptApp.newTrigger('themMenuBangDieuKhien').forSpreadsheet(bang).onOpen().create();
  themMenuBangDieuKhien();

  SpreadsheetApp.getUi().alert(
    'Đã cài menu "' + TEN_MENU_BDK + '".' +
    (soXoa ? '\nĐã gỡ ' + soXoa + ' kích hoạt trùng trước đó.' : '') +
    '\n\nKích hoạt dạng cài đặt gắn với tài khoản đã tạo ra nó. Nếu nhiều người ' +
    'cùng dùng bảng tính, mỗi người chạy hàm này một lần, hoặc sửa onOpen trong Ma.gs.');
}

/** Gỡ kích hoạt dựng menu, dùng khi đã sửa onOpen trong Ma.gs. */
function goMenuBangDieuKhien() {
  var ds = ScriptApp.getProjectTriggers();
  var soXoa = 0;
  for (var i = 0; i < ds.length; i++) {
    if (ds[i].getHandlerFunction() === 'themMenuBangDieuKhien') {
      ScriptApp.deleteTrigger(ds[i]);
      soXoa++;
    }
  }
  SpreadsheetApp.getUi().alert('Đã gỡ ' + soXoa + ' kích hoạt dựng menu.');
}

/**
 * Mở bảng điều khiển. Dùng hộp thoại không chặn (modeless) để các bước có hỏi
 * xác nhận gửi thư trong Ma.gs vẫn hiện được cửa sổ Có/Không.
 */
function moBangDieuKhien() {
  var giaoDien = HtmlService.createHtmlOutputFromFile(TEN_TEP_HTML)
    .setWidth(1180)
    .setHeight(820);
  SpreadsheetApp.getUi().showModelessDialog(giaoDien, 'Bảng điều khiển sản xuất video');
}

/* =========================== DỮ LIỆU CHO GIAO DIỆN =========================== */

/**
 * Đọc toàn bộ trạng thái hệ thống và trả về cho giao diện.
 * Cấu trúc trả về:
 *   { capNhat, tongHop:{...}, khach:[ {...} ] }
 */
function layDuLieuBangDieuKhien() {
  var bangTinh = SpreadsheetApp.getActiveSpreadsheet();
  var trangKhach = bangTinh.getSheetByName(TRANG.KHACH_HANG);
  if (!trangKhach) {
    throw new Error('Chưa có trang ' + TRANG.KHACH_HANG +
      '. Hãy chạy mục 1 và mục 2 trong menu "San xuat video" trước.');
  }

  var cauHinh = docCauHinhAnToan_();
  var toiThieu = {
    SAN_PHAM: soNguyen_(cauHinh['SO_ANH_SAN_PHAM_TOI_THIEU'], 3),
    NHAN_VAT: soNguyen_(cauHinh['SO_ANH_NHAN_VAT_TOI_THIEU'], 3),
    LOGO: soNguyen_(cauHinh['SO_LOGO_TOI_THIEU'], 1)
  };
  var soVideoMacDinh = soNguyen_(cauHinh['SO_VIDEO_MOI_DOT'], 12);

  var bangKhach = docBang_(trangKhach);
  var hoSo = gomTrang_(TRANG.HO_SO);
  var yTuong = gomTrang_(TRANG.Y_TUONG);
  var kichBan = gomTrang_(TRANG.KICH_BAN);
  var keHoach = gomTrang_(TRANG.KE_HOACH_HINH);
  var sanXuat = gomTrang_(TRANG.SAN_XUAT);
  var phanHoi = gomTrang_(TRANG.PHAN_HOI);

  var khach = [];
  var tongHop = { soKhach: 0, thieuAnh: 0, choDuyet: 0, thieuVideo: 0, phatSinh: 0, daGiao: 0 };

  for (var i = 0; i < bangKhach.hang.length; i++) {
    var hang = bangKhach.hang[i];
    var coDuLieu = String(oBang_(bangKhach, hang, CAU_HOI.TEN_DN)).trim() ||
                   String(oBang_(bangKhach, hang, CAU_HOI.EMAIL)).trim() ||
                   String(oBang_(bangKhach, hang, 'MA_KH')).trim();
    if (!coDuLieu) { continue; } // bỏ qua dòng trống

    var k = motKhach_(bangKhach, hang, i + 2, {
      hoSo: hoSo, yTuong: yTuong, kichBan: kichBan, keHoach: keHoach,
      sanXuat: sanXuat, phanHoi: phanHoi,
      toiThieu: toiThieu, soVideoMacDinh: soVideoMacDinh
    });

    khach.push(k);
    tongHop.soKhach++;
    if (k.nhom === 0) { tongHop.thieuAnh++; }
    if (k.nhom === 2 || k.nhom === 3) { tongHop.choDuyet++; }
    if (!k.ngayGiao && k.thieuVideo > 0) { tongHop.thieuVideo += k.thieuVideo; }
    if (k.ngayGiao) { tongHop.daGiao++; }
    tongHop.phatSinh += k.phanHoi.phatSinh;
  }

  // Khách cần xử lý gấp lên trước, trong mỗi nhóm giữ nguyên thứ tự bảng tính.
  khach.sort(function (a, b) { return a.nhom - b.nhom; });

  return {
    capNhat: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm dd/MM/yyyy'),
    tongHop: tongHop,
    khach: khach
  };
}

/** Dựng dữ liệu hiển thị cho một dòng khách hàng. */
function motKhach_(bangKhach, hang, soDong, ctx) {
  var maKH = String(oBang_(bangKhach, hang, 'MA_KH')).trim();
  var khoa = maKH || ('DONG' + soDong);

  var tenDN = String(oBang_(bangKhach, hang, CAU_HOI.TEN_DN) || '').trim();
  var trangThai = String(oBang_(bangKhach, hang, 'TRANG_THAI') || '').trim();
  var maDot = String(oBang_(bangKhach, hang, 'MA_DOT_GIAO') || '').trim();
  var linkAnh = String(oBang_(bangKhach, hang, 'LINK_ANH_GOC') || '').trim();
  var ghiChuHT = String(oBang_(bangKhach, hang, 'GHI_CHU_HE_THONG') || '').trim();
  var ngayGiao = ngayNgan_(oBang_(bangKhach, hang, 'NGAY_GIAO'));

  var duyetYT = String(oBang_(bangKhach, hang, 'DUYET_Y_TUONG') || '').trim();
  var duyetKB = String(oBang_(bangKhach, hang, 'DUYET_KICH_BAN') || '').trim();
  var duyetCuoi = String(oBang_(bangKhach, hang, 'DUYET_CUOI') || '').trim();

  var soSP = soNguyen_(oBang_(bangKhach, hang, 'SO_ANH_SAN_PHAM'), 0);
  var soNV = soNguyen_(oBang_(bangKhach, hang, 'SO_ANH_NHAN_VAT'), 0);
  var soLG = soNguyen_(oBang_(bangKhach, hang, 'SO_LOGO'), 0);
  var soVideoDot = soNguyen_(oBang_(bangKhach, hang, 'SO_VIDEO_DOT'), ctx.soVideoMacDinh);

  var thieuAnh = [];
  if (soSP < ctx.toiThieu.SAN_PHAM) { thieuAnh.push('ảnh sản phẩm ' + soSP + '/' + ctx.toiThieu.SAN_PHAM); }
  if (soNV < ctx.toiThieu.NHAN_VAT) { thieuAnh.push('ảnh nhân vật ' + soNV + '/' + ctx.toiThieu.NHAN_VAT); }
  if (soLG < ctx.toiThieu.LOGO) { thieuAnh.push('logo ' + soLG + '/' + ctx.toiThieu.LOGO); }
  var duAnh = thieuAnh.length === 0;

  // ----- Hồ sơ -----
  var dsHoSo = maKH ? (ctx.hoSo.theoMa[maKH] || []) : [];
  var trangThaiHoSo = dsHoSo.length
    ? String(oBang_(ctx.hoSo, dsHoSo[dsHoSo.length - 1], 'TRANG_THAI_HO_SO') || '').trim().toUpperCase()
    : '';

  // ----- Ý tưởng -----
  var dsYT = maKH ? (ctx.yTuong.theoMa[maKH] || []) : [];
  var tongYT = 0, ytDuyet = 0;
  for (var a = 0; a < dsYT.length; a++) {
    if (String(oBang_(ctx.yTuong, dsYT[a], 'MA_Y_TUONG')).indexOf('LOI_JSON') > -1) { continue; }
    tongYT++;
    if (String(oBang_(ctx.yTuong, dsYT[a], 'TRANG_THAI_DUYET')).trim().toUpperCase() === 'DUYET') { ytDuyet++; }
  }

  // ----- Kịch bản -----
  var dsKB = maKH ? (ctx.kichBan.theoMa[maKH] || []) : [];
  var soKB = 0, soKBLoi = 0;
  for (var b = 0; b < dsKB.length; b++) {
    if (!String(oBang_(ctx.kichBan, dsKB[b], 'MA_VIDEO')).trim()) { continue; }
    soKB++;
    if (String(oBang_(ctx.kichBan, dsKB[b], 'LOI') || '').trim()) { soKBLoi++; }
  }

  // ----- Kế hoạch hình -----
  var dsKH = maKH ? (ctx.keHoach.theoMa[maKH] || []) : [];
  var tapVideo = {}, soCanhThieuAnh = 0;
  for (var c = 0; c < dsKH.length; c++) {
    var mv = String(oBang_(ctx.keHoach, dsKH[c], 'MA_VIDEO')).trim();
    if (mv) { tapVideo[mv] = true; }
    if (String(oBang_(ctx.keHoach, dsKH[c], 'ANH_THAM_CHIEU')).trim().toUpperCase() === 'THIEU_ANH') { soCanhThieuAnh++; }
  }
  var soVideoCoKeHoach = 0;
  for (var v in tapVideo) { soVideoCoKeHoach++; }

  // ----- Sản xuất và QC -----
  var dsSX = maKH ? (ctx.sanXuat.theoMa[maKH] || []) : [];
  var soTepCo = 0, soChuaKhopAnh = 0;
  for (var d = 0; d < dsSX.length; d++) {
    if (String(oBang_(ctx.sanXuat, dsSX[d], 'TRANG_THAI_TEP')).trim().toUpperCase() === 'DA_CO_TEP') { soTepCo++; }
    if (!String(oBang_(ctx.sanXuat, dsSX[d], 'KIEM_TRA_KHOP_ANH') || '').trim()) { soChuaKhopAnh++; }
  }

  // ----- Phản hồi chưa xử lý -----
  var dsPH = maKH ? (ctx.phanHoi.theoMa[maKH] || []) : [];
  var choQuyetDinh = [], demPhatSinh = 0, demLoiCungCap = 0;
  for (var e = 0; e < dsPH.length; e++) {
    if (String(oBang_(ctx.phanHoi, dsPH[e], 'DA_XU_LY') || '').trim()) { continue; }
    var nhan = String(oBang_(ctx.phanHoi, dsPH[e], 'PHAN_LOAI') || '').trim().toUpperCase();
    if (nhan === 'PHAT_SINH') { demPhatSinh++; }
    if (nhan === 'LOI_CUNG_CAP') { demLoiCungCap++; }
    if (choQuyetDinh.length < 4) {
      choQuyetDinh.push({
        nhan: nhan || 'CHUA_PHAN_LOAI',
        maVideo: String(oBang_(ctx.phanHoi, dsPH[e], 'MA_VIDEO_LIEN_QUAN') || '').trim(),
        ngay: ngayNgan_(oBang_(ctx.phanHoi, dsPH[e], 'NGAY_NHAN')),
        lyDo: String(oBang_(ctx.phanHoi, dsPH[e], 'LY_DO_PHAN_LOAI') || '').trim()
      });
    }
  }

  // ----- Xác định chặng và việc tiếp theo -----
  var nhom, viec, ham = '', choNgoai = false;
  var canViet = Math.min(ytDuyet || 0, soVideoDot);

  if (!maKH || !linkAnh) {
    nhom = 0;
    viec = 'Chưa có thư mục Drive. Chạy bước tạo thư mục và gửi liên kết nộp ảnh cho khách.';
    ham = 'taoThuMucVaGuiLinkAnh';
  } else if (!duAnh) {
    nhom = 0; choNgoai = true;
    viec = 'Khách còn thiếu: ' + thieuAnh.join(', ') + '. Bấm để đếm lại ảnh trong thư mục Drive.';
    ham = 'demAnhKhachNop';
  } else if (trangThaiHoSo !== 'DU_DU_LIEU') {
    nhom = 1;
    if (!dsHoSo.length) {
      viec = 'Đã đủ ảnh. Chạy kiểm tra hồ sơ đầu vào.';
      ham = 'kiemTraHoSoDauVao';
    } else if (trangThaiHoSo === 'CAN_BO_SUNG') {
      viec = 'Hồ sơ còn thiếu dữ liệu. Gửi thư yêu cầu bổ sung, khi khách trả lời thì chạy lại kiểm tra hồ sơ.';
      ham = 'guiThuYeuCauBoSung';
    } else {
      viec = 'Lần kiểm tra trước không trả về JSON hợp lệ. Xem cột JSON_THO trên trang HO_SO rồi chạy lại.';
      ham = 'kiemTraHoSoDauVao';
    }
  } else if (duyetYT !== GIA_TRI_DUYET) {
    nhom = 2;
    if (!tongYT) {
      viec = 'Hồ sơ đã đủ. Chạy tạo 20 góc nội dung.';
      ham = 'taoGocNoiDung';
    } else {
      viec = 'Đã có ' + tongYT + ' góc nội dung, ' + ytDuyet + ' góc được đánh DUYET. ' +
             'Mở trang Y_TUONG đánh dấu DUYET hoặc LOAI từng dòng, rồi điền "' + GIA_TRI_DUYET +
             '" vào cột DUYET_Y_TUONG của dòng này.';
      ham = '';
    }
  } else if (duyetKB !== GIA_TRI_DUYET) {
    nhom = 3;
    if (soKB < canViet) {
      viec = 'Đã viết ' + soKB + '/' + canViet + ' kịch bản. Chạy viết kịch bản, mỗi lần tối đa 4 video.';
      ham = 'vietKichBan';
    } else {
      viec = 'Đã viết đủ ' + soKB + ' kịch bản. Đọc và sửa trực tiếp trên trang KICH_BAN, rồi điền "' +
             GIA_TRI_DUYET + '" vào cột DUYET_KICH_BAN của dòng này.';
      ham = '';
    }
  } else if (soVideoCoKeHoach < soKB) {
    nhom = 4;
    viec = 'Đã có kế hoạch hình cho ' + soVideoCoKeHoach + '/' + soKB + ' video. Chạy tạo kế hoạch hình.';
    ham = 'taoKeHoachHinh';
  } else if (soTepCo < soVideoDot) {
    nhom = 5;
    viec = 'Trang SAN_XUAT ghi nhận ' + soTepCo + '/' + soVideoDot +
           ' tệp trong 04_VIDEO_FINAL. Dựng cảnh, tải bản cuối lên, rồi chạy ghi kết quả QC để đối chiếu lại.';
    ham = 'ghiKetQuaQC';
  } else if (!ngayGiao) {
    nhom = 6;
    if (duyetCuoi !== GIA_TRI_DUYET_CUOI) {
      viec = 'Đủ ' + soTepCo + ' tệp. Đối chiếu nhãn, màu và gương mặt với ảnh gốc, điền cột ' +
             'KIEM_TRA_KHOP_ANH trên trang SAN_XUAT, rồi điền "' + GIA_TRI_DUYET_CUOI +
             '" vào cột DUYET_CUOI.';
      ham = 'ghiKetQuaQC';
    } else {
      viec = 'Đã duyệt cuối. Chạy bàn giao qua Gmail.';
      ham = 'banGiaoQuaGmail';
    }
  } else {
    nhom = 7; choNgoai = true;
    viec = choQuyetDinh.length
      ? 'Có ' + choQuyetDinh.length + ' thư phản hồi chưa xử lý. Xử lý xong thì điền cột DA_XU_LY trên trang PHAN_HOI.'
      : 'Đã bàn giao ngày ' + ngayGiao + '. Bấm để đọc thư phản hồi mới.';
    ham = 'docThuPhanHoi';
  }

  // ----- Ghi chú cảnh báo -----
  var ghiChu = [];
  if (ghiChuHT) { ghiChu.push(ghiChuHT); }
  if (soKBLoi) { ghiChu.push(soKBLoi + ' kịch bản lỗi JSON, xem cột LOI trên trang KICH_BAN.'); }
  if (soCanhThieuAnh) { ghiChu.push(soCanhThieuAnh + ' cảnh ghi THIEU_ANH, phải gán ảnh tham chiếu bằng tay trước khi dựng.'); }
  if (nhom >= 5 && soChuaKhopAnh) { ghiChu.push(soChuaKhopAnh + ' video chưa điền cột KIEM_TRA_KHOP_ANH.'); }

  return {
    dong: soDong,
    maKH: khoa,
    tenDN: tenDN,
    maDot: maDot,
    trangThai: trangThai,
    ngayGiao: ngayGiao,
    nhom: nhom,
    viecTiepTheo: viec,
    hamGoiY: ham,
    choNguoiKhac: choNgoai,
    ghiChu: ghiChu.join(' '),
    thieuVideo: Math.max(0, soVideoDot - soTepCo),
    phanHoi: { phatSinh: demPhatSinh, loiCungCap: demLoiCungCap },
    choQuyetDinh: choQuyetDinh,
    chang: [
      doanChang_('Ảnh', soSP + '·' + soNV + '·' + soLG, duAnh, nhom === 0),
      doanChang_('Hồ sơ', trangThaiHoSo || '—', trangThaiHoSo === 'DU_DU_LIEU', nhom === 1),
      doanChang_('Ý tưởng', ytDuyet + '/' + tongYT, duyetYT === GIA_TRI_DUYET, nhom === 2),
      doanChang_('Kịch bản', soKB + '/' + soVideoDot, duyetKB === GIA_TRI_DUYET, nhom === 3),
      doanChang_('Kế hoạch hình', soVideoCoKeHoach + '/' + (soKB || 0), soKB > 0 && soVideoCoKeHoach >= soKB, nhom === 4),
      doanChang_('Video', soTepCo + '/' + soVideoDot, soTepCo >= soVideoDot, nhom === 5 || nhom === 6),
      doanChang_('Bàn giao', ngayGiao || '—', !!ngayGiao, nhom === 7)
    ]
  };
}

/** Một ô nhỏ trên thanh tiến độ. */
function doanChang_(ten, so, xong, dang) {
  return { ten: ten, so: String(so), trangThai: xong ? 'xong' : (dang ? 'dang' : '') };
}

/* =========================== CHẠY BƯỚC TỪ GIAO DIỆN =========================== */

/**
 * Chạy một bước của Ma.gs theo yêu cầu từ giao diện.
 * Trả về { ok: true/false, thongDiep: '...' } để giao diện hiện thông báo.
 */
function chayBuocTuGiaoDien(ten, dong) {
  if (!BUOC_CAN_DONG.hasOwnProperty(ten)) {
    return { ok: false, thongDiep: 'Bước "' + ten + '" không nằm trong danh sách được phép chạy.' };
  }
  dong = Number(dong) || 0;
  if (BUOC_CAN_DONG[ten] && dong < 2) {
    return { ok: false, thongDiep: 'Bước này phải chạy trên một dòng khách hàng cụ thể.' };
  }

  CHAY_TU_GIAO_DIEN = true;
  THONG_DIEP_GOM = [];

  try {
    // Các hàm trong Ma.gs đọc dòng đang chọn, nên phải trỏ con trỏ về đúng dòng.
    if (dong >= 2 && ten !== 'taoKhungTrangTinh' && ten !== 'taoBieuMauThuThapThongTin') {
      chonDongKhachHang_(dong);
    }

    switch (ten) {
      case 'taoKhungTrangTinh':          taoKhungTrangTinh(); break;
      case 'taoBieuMauThuThapThongTin':  taoBieuMauThuThapThongTin(); break;
      case 'taoThuMucVaGuiLinkAnh':      taoThuMucVaGuiLinkAnh(dong); break;
      case 'demAnhKhachNop':             demAnhKhachNop(dong < 2); break;
      case 'kiemTraHoSoDauVao':          kiemTraHoSoDauVao(dong); break;
      case 'guiThuYeuCauBoSung':         guiThuYeuCauBoSung(); break;
      case 'taoGocNoiDung':              taoGocNoiDung(); break;
      case 'vietKichBan':                vietKichBan(); break;
      case 'taoKeHoachHinh':             taoKeHoachHinh(); break;
      case 'ghiKetQuaQC':                ghiKetQuaQC(); break;
      case 'banGiaoQuaGmail':            banGiaoQuaGmail(); break;
      case 'docThuPhanHoi':              docThuPhanHoi(); break;
      case 'kiemTraKetNoiAPI':           kiemTraKetNoiAPI(); break;
      case 'caiDatKichHoatTuDong':       caiDatKichHoatTuDong(); break;
      default:
        throw new Error('Chưa khai báo cách chạy cho bước ' + ten + '.');
    }

    return {
      ok: true,
      thongDiep: THONG_DIEP_GOM.length ? THONG_DIEP_GOM.join(' — ') : 'đã chạy xong.'
    };
  } catch (loi) {
    return { ok: false, thongDiep: String(loi && loi.message ? loi.message : loi) };
  } finally {
    CHAY_TU_GIAO_DIEN = false;
  }
}

/** Trỏ con trỏ bảng tính về đúng dòng khách hàng trước khi gọi hàm của Ma.gs. */
function chonDongKhachHang_(dong) {
  var bangTinh = SpreadsheetApp.getActiveSpreadsheet();
  var trang = bangTinh.getSheetByName(TRANG.KHACH_HANG);
  if (!trang) { throw new Error('Chưa có trang ' + TRANG.KHACH_HANG + '.'); }
  if (dong > trang.getLastRow()) {
    throw new Error('Dòng ' + dong + ' không còn tồn tại. Bấm "Tải lại dữ liệu" rồi thử lại.');
  }
  bangTinh.setActiveSheet(trang);
  trang.setActiveRange(trang.getRange(dong, 1));
}

/* =========================== CHẨN ĐOÁN =========================== */

/** Kiểm tra các điều kiện cần để bảng điều khiển chạy được. */
function kiemTraCaiDatBangDieuKhien() {
  var loi = [], canhBao = [];

  try {
    HtmlService.createHtmlOutputFromFile(TEN_TEP_HTML);
  } catch (e) {
    loi.push('Không tìm thấy tệp HTML tên "' + TEN_TEP_HTML +
      '". Khi tạo tệp HTML, chỉ gõ tên này, không gõ kèm đuôi .html.');
  }

  if (typeof TRANG === 'undefined' || typeof GIA_TRI_DUYET === 'undefined' ||
      typeof docBang_ !== 'function' || typeof layCauHinh_ !== 'function') {
    loi.push('Không thấy hằng số hoặc hàm dùng chung của Ma.gs. Ma.gs phải nằm cùng dự án Apps Script với tệp này.');
  }
  if (typeof taoGocNoiDung !== 'function' || typeof banGiaoQuaGmail !== 'function') {
    loi.push('Thiếu các hàm xử lý của Ma.gs. Hãy dán đủ Ma.gs phiên bản 2.1 vào dự án.');
  }
  if (typeof themMenuBangDieuKhien !== 'function') {
    loi.push('Thiếu hàm themMenuBangDieuKhien. Tệp bang_dieu_khien.gs chưa được dán đầy đủ.');
  }

  var coTrigger = false;
  var ds = ScriptApp.getProjectTriggers();
  for (var i = 0; i < ds.length; i++) {
    if (ds[i].getHandlerFunction() === 'themMenuBangDieuKhien') { coTrigger = true; }
  }
  if (!coTrigger) {
    canhBao.push('Chưa có kích hoạt dựng menu. Nếu menu "' + TEN_MENU_BDK +
      '" vẫn hiện khi mở bảng tính thì onOpen trong Ma.gs đã gọi đúng, không cần làm gì thêm.');
  }

  try {
    if (!SpreadsheetApp.getActive().getSheetByName(TRANG.KHACH_HANG)) {
      canhBao.push('Chưa có trang ' + TRANG.KHACH_HANG + '. Chạy mục 1 và mục 2 trong menu "San xuat video" trước.');
    }
  } catch (e) {
    canhBao.push('Chưa kiểm tra được trang KHACH_HANG: ' + e.message);
  }

  if (!PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')) {
    canhBao.push('Chưa có OPENAI_API_KEY trong Thuộc tính của script. Các bước gọi AI sẽ báo lỗi.');
  }

  var chu = loi.length ? 'CÓ LỖI CẦN SỬA:\n- ' + loi.join('\n- ') : 'Các thành phần bắt buộc đều đầy đủ.';
  if (canhBao.length) { chu += '\n\nCẦN LƯU Ý:\n- ' + canhBao.join('\n- '); }

  var giaoDien = SpreadsheetApp.getUi();
  giaoDien.alert('Kiểm tra bảng điều khiển', chu, giaoDien.ButtonSet.OK);
}

/* =========================== TIỆN ÍCH RIÊNG =========================== */

/** Đọc một trang tính và gom các dòng theo MA_KH. Trang chưa có thì trả về rỗng. */
function gomTrang_(tenTrang) {
  var trang = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tenTrang);
  if (!trang) { return { chiSo: {}, theoMa: {} }; }

  var bang = docBang_(trang);
  var theoMa = {};
  var cot = bang.chiSo['MA_KH'];
  if (cot !== undefined) {
    for (var i = 0; i < bang.hang.length; i++) {
      var ma = String(bang.hang[i][cot]).trim();
      if (!ma) { continue; }
      if (!theoMa[ma]) { theoMa[ma] = []; }
      theoMa[ma].push(bang.hang[i]);
    }
  }
  return { chiSo: bang.chiSo, theoMa: theoMa };
}

/** Đọc một ô theo tên cột từ đối tượng bảng đã gom. */
function oBang_(bang, hang, tenCot) {
  var i = bang.chiSo[tenCot];
  return (i === undefined || !hang) ? '' : hang[i];
}

/** Đọc trang CAU_HINH, không ném lỗi nếu trang chưa có. */
function docCauHinhAnToan_() {
  try { return docCauHinh_(); } catch (loi) { return {}; }
}

/** Đổi giá trị bất kỳ thành số nguyên, có giá trị dự phòng. */
function soNguyen_(giaTri, macDinh) {
  var so = Number(giaTri);
  return (isNaN(so) || String(giaTri).trim() === '') ? macDinh : Math.round(so);
}

/** Định dạng ngày ngắn gọn; giá trị rỗng trả về chuỗi rỗng. */
function ngayNgan_(giaTri) {
  if (giaTri === '' || giaTri === null || giaTri === undefined) { return ''; }
  if (Object.prototype.toString.call(giaTri) === '[object Date]') {
    return Utilities.formatDate(giaTri, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(giaTri).trim();
}