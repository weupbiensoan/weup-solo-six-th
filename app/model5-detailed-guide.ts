export type Model5DetailedGuideStep = {
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
  numbers.map((number) => `m5-ch7-${String(number).padStart(3, "0")}.png`);

/**
 * Detailed implementation guide extracted from “Mô hình 5 - Chương 7.docx”.
 * All 78 illustrations and screenshots remain in the same order as the source document.
 */
export const model5DetailedGuide: Model5DetailedGuideStep[] = [
  {
    id: "m5-01-hieu-mo-hinh-doi-tac",
    n: "01",
    title: "Hiểu mô hình một người điều phối mạng lưới đối tác",
    preparation: {
      manual: [
        "Chọn một nhóm sản phẩm vật lý cụ thể để dùng xuyên suốt khi thực hành.",
        "Ghi rõ phần việc người kinh doanh giữ quyền quyết định và phần việc sẽ giao cho đối tác.",
      ],
      automatic: ["Chưa tự động hóa ở chặng này; mục tiêu là hiểu đúng vai trò trước khi dựng hệ thống."],
    },
    details: [
      "Quan sát ví dụ Bộ sắp xếp và vệ sinh bàn làm việc 5 món: người kinh doanh quyết định sản phẩm, thương hiệu, giá và tiêu chuẩn; nhà sản xuất, đơn vị đóng gói, kho thuê ngoài và đơn vị vận chuyển thực hiện phần việc vật lý.",
      "Đối chiếu với ví dụ Bộ phụ kiện du lịch 4 món để thấy người kinh doanh không cần sở hữu xưởng nhưng vẫn phải chốt kích thước, chất liệu, màu sắc, mẫu chuẩn và cách đóng thành bộ.",
      "Dùng sơ đồ mạng lưới làm bản đồ trách nhiệm: nhà sản xuất làm hàng; AI và phần mềm hỗ trợ dữ liệu; kho và đơn vị giao hàng xử lý đơn; dịch vụ kế toán hỗ trợ đối soát; người kinh doanh giữ sản phẩm, dữ liệu, tiền và mọi quyết định ngoại lệ.",
    ],
    callout: {
      title: "Một người không có nghĩa là tự làm mọi việc",
      text: "Mô hình chỉ vận hành tốt khi quyền quyết định, dữ liệu và điểm kiểm soát được giữ ở trung tâm, còn từng đối tác có đầu vào, đầu ra và tiêu chuẩn bàn giao rõ ràng.",
    },
    detailImages: [images(1), images(2), images(3)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-02-tao-tep-trung-tam",
    n: "02",
    title: "Tạo Google Sheets trung tâm cho toàn bộ vận hành",
    preparation: {
      manual: ["Một tài khoản Google có quyền dùng Sheets, Apps Script, Drive, Gmail và Forms."],
      automatic: ["Sau khi chạy mã, hệ thống sẽ dựng các trang dữ liệu, menu và quy tắc vận hành trong chính tệp này."],
    },
    details: [
      "Tạo một Google Sheets mới, đặt tên VAN_HANH_TMDT và để trống. Không tự tạo trang tính hoặc gõ tên cột vì hàm khởi tạo sẽ sinh toàn bộ cấu trúc cần thiết.",
      "Dùng duy nhất tệp này cho cả chương, từ dữ liệu nhu cầu, sản phẩm, nhà cung cấp và tồn kho đến đơn hàng, hỗ trợ, lợi nhuận và đối soát.",
    ],
    callout: {
      title: "Không dựng cột bằng tay",
      text: "Các hàm tìm dữ liệu theo đúng tên tiêu đề. Việc tự đổi tên cột hoặc tạo trang sai tên có thể làm các bước sau không tìm thấy dữ liệu.",
    },
    detailImages: [images(4), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-03-mo-apps-script-va-dan-ma",
    n: "03",
    title: "Mở Apps Script từ đúng bảng tính và dán đủ các tệp mã",
    preparation: {
      manual: ["Tải đủ các tệp mã ở Phần 02 trên trang này trước khi mở Apps Script."],
      automatic: ["Dự án Apps Script gắn với bảng tính đang mở và sử dụng tệp HTML để hiển thị bảng điều khiển."],
    },
    details: [
      "Trong chính tệp VAN_HANH_TMDT, chọn Tiện ích mở rộng → Apps Script. Không tạo một dự án Apps Script độc lập ở nơi khác.",
      "Mở nội dung mã đã chuẩn bị. Trong Code.gs hoặc Mã.gs, xóa mã mẫu rồi dán toàn bộ Ma.gs; sau đó tạo tệp HTML tên bang_dieu_khien, không gõ thêm đuôi .html, và dán mã giao diện.",
      "Đối chiếu tên bang_dieu_khien với tên được gọi trong createHtmlOutputFromFile. Nhấn Ctrl+S và kiểm tra mọi tệp cần dùng đều nằm trong cùng dự án.",
    ],
    callout: {
      title: "Tên tệp phải khớp tuyệt đối",
      text: "Chỉ cần lệch một ký tự giữa tên tệp HTML và tên mà mã gọi là bảng điều khiển sẽ báo không tìm thấy tệp.",
    },
    detailImages: [images(5), images(6), images(7)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-04-tao-va-luu-khoa-api",
    n: "04",
    title: "Tạo khóa API và lưu an toàn trong Script Properties",
    preparation: {
      manual: ["Tài khoản API đã có phương thức thanh toán hoặc số dư phù hợp."],
      automatic: ["Apps Script đọc khóa từ Script Properties bằng đúng tên KHOA_API."],
    },
    details: [
      "Vào trang quản trị của nhà cung cấp AI, tạo khóa mới và sao chép ngay khi khóa xuất hiện vì giá trị đầy đủ chỉ được hiển thị một lần.",
      "Quay lại Apps Script → Cài đặt dự án → Thuộc tính của tập lệnh, tạo thuộc tính KHOA_API và dán khóa vào ô Giá trị. Không ghi khóa trong mã, CAU_HINH hoặc một ô bảng tính.",
    ],
    callout: {
      title: "Ảnh minh họa đã được che khóa",
      text: "Hai ảnh trên trang chỉ cho thấy vị trí thao tác; chuỗi khóa thật đã được che kín trước khi xuất bản. Nếu khóa trong tài liệu từng được sử dụng, nên thu hồi và tạo khóa mới.",
    },
    detailImages: [images(8), images(9)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-05-cap-quyen-va-tao-khung",
    n: "05",
    title: "Cấp quyền lần đầu, tạo khung dữ liệu và nạp menu",
    preparation: {
      manual: ["Mã đã được dán và lưu trong dự án Apps Script gắn với VAN_HANH_TMDT."],
      automatic: ["Hệ thống tạo 12 trang tính, hàng tiêu đề, danh sách xổ, công thức và menu Van hanh don hang."],
    },
    details: [
      "Trên thanh công cụ Apps Script, chọn hàm khoiTaoBangTinh rồi bấm Chạy. Nếu Google cảnh báo ứng dụng chưa được xác minh, chọn đúng tài khoản, bấm Nâng cao → Đi tới dự án → Cho phép.",
      "Quay lại Google Sheets, nhấn F5 và kiểm tra menu Van hanh don hang cùng 12 trang CAU_HINH, SAN_PHAM, KIEM_TRA_SP, DU_LIEU_THO, NHA_CUNG_CAP, TON_KHO, DON_HANG, HOAN_HUY, DOI_SOAT, NOI_DUNG, LOI_NHUAN_DON và CANH_BAO.",
    ],
    callout: {
      title: "Chạy hàm khởi tạo, không chạy onOpen để thử",
      text: "onOpen chỉ có nhiệm vụ nạp menu khi bảng tính được mở lại. Hàm khoiTaoBangTinh mới là điểm bắt đầu tạo khung dữ liệu.",
    },
    detailImages: [images(10), images(11)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-06-dien-cau-hinh-va-kiem-tra-api",
    n: "06",
    title: "Điền cấu hình kinh doanh, tạo cây thư mục và kiểm tra API",
    preparation: {
      manual: [
        "Chuẩn bị tên thương hiệu, mã hàng, giá bán, model AI, email vận hành, thời gian sản xuất và tồn an toàn.",
        "Các tỷ lệ phí chưa chắc chắn phải được ghi rõ là ước lượng trong cột GHI_CHU.",
      ],
      automatic: ["Mã tạo cây thư mục Drive, lưu ID vào CAU_HINH và chẩn đoán kết nối API."],
    },
    details: [
      "Mở CAU_HINH và chỉ điền cột GIA_TRI cho các thông tin kinh doanh. Không gõ vào các ô ID thư mục hoặc LINK_FORM_NHU_CAU vì hệ thống sẽ tự điền.",
      "Chạy Tao cay thu muc. Kiểm tra Drive có thư mục gốc VAN_HANH_TMDT và các thư mục con NAP_DU_LIEU, NAP_DON, HO_SO_NCC; các ID tương ứng phải xuất hiện trong CAU_HINH.",
      "Chạy Kiem tra ket noi API. Lỗi 401 thường là khóa sai; 429 kèm insufficient quota là tài khoản chưa đủ hạn mức; 404 thường do tên model trong CAU_HINH không đúng.",
    ],
    callout: {
      title: "Giữ đúng thứ tự",
      text: "Tạo khung trang tính trước, tạo cây thư mục sau, rồi mới kiểm tra API. Làm ngược thứ tự dễ gây lỗi không tìm thấy trang hoặc giá trị cấu hình.",
    },
    detailImages: [images(12), images(13), images(14)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-07-tao-bieu-mau-trigger-dashboard",
    n: "07",
    title: "Tạo biểu mẫu, đặt trình kích hoạt và mở bảng điều khiển",
    preparation: {
      manual: ["Khung dữ liệu, cây thư mục và kết nối API đã hoạt động."],
      automatic: ["Hệ thống tạo Google Form, trang RAW_NHU_CAU, lịch chạy và bảng điều khiển trạng thái."],
    },
    details: [
      "Chạy 1. Tao bieu mau thu du lieu. Hệ thống tạo Google Form bốn câu hỏi, nối phản hồi về tệp, sinh RAW_NHU_CAU và lưu liên kết biểu mẫu vào CAU_HINH.",
      "Mở CAU_HINH và xác nhận LINK_FORM_NHU_CAU cùng ID biểu mẫu đã được điền tự động; không thay thế các giá trị này bằng liên kết gõ tay.",
      "Chạy Dat trinh kich hoat sau khi biểu mẫu đã tồn tại. Mở biểu tượng đồng hồ trong Apps Script và đối chiếu đủ lịch theo thời gian cùng trình kích hoạt biểu mẫu, không có bản trùng.",
      "Chạy Mo bang dieu khien ngay cả khi chưa có dữ liệu. Dùng các khối trạng thái và mục Việc tiếp theo làm bản đồ cho 14 chức năng nghiệp vụ.",
    ],
    callout: {
      title: "Chạy lại không được tạo trigger trùng",
      text: "Hàm đặt lịch phải xóa bộ trigger cũ do hệ thống quản lý rồi tạo lại. Nếu một tác vụ xuất hiện nhiều lần, cần xử lý trước khi dùng dữ liệu thật.",
    },
    detailImages: [images(15), images(16), images(17), images(18)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-08-thu-du-lieu-nhu-cau",
    n: "08",
    title: "Thu dữ liệu nhu cầu từ nguồn được phép và nạp CSV",
    preparation: {
      manual: [
        "Ưu tiên dữ liệu từ gian hàng, trang, video hoặc biểu mẫu của chính mình.",
        "Nếu dùng CSV, tải tệp vào đúng thư mục NAP_DU_LIEU.",
      ],
      automatic: ["Hệ thống nạp dữ liệu mới, giữ câu nguyên văn, gắn nguồn và tạo mã chống trùng."],
    },
    details: [
      "Dùng bốn nguồn an toàn: đánh giá và câu hỏi trên gian hàng của mình; CSV xuất từ trang quản trị người bán; bình luận dưới video của mình; câu trả lời biểu mẫu do khách tự điền. Google Trends và công cụ từ khóa chính thức chỉ là nguồn tham chiếu.",
      "Đường thứ nhất là Google Form đã tạo. Mỗi dòng phải giữ nguyên câu khách ở NGUYEN_VAN và có NGUON, LOAI_NGUON để truy lại được.",
      "Đường thứ hai là CSV: tải tệp vào Drive → VAN_HANH_TMDT → NAP_DU_LIEU, chạy 2. Nap du lieu nhu cau, rồi kiểm tra DU_LIEU_THO có dòng mới, đúng loại nguồn và không bị nạp lại ở lần sau.",
    ],
    callout: {
      title: "Không cào dữ liệu của gian hàng khác",
      text: "Dữ liệu thu trái điều khoản nền tảng vừa tạo rủi ro, vừa không thay thế được bằng chứng khách sẵn sàng thanh toán cho sản phẩm của bạn.",
    },
    detailImages: [images(19), images(20), images(21)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-09-phan-nhom-va-duyet-nhu-cau",
    n: "09",
    title: "Phân nhóm nhu cầu bằng AI rồi duyệt bằng người thật",
    preparation: {
      manual: ["DU_LIEU_THO đã có dữ liệu nguyên văn, nguồn và loại nguồn rõ ràng."],
      automatic: ["AI xóa thông tin liên hệ trước khi xử lý theo lô và ghi kết quả vào NHOM_AI."],
    },
    details: [
      "Chạy 3. Phan nhom nhu cau. Đây là lần gọi API trong luồng thật; hệ thống phải báo số dòng đã gán nhóm và phần dữ liệu còn lại nếu có.",
      "Mở DU_LIEU_THO, kiểm tra AI chỉ gom các câu đã cung cấp và không bịa thêm nhu cầu. Các nhóm cần tách rõ vấn đề sản phẩm khỏi giao hàng và chăm sóc khách hàng.",
      "Đọc lại từng nhóm, sửa khi cần rồi sao chép nhóm được chấp nhận sang NHOM_DA_DUYET. Không chuyển sang bản yêu cầu sản phẩm khi cột duyệt còn trống.",
    ],
    callout: {
      title: "AI không chứng minh khách sẽ mua",
      text: "Kết quả phân nhóm chỉ giúp nhìn mẫu dữ liệu. Trước khi bỏ tiền vào lô hàng vẫn cần phỏng vấn, phản ứng với mẫu thật và tín hiệu thanh toán hoặc đặt cọc ở mức giá dự kiến.",
    },
    detailImages: [images(22), images(23), images(24)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-10-kiem-tra-dau-ra-noi-dung-mau",
    n: "10",
    title: "Kiểm tra cấu trúc ba đầu ra nội dung trong bộ dữ liệu mẫu",
    preparation: {
      manual: ["Chỉ thực hiện với dữ liệu mẫu hoặc thông tin sản phẩm đã được người kinh doanh xác nhận."],
      automatic: ["Hệ thống tạo ba loại bản nháp trong NOI_DUNG để kiểm tra luồng."],
    },
    details: [
      "Từ menu Van hanh don hang, chạy 7. Tao noi dung ban hang. Thông báo hoàn tất phải cho biết ba dòng đã được ghi vào NOI_DUNG.",
      "Kiểm tra thông báo và mở trang NOI_DUNG; không sử dụng ngay các bản nháp chỉ vì hàm đã chạy thành công.",
      "Đối chiếu dòng MO_TA_SAN_PHAM: nội dung phải bám vào thông tin nguồn và không tự thêm công dụng, kích thước, vật liệu hoặc cam kết.",
      "Đối chiếu dòng CAU_HOI_THUONG_GAP: câu trả lời chưa đủ dữ liệu phải chỉ rõ cần xác nhận, không suy đoán chính sách.",
      "Đối chiếu dòng KICH_BAN_VIDEO: mọi tuyên bố phải truy được về dữ liệu đã duyệt. Chặng 14 sẽ hướng dẫn điều kiện phát hành nội dung chính thức sau khi có mẫu thật.",
    ],
    callout: {
      title: "Bản nháp chỉ dùng để kiểm tra luồng",
      text: "Không phát hành nội dung từ dữ liệu chưa duyệt hoặc hình ý tưởng. Thông tin và mẫu sản phẩm thật mới là nguồn chính thức.",
    },
    detailImages: [images(25), images(26), images(27), images(28), images(29)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-11-tao-ban-yeu-cau-san-pham",
    n: "11",
    title: "Chuyển nhu cầu đã duyệt thành bản yêu cầu sản phẩm",
    preparation: {
      manual: ["NHOM_DA_DUYET đã có dữ liệu và người kinh doanh đã chốt giới hạn kinh doanh cơ bản."],
      automatic: ["AI tạo bản YEU_CAU_SP gồm khách hàng, tình huống sử dụng, cấu hình và giới hạn cần kiểm soát."],
    },
    details: [
      "Chạy 4. Tao ban yeu cau san pham từ menu hoặc bảng điều khiển. Hệ thống ghi một dòng NOI_DUNG có LOAI = YEU_CAU_SP.",
      "Đọc thông báo kết quả và xác nhận bản mới ở trạng thái BAN_AI; chưa gửi bản này cho nhà sản xuất.",
      "Mở ô NOI_DUNG và đọc đủ ba phần: khách hàng cùng tình huống sử dụng; cấu hình sản phẩm; giới hạn kinh doanh. Tìm toàn bộ chỗ CAN_XAC_NHAN.",
      "Thay từng CAN_XAC_NHAN bằng quyết định hoặc dữ liệu thật về thành phần, kích thước, vật liệu, bao bì, giá mục tiêu, giá vốn tối đa và tiêu chí kiểm mẫu.",
      "Đọc lại lần cuối rồi đổi TRANG_THAI thành DA_DUYET. Khi thay đổi cấu hình sau này, dùng mục 4b để tạo phiên bản mới, không ghi đè bản cũ.",
    ],
    callout: {
      title: "Không để AI đoán yêu cầu sản xuất",
      text: "Bất kỳ ô chưa xác nhận nào cũng có thể trở thành chỉ dẫn mà nhà sản xuất làm theo. Chỉ bản đã được người kinh doanh duyệt mới được dùng ở bước báo giá và kiểm mẫu.",
    },
    detailImages: [images(30), images(31), images(32), images(33), images(34)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-12-lap-ho-so-va-gui-bao-gia",
    n: "12",
    title: "Lập hồ sơ nhà cung cấp và gửi yêu cầu lấy báo giá",
    preparation: {
      manual: [
        "Bản YEU_CAU_SP đã ở trạng thái DA_DUYET.",
        "Chuẩn bị ít nhất một nguồn chính và một nguồn dự phòng có email liên hệ.",
      ],
      automatic: ["Hệ thống tạo PDF có phiên bản, lưu vào HO_SO_NCC và gửi cho nhà cung cấp chưa nhận yêu cầu."],
    },
    details: [
      "Mở NHA_CUNG_CAP, điền mã, tên, hạng mục, người liên hệ và email cho từng nhà cung cấp. Chưa có báo giá thì để trống các cột kết quả.",
      "Cuộn đến cột VAI_TRO và chọn CHINH cho nguồn chính, DU_PHONG cho nguồn thay thế. Không phụ thuộc hoàn toàn vào một nhà cung cấp khi tăng sản lượng.",
      "Chạy 5. Gui yeu cau lay bao gia. Kiểm tra thông báo nêu tên PDF, thư mục lưu và số người nhận.",
      "Mở Gmail Đã gửi, đối chiếu đúng người nhận, tiêu đề, mã hàng, phiên bản và tệp PDF đính kèm.",
      "Mở tệp PDF trong HO_SO_NCC và kiểm tra nội dung đúng bản đã duyệt. Khi có phiên bản mới, dùng 4b và 5b theo chủ đích để không gửi nhầm hoặc gửi trùng.",
    ],
    callout: {
      title: "AI không chọn nhà cung cấp",
      text: "AI có thể xếp báo giá vào bảng, nhưng quyết định chọn đối tác, số lượng, hợp đồng, lịch thanh toán và phương án dự phòng vẫn thuộc người kinh doanh.",
    },
    detailImages: [images(35), images(36), images(37), images(38), images(39)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-13-kiem-mau-va-khoa-chuan",
    n: "13",
    title: "Tạo danh sách kiểm, kiểm mẫu thật và khóa mẫu chuẩn",
    preparation: {
      manual: ["Có bản YEU_CAU_SP đã duyệt và mẫu vật lý do nhà cung cấp gửi."],
      automatic: ["Hệ thống tạo DANH_SACH_KIEM_MAU và rút thông tin kỹ thuật sang SAN_PHAM."],
    },
    details: [
      "Chạy 6. Tao danh sach kiem mau. Hàm chỉ đọc dòng YEU_CAU_SP có TRANG_THAI = DA_DUYET.",
      "Đọc thông báo xác nhận dữ liệu đã được ghi vào NOI_DUNG; mở trang này ngay sau khi chạy.",
      "Kiểm tra có dòng LOAI = DANH_SACH_KIEM_MAU với tiêu chí, cách đo hoặc kiểm và ngưỡng chấp nhận rõ ràng.",
      "Với mẫu thật, đối chiếu thành phần, kích thước, trọng lượng, bề mặt, bao bì và tình huống sử dụng. Chụp, đặt mã lỗi và lưu mẫu chuẩn; chỉ đổi TRANG_THAI_MAU thành DA_DUYET khi đạt, để hệ thống ghi NGAY_DUYET_MAU.",
    ],
    callout: {
      title: "AI không duyệt chất lượng",
      text: "Cảm giác cầm, độ bền, an toàn, mức chấp nhận vật liệu và quyết định duyệt mẫu phải do người thật thực hiện. Không đặt lô khi chưa có mẫu chuẩn và ảnh lưu kèm.",
    },
    detailImages: [images(40), images(41), images(42), images(43)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-14-tao-noi-dung-tu-san-pham-da-duyet",
    n: "14",
    title: "Tạo nội dung bán hàng từ sản phẩm đã duyệt",
    preparation: {
      manual: ["Thông tin sản phẩm và mẫu thật đã được duyệt, ảnh thật đã sẵn sàng."],
      automatic: ["AI tạo mô tả, câu hỏi thường gặp và kịch bản video dưới dạng bản nháp."],
    },
    details: [
      "Chạy 7. Tao noi dung ban hang. Hệ thống phải báo đã ghi ba dòng vào NOI_DUNG và nhắc người dùng kiểm tra trước khi sử dụng.",
      "Đọc bản MO_TA_SAN_PHAM và đối chiếu công dụng, kích thước, giá cùng chính sách với dữ liệu đã duyệt.",
      "Đọc CAU_HOI_THUONG_GAP, sửa các câu trả lời có thể tạo lời hứa sai hoặc chưa được chính sách xác nhận.",
      "Đọc KICH_BAN_VIDEO và thay mọi hình ý tưởng bằng sản phẩm thật. Phân biệt ảnh thật, cảnh AI minh họa và đồ họa chữ; không làm sản phẩm trông lớn hơn, bóng hơn hoặc có thêm thành phần.",
    ],
    callout: {
      title: "Điều kiện phát hành",
      text: "Mọi tuyên bố phải truy được về thông tin đã duyệt; ảnh sản phẩm thật phải thay hết hình ý tưởng; số phiên bản của trang bán hàng, video và bộ câu hỏi thường gặp phải khớp nhau.",
    },
    detailImages: [images(44), images(45), images(46), images(47)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-15-chon-kenh-va-nhap-don-mau",
    n: "15",
    title: "Chọn kênh bán, điền phí và nhập đơn mẫu",
    preparation: {
      manual: [
        "Chọn một kênh bán đầu tiên và tra biểu phí thật trong trang quản trị.",
        "Chuẩn bị CSV đơn hàng mẫu bằng dữ liệu của chính người kinh doanh.",
      ],
      automatic: ["Hệ thống nạp CSV, chống trùng MA_DON và giữ các trường mã cùng số điện thoại ở dạng văn bản."],
    },
    details: [
      "Trong CAU_HINH, điền KENH_CHINH, TY_LE_PHI_NEN_TANG, TY_LE_PHI_THANH_TOAN và HO_TRO_VAN_CHUYEN. Gõ 9 thay vì 9%, gõ 15000 thay vì 15.000đ; số ước lượng phải được ghi chú.",
      "Xuất CSV đơn hàng mẫu, đặt tệp trong NAP_DON và kiểm tra tên tệp, cấu trúc cột cùng dữ liệu thử trước khi nạp.",
      "Chạy 8. Nhap don hang. Thông báo phải nêu số dòng đã nạp và số dòng bị bỏ qua do trùng hoặc lỗi.",
      "Mở DON_HANG, đối chiếu số dòng kỳ vọng, mã đơn không trùng và các cột ngày, kênh, mã hàng, số lượng, tiền khách trả, họ tên, số điện thoại, địa chỉ đều đúng.",
    ],
    callout: {
      title: "Không dùng dữ liệu khách thật để thử",
      text: "Luồng gửi kho có thể tạo đơn ngoài ý muốn. Hãy dùng thông tin của chính người kinh doanh, chạy đủ các trường hợp lỗi rồi xóa dữ liệu thử trước khi mở đơn thật.",
    },
    detailImages: [images(48), images(49), images(50), images(51)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-16-gan-ma-lo-va-kiem-tra-don",
    n: "16",
    title: "Gắn mã lô, khai báo tồn có thể bán và kiểm tra đơn",
    preparation: {
      manual: ["Đơn mẫu đã được nạp; có mã hàng trong SAN_PHAM và số tồn thực sự có thể bán."],
      automatic: ["Mã kiểm tra mã hàng, số lượng, tồn, thông tin người nhận và trạng thái trước khi cho xuất."],
    },
    details: [
      "Mở SAN_PHAM, ghi MA_LO theo dạng ngày nhập cộng mã nhà cung cấp, ví dụ L20260210-NCC01. Mã lô này sẽ được chép sang đơn khi gửi kho.",
      "Mở TON_KHO và điền CO_THE_BAN bằng số hàng thực sự sẵn sàng xuất. Không để 0 nếu đang thử, vì mọi đơn sẽ bị báo vượt tồn.",
      "Chạy 9. Kiem tra don. Với bộ dữ liệu minh họa và tồn 30, kết quả đúng là 9 đơn DU_DIEU_KIEN_XUAT và 3 đơn CHO_XAC_NHAN: thiếu số điện thoại, vượt tồn hoặc mã hàng không tồn tại.",
    ],
    callout: {
      title: "Lý do lỗi phải cụ thể",
      text: "Hệ thống không được tự tạo mã hàng mới hoặc bỏ qua trường bắt buộc. GHI_CHU phải chỉ rõ đúng lỗi của từng đơn để người phụ trách xử lý.",
    },
    detailImages: [images(52), images(53), images(54)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-17-gui-kho-va-chong-trung",
    n: "17",
    title: "Gửi đơn đủ điều kiện sang kho và kiểm tra chống gửi trùng",
    preparation: {
      manual: ["Kiểm tra EMAIL_KHO, các đơn đủ điều kiện và mã lô trước khi gửi."],
      automatic: ["Hệ thống gửi đúng một lần, ghi NGAY_GUI_KHO, chép MA_LO và chuyển đơn sang DA_GUI_KHO."],
    },
    details: [
      "Chạy 10. Gui kho. Thông báo phải nêu số đơn đã gửi và số đơn còn chờ xác nhận.",
      "Mở DON_HANG, kiểm tra các dòng đủ điều kiện đã chuyển DA_GUI_KHO; đơn lỗi vẫn ở CHO_XAC_NHAN và chưa có ngày gửi.",
      "Mở Gmail Đã gửi, đối chiếu danh sách đơn, mã hàng, số lượng, họ tên, số điện thoại, địa chỉ và mã lô. Chạy mục 10 lần thứ hai: không được phát sinh email trùng cho các đơn đã có NGAY_GUI_KHO.",
    ],
    callout: {
      title: "Điều kiện mở đơn thật",
      text: "Chỉ đưa hệ thống vào vận hành khi mọi trường hợp thử cho đúng kết quả, lần gửi thứ hai không gửi trùng và MA_LO được chép sang từng đơn.",
    },
    detailImages: [images(55), images(56), images(57)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-18-phan-loai-thu-ho-tro",
    n: "18",
    title: "Phân loại thư hỗ trợ và giữ người thật ở quyết định nhạy cảm",
    preparation: {
      manual: ["Dùng một thư thử có mã đơn trong tiêu đề và chính sách xử lý đã được xác định."],
      automatic: ["AI phân loại, tóm tắt và soạn thư nháp; hệ thống ghi HOAN_HUY nhưng không tự gửi trả lời."],
    },
    details: [
      "Trong Gmail, mở thư cần xử lý và kiểm tra nội dung cùng mã đơn. Không dùng thư hệ thống làm dữ liệu hỗ trợ.",
      "Bấm biểu tượng nhãn, gắn KHTHU-CHO-XU-LY rồi xác nhận thư xuất hiện trong đúng nhãn chờ.",
      "Quay lại bảng tính và chạy 12. Phan loai thu ho tro.",
      "Đọc thông báo: hệ thống phải cho biết số thư đã xử lý, số trường hợp còn trong hàng chờ và vị trí thư nháp.",
      "Mở Gmail Thư nháp, đọc lại nội dung, đối chiếu đơn và chính sách. Người thật mới bấm Gửi; hệ thống không tự gửi thư cho khách.",
      "Mở HOAN_HUY, kiểm tra TOM_TAT, NHOM_YEU_CAU, MUC_UU_TIEN, THONG_TIN_CON_THIEU, MAU_TRA_LOI và CAN_CON_NGUOI_DUYET. Hoàn tiền, hủy đơn, chất lượng, an toàn, quảng cáo sai hoặc bồi thường phải luôn cần người duyệt.",
    ],
    callout: {
      title: "Ranh giới không tự động hóa",
      text: "AI chỉ phân loại và soạn bản nháp. Thiệt hại, tranh chấp, hoàn tiền ngoại lệ, khách bức xúc hoặc yêu cầu vượt chính sách phải do người kinh doanh quyết định.",
    },
    detailImages: [images(58), images(59), images(60), images(61), images(62), images(63)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-19-canh-bao-ton-kho",
    n: "19",
    title: "Tính điểm đặt lại và xử lý cảnh báo tồn kho",
    preparation: {
      manual: ["TON_KHO đã có tồn có thể bán, thời gian sản xuất, tồn an toàn và lịch sử đơn đã gửi kho."],
      automatic: ["Hệ thống tính bán trung bình, số ngày đủ hàng, điểm đặt lại, tiền trong tồn và phát cảnh báo."],
    },
    details: [
      "Chạy 11. Canh bao ton kho từ menu hoặc bảng điều khiển.",
      "Kiểm tra thông báo và email quản lý. Hệ thống phải dừng ở cảnh báo, không tự tạo đơn đặt hàng hoặc chuyển tiền.",
      "Mở TON_KHO và đọc CO_THE_BAN, BAN_TB_NGAY, SO_NGAY_DU_HANG, DIEM_DAT_LAI, TIEN_TRONG_TON. Trong ví dụ, tồn 17 thấp hơn điểm đặt lại 57 và chỉ đủ khoảng 18,3 ngày; người kinh doanh tự quyết định đặt bao nhiêu, của ai và khi nào, rồi đổi DA_XU_LY thành CO sau khi xử lý.",
    ],
    callout: {
      title: "Cảnh báo không thay thế quyết định vốn",
      text: "Số lượng đặt còn phụ thuộc tiền mặt, kế hoạch quảng cáo và độ tin cậy của nhà cung cấp—ba dữ liệu không thể giao hoàn toàn cho công thức.",
    },
    detailImages: [images(64), images(65), images(66)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-20-tinh-loi-nhuan-tren-don",
    n: "20",
    title: "Tính lợi nhuận còn lại trên mỗi đơn",
    preparation: {
      manual: ["Chuẩn bị giá bán và từng chi phí biến đổi theo một đơn ở mức dự kiến."],
      automatic: ["Công thức cộng tổng chi phí biến đổi và tính phần tiền còn lại trước thuế cùng chi phí cố định."],
    },
    details: [
      "Mở LOI_NHUAN_DON, điền SO_DU_KIEN cho giá vốn, bao bì, kho–đóng gói, vận chuyển, phí nền tảng, phí thanh toán, hỗ trợ vận chuyển, hoàn hủy, quảng cáo và chi phí khác. Trong ví dụ, tổng chi phí biến đổi là 381.000 đồng và còn lại 118.000 đồng.",
      "Dùng SO_DU_KIEN để quyết định trước khi bắt đầu. Chỉ cập nhật SO_THUC_TE từ các đơn đã giao sau khi phí và tiền thực nhận đã được đối soát.",
    ],
    callout: {
      title: "Doanh thu không phải lợi nhuận",
      text: "Một sản phẩm bán được vẫn có thể làm mất tiền nếu phí sàn, hoàn hàng, quảng cáo và chi phí kho chưa được tính đủ trên từng đơn.",
    },
    detailImages: [images(67), []],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-21-doi-soat-tien-thuc-nhan",
    n: "21",
    title: "Đối soát doanh thu, phí và tiền thực nhận theo kỳ",
    preparation: {
      manual: ["Tải CSV đối soát từ kênh bán và đặt tên tệp có chữ DOI_SOAT."],
      automatic: ["Hệ thống nạp bảng, tính CHENH_LECH theo từng mã đơn và giữ dòng lệch để người thật giải trình."],
    },
    details: [
      "Mở CSV đối soát và kiểm tra các cột mã đơn, doanh thu ghi nhận, phí nền tảng, phí thanh toán, hỗ trợ vận chuyển và tiền thực nhận.",
      "Đưa tệp vào NAP_DON. Tên tệp phải có chữ DOI_SOAT để hệ thống nhận đúng loại dữ liệu.",
      "Chạy 14. Doi soat ky từ menu hoặc bảng điều khiển.",
      "Đọc thông báo số dòng đã nạp và yêu cầu kiểm tra CHENH_LECH; việc chạy thành công chưa có nghĩa mọi dòng đã khớp.",
      "Mở DOI_SOAT. CHENH_LECH = doanh thu ghi nhận - phí nền tảng - phí thanh toán + hỗ trợ vận chuyển - tiền thực nhận; bằng 0 là khớp, khác 0 phải được giải thích.",
      "Trong bộ thử, DH-0011 lệch 18.000 đồng. Ghi rõ Lech 18000, dang cho san giai trinh và yêu cầu chứng từ theo mã đơn; chưa khóa kỳ hoặc cập nhật SO_THUC_TE cho đến khi có câu trả lời.",
    ],
    callout: {
      title: "Lệch một đồng cũng cần bằng chứng",
      text: "Phí khuyến mại, vận chuyển tính lại theo cân nặng hoặc lỗi hệ thống đều có thể tạo chênh lệch. Bỏ qua một dòng khiến dữ liệu lợi nhuận về sau không còn đáng tin.",
    },
    detailImages: [images(68), images(69), images(70), images(71), images(72), images(73)],
    calloutImages: [],
    showVideo: false,
  },
  {
    id: "m5-22-tong-hop-huy-hoan-theo-lo",
    n: "22",
    title: "Gắn nguyên nhân gốc và tổng hợp hủy hoàn theo mã lô",
    preparation: {
      manual: [
        "Mọi dòng HOAN_HUY đã có MA_LO và NGUYEN_NHAN_GOC.",
        "Đặt ngưỡng cảnh báo trước khi xem kết quả, không thay ngưỡng sau khi thấy số.",
      ],
      automatic: ["Hệ thống đếm bảy ngày theo nguyên nhân và mã lô, ghi CANH_BAO rồi gửi thư khi vượt ngưỡng."],
    },
    details: [
      "Mở HOAN_HUY và chọn NGUYEN_NHAN_GOC cho từng trường hợp từ danh sách chuẩn như SAN_PHAM, BAO_BI, GIAO_HANG, NOI_DUNG_QUANG_CAO, KHACH_DOI_Y hoặc KHAC.",
      "Đối chiếu mã đơn để điền đúng MA_LO. Cột này không tự điền ở HOAN_HUY; thiếu mã lô thì không thể biết lỗi tập trung ở lô và nhà cung cấp nào.",
      "Chạy 13. Tong hop huy hoan từ menu. Trình kích hoạt cuối tuần cũng dùng cùng hàm này.",
      "Đọc thông báo số cảnh báo đã ghi; nếu còn nguyên nhân gốc trống, dừng và sửa dữ liệu thay vì để dòng trống bị gom vào KHAC.",
      "Mở CANH_BAO, kiểm tra loại cảnh báo, mã hàng, nội dung, ngưỡng và trạng thái xử lý. Khi một nguyên nhân vượt 30% hoặc một lô cao gấp hai lần trung bình, dừng nội dung quảng cáo liên quan, xem lại mẫu thật, bao bì và dữ liệu giao hàng trước khi tăng bán.",
    ],
    callout: {
      title: "Khép kín vòng phản hồi",
      text: "AI có thể tổng hợp dữ liệu; người kinh doanh vẫn quyết định sửa nội dung, từ chối lô, đổi đối tác, hoàn tiền hoặc điều chỉnh ngân sách.",
    },
    detailImages: [images(74), images(75), images(76), images(77), images(78)],
    calloutImages: [],
    showVideo: false,
  },
];
