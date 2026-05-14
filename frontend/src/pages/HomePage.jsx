import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FilterTabs from '../components/FilterTabs';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function HomePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data.items || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个任务吗？')) return;

    try {
      await api.deleteTask(id);
      toast.success('任务已删除');
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filterTabs = [
    { value: 'all', label: '全部' },
    { value: 'processing', label: '处理中' },
    { value: 'completed', label: '已完成' },
    { value: 'failed', label: '失败' }
  ];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'processing') return task.status === 'processing' || task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'failed') return task.status === 'failed' || task.status === 'stopped';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-kenya-brown">
        <AppHeader />
        <PageContainer>
          <LoadingState message="加载任务列表..." />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-brown">
      <AppHeader />

      {/* Hero 区 */}
      <div className="bg-kenya-cream pb-12">
        <PageContainer>
          <PageTitle
            title="镜像"
            subtitle="将你的思考方式蒸馏成可复用的认知操作系统"
          />
          <PrimaryButton onClick={() => navigate('/upload')}>
            开始使用
          </PrimaryButton>
        </PageContainer>
      </div>

      {/* 任务列表区 */}
      <PageContainer>
        <div className="bg-white border border-kenya-line rounded-lg p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl leading-8 font-semibold text-kenya-dark">任务列表</h2>
            <SecondaryButton onClick={() => navigate('/upload')}>
              创建新任务
            </SecondaryButton>
          </div>

        <FilterTabs
          tabs={filterTabs}
          active={filter}
          onChange={setFilter}
        />

        <div className="space-y-3 mt-6">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
            />
          ))}
        </div>

          {filteredTasks.length === 0 && (
            <EmptyState
              icon="📋"
              message={filter === 'all' ? '暂无任务' : `暂无${filterTabs.find(t => t.value === filter)?.label}任务`}
              actions={[
                <SecondaryButton key="create" onClick={() => navigate('/upload')}>
                  创建新任务
                </SecondaryButton>
              ]}
            />
          )}
        </div>
      </PageContainer>
    </div>
  );
}
