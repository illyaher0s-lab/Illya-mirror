export default function TertiaryButton({ 
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
      className={`bg-transparent text-kenya-dark border border-transparent rounded-lg font-medium
                 hover:border-kenya-line hover:bg-kenya-cream active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-150 ${sizeClass} ${className}`}
    >
      {loading ? '处理中...' : children}
    </button>
  );
}
