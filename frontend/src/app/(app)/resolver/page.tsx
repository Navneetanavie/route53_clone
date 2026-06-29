import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ResolverPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Route 53" }, { label: "Resolver" }]} />
      <h1 className="text-2xl font-bold mb-6">Resolver</h1>
      <div className="bg-[var(--aws-card)] border border-[var(--aws-border)] rounded shadow-sm p-12 text-center">
        <p className="text-lg text-[var(--aws-text-secondary)]">Coming Soon</p>
      </div>
    </>
  );
}
