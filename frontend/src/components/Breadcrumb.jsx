import { Link } from 'react-router-dom';

export default function Breadcrumb({ pageName }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 text-kenya-dark font-semibold hover:opacity-70 transition-opacity"
      >
        <span>←</span>
        <span>镜像</span>
      </Link>
      <span className="text-kenya-line mx-1.5">/</span>
      <span className="text-kenya-dark/40">{pageName}</span>
    </div>
  );
}
