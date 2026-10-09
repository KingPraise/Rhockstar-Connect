import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import MobileHeader from "@/components/layout/MobileHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ImageLightbox from "@/components/ui/ImageLightbox";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import PresenceHeartbeat from "@/components/layout/PresenceHeartbeat";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import DashboardThemeContainer from "@/components/layout/DashboardThemeContainer";
import ScrollPaddingController from "@/components/layout/ScrollPaddingController";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeContainer>
      <PresenceHeartbeat />
      
      {/* Mobile Top Navigation Header */}
      <MobileHeader />
      <ScrollPaddingController />

      {/* Sidebar Layout for Desktop (Stationary) */}
      <Sidebar />

      {/* Main Content Area (Independently Scrollable) */}
      <main id="main-scroll-container" className="flex-1 h-full overflow-y-auto w-full p-0 pt-20 md:p-8 md:pt-8 md:pb-8 relative z-10 custom-scrollbar"
        style={{ paddingBottom: "var(--dynamic-bottom-padding, 6rem)" }}>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      
      {/* Global Image Lightbox */}
      <ImageLightbox />

      {/* Global Search Modal */}
      <GlobalSearchModal />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
    </DashboardThemeContainer>
  );
}


