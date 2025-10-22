import { useState } from 'react';
import { Database, Play, Save, FileCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SqlDatabaseDesigner = () => {
  const { toast } = useToast();
  const [sqlQuery, setSqlQuery] = useState('-- Design your database tables here\n-- Example:\n-- CREATE TABLE my_table (\n--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n--   name TEXT NOT NULL,\n--   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()\n-- );');

  const handleExecute = () => {
    // Open Supabase SQL editor in new tab
    const projectId = 'enfadxolrysdhjumusjk';
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
    
    toast({
      title: 'Opening SQL Editor',
      description: 'Execute your queries safely in the Supabase dashboard',
    });
  };

  const handleSave = () => {
    const blob = new Blob([sqlQuery], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-design-${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'SQL file saved successfully',
    });
  };

  const templates = [
    {
      name: 'Basic Table',
      sql: `CREATE TABLE example_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger to update updated_at
CREATE TRIGGER update_example_table_updated_at
  BEFORE UPDATE ON example_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`
    },
    {
      name: 'Table with RLS',
      sql: `CREATE TABLE user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view own data"
  ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);`
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Database Designer
          </CardTitle>
          <CardDescription>
            Design and manage your database tables with SQL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList>
              <TabsTrigger value="editor">SQL Editor</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="font-mono min-h-[400px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExecute}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Open in Supabase SQL Editor
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save SQL
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4">
                {templates.map((template, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-sm mb-3 overflow-auto">
                        {template.sql}
                      </pre>
                      <Button
                        onClick={() => setSqlQuery(template.sql)}
                        variant="outline"
                        size="sm"
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="text-base">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• For security, schema modifications (CREATE, ALTER, DROP) should be done through Supabase Dashboard</p>
          <p>• Use the SQL editor in Supabase for executing DDL statements</p>
          <p>• Always enable RLS (Row Level Security) on tables containing user data</p>
          <p>• Test your queries before running them on production data</p>
        </CardContent>
      </Card>
    </div>
  );
};
