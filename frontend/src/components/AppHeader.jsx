import { Link } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

export default function AppHeader({ breadcrumb }) {
  return (
    <header className="h-16 bg-kenya-cream border-b border-kenya-line">
      <div className="max-w-[1120px] mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo / 面包屑 */}
        {breadcrumb ? (
          <Breadcrumb pageName={breadcrumb} />
        ) : (
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div className="text-lg font-semibold text-kenya-dark">镜像</div>
          </Link>
        )}
        
        {/* 主导航 */}
        <Link 
          to="/" 
          className="text-sm text-kenya-dark/60 hover:text-kenya-dark transition-colors duration-[120ms]"
        >
          首页
        </Link>
      </div>
    </header>
  );
}
