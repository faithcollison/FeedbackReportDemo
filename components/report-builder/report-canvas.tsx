"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Settings2,
  ImageIcon,
  Save,
  Info,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────

type SectionType = "header" | "paragraph" | "strengths-group" | "development-group" | "strengths" | "weaknesses" | "title"

interface ReportSection {
  id: string
  type: SectionType
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

// ── Constants ──────────────────────────────────────────────

const CONSTRUCTS = [
  { id: "collaboration", name: "Collaboration" },
  { id: "growth", name: "Growth Mindset" },
  { id: "resilience", name: "Resilience" },
  { id: "analytical", name: "Analytical Mindset" },
  { id: "numerical", name: "Numerical Mindset" },
  { id: "problem-solving", name: "Problem Solving" },
]

const AVAILABLE_SECTIONS: { type: SectionType; label: string; description: string }[] = [
  { type: "header", label: "Header", description: "Logo / branding header" },
  { type: "strengths-group", label: "Strength Areas", description: "Group for strength constructs" },
  { type: "development-group", label: "Development Areas", description: "Group for development area constructs" },
  { type: "paragraph", label: "Free Text", description: "Custom paragraph section" },
  { type: "title", label: "Title", description: "Title and subtitle with background" },
]

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: "1", type: "header", label: "Header" },
  { id: "2", type: "paragraph", label: "How the assessment works" },
  { id: "3", type: "paragraph", label: "Report contents" },
  { id: "4", type: "title", label: "Your top two strengths" },
  { id: "5", type: "paragraph", label: "Strengths introduction" },
  { id: "6", type: "strengths-group", label: "Strength Areas" },
  { id: "6a", type: "strengths", label: "Strengths (Rank 1)", parentId: "6" },
  { id: "7", type: "title", label: "Your top development area" },
  { id: "8", type: "development-group", label: "Development Areas" },
  { id: "8a", type: "weaknesses", label: "Weaknesses (Rank 1)", parentId: "8" },
  { id: "9", type: "title", label: "Hints and tips" },
  { id: "10", type: "paragraph", label: "Tips and closing" },
]

const DEFAULT_SETTINGS: ReportSettings = {
  title: "Feedback report for",
  owner: "Nina Salih",
  templateName: "",
  sendToCandidates: false,
}

function buildDefaultConstructData(): Record<string, ConstructData> {
  return {
    collaboration: {
      strengths: `Your responses indicate you enjoy working in a team and can effectively collaborate with others to deliver results. Your ability to engage with a wide range of people and leverage their diverse skill sets is a strength that can lead to successful project outcomes and a positive working environment.

Taking this strength further...

Enhance your communication skills. Clear and open communication is the foundation of effective collaboration. Focus on refining your ability to convey ideas, listen actively, and encourage others to share their thoughts.

Embrace diversity. Seek to collaborate with people you would not usually work with. By actively seeking out and embracing diverse viewpoints, you can drive innovation and find more comprehensive solutions to challenges.

Invest in relationship building. Take time to connect with your colleagues outside of immediate project needs. Understanding their working styles and motivations can greatly enhance your collaboration.

Top tip: Your collaboration skills are a great asset but balancing them with individual responsibility is crucial. While teamwork is important, remember to also take ownership of your tasks and contribute your best work to the team. This approach will boost project success and highlight you as a reliable and valued team member.`,
      weaknesses: "",
    },
    growth: {
      strengths: `Your responses indicate that you are open to feedback and committed to self-improvement. You enjoy stepping outside your comfort zone and treating challenges as learning opportunities. This mindset drives continuous growth, helping you adapt to new situations and refine your skills over time.

Taking this strength further\u2026

Set clear development goals. Establish specific, achievable goals for your growth. Whether it is mastering a new skill, gaining expertise in a particular area, or improving a personal quality, setting these goals will help you stay focused on your development journey.

Take on stretching assignments. Volunteer for tasks or projects slightly beyond your current skill set. This will push you to develop new abilities, build confidence, and demonstrate your willingness to grow and take initiative.

Seek diverse feedback. Ensure you gather feedback from a range of people - not just from managers or professors, but also from peers or colleagues. Each person offers a unique perspective that can help you identify areas for improvement.

Top tip: While your eagerness to learn is commendable, it is important to balance your pursuit of new skills with the need to integrate what you have already learned. Apply your knowledge in practical situations to refine your understanding and make your growth sustainable.`,
      weaknesses: "",
    },
    resilience: {
      strengths: "",
      weaknesses: `Your responses indicate that staying motivated when facing setbacks could be an area for further development. In a dynamic work environment, where challenges and tight deadlines are common, enhancing your resilience will significantly improve your ability to consistently deliver quality work, even under pressure.

To further develop in this area\u2026

Set realistic goals. Break larger tasks into smaller, manageable steps with achievable goals. Focusing on these milestones helps to maintain motivation, make larger challenges less overwhelming, and keep you resilient even when setbacks occur.

Develop coping strategies. Practise techniques like mindfulness or deep breathing to help manage stress when challenges arise. These strategies can help you stay calm and focused, allowing you to approach problems with a clear mind and a positive attitude.

Surround yourself with support. Build a network of colleagues, mentors, or friends who can offer encouragement and advice when you are facing difficulties. Sharing your challenges with others can provide new perspectives, reduce feelings of isolation, and help you stay motivated during tough times.

Development tip: Research shows that resilience is built over time by facing various challenges. Use this insight to shift your perspective, viewing setbacks as opportunities to strengthen your ability to handle difficulties with a positive outlook.`,
    },
    analytical: { strengths: "", weaknesses: "" },
    numerical: { strengths: "", weaknesses: "" },
    "problem-solving": { strengths: "", weaknesses: "" },
  }
}

function buildDefaultSectionStyles(): Record<string, SectionStyle> {
  return {
    "1": {
      bgColor: "#7c3aed",
      textColor: "#ffffff",
      content: "For assessment: Amey Early Careers Online Assessment 2025 \u2013 2026",
      logoUrl: "",
    },
    "2": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: `How the assessment works

You completed an online assessment which measures the strengths that enable high performance at Amey.

During the assessment, your responses were carefully scored using a methodology based on reputable, peer-reviewed science, with robust evidence supporting its effectiveness. The scoring algorithms promote diversity and neurodiversity by adapting to every candidate to account for individual differences in processing information and making decisions.`,
    },
    "3": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: `Report contents

To help you better understand yourself, and the type of work you would enjoy, this report outlines your top two strengths and one development area. At the end of the report, you will also find tips on how to further understand and develop your natural strengths and mitigate any potential weaknesses.`,
    },
    "4": {
      bgColor: "#4338ca",
      textColor: "#ffffff",
      titleText: "Your top two strengths",
      titleFontSize: 20,
      subtitleFontSize: 16,
    },
    "5": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: `Your top two strengths are likely to be things that you do well and tend to enjoy. When you can use these strengths in your daily tasks, it is likely that you will be more productive, and engaged with what you are doing.

As you consider your responsibilities, role and daily activities, think about how you might find ways to play to these strengths to further enhance your performance and mental wellbeing. People who use their strengths at work consistently report feeling happier, less prone to stress, and more productive.`,
    },
    "7": {
      bgColor: "#4338ca",
      textColor: "#ffffff",
      titleText: "Your top development area",
      titleFontSize: 20,
      subtitleFontSize: 16,
    },
    "9": {
      bgColor: "#4338ca",
      textColor: "#ffffff",
      titleText: "Hints and tips",
      titleFontSize: 20,
      subtitleFontSize: 16,
    },
    "10": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: `Research shows that people who know and use their strengths often achieve better results and feel more satisfied - both in work and in everyday life. Being aware of your strengths can guide you towards roles and tasks you\u2019ll enjoy and excel at.

Here are some essential tips to help you recognise and make the most of your strengths:

Ask for honest feedback

Engage with friends, family, teachers or mentors who\u2019ve seen you in action, whether it\u2019s during a team project, a family gathering, or a casual weekend hobby session. Ask them questions: What do they know you for? Which tasks or projects do you tackle with great ease or enthusiasm? When do they naturally turn to you for help or advice?

Look at your daily habits

Keep a light diary of your activities over a week or two. Notice which tasks you jump on straight away and enjoy, and which ones you avoid or delay. This can highlight the activities that come naturally to you, as well as those that feel more like a struggle \u2013 even if you might be able to do them well.

Spot moments of \u2018flow\u2019

\u2018Flow\u2019 is when you\u2019re so absorbed in what you are doing that time flies by. Think about which tasks or projects get you into that zone - whether this is solving a tricky problem, helping people, or coming up with new ideas. The personal qualities you are using in these moments will be some of your top strengths.

Strategically counteract weaknesses

Everyone has strengths and weaknesses - it\u2019s a normal part of being human. The key is to identify where you struggle and find ways to balance or address it by using your natural talents. For example, if you lack an eye for detail, team up with someone who excels at this and can give your work a final review while you develop in this area. In return, identify how you can help them using your strengths.

Thank you again for completing the assessment. We hope this report helps you discover and use your strengths as you choose and develop your future career.`,
    },
  }
}

// ── Main Component ─────────────────────────────────────────

export default function ReportCanvas() {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS)
  const [constructData, setConstructData] = useState<Record<string, ConstructData>>(buildDefaultConstructData)
  const [settings, setSettings] = useState<ReportSettings>(DEFAULT_SETTINGS)
  const [sectionStyles, setSectionStyles] = useState<Record<string, SectionStyle>>(buildDefaultSectionStyles)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null

  // ── Derived: which construct types are in the layout ──

  const hasStrengthsSection = sections.some((s) => s.type === "strengths-group" || s.type === "strengths")
  const hasDevelopmentSection = sections.some((s) => s.type === "development-group" || s.type === "weaknesses")

  // ── Section helpers ──

  function getChildren(parentId: string) {
    return sections.filter((s) => s.parentId === parentId)
  }

  function countChildType(parentId: string, type: "strengths" | "weaknesses") {
    return sections.filter((s) => s.parentId === parentId && s.type === type).length
  }

  function addSection(type: SectionType, label: string) {
    setSections([...sections, { id: crypto.randomUUID(), type, label }])
  }

  function addSubsection(parentId: string, type: "strengths" | "weaknesses") {
    const count = countChildType(parentId, type)
    if (count >= 3) return
    const typeName = type === "strengths" ? "Strengths" : "Weaknesses"
    const label = `${typeName} (Rank ${count + 1})`
    const newId = crypto.randomUUID()

    const parentIndex = sections.findIndex((s) => s.id === parentId)
    const children = getChildren(parentId)
    let insertAfterIndex = parentIndex
    if (children.length > 0) {
      const lastChild = children[children.length - 1]
      insertAfterIndex = sections.findIndex((s) => s.id === lastChild.id)
    }

    const next = [...sections]
    next.splice(insertAfterIndex + 1, 0, { id: newId, type, label, parentId })
    setSections(next)
  }

  function removeSection(id: string) {
    const removed = sections.find((s) => s.id === id)
    if (!removed) return

    let newSections: ReportSection[]

    if (removed.type === "strengths-group" || removed.type === "development-group") {
      newSections = sections.filter((s) => s.id !== id && s.parentId !== id)
    } else {
      newSections = sections.filter((s) => s.id !== id)
    }

    if (removed.parentId && (removed.type === "strengths" || removed.type === "weaknesses")) {
      const typeName = removed.type === "strengths" ? "Strengths" : "Weaknesses"
      let rank = 1
      for (const s of newSections) {
        if (s.parentId === removed.parentId && s.type === removed.type) {
          s.label = `${typeName} (Rank ${rank})`
          rank++
        }
      }
    }

    setSections(newSections)
    if (selectedSectionId === id) setSelectedSectionId(null)
    setPendingDeleteId(null)
  }

  function hasConstructContent(sectionType: SectionType): boolean {
    if (sectionType === "strengths-group" || sectionType === "strengths") {
      return CONSTRUCTS.some((c) => (constructData[c.id]?.strengths ?? "").trim().length > 0)
    }
    if (sectionType === "development-group" || sectionType === "weaknesses") {
      return CONSTRUCTS.some((c) => (constructData[c.id]?.weaknesses ?? "").trim().length > 0)
    }
    return false
  }

  function requestRemoveSection(id: string) {
    const section = sections.find((s) => s.id === id)
    if (!section) return

    const isConstructSection =
      section.type === "strengths-group" ||
      section.type === "development-group" ||
      section.type === "strengths" ||
      section.type === "weaknesses"

    if (isConstructSection && hasConstructContent(section.type)) {
      setPendingDeleteId(id)
    } else {
      removeSection(id)
    }
  }

  function moveSection(_index: number, direction: "up" | "down") {
    const section = sections[_index]
    if (section.parentId) return

    const topLevel = sections.filter((s) => !s.parentId)
    const groups: ReportSection[][] = topLevel.map((tl) => [tl, ...getChildren(tl.id)])

    const groupIndex = groups.findIndex((g) => g[0].id === section.id)
    const targetIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1
    if (targetIndex < 0 || targetIndex >= groups.length) return

    ;[groups[groupIndex], groups[targetIndex]] = [groups[targetIndex], groups[groupIndex]]

    setSections(groups.flat())
  }

  // ── Construct helpers ──

  function updateConstruct(constructId: string, field: "strengths" | "weaknesses", value: string) {
    setConstructData((prev) => ({
      ...prev,
      [constructId]: { ...prev[constructId], [field]: value },
    }))
  }

  // ── Section style helpers ──

  function getStyle(sectionId: string): SectionStyle {
    return sectionStyles[sectionId] ?? { bgColor: "#ffffff", textColor: "#000000", content: "", logoUrl: "", titleText: "", subtitleText: "", titleFontSize: 24, subtitleFontSize: 16 }
  }

  function updateStyle(sectionId: string, patch: Partial<SectionStyle>) {
    setSectionStyles((prev) => ({
      ...prev,
      [sectionId]: { ...getStyle(sectionId), ...patch },
    }))
  }

  // ── Settings helper ──

  function updateSetting<K extends keyof ReportSettings>(key: K, value: ReportSettings[K]) {
    setSettings({ ...settings, [key]: value })
  }

  // ── Section label helper ──

  const SECTION_TYPE_NAMES: Record<string, string> = {
    header: "Header",
    paragraph: "Free Text Area",
    "strengths-group": "Strength Areas",
    "development-group": "Development Areas",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    title: "Title",
  }


  function updateSectionLabel(id: string, label: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)))
  }

  // ── Preview helper ──

  function openPreview() {
    localStorage.setItem(
      "report-preview-data",
      JSON.stringify({ sections, constructData, settings, sectionStyles })
    )
    window.open("/preview", "_blank")
  }

  // ── Progress computations ──

  const layoutProgress = useMemo(() => {
    const items: { label: string; done: boolean }[] = []

    const headerSection = sections.find((s) => s.type === "header")
    items.push({ label: "Header section", done: !!headerSection })

    const hasLogo = headerSection ? !!sectionStyles[headerSection.id]?.logoUrl : false
    items.push({ label: "Logo uploaded", done: hasLogo })

    const sgSection = sections.find((s) => s.type === "strengths-group")
    items.push({ label: "Strength Areas section", done: !!sgSection })

    const hasStrength = sections.some((s) => s.type === "strengths")
    items.push({ label: "At least one strength added", done: hasStrength })

    const completed = items.filter((i) => i.done).length
    const percent = Math.round((completed / items.length) * 100)
    const missing = items.filter((i) => !i.done).map((i) => i.label)

    return { percent, missing }
  }, [sections, sectionStyles])

  const constructProgress = useMemo(() => {
    const missing: string[] = []
    let filled = 0
    let total = 0

    for (const construct of CONSTRUCTS) {
      const data = constructData[construct.id] ?? { strengths: "", weaknesses: "" }
      if (hasStrengthsSection) {
        total++
        if (data.strengths.trim()) {
          filled++
        } else {
          missing.push(`${construct.name} \u2014 strength text`)
        }
      }
      if (hasDevelopmentSection) {
        total++
        if (data.weaknesses.trim()) {
          filled++
        } else {
          missing.push(`${construct.name} \u2014 development text`)
        }
      }
    }

    const percent = total === 0 ? 100 : Math.round((filled / total) * 100)
    return { percent, missing }
  }, [constructData, hasStrengthsSection, hasDevelopmentSection])

  // ── Render ──

  const topLevelSections = sections.filter((s) => !s.parentId)

  const pendingDeleteSection = pendingDeleteId ? sections.find((s) => s.id === pendingDeleteId) : null
  const pendingDeleteTypeName = pendingDeleteSection
    ? pendingDeleteSection.type === "strengths-group" || pendingDeleteSection.type === "strengths"
      ? "strength"
      : "development area"
    : ""

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Configure your report layout, content, and settings.
        </p>
        <Button variant="outline" className="gap-2" onClick={openPreview}>
          <Eye className="size-4" />
          Preview Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="layout">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">
            <span>Layout</span>
            <span
              className={
                "text-[10px] font-semibold rounded-full px-1.5 py-0.5 tabular-nums " +
                (layoutProgress.percent === 100
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700")
              }
            >
              {layoutProgress.percent}%
            </span>
            {layoutProgress.missing.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center size-4 rounded-full bg-amber-100 text-amber-600 cursor-help">
                    <Info className="size-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[240px] text-left">
                  <p className="font-semibold mb-1">Missing:</p>
                  <ul className="list-disc pl-3 space-y-0.5">
                    {layoutProgress.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </TabsTrigger>
          <TabsTrigger value="strengths-weaknesses">
            <span>Construct Content</span>
            <span
              className={
                "text-[10px] font-semibold rounded-full px-1.5 py-0.5 tabular-nums " +
                (constructProgress.percent === 100
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700")
              }
            >
              {constructProgress.percent}%
            </span>
            {constructProgress.missing.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center size-4 rounded-full bg-amber-100 text-amber-600 cursor-help">
                    <Info className="size-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[260px] text-left">
                  <p className="font-semibold mb-1">Missing:</p>
                  <ul className="list-disc pl-3 space-y-0.5">
                    {constructProgress.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Report Settings</TabsTrigger>
        </TabsList>

        {/* ── Layout Tab ── */}
        <TabsContent value="layout" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Layout</CardTitle>
                <CardDescription>
                  Click a section to configure it. Use the drawer to add subsections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topLevelSections.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No sections added yet. Add sections from the palette on the right.
                  </p>
                )}
                {topLevelSections.map((section) => {
                  const globalIndex = sections.findIndex((s) => s.id === section.id)
                  return (
                    <div
                      key={section.id}
                      className={
                        "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors " +
                        (selectedSectionId === section.id
                          ? "border-primary bg-primary/5"
                          : "bg-background hover:bg-accent/50")
                      }
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <GripVertical className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{section.label || SECTION_TYPE_NAMES[section.type] ?? section.type}</span>
                      <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">
                        {SECTION_TYPE_NAMES[section.type] ?? section.type}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveSection(globalIndex, "up")}
                          disabled={globalIndex === 0}
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveSection(globalIndex, "down")}
                          disabled={globalIndex === sections.length - 1}
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => requestRemoveSection(section.id)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Click to add a section to the layout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {AVAILABLE_SECTIONS.map((s) => (
                  <button
                    key={s.type}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => addSection(s.type, "")}
                  >
                    <Plus className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Section Settings Sheet ── */}
          <Sheet open={selectedSectionId !== null} onOpenChange={(open) => { if (!open) setSelectedSectionId(null) }}>
            <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Settings2 className="size-4" />
                  {selectedSection?.label || SECTION_TYPE_NAMES[selectedSection?.type ?? ""] || "Section"} Settings
                </SheetTitle>
                <SheetDescription>
                  {selectedSection?.type === "strengths-group"
                    ? "Add strength subsections to this group."
                    : selectedSection?.type === "development-group"
                    ? "Add development area subsections to this group."
                    : "Customise the appearance of this section."}
                </SheetDescription>
              </SheetHeader>

              {selectedSection && (
                <div className="space-y-6 px-4 pb-4">

                  {/* ── Section label ── */}
                  <div className="space-y-3">
                    <Label>Label</Label>
                    <Input
                      value={selectedSection.label}
                      onChange={(e) => updateSectionLabel(selectedSection.id, e.target.value)}
                      placeholder="Optional descriptive label..."
                    />
                  </div>

                  <Separator />

                  {/* ── Strengths group: subsection management ── */}
                  {selectedSection.type === "strengths-group" && (() => {
                    const strengthChildren = getChildren(selectedSection.id).filter((c) => c.type === "strengths")
                    return (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Strengths</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={strengthChildren.length >= 3}
                              onClick={() => addSubsection(selectedSection.id, "strengths")}
                            >
                              <Plus className="size-3.5" />
                              Add
                              <span className="text-xs text-muted-foreground ml-1">
                                ({strengthChildren.length}/3)
                              </span>
                            </Button>
                          </div>
                          {strengthChildren.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No strengths added yet.</p>
                          )}
                          <div className="space-y-1.5">
                            {strengthChildren.map((child) => (
                              <div
                                key={child.id}
                                className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                              >
                                <span className="flex-1">{child.label}</span>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => requestRemoveSection(child.id)}
                                >
                                  <Trash2 className="size-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )
                  })()}

                  {/* ── Development group: subsection management ── */}
                  {selectedSection.type === "development-group" && (() => {
                    const weaknessChildren = getChildren(selectedSection.id).filter((c) => c.type === "weaknesses")
                    return (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Development Areas</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={weaknessChildren.length >= 3}
                              onClick={() => addSubsection(selectedSection.id, "weaknesses")}
                            >
                              <Plus className="size-3.5" />
                              Add
                              <span className="text-xs text-muted-foreground ml-1">
                                ({weaknessChildren.length}/3)
                              </span>
                            </Button>
                          </div>
                          {weaknessChildren.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No development areas added yet.</p>
                          )}
                          <div className="space-y-1.5">
                            {weaknessChildren.map((child) => (
                              <div
                                key={child.id}
                                className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                              >
                                <span className="flex-1">{child.label}</span>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => requestRemoveSection(child.id)}
                                >
                                  <Trash2 className="size-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )
                  })()}

                  {/* ── Title section settings ── */}
                  {selectedSection.type === "title" && (
                    <>
                      <div className="space-y-3">
                        <Label>Title</Label>
                        <Input
                          value={getStyle(selectedSection.id).titleText ?? ""}
                          onChange={(e) => updateStyle(selectedSection.id, { titleText: e.target.value })}
                          placeholder="Section title..."
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Title Font Size (px)</Label>
                        <Input
                          type="number"
                          min={12}
                          max={72}
                          value={getStyle(selectedSection.id).titleFontSize ?? 24}
                          onChange={(e) => updateStyle(selectedSection.id, { titleFontSize: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Subtitle</Label>
                        <Input
                          value={getStyle(selectedSection.id).subtitleText ?? ""}
                          onChange={(e) => updateStyle(selectedSection.id, { subtitleText: e.target.value })}
                          placeholder="Optional subtitle..."
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Subtitle Font Size (px)</Label>
                        <Input
                          type="number"
                          min={10}
                          max={48}
                          value={getStyle(selectedSection.id).subtitleFontSize ?? 16}
                          onChange={(e) => updateStyle(selectedSection.id, { subtitleFontSize: Number(e.target.value) })}
                        />
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* ── Colour settings — all sections ── */}
                  {(
                    <>
                      <div className="space-y-3">
                        <Label>Background Colour</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={getStyle(selectedSection.id).bgColor}
                            onChange={(e) => updateStyle(selectedSection.id, { bgColor: e.target.value })}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={getStyle(selectedSection.id).bgColor}
                            onChange={(e) => updateStyle(selectedSection.id, { bgColor: e.target.value })}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Text Colour</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={getStyle(selectedSection.id).textColor}
                            onChange={(e) => updateStyle(selectedSection.id, { textColor: e.target.value })}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={getStyle(selectedSection.id).textColor}
                            onChange={(e) => updateStyle(selectedSection.id, { textColor: e.target.value })}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Free Text — content */}
                  {selectedSection.type === "paragraph" && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label>Content</Label>
                        <Textarea
                          value={getStyle(selectedSection.id).content ?? ""}
                          onChange={(e) => updateStyle(selectedSection.id, { content: e.target.value })}
                          placeholder="Enter your free text content here..."
                          className="min-h-[120px]"
                        />
                      </div>
                    </>
                  )}

                  {/* Header — logo upload + subtitle */}
                  {selectedSection.type === "header" && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label>Logo / Branding</Label>
                        {getStyle(selectedSection.id).logoUrl ? (
                          <div className="space-y-2">
                            <img
                              src={getStyle(selectedSection.id).logoUrl}
                              alt="Logo preview"
                              className="max-h-20 rounded border object-contain"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStyle(selectedSection.id, { logoUrl: "" })}
                            >
                              Remove Logo
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 cursor-pointer hover:bg-accent/50 transition-colors">
                            <ImageIcon className="size-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const url = URL.createObjectURL(file)
                                  updateStyle(selectedSection.id, { logoUrl: url })
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label>Subtitle</Label>
                        <Input
                          value={getStyle(selectedSection.id).content ?? ""}
                          onChange={(e) => updateStyle(selectedSection.id, { content: e.target.value })}
                          placeholder="e.g. For assessment: ..."
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* ── Construct Content Tab ── */}
        <TabsContent value="strengths-weaknesses" className="mt-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground">
              Constructs generated from assessment &lsquo;Example Assessment 1&rsquo;
            </p>
          </div>

          {!hasStrengthsSection && !hasDevelopmentSection ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Add a <span className="font-medium">Strength Areas</span> or <span className="font-medium">Development Areas</span> section in the Layout tab to configure construct content.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {CONSTRUCTS.map((construct) => {
                const data = constructData[construct.id] ?? { strengths: "", weaknesses: "" }
                const showBoth = hasStrengthsSection && hasDevelopmentSection
                const defaultTab = hasStrengthsSection ? "strengths" : "weaknesses"
                return (
                  <Card key={construct.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{construct.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Define the text that will appear in the report when a candidate scores this construct as a strength or area for development.
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showBoth ? (
                        <Tabs defaultValue={defaultTab}>
                          <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-4 px-0 h-auto pb-0">
                            <TabsTrigger
                              value="strengths"
                              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2"
                            >
                              If Strength
                            </TabsTrigger>
                            <TabsTrigger
                              value="weaknesses"
                              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2"
                            >
                              If Development Area
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="strengths" className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">
                              This text will appear in the report if the candidate has <span className="font-medium">{construct.name}</span> as a strength.
                            </p>
                            <div className="relative">
                              <Textarea
                                value={data.strengths}
                                onChange={(e) => updateConstruct(construct.id, "strengths", e.target.value)}
                                placeholder={`e.g. The candidate demonstrates strong ${construct.name.toLowerCase()} skills, evidenced by...`}
                                className="min-h-[160px] text-sm resize-y"
                              />
                              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                                {data.strengths.length} characters
                              </span>
                            </div>
                          </TabsContent>
                          <TabsContent value="weaknesses" className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">
                              This text will appear in the report if the candidate has <span className="font-medium">{construct.name}</span> as an area for development.
                            </p>
                            <div className="relative">
                              <Textarea
                                value={data.weaknesses}
                                onChange={(e) => updateConstruct(construct.id, "weaknesses", e.target.value)}
                                placeholder={`e.g. The candidate would benefit from developing their ${construct.name.toLowerCase()} by...`}
                                className="min-h-[160px] text-sm resize-y"
                              />
                              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                                {data.weaknesses.length} characters
                              </span>
                            </div>
                          </TabsContent>
                        </Tabs>
                      ) : hasStrengthsSection ? (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            This text will appear in the report if the candidate has <span className="font-medium">{construct.name}</span> as a strength.
                          </p>
                          <div className="relative">
                            <Textarea
                              value={data.strengths}
                              onChange={(e) => updateConstruct(construct.id, "strengths", e.target.value)}
                              placeholder={`e.g. The candidate demonstrates strong ${construct.name.toLowerCase()} skills, evidenced by...`}
                              className="min-h-[160px] text-sm resize-y"
                            />
                            <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                              {data.strengths.length} characters
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            This text will appear in the report if the candidate has <span className="font-medium">{construct.name}</span> as an area for development.
                          </p>
                          <div className="relative">
                            <Textarea
                              value={data.weaknesses}
                              onChange={(e) => updateConstruct(construct.id, "weaknesses", e.target.value)}
                              placeholder={`e.g. The candidate would benefit from developing their ${construct.name.toLowerCase()} by...`}
                              className="min-h-[160px] text-sm resize-y"
                            />
                            <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                              {data.weaknesses.length} characters
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Report Settings Tab ── */}
        <TabsContent value="settings" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic report information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e) => updateSetting("title", e.target.value)}
                    placeholder="Feedback report for"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Candidate Name</Label>
                  <Input
                    id="owner"
                    value={settings.owner}
                    onChange={(e) => updateSetting("owner", e.target.value)}
                    placeholder="Nina Salih"
                  />
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sendToCandidates"
                    checked={settings.sendToCandidates}
                    onCheckedChange={(v) => updateSetting("sendToCandidates", v === true)}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="sendToCandidates">Send to candidates on completion</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically email the finalised report to the candidate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Save as Template</CardTitle>
                <CardDescription>Save this report layout as a reusable template.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={settings.templateName}
                    onChange={(e) => updateSetting("templateName", e.target.value)}
                    placeholder="e.g. Standard Performance Review"
                  />
                </div>
                <Button className="w-full gap-2" onClick={() => {}}>
                  <Save className="size-4" />
                  Save Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove section?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {pendingDeleteTypeName} content configured for some constructs. Removing this section means that content will no longer appear in the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingDeleteId) removeSection(pendingDeleteId) }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
