import { packageService } from '@/services/packageService';
import ActionForm from '@/components/ActionForm';
import { createPackage, deletePackage } from '../actions';

export const runtime = 'nodejs';

export default async function AdminPackagesPage() {
  const rows = await packageService.list();

  return (
    <div className="space-y-6">
      <ActionForm
        action={createPackage}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Sales"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            name="description"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="CRM and pipeline tools"
          />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Add package
        </button>
      </ActionForm>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No packages yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{p.name}</div>
                <div className="text-sm text-slate-500">
                  {p.description ?? 'No description.'}
                </div>
              </div>
              <ActionForm action={deletePackage}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm text-slate-400 hover:text-red-600">Delete</button>
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
