import { apiClient } from "./client.js";

function withRange(params = {}) {
  const query = {};
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.limit) query.limit = params.limit;
  if (params.granularity) query.granularity = params.granularity;
  return query;
}

export async function getAnalyticsSummary(params = {}) {
  const { data } = await apiClient.get("/analytics/summary", {
    params: withRange(params),
  });
  return data;
}

export async function getAnalyticsSources(params = {}) {
  const { data } = await apiClient.get("/analytics/sources", {
    params: withRange(params),
  });
  return data;
}

export async function getAnalyticsPages(params = {}) {
  const { data } = await apiClient.get("/analytics/pages", {
    params: withRange(params),
  });
  return data;
}

export async function getAnalyticsSections(params = {}) {
  const { data } = await apiClient.get("/analytics/sections", {
    params: withRange(params),
  });
  return data;
}

export async function getAnalyticsTimeseries(params = {}) {
  const { data } = await apiClient.get("/analytics/timeseries", {
    params: withRange({ ...params, granularity: params.granularity || "day" }),
  });
  return data;
}
