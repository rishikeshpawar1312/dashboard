// components/DashboardLayout.tsx
import  UserNavigation  from "@/frontend/user-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold">My App</span>
            </div>
            <UserNavigation />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
