"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteRecords,
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
} from "@/lib/api/records";
import type { DnsRecord, HostedZone } from "@/types";
import { RECORD_TYPES } from "@/types";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { RecordFormModal } from "./RecordFormModal";

interface RecordsTableProps {
  zone: HostedZone;
  onRecordsChange?: () => void;
}

export function RecordsTable({ zone, onRecordsChange }: RecordsTableProps) {
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DnsRecord | null>(null);
  const [deleteRecordTarget, setDeleteRecordTarget] = useState<DnsRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  useEffect(() => {
    setSelected(new Set());
  }, [page, debouncedSearch, typeFilter]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRecords(zone.id, {
        page,
        page_size: 10,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        sort_by: "name",
        sort_order: "asc",
      });
      setRecords(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load DNS records");
    } finally {
      setLoading(false);
    }
  }, [zone.id, page, debouncedSearch, typeFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === records.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(records.map((r) => r.id)));
    }
  };

  const handleCreate = async (data: {
    name: string;
    type: string;
    ttl: number;
    value: string;
    routing_policy: string;
    comment: string;
  }) => {
    await createRecord(zone.id, data);
    toast.success("Record created successfully");
    fetchRecords();
    onRecordsChange?.();
  };

  const handleUpdate = async (data: {
    name: string;
    type: string;
    ttl: number;
    value: string;
    routing_policy: string;
    comment: string;
  }) => {
    if (!editRecord) return;
    await updateRecord(editRecord.id, data);
    toast.success("Record updated successfully");
    setEditRecord(null);
    fetchRecords();
    onRecordsChange?.();
  };

  const handleDelete = async () => {
    if (!deleteRecordTarget) return;
    setDeleteLoading(true);
    try {
      await deleteRecord(deleteRecordTarget.id);
      toast.success("Record deleted successfully");
      setDeleteRecordTarget(null);
      fetchRecords();
      onRecordsChange?.();
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      const result = await bulkDeleteRecords(zone.id, Array.from(selected));
      toast.success(`Deleted ${result.deleted} record(s)`);
      setBulkDeleteOpen(false);
      setSelected(new Set());
      fetchRecords();
      onRecordsChange?.();
    } catch {
      toast.error("Failed to delete selected records");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Records</h2>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="danger" onClick={() => setBulkDeleteOpen(true)}>
              Delete selected ({selected.size})
            </Button>
          )}
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            Create record
          </Button>
        </div>
      </div>

      <div className="surface border rounded shadow-sm">
        <div className="px-4 py-3 border-b border-[var(--aws-border)] flex flex-wrap items-center gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Filter records by name"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--aws-text-secondary)]">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-[var(--aws-border)] rounded bg-[var(--aws-card)] text-[var(--aws-text)] focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
            >
              <option value="">All types</option>
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <EmptyState
            title="No records"
            description={
              debouncedSearch || typeFilter
                ? "No records match your filters."
                : "Create a DNS record for this hosted zone."
            }
            actionLabel={debouncedSearch || typeFilter ? undefined : "Create record"}
            onAction={
              debouncedSearch || typeFilter ? undefined : () => setCreateOpen(true)
            }
            icon="📋"
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header border-b border-[var(--aws-border)] text-left">
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === records.length && records.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all records on page"
                    />
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Record name
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Type
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Routing policy
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Value/Route traffic to
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    TTL (seconds)
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)] w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[var(--aws-border)] table-row-hover"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        aria-label={`Select ${record.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{record.name}</td>
                    <td className="px-4 py-3">
                      <span className="badge-type px-2 py-0.5 rounded text-xs font-medium">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--aws-text-secondary)]">
                      {record.routing_policy}
                    </td>
                    <td className="px-4 py-3 text-[var(--aws-text-secondary)] max-w-xs truncate">
                      {record.value}
                    </td>
                    <td className="px-4 py-3 text-[var(--aws-text-secondary)]">
                      {record.ttl}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        items={[
                          {
                            label: "Edit",
                            onClick: () => setEditRecord(record),
                          },
                          {
                            label: "Delete",
                            onClick: () => setDeleteRecordTarget(record),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={10}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <RecordFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        title="Create record"
        zoneName={zone.name}
      />

      <RecordFormModal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        onSubmit={handleUpdate}
        initial={
          editRecord
            ? {
                name: editRecord.name,
                type: editRecord.type,
                ttl: editRecord.ttl,
                value: editRecord.value,
                routing_policy: editRecord.routing_policy,
                comment: editRecord.comment || "",
              }
            : undefined
        }
        title="Edit record"
        zoneName={zone.name}
      />

      <ConfirmDialog
        open={!!deleteRecordTarget}
        title="Delete record"
        message={`Are you sure you want to delete the record "${deleteRecordTarget?.name}" (${deleteRecordTarget?.type})?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteRecordTarget(null)}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected records"
        message={`Are you sure you want to delete ${selected.size} selected record(s)? This action cannot be undone.`}
        confirmLabel="Delete all"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkDeleteLoading}
      />
    </>
  );
}
