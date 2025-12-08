import Link from "next/link"
import { Zap, Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  const footerLinks = {
    product: [
      { name: "เครื่องมือทั้งหมด", href: "/tools" },
      { name: "ราคา", href: "/pricing" },
      { name: "API", href: "/api-docs" },
      { name: "Changelog", href: "/changelog" },
    ],
    company: [
      { name: "เกี่ยวกับเรา", href: "/about" },
      { name: "บล็อก", href: "/blog" },
      { name: "ติดต่อเรา", href: "/contact" },
      { name: "Careers", href: "/careers" },
    ],
    legal: [
      { name: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
      { name: "เงื่อนไขการใช้งาน", href: "/terms" },
      { name: "PDPA", href: "/pdpa" },
      { name: "คุกกี้", href: "/cookies" },
    ],
  }

  return (
    <footer className="border-t border-[var(--border-default)] py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg gradient-text">Anajak Tools</div>
                <div className="text-xs text-[var(--text-muted)]">อนาจักร ทูลส์</div>
              </div>
            </div>
            <p className="caption mb-4">
              เครื่องมือครบ จบในที่เดียว<br />
              พร้อม AI ช่วยเหลือ
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg glass border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--primary-500)] transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--primary-500)] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--primary-500)] transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">ผลิตภัณฑ์</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="caption hover:text-[var(--primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">บริษัท</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="caption hover:text-[var(--primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">กฎหมาย</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="caption hover:text-[var(--primary-500)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[var(--border-default)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="caption">
            © {new Date().getFullYear()} Anajak Tools. All rights reserved.
          </p>
          <p className="caption">
            Made with ❤️ in Thailand
          </p>
        </div>
      </div>
    </footer>
  )
}



