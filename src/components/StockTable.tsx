import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GroupedStockView } from "./GroupedStockView";
import { StockEditDialog } from "./StockEditDialog";
import { StockItem, StockItemInput } from "@/hooks/useStocks";
import { 
  Search, 
  ArrowUpDown, 
  Package2, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye,
  Layers,
  List
} from "lucide-react";

interface StockTableProps {
  stocks: StockItem[];
  onUpdateStock?: (stockId: string, updatedStock: Partial<StockItemInput>) => Promise<void>;
  onDeleteStock?: (stockId: string) => Promise<void>;
}

type SortField = 'batchNumber' | 'stockNumber' | 'quantity' | 'dateAdded';
type SortDirection = 'asc' | 'desc';

export const StockTable = ({ stocks, onUpdateStock, onDeleteStock }: StockTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStockAction = (action: string, stock: StockItem) => {
    switch (action) {
      case "view":
        toast({
          title: "Stock Details",
          description: `Viewing details for ${stock.stockNumber}`,
        });
        break;
      case "edit":
        setEditingStock(stock);
        setEditDialogOpen(true);
        break;
      case "delete":
        if (onDeleteStock && confirm(`Are you sure you want to delete stock item ${stock.stockNumber}?`)) {
          onDeleteStock(stock.id);
          toast({
            title: "Stock Deleted",
            description: `${stock.stockNumber} has been removed from inventory`,
            variant: "destructive",
          });
        }
        break;
    }
  };

  const handleSaveStock = async (stockId: string, updates: Partial<StockItemInput>) => {
    if (onUpdateStock) {
      await onUpdateStock(stockId, updates);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter stocks based on search term
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock =>
      stock.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  // Sort filtered stocks
  const filteredAndSortedStocks = useMemo(() => {
    return filteredStocks.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredStocks, sortField, sortDirection]);

  const getQuantityBadgeVariant = (quantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity < 10) return "secondary";
    return "default";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 text-green-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'shipped': return 'bg-blue-500/10 text-blue-600';
      case 'missing': return 'bg-red-500/10 text-red-600';
      case 'contaminated': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <>
      <StockEditDialog
        stock={editingStock}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveStock}
      />
      <Card className="bg-gradient-card shadow-professional-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          <CardTitle>Stock Inventory</CardTitle>
        </div>
        <CardDescription>
          View, search, and sort your stock items with grouping options
        </CardDescription>
        
        <div className="flex gap-4 items-center pt-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Grouped View
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredStocks.length} of {stocks.length} items
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'grouped' ? (
          <Tabs defaultValue="stock" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stock">Group by Stock Number</TabsTrigger>
              <TabsTrigger value="batch">Group by Batch Number</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stock" className="space-y-4">
              <GroupedStockView
                stocks={filteredStocks}
                groupBy="stock"
                onUpdateStock={onUpdateStock}
                onDeleteStock={onDeleteStock}
              />
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-4">
              <GroupedStockView
                stocks={filteredStocks}
                groupBy="batch"
                onUpdateStock={onUpdateStock}
                onDeleteStock={onDeleteStock}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Original list view
          filteredAndSortedStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {stocks.length === 0 ? (
                <div>
                  <Package2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No stock items yet. Add your first item above.</p>
                </div>
              ) : (
                <div>
                  <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No items match your search criteria.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('batchNumber')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary"
                      >
                        Batch Number
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </th>
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('stockNumber')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary"
                      >
                        Stock Number
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </th>
...
                    <th className="text-left p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('dateAdded')}
                        className="h-auto p-0 font-semibold text-foreground hover:text-primary"
                      >
                        Date Added
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedStocks.map((stock) => (
                    <tr key={stock.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="font-mono text-sm font-semibold text-primary">
                          {stock.batchNumber}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm font-semibold">
                          {stock.stockNumber}
                        </div>
                      </td>
...
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(stock.dateAdded).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(stock.status)}`}>
                          {stock.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStockAction("view", stock)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStockAction("edit", stock)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStockAction("delete", stock)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </CardContent>
    </Card>
    </>
  );
};