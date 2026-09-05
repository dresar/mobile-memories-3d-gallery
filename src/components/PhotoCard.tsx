import React, { useState } from 'react';
import { Download, ZoomIn, Share2, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PhotoCardProps {
  id: string;
  src: string;
  title: string;
  date?: string;
  views?: number;
  likes?: number;
  onImageClick: (src: string, title: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  id,
  src,
  title,
  date,
  views = 0,
  likes = 0,
  onImageClick,
  className = "",
  style
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download berhasil",
        description: `Foto "${title}" telah diunduh`,
      });
    } catch (error) {
      toast({
        title: "Download gagal",
        description: "Terjadi kesalahan saat mengunduh foto",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Lihat foto: ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link disalin",
        description: "Link foto telah disalin ke clipboard",
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    toast({
      title: isLiked ? "Like dihapus" : "Foto dilike",
      description: isLiked ? "Foto dihapus dari favorit" : "Foto ditambahkan ke favorit",
    });
  };

  return (
    <div 
      className={`card-3d photo-grid-item group relative rounded-xl overflow-hidden glass border backdrop-blur-lg shadow-2xl ${className}`}
      style={style}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden photo-hover">
        {!isLoaded && (
          <div className="absolute inset-0 shimmer rounded-lg" />
        )}
        <img
          src={src}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 cursor-zoom-in ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } group-hover:scale-110`}
          onLoad={() => setIsLoaded(true)}
          onClick={() => onImageClick(src, title)}
          loading="lazy"
        />
        
        {/* Overlay with stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-sm mb-2 truncate">{title}</h3>
            <div className="flex items-center justify-between text-white/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={12} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{currentLikes}</span>
                </div>
              </div>
              {date && <span>{date}</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
            onClick={handleLike}
          >
            <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(src, title);
            }}
          >
            <ZoomIn size={14} className="text-white" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
            onClick={handleShare}
          >
            <Share2 size={14} className="text-white" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0"
            onClick={handleDownload}
          >
            <Download size={14} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
