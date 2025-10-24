import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DatabaseTableViewer = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch database records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  if (loading && stocks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading database records...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-professional-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Table Viewer
            </CardTitle>
            <CardDescription>
              View actual records from the stocks table (showing last 50 records)
            </CardDescription>
          </div>
          <Button onClick={fetchStocks} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No records found in the database</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Stock Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-mono text-xs">{stock.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-semibold">{stock.batch_number}</TableCell>
                    <TableCell className="font-semibold">{stock.stock_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{stock.description}</TableCell>
                    <TableCell>{stock.quantity}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stock.status === 'available' ? 'bg-green-500/10 text-green-600' :
                        stock.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                        stock.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' :
                        stock.status === 'missing' ? 'bg-red-500/10 text-red-600' :
                        stock.status === 'contaminated' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {stock.status || 'available'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(stock.date_added).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs">{new Date(stock.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
