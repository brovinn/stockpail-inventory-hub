import { useState, useEffect } from 'react';
import { FileText, Save, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDocuments, type Document } from '@/hooks/useDocuments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const DocumentEditor = () => {
  const { toast } = useToast();
  const { documents, loading } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (selectedDoc?.parsed_data) {
      // Extract text content from parsed data
      const content = selectedDoc.parsed_data.content || 
                     JSON.stringify(selectedDoc.parsed_data.data || selectedDoc.parsed_data, null, 2);
      setEditedContent(content);
    }
  }, [selectedDoc]);

  const handleSave = (format: 'txt' | 'doc' | 'pdf') => {
    if (!selectedDoc) return;

    let blob: Blob;
    let fileName: string;
    const baseName = selectedDoc.file_name.replace(/\.[^/.]+$/, '');

    if (format === 'txt') {
      blob = new Blob([editedContent], { type: 'text/plain' });
      fileName = `${baseName}-edited.txt`;
    } else if (format === 'doc') {
      // Create a simple Word-compatible HTML format
      const docContent = `<html><head><meta charset="utf-8"/></head><body>${editedContent.replace(/\n/g, '<br/>')}</body></html>`;
      blob = new Blob([docContent], { type: 'application/msword' });
      fileName = `${baseName}-edited.doc`;
    } else {
      // For PDF, we'll create HTML (browsers can save as PDF)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>${baseName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body><pre>${editedContent}</pre></body>
        </html>
      `;
      blob = new Blob([htmlContent], { type: 'text/html' });
      fileName = `${baseName}-edited.html`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Saved Locally',
      description: `Document saved to your device as ${format.toUpperCase()}`,
    });
  };

  const getDocumentPreview = (doc: Document) => {
    if (!doc.parsed_data) return 'No content available';
    
    if (typeof doc.parsed_data === 'string') return doc.parsed_data;
    
    const content = doc.parsed_data.content || 
                   JSON.stringify(doc.parsed_data.data || doc.parsed_data, null, 2);
    
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  };

  const editableDocuments = documents.filter(doc => 
    doc.processed && doc.file_type && 
    ['csv', 'text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].some(type => 
      doc.file_type.includes(type) || doc.file_name.toLowerCase().endsWith('.csv') || 
      doc.file_name.toLowerCase().endsWith('.pdf') || doc.file_name.toLowerCase().endsWith('.docx')
    )
  );

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-professional-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Editor
          </CardTitle>
          <CardDescription>
            View and edit your imported documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editableDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No processed documents available to edit</p>
              <p className="text-sm text-muted-foreground mt-2">Upload and process documents first</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Document List */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm mb-3">Select Document</h3>
                <div className="space-y-2 max-h-[500px] overflow-auto">
                  {editableDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getDocumentPreview(doc)}
                            </p>
                          </div>
                          {doc.category && (
                            <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-2">
                {selectedDoc ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{selectedDoc.file_name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant={viewMode === 'edit' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('edit')}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={viewMode === 'preview' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('preview')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {viewMode === 'edit' ? (
                        <>
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="font-mono min-h-[400px]"
                            placeholder="Document content will appear here..."
                          />
                          <div className="flex gap-2 flex-wrap">
                            <Button onClick={() => handleSave('txt')} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Save as TXT
                            </Button>
                            <Button onClick={() => handleSave('doc')} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Save as DOC
                            </Button>
                            <Button onClick={() => handleSave('pdf')} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Save as HTML/PDF
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="border rounded-lg p-4 min-h-[400px] bg-muted/50">
                          <pre className="whitespace-pre-wrap text-sm">{editedContent}</pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Select a document to edit</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
