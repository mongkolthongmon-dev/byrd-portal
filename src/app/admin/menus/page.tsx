import { menuService } from '@/services/menuService';
import { packageService } from '@/services/packageService';
import MenuRow from '@/components/MenuRow';
import IconField from '@/components/IconField';
import ActionForm from '@/components/ActionForm';
import { createMenu } from '../actions';

export const runtime = 'nodejs';

export default async function AdminMenusPage() {
  const [pkgs, allMenus] = await Promise.all([
    packageService.list(),
    menuService.listAll(),
  ]);

  if (pkgs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        Create a package first under Admin → Packages.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ActionForm
        action={createMenu}
        className="grid items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Package</label>
          <select
            name="packageId"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {pkgs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Label</label>
          <input name="label" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Href</label>
          <input name="href" required placeholder="/reports or https://app.example.com" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Icon</label>
          <IconField name="icon" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
          <input name="sortOrder" type="number" defaultValue={0} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" name="external" value="true" />
          External link (new tab)
        </label>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:col-span-2 lg:col-span-3">
          Add menu item
        </button>
      </ActionForm>

      <div className="space-y-6">
        {pkgs.map((p) => {
          const items = allMenus.filter((m) => m.packageId === p.id);
          return (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
                {p.name}
              </div>
              {items.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-400">No menu items.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {items.map((m) => (
                    <MenuRow
                      key={m.id}
                      menu={{
                        id: m.id,
                        label: m.label,
                        href: m.href,
                        icon: m.icon,
                        sortOrder: m.sortOrder,
                        enabled: m.enabled,
                        external: m.external,
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
