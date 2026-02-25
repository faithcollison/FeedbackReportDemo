import type { Tenant, FeedbackReport } from "./types"

export const tenants: Tenant[] = [
  { id: "t1", name: "Acme Corp" },
]

export const initialReports: FeedbackReport[] = [
  {
    id: "r1",
    tenantId: "t1",
    name: "Example Assessment 1",
    reportType: "candidate",
    createdAt: "2025-11-15",
  },
  {
    id: "r2",
    tenantId: "t1",
    name: "Example Assessment 2",
    reportType: "hiring-manager",
    createdAt: "2025-12-03",
  },
  {
    id: "r3",
    tenantId: "t1",
    name: "Senior Engineer Screen",
    reportType: "candidate",
    createdAt: "2026-01-10",
  },
]
