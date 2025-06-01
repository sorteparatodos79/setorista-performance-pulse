
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface DadoVenda {
  id: string;
  vendedorId: string;
  vendedorNome: string;
  mes: string;
  ano: string;
  vendas: number;
  comissao: number;
  bonus: number;
  despesas: number;
  lucroLiquido: number;
}

interface RankingVendedor {
  vendedorNome: string;
  totalVendas: number;
  totalLucro: number;
  mediaVendas: number;
  mediaLucro: number;
  mesesAtivos: number;
  crescimento: number;
  posicao: number;
}

export const RankingVendedores = () => {
  const [dadosVendas, setDadosVendas] = useState<DadoVenda[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<string>('2024');
  const [criterioRanking, setCriterioRanking] = useState<string>('vendas');

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      setDadosVendas(JSON.parse(dadosSalvos));
    }
  }, []);

  const anosUnicos = [...new Set(dadosVendas.map(d => d.ano))];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularRanking = (): RankingVendedor[] => {
    const dadosFiltrados = dadosVendas.filter(dado => dado.ano === anoSelecionado);
    
    if (dadosFiltrados.length === 0) return [];

    // Agrupar dados por vendedor
    const vendedoresMap = dadosFiltrados.reduce((acc, dado) => {
      const nome = dado.vendedorNome;
      if (!acc[nome]) {
        acc[nome] = {
          vendedorNome: nome,
          totalVendas: 0,
          totalLucro: 0,
          mesesAtivos: 0,
          dadosMensais: []
        };
      }
      acc[nome].totalVendas += dado.vendas;
      acc[nome].totalLucro += dado.lucroLiquido;
      acc[nome].mesesAtivos += 1;
      acc[nome].dadosMensais.push(dado);
      return acc;
    }, {} as any);

    // Calcular métricas para cada vendedor
    const ranking: RankingVendedor[] = Object.values(vendedoresMap).map((vendedor: any) => {
      const mediaVendas = vendedor.totalVendas / vendedor.mesesAtivos;
      const mediaLucro = vendedor.totalLucro / vendedor.mesesAtivos;
      
      // Calcular crescimento (comparar primeiro e último mês)
      const dadosOrdenados = vendedor.dadosMensais.sort((a: any, b: any) => `${a.ano}-${a.mes}`.localeCompare(`${b.ano}-${b.mes}`));
      let crescimento = 0;
      if (dadosOrdenados.length > 1) {
        const primeiroMes = dadosOrdenados[0].vendas;
        const ultimoMes = dadosOrdenados[dadosOrdenados.length - 1].vendas;
        crescimento = primeiroMes > 0 ? ((ultimoMes - primeiroMes) / primeiroMes) * 100 : 0;
      }

      return {
        vendedorNome: vendedor.vendedorNome,
        totalVendas: vendedor.totalVendas,
        totalLucro: vendedor.totalLucro,
        mediaVendas,
        mediaLucro,
        mesesAtivos: vendedor.mesesAtivos,
        crescimento,
        posicao: 0
      };
    });

    // Ordenar baseado no critério selecionado
    ranking.sort((a, b) => {
      switch (criterioRanking) {
        case 'vendas':
          return b.totalVendas - a.totalVendas;
        case 'lucro':
          return b.totalLucro - a.totalLucro;
        case 'media':
          return b.mediaVendas - a.mediaVendas;
        case 'crescimento':
          return b.crescimento - a.crescimento;
        default:
          return b.totalVendas - a.totalVendas;
      }
    });

    // Adicionar posições
    ranking.forEach((vendedor, index) => {
      vendedor.posicao = index + 1;
    });

    return ranking;
  };

  const obterIconePosicao = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-lg font-bold text-gray-600">{posicao}</span>;
    }
  };

  const obterCorPosicao = (posicao: number) => {
    switch (posicao) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const obterBadgeCrescimento = (crescimento: number) => {
    if (crescimento > 0) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +{crescimento.toFixed(1)}%
        </Badge>
      );
    } else if (crescimento < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          {crescimento.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          0%
        </Badge>
      );
    }
  };

  const ranking = calcularRanking();

  const criterios = [
    { valor: 'vendas', nome: 'Total de Vendas' },
    { valor: 'lucro', nome: 'Lucro Líquido' },
    { valor: 'media', nome: 'Média de Vendas' },
    { valor: 'crescimento', nome: 'Crescimento' }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
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

            <div>
              <label className="text-sm font-medium">Critério de Ranking</label>
              <Select value={criterioRanking} onValueChange={setCriterioRanking}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criterios.map((criterio) => (
                    <SelectItem key={criterio.valor} value={criterio.valor}>
                      {criterio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pódio (Top 3) */}
      {ranking.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 Pódio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ranking.slice(0, 3).map((vendedor, index) => (
                <div
                  key={vendedor.vendedorNome}
                  className={`p-6 rounded-lg border-2 text-center ${obterCorPosicao(vendedor.posicao)}`}
                >
                  <div className="flex justify-center mb-3">
                    {obterIconePosicao(vendedor.posicao)}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{vendedor.vendedorNome}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Vendas:</strong> {formatarMoeda(vendedor.totalVendas)}</p>
                    <p><strong>Lucro:</strong> {formatarMoeda(vendedor.totalLucro)}</p>
                    <p><strong>Média:</strong> {formatarMoeda(vendedor.mediaVendas)}</p>
                    <div className="mt-2">
                      {obterBadgeCrescimento(vendedor.crescimento)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Completo ({ranking.length} vendedores)</CardTitle>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
              <p>Adicione dados de vendas para gerar o ranking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.map((vendedor) => (
                <div
                  key={vendedor.vendedorNome}
                  className={`p-4 rounded-lg border-2 ${obterCorPosicao(vendedor.posicao)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {obterIconePosicao(vendedor.posicao)}
                        <span className="font-bold text-lg">{vendedor.vendedorNome}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {obterBadgeCrescimento(vendedor.crescimento)}
                      <Badge variant="outline">
                        {vendedor.mesesAtivos} {vendedor.mesesAtivos === 1 ? 'mês' : 'meses'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Total de Vendas</p>
                      <p className="font-semibold text-green-600">{formatarMoeda(vendedor.totalVendas)}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Lucro Líquido</p>
                      <p className={`font-semibold ${vendedor.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(vendedor.totalLucro)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Média Mensal</p>
                      <p className="font-semibold text-blue-600">{formatarMoeda(vendedor.mediaVendas)}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Média Lucro</p>
                      <p className={`font-semibold ${vendedor.mediaLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(vendedor.mediaLucro)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
