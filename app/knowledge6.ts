import type { GuideStep } from "./knowledge";

export const promptText6 = `Tôi muốn xây dựng một hệ thống giới thiệu sản phẩm và nhận hoa hồng bằng AI cho mô hình kinh doanh một người. Hệ thống phải giúp tôi kiểm chứng dữ liệu sản phẩm, quản lý chương trình đối tác, thu nhu cầu khách hàng, phân loại mức xử lý, tạo thư nháp có kiểm duyệt, nhập báo cáo hoa hồng, đối soát tiền và cảnh báo rủi ro; AI chỉ hỗ trợ chuẩn hóa và phân loại, còn người kinh doanh giữ toàn bộ quyền duyệt và gửi.

Bối cảnh cài đặt: tôi tạo một Google Sheets trống tên HE_THONG_GIOI_THIEU_AI, mở Apps Script từ chính bảng tính đó và dán mã vào. Hãy trả về đúng ba tệp đầy đủ trong một câu trả lời, mỗi tệp ở một khối mã riêng và ghi rõ tên:
1. Ma.gs chứa cấu hình, onOpen, menu và toàn bộ nghiệp vụ.
2. BangDieuKhien.gs chứa phần máy chủ của bảng điều khiển.
3. BangDieuKhien.html chứa giao diện bảng điều khiển.

Ràng buộc kiến trúc bắt buộc:
- Chỉ Ma.gs được khai báo onOpen. Menu phải có tên “HỆ THỐNG GIỚI THIỆU” và gồm đúng các mục: 1. Khởi tạo hệ thống; 2. Nạp dữ liệu nghiên cứu (AI); 3. Tạo biểu mẫu nhu cầu; 4. Phân loại khách mới (AI); 5. Tạo thư nháp gửi khách; 6. Đánh dấu đã gửi (dòng đang chọn); 7. Nhập báo cáo hoa hồng; 8. Đối soát hoa hồng; 9. Kiểm tra rủi ro; 10. Đặt lịch tự động; Mở bảng điều khiển; Tạo cây thư mục Drive; Xem liên kết hệ thống; Kiểm tra kết nối API.
- Dùng SpreadsheetApp.getActiveSpreadsheet() cho tệp trung tâm. Mã khởi tạo phải chạy lại an toàn, không xóa dữ liệu người dùng. Giữ nguyên thứ tự các cột theo các mảng tiêu đề đã khai báo; không xóa hoặc đổi vị trí cột sau khi hệ thống được tạo.
- Khóa API đọc từ PropertiesService.getScriptProperties() với tên API_KEY, tuyệt đối không ghi khóa trong mã hoặc trang tính. Khóa bắt đầu bằng sk-ant thì gọi Anthropic; khóa khác thì gọi OpenAI. Cho phép thuộc tính MODEL tùy chọn; mặc định claude-sonnet-4-5 cho Anthropic và gpt-4o cho OpenAI.
- Mọi UrlFetchApp.fetch phải đặt muteHttpExceptions: true. Khi API lỗi phải ném lỗi có mã HTTP và nguyên văn nội dung trả về. Phải xử lý an toàn khi AI trả JSON có hàng rào mã, thiếu trường hoặc không hợp lệ; lỗi của một tệp hoặc một khách không được làm dừng cả vòng lặp.
- Tên hàm và biến viết tiếng Việt không dấu; chú thích, thông báo, thư và câu lệnh gửi AI viết tiếng Việt có dấu. Mọi hàm mà HTML gọi phải tồn tại thật trong hai tệp .gs; tên tệp HTML phải đúng BangDieuKhien để khớp createHtmlOutputFromFile('BangDieuKhien').

Năm trang tính hệ thống và thứ tự cột:
1. SAN_PHAM: MA_SP, TEN_SAN_PHAM, NHOM_VAN_DE, KHACH_PHU_HOP, KHACH_CHUA_PHU_HOP, MUC_GIA, TINH_NANG_CHINH, GIOI_HAN, NGUON_CHINH_THUC, NGAY_KIEM_TRA, TRANG_THAI_DU_LIEU, LINK_NOI_DUNG, LINK_HO_SO, GHI_CHU.
2. DOI_TAC: MA_DT, TEN_CHUONG_TRINH, MA_SP_LIEN_QUAN, LINK_DANG_KY, LINK_GIOI_THIEU, CACH_GHI_NHAN, THOI_GIAN_GHI_NHAN, MUC_HOA_HONG, DIEU_KIEN_DAO, KY_THANH_TOAN, GIOI_HAN_QUANG_BA, NGUOI_LIEN_HE, NGUON_DIEU_KHOAN, NGAY_KIEM_TRA, TRANG_THAI_DUYET, LINK_HO_SO, GHI_CHU.
3. KHACH_HANG: MA_KHACH, NGAY_NHAN, EMAIL, NGUON_KHACH, QUY_MO_NHAN_SU, SO_NGUOI_DUNG, VAN_DE_CAN_GIAI_QUYET, CONG_CU_HIEN_TAI, NGAN_SACH_THANG, TIEU_CHI_BAT_BUOC, THOI_GIAN_TRIEN_KHAI, KET_QUA_AI, DE_XUAT, THONG_TIN_CON_THIEU, MUC_XU_LY, TRANG_THAI_DUYET, NGAY_GUI, GHI_CHU.
4. HOA_HONG: MA_KHACH, MA_DOI_TAC, MA_GIAO_DICH, NGAY_GHI_NHAN, TRANG_THAI, HOA_HONG_DU_KIEN, HOA_HONG_DA_DUYET, TIEN_DA_NHAN, NGAY_DU_KIEN_NHAN, CHENH_LECH_DOI_SOAT, TIEN_CON_PHAI_THU, NGUON_BAO_CAO, GHI_CHU.
5. NHAT_KY_HE_THONG: THOI_GIAN, HANH_DONG, CHI_TIET, KET_QUA.

Danh sách trạng thái phải tạo bằng danh sách xổ và có màu cảnh báo:
- Sản phẩm: CHO_DUYET, DA_KIEM_TRA, CAN_CAP_NHAT.
- Đối tác: CHO_DUYET, DA_DUYET, CAN_XAC_NHAN, KHONG_THAM_GIA.
- Khách hàng: MOI, CHO_DUYET, CAN_HOI_THEM, CHUYEN_NGUOI, DA_DUYET, DA_GUI; mức xử lý gồm MUC_1, MUC_2, MUC_3.
- Hoa hồng: DA_GHI_NHAN, DU_DIEU_KIEN, DA_DUYET, DA_NHAN_TIEN, BI_HUY_DAO.

Các chức năng phải hoạt động đầy đủ như sau:
1. Khởi tạo năm trang tính, tiêu đề tiếng Việt, bộ lọc, cố định hàng đầu, danh sách xổ, định dạng cảnh báo và nhật ký. Tạo thư mục gốc HE_THONG_GIOI_THIEU_AI cùng NAP_DU_LIEU và NAP_HOA_HONG; tạo MAU_HOA_HONG.csv và bảng mẫu MAU_TONG_HOP_NGHIEN_CUU; lưu các ID vào Script Properties.
2. Nạp hồ sơ nghiên cứu từ NAP_DU_LIEU. Tệp tên SP_<MÃ>_<Tên> được AI chuẩn hóa vào SAN_PHAM; tệp DT_<MÃ>_<Tên> được trích điều khoản vào DOI_TAC. Hỗ trợ Google Docs, TXT, PDF, ảnh và bảng tính. Mỗi tệp tạo hoặc cập nhật đúng mã, lưu link hồ sơ, ở trạng thái CHO_DUYET và được đổi tên sau khi nạp để chống trùng. Dữ liệu thiếu phải ghi rõ phần cần kiểm tra; không bịa giá, tính năng, giới hạn hoặc điều khoản.
3. Tạo Google Form thu email người trả lời và đúng bảy câu hỏi: quy mô nhân sự; số người trực tiếp dùng phần mềm; vấn đề cần giải quyết; công cụ hiện tại; ngân sách tối đa mỗi tháng; tính năng bắt buộc; thời gian muốn triển khai. Nguồn khách được mã tự ghi là “Biểu mẫu nhu cầu”. Nối phản hồi về bảng tính đang mở, tạo mã khách duy nhất, ghi trạng thái MOI và tự cài trình kích hoạt gửi biểu mẫu mà không tạo trùng.
4. Phân loại khách MOI chỉ bằng dữ liệu SAN_PHAM đã DA_KIEM_TRA và còn trong hạn 90 ngày. Prompt tuyệt đối không được nhận mức hoa hồng hoặc dữ liệu DOI_TAC. AI trả về JSON gồm mức xử lý, lý do, đề xuất tối đa ba sản phẩm và thông tin còn thiếu. MUC_1 chuyển CHO_DUYET; MUC_2 chuyển CAN_HOI_THEM; MUC_3 chuyển CHUYEN_NGUOI. Nếu mã sản phẩm không tồn tại, giữ khách ở MOI và ghi lỗi để người dùng kiểm tra.
5. Chỉ tạo Gmail Draft, không tự gửi. Khách DA_DUYET nhận thư tư vấn gồm lựa chọn, lý do, điểm cần cân nhắc và liên kết giới thiệu của đối tác DA_DUYET; khách CAN_HOI_THEM nhận thư hỏi đúng thông tin còn thiếu; khách CHUYEN_NGUOI không có thư tư vấn tự động. Sau khi người dùng tự kiểm tra và gửi, mục 6 chỉ đánh dấu dòng đang chọn thành DA_GUI và ghi ngày gửi.
6. Nhập CSV từ NAP_HOA_HONG theo cặp khóa MA_DOI_TAC + MA_GIAO_DICH; thêm mới hoặc cập nhật đúng giao dịch, đổi tên tệp với tiền tố DA_NHAP_ để chống nhập lại. Đối soát phải tính CHENH_LECH_DOI_SOAT = HOA_HONG_DU_KIEN - HOA_HONG_DA_DUYET và TIEN_CON_PHAI_THU = HOA_HONG_DA_DUYET - TIEN_DA_NHAN, tô cảnh báo nhưng không tự xóa chênh lệch.
7. Kiểm tra rủi ro gồm: sản phẩm thiếu ngày kiểm tra hoặc quá 90 ngày; tỷ trọng hoa hồng đã duyệt theo đối tác trong 90 ngày và cảnh báo khi một đối tác chiếm từ 70%; khách DA_GUI chưa có giao dịch hoa hồng; khoản đã duyệt nhưng quá ngày dự kiến nhận. Báo cáo hiển thị trên màn hình, gửi bản sao vào email của tài khoản chạy mã và ghi nhật ký.
8. Đặt lịch tự động sau khi xóa trigger lịch cũ để tránh trùng: kiểm tra rủi ro lúc 8 giờ thứ Hai và đối soát hoa hồng lúc 16 giờ thứ Sáu. Bảng điều khiển không cần trigger; mỗi lần mở tự đọc số liệu mới nhất.
9. Bảng điều khiển mở bằng hộp thoại lớn, chỉ đọc dữ liệu trang tính để hiển thị khách theo trạng thái, ba mức tiền, cảnh báo, danh sách việc cần làm, tỷ trọng đối tác và sản phẩm quá hạn. Hàm lấy dữ liệu không gọi Drive và không gọi AI để mở nhanh.
10. Kiểm tra kết nối API bằng một yêu cầu ngắn, báo rõ model đang dùng và thông báo hữu ích khi sai khóa, sai model hoặc hết hạn mức.

Ba ranh giới an toàn bắt buộc phải được viết cứng trong mã và prompt:
- AI không được ưu tiên sản phẩm vì hoa hồng; dữ liệu phân loại khách không bao giờ chứa mức hoa hồng hoặc bảng DOI_TAC.
- Hệ thống chỉ tạo thư nháp, không thay người kinh doanh gửi thư hoặc cam kết với khách.
- MUC_3 gồm chuyển dữ liệu cũ, tích hợp phức tạp, dữ liệu nhạy cảm hoặc hợp đồng lớn; bắt buộc CHUYEN_NGUOI và không tạo thư tư vấn tự động.
- Không bịa sản phẩm, giá, tính năng, giới hạn, điều khoản, tỷ lệ hoa hồng, bằng chứng hoặc kết quả. Thiếu dữ liệu phải ghi rõ là thiếu và chờ người dùng xác nhận.
- Chỉ TIEN_DA_NHAN được coi là tiền thực thu; không dùng HOA_HONG_DU_KIEN làm doanh thu.

Cuối câu trả lời, hãy hướng dẫn chính xác: dán từng tệp ở đâu; tạo API_KEY thế nào; chạy hàm nào để cấp quyền; chạy menu nào trước; cách tạo và nạp hồ sơ SP_/DT_; cách duyệt dữ liệu; cách thử biểu mẫu, phân loại, thư nháp, báo cáo hoa hồng, đối soát, rủi ro, lịch tự động và bảng điều khiển. Đồng thời liệt kê bảng đối chiếu mọi hàm HTML gọi với tên tệp .gs nơi hàm đó được khai báo.`;

export const steps6: GuideStep[] = [
  {
    id:"m6-buoc-01", n:"01", title:"Dựng tệp trung tâm, dán ba tệp mã và khởi tạo hệ thống",
    details:[
      "Tạo một Google Sheets mới và đặt tên HE_THONG_GIOI_THIEU_AI. Đây là tệp trung tâm của toàn bộ hệ thống. Không cần tự tạo các trang tính hoặc gõ tên cột; khi chạy khởi tạo, mã sẽ tự sinh SAN_PHAM, DOI_TAC, KHACH_HANG, HOA_HONG và NHAT_KY_HE_THONG.",
      "Trong bảng tính, vào Tiện ích mở rộng → Apps Script. Ở tệp Code.gs hoặc Mã.gs có sẵn, xóa mã mẫu rồi dán toàn bộ tệp Ma.gs. Bên trái, cạnh mục Tệp, bấm dấu + → Tập lệnh, đặt tên BangDieuKhien và dán tệp BangDieuKhien.gs. Bấm dấu + lần nữa → HTML, đặt tên đúng BangDieuKhien, không gõ đuôi .html, rồi dán BangDieuKhien.html. Tên HTML phải khớp từng chữ với createHtmlOutputFromFile('BangDieuKhien').",
      "Bấm Lưu hoặc Ctrl+S. Chỉ Ma.gs được có hàm onOpen; không thêm onOpen vào BangDieuKhien.gs vì hai hàm trùng tên sẽ ghi đè nhau và menu có thể biến mất.",
      "Tạo khóa API tại trang quản trị OpenAI hoặc Anthropic. Khóa chỉ hiện đầy đủ một lần nên sao chép ngay và không gửi cho người khác. Quay lại Apps Script → Cài đặt dự án → Thuộc tính của tập lệnh → Thêm thuộc tính; nhập tên API_KEY và dán khóa vào ô giá trị. Nếu cần đổi mô hình, thêm thuộc tính MODEL; không bắt buộc nếu dùng model mặc định trong mã.",
      "Ở hộp chọn hàm trên thanh công cụ Apps Script, chọn onOpen rồi bấm Chạy để cấp quyền. Khi Google hiện cảnh báo ứng dụng chưa được xác minh, chọn đúng tài khoản → Nâng cao → Đi tới dự án → Cho phép. Đây là bước bắt buộc một lần cho tài khoản; chưa cấp đủ quyền thì Drive, Gmail, Form và các lịch tự động đều không chạy.",
      "Quay lại bảng tính và nhấn F5. Khi menu HỆ THỐNG GIỚI THIỆU xuất hiện, chọn 1. Khởi tạo hệ thống. Chờ thông báo Khởi tạo xong, kiểm tra đủ năm trang dữ liệu và các thư mục hệ thống đã được tạo.",
      "Chọn HỆ THỐNG GIỚI THIỆU → Kiểm tra kết nối API. Kết quả đúng phải báo Kết nối thành công và cho biết model đang dùng. Nếu lỗi 401, kiểm tra lại API_KEY; nếu sai model hoặc hết hạn mức, sửa thuộc tính MODEL hoặc tài khoản API rồi chạy lại trước khi nạp dữ liệu."
    ],
    callout:{title:"Kết quả của bước",text:"Bảng tính trung tâm đã có đủ năm trang, menu HỆ THỐNG GIỚI THIỆU hoạt động, cây thư mục Drive đã được lưu bằng ID và API trả về thông báo kết nối thành công."},
    detailImages:[["m6-01.jpg"],["m6-02.jpg"],[],["m6-03.jpg"],[],["m6-04.jpg","m6-05.jpg"],["m6-06.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-00.mp4"
  },
  {
    id:"m6-buoc-02", n:"02", title:"Gom hồ sơ, nạp dữ liệu và duyệt từng sản phẩm",
    details:[
      "Gom tài liệu thật của từng sản phẩm: báo giá Word/PDF do nhân viên bán hàng gửi, nội dung dán từ trang bảng giá chính thức, tệp tài liệu tính năng hoặc ảnh chụp màn hình. Mỗi sản phẩm để trong một tệp riêng để AI không trộn dữ liệu giữa nhiều sản phẩm.",
      "Đổi tên theo mẫu SP_<MÃ>_<Tên>, ví dụ SP_CRM01_TenPhanMem. Mã do bạn tự đặt nhưng phải duy nhất, không trùng và không có khoảng trắng. Trong nội dung tệp cần giữ link nguồn chính thức, ngày kiểm tra và phần giới hạn, không chỉ giữ câu quảng cáo.",
      "Trong Google Sheets, chọn HỆ THỐNG GIỚI THIỆU → Tạo cây thư mục Drive. Sau đó chọn Xem liên kết hệ thống, mở thư mục NAP_DU_LIEU và kéo thả các tệp SP_ vào. Có thể dùng tệp mẫu MAU_TONG_HOP_NGHIEN_CUU nếu muốn nhập nhiều dòng có cấu trúc, nhưng phải xóa dòng minh họa trước khi dùng dữ liệu thật.",
      "Quay lại bảng tính → HỆ THỐNG GIỚI THIỆU → 2. Nạp dữ liệu nghiên cứu (AI). Chờ đến khi hộp thoại báo số tệp sản phẩm đã nạp. Hệ thống đọc từng tệp, chuẩn hóa dữ liệu và lưu link hồ sơ; tệp đã xử lý được đánh dấu để lần sau không nạp trùng.",
      "Mở trang SAN_PHAM. Mỗi tệp phải trở thành đúng một dòng có mã tương ứng và TRẠNG THÁI DỮ LIỆU = CHO_DUYET, nền vàng. Kiểm tra tên sản phẩm, nhóm vấn đề, khách phù hợp, khách chưa phù hợp, mức giá, tính năng, giới hạn, nguồn chính thức và ngày kiểm tra.",
      "Rà từng chỗ AI ghi CẦN KIỂM TRA hoặc nội dung chưa rõ: mở lại nguồn chính thức và điền tay. Xóa câu quảng cáo nếu lọt vào ô dữ liệu. Nếu nguồn là ảnh hoặc PDF, đối chiếu lại từng con số, đơn vị tiền và điều kiện áp dụng với bản gốc.",
      "Chỉ khi toàn bộ dữ liệu đã được đối chiếu, đổi TRẠNG THÁI DỮ LIỆU sang DA_KIEM_TRA, nền xanh. Không chỉ thay trạng thái để đi tiếp; chỉ dòng DA_KIEM_TRA còn trong hạn 90 ngày mới được đưa vào bước phân loại khách."
    ],
    callout:{title:"Kết quả của bước",text:"SAN_PHAM trở thành danh mục đã kiểm chứng. Hệ thống biết sản phẩm phù hợp với ai, không phù hợp với ai, có giới hạn gì và nguồn nào chứng minh; dữ liệu chưa chắc chắn vẫn bị giữ ở CHO_DUYET."},
    detailImages:[["m6-07.jpg"],[],["m6-08.jpg"],["m6-09.jpg"],["m6-10.jpg"],[],["m6-11.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-01.mp4"
  },
  {
    id:"m6-buoc-03", n:"03", title:"Nạp, kiểm tra và duyệt chương trình đối tác",
    details:[
      "Với mỗi sản phẩm đã DA_KIEM_TRA, tìm trang chương trình đối tác hoặc giới thiệu trên website chính thức của nhà cung cấp. Lưu điều khoản thành Google Docs, TXT, PDF hoặc ảnh chụp màn hình; mỗi chương trình để trong một tệp riêng.",
      "Đổi tên theo mẫu DT_<MÃ>_<Tên> và dùng cùng mã với sản phẩm liên quan: nếu sản phẩm là SP_CRM01_... thì hồ sơ đối tác là DT_CRM01_.... Không dùng tên tùy ý vì mã là điểm nối giữa sản phẩm, chương trình đối tác và liên kết trong thư gửi khách.",
      "Trước khi tải lên, kiểm tra đủ năm nhóm: cách ghi nhận khách; mức hoa hồng; điều kiện hủy hoặc đảo hoa hồng; kỳ thanh toán; giới hạn quảng bá. Thiếu nhóm nào cứ để thiếu và đánh dấu cần xác nhận; không lấy số từ bài giới thiệu không chính thức và không để AI tự bịa.",
      "Đưa các tệp DT_ vào NAP_DU_LIEU rồi chạy lại 2. Nạp dữ liệu nghiên cứu (AI). Các tệp SP_ đã nạp trước đó không bị nạp lại. Sau thông báo hoàn tất, mở DOI_TAC và kiểm tra mỗi chương trình là một dòng CHO_DUYET.",
      "Điền tay MÃ SP LIÊN QUAN và LINK GIỚI THIỆU. Mã sản phẩm phải khớp chính xác với SAN_PHAM; link giới thiệu phải là đường dẫn riêng được nhà cung cấp cấp sau khi đăng ký. Bỏ trống link thì thư tư vấn sau này phải hiện cảnh báo và không được gửi.",
      "Duyệt từng chương trình bằng ba câu: khách được ghi nhận bằng cách nào; khi nào hoa hồng được duyệt; trường hợp nào bị hủy hoặc đảo. Đủ cả ba câu và nguồn hợp lệ thì đổi thành DA_DUYET. Còn câu phải hỏi lại thì CAN_XAC_NHAN; không nhận thị trường hoặc mô hình của bạn thì KHONG_THAM_GIA.",
      "Đếm lại danh mục: nên giữ ba đến năm chương trình và mỗi nhóm nhu cầu chính có ít nhất một đối tác dự phòng. Mục tiêu là giảm phụ thuộc, không phải giữ thật nhiều link chưa kiểm chứng."
    ],
    callout:{title:"Ranh giới trung lập",text:"Dữ liệu hoa hồng nằm ở DOI_TAC để vận hành và đối soát; bước AI phân loại khách chỉ được đọc SAN_PHAM đã kiểm tra, tuyệt đối không dùng mức hoa hồng để xếp sản phẩm."},
    detailImages:[[],[],[],["m6-12.jpg"],["m6-13.jpg"],["m6-14.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-02.mp4"
  },
  {
    id:"m6-buoc-04", n:"04", title:"Tạo biểu mẫu nhu cầu và kiểm tra luồng nhận khách",
    details:[
      "Chạy HỆ THỐNG GIỚI THIỆU → 3. Tạo biểu mẫu nhu cầu một lần duy nhất. Hệ thống bật chế độ thu email và tạo đúng bảy câu hỏi: quy mô nhân sự; số người trực tiếp dùng phần mềm; vấn đề cần giải quyết; công cụ hiện tại; ngân sách tối đa mỗi tháng; tính năng bắt buộc; thời gian muốn triển khai. NGUỒN KHÁCH được mã tự ghi là Biểu mẫu nhu cầu, không phải một câu hỏi riêng.",
      "Mã tự nối biểu mẫu với bảng tính và gắn trình kích hoạt gửi biểu mẫu. Mỗi phản hồi mới phải được ghi vào KHACH_HANG với MÃ KHÁCH riêng, ngày nhận và trạng thái MOI. Không tự tạo trigger lần hai nếu hệ thống đã báo biểu mẫu tồn tại.",
      "Chọn HỆ THỐNG GIỚI THIỆU → Xem liên kết hệ thống để lấy đường dẫn biểu mẫu. Mở đúng liên kết dành cho người trả lời, sau đó có thể gắn vào bài viết, chữ ký email hoặc tin nhắn tư vấn.",
      "Tự điền một phản hồi thử bằng dữ liệu của bạn. Trả lời đủ các câu, bấm Gửi rồi quay lại KHACH_HANG. Kết quả đúng là có một dòng mới, không ghi đè dòng cũ, MÃ KHÁCH không trùng và TRẠNG THÁI DUYỆT = MOI.",
      "Nếu biểu mẫu nhận phản hồi nhưng KHACH_HANG không có dòng mới, mở Apps Script → Trình kích hoạt và kiểm tra trigger onGuiBieuMau; đồng thời kiểm tra tài khoản đã cấp quyền. Chỉ chuyển sang phân loại khi luồng thử đã ghi dữ liệu đúng."
    ],
    callout:{title:"Kết quả của bước",text:"Bạn có một biểu mẫu nhu cầu dùng được thật; mỗi phản hồi đi vào KHACH_HANG dưới dạng một hồ sơ MOI có mã riêng, sẵn sàng cho bước phân loại."},
    detailImages:[["m6-15.jpg"],[],["m6-16.jpg"],["m6-17.jpg","m6-18.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-03.mp4"
  },
  {
    id:"m6-buoc-05", n:"05", title:"Phân loại khách mới, đọc lý do và duyệt ba mức xử lý",
    details:[
      "Khi KHACH_HANG có dòng MOI, chạy HỆ THỐNG GIỚI THIỆU → 4. Phân loại khách mới (AI). Hệ thống chỉ lấy SAN_PHAM đang DA_KIEM_TRA và còn trong hạn 90 ngày để so với nhu cầu; dữ liệu hoa hồng và bảng DOI_TAC không được đưa vào prompt.",
      "MUC_1 dùng khi thông tin đủ để đưa ra lựa chọn: trạng thái chuyển CHO_DUYET, kèm tối đa ba sản phẩm, lý do phù hợp và điểm cần cân nhắc. MUC_2 dùng khi thiếu dữ liệu khách: trạng thái CAN_HOI_THEM và cột THÔNG TIN CÒN THIẾU phải ghi rõ cần hỏi gì. MUC_3 dùng cho chuyển dữ liệu cũ, tích hợp phức tạp, dữ liệu nhạy cảm hoặc hợp đồng lớn: trạng thái CHUYEN_NGUOI.",
      "Đọc cột lý do trước khi sửa trạng thái. Nếu lý do nói thiếu thông tin của khách thì giữ MUC_2. Nếu thiếu dữ liệu sản phẩm, quay lại SAN_PHAM để cập nhật, đổi khách về MOI rồi chạy phân loại lại; không hỏi khách về phần dữ liệu thuộc trách nhiệm của bạn.",
      "Với MUC_1, đọc từng đề xuất, lý do và điểm chưa phù hợp. Chỉ khi đồng ý mới đổi CHO_DUYET thành DA_DUYET. Nếu AI xếp chưa đúng, sửa tay mức và trạng thái; quyền quyết định luôn thuộc người kinh doanh.",
      "Với MUC_2, giữ CAN_HOI_THEM để bước sau tạo thư hỏi đúng phần còn thiếu. Với MUC_3, giữ CHUYEN_NGUOI và trao đổi trực tiếp; hệ thống cố ý không tạo thư tư vấn tự động cho nhóm này.",
      "Điều kiện dừng: không có sản phẩm DA_KIEM_TRA còn hạn thì mục 4 phải từ chối chạy; AI trả mã sản phẩm không có trong danh mục thì giữ khách ở MOI kèm ghi chú lỗi. Không sửa bỏ các chốt này để ép hệ thống tạo đề xuất."
    ],
    callout:{title:"Kết quả cần đạt",text:"Mỗi khách mới được phân mức trong ngày, có lý do đọc được và không khách nào nhận tư vấn trước khi người kinh doanh duyệt. MUC_3 luôn quay về người thật."},
    detailImages:[["m6-19.jpg"],["m6-20.jpg"],[],["m6-21.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-04.mp4"
  },
  {
    id:"m6-buoc-06", n:"06", title:"Tạo thư nháp, kiểm tra thủ công và đánh dấu đã gửi",
    details:[
      "Sau khi duyệt trạng thái khách, chạy HỆ THỐNG GIỚI THIỆU → 5. Tạo thư nháp gửi khách. Khách DA_DUYET nhận thư tư vấn gồm lựa chọn, lý do, điểm cần cân nhắc và link giới thiệu hợp lệ; khách CAN_HOI_THEM nhận thư hỏi bổ sung; khách CHUYEN_NGUOI không có thư tư vấn.",
      "Mở Gmail → Thư nháp. Đây mới là bản nháp, hệ thống không tự gửi. Đối chiếu đúng người nhận, mã khách, tên sản phẩm, mức giá, phạm vi phù hợp, giới hạn và câu chữ cam kết. Không biến lời giải thích thành lời hứa kết quả.",
      "Kiểm tra liên kết chỉ được lấy từ chương trình DOI_TAC đang DA_DUYET. Nếu thư hiện cảnh báo đỏ do thiếu liên kết, không gửi bản đó; quay lại DOI_TAC, bổ sung LINK GIỚI THIỆU, xác nhận mã sản phẩm liên quan rồi chạy lại mục 5.",
      "Khi nội dung đã đúng, người kinh doanh tự bấm Gửi trong Gmail. Hệ thống không được thay bạn gửi tự động vì đây là điểm kiểm duyệt cuối cùng trước khi thông tin đến khách.",
      "Gửi xong, quay lại KHACH_HANG, bấm vào một ô trên đúng dòng khách và chọn HỆ THỐNG GIỚI THIỆU → 6. Đánh dấu đã gửi (dòng đang chọn). Kiểm tra TRẠNG THÁI DUYỆT đổi thành DA_GUI và cột NGÀY GỬI có thời điểm. Chọn sai dòng sẽ ghi nhận sai khách nên phải đối chiếu MÃ KHÁCH trước khi chạy."
    ],
    callout:{title:"Ranh giới gửi thư",text:"AI chỉ chuẩn bị nội dung. Người kinh doanh chịu trách nhiệm kiểm tra sản phẩm, giá, giới hạn, liên kết và tự bấm Gửi; sau đó mới dùng menu để ghi dấu chống nhầm và theo dõi hoa hồng."},
    detailImages:[["m6-22.jpg"],["m6-23.jpg"],[],["m6-24.jpg"],["m6-25.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-05.mp4"
  },
  {
    id:"m6-buoc-07", n:"07", title:"Nhập báo cáo đối tác và đối soát hoa hồng",
    details:[
      "Chọn HỆ THỐNG GIỚI THIỆU → Xem liên kết hệ thống, mở NAP_HOA_HONG và tải MAU_HOA_HONG.csv. Giữ nguyên tên và thứ tự cột, xóa dòng minh họa trước khi điền dữ liệu thật. Không đổi mã khách, mã đối tác hoặc mã giao dịch sang kiểu số làm mất ký tự đầu.",
      "Chuẩn hóa báo cáo đối tác để mỗi dòng có MA_KHACH, MA_DOI_TAC, MA_GIAO_DICH, ngày ghi nhận, trạng thái, hoa hồng dự kiến, hoa hồng đã duyệt, tiền đã nhận, ngày dự kiến nhận, nguồn báo cáo và ghi chú. Các mức tiền phải tách riêng; không điền tiền dự kiến vào cột tiền đã nhận.",
      "Đưa CSV vào NAP_HOA_HONG rồi chạy 7. Nhập báo cáo hoa hồng. Hệ thống thêm dòng mới hoặc cập nhật dòng cũ theo cặp MA_DOI_TAC + MA_GIAO_DICH, sau đó đổi tên tệp bằng tiền tố DA_NHAP_ để lần chạy sau không nhập lại cùng báo cáo.",
      "Mở HOA_HONG và kiểm tra đúng mã khách, đối tác, giao dịch, ngày và ba cột tiền. Sau đó chạy 8. Đối soát hoa hồng. Lưu ý sách có chỗ ghi nhầm mục 7 cho bước đối soát; menu của mã đang dùng là mục 8.",
      "Mã tính CHENH_LECH_DOI_SOAT = HOA_HONG_DU_KIEN - HOA_HONG_DA_DUYET và TIEN_CON_PHAI_THU = HOA_HONG_DA_DUYET - TIEN_DA_NHAN. Dòng lệch được tô màu để điều tra; khoản còn phải thu lớn hơn 0 được cảnh báo riêng.",
      "Xử lý từng dòng lệch bằng chứng từ và trao đổi thật: ghi nguyên nhân, mã chứng từ hoặc nội dung đã xác nhận với đối tác vào GHI_CHU. Không xóa số lệch khi chưa có căn cứ, không dùng HOA_HONG_DU_KIEN làm doanh thu và không tăng quảng cáo nếu còn giao dịch quá kỳ thanh toán chưa được giải thích. Chỉ TIEN_DA_NHAN là dòng tiền đã về."
    ],
    callout:{title:"Ba mức tiền phải tách riêng",text:"Hoa hồng dự kiến cho biết khả năng; hoa hồng đã duyệt là nghĩa vụ đối tác đã xác nhận; tiền đã nhận mới là tiền thực thu. Đối soát giúp nhìn rõ khoảng cách giữa ba mức này."},
    detailImages:[["m6-26.jpg"],[],["m6-27.jpg"],["m6-28.jpg"],["m6-29.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-06.mp4"
  },
  {
    id:"m6-buoc-08", n:"08", title:"Kiểm tra rủi ro, đặt lịch tự động và dùng bảng điều khiển",
    details:[
      "Chạy HỆ THỐNG GIỚI THIỆU → 9. Kiểm tra rủi ro. Lưu ý sách có chỗ ghi nhầm mục 7; menu thực tế của mã là mục 9. Hệ thống mở báo cáo trên màn hình, gửi bản sao vào email của tài khoản đang chạy và ghi nhật ký.",
      "Kiểm tra dữ liệu sản phẩm: dòng thiếu NGÀY KIỂM TRA hoặc quá 90 ngày bị chuyển CAN_CAP_NHAT. Mở lại NGUỒN CHÍNH THỨC, đối chiếu giá, gói, tính năng và giới hạn; sửa dữ liệu và nội dung liên quan trước, sau đó mới cập nhật ngày và chuyển lại DA_KIEM_TRA. Không chỉ đổi ngày để xóa cảnh báo.",
      "Kiểm tra phụ thuộc đối tác: báo cáo tính tỷ trọng HOA_HONG_DA_DUYET của 90 ngày gần nhất. Khi một đối tác chiếm từ 70% trở lên, rà lại phương án thay thế và bổ sung đối tác dự phòng cho nhóm nhu cầu chính; đây là cảnh báo quản trị, không phải lệnh tự động chuyển khách.",
      "Kiểm tra ghi nhận và thanh toán: truy lại khách đã DA_GUI nhưng chưa có dòng trong HOA_HONG bằng MA_KHACH; kiểm tra các khoản đã duyệt nhưng quá NGAY_DU_KIEN_NHAN bằng MA_GIAO_DICH. Mỗi trường hợp phải có ghi chú và bằng chứng trao đổi với đối tác.",
      "Rà nội dung và dữ liệu khách: mở LINK_NOI_DUNG của sản phẩm CAN_CAP_NHAT để sửa giá, tính năng hoặc giới hạn cũ. Biểu mẫu chỉ nên giữ dữ liệu cần cho lựa chọn; trước khi đưa sang AI hoặc đối tác, loại trường không cần thiết và không gửi dữ liệu nhạy cảm.",
      "Chạy 10. Đặt lịch tự động. Mã xóa các trigger lịch cũ của chính hệ thống rồi tạo lịch kiểm tra rủi ro lúc 8 giờ thứ Hai và đối soát hoa hồng lúc 16 giờ thứ Sáu, tránh tạo lịch trùng. Kiểm tra Apps Script → Trình kích hoạt để thấy đúng hai lịch.",
      "Chọn Mở bảng điều khiển. Hộp thoại tự đọc số liệu mới nhất từ năm trang tính và hiển thị khách theo trạng thái, hoa hồng dự kiến, đã duyệt, đã nhận, cảnh báo, việc cần làm, tỷ trọng đối tác và sản phẩm quá hạn. Bảng điều khiển không gọi Drive hoặc AI khi mở và không cần trình kích hoạt riêng.",
      "Dùng bảng điều khiển để biết việc tiếp theo, nhưng xử lý dữ liệu ở trang tính gốc: duyệt khách, cập nhật sản phẩm, ghi chú khoản lệch và kiểm tra đối tác. Sau mỗi thay đổi, bấm Tải lại dữ liệu trong bảng điều khiển để xem kết quả mới."
    ],
    callout:{title:"Kết quả vận hành hằng tuần",text:"Thứ Hai nhận cảnh báo rủi ro, thứ Sáu đối soát hoa hồng; bảng điều khiển cho biết trạng thái hiện tại bất cứ lúc nào. Hệ thống cảnh báo và sắp việc, còn quyết định sản phẩm, đối tác, nội dung và tiền vẫn do người kinh doanh thực hiện."},
    detailImages:[["m6-30.jpg"],[],[],[],[],["m6-31.jpg"],["m6-32.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model6/part-07.mp4"
  }
];

