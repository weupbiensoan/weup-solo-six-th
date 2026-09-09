/** WEUP SoloSix — โมเดล 4: ฟังก์ชันฝั่งเซิร์ฟเวอร์ของแดชบอร์ด */

function moBangDieuKhien() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(1120).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'แดชบอร์ด — รายงานยอดขายรายสัปดาห์');
}

/* ------------------------- DỮ LIỆU CHO GIAO DIỆN ------------------------- */

function layDuLieuBangDieuKhien() {
  const ky = kyBaoCao_();
  const kiem = kiemTraDuLieu_(ky);
  const chiSo = docDongChiSo_(ky.ma);
  const baoCao = docBaoCao_(ky.ma);

  return {
    capNhatLuc: Utilities.formatDate(new Date(), muiGio_(), 'HH:mm:ss'),
    ky: {
      ma: ky.ma,
      tuNgay: ngayText_(ky.batDau),
      denNgay: ngayText_(ky.ketThuc),
      cachTinh: String(cauHinh_('KY_BAO_CAO', 'TUAN_HIEN_TAI'))
    },
    kpi: gomKpi_(kiem, chiSo, baoCao),
    canhBao: gomCanhBao_(),
    nguon: gomNguonDuLieu_(),
    duLieu: {
      dat: kiem.dat,
      soDong: kiem.dong.length,
      ngoaiKy: kiem.ngoaiKy || 0,
      tyLeTrong: kiem.tyLeTrong,
      loi: kiem.loi.slice(0, 12),
      tongLoi: kiem.loi.length,
      trong: 'ยังไม่มีข้อมูลในรอบนี้ กรุณากรอกข้อมูลในชีต “' + T.DU_LIEU + '”'
    },
    chiSo: chiSo ? gomChiSo_(chiSo) : null,
    baoCao: baoCao ? {
      ma: String(baoCao.MA_BAO_CAO),
      trangThai: String(baoCao.TRANG_THAI || ''),
      trangThaiHienThi: trangThaiHienThi_(baoCao.TRANG_THAI || ''),
      nguoiDuyet: String(baoCao.NGUOI_DUYET || ''),
      ngayGui: ngayText_(baoCao.NGAY_GUI),
      nguoiNhan: String(baoCao.NGUOI_NHAN || ''),
      tongQuan: String(baoCao.TONG_QUAN || ''),
      canhBao: String(baoCao.CANH_BAO || ''),
      hanhDong: String(baoCao.HANH_DONG_DE_XUAT || ''),
      cauHoi: String(baoCao.CAU_HOI_CHO_QUAN_LY || ''),
      jsonTho: String(baoCao.JSON_THO || '')
    } : null,
    viecTiepTheo: viecTiepTheo_(kiem, chiSo, baoCao),
    nhacNho: [
      { viec: 'แก้ข้อมูลต้นทางเมื่อระบบแจ้งข้อผิดพลาด', vi: 'ระบบไม่แก้ตัวเลขของลูกค้าโดยอัตโนมัติ แต่จะแจ้งแถวและคอลัมน์ที่ต้องแก้' },
      { viec: 'อ่านและอนุมัติความคิดเห็น', vi: 'ไม่มีฟังก์ชันใดเปลี่ยนสถานะเป็น “' + trangThaiHienThi_('DA_DUYET_GUI') + '” โดยอัตโนมัติ' },
      { viec: 'ตัดสินใจเมื่อพบตัวเลขผิดปกติ', vi: 'AI อธิบายการเปลี่ยนแปลงเท่านั้น ไม่สรุปสาเหตุและไม่เสนอรางวัลหรือบทลงโทษ' }
    ]
  };
}

function gomNguonDuLieu_() {
  const id = String(cauHinh_('ID_FILE_KHACH', '')).trim();
  if (!id) {
    return { noi: 'ชีต “' + T.DU_LIEU + '” ในไฟล์นี้', id: '', ten: '',
      chu: 'ยังไม่ได้เชื่อมไฟล์ลูกค้า วางลิงก์ด้านล่างเพื่อให้ระบบอ่านข้อมูลโดยตรงโดยไม่ต้องคัดลอก' };
  }
  let ten = '';
  try { ten = SpreadsheetApp.openById(id).getName(); } catch (e) { ten = ''; }
  return {
    noi: ten ? ('ไฟล์ลูกค้า: ' + ten) : 'ไฟล์ลูกค้า (ไม่สามารถเปิดได้)',
    id: id, ten: ten,
    chu: ten ? 'ระบบจะอ่านไฟล์นี้ทุกครั้งที่ทำงาน ลูกค้าเป็นผู้กรอก คุณไม่ต้องคัดลอกข้อมูล'
      : 'ไม่สามารถเปิดไฟล์จากรหัสที่บันทึกไว้ กรุณาตรวจสิทธิ์แชร์หรือวางลิงก์ใหม่'
  };
}

function gomKpi_(kiem, chiSo, baoCao) {
  const kpi = Number(cauHinh_('KPI_TUAN', 0)) || 0;
  return [
    {
      nhan: 'เงินรับจริงสัปดาห์นี้',
      so: chiSo ? Number(chiSo.TIEN_THUC_THU) || 0 : 0,
      kieu: 'tien',
      chu: chiSo ? ('ทำได้ ' + chiSo.MUC_DAT_KPI + '% จากเป้าหมาย ' + kpi.toLocaleString('th-TH') + ' บาท')
        : 'ยังไม่ได้คำนวณ กรุณาเรียกเมนู 3'
    },
    {
      nhan: 'อัตราปิดการขาย',
      so: chiSo ? (chiSo.TY_LE_CHOT + '%') : '—',
      kieu: 'chuoi',
      chu: chiSo ? ((chiSo.DON_THANH_CONG || 0) + ' คำสั่งซื้อสำเร็จ จาก ' + (chiSo.KHACH_DA_LIEN_HE || 0) + ' รายที่ติดต่อแล้ว')
        : 'ยังไม่ได้คำนวณ'
    },
    {
      nhan: 'สถานะข้อมูล',
      so: kiem.dat ? trangThaiHienThi_('DAT') : trangThaiHienThi_('CAN_SUA_DU_LIEU'),
      kieu: 'chuoi',
      chu: kiem.dat ? (kiem.dong.length + ' แถวในรอบนี้ ช่องว่าง ' + kiem.tyLeTrong + '%')
        : (kiem.loi.length + ' ข้อผิดพลาดที่ต้องแก้ก่อนคำนวณ')
    },
    {
      nhan: 'สถานะรายงาน',
      so: baoCao ? trangThaiHienThi_(baoCao.TRANG_THAI || '') : 'ยังไม่ได้สร้าง',
      kieu: 'chuoi',
      chu: baoCao ? ('รหัส ' + baoCao.MA_BAO_CAO + (baoCao.NGAY_GUI ? ', ส่งเมื่อ ' + ngayText_(baoCao.NGAY_GUI) : ''))
        : 'เรียกเมนู 4 เพื่อสร้างร่าง'
    }
  ];
}

function gomChiSo_(c) {
  function n(v) { return so_(v) === null ? '' : so_(v); }
  return [
    { ten: 'ลูกค้าเป้าหมายใหม่', gt: n(c.KHACH_TIEM_NANG_MOI), donVi: '' },
    { ten: 'ติดต่อแล้ว', gt: n(c.KHACH_DA_LIEN_HE), donVi: ' (' + c.TY_LE_LIEN_HE + '%)' },
    { ten: 'นัดหมาย', gt: n(c.CUOC_HEN), donVi: '' },
    { ten: 'คำสั่งซื้อสำเร็จ', gt: n(c.DON_THANH_CONG), donVi: ' (' + c.TY_LE_CHOT + '%)' },
    { ten: 'ยอดขายที่บันทึก', gt: n(c.DOANH_THU_GHI_NHAN), donVi: ' บาท' },
    { ten: 'เงินรับจริง', gt: n(c.TIEN_THUC_THU), donVi: ' บาท' },
    { ten: 'ยกเลิก', gt: n(c.DON_HUY), donVi: ' (' + c.TY_LE_HUY + '%)' },
    { ten: 'คืนสินค้า', gt: n(c.DON_HOAN), donVi: ' (' + c.TY_LE_HOAN + '%)' },
    { ten: 'เทียบกับสัปดาห์ก่อน', gt: String(c.SO_SANH_TUAN_TRUOC || ''), donVi: '', dai: true }
  ];
}

function gomCanhBao_() {
  const ds = [];
  if (!PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA)) {
    ds.push({ nhan: 'ยังไม่ได้บันทึก API key', noiDung: 'เมนู 4 จะหยุดทำงาน กรุณาบันทึกคีย์ในส่วนการตั้งค่าด้านล่าง' });
  }
  const thieu = ['KPI_TUAN', 'EMAIL_NGUOI_NHAN', 'MODEL'].filter(function (k) {
    return String(cauHinh_(k, '')).trim() === '';
  });
  if (thieu.length) ds.push({ nhan: 'ชีต “' + T.CAU_HINH + '” ยังมีค่าที่จำเป็นว่างอยู่:', noiDung: thieu.map(khoaCauHinhCanonical_).join(', ') });

  try {
    const co = ScriptApp.getProjectTriggers().some(function (t) {
      return t.getHandlerFunction() === 'chayTheoLich';
    });
    if (!co) ds.push({ nhan: 'ยังไม่ได้ตั้งเวลาทำงานอัตโนมัติ', noiDung: 'ระบบจะทำงานเมื่อคุณกดเท่านั้น ใช้เมนู 7 เพื่อตั้งเวลาช่วงเย็นวันศุกร์' });
  } catch (e) { }

  const mg = muiGio_();
  if (mg.indexOf('Asia') < 0) {
    ds.push({ nhan: 'เขตเวลาปัจจุบันคือ ' + mg, noiDung: 'กรุณาตั้งเป็น Asia/Bangkok ในการตั้งค่าโปรเจกต์ เพื่อไม่ให้รอบรายงานคลาดเคลื่อน' });
  }
  return ds;
}

function viecTiepTheo_(kiem, chiSo, baoCao) {
  if (!kiem.dat) {
    return { viec: 'แก้ข้อมูลต้นทางตามรายการข้อผิดพลาดด้านล่าง แล้วตรวจสอบอีกครั้ง', hanhDong: 'KIEM_TRA', nhan: 'ตรวจสอบข้อมูลอีกครั้ง' };
  }
  if (!chiSo) {
    return { viec: 'ข้อมูลผ่านแล้ว คำนวณตัวชี้วัดสำหรับสัปดาห์นี้', hanhDong: 'TINH_CHI_SO', nhan: 'คำนวณตัวชี้วัด' };
  }
  if (!baoCao) {
    return { viec: 'มีตัวชี้วัดแล้ว สร้างร่างความคิดเห็นด้วย AI', hanhDong: 'TAO_NHAN_XET', nhan: 'สร้างความเห็นด้วย AI' };
  }
  const tt = String(baoCao.TRANG_THAI || '').trim();
  if (tt === 'CHO_DUYET') {
    return { viec: 'อ่านความคิดเห็นทั้ง 4 ส่วนด้านล่าง หากต้องแก้ข้อความให้เปิดชีต “' + T.BAO_CAO + '” เมื่อพร้อมแล้วกรอกชื่อและกดอนุมัติ', hanhDong: '', nhan: '' };
  }
  if (tt === 'DA_DUYET_GUI') {
    return { viec: 'รายงานได้รับอนุมัติแล้ว ส่งให้ผู้รับได้', hanhDong: 'GUI', nhan: 'ส่งรายงานที่อนุมัติแล้ว' };
  }
  if (tt === 'DA_GUI') {
    return { viec: 'ส่งรายงานของสัปดาห์นี้แล้ว ไม่มีงานค้าง', hanhDong: '', nhan: '' };
  }
  if (tt === 'LOI') {
    return { viec: 'การเรียก AI ครั้งก่อนผิดพลาด โปรดดูคอลัมน์ “' + nhanCot_('JSON_THO') + '” แก้สาเหตุ ลบแถวเดิม แล้วเรียกเมนู 4 อีกครั้ง หรือเขียนความคิดเห็นด้วยตนเอง', hanhDong: '', nhan: '' };
  }
  return { viec: 'ตรวจสถานะรายงานในชีต “' + T.BAO_CAO + '”', hanhDong: '', nhan: '' };
}

/* -------------------------- ปุ่มบนแดชบอร์ด ------------------------------- */

function chayHanhDong(hanhDong) {
  const ky = kyBaoCao_();
  try {
    if (hanhDong === 'KIEM_TRA') return kiemTraDuLieu_(ky).tomTat;
    if (hanhDong === 'TINH_CHI_SO') return tinhChiSo_(ky).thongBao;
    if (hanhDong === 'TAO_NHAN_XET') return taoNhanXet_(ky).thongBao;
    if (hanhDong === 'GUI') return guiBaoCaoDaDuyet_().thongBao;
    return 'ไม่รู้จักการดำเนินการ: ' + hanhDong;
  } catch (e) {
    ghiNhatKy_('แดชบอร์ด', ky.ma, 'LOI', hanhDong + ' | ' + e.message);
    return 'ข้อผิดพลาด: ' + e.message;
  }
}

/** จุดอนุมัติของมนุษย์ ฟังก์ชันอัตโนมัติจะไม่เรียกใช้งานส่วนนี้ */
function duyetBaoCao(maBaoCao, tenNguoiDuyet) {
  const ten = String(tenNguoiDuyet || '').trim();
  if (!ten) return 'ยังไม่ได้กรอกชื่อผู้อนุมัติ รายงานต้องระบุผู้รับผิดชอบอย่างชัดเจน';

  const b = docBang_(T.BAO_CAO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_BAO_CAO]).trim() !== String(maBaoCao).trim()) continue;
    const tt = String(b.rows[i][b.h.TRANG_THAI] || '').trim();
    if (tt !== 'CHO_DUYET') {
      return 'รายงานมีสถานะ “' + (tt ? trangThaiHienThi_(tt) : 'ว่าง') + '” อนุมัติได้เฉพาะสถานะ “' + trangThaiHienThi_('CHO_DUYET') + '”';
    }
    b.sh.getRange(i + 2, b.h.NGUOI_DUYET + 1).setValue(ten);
    b.sh.getRange(i + 2, b.h.NGAY_DUYET + 1).setValue(mui_());
    b.sh.getRange(i + 2, b.h.TRANG_THAI + 1).setValue(trangThaiHienThi_('DA_DUYET_GUI'));
    ghiNhatKy_('อนุมัติรายงาน', String(b.rows[i][b.h.MA_TUAN]), 'OK', 'ผู้อนุมัติ: ' + ten, maBaoCao);
    return 'อนุมัติ ' + maBaoCao + ' โดย ' + ten + ' แล้ว ตอนนี้สามารถกด “ส่งรายงานที่อนุมัติแล้ว” ได้';
  }
  return 'ไม่พบรายงาน ' + maBaoCao;
}

/** บันทึกลิงก์หรือรหัสไฟล์ข้อมูลลูกค้า */
function luuFileKhach(duongDan) {
  const v = String(duongDan || '').trim();
  if (!v) {
    datCauHinh_('ID_FILE_KHACH', '');
    return 'ลบการเชื่อมต่อแล้ว ระบบจะกลับไปอ่านชีต “' + T.DU_LIEU + '” ในไฟล์นี้';
  }
  const id = layIdTuDuongDan_(v);
  let ten;
  try {
    ten = SpreadsheetApp.openById(id).getName();
  } catch (e) {
    return 'ไม่สามารถเปิดไฟล์ได้ กรุณาตรวจลิงก์และตรวจว่าบัญชีนี้ได้รับสิทธิ์ดูไฟล์แล้ว';
  }
  datCauHinh_('ID_FILE_KHACH', id);
  ghiNhatKy_('การตั้งค่า', '', 'OK', 'เชื่อมไฟล์ข้อมูล: ' + ten);
  return 'เชื่อมกับไฟล์ “' + ten + '” แล้ว จากนี้ระบบจะอ่านไฟล์โดยตรงโดยไม่ต้องคัดลอกข้อมูล';
}

/** บันทึก API key ใน Script Properties เท่านั้น */
function luuKhoaAPI(khoa) {
  const k = String(khoa || '').trim();
  if (!k) return 'ยังไม่ได้กรอก API key';
  PropertiesService.getScriptProperties().setProperty(TEN_THUOC_TINH_KHOA, k);
  ghiNhatKy_('การตั้งค่า', '', 'OK', 'อัปเดต ' + TEN_THUOC_TINH_KHOA + ' แล้ว');
  return 'บันทึก API key ใน Script Properties แล้ว กรุณาเรียกเมนู 6 เพื่อตรวจสอบการเชื่อมต่อ';
}
