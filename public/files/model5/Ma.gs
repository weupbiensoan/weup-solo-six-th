/**
 * VAN_HANH_TMDT - MA.GS  (ban da va loi thu muc va loi khong ra tep moi)
 *
 * NHUNG THU DA SUA SO VOI BAN CU:
 *  1. Thu muc he thong nam gon trong mot thu muc goc VAN_HANH_TMDT, khong con
 *     tim theo ten khap Drive nen khong con nhan nham thu muc trung ten.
 *  2. Bo qua thu muc dang nam trong Thung rac. Ban cu van dung chung, khien tep
 *     moi bi ghi vao thung rac ma nguoi dung khong thay.
 *  3. Muc 5 luon tao PDF moi truoc khi kiem tra danh sach nguoi nhan.
 *     Ban cu thoat som khi moi nha cung cap deu da gui, nen khong bao gio tao tep.
 *  4. Ten tep PDF co them gio phut giay va bat buoc co MA_HANG_CHINH,
 *     khong con sinh ra tep thieu ma dang YEU_CAU_SP__v1.0.
 *  5. Them ba muc menu: Kiem tra thu muc, Lam moi vong gui NCC,
 *     va muc 4b tao ban yeu cau san pham phien ban moi.
 *
 * CACH DUNG LAN DAU:
 *  1. Tao Google Sheets moi, dat ten VAN_HANH_TMDT. De trong hoan toan.
 *  2. Tien ich mo rong -> Apps Script. Xoa ma mau, dan toan bo file nay. Ctrl+S.
 *  3. Cai dat du an -> Thuoc tinh tap lenh -> them KHOA_API, dan khoa API.
 *  4. Chon ham khoiTaoBangTinh -> Chay -> cap quyen.
 *  5. Sang bang tinh, nhan F5.
 *  6. Menu -> dien cot GIA_TRI trong CAU_HINH.
 *  7. Menu -> Tao cay thu muc
 *  8. Menu -> Kiem tra ket noi API
 *  9. Menu -> 1. Tao bieu mau thu du lieu
 * 10. Menu -> Dat trinh kich hoat
 */

// ================================================================
// KHAI BAO
// ================================================================
var TEN_TRANG = ['CAU_HINH','SAN_PHAM','KIEM_TRA_SP','DU_LIEU_THO','NHA_CUNG_CAP',
  'TON_KHO','DON_HANG','HOAN_HUY','DOI_SOAT','NOI_DUNG','LOI_NHUAN_DON','CANH_BAO'];

var COT_TRANG = {
  CAU_HINH: ['KHOA','GIA_TRI','GHI_CHU'],
  SAN_PHAM: ['MA_HANG','TEN_SP','PHIEN_BAN','THANH_PHAN','KICH_THUOC','VAT_LIEU','BAO_BI',
    'GIA_BAN','GIA_VON_NHAP_KHO','MA_LO','TRANG_THAI_MAU','NGAY_DUYET_MAU'],
  KIEM_TRA_SP: ['CAU_HOI','KIEM_TRA_O_DAU','DU_LIEU_THUC_TE','KET_LUAN'],
  DU_LIEU_THO: ['NGAY_THU','NGUON','LOAI_NGUON','NGUYEN_VAN','SAN_PHAM_THAM_CHIEU',
    'NHOM_AI','NHOM_DA_DUYET','MA_TRUNG'],
  NHA_CUNG_CAP: ['MA_NCC','TEN','HANG_MUC','NGUOI_LIEN_HE','EMAIL','SO_LUONG_TOI_THIEU',
    'GIA_CHAO','THOI_GIAN_SX','DIEU_KIEN_THANH_TOAN','DA_GUI_YEU_CAU','NGAY_GUI',
    'DA_NHAN_BAO_GIA','TRANG_THAI_MAU','VAI_TRO'],
  TON_KHO: ['MA_HANG','CO_THE_BAN','DANG_SAN_XUAT','CHO_KIEM_TRA','HANG_LOI','DANG_GIAO',
    'HOAN_CHUA_KIEM','BAN_TB_NGAY','SO_NGAY_DU_HANG','DIEM_DAT_LAI','TIEN_TRONG_TON',
    'NGAY_CAP_NHAT','NGUON_SO_LIEU'],
  DON_HANG: ['MA_DON','NGAY_DAT','KENH_BAN','MA_HANG','SO_LUONG','TIEN_KHACH_TRA','HO_TEN',
    'SO_DIEN_THOAI','DIA_CHI','TRANG_THAI','MA_VAN_DON','NGAY_GUI_KHO','MA_LO','GHI_CHU'],
  HOAN_HUY: ['NGAY','MA_DON','KENH','NHOM_YEU_CAU','MUC_UU_TIEN','TOM_TAT','THONG_TIN_CON_THIEU',
    'MAU_TRA_LOI','CAN_CON_NGUOI_DUYET','NGUOI_XU_LY','TRANG_THAI','NGAY_TRA_LOI','MA_LO',
    'NGUYEN_NHAN_GOC','BEN_CHIU_TRACH_NHIEM','MA_NOI_DUNG'],
  DOI_SOAT: ['MA_DON','NGAY','DOANH_THU_GHI_NHAN','PHI_NEN_TANG','PHI_THANH_TOAN',
    'HO_TRO_VAN_CHUYEN','TIEN_THUC_NHAN','CHENH_LECH','KY_DOI_SOAT','GHI_CHU'],
  NOI_DUNG: ['MA_NOI_DUNG','MA_HANG','LOAI','KENH','TIEU_DE','NOI_DUNG','NGUON_DAN',
    'TRANG_THAI','NGUOI_DUYET','NGAY_DUYET','PHIEN_BAN','LINK','JSON_THO'],
  LOI_NHUAN_DON: ['KHOAN_MUC','SO_DU_KIEN','SO_THUC_TE','NGUON_SO_THUC_TE','GHI_CHU'],
  CANH_BAO: ['NGAY','LOAI_CANH_BAO','MA_HANG','NOI_DUNG','NGUONG','DA_XU_LY']
};

// Cot phai o dinh dang van ban de khong mat so 0 dau hoac bi doi thanh phan tram
var COT_VAN_BAN = {
  DON_HANG: ['SO_DIEN_THOAI','MA_DON','MA_LO'],
  CAU_HINH: ['GIA_TRI'],
  SAN_PHAM: ['MA_LO'],
  HOAN_HUY: ['MA_LO'],
  DOI_SOAT: ['MA_DON']
};

var KHOA_CAU_HINH = [
  ['TEN_THUONG_HIEU','','Ten thuong hieu hien thi trong email va noi dung ban hang'],
  ['MA_HANG_CHINH','','Ma hang cua bo san pham, phai trung MA_HANG trong SAN_PHAM'],
  ['GIA_BAN','','Gia ban le mot bo, don vi dong. Chi ghi so'],
  ['KENH_CHINH','','Ten kenh ban dang dung'],
  ['NHA_CUNG_CAP','OPENAI','Nhan OPENAI hoac ANTHROPIC. Quyet dinh may chu duoc goi'],
  ['MO_HINH_AI','','Ten model gui trong lenh goi API'],
  ['SO_TOKEN_TOI_DA','4000','Ma tu nang len 4000 neu dien thap hon'],
  ['KICH_THUOC_LO_PHAN_NHOM','40','So dong NGUYEN_VAN gui moi lo o muc 3'],
  ['SO_DONG_NAP_MOI_LAN','300','So dong toi da moi lan chay muc 8'],
  ['EMAIL_KHO','','Email doi tac kho, nhan danh sach giao hang o muc 10'],
  ['EMAIL_QUAN_LY','','Email nhan canh bao ton kho muc 11 va tong hop huy hoan muc 13'],
  ['EMAIL_NGUOI_DUYET','','Email nguoi duyet noi dung va thu khach hang'],
  ['NGUOI_XU_LY_MAC_DINH','','Ten nguoi ghi vao cot NGUOI_XU_LY cua HOAN_HUY'],
  ['THOI_GIAN_SAN_XUAT_NGAY','18','So ngay tu dat hang den nhan hang. Nuoi cong thuc DIEM_DAT_LAI'],
  ['TON_AN_TOAN','40','So bo ton an toan. Nuoi cong thuc DIEM_DAT_LAI'],
  ['TY_LE_PHI_NEN_TANG','','Ty le phan tram phi san. Chi ghi so, vi du 9'],
  ['TY_LE_PHI_THANH_TOAN','','Ty le phan tram phi thanh toan. Chi ghi so'],
  ['HO_TRO_VAN_CHUYEN','','Muc ho tro van chuyen tren moi don. Chi ghi so'],
  ['NGUONG_TY_LE_NGUYEN_NHAN','30','Canh bao khi mot nguyen nhan chiem qua ty le nay phan tram'],
  ['NGUONG_TY_LE_LO','2','Canh bao khi mot ma lo co ty le hoan cao gap may lan trung binh'],
  ['ID_THU_MUC_GOC','','Do ham Tao cay thu muc tu ghi. Thu muc chua ba thu muc con'],
  ['ID_THU_MUC_NAP_DU_LIEU','','Do ham Tao cay thu muc tu ghi'],
  ['ID_THU_MUC_NAP_DON','','Do ham Tao cay thu muc tu ghi'],
  ['ID_THU_MUC_HO_SO_NCC','','Do ham Tao cay thu muc tu ghi'],
  ['LINK_FORM_NHU_CAU','','Do muc 1 tu ghi'],
  ['PROMPT_PHAN_NHOM','Ban nhan mot mang JSON, moi phan tu co hai truong so_dong va cau. Hay gan moi cau vao dung mot nhom van de. Ten nhom viet bang tieng Viet khong dau, viet hoa, toi da bon tu, noi bang dau gach duoi. Chi dua vao noi dung cau duoc cung cap. Khong them nhom khong xuat hien trong du lieu. Khong suy doan nhu cau tu kien thuc chung. Tach rieng van de cua san pham khoi van de giao hang va noi dung quang cao. Cau khong noi ve van de nao thi gan nhom KHONG_RO. Tra ve DUNG MOT mang JSON gom cac phan tu co hai truong so_dong va nhom. Khong them bat ky chu nao ngoai mang do.','Cau lenh muc 3'],
  ['PROMPT_YEU_CAU_SP','Viet ban yeu cau san pham gom ba nhom. Mot: khach hang, tinh huong su dung, van de can giai quyet. Hai: cau hinh san pham gom thanh phan, kich thuoc, vat lieu, bao bi, tieu chi kiem mau. Ba: gioi han kinh doanh gom gia ban muc tieu, gia von toi da, phan nha cung cap khong duoc tu y thay doi, noi dung khong duoc phep cam ket. Moi phan chua ro trong du lieu thi ghi dung chu CAN_XAC_NHAN. Khong tu chon nha cung cap. Khong tu dat chung nhan, chat lieu hoac cong dung chua co trong du lieu. Tra ve van ban thuan, khong dung dau sao va dau thang cua Markdown, khong dung bang.','Cau lenh muc 4'],
  ['PROMPT_KIEM_MAU','Doc ban yeu cau san pham va sinh danh sach tieu chi kiem mau. Moi tieu chi mot dong theo dang: ma tieu chi, ten tieu chi, cach do hoac kiem, nguong chap nhan. Khong danh gia cam giac cam, do ben hoac muc chap nhan cua vat lieu. Khong ket luan lo hang dat hay khong dat. Tra ve van ban thuan, khong dung dau sao va dau thang cua Markdown.','Cau lenh muc 6'],
  ['PROMPT_SAN_PHAM','Doc ban yeu cau san pham va rut ra cac truong ky thuat. Tra ve DUNG MOT doi tuong JSON co bay truong: ten_sp, thanh_phan, kich_thuoc, vat_lieu, bao_bi, gia_ban, gia_von_nhap_kho. Truong thanh_phan liet ke ngan gon cac mon trong bo, phan cach bang dau phay. Truong kich_thuoc la kich thuoc tong the khi cat trong hop. Truong gia_ban va gia_von_nhap_kho chi ghi so, khong don vi, khong dau cham. Truong nao ban yeu cau ghi CAN_XAC_NHAN hoac khong tim thay thi de chuoi rong. Khong tu suy doan gia tri khong co trong ban yeu cau. Khong them bat ky chu nao ngoai doi tuong JSON.','Cau lenh tao dong SAN_PHAM o muc 6'],
  ['PROMPT_NOI_DUNG','Chi dung thong tin trong tai lieu duoc cung cap. Viet ba phan tach nhau bang dong ba dau gach ngang: mot la mo ta san pham cho trang ban hang; hai la bo cau hoi thuong gap; ba la kich ban video ngan duoi ba phut. Khong hua hen cong dung khong co trong tai lieu. Moi con so phai truy duoc ve tai lieu nguon. Khong dung tu ngu tuyet doi nhu tot nhat hay duy nhat. Tra ve van ban thuan, khong dung dau sao va dau thang cua Markdown.','Cau lenh muc 7'],
  ['PROMPT_PHAN_LOAI_THU','Doc thu khach hang. Tra ve DUNG MOT doi tuong JSON. Ten sau truong phai viet chinh xac bang chu thuong khong dau, noi bang dau gach duoi, khong doi sang kieu viet khac: tom_tat, nhom_yeu_cau, muc_uu_tien, thong_tin_con_thieu, mau_tra_loi, can_con_nguoi_duyet. Gia tri: tom_tat toi da ba cau; nhom_yeu_cau la mot cum ngan; muc_uu_tien chi nhan CAO hoac TRUNG_BINH hoac THAP; thong_tin_con_thieu liet ke thu con thieu de xu ly; mau_tra_loi la thu tra loi lich su, khong hua den bu, khong cam ket thoi gian giao cu the; can_con_nguoi_duyet chi nhan CO hoac KHONG. Bat buoc dat can_con_nguoi_duyet la CO neu thu co bat ky y nao sau day: doi hoan tien, doi huy don, khieu nai chat luong, nghi ngo quang cao sai, van de an toan, doi boi thuong. Moi truong deu phai co mat, khong duoc bo truong nao. Khong them chu nao ngoai doi tuong JSON.','Cau lenh muc 12'],
  ['MAU_THU_YEU_CAU_BAO_GIA','Kinh gui quy doi tac, chung toi gui kem ban yeu cau san pham va mong nhan duoc bao gia, so luong toi thieu, thoi gian san xuat va dieu kien thanh toan.','Mau thu muc 5'],
  ['MAU_THU_GUI_KHO','Kinh gui bo phan kho, day la danh sach don can xuat. Vui long doi chieu ma hang va ma lo truoc khi dong goi.','Mau thu muc 10'],
  ['MAU_THU_CANH_BAO_TON','Canh bao ton kho: cac ma hang duoi day da cham diem dat lai. Vui long xem xet ke hoach dat lo tiep theo.','Mau thu muc 11']
];

var CAU_HOI_KIEM_TRA_SP = [
  'San pham co de van chuyen va it vo hong khong',
  'Chi phi con lai tren mot don la bao nhieu',
  'Hang co de luu kho va thoi han su dung co dai khong',
  'Ty le doi tra du kien co thap khong',
  'Nha cung cap co dap ung so luong nho khong',
  'Yeu cau phap ly va giay to gom nhung gi',
  'Noi dung ban hang co de kiem chung khong',
  'Co nguon cung thay the khi nha cung cap chinh gap su co khong'];

var KHOAN_MUC_LOI_NHUAN = ['GIA_BAN','GIA_VON_NHAP_KHO','BAO_BI','PHI_KHO_VA_DONG_GOI',
  'PHI_VAN_CHUYEN','PHI_NEN_TANG','PHI_THANH_TOAN','HO_TRO_VAN_CHUYEN','DU_PHONG_HOAN_HUY',
  'CHI_PHI_QUANG_CAO','CHI_PHI_KHAC'];

var DANH_SACH_XO = [
  ['DON_HANG','TRANG_THAI',['CHO_XAC_NHAN','DU_DIEU_KIEN_XUAT','DA_GUI_KHO','DANG_GIAO',
    'GIAO_THANH_CONG','HUY','HOAN','DA_DOI_SOAT']],
  ['NHA_CUNG_CAP','VAI_TRO',['CHINH','DU_PHONG']],
  ['NHA_CUNG_CAP','TRANG_THAI_MAU',['CHO_DUYET','DA_DUYET','TU_CHOI']],
  ['SAN_PHAM','TRANG_THAI_MAU',['CHO_DUYET','DA_DUYET','TU_CHOI']],
  ['NOI_DUNG','TRANG_THAI',['BAN_AI','CHO_DUYET','DA_DUYET']],
  ['HOAN_HUY','NGUYEN_NHAN_GOC',['SAN_PHAM','BAO_BI','GIAO_HANG','NOI_DUNG_QUANG_CAO',
    'KHACH_DOI_Y','KHAC']],
  ['HOAN_HUY','CAN_CON_NGUOI_DUYET',['CO','KHONG']],
  ['HOAN_HUY','TRANG_THAI',['CHO_XU_LY','DA_TAO_NHAP','DA_TRA_LOI','DA_DONG']],
  ['HOAN_HUY','MUC_UU_TIEN',['CAO','TRUNG_BINH','THAP']],
  ['CANH_BAO','DA_XU_LY',['CO','KHONG']]
];

var TIEN_TO_HE_THONG = '[HE THONG]';   // bo loc Gmail phai loai tru tien to nay
var NHAN_CHO = 'KHTHU-CHO-XU-LY';
var NHAN_XONG = 'KHTHU-DA-PHAN-LOAI';
var SO_DONG_CONG_THUC = 60;
var THU_MUC_GOC = 'VAN_HANH_TMDT';     // moi thu muc he thong deu nam trong day

// ================================================================
// MENU
// ================================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Van hanh don hang')
    .addItem('Tao khung trang tinh','khoiTaoBangTinh')
    .addItem('Sua CAU_HINH','suaCauHinh')
    .addItem('Tao cay thu muc','taoCayThuMuc')
    .addItem('Kiem tra thu muc','chanDoanThuMuc')
    .addItem('Dat trinh kich hoat','datTrinhKichHoat')
    .addItem('Kiem tra ket noi API','kiemTraKetNoiAPI')
    .addItem('Mo bang dieu khien','moBangDieuKhien')
    .addSeparator()
    .addItem('1. Tao bieu mau thu du lieu','m01_taoBieuMau')
    .addItem('2. Nap du lieu nhu cau','m02_napDuLieuNhuCau')
    .addItem('3. Phan nhom nhu cau','m03_phanNhomNhuCau')
    .addItem('4. Tao ban yeu cau san pham','m04_taoBanYeuCauSP')
    .addItem('4b. Tao ban yeu cau SP phien ban moi','m04b_taoBanYeuCauSPMoi')
    .addItem('5. Gui yeu cau lay bao gia','m05_guiYeuCauBaoGia')
    .addItem('5b. Lam moi vong gui NCC','lamMoiVongGuiNCC')
    .addItem('6. Tao danh sach kiem mau','m06_taoDanhSachKiemMau')
    .addItem('7. Tao noi dung ban hang','m07_taoNoiDungBanHang')
    .addSeparator()
    .addItem('8. Nhap don hang','m08_nhapDonHang')
    .addItem('9. Kiem tra don','m09_kiemTraDon')
    .addItem('10. Gui kho','m10_guiKho')
    .addItem('11. Canh bao ton kho','m11_canhBaoTonKho')
    .addItem('12. Phan loai thu ho tro','m12_phanLoaiThu')
    .addItem('13. Tong hop huy hoan','m13_tongHopHoanHuy')
    .addItem('14. Doi soat ky','m14_doiSoatKy')
    .addToUi();
}

// ================================================================
// TIEN ICH. Khong dung getLastRow, getLastColumn hay appendRow:
// o van ban dai va dinh dang Bang lam ba thu do tra ve sai.
// ================================================================
function ui_() { return SpreadsheetApp.getUi(); }

var _BDK = { bat: false, tin: [] };
function bao_(td, nd) {
  if (_BDK.bat) { _BDK.tin.push(td + ': ' + nd); return; }
  try { ui_().alert(td, nd, ui_().ButtonSet.OK); } catch (e) { console.log(td + ': ' + nd); }
}

function tuDong_() { try { SpreadsheetApp.getUi(); return false; } catch (e) { return true; } }
function homNay_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
function dauThoiGian_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
}

function layTrang(ten) {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ten);
  if (!s) throw new Error('Khong tim thay trang ' + ten + '. Chay Tao khung trang tinh truoc.');
  return s;
}

function tieuDe_(sheet) {
  var goc = COT_TRANG[sheet.getName()];
  var n = Math.min(goc ? goc.length : 1, sheet.getMaxColumns());
  return sheet.getRange(1, 1, 1, n).getValues()[0].map(function (v) { return String(v).trim(); });
}

function chiSoCot(sheet, ten) { return tieuDe_(sheet).indexOf(ten) + 1; }

function dongTrongDauTien_(sheet) {
  var het = sheet.getMaxRows();
  var cot1 = sheet.getRange(1, 1, het, 1).getValues();
  for (var i = 1; i < cot1.length; i++) {
    if (String(cot1[i][0]).trim() === '') return i + 1;
  }
  return het + 1;
}

function docBang_(sheet) {
  var head = tieuDe_(sheet);
  var cuoi = dongTrongDauTien_(sheet) - 1;
  if (cuoi < 2) return { head: head, rows: [] };
  return { head: head, rows: sheet.getRange(2, 1, cuoi - 1, head.length).getValues() };
}

function themDong_(sheet, obj) {
  var head = tieuDe_(sheet), dong = [];
  for (var i = 0; i < head.length; i++) {
    dong.push(obj.hasOwnProperty(head[i]) ? obj[head[i]] : '');
  }
  var r = dongTrongDauTien_(sheet);
  if (r > sheet.getMaxRows() - 1) sheet.insertRowsAfter(sheet.getMaxRows(), 50);
  sheet.getRange(r, 1, 1, head.length).setValues([dong]);
  SpreadsheetApp.flush();
  return r;
}

function docCauHinh(khoa) {
  var d = docBang_(layTrang('CAU_HINH'));
  var cK = d.head.indexOf('KHOA'), cG = d.head.indexOf('GIA_TRI');
  if (cK === -1 || cG === -1) throw new Error('CAU_HINH thieu cot KHOA hoac GIA_TRI. Chay Sua CAU_HINH.');
  for (var i = 0; i < d.rows.length; i++) {
    if (String(d.rows[i][cK]).trim() === khoa) return String(d.rows[i][cG]).trim();
  }
  return '';
}

function ghiCauHinh(khoa, giaTri) {
  var s = layTrang('CAU_HINH'), d = docBang_(s);
  var cK = d.head.indexOf('KHOA'), cG = d.head.indexOf('GIA_TRI');
  for (var i = 0; i < d.rows.length; i++) {
    if (String(d.rows[i][cK]).trim() === khoa) {
      s.getRange(i + 2, cG + 1).setValue(giaTri);
      return true;
    }
  }
  return false;
}

function soCauHinh_(khoa) {
  var v = String(docCauHinh(khoa)).replace(/[^0-9.\-]/g, '');
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

/**
 * Lay thu muc he thong theo ID da ghi trong CAU_HINH.
 * KHONG con do theo ten khap Drive: chinh cach do ten gay ra viec
 * nhan nham thu muc trung ten va thu muc trong Thung rac.
 */
function thuMuc_(khoa, ten) {
  var id = docCauHinh(khoa);
  if (!id) {
    throw new Error('O ' + khoa + ' trong CAU_HINH dang trong. ' +
                    'Chay menu Tao cay thu muc de he thong tu dien ID.');
  }
  var f;
  try { f = DriveApp.getFolderById(id); }
  catch (e) {
    throw new Error('ID trong o ' + khoa + ' khong mo duoc (' + id + '). ' +
                    'Thu muc da bi xoa vinh vien hoac ban khong con quyen. ' +
                    'Xoa trang o do roi chay lai menu Tao cay thu muc.');
  }
  if (f.isTrashed()) {
    throw new Error('Thu muc ' + ten + ' dang nam trong Thung rac (id ' + id + '). ' +
                    'Vao Thung rac khoi phuc no, hoac xoa trang o ' + khoa +
                    ' trong CAU_HINH roi chay lai menu Tao cay thu muc.');
  }
  return f;
}

/**
 * Bang tinh ngon ngu Viet dung dau cham phay de ngan tham so cong thuc,
 * ngon ngu Anh dung dau phay. Do mot lan roi nho lai.
 */
function dauPhanCach_() {
  var p = PropertiesService.getDocumentProperties();
  var da = p.getProperty('DAU_PHAN_CACH');
  if (da) return da;
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var o = s.getRange(s.getMaxRows(), s.getMaxColumns());
  var cu = o.getFormula();
  o.setFormula('=IF(1=1,1,2)');
  SpreadsheetApp.flush();
  var dau = String(o.getDisplayValue()).indexOf('#ERROR') > -1 ? ';' : ',';
  if (cu) o.setFormula(cu); else o.clearContent();
  p.setProperty('DAU_PHAN_CACH', dau);
  return dau;
}

function bam_(s) {
  var chuan = String(s).toLowerCase().replace(/[.,;:!?"'()\-]/g, '').replace(/\s+/g, ' ').trim();
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, chuan)
    .map(function (b) { return ((b & 0xFF) + 0x100).toString(16).slice(1); }).join('');
}

function xoaCaNhan_(s) {
  return String(s).replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
                  .replace(/(?:\+84|0)\d{8,10}/g, '[sdt]');
}

function boMarkdown_(s) {
  return String(s).replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').replace(/^\s*\|/gm, '');
}

function truong_(o, ten) {
  if (!o || typeof o !== 'object') return '';
  var chuan = String(ten).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (var k in o) {
    if (String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === chuan) {
      var v = o[k];
      if (v === null || v === undefined) return '';
      if (Array.isArray(v)) return v.join('; ');
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    }
  }
  return '';
}

/**
 * Tach JSON tu phan hoi cua mo hinh.
 * Lay dau mo NGOAI CUNG, khong lay dau ngoac vuong dau tien:
 * mot doi tuong co truong la mang se bi cat nham giua chung.
 */
function tachJson_(s) {
  var t = String(s).replace(/```json|```/g, '').trim();

  var iMoc = t.indexOf('{'), iVuong = t.indexOf('[');
  var moc, dong;
  if (iMoc === -1 && iVuong === -1) {
    throw new Error('Phan hoi khong chua JSON: ' + t.substring(0, 300));
  }
  if (iVuong === -1 || (iMoc > -1 && iMoc < iVuong)) { moc = '{'; dong = '}'; }
  else { moc = '['; dong = ']'; }

  var d = t.indexOf(moc);
  var c = t.lastIndexOf(dong);
  if (d === -1 || c === -1 || c < d) {
    throw new Error('Phan hoi khong chua JSON: ' + t.substring(0, 300));
  }

  try {
    return JSON.parse(t.substring(d, c + 1));
  } catch (e) {
    // Thu can bang dau ngoac tu vi tri mo, bo qua dau ngoac nam trong chuoi
    var sau = 0, trongChuoi = false, thoat = false;
    for (var i = d; i < t.length; i++) {
      var ch = t.charAt(i);
      if (thoat) { thoat = false; continue; }
      if (ch === '\\') { thoat = true; continue; }
      if (ch === '"') { trongChuoi = !trongChuoi; continue; }
      if (trongChuoi) continue;
      if (ch === moc) sau++;
      else if (ch === dong) {
        sau--;
        if (sau === 0) return JSON.parse(t.substring(d, i + 1));
      }
    }
    throw new Error('Khong doc duoc JSON: ' + e.message + ' | ' + t.substring(0, 300));
  }
}

function maMoi_(sheet, cot, tienTo) {
  var d = docBang_(sheet), i = d.head.indexOf(cot), max = 0;
  d.rows.forEach(function (r) {
    var m = String(r[i]).match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return tienTo + ('000' + (max + 1)).slice(-4);
}

// ================================================================
// GUI THONG BAO VAN HANH qua email cua nguoi duyet.
// ================================================================
function baoVanHanh_(tieuDe, than, khan) {
  var mail = docCauHinh('EMAIL_NGUOI_DUYET') || docCauHinh('EMAIL_QUAN_LY');
  if (!mail) {
    console.error('Khong gui duoc thong bao: ca EMAIL_NGUOI_DUYET va EMAIL_QUAN_LY deu trong.');
    return [];
  }
  try {
    MailApp.sendEmail(mail, TIEN_TO_HE_THONG + (khan ? ' [GAP] ' : ' ') + tieuDe, than);
    return ['Email'];
  } catch (e) {
    console.error('Gui thong bao that bai: ' + e.message);
    return [];
  }
}

// ================================================================
// KHOI TAO
// ================================================================
function khoiTaoBangTinh() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), bao = [];

  TEN_TRANG.forEach(function (ten) {
    var sheet = ss.getSheetByName(ten);
    if (!sheet) { sheet = ss.insertSheet(ten); bao.push('Tao trang ' + ten); }
    var cot = COT_TRANG[ten];
    if (sheet.getMaxColumns() < cot.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), cot.length - sheet.getMaxColumns());
    }
    var ht = sheet.getRange(1, 1, 1, cot.length).getValues()[0]
                  .map(function (v) { return String(v).trim(); });
    var can = false;
    for (var i = 0; i < cot.length; i++) if (ht[i] !== cot[i]) can = true;
    if (can) {
      sheet.getRange(1, 1, 1, cot.length).setValues([cot])
           .setFontWeight('bold').setBackground('#1e4620').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    // Cot phai la van ban de khong mat so 0 dau va khong bi doi thanh phan tram
    (COT_VAN_BAN[ten] || []).forEach(function (tenCot) {
      var c = cot.indexOf(tenCot) + 1;
      if (c > 0) sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
    });
  });

  ['Trang tính1','Sheet1','Trang tinh1','Trang tính 1'].forEach(function (t) {
    var s = ss.getSheetByName(t);
    if (s && ss.getSheets().length > 1) { ss.deleteSheet(s); bao.push('Xoa trang mac dinh'); }
  });

  [['Don CAU_HINH', donCauHinh_], ['Dien du lieu mac dinh', dienDuLieuMacDinh_],
   ['Dat danh sach xo', datDanhSachXo_], ['Dat cong thuc TON_KHO', datCongThucTonKho_],
   ['Khoa dong tieu de', khoaTieuDe_]].forEach(function (b) {
    try { bao = bao.concat(b[1]()); }
    catch (e) {
      bao.push('LOI o buoc "' + b[0] + '": ' + e.message);
      console.error(b[0] + ': ' + e.message);
    }
  });
  bao_('Tao khung trang tinh', bao.length ? bao.join('\n') : 'Da day du, khong tao them.');
}

/**
 * Don CAU_HINH: xoa dong trung khoa, them khoa con thieu,
 * giu nguyen gia tri nguoi dung da dien.
 */
function donCauHinh_() {
  var s = layTrang('CAU_HINH'), bao = [];
  var d = docBang_(s), daCo = {}, trung = 0;

  // Gom gia tri hien co, uu tien dong co gia tri
  d.rows.forEach(function (r) {
    var k = String(r[0]).trim();
    if (!k) return;
    var v = String(r[1]).trim();
    if (!daCo.hasOwnProperty(k) || (!daCo[k] && v)) {
      if (daCo.hasOwnProperty(k)) trung++;
      daCo[k] = v;
    } else { trung++; }
  });

  // Viet lai toan bo theo thu tu chuan
  var rows = KHOA_CAU_HINH.map(function (k) {
    return [k[0], daCo.hasOwnProperty(k[0]) ? daCo[k[0]] : k[1], k[2]];
  });
  // Giu lai khoa la do nguoi tu them
  Object.keys(daCo).forEach(function (k) {
    var co = KHOA_CAU_HINH.some(function (x) { return x[0] === k; });
    if (!co) rows.push([k, daCo[k], 'Khoa do nguoi dung tu them']);
  });

  if (s.getMaxRows() < rows.length + 1) {
    s.insertRowsAfter(s.getMaxRows(), rows.length + 1 - s.getMaxRows());
  }
  s.getRange(2, 1, s.getMaxRows() - 1, 3).clearContent();
  s.getRange(2, 1, rows.length, 3).setValues(rows);
  // Xoa moi thu ngoai ba cot dau
  if (s.getMaxColumns() > 3) s.getRange(1, 4, s.getMaxRows(), s.getMaxColumns() - 3).clearContent();

  bao.push('CAU_HINH: ' + rows.length + ' khoa' + (trung ? ', da bo ' + trung + ' dong trung' : ''));
  return bao;
}

function dienDuLieuMacDinh_() {
  var bao = [];
  var sK = layTrang('KIEM_TRA_SP');
  if (dongTrongDauTien_(sK) < 3) {
    sK.getRange(2, 1, CAU_HOI_KIEM_TRA_SP.length, 1)
      .setValues(CAU_HOI_KIEM_TRA_SP.map(function (c) { return [c]; }));
    bao.push('Dien 8 cau hoi vao KIEM_TRA_SP');
  }
  var sL = layTrang('LOI_NHUAN_DON');
  if (dongTrongDauTien_(sL) < 3) {
    var d = dauPhanCach_();
    var rows = KHOAN_MUC_LOI_NHUAN.map(function (k) { return [k, '', '', '', '']; });
    sL.getRange(2, 1, rows.length, 5).setValues(rows);
    var dCuoi = 1 + rows.length, dTong = dCuoi + 1;
    sL.getRange(dTong, 1).setValue('TONG_CHI_PHI_BIEN_DOI');
    sL.getRange(dTong, 2).setFormula('=SUM(B3:B' + dCuoi + ')');
    sL.getRange(dTong, 3).setFormula('=SUM(C3:C' + dCuoi + ')');
    sL.getRange(dTong + 1, 1).setValue('CON_LAI_TRUOC_THUE');
    sL.getRange(dTong + 1, 2).setFormula('=IF(B2=""' + d + '""' + d + 'B2-B' + dTong + ')');
    sL.getRange(dTong + 1, 3).setFormula('=IF(C2=""' + d + '""' + d + 'C2-C' + dTong + ')');
    bao.push('Dien khoan muc va cong thuc vao LOI_NHUAN_DON');
  }
  return bao;
}

function datDanhSachXo_() {
  var xong = 0, hong = [];
  DANH_SACH_XO.forEach(function (dd) {
    try {
      var sheet = layTrang(dd[0]), c = chiSoCot(sheet, dd[1]);
      if (c < 1) return;
      var qt = SpreadsheetApp.newDataValidation().requireValueInList(dd[2], true)
               .setAllowInvalid(false).build();
      sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setDataValidation(qt);
      xong++;
    } catch (e) {
      // Trang da bi chuyen sang dinh dang Bang thi cot bi khoa kieu du lieu
      hong.push(dd[0] + '.' + dd[1]);
      console.error('Danh sach xo ' + dd[0] + '.' + dd[1] + ': ' + e.message);
    }
  });
  var bao = ['Dat danh sach xo: ' + xong + '/' + DANH_SACH_XO.length + ' cot'];
  if (hong.length) {
    bao.push('KHONG dat duoc cho: ' + hong.join(', ') +
      '. Cac trang nay dang o dinh dang Bang cua Google Sheets. ' +
      'Bam chip Bang o goc tren vung du lieu, chon Chuyen doi thanh dai o, roi chay lai muc nay.');
  }
  return bao;
}

function congThucTonKho_(r) {
  var d = dauPhanCach_(), s = layTrang('TON_KHO');
  var K = function (n) { return String.fromCharCode(64 + n); };
  var Ma = K(chiSoCot(s, 'MA_HANG')) + r;
  var Co = K(chiSoCot(s, 'CO_THE_BAN')) + r;
  var Tb = K(chiSoCot(s, 'BAN_TB_NGAY')) + r;
  return {
    soNgay: '=IF(OR(' + Tb + '=""' + d + Tb + '=0)' + d + '""' + d + Co + '/' + Tb + ')',
    diem: '=IF(' + Tb + '=""' + d + '""' + d + Tb +
      '*IFERROR(VALUE(VLOOKUP("THOI_GIAN_SAN_XUAT_NGAY"' + d + 'CAU_HINH!A:B' + d + '2' + d +
      'FALSE))' + d + '0)+IFERROR(VALUE(VLOOKUP("TON_AN_TOAN"' + d + 'CAU_HINH!A:B' + d + '2' + d +
      'FALSE))' + d + '0))',
    tien: '=IF(' + Ma + '=""' + d + '""' + d + Co +
      '*IFERROR(VLOOKUP(' + Ma + d + 'SAN_PHAM!A:I' + d + '9' + d + 'FALSE)' + d + '0))'
  };
}

function datCongThucTonKho_() {
  var s = layTrang('TON_KHO');
  var cNg = chiSoCot(s, 'SO_NGAY_DU_HANG'), cDi = chiSoCot(s, 'DIEM_DAT_LAI'),
      cTi = chiSoCot(s, 'TIEN_TRONG_TON');
  for (var r = 2; r <= SO_DONG_CONG_THUC; r++) {
    var ct = congThucTonKho_(r);
    s.getRange(r, cNg).setFormula(ct.soNgay);
    s.getRange(r, cDi).setFormula(ct.diem);
    s.getRange(r, cTi).setFormula(ct.tien);
  }
  return ['Dat 3 cong thuc vao TON_KHO, dau ngan tham so "' + dauPhanCach_() + '"'];
}

function khoaTieuDe_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), me = Session.getEffectiveUser(), dem = 0;
  TEN_TRANG.forEach(function (ten) {
    var s = ss.getSheetByName(ten);
    if (!s) return;
    s.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
      if (p.getDescription() === 'Khoa dong tieu de') p.remove();
    });
    try {
      var p = s.getRange(1, 1, 1, s.getMaxColumns()).protect();
      p.setDescription('Khoa dong tieu de');
      p.addEditor(me);
      p.removeEditors(p.getEditors().filter(function (u) { return u.getEmail() !== me.getEmail(); }));
      dem++;
    } catch (e) { console.error('Khoa tieu de ' + ten + ': ' + e.message); }
  });
  return ['Khoa dong tieu de: ' + dem + '/' + TEN_TRANG.length + ' trang'];
}

function suaCauHinh() {
  var s = layTrang('CAU_HINH'), bao = [];
  var n = Math.max(s.getMaxColumns(), 3);
  var td = s.getRange(1, 1, 1, n).getValues()[0].map(function (v) { return String(v).trim(); });
  var chuan = ['KHOA','GIA_TRI','GHI_CHU'];
  for (var i = 0; i < 3; i++) {
    if (td[i] !== chuan[i]) { s.getRange(1, i + 1).setValue(chuan[i]); bao.push('Sua tieu de cot ' + (i + 1)); }
  }
  if (n > 3) { s.getRange(1, 4, 1, n - 3).clearContent(); }
  bao = bao.concat(donCauHinh_());
  bao_('Sua CAU_HINH', bao.join('\n'));
}

// ================================================================
// CAY THU MUC
// Nguyen tac: tat ca nam trong mot thu muc goc VAN_HANH_TMDT.
// Chi tim thu muc con BEN TRONG thu muc goc, khong quet ca Drive,
// va bo qua moi thu muc dang nam trong Thung rac.
// ================================================================
function demFile_(f) {
  var it = f.getFiles(), n = 0;
  while (it.hasNext()) { it.next(); n++; }
  return n;
}

function conKhongRac_(cha, ten) {
  var it = cha.getFoldersByName(ten), ds = [];
  while (it.hasNext()) {
    var f = it.next();
    if (!f.isTrashed()) ds.push(f);
  }
  return ds;
}

function timKhapDrive_(ten) {
  var it = DriveApp.getFoldersByName(ten), ds = [];
  while (it.hasNext()) {
    var f = it.next();
    if (!f.isTrashed()) ds.push(f);
  }
  return ds;
}

function taoCayThuMuc() {
  var bao = [];

  // Buoc 1: thu muc goc
  var goc, dsGoc = conKhongRac_(DriveApp.getRootFolder(), THU_MUC_GOC);
  if (dsGoc.length) {
    goc = dsGoc[0];
    bao.push('Thu muc goc ' + THU_MUC_GOC + ': dung lai ban co san.');
    if (dsGoc.length > 1) {
      bao.push('  CANH BAO: co ' + dsGoc.length + ' thu muc goc trung ten, dang dung cai dau tien.');
    }
  } else {
    goc = DriveApp.getRootFolder().createFolder(THU_MUC_GOC);
    bao.push('Thu muc goc ' + THU_MUC_GOC + ': DA TAO MOI.');
  }
  ghiCauHinh('ID_THU_MUC_GOC', goc.getId());

  // Buoc 2: ba thu muc con
  var can = [['NAP_DU_LIEU','ID_THU_MUC_NAP_DU_LIEU'],
             ['NAP_DON','ID_THU_MUC_NAP_DON'],
             ['HO_SO_GUI_NCC','ID_THU_MUC_HO_SO_NCC']];

  can.forEach(function (d) {
    var ten = d[0], f;
    bao.push('');
    bao.push('--- ' + ten + ' ---');

    var trongGoc = conKhongRac_(goc, ten);
    if (trongGoc.length) {
      f = trongGoc[0];
      bao.push('Dung lai thu muc da nam trong ' + THU_MUC_GOC +
               ' (' + demFile_(f) + ' tep ben trong).');
      if (trongGoc.length > 1) {
        bao.push('CANH BAO: co ' + trongGoc.length + ' thu muc trung ten trong goc.');
      }
    } else {
      // Chua co trong goc. Xem trong Drive con ban cu nao khong.
      var ngoai = timKhapDrive_(ten);
      if (ngoai.length === 1) {
        f = ngoai[0];
        try {
          f.moveTo(goc);
          bao.push('Da chuyen thu muc cu vao ' + THU_MUC_GOC +
                   ' (' + demFile_(f) + ' tep, giu nguyen toan bo noi dung).');
        } catch (e) {
          bao.push('Dung lai thu muc cu tai vi tri hien tai, khong chuyen duoc: ' + e.message);
        }
      } else if (ngoai.length > 1) {
        f = goc.createFolder(ten);
        bao.push('DA TAO MOI mot thu muc rong, vi trong Drive co ' + ngoai.length +
                 ' thu muc trung ten nen khong the tu chon.');
        bao.push('He thong se chi dung thu muc moi. Cac thu muc cu:');
        ngoai.forEach(function (g, k) {
          bao.push('  ' + (k + 1) + '. ' + demFile_(g) + ' tep - ' + g.getUrl());
        });
        bao.push('Neu con tep can dung, hay keo tay sang thu muc moi.');
      } else {
        f = goc.createFolder(ten);
        bao.push('DA TAO MOI.');
      }
    }

    ghiCauHinh(d[1], f.getId());
    bao.push('ID da ghi vao ' + d[1] + ': ' + f.getId());
    bao.push('Duong dan: ' + f.getUrl());
  });

  bao.push('');
  bao.push('Thu muc goc: ' + goc.getUrl());
  bao_('Tao cay thu muc', bao.join('\n'));
}

/**
 * Kiem tra thu muc: doi chieu ID trong CAU_HINH voi thu muc that tren Drive.
 * Chay khi thay tep khong xuat hien o noi mong doi.
 */
function chanDoanThuMuc() {
  var can = [['VAN_HANH_TMDT','ID_THU_MUC_GOC'],
             ['NAP_DU_LIEU','ID_THU_MUC_NAP_DU_LIEU'],
             ['NAP_DON','ID_THU_MUC_NAP_DON'],
             ['HO_SO_GUI_NCC','ID_THU_MUC_HO_SO_NCC']];
  var bao = [], canSua = 0;

  can.forEach(function (d) {
    bao.push('--- ' + d[0] + ' ---');
    var id = docCauHinh(d[1]);
    if (!id) {
      bao.push('O ' + d[1] + ' dang TRONG. Chay menu Tao cay thu muc.');
      canSua++;
    } else {
      try {
        var f = DriveApp.getFolderById(id);
        bao.push('ID       : ' + id);
        bao.push('Ten that : ' + f.getName());
        bao.push('Thung rac: ' + (f.isTrashed() ? 'CO -- DAY LA LOI' : 'khong'));
        bao.push('So tep   : ' + demFile_(f));
        bao.push('Duong dan: ' + f.getUrl());
        if (f.isTrashed()) canSua++;
        if (f.getName() !== d[0]) {
          bao.push('CANH BAO: ten thu muc khong khop voi ten mong doi.');
          canSua++;
        }
      } catch (e) {
        bao.push('ID KHONG MO DUOC: ' + e.message);
        canSua++;
      }
    }
    var trung = timKhapDrive_(d[0]);
    bao.push('So thu muc trung ten tren Drive: ' + trung.length +
             (trung.length > 1 ? ' -- nen don bot' : ''));
    bao.push('');
  });

  bao.push(canSua ? 'Ket luan: co ' + canSua + ' diem can xu ly. ' +
                    'Cach nhanh nhat la chay lai menu Tao cay thu muc.'
                  : 'Ket luan: thu muc binh thuong, khong can lam gi.');
  bao_('Kiem tra thu muc', bao.join('\n'));
}

function datTrinhKichHoat() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() !== 'nhanTraLoiForm') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('m02_napDuLieuNhuCau').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('m08_nhapDonHang').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('m11_canhBaoTonKho').timeBased().everyDays(1).atHour(7).create();
  ScriptApp.newTrigger('m12_phanLoaiThu').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('m13_tongHopHoanHuy').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(16).create();
  ScriptApp.newTrigger('baoCuoiNgay').timeBased().everyDays(1).atHour(18).create();
  [NHAN_CHO, NHAN_XONG].forEach(function (n) {
    if (!GmailApp.getUserLabelByName(n)) GmailApp.createLabel(n);
  });
  bao_('Dat trinh kich hoat',
    'Da tao 6 trinh kich hoat theo thoi gian va 2 nhan Gmail.\n' +
    'Trinh kich hoat bieu mau do muc 1 tu gan, khong bi xoa o day.\n\n' +
    'Bo loc Gmail phai dat tay: loc theo dia chi thu ho tro, gan nhan ' + NHAN_CHO + '.\n' +
    'Trong bo loc nho them dieu kien khong chua "' + TIEN_TO_HE_THONG + '" o tieu de,\n' +
    'de he thong khong tu phan loai thu bao cua chinh minh.');
}

// ================================================================
// GOI API. Chon may chu theo o NHA_CUNG_CAP, khong cam cung dia chi.
// ================================================================
function goiAPI(heThong, noiDung) {
  var khoa = String(PropertiesService.getScriptProperties()
                    .getProperty('KHOA_API') || '').trim();
  if (!khoa) throw new Error('Chua dat KHOA_API trong Cai dat du an, muc Thuoc tinh tap lenh.');
  var ncc = docCauHinh('NHA_CUNG_CAP').toUpperCase();
  var model = docCauHinh('MO_HINH_AI');
  var tok = parseInt(docCauHinh('SO_TOKEN_TOI_DA'), 10);
  if (isNaN(tok) || tok < 4000) tok = 4000;
  if (!ncc) throw new Error('O NHA_CUNG_CAP dang trong. Dien OPENAI hoac ANTHROPIC.');
  if (!model) throw new Error('O MO_HINH_AI dang trong.');

  var url, opt;
  if (ncc === 'OPENAI') {
    url = 'https://api.openai.com/v1/responses';
    opt = { method:'post', contentType:'application/json',
      headers:{ 'Authorization':'Bearer ' + khoa }, muteHttpExceptions:true,
      payload: JSON.stringify({ model:model, instructions:heThong, input:noiDung,
                                max_output_tokens:tok }) };
  } else if (ncc === 'ANTHROPIC') {
    url = 'https://api.anthropic.com/v1/messages';
    opt = { method:'post', contentType:'application/json',
      headers:{ 'x-api-key':khoa, 'anthropic-version':'2023-06-01' }, muteHttpExceptions:true,
      payload: JSON.stringify({ model:model, max_tokens:tok, system:heThong,
                                messages:[{ role:'user', content:noiDung }] }) };
  } else {
    throw new Error('NHA_CUNG_CAP chi nhan OPENAI hoac ANTHROPIC. Dang la: ' + ncc);
  }

  var res = UrlFetchApp.fetch(url, opt);
  var ma = res.getResponseCode(), tho = res.getContentText();
  if (ma !== 200) {
    throw new Error('API tra ve ma ' + ma + '\nMay chu: ' + url + '\nModel: ' + model +
                    '\nPhan hoi tho: ' + tho.substring(0, 400));
  }
  return { van_ban: layVanBan_(JSON.parse(tho), ncc), tho: tho };
}

function layVanBan_(data, ncc) {
  var ket = [];
  if (ncc === 'OPENAI') {
    if (data.output_text) return String(data.output_text);
    (data.output || []).forEach(function (o) {
      (o.content || []).forEach(function (c) { if (c.text) ket.push(c.text); });
    });
  } else {
    (data.content || []).forEach(function (c) { if (c.type === 'text' && c.text) ket.push(c.text); });
  }
  return ket.join('\n');
}

function kiemTraKetNoiAPI() {
  try {
    var kq = goiAPI('Tra loi that ngan, tieng Viet khong dau.', 'Tra loi dung ba chu: KET NOI OK');
    bao_('Ket noi API chay duoc',
      'Nha cung cap: ' + docCauHinh('NHA_CUNG_CAP') +
      '\nModel: ' + docCauHinh('MO_HINH_AI') +
      '\nMo hinh tra loi: ' + kq.van_ban);
  } catch (e) { bao_('Ket noi API chua chay duoc', String(e.message)); }
}

// ================================================================
// MUC 1 - TAO BIEU MAU
// ================================================================
function m01_taoBieuMau() {
  var daCo = docCauHinh('LINK_FORM_NHU_CAU');
  if (daCo) {
    bao_('Bieu mau da co',
      'O LINK_FORM_NHU_CAU trong CAU_HINH da co duong dan:\n' + daCo +
      '\n\nKhong tao bieu mau thu hai. Muon tao lai thi xoa gia tri o do truoc.');
    return;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var truoc = ss.getSheets().map(function (s) { return s.getName(); });
  var th = docCauHinh('TEN_THUONG_HIEU') || 'San pham';

  var form = FormApp.create(th + ' - Khao sat nhu cau');
  form.setDescription('Bon cau hoi ngan ve cach ban dang xu ly cong viec hien tai.');
  form.addParagraphTextItem().setTitle('Ban lam viec cua ban dang vuong gi nhat').setRequired(true);
  form.addParagraphTextItem().setTitle('Ban dang xu ly viec do bang cach nao').setRequired(true);
  form.addParagraphTextItem().setTitle('Cach do chua on o cho nao').setRequired(true);
  form.addTextItem().setTitle('Ban san sang tra bao nhieu cho mot bo giai quyet duoc viec do');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();

  var moi = ss.getSheets().filter(function (s) { return truoc.indexOf(s.getName()) === -1; });
  if (moi.length) moi[0].setName('RAW_NHU_CAU');
  ghiCauHinh('LINK_FORM_NHU_CAU', form.getPublishedUrl());

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'nhanTraLoiForm') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('nhanTraLoiForm').forSpreadsheet(ss).onFormSubmit().create();

  bao_('Tao bieu mau',
    'Da tao bieu mau va noi vao tep nay.\nTrang tra loi: RAW_NHU_CAU\n' +
    'Duong dan da ghi vao CAU_HINH.\nDa gan trinh kich hoat cho bieu mau.');
}

function nhanTraLoiForm(e) {
  try {
    if (!e || !e.values) return;
    var cau = [e.values[1], e.values[2], e.values[3]].filter(String).join(' | ');
    if (!cau) return;
    themDong_(layTrang('DU_LIEU_THO'), {
      NGAY_THU: homNay_(), NGUON: 'Bieu mau', LOAI_NGUON: 'BIEU_MAU',
      NGUYEN_VAN: cau, MA_TRUNG: bam_(cau)
    });
  } catch (err) { console.error(err); }
}

// ================================================================
// MUC 2 - NAP DU LIEU NHU CAU TU CSV
// ================================================================
function m02_napDuLieuNhuCau() {
  var tuDong = tuDong_(), sheet, folder;
  try { sheet = layTrang('DU_LIEU_THO'); folder = thuMuc_('ID_THU_MUC_NAP_DU_LIEU','NAP_DU_LIEU'); }
  catch (e) { if (!tuDong) bao_('Loi', e.message); else console.error(e.message); return; }

  var d = docBang_(sheet), cTrung = d.head.indexOf('MA_TRUNG'), daCo = {};
  d.rows.forEach(function (r) { if (r[cTrung]) daCo[String(r[cTrung])] = true; });

  var files = folder.getFiles(), soTep = 0, soDong = 0;
  while (files.hasNext()) {
    var f = files.next(), ten = f.getName();
    if (ten.indexOf('DA_NAP_') === 0) continue;
    if (ten.toLowerCase().indexOf('.csv') === -1) continue;
    var rows;
    try { rows = Utilities.parseCsv(f.getBlob().getDataAsString()); } catch (err) { continue; }
    if (rows.length < 2) { f.setName('DA_NAP_' + ten); soTep++; continue; }

    var head = rows[0].map(function (v) { return String(v).trim().toUpperCase(); });
    var iCau = head.indexOf('NGUYEN_VAN');
    if (iCau === -1) iCau = head.indexOf('NOI_DUNG');
    if (iCau === -1) iCau = 0;

    for (var i = 1; i < rows.length; i++) {
      var cau = String(rows[i][iCau] || '').trim();
      if (!cau) continue;
      var h = bam_(cau);
      if (daCo[h]) continue;
      daCo[h] = true;
      var obj = { NGAY_THU: homNay_(), NGUON: ten, LOAI_NGUON: 'CSV',
                  NGUYEN_VAN: cau, MA_TRUNG: h };
      head.forEach(function (hd, j) {
        if (COT_TRANG.DU_LIEU_THO.indexOf(hd) > -1 && !obj[hd] && rows[i][j]) obj[hd] = rows[i][j];
      });
      themDong_(sheet, obj);
      soDong++;
    }
    f.setName('DA_NAP_' + ten);
    soTep++;
  }
  if (!tuDong) bao_('Nap du lieu nhu cau', 'Da doc ' + soTep + ' tep, them ' + soDong + ' dong moi.');
}

// ================================================================
// MUC 3 - PHAN NHOM NHU CAU
// ================================================================
function m03_phanNhomNhuCau() {
  var sheet = layTrang('DU_LIEU_THO');
  var cVan = chiSoCot(sheet, 'NGUYEN_VAN'), cNhom = chiSoCot(sheet, 'NHOM_AI');
  var d = docBang_(sheet);
  if (!d.rows.length) { bao_('Phan nhom','DU_LIEU_THO chua co dong nao.'); return; }

  var lo = parseInt(docCauHinh('KICH_THUOC_LO_PHAN_NHOM'), 10) || 40;
  var can = [];
  d.rows.forEach(function (r, i) {
    var van = String(r[cVan - 1]).trim();
    if (van && !String(r[cNhom - 1]).trim()) can.push({ so_dong: i + 2, cau: xoaCaNhan_(van) });
  });
  if (!can.length) { bao_('Phan nhom','Khong con dong nao can phan nhom.'); return; }

  var xong = 0;
  for (var b = 0; b < can.length; b += lo) {
    var phan = can.slice(b, b + lo);
    try {
      var kq = goiAPI(docCauHinh('PROMPT_PHAN_NHOM'), JSON.stringify(phan));
      tachJson_(kq.van_ban).forEach(function (o) {
        if (o.so_dong && o.nhom) { sheet.getRange(o.so_dong, cNhom).setValue(o.nhom); xong++; }
      });
    } catch (e) {
      bao_('Dung o lo bat dau tu dong ' + phan[0].so_dong,
           String(e.message) + '\n\nDa gan xong ' + xong + ' dong truoc do.');
      return;
    }
  }
  bao_('Phan nhom nhu cau', 'Da gan nhom cho ' + xong + ' dong.\n' +
       'Doc lai va dien cot NHOM_DA_DUYET truoc khi sang muc 4.');
}

// ================================================================
// MUC 4 - TAO BAN YEU CAU SAN PHAM
// ================================================================
function m04_taoBanYeuCauSP() {
  var sN = layTrang('NOI_DUNG');
  var dn = docBang_(sN), iLoai = dn.head.indexOf('LOAI'), iPb = dn.head.indexOf('PHIEN_BAN');
  var daCo = dn.rows.filter(function (r) { return String(r[iLoai]).trim() === 'YEU_CAU_SP'; });

  if (daCo.length) {
    var ds = daCo.map(function (r) { return String(r[iPb] || 'v?'); }).join(', ');
    bao_('Da co ban yeu cau',
      'NOI_DUNG da co ' + daCo.length + ' dong LOAI = YEU_CAU_SP (' + ds + ').\n' +
      'Muc 4 khong tao them de khong ton luot goi API.\n\n' +
      'Neu ban muon mot ban HOAN TOAN MOI, dung menu:\n' +
      '  4b. Tao ban yeu cau SP phien ban moi');
    return;
  }
  taoBanYeuCauSP_('v1.0');
}

/**
 * Tao ban yeu cau san pham phien ban moi, du da co ban cu.
 * Ban cu duoc giu nguyen de con doi chieu.
 */
function m04b_taoBanYeuCauSPMoi() {
  taoBanYeuCauSP_(phienBanMoi_());
}

function phienBanMoi_() {
  var sN = layTrang('NOI_DUNG'), d = docBang_(sN);
  var iLoai = d.head.indexOf('LOAI'), iPb = d.head.indexOf('PHIEN_BAN'), max = 0;
  d.rows.forEach(function (r) {
    if (String(r[iLoai]).trim() !== 'YEU_CAU_SP') return;
    var m = String(r[iPb]).match(/v(\d+)/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return 'v' + (max + 1) + '.0';
}

function taoBanYeuCauSP_(phienBan) {
  var sD = layTrang('DU_LIEU_THO'), sN = layTrang('NOI_DUNG');

  var d = docBang_(sD);
  var iVan = d.head.indexOf('NGUYEN_VAN'), iDuyet = d.head.indexOf('NHOM_DA_DUYET');
  var lieu = d.rows.filter(function (r) { return String(r[iDuyet]).trim(); })
                   .map(function (r) { return String(r[iDuyet]).trim() + ': ' + r[iVan]; });
  if (!lieu.length) {
    bao_('Chua du dieu kien','DU_LIEU_THO chua co dong nao dien NHOM_DA_DUYET.'); return;
  }

  var boiCanh = 'Ten thuong hieu: ' + docCauHinh('TEN_THUONG_HIEU') +
    '\nMa hang: ' + docCauHinh('MA_HANG_CHINH') +
    '\nGia ban muc tieu: ' + docCauHinh('GIA_BAN') +
    '\n\nDu lieu nhu cau da duyet:\n' + lieu.slice(0, 150).join('\n');

  try {
    var kq = goiAPI(docCauHinh('PROMPT_YEU_CAU_SP'), boiCanh);
    themDong_(sN, {
      MA_NOI_DUNG: maMoi_(sN, 'MA_NOI_DUNG', 'ND-'),
      MA_HANG: docCauHinh('MA_HANG_CHINH'), LOAI: 'YEU_CAU_SP',
      TIEU_DE: 'Ban yeu cau san pham ' + phienBan, NOI_DUNG: boMarkdown_(kq.van_ban),
      NGUON_DAN: 'DU_LIEU_THO, ' + lieu.length + ' dong da duyet',
      TRANG_THAI: 'BAN_AI', PHIEN_BAN: phienBan
    });
    bao_('Tao ban yeu cau san pham',
      'Da ghi mot dong LOAI = YEU_CAU_SP, phien ban ' + phienBan + ', vao NOI_DUNG.\n' +
      'Doc lai, thay het cho ghi CAN_XAC_NHAN bang quyet dinh that,\n' +
      'roi doi TRANG_THAI sang DA_DUYET.\n\n' +
      'Luu y: muc 5 luon lay dong YEU_CAU_SP DA_DUYET NAM DUOI CUNG.\n' +
      'Neu con ban cu cung o trang thai DA_DUYET, hay doi no ve BAN_AI de tranh nham.');
  } catch (e) { bao_('Loi', String(e.message)); }
}

// ================================================================
// MUC 5 - GUI YEU CAU LAY BAO GIA. Tu tao PDF, khong copy tay.
// Khac ban cu: LUON tao PDF truoc, roi moi xet danh sach nguoi nhan.
// ================================================================
function m05_guiYeuCauBaoGia() {
  var sN = layTrang('NOI_DUNG'), sC = layTrang('NHA_CUNG_CAP');

  // 1. Tim ban yeu cau da duyet
  var dn = docBang_(sN);
  var iLoai = dn.head.indexOf('LOAI'), iTt = dn.head.indexOf('TRANG_THAI');
  var iNd = dn.head.indexOf('NOI_DUNG'), iMa = dn.head.indexOf('MA_NOI_DUNG');
  var iPb = dn.head.indexOf('PHIEN_BAN'), iLink = dn.head.indexOf('LINK');
  var nguon = null, dongNguon = 0;
  dn.rows.forEach(function (r, k) {
    if (String(r[iLoai]).trim() === 'YEU_CAU_SP' && String(r[iTt]).trim() === 'DA_DUYET') {
      nguon = r; dongNguon = k + 2;
    }
  });
  if (!nguon) {
    bao_('Chua du dieu kien',
      'Chua co dong YEU_CAU_SP nao o trang thai DA_DUYET trong NOI_DUNG.\n\n' +
      'Mo trang NOI_DUNG, tim dong LOAI = YEU_CAU_SP, doi cot TRANG_THAI sang DA_DUYET.');
    return;
  }

  // 2. Tao PDF. Lam truoc, khong phu thuoc vao viec co ai de gui hay khong.
  var tep;
  try {
    tep = taoPdfYeuCau_(String(nguon[iNd]), String(nguon[iMa]), String(nguon[iPb] || 'v1.0'));
  } catch (e) {
    bao_('Khong tao duoc PDF', String(e.message));
    return;
  }
  sN.getRange(dongNguon, iLink + 1).setValue(tep.getUrl());

  // 3. Xet danh sach nguoi nhan
  var dc = docBang_(sC);
  var iEmail = dc.head.indexOf('EMAIL'), iDaGui = dc.head.indexOf('DA_GUI_YEU_CAU');
  var iTen = dc.head.indexOf('TEN'), iHm = dc.head.indexOf('HANG_MUC');
  var cDaGui = iDaGui + 1, cNgay = chiSoCot(sC, 'NGAY_GUI');
  var gui = 0, thieuEmail = 0, daGuiTruoc = 0, loi = [];

  for (var k = 0; k < dc.rows.length; k++) {
    var email = String(dc.rows[k][iEmail]).trim();
    if (!email || email.indexOf('@') === -1) { thieuEmail++; continue; }
    if (String(dc.rows[k][iDaGui]).trim()) { daGuiTruoc++; continue; }
    try {
      MailApp.sendEmail({
        to: email,
        subject: '[' + docCauHinh('TEN_THUONG_HIEU') + '] Yeu cau bao gia - ' +
                 docCauHinh('MA_HANG_CHINH'),
        body: 'Kinh gui ' + (dc.rows[k][iTen] || 'quy doi tac') + ',\n\n' +
              docCauHinh('MAU_THU_YEU_CAU_BAO_GIA') + '\n\n' +
              'Hang muc: ' + (dc.rows[k][iHm] || '') + '\n' +
              'Ma hang: ' + docCauHinh('MA_HANG_CHINH') + '\n\n' +
              'Tran trong,\n' + docCauHinh('TEN_THUONG_HIEU'),
        attachments: [tep.getAs(MimeType.PDF)]
      });
      sC.getRange(k + 2, cDaGui).setValue('CO');
      sC.getRange(k + 2, cNgay).setValue(homNay_());
      gui++;
    } catch (e) {
      loi.push(email + ': ' + e.message);
    }
  }

  var tin = 'Da tao PDF moi: ' + tep.getName() +
            '\nLuu trong HO_SO_GUI_NCC, duong dan da ghi vao cot LINK cua NOI_DUNG.' +
            '\nMo tep: ' + tep.getUrl() +
            '\n\nDa gui: ' + gui + ' thu.' +
            '\nBo qua vi thieu email hop le: ' + thieuEmail +
            '\nBo qua vi cot DA_GUI_YEU_CAU da co gia tri: ' + daGuiTruoc;
  if (daGuiTruoc && !gui) {
    tin += '\n\nMoi nha cung cap deu da duoc gui truoc do nen khong gui lai.\n' +
           'Muon gui lai toan bo, dung menu: 5b. Lam moi vong gui NCC.';
  }
  if (loi.length) tin += '\n\nLoi khi gui:\n- ' + loi.join('\n- ');
  bao_('Gui yeu cau bao gia', tin);
}

/**
 * Xoa trang cot DA_GUI_YEU_CAU va NGAY_GUI de co the gui lai tu dau.
 * Phai xoa trang, khong duoc ghi chu KHONG: ma chi kiem tra o co rong hay khong.
 */
function lamMoiVongGuiNCC() {
  var sC = layTrang('NHA_CUNG_CAP'), d = docBang_(sC);
  if (!d.rows.length) { bao_('Lam moi vong gui NCC','NHA_CUNG_CAP chua co dong nao.'); return; }

  var cDaGui = chiSoCot(sC, 'DA_GUI_YEU_CAU'), cNgay = chiSoCot(sC, 'NGAY_GUI');
  var n = d.rows.length;
  sC.getRange(2, cDaGui, n, 1).clearContent();
  sC.getRange(2, cNgay, n, 1).clearContent();
  SpreadsheetApp.flush();

  bao_('Lam moi vong gui NCC',
    'Da xoa trang cot DA_GUI_YEU_CAU va NGAY_GUI cho ' + n + ' dong.\n\n' +
    'Lan chay muc 5 tiep theo se gui lai cho toan bo nha cung cap co email hop le.\n' +
    'Kiem lai danh sach truoc khi chay de tranh gui trung.');
}

function taoPdfYeuCau_(noiDung, maNoiDung, phienBan) {
  var thuMuc = thuMuc_('ID_THU_MUC_HO_SO_NCC', 'HO_SO_GUI_NCC');

  var maHang = docCauHinh('MA_HANG_CHINH');
  if (!maHang) {
    throw new Error('O MA_HANG_CHINH trong CAU_HINH dang trong. ' +
                    'Dien ma hang truoc khi tao PDF, neu khong ten tep se bi thieu ma.');
  }
  var thuongHieu = docCauHinh('TEN_THUONG_HIEU') || 'San pham';

  // Ten tep co gio phut giay: moi lan chay la mot ban rieng, de truy vet,
  // khong con de len nhau va khong con phai xoa ban cu.
  var ten = 'YEU_CAU_SP_' + maHang + '_' + phienBan + '_' + dauThoiGian_();

  var doc = DocumentApp.create(ten), than = doc.getBody();
  than.appendParagraph(thuongHieu + ' - YEU CAU SAN PHAM')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  than.appendParagraph('Ma noi dung: ' + maNoiDung + '   |   Phien ban: ' + phienBan +
                       '   |   Ngay: ' + homNay_());
  than.appendHorizontalRule();
  boMarkdown_(noiDung).split('\n').forEach(function (dong) { than.appendParagraph(dong); });
  doc.saveAndClose();

  var ban = DriveApp.getFileById(doc.getId());
  var pdf = thuMuc.createFile(ban.getAs(MimeType.PDF)).setName(ten + '.pdf');
  ban.setTrashed(true);
  return pdf;
}

// ================================================================
// MUC 6 - DANH SACH KIEM MAU + DONG SAN_PHAM VA TON_KHO
// ================================================================
function m06_taoDanhSachKiemMau() {
  var sN = layTrang('NOI_DUNG'), d = docBang_(sN);
  var iLoai = d.head.indexOf('LOAI'), iTt = d.head.indexOf('TRANG_THAI'),
      iNd = d.head.indexOf('NOI_DUNG'), iMa = d.head.indexOf('MA_NOI_DUNG');
  var nguon = null, daCoDs = false;
  d.rows.forEach(function (r) {
    var l = String(r[iLoai]).trim();
    if (l === 'YEU_CAU_SP' && String(r[iTt]).trim() === 'DA_DUYET') nguon = r;
    if (l === 'DANH_SACH_KIEM_MAU') daCoDs = true;
  });
  if (!nguon) {
    bao_('Chua du dieu kien','Chua co dong YEU_CAU_SP nao o trang thai DA_DUYET.'); return;
  }

  if (daCoDs) {
    bao_('Tao danh sach kiem mau',
      'NOI_DUNG da co dong DANH_SACH_KIEM_MAU, khong sinh lai de khong ton luot goi API.\n\n' +
      taoDongSanPham_(nguon, d.head));
    return;
  }

  try {
    var kq = goiAPI(docCauHinh('PROMPT_KIEM_MAU'), String(nguon[iNd]));
    themDong_(sN, {
      MA_NOI_DUNG: maMoi_(sN, 'MA_NOI_DUNG', 'ND-'),
      MA_HANG: docCauHinh('MA_HANG_CHINH'), LOAI: 'DANH_SACH_KIEM_MAU',
      TIEU_DE: 'Danh sach kiem mau', NOI_DUNG: boMarkdown_(kq.van_ban),
      NGUON_DAN: String(nguon[iMa]), TRANG_THAI: 'BAN_AI', PHIEN_BAN: 'v1.0'
    });
    bao_('Tao danh sach kiem mau',
      'Da ghi danh sach kiem mau vao NOI_DUNG. Doc lai roi doi TRANG_THAI sang DA_DUYET.\n\n' +
      taoDongSanPham_(nguon, d.head));
  } catch (e) { bao_('Loi', String(e.message)); }
}

function taoDongSanPham_(nguon, head) {
  var sS = layTrang('SAN_PHAM'), sT = layTrang('TON_KHO');
  var maHang = docCauHinh('MA_HANG_CHINH');
  if (!maHang) return 'Bo qua phan SAN_PHAM: o MA_HANG_CHINH trong CAU_HINH dang trong.';

  var ds = docBang_(sS), iMa = ds.head.indexOf('MA_HANG');
  for (var i = 0; i < ds.rows.length; i++) {
    if (String(ds.rows[i][iMa]).trim() === maHang) return 'SAN_PHAM da co dong ' + maHang + '.';
  }

  var iNd = head.indexOf('NOI_DUNG'), iPb = head.indexOf('PHIEN_BAN');
  var o;
  try { o = tachJson_(goiAPI(docCauHinh('PROMPT_SAN_PHAM'), String(nguon[iNd])).van_ban); }
  catch (e) { return 'Bo qua phan SAN_PHAM, loi: ' + e.message; }

  var giaBan = String(o.gia_ban || '').replace(/[^0-9]/g, '') || docCauHinh('GIA_BAN');
  var giaVon = String(o.gia_von_nhap_kho || '').replace(/[^0-9]/g, '');

  themDong_(sS, {
    MA_HANG: maHang, TEN_SP: o.ten_sp || '', PHIEN_BAN: String(nguon[iPb] || 'v1.0'),
    THANH_PHAN: o.thanh_phan || '', KICH_THUOC: o.kich_thuoc || '',
    VAT_LIEU: o.vat_lieu || '', BAO_BI: o.bao_bi || '',
    GIA_BAN: giaBan ? Number(giaBan) : '', GIA_VON_NHAP_KHO: giaVon ? Number(giaVon) : '',
    MA_LO: '', TRANG_THAI_MAU: 'CHO_DUYET', NGAY_DUYET_MAU: ''
  });

  var dt = docBang_(sT), iMaT = dt.head.indexOf('MA_HANG'), coTon = false;
  dt.rows.forEach(function (r) { if (String(r[iMaT]).trim() === maHang) coTon = true; });
  if (!coTon) {
    var r = themDong_(sT, {
      MA_HANG: maHang, CO_THE_BAN: 0, DANG_SAN_XUAT: 0, CHO_KIEM_TRA: 0,
      HANG_LOI: 0, DANG_GIAO: 0, HOAN_CHUA_KIEM: 0, BAN_TB_NGAY: 0,
      NGAY_CAP_NHAT: homNay_(), NGUON_SO_LIEU: 'Khoi tao'
    });
    var ct = congThucTonKho_(r);
    sT.getRange(r, chiSoCot(sT,'SO_NGAY_DU_HANG')).setFormula(ct.soNgay);
    sT.getRange(r, chiSoCot(sT,'DIEM_DAT_LAI')).setFormula(ct.diem);
    sT.getRange(r, chiSoCot(sT,'TIEN_TRONG_TON')).setFormula(ct.tien);
  }

  return 'Da tao dong ' + maHang + ' trong SAN_PHAM va TON_KHO.\n' +
    'Hai o phai tu dien vi khong co nguon nao de doc:\n' +
    '- SAN_PHAM.MA_LO: lay tu phieu nhap kho.\n' +
    '- TON_KHO.CO_THE_BAN: so bo thuc te trong kho.\n' +
    'BAN_TB_NGAY do muc 11 tu tinh tu DON_HANG, khong phai go tay.';
}

// ================================================================
// MUC 7 - TAO NOI DUNG BAN HANG
// ================================================================
function m07_taoNoiDungBanHang() {
  var sN = layTrang('NOI_DUNG'), d = docBang_(sN);
  var iLoai = d.head.indexOf('LOAI'), iTt = d.head.indexOf('TRANG_THAI'),
      iNd = d.head.indexOf('NOI_DUNG'), iMa = d.head.indexOf('MA_NOI_DUNG');
  var nguon = null;
  d.rows.forEach(function (r) {
    var l = String(r[iLoai]).trim();
    if ((l === 'THONG_TIN_SP' || l === 'YEU_CAU_SP') && String(r[iTt]).trim() === 'DA_DUYET') nguon = r;
  });
  if (!nguon) {
    bao_('Chua du dieu kien','Chua co dong THONG_TIN_SP hoac YEU_CAU_SP nao DA_DUYET.'); return;
  }
  try {
    var kq = goiAPI(docCauHinh('PROMPT_NOI_DUNG'), String(nguon[iNd]));
    var phan = boMarkdown_(kq.van_ban).split(/\n-{3,}\n/);
    var ten = ['MO_TA_SAN_PHAM','CAU_HOI_THUONG_GAP','KICH_BAN_VIDEO'];
    var dem = 0;
    for (var i = 0; i < phan.length && i < 3; i++) {
      if (!phan[i].trim()) continue;
      themDong_(sN, {
        MA_NOI_DUNG: maMoi_(sN, 'MA_NOI_DUNG', 'ND-'),
        MA_HANG: docCauHinh('MA_HANG_CHINH'), LOAI: ten[i],
        KENH: docCauHinh('KENH_CHINH'), TIEU_DE: ten[i].replace(/_/g, ' '),
        NOI_DUNG: phan[i].trim(), NGUON_DAN: String(nguon[iMa]),
        TRANG_THAI: 'BAN_AI', PHIEN_BAN: 'v1.0'
      });
      dem++;
    }
    bao_('Tao noi dung ban hang',
      'Da ghi ' + dem + ' dong vao NOI_DUNG.\n' +
      'Kiem bon thu truoc khi dung: cong dung, kich thuoc, gia, chinh sach.');
  } catch (e) { bao_('Loi', String(e.message)); }
}

// ================================================================
// MUC 8 - NHAP DON HANG TU CSV
// ================================================================
function m08_nhapDonHang() {
  var tuDong = tuDong_(), sheet, folder;
  try { sheet = layTrang('DON_HANG'); folder = thuMuc_('ID_THU_MUC_NAP_DON','NAP_DON'); }
  catch (e) { if (!tuDong) bao_('Loi', e.message); else console.error(e.message); return; }

  var gioiHan = parseInt(docCauHinh('SO_DONG_NAP_MOI_LAN'), 10) || 300;
  var d = docBang_(sheet), iMa = d.head.indexOf('MA_DON'), daCo = {};
  d.rows.forEach(function (r) { if (r[iMa]) daCo[String(r[iMa]).trim()] = true; });

  var files = folder.getFiles(), soDong = 0, soTep = 0;
  while (files.hasNext() && soDong < gioiHan) {
    var f = files.next(), ten = f.getName();
    if (ten.indexOf('DA_NAP_') === 0) continue;
    if (ten.toLowerCase().indexOf('.csv') === -1) continue;
    if (ten.toUpperCase().indexOf('DOI_SOAT') > -1) continue;

    var rows;
    try { rows = Utilities.parseCsv(f.getBlob().getDataAsString()); } catch (err) { continue; }
    if (rows.length < 2) { f.setName('DA_NAP_' + ten); soTep++; continue; }

    var head = rows[0].map(function (v) { return String(v).trim().toUpperCase(); });
    for (var i = 1; i < rows.length && soDong < gioiHan; i++) {
      var obj = {};
      head.forEach(function (h, j) { if (COT_TRANG.DON_HANG.indexOf(h) > -1) obj[h] = rows[i][j]; });
      var maDon = String(obj.MA_DON || '').trim();
      if (!maDon || daCo[maDon]) continue;
      daCo[maDon] = true;
      if (!obj.NGAY_DAT) obj.NGAY_DAT = homNay_();
      if (!obj.KENH_BAN) obj.KENH_BAN = docCauHinh('KENH_CHINH');
      obj.TRANG_THAI = 'CHO_XAC_NHAN';
      themDong_(sheet, obj);
      soDong++;
    }
    if (soDong < gioiHan) { f.setName('DA_NAP_' + ten); soTep++; }
  }
  if (!tuDong) bao_('Nhap don hang', 'Da doc ' + soTep + ' tep, them ' + soDong + ' don moi.');
}

// ================================================================
// MUC 9 - KIEM TRA DON
// ================================================================
function m09_kiemTraDon() {
  var sD = layTrang('DON_HANG'), sS = layTrang('SAN_PHAM'), sT = layTrang('TON_KHO');
  var dd = docBang_(sD);
  if (!dd.rows.length) { bao_('Kiem tra don','DON_HANG chua co don nao.'); return; }

  var ds = docBang_(sS), iMaSp = ds.head.indexOf('MA_HANG'), maHop = {};
  ds.rows.forEach(function (r) { if (r[iMaSp]) maHop[String(r[iMaSp]).trim()] = true; });
  if (!Object.keys(maHop).length) {
    bao_('Chua du dieu kien','SAN_PHAM chua co dong nao. Chay muc 6 truoc.'); return;
  }

  var dt = docBang_(sT), ton = {};
  var iMaT = dt.head.indexOf('MA_HANG'), iCo = dt.head.indexOf('CO_THE_BAN');
  dt.rows.forEach(function (r) {
    if (r[iMaT]) ton[String(r[iMaT]).trim()] = Number(r[iCo]) || 0;
  });

  var c = {};
  ['MA_DON','MA_HANG','SO_LUONG','HO_TEN','SO_DIEN_THOAI','DIA_CHI','TRANG_THAI','GHI_CHU']
    .forEach(function (t) { c[t] = chiSoCot(sD, t); });

  var thay = {}, ok = 0, loi = 0, boQua = 0;
  // Ghi ca khoi mot lan thay vi setValue tung o: nhanh hon hang chuc lan
  var cotTT = [], cotGC = [];
  for (var i = 0; i < dd.rows.length; i++) {
    var r = dd.rows[i], ls = [];
    var maDon = String(r[c.MA_DON - 1]).trim();
    var tt = String(r[c.TRANG_THAI - 1]).trim();
    var gc = String(r[c.GHI_CHU - 1]);

    if (!maDon ||
        ['DA_GUI_KHO','DANG_GIAO','GIAO_THANH_CONG','HUY','HOAN','DA_DOI_SOAT'].indexOf(tt) > -1) {
      if (maDon) boQua++;
      cotTT.push([tt]); cotGC.push([gc]);
      continue;
    }

    if (thay[maDon]) ls.push('Trung MA_DON');
    thay[maDon] = true;

    var mh = String(r[c.MA_HANG - 1]).trim();
    if (!mh) ls.push('Thieu MA_HANG');
    else if (!maHop[mh]) ls.push('MA_HANG khong co trong SAN_PHAM');

    var sl = Number(r[c.SO_LUONG - 1]) || 0;
    if (sl <= 0) ls.push('SO_LUONG khong hop le');
    else if (ton[mh] !== undefined && sl > ton[mh]) ls.push('Vuot ton CO_THE_BAN (' + ton[mh] + ')');

    ['HO_TEN','SO_DIEN_THOAI','DIA_CHI'].forEach(function (t) {
      if (!String(r[c[t] - 1]).trim()) ls.push('Thieu ' + t);
    });

    if (ls.length) { cotTT.push(['CHO_XAC_NHAN']); cotGC.push([ls.join('; ')]); loi++; }
    else { cotTT.push(['DU_DIEU_KIEN_XUAT']); cotGC.push(['']); ok++; }
  }
  if (cotTT.length) {
    sD.getRange(2, c.TRANG_THAI, cotTT.length, 1).setValues(cotTT);
    sD.getRange(2, c.GHI_CHU, cotGC.length, 1).setValues(cotGC);
  }

  bao_('Kiem tra don', 'Du dieu kien xuat: ' + ok + '\nCho xac nhan: ' + loi +
       (boQua ? '\nBo qua vi da xu ly: ' + boQua : ''));
}

// ================================================================
// MUC 10 - GUI KHO. Tru ton CO_THE_BAN, cong DANG_GIAO.
// ================================================================
function m10_guiKho() {
  var sD = layTrang('DON_HANG'), sS = layTrang('SAN_PHAM'), sT = layTrang('TON_KHO');
  var email = docCauHinh('EMAIL_KHO');
  if (!email) { bao_('Thieu cau hinh','O EMAIL_KHO trong CAU_HINH dang trong.'); return; }

  var ds = docBang_(sS), lo = {};
  var iMaSp = ds.head.indexOf('MA_HANG'), iLo = ds.head.indexOf('MA_LO');
  ds.rows.forEach(function (r) { if (r[iMaSp]) lo[String(r[iMaSp]).trim()] = r[iLo]; });

  var c = {};
  ['MA_DON','MA_HANG','SO_LUONG','HO_TEN','SO_DIEN_THOAI','DIA_CHI','TRANG_THAI',
   'NGAY_GUI_KHO','MA_LO'].forEach(function (t) { c[t] = chiSoCot(sD, t); });

  var d = docBang_(sD), gui = [];
  d.rows.forEach(function (r, i) {
    if (String(r[c.TRANG_THAI - 1]).trim() !== 'DU_DIEU_KIEN_XUAT') return;
    if (String(r[c.NGAY_GUI_KHO - 1]).trim()) return;
    gui.push({ dong: i + 2, ma: r[c.MA_DON - 1], mh: String(r[c.MA_HANG - 1]).trim(),
               sl: Number(r[c.SO_LUONG - 1]) || 0, ten: r[c.HO_TEN - 1],
               sdt: r[c.SO_DIEN_THOAI - 1], dc: r[c.DIA_CHI - 1] });
  });
  if (!gui.length) { bao_('Gui kho','Khong co don nao du dieu kien va chua gui.'); return; }

  var bang = gui.map(function (g) {
    return [g.ma, g.mh, g.sl, g.ten, g.sdt, g.dc, lo[g.mh] || ''].join(' | ');
  }).join('\n');

  MailApp.sendEmail(email,
    '[' + docCauHinh('TEN_THUONG_HIEU') + '] Danh sach giao hang ' + homNay_(),
    docCauHinh('MAU_THU_GUI_KHO') + '\n\n' +
    'MA_DON | MA_HANG | SO_LUONG | HO_TEN | SDT | DIA_CHI | MA_LO\n' + bang);

  // Ghi theo tung dai lien nhau thay vi tung o
  var ngay = homNay_();
  gui.forEach(function (g) {
    sD.getRange(g.dong, c.NGAY_GUI_KHO).setValue(ngay);
    sD.getRange(g.dong, c.TRANG_THAI).setValue('DA_GUI_KHO');
    sD.getRange(g.dong, c.MA_LO).setValue(lo[g.mh] || '');
  });
  SpreadsheetApp.flush();

  // Tru ton kho theo so luong da gui
  var truTheoMa = {};
  gui.forEach(function (g) { truTheoMa[g.mh] = (truTheoMa[g.mh] || 0) + g.sl; });
  var dt = docBang_(sT);
  var iMaT = dt.head.indexOf('MA_HANG'), cCo = chiSoCot(sT,'CO_THE_BAN'),
      cGiao = chiSoCot(sT,'DANG_GIAO'), cNgay = chiSoCot(sT,'NGAY_CAP_NHAT');
  dt.rows.forEach(function (r, i) {
    var mh = String(r[iMaT]).trim();
    if (!truTheoMa[mh]) return;
    sT.getRange(i + 2, cCo).setValue(Math.max((Number(r[cCo - 1]) || 0) - truTheoMa[mh], 0));
    sT.getRange(i + 2, cGiao).setValue((Number(r[cGiao - 1]) || 0) + truTheoMa[mh]);
    sT.getRange(i + 2, cNgay).setValue(homNay_());
  });

  bao_('Gui kho', 'Da gui ' + gui.length + ' don cho kho.\n' +
       'Da ghi NGAY_GUI_KHO, chep MA_LO va tru ton CO_THE_BAN tuong ung.');
}

// ================================================================
// MUC 11 - CANH BAO TON KHO. Tu tinh BAN_TB_NGAY tu DON_HANG.
// ================================================================
function m11_canhBaoTonKho() {
  var tuDong = tuDong_(), sT, sC, sD;
  try { sT = layTrang('TON_KHO'); sC = layTrang('CANH_BAO'); sD = layTrang('DON_HANG'); }
  catch (e) { if (!tuDong) bao_('Loi', e.message); return; }

  // Tinh luong ban trung binh 14 ngay tu don da gui di
  var moc = new Date(); moc.setDate(moc.getDate() - 14);
  var dd = docBang_(sD), banTheoMa = {};
  var iTt = dd.head.indexOf('TRANG_THAI'), iMh = dd.head.indexOf('MA_HANG'),
      iSl = dd.head.indexOf('SO_LUONG'), iNgayGui = dd.head.indexOf('NGAY_GUI_KHO');
  dd.rows.forEach(function (r) {
    var tt = String(r[iTt]).trim();
    if (['DA_GUI_KHO','DANG_GIAO','GIAO_THANH_CONG','DA_DOI_SOAT'].indexOf(tt) === -1) return;
    var n = r[iNgayGui] instanceof Date ? r[iNgayGui] : new Date(String(r[iNgayGui]));
    if (isNaN(n.getTime()) || n < moc) return;
    var mh = String(r[iMh]).trim();
    banTheoMa[mh] = (banTheoMa[mh] || 0) + (Number(r[iSl]) || 0);
  });

  var dt = docBang_(sT);
  var iMa = dt.head.indexOf('MA_HANG'), iCo = dt.head.indexOf('CO_THE_BAN'),
      iDi = dt.head.indexOf('DIEM_DAT_LAI'), iNg = dt.head.indexOf('SO_NGAY_DU_HANG');
  var cTb = chiSoCot(sT, 'BAN_TB_NGAY');
  dt.rows.forEach(function (r, i) {
    var mh = String(r[iMa]).trim();
    if (!mh) return;
    if (banTheoMa[mh]) sT.getRange(i + 2, cTb).setValue(Math.round(banTheoMa[mh] / 14 * 100) / 100);
  });
  SpreadsheetApp.flush();
  dt = docBang_(sT);

  // Lan canh bao gan nhat cua tung ma hang: chi bao lai khi co thay doi that
  var dc = docBang_(sC);
  var iLoai = dc.head.indexOf('LOAI_CANH_BAO'), iMaC = dc.head.indexOf('MA_HANG'),
      iNdC = dc.head.indexOf('NOI_DUNG'), iXuLy = dc.head.indexOf('DA_XU_LY');
  var lanTruoc = {};
  dc.rows.forEach(function (r) {
    if (String(r[iLoai]).trim() !== 'TON_KHO') return;
    var m = String(r[iNdC]).match(/Ton co the ban (\d+)/);
    lanTruoc[String(r[iMaC]).trim()] = {
      ton: m ? parseInt(m[1], 10) : null,
      daXuLy: String(r[iXuLy]).trim().toUpperCase() === 'CO'
    };
  });

  var thoiGianSX = soCauHinh_('THOI_GIAN_SAN_XUAT_NGAY');
  var ngay = homNay_(), them = [], boQua = [];

  dt.rows.forEach(function (r) {
    var ma = String(r[iMa]).trim();
    if (!ma) return;
    var co = Number(r[iCo]) || 0;
    var di = Math.round(Number(r[iDi]) || 0);
    var soNgay = Number(r[iNg]);
    if (di <= 0 || co > di) return;

    var truoc = lanTruoc[ma];
    if (truoc && !truoc.daXuLy && truoc.ton !== null && co >= truoc.ton) {
      boQua.push(ma + ' (da bao truoc do, ton chua giam them)');
      return;
    }

    var cauNgay = isNaN(soNgay) ? 'chua tinh duoc'
      : (Math.round(soNgay * 10) / 10) + ' ngay';
    var them2 = '';
    if (!isNaN(soNgay) && thoiGianSX > 0 && soNgay < thoiGianSX) {
      them2 = ' Thoi gian san xuat la ' + thoiGianSX +
              ' ngay, dat hom nay thi hang ve sau khi kho da het.';
    }
    them.push([ngay, 'TON_KHO', ma,
      'Ton co the ban ' + co + ' da cham diem dat lai ' + di +
      '. Con du hang khoang ' + cauNgay + '.' + them2, di, 'KHONG']);
  });

  if (!them.length) {
    if (!tuDong) bao_('Canh bao ton kho',
      'Da cap nhat BAN_TB_NGAY tu don hang.\n' +
      (boQua.length ? 'Khong gui lai canh bao cho: ' + boQua.join(', ') +
        '.\nDanh dau DA_XU_LY la CO o dong canh bao cu neu muon nhan lai.'
       : 'Khong ma hang nao cham diem dat lai.'));
    return;
  }

  var r0 = dongTrongDauTien_(sC);
  sC.getRange(r0, 1, them.length, 6).setValues(them);

  baoVanHanh_('Canh bao ton kho ' + ngay,
    docCauHinh('MAU_THU_CANH_BAO_TON') + '\n\n' +
    them.map(function (t) { return '- ' + t[2] + ': ' + t[3]; }).join('\n') +
    '\n\nChi bao lai khi ton giam them, hoac khi ban danh dau DA_XU_LY la CO ' +
    'o dong canh bao trong trang CANH_BAO.', true);
  if (!tuDong) bao_('Canh bao ton kho','Da ghi ' + them.length + ' dong vao CANH_BAO va gui thu.');
}

// ================================================================
// MUC 12 - PHAN LOAI THU. Chi tao thu nhap, khong tu gui.
// ================================================================
function m12_phanLoaiThu() {
  var tuDong = tuDong_();
  var gio = new Date().getHours();
  if (tuDong && (gio < 8 || gio > 20)) return;

  var nhanCho = GmailApp.getUserLabelByName(NHAN_CHO);
  var nhanXong = GmailApp.getUserLabelByName(NHAN_XONG);
  if (!nhanCho || !nhanXong) {
    if (!tuDong) bao_('Thieu nhan','Chua co nhan Gmail. Chay muc Dat trinh kich hoat.');
    return;
  }

  var sheet = layTrang('HOAN_HUY');
  var batDau = new Date().getTime();
  var HAN = 4 * 60 * 1000;   // dung truoc khi cham han 6 phut cua Apps Script
  var MOI_LAN = 3;           // moi lan chay chi doc 3 thu

  // Chuoi thu da xu ly nhung khach vua tra loi them thi dua lai vao hang cho
  var daDua = 0;
  try {
    var dh = docBang_(sheet);
    var iMaCh = dh.head.indexOf('MA_NOI_DUNG'), iNgayH = dh.head.indexOf('NGAY');
    var lanCuoi = {};
    dh.rows.forEach(function (r) {
      var mc = String(r[iMaCh]).trim();
      if (!mc) return;
      var n = r[iNgayH] instanceof Date ? r[iNgayH] : new Date(String(r[iNgayH]));
      if (!isNaN(n.getTime()) && (!lanCuoi[mc] || n > lanCuoi[mc])) lanCuoi[mc] = n;
    });
    nhanXong.getThreads(0, 30).forEach(function (t) {
      var mc = t.getId();
      var msgs2 = t.getMessages();
      var moiNhat = msgs2[msgs2.length - 1];
      // Chi tinh thu do khach gui, khong tinh thu minh gui di
      if (moiNhat.getFrom().indexOf(Session.getEffectiveUser().getEmail()) > -1) return;
      var truoc = lanCuoi[mc];
      if (!truoc || moiNhat.getDate() > truoc) {
        t.removeLabel(nhanXong).addLabel(nhanCho);
        daDua++;
      }
    });
  } catch (e) { console.error('Doi chieu thu tra loi: ' + e.message); }

  var threads = nhanCho.getThreads(0, MOI_LAN), xong = 0, loi = [];

  for (var i = 0; i < threads.length; i++) {
    if (new Date().getTime() - batDau > HAN) {
      loi.push('Dung vi gan cham han 6 phut. Cac thu con lai van nam trong hang cho.');
      break;
    }
    var th = threads[i], msgs = th.getMessages(), msg = msgs[msgs.length - 1];
    var tieuDe = th.getFirstMessageSubject();
    try {
      var kq = goiAPI(docCauHinh('PROMPT_PHAN_LOAI_THU'),
        'Tieu de: ' + tieuDe + '\n\nNoi dung:\n' + msg.getPlainBody().substring(0, 2000));
      var o = tachJson_(kq.van_ban);
      var tomTat = truong_(o, 'tom_tat');
      var nhom = truong_(o, 'nhom_yeu_cau');
      var uuTien = truong_(o, 'muc_uu_tien').toUpperCase();
      var conThieu = truong_(o, 'thong_tin_con_thieu');
      var mauTraLoi = truong_(o, 'mau_tra_loi');
      var canDuyet = truong_(o, 'can_con_nguoi_duyet').toUpperCase();

      // Chot chan: bon nhom nhay cam luon phai chuyen nguoi, du mo hinh noi gi
      var goc = (tieuDe + ' ' + msg.getPlainBody()).toLowerCase();
      var tuKhoa = ['hoan tien','tra lai tien','huy don','khieu nai','loi san pham',
                    'quang cao sai','an toan','boi thuong'];
      if (tuKhoa.some(function (t) { return goc.indexOf(t) > -1; })) canDuyet = 'CO';

      var docDuoc = tomTat || nhom || mauTraLoi;
      themDong_(sheet, {
        NGAY: homNay_(), KENH: 'EMAIL',
        NHOM_YEU_CAU: nhom, MUC_UU_TIEN: uuTien,
        TOM_TAT: docDuoc ? tomTat : ('KHONG DOC DUOC. Nguyen van: ' + kq.van_ban.substring(0, 1500)),
        THONG_TIN_CON_THIEU: conThieu, MAU_TRA_LOI: mauTraLoi,
        CAN_CON_NGUOI_DUYET: (canDuyet === 'CO') ? 'CO' : 'KHONG',
        NGUOI_XU_LY: docCauHinh('NGUOI_XU_LY_MAC_DINH'), TRANG_THAI: 'CHO_XU_LY',
        MA_NOI_DUNG: th.getId()
      });
      if (mauTraLoi) msg.createDraftReply(mauTraLoi);
      else loi.push(tieuDe + ': mo hinh khong tra ve truong mau_tra_loi, chua tao thu nhap.');

      // Thu can nguoi duyet thi bao ngay, khong cho den cuoi ngay
      if (canDuyet === 'CO') {
        var kenhXong = canDuyet1_(tieuDe, nhom, uuTien, tomTat, th.getPermalink());
        if (!kenhXong.length) {
          loi.push(tieuDe + ': THU CAN DUYET nhung KHONG gui duoc canh bao qua kenh nao. ' +
                   'Kiem o EMAIL_NGUOI_DUYET va EMAIL_QUAN_LY trong CAU_HINH.');
        }
      }
      th.removeLabel(nhanCho).addLabel(nhanXong);
      xong++;
    } catch (e) {
      loi.push(tieuDe + ': ' + e.message);
      console.error(tieuDe + ': ' + e.message);
    }
  }

  var conLai = nhanCho.getThreads(0, 50).length;
  if (!tuDong) {
    bao_('Phan loai thu',
      'Da xu ly ' + xong + ' thu.\n' +
      'Con ' + conLai + ' thu trong hang cho.\n' +
      (daDua ? 'Da dua lai ' + daDua + ' chuoi thu vao hang cho vi khach tra loi them.\n' : '') +
      'Thu nhap nam trong Gmail, ban tu bam gui.' +
      (loi.length ? '\n\nLoi:\n- ' + loi.join('\n- ') : ''));
  }
}

/**
 * Bao ngay khi co thu bat buoc nguoi duyet.
 * Tieu de mang tien to he thong de bo loc Gmail khong gan nhan cho no,
 * neu khong he thong se tu phan loai thu cua chinh minh, thanh vong lap.
 */
function canDuyet1_(tieuDe, nhom, uuTien, tomTat, link) {
  return baoVanHanh_('Thu can ban duyet: ' + tieuDe,
    'Mot thu khach hang vua duoc phan loai la bat buoc chuyen nguoi.\n\n' +
    'Nhom yeu cau: ' + (nhom || 'chua ro') + '\n' +
    'Muc uu tien: ' + (uuTien || 'chua ro') + '\n\n' +
    'Tom tat:\n' + (tomTat || 'chua doc duoc') + '\n\n' +
    'Mo chuoi thu: ' + link + '\n\n' +
    'Thu nhap da co san trong Gmail. Doc lai roi tu bam gui. ' +
    'He thong khong tu gui thu cho khach.', true);
}

/**
 * Bao cuoi ngay: gom cac dong HOAN_HUY chua xu ly.
 * Chay 18 gio moi ngay, khong gui neu khong co gi.
 */
function baoCuoiNgay() {
  var sheet;
  try { sheet = layTrang('HOAN_HUY'); } catch (e) { console.error(e); return; }
  var d = docBang_(sheet);
  var iTt = d.head.indexOf('TRANG_THAI'), iDuyet = d.head.indexOf('CAN_CON_NGUOI_DUYET'),
      iTom = d.head.indexOf('TOM_TAT'), iNhom = d.head.indexOf('NHOM_YEU_CAU'),
      iUu = d.head.indexOf('MUC_UU_TIEN'), iNgay = d.head.indexOf('NGAY');

  var gap = [], thuong = [];
  d.rows.forEach(function (r) {
    var tt = String(r[iTt]).trim();
    if (tt === 'DA_TRA_LOI' || tt === 'DA_DONG') return;
    var dong = '- [' + (String(r[iUu]).trim() || 'chua ro') + '] ' +
               (String(r[iNhom]).trim() || 'chua ro') + ': ' +
               String(r[iTom]).substring(0, 200);
    if (String(r[iDuyet]).trim().toUpperCase() === 'CO') gap.push(dong);
    else thuong.push(dong);
  });

  if (!gap.length && !thuong.length) return;

  var than = 'Tong hop thu khach hang chua xu ly, tinh den ' + homNay_() + '.\n\n';
  if (gap.length) than += 'BAT BUOC BAN DUYET (' + gap.length + '):\n' + gap.join('\n') + '\n\n';
  if (thuong.length) than += 'AI da soan nhap (' + thuong.length + '):\n' + thuong.join('\n') + '\n\n';
  than += 'Thu nhap nam trong Gmail. Xu ly xong thi doi cot TRANG_THAI trong HOAN_HUY ' +
          'sang DA_TRA_LOI hoac DA_DONG de khong bao lai.';

  baoVanHanh_('Thu khach chua xu ly: ' + (gap.length + thuong.length) + ' viec',
              than, gap.length > 0);
}

// ================================================================
// MUC 13 - TONG HOP HUY HOAN
// ================================================================
function m13_tongHopHoanHuy() {
  var tuDong = tuDong_(), sH, sC, sD;
  try { sH = layTrang('HOAN_HUY'); sC = layTrang('CANH_BAO'); sD = layTrang('DON_HANG'); }
  catch (e) { if (!tuDong) bao_('Loi', e.message); return; }

  var moc = new Date(); moc.setDate(moc.getDate() - 7);
  var d = docBang_(sH);
  var iNgay = d.head.indexOf('NGAY'), iNg = d.head.indexOf('NGUYEN_NHAN_GOC'),
      iLo = d.head.indexOf('MA_LO');

  var theoNn = {}, theoLo = {}, tong = 0;
  d.rows.forEach(function (r) {
    var n = r[iNgay] instanceof Date ? r[iNgay] : new Date(String(r[iNgay]));
    if (isNaN(n.getTime()) || n < moc) return;
    var nn = String(r[iNg]).trim() || 'KHAC';
    theoNn[nn] = (theoNn[nn] || 0) + 1;
    var lo = String(r[iLo]).trim();
    if (lo) theoLo[lo] = (theoLo[lo] || 0) + 1;
    tong++;
  });
  if (!tong) { if (!tuDong) bao_('Tong hop huy hoan','Bay ngay qua khong co dong nao.'); return; }

  var dd = docBang_(sD), iTt = dd.head.indexOf('TRANG_THAI');
  var giao = dd.rows.filter(function (r) {
    return String(r[iTt]).trim() === 'GIAO_THANH_CONG';
  }).length || tong;

  var nguongNn = soCauHinh_('NGUONG_TY_LE_NGUYEN_NHAN') || 30;
  var nguongLo = soCauHinh_('NGUONG_TY_LE_LO') || 2;
  var ngay = homNay_(), them = [];

  Object.keys(theoNn).forEach(function (nn) {
    var tl = theoNn[nn] / tong * 100;
    them.push([ngay, 'HOAN_HUY', nn,
      nn + ': ' + theoNn[nn] + ' dong, chiem ' + tl.toFixed(1) + '% so dong huy hoan tuan, ' +
      'bang ' + (theoNn[nn] / giao * 100).toFixed(1) + '% don giao thanh cong' +
      (tl > nguongNn ? ' -- VUOT NGUONG' : ''), nguongNn, 'KHONG']);
  });

  var tbLo = tong / Math.max(Object.keys(theoLo).length, 1);
  Object.keys(theoLo).forEach(function (lo) {
    if (theoLo[lo] >= tbLo * nguongLo) {
      them.push([ngay, 'HOAN_HUY_LO', lo,
        'Ma lo ' + lo + ' co ' + theoLo[lo] + ' dong huy hoan, cao gap ' +
        (theoLo[lo] / tbLo).toFixed(1) + ' lan trung binh -- VUOT NGUONG', nguongLo, 'KHONG']);
    }
  });

  if (!them.length) { if (!tuDong) bao_('Tong hop huy hoan','Khong co muc nao can ghi.'); return; }

  var r0 = dongTrongDauTien_(sC);
  sC.getRange(r0, 1, them.length, 6).setValues(them);
  baoVanHanh_('Tong hop huy hoan tuan ' + ngay,
    them.map(function (t) { return '- ' + t[3]; }).join('\n'), false);
  if (!tuDong) bao_('Tong hop huy hoan','Da ghi ' + them.length + ' dong vao CANH_BAO.');
}

// ================================================================
// MUC 14 - DOI SOAT KY
// ================================================================
function m14_doiSoatKy() {
  var sO = layTrang('DOI_SOAT'), sD = layTrang('DON_HANG');
  var folder;
  try { folder = thuMuc_('ID_THU_MUC_NAP_DON', 'NAP_DON'); }
  catch (e) { bao_('Loi', e.message); return; }

  var dd = docBang_(sD), tien = {};
  var iMa = dd.head.indexOf('MA_DON'), iTien = dd.head.indexOf('TIEN_KHACH_TRA');
  dd.rows.forEach(function (r) {
    if (r[iMa]) tien[String(r[iMa]).trim()] = Number(r[iTien]) || 0;
  });

  var doc = docBang_(sO), iMaO = doc.head.indexOf('MA_DON'), daCo = {};
  doc.rows.forEach(function (r) { if (r[iMaO]) daCo[String(r[iMaO]).trim()] = true; });

  var files = folder.getFiles(), soDong = 0, ky = homNay_();
  while (files.hasNext()) {
    var f = files.next(), ten = f.getName();
    if (ten.indexOf('DA_NAP_') === 0) continue;
    if (ten.toUpperCase().indexOf('DOI_SOAT') === -1) continue;

    var rows;
    try { rows = Utilities.parseCsv(f.getBlob().getDataAsString()); } catch (e) { continue; }
    if (rows.length < 2) continue;
    var head = rows[0].map(function (v) { return String(v).trim().toUpperCase(); });

    for (var i = 1; i < rows.length; i++) {
      var o = {};
      head.forEach(function (h, j) { if (COT_TRANG.DOI_SOAT.indexOf(h) > -1) o[h] = rows[i][j]; });
      var ma = String(o.MA_DON || '').trim();
      if (!ma || daCo[ma]) continue;
      daCo[ma] = true;
      var thuc = Number(o.TIEN_THUC_NHAN) || 0;
      var ghiNhan = Number(o.DOANH_THU_GHI_NHAN) || tien[ma] || 0;
      var phi = (Number(o.PHI_NEN_TANG) || 0) + (Number(o.PHI_THANH_TOAN) || 0)
                - (Number(o.HO_TRO_VAN_CHUYEN) || 0);
      o.DOANH_THU_GHI_NHAN = ghiNhan;
      o.CHENH_LECH = ghiNhan - phi - thuc;
      o.KY_DOI_SOAT = o.KY_DOI_SOAT || ky;
      if (!o.NGAY) o.NGAY = ky;
      themDong_(sO, o);
      soDong++;
    }
    f.setName('DA_NAP_' + ten);
  }
  bao_('Doi soat ky', soDong
    ? 'Da nap ' + soDong + ' dong vao DOI_SOAT.\nKiem cot CHENH_LECH, phai bang 0.'
    : 'Khong thay tep CSV nao co chu DOI_SOAT trong ten, trong thu muc NAP_DON.');
}

// ================================================================
// BANG DIEU KHIEN
// ================================================================
var MUC_CHAY = {
  m01_taoBieuMau: '1. Tao bieu mau thu du lieu',
  m02_napDuLieuNhuCau: '2. Nap du lieu nhu cau',
  m03_phanNhomNhuCau: '3. Phan nhom nhu cau',
  m04_taoBanYeuCauSP: '4. Tao ban yeu cau san pham',
  m04b_taoBanYeuCauSPMoi: '4b. Tao ban yeu cau SP phien ban moi',
  m05_guiYeuCauBaoGia: '5. Gui yeu cau lay bao gia',
  lamMoiVongGuiNCC: '5b. Lam moi vong gui NCC',
  m06_taoDanhSachKiemMau: '6. Tao danh sach kiem mau',
  m07_taoNoiDungBanHang: '7. Tao noi dung ban hang',
  m08_nhapDonHang: '8. Nhap don hang',
  m09_kiemTraDon: '9. Kiem tra don',
  m10_guiKho: '10. Gui kho',
  m11_canhBaoTonKho: '11. Canh bao ton kho',
  m12_phanLoaiThu: '12. Phan loai thu ho tro',
  m13_tongHopHoanHuy: '13. Tong hop huy hoan',
  m14_doiSoatKy: '14. Doi soat ky'
};

var HAM_CHAY = {
  m01_taoBieuMau: m01_taoBieuMau, m02_napDuLieuNhuCau: m02_napDuLieuNhuCau,
  m03_phanNhomNhuCau: m03_phanNhomNhuCau, m04_taoBanYeuCauSP: m04_taoBanYeuCauSP,
  m04b_taoBanYeuCauSPMoi: m04b_taoBanYeuCauSPMoi,
  m05_guiYeuCauBaoGia: m05_guiYeuCauBaoGia, lamMoiVongGuiNCC: lamMoiVongGuiNCC,
  m06_taoDanhSachKiemMau: m06_taoDanhSachKiemMau,
  m07_taoNoiDungBanHang: m07_taoNoiDungBanHang, m08_nhapDonHang: m08_nhapDonHang,
  m09_kiemTraDon: m09_kiemTraDon, m10_guiKho: m10_guiKho,
  m11_canhBaoTonKho: m11_canhBaoTonKho, m12_phanLoaiThu: m12_phanLoaiThu,
  m13_tongHopHoanHuy: m13_tongHopHoanHuy, m14_doiSoatKy: m14_doiSoatKy
};

function chayMuc(ten) {
  if (!HAM_CHAY[ten]) return 'Khong tim thay muc ' + ten;
  _BDK.bat = true; _BDK.tin = [];
  try {
    HAM_CHAY[ten]();
    return _BDK.tin.length ? _BDK.tin.join('\n') : 'Da chay xong: ' + MUC_CHAY[ten];
  } catch (e) {
    return 'Loi: ' + e.message;
  } finally { _BDK.bat = false; }
}

function layChiSo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  function dem(trang, cot, dk) {
    var s = ss.getSheetByName(trang);
    if (!s) return 0;
    var d = docBang_(s), i = d.head.indexOf(cot);
    if (i === -1) return 0;
    return d.rows.filter(function (r) { return dk(String(r[i]).trim()); }).length;
  }
  function tong(trang) {
    var s = ss.getSheetByName(trang);
    return s ? docBang_(s).rows.length : 0;
  }
  var khac = function (v) { return v !== ''; };
  var la = function (x) { return function (v) { return v === x; }; };

  return {
    nhuCau: dem('DU_LIEU_THO','NHOM_DA_DUYET',khac) + ' / ' + tong('DU_LIEU_THO'),
    duPhong: dem('NHA_CUNG_CAP','VAI_TRO',la('DU_PHONG')),
    noiDungChoDuyet: dem('NOI_DUNG','TRANG_THAI',
      function (v) { return v === 'BAN_AI' || v === 'CHO_DUYET'; }),
    don: {
      CHO_XAC_NHAN: dem('DON_HANG','TRANG_THAI',la('CHO_XAC_NHAN')),
      DU_DIEU_KIEN_XUAT: dem('DON_HANG','TRANG_THAI',la('DU_DIEU_KIEN_XUAT')),
      DA_GUI_KHO: dem('DON_HANG','TRANG_THAI',la('DA_GUI_KHO')),
      DANG_GIAO: dem('DON_HANG','TRANG_THAI',la('DANG_GIAO')),
      GIAO_THANH_CONG: dem('DON_HANG','TRANG_THAI',la('GIAO_THANH_CONG')),
      HUY_HOAN: dem('DON_HANG','TRANG_THAI',function (v) { return v === 'HUY' || v === 'HOAN'; })
    },
    canhBao: dem('CANH_BAO','DA_XU_LY',function (v) { return v !== 'CO'; }),
    thuChoDuyet: dem('HOAN_HUY','CAN_CON_NGUOI_DUYET',la('CO')),
    thuongHieu: docCauHinh('TEN_THUONG_HIEU') || 'Chua dat ten thuong hieu',
    capNhat: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm dd/MM/yyyy')
  };
}

function moBangDieuKhien() {
  var t;
  try { t = HtmlService.createTemplateFromFile('bang_dieu_khien'); }
  catch (e) {
    bao_('Chua co bang dieu khien',
      'Du an chua co tep bang_dieu_khien.html.\n\n' +
      'Trong Apps Script bam dau cong ben canh chu Tep, chon Html, ' +
      'dat ten dung la bang_dieu_khien, roi dan noi dung giao dien vao do.\n\n' +
      'Moi muc van chay binh thuong qua menu Van hanh don hang.');
    return;
  }
  SpreadsheetApp.getUi().showModalDialog(
    t.evaluate().setWidth(960).setHeight(700), 'Bang dieu khien van hanh');
}