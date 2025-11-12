import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, Ship, AlertTriangle, Activity, CheckCircle, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
// ✅ NOVO: Importando a API de relatórios e os gráficos
import { getRelatorioCompleto } from "@/services/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ✅ NOVO: Configuração de cores para os gráficos
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
  // ✅ NOVO: Busca os dados do relatório de 15 dias
  const { data: relatorio, isLoading, isError } = useQuery({
    queryKey: ["relatorioCompleto"],
    queryFn: getRelatorioCompleto,
  });

  // ✅ NOVO: Formata os dados do gráfico de linha
  const temposPorDiaData = React.useMemo(() => {
    if (!relatorio) return [];
    // O backend envia os datasets, precisamos combiná-los
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
  
  // ✅ NOVO: Formata os dados do gráfico de barras
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Análise de 15 dias: Sistema Atual vs. Sistema com Reservas
          </p>
        </div>

        {/* --- Seção de Gráficos --- */}
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

            {/* --- Gráfico de Barras (Média Geral) --- */}
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

            {/* --- Cards de Análise --- */}
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


        {/* --- Action Cards (Menus) --- */}
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