export default function LoadingState({ message = '加载中...' }) {
  return (
    <div className="text-center py-20">
      <div className="animate-pulse text-4xl mb-4">⏳</div>
      <p className="text-kenya-dark/60 text-base">{message}</p>
    </div>
  );
}
