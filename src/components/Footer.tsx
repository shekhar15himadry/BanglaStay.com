import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from '@/lib/router';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-white">
                Bangla<span className="text-emerald-400">Stay</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted partner for booking hotels across Bangladesh. From the beaches of Cox's Bazar to the tea gardens of Sylhet.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#"><Facebook className="w-4 h-4" /></SocialIcon>
              <SocialIcon href="#"><Twitter className="w-4 h-4" /></SocialIcon>
              <SocialIcon href="#"><Instagram className="w-4 h-4" /></SocialIcon>
              <SocialIcon href="#"><Youtube className="w-4 h-4" /></SocialIcon>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <FooterLink onClick={() => navigate('/')}>Home</FooterLink>
              <FooterLink onClick={() => navigate('/search')}>All Hotels</FooterLink>
              <FooterLink onClick={() => navigate('/search?destination=coxs-bazar')}>Cox's Bazar Hotels</FooterLink>
              <FooterLink onClick={() => navigate('/search?destination=sylhet')}>Sylhet Hotels</FooterLink>
              <FooterLink onClick={() => navigate('/search?destination=sajek-valley')}>Sajek Valley</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <FooterLink onClick={() => navigate('/about')}>About Us</FooterLink>
              <FooterLink onClick={() => navigate('/about')}>Contact Us</FooterLink>
              <FooterLink onClick={() => navigate('/about')}>Privacy Policy</FooterLink>
              <FooterLink onClick={() => navigate('/about')}>Terms of Service</FooterLink>
              <FooterLink onClick={() => navigate('/about')}>Cancellation Policy</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>Gulshan 2, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+880 1700 000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>support@banglastay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 BanglaStay. All rights reserved.</p>
          <p className="text-sm text-gray-500">Made with love in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
      {children}
    </a>
  );
}

function FooterLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button onClick={onClick} className="text-gray-400 hover:text-emerald-400 transition-colors text-left">
        {children}
      </button>
    </li>
  );
}
