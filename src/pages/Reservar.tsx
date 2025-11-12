import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { createReservation } from "@/services/api";
import { QRCodeSVG } from "qrcode.react";

const Reservar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicleType, setVehicleType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleType || !date || !time|| !nome) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const reservation = await createReservation({
        vehicle_type: vehicleType,
        date,
        time,
        nomeUsuario: nome
      });

      setQrCode(reservation.qr_code || `FERRY-${reservation.id}-${date}-${time}`);
      
      toast({
        title: "Reserva confirmada!",
        description: "Seu QR Code foi gerado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a reserva. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reserve sua travessia</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para garantir sua vaga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Seu Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Tipo de Veículo</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Selecione o tipo de veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carro">Carro</SelectItem>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="van">Van/Kombi</SelectItem>
                      <SelectItem value="onibus">Ônibus</SelectItem>
                      <SelectItem value="caminhao">Caminhão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data da Travessia</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">06:00</SelectItem>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert className="bg-info/10 border-info">
                  <AlertDescription>
                    <p className="font-semibold text-info mb-2">Informações Importantes</p>
                    <ul className="text-sm space-y-1 text-info-foreground/80 text-black">
                      <li>• Chegue com 15 minutos de antecedência</li>
                      <li>• Apresente o QR Code no embarque</li>
                      <li>• Capacidade: 50 veículos por ferry</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Processando..." : "Confirmar Reserva"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {qrCode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>QR Code da Reserva</CardTitle>
                <CardDescription>Apresente este código no embarque</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Código: {qrCode}
                </p>
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Voltar ao Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reservar;
