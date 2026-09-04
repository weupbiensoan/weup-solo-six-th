"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { upload as uploadToBlob } from "@vercel/blob/client";
import { promptText } from "./knowledge";
import { promptText2, steps2 } from "./knowledge2";
import { promptText3 } from "./knowledge3";
import { promptText4 } from "./knowledge4";
import { promptText5 } from "./knowledge5";
import { promptText6 } from "./knowledge6";
import { model1DetailedGuide } from "./model1-detailed-guide";
import { model3DetailedGuide } from "./model3-detailed-guide";
import { model4DetailedGuide } from "./model4-detailed-guide";
import { model5DetailedGuide } from "./model5-detailed-guide";
import { model6DetailedGuide } from "./model6-detailed-guide";

type StepPreparation={manual:string[];automatic:string[]};
type GuideStep = {id:string;n:string;title:string;details:string[];callout?:{title:string;text:string};detailImages:string[][];calloutImages:string[];defaultVideo?:string;showVideo?:boolean;preparation?:StepPreparation};

const defaultStepPreparation:Record<string,StepPreparation>={
  "buoc-chuan-bi":{manual:["มีบัญชี Google และ Google Sheets เปล้างเป็นไฟล์กลาง"],automatic:["หลังจากที่ตั้งรหัสแล้ว ระบบจะสร้างหน้าการเขียนและโครงสร้างที่ต้องการได้ในไฟล์นี้"]},
  "buoc-1":{manual:["โหลดทั้งหมด ไฟล์โค้ดสามไฟล์ของรหัสบนหน้า และเปิด Apps Script จากตรง Google Sheets กลาง"],automatic:["เมนูการทํางานจะปรากฏเมื่อโค้ดถูกติดตามชื่อแฟ้มถูกต้อง และตารางบอลถูกโหลดคืน"]},
  "buoc-2":{manual:["เตรียมป้าย OpenAI API, วิธีการชําระเงิน API และเนื้อหาแบบที่ต้องการให้กับแขก"],automatic:["คอร์ดตรวจสอบการเชื่อมต่อ การสร้างแบบ แนวข้อ ตอบรับความคิดเห็น และผลิตร่างแรก"]},
  "buoc-3":{manual:["ผู้ปรึกษาต้องอ่านร่างงาน การตรวจสอบส่วนที่เชี่ยวชาญ และเลือกสถานะการตรวจสอบ"],automatic:["ระบบนั้นมีแค่การจัดร่างไว้ในแถวรอคอย ไม่ให้การจัดร่างโดยตัวเองแทนผู้ปรึกษา"]},
  "buoc-4":{manual:["ใส่ข้อตกลงที่ชัดเจนในส่วนที่ต้องการแก้ไข และเลือกข้อตกลงที่ต้องการแก้ไข เมื่อมีข้อตกลงที่ต้องการแก้ไข"],automatic:["AI เขียนบทความที่สนับสนุนไว้ไว้ และเก็บส่วนที่เหลือ และส่งข้อตกลงไปยังแผนที่ครบวงจร"]},
  "buoc-5":{manual:["อ่านแผนสุดท้ายทั้งหมดอีกครั้ง และเลือก \"ส่งแล้ว\" เมื่อเนื้อหาพร้อมส่ง"],automatic:["ระบบเก็บแผนไว้ในสภาพรอจนกว่าคุณจะตัดสินใจตรวจสอบสุดท้าย"]},
  "buoc-6":{manual:["ตรวจสอบอีเมลผู้เข้า, รหัสผู้เข้า และสถานการณ์การส่งที่ผ่านมา ก่อนการเปิด"],automatic:["ระบบส่ง Gmail จัดเวลาส่ง และฝากส่งเชื้อ"]},
  "buoc-7":{manual:["ใช้รหัสที่เหมาะสมในหัวข้อของเมล์ เพื่อให้ระบบการรับรู้ตอบสนอง"],automatic:["ระบบค้นหาคําตอบ, ประเภทความ, เขียนในแผ่นตอบสนอง และระบุคําตอบที่อ่าน"]},
  "buoc-8":{manual:["เตรียมชื่อฟังก์ชันใหม่ และชื่อฟังก์ชันที่ตรงกันก่อนการปรับเมนู"],automatic:["หลังจากบันทึกรหัสและโหลดตารางบอลใหม่ Apps Script จะสร้างเมนูใหม่ให้กับรายการใหม่"]},
  "buoc-9":{manual:["จบการสร้างกรอบหน้าคอม ก่อนเปิด Dashboard"],automatic:["Dashboard อ่านข้อมูลในตาราง และแสดงสถานะ การดําเนินงาน และการทําต่อไป"]},

  "m2-buoc-01":{manual:["ครับ มี Google Sheets เปล้างด้วย ไฟล์โค้ดสามไฟล์ที่ถูกชื่อ"],automatic:["ระบบการสร้างเมนูและกรอบการทํางานในตารางเปิด"]},
  "m2-buoc-02":{manual:["คีย์ OpenAI API ได้เปิดการชําระเงินและการเข้าใช้งานที่ต้องการ"],automatic:["คอร์ดตรวจสอบกุญแจ รูปแบบ และเขียนผิดพลาด หากการเชื่อมต่อล้มเหลว"]},
  "m2-buoc-03":{manual:["เตรียมคําถามเข้าถึงเรื่องธุรกิจ ผลิตภัณฑ์ ผู้เข้ารับการใช้งาน และสิทธิใช้งานภาพ"],automatic:["ระบบสร้าง 9 หน้าใบแบบฟอร์ม และรหัสโปรแกรมลูกค้า"]},
  "m2-buoc-04":{manual:["ผู้เข้ารับต้องการภาพสินค้า รูปตัวละคร และโลโก้ที่เหมาะสม"],automatic:["ระบบสร้างโฟลเดอร์ ส่งลิ้งส่งรูป สนับไฟล์ และล็อคปรับปรุงเมื่อมีขั้นต่ํา"]},
  "m2-buoc-05":{manual:["ตรวจสอบรายงาน AI ที่ขาด และรับรายงานเมื่อหลักฐานและภาพที่พอเพียง"],automatic:["AI เปรียบเทียบแบบฟอร์มกับภาพประเภท; สร้างเอกสารที่ต้องการเพิ่มจากแบบฟอร์มที่มี"]},
  "m2-buoc-06":{manual:["การแยกแยกหรือแยกแต่ละมุมของเนื้อหาจากภาพที่ถ่ายได้จริง"],automatic:["AI ทําให้มี 20 มุมของเนื้อหา และนําไปสู่รายการที่รอดู"]},
  "m2-buoc-07":{manual:["หมายเลขที่ผ่านมา เมื่อความคิดที่เลือกถูกนําไปสู่การสรรพสินค้า"],automatic:["AI เขียนบทความสําหรับแนวคิดที่ผ่านการค้นหา และยังไม่ได้เขียนบทความ"]},
  "m2-buoc-08":{manual:["รับรองว่าชื่อภาพนั้นชัดเจน และภาพนั้นไม่เปลี่ยนกัน"],automatic:["AI แผนรูปภาพ; รหัสตรวจสอบชื่อของฟิล์มแต่ละครั้ง และระบุ THIEU_ANH หากภาพไม่มี"]},
  "m2-buoc-09":{manual:["ถอดวีดีโอสุดท้ายทั้งหมดเข้ากับโฟลเดอร์ 04_VIDEO_FINAL และเติมไปยังคอลัมน์ QC ที่ต้องการการประเมินด้วยตา"],automatic:["ระบบจะเทียบรายการวีดีโอกับไฟล์จริง แต่จะเก็บส่วน QC ที่คุณใส่ไว้"]},
  "m2-buoc-10":{manual:["ผ่านคุณภาพสุดท้าย และเลือกสถานะที่ได้รับการอนุมัติ"],automatic:["ระบบส่งวีดีโอให้กับผู้คนได้พอแล้ว แล้วบันทึกวันส่ง เพื่อไม่ให้ส่งเชื้อ"]},
  "m2-buoc-11":{manual:["จัดรหัสการเข้าพักในหัวข้อการแลกเปลี่ยนทางอีเมล"],automatic:["ระบบอ่านอีเมล ประเภทตอบสนอง และการประสานอีเมลที่ผ่านการจัดทํา"]},
  "m2-buoc-12":{manual:["ลงกรอบหน้าตาราง และเปิดปานิชั่น เลือกตารางการทํางานที่เหมาะสม ก่อนที่จะสร้างการเปิด"],automatic:["เมนูและปานิเทศรวมสถานะ และเครื่องประกอบการทํางานประจํา"]},

  "m3-buoc-00":{manual:["มี Google Sheets เปล้างด้วย ฟೈಲ್โค้ดทั้งหมด 3 รายการ, ปรุง OpenAI API และ หัวข้อเอกสารแหล่ง"],automatic:["ระบบสร้างกรอบสินค้าความรู้ เมนู การตั้งค่า และปานิชั่น"]},
  "m3-buoc-01":{manual:["จัดทําข้อมูลลูกค้าจริง และค้นหากลุ่มความต้องการของคุณเอง"],automatic:["AI แบ่งกลุ่มความต้องการ และบันทึกผลให้ผู้ขายตรวจสอบ"]},
  "m3-buoc-02":{manual:["เตรียมตัวประกอบการขายทดลอง ราคาคาด และหลักฐานการรับเงินจากลูกค้า"],automatic:["ระบบเก็บผลการทดลอง; การตัดสินใจต่อ หรือหยุดนั้นเป็นของผู้ขาย"]},
  "m3-buoc-03":{manual:["รวมข้อมูลที่มีแหล่งรวม ประสบการณ์ของผู้ขาย และผู้รับผิดชอบในการตรวจสอบความเชี่ยวชาญ"],automatic:["ระบบจะหลุดข้อมูลเข้าที่เก็บข้อมูล และเก็บข้อมูลที่ยังไม่ผ่านการตรวจสอบไว้"]},
  "m3-buoc-04":{manual:["การกําหนดผลการผลการซื้อของผู้ซื้อ และผลการผลิตเฉพาะของแต่ละโมเดล"],automatic:["AI เปลี่ยนแผนที่ความรู้ที่ผ่านมา เป็นโครงสร้างผลิตภัณฑ์"]},
  "m3-buoc-05":{manual:["คุณต้องมีทักษะในการแก้ไขและล็อคเวอร์ชั่นที่เหมาะสม ก่อนที่จะทําวีดีโอ"],automatic:["AI ทําแผนการเขียนและผลิตจากส่วนที่ได้รับการรับรอง"]},
  "m3-buoc-06":{manual:["เตรียมสอบถามและกลุ่มผู้ใช้ทดสอบที่เหมาะสม"],automatic:["ผู้ช่วยตอบตามแหล่งข้อมูล ระบบบันทึกผลการทดสอบให้คุณประเมิน"]},
  "m3-buoc-07":{manual:["ยืนยันการชําระเงินของผู้เข้าพัก อีเมล์รับเอกสาร และฉบับจะส่ง"],automatic:["ระบบสร้างรหัสแบบเดียว ให้สิทธิ์ทางอีเมลถูกต้อง และบันทึกวันที่ได้รับสิทธิ์"]},
  "m3-buoc-08":{manual:["อ่านความคิดเห็น และตัดสินใจเองว่ามีอะไรต้องปรับปรุง ความสําคัญ และวันออก"],automatic:["AI ประเภทตอบสนอง; ระบบบันทึกประวัติฉบับเพื่อติดตาม"]},

  "m4-buoc-00":{manual:["มี Google Sheets เปล้างตัว, มี 3 ไฟล์รหัสถูกชื่อ และมีบัญชีที่มีสิทธิ์ให้ Apps Script"],automatic:["ระบบสร้างเมนู 5 หน้า และโครงสร้างรายงานรายการ"]},
  "m4-buoc-01":{manual:["เติมอีเมลรับรายงาน KPI ระยะเวลารายงาน และค่าการตั้งตัวจริง"],automatic:["คอร์ดตรวจสอบการประกอบและใช้ระยะเวลาที่เลือกสําหรับการทํางานต่อไป"]},
  "m4-buoc-02":{manual:["จัดทําข้อมูลการขายตามวันละวัน ชื่อคอลัมน์ และประเภทข้อมูลที่ถูกต้อง"],automatic:["ระบบการบวกและการนับเลขสัปดาห์ คุณไม่ต้องใส่จํานวนรวม"]},
  "m4-buoc-03":{manual:["หากใช้ไฟล์นอก, เตรียม ID Google Sheets และให้สิทธิเข้า; และบันทึกกุญแจ OpenAI ใน Script Properties"],automatic:["ถ้าปล่อยให้ไฟล์ ID ออกไปว่าง ระบบจะอ่าน DU_LIEU_NGAY ในไฟล์ปัจจุบัน"]},
  "m4-buoc-04":{manual:["การจัดการข้อมูลที่ได้รับการแจ้งผิดพลาด ก่อนการคํานวณ"],automatic:["Apps Script ตรวจสอบข้อมูลและคํานวณตัวอัดได้ทั้งตัว"]},
  "m4-buoc-05":{manual:["ผู้บริหารต้องอ่านข้อความ, ตอบคําถามที่ขาด และตรวจสอบรายงาน"],automatic:["AI เขียนข้อความจากจํานวนที่คํานวณไว้เท่านั้น และนํามาใส่ประกาศในแถวรอรับ"]},
  "m4-buoc-06":{manual:["เพียงเปลี่ยนสถานะเป็น DA_DUYET_GUI หลังจากตรวจสอบผู้รับและเนื้อหา"],automatic:["ระบบส่งรายงานได้ตรวจสอบและทําการประกาศเพื่อป้องกันการส่งเชื้อ"]},
  "m4-buoc-07":{manual:["เลือกวัน เวลาทํางาน และเปลี่ยนระยะเวลาในการรายงาน TUAN_HIEN_TAI ก่อนเปิดกําหนดการ"],automatic:["เครื่องประกอบการทํางาน รอบรายงานตามกําหนดเวลา; ค่าตรวจสอบของผู้บริหารยังคงถูกเก็บไว้"]},

  "m5-buoc-01":{manual:["ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ ครับ"],automatic:["ระบบสร้าง 12 หน้า เมนู ต้นโฟลเดอร์ และเครื่องประกอบที่ต้องการ"]},
  "m5-buoc-02":{manual:["เตรียมข้อมูลความต้องการจริง หรือไฟล์ CSV และหลักฐานการซื้อในราคาที่คาด"],automatic:["AI รวมความต้องการที่เหมือนกันเป็นกลุ่ม เพื่อให้คุณใช้บริการ"]},
  "m5-buoc-03":{manual:["ตรวจสอบกลุ่มความต้องการ และยืนยันข้อมูลยังติด CAN_XAC_NHAN"],automatic:["ระบบสร้างรายการของสินค้าจากกลุ่มที่ผ่านการตรวจสอบ"]},
  "m5-buoc-04":{manual:["เตรียมรายละเอียดผู้จัดส่ง ผู้ติดต่อ และประเมินราคา"],automatic:["ระบบที่ใส่คําขอในจดหมาย เพื่อรับราคาและติดตามตอบสนอง"]},
  "m5-buoc-05":{manual:["มีตัวอย่างทางกายภาพ เพื่อตรวจสอบคุณภาพเอง การตรวจสอบตัวอย่าง และการปิดตัวอย่างมาตรฐาน"],automatic:["AI รองรับการตรวจสอบและสร้างตราสารขายจากฉบับที่ผ่านมา"]},
  "m5-buoc-06":{manual:["ค้นหาราคาจริง เลือกช่องทางขายแรก และเตรียมตัวอย่างให้ลอง"],automatic:["ระบบตรวจเชื้อไวรัสเดียว ขาดข้อมูล และมีขีดจํากัดอยู่ก่อนการออก"]},
  "m5-buoc-07":{manual:["ตรวจสอบอิเมล์ออมสิน มีความสามารถ และใบสมัครที่สมัคร"],automatic:["ระบบการเก็บตัวแบบเดียว ส่งครั้งเดียว และบันทึกสถานะการป้องกันการส่งเชื้อ"]},
  "m5-buoc-08":{manual:["การแก้ไขเองเรื่องความเสียหาย การขัดแย้ง การคืนเงินกู้หรือการก่อการร้าย"],automatic:["AI ประเภทเอกสารสนับสนุนและเขียนป้ายกํากับในระดับนโยบาย"]},
  "m5-buoc-09":{manual:["การกําหนดความปลอดภัย การใช้เวลาในการผลิต และความสามารถในการจัดส่งสินค้าต่อไป"],automatic:["ระบบติดตามการดํารงชีวิต และแจ้งเตือนเมื่อสัมผัสกับขอบเขต"]},
  "m5-buoc-10":{manual:["เตรียมรายงานเงินคืน ค่าจริง การยกเลิก และการคืนเงินจากผู้ร่วมงาน"],automatic:["ระบบคิดผลประโยชน์ การจัดการความแตกต่าง และการรวมการกําไร"]},

  "m6-buoc-01":{manual:["ราคา Google Sheets ว่างชื่อ HE_THONG_GIOI_THIEU_AI มีทั้งหมด ไฟล์โค้ดสามไฟล์รหัส, ปกรณ์ API และอีเมลที่ใช้งาน"],automatic:["ระบบสร้าง 5 หน้า เมนู ต้น Drive และตรวจสอบการเชื่อมต่อ API"]},
  "m6-buoc-02":{manual:["เตรียมรายงานผลิตภัณฑ์จากแหล่งที่เป็นทางการ และผู้รับผิดชอบการตรวจสอบ"],automatic:["AI ปรับปรุงข้อมูล; รายการไม่แน่นอนยังคงอยู่ใน CHO_DUYET"]},
  "m6-buoc-03":{manual:["จัดระเบียบโปรแกรมพันธมิตร การเชื่อมโยง ค่าประกัน และรหัสเชื่อมโยงที่เหมาะสมกับสินค้า"],automatic:["ระบบตรวจสอบรหัสเชื่อมโยงและเก็บข้อมูลคู่มือเพื่อการดําเนินการ, การควบคุม"]},
  "m6-buoc-04":{manual:["ติดตามคําถามที่ต้องการที่จะเก็บและทดสอบแบบด้วยการตอบแบบ"],automatic:["ระบบสร้างแบบฟอร์ม สร้างรหัสการ์ด และบันทึกรายงานใหม่ใน KHACH_HANG"]},
  "m6-buoc-05":{manual:["อ่านเหตุผล AI ตรวจสอบสินค้าที่เสนอและตรวจสอบการจัดการของลูกค้าด้วยตัวเอง"],automatic:["AI ประเภท MUC_1, MUC_2 หรือ MUC_3 และบันทึกข้อมูลที่ขาด"]},
  "m6-buoc-06":{manual:["ตรวจสอบสินค้าด้วยมือ ราคา จํากัด สัมพันธ์ และคลิกส่งเอง"],automatic:["AI สร้างข้อความติดตาม ระบบจําหน่ายส่งมาเพียงหลังจากที่คุณยืนยัน"]},
  "m6-buoc-07":{manual:["โหลดรายงานผู้ร่วมงาน และเตรียมหลักฐานจากเงินจริง"],automatic:["ระบบการคัดเลือกดอกเบี้ยที่คาดหมาย ได้รับการอนุมัติ และได้รับการรับรอง"]},
  "m6-buoc-08":{manual:["เลือกกําหนดการทํางาน ตรวจสอบเตือน และเก็บหลักฐานการแลกเปลี่ยนสําหรับการช้าหรือการไม่ติดตาม"],automatic:["ระบบทํางานเตือนประจําและรวมผลงานที่ต้องการในการจัดการบนแผ่นควบคุม"]}
};

function addDefaultPreparation(step:GuideStep):GuideStep{
  const preparation=defaultStepPreparation[step.id];
  return step.preparation===undefined&&preparation?{...step,preparation:{manual:[...preparation.manual],automatic:[...preparation.automatic]}}:step;
}

const codeFiles=[
  {n:"โค้ด 01",title:"ระบบที่ปรึกษา",where:"ลงในไฟล์ Code.gs ที่มีใน Apps Script",path:"/files/He-thong-tu-van.gs",download:"He-thong-tu-van.gs"},
  {n:"โค้ด 02",title:"ผิวหน้า Dashboard",where:"กรอกไฟล์ HTML ชื่อ Dashboard แล้วติดตั้ง",path:"/files/Dashboard.html",download:"Dashboard.html"},
  {n:"โค้ด 03",title:"การสอดคล้อง Dashboard",where:"สร้างไฟล์รหัสชื่อ WebApp แล้วติดตั้ง",path:"/files/Dieu-Phoi.gs",download:"Dieu-Phoi.gs"},
];
const codeFiles2=[
  {n:"โค้ด 01",title:"งานและเมนู",where:"สร้างไฟล์คําสั่งชื่อมังกร และติดตั้ง",path:"/files/model2/Ma.gs",download:"Ma.gs"},
  {n:"โค้ด 02",title:"คอร์ดควบคุม",where:"กรอกไฟล์ สร้างคําสั่งชื่อ_dieu_khien แล้วติดตั้ง",path:"/files/model2/bang_dieu_khien.gs",download:"bang_dieu_khien.gs"},
  {n:"โค้ด 03",title:"ผจญจาน",where:"กรอกไฟล์ HTML ชื่อรัฐ_dieu_khien แล้วติดตั้ง",path:"/files/model2/bang_dieu_khien.html",download:"bang_dieu_khien.html"},
];
const codeFiles3=[
  {n:"โค้ด 01",title:"งานหลักและเมนู",where:"ในไฟล์ Code.gs ที่มี ลบรหัสตัวอย่าง แล้วติดรหัส Ma.gs ทั้งหมด",path:"/files/model3/Ma.gs",download:"Ma.gs"},
  {n:"โค้ด 02",title:"คอร์ดควบคุม",where:"กรอกไฟล์ สร้างคําสั่งชื่อ_dieu_khien แล้วติดตั้ง",path:"/files/model3/bang_dieu_khien.gs",download:"bang_dieu_khien.gs"},
  {n:"โค้ด 03",title:"ผจญจาน",where:"สร้างไฟล์ HTML ชื่อที่เหมาะสม_dieu_khien ไม่ต้องเขียนตรา .html",path:"/files/model3/bang_dieu_khien.html",download:"bang_dieu_khien.html"},
];
const codeFiles4=[
  {n:"โค้ด 01",title:"งานรายงานรายการสัปดาห์และเมนู",where:"สร้างไฟล์คําสั่งชื่อมังกร และติดตั้ง",path:"/files/model4/Ma.gs",download:"Ma.gs"},
  {n:"โค้ด 02",title:"คอร์ดควบคุม",where:"กรอกไฟล์ สร้างคําสั่งชื่อ_dieu_khien แล้วติดตั้ง",path:"/files/model4/bang_dieu_khien.gs",download:"bang_dieu_khien.gs"},
  {n:"โค้ด 03",title:"ผจญจาน",where:"กรอกไฟล์ HTML ชื่อรัฐ_dieu_khien แล้วติดตั้ง",path:"/files/model4/bang_dieu_khien.html",download:"bang_dieu_khien.html"},
];
const codeFiles5=[
  {n:"โค้ด 01",title:"งาน, เมนู และเซอร์เวอร์ปานต์",where:"ในไฟล์ Code.gs ที่มี ลบรหัสตัวอย่าง แล้วติดรหัส Ma.gs ทั้งหมด",path:"/files/model5/Ma.gs",download:"Ma.gs"},
  {n:"โค้ด 02",title:"ผจญจาน",where:"สร้างไฟล์ HTML ชื่อ state_dieu_khien ไม่ติดตาม .html",path:"/files/model5/bang_dieu_khien.html",download:"bang_dieu_khien.html"},
];
const codeFiles6=[
  {n:"โค้ด 01",title:"การจัดทําเมนู และงานทั้งหมด",where:"ในไฟล์ Code.gs ที่มี ลบรหัสตัวอย่าง แล้วติดรหัส Ma.gs ทั้งหมด",path:"/files/model6/Ma.gs",download:"Ma.gs"},
  {n:"โค้ด 02",title:"คอร์ดควบคุม",where:"กรอกไฟล์คําสั่งชื่อ BangDieu คลิปและปุ่มรหัส",path:"/files/model6/BangDieuKhien.gs",download:"BangDieuKhien.gs"},
  {n:"โค้ด 03",title:"ผจญจาน",where:"สร้างไฟล์ HTML ชื่อที่เหมาะสม BangDieu ครับ ไม่ติดตาม .html",path:"/files/model6/BangDieuKhien.html",download:"BangDieuKhien.html"},
];

const models=[
  {id:"model-1",number:"01",title:"ธุรกิจความเชี่ยวชาญและบริการที่ปรึกษา",status:"พร้อมใช้งาน",description:"สร้างระบบให้คำปรึกษาด้านโภชนาการ 28 วัน ตั้งแต่พรอมต์และซอร์สโค้ด ไปจนถึงกระบวนการดำเนินงาน"},
  {id:"model-2",number:"02",title:"บริการวิดีโอสั้น 12 รายการต่อเดือน",status:"พร้อมใช้งาน",description:"ทำให้กระบวนการรับข้อมูล เก็บภาพ สร้างไอเดีย เขียนสคริปต์ วางแผนภาพ ตรวจสอบคุณภาพ ส่งมอบ และจัดประเภทข้อเสนอแนะเป็นระบบอัตโนมัติ"},
  {id:"model-3",number:"03",title:"ผลิตภัณฑ์ความรู้ที่ขายซ้ำได้",status:"พร้อมใช้งาน",description:"เปลี่ยนประสบการณ์และแบรนด์ส่วนบุคคลให้เป็นเอกสาร แบบฟอร์ม วิดีโอ และผู้ช่วย AI ที่จำหน่ายให้ลูกค้าหลายรายได้"},
  {id:"model-4",number:"04",title:"รายงานยอดขายรายสัปดาห์แบบมีการตรวจทาน",status:"พร้อมใช้งาน",description:"ตรวจสอบข้อมูล คำนวณตัวชี้วัด สร้างข้อเสนอแนะด้วย AI ตรวจทานเนื้อหา ส่งอีเมล และทำงานตามกำหนดเวลา"},
  {id:"model-5",number:"05",title:"บริหารอีคอมเมิร์ซด้วยเครือข่ายพาร์ตเนอร์",status:"พร้อมใช้งาน",description:"เจ้าของธุรกิจคนเดียวควบคุมสินค้า ข้อมูล เงิน และการตัดสินใจ ขณะที่ระบบประสานผู้จัดหา คลังสินค้า การจัดส่ง การสนับสนุน และการกระทบยอด"},
  {id:"model-6",number:"06",title:"สร้างระบบการขายและรับค่าคอมมิชชันด้วย AI",status:"พร้อมใช้งาน",description:"ไม่ต้องสร้างสินค้าเอง: ตรวจสอบแคตตาล็อก เก็บความต้องการ แนะนำสินค้าแบบมีการตรวจทาน กระทบยอดค่าคอมมิชชัน และบริหารความเสี่ยง"},
];

function viewFromPath(pathname:string){
  const match=pathname.match(/^\/model-([1-6])\/?$/);
  return match?`model-${match[1]}`:"home";
}

function pathFromView(view:string){
  const match=view.match(/^model-([1-6])$/);
  return match?`/model-${match[1]}`:"/";
}

function SiteNav({view,onSelect,isAdmin}:{view:string;onSelect:(id:string)=>void;isAdmin:boolean}){
  return <><header className="portal-header"><button className="logo logo-button" onClick={()=>onSelect("home")} aria-label="กลับสู่หน้าแรก WEUP SoloSix"><img className="weup-logo" src="/weup-logo.png" alt="WEUP"/></button><nav><button className={view==="home"?"nav-active":""} onClick={()=>onSelect("home")}>หน้าแรก</button><span className="portal-brand-title">WEUP SOLOSIX</span><div className="model-tabs">{models.map(m=><button className={view===m.id?"nav-active":""} onClick={()=>onSelect(m.id)} key={m.id}>โมเดล {Number(m.number)}</button>)}</div>{isAdmin&&<span className="admin-badge">● กำลังแก้ไขแบบเรียลไทม์</span>}</nav></header></>
}

function PortalHome({onSelect}:{onSelect:(id:string)=>void}){
  return <div className="portal-home"><section className="portal-hero"><div className="portal-kicker">WEUP SOLOSIX · คู่มือภาคปฏิบัติ</div><h1>สร้าง 6 โมเดลธุรกิจ<br/><b>ด้วยขั้นตอนที่ชัดเจน</b></h1><p>แต่ละโมเดลรวมเอกสาร เนื้อหาโดยละเอียด และภาพประกอบขั้นตอนไว้ในระบบคู่มือเดียว</p><button onClick={()=>onSelect("model-1")}>เริ่มต้นด้วยโมเดล 1 <span>→</span></button></section><section className="portal-intro"><div><span>วิธีใช้งาน</span><h2>โครงสร้างเดียวกัน<br/>สำหรับทุกโมเดล</h2></div><div className="structure-list"><article><b>01</b><div><h3>พรอมต์</h3><p>ดาวน์โหลดพรอมต์ฉบับเต็มเมื่อโมเดลมีเอกสารพรอมต์แนบมาด้วย</p></div></article><article><b>02</b><div><h3>ชุดโค้ดมาตรฐาน</h3><p>ดูตำแหน่งที่ต้องวางโค้ด จากนั้นคัดลอกหรือดาวน์โหลดไฟล์โค้ดที่ตั้งค่าไว้แล้ว</p></div></article><article><b>03</b><div><h3>ขั้นตอนการปฏิบัติ</h3><p>เนื้อหาโดยละเอียดอยู่คู่กับภาพที่ตรงกับแต่ละขั้นตอน</p></div></article><article><b>04</b><div><h3>ตรวจสอบผลลัพธ์</h3><p>ดูได้ว่าแต่ละขั้นตอนสร้างผลลัพธ์อะไร ต้องตรวจสอบอะไร และควรระวังเรื่องใด</p></div></article></div></section><section className="catalog"><div className="catalog-title"><span>สารบัญ</span><h2>หกโมเดล</h2><p>เลือกโมเดลเพื่อเปิดคู่มือ ขณะนี้ทั้งหกโมเดลมีหน้าคู่มือแยกเป็นของตนเองแล้ว</p></div><div className="model-grid">{models.map(m=><article className="available" key={m.id}><div className="model-card-top"><span>โมเดล {m.number}</span><em>{m.status}</em></div><h3>{m.title}</h3><p>{m.description}</p><button onClick={()=>onSelect(m.id)}>เปิดคู่มือ<span>→</span></button></article>)}</div></section><section className="usage-note"><span>วิธีอ่านคู่มือ</span><h2>ควรเริ่มจากตรงไหน?</h2><div><p><b>หากโมเดลมีพรอมต์และโค้ด:</b> ดาวน์โหลดพรอมต์ ใช้ชุดโค้ดมาตรฐาน และทำตามลำดับที่กำหนด</p><p><b>สำหรับทุกโมเดล:</b> อ่านเนื้อหาของแต่ละขั้นตอนให้ครบ ตรวจสอบภาพที่อยู่ด้านล่าง และคลิกภาพเมื่อต้องการดูรายละเอียดขนาดใหญ่</p></div></section></div>
}

function EmptyModel({model,onHome}:{model:typeof models[number];onHome:()=>void}){
  return <section className="empty-model"><div className="empty-number">{model.number}</div><span>โมเดล {model.number}</span><h1>{model.title}</h1><p>หน้านี้เตรียมไว้แล้ว เนื้อหาคู่มือและภาพขั้นตอนจะได้รับการอัปเดตเมื่อเอกสารของโมเดลเสร็จสมบูรณ์</p><div className="empty-outline"><b>โครงสร้างประกอบด้วย</b><ol><li>พรอมต์ของโมเดล</li><li>ชุดโค้ดที่ตั้งค่าไว้แล้ว</li><li>คู่มือทีละขั้นตอน</li><li>ภาพประกอบที่เกี่ยวข้อง</li></ol></div><button onClick={onHome}>← กลับสู่สารบัญ</button></section>
}

const defaultGuide:GuideStep[]=model1DetailedGuide.map(step=>({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:step.detailImages.map(group=>[...group]),
  calloutImages:[...step.calloutImages],
  preparation:step.preparation?{manual:[...step.preparation.manual],automatic:[...step.preparation.automatic]}:undefined,
}));
function upgradeGuide(saved:GuideStep[]){
  const isDetailedVersion=saved.some(s=>s.id==="m1-01-trung-tam-dieu-phoi")&&saved.some(s=>s.detailImages?.flat()?.includes("m1-ch3-065.png"));
  if(!isDetailedVersion)return defaultGuide;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

const defaultGuide2:GuideStep[]=steps2.map(step=>addDefaultPreparation({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:(step.detailImages??[]).map(group=>[...group]),
  calloutImages:[...(step.calloutImages??[])],
  defaultVideo:undefined,
  showVideo:false,
}));
function upgradeGuide2(saved:GuideStep[]){
  const isSourceVersion=saved.length===12&&saved.some(s=>s.id==="m2-buoc-01")&&saved.some(s=>s.detailImages?.flat()?.includes("m2-41.jpg"));
  if(!isSourceVersion)return defaultGuide2;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

const defaultGuide3:GuideStep[]=model3DetailedGuide.map(step=>({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:step.detailImages.map(group=>[...group]),
  calloutImages:[...step.calloutImages],
  preparation:step.preparation?{manual:[...step.preparation.manual],automatic:[...step.preparation.automatic]}:undefined,
}));
function upgradeGuide3(saved:GuideStep[]){
  const isDetailedVersion=saved.some(s=>s.id==="m3-01-tao-bang-tinh-trung-tam")&&saved.some(s=>s.detailImages?.flat()?.includes("m3-ch5-077.png"));
  if(!isDetailedVersion)return defaultGuide3;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

const defaultGuide4:GuideStep[]=model4DetailedGuide.map(step=>({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:step.detailImages.map(group=>[...group]),
  calloutImages:[...step.calloutImages],
  preparation:step.preparation?{manual:[...step.preparation.manual],automatic:[...step.preparation.automatic]}:undefined,
}));
function upgradeGuide4(saved:GuideStep[]){
  const isDetailedVersion=saved.some(s=>s.id==="m4-01-chon-cong-viec-lap-lai")&&saved.some(s=>s.detailImages?.flat()?.includes("m4-ch6-044.png"));
  if(!isDetailedVersion)return defaultGuide4;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

const defaultGuide5:GuideStep[]=model5DetailedGuide.map(step=>({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:step.detailImages.map(group=>[...group]),
  calloutImages:[...step.calloutImages],
  preparation:step.preparation?{manual:[...step.preparation.manual],automatic:[...step.preparation.automatic]}:undefined,
}));
function upgradeGuide5(saved:GuideStep[]){
  const isDetailedVersion=saved.some(s=>s.id==="m5-01-hieu-mo-hinh-doi-tac")&&saved.some(s=>s.detailImages?.flat()?.includes("m5-ch7-078.png"));
  if(!isDetailedVersion)return defaultGuide5;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

const defaultGuide6:GuideStep[]=model6DetailedGuide.map(step=>({
  ...step,
  details:[...step.details],
  callout:step.callout?{...step.callout}:undefined,
  detailImages:step.detailImages.map(group=>[...group]),
  calloutImages:[...step.calloutImages],
  preparation:step.preparation?{manual:[...step.preparation.manual],automatic:[...step.preparation.automatic]}:undefined,
}));
function upgradeGuide6(saved:GuideStep[]){
  const isDetailedVersion=saved.some(s=>s.id==="m6-01-tao-tep-trung-tam")&&saved.some(s=>s.detailImages?.flat()?.includes("m6-ch8-054.png"));
  if(!isDetailedVersion)return defaultGuide6;
  return saved.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));
}

function CodeCard({file}:{file:typeof codeFiles[number]}){const[code,setCode]=useState("กำลังโหลดโค้ด…"),[copied,setCopied]=useState(false);useEffect(()=>{fetch(file.path).then(r=>r.text()).then(setCode).catch(()=>setCode("ไม่สามารถโหลดโค้ดได้"))},[file.path]);async function copy(){await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1600)}return <article className="code-card"><div className="code-head"><div><span>{file.n}</span><h3>{file.title}</h3><p>{file.where}</p></div><div><button onClick={copy}>{copied?"✓ คัดลอกแล้ว":"คัดลอกโค้ด"}</button><a href={file.path} download={file.download}>ดาวน์โหลดไฟล์</a></div></div><pre><code>{code}</code></pre></article>}

type RedBox={x:number;y:number;width:number;height:number};

function ImageAnnotator({imageName,imageSrc,onClose,onSaved}:{imageName:string;imageSrc:string;onClose:()=>void;onSaved:()=>void}){
  const canvasRef=useRef<HTMLCanvasElement>(null),imageRef=useRef<HTMLImageElement|null>(null);
  const[boxes,setBoxes]=useState<RedBox[]>([]),[draft,setDraft]=useState<RedBox|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
  function draw(boxList=boxes,current=draft){const canvas=canvasRef.current,img=imageRef.current;if(!canvas||!img)return;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);ctx.strokeStyle="#e00000";ctx.lineWidth=Math.max(5,Math.round(canvas.width/320));ctx.lineJoin="round";[...boxList,...(current?[current]:[])].forEach(box=>ctx.strokeRect(box.x,box.y,box.width,box.height))}
  useEffect(()=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>{imageRef.current=img;const canvas=canvasRef.current;if(!canvas)return;canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;setLoading(false);requestAnimationFrame(()=>draw([],null))};img.onerror=()=>{setError("ไม่สามารถเปิดภาพนี้เพื่อแก้ไขได้");setLoading(false)};img.src=imageSrc;return()=>{img.onload=null;img.onerror=null}},[imageSrc]);
  useEffect(()=>{if(!loading)draw()},[boxes,draft,loading]);
  function point(e:ReactPointerEvent<HTMLCanvasElement>){const canvas=e.currentTarget,rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height}}
  function start(e:ReactPointerEvent<HTMLCanvasElement>){if(loading||saving)return;e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);setDraft({x:p.x,y:p.y,width:0,height:0})}
  function move(e:ReactPointerEvent<HTMLCanvasElement>){if(!draft)return;const p=point(e);setDraft({...draft,width:p.x-draft.x,height:p.y-draft.y})}
  function finish(e:ReactPointerEvent<HTMLCanvasElement>){if(!draft)return;e.currentTarget.releasePointerCapture(e.pointerId);if(Math.abs(draft.width)>8&&Math.abs(draft.height)>8)setBoxes(current=>[...current,draft]);setDraft(null)}
  async function save(){const canvas=canvasRef.current;if(!canvas||!boxes.length)return;setSaving(true);setError("");try{draw(boxes,null);const preferred=/\.jpe?g$/i.test(imageName)?"image/jpeg":"image/png";const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,preferred,preferred==="image/jpeg"?0.94:undefined));if(!blob)throw new Error("ไม่สามารถถ่ายภาพได้หลังจากการปิด");if(blob.size>8*1024*1024)throw new Error("รูปหลังขนาดใหญ่กว่า 8 หมื่นล้าน");await uploadToBlob(`guide-images/${imageName}`,blob,{access:"private",handleUploadUrl:"/api/blob-upload",contentType:preferred});onSaved();onClose()}catch(reason){setError(reason instanceof Error?reason.message:"ไม่สามารถเก็บภาพได้")}finally{setSaving(false)}}
  return <div className="annotator-backdrop" role="dialog" aria-modal="true" aria-label="ทำกรอบสีแดงบนภาพ"><div className="annotator-panel"><div className="annotator-head"><div><b>ทำกรอบสีแดงบนภาพ</b><span>ลากเมาส์หรือนิ้วเพื่อสร้างกรอบสี่เหลี่ยมสีแดง</span></div><button type="button" onClick={onClose} aria-label="ปิด">×</button></div><div className="annotator-stage">{loading&&<div className="annotator-loading">กำลังเปิดภาพ…</div>}<canvas ref={canvasRef} className={loading?"is-loading":""} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>setDraft(null)}/></div>{error&&<div className="annotator-error">{error}</div>}<div className="annotator-footer"><button type="button" className="secondary" onClick={()=>setBoxes(current=>current.slice(0,-1))} disabled={!boxes.length||saving}>↶ ย้อนกลับ</button><span>{boxes.length?`สร้างแล้ว ${boxes.length} กรอบสีแดง.`:"ดึงตรงไปบนรูป เพื่อให้เห็นว่ามีพื้นที่ที่ต้องการความสนใจ"}</span><div><button type="button" className="secondary" onClick={onClose} disabled={saving}>ยกเลิก</button><button type="button" className="save-annotation" onClick={save} disabled={!boxes.length||saving}>{saving?"กำลังบันทึก…":"บันทึกภาพ"}</button></div></div></div></div>
}

function StepCard({step,index,total,isAdmin,onChange,onMove,onDelete}:{step:GuideStep;index:number;total:number;isAdmin:boolean;onChange:(step:GuideStep)=>void;onMove:(direction:-1|1)=>void;onDelete:()=>void}){
  const[done,setDone]=useState(false),[photo,setPhoto]=useState<string|null>(null),[annotationTarget,setAnnotationTarget]=useState<string|null>(null),[versions,setVersions]=useState<Record<string,number>>({}),[uploading,setUploading]=useState<string|null>(null),[notice,setNotice]=useState("");
  useEffect(()=>setDone(localStorage.getItem(`done-${step.id}`)==="1"),[step.id]);
  function toggle(){const next=!done;setDone(next);localStorage.setItem(`done-${step.id}`,next?"1":"0")}
  const imageUrl=(name:string)=>`/api/images/${encodeURIComponent(name)}?v=${versions[name]||0}`;
  async function uploadImage(group:"detail"|"callout",detailIndex:number,imageIndex:number|null,e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const ext=(file.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"").toLowerCase();const name=imageIndex===null?`custom-${step.id}-${Date.now()}.${ext}`:(group==="callout"?step.calloutImages[imageIndex]:step.detailImages[detailIndex][imageIndex]);setUploading(name);setNotice("");try{await uploadToBlob(`guide-images/${name}`,file,{access:"private",handleUploadUrl:"/api/blob-upload",contentType:file.type});if(imageIndex===null){if(group==="callout")onChange({...step,calloutImages:[...step.calloutImages,name]});else{const groups=step.detailImages.map(g=>[...g]);groups[detailIndex]=[...(groups[detailIndex]||[]),name];onChange({...step,detailImages:groups})}}setVersions(v=>({...v,[name]:Date.now()}));setNotice("ปรับปรุงรูป คลิก Save และ Update เพื่อให้ลูกค้าเห็นรูปแบบใหม่")}catch(error){setNotice(error instanceof Error?error.message:"ไม่สามารถบรรทุกได้")}finally{setUploading(null);e.target.value=""}}
  function removeImage(group:"detail"|"callout",detailIndex:number,imageIndex:number){if(group==="callout")onChange({...step,calloutImages:step.calloutImages.filter((_,i)=>i!==imageIndex)});else{const groups=step.detailImages.map(g=>[...g]);groups[detailIndex]=(groups[detailIndex]||[]).filter((_,i)=>i!==imageIndex);onChange({...step,detailImages:groups})}}
  function images(group:"detail"|"callout",detailIndex:number,list:string[],label:string){return <div className="paired-images">{list.map((img,i)=><div className="image-card" key={img}><button className="image-open" onClick={()=>setPhoto(imageUrl(img))}><img src={imageUrl(img)} alt={`${label} – ภาพ ${i+1}`} loading={index<2?"eager":"lazy"}/><span>ภาพประกอบ {i+1} · คลิกเพื่อดูใหญ่</span></button>{isAdmin&&<div className="image-admin-actions"><button className="annotate-image" onClick={()=>setAnnotationTarget(img)}>▣ ทำกรอบสีแดง</button><label className="replace-image">{uploading===img?"กำลังอัปโหลด…":"↻ เปลี่ยนภาพ"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading===img} onChange={e=>uploadImage(group,detailIndex,i,e)}/></label><button onClick={()=>removeImage(group,detailIndex,i)}>นำภาพออก</button></div>}</div>)}{isAdmin&&<label className="add-image">＋ เพิ่มภาพสำหรับเนื้อหานี้<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>uploadImage(group,detailIndex,null,e)}/></label>}</div>}
  function updateDetail(i:number,value:string){const details=[...step.details];details[i]=value;onChange({...step,details})}
  function addDetail(){onChange({...step,details:[...step.details,"กรอกเนื้อหาขั้นตอนใหม่"],detailImages:[...step.detailImages,[]]})}
  function deleteDetail(i:number){if(!confirm("ลบคำแนะนำข้อนี้หรือไม่?"))return;onChange({...step,details:step.details.filter((_,x)=>x!==i),detailImages:step.detailImages.filter((_,x)=>x!==i)})}
  function updatePreparation(kind:keyof StepPreparation,value:string){
    const current=step.preparation||{manual:[],automatic:[]};
    onChange({...step,preparation:{...current,[kind]:value.split("\n").map(line=>line.trim()).filter(Boolean)}});
  }
  const hasPreparation=Boolean(step.preparation&&(step.preparation.manual.length||step.preparation.automatic.length));
  return <><article className={`step paired-step ${done?"done":""}`} id={step.id}><div className="step-head"><div className="number">{String(index+1).padStart(2,"0")}</div><div><span>ขั้นตอน {index+1} / {total}</span>{isAdmin?<input className="admin-title-input" value={step.title} onChange={e=>onChange({...step,title:e.target.value})}/>:<h2>{step.title}</h2>}</div>{isAdmin?<div className="step-admin-actions"><button onClick={()=>onMove(-1)} disabled={index===0}>↑ ขึ้น</button><button onClick={()=>onMove(1)} disabled={index===total-1}>↓ ลง</button><button className="danger" onClick={onDelete}>ลบขั้นตอน</button></div>:<button onClick={toggle}>{done?"✓ เสร็จแล้ว":"ทำเครื่องหมายว่าเสร็จแล้ว"}</button>}</div>{(hasPreparation||isAdmin)&&(step.preparation?<div className={`step-preparation ${isAdmin?"is-editing":""}`}><section className="prepare-manual"><div className="prepare-label"><span>✓</span><b>สิ่งที่คุณต้องเตรียมล่วงหน้า</b></div>{isAdmin?<textarea aria-label="เนื้อหาที่ต้องเตรียมไว้ก่อน" value={step.preparation.manual.join("\n")} placeholder="หนึ่งรายการต่อหนึ่งบรรทัด" onChange={e=>updatePreparation("manual",e.target.value)}/>:<ul>{step.preparation.manual.map((item,i)=><li key={i}>{item}</li>)}</ul>}</section><section className="prepare-automatic"><div className="prepare-label"><span>↻</span><b>สิ่งที่ระบบดำเนินการอัตโนมัติ</b></div>{isAdmin?<textarea aria-label="รายการระบบอัตโนมัติ" value={step.preparation.automatic.join("\n")} placeholder="หนึ่งรายการต่อหนึ่งบรรทัด" onChange={e=>updatePreparation("automatic",e.target.value)}/>:<ul>{step.preparation.automatic.map((item,i)=><li key={i}>{item}</li>)}</ul>}</section>{isAdmin&&<button className="remove-preparation" onClick={()=>onChange({...step,preparation:undefined})}>ลบกรอบการเตรียม</button>}</div>:<button className="add-preparation" onClick={()=>onChange({...step,preparation:{manual:["ใส่สิ่งที่ผู้ใช้ต้องการเตรียมตัว"],automatic:["ลงระบบประกอบอัตโนมัติ"]}})}>＋ เพิ่มหมายเหตุการเตรียม</button>)}{notice&&<div className="upload-notice paired-notice">{notice}</div>}<div className="paired-flow">{step.callout&&<section className="paired-unit callout-unit"><div className="book-callout">{isAdmin?<><input value={step.callout.title} onChange={e=>onChange({...step,callout:{...step.callout!,title:e.target.value}})}/><textarea value={step.callout.text} onChange={e=>onChange({...step,callout:{...step.callout!,text:e.target.value}})}/><button className="inline-delete" onClick={()=>onChange({...step,callout:undefined,calloutImages:[]})}>ลบกรอบหมายเหตุ</button></>:<><b>{step.callout.title}</b><p>{step.callout.text}</p></>}</div>{images("callout",-1,step.calloutImages,step.callout.title)}</section>}{isAdmin&&!step.callout&&<button className="add-callout" onClick={()=>onChange({...step,callout:{title:"หัวข้อหมายเหตุ",text:"กรอกเนื้อหาหมายเหตุ"}})}>＋ เพิ่มกรอบหมายเหตุ</button>}{step.details.map((text,i)=><section className="paired-unit" key={i}><div className="book-action"><span>{i+1}</span>{isAdmin?<div className="admin-detail"><textarea value={text} onChange={e=>updateDetail(i,e.target.value)}/><button onClick={()=>deleteDetail(i)}>ลบรายการนี้</button></div>:<p>{text}</p>}</div>{images("detail",i,step.detailImages[i]||[],`ขั้นตอน ${i+1}`)}</section>)}{isAdmin&&<button className="add-detail" onClick={addDetail}>＋ เพิ่มคำแนะนำในขั้นตอนนี้</button>}</div></article>{photo&&<div className="lightbox" onClick={()=>setPhoto(null)}><button>×</button><img src={photo} alt={step.title}/></div>}{annotationTarget&&<ImageAnnotator imageName={annotationTarget} imageSrc={imageUrl(annotationTarget)} onClose={()=>setAnnotationTarget(null)} onSaved={()=>{setVersions(v=>({...v,[annotationTarget]:Date.now()}));setNotice("มีภาพที่เก็บไว้ในกรอบแดง ลูกค้ากําลังดูภาพล่าสุด")}}/>}</>;
}

function ModelGuidePage({modelNumber,prompt,docPath,files=[],guide,savedGuide,isAdmin,saving,saveNotice,onSetGuide,onSave}:{modelNumber:1|2|3|4|5|6;prompt?:string;docPath?:string;files?:typeof codeFiles;guide:GuideStep[];savedGuide:GuideStep[];isAdmin:boolean;saving:boolean;saveNotice:string;onSetGuide:(value:GuideStep[]|((current:GuideStep[])=>GuideStep[]))=>void;onSave:()=>void}){
  const dirty=JSON.stringify(guide)!==JSON.stringify(savedGuide);
  const hasAssets=Boolean(prompt&&docPath&&files.length);
  const modelDescription=modelNumber===1?"ระบบให้คำปรึกษาด้านโภชนาการ 28 วัน":modelNumber===2?"ระบบบริการวิดีโอสั้น 12 รายการต่อเดือนจากชุดภาพที่ลูกค้าจัดเตรียม":modelNumber===3?"ระบบเปลี่ยนประสบการณ์และแบรนด์ส่วนบุคคลให้เป็นผลิตภัณฑ์ความรู้ที่ขายซ้ำได้":modelNumber===4?"ระบบรายงานยอดขายรายสัปดาห์: โค้ดคำนวณข้อมูล AI เขียนฉบับร่าง และผู้จัดการตรวจทานก่อนส่ง":modelNumber===5?"ระบบบริหารอีคอมเมิร์ซสำหรับเจ้าของคนเดียว: ตรวจสอบความต้องการ พัฒนาสินค้า ประสานพาร์ตเนอร์ จัดการคำสั่งซื้อ สต็อก การสนับสนุน และการกระทบยอด":"ระบบแนะนำสินค้าและรับค่าคอมมิชชัน: ตรวจสอบแคตตาล็อก จัดประเภทความต้องการ สร้างอีเมลฉบับร่างแบบมีการตรวจทาน กระทบยอดเงิน และแจ้งเตือนความเสี่ยง";
  function changeStep(i:number,next:GuideStep){onSetGuide(g=>g.map((s,x)=>x===i?next:s))}
  function moveStep(i:number,d:-1|1){onSetGuide(g=>{const next=[...g],to=i+d;if(to<0||to>=next.length)return g;[next[i],next[to]]=[next[to],next[i]];return next})}
  function deleteStep(i:number){if(confirm("คุณต้องการลบขั้นตอนทั้งหมดนี้จากหนังสือเล่มนี้ได้หรือไม่"))onSetGuide(g=>g.filter((_,x)=>x!==i))}
  function addStep(){const id=`m${modelNumber}-buoc-moi-${Date.now()}`;onSetGuide(g=>[...g,{id,n:String(g.length+1).padStart(2,"0"),title:"ขั้นตอนการแนะนําใหม่",details:["ใส่ข้อมูลการทํางาน"],detailImages:[[]],calloutImages:[]}]);setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}),100)}
  const fileCountText=files.length===2?"ไฟล์โค้ดสองไฟล์":files.length===3?"ไฟล์โค้ดสามไฟล์":`${files.length} ไฟล์โค้ด`;
  const detailedHero=modelNumber===1?"ส่วนขั้นตอนประกอบด้วย 19 ช่วงโดยละเอียดและภาพคู่มือ 65 ภาพจากบทที่ 3":modelNumber===2?"ส่วนขั้นตอนประกอบด้วย 12 ช่วงและภาพคู่มือ 40 ภาพที่ซิงก์จากหน้าโมเดล 2 ต้นฉบับ":modelNumber===3?"ส่วนขั้นตอนประกอบด้วย 19 ช่วงโดยละเอียดและภาพคู่มือ 77 ภาพจากบทที่ 5":modelNumber===4?"ส่วนขั้นตอนประกอบด้วย 21 ช่วงโดยละเอียดและภาพคู่มือ 44 ภาพจากบทที่ 6":modelNumber===5?"ส่วนขั้นตอนประกอบด้วย 22 ช่วงโดยละเอียดและภาพคู่มือ 78 ภาพจากบทที่ 7":"ส่วนขั้นตอนประกอบด้วย 20 ช่วงโดยละเอียดและภาพคู่มือ 54 ภาพจากบทที่ 8";
  const detailedSteps=modelNumber===1?"เนื้อหาแบ่งเป็น 19 ช่วงตามบทที่ 3 ภาพคู่มือทั้ง 65 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้องและคลิกเพื่อดูขนาดใหญ่ได้ โดยไม่ต้องพึ่งวิดีโอตัดย่อย":modelNumber===2?"เนื้อหาแบ่งเป็น 12 ขั้นตอนตามลำดับของหน้าโมเดล 2 ต้นฉบับ ภาพคู่มือทั้ง 40 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้อง คลิกดูขนาดใหญ่ได้ และไม่ต้องพึ่งวิดีโอ":modelNumber===3?"เนื้อหาแบ่งเป็น 19 ช่วงตามบทที่ 5 ภาพคู่มือทั้ง 77 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้องและคลิกเพื่อดูขนาดใหญ่ได้ โดยไม่ต้องพึ่งวิดีโอตัดย่อย":modelNumber===4?"เนื้อหาแบ่งเป็น 21 ช่วงตามบทที่ 6 ภาพคู่มือทั้ง 44 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้องและคลิกดูขนาดใหญ่ได้ ภาพที่มีคีย์ API ถูกปิดบังเพื่อปกป้องข้อมูลการเข้าถึง":modelNumber===5?"เนื้อหาแบ่งเป็น 22 ช่วงตามบทที่ 7 ภาพประกอบและภาพคู่มือทั้ง 78 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้องและคลิกดูขนาดใหญ่ได้ ภาพสองภาพที่มีคีย์ API ถูกปิดบังก่อนเผยแพร่":"เนื้อหาแบ่งเป็น 20 ช่วงตามบทที่ 8 ภาพคู่มือทั้ง 54 ภาพวางไว้หลังขั้นตอนที่เกี่ยวข้องและคลิกดูขนาดใหญ่ได้ ภาพที่มีคีย์ API ถูกปิดบังและขั้นตอนไม่ต้องพึ่งวิดีโออีกต่อไป";
  return <>{isAdmin&&<div className="admin-savebar"><div><b>โหมดจัดการเนื้อหา · โมเดล {modelNumber}</b><span>{dirty?"มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก":"บันทึกการเปลี่ยนแปลงทั้งหมดแล้ว"}</span></div><div><button className="discard" disabled={!dirty||saving} onClick={()=>onSetGuide(savedGuide)}>ยกเลิกการเปลี่ยนแปลง</button><button disabled={!dirty||saving} onClick={onSave}>{saving?"กำลังบันทึก…":"บันทึกและอัปเดตสำหรับผู้ใช้"}</button></div>{saveNotice&&<small>{saveNotice}</small>}</div>}<div className="model-subnav">{hasAssets&&<><a href={`#prompt-${modelNumber}`}>พรอมต์</a><a href={`#codes-${modelNumber}`}>ชุดโค้ด</a></>}<a href={`#steps-${modelNumber}`}>ขั้นตอน</a></div><section className="hero" id={`top-${modelNumber}`}><div><span>โมเดล {modelNumber} · คู่มือฉบับสมบูรณ์</span><h1>{hasAssets?<>จากพรอมต์และโค้ด<br/><b>สู่ทุกขั้นตอนการปฏิบัติ</b></>:<>เปลี่ยนความรู้เป็นผลิตภัณฑ์<br/><b>ขายหลายครั้ง</b></>}</h1><p>{modelDescription} {detailedHero||(hasAssets?`พรอมต์, ${files.length===2?"สอง":"สาม"} ไฟล์โค้ด และภาพคู่มือถูกรวมไว้ในหน้าเดียวกัน`:"การนํามาใช้งานนั้นถูกเขียนตามหนังสือ และนํารูปภาพของการปฏิบัติงานต่างๆ มาเป็นที่แม่นยํา")}</p><div className="hero-actions">{hasAssets&&<a href={`#prompt-${modelNumber}`}>เริ่มจากพรอมต์</a>}<a className={hasAssets?"ghost":""} href={`#steps-${modelNumber}`}>ดูขั้นตอน</a></div></div><aside>{hasAssets&&<><div className="flow active"><span>01</span><p><b>พรอมต์</b>ดาวน์โหลดเป็นไฟล์ DOCX</p></div><div className="flow"><span>02</span><p><b>{fileCountText}</b>ดู คัดลอก หรือดาวน์โหลด</p></div></>}<div className="flow active"><span>{hasAssets?"03":"01"}</span><p><b>ขั้นตอนฉบับเต็ม</b>ข้อมูลรายละเอียดที่ตรงกับภาพที่นํามา</p></div></aside></section>{hasAssets&&<><section className="content-section prompt-section" id={`prompt-${modelNumber}`}><div className="section-title"><span>ส่วนที่ 01</span><h2>พรอมต์สำหรับสร้างระบบ</h2><p>คุณสามารถดาวน์โหลดพรอมต์เป็นไฟล์ DOCX และปรับให้ตรงกับความต้องการ {fileCountText} ในส่วนถัดไปคือเวอร์ชันที่ตั้งค่าและแก้ไขไว้แล้ว</p></div><div className="prompt-box"><div className="prompt-actions"><a href={docPath} download>ดาวน์โหลดพรอมต์ DOCX</a></div><pre>{prompt}</pre></div></section><section className="content-section" id={`codes-${modelNumber}`}><div className="section-title"><span>ส่วนที่ 02</span><h2>{fileCountText} ที่ตั้งค่าไว้แล้ว</h2><p>โค้ดแต่ละชุดอยู่ในกรอบเลื่อน โปรดดูหัวข้อ ‘วางโค้ดที่ไหน’ จากนั้นคัดลอกหรือดาวน์โหลดไฟล์</p></div><div className="code-list">{files.map(f=><CodeCard file={f} key={f.path}/>)}</div></section></>}<section className="content-section" id={`steps-${modelNumber}`}><div className="section-title"><span>{hasAssets?"ส่วนที่ 03":"คู่มือขั้นตอน"}</span><h2>วิธีดำเนินการทีละขั้นตอน</h2><p>{detailedSteps||"คำแนะนำแต่ละข้ออยู่คู่กับภาพขั้นตอนที่จำเป็น คลิกภาพเพื่อดูรายละเอียดในขนาดใหญ่"}</p></div><div className="steps">{guide.map((s,i)=><StepCard step={s} index={i} total={guide.length} isAdmin={isAdmin} onChange={x=>changeStep(i,x)} onMove={d=>moveStep(i,d)} onDelete={()=>deleteStep(i)} key={s.id}/>)}</div>{isAdmin&&<button className="add-step" onClick={addStep}>＋ เพิ่มขั้นตอนใหม่</button>}</section></>;
}

export default function Home(){
  const pathname=usePathname(),router=useRouter(),isAdmin=pathname==="/admin";
  const[view,setView]=useState(()=>viewFromPath(pathname)),[guide,setGuide]=useState<GuideStep[]>(defaultGuide),[savedGuide,setSavedGuide]=useState<GuideStep[]>(defaultGuide),[guide2,setGuide2]=useState<GuideStep[]>(defaultGuide2),[savedGuide2,setSavedGuide2]=useState<GuideStep[]>(defaultGuide2),[guide3,setGuide3]=useState<GuideStep[]>(defaultGuide3),[savedGuide3,setSavedGuide3]=useState<GuideStep[]>(defaultGuide3),[guide4,setGuide4]=useState<GuideStep[]>(defaultGuide4),[savedGuide4,setSavedGuide4]=useState<GuideStep[]>(defaultGuide4),[guide5,setGuide5]=useState<GuideStep[]>(defaultGuide5),[savedGuide5,setSavedGuide5]=useState<GuideStep[]>(defaultGuide5),[guide6,setGuide6]=useState<GuideStep[]>(defaultGuide6),[savedGuide6,setSavedGuide6]=useState<GuideStep[]>(defaultGuide6),[saving,setSaving]=useState(false),[saving2,setSaving2]=useState(false),[saving3,setSaving3]=useState(false),[saving4,setSaving4]=useState(false),[saving5,setSaving5]=useState(false),[saving6,setSaving6]=useState(false),[saveNotice,setSaveNotice]=useState(""),[saveNotice2,setSaveNotice2]=useState(""),[saveNotice3,setSaveNotice3]=useState(""),[saveNotice4,setSaveNotice4]=useState(""),[saveNotice5,setSaveNotice5]=useState(""),[saveNotice6,setSaveNotice6]=useState("");
  useEffect(()=>{if(!isAdmin)setView(viewFromPath(pathname))},[isAdmin,pathname]);
  useEffect(()=>{Promise.all([fetch("/api/guide?model=1").then(r=>r.json()),fetch("/api/guide?model=2").then(r=>r.json()),fetch("/api/guide?model=3").then(r=>r.json()),fetch("/api/guide?model=4").then(r=>r.json()),fetch("/api/guide?model=5").then(r=>r.json()),fetch("/api/guide?model=6").then(r=>r.json())]).then(([g1,g2,g3,g4,g5,g6])=>{if(Array.isArray(g1.guide)){const upgraded=upgradeGuide(g1.guide);setGuide(upgraded);setSavedGuide(upgraded)}if(Array.isArray(g2.guide)){const upgraded=upgradeGuide2(g2.guide);setGuide2(upgraded);setSavedGuide2(upgraded)}if(Array.isArray(g3.guide)){const upgraded=upgradeGuide3(g3.guide);setGuide3(upgraded);setSavedGuide3(upgraded)}if(Array.isArray(g4.guide)){const upgraded=upgradeGuide4(g4.guide);setGuide4(upgraded);setSavedGuide4(upgraded)}if(Array.isArray(g5.guide)){const upgraded=upgradeGuide5(g5.guide);setGuide5(upgraded);setSavedGuide5(upgraded)}if(Array.isArray(g6.guide)){const upgraded=upgradeGuide6(g6.guide);setGuide6(upgraded);setSavedGuide6(upgraded)}}).catch(()=>{})},[]);
  async function save(model:1|2|3|4|5|6){const current=model===1?guide:model===2?guide2:model===3?guide3:model===4?guide4:model===5?guide5:guide6,setCurrent=model===1?setGuide:model===2?setGuide2:model===3?setGuide3:model===4?setGuide4:model===5?setGuide5:setGuide6,setSaved=model===1?setSavedGuide:model===2?setSavedGuide2:model===3?setSavedGuide3:model===4?setSavedGuide4:model===5?setSavedGuide5:setSavedGuide6,setBusy=model===1?setSaving:model===2?setSaving2:model===3?setSaving3:model===4?setSaving4:model===5?setSaving5:setSaving6,setNotice=model===1?setSaveNotice:model===2?setSaveNotice2:model===3?setSaveNotice3:model===4?setSaveNotice4:model===5?setSaveNotice5:setSaveNotice6;setBusy(true);setNotice("");try{const normalized=current.map((s,i)=>({...s,n:String(i+1).padStart(2,"0")}));const r=await fetch(`/api/guide?model=${model}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({guide:normalized})});const d=await r.json();if(!r.ok)throw new Error(d.error||"ไม่สามารถบันทึกคู่มือได้");setCurrent(normalized);setSaved(normalized);setNotice("บันทึกแล้ว ผู้ใช้กำลังดูเวอร์ชันสมบูรณ์ล่าสุด")}catch(error){setNotice(error instanceof Error?error.message:"ไม่สามารถบันทึกคู่มือได้")}finally{setBusy(false)}}
  const chooseView=(id:string)=>{if(isAdmin){setView(id);window.scrollTo({top:0,behavior:"smooth"});return}router.push(pathFromView(id))};
  const currentModel=models.find(m=>m.id===view);
  return <main><SiteNav view={view} onSelect={chooseView} isAdmin={isAdmin}/>{view==="home"&&<PortalHome onSelect={chooseView}/>} {view==="model-1"&&<ModelGuidePage modelNumber={1} prompt={promptText} docPath="/files/Cau-lenh-Mo-hinh-1.docx" files={codeFiles} guide={guide} savedGuide={savedGuide} isAdmin={isAdmin} saving={saving} saveNotice={saveNotice} onSetGuide={setGuide} onSave={()=>save(1)}/>} {view==="model-2"&&<ModelGuidePage modelNumber={2} prompt={promptText2} docPath="/files/model2/Cau-lenh-Mo-hinh-2.docx" files={codeFiles2} guide={guide2} savedGuide={savedGuide2} isAdmin={isAdmin} saving={saving2} saveNotice={saveNotice2} onSetGuide={setGuide2} onSave={()=>save(2)}/>} {view==="model-3"&&<ModelGuidePage modelNumber={3} prompt={promptText3} docPath="/files/model3/Cau-lenh-Mo-hinh-3.docx" files={codeFiles3} guide={guide3} savedGuide={savedGuide3} isAdmin={isAdmin} saving={saving3} saveNotice={saveNotice3} onSetGuide={setGuide3} onSave={()=>save(3)}/>} {view==="model-4"&&<ModelGuidePage modelNumber={4} prompt={promptText4} docPath="/files/model4/Cau-lenh-Mo-hinh-4.docx" files={codeFiles4} guide={guide4} savedGuide={savedGuide4} isAdmin={isAdmin} saving={saving4} saveNotice={saveNotice4} onSetGuide={setGuide4} onSave={()=>save(4)}/>} {view==="model-5"&&<ModelGuidePage modelNumber={5} prompt={promptText5} docPath="/files/model5/Cau-lenh-Mo-hinh-5.docx" files={codeFiles5} guide={guide5} savedGuide={savedGuide5} isAdmin={isAdmin} saving={saving5} saveNotice={saveNotice5} onSetGuide={setGuide5} onSave={()=>save(5)}/>} {view==="model-6"&&<ModelGuidePage modelNumber={6} prompt={promptText6} docPath="/files/model6/Cau-lenh-Mo-hinh-6.docx" files={codeFiles6} guide={guide6} savedGuide={savedGuide6} isAdmin={isAdmin} saving={saving6} saveNotice={saveNotice6} onSetGuide={setGuide6} onSave={()=>save(6)}/>} {currentModel&&!["model-1","model-2","model-3","model-4","model-5","model-6"].includes(view)&&<EmptyModel model={currentModel} onHome={()=>chooseView("home")}/>}<footer><div><b>WEUP SoloSix</b><span>คู่มือ 6 โมเดลธุรกิจ · พรอมต์ · ซอร์สโค้ด · ขั้นตอน · รูปภาพ</span></div><button onClick={()=>chooseView("home")}>กลับสู่สารบัญ ↑</button></footer></main>;
}
