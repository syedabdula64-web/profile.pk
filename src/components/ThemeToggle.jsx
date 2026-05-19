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
    background: 'var(--bg-card-solid)',
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
      padding: '12px',
      borderRadius: '14px',
      width: '46px',
      height: '46px',
    },
    pill: {
      ...baseStyles,
      padding: '6px',
      borderRadius: '50px',
      width: '76px',
      height: '40px',
      justifyContent: isDark ? 'flex-start' : 'flex-end',
    },
    minimal: {
      ...baseStyles,
      padding: '10px',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
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
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 15px var(--accent-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = variant === 'minimal' ? 'transparent' : 'var(--border-subtle)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = variant === 'minimal' ? 'transparent' : 'var(--bg-card-solid)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {variant === 'pill' ? (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px var(--accent-glow)',
        }}>
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </div>
      ) : (
        isDark ? <Sun size={20} /> : <Moon size={20} />
      )}
    </button>
  );
}
