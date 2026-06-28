import { apiFetch } from "./client";
import type { HostedZone, ListParams, PaginatedResponse } from "@/types";

function buildQuery(params: ListParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.page_size) searchParams.set("page_size", String(params.page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function listHostedZones(
  params: ListParams = {},
): Promise<PaginatedResponse<HostedZone>> {
  return apiFetch<PaginatedResponse<HostedZone>>(
    `/hosted-zones${buildQuery(params)}`,
  );
}

export async function getHostedZone(id: number): Promise<HostedZone> {
  return apiFetch<HostedZone>(`/hosted-zones/${id}`);
}

export async function createHostedZone(data: {
  name: string;
  comment?: string;
}): Promise<HostedZone> {
  return apiFetch<HostedZone>("/hosted-zones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHostedZone(
  id: number,
  data: { name?: string; comment?: string },
): Promise<HostedZone> {
  return apiFetch<HostedZone>(`/hosted-zones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteHostedZone(id: number): Promise<void> {
  return apiFetch<void>(`/hosted-zones/${id}`, { method: "DELETE" });
}

export interface ZoneExportJson {
  hosted_zone: HostedZone;
  records: import("@/types").DnsRecord[];
}

export interface BindImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export async function exportHostedZone(
  id: number,
  format: "json" | "bind",
): Promise<ZoneExportJson | string> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(
    `${API_BASE}/hosted-zones/${id}/export?format=${format}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Export failed");
  }
  if (format === "bind") return res.text();
  return res.json();
}

export async function importBindZone(
  id: number,
  content: string,
): Promise<BindImportResult> {
  return apiFetch<BindImportResult>(`/hosted-zones/${id}/import/bind`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
