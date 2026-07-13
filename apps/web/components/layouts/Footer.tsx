import Link from 'next/link';

import Container from '../common/Container';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
      <Container className="py-20">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />

            <p className="mt-5 max-w-sm text-slate-500">
              LinkFlow is a modern URL shortening platform built for businesses and creators.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Product</h3>

            <ul className="space-y-3 text-slate-500">
              <li>
                <Link href="#features">Features</Link>
              </li>

              <li>
                <Link href="#pricing">Pricing</Link>
              </li>

              <li>
                <Link href="#">Analytics</Link>
              </li>

              <li>
                <Link href="#">API</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Company</h3>

            <ul className="space-y-3 text-slate-500">
              <li>
                <Link href="#">About</Link>
              </li>

              <li>
                <Link href="#">Blog</Link>
              </li>

              <li>
                <Link href="#">Contact</Link>
              </li>

              <li>
                <Link href="#">Careers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>

            <ul className="space-y-3 text-slate-500">
              <li>
                <Link href="#">Documentation</Link>
              </li>

              <li>
                <Link href="#">Support</Link>
              </li>

              <li>
                <Link href="#">Privacy</Link>
              </li>

              <li>
                <Link href="#">Terms</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} LinkFlow. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
