import HeroSection from '@/frontend/HeroSection';
import FeatureCard from '@/frontend/FeatureCard';

const features = [
  {
    title: "Track Progress",
    description: "Monitor your academic journey with detailed insights and analytics"
  },
  {
    title: "Manage Assignments",
    description: "Stay organized with easy-to-use assignment tracking and reminders"
  },
  {
    title: "Collaborate",
    description: "Work together with classmates on group projects and assignments"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <HeroSection 
          title="Student Dashboard" 
          subtitle="Your all-in-one platform for managing academic life. Track progress, manage assignments, and collaborate with peers."
        />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}