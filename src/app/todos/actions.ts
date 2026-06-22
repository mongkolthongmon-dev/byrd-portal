'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/guards';
import { todoService } from '@/services/todoService';
import { type ActionResult, fail, ok } from '@/lib/action-result';

// All writes re-check auth on the server and delegate to the service, which
// scopes every mutation by owner id. Each returns an ActionResult for toasts.

export async function addTodo(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return fail('Please enter a task.');

    await todoService.create(Number(user.id), title);
    revalidatePath('/todos');
    return ok('Task added.');
  } catch {
    return fail('Could not add the task.');
  }
}

export async function editTodo(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = Number(formData.get('id'));
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return fail('Title cannot be empty.');

    await todoService.updateTitle(id, Number(user.id), title);
    revalidatePath('/todos');
    return ok('Task updated.');
  } catch {
    return fail('Could not update the task.');
  }
}

export async function toggleTodo(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = Number(formData.get('id'));
    const done = formData.get('done') === 'true';

    await todoService.setDone(id, Number(user.id), !done);
    revalidatePath('/todos');
    return ok(!done ? 'Marked as done.' : 'Marked as not done.');
  } catch {
    return fail('Could not update the task.');
  }
}

export async function deleteTodo(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = Number(formData.get('id'));

    await todoService.remove(id, Number(user.id));
    revalidatePath('/todos');
    return ok('Task deleted.');
  } catch {
    return fail('Could not delete the task.');
  }
}
