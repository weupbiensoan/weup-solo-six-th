import type { GuideStep } from "./knowledge";

export const promptText5 = `Tôi muốn xây dựng một hệ thống vận hành thương mại điện tử một người bằng Google Sheets và Google Apps Script. Người kinh doanh giữ quyền quyết định về sản phẩm, thương hiệu, dữ liệu, tiền và các trường hợp ngoại lệ; nhà sản xuất, đơn vị kiểm hàng, kho thuê ngoài, đơn vị vận chuyển, kênh bán và dịch vụ kế toán thực hiện các phần việc đã được phân định. AI chỉ hỗ trợ phân nhóm dữ liệu, tạo bản nháp và tổng hợp; không được tự quyết định nhập hàng, duyệt mẫu, xuất kho ngoại lệ, hoàn tiền hoặc khóa đối soát.

Bối cảnh cài đặt: tôi tạo một Google Sheets trống tên VAN_HANH_TMDT, mở Apps Script từ chính bảng tính đó và dán mã. Hãy trả về đúng hai tệp đầy đủ trong một câu trả lời, mỗi tệp nằm trong một khối mã riêng và ghi rõ tên:
1. Ma.gs chứa toàn bộ nghiệp vụ, cấu hình, menu, phần máy chủ của bảng điều khiển và là tệp duy nhất khai báo onOpen.
2. bang_dieu_khien.html chứa giao diện bảng điều khiển.

Ràng buộc kiến trúc bắt buộc:
- Dùng SpreadsheetApp.getActiveSpreadsheet(); tuyệt đối không dùng SpreadsheetApp.create().
- Chỉ Ma.gs được khai báo onOpen và tạo menu “Van hanh don hang”. Toàn bộ hàm máy chủ của bảng điều khiển, gồm hàm lấy chỉ số, hàm chạy mục và hàm mở bảng điều khiển, cũng phải nằm trong tệp này.
- Tên hàm và biến viết tiếng Việt không dấu; chú thích, thông báo, email và câu lệnh gửi AI viết tiếng Việt có dấu.
- Tra cột theo tên tiêu đề, không dựa vào vị trí cột cố định. Không dùng eval. Mọi hàm mà HTML gọi phải tồn tại thật trong Ma.gs; cuối câu trả lời phải có bảng đối chiếu tên hàm và nút giao diện gọi hàm đó.
- Khóa API đọc từ PropertiesService.getScriptProperties() với tên KHOA_API; không ghi khóa vào mã hoặc trang tính.
- Nhà cung cấp AI đọc từ CAU_HINH, hỗ trợ OPENAI hoặc ANTHROPIC. Tên model đọc từ MO_HINH_AI, số token đọc từ SO_TOKEN_TOI_DA và tự nâng tối thiểu lên 4000.
- Mọi UrlFetchApp.fetch phải đặt muteHttpExceptions: true. Nếu API lỗi, ném lỗi kèm mã HTTP và nguyên văn nội dung trả về. Nếu AI trả JSON không hợp lệ, giữ nội dung thô trong cột JSON_THO hoặc thông báo rõ để người dùng đọc; không làm hỏng bảng và không dừng cả vòng lặp.
- Không dùng getLastRow, getLastColumn hoặc appendRow để xác định dữ liệu vì ô văn bản dài và định dạng bảng có thể làm sai kết quả. Hãy đọc theo hàng tiêu đề, tìm dòng trống đầu tiên và ghi theo đúng tên cột.
- Các cột số điện thoại, mã đơn và mã lô phải được định dạng văn bản để không mất số 0 đầu hoặc bị đổi định dạng.
- Các thao tác có thể gây gửi thư, xuất kho hoặc tạo dữ liệu phải chống chạy trùng bằng mã đơn, ngày gửi, trạng thái hoặc dấu đã xử lý.

Mười hai trang tính phải được tạo trong tệp đang mở, giữ nguyên dữ liệu cũ nếu chạy lại:
1. CAU_HINH: KHOA, GIA_TRI, GHI_CHU.
2. SAN_PHAM: MA_HANG, TEN_SP, PHIEN_BAN, THANH_PHAN, KICH_THUOC, VAT_LIEU, BAO_BI, GIA_BAN, GIA_VON_NHAP_KHO, MA_LO, TRANG_THAI_MAU, NGAY_DUYET_MAU.
3. KIEM_TRA_SP: CAU_HOI, KIEM_TRA_O_DAU, DU_LIEU_THUC_TE, KET_LUAN.
4. DU_LIEU_THO: NGAY_THU, NGUON, LOAI_NGUON, NGUYEN_VAN, SAN_PHAM_THAM_CHIEU, NHOM_AI, NHOM_DA_DUYET, MA_TRUNG.
5. NHA_CUNG_CAP: MA_NCC, TEN, HANG_MUC, NGUOI_LIEN_HE, EMAIL, SO_LUONG_TOI_THIEU, GIA_CHAO, THOI_GIAN_SX, DIEU_KIEN_THANH_TOAN, DA_GUI_YEU_CAU, NGAY_GUI, DA_NHAN_BAO_GIA, TRANG_THAI_MAU, VAI_TRO.
6. TON_KHO: MA_HANG, CO_THE_BAN, DANG_SAN_XUAT, CHO_KIEM_TRA, HANG_LOI, DANG_GIAO, HOAN_CHUA_KIEM, BAN_TB_NGAY, SO_NGAY_DU_HANG, DIEM_DAT_LAI, TIEN_TRONG_TON, NGAY_CAP_NHAT, NGUON_SO_LIEU.
7. DON_HANG: MA_DON, NGAY_DAT, KENH_BAN, MA_HANG, SO_LUONG, TIEN_KHACH_TRA, HO_TEN, SO_DIEN_THOAI, DIA_CHI, TRANG_THAI, MA_VAN_DON, NGAY_GUI_KHO, MA_LO, GHI_CHU.
8. HOAN_HUY: NGAY, MA_DON, KENH, NHOM_YEU_CAU, MUC_UU_TIEN, TOM_TAT, THONG_TIN_CON_THIEU, MAU_TRA_LOI, CAN_CON_NGUOI_DUYET, NGUOI_XU_LY, TRANG_THAI, NGAY_TRA_LOI, MA_LO, NGUYEN_NHAN_GOC, BEN_CHIU_TRACH_NHIEM, MA_NOI_DUNG.
9. DOI_SOAT: MA_DON, NGAY, DOANH_THU_GHI_NHAN, PHI_NEN_TANG, PHI_THANH_TOAN, HO_TRO_VAN_CHUYEN, TIEN_THUC_NHAN, CHENH_LECH, KY_DOI_SOAT, GHI_CHU.
10. NOI_DUNG: MA_NOI_DUNG, MA_HANG, LOAI, KENH, TIEU_DE, NOI_DUNG, NGUON_DAN, TRANG_THAI, NGUOI_DUYET, NGAY_DUYET, PHIEN_BAN, LINK, JSON_THO.
11. LOI_NHUAN_DON: KHOAN_MUC, SO_DU_KIEN, SO_THUC_TE, NGUON_SO_THUC_TE, GHI_CHU.
12. CANH_BAO: NGAY, LOAI_CANH_BAO, MA_HANG, NOI_DUNG, NGUONG, DA_XU_LY.

Khi tạo khung, định dạng hàng tiêu đề, cố định hàng đầu, tạo danh sách xổ đúng cho trạng thái đơn, vai trò nhà cung cấp CHINH/DU_PHONG, trạng thái mẫu CHO_DUYET/DA_DUYET/TU_CHOI, trạng thái nội dung BAN_AI/CHO_DUYET/DA_DUYET, nguyên nhân gốc của hủy hoàn, mức ưu tiên, nhu cầu người duyệt và trạng thái đã xử lý. Gieo sẵn các câu hỏi kiểm tra sản phẩm và các khoản mục lợi nhuận trên mỗi đơn.

CAU_HINH phải có sẵn: TEN_THUONG_HIEU, MA_HANG_CHINH, GIA_BAN, KENH_CHINH, NHA_CUNG_CAP, MO_HINH_AI, SO_TOKEN_TOI_DA, KICH_THUOC_LO_PHAN_NHOM, SO_DONG_NAP_MOI_LAN, EMAIL_KHO, EMAIL_QUAN_LY, EMAIL_NGUOI_DUYET, NGUOI_XU_LY_MAC_DINH, THOI_GIAN_SAN_XUAT_NGAY, TON_AN_TOAN, TY_LE_PHI_NEN_TANG, TY_LE_PHI_THANH_TOAN, HO_TRO_VAN_CHUYEN, NGUONG_TY_LE_NGUYEN_NHAN, NGUONG_TY_LE_LO, bốn ID thư mục, LINK_FORM_NHU_CAU, sáu câu lệnh AI và ba mẫu thư. Các ID thư mục và liên kết biểu mẫu do mã tự điền, người dùng không gõ tay.

Menu “Van hanh don hang” phải có các mục khởi tạo và chẩn đoán: Tao khung trang tinh, Sua CAU_HINH, Tao cay thu muc, Kiem tra thu muc, Dat trinh kich hoat, Kiem tra ket noi API, Mo bang dieu khien. Sau đó có đúng các mục nghiệp vụ:
1. Tao bieu mau thu du lieu.
2. Nap du lieu nhu cau.
3. Phan nhom nhu cau.
4. Tao ban yeu cau san pham.
4b. Tao ban yeu cau SP phien ban moi.
5. Gui yeu cau lay bao gia.
5b. Lam moi vong gui NCC.
6. Tao danh sach kiem mau.
7. Tao noi dung ban hang.
8. Nhap don hang.
9. Kiem tra don.
10. Gui kho.
11. Canh bao ton kho.
12. Phan loai thu ho tro.
13. Tong hop huy hoan.
14. Doi soat ky.

Các chức năng phải hoạt động như sau:
1. Tạo khung trang tính, cấu hình, danh sách xổ, công thức tồn kho và các dữ liệu mẫu cần thiết; chạy lại không xóa dữ liệu người dùng.
2. Tạo một thư mục gốc VAN_HANH_TMDT cùng ba thư mục con NAP_DU_LIEU, NAP_DON và HO_SO_NCC; lưu ID vào CAU_HINH. Mọi lần truy cập sau phải dùng ID, không dò tên trên toàn Drive, phải phát hiện thư mục nằm trong Thùng rác và có mục chẩn đoán đường dẫn thư mục.
3. Tạo Google Form bốn câu hỏi, nối phản hồi về bảng tính đang mở, sinh trang RAW_NHU_CAU và lưu liên kết vào CAU_HINH. Khi đặt trình kích hoạt, xóa bộ cũ rồi tạo lại để không trùng; gồm kích hoạt biểu mẫu và các lịch tự động cần cho nạp dữ liệu, phân loại thư, cảnh báo tồn, tổng hợp hủy hoàn và đối soát.
4. Nạp CSV hợp lệ từ NAP_DU_LIEU vào DU_LIEU_THO, giữ nguyên câu khách hàng, ghi nguồn, loại nguồn, mã chống trùng và đổi tên tệp đã nạp. Mỗi lần chỉ nạp tối đa SO_DONG_NAP_MOI_LAN.
5. Phân nhóm nhu cầu theo lô KICH_THUOC_LO_PHAN_NHOM. Xóa email và số điện thoại trước khi gửi AI. AI chỉ gán nhóm cho câu được cung cấp, không suy đoán. Ghi NHOM_AI; người kinh doanh tự điền NHOM_DA_DUYET trước khi chuyển bước.
6. Tạo bản yêu cầu sản phẩm từ các nhóm đã duyệt, gồm khách hàng và tình huống sử dụng, cấu hình sản phẩm và giới hạn kinh doanh. Mọi phần thiếu phải ghi CAN_XAC_NHAN; bản mới mang trạng thái BAN_AI. Người dùng sửa và chuyển sang DA_DUYET. Mục 4b luôn tạo một phiên bản mới, không ghi đè bản cũ.
7. Tạo PDF mới từ bản YEU_CAU_SP đã duyệt, tên tệp phải có MA_HANG_CHINH, phiên bản và dấu thời gian; lưu trong HO_SO_NCC rồi gửi cho các nhà cung cấp có email. Không gửi lại khi đã có dấu đã gửi; mục 5b chỉ đặt lại vòng gửi theo chủ đích của người dùng.
8. Từ bản yêu cầu đã duyệt, tạo DANH_SACH_KIEM_MAU và rút ra dòng SAN_PHAM. AI không được tự duyệt cảm giác cầm, độ bền, an toàn hoặc mức chấp nhận vật liệu. Người dùng duyệt mẫu thật bằng danh sách xổ; khi chuyển DA_DUYET thì ghi ngày duyệt.
9. Chỉ dùng thông tin sản phẩm đã duyệt để tạo ba nội dung: MO_TA_SAN_PHAM, CAU_HOI_THUONG_GAP và KICH_BAN_VIDEO. Không bịa công dụng, kích thước, giá, chính sách hoặc lời hứa. Nội dung AI là bản nháp và phải được người dùng kiểm tra.
10. Nhập CSV đơn hàng từ NAP_DON, chống trùng MA_DON và đổi tên tệp đã nạp. Kiểm tra mã hàng, số lượng, tồn có thể bán, họ tên, số điện thoại, địa chỉ và trạng thái; đơn đạt chuyển DU_DIEU_KIEN_XUAT, đơn lỗi giữ CHO_XAC_NHAN cùng lý do cụ thể. Không tự tạo mã hàng mới.
11. Chỉ gửi kho các đơn DU_DIEU_KIEN_XUAT chưa có NGAY_GUI_KHO. Lấy MA_LO từ SAN_PHAM, gửi danh sách qua EMAIL_KHO, ghi ngày gửi và chuyển DA_GUI_KHO. Chạy lại không được gửi trùng.
12. Tính BAN_TB_NGAY, SO_NGAY_DU_HANG, DIEM_DAT_LAI và TIEN_TRONG_TON. Khi CO_THE_BAN chạm điểm đặt lại, ghi CANH_BAO và gửi email quản lý; không tự quyết định số lượng đặt hoặc chuyển tiền. Người dùng đánh DA_XU_LY=CO sau khi xử lý.
13. Chỉ đọc các thư Gmail được người dùng gắn nhãn KHTHU-CHO-XU-LY và loại trừ thư hệ thống. AI trả JSON gồm tóm tắt, nhóm yêu cầu, mức ưu tiên, thông tin thiếu, mẫu trả lời và cờ cần người duyệt. Hoàn tiền, hủy đơn, chất lượng, an toàn, quảng cáo sai và bồi thường luôn phải CAN_CON_NGUOI_DUYET=CO. Chỉ tạo thư nháp; tuyệt đối không tự gửi. Sau xử lý, chuyển nhãn sang KHTHU-DA-PHAN-LOAI và ghi HOAN_HUY.
14. Tổng hợp hủy hoàn trong bảy ngày theo NGUYEN_NHAN_GOC và MA_LO. Cảnh báo khi một nguyên nhân vượt NGUONG_TY_LE_NGUYEN_NHAN hoặc một lô cao hơn NGUONG_TY_LE_LO lần mức trung bình. Không chạy khi còn nguyên nhân gốc trống.
15. Trang LOI_NHUAN_DON phải có công thức tính tổng chi phí biến đổi và lợi nhuận còn lại trên mỗi đơn. Nạp tệp CSV có chữ DOI_SOAT từ NAP_DON vào DOI_SOAT, tính CHENH_LECH = DOANH_THU_GHI_NHAN - PHI_NEN_TANG - PHI_THANH_TOAN + HO_TRO_VAN_CHUYEN - TIEN_THUC_NHAN. Chênh lệch khác 0 phải được con người giải thích trước khi khóa kỳ hoặc cập nhật số thực tế.
16. Kiểm tra kết nối API bằng một lệnh ngắn và báo rõ 401, 404, 429. Bảng điều khiển phải mở nhanh, chỉ đọc trang tính để lấy chỉ số; nút chạy dùng bảng ánh xạ tường minh từ tên hàm sang hàm thật, không eval. Các hành động liên quan hàng hóa hoặc tiền phải có bước xác nhận trên giao diện.

Nguyên tắc chuyên môn và an toàn trong mọi câu lệnh gửi AI:
- Không bịa nhu cầu, số liệu, vật liệu, chứng nhận, công dụng, giá, chính sách, báo giá hoặc bằng chứng.
- Thiếu dữ liệu phải ghi CAN_XAC_NHAN, không suy đoán.
- AI không tự chọn nhà cung cấp, không duyệt mẫu, không quyết định nhập lô, không tự xuất đơn lỗi, không hứa đền bù và không tự gửi thư khách hàng.
- Người kinh doanh giữ quyền quyết định về sản phẩm, giá, mẫu, hợp đồng, thanh toán, tồn kho, hoàn tiền, khiếu nại và khóa đối soát.

Cuối câu trả lời, hướng dẫn chính xác: tạo hai tệp ở đâu; đặt KHOA_API như thế nào; chạy hàm khoiTaoBangTinh trước; thứ tự tạo cây thư mục, kiểm tra API, tạo biểu mẫu và đặt trình kích hoạt; các quyền cần cấp; cách mở bảng điều khiển; và cách kiểm tra kết quả của từng mục từ 1 đến 14.`;

export const steps5: GuideStep[] = [
  {
    id:"m5-buoc-01", n:"01", title:"Dựng tệp trung tâm, dán hai tệp mã và khởi tạo hệ thống",
    details:[
      "Tạo một Google Sheets mới, đặt tên VAN_HANH_TMDT và để trống hoàn toàn. Không tự tạo trang tính hoặc gõ tên cột, vì hàm khởi tạo sẽ sinh toàn bộ mười hai trang, hàng tiêu đề, danh sách xổ và công thức. Từ chính bảng tính này, chọn Tiện ích mở rộng → Apps Script để dự án luôn gắn với đúng tệp trung tâm.",
      "Trong Apps Script, xóa toàn bộ mã mẫu ở tệp Code.gs đang có rồi dán trọn nội dung tệp Ma.gs. Tệp này đã gồm nghiệp vụ, menu và toàn bộ hàm máy chủ của bảng điều khiển nên không cần tạo thêm WebApp.gs. Sau đó bấm dấu cộng cạnh mục Tệp, chọn HTML, đặt tên bang_dieu_khien, không gõ thêm đuôi .html, rồi dán mã giao diện. Kiểm tra dự án chỉ có hai tệp mã cần dùng và nhấn Ctrl+S. Tên bang_dieu_khien phải trùng chính xác với tên được dùng trong createTemplateFromFile.",
      "Vào Cài đặt dự án → Thuộc tính của tập lệnh, thêm thuộc tính KHOA_API và dán khóa của nhà cung cấp mô hình vào ô giá trị. Khóa chỉ hiện cho người có quyền dự án; không ghi khóa vào CAU_HINH, không chụp màn hình và không gửi khóa cho người khác.",
      "Trên thanh công cụ, chọn hàm khoiTaoBangTinh rồi bấm Chạy. Lần đầu, chọn đúng tài khoản, mở Nâng cao nếu Google báo ứng dụng chưa xác minh, đi tới dự án và bấm Cho phép. Sau khi chạy xong, quay lại bảng tính và tải lại trang; menu Van hanh don hang cùng mười hai trang CAU_HINH, SAN_PHAM, KIEM_TRA_SP, DU_LIEU_THO, NHA_CUNG_CAP, TON_KHO, DON_HANG, HOAN_HUY, DOI_SOAT, NOI_DUNG, LOI_NHUAN_DON và CANH_BAO phải xuất hiện.",
      "Mở CAU_HINH và chỉ điền cột GIA_TRI cho tên thương hiệu, mã hàng chính, giá bán, kênh bán, nhà cung cấp AI, tên model, ba email, thời gian sản xuất, tồn an toàn và các tỷ lệ phí. Không gõ vào bốn ô ID thư mục hoặc LINK_FORM_NHU_CAU. Sau đó chạy lần lượt Tao cay thu muc → Kiem tra thu muc → Kiem tra ket noi API → 1. Tao bieu mau thu du lieu → Dat trinh kich hoat. Mở biểu tượng đồng hồ trong Apps Script để đối chiếu đủ lịch; mở bảng điều khiển ngay cả khi chưa có dữ liệu để dùng làm bản đồ cho mười bốn mục."
    ],
    callout:{title:"Kết quả của bước",text:"Bảng tính có đúng 12 trang, menu Van hanh don hang, thư mục gốc VAN_HANH_TMDT với ba thư mục con, khóa API nằm trong Script Properties và các trình kích hoạt không bị tạo trùng."},
    detailImages:[["m5-01.jpg"],[],[],["m5-02.jpg","m5-03.jpg"],["m5-16.jpg","m5-17.jpg","m5-04.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-00.mp4"
  },
  {
    id:"m5-buoc-02", n:"02", title:"Thu dữ liệu nhu cầu, nạp CSV và phân nhóm bằng AI",
    details:[
      "Chốt nguồn được phép sử dụng trước khi thu dữ liệu. Ưu tiên đánh giá và câu hỏi trên gian hàng của mình, báo cáo CSV xuất từ trang quản trị người bán, bình luận dưới video của mình và câu trả lời biểu mẫu do khách tự điền. Google Trends hoặc công cụ từ khóa chính thức chỉ là nguồn tham chiếu; không dùng phần mềm cào bình luận của gian hàng người khác.",
      "Mục 1 tạo Google Form bốn câu hỏi, nối phản hồi về bảng tính và lưu liên kết vào CAU_HINH. Có thể gửi biểu mẫu cho nhóm thử nghiệm hoặc tự nhập dữ liệu mẫu. Mỗi dòng cần giữ nguyên câu khách hàng ở NGUYEN_VAN, có NGUON và LOAI_NGUON để sau này truy lại được.",
      "Nếu có tệp CSV, mở Drive → VAN_HANH_TMDT → NAP_DU_LIEU, tải tệp lên rồi chạy 2. Nap du lieu nhu cau. Mở DU_LIEU_THO và kiểm tra số dòng mới, LOAI_NGUON là CSV, dữ liệu nguyên văn không bị sửa và MA_TRUNG đã giúp loại dòng trùng. Tệp đã xử lý phải được đổi tên để lần chạy sau không nạp lại.",
      "Chạy 3. Phan nhom nhu cau. AI chỉ nhận các câu đã xóa email và số điện thoại, xử lý theo lô rồi ghi NHOM_AI; nó không được thêm nhu cầu không có trong dữ liệu. Đọc lại từng nhóm, sửa nếu cần và sao chép nhóm được chấp nhận sang NHOM_DA_DUYET. Chưa duyệt cột này thì không chuyển sang bản yêu cầu sản phẩm.",
      "Đọc kết quả như một lớp kiểm chứng chứ không phải kết luận sản phẩm chắc chắn bán được. Sau nhóm vấn đề còn phải phỏng vấn, cho xem ý tưởng, thu tín hiệu muốn xem mẫu và kiểm chứng hành vi thanh toán hoặc đặt cọc trước khi bỏ tiền vào lô hàng."
    ],
    callout:{title:"Không dùng AI làm bằng chứng mua",text:"AI có thể gom các câu giống nhau, nhưng lượt thích hoặc một nhóm bình luận không thay thế cho hành vi thanh toán. Không có người đặt cọc ở mức giá dự kiến thì phải dừng hoặc thử lại giả định chính."},
    detailImages:[[],["m5-05.jpg"],["m5-06.jpg","m5-07.jpg"],["m5-08.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-01.mp4"
  },
  {
    id:"m5-buoc-03", n:"03", title:"Chuyển nhu cầu đã duyệt thành bản yêu cầu sản phẩm",
    details:[
      "Khi NHOM_DA_DUYET đã có dữ liệu, chạy 4. Tao ban yeu cau san pham. Hệ thống đọc các nhóm đã duyệt và tạo một dòng NOI_DUNG có LOAI = YEU_CAU_SP, gồm ba phần: khách hàng và tình huống sử dụng; cấu hình sản phẩm; giới hạn kinh doanh.",
      "Mở ô NOI_DUNG của dòng vừa tạo và đọc từ đầu đến cuối. Tìm mọi chỗ CAN_XAC_NHAN rồi thay bằng quyết định hoặc dữ liệu thật về thành phần, kích thước, vật liệu, bao bì, giá mục tiêu, giá vốn tối đa, tiêu chí kiểm mẫu, phần nhà cung cấp không được tự đổi và nội dung không được phép cam kết. Không để AI tự đoán một ô nào trong bản sẽ gửi cho nhà sản xuất.",
      "Khi bản yêu cầu đã đầy đủ, chuyển TRANG_THAI từ BAN_AI sang DA_DUYET, ghi người duyệt nếu quy trình nội bộ yêu cầu. Nếu muốn thay cấu hình sau này, dùng mục 4b. Tao ban yeu cau SP phien ban moi để tạo phiên bản mới; không ghi đè bản cũ vì báo giá, mẫu và nội dung phải truy được về đúng phiên bản.",
      "Trước khi gửi ra ngoài, kiểm tra lại sản phẩm có phù hợp với bộ máy một người: còn tiền trên mỗi đơn sau chi phí biến đổi, dễ lưu kho và vận chuyển, ít biến thể, có tiêu chí kiểm mẫu rõ, yêu cầu pháp lý đã biết, có thể nhập thử số lượng nhỏ và có ít nhất một nguồn cung dự phòng."
    ],
    callout:{title:"Kết quả của bước",text:"NOI_DUNG có bản YEU_CAU_SP ở trạng thái DA_DUYET, không còn CAN_XAC_NHAN chưa xử lý và phiên bản được giữ nguyên để làm nguồn cho báo giá, kiểm mẫu và nội dung."},
    detailImages:[["m5-09.jpg"],["m5-10.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-02.mp4"
  },
  {
    id:"m5-buoc-04", n:"04", title:"Lập hồ sơ nhà cung cấp và gửi bản yêu cầu lấy báo giá",
    details:[
      "Mở NHA_CUNG_CAP, điền ít nhất hai dòng: mã nhà cung cấp, tên, hạng mục, người liên hệ và email. Cuộn sang cột VAI_TRO ở cuối bảng, chọn CHINH cho một dòng và DU_PHONG cho dòng còn lại. Các cột số lượng tối thiểu, giá chào, thời gian sản xuất và điều kiện thanh toán để trống cho đến khi nhận báo giá thật.",
      "Chạy 5. Gui yeu cau lay bao gia. Hệ thống lấy bản YEU_CAU_SP đã duyệt, luôn tạo một PDF mới trong HO_SO_NCC, đặt tên có MA_HANG_CHINH, phiên bản và thời gian, rồi gửi đúng tệp cho các nhà cung cấp có email. Kiểm tra Drive có PDF mới và Gmail Đã gửi có đúng người nhận.",
      "Khi nhà cung cấp phản hồi, ghi báo giá, số lượng tối thiểu, thời gian sản xuất, điều kiện thanh toán và trạng thái mẫu vào đúng dòng; không chỉ lưu trong tin nhắn. AI có thể hỗ trợ xếp thông tin thành bảng, nhưng không được tự chọn nhà cung cấp hoặc xếp hạng khi tiêu chí chưa được người kinh doanh chốt.",
      "Nếu cần gửi một phiên bản yêu cầu mới, tạo bản 4b trước rồi dùng 5b. Lam moi vong gui NCC theo chủ đích. Không xóa dấu đã gửi để gửi lại tùy tiện. Luôn chuẩn bị một nguồn sản xuất và một phương án kho dự phòng, tối thiểu phải biết giá, thời gian đáp ứng và điều kiện chuyển đổi."
    ],
    callout:{title:"Ranh giới trách nhiệm",text:"Đối tác thực hiện sản xuất và hậu cần, nhưng người kinh doanh vẫn duyệt mẫu, hợp đồng, lịch thanh toán, số lượng nhập và phương án dự phòng."},
    detailImages:[["m5-11.jpg"],["m5-12.jpg"],["m5-13.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-03.mp4"
  },
  {
    id:"m5-buoc-05", n:"05", title:"Kiểm mẫu, khóa mẫu chuẩn và tạo nội dung bán hàng",
    details:[
      "Chạy 6. Tao danh sach kiem mau. Mã đọc dòng YEU_CAU_SP có TRANG_THAI = DA_DUYET, tạo một dòng NOI_DUNG mới có LOAI = DANH_SACH_KIEM_MAU và đồng thời rút các trường kỹ thuật sang SAN_PHAM. Mở NOI_DUNG và kiểm tra từng tiêu chí có mã, cách đo hoặc kiểm và ngưỡng chấp nhận.",
      "Khi có mẫu thật, đối chiếu đủ thành phần, kích thước, trọng lượng và bề mặt với bản yêu cầu; dùng thử trong tình huống thật; chụp và đặt mã cho từng lỗi; xác định lỗi được chấp nhận hoặc phải loại. Cuối cùng duyệt một mẫu chuẩn cùng bao bì, nhãn, hướng dẫn và mã hàng để dùng cho các lô sau.",
      "Ghi kết quả vào SAN_PHAM, không chỉ trao đổi trong tin nhắn. Chọn TRANG_THAI_MAU là CHO_DUYET, DA_DUYET hoặc TU_CHOI; khi duyệt, hệ thống ghi NGAY_DUYET_MAU. Không đặt lô sản xuất khi còn trạng thái khác DA_DUYET hoặc chưa có ảnh mẫu chuẩn lưu kèm. Nếu thuê kiểm trước khi hàng rời xưởng, biên bản phải dùng cùng mã sản phẩm, cùng mẫu chuẩn và cùng danh sách lỗi đã duyệt.",
      "Sau khi thông tin và mẫu thật đã duyệt, chạy 7. Tao noi dung ban hang. Hệ thống chỉ đọc nguồn DA_DUYET và tạo ba dòng: MO_TA_SAN_PHAM, CAU_HOI_THUONG_GAP và KICH_BAN_VIDEO. Người kinh doanh kiểm lại công dụng, kích thước, giá và chính sách trước khi dùng; bản nháp không được trở thành nguồn chính thức.",
      "Phân biệt ảnh sản phẩm thật, cảnh AI minh họa và đồ họa chữ. Ảnh thật phải thể hiện đúng màu, kích thước, thành phần và cách dùng; AI chỉ dựng tình huống khó quay; đồ họa dùng giải thích. Không chỉnh sản phẩm trông lớn hơn, bóng hơn hoặc có thêm thành phần. Chỉ phát hành khi ảnh thật đã thay hình ý tưởng và mọi tuyên bố truy được về THONG_TIN_SP đã duyệt."
    ],
    callout:{title:"AI không duyệt chất lượng",text:"AI có thể tạo danh sách kiểm và nội dung nháp; cảm giác cầm, độ bền, độ an toàn, mức chấp nhận vật liệu và quyết định duyệt mẫu phải do người thật thực hiện."},
    detailImages:[["m5-14.jpg"],[],[],["m5-15.jpg"],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-04.mp4"
  },
  {
    id:"m5-buoc-06", n:"06", title:"Chọn kênh bán, nhập đơn mẫu và kiểm tra điều kiện xuất",
    details:[
      "Chọn một kênh bán đầu tiên và ghi vào KENH_CHINH. Tra biểu phí thật trong trang quản trị người bán rồi điền TY_LE_PHI_NEN_TANG, TY_LE_PHI_THANH_TOAN và HO_TRO_VAN_CHUYEN. Ô phải ở định dạng văn bản thuần: gõ 9 thay vì 9%, gõ 15000 thay vì 15.000đ. Nếu dùng số ước lượng, ghi rõ UOC LUONG ở cột ghi chú.",
      "Xuất một CSV đơn hàng mẫu từ kênh bán, dùng dữ liệu của chính người kinh doanh, rồi tải vào VAN_HANH_TMDT/NAP_DON. Chạy 8. Nhap don hang và mở DON_HANG để kiểm tra đủ 12 dòng trong bộ thử, không có MA_DON trùng và tệp đã nạp được đổi tên.",
      "Trước khi chạy kiểm tra, điền MA_LO của SAN_PHAM theo dạng ngày nhập cộng mã nhà cung cấp, ví dụ L20260210-NCC01, và đặt TON_KHO.CO_THE_BAN bằng số hàng thực sự bán được. Nếu để 0, mọi đơn sẽ bị báo vượt tồn. Mã hàng trong DON_HANG phải khớp chính xác với SAN_PHAM.",
      "Chạy 9. Kiem tra don. Với bộ dữ liệu minh họa và tồn 30, kết quả đúng là 9 đơn DU_DIEU_KIEN_XUAT và 3 đơn CHO_XAC_NHAN: một đơn thiếu số điện thoại, một đơn mua 50 bộ vượt tồn và một đơn dùng mã hàng không tồn tại. GHI_CHU phải chỉ rõ lý do của từng dòng; hệ thống không được tự tạo mã hàng mới hoặc bỏ qua trường bắt buộc."
    ],
    callout:{title:"Điều kiện mở đơn thật",text:"Chỉ chuyển sang đơn thật khi dữ liệu mẫu chống được đơn trùng, chặn đúng đơn thiếu thông tin hoặc vượt tồn và giữ nguyên số điện thoại, mã đơn, mã lô dưới dạng văn bản."},
    detailImages:[[],[],["m5-18.jpg"],["m5-19.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-05.mp4"
  },
  {
    id:"m5-buoc-07", n:"07", title:"Gửi đơn đủ điều kiện sang kho và kiểm tra chống gửi trùng",
    details:[
      "Khi thử luồng, dùng họ tên, số điện thoại và địa chỉ thật của chính người kinh doanh; không dùng thông tin khách thật vì email kho có thể tạo một đơn ngoài ý muốn. Kiểm tra EMAIL_KHO trong CAU_HINH trước khi chạy.",
      "Chạy 10. Gui kho. Hệ thống chỉ lấy các dòng DU_DIEU_KIEN_XUAT chưa có NGAY_GUI_KHO, chép MA_LO từ SAN_PHAM, gửi danh sách qua email cho kho, ghi ngày gửi và chuyển trạng thái sang DA_GUI_KHO. Mở Gmail Đã gửi và đối chiếu đủ mã đơn, mã hàng, số lượng, người nhận, địa chỉ và mã lô.",
      "Chạy mục 10 lần thứ hai. Lần thứ hai không được gửi lại đơn đã có NGAY_GUI_KHO. Kiểm tra cột MA_LO của đơn đã gửi có giá trị; thiếu mã lô thì phần phân tích hủy hoàn sau này không thể truy ngược lô hàng và nhà cung cấp.",
      "Chỉ mở đơn thật khi các trường hợp thử cho đúng kết quả, lần chạy thứ hai không gửi trùng và mã lô đã được chép. Sau đó xóa dữ liệu thử. Kho thuê ngoài chỉ xuất đơn đã đủ điều kiện; đơn CHO_XAC_NHAN phải quay về người phụ trách để xử lý ngoại lệ."
    ],
    callout:{title:"Kết quả của bước",text:"Kho nhận đúng một email cho mỗi đợt đơn đủ điều kiện; DON_HANG có trạng thái DA_GUI_KHO, NGAY_GUI_KHO và MA_LO, còn các đơn lỗi vẫn nằm lại để con người xác nhận."},
    detailImages:[["m5-20.jpg"],[],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-06.mp4"
  },
  {
    id:"m5-buoc-08", n:"08", title:"Phân loại thư hỗ trợ và giữ người thật ở quyết định nhạy cảm",
    details:[
      "Trong Gmail, mở thư khách hàng cần xử lý, bấm biểu tượng nhãn và gắn KHTHU-CHO-XU-LY. Tiêu đề nên có mã đơn để hệ thống đối chiếu. Không gắn nhãn này cho thư do chính hệ thống gửi; mã cũng phải loại thư có tiền tố [HE THONG].",
      "Quay lại bảng tính và chạy 12. Phan loai thu ho tro. AI tóm tắt, gán nhóm yêu cầu, mức ưu tiên, thông tin còn thiếu, mẫu trả lời và cờ cần người duyệt. Kết quả được ghi vào HOAN_HUY; nhãn Gmail chuyển sang KHTHU-DA-PHAN-LOAI để không xử lý lại.",
      "Mở HOAN_HUY và kiểm tra các cột TOM_TAT, NHOM_YEU_CAU, MUC_UU_TIEN, THONG_TIN_CON_THIEU, MAU_TRA_LOI, CAN_CON_NGUOI_DUYET và NGUOI_XU_LY. Hoàn tiền, hủy đơn, khiếu nại chất lượng, an toàn, quảng cáo sai hoặc đòi bồi thường phải luôn là CAN_CON_NGUOI_DUYET = CO.",
      "Mở Gmail Thư nháp, đọc lại nội dung, đối chiếu đơn và chính sách rồi người thật mới bấm Gửi. Hệ thống không tự gửi thư trả lời. Sau khi xử lý, ghi ngày trả lời, trạng thái, mã lô và nguyên nhân gốc để dữ liệu hỗ trợ quay lại vận hành sản phẩm."
    ],
    callout:{title:"Ranh giới không tự động hóa",text:"AI chỉ phân loại và soạn bản nháp. Thiệt hại, khách bức xúc, sản phẩm lỗi hàng loạt, tranh chấp thanh toán, hoàn tiền ngoại lệ và yêu cầu vượt chính sách bắt buộc do người kinh doanh duyệt."},
    detailImages:[["m5-21.jpg","m5-22.jpg"],["m5-23.jpg"],[],["m5-24.jpg"]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-07.mp4"
  },
  {
    id:"m5-buoc-09", n:"09", title:"Cảnh báo tồn kho và quyết định thời điểm đặt lô tiếp theo",
    details:[
      "Kiểm tra TON_KHO đã có CO_THE_BAN, BAN_TB_NGAY, thời gian sản xuất và TON_AN_TOAN. Hệ thống tách hàng có thể bán, đang sản xuất, chờ kiểm, hàng lỗi, đang giao và hàng hoàn chưa kiểm; không dùng một con số tồn tổng vì phần lớn hàng có thể chưa sẵn sàng bán.",
      "Chạy 11. Canh bao ton kho. Mã tính SO_NGAY_DU_HANG = CO_THE_BAN / BAN_TB_NGAY, DIEM_DAT_LAI = BAN_TB_NGAY × THOI_GIAN_SAN_XUAT_NGAY + TON_AN_TOAN và TIEN_TRONG_TON. Khi tồn chạm ngưỡng, hệ thống ghi một dòng CANH_BAO và gửi email quản lý.",
      "Trong ví dụ, tồn có thể bán là 17, điểm đặt lại là 57 và còn đủ khoảng 18,3 ngày. Thời gian sản xuất cũng là 18 ngày, nên đặt hôm nay chỉ vừa kịp khi kho gần hết và không còn biên an toàn. Con số thực tế do mã tính từ lượng bán trung bình, có thể khác ví dụ 184 trong phần lý thuyết.",
      "Người kinh doanh tự quyết định đặt bao nhiêu, đặt của ai và khi nào dựa trên tiền mặt, kế hoạch quảng cáo và độ tin cậy của nhà cung cấp. Hệ thống dừng ở cảnh báo, không tự đặt hàng hoặc chuyển tiền. Xử lý xong, đổi DA_XU_LY thành CO để lần chạy sau không báo lại cùng một việc."
    ],
    callout:{title:"Ý nghĩa của bước",text:"Cảnh báo tồn giúp ra quyết định trước khi hết hàng; nó không thay thế kế hoạch vốn hoặc quyền phê duyệt đơn đặt hàng của người kinh doanh."},
    detailImages:[[],["m5-25.jpg"],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-08.mp4"
  },
  {
    id:"m5-buoc-10", n:"10", title:"Tính lợi nhuận, đối soát tiền về và tổng hợp hủy hoàn",
    details:[
      "Mở LOI_NHUAN_DON và điền SO_DU_KIEN cho giá bán, giá vốn nhập kho, bao bì, kho–đóng gói, vận chuyển, phí nền tảng, phí thanh toán, hỗ trợ vận chuyển, dự phòng hoàn hủy, quảng cáo và chi phí khác. Với số minh họa trong sách, tổng chi phí biến đổi là 381.000 đồng và còn lại 118.000 đồng trước thuế và chi phí cố định. SO_DU_KIEN dùng để quyết định trước khi bắt đầu; SO_THUC_TE chỉ cập nhật từ đơn đã giao sau khi số đã đối soát.",
      "Tải CSV đối soát từ kênh bán, đặt tên có chữ DOI_SOAT và đưa vào NAP_DON. Chạy 14. Doi soat ky. Hệ thống ghi DOI_SOAT và tính CHENH_LECH bằng doanh thu ghi nhận trừ phí nền tảng, trừ phí thanh toán, cộng hỗ trợ vận chuyển rồi trừ tiền thực nhận. Bằng 0 là khớp; khác 0 phải ghi chú và yêu cầu chứng từ theo đúng mã đơn.",
      "Trong bộ thử, 8 dòng khớp và DH-0011 lệch 18.000 đồng. Ghi rõ Lech 18000, dang cho san giai trinh, rồi khiếu nại kênh bán. Chưa khóa kỳ và chưa dùng số này cập nhật SO_THUC_TE khi chưa biết nguyên nhân, vì phí khuyến mại, phí vận chuyển theo cân nặng hoặc lỗi hệ thống đều có thể tạo chênh lệch.",
      "Để hoàn tất vòng vận hành, điền MA_LO và NGUYEN_NHAN_GOC cho mọi dòng HOAN_HUY. Chạy 13. Tong hop huy hoan vào cuối tuần; hàm đếm bảy ngày theo nguyên nhân và mã lô, ghi CANH_BAO và gửi thư khi một nguyên nhân vượt 30% hoặc một lô cao gấp hai lần mức trung bình. Không chạy khi còn nguyên nhân gốc trống, vì dòng trống sẽ bị gom vào KHAC và làm mất ý nghĩa phân tích.",
      "Khi cảnh báo chạm ngưỡng, dừng nội dung quảng cáo đang chạy, xem mẫu thật, kiểm tra lô, bao bì và dữ liệu giao hàng trước khi tăng bán. AI chuẩn bị phần tổng hợp; người kinh doanh vẫn quyết định sửa nội dung, từ chối lô, đổi đối tác, hoàn tiền hoặc tăng ngân sách."
    ],
    callout:{title:"Chu trình kiểm soát hằng tuần",text:"Đầu tuần xem đơn giao thành công, lợi nhuận và tồn kho; giữa tuần xem phản hồi, nội dung và tiến độ đối tác; cuối tuần xử lý ngoại lệ, tổng hợp hủy hoàn rồi đối chiếu doanh thu, phí và tiền thực nhận."},
    detailImages:[["m5-26.jpg","m5-27.jpg"],["m5-28.jpg"],[],[],[]], calloutImages:[], defaultVideo:"/steps/videos/model5/part-09.mp4"
  }
];

