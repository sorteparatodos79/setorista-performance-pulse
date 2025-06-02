import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileDown, TrendingUp, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DesempenhoMensal } from '@/components/DesempenhoMensal';
import { ExportarDesempenhoMensal } from '@/components/ExportarDesempenhoMensal';

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

export const RelatoriosAnalise = () => {
  const [dadosVendas, setDadosVendas] = useState<DadoVenda[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      // Recalcular lucro líquido para dados existentes com a nova fórmula
      const dadosCorrigidos = dados.map((dado: DadoVenda) => ({
        ...dado,
        lucroLiquido: dado.vendas - (dado.comissao + dado.bonus + dado.despesas)
      }));
      localStorage.setItem('dadosVendas', JSON.stringify(dadosCorrigidos));
      setDadosVendas(dadosCorrigidos);
    }
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterNomeMes = (numeroMes: string) => {
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[parseInt(numeroMes)];
  };

  const calcularEstatisticasGerais = () => {
    if (dadosVendas.length === 0) return null;

    const totalVendas = dadosVendas.reduce((acc, d) => acc + d.vendas, 0);
    const totalLucro = dadosVendas.reduce((acc, d) => acc + d.lucroLiquido, 0);
    const mediaVendas = totalVendas / dadosVendas.length;
    const mediaLucro = totalLucro / dadosVendas.length;

    const melhorMes = dadosVendas.reduce((melhor, atual) => 
      atual.vendas > melhor.vendas ? atual : melhor
    );

    const piorMes = dadosVendas.reduce((pior, atual) => 
      atual.vendas < pior.vendas ? atual : pior
    );

    return {
      totalVendas,
      totalLucro,
      mediaVendas,
      mediaLucro,
      melhorMes,
      piorMes,
      totalRegistros: dadosVendas.length
    };
  };

  const prepararDadosGrafico = () => {
    const dadosAgrupados = dadosVendas.reduce((acc, dado) => {
      const chave = `${obterNomeMes(dado.mes)}/${dado.ano}`;
      if (!acc[chave]) {
        acc[chave] = {
          periodo: chave,
          vendas: 0,
          lucroLiquido: 0,
          comissao: 0,
          bonus: 0,
          despesas: 0
        };
      }
      acc[chave].vendas += dado.vendas;
      acc[chave].lucroLiquido += dado.lucroLiquido;
      acc[chave].comissao += dado.comissao;
      acc[chave].bonus += dado.bonus;
      acc[chave].despesas += dado.despesas;
      return acc;
    }, {} as any);

    return Object.values(dadosAgrupados).slice(-6); // Últimos 6 meses
  };

  const exportarPDF = () => {
    toast({
      title: "Exportação PDF",
      description: "Funcionalidade de exportação em desenvolvimento. O relatório será otimizado para impressão em uma única página."
    });
  };

  const estatisticasGerais = calcularEstatisticasGerais();
  const dadosGrafico = prepararDadosGrafico();

  return (
    <div className="space-y-6">
      {/* Comparação de Desempenho Mensal */}
      <DesempenhoMensal />

      {/* Botões de Exportar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Exportar Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <ExportarDesempenhoMensal dadosVendas={dadosVendas} />
            <Button onClick={exportarPDF} className="flex items-center gap-2" variant="outline">
              <FileDown className="h-4 w-4" />
              Exportar PDF Completo
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Inclui comparação mensal (até 6 meses), resumo geral e análises otimizadas para impressão.
          </p>
        </CardContent>
      </Card>

      {estatisticasGerais ? (
        <>
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Vendas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(estatisticasGerais.totalVendas)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lucro Líquido Total</p>
                    <p className={`text-2xl font-bold ${estatisticasGerais.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(estatisticasGerais.totalLucro)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Média de Vendas</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatarMoeda(estatisticasGerais.mediaVendas)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Registros</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {estatisticasGerais.totalRegistros}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Melhor e Pior Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">📈 Melhor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Setorista:</strong> {estatisticasGerais.melhorMes.setoristaName}</p>
                  <p><strong>Período:</strong> {obterNomeMes(estatisticasGerais.melhorMes.mes)}/{estatisticasGerais.melhorMes.ano}</p>
                  <p><strong>Vendas:</strong> {formatarMoeda(estatisticasGerais.melhorMes.vendas)}</p>
                  <p><strong>Lucro:</strong> {formatarMoeda(estatisticasGerais.melhorMes.lucroLiquido)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">📉 Menor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Setorista:</strong> {estatisticasGerais.piorMes.setoristaName}</p>
                  <p><strong>Período:</strong> {obterNomeMes(estatisticasGerais.piorMes.mes)}/{estatisticasGerais.piorMes.ano}</p>
                  <p><strong>Vendas:</strong> {formatarMoeda(estatisticasGerais.piorMes.vendas)}</p>
                  <p><strong>Lucro:</strong> {formatarMoeda(estatisticasGerais.piorMes.lucroLiquido)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos dos Últimos 6 Meses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período (Últimos 6 Meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Bar dataKey="vendas" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Line type="monotone" dataKey="lucroLiquido" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
            <p>Adicione dados de vendas para visualizar relatórios e análises.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
