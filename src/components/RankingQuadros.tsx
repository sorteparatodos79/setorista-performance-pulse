
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

    // Rankings completos
    const rankingLucroAbsoluto = setoristasComPorcentagem
      .sort((a, b) => b.totalLucro - a.totalLucro);

    const rankingPorcentagemLucro = setoristasComPorcentagem
      .sort((a, b) => b.porcentagemLucro - a.porcentagemLucro);

    const rankingDespesas = setoristasComPorcentagem
      .sort((a, b) => b.porcentagemDespesas - a.porcentagemDespesas);

    return {
      rankingLucroAbsoluto,
      rankingPorcentagemLucro,
      rankingDespesas
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
            Rankings Completos de Setoristas
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
        <div className="space-y-6">
          {/* Ranking por Lucro Absoluto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Trophy className="h-6 w-6 text-green-600" />
                Ranking por Lucro Absoluto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Lucro Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingLucroAbsoluto.map((setorista, index) => (
                    <TableRow key={setorista.nome}>
                      <TableCell className="font-bold">{index + 1}º</TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className={`font-semibold ${setorista.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(setorista.totalLucro)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ranking por Porcentagem de Lucro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Ranking por Porcentagem de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Porcentagem de Lucro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingPorcentagemLucro.map((setorista, index) => (
                    <TableRow key={setorista.nome}>
                      <TableCell className="font-bold">{index + 1}º</TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className={`font-semibold ${setorista.porcentagemLucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(setorista.porcentagemLucro)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ranking de Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Ranking por Porcentagem de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Porcentagem de Despesas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingDespesas.map((setorista, index) => (
                    <TableRow key={setorista.nome}>
                      <TableCell className="font-bold">{index + 1}º</TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatarPorcentagem(setorista.porcentagemDespesas)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
