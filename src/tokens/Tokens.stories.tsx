import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const brandColors = [
  { name: '--juice-color-brand', label: 'Brand Primary', value: 'hsl(230 85% 60%)' },
  { name: '--juice-color-brand-hover', label: 'Brand Hover', value: 'hsl(230 85% 52%)' },
  { name: '--juice-color-brand-active', label: 'Brand Active', value: 'hsl(230 85% 44%)' },
  {
    name: '--juice-color-brand-subtle',
    label: 'Brand Subtle Tint',
    value: 'hsl(230 85% 60% / 0.12)',
  },
];

const semanticColors = [
  { name: '--juice-color-success', label: 'Success', value: 'hsl(142 71% 40%)' },
  { name: '--juice-color-warning', label: 'Warning', value: 'hsl(38 92% 46%)' },
  { name: '--juice-color-danger', label: 'Danger', value: 'hsl(0 72% 51%)' },
  { name: '--juice-color-info', label: 'Info', value: 'hsl(200 88% 44%)' },
];

const neutralColors = [
  { name: '--juice-color-bg', label: 'Background', value: 'hsl(0 0% 100%)' },
  { name: '--juice-color-bg-subtle', label: 'Background Subtle', value: 'hsl(220 14% 96%)' },
  { name: '--juice-color-bg-muted', label: 'Background Muted', value: 'hsl(220 14% 91%)' },
  { name: '--juice-color-border', label: 'Border', value: 'hsl(220 13% 86%)' },
  { name: '--juice-color-text', label: 'Text', value: 'hsl(222 47% 11%)' },
  { name: '--juice-color-text-subtle', label: 'Text Subtle', value: 'hsl(220 9% 46%)' },
];

const spacingScale = [
  { name: '--juice-space-1', value: '0.25rem (4px)' },
  { name: '--juice-space-2', value: '0.5rem (8px)' },
  { name: '--juice-space-3', value: '0.75rem (12px)' },
  { name: '--juice-space-4', value: '1rem (16px)' },
  { name: '--juice-space-6', value: '1.5rem (24px)' },
  { name: '--juice-space-8', value: '2rem (32px)' },
  { name: '--juice-space-12', value: '3rem (48px)' },
];

const radiusScale = [
  { name: '--juice-radius-sm', value: '0.25rem (4px)' },
  { name: '--juice-radius-md', value: '0.5rem (8px)' },
  { name: '--juice-radius-lg', value: '0.75rem (12px)' },
  { name: '--juice-radius-xl', value: '1rem (16px)' },
  { name: '--juice-radius-full', value: '9999px (Pill)' },
];

export const Palette: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        maxWidth: 800,
        fontFamily: 'var(--juice-font-sans)',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Juice Design Tokens
        </h2>
        <p style={{ color: 'var(--juice-color-text-subtle)', fontSize: '0.95rem' }}>
          All components reference these CSS custom properties. Consuming applications override them
          at <code>:root</code> to theme the entire library.
        </p>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Brand Palette
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {brandColors.map((c) => (
            <div
              key={c.name}
              style={{
                border: '1px solid var(--juice-color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 64, backgroundColor: `var(${c.name})` }} />
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.label}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--juice-font-mono)',
                    color: 'var(--juice-color-text-subtle)',
                    marginTop: 2,
                  }}
                >
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Semantic Palette
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {semanticColors.map((c) => (
            <div
              key={c.name}
              style={{
                border: '1px solid var(--juice-color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 64, backgroundColor: `var(${c.name})` }} />
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.label}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--juice-font-mono)',
                    color: 'var(--juice-color-text-subtle)',
                    marginTop: 2,
                  }}
                >
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neutrals */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Neutrals (Light Mode)
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {neutralColors.map((c) => (
            <div
              key={c.name}
              style={{
                border: '1px solid var(--juice-color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 64, backgroundColor: `var(${c.name})` }} />
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.label}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--juice-font-mono)',
                    color: 'var(--juice-color-text-subtle)',
                    marginTop: 2,
                  }}
                >
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Spacing Scale
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {spacingScale.map((s) => (
            <div
              key={s.name}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}
            >
              <div style={{ width: 140, fontFamily: 'var(--juice-font-mono)' }}>{s.name}</div>
              <div style={{ width: 120, color: 'var(--juice-color-text-subtle)' }}>{s.value}</div>
              <div
                style={{
                  height: 16,
                  width: `var(${s.name})`,
                  backgroundColor: 'var(--juice-color-brand)',
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Border Radius
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {radiusScale.map((r) => (
            <div
              key={r.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  border: '2px solid var(--juice-color-brand)',
                  borderRadius: `var(${r.name})`,
                  backgroundColor: 'var(--juice-color-brand-subtle)',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--juice-font-mono)' }}>
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
