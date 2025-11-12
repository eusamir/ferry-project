import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Database, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
// ⚠️ ALTERADO: Importando as funções corretas da API
import {
  runSimulationNormal,
  runSimulationWithReservations,
  FerrySimulationNormalResult,
  FerrySimulationResult
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ✅ NOVO: Interface para o Snapshot
interface Snapshot {
  id: number;
  nome: string;
  tipo: 'normal' | 'reserva';
  dados: FerrySimulationNormalResult | FerrySimulationResult;
}

const Simulacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingNormal, setLoadingNormal] = useState(false);
  const [loadingReserva, setLoadingReserva] = useState(false);

  // ⚠️ ALTERADO: States para os dois tipos de resultado
  const [normalResult, setNormalResult] = useState<FerrySimulationNormalResult | null>(null);
  const [reservaResult, setReservaResult] = useState<FerrySimulationResult | null>(null);
  
  // ⚠️ ALTERADO: State para o único input necessário
  const [percentualReservas, setPercentualReservas] = useState("0.3"); // 30% como padrão

  // ✅ NOVO: Handler para a simulação Normal (FIFO)
  const handleSimularNormal = async () => {
    setLoadingNormal(true);
    setNormalResult(null);
    try {
      const simulationResult = await runSimulationNormal();
      setNormalResult(simulationResult);
      toast({
        title: "Simulação Normal Concluída!",
      });
    } catch (error) {
      toast({
        title: "Erro na Simulação Normal",
        description: "Não foi possível executar. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingNormal(false);
    }
  };

  // ⚠️ ALTERADO: Handler para a simulação Com Reservas
  const handleSimularComReserva = async () => {
    const percentualNum = parseFloat(percentualReservas);
    if (isNaN(percentualNum) || percentualNum <= 0 || percentualNum > 1) {
      toast({
        title: "Erro",
        description: "Percentual de reservas deve ser um número entre 0 e 1 (ex: 0.3)",
        variant: "destructive",
      });
      return;
    }

    setLoadingReserva(true);
    setReservaResult(null);
    try {
      const simulationResult = await runSimulationWithReservations(percentualNum);
      setReservaResult(simulationResult);
      toast({
        title: "Simulação com Reservas Concluída!",
        description: "Veja os resultados comparativos abaixo",
      });
    } catch (error) {
      toast({
        title: "Erro na Simulação com Reservas",
        description: "Não foi possível executar. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingReserva(false);
    }
  };

  // ✅ NOVO: Função para salvar Snapshot
  const handleSaveSnapshot = (tipo: 'normal' | 'reserva') => {
    const dados = tipo === 'normal' ? normalResult : reservaResult;
    if (!dados) return;

    const nome = tipo === 'normal' 
      ? `Simulação Normal` 
      : `Reserva (${parseFloat(percentualReservas) * 100}%)`;

    try {
      const snapshots: Snapshot[] = JSON.parse(localStorage.getItem('ferry_snapshots') || '[]');
      const newSnapshot: Snapshot = {
        id: Date.now(),
        nome: `${nome} - ${new Date().toLocaleTimeString()}`,
        tipo,
        dados
      };
      
      snapshots.push(newSnapshot);
      localStorage.setItem('ferry_snapshots', JSON.stringify(snapshots));
      
      toast({
        title: "Snapshot salvo!",
        description: `"${newSnapshot.nome}" salvo no seu navegador.`,
      });
    } catch (e) {
      toast({
        title: "Erro ao salvar snapshot",
        description: "Não foi possível salvar os dados no localStorage.",
        variant: "destructive",
      });
    }
  };

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

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Laboratório de Simulação</CardTitle>
              <CardDescription>
                Compare o sistema atual (FIFO) com o novo sistema de reservas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* --- Formulário de Simulação --- */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Lado Esquerdo: Simulação Normal */}
                <div className="space-y-4">
                  <Label>Sistema Atual (FIFO)</Label>
                  <Button onClick={handleSimularNormal} className="w-full" size="lg" disabled={loadingNormal}>
                    <Play className="w-4 h-4 mr-2" />
                    {loadingNormal ? "Simulando..." : "Executar Simulação Normal"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Roda a simulação de 1 dia usando fila por ordem de chegada.
                  </p>
                </div>
                
                {/* Lado Direito: Simulação com Reservas */}
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSimularComReserva(); }}>
                  <div className="space-y-2">
                    <Label htmlFor="percentual">Sistema com Reservas (Percentual)</Label>
                    <Input
                      id="percentual"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={percentualReservas}
                      onChange={(e) => setPercentualReservas(e.target.value)}
                      placeholder="Ex: 0.3 para 30%"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loadingReserva}>
                    <Play className="w-4 h-4 mr-2" />
                    {loadingReserva ? "Simulando..." : "Executar Simulação com Reservas"}
                  </Button>
                </form>
              </div>

              <Separator />

              {/* --- Botões de Snapshot --- */}
              <div className="space-y-2">
                <CardTitle className="text-lg">Snapshots (Comparação)</CardTitle>
                <p className="text-sm text-muted-foreground pb-2">
                  Salve os resultados das simulações para comparar diferentes cenários.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveSnapshot('normal')} 
                    disabled={!normalResult}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Salvar Snapshot (Normal)
                  </Button>
                   <Button 
                    variant="outline" 
                    onClick={() => handleSaveSnapshot('reserva')} 
                    disabled={!reservaResult}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Salvar Snapshot (Reserva)
                  </Button>
                  <Button variant="default" disabled>
                     <GitCompare className="w-4 h-4 mr-2" />
                    Comparar Snapshots (Em breve)
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* --- Área de Resultados --- */}
          {(loadingNormal || loadingReserva || normalResult || reservaResult) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resultados da Comparação</CardTitle>
                <CardDescription>Análise dos dois cenários de simulação</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">

                {/* --- Coluna Resultados Normais --- */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Sistema Normal (FIFO)</h3>
                  {loadingNormal && <Skeleton className="h-20 w-full" />}
                  {!loadingNormal && !normalResult && (
                    <div className="flex items-center justify-center h-20 bg-muted rounded-lg text-muted-foreground">
                      Execute a simulação normal
                    </div>
                  )}
                  {normalResult && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Tempo Médio na Fila (Wq)</span>
                        <span className="text-2xl font-bold text-primary">
                          {normalResult.resultados.tempoMedioEspera.toFixed(2)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Veículos Processados</span>
                        <span className="text-2xl font-bold text-primary">
                          {normalResult.resultados.veiculosProcessados}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* --- Coluna Resultados com Reserva --- */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Sistema com Reservas ({parseFloat(percentualReservas) * 100}%)</h3>
                  {loadingReserva && <Skeleton className="h-48 w-full" />}
                  {!loadingReserva && !reservaResult && (
                    <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground">
                      Execute a simulação com reservas
                    </div>
                  )}
                  {reservaResult && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                        <span className="font-semibold text-success">Tempo (COM Reserva)</span>
                        <span className="text-2xl font-bold text-success">
                          {reservaResult.resumo.tempoMedioReservas}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-warning/10 rounded-lg">
                        <span className="font-semibold text-warning">Tempo (SEM Reserva)</span>
                        <span className="text-2xl font-bold text-warning">
                          {reservaResult.resumo.tempoMedioNormais}
                        </span>
                      </div>
                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Diferença (Ganho)</span>
                        <span className="text-2xl font-bold text-primary">
                          {reservaResult.resumo.diferenca}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Simulacao;