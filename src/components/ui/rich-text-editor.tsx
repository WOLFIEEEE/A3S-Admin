'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
// Note: Some extensions might not be available, so we'll use a simpler setup
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconLink,
  IconArrowBackUp,
  IconArrowForwardUp
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className='border-border flex flex-wrap items-center gap-1 border-b p-2'>
      {/* Text formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <IconBold className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <IconItalic className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <IconStrikethrough className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
      >
        <IconCode className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Headings */}
      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <IconH1 className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconList className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListNumbers className='h-4 w-4' />
      </Button>
      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size='sm'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Advanced features */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        <IconLink className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Undo/Redo */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <IconArrowBackUp className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <IconArrowForwardUp className='h-4 w-4' />
      </Button>
    </div>
  );
};

export function RichTextEditor({
  content,
  onChange,
  className,
  editable = true
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-primary underline underline-offset-2 hover:text-primary/80'
        }
      }),
      Image
    ],
    content,
    editable,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-muted prose-pre:text-foreground',
          'prose-blockquote:border-l-primary prose-blockquote:text-foreground/80',
          'prose-ul:text-foreground prose-ol:text-foreground',
          'prose-li:text-foreground',
          'prose-table:text-foreground',
          'prose-th:text-foreground prose-td:text-foreground',
          'dark:prose-invert'
        )
      }
    }
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      try {
        editor.commands.setContent(content || '');
      } catch (error) {
        // Fallback to empty content if there's an error
        editor.commands.setContent('');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          'border-border overflow-hidden rounded-lg border p-4',
          className
        )}
      >
        <div className='text-muted-foreground text-center'>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-lg border',
        className
      )}
    >
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
