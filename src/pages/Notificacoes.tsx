import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const notifications = [
  {
    id: 1,
    type: "success",
    icon: CheckCircle,
    title: "Operação Normalizada",
    description: "Ferry São Luís retomou operação normal após manutenção",
    time: "Há 15 minutos",
  },
  {
    id: 2,
    type: "warning",
    icon: AlertCircle,
    title: "Atraso Previsto",
    description: "Ferry Ilha Grande com atraso de 20 minutos devido ao tráfego intenso",
    time: "Há 30 minutos",
  },
  {
    id: 3,
    type: "info",
    icon: Wrench,
    title: "Manutenção Programada",
    description: "Ferry Maranhão em manutenção preventiva. Retorno previsto: 18:00",
    time: "Há 1 hora",
  },
  {
    id: 4,
    type: "info",
    icon: Clock,
    title: "Horário de Pico",
    description: "Maior movimento esperado entre 17h e 19h. Reserve com antecedência",
    time: "Há 2 horas",
  },
];

const Notificacoes = () => {
  const navigate = useNavigate();

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "info":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10";
      case "warning":
        return "bg-warning/10";
      case "info":
        return "bg-info/10";
      default:
        return "bg-muted";
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

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Central de Notificações</h1>
            <p className="text-muted-foreground">
              Acompanhe atualizações em tempo real sobre as operações
            </p>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={`w-12 h-12 rounded-full ${getBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${getIconColor(notification.type)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notificacoes;
