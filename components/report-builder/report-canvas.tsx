"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, GripVertical, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeedbackReport } from "@/lib/types";

interface ReportCanvasProps {
  report: FeedbackReport;
  startEmpty?: boolean;
  onHydratedFromDraft?: (reportId: string) => void;
  onUpdateReport: (
    reportId: string,
    patch: Partial<
      Pick<
        FeedbackReport,
        | "reportType"
        | "sendOnCompletion"
        | "useCustomEmailTemplate"
        | "sendgridTemplateId"
      >
    >,
  ) => void;
}

interface ConstructBankEntry {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
}

interface HeaderSection {
  id: string;
  type: "header";
  title: string;
  bgColor: string;
  logoUrl?: string;
  logoName?: string;
}

interface TextSection {
  id: string;
  type: "text";
  role: "intro" | "closing" | "custom";
  label: string;
  title: string;
  showTitle: boolean;
  content: string;
  titleBgColor: string;
  contentBgColor: string;
}

interface ConstructSection {
  id: string;
  type: "construct";
  role: "strength" | "development";
  title: string;
  introText: string;
  introBgColor: string;
  titleBgColor: string;
  selectedConstructId: string;
  numberToShow: "1" | "2" | "3";
  textByConstructId: Record<string, string>;
  contentBgColor: string;
}

interface PreviewReportSection {
  id: string;
  type: string;
  label: string;
}

interface PreviewSectionStyle {
  content?: string;
  titleText?: string;
  titleBgColor?: string;
  numberToShow?: number;
  logoUrl?: string;
  logoName?: string;
}

interface PreviewDataPayload {
  sections: PreviewReportSection[];
  constructData: Record<string, { strengths: string; weaknesses: string }>;
  settings: { templateName: string };
  sectionStyles: Record<string, PreviewSectionStyle>;
}

interface SavedTemplateSection {
  type: "header" | "text" | "construct";
  role?: "intro" | "closing" | "custom" | "strength" | "development";
  label?: string;
  title?: string;
  showTitle?: boolean;
  content?: string;
  introText?: string;
  selectedConstructId?: string;
  numberToShow?: "1" | "2" | "3";
  logoUrl?: string;
  logoName?: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  createdAt: string;
  sections: SavedTemplateSection[];
}

interface TemplateListItem {
  id: string;
  name: string;
}

type BuilderSection = HeaderSection | TextSection | ConstructSection;

type DragPayload = { kind: "move"; sectionId: string };

const CONSTRUCT_BANK_STORAGE_KEY = "report-builder-construct-bank";
const PREVIEW_STORAGE_KEY = "report-preview-data";
const TEMPLATE_STORAGE_KEY = "report-builder-templates";
const DEFAULT_TITLE_BG = "#6f9f87";
const DEFAULT_TEXT_BG = "#ffffff";

const FALLBACK_ENTRIES: ConstructBankEntry[] = [
  {
    id: "collaboration",
    name: "Collaboration",
    strengths: `Your responses indicate you enjoy working in a team and can effectively collaborate with others to deliver results. Your ability to engage with a wide range of people and leverage their diverse skill sets is a strength that can lead to successful project outcomes and a positive working environment.

Taking this strength further...

* Enhance your communication skills. Clear and open communication is the foundation of effective collaboration. Focus on refining your ability to convey ideas, listen actively, and encourage others to share their thoughts.
* Embrace diversity. Seek to collaborate with people you would not usually work with. By actively seeking out and embracing diverse viewpoints, you can drive innovation and find more comprehensive solutions to challenges.
* Invest in relationship building. Take time to connect with your colleagues outside of immediate project needs. Understanding their working styles and motivations can greatly enhance your collaboration.

Top tip: Your collaboration skills are a great asset but balancing them with individual responsibility is crucial. While teamwork is important, remember to also take ownership of your tasks and contribute your best work to the team. This approach will boost project success and highlight you as a reliable and valued team member.`,
    weaknesses:
      "",
  },
  {
    id: "safety-security",
    name: "Safety & Security Mindset",
    strengths: `Your results show that you understand the importance of safety and security rules and are committed to consistently following them. This strength is critical in our industry, where safety is paramount to the success of projects and the well-being of all involved.

Taking this strength further...

* Be a safety advocate. Actively promote safe practices amongst your peers or teammates, both in and outside the workplace. For example, remind others of safety protocols during projects or even how to stay safe when driving, or online.
* Expand your safety knowledge. As you enter the workplace, seek to deepen your understanding of safety rules and best practices. Reflect on how they are applied every day and the positive impact they have on people and the business.
* Proactively identify risks. Use your safety mindset to anticipate risks before they become issues, then report any hazards appropriately. By doing so, you can help prevent accidents and ensure that safety standards are consistently met.

Top tip: Remember that others may need more help seeing the value in safety rules. By relating them to everyday situations, you can encourage your peers to understand that these guidelines are not just regulations, but essential practices that protect everyone’s well-being. By making safety relatable and fostering a positive attitude towards these rules, you can contribute to a culture where everyone willingly adopts safe practices.`,
    weaknesses:
      "",
  },
  {
    id: "initiative",
    name: "Initiative",
    strengths:
      "",
    weaknesses: `Your responses suggest that taking initiative in uncertain situations may not always come naturally to you. Developing this skill is important, as being proactive and resourceful is key to driving projects forward and overcoming challenges. By improving your ability to take initiative, you'll gain confidence in making decisions and contribute more meaningfully to your team's success.

To further develop in this area...

* Start small. Begin by identifying areas in your current tasks where you can take the lead. Even small steps, like suggesting a new approach on a team project or volunteering for a task, can help build your confidence in taking initiative.
* Observe and learn. Pay attention to how others around you take initiative, especially in uncertain situations. Notice their thought processes and actions, and consider how you can apply similar strategies in your own work.
* Step outside your comfort zone. Volunteer for tasks that are slightly beyond your current expertise or take on responsibilities that require solving unfamiliar problems. These experiences will enhance your initiative by exposing you to new challenges.

Development tip: When faced with a new or uncertain situation, pause and think about what steps you can take to move forward. Even if the next step isn’t clear, taking action -no matter how small - can help you build momentum and develop your ability to think on your feet. Regularly practising this will enhance your confidence and ability to take initiative in any situation.`,
  },
];

function createConstructMap(
  entries: ConstructBankEntry[],
  role: "strength" | "development",
): Record<string, string> {
  return Object.fromEntries(
    entries.map((entry) => [
      entry.id,
      role === "strength" ? entry.strengths : entry.weaknesses,
    ]),
  );
}

function createConstructSection(
  entries: ConstructBankEntry[],
  role: "strength" | "development",
): ConstructSection {
  return {
    id: role === "strength" ? "strength-default" : "development-default",
    type: "construct",
    role,
    title: role === "strength" ? "Strength Areas" : "Development Areas",
    introText:
      role === "strength"
        ? "The following areas represent your greatest strengths based on your assessment results:"
        : "The following areas have been identified as opportunities for development:",
    introBgColor: DEFAULT_TEXT_BG,
    titleBgColor: DEFAULT_TITLE_BG,
    selectedConstructId: entries[0]?.id ?? "",
    numberToShow: "1",
    textByConstructId: createConstructMap(entries, role),
    contentBgColor: DEFAULT_TEXT_BG,
  };
}

function createInitialSections(
  entries: ConstructBankEntry[],
): BuilderSection[] {
  const strengthsSection: ConstructSection = {
    ...createConstructSection(entries, "strength"),
    id: "strength-default",
    title: "Your top two strengths",
    introText:
      "Your top two strengths are likely to be things that you do well and tend to enjoy. When you can use these strengths in your daily tasks, it is likely that you will be more productive and engaged with what you are doing.\n\nAs you consider your responsibilities, role and daily activities, think about how you might find ways to play to these strengths to further enhance your performance and mental wellbeing.",
    selectedConstructId: entries.find((e) => e.id === "collaboration")?.id ?? entries[0]?.id ?? "",
    numberToShow: "2",
  };

  const developmentSection: ConstructSection = {
    ...createConstructSection(entries, "development"),
    id: "development-default",
    title: "Your top development area",
    introText: "",
    selectedConstructId: entries.find((e) => e.id === "initiative")?.id ?? entries[0]?.id ?? "",
    numberToShow: "1",
  };

  return [
    {
      id: "header-default",
      type: "header",
      title: "Feedback report for Candidate Name",
      bgColor: "#457b58",
      logoUrl: "",
      logoName: "",
    },
    {
      id: "intro-1",
      type: "text",
      role: "intro",
      label: "How the assessment works",
      title: "How the assessment works",
      showTitle: true,
      content:
        "You completed an online assessment which measures the strengths that enable high performance at Amey.\n\nDuring the assessment, your responses were carefully scored using a methodology based on reputable, peer-reviewed science, with robust evidence supporting its effectiveness. The scoring algorithms promote diversity and neurodiversity by adapting to every candidate to account for individual differences in processing information and making decisions.",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
    {
      id: "intro-2",
      type: "text",
      role: "intro",
      label: "Report contents",
      title: "Report contents",
      showTitle: true,
      content:
        "To help you better understand yourself, and the type of work you would enjoy, this report outlines your top two strengths and one development area. At the end of the report, you will also find tips on how to further understand and develop your natural strengths and mitigate any potential weaknesses.",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
    strengthsSection,
    developmentSection,
    {
      id: "closing-1",
      type: "text",
      role: "closing",
      label: "Hints and tips",
      title: "Hints and tips",
      showTitle: true,
      content:
        "Research shows that people who know and use their strengths often achieve better results and feel more satisfied - both in work and in everyday life. Being aware of your strengths can guide you towards roles and tasks you’ll enjoy and excel at.\n\nHere are some essential tips to help you recognise and make the most of your strengths:\n\nAsk for honest feedback\nEngage with friends, family, teachers or mentors who've seen you in action, whether it’s during a team project, a family gathering, or a casual weekend hobby session. Ask them questions: What do they know you for? Which tasks or projects do you tackle with great ease or enthusiasm? When do they naturally turn to you for help or advice?\n\nLook at your daily habits\nKeep a light diary of your activities over a week or two. Notice which tasks you jump on straight away and enjoy, and which ones you avoid or delay. This can highlight the activities that come naturally to you, as well as those that feel more like a struggle – even if you might be able to do them well.\n\nSpot moments of 'flow'\n‘Flow’ is when you’re so absorbed in what you are doing that time flies by. Think about which tasks or projects get you into that zone - whether this is solving a tricky problem, helping people, or coming up with new ideas. The personal qualities you are using in these moments will be some of your top strengths.\n\nStrategically counteract weaknesses\nEveryone has strengths and weaknesses - it’s a normal part of being human. The key is to identify where you struggle and find ways to balance or address it by using your natural talents. For example, if you lack an eye for detail, team up with someone who excels at this and can give your work a final review while you develop in this area. In return, identify how you can help them using your strengths.\n\nThank you again for completing the assessment. We hope this report helps you discover and use your strengths as you choose and develop your future career.",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
  ];
}

function createBlankInitialSections(
  entries: ConstructBankEntry[],
): BuilderSection[] {
  const blankStrengthMap = Object.fromEntries(entries.map((entry) => [entry.id, ""]));

  return [
    {
      id: "header-default",
      type: "header",
      title: "",
      bgColor: "#457b58",
      logoUrl: "",
      logoName: "",
    },
    {
      id: "intro-1",
      type: "text",
      role: "intro",
      label: "Introduction",
      title: "",
      showTitle: false,
      content: "",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
    {
      ...createConstructSection(entries, "strength"),
      id: "strength-default",
      title: "Strength Areas",
      introText: "",
      textByConstructId: blankStrengthMap,
      selectedConstructId: entries[0]?.id ?? "",
      numberToShow: "1",
    },
    {
      id: "closing-1",
      type: "text",
      role: "closing",
      label: "Closing",
      title: "",
      showTitle: false,
      content: "",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
  ];
}

function isTextSection(section: BuilderSection): section is TextSection {
  return section.type === "text";
}

function isConstructSection(
  section: BuilderSection,
): section is ConstructSection {
  return section.type === "construct";
}

function getConstructBankDefaultText(
  entries: ConstructBankEntry[],
  role: "strength" | "development",
  constructId: string,
): string {
  const match = entries.find((entry) => entry.id === constructId);
  if (!match) return "";
  return role === "strength" ? match.strengths : match.weaknesses;
}

function buildPreviewPayload(sections: BuilderSection[]): PreviewDataPayload {
  const previewSections: PreviewReportSection[] = [];
  const sectionStyles: Record<string, PreviewSectionStyle> = {};
  const constructData: Record<string, { strengths: string; weaknesses: string }> = {};

  sections.forEach((section) => {
    if (section.type === "header") {
      previewSections.push({ id: section.id, type: "header", label: "Header" });
      sectionStyles[section.id] = {
        titleText: section.title,
        titleBgColor: section.bgColor,
        logoUrl: section.logoUrl,
        logoName: section.logoName,
      };
      return;
    }

    if (section.type === "text") {
      previewSections.push({
        id: section.id,
        type: "paragraph",
        label: section.label || section.title || "Text",
      });
      sectionStyles[section.id] = {
        content: section.content,
        titleText: section.showTitle ? section.title : "",
        titleBgColor: section.titleBgColor,
      };
      return;
    }

    const previewType =
      section.role === "strength" ? "strengths-group" : "development-group";
    previewSections.push({
      id: section.id,
      type: previewType,
      label: section.title || previewType,
    });
    sectionStyles[section.id] = {
      content: section.introText,
      titleText: section.title,
      titleBgColor: section.titleBgColor,
      numberToShow: Number(section.numberToShow),
    };

    const selectedConstructId = section.selectedConstructId || section.id;
    const selectedText = section.textByConstructId[selectedConstructId] ?? "";
    constructData[selectedConstructId] = {
      strengths: section.role === "strength" ? selectedText : "",
      weaknesses: section.role === "development" ? selectedText : "",
    };
  });

  return {
    sections: previewSections,
    constructData,
    settings: { templateName: "Hardcoded Template" },
    sectionStyles,
  };
}

function extractTemplateSections(
  sections: BuilderSection[],
): SavedTemplateSection[] {
  return sections.map((section) => {
    if (section.type === "header") {
      return {
        type: "header",
        title: section.title,
        logoUrl: section.logoUrl,
        logoName: section.logoName,
      };
    }

    if (section.type === "text") {
      return {
        type: "text",
        role: section.role,
        label: section.label,
        title: section.title,
        showTitle: section.showTitle,
        content: section.content,
      };
    }

    return {
      type: "construct",
      role: section.role,
      title: section.title,
      introText: section.introText,
      selectedConstructId: section.selectedConstructId,
      numberToShow: section.numberToShow,
    };
  });
}

function buildSectionsFromTemplate(
  template: SavedTemplate,
  entries: ConstructBankEntry[],
): BuilderSection[] {
  const next: BuilderSection[] = [];

  template.sections.forEach((saved, idx) => {
    if (saved.type === "header") {
      next.push({
        id: `header-${idx}`,
        type: "header",
        title: saved.title || "Feedback report for Candidate Name",
        bgColor: "#457b58",
        logoUrl: saved.logoUrl || "",
        logoName: saved.logoName || "",
      });
      return;
    }

    if (saved.type === "text") {
      next.push({
        id: `text-${idx}`,
        type: "text",
        role:
          saved.role === "intro" ||
          saved.role === "closing" ||
          saved.role === "custom"
            ? saved.role
            : "custom",
        label: saved.label || saved.title || "Free Text",
        title: saved.title || "",
        showTitle: saved.showTitle ?? true,
        content: saved.content || "",
        titleBgColor: DEFAULT_TITLE_BG,
        contentBgColor: DEFAULT_TEXT_BG,
      });
      return;
    }

    const role = saved.role === "development" ? "development" : "strength";
    const base = createConstructSection(entries, role);
    const selectedConstructId = entries.some(
      (entry) => entry.id === saved.selectedConstructId,
    )
      ? saved.selectedConstructId || base.selectedConstructId
      : base.selectedConstructId;

    next.push({
      ...base,
      id: `construct-${role}-${idx}`,
      title: saved.title || base.title,
      introText: saved.introText ?? base.introText,
      selectedConstructId,
      numberToShow: saved.numberToShow ?? base.numberToShow,
      titleBgColor: DEFAULT_TITLE_BG,
      introBgColor: DEFAULT_TEXT_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    });
  });

  if (!next.some((section) => section.type === "header")) {
    next.unshift({
      id: "header-fallback",
      type: "header",
      title: "Feedback report for Candidate Name",
      bgColor: "#457b58",
    });
  }

  return next;
}

function normalizePickerHex(value: string, fallback = "#ffffff"): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function BackgroundColorControl({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#6b7280]">Background</span>
      <input
        type="color"
        value={normalizePickerHex(value)}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-[#cfd6dc] bg-white p-1"
        aria-label={`${ariaLabel} picker`}
      />
    </div>
  );
}

export default function ReportCanvas({
  report,
  startEmpty = false,
  onHydratedFromDraft,
  onUpdateReport,
}: ReportCanvasProps) {
  const [constructBankEntries, setConstructBankEntries] =
    useState<ConstructBankEntry[]>(FALLBACK_ENTRIES);
  const [sections, setSections] = useState<BuilderSection[]>(() =>
    startEmpty
      ? createBlankInitialSections(FALLBACK_ENTRIES)
      : createInitialSections(FALLBACK_ENTRIES),
  );
  const [openById, setOpenById] = useState<Record<string, boolean>>(
    startEmpty
      ? {
          "header-default": false,
          "intro-1": false,
          "strength-default": false,
          "closing-1": false,
        }
      : {
          "header-default": false,
          "intro-1": false,
          "intro-2": false,
          "strength-default": false,
          "development-default": false,
          "closing-1": false,
        },
  );

  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);

  void onUpdateReport;

  useEffect(() => {
    const onPreviewRequest = () => {
      const payload = buildPreviewPayload(sections);
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload));
      window.open("/preview", "_blank", "noopener,noreferrer");
    };

    window.addEventListener("report-builder:open-preview", onPreviewRequest);
    return () => {
      window.removeEventListener("report-builder:open-preview", onPreviewRequest);
    };
  }, [sections]);

  useEffect(() => {
    const onSaveTemplate = () => {
      const name = window.prompt("Template name", "New Template")?.trim();
      if (!name) return;

      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      let existing: SavedTemplate[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            existing = parsed.filter(
              (item): item is SavedTemplate =>
                !!item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                Array.isArray(item.sections),
            );
          }
        } catch {
          existing = [];
        }
      }

      const nextTemplate: SavedTemplate = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
        sections: extractTemplateSections(sections),
      };

      localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify([nextTemplate, ...existing]),
      );
      window.dispatchEvent(new Event("report-builder:templates-updated"));
    };

    const onImportTemplate = (event: Event) => {
      const customEvent = event as CustomEvent<{ templateId?: string }>;
      const templateId = customEvent.detail?.templateId;
      if (!templateId) return;

      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (!raw) return;

      let templates: SavedTemplate[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          templates = parsed.filter(
            (item): item is SavedTemplate =>
              !!item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              Array.isArray(item.sections),
          );
        }
      } catch {
        return;
      }

      const selected = templates.find((template) => template.id === templateId);
      if (!selected) return;

      const rebuilt = buildSectionsFromTemplate(selected, constructBankEntries);
      setSections(rebuilt);
      setOpenById(
        Object.fromEntries(rebuilt.map((section) => [section.id, false])),
      );
      setEditingLabelId(null);
    };

    window.addEventListener("report-builder:save-template", onSaveTemplate);
    window.addEventListener(
      "report-builder:import-template",
      onImportTemplate as EventListener,
    );
    return () => {
      window.removeEventListener("report-builder:save-template", onSaveTemplate);
      window.removeEventListener(
        "report-builder:import-template",
        onImportTemplate as EventListener,
      );
    };
  }, [constructBankEntries, sections]);

  useEffect(() => {
    const loadTemplates = () => {
      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (!raw) {
        setTemplates([]);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          setTemplates([]);
          return;
        }

        const valid = parsed.filter(
          (item): item is TemplateListItem =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.name === "string",
        );
        setTemplates(valid);
      } catch {
        setTemplates([]);
      }
    };

    loadTemplates();
    window.addEventListener("report-builder:templates-updated", loadTemplates);
    window.addEventListener("storage", loadTemplates);
    return () => {
      window.removeEventListener("report-builder:templates-updated", loadTemplates);
      window.removeEventListener("storage", loadTemplates);
    };
  }, []);

  useEffect(() => {
    if (!startEmpty && onHydratedFromDraft) {
      onHydratedFromDraft(report.id);
    }
  }, [onHydratedFromDraft, report.id, startEmpty]);

  useEffect(() => {
    const raw = localStorage.getItem(CONSTRUCT_BANK_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const valid = parsed.filter(
        (item): item is ConstructBankEntry =>
          !!item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.strengths === "string" &&
          typeof item.weaknesses === "string",
      );

      if (valid.length === 0) return;

      setConstructBankEntries(valid);
      setSections((prev) =>
        prev.map((section) => {
          if (!isConstructSection(section)) return section;
          const nextMap = createConstructMap(valid, section.role);
          const selected = valid.some(
            (entry) => entry.id === section.selectedConstructId,
          )
            ? section.selectedConstructId
            : valid[0].id;
          return {
            ...section,
            selectedConstructId: selected,
            textByConstructId: {
              ...nextMap,
              ...Object.fromEntries(
                Object.entries(section.textByConstructId).filter(([key]) =>
                  valid.some((entry) => entry.id === key),
                ),
              ),
            },
          };
        }),
      );
    } catch {
      // ignore parse errors
    }
  }, []);

  const customCount = useMemo(
    () =>
      sections.filter(
        (section) => section.type === "text" && section.role === "custom",
      ).length,
    [sections],
  );
  const hasStrengthSection = useMemo(
    () =>
      sections.some(
        (section) =>
          section.type === "construct" && section.role === "strength",
      ),
    [sections],
  );
  const hasDevelopmentSection = useMemo(
    () =>
      sections.some(
        (section) =>
          section.type === "construct" && section.role === "development",
      ),
    [sections],
  );

  function toggleOpen(sectionId: string) {
    setOpenById((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  function updateSection(
    sectionId: string,
    updater: (section: BuilderSection) => BuilderSection,
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    );
  }

  function handleHeaderLogoUpload(sectionId: string, file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateSection(sectionId, (current) =>
        current.type === "header"
          ? { ...current, logoUrl: result, logoName: file.name }
          : current,
      );
    };
    reader.readAsDataURL(file);
  }

  function addCustomSection() {
    const id = crypto.randomUUID();
    const nextCustomNumber = customCount + 1;
    const next: TextSection = {
      id,
      type: "text",
      role: "custom",
      label: `Free Text ${nextCustomNumber}`,
      title: `Free Text ${nextCustomNumber}`,
      showTitle: true,
      content: "",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    };

    setSections((prev) => [...prev, next]);
    setOpenById((prev) => ({ ...prev, [id]: false }));
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    setOpenById((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  }

  function ensureConstructSection(role: "strength" | "development") {
    const newSectionId = `${role}-${crypto.randomUUID()}`;
    setSections((prev) => {
      if (
        prev.some(
          (section) => section.type === "construct" && section.role === role,
        )
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          ...createConstructSection(constructBankEntries, role),
          id: newSectionId,
        },
      ];
    });
    setOpenById((prev) => ({
      ...prev,
      [newSectionId]: false,
    }));
  }

  function onDropAt(index: number) {
    if (!dragPayload) return;

    setSections((prev) => {
      const headerIndex = prev.findIndex((section) => section.type === "header");
      const minDropIndex = headerIndex >= 0 ? headerIndex + 1 : 0;
      const sourceIndex = prev.findIndex(
        (section) => section.id === dragPayload.sectionId,
      );
      if (sourceIndex < 0) return prev;
      if (prev[sourceIndex]?.type === "header") return prev;

      const boundedDrop = Math.max(minDropIndex, Math.min(index, prev.length));
      const [moved] = prev.slice(sourceIndex, sourceIndex + 1);
      const without = prev.filter(
        (section) => section.id !== dragPayload.sectionId,
      );
      const targetIndex =
        sourceIndex < boundedDrop ? boundedDrop - 1 : boundedDrop;
      return [
        ...without.slice(0, targetIndex),
        moved,
        ...without.slice(targetIndex),
      ];
    });

    setDragPayload(null);
    setActiveDropIndex(null);
  }

  function renderDropZone(index: number) {
    const headerIndex = sections.findIndex((section) => section.type === "header");
    const minDropIndex = headerIndex >= 0 ? headerIndex + 1 : 0;
    const disabled = index < minDropIndex;
    return (
      <div
        key={`drop-${index}`}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setActiveDropIndex(index);
        }}
        onDragLeave={() => {
          if (disabled) return;
          if (activeDropIndex === index) setActiveDropIndex(null);
        }}
        onDrop={() => {
          if (disabled) return;
          onDropAt(index);
        }}
        className={`rounded-md transition-all ${
          dragPayload && !disabled
            ? "my-1 h-6 border border-dashed border-[#c8d2db]"
            : "h-0"
        } ${activeDropIndex === index ? "bg-[#d8f0e3]" : "bg-transparent"}`}
      />
    );
  }

  return (
    <main className="min-h-[calc(100svh-56px)] bg-[#dbe5e1] px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[#475569]">
            Section Actions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-[#cfd6dc] bg-transparent"
                >
                  Import Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                          }),
                        );
                      }}
                    >
                      {template.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 border-[#cfd6dc] bg-transparent"
              onClick={addCustomSection}
            >
              <Plus className="size-4" />
              Add Free Text
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 border-[#cfd6dc] bg-transparent"
              onClick={() => ensureConstructSection("strength")}
              disabled={hasStrengthSection}
            >
              <Plus className="size-4" />
              Add Strength
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 border-[#cfd6dc] bg-transparent"
              onClick={() => ensureConstructSection("development")}
              disabled={hasDevelopmentSection}
            >
              <Plus className="size-4" />
              Add Development
            </Button>
          </div>
        </div>

        <div className="space-y-0">
          {renderDropZone(0)}
          {sections.map((section, index) => {
            if (section.type === "header") {
              return (
                <div key={section.id}>
                  <section className="mb-3 overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
                    <div className="flex min-h-12 items-center border-b border-[#dde2e6] px-2 py-1.5">
                      <span
                        className="mr-1 inline-flex rounded p-1 text-[#9ca3af]"
                        title="Header is fixed at the top"
                      >
                        <GripVertical className="size-4" />
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleOpen(section.id)}
                        className="flex h-10 flex-1 items-center justify-between px-1 py-1 text-left"
                      >
                        <h2 className="text-lg font-semibold text-[#1f2937]">
                          Header
                        </h2>
                        <ChevronDown
                          className={`size-4 text-[#6b7280] transition-transform ${openById[section.id] ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {openById[section.id] && (
                      <div className="space-y-3 px-4 py-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#374151]">
                              Header Text
                            </p>
                            <BackgroundColorControl
                              value={section.bgColor}
                              onChange={(next) =>
                                updateSection(section.id, (current) =>
                                  current.type === "header"
                                    ? { ...current, bgColor: next }
                                    : current,
                                )
                              }
                              ariaLabel="Header background hex color"
                            />
                          </div>
                          <Input
                            value={section.title}
                            onChange={(event) =>
                              updateSection(section.id, (current) =>
                                current.type === "header"
                                  ? { ...current, title: event.target.value }
                                  : current,
                              )
                            }
                            className="h-10 border-[#cfd6dc] bg-white text-sm"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="size-4 text-[#6b7280]" />
                            <span className="text-xs font-semibold text-[#374151]">
                              Header Image
                            </span>
                            <input
                              id={`header-image-${section.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                handleHeaderLogoUpload(
                                  section.id,
                                  event.target.files?.[0] ?? null,
                                )
                              }
                              className="hidden"
                            />
                            <span className="max-w-[220px] truncate text-xs text-[#475569]">
                              {section.logoName?.trim() ||
                                (section.logoUrl?.trim()
                                  ? "Image selected"
                                  : "No image selected")}
                            </span>
                            {section.logoUrl?.trim() && (
                              <Button
                                type="button"
                                variant="outline"
                                className="h-7 w-7 border-[#cfd6dc] bg-transparent p-0 text-[#b91c1c]"
                                onClick={() =>
                                  updateSection(section.id, (current) =>
                                    current.type === "header"
                                      ? { ...current, logoUrl: "", logoName: "" }
                                      : current,
                                  )
                                }
                                title="Clear image"
                                aria-label="Clear image"
                              >
                                <X className="size-3.5" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              className="ml-auto h-10 border-[#cfd6dc] bg-transparent text-xs"
                              onClick={() => {
                                const input = document.getElementById(
                                  `header-image-${section.id}`,
                                ) as HTMLInputElement | null;
                                input?.click();
                              }}
                            >
                              Choose Image
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-[#374151]">
                            Preview
                          </p>
                          <div
                            className="flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm font-semibold text-white"
                            style={{ backgroundColor: section.bgColor }}
                          >
                            <span>
                              {section.title ||
                                "Feedback report for Candidate Name"}
                            </span>
                            {section.logoUrl?.trim() && (
                              <img
                                src={section.logoUrl}
                                alt="Header thumbnail"
                                className="h-10 max-w-[120px] rounded bg-white/15 p-1 object-contain"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  {renderDropZone(index + 1)}
                </div>
              );
            }

            if (section.type === "construct") {
              const selectedText =
                section.textByConstructId[section.selectedConstructId] ?? "";
              const accent =
                section.role === "strength" ? "#33b06f" : "#4f79ff";
              const fixedLabel =
                section.role === "strength"
                  ? "Strength Areas"
                  : "Development Areas";
              const defaultConstructText = getConstructBankDefaultText(
                constructBankEntries,
                section.role,
                section.selectedConstructId,
              );

              return (
                <div key={section.id}>
                  <section className="mb-3 overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
                    <div className="flex items-center border-b border-[#dde2e6] px-2 py-1.5">
                      <button
                        type="button"
                        draggable
                        onDragStart={() =>
                          setDragPayload({
                            kind: "move",
                            sectionId: section.id,
                          })
                        }
                        onDragEnd={() => {
                          setDragPayload(null);
                          setActiveDropIndex(null);
                        }}
                        className="mr-1 rounded p-1 text-[#6b7280] hover:bg-[#e8edf1]"
                        title="Drag to reorder"
                      >
                        <GripVertical className="size-4" />
                      </button>
                      <div className="flex flex-1 items-center justify-between px-1 py-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-5 w-0.5 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          <h2 className="text-lg font-semibold text-[#1f2937]">
                            {fixedLabel}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={section.numberToShow}
                            onValueChange={(value) =>
                              updateSection(section.id, (current) =>
                                current.type === "construct"
                                  ? {
                                      ...current,
                                      numberToShow: value as "1" | "2" | "3",
                                    }
                                  : current,
                              )
                            }
                          >
                            <SelectTrigger
                              className="h-7 w-20 border-[#cfd6dc] bg-white px-2 text-xs"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Top 1</SelectItem>
                              <SelectItem value="2">Top 2</SelectItem>
                              <SelectItem value="3">Top 3</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-[#6b7280] hover:text-[#6b7280]"
                            onClick={() => toggleOpen(section.id)}
                            title="Expand or collapse section"
                            aria-label="Expand or collapse section"
                          >
                            <ChevronDown
                              className={`size-4 transition-transform ${openById[section.id] ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-[#b45309] hover:text-[#b45309]"
                        onClick={() => removeSection(section.id)}
                        title="Delete section"
                        aria-label="Delete section"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {openById[section.id] && (
                      <div className="space-y-3 px-4 py-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#374151]">
                              Section Title
                            </p>
                            <BackgroundColorControl
                              value={section.titleBgColor}
                              onChange={(next) =>
                                updateSection(section.id, (current) =>
                                  current.type === "construct"
                                    ? { ...current, titleBgColor: next }
                                    : current,
                                )
                              }
                              ariaLabel="Construct title background hex color"
                            />
                          </div>
                          <Input
                            value={section.title}
                            onChange={(event) =>
                              updateSection(section.id, (current) =>
                                current.type === "construct"
                                  ? { ...current, title: event.target.value }
                                  : current,
                              )
                            }
                            style={{ backgroundColor: section.titleBgColor }}
                            className="h-10 border-[#cfd6dc] text-sm"
                          />
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#374151]">
                              Section Introduction Text
                            </p>
                            <BackgroundColorControl
                              value={section.introBgColor}
                              onChange={(next) =>
                                updateSection(section.id, (current) =>
                                  current.type === "construct"
                                    ? { ...current, introBgColor: next }
                                    : current,
                                )
                              }
                              ariaLabel="Construct intro background hex color"
                            />
                          </div>
                          <Textarea
                            value={section.introText}
                            onChange={(event) =>
                              updateSection(section.id, (current) =>
                                current.type === "construct"
                                  ? {
                                      ...current,
                                      introText: event.target.value,
                                    }
                                  : current,
                              )
                            }
                            style={{ backgroundColor: section.introBgColor }}
                            className="min-h-24 border-[#cfd6dc] text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-[240px_1fr] gap-3">
                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#374151]">
                              Construct
                            </p>
                            <Select
                              value={section.selectedConstructId}
                              onValueChange={(value) =>
                                updateSection(section.id, (current) =>
                                  current.type === "construct"
                                    ? { ...current, selectedConstructId: value }
                                    : current,
                                )
                              }
                            >
                              <SelectTrigger className="h-10 w-full border-[#cfd6dc] bg-white">
                                <SelectValue placeholder="Select construct" />
                              </SelectTrigger>
                              <SelectContent>
                                {constructBankEntries.map((entry) => (
                                  <SelectItem
                                    key={`${section.id}-${entry.id}`}
                                    value={entry.id}
                                  >
                                    {entry.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 h-8 border-[#cfd6dc] bg-transparent px-2 text-[11px]"
                              onClick={() =>
                                updateSection(section.id, (current) =>
                                  current.type === "construct"
                                    ? {
                                        ...current,
                                        textByConstructId: {
                                          ...current.textByConstructId,
                                          [current.selectedConstructId]:
                                            defaultConstructText,
                                        },
                                      }
                                    : current,
                                )
                              }
                              disabled={!defaultConstructText.trim()}
                              title="Enter default text from construct bank"
                            >
                              Add Default Text
                            </Button>
                          </div>
                          <div
                            className="rounded-md border border-[#cfd6dc] p-2"
                            style={{ backgroundColor: section.contentBgColor }}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <p className="text-xs font-semibold text-[#374151]">
                                Text
                              </p>
                              <div className="flex items-center gap-2">
                                <BackgroundColorControl
                                  value={section.contentBgColor}
                                  onChange={(next) =>
                                    updateSection(section.id, (current) =>
                                      current.type === "construct"
                                        ? { ...current, contentBgColor: next }
                                        : current,
                                    )
                                  }
                                  ariaLabel="Construct text background color"
                                />
                              </div>
                            </div>
                            <Textarea
                              value={selectedText}
                              onChange={(event) =>
                                updateSection(section.id, (current) =>
                                  current.type === "construct"
                                    ? {
                                        ...current,
                                        textByConstructId: {
                                          ...current.textByConstructId,
                                          [current.selectedConstructId]:
                                            event.target.value,
                                        },
                                      }
                                    : current,
                                )
                              }
                              className="min-h-28 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  {renderDropZone(index + 1)}
                </div>
              );
            }

            const fallbackName =
              section.role === "intro"
                ? "Introduction"
                : section.role === "closing"
                  ? "Closing"
                  : `Free Text ${index + 1}`;

            return (
              <div key={section.id}>
                <section className="mb-3 overflow-hidden rounded-lg border border-[#d5dbe0] bg-[#f7f8f9] shadow-sm">
                  <div className="flex items-center border-b border-[#dde2e6] px-2 py-1.5">
                    <button
                      type="button"
                      draggable
                      onDragStart={() =>
                        setDragPayload({ kind: "move", sectionId: section.id })
                      }
                      onDragEnd={() => {
                        setDragPayload(null);
                        setActiveDropIndex(null);
                      }}
                      className="mr-1 rounded p-1 text-[#6b7280] hover:bg-[#e8edf1]"
                      title="Drag to reorder"
                    >
                        <GripVertical className="size-4" />
                    </button>
                    <div className="flex flex-1 items-center gap-2 px-1 py-1">
                      {editingLabelId === section.id ? (
                        <Input
                          value={section.label}
                          onChange={(event) =>
                            updateSection(section.id, (current) =>
                              isTextSection(current)
                                ? { ...current, label: event.target.value }
                                : current,
                            )
                          }
                          onClick={(event) => event.stopPropagation()}
                          onBlur={() => setEditingLabelId(null)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              setEditingLabelId(null);
                            }
                          }}
                          autoFocus
                          className="h-10 border-[#cfd6dc] bg-white px-2 text-lg font-semibold text-[#1f2937]"
                          placeholder={fallbackName}
                          aria-label="Section label"
                        />
                      ) : (
                        <button
                          type="button"
                          className="h-10 flex-1 rounded-md border border-transparent px-2 text-left text-lg font-semibold text-[#1f2937] hover:border-[#d7dfe5] hover:bg-white"
                          onClick={() => setEditingLabelId(section.id)}
                          title="Edit section label"
                        >
                          {section.label.trim() || fallbackName}
                        </button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-[#6b7280] hover:text-[#6b7280]"
                        onClick={() => toggleOpen(section.id)}
                        title="Expand or collapse section"
                        aria-label="Expand or collapse section"
                      >
                        <ChevronDown
                          className={`size-4 transition-transform ${openById[section.id] ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[#b91c1c] hover:text-[#b91c1c]"
                      onClick={() => removeSection(section.id)}
                      title="Delete section"
                      aria-label="Delete section"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {openById[section.id] && (
                    <div className="space-y-3 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          id={`show-title-${section.id}`}
                          type="checkbox"
                          checked={section.showTitle}
                          onChange={(event) =>
                            updateSection(section.id, (current) =>
                              isTextSection(current)
                                ? {
                                    ...current,
                                    showTitle: event.target.checked,
                                  }
                                : current,
                            )
                          }
                          className="size-4 rounded border-[#cfd6dc]"
                        />
                        <label
                          htmlFor={`show-title-${section.id}`}
                          className="text-xs font-semibold text-[#374151]"
                        >
                          Show title
                        </label>
                      </div>

                      {section.showTitle && (
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#374151]">
                              Title (optional)
                            </p>
                            <BackgroundColorControl
                              value={section.titleBgColor}
                              onChange={(next) =>
                                updateSection(section.id, (current) =>
                                  isTextSection(current)
                                    ? { ...current, titleBgColor: next }
                                    : current,
                                )
                              }
                              ariaLabel="Text section title background hex color"
                            />
                          </div>
                          <Input
                            value={section.title}
                            onChange={(event) =>
                              updateSection(section.id, (current) =>
                                isTextSection(current)
                                  ? { ...current, title: event.target.value }
                                  : current,
                              )
                            }
                            style={{ backgroundColor: section.titleBgColor }}
                            className="h-10 border-[#cfd6dc] text-sm"
                            placeholder="Leave blank to hide title text"
                          />
                        </div>
                      )}

                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#374151]">
                            Text
                          </p>
                          <BackgroundColorControl
                            value={section.contentBgColor}
                            onChange={(next) =>
                              updateSection(section.id, (current) =>
                                isTextSection(current)
                                  ? { ...current, contentBgColor: next }
                                  : current,
                              )
                            }
                            ariaLabel="Text section body background hex color"
                          />
                        </div>
                        <Textarea
                          value={section.content}
                          onChange={(event) =>
                            updateSection(section.id, (current) =>
                              isTextSection(current)
                                ? { ...current, content: event.target.value }
                                : current,
                            )
                          }
                          style={{ backgroundColor: section.contentBgColor }}
                          className="min-h-28 border-[#cfd6dc] text-sm"
                        />
                      </div>
                    </div>
                  )}
                </section>
                {renderDropZone(index + 1)}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
