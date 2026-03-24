import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
  Eye,
  Edit2,
  Loader2,
  ImageIcon,
  X,
  Save,
  ArrowLeft,
  Tag,
  LayoutTemplate,
} from 'lucide-react';
import ImageResize from 'quill-image-resize-module-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'sonner'; // əlavə etdim ki, gözəl mesaj çıxsın

/* ── Quill setup ──────────────────────────────────────────────────────────────*/
const Quill = ReactQuill.Quill;
if (Quill && !Quill.imports['modules/imageResize']) {
  Quill.register('modules/imageResize', ImageResize);
}

const CATEGORIES = ['Web3', 'JavaScript', 'React', 'Advanced', 'Beginner'] as const;
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export interface BlogEditorData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;        // Cloudinary URL
  category: string;
  difficulty: string;
  tags: string[];
}

interface BlogEditorProps {
  mode?: 'edit' | 'view';
  initialData?: Partial<BlogEditorData>;
  onSave?: (data: BlogEditorData) => void;
  onClose?: () => void;
}

/* ── Component ───────────────────────────────────────────────────────────────*/
export default function BlogEditor({ mode = 'edit', initialData, onSave, onClose }: BlogEditorProps) {
  const isDark = useTheme();
  const [currentMode, setCurrentMode] = useState(mode);

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [category, setCategory] = useState<string>(initialData?.category ?? 'Beginner');
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty ?? 'Beginner');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  // Upload state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);

  // Refs
  const quillRef = useRef<ReactQuill>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // Sync initialData
  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title ?? '');
    setExcerpt(initialData.excerpt ?? '');
    setContent(initialData.content ?? '');
    setCoverImage(initialData.coverImage ?? '');
    setCategory(initialData.category ?? 'Beginner');
    setDifficulty(initialData.difficulty ?? 'Beginner');
    setTags(initialData.tags ?? []);
  }, [initialData]);

  // Sync mode
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  /* ── Content validation ───────────────────────────────────────────────────*/
  const isContentEmpty = (html: string): boolean => {
    if (!html || html.trim() === '') return true;
    const trimmed = html.trim();
    if (/^<p><br><\/p>$/i.test(trimmed) || /^<p>&nbsp;<\/p>$/i.test(trimmed)) return true;

    const stripped = html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\u200B/g, '')
      .replace(/[\s\uFEFF\xA0]+/g, ' ')
      .trim();

    return stripped === '' || stripped === '\n';
  };

  /* ── Cover Image Upload ───────────────────────────────────────────────────*/
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  console.log("📤 Uploading cover file:", file.name);

  setUploadingCover(true);
  try {
    const url = await uploadToCloudinary(file);
    console.log("✅ Cover uploaded successfully! URL:", url);
    setCoverImage(url);
    toast.success('Cover image uploaded! ✅');
  } catch (err: any) {
    console.error("❌ Cover upload error:", err);
    toast.error('Failed to upload cover image: ' + (err.message || ''));
  } finally {
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }
};

  /* ── Content Image Upload ─────────────────────────────────────────────────*/
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (contentImageInputRef.current) contentImageInputRef.current.value = '';
    if (!file) return;

    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    setUploadingContent(true);
    try {
      const url = await uploadToCloudinary(file);
      const range = quill.getSelection(true);
      const idx = typeof range?.index === 'number' ? range.index : quill.getLength() - 1;
      quill.insertEmbed(idx, 'image', url, 'user');
      quill.setSelection(idx + 1);
      toast.success('Image added to content');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingContent(false);
    }
  };

  const pickContentImage = useCallback(() => {
    contentImageInputRef.current?.click();
  }, []);

  /* ── Tags ────────────────────────────────────────────────────────────────*/
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const next = tagInput.trim().toLowerCase();
      if (!tags.includes(next)) {
        setTags(prev => [...prev, next]);
      }
      setTagInput('');
    }
  };

  /* ── Save Handler ────────────────────────────────────────────────────────*/
  const handleSave = () => {
  const cleanTitle = title.trim();
  const cleanExcerpt = excerpt.trim();
  const cleanContent = content.trim();

  if (!cleanTitle) {
    toast.error('Başlıq mütləqdir!');
    return;
  }
  if (!cleanExcerpt) {
    toast.error('Excerpt mütləqdir!');
    return;
  }

  const quill = quillRef.current?.getEditor();
  const hasRealContent = quill
    ? quill.getText().trim().length > 5
    : !isContentEmpty(cleanContent);

  if (!hasRealContent) {
    toast.error('Məzmun yazmalısınız!');
    return;
  }

  // ← DEBUG: Nə göndərilir?
  console.log("🚀 handleSave called with:", {
    title: cleanTitle,
    excerpt: cleanExcerpt,
    content: cleanContent,
    coverImage,           // ← Buraya bax! Boşdursa problem buradadır
    category,
    difficulty,
    tags,
  });

  onSave?.({
    title: cleanTitle,
    excerpt: cleanExcerpt,
    content: cleanContent,
    coverImage,           // ← Əsas göndərilən
    category,
    difficulty,
    tags,
  });
};

  /* ── Quill Modules ───────────────────────────────────────────────────────*/
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: pickContentImage,
        },
      },
      imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
    }),
    [pickContentImage]
  );

  /* ── Theme Classes ───────────────────────────────────────────────────────*/
  const bg = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const surface = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBase = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500
    ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`;

  /* ── VIEW MODE ───────────────────────────────────────────────────────────*/
  if (currentMode === 'view') {
    return (
      <div className={`min-h-screen ${bg} ${text}`}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => setCurrentMode('edit')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${muted} hover:${text}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Editor
            </button>
            {onClose && (
              <button onClick={onClose} className={`text-sm ${muted} hover:${text}`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {category && (
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-400 uppercase tracking-wider">
              {category}
            </span>
          )}

          <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight mb-4 ${text}`}>
            {title || 'Untitled'}
          </h1>

          {excerpt && <p className={`text-xl leading-relaxed mb-8 ${muted}`}>{excerpt}</p>}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`text-sm px-3 py-1 rounded-lg border ${
                    isDark
                      ? 'border-slate-700 text-slate-400 bg-slate-800'
                      : 'border-gray-200 text-gray-500 bg-gray-100'
                  }`}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {coverImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-violet-500/20">
              <img src={coverImage} alt={title} className="w-full aspect-video object-cover" />
            </div>
          )}

          <article
            className={`prose max-w-none prose-lg ${
              isDark
                ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-violet-400 prose-code:text-violet-300 prose-blockquote:border-violet-500'
                : 'prose-gray prose-a:text-violet-600 prose-blockquote:border-violet-500'
            } prose-img:rounded-xl prose-img:shadow-lg`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        </div>
      </div>
    );
  }

  /* ── EDIT MODE ───────────────────────────────────────────────────────────*/
  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={contentImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleContentImageUpload}
      />

      {/* Top Bar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className={`text-sm font-semibold ${muted}`}>Blog Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMode('view')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'}`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25"
            >
              <Save className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Left Side */}
        <div className="space-y-6 min-w-0">
          {/* Title & Excerpt */}
          <div className={`rounded-2xl border p-6 space-y-4 ${surface}`}>
            <input
              type="text"
              placeholder="Your post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-transparent text-3xl md:text-4xl font-extrabold outline-none border-b pb-3 transition-colors
                ${isDark ? 'text-white placeholder-slate-700 border-slate-800 focus:border-violet-500/50' : 'text-gray-900 placeholder-gray-300 border-gray-200 focus:border-violet-400'}`}
            />
            <textarea
              rows={2}
              placeholder="Write a short excerpt that summarizes your post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={`w-full bg-transparent text-base resize-none outline-none leading-relaxed
                ${isDark ? 'text-slate-300 placeholder-slate-600' : 'text-gray-600 placeholder-gray-400'}`}
            />
          </div>

          {/* Cover Image */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            <div className={`flex items-center gap-2 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-gray-100 text-gray-400'}`}>
              <ImageIcon className="w-3.5 h-3.5" /> Cover Image
            </div>
            <div
              onClick={() => coverInputRef.current?.click()}
              className={`relative cursor-pointer group transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}
            >
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full aspect-[2.5/1] object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Change cover
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverImage('');
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className={`flex flex-col items-center justify-center gap-3 h-44 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                  {uploadingCover ? (
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 group-hover:text-violet-400 transition-colors" />
                      <span className="text-sm">
                        <span className="text-violet-500 font-semibold">Upload cover image</span> or drag & drop
                      </span>
                      <span className="text-xs">PNG, JPG, GIF — max 5MB</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className={`rounded-2xl border overflow-hidden ${surface}`}>
            <div className={`flex items-center gap-2 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-gray-100 text-gray-400'}`}>
              <Edit2 className="w-3.5 h-3.5" /> Content
            </div>
            <div className="relative">
              {uploadingContent && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                    <span className="text-sm font-medium">Uploading image…</span>
                  </div>
                </div>
              )}

              <style>{`
                .ql-toolbar {
                  border: none !important;
                  border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} !important;
                  background: ${isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'};
                  padding: 10px 16px !important;
                }
                .ql-container { border: none !important; font-size: 1.05rem; font-family: inherit; }
                .ql-editor {
                  min-height: 380px;
                  padding: 1.5rem !important;
                  color: ${isDark ? '#e2e8f0' : '#111827'};
                  line-height: 1.8;
                }
                .ql-editor.ql-blank::before {
                  color: ${isDark ? '#475569' : '#9ca3af'} !important;
                  font-style: normal !important;
                }
                .ql-toolbar .ql-stroke { stroke: ${isDark ? '#94a3b8' : '#6b7280'} !important; }
                .ql-toolbar .ql-fill { fill: ${isDark ? '#94a3b8' : '#6b7280'} !important; }
                .ql-toolbar .ql-picker { color: ${isDark ? '#94a3b8' : '#6b7280'} !important; }
                .ql-toolbar button:hover .ql-stroke { stroke: #8b5cf6 !important; }
                .ql-toolbar button:hover .ql-fill { fill: #8b5cf6 !important; }
                .ql-toolbar .ql-picker-options {
                  background: ${isDark ? '#1e293b' : '#ffffff'} !important;
                  border-color: ${isDark ? '#334155' : '#e5e7eb'} !important;
                  color: ${isDark ? '#e2e8f0' : '#111827'} !important;
                }
                .ql-editor img { max-width: 100%; border-radius: 12px; display: block; margin: 1rem auto; }
                .ql-editor blockquote {
                  border-left: 3px solid #8b5cf6 !important;
                  margin: 1.5rem 0 !important;
                  padding: 0.75rem 1.25rem !important;
                  background: ${isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)'};
                  border-radius: 0 8px 8px 0;
                }
              `}</style>

              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Start writing your post…"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-5">
          <SidebarCard isDark={isDark} icon={<LayoutTemplate className="w-3.5 h-3.5" />} label="Category">
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all
                    ${category === c
                      ? 'bg-violet-600 text-white'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard isDark={isDark} icon={<LayoutTemplate className="w-3.5 h-3.5" />} label="Difficulty">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={inputBase}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </SidebarCard>

          <SidebarCard isDark={isDark} icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
            <div
              className={`rounded-xl border p-3 space-y-2 transition-colors focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-500
                ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-medium"
                    >
                      #{t}
                      <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Press Enter to add…"
                className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </SidebarCard>
        </aside>
      </div>
    </div>
  );
}

/* ── SidebarCard Component ───────────────────────────────────────────────────*/
function SidebarCard({
  isDark,
  icon,
  label,
  children,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
        {icon} {label}
      </div>
      {children}
    </div>
  );
}