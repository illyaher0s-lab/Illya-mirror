export default function SegmentedControl({ options, active, onChange }) {
  return (
    <div className="inline-flex gap-0.5 bg-kenya-cream rounded-lg p-0.5">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm rounded-md transition-all duration-150 ${
            active === option.value
              ? 'bg-white border-[0.5px] border-kenya-line/50 font-medium text-kenya-dark shadow-sm'
              : 'text-kenya-dark/60 hover:text-kenya-dark'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
