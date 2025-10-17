import { useState } from 'react';
import { Upload, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/hooks/useDocuments';

export const DocumentUpload = () => {
  const { uploadDocument } = useDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(30);

    await uploadDocument(selectedFile, category, description);

    setUploadProgress(100);
    setTimeout(() => {
      setSelectedFile(null);
      setCategory('');
      setDescription('');
      setUploading(false);
      setUploadProgress(0);
    }, 1000);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <Image className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <Card className="bg-gradient-card shadow-professional-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload PDFs, Excel files, CSV, or images (Max 50MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
            {getFileIcon(selectedFile.name)}
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">Category (Optional)</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Invoice, Report, Contract"
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this document..."
            disabled={uploading}
            rows={3}
          />
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-xs text-center text-muted-foreground">
              Uploading and processing...
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  );
};