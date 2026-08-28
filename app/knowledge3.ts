import type { GuideStep } from "./knowledge";

export const promptText3 = `Tôi muốn xây dựng một hệ thống biến kinh nghiệm chuyên môn và dữ liệu khách hàng thành sản phẩm tri thức có thể bán nhiều lần. Sản phẩm có thể gồm tài liệu, biểu mẫu, video hướng dẫn và trợ lý AI; toàn bộ nội dung phải có nguồn, có chốt duyệt của con người và được quản lý theo phiên bản. Hãy viết mã Google Apps Script để vận hành chuỗi từ nghiên cứu nhu cầu, lập bản đồ tri thức, sản xuất nội dung, bán hàng, cấp quyền, chăm sóc người mua đến đọc phản hồi và xác định phần cần sửa.

Bối cảnh cài đặt: tôi tạo một Google Sheets trống, mở Apps Script từ chính bảng tính đó và dán mã vào. Hệ thống phải gắn với bảng tính đang mở, không tạo một bảng tính trung tâm khác.

Hãy trả về đúng ba tệp đầy đủ trong một câu trả lời, mỗi tệp ở một khối mã riêng và ghi rõ tên:
1. Ma.gs chứa hằng số, onOpen, menu, tiện ích chung, tạo trang tính, tạo thư mục Drive, tạo biểu mẫu và toàn bộ nghiệp vụ.
2. bang_dieu_khien.gs chứa phần máy chủ của bảng điều khiển.
3. bang_dieu_khien.html chứa giao diện bảng điều khiển.

Ràng buộc kiến trúc bắt buộc:
- Chỉ Ma.gs được khai báo onOpen. Menu mang tên “San pham tri thuc” và có đúng 14 mục nghiệp vụ theo thứ tự: tạo biểu mẫu; phân nhóm nhu cầu; lập bản đồ tri thức; đề xuất cấu trúc sản phẩm; tạo bản đầu tài liệu; tạo kế hoạch cảnh; ghi đơn; cấp quyền tài liệu; gửi email chào mừng; nhắc mốc ngày 3; nhắc mốc ngày 7; đọc và phân loại thư hỗ trợ; ghi nhận hoàn thành; đọc phản hồi và chỉ ra phần cần sửa. Cuối menu có Mở bảng điều khiển, Tạo khung trang tính, Tạo cây thư mục Drive và Kiểm tra kết nối API.
- Dùng SpreadsheetApp.getActiveSpreadsheet(), có thể bọc trong hàm tiện ích ss_(). Tuyệt đối không dùng SpreadsheetApp.create để tạo bảng tính mới.
- Tên hàm và biến viết tiếng Việt không dấu; chú thích, hộp thoại, email và câu lệnh gửi AI viết tiếng Việt có dấu.
- Khóa OpenAI đọc từ PropertiesService.getScriptProperties() với tên OPENAI_API_KEY. Không ghi khóa trong mã hoặc trang tính. Bảng điều khiển có ô lưu khóa nhưng phải ghi vào Script Properties.
- URL API là Chat Completions. Tên model, số token và tên tham số token đọc từ CAU_HINH; mặc định model gpt-5.6, max_tokens tối thiểu 4000. Nếu model yêu cầu max_completion_tokens thì tự thử lại, lưu tên tham số mới vào CAU_HINH và dùng cho các lần sau.
- Mọi UrlFetchApp.fetch gọi AI phải đặt muteHttpExceptions: true. Khi lỗi phải báo mã HTTP cùng nội dung trả về đủ để kiểm tra; cần phân biệt rõ lỗi 401 sai khóa, 429 hết hạn mức hoặc gọi quá nhanh, 404 sai model và 400 sai cấu trúc yêu cầu.
- Tra cột theo tên tiêu đề, không dùng vị trí cột cố định. Hàm tạo khung phải chạy lại an toàn: chỉ tạo trang hoặc bổ sung cột còn thiếu, không xóa dữ liệu đã có.
- Mọi câu lệnh dài gửi AI, mẫu email và tham số vận hành phải được gieo sẵn vào CAU_HINH và các hàm nghiệp vụ phải đọc từ trang này, không viết cứng lại trong từng hàm.
- AI trả về không phải JSON hợp lệ thì ghi nguyên văn vào cột JSON_THO của dòng liên quan, giữ nguyên các cột còn lại và không làm dừng toàn bộ quy trình.
- Không hàm nào được ghi vào DUYET_NGUOI của NGHIEN_CUU hoặc QUYET_DINH và PHIEN_BAN_DU_KIEN của PHAN_HOI. Đây là ba cột chỉ con người được điền.
- Mỗi lần tạo bản đầu tối đa theo SO_TAI_LIEU_MOI_LAN, mặc định 3 tài liệu. Mỗi lần gửi email tối đa 20 thư và không gửi trùng nếu cột ngày gửi đã có dữ liệu. Mỗi lần đọc Gmail tối đa 20 chuỗi thư.

Mười ba trang tính hệ thống phải được tạo trước, đúng tên và đúng thứ tự cột sau:
1. CAU_HINH: KHOA, GIA_TRI, MO_TA.
2. NGHIEN_CUU: NGUON_DU_LIEU, NGUYEN_VAN_KH, VAN_DE, CACH_DANG_XU_LY, CHI_PHI_HAU_QUA, DA_TUNG_TRA_TIEN, NHOM_AI, DUYET_NGUOI, EMAIL_LIEN_HE, NGAY_NHAN, JSON_THO.
3. BAN_DO_TRI_THUC: NHOM_NHU_CAU, MA_MODULE, MODULE, CHU_DE, CAU_HOI_COT_LOI, TRI_THUC_CAN_CO, NGUON_DAN, TRANG_THAI_NGUON, NGUOI_DUYET_NGUON, NGAY_DUYET_NGUON, JSON_THO.
4. CAU_TRUC_SP: MA_MODULE, TEN, MUC_TIEU, DAU_RA_KHACH_NHAN, TAI_LIEU_CAN, THU_TU, JSON_THO.
5. TRANG_THAI_TAI_LIEU: MA_TAI_LIEU, TEN, LOAI, MA_MODULE, TRANG_THAI, NGUON, NGUOI_DUYET, NGAY_DUYET, PHIEN_BAN, LINK, JSON_THO.
6. KE_HOACH_CANH: MA_CANH, MA_TAI_LIEU_NGUON, MOC_THOI_GIAN, LOI_DAN, LOAI_CANH, CONG_CU, NOI_DUNG_PHAI_XUAT_HIEN, CAU_LENH_TAO_CANH, TAI_LIEU_NGUON, DIEM_NGUOI_KIEM_TRA, GHI_CHU_CAPCUT, JSON_THO.
7. DON_HANG: MA_DON, HO_TEN, EMAIL, SAN_PHAM, GIA, NGAY_THANH_TOAN, TRANG_THAI, NGAY_CAP_QUYEN, LINK_TAI_LIEU, MOC_1_HOAN_THANH, NGAY_NHAC_3, NGAY_NHAC_7, NGAY_HOAN_THANH, GHI_CHU_HE_THONG, NGAY_GUI_CHAO_MUNG.
8. PHAN_HOI: MA_DON, EMAIL, NGAY_GUI, NGUYEN_VAN, NHOM_AI, TAI_LIEU_LIEN_QUAN, CAN_NGUOI_XU_LY, QUYET_DINH, PHIEN_BAN_DU_KIEN, DONG_Y_TRICH_DAN, GHI_CHU_HE_THONG, JSON_THO.
9. NGUOI_DUNG_THU: NGAY_NHAN, BUOC_BAT_DAU, THOI_GIAN_HOAN_THANH, CAU_HOI_PHAT_SINH, TAI_LIEU_DA_MO, VI_TRI_DUNG_LAI, HIEU_YEU_CAU_LA_GI, DAU_RA_TAO_DUOC, CAN_GIAI_THICH_THEM.
10. THU_HO_TRO: MA_THU, NGAY_NHAN, EMAIL_NGUOI_GUI, TIEU_DE, TRICH_NOI_DUNG, NHOM_AI, LY_DO_PHAN_LOAI, HANH_DONG_DE_XUAT, MA_DON_LIEN_QUAN, DA_XU_LY, JSON_THO.
11. KIEM_THU_AI: NGAY, CAU_HOI, CAU_TRA_LOI, TAI_LIEU_DAN, DUNG_SAI.
12. PHAT_HANH: SO_PHIEN_BAN, NGAY_PHAT_HANH, NOI_DUNG_THAY_DOI, NGUON_DA_SU_DUNG, TAI_LIEU_VIDEO_DA_CAP_NHAT.
13. NHAT_KY: THOI_GIAN, BUOC, KET_QUA, CHI_TIET.

Ba Google Form phải nối về chính bảng tính đang mở và tạo thêm ba trang phản hồi thô RAW_PHONG_VAN, RAW_PHAN_HOI và RAW_NGUOI_DUNG_THU. Trình kích hoạt xuLyBieuMauGui phải tự chép câu trả lời sang NGHIEN_CUU, PHAN_HOI hoặc NGUOI_DUNG_THU, giữ nguyên lời người trả lời và không tạo trigger trùng.

Danh sách xổ bắt buộc:
- DON_HANG.TRANG_THAI: MOI, DA_THANH_TOAN, DA_CAP_QUYEN, DANG_HOC, HOAN_THANH, NGUNG; DON_HANG.MOC_1_HOAN_THANH: CO, KHONG.
- TRANG_THAI_TAI_LIEU.TRANG_THAI: BAN_AI, CHO_DUYET_CHUYEN_MON, CHO_BIEN_TAP, DA_DUYET_XUAT_BAN.
- BAN_DO_TRI_THUC.TRANG_THAI_NGUON: CAN_BO_SUNG, DA_DUYET.
- THU_HO_TRO.NHOM_AI: TRONG_PHAM_VI, NGOAI_PHAM_VI, KHIEU_NAI; DA_XU_LY: CO, KHONG.
- PHAN_HOI.NHOM_AI: DA_CO_CAU_TRA_LOI_NHUNG_KHO_TIM, HUONG_DAN_KHO_HIEU, VUOT_PHAM_VI, DE_XUAT_PHIEN_BAN_SAU; CAN_NGUOI_XU_LY: CO, KHONG.
- KE_HOACH_CANH.LOAI_CANH: MAN_HINH_THAT, NGUOI_HUONG_DAN, CANH_VEO, CANH_SEEDANCE.
- KIEM_THU_AI.DUNG_SAI: DUNG, SAI.

Cấu hình mặc định phải gồm MODEL, MAX_TOKENS, TEN_THAM_SO_TOKEN, giới hạn email, phút hỗ trợ mỗi thư, giới hạn số tài liệu mỗi lần, giới hạn ký tự tài liệu, giá và tên sản phẩm mặc định, nhãn Gmail, ID các thư mục, liên kết ba biểu mẫu, bảy câu lệnh AI cho các bước 2, 3, 4, 5, 6, 12 và 14, cùng mẫu email chào mừng, nhắc ngày 3 và nhắc ngày 7. Khi chạy lại, không được đè giá trị mà người dùng đã sửa.

Các chức năng phải hoạt động đầy đủ như sau:
1. Tạo khung trang tính: dựng 13 trang hệ thống, tiêu đề, hàng cố định, định dạng, danh sách xổ, cấu hình mặc định và nhật ký. Có thêm hàm caiDatToanBoHeThong để kiểm tra trang tính, cây thư mục, ba biểu mẫu, trigger và liệt kê những phần còn thiếu.
2. Tạo cây thư mục Drive: tạo thư mục gốc theo tên bảng tính và sáu thư mục con 00_KINH_NGHIEM_NOI_BO, 01_DU_LIEU_KHACH_HANG, 02_NGUON_CHINH_THUC, 03_AI_DE_XUAT, 04_BAN_CHO_DUYET, 05_BAN_XUAT_BAN. Chạy lại phải dùng lại thư mục cùng tên, ghi ID vào CAU_HINH và hiện hộp thoại có liên kết mở từng thư mục.
3. Tạo biểu mẫu: tạo biểu mẫu phỏng vấn nhu cầu, biểu mẫu phản hồi sau hoàn thành và biểu mẫu người dùng thử; lưu liên kết công khai và liên kết chỉnh sửa trong CAU_HINH; kết nối về bảng tính và cài một trigger gửi biểu mẫu.
4. Phân nhóm nhu cầu: chỉ xử lý dòng NGHIEN_CUU có NGUYEN_VAN_KH nhưng chưa có NHOM_AI, giữ nguyên NGUYEN_VAN_KH, gửi dữ liệu đã loại thông tin nhận diện sang AI và ghi VAN_DE, NHOM_AI. Nếu JSON sai, ghi JSON_THO.
5. Lập bản đồ tri thức: chỉ dùng các dòng có DUYET_NGUOI do con người điền. AI tạo nhóm nhu cầu, module, chủ đề, câu hỏi cốt lõi và tri thức cần có; không tự bịa NGUON_DAN. Tạo mã module và ghi BAN_DO_TRI_THUC ở trạng thái nguồn cần bổ sung cho đến khi người phụ trách duyệt.
6. Đề xuất cấu trúc sản phẩm: chỉ đọc các dòng bản đồ tri thức có nguồn đã duyệt; tạo CAU_TRUC_SP gồm mã module, tên, mục tiêu, đầu ra khách nhận, tài liệu cần và thứ tự. Mỗi module phải tạo ra một đầu ra cụ thể, không chỉ là một chủ đề để đọc.
7. Tạo bản đầu tài liệu: nhận MA_MODULE, lấy cấu trúc và các dòng bản đồ đã có nguồn, dùng AI viết từng tài liệu chưa có, tối đa ba tài liệu mỗi lần. Tạo Google Docs trong 03_AI_DE_XUAT, ghi TRANG_THAI_TAI_LIEU ở trạng thái BAN_AI, lưu nguồn và JSON thô nếu sai. Không được coi bản AI là bản xuất bản.
8. Tạo kế hoạch cảnh: chỉ chạy cho tài liệu DA_DUYET_XUAT_BAN có NGUOI_DUYET, NGAY_DUYET và LINK. Đọc nội dung Google Docs, giới hạn số ký tự theo CAU_HINH và tạo KE_HOACH_CANH. Mọi thao tác người học phải làm theo dùng MAN_HINH_THAT; VEO và SEEDANCE chỉ để minh họa, không giả làm bằng chứng thật; dựng cuối cùng do con người thực hiện trong CapCut.
9. Ghi đơn: nhập họ tên, email, sản phẩm và xác nhận đã thanh toán. Tạo MA_DON, giá mặc định, trạng thái MOI hoặc DA_THANH_TOAN; email sai phải được ghi cảnh báo và không được cấp quyền.
10. Cấp quyền: chỉ xử lý đơn DA_THANH_TOAN, chia sẻ thư mục 05_BAN_XUAT_BAN dưới quyền xem cho đúng email, ghi LINK_TAI_LIEU, NGAY_CAP_QUYEN và chuyển sang DA_CAP_QUYEN. Không cấp cho đơn chưa xác nhận thanh toán.
11. Gửi email chào mừng và nhắc mốc: chỉ gửi chào mừng sau khi đã cấp quyền; ghi NGAY_GUI_CHAO_MUNG để chống gửi trùng và chuyển sang DANG_HOC. Nhắc ngày 3 và ngày 7 dựa trên NGAY_CAP_QUYEN, chỉ gửi khi đến hạn và cột ngày nhắc còn trống. Mẫu ngày 7 phải thay đúng liên kết LINK_FORM_PHAN_HOI.
12. Đọc thư hỗ trợ: lấy tối đa 20 chuỗi Gmail có nhãn hỗ trợ nhưng chưa có nhãn đã đọc; gửi tiêu đề và trích nội dung sang AI để phân loại TRONG_PHAM_VI, NGOAI_PHAM_VI hoặc KHIEU_NAI; ghi THU_HO_TRO, nối MA_DON theo email và gắn nhãn đã đọc. AI chỉ đề xuất hành động, không trả lời khách thay con người.
13. Ghi nhận hoàn thành: tìm theo MA_DON hoặc email, chỉ cho phép đơn DA_CAP_QUYEN hoặc DANG_HOC chuyển sang HOAN_THANH, ghi NGAY_HOAN_THANH và hướng người vận hành mời khách điền biểu mẫu phản hồi.
14. Đọc phản hồi: chỉ xử lý dòng PHAN_HOI chưa có NHOM_AI; cung cấp danh sách mã tài liệu thật cho AI; chỉ cho AI điền NHOM_AI và TAI_LIEU_LIEN_QUAN. CAN_NGUOI_XU_LY do quy tắc cố định trong mã; QUYET_DINH và PHIEN_BAN_DU_KIEN luôn do người bán điền.
15. Kiểm tra kết nối API: gọi lệnh ngắn, báo model và tham số token đang dùng, tự chuyển giữa max_tokens và max_completion_tokens khi cần, đồng thời ghi kết quả vào NHAT_KY.

Bảng điều khiển:
- moBangDieuKhien phải dùng HtmlService.createHtmlOutputFromFile('bang_dieu_khien') và mở hộp thoại lớn.
- layDuLieuBangDieuKhien chỉ đọc dữ liệu trong bảng tính để gom KPI, cảnh báo, tiến độ sản xuất, bốn chốt duyệt, đơn hàng, chỉ số hỗ trợ và việc cần làm; không gọi Drive hoặc API khi mở để giao diện tải nhanh.
- Giao diện phải có nút tải lại, ô lưu OPENAI_API_KEY và các nút chạy bước tiếp theo của từng đơn. HTML chỉ được gọi đúng ba hàm layDuLieuBangDieuKhien, chayHanhDongDon và luuKhoaAPI.
- chayHanhDongDon phải liệt kê tường minh các hành động DANH_DAU_THANH_TOAN, CAP_QUYEN, GUI_CHAO_MUNG, NHAC_3, NHAC_7 và GHI_NHAN_HOAN_THANH; không dùng eval.
- Cuối câu trả lời phải có bảng đối chiếu ba hàm HTML gọi với tệp .gs nơi hàm được khai báo.

Nguyên tắc chuyên môn và kiểm duyệt bắt buộc trong các câu lệnh AI:
- Không suy diễn dữ liệu còn thiếu, không bịa nhu cầu, nguồn, phương pháp, số liệu, kết quả, tình huống khách hàng hoặc lời chứng thực.
- Giữ nguyên lời khách trong NGUYEN_VAN_KH và NGUYEN_VAN; chỉ tóm tắt hoặc phân nhóm ở cột riêng.
- Nội dung thiếu căn cứ phải ghi CAN_BO_SUNG hoặc [CAN_BO_SUNG: ...], không được tự điền bằng kiến thức chung.
- AI không quyết định nhóm nhu cầu cuối, không tự duyệt nguồn, không tự đưa tài liệu thành DA_DUYET_XUAT_BAN, không tự cấp quyền cho đơn chưa thanh toán, không gửi trả lời hỗ trợ và không quyết định sửa sản phẩm.
- Chỉ tài liệu có nguồn và đã được người phụ trách duyệt mới được dùng cho video, trợ lý AI hoặc giao cho khách.
- Khi phát hành phiên bản mới, tài liệu, video và trợ lý AI phải được cập nhật đồng bộ; mọi thay đổi ghi vào PHAT_HANH.

Cuối cùng, hướng dẫn chính xác: dán từng tệp ở đâu; tên tệp nào phải trùng với createHtmlOutputFromFile; cách lưu OPENAI_API_KEY; hàm nào chạy đầu tiên để cấp quyền; thứ tự tạo khung, tạo cây thư mục, tạo biểu mẫu và kiểm tra API; quyền Google cần cấp; cách kiểm tra từng bước từ nghiên cứu, duyệt nguồn, tạo tài liệu, lập cảnh, ghi đơn, cấp quyền, gửi thư, phân loại hỗ trợ đến đọc phản hồi. Không rút gọn mã, không bỏ hàm phụ trợ và không để lại chỗ trống kiểu “viết tiếp tương tự”.`;

export const steps3: GuideStep[] = [
  {
    id: "m3-buoc-00",
    n: "00",
    title: "Dựng bảng tính trung tâm và cài hệ thống sản phẩm tri thức",
    details: [
      "Tạo một Google Sheets trống và đặt tên VAN HANH SAN PHAM TRI THUC. Không tạo thủ công các trang tính hoặc cột dữ liệu, vì hàm tạo khung sẽ dựng toàn bộ cấu trúc. Từ nghiên cứu nhu cầu, xây kho tri thức, sản xuất nội dung, quản lý đơn hàng đến phản hồi sau bán đều được giữ trong đúng bảng tính này.",
      "Mở câu lệnh tổng được liên kết trong sách bằng một cuộc trò chuyện mới trên ChatGPT hoặc Claude. Yêu cầu AI trả đủ ba tệp ngay trong một lần: tệp nghiệp vụ chính, tệp máy chủ bảng điều khiển và tệp HTML giao diện. Không xin bảng điều khiển ở một lần trò chuyện khác vì tên hàm và tên cột giữa hai lần tạo mã có thể không khớp nhau.",
      "Trước khi dán mã, dùng chức năng tìm kiếm trong cửa sổ trò chuyện để kiểm tra đủ năm điều kiện: mã dùng getActiveSpreadsheet; không có SpreadsheetApp.create; khóa API được đọc bằng PropertiesService.getScriptProperties; mọi lệnh gọi API có muteHttpExceptions đặt true; max_tokens từ 4000 trở lên và các câu lệnh dài được đọc từ trang CAU_HINH thay vì viết cứng trong hàm gọi API.",
      "Từ chính bảng tính vừa tạo, chọn Tiện ích mở rộng → Apps Script. Không mở một dự án Apps Script độc lập ở nơi khác. Dự án phải được gắn với đúng bảng tính trung tâm thì menu San pham tri thuc mới xuất hiện và các hàm mới đọc đúng dữ liệu.",
      "Trong tệp Mã.gs, xóa mã mẫu rồi dán tệp nghiệp vụ chính. Bấm dấu cộng cạnh mục Tệp, chọn Tập lệnh, đặt tên WebApp và dán phần máy chủ của bảng điều khiển. Bấm dấu cộng lần nữa, chọn HTML, đặt tên bang_dieu_khien, không gõ thêm đuôi .html, rồi dán giao diện. Tên tệp HTML phải khớp chính xác với tên được dùng trong createHtmlOutputFromFile. Nhấn Ctrl+S để lưu cả ba tệp.",
      "Vào OpenAI Platform. Nếu tài khoản API chưa có số dư, mở Billing và nạp tiền trước; gói ChatGPT Plus không bao gồm chi phí API. Sau đó vào Settings → API keys → Create new secret key và sao chép khóa ngay khi khóa xuất hiện.",
      "Quay lại Apps Script, mở Cài đặt dự án. Trong Thuộc tính của tập lệnh, thêm thuộc tính OPENAI_API_KEY và dán khóa vào ô giá trị. Không viết khóa vào mã và không chụp hoặc gửi khóa cho người khác.",
      "Trên thanh công cụ Apps Script, chọn hàm tạo khung trang tính rồi bấm Chạy. Khi Google yêu cầu cấp quyền, chọn đúng tài khoản, mở Nâng cao nếu có cảnh báo ứng dụng chưa được xác minh, chọn Đi tới dự án và bấm Cho phép. Không chọn onOpen để chạy tay; hàm này cần được gọi khi bảng tính đang mở.",
      "Trở lại Google Sheets, nhấn F5. Kiểm tra menu San pham tri thuc và mười một trang tính hệ thống đã xuất hiện. Chạy Tạo khung trang tính trước, sau đó mới chạy Kiểm tra kết nối API. Lỗi 401 thường là sai khóa; lỗi 429 có cụm insufficient quota thường là chưa có số dư; lỗi 404 thường là sai tên mô hình trong CAU_HINH.",
      "Mở bảng điều khiển ngay cả khi chưa có dữ liệu. Các khối rỗng trên bảng điều khiển cho biết dữ liệu của từng chặng sẽ xuất hiện ở đâu. Từ đây, các mục nghiệp vụ có thể chạy từ bảng điều khiển; riêng việc điền DUYET_NGUOI, chuyển trạng thái tài liệu và dựng video vẫn phải do người vận hành thực hiện và xác nhận."
    ],
    callout: { title: "Thứ tự bắt buộc", text: "Dán đủ ba tệp → lưu OPENAI_API_KEY → chạy Tạo khung trang tính và cấp quyền → tải lại bảng tính → kiểm tra API → mở bảng điều khiển. Mở bảng điều khiển trước khi tạo khung sẽ báo thiếu trang tính." },
    detailImages: [["m3-01.jpg"],["m3-02.jpg"],["m3-03.jpg"],["m3-02.jpg"],["m3-03.jpg"],["m3-04.jpg"],["m3-05.jpg"],["m3-06.jpg"],["m3-07.jpg"],["m3-08.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-00.mp4"
  },
  {
    id: "m3-buoc-01",
    n: "01",
    title: "Dùng dữ liệu khách hàng thật để nghiên cứu và duyệt nhu cầu",
    details: [
      "Trong menu San pham tri thuc, chạy mục tạo biểu mẫu thu dữ liệu. Hệ thống tạo ba biểu mẫu tương ứng với ba luồng dữ liệu cần nhận về bảng tính, trong đó có biểu mẫu phỏng vấn nhu cầu. Mở liên kết biểu mẫu và kiểm tra các câu hỏi trước khi gửi cho khách.",
      "Gom câu hỏi, email, tin nhắn, ghi chú bán hàng và nội dung các cuộc tư vấn trước đây. Mỗi vấn đề đặt trên một dòng. Giữ nguyên cách khách hàng diễn đạt trong trường NGUYEN_VAN_KH; không sửa lại cho trau chuốt vì câu chữ gốc giúp nhận ra cách họ hiểu vấn đề.",
      "Khi cần phỏng vấn thêm, gửi Google Form cho đúng nhóm khách. Câu hỏi phải làm rõ khách đang thực hiện công việc thế nào, đã thử cách gì, vướng ở đâu, hậu quả cụ thể là gì và họ đã từng trả tiền cho giải pháp tương tự hay chưa. Loại các câu dẫn dắt người trả lời tới kết luận có sẵn.",
      "Kiểm tra trang NGHIEN_CUU có đủ các trường NGUON_DU_LIEU, NGUYEN_VAN_KH, VAN_DE, CACH_DANG_XU_LY, CHI_PHI_HAU_QUA, DA_TUNG_TRA_TIEN, NHOM_AI và DUYET_NGUOI. Nếu dữ liệu được nhập từ biểu mẫu, xác nhận từng phản hồi đã rơi đúng dòng và không bị thiếu trường bắt buộc.",
      "Chạy mục 2 Phân nhóm nhu cầu từ dữ liệu thô. AI đọc các dòng nhu cầu và đề xuất nhóm trong cột NHOM_AI. Kết quả này chỉ là gợi ý; không dùng NHOM_AI như quyết định cuối cùng.",
      "Đọc lại từng dòng và tự điền DUYET_NGUOI. Chỉ duyệt nhóm thuộc phạm vi chuyên môn thật của người bán, có dữ liệu cho thấy khách gặp lặp lại và có dấu hiệu sẵn sàng chi trả. Nếu AI gộp hai vấn đề giống câu chữ nhưng khác bản chất, điền hai tên nhóm khác nhau ở DUYET_NGUOI để tách lại.",
      "Đối chiếu DA_TUNG_TRA_TIEN trước khi chọn vấn đề làm sản phẩm. Một nhóm được nhắc nhiều nhưng tất cả người trả lời đều chưa từng chi tiền mới chỉ chứng minh đó là điều gây khó chịu, chưa chứng minh thị trường sẽ mua giải pháp.",
      "Chốt phạm vi sản phẩm từ các nhóm đã duyệt. Trong ví dụ của sách, sản phẩm tập trung vào năm nhóm: nhân viên trả lời thiếu nhất quán; không có quy tắc chuyển khiếu nại; thiếu chăm sóc sau mua; chủ doanh nghiệp không đọc được phản hồi tập trung; nhân viên mới mất nhiều thời gian học cách trả lời. Không mở rộng sang toàn bộ quản trị khách hàng."
    ],
    callout: { title: "Điểm con người phải quyết định", text: "AI chỉ phân nhóm theo dữ liệu. Người bán phải xác nhận nhóm nào thuộc chuyên môn, nhóm nào có bằng chứng mua và trường hợp nào cần tách lại. Dòng không có DUYET_NGUOI sẽ không đi vào bản đồ tri thức." },
    detailImages: [["m3-09.jpg"],["m3-10.jpg"],["m3-10.jpg"],["m3-11.jpg"],["m3-12.jpg"],["m3-13.jpg"],["m3-13.jpg"],["m3-14.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-01.mp4"
  },
  {
    id: "m3-buoc-02",
    n: "02",
    title: "Bán thử trước khi sản xuất toàn bộ sản phẩm",
    details: [
      "Từ vấn đề và kết quả đã được xác nhận ở bước nghiên cứu, tạo một phiên bản giới thiệu tối thiểu gồm trang mô tả, một biểu mẫu mẫu, một video giới thiệu ngắn và lịch nhận sản phẩm. Chưa quay toàn bộ bài học và chưa thiết kế toàn bộ biểu mẫu ở giai đoạn này.",
      "Dùng ChatGPT hoặc Claude tạo bản đầu của trang giới thiệu từ đúng dữ liệu nghiên cứu. Người bán phải sửa các câu hứa hẹn, thêm tình huống thật đã được phép sử dụng, ghi rõ sản phẩm dành cho ai, kết quả người mua phải hoàn thành và những nội dung không nằm trong phạm vi sản phẩm.",
      "Thiết kế một đầu ra mẫu để người mua nhìn thấy sản phẩm sẽ giúp họ làm được gì. Nếu dùng Canva để trình bày, chỉ thiết kế từ nội dung đã duyệt; không biến ví dụ minh họa hoặc cảnh AI thành bằng chứng về khách hàng thật.",
      "Đặt mục tiêu bán thử và thời hạn trước khi mở bán. Trong trường hợp minh họa của sách, người bán thử nghiệm mục tiêu 10 người thanh toán trong 14 ngày. Đây là ngưỡng tự đặt để quyết định có tiếp tục đầu tư, không phải tiêu chuẩn chung cho mọi sản phẩm.",
      "Ngày 1 đến ngày 3, hoàn thành trang mô tả, biểu mẫu mẫu và video giới thiệu. Ngày 4 đến ngày 10, giới thiệu sản phẩm cho khách cũ, người theo dõi phù hợp và cộng đồng nghề nghiệp đang tham gia. Ngày 11 đến ngày 14, tổng hợp câu hỏi, lý do chưa mua và số đơn đã thanh toán.",
      "Nếu đạt mục tiêu, sản xuất toàn bộ theo lịch đã công bố. Nếu chưa đạt, chỉ sửa một biến chính trong lần thử tiếp theo, chẳng hạn nhóm khách, kết quả, thành phần gói hoặc giá. Không đổi tất cả cùng lúc vì sẽ không biết yếu tố nào tạo ra thay đổi.",
      "Dùng số đơn đã thanh toán làm bằng chứng chính. Lượt thích, bình luận hoặc số người nói quan tâm không thay thế được hành vi mua. Nếu nhiều người quan tâm nhưng ít người thanh toán, kiểm tra lại vấn đề, cách mô tả kết quả, nhóm khách hoặc giá."
    ],
    callout: { title: "Video không quay riêng bước bán thử", text: "Phần này được giữ đầy đủ theo sách để người đọc không bỏ qua chốt kiểm tra nhu cầu. Website không gắn ảnh màn hình không liên quan chỉ để lấp chỗ trống." },
    detailImages: [[],[],[],[],[],[],[]],
    calloutImages: []
  },
  {
    id: "m3-buoc-03",
    n: "03",
    title: "Tạo kho tri thức có nguồn và xác định phương pháp chính thức",
    details: [
      "Trong Google Drive, tạo thư mục gốc mang tên sản phẩm. Bên trong tạo đúng sáu thư mục: 00_KINH_NGHIEM_NOI_BO, 01_DU_LIEU_KHACH_HANG, 02_NGUON_CHINH_THUC, 03_AI_DE_XUAT, 04_BAN_CHO_DUYET và 05_BAN_XUAT_BAN.",
      "Đưa tài liệu, biểu mẫu và tình huống do người bán tạo trong quá trình làm nghề vào 00_KINH_NGHIEM_NOI_BO. Đưa câu hỏi, phản hồi khách hàng đã loại tên, số điện thoại và dữ liệu nhận diện không cần thiết vào 01_DU_LIEU_KHACH_HANG.",
      "Đưa tài liệu bên ngoài vào 02_NGUON_CHINH_THUC và đặt tên tệp kèm tác giả, năm hoặc đơn vị ban hành. Phần do AI đề xuất nhưng chưa được công nhận là phương pháp để ở 03_AI_DE_XUAT; bản đang kiểm tra để ở 04_BAN_CHO_DUYET; chỉ bản đã duyệt, có ngày duyệt và người chịu trách nhiệm mới được đưa vào 05_BAN_XUAT_BAN.",
      "Sau khi đã điền DUYET_NGUOI ở bước nghiên cứu, chạy mục 3 Lập bản đồ tri thức. Hàm chỉ đọc các dòng đã được con người duyệt và ghi kết quả vào BAN_DO_TRI_THUC. Dòng chưa duyệt không được biến thành module sản phẩm.",
      "Tạo notebook mới trong NotebookLM và nạp các nguồn ở 02_NGUON_CHINH_THUC cùng những tệp nội bộ cần tra cứu. Với từng dòng BAN_DO_TRI_THUC, đọc TRI_THUC_CAN_CO, hỏi NotebookLM nội dung nằm trong tài liệu nào, rồi ghi đúng tên nguồn vào NGUON_DAN.",
      "Lọc BAN_DO_TRI_THUC theo trạng thái CAN_BO_SUNG. Với từng dòng thiếu căn cứ, tìm thêm nguồn chính thức và điền NGUON_DAN hoặc loại nội dung khỏi sản phẩm. Không để AI tự lấp khoảng trống bằng kiến thức chung.",
      "Hoàn thiện bốn trường do con người chịu trách nhiệm: NGUON_DAN; TRANG_THAI_NGUON như DA_DUYET hoặc CAN_BO_SUNG; NGUOI_DUYET_NGUON; NGAY_DUYET_NGUON. Khi tài liệu gốc trên Drive thay đổi, phải đồng bộ lại nguồn trong NotebookLM.",
      "Kiểm tra kết quả cuối: mỗi vấn đề phải có nguồn chứng minh hoặc được đánh dấu cần bổ sung. Ba lớp kinh nghiệm nội bộ, nguồn chính thức và phần AI đề xuất phải còn tách biệt để khi cập nhật có thể truy ra căn cứ."
    ],
    callout: { title: "Không trộn ba lớp tri thức", text: "Kinh nghiệm của người bán, tài liệu chính thức bên ngoài và phần AI đề xuất phải được lưu tách biệt. Chỉ nội dung có nguồn và đã được người có trách nhiệm duyệt mới trở thành phương pháp chính thức." },
    detailImages: [["m3-15.jpg"],["m3-15.jpg"],["m3-15.jpg"],["m3-16.jpg"],["m3-17.jpg","m3-18.jpg"],["m3-19.jpg"],["m3-19.jpg"],["m3-19.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-03.mp4"
  },
  {
    id: "m3-buoc-04",
    n: "04",
    title: "Chuyển kết quả cần đạt thành cấu trúc sản phẩm",
    details: [
      "Viết lại kết quả cuối theo dạng người mua phải hoàn thành được việc gì, trong bao lâu và tạo ra đầu ra nào. Trong trường hợp minh họa, sau bảy ngày người quản lý phải thiết lập được quy trình tiếp nhận, phản hồi, xử lý khiếu nại và chăm sóc sau mua cho đội ngũ từ 3 đến 10 nhân viên.",
      "Chạy mục 4 Đề xuất cấu trúc sản phẩm. Hệ thống đọc các dòng BAN_DO_TRI_THUC đã có nguồn và ghi từng module vào CAU_TRUC_SP. Mỗi module phải có một đầu ra cụ thể mà người mua nhận được hoặc tự hoàn thành.",
      "Kiểm tra thứ tự module theo công việc người mua phải làm, không theo thứ tự kiến thức người bán muốn giảng. Một trình tự phù hợp có thể đi từ khảo sát hiện trạng, phân loại yêu cầu, giao trách nhiệm, soạn kịch bản trả lời, thiết lập chuyển khiếu nại, chăm sóc sau mua đến chạy thử và sửa quy trình.",
      "Chọn định dạng theo nhu cầu sử dụng của từng đầu ra: tài liệu để đọc và tra cứu; biểu mẫu để áp dụng; video để trình diễn thao tác hoặc giải thích quyết định; trợ lý AI để trả lời câu hỏi lặp lại dựa trên tài liệu đã duyệt. Không thêm định dạng chỉ để làm sản phẩm trông nhiều hơn.",
      "Trước khi đi tiếp, kiểm tra mọi dòng BAN_DO_TRI_THUC đều có ô nguồn không trống. Trong CAU_TRUC_SP, module nào chỉ mô tả nội dung nhưng không nói khách nhận được gì phải viết lại cho đến khi đầu ra có thể diễn đạt thành một câu cụ thể.",
      "Loại phần kiến thức không phục vụ kết quả cuối. Một chương trình dài không tốt hơn nếu người mua chỉ cần một số đầu việc rõ ràng để hoàn thành hệ thống. Giá trị nằm ở phần công việc người mua không còn phải tự mò mẫm, không nằm ở số trang hoặc số video."
    ],
    callout: { title: "Cửa kiểm tra trước khi sản xuất", text: "Không tạo bản thảo khi BAN_DO_TRI_THUC còn thiếu nguồn hoặc CAU_TRUC_SP còn module không có đầu ra cụ thể. Nếu bỏ qua, AI có thể tạo nhiều nội dung nhưng người mua không biết phải hoàn thành việc gì." },
    detailImages: [["m3-20.jpg"],["m3-21.jpg"],["m3-21.jpg"],["m3-22.jpg"],["m3-22.jpg"],["m3-22.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-04.mp4"
  },
  {
    id: "m3-buoc-05",
    n: "05",
    title: "Tạo, duyệt tài liệu và lập kế hoạch sản xuất video",
    details: [
      "Trong CAU_TRUC_SP, chọn dòng module cần làm rồi chạy mục 5 Tạo bản đầu tài liệu. Hệ thống ghi một dòng mới vào TAI_LIEU, đặt trạng thái BAN_AI và điền sẵn nguồn được phép sử dụng. Bản AI tạo chưa phải bản được phép giao cho khách.",
      "Đọc và chuyển tài liệu lần lượt qua bốn trạng thái BAN_AI, CHO_DUYET_CHUYEN_MON, CHO_BIEN_TAP và DA_DUYET_XUAT_BAN. Mỗi lần đổi trạng thái là một lần có người thật kiểm tra; không chuyển thẳng từ BAN_AI sang DA_DUYET_XUAT_BAN.",
      "Ở vòng chuyên môn, kiểm tra phương pháp, quy tắc, công thức, tình huống ngoại lệ và phạm vi áp dụng. Ở vòng biên tập, kiểm tra cấu trúc, cách gọi tên, hướng dẫn thao tác, ví dụ và khả năng người mua tự làm mà không cần hỏi riêng.",
      "Khi tài liệu đạt DA_DUYET_XUAT_BAN, lưu đúng bản vào 05_BAN_XUAT_BAN, điền ngày duyệt, người duyệt, phiên bản dạng v1.0 và dán đường dẫn vào cột LINK. Chỉ những dòng đã đạt trạng thái này mới được dùng làm nguồn cho video hoặc trợ lý AI.",
      "Nếu JSON_THO có nội dung nhưng các cột kết quả trống, AI đã trả về sai định dạng. Đọc nguyên văn JSON_THO, xác định chỗ sai, sửa câu lệnh trong CAU_HINH và chạy lại. Không xóa dòng thô và không làm hỏng cả bảng chỉ vì một lần trả về lỗi.",
      "Chọn tài liệu đã duyệt cần chuyển thành video rồi chạy mục 6 Tạo kế hoạch cảnh. Hệ thống ghi từng cảnh vào KE_HOACH_CANH và tạo sẵn CAU_LENH_TAO_CANH để dùng với công cụ tương ứng.",
      "Lọc MAN_HINH_THAT để quay biểu mẫu hoặc dữ liệu mẫu theo đúng trình tự, phóng hiển thị khoảng 125% để người học đọc được. Lọc NGUOI_HUONG_DAN để quay phần giải thích của người có chuyên môn; nói theo ý đã duyệt, không đọc máy móc toàn bộ kịch bản.",
      "Lọc CANH_VEO và CANH_SEEDANCE, sao chép CAU_LENH_TAO_CANH sang đúng công cụ và đặt tên tệp tải về theo mã cảnh. Cảnh AI chỉ dùng để minh họa, không được đặt trong đoạn hướng dẫn thao tác và không được mô tả khách hàng, kết quả hoặc cơ sở vật chất như thể đó là bằng chứng thật.",
      "Ghép các cảnh trong CapCut theo thứ tự KE_HOACH_CANH, bật Auto Captions rồi sửa tay tên riêng, thuật ngữ và mọi con số. Đọc GHI_CHU_CAPCUT để xử lý các vị trí cần chú ý về điểm cắt, chữ, âm lượng và khung hình.",
      "Xuất bản hoàn chỉnh và đưa video cùng tài liệu đã duyệt vào Gemini để liệt kê mốc thời gian có câu khác tài liệu, sai tên hoặc sai số liệu. Người bán vẫn phải xem lại toàn bộ video và quyết định cảnh nào cần sửa trước khi phát hành."
    ],
    callout: { title: "Chỉ dùng bản đã duyệt", text: "Bản AI, bản chờ chuyên môn và bản chờ biên tập không được đưa vào video, trợ lý AI hoặc giao cho khách. Tài liệu, video và mọi ví dụ phải cùng dùng một phiên bản đã duyệt." },
    detailImages: [["m3-23.jpg"],["m3-24.jpg"],["m3-24.jpg"],["m3-25.jpg"],["m3-25.jpg"],["m3-26.jpg"],["m3-26.jpg"],["m3-27.jpg"],["m3-27.jpg"],["m3-28.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-05.mp4"
  },
  {
    id: "m3-buoc-06",
    n: "06",
    title: "Tạo trợ lý AI theo nguồn và kiểm tra bằng người dùng thử",
    details: [
      "Lọc danh sách tài liệu và chỉ lấy các dòng DA_DUYET_XUAT_BAN có LINK hợp lệ. Tải đúng các tệp đó lên Custom GPT hoặc Claude. Không nạp BAN_AI, bản chờ duyệt hoặc tài liệu chưa có nguồn.",
      "Dùng câu lệnh trong sách để xây hướng dẫn hệ thống cho trợ lý. Hướng dẫn phải quy định trợ lý chỉ dùng nguồn đã duyệt, trả lời ngắn, nêu tên tài liệu và mục liên quan, chỉ dẫn bước người dùng cần làm và chuyển câu hỏi ngoài phạm vi cho người phụ trách.",
      "Cấm trợ lý tự tạo quy định nội bộ, thời hạn, cam kết kết quả, chính sách hoặc tư vấn pháp lý. Không yêu cầu người dùng nhập tên, số điện thoại hoặc dữ liệu khách hàng nếu câu hỏi không cần dữ liệu nhận diện.",
      "Lấy mười câu hỏi thật từ NGUYEN_VAN_KH để kiểm thử, trong đó cố ý có ít nhất hai câu nằm ngoài phạm vi sản phẩm. Ghi kết quả vào KIEM_THU_AI với bốn trường: câu hỏi, câu trả lời, tài liệu trợ lý dẫn ra và đánh giá đúng hay sai.",
      "Với câu nằm ngoài phạm vi, trợ lý phải nói nội dung chưa nằm trong bộ công cụ và đề nghị gửi cho người phụ trách. Nếu trợ lý tự trả lời bằng kiến thức chung, siết lại hướng dẫn hệ thống và kiểm thử lại trước khi giao cho khách.",
      "Chọn từ ba đến năm người dùng thử đúng nhóm khách mục tiêu. Yêu cầu họ tự làm trước mà không được hướng dẫn riêng ngay từ đầu. Chỉ can thiệp khi họ không thể tiếp tục hoặc có nguy cơ áp dụng sai.",
      "Dùng phiếu kiểm tra để ghi bước bắt đầu, thời gian hoàn thành, câu hỏi phát sinh, tài liệu đã mở, vị trí khiến họ dừng, cách họ hiểu yêu cầu, đầu ra họ tạo được và phần người bán phải giải thích thêm.",
      "Nếu nhiều người liên tục hỏi cùng một câu, sửa sản phẩm thay vì kết luận người dùng thiếu khả năng. Có thể đổi tên cột, bổ sung ví dụ, thêm video, viết lại hướng dẫn hoặc đổi thứ tự thao tác; sau đó kiểm thử lại trên phiên bản mới."
    ],
    callout: { title: "Hai vòng kiểm tra khác nhau", text: "Kiểm thử trợ lý xác nhận AI không trả lời vượt nguồn. Kiểm tra người dùng thử xác nhận người mua có thể tự hoàn thành công việc. Phải đạt cả hai trước khi bán rộng." },
    detailImages: [["m3-29.jpg"],["m3-30.jpg"],["m3-30.jpg"],["m3-31.jpg"],["m3-31.jpg"],["m3-32.jpg"],["m3-32.jpg"],["m3-32.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-06.mp4"
  },
  {
    id: "m3-buoc-07",
    n: "07",
    title: "Ghi đơn, cấp quyền, gửi hướng dẫn và theo dõi sử dụng",
    details: [
      "Nếu cổng thanh toán hoặc website có thể gửi thông báo, xuất bản Apps Script thành ứng dụng web để nhận giao dịch và ghi đơn vào DON_HANG. Nếu chưa kết nối được, nhập hoặc xác nhận thủ công đơn đã thanh toán. Dù dòng đơn được tạo tự động hay thủ công, các chặng sau vẫn dùng cùng một trạng thái.",
      "Kiểm tra mã đơn, email người mua, sản phẩm, số tiền và thời điểm thanh toán. Không cấp quyền khi giao dịch chưa được xác nhận; rà soát đơn trùng, hoàn tiền, sai email hoặc thanh toán thiếu trước khi chạy bước tiếp theo.",
      "Trong bảng điều khiển hoặc menu San pham tri thuc, chọn đúng đơn và chạy Cấp quyền tài liệu. Hệ thống chia sẻ thư mục 05_BAN_XUAT_BAN cho đúng email, ghi ngày cấp quyền và chuyển đơn sang chặng gửi email chào mừng. Kiểm tra không cấp nhầm sản phẩm hoặc cấp trùng.",
      "Chạy gửi email chào mừng sau khi quyền truy cập đã được cấp. Thư phải có đường dẫn bắt đầu, lộ trình bảy ngày, phạm vi hỗ trợ và địa chỉ nhận câu hỏi. Đọc lại câu chữ và liên kết trước khi gửi.",
      "Cài trình kích hoạt theo thời gian cho mốc ngày 3 và ngày 7. Email chỉ được gửi khi khách chưa hoàn thành mốc tương ứng; người đã hoàn thành, xin dừng hoặc có email sai không được nhận cùng một chuỗi nhắc việc.",
      "Trong email ngày 7, giữ thẻ {{LINK_FORM_PHAN_HOI}} để hệ thống thay bằng liên kết biểu mẫu phản hồi thật. Khi khách hoàn thành hoặc gửi bài thực hành, ghi mức hoàn thành và chỉ đề nghị quyền sử dụng phản hồi; không mặc định mọi lời khách đều được phép công bố.",
      "Khi có thư hỗ trợ mới, hệ thống có thể dùng API để tóm tắt, phân loại và gắn tài liệu liên quan. Người bán phải trực tiếp xử lý trường hợp vượt phạm vi, khiếu nại, rủi ro hoặc cần phán đoán chuyên môn.",
      "Mở bảng điều khiển để theo dõi chuỗi từ thu nhu cầu đến phản hồi sau bán. Bốn chốt duyệt phải được mở đúng lúc; bảng điều khiển chỉ chạy bước đã được người bán xác nhận và không tự bỏ qua các điểm kiểm tra."
    ],
    callout: { title: "Không tự giao khi chưa xác nhận tiền", text: "Đơn phải ở trạng thái ĐÃ THANH TOÁN trước khi cấp quyền. Sau khi cấp, cần kiểm tra đúng email, đúng thư mục, đúng phiên bản và ngày cấp để tránh gửi sai hoặc gửi trùng." },
    detailImages: [["m3-33.jpg"],["m3-33.jpg"],["m3-34.jpg","m3-35.jpg"],["m3-36.jpg"],["m3-36.jpg"],["m3-32.jpg"],["m3-36.jpg"],["m3-37.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-07.mp4"
  },
  {
    id: "m3-buoc-08",
    n: "08",
    title: "Đọc phản hồi, quyết định phần cần sửa và quản lý phiên bản",
    details: [
      "Khách điền biểu mẫu phản hồi từ liên kết trong email ngày 7. Câu trả lời trước hết rơi vào RAW_PHAN_HOI; trình kích hoạt chép sang PHAN_HOI, đối chiếu email với DON_HANG và điền mã đơn. Nếu không tìm thấy đơn, hệ thống vẫn ghi phản hồi và đánh dấu vấn đề trong cột ghi chú để người bán kiểm tra.",
      "Sau khi có phản hồi, chạy mục 14 Đọc phản hồi và chỉ ra phần cần sửa. AI phân loại thành bốn nhóm: câu trả lời đã có nhưng khách khó tìm; hướng dẫn hoặc biểu mẫu đang khó hiểu; yêu cầu vượt phạm vi; đề xuất có thể xem xét cho phiên bản sau.",
      "Mở PHAN_HOI và kiểm tra NGUYEN_VAN, NHOM_AI, TAI_LIEU_LIEN_QUAN và CAN_CON_NGUOI_XU_LY. Với nhóm 1 và 2, kết quả phải chỉ rõ tài liệu, video hoặc bước liên quan. AI không được trả lời thay người phụ trách và không được hứa thời gian cập nhật.",
      "Người bán tự điền QUYET_DINH và PHIEN_BAN_DU_KIEN. Một yêu cầu riêng lẻ chưa đủ để thay đổi toàn bộ sản phẩm; ưu tiên câu hỏi xuất hiện lặp lại, lỗi ngăn nhiều người hoàn thành hoặc nội dung đã được xác nhận là sai hoặc khó hiểu.",
      "Mỗi lần sửa phải ghi vào PHAT_HANH: số phiên bản, ngày phát hành, nội dung thay đổi, nguồn đã sử dụng và danh sách tài liệu, video, trợ lý AI đã cập nhật đồng bộ. Không chỉ sửa tài liệu rồi để video và trợ lý tiếp tục dùng hướng dẫn cũ.",
      "Dùng phiên bản v1.1 cho thay đổi nhỏ như sửa cách trình bày, thêm ví dụ hoặc viết lại một mục cho dễ hiểu. Dùng v2.0 cho thay đổi lớn như thêm module hoặc mở rộng sang ngành khác; trường hợp này cần được quản lý như một bản nâng cấp.",
      "Sau khi cập nhật, nạp lại đúng bản đã duyệt cho trợ lý AI, cập nhật video hoặc liên kết liên quan và chạy lại các câu hỏi kiểm thử cũ. Chỉ công bố phiên bản khi tài liệu, video và trợ lý cùng trả về một quy trình thống nhất.",
      "Mở bảng điều khiển để xác nhận các phản hồi đã được xử lý và chặng tiếp theo đã rõ. Thư hoặc biểu mẫu đã đọc phải được đánh dấu để hệ thống không phân loại lặp lại."
    ],
    callout: { title: "Kết quả cuối của quy trình", text: "Người bán có một danh sách phản hồi đã phân loại, quyết định sửa do con người đưa ra và lịch sử phát hành có thể truy vết. Tài liệu, video và trợ lý AI luôn dùng cùng một phiên bản." },
    detailImages: [["m3-38.jpg"],["m3-38.jpg"],["m3-38.jpg"],["m3-38.jpg"],["m3-38.jpg"],["m3-38.jpg"],["m3-38.jpg"],["m3-37.jpg"]],
    calloutImages: [],
    defaultVideo: "/steps/videos/model3/buoc-08.mp4"
  }
];

