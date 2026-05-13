export default function DangerButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button',
  size = 'default',
  className = ''
}) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`text-red-600 hover:text-red-700 active:scale-95 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 font-medium ${sizeClass} ${className}`}
    >
      {loading ? '删除中...' : children}
    </button>
  );
}
