export type Model6DetailedGuideStep = {
  id: string;
  n: string;
  title: string;
  details: string[];
  callout?: { title: string; text: string };
  detailImages: string[][];
  calloutImages: string[];
  showVideo: false;
  preparation?: { manual: string[]; automatic: string[] };
};

const images = (...numbers: number[]) =>
  numbers.map((number) => `m6-ch8-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “Mô hình 6 - chương 8.docx”.
 * All 54 screenshots remain in the same order as the source document.
 */
export const model6DetailedGuide: Model6DetailedGuideStep[] = [
  {
    id: "m6-01-tao-tep-trung-tam",
    n: "01",
    title: "Tạo Google Sheets trung tâm cho hệ thống giới thiệu",
    preparation: {
      manual: ["Một tài khoản Google có quyền dùng Sheets, Apps Script, Drive, Gmail và Forms."],
      automatic: ["Sau khi cài mã, hệ thống sẽ tạo toàn bộ trang tính và cấu trúc cần thiết trong tệp trung tâm."],
    },
    details: [
      "Tạo một Google Sheets mới và đặt tên HE_THONG_GIOI_THIEU_AI. Để nguyên bảng tính trống; không tự tạo trang tính hoặc gõ tên cột vì tệp mã sẽ sinh đúng cấu trúc ở bước khởi tạo.",
      "Dùng duy nhất tệp này để quản lý sản phẩm, đối tác, khách hàng, hoa hồng và nhật ký. Việc giữ dữ liệu trong một tệp giúp truy lại một khách từ lúc điền nhu cầu đến khi tiền hoa hồng thực nhận được đối soát.",
    ],
    callout: {
      title: "Không dựng cột bằng tay",
      text: "Mã nghiệp vụ tìm dữ liệu theo đúng tên trang và tiêu đề cột. Tự đổi tên hoặc thay thứ tự cột có thể làm các bước sau đọc sai dữ liệu.",
    },
    detailImages: [images(1), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-02-lay-ma-va-dan-ba-tep",
    n: "02",
    title: "Lấy mã và dán đúng ba tệp trong Apps Script",
    preparation: {
      manual: ["Tải đủ Ma.gs, BangDieuKhien.gs và BangDieuKhien.html ở Phần 02 trên trang này."],
      automatic: ["Apps Script gắn dự án mã với bảng tính đang mở và dùng tệp HTML làm bảng điều khiển."],
    },
    details: [
      "Mở nội dung mã đã chuẩn bị từ ChatGPT hoặc Claude và đối chiếu đủ ba tệp trước khi bắt đầu. Không trộn mã của mô hình khác vào dự án này.",
      "Trong HE_THONG_GIOI_THIEU_AI, chọn Tiện ích mở rộng → Apps Script. Ở tệp Mã.gs hoặc Code.gs có sẵn, xóa mã mẫu rồi dán toàn bộ Ma.gs.",
      "Bên trái, cạnh mục Tệp, bấm dấu + → Tập lệnh, đặt tên BangDieuKhien rồi dán BangDieuKhien.gs. Bấm dấu + lần nữa → HTML, đặt tên đúng BangDieuKhien, không thêm đuôi .html, rồi dán mã giao diện. Nhấn Ctrl+S để lưu tất cả.",
    ],
    callout: {
      title: "Tên tệp phải khớp từng ký tự",
      text: "BangDieuKhien.html phải khớp với createHtmlOutputFromFile('BangDieuKhien'). Chỉ Ma.gs được khai báo onOpen để menu không bị ghi đè.",
    },
    detailImages: [images(2), images(3), images(4)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-03-tao-va-luu-khoa-api",
    n: "03",
    title: "Tạo khóa API và lưu an toàn trong Script Properties",
    preparation: {
      manual: ["Tài khoản API đã có quyền sử dụng model và hạn mức phù hợp."],
      automatic: ["Mã đọc API_KEY từ Script Properties; khóa không xuất hiện trong mã hoặc bảng tính."],
    },
    details: [
      "Vào trang quản trị của nhà cung cấp mô hình, mở mục API keys và tạo khóa mới. Sao chép ngay khi khóa xuất hiện vì giá trị đầy đủ chỉ được hiển thị một lần.",
      "Quay lại Apps Script → Cài đặt dự án → Thuộc tính của tập lệnh. Thêm thuộc tính tên API_KEY rồi dán khóa vào ô Giá trị. Nếu cần thay model mặc định, thêm thuộc tính MODEL theo đúng tên model tài khoản được phép dùng.",
      "Không ghi khóa trong Ma.gs, BangDieuKhien.gs, BangDieuKhien.html hoặc một ô Google Sheets. Sau khi lưu, chỉ vị trí thuộc tính cần xuất hiện trong ảnh hướng dẫn; chuỗi khóa thật phải được che trước khi chia sẻ.",
    ],
    callout: {
      title: "Ảnh minh họa đã được che khóa",
      text: "Hai ảnh trên trang chỉ cho thấy vị trí thao tác. Chuỗi API key thật đã được che kín; nếu khóa trong tài liệu từng được sử dụng, nên thu hồi và tạo khóa mới.",
    },
    detailImages: [images(5), images(6), images(7)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-04-cap-quyen-lan-dau",
    n: "04",
    title: "Cấp quyền lần đầu và nạp menu hệ thống",
    preparation: {
      manual: ["Ba tệp mã đã được dán đúng vị trí và lưu thành công."],
      automatic: ["Google cấp quyền cho Apps Script dùng Sheets, Drive, Forms, Gmail và trình kích hoạt."],
    },
    details: [
      "Trên thanh công cụ Apps Script, chọn hàm onOpen rồi bấm Chạy. Khi Google cảnh báo ứng dụng chưa được xác minh, chọn đúng tài khoản → Nâng cao → Đi tới dự án → Cho phép.",
      "Chờ hàm chạy xong rồi quay lại bảng tính và nhấn F5. Menu HỆ THỐNG GIỚI THIỆU phải xuất hiện trên thanh công cụ trước khi chuyển sang khởi tạo dữ liệu.",
    ],
    callout: {
      title: "Đây là quyền của chính tài khoản bạn",
      text: "Bỏ qua bước cấp quyền sẽ làm Drive, Gmail, Google Form và các lịch tự động báo lỗi. Chỉ cấp quyền khi bạn đang dùng đúng dự án mã đã kiểm tra.",
    },
    detailImages: [images(8), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-05-khoi-tao-khung-he-thong",
    n: "05",
    title: "Khởi tạo năm trang dữ liệu và kiểm tra cấu trúc",
    preparation: {
      manual: ["Menu HỆ THỐNG GIỚI THIỆU đã xuất hiện sau khi tải lại bảng tính."],
      automatic: ["Hệ thống tạo trang tính, tiêu đề, danh sách xổ, định dạng cảnh báo, thư mục và tệp mẫu."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → 1. Khởi tạo hệ thống. Chờ hộp thoại báo Khởi tạo xong; không đóng bảng tính trong lúc mã đang tạo cấu trúc.",
      "Kiểm tra đủ năm trang SAN_PHAM, DOI_TAC, KHACH_HANG, HOA_HONG và NHAT_KY_HE_THONG. Hàng tiêu đề phải được cố định, có bộ lọc và các cột trạng thái có danh sách chọn.",
      "Mở lại menu để xác nhận đủ các mục nghiệp vụ, bảng điều khiển, cây thư mục, liên kết hệ thống và kiểm tra API. Hàm khởi tạo phải có thể chạy lại an toàn mà không xóa dữ liệu người dùng.",
    ],
    callout: {
      title: "Không tiếp tục nếu thiếu trang hoặc thiếu menu",
      text: "Một tên trang hoặc cột sai sẽ làm dữ liệu sản phẩm, khách và hoa hồng bị đứt chuỗi. Sửa phần cài đặt trước khi nạp hồ sơ thật.",
    },
    detailImages: [images(9), images(10), images(11)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-06-kiem-tra-ket-noi-api",
    n: "06",
    title: "Kiểm tra kết nối API trước khi nạp dữ liệu",
    preparation: {
      manual: ["API_KEY đã được lưu trong Script Properties và hệ thống đã khởi tạo."],
      automatic: ["Mã gửi một yêu cầu ngắn, nhận diện nhà cung cấp theo định dạng khóa và trả về model đang dùng."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → Kiểm tra kết nối API.",
      "Kết quả đúng phải báo Kết nối thành công và nêu nhà cung cấp cùng model. Nếu lỗi 401, kiểm tra API_KEY; nếu sai model hoặc hết hạn mức, sửa MODEL hoặc tài khoản API rồi chạy lại.",
    ],
    callout: {
      title: "Chỉ nạp dữ liệu sau khi kiểm tra thành công",
      text: "Việc tách riêng bước chẩn đoán giúp tránh đưa hàng loạt hồ sơ vào một quy trình đang dùng khóa sai hoặc model không khả dụng.",
    },
    detailImages: [images(12), images(13)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-07-tao-thu-muc-va-nap-ho-so-san-pham",
    n: "07",
    title: "Tạo cây thư mục Drive và tải hồ sơ sản phẩm",
    preparation: {
      manual: [
        "Mỗi sản phẩm có một tệp nguồn riêng: Word, PDF, TXT, ảnh hoặc bảng tính.",
        "Đổi tên theo mẫu SP_<MÃ>_<Tên>; mã không trùng, không có khoảng trắng.",
      ],
      automatic: ["Hệ thống tạo NAP_DU_LIEU, NAP_HOA_HONG, tệp CSV mẫu và lưu các ID cần thiết."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → Tạo cây thư mục Drive. Sau đó mở Xem liên kết hệ thống để lấy đúng thư mục do mã vừa tạo.",
      "Mở NAP_DU_LIEU từ bảng liên kết. Không tải hồ sơ vào thư mục gốc hoặc NAP_HOA_HONG.",
      "Kéo thả từng tệp SP_ vào NAP_DU_LIEU. Trong tệp nên có nguồn chính thức, ngày kiểm tra, giá, tính năng và giới hạn; giữ mỗi sản phẩm tách riêng để AI không trộn dữ liệu.",
    ],
    callout: {
      title: "Tên tệp là khóa định danh",
      text: "Ví dụ SP_CRM01_TenPhanMem. Cùng mã CRM01 sẽ được dùng để nối hồ sơ sản phẩm với chương trình đối tác ở các bước sau.",
    },
    detailImages: [images(14), images(15), images(16)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-08-nap-va-duyet-du-lieu-san-pham",
    n: "08",
    title: "Nạp dữ liệu sản phẩm bằng AI và duyệt từng dòng",
    preparation: {
      manual: ["Các tệp SP_ đã nằm trong NAP_DU_LIEU và có thể mở để đối chiếu."],
      automatic: ["AI chuẩn hóa mỗi hồ sơ thành một dòng SAN_PHAM, lưu liên kết nguồn và đánh dấu CHO_DUYET."],
    },
    details: [
      "Quay lại bảng tính, chọn HỆ THỐNG GIỚI THIỆU → 2. Nạp dữ liệu nghiên cứu (AI). Chờ hộp thoại báo số sản phẩm đã nạp.",
      "Mở SAN_PHAM và xác nhận mỗi tệp đã trở thành đúng một dòng. Kiểm tra mã, tên, nhóm vấn đề, khách phù hợp, khách chưa phù hợp, mức giá, tính năng, giới hạn, nguồn và ngày kiểm tra.",
      "Dòng mới phải có TRẠNG THÁI DỮ LIỆU = CHO_DUYET, nền vàng. Ô CẦN KIỂM TRA là thông tin nguồn chưa đủ, không phải kết luận để sử dụng ngay.",
      "Mở lại nguồn chính thức để điền tay phần thiếu, xóa câu quảng cáo và đối chiếu từng con số lấy từ ảnh hoặc PDF. Chỉ khi đã kiểm tra xong mới đổi trạng thái sang DA_KIEM_TRA, nền xanh.",
    ],
    callout: {
      title: "Dữ liệu quá 90 ngày không được tư vấn",
      text: "Chỉ sản phẩm DA_KIEM_TRA và còn trong hạn mới được dùng để phân loại khách. Không đổi trạng thái chỉ để vượt qua bước kiểm soát.",
    },
    detailImages: [images(17), images(18, 19), images(20), images(21)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-09-chuan-bi-va-nap-ho-so-doi-tac",
    n: "09",
    title: "Chuẩn bị và nạp hồ sơ chương trình đối tác",
    preparation: {
      manual: ["Với mỗi sản phẩm đã kiểm tra, lưu điều khoản đối tác từ website chính thức thành một tệp riêng."],
      automatic: ["AI trích điều khoản vào DOI_TAC; hồ sơ SP_ đã xử lý trước đó không bị nạp lại."],
    },
    details: [
      "Đổi tên hồ sơ theo mẫu DT_<MÃ>_<Tên> và dùng cùng mã với sản phẩm liên quan. Ví dụ SP_CRM01_... phải đi cùng DT_CRM01_....",
      "Kiểm tra tệp có năm nhóm thông tin: cách ghi nhận khách, mức hoa hồng, điều kiện hủy hoặc đảo, kỳ thanh toán và giới hạn quảng bá. Phần thiếu phải để thiếu, không tự bịa hoặc lấy từ nguồn không chính thức.",
      "Tải các tệp DT_ vào NAP_DU_LIEU rồi chạy lại 2. Nạp dữ liệu nghiên cứu (AI). Chờ thông báo số hồ sơ đối tác được nạp và kiểm tra mỗi tệp tạo đúng một dòng DOI_TAC.",
    ],
    callout: {
      title: "Điều khoản có thể thay đổi",
      text: "Luôn lưu NGUON_DIEU_KHOAN và NGAY_KIEM_TRA. Mức hoa hồng cũ không được dùng làm giả định cố định cho doanh thu.",
    },
    detailImages: [images(22), images(23), images(24)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-10-kiem-tra-va-duyet-doi-tac",
    n: "10",
    title: "Điền liên kết và duyệt chương trình đối tác",
    preparation: {
      manual: ["Đã đăng ký chương trình và có liên kết giới thiệu riêng do nhà cung cấp cấp."],
      automatic: ["Hệ thống chỉ đưa liên kết từ đối tác DA_DUYET vào thư nháp gửi khách."],
    },
    details: [
      "Mở DOI_TAC và điền tay MÃ SP LIÊN QUAN cùng LINK GIỚI THIỆU. Mã sản phẩm phải khớp SAN_PHAM; bỏ trống liên kết sẽ làm thư tư vấn hiện cảnh báo.",
      "Duyệt từng dòng bằng ba câu: khách được ghi nhận bằng cách nào; khi nào hoa hồng được duyệt; trường hợp nào bị hủy hoặc đảo. Đủ căn cứ thì chọn DA_DUYET; còn phải hỏi lại thì CAN_XAC_NHAN; không phù hợp thị trường thì KHONG_THAM_GIA.",
      "Giữ khoảng ba đến năm chương trình ban đầu và ít nhất một đối tác dự phòng cho nhóm nhu cầu chính. Không mở rộng chỉ vì tỷ lệ hoa hồng cao.",
    ],
    callout: {
      title: "Hoa hồng không được điều khiển lời khuyên",
      text: "Bước phân loại khách chỉ đọc SAN_PHAM đã kiểm tra, không nhận dữ liệu DOI_TAC hoặc mức hoa hồng để xếp hạng sản phẩm.",
    },
    detailImages: [images(25), images(26), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-11-tao-bieu-mau-nhu-cau",
    n: "11",
    title: "Tạo biểu mẫu nhu cầu và lấy liên kết gửi khách",
    preparation: {
      manual: ["Danh mục đã có ít nhất một sản phẩm DA_KIEM_TRA còn trong hạn."],
      automatic: ["Hệ thống tạo biểu mẫu bảy câu, thu email, nối phản hồi và gắn trình kích hoạt không trùng."],
    },
    details: [
      "Chạy HỆ THỐNG GIỚI THIỆU → 3. Tạo biểu mẫu nhu cầu một lần. Biểu mẫu phải hỏi quy mô nhân sự, số người dùng, vấn đề, công cụ hiện tại, ngân sách, tiêu chí bắt buộc và thời gian triển khai.",
      "Mở Xem liên kết hệ thống để lấy đường dẫn biểu mẫu dành cho khách. Gắn đúng liên kết này vào bài viết, chữ ký thư hoặc tin nhắn tư vấn.",
      "Mở biểu mẫu bằng liên kết vừa lấy và kiểm tra đủ bảy câu, chế độ thu email cùng nội dung giới thiệu. Không tự tạo lại nếu hệ thống đã báo biểu mẫu tồn tại.",
    ],
    callout: {
      title: "Chỉ hỏi dữ liệu cần cho việc lựa chọn",
      text: "Không thu dữ liệu nhạy cảm hoặc trường không liên quan. NGUỒN KHÁCH được hệ thống tự ghi là Biểu mẫu nhu cầu, không cần thêm thành câu hỏi.",
    },
    detailImages: [images(27), images(28), images(29)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-12-thu-phan-hoi-va-phan-loai-khach",
    n: "12",
    title: "Thử phản hồi và phân loại khách mới bằng AI",
    preparation: {
      manual: ["Dùng dữ liệu thử không nhạy cảm và bảo đảm sản phẩm DA_KIEM_TRA còn trong hạn 90 ngày."],
      automatic: ["Mỗi phản hồi tạo mã khách riêng; AI trả về mức xử lý, lý do, đề xuất và thông tin còn thiếu."],
    },
    details: [
      "Tự điền và gửi một phản hồi thử. Mở KHACH_HANG, xác nhận có dòng mới với MÃ KHÁCH riêng, ngày nhận, email, nguồn Biểu mẫu nhu cầu và trạng thái MOI.",
      "Chạy HỆ THỐNG GIỚI THIỆU → 4. Phân loại khách mới (AI). Chờ hộp thoại báo số khách đã được xử lý.",
      "Kiểm tra MỤC XỬ LÝ: MUC_1 chuyển CHO_DUYET và có tối đa ba đề xuất; MUC_2 chuyển CAN_HOI_THEM; MUC_3 chuyển CHUYEN_NGUOI.",
      "Đọc KẾT QUẢ AI, ĐỀ XUẤT, THÔNG TIN CÒN THIẾU và lý do cho từng khách. Nếu AI trả mã sản phẩm không tồn tại, hệ thống phải giữ dòng ở MOI và ghi lỗi để kiểm tra.",
    ],
    callout: {
      title: "AI không tự quyết định thay người kinh doanh",
      text: "Khách MUC_3 có chuyển dữ liệu, tích hợp phức tạp, dữ liệu nhạy cảm hoặc hợp đồng lớn phải luôn CHUYEN_NGUOI và không có thư tư vấn tự động.",
    },
    detailImages: [images(30), images(31), images(32), images(33)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-13-duyet-ba-muc-xu-ly",
    n: "13",
    title: "Đọc lý do và duyệt ba mức xử lý",
    preparation: {
      manual: ["Mỗi khách đã có kết quả phân loại và lý do có thể đọc được."],
      automatic: ["Hệ thống giữ đúng trạng thái để bước tạo thư biết khách nào được tư vấn, cần hỏi thêm hoặc chuyển người."],
    },
    details: [
      "Đọc cột lý do trước. Nếu thiếu thông tin của khách, giữ MUC_2; nếu thiếu dữ liệu sản phẩm, quay lại SAN_PHAM, cập nhật nguồn rồi đổi khách về MOI và phân loại lại.",
      "Với MUC_1, đọc lý do cùng điểm chưa phù hợp của từng đề xuất; đồng ý mới đổi CHO_DUYET sang DA_DUYET. Với MUC_2, giữ CAN_HOI_THEM. Với MUC_3, giữ CHUYEN_NGUOI và trao đổi trực tiếp.",
    ],
    callout: {
      title: "Không biến lỗi dữ liệu thành câu hỏi cho khách",
      text: "Thiếu thông tin sản phẩm là việc của người vận hành. Chỉ gửi thư hỏi khách khi chính nhu cầu của khách còn thiếu tiêu chí cần thiết.",
    },
    detailImages: [images(34), images(35)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-14-tao-va-duyet-thu-nhap",
    n: "14",
    title: "Tạo thư nháp, duyệt lần cuối và đánh dấu đã gửi",
    preparation: {
      manual: ["Khách MUC_1 đã DA_DUYET; DOI_TAC có liên kết giới thiệu đã kiểm tra."],
      automatic: ["Hệ thống chỉ tạo Gmail Draft; không tự gửi hoặc tự cam kết với khách."],
    },
    details: [
      "Chạy HỆ THỐNG GIỚI THIỆU → 5. Tạo thư nháp gửi khách.",
      "Đọc thông báo kết quả: khách DA_DUYET có thư tư vấn; khách CAN_HOI_THEM có thư hỏi bổ sung; khách CHUYEN_NGUOI không được tạo thư tư vấn tự động.",
      "Mở Gmail Thư nháp và kiểm tra thư hỏi bổ sung: đúng người nhận, mã khách, phần thông tin còn thiếu và không có câu suy đoán thay khách.",
      "Kiểm tra thư tư vấn: tên sản phẩm, lý do, điểm cần cân nhắc, giá và liên kết giới thiệu phải khớp dữ liệu đã duyệt. Nếu có cảnh báo chưa có liên kết, bổ sung ở DOI_TAC rồi tạo lại, không gửi bản đang lỗi.",
      "Người kinh doanh tự bấm Gửi trong Gmail. Sau đó chọn đúng dòng khách trong KHACH_HANG → 6. Đánh dấu đã gửi; xác nhận hệ thống ghi DA_GUI và ngày gửi.",
    ],
    callout: {
      title: "Thư nháp là điểm kiểm soát bắt buộc",
      text: "AI không được gửi thư, cam kết kết quả hoặc tự chọn sản phẩm thay người kinh doanh. Mọi nội dung đi ra ngoài đều phải qua một lần đọc cuối.",
    },
    detailImages: [images(36), images(37), images(38), images(39), images(40)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-15-lay-mau-va-chuan-hoa-bao-cao",
    n: "15",
    title: "Lấy tệp mẫu và chuẩn hóa báo cáo hoa hồng",
    preparation: {
      manual: ["Có báo cáo giao dịch do đối tác cung cấp và biết mã khách tương ứng trong hệ thống."],
      automatic: ["Tệp mẫu quy định đúng cấu trúc để bước nhập nhận diện giao dịch và số tiền."],
    },
    details: [
      "Chọn Xem liên kết hệ thống và mở NAP_HOA_HONG.",
      "Tải MAU_HOA_HONG.csv, giữ nguyên tên cột và xóa dòng minh họa trước khi dùng dữ liệu thật.",
      "Trong Drive, kiểm tra tệp báo cáo sẽ nạp nằm đúng NAP_HOA_HONG, không đặt chung với hồ sơ SP_ hoặc DT_.",
      "Chuẩn hóa mỗi dòng gồm MA_KHACH, MA_DOI_TAC, MA_GIAO_DICH, ngày ghi nhận, trạng thái, hoa hồng dự kiến, hoa hồng đã duyệt, tiền đã nhận, ngày dự kiến nhận, nguồn báo cáo và ghi chú.",
    ],
    callout: {
      title: "Ba con số có ý nghĩa khác nhau",
      text: "HOA_HONG_DU_KIEN là ước tính, HOA_HONG_DA_DUYET là số đối tác chấp nhận, còn TIEN_DA_NHAN mới là dòng tiền thực tế đã về.",
    },
    detailImages: [images(41), images(42), images(43), images(44)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-16-nap-bao-cao-hoa-hong",
    n: "16",
    title: "Nạp báo cáo hoa hồng và chống nhập trùng",
    preparation: {
      manual: ["Tệp CSV đã đúng tên cột, đúng định dạng số và nằm trong NAP_HOA_HONG."],
      automatic: ["Mã thêm hoặc cập nhật theo MA_DOI_TAC + MA_GIAO_DICH rồi đổi tên tệp để chống nạp lại."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → 7. Nhập báo cáo hoa hồng. Chờ hộp thoại báo số giao dịch được thêm mới hoặc cập nhật.",
      "Mở HOA_HONG và đối chiếu đúng số dòng, mã khách, mã đối tác, mã giao dịch cùng ba mức tiền. Quay lại Drive để xác nhận tệp đã có tiền tố DA_NHAP_.",
    ],
    callout: {
      title: "Không đếm một giao dịch hai lần",
      text: "Cặp MA_DOI_TAC + MA_GIAO_DICH là khóa chống trùng. Khi đối tác cập nhật trạng thái, hệ thống phải sửa đúng dòng cũ thay vì cộng thêm một dòng mới.",
    },
    detailImages: [images(45), images(46)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-17-doi-soat-va-xu-ly-chenh-lech",
    n: "17",
    title: "Đối soát hoa hồng và xử lý từng dòng lệch",
    preparation: {
      manual: ["Báo cáo đã được nạp; có nguồn hoặc chứng từ để truy lại từng giao dịch."],
      automatic: ["Hệ thống tính chênh lệch dự kiến–duyệt và số tiền còn phải thu, rồi tô cảnh báo."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → 8. Đối soát hoa hồng.",
      "Đọc báo cáo trên màn hình. Hệ thống tính CHENH_LECH_DOI_SOAT = HOA_HONG_DU_KIEN - HOA_HONG_DA_DUYET và TIEN_CON_PHAI_THU = HOA_HONG_DA_DUYET - TIEN_DA_NHAN.",
      "Mở HOA_HONG và xử lý từng ô được đánh dấu. Ghi lý do, mã chứng từ hoặc nội dung trao đổi với đối tác vào GHI_CHU; không xóa số lệch khi chưa có căn cứ.",
    ],
    callout: {
      title: "Không dùng hoa hồng dự kiến làm doanh thu",
      text: "Không tăng quảng cáo khi còn giao dịch quá kỳ thanh toán nhưng chưa được giải thích. Chỉ TIEN_DA_NHAN mới được coi là tiền đã thu.",
    },
    detailImages: [images(47), images(48), images(49)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-18-kiem-tra-rui-ro-hang-tuan",
    n: "18",
    title: "Chạy kiểm tra rủi ro hằng tuần",
    preparation: {
      manual: ["Dữ liệu sản phẩm, khách đã gửi và hoa hồng đã được cập nhật đến kỳ kiểm tra."],
      automatic: ["Hệ thống mở báo cáo, gửi bản sao vào email tài khoản chạy mã và ghi nhật ký."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → 9. Kiểm tra rủi ro.",
      "Đọc báo cáo bốn nhóm: sản phẩm thiếu ngày hoặc quá 90 ngày; đối tác chiếm từ 70% hoa hồng duyệt trong 90 ngày; khách DA_GUI chưa có giao dịch; khoản đã duyệt nhưng quá ngày dự kiến nhận.",
      "Với sản phẩm CAN_CAP_NHAT, mở lại NGUON_CHINH_THUC, kiểm tra giá, gói, tính năng và giới hạn rồi sửa dữ liệu cùng nội dung liên quan. Không chỉ thay NGAY_KIEM_TRA để xóa cảnh báo.",
      "Truy từng khách hoặc giao dịch chưa được ghi nhận theo MA_KHACH và MA_GIAO_DICH. Khi gửi dữ liệu sang AI hoặc đối tác, loại trường không cần thiết và không gửi dữ liệu nhạy cảm.",
    ],
    callout: {
      title: "Cảnh báo phải dẫn đến hành động có bằng chứng",
      text: "Nếu sản phẩm hoặc điều khoản đã đổi, phải sửa dữ liệu, nội dung và bản tư vấn liên quan trước khi hệ thống tiếp tục sử dụng.",
    },
    detailImages: [images(50), images(51), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-19-mo-bang-dieu-khien",
    n: "19",
    title: "Mở bảng điều khiển và đọc tình trạng hệ thống",
    preparation: {
      manual: ["Các trang tính đã có dữ liệu mẫu hoặc dữ liệu thật đã được kiểm tra."],
      automatic: ["Bảng điều khiển chỉ đọc dữ liệu mới nhất; không gọi Drive hoặc AI khi mở."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → Mở bảng điều khiển.",
      "Đối chiếu số khách theo trạng thái, hoa hồng dự kiến, hoa hồng đã duyệt, tiền đã nhận, khoản còn phải thu, tỷ trọng đối tác và danh sách sản phẩm cần kiểm tra.",
      "Dùng các nút trên bảng điều khiển để gọi đúng nghiệp vụ tương ứng với menu. Mỗi lần mở phải đọc dữ liệu hiện tại, không cần đặt lịch riêng cho bảng điều khiển.",
    ],
    callout: {
      title: "Bảng điều khiển không thay thế dữ liệu gốc",
      text: "Khi thấy cảnh báo hoặc số lệch, mở đúng dòng trong SAN_PHAM, DOI_TAC, KHACH_HANG hoặc HOA_HONG để truy nguồn và xử lý.",
    },
    detailImages: [images(52), images(53), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m6-20-dat-lich-tu-dong",
    n: "20",
    title: "Đặt lịch kiểm tra và đối soát tự động",
    preparation: {
      manual: ["Đã chạy thử thủ công mục kiểm tra rủi ro và đối soát hoa hồng thành công."],
      automatic: ["Mã xóa lịch cũ do hệ thống quản lý rồi tạo lại lịch kiểm tra và đối soát, tránh trigger trùng."],
    },
    details: [
      "Chọn HỆ THỐNG GIỚI THIỆU → 10. Đặt lịch tự động.",
      "Đọc hộp thoại xác nhận: kiểm tra rủi ro chạy lúc 8 giờ sáng thứ Hai; đối soát hoa hồng chạy lúc 16 giờ thứ Sáu. Mỗi sáng thứ Hai, báo cáo rủi ro cũng được gửi về hộp thư của tài khoản chạy mã.",
      "Mở mục Trình kích hoạt trong Apps Script và xác nhận mỗi tác vụ chỉ có một lịch. Chạy lại mục 10 không được tạo thêm bản trùng.",
    ],
    callout: {
      title: "Hoàn tất chuỗi kiểm soát",
      text: "Lịch chỉ nhắc và tổng hợp. Người kinh doanh vẫn duyệt nội dung, xử lý ngoại lệ, trao đổi với đối tác và quyết định mọi hành động ảnh hưởng đến khách hoặc tiền.",
    },
    detailImages: [images(54), [], []],
    calloutImages: [],
    showVideo: false,
  },
];
