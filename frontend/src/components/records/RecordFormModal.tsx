"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RECORD_TYPES } from "@/types";

interface RecordFormData {
  name: string;
  type: string;
  ttl: number;
  value: string;
  routing_policy: string;
  comment: string;
}

interface RecordFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RecordFormData) => Promise<void>;
  initial?: RecordFormData;
  title: string;
  zoneName: string;
}

const defaultForm: RecordFormData = {
  name: "",
  type: "A",
  ttl: 300,
  value: "",
  routing_policy: "Simple",
  comment: "",
};

export function RecordFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  title,
  zoneName,
}: RecordFormModalProps) {
  const [form, setForm] = useState<RecordFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial || defaultForm);
      setError("");
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.value.trim()) {
      setError("Record name and value are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      wide
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--aws-text-secondary)]">
          Hosted zone: <strong>{zoneName}</strong>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">
              Record name <span className="text-[#d13212]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={`subdomain.${zoneName.replace(/\.$/, "")}`}
              className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Record type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">TTL (seconds)</label>
            <input
              type="number"
              value={form.ttl}
              onChange={(e) => setForm({ ...form, ttl: parseInt(e.target.value) || 300 })}
              min={1}
              className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Routing policy</label>
            <input
              type="text"
              value={form.routing_policy}
              readOnly
              className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded bg-gray-50 text-[var(--aws-text-secondary)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">
            Value <span className="text-[#d13212]">*</span>
          </label>
          <input
            type="text"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="192.0.2.1"
            className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Comment</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)] resize-none"
          />
        </div>
        {error && <p className="text-[#d13212] text-xs">{error}</p>}
      </form>
    </Modal>
  );
}
