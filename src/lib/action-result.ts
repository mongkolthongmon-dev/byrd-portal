// Standard shape returned by every mutating server action so the UI can show a
// success or error toast.
export type ActionResult = { ok: boolean; message: string };

export const ok = (message: string): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });
