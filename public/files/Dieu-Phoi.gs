/**
 * ============================================================================
 *  BẢNG ĐIỀU PHỐI — DINH DƯỠNG 28 NGÀY  (bản tự động)
 *  File bổ sung. KHÔNG sửa gì trong các file mã đang có.
 * ----------------------------------------------------------------------------
 *  DÒNG CHẢY TỰ ĐỘNG — bạn chỉ bấm 2 nút cho mỗi khách:
 *
 *    Khách gửi biểu mẫu
 *       -> AI TỰ soạn dự thảo ngay          -> Chờ duyệt 1
 *    Bạn gõ góp ý, bấm gửi
 *       -> AI TỰ viết lại dự thảo           -> vẫn Chờ duyệt 1
 *    [BẤM 1] Đồng ý
 *       -> AI TỰ soạn thư gửi khách         -> Chờ duyệt cuối
 *    [BẤM 2] Duyệt gửi
 *       -> TỰ gửi thư cho khách             -> Đã gửi
 *
 *  Hai nút đó là hai cổng duyệt của con người. Đây là phần không tự động hóa
 *  được: nội dung dinh dưỡng do AI soạn phải có người đọc trước khi tới khách.
 * ----------------------------------------------------------------------------
 *  CẦN KHAI BÁO TRONG "Thuộc tính của tập lệnh":
 *    AI_NHA   : gemini | claude | openai
 *    AI_KEY   : API key của nhà đó
 *    AI_MODEL : (không bắt buộc) tên model, để trống thì dùng mặc định
 *    EMAIL_NHAN     : email bạn nhận thư báo
 *    URL_DIEU_PHOI  : URL ứng dụng web (điền sau khi triển khai)
 * ============================================================================
 */


/* ==========================================================================
 * A. BẢNG KHAI BÁO
 * ========================================================================== */

const DP = {

  trang: {
    khach:   'KHACH_HANG',
    duThao:  'AI_DU_THAO',
    keHoach: 'KE_HOACH_CUOI',
    thu:     'PHAN_HOI_EMAIL'
  },

  cot: {
    maKhach:   'Mã khách',
    noiDung:   'Nội dung',
    tieuDe:    'Tiêu đề',
    gopY:      'Góp ý',
    capNhat:   'Cập nhật lúc',
    trangThai: 'TT điều phối'
  },

  chang: {
    moi:       'Hồ sơ mới',
    duyet1:    'Chờ duyệt 1',
    duyetCuoi: 'Chờ duyệt cuối',
    daGui:     'Đã gửi'
  },

  /* Model mặc định cho từng nhà. Tên model có thể đổi theo thời gian —
     nếu báo lỗi model không tồn tại, khai báo AI_MODEL trong Thuộc tính. */
  modelMacDinh: {
    gemini: 'gemini-2.5-flash',
    claude: 'claude-haiku-4-5-20251001',
    openai: 'gpt-4o-mini'
  },

  /* --- NỐI VÀO 7 BƯỚC SẴN CÓ TRONG MENU "Tư vấn AI" ---
   * Để trống thì hệ thống TỰ DÒ tên hàm trong dự án theo từ khóa.
   * Chạy dpLietKeHam() để xem nó dò ra gì; nếu sai, điền tay vào đây.
   */
  ham: {
    taoDuThao:   '',   // bước 3 — Tạo bản dự thảo
    suaTheoGopY: '',   // bước 4 — Sửa theo góp ý
    chotKeHoach: '',   // bước 5 — Chuyển sang bảng kế hoạch hoàn chỉnh
    guiEmail:    ''    // bước 6 — Gửi kế hoạch qua Gmail
  },

  /* Từ khóa để tự dò. Dò trên tên hàm đã bỏ dấu và bỏ gạch dưới. */
  tuKhoaHam: {
    taoDuThao:   [['duthao'], ['ban', 'thao']],
    suaTheoGopY: [['gopy'], ['sua', 'y']],
    chotKeHoach: [['kehoach'], ['hoanchinh']],
    guiEmail:    [['gui', 'gmail'], ['gui', 'kehoach'], ['gui', 'email'], ['gui', 'thu']]
  },

  /* Bước 6 của bạn có thể gửi cho NHIỀU hồ sơ cùng lúc. Để true thì bảng
     điều phối tự gửi bằng MailApp cho ĐÚNG một khách — an toàn hơn.
     Đổi thành false nếu muốn dùng hàm gửi sẵn có của bạn. */
  tuGuiTungKhach: true,

  tieuDeThuMacDinh: 'Lộ trình dinh dưỡng 28 ngày dành riêng cho bạn',
  chanKhiCoTienSuRoiLoan: true,
  soCotTomTat: 5,
  cotAnTrongThuBao: ['Họ và tên', 'Email', 'Số điện thoại'],

  /* Cột chứa danh tính, KHÔNG gửi sang AI */
  cotKhongGuiChoAI: ['Họ và tên', 'Email', 'Số điện thoại', 'Dấu thời gian', 'Timestamp']
};


/* ---------- Lời nhắc gửi cho AI. Sửa ở đây để đổi văn phong ---------- */
const DP_VAI = 
  'Bạn là trợ lý soạn thảo cho một chuyên gia tư vấn dinh dưỡng, phục vụ khách hàng ' +
  'là người làm văn phòng tại Việt Nam.\n\n' +
  'Nguyên tắc bắt buộc:\n' +
  '- Chỉ tư vấn trong phạm vi lối sống và dinh dưỡng thông thường.\n' +
  '- KHÔNG chẩn đoán bệnh, KHÔNG kê thực đơn theo số calo cụ thể, KHÔNG đặt mục tiêu cân nặng.\n' +
  '- Tập trung vào thay đổi thói quen: nhịp ăn, chất lượng bữa trưa, đồ uống, nước lọc.\n' +
  '- Gợi ý món ăn phải phù hợp bối cảnh Việt Nam và điều kiện của khách.\n' +
  '- Nếu hồ sơ có dấu hiệu cần chuyên khoa, ghi rõ khuyến nghị gặp bác sĩ.\n' +
  '- Viết tiếng Việt, giọng chuyên nghiệp, dễ hiểu, không phóng đại công dụng.\n' +
  '- Chỉ trả về nội dung, không thêm lời dẫn hay ghi chú của riêng bạn.';

const DP_NHAC = {
  duThao: function (phieu) {
    return 'Đây là thông tin khách gửi qua biểu mẫu:\n\n' + phieu +
      '\n\nHãy soạn bản dự thảo lộ trình dinh dưỡng 28 ngày cho khách này, gồm:\n' +
      '1. Nhận định ngắn về tình trạng hiện tại (3-4 câu)\n' +
      '2. Ba thay đổi ưu tiên trong 28 ngày, mỗi thay đổi nêu rõ làm gì và vì sao\n' +
      '3. Khung giờ ăn gợi ý phù hợp lịch làm việc của khách\n' +
      '4. Gợi ý bữa trưa và bữa tối cụ thể, hợp ngân sách và thời gian nấu của khách\n' +
      '5. Cách theo dõi tiến độ theo hành vi, không theo cân nặng\n' +
      'Độ dài khoảng 500-700 từ.';
  },
  suaLai: function (phieu, banCu, gopY) {
    return 'Thông tin khách:\n\n' + phieu +
      '\n\n---\nBản dự thảo hiện tại:\n\n' + banCu +
      '\n\n---\nGóp ý của chuyên gia tư vấn:\n\n' + gopY +
      '\n\n---\nHãy viết lại toàn bộ bản dự thảo theo đúng góp ý trên. ' +
      'Giữ những phần chuyên gia không yêu cầu sửa. Trả về bản hoàn chỉnh.';
  },
  thu: function (keHoach) {
    return 'Đây là kế hoạch tư vấn đã được chuyên gia duyệt:\n\n' + keHoach +
      '\n\n---\nHãy viết thư gửi cho khách để bàn giao kế hoạch này. Yêu cầu:\n' +
      '- Mở đầu thân thiện, ngắn gọn\n' +
      '- Trình bày lại kế hoạch cho dễ đọc trong email\n' +
      '- Nêu rõ bước tiếp theo khách cần làm\n' +
      '- Kết thúc bằng lời mời đặt câu hỏi\n' +
      '- Không xưng tên riêng, dùng "chúng tôi"\n' +
      'Chỉ trả về nội dung thư, không có dòng tiêu đề.';
  }
};


const DP_CANH_BAO = [
  { tuKhoa: ['rối loạn ăn uống'], muc: 'chan',
    noiDung: 'Có tiền sử rối loạn ăn uống — chuyển tuyến chuyên khoa, không tự xây lộ trình' },
  { tuKhoa: ['mang thai', 'cho con bú'], muc: 'cao',
    noiDung: 'Mang thai hoặc cho con bú — cần trao đổi trước khi bắt đầu' },
  { tuKhoa: ['bệnh mạn tính', 'tiểu đường', 'tim mạch', 'tuyến giáp', 'bệnh thận'], muc: 'cao',
    noiDung: 'Đang điều trị bệnh mạn tính — cần bác sĩ theo dõi song song' },
  { tuKhoa: ['thuốc kê đơn'], muc: 'cao',
    noiDung: 'Đang dùng thuốc kê đơn dài hạn — kiểm tra tương tác với thực phẩm' },
  { tuKhoa: ['đang được bác sĩ', 'chuyên gia dinh dưỡng theo dõi'], muc: 'vua',
    noiDung: 'Đang được chuyên gia khác theo dõi — thống nhất để tránh chồng chéo' },
  { tuKhoa: ['ca đêm'], muc: 'vua',
    noiDung: 'Làm ca đêm — khung giờ ăn tiêu chuẩn không áp dụng' }
];


/* ==========================================================================
 * B. ỨNG DỤNG WEB
 * ========================================================================== */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Bảng điều phối — Dinh dưỡng 28 ngày')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/* ==========================================================================
 * C. GỌI AI
 * ========================================================================== */

function dpCoAI_() {
  const p = PropertiesService.getScriptProperties();
  return !!(p.getProperty('AI_KEY') && p.getProperty('AI_NHA'));
}


/* ---------- Tự dò tên hàm trong dự án ---------- */

function dpBoDau_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

/** Danh sách hàm có thể gọi từ menu: không gạch dưới cuối, không đòi tham số. */
function dpHamUngVien_() {
  const bo = dpTuKhoaCam_();
  return Object.keys(globalThis).filter(function (n) {
    if (typeof globalThis[n] !== 'function') return false;
    if (n.indexOf('dp') === 0) return false;      // hàm của file này
    if (n.charAt(n.length - 1) === '_') return false;  // hàm phụ trợ nội bộ
    if (bo.indexOf(n) !== -1) return false;       // hàm hệ thống
    if (globalThis[n].length > 0) return false;   // menu chỉ gọi hàm không tham số
    return true;
  }).sort();
}

/** Trả về tên hàm dùng cho một bước: ưu tiên khai báo tay, sau đó tự dò. */
function dpHamCho_(khoa) {
  if (DP.ham[khoa] && typeof globalThis[DP.ham[khoa]] === 'function') return DP.ham[khoa];

  const ten = dpHamUngVien_();
  const bo_ = DP.tuKhoaHam[khoa] || [];
  for (let i = 0; i < bo_.length; i++) {
    const canCo = bo_[i];
    for (let j = 0; j < ten.length; j++) {
      const t = dpBoDau_(ten[j]);
      if (canCo.every(function (k) { return t.indexOf(k) !== -1; })) return ten[j];
    }
  }
  return '';
}

function dpTuKhoaCam_() {
  return ['doGet', 'doPost', 'onOpen', 'onEdit', 'onInstall', 'onFormSubmit'];
}

/**
 * Gọi hàm sẵn có, bắt chước đúng cách menu "Tư vấn AI" gọi: KHÔNG tham số.
 * Nếu hàm đòi tham số thì thử truyền mã khách. Lỗi không làm vỡ luồng chính.
 * Trả về { chay, ten, loi }.
 */
function dpChayHamCu_(khoa, maKhach) {
  const ten = dpHamCho_(khoa);
  if (!ten) return { chay: false, ten: '', loi: 'chưa dò ra hàm cho bước này' };
  const f = globalThis[ten];

  try {
    f();
    SpreadsheetApp.flush();
    return { chay: true, ten: ten, loi: '' };
  } catch (e1) {
    try {
      f(maKhach);
      SpreadsheetApp.flush();
      return { chay: true, ten: ten, loi: '' };
    } catch (e2) {
      return { chay: false, ten: ten,
               loi: 'hàm "' + ten + '" báo lỗi: ' + (e1 && e1.message ? e1.message : e1) };
    }
  }
}


/** Chạy tay: liệt kê mọi hàm trong dự án và cho biết nó dò ra hàm nào. */
function dpLietKeHam() {
  const ungVien = dpHamUngVien_();

  Logger.log('=== HÀM GỌI ĐƯỢC TỪ MENU (' + ungVien.length + ') ===');
  Logger.log('(không gạch dưới cuối, không đòi tham số — đây là nhóm đúng)');
  ungVien.forEach(function (n) { Logger.log('  ' + n); });

  const bo = dpTuKhoaCam_();
  const phuTro = Object.keys(globalThis).filter(function (n) {
    return typeof globalThis[n] === 'function' && n.indexOf('dp') !== 0 &&
           bo.indexOf(n) === -1 && ungVien.indexOf(n) === -1;
  }).sort();

  Logger.log('');
  Logger.log('=== HÀM PHỤ TRỢ, BỎ QUA (' + phuTro.length + ') ===');
  phuTro.forEach(function (n) {
    Logger.log('  ' + n + '  (cần ' + globalThis[n].length + ' tham số)');
  });

  Logger.log('');
  Logger.log('=== BẢNG ĐIỀU PHỐI SẼ DÙNG ===');
  ['taoDuThao', 'suaTheoGopY', 'chotKeHoach', 'guiEmail'].forEach(function (k) {
    const t = dpHamCho_(k);
    Logger.log('  ' + k + ' -> ' + (t || 'KHÔNG DÒ RA'));
  });
  Logger.log('');
  Logger.log('Nếu dòng nào sai, chép tên đúng từ nhóm đầu tiên vào mục DP.ham.');
}


function dpGoiAI_(loiNhac) {
  const p     = PropertiesService.getScriptProperties();
  const nha   = String(p.getProperty('AI_NHA') || '').trim().toLowerCase();
  const key   = String(p.getProperty('AI_KEY') || '').trim();
  const model = String(p.getProperty('AI_MODEL') || '').trim() || DP.modelMacDinh[nha];

  if (!key || !nha) {
    throw new Error('Chưa khai báo AI_NHA và AI_KEY trong Thuộc tính của tập lệnh. ' +
                    'Vào Cài đặt dự án > Thuộc tính của tập lệnh để thêm.');
  }
  if (!DP.modelMacDinh[nha]) {
    throw new Error('AI_NHA phải là một trong: gemini, claude, openai. Đang là "' + nha + '".');
  }

  let url, tuyChon;

  if (nha === 'gemini') {
    url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
    tuyChon = {
      method: 'post', contentType: 'application/json',
      headers: { 'x-goog-api-key': key },
      payload: JSON.stringify({
        system_instruction: { parts: [{ text: DP_VAI }] },
        contents: [{ role: 'user', parts: [{ text: loiNhac }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 3000 }
      }),
      muteHttpExceptions: true
    };

  } else if (nha === 'claude') {
    url = 'https://api.anthropic.com/v1/messages';
    tuyChon = {
      method: 'post', contentType: 'application/json',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({
        model: model, max_tokens: 3000, temperature: 0.4,
        system: DP_VAI,
        messages: [{ role: 'user', content: loiNhac }]
      }),
      muteHttpExceptions: true
    };

  } else {
    url = 'https://api.openai.com/v1/chat/completions';
    tuyChon = {
      method: 'post', contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + key },
      payload: JSON.stringify({
        model: model, temperature: 0.4,
        messages: [{ role: 'system', content: DP_VAI },
                   { role: 'user',   content: loiNhac }]
      }),
      muteHttpExceptions: true
    };
  }

  const traVe = UrlFetchApp.fetch(url, tuyChon);
  const maHT  = traVe.getResponseCode();
  let d;
  try { d = JSON.parse(traVe.getContentText()); }
  catch (e) { throw new Error('AI trả về dữ liệu không đọc được (mã ' + maHT + ').'); }

  if (maHT !== 200 || d.error) {
    const lyDo = (d.error && (d.error.message || d.error.type)) || traVe.getContentText();
    throw new Error('AI báo lỗi (mã ' + maHT + '): ' + String(lyDo).slice(0, 400));
  }

  let chu = '';
  if (nha === 'gemini') {
    chu = d.candidates && d.candidates[0] && d.candidates[0].content &&
          d.candidates[0].content.parts ?
          d.candidates[0].content.parts.map(function (x) { return x.text || ''; }).join('') : '';
  } else if (nha === 'claude') {
    chu = d.content ? d.content.map(function (x) { return x.text || ''; }).join('') : '';
  } else {
    chu = d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '';
  }

  chu = String(chu || '').trim();
  if (!chu) throw new Error('AI trả về nội dung rỗng. Thử lại hoặc đổi model.');
  return chu;
}


/** Chạy tay để kiểm tra key có hoạt động không. */
function dpThuAI() {
  try {
    Logger.log('AI trả lời: ' + dpGoiAI_('Trả lời đúng một câu: hệ thống đang hoạt động.'));
  } catch (loi) {
    Logger.log('LỖI: ' + loi.message);
  }
}


/* ==========================================================================
 * D. CÁC BƯỚC TỰ ĐỘNG
 * ========================================================================== */

/** Ghép câu trả lời của khách thành văn bản gửi cho AI, bỏ phần danh tính. */
function dpPhieuChoAI_(tieuDe, dong) {
  const ra = [];
  for (let c = 0; c < tieuDe.length; c++) {
    const cau = String(tieuDe[c] || '').trim();
    if (!cau) continue;
    if (cau === DP.cot.maKhach || cau === DP.cot.trangThai) continue;
    if (DP.cotKhongGuiChoAI.some(function (x) {
      return cau.toLowerCase().indexOf(x.toLowerCase()) !== -1; })) continue;
    const tl = dpChuoi_(dong[c]);
    if (tl) ra.push('- ' + cau + ': ' + tl);
  }
  return ra.join('\n');
}


/** AI tự soạn dự thảo. Trả về nội dung đã ghi vào AI_DU_THAO. */
function dpTuSoanDuThao_(maKhach) {
  const t = dpTimDong_(maKhach);
  const canhBao = dpQuetCanhBao_(t.dong);

  if (canhBao.some(function (c) { return c.muc === 'chan'; }) && DP.chanKhiCoTienSuRoiLoan) {
    throw new Error('Hồ sơ này có tiền sử rối loạn ăn uống. Hệ thống không soạn tự động. ' +
                    'Hãy liên hệ trực tiếp và chuyển tuyến chuyên khoa.');
  }

  /* Ưu tiên bước 3 sẵn có trong menu Tư vấn AI */
  const b3 = dpChayHamCu_('taoDuThao', maKhach);
  if (b3.chay) {
    const cu = dpDocO_(DP.trang.duThao, maKhach, DP.cot.noiDung);
    if (cu) { dpDatTrangThai_(maKhach, DP.chang.duyet1); return cu; }
  }

  if (!dpCoAI_()) {
    throw new Error(
      (b3.ten
        ? 'Đã chạy bước 3 ("' + b3.ten + '") nhưng không thấy nội dung trong trang ' +
          DP.trang.duThao + ', cột "' + DP.cot.noiDung + '". ' +
          (b3.loi ? b3.loi + '. ' : '')
        : 'Chưa dò ra hàm tạo dự thảo. ') +
      'Hãy điền tên hàm đúng vào DP.ham, hoặc khai báo AI_NHA và AI_KEY trong ' +
      'Thuộc tính của tập lệnh, hoặc tự gõ nội dung vào ô rồi bấm Lưu dự thảo.');
  }

  let nhac = DP_NHAC.duThao(dpPhieuChoAI_(t.tieuDe, t.dong));
  if (canhBao.length) {
    nhac += '\n\nLƯU Ý BẮT BUỘC — hồ sơ này có các điểm cần thận trọng:\n' +
            canhBao.map(function (c) { return '- ' + c.noiDung; }).join('\n') +
            '\nHãy nêu rõ khuyến nghị làm việc cùng bác sĩ ở đầu bản dự thảo.';
  }

  const nd = dpGoiAI_(nhac);
  dpGhiO_(DP.trang.duThao, maKhach, DP.cot.noiDung, nd);
  dpDatTrangThai_(maKhach, DP.chang.duyet1);
  return nd;
}


/** AI tự viết lại dự thảo theo góp ý. */
function dpTuSuaTheoGopY_(maKhach, gopY) {
  const t     = dpTimDong_(maKhach);
  const banCu = dpDocO_(DP.trang.duThao, maKhach, DP.cot.noiDung);
  if (!banCu) throw new Error('Chưa có bản dự thảo để sửa.');

  /* Ghi góp ý xuống trước, để bước 4 sẵn có đọc được từ bảng tính */
  dpLuuGopY_(maKhach, gopY);

  const b4 = dpChayHamCu_('suaTheoGopY', maKhach);
  if (b4.chay) {
    const moi = dpDocO_(DP.trang.duThao, maKhach, DP.cot.noiDung);
    if (moi && moi !== banCu) { dpDatTrangThai_(maKhach, DP.chang.duyet1); return moi; }
  }

  if (!dpCoAI_()) {
    throw new Error(
      (b4.ten
        ? 'Đã chạy bước 4 ("' + b4.ten + '") nhưng bản dự thảo không đổi. ' +
          (b4.loi ? b4.loi + '. ' : '')
        : 'Chưa dò ra hàm sửa theo góp ý. ') +
      'Góp ý đã được ghi vào cột "' + DP.cot.gopY + '" của trang ' + DP.trang.duThao +
      '. Bạn có thể tự sửa nội dung rồi bấm Lưu dự thảo.');
  }

  const nd = dpGoiAI_(DP_NHAC.suaLai(dpPhieuChoAI_(t.tieuDe, t.dong), banCu, gopY));
  dpGhiO_(DP.trang.duThao, maKhach, DP.cot.noiDung, nd);
  dpDatTrangThai_(maKhach, DP.chang.duyet1);
  return nd;
}


/** AI tự soạn thư từ kế hoạch cuối. */
function dpTuSoanThu_(maKhach) {
  const ke = dpDocO_(DP.trang.keHoach, maKhach, DP.cot.noiDung);
  if (!ke) throw new Error('Chưa có kế hoạch cuối để soạn thư.');

  /* Nếu bước 5/6 sẵn có đã ghi sẵn nội dung thư thì dùng luôn */
  const sanCo = dpDocO_(DP.trang.thu, maKhach, DP.cot.noiDung);
  if (sanCo) return sanCo;

  const nd = dpGoiAI_(DP_NHAC.thu(ke));
  dpGhiO_(DP.trang.thu, maKhach, DP.cot.noiDung, nd);
  if (!dpDocO_(DP.trang.thu, maKhach, DP.cot.tieuDe)) {
    dpGhiO_(DP.trang.thu, maKhach, DP.cot.tieuDe, DP.tieuDeThuMacDinh);
  }
  return nd;
}


/* ==========================================================================
 * E. HÀM PHỤC VỤ GIAO DIỆN
 * ========================================================================== */

function dpLayBang() {
  return dpBaoVe_(function () {
    const bang = dpDocTrang_(DP.trang.khach);
    const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
    const iTt  = dpBaoDamCotTrangThai_(bang);
    if (iMa < 0) throw new Error('Không tìm thấy cột "' + DP.cot.maKhach + '" trong trang ' +
                                 DP.trang.khach + '.');

    const coDu = dpTapMaCoNoiDung_(DP.trang.duThao);
    const coKe = dpTapMaCoNoiDung_(DP.trang.keHoach);
    const gio  = { moi: [], duyet1: [], duyetCuoi: [], daGui: [] };

    bang.dong.forEach(function (dong) {
      const ma = String(dong[iMa] || '').trim();
      if (!ma) return;
      const cb = dpQuetCanhBao_(dong);
      gio[dpSuyChang_(String(dong[iTt] || '').trim(), coDu[ma], coKe[ma])]
        .push({ ma: ma, nhan: dpNhanNgay_(dong[0]), soCanhBao: cb.length });
    });

    return {
      chang: [
        { khoa: 'moi',       ten: DP.chang.moi,       the: gio.moi },
        { khoa: 'duyet1',    ten: DP.chang.duyet1,    the: gio.duyet1 },
        { khoa: 'duyetCuoi', ten: DP.chang.duyetCuoi, the: gio.duyetCuoi },
        { khoa: 'daGui',     ten: DP.chang.daGui,     the: gio.daGui }
      ],
      coAI:    dpCoAI_() || !!dpHamCho_('taoDuThao'),
      capNhat: Utilities.formatDate(new Date(), dpMuiGio_(), 'HH:mm — dd/MM/yyyy')
    };
  });
}


function dpLayChiTiet(maKhach) {
  return dpBaoVe_(function () {
    const t   = dpTimDong_(maKhach);
    const iMa = dpTimCot_(t.tieuDe, DP.cot.maKhach);
    const iTt = dpTimCot_(t.tieuDe, DP.cot.trangThai);

    const phieu = [];
    for (let c = 0; c < t.tieuDe.length; c++) {
      if (c === iMa || c === iTt) continue;
      const cau = String(t.tieuDe[c] || '').trim();
      const tl  = dpChuoi_(t.dong[c]);
      if (cau && tl) phieu.push({ cau: cau, traLoi: tl });
    }

    const du = dpDocO_(DP.trang.duThao,  maKhach, DP.cot.noiDung);
    const ke = dpDocO_(DP.trang.keHoach, maKhach, DP.cot.noiDung);

    return {
      ma:         maKhach,
      khoa:       dpSuyChang_(iTt >= 0 ? String(t.dong[iTt] || '').trim() : '', !!du, !!ke),
      canhBao:    dpQuetCanhBao_(t.dong),
      phieu:      phieu,
      duThao:     du,
      gopYCu:     dpDocO_(DP.trang.duThao, maKhach, DP.cot.gopY),
      keHoach:    ke,
      thuTieuDe:  dpDocO_(DP.trang.thu, maKhach, DP.cot.tieuDe),
      thuNoiDung: dpDocO_(DP.trang.thu, maKhach, DP.cot.noiDung),
      emailKhach: dpEmailKhach_(t.tieuDe, t.dong),
      coAI:       dpCoAI_() || !!dpHamCho_('taoDuThao')
    };
  });
}


/** Nút: AI soạn dự thảo (dùng khi phiếu cũ chưa có, hoặc muốn soạn lại). */
function dpSoanDuThao(maKhach) {
  return dpBaoVe_(function () {
    dpTuSoanDuThao_(maKhach);
    return { thongBao: 'AI đã soạn xong dự thảo. Mời đọc lại.' };
  });
}


/** Nút: gửi góp ý — AI tự viết lại ngay. */
function dpGuiGopY(maKhach, gopY) {
  return dpBaoVe_(function () {
    const y = String(gopY || '').trim();
    if (!y) throw new Error('Chưa nhập góp ý.');
    dpTuSuaTheoGopY_(maKhach, y);
    return { thongBao: 'AI đã viết lại dự thảo theo góp ý. Mời đọc lại.' };
  });
}


/** Nút 1 — Đồng ý. Chốt kế hoạch và AI tự soạn thư. */
function dpDongY(maKhach) {
  return dpBaoVe_(function () {
    const du = dpDocO_(DP.trang.duThao, maKhach, DP.cot.noiDung);
    if (!du) throw new Error('Chưa có bản dự thảo.');

    /* Bước 5 sẵn có: Chuyển sang bảng kế hoạch hoàn chỉnh */
    dpChayHamCu_('chotKeHoach', maKhach);
    if (!dpDocO_(DP.trang.keHoach, maKhach, DP.cot.noiDung)) {
      dpGhiO_(DP.trang.keHoach, maKhach, DP.cot.noiDung, du);
    }

    let ghi = 'Đã chốt kế hoạch. ';
    try {
      dpTuSoanThu_(maKhach);
      ghi += 'AI đã soạn xong thư. Đọc lại trước khi gửi.';
    } catch (loi) {
      dpGhiO_(DP.trang.thu, maKhach, DP.cot.noiDung, du);
      dpGhiO_(DP.trang.thu, maKhach, DP.cot.tieuDe, DP.tieuDeThuMacDinh);
      ghi += 'Không soạn được thư bằng AI (' + loi.message +
             ') nên đã tạm dùng nội dung kế hoạch. Sửa lại trước khi gửi.';
    }

    dpDatTrangThai_(maKhach, DP.chang.duyetCuoi);
    return { thongBao: ghi };
  });
}


/** Nút: AI soạn lại thư. */
function dpSoanLaiThu(maKhach) {
  return dpBaoVe_(function () {
    dpTuSoanThu_(maKhach);
    return { thongBao: 'AI đã soạn lại thư.' };
  });
}


/* ---------- Lưu nội dung sửa tay ---------- */

function dpLuuDuThao(maKhach, noiDung) {
  return dpBaoVe_(function () {
    const nd = String(noiDung || '').trim();
    if (!nd) throw new Error('Nội dung dự thảo đang để trống.');
    dpGhiO_(DP.trang.duThao, maKhach, DP.cot.noiDung, nd);
    dpDatTrangThai_(maKhach, DP.chang.duyet1);
    return { thongBao: 'Đã lưu dự thảo.' };
  });
}

function dpLuuKeHoach(maKhach, noiDung) {
  return dpBaoVe_(function () {
    const nd = String(noiDung || '').trim();
    if (!nd) throw new Error('Nội dung kế hoạch đang để trống.');
    dpGhiO_(DP.trang.keHoach, maKhach, DP.cot.noiDung, nd);
    dpDatTrangThai_(maKhach, DP.chang.duyetCuoi);
    return { thongBao: 'Đã lưu kế hoạch cuối.' };
  });
}

function dpLuuThu(maKhach, tieuDe, noiDung) {
  return dpBaoVe_(function () {
    const nd = String(noiDung || '').trim();
    if (!nd) throw new Error('Nội dung thư đang để trống.');
    dpGhiO_(DP.trang.thu, maKhach, DP.cot.noiDung, nd);
    dpGhiO_(DP.trang.thu, maKhach, DP.cot.tieuDe,
            String(tieuDe || '').trim() || DP.tieuDeThuMacDinh);
    return { thongBao: 'Đã lưu nội dung thư.' };
  });
}


/** Nút 2 — Duyệt gửi. Gửi thư thật cho khách. */
function dpDuyetGui(maKhach) {
  return dpBaoVe_(function () {
    const nd = dpDocO_(DP.trang.thu, maKhach, DP.cot.noiDung);
    if (!nd) throw new Error('Chưa có nội dung thư.');

    const t     = dpTimDong_(maKhach);
    const email = dpEmailKhach_(t.tieuDe, t.dong);
    if (!email) throw new Error('Không tìm thấy email của khách trong trang ' +
                                DP.trang.khach + '.');

    if (!DP.tuGuiTungKhach && dpChayHamCu_('guiEmail', maKhach).chay) {
      dpGhiO_(DP.trang.thu, maKhach, DP.cot.capNhat, new Date());
      dpDatTrangThai_(maKhach, DP.chang.daGui);
      return { thongBao: 'Đã chạy bước gửi thư sẵn có. Hồ sơ chuyển sang Đã gửi.' };
    }

    const td = dpDocO_(DP.trang.thu, maKhach, DP.cot.tieuDe) || DP.tieuDeThuMacDinh;
    MailApp.sendEmail({
      to: email, subject: td,
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;' +
                'color:#1E1B34;max-width:640px">' +
                dpThoat_(nd).replace(/\n/g, '<br>') + '</div>'
    });

    dpGhiO_(DP.trang.thu, maKhach, DP.cot.capNhat, new Date());
    dpDatTrangThai_(maKhach, DP.chang.daGui);
    return { thongBao: 'Đã gửi thư tới ' + email + '. Hồ sơ chuyển sang Đã gửi.' };
  });
}


/** Gửi lại thư sau khi đã sửa (dùng ở chặng Đã gửi). */
function dpGuiLai(maKhach) {
  return dpBaoVe_(function () {
    dpDatTrangThai_(maKhach, DP.chang.duyetCuoi);
    return { thongBao: 'Đã mở lại hồ sơ. Sửa thư rồi bấm Duyệt gửi lần nữa.' };
  });
}


function dpLui(maKhach, veKhoa) {
  return dpBaoVe_(function () {
    const ten = DP.chang[veKhoa];
    if (!ten) throw new Error('Chặng không hợp lệ.');
    dpDatTrangThai_(maKhach, ten);
    return { thongBao: 'Đã đưa hồ sơ về chặng ' + ten + '.' };
  });
}


/* ==========================================================================
 * F. TRIGGER — phiếu mới về là AI soạn dự thảo luôn
 * ========================================================================== */

function dpBaoPhieuMoi(e) {
  const props     = PropertiesService.getScriptProperties();
  const nguoiNhan = props.getProperty('EMAIL_NHAN');
  const duongDan  = props.getProperty('URL_DIEU_PHOI');
  if (!e || !e.range) return;

  const sheet  = e.range.getSheet();
  const soDong = e.range.getRow();
  const tieuDe = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const iMa    = dpTimCot_(tieuDe, DP.cot.maKhach);

  let ma = '';
  if (iMa >= 0) {
    for (let lan = 0; lan < 8; lan++) {
      const v = String(sheet.getRange(soDong, iMa + 1).getValue() || '').trim();
      if (v) { ma = v; break; }
      Utilities.sleep(1000); SpreadsheetApp.flush();
    }
  }

  const dong    = sheet.getRange(soDong, 1, 1, sheet.getLastColumn()).getValues()[0];
  const canhBao = dpQuetCanhBao_(dong);

  /* --- AI tự soạn dự thảo ngay --- */
  let ketQuaAI = '';
  if (ma) {
    try {
      dpTuSoanDuThao_(ma);
      ketQuaAI = 'AI đã soạn xong bản dự thảo, hồ sơ đang ở chặng Chờ duyệt 1.';
    } catch (loi) {
      ketQuaAI = 'Chưa soạn được dự thảo tự động: ' + loi.message;
    }
  }

  if (!nguoiNhan) { console.error('Thiếu EMAIL_NHAN.'); return; }

  const iTt = dpTimCot_(tieuDe, DP.cot.trangThai);
  const tomTat = [];
  for (let c = 0; c < tieuDe.length && tomTat.length < DP.soCotTomTat; c++) {
    if (c === iMa || c === iTt) continue;
    const cau = String(tieuDe[c] || '').trim();
    if (!cau) continue;
    if (DP.cotAnTrongThuBao.some(function (x) {
      return cau.toLowerCase().indexOf(x.toLowerCase()) !== -1; })) continue;
    const tl = dpChuoi_(dong[c]);
    if (tl) tomTat.push({ cau: cau, traLoi: tl });
  }

  let html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1E1B34;' +
    'max-width:620px;line-height:1.55">' +
    '<p style="margin:0 0 4px"><strong style="font-size:16px">Mã khách: ' +
    dpThoat_(ma || '(chưa có mã)') + '</strong></p>' +
    '<p style="margin:0 0 16px;color:#6B6890;font-size:13px">Nhận lúc ' +
    Utilities.formatDate(new Date(), dpMuiGio_(), 'HH:mm — dd/MM/yyyy') + '</p>' +
    '<p style="margin:0 0 18px;padding:10px 14px;background:#F4F3FB;border-radius:8px">' +
    dpThoat_(ketQuaAI) + '</p>';

  if (canhBao.length) {
    html += '<div style="border-left:4px solid #DC2626;background:#FEF2F2;padding:12px 16px;' +
            'margin:0 0 18px"><p style="margin:0 0 8px;font-weight:bold;color:#DC2626">' +
            'Điểm cần bạn kiểm tra</p><ul style="margin:0;padding-left:18px">';
    canhBao.forEach(function (c) {
      html += '<li style="margin-bottom:5px">' + dpThoat_(c.noiDung) + '</li>'; });
    html += '</ul></div>';
  } else {
    html += '<p style="margin:0 0 18px;color:#6D28D9">Không có điểm nào cần lưu ý đặc biệt.</p>';
  }

  html += '<p style="margin:0 0 8px;font-weight:bold">Tóm tắt phiếu</p>' +
          '<table style="border-collapse:collapse;width:100%;margin-bottom:22px">';
  tomTat.forEach(function (m) {
    html += '<tr><td style="padding:6px 10px 6px 0;color:#6B6890;vertical-align:top;width:45%;' +
            'border-bottom:1px solid #E4E2F2">' + dpThoat_(m.cau) + '</td>' +
            '<td style="padding:6px 0;border-bottom:1px solid #E4E2F2">' +
            dpThoat_(m.traLoi) + '</td></tr>';
  });
  html += '</table>';

  if (duongDan) {
    html += '<p style="margin:0"><a href="' + duongDan + '" style="display:inline-block;' +
            'background:#6D28D9;color:#fff;text-decoration:none;padding:11px 22px;' +
            'border-radius:8px;font-weight:bold">Mở bảng điều phối</a></p>';
  }
  html += '</div>';

  MailApp.sendEmail({ to: nguoiNhan,
    subject: (canhBao.length ? '[Cần kiểm tra] ' : '') + 'Phiếu mới ' + (ma || ''),
    htmlBody: html });
}


/* ==========================================================================
 * G. CÀI ĐẶT VÀ CHẨN ĐOÁN
 * ========================================================================== */

function dpCaiDat() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('EMAIL_NHAN')) {
    throw new Error('Chưa có thuộc tính EMAIL_NHAN.');
  }
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dpBaoPhieuMoi') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('dpBaoPhieuMoi')
           .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
           .onFormSubmit().create();
  Logger.log('Đã cài trigger dpBaoPhieuMoi.');
  dpXemTrangThaiCaiDat();
}


function dpXemTrangThaiCaiDat() {
  const p  = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const co = ss.getSheets().map(function (s) { return s.getName(); });

  Logger.log('--- Trang tính ---');
  Object.keys(DP.trang).forEach(function (k) {
    const ten = DP.trang[k];
    let ghi = co.indexOf(ten) !== -1 ? 'có' : 'chưa có (sẽ tự tạo khi cần)';
    if (co.indexOf(ten) !== -1 && k !== 'khach') {
      const b = dpDocTrang_(ten);
      ghi += ' | Mã khách: ' + (dpTimCot_(b.tieuDe, DP.cot.maKhach) >= 0 ? 'có' : 'THIẾU') +
             ' | Nội dung: ' + (dpTimCot_(b.tieuDe, DP.cot.noiDung) >= 0 ? 'có' : 'THIẾU');
    }
    Logger.log('  ' + ten + ': ' + ghi);
  });

  Logger.log('--- Thuộc tính ---');
  ['AI_NHA', 'AI_MODEL', 'EMAIL_NHAN', 'URL_DIEU_PHOI'].forEach(function (k) {
    Logger.log('  ' + k + ': ' + (p.getProperty(k) || 'CHƯA ĐIỀN'));
  });
  Logger.log('  AI_KEY: ' + (p.getProperty('AI_KEY') ? 'đã điền' : 'CHƯA ĐIỀN'));

  Logger.log('--- Hàm 7 bước nối được ---');
  ['taoDuThao', 'suaTheoGopY', 'chotKeHoach', 'guiEmail'].forEach(function (k) {
    const t = dpHamCho_(k);
    Logger.log('  ' + k + ' -> ' + (t || 'không dò ra (sẽ dùng AI hoặc làm tay)'));
  });

  Logger.log('--- Trigger ---');
  Logger.log('  dpBaoPhieuMoi: ' + ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'dpBaoPhieuMoi'; }).length + ' (đúng phải là 1)');
}


/** Soạn dự thảo cho mọi hồ sơ chưa có. Dùng để xử lý phiếu cũ. */
function dpSoanBuChoHoSoCu() {
  const bang = dpDocTrang_(DP.trang.khach);
  const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
  const coDu = dpTapMaCoNoiDung_(DP.trang.duThao);
  let xong = 0, loi = 0;

  bang.dong.forEach(function (dong) {
    const ma = String(dong[iMa] || '').trim();
    if (!ma || coDu[ma]) return;
    try { dpTuSoanDuThao_(ma); xong++; Logger.log('  ' + ma + ': xong'); }
    catch (e) { loi++; Logger.log('  ' + ma + ': LỖI — ' + e.message); }
  });
  Logger.log('Đã soạn ' + xong + ' hồ sơ, lỗi ' + loi + '.');
}


/* ==========================================================================
 * H. HÀM NỘI BỘ
 * ========================================================================== */

function dpBaoVe_(viec) {
  try { return { ok: true, duLieu: viec() }; }
  catch (loi) { return { ok: false, loi: String(loi && loi.message ? loi.message : loi) }; }
}

function dpTimDong_(maKhach) {
  const bang = dpDocTrang_(DP.trang.khach);
  const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
  if (iMa < 0) throw new Error('Không tìm thấy cột "' + DP.cot.maKhach + '".');
  for (let i = 0; i < bang.dong.length; i++) {
    if (String(bang.dong[i][iMa] || '').trim() === maKhach) {
      return { tieuDe: bang.tieuDe, dong: bang.dong[i], sheet: bang.sheet, soDong: i + 2 };
    }
  }
  throw new Error('Không tìm thấy hồ sơ ' + maKhach + '.');
}

function dpSuyChang_(tt, coDuThao, coKeHoach) {
  if (tt === DP.chang.daGui)     return 'daGui';
  if (coKeHoach)                 return 'duyetCuoi';
  if (tt === DP.chang.duyetCuoi) return 'duyetCuoi';
  if (coDuThao)                  return 'duyet1';
  if (tt === DP.chang.duyet1)    return 'duyet1';
  return 'moi';
}

function dpDocTrang_(ten) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ten);
  if (!sheet) throw new Error('Không tìm thấy trang tính "' + ten + '".');
  const soDong = sheet.getLastRow(), soCot = sheet.getLastColumn();
  if (soCot === 0) throw new Error('Trang "' + ten + '" chưa có tiêu đề ở dòng 1.');
  return {
    sheet:  sheet,
    tieuDe: sheet.getRange(1, 1, 1, soCot).getValues()[0],
    dong:   soDong > 1 ? sheet.getRange(2, 1, soDong - 1, soCot).getValues() : []
  };
}

function dpTimCot_(tieuDe, ten) {
  const chuan = function (x) { return String(x || '').trim().toLowerCase(); };
  const dich  = chuan(ten);
  for (let i = 0; i < tieuDe.length; i++) if (chuan(tieuDe[i]) === dich) return i;
  if (ten === DP.cot.trangThai) return -1;
  for (let i = 0; i < tieuDe.length; i++) {
    const t = chuan(tieuDe[i]);
    if (t && (t.indexOf(dich) !== -1 || dich.indexOf(t) !== -1)) return i;
  }
  return -1;
}

function dpBaoDamCotTrangThai_(bang) {
  let i = dpTimCot_(bang.tieuDe, DP.cot.trangThai);
  if (i >= 0) return i;
  i = bang.tieuDe.length;
  bang.sheet.getRange(1, i + 1).setValue(DP.cot.trangThai).setFontWeight('bold');
  bang.tieuDe.push(DP.cot.trangThai);
  bang.dong.forEach(function (d) { d.push(''); });
  return i;
}

function dpDatTrangThai_(maKhach, trangThai) {
  const khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    const bang = dpDocTrang_(DP.trang.khach);
    const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
    const iTt  = dpBaoDamCotTrangThai_(bang);
    for (let i = 0; i < bang.dong.length; i++) {
      if (String(bang.dong[i][iMa] || '').trim() === maKhach) {
        bang.sheet.getRange(i + 2, iTt + 1).setValue(trangThai);
        SpreadsheetApp.flush();
        return;
      }
    }
  } finally { khoa.releaseLock(); }
}

function dpTapMaCoNoiDung_(tenTrang) {
  const ra = {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(tenTrang)) return ra;
  const bang = dpDocTrang_(tenTrang);
  const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
  const iNd  = dpTimCot_(bang.tieuDe, DP.cot.noiDung);
  if (iMa < 0 || iNd < 0) return ra;
  bang.dong.forEach(function (d) {
    const ma = String(d[iMa] || '').trim();
    if (ma && dpChuoi_(d[iNd])) ra[ma] = true;
  });
  return ra;
}

function dpDocO_(tenTrang, maKhach, tenCot) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(tenTrang)) return '';
  const bang = dpDocTrang_(tenTrang);
  const iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
  const iC   = dpTimCot_(bang.tieuDe, tenCot);
  if (iMa < 0 || iC < 0) return '';
  for (let i = 0; i < bang.dong.length; i++) {
    if (String(bang.dong[i][iMa] || '').trim() === maKhach) return dpChuoi_(bang.dong[i][iC]);
  }
  return '';
}

function dpGhiO_(tenTrang, maKhach, tenCot, giaTri) {
  const khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(tenTrang);
    if (!sheet) {
      sheet = ss.insertSheet(tenTrang);
      sheet.getRange(1, 1, 1, 5)
           .setValues([[DP.cot.maKhach, DP.cot.tieuDe, DP.cot.noiDung,
                        DP.cot.gopY, DP.cot.capNhat]])
           .setFontWeight('bold');
    }
    let bang = dpDocTrang_(tenTrang);
    let iMa  = dpTimCot_(bang.tieuDe, DP.cot.maKhach);
    if (iMa < 0) {
      iMa = bang.tieuDe.length;
      sheet.getRange(1, iMa + 1).setValue(DP.cot.maKhach).setFontWeight('bold');
      bang = dpDocTrang_(tenTrang);
    }
    let iC = dpTimCot_(bang.tieuDe, tenCot);
    if (iC < 0) {
      iC = bang.tieuDe.length;
      sheet.getRange(1, iC + 1).setValue(tenCot).setFontWeight('bold');
      bang = dpDocTrang_(tenTrang);
    }
    const iCn = dpTimCot_(bang.tieuDe, DP.cot.capNhat);
    for (let i = 0; i < bang.dong.length; i++) {
      if (String(bang.dong[i][iMa] || '').trim() === maKhach) {
        sheet.getRange(i + 2, iC + 1).setValue(giaTri);
        if (iCn >= 0 && tenCot !== DP.cot.capNhat) {
          sheet.getRange(i + 2, iCn + 1).setValue(new Date());
        }
        SpreadsheetApp.flush();
        return;
      }
    }
    const moi = new Array(bang.tieuDe.length).fill('');
    moi[iMa] = maKhach;
    moi[iC]  = giaTri;
    if (iCn >= 0 && tenCot !== DP.cot.capNhat) moi[iCn] = new Date();
    sheet.appendRow(moi);
    SpreadsheetApp.flush();
  } finally { khoa.releaseLock(); }
}

function dpLuuGopY_(maKhach, gopY) {
  try {
    const cu  = dpDocO_(DP.trang.duThao, maKhach, DP.cot.gopY);
    const moc = Utilities.formatDate(new Date(), dpMuiGio_(), 'dd/MM HH:mm');
    dpGhiO_(DP.trang.duThao, maKhach, DP.cot.gopY,
            (cu ? cu + '\n\n' : '') + '[' + moc + '] ' + gopY);
  } catch (loi) { /* không chặn luồng chính */ }
}

function dpEmailKhach_(tieuDe, dong) {
  for (let i = 0; i < tieuDe.length; i++) {
    if (String(tieuDe[i] || '').toLowerCase().indexOf('email') !== -1) {
      const v = dpChuoi_(dong[i]);
      if (v.indexOf('@') !== -1) return v;
    }
  }
  for (let i = 0; i < dong.length; i++) {
    const v = dpChuoi_(dong[i]);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  }
  return '';
}

function dpQuetCanhBao_(dong) {
  const chuoi = dong.map(function (o) { return dpChuoi_(o); }).join(' | ').toLowerCase();
  const ra = [];
  DP_CANH_BAO.forEach(function (q) {
    if (q.tuKhoa.some(function (t) { return chuoi.indexOf(t) !== -1; })) {
      ra.push({ muc: q.muc, noiDung: q.noiDung });
    }
  });
  return ra;
}

function dpChuoi_(o) {
  if (o === null || o === undefined) return '';
  if (Object.prototype.toString.call(o) === '[object Date]') {
    return Utilities.formatDate(o, dpMuiGio_(), 'dd/MM/yyyy HH:mm');
  }
  return String(o).trim();
}

function dpNhanNgay_(o) {
  const s = dpChuoi_(o);
  return s ? s.split(' ')[0] : '';
}

function dpMuiGio_() {
  try { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(); }
  catch (e) { return 'Asia/Ho_Chi_Minh'; }
}

function dpThoat_(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/* ==========================================================================
 * CHÚ Ý — NẾU MÃ CŨ ĐÃ CÓ doGet
 * Xóa doGet ở mục B, rồi thêm vào doGet cũ nhánh:
 *   if (e && e.parameter && e.parameter.trang === 'dieuphoi') {
 *     return HtmlService.createHtmlOutputFromFile('Dashboard')
 *       .addMetaTag('viewport','width=device-width, initial-scale=1');
 *   }
 * ========================================================================== */