import { StockEntry } from "@/components/StockEntry";
import { StockTable } from "@/components/StockTable";
import { StockOverview } from "@/components/StockOverview";
import { useStocks } from "@/hooks/useStocks";

const Index = () => {
  const { stocks, loading, addStock, updateStock, deleteStock } = useStocks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading stocks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <StockOverview stocks={stocks} />
      
      {/* Stock Entry Form */}
      <StockEntry onAddStock={addStock} />
      
      {/* Stock Table */}
      <StockTable 
        stocks={stocks} 
        onUpdateStock={updateStock}
        onDeleteStock={deleteStock}
      />
    </div>
  );
};

export default Index;
