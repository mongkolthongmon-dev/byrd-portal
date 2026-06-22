'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/lib/action-result';

// Wraps a <form> bound to a server action and shows a success/error toast based
// on the action's returned ActionResult. Use everywhere a mutating action runs.
export default function ActionForm({
  action,
  children,
  className,
  onResult,
}: {
  action: (formData: FormData) => Promise<ActionResult | void>;
  children: React.ReactNode;
  className?: string;
  onResult?: (result: ActionResult) => void;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      return result ?? { ok: true, message: 'Done.' };
    },
    null,
  );

  const lastSeen = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (!state || state === lastSeen.current) return;
    lastSeen.current = state;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
    onResult?.(state);
  }, [state, onResult]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
