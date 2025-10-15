import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStocks } from "@/hooks/useStocks";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Upload,
  Database,
  FileSpreadsheet,
  Plus
} from "lucide-react";

const Analytics = () => {
  const { stocks, loading, addStock } = useStocks();
  const { toast } = useToast();
  const [showDataSourceModal, setShowDataSourceModal] = useState(false);
  const [csvData, setCsvData] = useState("");

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!stocks.length) return null;

    // Time-based data
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentStocks = stocks.filter(s => new Date(s.dateAdded) >= lastWeek);
    const monthlyStocks = stocks.filter(s => new Date(s.dateAdded) >= lastMonth);

    // Stock trends
    const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const lowStockCount = stocks.filter(s => s.quantity > 0 && s.quantity < 10).length;
    const outOfStockCount = stocks.filter(s => s.quantity === 0).length;
    
    // Top performers
    const stockNumberCounts = stocks.reduce((acc, stock) => {
      acc[stock.stockNumber] = (acc[stock.stockNumber] || 0) + stock.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topStocks = Object.entries(stockNumberCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Batch analysis
    const batchCounts = stocks.reduce((acc, stock) => {
      acc[stock.batchNumber] = (acc[stock.batchNumber] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topBatches = Object.entries(batchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalItems: stocks.length,
      totalQuantity,
      recentAdditions: recentStocks.length,
      monthlyAdditions: monthlyStocks.length,
      lowStockCount,
      outOfStockCount,
      topStocks,
      topBatches,
      avgQuantityPerItem: totalQuantity / stocks.length,
      uniqueStockNumbers: new Set(stocks.map(s => s.stockNumber)).size,
      uniqueBatchNumbers: new Set(stocks.map(s => s.batchNumber)).size,
    };
  }, [stocks]);

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste CSV data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers mapping
      const headerMap: Record<string, string> = {
        'batch_number': 'batchNumber',
        'batch number': 'batchNumber',
        'batch': 'batchNumber',
        'stock_number': 'stockNumber', 
        'stock number': 'stockNumber',
        'stock': 'stockNumber',
        'description': 'description',
        'desc': 'description',
        'quantity': 'quantity',
        'qty': 'quantity',
        'amount': 'quantity',
      };

      const mappedHeaders = headers.map(h => headerMap[h] || h);
      
      // Validate required headers
      if (!mappedHeaders.includes('batchNumber') || !mappedHeaders.includes('stockNumber')) {
        toast({
          title: "Invalid CSV format",
          description: "CSV must contain 'batch_number' and 'stock_number' columns",
          variant: "destructive",
        });
        return;
      }

      const successfulImports: string[] = [];
      const failedImports: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        try {
          const rowData: any = {};
          mappedHeaders.forEach((header, index) => {
            if (values[index]) {
              rowData[header] = header === 'quantity' ? parseInt(values[index]) || 0 : values[index];
            }
          });

          if (rowData.batchNumber && rowData.stockNumber) {
            await addStock({
              batchNumber: rowData.batchNumber,
              stockNumber: rowData.stockNumber,
              description: rowData.description || '',
              quantity: rowData.quantity || 0,
            });
            successfulImports.push(rowData.stockNumber);
          } else {
            failedImports.push(`Row ${i + 1}: Missing required fields`);
          }
        } catch (error) {
          failedImports.push(`Row ${i + 1}: ${error}`);
        }
      }

      toast({
        title: "Import completed",
        description: `Successfully imported ${successfulImports.length} items. ${failedImports.length} failed.`,
        variant: successfulImports.length > 0 ? "default" : "destructive",
      });

      if (successfulImports.length > 0) {
        setCsvData("");
        setShowDataSourceModal(false);
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-6">Add some stock items to see analytics and insights</p>
          <Button onClick={() => setShowDataSourceModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Data Source
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Stock trends and insights</p>
        </div>
        <Button onClick={() => setShowDataSourceModal(true)}>
          <Database className="mr-2 h-4 w-4" />
          Add Data Source
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Avg {analytics.avgQuantityPerItem.toFixed(1)} per item
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.recentAdditions} added this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Diversity</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueStockNumbers}</div>
            <p className="text-xs text-muted-foreground">
              Unique stock numbers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.lowStockCount + analytics.outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Stock Numbers
            </CardTitle>
            <CardDescription>Highest quantity by stock number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topStocks.map(([stockNumber, quantity], index) => (
                <div key={stockNumber} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-mono font-semibold">{stockNumber}</span>
                  </div>
                  <Badge>{quantity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-professional-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Batches
            </CardTitle>
            <CardDescription>Most frequently used batch numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topBatches.map(([batchNumber, count], index) => (
                <div key={batchNumber} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-mono font-semibold">{batchNumber}</span>
                  </div>
                  <Badge variant="secondary">{count} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Alerts */}
      {(analytics.lowStockCount > 0 || analytics.outOfStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.lowStockCount > 0 && (
            <Card className="border-l-4 border-l-yellow-500 bg-gradient-card shadow-professional-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{analytics.lowStockCount}</div>
                <p className="text-sm text-muted-foreground">Items below 10 quantity</p>
              </CardContent>
            </Card>
          )}

          {analytics.outOfStockCount > 0 && (
            <Card className="border-l-4 border-l-red-500 bg-gradient-card shadow-professional-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-5 w-5" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{analytics.outOfStockCount}</div>
                <p className="text-sm text-muted-foreground">Items with zero quantity</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Data Source Modal */}
      {showDataSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Add Data Source
              </CardTitle>
              <CardDescription>
                Import stock data from CSV format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csvData">CSV Data</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Paste CSV data with headers: batch_number, stock_number, description, quantity
                </p>
                <textarea
                  id="csvData"
                  className="w-full h-40 p-3 border rounded-md resize-none font-mono text-sm"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="batch_number,stock_number,description,quantity&#10;BT001,SK001,Sample Item 1,50&#10;BT002,SK002,Sample Item 2,25"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDataSourceModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCsvImport}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;