'use client';
import { LucideIcon, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onAdd?: () => void;
  addLabel?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, onAdd, addLabel = 'Add New', extra }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px',
      background: '#FFFFFF',
      padding: '20px 24px',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(76, 59, 53, 0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {Icon && (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(2, 145, 192, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(2, 145, 192, 0.15)',
            boxShadow: '0 2px 8px rgba(2, 145, 192, 0.1)'
          }}>
            <Icon size={22} color="var(--primary)" />
          </div>
        )}
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>{title}</h1>
          {subtitle && (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: '4px 0 0',
              fontWeight: 500
            }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {extra}
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--brand-blue-medium) 0%, var(--brand-blue-dark) 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--text-white)',
              fontSize: '13.5px',
              fontWeight: 700,
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 145, 192, 0.3)',
              fontFamily: 'var(--font-inter)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 145, 192, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 145, 192, 0.3)';
            }}
          >
            <Plus size={16} />{addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
