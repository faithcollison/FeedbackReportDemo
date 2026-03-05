"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type BuilderSection = HeaderSection | TextSection | ConstructSection;

type DragPayload = { kind: "move"; sectionId: string };

const CONSTRUCT_BANK_STORAGE_KEY = "report-builder-construct-bank";
const DEFAULT_TITLE_BG = "#f7f8f9";
const DEFAULT_TEXT_BG = "#ffffff";

const FALLBACK_ENTRIES: ConstructBankEntry[] = [
  {
    id: "assertiveness",
    name: "Assertiveness",
    strengths:
      "Demonstrates strong assertiveness in professional settings, with confidence in communicating ideas and decisions.",
    weaknesses:
      "Could improve confidence when challenging unclear priorities, especially in fast-paced team settings.",
  },
  {
    id: "collaboration",
    name: "Collaboration",
    strengths:
      "Works effectively with others and contributes to a positive and productive team dynamic.",
    weaknesses:
      "Would benefit from more proactive stakeholder updates to improve cross-team alignment.",
  },
  {
    id: "analysis",
    name: "Analytical Mindset",
    strengths:
      "Approaches complex tasks with structured thinking and clear logic.",
    weaknesses:
      "Could strengthen data-validation habits before reaching final conclusions.",
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
  return [
    {
      id: "header-default",
      type: "header",
      title: "Feedback report for Candidate Name",
      bgColor: "#457b58",
    },
    {
      id: "intro-1",
      type: "text",
      role: "intro",
      label: "Intro",
      title: "Intro",
      showTitle: true,
      content: "",
      titleBgColor: DEFAULT_TITLE_BG,
      contentBgColor: DEFAULT_TEXT_BG,
    },
    createConstructSection(entries, "strength"),
    {
      id: "closing-1",
      type: "text",
      role: "closing",
      label: "Closing",
      title: "Closing",
      showTitle: true,
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
    createInitialSections(FALLBACK_ENTRIES),
  );
  const [openById, setOpenById] = useState<Record<string, boolean>>({
    "header-default": true,
    "intro-1": true,
    "strength-default": true,
    "closing-1": true,
  });

  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);

  void onUpdateReport;

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
    setOpenById((prev) => ({ ...prev, [id]: true }));
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
    setSections((prev) => {
      if (
        prev.some(
          (section) => section.type === "construct" && section.role === role,
        )
      ) {
        return prev;
      }
      return [...prev, createConstructSection(constructBankEntries, role)];
    });
    setOpenById((prev) => ({
      ...prev,
      [role === "strength" ? "strength-default" : "development-default"]: true,
    }));
  }

  function onDropAt(index: number) {
    if (!dragPayload) return;

    setSections((prev) => {
      const sourceIndex = prev.findIndex(
        (section) => section.id === dragPayload.sectionId,
      );
      if (sourceIndex < 0) return prev;

      const boundedDrop = Math.max(0, Math.min(index, prev.length));
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
    return (
      <div
        key={`drop-${index}`}
        onDragOver={(event) => {
          event.preventDefault();
          setActiveDropIndex(index);
        }}
        onDragLeave={() => {
          if (activeDropIndex === index) setActiveDropIndex(null);
        }}
        onDrop={() => onDropAt(index)}
        className={`rounded-md transition-all ${
          dragPayload ? "my-1 h-6 border border-dashed border-[#c8d2db]" : "h-0"
        } ${activeDropIndex === index ? "bg-[#d8f0e3]" : "bg-transparent"}`}
      />
    );
  }

  return (
    <main className="min-h-[calc(100svh-56px)] bg-[#dbe5e1] px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-0">
          {renderDropZone(0)}
          {sections.map((section, index) => {
            if (section.type === "header") {
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
                      <button
                        type="button"
                        onClick={() => toggleOpen(section.id)}
                        className="flex flex-1 items-center justify-between px-1 py-1 text-left"
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
                        <div
                          className="rounded-sm px-3 py-2 text-sm font-semibold text-white"
                          style={{ backgroundColor: section.bgColor }}
                        >
                          {section.title ||
                            "Feedback report for Candidate Name"}
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
                          <Input
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
                            className="h-10 border-[#cfd6dc] text-sm"
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
        <section className="mt-4 rounded-lg border border-dashed border-[#c4cdd5] bg-[#f7f8f9] p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
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
        </section>
      </div>
    </main>
  );
}
