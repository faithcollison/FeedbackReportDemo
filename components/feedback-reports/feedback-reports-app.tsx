"use client"

import { useState } from "react"
import type { FeedbackReport, ReportType } from "@/lib/types"
import { tenants, initialReports } from "@/lib/data"
import { AppHeader } from "./app-header"
import { ReportsList } from "./reports-list"
import ReportCanvas from "@/components/report-builder/report-canvas"

export function FeedbackReportsApp() {
  const [reports, setReports] = useState<FeedbackReport[]>(initialReports)
  const selectedTenantId = tenants[0]?.id ?? ""
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
      useCustomEmailTemplate: false,
      sendgridTemplateId: "",
    }
    setReports((prev) => [...prev, newReport])
    setCurrentReportId(newReport.id)
  }

  const handleUpdateReport = (
    reportId: string,
    patch: Partial<Pick<FeedbackReport, "reportType" | "sendOnCompletion" | "useCustomEmailTemplate" | "sendgridTemplateId">>
  ) => {
    setReports((prev) => {
      const target = prev.find((r) => r.id === reportId)
      if (!target) return prev
      const nextReportType = patch.reportType ?? target.reportType

      return prev.map((report) => {
        if (report.id === reportId) {
          const nextReport = { ...report, ...patch }
          if (nextReportType !== "candidate") {
            nextReport.sendOnCompletion = false
          }
          return nextReport
        }
        if (
          patch.sendOnCompletion === true &&
          report.tenantId === target.tenantId &&
          report.name === target.name &&
          report.reportType !== nextReportType
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
        <ReportCanvas report={currentReport} onUpdateReport={handleUpdateReport} />
      ) : (
        <ReportsList
          reports={reports}
          tenants={tenants}
          selectedTenantId={selectedTenantId}
          onSelectReport={(report) => setCurrentReportId(report.id)}
          onCreateReport={handleCreateReport}
        />
      )}
    </div>
  )
}
