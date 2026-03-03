import type { Tenant, FeedbackReport } from "./types";

export const tenants: Tenant[] = [{ id: "t1", name: "Neurosight" }];

export const initialReports: FeedbackReport[] = [
  {
    id: "r1",
    tenantId: "t1",
    name: "Candidate Feedback Report",
    reportType: "candidate",
    createdAt: "2025-11-15",
    sendOnCompletion: false,
    useCustomEmailTemplate: false,
    sendgridTemplateId: "",
  },
  {
    id: "r2",
    tenantId: "t1",
    name: "Hiring Manager Feedback Report",
    reportType: "hiring-manager",
    createdAt: "2025-12-03",
    sendOnCompletion: false,
    useCustomEmailTemplate: false,
    sendgridTemplateId: "",
  },
];
