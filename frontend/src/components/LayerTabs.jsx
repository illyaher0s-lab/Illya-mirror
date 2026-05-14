export default function LayerTabs({ layers, active, onChange }) {
  return (
    <div className="flex gap-2">
      {layers.map(layer => (
        <button
          key={layer}
          onClick={() => onChange(layer)}
          className={`px-6 py-3 rounded-lg text-sm transition-all duration-200 border-2 ${
            active === layer
              ? 'bg-kenya-dark text-kenya-cream border-kenya-dark font-bold shadow-md'
              : 'bg-transparent text-kenya-dark/60 border-kenya-line hover:text-kenya-dark hover:border-kenya-dark font-medium'
          }`}
        >
          第{layer}层
        </button>
      ))}
    </div>
  );
}
