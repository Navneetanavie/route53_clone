import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function DashboardPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Route 53" }, { label: "Dashboard" }]} />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white border border-[var(--aws-border)] rounded shadow-sm p-12 text-center">
        <p className="text-lg text-[var(--aws-text-secondary)]">Coming Soon</p>
        <p className="text-sm text-[var(--aws-text-secondary)] mt-2">
          Route 53 dashboard overview will be available here.
        </p>
      </div>
    </>
  );
}
