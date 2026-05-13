export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 border-b border-kenya-line">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.value
              ? 'border-b-2 border-kenya-dark text-kenya-dark -mb-[1px]'
              : 'text-kenya-dark/60 hover:text-kenya-dark'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
