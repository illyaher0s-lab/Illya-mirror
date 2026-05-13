import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import SecondaryButton from './SecondaryButton';
import DangerButton from './DangerButton';

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
    <div className="bg-white border border-kenya-line rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-kenya-dark mb-2">{task.name}</h3>
          <StatusBadge status={task.status} />
        </div>
        <div className="flex gap-2">
          {(task.status === 'completed' || task.status === 'processing' || task.status === 'pending') && (
            <SecondaryButton size="sm" onClick={handleViewResult}>
              {task.status === 'completed' ? '查看结果' : '查看进度'}
            </SecondaryButton>
          )}
          <DangerButton size="sm" onClick={() => onDelete(task.id)}>
            删除
          </DangerButton>
        </div>
      </div>

      <div className="text-sm text-kenya-dark/60 mb-3">
        最后更新：{formatDate(task.updated_at)}
      </div>

      {task.status === 'processing' && task.current_layer && (
        <div className="mt-4">
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
