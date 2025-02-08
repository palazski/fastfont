import { Terminal, Github, Globe } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header>
      <div className="p-4 sm:px-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <a 
            href="https://www.npmjs.com/package/fastfont"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 px-4 py-2 rounded-lg bg-gradient-to-br from-orange-700/80 to-red-700/80 group relative w-full sm:w-auto"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 opacity-20 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all ease-in-out duration-300"></div>
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-orange-500/70 group-hover:text-orange-400 transition-all ease-in-out duration-300" />
              <span className="flex flex-wrap items-center gap-2 text-sm text-orange-100/90">
                Prefer the command line? Try <code className="px-2 py-1 bg-black/50 rounded font-mono text-orange-400">npx fastfont</code>
              </span>
            </div>
          </a>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/palazski"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Github size={20} />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://palazski.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Globe size={20} />
              <span>palazski.com</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
