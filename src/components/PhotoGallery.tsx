
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, List, Filter, Search, SortAsc, Plus, FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PhotoCard from './PhotoCard';
import FolderCard from './FolderCard';
import PhotoLightbox from './PhotoLightbox';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  src: string;
  title: string;
  date?: string;
  folder?: string;
  views?: number;
  likes?: number;
  tags?: string[];
}

interface Folder {
  id: string;
  name: string;
  photoCount: number;
  coverImage?: string;
  lastModified?: string;
}

const PhotoGallery: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'views' | 'likes'>('date');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; title: string } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'folders' | 'photos'>('folders');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { toast } = useToast();

  // Sample data - in a real app, this would come from an API
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      title: 'Pantai Sunset',
      date: '2024-01-15',
      folder: 'liburan',
      views: 156,
      likes: 24,
      tags: ['pantai', 'sunset', 'alam']
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      title: 'Pemandangan Gunung',
      date: '2024-01-10',
      folder: 'liburan',
      views: 203,
      likes: 45,
      tags: ['gunung', 'alam', 'hiking']
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      title: 'Hutan Hijau',
      date: '2024-01-08',
      folder: 'alam',
      views: 89,
      likes: 12,
      tags: ['hutan', 'hijau', 'alam']
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      title: 'Danau Tenang',
      date: '2024-01-05',
      folder: 'alam',
      views: 134,
      likes: 28,
      tags: ['danau', 'air', 'tenang']
    },
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      title: 'Langit Biru',
      date: '2024-01-03',
      folder: 'langit',
      views: 67,
      likes: 8,
      tags: ['langit', 'biru', 'awan']
    },
    {
      id: '6',
      src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800',
      title: 'Ladang Bunga',
      date: '2024-01-01',
      folder: 'bunga',
      views: 245,
      likes: 67,
      tags: ['bunga', 'ladang', 'warna']
    }
  ]);

  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'liburan',
      name: 'Liburan 2024',
      photoCount: 2,
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      lastModified: '2 hari lalu'
    },
    {
      id: 'alam',
      name: 'Keindahan Alam',
      photoCount: 2,
      coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      lastModified: '1 minggu lalu'
    },
    {
      id: 'langit',
      name: 'Langit & Awan',
      photoCount: 1,
      coverImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
      lastModified: '2 minggu lalu'
    },
    {
      id: 'bunga',
      name: 'Taman Bunga',
      photoCount: 1,
      coverImage: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400',
      lastModified: '3 minggu lalu'
    }
  ]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let filtered = photos;

    // Filter by folder
    if (filterFolder !== 'all' && selectedFolderId) {
      filtered = filtered.filter(photo => photo.folder === selectedFolderId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort photos
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });
  }, [photos, searchTerm, sortBy, filterFolder, selectedFolderId]);

  const handleImageClick = useCallback((src: string, title: string) => {
    const photoIndex = filteredPhotos.findIndex(photo => photo.src === src);
    if (photoIndex !== -1) {
      setLightboxIndex(photoIndex);
      setIsLightboxOpen(true);
    }
  }, [filteredPhotos]);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentView('photos');
    setFilterFolder(folderId);
  };

  const handleBackToFolders = () => {
    setCurrentView('folders');
    setSelectedFolderId(null);
    setFilterFolder('all');
  };

  const handleFolderEdit = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    ));
  };

  const handleFolderDelete = (folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    // Also remove photos from deleted folder
    setPhotos(prev => prev.filter(photo => photo.folder !== folderId));
  };

  const handleFolderShare = (folderId: string) => {
    // Implementation for sharing folder
    navigator.clipboard.writeText(`${window.location.origin}/folder/${folderId}`);
  };

  const createNewFolder = () => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: 'Album Baru',
      photoCount: 0,
      lastModified: 'Baru saja'
    };
    setFolders(prev => [newFolder, ...prev]);
    toast({
      title: "Folder dibuat",
      description: "Album baru telah dibuat",
    });
  };

  const uploadPhotos = () => {
    // Implementation for photo upload
    toast({
      title: "Upload foto",
      description: "Fitur upload akan segera tersedia",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Title and Navigation */}
            <div className="flex items-center gap-4">
              {currentView === 'photos' && (
                <Button
                  variant="ghost"
                  onClick={handleBackToFolders}
                  className="text-sm"
                >
                  ← Kembali ke Album
                </Button>
              )}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {currentView === 'folders' ? 'Album Kenangan' : folders.find(f => f.id === selectedFolderId)?.name || 'Foto'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentView === 'folders' 
                    ? `${folders.length} album • ${photos.length} foto total`
                    : `${filteredPhotos.length} foto`
                  }
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:flex-none lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari foto atau tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-border/50"
                />
              </div>

              {/* Sort */}
              {currentView === 'photos' && (
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 glass border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Tanggal</SelectItem>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="likes">Likes</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* View Mode */}
              {currentView === 'photos' && (
                <div className="flex items-center gap-1 p-1 glass rounded-md border-border/50">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List size={16} />
                  </Button>
                </div>
              )}

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="gradient-primary">
                    <Plus size={16} className="mr-2" />
                    Tambah
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={uploadPhotos}>
                    <Upload size={16} className="mr-2" />
                    Upload Foto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={createNewFolder}>
                    <FolderPlus size={16} className="mr-2" />
                    Buat Album
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {currentView === 'folders' ? (
          /* Folder View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                id={folder.id}
                name={folder.name}
                photoCount={folder.photoCount}
                coverImage={folder.coverImage}
                lastModified={folder.lastModified}
                onClick={() => handleFolderClick(folder.id)}
                onEdit={handleFolderEdit}
                onDelete={handleFolderDelete}
                onShare={handleFolderShare}
                className="animate-fade-in"
              />
            ))}
          </div>
        ) : (
          /* Photo View */
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                id={photo.id}
                src={photo.src}
                title={photo.title}
                date={photo.date}
                views={photo.views}
                likes={photo.likes}
                onImageClick={handleImageClick}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPhotos.length === 0 && currentView === 'photos' && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Search size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tidak ada foto ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Coba ubah kata kunci pencarian atau filter
            </p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              Reset Pencarian
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <PhotoLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={filteredPhotos}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
};

export default PhotoGallery;
