import { supabase } from '@/lib/supabase';

const BUCKET = 'media';

export async function uploadImage(file: File, folder = 'products'): Promise<{ url: string; error: string | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { url: '', error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return { url: data.publicUrl, error: null };
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const path = parts[1];
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    /* ignore — image may already be gone */
  }
}

export function isStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/media/');
}
