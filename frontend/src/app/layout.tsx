// OWNER: FE-1
// Root layout: global CSS, AuthProvider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
