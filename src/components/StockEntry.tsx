import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus } from "lucide-react";

interface StockItem {
  id: string;
  batchNumber: string;
  stockNumber: string;
  description: string;
  quantity: number;
  dateAdded: string;
}

interface StockEntryProps {
  onAddStock: (stock: Omit<StockItem, 'id' | 'dateAdded'>) => Promise<StockItem>;
}

export const StockEntry = ({ onAddStock }: StockEntryProps) => {
  const [formData, setFormData] = useState({
    batchNumber: "",
    stockNumber: "",
    description: "",
    quantity: 0,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.batchNumber || !formData.stockNumber) {
      toast({
        title: "Required fields missing",
        description: "Please fill in both batch number and stock number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAddStock({
        batchNumber: formData.batchNumber,
        stockNumber: formData.stockNumber,
        description: formData.description,
        quantity: formData.quantity,
      });
      
      setFormData({
        batchNumber: "",
        stockNumber: "",
        description: "",
        quantity: 0,
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-gradient-card shadow-professional-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Add New Stock Item</CardTitle>
        </div>
        <CardDescription>
          Enter stock details to add to your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                placeholder="e.g. BT2024001"
                className="focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number *</Label>
              <Input
                id="stockNumber"
                value={formData.stockNumber}
                onChange={(e) => handleInputChange("stockNumber", e.target.value)}
                placeholder="e.g. SK-12345"
                className="focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="focus:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description or notes"
              className="focus:ring-primary resize-none"
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 shadow-professional-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stock Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};