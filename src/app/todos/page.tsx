import { requireUser } from '@/lib/guards';
import { todoService } from '@/services/todoService';
import TodoItem from '@/components/TodoItem';
import { addTodo } from './actions';

export const runtime = 'nodejs';

// Protected page. Each user sees only the todos they own.
export default async function TodosPage() {
  const user = await requireUser();
  const items = await todoService.listByOwner(Number(user.id));

  const remaining = items.filter((t) => !t.done).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My todos</h1>
        <p className="mt-1 text-sm text-slate-500">
          {items.length} total · {remaining} remaining · private to you
        </p>
      </div>

      <form action={addTodo} className="flex gap-2">
        <input
          name="title"
          required
          placeholder="Add a task…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No todos yet. Add your first task above.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((t) => (
            <TodoItem key={t.id} todo={{ id: t.id, title: t.title, done: t.done }} />
          ))}
        </ul>
      )}
    </div>
  );
}
