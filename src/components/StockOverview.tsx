import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, BarChart3, Layers } from "lucide-react";
import { StockItem } from "@/hooks/useStocks";

interface StockOverviewProps {
  stocks: StockItem[];
}

export const StockOverview = ({ stocks }: StockOverviewProps) => {
  const stats = useMemo(() => {
    const totalItems = stocks.length;
    const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const lowStockItems = stocks.filter(stock => stock.quantity > 0 && stock.quantity < 10).length;
    const outOfStockItems = stocks.filter(stock => stock.quantity === 0).length;
    
    // Group statistics
    const uniqueStockNumbers = new Set(stocks.map(stock => stock.stockNumber)).size;
    const uniqueBatchNumbers = new Set(stocks.map(stock => stock.batchNumber)).size;
    
    return {
      totalItems,
      totalQuantity,
      lowStockItems,
      outOfStockItems,
      uniqueStockNumbers,
      uniqueBatchNumbers
    };
  }, [stocks]);

  const overviewCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      description: "Individual stock entries",
      icon: Package,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Total Quantity",
      value: stats.totalQuantity,
      description: "Combined inventory count",
      icon: TrendingUp,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Unique Stocks",
      value: stats.uniqueStockNumbers,
      description: "Different stock numbers",
      icon: Layers,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Unique Batches",
      value: stats.uniqueBatchNumbers,
      description: "Different batch numbers",
      icon: BarChart3,
      gradient: "bg-gradient-primary"
    }
  ];

  const alertCards = [
    {
      title: "Low Stock",
      value: stats.lowStockItems,
      description: "Items below 10",
      icon: AlertTriangle,
      gradient: stats.lowStockItems > 0 ? "bg-gradient-to-r from-warning to-warning/80" : "bg-gradient-primary"
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockItems,
      description: "Items at 0",
      icon: AlertTriangle,
      gradient: stats.outOfStockItems > 0 ? "bg-gradient-to-r from-destructive to-destructive/80" : "bg-gradient-primary"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <Card key={index} className="bg-gradient-card shadow-professional-md hover:shadow-professional-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.gradient}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertCards.map((card, index) => (
            card.value > 0 && (
              <Card key={index} className="border-l-4 border-l-warning bg-gradient-card shadow-professional-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warning">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${card.gradient}`}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-warning">{card.value}</div>
                    <Badge variant={card.title === "Out of Stock" ? "destructive" : "secondary"}>
                      {card.title === "Out of Stock" ? "Critical" : "Alert"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
};