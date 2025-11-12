import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Ship, Bell } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import heroFerry from "@/assets/hero-ferry.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Sua travessia{" "}
                <span className="text-primary">inteligente</span>
                <br />
                começa aqui
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Sistema digital para gerenciamento de travessias de ferry em São Luís. 
                Reserve, acompanhe e seja notificado em tempo real.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link to="/dashboard">Começar Agora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Fazer Login</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroFerry} 
                alt="Ferry navegando ao pôr do sol" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Reserva Antecipada</CardTitle>
                  <CardDescription>
                    Garanta sua vaga com QR Code digital
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mb-4">
                    <Ship className="w-8 h-8 text-info" />
                  </div>
                  <CardTitle>Tempo Real</CardTitle>
                  <CardDescription>
                    Acompanhe status e horários das embarcações
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-success" />
                  </div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Receba alertas sobre atrasos e mudanças
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
