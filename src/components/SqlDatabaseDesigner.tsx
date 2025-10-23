import { useState } from 'react';
import { Database, Plus, Trash2, Save, FileCode, Eye, EyeOff, Table as TableIcon, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FieldType = 'VARCHAR' | 'INT' | 'BIGINT' | 'TEXT' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'DECIMAL' | 'FLOAT';

interface Field {
  id: string;
  name: string;
  type: FieldType;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultValue: string;
}

interface DatabaseTable {
  id: string;
  name: string;
  fields: Field[];
  enableRLS: boolean;
}

export const SqlDatabaseDesigner = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [sqlText, setSqlText] = useState('');

  const addTable = () => {
    if (!newTableName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a table name',
        variant: 'destructive',
      });
      return;
    }

    const newTable: DatabaseTable = {
      id: Date.now().toString(),
      name: newTableName,
      fields: [
        {
          id: '1',
          name: 'id',
          type: 'INT',
          nullable: false,
          primaryKey: true,
          unique: true,
          defaultValue: 'AUTO_INCREMENT',
        },
        {
          id: '2',
          name: 'created_at',
          type: 'DATETIME',
          nullable: false,
          primaryKey: false,
          unique: false,
          defaultValue: 'CURRENT_TIMESTAMP',
        },
      ],
      enableRLS: false,
    };

    setTables([...tables, newTable]);
    setSelectedTable(newTable.id);
    setNewTableName('');

    toast({
      title: 'Success',
      description: `Table "${newTableName}" created`,
    });
  };

  const deleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
    if (selectedTable === tableId) {
      setSelectedTable(null);
    }
    toast({
      title: 'Success',
      description: 'Table deleted',
    });
  };

  const addField = () => {
    if (!selectedTable) return;

    const newField: Field = {
      id: Date.now().toString(),
      name: 'new_field',
      type: 'VARCHAR',
      nullable: true,
      primaryKey: false,
      unique: false,
      defaultValue: '',
    };

    setTables(tables.map(t => 
      t.id === selectedTable 
        ? { ...t, fields: [...t.fields, newField] }
        : t
    ));
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    if (!selectedTable) return;

    setTables(tables.map(t =>
      t.id === selectedTable
        ? {
            ...t,
            fields: t.fields.map(f =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          }
        : t
    ));
  };

  const deleteField = (fieldId: string) => {
    if (!selectedTable) return;

    setTables(tables.map(t =>
      t.id === selectedTable
        ? { ...t, fields: t.fields.filter(f => f.id !== fieldId) }
        : t
    ));
  };

  const toggleRLS = () => {
    if (!selectedTable) return;

    setTables(tables.map(t =>
      t.id === selectedTable
        ? { ...t, enableRLS: !t.enableRLS }
        : t
    ));
  };

  const generateSQL = () => {
    let sql = '-- Standard SQL Database Design\n-- Compatible with MySQL, PostgreSQL, SQLite, and other databases\n\n';

    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      
      table.fields.forEach((field, index) => {
        sql += `  ${field.name} ${field.type}`;
        
        if (field.type === 'VARCHAR' && !field.defaultValue.includes('(')) {
          sql = sql.replace(field.type, 'VARCHAR(255)');
        }
        
        if (field.primaryKey && field.defaultValue === 'AUTO_INCREMENT') {
          sql += ' AUTO_INCREMENT PRIMARY KEY';
        } else {
          if (field.primaryKey) sql += ' PRIMARY KEY';
          if (!field.nullable) sql += ' NOT NULL';
          if (field.unique && !field.primaryKey) sql += ' UNIQUE';
          if (field.defaultValue && field.defaultValue !== 'AUTO_INCREMENT') {
            sql += ` DEFAULT ${field.defaultValue}`;
          }
        }
        
        if (index < table.fields.length - 1) sql += ',';
        sql += '\n';
      });

      sql += ');\n\n';
    });

    return sql;
  };

  const exportSQL = () => {
    const sql = generateSQL();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-design-${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'SQL file exported successfully',
    });
  };

  const copyToClipboard = async () => {
    const sql = generateSQL();
    try {
      await navigator.clipboard.writeText(sql);
      toast({
        title: 'Copied!',
        description: 'SQL copied to clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy SQL to clipboard',
        variant: 'destructive',
      });
    }
  };

  const importSQL = () => {
    if (!sqlText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter SQL code to import',
        variant: 'destructive',
      });
      return;
    }

    try {
      const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
      const matches = [...sqlText.matchAll(createTableRegex)];
      
      const importedTables: DatabaseTable[] = matches.map((match, idx) => {
        const tableName = match[1];
        const fieldsText = match[2];
        
        const fieldLines = fieldsText.split(',').map(l => l.trim()).filter(l => l);
        const fields: Field[] = fieldLines.map((line, fieldIdx) => {
          const parts = line.split(/\s+/);
          const name = parts[0];
          const type = parts[1]?.toUpperCase() || 'VARCHAR';
          
          return {
            id: `${Date.now()}-${fieldIdx}`,
            name,
            type: type.includes('VARCHAR') ? 'VARCHAR' : 
                  type.includes('INT') ? 'INT' :
                  type.includes('TEXT') ? 'TEXT' :
                  type.includes('BOOLEAN') ? 'BOOLEAN' :
                  type.includes('DATE') ? 'DATE' :
                  type.includes('DECIMAL') ? 'DECIMAL' : 'VARCHAR',
            nullable: !line.includes('NOT NULL'),
            primaryKey: line.includes('PRIMARY KEY'),
            unique: line.includes('UNIQUE'),
            defaultValue: line.match(/DEFAULT\s+([^\s,]+)/)?.[1] || '',
          };
        });

        return {
          id: `${Date.now()}-${idx}`,
          name: tableName,
          fields,
          enableRLS: false,
        };
      });

      if (importedTables.length > 0) {
        setTables([...tables, ...importedTables]);
        setSqlText('');
        toast({
          title: 'Success',
          description: `Imported ${importedTables.length} table(s)`,
        });
      } else {
        toast({
          title: 'No tables found',
          description: 'No valid CREATE TABLE statements found in SQL',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to parse SQL. Please check the format.',
        variant: 'destructive',
      });
    }
  };

  const currentTable = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Designer
          </CardTitle>
          <CardDescription>
            Design standard SQL database tables with visual and SQL editors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="design" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Design View
              </TabsTrigger>
              <TabsTrigger value="sql" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                SQL View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tables List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Tables</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Table</DialogTitle>
                      <DialogDescription>Enter a name for your new table</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Table Name</Label>
                        <Input
                          placeholder="my_table"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addTable}>Create Table</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {tables.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tables yet. Create one to get started.</p>
              ) : (
                <div className="space-y-2">
                  {tables.map(table => (
                    <div
                      key={table.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTable === table.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        <span className="font-medium">{table.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTable(table.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Field Designer */}
            <div className="lg:col-span-3 space-y-4">
              {currentTable ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{currentTable.name}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={addField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Field Name</TableHead>
                            <TableHead className="w-[150px]">Data Type</TableHead>
                            <TableHead className="w-[100px]">Nullable</TableHead>
                            <TableHead className="w-[100px]">Primary Key</TableHead>
                            <TableHead className="w-[100px]">Unique</TableHead>
                            <TableHead>Default Value</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTable.fields.map(field => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Input
                                  value={field.name}
                                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={field.type}
                                  onValueChange={(value) => updateField(field.id, { type: value as FieldType })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="VARCHAR">VARCHAR</SelectItem>
                                    <SelectItem value="TEXT">TEXT</SelectItem>
                                    <SelectItem value="INT">INT</SelectItem>
                                    <SelectItem value="BIGINT">BIGINT</SelectItem>
                                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                                    <SelectItem value="DATE">DATE</SelectItem>
                                    <SelectItem value="DATETIME">DATETIME</SelectItem>
                                    <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                                    <SelectItem value="FLOAT">FLOAT</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={field.nullable}
                                  onCheckedChange={(checked) => updateField(field.id, { nullable: checked as boolean })}
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={field.primaryKey}
                                  onCheckedChange={(checked) => updateField(field.id, { primaryKey: checked as boolean })}
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={field.unique}
                                  onCheckedChange={(checked) => updateField(field.id, { unique: checked as boolean })}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={field.defaultValue}
                                  onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                                  placeholder="CURRENT_TIMESTAMP, NULL, 0, etc."
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteField(field.id)}
                                  disabled={field.primaryKey}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <TableIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Select a table to design its structure</p>
                  </div>
                </div>
              )}
            </div>
          </div>
            </TabsContent>

            <TabsContent value="sql" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SQL Editor</CardTitle>
                  <CardDescription>
                    Write or paste SQL CREATE TABLE statements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={sqlText}
                    onChange={(e) => setSqlText(e.target.value)}
                    placeholder="CREATE TABLE example (&#10;  id INT AUTO_INCREMENT PRIMARY KEY,&#10;  name VARCHAR(255) NOT NULL,&#10;  created_at DATETIME DEFAULT CURRENT_TIMESTAMP&#10;);"
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={importSQL}>
                      <Database className="h-4 w-4 mr-2" />
                      Import SQL
                    </Button>
                    <Button onClick={() => setSqlText(generateSQL())} variant="outline">
                      <Code className="h-4 w-4 mr-2" />
                      Load from Design
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={copyToClipboard} className="w-full" variant="outline">
                    <FileCode className="h-4 w-4 mr-2" />
                    Copy SQL to Clipboard
                  </Button>
                  <Button onClick={exportSQL} className="w-full" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Download SQL File
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="text-base">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• This designer creates standard SQL compatible with MySQL, PostgreSQL, SQLite, and more</p>
          <p>• Use the SQL View tab to write custom SQL or import existing table definitions</p>
          <p>• AUTO_INCREMENT is supported for primary keys (MySQL style)</p>
        </CardContent>
      </Card>
    </div>
  );
};
