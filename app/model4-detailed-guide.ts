export type Model4DetailedGuideStep = {
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
  numbers.map((number) => `m4-ch6-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “Mô hình 4 - Chương 6.docx”.
 * All 44 screenshots remain in the same order as the source document.
 */
export const model4DetailedGuide: Model4DetailedGuideStep[] = [
  {
    id: "m4-01-chon-cong-viec-lap-lai",
    n: "01",
    title: "Chọn một công việc lặp lại thay vì bắt đầu từ ý tưởng công nghệ",
    preparation: {
      manual: [
        "Chọn một công việc đang được thực hiện thật trong doanh nghiệp.",
        "Chuẩn bị giấy hoặc bảng tính để ghi ngắn gọn vấn đề trước khi liên hệ người dùng.",
      ],
      automatic: ["Chưa dùng AI hoặc viết mã ở giai đoạn này; mục tiêu là làm rõ công việc cần giải quyết."],
    },
    details: [
      "Viết đúng bốn dòng: tên công việc, ai đang làm, công việc diễn ra mấy lần mỗi tuần và mỗi lần mất bao lâu. Nội dung phải đủ rõ để có thể mô tả trong khoảng 20 giây.",
      "Ưu tiên công việc có đầu vào tương đối giống nhau, kết quả kiểm tra được, lặp lại hằng ngày hoặc hằng tuần và đang làm mất đủ thời gian hoặc tiền bạc.",
      "Không chọn một danh sách tính năng hoặc một ý tưởng ứng dụng hấp dẫn rồi mới đi tìm vấn đề phù hợp. Nếu chưa viết được bốn dòng trên, chưa nên hẹn phỏng vấn hoặc bắt đầu viết mã.",
    ],
    callout: {
      title: "Phạm vi càng hẹp càng dễ kiểm chứng",
      text: "Phiên bản đầu chỉ cần hoàn thành một việc cụ thể từ đầu đến cuối. Không cố thay toàn bộ phòng ban hoặc nhận mọi cấu trúc dữ liệu.",
    },
    detailImages: [images(1), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-02-lap-danh-sach-lien-he",
    n: "02",
    title: "Lập danh sách người dùng đủ lớn để có 3–5 buổi phỏng vấn",
    preparation: {
      manual: [
        "Viết xong mô tả bốn dòng của công việc.",
        "Ưu tiên khách cũ, người quen trong ngành và thành viên hội nhóm nghề nghiệp.",
      ],
      automatic: ["Bảng danh sách giúp theo dõi người sẽ liên hệ, trạng thái phản hồi và lịch hẹn."],
    },
    details: [
      "Muốn có 3–5 buổi phỏng vấn, chuẩn bị khoảng 10–12 người vì tỷ lệ đồng ý thường chỉ khoảng 30–40 phần trăm.",
      "Ghi tên người liên hệ, nguồn quen biết, công việc họ đang làm, trạng thái phản hồi và thời gian có thể hẹn. Người lạ hoàn toàn thường khó đồng ý cho buổi mở màn hình ở lần tiếp xúc đầu.",
      "Tin nhắn mời cần nói rõ bạn muốn quan sát quy trình hiện tại, không bán hàng và không yêu cầu họ chuẩn bị một bài trình bày.",
    ],
    callout: {
      title: "Đủ người mới đủ bằng chứng",
      text: "Một cuộc trò chuyện tích cực chưa chứng minh vấn đề có thể bán thành sản phẩm. Cần nhiều người đang thực hiện cùng loại công việc.",
    },
    detailImages: [images(2), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-03-phong-van-mo-man-hinh",
    n: "03",
    title: "Phỏng vấn bằng cách quan sát người dùng thao tác thật",
    preparation: {
      manual: ["Hẹn 3–5 người đang trực tiếp làm công việc đã chọn và xin phép họ chia sẻ màn hình."],
      automatic: ["Không có phần tự động; người nghiên cứu phải quan sát và ghi lại quy trình thật."],
    },
    details: [
      "Yêu cầu người dùng mở đúng tệp họ đang sử dụng và thực hiện lại một lần trước mặt bạn. Ghi lại họ mở tệp nào, sao chép dữ liệu từ đâu, phải nhập lại bao nhiêu lần và thường dừng ở bước nào.",
      "Hỏi đủ sáu câu: tần suất công việc; thời gian mỗi lần; ai làm và ai kiểm tra; sai sót gây mất gì; họ đã từng mua phần mềm hoặc thuê người chưa; nếu quy trình chạy ổn định thì có trả phí định kỳ không.",
      "Đặt trọng tâm vào điều người dùng đang làm thay vì lời khen về ý tưởng. Tệp, thao tác và thời gian thật đáng tin hơn câu trả lời chung chung rằng sản phẩm nghe có vẻ hữu ích.",
    ],
    callout: {
      title: "Quan sát trước, giới thiệu sau",
      text: "Không dẫn dắt người được hỏi theo giải pháp bạn đã nghĩ sẵn. Hãy để họ thực hiện quy trình hiện tại và chỉ hỏi thêm ở những điểm chưa rõ.",
    },
    detailImages: [images(3, 4), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-04-cham-bang-chung-va-xin-du-lieu",
    n: "04",
    title: "Chấm ba lớp bằng chứng và xin một bộ dữ liệu thật đã ẩn danh",
    preparation: {
      manual: ["Chuẩn bị bảng chấm điểm cho từng người đã phỏng vấn."],
      automatic: ["Bảng tổng hợp giúp nhìn rõ vấn đề nào đã có hành vi thật, chi phí thật và tín hiệu trả tiền."],
    },
    details: [
      "Chấm ba lớp bằng chứng: người dùng đang làm việc đó thật; họ đang chịu một chi phí rõ ràng; họ chấp nhận đổi cách làm hoặc trả tiền cho giải pháp.",
      "Ngay trong buổi phỏng vấn, đề nghị người dùng chia sẻ một tệp của tuần gần nhất sau khi đã xóa tên khách hàng, số điện thoại và thông tin nhận diện không cần thiết.",
      "Nếu chưa có lớp bằng chứng thứ ba hoặc người dùng không sẵn sàng thử bằng dữ liệu thật, dừng ở bước nghiên cứu; chưa viết mã.",
    ],
    callout: {
      title: "Dữ liệu thật mạnh hơn lời khen",
      text: "Một người sẵn sàng cung cấp tệp đã ẩn danh và thử quy trình cho thấy mức quan tâm cao hơn nhiều so với việc chỉ nói ý tưởng hay.",
    },
    detailImages: [images(5), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-05-thong-nhat-dinh-nghia",
    n: "05",
    title: "Nhận dữ liệu thử và thống nhất định nghĩa trước khi tính",
    preparation: {
      manual: [
        "Tìm 3–5 doanh nghiệp sẵn sàng thử dịch vụ báo cáo thủ công.",
        "Chỉ nhận quyền xem tệp gốc và luôn tạo bản sao để xử lý.",
      ],
      automatic: ["Chưa tự động hóa; giai đoạn này dùng để tìm một cấu trúc dữ liệu chung giữa các khách hàng."],
    },
    details: [
      "Yêu cầu mỗi doanh nghiệp chia sẻ Google Sheet bán hàng theo ngày ở quyền chỉ xem. Không sửa tệp gốc của khách trong bất kỳ trường hợp nào.",
      "Hỏi và ghi lại định nghĩa của ba khái niệm: khách tiềm năng, đơn thành công và tiền thực thu. Nếu các doanh nghiệp dùng khái niệm quá khác nhau, sản phẩm chưa đủ chuẩn hóa.",
      "Lưu tên cột nguồn, định nghĩa đã thống nhất và các ngoại lệ vào một bảng để dùng làm đặc tả cho phiên bản sản phẩm sau này.",
    ],
    callout: {
      title: "Định nghĩa quyết định kết quả",
      text: "Hai người có thể tính ra hai báo cáo khác nhau từ cùng một tệp nếu thời điểm ghi nhận đơn thành công hoặc tiền thực thu chưa được chốt.",
    },
    detailImages: [[], images(6), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-06-tao-bao-cao-cong-thuc",
    n: "06",
    title: "Tạo một mẫu báo cáo công thức dùng lại cho mọi khách thử nghiệm",
    preparation: {
      manual: ["Chuẩn bị dữ liệu của tuần hiện tại, tuần trước và KPI tiền thực thu."],
      automatic: ["Công thức tính sáu chỉ số và phần so sánh; AI không tham gia vào phép tính."],
    },
    details: [
      "Dựng một bảng tính có sẵn sáu chỉ số: tỷ lệ liên hệ, tỷ lệ chốt, doanh thu ghi nhận, tiền thực thu, tỷ lệ hủy và hoàn, mức đạt KPI.",
      "Mỗi tuần chỉ dán dữ liệu mới vào đúng cấu trúc. Các số cộng thô như khách mới, khách đã liên hệ, cuộc hẹn và đơn thành công được hiển thị để đối chiếu nhưng không thay thế sáu chỉ số chính.",
      "So sánh tuần hiện tại với tuần trước bằng công thức cố định. Dừng hoặc hiển thị rõ trường hợp mẫu số bằng 0 thay vì để công thức tạo kết quả sai.",
    ],
    callout: {
      title: "Phần số luôn do mã hoặc công thức tính",
      text: "Doanh thu, tỷ lệ và mức đạt KPI phải truy nguyên được. AI chỉ được nhận bảng chỉ số đã tính để viết phần diễn giải.",
    },
    detailImages: [images(7), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-07-tao-nhan-xet-bang-ai",
    n: "07",
    title: "Dùng AI viết nhận xét từ bảng chỉ số đã tính",
    preparation: {
      manual: ["Kiểm tra bảng chỉ số đã đủ số hiện tại, số so sánh và mức thay đổi."],
      automatic: ["AI chuyển bảng số thành bốn phần nhận xét theo cấu trúc cố định."],
    },
    details: [
      "Sao chép bảng chỉ số đã tính vào ChatGPT hoặc Claude cùng câu lệnh giới hạn. Không gửi dữ liệu cá nhân hoặc từng dòng giao dịch khi phần nhận xét chỉ cần số tổng hợp.",
      "Yêu cầu kết quả gồm đúng bốn phần: tổng quan; cảnh báo; việc cần kiểm tra tuần tới; câu hỏi còn thiếu dữ liệu.",
      "Mỗi cảnh báo phải nêu chỉ số hiện tại, chỉ số so sánh và mức thay đổi. Khi chưa có bằng chứng về nguyên nhân, AI phải viết cần kiểm tra thay vì kết luận.",
      "Người bán đọc lại, sửa ngôn ngữ và kiểm tra mọi số liệu trước khi gửi cho khách. AI không được đánh giá phẩm chất nhân viên hoặc quyết định thưởng phạt.",
    ],
    callout: {
      title: "AI diễn giải, không tính lại",
      text: "Bản nhận xét phải bám hoàn toàn vào bảng số đã được kiểm tra. Nếu API ngừng hoạt động, người quản lý vẫn có thể viết nhận xét thủ công từ cùng bảng chỉ số.",
    },
    detailImages: [images(8), images(9), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-08-ghi-nhat-ky-va-kiem-tra-nguong",
    n: "08",
    title: "Ghi nhật ký từng báo cáo và kiểm tra đủ điều kiện viết phần mềm",
    preparation: {
      manual: ["Theo dõi dịch vụ thủ công ít nhất bốn tuần với nhiều khách hàng."],
      automatic: ["Bảng nhật ký trở thành dữ liệu đầu vào để xác định tính năng, lỗi và ngoại lệ của sản phẩm."],
    },
    details: [
      "Mỗi lần tạo báo cáo, ghi thời gian thực hiện, số chỗ phải sửa, cột thường thiếu và câu hỏi khách hàng hỏi lại. Sau sáu tuần, nhật ký này là bản đặc tả thực tế của phần mềm.",
      "Chỉ bắt đầu xây phiên bản đầu khi ít nhất ba khách đã dùng kết quả bốn tuần liên tiếp; phần lớn dữ liệu quy về một cấu trúc; báo cáo tạo ra giá trị; ít nhất hai khách sẵn sàng trả phí; các ngoại lệ chính đã được ghi lại.",
      "Nếu chưa đủ năm điều kiện, tiếp tục giai đoạn thủ công. Không dùng tốc độ viết mã của AI để thay thế bằng chứng sử dụng và trả tiền.",
    ],
    callout: {
      title: "Giữ sản phẩm ở dạng dịch vụ khi cần",
      text: "Nếu mỗi khách vẫn cần bộ cột, công thức và cách gửi riêng, quy trình chưa ổn định để phần mềm hóa.",
    },
    detailImages: [images(10), images(11), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-09-tao-tep-trung-tam",
    n: "09",
    title: "Tạo Google Sheets trung tâm cho công cụ báo cáo tuần",
    preparation: {
      manual: ["Một tài khoản Google có quyền dùng Sheets, Apps Script, Gmail và Drive."],
      automatic: ["Mã sẽ dựng năm trang CAU_HINH, DU_LIEU_NGAY, CHI_SO_TUAN, BAO_CAO_AI và NHAT_KY_HE_THONG."],
    },
    details: [
      "Tạo một Google Sheets trống và đặt tên BAO CAO BAN HANG TUAN. Đây là tệp trung tâm cho một doanh nghiệp.",
      "Không tạo các trang tính bằng tay. Hàm tạo khung ở bước sau sẽ dựng đúng tên, đúng cột và đúng danh sách trạng thái mà mã cần sử dụng.",
      "Mỗi khách hàng nên có một tệp trung tâm riêng để giảm rủi ro đọc chéo dữ liệu và đơn giản hóa quyền chia sẻ.",
    ],
    callout: {
      title: "Một khách, một tệp trung tâm",
      text: "Không gộp dữ liệu nhiều doanh nghiệp vào cùng một bảng tính khi chưa có cơ sở dữ liệu và phân quyền độc lập.",
    },
    detailImages: [images(12), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-10-chot-cot-va-ky-bao-cao",
    n: "10",
    title: "Chốt 11 cột dữ liệu, kỳ báo cáo và điều kiện dừng",
    preparation: {
      manual: [
        "Thống nhất tuần bắt đầu thứ Hai, kết thúc Chủ Nhật và múi giờ áp dụng.",
        "Chuẩn bị KPI tiền thực thu của tuần.",
      ],
      automatic: ["Mã kiểm tra cấu trúc và dừng trước khi tính nếu dữ liệu không đạt điều kiện."],
    },
    details: [
      "Quy định 11 cột của DU_LIEU_NGAY: ngày, nhân viên, khách tiềm năng mới, khách đã liên hệ, cuộc hẹn, đơn thành công, doanh thu ghi nhận, tiền thực thu, đơn hủy, đơn hoàn và ghi chú lý do bất thường.",
      "Mỗi dòng là một nhân viên trong một ngày. Gửi sẵn cấu trúc này cho khách và không để họ tự đổi tên cột.",
      "Chốt kỳ báo cáo, múi giờ và KPI trước; sau khi mã dựng khung, điền các giá trị này vào CAU_HINH.",
      "Hệ thống phải chuyển sang CAN_SUA_DU_LIEU và dừng khi tên nhân viên trống, ngày ngoài kỳ, số lượng âm, dòng trùng hoặc hơn 5 phần trăm ô bắt buộc còn thiếu.",
    ],
    callout: {
      title: "Dừng đúng quan trọng hơn chạy đủ",
      text: "Công cụ đáng tin phải chỉ rõ dòng hoặc cột sai và không tạo báo cáo khi dữ liệu đầu vào chưa đạt điều kiện.",
    },
    detailImages: [images(13), [], images(14), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-11-mo-apps-script-va-dan-ma-chinh",
    n: "11",
    title: "Mở Apps Script từ đúng bảng tính và dán tệp nghiệp vụ chính",
    preparation: {
      manual: ["Tải đủ ba tệp mã ở Phần 02 của trang này."],
      automatic: ["Apps Script gắn mã với đúng bảng tính trung tâm đang mở."],
    },
    details: [
      "Trong chính tệp BAO CAO BAN HANG TUAN, chọn Tiện ích mở rộng → Apps Script. Không tạo một dự án Apps Script độc lập ở nơi khác.",
      "Mở tệp Mã.gs có sẵn, xóa mã mẫu rồi dán toàn bộ nội dung tệp Ma.gs. Kiểm tra đầu và cuối khối mã để tránh thiếu dòng khi sao chép.",
      "Giữ duy nhất một hàm onOpen dùng để tạo menu Bao cao tuan. Sau khi dán xong, nhấn Ctrl+S.",
    ],
    callout: {
      title: "Mã phải chạy trong tệp đang mở",
      text: "Các hàm sử dụng getActiveSpreadsheet nên dự án Apps Script phải được mở từ đúng Google Sheets trung tâm.",
    },
    detailImages: [images(15), images(16, 17), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-12-tao-hai-tep-dashboard",
    n: "12",
    title: "Tạo tệp máy chủ và tệp HTML của bảng điều khiển",
    preparation: {
      manual: ["Có sẵn mã bang_dieu_khien.gs và bang_dieu_khien.html từ cùng một bộ mã."],
      automatic: ["Tệp máy chủ đọc dữ liệu và gọi hàm nghiệp vụ; tệp HTML hiển thị trạng thái cùng các nút thao tác."],
    },
    details: [
      "Ở cột Tệp, bấm dấu cộng → Tập lệnh, đặt tên bang_dieu_khien rồi dán nội dung tệp bang_dieu_khien.gs.",
      "Bấm dấu cộng lần nữa → HTML, đặt tên đúng bang_dieu_khien và không gõ thêm đuôi .html; sau đó dán toàn bộ mã giao diện.",
      "Đối chiếu tên trong createHtmlOutputFromFile với tên tệp HTML. Hai giá trị phải khớp chính xác từng ký tự, nếu không bảng điều khiển sẽ báo không tìm thấy tệp.",
      "Nhấn Ctrl+S và xác nhận danh sách Tệp có đủ Mã.gs, bang_dieu_khien.gs và bang_dieu_khien.html.",
    ],
    callout: {
      title: "Ba tệp phải thuộc cùng một phiên bản",
      text: "Không lấy giao diện từ một cuộc trò chuyện và mã máy chủ từ cuộc trò chuyện khác vì tên hàm và cấu trúc dữ liệu có thể không khớp.",
    },
    detailImages: [images(18), images(19, 20), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-13-tao-va-luu-khoa-api",
    n: "13",
    title: "Tạo khóa OpenAI API và lưu trong Script Properties",
    preparation: {
      manual: ["Tài khoản API đã có phương thức thanh toán hoặc số dư phù hợp."],
      automatic: ["Apps Script đọc khóa từ Script Properties khi gọi Responses API."],
    },
    details: [
      "Mở platform.openai.com, kiểm tra Billing rồi vào Settings → API keys → Create new secret key. Đặt tên giúp nhận biết dự án báo cáo tuần.",
      "Sao chép khóa ngay khi nó xuất hiện vì hệ thống chỉ hiển thị đầy đủ một lần. Ảnh minh họa trên trang đã được che khóa để tránh lộ thông tin truy cập.",
      "Quay lại Apps Script → Cài đặt dự án → Thuộc tính của tập lệnh, tạo thuộc tính OPENAI_API_KEY và dán khóa vào ô giá trị. Không ghi khóa trong mã hoặc trong ô bảng tính.",
      "Tệp gắn mã nên do người bán sở hữu. Người có quyền chỉnh sửa bảng tính có thể mở Apps Script, vì vậy cần kiểm soát chặt danh sách người được cấp quyền chỉnh sửa.",
    ],
    callout: {
      title: "ChatGPT Plus không bao gồm API",
      text: "ChatGPT và OpenAI API là hai sản phẩm tách biệt. Việc gọi API chỉ hoạt động khi tài khoản API có cấu hình thanh toán phù hợp.",
    },
    detailImages: [images(21), images(22), images(23), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-14-cap-quyen-va-nap-menu",
    n: "14",
    title: "Cấp quyền lần đầu và nạp menu Bao cao tuan",
    preparation: {
      manual: ["Ba tệp mã đã được lưu và bảng tính trung tâm vẫn đang mở."],
      automatic: ["Google cấp quyền cho dự án; hàm onOpen dựng menu khi bảng tính được tải lại."],
    },
    details: [
      "Trong hộp chọn hàm trên thanh công cụ Apps Script, chọn hàm tạo khung trang tính rồi bấm Chạy. Không chọn onOpen để chạy trực tiếp.",
      "Nếu Google hiện cảnh báo Ứng dụng chưa được xác minh, chọn đúng tài khoản, bấm Nâng cao → Đi tới dự án → Cho phép.",
      "Quay lại Google Sheets và nhấn F5. Kiểm tra menu Bao cao tuan xuất hiện; nếu chưa có, xác nhận mã đã lưu và dự án Apps Script được mở từ đúng tệp.",
    ],
    callout: {
      title: "Chỉ cấp quyền cho dự án của bạn",
      text: "Đọc kỹ các quyền được yêu cầu và chỉ tiếp tục khi dự án, tài khoản và tệp trung tâm đều đúng.",
    },
    detailImages: [images(24), images(25), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-15-tao-khung-va-kiem-tra-api",
    n: "15",
    title: "Tạo năm trang tính rồi kiểm tra kết nối API",
    preparation: {
      manual: ["OPENAI_API_KEY đã được lưu và quyền Apps Script đã được cấp."],
      automatic: ["Mã tạo khung dữ liệu, sau đó gọi thử API và ghi kết quả vào nhật ký hệ thống."],
    },
    details: [
      "Từ menu Bao cao tuan, chạy 1. Tạo khung trang tính. Chờ thông báo hoàn tất và xác nhận có đủ CAU_HINH, DU_LIEU_NGAY, CHI_SO_TUAN, BAO_CAO_AI và NHAT_KY_HE_THONG.",
      "Không đổi tên năm trang này. Tên trang là một phần của giao diện giữa mã, bảng điều khiển và dữ liệu.",
      "Sau khi tạo khung xong, chạy 6. Kiểm tra kết nối API. Chỉ tiếp tục khi thông báo nêu kết nối tốt, mô hình sử dụng và địa chỉ Responses API.",
      "Nếu lỗi, kiểm tra tên thuộc tính OPENAI_API_KEY, số dư API, mô hình trong CAU_HINH và nội dung lỗi trong NHAT_KY_HE_THONG.",
    ],
    callout: {
      title: "Thứ tự bắt buộc",
      text: "Phải tạo khung trang tính trước khi kiểm tra API hoặc mở bảng điều khiển; làm ngược thứ tự sẽ gây lỗi không tìm thấy trang dữ liệu.",
    },
    detailImages: [images(26, 27), [], images(28, 29), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-16-mo-bang-dieu-khien",
    n: "16",
    title: "Mở bảng điều khiển và dùng nó làm bản đồ quy trình",
    preparation: {
      manual: ["Khung năm trang tính đã được tạo thành công."],
      automatic: ["Bảng điều khiển đọc trạng thái hiện tại và đề xuất việc tiếp theo mà không tự thay đổi điểm duyệt."],
    },
    details: [
      "Chạy Bao cao tuan → Mở bảng điều khiển ngay cả khi chưa có dữ liệu. Các khối rỗng vẫn hiển thị câu hướng dẫn về bước sẽ tạo dữ liệu cho chúng.",
      "Kiểm tra phần tóm tắt có kỳ báo cáo, trạng thái dữ liệu, trạng thái báo cáo, nguồn dữ liệu, cấu hình API và khu vực việc tiếp theo.",
      "Dùng nút Cập nhật lại sau mỗi thay đổi trong Google Sheets để bảng điều khiển đọc trạng thái mới nhất.",
    ],
    callout: {
      title: "Bảng điều khiển không thay đổi quy tắc",
      text: "Giao diện chỉ giúp thao tác theo đúng thứ tự; việc kiểm tra dữ liệu, tính chỉ số và duyệt vẫn tuân theo các trạng thái trong bảng tính.",
    },
    detailImages: [images(30), images(31), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-17-noi-tep-du-lieu-khach",
    n: "17",
    title: "Tạo tệp nhập liệu riêng và nối nguồn dữ liệu của khách",
    preparation: {
      manual: [
        "Tạo một bản sao tệp mẫu cho từng doanh nghiệp và cấp đúng quyền.",
        "Tệp khách có trang hướng dẫn và trang dữ liệu đủ 11 cột bắt buộc.",
      ],
      automatic: ["Hệ thống lưu đường dẫn nguồn và tự đọc tệp đó ở mỗi lần chạy."],
    },
    details: [
      "Đặt tên tệp dữ liệu theo doanh nghiệp. Nhân viên của khách nhập một dòng cho mỗi ngày làm việc và không thay đổi tên cột.",
      "Mở tệp khách, sao chép đường dẫn trên thanh địa chỉ rồi dán vào ô Đường dẫn tệp dữ liệu của khách trên bảng điều khiển.",
      "Bấm Nối tệp. Hệ thống phải báo tên tệp đã nối; nếu thiếu cột hoặc không đủ quyền, sửa đúng lỗi rồi nối lại.",
      "Sau khi nối thành công, không chép dữ liệu qua lại bằng tay. Công cụ đọc trực tiếp tệp nguồn ở mỗi lần tạo báo cáo.",
    ],
    callout: {
      title: "Không sửa tệp gốc của khách",
      text: "Trong giai đoạn thử nghiệm, luôn giữ tệp gốc ở quyền chỉ xem và dùng bản sao hoặc tệp mẫu riêng để tránh làm thay đổi dữ liệu vận hành.",
    },
    detailImages: [images(32), images(33, 34), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-18-tinh-chi-so-tuan",
    n: "18",
    title: "Kiểm tra dữ liệu và tính sáu chỉ số tuần bằng mã",
    preparation: {
      manual: ["Dữ liệu của tuần hiện tại và tuần trước đã đủ; kỳ báo cáo cùng KPI đã được điền trong CAU_HINH."],
      automatic: ["Mã kiểm tra dữ liệu, cộng số, tính sáu chỉ số và ghi phần so sánh tuần trước."],
    },
    details: [
      "Trên bảng điều khiển, bấm Tính chỉ số tuần. Nếu hệ thống báo CAN_SUA_DU_LIEU, mở chi tiết lỗi, sửa đúng dòng hoặc cột rồi chạy lại.",
      "Khi dữ liệu đạt, Apps Script tính toàn bộ phần số và ghi vào CHI_SO_TUAN. AI chưa được gọi ở bước này.",
      "Kiểm tra bảng điều khiển hiển thị đủ sáu chỉ số, số hiện tại và phần so sánh tuần trước. Đối chiếu ít nhất một lần với báo cáo thủ công trước khi dùng cho khách thật.",
      "Trường hợp mẫu phải cho kết quả tỷ lệ chốt 19,1 phần trăm so với 20,7 phần trăm, tỷ lệ hủy 11,0 phần trăm so với 7,0 phần trăm và mức đạt KPI 88 phần trăm.",
    ],
    callout: {
      title: "Không bỏ qua lỗi để tiếp tục chạy",
      text: "Tên nhân viên trống, số âm, dòng trùng, sai kỳ hoặc thiếu quá nhiều ô đều phải được sửa trước khi tạo báo cáo.",
    },
    detailImages: [images(35), images(36, 37), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-19-tao-ban-nhan-xet-ai",
    n: "19",
    title: "Tạo bản nhận xét AI ở trạng thái chờ duyệt",
    preparation: {
      manual: ["Bảng CHI_SO_TUAN đã có kết quả chính xác và phần so sánh tuần trước."],
      automatic: ["AI nhận JSON chỉ số đã tính, trả bốn trường nội dung và hệ thống ghi bản nháp với trạng thái CHO_DUYET."],
    },
    details: [
      "Bấm Tạo nhận xét bằng AI. Hệ thống chỉ gửi bảng chỉ số tổng hợp, không gửi tên khách hàng, số điện thoại hoặc từng dòng giao dịch.",
      "Kiểm tra TONG_QUAN, CANH_BAO, HANH_DONG_DE_XUAT và CAU_HOI_CHO_QUAN_LY đều có nội dung. Mỗi cảnh báo phải đi kèm số hiện tại, số so sánh và mức thay đổi.",
      "Nếu AI trả thiếu trường, kết luận không có căn cứ hoặc số liệu khác bảng chỉ số, không duyệt. Sửa câu lệnh hoặc viết nhận xét thủ công rồi mới tiếp tục.",
    ],
    callout: {
      title: "Hệ thống phải dừng ở CHO_DUYET",
      text: "Không hàm nào được tự chuyển bản nháp sang trạng thái đã duyệt hoặc tự gửi ngay khi AI trả kết quả.",
    },
    detailImages: [images(38), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-20-duyet-va-gui-bao-cao",
    n: "20",
    title: "Duyệt nội dung, cấu hình người nhận và gửi báo cáo",
    preparation: {
      manual: [
        "Đọc lại toàn bộ bản nhận xét và đối chiếu số liệu.",
        "Chuẩn bị đúng email người nhận báo cáo.",
      ],
      automatic: ["Hệ thống chỉ gửi bản đã duyệt, ghi mã gửi và chuyển trạng thái sang DA_GUI để chống gửi trùng."],
    },
    details: [
      "Mở BAO_CAO_AI, đọc bốn phần nội dung, sửa nếu cần, điền người duyệt và ngày duyệt rồi đổi trạng thái thành DA_DUYET_GUI.",
      "Mở CAU_HINH, tìm EMAIL_NGUOI_NHAN và nhập đúng địa chỉ vào cột GIA_TRI. Kiểm tra kỳ báo cáo, doanh nghiệp và người nhận trước khi gửi.",
      "Quay lại bảng điều khiển, bấm Cập nhật lại rồi bấm Gửi báo cáo đã duyệt. Nếu trạng thái chưa đúng hoặc thiếu email, hệ thống phải dừng và nêu lỗi.",
      "Mở Gmail để xác nhận tiêu đề, số liệu, nội dung và người nhận. Chạy lại thao tác gửi phải không tạo thêm một email trùng cho cùng mã báo cáo.",
    ],
    callout: {
      title: "Người quản lý quyết định bản cuối",
      text: "Điểm duyệt phải được giữ ít nhất trong các chu kỳ đầu. Không dùng bản nhận xét AI để tự động quyết định thưởng phạt hoặc đánh giá nhân sự.",
    },
    detailImages: [images(39), images(40), images(41, 42), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m4-21-dat-lich-chay-tu-dong",
    n: "21",
    title: "Đặt lịch chạy thứ Sáu và giữ nguyên điểm duyệt của con người",
    preparation: {
      manual: [
        "Đã chạy thử đầy đủ ít nhất hai chu kỳ với dữ liệu thật và đối chiếu kết quả.",
        "Kiểm tra múi giờ dự án cùng kỳ báo cáo trong CAU_HINH.",
      ],
      automatic: ["Trình kích hoạt tự kiểm tra dữ liệu, tính chỉ số và tạo bản dự thảo theo lịch; việc duyệt và gửi vẫn do người quản lý thực hiện."],
    },
    details: [
      "Từ menu Bao cao tuan, chọn 7. Đặt lịch chạy tự động. Hệ thống tạo trình kích hoạt vào chiều thứ Sáu theo múi giờ của dự án.",
      "Đọc thông báo xác nhận thời gian chạy. Apps Script có thể chọn một thời điểm trong khung giờ thay vì đúng từng phút, vì vậy không hứa giờ gửi chính xác khi thiết kế chỉ dùng trình kích hoạt theo giờ.",
      "Từ tuần tiếp theo, hệ thống tự đọc cấu hình, kiểm tra dữ liệu, tính chỉ số, tạo nhận xét và dừng ở CHO_DUYET. Người quản lý vẫn phải kiểm tra rồi bấm gửi.",
      "Theo dõi NHAT_KY_HE_THONG, tỷ lệ báo cáo phải sửa, số phút hỗ trợ và lỗi API/email. Chỉ xem xét tự gửi khi dữ liệu ổn định và tỷ lệ phải sửa đủ thấp.",
    ],
    callout: {
      title: "Tự động hóa không xóa trách nhiệm",
      text: "Người tạo sản phẩm vẫn chịu trách nhiệm về bảo mật, quyền truy cập, chất lượng số liệu, chi phí API và cách xử lý khi dịch vụ bị gián đoạn.",
    },
    detailImages: [images(43), images(44), [], []],
    calloutImages: [],
    showVideo: false,
  },
];
