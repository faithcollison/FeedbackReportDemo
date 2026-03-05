"use client"

import { useEffect, useState } from "react"
import type { FeedbackReport } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Eye, Save } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const TEMPLATE_STORAGE_KEY = "report-builder-templates"

interface HeaderTemplateItem {
  id: string
  name: string
}

interface AppHeaderProps {
  currentReport: FeedbackReport | null
  assessmentName: string
  onNavigateHome: () => void
  onNavigateBack?: () => void
}

export function AppHeader({
  currentReport,
  assessmentName,
  onNavigateHome,
  onNavigateBack,
}: AppHeaderProps) {
  const [templates, setTemplates] = useState<HeaderTemplateItem[]>([])

  useEffect(() => {
    function loadTemplates() {
      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY)
      if (!raw) {
        setTemplates([])
        return
      }

      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
          setTemplates([])
          return
        }

        const valid = parsed.filter(
          (item): item is HeaderTemplateItem =>
            !!item && typeof item.id === "string" && typeof item.name === "string"
        )
        setTemplates(valid)
      } catch {
        setTemplates([])
      }
    }

    loadTemplates()
    window.addEventListener("report-builder:templates-updated", loadTemplates)
    window.addEventListener("storage", loadTemplates)
    return () => {
      window.removeEventListener("report-builder:templates-updated", loadTemplates)
      window.removeEventListener("storage", loadTemplates)
    }
  }, [])

  if (currentReport) {
    return (
      <header className="border-b border-[#9ccbb4] bg-[#8fc0a7] px-4 py-2">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <p className="text-sm text-[#2b3b39]">For assessment: {assessmentName}</p>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 border border-[#7fa98f] bg-white px-3 text-xs text-[#30443f] hover:bg-[#f4f8f6]"
              onClick={() => {
                window.dispatchEvent(new Event("report-builder:open-preview"))
              }}
            >
              <Eye className="mr-1.5 size-3.5" />
              Preview Report
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 border border-[#7fa98f] bg-white px-3 text-xs text-[#30443f] hover:bg-[#f4f8f6]">
                  Import Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {templates.length === 0 ? (
                  <DropdownMenuItem disabled>No templates found</DropdownMenuItem>
                ) : (
                  templates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("report-builder:import-template", {
                            detail: { templateId: template.id },
                          })
                        )
                      }}
                    >
                      {template.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="h-8 border border-[#3f6d54] bg-[#4f7f64] px-3 text-xs text-white hover:bg-[#456f58]"
              onClick={() => {
                window.dispatchEvent(new Event("report-builder:save-template"))
              }}
            >
              <Save className="mr-1.5 size-3.5" />
              Save Report Template
            </Button>
            {onNavigateBack && (
              <Button
                variant="outline"
                className="h-8 border-[#3f6d54] bg-[#5b876f] px-3 text-xs text-white hover:bg-[#4f7b63]"
                onClick={onNavigateBack}
              >
                Back
              </Button>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-[#9ccbb4] bg-[#8fc0a7] px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base font-semibold text-[#1f2937]">Feedback Reports</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base text-[#1f2937]">{assessmentName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          variant="outline"
          className="h-9 rounded-full border-0 bg-[#3c3d41] px-5 text-sm text-white hover:bg-[#2f3033] hover:text-white"
          onClick={onNavigateHome}
        >
          Manage Reports
        </Button>
      </div>
    </header>
  )
}
