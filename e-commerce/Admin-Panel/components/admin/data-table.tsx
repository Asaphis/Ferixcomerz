'use client';
import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode;
  width?: string;
}

function looksLikeInternalId(value: string) {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ||
    (value.length > 18 && /[a-z0-9-]{12,}/i.test(value))
  );
}

function formatInternalId(value: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return '-';
  if (!looksLikeInternalId(text)) return text;

  const clean = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!clean) return text;
  return `ID-${clean.slice(-6)}`;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  searchPlaceholder?: string;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onView?: (row: Record<string, unknown>) => void;
  pageSize?: number;
  filterNode?: React.ReactNode;
  actionNode?: React.ReactNode;
  renderActions?: (row: Record<string, unknown>) => React.ReactNode;
}

export default function DataTable({
  columns, data, searchPlaceholder = 'Search...', onEdit, onDelete, onView, pageSize = 10, filterNode, actionNode, renderActions
}: DataTableProps) {
  const card    = 'var(--card)';
  const border  = 'var(--border)';
  const textMain  = 'var(--text-main)';
  const textMuted = 'var(--text-muted)';
  const surface = 'var(--surface)';
  const rowHover = 'rgba(2, 145, 192, 0.04)';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const hasActions = onEdit || onDelete || onView || !!renderActions;

  return (
    <div style={{
      background: card,
      border: `1px solid ${border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(76, 59, 53, 0.03)'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '18px 24px',
        borderBottom: `1px solid ${border}`,
        flexWrap: 'wrap',
        background: '#FFFFFF'
      }}>
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: surface,
          border: `1.5px solid ${border}`,
          borderRadius: '10px',
          padding: '0 14px',
          height: '40px',
          flex: '1 1 200px',
          maxWidth: '320px',
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}
        >
          <Search size={15} color={textMuted} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: textMain,
              fontSize: '13.5px',
              width: '100%',
              fontFamily: 'var(--font-inter)',
              fontWeight: 500
            }}
          />
        </div>

        {filterNode}
        {actionNode && <div style={{ marginLeft: 'auto' }}>{actionNode}</div>}

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: textMuted, fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'entry found' : 'entries found'}
        </div>
      </div>

      {/* Table grid */}
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: `1.5px solid ${border}` }}>
              {columns.map((col) => (
                <th key={col.key} style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: textMuted,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  width: col.width
                }}>
                  {col.label}
                </th>
              ))}
              {hasActions && <th style={{
                padding: '14px 24px',
                textAlign: 'right',
                fontSize: '11px',
                fontWeight: 800,
                color: textMuted,
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                  color: textMuted,
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  No records matching search query.
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr key={i} style={{
                borderBottom: `1px solid ${border}`,
                transition: 'all 0.15s ease'
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = rowHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    color: textMain,
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : col.key === 'id'
                        ? formatInternalId(row[col.key])
                        : String(row[col.key] ?? '-')}
                  </td>
                ))}
                {(hasActions || renderActions) && (
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {renderActions && renderActions(row)}
                      {onView && <ActionBtn icon={Eye} color="var(--brand-blue-bright)" onClick={() => onView(row)} />}
                      {onEdit && <ActionBtn icon={Edit} color="var(--brand-gold-bright)" onClick={() => onEdit(row)} />}
                      {onDelete && <ActionBtn icon={Trash2} color="var(--brand-gold-dark)" onClick={() => onDelete(row)} />}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: `1px solid ${border}`,
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FFFFFF'
        }}>
          <span style={{ fontSize: '13px', color: textMuted, fontWeight: 600 }}>
            Showing page <strong style={{ color: textMain }}>{page}</strong> of <strong style={{ color: textMain }}>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <PagBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)} label="Previous" icon={ChevronLeft} surface={surface} border={border} textMain={textMain} textMuted={textMuted} />
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: p === page ? 'linear-gradient(135deg, var(--brand-blue-medium) 0%, var(--brand-blue-dark) 100%)' : surface,
                    border: `1px solid ${p === page ? 'transparent' : border}`,
                    color: p === page ? '#FFFFFF' : textMain,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter)',
                    transition: 'all 0.15s',
                    boxShadow: p === page ? '0 4px 10px rgba(2, 145, 192, 0.25)' : 'none'
                  }}
                >{p}</button>
              );
            })}
            <PagBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} label="Next" icon={ChevronRight} surface={surface} border={border} textMain={textMain} textMuted={textMuted} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ActionBtn({ icon: Icon, color, onClick }: { icon: React.ComponentType<{size?: number; color?: string}>, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: `${color}10`,
      border: `1.5px solid ${color}25`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `${color}20`;
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `${color}10`;
      e.currentTarget.style.transform = 'none';
    }}>
      <Icon size={14} color={color} />
    </button>
  );
}

function PagBtn({ disabled, onClick, label, icon: Icon, surface, border, textMain, textMuted }: {
  disabled: boolean; onClick: () => void; label: string;
  icon: React.ComponentType<{size?: number; color?: string}>;
  surface: string; border: string; textMain: string; textMuted: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '0 12px',
      height: '34px',
      borderRadius: '8px',
      background: surface,
      border: `1px solid ${border}`,
      color: disabled ? textMuted : textMain,
      fontSize: '13px',
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-inter)',
      transition: 'all 0.15s'
    }}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.background = '#FFFFFF';
      }
    }}
    onMouseLeave={e => {
      if (!disabled) {
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.background = surface;
      }
    }}
    >
      <Icon size={14} />{label}
    </button>
  );
}
