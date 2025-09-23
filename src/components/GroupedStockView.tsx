import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StockItem, StockItemInput } from "@/hooks/useStocks";
import { 
  ChevronDown, 
  ChevronRight, 
  Package2, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye 
} from "lucide-react";

interface GroupedStockViewProps {
  stocks: StockItem[];
  groupBy: 'stock' | 'batch';
  onUpdateStock?: (stockId: string, updatedStock: Partial<Omit<StockItemInput, 'id' | 'created_at' | 'updated_at' | 'date_added'>>) => Promise<void>;
  onDeleteStock?: (stockId: string) => Promise<void>;
}

interface GroupedData {
  [key: string]: {
    items: StockItem[];
    totalQuantity: number;
    itemCount: number;
  };
}

export const GroupedStockView = ({ 
  stocks, 
  groupBy, 
  onUpdateStock, 
  onDeleteStock 
}: GroupedStockViewProps) => {
  const { toast } = useToast();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group stocks by the specified field
  const groupedStocks: GroupedData = stocks.reduce((groups, stock) => {
    const groupKey = groupBy === 'stock' ? stock.stock_number : stock.batch_number;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        items: [],
        totalQuantity: 0,
        itemCount: 0
      };
    }
    
    groups[groupKey].items.push(stock);
    groups[groupKey].totalQuantity += stock.quantity;
    groups[groupKey].itemCount += 1;
    
    return groups;
  }, {} as GroupedData);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleStockAction = (action: string, stock: StockItem) => {
    switch (action) {
      case "view":
        toast({
          title: "Stock Details",
          description: `Viewing details for ${stock.stock_number}`,
        });
        break;
      case "edit":
        toast({
          title: "Edit Stock",
          description: `Opening editor for ${stock.stock_number}`,
        });
        if (onUpdateStock) {
          const updatedQuantity = prompt(`Enter new quantity for ${stock.stock_number}:`, stock.quantity.toString());
          if (updatedQuantity !== null && !isNaN(Number(updatedQuantity))) {
            onUpdateStock(stock.id, { quantity: Number(updatedQuantity) });
            toast({
              title: "Stock Updated",
              description: `Quantity updated for ${stock.stock_number}`,
            });
          }
        }
        break;
      case "delete":
        if (onDeleteStock && confirm(`Are you sure you want to delete stock item ${stock.stock_number}?`)) {
          onDeleteStock(stock.id);
          toast({
            title: "Stock Deleted",
            description: `${stock.stock_number} has been removed from inventory`,
            variant: "destructive",
          });
        }
        break;
    }
  };

  const getQuantityBadgeVariant = (quantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity < 10) return "secondary";
    return "default";
  };

  if (Object.keys(groupedStocks).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No stock items to group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedStocks)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupKey, groupData]) => {
          const isExpanded = expandedGroups.has(groupKey);
          
          return (
            <Card key={groupKey} className="border-l-4 border-l-primary">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {groupBy === 'stock' ? 'Stock' : 'Batch'}: {groupKey}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="secondary">
                          {groupData.itemCount} item{groupData.itemCount !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline">
                          Total: {groupData.totalQuantity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left p-3 font-semibold">
                            {groupBy === 'stock' ? 'Batch Number' : 'Stock Number'}
                          </th>
                          <th className="text-left p-3 font-semibold">Description</th>
                          <th className="text-left p-3 font-semibold">Quantity</th>
                          <th className="text-left p-3 font-semibold">Date Added</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupData.items
                          .sort((a, b) => b.date_added.localeCompare(a.date_added))
                          .map((stock) => (
                          <tr key={stock.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-mono text-sm font-semibold text-primary">
                                {groupBy === 'stock' ? stock.batch_number : stock.stock_number}
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
                                {new Date(stock.date_added).toLocaleDateString()}
                              </div>
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
                </CardContent>
              )}
            </Card>
          );
        })}
    </div>
  );
};