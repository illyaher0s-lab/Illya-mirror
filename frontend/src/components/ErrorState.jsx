export default function ErrorState({ title = '错误', message, actions = [] }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="text-2xl">❌</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-2 text-base">{title}</h3>
          <p className="text-red-700 text-sm">{message}</p>
          {actions.length > 0 && (
            <div className="flex gap-3 mt-4">
              {actions.map((action, idx) => (
                <div key={idx}>{action}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
