import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStocks } from '@/hooks/useStocks';

export const DataImportExport = () => {
  const { stocks, addStock } = useStocks();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);

  const handleExportCSV = () => {
    if (stocks.length === 0) {
      toast({
        title: 'No data',
        description: 'No stock data to export',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const headers = ['Batch Number', 'Stock Number', 'Description', 'Quantity', 'Date Added'];
    const rows = stocks.map((stock) => [
      stock.batchNumber,
      stock.stockNumber,
      stock.description,
      stock.quantity,
      new Date(stock.dateAdded).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `Exported ${stocks.length} stock items`,
    });
  };

  const handleExportJSON = () => {
    if (stocks.length === 0) {
      toast({
        title: 'No data',
        description: 'No stock data to export',
        variant: 'destructive',
      });
      return;
    }

    const jsonContent = JSON.stringify(stocks, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `Exported ${stocks.length} stock items`,
    });
  };

  const handleImportCSV = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'No data',
        description: 'Please paste CSV data to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

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

      const mappedHeaders = headers.map((h) => headerMap[h] || h);

      if (!mappedHeaders.includes('batchNumber') || !mappedHeaders.includes('stockNumber')) {
        toast({
          title: 'Invalid format',
          description: 'CSV must contain batch_number and stock_number columns',
          variant: 'destructive',
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

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
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Error importing row ${i}:`, error);
        }
      }

      toast({
        title: 'Import complete',
        description: `Imported ${successCount} items. ${failCount} failed.`,
      });

      if (successCount > 0) {
        setCsvData('');
      }
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Export Section */}
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your stock data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExportCSV} className="w-full" variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
          <Button onClick={handleExportJSON} className="w-full" variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            {stocks.length} stock items available for export
          </p>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import stock data from CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvImport">CSV Data</Label>
            <p className="text-xs text-muted-foreground">
              Paste CSV with headers: batch_number, stock_number, description, quantity
            </p>
            <Textarea
              id="csvImport"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="batch_number,stock_number,description,quantity&#10;BT001,SK001,Sample Item,50"
              rows={6}
              className="font-mono text-sm"
              disabled={importing}
            />
          </div>
          <Button onClick={handleImportCSV} className="w-full" disabled={importing}>
            {importing ? 'Importing...' : 'Import CSV Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};