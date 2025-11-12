import { Link } from "react-router-dom";
// ✅ NOVO: Importando o ícone de Download
import { Calendar, Bell, Ship, AlertTriangle, Activity, CheckCircle, Clock, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { getRelatorioCompleto } from "@/services/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert"; // ✅ NOVO: Importando Alert
import React from "react";

const chartConfig = {
  normal: {
    label: "Sistema Normal (min)",
    color: "hsl(var(--destructive))",
  },
  comReserva: {
    label: "Com Reserva (min)",
    color: "hsl(var(--success))",
  },
  semReserva: {
    label: "Sem Reserva (min)",
    color: "hsl(var(--warning))",
  },
  diferenca: {
    label: "Diferença (min)",
    color: "hsl(var(--info))",
  }
};

const Dashboard = () => {
  const { data: relatorio, isLoading, isError } = useQuery({
    queryKey: ["relatorioCompleto"],
    queryFn: getRelatorioCompleto,
  });

  // ✅ NOVO: Função para gerar e baixar o arquivo JSON
  const handleDownloadRelatorio = () => {
    if (!relatorio) {
      return; // Botão deve estar desabilitado se não houver dados
    }

    try {
      // 1. Converte o objeto do relatório (que já temos) em texto JSON
      const jsonString = JSON.stringify(relatorio, null, 2);
      
      // 2. Cria um "Blob", que é a representação do arquivo
      const blob = new Blob([jsonString], { type: "application/json" });
      
      // 3. Cria uma URL temporária para esse arquivo na memória do navegador
      const url = URL.createObjectURL(blob);
      
      // 4. Cria um link (<a>) invisível
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_ferrybot_15dias_${new Date().toISOString().split('T')[0]}.json`; // Nome do arquivo
      
      // 5. Simula o clique no link para iniciar o download
      document.body.appendChild(a);
      a.click();
      
      // 6. Limpa o link e a URL da memória
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar download:", error);
      // (Opcional: você pode usar o useToast() aqui para notificar um erro)
    }
  };

  // ... (funções de formatação de gráfico continuam as mesmas)
  const temposPorDiaData = React.useMemo(() => {
    if (!relatorio) return [];
    const labels = relatorio.graficos.temposPorDia.labels;
    const normalData = relatorio.graficos.temposPorDia.datasets[0].data;
    const comReservaData = relatorio.graficos.temposPorDia.datasets[2].data;
    const semReservaData = relatorio.graficos.temposPorDia.datasets[3].data;

    return labels.map((label: string, index: number) => ({
      name: label,
      normal: parseFloat(normalData[index]),
      comReserva: parseFloat(comReservaData[index]),
      semReserva: parseFloat(semReservaData[index]),
    }));
  }, [relatorio]);
  
  const comparacaoMediaData = React.useMemo(() => {
    if (!relatorio) return [];
    const labels = relatorio.graficos.comparacaoMedia.labels;
    const data = relatorio.graficos.comparacaoMedia.datasets[0].data;
    return [
      { name: labels[0], value: parseFloat(data[0]), fill: "var(--color-normal)" },
      { name: labels[2], value: parseFloat(data[2]), fill: "var(--color-comReserva)" },
      { name: labels[3], value: parseFloat(data[3]), fill: "var(--color-semReserva)" },
    ]
  }, [relatorio]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Análise de 15 dias: Sistema Atual vs. Sistema com Reservas
            </p>
          </div>
          <Button
            onClick={handleDownloadRelatorio}
            disabled={isLoading || isError || !relatorio}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório (JSON)
          </Button>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        )}
        
        {isError && (
           <Alert variant="destructive" className="mb-6">
             <AlertTriangle className="h-4 w-4" />
             <AlertDescription>
               Não foi possível carregar os gráficos. Verifique se o backend (`ferry-boat`) está rodando.
             </AlertDescription>
           </Alert>
        )}

        {relatorio && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* --- Gráfico de Linha (Evolução 15 dias) --- */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Tempo de Espera (15 dias)</CardTitle>
                <CardDescription>Comparativo do tempo médio de espera</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temposPorDiaData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <YAxis unit="m" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="normal" stroke="var(--color-normal)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comReserva" stroke="var(--color-comReserva)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="semReserva" stroke="var(--color-semReserva)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Espera (Geral)</CardTitle>
                <CardDescription>Média consolidada dos 15 dias de simulação</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparacaoMediaData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <YAxis unit="m" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 bg-success/10 border-success">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <CardTitle className="text-success">Benefícios do Sistema de Reservas</CardTitle>
                  <CardDescription className="text-success/80">
                    {relatorio.analise.beneficios.join(" | ")}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 bg-warning/10 border-warning">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Clock className="w-8 h-8 text-warning" />
                <div>
                  <CardTitle className="text-warning">Pontos de Atenção (Trade-offs)</CardTitle>
                  <CardDescription className="text-warning/80">
                    {relatorio.analise.tradeoffs.join(" | ")}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

          </div>
        )}


        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Link to="/reservar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Reservar</CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/notificacoes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-success">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/status">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-info">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center mb-3">
                  <Ship className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Status</CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/relatar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-warning">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Relatar</CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/simulacao">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary ring-2 ring-primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Laboratório</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;