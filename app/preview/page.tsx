"use client"

import { useEffect, useMemo, useState } from "react"

interface ReportSection {
  id: string
  type: string
  label: string
}

interface SectionStyle {
  content?: string
  titleText?: string
  titleBgColor?: string
  numberToShow?: number
  logoUrl?: string
}

interface ConstructData {
  strengths: string
  weaknesses: string
}

interface PreviewData {
  sections: ReportSection[]
  constructData: Record<string, ConstructData>
  settings?: { templateName?: string }
  sectionStyles: Record<string, SectionStyle>
}

interface ConstructBankEntry {
  id: string
  name: string
  strengths: string
  weaknesses: string
}

const PREVIEW_STORAGE_KEY = "report-preview-data"
const CONSTRUCT_BANK_STORAGE_KEY = "report-builder-construct-bank"
const DEFAULT_TITLE_BG = "#6f9f87"

function normalizeTitle(title: string): string {
  return title
    .replace(/\{\{\s*candidateName\s*\}\}/gi, "Candidate Name")
    .replace(/\{\{\s*candidate\s*\}\}/gi, "Candidate Name")
}

function formatConstructName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null)
  const [constructBankEntries, setConstructBankEntries] = useState<ConstructBankEntry[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(PREVIEW_STORAGE_KEY)
    if (raw) {
      try {
        setData(JSON.parse(raw))
      } catch {
        // ignore parse errors
      }
    }

    const bankRaw = localStorage.getItem(CONSTRUCT_BANK_STORAGE_KEY)
    if (bankRaw) {
      try {
        const parsed = JSON.parse(bankRaw)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is ConstructBankEntry =>
              !!item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.strengths === "string" &&
              typeof item.weaknesses === "string",
          )
          setConstructBankEntries(valid)
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  const derived = useMemo(() => {
    if (!data) return null

    const sections = data.sections ?? []
    const styles = data.sectionStyles ?? {}

    const header = sections.find((section) => section.type === "header")
    const headerStyle = header ? styles[header.id] : undefined

    const strengthsGroup = sections.find((section) => section.type === "strengths-group")
    const strengthsStyle = strengthsGroup ? styles[strengthsGroup.id] : undefined

    const developmentGroup = sections.find((section) => section.type === "development-group")
    const developmentStyle = developmentGroup ? styles[developmentGroup.id] : undefined

    const constructEntries = Object.entries(data.constructData ?? {})

    const strengthsFromData = constructEntries
      .map(([id, value]) => ({
        id,
        name: formatConstructName(constructBankEntries.find((entry) => entry.id === id)?.name ?? id),
        text: value.strengths,
      }))
      .filter((item) => item.text.trim())

    const weaknessesFromData = constructEntries
      .map(([id, value]) => ({
        id,
        name: formatConstructName(constructBankEntries.find((entry) => entry.id === id)?.name ?? id),
        text: value.weaknesses,
      }))
      .filter((item) => item.text.trim())

    const strengthsFallback = constructBankEntries
      .map((entry) => ({ id: entry.id, name: formatConstructName(entry.name), text: entry.strengths }))
      .filter((item) => item.text.trim())

    const weaknessesFallback = constructBankEntries
      .map((entry) => ({ id: entry.id, name: formatConstructName(entry.name), text: entry.weaknesses }))
      .filter((item) => item.text.trim())

    const strengthLimit = Math.max(1, strengthsStyle?.numberToShow ?? 2)
    const weaknessLimit = Math.max(1, developmentStyle?.numberToShow ?? 1)

    const strengths = (strengthsFromData.length > 0 ? strengthsFromData : strengthsFallback).slice(0, strengthLimit)
    const weaknesses = (weaknessesFromData.length > 0 ? weaknessesFromData : weaknessesFallback).slice(0, weaknessLimit)

    return {
      sections,
      title: normalizeTitle(headerStyle?.titleText || "Feedback report for Candidate Name"),
      titleColor: headerStyle?.titleBgColor || "#457b58",
      logoUrl: headerStyle?.logoUrl || "",
      styles,
      strengthsGroup,
      strengthsStyle,
      strengths,
      developmentGroup,
      developmentStyle,
      weaknesses,
    }
  }, [constructBankEntries, data])

  if (!derived) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e9efec] px-6">
        <p className="text-sm text-[#64748b]">No preview data found. Open Preview Report from the builder first.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e9efec] py-8">
      <article className="mx-auto w-full max-w-4xl overflow-hidden rounded border border-[#cfd8d3] bg-white shadow-sm">
        <header className="px-10 pb-10 pt-12" style={{ backgroundColor: derived.titleColor, color: "#ffffff" }}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs opacity-90">For assessment: Demo Assessment v1.7</p>
              <h1 className="mt-3 text-4xl font-light leading-tight">{derived.title}</h1>
            </div>
            {derived.logoUrl?.trim() && (
              <img
                src={derived.logoUrl}
                alt="Header logo"
                className="max-h-20 max-w-[220px] rounded bg-white/15 p-1 object-contain"
              />
            )}
          </div>
        </header>

        <main className="px-10 py-8">
          {derived.sections
            .filter((section) => section.type !== "header")
            .map((section) => {
              const style = derived.styles[section.id]

              if (section.type === "paragraph") {
                return (
                  <section key={section.id} className="mb-8">
                    {style?.titleText?.trim() && (
                      <div
                        className="mb-4 px-5 py-3 text-lg font-semibold text-white"
                        style={{ backgroundColor: style.titleBgColor || DEFAULT_TITLE_BG }}
                      >
                        {style.titleText}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">{style?.content || ""}</p>
                  </section>
                )
              }

              if (section.type === "strengths-group") {
                return (
                  <section key={section.id} className="mb-8">
                    <div
                      className="mb-4 px-5 py-3 text-lg font-semibold text-white"
                      style={{ backgroundColor: style?.titleBgColor || DEFAULT_TITLE_BG }}
                    >
                      {style?.titleText || "Strength Areas"}
                    </div>
                    {style?.content?.trim() && (
                      <p className="mb-6 whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">{style.content}</p>
                    )}
                    {derived.strengths.map((item) => (
                      <div key={`s-${item.id}`} className="mb-6">
                        <h3 className="mb-2 text-xl font-semibold text-[#1f2937]">{item.name}</h3>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">{item.text}</p>
                      </div>
                    ))}
                  </section>
                )
              }

              if (section.type === "development-group") {
                return (
                  <section key={section.id} className="mb-8">
                    <div
                      className="mb-4 px-5 py-3 text-lg font-semibold text-white"
                      style={{ backgroundColor: style?.titleBgColor || DEFAULT_TITLE_BG }}
                    >
                      {style?.titleText || "Development Areas"}
                    </div>
                    {style?.content?.trim() && (
                      <p className="mb-6 whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">{style.content}</p>
                    )}
                    {derived.weaknesses.map((item) => (
                      <div key={`d-${item.id}`} className="mb-6">
                        <h3 className="mb-2 text-xl font-semibold text-[#1f2937]">{item.name}</h3>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">{item.text}</p>
                      </div>
                    ))}
                  </section>
                )
              }

              return null
            })}
        </main>
      </article>
    </div>
  )
}
