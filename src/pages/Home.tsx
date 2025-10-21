import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useStocks } from "@/hooks/useStocks";
import { StockTable } from "@/components/StockTable";
import { 
  Package, 
  FileText, 
  BarChart3,
  Database
} from "lucide-react";

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stocks, loading, updateStock, deleteStock } = useStocks();
  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case "dashboard":
        navigate("/");
        toast({
          title: "Navigating to Dashboard",
          description: "Opening main inventory dashboard",
        });
        break;
      case "report":
        navigate("/presentation");
        toast({
          title: "Opening Report Generator",
          description: "Navigate to Forms & Reports section",
        });
        break;
      case "analytics":
        toast({
          title: "Analytics Dashboard",
          description: "Advanced analytics coming soon!",
        });
        break;
      default:
        break;
    }
  };

  const quickActions = [
    {
      title: "Add New Stock",
      description: "Quickly add new inventory items",
      icon: Package,
      action: "Go to Dashboard",
      actionType: "dashboard",
      variant: "default" as const
    },
    {
      title: "Generate Report",
      description: "Create stock reports and analytics",
      icon: FileText,
      action: "Create Report",
      actionType: "report",
      variant: "secondary" as const
    },
    {
      title: "View Analytics",
      description: "Check stock trends and insights",
      icon: BarChart3,
      action: "View Charts",
      actionType: "analytics",
      variant: "outline" as const
    }
  ];

  // Get unique stock names
  const uniqueStockNames = Array.from(new Set(stocks.map(s => s.stockNumber)));
  const uniqueBatchNumbers = Array.from(new Set(stocks.map(s => s.batchNumber)));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Stock Pail</h1>
        <p className="text-lg text-muted-foreground">
          Manage your inventory efficiently with our comprehensive stock management system.
        </p>
      </div>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-professional-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={action.variant} 
                  className="w-full"
                  onClick={() => handleQuickAction(action.actionType)}
                >
                  {action.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stock Overview */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading stock data...</div>
        </div>
      ) : stocks.length === 0 ? (
        <section className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Data in System</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your inventory is empty. Start by adding your first stock item to get started with tracking your inventory.
              </p>
              <Button onClick={() => navigate("/")}>
                <Package className="mr-2 h-4 w-4" />
                Add First Stock Item
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {/* Stock Names Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Inventory Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Stock Numbers
                  </CardTitle>
                  <CardDescription>
                    {uniqueStockNames.length} unique stock {uniqueStockNames.length === 1 ? 'item' : 'items'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {uniqueStockNames.slice(0, 10).map((stockName) => (
                      <span
                        key={stockName}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {stockName}
                      </span>
                    ))}
                    {uniqueStockNames.length > 10 && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                        +{uniqueStockNames.length - 10} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Batch Numbers
                  </CardTitle>
                  <CardDescription>
                    {uniqueBatchNumbers.length} unique {uniqueBatchNumbers.length === 1 ? 'batch' : 'batches'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {uniqueBatchNumbers.slice(0, 10).map((batchNumber) => (
                      <span
                        key={batchNumber}
                        className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium"
                      >
                        {batchNumber}
                      </span>
                    ))}
                    {uniqueBatchNumbers.length > 10 && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                        +{uniqueBatchNumbers.length - 10} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stock Table */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Stock Inventory</h2>
            <StockTable 
              stocks={stocks}
              onUpdateStock={updateStock}
              onDeleteStock={deleteStock}
            />
          </section>
        </>
      )}

    </div>
  );
};

export default Home;