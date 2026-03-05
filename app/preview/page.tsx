"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronDown, Eye, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportSection {
  id: string
  type: string
  label: string
}

interface SectionStyle {
  content?: string
  titleText?: string
  titleBgColor?: string
}

interface ConstructData {
  strengths: string
  weaknesses: string
}

interface PreviewData {
  sections: ReportSection[]
  constructData: Record<string, ConstructData>
  sectionStyles: Record<string, SectionStyle>
}

interface ConstructBankEntry {
  id: string
  name: string
  strengths: string
  weaknesses: string
}

const CONSTRUCT_BANK_STORAGE_KEY = "report-builder-construct-bank"

const FALLBACK_STRENGTH_TEXT =
  "Demonstrates strong assertiveness in professional settings, with confidence in communicating ideas and decisions."

const FALLBACK_WEAKNESS_TEXT =
  "Could improve attention to detail by introducing a structured review routine before final submission."

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null)
  const [constructBankEntries, setConstructBankEntries] = useState<ConstructBankEntry[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("report-preview-data")
    if (raw) {
      try {
        setData(JSON.parse(raw))
      } catch {
        // ignore parse errors
      }
    }

    const constructBankRaw = localStorage.getItem(CONSTRUCT_BANK_STORAGE_KEY)
    if (constructBankRaw) {
      try {
        const parsed = JSON.parse(constructBankRaw)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is ConstructBankEntry =>
              !!item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.strengths === "string" &&
              typeof item.weaknesses === "string"
          )
          setConstructBankEntries(valid)
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  const derived = useMemo(() => {
    const sections = data?.sections ?? []
    const styles = data?.sectionStyles ?? {}

    const header = sections.find((s) => s.type === "header")
    const headerStyle = header ? styles[header.id] : undefined

    const introductionSections = sections.filter((s) => s.type === "paragraph").slice(0, 3)

    const strengthGroup = sections.find((s) => s.type === "strengths-group")
    const strengthStyle = strengthGroup ? styles[strengthGroup.id] : undefined

    const developmentGroup = sections.find((s) => s.type === "development-group")
    const developmentStyle = developmentGroup ? styles[developmentGroup.id] : undefined

    const bankStrength = constructBankEntries.find((entry) => entry.strengths.trim())?.strengths
    const bankWeakness = constructBankEntries.find((entry) => entry.weaknesses.trim())?.weaknesses

    const constructStrength =
      Object.values(data?.constructData ?? {}).find((value) => value.strengths.trim())?.strengths ?? ""
    const constructWeakness =
      Object.values(data?.constructData ?? {}).find((value) => value.weaknesses.trim())?.weaknesses ?? ""

    return {
      reportTitle: headerStyle?.titleText || "Feedback report for Candidate Name",
      titleColor: headerStyle?.titleBgColor || "#457b58",
      introductionSections:
        introductionSections.length > 0
          ? introductionSections
          : [
              { id: "i1", type: "paragraph", label: "Introduction Section 1" },
              { id: "i2", type: "paragraph", label: "Introduction Section 2" },
              { id: "i3", type: "paragraph", label: "Introduction Section 3" },
            ],
      strengthIntro:
        strengthStyle?.content ||
        "The following areas represent your greatest strengths based on your assessment results:",
      developmentIntro:
        developmentStyle?.content ||
        "The following areas have been identified as opportunities for development:",
      strengthText: bankStrength || constructStrength || FALLBACK_STRENGTH_TEXT,
      weaknessText: bankWeakness || constructWeakness || FALLBACK_WEAKNESS_TEXT,
    }
  }, [constructBankEntries, data])

  return (
    <div className="min-h-screen bg-[#dbe5e1] text-[#1f2937]">
      <header className="border-b border-[#7db392] bg-[#8fc0a7] px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#2b3b39]">For assessment: Demo Assessment v1.7</p>
          <div className="flex items-center gap-2">
            <Button className="h-8 border border-[#7fa98f] bg-white px-3 text-xs text-[#30443f] hover:bg-[#f4f8f6]">
              <Eye className="mr-1.5 size-3.5" />
              Preview Report
            </Button>
            <Button className="h-8 border border-[#3f6d54] bg-[#4f7f64] px-3 text-xs text-white hover:bg-[#456f58]">
              <Save className="mr-1.5 size-3.5" />
              Save Report Template
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">
        <div className="mx-auto max-w-3xl space-y-3">
          <section className="overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#dde2e6] px-4 py-3">
              <h2 className="text-[30px] font-semibold leading-none">Report Title</h2>
              <ChevronDown className="size-4 text-[#6b7280]" />
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="grid grid-cols-[1fr_92px] gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold text-[#374151]">Title Text</p>
                  <div className="h-10 rounded-md border border-[#cfd6dc] bg-white px-3 text-sm leading-10 text-[#6b7280]">
                    {derived.reportTitle}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-[#374151]">Title Color</p>
                  <div className="h-10 rounded-md border border-[#cfd6dc] bg-white p-1">
                    <div className="h-full rounded-sm border border-[#8ea4a0]" style={{ backgroundColor: derived.titleColor }} />
                  </div>
                </div>
              </div>
              <div className="rounded-sm px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: derived.titleColor }}>
                {derived.reportTitle}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#dde2e6] px-4 py-3">
              <h2 className="text-[30px] font-semibold leading-none">Introduction Sections</h2>
              <ChevronDown className="size-4 text-[#6b7280]" />
            </div>
            <div className="space-y-2 px-4 py-3">
              {derived.introductionSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex h-11 items-center justify-between rounded-md border px-3 text-sm ${
                    index === 2
                      ? "border-[#e2e6ea] bg-[#eef1f3] text-[#9ca3af]"
                      : "border-[#d4d9de] bg-white text-[#1f2937]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`size-3.5 rounded-sm border ${index === 2 ? "border-[#bcc5cd] bg-[#d8dde2]" : "border-[#2c78d2] bg-[#2f80ed]"}`} />
                    <span>{section.label || `Introduction Section ${index + 1}`}</span>
                  </div>
                  <ChevronDown className="size-4 text-[#9ca3af]" />
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#dde2e6] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-0.5 rounded-full bg-[#33b06f]" />
                <h2 className="text-[30px] font-semibold leading-none">Strength Areas</h2>
                <span className="rounded-md bg-[#dff3e7] px-2 py-0.5 text-xs font-semibold text-[#2f8f62]">4/5 complete</span>
              </div>
              <ChevronDown className="size-4 text-[#6b7280]" />
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold">Section Introduction Text</p>
                  <div className="h-10 rounded-md border border-[#cfd6dc] bg-white px-3 text-xs leading-10 text-[#374151]">
                    {derived.strengthIntro}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold">Number to Show</p>
                  <div className="flex h-10 items-center justify-between rounded-md border border-[#cfd6dc] bg-[#f2f4f6] px-3 text-sm">
                    <span>Top 3</span>
                    <ChevronDown className="size-4 text-[#9ca3af]" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e4e8ec] pt-3">
                <p className="text-xs font-semibold">Edit Construct Text</p>
                <p className="mt-0.5 text-[11px] text-[#8a94a2]">
                  Select a construct to edit. System will automatically show top 3 based on candidate performance.
                </p>
              </div>

              <div className="grid grid-cols-[260px_1fr] gap-3">
                <div>
                  <div className="flex h-10 items-center justify-between rounded-md border border-[#cfd6dc] bg-[#f2f7f4] px-3 text-sm font-medium text-[#2f4f43]">
                    <span>Assertiveness</span>
                    <Check className="size-4 text-[#33b06f]" />
                  </div>
                  <p className="mt-1 text-[11px] text-[#8a94a2]">Communication</p>
                </div>
                <div className="rounded-md border border-[#cfd6dc] bg-white p-2">
                  <p className="min-h-24 text-sm text-[#374151]">{derived.strengthText}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8a94a2]">
                    <span>{derived.strengthText.length} characters</span>
                    <span className="text-[#33b06f]">Text saved</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#dde2e6] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-0.5 rounded-full bg-[#4f79ff]" />
                <h2 className="text-[30px] font-semibold leading-none">Development Areas</h2>
                <span className="rounded-md bg-[#e5ecff] px-2 py-0.5 text-xs font-semibold text-[#4f79ff]">3/5 complete</span>
              </div>
              <ChevronDown className="size-4 text-[#6b7280]" />
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold">Section Introduction Text</p>
                  <div className="h-10 rounded-md border border-[#cfd6dc] bg-white px-3 text-xs leading-10 text-[#374151]">
                    {derived.developmentIntro}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold">Number to Show</p>
                  <div className="flex h-10 items-center justify-between rounded-md border border-[#cfd6dc] bg-[#f2f4f6] px-3 text-sm">
                    <span>Top 2</span>
                    <ChevronDown className="size-4 text-[#9ca3af]" />
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[#cfd6dc] bg-white p-2">
                <p className="min-h-16 text-sm text-[#374151]">{derived.weaknessText}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#8a94a2]">
                  <span>{derived.weaknessText.length} characters</span>
                  <span className="text-[#4f79ff]">Ready</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
