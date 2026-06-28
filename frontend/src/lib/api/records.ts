import { apiFetch } from "./client";
import type { DnsRecord, ListParams, PaginatedResponse } from "@/types";

function buildQuery(params: ListParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.page_size) searchParams.set("page_size", String(params.page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function listRecords(
  zoneId: number,
  params: ListParams = {},
): Promise<PaginatedResponse<DnsRecord>> {
  return apiFetch<PaginatedResponse<DnsRecord>>(
    `/hosted-zones/${zoneId}/records${buildQuery(params)}`,
  );
}

export async function createRecord(
  zoneId: number,
  data: {
    name: string;
    type: string;
    ttl: number;
    value: string;
    routing_policy?: string;
    comment?: string;
  },
): Promise<DnsRecord> {
  return apiFetch<DnsRecord>(`/hosted-zones/${zoneId}/records`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRecord(
  id: number,
  data: {
    name?: string;
    type?: string;
    ttl?: number;
    value?: string;
    routing_policy?: string;
    comment?: string;
  },
): Promise<DnsRecord> {
  return apiFetch<DnsRecord>(`/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRecord(id: number): Promise<void> {
  return apiFetch<void>(`/records/${id}`, { method: "DELETE" });
}

export async function bulkDeleteRecords(
  zoneId: number,
  recordIds: number[],
): Promise<{ deleted: number }> {
  return apiFetch<{ deleted: number }>(
    `/hosted-zones/${zoneId}/records/bulk-delete`,
    {
      method: "POST",
      body: JSON.stringify({ record_ids: recordIds }),
    },
  );
}
