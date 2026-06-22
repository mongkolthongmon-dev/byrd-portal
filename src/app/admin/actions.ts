'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/guards';
import { menuService } from '@/services/menuService';
import { oidcService } from '@/services/oidcService';
import { packageService } from '@/services/packageService';
import { userService } from '@/services/userService';

// Every admin write re-checks the admin role on the server, then delegates to a
// service.

// --- Packages ---
export async function createPackage(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  if (!name) return;
  await packageService.create({ name, description });
  revalidatePath('/admin/packages');
}

export async function deletePackage(formData: FormData) {
  await requireAdmin();
  await packageService.remove(Number(formData.get('id')));
  revalidatePath('/admin/packages');
}

// --- Menus ---
export async function createMenu(formData: FormData) {
  await requireAdmin();
  const packageId = Number(formData.get('packageId'));
  const label = String(formData.get('label') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();
  const icon = String(formData.get('icon') ?? '').trim() || null;
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;
  const external = formData.get('external') === 'true';
  if (!packageId || !label || !href) return;
  await menuService.create({ packageId, label, href, icon, sortOrder, external });
  revalidatePath('/admin/menus');
}

export async function updateMenu(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('id'));
  const label = String(formData.get('label') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();
  const icon = String(formData.get('icon') ?? '').trim() || null;
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;
  const external = formData.get('external') === 'true';
  if (!id || !label || !href) return;
  await menuService.update(id, { label, href, icon, sortOrder, external });
  revalidatePath('/admin/menus');
}

export async function toggleMenu(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('id'));
  const enabled = formData.get('enabled') === 'true';
  await menuService.setEnabled(id, !enabled);
  revalidatePath('/admin/menus');
}

export async function deleteMenu(formData: FormData) {
  await requireAdmin();
  await menuService.remove(Number(formData.get('id')));
  revalidatePath('/admin/menus');
}

// --- Users (assign role + package) ---
export async function updateUser(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('id'));
  const role = String(formData.get('role') ?? 'user') === 'admin' ? 'admin' : 'user';
  const rawPackage = String(formData.get('packageId') ?? '');
  const packageId = rawPackage ? Number(rawPackage) : null;
  await userService.setRoleAndPackage(id, role, packageId);
  revalidatePath('/admin/users');
}

// --- OIDC providers ---
export async function createOidc(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const issuer = String(formData.get('issuer') ?? '').trim();
  const clientId = String(formData.get('clientId') ?? '').trim();
  const clientSecret = String(formData.get('clientSecret') ?? '').trim();
  const scopes = String(formData.get('scopes') ?? '').trim();
  if (!id || !name || !issuer || !clientId || !clientSecret) return;
  await oidcService.create({ id, name, issuer, clientId, clientSecret, scopes });
  revalidatePath('/admin/oidc');
}

export async function updateOidc(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const name = String(formData.get('name') ?? '').trim();
  const issuer = String(formData.get('issuer') ?? '').trim();
  const clientId = String(formData.get('clientId') ?? '').trim();
  const clientSecret = String(formData.get('clientSecret') ?? '').trim();
  const scopes = String(formData.get('scopes') ?? '').trim();
  if (!id || !name || !issuer || !clientId) return;
  await oidcService.update(id, {
    name,
    issuer,
    clientId,
    scopes,
    clientSecret: clientSecret || undefined,
  });
  revalidatePath('/admin/oidc');
}

export async function toggleOidc(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const enabled = formData.get('enabled') === 'true';
  await oidcService.setEnabled(id, !enabled);
  revalidatePath('/admin/oidc');
}

export async function deleteOidc(formData: FormData) {
  await requireAdmin();
  await oidcService.remove(String(formData.get('id')));
  revalidatePath('/admin/oidc');
}
