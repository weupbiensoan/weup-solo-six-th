export type Model1DetailedGuideStep = {
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
  numbers.map((number) => `m1-ch3-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “Mô hình 1 - chương 3.docx”.
 * The 65 screenshots remain in the same order as the source document.
 */
export const model1DetailedGuide: Model1DetailedGuideStep[] = [
  {
    id: "m1-01-trung-tam-dieu-phoi",
    n: "01",
    title: "Nắm toàn bộ quy trình và tạo Google Sheets trung tâm",
    preparation: {
      manual: [
        "Một tài khoản Google có thể sử dụng Google Sheets, Google Forms, Apps Script và Gmail.",
        "Chọn OpenAI API hoặc Anthropic API làm công cụ AI chính; người mới chỉ cần chọn một loại.",
      ],
      automatic: [
        "Google Forms thu dữ liệu; Google Sheets giữ trạng thái; Apps Script nối các bước; API xử lý nội dung; Gmail gửi và nhận phản hồi.",
        "Người tư vấn vẫn duyệt ở hai điểm trước khi nội dung được gửi ra ngoài.",
      ],
    },
    details: [
      "Đọc sơ đồ toàn bộ giao dịch: khách điền biểu mẫu, hệ thống tạo bản dự thảo, người tư vấn duyệt lần một, AI sửa theo góp ý, người tư vấn duyệt bản cuối, Gmail gửi kế hoạch và hệ thống tổng hợp phản hồi.",
      "Tạo một Google Sheets trống và đổi tên thành HE THONG TU VAN DINH DUONG 28 NGAY. Đây là tệp trung tâm; không tạo thêm tệp Sheets rời cho từng công đoạn.",
      "Hệ thống sẽ tổ chức dữ liệu trong năm trang tính: KHACH_HANG lưu dữ liệu gốc; AI_DU_THAO lưu bản đầu và góp ý; KE_HOACH_CUOI lưu bản đã sửa; PHAN_HOI_EMAIL gom phản hồi; CAU_HINH lưu phạm vi xử lý và phiên bản câu lệnh.",
    ],
    callout: {
      title: "Nguyên tắc dữ liệu",
      text: "Mỗi khách phải có mã riêng. Email và thông tin nhận diện chỉ nằm ở phần cần thiết; tác vụ nào không cần dữ liệu sức khỏe chi tiết thì không gửi dữ liệu đó sang AI.",
    },
    detailImages: [images(1), images(2), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-02-tao-ma-bang-ai",
    n: "02",
    title: "Yêu cầu ChatGPT hoặc Claude tạo mã biểu mẫu và trang tính",
    preparation: {
      manual: [
        "Xác định rõ mục tiêu, lịch sinh hoạt, thói quen ăn uống, điều kiện công việc, hạn chế thực phẩm và dữ liệu sàng lọc cần thu.",
        "Mở phần Câu lệnh ở đầu trang và sao chép toàn bộ câu lệnh chuẩn.",
      ],
      automatic: [
        "AI tạo Google Apps Script để dựng Google Form, nối dữ liệu về bảng tính và triển khai chuỗi xử lý.",
      ],
    },
    details: [
      "Mở ChatGPT hoặc Claude, dán câu lệnh chuẩn rồi yêu cầu trả về đầy đủ mã Google Apps Script. Nếu dùng OpenAI, tên thuộc tính khóa phải là OPENAI_API_KEY; nếu dùng Claude, dùng ANTHROPIC_API_KEY.",
      "Đọc lại tên các trường trong biểu mẫu và phạm vi dữ liệu trước khi dùng mã. Không để AI tự bổ sung câu hỏi sức khỏe vượt khỏi phạm vi chuyên môn đã xác định.",
    ],
    callout: {
      title: "Kết quả cần có",
      text: "Một khối mã Apps Script hoàn chỉnh, không lẫn phần diễn giải bên ngoài, dùng bảng tính đang mở làm trung tâm điều phối.",
    },
    detailImages: [images(3), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-03-dan-ma-apps-script",
    n: "03",
    title: "Mở Apps Script, dán mã và lưu dự án",
    preparation: {
      manual: ["Giữ Google Sheets trung tâm đang mở và đã sao chép trọn vẹn mã do AI tạo."],
      automatic: ["Apps Script gắn trực tiếp với tệp Google Sheets hiện tại và lưu mã vào Google Drive."],
    },
    details: [
      "Trong Google Sheets trung tâm, chọn Tiện ích mở rộng → Apps Script.",
      "Trong tệp Code.gs, xóa hàm mẫu có sẵn rồi dán toàn bộ mã đã lấy từ ChatGPT hoặc Claude.",
      "Nhấn Lưu dự án. Không chạy mã khi trình soạn thảo còn báo chưa lưu hoặc có lỗi cú pháp.",
    ],
    callout: {
      title: "Không tạo bảng tính mới trong mã",
      text: "Mã phải đọc bảng tính đang mở, ví dụ bằng SpreadsheetApp.getActiveSpreadsheet(). Nếu thấy lệnh tạo một bảng tính mới, cần sửa trước khi tiếp tục.",
    },
    detailImages: [images(4), images(5), images(6)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-04-kich-hoat-thanh-toan-api",
    n: "04",
    title: "Kích hoạt thanh toán cho OpenAI API hoặc Anthropic API",
    preparation: {
      manual: [
        "Đăng nhập platform.openai.com nếu dùng OpenAI hoặc console.anthropic.com nếu dùng Claude.",
        "Chuẩn bị phương thức thanh toán quốc tế phù hợp.",
      ],
      automatic: ["Nền tảng API trừ chi phí theo mức sử dụng, tách biệt với gói ChatGPT hoặc Claude dành cho người dùng."],
    },
    details: [
      "Ví dụ với OpenAI: mở Billing, vào Payment methods để thêm phương thức thanh toán, sau đó chọn Buy credits/Pay credits để nạp số dư.",
      "Tài liệu minh họa dùng mức 5 USD để bắt đầu. Mức tối thiểu, đơn giá và tên nút có thể thay đổi; hãy đọc thông tin đang hiển thị trên chính nền tảng trước khi thanh toán.",
    ],
    callout: {
      title: "API là khoản phí riêng",
      text: "Có gói ChatGPT trả phí không đồng nghĩa tài khoản API đã có số dư. Cần kích hoạt thanh toán trên nền tảng API tương ứng.",
    },
    detailImages: [images(7, 8), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-05-tao-khoa-api",
    n: "05",
    title: "Tạo và lưu khóa API",
    preparation: {
      manual: ["Đã kích hoạt thanh toán API và đang ở đúng dự án của hệ thống tư vấn."],
      automatic: ["Nền tảng tạo một khóa bí mật để Apps Script xác thực mỗi lần gọi mô hình AI."],
    },
    details: [
      "Mở API keys, chọn Create new secret key, đặt tên dễ nhận biết và chọn đúng dự án rồi tạo khóa.",
      "Sao chép khóa ngay khi màn hình hiển thị và lưu tạm ở nơi an toàn. Khóa đầy đủ chỉ xuất hiện một lần; không chụp hoặc chia sẻ khóa trong tài liệu công khai.",
    ],
    callout: {
      title: "Bảo mật khóa",
      text: "Không dán khóa API trực tiếp vào Code.gs hoặc một ô trong Google Sheets. Bước tiếp theo sẽ lưu khóa trong Thuộc tính của tập lệnh.",
    },
    detailImages: [images(9), images(10)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-06-luu-khoa-script-properties",
    n: "06",
    title: "Lưu khóa API trong Thuộc tính của tập lệnh",
    preparation: {
      manual: ["Khóa API vừa tạo vẫn đang được lưu an toàn để có thể sao chép."],
      automatic: ["Apps Script đọc khóa qua PropertiesService thay vì để lộ khóa trong mã hoặc bảng tính."],
    },
    details: [
      "Trong Apps Script, chọn Cài đặt dự án bằng biểu tượng bánh răng, cuộn đến Thuộc tính của tập lệnh và chọn Thêm thuộc tính của tập lệnh.",
      "Ở ô Thuộc tính, nhập OPENAI_API_KEY nếu dùng OpenAI hoặc ANTHROPIC_API_KEY nếu dùng Claude. Ở ô Giá trị, dán khóa bí mật vừa sao chép.",
      "Nhấn Lưu thuộc tính của tập lệnh và kiểm tra thuộc tính đã xuất hiện. Không để khoảng trắng thừa ở tên thuộc tính.",
    ],
    detailImages: [images(11), images(12), images(13)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-07-kiem-tra-du-an-menu",
    n: "07",
    title: "Kiểm tra dự án và tải lại menu Tư vấn AI",
    preparation: {
      manual: ["Mã đã được lưu và thuộc tính API đã được thiết lập."],
      automatic: ["Hàm onOpen tạo menu Tư vấn AI khi Google Sheets được tải lại."],
    },
    details: [
      "Mở Tổng quan dự án trong Apps Script. Đặt tên dự án để dễ quản lý và kiểm tra mục Vùng chứa đang trỏ tới đúng tệp HE THONG TU VAN DINH DUONG 28 NGAY.",
      "Nhấn vào liên kết bảng tính ở Vùng chứa, sau đó tải lại trang bằng F5. Kiểm tra menu Tư vấn AI đã xuất hiện trên thanh công cụ Google Sheets.",
    ],
    callout: {
      title: "Nếu chưa thấy menu",
      text: "Quay lại Apps Script, kiểm tra mã đã lưu và hàm onOpen không báo lỗi; sau đó chạy onOpen một lần rồi tải lại bảng tính.",
    },
    detailImages: [images(14), images(15)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-08-cap-quyen-kiem-tra-api",
    n: "08",
    title: "Cấp quyền Google và kiểm tra kết nối API",
    preparation: {
      manual: ["Đang đăng nhập đúng tài khoản Google sở hữu bảng tính và dự án Apps Script."],
      automatic: ["Apps Script kiểm tra khóa, mô hình đang dùng và phản hồi ngắn từ API."],
    },
    details: [
      "Trong menu Tư vấn AI, chọn Kiểm tra kết nối API. Ở lần chạy đầu, hộp Phải ủy quyền xuất hiện; chọn OK để bắt đầu cấp quyền.",
      "Nếu Google hiển thị cảnh báo ứng dụng chưa được xác minh, chọn Nâng cao, chọn Đi tới HE THONG TU VAN DINH DUONG 28 NGAY rồi xem và chấp nhận các quyền cần thiết.",
      "Chờ thông báo Kết nối thành công. Kiểm tra thông báo có đúng mô hình và phản hồi ngắn từ API; nếu có lỗi, đối chiếu lại tên thuộc tính, khóa và số dư API.",
    ],
    callout: {
      title: "Chỉ cấp quyền cho dự án của bạn",
      text: "Đọc danh sách quyền trước khi cho phép và xác nhận đúng dự án gắn với bảng tính trung tâm do chính bạn tạo.",
    },
    detailImages: [images(16, 17), images(18, 19, 20), images(21)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-09-tao-khung-trang-tinh",
    n: "09",
    title: "Tạo đầy đủ cấu trúc các trang tính",
    preparation: {
      manual: ["Kết nối API đã thành công và tệp Google Sheets trung tâm không chứa dữ liệu cần giữ ở các trang sắp tạo."],
      automatic: ["Mã tạo AI_DU_THAO, KE_HOACH_CUOI, PHAN_HOI_EMAIL và CAU_HINH cùng tiêu đề cột cần thiết."],
    },
    details: [
      "Trong menu Tư vấn AI, chọn Tạo khung trang tính.",
      "Chờ hộp thoại xác nhận đã tạo các trang AI_DU_THAO, KE_HOACH_CUOI, PHAN_HOI_EMAIL và CAU_HINH.",
      "Kiểm tra các tab mới ở cuối bảng tính và mở từng tab để chắc chắn hàng tiêu đề đã có. Nguồn phản hồi biểu mẫu sẽ được đổi thành KHACH_HANG ở bước tiếp theo.",
    ],
    callout: {
      title: "Không xóa dữ liệu cũ",
      text: "Khi chạy lại, mã chỉ nên bổ sung cấu trúc còn thiếu. Nếu mã có lệnh xóa trang hoặc xóa toàn bộ dữ liệu, cần kiểm tra trước khi chạy trên tệp đang vận hành.",
    },
    detailImages: [images(22), images(23), images(24)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-10-tao-google-form",
    n: "10",
    title: "Tạo Google Form và nối phản hồi về bảng tính",
    preparation: {
      manual: ["Đã đọc lại câu hỏi sàng lọc và giới hạn dữ liệu sức khỏe được phép thu."],
      automatic: ["Apps Script tạo Google Form, nối phản hồi về tệp trung tâm, đổi tên trang phản hồi thành KHACH_HANG và thêm cột Mã khách."],
    },
    details: [
      "Trong menu Tư vấn AI, chọn Tạo biểu mẫu.",
      "Khi hộp thoại trả về hai đường dẫn, sao chép đường dẫn dành cho khách để gửi phiếu và đường dẫn chỉnh sửa để hoàn thiện nội dung biểu mẫu.",
      "Mở biểu mẫu chỉnh sửa, kiểm tra tiêu đề, mô tả, các trường liên hệ, lịch sinh hoạt, thói quen ăn uống, mục tiêu và câu hỏi sàng lọc trước khi phát hành.",
    ],
    callout: {
      title: "Phạm vi sàng lọc",
      text: "Biểu mẫu cần giúp phát hiện trường hợp phải hỏi thêm hoặc chuyển chuyên môn; AI chỉ đánh dấu để người tư vấn xem, không tự kết luận khách đủ điều kiện.",
    },
    detailImages: [images(25), images(26), images(27)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-11-gui-form-tao-du-thao",
    n: "11",
    title: "Gửi phiếu thử và tạo bản kế hoạch dự thảo",
    preparation: {
      manual: ["Chuẩn bị một bộ dữ liệu thử không chứa thông tin nhạy cảm của người thật."],
      automatic: ["Biểu mẫu ghi một dòng mới, tạo mã khách; Apps Script gửi phần dữ liệu cần thiết sang AI và lưu kết quả vào AI_DU_THAO."],
    },
    details: [
      "Mở đường dẫn biểu mẫu dành cho khách, điền đủ một hồ sơ thử rồi gửi. Trở lại KHACH_HANG và kiểm tra dòng phản hồi mới cùng mã khách đã được tạo.",
      "Chọn một ô trên đúng dòng khách cần xử lý, mở Tư vấn AI và chọn Tạo bản dự thảo cho dòng đang chọn.",
      "Chờ thông báo đã tạo bản dự thảo, sau đó mở AI_DU_THAO. Kết quả phải gồm mã khách, tóm tắt, dữ liệu còn thiếu, điểm cần kiểm tra, mục tiêu dự kiến, kế hoạch bốn tuần và câu hỏi cần trao đổi.",
    ],
    callout: {
      title: "Đầu ra có cấu trúc",
      text: "Nếu dữ liệu chạm đến trường hợp ngoài phạm vi tư vấn, AI chỉ đánh dấu để người tư vấn xem và không tạo khuyến nghị điều trị.",
    },
    detailImages: [images(28), images(29), images(30)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-12-duyet-du-thao-lan-mot",
    n: "12",
    title: "Người tư vấn duyệt bản dự thảo lần thứ nhất",
    preparation: {
      manual: ["Mở đúng hồ sơ trong AI_DU_THAO và đối chiếu với dữ liệu gốc ở KHACH_HANG."],
      automatic: ["Hệ thống giữ hồ sơ ở trạng thái Chờ duyệt; không tự chuyển sang kế hoạch cuối."],
    },
    details: [
      "Đọc toàn bộ bản dự thảo và kiểm tra ba điểm: AI có đọc sai dữ liệu không, có nội dung nào vượt quá dữ kiện thật không, kế hoạch có phù hợp với mục tiêu đã trao đổi không.",
      "Nếu cần chỉnh sửa, nhập yêu cầu cụ thể vào cột Góp ý rồi chọn Cần sửa. Nếu nội dung có thể dùng làm cơ sở hoàn thiện, chọn Đồng ý.",
      "Giới hạn cột Trạng thái duyệt 1 ở ba giá trị: Chờ duyệt, Cần sửa và Đồng ý. Không cho phép quy trình gửi khách khi chưa có trạng thái Đồng ý.",
    ],
    callout: {
      title: "Điểm duyệt thứ nhất",
      text: "Người tư vấn xác nhận kết luận chuyên môn, mục tiêu và phạm vi kế hoạch. AI chỉ sắp xếp, viết lại và chuẩn bị bản đầu.",
    },
    detailImages: [images(31), images(32), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-13-sua-va-hoan-chinh-ke-hoach",
    n: "13",
    title: "Để AI sửa theo góp ý và hoàn chỉnh bảng kế hoạch",
    preparation: {
      manual: ["Cột Góp ý phải nêu rõ phần cần sửa; trạng thái của hồ sơ phải là Cần sửa hoặc Đồng ý theo đúng mục đích."],
      automatic: ["AI nhận bản dự thảo, góp ý và nguyên tắc gói dịch vụ; chỉ sửa phần được yêu cầu rồi chuyển bản được đồng ý sang KE_HOACH_CUOI."],
    },
    details: [
      "Với hồ sơ ở trạng thái Cần sửa, chạy chức năng sửa theo góp ý. AI phải giữ nguyên phần không được yêu cầu thay đổi và liệt kê các nội dung đã sửa.",
      "Đọc lại bản cập nhật trong AI_DU_THAO. Nếu đã đạt yêu cầu, chọn Đồng ý rồi chạy Chuyển sang bảng kế hoạch hoàn chỉnh.",
      "Kiểm tra thông báo chuyển kế hoạch và mở KE_HOACH_CUOI. Bảng cuối phải có tuần hoặc ngày, mục tiêu, việc cần làm, tần suất, cách tự ghi nhận, điều kiện báo lại và ghi chú đã duyệt.",
    ],
    callout: {
      title: "Không sửa lan sang phần khác",
      text: "Mỗi lần AI sửa, người tư vấn phải kiểm tra lại phần được thay đổi và bảo đảm những nội dung đã duyệt trước đó vẫn được giữ nguyên.",
    },
    detailImages: [images(33, 34), images(35, 36), images(37)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-14-duyet-cuoi-gui-gmail",
    n: "14",
    title: "Duyệt bản cuối và gửi kế hoạch qua Gmail",
    preparation: {
      manual: ["Đối chiếu đúng mã khách, email nhận và toàn bộ nội dung kế hoạch trong KE_HOACH_CUOI."],
      automatic: ["Chỉ khi trạng thái là Đã duyệt gửi, Apps Script mới tạo email, gửi qua Gmail, ghi thời điểm gửi và chống gửi trùng."],
    },
    details: [
      "Đọc toàn bộ kế hoạch cuối. Giữ trạng thái Chờ duyệt cuối nếu còn điểm chưa chắc chắn; chỉ chọn Đã duyệt gửi khi bạn chịu trách nhiệm về bản khách sẽ nhận.",
      "Chọn đúng dòng, mở Tư vấn AI và chạy Gửi kế hoạch qua Gmail. Đọc hộp xác nhận để tránh gửi nhầm người hoặc gửi lại một hồ sơ đã xử lý.",
      "Mở Gmail kiểm tra thư đã gửi. Tiêu đề nên chứa mã khách, không chứa dữ liệu sức khỏe; nội dung tư vấn phải lấy từ bản đã duyệt, không tạo mới tại bước gửi.",
    ],
    callout: {
      title: "Điểm chặn bắt buộc",
      text: "AI hoàn thành bảng không đồng nghĩa hệ thống được phép gửi. Quyền gửi chỉ mở sau quyết định Đã duyệt gửi của người tư vấn.",
    },
    detailImages: [images(38), images(39, 40), images(41)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-15-doc-va-tom-tat-phan-hoi",
    n: "15",
    title: "Đọc thư phản hồi và để AI tổng hợp cho người tư vấn",
    preparation: {
      manual: ["Yêu cầu khách trả lời trong đúng chuỗi email có mã khách ở tiêu đề."],
      automatic: ["Tác vụ chạy theo lịch tìm thư mới, lấy phần chưa xử lý, gửi sang AI để tóm tắt và ghi vào PHAN_HOI_EMAIL."],
    },
    details: [
      "Trong menu Tư vấn AI, chạy chức năng đọc thư phản hồi mới hoặc thiết lập kích hoạt theo thời gian để hàm tự chạy định kỳ.",
      "Mở PHAN_HOI_EMAIL và kiểm tra bốn nhóm: khách đã thực hiện được gì, khó khăn ở đâu, khách đang hỏi gì và điểm nào người tư vấn cần xem trước khi trả lời.",
      "Nếu khách cần điều chỉnh kế hoạch, đưa hồ sơ trở lại vòng duyệt của con người. AI không tự trả lời nội dung sức khỏe và không tự thay đổi kế hoạch.",
    ],
    detailImages: [images(42), images(43), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-16-yeu-cau-dashboard",
    n: "16",
    title: "Xác định yêu cầu và lấy hai tệp mã Dashboard",
    preparation: {
      manual: ["Chỉ bắt đầu Dashboard sau khi toàn bộ quy trình trên Google Sheets đã chạy ổn định."],
      automatic: ["Dashboard đọc và ghi trực tiếp vào Google Sheets; không tạo kho dữ liệu hoặc bản sao hồ sơ riêng."],
    },
    details: [
      "Xác định yêu cầu giao diện: hiển thị bốn chặng và số hồ sơ ở từng chặng; làm nổi bật hai điểm cần người tư vấn quyết định; mỗi hồ sơ có mã, nội dung cần xem và nút thao tác; có hộp xác nhận trước khi gửi thư.",
      "Tiếp tục cuộc trò chuyện với ChatGPT hoặc Claude, dùng câu lệnh Dashboard trong tài liệu và yêu cầu tạo hai tệp: Dashboard chứa giao diện HTML và Dieu Phoi chứa mã máy chủ Apps Script.",
      "Đọc lại mã trước khi dùng: không được tạo bảng tính mới, quyền triển khai phải đúng và tiêu đề email không được chứa dữ liệu sức khỏe.",
    ],
    callout: {
      title: "Vai trò của Dashboard",
      text: "Dashboard giúp người tư vấn tập trung xử lý việc và không bỏ sót hồ sơ; nó không thay đổi chuỗi nghiệp vụ hay hai điểm duyệt.",
    },
    detailImages: [images(44), images(45, 46), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-17-tao-tep-dashboard-webapp",
    n: "17",
    title: "Tạo tệp Dashboard và WebApp trong Apps Script",
    preparation: {
      manual: ["Đã có đầy đủ mã HTML cho Dashboard và mã máy chủ Dieu Phoi/WebApp."],
      automatic: ["Apps Script dùng hai tệp này để hiển thị giao diện và đọc, cập nhật dữ liệu trong Google Sheets."],
    },
    details: [
      "Trong Apps Script, tại mục Tệp bấm dấu cộng, chọn HTML, đặt tên Dashboard, xóa nội dung mẫu, dán toàn bộ mã giao diện rồi nhấn Lưu.",
      "Bấm dấu cộng lần nữa, chọn Script/Tập lệnh và đặt tên WebApp. Không dùng lại tên Dashboard vì Apps Script không cho hai tệp trùng tên, kể cả khác loại.",
      "Dán toàn bộ mã máy chủ vào WebApp rồi lưu dự án. Kiểm tra cả Dashboard.html, WebApp.gs và Code.gs đều không còn trạng thái chưa lưu hoặc lỗi cú pháp.",
    ],
    detailImages: [images(47, 48, 49, 50), images(51, 52), images(53)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-18-trien-khai-dashboard",
    n: "18",
    title: "Triển khai ứng dụng web, lưu đường dẫn và thử toàn bộ chuỗi",
    preparation: {
      manual: ["Mã Dashboard và WebApp đã lưu; tài khoản Google đang dùng có quyền triển khai dự án."],
      automatic: ["Ứng dụng web hiển thị dữ liệu từ Sheets và hàm gửi biểu mẫu có thể gửi email báo hồ sơ mới kèm liên kết Dashboard."],
    },
    details: [
      "Bấm Triển khai → Triển khai mới, mở biểu tượng bánh răng và chọn Ứng dụng web.",
      "Ở Thực thi với tư cách chọn Tôi; ở Ai có quyền truy cập chọn Chỉ mình tôi. Bấm Triển khai và hoàn tất màn hình cấp quyền.",
      "Sao chép URL ứng dụng web kết thúc bằng /exec, mở trong tab mới để kiểm tra, rồi thêm thuộc tính LINK_DASHBOARD trong Thuộc tính của tập lệnh với giá trị là URL này.",
      "Điền một phiếu thử. Trong khoảng một phút, kiểm tra email thông báo, hồ sơ mới, bản dự thảo và thẻ hồ sơ trên Dashboard; thử các nút duyệt và hộp xác nhận gửi thư.",
    ],
    callout: {
      title: "Chỉ triển khai sau khi Sheet đã ổn định",
      text: "Nếu dựng giao diện quá sớm, lỗi trong chuỗi xử lý dễ bị lớp hiển thị che khuất và khó xác định nguyên nhân.",
    },
    detailImages: [images(54), images(55, 56), images(57), images(58)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m1-19-kiem-soat-an-toan",
    n: "19",
    title: "Chuẩn hóa hai điểm duyệt, bốn câu lệnh và điểm dừng an toàn",
    preparation: {
      manual: ["Người tư vấn phải có chuyên môn phù hợp và tự xác định rõ phạm vi tiếp nhận khách."],
      automatic: ["Hệ thống dừng tại các trạng thái duyệt và từ chối tạo kế hoạch khi dữ liệu sàng lọc chạm trường hợp ngoài phạm vi."],
    },
    details: [
      "Duy trì hai điểm duyệt: lần một xác nhận kết luận chuyên môn, mục tiêu và phạm vi; lần hai xác nhận chính bản khách hàng sẽ nhận. Chỉ Đã duyệt gửi mới mở quyền gửi email.",
      "Lưu bốn câu lệnh chuẩn trong CAU_HINH: đọc dữ liệu đầu vào; tạo kế hoạch dự thảo; sửa theo góp ý; tóm tắt thư phản hồi. Khi AI hiểu sai, sửa câu lệnh gốc hoặc biểu mẫu để lỗi không lặp lại.",
      "Kiểm tra điểm dừng an toàn bằng hồ sơ thử. Nếu khách chọn Đã từng được khám bệnh, Đang mang thai hoặc có dấu hiệu vượt phạm vi, hệ thống phải thông báo cần người có chuyên môn xử lý và không tạo kế hoạch hay lời khuyên.",
    ],
    callout: {
      title: "Những việc không giao hoàn toàn cho AI",
      text: "Quyết định nhận khách, kết luận chuyên môn, thay đổi mục tiêu, xử lý dấu hiệu bất thường và duyệt nội dung gửi khách phải do người đủ chuyên môn thực hiện.",
    },
    detailImages: [images(59, 60), images(61, 62, 63, 64), images(65)],
    calloutImages: [],
    showVideo: false,
  },
];
