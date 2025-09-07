import { useState } from "react";
import { StockEntry } from "@/components/StockEntry";
import { StockTable } from "@/components/StockTable";
import { StockOverview } from "@/components/StockOverview";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAddStock = (newStock: StockItem) => {
    setStocks(prev => [...prev, newStock]);
  };

  const handleUpdateStock = (stockId: string, updatedData: Partial<StockItem>) => {
    setStocks(prev => prev.map(stock => 
      stock.id === stockId ? { ...stock, ...updatedData } : stock
    ));
  };

  const handleDeleteStock = (stockId: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== stockId));
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <StockOverview stocks={stocks} />
      
      {/* Stock Entry Form */}
      <StockEntry onAddStock={handleAddStock} />
      
      {/* Stock Table */}
      <StockTable 
        stocks={stocks} 
        onUpdateStock={handleUpdateStock}
        onDeleteStock={handleDeleteStock}
      />
    </div>
  );
};

export default Index;
