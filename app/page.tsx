"use client"

import { useState } from "react"
import { FeedbackReportsApp } from "../components/feedback-reports/feedback-reports-app"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MockAssessment {
  id: string
  name: string
  createdAt: string
  lastCompletion: string
  totalCompletions: number
}

const mockAssessments: MockAssessment[] = [
  {
    id: "a1",
    name: "AAA New Item Assessment Test",
    createdAt: "17/08/2023 20:30:00",
    lastCompletion: "04/09/2025 13:06:52",
    totalCompletions: 2,
  },
  {
    id: "a2",
    name: "Aja test (original)",
    createdAt: "14/08/2025 15:29:30",
    lastCompletion: "26/08/2025 14:42:34",
    totalCompletions: 5,
  },
  {
    id: "a3",
    name: "Aja test (original)_Clone",
    createdAt: "14/08/2025 15:41:48",
    lastCompletion: "No completions",
    totalCompletions: 0,
  },
  {
    id: "a4",
    name: "Demo Assessment v1.7",
    createdAt: "18/08/2023 10:18:34",
    lastCompletion: "11/09/2025 16:06:47",
    totalCompletions: 109,
  },
]

export default function Page() {
  const [selectedAssessment, setSelectedAssessment] = useState<MockAssessment | null>(null)

  if (selectedAssessment) {
    return (
      <FeedbackReportsApp
        key={selectedAssessment.id}
        assessmentName={selectedAssessment.name}
        onNavigateBack={() => setSelectedAssessment(null)}
      />
    )
  }

  return (
    <div className="min-h-svh bg-[#e7e7e7]">
      <header className="border-b border-[#9ccbb4] bg-[#8fc0a7] px-6 py-4">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="text-[1.1rem] font-semibold tracking-tight text-[#1f2937]">Assessment Management</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="space-y-4">
          {mockAssessments.map((assessment) => (
            <Card key={assessment.id} className="border-[#d5d5d5] bg-[#ededed]">
              <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-2">
                  <h2 className="text-[1rem] font-semibold text-[#334155]">{assessment.name}</h2>
                  <p className="text-[0.78rem] text-[#64748b]">Created date : {assessment.createdAt}</p>
                  <p className="text-[0.78rem] text-[#64748b]">Last completion : {assessment.lastCompletion}</p>
                  <p className="pt-1 text-[0.95rem] font-semibold text-[#475569]">
                    Total Completions : {assessment.totalCompletions}
                  </p>
                </div>
                <Button
                  className="h-9 px-4 bg-[#3c3d41] text-sm text-white hover:bg-[#2f3033]"
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  Feedback Reports
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
