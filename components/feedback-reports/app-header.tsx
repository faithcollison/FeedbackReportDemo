"use client"

import type { FeedbackReport } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
  return (
    <header className="border-b border-[#9ccbb4] bg-[#8fc0a7] px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            {currentReport && onNavigateBack && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigateBack()
                    }}
                    className="text-base font-semibold text-[#1f2937]"
                  >
                    Assessment Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              {currentReport ? (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigateHome()
                  }}
                  className="text-base font-semibold text-[#1f2937]"
                >
                  Feedback Reports
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-base font-semibold text-[#1f2937]">
                  Feedback Reports
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {currentReport && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base text-[#1f2937]">
                    {currentReport.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {!currentReport && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base text-[#1f2937]">
                    {assessmentName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {currentReport && onNavigateBack && (
          <Button
            variant="outline"
            className="h-9 rounded-full border-0 bg-[#3c3d41] px-5 text-sm text-white hover:bg-[#2f3033] hover:text-white"
            onClick={onNavigateBack}
          >
            Back
          </Button>
        )}
      </div>
    </header>
  )
}
