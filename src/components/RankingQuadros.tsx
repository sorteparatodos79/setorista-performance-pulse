
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export const RankingQuadros = () => {
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

  const calcularRankings = () => {
    const dadosFiltrados = dadosVendas.filter(dado => dado.ano === anoSelecionado);
    
    if (dadosFiltrados.length === 0) return null;

    // Agrupar por setorista
    const setoristas = dadosFiltrados.reduce((acc, dado) => {
      const nome = dado.setoristaName;
      if (!acc[nome]) {
        acc[nome] = {
          nome,
          totalVendas: 0,
          totalLucro: 0,
          totalDespesas: 0
        };
      }
      acc[nome].totalVendas += dado.vendas;
      acc[nome].totalLucro += dado.lucroLiquido;
      acc[nome].totalDespesas += dado.despesas;
      return acc;
    }, {} as any);

    const listSetoristas = Object.values(setoristas) as any[];

    // Calcular porcentagens
    const setoristasComPorcentagem = listSetoristas.map(setorista => ({
      ...setorista,
      porcentagemLucro: setorista.totalVendas > 0 ? (setorista.totalLucro / setorista.totalVendas) * 100 : 0,
      porcentagemDespesas: setorista.totalVendas > 0 ? (setorista.totalDespesas / setorista.totalVendas) * 100 : 0
    }));

    // Ranking por maior lucro absoluto
    const maiorLucroAbsoluto = setoristasComPorcentagem
      .sort((a, b) => b.totalLucro - a.totalLucro)[0];

    // Ranking por maior porcentagem de lucro
    const maiorPorcentagemLucro = setoristasComPorcentagem
      .sort((a, b) => b.porcentagemLucro - a.porcentagemLucro)[0];

    // Ranking por maiores despesas (porcentagem)
    const maioresDespesas = setoristasComPorcentagem
      .sort((a, b) => b.porcentagemDespesas - a.porcentagemDespesas)[0];

    return {
      maiorLucroAbsoluto,
      maiorPorcentagemLucro,
      maioresDespesas
    };
  };

  const rankings = calcularRankings();

  return (
    <div className="space-y-6">
      {/* Filtro de Ano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rankings de Setoristas
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

      {rankings ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quadro 1: Maior Lucro Absoluto */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-green-700">
                <Trophy className="h-6 w-6 text-green-600" />
                Maior Lucro Absoluto
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-green-800">
                  {rankings.maiorLucroAbsoluto.nome}
                </h3>
              </div>
              <div>
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  {formatarMoeda(rankings.maiorLucroAbsoluto.totalLucro)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quadro 2: Maior Porcentagem de Lucro */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Maior % de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800">
                  {rankings.maiorPorcentagemLucro.nome}
                </h3>
              </div>
              <div>
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  {formatarPorcentagem(rankings.maiorPorcentagemLucro.porcentagemLucro)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quadro 3: Maiores Despesas */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Maiores Despesas %
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-red-800">
                  {rankings.maioresDespesas.nome}
                </h3>
              </div>
              <div>
                <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                  {formatarPorcentagem(rankings.maioresDespesas.porcentagemDespesas)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
            <p>Adicione dados de vendas para visualizar os rankings.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
