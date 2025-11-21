import { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Document } from '@/hooks/useDocuments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const getFileUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        setFileUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!document || !fileUrl) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext || '')) return 'text';
    if (['xlsx', 'xls', 'doc', 'docx', 'ppt', 'pptx'].includes(ext || '')) return 'office';
    return 'unknown';
  };

  const renderContent = () => {
    if (!document || !fileUrl) return null;

    const fileType = getFileType(document.file_name);

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[70vh] border rounded-md"
            title={document.file_name}
          />
        );
      case 'image':
        return (
          <img
            src={fileUrl}
            alt={document.file_name}
            className="w-full h-auto max-h-[70vh] object-contain rounded-md"
          />
        );
      case 'text':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[70vh] border rounded-md bg-background"
            title={document.file_name}
          />
        );
      case 'office':
        return (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              Preview not available for this file type
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        );
      default:
        return (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              Unable to preview this file type
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setFileUrl(null);
        } else if (document) {
          getFileUrl(document.file_path);
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{document?.file_name}</span>
          </DialogTitle>
          {document?.description && (
            <DialogDescription>{document.description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!fileUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {fileUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            )}
          </div>
          
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
