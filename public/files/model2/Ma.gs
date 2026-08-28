/**
 * ===========================================================================
 *  HỆ THỐNG SẢN XUẤT 12 VIDEO NGẮN / THÁNG — Google Apps Script (một file)
 *  PHIÊN BẢN 2.1: khách KHÔNG quay video. Khách nộp ảnh thô (ảnh sản phẩm, ảnh
 *  nhân vật đại diện, logo) vào thư mục Drive; bên cung cấp tạo toàn bộ cảnh
 *  bằng AI từ chính bộ ảnh đó rồi trả video về đúng thư mục của khách.
 * ---------------------------------------------------------------------------
 *  Cách dùng nhanh:
 *   1) Dán toàn bộ file này vào Apps Script của CHÍNH bảng tính đang mở.
 *   2) Cài đặt dự án → Thuộc tính của script → thêm OPENAI_API_KEY.
 *   3) Tải lại bảng tính → menu "San xuat video" xuất hiện.
 *   4) Chạy lần lượt từ mục 1 đến mục 12.
 *
 *  Hai điểm chính:
 *   A. ĐẦU VÀO LÀ ẢNH, KHÔNG PHẢI VIDEO THÔ.
 *      Google Form chỉ thu phần chữ. Lý do: FormApp của Apps Script KHÔNG có
 *      hàm tạo câu hỏi tải tệp (không tồn tại addFileUploadItem), nên không thể
 *      dựng biểu mẫu có ô tải ảnh bằng mã. Thay vào đó, ngay khi nhận biểu mẫu,
 *      hệ thống tạo thư mục 03_ANH_KHACH_GUI với ba thư mục con SAN_PHAM,
 *      NHAN_VAT, LOGO, mở quyền tải lên cho riêng thư mục đó rồi gửi liên kết
 *      kèm tiêu chuẩn ảnh cho khách. Khi đếm đủ ảnh, quyền được hạ về chỉ xem.
 *   B. HAI CỔNG KHÓA DUYỆT NỘI BỘ.
 *      Sau khi AI tạo 20 góc nội dung, hệ thống dừng. Người vận hành tự đọc trang
 *      Y_TUONG, đánh dấu DUYET/LOAI, rồi điền "Đã duyệt" vào cột DUYET_Y_TUONG.
 *      Viết xong kịch bản, hệ thống lại dừng; người vận hành đọc và sửa trực tiếp
 *      trên trang KICH_BAN rồi điền "Đã duyệt" vào cột DUYET_KICH_BAN. Không gửi
 *      thư duyệt cho khách hay người duyệt bên ngoài.
 *
 *  Ràng buộc kỹ thuật:
 *   - Chỉ dùng SpreadsheetApp.getActiveSpreadsheet(); không dùng SpreadsheetApp.create.
 *   - Khóa API đọc từ PropertiesService.getScriptProperties(), không ghi trong mã.
 *   - Tra cột theo TÊN TIÊU ĐỀ, không dùng vị trí cột cố định.
 *   - Mọi lệnh gọi API đặt muteHttpExceptions: true và ném lỗi kèm nguyên văn nội dung trả về.
 *   - max_tokens tối thiểu 4000 (tự nâng nếu cấu hình nhập thấp hơn).
 *   - Mọi câu lệnh gửi AI đọc từ trang CAU_HINH; mảng CAU_HINH_MAC_DINH chỉ dùng
 *     một lần để gieo dòng mẫu khi tạo khung.
 *   - Mỗi lần chạy xử lý tối đa 4 video vì Apps Script giới hạn 6 phút.
 *
 *  Về tiếng Việt: tên hàm và tên biến viết tiếng Việt KHÔNG DẤU. Toàn bộ chú
 *  thích, thông báo, câu lệnh gửi AI, câu hỏi biểu mẫu và nội dung thư đều có dấu.
 * ---------------------------------------------------------------------------
 *  THAY ĐỔI SO VỚI BẢN TRƯỚC: hàm onOpen() có thêm hai mục menu
 *  "Mở bảng điều khiển" và "Kiểm tra cài đặt bảng điều khiển". Hai mục này cần
 *  tệp bang_dieu_khien.gs và tệp HTML bang_dieu_khien nằm cùng dự án.
 * ===========================================================================
 */

/* =========================== HẰNG SỐ CHUNG =========================== */

/** Tên chín trang tính của hệ thống. */
var TRANG = {
  KHACH_HANG: 'KHACH_HANG',
  HO_SO: 'HO_SO',
  Y_TUONG: 'Y_TUONG',
  KICH_BAN: 'KICH_BAN',
  KE_HOACH_HINH: 'KE_HOACH_HINH',
  SAN_XUAT: 'SAN_XUAT',
  PHAN_HOI: 'PHAN_HOI',
  SO_LIEU: 'SO_LIEU',
  CAU_HINH: 'CAU_HINH'
};

/**
 * Các cột hệ thống thêm vào trang KHACH_HANG do biểu mẫu tạo ra.
 * Ba cột DUYET_Y_TUONG, DUYET_KICH_BAN, DUYET_CUOI là ba cổng khóa của quy trình,
 * do người vận hành tự điền.
 */
var COT_HE_THONG_KHACH_HANG = [
  'MA_KH', 'LINK_DRIVE', 'LINK_ANH_GOC', 'LINK_VIDEO_FINAL', 'TRANG_THAI', 'MA_DOT_GIAO', 'SO_VIDEO_DOT',
  'SO_ANH_SAN_PHAM', 'SO_ANH_NHAN_VAT', 'SO_LOGO', 'NGAY_GUI_LINK_ANH',
  'DUYET_Y_TUONG', 'DUYET_KICH_BAN',
  'DUYET_CUOI', 'NGAY_GIAO', 'GHI_CHU_HE_THONG'
];

/**
 * Tiêu đề câu hỏi trong biểu mẫu. Đây đồng thời là TÊN CỘT trong trang
 * KHACH_HANG, nên mọi chỗ tra cứu đều dùng lại đúng các hằng số này.
 * Biểu mẫu chỉ thu phần CHỮ. Phần ảnh đi qua thư mục Drive.
 */
var CAU_HOI = {
  EMAIL: 'Email nhận bàn giao',
  TEN_DN: 'Tên doanh nghiệp',
  NGANH: 'Ngành nghề và khu vực hoạt động',
  DICH_VU: 'Dịch vụ đang bán',
  NHOM_KHACH: 'Nhóm khách hàng mục tiêu',
  VAN_DE: 'Ba vấn đề khách thường gặp',
  BANG_GIA: 'Bảng giá dịch vụ',
  BANG_CHUNG: 'Bằng chứng được phép dùng',
  CAM_KET_CAM: 'Câu không được phép cam kết',
  PHONG_CACH: 'Phong cách thương hiệu',
  MANG_XA_HOI: 'Tài khoản mạng xã hội',
  DANH_SACH_SAN_PHAM: 'Danh sách sản phẩm cần lên hình',
  MO_TA_NHAN_VAT: 'Mô tả nhân vật đại diện',
  XAC_NHAN_QUYEN_ANH: 'Xác nhận quyền sử dụng hình ảnh'
};

/**
 * Cây thư mục Drive tạo cho mỗi khách hàng: chỉ hai thư mục. Giữ nguyên tên
 * 03_ / 04_ để tương thích với các khách đã tạo trước đó.
 */
var THU_MUC_CON = ['03_ANH_KHACH_GUI', '04_VIDEO_FINAL'];

/** Ba thư mục con bên trong 03_ANH_KHACH_GUI. */
var THU_MUC_ANH = ['SAN_PHAM', 'NHAN_VAT', 'LOGO'];

/** Giá trị bắt buộc của ba cột duyệt. */
var GIA_TRI_DUYET = 'Đã duyệt';
var GIA_TRI_DUYET_CUOI = 'Đã duyệt gửi';

/** Tiêu đề cột của từng trang tính. */
var TIEU_DE_TRANG = {
  HO_SO: ['MA_KH', 'NGAY_CHAY', 'TOM_TAT_DOANH_NGHIEP', 'DICH_VU_CHINH', 'NHOM_KHACH_CHINH',
          'DU_LIEU_CON_THIEU', 'ANH_CON_THIEU', 'NOI_DUNG_CHUA_CO_BANG_CHUNG',
          'TRANG_THAI_HO_SO', 'DA_GUI_YEU_CAU', 'JSON_THO', 'LOI'],
  Y_TUONG: ['MA_KH', 'MA_Y_TUONG', 'GOC_NOI_DUNG', 'VAN_DE_GIAI_QUYET', 'THONG_DIEP_CHINH',
            'NHOM_KHACH', 'DANG_VIDEO', 'SAN_PHAM_XUAT_HIEN', 'CAN_XAC_NHAN',
            'TRANG_THAI_DUYET', 'NGAY_TAO', 'JSON_THO'],
  KICH_BAN: ['MA_KH', 'MA_VIDEO', 'MA_Y_TUONG', 'CHU_DE', 'HOOK', 'THAN_KICH_BAN', 'CTA',
             'THOI_LUONG_GIAY', 'CAN_XAC_NHAN', 'MA_DOT_GIAO', 'NGAY_TAO', 'JSON_THO', 'LOI'],
  KE_HOACH_HINH: ['MA_KH', 'MA_VIDEO', 'THU_TU_CANH', 'THOAI', 'MO_TA_HINH', 'LOAI_CANH',
                  'ANH_THAM_CHIEU', 'CAU_LENH_TAO_CANH', 'CONG_CU', 'CHU_TREN_MAN_HINH',
                  'GHI_CHU_CAPCUT', 'NGAY_TAO', 'JSON_THO'],
  SAN_XUAT: ['MA_KH', 'MA_VIDEO', 'MA_DOT_GIAO', 'CHU_DE', 'TEN_TEP', 'KICH_THUOC_MB',
             'TRANG_THAI_TEP', 'KIEM_TRA_KHOP_ANH', 'KIEM_TRA_PHU_DE', 'KIEM_TRA_CAM_KET',
             'KET_LUAN_QC', 'NGUOI_QC', 'NGAY_QC', 'GHI_CHU'],
  PHAN_HOI: ['MA_KH', 'NGAY_NHAN', 'ID_THU', 'TIEU_DE_THU', 'NGUOI_GUI', 'TRICH_NOI_DUNG',
             'PHAN_LOAI', 'MA_VIDEO_LIEN_QUAN', 'LY_DO_PHAN_LOAI', 'HANH_DONG_DE_XUAT',
             'JSON_THO', 'DA_XU_LY'],
  SO_LIEU: ['MA_KH', 'MA_VIDEO', 'NEN_TANG', 'NGAY_DANG', 'LUOT_XEM', 'LUOT_TUONG_TAC',
            'LUOT_LUU', 'TIN_NHAN_VE', 'GHI_CHU'],
  CAU_HINH: ['KHOA', 'GIA_TRI', 'GHI_CHU']
};

/**
 * BẢN GIEO MẶC ĐỊNH cho trang CAU_HINH. Chỉ ghi một lần khi tạo khung và chỉ ghi
 * những khóa còn thiếu. Khi chạy thật, mã luôn đọc từ trang CAU_HINH, nên sửa câu
 * lệnh trên trang tính là đủ, không cần sửa mã.
 */
var CAU_HINH_MAC_DINH = [
  ['MODEL', 'gpt-4o-mini', 'Tên model gọi qua API'],
  ['API_URL', 'https://api.openai.com/v1/chat/completions', 'Điểm cuối API'],
  ['MAX_TOKENS', '4000', 'Tối thiểu 4000; hệ thống tự nâng nếu nhập thấp hơn'],
  ['NHIET_DO', '0.3', 'Temperature từ 0 đến 1'],
  ['SO_VIDEO_MOI_DOT', '12', 'Số video của một đợt bàn giao'],
  ['SO_VIDEO_MOI_LAN_CHAY', '4', 'Tối đa 4 vì Apps Script giới hạn 6 phút mỗi lần chạy'],
  ['ID_THU_MUC_GOC', '', 'Để trống thì hệ thống tự tạo thư mục gốc và ghi ID vào đây'],

  ['SO_ANH_SAN_PHAM_TOI_THIEU', '3', 'Số ảnh tối thiểu trong thư mục con SAN_PHAM'],
  ['SO_ANH_NHAN_VAT_TOI_THIEU', '3', 'Số ảnh tối thiểu trong thư mục con NHAN_VAT'],
  ['SO_LOGO_TOI_THIEU', '1', 'Số tệp tối thiểu trong thư mục con LOGO'],

  ['PHAM_VI_VONG_SUA', 'Một vòng sửa cho mỗi video, tối đa hai điểm sửa mỗi video, không đổi kịch bản gốc.', 'Đọc vào thư bàn giao'],
  ['HAN_GUI_YEU_CAU_SUA', 'Ba ngày làm việc kể từ ngày nhận thư bàn giao.', 'Đọc vào thư bàn giao'],
  ['CHU_KY_THU', 'Trân trọng,\nBộ phận sản xuất nội dung', 'Chữ ký cuối thư'],
  ['TU_KHOA_TIM_THU', 'subject:BAN_GIAO newer_than:30d -label:DA_PHAN_LOAI', 'Câu truy vấn Gmail khi đọc thư phản hồi'],

  ['TIEU_CHUAN_ANH',
   'ẢNH SẢN PHẨM (thư mục con SAN_PHAM): 3 đến 5 ảnh cho mỗi sản phẩm. Gồm một ảnh chính diện nền sạch, một ảnh chụp nghiêng, một ảnh cận nhãn và bao bì, một ảnh sản phẩm đang được sử dụng. Cạnh ngắn từ 1500 pixel trở lên. Không dán chữ quảng cáo lên ảnh.\n\nẢNH NHÂN VẬT ĐẠI DIỆN (thư mục con NHAN_VAT): 3 đến 5 ảnh chân dung của cùng một người, gồm chính diện, nghiêng ba phần tư và bán thân. Ánh sáng rõ mặt, không đeo kính râm, không bị vật khác che.\n\nLOGO (thư mục con LOGO): tệp PNG nền trong suốt hoặc SVG. Nếu có, gửi kèm mã màu chính và tên phông chữ.\n\nĐẶT TÊN TỆP: SP_01, SP_02 cho ảnh sản phẩm; NV_01, NV_02 cho ảnh nhân vật; LOGO cho tệp logo.',
   'Đoạn tiêu chuẩn ảnh, được ghép vào thư gửi liên kết nộp ảnh'],

  ['MAU_THU_LINK_ANH',
   'Kính gửi anh/chị {TEN_KHACH},\n\nCảm ơn anh/chị đã gửi thông tin. Mã hồ sơ của anh/chị là {MA_KH}.\n\nToàn bộ video của gói này được dựng từ ảnh do anh/chị cung cấp, anh/chị không phải quay bất kỳ cảnh nào. Vui lòng tải ảnh vào thư mục sau, đúng ba thư mục con đã tạo sẵn:\n\n{LINK_ANH}\n\nTIÊU CHUẨN ẢNH:\n{TIEU_CHUAN_ANH}\n\nHệ thống sẽ tự kiểm tra khi ảnh được tải lên. Nếu còn thiếu, anh/chị sẽ nhận thêm một thư nhắc.\n\n{CHU_KY}',
   'Thư gửi khách kèm liên kết nộp ảnh. Ghép từ dữ liệu bảng tính, KHÔNG do AI soạn'],

  ['MAU_THU_BO_SUNG',
   'Kính gửi anh/chị {TEN_KHACH},\n\nSau khi rà soát hồ sơ đầu vào, bên sản xuất cần bổ sung các mục sau để bắt đầu viết kịch bản:\n\n{DANH_SACH_THIEU}\n\nẢnh còn thiếu:\n{ANH_CON_THIEU}\n\nThư mục nộp ảnh: {LINK_ANH}\n\nAnh/chị vui lòng bấm Trả lời ngay trong thư này nếu cần trao đổi thêm.\n\n{CHU_KY}',
   'Thư yêu cầu bổ sung. Ghép từ dữ liệu bảng tính, KHÔNG do AI soạn'],

  ['RANG_BUOC_CHUNG',
   'RÀNG BUỘC BẮT BUỘC:\n1. Không tự tạo số liệu, thành tích, giải thưởng hay lời chứng thực. Chỉ dùng dữ liệu được cung cấp.\n2. Mọi nội dung chưa có bằng chứng trong dữ liệu đầu vào phải được gắn nhãn CAN_XAC_NHAN.\n3. Không thay mặt người bán trả lời khách hàng, không soạn thư gửi khách.\n4. Không báo giá, không cam kết kết quả, không dùng từ ngữ tuyệt đối.\n5. Nếu thiếu dữ liệu thì ghi rõ là thiếu, không suy đoán.\n6. Chỉ trả về một đối tượng JSON hợp lệ, không lời dẫn, không dấu ```.',
   'Đoạn ràng buộc được ghép vào mọi câu lệnh gửi AI'],

  ['CAU_LENH_KIEM_TRA_HO_SO',
   'Bạn là trợ lý rà soát hồ sơ đầu vào của khách hàng dịch vụ nhỏ. Gói dịch vụ này dựng toàn bộ video bằng AI từ ảnh khách cung cấp, khách không quay video. Đọc dữ liệu biểu mẫu kèm bảng kiểm kê ảnh đã nhận và trả về JSON đúng cấu trúc:\n{"tom_tat_doanh_nghiep":"tối đa 180 từ","dich_vu_chinh":"","nhom_khach_chinh":"","du_lieu_con_thieu":["..."],"noi_dung_chua_co_bang_chung":["..."],"trang_thai":"CAN_BO_SUNG hoặc DU_DU_LIEU"}\nĐặt trang_thai bằng CAN_BO_SUNG nếu thiếu bất kỳ thông tin nào cần cho việc viết kịch bản, hoặc nếu chưa có xác nhận quyền sử dụng hình ảnh.',
   'Câu lệnh cho bước Kiểm tra hồ sơ đầu vào'],

  ['CAU_LENH_TAO_Y_TUONG',
   'Bạn là người lên kế hoạch nội dung video ngắn cho doanh nghiệp nhỏ. Toàn bộ hình ảnh sẽ được tạo bằng AI từ bộ ảnh sản phẩm và ảnh nhân vật đại diện mà khách đã gửi, không có cảnh quay thật. Vì vậy chỉ đề xuất những góc nội dung có thể thể hiện bằng sản phẩm, nhân vật đại diện, bối cảnh minh họa và đồ họa chữ; không đề xuất góc cần quay tại cơ sở, cần khách hàng thật xuất hiện hay cần cảnh sự kiện có thật.\nDựa trên hồ sơ khách hàng, đề xuất đúng 20 góc nội dung khác nhau, bám sát dịch vụ đang bán và ba vấn đề khách thường gặp. Trả về JSON đúng cấu trúc:\n{"danh_sach":[{"goc_noi_dung":"","van_de_giai_quyet":"","thong_diep_chinh":"","nhom_khach":"","dang_video":"","san_pham_xuat_hien":"","can_xac_nhan":""}]}\nTrường san_pham_xuat_hien ghi tên sản phẩm cần lên hình, lấy từ danh sách sản phẩm khách đã khai. Trường can_xac_nhan ghi rõ chi tiết cần khách xác nhận; nếu không có thì để chuỗi rỗng.',
   'Câu lệnh cho bước Tạo 20 góc nội dung'],

  ['CAU_LENH_VIET_KICH_BAN',
   'Bạn là người viết kịch bản video ngắn 30 đến 60 giây cho doanh nghiệp nhỏ. Video được dựng hoàn toàn bằng AI từ ảnh khách cung cấp, do đó lời thoại phải do nhân vật đại diện nói hoặc do lời dẫn ngoài hình, không mô tả cảnh cần quay thật. Viết kịch bản cho một góc nội dung được cung cấp, đúng phong cách thương hiệu và tuyệt đối tránh các câu bị cấm. Trả về JSON đúng cấu trúc:\n{"chu_de":"","hook":"","than_kich_ban":"","cta":"","thoi_luong_giay":0,"can_xac_nhan":""}\nThân kịch bản viết theo từng câu thoại, mỗi câu xuống dòng.',
   'Câu lệnh cho bước Viết kịch bản'],

  ['CAU_LENH_KE_HOACH_HINH',
   'Bạn là người lên kế hoạch hình ảnh cho video ngắn dựng hoàn toàn bằng AI. Bạn được cung cấp kịch bản và DANH SÁCH TỆP ẢNH mà khách đã nộp. Chia kịch bản thành các cảnh và gắn đúng tệp ảnh tham chiếu cho từng cảnh. Trả về JSON đúng cấu trúc:\n{"danh_sach_canh":[{"thu_tu":1,"thoai":"","mo_ta_hinh":"","loai_canh":"","anh_tham_chieu":"","cau_lenh_tao_canh":"","cong_cu":"","chu_tren_man_hinh":"","ghi_chu_capcut":""}]}\nQUY TẮC PHÂN LOẠI:\nCANH_SAN_PHAM dùng ảnh sản phẩm gốc làm tham chiếu, chỉ thêm chuyển động máy quay hoặc thay đổi ánh sáng; tuyệt đối không mô tả việc vẽ lại bao bì, nhãn hay chữ trên sản phẩm.\nCANH_NHAN_VAT dùng ảnh chân dung người đại diện làm tham chiếu để giữ cùng một gương mặt trong mọi video.\nCANH_MINH_HOA là cảnh bối cảnh không gắn với sản phẩm cụ thể, dài 4 đến 8 giây.\nCANH_DO_HOA gồm logo, bảng giá và chữ động, làm trong CapCut.\nQUY TẮC BẮT BUỘC: trường anh_tham_chieu chỉ được lấy từ DANH SÁCH TỆP ẢNH được cung cấp, không được bịa tên tệp. CANH_SAN_PHAM và CANH_NHAN_VAT bắt buộc phải có anh_tham_chieu; nếu danh sách không có tệp phù hợp thì ghi THIEU_ANH. CANH_MINH_HOA và CANH_DO_HOA để anh_tham_chieu là chuỗi rỗng.\nTrường cong_cu chỉ nhận một trong ba giá trị VEO, SEEDANCE, CAPCUT.',
   'Câu lệnh cho bước Tạo kế hoạch hình ảnh'],

  ['CAU_LENH_PHAN_LOAI_PHAN_HOI',
   'Bạn là trợ lý phân loại thư phản hồi của khách hàng sau khi nhận video. Dựa vào phạm vi vòng sửa đã mua và danh sách video đã giao, phân loại thư thành đúng một trong ba nhãn:\nLOI_CUNG_CAP nghĩa là lỗi thuộc về bên sản xuất, ví dụ sai tên, sai logo, sai thông tin khách đã cung cấp, lỗi kỹ thuật, hoặc hình sản phẩm và nhân vật trong video không khớp với ảnh gốc khách đã gửi.\nTRONG_VONG_SUA nghĩa là yêu cầu sửa nằm trong phạm vi vòng sửa đã mua.\nPHAT_SINH nghĩa là yêu cầu vượt phạm vi, phải báo giá riêng, ví dụ đổi định vị sau khi đã duyệt kịch bản, thêm sản phẩm mới chưa có ảnh, đổi người đại diện.\nTrả về JSON đúng cấu trúc:\n{"phan_loai":"","ma_video_lien_quan":"","ly_do_phan_loai":"","hanh_dong_de_xuat":""}\nKhông soạn thư trả lời khách, không đề xuất mức giá.',
   'Câu lệnh cho bước Đọc thư phản hồi']
];

/* =========================== MENU =========================== */

/**
 * Tạo menu khi mở bảng tính. Mỗi bước là một mục để chạy tay và dễ gỡ lỗi.
 *
 * Hai mục "Mở bảng điều khiển" và "Kiểm tra cài đặt bảng điều khiển" trỏ tới
 * hàm nằm trong tệp bang_dieu_khien.gs. Mục menu chỉ là một chuỗi tên hàm, Google
 * chỉ tra khi người dùng bấm vào, nên menu vẫn hiện dù tệp đó chưa được dán.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('San xuat video')
    .addItem('1. Tạo khung trang tính', 'taoKhungTrangTinh')
    .addItem('2. Tạo biểu mẫu thu thập thông tin', 'taoBieuMauThuThapThongTin')
    .addItem('3. Tạo thư mục và gửi liên kết nộp ảnh', 'taoThuMucVaGuiLinkAnh')
    .addItem('4. Đếm ảnh khách đã nộp', 'demAnhKhachNop')
    .addItem('5. Kiểm tra hồ sơ đầu vào', 'kiemTraHoSoDauVao')
    .addItem('6. Gửi thư yêu cầu bổ sung', 'guiThuYeuCauBoSung')
    .addSeparator()
    .addItem('7. Tạo 20 góc nội dung', 'taoGocNoiDung')
    .addItem('8. Viết kịch bản (cần DUYET_Y_TUONG = Đã duyệt)', 'vietKichBan')
    .addItem('9. Tạo kế hoạch hình (cần DUYET_KICH_BAN = Đã duyệt)', 'taoKeHoachHinh')
    .addSeparator()
    .addItem('10. Ghi kết quả QC vào SAN_XUAT', 'ghiKetQuaQC')
    .addItem('11. Bàn giao qua Gmail', 'banGiaoQuaGmail')
    .addItem('12. Đọc thư phản hồi và phân loại', 'docThuPhanHoi')
    .addSeparator()
    .addItem('Mở bảng điều khiển', 'moBangDieuKhien')
    .addItem('Kiểm tra cài đặt bảng điều khiển', 'kiemTraCaiDatBangDieuKhien')
    .addSeparator()
    .addItem('Xem liên kết thư mục của khách', 'xemLienKetThuMuc')
    .addItem('Kiểm tra kết nối API', 'kiemTraKetNoiAPI')
    .addItem('Cài đặt ba kích hoạt tự động', 'caiDatKichHoatTuDong')
    .addToUi();
}

/* =========================== BƯỚC 1: KHUNG TRANG TÍNH =========================== */

/**
 * Tạo đầy đủ trang tính và tiêu đề cột. Không tạo trang KHACH_HANG vì trang đó
 * sẽ do biểu mẫu sinh ra ở bước 2, sau đó được đổi tên.
 */
function taoKhungTrangTinh() {
  var bangTinh = bangTinh_();

  taoTrangNeuThieu_(TRANG.HO_SO, TIEU_DE_TRANG.HO_SO);
  taoTrangNeuThieu_(TRANG.Y_TUONG, TIEU_DE_TRANG.Y_TUONG);
  taoTrangNeuThieu_(TRANG.KICH_BAN, TIEU_DE_TRANG.KICH_BAN);
  taoTrangNeuThieu_(TRANG.KE_HOACH_HINH, TIEU_DE_TRANG.KE_HOACH_HINH);
  taoTrangNeuThieu_(TRANG.SAN_XUAT, TIEU_DE_TRANG.SAN_XUAT);
  taoTrangNeuThieu_(TRANG.PHAN_HOI, TIEU_DE_TRANG.PHAN_HOI);
  taoTrangNeuThieu_(TRANG.SO_LIEU, TIEU_DE_TRANG.SO_LIEU);
  var trangCauHinh = taoTrangNeuThieu_(TRANG.CAU_HINH, TIEU_DE_TRANG.CAU_HINH);

  // Chỉ ghi các khóa còn thiếu, không ghi đè giá trị người dùng đã sửa.
  gieoCauHinhMacDinh_(trangCauHinh);

  // Xóa trang mặc định còn rỗng của bảng tính mới.
  var danhSach = bangTinh.getSheets();
  for (var i = 0; i < danhSach.length; i++) {
    var ten = danhSach[i].getName();
    var laTrangHeThong = false;
    for (var khoa in TRANG) {
      if (TRANG[khoa] === ten) { laTrangHeThong = true; break; }
    }
    if (!laTrangHeThong && danhSach[i].getLastRow() === 0 && bangTinh.getSheets().length > 1) {
      bangTinh.deleteSheet(danhSach[i]);
    }
  }

  thongBao_('Đã tạo khung trang tính. Bước tiếp theo: Tạo biểu mẫu thu thập thông tin.');
}

/** Tạo một trang tính kèm tiêu đề cột nếu chưa tồn tại. */
function taoTrangNeuThieu_(tenTrang, tieuDe) {
  var bangTinh = bangTinh_();
  var trang = bangTinh.getSheetByName(tenTrang);
  if (!trang) { trang = bangTinh.insertSheet(tenTrang); }

  if (trang.getLastRow() === 0) {
    trang.getRange(1, 1, 1, tieuDe.length).setValues([tieuDe]).setFontWeight('bold');
    trang.setFrozenRows(1);
  } else {
    themCotNeuThieu_(trang, tieuDe);
  }
  return trang;
}

/** Ghi các khóa cấu hình mặc định còn thiếu vào trang CAU_HINH. */
function gieoCauHinhMacDinh_(trangCauHinh) {
  var tieuDe = docTieuDe_(trangCauHinh);
  var cotKhoa = viTriCotBatBuoc_(tieuDe, 'KHOA');
  var daCo = {};

  if (trangCauHinh.getLastRow() > 1) {
    var duLieu = trangCauHinh.getRange(2, 1, trangCauHinh.getLastRow() - 1, trangCauHinh.getLastColumn()).getValues();
    for (var i = 0; i < duLieu.length; i++) {
      daCo[String(duLieu[i][cotKhoa]).trim()] = true;
    }
  }

  for (var j = 0; j < CAU_HINH_MAC_DINH.length; j++) {
    var dong = CAU_HINH_MAC_DINH[j];
    if (!daCo[dong[0]]) {
      themDong_(trangCauHinh, { 'KHOA': dong[0], 'GIA_TRI': dong[1], 'GHI_CHU': dong[2] });
    }
  }
}

/* =========================== BƯỚC 2: BIỂU MẪU =========================== */

/**
 * Tạo biểu mẫu bằng FormApp, nối phản hồi về chính bảng tính đang mở, đổi tên
 * trang phản hồi thành KHACH_HANG, thêm các cột hệ thống và in ra đường dẫn.
 *
 * LƯU Ý QUAN TRỌNG: FormApp KHÔNG có hàm tạo câu hỏi tải tệp. Vì vậy biểu mẫu
 * này chỉ thu phần chữ; ảnh thô được nộp qua thư mục Drive ở bước 3.
 */
function taoBieuMauThuThapThongTin() {
  var bangTinh = bangTinh_();

  var trangCu = bangTinh.getSheetByName(TRANG.KHACH_HANG);
  if (trangCu) {
    if (trangCu.getLastRow() === 0) {
      bangTinh.deleteSheet(trangCu); // trang rỗng, xóa để nhường tên cho trang phản hồi
    } else {
      throw new Error('Đã tồn tại trang KHACH_HANG có dữ liệu. Hãy đổi tên trang đó, ví dụ KHACH_HANG_CU, rồi chạy lại bước này.');
    }
  }

  var tenTruoc = {};
  var danhSachTruoc = bangTinh.getSheets();
  for (var i = 0; i < danhSachTruoc.length; i++) { tenTruoc[danhSachTruoc[i].getName()] = true; }

  var bieuMau = FormApp.create('Hồ sơ đầu vào - Gói 12 video ngắn mỗi tháng');
  bieuMau.setDescription(
    'Gói này dựng toàn bộ video bằng AI từ ảnh do anh/chị cung cấp. Anh/chị KHÔNG phải quay video.\n' +
    'Biểu mẫu này chỉ thu phần thông tin dạng chữ. Ngay sau khi gửi biểu mẫu, anh/chị sẽ nhận một thư ' +
    'kèm liên kết thư mục để tải ảnh sản phẩm, ảnh nhân vật đại diện và tệp logo.\n' +
    'Những thông tin dưới đây được dùng để viết kịch bản và sẽ không được suy đoán thêm.');

  bieuMau.addTextItem().setTitle(CAU_HOI.EMAIL).setRequired(true);
  bieuMau.addTextItem().setTitle(CAU_HOI.TEN_DN).setRequired(true);
  bieuMau.addTextItem().setTitle(CAU_HOI.NGANH).setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.DICH_VU)
    .setHelpText('Liệt kê từng dịch vụ đang bán, mỗi dịch vụ một dòng.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.NHOM_KHACH)
    .setHelpText('Ai là người trả tiền, họ ở đâu, đặc điểm nhận dạng.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.VAN_DE)
    .setHelpText('Ba vấn đề khách thường gặp trước khi mua, mỗi vấn đề một dòng.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.BANG_GIA)
    .setHelpText('Ghi rõ mức giá hoặc khoảng giá được phép nói công khai.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.BANG_CHUNG)
    .setHelpText('Số liệu, chứng nhận, phản hồi thật mà bên bán được phép sử dụng.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.CAM_KET_CAM)
    .setHelpText('Những câu, con số hoặc cam kết tuyệt đối không được dùng trong video.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.PHONG_CACH)
    .setHelpText('Giọng điệu, từ cấm, màu sắc, phông chữ, cách xưng hô với khách.').setRequired(true);

  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.DANH_SACH_SAN_PHAM)
    .setHelpText('Liệt kê từng sản phẩm hoặc gói dịch vụ cần xuất hiện trong video, mỗi mục một dòng. ' +
                 'Mỗi mục cần có ảnh riêng trong thư mục SAN_PHAM.').setRequired(true);
  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.MO_TA_NHAN_VAT)
    .setHelpText('Nhân vật đại diện sẽ xuất hiện trong cả 12 video: họ tên, độ tuổi, giới tính, ' +
                 'kiểu tóc, trang phục thường mặc, bối cảnh hay xuất hiện. Nếu doanh nghiệp chưa có ' +
                 'người đại diện, ghi rõ "chưa có" để bên sản xuất đề xuất một nhân vật mẫu.')
    .setRequired(true);

  // Xác nhận quyền hình ảnh: bắt buộc, dạng chọn một để dữ liệu về bảng gọn.
  bieuMau.addMultipleChoiceItem().setTitle(CAU_HOI.XAC_NHAN_QUYEN_ANH)
    .setHelpText('Video được tạo bằng AI từ ảnh anh/chị gửi, nên xác nhận này là bắt buộc.')
    .setChoiceValues([
      'Tôi xác nhận có quyền sử dụng ảnh sản phẩm và có sự đồng ý của người trong ảnh cho mục đích quảng cáo, kể cả khi hình ảnh được tái tạo bằng AI',
      'Tôi chưa xác nhận được, cần trao đổi thêm'
    ])
    .setRequired(true);

  bieuMau.addParagraphTextItem().setTitle(CAU_HOI.MANG_XA_HOI)
    .setHelpText('Đường liên kết các tài khoản sẽ đăng video.').setRequired(false);

  bieuMau.setDestination(FormApp.DestinationType.SPREADSHEET, bangTinh.getId());
  SpreadsheetApp.flush();

  // Chờ Google tạo trang phản hồi rồi tìm trang mới xuất hiện.
  var trangPhanHoi = null;
  for (var lan = 0; lan < 10 && !trangPhanHoi; lan++) {
    Utilities.sleep(1500);
    var bangTinhMoi = SpreadsheetApp.openById(bangTinh.getId());
    var danhSachSau = bangTinhMoi.getSheets();
    for (var j = 0; j < danhSachSau.length; j++) {
      if (!tenTruoc[danhSachSau[j].getName()]) { trangPhanHoi = danhSachSau[j]; break; }
    }
  }
  if (!trangPhanHoi) {
    throw new Error('Không tìm thấy trang phản hồi của biểu mẫu. Hãy mở bảng tính, đổi tên trang phản hồi thành KHACH_HANG bằng tay, rồi bỏ qua bước này.');
  }

  trangPhanHoi.setName(TRANG.KHACH_HANG);
  trangPhanHoi.setFrozenRows(1);
  trangPhanHoi.getRange(1, 1, 1, trangPhanHoi.getLastColumn()).setFontWeight('bold');
  themCotNeuThieu_(trangPhanHoi, COT_HE_THONG_KHACH_HANG);
  gonQuyTacDuyet_(trangPhanHoi);

  var duongDan = bieuMau.getPublishedUrl();
  var duongDanSua = bieuMau.getEditUrl();
  Logger.log('Đường dẫn biểu mẫu gửi khách: ' + duongDan);
  Logger.log('Đường dẫn chỉnh sửa biểu mẫu: ' + duongDanSua);
  hopThoai_('Đã tạo biểu mẫu',
    'Đường dẫn gửi khách:\n' + duongDan +
    '\n\nĐường dẫn chỉnh sửa:\n' + duongDanSua +
    '\n\nLưu ý: biểu mẫu này chỉ thu phần chữ. Apps Script không tạo được câu hỏi tải tệp, ' +
    'nên ảnh thô đi qua thư mục Drive ở bước 3.');
}

/**
 * Gắn danh sách xổ cho ba cột duyệt trên trang KHACH_HANG để chọn thay vì gõ
 * tay, tránh sai chính tả làm cổng khóa không mở.
 */
function gonQuyTacDuyet_(trangKhach) {
  var tieuDe = docTieuDe_(trangKhach);
  var soDong = Math.max(trangKhach.getMaxRows() - 1, 1);

  var quyTacDuyet = SpreadsheetApp.newDataValidation()
    .requireValueInList([GIA_TRI_DUYET, 'Cần sửa'], true).setAllowInvalid(false).build();
  var quyTacGui = SpreadsheetApp.newDataValidation()
    .requireValueInList([GIA_TRI_DUYET_CUOI, 'Cần sửa'], true).setAllowInvalid(false).build();

  var cotYT = viTriCot_(tieuDe, 'DUYET_Y_TUONG');
  var cotKB = viTriCot_(tieuDe, 'DUYET_KICH_BAN');
  var cotCuoi = viTriCot_(tieuDe, 'DUYET_CUOI');

  if (cotYT > -1) { trangKhach.getRange(2, cotYT + 1, soDong, 1).setDataValidation(quyTacDuyet); }
  if (cotKB > -1) { trangKhach.getRange(2, cotKB + 1, soDong, 1).setDataValidation(quyTacDuyet); }
  if (cotCuoi > -1) { trangKhach.getRange(2, cotCuoi + 1, soDong, 1).setDataValidation(quyTacGui); }
}

/* =========================== BƯỚC 3: THƯ MỤC VÀ LIÊN KẾT NỘP ẢNH =========================== */

/**
 * Tạo cây thư mục Drive cho dòng khách hàng đang chọn, mở quyền tải lên cho
 * riêng thư mục 03_ANH_KHACH_GUI rồi gửi thư kèm liên kết và tiêu chuẩn ảnh.
 *
 * Chỉ mở quyền trên đúng thư mục ảnh, không mở trên thư mục gốc của khách, để
 * khách không thấy video chưa duyệt trong 04_VIDEO_FINAL.
 */
function taoThuMucVaGuiLinkAnh(dongCuThe) {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var dong = dongCuThe || layDongDangChon_();
  var tieuDe = docTieuDe_(trang);

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) {
    maKH = sinhMaKhachHang_();
    ghiO_(trang, tieuDe, dong, 'MA_KH', maKH);
  }
  var tenDN = String(docO_(trang, tieuDe, dong, CAU_HOI.TEN_DN) || 'Khách hàng').trim();

  var thuMucGoc = layThuMucGoc_();
  var thuMucKhach = layHoacTaoThuMuc_(thuMucGoc, maKH + ' - ' + tenDN);

  var thuMucAnh = null, thuMucVideo = null;
  for (var i = 0; i < THU_MUC_CON.length; i++) {
    var tm = layHoacTaoThuMuc_(thuMucKhach, THU_MUC_CON[i]);
    if (THU_MUC_CON[i] === '03_ANH_KHACH_GUI') { thuMucAnh = tm; }
    if (THU_MUC_CON[i] === '04_VIDEO_FINAL') { thuMucVideo = tm; }
  }
  for (var j = 0; j < THU_MUC_ANH.length; j++) {
    layHoacTaoThuMuc_(thuMucAnh, THU_MUC_ANH[j]);
  }

  // Mở quyền tải lên cho riêng thư mục ảnh. Nếu tài khoản bị chính sách chặn,
  // ghi cảnh báo thay vì để cả bước dừng.
  var canhBaoQuyen = '';
  try {
    thuMucAnh.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  } catch (loi) {
    canhBaoQuyen = 'Không mở được quyền tải lên cho thư mục ảnh: ' + String(loi.message || loi) +
      '. Hãy chia sẻ thủ công thư mục 03_ANH_KHACH_GUI với quyền Người chỉnh sửa.';
  }

  ghiO_(trang, tieuDe, dong, 'LINK_DRIVE', thuMucKhach.getUrl());
  ghiO_(trang, tieuDe, dong, 'LINK_ANH_GOC', thuMucAnh.getUrl());
  ghiO_(trang, tieuDe, dong, 'LINK_VIDEO_FINAL', thuMucVideo.getUrl());
  if (!String(docO_(trang, tieuDe, dong, 'MA_DOT_GIAO')).trim()) {
    ghiO_(trang, tieuDe, dong, 'MA_DOT_GIAO', 'DOT1');
  }
  if (!String(docO_(trang, tieuDe, dong, 'SO_VIDEO_DOT')).trim()) {
    ghiO_(trang, tieuDe, dong, 'SO_VIDEO_DOT', Number(layCauHinh_('SO_VIDEO_MOI_DOT', '12')));
  }

  var email = String(docO_(trang, tieuDe, dong, CAU_HOI.EMAIL)).trim();
  if (!email) {
    ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'CHO_ANH');
    thongBao_('Đã tạo thư mục cho ' + maKH + ' nhưng dòng này không có email nên chưa gửi liên kết.');
    hienLienKetThuMuc_(maKH, thuMucGoc, thuMucKhach, thuMucAnh, thuMucVideo,
                       'Đã tạo thư mục. Chưa gửi thư vì dòng này không có email.');
    return;
  }

  var thanThu = thayThe_(layCauHinh_('MAU_THU_LINK_ANH', ''), {
    TEN_KHACH: tenDN,
    MA_KH: maKH,
    LINK_ANH: thuMucAnh.getUrl(),
    TIEU_CHUAN_ANH: layCauHinh_('TIEU_CHUAN_ANH', ''),
    CHU_KY: layCauHinh_('CHU_KY_THU', '')
  });

  GmailApp.sendEmail(email, maKH + '_NOP_ANH_DAU_VAO', thanThu);

  ghiO_(trang, tieuDe, dong, 'NGAY_GUI_LINK_ANH', new Date());
  ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'CHO_ANH');
  if (canhBaoQuyen) { ghiO_(trang, tieuDe, dong, 'GHI_CHU_HE_THONG', canhBaoQuyen); }

  thongBao_('Đã tạo thư mục và gửi liên kết nộp ảnh cho ' + maKH + '.' +
            (canhBaoQuyen ? ' Có cảnh báo quyền, xem cột GHI_CHU_HE_THONG.' : ''));
  hienLienKetThuMuc_(maKH, thuMucGoc, thuMucKhach, thuMucAnh, thuMucVideo,
                     'Đã gửi thư nộp ảnh tới ' + email + '.' + (canhBaoQuyen ? '<br>' + canhBaoQuyen : ''));
}

/* =========================== BƯỚC 4: ĐẾM ẢNH =========================== */

/**
 * Đếm số tệp trong ba thư mục con SAN_PHAM, NHAN_VAT, LOGO và ghi về bảng.
 * Chạy từ menu thì xử lý dòng đang chọn; chạy theo lịch thì quét mọi dòng
 * đang ở trạng thái CHO_ANH.
 *
 * Khi đã đủ ảnh, hạ quyền thư mục ảnh về chỉ xem để tránh tệp bị xóa hoặc
 * thay đổi sau khi bên sản xuất đã bắt đầu làm.
 */
function demAnhKhachNop(quetToanBo) {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var tieuDe = docTieuDe_(trang);

  var danhSachDong = [];
  if (quetToanBo === true) {
    for (var d = 2; d <= trang.getLastRow(); d++) {
      var tt = String(docO_(trang, tieuDe, d, 'TRANG_THAI')).trim().toUpperCase();
      if (tt === 'CHO_ANH' || tt === '') { danhSachDong.push(d); }
    }
  } else {
    danhSachDong.push(layDongDangChon_());
  }

  if (!danhSachDong.length) {
    thongBao_('Không có dòng nào cần đếm ảnh.');
    return;
  }

  var toiThieu = {
    SAN_PHAM: Number(layCauHinh_('SO_ANH_SAN_PHAM_TOI_THIEU', '3')) || 3,
    NHAN_VAT: Number(layCauHinh_('SO_ANH_NHAN_VAT_TOI_THIEU', '3')) || 3,
    LOGO: Number(layCauHinh_('SO_LOGO_TOI_THIEU', '1')) || 1
  };

  var soDuAnh = 0, soThieuAnh = 0;
  for (var i = 0; i < danhSachDong.length; i++) {
    var dong = danhSachDong[i];
    var linkAnh = String(docO_(trang, tieuDe, dong, 'LINK_ANH_GOC')).trim();
    if (!linkAnh) { continue; }

    var dem = demTepBaThuMucAnh_(linkAnh);
    if (!dem) { continue; }

    ghiO_(trang, tieuDe, dong, 'SO_ANH_SAN_PHAM', dem.SAN_PHAM);
    ghiO_(trang, tieuDe, dong, 'SO_ANH_NHAN_VAT', dem.NHAN_VAT);
    ghiO_(trang, tieuDe, dong, 'SO_LOGO', dem.LOGO);

    var du = dem.SAN_PHAM >= toiThieu.SAN_PHAM &&
             dem.NHAN_VAT >= toiThieu.NHAN_VAT &&
             dem.LOGO >= toiThieu.LOGO;

    if (du) {
      ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'DU_ANH');
      // Khóa thư mục lại để bộ ảnh không thay đổi giữa chừng.
      try {
        DriveApp.getFolderById(layIdTuDuongDan_(linkAnh))
          .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (loi) { /* không chặn quy trình nếu hạ quyền thất bại */ }
      soDuAnh++;
    } else {
      ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'CHO_ANH');
      soThieuAnh++;
    }
  }

  thongBao_('Đã đếm ảnh: ' + soDuAnh + ' khách đủ ảnh, ' + soThieuAnh + ' khách còn thiếu.');
}

/** Đếm số tệp trong ba thư mục con của 03_ANH_KHACH_GUI. */
function demTepBaThuMucAnh_(linkAnh) {
  var id = layIdTuDuongDan_(linkAnh);
  if (!id) { return null; }

  var thuMucAnh;
  try { thuMucAnh = DriveApp.getFolderById(id); } catch (loi) { return null; }

  var kq = { SAN_PHAM: 0, NHAN_VAT: 0, LOGO: 0 };
  for (var i = 0; i < THU_MUC_ANH.length; i++) {
    var ds = thuMucAnh.getFoldersByName(THU_MUC_ANH[i]);
    if (!ds.hasNext()) { continue; }
    var tep = ds.next().getFiles(), dem = 0;
    while (tep.hasNext()) { tep.next(); dem++; }
    kq[THU_MUC_ANH[i]] = dem;
  }
  return kq;
}

/** Liệt kê tên tệp ảnh theo từng thư mục con, dùng làm dữ liệu cho AI chọn ảnh tham chiếu. */
function lietKeTenTepAnh_(linkAnh) {
  var id = layIdTuDuongDan_(linkAnh);
  if (!id) { return { danhSach: [], vanBan: '(chưa có thư mục ảnh)' }; }

  var thuMucAnh;
  try { thuMucAnh = DriveApp.getFolderById(id); } catch (loi) {
    return { danhSach: [], vanBan: '(không mở được thư mục ảnh)' };
  }

  var tatCa = [], khoi = [];
  for (var i = 0; i < THU_MUC_ANH.length; i++) {
    var ds = thuMucAnh.getFoldersByName(THU_MUC_ANH[i]);
    var ten = [];
    if (ds.hasNext()) {
      var tep = ds.next().getFiles();
      while (tep.hasNext()) {
        var t = tep.next().getName();
        ten.push(t);
        tatCa.push(t);
      }
    }
    khoi.push(THU_MUC_ANH[i] + ': ' + (ten.length ? ten.join(', ') : '(trống)'));
  }
  return { danhSach: tatCa, vanBan: khoi.join('\n') };
}

/* =========================== BƯỚC 5: KIỂM TRA HỒ SƠ =========================== */

/**
 * Kiểm tra hồ sơ đầu vào. Chạy từ menu thì xử lý tối đa N dòng chưa có hồ sơ.
 * Chạy từ kích hoạt thì truyền dongCuThe để chỉ xử lý đúng dòng đó.
 * Bảng kiểm kê ảnh được đưa vào dữ liệu gửi AI.
 */
function kiemTraHoSoDauVao(dongCuThe) {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var trangHoSo = layTrang_(TRANG.HO_SO);
  var tieuDe = docTieuDe_(trang);
  var gioiHan = soLuongMoiLanChay_();
  var batDau = Date.now();

  var toiThieu = {
    SAN_PHAM: Number(layCauHinh_('SO_ANH_SAN_PHAM_TOI_THIEU', '3')) || 3,
    NHAN_VAT: Number(layCauHinh_('SO_ANH_NHAN_VAT_TOI_THIEU', '3')) || 3,
    LOGO: Number(layCauHinh_('SO_LOGO_TOI_THIEU', '1')) || 1
  };

  var danhSachDong = [];
  if (dongCuThe) {
    danhSachDong.push(dongCuThe);
  } else {
    var daCoHoSo = tapHopGiaTriCot_(trangHoSo, 'MA_KH');
    for (var dong = 2; dong <= trang.getLastRow(); dong++) {
      var ma = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
      if (!ma) {
        ma = sinhMaKhachHang_();
        ghiO_(trang, tieuDe, dong, 'MA_KH', ma);
      }
      if (!daCoHoSo[ma]) { danhSachDong.push(dong); }
      if (danhSachDong.length >= gioiHan) { break; }
    }
  }

  if (!danhSachDong.length) {
    thongBao_('Không có dòng nào cần kiểm tra hồ sơ.');
    return;
  }

  var soDaXuLy = 0;
  for (var k = 0; k < danhSachDong.length; k++) {
    // Dừng sớm ở phút thứ 4,5 để không chạm trần 6 phút của Apps Script.
    if (Date.now() - batDau > 270000) { break; }

    var soDong = danhSachDong[k];
    var maKH = String(docO_(trang, tieuDe, soDong, 'MA_KH')).trim();
    var moTa = motTaDongKhachHang_(trang, tieuDe, soDong);

    // Kiểm kê ảnh, tính phần còn thiếu trước khi gửi cho AI.
    var soSP = Number(docO_(trang, tieuDe, soDong, 'SO_ANH_SAN_PHAM')) || 0;
    var soNV = Number(docO_(trang, tieuDe, soDong, 'SO_ANH_NHAN_VAT')) || 0;
    var soLG = Number(docO_(trang, tieuDe, soDong, 'SO_LOGO')) || 0;

    var thieuAnh = [];
    if (soSP < toiThieu.SAN_PHAM) { thieuAnh.push('Ảnh sản phẩm: đã có ' + soSP + ', cần tối thiểu ' + toiThieu.SAN_PHAM); }
    if (soNV < toiThieu.NHAN_VAT) { thieuAnh.push('Ảnh nhân vật đại diện: đã có ' + soNV + ', cần tối thiểu ' + toiThieu.NHAN_VAT); }
    if (soLG < toiThieu.LOGO) { thieuAnh.push('Tệp logo: đã có ' + soLG + ', cần tối thiểu ' + toiThieu.LOGO); }

    var kiemKe = 'KIỂM KÊ ẢNH ĐÃ NHẬN:\n- Ảnh sản phẩm: ' + soSP +
                 '\n- Ảnh nhân vật đại diện: ' + soNV +
                 '\n- Tệp logo: ' + soLG +
                 (thieuAnh.length ? '\n- Đánh giá: CHƯA ĐỦ ẢNH' : '\n- Đánh giá: ĐỦ ẢNH');

    var noiDungTraVe = goiAPI_(layCauLenh_('CAU_LENH_KIEM_TRA_HO_SO'),
                               'DỮ LIỆU KHÁCH HÀNG:\n' + moTa + '\n\n' + kiemKe);
    var ketQua = phanTichJSON_(noiDungTraVe);

    if (!ketQua.hopLe) {
      // Không làm hỏng bảng: ghi nguyên văn nội dung thô để đọc lại.
      themDong_(trangHoSo, {
        'MA_KH': maKH,
        'NGAY_CHAY': new Date(),
        'TRANG_THAI_HO_SO': 'LOI_JSON',
        'ANH_CON_THIEU': thieuAnh.join('\n'),
        'JSON_THO': ketQua.tho,
        'LOI': 'AI trả về nội dung không phải JSON hợp lệ. Xem cột JSON_THO.'
      });
      ghiO_(trang, tieuDe, soDong, 'TRANG_THAI', 'LOI_JSON');
      continue;
    }

    var duLieu = ketQua.duLieu;
    var trangThai = String(duLieu.trang_thai || '').trim().toUpperCase();
    if (trangThai !== 'DU_DU_LIEU') { trangThai = 'CAN_BO_SUNG'; }
    // Thiếu ảnh thì luôn là CAN_BO_SUNG, bất kể AI kết luận thế nào.
    if (thieuAnh.length) { trangThai = 'CAN_BO_SUNG'; }

    themDong_(trangHoSo, {
      'MA_KH': maKH,
      'NGAY_CHAY': new Date(),
      'TOM_TAT_DOANH_NGHIEP': chuoiAnToan_(duLieu.tom_tat_doanh_nghiep),
      'DICH_VU_CHINH': chuoiAnToan_(duLieu.dich_vu_chinh),
      'NHOM_KHACH_CHINH': chuoiAnToan_(duLieu.nhom_khach_chinh),
      'DU_LIEU_CON_THIEU': gopDanhSach_(duLieu.du_lieu_con_thieu),
      'ANH_CON_THIEU': thieuAnh.join('\n'),
      'NOI_DUNG_CHUA_CO_BANG_CHUNG': gopDanhSach_(duLieu.noi_dung_chua_co_bang_chung),
      'TRANG_THAI_HO_SO': trangThai,
      'JSON_THO': ketQua.tho
    });
    ghiO_(trang, tieuDe, soDong, 'TRANG_THAI', trangThai);
    soDaXuLy++;
  }

  thongBao_('Đã kiểm tra hồ sơ cho ' + soDaXuLy + ' khách hàng. Xem trang HO_SO.');
}

/* =========================== BƯỚC 6: THƯ YÊU CẦU BỔ SUNG =========================== */

/**
 * Gửi thư yêu cầu bổ sung cho dòng đang chọn. Chỉ chạy khi hồ sơ mới nhất của
 * khách hàng đó có trạng thái CAN_BO_SUNG. Thư ghép từ dữ liệu bảng tính và
 * mẫu thư trong CAU_HINH; không dùng AI để soạn thư gửi khách.
 */
function guiThuYeuCauBoSung() {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var trangHoSo = layTrang_(TRANG.HO_SO);
  var dong = layDongDangChon_();
  var tieuDe = docTieuDe_(trang);

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  var hoSo = timDongHoSoMoiNhat_(trangHoSo, maKH);
  if (!hoSo) {
    throw new Error('Chưa có hồ sơ cho ' + maKH + '. Hãy chạy bước Kiểm tra hồ sơ đầu vào trước.');
  }
  if (String(hoSo.duLieu['TRANG_THAI_HO_SO']).trim().toUpperCase() !== 'CAN_BO_SUNG') {
    throw new Error('Hồ sơ của ' + maKH + ' không ở trạng thái CAN_BO_SUNG nên không gửi thư yêu cầu bổ sung.');
  }

  var email = String(docO_(trang, tieuDe, dong, CAU_HOI.EMAIL)).trim();
  if (!email) { throw new Error('Dòng đang chọn không có email nhận thư.'); }

  var tenKhach = String(docO_(trang, tieuDe, dong, CAU_HOI.TEN_DN) || 'anh/chị').trim();
  var linkAnh = String(docO_(trang, tieuDe, dong, 'LINK_ANH_GOC') || '(chưa tạo)').trim();

  var danhSachThieu = String(hoSo.duLieu['DU_LIEU_CON_THIEU'] || '').trim();
  if (!danhSachThieu) { danhSachThieu = '- (Không có mục chữ nào thiếu)'; }
  var anhConThieu = String(hoSo.duLieu['ANH_CON_THIEU'] || '').trim();
  if (!anhConThieu) { anhConThieu = '- (Đã đủ ảnh)'; }

  var thanThu = thayThe_(layCauHinh_('MAU_THU_BO_SUNG', ''), {
    TEN_KHACH: tenKhach,
    DANH_SACH_THIEU: danhSachThieu,
    ANH_CON_THIEU: anhConThieu,
    LINK_ANH: linkAnh,
    CHU_KY: layCauHinh_('CHU_KY_THU', '')
  });
  var tieuDeThu = maKH + '_YEU_CAU_BO_SUNG_HO_SO';

  if (!hoiXacNhan_('Gửi thư yêu cầu bổ sung',
      'Gửi tới: ' + email + '\nTiêu đề: ' + tieuDeThu + '\n\nXác nhận gửi?')) {
    thongBao_('Đã hủy gửi thư.');
    return;
  }

  GmailApp.sendEmail(email, tieuDeThu, thanThu);
  ghiOTheoDong_(trangHoSo, hoSo.dong, 'DA_GUI_YEU_CAU', new Date());
  ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'DA_GUI_YEU_CAU_BO_SUNG');
  thongBao_('Đã gửi thư yêu cầu bổ sung cho ' + maKH + '.');
}

/* =========================== BƯỚC 7: 20 GÓC NỘI DUNG =========================== */

/**
 * Tạo 20 góc nội dung cho khách hàng đang chọn, ghi vào Y_TUONG kèm danh sách
 * xổ hai giá trị DUYET và LOAI. Sau bước này hệ thống dừng; người vận hành tự
 * duyệt trên trang Y_TUONG rồi điền "Đã duyệt" vào cột DUYET_Y_TUONG.
 */
function taoGocNoiDung() {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var trangYTuong = layTrang_(TRANG.Y_TUONG);
  var trangHoSo = layTrang_(TRANG.HO_SO);
  var dong = layDongDangChon_();
  var tieuDe = docTieuDe_(trang);

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  var hoSo = timDongHoSoMoiNhat_(trangHoSo, maKH);
  var tomTat = hoSo ? String(hoSo.duLieu['TOM_TAT_DOANH_NGHIEP'] || '') : '';
  var linkAnh = String(docO_(trang, tieuDe, dong, 'LINK_ANH_GOC')).trim();
  var kiemKe = lietKeTenTepAnh_(linkAnh);

  var moTa = 'TÓM TẮT HỒ SƠ:\n' + tomTat +
             '\n\nDỮ LIỆU BIỂU MẪU:\n' + motTaDongKhachHang_(trang, tieuDe, dong) +
             '\n\nẢNH KHÁCH ĐÃ NỘP (mọi cảnh phải dựng được từ những ảnh này):\n' + kiemKe.vanBan;

  var noiDungTraVe = goiAPI_(layCauLenh_('CAU_LENH_TAO_Y_TUONG'), moTa);
  var ketQua = phanTichJSON_(noiDungTraVe);

  if (!ketQua.hopLe) {
    themDong_(trangYTuong, {
      'MA_KH': maKH, 'MA_Y_TUONG': 'LOI_JSON', 'NGAY_TAO': new Date(), 'JSON_THO': ketQua.tho
    });
    throw new Error('AI trả về nội dung không phải JSON hợp lệ. Nội dung thô đã được ghi vào cột JSON_THO của trang Y_TUONG.');
  }

  var danhSach = ketQua.duLieu.danh_sach || [];
  if (!danhSach.length) {
    throw new Error('AI không trả về ý tưởng nào. Nội dung thô: ' + ketQua.tho);
  }

  var soDaCo = demTheoMaKH_(trangYTuong, maKH);
  var dongDauTien = trangYTuong.getLastRow() + 1;

  for (var i = 0; i < danhSach.length; i++) {
    var y = danhSach[i] || {};
    themDong_(trangYTuong, {
      'MA_KH': maKH,
      'MA_Y_TUONG': maKH + '_YT' + demSo_(soDaCo + i + 1),
      'GOC_NOI_DUNG': chuoiAnToan_(y.goc_noi_dung),
      'VAN_DE_GIAI_QUYET': chuoiAnToan_(y.van_de_giai_quyet),
      'THONG_DIEP_CHINH': chuoiAnToan_(y.thong_diep_chinh),
      'NHOM_KHACH': chuoiAnToan_(y.nhom_khach),
      'DANG_VIDEO': chuoiAnToan_(y.dang_video),
      'SAN_PHAM_XUAT_HIEN': chuoiAnToan_(y.san_pham_xuat_hien),
      'CAN_XAC_NHAN': chuoiAnToan_(y.can_xac_nhan),
      'TRANG_THAI_DUYET': '',
      'NGAY_TAO': new Date()
    });
  }

  // Gắn danh sách xổ DUYET và LOAI cho đúng các dòng vừa thêm.
  var tieuDeYTuong = docTieuDe_(trangYTuong);
  var cotDuyet = viTriCotBatBuoc_(tieuDeYTuong, 'TRANG_THAI_DUYET') + 1;
  var quyTac = SpreadsheetApp.newDataValidation()
    .requireValueInList(['DUYET', 'LOAI'], true)
    .setAllowInvalid(false)
    .build();
  trangYTuong.getRange(dongDauTien, cotDuyet, danhSach.length, 1).setDataValidation(quyTac);

  ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'CHO_DUYET_Y_TUONG');
  thongBao_('Đã tạo ' + danhSach.length + ' góc nội dung cho ' + maKH +
            '. Mở trang Y_TUONG, đánh dấu DUYET/LOAI từng dòng, rồi điền "' + GIA_TRI_DUYET +
            '" vào cột DUYET_Y_TUONG trên trang KHACH_HANG để mở bước Viết kịch bản.');
}

/* =========================== BƯỚC 8: KỊCH BẢN =========================== */

/**
 * Viết kịch bản cho các ý tưởng đã đánh dấu DUYET và chưa có kịch bản.
 * CỔNG KHÓA: chỉ chạy khi cột DUYET_Y_TUONG bằng "Đã duyệt".
 * Mỗi lần chạy xử lý tối đa N video, mặc định 4.
 */
function vietKichBan() {
  var trangKhach = layTrang_(TRANG.KHACH_HANG);
  var trangYTuong = layTrang_(TRANG.Y_TUONG);
  var trangKichBan = layTrang_(TRANG.KICH_BAN);
  var dong = layDongDangChon_();
  var tieuDeKhach = docTieuDe_(trangKhach);

  var maKH = String(docO_(trangKhach, tieuDeKhach, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  // Cổng khóa của điểm duyệt thứ nhất.
  var duyetYTuong = String(docO_(trangKhach, tieuDeKhach, dong, 'DUYET_Y_TUONG')).trim();
  if (duyetYTuong !== GIA_TRI_DUYET) {
    throw new Error('Chưa duyệt ý tưởng. Điền đúng "' + GIA_TRI_DUYET +
      '" vào cột DUYET_Y_TUONG của dòng này. Giá trị hiện tại: "' + duyetYTuong + '".');
  }

  var maDot = String(docO_(trangKhach, tieuDeKhach, dong, 'MA_DOT_GIAO') || 'DOT1').trim();
  var phongCach = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.PHONG_CACH) || '');
  var cauCam = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.CAM_KET_CAM) || '');
  var bangChung = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.BANG_CHUNG) || '');
  var moTaNhanVat = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.MO_TA_NHAN_VAT) || '');

  var daCoKichBan = tapHopGiaTriCot_(trangKichBan, 'MA_Y_TUONG');
  var bangYTuong = docBang_(trangYTuong);
  var gioiHan = soLuongMoiLanChay_();
  var batDau = Date.now();
  var soDaXuLy = 0;
  var soVideoDaCo = demTheoMaKH_(trangKichBan, maKH);

  for (var i = 0; i < bangYTuong.hang.length && soDaXuLy < gioiHan; i++) {
    if (Date.now() - batDau > 270000) { break; }

    var hang = bangYTuong.hang[i];
    if (String(hang[bangYTuong.chiSo['MA_KH']]).trim() !== maKH) { continue; }
    if (String(hang[bangYTuong.chiSo['TRANG_THAI_DUYET']]).trim().toUpperCase() !== 'DUYET') { continue; }

    var maYTuong = String(hang[bangYTuong.chiSo['MA_Y_TUONG']]).trim();
    if (daCoKichBan[maYTuong]) { continue; }

    var duLieuGui = 'GÓC NỘI DUNG: ' + hang[bangYTuong.chiSo['GOC_NOI_DUNG']] +
      '\nVẤN ĐỀ GIẢI QUYẾT: ' + hang[bangYTuong.chiSo['VAN_DE_GIAI_QUYET']] +
      '\nTHÔNG ĐIỆP CHÍNH: ' + hang[bangYTuong.chiSo['THONG_DIEP_CHINH']] +
      '\nNHÓM KHÁCH: ' + hang[bangYTuong.chiSo['NHOM_KHACH']] +
      '\nDẠNG VIDEO: ' + hang[bangYTuong.chiSo['DANG_VIDEO']] +
      '\nSẢN PHẨM LÊN HÌNH: ' + hang[bangYTuong.chiSo['SAN_PHAM_XUAT_HIEN']] +
      '\n\nNHÂN VẬT ĐẠI DIỆN: ' + moTaNhanVat +
      '\nPHONG CÁCH THƯƠNG HIỆU: ' + phongCach +
      '\nBẰNG CHỨNG ĐƯỢC PHÉP DÙNG: ' + bangChung +
      '\nCÂU KHÔNG ĐƯỢC PHÉP CAM KẾT: ' + cauCam;

    var noiDungTraVe = goiAPI_(layCauLenh_('CAU_LENH_VIET_KICH_BAN'), duLieuGui);
    var ketQua = phanTichJSON_(noiDungTraVe);
    var maVideo = maKH + '_V' + demSo_(soVideoDaCo + soDaXuLy + 1);

    if (!ketQua.hopLe) {
      themDong_(trangKichBan, {
        'MA_KH': maKH, 'MA_VIDEO': maVideo, 'MA_Y_TUONG': maYTuong, 'MA_DOT_GIAO': maDot,
        'NGAY_TAO': new Date(), 'JSON_THO': ketQua.tho,
        'LOI': 'AI trả về nội dung không phải JSON hợp lệ. Xem cột JSON_THO.'
      });
      soDaXuLy++;
      continue;
    }

    var kb = ketQua.duLieu;
    themDong_(trangKichBan, {
      'MA_KH': maKH,
      'MA_VIDEO': maVideo,
      'MA_Y_TUONG': maYTuong,
      'CHU_DE': chuoiAnToan_(kb.chu_de),
      'HOOK': chuoiAnToan_(kb.hook),
      'THAN_KICH_BAN': chuoiAnToan_(kb.than_kich_ban),
      'CTA': chuoiAnToan_(kb.cta),
      'THOI_LUONG_GIAY': kb.thoi_luong_giay || '',
      'CAN_XAC_NHAN': chuoiAnToan_(kb.can_xac_nhan),
      'MA_DOT_GIAO': maDot,
      'NGAY_TAO': new Date(),
      'JSON_THO': ketQua.tho
    });
    soDaXuLy++;
  }

  if (soDaXuLy > 0) {
    ghiO_(trangKhach, tieuDeKhach, dong, 'TRANG_THAI', 'DANG_VIET_KICH_BAN');
  }
  thongBao_('Đã viết ' + soDaXuLy + ' kịch bản cho ' + maKH +
            ' (tối đa ' + gioiHan + ' mỗi lần chạy). Chạy lại để viết tiếp. Viết đủ thì đọc và sửa ' +
            'trực tiếp trên trang KICH_BAN, rồi điền "' + GIA_TRI_DUYET + '" vào cột DUYET_KICH_BAN.');
}

/* =========================== BƯỚC 9: KẾ HOẠCH HÌNH =========================== */

/**
 * Tạo kế hoạch hình ảnh cho các kịch bản chưa có kế hoạch.
 * CỔNG KHÓA: chỉ chạy khi cột DUYET_KICH_BAN bằng "Đã duyệt".
 * AI được cung cấp danh sách tên tệp ảnh thật của khách và chỉ được chọn ảnh
 * tham chiếu trong danh sách đó.
 */
function taoKeHoachHinh() {
  var trangKhach = layTrang_(TRANG.KHACH_HANG);
  var trangKichBan = layTrang_(TRANG.KICH_BAN);
  var trangKeHoach = layTrang_(TRANG.KE_HOACH_HINH);
  var dong = layDongDangChon_();
  var tieuDeKhach = docTieuDe_(trangKhach);

  var maKH = String(docO_(trangKhach, tieuDeKhach, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  // Cổng khóa của điểm duyệt thứ hai.
  var duyetKichBan = String(docO_(trangKhach, tieuDeKhach, dong, 'DUYET_KICH_BAN')).trim();
  if (duyetKichBan !== GIA_TRI_DUYET) {
    throw new Error('Chưa duyệt kịch bản. Điền đúng "' + GIA_TRI_DUYET +
      '" vào cột DUYET_KICH_BAN của dòng này. Giá trị hiện tại: "' + duyetKichBan + '".');
  }

  var phongCach = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.PHONG_CACH) || '');
  var moTaNhanVat = String(docO_(trangKhach, tieuDeKhach, dong, CAU_HOI.MO_TA_NHAN_VAT) || '');
  var linkAnh = String(docO_(trangKhach, tieuDeKhach, dong, 'LINK_ANH_GOC')).trim();
  var kiemKe = lietKeTenTepAnh_(linkAnh);

  if (!kiemKe.danhSach.length) {
    throw new Error('Không đọc được tệp ảnh nào trong thư mục của ' + maKH +
      '. Hãy kiểm tra cột LINK_ANH_GOC và chạy bước Đếm ảnh khách đã nộp.');
  }

  var daCoKeHoach = tapHopGiaTriCot_(trangKeHoach, 'MA_VIDEO');
  var bangKichBan = docBang_(trangKichBan);
  var gioiHan = soLuongMoiLanChay_();
  var batDau = Date.now();
  var soDaXuLy = 0;

  for (var i = 0; i < bangKichBan.hang.length && soDaXuLy < gioiHan; i++) {
    if (Date.now() - batDau > 270000) { break; }

    var hang = bangKichBan.hang[i];
    if (String(hang[bangKichBan.chiSo['MA_KH']]).trim() !== maKH) { continue; }

    var maVideo = String(hang[bangKichBan.chiSo['MA_VIDEO']]).trim();
    if (!maVideo || daCoKeHoach[maVideo]) { continue; }

    var thanKichBan = String(hang[bangKichBan.chiSo['THAN_KICH_BAN']] || '').trim();
    if (!thanKichBan) { continue; } // dòng lỗi JSON, bỏ qua

    var duLieuGui = 'MÃ VIDEO: ' + maVideo +
      '\nCHỦ ĐỀ: ' + hang[bangKichBan.chiSo['CHU_DE']] +
      '\nHOOK: ' + hang[bangKichBan.chiSo['HOOK']] +
      '\nTHÂN KỊCH BẢN:\n' + thanKichBan +
      '\nCTA: ' + hang[bangKichBan.chiSo['CTA']] +
      '\n\nNHÂN VẬT ĐẠI DIỆN (giữ nguyên trong mọi video): ' + moTaNhanVat +
      '\nPHONG CÁCH THƯƠNG HIỆU: ' + phongCach +
      '\n\nDANH SÁCH TỆP ẢNH KHÁCH ĐÃ NỘP:\n' + kiemKe.vanBan;

    var noiDungTraVe = goiAPI_(layCauLenh_('CAU_LENH_KE_HOACH_HINH'), duLieuGui);
    var ketQua = phanTichJSON_(noiDungTraVe);

    if (!ketQua.hopLe) {
      themDong_(trangKeHoach, {
        'MA_KH': maKH, 'MA_VIDEO': maVideo, 'NGAY_TAO': new Date(), 'JSON_THO': ketQua.tho,
        'MO_TA_HINH': 'AI trả về nội dung không phải JSON hợp lệ. Xem cột JSON_THO.'
      });
      soDaXuLy++;
      continue;
    }

    // Tập tên tệp thật để bắt trường hợp AI bịa tên ảnh.
    var tepThat = {};
    for (var t = 0; t < kiemKe.danhSach.length; t++) { tepThat[kiemKe.danhSach[t]] = true; }

    var canh = ketQua.duLieu.danh_sach_canh || [];
    for (var j = 0; j < canh.length; j++) {
      var c = canh[j] || {};
      var anh = chuoiAnToan_(c.anh_tham_chieu).trim();
      var loai = chuoiAnToan_(c.loai_canh).trim().toUpperCase();
      var ghiChu = chuoiAnToan_(c.ghi_chu_capcut);

      // Cảnh sản phẩm và cảnh nhân vật bắt buộc bám một tệp ảnh có thật.
      if (loai === 'CANH_SAN_PHAM' || loai === 'CANH_NHAN_VAT') {
        if (!anh || (anh !== 'THIEU_ANH' && !tepThat[anh])) {
          ghiChu = 'KIỂM TRA: ảnh tham chiếu "' + anh + '" không có trong thư mục khách. ' + ghiChu;
          anh = 'THIEU_ANH';
        }
      }

      themDong_(trangKeHoach, {
        'MA_KH': maKH,
        'MA_VIDEO': maVideo,
        'THU_TU_CANH': c.thu_tu || (j + 1),
        'THOAI': chuoiAnToan_(c.thoai),
        'MO_TA_HINH': chuoiAnToan_(c.mo_ta_hinh),
        'LOAI_CANH': loai,
        'ANH_THAM_CHIEU': anh,
        'CAU_LENH_TAO_CANH': chuoiAnToan_(c.cau_lenh_tao_canh),
        'CONG_CU': chuoiAnToan_(c.cong_cu).trim().toUpperCase(),
        'CHU_TREN_MAN_HINH': chuoiAnToan_(c.chu_tren_man_hinh),
        'GHI_CHU_CAPCUT': ghiChu,
        'NGAY_TAO': new Date(),
        'JSON_THO': (j === 0 ? ketQua.tho : '')
      });
    }
    soDaXuLy++;
  }

  if (soDaXuLy > 0) {
    ghiO_(trangKhach, tieuDeKhach, dong, 'TRANG_THAI', 'CHO_TAO_CANH');
  }
  thongBao_('Đã tạo kế hoạch hình cho ' + soDaXuLy + ' video của ' + maKH +
            '. Chạy lại để làm tiếp. Lọc cột ANH_THAM_CHIEU bằng THIEU_ANH để xem cảnh cần xử lý tay.');
}

/* =========================== BƯỚC 10: QC =========================== */

/**
 * Đối chiếu danh sách video trong KICH_BAN với tệp thực tế trong 04_VIDEO_FINAL
 * và ghi kết quả vào trang SAN_XUAT. Các cột QC thủ công đã điền được giữ nguyên.
 * Cột KIEM_TRA_KHOP_ANH là mục kiểm tra thủ công bắt buộc của phiên bản này:
 * đối chiếu nhãn, màu và gương mặt trong video với ảnh gốc khách đã gửi.
 */
function ghiKetQuaQC() {
  var trangKhach = layTrang_(TRANG.KHACH_HANG);
  var trangKichBan = layTrang_(TRANG.KICH_BAN);
  var trangSanXuat = layTrang_(TRANG.SAN_XUAT);
  var dong = layDongDangChon_();
  var tieuDeKhach = docTieuDe_(trangKhach);

  var maKH = String(docO_(trangKhach, tieuDeKhach, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  var thuMucCuoi = layThuMucCon_(trangKhach, tieuDeKhach, dong, '04_VIDEO_FINAL');
  var danhSachTep = {};
  var tep = thuMucCuoi.getFiles();
  while (tep.hasNext()) {
    var t = tep.next();
    danhSachTep[t.getName()] = t;
  }

  var bangKichBan = docBang_(trangKichBan);
  var bangSanXuat = docBang_(trangSanXuat);
  var viTriTheoMaVideo = {};
  for (var i = 0; i < bangSanXuat.hang.length; i++) {
    viTriTheoMaVideo[String(bangSanXuat.hang[i][bangSanXuat.chiSo['MA_VIDEO']]).trim()] = i + 2;
  }

  var soDat = 0, soThieu = 0;
  for (var k = 0; k < bangKichBan.hang.length; k++) {
    var hang = bangKichBan.hang[k];
    if (String(hang[bangKichBan.chiSo['MA_KH']]).trim() !== maKH) { continue; }

    var maVideo = String(hang[bangKichBan.chiSo['MA_VIDEO']]).trim();
    if (!maVideo) { continue; }

    var tenTep = '', kichThuoc = '', trangThaiTep = 'THIEU_TEP';
    for (var ten in danhSachTep) {
      if (ten.indexOf(maVideo) > -1) {
        tenTep = ten;
        kichThuoc = Math.round(danhSachTep[ten].getSize() / 1048576 * 10) / 10;
        trangThaiTep = 'DA_CO_TEP';
        break;
      }
    }
    if (trangThaiTep === 'DA_CO_TEP') { soDat++; } else { soThieu++; }

    var duLieu = {
      'MA_KH': maKH,
      'MA_VIDEO': maVideo,
      'MA_DOT_GIAO': String(hang[bangKichBan.chiSo['MA_DOT_GIAO']] || ''),
      'CHU_DE': String(hang[bangKichBan.chiSo['CHU_DE']] || ''),
      'TEN_TEP': tenTep,
      'KICH_THUOC_MB': kichThuoc,
      'TRANG_THAI_TEP': trangThaiTep,
      'NGAY_QC': new Date()
    };

    if (viTriTheoMaVideo[maVideo]) {
      // Cập nhật dòng cũ, không ghi đè các cột QC thủ công.
      var soDong = viTriTheoMaVideo[maVideo];
      for (var cot in duLieu) { ghiOTheoDong_(trangSanXuat, soDong, cot, duLieu[cot]); }
    } else {
      themDong_(trangSanXuat, duLieu);
    }
  }

  thongBao_('QC ' + maKH + ': ' + soDat + ' video đã có tệp, ' + soThieu +
            ' video thiếu tệp trong 04_VIDEO_FINAL. Nhớ điền cột KIEM_TRA_KHOP_ANH ' +
            'sau khi đối chiếu nhãn, màu và gương mặt với ảnh gốc.');
}

/* =========================== BƯỚC 11: BÀN GIAO =========================== */

/**
 * Bàn giao qua Gmail. Video đã nằm sẵn trong thư mục 04_VIDEO_FINAL thuộc chính
 * thư mục khách đang dùng để nộp ảnh, nên thư chỉ đóng vai trò thông báo và ghi
 * mốc thời gian. Thư ghép hoàn toàn từ dữ liệu bảng tính và trang CAU_HINH.
 */
function banGiaoQuaGmail() {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var trangKichBan = layTrang_(TRANG.KICH_BAN);
  var dong = layDongDangChon_();
  var tieuDe = docTieuDe_(trang);

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  // Cổng khóa 1: chỉ chạy khi DUYET_CUOI đúng bằng "Đã duyệt gửi".
  var duyetCuoi = String(docO_(trang, tieuDe, dong, 'DUYET_CUOI')).trim();
  if (duyetCuoi !== GIA_TRI_DUYET_CUOI) {
    throw new Error('Cột DUYET_CUOI phải đúng bằng "' + GIA_TRI_DUYET_CUOI +
      '" mới được bàn giao. Giá trị hiện tại: "' + duyetCuoi + '".');
  }

  var email = String(docO_(trang, tieuDe, dong, CAU_HOI.EMAIL)).trim();
  if (!email) { throw new Error('Dòng đang chọn không có email nhận bàn giao.'); }

  var maDot = String(docO_(trang, tieuDe, dong, 'MA_DOT_GIAO') || 'DOT1').trim();
  var soVideoDot = Number(docO_(trang, tieuDe, dong, 'SO_VIDEO_DOT') || layCauHinh_('SO_VIDEO_MOI_DOT', '12'));

  var thuMucCuoi = layThuMucCon_(trang, tieuDe, dong, '04_VIDEO_FINAL');

  // Cổng khóa 2: đếm số tệp trong 04_VIDEO_FINAL trước khi gửi.
  var soTep = 0;
  var tep = thuMucCuoi.getFiles();
  while (tep.hasNext()) { tep.next(); soTep++; }

  if (soTep < soVideoDot) {
    var canhBao = 'CHƯA ĐỦ VIDEO: thư mục 04_VIDEO_FINAL có ' + soTep + ' tệp, cần ' + soVideoDot +
      ' tệp cho ' + maDot + '. Đã dừng, chưa gửi thư. Thời điểm kiểm tra: ' + new Date();
    ghiO_(trang, tieuDe, dong, 'GHI_CHU_HE_THONG', canhBao);
    thongBao_(canhBao);
    return;
  }

  // Chỉ mở quyền xem cho riêng thư mục 04_VIDEO_FINAL, không đụng thư mục khác.
  thuMucCuoi.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Bảng đối chiếu mã video với chủ đề, lấy từ trang KICH_BAN.
  var bangKichBan = docBang_(trangKichBan);
  var danhSachVideo = [];
  for (var i = 0; i < bangKichBan.hang.length; i++) {
    var hang = bangKichBan.hang[i];
    if (String(hang[bangKichBan.chiSo['MA_KH']]).trim() !== maKH) { continue; }
    if (String(hang[bangKichBan.chiSo['MA_DOT_GIAO']]).trim() !== maDot) { continue; }
    danhSachVideo.push(String(hang[bangKichBan.chiSo['MA_VIDEO']]) + ': ' +
                       String(hang[bangKichBan.chiSo['CHU_DE']]));
  }
  if (!danhSachVideo.length) {
    throw new Error('Không tìm thấy dòng kịch bản nào của ' + maKH + ' thuộc ' + maDot +
      ' để lập bảng đối chiếu.');
  }

  var tieuDeThu = maKH + '_BAN_GIAO_' + maDot;
  var thanThu =
    'Số lượng video của đợt này: ' + soVideoDot + '\n\n' +
    'Video đã được đặt trong thư mục 04_VIDEO_FINAL, nằm ngay trong thư mục anh/chị đã dùng để nộp ảnh:\n' +
    thuMucCuoi.getUrl() + '\n\n' +
    'Bảng đối chiếu mã video và chủ đề:\n' + danhSachVideo.join('\n') + '\n\n' +
    'Phạm vi vòng sửa đã mua: ' + layCauHinh_('PHAM_VI_VONG_SUA', '') + '\n' +
    'Hạn gửi yêu cầu sửa: ' + layCauHinh_('HAN_GUI_YEU_CAU_SUA', '') + '\n\n' +
    'Để gửi yêu cầu sửa, anh/chị vui lòng bấm Trả lời ngay trong thư này thay vì soạn thư mới.\n\n' +
    layCauHinh_('CHU_KY_THU', '');

  if (!hoiXacNhan_('Bàn giao ' + maDot,
      'Gửi tới: ' + email + '\nTiêu đề: ' + tieuDeThu +
      '\nSố video của đợt: ' + soVideoDot + '\nSố tệp trong 04_VIDEO_FINAL: ' + soTep +
      '\n\nXác nhận gửi?')) {
    thongBao_('Đã hủy bàn giao.');
    return;
  }

  GmailApp.sendEmail(email, tieuDeThu, thanThu);

  // Chỉ ghi trạng thái sau khi gửi thành công.
  ghiO_(trang, tieuDe, dong, 'NGAY_GIAO', new Date());
  ghiO_(trang, tieuDe, dong, 'TRANG_THAI', 'CHO_PHAN_HOI');
  ghiO_(trang, tieuDe, dong, 'GHI_CHU_HE_THONG', 'Đã bàn giao ' + maDot + ' lúc ' + new Date());
  thongBao_('Đã bàn giao ' + maDot + ' cho ' + maKH + '.');
}

/* =========================== BƯỚC 12: ĐỌC THƯ PHẢN HỒI =========================== */

/**
 * Đọc thư phản hồi trong Gmail và phân loại thành LOI_CUNG_CAP, TRONG_VONG_SUA
 * hoặc PHAT_SINH. Kết quả ghi vào trang PHAN_HOI. AI chỉ phân loại, không trả
 * lời khách.
 */
function docThuPhanHoi() {
  var trangPhanHoi = layTrang_(TRANG.PHAN_HOI);
  var trangKichBan = layTrang_(TRANG.KICH_BAN);
  var truyVan = layCauHinh_('TU_KHOA_TIM_THU', 'subject:BAN_GIAO newer_than:30d -label:DA_PHAN_LOAI');
  var gioiHan = soLuongMoiLanChay_();
  var batDau = Date.now();

  var nhan = GmailApp.getUserLabelByName('DA_PHAN_LOAI') || GmailApp.createLabel('DA_PHAN_LOAI');
  var emailToi = '';
  try { emailToi = Session.getActiveUser().getEmail(); } catch (loi) { emailToi = ''; }

  var daCoIdThu = tapHopGiaTriCot_(trangPhanHoi, 'ID_THU');
  var chuoiThu = GmailApp.search(truyVan, 0, 20);
  var bangKichBan = docBang_(trangKichBan);
  var soDaXuLy = 0;

  for (var i = 0; i < chuoiThu.length && soDaXuLy < gioiHan; i++) {
    if (Date.now() - batDau > 270000) { break; }

    var chuoi = chuoiThu[i];
    var thuTrongChuoi = chuoi.getMessages();

    for (var j = 0; j < thuTrongChuoi.length && soDaXuLy < gioiHan; j++) {
      var thu = thuTrongChuoi[j];
      var idThu = thu.getId();
      var nguoiGui = thu.getFrom();

      if (daCoIdThu[idThu]) { continue; }
      if (emailToi && nguoiGui.indexOf(emailToi) > -1) { continue; } // bỏ qua thư do mình gửi

      var tieuDeThu = thu.getSubject();
      var khop = tieuDeThu.match(/KH\d{3}/);
      var maKH = khop ? khop[0] : '';
      var noiDung = thu.getPlainBody();
      if (noiDung.length > 4000) { noiDung = noiDung.substring(0, 4000); }

      // Danh sách video đã giao của khách này để AI đối chiếu.
      var danhSachVideo = [];
      for (var k = 0; k < bangKichBan.hang.length; k++) {
        var hang = bangKichBan.hang[k];
        if (maKH && String(hang[bangKichBan.chiSo['MA_KH']]).trim() !== maKH) { continue; }
        danhSachVideo.push(String(hang[bangKichBan.chiSo['MA_VIDEO']]) + ': ' +
                           String(hang[bangKichBan.chiSo['CHU_DE']]));
      }

      var duLieuGui =
        'PHẠM VI VÒNG SỬA ĐÃ MUA: ' + layCauHinh_('PHAM_VI_VONG_SUA', '') + '\n' +
        'HẠN GỬI YÊU CẦU SỬA: ' + layCauHinh_('HAN_GUI_YEU_CAU_SUA', '') + '\n\n' +
        'DANH SÁCH VIDEO ĐÃ GIAO:\n' + danhSachVideo.join('\n') + '\n\n' +
        'TIÊU ĐỀ THƯ: ' + tieuDeThu + '\n' +
        'NỘI DUNG THƯ:\n' + noiDung;

      var noiDungTraVe = goiAPI_(layCauLenh_('CAU_LENH_PHAN_LOAI_PHAN_HOI'), duLieuGui);
      var ketQua = phanTichJSON_(noiDungTraVe);

      var duLieuGhi = {
        'MA_KH': maKH,
        'NGAY_NHAN': thu.getDate(),
        'ID_THU': idThu,
        'TIEU_DE_THU': tieuDeThu,
        'NGUOI_GUI': nguoiGui,
        'TRICH_NOI_DUNG': noiDung.substring(0, 1000),
        'JSON_THO': ketQua.tho,
        'DA_XU_LY': ''
      };

      if (ketQua.hopLe) {
        var phanLoai = String(ketQua.duLieu.phan_loai || '').trim().toUpperCase();
        if (phanLoai !== 'LOI_CUNG_CAP' && phanLoai !== 'TRONG_VONG_SUA' && phanLoai !== 'PHAT_SINH') {
          phanLoai = 'CAN_XEM_LAI';
        }
        duLieuGhi['PHAN_LOAI'] = phanLoai;
        duLieuGhi['MA_VIDEO_LIEN_QUAN'] = chuoiAnToan_(ketQua.duLieu.ma_video_lien_quan);
        duLieuGhi['LY_DO_PHAN_LOAI'] = chuoiAnToan_(ketQua.duLieu.ly_do_phan_loai);
        duLieuGhi['HANH_DONG_DE_XUAT'] = chuoiAnToan_(ketQua.duLieu.hanh_dong_de_xuat);
      } else {
        duLieuGhi['PHAN_LOAI'] = 'LOI_JSON';
        duLieuGhi['LY_DO_PHAN_LOAI'] = 'AI trả về nội dung không phải JSON hợp lệ. Xem cột JSON_THO.';
      }

      themDong_(trangPhanHoi, duLieuGhi);
      soDaXuLy++;
    }
    chuoi.addLabel(nhan);
  }

  thongBao_('Đã đọc và phân loại ' + soDaXuLy + ' thư phản hồi. Xem trang PHAN_HOI.');
}

/* =========================== XEM LIÊN KẾT THƯ MỤC =========================== */

/**
 * Menu: hiện liên kết mọi thư mục liên quan tới khách đang chọn. Đồng thời
 * điền lại các cột LINK_DRIVE, LINK_ANH_GOC, LINK_VIDEO_FINAL nếu còn trống.
 */
function xemLienKetThuMuc() {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var dong = layDongDangChon_();
  var tieuDe = docTieuDe_(trang);

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) { throw new Error('Dòng đang chọn chưa có MA_KH.'); }

  var lienGoc = String(docO_(trang, tieuDe, dong, 'LINK_DRIVE')).trim();
  if (!lienGoc) {
    throw new Error('Khách ' + maKH + ' chưa có thư mục. Hãy chạy mục 3 (Tạo thư mục và gửi liên kết nộp ảnh) trước.');
  }

  var thuMucGoc = layThuMucGoc_();
  var thuMucKhach = DriveApp.getFolderById(layIdTuDuongDan_(lienGoc));
  var thuMucAnh = layHoacTaoThuMuc_(thuMucKhach, '03_ANH_KHACH_GUI');
  var thuMucVideo = layHoacTaoThuMuc_(thuMucKhach, '04_VIDEO_FINAL');

  themCotNeuThieu_(trang, COT_HE_THONG_KHACH_HANG);
  tieuDe = docTieuDe_(trang);
  if (!String(docO_(trang, tieuDe, dong, 'LINK_ANH_GOC')).trim()) {
    ghiO_(trang, tieuDe, dong, 'LINK_ANH_GOC', thuMucAnh.getUrl());
  }
  if (!String(docO_(trang, tieuDe, dong, 'LINK_VIDEO_FINAL')).trim()) {
    ghiO_(trang, tieuDe, dong, 'LINK_VIDEO_FINAL', thuMucVideo.getUrl());
  }

  hienLienKetThuMuc_(maKH, thuMucGoc, thuMucKhach, thuMucAnh, thuMucVideo, '');
}

/**
 * Hộp thoại HTML liệt kê liên kết bấm được của thư mục gốc hệ thống, thư mục
 * khách, thư mục ảnh và thư mục video. Không có giao diện (chạy từ kích hoạt)
 * thì ghi vào nhật ký.
 */
function hienLienKetThuMuc_(maKH, thuMucGoc, thuMucKhach, thuMucAnh, thuMucVideo, ghiChu) {
  var dong = function (nhan, tm) {
    return '<tr><td style="padding:4px 12px 4px 0;white-space:nowrap;color:#555">' + nhan + '</td>' +
           '<td style="padding:4px 0"><a href="' + tm.getUrl() + '" target="_blank">' + tm.getUrl() + '</a></td></tr>';
  };
  var html =
    '<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6">' +
    '<b>' + thuMucKhach.getName() + '</b>' +
    (ghiChu ? '<div style="margin:6px 0 10px;color:#0F3040">' + ghiChu + '</div>' : '<br><br>') +
    '<table style="border-collapse:collapse">' +
    dong('Thư mục gốc hệ thống', thuMucGoc) +
    dong('Thư mục khách ' + maKH, thuMucKhach) +
    dong('Ảnh khách gửi (03_ANH_KHACH_GUI)', thuMucAnh) +
    dong('Video final (04_VIDEO_FINAL)', thuMucVideo) +
    '</table></div>';

  try {
    var giaoDien = HtmlService.createHtmlOutput(html).setWidth(720).setHeight(260);
    SpreadsheetApp.getUi().showModalDialog(giaoDien, 'Liên kết thư mục của ' + maKH);
  } catch (loi) {
    Logger.log(maKH + ' | goc: ' + thuMucGoc.getUrl() + ' | khach: ' + thuMucKhach.getUrl() +
               ' | anh: ' + thuMucAnh.getUrl() + ' | video: ' + thuMucVideo.getUrl());
  }
}

/* =========================== KIỂM TRA KẾT NỐI API =========================== */

/** Gọi một lệnh rất ngắn để kiểm tra khóa API, model và đường truyền. */
function kiemTraKetNoiAPI() {
  var noiDung = goiAPI_('Bạn là công cụ kiểm tra kết nối. Chỉ trả về đúng JSON: {"trang_thai":"OK"}',
                        'Kiểm tra kết nối.');
  var ketQua = phanTichJSON_(noiDung);
  var thongDiep = 'Model: ' + layCauHinh_('MODEL', '') + '\nPhản hồi thô:\n' + ketQua.tho;
  Logger.log(thongDiep);
  hopThoai_(ketQua.hopLe ? 'Kết nối API bình thường' : 'Kết nối được nhưng trả về không phải JSON',
            thongDiep);
}

/* =========================== KÍCH HOẠT TỰ ĐỘNG =========================== */

/**
 * Hàm chạy khi biểu mẫu được gửi: sinh MA_KH, tạo cây thư mục và gửi ngay liên
 * kết nộp ảnh cho khách. KHÔNG chạy kiểm tra hồ sơ ở đây vì lúc này khách chưa
 * kịp tải ảnh, chạy sớm sẽ luôn ra kết quả thiếu ảnh.
 */
function khiNhanBieuMau(e) {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var tieuDe = docTieuDe_(trang);
  var dong = (e && e.range) ? e.range.getRow() : trang.getLastRow();
  if (dong < 2) { return; }

  var maKH = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
  if (!maKH) {
    maKH = sinhMaKhachHang_();
    ghiO_(trang, tieuDe, dong, 'MA_KH', maKH);
  }
  taoThuMucVaGuiLinkAnh(dong);
}

/**
 * Hàm chạy theo lịch: quét mọi khách đang chờ ảnh, đếm ảnh, và tự chạy kiểm tra
 * hồ sơ cho những khách vừa đủ ảnh.
 */
function chayTheoLichDemAnh() {
  demAnhKhachNop(true);

  var trang = layTrang_(TRANG.KHACH_HANG);
  var trangHoSo = layTrang_(TRANG.HO_SO);
  var tieuDe = docTieuDe_(trang);
  var daCoHoSo = tapHopGiaTriCot_(trangHoSo, 'MA_KH');

  var dem = 0;
  for (var dong = 2; dong <= trang.getLastRow() && dem < soLuongMoiLanChay_(); dong++) {
    var tt = String(docO_(trang, tieuDe, dong, 'TRANG_THAI')).trim().toUpperCase();
    var ma = String(docO_(trang, tieuDe, dong, 'MA_KH')).trim();
    if (tt === 'DU_ANH' && ma && !daCoHoSo[ma]) {
      kiemTraHoSoDauVao(dong);
      dem++;
    }
  }
}

/** Hàm chạy theo lịch: đọc thư phản hồi. */
function chayTheoLichDocPhanHoi() {
  docThuPhanHoi();
}

/**
 * Tạo ba kích hoạt cần thiết. Chạy một lần; nếu chạy lại, kích hoạt cũ cùng
 * loại sẽ bị xóa trước để tránh trùng.
 */
function caiDatKichHoatTuDong() {
  var bangTinh = bangTinh_();
  var danhSach = ScriptApp.getProjectTriggers();
  for (var i = 0; i < danhSach.length; i++) {
    var ten = danhSach[i].getHandlerFunction();
    if (ten === 'khiNhanBieuMau' || ten === 'chayTheoLichDocPhanHoi' || ten === 'chayTheoLichDemAnh') {
      ScriptApp.deleteTrigger(danhSach[i]);
    }
  }
  ScriptApp.newTrigger('khiNhanBieuMau').forSpreadsheet(bangTinh).onFormSubmit().create();
  ScriptApp.newTrigger('chayTheoLichDemAnh').timeBased().everyHours(4).create();
  ScriptApp.newTrigger('chayTheoLichDocPhanHoi').timeBased().everyHours(4).create();
  thongBao_('Đã cài ba kích hoạt: khi biểu mẫu được gửi, đếm ảnh mỗi 4 giờ, đọc thư phản hồi mỗi 4 giờ.');
}

/* =========================== GỌI API VÀ ĐỌC JSON =========================== */

/**
 * Gọi API. Luôn đặt muteHttpExceptions bằng true và ném lỗi kèm nguyên văn nội
 * dung trả về để dễ gỡ lỗi.
 */
function goiAPI_(cauLenhHeThong, noiDungNguoiDung) {
  var khoa = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!khoa) {
    throw new Error('Chưa có OPENAI_API_KEY. Vào Apps Script, mục Cài đặt dự án, phần Thuộc tính của script để thêm.');
  }

  var duongDan = layCauHinh_('API_URL', 'https://api.openai.com/v1/chat/completions');
  var model = layCauHinh_('MODEL', 'gpt-4o-mini');

  var soToken = Number(layCauHinh_('MAX_TOKENS', '4000'));
  if (!soToken || soToken < 4000) { soToken = 4000; } // ràng buộc: tối thiểu 4000

  var nhietDo = Number(layCauHinh_('NHIET_DO', '0.3'));
  if (isNaN(nhietDo)) { nhietDo = 0.3; }

  // Ghép ràng buộc chung vào mọi câu lệnh gửi AI.
  var heThongDayDu = cauLenhHeThong + '\n\n' + layCauHinh_('RANG_BUOC_CHUNG', '');

  var duLieuGui = {
    model: model,
    max_tokens: soToken,
    temperature: nhietDo,
    messages: [
      { role: 'system', content: heThongDayDu },
      { role: 'user', content: noiDungNguoiDung }
    ]
  };

  var phanHoi = UrlFetchApp.fetch(duongDan, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + khoa },
    payload: JSON.stringify(duLieuGui),
    muteHttpExceptions: true
  });

  var maTraVe = phanHoi.getResponseCode();
  var vanBan = phanHoi.getContentText();

  if (maTraVe < 200 || maTraVe >= 300) {
    throw new Error('API trả về mã lỗi ' + maTraVe + '. Nguyên văn nội dung trả về:\n' + vanBan);
  }

  var goi;
  try {
    goi = JSON.parse(vanBan);
  } catch (loi) {
    throw new Error('API trả về nội dung không phải JSON. Nguyên văn nội dung trả về:\n' + vanBan);
  }

  var noiDung = (goi && goi.choices && goi.choices[0] && goi.choices[0].message)
    ? goi.choices[0].message.content : '';
  if (!noiDung) {
    throw new Error('Không đọc được nội dung trả lời. Nguyên văn nội dung trả về:\n' + vanBan);
  }
  return noiDung;
}

/**
 * Đọc JSON từ chuỗi AI trả về. Nếu không hợp lệ thì trả về nguyên văn để ghi
 * vào cột JSON_THO, không làm hỏng bảng.
 */
function phanTichJSON_(vanBan) {
  var tho = String(vanBan == null ? '' : vanBan);
  var sach = tho.replace(/```json/gi, '').replace(/```/g, '').trim();
  var dau = sach.indexOf('{');
  var cuoi = sach.lastIndexOf('}');
  if (dau > -1 && cuoi > dau) { sach = sach.substring(dau, cuoi + 1); }
  try {
    return { hopLe: true, duLieu: JSON.parse(sach), tho: tho };
  } catch (loi) {
    return { hopLe: false, duLieu: null, tho: tho };
  }
}

/* =========================== TIỆN ÍCH BẢNG TÍNH =========================== */

/** Luôn lấy bảng tính đang mở. Không bao giờ dùng SpreadsheetApp.create. */
function bangTinh_() {
  var bt = SpreadsheetApp.getActiveSpreadsheet();
  if (!bt) {
    throw new Error('Không tìm thấy bảng tính đang mở. Mã này phải được gắn vào chính bảng tính cần dùng.');
  }
  return bt;
}

/** Lấy trang tính theo tên, ném lỗi nếu chưa có. */
function layTrang_(tenTrang) {
  var trang = bangTinh_().getSheetByName(tenTrang);
  if (!trang) {
    throw new Error('Chưa có trang ' + tenTrang +
      '. Hãy chạy mục Tạo khung trang tính, và mục Tạo biểu mẫu nếu thiếu KHACH_HANG.');
  }
  return trang;
}

/** Đọc hàng tiêu đề của trang tính. */
function docTieuDe_(trang) {
  var soCot = trang.getLastColumn();
  if (soCot < 1) { return []; }
  var hang = trang.getRange(1, 1, 1, soCot).getValues()[0];
  var ketQua = [];
  for (var i = 0; i < hang.length; i++) {
    ketQua.push(String(hang[i]).replace(/\s+/g, ' ').trim());
  }
  return ketQua;
}

/** Tìm vị trí cột theo tên tiêu đề. Trả về -1 nếu không có. */
function viTriCot_(tieuDe, tenCot) {
  var can = String(tenCot).replace(/\s+/g, ' ').trim().toLowerCase();
  for (var i = 0; i < tieuDe.length; i++) {
    if (tieuDe[i].toLowerCase() === can) { return i; }
  }
  return -1;
}

/** Tìm vị trí cột bắt buộc, ném lỗi nếu thiếu. */
function viTriCotBatBuoc_(tieuDe, tenCot) {
  var i = viTriCot_(tieuDe, tenCot);
  if (i === -1) {
    throw new Error('Không tìm thấy cột "' + tenCot + '". Hãy kiểm tra lại hàng tiêu đề.');
  }
  return i;
}

/** Thêm các cột còn thiếu vào cuối hàng tiêu đề. */
function themCotNeuThieu_(trang, danhSachCot) {
  var tieuDe = docTieuDe_(trang);
  var can = [];
  for (var i = 0; i < danhSachCot.length; i++) {
    if (viTriCot_(tieuDe, danhSachCot[i]) === -1) { can.push(danhSachCot[i]); }
  }
  if (!can.length) { return; }
  trang.getRange(1, tieuDe.length + 1, 1, can.length).setValues([can]).setFontWeight('bold');
}

/** Đọc một ô theo tên cột. */
function docO_(trang, tieuDe, dong, tenCot) {
  var i = viTriCot_(tieuDe, tenCot);
  if (i === -1) { return ''; }
  return trang.getRange(dong, i + 1).getValue();
}

/** Ghi một ô theo tên cột khi đã có sẵn hàng tiêu đề. */
function ghiO_(trang, tieuDe, dong, tenCot, giaTri) {
  var i = viTriCotBatBuoc_(tieuDe, tenCot);
  trang.getRange(dong, i + 1).setValue(giaTri);
}

/** Ghi một ô theo tên cột, tự đọc lại hàng tiêu đề. */
function ghiOTheoDong_(trang, dong, tenCot, giaTri) {
  var tieuDe = docTieuDe_(trang);
  var i = viTriCot_(tieuDe, tenCot);
  if (i === -1) { return; }
  trang.getRange(dong, i + 1).setValue(giaTri);
}

/** Đọc toàn bộ bảng: tiêu đề, các hàng dữ liệu và chỉ số cột theo tên. */
function docBang_(trang) {
  var tieuDe = docTieuDe_(trang);
  var chiSo = {};
  for (var i = 0; i < tieuDe.length; i++) { chiSo[tieuDe[i]] = i; }

  var hang = [];
  if (trang.getLastRow() > 1 && tieuDe.length > 0) {
    hang = trang.getRange(2, 1, trang.getLastRow() - 1, tieuDe.length).getValues();
  }
  return { tieuDe: tieuDe, chiSo: chiSo, hang: hang };
}

/** Thêm một dòng theo đối tượng dạng {tên cột: giá trị}. */
function themDong_(trang, duLieu) {
  var tieuDe = docTieuDe_(trang);
  var hang = [];
  for (var i = 0; i < tieuDe.length; i++) {
    var ten = tieuDe[i];
    hang.push(duLieu.hasOwnProperty(ten) ? duLieu[ten] : '');
  }
  trang.appendRow(hang);
  return trang.getLastRow();
}

/** Tập hợp các giá trị đã có ở một cột, dùng để kiểm tra trùng. */
function tapHopGiaTriCot_(trang, tenCot) {
  var bang = docBang_(trang);
  var tap = {};
  if (bang.chiSo[tenCot] === undefined) { return tap; }
  for (var i = 0; i < bang.hang.length; i++) {
    var v = String(bang.hang[i][bang.chiSo[tenCot]]).trim();
    if (v) { tap[v] = true; }
  }
  return tap;
}

/** Đếm số dòng của một mã khách hàng trong trang tính. */
function demTheoMaKH_(trang, maKH) {
  var bang = docBang_(trang);
  if (bang.chiSo['MA_KH'] === undefined) { return 0; }
  var dem = 0;
  for (var i = 0; i < bang.hang.length; i++) {
    if (String(bang.hang[i][bang.chiSo['MA_KH']]).trim() === maKH) { dem++; }
  }
  return dem;
}

/** Lấy dòng đang chọn trên trang KHACH_HANG. */
function layDongDangChon_() {
  var trang = bangTinh_().getActiveSheet();
  if (trang.getName() !== TRANG.KHACH_HANG) {
    throw new Error('Hãy mở trang KHACH_HANG và bấm vào dòng khách hàng cần xử lý, sau đó chạy lại mục này.');
  }
  var dong = trang.getActiveRange().getRow();
  if (dong < 2) {
    throw new Error('Hãy chọn một dòng dữ liệu từ dòng 2 trở xuống, không phải hàng tiêu đề.');
  }
  return dong;
}

/** Sinh mã khách hàng mới dạng KH001, KH002, ... */
function sinhMaKhachHang_() {
  var trang = layTrang_(TRANG.KHACH_HANG);
  var bang = docBang_(trang);
  var lonNhat = 0;

  if (bang.chiSo['MA_KH'] !== undefined) {
    for (var i = 0; i < bang.hang.length; i++) {
      var v = String(bang.hang[i][bang.chiSo['MA_KH']]).trim();
      var khop = v.match(/^KH(\d+)$/);
      if (khop) {
        var so = parseInt(khop[1], 10);
        if (so > lonNhat) { lonNhat = so; }
      }
    }
  }
  var soMoi = lonNhat + 1;
  return 'KH' + (soMoi < 1000 ? ('00' + soMoi).slice(-3) : String(soMoi));
}

/** Mô tả toàn bộ dữ liệu một dòng khách hàng, bỏ qua cột hệ thống, để gửi cho AI. */
function motTaDongKhachHang_(trang, tieuDe, dong) {
  var giaTri = trang.getRange(dong, 1, 1, tieuDe.length).getValues()[0];
  var boQua = {};
  for (var i = 0; i < COT_HE_THONG_KHACH_HANG.length; i++) { boQua[COT_HE_THONG_KHACH_HANG[i]] = true; }

  var dongVanBan = [];
  for (var j = 0; j < tieuDe.length; j++) {
    if (!tieuDe[j] || boQua[tieuDe[j]]) { continue; }
    dongVanBan.push(tieuDe[j] + ': ' + String(giaTri[j]));
  }
  return dongVanBan.join('\n');
}

/** Tìm dòng hồ sơ mới nhất của một mã khách hàng. */
function timDongHoSoMoiNhat_(trangHoSo, maKH) {
  var bang = docBang_(trangHoSo);
  for (var i = bang.hang.length - 1; i >= 0; i--) {
    if (String(bang.hang[i][bang.chiSo['MA_KH']]).trim() === maKH) {
      var duLieu = {};
      for (var ten in bang.chiSo) { duLieu[ten] = bang.hang[i][bang.chiSo[ten]]; }
      return { dong: i + 2, duLieu: duLieu };
    }
  }
  return null;
}

/* =========================== TIỆN ÍCH DRIVE =========================== */

/** Lấy thư mục gốc chứa toàn bộ khách hàng; tạo và lưu ID vào CAU_HINH nếu chưa có. */
function layThuMucGoc_() {
  var id = String(layCauHinh_('ID_THU_MUC_GOC', '')).trim();
  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (loi) {
      throw new Error('ID_THU_MUC_GOC trong CAU_HINH không hợp lệ: ' + id);
    }
  }
  var thuMuc = DriveApp.createFolder('SAN_XUAT_VIDEO');
  luuCauHinh_('ID_THU_MUC_GOC', thuMuc.getId());
  return thuMuc;
}

/** Lấy thư mục con theo tên, tạo mới nếu chưa có. */
function layHoacTaoThuMuc_(thuMucCha, ten) {
  var ds = thuMucCha.getFoldersByName(ten);
  if (ds.hasNext()) { return ds.next(); }
  return thuMucCha.createFolder(ten);
}

/** Tách ID Drive từ một đường dẫn. */
function layIdTuDuongDan_(duongDan) {
  var khop = String(duongDan || '').match(/[-\w]{25,}/);
  return khop ? khop[0] : '';
}

/** Lấy một thư mục con của khách hàng dựa trên đường dẫn trong cột LINK_DRIVE. */
function layThuMucCon_(trangKhach, tieuDe, dong, tenThuMucCon) {
  var lien = String(docO_(trangKhach, tieuDe, dong, 'LINK_DRIVE')).trim();
  if (!lien) {
    throw new Error('Dòng đang chọn chưa có LINK_DRIVE. Hãy chạy mục Tạo thư mục và gửi liên kết nộp ảnh trước.');
  }
  var id = layIdTuDuongDan_(lien);
  if (!id) { throw new Error('Không đọc được ID thư mục từ LINK_DRIVE: ' + lien); }

  var thuMucKhach = DriveApp.getFolderById(id);
  var ds = thuMucKhach.getFoldersByName(tenThuMucCon);
  if (!ds.hasNext()) {
    throw new Error('Không tìm thấy thư mục ' + tenThuMucCon + ' trong ' + thuMucKhach.getName() + '.');
  }
  return ds.next();
}

/* =========================== TIỆN ÍCH CẤU HÌNH =========================== */

/** Đọc toàn bộ trang CAU_HINH thành đối tượng khóa - giá trị. */
function docCauHinh_() {
  var trang = layTrang_(TRANG.CAU_HINH);
  var bang = docBang_(trang);
  var cotKhoa = bang.chiSo['KHOA'], cotGiaTri = bang.chiSo['GIA_TRI'];
  if (cotKhoa === undefined || cotGiaTri === undefined) {
    throw new Error('Trang CAU_HINH phải có hai cột KHOA và GIA_TRI.');
  }
  var ketQua = {};
  for (var i = 0; i < bang.hang.length; i++) {
    var khoa = String(bang.hang[i][cotKhoa]).trim();
    if (khoa) { ketQua[khoa] = String(bang.hang[i][cotGiaTri]); }
  }
  return ketQua;
}

/** Lấy một giá trị cấu hình, có giá trị dự phòng. */
function layCauHinh_(khoa, macDinh) {
  var cauHinh = docCauHinh_();
  var v = cauHinh[khoa];
  return (v === undefined || String(v).trim() === '') ? macDinh : v;
}

/**
 * Lấy câu lệnh gửi AI từ trang CAU_HINH. Ném lỗi nếu ô trống, để bảo đảm không
 * có câu lệnh nào bị viết cứng trong mã lúc chạy.
 */
function layCauLenh_(khoa) {
  var v = layCauHinh_(khoa, '');
  if (!String(v).trim()) {
    throw new Error('Trang CAU_HINH chưa có nội dung cho khóa ' + khoa + '. Hãy điền câu lệnh rồi chạy lại.');
  }
  return v;
}

/** Ghi hoặc cập nhật một khóa trong trang CAU_HINH. */
function luuCauHinh_(khoa, giaTri) {
  var trang = layTrang_(TRANG.CAU_HINH);
  var bang = docBang_(trang);
  var cotKhoa = bang.chiSo['KHOA'], cotGiaTri = bang.chiSo['GIA_TRI'];

  for (var i = 0; i < bang.hang.length; i++) {
    if (String(bang.hang[i][cotKhoa]).trim() === khoa) {
      trang.getRange(i + 2, cotGiaTri + 1).setValue(giaTri);
      return;
    }
  }
  themDong_(trang, { 'KHOA': khoa, 'GIA_TRI': giaTri, 'GHI_CHU': '' });
}

/** Số mục xử lý mỗi lần chạy, tối đa 4 vì Apps Script giới hạn 6 phút. */
function soLuongMoiLanChay_() {
  var so = Number(layCauHinh_('SO_VIDEO_MOI_LAN_CHAY', '4'));
  if (!so || so < 1) { so = 4; }
  if (so > 4) { so = 4; }
  return so;
}

/* =========================== TIỆN ÍCH KHÁC =========================== */

/**
 * Thay các biến dạng {TEN_BIEN} trong mẫu thư.
 * Dùng split và join thay cho String.replace vì replace hiểu ký tự $ trong
 * chuỗi thay thế là ký hiệu đặc biệt; bảng giá của khách thường có ký tự $.
 * Cách này cũng thay được mọi lần xuất hiện, không chỉ lần đầu.
 */
function thayThe_(vanBan, cacBien) {
  var kq = String(vanBan == null ? '' : vanBan);
  for (var khoa in cacBien) {
    kq = kq.split('{' + khoa + '}').join(String(cacBien[khoa] == null ? '' : cacBien[khoa]));
  }
  return kq;
}

/** Chuyển giá trị bất kỳ thành chuỗi an toàn để ghi vào ô. */
function chuoiAnToan_(giaTri) {
  if (giaTri === null || giaTri === undefined) { return ''; }
  if (typeof giaTri === 'object') { return JSON.stringify(giaTri); }
  return String(giaTri);
}

/** Gộp mảng thành danh sách gạch đầu dòng. */
function gopDanhSach_(giaTri) {
  if (!giaTri) { return ''; }
  if (Object.prototype.toString.call(giaTri) === '[object Array]') {
    var d = [];
    for (var i = 0; i < giaTri.length; i++) { d.push('- ' + chuoiAnToan_(giaTri[i])); }
    return d.join('\n');
  }
  return chuoiAnToan_(giaTri);
}

/** Định dạng số thứ tự hai chữ số: 1 thành 01. */
function demSo_(so) {
  return so < 10 ? '0' + so : String(so);
}

/**
 * Hiện thông báo ngắn; nếu không có giao diện thì ghi vào nhật ký.
 * Khi chạy từ bảng điều khiển, gom lại để trả về hộp thoại thay vì hiện toast
 * phía sau cửa sổ.
 */
function thongBao_(noiDung) {
  if (typeof CHAY_TU_GIAO_DIEN !== 'undefined' && CHAY_TU_GIAO_DIEN) {
    THONG_DIEP_GOM.push(String(noiDung));
    return;
  }
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(noiDung, 'San xuat video', 8);
  } catch (loi) {
    Logger.log(noiDung);
  }
}

/** Hiện hộp thoại; nếu không có giao diện thì ghi vào nhật ký. */
function hopThoai_(tieuDe, noiDung) {
  if (typeof CHAY_TU_GIAO_DIEN !== 'undefined' && CHAY_TU_GIAO_DIEN) {
    THONG_DIEP_GOM.push(tieuDe + ': ' + noiDung);
    return;
  }
  try {
    var giaoDien = SpreadsheetApp.getUi();
    giaoDien.alert(tieuDe, noiDung, giaoDien.ButtonSet.OK);
  } catch (loi) {
    Logger.log(tieuDe + ': ' + noiDung);
  }
}

/** Hỏi xác nhận trước khi gửi thư. Nếu không có giao diện thì coi như đồng ý. */
function hoiXacNhan_(tieuDe, noiDung) {
  try {
    var giaoDien = SpreadsheetApp.getUi();
    return giaoDien.alert(tieuDe, noiDung, giaoDien.ButtonSet.YES_NO) === giaoDien.Button.YES;
  } catch (loi) {
    Logger.log('Không có giao diện để hỏi xác nhận, tiếp tục chạy: ' + tieuDe);
    return true;
  }
}