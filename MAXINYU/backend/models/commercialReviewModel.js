/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Copilot（具体模型名称未提供） */
const ma_xlsx = require("xlsx");

const ma_maxWorkbookSize = 5 * 1024 * 1024;
const ma_maxReviews = 100;
const ma_maxReviewLength = 1000;

function ma_parseWorkbook(ma_fileName, ma_content) {
  if (typeof ma_fileName !== "string" || !ma_fileName.toLowerCase().endsWith(".xlsx")) {
    throw ma_createError(400, "仅支持 .xlsx 格式的 Excel 文件。");
  }
  if (typeof ma_content !== "string" || !ma_content || ma_content.length > 7_000_000) {
    throw ma_createError(400, "Excel 文件内容无效或超过 5 MB。");
  }

  let ma_buffer;
  try {
    ma_buffer = Buffer.from(ma_content, "base64");
  } catch (ma_error) {
    throw ma_createError(400, "Excel 文件编码无效，请重新选择文件。");
  }
  if (!ma_buffer.length || ma_buffer.length > ma_maxWorkbookSize) {
    throw ma_createError(400, "Excel 文件为空或超过 5 MB。");
  }

  let ma_workbook;
  try {
    ma_workbook = ma_xlsx.read(ma_buffer, { type: "buffer", cellDates: false });
  } catch (ma_error) {
    throw ma_createError(400, "无法解析 Excel 文件，请使用提供的 .xlsx 模板。");
  }
  const ma_sheetName = ma_workbook.SheetNames[0];
  const ma_sheet = ma_sheetName && ma_workbook.Sheets[ma_sheetName];
  if (!ma_sheet) {
    throw ma_createError(400, "Excel 文件中没有可读取的工作表。");
  }

  const ma_rows = ma_xlsx.utils.sheet_to_json(ma_sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false
  });
  const ma_headers = (ma_rows.shift() || []).map((ma_header) => String(ma_header).trim());
  const ma_columns = {
    ma_id: ma_headers.indexOf("评论ID"),
    ma_product: ma_headers.indexOf("商品名称"),
    ma_content: ma_headers.indexOf("评论内容"),
    ma_rating: ma_headers.indexOf("评分"),
    ma_createdAt: ma_headers.indexOf("评论时间")
  };
  if (ma_columns.ma_content < 0) {
    throw ma_createError(400, "请在首行设置“评论内容”列，可使用页面提供的 Excel 模板。");
  }

  const ma_reviews = [];
  for (const ma_row of ma_rows) {
    const ma_content = String(ma_row[ma_columns.ma_content] || "").trim();
    if (!ma_content) {
      continue;
    }
    if (ma_reviews.length >= ma_maxReviews) {
      throw ma_createError(400, `单次最多分析 ${ma_maxReviews} 条商业评论。`);
    }
    if (ma_content.length > ma_maxReviewLength) {
      throw ma_createError(400, `第 ${ma_reviews.length + 2} 行评论超过 ${ma_maxReviewLength} 个字符。`);
    }

    const ma_review = {
      ma_review_id: ma_columns.ma_id < 0 ? String(ma_reviews.length + 1) : String(ma_row[ma_columns.ma_id] || "").trim(),
      ma_content
    };
    if (!ma_review.ma_review_id || ma_review.ma_review_id.length > 80) {
      throw ma_createError(400, `第 ${ma_reviews.length + 2} 行评论 ID 无效，最多 80 个字符。`);
    }
    if (ma_columns.ma_product >= 0) {
      ma_review.ma_product = String(ma_row[ma_columns.ma_product] || "").trim().slice(0, 120);
    }
    if (ma_columns.ma_rating >= 0) {
      ma_review.ma_rating = String(ma_row[ma_columns.ma_rating] || "").trim().slice(0, 20);
    }
    if (ma_columns.ma_createdAt >= 0) {
      ma_review.ma_created_at = String(ma_row[ma_columns.ma_createdAt] || "").trim().slice(0, 40);
    }
    ma_reviews.push(ma_review);
  }
  if (!ma_reviews.length) {
    throw ma_createError(400, "Excel 文件中没有可分析的评论，请填写“评论内容”列。");
  }
  const ma_reviewIds = new Set(ma_reviews.map((ma_review) => ma_review.ma_review_id));
  if (ma_reviewIds.size !== ma_reviews.length) {
    throw ma_createError(400, "评论 ID 不能重复，请检查 Excel 中的“评论ID”列。");
  }
  return ma_reviews;
}

function ma_createError(ma_status, ma_message) {
  const ma_error = new Error(ma_message);
  ma_error.status = ma_status;
  return ma_error;
}

module.exports = { ma_parseWorkbook };
