import type { GuideStep } from "./knowledge";

export const promptText4 = `Tôi cần xây dựng một hệ thống báo cáo bán hàng tuần cho doanh nghiệp nhỏ bằng Google Sheets và Google Apps Script. Hệ thống phải tự kiểm tra dữ liệu, tính toàn bộ chỉ số bằng mã, dùng AI chỉ để viết phần nhận xét, bắt buộc có người quản lý duyệt trước khi gửi email và có bảng điều khiển trực quan.

Bối cảnh cài đặt: tôi tạo một Google Sheets trống, mở Apps Script từ chính bảng tính đó và dán mã vào. Hãy trả về đúng ba tệp đầy đủ trong một câu trả lời, mỗi tệp đặt trong một khối mã riêng và ghi rõ tên: Ma.gs chứa nghiệp vụ chính và menu; bang_dieu_khien.gs chứa phần máy chủ của bảng điều khiển; bang_dieu_khien.html chứa giao diện.

Ràng buộc kiến trúc bắt buộc:
- Dùng SpreadsheetApp.getActiveSpreadsheet(); không dùng SpreadsheetApp.create().
- Chỉ Ma.gs được khai báo onOpen và tạo menu “Bao cao tuan”. Menu gồm: Mở bảng điều khiển; 1. Tạo khung trang tính; 2. Kiểm tra dữ liệu tuần; 3. Tính chỉ số tuần; 4. Tạo nhận xét bằng AI; 5. Gửi báo cáo đã duyệt; 6. Kiểm tra kết nối API; 7. Đặt lịch chạy tự động.
- Khóa API đọc từ PropertiesService.getScriptProperties() với tên OPENAI_API_KEY; tuyệt đối không ghi khóa vào mã hoặc bảng tính.
- Dùng OpenAI Responses API. Mọi UrlFetchApp.fetch phải đặt muteHttpExceptions: true; nếu API lỗi phải ném lỗi có mã HTTP và nguyên văn nội dung trả về. Model và max_output_tokens đọc từ CAU_HINH; mặc định model gpt-5.6 và max_output_tokens ít nhất 4000.
- Tra cột theo tên tiêu đề, không dùng vị trí cột cố định. Tên hàm, biến viết tiếng Việt không dấu; chú thích, thông báo, email và câu lệnh gửi AI viết tiếng Việt có dấu.
- Các hàm do HTML gọi phải tồn tại thật trong hai tệp .gs. Cuối câu trả lời phải liệt kê bảng đối chiếu hàm HTML gọi với tệp và chức năng tương ứng.

Năm trang tính hệ thống:
1. CAU_HINH: KHOA, GIA_TRI, GHI_CHU.
2. DU_LIEU_NGAY: NGAY, NHAN_VIEN, KHACH_TIEM_NANG_MOI, KHACH_DA_LIEN_HE, CUOC_HEN, DON_THANH_CONG, DOANH_THU_GHI_NHAN, TIEN_THUC_THU, DON_HUY, DON_HOAN, GHI_CHU.
3. CHI_SO_TUAN: MA_TUAN, TU_NGAY, DEN_NGAY, toàn bộ số tổng theo tuần, TY_LE_LIEN_HE, TY_LE_CHOT, TY_LE_HUY, TY_LE_HOAN, KPI_TUAN, MUC_DAT_KPI, SO_SANH_TUAN_TRUOC, TRANG_THAI_DU_LIEU, NGAY_TINH.
4. BAO_CAO_AI: MA_BAO_CAO, MA_TUAN, NGAY_TAO, TONG_QUAN, CANH_BAO, HANH_DONG_DE_XUAT, CAU_HOI_CHO_QUAN_LY, TRANG_THAI, NGUOI_DUYET, NGAY_DUYET, NGAY_GUI, NGUOI_NHAN, JSON_THO.
5. NHAT_KY_HE_THONG: THOI_GIAN, CHUC_NANG, MA_TUAN, TRANG_THAI, CHI_TIET, MA_BAO_CAO.

Khi tạo khung, định dạng hàng tiêu đề, cố định hàng đầu, gắn danh sách xổ cho TRANG_THAI gồm CAN_SUA_DU_LIEU, CHO_DUYET, DA_DUYET_GUI, DA_GUI, LOI; đồng thời gieo cấu hình mặc định vào CAU_HINH: TEN_DOANH_NGHIEP, ID_FILE_KHACH, TEN_TRANG_KHACH, KY_BAO_CAO, KPI_TUAN, TY_LE_O_TRONG_TOI_DA, NGUONG_GIAM_TIEN_THUC_THU, NGUONG_GIAM_TY_LE_CHOT, EMAIL_NGUOI_NHAN, MODEL, MAX_OUTPUT_TOKENS, SO_EMAIL_MOI_LAN_CHAY, PROMPT_HE_THONG, PROMPT_NGUOI_DUNG, EMAIL_TIEU_DE, EMAIL_NOI_DUNG.

Kỳ báo cáo hỗ trợ TUAN_HIEN_TAI, TUAN_TRUOC hoặc một ngày yyyy-MM-dd để chạy lại tuần cũ. Tuần tính từ thứ Hai đến Chủ Nhật. Nếu KY_BAO_CAO đang là ngày cố định, hàm chạy theo lịch phải bỏ qua để tránh tạo lại cùng một tuần.

Các chức năng cần thực hiện:
1. Tạo khung trang tính và cấu hình mặc định mà không xóa dữ liệu đang có.
2. Cho phép đọc DU_LIEU_NGAY trong chính tệp hiện tại hoặc đọc trực tiếp một Google Sheets khác qua ID_FILE_KHACH và TEN_TRANG_KHACH. Bảng điều khiển phải cho dán cả đường dẫn hoặc ID tệp, kiểm tra quyền truy cập rồi lưu ID vào CAU_HINH.
3. Kiểm tra dữ liệu tuần trước khi tính: ngày không đọc được; ngày tương lai; tên nhân viên trống; số âm; dòng trùng theo cặp ngày và nhân viên; tỷ lệ ô bắt buộc trống vượt TY_LE_O_TRONG_TOI_DA. Dữ liệu ngoài kỳ chỉ bỏ qua vì tệp có thể chứa nhiều tuần. Nếu không có dòng trong kỳ, hướng dẫn đổi KY_BAO_CAO. Ghi kết quả và lỗi vào nhật ký.
4. Tính bằng mã các tổng và tỷ lệ tuần. Không để AI tính số. Nếu mẫu số bằng 0, để trống tỷ lệ và ghi cảnh báo. Tự lấy hoặc tự tính tuần trước để so sánh khách tiềm năng, đơn thành công, tiền thực thu và tỷ lệ chốt. Ghi hoặc cập nhật đúng dòng MA_TUAN trong CHI_SO_TUAN.
5. Tạo nhận xét AI chỉ khi đã có chỉ số và tuần chưa có báo cáo. Gửi bảng chỉ số đã tính, tuần trước, KPI, mức đạt KPI và ngưỡng cảnh báo. AI phải trả JSON đúng bốn trường TONG_QUAN, CANH_BAO, HANH_DONG_DE_XUAT, CAU_HOI_CHO_QUAN_LY. AI không được tính lại hoặc bịa số, không suy đoán nguyên nhân khi thiếu dữ liệu, không nhắc tên hay đánh giá năng lực nhân viên, không đề xuất thưởng phạt, mỗi phần tối đa năm câu, giọng trung tính. Báo cáo mới mang trạng thái CHO_DUYET.
6. Nếu AI lỗi, trả về rỗng hoặc JSON sai định dạng, ghi nguyên văn vào JSON_THO, đặt trạng thái LOI, giữ nguyên bảng chỉ số và không dừng toàn hệ thống. Cho phép người quản lý viết nhận xét tay.
7. Việc duyệt chỉ xảy ra khi một người thật nhập tên và bấm nút Duyệt trên bảng điều khiển. Khi đó mới ghi NGUOI_DUYET, NGAY_DUYET và đổi CHO_DUYET thành DA_DUYET_GUI. Không hàm tự động nào được gọi hàm duyệt.
8. Gửi email chỉ với báo cáo ở trạng thái DA_DUYET_GUI, đã có người và ngày duyệt, chưa có NGAY_GUI. Người nhận đọc từ EMAIL_NGUOI_NHAN; kiểm tra email hợp lệ; giới hạn tối đa 20 người mỗi lần chạy. Tiêu đề và nội dung dùng mẫu trong CAU_HINH, thay các thẻ bằng split().join(). Sau khi gửi thành công, ghi NGAY_GUI và đổi thành DA_GUI để chống gửi trùng.
9. Kiểm tra API bằng một lệnh ping ngắn và phân biệt rõ 401 sai khóa, 429 hết hạn mức, 404 sai model và các lỗi khác.
10. Tạo trình kích hoạt chayTheoLich vào chiều thứ Sáu, không tạo trùng. Hàm theo lịch chạy kiểm tra dữ liệu → tính chỉ số → tạo dự thảo AI rồi dừng ở CHO_DUYET; tuyệt đối không tự duyệt hoặc gửi. Nếu lỗi, ghi nhật ký và có thể báo cho email người phụ trách đầu tiên.

Bảng điều khiển HTML phải mở nhanh từ menu, chỉ đọc bảng tính khi tải, không tự gọi Drive hoặc API. Giao diện hiển thị kỳ báo cáo, KPI nổi bật, cảnh báo, việc tiếp theo, kiểm tra dữ liệu, chỉ số tuần, bốn phần báo cáo AI, trạng thái và người duyệt. Có nút chạy đúng việc tiếp theo bằng switch tường minh, không dùng eval; ô nhập tên và nút duyệt; ô nối tệp dữ liệu khách; ô lưu OPENAI_API_KEY vào Script Properties; nút cập nhật lại. Phải có các hàm: moBangDieuKhien, layDuLieuBangDieuKhien, chayHanhDong, duyetBaoCao, luuFileKhach, luuKhoaAPI.

Cuối cùng, hướng dẫn chi tiết: tạo bảng tính; mở Apps Script; tạo và dán đúng ba tệp; chạy m01_TaoKhungTrangTinh; cấp quyền; tải lại bảng; điền CAU_HINH; lưu khóa; kiểm tra API; chuẩn bị dữ liệu; chạy lần lượt kiểm tra, tính chỉ số, tạo nhận xét, duyệt, gửi; mở bảng điều khiển; đặt lịch tự động; cách kiểm tra kết quả sau từng bước và cách xử lý các lỗi thường gặp.`;

export const steps4: GuideStep[] = [
  {
    id:"m4-buoc-00", n:"01", title:"Tạo bảng tính trung tâm, dán đủ ba tệp mã và cấp quyền",
    details:[
      "Tạo một Google Sheets trống và mở Tiện ích mở rộng → Apps Script từ chính bảng tính đó. Hệ thống được gắn với bảng đang mở; không tạo dự án Apps Script độc lập và không tự tạo sẵn các trang tính vì hàm tạo khung sẽ làm việc này.",
      "Trong tệp Ma.gs, xóa mã mẫu rồi dán toàn bộ mã nghiệp vụ chính. Tạo thêm một tệp Tập lệnh tên bang_dieu_khien và dán mã máy chủ. Tạo tiếp một tệp HTML tên bang_dieu_khien, không gõ thêm đuôi .html, rồi dán mã giao diện. Kiểm tra đúng ba tệp và nhấn Ctrl+S để lưu.",
      "Chọn hàm m01_TaoKhungTrangTinh trên thanh công cụ và bấm Chạy. Lần đầu Google yêu cầu cấp quyền, hãy chọn đúng tài khoản, mở phần Nâng cao nếu có cảnh báo, đi tới dự án và bấm Cho phép. Sau khi chạy xong, quay lại bảng tính và tải lại trang để menu Bao cao tuan xuất hiện."
    ],
    callout:{title:"Kết quả cần thấy",text:"Dự án có đúng ba tệp; bảng tính xuất hiện menu Bao cao tuan và năm trang CAU_HINH, DU_LIEU_NGAY, CHI_SO_TUAN, BAO_CAO_AI, NHAT_KY_HE_THONG."},
    detailImages:[["m4-01.jpg"],["m4-02.jpg"],["m4-03.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-00.mp4"
  },
  {
    id:"m4-buoc-01", n:"02", title:"Kiểm tra khung trang tính và hoàn thiện cấu hình báo cáo",
    details:[
      "Mở từng trang hệ thống để kiểm tra hàng tiêu đề đã được tạo đúng. Không đổi tên các cột vì mã tìm cột theo tiêu đề. Trang BAO_CAO_AI phải có danh sách xổ trạng thái; hai cột NGUOI_DUYET và NGAY_DUYET chỉ được điền khi một người thật duyệt báo cáo.",
      "Trong CAU_HINH, điền TEN_DOANH_NGHIEP, KPI_TUAN và EMAIL_NGUOI_NHAN. Chọn KY_BAO_CAO là TUAN_HIEN_TAI, TUAN_TRUOC hoặc một ngày yyyy-MM-dd thuộc tuần muốn chạy lại. Giữ TEN_TRANG_KHACH là DU_LIEU_NGAY nếu tệp nguồn dùng tên này.",
      "Đọc lại các ngưỡng TY_LE_O_TRONG_TOI_DA, NGUONG_GIAM_TIEN_THUC_THU và NGUONG_GIAM_TY_LE_CHOT. Kiểm tra MODEL, MAX_OUTPUT_TOKENS, PROMPT_HE_THONG, PROMPT_NGUOI_DUNG và hai mẫu email. Chỉ sửa giá trị, không xóa khóa cấu hình."
    ],
    callout:{title:"Lưu ý về kỳ báo cáo",text:"Ngày cố định chỉ dùng để thử hoặc chạy lại tuần cũ. Trước khi bật lịch tự động, đổi KY_BAO_CAO về TUAN_HIEN_TAI; nếu không, lịch sẽ chủ động bỏ qua."},
    detailImages:[["m4-04.jpg"],["m4-05.jpg"],["m4-06.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-01.mp4"
  },
  {
    id:"m4-buoc-02", n:"03", title:"Chuẩn bị dữ liệu bán hàng ngày đúng cấu trúc",
    details:[
      "Mỗi dòng DU_LIEU_NGAY đại diện cho số liệu của một nhân viên trong một ngày. Điền NGAY và NHAN_VIEN, sau đó nhập số khách tiềm năng mới, khách đã liên hệ, cuộc hẹn, đơn thành công, doanh thu ghi nhận, tiền thực thu, đơn hủy và đơn hoàn. Chỉ nhập số không âm; không để trùng cùng ngày và cùng nhân viên.",
      "Có thể lưu dữ liệu ngay trong trang DU_LIEU_NGAY của tệp hệ thống hoặc dùng một Google Sheets nguồn riêng. Nếu dùng tệp khác, người chạy mã phải có quyền mở tệp đó; giữ nguyên hàng tiêu đề và tên trang được khai báo ở TEN_TRANG_KHACH.",
      "Dữ liệu có thể tích lũy nhiều tuần trong cùng một tệp. Mã chỉ lấy các dòng nằm trong kỳ đang chọn và bỏ qua các dòng thuộc tuần khác, nhờ đó có thể tự tính hoặc lấy tuần trước để so sánh."
    ],
    callout:{title:"Không nhập số tổng tuần",text:"Chỉ nhập dữ liệu ngày. Tổng tuần, tỷ lệ liên hệ, tỷ lệ chốt, tỷ lệ hủy, tỷ lệ hoàn và mức đạt KPI đều do mã tính để tránh sai lệch."},
    detailImages:[["m4-07.jpg"],["m4-08.jpg"],["m4-09.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-02.mp4"
  },
  {
    id:"m4-buoc-03", n:"04", title:"Nối tệp dữ liệu khách và lưu khóa OpenAI an toàn",
    details:[
      "Từ menu Bao cao tuan, chọn Mở bảng điều khiển. Ở khối Nguồn dữ liệu, dán đường dẫn đầy đủ hoặc ID của Google Sheets chứa dữ liệu bán hàng rồi bấm Nối tệp. Hệ thống kiểm tra quyền truy cập, lưu ID vào CAU_HINH và từ lần sau đọc trực tiếp tệp nguồn; không cần sao chép dữ liệu thủ công.",
      "Ở khối Cài đặt, dán OPENAI_API_KEY rồi bấm Lưu khóa. Khóa được lưu trong Script Properties, không nằm trong bảng tính và không xuất hiện trong mã. Không gửi hoặc chụp màn hình khóa cho người khác.",
      "Chạy mục 6. Kiểm tra kết nối API. Kết quả 200 nghĩa là kết nối tốt; 401 là khóa sai hoặc bị thu hồi; 429 thường là hết hạn mức; 404 là tên model không hợp lệ hoặc tài khoản chưa có quyền dùng model đó."
    ],
    callout:{title:"Có thể không nối tệp ngoài",text:"Nếu ID_FILE_KHACH để trống, hệ thống tự đọc trang DU_LIEU_NGAY trong chính tệp hiện tại. Đây là cách đơn giản nhất khi mới thử."},
    detailImages:[["m4-10.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-03.mp4"
  },
  {
    id:"m4-buoc-04", n:"05", title:"Kiểm tra dữ liệu và tính chỉ số tuần bằng mã",
    details:[
      "Chạy mục 2. Kiểm tra dữ liệu tuần hoặc bấm nút việc tiếp theo trên bảng điều khiển. Hệ thống kiểm tra ngày không hợp lệ, ngày tương lai, nhân viên trống, số âm, dòng trùng và tỷ lệ ô bắt buộc còn trống. Nếu có lỗi, sửa đúng dòng được báo rồi chạy kiểm tra lại; không chuyển sang bước tính chỉ số khi trạng thái vẫn là CAN_SUA_DU_LIEU.",
      "Khi dữ liệu đạt, chạy mục 3. Tính chỉ số tuần. Mã cộng toàn bộ số liệu thuộc kỳ, tính bốn tỷ lệ, mức đạt KPI và so sánh với tuần trước. Nếu mẫu số bằng 0, tỷ lệ tương ứng được để trống kèm cảnh báo thay vì tạo một con số sai.",
      "Mở CHI_SO_TUAN và kiểm tra đúng MA_TUAN, khoảng từ ngày–đến ngày, các số tổng, KPI, mức đạt KPI, câu so sánh và NGAY_TINH. Chạy lại cùng tuần sẽ cập nhật đúng dòng thay vì tạo bản sao."
    ],
    callout:{title:"Nguyên tắc kiểm soát",text:"AI chưa được dùng ở bước này. Mọi phép cộng, tỷ lệ và so sánh đều do Apps Script tính từ dữ liệu nguồn."},
    detailImages:[["m4-11.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-04.mp4"
  },
  {
    id:"m4-buoc-05", n:"06", title:"Tạo nhận xét AI, đọc lại và duyệt bằng người thật",
    details:[
      "Sau khi CHI_SO_TUAN đã có dòng của kỳ hiện tại, chạy mục 4. Tạo nhận xét bằng AI. Hệ thống gửi các chỉ số đã tính, dữ liệu tuần trước, KPI và ngưỡng cảnh báo; AI chỉ viết bốn phần TỔNG QUAN, CẢNH BÁO, HÀNH ĐỘNG ĐỀ XUẤT và CÂU HỎI CHO QUẢN LÝ.",
      "Mở BAO_CAO_AI hoặc xem khối Báo cáo trên bảng điều khiển. Đọc từng câu, đối chiếu với chỉ số và sửa trực tiếp trong bảng nếu cần. Nếu API lỗi hoặc JSON sai, nguyên văn được giữ ở JSON_THO và trạng thái là LOI; xóa dòng lỗi để tạo lại hoặc tự điền bốn phần bằng tay.",
      "Khi nội dung đã đúng, nhập tên người chịu trách nhiệm vào ô Người duyệt và bấm Duyệt báo cáo. Hệ thống ghi NGUOI_DUYET, NGAY_DUYET và chuyển trạng thái từ CHO_DUYET sang DA_DUYET_GUI. Đây là thao tác có chủ đích của con người; lịch tự động không được phép làm thay."
    ],
    callout:{title:"AI không có quyền kết luận thay quản lý",text:"AI không tính lại số, không bịa nguyên nhân, không đánh giá nhân viên và không đề xuất thưởng phạt. Thiếu dữ liệu phải chuyển thành câu hỏi cho quản lý."},
    detailImages:[[],["m4-11.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-05.mp4"
  },
  {
    id:"m4-buoc-06", n:"07", title:"Gửi báo cáo đã duyệt và kiểm tra chống gửi trùng",
    details:[
      "Chỉ khi báo cáo ở trạng thái DA_DUYET_GUI, đã có người và ngày duyệt, hãy chạy mục 5. Gửi báo cáo đã duyệt hoặc bấm nút Gửi trên bảng điều khiển. Hệ thống lấy người nhận, tiêu đề và mẫu nội dung từ CAU_HINH, kiểm tra địa chỉ email và giới hạn tối đa 20 người trong một lần chạy.",
      "Mở Gmail mục Đã gửi để kiểm tra tiêu đề chứa mã tuần, tên doanh nghiệp, bảng chỉ số và đủ bốn phần nhận xét. Nếu email chưa đúng, không sửa trạng thái bằng tay rồi gửi lại tùy tiện; kiểm tra mẫu EMAIL_TIEU_DE, EMAIL_NOI_DUNG và người nhận trước.",
      "Sau khi gửi thành công, hệ thống ghi NGAY_GUI và chuyển trạng thái sang DA_GUI. Những dòng đã có NGAY_GUI hoặc đã là DA_GUI sẽ không được gửi lại, giúp chống gửi trùng khi người dùng bấm nhiều lần."
    ],
    callout:{title:"Không gửi khi chưa duyệt",text:"CHO_DUYET chỉ là bản nháp. Việc gửi chỉ mở khi một người thật đã duyệt và trạng thái chính xác là DA_DUYET_GUI."},
    detailImages:[["m4-12.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-06.mp4"
  },
  {
    id:"m4-buoc-07", n:"08", title:"Đặt lịch tự động và vận hành báo cáo hằng tuần",
    details:[
      "Đổi KY_BAO_CAO về TUAN_HIEN_TAI, sau đó chạy mục 7. Đặt lịch chạy tự động. Hệ thống tạo một trình kích hoạt chayTheoLich vào chiều thứ Sáu theo múi giờ của dự án và kiểm tra để không tạo lịch trùng.",
      "Mở mục Trình kích hoạt trong Apps Script để xác nhận hàm chayTheoLich, nguồn Theo thời gian, lịch hằng tuần và khung giờ 17–18 giờ. Google chỉ đảm bảo chạy trong khung giờ đã chọn, không đúng một phút cố định.",
      "Mỗi lần chạy theo lịch, hệ thống kiểm tra dữ liệu, tính chỉ số và tạo nhận xét AI rồi dừng ở CHO_DUYET. Người quản lý vẫn phải mở bảng điều khiển, đọc, sửa, nhập tên duyệt và bấm gửi. Theo dõi NHAT_KY_HE_THONG để biết bước nào thành công, bị bỏ qua hoặc gặp lỗi."
    ],
    callout:{title:"Chu trình hằng tuần",text:"Chuẩn hóa dữ liệu → kiểm tra → tính chỉ số → AI viết dự thảo → người quản lý duyệt → gửi email. Tự động hóa không loại bỏ điểm kiểm soát của con người."},
    detailImages:[["m4-13.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model4/buoc-07.mp4"
  }
];

