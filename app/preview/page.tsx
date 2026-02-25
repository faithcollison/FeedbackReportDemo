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
  titleText?: string
  subtitleText?: string
  titleFontSize?: number
  subtitleFontSize?: number
}

interface ConstructData {
  strengths: string
  weaknesses: string
}

interface ReportSettings {
  title: string
  owner: string
  templateName: string
  sendToCandidates: boolean
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

  function getStyle(sectionId: string): SectionStyle {
    return sectionStyles[sectionId] ?? { bgColor: "#ffffff", textColor: "#000000" }
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
                      {settings.title || "Feedback report for"}
                    </h1>
                    <p className="text-4xl font-light leading-tight">
                      {settings.owner || "Candidate Name"}
                    </p>
                    {s.content && (
                      <p className="mt-6 text-base opacity-80">{s.content}</p>
                    )}
                  </div>
                  {s.logoUrl && (
                    <img src={s.logoUrl} alt="Logo" className="max-h-16 object-contain" />
                  )}
                </div>
              </div>
            )

          case "title":
            return (
              <div key={section.id} className="px-10 py-5" style={sp}>
                <h2
                  style={{ fontSize: s.titleFontSize ?? 24 }}
                  className="font-bold"
                >
                  {s.titleText || "Untitled Section"}
                </h2>
                {s.subtitleText && (
                  <p
                    style={{ fontSize: s.subtitleFontSize ?? 16 }}
                    className="mt-1 opacity-80"
                  >
                    {s.subtitleText}
                  </p>
                )}
              </div>
            )

          case "paragraph":
            return (
              <div key={section.id} className="px-10 py-6" style={sp}>
                {s.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{s.content}</p>
                ) : (
                  <p className="text-sm italic opacity-40">No content entered.</p>
                )}
              </div>
            )

          case "strengths-group":
          case "development-group":
            return null

          case "strengths": {
            const items = CONSTRUCTS
              .map((c) => ({ name: c.name, text: constructData[c.id]?.strengths ?? "" }))
              .filter((i) => i.text.trim())
            return (
              <div key={section.id} className="px-10 py-6" style={sp}>
                {items.length === 0 ? (
                  <p className="text-sm italic opacity-40">No strengths content added.</p>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item.name}>
                        <h3 className="text-base font-bold mb-2">{item.name}</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          case "weaknesses": {
            const items = CONSTRUCTS
              .map((c) => ({ name: c.name, text: constructData[c.id]?.weaknesses ?? "" }))
              .filter((i) => i.text.trim())
            return (
              <div key={section.id} className="px-10 py-6" style={sp}>
                {items.length === 0 ? (
                  <p className="text-sm italic opacity-40">No development area content added.</p>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item.name}>
                        <h3 className="text-base font-bold mb-2">{item.name}</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                      </div>
                    ))}
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
