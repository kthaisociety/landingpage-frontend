// The one place any admin page's title is rendered — panels never carry
// their own duplicate title, each page just supplies the text.
export function AdminSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-base text-muted-foreground">{description}</p>
    </div>
  );
}
