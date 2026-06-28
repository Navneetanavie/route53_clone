"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ZoneFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; comment: string }) => Promise<void>;
  initial?: { name: string; comment: string };
  title: string;
}

export function ZoneFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  title,
}: ZoneFormModalProps) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name?.replace(/\.$/, "") || "");
      setComment(initial?.comment || "");
      setError("");
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Domain name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), comment: comment.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hosted zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
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
        <div>
          <label className="block text-sm font-bold mb-1">
            Domain name <span className="text-[#d13212]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)]"
          />
          {error && <p className="text-[#d13212] text-xs mt-1">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Optional description"
            className="w-full px-3 py-2 text-sm border border-[var(--aws-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)] resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
