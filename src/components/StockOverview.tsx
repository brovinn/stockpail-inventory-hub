import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Calendar } from "lucide-react";

interface StockItem {
  id: string;
  batchNumber: string;
  stockNumber: string;
  description: string;
  quantity: number;
  dateAdded: string;
}

interface StockOverviewProps {
  stocks: StockItem[];
}

export const StockOverview = ({ stocks }: StockOverviewProps) => {
  const totalItems = stocks.length;
  const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const lowStockItems = stocks.filter(stock => stock.quantity < 10).length;
  const outOfStockItems = stocks.filter(stock => stock.quantity === 0).length;

  const overviewCards = [
    {
      title: "Total Items",
      value: totalItems,
      description: "Unique stock items",
      icon: Package,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Total Quantity",
      value: totalQuantity,
      description: "Items in stock",
      icon: TrendingUp,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      description: "Items below 10",
      icon: AlertTriangle,
      gradient: lowStockItems > 0 ? "bg-gradient-to-r from-warning to-warning/80" : "bg-gradient-primary",
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      description: "Items at 0",
      icon: Calendar,
      gradient: outOfStockItems > 0 ? "bg-gradient-to-r from-destructive to-destructive/80" : "bg-gradient-primary",
    },
  ];

  return (
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
  );
};