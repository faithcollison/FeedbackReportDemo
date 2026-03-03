export type ReportType = "candidate" | "hiring-manager"

export interface Tenant {
  id: string
  name: string
}

export interface FeedbackReport {
  id: string
  tenantId: string
  name: string
  reportType: ReportType
  createdAt: string
  sendOnCompletion: boolean
  useCustomEmailTemplate: boolean
  sendgridTemplateId: string
}
