import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table2, Database } from 'lucide-react';
import { StockItem, StockItemInput } from '@/hooks/useStocks';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StockEditDialogProps {
  stock: StockItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stockId: string, updates: Partial<StockItemInput>) => Promise<void>;
}

type StockStatus = 'available' | 'missing' | 'contaminated' | 'shipped' | 'pending';

export const StockEditDialog = ({ stock, open, onOpenChange, onSave }: StockEditDialogProps) => {
  const [editedStock, setEditedStock] = useState<Partial<StockItemInput>>({});

  if (!stock) return null;

  const handleSave = async () => {
    await onSave(stock.id, editedStock);
    setEditedStock({});
    onOpenChange(false);
  };

  const getValue = (key: keyof StockItemInput) => {
    return editedStock[key] !== undefined ? editedStock[key] : stock[key];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stock Item</DialogTitle>
          <DialogDescription>
            Choose between spreadsheet or database view to edit stock information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="spreadsheet" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Spreadsheet View
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spreadsheet" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input
                  value={getValue('batchNumber') as string}
                  onChange={(e) => setEditedStock({ ...editedStock, batchNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Number</Label>
                <Input
                  value={getValue('stockNumber') as string}
                  onChange={(e) => setEditedStock({ ...editedStock, stockNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={getValue('quantity') as number}
                  onChange={(e) => setEditedStock({ ...editedStock, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={(getValue('status') as StockStatus) || 'available'}
                  onValueChange={(value) => setEditedStock({ ...editedStock, status: value as StockStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="contaminated">Contaminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={getValue('description') as string}
                  onChange={(e) => setEditedStock({ ...editedStock, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Field</th>
                    <th className="text-left p-3 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">batch_number</td>
                    <td className="p-3">
                      <Input
                        value={getValue('batchNumber') as string}
                        onChange={(e) => setEditedStock({ ...editedStock, batchNumber: e.target.value })}
                        className="h-8"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">stock_number</td>
                    <td className="p-3">
                      <Input
                        value={getValue('stockNumber') as string}
                        onChange={(e) => setEditedStock({ ...editedStock, stockNumber: e.target.value })}
                        className="h-8"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">quantity</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={getValue('quantity') as number}
                        onChange={(e) => setEditedStock({ ...editedStock, quantity: Number(e.target.value) })}
                        className="h-8"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">status</td>
                    <td className="p-3">
                      <Select
                        value={(getValue('status') as StockStatus) || 'available'}
                        onValueChange={(value) => setEditedStock({ ...editedStock, status: value as StockStatus })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">available</SelectItem>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="shipped">shipped</SelectItem>
                          <SelectItem value="missing">missing</SelectItem>
                          <SelectItem value="contaminated">contaminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">description</td>
                    <td className="p-3">
                      <Textarea
                        value={getValue('description') as string}
                        onChange={(e) => setEditedStock({ ...editedStock, description: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                    </td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-3 font-medium text-muted-foreground">id</td>
                    <td className="p-3 text-muted-foreground text-sm font-mono">{stock.id}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-3 font-medium text-muted-foreground">date_added</td>
                    <td className="p-3 text-muted-foreground text-sm">{new Date(stock.dateAdded).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
