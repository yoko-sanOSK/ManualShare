"use client";

import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Undo, 
  Redo,
  Code,
  Image as ImageIcon,
  Film,
  Loader2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { uploadFileAction } from "@/app/actions/upload-action";

// カスタム動画ノードの定義（将来用）
const Video = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        class: 'mx-auto block rounded-lg shadow-md max-w-full h-auto my-6 focus:outline-none focus:ring-2 focus:ring-primary',
        playsinline: 'true',
        preload: 'metadata',
      }),
    ];
  },

  addCommands() {
    return {
      setVideo: (options: { src: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    } as any;
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadFileAction(formData, 'manuals/media');
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      editor.chain().focus().setImage({ src: result.url }).run();
      
      toast({
        title: "アップロード完了",
        description: "画像を挿入しました。",
      });
    } catch (error: any) {
      console.error("Editor upload error:", error);
      toast({
        title: "アップロード失敗",
        description: error.message || "ファイルのアップロード中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const notifyVideoComingSoon = () => {
    toast({
      title: "導入予定の機能",
      description: "動画の添付機能は現在開発中です。今後のアップデートをお待ちください。",
    });
  };

  const items = [
    {
      icon: <Bold className="h-4 w-4" />,
      title: "太字",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
      disabled: () => !editor.can().chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      title: "斜体",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
      disabled: () => !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      title: "見出し 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      title: "見出し 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <List className="h-4 w-4" />,
      title: "箇条書きリスト",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      title: "番号付きリスト",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      title: "引用",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: <Code className="h-4 w-4" />,
      title: "コードブロック",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive("codeBlock"),
    },
    { type: "divider" },
    {
      icon: isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ImageIcon className="h-4 w-4" />,
      title: "画像を挿入",
      action: addImage,
      isActive: () => editor.isActive("image"),
      disabled: () => isUploading,
    },
    {
      icon: <Film className="h-4 w-4 opacity-50" />,
      title: "動画を挿入 (導入予定)",
      action: notifyVideoComingSoon,
      isActive: () => false,
      disabled: () => false,
    },
    { type: "divider" },
    {
      icon: <Undo className="h-4 w-4" />,
      title: "元に戻す",
      action: () => editor.chain().focus().undo().run(),
      disabled: () => !editor.can().chain().focus().undo().run(),
    },
    {
      icon: <Redo className="h-4 w-4" />,
      title: "やり直し",
      action: () => editor.chain().focus().redo().run(),
      disabled: () => !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageFileChange}
        />
        {items.map((item, index) => {
          if (item.type === "divider") {
            return <div key={index} className="w-px h-6 bg-border mx-1 my-auto" />;
          }

          const active = item.isActive?.();

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={item.action}
                  disabled={item.disabled?.()}
                  className={cn(
                    "transition-all duration-200",
                    active && "bg-secondary/20 text-secondary-foreground font-bold shadow-[0_0_15px_rgba(122,163,122,0.4)] ring-1 ring-secondary/40 hover:bg-secondary/30"
                  )}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'mx-auto block rounded-lg shadow-md max-w-full h-auto my-6 border-2 border-transparent focus:border-primary transition-all',
        },
      }),
      Video,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base focus:outline-none min-h-[400px] max-w-none p-6 text-foreground font-body",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!mounted) {
    return (
      <div className="w-full border rounded-xl overflow-hidden bg-background h-[450px] animate-pulse flex items-center justify-center border-dashed">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-3" />
        <p className="text-muted-foreground text-sm font-medium">エディタを準備中...</p>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-background ring-offset-background focus-within:ring-2 focus-within:ring-primary/20 transition-all border-border shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
