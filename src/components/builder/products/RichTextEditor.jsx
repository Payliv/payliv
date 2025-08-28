import React, { useState, useRef } from 'react';
import { Bold, Italic, Link, Youtube, Wand2, Loader2, Image as ImageIcon, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import MarkdownPreview from './MarkdownPreview';

const RichTextEditor = ({ value, onChange, productName, storeId }) => {
  const { user } = useAuth();
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState('write'); // 'write' or 'preview'

  const applyFormat = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
        toast({ title: "Aucun texte sélectionné", description: "Veuillez sélectionner le texte à formater.", variant: "destructive" });
        return;
    }
    
    let formattedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange({ target: { value: newValue } });
  };
  
  const handleLinkSubmit = () => {
    const textarea = textareaRef.current;
    if (!textarea || !linkUrl) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'votre texte de lien';
    const formattedText = `[${selectedText}](${linkUrl})`;
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange({ target: { value: newValue } });

    setLinkUrl('');
    setLinkPopoverOpen(false);
  };
  
  const addYoutubeVideo = () => {
    const videoUrl = prompt("Veuillez coller l'URL de la vidéo YouTube :");
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      const newValue = `${value}\n\n${videoUrl}\n\n`;
      onChange({ target: { value: newValue } });
      toast({ title: "Vidéo ajoutée", description: "Cliquez sur l'onglet 'Aperçu' pour voir la vidéo." });
    } else if(videoUrl) {
      toast({ title: "URL invalide", description: "Veuillez entrer une URL YouTube valide.", variant: "destructive" });
    }
  };

  const handleGenerateDescription = async () => {
    if (!productName) {
      toast({ title: "Nom de produit manquant", description: "Veuillez d'abord nommer votre produit.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    const { data, error } = await supabase.functions.invoke('generate-description', {
      body: { prompt: productName, existingText: value },
    });
    setIsGenerating(false);

    if (error) {
      toast({ title: "Erreur de l'IA", description: error.message, variant: 'destructive' });
    } else {
      onChange({ target: { value: data.description } });
      toast({ title: 'Description améliorée !', description: "L'IA a généré une nouvelle description." });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user || !storeId) return;

    setIsUploading(true);
    const fileName = `${user.id}/${storeId}/products/desc/${Date.now()}-${file.name}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from('store_assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('store_assets').getPublicUrl(fileName);
      const imageUrl = publicUrlData.publicUrl;
      
      const imageMarkdown = `\n![${productName || 'image'}](${imageUrl})\n`;
      const newValue = value + imageMarkdown;
      onChange({ target: { value: newValue } });

      toast({ title: "Image insérée", description: "L'image a été ajoutée à votre description." });
    } catch (error) {
      toast({ title: "Erreur de téléversement", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-input p-2 bg-muted/50">
        <div className="flex items-center space-x-1">
          <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('bold')} title="Gras">
            <Bold className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('italic')} title="Italique">
            <Italic className="w-4 h-4" />
          </Button>
           <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" title="Ajouter un lien">
                    <Link className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Insérer un lien</h4>
                        <p className="text-sm text-muted-foreground">Sélectionnez du texte puis ajoutez une URL.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="link-url">URL</Label>
                        <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
                    </div>
                    <Button onClick={handleLinkSubmit}>Ajouter le lien</Button>
                </div>
            </PopoverContent>
          </Popover>
          <Button type="button" variant="ghost" size="icon" onClick={addYoutubeVideo} title="Ajouter une vidéo YouTube">
            <Youtube className="w-4 h-4" />
          </Button>
          <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <Button type="button" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} title="Ajouter une image" disabled={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
            <Button type="button" variant={mode === 'write' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('write')} className="font-semibold">
                <Pencil className="w-4 h-4 mr-2"/>Écrire
            </Button>
            <Button type="button" variant={mode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('preview')} className="font-semibold">
                <Eye className="w-4 h-4 mr-2"/>Aperçu
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              IA
            </Button>
        </div>
      </div>
      {mode === 'write' ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder="Décrivez votre produit ici. Utilisez la barre d'outils pour le formatage..."
          className="bg-background rounded-t-none min-h-[150px]"
        />
      ) : (
        <div className="p-4 border border-input rounded-b-md min-h-[150px] prose prose-invert max-w-none bg-background">
            <MarkdownPreview content={value} />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;