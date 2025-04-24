"use client";

import { useState, useEffect, useRef } from "react";
import { UsersService } from "@/app/services/users.service";
import { ExtendedFirebaseUser, SubscriptionPlan, Branch } from "../types";
import { useDebounce } from "@/app/hooks/useDebounce";
import { customToast } from "@/app/lib/toast";

// Definir SupabaseUser de forma básica si no está importado globalmente
// (Esto es una suposición, idealmente este tipo vendría de una definición compartida)
type SupabaseUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  photo?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  birthDate?: string;
  createdAt?: string;
  lastLoginAt?: string; // Nombre diferente
  status?: string | boolean; // Tipo diferente
  accountStatus?: string | boolean;
  address?: string;
  phoneNumber?: string; // Nombre diferente
  // ...otras propiedades que pueda tener SupabaseUser
  [key: string]: any; // Permite otras propiedades
};

// Función auxiliar para mapear de forma segura
function mapUserToExtendedUser(user: SupabaseUser | ExtendedFirebaseUser): ExtendedFirebaseUser {
  // Helper para verificar existencia y tipo (más seguro que 'in' directo para TS)
  const getProp = <K extends keyof ExtendedFirebaseUser>(propName: K): ExtendedFirebaseUser[K] | undefined => {
    return user && typeof user === 'object' && propName in user ? user[propName as keyof typeof user] as ExtendedFirebaseUser[K] : undefined;
  };

  const id = user.id;
  const email = user.email;

  // Mapeo cuidadoso
  const extendedUser: ExtendedFirebaseUser = {
    id: id,
    email: email,
    // Propiedades base con valores por defecto o adaptaciones
    uid: getProp('uid') ?? id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    photo: user.photo,
    photoURL: getProp('photoURL') ?? user.photo, 
    isVerified: user.isVerified,
    isEmailVerified: user.isEmailVerified,
    emailVerified: getProp('emailVerified') ?? user.isEmailVerified ?? false,
    birthDate: user.birthDate,
    createdAt: user.createdAt,
    lastLogin: getProp('lastLogin') ?? (user as SupabaseUser).lastLoginAt, // Usa lastLoginAt si lastLogin no existe
    disabled: getProp('disabled'),
    // Maneja status (puede ser string o boolean en origen)
    status: typeof user.status === 'string' ? user.status === 'active' : (typeof user.status === 'boolean' ? user.status : undefined),
    // Propiedades extendidas
    userId: id, // Asegurar userId
    accountStatus: typeof user.accountStatus === 'boolean' ? (user.accountStatus ? 'active' : 'inactive') : (user.accountStatus as string || 'inactive'),
    planName: getProp('planName'),
    walletName: getProp('walletName'),
    branchName: getProp('branchName'),
    branchAddress: getProp('branchAddress'),
    branchProvince: getProp('branchProvince'),
    branchPhone: getProp('branchPhone'),
    branchZipcode: getProp('branchZipcode'),
    branchCity: getProp('branchCity'),
    branchLocation: getProp('branchLocation'),
    assignedLocker: getProp('assignedLocker'),
    displayMessage: getProp('displayMessage'),
    // Usa phone o phoneNumber
    phone: getProp('phone') ?? user.phoneNumber, 
    phoneNumber: user.phoneNumber ?? getProp('phone'),
    isAdmin: getProp('isAdmin'),
    address: user.address,
    verification: getProp('verification'),
    shipping_insurance: getProp('shipping_insurance'),
    planId: getProp('planId'),
    planDescription: getProp('planDescription'),
    planRate: getProp('planRate'),
    planFrequency: getProp('planFrequency'),
    planStatus: getProp('planStatus'),
    branchId: getProp('branchId'),
    price: getProp('price'),
    // Manejo seguro de objetos anidados
    subscriptionPlan: (() => {
      const plan = getProp('subscriptionPlan');
      return (typeof plan === 'object' && plan !== null && 'id' in plan && 'name' in plan) ? plan as SubscriptionPlan : undefined;
    })(),
    branch: (() => {
      const branchData = getProp('branch');
      return (typeof branchData === 'object' && branchData !== null && 'id' in branchData && 'name' in branchData) ? branchData as Branch : undefined;
    })(),
  };

  // Limpiar propiedades undefined si es necesario (opcional)
  // Object.keys(extendedUser).forEach(key => extendedUser[key as keyof ExtendedFirebaseUser] === undefined && delete extendedUser[key as keyof ExtendedFirebaseUser]);

  return extendedUser;
}

interface UseUserSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userDetails: ExtendedFirebaseUser | null;
  setUserDetails: React.Dispatch<React.SetStateAction<ExtendedFirebaseUser | null>>;
  suggestions: ExtendedFirebaseUser[];
  showSuggestions: boolean;
  loading: boolean;
  handleSearch: (query?: string) => Promise<ExtendedFirebaseUser | undefined>;
  handleSuggestionClick: (user: ExtendedFirebaseUser) => Promise<ExtendedFirebaseUser>;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  disableAutoSuggestions: (disabled: boolean) => void;
}

export function useUserSearch(): UseUserSearchResult {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<ExtendedFirebaseUser | null>(null);
  const [suggestions, setSuggestions] = useState<ExtendedFirebaseUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [autoSuggestionsDisabled, setAutoSuggestionsDisabled] = useState(false);

  const disableAutoSuggestions = (disabled: boolean) => {
    console.log(`${disabled ? '🔒 Desactivando' : '🔓 Activando'} sugerencias automáticas`);
    setAutoSuggestionsDisabled(disabled);
    
    if (disabled) {
      setSuggestions([]);
      setShowSuggestions(false);
    } else if (searchQuery.trim().length >= 2) {
      // Si estamos habilitando las sugerencias y hay una consulta válida,
      // refrescar las sugerencias inmediatamente
      fetchSuggestionsForQuery(searchQuery);
    }
  };

  const fetchSuggestionsForQuery = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const result = await UsersService.searchSuggestions(query);
      if (Array.isArray(result) && result.length > 0) {
        const extendedUsers = result.map(user => ({
          ...user,
          userId: user.id,
          accountStatus: typeof user.accountStatus === 'boolean' 
            ? (user.accountStatus ? 'active' : 'inactive') 
            : (user.accountStatus || 'inactive')
        } as unknown as ExtendedFirebaseUser));
        
        setSuggestions(extendedUsers);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("❌ Error al obtener sugerencias:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoSuggestionsDisabled) {
      return;
    }
    
    // Necesitamos esta versión inline para evitar problemas con las dependencias del efecto
    const fetchSuggestions = async () => {
      const query = debouncedSearchQuery;
      if (!query.trim() || query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const result = await UsersService.searchSuggestions(query);
        if (Array.isArray(result) && result.length > 0) {
          const extendedUsers = result.map(user => ({
            ...user,
            userId: user.id,
            accountStatus: typeof user.accountStatus === 'boolean' 
              ? (user.accountStatus ? 'active' : 'inactive') 
              : (user.accountStatus || 'inactive')
          } as unknown as ExtendedFirebaseUser));
          
          setSuggestions(extendedUsers);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("❌ Error al obtener sugerencias:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedSearchQuery, autoSuggestionsDisabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Buscando usuario:', searchTerm);
      
      let result = await UsersService.searchUser(searchTerm);
      
      if (!result && searchTerm.includes(' ')) {
        console.log('⚠️ No se encontró con búsqueda directa, intentando con sugerencias...');
        
        const suggestions = await UsersService.searchSuggestions(searchTerm);
        
        if (suggestions && suggestions.length > 0) {
          result = suggestions[0];
          console.log('✅ Usuario encontrado en sugerencias:', result?.email);
        } else {
          const firstTerm = searchTerm.split(' ')[0];
          console.log('🔍 Última chance: buscando solo con el primer término:', firstTerm);
          
          const firstTermResults = await UsersService.searchSuggestions(firstTerm);
          
          const matchingResult = firstTermResults.find(user => 
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (matchingResult) {
            result = matchingResult;
            console.log('✅ Usuario encontrado por coincidencia parcial:', result.email);
          }
        }
      }
      
      if (!result) {
        throw new Error('No se encontró el usuario');
      }

      // Usar la función de mapeo segura
      const extendedUser = mapUserToExtendedUser(result);

      const userId = extendedUser.id || extendedUser.userId;
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      setUserDetails(extendedUser);
      setSuggestions([]);
      setShowSuggestions(false);
      
      return extendedUser;
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      customToast.error({
        title: "Error de Búsqueda",
        description: error instanceof Error ? error.message : "No se pudo encontrar el usuario"
      });
      setUserDetails(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (user: ExtendedFirebaseUser) => {
    setSearchQuery(`${user.firstName} ${user.lastName}`);
    setShowSuggestions(false);
    
    try {
      setLoading(true);
      console.log('🔍 Procesando usuario seleccionado:', user);
      
      const userId = user.id || user.userId;
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }
      
      const userHasCompleteInfo = 
        user.firstName && 
        user.lastName && 
        user.email && 
        (typeof user.accountStatus !== 'undefined');
      
      if (userHasCompleteInfo) {
        console.log('✅ Usuario ya tiene datos completos, evitando consulta adicional');
        
        if (typeof user.accountStatus === 'boolean') {
          user.accountStatus = user.accountStatus ? 'active' : 'inactive';
        }
        
        setUserDetails(user);
        return user;
      }
      
      console.log('⚠️ Usuario incompleto, obteniendo más detalles...');
      const fullUserDetails = await UsersService.searchUser(userId);
      
      if (!fullUserDetails) {
        throw new Error('No se pudo obtener información completa del usuario');
      }
      
      // Usar la función de mapeo segura
      const extendedUser = mapUserToExtendedUser(fullUserDetails);
      
      setUserDetails(extendedUser);
      return extendedUser;
    } catch (error) {
      console.error("❌ Error al procesar usuario:", error);
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el usuario"
      });
      setUserDetails(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    userDetails,
    setUserDetails,
    suggestions,
    showSuggestions,
    loading,
    handleSearch,
    handleSuggestionClick,
    suggestionsRef,
    disableAutoSuggestions
  };
} 