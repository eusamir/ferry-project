import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
// ⚠️ ALTERADO: API agora envia 'description'
import { reportProblem } from "@/services/api";

const Relatar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ⚠️ ALTERADO: Enviando o objeto completo
      await reportProblem({
        category,
        description,
      });

      toast({
        title: "Relato enviado!",
        description: "Sua mensagem foi recebida pela equipe de operações",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o relato. Verifique se o backend está rodando.",
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
              <CardTitle className="text-2xl">Relatar Problema</CardTitle>
              <CardDescription>
                Descreva o problema ou ocorrência que você deseja reportar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione a categoria do problema" />
                    </SelectTrigger>
                    {/* ⚠️ ALTERADO: Categorias exatas do backend */}
                    <SelectContent>
                      <SelectItem value="Embarcação com defeito">Embarcação com defeito</SelectItem>
                      <SelectItem value="Fila desorganizada">Fila desorganizada</SelectItem>
                      <SelectItem value="Atraso excessivo">Atraso excessivo</SelectItem>
                      <SelectItem value="Funcionário">Funcionário</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Problema</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema encontrado..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Seja o mais específico possível para nos ajudar a resolver o problema
                  </p>
                </div>

                <Alert className="bg-info/10 border-info">
                  <AlertDescription>
                    <p className="font-semibold text-info mb-2">Informações Importantes</p>
                    <ul className="text-sm space-y-1 text-info-foreground/80 text-black">
                      <li>• Seu relato será analisado pela equipe de operações</li>
                      <li>• Resposta em até 24 horas úteis</li>
                      <li>• Para emergências, entre em contato direto</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Enviando..." : "Enviar Relato"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Relatar;