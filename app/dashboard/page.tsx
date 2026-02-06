'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { resolvePublicAssetUrl } from '../../lib/assetUtils';
import { useUserPlan } from '../context/UserPlanContext';
import PrivateLayout from '../components/PrivateLayout';
import Spinner from '../components/Spinner';
import StateBar from './components/StateBar';
import BusinessSelector from './components/BusinessSelector';
import MenuEditor from './components/MenuEditor';
import MenuPreview from './components/MenuPreview';
import PlanBadge from './components/PlanBadge';
import TemplatesSection from './components/TemplatesSection';
import type { ImageStorageEvent } from './components/ImageUpload';

const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
const storagePublicPrefix = supabaseBaseUrl
  ? `${supabaseBaseUrl}/storage/v1/object/public/menu-images/`
  : '';

const storageUrlToPath = (url?: string | null) => {
  if (!url || !storagePublicPrefix) return null;
  if (!url.startsWith(storagePublicPrefix)) return null;
  return decodeURIComponent(url.slice(storagePublicPrefix.length));
};

type PendingFile = {
  path: string;
  businessId: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [theme, setTheme] = useState('orange');
  const [menuData, setMenuData] = useState<any>({
    id: null,
    businessLogo: null,
    logoMode: 'logo-name',
    logoSize: 100,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoOnlyOffsetX: 0,
    logoOnlyOffsetY: 0,
    categories: [],
  });

  // Estado para importación
  const [previousMenu, setPreviousMenu] = useState<any>(null);
  const [previousTheme, setPreviousTheme] = useState<string>('orange');

  const pendingUploadsRef = useRef<Map<string, PendingFile>>(new Map());
  const pendingDeletionsRef = useRef<Map<string, PendingFile>>(new Map());

  const resetPendingImageQueues = useCallback(() => {
    pendingUploadsRef.current.clear();
    pendingDeletionsRef.current.clear();
  }, []);

  const registerImageStorageEvent = useCallback((event: ImageStorageEvent) => {
    if (!event.businessId) return;

    if (event.type === 'upload') {
      if (event.storagePath) {
        pendingUploadsRef.current.set(event.storagePath, {
          path: event.storagePath,
          businessId: event.businessId,
        });
      }

      if (event.previousUrl) {
        const previousPath = storageUrlToPath(event.previousUrl);
        if (previousPath) {
          pendingDeletionsRef.current.set(previousPath, {
            path: previousPath,
            businessId: event.businessId,
          });
        }
      }
    } else if (event.type === 'delete') {
      if (event.previousUrl) {
        const previousPath = storageUrlToPath(event.previousUrl);
        if (previousPath) {
          pendingDeletionsRef.current.set(previousPath, {
            path: previousPath,
            businessId: event.businessId,
          });
        }
      }
    }
  }, []);

  const deleteStorageEntries = useCallback(async (entries: PendingFile[]) => {
    if (!entries.length) return;

    let authToken = token;
    if (!authToken) {
      const { data: { session } } = await supabase.auth.getSession();
      authToken = session?.access_token || '';
    }

    if (!authToken) {
      console.error('❌ No hay token para eliminar archivos de Storage');
      return;
    }

    await Promise.all(
      entries.map(async ({ path, businessId }) => {
        try {
          const response = await fetch('/api/upload-image', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storagePath: path,
              businessId,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error eliminando archivo de Storage', path, errorText);
          }
        } catch (error) {
          console.error('❌ Error en petición de borrado de Storage', path, error);
        }
      })
    );
  }, [token]);

  const finalizeImageChangesAfterSave = useCallback(async () => {
    const deletions = Array.from(pendingDeletionsRef.current.values());
    if (deletions.length > 0) {
      await deleteStorageEntries(deletions);
    }
    pendingDeletionsRef.current.clear();
    pendingUploadsRef.current.clear();
  }, [deleteStorageEntries]);

  const discardImageChanges = useCallback(async () => {
    const uploads = Array.from(pendingUploadsRef.current.values());
    if (uploads.length > 0) {
      await deleteStorageEntries(uploads);
    }
    pendingUploadsRef.current.clear();
    pendingDeletionsRef.current.clear();
  }, [deleteStorageEntries]);

  const { plan: userPlan } = useUserPlan();
  const isDemo = !userPlan || userPlan === null;

  // Obtener máximo de negocios según plan
  const getMaxBusinesses = () => {
    if (userPlan === 'free') return 1;
    if (userPlan === 'menu') return 3;
    if (userPlan === 'ventas') return 5;
    return 1; // Default
  };

  const maxBusinesses = getMaxBusinesses();

  // Calcular número total de productos
  const getTotalProducts = () => {
    return menuData.categories?.reduce((total: number, cat: any) => {
      return total + (cat.products?.length || 0);
    }, 0) || 0;
  };

  // Obtener conteo de productos para todos los negocios
  const getBusinessProductCount = async (businessId: number, authToken: string): Promise<number> => {
    try {
      const response = await fetch(`/api/dashboard/load-menu?businessId=${businessId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.menu) {
        const loadedMenu = result.menu.menu_data;
        return loadedMenu.categories?.reduce((total: number, cat: any) => {
          return total + (cat.products?.length || 0);
        }, 0) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting product count for business:', businessId, error);
      return 0;
    }
  };

  // Cargar conteos de productos para todos los negocios
  const loadAllBusinessProductCounts = async (businessesList: any[], authToken: string) => {
    const businessesWithCounts = await Promise.all(
      businessesList.map(async (b) => ({
        ...b,
        items: await getBusinessProductCount(b.id, authToken),
      }))
    );
    return businessesWithCounts;
  };

  // Obtener menú por defecto para nuevos negocios (SIN categorías ni productos)
  const getDefaultMenu = () => ({
    id: null,
    businessLogo: null,
    logoMode: 'logo-name',
    logoSize: 100,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoOnlyOffsetX: 0,
    logoOnlyOffsetY: 0,
    categories: [],
    whatsappNumber: '',
    businessHours: '',
    menuSubtitle: 'Menú Digital QR',
  });

  // Agregar nuevo negocio
  const handleAddBusiness = async () => {
    try {
      // Validar límite de negocios según plan
      if (businesses.length >= maxBusinesses) {
        alert(`❌ Límite de negocios alcanzado (${maxBusinesses}/${maxBusinesses})`);
        return;
      }

      // Crear negocio en Supabase
      const { data: newBusinessData, error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: `Negocio ${businesses.length + 1}`,
          logo: '🏪',
        })
        .select();

      if (error) {
        console.error('Error creando negocio:', error);
        alert('Error al crear negocio');
        return;
      }

      if (newBusinessData && newBusinessData.length > 0) {
        const newBusiness = { ...newBusinessData[0], items: 0 };
        const updatedBusinesses = [...businesses, newBusiness];
        setBusinesses(updatedBusinesses);
        setSelectedBusiness(newBusiness);

        // 🎯 Crear menú inicial automáticamente
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const authToken = session?.access_token;

          if (authToken) {
            const initialMenuData = {
              businessLogo: null,
              logoMode: 'logo-name',
              logoSize: 100,
              logoOffsetX: 0,
              logoOffsetY: 0,
              logoOnlyOffsetX: 0,
              logoOnlyOffsetY: 0,
              categories: [],
              businessName: `Negocio ${businesses.length + 1}`,
              menuSubtitle: 'Menú Digital QR',
            };

            const response = await fetch('/api/dashboard/save-menu', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                businessId: newBusiness.id,
                businessName: `Negocio ${businesses.length + 1}`,
                theme: 'orange',
                menuData: initialMenuData,
              }),
            });

            const result = await response.json();
            if (result.success && result.menu) {
              // 🎯 ASIGNAR EL ID DEL MENÚ CREADO INMEDIATAMENTE
              // ⭐ INCLUIR EL custom_slug REAL (que puede tener hash si hay colisión)
              const newMenuWithId = {
                ...initialMenuData,
                id: result.menu.id,
                customSlug: result.menu.custom_slug, // URL real con hash si aplica
              };
              setMenuData(newMenuWithId);
              console.log('✅ Menú inicial creado automáticamente con ID:', result.menu.id);
              console.log('✅ URL asignado:', result.menu.custom_slug);
            }
          }
        } catch (error) {
          console.error('⚠️ Error creando menú inicial:', error);
          // No es crítico - el menú se puede crear después
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear negocio');
    }
  };

  // Guardar nombre del negocio (manual - con botón o Enter)
  const handleSaveBusinessName = useCallback(async () => {
    if (!selectedBusiness?.id || !user) return;
    
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ name: selectedBusiness.name })
        .eq('id', selectedBusiness.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error actualizando nombre del negocio:', error);
        alert('Error al guardar nombre');
      } else {
        // Actualizar la lista de negocios localmente
        const updatedBusinesses = businesses.map((b) =>
          b.id === selectedBusiness.id ? { ...b, name: selectedBusiness.name } : b
        );
        setBusinesses(updatedBusinesses);
        
        // ⭐ ACTUALIZAR lastSavedJSON CON EL NUEVO NOMBRE
        lastSavedJSON.current = JSON.stringify({
          menuData,
          theme,
          businessName: selectedBusiness.name,
          businessId: selectedBusiness.id,
        });
        
        console.log('✅ Nombre del negocio guardado:', selectedBusiness.name);
        alert('Nombre guardado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar nombre');
    }
  }, [selectedBusiness, user, businesses, menuData, theme]);

  // Eliminar negocio
  const handleDeleteBusiness = useCallback(async () => {
    if (!selectedBusiness?.id || !user) return;
    
    const confirmed = window.confirm(`¿Eliminar "${selectedBusiness.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      // Eliminar menú asociado
      await supabase
        .from('menus')
        .delete()
        .eq('business_id', selectedBusiness.id)
        .eq('user_id', user.id);

      // Eliminar negocio
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', selectedBusiness.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error eliminando negocio:', error);
        alert('Error al eliminar negocio');
        return;
      }

      // Actualizar lista de negocios
      const updatedBusinesses = businesses.filter((b) => b.id !== selectedBusiness.id);
      setBusinesses(updatedBusinesses);

      // Seleccionar el primer negocio si hay
      if (updatedBusinesses.length > 0) {
        setSelectedBusiness(updatedBusinesses[0]);
        await loadMenuFromSupabase(user.id, token, updatedBusinesses[0].id);
      } else {
        // Si no hay negocios, resetear todo
        setSelectedBusiness(null);
        setMenuData(getDefaultMenu());
        setTheme('orange');
        lastSavedJSON.current = ''; // Limpiar el estado guardado
        setHasUnsavedChanges(false);
      }

      console.log('✅ Negocio eliminado:', selectedBusiness.name);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar negocio');
    }
  }, [selectedBusiness, user, businesses, token]);

  // Manejar Enter en el input del nombre
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveBusinessName();
    }
  };

  // 🚀 NUEVA: Precarga TODOS los menús en una sola solicitud
  const preloadAllMenus = async (authToken: string) => {
    try {
      const response = await fetch('/api/dashboard/load-all-menus', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.menus && Array.isArray(result.menus)) {
        // Guardar todos los menús en el Map por business_id
        allMenusRef.current.clear();
        result.menus.forEach((menu: any) => {
          allMenusRef.current.set(menu.business_id, menu);
        });
        console.log(`✅ Precargados ${result.menus.length} menús`);
      }
    } catch (error) {
      console.error('Error precargando menús:', error);
    }
  };

  // Cargar menú desde Supabase (específico del negocio seleccionado)
  const loadMenuFromSupabase = async (userId: string, authToken: string, businessId?: number) => {
    try {
      // ✅ Indicar que estamos cargando para que change detection no se dispare
      isLoadingMenuRef.current = true;
      
      // ⭐ OBTENER EL NOMBRE CORRECTO DEL NEGOCIO DE LA LISTA
      const actualBusinessId = businessId || selectedBusiness?.id;
      const businessFromList = businesses.find(b => b.id === actualBusinessId);
      const correctBusinessName = businessFromList?.name || selectedBusiness?.name || 'Mi Restaurante';
      
      // 🚀 PRIMERO: Intentar obtener del cache precargado
      let menu = allMenusRef.current.get(actualBusinessId);
      
      if (!menu) {
        // Si no está en cache, hacer solicitud individual (fallback)
        const response = await fetch(`/api/dashboard/load-menu?businessId=${actualBusinessId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const result = await response.json();
        menu = result.success ? result.menu : null;
      }
      
      if (menu) {
        console.log('📥 Menú cargado para negocio:', businessId);
        console.log('🎨 TEMA CARGADO:', {
          theme: menu.theme,
          theme_tipo: typeof menu.theme,
          theme_length: menu.theme?.length,
        });
        
        const loadedMenu = menu.menu_data;
        const newMenuData = {
          ...loadedMenu,
          id: menu.id,
          // ⭐ ASIGNAR EL custom_slug REAL DE LA BD (que puede incluir hash)
          customSlug: menu.custom_slug,
        };
        const newTheme = menu.theme || 'orange';
        
        console.log('🎨 TEMA A APLICAR:', newTheme);
        
        // ACTUALIZAR lastSavedJSON CON LOS NUEVOS VALORES ANTES DE ACTUALIZAR STATE
        const loadedData = {
          menuData: newMenuData,
          theme: newTheme,
          businessName: correctBusinessName,
          businessId: actualBusinessId,
        };
        lastSavedJSON.current = JSON.stringify(loadedData);
        justLoadedRef.current = true; // Marcar que acabamos de cargar
        
        // LUEGO actualizar el estado
        setMenuData(newMenuData);
        setTheme(newTheme);
        setHasUnsavedChanges(false);
        resetPendingImageQueues();
      } else {
        // Si no hay menú guardado, usar valores por defecto
        console.log('📄 Nuevo negocio - usando menú por defecto para negocio:', businessId);
        const defaultMenu = getDefaultMenu();
        const defaultTheme = 'orange';
        
        // ACTUALIZAR lastSavedJSON CON LOS NUEVOS VALORES ANTES DE ACTUALIZAR STATE
        lastSavedJSON.current = JSON.stringify({
          menuData: defaultMenu,
          theme: defaultTheme,
          businessName: correctBusinessName,
          businessId: actualBusinessId,
        });
        justLoadedRef.current = true; // Marcar que acabamos de cargar
        
        // LUEGO actualizar el estado
        setMenuData(defaultMenu);
        setTheme(defaultTheme);
        setHasUnsavedChanges(false);
        resetPendingImageQueues();
      }
    } catch (error) {
      console.error('Error loading menu from Supabase:', error);
      // En caso de error, usar menú por defecto también
      const actualBusinessId = businessId || selectedBusiness?.id;
      const businessFromList = businesses.find(b => b.id === actualBusinessId);
      const correctBusinessName = businessFromList?.name || selectedBusiness?.name || 'Mi Restaurante';
      
      setMenuData(getDefaultMenu());
      setTheme('orange');
      lastSavedJSON.current = JSON.stringify({
        menuData: getDefaultMenu(),
        theme: 'orange',
        businessName: correctBusinessName,
        businessId: actualBusinessId,
      });
      setHasUnsavedChanges(false);
      resetPendingImageQueues();
    } finally {
      // ✅ Permitir que change detection se dispare nuevamente
      isLoadingMenuRef.current = false;
    }
  };

  // Guardar menú en Supabase
  const saveMenuToSupabase = async (authToken?: string) => {
    try {
      // Si no se pasa token, obtenerlo de la sesión actual
      let finalToken = authToken;
      
      if (!finalToken) {
        const { data: { session } } = await supabase.auth.getSession();
        finalToken = session?.access_token;
      }

      if (!finalToken) {
        console.error('❌ No hay token de autenticación');
        return false;
      }

      if (!selectedBusiness?.id) {
        console.error('❌ No hay negocio seleccionado');
        return false;
      }

      const payload = {
        businessId: selectedBusiness.id,
        businessName: selectedBusiness?.name || 'Mi Restaurante',
        theme: theme,
        // ⭐ Enviar customSlug al servidor para validación, pero NO en el JSON
        customSlug: menuData.customSlug || undefined,
        menuData: (() => {
          const { customSlug, ...cleanMenuData } = menuData;
          return cleanMenuData;
        })(),
      };

      console.log('💾 GUARDANDO - Payload exacto:', {
        businessId: selectedBusiness.id,
        theme: theme,
        theme_tipo: typeof theme,
        theme_length: theme?.length,
        customSlug: menuData.customSlug,
        customSlug_existe: !!menuData.customSlug,
        customSlug_tipo: typeof menuData.customSlug,
        menuData_keys: Object.keys(menuData),
      });

      const response = await fetch('/api/dashboard/save-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // 🚨 Manejo de error 409 - URL duplicada
      if (response.status === 409) {
        console.error('⚠️ URL ya existe:', result.error);
        const suggestion = result.suggestion;
        const message = result.message || result.error;
        alert(`${message}\n\n💡 Sugerencia: ${suggestion}`);
        return false;
      }

      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status}:`, response.statusText);
        alert(`Error al guardar: ${result.error || response.statusText}`);
        return false;
      }

      if (result.success) {
        console.log('✅ Menú guardado en Supabase para negocio:', selectedBusiness.id);
        
        // 🚀 ACTUALIZAR CACHE después de guardar
        if (result.menu) {
          allMenusRef.current.set(selectedBusiness.id, result.menu);
          console.log('✅ Cache actualizado para negocio:', selectedBusiness.id);
          
          // 📝 SIEMPRE actualizar customSlug si viene en la respuesta del servidor
          // Esto asegura que se refleje el URL real (que puede incluir hash si hay colisión)
          const serverSlug = result.menu.custom_slug;
          const currentSlug = menuData.customSlug;
          
          console.log('🔍 Comparando slugs:', {
            serverSlug,
            currentSlug,
            sonIguales: serverSlug === currentSlug,
            truthy_serverSlug: !!serverSlug,
          });
          
          if (serverSlug && serverSlug !== currentSlug) {
            console.log('📝 Actualizando URL en menuData de:', currentSlug, 'a:', serverSlug);
            setMenuData((prev: any) => ({
              ...prev,
              customSlug: serverSlug,
            }));
          } else if (serverSlug && serverSlug === currentSlug) {
            console.log('✅ URL ya está actualizado en menuData:', serverSlug);
          } else {
            console.log('⚠️ serverSlug es falsy:', { serverSlug, type: typeof serverSlug });
          }
        }

        // 💾 Guardar slug personalizado en la tabla menus (se guarda con el payload principal)
        
        return true;
      } else {
        console.error('❌ Error al guardar:', result.error);
        alert(`Error: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en saveMenuToSupabase:', error);
      alert('Error al guardar menú');
      return false;
    }
  };

  // Importar menú desde JSON
  const handleImportMenu = async () => {
    try {
      // Leer archivo JSON de ejemplo
      const response = await fetch('/menu-import-sample.json');
      const importedData = await response.json();

      if (!importedData.categories) {
        alert('Formato JSON inválido');
        return;
      }

      // Guardar estado anterior para poder descartar
      setPreviousMenu(JSON.parse(JSON.stringify(menuData)));
      setPreviousTheme(theme);

      // Procesar datos importados
      const processedMenu = {
        ...menuData,
        categories: importedData.categories.map((cat: any) => ({
          id: cat.id || `cat-${Date.now()}-${Math.random()}`,
          name: cat.name,
          products: (cat.products || []).map((prod: any) => ({
            id: prod.id || `prod-${Date.now()}-${Math.random()}`,
            name: prod.name,
            description: prod.description || '',
            price: prod.price || 0,
            imageUrl: prod.image_url || '',
            active: prod.active !== false,
            // ⭐ IMPORTANTE: Habilitar variantes si el producto tiene tamaños
            hasVariants: (prod.sizes && prod.sizes.length > 0) ? true : false,
            // Guardar en la estructura correcta: variants.sizes
            variants: {
              sizes: (prod.sizes || []).map((size: any) => ({
                id: size.id || `size-${Date.now()}-${Math.random()}`,
                name: size.name,
                price: size.price || 0,
                allowCombinations: size.allowCombinations !== false,
              })),
            },
          })),
        })),
      };

      // Cargar el menú directamente
      setMenuData(processedMenu);
      setTheme(importedData.theme || 'orange');
      
      // Marcar como con cambios sin guardar
      setHasUnsavedChanges(true);
      
      alert(`✅ Menú cargado: ${importedData.categories.length} categorías, ${importedData.categories.reduce((t: number, c: any) => t + (c.products?.length || 0), 0)} productos\n\nVe el preview y decide si guardas o descartas.`);
      console.log('📦 Menú importado correctamente');
    } catch (error) {
      console.error('Error importando menú:', error);
      alert('Error al importar menú');
    }
  };

  // Cargar plantillas predefinidas
  const loadTemplate = async (type: string) => {
    try {
      const response = await fetch('/menu-templates.json');
      const templatesData = await response.json();
      const selectedTemplate = templatesData[type];

      if (!selectedTemplate) {
        alert('Plantilla no encontrada');
        return;
      }

      // Guardar estado anterior para poder descartar
      setPreviousMenu(JSON.parse(JSON.stringify(menuData)));
      setPreviousTheme(theme);

      // Reasignar IDs para evitar conflictos
      const newCategories = selectedTemplate.categories.map((cat: any, catIdx: number) => ({
        ...cat,
        id: Date.now() + catIdx,
        products: cat.products.map((prod: any, prodIdx: number) => ({
          ...prod,
          id: Date.now() + catIdx + prodIdx,
          imageUrl: resolvePublicAssetUrl(prod.imageUrl),
          variants: {
            ...prod.variants,
            sizes: (prod.variants?.sizes || []).map((size: any, sizeIdx: number) => ({
              ...size,
              id: Date.now() + catIdx + prodIdx + sizeIdx,
            })),
          },
        })),
      }));

      const newMenu = {
        ...menuData,
        categories: newCategories,
      };

      setMenuData(newMenu);
      setHasUnsavedChanges(true);
      alert(`✅ Plantilla de ${selectedTemplate.name} cargada. Personaliza los datos según tu negocio.`);
    } catch (error) {
      console.error('Error cargando plantilla:', error);
      alert('Error al cargar la plantilla');
    }
  };

  // Cargar usuario y menú
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUser(session.user);
      setToken(session.access_token);

      // Cargar negocios del usuario desde Supabase
      try {
        const { data: userBusinesses } = await supabase
          .from('businesses')
          .select('id, name, logo')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        let businesses = userBusinesses || [];

        if (!businesses.length) {
          console.log('⚠️ Usuario sin negocios - creando uno por defecto');
          const { data: defaultBusiness, error: defaultBusinessError } = await supabase
            .from('businesses')
            .insert({
              user_id: session.user.id,
              name: 'Mi Restaurante',
              logo: '🍽️',
            })
            .select('id, name, logo')
            .single();

          if (defaultBusinessError) {
            console.error('❌ No se pudo crear negocio por defecto:', defaultBusinessError);
          } else if (defaultBusiness) {
            businesses = [defaultBusiness];
          }
        }

        if (!businesses.length) {
          throw new Error('No se pudieron recuperar o crear negocios para este usuario');
        }

        // 🚀 NUEVA: Precarga TODOS los menús en una sola solicitud
        await preloadAllMenus(session.access_token);

        // Cargar conteos de productos para todos los negocios
        const businessesWithCounts = await loadAllBusinessProductCounts(businesses, session.access_token);
        
        setBusinesses(businessesWithCounts);
        setSelectedBusiness(businessesWithCounts[0]);

        // Cargar menú del primer negocio (AHORA DESDE CACHE)
        await loadMenuFromSupabase(session.user.id, session.access_token, businessesWithCounts[0].id);
      } catch (error) {
        console.error('Error cargando negocios:', error);
        // Fallback a negocio mock si hay error
        const mockBusinesses = [
          { id: 1, name: 'Mi Restaurante', logo: '🍽️', items: 0 },
        ];
        setBusinesses(mockBusinesses);
        setSelectedBusiness(mockBusinesses[0]);
        await loadMenuFromSupabase(session.user.id, session.access_token, 1);
      }

      setLoading(false);
    };
    load();
  }, []);

  // Cargar menú cuando cambias de negocio
  useEffect(() => {
    if (selectedBusiness?.id && token) {
      console.log('📂 Cambiando a negocio:', selectedBusiness.id);
      // ✅ Indicar que estamos en transición
      isLoadingMenuRef.current = true;
      setHasUnsavedChanges(false);
      // Limpiar inmediatamente para evitar mostrar imágenes del negocio anterior
      setMenuData(getDefaultMenu());
      setTheme('orange');
      // Luego cargar el menú correcto del nuevo negocio
      loadMenuFromSupabase(user?.id, token, selectedBusiness.id);
    }
  }, [selectedBusiness?.id]);

  // Escuchar evento de guardar nombre del negocio
  useEffect(() => {
    const handleSaveName = () => {
      handleSaveBusinessName();
    };

    const handleDelete = () => {
      handleDeleteBusiness();
    };

    const handleImport = () => {
      handleImportMenu();
    };

    window.addEventListener('saveBusinessName', handleSaveName);
    window.addEventListener('deleteBusinessName', handleDelete);
    window.addEventListener('importMenu', handleImport);
    return () => {
      window.removeEventListener('saveBusinessName', handleSaveName);
      window.removeEventListener('deleteBusinessName', handleDelete);
      window.removeEventListener('importMenu', handleImport);
    };
  }, [handleSaveBusinessName, handleDeleteBusiness, handleImportMenu]);

  // Auto-guardar cuando menuData o theme cambian (con debounce + change detection)
  // Detectar cambios sin guardar automáticamente
  const lastSavedJSON = useRef<string>('');
  const lastBusinessIdRef = useRef<number | null>(null);
  const isLoadingMenuRef = useRef<boolean>(false);
  const allMenusRef = useRef<Map<number, any>>(new Map()); // 🚀 PRECARGA DE TODOS LOS MENÚS
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const savingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const justLoadedRef = useRef<boolean>(false); // Flag para ignorar cambios justo después de cargar
  
  useEffect(() => {
    if (loading || !selectedBusiness?.id || isLoadingMenuRef.current) return;

    // Si acabamos de cambiar de negocio, no ejecutar validación de cambios
    // (lastSavedJSON ya fue actualizado en loadMenuFromSupabase)
    if (lastBusinessIdRef.current !== selectedBusiness.id) {
      lastBusinessIdRef.current = selectedBusiness.id;
      justLoadedRef.current = true; // Marcar que acabamos de cambiar de negocio
      return;
    }

    // Ignorar cambios si acabamos de cargar datos
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    // Crear JSON string de los datos actuales
    const dataToSave = {
      menuData,
      theme,
      businessName: selectedBusiness?.name || 'Mi Restaurante',
      businessId: selectedBusiness.id,
    };

    const currentJSON = JSON.stringify(dataToSave);

    // Comparar con lo último guardado
    if (lastSavedJSON.current) {
      // Si el estado actual es igual al guardado, NO hay cambios
      if (currentJSON === lastSavedJSON.current) {
        setHasUnsavedChanges(false);
      } 
      // Si es diferente, SÍ hay cambios
      else {
        setHasUnsavedChanges(true);
        console.log('⚠️ Cambios sin guardar detectados');
      }
    } else {
      // Primera carga - establecer como base guardada
      lastSavedJSON.current = currentJSON;
      setHasUnsavedChanges(false);
    }
  }, [menuData, theme, selectedBusiness, loading]);

  if (loading || !user) {
    return (
      <PrivateLayout user={user}>
        <div className="min-h-screen flex justify-center items-center">
          <Spinner />
        </div>
      </PrivateLayout>
    );
  }

  const renderSavingStatusBanner = () => {
    if (!(hasUnsavedChanges || isSaving)) return null;

    return (
      <div
        className={`rounded-2xl p-4 transition-all duration-300 border ${
          savingStatus === 'saving'
            ? 'bg-blue-50 border-blue-300 text-blue-900'
            : savingStatus === 'success'
            ? 'bg-green-50 border-green-300 text-green-900'
            : savingStatus === 'error'
            ? 'bg-red-50 border-red-300 text-red-900'
            : 'bg-yellow-50 border-yellow-300 text-yellow-900'
        }`}
      >
        {savingStatus === 'saving' && (
          <div className="flex items-center gap-3 font-semibold justify-center">
            <div className="animate-spin text-xl">⏳</div>
            <span>Guardando cambios...</span>
          </div>
        )}

        {savingStatus === 'success' && (
          <div className="flex items-center gap-3 font-semibold justify-center">
            <span className="text-xl">✅</span>
            <span>Cambios guardados</span>
          </div>
        )}

        {savingStatus === 'error' && (
          <div className="flex items-center gap-3 font-semibold justify-center">
            <span className="text-xl">❌</span>
            <span>Error al guardar</span>
          </div>
        )}

        {savingStatus === 'idle' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold justify-center">
              <span className="text-lg">⚠️</span>
              Cambios sin guardar
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={async () => {
                  setSavingStatus('saving');
                  setIsSaving(true);

                  const success = await saveMenuToSupabase(token);
                  if (success) {
                    await finalizeImageChangesAfterSave();
                    lastSavedJSON.current = JSON.stringify({
                      menuData,
                      theme,
                      businessName: selectedBusiness.name,
                    });
                    setHasUnsavedChanges(false);
                    setSavingStatus('success');
                    if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current);
                    savingTimeoutRef.current = setTimeout(() => {
                      setIsSaving(false);
                      setSavingStatus('idle');
                    }, 2000);
                  } else {
                    setSavingStatus('error');
                    if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current);
                    savingTimeoutRef.current = setTimeout(() => {
                      setIsSaving(false);
                      setSavingStatus('idle');
                    }, 3000);
                  }
                }}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                💾 Guardar
              </button>

              <button
                onClick={async () => {
                  if (lastSavedJSON.current) {
                    try {
                      await discardImageChanges();
                      const lastSavedData = JSON.parse(lastSavedJSON.current);
                      setMenuData(JSON.parse(JSON.stringify(lastSavedData.menuData)));
                      setTheme(lastSavedData.theme);

                      setSelectedBusiness((prev: any) => ({
                        ...prev,
                        name: lastSavedData.businessName,
                      }));

                      setHasUnsavedChanges(false);
                      window.dispatchEvent(new CustomEvent('discardChanges'));

                      console.log('✅ Cambios descartados');
                    } catch (error) {
                      console.error('Error al descartar cambios:', error);
                      alert('❌ Error al descartar cambios');
                    }
                  }
                }}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                🔄 Descartar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <PrivateLayout user={user}>
      <div className="space-y-6">
        {/* STATE BAR */}
        <StateBar isDemo={isDemo} plan={userPlan} />

        {/* UPGRADE BANNER FOR FREE PLAN */}
        {userPlan === 'free' && (
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-purple-700">Desbloquea el QR imprimible</p>
              <p className="text-sm text-purple-600/80 mt-1 max-w-2xl whitespace-nowrap">
                Actualiza a <span className="font-semibold">Scanela Menús</span> para compartir tu menú con un código QR descargable, más negocios y soporte prioritario.
              </p>
            </div>
            <Link
              href="/settings?tab=plan"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-5 py-2.5 shadow-md transition"
            >
              🚀 Actualizar plan
            </Link>
          </div>
        )}

        {/* BUSINESS SELECTOR - CARD STYLE */}
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
            <p className="text-4xl mb-3">🏪</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin negocios aún</h2>
            <p className="text-gray-600 mb-6">Crea tu primer negocio para comenzar a gestionar menús</p>
            {!isDemo && (
              <button
                onClick={handleAddBusiness}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
              >
                <Plus size={20} />
                Crear primer negocio
              </button>
            )}
            {isDemo && (
              <p className="text-sm text-red-600 font-semibold">Inicia sesión para crear negocios</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col xl:flex-row xl:flex-wrap gap-4 items-stretch">
              {/* Business Selector + Counter */}
              <div className="flex-1 min-w-[280px]">
                <BusinessSelector
                  businesses={businesses.map((b) => ({
                    ...b,
                    items: selectedBusiness?.id === b.id ? getTotalProducts() : (b.items || 0),
                  }))}
                  selected={selectedBusiness}
                  onSelect={setSelectedBusiness}
                  onAddBusiness={handleAddBusiness}
                  onDeleteBusiness={handleDeleteBusiness}
                  canAddBusiness={!isDemo && businesses.length < maxBusinesses}
                  isDemo={isDemo}
                />

                {!isDemo && businesses.length < maxBusinesses && (
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      onClick={handleAddBusiness}
                      className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-white px-4 py-1 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition"
                    >
                      <span aria-hidden>➕</span>
                      Agregar negocio
                    </button>

                    <button
                      onClick={handleDeleteBusiness}
                      className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-red-300 bg-white px-4 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition"
                      title="Eliminar este negocio"
                    >
                      <span aria-hidden>🗑️</span>
                      Eliminar
                    </button>
                  </div>
                )}

                {!isDemo && businesses.length >= maxBusinesses && (
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={handleDeleteBusiness}
                      className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-red-300 bg-white px-4 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition"
                      title="Eliminar este negocio"
                    >
                      <span aria-hidden>🗑️</span>
                      Eliminar
                    </button>
                  </div>
                )}

              </div>

              {/* Quick Templates */}
              <div className="w-full xl:w-[360px] rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-white via-slate-50 to-gray-100 p-3 shadow-inner">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Plantillas rápidas <span className="text-gray-400">—</span> <span className="text-gray-600">Carga un menú en 3 clics</span>
                  </p>
                </div>
                <TemplatesSection onLoadTemplate={loadTemplate} />
              </div>

              {/* Plan Badge */}
              <div className="w-full sm:w-auto flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-3 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wider">Plan Actual</p>
                <PlanBadge businessCount={businesses.length} />
                {!isDemo && maxBusinesses && (
                  <div className="mt-3 flex flex-col items-center gap-2 text-center">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 text-blue-700 px-4 py-1 text-xs font-semibold shadow-sm">
                      <span>
                        {businesses.length}/{maxBusinesses}
                      </span>
                      <span className="uppercase tracking-wide text-[10px] font-semibold text-blue-600/80">
                        negocios disponibles
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Premium Actions */}
              {selectedBusiness && (
                <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[240px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center sm:text-left">Acciones Premium</p>
                  
                  <div className="flex flex-col gap-2 w-full">
                    {/* QR Button */}
                    <button
                      onClick={() => {
                        if (!menuData.id) {
                          alert('Por favor, espera a que el menú se cargue.');
                          return;
                        }
                        window.open(`/qr/print/${menuData.id}`, '_blank');
                      }}
                      disabled={!menuData.id || !selectedBusiness?.id}
                      className={`w-full font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md whitespace-nowrap text-sm font-medium ${
                        (menuData.id && selectedBusiness?.id)
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                      title={
                        !selectedBusiness?.id
                          ? '⚠️ Selecciona un negocio'
                          : !menuData.id 
                          ? '⚠️ Cargando menú...' 
                          : '📋 Generar QR Imprimible'
                      }
                    >
                      <span>📋</span>
                      Generar QR
                    </button>

                    {/* Analytics Button */}
                    <button
                      onClick={() => {
                        if (userPlan === 'ventas') {
                          window.location.href = '/dashboard/analytics';
                        }
                      }}
                      disabled={userPlan !== 'ventas'}
                        className={`w-full font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md whitespace-nowrap text-sm font-medium ${
                        userPlan === 'ventas'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                      title={
                        userPlan === 'ventas'
                          ? '📊 Ver Analytics'
                          : '🔒 Analytics bloqueado'
                      }
                    >
                      <span>📊</span>
                      Analytics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SAVING STATUS BANNER */}
        {renderSavingStatusBanner()}

        {/* MAIN CONTENT: EDITOR + PREVIEW */}
        {selectedBusiness ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* LEFT PANEL: TEMPLATES + EDITOR */}
          <div className="flex flex-col gap-4">
            {/* EDITOR PANEL */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col flex-1">
              <MenuEditor
                menu={menuData}
                onUpdate={setMenuData}
                businessName={selectedBusiness.name}
                businessId={selectedBusiness.id}
                onBusinessNameChange={(newName) => {
                  setSelectedBusiness((prev: any) => ({
                    ...prev,
                    name: newName,
                  }));
                  // Actualizar también en la lista de negocios
                  setBusinesses((prevBusinesses) =>
                    prevBusinesses.map((b) =>
                      b.id === selectedBusiness.id ? { ...b, name: newName } : b
                    )
                  );
                  
                  // 🔥 GUARDAR EN LA BASE DE DATOS
                  // Actualizar selectedBusiness con el nuevo nombre
                  const updatedBusiness = { ...selectedBusiness, name: newName };
                  supabase
                    .from('businesses')
                    .update({ name: newName })
                    .eq('id', selectedBusiness.id)
                    .eq('user_id', user?.id)
                    .then(({ error }) => {
                      if (error) {
                        console.error('❌ Error guardando nombre del negocio:', error);
                      } else {
                        console.log('✅ Nombre del negocio guardado en DB');
                      }
                    });
                }}
                theme={theme}
                onThemeChange={setTheme}
                onImageStorageEvent={registerImageStorageEvent}
                businessPlan={userPlan || 'free'}
              />
            </div>
          </div>

          {/* RIGHT PANEL: PREVIEW - STICKY */}
          <div className="flex flex-col">
            <div className="sticky top-20 flex flex-col gap-4">
              <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <MenuPreview
                  menu={menuData}
                  isDemo={isDemo}
                  businessName={selectedBusiness.name}
                  theme={theme}
                  businessPlan={userPlan as 'menu' | 'ventas'}
                />
              </div>
              {renderSavingStatusBanner()}
            </div>
          </div>
        </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-gray-400 text-lg">Selecciona o crea un negocio para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}

