import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function HealthChecksPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Route 53" }, { label: "Health checks" }]} />
      <h1 className="text-2xl font-bold mb-6">Health checks</h1>
      <div className="bg-white border border-[var(--aws-border)] rounded shadow-sm p-12 text-center">
        <p className="text-lg text-[var(--aws-text-secondary)]">Coming Soon</p>
      </div>
    </>
  );
}
