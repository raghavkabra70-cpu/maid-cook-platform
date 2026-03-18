"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── CONFIG ───
const CUISINES = ["Indian", "Chinese", "Italian", "Mexican", "Thai", "Japanese", "Mediterranean", "Continental", "Korean", "Vietnamese", "American", "French", "Middle Eastern", "Ethiopian", "Caribbean"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["Breakfast (6-10 AM)", "Lunch (11 AM-2 PM)", "Dinner (6-10 PM)", "Full Day"];
const PRICE_RANGES = ["₹200-500/meal", "₹500-1000/meal", "₹1000-2000/meal", "₹2000+/meal"];

// ─── MOCK DATA ───
const MOCK_COOKS = [
  { id: "1", full_name: "Priya Sharma", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", role: "cook", cuisines: ["Indian", "Chinese", "Thai"], availability: { Mon: ["Lunch (11 AM-2 PM)", "Dinner (6-10 PM)"], Tue: ["Breakfast (6-10 AM)", "Lunch (11 AM-2 PM)"], Wed: ["Full Day"], Thu: ["Dinner (6-10 PM)"], Fri: ["Lunch (11 AM-2 PM)"], Sat: ["Full Day"], Sun: [] }, service_radius_km: 10, price_range: "₹500-1000/meal", latitude: 28.6139, longitude: 77.2090, bio: "Professional home cook with 8 years of experience. Specializing in authentic North Indian and Indo-Chinese cuisine.", rating: 4.8, reviews_count: 124, verified: true, city: "New Delhi" },
  { id: "2", full_name: "Maria Gonzalez", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", role: "cook", cuisines: ["Mexican", "Mediterranean", "Italian"], availability: { Mon: ["Full Day"], Tue: ["Full Day"], Wed: ["Lunch (11 AM-2 PM)"], Thu: ["Full Day"], Fri: ["Dinner (6-10 PM)"], Sat: [], Sun: [] }, service_radius_km: 15, price_range: "₹1000-2000/meal", latitude: 28.6329, longitude: 77.2195, bio: "Trained at Le Cordon Bleu. I bring restaurant quality to your dining table with fresh, seasonal ingredients.", rating: 4.9, reviews_count: 87, verified: true, city: "New Delhi" },
  { id: "3", full_name: "Kenji Tanaka", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji", role: "cook", cuisines: ["Japanese", "Korean", "Thai"], availability: { Mon: ["Dinner (6-10 PM)"], Tue: [], Wed: ["Dinner (6-10 PM)"], Thu: ["Dinner (6-10 PM)"], Fri: ["Full Day"], Sat: ["Full Day"], Sun: ["Lunch (11 AM-2 PM)"] }, service_radius_km: 8, price_range: "₹1000-2000/meal", latitude: 28.5900, longitude: 77.2200, bio: "Sushi master and ramen enthusiast. Bringing authentic Japanese home cooking and Korean BBQ to your kitchen.", rating: 4.7, reviews_count: 65, verified: true, city: "New Delhi" },
  { id: "4", full_name: "Fatima Al-Hassan", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima", role: "cook", cuisines: ["Middle Eastern", "Mediterranean", "Indian"], availability: { Mon: ["Breakfast (6-10 AM)", "Lunch (11 AM-2 PM)"], Tue: ["Breakfast (6-10 AM)", "Lunch (11 AM-2 PM)"], Wed: ["Breakfast (6-10 AM)", "Lunch (11 AM-2 PM)"], Thu: [], Fri: [], Sat: ["Full Day"], Sun: ["Full Day"] }, service_radius_km: 12, price_range: "₹500-1000/meal", latitude: 28.6500, longitude: 77.1800, bio: "Grandmother's recipes from Lebanon and Egypt. Wholesome, nutritious meals made with love and traditional spices.", rating: 4.6, reviews_count: 43, verified: false, city: "New Delhi" },
  { id: "5", full_name: "Sophie Laurent", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie", role: "cook", cuisines: ["French", "Italian", "Continental"], availability: { Mon: ["Dinner (6-10 PM)"], Tue: ["Dinner (6-10 PM)"], Wed: [], Thu: ["Dinner (6-10 PM)"], Fri: ["Dinner (6-10 PM)"], Sat: ["Full Day"], Sun: [] }, service_radius_km: 20, price_range: "₹2000+/meal", latitude: 28.6100, longitude: 77.2300, bio: "Fine dining chef turned personal cook. Perfect for dinner parties, special occasions, and weekly gourmet meal prep.", rating: 4.9, reviews_count: 156, verified: true, city: "New Delhi" },
  { id: "6", full_name: "Anita Desai", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita", role: "cook", cuisines: ["Indian", "Continental", "Chinese"], availability: { Mon: ["Full Day"], Tue: ["Full Day"], Wed: ["Full Day"], Thu: ["Full Day"], Fri: ["Full Day"], Sat: [], Sun: [] }, service_radius_km: 5, price_range: "₹200-500/meal", latitude: 28.6200, longitude: 77.2100, bio: "Everyday home cooking at its best. Simple, healthy, and delicious meals for families. Tiffin service available.", rating: 4.5, reviews_count: 210, verified: true, city: "New Delhi" },
];

// ─── UTILS ───
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function cn(...classes) { return classes.filter(Boolean).join(" "); }

// ─── ICONS ───
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Star: ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ChefHat: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.646-7.476 6 6 0 0 0-8.162 0A4 4 0 0 0 5.273 13.61c.411.197.727.584.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M10 13h4"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Google: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Heart: ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
};

// ─── INLINE STYLES (no external CSS files needed) ───
const s = {
  navbar: { position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,246,0.85)", backdropFilter: "blur(20px) saturate(180%)", borderBottom: "1px solid var(--border-light)", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLogo: { display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: "var(--text)", cursor: "pointer", letterSpacing: "-0.02em" },
  navLogoIcon: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), #E8845C)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 },
  navUser: { display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 8px", borderRadius: 100, background: "var(--bg-warm)", border: "1px solid var(--border-light)", cursor: "pointer", fontSize: 14, fontWeight: 500 },
  navAvatar: { width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: "var(--bg-warm)" },
  btn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer", transition: "all var(--transition)", border: "none", textDecoration: "none", lineHeight: 1.4 },
};

// ─── TOAST ───
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "default") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return (
    <>
      {children(addToast)}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 300, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: "12px 20px", borderRadius: "var(--radius-md)", background: t.type === "success" ? "var(--green)" : t.type === "error" ? "var(--red)" : "var(--text)", color: "white", fontSize: 14, fontWeight: 500, boxShadow: "var(--shadow-lg)", animation: "slideDown 0.3s ease", display: "flex", alignItems: "center", gap: 8, minWidth: 240 }}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── FILTER DROPDOWN ───
function FilterDropdown({ label, options, selected, onChange, multi = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const isActive = multi ? selected.length > 0 : !!selected;
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100, border: `1.5px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent-lighter)" : "var(--bg-card)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer", color: isActive ? "var(--accent)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
        <Icons.Filter /> {label} {multi && selected.length > 0 && `(${selected.length})`} <Icons.ChevronDown />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: 8, minWidth: 200, animation: "slideDown 0.2s ease" }}>
          {options.map(opt => {
            const isSel = multi ? selected.includes(opt) : selected === opt;
            return (
              <button key={opt} onClick={() => { if (multi) { onChange(isSel ? selected.filter(s => s !== opt) : [...selected, opt]); } else { onChange(isSel ? "" : opt); setOpen(false); } }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 14, color: isSel ? "var(--accent)" : "var(--text-secondary)", border: "none", background: isSel ? "var(--accent-light)" : "none", width: "100%", textAlign: "left", fontFamily: "var(--font-body)", fontWeight: isSel ? 500 : 400 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${isSel ? "var(--accent)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isSel ? "var(--accent)" : "transparent", color: "white" }}>
                  {isSel && <Icons.Check />}
                </span>
                {opt}
              </button>
            );
          })}
          {multi && selected.length > 0 && (
            <button onClick={() => { onChange([]); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 14, color: "var(--red)", border: "none", background: "none", width: "100%", textAlign: "left", fontFamily: "var(--font-body)", marginTop: 4, borderTop: "1px solid var(--border-light)", paddingTop: 8 }}>
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AUTH PAGE ───
function AuthPage({ onLogin }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(196,99,42,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(45,125,70,0.06) 0%, transparent 50%)" }} />
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: 48, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", maxWidth: 440, width: "100%", position: "relative", zIndex: 1, animation: "scaleIn 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={s.navLogo}><div style={s.navLogoIcon}>🍳</div> HomeCook</div>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>Welcome</h1>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Find talented home cooks near you, or share your culinary skills with your community.</p>
        <button onClick={() => onLogin({ id: "demo", full_name: "Demo User", email: "demo@homecook.com", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo" })}
          style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--bg-card)", fontSize: 15, fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text)" }}>
          <Icons.Google /> Continue with Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0", fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span style={{ flex: 1, height: 1, background: "var(--border)" }} /> secure sign-in <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>By continuing, you agree to HomeCook&apos;s Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}

// ─── ROLE SELECTION ───
function RoleSelection({ onSelect }) {
  const [role, setRole] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: 48, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", maxWidth: 440, width: "100%", animation: "scaleIn 0.4s ease" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>How will you use HomeCook?</h1>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>This helps us personalize your experience.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { key: "cook", icon: <Icons.ChefHat />, title: "I'm a Cook", desc: "Share your cooking talents and earn", bg: "var(--accent-light)", color: "var(--accent)" },
            { key: "user", icon: <Icons.Home />, title: "I'm Looking", desc: "Find skilled home cooks near you", bg: "var(--green-light)", color: "var(--green)" },
          ].map(r => (
            <div key={r.key} onClick={() => setRole(r.key)}
              style={{ padding: "28px 20px", borderRadius: "var(--radius-lg)", border: `2px solid ${role === r.key ? "var(--accent)" : "var(--border)"}`, background: role === r.key ? "var(--accent-light)" : "var(--bg-card)", cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "all 0.3s ease" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: r.bg, color: r.color }}>{r.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{r.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
        <button disabled={!role} onClick={() => onSelect(role)}
          style={{ ...s.btn, width: "100%", marginTop: 24, padding: "14px 28px", fontSize: 16, borderRadius: "var(--radius-md)", background: role ? "var(--accent)" : "var(--border)", color: "white", opacity: role ? 1 : 0.5 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── COOK ONBOARDING ───
function CookOnboarding({ user, onComplete, toast }) {
  const [form, setForm] = useState({ full_name: user.full_name || "", phone: "", bio: "", cuisines: [], price_range: "", service_radius_km: 10, city: "", latitude: 28.6139, longitude: 77.2090, availability: {} });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCuisine = (c) => update("cuisines", form.cuisines.includes(c) ? form.cuisines.filter(x => x !== c) : [...form.cuisines, c]);
  const toggleSlot = (day, slot) => {
    const daySlots = form.availability[day] || [];
    update("availability", { ...form.availability, [day]: daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot] });
  };
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })); toast("Location detected!", "success"); },
        () => toast("Could not detect location.", "error")
      );
    }
  };
  const canSubmit = form.full_name && form.cuisines.length > 0 && form.price_range && form.city;
  const inputStyle = { padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", fontSize: 15, fontFamily: "var(--font-body)", background: "var(--bg-card)", color: "var(--text)", outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", padding: 32, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: 48, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", maxWidth: 640, width: "100%", animation: "fadeUp 0.5s ease", height: "fit-content", marginTop: 48 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Set up your cook profile</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Tell households about your skills, availability, and service area.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>Full Name</label><input style={inputStyle} value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Your name" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>About You</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.6 }} value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Describe your cooking style..." rows={3} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>City</label><input style={inputStyle} value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. New Delhi" /></div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>Service Radius</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={1} max={50} value={form.service_radius_km} onChange={e => update("service_radius_km", Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontWeight: 600, fontSize: 14, minWidth: 50, color: "var(--accent)" }}>{form.service_radius_km} km</span>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ ...s.btn, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", fontSize: 13 }} onClick={handleLocation}>📍 Detect My Location</button>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>or enter city above</span>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em", display: "block", marginBottom: 6 }}>Price Range</label>
            <select style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} value={form.price_range} onChange={e => update("price_range", e.target.value)}>
              <option value="">Select pricing</option>
              {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icons.Sparkles /> Cuisines You Specialize In</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CUISINES.map(c => (
              <button key={c} onClick={() => toggleCuisine(c)}
                style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, border: `1px solid ${form.cuisines.includes(c) ? "var(--accent)" : "var(--border-light)"}`, background: form.cuisines.includes(c) ? "var(--accent)" : "var(--bg-warm)", color: form.cuisines.includes(c) ? "white" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icons.Clock /> Weekly Availability</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {DAYS.map(day => (
              <div key={day} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{day}</div>
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => toggleSlot(day, slot)}
                    style={{ width: "100%", padding: "4px 2px", borderRadius: 6, border: `1px solid ${(form.availability[day] || []).includes(slot) ? "var(--accent)" : "var(--border)"}`, background: (form.availability[day] || []).includes(slot) ? "var(--accent)" : "var(--bg-card)", fontSize: 9, textAlign: "center", cursor: "pointer", color: (form.availability[day] || []).includes(slot) ? "white" : "var(--text-tertiary)", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>
                    {slot.split(" ")[0]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button disabled={!canSubmit} onClick={() => { onComplete({ ...user, ...form, role: "cook", rating: 0, reviews_count: 0, verified: false }); toast("Profile created!", "success"); }}
          style={{ ...s.btn, width: "100%", marginTop: 32, padding: "14px 28px", fontSize: 16, borderRadius: "var(--radius-md)", background: canSubmit ? "var(--accent)" : "var(--border)", color: "white", opacity: canSubmit ? 1 : 0.5 }}>
          Complete Profile & Go Live
        </button>
      </div>
    </div>
  );
}

// ─── USER ONBOARDING ───
function UserOnboarding({ user, onComplete, toast }) {
  const [form, setForm] = useState({ full_name: user.full_name || "", phone: "", city: "", latitude: 28.6139, longitude: 77.2090 });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", fontSize: 15, fontFamily: "var(--font-body)", background: "var(--bg-card)", color: "var(--text)", outline: "none", width: "100%" };
  return (
    <div style={{ minHeight: "100vh", padding: 32, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: 48, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", maxWidth: 640, width: "100%", animation: "fadeUp 0.5s ease", height: "fit-content", marginTop: 48 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Almost there!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>A few details so we can show you the best matches nearby.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label><input style={inputStyle} value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Your name" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>City</label><input style={inputStyle} value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. New Delhi" /></div>
        </div>
        <button style={{ ...s.btn, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", fontSize: 13, marginTop: 16 }}
          onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => { setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })); toast("Location detected!", "success"); }, () => toast("Could not detect location.", "error")); }}>
          📍 Detect My Location
        </button>
        <button disabled={!form.full_name || !form.city} onClick={() => { onComplete({ ...user, ...form, role: "user" }); toast("Welcome to HomeCook!", "success"); }}
          style={{ ...s.btn, width: "100%", marginTop: 32, padding: "14px 28px", fontSize: 16, borderRadius: "var(--radius-md)", background: (form.full_name && form.city) ? "var(--accent)" : "var(--border)", color: "white" }}>
          Start Exploring
        </button>
      </div>
    </div>
  );
}

// ─── COOK DETAIL ───
function CookDetailView({ cook, userLocation, onBack, toast }) {
  const dist = userLocation ? haversineDistance(userLocation.lat, userLocation.lng, cook.latitude, cook.longitude).toFixed(1) : null;
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 32, animation: "fadeUp 0.5s ease" }}>
      <button onClick={onBack} style={{ ...s.btn, background: "transparent", color: "var(--text-secondary)", padding: "8px 12px", marginBottom: 16 }}><Icons.ArrowLeft /> Back to results</button>
      <div style={{ display: "flex", gap: 24, padding: 32, background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
        <div style={{ width: 100, height: 100, borderRadius: 24, overflow: "hidden", border: "3px solid var(--border-light)", flexShrink: 0 }}><img src={cook.avatar_url} alt={cook.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            {cook.full_name}
            {cook.verified && <span style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", fontSize: 11, background: "var(--green-light)", padding: "2px 6px", borderRadius: 100, gap: 3, fontWeight: 600 }}><Icons.Shield /> Verified</span>}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14, color: "var(--text-secondary)", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--gold)", fontWeight: 600 }}><Icons.Star filled /> {cook.rating} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>({cook.reviews_count} reviews)</span></span>
            {cook.city && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.MapPin /> {cook.city}</span>}
            {dist && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.MapPin /> {dist} km away</span>}
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 16, color: "var(--accent)" }}>{cook.price_range}</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", marginLeft: 8 }}>· serves within {cook.service_radius_km} km</span>
          </div>
        </div>
      </div>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>About</h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>{cook.bio}</p>
      </div>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Cuisines</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cook.cuisines.map(c => <span key={c} style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid #F5D4BC" }}>{c}</span>)}
        </div>
      </div>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Weekly Availability</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {DAYS.map(day => {
            const slots = (cook.availability && cook.availability[day]) || [];
            return (
              <div key={day} style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-warm)", textAlign: "center", opacity: slots.length === 0 ? 0.4 : 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{day}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {slots.length > 0 ? slots.map(sl => <div key={sl}>{sl.split(" ")[0]}</div>) : "Unavailable"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={() => toast("Contact request sent! The cook will respond within 24 hours.", "success")}
          style={{ ...s.btn, flex: 1, padding: "14px 28px", fontSize: 16, borderRadius: "var(--radius-md)", background: "var(--accent)", color: "white", boxShadow: "0 1px 3px rgba(196,99,42,0.3)" }}>
          <Icons.Mail /> Send Inquiry
        </button>
        <button onClick={() => toast("Phone: displayed after cook accepts your inquiry.", "default")}
          style={{ ...s.btn, padding: "14px 20px", borderRadius: "var(--radius-md)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
          <Icons.Phone />
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ───
function ProfilePage({ profile, onUpdate, onDelete, onBack, toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", fontSize: 15, fontFamily: "var(--font-body)", background: "var(--bg-card)", color: "var(--text)", outline: "none", width: "100%" };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
      <button onClick={onBack} style={{ ...s.btn, background: "transparent", color: "var(--text-secondary)", padding: "8px 12px", marginBottom: 16 }}><Icons.ArrowLeft /> Back</button>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 32, background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", marginBottom: 24, animation: "fadeUp 0.5s ease" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", border: "3px solid var(--border-light)", flexShrink: 0 }}><img src={profile.avatar_url} alt={profile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {profile.full_name}
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", background: profile.role === "cook" ? "var(--accent-light)" : "var(--green-light)", color: profile.role === "cook" ? "var(--accent)" : "var(--green)" }}>{profile.role === "cook" ? "Cook" : "Household"}</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{profile.email}</p>
        </div>
        <button onClick={() => setEditing(!editing)} style={{ ...s.btn, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", fontSize: 13 }}><Icons.Edit /> {editing ? "Cancel" : "Edit"}</button>
      </div>

      {editing && (
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16, animation: "fadeUp 0.5s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Edit Profile</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label><input style={inputStyle} value={form.full_name} onChange={e => update("full_name", e.target.value)} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Phone</label><input style={inputStyle} value={form.phone || ""} onChange={e => update("phone", e.target.value)} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>City</label><input style={inputStyle} value={form.city || ""} onChange={e => update("city", e.target.value)} /></div>
            {profile.role === "cook" && (
              <>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Price Range</label>
                  <select style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} value={form.price_range || ""} onChange={e => update("price_range", e.target.value)}>
                    <option value="">Select</option>
                    {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>About You</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={form.bio || ""} onChange={e => update("bio", e.target.value)} rows={3} /></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Cuisines</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CUISINES.map(c => (
                      <button key={c} onClick={() => update("cuisines", (form.cuisines || []).includes(c) ? form.cuisines.filter(x => x !== c) : [...(form.cuisines || []), c])}
                        style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, border: `1px solid ${(form.cuisines || []).includes(c) ? "var(--accent)" : "var(--border-light)"}`, background: (form.cuisines || []).includes(c) ? "var(--accent)" : "var(--bg-warm)", color: (form.cuisines || []).includes(c) ? "white" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={() => { onUpdate(form); setEditing(false); toast("Profile updated!", "success"); }}
            style={{ ...s.btn, marginTop: 20, background: "var(--accent)", color: "white" }}>
            Save Changes
          </button>
        </div>
      )}

      {!editing && profile.role === "cook" && (
        <>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>About</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{profile.bio || "No bio yet."}</p>
          </div>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Cuisines & Pricing</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {(profile.cuisines || []).map(c => <span key={c} style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid #F5D4BC" }}>{c}</span>)}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{profile.price_range || "Not set"} · Serves within {profile.service_radius_km || "?"} km</p>
          </div>
        </>
      )}

      <div style={{ background: "var(--red-light)", borderRadius: "var(--radius-lg)", border: "1px solid #FECACA", padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16, color: "var(--red)", display: "flex", alignItems: "center", gap: 8 }}><Icons.Trash /> Danger Zone</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>Permanently delete your account and all associated data. This cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} style={{ ...s.btn, background: "var(--red-light)", color: "var(--red)", border: "1px solid #FECACA" }}><Icons.Trash /> Delete My Account</button>
      </div>

      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,22,20,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.3s ease" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Delete Account?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>This will permanently remove your profile and all data. This cannot be reversed.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...s.btn, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>Keep Account</button>
              <button onClick={() => { onDelete(); setShowDeleteModal(false); }} style={{ ...s.btn, background: "var(--red)", color: "white" }}>Yes, Delete Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BROWSE PAGE ───
function BrowsePage({ cooks, profile, userLocation, onViewCook, onViewProfile, onLogout, toast }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [priceFilter, setPriceFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [favorites, setFavorites] = useState(new Set());
  const toggleFav = (id) => setFavorites(f => { const n = new Set(f); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filteredCooks = useMemo(() => {
    let results = [...cooks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(c => c.full_name.toLowerCase().includes(q) || (c.bio || "").toLowerCase().includes(q) || (c.cuisines || []).some(cu => cu.toLowerCase().includes(q)) || (c.city || "").toLowerCase().includes(q));
    }
    if (cuisineFilter.length > 0) results = results.filter(c => cuisineFilter.some(cf => (c.cuisines || []).includes(cf)));
    if (priceFilter) results = results.filter(c => c.price_range === priceFilter);
    if (dayFilter) results = results.filter(c => ((c.availability || {})[dayFilter] || []).length > 0);
    if (userLocation) results = results.map(c => ({ ...c, _distance: haversineDistance(userLocation.lat, userLocation.lng, c.latitude, c.longitude) }));
    if (sortBy === "distance" && userLocation) results.sort((a, b) => (a._distance || 999) - (b._distance || 999));
    else if (sortBy === "rating") results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "price_low") { const po = { "₹200-500/meal": 1, "₹500-1000/meal": 2, "₹1000-2000/meal": 3, "₹2000+/meal": 4 }; results.sort((a, b) => (po[a.price_range] || 5) - (po[b.price_range] || 5)); }
    else if (sortBy === "reviews") results.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
    return results;
  }, [cooks, searchQuery, cuisineFilter, priceFilter, dayFilter, sortBy, userLocation]);

  const activeFilterCount = cuisineFilter.length + (priceFilter ? 1 : 0) + (dayFilter ? 1 : 0);

  return (
    <div>
      <nav style={s.navbar}>
        <div style={s.navLogo}><div style={s.navLogoIcon}>🍳</div> HomeCook</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={s.navUser} onClick={onViewProfile}>
            <div style={s.navAvatar}><img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
            {profile.full_name?.split(" ")[0]}
          </div>
          <button onClick={onLogout} style={{ ...s.btn, background: "transparent", color: "var(--text-secondary)", padding: 8 }} title="Sign out"><Icons.LogOut /></button>
        </div>
      </nav>

      <div style={{ padding: "80px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, var(--accent-light) 0%, transparent 70%)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Home-cooked meals,<br/><em style={{ fontStyle: "italic", color: "var(--accent)" }}>made for you</em>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px" }}>Discover talented cooks in your neighborhood. From daily tiffins to gourmet dinner parties.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "4px 4px 4px 16px", boxShadow: "var(--shadow-sm)", maxWidth: 640, width: "100%" }}>
              <Icons.Search />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by cuisine, cook name, or city..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "var(--font-body)", background: "transparent", color: "var(--text)", padding: "8px 8px" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ ...s.btn, background: "transparent", color: "var(--text-secondary)", padding: 8 }}><Icons.X /></button>}
              <button style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "white", fontWeight: 500, fontSize: 14, fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Icons.Search /> Search</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <FilterDropdown label="Cuisine" options={CUISINES} selected={cuisineFilter} onChange={setCuisineFilter} />
            <FilterDropdown label="Price" options={PRICE_RANGES} selected={priceFilter} onChange={setPriceFilter} multi={false} />
            <FilterDropdown label="Available On" options={DAYS} selected={dayFilter} onChange={setDayFilter} multi={false} />
            {activeFilterCount > 0 && (
              <button onClick={() => { setCuisineFilter([]); setPriceFilter(""); setDayFilter(""); }} style={{ ...s.btn, background: "transparent", color: "var(--red)", padding: "6px 14px", fontSize: 13 }}><Icons.X /> Clear ({activeFilterCount})</button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Sort by</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "6px 32px 6px 10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", fontSize: 13, fontFamily: "var(--font-body)", background: "var(--bg-card)", color: "var(--text)", outline: "none", appearance: "none", cursor: "pointer" }}>
              <option value="relevance">Relevance</option>
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="price_low">Price: Low to High</option>
            </select>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 24 }}>
          {searchQuery || activeFilterCount > 0 ? `${filteredCooks.length} cook${filteredCooks.length !== 1 ? "s" : ""} found` : "Cooks Near You"}
        </h2>

        {filteredCooks.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {filteredCooks.map((cook, i) => (
              <div key={cook.id} onClick={() => onViewCook(cook)}
                style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden", cursor: "pointer", position: "relative", animation: `fadeUp 0.5s ease ${i * 0.05}s both`, transition: "all 0.3s ease" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <button onClick={e => { e.stopPropagation(); toggleFav(cook.id); }}
                  style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: favorites.has(cook.id) ? "var(--red)" : "var(--text-tertiary)", zIndex: 2 }}>
                  <Icons.Heart filled={favorites.has(cook.id)} />
                </button>
                <div style={{ padding: "20px 20px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0, border: "2px solid var(--border-light)" }}><img src={cook.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, display: "flex", alignItems: "center", gap: 6, lineHeight: 1.3 }}>
                      {cook.full_name}
                      {cook.verified && <span style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", fontSize: 11, background: "var(--green-light)", padding: "2px 6px", borderRadius: 100, gap: 3, fontWeight: 600 }}><Icons.Shield /> Verified</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--gold)", fontWeight: 600 }}><Icons.Star filled /> {cook.rating}</span>
                      <span>({cook.reviews_count} reviews)</span>
                      {cook.city && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icons.MapPin /> {cook.city}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cook.bio}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {cook.cuisines.slice(0, 4).map(c => <span key={c} style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid #F5D4BC" }}>{c}</span>)}
                    {cook.cuisines.length > 4 && <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: "var(--bg-warm)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>+{cook.cuisines.length - 4}</span>}
                  </div>
                </div>
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-accent)" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--accent)" }}>{cook.price_range}</span>
                  {cook._distance != null && <span style={{ fontSize: 13, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}><Icons.MapPin /> {cook._distance.toFixed(1)} km</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 32px", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🍽️</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-secondary)", marginBottom: 8 }}>No cooks match your criteria</h3>
            <p style={{ fontSize: 14, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COOK DASHBOARD ───
function CookDashboard({ profile, onViewProfile, onLogout }) {
  return (
    <div>
      <nav style={s.navbar}>
        <div style={s.navLogo}><div style={s.navLogoIcon}>🍳</div> HomeCook</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={s.navUser} onClick={onViewProfile}>
            <div style={s.navAvatar}><img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
            {profile.full_name?.split(" ")[0]}
          </div>
          <button onClick={onLogout} style={{ ...s.btn, background: "transparent", color: "var(--text-secondary)", padding: 8 }}><Icons.LogOut /></button>
        </div>
      </nav>
      <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🍳</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Welcome, {profile.full_name?.split(" ")[0]}!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>Your profile is live. Households in your area can now discover you.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[ { label: "Profile Views", value: "—", sub: "Coming soon" }, { label: "Inquiries", value: "0", sub: "No inquiries yet" }, { label: "Rating", value: profile.rating || "New", sub: `${profile.reviews_count || 0} reviews` }, { label: "Service Area", value: `${profile.service_radius_km || 0} km`, sub: profile.city || "—" } ].map((stat, i) => (
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 20, animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 600 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onViewProfile} style={{ ...s.btn, background: "var(--accent)", color: "white" }}><Icons.Edit /> Edit Profile</button>
            <button style={{ ...s.btn, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}><Icons.Clock /> Manage Availability</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function HomePage() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("auth");
  const [selectedCook, setSelectedCook] = useState(null);
  const [cooks, setCooks] = useState(MOCK_COOKS);
  const userLocation = profile ? { lat: profile.latitude || 28.6139, lng: profile.longitude || 77.2090 } : null;

  const handleLogin = (user) => { setAuthUser(user); setView("role"); };
  const handleRoleSelect = (role) => setView(role === "cook" ? "onboard_cook" : "onboard_user");
  const handleOnboardComplete = (fullProfile) => {
    setProfile(fullProfile);
    if (fullProfile.role === "cook") { setCooks(prev => [...prev, { ...fullProfile, id: `user-${Date.now()}` }]); setView("cook_dashboard"); }
    else setView("browse");
  };
  const handleViewCook = (cook) => { setSelectedCook(cook); setView("cook_detail"); };
  const handleViewProfile = () => setView("profile");
  const handleUpdateProfile = (updated) => { setProfile(updated); if (updated.role === "cook") setCooks(prev => prev.map(c => c.id === updated.id ? updated : c)); };
  const handleDeleteAccount = () => { if (profile?.role === "cook") setCooks(prev => prev.filter(c => c.id !== profile.id)); setProfile(null); setAuthUser(null); setView("auth"); };
  const handleLogout = () => { setProfile(null); setAuthUser(null); setView("auth"); };
  const goHome = () => setView(profile?.role === "cook" ? "cook_dashboard" : "browse");

  return (
    <ToastProvider>
      {(toast) => (
        <>
          {view === "auth" && <AuthPage onLogin={handleLogin} />}
          {view === "role" && <RoleSelection onSelect={handleRoleSelect} />}
          {view === "onboard_cook" && <CookOnboarding user={authUser} onComplete={handleOnboardComplete} toast={toast} />}
          {view === "onboard_user" && <UserOnboarding user={authUser} onComplete={handleOnboardComplete} toast={toast} />}
          {view === "browse" && <BrowsePage cooks={cooks} profile={profile} userLocation={userLocation} onViewCook={handleViewCook} onViewProfile={handleViewProfile} onLogout={handleLogout} toast={toast} />}
          {view === "cook_dashboard" && <CookDashboard profile={profile} onViewProfile={handleViewProfile} onLogout={handleLogout} />}
          {view === "profile" && <ProfilePage profile={profile} onUpdate={handleUpdateProfile} onDelete={handleDeleteAccount} onBack={goHome} toast={toast} />}
          {view === "cook_detail" && selectedCook && <CookDetailView cook={selectedCook} userLocation={userLocation} onBack={goHome} toast={toast} />}
        </>
      )}
    </ToastProvider>
  );
}
