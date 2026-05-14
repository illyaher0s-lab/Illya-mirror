export default function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button',
  size = 'default',
  className = ''
}) {
  const sizeClass = size === 'sm' ? 'h-9 px-4 text-sm' : 'h-11 px-5 text-sm';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-kenya-dark text-kenya-cream border-none rounded-lg font-medium
                 hover:brightness-88 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-150 ${sizeClass} ${className}`}
      style={{ filter: 'brightness(1)' }}
      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.88)'}
      onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
    >
      {loading ? '处理中...' : children}
    </button>
  );
}
