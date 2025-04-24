'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from '@/components/ui/spinner';
import { customToast } from '@/app/components/ui/custom-toast';
import { PlanDialog } from './components/plan-dialog';
import { DeleteDialog } from './components/delete-dialog';
import { Plan } from '@/types/plans';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlansService } from '@/services/plans.service';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const plansService = useMemo(() => new PlansService(), []);
  const router = useRouter();

  useEffect(() => {
    verifyAuthentication();
    fetchPlans();
  }, []);

  const verifyAuthentication = () => {
    const token = localStorage.getItem('workexpress_token') || localStorage.getItem('token');
    
    if (!token) {
      customToast.error({
        title: "Error de autenticación",
        description: "No se encontró token de autenticación. Por favor inicie sesión nuevamente."
      });
      
      // Redireccionar al login después de un breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await plansService.getAll();
      setPlans(data);
    } catch (error: any) {
      customToast.error({
        title: "Error",
        description: error.message || "No se pudieron cargar los planes"
      });
      console.error('Error al cargar planes:', error);
      
      // Si hay un error de autenticación, redirigir al login
      if (error.message?.includes('Sesión expirada') || error.message?.includes('no autorizada')) {
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = 
        plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProvince = 
        selectedProvince === 'todas' || 
        !selectedProvince || 
        plan.branch?.province === selectedProvince;

      return matchesSearch && matchesProvince;
    });
  }, [plans, searchTerm, selectedProvince]);

  const provinces = useMemo(() => {
    const uniqueProvinces = new Set(plans.map(plan => plan.branch?.province).filter(Boolean)) as Set<string>;
    return Array.from(uniqueProvinces);
  }, [plans]);

  const plansByProvince = useMemo(() => {
    const grouped: { [key: string]: Plan[] } = {};
    filteredPlans.forEach(plan => {
      const province = plan.branch?.province || 'Sin provincia';
      if (!grouped[province]) {
        grouped[province] = [];
      }
      grouped[province].push(plan);
    });
    return grouped;
  }, [filteredPlans]);

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestión de planes
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPlan(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={selectedProvince}
          onValueChange={setSelectedProvince}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas las sucursales" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las sucursales</SelectItem>
            {provinces.filter(Boolean).map(province => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(plansByProvince).map(([province, provincePlans]) => (
            <div key={province} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#2c2c2c]/10 to-transparent border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {province}
                  </h2>
                  <Badge variant="secondary">
                    {provincePlans.length} {provincePlans.length === 1 ? 'plan' : 'planes'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {provincePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="group relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <Badge 
                          variant={plan.isActive ? "default" : "secondary"}
                          className="mb-3"
                        >
                          {plan.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2">{plan.planName}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-900">
                            ${typeof plan.price === 'string' ? parseFloat(plan.price).toFixed(2) : plan.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 ml-1 text-sm">USD</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
      
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
} 