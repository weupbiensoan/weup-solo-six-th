/**
 * ============================================================================
 * BÁO CÁO BÁN HÀNG TUẦN — TỆP BẢNG ĐIỀU KHIỂN
 * ============================================================================
 */

function moBangDieuKhien() {
  const html = HtmlService.createHtmlOutputFromFile('bang_dieu_khien')
    .setWidth(1120).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'Bảng điều khiển — Báo cáo bán hàng tuần');
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
      trong: 'Chưa có dòng nào thuộc kỳ này. Dán dữ liệu vào trang DU_LIEU_NGAY.'
    },
    chiSo: chiSo ? gomChiSo_(chiSo) : null,
    baoCao: baoCao ? {
      ma: String(baoCao.MA_BAO_CAO),
      trangThai: String(baoCao.TRANG_THAI || ''),
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
      { viec: 'Sửa dữ liệu nguồn khi hệ thống báo lỗi', vi: 'Hệ thống không tự sửa số liệu của khách, chỉ chỉ ra dòng và cột sai.' },
      { viec: 'Đọc và duyệt phần nhận xét', vi: 'Không hàm nào tự đổi trạng thái sang DA_DUYET_GUI.' },
      { viec: 'Quyết định khi số liệu bất thường', vi: 'AI chỉ mô tả thay đổi, không kết luận nguyên nhân và không đề xuất thưởng phạt.' }
    ]
  };
}

function gomNguonDuLieu_() {
  const id = String(cauHinh_('ID_FILE_KHACH', '')).trim();
  if (!id) {
    return { noi: 'Trang DU_LIEU_NGAY trong tệp này', id: '', ten: '',
      chu: 'Chưa nối tệp của khách. Dán đường dẫn tệp của khách vào ô bên dưới để mã tự đọc, khỏi phải chép tay.' };
  }
  let ten = '';
  try { ten = SpreadsheetApp.openById(id).getName(); } catch (e) { ten = ''; }
  return {
    noi: ten ? ('Tệp của khách: ' + ten) : 'Tệp của khách (không mở được)',
    id: id, ten: ten,
    chu: ten ? 'Mã tự đọc tệp này mỗi lần chạy. Khách nhập, bạn không phải chép gì.'
      : 'Không mở được tệp theo ID đang lưu. Kiểm tra quyền chia sẻ hoặc dán lại đường dẫn.'
  };
}

function gomKpi_(kiem, chiSo, baoCao) {
  const kpi = Number(cauHinh_('KPI_TUAN', 0)) || 0;
  return [
    {
      nhan: 'Tiền thực thu tuần này',
      so: chiSo ? Number(chiSo.TIEN_THUC_THU) || 0 : 0,
      kieu: 'tien',
      chu: chiSo ? ('Đạt ' + chiSo.MUC_DAT_KPI + ' phần trăm KPI ' + kpi.toLocaleString('vi-VN') + ' đồng')
        : 'Chưa tính. Chạy mục 3 để có số liệu.'
    },
    {
      nhan: 'Tỷ lệ chốt',
      so: chiSo ? (chiSo.TY_LE_CHOT + '%') : '—',
      kieu: 'chuoi',
      chu: chiSo ? ((chiSo.DON_THANH_CONG || 0) + ' đơn thành công trên ' + (chiSo.KHACH_DA_LIEN_HE || 0) + ' khách đã liên hệ')
        : 'Chưa tính'
    },
    {
      nhan: 'Trạng thái dữ liệu',
      so: kiem.dat ? 'ĐẠT' : 'CẦN SỬA',
      kieu: 'chuoi',
      chu: kiem.dat ? (kiem.dong.length + ' dòng thuộc kỳ này, ô trống ' + kiem.tyLeTrong + ' phần trăm')
        : (kiem.loi.length + ' lỗi phải sửa trước khi tính chỉ số')
    },
    {
      nhan: 'Trạng thái báo cáo',
      so: baoCao ? String(baoCao.TRANG_THAI || '') : 'CHƯA TẠO',
      kieu: 'chuoi',
      chu: baoCao ? ('Mã ' + baoCao.MA_BAO_CAO + (baoCao.NGAY_GUI ? ', đã gửi ' + ngayText_(baoCao.NGAY_GUI) : ''))
        : 'Chạy mục 4 để tạo dự thảo'
    }
  ];
}

function gomChiSo_(c) {
  function n(v) { return so_(v) === null ? '' : so_(v); }
  return [
    { ten: 'Khách tiềm năng mới', gt: n(c.KHACH_TIEM_NANG_MOI), donVi: '' },
    { ten: 'Khách đã liên hệ', gt: n(c.KHACH_DA_LIEN_HE), donVi: ' (' + c.TY_LE_LIEN_HE + '%)' },
    { ten: 'Cuộc hẹn', gt: n(c.CUOC_HEN), donVi: '' },
    { ten: 'Đơn thành công', gt: n(c.DON_THANH_CONG), donVi: ' (' + c.TY_LE_CHOT + '%)' },
    { ten: 'Doanh thu ghi nhận', gt: n(c.DOANH_THU_GHI_NHAN), donVi: ' đ' },
    { ten: 'Tiền thực thu', gt: n(c.TIEN_THUC_THU), donVi: ' đ' },
    { ten: 'Đơn hủy', gt: n(c.DON_HUY), donVi: ' (' + c.TY_LE_HUY + '%)' },
    { ten: 'Đơn hoàn', gt: n(c.DON_HOAN), donVi: ' (' + c.TY_LE_HOAN + '%)' },
    { ten: 'So với tuần trước', gt: String(c.SO_SANH_TUAN_TRUOC || ''), donVi: '', dai: true }
  ];
}

function gomCanhBao_() {
  const ds = [];
  if (!PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA)) {
    ds.push({ nhan: 'Chưa lưu khóa API.', noiDung: 'Mục 4 sẽ dừng ngay khi bấm chạy. Lưu khóa ở khối Cài đặt cuối trang.' });
  }
  const thieu = ['KPI_TUAN', 'EMAIL_NGUOI_NHAN', 'MODEL'].filter(function (k) {
    return String(cauHinh_(k, '')).trim() === '';
  });
  if (thieu.length) ds.push({ nhan: 'Trang CAU_HINH còn trống:', noiDung: thieu.join(', ') + '.' });

  try {
    const co = ScriptApp.getProjectTriggers().some(function (t) {
      return t.getHandlerFunction() === 'chayTheoLich';
    });
    if (!co) ds.push({ nhan: 'Chưa đặt lịch chạy tự động.', noiDung: 'Hệ thống chỉ chạy khi bạn bấm tay. Dùng mục 7 để đặt lịch chiều thứ Sáu.' });
  } catch (e) { }

  const mg = muiGio_();
  if (mg.indexOf('Asia') < 0) {
    ds.push({ nhan: 'Múi giờ đang là ' + mg + '.', noiDung: 'Đặt lại về Asia/Bangkok hoặc Asia/Ho_Chi_Minh trong Cài đặt dự án, nếu không kỳ báo cáo sẽ lệch ngày.' });
  }
  return ds;
}

function viecTiepTheo_(kiem, chiSo, baoCao) {
  if (!kiem.dat) {
    return { viec: 'Sửa dữ liệu nguồn theo danh sách lỗi bên dưới, rồi kiểm tra lại.', hanhDong: 'KIEM_TRA', nhan: 'Kiểm tra lại dữ liệu' };
  }
  if (!chiSo) {
    return { viec: 'Dữ liệu đã đạt. Tính chỉ số cho tuần này.', hanhDong: 'TINH_CHI_SO', nhan: 'Tính chỉ số tuần' };
  }
  if (!baoCao) {
    return { viec: 'Đã có chỉ số. Tạo dự thảo nhận xét bằng AI.', hanhDong: 'TAO_NHAN_XET', nhan: 'Tạo nhận xét bằng AI' };
  }
  const tt = String(baoCao.TRANG_THAI || '').trim();
  if (tt === 'CHO_DUYET') {
    return { viec: 'Đọc bốn phần nhận xét bên dưới. Muốn sửa câu chữ thì mở trang BAO_CAO_AI. Đồng ý rồi thì gõ tên bạn vào ô duyệt ở khối Báo cáo và bấm Duyệt.', hanhDong: '', nhan: '' };
  }
  if (tt === 'DA_DUYET_GUI') {
    return { viec: 'Báo cáo đã được duyệt. Gửi cho người nhận.', hanhDong: 'GUI', nhan: 'Gửi báo cáo đã duyệt' };
  }
  if (tt === 'DA_GUI') {
    return { viec: 'Đã gửi xong tuần này. Không còn việc phải làm.', hanhDong: '', nhan: '' };
  }
  if (tt === 'LOI') {
    return { viec: 'Lần gọi AI trước bị lỗi. Đọc cột JSON_THO, sửa nguyên nhân rồi xóa dòng và chạy lại mục 4. Hoặc tự viết nhận xét tay vào bốn cột.', hanhDong: '', nhan: '' };
  }
  return { viec: 'Kiểm tra trạng thái báo cáo ở trang BAO_CAO_AI.', hanhDong: '', nhan: '' };
}

/* ---------------------- NÚT TRÊN BẢNG ĐIỀU KHIỂN ------------------------- */

function chayHanhDong(hanhDong) {
  const ky = kyBaoCao_();
  try {
    if (hanhDong === 'KIEM_TRA') return kiemTraDuLieu_(ky).tomTat;
    if (hanhDong === 'TINH_CHI_SO') return tinhChiSo_(ky).thongBao;
    if (hanhDong === 'TAO_NHAN_XET') return taoNhanXet_(ky).thongBao;
    if (hanhDong === 'GUI') return guiBaoCaoDaDuyet_().thongBao;
    return 'Không rõ hành động: ' + hanhDong;
  } catch (e) {
    ghiNhatKy_('Bảng điều khiển', ky.ma, 'LOI', hanhDong + ' | ' + e.message);
    return 'Lỗi: ' + e.message;
  }
}

/**
 * Người quản lý duyệt báo cáo từ bảng điều khiển.
 * Đây là điểm duy nhất trong dự án được ghi vào NGUOI_DUYET, NGAY_DUYET và
 * đổi trạng thái sang DA_DUYET_GUI, và chỉ chạy khi có người bấm nút kèm tên.
 * Không hàm tự động nào gọi hàm này.
 */
function duyetBaoCao(maBaoCao, tenNguoiDuyet) {
  const ten = String(tenNguoiDuyet || '').trim();
  if (!ten) return 'Chưa nhập tên người duyệt. Báo cáo phải ghi rõ ai chịu trách nhiệm.';

  const b = docBang_(T.BAO_CAO);
  for (let i = 0; i < b.rows.length; i++) {
    if (String(b.rows[i][b.h.MA_BAO_CAO]).trim() !== String(maBaoCao).trim()) continue;
    const tt = String(b.rows[i][b.h.TRANG_THAI] || '').trim();
    if (tt !== 'CHO_DUYET') {
      return 'Báo cáo đang ở trạng thái ' + (tt || 'trống') + ', chỉ duyệt được khi CHO_DUYET.';
    }
    b.sh.getRange(i + 2, b.h.NGUOI_DUYET + 1).setValue(ten);
    b.sh.getRange(i + 2, b.h.NGAY_DUYET + 1).setValue(mui_());
    b.sh.getRange(i + 2, b.h.TRANG_THAI + 1).setValue('DA_DUYET_GUI');
    ghiNhatKy_('Duyệt báo cáo', String(b.rows[i][b.h.MA_TUAN]), 'OK', 'Người duyệt: ' + ten, maBaoCao);
    return 'Đã duyệt ' + maBaoCao + ' bởi ' + ten + '. Giờ bấm Gửi báo cáo đã duyệt.';
  }
  return 'Không tìm thấy báo cáo ' + maBaoCao + '.';
}

/** Lưu đường dẫn tệp dữ liệu của khách vào CAU_HINH. Nhận cả đường dẫn lẫn ID. */
function luuFileKhach(duongDan) {
  const v = String(duongDan || '').trim();
  if (!v) {
    datCauHinh_('ID_FILE_KHACH', '');
    return 'Đã xóa. Mã quay lại đọc trang DU_LIEU_NGAY trong chính tệp này.';
  }
  const id = layIdTuDuongDan_(v);
  let ten;
  try {
    ten = SpreadsheetApp.openById(id).getName();
  } catch (e) {
    return 'Không mở được tệp đó. Kiểm tra đường dẫn, và kiểm tra bạn đã được chia sẻ quyền xem chưa.';
  }
  datCauHinh_('ID_FILE_KHACH', id);
  ghiNhatKy_('Cài đặt', '', 'OK', 'Đã nối tệp dữ liệu: ' + ten);
  return 'Đã nối với tệp "' + ten + '". Từ giờ mã tự đọc tệp này, bạn không phải chép dữ liệu nữa.';
}

/** Lưu khóa API vào Script Properties. Khóa không vào bảng tính, không vào mã. */
function luuKhoaAPI(khoa) {
  const k = String(khoa || '').trim();
  if (!k) return 'Chưa nhập khóa.';
  PropertiesService.getScriptProperties().setProperty(TEN_THUOC_TINH_KHOA, k);
  ghiNhatKy_('Cài đặt', '', 'OK', 'Đã cập nhật ' + TEN_THUOC_TINH_KHOA);
  return 'Đã lưu khóa vào Script Properties. Chạy mục 6 để xác nhận kết nối.';
}