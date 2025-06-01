
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface DadoVenda {
  id: string;
  setoristaId: string;
  setoristaName: string;
  mes: string;
  ano: string;
  vendas: number;
  comissao: number;
  bonus: number;
  despesas: number;
  lucroLiquido: number;
}

interface SetoristaResumo {
  nome: string;
  totalVendas: number;
  totalComissao: number;
  totalBonus: number;
  totalDespesas: number;
  totalLucro: number;
  porcentagemLucro: number;
  status: string;
}

export const TabelaGeralSetoristas = () => {
  const [dadosVendas, setDadosVendas] = useState<DadoVenda[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<string>('2024');

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      const dadosCorrigidos = dados.map((dado: DadoVenda) => ({
        ...dado,
        lucroLiquido: dado.vendas - (dado.comissao + dado.bonus + dado.despesas)
      }));
      setDadosVendas(dadosCorrigidos);
    }
  }, []);

  const anosUnicos = [...new Set(dadosVendas.map(d => d.ano))];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const obterStatus = (porcentagemLucro: number) => {
    if (porcentagemLucro >= 25) return 'Ideal';
    if (porcentagemLucro >= 15) return 'Média';
    return 'Precisa melhorar';
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'Ideal': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Precisa melhorar': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularResumoSetoristas = (): SetoristaResumo[] => {
    const dadosFiltrados = dadosVendas.filter(dado => dado.ano === anoSelecionado);
    
    if (dadosFiltrados.length === 0) return [];

    // Agrupar por setorista
    const setoristas = dadosFiltrados.reduce((acc, dado) => {
      const nome = dado.setoristaName;
      if (!acc[nome]) {
        acc[nome] = {
          nome,
          totalVendas: 0,
          totalComissao: 0,
          totalBonus: 0,
          totalDespesas: 0,
          totalLucro: 0
        };
      }
      acc[nome].totalVendas += dado.vendas;
      acc[nome].totalComissao += dado.comissao;
      acc[nome].totalBonus += dado.bonus;
      acc[nome].totalDespesas += dado.despesas;
      acc[nome].totalLucro += dado.lucroLiquido;
      return acc;
    }, {} as any);

    const listSetoristas = Object.values(setoristas) as any[];

    // Calcular porcentagens e status
    return listSetoristas.map(setorista => {
      const porcentagemLucro = setorista.totalVendas > 0 ? (setorista.totalLucro / setorista.totalVendas) * 100 : 0;
      const status = obterStatus(porcentagemLucro);
      
      return {
        ...setorista,
        porcentagemLucro,
        status
      };
    }).sort((a, b) => b.totalLucro - a.totalLucro);
  };

  const resumoSetoristas = calcularResumoSetoristas();

  return (
    <div className="space-y-6">
      {/* Filtro de Ano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tabela Geral de Setoristas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">Ano</label>
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anosUnicos.map((ano) => (
                  <SelectItem key={ano} value={ano}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Setoristas */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Comparativo ({resumoSetoristas.length} setoristas)</CardTitle>
        </CardHeader>
        <CardContent>
          {resumoSetoristas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
              <p>Adicione dados de vendas para visualizar o resumo comparativo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Prêmios</TableHead>
                    <TableHead>Despesas</TableHead>
                    <TableHead>Lucro (R$)</TableHead>
                    <TableHead>Lucro (%)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumoSetoristas.map((setorista) => (
                    <TableRow key={setorista.nome}>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell>{formatarMoeda(setorista.totalVendas)}</TableCell>
                      <TableCell>{formatarMoeda(setorista.totalComissao)}</TableCell>
                      <TableCell>{formatarMoeda(setorista.totalBonus)}</TableCell>
                      <TableCell>{formatarMoeda(setorista.totalDespesas)}</TableCell>
                      <TableCell className={`font-semibold ${setorista.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(setorista.totalLucro)}
                      </TableCell>
                      <TableCell className={`font-semibold ${setorista.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(setorista.porcentagemLucro)}
                      </TableCell>
                      <TableCell>
                        <Badge className={obterCorStatus(setorista.status)}>
                          {setorista.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
