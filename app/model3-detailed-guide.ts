export type Model3DetailedGuideStep = {
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
  numbers.map((number) => `m3-ch5-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “Mô hình 3 - chương 5.docx”.
 * All 77 screenshots remain in the same order as the source document.
 */
export const model3DetailedGuide: Model3DetailedGuideStep[] = [
  {
    id: "m3-01-tao-bang-tinh-trung-tam",
    n: "01",
    title: "Tạo bảng tính trung tâm cho toàn bộ sản phẩm tri thức",
    preparation: {
      manual: [
        "Một tài khoản Google có thể dùng Google Sheets, Drive, Forms, Gmail và Apps Script.",
        "Xác định tên sản phẩm để dùng thống nhất cho bảng tính, thư mục và các biểu mẫu.",
      ],
      automatic: [
        "Mã sẽ tạo các trang dữ liệu, cấu hình, danh sách xổ, biểu mẫu và bảng điều khiển trong đúng tệp trung tâm.",
      ],
    },
    details: [
      "Tạo một Google Sheets trống và đặt tên VAN HANH SAN PHAM TRI THUC. Không tự tạo trang tính hoặc cột; hàm tạo khung sẽ dựng cấu trúc chuẩn ở bước sau.",
      "Dùng đúng một bảng tính này từ nghiên cứu nhu cầu, lập bản đồ tri thức, sản xuất tài liệu và video đến quản lý đơn hàng, thư hỗ trợ, phản hồi và lịch sử phát hành.",
      "Google Sheets giữ trạng thái và liên kết; tài liệu thật nằm trong Drive; Apps Script nối các bước; AI tạo bản đầu và phân loại; người bán vẫn quyết định nội dung, nguồn, quyền truy cập và phiên bản phát hành.",
    ],
    callout: {
      title: "Một nguồn dữ liệu trung tâm",
      text: "Không tạo thêm một bảng tính vận hành ở giữa quy trình. Tách dữ liệu sang nhiều tệp sẽ làm mất liên kết giữa nhu cầu, tài liệu, đơn hàng và phản hồi.",
    },
    detailImages: [images(1), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-02-lay-va-soat-ba-tep-ma",
    n: "02",
    title: "Lấy đủ ba tệp mã từ ChatGPT hoặc Claude và soát điều kiện",
    preparation: {
      manual: [
        "Mở phần Câu lệnh của Mô hình 3 ở đầu trang và sao chép toàn bộ yêu cầu.",
        "Chọn OpenAI API hoặc Anthropic API để dùng nhất quán trong mã và tên thuộc tính khóa.",
      ],
      automatic: ["AI tạo đồng thời tệp nghiệp vụ, tệp máy chủ bảng điều khiển và tệp HTML giao diện."],
    },
    details: [
      "Mở một cuộc trò chuyện mới trên ChatGPT hoặc Claude, dán câu lệnh tổng và yêu cầu trả về đủ ba tệp trong cùng một lần. Không xin bảng điều khiển ở một cuộc trò chuyện khác vì tên hàm, tên cột và trạng thái có thể lệch nhau.",
      "Nếu dùng API của Anthropic, đổi tên thuộc tính khóa theo yêu cầu trước khi tạo mã. Nếu dùng OpenAI, giữ OPENAI_API_KEY và lưu khóa bằng Script Properties, không viết trực tiếp trong mã.",
      "Dùng chức năng tìm kiếm trong kết quả để kiểm tra: có getActiveSpreadsheet và không có SpreadsheetApp.create; có PropertiesService.getScriptProperties; mọi lệnh gọi API đặt muteHttpExceptions: true; giới hạn token từ 4000 trở lên; các câu lệnh dài được đọc từ CAU_HINH.",
      "Nếu thiếu một điều kiện, yêu cầu AI sửa đúng điểm đó ngay trong cuộc trò chuyện hiện tại. Không cần gửi lại toàn bộ câu lệnh và không dán mã vào Apps Script trước khi các điều kiện kiến trúc đã đạt.",
    ],
    callout: {
      title: "Ba tệp phải được sinh cùng nhau",
      text: "Bảng điều khiển HTML chỉ hoạt động khi các hàm máy chủ và tên cột khớp chính xác với tệp nghiệp vụ. Một lần tạo mã thống nhất giúp tránh lỗi khó phát hiện về sau.",
    },
    detailImages: [images(2), [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-03-mo-apps-script-va-dan-tep-chinh",
    n: "03",
    title: "Mở Apps Script từ đúng bảng tính và dán tệp nghiệp vụ",
    preparation: {
      manual: ["Bảng tính trung tâm đang mở và tệp Ma.gs đã được AI tạo đầy đủ."],
      automatic: ["Apps Script gắn dự án mã với bảng tính đang mở để menu và các hàm đọc đúng dữ liệu."],
    },
    details: [
      "Trong chính bảng tính VAN HANH SAN PHAM TRI THUC, chọn Tiện ích mở rộng → Apps Script. Không tạo dự án Apps Script độc lập ở nơi khác.",
      "Mở tệp Mã.gs có sẵn, xóa mã mẫu rồi dán toàn bộ nội dung tệp nghiệp vụ chính. Kiểm tra đầu và cuối khối mã để chắc chắn không bị thiếu khi sao chép.",
      "Giữ duy nhất một hàm onOpen trong tệp nghiệp vụ. Hàm này tạo menu San pham tri thuc; không tạo thêm onOpen trong tệp bảng điều khiển vì hàm sau có thể ghi đè menu trước.",
    ],
    callout: {
      title: "Phải mở từ bảng tính trung tâm",
      text: "Apps Script luôn gắn với một tệp cụ thể. Mở sai dự án có thể khiến mã lưu được nhưng menu không xuất hiện và dữ liệu không được ghi vào bảng tính đang dùng.",
    },
    detailImages: [images(3), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-04-tao-tep-dashboard",
    n: "04",
    title: "Tạo đúng tệp HTML và tệp máy chủ cho bảng điều khiển",
    preparation: {
      manual: ["Đã có toàn bộ mã HTML và mã máy chủ .gs từ cùng kết quả AI."],
      automatic: ["HtmlService mở giao diện; tệp máy chủ đọc dữ liệu và chạy hành động theo đúng trạng thái từng đơn."],
    },
    details: [
      "Ở cột Tệp, bấm dấu cộng → HTML, đặt tên đúng bang_dieu_khien và không gõ thêm đuôi .html. Dán toàn bộ mã giao diện rồi lưu.",
      "Bấm dấu cộng lần nữa → Tập lệnh, đặt tên WebApp và dán toàn bộ mã máy chủ bảng điều khiển. Không dùng cùng tên cho tệp HTML và tệp Tập lệnh.",
      "Đối chiếu dòng createHtmlOutputFromFile trong mã máy chủ với tên tệp HTML. Hai giá trị phải khớp chính xác từng ký tự; nếu lệch, bảng điều khiển sẽ báo không tìm thấy tệp.",
      "Nhấn Ctrl+S và xác nhận cả ba tệp Mã.gs, WebApp.gs và bang_dieu_khien.html đều xuất hiện trong danh sách Tệp trước khi tiếp tục.",
    ],
    callout: {
      title: "Tên tệp là một phần của mã",
      text: "Không tự đổi tên tệp sau khi dán nếu chưa sửa đồng thời createHtmlOutputFromFile và các hàm HTML đang gọi.",
    },
    detailImages: [images(4, 5, 6), images(7, 8, 9), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-05-tao-va-luu-khoa-api",
    n: "05",
    title: "Tạo khóa API và lưu an toàn trong Script Properties",
    preparation: {
      manual: ["Tài khoản API có phương thức thanh toán hoặc số dư phù hợp."],
      automatic: ["Mã đọc khóa lúc chạy mà không đưa khóa vào trang tính, mã nguồn hoặc giao diện công khai."],
    },
    details: [
      "Vào OpenAI Platform, kiểm tra Billing rồi mở Settings → API keys → Create new secret key. Gói ChatGPT Plus và tài khoản API là hai sản phẩm tách biệt; có Plus không đồng nghĩa API đã có hạn mức.",
      "Đặt tên khóa theo dự án, tạo khóa và sao chép ngay khi được hiển thị. Khóa chỉ hiện đầy đủ một lần; không chụp màn hình hoặc gửi khóa cho người khác.",
      "Trong Apps Script, mở Cài đặt dự án → Thuộc tính của tập lệnh, thêm thuộc tính OPENAI_API_KEY và dán khóa vào ô giá trị. Không lưu khóa trong CAU_HINH hay bất kỳ tệp .gs/.html nào.",
    ],
    callout: {
      title: "Không đưa khóa vào nội dung công khai",
      text: "Script Properties giữ khóa ở phía dự án. Nếu khóa từng xuất hiện trong ảnh, mã hoặc tệp chia sẻ, hãy thu hồi khóa đó và tạo khóa mới.",
    },
    detailImages: [images(10), images(11), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-06-cap-quyen-tao-khung-va-kiem-tra-api",
    n: "06",
    title: "Cấp quyền, tạo khung trang tính và kiểm tra kết nối API",
    preparation: {
      manual: ["Ba tệp đã lưu và OPENAI_API_KEY đã có trong Script Properties."],
      automatic: ["Hệ thống dựng các trang, cấu hình, danh sách xổ và ghi kết quả kiểm tra API vào nhật ký."],
    },
    details: [
      "Trên thanh công cụ Apps Script, chọn hàm tạo khung trang tính rồi bấm Chạy. Khi Google cảnh báo ứng dụng chưa được xác minh, chọn đúng tài khoản, bấm Nâng cao → Đi tới dự án → Cho phép.",
      "Không chọn onOpen để chạy tay. Sau khi hàm tạo khung báo hoàn tất, trở lại bảng tính và nhấn F5 để nạp menu San pham tri thuc.",
      "Kiểm tra các trang hệ thống và cấu hình đã được tạo. Chạy lại hàm tạo khung phải chỉ bổ sung phần còn thiếu, không xóa dữ liệu hoặc ghi đè cấu hình đã sửa.",
      "Chạy Kiểm tra kết nối API sau khi đã tạo khung. Chỉ chuyển bước khi hộp thoại báo kết nối bình thường và nêu đúng model cùng tham số token đang dùng.",
      "Nếu lỗi 401, kiểm tra khóa; nếu lỗi 429 có insufficient quota, kiểm tra số dư; nếu lỗi 404, kiểm tra tên model trong CAU_HINH; nếu lỗi 400, đọc nội dung trả về để kiểm tra cấu trúc yêu cầu.",
    ],
    callout: {
      title: "Thứ tự bắt buộc",
      text: "Lưu đủ ba tệp → lưu khóa API → chạy Tạo khung trang tính và cấp quyền → tải lại bảng tính → chạy Kiểm tra kết nối API.",
    },
    detailImages: [images(12, 13, 14), images(15, 16), [], images(17, 18), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-07-mo-dashboard-va-tao-ba-bieu-mau",
    n: "07",
    title: "Mở bảng điều khiển và tạo ba biểu mẫu thu dữ liệu",
    preparation: {
      manual: ["Khung trang tính đã được tạo và menu San pham tri thuc đã xuất hiện."],
      automatic: ["Bảng điều khiển hiển thị các chặng; ba Google Form nối dữ liệu thô về đúng bảng tính trung tâm."],
    },
    details: [
      "Chạy Mở bảng điều khiển ngay cả khi chưa có dữ liệu. Các khối rỗng đóng vai trò bản đồ, cho biết bước nào sẽ tạo dữ liệu cho nghiên cứu, tài liệu, đơn hàng, hỗ trợ và phản hồi.",
      "Không mở bảng điều khiển trước khi tạo khung vì các hàm máy chủ cần đọc những trang đã được dựng. Nếu gặp lỗi thiếu trang tính, đóng hộp thoại, chạy lại Tạo khung rồi mở lại.",
      "Chạy mục 1 Tạo biểu mẫu. Hệ thống tạo ba biểu mẫu cho phỏng vấn nhu cầu, phản hồi sau hoàn thành và người dùng thử; đồng thời lưu liên kết công khai và liên kết chỉnh sửa vào CAU_HINH.",
      "Mở từng biểu mẫu, gửi một phản hồi thử và kiểm tra ba trang RAW tương ứng đã nhận dữ liệu. Trình kích hoạt phải chép dữ liệu về NGHIEN_CUU, PHAN_HOI hoặc NGUOI_DUNG_THU mà vẫn giữ nguyên lời người trả lời.",
    ],
    callout: {
      title: "Dashboard không thay các chốt duyệt",
      text: "Các nút hỗ trợ chạy nghiệp vụ, nhưng DUYET_NGUOI, trạng thái tài liệu và quyết định phát hành vẫn phải do người bán tự xác nhận.",
    },
    detailImages: [images(19, 20), [], images(21, 22, 23), images(24)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-08-ban-thu-truoc-khi-san-xuat",
    n: "08",
    title: "Bán thử trước khi sản xuất toàn bộ",
    preparation: {
      manual: ["Một vấn đề lặp lại, nhóm khách cụ thể, kết quả dự kiến và một mức giá thử nghiệm."],
      automatic: ["AI có thể viết bản đầu trang giới thiệu; dữ liệu thanh toán thật mới quyết định có tiếp tục sản xuất."],
    },
    details: [
      "Tạo phiên bản giới thiệu tối thiểu gồm trang mô tả, một biểu mẫu mẫu, một video ngắn và lịch nhận sản phẩm. Dùng ChatGPT hoặc Claude viết bản đầu, sau đó tự sửa lời hứa, thêm tình huống thật và nêu rõ phần không bao gồm.",
      "Đặt một mục tiêu thử nghiệm có thời hạn. Trong tình huống minh họa của chương, mục tiêu là 10 người thanh toán trong 14 ngày; đây là ngưỡng tự đặt, không phải tiêu chuẩn chung cho mọi sản phẩm.",
      "Ngày 1–3 hoàn thiện trang mô tả, biểu mẫu mẫu và video giới thiệu; ngày 4–10 giới thiệu cho khách cũ và nhóm phù hợp; ngày 11–14 tổng hợp câu hỏi, lý do chưa mua và số đơn đã thanh toán.",
      "Nếu chưa đạt mục tiêu, chỉ sửa một biến chính như nhóm khách, kết quả, nội dung gói hoặc giá rồi thử lại. Không đổi tất cả cùng lúc vì sẽ không biết yếu tố nào tạo ra thay đổi.",
      "Dùng số đơn thanh toán làm bằng chứng chính. Lượt thích, bình luận hoặc lời nói quan tâm không thay thế được hành vi mua; nếu quan tâm nhiều nhưng ít thanh toán, kiểm tra lại vấn đề, nhóm khách, cách mô tả kết quả và giá.",
    ],
    callout: {
      title: "Kiểm tra nhu cầu trước khi mở rộng sản xuất",
      text: "AI rút ngắn thời gian tạo nội dung, nhưng không chứng minh khách sẽ mua. Bán thử giúp giới hạn rủi ro trước khi làm đủ tài liệu, biểu mẫu và video.",
    },
    detailImages: [[], [], [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-09-phan-nhom-va-duyet-nhu-cau",
    n: "09",
    title: "Phân nhóm nhu cầu từ dữ liệu thật và tự duyệt kết quả",
    preparation: {
      manual: ["NGHIEN_CUU đã có câu nguyên văn, cách khách đang xử lý, hậu quả và dữ liệu từng trả tiền."],
      automatic: ["AI gộp các dòng tương tự vào NHOM_AI nhưng không được điền DUYET_NGUOI."],
    },
    details: [
      "Trong menu hoặc bảng điều khiển, chạy mục 2 Phân nhóm nhu cầu từ dữ liệu thô. AI đọc các dòng chưa có NHOM_AI, giữ nguyên NGUYEN_VAN_KH và chỉ ghi kết quả phân tích vào cột riêng.",
      "Sau khi hộp thoại báo hoàn tất, mở NGHIEN_CUU và đọc từng dòng. Kiểm tra AI có gộp sai hai vấn đề chỉ vì cách diễn đạt giống nhau hoặc tạo một nhóm nằm ngoài chuyên môn thực tế của người bán hay không.",
      "Tự điền DUYET_NGUOI cho nhóm được chấp nhận. Nhóm không có giá trị ở cột này sẽ không được hàm lập bản đồ tri thức sử dụng và không trở thành module bán ra.",
      "Đối chiếu DA_TUNG_TRA_TIEN. Nhóm có nhiều lời than phiền nhưng không có hành vi trả tiền có thể là vấn đề người dùng quan tâm, chưa chắc là vấn đề họ sẽ mua giải pháp.",
      "Nếu AI gộp hai nhu cầu khác bản chất, tách chúng bằng cách điền hai tên nhóm khác nhau ở DUYET_NGUOI. Nếu một nhóm không thuộc kinh nghiệm đã có, bỏ qua thay vì dùng kiến thức chung để lấp chỗ trống.",
    ],
    callout: {
      title: "AI đề xuất, con người chọn vấn đề để bán",
      text: "Quyết định cần đồng thời dựa trên kinh nghiệm thật và bằng chứng mua. Không để NHOM_AI tự trở thành cấu trúc sản phẩm.",
    },
    detailImages: [images(25, 26), images(27), images(28), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-10-tao-kho-tri-thuc-drive",
    n: "10",
    title: "Dựng kho tri thức sáu lớp trên Google Drive",
    preparation: {
      manual: ["Tài liệu nội bộ, dữ liệu khách hàng đã ẩn thông tin nhận diện và nguồn bên ngoài có xuất xứ."],
      automatic: ["Hệ thống có thể tạo hoặc mở lại cây thư mục và lưu ID thư mục vào CAU_HINH."],
    },
    details: [
      "Chạy Tạo cây thư mục Drive hoặc tạo thư mục gốc mang tên sản phẩm. Bên trong phải có đúng sáu thư mục: 00_KINH_NGHIEM_NOI_BO, 01_DU_LIEU_KHACH_HANG, 02_NGUON_CHINH_THUC, 03_AI_DE_XUAT, 04_BAN_CHO_DUYET và 05_BAN_XUAT_BAN.",
      "Đưa tài liệu, biểu mẫu và tình huống do bạn tạo trong quá trình làm nghề vào 00_KINH_NGHIEM_NOI_BO. Đưa câu hỏi và phản hồi đã loại tên, số điện thoại cùng dữ liệu nhận diện không cần thiết vào 01_DU_LIEU_KHACH_HANG.",
      "Đưa tài liệu bên ngoài vào 02_NGUON_CHINH_THUC và đặt tên tệp kèm tác giả, năm hoặc đơn vị ban hành. Không đưa nguồn không rõ xuất xứ vào kho dùng để xuất bản.",
      "Giữ phần AI gợi ý nhưng chưa được xác nhận trong 03_AI_DE_XUAT; bản đang được chuyên gia kiểm tra trong 04_BAN_CHO_DUYET; chỉ bản đã duyệt, có người duyệt và ngày duyệt mới nằm trong 05_BAN_XUAT_BAN.",
      "Mở từng thư mục, kiểm tra quyền truy cập và tên tệp. Chạy lại chức năng tạo cây phải dùng lại thư mục cùng tên, không tạo thêm nhiều cây trùng nhau.",
    ],
    callout: {
      title: "Không trộn ba lớp tri thức",
      text: "Kinh nghiệm nội bộ, nguồn chính thức và phần AI đề xuất phải còn tách biệt để luôn truy ra căn cứ của nội dung được bán.",
    },
    detailImages: [images(29, 30), images(31, 32, 33), [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-11-lap-ban-do-tri-thuc",
    n: "11",
    title: "Lập bản đồ tri thức từ các nhóm đã được duyệt",
    preparation: {
      manual: ["Các dòng NGHIEN_CUU cần dùng đã có DUYET_NGUOI do người bán điền."],
      automatic: ["AI tạo module, chủ đề, câu hỏi cốt lõi và tri thức cần có nhưng không tự bịa nguồn dẫn."],
    },
    details: [
      "Chạy mục 3 Lập bản đồ tri thức. Hàm chỉ đọc các dòng có DUYET_NGUOI; nếu chưa duyệt xong bước trước, dừng lại và hoàn thiện cột này trước.",
      "Chờ thông báo hoàn tất rồi mở BAN_DO_TRI_THUC. Mỗi dòng cần có nhóm nhu cầu, mã module, chủ đề, câu hỏi cốt lõi và TRI_THUC_CAN_CO.",
      "Kiểm tra các module không lặp nhau, không vượt khỏi chuyên môn và có thể nối tới một đầu ra người mua cần hoàn thành. Nội dung chưa đủ căn cứ phải giữ trạng thái CAN_BO_SUNG.",
      "Không điền NGUON_DAN bằng suy đoán hoặc bằng tên một tài liệu chưa kiểm tra. Bản đồ ở giai đoạn này cho biết cần chứng minh điều gì, chưa khẳng định mọi tri thức đều đã được duyệt.",
    ],
    callout: {
      title: "Dòng chưa duyệt không được đi tiếp",
      text: "Bản đồ tri thức là cầu nối từ nhu cầu sang sản phẩm. Chỉ dùng dữ liệu mà người bán đã xác nhận thuộc đúng vấn đề và đúng chuyên môn.",
    },
    detailImages: [images(34), images(35, 36), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-12-doi-chieu-nguon-bang-notebooklm",
    n: "12",
    title: "Đối chiếu nguồn bằng NotebookLM và duyệt từng dòng tri thức",
    preparation: {
      manual: ["BAN_DO_TRI_THUC đã có TRI_THUC_CAN_CO và kho Drive đã chứa các tệp cần tra cứu."],
      automatic: ["NotebookLM trả lời theo nguồn đã nạp và chỉ ra tài liệu liên quan để người bán đối chiếu."],
    },
    details: [
      "Tạo notebook mới trong NotebookLM. Nạp các tệp ở 02_NGUON_CHINH_THUC và những tệp trong 00_KINH_NGHIEM_NOI_BO cần dùng để tra cứu.",
      "Với mỗi dòng BAN_DO_TRI_THUC, đọc TRI_THUC_CAN_CO rồi hỏi NotebookLM nội dung đó nằm trong tài liệu nào. Mở phần trích dẫn để xác nhận câu trả lời thực sự bám vào nguồn.",
      "Ghi đúng tên tệp vào NGUON_DAN. Ví dụ, nếu tri thức cần có là một nguyên tắc vận hành, chỉ ghi nguồn sau khi NotebookLM dẫn về đúng tài liệu và bạn đã kiểm tra đoạn liên quan.",
      "Lọc các dòng CAN_BO_SUNG. Tìm thêm nguồn chính thức hoặc loại nội dung khỏi sản phẩm; không tự lấp bằng kiến thức phổ biến trên mạng hoặc phần AI đề xuất.",
      "Tự điền bốn trường: NGUON_DAN, TRANG_THAI_NGUON, NGUOI_DUYET_NGUON và NGAY_DUYET_NGUON. Khi nguồn gốc trên Drive thay đổi, đồng bộ lại notebook và duyệt lại phần bị ảnh hưởng.",
    ],
    callout: {
      title: "NotebookLM hỗ trợ tra cứu, không duyệt thay",
      text: "Tên nguồn, trạng thái duyệt, người duyệt và ngày duyệt là dấu vết trách nhiệm của người bán; AI không được tự hoàn thiện các cột này.",
    },
    detailImages: [images(37), images(38, 39), [], [], images(40)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-13-de-xuat-cau-truc-san-pham",
    n: "13",
    title: "Đề xuất cấu trúc sản phẩm từ kết quả người mua cần đạt",
    preparation: {
      manual: ["Mọi dòng tri thức cần dùng đã có nguồn được duyệt và kết quả cuối được viết thành một câu cụ thể."],
      automatic: ["AI chuyển bản đồ tri thức thành các module có mục tiêu, đầu ra, tài liệu cần và thứ tự."],
    },
    details: [
      "Viết kết quả theo dạng người mua hoàn thành việc gì, trong bao lâu và tạo ra đầu ra nào. Trường hợp minh họa là thiết lập quy trình chăm sóc khách hàng trong bảy ngày cho đội ngũ từ 3 đến 10 người.",
      "Chạy mục 4 Đề xuất cấu trúc sản phẩm. Hệ thống chỉ đọc các dòng BAN_DO_TRI_THUC có nguồn đã duyệt và ghi từng module vào CAU_TRUC_SP.",
      "Kiểm tra mỗi module có DAU_RA_KHACH_NHAN viết được thành một câu quan sát được. Module chỉ nêu chủ đề để đọc nhưng không nói người mua sẽ tạo ra gì phải được viết lại.",
      "Sắp thứ tự theo công việc người mua phải thực hiện; ngày sau phải dùng kết quả ngày trước. Chọn tài liệu, biểu mẫu, video hoặc trợ lý AI theo nhu cầu sử dụng, không thêm định dạng chỉ để gói trông lớn hơn.",
      "Trước khi sản xuất, xác nhận không còn dòng nguồn trống và loại mọi bài học không phục vụ trực tiếp kết quả cuối. Giá trị nằm ở phần người mua không còn phải tự mò mẫm, không nằm ở số trang hoặc số video.",
    ],
    callout: {
      title: "Cửa kiểm tra trước khi viết bản đầu",
      text: "Không sản xuất khi nguồn còn thiếu hoặc module chưa có đầu ra cụ thể. Nếu bỏ qua, AI có thể tạo nhiều nội dung nhưng người mua vẫn không biết phải hoàn thành việc gì.",
    },
    detailImages: [[], images(41, 42), [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-14-tao-va-duyet-tai-lieu",
    n: "14",
    title: "Tạo bản đầu, duyệt chuyên môn và chốt tài liệu xuất bản",
    preparation: {
      manual: ["Chọn đúng module trong CAU_TRUC_SP và bảo đảm nguồn của module đã được duyệt."],
      automatic: ["AI tạo Google Docs trong thư mục bản đề xuất và ghi trạng thái BAN_AI cùng liên kết vào bảng."],
    },
    details: [
      "Chọn dòng module cần làm trong CAU_TRUC_SP rồi chạy mục 5 Tạo bản đầu tài liệu. Nhập đúng MA_MODULE khi hộp thoại hỏi; hệ thống tạo các tài liệu chưa có theo giới hạn mỗi lần chạy.",
      "Mở TRANG_THAI_TAI_LIEU và kiểm tra các dòng mới có tên, loại, module, nguồn và trạng thái BAN_AI. Bản này chưa được dùng để bán, làm video hoặc nạp cho trợ lý.",
      "Chuyển tuần tự qua BAN_AI → CHO_DUYET_CHUYEN_MON → CHO_BIEN_TAP → DA_DUYET_XUAT_BAN. Mỗi lần đổi trạng thái tương ứng một vòng đọc thật; không bỏ thẳng qua các bước.",
      "Ở vòng chuyên môn, kiểm tra phương pháp, công thức, ví dụ, ngoại lệ và phạm vi áp dụng. Ở vòng biên tập, kiểm tra cấu trúc, tên gọi, hướng dẫn thao tác và khả năng người mua tự làm.",
      "Mở liên kết tài liệu để đọc toàn bộ bản thật. Nếu JSON_THO có dữ liệu nhưng các cột kết quả trống, đọc nguyên văn lỗi, sửa câu lệnh trong CAU_HINH và chạy lại mà không xóa dấu vết lần lỗi.",
      "Khi tài liệu đạt yêu cầu, lưu đúng bản vào 05_BAN_XUAT_BAN, điền người duyệt, ngày duyệt, phiên bản dạng v1.0 và LINK. Chỉ các dòng đủ các trường này mới được dùng ở các bước sau.",
    ],
    callout: {
      title: "Bản AI không phải bản xuất bản",
      text: "Tài liệu chỉ trở thành nguồn chính thức sau khi có chốt chuyên môn, biên tập, phiên bản, người duyệt, ngày duyệt và liên kết tới đúng bản đã khóa.",
    },
    detailImages: [images(43, 44, 45), images(46), images(47, 48), [], images(49, 50), images(51)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-15-lap-ke-hoach-canh-va-dung-video",
    n: "15",
    title: "Lập kế hoạch cảnh, quay thao tác và dựng video",
    preparation: {
      manual: ["Một tài liệu DA_DUYET_XUAT_BAN có người duyệt, ngày duyệt và liên kết hợp lệ."],
      automatic: ["AI chia nội dung thành cảnh và viết câu lệnh; người bán quay, dựng, kiểm tra và duyệt bản cuối."],
    },
    details: [
      "Chọn tài liệu đã duyệt tương ứng với video cần làm rồi chạy mục 6 Tạo kế hoạch cảnh. Nhập đúng MA_TAI_LIEU_NGUON; kết quả được ghi vào KE_HOACH_CANH, mỗi cảnh một dòng cùng CAU_LENH_TAO_CANH.",
      "Lọc MAN_HINH_THAT, mở biểu mẫu thật với dữ liệu mẫu, phóng hiển thị khoảng 125% và quay đúng thứ tự. Lọc NGUOI_HUONG_DAN để quay phần giải thích; nói theo ý đã duyệt thay vì đọc máy móc nguyên văn.",
      "Lọc CANH_VEO và CANH_SEEDANCE, dán câu lệnh sang đúng công cụ rồi đặt tên tệp tải về theo MA_CANH. Chỉ dùng cảnh AI để minh họa, không dùng làm bằng chứng về khách hàng, kết quả hoặc cơ sở vật chất.",
      "Ghép các cảnh trong CapCut theo thứ tự bảng, bật Auto Captions rồi sửa tay tên riêng, thuật ngữ, số liệu, điểm cắt, âm lượng và khung hình. Đọc GHI_CHU_CAPCUT trước khi xuất.",
      "Đưa bản hoàn chỉnh cùng tài liệu đã duyệt vào Gemini để liệt kê mốc có câu khác nguồn, sai tên hoặc sai số liệu. Sau đó người bán vẫn phải xem lại toàn bộ và quyết định cảnh nào cần sửa.",
      "Trước khi phát hành, xác nhận không cảnh AI nào nằm trong đoạn hướng dẫn người học phải thao tác và không cảnh tổng hợp nào được trình bày như bằng chứng thật.",
    ],
    callout: {
      title: "Màn hình thật cho thao tác thật",
      text: "Veo và Seedance phù hợp với tình huống minh họa. Mọi bước người mua cần làm theo phải dùng màn hình, biểu mẫu và dữ liệu mẫu thật.",
    },
    detailImages: [images(52, 53, 54), [], [], [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-16-tao-va-kiem-thu-tro-ly-ai",
    n: "16",
    title: "Tạo trợ lý AI theo nguồn và kiểm thử bằng câu hỏi thật",
    preparation: {
      manual: ["Các tệp cần dùng đều ở trạng thái DA_DUYET_XUAT_BAN và có liên kết đúng phiên bản."],
      automatic: ["Custom GPT hoặc Claude Project trả lời theo nguồn; bảng KIEM_THU_AI lưu kết quả để đánh giá."],
    },
    details: [
      "Lọc TRANG_THAI_TAI_LIEU và chỉ chọn các dòng DA_DUYET_XUAT_BAN. Mở LINK, tải đúng các tệp đó lên trợ lý; không nạp BAN_AI hoặc bản đang chờ duyệt.",
      "Tạo Custom GPT hoặc Claude Project, đặt tên rõ theo sản phẩm và dán hướng dẫn hệ thống đã được xây từ câu lệnh trong chương. Nếu dùng Claude, tải các tệp đã duyệt vào phần Sources của dự án.",
      "Quy định trợ lý chỉ dùng nguồn đã duyệt, trả lời ngắn, nêu tên tài liệu và mục liên quan, hướng dẫn bước tiếp theo và chuyển câu hỏi ngoài phạm vi cho người phụ trách.",
      "Lấy mười câu thật từ NGUYEN_VAN_KH để thử, trong đó cố ý có ít nhất hai câu ngoài phạm vi. Kiểm tra câu trả lời có dẫn đúng tài liệu, không tự tạo chính sách, thời hạn, cam kết hoặc tư vấn pháp lý.",
      "Ghi từng lần thử vào KIEM_THU_AI với câu hỏi, câu trả lời, tài liệu được dẫn và đánh giá DUNG hoặc SAI. Giữ bảng này để chạy lại sau mỗi lần cập nhật sản phẩm.",
      "Nếu trợ lý trả lời bằng kiến thức chung cho câu ngoài phạm vi, siết lại hướng dẫn và kiểm thử lại. Chỉ giao cho khách khi trợ lý biết nói nội dung chưa có trong bộ công cụ và chuyển đúng người phụ trách.",
    ],
    callout: {
      title: "Trợ lý phải biết giới hạn",
      text: "Giá trị của trợ lý nằm ở việc giúp người mua tìm và dùng đúng tài liệu, không phải trả lời mọi câu hỏi bằng kiến thức rộng ngoài sản phẩm.",
    },
    detailImages: [images(55), images(56, 57, 58), [], images(59, 60, 61), images(62), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-17-kiem-tra-voi-nguoi-dung-thu",
    n: "17",
    title: "Kiểm tra sản phẩm bằng người dùng thử",
    preparation: {
      manual: ["Chọn từ ba đến năm người đúng nhóm khách và chuẩn bị phiên bản sản phẩm họ có thể tự sử dụng."],
      automatic: ["Biểu mẫu người dùng thử ghi dữ liệu về RAW_NGUOI_DUNG_THU rồi chép vào NGUOI_DUNG_THU."],
    },
    details: [
      "Mời ba đến năm người phù hợp tự thực hiện mà không được hướng dẫn riêng ngay từ đầu. Chỉ can thiệp khi họ không thể tiếp tục hoặc có nguy cơ áp dụng sai.",
      "Thu các trường: bước bắt đầu, thời gian hoàn thành, câu hỏi phát sinh, tài liệu đã mở, vị trí dừng lại, cách họ hiểu yêu cầu, đầu ra tạo được và phần cần giải thích thêm.",
      "Đối chiếu các phản hồi để tìm điểm nghẽn lặp lại. Một câu hỏi xuất hiện ở nhiều người thường cho thấy tên cột, ví dụ, video hoặc thứ tự hướng dẫn chưa đủ rõ.",
      "Sửa sản phẩm trước khi bán rộng: đổi tên, bổ sung ví dụ, thêm video, viết lại chỉ dẫn hoặc điều chỉnh trình tự. Không mặc định người dùng thiếu khả năng khi tài liệu chưa giúp họ tự hoàn thành.",
    ],
    callout: {
      title: "Kiểm thử trợ lý và người dùng là hai vòng khác nhau",
      text: "Trợ lý đúng nguồn chưa có nghĩa sản phẩm dễ dùng. Người thật phải tự hoàn thành được đầu ra trước khi mở bán rộng.",
    },
    detailImages: [images(63), [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-18-ghi-don-cap-quyen-va-theo-doi",
    n: "18",
    title: "Ghi đơn, cấp quyền, gửi hướng dẫn và theo dõi sử dụng",
    preparation: {
      manual: ["Đơn đã được xác nhận thanh toán, email hợp lệ và bản phát hành trong 05_BAN_XUAT_BAN đã sẵn sàng."],
      automatic: ["Hệ thống tạo mã đơn, cấp quyền, gửi thư đúng mốc và chống gửi trùng bằng trạng thái cùng ngày gửi."],
    },
    details: [
      "Không cần cài lại hệ thống. Mở DON_HANG hoặc bảng điều khiển và chạy các mục từ 7 đến 13 trên cùng quy trình đã dựng. Kiểm tra mã đơn, email, sản phẩm, giá, ngày thanh toán và trạng thái trước mỗi hành động.",
      "Nếu giao dịch đến từ cổng thanh toán, Apps Script có thể nhận thông báo; nếu chưa nối được, xác nhận thủ công trạng thái DA_THANH_TOAN. Không cấp quyền cho đơn MOI, sai email, thanh toán thiếu hoặc đang hoàn tiền.",
      "Bấm Cấp quyền tài liệu cho đúng đơn. Hệ thống chia sẻ thư mục 05_BAN_XUAT_BAN dưới quyền xem, ghi LINK_TAI_LIEU và NGAY_CAP_QUYEN rồi chuyển trạng thái; kiểm tra email thông báo chia sẻ và tránh cấp trùng.",
      "Chạy Gửi email chào mừng sau khi quyền đã cấp. Thư phải có đường dẫn bắt đầu, lộ trình bảy ngày, phạm vi hỗ trợ và địa chỉ nhận câu hỏi; kiểm tra đúng người nhận và đúng phiên bản.",
      "Dùng trình kích hoạt cho nhắc ngày 3 và ngày 7. Chỉ gửi khi đến hạn, cột ngày nhắc còn trống và khách chưa hoàn thành mốc; không gửi cho người đã hoàn thành hoặc đã xin dừng.",
      "Giữ thẻ {{LINK_FORM_PHAN_HOI}} trong mẫu thư ngày 7 để hệ thống thay bằng liên kết thật. Khi có thư hỗ trợ, AI chỉ tóm tắt và phân loại; người bán trực tiếp xử lý trường hợp ngoài phạm vi, khiếu nại hoặc có rủi ro.",
      "Theo dõi toàn bộ chuỗi trên bảng điều khiển. Bốn chốt duyệt phải được mở đúng lúc; bảng chỉ chạy hành động đã được người bán xác nhận, không tự giao nội dung hoặc tự quyết định thay con người.",
    ],
    callout: {
      title: "Không tự giao khi chưa xác nhận tiền",
      text: "Trước khi cấp quyền, kiểm tra DA_THANH_TOAN, email, sản phẩm và phiên bản. Sau khi cấp, kiểm tra ngày cấp cùng dấu chống gửi trùng.",
    },
    detailImages: [images(64, 65, 66), [], images(67, 68, 69), images(70, 71), [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m3-19-doc-phan-hoi-va-quan-ly-phien-ban",
    n: "19",
    title: "Đọc phản hồi, quyết định phần cần sửa và quản lý phiên bản",
    preparation: {
      manual: ["PHAN_HOI đã có dữ liệu khách gửi và danh sách mã tài liệu thật đang sử dụng."],
      automatic: ["AI phân loại phản hồi và gắn tài liệu liên quan; quyết định sửa cùng phiên bản dự kiến vẫn do người bán điền."],
    },
    details: [
      "Liên kết phản hồi trong email ngày 7 đưa câu trả lời vào RAW_PHAN_HOI. Trình kích hoạt chép sang PHAN_HOI và đối chiếu email với DON_HANG; nếu không tìm thấy đơn, hệ thống vẫn giữ nguyên phản hồi và ghi cảnh báo.",
      "Sau khi nhận phản hồi, chạy mục 14 Đọc phản hồi và chỉ ra phần cần sửa. Chờ thông báo hoàn tất rồi kiểm tra số dòng đã được phân loại.",
      "Mở PHAN_HOI và đọc NGUYEN_VAN, NHOM_AI, TAI_LIEU_LIEN_QUAN cùng CAN_CON_NGUOI_XU_LY. AI chỉ được chọn trong bốn nhóm quy định và phải chỉ đúng tài liệu hoặc bước liên quan khi nội dung khó tìm hoặc khó hiểu.",
      "Tự điền QUYET_DINH và PHIEN_BAN_DU_KIEN. Không thay đổi toàn bộ sản phẩm chỉ vì một yêu cầu riêng lẻ; ưu tiên lỗi lặp lại, điểm chặn người dùng hoặc nội dung đã được xác nhận là sai.",
      "Mỗi lần sửa, ghi PHAT_HANH gồm số phiên bản, ngày phát hành, nội dung thay đổi, nguồn sử dụng và danh sách tài liệu/video đã cập nhật. Dùng v1.1 cho sửa nhỏ và v2.0 cho thay đổi lớn như thêm module hoặc mở rộng ngành.",
      "Cập nhật đồng bộ tài liệu, video và trợ lý AI, sau đó chạy lại bộ câu hỏi kiểm thử. Chỉ phát hành khi cả ba nơi dùng cùng một quy trình và cùng phiên bản.",
    ],
    callout: {
      title: "AI phân loại, con người quyết định",
      text: "Lịch sử phát hành phải truy ra được nội dung đã đổi, căn cứ dùng để đổi và mọi tài sản đã được cập nhật theo cùng phiên bản.",
    },
    detailImages: [images(72), images(73, 74), images(75, 76), [], images(77), []],
    calloutImages: [],
    showVideo: false,
  },
];
