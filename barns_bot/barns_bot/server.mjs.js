// server.mjs.js
import 'dotenv/config';
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------- إعداد الخادم --------
const app = express();
app.use(express.json());

// ✅ CORS هنا
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(__dirname)); // يقدم index.html / admin.html إن وُجدا

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ضع OPENAI_API_KEY في المتغيرات البيئية قبل التشغيل.");
  process.exit(1);
}
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -------- Vector Store دائم (ENV أو ملف محلي) --------
const VECTOR_ID_FILE = path.join(__dirname, ".vector_store_id");

async function createVectorStore() {
  const vs = await client.vectorStores.create({ name: "company-knowledge" });
  fs.writeFileSync(VECTOR_ID_FILE, vs.id);
  console.log("🆕 Created vector store:", vs.id, "— save as VECTOR_STORE_ID");
  return vs.id;
}

async function loadVectorStoreId() {
  // 1) من متغير البيئة أولاً (مفيد للنقل/النشر)
  if (process.env.VECTOR_STORE_ID?.trim()) {
    return process.env.VECTOR_STORE_ID.trim();
  }
  // 2) من الملف المحلي إن وجد
  if (fs.existsSync(VECTOR_ID_FILE)) {
    const id = fs.readFileSync(VECTOR_ID_FILE, "utf-8").trim();
    if (id) return id;
  }
  // 3) غير موجود → أنشئ واحد جديد وثبّته
  return await createVectorStore();
}

console.log("⏳ Preparing vector store…");
const vectorStoreId = await loadVectorStoreId();
console.log("✅ Vector store ready:", vectorStoreId);

// (تعليق) لا نرفع أي ملف تلقائياً عند الإقلاع لتجنّب التكرار

// -------- Multer (إنشاء مجلد الرفع تلقائياً) --------
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// -------- أدوات --------
const SUPPORTED_EXT = new Set([".pdf", ".txt", ".md", ".docx", ".html", ".json"]);
const NEEDS_CONVERT_TO_TXT = new Set([".csv"]); // يمكن إضافة .xlsx لاحقاً

function makeTempTxtFromCsv(srcPath, originalName) {
  // تحويل بسيط: نحفظ CSV كنص عادي داخل TXT مع ترويسة توضح المصدر
  const raw = fs.readFileSync(srcPath, "utf8");
  const outPath = srcPath + ".txt";
  const header =
    `# CSV: ${originalName}\n` +
    `# NOTE: Converted to .txt for semantic indexing.\n\n`;
  fs.writeFileSync(outPath, header + raw, "utf8");
  return outPath;
}

// -------- مسارات API --------
app.get("/health", (_req, res) => res.json({ ok: true }));

// استرجاع الـID الحالي للمتجر
app.get("/store/id", (_req, res) => {
  res.json({ ok: true, vectorStoreId });
});

// التبديل إلى متجر موجود (ثم أعد تشغيل السيرفر)
app.post("/store/use", async (req, res) => {
  try {
    const id = (req.body?.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "No id provided" });
    // اختبار صحة الـID
    await client.vectorStores.files.list(id);
    fs.writeFileSync(VECTOR_ID_FILE, id);
    res.json({ ok: true, message: "Switched vector store. Restart server to apply.", id });
  } catch (e) {
    res.status(400).json({ ok: false, error: e?.message || String(e) });
  }
});

/**
 * /ingest : رفع ملفات متعددة (ملف-بملف) مع تقارير تفصيلية
 * يدعم CSV (يُحوَّل إلى TXT تلقائياً).
 */
app.post("/ingest", upload.array("files", 100), async (req, res) => {
  const results = [];
  try {
    if (!req.files?.length) {
      return res.status(400).json({ ok: false, error: "No files uploaded" });
    }

    for (const f of req.files) {
      const r = { originalName: f.originalname };
      let tmpPathToUpload = f.path; // الافتراضي: ملف Multer المؤقت
      let createdTemp = false;

      try {
        const ext = path.extname(f.originalname || "").toLowerCase();

        if (SUPPORTED_EXT.has(ext)) {
          // ارفع كما هو
        } else if (NEEDS_CONVERT_TO_TXT.has(ext)) {
          // CSV → TXT
          tmpPathToUpload = makeTempTxtFromCsv(f.path, f.originalname);
          createdTemp = true;
        } else {
          throw new Error(`Unsupported file extension: ${ext || "(none)"}`);
        }

        // 1) رفع إلى Files API
        const uploaded = await client.files.create({
          file: fs.createReadStream(tmpPathToUpload),
          purpose: "assistants",
        });
        r.fileId = uploaded.id;

        // 2) ربط الملف بالـVector Store
        await client.vectorStores.files.create(vectorStoreId, { file_id: uploaded.id });

        r.ok = true;
      } catch (e) {
        r.ok = false;
        r.error = e?.message || String(e);
        r.code = e?.code || null;
        r.detail = e?.response?.data || e?.stack || null;
        console.error(`Ingest error for ${f.originalname}:`, e);
      } finally {
        // تنظيف الملفات المؤقتة
        try { fs.existsSync(f.path) && fs.unlinkSync(f.path); } catch {}
        try { createdTemp && fs.existsSync(tmpPathToUpload) && fs.unlinkSync(tmpPathToUpload); } catch {}
      }

      results.push(r);
    }

    const added = results.filter(x => x.ok).length;
    const failed = results.length - added;

    if (added === 0) {
      return res.status(400).json({ ok: false, error: "All uploads failed", vectorStoreId, results });
    }
    return res.json({
      ok: true,
      message: `Added ${added} file(s), failed ${failed}.`,
      vectorStoreId,
      results
    });

  } catch (e) {
    console.error("Ingest fatal error:", e);
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
      detail: e?.response?.data || e?.stack || null,
      vectorStoreId,
      results
    });
  }
});

// سؤال/جواب من نفس المتجر
app.post("/ask", async (req, res) => {
  try {
    const question = (req.body?.question || req.body?.prompt || req.body?.message || "").toString().trim();
    if (!question) return res.status(400).json({ ok: false, error: "No question" });

    const systemInstruction = `
- أجب فقط من الملفات المرفوعة في قاعدة المعرفة (لا تؤلف).
- اذكر المصدر بين قوسين (اسم الملف) إن وُجد.
- إن لم يوجد الجواب في الملفات، قل: "لا أجد ذلك في البيانات."
    `.trim();

    const rsp = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemInstruction },
        { role: "user", content: question },
      ],
      tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
      // file_search: { max_num_results: 12 }, // اختياري
    });

    const answer = rsp.output_text ?? "لم أتمكن من استخراج النص من الرد.";
    return res.json({ ok: true, reply: answer }); // ← هنا رجّع reply
  } catch (err) {
    console.error("Ask error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || String(err),
      detail: err?.response?.data || err?.stack || null,
    });
  }
});

// حالة المتجر + سرد الملفات
app.get("/status", async (_req, res) => {
  try {
    const files = await client.vectorStores.files.list(vectorStoreId);
    res.json({
      ok: true,
      vectorStoreId,
      count: files?.data?.length ?? 0,
      files: files?.data ?? [],
    });
  } catch (e) {
    console.error("Status error:", e);
    res.status(500).json({
      ok: false,
      error: e?.message || String(e),
      detail: e?.response?.data || e?.stack || null,
    });
  }
});

// الصفحة الرئيسية
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------- تشغيل الخادم --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
