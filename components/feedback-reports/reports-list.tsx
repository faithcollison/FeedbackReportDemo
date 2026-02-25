"use client"

import { useState } from "react"
import type { FeedbackReport, Tenant, ReportType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateReportDialog } from "./create-report-dialog"
import { Plus, FileText, User, Briefcase } from "lucide-react"

interface ReportsListProps {
  reports: FeedbackReport[]
  tenants: Tenant[]
  selectedTenantId: string
  onSelectTenant: (tenantId: string) => void
  onSelectReport: (report: FeedbackReport) => void
  onCreateReport: (name: string, tenantId: string, reportType: ReportType) => void
}

export function ReportsList({
  reports,
  tenants,
  selectedTenantId,
  onSelectTenant,
  onSelectReport,
  onCreateReport,
}: ReportsListProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const filteredReports = reports.filter((r) => r.tenantId === selectedTenantId)

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Tenant</label>
          <Select value={selectedTenantId} onValueChange={onSelectTenant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New Report
        </Button>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 size-10 text-muted-foreground" />
            <p className="text-lg font-medium">No feedback reports yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first report to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => onSelectReport(report)}
            >
              <CardHeader className="flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                    {report.reportType === "candidate" ? (
                      <User className="size-4 text-muted-foreground" />
                    ) : (
                      <Briefcase className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Created {report.createdAt}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {report.reportType === "candidate"
                    ? "Candidate"
                    : "Hiring Manager"}
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <CreateReportDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenants={tenants}
        selectedTenantId={selectedTenantId}
        onCreateReport={onCreateReport}
      />
    </div>
  )
}
