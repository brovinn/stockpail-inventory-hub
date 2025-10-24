import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StockStatus = 'available' | 'pending' | 'shipped' | 'missing' | 'contaminated';

export interface StockItem {
  id: string;
  batchNumber: string;
  stockNumber: string;
  description: string;
  quantity: number;
  status: StockStatus;
  dateAdded: string;
}

export type StockItemInput = Omit<StockItem, 'id' | 'dateAdded'>;

// Database type (snake_case)
interface DatabaseStock {
  id: string;
  batch_number: string;
  stock_number: string;
  description: string;
  quantity: number;
  status?: StockStatus;
  date_added: string;
}

// Convert database format to frontend format
const dbToFrontend = (dbStock: DatabaseStock): StockItem => ({
  id: dbStock.id,
  batchNumber: dbStock.batch_number,
  stockNumber: dbStock.stock_number,
  description: dbStock.description,
  quantity: dbStock.quantity,
  status: dbStock.status || 'available',
  dateAdded: dbStock.date_added,
});

// Convert frontend format to database format
const frontendToDb = (stock: Omit<StockItem, 'id'>): Omit<DatabaseStock, 'id' | 'date_added'> => ({
  batch_number: stock.batchNumber,
  stock_number: stock.stockNumber,
  description: stock.description,
  quantity: stock.quantity,
  status: stock.status,
});

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all stocks
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedStocks = data?.map(dbToFrontend) || [];
      setStocks(formattedStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new stock
  const addStock = async (newStock: Omit<StockItem, 'id' | 'dateAdded'>) => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .insert([frontendToDb(newStock as Omit<StockItem, 'id'>)])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const formattedStock = dbToFrontend(data);
      setStocks(prev => [formattedStock, ...prev]);
      
      toast({
        title: "Success",
        description: "Stock item added successfully",
      });

      return formattedStock;
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock item",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update stock
  const updateStock = async (stockId: string, updates: Partial<StockItemInput>): Promise<void> => {
    try {
      const dbUpdates: any = {};
      if (updates.batchNumber !== undefined) dbUpdates.batch_number = updates.batchNumber;
      if (updates.stockNumber !== undefined) dbUpdates.stock_number = updates.stockNumber;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('stocks')
        .update(dbUpdates)
        .eq('id', stockId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const formattedStock = dbToFrontend(data);
      setStocks(prev => prev.map(stock => 
        stock.id === stockId ? formattedStock : stock
      ));

      toast({
        title: "Success",
        description: "Stock item updated successfully",
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock item",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete stock
  const deleteStock = async (stockId: string) => {
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', stockId);

      if (error) {
        throw error;
      }

      setStocks(prev => prev.filter(stock => stock.id !== stockId));
      
      toast({
        title: "Success",
        description: "Stock item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast({
        title: "Error",
        description: "Failed to delete stock item",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Load stocks on mount
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