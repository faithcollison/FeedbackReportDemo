"use client"

import { useState } from "react"
import type { Tenant, ReportType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenants: Tenant[]
  selectedTenantId: string
  onCreateReport: (name: string, tenantId: string, reportType: ReportType) => void
}

export function CreateReportDialog({
  open,
  onOpenChange,
  tenants,
  selectedTenantId,
  onCreateReport,
}: CreateReportDialogProps) {
  const [name, setName] = useState("")
  const [tenantId, setTenantId] = useState(selectedTenantId)
  const [reportType, setReportType] = useState<ReportType>("candidate")

  const handleCreate = () => {
    if (!name.trim()) return
    onCreateReport(name.trim(), tenantId, reportType)
    setName("")
    setReportType("candidate")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Feedback Report</DialogTitle>
          <DialogDescription>
            Create a new feedback report for an assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="e.g. Senior Engineer Screen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-select">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger id="tenant-select" className="w-full">
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
          <div className="grid gap-3">
            <Label>Report Type</Label>
            <RadioGroup
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportType)}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="candidate" id="type-candidate" />
                <Label htmlFor="type-candidate" className="font-normal">
                  Candidate Report
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="hiring-manager" id="type-hm" />
                <Label htmlFor="type-hm" className="font-normal">
                  Hiring Manager Report
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
