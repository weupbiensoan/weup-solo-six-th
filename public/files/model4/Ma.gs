/**
 * ============================================================================
 * BÁO CÁO BÁN HÀNG TUẦN — TỆP CHÍNH
 * Gắn với bảng tính đang mở. Mã tính số, AI chỉ viết chữ.
 *
 * BẢN VÁ CHỌN KỲ BÁO CÁO
 * Khóa KY_BAO_CAO ở trang CAU_HINH nhận thêm một ngày dạng yyyy-MM-dd,
 * ngoài hai giá trị cũ TUAN_HIEN_TAI và TUAN_TRUOC.
 * Bốn chỗ được sửa: giaTriKyBaoCao_, ngayTuChuoiISO_, kyBaoCao_, chayTheoLich.
 * ============================================================================
 */

const TEN_MENU = 'Bao cao tuan';
const URL_OPENAI = 'https://api.openai.com/v1/responses';
const TEN_THUOC_TINH_KHOA = 'OPENAI_API_KEY';

const T = {
  CAU_HINH: 'CAU_HINH',
  DU_LIEU: 'DU_LIEU_NGAY',
  CHI_SO: 'CHI_SO_TUAN',
  BAO_CAO: 'BAO_CAO_AI',
  NHAT_KY: 'NHAT_KY_HE_THONG'
};

const TRANG_THAI = ['CAN_SUA_DU_LIEU', 'CHO_DUYET', 'DA_DUYET_GUI', 'DA_GUI', 'LOI'];

/** Cột số, dùng để bắt số âm và để cộng. */
const COT_SO = ['KHACH_TIEM_NANG_MOI', 'KHACH_DA_LIEN_HE', 'CUOC_HEN', 'DON_THANH_CONG',
  'DOANH_THU_GHI_NHAN', 'TIEN_THUC_THU', 'DON_HUY', 'DON_HOAN'];

/** Cột bắt buộc, dùng để tính tỷ lệ ô trống. */
const COT_BAT_BUOC = ['NGAY', 'NHAN_VIEN'].concat(COT_SO);

const KHUNG = {
  CAU_HINH: ['KHOA', 'GIA_TRI', 'MO_TA'],
  DU_LIEU_NGAY: ['NGAY', 'NHAN_VIEN', 'KHACH_TIEM_NANG_MOI', 'KHACH_DA_LIEN_HE', 'CUOC_HEN',
    'DON_THANH_CONG', 'DOANH_THU_GHI_NHAN', 'TIEN_THUC_THU', 'DON_HUY', 'DON_HOAN', 'GHI_CHU'],
  CHI_SO_TUAN: ['MA_TUAN', 'TU_NGAY', 'DEN_NGAY', 'KHACH_TIEM_NANG_MOI', 'KHACH_DA_LIEN_HE',
    'CUOC_HEN', 'DON_THANH_CONG', 'DOANH_THU_GHI_NHAN', 'TIEN_THUC_THU', 'DON_HUY', 'DON_HOAN',
    'TY_LE_LIEN_HE', 'TY_LE_CHOT', 'TY_LE_HUY', 'TY_LE_HOAN', 'KPI_TUAN', 'MUC_DAT_KPI',
    'SO_SANH_TUAN_TRUOC', 'TRANG_THAI_DU_LIEU', 'NGAY_TINH'],
  BAO_CAO_AI: ['MA_BAO_CAO', 'MA_TUAN', 'NGAY_TAO', 'TONG_QUAN', 'CANH_BAO', 'HANH_DONG_DE_XUAT',
    'CAU_HOI_CHO_QUAN_LY', 'TRANG_THAI', 'NGUOI_DUYET', 'NGAY_DUYET', 'NGAY_GUI', 'NGUOI_NHAN', 'JSON_THO'],
  NHAT_KY_HE_THONG: ['THOI_GIAN', 'BUOC', 'KY_BAO_CAO', 'KET_QUA', 'CHI_TIET', 'MA_BAO_CAO', 'NGUOI_THUC_HIEN']
};

/** Cột chỉ con người được điền. Không hàm nào ghi vào. */
const COT_CAM_GHI = {
  BAO_CAO_AI: ['NGUOI_DUYET', 'NGAY_DUYET']
};

/* --------------------------------- MENU ---------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu(TEN_MENU)
    .addItem('Mở bảng điều khiển', 'moBangDieuKhien')
    .addSeparator()
    .addItem('1. Tạo khung trang tính', 'm01_TaoKhungTrangTinh')
    .addItem('2. Kiểm tra dữ liệu tuần', 'm02_KiemTraDuLieuTuan')
    .addItem('3. Tính chỉ số tuần', 'm03_TinhChiSoTuan')
    .addItem('4. Tạo nhận xét bằng AI', 'm04_TaoNhanXetAI')
    .addItem('5. Gửi báo cáo đã duyệt', 'm05_GuiBaoCaoDaDuyet')
    .addSeparator()
    .addItem('6. Kiểm tra kết nối API', 'm06_KiemTraKetNoiAPI')
    .addItem('7. Đặt lịch chạy tự động', 'm07_DatLichChayTuDong')
    .addToUi();
}

/* ----------------------------- TIỆN ÍCH CHUNG ---------------------------- */

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function muiGio_() { return ss_().getSpreadsheetTimeZone(); }

function mui_() {
  return Utilities.formatDate(new Date(), muiGio_(), 'yyyy-MM-dd HH:mm:ss');
}

function ngayText_(d) {
  if (!d) return '';
  const x = ngayTuGiaTri_(d);
  return x ? Utilities.formatDate(x, muiGio_(), 'yyyy-MM-dd') : String(d);
}

function ngayTuGiaTri_(v) {
  if (!v && v !== 0) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }
  const m = String(v).match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const m2 = String(v).match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m2) return new Date(Number(m2[3]), Number(m2[2]) - 1, Number(m2[1]));
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function homNay_() {
  const s = Utilities.formatDate(new Date(), muiGio_(), 'yyyy/MM/dd');
  return new Date(s + ' 00:00:00');
}

function congNgay_(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function so_(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function chuoi_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Array]') {
    return v.map(function (x) { return chuoi_(x); }).filter(String).join('; ');
  }
  if (typeof v === 'object') {
    return Object.keys(v).map(function (k) { return chuoi_(v[k]); }).filter(String).join('; ');
  }
  return String(v);
}

function trang_(ten, batBuoc) {
  const sh = ss_().getSheetByName(ten);
  if (!sh && batBuoc !== false) {
    throw new Error('Chưa có trang "' + ten + '". Chạy mục 1 Tạo khung trang tính trước.');
  }
  return sh;
}

/**
 * Đọc trang dữ liệu ngày. Nếu CAU_HINH có ID_FILE_KHACH thì đọc thẳng file của khách,
 * người bán không phải chép tay hằng tuần. Để trống thì đọc trang trong chính tệp này.
 */
function docDuLieuNgay_() {
  const id = String(cauHinh_('ID_FILE_KHACH', '')).trim();
  if (!id) return docBang_(T.DU_LIEU);

  const tenTrang = String(cauHinh_('TEN_TRANG_KHACH', 'DU_LIEU_NGAY')).trim();
  let bang;
  try {
    bang = SpreadsheetApp.openById(layIdTuDuongDan_(id));
  } catch (e) {
    throw new Error('Không mở được file của khách. Kiểm tra ID_FILE_KHACH ở trang CAU_HINH và ' +
      'kiểm tra bạn đã được chia sẻ quyền xem file đó chưa. Chi tiết: ' + e.message);
  }
  const sh = bang.getSheetByName(tenTrang);
  if (!sh) {
    throw new Error('File của khách không có trang tên "' + tenTrang +
      '". Sửa khóa TEN_TRANG_KHACH ở trang CAU_HINH cho khớp.');
  }

  const soCot = Math.max(sh.getLastColumn(), 1);
  const soDong = sh.getLastRow();
  const tieuDe = sh.getRange(1, 1, 1, soCot).getValues()[0];
  const h = {};
  // Tên cột của khách có thể viết thường, quy về chữ hoa để tra cho khớp.
  tieuDe.forEach(function (v, i) {
    const k = String(v).trim().toUpperCase().replace(/\s+/g, '_');
    if (k) h[k] = i;
  });
  const thieu = KHUNG.DU_LIEU_NGAY.filter(function (c) { return h[c] === undefined; });
  if (thieu.length) {
    throw new Error('File của khách thiếu cột: ' + thieu.join(', ') +
      '. Gửi lại khách file mẫu để họ điền đúng 11 cột.');
  }
  const rows = soDong > 1 ? sh.getRange(2, 1, soDong - 1, soCot).getValues() : [];
  return { sh: sh, h: h, rows: rows, tenTrang: tenTrang, tuFileKhach: true, tenFile: bang.getName() };
}

/** Nhận cả ID lẫn đường dẫn đầy đủ, cắt lấy ID. */
function layIdTuDuongDan_(v) {
  const m = String(v).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : String(v).trim();
}

function docBang_(ten) {
  const sh = trang_(ten);
  const soCot = Math.max(sh.getLastColumn(), 1);
  const soDong = sh.getLastRow();
  const tieuDe = sh.getRange(1, 1, 1, soCot).getValues()[0];
  const h = {};
  tieuDe.forEach(function (v, i) { if (v !== '') h[String(v).trim()] = i; });
  const rows = soDong > 1 ? sh.getRange(2, 1, soDong - 1, soCot).getValues() : [];
  return { sh: sh, h: h, rows: rows, tenTrang: ten };
}

function ghiO_(b, dongBang, cot, giaTri) {
  const cam = COT_CAM_GHI[b.tenTrang] || [];
  if (cam.indexOf(cot) >= 0) {
    throw new Error('Cột ' + cot + ' của ' + b.tenTrang + ' chỉ do con người điền.');
  }
  if (b.h[cot] === undefined) throw new Error('Trang ' + b.tenTrang + ' không có cột ' + cot + '.');
  b.sh.getRange(dongBang + 2, b.h[cot] + 1).setValue(giaTri);
  b.rows[dongBang][b.h[cot]] = giaTri;
}

function themDong_(tenTrang, obj) {
  const sh = trang_(tenTrang);
  const tieuDe = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const cam = COT_CAM_GHI[tenTrang] || [];
  cam.forEach(function (c) {
    if (obj[c] !== undefined && obj[c] !== '') {
      throw new Error('Cột ' + c + ' của ' + tenTrang + ' chỉ do con người điền.');
    }
  });
  sh.appendRow(tieuDe.map(function (t) {
    const k = String(t).trim();
    return obj[k] === undefined ? '' : obj[k];
  }));
  return sh.getLastRow();
}

/**
 * Ghi nhật ký. Hàm này phải chạy được cả khi không có giao diện,
 * vì trình kích hoạt theo lịch không có ai ngồi trước màn hình.
 */
function ghiNhatKy_(buoc, kyBaoCao, ketQua, chiTiet, maBaoCao) {
  const sh = trang_(T.NHAT_KY, false);
  if (!sh) return;
  let nguoi = '';
  try { nguoi = Session.getActiveUser().getEmail(); } catch (e) { nguoi = 'trinh kich hoat'; }
  sh.appendRow([mui_(), buoc, kyBaoCao || '', ketQua, String(chiTiet).slice(0, 5000),
    maBaoCao || '', nguoi]);
}

function hopLeEmail_(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}

function thongBao_(tieuDe, noiDung) {
  SpreadsheetApp.getUi().alert(tieuDe, noiDung, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ------------------------------- CẤU HÌNH -------------------------------- */

var _cacheCauHinh = null;

function cauHinh_(khoa, macDinh) {
  if (!_cacheCauHinh) {
    const b = docBang_(T.CAU_HINH);
    _cacheCauHinh = {};
    b.rows.forEach(function (r) {
      const k = String(r[b.h.KHOA] || '').trim();
      if (k) _cacheCauHinh[k] = r[b.h.GIA_TRI];
    });
  }
  const v = _cacheCauHinh[khoa];
  if (v === undefined || v === null || String(v).trim() === '') return macDinh;
  return v;
}

function datCauHinh_(khoa, giaTri, moTa) {
  const b = docBang_(T.CAU_HINH);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.KHOA]).trim() === khoa) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(giaTri);
      _cacheCauHinh = null;
      return;
    }
  }
  b.sh.appendRow([khoa, giaTri, moTa || '']);
  _cacheCauHinh = null;
}

/* --------------------------- KỲ BÁO CÁO THEO TUẦN ------------------------ */

/**
 * Đọc khóa KY_BAO_CAO về dạng chuỗi.
 * Google Sheets có thể tự đổi ô "2026-08-10" thành giá trị ngày, nên phải
 * quy cả hai trường hợp về cùng một dạng trước khi so sánh.
 */
function giaTriKyBaoCao_() {
  const v = cauHinh_('KY_BAO_CAO', 'TUAN_HIEN_TAI');
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, muiGio_(), 'yyyy-MM-dd');
  }
  return String(v).trim();
}

/**
 * Đọc chuỗi đúng dạng yyyy-MM-dd thành Date lúc 0 giờ, cùng chuẩn với
 * ngayTuGiaTri_ và homNay_ để phép so sánh ngày không bị lệch.
 * Trả về null nếu sai dạng hoặc ngày không có thật, ví dụ 2026-02-30.
 */
function ngayTuChuoiISO_(chuoi) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(chuoi).trim());
  if (!m) return null;
  const nam = Number(m[1]), thang = Number(m[2]), ngay = Number(m[3]);
  const d = new Date(nam, thang - 1, ngay);
  if (d.getFullYear() !== nam || d.getMonth() !== thang - 1 || d.getDate() !== ngay) return null;
  return d;
}

/**
 * Kỳ báo cáo: thứ Hai đến Chủ Nhật, theo múi giờ của bảng tính.
 * Khóa KY_BAO_CAO nhận ba dạng:
 *   TUAN_HIEN_TAI  tuần chứa ngày hôm nay, giá trị mặc định
 *   TUAN_TRUOC     lùi một tuần so với hôm nay
 *   yyyy-MM-dd     tuần chứa ngày đó, ví dụ 2026-08-10, dùng để chạy lại tuần cũ
 * Tham số moc, nếu được truyền vào, luôn thắng giá trị trong CAU_HINH.
 */
function kyBaoCao_(moc) {
  const gt = giaTriKyBaoCao_();
  let goc;
  let luiMotTuan = false;

  if (moc) {
    goc = ngayTuGiaTri_(moc);
    if (!goc) throw new Error('Không đọc được ngày mốc truyền vào: ' + moc);
  } else {
    const ngayCoDinh = ngayTuChuoiISO_(gt);
    if (ngayCoDinh) {
      goc = ngayCoDinh;
    } else if (gt === 'TUAN_HIEN_TAI' || gt === 'TUAN_TRUOC') {
      goc = homNay_();
      luiMotTuan = (gt === 'TUAN_TRUOC');
    } else {
      throw new Error('Khóa KY_BAO_CAO ở trang CAU_HINH đang là "' + gt +
        '". Chỉ nhận TUAN_HIEN_TAI, TUAN_TRUOC, hoặc một ngày dạng yyyy-MM-dd như 2026-08-10.');
    }
  }

  const thu = goc.getDay(); // 0 là Chủ Nhật
  const lui = thu === 0 ? 6 : thu - 1;
  let batDau = congNgay_(goc, -lui);
  if (luiMotTuan) batDau = congNgay_(batDau, -7);
  const ketThuc = congNgay_(batDau, 6);
  return { batDau: batDau, ketThuc: ketThuc, ma: maTuan_(batDau) };
}

function maTuan_(batDau) {
  const nam = Utilities.formatDate(batDau, muiGio_(), 'yyyy');
  const tuan = Utilities.formatDate(batDau, muiGio_(), 'ww');
  return 'TUAN-' + nam + '-W' + tuan;
}

/* ----------------- MỤC 1 — TẠO KHUNG TRANG TÍNH -------------------------- */

function m01_TaoKhungTrangTinh() {
  const kq = taoKhung_();
  ghiNhatKy_('1. Tạo khung trang tính', '', 'OK', kq);
  thongBao_('Tạo khung trang tính', kq +
    '\n\nViệc tiếp theo: mở Cài đặt dự án trong Apps Script và đặt múi giờ về Bangkok hoặc Hồ Chí Minh, ' +
    'rồi lưu khóa OPENAI_API_KEY trước khi chạy mục 4.');
}

function taoKhung_() {
  const bang = ss_();
  Object.keys(KHUNG).forEach(function (ten) {
    let sh = bang.getSheetByName(ten);
    if (!sh) sh = bang.insertSheet(ten);
    const cot = KHUNG[ten];
    const hienTai = sh.getLastColumn() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : [];
    const thieu = cot.filter(function (c) { return hienTai.indexOf(c) < 0; });
    if (hienTai.filter(String).length === 0) {
      sh.getRange(1, 1, 1, cot.length).setValues([cot]);
    } else if (thieu.length) {
      sh.getRange(1, hienTai.length + 1, 1, thieu.length).setValues([thieu]);
    }
    sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), cot.length))
      .setFontWeight('bold').setBackground('#144080').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  });

  // Danh sách xổ cho cột trạng thái
  const bb = docBang_(T.BAO_CAO);
  if (bb.h.TRANG_THAI !== undefined) {
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(TRANG_THAI, true)
      .setAllowInvalid(false).build();
    bb.sh.getRange(2, bb.h.TRANG_THAI + 1, Math.max(bb.sh.getMaxRows() - 1, 1)).setDataValidation(rule);
  }

  napCauHinhMacDinh_();
  return 'Đã kiểm tra và bổ sung ' + Object.keys(KHUNG).length + ' trang tính cùng các khóa cấu hình mặc định.';
}

function napCauHinhMacDinh_() {
  const macDinh = [
    ['TEN_DOANH_NGHIEP', '', 'Tên hiện trong tiêu đề email báo cáo.'],
    ['ID_FILE_KHACH', '', 'ID file Google Sheets của khách. Lấy đoạn giữa /d/ và /edit trên đường dẫn. Để trống thì mã đọc trang DU_LIEU_NGAY ngay trong tệp này.'],
    ['TEN_TRANG_KHACH', 'DU_LIEU_NGAY', 'Tên trang chứa dữ liệu trong file của khách.'],
    ['KY_BAO_CAO', 'TUAN_HIEN_TAI', 'TUAN_HIEN_TAI, TUAN_TRUOC, hoặc một ngày dạng yyyy-MM-dd như 2026-08-10 để chạy lại tuần cũ. Tuần luôn tính từ thứ Hai đến Chủ Nhật. Đặt ngày cố định thì lịch tự động sẽ bỏ qua, nhớ đổi về TUAN_HIEN_TAI sau khi thử xong.'],
    ['KPI_TUAN', 400000000, 'Chỉ tiêu tiền thực thu của tuần, dùng để tính mức đạt KPI.'],
    ['TY_LE_O_TRONG_TOI_DA', 5, 'Quá tỷ lệ phần trăm này thì dừng, không tính chỉ số.'],
    ['NGUONG_GIAM_TIEN_THUC_THU', 5, 'Tiền thực thu giảm quá bao nhiêu phần trăm so với tuần trước thì cảnh báo.'],
    ['NGUONG_GIAM_TY_LE_CHOT', 1, 'Tỷ lệ chốt giảm quá bao nhiêu điểm phần trăm thì cảnh báo.'],
    ['EMAIL_NGUOI_NHAN', '', 'Danh sách email nhận báo cáo, cách nhau bằng dấu phẩy.'],
    ['MODEL', 'gpt-5.6', 'Tên model OpenAI. Đổi ở đây, không cần mở mã.'],
    ['MAX_OUTPUT_TOKENS', 4000, 'Giới hạn độ dài phần AI trả về. Tăng khi nội dung bị cắt.'],
    ['SO_EMAIL_MOI_LAN_CHAY', 20, 'Trần cứng của hệ thống là 20 người nhận mỗi lần chạy.'],

    ['PROMPT_HE_THONG',
      'Bạn viết phần nhận xét cho báo cáo bán hàng tuần của một doanh nghiệp nhỏ.\n' +
      'Bạn chỉ nhận bảng chỉ số đã được tính sẵn. Không tính lại, không cộng trừ, không suy ra con số mới.\n' +
      'Không nhắc tên nhân viên cụ thể. Không đánh giá năng lực cá nhân. Không đề xuất thưởng phạt.\n' +
      'Nếu dữ liệu chưa đủ để kết luận, hãy nói rõ là chưa đủ dữ liệu thay vì suy đoán nguyên nhân.\n' +
      'Viết tiếng Việt, giọng trung tính, mỗi phần tối đa 5 câu.\n' +
      'Trả về đúng bốn trường theo lược đồ đã khai báo.',
      'Câu lệnh hệ thống gửi cho AI ở mục 4.'],

    ['PROMPT_NGUOI_DUNG',
      'Đây là bảng chỉ số tuần đã tính sẵn kèm số liệu tuần trước và chỉ tiêu.\n' +
      'TONG_QUAN: tóm tắt tình hình tuần bằng chính các con số trong bảng.\n' +
      'CANH_BAO: nêu các chỉ số đi xuống hoặc vượt ngưỡng, kèm mức thay đổi.\n' +
      'HANH_DONG_DE_XUAT: đề xuất việc người quản lý nên kiểm tra trong tuần tới, không hứa kết quả.\n' +
      'CAU_HOI_CHO_QUAN_LY: câu hỏi cần người quản lý xác nhận vì dữ liệu chưa đủ để kết luận.',
      'Câu lệnh nội dung gửi kèm bảng chỉ số ở mục 4.'],

    ['EMAIL_TIEU_DE', 'Báo cáo bán hàng tuần {{MA_TUAN}} — {{TEN_DOANH_NGHIEP}}', 'Thẻ thay được: {{MA_TUAN}} {{TEN_DOANH_NGHIEP}}'],
    ['EMAIL_NOI_DUNG',
      'Kính gửi anh/chị,\n\nĐây là báo cáo bán hàng tuần {{TU_NGAY}} đến {{DEN_NGAY}}, đã được người quản lý xem lại trước khi gửi.\n\n' +
      'CHỈ SỐ TUẦN\n{{BANG_CHI_SO}}\n\n' +
      'TỔNG QUAN\n{{TONG_QUAN}}\n\n' +
      'CẢNH BÁO\n{{CANH_BAO}}\n\n' +
      'HÀNH ĐỘNG ĐỀ XUẤT\n{{HANH_DONG_DE_XUAT}}\n\n' +
      'CÂU HỎI CHO QUẢN LÝ\n{{CAU_HOI_CHO_QUAN_LY}}\n\n' +
      'Phần nhận xét do trợ lý AI soạn từ bảng chỉ số và đã được người quản lý duyệt. Mọi con số đều do hệ thống tính từ dữ liệu gốc.\n\n' +
      'Mã báo cáo: {{MA_BAO_CAO}}',
      'Nội dung email gửi khách.']
  ];

  const b = docBang_(T.CAU_HINH);
  const daCo = {};
  b.rows.forEach(function (r) { daCo[String(r[b.h.KHOA]).trim()] = true; });
  const them = macDinh.filter(function (d) { return !daCo[d[0]]; });
  if (them.length) b.sh.getRange(b.sh.getLastRow() + 1, 1, them.length, 3).setValues(them);
  b.sh.setColumnWidth(1, 230);
  b.sh.setColumnWidth(2, 560);
  b.sh.setColumnWidth(3, 320);
  _cacheCauHinh = null;
}

/* ----------------- MỤC 2 — KIỂM TRA DỮ LIỆU TUẦN ------------------------- */

function m02_KiemTraDuLieuTuan() {
  const ky = kyBaoCao_();
  const kq = kiemTraDuLieu_(ky);
  ghiNhatKy_('2. Kiểm tra dữ liệu tuần', ky.ma, kq.dat ? 'OK' : 'CAN_SUA_DU_LIEU', kq.tomTat);
  thongBao_('Kiểm tra dữ liệu tuần ' + ky.ma, kq.tomTat);
}

/**
 * Năm điều kiện dừng: tên nhân viên trống; ngày ngoài kỳ; số âm;
 * dòng trùng theo cặp ngày và nhân viên; quá tỷ lệ ô bắt buộc còn thiếu.
 */
function kiemTraDuLieu_(ky) {
  const b = docDuLieuNgay_();
  const loi = [];
  const trongKy = [];
  let oTrong = 0, oBatBuoc = 0, ngoaiKy = 0;
  const daGap = {};

  b.rows.forEach(function (r, i) {
    const dong = i + 2;
    const ngay = ngayTuGiaTri_(r[b.h.NGAY]);
    const coDuLieu = r.some(function (v) { return String(v).trim() !== ''; });
    if (!coDuLieu) return;

    if (!ngay) { loi.push('Dòng ' + dong + ': cột NGAY trống hoặc không đọc được.'); return; }
    // Tệp dữ liệu tích lũy nhiều tuần. Dòng của kỳ khác được bỏ qua, không tính là lỗi,
    // vì tuần trước phải nằm trong tệp thì mới so sánh được.
    if (ngay.getTime() < ky.batDau.getTime() || ngay.getTime() > ky.ketThuc.getTime()) {
      ngoaiKy++;
      return;
    }
    if (ngay.getTime() > homNay_().getTime()) {
      loi.push('Dòng ' + dong + ': ngày ' + ngayText_(ngay) + ' nằm ở tương lai.');
      return;
    }
    trongKy.push(i);

    const nv = String(r[b.h.NHAN_VIEN] || '').trim();
    if (!nv) loi.push('Dòng ' + dong + ': cột NHAN_VIEN trống.');

    const khoa = ngayText_(ngay) + '|' + nv.toLowerCase();
    if (nv) {
      if (daGap[khoa]) loi.push('Dòng ' + dong + ': trùng với dòng ' + daGap[khoa] + ' theo cặp ngày và nhân viên.');
      else daGap[khoa] = dong;
    }

    COT_SO.forEach(function (c) {
      const v = r[b.h[c]];
      const n = so_(v);
      if (n !== null && n < 0) loi.push('Dòng ' + dong + ': cột ' + c + ' có số âm (' + n + ').');
    });

    COT_BAT_BUOC.forEach(function (c) {
      oBatBuoc++;
      if (String(r[b.h[c]] === undefined ? '' : r[b.h[c]]).trim() === '') oTrong++;
    });
  });

  const tranTrong = Number(cauHinh_('TY_LE_O_TRONG_TOI_DA', 5)) || 5;
  const tyLeTrong = oBatBuoc ? Math.round(oTrong / oBatBuoc * 1000) / 10 : 0;
  if (tyLeTrong > tranTrong) {
    loi.push('Tỷ lệ ô bắt buộc còn trống là ' + tyLeTrong + ' phần trăm, vượt ngưỡng ' + tranTrong + ' phần trăm.');
  }
  if (!trongKy.length) {
    loi.push('Không có dòng dữ liệu nào thuộc kỳ ' + ngayText_(ky.batDau) + ' đến ' +
      ngayText_(ky.ketThuc) + '.' + (ngoaiKy ? ' Tệp có ' + ngoaiKy + ' dòng thuộc kỳ khác.' : '') +
      ' Đổi khóa KY_BAO_CAO ở trang CAU_HINH sang TUAN_TRUOC hoặc sang một ngày dạng yyyy-MM-dd nằm trong tuần có dữ liệu.');
  }

  const dat = loi.length === 0;
  const tomTat = dat
    ? ('Dữ liệu đạt. ' + trongKy.length + ' dòng thuộc kỳ ' + ngayText_(ky.batDau) + ' đến ' +
      ngayText_(ky.ketThuc) + '. Tỷ lệ ô trống ' + tyLeTrong + ' phần trăm.' +
      (ngoaiKy ? ' Bỏ qua ' + ngoaiKy + ' dòng thuộc kỳ khác.' : ''))
    : ('CAN_SUA_DU_LIEU — ' + loi.length + ' lỗi:\n' + loi.slice(0, 30).join('\n') +
      (loi.length > 30 ? '\n... còn ' + (loi.length - 30) + ' lỗi nữa, xem NHAT_KY_HE_THONG.' : ''));

  return { dat: dat, loi: loi, dong: trongKy, tyLeTrong: tyLeTrong, ngoaiKy: ngoaiKy, tomTat: tomTat };
}

/* ------------------- MỤC 3 — TÍNH CHỈ SỐ TUẦN ---------------------------- */

function m03_TinhChiSoTuan() {
  const ky = kyBaoCao_();
  const kq = tinhChiSo_(ky);
  ghiNhatKy_('3. Tính chỉ số tuần', ky.ma, kq.ok ? 'OK' : 'DUNG', kq.thongBao);
  thongBao_('Tính chỉ số tuần ' + ky.ma, kq.thongBao);
}

function tinhChiSo_(ky, khongTinhTuanTruoc) {
  const kiem = kiemTraDuLieu_(ky);
  if (!kiem.dat) {
    ghiNhatKy_('3. Tính chỉ số tuần', ky.ma, 'CAN_SUA_DU_LIEU', kiem.tomTat);
    return { ok: false, thongBao: 'Chưa tính được vì dữ liệu chưa đạt.\n\n' + kiem.tomTat };
  }

  const b = docDuLieuNgay_();
  const tong = {};
  COT_SO.forEach(function (c) { tong[c] = 0; });
  kiem.dong.forEach(function (i) {
    COT_SO.forEach(function (c) { tong[c] += so_(b.rows[i][b.h[c]]) || 0; });
  });

  const canhBaoTinh = [];
  function tyLe(tu, mau, ten) {
    if (!mau) {
      canhBaoTinh.push('Không tính được ' + ten + ' vì mẫu số bằng 0.');
      return '';
    }
    return Math.round(tu / mau * 1000) / 10;
  }

  const tyLeLienHe = tyLe(tong.KHACH_DA_LIEN_HE, tong.KHACH_TIEM_NANG_MOI, 'tỷ lệ liên hệ');
  const tyLeChot = tyLe(tong.DON_THANH_CONG, tong.KHACH_DA_LIEN_HE, 'tỷ lệ chốt');
  const tyLeHuy = tyLe(tong.DON_HUY, tong.DON_THANH_CONG, 'tỷ lệ hủy');
  const tyLeHoan = tyLe(tong.DON_HOAN, tong.DON_THANH_CONG, 'tỷ lệ hoàn');
  const kpi = Number(cauHinh_('KPI_TUAN', 0)) || 0;
  const mucDatKpi = kpi ? Math.round(tong.TIEN_THUC_THU / kpi * 1000) / 10 : '';
  if (!kpi) canhBaoTinh.push('Chưa đặt KPI_TUAN ở trang CAU_HINH nên không tính được mức đạt KPI.');

  // Lấy tuần trước từ CHI_SO_TUAN. Chưa có thì tự tính từ dữ liệu ngày,
  // vì tệp dữ liệu thường đã chứa sẵn nhiều tuần.
  const kyTruoc = {
    batDau: congNgay_(ky.batDau, -7),
    ketThuc: congNgay_(ky.ketThuc, -7),
    ma: maTuan_(congNgay_(ky.batDau, -7))
  };
  let truoc = docDongChiSo_(kyTruoc.ma);
  if (!truoc && !khongTinhTuanTruoc) {
    const kqTruoc = tinhChiSo_(kyTruoc, true);
    if (kqTruoc.ok) truoc = docDongChiSo_(kyTruoc.ma);
  }
  const soSanh = truoc ? soSanhTuanTruoc_(tong, tyLeChot, truoc)
    : 'Chưa có dữ liệu tuần trước để so sánh.';

  const obj = {
    MA_TUAN: ky.ma,
    TU_NGAY: ngayText_(ky.batDau),
    DEN_NGAY: ngayText_(ky.ketThuc),
    TY_LE_LIEN_HE: tyLeLienHe,
    TY_LE_CHOT: tyLeChot,
    TY_LE_HUY: tyLeHuy,
    TY_LE_HOAN: tyLeHoan,
    KPI_TUAN: kpi,
    MUC_DAT_KPI: mucDatKpi,
    SO_SANH_TUAN_TRUOC: soSanh,
    TRANG_THAI_DU_LIEU: 'DAT',
    NGAY_TINH: mui_()
  };
  COT_SO.forEach(function (c) { obj[c] = tong[c]; });

  ghiHoacCapNhatChiSo_(obj);
  const tb = 'Đã tính xong tuần ' + ky.ma + '.\n' +
    'Tiền thực thu ' + tong.TIEN_THUC_THU.toLocaleString('vi-VN') + ' đồng, tỷ lệ chốt ' + tyLeChot + ' phần trăm.\n' +
    soSanh + (canhBaoTinh.length ? '\n\nLưu ý:\n' + canhBaoTinh.join('\n') : '');
  return { ok: true, thongBao: tb, chiSo: obj };
}

function docDongChiSo_(maTuan) {
  const b = docBang_(T.CHI_SO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_TUAN]).trim() === maTuan) {
      const o = {};
      Object.keys(b.h).forEach(function (c) { o[c] = b.rows[i][b.h[c]]; });
      o._dong = i;
      return o;
    }
  }
  return null;
}

function soSanhTuanTruoc_(tong, tyLeChot, truoc) {
  const phan = [];
  function delta(nay, truocV, ten, donVi) {
    const t = so_(truocV);
    if (t === null || t === 0) return;
    const ch = Math.round((nay - t) / t * 1000) / 10;
    phan.push(ten + ' ' + (ch >= 0 ? 'tăng ' : 'giảm ') + Math.abs(ch) + ' phần trăm' + (donVi || ''));
  }
  delta(tong.KHACH_TIEM_NANG_MOI, truoc.KHACH_TIEM_NANG_MOI, 'Khách tiềm năng mới');
  delta(tong.DON_THANH_CONG, truoc.DON_THANH_CONG, 'Đơn thành công');
  delta(tong.TIEN_THUC_THU, truoc.TIEN_THUC_THU, 'Tiền thực thu');
  const tlt = so_(truoc.TY_LE_CHOT);
  if (tlt !== null && tyLeChot !== '') {
    const d = Math.round((tyLeChot - tlt) * 10) / 10;
    phan.push('Tỷ lệ chốt ' + (d >= 0 ? 'tăng ' : 'giảm ') + Math.abs(d) + ' điểm phần trăm');
  }
  return 'So với tuần trước: ' + phan.join('; ') + '.';
}

function ghiHoacCapNhatChiSo_(obj) {
  const b = docBang_(T.CHI_SO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_TUAN]).trim() === obj.MA_TUAN) {
      Object.keys(obj).forEach(function (c) {
        if (b.h[c] !== undefined) b.sh.getRange(i + 2, b.h[c] + 1).setValue(obj[c]);
      });
      return;
    }
  }
  themDong_(T.CHI_SO, obj);
}

/* ------------------ MỤC 4 — TẠO NHẬN XÉT BẰNG AI ------------------------- */

function m04_TaoNhanXetAI() {
  const ky = kyBaoCao_();
  const kq = taoNhanXet_(ky);
  thongBao_('Tạo nhận xét bằng AI — ' + ky.ma, kq.thongBao);
}

function taoNhanXet_(ky) {
  const chiSo = docDongChiSo_(ky.ma);
  if (!chiSo) {
    return { ok: false, thongBao: 'Chưa có dòng chỉ số cho tuần ' + ky.ma + '. Chạy mục 3 trước.' };
  }
  if (docBaoCao_(ky.ma)) {
    return { ok: false, thongBao: 'Tuần ' + ky.ma + ' đã có báo cáo. Xóa dòng cũ ở BAO_CAO_AI nếu muốn tạo lại.' };
  }

  const truoc = docDongChiSo_(maTuan_(congNgay_(ky.batDau, -7)));
  const duLieuGui = {
    tuan: ky.ma,
    tu_ngay: ngayText_(ky.batDau),
    den_ngay: ngayText_(ky.ketThuc),
    chi_so_tuan_nay: rutGonChiSo_(chiSo),
    chi_so_tuan_truoc: truoc ? rutGonChiSo_(truoc) : null,
    kpi_tuan: chiSo.KPI_TUAN,
    muc_dat_kpi_phan_tram: chiSo.MUC_DAT_KPI,
    so_sanh_da_tinh_san: chiSo.SO_SANH_TUAN_TRUOC,
    nguong_canh_bao: {
      giam_tien_thuc_thu_phan_tram: Number(cauHinh_('NGUONG_GIAM_TIEN_THUC_THU', 5)),
      giam_ty_le_chot_diem_phan_tram: Number(cauHinh_('NGUONG_GIAM_TY_LE_CHOT', 1))
    }
  };

  const maBaoCao = maBaoCaoMoi_();
  let kq;
  try {
    kq = goiOpenAI_(
      chuoi_(cauHinh_('PROMPT_HE_THONG', '')),
      chuoi_(cauHinh_('PROMPT_NGUOI_DUNG', '')) + '\n\nDỮ LIỆU:\n' + JSON.stringify(duLieuGui)
    );
  } catch (e) {
    themDong_(T.BAO_CAO, {
      MA_BAO_CAO: maBaoCao, MA_TUAN: ky.ma, NGAY_TAO: mui_(),
      TRANG_THAI: 'LOI', JSON_THO: e.message
    });
    ghiNhatKy_('4. Tạo nhận xét bằng AI', ky.ma, 'LOI', e.message, maBaoCao);
    return {
      ok: false, thongBao: 'Gọi AI không thành công: ' + e.message +
        '\n\nBảng chỉ số vẫn giữ nguyên. Bạn viết nhận xét tay vào bốn cột của dòng vừa tạo rồi đổi trạng thái sang CHO_DUYET.'
    };
  }

  if (!kq.ok) {
    themDong_(T.BAO_CAO, {
      MA_BAO_CAO: maBaoCao, MA_TUAN: ky.ma, NGAY_TAO: mui_(),
      TRANG_THAI: 'LOI', JSON_THO: String(kq.tho).slice(0, 45000)
    });
    ghiNhatKy_('4. Tạo nhận xét bằng AI', ky.ma, 'SAI_DINH_DANG', 'Xem cột JSON_THO', maBaoCao);
    return {
      ok: false, thongBao: 'AI trả về sai định dạng hoặc rỗng. Nguyên văn đã ghi vào cột JSON_THO, các cột khác giữ nguyên.' +
        '\n\nNếu nội dung bị cắt giữa chừng, tăng khóa MAX_OUTPUT_TOKENS ở trang CAU_HINH.'
    };
  }

  themDong_(T.BAO_CAO, {
    MA_BAO_CAO: maBaoCao,
    MA_TUAN: ky.ma,
    NGAY_TAO: mui_(),
    TONG_QUAN: chuoi_(kq.data.TONG_QUAN),
    CANH_BAO: chuoi_(kq.data.CANH_BAO),
    HANH_DONG_DE_XUAT: chuoi_(kq.data.HANH_DONG_DE_XUAT),
    CAU_HOI_CHO_QUAN_LY: chuoi_(kq.data.CAU_HOI_CHO_QUAN_LY),
    TRANG_THAI: 'CHO_DUYET',
    NGUOI_NHAN: chuoi_(cauHinh_('EMAIL_NGUOI_NHAN', ''))
  });
  ghiNhatKy_('4. Tạo nhận xét bằng AI', ky.ma, 'OK', 'Đã tạo dự thảo', maBaoCao);

  return {
    ok: true, maBaoCao: maBaoCao,
    thongBao: 'Đã tạo dự thảo ' + maBaoCao + ', trạng thái CHO_DUYET.\n\n' +
      'Việc tiếp theo là của bạn: đọc bốn phần nhận xét, sửa nếu cần, điền NGUOI_DUYET và NGAY_DUYET, ' +
      'rồi đổi TRANG_THAI sang DA_DUYET_GUI. Không hàm nào tự đổi sang trạng thái đó.'
  };
}

function rutGonChiSo_(c) {
  const o = {};
  ['KHACH_TIEM_NANG_MOI', 'KHACH_DA_LIEN_HE', 'CUOC_HEN', 'DON_THANH_CONG',
    'DOANH_THU_GHI_NHAN', 'TIEN_THUC_THU', 'DON_HUY', 'DON_HOAN',
    'TY_LE_LIEN_HE', 'TY_LE_CHOT', 'TY_LE_HUY', 'TY_LE_HOAN'].forEach(function (k) {
      o[k] = c[k];
    });
  return o;
}

function maBaoCaoMoi_() {
  const b = docBang_(T.BAO_CAO);
  let max = 0;
  b.rows.forEach(function (r) {
    const m = String(r[b.h.MA_BAO_CAO] || '').match(/^BC-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'BC-' + Utilities.formatString('%04d', max + 1);
}

function docBaoCao_(maTuan) {
  const b = docBang_(T.BAO_CAO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_TUAN]).trim() === maTuan) {
      const o = {};
      Object.keys(b.h).forEach(function (c) { o[c] = b.rows[i][b.h[c]]; });
      o._dong = i;
      return o;
    }
  }
  return null;
}

/* -------------------------- GỌI OPENAI ----------------------------------- */

function layKhoaAPI_() {
  const k = PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA);
  if (!k) {
    throw new Error('Chưa có khóa API. Vào Cài đặt dự án, mục Thuộc tính của tập lệnh, thêm ' +
      TEN_THUOC_TINH_KHOA + '.');
  }
  return k;
}

function moTaLoiApi_(ma, than) {
  if (ma === 401) return 'Lỗi 401: khóa API sai hoặc đã bị thu hồi.';
  if (ma === 429) return 'Lỗi 429: hết hạn mức hoặc gọi quá nhanh. Kiểm tra mục Billing của OpenAI.';
  if (ma === 404) return 'Lỗi 404: sai tên model. Kiểm tra khóa MODEL ở trang CAU_HINH.';
  if (ma === 400) return 'Lỗi 400: yêu cầu sai cấu trúc. ' + String(than).slice(0, 400);
  return 'Lỗi HTTP ' + ma + ': ' + String(than).slice(0, 400);
}

/** Lược đồ bốn trường. Cả bốn đều bắt buộc và additionalProperties bằng false. */
function luocDoNhanXet_() {
  return {
    type: 'object',
    properties: {
      TONG_QUAN: { type: 'string' },
      CANH_BAO: { type: 'string' },
      HANH_DONG_DE_XUAT: { type: 'string' },
      CAU_HOI_CHO_QUAN_LY: { type: 'string' }
    },
    required: ['TONG_QUAN', 'CANH_BAO', 'HANH_DONG_DE_XUAT', 'CAU_HOI_CHO_QUAN_LY'],
    additionalProperties: false
  };
}

/**
 * Gọi Responses API của OpenAI, yêu cầu đầu ra theo lược đồ JSON.
 * Trả về {ok, data, tho}.
 */
function goiOpenAI_(heThong, nguoiDung) {
  const khoa = layKhoaAPI_();
  const payload = {
    model: String(cauHinh_('MODEL', 'gpt-5.6')).trim(),
    input: [
      { role: 'system', content: String(heThong || '') },
      { role: 'user', content: String(nguoiDung || '') }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'nhan_xet_bao_cao_tuan',
        strict: true,
        schema: luocDoNhanXet_()
      }
    },
    max_output_tokens: Math.max(4000, Number(cauHinh_('MAX_OUTPUT_TOKENS', 4000)) || 4000)
  };

  const res = UrlFetchApp.fetch(URL_OPENAI, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + khoa },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const ma = res.getResponseCode();
  const than = res.getContentText();
  if (ma !== 200) throw new Error(moTaLoiApi_(ma, than));

  const data = JSON.parse(than);
  if (data.status === 'incomplete') {
    return {
      ok: false, data: null,
      tho: 'Phản hồi bị cắt vì chạm giới hạn độ dài. Tăng MAX_OUTPUT_TOKENS ở CAU_HINH.\n' + than
    };
  }

  const vanBan = docVanBanResponses_(data);
  if (!vanBan) return { ok: false, data: null, tho: than };

  try {
    return { ok: true, data: JSON.parse(vanBan), tho: vanBan };
  } catch (e) {
    return { ok: false, data: null, tho: vanBan };
  }
}

/**
 * Responses API trả về một mảng output. Với model có suy luận, phần tử đầu tiên
 * thường là khối suy luận chứ không phải câu trả lời, nên phải duyệt cả mảng.
 */
function docVanBanResponses_(data) {
  if (data && typeof data.output_text === 'string' && data.output_text) return data.output_text;
  const ds = (data && data.output) || [];
  for (let i = 0; i < ds.length; i++) {
    const phan = ds[i];
    if (!phan || phan.type !== 'message' || !phan.content) continue;
    for (let j = 0; j < phan.content.length; j++) {
      const c = phan.content[j];
      if (c && c.type === 'output_text' && c.text) return c.text;
    }
  }
  return '';
}

/* ---------------- MỤC 5 — GỬI BÁO CÁO ĐÃ DUYỆT --------------------------- */

function m05_GuiBaoCaoDaDuyet() {
  const kq = guiBaoCaoDaDuyet_();
  thongBao_('Gửi báo cáo đã duyệt', kq.thongBao);
}

function guiBaoCaoDaDuyet_(maBaoCaoChiDinh) {
  const b = docBang_(T.BAO_CAO);
  const tran = Math.min(20, Number(cauHinh_('SO_EMAIL_MOI_LAN_CHAY', 20)) || 20);
  const ket = [];
  let daGui = 0;

  for (let i = 0; i < b.rows.length; i++) {
    const ma = String(b.rows[i][b.h.MA_BAO_CAO] || '').trim();
    if (!ma) continue;
    if (maBaoCaoChiDinh && ma !== maBaoCaoChiDinh) continue;

    const tt = String(b.rows[i][b.h.TRANG_THAI] || '').trim();
    if (tt !== 'DA_DUYET_GUI') {
      if (maBaoCaoChiDinh) {
        return { ok: false, thongBao: ma + ': trạng thái đang là ' + (tt || 'trống') + '. Chỉ gửi khi DA_DUYET_GUI.' };
      }
      continue;
    }
    if (String(b.rows[i][b.h.NGAY_GUI] || '').trim()) {
      ket.push(ma + ': đã gửi trước đó, không gửi lại.');
      continue;
    }
    if (!String(b.rows[i][b.h.NGUOI_DUYET] || '').trim()) {
      ket.push(ma + ': chưa điền NGUOI_DUYET, không gửi.');
      continue;
    }
    if (daGui >= tran) { ket.push('Đã đạt trần ' + tran + ' lần gửi, dừng lại.'); break; }

    const dsNhan = String(b.rows[i][b.h.NGUOI_NHAN] || cauHinh_('EMAIL_NGUOI_NHAN', ''))
      .split(',').map(function (s) { return s.trim(); }).filter(String);
    const sai = dsNhan.filter(function (e) { return !hopLeEmail_(e); });
    if (!dsNhan.length || sai.length) {
      ket.push(ma + ': email người nhận trống hoặc sai định dạng (' + sai.join(', ') + '), không gửi.');
      ghiNhatKy_('5. Gửi báo cáo', String(b.rows[i][b.h.MA_TUAN]), 'CANH_BAO', 'Email sai: ' + sai.join(', '), ma);
      continue;
    }

    const maTuan = String(b.rows[i][b.h.MA_TUAN]).trim();
    const chiSo = docDongChiSo_(maTuan) || {};
    const noiDung = dungNoiDungEmail_(b, i, chiSo);

    MailApp.sendEmail(dsNhan.join(','), noiDung.tieuDe, noiDung.than);
    b.sh.getRange(i + 2, b.h.TRANG_THAI + 1).setValue('DA_GUI');
    b.sh.getRange(i + 2, b.h.NGAY_GUI + 1).setValue(mui_());
    ghiNhatKy_('5. Gửi báo cáo', maTuan, 'OK', 'Đã gửi tới ' + dsNhan.join(', '), ma);
    ket.push(ma + ': đã gửi tới ' + dsNhan.join(', ') + '.');
    daGui++;
  }

  if (!ket.length) {
    return { ok: false, thongBao: 'Không có báo cáo nào ở trạng thái DA_DUYET_GUI.\n\nBáo cáo chỉ được gửi sau khi bạn tự đổi trạng thái.' };
  }
  return { ok: true, thongBao: ket.join('\n') };
}

function dungNoiDungEmail_(b, i, chiSo) {
  const thay = {
    '{{MA_BAO_CAO}}': String(b.rows[i][b.h.MA_BAO_CAO] || ''),
    '{{MA_TUAN}}': String(b.rows[i][b.h.MA_TUAN] || ''),
    '{{TEN_DOANH_NGHIEP}}': chuoi_(cauHinh_('TEN_DOANH_NGHIEP', '')),
    '{{TU_NGAY}}': ngayText_(chiSo.TU_NGAY),
    '{{DEN_NGAY}}': ngayText_(chiSo.DEN_NGAY),
    '{{TONG_QUAN}}': String(b.rows[i][b.h.TONG_QUAN] || ''),
    '{{CANH_BAO}}': String(b.rows[i][b.h.CANH_BAO] || ''),
    '{{HANH_DONG_DE_XUAT}}': String(b.rows[i][b.h.HANH_DONG_DE_XUAT] || ''),
    '{{CAU_HOI_CHO_QUAN_LY}}': String(b.rows[i][b.h.CAU_HOI_CHO_QUAN_LY] || ''),
    '{{BANG_CHI_SO}}': bangChiSoDangChu_(chiSo)
  };
  function ap(s) {
    Object.keys(thay).forEach(function (k) { s = s.split(k).join(thay[k]); });
    return s;
  }
  return {
    tieuDe: ap(chuoi_(cauHinh_('EMAIL_TIEU_DE', 'Báo cáo bán hàng tuần'))),
    than: ap(chuoi_(cauHinh_('EMAIL_NOI_DUNG', '')))
  };
}

function bangChiSoDangChu_(c) {
  function d(n) { return (so_(n) === null ? '' : so_(n).toLocaleString('vi-VN')); }
  return [
    'Khách tiềm năng mới: ' + d(c.KHACH_TIEM_NANG_MOI),
    'Khách đã liên hệ: ' + d(c.KHACH_DA_LIEN_HE) + ' (tỷ lệ liên hệ ' + c.TY_LE_LIEN_HE + ' phần trăm)',
    'Cuộc hẹn: ' + d(c.CUOC_HEN),
    'Đơn thành công: ' + d(c.DON_THANH_CONG) + ' (tỷ lệ chốt ' + c.TY_LE_CHOT + ' phần trăm)',
    'Doanh thu ghi nhận: ' + d(c.DOANH_THU_GHI_NHAN) + ' đồng',
    'Tiền thực thu: ' + d(c.TIEN_THUC_THU) + ' đồng (đạt ' + c.MUC_DAT_KPI + ' phần trăm KPI)',
    'Đơn hủy: ' + d(c.DON_HUY) + ' — Đơn hoàn: ' + d(c.DON_HOAN),
    String(c.SO_SANH_TUAN_TRUOC || '')
  ].join('\n');
}

/* ---------------- MỤC 6 — KIỂM TRA KẾT NỐI API --------------------------- */

function m06_KiemTraKetNoiAPI() {
  const ui = SpreadsheetApp.getUi();
  let khoa;
  try { khoa = layKhoaAPI_(); } catch (e) {
    ui.alert('Kiểm tra kết nối API', e.message, ui.ButtonSet.OK);
    return;
  }
  const model = String(cauHinh_('MODEL', 'gpt-5.6')).trim();
  const res = UrlFetchApp.fetch(URL_OPENAI, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + khoa },
    payload: JSON.stringify({
      model: model,
      input: [{ role: 'user', content: 'ping' }],
      max_output_tokens: 4000
    }),
    muteHttpExceptions: true
  });
  const ma = res.getResponseCode();
  const than = res.getContentText();

  let ketLuan;
  if (ma === 200) {
    ketLuan = 'Kết nối tốt.\nModel: ' + model + '\nĐịa chỉ: Responses API';
  } else if (ma === 401) {
    ketLuan = 'SAI KHÓA (401)\nKhóa trong thuộc tính ' + TEN_THUOC_TINH_KHOA +
      ' không hợp lệ hoặc đã bị thu hồi. Tạo khóa mới rồi dán lại.';
  } else if (ma === 429) {
    ketLuan = 'HẾT HẠN MỨC (429)\nTài khoản hết hạn mức hoặc gọi quá nhanh. Kiểm tra mục Billing của OpenAI.';
  } else if (ma === 404) {
    ketLuan = 'SAI TÊN MODEL (404)\nModel "' + model + '" không tồn tại hoặc tài khoản chưa được cấp quyền dùng. ' +
      'Sửa khóa MODEL ở trang CAU_HINH.';
  } else {
    ketLuan = 'Lỗi khác (' + ma + ')\n' + than.slice(0, 700);
  }
  ghiNhatKy_('6. Kiểm tra kết nối API', '', ma === 200 ? 'OK' : 'LOI', ketLuan);
  ui.alert('Kiểm tra kết nối API', ketLuan, ui.ButtonSet.OK);
}

/* ---------------- MỤC 7 — ĐẶT LỊCH CHẠY TỰ ĐỘNG -------------------------- */

function m07_DatLichChayTuDong() {
  const daCo = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'chayTheoLich';
  });
  if (daCo) {
    thongBao_('Đặt lịch chạy tự động', 'Lịch đã có sẵn, không tạo trùng.\n\n' +
      'Xem hoặc xóa tại biểu tượng đồng hồ trong Apps Script.');
    return;
  }
  ScriptApp.newTrigger('chayTheoLich').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(17).create();
  ghiNhatKy_('7. Đặt lịch chạy tự động', '', 'OK', 'Đã tạo trình kích hoạt thứ Sáu khung 17 giờ');
  thongBao_('Đặt lịch chạy tự động',
    'Đã tạo lịch chạy chiều thứ Sáu.\n\n' +
    'Google chạy trong khung 17 đến 18 giờ theo múi giờ của dự án, không đúng phút.\n' +
    'Lịch chỉ tạo dự thảo và dừng ở trạng thái CHO_DUYET. Việc gửi vẫn do bạn bấm ở mục 5.\n\n' +
    'Lưu ý: nếu khóa KY_BAO_CAO đang đặt một ngày cố định, lịch sẽ bỏ qua lần chạy đó ' +
    'để không gửi lại mãi một tuần cũ. Đổi về TUAN_HIEN_TAI khi muốn lịch hoạt động.');
}

/**
 * Hàm cho trình kích hoạt gọi. Không được mở hộp thoại vì lúc chạy
 * không có ai ngồi trước màn hình. Kết quả ghi vào NHAT_KY_HE_THONG.
 */
function chayTheoLich() {
  // Chốt chặn: KY_BAO_CAO đặt ngày cố định là chế độ chạy lại tuần cũ bằng tay.
  // Nếu để nguyên, lịch sẽ tạo đi tạo lại đúng một tuần đó mỗi thứ Sáu.
  const gtKy = giaTriKyBaoCao_();
  if (ngayTuChuoiISO_(gtKy)) {
    ghiNhatKy_('Chạy theo lịch', gtKy, 'BO_QUA',
      'Khóa KY_BAO_CAO đang đặt ngày cố định ' + gtKy + ' nên bỏ qua lần chạy tự động. ' +
      'Đổi về TUAN_HIEN_TAI ở trang CAU_HINH để lịch chạy lại.');
    return;
  }

  const ky = kyBaoCao_();
  try {
    const kiem = kiemTraDuLieu_(ky);
    if (!kiem.dat) {
      ghiNhatKy_('Chạy theo lịch', ky.ma, 'CAN_SUA_DU_LIEU', kiem.tomTat);
      baoLoiChoNguoiPhuTrach_(ky, kiem.tomTat);
      return;
    }
    const tinh = tinhChiSo_(ky);
    if (!tinh.ok) {
      ghiNhatKy_('Chạy theo lịch', ky.ma, 'DUNG', tinh.thongBao);
      baoLoiChoNguoiPhuTrach_(ky, tinh.thongBao);
      return;
    }
    const nhanXet = taoNhanXet_(ky);
    ghiNhatKy_('Chạy theo lịch', ky.ma, nhanXet.ok ? 'OK' : 'LOI', nhanXet.thongBao, nhanXet.maBaoCao);
    if (!nhanXet.ok) baoLoiChoNguoiPhuTrach_(ky, nhanXet.thongBao);
  } catch (e) {
    ghiNhatKy_('Chạy theo lịch', ky.ma, 'LOI', e.message);
    baoLoiChoNguoiPhuTrach_(ky, e.message);
  }
}

function baoLoiChoNguoiPhuTrach_(ky, noiDung) {
  const nhan = String(cauHinh_('EMAIL_NGUOI_NHAN', '')).split(',')[0].trim();
  if (!hopLeEmail_(nhan)) return;
  try {
    MailApp.sendEmail(nhan, 'Báo cáo tuần ' + ky.ma + ' chưa tạo được',
      'Hệ thống chạy theo lịch nhưng chưa tạo được báo cáo.\n\n' + noiDung +
      '\n\nBáo cáo chưa được gửi cho ai. Xem chi tiết ở trang NHAT_KY_HE_THONG.');
  } catch (e) {
    ghiNhatKy_('Báo lỗi cho người phụ trách', ky.ma, 'LOI', e.message);
  }
}