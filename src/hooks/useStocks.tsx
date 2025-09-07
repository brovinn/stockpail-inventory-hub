import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StockItem {
  id: string;
  batch_number: string;
  stock_number: string;
  description: string;
  quantity: number;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface StockItemInput {
  batch_number: string;
  stock_number: string;
  description: string;
  quantity: number;
}

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all stocks
  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;
      
      setStocks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching stocks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new stock
  const addStock = async (stockData: StockItemInput): Promise<StockItem> => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .insert([stockData])
        .select()
        .single();

      if (error) throw error;

      const newStock = data as StockItem;
      setStocks(prev => [newStock, ...prev]);
      
      toast({
        title: "Stock added successfully",
        description: `Added ${stockData.stock_number} to inventory`,
      });

      return newStock;
    } catch (error: any) {
      toast({
        title: "Error adding stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update stock
  const updateStock = async (id: string, updates: Partial<StockItemInput>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedStock = data as StockItem;
      setStocks(prev => prev.map(stock => 
        stock.id === id ? updatedStock : stock
      ));

      toast({
        title: "Stock updated successfully",
        description: `Updated ${updatedStock.stock_number}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete stock
  const deleteStock = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStocks(prev => prev.filter(stock => stock.id !== id));

      toast({
        title: "Stock deleted successfully",
        description: "Stock item has been removed from inventory",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return {
    stocks,
    loading,
    addStock,
    updateStock,
    deleteStock,
    refetch: fetchStocks,
  };
};