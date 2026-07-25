"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { User as UserIcon, LogOut, Menu, X } from "lucide-react";

interface HeaderProps {
  firebaseUser: User | null;
  activePanel: string;
  setActivePanel: (panel: any) => void;
  setShowAuthModal: (show: boolean) => void;
  handleLogout: () => void;
}

export default function Header({
  firebaseUser,
  activePanel,
  setActivePanel,
  setShowAuthModal,
  handleLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["home", "scan", "dashboard", "database"];

  const handleNavigate = (panel: string) => {
    setActivePanel(panel);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 bg-[#0B120C]/90 backdrop-blur-xl border-b border-[#4A7C59]/15 print:hidden">
      <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNavigate("home")}
          className="flex items-center cursor-pointer select-none"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#E8E4D9]">
            AgriGuard<span className="text-[#C9A227]">AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((panel) => (
            <button
              key={panel}
              onClick={() => handleNavigate(panel)}
              className={`relative h-full flex items-center text-sm font-medium transition-all ${activePanel === panel
                ? "text-emerald-400"
                : "text-[#8CA292] hover:text-[#E8E4D9]"
                }`}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}

              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-emerald-400 transition-all duration-300 ${activePanel === panel ? "w-full" : "w-0"
                  }`}
              />
            </button>
          ))}

          {firebaseUser?.email === "admin@system.com" && (
            <button
              onClick={() => handleNavigate("admin")}
              className={`relative h-full flex items-center text-sm font-medium transition-all ${activePanel === "admin"
                ? "text-[#C9A227]"
                : "text-[#C9A227]/70 hover:text-[#C9A227]"
                }`}
            >
              Admin Board

              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#C9A227] transition-all duration-300 ${activePanel === "admin" ? "w-full" : "w-0"
                  }`}
              />
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logged In */}
          {firebaseUser ? (
            <>
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt="avatar"
                  className="w-9 h-9 max-sm:hidden rounded-full border-2 border-[#4A7C59]/30 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1B2B1E] flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-[#E8E4D9]" />
                </div>
              )}

              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-semibold text-[#E8E4D9]">
                  {firebaseUser.displayName?.split(" ")[0] || "User"}
                </span>

                <span className="text-[10px] text-[#8CA292] uppercase tracking-wider">
                  User
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex w-10 h-10 rounded-xl border border-[#4A7C59]/20 bg-[#1B2B1E] hover:bg-rose-500/10 items-center justify-center transition-all text-[#8CA292] hover:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Sign In */}
          {!firebaseUser && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="sm:hidden w-10 h-10 rounded-xl bg-[#1B2B1E] border border-[#4A7C59]/20 flex items-center justify-center text-white"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-xl border border-[#4A7C59]/20 bg-[#1B2B1E] flex items-center justify-center text-[#E8E4D9] transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen
          ? "max-h-[500px] opacity-100"
          : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-[#0B120C]/98 backdrop-blur-xl border-t border-[#4A7C59]/15 border-b border-[#4A7C59]/15 px-4 py-4">
          <div className="flex flex-col gap-2">
            {navItems.map((panel) => (
              <button
                key={panel}
                onClick={() => handleNavigate(panel)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activePanel === panel
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-[#8CA292] hover:bg-[#1B2B1E] hover:text-[#E8E4D9]"
                  }`}
              >
                {panel.charAt(0).toUpperCase() + panel.slice(1)}
              </button>
            ))}

            {firebaseUser?.email === "admin@system.com" && (
              <button
                onClick={() => handleNavigate("admin")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activePanel === "admin"
                  ? "bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20"
                  : "text-[#C9A227]/80 hover:bg-[#1B2B1E] hover:text-[#C9A227]"
                  }`}
              >
                Admin Board
              </button>
            )}

            {firebaseUser && (
              <>
                <div className="border-t border-[#4A7C59]/15 my-2" />

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}