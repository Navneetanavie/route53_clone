"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getHostedZone } from "@/lib/api/hosted-zones";
import type { HostedZone } from "@/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RecordsTable } from "@/components/records/RecordsTable";
import { ZoneImportExport } from "./ZoneImportExport";

export function HostedZoneDetailPage() {
  const params = useParams();
  const zoneId = Number(params.id);
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchZone = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHostedZone(zoneId);
      setZone(data);
    } catch {
      toast.error("Failed to load hosted zone");
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    if (!isNaN(zoneId)) fetchZone();
  }, [zoneId, fetchZone]);

  if (loading) return <LoadingSpinner label="Loading hosted zone..." />;
  if (!zone) {
    return (
      <div className="text-center py-16 text-[var(--aws-text-secondary)]">
        Hosted zone not found.
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Route 53" },
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone.name },
        ]}
      />
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold">{zone.name}</h1>
        <ZoneImportExport zone={zone} onImportComplete={fetchZone} />
      </div>

      <div className="surface border rounded shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-[var(--aws-text-secondary)] uppercase tracking-wide mb-4">
          Hosted zone details
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm max-w-2xl">
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Hosted zone name</dt>
            <dd className="font-medium mt-1">{zone.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Hosted zone ID</dt>
            <dd className="font-medium mt-1 font-mono text-xs">{zone.id}</dd>
          </div>
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Record count</dt>
            <dd className="font-medium mt-1">{zone.record_count}</dd>
          </div>
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Comment</dt>
            <dd className="font-medium mt-1">{zone.comment || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Created</dt>
            <dd className="font-medium mt-1">
              {new Date(zone.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--aws-text-secondary)]">Last modified</dt>
            <dd className="font-medium mt-1">
              {new Date(zone.updated_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <RecordsTable zone={zone} onRecordsChange={fetchZone} />
    </>
  );
}
