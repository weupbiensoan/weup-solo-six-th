/**
 * ============================================================================
 * HỆ THỐNG SẢN PHẨM TRI THỨC — TỆP CHÍNH
 * Gắn với bảng tính đang mở. Không tạo bảng tính mới.
 * ============================================================================
 */

/* ------------------------------ HẰNG SỐ CHUNG ---------------------------- */

const TEN_MENU = 'San pham tri thuc';
const URL_OPENAI = 'https://api.openai.com/v1/chat/completions';
const TEN_THUOC_TINH_KHOA = 'OPENAI_API_KEY';
const TRAN_EMAIL_MOI_LAN = 20; // trần cứng, cấu hình chỉ được thấp hơn

const T = {
  CAU_HINH: 'CAU_HINH',
  NGHIEN_CUU: 'NGHIEN_CUU',
  BAN_DO: 'BAN_DO_TRI_THUC',
  MODULE: 'CAU_TRUC_SP',
  TAI_LIEU: 'TRANG_THAI_TAI_LIEU',
  CANH: 'KE_HOACH_CANH',
  DON: 'DON_HANG',
  PHAN_HOI: 'PHAN_HOI',
  NGUOI_DUNG_THU: 'NGUOI_DUNG_THU',
  THU: 'THU_HO_TRO',
  KIEM_THU: 'KIEM_THU_AI',
  PHAT_HANH: 'PHAT_HANH',
  NHAT_KY: 'NHAT_KY',
  RAW_PV: 'RAW_PHONG_VAN',
  RAW_PH: 'RAW_PHAN_HOI',
  RAW_NDT: 'RAW_NGUOI_DUNG_THU'
};

const DS = {
  TRANG_THAI_DON: ['MOI', 'DA_THANH_TOAN', 'DA_CAP_QUYEN', 'DANG_HOC', 'HOAN_THANH', 'NGUNG'],
  TRANG_THAI_TAI_LIEU: ['BAN_AI', 'CHO_DUYET_CHUYEN_MON', 'CHO_BIEN_TAP', 'DA_DUYET_XUAT_BAN'],
  TRANG_THAI_NGUON: ['CAN_BO_SUNG', 'DA_DUYET'],
  NHOM_THU: ['TRONG_PHAM_VI', 'NGOAI_PHAM_VI', 'KHIEU_NAI'],
  NHOM_PHAN_HOI: ['DA_CO_CAU_TRA_LOI_NHUNG_KHO_TIM', 'HUONG_DAN_KHO_HIEU', 'VUOT_PHAM_VI', 'DE_XUAT_PHIEN_BAN_SAU'],
  LOAI_CANH: ['MAN_HINH_THAT', 'NGUOI_HUONG_DAN', 'CANH_VEO', 'CANH_SEEDANCE'],
  CO_KHONG: ['CO', 'KHONG'],
  DUNG_SAI: ['DUNG', 'SAI']
};

/** Khung cột của từng trang tính. */
const KHUNG = {
  CAU_HINH: ['KHOA', 'GIA_TRI', 'MO_TA'],
  NGHIEN_CUU: ['NGUON_DU_LIEU', 'NGUYEN_VAN_KH', 'VAN_DE', 'CACH_DANG_XU_LY', 'CHI_PHI_HAU_QUA',
    'DA_TUNG_TRA_TIEN', 'NHOM_AI', 'DUYET_NGUOI', 'EMAIL_LIEN_HE', 'NGAY_NHAN', 'JSON_THO'],
  BAN_DO_TRI_THUC: ['NHOM_NHU_CAU', 'MA_MODULE', 'MODULE', 'CHU_DE', 'CAU_HOI_COT_LOI', 'TRI_THUC_CAN_CO',
    'NGUON_DAN', 'TRANG_THAI_NGUON', 'NGUOI_DUYET_NGUON', 'NGAY_DUYET_NGUON', 'JSON_THO'],
  CAU_TRUC_SP: ['MA_MODULE', 'TEN', 'MUC_TIEU', 'DAU_RA_KHACH_NHAN', 'TAI_LIEU_CAN', 'THU_TU', 'JSON_THO'],
  TRANG_THAI_TAI_LIEU: ['MA_TAI_LIEU', 'TEN', 'LOAI', 'MA_MODULE', 'TRANG_THAI', 'NGUON', 'NGUOI_DUYET',
    'NGAY_DUYET', 'PHIEN_BAN', 'LINK', 'JSON_THO'],
  KE_HOACH_CANH: ['MA_CANH', 'MA_TAI_LIEU_NGUON', 'MOC_THOI_GIAN', 'LOI_DAN', 'LOAI_CANH', 'CONG_CU',
    'NOI_DUNG_PHAI_XUAT_HIEN', 'CAU_LENH_TAO_CANH', 'TAI_LIEU_NGUON', 'DIEM_NGUOI_KIEM_TRA',
    'GHI_CHU_CAPCUT', 'JSON_THO'],
  DON_HANG: ['MA_DON', 'HO_TEN', 'EMAIL', 'SAN_PHAM', 'GIA', 'NGAY_THANH_TOAN', 'TRANG_THAI',
    'NGAY_CAP_QUYEN', 'LINK_TAI_LIEU', 'MOC_1_HOAN_THANH', 'NGAY_NHAC_3', 'NGAY_NHAC_7',
    'NGAY_HOAN_THANH', 'GHI_CHU_HE_THONG', 'NGAY_GUI_CHAO_MUNG'],
  PHAN_HOI: ['MA_DON', 'EMAIL', 'NGAY_GUI', 'NGUYEN_VAN', 'NHOM_AI', 'TAI_LIEU_LIEN_QUAN',
    'CAN_NGUOI_XU_LY', 'QUYET_DINH', 'PHIEN_BAN_DU_KIEN', 'DONG_Y_TRICH_DAN', 'GHI_CHU_HE_THONG', 'JSON_THO'],
  NGUOI_DUNG_THU: ['NGAY_NHAN', 'BUOC_BAT_DAU', 'THOI_GIAN_HOAN_THANH', 'CAU_HOI_PHAT_SINH',
    'TAI_LIEU_DA_MO', 'VI_TRI_DUNG_LAI', 'HIEU_YEU_CAU_LA_GI', 'DAU_RA_TAO_DUOC', 'CAN_GIAI_THICH_THEM'],
  THU_HO_TRO: ['MA_THU', 'NGAY_NHAN', 'EMAIL_NGUOI_GUI', 'TIEU_DE', 'TRICH_NOI_DUNG', 'NHOM_AI',
    'LY_DO_PHAN_LOAI', 'HANH_DONG_DE_XUAT', 'MA_DON_LIEN_QUAN', 'DA_XU_LY', 'JSON_THO'],
  KIEM_THU_AI: ['NGAY', 'CAU_HOI', 'CAU_TRA_LOI', 'TAI_LIEU_DAN', 'DUNG_SAI'],
  PHAT_HANH: ['SO_PHIEN_BAN', 'NGAY_PHAT_HANH', 'NOI_DUNG_THAY_DOI', 'NGUON_DA_SU_DUNG', 'TAI_LIEU_VIDEO_DA_CAP_NHAT'],
  NHAT_KY: ['THOI_GIAN', 'BUOC', 'KET_QUA', 'CHI_TIET']
};

/** Cột không hàm nào được ghi vào — chỉ con người điền tay. */
const COT_CAM_GHI = {
  PHAN_HOI: ['QUYET_DINH', 'PHIEN_BAN_DU_KIEN'],
  NGHIEN_CUU: ['DUYET_NGUOI']
};

/* --------------------------------- MENU ---------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu(TEN_MENU)
    .addItem('1. Tạo các biểu mẫu thu dữ liệu', 'm01_TaoBieuMau')
    .addItem('2. Phân nhóm nhu cầu từ dữ liệu thô', 'm02_PhanNhomNhuCau')
    .addItem('3. Lập bản đồ tri thức', 'm03_LapBanDoTriThuc')
    .addItem('4. Đề xuất cấu trúc sản phẩm', 'm04_DeXuatCauTrucSanPham')
    .addItem('5. Tạo bản đầu tài liệu cho một module', 'm05_TaoBanDauTaiLieu')
    .addItem('6. Tạo kế hoạch cảnh cho một video', 'm06_TaoKeHoachCanh')
    .addItem('7. Ghi đơn', 'm07_GhiDon')
    .addItem('8. Cấp quyền tài liệu', 'm08_CapQuyenTaiLieu')
    .addItem('9. Gửi email chào mừng', 'm09_GuiEmailChaoMung')
    .addItem('10. Nhắc mốc ngày 3', 'm10_NhacMoc3')
    .addItem('11. Nhắc mốc ngày 7', 'm11_NhacMoc7')
    .addItem('12. Đọc và phân loại thư hỗ trợ', 'm12_DocVaPhanLoaiThuHoTro')
    .addItem('13. Ghi nhận hoàn thành chương trình', 'm13_GhiNhanHoanThanh')
    .addItem('14. Đọc phản hồi và chỉ ra phần cần sửa', 'm14_DocPhanHoi')
    .addSeparator()
    .addItem('Mở bảng điều khiển', 'moBangDieuKhien')
    .addItem('Tạo khung trang tính', 'taoKhungTrangTinh')
    .addItem('Tạo cây thư mục Drive', 'taoCayThuMucDrive')
    .addItem('Kiểm tra kết nối API', 'kiemTraKetNoiAPI')
    .addToUi();
}

/* ----------------------------- TIỆN ÍCH CHUNG ---------------------------- */

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function mui_() {
  return Utilities.formatDate(new Date(), ss_().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function homNay_() {
  const tz = ss_().getSpreadsheetTimeZone();
  return new Date(Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd') + ' 00:00:00');
}

function congNgay_(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function ngayText_(d) {
  if (!d) return '';
  if (Object.prototype.toString.call(d) !== '[object Date]') return String(d);
  return Utilities.formatDate(d, ss_().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
}

/** Đưa giá trị ô (Date hoặc chuỗi) về nửa đêm giờ địa phương, tránh lệch một ngày. */
function ngayTuGiaTri_(v) {
  if (!v && v !== 0) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }
  const m = String(v).match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function trang_(ten, batBuoc) {
  const sh = ss_().getSheetByName(ten);
  if (!sh && batBuoc !== false) {
    throw new Error('Chưa có trang "' + ten + '". Chạy mục "Tạo khung trang tính" trước.');
  }
  return sh;
}

/** Đọc toàn bộ một trang: trả về {sh, h (bản đồ tên cột -> chỉ số), rows, tenTrang}. */
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

function oCua_(b, dong, cot) {
  if (b.h[cot] === undefined) return '';
  return b.rows[dong][b.h[cot]];
}

/** Ghi một ô theo tên cột, chặn các cột chỉ dành cho con người. */
function ghiO_(b, dongBang, cot, giaTri) {
  const cam = COT_CAM_GHI[b.tenTrang] || [];
  if (cam.indexOf(cot) >= 0) {
    throw new Error('Cột ' + cot + ' của trang ' + b.tenTrang + ' chỉ do con người điền. Mã không được ghi vào.');
  }
  if (b.h[cot] === undefined) {
    throw new Error('Trang ' + b.tenTrang + ' không có cột ' + cot + '.');
  }
  b.sh.getRange(dongBang + 2, b.h[cot] + 1).setValue(giaTri);
  b.rows[dongBang][b.h[cot]] = giaTri;
}

/** Thêm một dòng theo đối tượng {TEN_COT: giá trị}. */
function themDong_(tenTrang, obj) {
  const sh = trang_(tenTrang);
  const tieuDe = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const cam = COT_CAM_GHI[tenTrang] || [];
  cam.forEach(function (c) {
    if (obj[c] !== undefined && obj[c] !== '') {
      throw new Error('Cột ' + c + ' của ' + tenTrang + ' chỉ do con người điền.');
    }
  });
  const dong = tieuDe.map(function (t) {
    const k = String(t).trim();
    return obj[k] === undefined ? '' : obj[k];
  });
  sh.appendRow(dong);
  return sh.getLastRow();
}

function ghiNhatKy_(buoc, ketQua, chiTiet) {
  const sh = trang_(T.NHAT_KY, false);
  if (!sh) return;
  sh.appendRow([mui_(), buoc, ketQua, String(chiTiet).slice(0, 5000)]);
}

/** Đưa giá trị AI trả về thành chuỗi. AI đôi khi trả mảng thay vì chuỗi. */
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

function hopLeEmail_(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}

function maMoi_(tienTo, tenTrang, cotMa) {
  const b = docBang_(tenTrang);
  let max = 0;
  b.rows.forEach(function (r) {
    const m = String(r[b.h[cotMa]] || '').match(new RegExp('^' + tienTo + '-(\\d+)$'));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return tienTo + '-' + Utilities.formatString('%04d', max + 1);
}

function thongBao_(tieuDe, noiDung) {
  SpreadsheetApp.getUi().alert(tieuDe, noiDung, SpreadsheetApp.getUi().ButtonSet.OK);
}

function hoiChuoi_(tieuDe, cauHoi) {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt(tieuDe, cauHoi, ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return null;
  return r.getResponseText().trim();
}

/* ------------------------------- CẤU HÌNH -------------------------------- */

var _cacheCauHinh = null;

function napCauHinh_() {
  if (_cacheCauHinh) return _cacheCauHinh;
  const b = docBang_(T.CAU_HINH);
  const m = {};
  b.rows.forEach(function (r) {
    const k = String(r[b.h.KHOA] || '').trim();
    if (k) m[k] = r[b.h.GIA_TRI];
  });
  _cacheCauHinh = m;
  return m;
}

function cauHinh_(khoa, macDinh) {
  const m = napCauHinh_();
  const v = m[khoa];
  if (v === undefined || v === null || String(v).trim() === '') return macDinh;
  return v;
}

function datCauHinh_(khoa, giaTri, moTa) {
  const b = docBang_(T.CAU_HINH);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.KHOA]).trim() === khoa) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(giaTri);
      if (moTa) b.sh.getRange(i + 2, b.h.MO_TA + 1).setValue(moTa);
      _cacheCauHinh = null;
      return;
    }
  }
  b.sh.appendRow([khoa, giaTri, moTa || '']);
  _cacheCauHinh = null;
}

/* ------------------------------ GỌI OPENAI ------------------------------- */

function layKhoaAPI_() {
  const k = PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA);
  if (!k) {
    throw new Error('Chưa có khóa API. Vào Project Settings > Script Properties, thêm thuộc tính ' +
      TEN_THUOC_TINH_KHOA + '.');
  }
  return k;
}

function moTaLoiApi_(ma, than) {
  if (ma === 401) return 'Lỗi 401: khóa API sai hoặc đã bị thu hồi. Kiểm tra thuộc tính ' + TEN_THUOC_TINH_KHOA + '.';
  if (ma === 429) return 'Lỗi 429: hết hạn mức hoặc gọi quá nhanh. Kiểm tra hạn mức tài khoản OpenAI, chờ rồi chạy lại.';
  if (ma === 404) return 'Lỗi 404: sai tên model. Kiểm tra khóa MODEL ở trang CAU_HINH.';
  if (ma === 400) return 'Lỗi 400: yêu cầu sai cấu trúc. Nội dung trả về: ' + String(than).slice(0, 500);
  return 'Lỗi HTTP ' + ma + ': ' + String(than).slice(0, 500);
}

/**
 * Gọi chat completions của OpenAI.
 * @param {string} heThong Câu lệnh hệ thống (lấy từ trang CAU_HINH).
 * @param {string} nguoiDung Dữ liệu gửi kèm.
 * @return {string} Nội dung văn bản model trả về.
 */
function goiOpenAI_(heThong, nguoiDung) {
  const khoa = layKhoaAPI_();
  const model = String(cauHinh_('MODEL', 'gpt-5.6')).trim();
  const maxTokens = Math.max(4000, Number(cauHinh_('MAX_TOKENS', 4000)) || 4000);
  let tenThamSo = String(cauHinh_('TEN_THAM_SO_TOKEN', 'max_tokens')).trim();

  function goi(thamSoToken) {
    const payload = {
      model: model,
      messages: [
        { role: 'system', content: String(heThong || '') },
        { role: 'user', content: String(nguoiDung || '') }
      ]
    };
    payload[thamSoToken] = maxTokens;
    return UrlFetchApp.fetch(URL_OPENAI, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + khoa },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  }

  let res = goi(tenThamSo);
  let ma = res.getResponseCode();
  let than = res.getContentText();

  // Một số model đời mới của OpenAI chỉ nhận max_completion_tokens.
  if (ma === 400 && tenThamSo === 'max_tokens' && /max_completion_tokens/.test(than)) {
    tenThamSo = 'max_completion_tokens';
    datCauHinh_('TEN_THAM_SO_TOKEN', tenThamSo, 'Tự chuyển vì model yêu cầu max_completion_tokens');
    res = goi(tenThamSo);
    ma = res.getResponseCode();
    than = res.getContentText();
  }

  if (ma !== 200) throw new Error(moTaLoiApi_(ma, than));

  const data = JSON.parse(than);
  if (!data.choices || !data.choices.length) throw new Error('API trả về không có choices: ' + than.slice(0, 500));
  return data.choices[0].message.content || '';
}

/** Tách JSON khỏi văn bản model trả về. Trả {ok, data, tho}. */
function docJson_(vanBan) {
  const tho = String(vanBan || '');
  let s = tho.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const dau = Math.min.apply(null, ['[', '{'].map(function (c) {
    const i = s.indexOf(c);
    return i < 0 ? 1e9 : i;
  }));
  const cuoi = Math.max(s.lastIndexOf(']'), s.lastIndexOf('}'));
  if (dau < 1e9 && cuoi > dau) s = s.slice(dau, cuoi + 1);
  try {
    return { ok: true, data: JSON.parse(s), tho: tho };
  } catch (err) {
    return { ok: false, data: null, tho: tho };
  }
}

/** Ghi nguyên văn phản hồi sai định dạng vào cột JSON_THO, không đụng cột khác. */
function ghiJsonTho_(b, dongBang, tho) {
  if (b.h.JSON_THO === undefined) return;
  b.sh.getRange(dongBang + 2, b.h.JSON_THO + 1).setValue(String(tho).slice(0, 45000));
}

/* --------------------- KIỂM TRA KẾT NỐI API (không số) -------------------- */

function kiemTraKetNoiAPI() {
  const ui = SpreadsheetApp.getUi();
  let khoa;
  try {
    khoa = layKhoaAPI_();
  } catch (e) {
    ui.alert('Kiểm tra kết nối API', e.message, ui.ButtonSet.OK);
    return;
  }
  const model = String(cauHinh_('MODEL', 'gpt-5.6')).trim();
  let tenThamSo = String(cauHinh_('TEN_THAM_SO_TOKEN', 'max_tokens')).trim();

  function thu(thamSo) {
    const payload = { model: model, messages: [{ role: 'user', content: 'ping' }] };
    payload[thamSo] = 4000;
    return UrlFetchApp.fetch(URL_OPENAI, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + khoa },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  }

  let res = thu(tenThamSo);
  let ma = res.getResponseCode();
  let than = res.getContentText();
  let daChuyen = false;

  // Model dòng mới chỉ nhận max_completion_tokens: tự chuyển rồi thử lại một lần.
  if (ma === 400 && tenThamSo === 'max_tokens' && /max_completion_tokens/.test(than)) {
    tenThamSo = 'max_completion_tokens';
    datCauHinh_('TEN_THAM_SO_TOKEN', tenThamSo, 'Tự chuyển vì model yêu cầu max_completion_tokens');
    daChuyen = true;
    res = thu(tenThamSo);
    ma = res.getResponseCode();
    than = res.getContentText();
  }
  // Trường hợp ngược lại: model cũ không hiểu max_completion_tokens.
  if (ma === 400 && tenThamSo === 'max_completion_tokens' && /max_tokens/.test(than) &&
    /unsupported|unrecognized|invalid/i.test(than)) {
    tenThamSo = 'max_tokens';
    datCauHinh_('TEN_THAM_SO_TOKEN', tenThamSo, 'Tự chuyển vì model chỉ nhận max_tokens');
    daChuyen = true;
    res = thu(tenThamSo);
    ma = res.getResponseCode();
    than = res.getContentText();
  }

  let ketLuan;
  if (ma === 200) {
    ketLuan = 'Kết nối tốt.\nModel: ' + model + '\nTham số token: ' + tenThamSo +
      (daChuyen ? '\n\nĐã tự đổi khóa TEN_THAM_SO_TOKEN ở trang CAU_HINH sang "' + tenThamSo +
        '" cho khớp với model. Các bước dùng AI sẽ dùng luôn giá trị này.' : '');
  } else if (ma === 401) {
    ketLuan = 'SAI KHÓA (401)\nKhóa trong thuộc tính ' + TEN_THUOC_TINH_KHOA + ' không hợp lệ hoặc đã bị thu hồi.\nTạo khóa mới rồi dán lại vào Script Properties.';
  } else if (ma === 429) {
    ketLuan = 'HẾT HẠN MỨC (429)\nTài khoản hết hạn mức hoặc gọi quá nhanh.\nKiểm tra mục Billing/Usage của OpenAI rồi chạy lại.';
  } else if (ma === 404) {
    ketLuan = 'SAI TÊN MODEL (404)\nModel "' + model + '" không tồn tại hoặc tài khoản chưa được cấp quyền dùng.\nSửa khóa MODEL ở trang CAU_HINH.';
  } else {
    ketLuan = 'Lỗi khác (' + ma + ')\n' + than.slice(0, 800);
  }
  ghiNhatKy_('Kiểm tra kết nối API', ma === 200 ? 'OK' : 'LOI', ketLuan);
  ui.alert('Kiểm tra kết nối API', ketLuan, ui.ButtonSet.OK);
}

/* ---------------- TẠO KHUNG TRANG TÍNH (chạy độc lập, không số) ---------- */

/**
 * MỘT NÚT LÀM TẤT CẢ: trang tính, danh sách giá trị, cấu hình,
 * sáu thư mục Drive, ba biểu mẫu, trình kích hoạt. Chạy lại nhiều lần đều an toàn.
 */
function caiDatToanBoHeThong() {
  const bao = [];
  bao.push('TRANG TÍNH\n' + taoKhung_());
  bao.push('KHO TRI THỨC TRÊN DRIVE\n' + taoThuMucNeuThieu_());
  bao.push('BIỂU MẪU THU DỮ LIỆU\n' + taoBieuMauNeuThieu_());
  bao.push('CÒN THIẾU\n' + kiemTraConThieu_());

  const noiDung = bao.join('\n\n');
  ghiNhatKy_('Cài đặt toàn bộ hệ thống', 'OK', noiDung);
  try { thongBao_('Cài đặt toàn bộ hệ thống', noiDung); } catch (e) { }
  return noiDung;
}

/** Mục menu: chỉ dựng trang tính, danh sách xổ và cấu hình. Không đụng Drive. */
function taoKhungTrangTinh() {
  const kq = taoKhung_();
  try {
    thongBao_('Tạo khung trang tính', kq +
      '\n\nThư mục Drive nằm ở mục riêng: Tạo cây thư mục Drive.');
  } catch (e) { }
  ghiNhatKy_('Tạo khung trang tính', 'OK', kq);
  return kq;
}

function taoKhung_() {
  const bang = ss_();
  doiTenTrangCu_();
  Object.keys(KHUNG).forEach(function (ten) {
    let sh = bang.getSheetByName(ten);
    if (!sh) sh = bang.insertSheet(ten);
    const cot = KHUNG[ten];
    const hienTai = sh.getLastColumn() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String)
      : [];
    // Chỉ bổ sung cột còn thiếu, không xóa dữ liệu cũ.
    const thieu = cot.filter(function (c) { return hienTai.indexOf(c) < 0; });
    if (hienTai.filter(String).length === 0) {
      sh.getRange(1, 1, 1, cot.length).setValues([cot]);
    } else if (thieu.length) {
      sh.getRange(1, hienTai.length + 1, 1, thieu.length).setValues([thieu]);
    }
    sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), cot.length))
      .setFontWeight('bold').setBackground('#1B2430').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  });

  datRangBuocGiaTri_();
  napCauHinhMacDinh_();
  return 'Đã kiểm tra và bổ sung ' + Object.keys(KHUNG).length + ' trang tính, danh sách giá trị cố định và các khóa cấu hình mặc định.';
}

/** Đổi tên trang cũ sang tên dùng trong chương 5. Chỉ đổi khi tên mới chưa tồn tại. */
function doiTenTrangCu_() {
  const doi = [['TAI_LIEU', 'TRANG_THAI_TAI_LIEU'], ['MODULE', 'CAU_TRUC_SP']];
  const bang = ss_();
  doi.forEach(function (x) {
    const cu = bang.getSheetByName(x[0]);
    const moi = bang.getSheetByName(x[1]);
    if (cu && !moi) cu.setName(x[1]);
  });
}

/** Điểm danh những thứ còn thiếu để chạy được toàn hệ thống. */
function kiemTraConThieu_() {
  const thieu = [];
  if (!PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA)) {
    thieu.push('Khóa ' + TEN_THUOC_TINH_KHOA + ': lưu ở khối Cài đặt trong bảng điều khiển, hoặc Project Settings.');
  }
  ['MODEL', 'ID_THU_MUC_TAI_LIEU', 'ID_THU_MUC_SAN_PHAM',
    'LINK_FORM_PHONG_VAN', 'LINK_FORM_PHAN_HOI', 'LINK_FORM_NGUOI_DUNG_THU'
  ].forEach(function (k) {
    if (String(cauHinh_(k, '')).trim() === '') thieu.push('Khóa ' + k + ' ở trang CAU_HINH còn trống.');
  });
  try {
    const co = ScriptApp.getProjectTriggers().some(function (t) {
      return t.getHandlerFunction() === 'xuLyBieuMauGui';
    });
    if (!co) thieu.push('Trình kích hoạt xuLyBieuMauGui chưa được tạo.');
  } catch (e) { }

  if (!thieu.length) {
    return 'Không thiếu gì. Việc tiếp theo là gửi đường dẫn biểu mẫu phỏng vấn cho khách và thu tối thiểu 30 dòng nhu cầu.';
  }
  return thieu.join('\n');
}

/** Danh sách sáu thư mục của kho tri thức, kèm khóa cấu hình và mô tả. */
function danhSachThuMuc_() {
  return [
    ['00_KINH_NGHIEM_NOI_BO', 'ID_00_KINH_NGHIEM_NOI_BO', 'Tài liệu, biểu mẫu, tình huống do bạn tự tạo trong nghề.'],
    ['01_DU_LIEU_KHACH_HANG', 'ID_01_DU_LIEU_KHACH_HANG', 'Câu hỏi và phản hồi của khách, đã xóa thông tin nhận diện.'],
    ['02_NGUON_CHINH_THUC', 'ID_02_NGUON_CHINH_THUC', 'Tài liệu bên ngoài, đặt tên kèm tác giả và năm.'],
    ['03_AI_DE_XUAT', 'ID_THU_MUC_TAI_LIEU', 'Bước 5 đặt bản đầu do AI viết vào đây. Chưa phải phương pháp chính thức.'],
    ['04_BAN_CHO_DUYET', 'ID_04_BAN_CHO_DUYET', 'Bản đang được kiểm tra chuyên môn.'],
    ['05_BAN_XUAT_BAN', 'ID_THU_MUC_SAN_PHAM', 'Bản đã duyệt. Bước 8 cấp quyền xem thư mục này cho người mua.']
  ];
}

function urlThuMuc_(id) {
  return 'https://drive.google.com/drive/folders/' + id;
}

/**
 * Mục menu: tạo cây thư mục Drive rồi hiện danh sách đường dẫn bấm được.
 * Chạy lại nhiều lần không tạo trùng.
 */
function taoCayThuMucDrive() {
  const ketQua = taoThuMucNeuThieu_();
  const idGoc = String(cauHinh_('ID_THU_MUC_GOC', '')).trim();

  let html = '<style>' +
    'body{font-family:"Be Vietnam Pro",Arial,sans-serif;font-size:13px;color:#2A2422;margin:0;padding:18px 20px;background:#F6F3F1}' +
    'h2{font-size:16px;margin:0 0 4px;color:#8E1116}' +
    '.goc{font-size:12px;color:#7A716C;margin-bottom:14px}' +
    '.tm{background:#fff;border:1px solid #EAE4E0;border-left:3px solid #8E1116;border-radius:7px;padding:10px 13px;margin-bottom:9px}' +
    '.tm a{font-family:monospace;font-size:12.5px;color:#8E1116;font-weight:600;text-decoration:none}' +
    '.tm a:hover{text-decoration:underline}' +
    '.tm div{font-size:12px;color:#7A716C;margin-top:3px}' +
    '.chan{margin-top:14px;font-size:12px;color:#7A716C;border-top:1px solid #EAE4E0;padding-top:10px}' +
    '</style>';

  html += '<h2>Kho tri thức trên Drive</h2>';
  if (idGoc) {
    html += '<div class="goc">Thư mục gốc: <a href="' + urlThuMuc_(idGoc) +
      '" target="_blank">' + ss_().getName() + '</a></div>';
  }

  danhSachThuMuc_().forEach(function (x) {
    const id = String(cauHinh_(x[1], '')).trim();
    html += '<div class="tm">' +
      (id ? '<a href="' + urlThuMuc_(id) + '" target="_blank">' + x[0] + '</a>' : x[0] + ' (chưa tạo được)') +
      '<div>' + x[2] + '</div></div>';
  });

  html += '<div class="chan">ID của cả sáu thư mục đã ghi vào trang CAU_HINH. ' +
    'Chạy lại mục này bao nhiêu lần cũng được, thư mục đã có thì dùng lại theo tên.</div>';

  ghiNhatKy_('Tạo cây thư mục Drive', 'OK', ketQua);
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(560).setHeight(480),
    'Cây thư mục Drive'
  );
}

/**
 * Dựng cây thư mục Drive đúng sáu thư mục của kho tri thức.
 * Chạy lại nhiều lần không sinh thư mục thừa: thư mục nào đã có thì dùng lại theo tên.
 */
function taoThuMucNeuThieu_() {
  const SAU_THU_MUC = danhSachThuMuc_();

  const ket = [];
  try {
    let goc = null;
    const idGoc = String(cauHinh_('ID_THU_MUC_GOC', '')).trim();
    if (idGoc) {
      try { goc = DriveApp.getFolderById(idGoc); } catch (e) { goc = null; }
    }
    if (!goc) {
      goc = DriveApp.createFolder(ss_().getName());
      datCauHinh_('ID_THU_MUC_GOC', goc.getId(), 'Thư mục gốc của kho tri thức.');
      ket.push('Đã tạo thư mục gốc: ' + goc.getName());
    }

    let daTao = 0, daCo = 0;
    SAU_THU_MUC.forEach(function (x) {
      const ten = x[0], khoa = x[1], moTa = x[2];
      let thuMuc = null;
      const it = goc.getFoldersByName(ten);
      if (it.hasNext()) { thuMuc = it.next(); daCo++; }
      else { thuMuc = goc.createFolder(ten); daTao++; }
      datCauHinh_(khoa, thuMuc.getId(), moTa);
    });

    ket.push('Kho tri thức: tạo mới ' + daTao + ' thư mục, dùng lại ' + daCo + ' thư mục đã có.');
    ket.push('ID của cả sáu thư mục đã ghi vào CAU_HINH.');
  } catch (e) {
    return 'Chưa dựng được kho tri thức trên Drive: ' + e.message +
      '\nBạn tạo tay sáu thư mục rồi dán ID vào CAU_HINH cũng được.';
  }
  return ket.join('\n');
}

function datRangBuocGiaTri_() {
  function ap(tenTrang, cot, ds) {
    const sh = trang_(tenTrang, false);
    if (!sh) return;
    const h = docBang_(tenTrang).h;
    if (h[cot] === undefined) return;
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(ds, true)
      .setAllowInvalid(false).build();
    sh.getRange(2, h[cot] + 1, Math.max(sh.getMaxRows() - 1, 1)).setDataValidation(rule);
  }
  ap(T.DON, 'TRANG_THAI', DS.TRANG_THAI_DON);
  ap(T.DON, 'MOC_1_HOAN_THANH', DS.CO_KHONG);
  ap(T.TAI_LIEU, 'TRANG_THAI', DS.TRANG_THAI_TAI_LIEU);
  ap(T.BAN_DO, 'TRANG_THAI_NGUON', DS.TRANG_THAI_NGUON);
  ap(T.THU, 'NHOM_AI', DS.NHOM_THU);
  ap(T.THU, 'DA_XU_LY', DS.CO_KHONG);
  ap(T.PHAN_HOI, 'NHOM_AI', DS.NHOM_PHAN_HOI);
  ap(T.PHAN_HOI, 'CAN_NGUOI_XU_LY', DS.CO_KHONG);
  ap(T.CANH, 'LOAI_CANH', DS.LOAI_CANH);
  ap(T.KIEM_THU, 'DUNG_SAI', DS.DUNG_SAI);
}

/** Ghi giá trị mặc định cho CAU_HINH, không đè lên giá trị bạn đã sửa. */
function napCauHinhMacDinh_() {
  const macDinh = [
    ['MODEL', 'gpt-5.6', 'Tên model OpenAI. Đổi ở đây, không cần mở mã.'],
    ['MAX_TOKENS', 4000, 'Số token tối đa mỗi lần gọi. Tối thiểu 4000.'],
    ['TEN_THAM_SO_TOKEN', 'max_tokens', 'max_tokens hoặc max_completion_tokens tùy model.'],
    ['SO_EMAIL_MOI_LAN_CHAY', 20, 'Trần cứng của hệ thống là 20.'],
    ['PHUT_HO_TRO_MOI_THU', 10, 'Số phút bạn ước tính bỏ ra cho một thư hỗ trợ. Dùng để tính chỉ số ở bảng điều khiển.'],
    ['ID_THU_MUC_TAI_LIEU', '', 'ID thư mục Drive chứa bản đầu tài liệu do bước 5 tạo ra.'],
    ['ID_THU_MUC_SAN_PHAM', '', 'ID thư mục Drive chứa bộ tài liệu bán cho khách. Bước 8 cấp quyền xem trên thư mục này.'],
    ['NHAN_GMAIL_HO_TRO', 'ho-tro', 'Nhãn Gmail chứa thư hỗ trợ chưa xử lý.'],
    ['NHAN_GMAIL_DA_DOC', 'ho-tro-da-doc', 'Nhãn Gmail gắn cho thư đã đưa vào bảng.'],
    ['SO_TAI_LIEU_MOI_LAN', 3, 'Số tài liệu tối đa bước 5 tạo trong một lần chạy.'],
    ['GIOI_HAN_KY_TU_TAI_LIEU', 12000, 'Số ký tự tài liệu gửi cho AI ở bước 6.'],
    ['GIA_MAC_DINH', 3000000, 'Giá một bộ, dùng khi ghi đơn.'],
    ['TEN_SAN_PHAM', 'Bộ công cụ tri thức vận hành doanh nghiệp nhỏ', 'Tên sản phẩm mặc định khi ghi đơn.'],
    ['LINK_FORM_PHONG_VAN', '', 'Bước 1 điền.'],
    ['LINK_FORM_PHAN_HOI', '', 'Bước 1 điền.'],
    ['LINK_FORM_NGUOI_DUNG_THU', '', 'Bước 1 điền.'],

    ['PROMPT_02_PHAN_NHOM',
      'Bạn là chuyên gia phân tích nhu cầu khách hàng cho sản phẩm tri thức về vận hành doanh nghiệp dịch vụ nhỏ.\n' +
      'Đầu vào là mảng JSON các dòng: {stt, nguyen_van, cach_dang_xu_ly, chi_phi_hau_qua, da_tung_tra_tien}.\n' +
      'Với mỗi dòng hãy xác định:\n' +
      '- van_de: một câu trung tính mô tả vấn đề cốt lõi, không suy diễn ngoài dữ liệu.\n' +
      '- nhom_ai: tên nhóm nhu cầu viết hoa không dấu nối bằng gạch dưới, toàn bộ dữ liệu dùng tối đa 8 nhóm.\n' +
      'Không sửa, không diễn giải lại nguyên văn của khách.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng [{"stt":1,"van_de":"...","nhom_ai":"..."}]. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 2.'],

    ['PROMPT_03_BAN_DO',
      'Bạn là kiến trúc sư nội dung. Đầu vào là mảng JSON các nhu cầu đã được con người duyệt: {nhom, van_de, nguyen_van, cach_dang_xu_ly, chi_phi_hau_qua}.\n' +
      'Hãy lập bản đồ tri thức. Với mỗi chủ đề cần dạy, trả về một phần tử:\n' +
      '{"nhom_nhu_cau":"...","module":"tên module ngắn","chu_de":"...","cau_hoi_cot_loi":"câu hỏi mà người học cần trả lời được","tri_thuc_can_co":"những gì phải có để trả lời được câu hỏi đó"}\n' +
      'Không tự bịa nguồn dẫn. Không viết trường nào khác.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 3.'],

    ['PROMPT_04_CAU_TRUC',
      'Bạn là người thiết kế cấu trúc sản phẩm tri thức. Đầu vào là mảng JSON các dòng bản đồ tri thức nhóm theo module.\n' +
      'Với mỗi module trả về:\n' +
      '{"module":"tên module đúng như đầu vào","muc_tieu":"một câu","dau_ra_khach_nhan":"thứ khách cầm được sau module","tai_lieu_can":"liệt kê tên tài liệu, cách nhau bằng dấu chấm phẩy","thu_tu":1}\n' +
      'Thứ tự đi từ việc dễ tạo ra kết quả sớm nhất đến việc phức tạp hơn.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 4.'],

    ['PROMPT_05_TAI_LIEU',
      'Bạn là người biên soạn tài liệu hướng dẫn cho chủ doanh nghiệp dịch vụ nhỏ, không rành kỹ thuật.\n' +
      'Đầu vào JSON gồm: module (mã, tên, mục tiêu, đầu ra), tai_lieu (tên, loại) và cac_dong_ban_do đã có nguồn dẫn được duyệt.\n' +
      'Viết bản đầu của đúng tài liệu được yêu cầu, bằng tiếng Việt, giọng chuyên nghiệp, không phóng đại, không văn nói.\n' +
      'Chỉ dùng tri thức nằm trong cac_dong_ban_do và nguồn dẫn kèm theo. Chỗ nào thiếu dữ liệu thì ghi rõ [CAN_BO_SUNG: ...] thay vì tự bịa.\n' +
      'Trả về JSON: {"tieu_de":"...","noi_dung":"nội dung markdown đầy đủ","nguon":"liệt kê nguồn đã dùng"}\n' +
      'Chỉ trả về JSON hợp lệ. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 5.'],

    ['PROMPT_06_CANH',
      'Bạn là người lập kế hoạch cảnh cho video hướng dẫn dựng bằng CapCut.\n' +
      'Đầu vào JSON: {ma_tai_lieu, ten_tai_lieu, noi_dung}.\n' +
      'Chia thành các cảnh theo thứ tự. Mỗi cảnh trả về:\n' +
      '{"moc_thoi_gian":"00:00-00:30","loi_dan":"lời đọc","loai_canh":"MAN_HINH_THAT|NGUOI_HUONG_DAN|CANH_VEO|CANH_SEEDANCE","cong_cu":"...","noi_dung_phai_xuat_hien":"...","cau_lenh_tao_canh":"câu lệnh dán thẳng sang công cụ dựng","diem_nguoi_phai_kiem_tra":"...","ghi_chu_capcut":"..."}\n' +
      'Quy tắc bắt buộc: mọi thao tác người học phải làm theo đều để MAN_HINH_THAT. Hai loại CANH_VEO và CANH_SEEDANCE chỉ dùng cho tình huống minh họa, tuyệt đối không mô tả khách hàng, kết quả hay cơ sở vật chất như thể có thật.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 6.'],

    ['PROMPT_12_THU',
      'Bạn phân loại thư hỗ trợ của khách đã mua bộ công cụ tri thức.\n' +
      'Đầu vào là mảng JSON {stt, tieu_de, trich}.\n' +
      'Với mỗi thư trả về {"stt":1,"nhom":"TRONG_PHAM_VI|NGOAI_PHAM_VI|KHIEU_NAI","ly_do":"một câu","hanh_dong":"việc cụ thể nên làm tiếp"}.\n' +
      'TRONG_PHAM_VI: hỏi về nội dung đã có trong sản phẩm. NGOAI_PHAM_VI: hỏi việc sản phẩm không cam kết. KHIEU_NAI: phàn nàn về chất lượng, thanh toán hoặc quyền truy cập.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 12.'],

    ['PROMPT_14_PHAN_HOI',
      'Bạn đọc phản hồi của người đã hoàn thành chương trình để chỉ ra phần cần sửa trong sản phẩm.\n' +
      'Đầu vào JSON: {phan_hoi: [{stt, nguyen_van}], danh_sach_tai_lieu: [{ma, ten, module}]}.\n' +
      'Với mỗi phản hồi trả về {"stt":1,"nhom":"DA_CO_CAU_TRA_LOI_NHUNG_KHO_TIM|HUONG_DAN_KHO_HIEU|VUOT_PHAM_VI|DE_XUAT_PHIEN_BAN_SAU","tai_lieu_lien_quan":"mã tài liệu, cách nhau bằng dấu phẩy, để trống nếu không xác định được"}.\n' +
      'Chỉ chọn tài liệu có trong danh_sach_tai_lieu. Không đề xuất quyết định sửa, không đề xuất số phiên bản.\n' +
      'Chỉ trả về JSON hợp lệ dạng mảng. Không thêm chữ nào ngoài JSON.',
      'Câu lệnh của bước 14.'],

    ['EMAIL_CHAO_MUNG_TIEU_DE', 'Bộ công cụ của anh/chị đã sẵn sàng — {{MA_DON}}', 'Bước 9.'],
    ['EMAIL_CHAO_MUNG_NOI_DUNG',
      'Chào {{HO_TEN}},\n\nCảm ơn anh/chị đã đặt {{SAN_PHAM}}.\nToàn bộ tài liệu nằm ở đây: {{LINK}}\n\n' +
      'Gợi ý cách bắt đầu: mở module đầu tiên và làm đúng một việc trong ngày hôm nay. Ngày thứ 3 và ngày thứ 7 tôi sẽ gửi thư nhắc mốc.\n\n' +
      'Cần hỗ trợ, anh/chị trả lời thẳng thư này.\n\nTrân trọng.',
      'Bước 9. Thẻ thay được: {{HO_TEN}} {{SAN_PHAM}} {{LINK}} {{MA_DON}}'],
    ['EMAIL_NHAC_3_TIEU_DE', 'Mốc ngày 3: anh/chị đã làm xong phần đầu chưa?', 'Bước 10.'],
    ['EMAIL_NHAC_3_NOI_DUNG',
      'Chào {{HO_TEN}},\n\nHôm nay là mốc ngày 3 kể từ khi anh/chị nhận tài liệu: {{LINK}}\n\n' +
      'Mốc này chỉ cần một việc: hoàn thành module đầu tiên và tạo ra đầu ra của module đó.\n' +
      'Nếu đang mắc ở đâu, anh/chị trả lời thư này và nói rõ đang dừng ở bước nào.\n\nTrân trọng.',
      'Bước 10.'],
    ['EMAIL_NHAC_7_TIEU_DE', 'Mốc ngày 7: rà lại kết quả anh/chị đã tạo ra', 'Bước 11.'],
    ['EMAIL_NHAC_7_NOI_DUNG',
      'Chào {{HO_TEN}},\n\nĐây là mốc ngày 7. Tài liệu của anh/chị: {{LINK}}\n\n' +
      'Việc của mốc này là rà lại các đầu ra đã tạo và ghi lại chỗ còn vướng.\n' +
      'Khi hoàn thành, anh/chị gửi phản hồi giúp tôi qua biểu mẫu: {{LINK_FORM_PHAN_HOI}}\n\nTrân trọng.',
      'Bước 11.']
  ];

  const b = docBang_(T.CAU_HINH);
  const daCo = {};
  b.rows.forEach(function (r) { daCo[String(r[b.h.KHOA]).trim()] = true; });
  const themVao = macDinh.filter(function (d) { return !daCo[d[0]]; });
  if (themVao.length) {
    b.sh.getRange(b.sh.getLastRow() + 1, 1, themVao.length, 3).setValues(themVao);
  }
  b.sh.setColumnWidth(1, 240);
  b.sh.setColumnWidth(2, 620);
  b.sh.setColumnWidth(3, 320);
  _cacheCauHinh = null;
}

/* ======================= BƯỚC 1 — TẠO CÁC BIỂU MẪU ======================= */

function m01_TaoBieuMau() {
  taoKhungTrangTinh_ImNang_();
  const kq = taoBieuMauNeuThieu_();
  ghiNhatKy_('Bước 1', 'OK', kq);
  thongBao_('Bước 1 — Biểu mẫu thu dữ liệu', kq +
    '\n\nCâu trả lời rơi vào ba trang RAW_. Trình kích hoạt xuLyBieuMauGui chép sang NGHIEN_CUU, PHAN_HOI, NGUOI_DUNG_THU đúng cột, giữ nguyên văn.');
}

/** Tạo biểu mẫu nào chưa có. Biểu mẫu đã có link trong CAU_HINH thì giữ nguyên. */
function taoBieuMauNeuThieu_() {
  const ds = [
    ['LINK_FORM_PHONG_VAN', taoFormPhongVan_, 'Biểu mẫu phỏng vấn nhu cầu'],
    ['LINK_FORM_PHAN_HOI', taoFormPhanHoi_, 'Biểu mẫu phản hồi sau khi hoàn thành'],
    ['LINK_FORM_NGUOI_DUNG_THU', taoFormNguoiDungThu_, 'Biểu mẫu người dùng thử']
  ];
  const ket = [];
  ds.forEach(function (x) {
    const link = String(cauHinh_(x[0], '')).trim();
    if (link) { ket.push('Đã có ' + x[2] + ': ' + link); return; }
    ket.push(x[1]());
  });
  taoTriggerBieuMau_();
  return ket.join('\n');
}

function taoKhungTrangTinh_ImNang_() {
  if (!ss_().getSheetByName(T.CAU_HINH)) taoKhungTrangTinh();
}

function taoFormPhongVan_() {
  const f = FormApp.create('Phỏng vấn nhu cầu vận hành doanh nghiệp dịch vụ nhỏ');
  f.setDescription('Tôi đang xây bộ công cụ tri thức về vận hành. Câu trả lời của anh/chị được giữ nguyên văn, không chỉnh sửa.');
  f.addParagraphTextItem().setTitle('Việc gì trong khâu chăm sóc khách hàng đang chiếm nhiều thời gian nhất của anh/chị? Viết bằng đúng lời của anh chị.').setRequired(true);
  f.addParagraphTextItem().setTitle('Hiện anh/chị xử lý việc đó bằng cách nào?').setRequired(true);
  f.addParagraphTextItem().setTitle('Việc đó làm mất bao nhiêu thời gian, bao nhiêu tiền, hoặc gây ra sai sót gì?').setRequired(true);
  f.addParagraphTextItem().setTitle('Anh/chị đã từng trả tiền cho công cụ, khóa học hay dịch vụ nào để xử lý việc này chưa? Nếu có thì cụ thể là gì?').setRequired(true);
  f.addTextItem().setTitle('Email, nếu anh/chị đồng ý trao đổi thêm 15 phút').setRequired(false);
  return noiFormVaoBang_(f, T.RAW_PV, 'LINK_FORM_PHONG_VAN', 'Biểu mẫu phỏng vấn nhu cầu');
}

function taoFormPhanHoi_() {
  const f = FormApp.create('Phản hồi sau khi hoàn thành bộ công cụ tri thức');
  f.setDescription('Phản hồi của anh/chị được giữ nguyên văn và dùng để quyết định phần nào của sản phẩm cần sửa.');
  f.addTextItem().setTitle('Email anh/chị đã dùng để mua').setRequired(true);
  f.addTextItem().setTitle('Anh/chị đã hoàn thành đến ngày thứ mấy?').setRequired(true);
  f.addParagraphTextItem().setTitle('Kết quả cụ thể anh/chị đã tạo ra được là gì?').setRequired(true);
  f.addParagraphTextItem().setTitle('Phần nào khó nhất hoặc phải đọc lại nhiều lần?').setRequired(true);
  f.addParagraphTextItem().setTitle('Phần nào anh/chị mong có thêm?').setRequired(false);
  f.addMultipleChoiceItem().setTitle('Anh/chị có cho phép tôi trích dẫn phản hồi này kèm tên doanh nghiệp không?')
    .setChoiceValues(['Có', 'Không']).setRequired(true);
  return noiFormVaoBang_(f, T.RAW_PH, 'LINK_FORM_PHAN_HOI', 'Biểu mẫu phản hồi sau khi hoàn thành');
}

function taoFormNguoiDungThu_() {
  const f = FormApp.create('Ghi nhận người dùng thử trước khi mở bán');
  f.setDescription('Dành cho 3 đến 5 người thử. Ghi đúng những gì anh/chị gặp, kể cả chỗ bị mắc.');
  f.addTextItem().setTitle('Anh/chị bắt đầu từ bước nào?').setRequired(true);
  f.addTextItem().setTitle('Thời gian anh/chị hoàn thành là bao lâu?').setRequired(true);
  f.addParagraphTextItem().setTitle('Câu hỏi nào phát sinh trong lúc làm?').setRequired(true);
  f.addParagraphTextItem().setTitle('Anh/chị đã mở những tài liệu nào?').setRequired(true);
  f.addParagraphTextItem().setTitle('Vị trí nào khiến anh/chị dừng lại?').setRequired(true);
  f.addParagraphTextItem().setTitle('Anh/chị hiểu yêu cầu đó là phải làm gì?').setRequired(true);
  f.addParagraphTextItem().setTitle('Đầu ra anh/chị tạo được là gì?').setRequired(true);
  f.addParagraphTextItem().setTitle('Phần nào tôi phải giải thích thêm anh/chị mới làm được?').setRequired(false);
  return noiFormVaoBang_(f, T.RAW_NDT, 'LINK_FORM_NGUOI_DUNG_THU', 'Biểu mẫu người dùng thử');
}

/** Nối biểu mẫu vào bảng tính đang mở, đổi tên trang đích, ghi link vào CAU_HINH. */
function noiFormVaoBang_(f, tenTrangDich, khoaCauHinh, nhan) {
  const bang = ss_();
  f.setDestination(FormApp.DestinationType.SPREADSHEET, bang.getId());
  SpreadsheetApp.flush();
  Utilities.sleep(1500);

  const urlEdit = f.getEditUrl();
  const shs = SpreadsheetApp.openById(bang.getId()).getSheets();
  let dich = null;
  for (let i = shs.length - 1; i >= 0; i--) {
    const u = shs[i].getFormUrl();
    if (u && u.indexOf(f.getId()) >= 0) { dich = shs[i]; break; }
  }
  if (dich) {
    const cu = bang.getSheetByName(tenTrangDich);
    if (cu && cu.getSheetId() !== dich.getSheetId()) cu.setName(tenTrangDich + '_CU_' + Date.now());
    dich.setName(tenTrangDich);
  }
  datCauHinh_(khoaCauHinh, f.getPublishedUrl(), nhan + ' — sửa câu hỏi tại: ' + urlEdit);
  return nhan + ': ' + f.getPublishedUrl() + (dich ? '' : '\n(Chưa đổi được tên trang đích, hãy đổi tay thành ' + tenTrangDich + ')');
}

function taoTriggerBieuMau_() {
  const daCo = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'xuLyBieuMauGui';
  });
  if (daCo) return;
  ScriptApp.newTrigger('xuLyBieuMauGui').forSpreadsheet(ss_()).onFormSubmit().create();
}

/** Trình kích hoạt: chép câu trả lời sang đúng trang, đúng cột, giữ nguyên văn. */
function xuLyBieuMauGui(e) {
  try {
    const ten = e.range.getSheet().getName();
    const v = e.values || [];
    if (ten === T.RAW_PV) return chepPhongVan_(v);
    if (ten === T.RAW_PH) return chepPhanHoi_(v);
    if (ten === T.RAW_NDT) return chepNguoiDungThu_(v);
  } catch (err) {
    ghiNhatKy_('Trình kích hoạt biểu mẫu', 'LOI', err.message);
  }
}

function chepPhongVan_(v) {
  themDong_(T.NGHIEN_CUU, {
    NGUON_DU_LIEU: 'phỏng vấn',
    NGUYEN_VAN_KH: v[1] || '',
    CACH_DANG_XU_LY: v[2] || '',
    CHI_PHI_HAU_QUA: v[3] || '',
    DA_TUNG_TRA_TIEN: v[4] || '',
    EMAIL_LIEN_HE: v[5] || '',
    NGAY_NHAN: v[0] || mui_()
  });
  ghiNhatKy_('Biểu mẫu phỏng vấn', 'OK', 'Đã ghi 1 dòng vào NGHIEN_CUU.');
}

function chepPhanHoi_(v) {
  const email = String(v[1] || '').trim();
  const traLoiNgay = String(v[2] || '');
  const nguyenVan =
    'Đã hoàn thành đến ngày: ' + traLoiNgay + '\n' +
    'Kết quả tạo ra được: ' + (v[3] || '') + '\n' +
    'Phần khó nhất: ' + (v[4] || '') + '\n' +
    'Phần mong có thêm: ' + (v[5] || '');

  const bd = docBang_(T.DON);
  let maDon = '';
  let dongDon = -1;
  for (let i = bd.rows.length - 1; i >= 0; i--) {
    if (String(bd.rows[i][bd.h.EMAIL]).trim().toLowerCase() === email.toLowerCase() && email) {
      maDon = bd.rows[i][bd.h.MA_DON];
      dongDon = i;
      break;
    }
  }

  themDong_(T.PHAN_HOI, {
    MA_DON: maDon,
    EMAIL: email,
    NGAY_GUI: v[0] || mui_(),
    NGUYEN_VAN: nguyenVan,
    DONG_Y_TRICH_DAN: v[6] || '',
    GHI_CHU_HE_THONG: maDon ? '' : 'KHONG_TIM_THAY_DON cho email: ' + email
  });

  // Nếu đã qua ngày 1 thì cập nhật MOC_1_HOAN_THANH. Không đổi TRANG_THAI.
  const so = (traLoiNgay.match(/\d+/) || [])[0];
  if (dongDon >= 0 && so && Number(so) >= 1) {
    ghiO_(bd, dongDon, 'MOC_1_HOAN_THANH', 'CO');
  }
  ghiNhatKy_('Biểu mẫu phản hồi', 'OK', 'Email ' + email + ' | Đơn: ' + (maDon || 'không tìm thấy'));
}

function chepNguoiDungThu_(v) {
  themDong_(T.NGUOI_DUNG_THU, {
    NGAY_NHAN: v[0] || mui_(),
    BUOC_BAT_DAU: v[1] || '',
    THOI_GIAN_HOAN_THANH: v[2] || '',
    CAU_HOI_PHAT_SINH: v[3] || '',
    TAI_LIEU_DA_MO: v[4] || '',
    VI_TRI_DUNG_LAI: v[5] || '',
    HIEU_YEU_CAU_LA_GI: v[6] || '',
    DAU_RA_TAO_DUOC: v[7] || '',
    CAN_GIAI_THICH_THEM: v[8] || ''
  });
  ghiNhatKy_('Biểu mẫu người dùng thử', 'OK', 'Đã ghi 1 dòng.');
}

/* ==================== BƯỚC 2 — PHÂN NHÓM NHU CẦU ======================== */

function m02_PhanNhomNhuCau() {
  const b = docBang_(T.NGHIEN_CUU);
  const canXuLy = [];
  b.rows.forEach(function (r, i) {
    const nguyenVan = String(r[b.h.NGUYEN_VAN_KH] || '').trim();
    const nhom = String(r[b.h.NHOM_AI] || '').trim();
    if (nguyenVan && !nhom) {
      canXuLy.push({
        stt: i,
        nguyen_van: nguyenVan,
        cach_dang_xu_ly: String(r[b.h.CACH_DANG_XU_LY] || ''),
        chi_phi_hau_qua: String(r[b.h.CHI_PHI_HAU_QUA] || ''),
        da_tung_tra_tien: String(r[b.h.DA_TUNG_TRA_TIEN] || '')
      });
    }
  });
  if (!canXuLy.length) {
    thongBao_('Bước 2', 'Không có dòng nào cần phân nhóm. Trang NGHIEN_CUU chưa có dữ liệu mới hoặc đã phân nhóm hết.');
    return;
  }

  const traVe = goiOpenAI_(cauHinh_('PROMPT_02_PHAN_NHOM', ''), JSON.stringify(canXuLy));
  const kq = docJson_(traVe);
  if (!kq.ok || !Array.isArray(kq.data)) {
    canXuLy.forEach(function (x) { ghiJsonTho_(b, x.stt, kq.tho); });
    thongBao_('Bước 2 — Sai định dạng', 'AI trả về không phải JSON. Nguyên văn đã ghi vào cột JSON_THO của các dòng liên quan. Các cột khác giữ nguyên.');
    return;
  }

  let dem = 0;
  kq.data.forEach(function (x) {
    const i = Number(x.stt);
    if (isNaN(i) || i < 0 || i >= b.rows.length) return;
    ghiO_(b, i, 'VAN_DE', chuoi_(x.van_de));
    ghiO_(b, i, 'NHOM_AI', chuoi_(x.nhom_ai));
    dem++;
  });
  ghiNhatKy_('Bước 2', 'OK', 'Đã phân nhóm ' + dem + ' dòng.');
  thongBao_('Bước 2 — Xong', 'Đã điền VAN_DE và NHOM_AI cho ' + dem + ' dòng.\n\n' +
    'Việc tiếp theo là của bạn: điền cột DUYET_NGUOI. Bước 3 chỉ đọc những dòng đã có cột này.');
}

/* ==================== BƯỚC 3 — LẬP BẢN ĐỒ TRI THỨC ====================== */

function m03_LapBanDoTriThuc() {
  const b = docBang_(T.NGHIEN_CUU);
  const daDuyet = [];
  b.rows.forEach(function (r) {
    if (String(r[b.h.DUYET_NGUOI] || '').trim()) {
      daDuyet.push({
        nhom: String(r[b.h.DUYET_NGUOI]).trim(),
        van_de: String(r[b.h.VAN_DE] || ''),
        nguyen_van: String(r[b.h.NGUYEN_VAN_KH] || ''),
        cach_dang_xu_ly: String(r[b.h.CACH_DANG_XU_LY] || ''),
        chi_phi_hau_qua: String(r[b.h.CHI_PHI_HAU_QUA] || '')
      });
    }
  });
  if (!daDuyet.length) {
    thongBao_('Bước 3 — Chưa chạy được',
      'Không có dòng nhu cầu nào được duyệt.\n\nChốt duyệt: mọi dòng nhu cầu phải có cột DUYET_NGUOI trước khi lập bản đồ tri thức. Hãy mở trang NGHIEN_CUU và điền cột đó.');
    return;
  }

  const traVe = goiOpenAI_(cauHinh_('PROMPT_03_BAN_DO', ''), JSON.stringify(daDuyet));
  const kq = docJson_(traVe);
  const bd = docBang_(T.BAN_DO);
  if (!kq.ok || !Array.isArray(kq.data)) {
    const dong = themDong_(T.BAN_DO, { NHOM_NHU_CAU: '[SAI_DINH_DANG]', TRANG_THAI_NGUON: 'CAN_BO_SUNG' });
    bd.sh.getRange(dong, bd.h.JSON_THO + 1).setValue(String(kq.tho).slice(0, 45000));
    thongBao_('Bước 3 — Sai định dạng', 'AI trả về không phải JSON. Nguyên văn đã ghi vào cột JSON_THO của dòng mới. Các cột khác giữ nguyên.');
    return;
  }

  kq.data.forEach(function (x) {
    themDong_(T.BAN_DO, {
      NHOM_NHU_CAU: chuoi_(x.nhom_nhu_cau),
      MODULE: chuoi_(x.module),
      CHU_DE: chuoi_(x.chu_de),
      CAU_HOI_COT_LOI: chuoi_(x.cau_hoi_cot_loi),
      TRI_THUC_CAN_CO: chuoi_(x.tri_thuc_can_co),
      NGUON_DAN: '',
      TRANG_THAI_NGUON: 'CAN_BO_SUNG'
    });
  });
  ghiNhatKy_('Bước 3', 'OK', 'Đã thêm ' + kq.data.length + ' dòng bản đồ.');
  thongBao_('Bước 3 — Xong', 'Đã thêm ' + kq.data.length + ' dòng vào BAN_DO_TRI_THUC.\n\n' +
    'Việc tiếp theo là của bạn: điền NGUON_DAN, đổi TRANG_THAI_NGUON sang DA_DUYET, ghi NGUOI_DUYET_NGUON và NGAY_DUYET_NGUON. Bước 5 chỉ viết tài liệu cho module đã qua chốt này.');
}

/* ================= BƯỚC 4 — ĐỀ XUẤT CẤU TRÚC SẢN PHẨM =================== */

function m04_DeXuatCauTrucSanPham() {
  const bd = docBang_(T.BAN_DO);
  if (!bd.rows.length) {
    thongBao_('Bước 4 — Chưa chạy được', 'BAN_DO_TRI_THUC chưa có dữ liệu. Chạy bước 3 trước.');
    return;
  }
  const duLieu = bd.rows.map(function (r) {
    return {
      module: String(r[bd.h.MODULE] || ''),
      nhom_nhu_cau: String(r[bd.h.NHOM_NHU_CAU] || ''),
      chu_de: String(r[bd.h.CHU_DE] || ''),
      cau_hoi_cot_loi: String(r[bd.h.CAU_HOI_COT_LOI] || '')
    };
  }).filter(function (x) { return x.module; });

  const traVe = goiOpenAI_(cauHinh_('PROMPT_04_CAU_TRUC', ''), JSON.stringify(duLieu));
  const kq = docJson_(traVe);
  if (!kq.ok || !Array.isArray(kq.data)) {
    const dong = themDong_(T.MODULE, { MA_MODULE: '[SAI_DINH_DANG]' });
    const bm = docBang_(T.MODULE);
    bm.sh.getRange(dong, bm.h.JSON_THO + 1).setValue(String(kq.tho).slice(0, 45000));
    thongBao_('Bước 4 — Sai định dạng', 'AI trả về không phải JSON. Nguyên văn đã ghi vào cột JSON_THO.');
    return;
  }

  const bm = docBang_(T.MODULE);
  const daCo = {};
  bm.rows.forEach(function (r) { daCo[String(r[bm.h.TEN]).trim()] = String(r[bm.h.MA_MODULE]); });

  let them = 0;
  kq.data.forEach(function (x) {
    const ten = String(x.module || '').trim();
    if (!ten) return;
    let ma = daCo[ten];
    if (!ma) {
      ma = maMoi_('MOD', T.MODULE, 'MA_MODULE');
      themDong_(T.MODULE, {
        MA_MODULE: ma,
        TEN: ten,
        MUC_TIEU: chuoi_(x.muc_tieu),
        DAU_RA_KHACH_NHAN: chuoi_(x.dau_ra_khach_nhan),
        TAI_LIEU_CAN: chuoi_(x.tai_lieu_can),
        THU_TU: chuoi_(x.thu_tu)
      });
      daCo[ten] = ma;
      them++;
    }
    // Gắn mã module ngược lại vào bản đồ tri thức.
    bd.rows.forEach(function (r, i) {
      if (String(r[bd.h.MODULE]).trim() === ten && !String(r[bd.h.MA_MODULE]).trim()) {
        ghiO_(bd, i, 'MA_MODULE', ma);
      }
    });
  });
  ghiNhatKy_('Bước 4', 'OK', 'Đã thêm ' + them + ' module.');
  thongBao_('Bước 4 — Xong', 'Đã thêm ' + them + ' module và gắn MA_MODULE vào bản đồ tri thức.');
}

/* ============ BƯỚC 5 — TẠO BẢN ĐẦU TÀI LIỆU CHO MỘT MODULE ============== */

function m05_TaoBanDauTaiLieu() {
  const maModule = hoiChuoi_('Bước 5 — Tạo bản đầu tài liệu', 'Nhập MA_MODULE (ví dụ MOD-0001):');
  if (!maModule) return;
  const kq = taoBanDauTaiLieuChoModule(maModule);
  thongBao_('Bước 5', kq);
}

/** Dùng được cả từ menu lẫn bảng điều khiển. */
function taoBanDauTaiLieuChoModule(maModule) {
  const bm = docBang_(T.MODULE);
  let mod = null;
  bm.rows.forEach(function (r) {
    if (String(r[bm.h.MA_MODULE]).trim() === String(maModule).trim()) {
      mod = {
        ma: String(r[bm.h.MA_MODULE]),
        ten: String(r[bm.h.TEN]),
        muc_tieu: String(r[bm.h.MUC_TIEU]),
        dau_ra: String(r[bm.h.DAU_RA_KHACH_NHAN]),
        tai_lieu_can: String(r[bm.h.TAI_LIEU_CAN])
      };
    }
  });
  if (!mod) return 'Không tìm thấy module ' + maModule + ' trong trang MODULE.';

  // Chốt duyệt: mọi dòng bản đồ của module phải có nguồn dẫn và trạng thái DA_DUYET.
  const bd = docBang_(T.BAN_DO);
  const dongCuaModule = [];
  let thieuNguon = 0;
  bd.rows.forEach(function (r) {
    if (String(r[bd.h.MA_MODULE]).trim() !== mod.ma) return;
    const coNguon = String(r[bd.h.NGUON_DAN] || '').trim() !== '';
    const duyet = String(r[bd.h.TRANG_THAI_NGUON] || '').trim() === 'DA_DUYET';
    if (coNguon && duyet) {
      dongCuaModule.push({
        chu_de: String(r[bd.h.CHU_DE] || ''),
        cau_hoi_cot_loi: String(r[bd.h.CAU_HOI_COT_LOI] || ''),
        tri_thuc_can_co: String(r[bd.h.TRI_THUC_CAN_CO] || ''),
        nguon_dan: String(r[bd.h.NGUON_DAN] || '')
      });
    } else {
      thieuNguon++;
    }
  });
  if (thieuNguon > 0) {
    return 'Chưa viết được. Module ' + mod.ma + ' còn ' + thieuNguon +
      ' dòng bản đồ thiếu NGUON_DAN hoặc TRANG_THAI_NGUON chưa phải DA_DUYET.\n' +
      'Chốt duyệt này do bạn xử lý ở trang BAN_DO_TRI_THUC.';
  }
  if (!dongCuaModule.length) return 'Module ' + mod.ma + ' chưa có dòng bản đồ tri thức nào.';

  const danhSach = mod.tai_lieu_can.split(';').map(function (s) { return s.trim(); })
    .filter(String).slice(0, Number(cauHinh_('SO_TAI_LIEU_MOI_LAN', 3)));
  if (!danhSach.length) return 'Module ' + mod.ma + ' chưa có cột TAI_LIEU_CAN. Hãy điền tên tài liệu, cách nhau bằng dấu chấm phẩy.';

  const bt = docBang_(T.TAI_LIEU);
  const daCoTen = {};
  bt.rows.forEach(function (r) {
    if (String(r[bt.h.MA_MODULE]).trim() === mod.ma) daCoTen[String(r[bt.h.TEN]).trim()] = true;
  });

  const ketQua = [];
  danhSach.forEach(function (tenTL) {
    if (daCoTen[tenTL]) { ketQua.push('Bỏ qua (đã có): ' + tenTL); return; }
    const traVe = goiOpenAI_(cauHinh_('PROMPT_05_TAI_LIEU', ''), JSON.stringify({
      module: mod, tai_lieu: { ten: tenTL, loai: doanLoaiTaiLieu_(tenTL) }, cac_dong_ban_do: dongCuaModule
    }));
    const kq = docJson_(traVe);
    const maTL = maMoi_('TL', T.TAI_LIEU, 'MA_TAI_LIEU');

    if (!kq.ok || !kq.data || !kq.data.noi_dung) {
      const dong = themDong_(T.TAI_LIEU, {
        MA_TAI_LIEU: maTL, TEN: tenTL, LOAI: doanLoaiTaiLieu_(tenTL), MA_MODULE: mod.ma,
        TRANG_THAI: 'BAN_AI', PHIEN_BAN: 'v1.0'
      });
      const bt2 = docBang_(T.TAI_LIEU);
      bt2.sh.getRange(dong, bt2.h.JSON_THO + 1).setValue(String(kq.tho).slice(0, 45000));
      ketQua.push('Sai định dạng JSON: ' + tenTL + ' (nguyên văn đã ghi vào JSON_THO)');
      return;
    }

    const doc = DocumentApp.create(mod.ma + ' — ' + (chuoi_(kq.data.tieu_de) || tenTL));
    doc.getBody().setText(chuoi_(kq.data.noi_dung));
    doc.saveAndClose();
    chuyenVaoThuMuc_(doc.getId(), String(cauHinh_('ID_THU_MUC_TAI_LIEU', '')));

    themDong_(T.TAI_LIEU, {
      MA_TAI_LIEU: maTL,
      TEN: chuoi_(kq.data.tieu_de) || tenTL,
      LOAI: doanLoaiTaiLieu_(tenTL),
      MA_MODULE: mod.ma,
      TRANG_THAI: 'BAN_AI',
      NGUON: chuoi_(kq.data.nguon),
      NGUOI_DUYET: '',
      NGAY_DUYET: '',
      PHIEN_BAN: 'v1.0',
      LINK: doc.getUrl()
    });
    ketQua.push('Đã tạo: ' + tenTL);
  });

  ghiNhatKy_('Bước 5', 'OK', mod.ma + ' | ' + ketQua.join('; '));
  return ketQua.join('\n') + '\n\nTài liệu đang ở trạng thái BAN_AI. Việc đổi trạng thái là của con người, hệ thống không tự đổi.';
}

function doanLoaiTaiLieu_(ten) {
  const t = ten.toLowerCase();
  if (/mẫu|biểu|template|bảng/.test(t)) return 'BIEU_MAU';
  if (/quy trình|sop|checklist|danh mục/.test(t)) return 'QUY_TRINH';
  if (/kịch bản|script|thư|email/.test(t)) return 'KICH_BAN';
  return 'HUONG_DAN';
}

function chuyenVaoThuMuc_(idTep, idThuMuc) {
  if (!idThuMuc) return;
  try {
    const tep = DriveApp.getFileById(idTep);
    DriveApp.getFolderById(idThuMuc).addFile(tep);
    DriveApp.getRootFolder().removeFile(tep);
  } catch (e) {
    ghiNhatKy_('Chuyển thư mục', 'LOI', e.message);
  }
}

/* ============= BƯỚC 6 — TẠO KẾ HOẠCH CẢNH CHO MỘT VIDEO ================= */

function m06_TaoKeHoachCanh() {
  const maTL = hoiChuoi_('Bước 6 — Kế hoạch cảnh', 'Nhập MA_TAI_LIEU nguồn (ví dụ TL-0001):');
  if (!maTL) return;
  thongBao_('Bước 6', taoKeHoachCanhChoTaiLieu(maTL));
}

function taoKeHoachCanhChoTaiLieu(maTaiLieu) {
  const bt = docBang_(T.TAI_LIEU);
  let tl = null;
  bt.rows.forEach(function (r) {
    if (String(r[bt.h.MA_TAI_LIEU]).trim() === String(maTaiLieu).trim()) {
      tl = {
        ma: String(r[bt.h.MA_TAI_LIEU]), ten: String(r[bt.h.TEN]),
        trangThai: String(r[bt.h.TRANG_THAI]).trim(),
        nguoiDuyet: String(r[bt.h.NGUOI_DUYET]).trim(),
        ngayDuyet: String(r[bt.h.NGAY_DUYET]).trim(),
        link: String(r[bt.h.LINK]).trim()
      };
    }
  });
  if (!tl) return 'Không tìm thấy tài liệu ' + maTaiLieu + '.';

  // Chốt duyệt: phải DA_DUYET_XUAT_BAN kèm người duyệt và ngày duyệt.
  if (tl.trangThai !== 'DA_DUYET_XUAT_BAN' || !tl.nguoiDuyet || !tl.ngayDuyet) {
    return 'Chưa lập được kế hoạch cảnh.\nTài liệu ' + tl.ma + ' đang ở trạng thái "' + (tl.trangThai || 'trống') +
      '", người duyệt "' + (tl.nguoiDuyet || 'trống') + '", ngày duyệt "' + (tl.ngayDuyet || 'trống') + '".\n' +
      'Chốt duyệt: tài liệu phải đạt DA_DUYET_XUAT_BAN kèm người duyệt và ngày duyệt.';
  }
  if (!tl.link) return 'Tài liệu ' + tl.ma + ' chưa có cột LINK.';

  let noiDung = '';
  try {
    noiDung = DocumentApp.openByUrl(tl.link).getBody().getText();
  } catch (e) {
    return 'Không mở được tài liệu tại LINK: ' + e.message;
  }
  const gioiHan = Number(cauHinh_('GIOI_HAN_KY_TU_TAI_LIEU', 12000));
  noiDung = noiDung.slice(0, gioiHan);

  const traVe = goiOpenAI_(cauHinh_('PROMPT_06_CANH', ''), JSON.stringify({
    ma_tai_lieu: tl.ma, ten_tai_lieu: tl.ten, noi_dung: noiDung
  }));
  const kq = docJson_(traVe);
  if (!kq.ok || !Array.isArray(kq.data)) {
    const dong = themDong_(T.CANH, { MA_CANH: '[SAI_DINH_DANG]', MA_TAI_LIEU_NGUON: tl.ma });
    const bc = docBang_(T.CANH);
    bc.sh.getRange(dong, bc.h.JSON_THO + 1).setValue(String(kq.tho).slice(0, 45000));
    return 'AI trả về không phải JSON. Nguyên văn đã ghi vào cột JSON_THO, các cột khác giữ nguyên.';
  }

  let dem = 0;
  kq.data.forEach(function (x) {
    let loai = String(x.loai_canh || '').trim().toUpperCase();
    if (DS.LOAI_CANH.indexOf(loai) < 0) loai = 'MAN_HINH_THAT';
    themDong_(T.CANH, {
      MA_CANH: maMoi_('CANH', T.CANH, 'MA_CANH'),
      MA_TAI_LIEU_NGUON: tl.ma,
      MOC_THOI_GIAN: chuoi_(x.moc_thoi_gian),
      LOI_DAN: chuoi_(x.loi_dan),
      LOAI_CANH: loai,
      CONG_CU: chuoi_(x.cong_cu),
      NOI_DUNG_PHAI_XUAT_HIEN: chuoi_(x.noi_dung_phai_xuat_hien),
      CAU_LENH_TAO_CANH: chuoi_(x.cau_lenh_tao_canh),
      TAI_LIEU_NGUON: tl.ten + ' (' + tl.link + ')',
      DIEM_NGUOI_KIEM_TRA: chuoi_(x.diem_nguoi_phai_kiem_tra),
      GHI_CHU_CAPCUT: chuoi_(x.ghi_chu_capcut)
    });
    dem++;
  });
  ghiNhatKy_('Bước 6', 'OK', tl.ma + ' | ' + dem + ' cảnh.');
  return 'Đã tạo ' + dem + ' cảnh cho ' + tl.ma + '.\nDựng video là việc của con người, bảng chỉ giao kế hoạch cảnh.';
}

/* ========================== BƯỚC 7 — GHI ĐƠN ============================ */

function m07_GhiDon() {
  const hoTen = hoiChuoi_('Bước 7 — Ghi đơn (1/4)', 'Họ tên khách:');
  if (hoTen === null) return;
  const email = hoiChuoi_('Bước 7 — Ghi đơn (2/4)', 'Email khách:');
  if (email === null) return;
  const sanPham = hoiChuoi_('Bước 7 — Ghi đơn (3/4)', 'Sản phẩm (Enter để dùng mặc định):');
  if (sanPham === null) return;
  const daTra = hoiChuoi_('Bước 7 — Ghi đơn (4/4)', 'Khách đã thanh toán chưa? Gõ CO hoặc KHONG:');
  if (daTra === null) return;
  thongBao_('Bước 7', ghiDonMoi(hoTen, email, sanPham, String(daTra).trim().toUpperCase() === 'CO'));
}

function ghiDonMoi(hoTen, email, sanPham, daThanhToan) {
  const ma = maMoi_('DON', T.DON, 'MA_DON');
  const canhBao = hopLeEmail_(email) ? '' : 'EMAIL_SAI_DINH_DANG: ' + email + ' — không cấp quyền cho đến khi sửa.';
  themDong_(T.DON, {
    MA_DON: ma,
    HO_TEN: hoTen,
    EMAIL: String(email).trim(),
    SAN_PHAM: sanPham || cauHinh_('TEN_SAN_PHAM', 'Bộ công cụ tri thức'),
    GIA: Number(cauHinh_('GIA_MAC_DINH', 3000000)),
    NGAY_THANH_TOAN: daThanhToan ? ngayText_(homNay_()) : '',
    TRANG_THAI: daThanhToan ? 'DA_THANH_TOAN' : 'MOI',
    GHI_CHU_HE_THONG: canhBao
  });
  ghiNhatKy_('Bước 7', canhBao ? 'CANH_BAO' : 'OK', ma + ' | ' + email);
  return 'Đã ghi đơn ' + ma + '.' + (canhBao ? '\n' + canhBao : '');
}

/** Dùng cho nút trên bảng điều khiển. */
function danhDauDaThanhToan(maDon) {
  const b = docBang_(T.DON);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_DON]).trim() === String(maDon).trim()) {
      ghiO_(b, i, 'TRANG_THAI', 'DA_THANH_TOAN');
      if (!String(b.rows[i][b.h.NGAY_THANH_TOAN]).trim()) ghiO_(b, i, 'NGAY_THANH_TOAN', ngayText_(homNay_()));
      ghiNhatKy_('Đánh dấu đã thanh toán', 'OK', maDon);
      return 'Đơn ' + maDon + ' chuyển sang DA_THANH_TOAN.';
    }
  }
  return 'Không tìm thấy đơn ' + maDon + '.';
}

/* ===================== BƯỚC 8 — CẤP QUYỀN TÀI LIỆU ====================== */

function m08_CapQuyenTaiLieu() {
  const b = docBang_(T.DON);
  const ds = [];
  b.rows.forEach(function (r) {
    if (String(r[b.h.TRANG_THAI]).trim() === 'DA_THANH_TOAN') ds.push(String(r[b.h.MA_DON]));
  });
  if (!ds.length) {
    thongBao_('Bước 8', 'Không có đơn nào ở trạng thái DA_THANH_TOAN.\nChốt: chỉ cấp quyền cho đơn đã thanh toán.');
    return;
  }
  const kq = ds.map(function (ma) { return capQuyenChoDon(ma); });
  thongBao_('Bước 8 — Xong', kq.join('\n'));
}

function capQuyenChoDon(maDon) {
  const b = docBang_(T.DON);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_DON]).trim() !== String(maDon).trim()) continue;

    const trangThai = String(b.rows[i][b.h.TRANG_THAI]).trim();
    if (trangThai !== 'DA_THANH_TOAN') {
      return maDon + ': bỏ qua, trạng thái đang là ' + (trangThai || 'trống') + '. Chỉ cấp quyền khi DA_THANH_TOAN.';
    }
    const email = String(b.rows[i][b.h.EMAIL]).trim();
    if (!hopLeEmail_(email)) {
      ghiO_(b, i, 'GHI_CHU_HE_THONG', 'EMAIL_SAI_DINH_DANG: ' + email + ' — dừng ở bước cấp quyền lúc ' + mui_());
      ghiNhatKy_('Bước 8', 'CANH_BAO', maDon + ' email sai định dạng.');
      return maDon + ': email sai định dạng, đã ghi cảnh báo, không cấp quyền.';
    }
    const idThuMuc = String(cauHinh_('ID_THU_MUC_SAN_PHAM', '')).trim();
    if (!idThuMuc) return maDon + ': chưa có ID_THU_MUC_SAN_PHAM ở trang CAU_HINH.';

    try {
      const tm = DriveApp.getFolderById(idThuMuc);
      tm.addViewer(email);
      ghiO_(b, i, 'LINK_TAI_LIEU', tm.getUrl());
      ghiO_(b, i, 'TRANG_THAI', 'DA_CAP_QUYEN');
      ghiO_(b, i, 'NGAY_CAP_QUYEN', ngayText_(homNay_()));
      ghiNhatKy_('Bước 8', 'OK', maDon + ' | ' + email);
      return maDon + ': đã cấp quyền xem cho ' + email + '.';
    } catch (e) {
      ghiO_(b, i, 'GHI_CHU_HE_THONG', 'LOI_CAP_QUYEN: ' + e.message);
      return maDon + ': lỗi cấp quyền — ' + e.message;
    }
  }
  return 'Không tìm thấy đơn ' + maDon + '.';
}

/* ============== BƯỚC 9, 10, 11 — EMAIL CHÀO MỪNG VÀ NHẮC MỐC ============ */

function tranEmail_() {
  return Math.min(TRAN_EMAIL_MOI_LAN, Number(cauHinh_('SO_EMAIL_MOI_LAN_CHAY', TRAN_EMAIL_MOI_LAN)) || TRAN_EMAIL_MOI_LAN);
}

function thayThe_(mau, don) {
  return String(mau)
    .replace(/\{\{HO_TEN\}\}/g, don.hoTen)
    .replace(/\{\{SAN_PHAM\}\}/g, don.sanPham)
    .replace(/\{\{LINK\}\}/g, don.link)
    .replace(/\{\{MA_DON\}\}/g, don.maDon)
    .replace(/\{\{LINK_FORM_PHAN_HOI\}\}/g, String(cauHinh_('LINK_FORM_PHAN_HOI', '')));
}

function docDon_(b, i) {
  return {
    maDon: String(b.rows[i][b.h.MA_DON]).trim(),
    hoTen: String(b.rows[i][b.h.HO_TEN]).trim(),
    email: String(b.rows[i][b.h.EMAIL]).trim(),
    sanPham: String(b.rows[i][b.h.SAN_PHAM]).trim(),
    link: String(b.rows[i][b.h.LINK_TAI_LIEU]).trim(),
    trangThai: String(b.rows[i][b.h.TRANG_THAI]).trim()
  };
}

function m09_GuiEmailChaoMung() {
  const b = docBang_(T.DON);
  const tran = tranEmail_();
  let daGui = 0, boQua = 0;
  const chiTiet = [];
  for (let i = 0; i < b.rows.length; i++) {
    if (daGui >= tran) { chiTiet.push('Đã đạt trần ' + tran + ' email, dừng lại. Chạy lại để gửi tiếp.'); break; }
    const d = docDon_(b, i);
    if (d.trangThai !== 'DA_CAP_QUYEN') continue;
    if (String(b.rows[i][b.h.NGAY_GUI_CHAO_MUNG]).trim()) continue; // không gửi trùng
    const kq = guiChaoMungChoDon(d.maDon);
    if (kq.indexOf('Đã gửi') === 0) daGui++; else boQua++;
    chiTiet.push(kq);
  }
  ghiNhatKy_('Bước 9', 'OK', 'Gửi ' + daGui + ', bỏ qua ' + boQua);
  thongBao_('Bước 9 — Xong', 'Đã gửi ' + daGui + ' email chào mừng.\n\n' + chiTiet.join('\n'));
}

function guiChaoMungChoDon(maDon) {
  const b = docBang_(T.DON);
  for (let i = 0; i < b.rows.length; i++) {
    const d = docDon_(b, i);
    if (d.maDon !== String(maDon).trim()) continue;
    if (String(b.rows[i][b.h.NGAY_GUI_CHAO_MUNG]).trim()) return d.maDon + ': đã gửi trước đó, không gửi lại.';
    if (d.trangThai !== 'DA_CAP_QUYEN') return d.maDon + ': chỉ gửi chào mừng sau khi cấp quyền.';
    if (!hopLeEmail_(d.email)) {
      ghiO_(b, i, 'GHI_CHU_HE_THONG', 'EMAIL_SAI_DINH_DANG: dừng ở bước gửi chào mừng lúc ' + mui_());
      return d.maDon + ': email sai định dạng, đã ghi cảnh báo.';
    }
    MailApp.sendEmail(d.email,
      thayThe_(cauHinh_('EMAIL_CHAO_MUNG_TIEU_DE', 'Bộ công cụ đã sẵn sàng'), d),
      thayThe_(cauHinh_('EMAIL_CHAO_MUNG_NOI_DUNG', ''), d));
    ghiO_(b, i, 'NGAY_GUI_CHAO_MUNG', ngayText_(homNay_()));
    ghiO_(b, i, 'TRANG_THAI', 'DANG_HOC');
    ghiNhatKy_('Bước 9', 'OK', d.maDon);
    return 'Đã gửi chào mừng cho ' + d.maDon + '.';
  }
  return 'Không tìm thấy đơn ' + maDon + '.';
}

function m10_NhacMoc3() { chayNhacMoc_(3); }
function m11_NhacMoc7() { chayNhacMoc_(7); }

function chayNhacMoc_(soNgay) {
  const b = docBang_(T.DON);
  const cotNhac = soNgay === 3 ? 'NGAY_NHAC_3' : 'NGAY_NHAC_7';
  const tran = tranEmail_();
  let daGui = 0;
  const chiTiet = [];
  for (let i = 0; i < b.rows.length; i++) {
    if (daGui >= tran) { chiTiet.push('Đã đạt trần ' + tran + ' email, dừng lại.'); break; }
    const d = docDon_(b, i);
    if (['DA_CAP_QUYEN', 'DANG_HOC'].indexOf(d.trangThai) < 0) continue;
    if (String(b.rows[i][b.h[cotNhac]] || '').trim()) continue;
    const ngayCap = ngayTuGiaTri_(b.rows[i][b.h.NGAY_CAP_QUYEN]);
    if (!ngayCap) continue;
    const moc = congNgay_(ngayCap, soNgay);
    if (moc.getTime() > homNay_().getTime()) continue;
    const kq = nhacMocChoDon(d.maDon, soNgay);
    if (kq.indexOf('Đã gửi') === 0) daGui++;
    chiTiet.push(kq);
  }
  ghiNhatKy_('Bước ' + (soNgay === 3 ? 10 : 11), 'OK', 'Gửi ' + daGui + ' thư nhắc mốc ' + soNgay);
  thongBao_('Nhắc mốc ngày ' + soNgay, 'Đã gửi ' + daGui + ' thư.\n\n' + (chiTiet.join('\n') || 'Không có đơn nào đến hạn.'));
}

function nhacMocChoDon(maDon, soNgay) {
  const b = docBang_(T.DON);
  const cotNhac = soNgay === 3 ? 'NGAY_NHAC_3' : 'NGAY_NHAC_7';
  for (let i = 0; i < b.rows.length; i++) {
    const d = docDon_(b, i);
    if (d.maDon !== String(maDon).trim()) continue;
    if (String(b.rows[i][b.h[cotNhac]] || '').trim()) return d.maDon + ': đã nhắc mốc ' + soNgay + ' trước đó.';
    if (!hopLeEmail_(d.email)) {
      ghiO_(b, i, 'GHI_CHU_HE_THONG', 'EMAIL_SAI_DINH_DANG: dừng ở bước nhắc mốc ' + soNgay + ' lúc ' + mui_());
      return d.maDon + ': email sai định dạng, đã ghi cảnh báo.';
    }
    MailApp.sendEmail(d.email,
      thayThe_(cauHinh_('EMAIL_NHAC_' + soNgay + '_TIEU_DE', 'Mốc ngày ' + soNgay), d),
      thayThe_(cauHinh_('EMAIL_NHAC_' + soNgay + '_NOI_DUNG', ''), d));
    ghiO_(b, i, cotNhac, ngayText_(homNay_()));
    return 'Đã gửi nhắc mốc ' + soNgay + ' cho ' + d.maDon + '.';
  }
  return 'Không tìm thấy đơn ' + maDon + '.';
}

/* ============ BƯỚC 12 — ĐỌC VÀ PHÂN LOẠI THƯ HỖ TRỢ ===================== */

function m12_DocVaPhanLoaiThuHoTro() {
  const nhanVao = String(cauHinh_('NHAN_GMAIL_HO_TRO', 'ho-tro')).trim();
  const nhanRa = String(cauHinh_('NHAN_GMAIL_DA_DOC', 'ho-tro-da-doc')).trim();
  const chuoi = GmailApp.search('label:' + nhanVao + ' -label:' + nhanRa, 0, 20);
  if (!chuoi.length) {
    thongBao_('Bước 12', 'Không có thư mới trong nhãn "' + nhanVao + '".');
    return;
  }

  const bd = docBang_(T.DON);
  const emailToDon = {};
  bd.rows.forEach(function (r) {
    emailToDon[String(r[bd.h.EMAIL]).trim().toLowerCase()] = String(r[bd.h.MA_DON]);
  });

  const goi = [];
  const meta = [];
  chuoi.forEach(function (c, i) {
    const m = c.getMessages()[0];
    const emailNguoi = (String(m.getFrom()).match(/[^\s<>]+@[^\s<>]+/) || [''])[0];
    meta.push({
      chuoi: c, ngay: m.getDate(), email: emailNguoi, tieuDe: m.getSubject(),
      trich: m.getPlainBody().slice(0, 1200)
    });
    goi.push({ stt: i, tieu_de: m.getSubject(), trich: m.getPlainBody().slice(0, 1200) });
  });

  const traVe = goiOpenAI_(cauHinh_('PROMPT_12_THU', ''), JSON.stringify(goi));
  const kq = docJson_(traVe);
  const bt = docBang_(T.THU);
  const phanLoai = {};
  if (kq.ok && Array.isArray(kq.data)) {
    kq.data.forEach(function (x) { phanLoai[Number(x.stt)] = x; });
  }

  const nhanDaDoc = GmailApp.getUserLabelByName(nhanRa) || GmailApp.createLabel(nhanRa);
  meta.forEach(function (m, i) {
    const p = phanLoai[i] || {};
    let nhom = String(p.nhom || '').trim().toUpperCase();
    if (DS.NHOM_THU.indexOf(nhom) < 0) nhom = '';
    const dong = themDong_(T.THU, {
      MA_THU: maMoi_('THU', T.THU, 'MA_THU'),
      NGAY_NHAN: ngayText_(m.ngay),
      EMAIL_NGUOI_GUI: m.email,
      TIEU_DE: m.tieuDe,
      TRICH_NOI_DUNG: m.trich,
      NHOM_AI: nhom,
      LY_DO_PHAN_LOAI: chuoi_(p.ly_do),
      HANH_DONG_DE_XUAT: chuoi_(p.hanh_dong),
      MA_DON_LIEN_QUAN: emailToDon[m.email.toLowerCase()] || '',
      DA_XU_LY: 'KHONG'
    });
    if (!kq.ok) {
      const bt2 = docBang_(T.THU);
      bt2.sh.getRange(dong, bt2.h.JSON_THO + 1).setValue(String(kq.tho).slice(0, 45000));
    }
    m.chuoi.addLabel(nhanDaDoc);
  });

  ghiNhatKy_('Bước 12', kq.ok ? 'OK' : 'SAI_JSON', 'Đã đọc ' + meta.length + ' thư.');
  thongBao_('Bước 12 — Xong', 'Đã đưa ' + meta.length + ' thư vào trang THU_HO_TRO.' +
    (kq.ok ? '' : '\nAI trả về sai định dạng JSON, nguyên văn đã ghi vào cột JSON_THO.'));
}

/* ============ BƯỚC 13 — GHI NHẬN HOÀN THÀNH CHƯƠNG TRÌNH ================ */

function m13_GhiNhanHoanThanh() {
  const ma = hoiChuoi_('Bước 13 — Ghi nhận hoàn thành', 'Nhập MA_DON hoặc email của khách:');
  if (!ma) return;
  thongBao_('Bước 13', ghiNhanHoanThanhChoDon(ma));
}

function ghiNhanHoanThanhChoDon(khoa) {
  const b = docBang_(T.DON);
  const k = String(khoa).trim().toLowerCase();
  for (let i = 0; i < b.rows.length; i++) {
    const maDon = String(b.rows[i][b.h.MA_DON]).trim().toLowerCase();
    const email = String(b.rows[i][b.h.EMAIL]).trim().toLowerCase();
    if (maDon !== k && email !== k) continue;
    const tt = String(b.rows[i][b.h.TRANG_THAI]).trim();
    if (['DA_CAP_QUYEN', 'DANG_HOC'].indexOf(tt) < 0) {
      return 'Đơn đang ở trạng thái ' + (tt || 'trống') + '. Chỉ ghi nhận hoàn thành cho đơn đã cấp quyền hoặc đang học.';
    }
    ghiO_(b, i, 'TRANG_THAI', 'HOAN_THANH');
    ghiO_(b, i, 'NGAY_HOAN_THANH', ngayText_(homNay_()));
    ghiNhatKy_('Bước 13', 'OK', b.rows[i][b.h.MA_DON]);
    return 'Đã ghi nhận hoàn thành cho ' + b.rows[i][b.h.MA_DON] + '.\nBước tiếp theo: mời khách điền biểu mẫu phản hồi.';
  }
  return 'Không tìm thấy đơn theo "' + khoa + '".';
}

/* ====== BƯỚC 14 — ĐỌC PHẢN HỒI VÀ CHỈ RA PHẦN CẦN SỬA TRONG SẢN PHẨM ==== */

function m14_DocPhanHoi() {
  const b = docBang_(T.PHAN_HOI);
  const canXuLy = [];
  b.rows.forEach(function (r, i) {
    const nv = String(r[b.h.NGUYEN_VAN] || '').trim();
    const nhom = String(r[b.h.NHOM_AI] || '').trim();
    if (nv && !nhom) canXuLy.push({ stt: i, nguyen_van: nv });
  });
  if (!canXuLy.length) {
    thongBao_('Bước 14', 'Không có phản hồi mới chưa phân loại.');
    return;
  }

  const bt = docBang_(T.TAI_LIEU);
  const dsTaiLieu = bt.rows.map(function (r) {
    return { ma: String(r[bt.h.MA_TAI_LIEU]), ten: String(r[bt.h.TEN]), module: String(r[bt.h.MA_MODULE]) };
  }).filter(function (x) { return x.ma; });

  const traVe = goiOpenAI_(cauHinh_('PROMPT_14_PHAN_HOI', ''),
    JSON.stringify({ phan_hoi: canXuLy, danh_sach_tai_lieu: dsTaiLieu }));
  const kq = docJson_(traVe);
  if (!kq.ok || !Array.isArray(kq.data)) {
    canXuLy.forEach(function (x) { ghiJsonTho_(b, x.stt, kq.tho); });
    thongBao_('Bước 14 — Sai định dạng', 'AI trả về không phải JSON. Nguyên văn đã ghi vào cột JSON_THO. Các cột khác giữ nguyên.');
    return;
  }

  let dem = 0;
  kq.data.forEach(function (x) {
    const i = Number(x.stt);
    if (isNaN(i) || i < 0 || i >= b.rows.length) return;
    let nhom = String(x.nhom || '').trim().toUpperCase();
    if (DS.NHOM_PHAN_HOI.indexOf(nhom) < 0) nhom = '';
    // AI chỉ được điền hai cột này. QUYET_DINH và PHIEN_BAN_DU_KIEN bị chặn ở ghiO_.
    ghiO_(b, i, 'NHOM_AI', nhom);
    ghiO_(b, i, 'TAI_LIEU_LIEN_QUAN', chuoi_(x.tai_lieu_lien_quan));
    // Quy tắc cố định, không phải AI: nhóm nào cũng cần người xem trừ đề xuất phiên bản sau.
    ghiO_(b, i, 'CAN_NGUOI_XU_LY', nhom === 'DE_XUAT_PHIEN_BAN_SAU' ? 'KHONG' : 'CO');
    dem++;
  });
  ghiNhatKy_('Bước 14', 'OK', 'Đã phân loại ' + dem + ' phản hồi.');
  thongBao_('Bước 14 — Xong', 'Đã điền NHOM_AI và TAI_LIEU_LIEN_QUAN cho ' + dem + ' dòng.\n\n' +
    'Hai cột QUYET_DINH và PHIEN_BAN_DU_KIEN do bạn điền. Không hàm nào trong dự án ghi vào hai cột đó.');
}