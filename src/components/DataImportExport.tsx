import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStocks } from '@/hooks/useStocks';
import * as XLSX from 'xlsx';

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

  const handleExportExcel = () => {
    if (stocks.length === 0) {
      toast({
        title: 'No data',
        description: 'No stock data to export',
        variant: 'destructive',
      });
      return;
    }

    const worksheetData = stocks.map((stock) => ({
      'Batch Number': stock.batchNumber,
      'Stock Number': stock.stockNumber,
      'Description': stock.description,
      'Quantity': stock.quantity,
      'Date Added': new Date(stock.dateAdded).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Data');
    XLSX.writeFile(workbook, `stock-export-${Date.now()}.xlsx`);

    toast({
      title: 'Success',
      description: `Exported ${stocks.length} stock items`,
    });
  };

  const handleExportSQL = () => {
    if (stocks.length === 0) {
      toast({
        title: 'No data',
        description: 'No stock data to export',
        variant: 'destructive',
      });
      return;
    }

    let sql = '-- Stock Data Export\n\n';
    sql += 'CREATE TABLE IF NOT EXISTS stocks (\n';
    sql += '  id VARCHAR(36) PRIMARY KEY,\n';
    sql += '  batch_number VARCHAR(255) NOT NULL,\n';
    sql += '  stock_number VARCHAR(255) NOT NULL,\n';
    sql += '  description TEXT,\n';
    sql += '  quantity INTEGER DEFAULT 0,\n';
    sql += '  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n';
    sql += ');\n\n';

    stocks.forEach((stock) => {
      const dateAdded = new Date(stock.dateAdded).toISOString();
      
      sql += `INSERT INTO stocks (id, batch_number, stock_number, description, quantity, date_added) VALUES `;
      sql += `('${stock.id}', '${stock.batchNumber.replace(/'/g, "''")}', '${stock.stockNumber.replace(/'/g, "''")}', '${stock.description.replace(/'/g, "''")}', ${stock.quantity}, '${dateAdded}');\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-export-${Date.now()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `Exported ${stocks.length} stock items as SQL`,
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
              status: 'available',
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

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let failCount = 0;

      for (const row of jsonData as any[]) {
        try {
          const batchNumber = row['Batch Number'] || row['batch_number'] || row['Batch'] || '';
          const stockNumber = row['Stock Number'] || row['stock_number'] || row['Stock'] || '';
          const description = row['Description'] || row['description'] || '';
          const quantity = parseInt(row['Quantity'] || row['quantity'] || '0');

          if (batchNumber && stockNumber) {
            await addStock({
              batchNumber,
              stockNumber,
              description,
              quantity,
              status: 'available',
            });
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error('Error importing row:', error);
        }
      }

      toast({
        title: 'Import complete',
        description: `Imported ${successCount} items. ${failCount} failed.`,
      });

      e.target.value = '';
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
          <Button onClick={handleExportExcel} className="w-full" variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as Excel
          </Button>
          <Button onClick={handleExportJSON} className="w-full" variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
          <Button onClick={handleExportSQL} className="w-full" variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Export as SQL
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

          <div className="space-y-2">
            <Label htmlFor="excelImport">Excel File</Label>
            <p className="text-xs text-muted-foreground">
              Upload .xlsx or .xls file with columns: Batch Number, Stock Number, Description, Quantity
            </p>
            <Input
              id="excelImport"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              disabled={importing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};