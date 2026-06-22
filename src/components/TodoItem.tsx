'use client';

import { useState } from 'react';
import { deleteTodo, editTodo, toggleTodo } from '@/app/todos/actions';
import ActionForm from '@/components/ActionForm';

type Todo = { id: number; title: string; done: boolean };

// A single todo row. Toggles between a read view (check / edit / delete) and an
// inline edit form. All mutations go through ActionForm, which toasts results.
export default function TodoItem({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li key="edit" className="flex items-center gap-2 px-4 py-3">
        <ActionForm
          action={editTodo}
          onResult={(r) => {
            if (r.ok) setEditing(false);
          }}
          className="flex flex-1 items-center gap-2"
        >
          <input type="hidden" name="id" value={todo.id} />
          <input
            name="title"
            defaultValue={todo.title}
            autoFocus
            required
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </ActionForm>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li key="view" className="flex items-center gap-3 px-4 py-3">
      <ActionForm action={toggleTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="done" value={String(todo.done)} />
        <button
          type="submit"
          aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
          className={`grid h-5 w-5 place-items-center rounded border ${
            todo.done
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-slate-300 text-transparent hover:border-indigo-400'
          }`}
        >
          ✓
        </button>
      </ActionForm>

      <span
        className={`flex-1 text-sm ${
          todo.done ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}
      >
        {todo.title}
      </span>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-slate-400 hover:text-indigo-600"
        aria-label="Edit todo"
      >
        Edit
      </button>

      <ActionForm action={deleteTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          className="text-sm text-slate-400 hover:text-red-600"
          aria-label="Delete todo"
        >
          ✕
        </button>
      </ActionForm>
    </li>
  );
}
