import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ variant = 'default' }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('global-theme') || 'dark';
    setIsDark(savedTheme === 'dark');
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('global-theme', newTheme);
    document.body.className = newTheme;
  };

  const baseStyles = {
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const variants = {
    default: {
      ...baseStyles,
      padding: '10px',
      borderRadius: '12px',
      width: '42px',
      height: '42px',
    },
    pill: {
      ...baseStyles,
      padding: '6px',
      borderRadius: '50px',
      width: '72px',
      height: '36px',
      justifyContent: isDark ? 'flex-start' : 'flex-end',
    },
    minimal: {
      ...baseStyles,
      padding: '8px',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      background: 'transparent',
      border: 'none',
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={variants[variant]}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.background = 'var(--accent-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = variant === 'minimal' ? 'transparent' : 'var(--border-subtle)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = variant === 'minimal' ? 'transparent' : 'var(--bg-glass)';
      }}
    >
      {variant === 'pill' ? (
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 2px 8px var(--accent-glow)',
        }}>
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </div>
      ) : (
        isDark ? <Sun size={18} /> : <Moon size={18} />
      )}
    </button>
  );
}
