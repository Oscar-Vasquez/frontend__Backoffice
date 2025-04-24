"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Phone, Building2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { BranchDialog } from "./components/branch-dialog";
import { DeleteDialog } from "./components/delete-dialog";
import { customToast } from "@/app/components/ui/custom-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Branch {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  isActive: boolean;
}

// Interfaz para la respuesta de la API
interface BranchResponse {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  is_active: boolean; // Nota el formato is_active en la API
}

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>("todas");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Muestra la URL en la consola para depuración
  useEffect(() => {
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('workexpress_token');
      if (!token) {
        // Redirect to login if no token
        router.push('/auth/login');
        return;
      }
      
      // Mostrar la URL completa para depuración
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/branches`;
      console.log('Fetching branches from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        // Handle unauthorized access
        localStorage.removeItem('workexpress_token');
        router.push('/auth/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar las sucursales');
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      // Transformar los datos de la API al formato de nuestro frontend
      const formattedBranches: Branch[] = Array.isArray(data) 
        ? data.map((branch: BranchResponse) => ({
            id: branch.id,
            name: branch.name,
            address: branch.address,
            province: branch.province,
            phone: branch.phone,
            isActive: branch.is_active // Convertir is_active a isActive
          }))
        : [];
        
      setBranches(formattedBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las sucursales');
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las sucursales"
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [router]);

  const filteredBranches = useMemo(() => {
    if (!branches || !Array.isArray(branches)) return [];
    
    return branches.filter(branch => {
      if (!branch) return false;
      
      // Filtro por término de búsqueda
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (branch.name?.toLowerCase() || '').includes(searchTermLower) ||
        (branch.address?.toLowerCase() || '').includes(searchTermLower) ||
        (branch.province?.toLowerCase() || '').includes(searchTermLower)
      );

      // Filtro por provincia
      const matchesProvince = 
        selectedProvince === 'todas' || 
        branch.province === selectedProvince;

      return matchesSearch && matchesProvince;
    });
  }, [branches, searchTerm, selectedProvince]);

  const provinces = useMemo(() => {
    if (!Array.isArray(branches)) return [];
    const uniqueProvinces = new Set(branches.map(branch => branch.province).filter(Boolean));
    return Array.from(uniqueProvinces);
  }, [branches]);

  const branchesByProvince = useMemo(() => {
    const grouped: { [key: string]: Branch[] } = {};
    
    if (!Array.isArray(filteredBranches)) return grouped;
    
    filteredBranches.forEach(branch => {
      const province = branch.province || 'Sin provincia';
      if (!grouped[province]) {
        grouped[province] = [];
      }
      grouped[province].push(branch);
    });
    return grouped;
  }, [filteredBranches]);

  const hasResults = useMemo(() => {
    return Object.keys(branchesByProvince).length > 0;
  }, [branchesByProvince]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestión de sucursales
          </p>
        </div>
        <Button onClick={() => {
          setSelectedBranch(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sucursal
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, dirección o provincia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select 
            value={selectedProvince} 
            onValueChange={setSelectedProvince}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas las provincias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las provincias</SelectItem>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      ) : error ? (
        <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-destructive text-lg font-semibold mb-4">Error al cargar sucursales</div>
          <p className="text-muted-foreground text-center mb-6">{error}</p>
          <Button onClick={fetchBranches}>Reintentar</Button>
        </Card>
      ) : !hasResults ? (
        <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg font-semibold mb-2">No se encontraron sucursales</div>
          <p className="text-muted-foreground text-center mb-6">
            {searchTerm || selectedProvince !== 'todas' 
              ? 'No hay sucursales que coincidan con tu búsqueda.' 
              : 'No hay sucursales registradas. Puedes crear una nueva sucursal.'}
          </p>
          <Button onClick={() => {
            setSelectedBranch(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sucursal
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(branchesByProvince).map(([province, provinceBranches]) => (
            <Card key={province} className="overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold">{province}</h2>
                  </div>
                  <Badge variant="secondary">
                    {provinceBranches.length} {provinceBranches.length === 1 ? 'sucursal' : 'sucursales'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {provinceBranches.map(branch => (
                  <Card key={branch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{branch.name}</h3>
                          <Badge variant={branch.isActive ? "default" : "secondary"}>
                            {branch.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setIsDialogOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{branch.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{branch.phone}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <BranchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branch={selectedBranch}
        onSuccess={fetchBranches}
      />
      
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        branch={selectedBranch}
        onSuccess={fetchBranches}
      />
    </div>
  );
} 