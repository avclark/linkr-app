// app/layout.tsx
import './globals.css'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Linkr',
  description: 'Smart linking app for devs',
}

const navItems = [
  { name: 'Links', href: '/links' },
  { name: 'Settings', href: '/settings' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 h-full">
        <div className="min-h-full">
          <nav className="bg-indigo-600">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-8 text-white">
                  <Link href="/" className="text-lg font-bold hover:underline">
                    Linkr
                  </Link>
                  {navItems.map((item) => (
                    <Link key={item.name} href={item.href} className="hover:underline">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <main className="mx-auto max-w-7xl p-6">{children}</main>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  )
}