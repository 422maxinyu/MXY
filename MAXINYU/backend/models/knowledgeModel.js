/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-12 | 大模型：Copilot（具体模型名称未提供） */
const ma_fs = require("node:fs/promises");
const ma_path = require("node:path");
const ma_zlib = require("node:zlib");
const ma_crypto = require("node:crypto");

const ma_storePath = ma_path.join(__dirname, "..", "data", "ma_knowledge.json");
const ma_maxContentLength = 500000;
let ma_writeQueue = Promise.resolve();

async function ma_listDocuments() {
  const ma_documents = await ma_readDocuments();
  return ma_documents.map(ma_toSummary);
}

async function ma_addDocument(ma_name, ma_content) {
  const ma_safeName = ma_sanitizeName(ma_name);
  const ma_extension = ma_path.extname(ma_safeName).toLowerCase();
  if (![".txt", ".pdf"].includes(ma_extension)) {
    throw ma_createError(400, "仅支持 TXT 和 PDF 文件。");
  }
  if (typeof ma_content !== "string" || !ma_content || ma_content.length > 9_000_000) {
    throw ma_createError(400, "文件内容无效或超过大小限制（单个文件最大 6 MB）。");
  }

  let ma_buffer;
  try {
    ma_buffer = Buffer.from(ma_content, "base64");
  } catch (ma_error) {
    throw ma_createError(400, "文件编码无效，请重新选择文件。");
  }
  if (!ma_buffer.length || ma_buffer.length > 6 * 1024 * 1024) {
    throw ma_createError(400, "文件为空或超过大小限制（单个文件最大 6 MB）。");
  }

  let ma_text;
  if (ma_extension === ".txt") {
    try {
      ma_text = new TextDecoder("utf-8", { fatal: true }).decode(ma_buffer);
    } catch (ma_error) {
      throw ma_createError(400, "TXT 文件必须使用 UTF-8 编码。");
    }
  } else {
    ma_text = ma_extractPdfText(ma_buffer);
  }

  ma_text = ma_normalizeText(ma_text);
  if (!ma_text) {
    throw ma_createError(400, "未能从文件中提取到文字，请确认 PDF 含有可复制的文本。");
  }
  if (ma_text.length > ma_maxContentLength) {
    throw ma_createError(400, "解析后的文本超过 500,000 字符，请精简文件后重试。");
  }

  const ma_document = {
    ma_id: ma_crypto.randomUUID(),
    ma_name: ma_safeName,
    ma_type: ma_extension.slice(1).toUpperCase(),
    ma_content: ma_text,
    ma_char_count: ma_text.length,
    ma_uploaded_at: new Date().toISOString()
  };
  await ma_updateDocuments((ma_documents) => [...ma_documents, ma_document]);
  return ma_toSummary(ma_document);
}

async function ma_deleteDocument(ma_id) {
  let ma_deleted = false;
  await ma_updateDocuments((ma_documents) => {
    const ma_remaining = ma_documents.filter((ma_document) => ma_document.ma_id !== ma_id);
    ma_deleted = ma_remaining.length !== ma_documents.length;
    return ma_remaining;
  });
  return ma_deleted;
}

async function ma_searchDocuments(ma_question) {
  const ma_documents = await ma_readDocuments();
  const ma_chunks = ma_documents.flatMap((ma_document) =>
    ma_splitIntoChunks(ma_document.ma_content).map((ma_content) => ({
      ma_id: ma_document.ma_id,
      ma_name: ma_document.ma_name,
      ma_content
    }))
  );
  const ma_terms = ma_getSearchTerms(ma_question);
  const ma_ranked = ma_chunks.map((ma_chunk) => {
    const ma_lowerContent = ma_chunk.ma_content.toLocaleLowerCase();
    const ma_score = ma_terms.reduce((ma_total, ma_term) => {
      const ma_index = ma_lowerContent.indexOf(ma_term);
      return ma_total + (ma_index < 0 ? 0 : 1 + (ma_lowerContent.indexOf(ma_term, ma_index + ma_term.length) >= 0 ? 0.25 : 0));
    }, 0);
    return { ...ma_chunk, ma_score };
  }).filter((ma_chunk) => ma_chunk.ma_score > 0)
    .sort((ma_left, ma_right) => ma_right.ma_score - ma_left.ma_score)
    .slice(0, 4);

  return ma_ranked.map((ma_chunk) => ({
    ma_name: ma_chunk.ma_name,
    ma_content: ma_chunk.ma_content
  }));
}

function ma_extractPdfText(ma_buffer) {
  if (ma_buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw ma_createError(400, "PDF 文件格式无效。");
  }
  const ma_source = ma_buffer.toString("latin1");
  const ma_streams = [];
  let ma_offset = 0;
  while (true) {
    const ma_streamIndex = ma_source.indexOf("stream", ma_offset);
    if (ma_streamIndex < 0) {
      break;
    }
    const ma_afterStream = ma_streamIndex + 6;
    let ma_contentStart = ma_afterStream;
    if (ma_source.startsWith("\r\n", ma_contentStart)) {
      ma_contentStart += 2;
    } else if (ma_source[ma_contentStart] === "\n" || ma_source[ma_contentStart] === "\r") {
      ma_contentStart += 1;
    } else {
      ma_offset = ma_afterStream;
      continue;
    }

    const ma_endIndex = ma_source.indexOf("endstream", ma_contentStart);
    if (ma_endIndex < 0) {
      break;
    }
    let ma_contentEnd = ma_endIndex;
    while (ma_contentEnd > ma_contentStart && (ma_source[ma_contentEnd - 1] === "\r" || ma_source[ma_contentEnd - 1] === "\n")) {
      ma_contentEnd -= 1;
    }

    const ma_objectStart = ma_source.lastIndexOf("endobj", ma_streamIndex);
    const ma_dictionary = ma_source.slice(Math.max(0, ma_objectStart), ma_streamIndex);
    let ma_stream = ma_buffer.subarray(ma_contentStart, ma_contentEnd);
    if (/\/FlateDecode\b/.test(ma_dictionary)) {
      try {
        ma_stream = ma_zlib.inflateSync(ma_stream);
      } catch (ma_error) {
        try {
          ma_stream = ma_zlib.inflateRawSync(ma_stream);
        } catch (ma_rawError) {
          ma_offset = ma_endIndex + 9;
          continue;
        }
      }
    }
    ma_streams.push(ma_stream.toString("latin1"));
    ma_offset = ma_endIndex + 9;
  }

  const ma_cmap = ma_parseCMaps(ma_streams);
  const ma_textParts = [];
  for (const ma_stream of ma_streams) {
    const ma_textBlocks = ma_stream.matchAll(/\bBT\b([\s\S]*?)\bET\b/g);
    for (const ma_block of ma_textBlocks) {
      const ma_textBlock = ma_block[1];
      const ma_arrayMatches = ma_textBlock.matchAll(/\[((?:\\[\s\S]|[^\]])*)\]\s*TJ\b/g);
      for (const ma_array of ma_arrayMatches) {
        ma_textParts.push(...ma_readTextOperands(ma_array[1], ma_cmap));
      }
      const ma_withoutArrays = ma_textBlock.replace(/\[((?:\\[\s\S]|[^\]])*)\]\s*TJ\b/g, "");
      ma_textParts.push(...ma_readTextOperands(ma_withoutArrays, ma_cmap));
    }
  }
  return ma_textParts.join(" ");
}

function ma_parseCMaps(ma_streams) {
  const ma_cmap = new Map();
  for (const ma_stream of ma_streams) {
    if (!/beginbf(?:char|range)/.test(ma_stream)) {
      continue;
    }
    for (const ma_block of ma_stream.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
      for (const ma_pair of ma_block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        ma_cmap.set(ma_pair[1].toUpperCase(), ma_decodeUtf16Be(ma_pair[2]));
      }
    }
    for (const ma_block of ma_stream.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      for (const ma_line of ma_block[1].split(/\r?\n/)) {
        const ma_range = ma_line.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<([0-9A-Fa-f]+)>|\[([^\]]*)\])/);
        if (!ma_range) {
          continue;
        }
        const ma_start = parseInt(ma_range[1], 16);
        const ma_end = parseInt(ma_range[2], 16);
        if (!Number.isFinite(ma_start) || !Number.isFinite(ma_end) || ma_end - ma_start > 512) {
          continue;
        }
        const ma_width = ma_range[1].length;
        if (ma_range[4]) {
          const ma_destination = parseInt(ma_range[4], 16);
          for (let ma_code = ma_start; ma_code <= ma_end; ma_code += 1) {
            const ma_hex = (ma_destination + ma_code - ma_start).toString(16).padStart(ma_range[4].length, "0");
            ma_cmap.set(ma_code.toString(16).padStart(ma_width, "0").toUpperCase(), ma_decodeUtf16Be(ma_hex));
          }
        } else {
          const ma_targets = Array.from(ma_range[5].matchAll(/<([0-9A-Fa-f]+)>/g), (ma_match) => ma_match[1]);
          for (let ma_index = 0; ma_index < ma_targets.length && ma_start + ma_index <= ma_end; ma_index += 1) {
            ma_cmap.set((ma_start + ma_index).toString(16).padStart(ma_width, "0").toUpperCase(), ma_decodeUtf16Be(ma_targets[ma_index]));
          }
        }
      }
    }
  }
  return ma_cmap;
}

function ma_readTextOperands(ma_source, ma_cmap) {
  const ma_values = [];
  const ma_operandPattern = /\((?:\\[\s\S]|[^\\)])*\)|<[0-9A-Fa-f\s]+>/g;
  for (const ma_match of ma_source.matchAll(ma_operandPattern)) {
    const ma_token = ma_match[0];
    if (ma_token.startsWith("(")) {
      ma_values.push(ma_decodeLiteralString(ma_token.slice(1, -1)));
    } else {
      const ma_hex = ma_token.slice(1, -1).replace(/\s/g, "");
      ma_values.push(ma_decodeHexString(ma_hex, ma_cmap));
    }
  }
  return ma_values.filter(Boolean);
}

function ma_decodeLiteralString(ma_value) {
  const ma_bytes = [];
  for (let ma_index = 0; ma_index < ma_value.length; ma_index += 1) {
    let ma_character = ma_value[ma_index];
    if (ma_character === "\\") {
      ma_index += 1;
      ma_character = ma_value[ma_index];
      const ma_escapes = { n: 10, r: 13, t: 9, b: 8, f: 12 };
      if (ma_escapes[ma_character] !== undefined) {
        ma_bytes.push(ma_escapes[ma_character]);
      } else if (/[0-7]/.test(ma_character || "")) {
        const ma_octal = ma_value.slice(ma_index).match(/^[0-7]{1,3}/)[0];
        ma_bytes.push(parseInt(ma_octal, 8) & 255);
        ma_index += ma_octal.length - 1;
      } else if (ma_character !== "\r" && ma_character !== "\n") {
        ma_bytes.push((ma_character || "").charCodeAt(0) & 255);
      }
    } else {
      ma_bytes.push(ma_character.charCodeAt(0) & 255);
    }
  }
  return new TextDecoder("windows-1252").decode(Uint8Array.from(ma_bytes));
}

function ma_decodeHexString(ma_hex, ma_cmap) {
  if (ma_hex.startsWith("FEFF")) {
    return ma_decodeUtf16Be(ma_hex.slice(4));
  }
  let ma_result = "";
  let ma_offset = 0;
  while (ma_offset < ma_hex.length) {
    let ma_matched = false;
    for (let ma_width = 8; ma_width >= 2; ma_width -= 2) {
      const ma_code = ma_hex.slice(ma_offset, ma_offset + ma_width).toUpperCase();
      if (ma_code.length === ma_width && ma_cmap.has(ma_code)) {
        ma_result += ma_cmap.get(ma_code);
        ma_offset += ma_width;
        ma_matched = true;
        break;
      }
    }
    if (!ma_matched) {
      const ma_code = ma_hex.slice(ma_offset, ma_offset + 2);
      if (ma_code.length < 2) {
        break;
      }
      ma_result += String.fromCharCode(parseInt(ma_code, 16));
      ma_offset += 2;
    }
  }
  return ma_result;
}

function ma_decodeUtf16Be(ma_hex) {
  const ma_bytes = [];
  for (let ma_index = 0; ma_index + 3 < ma_hex.length; ma_index += 4) {
    ma_bytes.push(parseInt(ma_hex.slice(ma_index + 2, ma_index + 4), 16));
    ma_bytes.push(parseInt(ma_hex.slice(ma_index, ma_index + 2), 16));
  }
  return Buffer.from(ma_bytes).toString("utf16le");
}

function ma_getSearchTerms(ma_question) {
  const ma_terms = new Set((ma_question.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || []));
  for (const ma_chinese of ma_question.match(/[\u3400-\u9fff]+/g) || []) {
    for (let ma_index = 0; ma_index < ma_chinese.length - 1; ma_index += 1) {
      ma_terms.add(ma_chinese.slice(ma_index, ma_index + 2).toLocaleLowerCase());
    }
    if (ma_chinese.length === 1) {
      ma_terms.add(ma_chinese.toLocaleLowerCase());
    }
  }
  return Array.from(ma_terms);
}

function ma_splitIntoChunks(ma_content) {
  const ma_chunks = [];
  const ma_chunkSize = 700;
  const ma_overlap = 100;
  let ma_start = 0;
  while (ma_start < ma_content.length) {
    let ma_end = Math.min(ma_content.length, ma_start + ma_chunkSize);
    if (ma_end < ma_content.length) {
      const ma_boundary = ma_content.slice(ma_start + 350, ma_end).search(/[。！？\n]/);
      if (ma_boundary >= 0) {
        ma_end = ma_start + 350 + ma_boundary + 1;
      }
    }
    const ma_chunk = ma_content.slice(ma_start, ma_end).trim();
    if (ma_chunk) {
      ma_chunks.push(ma_chunk);
    }
    if (ma_end === ma_content.length) {
      break;
    }
    ma_start = Math.max(ma_start + 1, ma_end - ma_overlap);
  }
  return ma_chunks;
}

function ma_normalizeText(ma_text) {
  return ma_text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function ma_sanitizeName(ma_name) {
  if (typeof ma_name !== "string" || !ma_name.trim()) {
    throw ma_createError(400, "请提供文件名。");
  }
  const ma_basename = ma_name.split(/[\\/]/).pop();
  return ma_basename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim().slice(0, 120);
}

function ma_toSummary(ma_document) {
  return {
    ma_id: ma_document.ma_id,
    ma_name: ma_document.ma_name,
    ma_type: ma_document.ma_type,
    ma_char_count: ma_document.ma_char_count,
    ma_uploaded_at: ma_document.ma_uploaded_at
  };
}

async function ma_readDocuments() {
  try {
    const ma_data = await ma_fs.readFile(ma_storePath, "utf8");
    const ma_documents = JSON.parse(ma_data);
    if (!Array.isArray(ma_documents)) {
      throw new Error("知识库文件格式无效。");
    }
    return ma_documents;
  } catch (ma_error) {
    if (ma_error.code === "ENOENT") {
      return [];
    }
    throw ma_error;
  }
}

async function ma_updateDocuments(ma_update) {
  const ma_operation = ma_writeQueue.then(async () => {
    const ma_documents = await ma_readDocuments();
    const ma_updated = ma_update(ma_documents);
    await ma_fs.mkdir(ma_path.dirname(ma_storePath), { recursive: true });
    const ma_temporaryPath = `${ma_storePath}.${process.pid}.tmp`;
    await ma_fs.writeFile(ma_temporaryPath, JSON.stringify(ma_updated), "utf8");
    await ma_fs.rename(ma_temporaryPath, ma_storePath);
  });
  ma_writeQueue = ma_operation.catch(() => {});
  return ma_operation;
}

function ma_createError(ma_status, ma_message) {
  const ma_error = new Error(ma_message);
  ma_error.status = ma_status;
  return ma_error;
}

module.exports = {
  ma_addDocument,
  ma_deleteDocument,
  ma_listDocuments,
  ma_searchDocuments
};
