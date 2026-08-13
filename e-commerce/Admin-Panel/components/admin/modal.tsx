'use client';
import React, { useRef, useEffect, useState } from 'react';
import { X, AlertTriangle, ChevronDown, Check } from 'lucide-react';

// ── Custom Select (no native browser picker) ───────────────
interface CustomSelectProps {
  value: string;
  onChange?: (v: string) => void;
  options: string[];
  disabled?: boolean;
  border: string;
  textMain: string;
  textMuted: string;
}

function CustomSelect({ value, onChange, options, disabled = false, border, textMain, textMuted }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', padding: '12px 38px 12px 16px', borderRadius: '10px',
          background: disabled ? 'var(--surface)' : '#FFFFFF',
          border: `1.5px solid ${open ? 'var(--primary)' : border}`,
          color: disabled ? textMuted : textMain,
          fontSize: '13.5px', cursor: disabled ? 'default' : 'pointer',
          fontFamily: 'var(--font-inter)',
          userSelect: 'none',
          position: 'relative',
          display: 'flex', alignItems: 'center',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          boxShadow: open ? '0 0 0 4px rgba(2, 145, 192, 0.12)' : 'none'
        }}
        onMouseEnter={e => { if (!disabled && !open) e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onMouseLeave={e => { if (!disabled && !open) e.currentTarget.style.borderColor = border; }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{value}</span>
        <ChevronDown
          size={16}
          color={textMuted}
          style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`,
            transition: 'transform 0.2s', flexShrink: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 99999,
          background: '#FFFFFF',
          border: `1.5px solid ${border}`,
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(76, 59, 53, 0.12)',
          overflow: 'hidden',
          maxHeight: '220px',
          overflowY: 'auto',
          animation: 'fadeInUp 0.15s ease'
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange?.(opt); setOpen(false); }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '13.5px',
                color: opt === value ? 'var(--primary)' : textMain,
                background: opt === value
                  ? 'rgba(2, 145, 192, 0.08)'
                  : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'var(--font-inter)',
                borderBottom: `1px solid ${border}`,
                transition: 'all 0.15s',
                fontWeight: opt === value ? 600 : 500
              }}
              onMouseEnter={e => {
                if (opt !== value) e.currentTarget.style.background = 'rgba(2, 145, 192, 0.04)';
              }}
              onMouseLeave={e => {
                if (opt !== value) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{opt}</span>
              {opt === value && <Check size={14} color="var(--primary)" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  const bg = '#FFFFFF';
  const border = 'var(--border)';
  const textMain = 'var(--text-main)';
  const textMuted = 'var(--text-muted)';

  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--overlay)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '20px',
        width: '100%',
        maxWidth: `min(${maxWidth}, calc(100vw - 32px))`,
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(76, 59, 53, 0.15)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '18px 20px 16px',
          borderBottom: `1px solid ${border}`, background: 'var(--surface)',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: textMain, margin: 0, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#FFFFFF', border: `1.5px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.25s',
              minWidth: '44px', minHeight: '44px'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}
          >
            <X size={15} color={textMuted} />
          </button>
        </div>
        <div style={{ padding: '20px 20px 24px' }}>{children}</div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .modal-overlay {
            padding: 24px;
          }
          .modal-content > div:first-child {
            padding: 22px 28px 18px;
          }
          .modal-content > div:last-child {
            padding: 24px 28px 28px;
          }
        }
      `}</style>
    </div>
  );
}

// ── ConfirmDialog ──────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm Action', loading = false }: ConfirmDialogProps) {
  const bg = '#FFFFFF';
  const border = 'var(--border)';
  const textMain = 'var(--text-main)';
  const textMuted = 'var(--text-muted)';

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--overlay)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        boxShadow: '0 25px 50px rgba(76, 59, 53, 0.15)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Warning Badge / Icon */}
        <div style={{
          width: '54px', height: '54px', borderRadius: '14px',
          background: 'rgba(147, 95, 4, 0.08)',
          border: '1.5px solid rgba(147, 95, 4, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px', boxShadow: '0 4px 12px rgba(147, 95, 4, 0.05)'
        }}>
          <AlertTriangle size={24} color="var(--brand-gold-dark)" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: textMain, margin: '0 0 10px', letterSpacing: '-0.3px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: textMuted, margin: '0 0 28px', lineHeight: 1.6, fontWeight: 500 }}>{message}</p>

        {/* Action triggers */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '11px 20px', borderRadius: '10px',
              background: 'var(--surface)', border: `1.5px solid ${border}`,
              color: textMain, fontSize: '13.5px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '11px 20px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--brand-gold-bright) 0%, var(--brand-gold-dark) 100%)',
              border: 'none', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'var(--font-inter)', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(147, 95, 4, 0.2)'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(147, 95, 4, 0.35)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 95, 4, 0.2)';
            }}
          >
            {loading ? 'Processing Operation...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FormField ──────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  options?: string[];
  readOnly?: boolean;
  border: string;
  textMain: string;
  textMuted: string;
  surface: string;
  placeholder?: string;
}

export function FormField({ label, value, onChange, type = 'text', options, readOnly = false, border, textMain, textMuted, placeholder }: FormFieldProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    background: readOnly ? 'var(--surface)' : '#FFFFFF',
    border: `1.5px solid ${border}`,
    color: readOnly ? textMuted : textMain,
    fontSize: '13.5px', outline: 'none',
    fontFamily: 'var(--font-inter)',
    boxSizing: 'border-box',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  };
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 800,
        color: textMuted, marginBottom: '6px', textTransform: 'uppercase',
        letterSpacing: '0.6px'
      }}>{label}</label>

      {options ? (
        readOnly ? (
          <div style={{ ...inputStyle, cursor: 'default', display: 'flex', alignItems: 'center', background: 'var(--surface)' }}>{value}</div>
        ) : (
          <CustomSelect
            value={value}
            onChange={onChange}
            options={options}
            disabled={readOnly}
            border={border}
            textMain={textMain}
            textMuted={textMuted}
          />
        )
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          rows={3}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 4px rgba(2, 145, 192, 0.12)';
          }}
          onBlur={e => {
            e.target.style.borderColor = border;
            e.target.style.boxShadow = 'none';
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => {
            if (!readOnly) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 4px rgba(2, 145, 192, 0.12)';
            }
          }}
          onBlur={e => {
            if (!readOnly) {
              e.target.style.borderColor = border;
              e.target.style.boxShadow = 'none';
            }
          }}
        />
      )}
    </div>
  );
}

// ── ModalFooter ────────────────────────────────────────────
interface ModalFooterProps {
  onClose: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  submitLabel?: string;
  border: string;
  textMain: string;
}

export function ModalFooter({ onClose, onSubmit, loading = false, submitLabel = 'Save changes', border, textMain }: ModalFooterProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '20px', borderTop: `1px solid ${border}` }}>
      <button
        onClick={onClose}
        disabled={loading}
        style={{
          padding: '10px 20px', borderRadius: '10px',
          background: 'var(--surface)', border: `1.5px solid ${border}`,
          color: textMain, fontSize: '13.5px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
      >
        {onSubmit ? 'Cancel' : 'Close'}
      </button>
      {onSubmit && (
        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--brand-blue-medium) 0%, var(--brand-blue-dark) 100%)',
            border: 'none', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            fontFamily: 'var(--font-inter)', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(2, 145, 192, 0.25)'
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 145, 192, 0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 145, 192, 0.25)';
          }}
        >
          {loading ? 'Processing...' : submitLabel}
        </button>
      )}
    </div>
  );
}
