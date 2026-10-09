// ═══════════════════════════════════════════════════════════════
// SECTION D PAGE — Standalone card-based Holy Names library
//
// Wraps the reusable SectionDLibrary component in PageLayout for
// direct access via the /section-d route.
// ═══════════════════════════════════════════════════════════════
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionDLibrary from "@/components/sectiond/SectionDLibrary";

export default function SectionDPage() {

  return (
    <PageLayout>
      <div className="space-y-3 pb-8 max-w-4xl mx-auto">
        <PageTitle
          arabic="القسم د"
          latin="Section D"
          icon="📜"
        />
        <SectionDLibrary />

      </div>
    </PageLayout>
  );
}