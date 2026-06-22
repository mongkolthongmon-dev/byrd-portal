'use client';

import { useState } from 'react';
import { deleteMenu, toggleMenu, updateMenu } from '@/app/admin/actions';
import IconField from '@/components/IconField';

type Menu = {
  id: number;
  label: string;
  href: string;
  icon: string | null;
  sortOrder: number;
  enabled: boolean;
  external: boolean;
};

const inputCls =
  'rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function MenuRow({ menu }: { menu: Menu }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li key="edit" className="px-4 py-4">
        <form
          action={async (formData) => {
            await updateMenu(formData);
            setEditing(false);
          }}
          className="grid items-start gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={menu.id} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Label</label>
            <input name="label" defaultValue={menu.label} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Href</label>
            <input name="href" defaultValue={menu.href} required placeholder="/route or https://…" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Icon</label>
            <IconField name="icon" defaultValue={menu.icon ?? ''} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
            <input name="sortOrder" type="number" defaultValue={menu.sortOrder} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="external" value="true" defaultChecked={menu.external} />
            External link (open the href in a new tab)
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li key="view" className="flex items-center gap-3 px-4 py-3">
      <span className="w-6 text-center">{menu.icon ?? '📁'}</span>
      <span className="flex-1">
        <span className="font-medium text-slate-900">{menu.label}</span>
        <span className="ml-2 text-xs text-slate-400">{menu.href}</span>
        {menu.external && (
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
            ↗ external
          </span>
        )}
      </span>
      <span className="text-xs text-slate-400">#{menu.sortOrder}</span>

      <form action={toggleMenu}>
        <input type="hidden" name="id" value={menu.id} />
        <input type="hidden" name="enabled" value={String(menu.enabled)} />
        <button
          className={`rounded px-2 py-1 text-xs font-medium ${
            menu.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {menu.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-slate-400 hover:text-indigo-600"
      >
        Edit
      </button>

      <form action={deleteMenu}>
        <input type="hidden" name="id" value={menu.id} />
        <button className="text-sm text-slate-400 hover:text-red-600">✕</button>
      </form>
    </li>
  );
}
