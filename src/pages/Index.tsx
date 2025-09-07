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
    <div className="space-y-8">
      {/* Overview Cards */}
      <StockOverview stocks={stocks} />
      
      {/* Stock Entry Form */}
      <StockEntry onAddStock={handleAddStock} />
      
      {/* Stock Table */}
      <StockTable stocks={stocks} />
    </div>
  );
};

export default Index;
