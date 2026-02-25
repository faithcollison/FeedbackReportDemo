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
      sendOnCompletion: false,
    }
    setReports((prev) => [...prev, newReport])
    setCurrentReportId(newReport.id)
  }

  const handleSetSendOnCompletion = (reportId: string, enabled: boolean) => {
    setReports((prev) => {
      const target = prev.find((r) => r.id === reportId)
      if (!target) return prev
      if (target.reportType !== "candidate") {
        return prev.map((report) =>
          report.id === reportId
            ? { ...report, sendOnCompletion: false }
            : report
        )
      }

      return prev.map((report) => {
        if (report.id === reportId) {
          return { ...report, sendOnCompletion: enabled }
        }
        if (
          enabled &&
          report.tenantId === target.tenantId &&
          report.name === target.name &&
          report.reportType !== target.reportType
        ) {
          return { ...report, sendOnCompletion: false }
        }
        return report
      })
    })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader
        currentReport={currentReport}
        onNavigateHome={() => setCurrentReportId(null)}
      />
      {currentReport ? (
        <ReportCanvas reportId={currentReport.id} />
      ) : (
        <ReportsList
          reports={reports}
          tenants={tenants}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
          onSelectReport={(report) => setCurrentReportId(report.id)}
          onCreateReport={handleCreateReport}
          onSetSendOnCompletion={handleSetSendOnCompletion}
        />
      )}
    </div>
  )
}
