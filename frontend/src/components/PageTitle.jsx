export default function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl leading-[44px] font-semibold text-kenya-dark mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-kenya-dark/60 leading-5">{subtitle}</p>
      )}
    </div>
  );
}
