import { db } from "../config/database.js";
import { getAdminSummary, getAnalyticsSummary } from "../services/analyticsService.js";

export function summary(_req, res) {
  return res.json(getAdminSummary());
}

export function analytics(_req, res) {
  return res.json(getAnalyticsSummary());
}

export function reports(_req, res) {
  return res.json({ reports: db.reports });
}
