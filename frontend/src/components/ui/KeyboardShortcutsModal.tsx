"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["/"], description: "Focus search bar" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close open dialog" },
];

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <table className="w-full text-sm">
        <tbody>
          {shortcuts.map((s) => (
            <tr key={s.description} className="border-b border-[var(--aws-border)]">
              <td className="py-2 pr-4">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 bg-[var(--aws-bg)] border border-[var(--aws-border)] rounded text-xs font-mono mr-1"
                  >
                    {k}
                  </kbd>
                ))}
              </td>
              <td className="py-2 text-[var(--aws-text-secondary)]">{s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
