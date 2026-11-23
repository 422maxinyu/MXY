/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
const ma_express = require("express");
const ma_healthController = require("../controllers/healthController");
const ma_databaseController = require("../controllers/databaseController");
const ma_newsController = require("../controllers/newsController");
const ma_galleryController = require("../controllers/galleryController");
const ma_chatController = require("../controllers/chatController");
const ma_knowledgeController = require("../controllers/knowledgeController");
const ma_commercialReviewController = require("../controllers/commercialReviewController");
const ma_asrController = require("../controllers/asrController");
const ma_visionController = require("../controllers/visionController");

const ma_router = ma_express.Router();

ma_router.get("/health", ma_healthController.ma_getHealth);
ma_router.post("/database/connect", ma_databaseController.ma_connectDatabase);
ma_router.get("/news", ma_newsController.ma_listNews);
ma_router.get("/gallery", ma_galleryController.ma_listGalleryItems);
ma_router.post("/chat", ma_chatController.ma_createChatCompletion);
ma_router.get("/knowledge", ma_knowledgeController.ma_listDocuments);
ma_router.post("/knowledge", ma_knowledgeController.ma_uploadDocument);
ma_router.delete("/knowledge/:ma_id", ma_knowledgeController.ma_removeDocument);
ma_router.post("/knowledge/chat", ma_knowledgeController.ma_answerQuestion);
ma_router.get("/commercial-reviews/template", ma_commercialReviewController.ma_downloadTemplate);
ma_router.get("/commercial-reviews/samples/:ma_sampleId", ma_commercialReviewController.ma_downloadSample);
ma_router.post("/commercial-reviews/analyze", ma_commercialReviewController.ma_analyzeReviews);
ma_router.post("/asr/transcribe", ma_asrController.ma_transcribeAudio);
ma_router.post("/vision/analyze", ma_visionController.ma_analyzeImage);

module.exports = ma_router;
