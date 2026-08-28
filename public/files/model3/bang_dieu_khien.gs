/**
 * ============================================================================
 * HỆ THỐNG SẢN PHẨM TRI THỨC — TỆP BẢNG ĐIỀU KHIỂN
 * Mở giao diện, gom dữ liệu và chạy đúng bước cho từng đơn.
 * ============================================================================
 */

function moBangDieuKhien() {
  const html = HtmlService.createHtmlOutputFromFile('bang_dieu_khien')
    .setWidth(1120)
    .setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'Bảng điều khiển — Hệ thống sản phẩm tri thức');
}

/* ------------------------- DỮ LIỆU CHO GIAO DIỆN ------------------------- */

function layDuLieuBangDieuKhien() {
  return {
    capNhatLuc: Utilities.formatDate(new Date(), ss_().getSpreadsheetTimeZone(), 'HH:mm:ss'),
    kpi: gomKpi_(),
    canhBao: gomCanhBao_(),
    sanXuat: gomTienDoSanXuat_(),
    chotDuyet: gomChotDuyet_(),
    donHang: gomDonHang_(),
    hoTro: gomChiSoHoTro_(),
    nhacNho: [
      { viec: 'Điền cột DUYET_NGUOI ở trang NGHIEN_CUU', vi: 'Máy không thay bạn quyết định nhu cầu nào đưa vào sản phẩm.' },
      { viec: 'Đổi trạng thái tài liệu ở trang TAI_LIEU', vi: 'Bốn trạng thái là bốn lần con người chịu trách nhiệm về nội dung.' },
      { viec: 'Dựng video trong CapCut', vi: 'Bảng chỉ giao kế hoạch cảnh, phần dựng nằm ngoài hệ thống.' }
    ]
  };
}

/* ------------------------- BỐN THẺ SỐ LIỆU ĐẦU TRANG --------------------- */

function gomKpi_() {
  const bd = docBang_(T.DON);
  const bt = docBang_(T.TAI_LIEU);
  const bm = docBang_(T.MODULE);
  const bb = docBang_(T.BAN_DO);
  const bn = docBang_(T.NGHIEN_CUU);
  const bth = docBang_(T.THU);

  let doanhThu = 0, donGhiNhan = 0, dangChay = 0, hoanThanh = 0, donMoi = 0;
  bd.rows.forEach(function (r) {
    const tt = String(r[bd.h.TRANG_THAI] || '').trim();
    if (['DA_THANH_TOAN', 'DA_CAP_QUYEN', 'DANG_HOC', 'HOAN_THANH'].indexOf(tt) >= 0) {
      doanhThu += Number(r[bd.h.GIA]) || 0;
      donGhiNhan++;
    }
    if (['DA_THANH_TOAN', 'DA_CAP_QUYEN', 'DANG_HOC'].indexOf(tt) >= 0) dangChay++;
    if (tt === 'HOAN_THANH') hoanThanh++;
    if (tt === 'MOI') donMoi++;
  });

  let daDuyetXuatBan = 0, tongTaiLieu = 0;
  bt.rows.forEach(function (r) {
    if (!String(r[bt.h.TEN] || '').trim()) return;
    tongTaiLieu++;
    if (String(r[bt.h.TRANG_THAI] || '').trim() === 'DA_DUYET_XUAT_BAN') daDuyetXuatBan++;
  });

  let soModule = 0;
  bm.rows.forEach(function (r) { if (String(r[bm.h.MA_MODULE] || '').trim()) soModule++; });
  let soDongBanDo = 0;
  bb.rows.forEach(function (r) { if (String(r[bb.h.CHU_DE] || '').trim()) soDongBanDo++; });

  let soNhuCau = 0, chuaDuyetNhom = 0;
  bn.rows.forEach(function (r) {
    if (!String(r[bn.h.NGUYEN_VAN_KH] || '').trim()) return;
    soNhuCau++;
    if (!String(r[bn.h.DUYET_NGUOI] || '').trim()) chuaDuyetNhom++;
  });

  let thuChuaXuLy = 0;
  bth.rows.forEach(function (r) {
    if (!String(r[bth.h.MA_THU] || '').trim()) return;
    if (String(r[bth.h.DA_XU_LY] || '').trim() !== 'CO') thuChuaXuLy++;
  });

  return [
    {
      nhan: 'Doanh thu đã ghi nhận',
      so: doanhThu, kieu: 'tien',
      chu: donGhiNhan + ' đơn, tính từ trạng thái DA_THANH_TOAN trở đi'
    },
    {
      nhan: 'Đơn đang chạy',
      so: dangChay, kieu: 'so',
      chu: hoanThanh + ' đơn đã hoàn thành, ' + donMoi + ' đơn còn ở MOI'
    },
    {
      nhan: 'Tài liệu đã duyệt xuất bản',
      so: daDuyetXuatBan + '/' + tongTaiLieu, kieu: 'chuoi',
      chu: soModule + ' module, ' + soDongBanDo + ' dòng bản đồ tri thức'
    },
    {
      nhan: 'Thư hỗ trợ chưa xử lý',
      so: thuChuaXuLy, kieu: 'so',
      chu: soNhuCau + ' dòng nhu cầu trong kho, ' + chuaDuyetNhom + ' dòng chưa duyệt nhóm'
    }
  ];
}

/* ------------------------------ DẢI CẢNH BÁO ----------------------------- */

function gomCanhBao_() {
  const ds = [];

  if (!PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_KHOA)) {
    ds.push({
      nhan: 'Chưa lưu khóa API.',
      noiDung: 'Các bước dùng AI (2, 3, 4, 5, 6, 12, 14) sẽ dừng ngay khi bấm chạy. Lưu khóa ở khối Cài đặt cuối trang.'
    });
  }

  const canCo = ['MODEL', 'ID_THU_MUC_TAI_LIEU', 'ID_THU_MUC_SAN_PHAM',
    'LINK_FORM_PHONG_VAN', 'LINK_FORM_PHAN_HOI', 'LINK_FORM_NGUOI_DUNG_THU'];
  const thieu = canCo.filter(function (k) { return String(cauHinh_(k, '')).trim() === ''; });
  if (thieu.length) {
    ds.push({ nhan: 'Trang CAU_HINH còn trống:', noiDung: thieu.join(', ') + '.' });
  }

  try {
    const coTrigger = ScriptApp.getProjectTriggers().some(function (t) {
      return t.getHandlerFunction() === 'xuLyBieuMauGui';
    });
    if (!coTrigger) {
      ds.push({
        nhan: 'Chưa có trình kích hoạt biểu mẫu.',
        noiDung: 'Câu trả lời sẽ nằm lại ở các trang RAW_ mà không sang NGHIEN_CUU, PHAN_HOI, NGUOI_DUNG_THU. Chạy mục 1 để tạo.'
      });
    }
  } catch (e) {
    // Không đọc được danh sách trình kích hoạt thì bỏ qua, không chặn bảng.
  }

  return ds;
}

/** Lưu khóa API vào Script Properties. Khóa không vào bảng tính, không vào mã. */
function luuKhoaAPI(khoa) {
  const k = String(khoa || '').trim();
  if (!k) return 'Chưa nhập khóa.';
  PropertiesService.getScriptProperties().setProperty(TEN_THUOC_TINH_KHOA, k);
  ghiNhatKy_('Cài đặt', 'OK', 'Đã cập nhật ' + TEN_THUOC_TINH_KHOA);
  return 'Đã lưu khóa vào Script Properties. Chạy "Kiểm tra kết nối API" để xác nhận.';
}

/* ------------------------- TIẾN ĐỘ VÀ CHỐT DUYỆT ------------------------- */

/** Tiến độ sản xuất theo bốn trạng thái tài liệu. */
function gomTienDoSanXuat_() {
  const b = docBang_(T.TAI_LIEU);
  const dem = {};
  DS.TRANG_THAI_TAI_LIEU.forEach(function (t) { dem[t] = 0; });
  let tong = 0;
  b.rows.forEach(function (r) {
    const t = String(r[b.h.TRANG_THAI] || '').trim();
    if (dem[t] !== undefined) { dem[t]++; tong++; }
  });
  return {
    tong: tong,
    muc: DS.TRANG_THAI_TAI_LIEU.map(function (t) { return { ten: t, so: dem[t] }; }),
    trong: 'Chưa có tài liệu nào. Bước 5 — Tạo bản đầu tài liệu cho một module — sẽ đổ dữ liệu vào khối này.'
  };
}

/** Bốn chốt duyệt: dòng nào đã qua, dòng nào còn chờ người. */
function gomChotDuyet_() {
  const kq = [];

  const bn = docBang_(T.NGHIEN_CUU);
  let nTong = 0, nQua = 0;
  bn.rows.forEach(function (r) {
    if (!String(r[bn.h.NGUYEN_VAN_KH] || '').trim()) return;
    nTong++;
    if (String(r[bn.h.DUYET_NGUOI] || '').trim()) nQua++;
  });
  kq.push({
    ten: 'Duyệt nhu cầu',
    cot: 'NGHIEN_CUU · DUYET_NGUOI',
    qua: nQua, tong: nTong,
    moKhoa: 'Bước 3 — Lập bản đồ tri thức',
    trong: 'Chưa có dòng nhu cầu nào. Bước 1 và bước 2 sẽ đổ dữ liệu vào đây.'
  });

  const bd = docBang_(T.BAN_DO);
  let dTong = 0, dQua = 0;
  bd.rows.forEach(function (r) {
    if (!String(r[bd.h.CHU_DE] || '').trim()) return;
    dTong++;
    if (String(r[bd.h.NGUON_DAN] || '').trim() &&
      String(r[bd.h.TRANG_THAI_NGUON] || '').trim() === 'DA_DUYET') dQua++;
  });
  kq.push({
    ten: 'Duyệt nguồn dẫn',
    cot: 'BAN_DO_TRI_THUC · TRANG_THAI_NGUON',
    qua: dQua, tong: dTong,
    moKhoa: 'Bước 5 — Tạo bản đầu tài liệu',
    trong: 'Chưa có dòng bản đồ nào. Bước 3 sẽ đổ dữ liệu vào đây.'
  });

  const bt = docBang_(T.TAI_LIEU);
  let tTong = 0, tQua = 0;
  bt.rows.forEach(function (r) {
    if (!String(r[bt.h.TEN] || '').trim()) return;
    tTong++;
    if (String(r[bt.h.TRANG_THAI] || '').trim() === 'DA_DUYET_XUAT_BAN' &&
      String(r[bt.h.NGUOI_DUYET] || '').trim() && String(r[bt.h.NGAY_DUYET] || '').trim()) tQua++;
  });
  kq.push({
    ten: 'Duyệt xuất bản',
    cot: 'TAI_LIEU · TRANG_THAI + NGUOI_DUYET + NGAY_DUYET',
    qua: tQua, tong: tTong,
    moKhoa: 'Bước 6 — Kế hoạch cảnh video và nạp cho trợ lý AI',
    trong: 'Chưa có tài liệu nào. Bước 5 sẽ đổ dữ liệu vào đây.'
  });

  const bo = docBang_(T.DON);
  let oCho = 0, oTong = 0;
  bo.rows.forEach(function (r) {
    const tt = String(r[bo.h.TRANG_THAI] || '').trim();
    if (!tt) return;
    oTong++;
    if (tt === 'DA_THANH_TOAN') oCho++;
  });
  kq.push({
    ten: 'Xác nhận thanh toán',
    cot: 'DON_HANG · TRANG_THAI',
    qua: oCho, tong: oTong,
    moKhoa: 'Bước 8 — Cấp quyền tài liệu',
    trong: 'Chưa có đơn nào. Bước 7 sẽ đổ dữ liệu vào đây.'
  });

  return kq;
}

/* ------------------------------- ĐƠN HÀNG -------------------------------- */

/** Xếp đơn theo sáu trạng thái, kèm việc tiếp theo và nút chạy đúng bước. */
function gomDonHang_() {
  const b = docBang_(T.DON);
  const nhom = {};
  DS.TRANG_THAI_DON.forEach(function (t) { nhom[t] = []; });
  let tong = 0;

  b.rows.forEach(function (r) {
    const tt = String(r[b.h.TRANG_THAI] || '').trim();
    if (!nhom[tt]) return;
    tong++;
    const don = {
      maDon: String(r[b.h.MA_DON] || ''),
      hoTen: String(r[b.h.HO_TEN] || ''),
      email: String(r[b.h.EMAIL] || ''),
      ngayCapQuyen: ngayText_(r[b.h.NGAY_CAP_QUYEN]),
      nhac3: ngayText_(r[b.h.NGAY_NHAC_3]),
      nhac7: ngayText_(r[b.h.NGAY_NHAC_7]),
      chaoMung: ngayText_(r[b.h.NGAY_GUI_CHAO_MUNG]),
      moc1: String(r[b.h.MOC_1_HOAN_THANH] || ''),
      ghiChu: String(r[b.h.GHI_CHU_HE_THONG] || '')
    };
    const vt = viecTiepTheo_(tt, don);
    don.viec = vt.viec;
    don.hanhDong = vt.hanhDong;
    don.nhanNut = vt.nhanNut;
    nhom[tt].push(don);
  });

  return {
    tong: tong,
    nhom: DS.TRANG_THAI_DON.map(function (t) { return { trangThai: t, don: nhom[t] }; }),
    trong: 'Chưa có đơn nào. Bước 7 — Ghi đơn — sẽ đổ dữ liệu vào khối này.'
  };
}

function viecTiepTheo_(trangThai, don) {
  const homNay = homNay_().getTime();

  if (trangThai === 'MOI') {
    return { viec: 'Xác nhận đã thu tiền, rồi chuyển đơn sang DA_THANH_TOAN.', hanhDong: 'DANH_DAU_THANH_TOAN', nhanNut: 'Đánh dấu đã thanh toán' };
  }
  if (trangThai === 'DA_THANH_TOAN') {
    return { viec: 'Cấp quyền xem thư mục tài liệu.', hanhDong: 'CAP_QUYEN', nhanNut: 'Cấp quyền tài liệu' };
  }
  if (trangThai === 'DA_CAP_QUYEN') {
    return { viec: 'Gửi email chào mừng kèm đường dẫn tài liệu.', hanhDong: 'GUI_CHAO_MUNG', nhanNut: 'Gửi email chào mừng' };
  }
  if (trangThai === 'DANG_HOC') {
    const gocNgay = ngayTuGiaTri_(don.ngayCapQuyen);
    const goc = gocNgay ? gocNgay.getTime() : 0;
    const moc3 = goc + 3 * 86400000;
    const moc7 = goc + 7 * 86400000;
    if (!don.nhac3 && goc && homNay >= moc3) {
      return { viec: 'Đến hạn nhắc mốc ngày 3.', hanhDong: 'NHAC_3', nhanNut: 'Gửi nhắc mốc ngày 3' };
    }
    if (!don.nhac3 && goc) {
      return { viec: 'Chưa đến mốc ngày 3 (hạn ' + ngayText_(new Date(moc3)) + ').', hanhDong: '', nhanNut: '' };
    }
    if (!don.nhac7 && goc && homNay >= moc7) {
      return { viec: 'Đến hạn nhắc mốc ngày 7.', hanhDong: 'NHAC_7', nhanNut: 'Gửi nhắc mốc ngày 7' };
    }
    if (!don.nhac7 && goc) {
      return { viec: 'Chưa đến mốc ngày 7 (hạn ' + ngayText_(new Date(moc7)) + ').', hanhDong: '', nhanNut: '' };
    }
    return {
      viec: 'Đã nhắc đủ hai mốc. Khi khách báo xong thì ghi nhận hoàn thành.',
      hanhDong: 'GHI_NHAN_HOAN_THANH', nhanNut: 'Ghi nhận hoàn thành'
    };
  }
  if (trangThai === 'HOAN_THANH') {
    return { viec: 'Mời khách điền biểu mẫu phản hồi, rồi chạy bước 14.', hanhDong: '', nhanNut: '' };
  }
  return { viec: 'Đơn đã ngưng, không có việc tiếp theo.', hanhDong: '', nhanNut: '' };
}

/** Số phút hỗ trợ trung bình trên mỗi người mua. */
function gomChiSoHoTro_() {
  const bt = docBang_(T.THU);
  const bd = docBang_(T.DON);
  let soThu = 0;
  bt.rows.forEach(function (r) { if (String(r[bt.h.MA_THU] || '').trim()) soThu++; });

  let soDonCapQuyen = 0;
  bd.rows.forEach(function (r) {
    const tt = String(r[bd.h.TRANG_THAI] || '').trim();
    if (['DA_CAP_QUYEN', 'DANG_HOC', 'HOAN_THANH'].indexOf(tt) >= 0) soDonCapQuyen++;
  });

  const phutMoiThu = Number(cauHinh_('PHUT_HO_TRO_MOI_THU', 10)) || 10;
  const thuTrenDon = soDonCapQuyen ? soThu / soDonCapQuyen : null;

  return {
    soThu: soThu,
    soDonCapQuyen: soDonCapQuyen,
    phutMoiThu: phutMoiThu,
    thuTrenDon: thuTrenDon === null ? null : Math.round(thuTrenDon * 100) / 100,
    phutTrenDon: thuTrenDon === null ? null : Math.round(thuTrenDon * phutMoiThu * 10) / 10,
    trong: soDonCapQuyen === 0
      ? 'Chưa có đơn nào được cấp quyền. Bước 8 sẽ đổ dữ liệu vào ô này.'
      : 'Chưa có thư hỗ trợ nào. Bước 12 sẽ đổ dữ liệu vào ô này.'
  };
}

/* ---------------------- NÚT TRÊN BẢNG ĐIỀU KHIỂN ------------------------- */

/**
 * Chạy đúng bước cho một đơn. Mỗi nút làm đúng một việc.
 * @return {string} Câu trả về hiển thị lại trên giao diện.
 */
function chayHanhDongDon(hanhDong, maDon) {
  try {
    if (hanhDong === 'DANH_DAU_THANH_TOAN') return danhDauDaThanhToan(maDon);
    if (hanhDong === 'CAP_QUYEN') return capQuyenChoDon(maDon);
    if (hanhDong === 'GUI_CHAO_MUNG') return guiChaoMungChoDon(maDon);
    if (hanhDong === 'NHAC_3') return nhacMocChoDon(maDon, 3);
    if (hanhDong === 'NHAC_7') return nhacMocChoDon(maDon, 7);
    if (hanhDong === 'GHI_NHAN_HOAN_THANH') return ghiNhanHoanThanhChoDon(maDon);
    return 'Không rõ hành động: ' + hanhDong;
  } catch (e) {
    ghiNhatKy_('Bảng điều khiển', 'LOI', hanhDong + ' | ' + maDon + ' | ' + e.message);
    return 'Lỗi: ' + e.message;
  }
}
