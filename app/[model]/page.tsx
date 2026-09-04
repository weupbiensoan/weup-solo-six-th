import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "../page";

const modelMetadata:Record<string,{number:string;title:string;description:string}>={
  "model-1":{number:"1",title:"ธุรกิจความเชี่ยวชาญและบริการที่ปรึกษา",description:"คู่มือสร้างระบบให้คำปรึกษาด้านโภชนาการ 28 วัน ตั้งแต่พรอมต์ ซอร์สโค้ด ไปจนถึงขั้นตอนการดำเนินงาน"},
  "model-2":{number:"2",title:"บริการวิดีโอสั้น 12 รายการต่อเดือน",description:"คู่มือทำให้กระบวนการรับข้อมูล เก็บภาพ สร้างเนื้อหา ตรวจสอบ และส่งมอบวิดีโอเป็นระบบอัตโนมัติ"},
  "model-3":{number:"3",title:"ผลิตภัณฑ์ความรู้ที่ขายซ้ำได้",description:"คู่มือเปลี่ยนประสบการณ์และแบรนด์ส่วนบุคคลให้เป็นผลิตภัณฑ์ความรู้ที่ขายได้หลายครั้ง"},
  "model-4":{number:"4",title:"รายงานยอดขายรายสัปดาห์แบบมีการตรวจทาน",description:"คู่มือสร้างระบบคำนวณข้อมูล สร้างข้อเสนอแนะด้วย AI ตรวจทาน และส่งรายงานยอดขายรายสัปดาห์"},
  "model-5":{number:"5",title:"บริหารอีคอมเมิร์ซด้วยเครือข่ายพาร์ตเนอร์",description:"คู่มือบริหารสินค้า คำสั่งซื้อ สต็อก การสนับสนุน และการกระทบยอดร่วมกับเครือข่ายพาร์ตเนอร์"},
  "model-6":{number:"6",title:"สร้างระบบการขายและรับค่าคอมมิชชันด้วย AI",description:"คู่มือตรวจสอบแคตตาล็อก เก็บความต้องการ แนะนำสินค้า และกระทบยอดค่าคอมมิชชันด้วย AI"},
};

export function generateStaticParams(){
  return Object.keys(modelMetadata).map(model=>({model}));
}

export async function generateMetadata({params}:{params:Promise<{model:string}>}):Promise<Metadata>{
  const {model:slug}=await params,model=modelMetadata[slug];
  if(!model)return {};
  const title=`โมเดล ${model.number}: ${model.title}`;
  return {title,description:model.description,openGraph:{title,description:model.description,images:[]},twitter:{title,description:model.description,images:[]}};
}

export default async function ModelPage({params}:{params:Promise<{model:string}>}){
  const {model}=await params;
  if(!modelMetadata[model])notFound();
  return <Home/>;
}

