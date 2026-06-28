export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Session {
  username: string;
}

export interface HostedZone {
  id: number;
  name: string;
  comment: string | null;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface DnsRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: string;
  ttl: number;
  value: string;
  routing_policy: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export const RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "CAA",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  type?: string;
}
