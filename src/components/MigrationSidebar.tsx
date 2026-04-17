'use client';

import React from 'react';
import { 
  History, CheckCircle2, XCircle, Clock, 
  Terminal, Copy, Check, ExternalLink, Trash2
} from 'lucide-react';

interface MigrationRecord {
  id: string;
  branchName: string;
  sourceBranch: string;
  targetBranch: string;
  commitHash: string;
  commitMessage: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  timestamp: string;
  command?: string;
  log?: string;
}

interface MigrationSidebarProps {
  history: MigrationRecord[];
  onClearHistory: () => void;
  onSelectRecord?: (record: MigrationRecord) => void;
}

export default function MigrationSidebar({ history, onClearHistory, onSelectRecord }: MigrationSidebarProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyLog = (record: MigrationRecord) => {
    if (!record.log) return;
    navigator.clipboard.writeText(record.log);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full border-r transition-colors duration-300" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
      <div className="p-4 border-b sticky top-0 z-10 transition-colors duration-300" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History style={{ color: 'var(--muted-foreground)' }} size={18} />
            <h2 className="font-bold" style={{ color: 'var(--card-foreground)' }}>Migration History</h2>
          </div>
          {history.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="p-1 rounded transition-colors hover:text-red-500"
              style={{ color: 'var(--muted-foreground)' }}
              title="Clear History"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedHistory.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <History size={32} className="opacity-20" />
            <p className="text-xs">No migrations found.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {sortedHistory.map((record) => (
              <div 
                key={record.id} 
                onClick={() => onSelectRecord && onSelectRecord(record)}
                className={`p-4 transition-colors group relative ${record.status === 'failed' ? 'border-l-4 border-red-400' : ''}`}
                style={{ cursor: onSelectRecord ? 'pointer' : 'default' }}
                onMouseEnter={e => { if (onSelectRecord) (e.currentTarget as HTMLDivElement).style.background = 'var(--card-border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {record.status === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {record.status === 'failed' && <XCircle size={14} className="text-red-500" />}
                    {record.status === 'running' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {record.status === 'pending' && <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />}
                    <span className="text-[11px] font-mono" style={{ color: 'var(--secondary-text)' }}>{record.timestamp}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-[12px] font-bold truncate mb-0.5" style={{ color: 'var(--card-foreground)' }}>{record.branchName}</p>
                  <p className="text-[10px] line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>
                    {record.commitHash.substring(0, 7)}: {record.commitMessage}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--card-border)', color: 'var(--secondary-text)' }}>
                      {record.sourceBranch} → {record.targetBranch}
                    </span>
                    
                    {record.log && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyLog(record); }}
                        className="opacity-0 group-hover:opacity-100 ml-auto p-1 rounded shadow-sm transition-all hover:text-blue-500"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--secondary-text)' }}
                        title="Copy Log"
                      >
                        {copiedId === record.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
