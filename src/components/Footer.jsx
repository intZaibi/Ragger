import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 text-center">
          <p className="text-sm">© 2025 Ragger. All rights reserved. | Developed by {" "} 
            <Link target="_blank" href="https://shahzaib-ali-portfolio.netlify.app" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Shahzaib Ali
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
