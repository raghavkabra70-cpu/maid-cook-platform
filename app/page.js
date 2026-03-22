import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="hero-wrap">
        <div className="hero-copy">
          <p className="hero-eyebrow">HomeCook</p>
          <h1 className="hero-title">Find trusted home cooks near you</h1>
          <p className="hero-subtitle">
            A marketplace connecting home cooks with families and professionals
            looking for fresh, local, home-style meals.
          </p>
        </div>

        <div className="role-grid">
          <Link href="/cook/register" className="role-card">
            <div className="role-icon">👩‍🍳</div>
            <h2 className="role-title">I am a Cook</h2>
            <p className="role-text">
              Join the platform, create your profile, and get discovered by
              households looking for cooks in your area.
            </p>
          </Link>

          <Link href="/user" className="role-card">
            <div className="role-icon">🏠</div>
            <h2 className="role-title">I am a User</h2>
            <p className="role-text">
              Explore available cooks near you and find someone who matches your
              cuisine, location, and schedule needs.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}