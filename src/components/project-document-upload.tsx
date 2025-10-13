'use client';

import { useState } from 'react';
import { IconUpload, IconFile, IconX, IconEye } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  isLatest: boolean;
  tags: string[];
  fileSize: number;
  mimeType: string;
}

interface ProjectDocumentUploadProps {
  projectId: string;
  documents: ProjectDocument[];
  onDocumentUploaded?: () => void;
}

const documentTypes = [
  { value: 'audit_report', label: 'Audit Report' },
  { value: 'remediation_plan', label: 'Remediation Plan' },
  { value: 'test_results', label: 'Test Results' },
  { value: 'compliance_certificate', label: 'Compliance Certificate' },
  { value: 'meeting_notes', label: 'Meeting Notes' },
  { value: 'vpat', label: 'VPAT' },
  { value: 'other', label: 'Other' }
];

export function ProjectDocumentUpload({
  projectId,
  documents,
  onDocumentUploaded
}: ProjectDocumentUploadProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [documentTags, setDocumentTags] = useState<string>('');
  const [documentNotes, setDocumentNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !documentName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentName);
      formData.append('type', documentType);
      formData.append('tags', documentTags);
      formData.append('notes', documentNotes);
      formData.append('uploadedBy', 'current-user'); // Replace with actual user ID

      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Document uploaded successfully');
        setIsUploadDialogOpen(false);
        resetForm();
        onDocumentUploaded?.();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentType('');
    setDocumentName('');
    setDocumentTags('');
    setDocumentNotes('');
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      onDocumentUploaded?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find((dt) => dt.value === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Project Documents</CardTitle>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <IconUpload className='mr-2 h-4 w-4' />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='file'>File *</Label>
                  <Input
                    id='file'
                    type='file'
                    onChange={handleFileSelect}
                    accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md'
                  />
                  {selectedFile && (
                    <div className='text-muted-foreground mt-2 flex items-center gap-2 text-sm'>
                      <IconFile className='h-4 w-4' />
                      <span>{selectedFile.name}</span>
                      <span>({formatBytes(selectedFile.size)})</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor='name'>Document Name *</Label>
                  <Input
                    id='name'
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder='Enter document name'
                  />
                </div>

                <div>
                  <Label htmlFor='type'>Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select document type' />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='tags'>Tags (comma-separated)</Label>
                  <Input
                    id='tags'
                    value={documentTags}
                    onChange={(e) => setDocumentTags(e.target.value)}
                    placeholder='e.g., audit, compliance, wcag'
                  />
                </div>

                <div>
                  <Label htmlFor='notes'>Notes</Label>
                  <Textarea
                    id='notes'
                    value={documentNotes}
                    onChange={(e) => setDocumentNotes(e.target.value)}
                    placeholder='Additional notes about this document'
                    rows={3}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <IconFile className='mx-auto mb-4 h-12 w-12' />
            <p>No documents uploaded yet</p>
            <p className='text-sm'>Upload your first document to get started</p>
          </div>
        ) : (
          <ScrollArea className='h-[400px]'>
            <div className='space-y-3'>
              {documents.map((document) => (
                <div
                  key={document.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-3'>
                    <IconFile className='text-muted-foreground h-8 w-8' />
                    <div>
                      <div className='font-medium'>{document.name}</div>
                      <div className='text-muted-foreground text-sm'>
                        {getDocumentTypeLabel(document.type)} •{' '}
                        {formatBytes(document.fileSize)} • {document.version}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Uploaded by {document.uploadedBy} •{' '}
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={document.isLatest ? 'default' : 'secondary'}
                    >
                      {document.isLatest ? 'Latest' : 'Version'}
                    </Badge>
                    {document.tags.length > 0 && (
                      <div className='flex gap-1'>
                        {document.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant='outline'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 2 && (
                          <Badge variant='outline' className='text-xs'>
                            +{document.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => window.open(document.filePath, '_blank')}
                    >
                      <IconEye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <IconX className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
