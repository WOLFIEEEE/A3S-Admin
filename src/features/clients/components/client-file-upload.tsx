'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  IconUpload,
  IconFile,
  IconTrash,
  IconDownload,
  IconLock,
  IconFileText,
  IconKey,
  IconPhoto,
  IconFileDescription
} from '@tabler/icons-react';
import { ClientFile, ClientFileCategory } from '@/types';
import { toast } from 'sonner';

interface FileUploadItem {
  file: File;
  category: ClientFileCategory;
  shouldEncrypt: boolean;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface ClientFileUploadProps {
  clientId: string;
  existingFiles?: ClientFile[];
  onFileUploaded?: (file: ClientFile) => void;
  onFileDeleted?: (fileId: string) => void;
}

const categoryIcons: Record<ClientFileCategory, React.ReactNode> = {
  contract: <IconFileText className='h-4 w-4' />,
  credential: <IconKey className='h-4 w-4' />,
  asset: <IconPhoto className='h-4 w-4' />,
  document: <IconFileDescription className='h-4 w-4' />
};

const categoryColors: Record<ClientFileCategory, string> = {
  contract: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  credential: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  asset: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  document:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export default function ClientFileUpload({
  clientId,
  existingFiles = [],
  onFileUploaded,
  onFileDeleted
}: ClientFileUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
  const [defaultCategory, setDefaultCategory] =
    useState<ClientFileCategory>('document');
  const [defaultEncrypt, setDefaultEncrypt] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newItems: FileUploadItem[] = acceptedFiles.map((file) => ({
        file,
        category: defaultCategory,
        shouldEncrypt: defaultEncrypt || defaultCategory === 'credential',
        progress: 0,
        status: 'pending'
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);
    },
    [defaultCategory, defaultEncrypt]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        toast.error(
          `File ${rejection.file.name} rejected: ${rejection.errors[0]?.message}`
        );
      });
    }
  });

  const updateQueueItem = (
    _index: number,
    updates: Partial<FileUploadItem>
  ) => {
    setUploadQueue((prev) =>
      prev.map((item, i) => (i === _index ? { ...item, ...updates } : item))
    );
  };

  const removeFromQueue = (_index: number) => {
    setUploadQueue((prev) => prev.filter((_, i) => i !== _index));
  };

  const uploadFile = async (item: FileUploadItem, _index: number) => {
    try {
      updateQueueItem(_index, { status: 'uploading', progress: 0 });

      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('clientId', clientId);
      formData.append('category', item.category);
      formData.append('shouldEncrypt', item.shouldEncrypt.toString());

      // Simulate progress for demo (replace with actual upload progress)
      const progressInterval = setInterval(() => {
        updateQueueItem(_index, {
          progress: Math.min(item.progress + Math.random() * 30, 90)
        });
      }, 200);

      const response = await fetch('/api/clients/files/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      updateQueueItem(_index, { status: 'completed', progress: 100 });

      if (onFileUploaded && result.data) {
        onFileUploaded(result.data);
      }

      toast.success(`File ${item.file.name} uploaded successfully`);

      // Remove from queue after a delay
      setTimeout(() => removeFromQueue(_index), 2000);
    } catch (error) {
      updateQueueItem(_index, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const uploadAll = async () => {
    const pendingItems = uploadQueue
      .map((item, _index) => ({ item, _index }))
      .filter(({ item }) => item.status === 'pending');

    for (const { item, _index } of pendingItems) {
      await uploadFile(item, _index);
    }
  };

  const downloadFile = async (file: ClientFile) => {
    try {
      const response = await fetch(`/api/clients/files/${file.id}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const deleteFile = async (file: ClientFile) => {
    try {
      const response = await fetch(`/api/clients/files/${file.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      if (onFileDeleted) {
        onFileDeleted(file.id);
      }

      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='space-y-6'>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconUpload className='h-5 w-5' />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload contracts, credentials, assets, and documents for this
            client.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Upload Settings */}
          <div className='bg-muted/50 grid grid-cols-1 gap-4 rounded-lg p-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='default-category'>Default Category</Label>
              <Select
                value={defaultCategory}
                onValueChange={(value: ClientFileCategory) =>
                  setDefaultCategory(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='contract'>Contract</SelectItem>
                  <SelectItem value='credential'>Credential</SelectItem>
                  <SelectItem value='asset'>Asset</SelectItem>
                  <SelectItem value='document'>Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='default-encrypt'>Default Encryption</Label>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='default-encrypt'
                  checked={defaultEncrypt}
                  onCheckedChange={setDefaultEncrypt}
                />
                <span className='text-muted-foreground text-sm'>
                  {defaultEncrypt ? 'Encrypt by default' : 'No encryption'}
                </span>
              </div>
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <IconUpload className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            {isDragActive ? (
              <p className='text-lg'>Drop files here...</p>
            ) : (
              <div>
                <p className='mb-2 text-lg'>
                  Drag & drop files here, or click to select
                </p>
                <p className='text-muted-foreground text-sm'>
                  Maximum file size: 10MB. Credentials are automatically
                  encrypted.
                </p>
              </div>
            )}
          </div>

          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>
                  Upload Queue ({uploadQueue.length})
                </h4>
                <Button
                  onClick={uploadAll}
                  disabled={uploadQueue.every(
                    (item) => item.status !== 'pending'
                  )}
                  size='sm'
                >
                  Upload All
                </Button>
              </div>

              {uploadQueue.map((item, _index) => (
                <div
                  key={_index}
                  className='flex items-center gap-3 rounded-lg border p-3'
                >
                  <IconFile className='text-muted-foreground h-4 w-4' />

                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='truncate text-sm font-medium'>
                        {item.file.name}
                      </span>
                      <Badge
                        variant='outline'
                        className={categoryColors[item.category]}
                      >
                        {categoryIcons[item.category]}
                        {item.category}
                      </Badge>
                      {item.shouldEncrypt && (
                        <Badge variant='outline' className='text-orange-600'>
                          <IconLock className='mr-1 h-3 w-3' />
                          Encrypted
                        </Badge>
                      )}
                    </div>

                    <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                      <span>{formatFileSize(item.file.size)}</span>
                      {item.status === 'uploading' && (
                        <>
                          <span>•</span>
                          <span>{Math.round(item.progress)}%</span>
                        </>
                      )}
                      {item.error && (
                        <>
                          <span>•</span>
                          <span className='text-red-600'>{item.error}</span>
                        </>
                      )}
                    </div>

                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className='mt-1 h-1' />
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    {item.status === 'pending' && (
                      <>
                        <Select
                          value={item.category}
                          onValueChange={(value: ClientFileCategory) =>
                            updateQueueItem(_index, { category: value })
                          }
                        >
                          <SelectTrigger className='w-32'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='contract'>Contract</SelectItem>
                            <SelectItem value='credential'>
                              Credential
                            </SelectItem>
                            <SelectItem value='asset'>Asset</SelectItem>
                            <SelectItem value='document'>Document</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size='sm'
                          onClick={() => uploadFile(item, _index)}
                        >
                          Upload
                        </Button>
                      </>
                    )}

                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => removeFromQueue(_index)}
                      disabled={item.status === 'uploading'}
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Files ({existingFiles.length})</CardTitle>
            <CardDescription>
              Files already uploaded for this client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {existingFiles.map((file) => (
                <div
                  key={file.id}
                  className='flex items-center gap-3 rounded-lg border p-3'
                >
                  {categoryIcons[file.category]}

                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='truncate text-sm font-medium'>
                        {file.originalName}
                      </span>
                      <Badge
                        variant='outline'
                        className={categoryColors[file.category]}
                      >
                        {file.category}
                      </Badge>
                      {file.isEncrypted && (
                        <Badge variant='outline' className='text-orange-600'>
                          <IconLock className='mr-1 h-3 w-3' />
                          Encrypted
                        </Badge>
                      )}
                    </div>

                    <div className='text-muted-foreground text-xs'>
                      {formatFileSize(file.fileSize)} • Uploaded{' '}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => downloadFile(file)}
                    >
                      <IconDownload className='h-4 w-4' />
                    </Button>

                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => deleteFile(file)}
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
