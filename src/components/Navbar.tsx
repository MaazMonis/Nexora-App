"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import styles from "./Navbar.module.css";
import { useUser } from "@/context/UserContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Luxury Rings", href: "/rings" },
  { name: "Diamond Collections", href: "/diamonds" },
  { name: "Bespoke Collections", href: "/bespoke" },
  { name: "Earrings", href: "/earrings" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide navbar on admin routes
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          Nexora
        </Link>

        {/* Desktop Links */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.active : ""}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth */}
        <div className={styles.authContainer}>
          {!loading && (
            user ? (
              <div className={styles.userMenu}>
                <span className={styles.greeting}>
                  <User size={16} /> {user.username}
                </span>
                <button onClick={logout} className={styles.logoutBtn}>Sign Out</button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className={styles.loginBtn}>
                Sign In
              </button>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.mobileMenu}
            >
              <ul className={styles.mobileLinks}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={pathname === link.href ? styles.active : ""}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                {/* Mobile Auth */}
                <li className={styles.mobileAuthItem}>
                  {!loading && (
                    user ? (
                      <div className={styles.mobileUserMenu}>
                        <span className={styles.greeting}>
                          <User size={16} /> {user.username}
                        </span>
                        <button onClick={logout} className={styles.logoutBtn}>Sign Out</button>
                      </div>
                    ) : (
                      <button onClick={() => { setIsAuthOpen(true); setIsOpen(false); }} className={styles.loginBtn}>
                        Sign In / Register
                      </button>
                    )
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
