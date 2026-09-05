
import React, { useState } from 'react';
import { Folder, FolderOpen, Image, Calendar, MoreVertical, Edit, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface FolderCardProps {
  id: string;
  name: string;
  photoCount: number;
  coverImage?: string;
  lastModified?: string;
  onClick: () => void;
  onEdit?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

const FolderCard: React.FC<FolderCardProps> = ({
  id,
  name,
  photoCount,
  coverImage,
  lastModified,
  onClick,
  onEdit,
  onDelete,
  onShare,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const { toast } = useToast();

  const handleEdit = () => {
    if (onEdit && editName.trim() && editName !== name) {
      onEdit(id, editName.trim());
      toast({
        title: "Folder diubah",
        description: `Folder berhasil diubah menjadi "${editName}"`,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
      toast({
        title: "Folder dihapus",
        description: `Folder "${name}" telah dihapus`,
      });
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(id);
      toast({
        title: "Folder dibagikan",
        description: `Link folder "${name}" telah disalin`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(name);
    }
  };

  return (
    <div 
      className={`card-3d group relative p-4 rounded-xl glass border backdrop-blur-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isEditing ? onClick : undefined}
    >
      {/* Cover Image or Folder Icon */}
      <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Cover for ${name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isHovered ? (
              <FolderOpen 
                size={48} 
                className="text-primary transition-all duration-300 transform group-hover:scale-110" 
              />
            ) : (
              <Folder 
                size={48} 
                className="text-primary/70 transition-all duration-300" 
              />
            )}
          </div>
        )}
        
        {/* Photo count badge */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Image size={12} />
          <span>{photoCount}</span>
        </div>
      </div>

      {/* Folder Info */}
      <div className="space-y-2">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border border-primary/30 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:border-primary"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{lastModified || 'Baru dibuat'}</span>
          </div>
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}>
                  <Edit size={14} className="mr-2" />
                  Ubah nama
                </DropdownMenuItem>
              )}
              {onShare && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}>
                  <Share2 size={14} className="mr-2" />
                  Bagikan
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={14} className="mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default FolderCard;
