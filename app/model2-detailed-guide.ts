export type Model2DetailedGuideStep = {
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
  numbers.map((number) => `m2-ch4-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “chuong4_thai_localized_images.docx”.
 * The 55 localized screenshots remain in the same order as the source document.
 */
export const model2DetailedGuide: Model2DetailedGuideStep[] = [
  {
    id: "m2-01-quy-trinh-trung-tam",
    n: "01",
    title: "Nắm quy trình và tạo Google Sheets trung tâm",
    preparation: {
      manual: [
        "Một tài khoản Google có thể dùng Google Sheets, Google Forms, Drive, Apps Script và Gmail.",
        "Chọn OpenAI API hoặc Anthropic API làm công cụ AI chính; người mới chỉ cần chọn một loại.",
      ],
      automatic: [
        "Google Sheets giữ trạng thái; Drive lưu tệp; Apps Script nối các bước; AI xử lý nội dung; Gmail bàn giao và nhận phản hồi.",
        "Người cung cấp vẫn giữ ba điểm duyệt: chọn ý tưởng, duyệt kịch bản và duyệt video cuối.",
      ],
    },
    details: [
      "Đọc sơ đồ toàn bộ chu trình: nhận dữ liệu khách, kiểm tra hồ sơ, tạo và duyệt ý tưởng, viết và duyệt kịch bản, lập kế hoạch hình, dựng video, QC, bàn giao rồi phân loại phản hồi.",
      "Tạo một Google Sheets trống và đặt tên cho hệ thống sản xuất video. Đây là tệp trung tâm; các trang tính và cây thư mục Drive sẽ được mã tạo ở các bước sau.",
      "Dữ liệu nên tách thành chín trang: KHACH_HANG, HO_SO, Y_TUONG, KICH_BAN, KE_HOACH_HINH, SAN_XUAT, PHAN_HOI, SO_LIEU và CAU_HINH. Tệp video nằm trong Drive và được gọi về bằng liên kết.",
    ],
    callout: {
      title: "Không dồn mọi việc vào một kịch bản",
      text: "Tách riêng nhận khách, tạo nội dung, bàn giao và đọc phản hồi. Khi một bước lỗi, bạn biết chính xác nơi cần kiểm tra mà không làm dừng toàn bộ chuỗi.",
    },
    detailImages: [images(1), images(4), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-02-lay-ma-tu-ai",
    n: "02",
    title: "Yêu cầu AI tạo mã vận hành hệ thống",
    preparation: {
      manual: [
        "Mở phần Câu lệnh ở đầu trang và sao chép toàn bộ yêu cầu của Mô hình 2.",
        "Xác định loại API sẽ dùng để đặt đúng tên thuộc tính khóa.",
      ],
      automatic: ["ChatGPT hoặc Claude tạo mã Apps Script dựa trên cấu trúc gói 12 video và các điểm duyệt đã quy định."],
    },
    details: [
      "Trong Google Sheets, mở Tiện ích mở rộng → Apps Script để biết nơi mã sẽ được cài. Apps Script gắn trực tiếp với đúng bảng tính đang mở, không cần cài phần mềm riêng.",
      "Mở ChatGPT hoặc Claude, dán câu lệnh tổng và yêu cầu AI trả về mã hoàn chỉnh. Nếu dùng OpenAI, tên khóa trong mã và thuộc tính tệp phải là OPENAI_API_KEY; nếu dùng Claude, đổi sang ANTHROPIC_API_KEY.",
      "Đọc lại kết quả trước khi dùng: mã phải lấy bảng tính đang mở, tạo đúng các trang cần thiết và dừng ở những bước bắt buộc có con người duyệt.",
    ],
    callout: {
      title: "Có thể bắt đầu nửa tự động",
      text: "Nếu chưa quen API, hãy vận hành vài khách bằng Google Sheets kết hợp ChatGPT Project hoặc Claude Project. Chỉ nối API sau khi đầu vào, đầu ra và câu lệnh đã ổn định.",
    },
    detailImages: [images(2, 3), images(5, 6), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-03-dan-ma-apps-script",
    n: "03",
    title: "Mở Apps Script, dán mã và lưu dự án",
    preparation: {
      manual: ["Giữ Google Sheets trung tâm đang mở và đã sao chép đầy đủ mã do AI tạo."],
      automatic: ["Apps Script lưu mã trong dự án gắn với bảng tính hiện tại."],
    },
    details: [
      "Từ đúng Google Sheets trung tâm, chọn Tiện ích mở rộng → Apps Script. Nếu mở nhầm từ biểu mẫu hoặc tệp khác, menu vận hành sẽ không xuất hiện trong bảng tính cần dùng.",
      "Trong tệp mã, xóa nội dung mẫu, dán toàn bộ mã do AI tạo, đặt tên dự án và nhấn Lưu. Chỉ tiếp tục khi trình soạn thảo không còn báo lỗi cú pháp.",
    ],
    callout: {
      title: "Kiểm tra tệp đang liên kết",
      text: "Apps Script luôn gắn với một tệp cụ thể. Hãy quay lại đúng bảng tính trung tâm sau mỗi lần chạy để xem menu và kết quả.",
    },
    detailImages: [images(7), images(8)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-04-tao-va-luu-khoa-api",
    n: "04",
    title: "Tạo khóa API và lưu trong thuộc tính tệp",
    preparation: {
      manual: ["Tài khoản API đã có dự án và phương thức thanh toán phù hợp."],
      automatic: ["Apps Script đọc khóa từ Script Properties; khóa không xuất hiện trực tiếp trong mã nguồn."],
    },
    details: [
      "Trên OpenAI Platform, vào API Keys → Create new secret key, điền tên và dự án rồi tạo khóa. Sao chép khóa ngay khi hệ thống hiển thị vì bạn sẽ không xem lại toàn bộ khóa sau đó.",
      "Trong Apps Script, mở Cài đặt dự án bằng biểu tượng bánh răng, tìm Thuộc tính của tập lệnh và thêm thuộc tính OPENAI_API_KEY.",
      "Dán khóa vào ô Giá trị rồi lưu thuộc tính. Không dán khóa vào mã, ảnh chụp hoặc gửi khóa cho người khác.",
    ],
    callout: {
      title: "API tính phí riêng",
      text: "Gói ChatGPT trả phí không tự cấp số dư API. Hãy đặt giới hạn chi phí và theo dõi số lần chạy, nhất là lệnh tạo nhiều ý tưởng hoặc kịch bản.",
    },
    detailImages: [images(9), images(10), images(11)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-05-cap-quyen-va-nap-menu",
    n: "05",
    title: "Chạy onOpen, cấp quyền và nạp menu",
    preparation: {
      manual: ["Mã đã được lưu và tài khoản Google đang mở có quyền chỉnh sửa bảng tính."],
      automatic: ["Hàm onOpen tạo menu San xuat video trong Google Sheets."],
    },
    details: [
      "Trong trình chỉnh sửa Apps Script, chọn hàm onOpen rồi nhấn Chạy. Khi Google hiện cảnh báo ứng dụng chưa được xác minh, chọn tài khoản → Nâng cao → Đi tới dự án → Cho phép.",
      "Chờ Nhật ký thực thi báo Hoàn tất. Quay lại Google Sheets, nhấn F5 và kiểm tra menu San xuat video đã xuất hiện trên thanh menu.",
    ],
    callout: {
      title: "Chỉ cấp quyền cho dự án của bạn",
      text: "Màn hình cảnh báo là bước cấp quyền cho mã Apps Script chưa qua quy trình xác minh công khai. Hãy kiểm tra đúng tên dự án và đúng tài khoản trước khi cho phép.",
    },
    detailImages: [images(12), images(13)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-06-tao-khung-va-kiem-tra-api",
    n: "06",
    title: "Tạo khung trang tính và kiểm tra kết nối API",
    preparation: {
      manual: ["Menu San xuat video đã xuất hiện và khóa API đã được lưu đúng tên."],
      automatic: ["Hệ thống tạo các trang dữ liệu, tiêu đề cột, cấu hình và kiểm tra một yêu cầu API ngắn."],
    },
    details: [
      "Trong menu San xuat video, chạy mục tạo khung trang tính trước. Chờ thông báo hoàn tất rồi kiểm tra các tab dữ liệu đã được tạo ở cuối bảng tính.",
      "Mở trang CAU_HINH và rà lại tên gói, phạm vi sửa, mẫu thư, tiêu chuẩn và các câu lệnh nghiệp vụ. Trang này không chứa dữ liệu khách hàng.",
      "Chạy Kiểm tra kết nối API. Nếu hệ thống yêu cầu thêm quyền, tiếp tục theo luồng Nâng cao → Đi tới dự án → Cho phép; chỉ chuyển bước khi nhận thông báo kết nối thành công.",
    ],
    callout: {
      title: "Thứ tự bắt buộc",
      text: "Luôn tạo khung trước rồi mới chạy các mục khác. Nếu kết nối API thất bại, đọc nguyên văn lỗi, kiểm tra tên thuộc tính, số dư và tên mô hình trước khi thử lại.",
    },
    detailImages: [images(14, 15), images(16), images(17)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-07-tao-bieu-mau",
    n: "07",
    title: "Tạo và kiểm tra biểu mẫu nhận khách",
    preparation: {
      manual: ["Rà lại các câu hỏi cần thu: doanh nghiệp, dịch vụ, nhóm khách, vấn đề, bảng giá, bằng chứng, giới hạn cam kết và phong cách thương hiệu."],
      automatic: ["Apps Script tạo Google Form chuẩn, nối phản hồi về bảng tính và in ra liên kết gửi khách."],
    },
    details: [
      "Trong menu San xuat video, chạy Tạo biểu mẫu. Chờ hệ thống tạo xong và sao chép đường dẫn biểu mẫu được hiển thị.",
      "Mở liên kết, kiểm tra toàn bộ câu hỏi và gửi một hồ sơ thử. Biểu mẫu chuẩn được dùng chung cho nhiều khách; chỉ sửa khi cấu trúc gói dịch vụ thay đổi.",
      "Quay lại bảng tính và kiểm tra dữ liệu thử đã ghi vào KHACH_HANG. Mỗi khách phải nằm trên một dòng và có mã riêng để nối với thư mục Drive cùng các đầu ra sau này.",
    ],
    callout: {
      title: "Chuẩn hóa đầu vào",
      text: "Không cần tạo một Google Form riêng cho từng khách. Một biểu mẫu cố định giúp dữ liệu đồng nhất và giảm các trường hợp AI phải đoán cách hiểu thông tin.",
    },
    detailImages: [images(18), images(19, 20), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-08-tao-cay-thu-muc-drive",
    n: "08",
    title: "Tạo cây thư mục Drive cho khách hàng",
    preparation: {
      manual: ["KHACH_HANG đã có ít nhất một dòng hồ sơ; chọn đúng ô A trên dòng khách cần xử lý."],
      automatic: ["Hệ thống tạo thư mục theo mã khách, các thư mục con và ghi liên kết trở lại bảng tính."],
    },
    details: [
      "Chọn ô A2 hoặc ô cột A tại đúng dòng khách hàng. Mở San xuat video → 3. Tạo cây thư mục Drive.",
      "Chờ thông báo hoàn tất rồi cuộn sang cột LINK_DRIVE. Mở liên kết để xác nhận hệ thống đã tạo đúng thư mục của khách.",
      "Kiểm tra đủ năm thư mục con: 01_HO_SO, 02_KICH_BAN, 03_VIDEO_RAW, 04_VIDEO_FINAL và 05_CANH_AI. Dùng mã video nhất quán, ví dụ V03_RAW_01, V03_VEO_01, V03_SEED_01 và V03_FINAL.",
    ],
    callout: {
      title: "Một nguồn tệp duy nhất",
      text: "Google Sheets chỉ lưu trạng thái và liên kết; tư liệu thật, cảnh AI và video cuối nằm trong đúng cây thư mục của khách để AI, Apps Script và người dựng cùng dùng một nguồn.",
    },
    detailImages: [images(21), images(22, 23), images(24)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-09-kiem-tra-ho-so",
    n: "09",
    title: "Kiểm tra hồ sơ đầu vào trước khi tạo nội dung",
    preparation: {
      manual: ["Chọn đúng dòng khách, bảo đảm biểu mẫu, bảng giá và các bằng chứng được phép dùng đã có trong hồ sơ."],
      automatic: ["AI tóm tắt doanh nghiệp, liệt kê dữ liệu thiếu, đánh dấu nội dung chưa có bằng chứng và trả trạng thái hồ sơ."],
    },
    details: [
      "Vẫn ở dòng khách trong KHACH_HANG, chọn San xuat video → 4. Kiểm tra hồ sơ đầu vào. Chờ khoảng 10–20 giây để hệ thống gọi API.",
      "Mở trang HO_SO, đối chiếu phần tóm tắt, dữ liệu còn thiếu, nội dung không được dùng và trạng thái CAN_BO_SUNG hoặc DU_DU_LIEU. Không tiếp tục nếu bằng chứng quan trọng chưa rõ.",
    ],
    callout: {
      title: "Không để AI bịa bằng chứng",
      text: "Số liệu, thành tích, lời chứng thực, giá và cam kết chỉ được dùng khi có trong hồ sơ đã xác nhận. Thiếu dữ liệu phải ghi là thiếu, không suy đoán.",
    },
    detailImages: [images(25), images(26)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-10-tao-va-duyet-y-tuong",
    n: "10",
    title: "Tạo 20 góc nội dung và chọn 12 góc",
    preparation: {
      manual: ["Hồ sơ đã ở trạng thái đủ dữ liệu và bạn đang chọn đúng dòng khách trong KHACH_HANG."],
      automatic: ["AI tạo 20 phương án; Google Sheets lưu mỗi góc thành một dòng để con người DUYET hoặc LOAI."],
    },
    details: [
      "Chạy San xuat video → 6. Tạo 20 góc nội dung. Đây là lệnh API nặng, thường mất khoảng 30–60 giây; không bấm lặp trong khi đang chạy.",
      "Mở Y_TUONG và kiểm tra đủ 20 dòng, mã từ KH001_YT01 đến KH001_YT20. Mỗi dòng phải có vấn đề khách hàng, góc tiếp cận, câu mở đầu, luận điểm, bằng chứng cần dùng và lời kêu gọi.",
      "Kiểm tra cột TRANG_THAI_DUYET có danh sách DUYET/LOAI và cột CAN_XAC_NHAN đánh dấu những ý dùng chi tiết chưa được phép. Loại các góc trùng, mơ hồ hoặc không thể chứng minh.",
      "Chọn 12 góc phù hợp với sản phẩm, khách hàng và mục tiêu bán hàng. Có thể duyệt thử bốn góc trước để kiểm tra chất lượng toàn chuỗi rồi mới xử lý phần còn lại.",
    ],
    callout: {
      title: "AI đề xuất, con người quyết định",
      text: "AI không được tự chọn chủ đề giao cho khách. Sau khi bạn chốt danh sách, các bước tiếp theo chỉ dùng đúng những dòng đã đánh dấu DUYET.",
    },
    detailImages: [images(27), images(28, 29), images(30), images(31)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-11-viet-va-chinh-kich-ban",
    n: "11",
    title: "Viết kịch bản và chỉnh câu lệnh khi cần",
    preparation: {
      manual: ["Các ý tưởng cần viết đã được đánh dấu DUYET; giữ nguyên cấu trúc JSON khi sửa câu lệnh."],
      automatic: ["AI viết kịch bản cho tối đa bốn dòng đã duyệt trong mỗi lần chạy để tránh vượt giới hạn Apps Script."],
    },
    details: [
      "Quay về KHACH_HANG, chọn dòng khách rồi chạy 7. Viết kịch bản cho các dòng DUYET. Mỗi lần chỉ xử lý tối đa bốn kịch bản; lặp lại cho đến khi đủ danh sách cần viết.",
      "Mở KICH_BAN và đọc câu mở đầu, phần nói chính, lời kêu gọi, thời lượng và CAN_XAC_NHAN. Sửa mọi chi tiết liên quan đến giá, kết quả, cam kết hoặc thông điệp thương hiệu.",
      "Nếu bản viết chưa đúng mong muốn, mở CAU_HINH, tìm CAU_LENH_VIET_KICH_BAN và bổ sung yêu cầu về giọng, cấu trúc hoặc cách mở đầu. Phải giữ nguyên JSON: {\"chu_de\":\"\",\"hook\":\"\",\"than_kich_ban\":\"\",\"cta\":\"\",\"thoi_luong_giay\":0,\"can_xac_nhan\":\"\"}.",
      "Xóa kết quả cũ của dòng cần làm lại rồi chạy lại bước viết kịch bản. So sánh bản cũ và bản mới, chỉ chuyển bước khi nội dung đã đạt yêu cầu.",
    ],
    callout: {
      title: "Giới hạn thời gian chạy",
      text: "Apps Script có giới hạn thời lượng cho mỗi lần thực thi. Chia 12 kịch bản thành ba lần, mỗi lần tối đa bốn video, giúp tránh dừng giữa chừng.",
    },
    detailImages: [images(32), images(33), images(34), images(35, 36)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-12-tao-ke-hoach-hinh",
    n: "12",
    title: "Tạo kế hoạch hình cho từng kịch bản",
    preparation: {
      manual: ["Các kịch bản đã được đọc, sửa và duyệt; tư liệu thật của khách được đặt tên rõ ràng trong Drive."],
      automatic: ["AI chia lời thoại thành cảnh thật, cảnh Veo, cảnh Seedance và ghi chú dựng trong CapCut."],
    },
    details: [
      "Sau khi chốt kịch bản, chọn đúng dòng khách và chạy 8. Tạo kế hoạch hình ảnh.",
      "Mở KE_HOACH_HINH. Với từng đoạn lời nói, kiểm tra loại cảnh, câu lệnh tạo cảnh, chữ trên màn hình, tài liệu tham chiếu và ghi chú CapCut.",
      "Đánh dấu CANH_THAT cho người đại diện, sản phẩm, cơ sở, kết quả và bằng chứng thật; CANH_VEO cho cảnh minh họa ngắn cần độ chân thực; CANH_SEEDANCE cho đoạn nhiều cảnh hoặc chuyển động phức tạp.",
    ],
    callout: {
      title: "Chốt loại cảnh trước khi dựng",
      text: "Phân loại ngay khi kịch bản được duyệt để người dựng không phải đọc lại toàn bộ nội dung và quyết định công cụ trong lúc đang làm video.",
    },
    detailImages: [images(37), images(38), images(39)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-13-tao-canh-va-dung-video",
    n: "13",
    title: "Tạo cảnh bằng Veo, Seedance và dựng trong CapCut",
    preparation: {
      manual: ["Video thô, ảnh thật, logo, kịch bản và kế hoạch hình đã nằm đúng thư mục theo mã video."],
      automatic: ["Veo hoặc Seedance tạo cảnh minh họa; CapCut hỗ trợ cắt thô và tạo phụ đề tự động."],
    },
    details: [
      "Dùng Gemini/Veo 3.1 cho cảnh dọc 9:16 ngắn khoảng 4–8 giây cần hình ảnh chân thực. Khi cần giữ chủ thể hoặc phong cách, đưa hình tham chiếu đã được khách cho phép thay vì chỉ mô tả bằng chữ.",
      "Dùng Seedance 2.0 cho đoạn dài hơn có nhiều cảnh, chuyển động phức tạp hoặc cần bám theo nhiều tài liệu tham chiếu. Kiểm tra kỹ bàn tay, chữ, logo, sản phẩm và bối cảnh trước khi đưa vào video bán hàng.",
      "Trong CapCut, nhập video khách quay, cảnh Veo và cảnh Seedance vào cùng dự án. Sắp dòng thời gian theo kịch bản; dùng Auto Cut cho bản cắt đầu và Auto Captions cho phụ đề, sau đó tự sửa điểm cắt, tên riêng, giá, thuật ngữ, logo, màu và lời kêu gọi.",
      "Không dùng AI để thay ảnh trước–sau, lời chứng thực, sản phẩm, bảng giá, cơ sở, chứng chỉ, kết quả khách hàng hoặc số liệu kinh doanh thật. Nếu một cảnh có thể khiến người xem hiểu sai, thay bằng tư liệu thật hoặc bỏ cảnh.",
    ],
    callout: {
      title: "Dùng một mẫu dựng chung cho cả gói",
      text: "Quy định trước logo, phông chữ, vị trí phụ đề, cách mở đầu và kết thúc. Đổi hiệu ứng hoặc bố cục cho từng video sẽ làm mất tính lặp lại của gói dịch vụ.",
    },
    detailImages: [[], [], [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-14-qc-ai-va-duyet-cuoi",
    n: "14",
    title: "Dùng AI kiểm tra bản dựng và tự duyệt lần cuối",
    preparation: {
      manual: ["Các video đã xuất bản cuối; có bản chép lời hoặc phụ đề và tiêu chuẩn QC đã thống nhất."],
      automatic: ["ChatGPT hoặc Claude so sánh câu chữ; Gemini đọc cả hình và tiếng, trả các vị trí cần xem lại theo mốc thời gian."],
    },
    details: [
      "Chạy mục 9 để ghi kết quả QC vào SAN_XUAT. Kiểm tra từng video có đúng mã, đúng tệp và các cột QC_AI, mốc thời gian cần sửa cùng trạng thái duyệt cuối.",
      "Đưa video cuối vào Gemini và yêu cầu kiểm tra sáu nhóm: nội dung khác bản duyệt, phụ đề sai, hình không liên quan, chữ hoặc logo che phần quan trọng, âm thanh khó nghe và cảnh AI dễ bị hiểu là bằng chứng thật.",
      "Mở đúng các mốc thời gian được đánh dấu trong CapCut, sửa rồi tự xem toàn bộ video về hình ảnh, âm thanh và ngữ cảnh. AI chỉ kiểm tra trước; chỉ bạn mới được chuyển DUYET_CUOI sang trạng thái sẵn sàng gửi.",
    ],
    callout: {
      title: "Hai lớp kiểm tra",
      text: "AI giúp tìm vị trí có khả năng lỗi; con người chịu trách nhiệm duyệt nội dung cuối có thể ảnh hưởng đến uy tín khách hàng.",
    },
    detailImages: [images(40), [], []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-15-ban-giao-qua-email",
    n: "15",
    title: "Bàn giao video qua Gmail",
    preparation: {
      manual: ["Đúng số video đã nằm trong thư mục 04_VIDEO_FINAL và trạng thái DUYET_CUOI đã được chọn."],
      automatic: ["Apps Script lấy liên kết Drive, ghép email mẫu, gửi Gmail, ghi ngày giao và chuyển hồ sơ sang chờ phản hồi."],
    },
    details: [
      "Chọn đúng dòng khách và chạy chức năng bàn giao qua Email. Hệ thống phải dừng nếu chưa đủ số video của đợt hoặc chưa có trạng thái duyệt cuối.",
      "Mở Gmail đã gửi, kiểm tra người nhận, tiêu đề có mã khách và mã đợt giao, liên kết thư mục video, phạm vi vòng sửa, thời hạn phản hồi và các nội dung bắt buộc.",
      "Xác nhận thư đã gửi đúng một lần. Sau khi gửi thành công, bảng tính phải có NGAY_GIAO và TRANG_THAI chuyển sang CHO_PHAN_HOI để ngăn gửi trùng.",
    ],
    callout: {
      title: "Không gửi bộ chưa đủ",
      text: "Hàm bàn giao phải đếm tệp thực tế trước khi gửi. Nếu thiếu video, hệ thống ghi cảnh báo trong Google Sheets thay vì gửi một bộ không hoàn chỉnh.",
    },
    detailImages: [images(41), images(42, 43), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-16-doc-va-phan-loai-phan-hoi",
    n: "16",
    title: "Đọc thư phản hồi và phân loại yêu cầu sửa",
    preparation: {
      manual: ["Giữ nguyên mã khách trong tiêu đề chuỗi thư và chờ thư phản hồi xuất hiện trong Gmail."],
      automatic: ["Apps Script tìm thư mới, AI phân loại yêu cầu và ghi kết quả về PHAN_HOI; hệ thống không tự trả lời khách."],
    },
    details: [
      "Trả lời thử ngay trong chuỗi thư bàn giao để kiểm tra luồng. Nội dung nên có cả một yêu cầu thuộc vòng sửa và một yêu cầu có khả năng phát sinh.",
      "Chờ khoảng một phút, về Google Sheets và chạy 11. Đọc thư phản hồi và phân loại. Mở PHAN_HOI, kiểm tra nội dung gốc, YEU_CAU_SUA, PHAN_LOAI, lý do và CAN_NGUOI_QUYET_DINH.",
      "Đối chiếu từng yêu cầu với phạm vi gói: lỗi của bên cung cấp là LOI_CUNG_CAP; thay đổi trong vòng đã mua là TRONG_VONG_SUA; đổi định vị hoặc vượt phạm vi là PHAT_SINH. Bạn quyết định cách trả lời và báo giá, không để AI tự cam kết.",
    ],
    callout: {
      title: "Mỗi yêu cầu nên là một dòng",
      text: "Nếu mã hiện tại ghi cả thư thành một dòng và chỉ chọn một nhãn, hãy siết câu lệnh hoặc nâng cấp mã để tách từng yêu cầu. Một thư có thể đồng thời chứa nhiều loại yêu cầu.",
    },
    detailImages: [images(44), images(45), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-17-tao-ma-dashboard",
    n: "17",
    title: "Yêu cầu AI tạo giao diện Dashboard",
    preparation: {
      manual: ["Chuỗi xử lý trên Google Sheets đã chạy ổn định từ nhận khách đến phản hồi."],
      automatic: ["AI tạo một tệp HTML cho giao diện và một tệp .gs cho máy chủ đọc/ghi dữ liệu trong bảng tính."],
    },
    details: [
      "Đọc mẫu Dashboard: bốn chặng, số hồ sơ ở từng chặng, hai chặng cần quyết định được làm nổi bật và mỗi khách hiển thị thành thẻ có việc tiếp theo cùng nút thao tác.",
      "Tiếp tục cuộc trò chuyện với ChatGPT hoặc Claude, dán câu lệnh tạo bảng điều phối và yêu cầu trả về đúng hai tệp: Bảng điều khiển dạng HTML và mã máy chủ dạng .gs.",
      "Kiểm tra mã không tạo bảng tính mới, đọc đúng bảng tính đang mở, không lưu bản sao dữ liệu riêng và có hộp xác nhận trước thao tác gửi thư cho khách.",
    ],
    callout: {
      title: "Dashboard chỉ là lớp hiển thị",
      text: "Dữ liệu gốc vẫn nằm trong Google Sheets. Chỉ dựng Dashboard sau khi quy trình nền ổn định để lỗi nghiệp vụ không bị che bởi giao diện.",
    },
    detailImages: [images(46), images(47, 48), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m2-18-tao-tep-dashboard-webapp",
    n: "18",
    title: "Tạo tệp Dashboard, thêm menu và chạy thử",
    preparation: {
      manual: ["Đã có trọn vẹn mã HTML và mã máy chủ .gs do AI tạo; dự án Apps Script hiện tại đã được lưu."],
      automatic: ["Apps Script mở Dashboard bằng HtmlService và ghi mọi thao tác trở lại Google Sheets trung tâm."],
    },
    details: [
      "Trong Apps Script, tại mục Tệp bên trái bấm dấu cộng → HTML, đặt tên Bảng điều khiển. Xóa nội dung mẫu, dán mã HTML do AI tạo và lưu.",
      "Bấm dấu cộng → Tập lệnh, đặt tên WebApp. Dán mã máy chủ .gs và lưu; không dùng lại tên của tệp HTML vì Apps Script không cho hai tệp trùng tên.",
      "Mở Mã.gs, tìm dòng .addItem('11. Đọc thư phản hồi và phân loại', 'docThuPhanHoi'). Ngay sau đó thêm .addItem('Mở bảng điều khiển', 'moBangDieuKhien'), rồi nhấn Ctrl+S → Chạy và cấp quyền nâng cao nếu được hỏi.",
      "Quay lại bảng tính, nhấn F5 rồi chọn San xuat video → Mở bảng điều khiển. Lần đầu có thể phải cấp thêm quyền cho HtmlService.",
      "Kiểm tra Dashboard hiển thị đúng số hồ sơ, mã khách, chặng hiện tại, thanh tiến độ, việc tiếp theo và nút thao tác. Thử một nút không gây gửi dữ liệu ra ngoài để xác nhận kết quả được ghi trở lại đúng dòng trong Google Sheets.",
    ],
    callout: {
      title: "Hoàn tất chu trình",
      text: "Dashboard giúp một người nhìn tập trung các hồ sơ đang mắc ở đâu và không bỏ sót khách; nó không thay đổi các điểm duyệt hay tự quyết định thay người vận hành.",
    },
    detailImages: [images(49, 50), images(51, 52), images(53), images(54), images(55)],
    calloutImages: [],
    showVideo: false,
  },
];
