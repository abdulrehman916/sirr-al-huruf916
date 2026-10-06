// ═══════════════════════════════════════════════════════════════
// SECTION D PAGE — Standalone card-based Holy Names library
//
// Wraps the reusable SectionDLibrary component in PageLayout for
// direct access via the /section-d route.
// ═══════════════════════════════════════════════════════════════
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionDLibrary from "@/components/sectiond/SectionDLibrary";
import SectionDVisualIntegrator from "@/components/sectiond/SectionDVisualIntegrator";
import SirrManuscriptLibrary from "@/components/sirr/SirrManuscriptLibrary";
import { useAuth } from "@/lib/AuthContext";
import { isAdminRole } from "@/lib/rbac";

export default function SectionDPage() {
  const { role } = useAuth();
  const canManage = isAdminRole(role);

  return (
    <PageLayout>
      <div className="space-y-3 pb-8 max-w-4xl mx-auto">
        <PageTitle
          arabic="القسم د"
          latin="Section D"
          subtitle="Holy Names Library — Du'a · Wazifa · Hirz · Salawat · Qur'an"
          icon="📜"
        />
        {canManage && <SectionDVisualIntegrator />}
        <SectionDLibrary />

        {/* Sirr Manuscript Library — migrated UI (reads SirrManuscriptBook/SirrManuscriptEntry) */}
        <SirrManuscriptLibrary />
      </div>
    </PageLayout>
  );
}