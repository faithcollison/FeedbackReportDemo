"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { FeedbackReport, ReportType } from "@/lib/types"
import {
  Plus,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Settings2,
  ImageIcon,
  Save,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────

type SectionType = "header" | "paragraph" | "strengths-group" | "development-group" | "strengths" | "weaknesses"

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

interface SavedReportTemplate {
  id: string
  name: string
  createdAt: string
  sections: ReportSection[]
  sectionStyles: Record<string, SectionStyle>
  constructData: Record<string, ConstructData>
}

interface SavedReportDraft {
  reportId: string
  savedAt: string
  sections: ReportSection[]
  sectionStyles: Record<string, SectionStyle>
  constructData: Record<string, ConstructData>
  settings: ReportSettings
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
  { type: "header", label: "Header", description: "Logo header" },
  { type: "paragraph", label: "Text Content", description: "Custom paragraph section" },
  { type: "strengths-group", label: "Strength Areas", description: "Group for strength constructs" },
  { type: "development-group", label: "Development Areas", description: "Group for development area constructs" },
]

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: "1", type: "header", label: "Header" },
  { id: "2", type: "paragraph", label: "How the assessment works" },
  { id: "3", type: "paragraph", label: "Report contents" },
  { id: "6", type: "strengths-group", label: "Strength Areas" },
  { id: "6a", type: "strengths", label: "Strengths (Rank 1)", parentId: "6" },
  { id: "8", type: "development-group", label: "Development Areas" },
  { id: "8a", type: "weaknesses", label: "Weaknesses (Rank 1)", parentId: "8" },
  { id: "10", type: "paragraph", label: "Tips and closing" },
]

const DEFAULT_SETTINGS: ReportSettings = {
  templateName: "",
}

const TEMPLATE_STORAGE_KEY = "report-builder-templates"
const REPORT_DRAFT_STORAGE_KEY = "report-builder-report-drafts"

const HEADER_TITLE_TOKENS = [
  { label: "Candidate Name", token: "{{candidateName}}" },
]
const HEADER_PREVIEW_CANDIDATE_NAME = "Joe Bloggs"
const HEADER_PREVIEW_ASSESSMENT_NAME = "Example Assessment 1"

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
      titleText: "Feedback report for {{candidateName}}",
      content: "For assessment: Amey Early Careers Online Assessment 2025 \u2013 2026",
      logoUrl: "",
    },
    "2": {
      bgColor: "#ffffff",
      textColor: "#000000",
      showTitle: true,
      titleText: "How the assessment works",
      titleBgColor: "#4338ca",
      titleTextColor: "#ffffff",
      content: `How the assessment works

You completed an online assessment which measures the strengths that enable high performance at Amey.

During the assessment, your responses were carefully scored using a methodology based on reputable, peer-reviewed science, with robust evidence supporting its effectiveness. The scoring algorithms promote diversity and neurodiversity by adapting to every candidate to account for individual differences in processing information and making decisions.`,
    },
    "3": {
      bgColor: "#ffffff",
      textColor: "#000000",
      showTitle: true,
      titleText: "Report contents",
      titleBgColor: "#4338ca",
      titleTextColor: "#ffffff",
      content: `Report contents

To help you better understand yourself, and the type of work you would enjoy, this report outlines your top two strengths and one development area. At the end of the report, you will also find tips on how to further understand and develop your natural strengths and mitigate any potential weaknesses.`,
    },
    "6": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: `Your top two strengths are likely to be things that you do well and tend to enjoy. When you can use these strengths in your daily tasks, it is likely that you will be more productive, and engaged with what you are doing.

As you consider your responsibilities, role and daily activities, think about how you might find ways to play to these strengths to further enhance your performance and mental wellbeing. People who use their strengths at work consistently report feeling happier, less prone to stress, and more productive.`,
      showTitle: true,
      titleText: "Your top two strengths",
      titleBgColor: "#4338ca",
      titleTextColor: "#ffffff",
    },
    "8": {
      bgColor: "#ffffff",
      textColor: "#000000",
      content: "",
      showTitle: true,
      titleText: "Your top development area",
      titleBgColor: "#4338ca",
      titleTextColor: "#ffffff",
    },
    "10": {
      bgColor: "#ffffff",
      textColor: "#000000",
      showTitle: true,
      titleText: "Hints and tips",
      titleBgColor: "#4338ca",
      titleTextColor: "#ffffff",
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

const DEFAULT_STYLE: SectionStyle = {
  bgColor: "#ffffff",
  textColor: "#000000",
  content: "",
  logoUrl: "",
  showTitle: false,
  titleText: "",
  titleBgColor: "#4338ca",
  titleTextColor: "#ffffff",
}
// ── Main Component ─────────────────────────────────────────

interface ReportCanvasProps {
  report: FeedbackReport
  onUpdateReport: (
    reportId: string,
    patch: Partial<Pick<FeedbackReport, "reportType" | "sendOnCompletion" | "useCustomEmailTemplate" | "sendgridTemplateId">>
  ) => void
}

export default function ReportCanvas({ report, onUpdateReport }: ReportCanvasProps) {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS)
  const [constructData, setConstructData] = useState<Record<string, ConstructData>>(buildDefaultConstructData)
  const [settings, setSettings] = useState<ReportSettings>(DEFAULT_SETTINGS)
  const [sectionStyles, setSectionStyles] = useState<Record<string, SectionStyle>>(buildDefaultSectionStyles)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSubsection, setSelectedSubsection] = useState<"title" | "content" | "logo" | null>(null)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [isSectionsPanelOpen, setIsSectionsPanelOpen] = useState(true)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false)
  const [pendingTemplateName, setPendingTemplateName] = useState("")
  const [savedTemplates, setSavedTemplates] = useState<SavedReportTemplate[]>([])

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null
  const isSelectedGroup =
    selectedSection?.type === "strengths-group" || selectedSection?.type === "development-group"
  const editingGroupTitle = isSelectedGroup && selectedSubsection === "title"
  const editingGroupContent = isSelectedGroup && selectedSubsection === "content"
  const editingParagraphTitle = selectedSection?.type === "paragraph" && selectedSubsection === "title"
  const editingParagraphContent = selectedSection?.type === "paragraph" && selectedSubsection === "content"
  const editingHeaderLogo = selectedSection?.type === "header" && selectedSubsection === "logo"
  const editingHeaderContent = selectedSection?.type === "header" && selectedSubsection === "content"
  const editingConstructSubsection =
    selectedSection?.type === "strengths" || selectedSection?.type === "weaknesses"

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

  function openSectionSettings(sectionId: string, subsection: "title" | "content" | "logo" | null = null) {
    setSelectedSectionId(sectionId)
    setSelectedSubsection(subsection)
  }

  function remapTemplateSections(
    templateSections: ReportSection[]
  ): { remappedSections: ReportSection[]; idMap: Record<string, string> } {
    const idMap: Record<string, string> = {}
    for (const section of templateSections) {
      idMap[section.id] = crypto.randomUUID()
    }

    const remappedSections = templateSections.map((section) => {
      const nextParentId = section.parentId ? idMap[section.parentId] : undefined
      return {
        ...section,
        id: idMap[section.id],
        parentId: nextParentId,
      }
    })

    return { remappedSections, idMap }
  }

  function addSection(type: SectionType, label: string) {
    if (type === "strengths-group") {
      const parentId = crypto.randomUUID()
      setSections([
        ...sections,
        { id: parentId, type, label: label || "Strength Areas" },
        { id: crypto.randomUUID(), type: "strengths", label: "Strengths (Rank 1)", parentId },
      ])
      updateStyle(parentId, {
        showTitle: true,
        titleText: "Strength Areas",
        titleBgColor: "#4338ca",
        titleTextColor: "#ffffff",
      })
      return
    }
    if (type === "development-group") {
      const parentId = crypto.randomUUID()
      setSections([
        ...sections,
        { id: parentId, type, label: label || "Development Areas" },
        { id: crypto.randomUUID(), type: "weaknesses", label: "Weaknesses (Rank 1)", parentId },
      ])
      updateStyle(parentId, {
        showTitle: true,
        titleText: "Development Areas",
        titleBgColor: "#4338ca",
        titleTextColor: "#ffffff",
      })
      return
    }
    const sectionId = crypto.randomUUID()
    setSections([...sections, { id: sectionId, type, label }])
    if (type === "paragraph") {
      updateStyle(sectionId, {
        showTitle: true,
        titleText: "Section title",
      })
    }
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
    if (selectedSectionId === id) setSelectedSubsection(null)
    if (editingLabelId === id) setEditingLabelId(null)
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
    if ((section.type === "strengths" || section.type === "weaknesses") && section.parentId) {
      const siblingCount = sections.filter((s) => s.parentId === section.parentId && s.type === section.type).length
      if (siblingCount <= 1) return
    }

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
    return sectionStyles[sectionId] ?? DEFAULT_STYLE
  }

  function updateStyle(sectionId: string, patch: Partial<SectionStyle>) {
    setSectionStyles((prev) => ({
      ...prev,
      [sectionId]: { ...getStyle(sectionId), ...patch },
    }))
  }

  function insertHeaderTitleToken(sectionId: string, token: string) {
    const current = getStyle(sectionId).titleText ?? ""
    const needsSpace = current.length > 0 && !current.endsWith(" ")
    updateStyle(sectionId, { titleText: `${current}${needsSpace ? " " : ""}${token}` })
  }

  function resolveHeaderTitleTemplate(template: string): string {
    const candidateName = HEADER_PREVIEW_CANDIDATE_NAME
    return template.replace(/\{\{\s*candidateName\s*\}\}/g, candidateName)
  }

  function resolveHeaderSubtitleTemplate(template: string): string {
    return template.replace(/\{\{\s*assessmentName\s*\}\}/g, HEADER_PREVIEW_ASSESSMENT_NAME)
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
  }

  const SECTION_TYPE_PALETTE_CLASSES: Record<SectionType, string> = {
    header: "border-violet-200 bg-violet-50 hover:bg-violet-100",
    paragraph: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    "strengths-group": "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
    "development-group": "border-amber-200 bg-amber-50 hover:bg-amber-100",
    strengths: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
    weaknesses: "border-amber-200 bg-amber-50 hover:bg-amber-100",
  }


  function updateSectionLabel(id: string, label: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)))
  }

  function loadSavedTemplates() {
    try {
      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY)
      if (!raw) {
        setSavedTemplates([])
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setSavedTemplates([])
        return
      }

      const validTemplates = parsed.filter(
        (item): item is SavedReportTemplate =>
          !!item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          Array.isArray(item.sections) &&
          typeof item.sectionStyles === "object" &&
          item.sectionStyles !== null &&
          typeof item.constructData === "object" &&
          item.constructData !== null
      )
      setSavedTemplates(validTemplates)
    } catch {
      setSavedTemplates([])
    }
  }

  function loadSavedReportDraft() {
    try {
      const raw = localStorage.getItem(REPORT_DRAFT_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return

      const draft = parsed.find((item) => item?.reportId === report.id) as SavedReportDraft | undefined
      if (!draft) return

      if (Array.isArray(draft.sections)) {
        setSections(draft.sections)
      }
      if (draft.sectionStyles && typeof draft.sectionStyles === "object") {
        setSectionStyles(draft.sectionStyles)
      }
      if (draft.constructData && typeof draft.constructData === "object") {
        setConstructData(draft.constructData)
      }
      if (draft.settings && typeof draft.settings === "object") {
        setSettings(draft.settings)
      }
    } catch {
      // ignore malformed storage payloads
    }
  }

  function saveReport() {
    try {
      const raw = localStorage.getItem(REPORT_DRAFT_STORAGE_KEY)
      const existing = raw ? JSON.parse(raw) : []
      const drafts: SavedReportDraft[] = Array.isArray(existing) ? existing : []

      const nextDraft: SavedReportDraft = {
        reportId: report.id,
        savedAt: new Date().toISOString(),
        sections,
        sectionStyles,
        constructData,
        settings,
      }

      const filtered = drafts.filter((draft) => draft.reportId !== report.id)
      const next = [nextDraft, ...filtered]
      localStorage.setItem(REPORT_DRAFT_STORAGE_KEY, JSON.stringify(next))

      toast({
        title: "Report saved",
        description: "Your layout and content changes are saved for this report.",
      })
    } catch {
      toast({
        title: "Save failed",
        description: "Could not save this report. Please try again.",
      })
    }
  }

  function openSaveTemplateDialog() {
    setPendingTemplateName(settings.templateName)
    setSaveTemplateDialogOpen(true)
  }

  function saveTemplate(templateNameInput?: string) {
    const templateName = (templateNameInput ?? settings.templateName).trim()
    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Enter a template name before saving.",
      })
      return false
    }

    const template: SavedReportTemplate = {
      id: crypto.randomUUID(),
      name: templateName,
      createdAt: new Date().toISOString(),
      sections,
      sectionStyles,
      constructData,
    }

    const nextTemplates = [template, ...savedTemplates]
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(nextTemplates))
    setSavedTemplates(nextTemplates)
    toast({
      title: "Template saved",
      description: `"${templateName}" is now available in Import Template.`,
    })
    setSettings((prev) => ({ ...prev, templateName }))
    return true
  }

  function importTemplate(templateId: string) {
    const template = savedTemplates.find((t) => t.id === templateId)
    if (!template) return

    const { remappedSections, idMap } = remapTemplateSections(template.sections)
    const importedStyles: Record<string, SectionStyle> = {}

    for (const originalSection of template.sections) {
      const nextId = idMap[originalSection.id]
      const sourceStyle = template.sectionStyles[originalSection.id]
      importedStyles[nextId] = {
        ...DEFAULT_STYLE,
        showTitle: sourceStyle?.showTitle ?? DEFAULT_STYLE.showTitle,
        titleText: sourceStyle?.titleText ?? DEFAULT_STYLE.titleText,
        content: sourceStyle?.content ?? DEFAULT_STYLE.content,
      }
    }

    setSections((prev) => [...prev, ...remappedSections])
    setSectionStyles((prev) => ({ ...prev, ...importedStyles }))
    setConstructData((prev) => {
      const next: Record<string, ConstructData> = { ...prev }
      for (const construct of CONSTRUCTS) {
        const templateConstruct = template.constructData[construct.id]
        if (!templateConstruct) continue
        next[construct.id] = {
          strengths: templateConstruct.strengths ?? "",
          weaknesses: templateConstruct.weaknesses ?? "",
        }
      }
      return next
    })
    toast({
      title: "Template imported",
      description: `"${template.name}" imported with section text only (no colours).`,
    })
  }

  // ── Preview helper ──

  useEffect(() => {
    loadSavedTemplates()
  }, [])

  useEffect(() => {
    loadSavedReportDraft()
  }, [report.id])

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
    <div className="w-full max-w-none px-4 py-8">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Configure your report layout, content, and settings.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Import Template</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {savedTemplates.length === 0 ? (
                    <DropdownMenuItem disabled>No saved templates</DropdownMenuItem>
                  ) : (
                    savedTemplates.map((template) => (
                      <DropdownMenuItem key={template.id} onClick={() => importTemplate(template.id)}>
                        {template.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
              <Button className="gap-2" onClick={saveReport}>
                <Save className="size-4" />
                Save Report
              </Button>
              <Button variant="outline" className="gap-2" onClick={openSaveTemplateDialog}>
                <Save className="size-4" />
                Save as New Template
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
          <div className={`grid grid-cols-1 items-start gap-6 ${isSectionsPanelOpen ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[32px_1fr]"}`}>
            <Card className="md:order-2">
              <CardHeader>
                <CardTitle>Report Layout</CardTitle>
                <CardDescription>
                  Click a section to configure it. Use the drawer to add subsections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topLevelSections.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No sections added yet. Add sections from the palette on the left.
                  </p>
                )}
                {topLevelSections.map((section) => {
                  const globalIndex = sections.findIndex((s) => s.id === section.id)
                  const isGroup =
                    section.type === "strengths-group" || section.type === "development-group"
                  const constructChildren = isGroup
                    ? getChildren(section.id).filter((c) =>
                        section.type === "strengths-group"
                          ? c.type === "strengths"
                          : c.type === "weaknesses"
                      )
                    : []
                  return (
                    <div key={section.id} className="space-y-2">
                      <div
                        className={
                          "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors " +
                          (selectedSectionId === section.id
                            ? `border-primary ring-1 ring-primary/30 ${SECTION_TYPE_PALETTE_CLASSES[section.type]}`
                            : SECTION_TYPE_PALETTE_CLASSES[section.type])
                        }
                        onClick={() => openSectionSettings(section.id)}
                      >
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          {editingLabelId === section.id ? (
                            <Input
                              value={section.label}
                              onChange={(e) => updateSectionLabel(section.id, e.target.value)}
                              placeholder={SECTION_TYPE_NAMES[section.type] || section.type}
                              className="h-8 text-sm"
                              autoFocus
                              onBlur={() => setEditingLabelId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setEditingLabelId(null)
                                }
                                if (e.key === "Escape") {
                                  setEditingLabelId(null)
                                }
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className="h-8 w-full rounded px-2 text-left text-sm font-medium hover:bg-accent/50"
                              onClick={() => setEditingLabelId(section.id)}
                            >
                              {section.label || SECTION_TYPE_NAMES[section.type] || section.type}
                            </button>
                          )}
                        </div>
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
                      {isGroup && (
                        <div className="ml-7 border-l pl-3 space-y-2">
                          {getStyle(section.id).showTitle !== false ? (
                            <div
                              role="button"
                              tabIndex={0}
                              className={
                                "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                                (selectedSectionId === section.id && selectedSubsection === "title"
                                  ? "border-primary bg-primary/5"
                                  : "")
                              }
                              onClick={() => openSectionSettings(section.id, "title")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  openSectionSettings(section.id, "title")
                                }
                              }}
                            >
                              <span>Title</span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStyle(section.id, { showTitle: false })
                                  if (selectedSectionId === section.id && selectedSubsection === "title") {
                                    setSelectedSubsection(null)
                                  }
                                }}
                              >
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="h-10 w-fit gap-2"
                              onClick={() => {
                                updateStyle(section.id, { showTitle: true })
                                openSectionSettings(section.id, "title")
                              }}
                            >
                              <Plus className="size-4 text-emerald-600" />
                              Add title
                            </Button>
                          )}
                          <button
                            type="button"
                            className={
                              "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                              (selectedSectionId === section.id && selectedSubsection === "content"
                                ? "border-primary bg-primary/5"
                                : "")
                            }
                            onClick={() => openSectionSettings(section.id, "content")}
                          >
                            <span>Content</span>
                          </button>
                          {constructChildren.map((child, idx) => (
                            <div
                              key={child.id}
                              role="button"
                              tabIndex={0}
                              className={
                                "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 text-sm hover:bg-accent/50 " +
                                (selectedSectionId === child.id ? "border-primary bg-primary/5" : "")
                              }
                              onClick={() => openSectionSettings(child.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  openSectionSettings(child.id)
                                }
                              }}
                            >
                              <span>Construct {idx + 1}</span>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={constructChildren.length <= 1}
                                  onClick={() => requestRemoveSection(child.id)}
                                >
                                  <Trash2 className="size-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() =>
                                  addSubsection(
                                    section.id,
                                    section.type === "strengths-group" ? "strengths" : "weaknesses"
                                  )
                                }
                                disabled={constructChildren.length >= 3}
                              >
                                <Plus className="size-3.5 text-emerald-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {constructChildren.length >= 3
                                ? "Maximum of 3 construct sections reached"
                                : "Add construct section"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                      {section.type === "paragraph" && (
                        <div className="ml-7 border-l pl-3 space-y-2">
                          {getStyle(section.id).showTitle !== false ? (
                            <div
                              role="button"
                              tabIndex={0}
                              className={
                                "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                                (selectedSectionId === section.id && selectedSubsection === "title"
                                  ? "border-primary bg-primary/5"
                                  : "")
                              }
                              onClick={() => openSectionSettings(section.id, "title")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  openSectionSettings(section.id, "title")
                                }
                              }}
                            >
                              <span>Title</span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStyle(section.id, { showTitle: false })
                                  if (selectedSectionId === section.id && selectedSubsection === "title") {
                                    setSelectedSubsection(null)
                                  }
                                }}
                              >
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="h-10 w-fit gap-2"
                              onClick={() => {
                                updateStyle(section.id, { showTitle: true })
                                openSectionSettings(section.id, "title")
                              }}
                            >
                              <Plus className="size-4 text-emerald-600" />
                              Add title
                            </Button>
                          )}
                          <button
                            type="button"
                            className={
                              "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                              (selectedSectionId === section.id && selectedSubsection === "content"
                                ? "border-primary bg-primary/5"
                                : "")
                            }
                            onClick={() => openSectionSettings(section.id, "content")}
                          >
                            <span>Content</span>
                          </button>
                        </div>
                      )}
                      {section.type === "header" && (
                        <div className="ml-7 border-l pl-3 space-y-2">
                          <button
                            type="button"
                            className={
                              "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                              (selectedSectionId === section.id && selectedSubsection === "content"
                                ? "border-primary bg-primary/5"
                                : "")
                            }
                            onClick={() => openSectionSettings(section.id, "content")}
                          >
                            <span>Content</span>
                          </button>
                          <button
                            type="button"
                            className={
                              "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 " +
                              (selectedSectionId === section.id && selectedSubsection === "logo"
                                ? "border-primary bg-primary/5"
                                : "")
                            }
                            onClick={() => openSectionSettings(section.id, "logo")}
                          >
                            <span>Logo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {isSectionsPanelOpen ? (
              <Card className="md:order-1">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>Sections</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsSectionsPanelOpen(false)}
                      title="Hide sections"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                  </div>
                  <CardDescription>Click to add a section to the layout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {AVAILABLE_SECTIONS.map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left cursor-pointer transition-colors ${SECTION_TYPE_PALETTE_CLASSES[s.type]}`}
                      onClick={() => addSection(s.type, "")}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="md:order-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-8 p-0"
                  onClick={() => setIsSectionsPanelOpen(true)}
                  title="Show sections"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* ── Section Settings Sheet ── */}
          <Sheet open={selectedSectionId !== null} onOpenChange={(open) => { if (!open) { setSelectedSectionId(null); setSelectedSubsection(null) } }}>
            <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Settings2 className="size-4" />
                  {selectedSection
                    ? selectedSubsection
                      ? `${selectedSection.label || SECTION_TYPE_NAMES[selectedSection.type] || selectedSection.type} ${selectedSubsection.charAt(0).toUpperCase()}${selectedSubsection.slice(1)}`
                      : `${selectedSection.label || SECTION_TYPE_NAMES[selectedSection.type] || selectedSection.type} Settings`
                    : "Section Settings"}
                </SheetTitle>
                <SheetDescription>
                  {editingGroupTitle
                    ? "Editing title settings for this group."
                    : editingGroupContent
                    ? "Editing content and styling for this group."
                    : "Customise the appearance of this section."}
                </SheetDescription>
              </SheetHeader>

              {selectedSection && (
                <div className="space-y-6 px-4 pb-4">

                  <Separator />

                  {editingGroupTitle && (
                    <>
                      {getStyle(selectedSection.id).showTitle !== false ? (
                        <>
                          <div className="space-y-3">
                            <Label>Title</Label>
                            <Input
                              value={getStyle(selectedSection.id).titleText ?? ""}
                              onChange={(e) => updateStyle(selectedSection.id, { titleText: e.target.value })}
                              placeholder="Group title..."
                            />
                          </div>
                          <div className="space-y-3">
                            <Label>Title Background Colour</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={getStyle(selectedSection.id).titleBgColor ?? "#4338ca"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleBgColor: e.target.value })}
                                className="w-10 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={getStyle(selectedSection.id).titleBgColor ?? "#4338ca"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleBgColor: e.target.value })}
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label>Title Text Colour</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={getStyle(selectedSection.id).titleTextColor ?? "#ffffff"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleTextColor: e.target.value })}
                                className="w-10 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={getStyle(selectedSection.id).titleTextColor ?? "#ffffff"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleTextColor: e.target.value })}
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          This section title is removed. Use the + button on the Title subsection row in Layout to add it back.
                        </p>
                      )}
                      <Separator />
                    </>
                  )}

                  {editingGroupContent && (
                    <>
                      <div className="space-y-3">
                        <Label>Content</Label>
                        <Textarea
                          value={getStyle(selectedSection.id).content ?? ""}
                          onChange={(e) => updateStyle(selectedSection.id, { content: e.target.value })}
                          placeholder="Enter content text..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <Separator />
                    </>
                  )}

                  {(selectedSection.type === "strengths" || selectedSection.type === "weaknesses") && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Construct content text is edited in the <span className="font-medium">Construct Content</span> tab. Use this panel to edit subsection colours only.
                      </p>
                      <Separator />
                    </>
                  )}

                  {editingParagraphTitle && (
                    <>
                      {getStyle(selectedSection.id).showTitle !== false ? (
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
                            <Label>Title Background Colour</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={getStyle(selectedSection.id).titleBgColor ?? "#4338ca"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleBgColor: e.target.value })}
                                className="w-10 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={getStyle(selectedSection.id).titleBgColor ?? "#4338ca"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleBgColor: e.target.value })}
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label>Title Text Colour</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={getStyle(selectedSection.id).titleTextColor ?? "#ffffff"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleTextColor: e.target.value })}
                                className="w-10 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={getStyle(selectedSection.id).titleTextColor ?? "#ffffff"}
                                onChange={(e) => updateStyle(selectedSection.id, { titleTextColor: e.target.value })}
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          This section title is removed. Use the + button on the Title subsection row in Layout to add it back.
                        </p>
                      )}
                      <Separator />
                    </>
                  )}

                  {/* Body colour settings */}
                  {(editingGroupContent || editingParagraphContent || editingConstructSubsection || (selectedSection.type === "header" && (editingHeaderContent || selectedSubsection === null))) && (
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

                  {/* Free Text content */}
                  {editingParagraphContent && (
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

                  {/* Header logo and content */}
                  {selectedSection.type === "header" && (
                    <>
                      <Separator />
                      {(editingHeaderContent || selectedSubsection === null) && (
                        <div className="space-y-3">
                          <Label>Header Title</Label>
                          <Input
                            value={getStyle(selectedSection.id).titleText ?? ""}
                            onChange={(e) => updateStyle(selectedSection.id, { titleText: e.target.value })}
                            placeholder="Feedback report for {{candidateName}}"
                          />
                          <div className="flex flex-wrap gap-2">
                            {HEADER_TITLE_TOKENS.map((t) => (
                              <Button
                                key={t.token}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertHeaderTitleToken(selectedSection.id, t.token)}
                              >
                                {t.label}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Preview: {resolveHeaderTitleTemplate(getStyle(selectedSection.id).titleText ?? "Feedback report for {{candidateName}}")}
                          </p>
                          <Label>Subtitle</Label>
                          <Input
                            value={getStyle(selectedSection.id).content ?? ""}
                            onChange={(e) => updateStyle(selectedSection.id, { content: e.target.value })}
                            placeholder="e.g. For assessment: ..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Preview: {resolveHeaderSubtitleTemplate(getStyle(selectedSection.id).content ?? "For assessment: {{assessmentName}}")}
                          </p>
                        </div>
                      )}
                      {(editingHeaderLogo || selectedSubsection === null) && (
                        <div className="space-y-3">
                          <Label>Logo</Label>
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
                      )}
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
                              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:shadow-none px-2 pb-2"
                            >
                              If Strength
                            </TabsTrigger>
                            <TabsTrigger
                              value="weaknesses"
                              className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-800 data-[state=active]:shadow-none px-2 pb-2"
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
                                className="min-h-[160px] bg-emerald-50 border-emerald-200 text-sm resize-y"
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
                                className="min-h-[160px] bg-rose-50 border-rose-200 text-sm resize-y"
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
                              className="min-h-[160px] bg-emerald-50 border-emerald-200 text-sm resize-y"
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
                              className="min-h-[160px] bg-rose-50 border-rose-200 text-sm resize-y"
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
          <div className="flex flex-col gap-6">
            <Card className="mx-auto w-full md:w-1/2">
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic report information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="audience-select">Report type</Label>
                  <Select
                    value={report.reportType}
                    onValueChange={(value) => {
                      onUpdateReport(report.id, { reportType: value as ReportType })
                    }}
                  >
                    <SelectTrigger id="audience-select">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Email sending</p>
                  <p className="text-xs text-muted-foreground">
                    Configure how report emails are delivered.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="auto-send-toggle">Auto send on completion</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically email this report when the assessment is completed.
                    </p>
                  </div>
                  <Switch
                    id="auto-send-toggle"
                    checked={report.sendOnCompletion}
                    onCheckedChange={(checked) => {
                      onUpdateReport(report.id, { sendOnCompletion: checked })
                    }}
                    disabled={report.reportType !== "candidate"}
                  />
                </div>
                {report.reportType !== "candidate" && (
                  <p className="text-xs text-muted-foreground">
                    Auto-send is only available for candidate reports.
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="custom-template-toggle">Use custom email template</Label>
                    <p className="text-xs text-muted-foreground">
                      Send with a specific SendGrid dynamic template.
                    </p>
                  </div>
                  <Switch
                    id="custom-template-toggle"
                    checked={report.useCustomEmailTemplate}
                    onCheckedChange={(checked) => {
                      onUpdateReport(report.id, { useCustomEmailTemplate: checked })
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If this is off, emails are sent using the default template.
                </p>

                {report.useCustomEmailTemplate && (
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-template-id">SendGrid template ID</Label>
                    <Input
                      id="sendgrid-template-id"
                      value={report.sendgridTemplateId}
                      onChange={(e) => {
                        onUpdateReport(report.id, { sendgridTemplateId: e.target.value })
                      }}
                      placeholder="e.g. d-1234567890abcdef1234567890abcdef"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>

        <aside className="hidden lg:block w-56 shrink-0">
          <div className="fixed right-4 top-24 w-56 space-y-2 rounded-lg border bg-card p-3">
            <Button className="w-full gap-2" onClick={saveReport}>
              <Save className="size-4" />
              Save Report
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={openSaveTemplateDialog}>
              <Save className="size-4" />
              Save as New Template
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={openPreview}>
              <Eye className="size-4" />
              Preview Report
            </Button>
          </div>
        </aside>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog
        open={saveTemplateDialogOpen}
        onOpenChange={(open) => {
          setSaveTemplateDialogOpen(open)
          if (!open) {
            setPendingTemplateName(settings.templateName)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as new template</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a template name for this layout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="save-template-name">Template Name</Label>
            <Input
              id="save-template-name"
              value={pendingTemplateName}
              onChange={(e) => setPendingTemplateName(e.target.value)}
              placeholder="e.g. Standard Performance Review"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                const didSave = saveTemplate(pendingTemplateName)
                if (!didSave) {
                  e.preventDefault()
                  return
                }
                setSaveTemplateDialogOpen(false)
              }}
            >
              Save Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

