'use client';

import { useState } from 'react';
import {
  IconKey,
  IconPlus,
  IconEye,
  IconEyeOff,
  IconEdit,
  IconTrash,
  IconExternalLink
} from '@tabler/icons-react';
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

interface StagingCredentials {
  id: string;
  type: string;
  environment: string;
  url: string;
  username?: string;
  password?: string;
  apiKey?: string;
  accessToken?: string;
  sshKey?: string;
  databaseUrl?: string;
  notes?: string;
  isActive: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStagingCredentialsProps {
  projectId: string;
  credentials: StagingCredentials[];
  onCredentialsUpdated?: () => void;
}

const credentialTypes = [
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' }
];

const environments = [
  'staging',
  'production',
  'development',
  'testing',
  'preview',
  'demo',
  'sandbox'
];

export function ProjectStagingCredentials({
  projectId,
  credentials,
  onCredentialsUpdated
}: ProjectStagingCredentialsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] =
    useState<StagingCredentials | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'staging',
    environment: '',
    url: '',
    username: '',
    password: '',
    apiKey: '',
    accessToken: '',
    sshKey: '',
    databaseUrl: '',
    notes: '',
    expiresAt: ''
  });

  const resetForm = () => {
    setFormData({
      type: 'staging',
      environment: '',
      url: '',
      username: '',
      password: '',
      apiKey: '',
      accessToken: '',
      sshKey: '',
      databaseUrl: '',
      notes: '',
      expiresAt: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.environment || !formData.url) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/staging-credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            createdBy: 'current-user', // Replace with actual user ID
            expiresAt: formData.expiresAt || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create credentials');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Staging credentials created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        onCredentialsUpdated?.();
      } else {
        throw new Error(result.error || 'Creation failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCredential || !formData.environment || !formData.url) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/staging-credentials/${editingCredential.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            expiresAt: formData.expiresAt || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update credentials');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Staging credentials updated successfully');
        setIsEditDialogOpen(false);
        setEditingCredential(null);
        resetForm();
        onCredentialsUpdated?.();
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete these credentials?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/staging-credentials/${credentialId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete credentials');
      }

      toast.success('Staging credentials deleted successfully');
      onCredentialsUpdated?.();
    } catch (error) {
      toast.error('Failed to delete credentials');
    }
  };

  const openEditDialog = (credential: StagingCredentials) => {
    setEditingCredential(credential);
    setFormData({
      type: credential.type,
      environment: credential.environment,
      url: credential.url,
      username: credential.username || '',
      password: credential.password || '',
      apiKey: credential.apiKey || '',
      accessToken: credential.accessToken || '',
      sshKey: credential.sshKey || '',
      databaseUrl: credential.databaseUrl || '',
      notes: credential.notes || '',
      expiresAt: credential.expiresAt
        ? new Date(credential.expiresAt).toISOString().slice(0, 16)
        : ''
    });
    setIsEditDialogOpen(true);
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const getCredentialTypeLabel = (type: string) => {
    return credentialTypes.find((ct) => ct.value === type)?.label || type;
  };

  const maskSensitiveValue = (value: string | undefined, show: boolean) => {
    if (!value) return '';
    return show ? value : '•'.repeat(Math.min(value.length, 8));
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Staging Credentials</CardTitle>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                Add Credentials
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Add Staging Credentials</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='type'>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {credentialTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='environment'>Environment *</Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, environment: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select environment' />
                      </SelectTrigger>
                      <SelectContent>
                        {environments.map((env) => (
                          <SelectItem key={env} value={env}>
                            {env}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor='url'>URL *</Label>
                  <Input
                    id='url'
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder='https://staging.example.com'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='username'>Username</Label>
                    <Input
                      id='username'
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value
                        }))
                      }
                      placeholder='admin'
                    />
                  </div>
                  <div>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      placeholder='••••••••'
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='apiKey'>API Key</Label>
                  <Input
                    id='apiKey'
                    type='password'
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        apiKey: e.target.value
                      }))
                    }
                    placeholder='sk-...'
                  />
                </div>

                <div>
                  <Label htmlFor='accessToken'>Access Token</Label>
                  <Input
                    id='accessToken'
                    type='password'
                    value={formData.accessToken}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accessToken: e.target.value
                      }))
                    }
                    placeholder='Bearer token...'
                  />
                </div>

                <div>
                  <Label htmlFor='sshKey'>SSH Key</Label>
                  <Textarea
                    id='sshKey'
                    value={formData.sshKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sshKey: e.target.value
                      }))
                    }
                    placeholder='-----BEGIN OPENSSH PRIVATE KEY-----'
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor='databaseUrl'>Database URL</Label>
                  <Input
                    id='databaseUrl'
                    type='password'
                    value={formData.databaseUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        databaseUrl: e.target.value
                      }))
                    }
                    placeholder='postgresql://user:pass@host:port/db'
                  />
                </div>

                <div>
                  <Label htmlFor='expiresAt'>Expires At</Label>
                  <Input
                    id='expiresAt'
                    type='datetime-local'
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiresAt: e.target.value
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='notes'>Notes</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value
                      }))
                    }
                    placeholder='Additional notes about these credentials'
                    rows={3}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {credentials.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <IconKey className='mx-auto mb-4 h-12 w-12' />
            <p>No staging credentials configured</p>
            <p className='text-sm'>
              Add credentials to manage access to staging environments
            </p>
          </div>
        ) : (
          <ScrollArea className='h-[500px]'>
            <div className='space-y-4'>
              {credentials.map((credential) => (
                <Card key={credential.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          <Badge variant='outline'>
                            {getCredentialTypeLabel(credential.type)}
                          </Badge>
                          <Badge variant='secondary'>
                            {credential.environment}
                          </Badge>
                          {credential.expiresAt &&
                            new Date(credential.expiresAt) < new Date() && (
                              <Badge variant='destructive'>Expired</Badge>
                            )}
                        </div>

                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center gap-2'>
                            <IconExternalLink className='text-muted-foreground h-4 w-4' />
                            <a
                              href={credential.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              {credential.url}
                            </a>
                          </div>

                          {credential.username && (
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground w-20'>
                                Username:
                              </span>
                              <span className='font-mono'>
                                {credential.username}
                              </span>
                            </div>
                          )}

                          {credential.password && (
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground w-20'>
                                Password:
                              </span>
                              <span className='font-mono'>
                                {maskSensitiveValue(
                                  credential.password,
                                  showPasswords[credential.id] || false
                                )}
                              </span>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  togglePasswordVisibility(credential.id)
                                }
                              >
                                {showPasswords[credential.id] ? (
                                  <IconEyeOff className='h-4 w-4' />
                                ) : (
                                  <IconEye className='h-4 w-4' />
                                )}
                              </Button>
                            </div>
                          )}

                          {credential.apiKey && (
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground w-20'>
                                API Key:
                              </span>
                              <span className='font-mono'>
                                {maskSensitiveValue(
                                  credential.apiKey,
                                  showPasswords[credential.id] || false
                                )}
                              </span>
                            </div>
                          )}

                          {credential.notes && (
                            <div className='mt-2'>
                              <span className='text-muted-foreground'>
                                Notes:{' '}
                              </span>
                              <span>{credential.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className='text-muted-foreground mt-2 text-xs'>
                          Created by {credential.createdBy} •{' '}
                          {new Date(credential.createdAt).toLocaleDateString()}
                          {credential.expiresAt && (
                            <span>
                              {' '}
                              • Expires{' '}
                              {new Date(
                                credential.expiresAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openEditDialog(credential)}
                        >
                          <IconEdit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(credential.id)}
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Staging Credentials</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-type'>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {credentialTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='edit-environment'>Environment *</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, environment: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select environment' />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem key={env} value={env}>
                        {env}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor='edit-url'>URL *</Label>
              <Input
                id='edit-url'
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder='https://staging.example.com'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-username'>Username</Label>
                <Input
                  id='edit-username'
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value
                    }))
                  }
                  placeholder='admin'
                />
              </div>
              <div>
                <Label htmlFor='edit-password'>Password</Label>
                <Input
                  id='edit-password'
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value
                    }))
                  }
                  placeholder='••••••••'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='edit-apiKey'>API Key</Label>
              <Input
                id='edit-apiKey'
                type='password'
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder='sk-...'
              />
            </div>

            <div>
              <Label htmlFor='edit-accessToken'>Access Token</Label>
              <Input
                id='edit-accessToken'
                type='password'
                value={formData.accessToken}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accessToken: e.target.value
                  }))
                }
                placeholder='Bearer token...'
              />
            </div>

            <div>
              <Label htmlFor='edit-sshKey'>SSH Key</Label>
              <Textarea
                id='edit-sshKey'
                value={formData.sshKey}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sshKey: e.target.value }))
                }
                placeholder='-----BEGIN OPENSSH PRIVATE KEY-----'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='edit-databaseUrl'>Database URL</Label>
              <Input
                id='edit-databaseUrl'
                type='password'
                value={formData.databaseUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    databaseUrl: e.target.value
                  }))
                }
                placeholder='postgresql://user:pass@host:port/db'
              />
            </div>

            <div>
              <Label htmlFor='edit-expiresAt'>Expires At</Label>
              <Input
                id='edit-expiresAt'
                type='datetime-local'
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiresAt: e.target.value
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor='edit-notes'>Notes</Label>
              <Textarea
                id='edit-notes'
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder='Additional notes about these credentials'
                rows={3}
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCredential(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
