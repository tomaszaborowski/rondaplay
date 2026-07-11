"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Copy,
  ExternalLink,
  FileText,
  CheckCircle,
} from 'lucide-react';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminPagesListPage() {
  const pages = useAdminStore((s) => s.pages);
  const addPage = useAdminStore((s) => s.addPage);
  const deletePage = useAdminStore((s) => s.deletePage);
  const togglePageStatus = useAdminStore((s) => s.togglePageStatus);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleTitleChange = (v: string) => {
    setNewTitle(v);
    if (!slugManual) setNewSlug(slugify(v));
  };

  const handleSlugChange = (v: string) => {
    setSlugManual(true);
    setNewSlug(slugify(v));
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newSlug.trim()) return;
    addPage({ title: newTitle.trim(), slug: newSlug.trim(), status: 'draft', blocks: [] });
    setNewTitle('');
    setNewSlug('');
    setSlugManual(false);
    setShowNewModal(false);
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/pages/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const published = pages.filter((p) => p.status === 'published');
  const drafts = pages.filter((p) => p.status === 'draft');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ronda-purple font-brand">Page Manager</h2>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Create and manage modular content pages (Terms, Privacy, FAQ…)
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-ronda-teal hover:bg-ronda-tealDark text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pages</div>
          <div className="text-3xl font-extrabold text-ronda-purple font-brand">{pages.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Published</div>
          <div className="text-3xl font-extrabold text-emerald-500 font-brand">{published.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Drafts</div>
          <div className="text-3xl font-extrabold text-amber-500 font-brand">{drafts.length}</div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <FileText className="w-5 h-5 text-ronda-purple" />
          <h3 className="font-bold text-ronda-purple text-lg font-brand">All Pages</h3>
        </div>

        {pages.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-semibold">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No pages yet. Create your first page!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Slug / URL</th>
                  <th className="py-4 px-6">Blocks</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-ronda-purple/40 flex-shrink-0" />
                        <span className="font-bold text-ronda-slate">{page.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          /pages/{page.slug}
                        </span>
                        {page.status === 'published' && (
                          <a
                            href={`/pages/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ronda-teal hover:text-ronda-tealDark transition-colors"
                            title="Open page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">
                        {page.blocks.length} block{page.blocks.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => togglePageStatus(page.id)}
                        title="Toggle status"
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          page.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {page.status === 'published' ? (
                          <><Globe className="w-3 h-3" /> Published</>
                        ) : (
                          <><EyeOff className="w-3 h-3" /> Draft</>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">{page.updatedAt}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyLink(page.slug)}
                          title="Copy public link"
                          className="p-2 text-slate-400 hover:text-ronda-teal transition-colors cursor-pointer"
                        >
                          {copied === page.slug ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {/* Edit */}
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="p-2 text-slate-400 hover:text-ronda-purple transition-colors"
                          title="Edit page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {/* Delete */}
                        {deleteConfirm === page.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { deletePage(page.id); setDeleteConfirm(null); }}
                              className="text-red-600 hover:text-red-700 font-bold text-xs px-2 py-1 bg-red-50 rounded-lg cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(page.id)}
                            title="Delete page"
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How-to callout */}
      <div className="bg-ronda-purple/5 border border-ronda-purple/10 rounded-2xl p-6 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-ronda-purple/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <h4 className="font-bold text-ronda-purple mb-1">How Page Manager works</h4>
          <p className="text-sm text-ronda-slate/70 font-body leading-relaxed">
            Create a page, open the block editor to add <strong>Headings</strong>, <strong>Paragraphs</strong>,
            <strong> Callouts</strong>, <strong>Lists</strong>, and <strong>Dividers</strong>. Once published, the
            page is live at <code className="bg-white px-1.5 py-0.5 rounded text-xs">/pages/[slug]</code>.
            Copy the link and add it to your footer or navigation.
          </p>
        </div>
      </div>

      {/* New Page Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <h3 className="text-xl font-bold text-ronda-purple font-brand mb-6">Create New Page</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ronda-slate mb-2">Page Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Terms and Conditions"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate text-sm focus:outline-none focus:border-ronda-teal transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ronda-slate mb-2">
                  URL Slug *
                  <span className="ml-2 text-slate-400 font-normal text-xs">/pages/{newSlug || '...'}</span>
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="terms-and-conditions"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate font-mono text-sm focus:outline-none focus:border-ronda-teal transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Auto-generated from title. Edit to customise.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newSlug.trim()}
                className="flex-1 bg-ronda-teal hover:bg-ronda-tealDark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
              >
                Create Page
              </button>
              <button
                onClick={() => { setShowNewModal(false); setNewTitle(''); setNewSlug(''); setSlugManual(false); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-ronda-slate font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
