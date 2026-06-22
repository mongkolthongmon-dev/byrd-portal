'use client';

import { useState } from 'react';
import { deleteOidc, toggleOidc, updateOidc } from '@/app/admin/actions';
import ActionForm from '@/components/ActionForm';

type Provider = {
  id: string;
  name: string;
  issuer: string;
  clientId: string;
  scopes: string;
  enabled: boolean;
};

const inputCls =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function OidcRow({ provider }: { provider: Provider }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li key="edit" className="px-4 py-4">
        <ActionForm
          action={updateOidc}
          onResult={(r) => {
            if (r.ok) setEditing(false);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={provider.id} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ID (slug)
            </label>
            <input value={provider.id} disabled className={`${inputCls} bg-slate-100 text-slate-500`} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
            <input name="name" defaultValue={provider.name} required className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Issuer URL</label>
            <input name="issuer" defaultValue={provider.issuer} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Client ID</label>
            <input name="clientId" defaultValue={provider.clientId} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Client secret</label>
            <input
              name="clientSecret"
              type="password"
              placeholder="Leave blank to keep current"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Scopes</label>
            <input name="scopes" defaultValue={provider.scopes} className={inputCls} />
          </div>
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
        </ActionForm>
      </li>
    );
  }

  return (
    <li key="view" className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <div className="font-medium text-slate-900">
          {provider.name} <span className="text-xs text-slate-400">({provider.id})</span>
        </div>
        <div className="text-xs text-slate-500">{provider.issuer}</div>
      </div>
      <ActionForm action={toggleOidc}>
        <input type="hidden" name="id" value={provider.id} />
        <input type="hidden" name="enabled" value={String(provider.enabled)} />
        <button
          className={`rounded px-2 py-1 text-xs font-medium ${
            provider.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {provider.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </ActionForm>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-slate-400 hover:text-indigo-600"
      >
        Edit
      </button>
      <ActionForm action={deleteOidc}>
        <input type="hidden" name="id" value={provider.id} />
        <button className="text-sm text-slate-400 hover:text-red-600">Delete</button>
      </ActionForm>
    </li>
  );
}
