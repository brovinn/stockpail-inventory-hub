import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Package2, Calendar } from "lucide-react";

interface StockItem {
  id: string;
  batchNumber: string;
  stockNumber: string;
  description: string;
  quantity: number;
  dateAdded: string;
}

interface StockTableProps {
  stocks: StockItem[];
}

type SortField = 'batchNumber' | 'stockNumber' | 'quantity' | 'dateAdded';
type SortDirection = 'asc' | 'desc';

export const StockTable = ({ stocks }: StockTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(stock =>
      stock.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
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
  }, [stocks, searchTerm, sortField, sortDirection]);

  const getQuantityBadgeVariant = (quantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity < 10) return "secondary";
    return "default";
  };

  return (
    <Card className="bg-gradient-card shadow-professional-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          <CardTitle>Stock Inventory</CardTitle>
        </div>
        <CardDescription>
          View, search, and sort your stock items
        </CardDescription>
        
        <div className="flex gap-4 items-center pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-primary"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedStocks.length} of {stocks.length} items
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAndSortedStocks.length === 0 ? (
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
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('quantity')}
                      className="h-auto p-0 font-semibold text-foreground hover:text-primary"
                    >
                      Quantity
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </th>
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
                    <td className="p-3">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {stock.description || "No description"}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getQuantityBadgeVariant(stock.quantity)}>
                        {stock.quantity}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {stock.dateAdded}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};