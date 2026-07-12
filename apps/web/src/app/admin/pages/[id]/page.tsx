"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import type { BlockType, ContentBlock } from '@/store/adminStore';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  EyeOff,
  Save,
  Eye,
  Edit2,
  X,
  Check,
} from 'lucide-react';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; placeholder: string }[] = [
  { type: 'heading',    label: 'Heading',    icon: 'H1', placeholder: 'Section heading...' },
  { type: 'subheading', label: 'Subheading', icon: 'H2', placeholder: 'Subsection heading...' },
  { type: 'paragraph',  label: 'Paragraph',  icon: '¶',  placeholder: 'Write your content here...' },
  { type: 'callout',    label: 'Callout',    icon: '💡', placeholder: 'Important note or callout...' },
  { type: 'list',       label: 'List',       icon: '☰',  placeholder: '' },
  { type: 'divider',    label: 'Divider',    icon: '—',  placeholder: '' },
];

function BlockPreview({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-2xl font-bold text-ronda-purple font-brand mt-6 mb-2">{block.content || <span className="text-slate-300 italic">Empty heading</span>}</h2>;
    case 'subheading':
      return <h3 className="text-lg font-bold text-ronda-slate mt-5 mb-2">{block.content || <span className="text-slate-300 italic">Empty subheading</span>}</h3>;
    case 'paragraph':
      return <p className="text-ronda-slate/80 font-body text-sm leading-relaxed mb-3">{block.content || <span className="text-slate-300 italic">Empty paragraph</span>}</p>;
    case 'callout':
      return (
        <div className="bg-ronda-teal/10 border-l-4 border-ronda-teal rounded-r-xl px-4 py-3 my-3">
          <p className="text-ronda-teal font-semibold text-sm">{block.content || <span className="italic opacity-60">Empty callout</span>}</p>
        </div>
      );
    case 'divider':
      return <hr className="my-6 border-slate-200" />;
    case 'list': {
      let items: string[] = [];
      try { items = JSON.parse(block.content); } catch { items = []; }
      return (
        <ul className="list-disc list-inside text-ronda-slate/80 font-body text-sm space-y-1 mb-3">
          {items.length > 0 ? items.map((item, i) => <li key={i}>{item}</li>) : <li className="text-slate-300 italic">Empty list</li>}
        </ul>
      );
    }
    default:
      return null;
  }
}

function BlockEditor({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: ContentBlock;
  onUpdate: (updated: Partial<Omit<ContentBlock, 'id'>>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editingList, setEditingList] = useState<string[]>([]);
  const [listInput, setListInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (block.type === 'list') {
      try { setEditingList(JSON.parse(block.content)); } catch { setEditingList([]); }
    }
  }, [block.type, block.content]);

  const handleListAdd = () => {
    if (!listInput.trim()) return;
    const updated = [...editingList, listInput.trim()];
    setEditingList(updated);
    onUpdate({ content: JSON.stringify(updated) });
    setListInput('');
  };

  const handleListRemove = (idx: number) => {
    const updated = editingList.filter((_, i) => i !== idx);
    setEditingList(updated);
    onUpdate({ content: JSON.stringify(updated) });
  };

  const meta = BLOCK_TYPES.find((b) => b.type === block.type);

  return (
    <div className="bg-white border-2 border-slate-100 hover:border-ronda-purple/20 rounded-2xl p-5 group transition-all">
      <div className="flex items-center justify-between mb-3">
        {/* Block type badge */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-ronda-purple/10 text-ronda-purple rounded-lg flex items-center justify-center text-xs font-bold font-mono">
            {meta?.icon}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta?.label}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button disabled={isFirst} onClick={onMoveUp} className="p-1.5 text-slate-300 hover:text-ronda-purple disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Move up">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button disabled={isLast} onClick={onMoveDown} className="p-1.5 text-slate-300 hover:text-ronda-purple disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Move down">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer ml-1" title="Remove block">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content editor */}
      {block.type === 'divider' ? (
        <div className="text-center text-slate-300 text-xs italic py-2">— Horizontal Divider —</div>
      ) : block.type === 'list' ? (
        <div className="space-y-2">
          {editingList.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-ronda-teal font-bold text-xs">•</span>
              <span className="flex-1 text-sm text-ronda-slate">{item}</span>
              <button onClick={() => handleListRemove(i)} className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleListAdd(); } }}
              placeholder="Add list item and press Enter…"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-ronda-slate focus:outline-none focus:border-ronda-teal transition-colors"
            />
            <button onClick={handleListAdd} className="px-3 py-2 bg-ronda-teal text-white rounded-xl hover:bg-ronda-tealDark transition-colors cursor-pointer text-sm font-bold">
              Add
            </button>
          </div>
        </div>
      ) : (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder={meta?.placeholder}
          rows={block.type === 'paragraph' ? 4 : 2}
          className="w-full px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm text-ronda-slate focus:outline-none focus:border-ronda-teal transition-colors resize-none leading-relaxed font-body"
        />
      )}
    </div>
  );
}

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const pages = useAdminStore((s) => s.pages);
  const updatePage = useAdminStore((s) => s.updatePage);
  const togglePageStatus = useAdminStore((s) => s.togglePageStatus);
  const addBlock = useAdminStore((s) => s.addBlock);
  const updateBlock = useAdminStore((s) => s.updateBlock);
  const removeBlock = useAdminStore((s) => s.removeBlock);
  const moveBlock = useAdminStore((s) => s.moveBlock);

  const page = pages.find((p) => p.id === id);

  const [showPreview, setShowPreview] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-bold text-ronda-purple">Page not found</h2>
        <Link href="/admin/pages" className="text-ronda-teal font-bold text-sm hover:underline">← Back to Pages</Link>
      </div>
    );
  }

  const handleSaveTitle = () => {
    if (titleDraft.trim()) updatePage(page.id, { title: titleDraft.trim() });
    setEditingTitle(false);
  };

  const handleAddBlock = (type: BlockType) => {
    const defaultContent = type === 'list' ? JSON.stringify([]) : type === 'divider' ? '' : '';
    addBlock(page.id, { type, content: defaultContent });
    setShowBlockPicker(false);
  };

  const handleSave = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="p-2 text-slate-400 hover:text-ronda-purple transition-colors rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                  className="text-xl font-bold text-ronda-purple font-brand bg-slate-50 border-2 border-ronda-teal rounded-xl px-3 py-1 focus:outline-none"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="p-1.5 text-emerald-500 hover:text-emerald-600 cursor-pointer"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingTitle(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold text-ronda-purple font-brand">{page.title}</h2>
                <button onClick={() => { setTitleDraft(page.title); setEditingTitle(true); }} className="p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-ronda-purple transition-all cursor-pointer">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">/pages/{page.slug}</span>
              {page.status === 'published' && (
                <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-ronda-teal hover:underline text-xs font-semibold flex items-center gap-1">
                  View live <Globe className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              showPreview ? 'bg-ronda-purple text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Editor' : 'Preview'}
          </button>

          {/* Publish/Draft toggle */}
          <button
            onClick={() => togglePageStatus(page.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              page.status === 'published'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {page.status === 'published' ? <><EyeOff className="w-4 h-4" /> Set Draft</> : <><Globe className="w-4 h-4" /> Publish</>}
          </button>

          {/* Save (feedback only — auto-saved via Zustand) */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              savedFlash ? 'bg-emerald-500 text-white' : 'bg-ronda-teal text-white hover:bg-ronda-tealDark'
            }`}
          >
            {savedFlash ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      {/* Two-column layout: Editor + Preview */}
      <div className={`grid gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

        {/* EDITOR PANEL */}
        {!showPreview && (
          <div className="space-y-4">
            {page.blocks.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center">
                <span className="text-4xl block mb-4">📄</span>
                <p className="text-slate-400 font-semibold mb-4">No blocks yet. Add your first block below.</p>
              </div>
            )}

            {page.blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                onUpdate={(updated) => updateBlock(page.id, block.id, updated)}
                onRemove={() => removeBlock(page.id, block.id)}
                onMoveUp={() => moveBlock(page.id, block.id, 'up')}
                onMoveDown={() => moveBlock(page.id, block.id, 'down')}
                isFirst={idx === 0}
                isLast={idx === page.blocks.length - 1}
              />
            ))}

            {/* Add Block Button */}
            <div className="relative">
              <button
                onClick={() => setShowBlockPicker(!showBlockPicker)}
                className="w-full border-2 border-dashed border-ronda-teal/40 hover:border-ronda-teal text-ronda-teal hover:bg-ronda-teal/5 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <Plus className="w-5 h-5" />
                Add Block
              </button>

              {showBlockPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-20 grid grid-cols-3 gap-2 animate-fade-in">
                  {BLOCK_TYPES.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => handleAddBlock(bt.type)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-ronda-purple/5 hover:border-ronda-purple/20 border-2 border-transparent transition-all cursor-pointer group"
                    >
                      <span className="w-8 h-8 bg-slate-100 group-hover:bg-ronda-purple/10 text-ronda-purple rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-colors">
                        {bt.icon}
                      </span>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-ronda-purple transition-colors">{bt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PREVIEW PANEL (shown alone when !showPreview is false, or side-by-side) */}
        {showPreview && (
          <>
            {/* Editor in left col */}
            <div className="space-y-4">
              {page.blocks.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                  <p className="text-slate-400 font-semibold">No blocks yet.</p>
                </div>
              )}
              {page.blocks.map((block, idx) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onUpdate={(updated) => updateBlock(page.id, block.id, updated)}
                  onRemove={() => removeBlock(page.id, block.id)}
                  onMoveUp={() => moveBlock(page.id, block.id, 'up')}
                  onMoveDown={() => moveBlock(page.id, block.id, 'down')}
                  isFirst={idx === 0}
                  isLast={idx === page.blocks.length - 1}
                />
              ))}
              <button
                onClick={() => setShowBlockPicker(!showBlockPicker)}
                className="w-full border-2 border-dashed border-ronda-teal/40 hover:border-ronda-teal text-ronda-teal hover:bg-ronda-teal/5 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" /> Add Block
              </button>
              {showBlockPicker && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 grid grid-cols-3 gap-2">
                  {BLOCK_TYPES.map((bt) => (
                    <button key={bt.type} onClick={() => handleAddBlock(bt.type)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-ronda-purple/5 border-2 border-transparent hover:border-ronda-purple/20 transition-all cursor-pointer">
                      <span className="w-7 h-7 bg-slate-100 text-ronda-purple rounded-lg flex items-center justify-center text-xs font-bold font-mono">{bt.icon}</span>
                      <span className="text-[10px] font-bold text-slate-600">{bt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview in right col */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 lg:sticky lg:top-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Eye className="w-4 h-4 text-ronda-teal" />
                <span className="text-xs font-bold text-ronda-teal uppercase tracking-wider">Live Preview</span>
              </div>
              <h1 className="text-3xl font-bold text-ronda-purple font-brand mb-4">{page.title}</h1>
              {page.blocks.map((block) => (
                <BlockPreview key={block.id} block={block} />
              ))}
              {page.blocks.length === 0 && (
                <p className="text-slate-300 italic text-sm">Start adding blocks to see the preview…</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Block count */}
      <div className="text-xs text-slate-400 font-semibold text-center">
        {page.blocks.length} block{page.blocks.length !== 1 ? 's' : ''} · Status:{' '}
        <span className={page.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}>
          {page.status}
        </span>
        {' '}· Last updated: {page.updatedAt}
      </div>
    </div>
  );
}
