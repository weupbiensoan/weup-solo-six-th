/**
 * WEUP SoloSix — โมเดล 4
 * ระบบรายงานยอดขายรายสัปดาห์สำหรับตลาดประเทศไทย
 *
 * โค้ดเป็นผู้ตรวจและคำนวณตัวเลขทั้งหมด ส่วน AI เขียนเฉพาะคำอธิบาย
 * รายงานจะไม่ถูกส่งจนกว่าผู้จัดการจะตรวจและอนุมัติด้วยตนเอง
 */

const TEN_MENU = 'รายงานประจำสัปดาห์';
const URL_OPENAI = 'https://api.openai.com/v1/responses';
const TEN_THUOC_TINH_KHOA = 'OPENAI_API_KEY';

const T = {
  CAU_HINH: 'ตั้งค่า',
  DU_LIEU: 'ข้อมูลรายวัน',
  CHI_SO: 'ตัวชี้วัดรายสัปดาห์',
  BAO_CAO: 'รายงาน AI',
  NHAT_KY: 'บันทึกระบบ'
};

const TEN_TRANG_CU = {
  CAU_HINH: 'CAU_HINH', DU_LIEU_NGAY: 'DU_LIEU_NGAY', CHI_SO_TUAN: 'CHI_SO_TUAN',
  BAO_CAO_AI: 'BAO_CAO_AI', NHAT_KY_HE_THONG: 'NHAT_KY_HE_THONG'
};

const NHAN_COT = {
  KHOA: 'คีย์', GIA_TRI: 'ค่า', MO_TA: 'คำอธิบาย',
  NGAY: 'วันที่', NHAN_VIEN: 'พนักงาน', KHACH_TIEM_NANG_MOI: 'ลูกค้าเป้าหมายใหม่',
  KHACH_DA_LIEN_HE: 'ติดต่อแล้ว', CUOC_HEN: 'นัดหมาย', DON_THANH_CONG: 'คำสั่งซื้อสำเร็จ',
  DOANH_THU_GHI_NHAN: 'ยอดขายที่บันทึก', TIEN_THUC_THU: 'เงินรับจริง', DON_HUY: 'ยกเลิก',
  DON_HOAN: 'คืนสินค้า', GHI_CHU: 'หมายเหตุผิดปกติ', MA_TUAN: 'รหัสสัปดาห์',
  TU_NGAY: 'ตั้งแต่วันที่', DEN_NGAY: 'ถึงวันที่', TY_LE_LIEN_HE: 'อัตราการติดต่อ (%)',
  TY_LE_CHOT: 'อัตราปิดการขาย (%)', TY_LE_HUY: 'อัตรายกเลิก (%)', TY_LE_HOAN: 'อัตราคืนสินค้า (%)',
  KPI_TUAN: 'เป้าหมายรายสัปดาห์ (บาท)', MUC_DAT_KPI: 'เทียบเป้าหมาย (%)',
  SO_SANH_TUAN_TRUOC: 'เทียบกับสัปดาห์ก่อน', TRANG_THAI_DU_LIEU: 'สถานะข้อมูล', NGAY_TINH: 'วันที่คำนวณ',
  MA_BAO_CAO: 'รหัสรายงาน', NGAY_TAO: 'วันที่สร้าง', TONG_QUAN: 'ภาพรวม', CANH_BAO: 'คำเตือน',
  HANH_DONG_DE_XUAT: 'การดำเนินการที่แนะนำ', CAU_HOI_CHO_QUAN_LY: 'คำถามสำหรับผู้จัดการ',
  TRANG_THAI: 'สถานะ', NGUOI_DUYET: 'ผู้อนุมัติ', NGAY_DUYET: 'วันที่อนุมัติ', NGAY_GUI: 'วันที่ส่ง',
  NGUOI_NHAN: 'ผู้รับ', JSON_THO: 'JSON ดิบ', THOI_GIAN: 'เวลา', BUOC: 'ขั้นตอน',
  KY_BAO_CAO: 'รอบรายงาน', KET_QUA: 'ผลลัพธ์', CHI_TIET: 'รายละเอียด', NGUOI_THUC_HIEN: 'ผู้ดำเนินการ'
};

const NHAN_TRANG_THAI = {
  CAN_SUA_DU_LIEU: 'ต้องแก้ข้อมูล', CHO_DUYET: 'รออนุมัติ', DA_DUYET_GUI: 'อนุมัติให้ส่ง',
  DA_GUI: 'ส่งแล้ว', LOI: 'ข้อผิดพลาด', DAT: 'ผ่าน', OK: 'สำเร็จ', DUNG: 'หยุด',
  CANH_BAO: 'คำเตือน', SAI_DINH_DANG: 'รูปแบบไม่ถูกต้อง', BO_QUA: 'ข้าม'
};

const KHOA_CAU_HINH = {
  TEN_DOANH_NGHIEP: 'BUSINESS_NAME', ID_FILE_KHACH: 'CUSTOMER_FILE_ID', TEN_TRANG_KHACH: 'CUSTOMER_SHEET_NAME',
  KY_BAO_CAO: 'REPORTING_PERIOD', KPI_TUAN: 'WEEKLY_KPI', TY_LE_O_TRONG_TOI_DA: 'MAX_BLANK_RATE',
  NGUONG_GIAM_TIEN_THUC_THU: 'CASH_DROP_ALERT_PERCENT', NGUONG_GIAM_TY_LE_CHOT: 'CLOSE_RATE_DROP_ALERT_POINTS',
  EMAIL_NGUOI_NHAN: 'REPORT_RECIPIENTS', MODEL: 'MODEL', MAX_OUTPUT_TOKENS: 'MAX_OUTPUT_TOKENS',
  SO_EMAIL_MOI_LAN_CHAY: 'EMAIL_LIMIT_PER_RUN', PROMPT_HE_THONG: 'SYSTEM_PROMPT', PROMPT_NGUOI_DUNG: 'USER_PROMPT',
  EMAIL_TIEU_DE: 'EMAIL_SUBJECT_TEMPLATE', EMAIL_NOI_DUNG: 'EMAIL_BODY_TEMPLATE'
};

const TRANG_THAI = ['CAN_SUA_DU_LIEU', 'CHO_DUYET', 'DA_DUYET_GUI', 'DA_GUI', 'LOI'];

/** คอลัมน์ตัวเลขสำหรับตรวจค่าติดลบและคำนวณผลรวม */
const COT_SO = ['KHACH_TIEM_NANG_MOI', 'KHACH_DA_LIEN_HE', 'CUOC_HEN', 'DON_THANH_CONG',
  'DOANH_THU_GHI_NHAN', 'TIEN_THUC_THU', 'DON_HUY', 'DON_HOAN'];

/** คอลัมน์บังคับสำหรับคำนวณสัดส่วนช่องว่าง */
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

/** คอลัมน์ที่มนุษย์เป็นผู้กรอกเท่านั้น */
const COT_CAM_GHI = {
  BAO_CAO_AI: ['NGUOI_DUYET', 'NGAY_DUYET']
};

/* --------------------------------- MENU ---------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu(TEN_MENU)
    .addItem('เปิดแดชบอร์ด', 'moBangDieuKhien')
    .addSeparator()
    .addItem('1. สร้างโครงสร้างชีต', 'm01_TaoKhungTrangTinh')
    .addItem('2. ตรวจสอบข้อมูลรายสัปดาห์', 'm02_KiemTraDuLieuTuan')
    .addItem('3. คำนวณตัวชี้วัดรายสัปดาห์', 'm03_TinhChiSoTuan')
    .addItem('4. สร้างความเห็นด้วย AI', 'm04_TaoNhanXetAI')
    .addItem('5. ส่งรายงานที่อนุมัติแล้ว', 'm05_GuiBaoCaoDaDuyet')
    .addSeparator()
    .addItem('6. ตรวจสอบการเชื่อมต่อ API', 'm06_KiemTraKetNoiAPI')
    .addItem('7. ตั้งเวลาทำงานอัตโนมัติ', 'm07_DatLichChayTuDong')
    .addToUi();
}

/* --------------------------- ฟังก์ชันช่วยทั่วไป -------------------------- */

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

function tenTrangCanonical_(ten) {
  const text = String(ten || '').trim();
  if (KHUNG[text]) return text;
  const keys = Object.keys(KHUNG);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const property = key === 'DU_LIEU_NGAY' ? 'DU_LIEU' : key === 'CHI_SO_TUAN' ? 'CHI_SO' :
      key === 'BAO_CAO_AI' ? 'BAO_CAO' : key === 'NHAT_KY_HE_THONG' ? 'NHAT_KY' : key;
    if (T[property] === text) return key;
  }
  return text;
}

function tenTrangHienThi_(canonical) {
  const property = canonical === 'DU_LIEU_NGAY' ? 'DU_LIEU' : canonical === 'CHI_SO_TUAN' ? 'CHI_SO' :
    canonical === 'BAO_CAO_AI' ? 'BAO_CAO' : canonical === 'NHAT_KY_HE_THONG' ? 'NHAT_KY' : canonical;
  return T[property] || canonical;
}

function nhanCot_(canonical) { return NHAN_COT[canonical] || canonical; }

function cotCanonical_(visible) {
  const text = String(visible || '').trim();
  if (NHAN_COT[text]) return text;
  const keys = Object.keys(NHAN_COT);
  for (let i = 0; i < keys.length; i++) {
    if (NHAN_COT[keys[i]] === text) return keys[i];
  }
  const normalized = text.toUpperCase().replace(/\s+/g, '_');
  return NHAN_COT[normalized] ? normalized : text;
}

function trangThaiCanonical_(visible) {
  const text = String(visible || '').trim();
  const upper = text.toUpperCase();
  if (NHAN_TRANG_THAI[upper]) return upper;
  const keys = Object.keys(NHAN_TRANG_THAI);
  for (let i = 0; i < keys.length; i++) {
    if (NHAN_TRANG_THAI[keys[i]] === text) return keys[i];
  }
  return upper;
}

function trangThaiHienThi_(canonical) {
  const key = trangThaiCanonical_(canonical);
  return NHAN_TRANG_THAI[key] || String(canonical === undefined || canonical === null ? '' : canonical);
}

function giaTriHienThi_(cot, giaTri) {
  return ['TRANG_THAI', 'TRANG_THAI_DU_LIEU', 'KET_QUA'].indexOf(cot) >= 0
    ? trangThaiHienThi_(giaTri) : giaTri;
}

function khoaCauHinhCanonical_(khoa) { return KHOA_CAU_HINH[khoa] || khoa; }

function trang_(ten, batBuoc) {
  const sh = ss_().getSheetByName(ten);
  if (!sh && batBuoc !== false) {
    throw new Error('ยังไม่มีชีต “' + ten + '” กรุณาเรียกเมนู 1. สร้างโครงสร้างชีตก่อน');
  }
  return sh;
}

/** อ่านข้อมูลรายวันจากไฟล์ลูกค้าที่เชื่อมไว้ หรือจากชีตในไฟล์ปัจจุบัน */
function docDuLieuNgay_() {
  const id = String(cauHinh_('ID_FILE_KHACH', '')).trim();
  if (!id) return docBang_(T.DU_LIEU);

  const tenTrang = String(cauHinh_('TEN_TRANG_KHACH', T.DU_LIEU)).trim();
  let bang;
  try {
    bang = SpreadsheetApp.openById(layIdTuDuongDan_(id));
  } catch (e) {
    throw new Error('ไม่สามารถเปิดไฟล์ข้อมูลลูกค้าได้ กรุณาตรวจลิงก์และสิทธิ์เข้าถึง รายละเอียด: ' + e.message);
  }
  const sh = bang.getSheetByName(tenTrang);
  if (!sh) {
    throw new Error('ไฟล์ลูกค้าไม่มีชีตชื่อ “' + tenTrang + '” กรุณาแก้ค่า CUSTOMER_SHEET_NAME ในชีต “' + T.CAU_HINH + '”');
  }

  const soCot = Math.max(sh.getLastColumn(), 1);
  const soDong = sh.getLastRow();
  const tieuDe = sh.getRange(1, 1, 1, soCot).getValues()[0];
  const h = {};
  tieuDe.forEach(function (v, i) {
    const k = cotCanonical_(v);
    if (k) h[k] = i;
  });
  const thieu = KHUNG.DU_LIEU_NGAY.filter(function (c) { return h[c] === undefined; });
  if (thieu.length) {
    throw new Error('ไฟล์ลูกค้าขาดคอลัมน์: ' + thieu.map(nhanCot_).join(', ') +
      ' กรุณาส่งเทมเพลต 11 คอลัมน์ให้ลูกค้ากรอกใหม่');
  }
  const rows = soDong > 1 ? sh.getRange(2, 1, soDong - 1, soCot).getValues() : [];
  return { sh: sh, h: h, rows: rows, tenTrang: tenTrang, tenCanonical: 'DU_LIEU_NGAY', tuFileKhach: true, tenFile: bang.getName() };
}

/** รับได้ทั้งรหัสไฟล์และลิงก์ Google Sheets แบบเต็ม */
function layIdTuDuongDan_(v) {
  const m = String(v).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : String(v).trim();
}

function docBang_(ten) {
  const sh = trang_(ten);
  const tenCanonical = tenTrangCanonical_(ten);
  const soCot = Math.max(sh.getLastColumn(), 1);
  const soDong = sh.getLastRow();
  const tieuDe = sh.getRange(1, 1, 1, soCot).getValues()[0];
  const h = {};
  tieuDe.forEach(function (v, i) { const key = cotCanonical_(v); if (key) h[key] = i; });
  const rows = soDong > 1 ? sh.getRange(2, 1, soDong - 1, soCot).getValues() : [];
  ['TRANG_THAI', 'TRANG_THAI_DU_LIEU', 'KET_QUA'].forEach(function (cot) {
    if (h[cot] === undefined) return;
    rows.forEach(function (row) { row[h[cot]] = trangThaiCanonical_(row[h[cot]]); });
  });
  return { sh: sh, h: h, rows: rows, tenTrang: ten, tenCanonical: tenCanonical };
}

function ghiO_(b, dongBang, cot, giaTri) {
  const cam = COT_CAM_GHI[b.tenCanonical] || [];
  if (cam.indexOf(cot) >= 0) {
    throw new Error('คอลัมน์ “' + nhanCot_(cot) + '” ในชีต “' + b.tenTrang + '” ให้มนุษย์กรอกเท่านั้น');
  }
  if (b.h[cot] === undefined) throw new Error('ชีต “' + b.tenTrang + '” ไม่มีคอลัมน์ “' + nhanCot_(cot) + '”');
  b.sh.getRange(dongBang + 2, b.h[cot] + 1).setValue(giaTriHienThi_(cot, giaTri));
  b.rows[dongBang][b.h[cot]] = giaTri;
}

function themDong_(tenTrang, obj) {
  const sh = trang_(tenTrang);
  const tieuDe = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const tenCanonical = tenTrangCanonical_(tenTrang);
  const cam = COT_CAM_GHI[tenCanonical] || [];
  cam.forEach(function (c) {
    if (obj[c] !== undefined && obj[c] !== '') {
      throw new Error('คอลัมน์ “' + nhanCot_(c) + '” ในชีต “' + tenTrang + '” ให้มนุษย์กรอกเท่านั้น');
    }
  });
  sh.appendRow(tieuDe.map(function (t) {
    const k = cotCanonical_(t);
    return obj[k] === undefined ? '' : giaTriHienThi_(k, obj[k]);
  }));
  return sh.getLastRow();
}

/** บันทึกเหตุการณ์ได้ทั้งจากเมนูและทริกเกอร์ที่ทำงานเบื้องหลัง */
function ghiNhatKy_(buoc, kyBaoCao, ketQua, chiTiet, maBaoCao) {
  const sh = trang_(T.NHAT_KY, false);
  if (!sh) return;
  let nguoi = '';
  try { nguoi = Session.getActiveUser().getEmail(); } catch (e) { nguoi = 'ทริกเกอร์อัตโนมัติ'; }
  themDong_(T.NHAT_KY, {
    THOI_GIAN: mui_(), BUOC: buoc, KY_BAO_CAO: kyBaoCao || '', KET_QUA: ketQua,
    CHI_TIET: String(chiTiet).slice(0, 5000), MA_BAO_CAO: maBaoCao || '', NGUOI_THUC_HIEN: nguoi
  });
}

function hopLeEmail_(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}

function thongBao_(tieuDe, noiDung) {
  SpreadsheetApp.getUi().alert(tieuDe, noiDung, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ------------------------------- การตั้งค่า ------------------------------- */

var _cacheCauHinh = null;

function cauHinh_(khoa, macDinh) {
  const canonical = khoaCauHinhCanonical_(khoa);
  if (!_cacheCauHinh) {
    const b = docBang_(T.CAU_HINH);
    _cacheCauHinh = {};
    b.rows.forEach(function (r) {
      const k = String(r[b.h.KHOA] || '').trim();
      if (k) _cacheCauHinh[k] = r[b.h.GIA_TRI];
    });
  }
  const v = _cacheCauHinh[canonical] !== undefined ? _cacheCauHinh[canonical] : _cacheCauHinh[khoa];
  if (v === undefined || v === null || String(v).trim() === '') return macDinh;
  return v;
}

function datCauHinh_(khoa, giaTri, moTa) {
  const canonical = khoaCauHinhCanonical_(khoa);
  const b = docBang_(T.CAU_HINH);
  for (let i = 0; i < b.rows.length; i++) {
    const existing = String(b.rows[i][b.h.KHOA]).trim();
    if (existing === canonical || existing === khoa) {
      if (existing !== canonical) b.sh.getRange(i + 2, b.h.KHOA + 1).setValue(canonical);
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(giaTri);
      _cacheCauHinh = null;
      return;
    }
  }
  b.sh.appendRow([canonical, giaTri, moTa || '']);
  _cacheCauHinh = null;
}

/* -------------------------- รอบรายงานรายสัปดาห์ ------------------------- */

/** แปลงค่ารอบรายงานให้เป็นข้อความรูปแบบเดียวกันก่อนนำไปใช้ */
function giaTriKyBaoCao_() {
  const v = cauHinh_('KY_BAO_CAO', 'TUAN_HIEN_TAI');
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, muiGio_(), 'yyyy-MM-dd');
  }
  const text = String(v).trim();
  if (text === 'สัปดาห์ปัจจุบัน') return 'TUAN_HIEN_TAI';
  if (text === 'สัปดาห์ก่อน') return 'TUAN_TRUOC';
  return text;
}

/** อ่านวันที่รูปแบบ yyyy-MM-dd และคืนค่า null เมื่อรูปแบบหรือวันที่ไม่ถูกต้อง */
function ngayTuChuoiISO_(chuoi) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(chuoi).trim());
  if (!m) return null;
  const nam = Number(m[1]), thang = Number(m[2]), ngay = Number(m[3]);
  const d = new Date(nam, thang - 1, ngay);
  if (d.getFullYear() !== nam || d.getMonth() !== thang - 1 || d.getDate() !== ngay) return null;
  return d;
}

/** รอบรายงานเริ่มวันจันทร์และสิ้นสุดวันอาทิตย์ตามเขตเวลาของสเปรดชีต */
function kyBaoCao_(moc) {
  const gt = giaTriKyBaoCao_();
  let goc;
  let luiMotTuan = false;

  if (moc) {
    goc = ngayTuGiaTri_(moc);
    if (!goc) throw new Error('ไม่สามารถอ่านวันที่อ้างอิงได้: ' + moc);
  } else {
    const ngayCoDinh = ngayTuChuoiISO_(gt);
    if (ngayCoDinh) {
      goc = ngayCoDinh;
    } else if (gt === 'TUAN_HIEN_TAI' || gt === 'TUAN_TRUOC') {
      goc = homNay_();
      luiMotTuan = (gt === 'TUAN_TRUOC');
    } else {
      throw new Error('ค่า REPORTING_PERIOD ในชีต “' + T.CAU_HINH + '” คือ “' + gt +
        '” กรุณาใช้ “สัปดาห์ปัจจุบัน”, “สัปดาห์ก่อน” หรือวันที่รูปแบบ yyyy-MM-dd เช่น 2026-08-10');
    }
  }

  const thu = goc.getDay(); // 0 คือวันอาทิตย์
  const lui = thu === 0 ? 6 : thu - 1;
  let batDau = congNgay_(goc, -lui);
  if (luiMotTuan) batDau = congNgay_(batDau, -7);
  const ketThuc = congNgay_(batDau, 6);
  return { batDau: batDau, ketThuc: ketThuc, ma: maTuan_(batDau) };
}

function maTuan_(batDau) {
  const nam = Utilities.formatDate(batDau, muiGio_(), 'yyyy');
  const tuan = Utilities.formatDate(batDau, muiGio_(), 'ww');
  return 'WEEK-' + nam + '-W' + tuan;
}

/* ------------------ เมนู 1 — สร้างโครงสร้างชีต -------------------------- */

function m01_TaoKhungTrangTinh() {
  const kq = taoKhung_();
  ghiNhatKy_('1. สร้างโครงสร้างชีต', '', 'OK', kq);
  thongBao_('สร้างโครงสร้างชีต', kq +
    '\n\nขั้นตอนถัดไป: บันทึก OPENAI_API_KEY ใน Script Properties แล้วเรียกเมนู 6 เพื่อตรวจสอบการเชื่อมต่อ');
}

function taoKhung_() {
  const bang = ss_();
  bang.setSpreadsheetTimeZone('Asia/Bangkok');
  try { bang.setSpreadsheetLocale('th_TH'); } catch (ignoreLocale) {}
  Object.keys(KHUNG).forEach(function (tenCanonical) {
    const ten = tenTrangHienThi_(tenCanonical);
    let sh = bang.getSheetByName(ten);
    if (!sh) {
      const legacy = bang.getSheetByName(TEN_TRANG_CU[tenCanonical] || tenCanonical);
      if (legacy) { legacy.setName(ten); sh = legacy; }
    }
    if (!sh) sh = bang.insertSheet(ten);
    const cot = KHUNG[tenCanonical];
    const hienTai = sh.getLastColumn() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (v) { return String(v).trim(); }) : [];
    if (hienTai.filter(String).length === 0) {
      sh.getRange(1, 1, 1, cot.length).setValues([cot.map(nhanCot_)]);
    } else {
      cot.forEach(function (canonical) {
        const label = nhanCot_(canonical);
        const labelIndex = hienTai.indexOf(label);
        const legacyIndex = hienTai.indexOf(canonical);
        if (labelIndex < 0 && legacyIndex >= 0) {
          sh.getRange(1, legacyIndex + 1).setValue(label);
          hienTai[legacyIndex] = label;
        } else if (labelIndex < 0 && legacyIndex < 0) {
          hienTai.push(label);
          sh.getRange(1, hienTai.length).setValue(label);
        }
      });
    }
    sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), cot.length))
      .setFontWeight('bold').setBackground('#144080').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  });

  const bb = docBang_(T.BAO_CAO);
  if (bb.h.TRANG_THAI !== undefined) {
    const giaTriHienThi = TRANG_THAI.map(trangThaiHienThi_);
    const range = bb.sh.getRange(2, bb.h.TRANG_THAI + 1, Math.max(bb.sh.getMaxRows() - 1, 1));
    const existing = range.getValues();
    let changed = false;
    existing.forEach(function (row) {
      const current = String(row[0] || '').trim();
      if (!current) return;
      const canonical = trangThaiCanonical_(current);
      if (TRANG_THAI.indexOf(canonical) < 0) return;
      const localized = trangThaiHienThi_(canonical);
      if (current !== localized) { row[0] = localized; changed = true; }
    });
    if (changed) range.setValues(existing);
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(giaTriHienThi, true)
      .setAllowInvalid(false).build();
    range.setDataValidation(rule);
  }

  napCauHinhMacDinh_();
  diaPhuongHoaTrangThaiCu_();
  chuyenMaTuanCu_();
  return 'ตรวจสอบและสร้างชีตภาษาไทยครบ ' + Object.keys(KHUNG).length + ' ชีต พร้อมการตั้งค่าเริ่มต้นแล้ว';
}

function diaPhuongHoaTrangThaiCu_() {
  [[T.BAO_CAO, 'TRANG_THAI'], [T.CHI_SO, 'TRANG_THAI_DU_LIEU'], [T.NHAT_KY, 'KET_QUA']]
    .forEach(function (definition) {
      const b = docBang_(definition[0]);
      const cot = definition[1];
      if (b.h[cot] === undefined || !b.rows.length) return;
      const range = b.sh.getRange(2, b.h[cot] + 1, b.rows.length, 1);
      const values = range.getValues();
      let changed = false;
      values.forEach(function (row) {
        const current = String(row[0] || '').trim();
        if (!current) return;
        const canonical = trangThaiCanonical_(current);
        if (!NHAN_TRANG_THAI[canonical]) return;
        const localized = trangThaiHienThi_(canonical);
        if (current !== localized) { row[0] = localized; changed = true; }
      });
      if (changed) range.setValues(values);
    });
}

function chuyenMaTuanCu_() {
  [
    [T.CHI_SO, 'MA_TUAN'], [T.BAO_CAO, 'MA_TUAN'], [T.NHAT_KY, 'KY_BAO_CAO']
  ].forEach(function (definition) {
    const b = docBang_(definition[0]);
    const cot = definition[1];
    if (b.h[cot] === undefined || !b.rows.length) return;
    const range = b.sh.getRange(2, b.h[cot] + 1, b.rows.length, 1);
    const values = range.getValues();
    let changed = false;
    values.forEach(function (row) {
      const current = String(row[0] || '');
      if (current.indexOf('TUAN-') === 0) { row[0] = current.replace(/^TUAN-/, 'WEEK-'); changed = true; }
    });
    if (changed) range.setValues(values);
  });
}

function napCauHinhMacDinh_() {
  const macDinh = [
    ['BUSINESS_NAME', '', 'ชื่อธุรกิจที่แสดงในหัวเรื่องอีเมล'],
    ['CUSTOMER_FILE_ID', '', 'รหัสหรือลิงก์ Google Sheets ของลูกค้า เว้นว่างเพื่ออ่านชีต “ข้อมูลรายวัน” ในไฟล์นี้'],
    ['CUSTOMER_SHEET_NAME', T.DU_LIEU, 'ชื่อชีตข้อมูลรายวันในไฟล์ลูกค้า'],
    ['REPORTING_PERIOD', 'สัปดาห์ปัจจุบัน', 'ใช้ “สัปดาห์ปัจจุบัน”, “สัปดาห์ก่อน” หรือวันที่รูปแบบ yyyy-MM-dd เพื่อเรียกข้อมูลสัปดาห์เก่า'],
    ['WEEKLY_KPI', 400000, 'เป้าหมายเงินรับจริงต่อสัปดาห์ หน่วยเป็นบาท'],
    ['MAX_BLANK_RATE', 5, 'หยุดคำนวณเมื่อสัดส่วนช่องบังคับว่างเกินค่านี้'],
    ['CASH_DROP_ALERT_PERCENT', 5, 'แจ้งเตือนเมื่อเงินรับจริงลดลงเกินเปอร์เซ็นต์นี้เมื่อเทียบสัปดาห์ก่อน'],
    ['CLOSE_RATE_DROP_ALERT_POINTS', 1, 'แจ้งเตือนเมื่ออัตราปิดการขายลดลงเกินจำนวนจุดเปอร์เซ็นต์นี้'],
    ['REPORT_RECIPIENTS', '', 'อีเมลผู้รับรายงาน คั่นด้วยเครื่องหมายจุลภาค'],
    ['MODEL', 'gpt-5.6', 'ชื่อโมเดล OpenAI ที่บัญชีของคุณมีสิทธิ์ใช้'],
    ['MAX_OUTPUT_TOKENS', 4000, 'ความยาวสูงสุดของคำตอบ AI เพิ่มเมื่อเนื้อหาถูกตัด'],
    ['EMAIL_LIMIT_PER_RUN', 20, 'จำนวนผู้รับสูงสุดต่อการทำงานหนึ่งครั้ง ระบบจำกัดไม่เกิน 20'],

    ['SYSTEM_PROMPT',
      'คุณเขียนความคิดเห็นประกอบรายงานยอดขายรายสัปดาห์สำหรับธุรกิจขนาดเล็ก\n' +
      'ใช้เฉพาะตัวชี้วัดที่ระบบคำนวณให้ ห้ามคำนวณใหม่ บวก ลบ หรือสร้างตัวเลขเพิ่ม\n' +
      'ห้ามระบุชื่อพนักงาน ห้ามประเมินความสามารถรายบุคคล และห้ามเสนอรางวัลหรือบทลงโทษ\n' +
      'หากข้อมูลไม่พอให้ระบุว่าข้อมูลยังไม่เพียงพอ ห้ามเดาสาเหตุ\n' +
      'ตอบเป็นภาษาไทยด้วยน้ำเสียงเป็นกลาง แต่ละส่วนไม่เกิน 5 ประโยค',
      'พรอมต์ระบบสำหรับ AI ในเมนู 4'],

    ['USER_PROMPT',
      'นี่คือตารางตัวชี้วัดที่คำนวณแล้ว พร้อมข้อมูลสัปดาห์ก่อนและเป้าหมาย\n' +
      'ภาพรวม: สรุปสถานการณ์ด้วยตัวเลขที่ให้เท่านั้น\n' +
      'คำเตือน: ระบุตัวชี้วัดที่ลดลงหรือเกินเกณฑ์ พร้อมระดับการเปลี่ยนแปลง\n' +
      'การดำเนินการที่แนะนำ: เสนอสิ่งที่ผู้จัดการควรตรวจสอบในสัปดาห์ถัดไปโดยไม่รับประกันผล\n' +
      'คำถามสำหรับผู้จัดการ: ถามเฉพาะข้อมูลที่ยังขาดและต้องให้ผู้จัดการยืนยัน',
      'พรอมต์ผู้ใช้ที่ส่งพร้อมตัวชี้วัดในเมนู 4'],

    ['EMAIL_SUBJECT_TEMPLATE', 'รายงานยอดขายรายสัปดาห์ {{WEEK_ID}} — {{BUSINESS_NAME}}', 'ตัวแปรที่ใช้ได้: {{WEEK_ID}} และ {{BUSINESS_NAME}}'],
    ['EMAIL_BODY_TEMPLATE',
      'เรียนผู้รับรายงาน\n\nนี่คือรายงานยอดขายรายสัปดาห์ตั้งแต่ {{FROM_DATE}} ถึง {{TO_DATE}} ซึ่งผู้จัดการตรวจและอนุมัติแล้ว\n\n' +
      'ตัวชี้วัดรายสัปดาห์\n{{KPI_TABLE}}\n\n' +
      'ภาพรวม\n{{OVERVIEW}}\n\n' +
      'คำเตือน\n{{WARNINGS}}\n\n' +
      'การดำเนินการที่แนะนำ\n{{RECOMMENDED_ACTIONS}}\n\n' +
      'คำถามสำหรับผู้จัดการ\n{{MANAGER_QUESTIONS}}\n\n' +
      'ความคิดเห็นจัดทำโดย AI จากตัวชี้วัดที่ระบบคำนวณ และผ่านการตรวจอนุมัติจากผู้จัดการแล้ว\n\n' +
      'รหัสรายงาน: {{REPORT_ID}}',
      'เนื้อหาอีเมลที่ส่งให้ผู้รับ']
  ];

  const b = docBang_(T.CAU_HINH);
  const macDinhTheoKhoa = {};
  macDinh.forEach(function (row) { macDinhTheoKhoa[row[0]] = row; });
  const coFileKhach = b.rows.some(function (row) {
    const key = khoaCauHinhCanonical_(String(row[b.h.KHOA] || '').trim());
    return key === 'CUSTOMER_FILE_ID' && String(row[b.h.GIA_TRI] || '').trim() !== '';
  });
  const daCo = {};
  b.rows.forEach(function (r, i) {
    const legacy = String(r[b.h.KHOA] || '').trim();
    const canonical = khoaCauHinhCanonical_(legacy);
    if (legacy && legacy !== canonical) b.sh.getRange(i + 2, b.h.KHOA + 1).setValue(canonical);
    const defaultRow = macDinhTheoKhoa[canonical];
    const currentValue = String(r[b.h.GIA_TRI] === undefined || r[b.h.GIA_TRI] === null ? '' : r[b.h.GIA_TRI]);
    if (defaultRow && b.h.MO_TA !== undefined) b.sh.getRange(i + 2, b.h.MO_TA + 1).setValue(defaultRow[2]);
    if (canonical === 'WEEKLY_KPI' && legacy === 'KPI_TUAN' && Number(currentValue) === 400000000) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'SYSTEM_PROMPT' && currentValue.indexOf('Bạn viết phần nhận xét') === 0) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'USER_PROMPT' && currentValue.indexOf('Đây là bảng chỉ số') === 0) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'EMAIL_SUBJECT_TEMPLATE' && currentValue.indexOf('Báo cáo bán hàng tuần') === 0) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'EMAIL_BODY_TEMPLATE' && currentValue.indexOf('Kính gửi anh/chị') === 0) {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(defaultRow[1]);
    }
    if (canonical === 'REPORTING_PERIOD') {
      const current = currentValue.trim();
      if (current === 'TUAN_HIEN_TAI') b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue('สัปดาห์ปัจจุบัน');
      if (current === 'TUAN_TRUOC') b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue('สัปดาห์ก่อน');
    }
    if (!coFileKhach && canonical === 'CUSTOMER_SHEET_NAME' && String(r[b.h.GIA_TRI] || '').trim() === 'DU_LIEU_NGAY') {
      b.sh.getRange(i + 2, b.h.GIA_TRI + 1).setValue(T.DU_LIEU);
    }
    if (canonical) daCo[canonical] = true;
  });
  const them = macDinh.filter(function (d) { return !daCo[d[0]]; });
  if (them.length) b.sh.getRange(b.sh.getLastRow() + 1, 1, them.length, 3).setValues(them);
  b.sh.setColumnWidth(1, 230);
  b.sh.setColumnWidth(2, 560);
  b.sh.setColumnWidth(3, 320);
  _cacheCauHinh = null;
}

/* ---------------- เมนู 2 — ตรวจสอบข้อมูลรายสัปดาห์ ---------------------- */

function m02_KiemTraDuLieuTuan() {
  const ky = kyBaoCao_();
  const kq = kiemTraDuLieu_(ky);
  ghiNhatKy_('2. ตรวจสอบข้อมูลรายสัปดาห์', ky.ma, kq.dat ? 'OK' : 'CAN_SUA_DU_LIEU', kq.tomTat);
  thongBao_('ตรวจสอบข้อมูลรายสัปดาห์ ' + ky.ma, kq.tomTat);
}

/** หยุดเมื่อพนักงานว่าง วันที่ผิดรอบ ตัวเลขติดลบ ข้อมูลซ้ำ หรือช่องบังคับว่างเกินเกณฑ์ */
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

    if (!ngay) { loi.push('แถว ' + dong + ': คอลัมน์ “' + nhanCot_('NGAY') + '” ว่างหรืออ่านค่าไม่ได้'); return; }
    // ไฟล์อาจเก็บหลายสัปดาห์ แถวจากรอบอื่นจะถูกข้ามเพื่อให้เปรียบเทียบย้อนหลังได้
    if (ngay.getTime() < ky.batDau.getTime() || ngay.getTime() > ky.ketThuc.getTime()) {
      ngoaiKy++;
      return;
    }
    if (ngay.getTime() > homNay_().getTime()) {
      loi.push('แถว ' + dong + ': วันที่ ' + ngayText_(ngay) + ' อยู่ในอนาคต');
      return;
    }
    trongKy.push(i);

    const nv = String(r[b.h.NHAN_VIEN] || '').trim();
    if (!nv) loi.push('แถว ' + dong + ': คอลัมน์ “' + nhanCot_('NHAN_VIEN') + '” ว่าง');

    const khoa = ngayText_(ngay) + '|' + nv.toLowerCase();
    if (nv) {
      if (daGap[khoa]) loi.push('แถว ' + dong + ': ซ้ำกับแถว ' + daGap[khoa] + ' ในคู่วันที่และพนักงาน');
      else daGap[khoa] = dong;
    }

    COT_SO.forEach(function (c) {
      const v = r[b.h[c]];
      const n = so_(v);
      if (n !== null && n < 0) loi.push('แถว ' + dong + ': คอลัมน์ “' + nhanCot_(c) + '” มีค่าติดลบ (' + n + ')');
    });

    COT_BAT_BUOC.forEach(function (c) {
      oBatBuoc++;
      if (String(r[b.h[c]] === undefined ? '' : r[b.h[c]]).trim() === '') oTrong++;
    });
  });

  const tranTrong = Number(cauHinh_('TY_LE_O_TRONG_TOI_DA', 5)) || 5;
  const tyLeTrong = oBatBuoc ? Math.round(oTrong / oBatBuoc * 1000) / 10 : 0;
  if (tyLeTrong > tranTrong) {
    loi.push('ช่องบังคับว่าง ' + tyLeTrong + '% ซึ่งเกินเกณฑ์ ' + tranTrong + '%');
  }
  if (!trongKy.length) {
    loi.push('ไม่มีข้อมูลในรอบ ' + ngayText_(ky.batDau) + ' ถึง ' + ngayText_(ky.ketThuc) +
      (ngoaiKy ? ' ไฟล์มี ' + ngoaiKy + ' แถวจากรอบอื่น' : '') +
      ' กรุณาเปลี่ยน REPORTING_PERIOD ในชีต “' + T.CAU_HINH + '” เป็น “สัปดาห์ก่อน” หรือวันที่ yyyy-MM-dd ที่มีข้อมูล');
  }

  const dat = loi.length === 0;
  const tomTat = dat
    ? ('ข้อมูลผ่านการตรวจสอบ มี ' + trongKy.length + ' แถวในรอบ ' + ngayText_(ky.batDau) + ' ถึง ' +
      ngayText_(ky.ketThuc) + ' และช่องว่าง ' + tyLeTrong + '%' +
      (ngoaiKy ? ' ข้ามข้อมูลจากรอบอื่น ' + ngoaiKy + ' แถว' : ''))
    : (trangThaiHienThi_('CAN_SUA_DU_LIEU') + ' — พบข้อผิดพลาด ' + loi.length + ' รายการ:\n' + loi.slice(0, 30).join('\n') +
      (loi.length > 30 ? '\n... ยังมีอีก ' + (loi.length - 30) + ' รายการ โปรดดูชีต “' + T.NHAT_KY + '”' : ''));

  return { dat: dat, loi: loi, dong: trongKy, tyLeTrong: tyLeTrong, ngoaiKy: ngoaiKy, tomTat: tomTat };
}

/* ---------------- เมนู 3 — คำนวณตัวชี้วัดรายสัปดาห์ --------------------- */

function m03_TinhChiSoTuan() {
  const ky = kyBaoCao_();
  const kq = tinhChiSo_(ky);
  ghiNhatKy_('3. คำนวณตัวชี้วัดรายสัปดาห์', ky.ma, kq.ok ? 'OK' : 'DUNG', kq.thongBao);
  thongBao_('คำนวณตัวชี้วัดรายสัปดาห์ ' + ky.ma, kq.thongBao);
}

function tinhChiSo_(ky, khongTinhTuanTruoc) {
  const kiem = kiemTraDuLieu_(ky);
  if (!kiem.dat) {
    ghiNhatKy_('3. คำนวณตัวชี้วัดรายสัปดาห์', ky.ma, 'CAN_SUA_DU_LIEU', kiem.tomTat);
    return { ok: false, thongBao: 'ยังคำนวณไม่ได้ เนื่องจากข้อมูลไม่ผ่านการตรวจสอบ\n\n' + kiem.tomTat };
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
      canhBaoTinh.push('คำนวณ' + ten + 'ไม่ได้ เนื่องจากตัวหารเป็นศูนย์');
      return '';
    }
    return Math.round(tu / mau * 1000) / 10;
  }

  const tyLeLienHe = tyLe(tong.KHACH_DA_LIEN_HE, tong.KHACH_TIEM_NANG_MOI, 'อัตราการติดต่อ');
  const tyLeChot = tyLe(tong.DON_THANH_CONG, tong.KHACH_DA_LIEN_HE, 'อัตราปิดการขาย');
  const tyLeHuy = tyLe(tong.DON_HUY, tong.DON_THANH_CONG, 'อัตรายกเลิก');
  const tyLeHoan = tyLe(tong.DON_HOAN, tong.DON_THANH_CONG, 'อัตราคืนสินค้า');
  const kpi = Number(cauHinh_('KPI_TUAN', 0)) || 0;
  const mucDatKpi = kpi ? Math.round(tong.TIEN_THUC_THU / kpi * 1000) / 10 : '';
  if (!kpi) canhBaoTinh.push('ยังไม่ได้กำหนด WEEKLY_KPI ในชีต “' + T.CAU_HINH + '” จึงคำนวณเปอร์เซ็นต์เทียบเป้าหมายไม่ได้');

  // อ่านสัปดาห์ก่อนจากชีตตัวชี้วัด หากยังไม่มีให้คำนวณจากข้อมูลรายวัน
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
    : 'ยังไม่มีข้อมูลสัปดาห์ก่อนสำหรับเปรียบเทียบ';

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
  const tb = 'คำนวณสัปดาห์ ' + ky.ma + ' เรียบร้อยแล้ว\n' +
    'เงินรับจริง ' + tong.TIEN_THUC_THU.toLocaleString('th-TH') + ' บาท อัตราปิดการขาย ' + tyLeChot + '%\n' +
    soSanh + (canhBaoTinh.length ? '\n\nหมายเหตุ:\n' + canhBaoTinh.join('\n') : '');
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
    phan.push(ten + ' ' + (ch >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(ch) + '%' + (donVi || ''));
  }
  delta(tong.KHACH_TIEM_NANG_MOI, truoc.KHACH_TIEM_NANG_MOI, 'ลูกค้าเป้าหมายใหม่');
  delta(tong.DON_THANH_CONG, truoc.DON_THANH_CONG, 'คำสั่งซื้อสำเร็จ');
  delta(tong.TIEN_THUC_THU, truoc.TIEN_THUC_THU, 'เงินรับจริง');
  const tlt = so_(truoc.TY_LE_CHOT);
  if (tlt !== null && tyLeChot !== '') {
    const d = Math.round((tyLeChot - tlt) * 10) / 10;
    phan.push('อัตราปิดการขาย' + (d >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(d) + ' จุดเปอร์เซ็นต์');
  }
  return 'เทียบกับสัปดาห์ก่อน: ' + phan.join('; ');
}

function ghiHoacCapNhatChiSo_(obj) {
  const b = docBang_(T.CHI_SO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_TUAN]).trim() === obj.MA_TUAN) {
      Object.keys(obj).forEach(function (c) {
        if (b.h[c] !== undefined) b.sh.getRange(i + 2, b.h[c] + 1).setValue(giaTriHienThi_(c, obj[c]));
      });
      return;
    }
  }
  themDong_(T.CHI_SO, obj);
}

/* ------------------- เมนู 4 — สร้างความเห็นด้วย AI ---------------------- */

function m04_TaoNhanXetAI() {
  const ky = kyBaoCao_();
  const kq = taoNhanXet_(ky);
  thongBao_('สร้างความเห็นด้วย AI — ' + ky.ma, kq.thongBao);
}

function taoNhanXet_(ky) {
  const chiSo = docDongChiSo_(ky.ma);
  if (!chiSo) {
    return { ok: false, thongBao: 'ยังไม่มีตัวชี้วัดสำหรับ ' + ky.ma + ' กรุณาเรียกเมนู 3 ก่อน' };
  }
  if (docBaoCao_(ky.ma)) {
    return { ok: false, thongBao: 'สัปดาห์ ' + ky.ma + ' มีรายงานแล้ว หากต้องการสร้างใหม่ให้ลบแถวเดิมในชีต “' + T.BAO_CAO + '” ก่อน' };
  }

  const truoc = docDongChiSo_(maTuan_(congNgay_(ky.batDau, -7)));
  const duLieuGui = {
    week_id: ky.ma,
    from_date: ngayText_(ky.batDau),
    to_date: ngayText_(ky.ketThuc),
    current_week_metrics: rutGonChiSo_(chiSo),
    previous_week_metrics: truoc ? rutGonChiSo_(truoc) : null,
    weekly_target: chiSo.KPI_TUAN,
    target_achievement_percent: chiSo.MUC_DAT_KPI,
    calculated_comparison: chiSo.SO_SANH_TUAN_TRUOC,
    alert_thresholds: {
      cash_drop_percent: Number(cauHinh_('NGUONG_GIAM_TIEN_THUC_THU', 5)),
      close_rate_drop_points: Number(cauHinh_('NGUONG_GIAM_TY_LE_CHOT', 1))
    }
  };

  const maBaoCao = maBaoCaoMoi_();
  let kq;
  try {
    kq = goiOpenAI_(
      chuoi_(cauHinh_('PROMPT_HE_THONG', '')),
      chuoi_(cauHinh_('PROMPT_NGUOI_DUNG', '')) + '\n\nข้อมูลที่ผ่านการคำนวณ:\n' + JSON.stringify(duLieuGui)
    );
  } catch (e) {
    themDong_(T.BAO_CAO, {
      MA_BAO_CAO: maBaoCao, MA_TUAN: ky.ma, NGAY_TAO: mui_(),
      TRANG_THAI: 'LOI', JSON_THO: e.message
    });
    ghiNhatKy_('4. สร้างความเห็นด้วย AI', ky.ma, 'LOI', e.message, maBaoCao);
    return {
      ok: false, thongBao: 'เรียก AI ไม่สำเร็จ: ' + e.message +
        '\n\nตัวชี้วัดเดิมยังอยู่ คุณสามารถเขียนความคิดเห็นทั้ง 4 ส่วนด้วยตนเอง แล้วเปลี่ยนสถานะเป็น “' + trangThaiHienThi_('CHO_DUYET') + '”'
    };
  }

  if (!kq.ok) {
    themDong_(T.BAO_CAO, {
      MA_BAO_CAO: maBaoCao, MA_TUAN: ky.ma, NGAY_TAO: mui_(),
      TRANG_THAI: 'LOI', JSON_THO: String(kq.tho).slice(0, 45000)
    });
    ghiNhatKy_('4. สร้างความเห็นด้วย AI', ky.ma, 'SAI_DINH_DANG', 'ดูข้อความในคอลัมน์ “' + nhanCot_('JSON_THO') + '”', maBaoCao);
    return {
      ok: false, thongBao: 'AI ส่งคำตอบว่างหรือรูปแบบไม่ถูกต้อง ระบบบันทึกคำตอบเดิมไว้ในคอลัมน์ “' + nhanCot_('JSON_THO') + '” แล้ว' +
        '\n\nหากคำตอบถูกตัด ให้เพิ่มค่า MAX_OUTPUT_TOKENS ในชีต “' + T.CAU_HINH + '”'
    };
  }

  themDong_(T.BAO_CAO, {
    MA_BAO_CAO: maBaoCao,
    MA_TUAN: ky.ma,
    NGAY_TAO: mui_(),
    TONG_QUAN: chuoi_(kq.data.OVERVIEW),
    CANH_BAO: chuoi_(kq.data.WARNINGS),
    HANH_DONG_DE_XUAT: chuoi_(kq.data.RECOMMENDED_ACTIONS),
    CAU_HOI_CHO_QUAN_LY: chuoi_(kq.data.MANAGER_QUESTIONS),
    TRANG_THAI: 'CHO_DUYET',
    NGUOI_NHAN: chuoi_(cauHinh_('EMAIL_NGUOI_NHAN', ''))
  });
  ghiNhatKy_('4. สร้างความเห็นด้วย AI', ky.ma, 'OK', 'สร้างร่างรายงานแล้ว', maBaoCao);

  return {
    ok: true, maBaoCao: maBaoCao,
    thongBao: 'สร้างร่าง ' + maBaoCao + ' แล้ว สถานะ “' + trangThaiHienThi_('CHO_DUYET') + '”\n\n' +
      'ขั้นตอนถัดไป: อ่านความคิดเห็นทั้ง 4 ส่วน แก้ไขเมื่อจำเป็น แล้วกรอก “' + nhanCot_('NGUOI_DUYET') +
      '” และ “' + nhanCot_('NGAY_DUYET') + '” ก่อนเปลี่ยน “' + nhanCot_('TRANG_THAI') + '” เป็น “' +
      trangThaiHienThi_('DA_DUYET_GUI') + '” ระบบจะไม่อนุมัติแทนคุณ'
  };
}

function rutGonChiSo_(c) {
  return {
    new_leads: c.KHACH_TIEM_NANG_MOI, contacted_leads: c.KHACH_DA_LIEN_HE, appointments: c.CUOC_HEN,
    successful_orders: c.DON_THANH_CONG, recorded_sales_thb: c.DOANH_THU_GHI_NHAN,
    cash_received_thb: c.TIEN_THUC_THU, cancelled_orders: c.DON_HUY, returned_orders: c.DON_HOAN,
    contact_rate_percent: c.TY_LE_LIEN_HE, close_rate_percent: c.TY_LE_CHOT,
    cancellation_rate_percent: c.TY_LE_HUY, return_rate_percent: c.TY_LE_HOAN
  };
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
    throw new Error('ยังไม่มี API key กรุณาไปที่การตั้งค่าโปรเจกต์ → Script Properties แล้วเพิ่ม ' + TEN_THUOC_TINH_KHOA);
  }
  return k;
}

function moTaLoiApi_(ma, than) {
  if (ma === 401) return 'ข้อผิดพลาด 401: API key ไม่ถูกต้องหรือถูกเพิกถอนแล้ว';
  if (ma === 429) return 'ข้อผิดพลาด 429: โควตาหมดหรือเรียกถี่เกินไป กรุณาตรวจ Billing ของ OpenAI';
  if (ma === 404) return 'ข้อผิดพลาด 404: ชื่อโมเดลไม่ถูกต้อง กรุณาตรวจค่า MODEL ในชีต “' + T.CAU_HINH + '”';
  if (ma === 400) return 'ข้อผิดพลาด 400: โครงสร้างคำขอไม่ถูกต้อง ' + String(than).slice(0, 400);
  return 'ข้อผิดพลาด HTTP ' + ma + ': ' + String(than).slice(0, 400);
}

/** โครงสร้างผลลัพธ์ 4 ส่วน ทุกส่วนจำเป็นและไม่อนุญาตฟิลด์เพิ่มเติม */
function luocDoNhanXet_() {
  return {
    type: 'object',
    properties: {
      OVERVIEW: { type: 'string' },
      WARNINGS: { type: 'string' },
      RECOMMENDED_ACTIONS: { type: 'string' },
      MANAGER_QUESTIONS: { type: 'string' }
    },
    required: ['OVERVIEW', 'WARNINGS', 'RECOMMENDED_ACTIONS', 'MANAGER_QUESTIONS'],
    additionalProperties: false
  };
}

/** เรียก OpenAI Responses API และบังคับผลลัพธ์ตาม JSON schema */
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
        name: 'weekly_sales_commentary',
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
      tho: 'คำตอบถูกตัดเพราะถึงขีดจำกัด โปรดเพิ่ม MAX_OUTPUT_TOKENS ในชีต “' + T.CAU_HINH + '”\n' + than
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

/** อ่านข้อความจากผลลัพธ์ทุกส่วน เพราะโมเดลที่มีการให้เหตุผลอาจไม่ตอบในรายการแรก */
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

/* ---------------- เมนู 5 — ส่งรายงานที่อนุมัติแล้ว ---------------------- */

function m05_GuiBaoCaoDaDuyet() {
  const kq = guiBaoCaoDaDuyet_();
  thongBao_('ส่งรายงานที่อนุมัติแล้ว', kq.thongBao);
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
        return { ok: false, thongBao: ma + ': สถานะปัจจุบันคือ “' + (tt ? trangThaiHienThi_(tt) : 'ว่าง') +
          '” ส่งได้เฉพาะสถานะ “' + trangThaiHienThi_('DA_DUYET_GUI') + '”' };
      }
      continue;
    }
    if (String(b.rows[i][b.h.NGAY_GUI] || '').trim()) {
      ket.push(ma + ': ส่งไปแล้ว ระบบจึงไม่ส่งซ้ำ');
      continue;
    }
    if (!String(b.rows[i][b.h.NGUOI_DUYET] || '').trim()) {
      ket.push(ma + ': ยังไม่ได้กรอก “' + nhanCot_('NGUOI_DUYET') + '” จึงยังไม่ส่ง');
      continue;
    }
    if (daGui >= tran) { ket.push('ถึงขีดจำกัด ' + tran + ' รายงานต่อรอบแล้ว ระบบหยุดส่ง'); break; }

    const dsNhan = String(b.rows[i][b.h.NGUOI_NHAN] || cauHinh_('EMAIL_NGUOI_NHAN', ''))
      .split(',').map(function (s) { return s.trim(); }).filter(String);
    const sai = dsNhan.filter(function (e) { return !hopLeEmail_(e); });
    if (!dsNhan.length || sai.length) {
      ket.push(ma + ': อีเมลผู้รับว่างหรือรูปแบบไม่ถูกต้อง (' + sai.join(', ') + ') จึงยังไม่ส่ง');
      ghiNhatKy_('5. ส่งรายงาน', String(b.rows[i][b.h.MA_TUAN]), 'CANH_BAO', 'อีเมลไม่ถูกต้อง: ' + sai.join(', '), ma);
      continue;
    }

    const maTuan = String(b.rows[i][b.h.MA_TUAN]).trim();
    const chiSo = docDongChiSo_(maTuan) || {};
    const noiDung = dungNoiDungEmail_(b, i, chiSo);

    MailApp.sendEmail(dsNhan.join(','), noiDung.tieuDe, noiDung.than);
    b.sh.getRange(i + 2, b.h.TRANG_THAI + 1).setValue(trangThaiHienThi_('DA_GUI'));
    b.sh.getRange(i + 2, b.h.NGAY_GUI + 1).setValue(mui_());
    ghiNhatKy_('5. ส่งรายงาน', maTuan, 'OK', 'ส่งให้ ' + dsNhan.join(', '), ma);
    ket.push(ma + ': ส่งให้ ' + dsNhan.join(', ') + ' แล้ว');
    daGui++;
  }

  if (!ket.length) {
    return { ok: false, thongBao: 'ไม่มีรายงานที่มีสถานะ “' + trangThaiHienThi_('DA_DUYET_GUI') +
      '”\n\nระบบจะส่งรายงานหลังจากคุณตรวจและอนุมัติด้วยตนเองเท่านั้น' };
  }
  return { ok: true, thongBao: ket.join('\n') };
}

function dungNoiDungEmail_(b, i, chiSo) {
  const thay = {
    '{{REPORT_ID}}': String(b.rows[i][b.h.MA_BAO_CAO] || ''),
    '{{WEEK_ID}}': String(b.rows[i][b.h.MA_TUAN] || ''),
    '{{BUSINESS_NAME}}': chuoi_(cauHinh_('TEN_DOANH_NGHIEP', '')),
    '{{FROM_DATE}}': ngayText_(chiSo.TU_NGAY),
    '{{TO_DATE}}': ngayText_(chiSo.DEN_NGAY),
    '{{OVERVIEW}}': String(b.rows[i][b.h.TONG_QUAN] || ''),
    '{{WARNINGS}}': String(b.rows[i][b.h.CANH_BAO] || ''),
    '{{RECOMMENDED_ACTIONS}}': String(b.rows[i][b.h.HANH_DONG_DE_XUAT] || ''),
    '{{MANAGER_QUESTIONS}}': String(b.rows[i][b.h.CAU_HOI_CHO_QUAN_LY] || ''),
    '{{KPI_TABLE}}': bangChiSoDangChu_(chiSo),
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
    tieuDe: ap(chuoi_(cauHinh_('EMAIL_TIEU_DE', 'รายงานยอดขายรายสัปดาห์'))),
    than: ap(chuoi_(cauHinh_('EMAIL_NOI_DUNG', '')))
  };
}

function bangChiSoDangChu_(c) {
  function d(n) { return (so_(n) === null ? '' : so_(n).toLocaleString('th-TH')); }
  return [
    'ลูกค้าเป้าหมายใหม่: ' + d(c.KHACH_TIEM_NANG_MOI),
    'ติดต่อแล้ว: ' + d(c.KHACH_DA_LIEN_HE) + ' (อัตราการติดต่อ ' + c.TY_LE_LIEN_HE + '%)',
    'นัดหมาย: ' + d(c.CUOC_HEN),
    'คำสั่งซื้อสำเร็จ: ' + d(c.DON_THANH_CONG) + ' (อัตราปิดการขาย ' + c.TY_LE_CHOT + '%)',
    'ยอดขายที่บันทึก: ' + d(c.DOANH_THU_GHI_NHAN) + ' บาท',
    'เงินรับจริง: ' + d(c.TIEN_THUC_THU) + ' บาท (เทียบเป้าหมาย ' + c.MUC_DAT_KPI + '%)',
    'ยกเลิก: ' + d(c.DON_HUY) + ' — คืนสินค้า: ' + d(c.DON_HOAN),
    String(c.SO_SANH_TUAN_TRUOC || '')
  ].join('\n');
}

/* ------------------ เมนู 6 — ตรวจสอบการเชื่อมต่อ API -------------------- */

function m06_KiemTraKetNoiAPI() {
  const ui = SpreadsheetApp.getUi();
  let khoa;
  try { khoa = layKhoaAPI_(); } catch (e) {
    ui.alert('ตรวจสอบการเชื่อมต่อ API', e.message, ui.ButtonSet.OK);
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
    ketLuan = 'เชื่อมต่อสำเร็จ\nโมเดล: ' + model + '\nAPI: Responses API';
  } else if (ma === 401) {
    ketLuan = 'API KEY ไม่ถูกต้อง (401)\nค่า ' + TEN_THUOC_TINH_KHOA +
      ' ไม่ถูกต้องหรือถูกเพิกถอน กรุณาสร้างคีย์ใหม่แล้วบันทึกอีกครั้ง';
  } else if (ma === 429) {
    ketLuan = 'โควตาไม่เพียงพอ (429)\nบัญชีหมดโควตาหรือเรียกถี่เกินไป กรุณาตรวจ Billing ของ OpenAI';
  } else if (ma === 404) {
    ketLuan = 'ชื่อโมเดลไม่ถูกต้อง (404)\nโมเดล “' + model + '” ไม่มีอยู่หรือบัญชียังไม่มีสิทธิ์ใช้ ' +
      'กรุณาแก้ค่า MODEL ในชีต “' + T.CAU_HINH + '”';
  } else {
    ketLuan = 'ข้อผิดพลาดอื่น (' + ma + ')\n' + than.slice(0, 700);
  }
  ghiNhatKy_('6. ตรวจสอบการเชื่อมต่อ API', '', ma === 200 ? 'OK' : 'LOI', ketLuan);
  ui.alert('ตรวจสอบการเชื่อมต่อ API', ketLuan, ui.ButtonSet.OK);
}

/* ------------------ เมนู 7 — ตั้งเวลาทำงานอัตโนมัติ --------------------- */

function m07_DatLichChayTuDong() {
  const daCo = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'chayTheoLich';
  });
  if (daCo) {
    thongBao_('ตั้งเวลาทำงานอัตโนมัติ', 'มีทริกเกอร์นี้อยู่แล้ว ระบบจึงไม่สร้างซ้ำ\n\nดูหรือลบได้ที่เมนูทริกเกอร์ใน Apps Script');
    return;
  }
  ScriptApp.newTrigger('chayTheoLich').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(17).create();
  ghiNhatKy_('7. ตั้งเวลาทำงานอัตโนมัติ', '', 'OK', 'สร้างทริกเกอร์วันศุกร์ช่วง 17:00 น.');
  thongBao_('ตั้งเวลาทำงานอัตโนมัติ',
    'สร้างทริกเกอร์ช่วงเย็นวันศุกร์แล้ว\n\n' +
    'Google จะเรียกทำงานระหว่าง 17:00–18:00 น. ตามเขตเวลาของโปรเจกต์ ไม่รับประกันนาทีที่แน่นอน\n' +
    'ระบบจะสร้างร่างและหยุดที่สถานะ “' + trangThaiHienThi_('CHO_DUYET') + '” คุณยังต้องกดส่งจากเมนู 5\n\n' +
    'หาก REPORTING_PERIOD เป็นวันที่คงที่ ระบบจะข้ามงานตามเวลา เพื่อป้องกันการสร้างรายงานสัปดาห์เก่าซ้ำ ' +
    'เปลี่ยนกลับเป็น “สัปดาห์ปัจจุบัน” เมื่อต้องการใช้ทริกเกอร์');
}

/** ฟังก์ชันสำหรับทริกเกอร์ ไม่เปิดกล่องโต้ตอบและบันทึกผลลงชีตบันทึกระบบ */
function chayTheoLich() {
  // วันที่คงที่ใช้สำหรับเรียกข้อมูลย้อนหลังด้วยตนเอง จึงต้องข้ามงานตามเวลา
  const gtKy = giaTriKyBaoCao_();
  if (ngayTuChuoiISO_(gtKy)) {
    ghiNhatKy_('ทำงานตามเวลา', gtKy, 'BO_QUA',
      'REPORTING_PERIOD กำหนดเป็นวันที่คงที่ ' + gtKy + ' จึงข้ามการทำงานอัตโนมัติ ' +
      'เปลี่ยนเป็น “สัปดาห์ปัจจุบัน” ในชีต “' + T.CAU_HINH + '” เพื่อเปิดใช้งานอีกครั้ง');
    return;
  }

  const ky = kyBaoCao_();
  try {
    const kiem = kiemTraDuLieu_(ky);
    if (!kiem.dat) {
      ghiNhatKy_('ทำงานตามเวลา', ky.ma, 'CAN_SUA_DU_LIEU', kiem.tomTat);
      baoLoiChoNguoiPhuTrach_(ky, kiem.tomTat);
      return;
    }
    const tinh = tinhChiSo_(ky);
    if (!tinh.ok) {
      ghiNhatKy_('ทำงานตามเวลา', ky.ma, 'DUNG', tinh.thongBao);
      baoLoiChoNguoiPhuTrach_(ky, tinh.thongBao);
      return;
    }
    const nhanXet = taoNhanXet_(ky);
    ghiNhatKy_('ทำงานตามเวลา', ky.ma, nhanXet.ok ? 'OK' : 'LOI', nhanXet.thongBao, nhanXet.maBaoCao);
    if (!nhanXet.ok) baoLoiChoNguoiPhuTrach_(ky, nhanXet.thongBao);
  } catch (e) {
    ghiNhatKy_('ทำงานตามเวลา', ky.ma, 'LOI', e.message);
    baoLoiChoNguoiPhuTrach_(ky, e.message);
  }
}

function baoLoiChoNguoiPhuTrach_(ky, noiDung) {
  const nhan = String(cauHinh_('EMAIL_NGUOI_NHAN', '')).split(',')[0].trim();
  if (!hopLeEmail_(nhan)) return;
  try {
    MailApp.sendEmail(nhan, 'ยังสร้างรายงานสัปดาห์ ' + ky.ma + ' ไม่สำเร็จ',
      'ระบบทำงานตามเวลาแล้วแต่ยังสร้างรายงานไม่สำเร็จ\n\n' + noiDung +
      '\n\nยังไม่มีการส่งรายงาน โปรดดูรายละเอียดในชีต “' + T.NHAT_KY + '”');
  } catch (e) {
    ghiNhatKy_('แจ้งข้อผิดพลาดให้ผู้รับผิดชอบ', ky.ma, 'LOI', e.message);
  }
}
