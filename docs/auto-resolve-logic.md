# Auto-resolve Logic (Migration Wins)

เอกสารนี้อธิบายกลไกการทำงานเบื้องหลังของฟีเจอร์ **Auto-resolve (Migration Wins)** ใน Commit Migration Tool

## ทำไมถึงต้องมี Auto-resolve?

ในขั้นตอน **Pre-Merge Simulation** ระบบจะพยายามจำลองการ Merge โค้ดจาก Migration Branch (ที่สร้างขึ้นมาใหม่และรีเซ็ตค่าเป็น Commit ที่ต้องการ) กลับเข้าไปยัง Target Branch (ผ่าน Sandbox branch) เพื่อตรวจสอบว่าโค้ดสามารถเข้ากันได้และผ่าน CI หรือไม่ 

หากเกิด **Merge Conflict** แปลว่ามีโค้ดใน Target Branch บางส่วนขัดแย้งกับ Migration Branch 
ฟีเจอร์ Auto-resolve จึงถูกสร้างขึ้นมาเพื่อให้ระบบพยายามแก้ Conflict นี้ให้โดยอัตโนมัติ เพื่อให้กระบวนการดำเนินต่อไปจนถึงการสร้าง Pull Request ได้

## กลไกการทำงาน (How it works)

เมื่อผู้ใช้กดปุ่ม `Auto-resolve (Migration Wins)` ระบบจะทำงานตามขั้นตอนต่อไปนี้:

1. **สลับไปที่ Migration Branch:** ระบบทำการ `git checkout <migration-branch>`
2. **ดึงโค้ดจาก Target ด้วย Merge Strategy:** ระบบรันคำสั่ง:
   ```bash
   git merge <target-branch> --no-ff -X ours -m "chore: absorb <target-branch> changes (migration wins conflicts)"
   ```
3. **`-X ours` (Migration Wins):** 
   - นี่คือหัวใจสำคัญของการทำ Auto-resolve 
   - ตามปกติเมื่อเกิด Conflict Git จะหยุดและรอให้คนมาแก้ แต่การใส่ option `-X ours` จะเป็นการบอก Git ว่า **"หากเกิดความขัดแย้งในไฟล์ใด ให้ยึดโค้ดฝั่งปัจจุบัน (ซึ่งก็คือ Migration Branch) เป็นหลักเสมอ"**
   - ส่วนโค้ดใดที่ไม่มี Conflict ก็จะถูก Merge เข้ามาตามปกติ
4. **จำลองการ Merge อีกครั้ง:** หลังจาก Merge เสร็จสิ้น ระบบจะล้างค่า Simulation Log เดิม และเริ่มกระบวนการ Pre-Merge Simulation ใหม่อัตโนมัติ เพื่อยืนยันว่าโค้ดที่ผ่านการ Auto-resolve ไปแล้วนั้น สามารถผ่านกระบวนการ CI ได้อย่างสมบูรณ์

## ⚠️ คำเตือนและข้อควรระวัง (CRITICAL WARNINGS)

ฟีเจอร์นี้แม้จะช่วยลดภาระการแก้ Conflict ด้วยมือ แต่ก็แฝงมาด้วยความเสี่ยงในการสูญเสียโค้ด (Code Loss) ดังนั้นโปรดคำนึงถึงสิ่งต่อไปนี้:

1. **ยังไม่ผ่านการทดสอบบน Real Scenario:** 
   กระบวนการบังคับชนะด้วย `-X ours` อาจทำให้ลอจิกของโค้ดที่มีการอัปเดตไปแล้วบน Target Branch (แต่ไม่มีใน Migration Branch) ถูกเขียนทับและหายไป 
2. **ต้องตรวจสอบด้วยตัวเองเสมอ:**
   เมื่อพบว่ามีการใช้ Auto-resolve **ขอให้ท่านตรวจสอบโค้ดที่เกิด Conflict อย่างละเอียดด้วยตัวเองอีกครั้ง (Manual Review)** ก่อนที่จะกดสร้าง Pull Request การปล่อยให้ระบบตัดสินใจทั้งหมดอาจทำให้เกิดบั๊กบนระบบ Production ได้
3. **พึ่งพา CI เป็นปราการด่านสุดท้าย:**
   ท่าน **ต้องมั่นใจเสมอว่า CI (Continuous Integration / Test Automation) ถูกรันจนผ่านสำเร็จ (Success/Passed)** หลังจากการกระทำ Auto-resolve เพื่อเป็นหลักประกันขั้นต้นว่าการแก้ไข Conflict นั้นไม่ทำให้ระบบพัง

หากระบบ CI ตรวจพบ Error กรุณายกเลิกการทำงานและกลับไปพิจารณาแก้ Conflict แบบแมนนวลผ่าน Editor (เช่น VSCode) จะปลอดภัยที่สุด
