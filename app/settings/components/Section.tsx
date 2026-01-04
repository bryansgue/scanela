export default function Section({ title, children }: any) {
  return (
    <section className="bg-white rounded-xl shadow-sm border p-6 mb-10">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </section>
  );
}
