export default function PageContainer({ children }) {
  return (
    <div className="max-w-[1120px] mx-auto px-8 pt-12">
      {children}
    </div>
  );
}
