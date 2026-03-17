import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TestCard } from "@/components/dashboard/TestCard";
import { SessionGenerator } from "@/components/dashboard/SessionGenerator";
import { LogTerminal } from "@/components/dashboard/LogTerminal";
import { MobileLogSheet } from "@/components/dashboard/MobileLogSheet";
import { LiveExecutionPanel } from "@/components/dashboard/LiveExecutionPanel";
import { useTestLogs } from "@/hooks/useTestLogs";
import { useTestRun } from "@/hooks/useTestRun";
import {
  Shield,
  UserCheck,
  Briefcase,
  FlaskConical,
} from "lucide-react";

const testSuites = [
  {
    title: "Sanity Tests",
    icon: <FlaskConical className="h-4 w-4 text-primary" />,
    subTests: [{ label: "Full Sanity Test", id: "CreateRequirementTest" }],
  },
  {
    title: "Auth Tests",
    icon: <Shield className="h-4 w-4 text-accent" />,
    subTests: [
      { label: "Vendor Auth", id: "VendorAuthTest" },
      { label: "Client Auth", id: "auth-client" },
      { label: "Admin Auth", id: "auth-admin" },
    ],
  },
  {
    title: "Onboarding Tests",
    icon: <UserCheck className="h-4 w-4 text-success" />,
    subTests: [
      { label: "Vendor Onboarding", id: "onboard-vendor" },
      { label: "Client Onboarding", id: "onboard-client" },
      { label: "Admin User Onboarding", id: "onboard-admin" },
    ],
  },
  {
    title: "Workflow Actions",
    icon: <Briefcase className="h-4 w-4 text-warning" />,
    subTests: [
      { label: "Requirement", id: "wf-requirement" },
      { label: "Assessment", id: "wf-assessment" },
      { label: "Assignment", id: "wf-assignment" },
      { label: "Interview", id: "wf-interview" },
      { label: "Offer", id: "wf-offer" },
    ],
  },
];

const Index = () => {
  const { clearLogs } = useTestLogs();
  const {
    activeRun,
    isLive,
    isSubscribed: runSubscribed,
    bottomRef: runBottomRef,
    startRun,
    closeLivePanel,
    copyLogs: copyRunLogs,
    downloadCsv,
  } = useTestRun();

  const handleTriggerTest = async (testId: string, testName: string) => {
    await clearLogs();
    await startRun(testId, testName);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full dark">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center border-b border-border bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Automation Health Dashboard
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                Realtime Connected
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-0 h-full">
              {/* Left: Test Cards */}
              <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
                <SessionGenerator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {testSuites.map((suite) => (
                    <TestCard
                      key={suite.title}
                      title={suite.title}
                      icon={suite.icon}
                      subTests={suite.subTests}
                      onTriggerTest={handleTriggerTest}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Log Terminal (desktop only) */}
              <div className="hidden lg:flex lg:w-[420px] xl:w-[500px] border-l border-border flex-col">
                <LogTerminal className="flex-1 rounded-none border-0" />
              </div>
            </div>
          </main>

          <MobileLogSheet />
        </div>
      </div>

      {/* Live Execution Overlay */}
      <LiveExecutionPanel
        run={activeRun}
        isLive={isLive}
        isSubscribed={runSubscribed}
        bottomRef={runBottomRef}
        onClose={closeLivePanel}
        onCopyLogs={copyRunLogs}
        onDownloadCsv={downloadCsv}
      />
    </SidebarProvider>
  );
};

export default Index;
