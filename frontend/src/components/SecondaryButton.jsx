export default function SecondaryButton({ 
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
      className={`bg-white text-kenya-dark border border-kenya-line rounded-lg font-medium
                 hover:bg-kenya-dark/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 ${sizeClass} ${className}`}
    >
      {loading ? '处理中...' : children}
    </button>
  );
}
