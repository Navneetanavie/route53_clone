"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createHostedZone,
  deleteHostedZone,
  listHostedZones,
  updateHostedZone,
} from "@/lib/api/hosted-zones";
import type { HostedZone } from "@/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ZoneFormModal } from "./ZoneFormModal";

export function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editZone, setEditZone] = useState<HostedZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<HostedZone | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHostedZones({
        page,
        page_size: 10,
        search: debouncedSearch || undefined,
        sort_by: "name",
        sort_order: "asc",
      });
      setZones(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load hosted zones");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleCreate = async (data: { name: string; comment: string }) => {
    await createHostedZone(data);
    toast.success("Hosted zone created successfully");
    fetchZones();
  };

  const handleUpdate = async (data: { name: string; comment: string }) => {
    if (!editZone) return;
    await updateHostedZone(editZone.id, data);
    toast.success("Hosted zone updated successfully");
    setEditZone(null);
    fetchZones();
  };

  const handleDelete = async () => {
    if (!deleteZone) return;
    setDeleteLoading(true);
    try {
      await deleteHostedZone(deleteZone.id);
      toast.success("Hosted zone deleted successfully");
      setDeleteZone(null);
      fetchZones();
    } catch {
      toast.error("Failed to delete hosted zone");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Route 53" }, { label: "Hosted zones" }]}
      />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--aws-text)]">Hosted zones</h1>
          <p className="text-sm text-[var(--aws-text-secondary)] mt-1">
            A hosted zone is a container for DNS records.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          Create hosted zone
        </Button>
      </div>

      <div className="bg-[var(--aws-card)] border border-[var(--aws-border)] rounded shadow-sm">
        <div className="px-4 py-3 border-b border-[var(--aws-border)]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Filter hosted zones by name"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : zones.length === 0 ? (
          <EmptyState
            title="No hosted zones"
            description={
              debouncedSearch
                ? "No hosted zones match your search."
                : "Create a hosted zone to get started with DNS management."
            }
            actionLabel={debouncedSearch ? undefined : "Create hosted zone"}
            onAction={debouncedSearch ? undefined : () => setCreateOpen(true)}
            icon="🌐"
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header border-b border-[var(--aws-border)] text-left">
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Hosted zone name
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Record count
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)]">
                    Comment
                  </th>
                  <th className="px-4 py-2 font-bold text-[var(--aws-text-secondary)] w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr
                    key={zone.id}
                    className="border-b border-[var(--aws-border)] table-row-hover cursor-pointer"
                    onClick={() => router.push(`/hosted-zones/${zone.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-[var(--aws-blue)] hover:underline font-medium">
                        {zone.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--aws-text-secondary)]">
                      {zone.record_count}
                    </td>
                    <td className="px-4 py-3 text-[var(--aws-text-secondary)] truncate max-w-xs">
                      {zone.comment || "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        items={[
                          {
                            label: "Edit",
                            onClick: () => setEditZone(zone),
                          },
                          {
                            label: "Delete",
                            onClick: () => setDeleteZone(zone),
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

      <ZoneFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        title="Create hosted zone"
      />

      <ZoneFormModal
        open={!!editZone}
        onClose={() => setEditZone(null)}
        onSubmit={handleUpdate}
        initial={
          editZone
            ? { name: editZone.name, comment: editZone.comment || "" }
            : undefined
        }
        title="Edit hosted zone"
      />

      <ConfirmDialog
        open={!!deleteZone}
        title="Delete hosted zone"
        message={`Are you sure you want to delete "${deleteZone?.name}"? All DNS records in this hosted zone will also be deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteZone(null)}
        loading={deleteLoading}
      />
    </>
  );
}
