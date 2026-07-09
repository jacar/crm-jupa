'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Archive, Plus, Minus, Search, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function InventoryPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [updateType, setUpdateType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState(1);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/materials', { params: { search: searchTerm, limit: 100 } });
      setMaterials(data.data || []);
    } catch (error: any) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openUpdateModal = (material: any, type: 'add' | 'remove') => {
    setSelectedMaterial(material);
    setUpdateType(type);
    setQuantity(1);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedMaterial) return;
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    let newStock = selectedMaterial.stock;
    if (updateType === 'add') {
      newStock += quantity;
    } else {
      newStock -= quantity;
      if (newStock < 0) {
        toast.error('No hay stock suficiente para esta salida');
        return;
      }
    }

    try {
      await api.patch(`/materials/${selectedMaterial.id}`, { stock: newStock });
      toast.success(updateType === 'add' ? 'Entrada registrada' : 'Salida registrada');
      setIsUpdateModalOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error('Error al actualizar stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario y Stock</h1>
          <p className="text-muted-foreground">Gestiona las entradas y salidas de materiales o herramientas</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              Ítems en Almacén
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre o ref..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre / Referencia</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-center">Stock Actual</TableHead>
                  <TableHead className="text-right">Movimientos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Cargando inventario...
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No se encontraron ítems. Asegúrate de crearlos primero en la sección de "Materiales".
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.reference || 'Sin ref'}</div>
                      </TableCell>
                      <TableCell>{m.category || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.location}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-lg">{m.stock} {m.unit}</div>
                        {m.stock <= m.minStock && (
                          <span className="text-[10px] text-destructive uppercase font-semibold block mt-1">Stock bajo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/20" onClick={() => openUpdateModal(m, 'add')}>
                            <Plus className="h-4 w-4 mr-1" /> Entrada
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => openUpdateModal(m, 'remove')}>
                            <Minus className="h-4 w-4 mr-1" /> Salida
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {updateType === 'add' ? 'Registrar Entrada' : 'Registrar Salida'} de Inventario
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-1">
              <Label>Ítem seleccionado</Label>
              <div className="font-semibold text-lg">{selectedMaterial?.name}</div>
              <div className="text-sm text-muted-foreground">Stock actual: {selectedMaterial?.stock} {selectedMaterial?.unit}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Cantidad a {updateType === 'add' ? 'sumar' : 'restar'}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStock} variant={updateType === 'add' ? 'default' : 'destructive'}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
