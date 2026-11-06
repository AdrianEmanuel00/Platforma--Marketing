import { Ban, Check, WandSparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { loadProject } from "@/lib/project-page";

export default async function BrandPage({ params }: PageProps<"/app/[project]/brand">) {
  const { brand, name, website } = await loadProject(params);

  return (
    <>
      <PageHeader
        title="Identitate de brand"
        description={`Toți agenții folosesc aceste reguli pentru ${name}. Le-a extras agentul Brand din ${website}.`}
        actions={
          <>
            <button className="btn-ghost">
              <WandSparkles size={16} /> Reanalizează site-ul
            </button>
            <button className="btn-primary">Salvează</button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Vizual</h2>
          <div className="mb-5 flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-xl text-center text-sm font-bold"
              style={{ background: brand.colors[0].hex, color: brand.colors[1].hex, fontFamily: brand.fonts.heading }}
            >
              {brand.logoText}
            </div>
            <div className="text-sm">
              <p>
                <span className="text-muted">Titluri:</span> {brand.fonts.heading}
              </p>
              <p>
                <span className="text-muted">Text:</span> {brand.fonts.body}
              </p>
            </div>
          </div>
          <p className="mb-2 text-sm font-medium">Culori</p>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {brand.colors.map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-lg border border-border">
                <div className="h-14" style={{ background: c.hex }} />
                <div className="p-2 text-xs">
                  <p className="font-medium">{c.name}</p>
                  <p className="font-mono text-muted">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
          <Field label="Stil vizual" value={brand.visualStyle} />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Voce și public</h2>
          <Field label="Tonul vocii" value={brand.voice} />
          <Field label="Publicul țintă" value={brand.audience} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WordList label="Cuvinte de folosit" words={brand.doWords} good />
            <WordList label="Cuvinte interzise" words={brand.dontWords} />
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea defaultValue={value} rows={3} className="input resize-none" />
    </div>
  );
}

function WordList({ label, words, good }: { label: string; words: string[]; good?: boolean }) {
  const Icon = good ? Check : Ban;
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <ul className="space-y-1.5">
        {words.map((w) => (
          <li key={w} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm">
            <Icon size={14} className={good ? "text-emerald-600" : "text-red-500"} />
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
