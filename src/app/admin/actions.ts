'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/guards';
import { menuService } from '@/services/menuService';
import { oidcService } from '@/services/oidcService';
import { packageService } from '@/services/packageService';
import { userService } from '@/services/userService';
import { type ActionResult, fail, ok } from '@/lib/action-result';

// Every admin write re-checks the admin role on the server, delegates to a
// service, and returns an ActionResult so the UI can toast success/error.

// --- Packages ---
export async function createPackage(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim() || null;
    if (!name) return fail('Package name is required.');
    const created = await packageService.create({ name, description });
    if (!created) return fail(`A package named “${name}” already exists.`);
    revalidatePath('/admin/packages');
    return ok(`Package “${name}” created.`);
  } catch {
    return fail('Could not create the package.');
  }
}

export async function deletePackage(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await packageService.remove(Number(formData.get('id')));
    revalidatePath('/admin/packages');
    return ok('Package deleted.');
  } catch {
    return fail('Could not delete the package.');
  }
}

// --- Menus ---
export async function createMenu(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const packageId = Number(formData.get('packageId'));
    const label = String(formData.get('label') ?? '').trim();
    const href = String(formData.get('href') ?? '').trim();
    const icon = String(formData.get('icon') ?? '').trim() || null;
    const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;
    const external = formData.get('external') === 'true';
    if (!packageId || !label || !href) return fail('Package, label and href are required.');
    await menuService.create({ packageId, label, href, icon, sortOrder, external });
    revalidatePath('/admin/menus');
    return ok(`Menu “${label}” added.`);
  } catch {
    return fail('Could not add the menu item.');
  }
}

export async function updateMenu(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = Number(formData.get('id'));
    const label = String(formData.get('label') ?? '').trim();
    const href = String(formData.get('href') ?? '').trim();
    const icon = String(formData.get('icon') ?? '').trim() || null;
    const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;
    const external = formData.get('external') === 'true';
    if (!id || !label || !href) return fail('Label and href are required.');
    await menuService.update(id, { label, href, icon, sortOrder, external });
    revalidatePath('/admin/menus');
    return ok(`Menu “${label}” updated.`);
  } catch {
    return fail('Could not update the menu item.');
  }
}

export async function toggleMenu(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = Number(formData.get('id'));
    const enabled = formData.get('enabled') === 'true';
    await menuService.setEnabled(id, !enabled);
    revalidatePath('/admin/menus');
    return ok(!enabled ? 'Menu enabled.' : 'Menu disabled.');
  } catch {
    return fail('Could not update the menu item.');
  }
}

export async function deleteMenu(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await menuService.remove(Number(formData.get('id')));
    revalidatePath('/admin/menus');
    return ok('Menu item deleted.');
  } catch {
    return fail('Could not delete the menu item.');
  }
}

// --- Users (assign role + package) ---
export async function updateUser(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = Number(formData.get('id'));
    const role = String(formData.get('role') ?? 'user') === 'admin' ? 'admin' : 'user';
    const rawPackage = String(formData.get('packageId') ?? '');
    const packageId = rawPackage ? Number(rawPackage) : null;
    await userService.setRoleAndPackage(id, role, packageId);
    revalidatePath('/admin/users');
    return ok('User updated.');
  } catch {
    return fail('Could not update the user.');
  }
}

// --- OIDC providers ---
export async function createOidc(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get('id') ?? '').trim().toLowerCase();
    const name = String(formData.get('name') ?? '').trim();
    const issuer = String(formData.get('issuer') ?? '').trim();
    const clientId = String(formData.get('clientId') ?? '').trim();
    const clientSecret = String(formData.get('clientSecret') ?? '').trim();
    const scopes = String(formData.get('scopes') ?? '').trim();
    if (!id || !name || !issuer || !clientId || !clientSecret)
      return fail('All fields except scopes are required.');
    const created = await oidcService.create({ id, name, issuer, clientId, clientSecret, scopes });
    if (!created) return fail(`A provider with id “${id}” already exists.`);
    revalidatePath('/admin/oidc');
    return ok(`Provider “${name}” added.`);
  } catch {
    return fail('Could not add the provider.');
  }
}

export async function updateOidc(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get('id'));
    const name = String(formData.get('name') ?? '').trim();
    const issuer = String(formData.get('issuer') ?? '').trim();
    const clientId = String(formData.get('clientId') ?? '').trim();
    const clientSecret = String(formData.get('clientSecret') ?? '').trim();
    const scopes = String(formData.get('scopes') ?? '').trim();
    if (!id || !name || !issuer || !clientId) return fail('Name, issuer and client ID are required.');
    await oidcService.update(id, {
      name,
      issuer,
      clientId,
      scopes,
      clientSecret: clientSecret || undefined,
    });
    revalidatePath('/admin/oidc');
    return ok(`Provider “${name}” updated.`);
  } catch {
    return fail('Could not update the provider.');
  }
}

export async function toggleOidc(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get('id'));
    const enabled = formData.get('enabled') === 'true';
    await oidcService.setEnabled(id, !enabled);
    revalidatePath('/admin/oidc');
    return ok(!enabled ? 'Provider enabled.' : 'Provider disabled.');
  } catch {
    return fail('Could not update the provider.');
  }
}

export async function deleteOidc(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await oidcService.remove(String(formData.get('id')));
    revalidatePath('/admin/oidc');
    return ok('Provider deleted.');
  } catch {
    return fail('Could not delete the provider.');
  }
}
