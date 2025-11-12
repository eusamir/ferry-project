import axios from 'axios';

// ⚠️ ALTERADO: URL base para o backend do ferry-boat
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERFACES (Definindo o que esperamos do backend)
// ============================================================================

// ✅ NOVO: Interface para o resultado da simulação do Ferry Bot
export interface FerrySimulationResult {
  sucesso: boolean;
  resumo: {
    tempoMedioEsperaGeral: string;
    tempoMedioReservas: string;
    tempoMedioNormais: string;
    diferenca: string;
    veiculosProcessados: number;
  };
  detalhes: any; // O objeto de detalhes é grande, podemos usar 'any'
}

// ✅ NOVO: Interface para o resultado da simulação normal
export interface FerrySimulationNormalResult {
  sucesso: boolean;
  resultados: {
    tempoMedioEspera: number;
    veiculosProcessados: number;
    veiculosNaoAtendidos: number;
  };
}

// Interface de Reserva (Frontend)
export interface Reservation {
  id?: string;
  vehicle_type: string;
  date: string;
  time: string;
  qr_code?: string;
  status?: string;
  nomeUsuario: string; // ⚠️ ALTERADO: Adicionado campo obrigatório
}

// Interface de Problema (Frontend)
export interface Problem {
  id?: string;
  category: string; // O frontend usa 'category'
  description: string; // ✅ NOVO: Adicionado para o formulário
  created_at?: string;
  status?: string;
}

// Interface de Status do Ferry (Frontend)
export interface FerryStatus {
  id: number;
  name: string;
  status: string;
  next_departure: string;
  capacity: number;
  max_capacity: number;
}

// ============================================================================
// SIMULAÇÃO (Foco principal)
// ============================================================================

/**
 * ⚠️ ALTERADO: Roda a simulação normal (FIFO)
 * O backend não precisa de parâmetros para esta rota.
 */
export const runSimulationNormal = async (): Promise<FerrySimulationNormalResult> => {
  try {
    const response = await api.post('/simular', {}); // Envia body vazio
    return response.data;
  } catch (error) {
    console.error('Erro na simulação normal:', error);
    throw error;
  }
};

/**
 * ⚠️ ALTERADO: Roda a simulação com sistema de reservas
 * Envia o percentual de reservas esperado pelo backend.
 */
export const runSimulationWithReservations = async (percentualReservas: number): Promise<FerrySimulationResult> => {
  try {
    const response = await api.post('/simular/com-reservas', { percentualReservas });
    return response.data;
  } catch (error) {
    console.error('Erro na simulação com reservas:', error);
    throw error;
  }
};

// ============================================================================
// GRÁFICOS (Foco principal)
// ============================================================================

/**
 * ✅ NOVO: Busca o relatório completo de 15 dias para os gráficos
 */
export const getRelatorioCompleto = async (): Promise<any> => {
  try {
    const response = await api.get('/relatorios');
    if (response.data.sucesso) {
      return response.data.relatorio; // Retorna o objeto principal do relatório
    } else {
      throw new Error(response.data.erro || 'Erro ao buscar relatório');
    }
  } catch (error) {
    console.error('Erro ao buscar relatório completo:', error);
    throw error;
  }
};

// ============================================================================
// RESERVAS
// ============================================================================

/**
 * ⚠️ ALTERADO: "Traduz" os campos do frontend para o backend
 */
export const createReservation = async (reservation: Reservation): Promise<any> => {
  try {
    // "Tradução" dos campos
    const dadosBackend = {
      nomeUsuario: reservation.nomeUsuario,       // ✅ Frontend envia 'nomeUsuario'
      tipoVeiculo: reservation.vehicle_type,    // vehicle_type -> tipoVeiculo
      horarioPreferencia: reservation.time,     // time -> horarioPreferencia
      placa: "Não informada"
    };

    const response = await api.post('/reserva', dadosBackend);

    if (response.data.sucesso) {
      return response.data.reserva; // Retorna o objeto 'reserva'
    } else {
      throw new Error(response.data.erro);
    }

  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    throw error;
  }
};

export const getReservations = async (): Promise<any[]> => { // Mudado para 'any[]'
  try {
    const response = await api.get('/reservas');
    if (response.data.sucesso) {
      return response.data.reservas; // ✅ Retorna o array de reservas
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    throw error;
  }
};

// ============================================================================
// PROBLEMAS / RELATOS
// ============================================================================

/**
 * ⚠️ ALTERADO: "Traduz" os campos do frontend para o backend
 */
export const reportProblem = async (problem: Problem): Promise<any> => {
  try {
    // "Tradução" dos campos
    const dadosBackend = {
      categoria: problem.category,   // category -> categoria
      descricao: problem.description // ✅ Adicionado campo
    };

    const response = await api.post('/relatar-problema', dadosBackend);
    
    if (response.data.sucesso) {
      return response.data.problema;
    } else {
      throw new Error(response.data.erro);
    }
    
  } catch (error) {
    console.error('Erro ao reportar problema:', error);
    throw error;
  }
};

export const getProblems = async (): Promise<any[]> => {
  try {
    const response = await api.get('/problemas');
     if (response.data.sucesso) {
      return response.data.problemas; // ✅ Retorna o array de problemas
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar problemas:', error);
    throw error;
  }
};

// ============================================================================
// STATUS DOS FERRIES
// ============================================================================

/**
 * ⚠️ ALTERADO: "Traduz" a resposta do backend para o formato do frontend
 */
export const getFerryStatus = async (): Promise<FerryStatus[]> => {
  try {
    const response = await api.get('/embarcacoes/status');

    if (response.data.sucesso) {
      // ✅ TRADUÇÃO: Mapeia a resposta do backend para a interface do frontend
      const embarcacoesBackend = response.data.embarcacoes;
      
      const ferriesFrontend: FerryStatus[] = embarcacoesBackend.map((ferry: any) => ({
        id: ferry.id,
        name: `Embarcação #${ferry.id}`, // Backend não envia nome
        status: ferry.estado,             // estado -> status
        next_departure: ferry.emManutencao 
          ? `Retorno: ${new Date(ferry.previsaoRetorno).toLocaleTimeString()}`
          : new Date(ferry.proximaManutencao).toLocaleDateString(), // Usando proximaManutencao
        capacity: ferry.veiculosAbordo,   // veiculosAbordo -> capacity
        max_capacity: ferry.capacidade    // capacidade -> max_capacity
      }));
      
      return ferriesFrontend;
    }
    return [];

  } catch (error) {
    console.error('Erro ao buscar status dos ferries:', error);
    throw error;
  }
};

export default api;