import HeroSection from '@/frontend/HeroSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto">
        <HeroSection 
          title="Student Dashboard" 
          subtitle="Your all-in-one platform for managing academic life. Track progress, manage assignments, and collaborate with peers."
        />
      </section>

      
    </main>
  );
}
