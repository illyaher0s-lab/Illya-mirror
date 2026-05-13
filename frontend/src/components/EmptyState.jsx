import SecondaryButton from './SecondaryButton';

export default function EmptyState({ icon = '📄', message = '暂无数据', actions = [] }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4 opacity-20">{icon}</div>
      <p className="text-kenya-dark/60 text-base mb-6">{message}</p>
      {actions.length > 0 && (
        <div className="flex gap-4 justify-center">
          {actions.map((action, idx) => (
            <div key={idx}>{action}</div>
          ))}
        </div>
      )}
    </div>
  );
}
