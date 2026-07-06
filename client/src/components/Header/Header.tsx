import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { UserActions } from './UserActions';
import { SearchModal } from './SearchModal';

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Smooth scroll animations
  const headerPadding = useTransform(scrollY, [0, 50], ['1.5rem', '0.75rem']);
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.8]);
  const borderColor = useTransform(scrollY, [0, 50], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']);
  const shadow = useTransform(scrollY, [0, 50], ['none', '0 10px 30px -10px rgba(0,0,0,0.5)']);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  // Listen for the custom event to open auth modals if dispatched from deeply nested navs
  // (Assuming layout or app handles auth modals, but we need it here if we want to bubble up)
  // Actually Layout handles auth modals, so we just let the event bubble or handle it globally.

  return (
    <>
      <motion.header
        style={{
          paddingTop: headerPadding,
          paddingBottom: headerPadding,
          backgroundColor: useTransform(bgOpacity, v => `rgba(15, 23, 42, ${v})`),
          borderColor: borderColor,
          boxShadow: shadow
        }}
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          
          {/* Left: Logo */}
          <Logo />

          {/* Center: Desktop Mega Menu */}
          <div className="flex-1 flex justify-center">
            <DesktopNav />
          </div>

          {/* Right: Actions & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <UserActions onOpenSearch={() => setIsSearchOpen(true)} />
            <MobileNav onOpenSearch={() => setIsSearchOpen(true)} />
          </div>

        </div>
      </motion.header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
