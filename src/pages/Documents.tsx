import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { DataImportExport } from '@/components/DataImportExport';
import { SqlDatabaseDesigner } from '@/components/SqlDatabaseDesigner';
import { SpreadsheetEditor } from '@/components/SpreadsheetEditor';
import { DocumentEditor } from '@/components/DocumentEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Database, Table, FileSpreadsheet, Edit } from 'lucide-react';

const Documents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Management</h1>
        <p className="text-muted-foreground">
          Upload, manage, and import data from documents
        </p>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Spreadsheet
          </TabsTrigger>
          <TabsTrigger value="sql" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            SQL Designer
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DocumentUpload />
            </div>
            <div className="lg:col-span-2">
              <DocumentList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor">
          <DocumentEditor />
        </TabsContent>

        <TabsContent value="spreadsheet">
          <SpreadsheetEditor />
        </TabsContent>

        <TabsContent value="sql">
          <SqlDatabaseDesigner />
        </TabsContent>

        <TabsContent value="import-export">
          <DataImportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;