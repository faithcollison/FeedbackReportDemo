"use client"

import { useEffect, useState } from "react"

interface ReportSection {
  id: string
  type: string
  label: string
  parentId?: string
}

interface SectionStyle {
  bgColor: string
  textColor: string
  content?: string
  logoUrl?: string
  showTitle?: boolean
  titleText?: string
  titleBgColor?: string
  titleTextColor?: string
}

interface ConstructData {
  strengths: string
  weaknesses: string
}

interface ReportSettings {
  templateName: string
}

interface PreviewData {
  sections: ReportSection[]
  constructData: Record<string, ConstructData>
  settings: ReportSettings
  sectionStyles: Record<string, SectionStyle>
}

const CONSTRUCTS = [
  { id: "collaboration", name: "Collaboration" },
  { id: "growth", name: "Growth Mindset" },
  { id: "resilience", name: "Resilience" },
  { id: "analytical", name: "Analytical Mindset" },
  { id: "numerical", name: "Numerical Mindset" },
  { id: "problem-solving", name: "Problem Solving" },
]

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("report-preview-data")
    if (raw) {
      try {
        setData(JSON.parse(raw))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No preview data found. Open the preview from the Report Builder.</p>
      </div>
    )
  }

  const { sections, constructData, settings, sectionStyles } = data
  const PREVIEW_CANDIDATE_NAME = "Joe Bloggs"

  function getStyle(sectionId: string): SectionStyle {
    return sectionStyles[sectionId] ?? { bgColor: "#ffffff", textColor: "#000000" }
  }

  function resolveHeaderTitle(template: string): string {
    const candidateName = PREVIEW_CANDIDATE_NAME
    return template
      .replace(/\{\{\s*candidateName\s*\}\}/g, candidateName)
      .replace(/\{\{\s*candidate\s*\}\}/g, candidateName)
  }

  function resolveHeaderSubtitle(template: string): string {
    const assessmentName = "Example Assessment 1"
    return template.replace(/\{\{\s*assessmentName\s*\}\}/g, assessmentName)
  }

  function renderSectionTitle(s: SectionStyle) {
    if (!s.showTitle || !s.titleText?.trim()) return null
    return (
      <div
        className="px-10 py-4"
        style={{
          backgroundColor: s.titleBgColor ?? "#4338ca",
          color: s.titleTextColor ?? "#ffffff",
        }}
      >
        <h2 className="text-xl font-bold">{s.titleText}</h2>
      </div>
    )
  }

  function getRankWithinGroup(section: ReportSection, type: "strengths" | "weaknesses"): number {
    if (!section.parentId) return 0
    const siblings = sections.filter((s) => s.parentId === section.parentId && s.type === type)
    const idx = siblings.findIndex((s) => s.id === section.id)
    return idx >= 0 ? idx : 0
  }

  function styleProps(sectionId: string): React.CSSProperties {
    const s = getStyle(sectionId)
    const props: React.CSSProperties = {}
    if (s.bgColor && s.bgColor !== "#ffffff") props.backgroundColor = s.bgColor
    if (s.textColor && s.textColor !== "#000000") props.color = s.textColor
    return props
  }

  return (
    <div className="mx-auto max-w-3xl my-8 border rounded-lg overflow-hidden bg-white shadow-lg">
      {sections.map((section) => {
        const s = getStyle(section.id)
        const sp = styleProps(section.id)

        switch (section.type) {
          case "header":
            return (
              <div key={section.id} className="px-10 py-12" style={sp}>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-light leading-tight">
                      {resolveHeaderTitle(s.titleText || "Feedback report for {{candidateName}}")}
                    </h1>
                    {s.content && (
                      <p className="mt-6 text-base opacity-80">{resolveHeaderSubtitle(s.content)}</p>
                    )}
                  </div>
                  {s.logoUrl && (
                    <img src={s.logoUrl} alt="Logo" className="max-h-16 object-contain" />
                  )}
                </div>
              </div>
            )

          case "paragraph":
            return (
              <div key={section.id}>
                {renderSectionTitle(s)}
                <div className="px-10 py-6" style={sp}>
                  {s.content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{s.content}</p>
                  ) : (
                    <p className="text-sm italic opacity-40">No content entered.</p>
                  )}
                </div>
              </div>
            )

          case "strengths-group":
          case "development-group":
            if (!s.content && !s.showTitle) return null
            return (
              <div key={section.id}>
                {renderSectionTitle(s)}
                {s.content && (
                  <div className="px-10 py-6" style={sp}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{s.content}</p>
                  </div>
                )}
              </div>
            )

          case "strengths": {
            const items = CONSTRUCTS
              .map((c) => ({ name: c.name, text: constructData[c.id]?.strengths ?? "" }))
              .filter((i) => i.text.trim())
            const rank = getRankWithinGroup(section, "strengths")
            const item = items[rank]
            return (
              <div key={section.id} className="px-10 py-6" style={sp}>
                {!item ? (
                  <p className="text-sm italic opacity-40">No strengths content added.</p>
                ) : (
                  <div>
                    <h3 className="text-base font-bold mb-2">{item.name}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  </div>
                )}
              </div>
            )
          }

          case "weaknesses": {
            const items = CONSTRUCTS
              .map((c) => ({ name: c.name, text: constructData[c.id]?.weaknesses ?? "" }))
              .filter((i) => i.text.trim())
            const rank = getRankWithinGroup(section, "weaknesses")
            const item = items[rank]
            return (
              <div key={section.id} className="px-10 py-6" style={sp}>
                {!item ? (
                  <p className="text-sm italic opacity-40">No development area content added.</p>
                ) : (
                  <div>
                    <h3 className="text-base font-bold mb-2">{item.name}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  </div>
                )}
              </div>
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}
