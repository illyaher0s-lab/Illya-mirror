import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-[80px] leading-tight mb-4">
            镜像
          </h1>
          <p className="text-lg text-kenya-dark/70">
            知识蒸馏工具 — 将长文本压缩为认知友好的结构化内容
          </p>
        </div>
      </div>

      {/* 任务列表区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">任务列表</h2>
          <Link to="/upload">
            <button className="kenya-button">
              创建新任务
            </button>
          </Link>
        </div>

        {/* 空状态 */}
        <div className="kenya-card text-center py-20">
          <div className="text-6xl mb-4 opacity-20">📝</div>
          <p className="text-kenya-dark/60 mb-6">
            还没有任务，开始创建第一个蒸馏任务吧
          </p>
          <Link to="/upload">
            <button className="kenya-button">
              创建任务
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
