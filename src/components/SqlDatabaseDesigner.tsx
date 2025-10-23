import { useState } from 'react';
import { Database, Plus, Trash2, Save, FileCode, Eye, Table as TableIcon, Rocket } from 'lucide-react';
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

type FieldType = 'TEXT' | 'INTEGER' | 'UUID' | 'BOOLEAN' | 'TIMESTAMP' | 'JSONB' | 'NUMERIC';

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
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [newTableName, setNewTableName] = useState('');

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
          type: 'UUID',
          nullable: false,
          primaryKey: true,
          unique: true,
          defaultValue: 'gen_random_uuid()',
        },
        {
          id: '2',
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          primaryKey: false,
          unique: false,
          defaultValue: 'now()',
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
      type: 'TEXT',
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
    let sql = '';

    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      
      table.fields.forEach((field, index) => {
        sql += `  ${field.name} ${field.type}`;
        
        if (field.primaryKey) sql += ' PRIMARY KEY';
        if (!field.nullable) sql += ' NOT NULL';
        if (field.unique && !field.primaryKey) sql += ' UNIQUE';
        if (field.defaultValue) sql += ` DEFAULT ${field.defaultValue}`;
        
        if (index < table.fields.length - 1) sql += ',';
        sql += '\n';
      });

      sql += ');\n\n';

      if (table.enableRLS) {
        sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;
      }
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
        description: 'SQL copied to clipboard. Now paste it in Supabase SQL Editor.',
      });
      
      // Open Supabase SQL Editor in new tab
      window.open('https://supabase.com/dashboard/project/enfadxolrysdhjumusjk/sql/new', '_blank');
    } catch (error) {
      console.error('Failed to copy:', error);
      exportSQL();
    }
  };

  const currentTable = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Visual Database Designer
          </CardTitle>
          <CardDescription>
            Design your database tables visually - Microsoft Access style
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Button size="sm" variant="outline" onClick={() => setShowSqlPreview(!showSqlPreview)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {showSqlPreview ? 'Hide' : 'Show'} SQL
                      </Button>
                    </div>
                  </div>

                  {showSqlPreview && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Generated SQL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[300px]">
                          {generateSQL()}
                        </pre>
                        <div className="flex gap-2 flex-wrap mt-4">
                          <Button onClick={copyToClipboard}>
                            <Rocket className="h-4 w-4 mr-2" />
                            Create in Database
                          </Button>
                          <Button onClick={exportSQL} variant="outline">
                            <Save className="h-4 w-4 mr-2" />
                            Save SQL Locally
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Click "Create in Database" to copy SQL and open Supabase SQL Editor
                        </p>
                      </CardContent>
                    </Card>
                  )}

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
                                    <SelectItem value="TEXT">TEXT</SelectItem>
                                    <SelectItem value="INTEGER">INTEGER</SelectItem>
                                    <SelectItem value="UUID">UUID</SelectItem>
                                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                                    <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                                    <SelectItem value="JSONB">JSONB</SelectItem>
                                    <SelectItem value="NUMERIC">NUMERIC</SelectItem>
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
                                  placeholder="now(), gen_random_uuid(), etc."
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rls"
                          checked={currentTable.enableRLS}
                          onCheckedChange={toggleRLS}
                        />
                        <Label htmlFor="rls" className="cursor-pointer">
                          Enable Row Level Security (RLS)
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Recommended for tables containing user data
                      </p>
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
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="text-base">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Export your SQL and execute it through the Supabase Dashboard SQL Editor</p>
          <p>• Always enable RLS (Row Level Security) on tables containing user data</p>
          <p>• Primary key fields are automatically NOT NULL and UNIQUE</p>
          <p>• Use UUID type with gen_random_uuid() default for primary keys</p>
        </CardContent>
      </Card>
    </div>
  );
};
