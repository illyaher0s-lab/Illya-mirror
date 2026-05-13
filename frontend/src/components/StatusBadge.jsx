export default function StatusBadge({ status }) {
  const statusConfig = {
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: '处理中' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: '已完成' },
    failed: { bg: 'bg-red-100', text: 'text-red-800', label: '失败' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: '待处理' },
    stopped: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '已停止' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
