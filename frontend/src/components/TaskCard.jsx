import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import SecondaryButton from './SecondaryButton';
import TertiaryButton from './TertiaryButton';

export default function TaskCard({ task, onDelete }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const handleViewResult = () => {
    if (task.status === 'completed') {
      navigate(`/result/${task.id}`);
    } else if (task.status === 'processing' || task.status === 'pending') {
      navigate(`/progress/${task.id}`);
    }
  };

  return (
    <div className="bg-white border border-kenya-line rounded-lg py-4 px-5 hover:bg-kenya-cream transition-all duration-100 group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-kenya-dark mb-2">{task.name}</h3>
          <div className="flex items-center gap-3">
            <StatusBadge status={task.status} />
            <span className="text-sm text-kenya-dark/60">
              {formatDate(task.updated_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {task.status === 'completed' && (
            <SecondaryButton size="sm" onClick={handleViewResult}>
              查看结果
            </SecondaryButton>
          )}
          {(task.status === 'processing' || task.status === 'pending') && (
            <button 
              onClick={handleViewResult}
              className="flex items-center gap-1 text-sm text-kenya-dark/60 hover:text-kenya-dark transition-colors"
            >
              <span>查看进度</span>
              <span>→</span>
            </button>
          )}
          <TertiaryButton size="sm" onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100">
            删除
          </TertiaryButton>
        </div>
      </div>

      {task.status === 'processing' && task.current_layer && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-kenya-dark/60 mb-2">
            <span>正在处理第 {task.current_layer} 层</span>
            <span>{Math.round((task.current_layer / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-kenya-line/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-kenya-dark transition-all duration-300"
              style={{ width: `${(task.current_layer / 4) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
