"use client"

import { useState } from "react"
import type { FeedbackReport, ReportType } from "@/lib/types"
import { tenants, initialReports } from "@/lib/data"
import { AppHeader } from "./app-header"
import { ReportsList } from "./reports-list"
import ReportCanvas from "@/components/report-builder/report-canvas"

export function FeedbackReportsApp() {
  const [reports, setReports] = useState<FeedbackReport[]>(initialReports)
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0].id)
  const [currentReportId, setCurrentReportId] = useState<string | null>(null)

  const currentReport = currentReportId
    ? reports.find((r) => r.id === currentReportId) ?? null
    : null

  const handleCreateReport = (
    name: string,
    tenantId: string,
    reportType: ReportType
  ) => {
    const newReport: FeedbackReport = {
      id: `r${Date.now()}`,
      tenantId,
      name,
      reportType,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setReports((prev) => [...prev, newReport])
    setCurrentReportId(newReport.id)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader
        currentReport={currentReport}
        onNavigateHome={() => setCurrentReportId(null)}
      />
      {currentReport ? (
        <ReportCanvas />
      ) : (
        <ReportsList
          reports={reports}
          tenants={tenants}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
          onSelectReport={(report) => setCurrentReportId(report.id)}
          onCreateReport={handleCreateReport}
        />
      )}
    </div>
  )
}
