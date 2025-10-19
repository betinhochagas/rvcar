import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, LogOut, Car, Home, Upload, X } from 'lucide-react';
import { Vehicle } from '@/types/admin';
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  toggleVehicleAvailability,
} from '@/lib/vehicleManager';
import { isAuthenticated, logout, getUser } from '@/lib/authManager';
import { uploadImage, createImagePreview, validateImage } from '@/lib/uploadManager';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    features: '',
    available: true,
  });

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }

    loadVehicles();
  }, [navigate]);

  const loadVehicles = async () => {
    try {
      const loadedVehicles = await getVehicles();
      setVehicles(loadedVehicles);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar veículos');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/admin/login');
  };

  const handleOpenAddDialog = () => {
    setSelectedVehicle(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      features: '',
      available: true,
    });
    setImagePreview(null);
    setIsEditDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      price: vehicle.price,
      image: vehicle.image,
      features: vehicle.features.join(', '),
      available: vehicle.available,
    });
    setImagePreview(vehicle.image);
    setIsEditDialogOpen(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar imagem
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Criar preview
    try {
      const preview = await createImagePreview(file);
      setImagePreview(preview);

      // Fazer upload
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar imagem');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveVehicle = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    const vehicleData = {
      name: formData.name,
      price: formData.price,
      image: formData.image || '/placeholder.svg',
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      available: formData.available,
    };

    try {
      if (selectedVehicle) {
        // Update existing vehicle
        await updateVehicle(selectedVehicle.id, vehicleData);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        // Add new vehicle
        await addVehicle(vehicleData);
        toast.success('Veículo adicionado com sucesso!');
      }

      setIsEditDialogOpen(false);
      await loadVehicles();
    } catch (error) {
      toast.error('Erro ao salvar veículo. Tente novamente.');
      console.error(error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (selectedVehicle) {
      try {
        await deleteVehicle(selectedVehicle.id);
        toast.success('Veículo removido com sucesso!');
        setIsDeleteDialogOpen(false);
        await loadVehicles();
      } catch (error) {
        toast.error('Erro ao remover veículo. Tente novamente.');
        console.error(error);
      }
    }
  };

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    try {
      await toggleVehicleAvailability(vehicle.id);
      toast.success(
        vehicle.available
          ? 'Veículo marcado como indisponível'
          : 'Veículo marcado como disponível'
      );
      await loadVehicles();
    } catch (error) {
      toast.error('Erro ao atualizar disponibilidade. Tente novamente.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">RV Car - Admin</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento de Veículos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Site
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vehicles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {vehicles.filter(v => v.available).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Indisponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {vehicles.filter(v => !v.available).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Vehicle Button */}
        <div className="mb-6">
          <Button onClick={handleOpenAddDialog} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className={`w-full h-48 object-cover ${
                    !vehicle.available ? 'grayscale opacity-60' : ''
                  }`}
                />
                {!vehicle.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white font-bold text-lg">INDISPONÍVEL</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
                <p className="text-2xl font-bold text-primary mb-4">{vehicle.price}/sem</p>
                
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor={`available-${vehicle.id}`} className="text-sm">
                    {vehicle.available ? 'Disponível' : 'Indisponível'}
                  </Label>
                  <Switch
                    id={`available-${vehicle.id}`}
                    checked={vehicle.available}
                    onCheckedChange={() => handleToggleAvailability(vehicle)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEditDialog(vehicle)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vehicles.length === 0 && (
          <Card className="p-12 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando seu primeiro veículo ao catálogo
            </p>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Veículo
            </Button>
          </Card>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVehicle ? 'Editar Veículo' : 'Adicionar Veículo'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do veículo abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Veículo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Fiat Mobi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço por Semana *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: R$650"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagem do Veículo</Label>
              
              {/* Preview da imagem */}
              {imagePreview && (
                <div className="relative w-full h-48 mb-2 border rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Botão de upload */}
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="image-file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImage ? 'Enviando...' : 'Enviar Imagem'}
                </Button>
              </div>
              
              {/* Campo URL manual (opcional) */}
              <div className="relative">
                <Label htmlFor="image-url" className="text-xs text-muted-foreground">
                  Ou cole URL da imagem:
                </Label>
                <Input
                  id="image-url"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Características (separadas por vírgula)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Ex: Econômico, Ar Condicionado, Direção Hidráulica"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, available: checked })
                }
              />
              <Label htmlFor="available">
                {formData.available ? 'Veículo Disponível' : 'Veículo Indisponível'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVehicle}>
              {selectedVehicle ? 'Salvar Alterações' : 'Adicionar Veículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo{' '}
              <strong>{selectedVehicle?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;