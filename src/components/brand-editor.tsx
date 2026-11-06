"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { BrandKit } from "@/lib/types";

export const FONT_OPTIONS = [
  "Inter",
  "DM Sans",
  "Manrope",
  "Poppins",
  "Montserrat",
  "Space Grotesk",
  "Fraunces",
  "Playfair Display",
  "DM Serif Display",
  "Lora",
  "Bebas Neue",
];

export const emptyBrand: BrandKit = {
  colors: [
    { name: "Principală", hex: "#6D4AFF" },
    { name: "Fundal", hex: "#F7F7F9" },
    { name: "Accent", hex: "#FFB020" },
  ],
  fonts: { heading: "Inter", body: "Inter" },
  logoText: "",
  voice: "",
  audience: "",
  doWords: [],
  dontWords: [],
  visualStyle: "",
};

export function BrandEditor({ value, onChange }: { value: BrandKit; onChange: (b: BrandKit) => void }) {
  const set = <K extends keyof BrandKit>(k: K, v: BrandKit[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="card space-y-5 p-5">
        <h2 className="font-semibold">Vizual</h2>
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1 text-center text-sm font-bold"
            style={{
              background: value.colors[0]?.hex,
              color: value.colors[1]?.hex,
              fontFamily: value.fonts.heading,
            }}
          >
            {value.logoText || "Logo"}
          </div>
          <div className="flex-1">
            <Label htmlFor="logo">Logo (text)</Label>
            <input id="logo" className="input" value={value.logoText} onChange={(e) => set("logoText", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Culori</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {value.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <input
                  type="color"
                  aria-label={`Culoarea ${c.name}`}
                  value={c.hex}
                  onChange={(e) =>
                    set(
                      "colors",
                      value.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value.toUpperCase() } : x)),
                    )
                  }
                  className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <div className="min-w-0 flex-1">
                  <input
                    aria-label="Numele culorii"
                    value={c.name}
                    onChange={(e) =>
                      set("colors", value.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                    className="w-full bg-transparent text-xs font-medium outline-none"
                  />
                  <p className="font-mono text-[11px] text-muted">{c.hex}</p>
                </div>
                {value.colors.length > 1 && (
                  <button
                    aria-label="Șterge culoarea"
                    onClick={() => set("colors", value.colors.filter((_, j) => j !== i))}
                    className="text-muted hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {value.colors.length < 6 && (
              <button
                onClick={() => set("colors", [...value.colors, { name: "Nouă", hex: "#888888" }])}
                className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border p-2 text-xs text-muted hover:text-accent"
              >
                <Plus size={14} /> Culoare
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fh">Font titluri</Label>
            <FontSelect id="fh" value={value.fonts.heading} onChange={(f) => set("fonts", { ...value.fonts, heading: f })} />
          </div>
          <div>
            <Label htmlFor="fb">Font text</Label>
            <FontSelect id="fb" value={value.fonts.body} onChange={(f) => set("fonts", { ...value.fonts, body: f })} />
          </div>
        </div>

        <div>
          <Label htmlFor="vs">Stil vizual</Label>
          <textarea
            id="vs"
            rows={3}
            className="input resize-none"
            placeholder="Ex.: lumină naturală caldă, mult spațiu gol, produse pe lemn"
            value={value.visualStyle}
            onChange={(e) => set("visualStyle", e.target.value)}
          />
        </div>
      </section>

      <section className="card space-y-5 p-5">
        <h2 className="font-semibold">Voce și public</h2>
        <div>
          <Label htmlFor="voice">Tonul vocii</Label>
          <textarea
            id="voice"
            rows={3}
            className="input resize-none"
            placeholder="Ex.: cald, prietenos, vorbim cu „tu”"
            value={value.voice}
            onChange={(e) => set("voice", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="aud">Publicul țintă</Label>
          <textarea
            id="aud"
            rows={3}
            className="input resize-none"
            placeholder="Ex.: 25-40 de ani, lucrează în centrul orașului"
            value={value.audience}
            onChange={(e) => set("audience", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TagInput label="Cuvinte de folosit" tone="good" values={value.doWords} onChange={(v) => set("doWords", v)} />
          <TagInput label="Cuvinte interzise" tone="bad" values={value.dontWords} onChange={(v) => set("dontWords", v)} />
        </div>
      </section>
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  );
}

function FontSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const options = FONT_OPTIONS.includes(value) ? FONT_OPTIONS : [value, ...FONT_OPTIONS];
  return (
    <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((f) => (
        <option key={f}>{f}</option>
      ))}
    </select>
  );
}

function TagInput({
  label,
  values,
  onChange,
  tone,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  tone: "good" | "bad";
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {values.map((w) => (
          <span
            key={w}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
              tone === "good"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {w}
            <button aria-label={`Șterge ${w}`} onClick={() => onChange(values.filter((x) => x !== w))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        placeholder="Scrie și apasă Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
