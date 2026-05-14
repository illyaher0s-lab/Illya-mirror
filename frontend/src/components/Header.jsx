import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

export default function Header({ breadcrumb }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-kenya-cream border-b border-kenya-line/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / 面包屑 */}
        {breadcrumb ? (
          <Breadcrumb pageName={breadcrumb} />
        ) : (
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-lg font-semibold text-kenya-dark">镜像</div>
          </Link>
        )}

        {/* 主导航 */}
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm text-kenya-dark/60 hover:text-kenya-dark transition-colors duration-[120ms]"
          >
            首页
          </Link>
        </nav>
      </div>
    </header>
  );
}
