
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
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
  Youtube as YoutubeIcon,
  X
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        editor.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow the same file to be selected again
    e.target.value = '';
  };

  const addYoutubeVideo = () => {
    const url = prompt('YouTubeのURLを入力してください');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
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
      icon: <ImageIcon className="h-4 w-4" />,
      title: "画像を挿入",
      action: addImage,
      isActive: () => editor.isActive("image"),
    },
    {
      icon: <YoutubeIcon className="h-4 w-4" />,
      title: "YouTube動画を挿入",
      action: addYoutubeVideo,
      isActive: () => editor.isActive("youtube"),
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

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={item.action}
                  disabled={item.disabled?.()}
                  className={item.isActive?.() ? "bg-muted" : ""}
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'mx-auto block rounded-lg shadow-md max-w-full h-auto my-6',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'mx-auto block rounded-lg shadow-md max-w-full aspect-video my-6',
        },
        inline: false,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base focus:outline-none min-h-[400px] max-w-none p-4",
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

  return (
    <div className="w-full border rounded-md overflow-hidden bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
