import express from "express";
import { stripeWebhook } from "../controllers/stripeWebhook.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| STRIPE WEBHOOK ENDPOINT
|--------------------------------------------------------------------------
| URL = /api/webhooks/stripe
| Body = RAW (handled in server.js)
*/

router.post("/", stripeWebhook);

export default router;
