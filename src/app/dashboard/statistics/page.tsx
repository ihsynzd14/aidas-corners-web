'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralOverview } from '@/components/statistics/general-overview';
import { SingleBranchView } from '@/components/statistics/single-branch-view';

export default function StatisticsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Statistika Paneli</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Ümumi Baxış</TabsTrigger>
          <TabsTrigger value="single">Tək Filial Baxış</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralOverview />
        </TabsContent>
        
        <TabsContent value="single">
          <SingleBranchView />
        </TabsContent>
      </Tabs>
    </div>
  );
} 