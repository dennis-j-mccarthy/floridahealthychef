export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // .admin-area scopes admin-only typography (see globals.css)
  return <div className="admin-area">{children}</div>;
}
