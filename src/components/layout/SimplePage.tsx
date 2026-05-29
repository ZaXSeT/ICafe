export default function SimplePage({ title }: { title: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-24 pb-16 text-center px-4">
      <div className="max-w-xl">
        <h1 className="text-4xl font-heading font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground">
          This page is currently being updated. Please check back later.
        </p>
      </div>
    </div>
  );
}
