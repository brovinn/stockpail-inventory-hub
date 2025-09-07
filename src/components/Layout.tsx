import { Package } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-professional-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Stock Pail</h1>
                <p className="text-white/90 text-sm">Professional Inventory Management</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <Tabs value={window.location.pathname} className="w-auto">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="/" asChild>
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                      `text-white hover:text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white ${
                        isActive ? 'bg-white/20' : ''
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </TabsTrigger>
                <TabsTrigger value="/home" asChild>
                  <NavLink 
                    to="/home" 
                    className={({ isActive }) => 
                      `text-white hover:text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white ${
                        isActive ? 'bg-white/20' : ''
                      }`
                    }
                  >
                    Home
                  </NavLink>
                </TabsTrigger>
            <TabsTrigger value="/analytics" asChild>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `text-white hover:text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white ${
                    isActive ? 'bg-white/20' : ''
                  }`
                }
              >
                Analytics
              </NavLink>
            </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;