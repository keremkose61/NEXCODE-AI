import React, { useState, useEffect } from 'react';
import {
  X,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useGitStore } from '../../stores/useGitStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { PRReviewSummary } from '@nexcode/shared';

export const PRReviewModal: React.FC = () => {
  const { isPRReviewOpen, closePRReview } = useUIStore();
  const { branch } = useGitStore();
  const { addNotification } = useNotificationStore();

  const [review, setReview] = useState<PRReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isPRReviewOpen && window.nexcode) {
      setLoading(true);
      window.nexcode.git
        .generatePRReview('master')
        .then((res: PRReviewSummary) => {
          setReview(res);
        })
        .catch((err: any) => {
          addNotification({
            type: 'error',
            title: 'Code Review Error',
            message: err.message || 'Failed to generate code review.'
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isPRReviewOpen, addNotification]);

  if (!isPRReviewOpen) return null;

  const handleCopy = () => {
    if (!review) return;
    navigator.clipboard.writeText(`${review.title}\n\n${review.description}`);
    setCopied(true);
    addNotification({ type: 'info', message: 'PR details copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={closePRReview}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-200"
      >
        {/* Header */}
        <div className="p-4 bg-nexcode-950 border-b border-nexcode-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Local AI Pull Request & Code Review
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {branch || 'master'} → master
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Automated static analysis, security validation, and PR documentation generation.
              </p>
            </div>
          </div>

          <button
            onClick={closePRReview}
            className="p-1.5 rounded hover:bg-nexcode-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
              <p>Analyzing changed files & security heuristics...</p>
            </div>
          ) : review ? (
            <>
              {/* Summary Card */}
              <div className="p-3.5 rounded-lg bg-nexcode-950 border border-nexcode-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">{review.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">{review.summary}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold uppercase ${
                      review.riskLevel === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : review.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Risk: {review.riskLevel}
                  </span>
                </div>
              </div>

              {/* File-by-File Findings */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                  File Inspections ({review.fileReviews.length})
                </h4>
                {review.fileReviews.map((fr, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-nexcode-950/70 border border-nexcode-800 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      <span className="font-mono text-slate-200 font-medium">{fr.filePath}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          fr.status === 'clean'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {fr.status === 'clean' ? 'All Clear' : 'Notes Found'}
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-2">
                      {fr.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Generated PR Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                    Generated PR Markdown
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy PR Description'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-nexcode-950 rounded-lg border border-nexcode-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {review.description}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">No review data available.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-nexcode-950 border-t border-nexcode-800 flex items-center justify-end space-x-2">
          <button
            onClick={closePRReview}
            className="px-4 py-1.5 rounded bg-nexcode-800 hover:bg-nexcode-700 text-slate-200 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
