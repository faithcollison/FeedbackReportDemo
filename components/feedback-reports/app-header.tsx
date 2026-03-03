"use client"

import type { FeedbackReport } from "@/lib/types"
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
  onNavigateHome: () => void
}

export function AppHeader({ currentReport, onNavigateHome }: AppHeaderProps) {
  return (
    <header className="border-b border-[#9ccbb4] bg-[#8fc0a7] px-6 py-4">
      <Breadcrumb>
        <BreadcrumbList>
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
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
