import { useState, useEffect } from 'react';
import { Table, FileSpreadsheet, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CellData {
  row: number;
  col: number;
  value: string;
}

export const SpreadsheetEditor = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(6);
  const [data, setData] = useState<CellData[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    // Initialize empty data
    const initialData: CellData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initialData.push({ row: r, col: c, value: '' });
      }
    }
    setData(initialData);
  }, [rows, cols]);

  const getCellValue = (row: number, col: number) => {
    const cell = data.find(d => d.row === row && d.col === col);
    return cell?.value || '';
  };

  const updateCell = (row: number, col: number, value: string) => {
    setData(prev => {
      const existing = prev.find(d => d.row === row && d.col === col);
      if (existing) {
        return prev.map(d => 
          d.row === row && d.col === col ? { ...d, value } : d
        );
      }
      return [...prev, { row, col, value }];
    });
  };

  const getColumnLabel = (col: number) => {
    return String.fromCharCode(65 + col);
  };

  const handleExportCSV = () => {
    const csv: string[] = [];
    for (let r = 0; r < rows; r++) {
      const rowData: string[] = [];
      for (let c = 0; c < cols; c++) {
        rowData.push(getCellValue(r, c));
      }
      csv.push(rowData.join(','));
    }

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Saved Locally',
      description: 'Spreadsheet saved to your device as CSV',
    });
  };

  const handleExportExcel = () => {
    // Create a simple Excel-compatible format
    let excel = '<html><head><meta charset="utf-8"/></head><body><table>';
    for (let r = 0; r < rows; r++) {
      excel += '<tr>';
      for (let c = 0; c < cols; c++) {
        excel += `<td>${getCellValue(r, c)}</td>`;
      }
      excel += '</tr>';
    }
    excel += '</table></body></html>';

    const blob = new Blob([excel], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet-${Date.now()}.xls`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Saved Locally',
      description: 'Spreadsheet saved to your device as Excel',
    });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n');
    const newData: CellData[] = [];

    lines.forEach((line, rowIndex) => {
      const values = line.split(',');
      values.forEach((value, colIndex) => {
        newData.push({
          row: rowIndex,
          col: colIndex,
          value: value.trim()
        });
      });
    });

    setRows(Math.max(lines.length, 10));
    setCols(Math.max(lines[0]?.split(',').length || 6, 6));
    setData(newData);

    toast({
      title: 'Success',
      description: 'CSV imported successfully',
    });

    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Spreadsheet Editor
          </CardTitle>
          <CardDescription>
            Create and edit spreadsheets, import/export CSV files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Save as CSV
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Save as Excel
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </span>
              </Button>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>

          <div className="border rounded-lg overflow-auto max-h-[600px]">
            <TableUI>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 bg-muted">#</TableHead>
                  {Array.from({ length: cols }).map((_, i) => (
                    <TableHead key={i} className="bg-muted text-center min-w-[120px]">
                      {getColumnLabel(i)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="bg-muted font-medium text-center">
                      {rowIndex + 1}
                    </TableCell>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                      <TableCell key={colIndex} className="p-0">
                        <Input
                          value={getCellValue(rowIndex, colIndex)}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          className={`border-0 rounded-none h-10 ${
                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </TableUI>
          </div>

          <div className="flex gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 10))}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Columns:</span>
              <Input
                type="number"
                min="1"
                max="26"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(26, parseInt(e.target.value) || 6)))}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
