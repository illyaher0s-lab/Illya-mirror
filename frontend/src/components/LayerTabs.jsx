export default function LayerTabs({ layers, active, onChange }) {
  return (
    <div className="flex gap-2">
      {layers.map(layer => (
        <button
          key={layer}
          onClick={() => onChange(layer)}
          className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            active === layer
              ? 'bg-kenya-dark text-white'
              : 'bg-white/50 hover:bg-white/70 text-kenya-dark'
          }`}
        >
          第{layer}层
        </button>
      ))}
    </div>
  );
}
