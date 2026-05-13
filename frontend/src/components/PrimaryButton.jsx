export default function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-kenya-dark text-white h-11 rounded-lg px-5 font-medium text-sm
                 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 ${className}`}
    >
      {loading ? '处理中...' : children}
    </button>
  );
}
