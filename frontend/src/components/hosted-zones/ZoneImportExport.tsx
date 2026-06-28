"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  exportHostedZone,
  importBindZone,
} from "@/lib/api/hosted-zones";
import type { HostedZone } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ZoneImportExportProps {
  zone: HostedZone;
  onImportComplete?: () => void;
}

export function ZoneImportExport({ zone, onImportComplete }: ZoneImportExportProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = async () => {
    try {
      const data = await exportHostedZone(zone.id, "json");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `${zone.name.replace(/\.$/, "")}.json`);
      toast.success("Zone exported as JSON");
    } catch {
      toast.error("Failed to export zone");
    }
  };

  const handleExportBind = async () => {
    try {
      const text = await exportHostedZone(zone.id, "bind");
      const blob = new Blob([text as string], { type: "text/plain" });
      downloadBlob(blob, `${zone.name.replace(/\.$/, "")}.zone`);
      toast.success("Zone exported as BIND");
    } catch {
      toast.error("Failed to export zone");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportContent((ev.target?.result as string) || "");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!importContent.trim()) {
      toast.error("Paste or upload a BIND zone file first");
      return;
    }
    setImportLoading(true);
    try {
      const result = await importBindZone(zone.id, importContent);
      toast.success(`Imported ${result.imported} record(s)`);
      if (result.skipped > 0) {
        toast.warning(`Skipped ${result.skipped} record(s)`);
      }
      setImportOpen(false);
      setImportContent("");
      onImportComplete?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => setImportOpen(true)}>Import BIND</Button>
        <Button onClick={handleExportJson}>Export JSON</Button>
        <Button onClick={handleExportBind}>Export BIND</Button>
      </div>

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import BIND zone file"
        wide
        footer={
          <>
            <Button onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={importLoading} onClick={handleImport}>
              Import records
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--aws-text-secondary)]">
            Import DNS records from a BIND zone file into <strong>{zone.name}</strong>.
            Existing records are not removed.
          </p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zone,.txt,.bind"
              onChange={handleFileSelect}
              className="text-sm"
            />
          </div>
          <textarea
            value={importContent}
            onChange={(e) => setImportContent(e.target.value)}
            rows={12}
            placeholder={"$ORIGIN example.com.\n$TTL 300\nwww  IN  A  192.0.2.1"}
            className="w-full px-3 py-2 text-sm font-mono border border-[var(--aws-border)] rounded bg-[var(--aws-bg)] text-[var(--aws-text)] focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)] resize-none"
          />
        </div>
      </Modal>
    </>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
