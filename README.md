# 🔀 Commit Migration Tool

เครื่องมือ Web UI สำหรับ **ย้าย state ของ Git branch** จาก commit หนึ่งไปอีก commit หนึ่ง พร้อม validate ด้วย CI และให้ AI ช่วยเขียน Pull Request แบบครบจบในหน้าเดียว

> 📌 **หมายเหตุ:** เครื่องมือนี้ถูกสร้างเป็นส่วนหนึ่งของการแก้ไขปัญหาระบบการเรียนรู้ออนไลน์ของ **MyOrder Intelligence Co., Ltd.** หากท่านต้องการนำไปประยุกต์ใช้ กรุณาศึกษา codebase ให้ครบถ้วนก่อนเลือกใช้งาน

---

## ปัญหาที่แก้

ในงานพัฒนาที่มีหลาย branch (เช่น `base` ที่อัปเดตล่าสุด กับ `master` เวอร์ชันเก่ากว่า) มักเกิดสถานการณ์ที่ต้องการ "ดึง" โค้ดจาก commit บน base ไปลงบน target โดยไม่ใช้ cherry-pick ที่เสี่ยง conflict และสลับลำดับ — เครื่องมือนี้แก้ปัญหานั้นด้วยการใช้ `git reset --hard` ตามลำดับจริงใน tree แทน

---

## Tech Stack

| ส่วนงาน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Runtime | Bun |
| Styling | Tailwind CSS v4 |
| Git Operations | `simple-git` + Node.js `child_process` |
| AI Integration | `@google/generative-ai`, OpenAI-compatible HTTP fetch |
| GitHub API | `@octokit/rest` |
| State Persistence | `localStorage` (custom hook) |

---

## การติดตั้งและรัน

```bash
# ติดตั้ง dependencies
bun install

# รัน dev server
bun run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

> **ข้อกำหนด:** โปรเจกต์ที่จะ migrate ต้องอยู่บนเครื่อง (local) และ Next.js server ต้องเข้าถึง path นั้นได้ เพราะ backend ต้องอ่าน `.git` directory โดยตรง

---

## การตั้งค่า (Settings)

ทุก config จะถูกจำไว้ใน `localStorage` ของเบราว์เซอร์ ไม่ต้องกรอกใหม่ทุกครั้ง

### 1. AI Provider
เลือก provider ที่ต้องการใช้เพื่อสร้างเนื้อหา Pull Request:

| Provider | Model เริ่มต้น | หมายเหตุ |
|---|---|---|
| **Google Gemini** | `gemini-2.5-flash` | ต้องใช้ API Key จาก Google AI Studio |
| **OpenAI** | `gpt-4o` | ต้องใช้ API Key |
| **DeepSeek** | `deepseek-chat` | ต้องใช้ API Key |
| **OpenRouter** | `z-ai/glm-4.5-air:free` | รองรับ model ฟรีหลายตัว |
| **LM Studio** | local | รันได้โดยไม่ต้อง API Key — ต้อง start LM Studio Server ที่ `localhost:1234` ก่อน |

สามารถกำหนด custom model name ให้แต่ละ provider ได้ในหน้า Settings

### 2. GitHub Token
Personal Access Token ที่ต้องมี permission `repo` เพื่อใช้ push branch และสร้าง PR ผ่าน Octokit

### 3. CI / Operate Command
คำสั่งที่จะรันหลัง migrate เสร็จ เช่น `bun run test`, `nx affected:test`, `npm run lint` — ค่า default คือ `bun run test`

---

## Workflow ทีละขั้น

```
Step 1: เลือกโปรเจกต์
   └─► Step 2: ดู Git Tree & เลือก Commit
          └─► Step 3: สร้าง Branch + รัน CI
                 └─► [Pre-Merge Simulation]
                        └─► Step 4: AI เขียน PR
                               └─► Step 5: Push & Open PR บน GitHub
```

### Step 1 — เลือกโปรเจกต์
- กด **Browse** เพื่อเปิด native folder picker (ผ่าน `/api/native/browse-folder` ที่เรียก AppleScript บน macOS)
- หรือพิมพ์ path ตรงๆ ก็ได้
- กด **Continue** → ระบบจะดึง branch list จาก `/api/git/branches` และตั้งค่า base/target branch อัตโนมัติ (ถ้ามี `master` จะเลือกเป็น target, ถ้าไม่มีจะเลือก `main`)

### Step 2 — ดู Git Graph & เลือก Commit
- แสดง **Git Graph ย้อนหลัง** ของ base branch โดย mark commit ที่ target branch ชี้อยู่ด้วยสี
- Commit ที่ target branch มีอยู่แล้วจะแสดงเป็นสีเขียว (shared) ส่วนที่ยังไม่มีจะแสดงต่างออกไป
- คลิกเลือก commit ที่ต้องการ "migrate ไปถึง" (หมายถึง branch ใหม่จะ hard reset ไปที่ commit นั้นพร้อม commit ทั้งหมดก่อนหน้า)
- รองรับค้นหา commit ด้วย keyword

### Step 3 — สร้าง Branch + รัน CI
เมื่อกด **Run Operation** ระบบจะทำลำดับนี้ผ่าน streaming NDJSON:

1. **สร้าง branch ใหม่** ชื่อรูปแบบ `migration/<short-hash>-<timestamp>` โดย checkout จาก base branch
2. **`git reset --hard <commit-hash>`** เพื่อตั้งสถานะของ branch ให้ตรงกับ commit ที่เลือก
3. **รันคำสั่ง CI** ที่ตั้งไว้ใน Settings พร้อม stream log กลับมาแสดงแบบ real-time
4. บันทึกผลลัพธ์ไว้ใน Migration History (sidebar)

**Resume:** ถ้า CI ล้มเหลว ผู้ใช้สามารถแก้โค้ดใน branch ที่สร้างไว้แล้ว กดคลิก record นั้นใน history → กด Run อีกครั้งเพื่อ re-run CI โดยไม่ต้องสร้าง branch ใหม่

### Pre-Merge Simulation (ก่อนไป Step 4)
ก่อนจะสร้าง PR ระบบมีขั้นตอน **Simulate Merge** เพื่อตรวจสอบล่วงหน้า:

1. สร้าง sandbox branch ชื่อ `verify/sim-<timestamp>` จาก target branch
2. Merge migration branch เข้า sandbox ด้วย `--no-ff`
3. รัน CI command บน merged state นั้น
4. ลบ sandbox branch ออก (cleanup เสมอ แม้เกิด error)

**ถ้า merge conflict:**
- แสดง error และหยุด ไม่รัน CI
- ผู้ใช้กด **Auto-resolve (Migration Wins)** → ระบบจะ merge target เข้า migration branch ด้วย strategy `-X ours` (migration branch ชนะทุก conflict) แล้วรัน simulation ใหม่อัตโนมัติ (อ่านรายละเอียดเพิ่มเติมที่ [เอกสาร Auto-resolve Logic](docs/auto-resolve-logic.md))

> ⚠️ **คำเตือนสำคัญ:** ฟีเจอร์ Auto-resolve ด้วย `-X ours` ยัง **ไม่เคยผ่านการทดสอบบน Real Scenario** ที่มีความซับซ้อนของ Codebase ระดับ Production 
> หากพบปัญหาการใช้งาน กรุณาอ้างอิงจาก [เอกสาร Auto-resolve Logic](docs/auto-resolve-logic.md) เพื่อทำความเข้าใจการทำงานเบื้องหลัง
> **กรุณาตรวจสอบโค้ดที่เกิด Conflict ด้วยตัวท่านเอง** หากพบปัญหาหรือความผิดปกติ เพื่อป้องกันการสูญหายของ Source Code ที่สำคัญ และ **ต้องมั่นใจเสมอว่าระบบ CI จะถูกรันสำเร็จ (Passed) หลังจากการ Merge ทุกครั้ง**

### Step 4 — AI เขียน Pull Request
- ดึง `git diff <target>..<migration-branch>` ระหว่างสอง branch (cap ไว้ที่ ~30,000 ตัวอักษร)
- ส่ง diff ไปให้ AI provider ที่เลือกพร้อม prompt template
- AI สร้าง PR description เป็น **Markdown ภาษาไทย** (ผสมศัพท์เทคนิคภาษาอังกฤษได้)
- ผู้ใช้แก้ไข title และ body ได้โดยตรงก่อน submit
- Gemini มี retry logic สำหรับ 503 High Demand error (retry 3 ครั้ง, รอ 2 วินาที)

### Step 5 — Push & Open PR
1. **Push** migration branch ขึ้น `origin` ด้วย `-u`
2. **Parse** repo owner/name จาก remote URL (รองรับทั้ง HTTPS และ SSH format)
3. **เปิด PR** บน GitHub ผ่าน Octokit API พร้อม title, body ที่ AI สร้าง
4. **Assign Reviewers** ด้วย GitHub username ที่ใส่ไว้ (คั่นด้วย comma)
5. แสดงลิงก์ PR ที่สร้างสำเร็จ

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx              # UI หลักทั้งหมด (Single Page App) + state management
│   ├── layout.tsx            # Root layout + ThemeProvider
│   └── api/
│       ├── native/
│       │   └── browse-folder/  # Native OS folder picker (AppleScript on macOS)
│       ├── git/
│       │   ├── branches/       # ดึง branch list
│       │   ├── log/            # ดึง commit history + เช็ค shared hashes กับ target
│       │   ├── commit-details/ # ดึงรายการไฟล์ที่เปลี่ยนแปลงใน commit
│       │   ├── operate/        # สร้าง/checkout branch, reset, รัน CI (streaming)
│       │   ├── simulate-merge/ # Sandbox merge + รัน CI บน merged state (streaming)
│       │   ├── absorb-target/  # Force-merge target เข้า migration (-X ours) (streaming)
│       │   └── push-pr/        # Push branch + เปิด PR บน GitHub
│       └── ai/
│           └── generate-pr/    # สร้าง PR content ด้วย AI
├── components/
│   ├── GitGraphViewer.tsx    # Visualize commit history แบบ tree
│   └── MigrationSidebar.tsx  # แสดง migration history
└── lib/
    ├── git-service.ts        # ห่อ simple-git + child_process spawn
    ├── ai-service.ts         # จัดการ AI providers ทุกตัว
    ├── use-local-storage.ts  # Hook สำหรับ persist state ไว้ใน localStorage
    └── use-theme.tsx         # Dark/Light mode toggle
```

---

## API Routes สรุป

| Method | Path | ทำอะไร |
|---|---|---|
| `GET` | `/api/native/browse-folder` | เปิด native OS folder picker |
| `POST` | `/api/git/branches` | ดึง branch list ของโปรเจกต์ |
| `POST` | `/api/git/log` | ดึง commit log และ mark shared commits กับ target branch |
| `POST` | `/api/git/commit-details` | ดึง file list ที่เปลี่ยนใน commit นั้น |
| `POST` | `/api/git/operate` | สร้าง/resume migration branch + รัน CI (NDJSON stream) |
| `POST` | `/api/git/simulate-merge` | จำลอง merge + รัน CI บน sandbox (NDJSON stream) |
| `POST` | `/api/git/absorb-target` | Force-merge target เข้า migration (-X ours) (NDJSON stream) |
| `POST` | `/api/git/push-pr` | Push branch + สร้าง PR + assign reviewers |
| `POST` | `/api/ai/generate-pr` | สร้างเนื้อหา PR ด้วย AI จาก git diff |

Routes ที่ return **NDJSON stream** จะส่ง JSON object ทีละบรรทัดผ่าน `ReadableStream` และ frontend จะอ่านด้วย `reader.read()` loop พร้อม buffer handling เพื่อรับ log แบบ real-time

---

## หมายเหตุสำคัญ

- **ต้องรันบนเครื่องที่มีโปรเจกต์:** เครื่องมือนี้ไม่ใช่ remote tool — Next.js server ต้อง access file system ของโปรเจกต์ได้โดยตรง
- **Git state จะถูกแก้ไขจริง:** `git reset --hard` และ branch operations ทำกับ repository จริง ควรตรวจสอบ branch ก่อนรัน
- **GitHub Token:** ใช้เฉพาะ push และ PR — ไม่มีการส่งไปเก็บที่ server ใดๆ ทั้งสิ้น (ส่งตรงจาก browser ผ่าน Next.js API route ไป GitHub)
- **AI Prompt:** template เริ่มต้นจะสั่งให้ AI เขียนเป็นภาษาไทยผสมศัพท์เทคนิคภาษาอังกฤษ สามารถปรับ template ได้ในอนาคต
