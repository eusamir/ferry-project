import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ✅ NOVO: Importando Wrench e AlertTriangle
import { ArrowLeft, Ship, Clock, Users, RefreshCw, Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { getFerryStatus, FerryStatus } from "@/services/api"; 
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // ✅ NOVO: Importando 'cn' para classes condicionais

const Status = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ferries, setFerries] = useState<FerryStatus[]>([]); 
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const ferriesData = await getFerryStatus();
      setFerries(ferriesData);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Verifique se o backend está rodando.",
        variant: "destructive",
      });
      setFerries([]); 
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Status das Embarcações</h1>
             <p className="text-muted-foreground">
                Acompanhe o status de operação em tempo real
              </p>
          </div>
          <Button onClick={loadData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* ⚠️ ATUALIZAÇÃO VISUAL AQUI ⚠️ */}
          {ferries.map((ferry) => {
            
            // Verifica se está em manutenção (backend envia "Em manutenção")
            const isManutencao = ferry.status.toLowerCase().includes("manutenção");
            
            const progress = (ferry.max_capacity > 0) 
              ? (ferry.capacity / ferry.max_capacity) * 100 
              : 0;
            
            // Define a cor da badge
            const getVariant = (status: string) => {
              if (isManutencao) return "destructive";
              if (status === "Em operação") return "default";
              if (status === "Disponível") return "secondary"; 
              return "secondary";
            };

            return (
              // 1. MUDANÇA NO CARD: Fica vermelho e com opacidade
              <Card 
                key={ferry.id} 
                className={cn(
                  "hover:shadow-lg transition-all",
                  isManutencao && "border-destructive bg-destructive/10 opacity-90"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* 2. MUDANÇA NO ÍCONE: Troca <Ship> por <Wrench> */}
                      {isManutencao ? (
                        <Wrench className="w-6 h-6 text-destructive" />
                      ) : (
                        <Ship className="w-6 h-6" />
                      )}
                      <h3 className="font-semibold text-lg">{ferry.name}</h3>
                    </div>
                    <Badge variant={getVariant(ferry.status)}>{ferry.status}</Badge>
                  </div>

                  {/* 3. MUDANÇA NO CONTEÚDO: Bloco condicional */}
                  {isManutencao ? (
                    <div className="space-y-3 text-center py-4">
                      <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                      <p className="font-semibold text-destructive uppercase tracking-wide">
                        Fora de Operação
                      </p>
                      <p className="text-sm text-destructive/80">
                        {/* A api.ts já formata 'next_departure' para a previsão de retorno */}
                        {ferry.next_departure}
                      </p>
                    </div>
                  ) : (
                    // Bloco de conteúdo original para ferries normais
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Próx. Evento: {ferry.next_departure}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-muted-foreground">Capacidade</span>
                          </div>
                          <span className="font-semibold">
                            {ferry.capacity}/{ferry.max_capacity}
                          </span>
                        </div>
                        <Progress 
                          value={progress}
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Status;