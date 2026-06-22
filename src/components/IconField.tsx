'use client';

import { useState } from 'react';

// Common menu icons offered as one-click presets. Users can also type or paste
// any emoji into the field.
const PRESETS = ['🏠', '📊', '📈', '📦', '👥', '🧾', '💼', '🌴', '🎯', '🔗', '✅', '⚙️', '🔔', '📁'];

export default function IconField({
  name = 'icon',
  defaultValue = '',
}: {
  name?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 📊 — type or paste an emoji"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="mt-1.5 flex flex-wrap gap-1">
        {PRESETS.map((emo) => (
          <button
            type="button"
            key={emo}
            onClick={() => setValue(emo)}
            aria-label={`Use ${emo}`}
            className={`grid h-7 w-7 place-items-center rounded border text-base hover:bg-slate-100 ${
              value === emo ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
            }`}
          >
            {emo}
          </button>
        ))}
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="rounded border border-slate-200 px-2 text-xs text-slate-500 hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Click an icon above, or type/paste any emoji (Windows: press Win + . ).
      </p>
    </div>
  );
}
