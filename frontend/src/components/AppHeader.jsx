import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="h-16 bg-kenya-cream border-b border-kenya-line">
      <div className="max-w-[1120px] mx-auto px-8 h-full flex items-center justify-between">
        <div className="font-serif text-2xl text-kenya-dark">镜像</div>
        <Link 
          to="/" 
          className="text-sm text-kenya-dark hover:text-kenya-dark/70 transition-colors"
        >
          首页
        </Link>
      </div>
    </header>
  );
}
