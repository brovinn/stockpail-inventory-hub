import { useState } from "react";
import { StockEntry } from "@/components/StockEntry";
import { StockTable } from "@/components/StockTable";
import { StockOverview } from "@/components/StockOverview";
import { Package } from "lucide-react";

interface StockItem {
  id: string;
  batchNumber: string;
  stockNumber: string;
  description: string;
  quantity: number;
  dateAdded: string;
}

const Index = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);

  const handleAddStock = (newStock: StockItem) => {
    setStocks(prev => [...prev, newStock]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-professional-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Stock Pail</h1>
              <p className="text-white/90 text-sm">Professional Inventory Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <StockOverview stocks={stocks} />
          
          {/* Stock Entry Form */}
          <StockEntry onAddStock={handleAddStock} />
          
          {/* Stock Table */}
          <StockTable stocks={stocks} />
        </div>
      </main>
    </div>
  );
};

export default Index;
