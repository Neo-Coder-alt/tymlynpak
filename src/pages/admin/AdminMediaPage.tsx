import { useEffect, useState } from 'react';
import { Upload, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/storage';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, EmptyState, Spinner } from '@/components/ui/Skeletons';

interface MediaItem {
  name: string;
  url: string;
  id: string;
}

export function AdminMediaPage() {
  const notify = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('media').list(undefined, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) { setLoading(false); return; }
    const items = (data ?? [])
      .filter((f) => !f.id.endsWith('.emptyFolderPlaceholder'))
      .map((f) => {
        const { data: pub } = supabase.storage.from('media').getPublicUrl(f.name);
        return { name: f.name, url: pub.publicUrl, id: f.id };
      });
    setMedia(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { error } = await uploadImage(file, '');
        if (error) { notify(error, 'error'); }
      }
      notify('Images uploaded.');
      load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (name: string, url: string) => {
    await deleteImage(url);
    await supabase.storage.from('media').remove([name]);
    notify('Image deleted.');
    load();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notify('URL copied.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-white">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-1">All uploaded images</p>
        </div>
        <label className="cursor-pointer">
          <Button variant="gold" loading={uploading} className="pointer-events-none">
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-amber-400"><Spinner /> Uploading...</div>
      )}

      {loading ? (
        <CenterSpinner label="Loading media..." />
      ) : media.length === 0 ? (
        <EmptyState title="No media" icon={<ImageIcon className="w-12 h-12" />} message="Upload your first image." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((m) => (
            <div key={m.id} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
              <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(m.url)} className="bg-white/10 p-2 rounded text-white hover:bg-white/20" title="Copy URL">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(m.name, m.url)} className="bg-red-600/80 p-2 rounded text-white hover:bg-red-600" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
