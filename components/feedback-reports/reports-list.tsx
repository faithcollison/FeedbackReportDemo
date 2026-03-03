"use client";

import { useState } from "react";
import type { FeedbackReport, Tenant, ReportType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateReportDialog } from "./create-report-dialog";
import { Plus, FileText, User, Briefcase } from "lucide-react";

interface ReportsListProps {
  reports: FeedbackReport[];
  tenants: Tenant[];
  selectedTenantId: string;
  assessmentName: string;
  onSelectReport: (report: FeedbackReport) => void;
  onCreateReport: (
    name: string,
    tenantId: string,
    reportType: ReportType,
  ) => void;
}

export function ReportsList({
  reports,
  tenants,
  selectedTenantId,
  assessmentName,
  onSelectReport,
  onCreateReport,
}: ReportsListProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const filteredReports = reports.filter(
    (r) => r.tenantId === selectedTenantId,
  );

  return (
    <div className="min-h-[calc(100svh-50px)] bg-[#e7e7e7]">
      <div className=" left-0 right-0 top-[50px] z-40 border-b border-[#9ccbb4] bg-[#acd7c1]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-[#1f2937]">
              For assessment: {assessmentName}
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#3c3d41] text-white hover:bg-[#2f3033]"
          >
            <Plus />
            New Report
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-6 pt-3">
        {filteredReports.length === 0 ? (
          <Card className="border-[#d5d5d5] bg-[#ededed]">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 size-10 text-[#64748b]" />
              <p className="text-lg font-medium text-[#1f2937]">
                No feedback reports yet
              </p>
              <p className="text-sm text-[#64748b]">
                Create your first report to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer border-[#d5d5d5] bg-[#ededed] transition-colors hover:bg-[#e5e5e5]"
                onClick={() => onSelectReport(report)}
              >
                <CardHeader className="flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-[#dfe7e2]">
                      {report.reportType === "candidate" ? (
                        <User className="size-4 text-[#355046]" />
                      ) : (
                        <Briefcase className="size-4 text-[#355046]" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#1f2937]">
                        {report.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#64748b]">
                        Created {report.createdAt}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#92c99b] text-[#153a2f] hover:bg-[#87bc90]">
                      {report.reportType === "candidate"
                        ? "Candidate"
                        : "Hiring Manager"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateReportDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenants={tenants}
        selectedTenantId={selectedTenantId}
        onCreateReport={onCreateReport}
      />
    </div>
  );
}
