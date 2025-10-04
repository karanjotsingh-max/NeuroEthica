import Link from "next/link"
import Image from "next/image"

export function TopNav() {
  return (
    <div className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-end px-6 py-3">
        <Link href="/donate" className="transition-transform hover:scale-105">
          <Image src="/donate-button.png" alt="Donate" width={140} height={48} className="h-12 w-auto" />
        </Link>
      </div>
    </div>
  )
}
