import { packageService } from '@/services/packageService';
import { userService } from '@/services/userService';
import ActionForm from '@/components/ActionForm';
import { updateUser } from '../actions';

export const runtime = 'nodejs';

const GRID = 'sm:grid-cols-[minmax(0,1fr)_7rem_12rem_5rem]';
const cellInput =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [allUsers, pkgs] = await Promise.all([
    userService.search(q),
    packageService.list(),
  ]);

  return (
    <div className="space-y-4">
      {/* Search (GET → ?q=) */}
      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search by name or email…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Search
        </button>
        {q ? (
          <a
            href="/admin/users"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Clear
          </a>
        ) : null}
      </form>

      <p className="text-sm text-slate-500">
        {allUsers.length} user{allUsers.length === 1 ? '' : 's'}
        {q ? ` matching “${q}”` : ''}. A role change applies on the user&apos;s next
        sign-in; a package change applies immediately.
      </p>

      {allUsers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No users found{q ? ` for “${q}”` : ''}.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Header row (desktop only) */}
          <div
            className={`hidden gap-3 bg-slate-50 px-4 py-2 text-xs font-medium uppercase text-slate-500 sm:grid ${GRID}`}
          >
            <span>User</span>
            <span>Role</span>
            <span>Package</span>
            <span className="text-right">Action</span>
          </div>

          {/* One form per row, laid out on the same grid so columns align */}
          {allUsers.map((u) => (
            <ActionForm
              key={u.id}
              action={updateUser}
              className={`grid grid-cols-1 items-center gap-2 border-t border-slate-100 px-4 py-3 sm:gap-3 ${GRID}`}
            >
              <input type="hidden" name="id" value={u.id} />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-slate-900">{u.name}</span>
                  {u.role === 'admin' && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                      admin
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-slate-500">{u.email}</div>
              </div>

              {/* key tied to the saved value → the select remounts with the
                  correct selection after each save (avoids stale-select bug) */}
              <select
                key={`role-${u.role}`}
                name="role"
                defaultValue={u.role}
                aria-label={`Role for ${u.email}`}
                className={cellInput}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <select
                key={`pkg-${u.packageId ?? 'none'}`}
                name="packageId"
                defaultValue={u.packageId ?? ''}
                aria-label={`Package for ${u.email}`}
                className={cellInput}
              >
                <option value="">— no package —</option>
                {pkgs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:justify-self-end">
                Save
              </button>
            </ActionForm>
          ))}
        </div>
      )}
    </div>
  );
}
