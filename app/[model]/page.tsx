import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "../page";

const modelMetadata:Record<string,{number:string;title:string;description:string}>={
  "mo-hinh-1":{number:"1",title:"Kinh doanh chuyên môn và dịch vụ tư vấn",description:"Hướng dẫn triển khai hệ thống tư vấn dinh dưỡng 28 ngày từ câu lệnh, mã nguồn đến quy trình vận hành."},
  "mo-hinh-2":{number:"2",title:"Dịch vụ 12 video ngắn mỗi tháng",description:"Hướng dẫn tự động hóa quy trình nhận hồ sơ, thu ảnh, tạo nội dung, kiểm tra và bàn giao video."},
  "mo-hinh-3":{number:"3",title:"Sản phẩm tri thức bán nhiều lần",description:"Hướng dẫn biến kinh nghiệm và thương hiệu cá nhân thành sản phẩm tri thức có thể bán nhiều lần."},
  "mo-hinh-4":{number:"4",title:"Báo cáo bán hàng tuần có kiểm duyệt",description:"Hướng dẫn xây hệ thống tự tính số liệu, tạo nhận xét AI, duyệt và gửi báo cáo bán hàng tuần."},
  "mo-hinh-5":{number:"5",title:"Vận hành thương mại điện tử bằng mạng lưới đối tác",description:"Hướng dẫn vận hành sản phẩm, đơn hàng, tồn kho, hỗ trợ và đối soát cùng mạng lưới đối tác."},
  "mo-hinh-6":{number:"6",title:"Xây hệ thống bán hàng và nhận hoa hồng bằng AI",description:"Hướng dẫn kiểm chứng danh mục, thu nhu cầu, giới thiệu sản phẩm và đối soát hoa hồng bằng AI."},
};

export function generateStaticParams(){
  return Object.keys(modelMetadata).map(model=>({model}));
}

export async function generateMetadata({params}:{params:Promise<{model:string}>}):Promise<Metadata>{
  const {model:slug}=await params,model=modelMetadata[slug];
  if(!model)return {};
  const title=`Mô hình ${model.number}: ${model.title}`;
  return {title,description:model.description,openGraph:{title,description:model.description,images:[]},twitter:{title,description:model.description,images:[]}};
}

export default async function ModelPage({params}:{params:Promise<{model:string}>}){
  const {model}=await params;
  if(!modelMetadata[model])notFound();
  return <Home/>;
}

