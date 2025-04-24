import { Skeleton } from "@/components/ui/skeleton";
import { 
  DashboardIcon,
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  GearIcon
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-zinc-50">
      <div className="space-y-8 p-8">
        {/* Header Section Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgb(0_0_0/0.08)] p-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-soft-light" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DashboardIcon className="h-6 w-6 text-blue-600" />
                  <Skeleton className="h-10 w-[300px]" />
                </div>
                <Skeleton className="h-4 w-[750px]" />
                <Skeleton className="h-4 w-[600px]" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[120px]" />
              </div>
            </div>

            {/* Stats Cards Grid Skeleton */}
            <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Usuarios
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                    <PersonIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Usuarios Activos
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                    <CheckCircledIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <div className="mt-2">
                    <Skeleton className="h-2 w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pendientes
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
                    <ClockIcon className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <div className="mt-1">
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Inactivos
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-500/10 to-red-500/10 flex items-center justify-center ring-1 ring-rose-500/20">
                    <GearIcon className="h-4 w-4 text-rose-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <div className="mt-1">
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Table Section Skeleton */}
        <div className="rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/20 shadow-[0_8px_16px_rgb(0_0_0/0.08)] overflow-hidden">
          {/* Search Bar Skeleton */}
          <div className="p-4 border-b border-gray-200/30 bg-white/50">
            <div className="flex items-center space-x-4 max-w-md">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200/30 bg-white/50">
            <div className="flex h-12">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-[120px]" />
              ))}
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white/50 backdrop-blur-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[120px]" />
              </div>
              <div className="border rounded-lg">
                <div className="h-12 border-b bg-gray-50/50 px-4 flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-[100px] mx-4" />
                  ))}
                </div>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center h-16 px-4 border-b">
                    <Skeleton className="h-8 w-8 rounded-full mr-4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-8 w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 