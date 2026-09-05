
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  src: string;
  title: string;
  date?: string;
}

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onIndexChange
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < photos.length - 1) {
          onIndexChange(currentIndex + 1);
        }
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.2, 3));
        break;
      case '-':
        setZoom(prev => Math.max(prev - 0.2, 0.5));
        break;
    }
  }, [isOpen, currentIndex, photos.length, onClose, onIndexChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;
    
    try {
      const response = await fetch(currentPhoto.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${currentPhoto.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download berhasil",
        description: `Foto "${currentPhoto.title}" telah diunduh`,
      });
    } catch (error) {
      toast({
        title: "Download gagal",
        description: "Terjadi kesalahan saat mengunduh foto",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!currentPhoto) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPhoto.title,
          text: `Lihat foto: ${currentPhoto.title}`,
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

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{currentPhoto.title}</h2>
          <p className="text-sm text-white/70">
            {currentIndex + 1} dari {photos.length}
            {currentPhoto.date && ` • ${currentPhoto.date}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10"
          onClick={() => onIndexChange(currentIndex - 1)}
        >
          <ChevronLeft size={32} />
        </Button>
      )}

      {currentIndex < photos.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10"
          onClick={() => onIndexChange(currentIndex + 1)}
        >
          <ChevronRight size={32} />
        </Button>
      )}

      {/* Image Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          src={currentPhoto.src}
          alt={currentPhoto.title}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
            cursor: zoom > 1 ? (dragStart ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onDoubleClick={() => zoom > 1 ? resetTransform() : setZoom(2)}
          draggable={false}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLiked(!isLiked)}
          className={`text-white hover:bg-white/10 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="text-white hover:bg-white/10"
        >
          <ZoomOut size={18} />
        </Button>
        
        <span className="text-white text-sm px-2 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
          className="text-white hover:bg-white/10"
        >
          <ZoomIn size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRotation(prev => prev + 90)}
          className="text-white hover:bg-white/10"
        >
          <RotateCw size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-white hover:bg-white/10"
        >
          <Share2 size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="text-white hover:bg-white/10"
        >
          <Download size={18} />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs space-y-1">
        <div>ESC untuk keluar</div>
        <div>← → untuk navigasi</div>
        <div>Scroll untuk zoom</div>
        <div>Double click untuk reset</div>
      </div>
    </div>
  );
};

export default PhotoLightbox;
