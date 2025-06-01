
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileDown, TrendingUp, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DesempenhoMensal } from '@/components/DesempenhoMensal';

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
  const [setorista, setSetorista] = useState<string>('todos');
  const [anoSelecionado, setAnoSelecionado] = useState<string>('2024');
  const { toast } = useToast();

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      setDadosVendas(JSON.parse(dadosSalvos));
    }
  }, []);

  const setoristasUnicos = [...new Set(dadosVendas.map(d => d.setoristaName))];
  const anosUnicos = [...new Set(dadosVendas.map(d => d.ano))];

  const dadosFiltrados = dadosVendas.filter(dado => {
    const filtroSetorista = setorista === 'todos' || dado.setoristaName === setorista;
    const filtroAno = dado.ano === anoSelecionado;
    return filtroSetorista && filtroAno;
  });

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

  const calcularEstatisticas = () => {
    if (dadosFiltrados.length === 0) return null;

    const totalVendas = dadosFiltrados.reduce((acc, d) => acc + d.vendas, 0);
    const totalLucro = dadosFiltrados.reduce((acc, d) => acc + d.lucroLiquido, 0);
    const mediaVendas = totalVendas / dadosFiltrados.length;
    const mediaLucro = totalLucro / dadosFiltrados.length;

    const melhorMes = dadosFiltrados.reduce((melhor, atual) => 
      atual.vendas > melhor.vendas ? atual : melhor
    );

    const piorMes = dadosFiltrados.reduce((pior, atual) => 
      atual.vendas < pior.vendas ? atual : pior
    );

    return {
      totalVendas,
      totalLucro,
      mediaVendas,
      mediaLucro,
      melhorMes,
      piorMes,
      totalRegistros: dadosFiltrados.length
    };
  };

  const prepararDadosGrafico = () => {
    const dadosAgrupados = dadosFiltrados.reduce((acc, dado) => {
      const chave = `${obterNomeMes(dado.mes)}`;
      if (!acc[chave]) {
        acc[chave] = {
          mes: chave,
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

    return Object.values(dadosAgrupados);
  };

  const calcularDesempenho = (vendas: number, mediaGeral: number) => {
    if (mediaGeral === 0) return 'Neutro';
    const percentual = ((vendas - mediaGeral) / mediaGeral) * 100;
    
    if (percentual >= 20) return 'Excelente';
    if (percentual >= 10) return 'Bom';
    if (percentual >= -10) return 'Regular';
    return 'Abaixo da Média';
  };

  const obterCorDesempenho = (desempenho: string) => {
    switch (desempenho) {
      case 'Excelente': return 'text-green-600 bg-green-100';
      case 'Bom': return 'text-blue-600 bg-blue-100';
      case 'Regular': return 'text-yellow-600 bg-yellow-100';
      case 'Abaixo da Média': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportarPDF = () => {
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação para PDF será implementada em breve!"
    });
  };

  const estatisticas = calcularEstatisticas();
  const dadosGrafico = prepararDadosGrafico();

  return (
    <div className="space-y-6">
      {/* Comparação de Desempenho Mensal */}
      <DesempenhoMensal />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Setorista</label>
              <Select value={setorista} onValueChange={setSetorista}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Setoristas</SelectItem>
                  {setoristasUnicos.map((setoristaName) => (
                    <SelectItem key={setoristaName} value={setoristaName}>
                      {setoristaName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <Button onClick={exportarPDF} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {estatisticas ? (
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
                      {formatarMoeda(estatisticas.totalVendas)}
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
                    <p className="text-sm text-gray-600">Lucro Líquido</p>
                    <p className={`text-2xl font-bold ${estatisticas.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(estatisticas.totalLucro)}
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
                      {formatarMoeda(estatisticas.mediaVendas)}
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
                    <p className="text-sm text-gray-600">Registros</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {estatisticas.totalRegistros}
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
                  <p><strong>Setorista:</strong> {estatisticas.melhorMes.setoristaName}</p>
                  <p><strong>Período:</strong> {obterNomeMes(estatisticas.melhorMes.mes)}/{estatisticas.melhorMes.ano}</p>
                  <p><strong>Vendas:</strong> {formatarMoeda(estatisticas.melhorMes.vendas)}</p>
                  <p><strong>Lucro:</strong> {formatarMoeda(estatisticas.melhorMes.lucroLiquido)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">📉 Menor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Setorista:</strong> {estatisticas.piorMes.setoristaName}</p>
                  <p><strong>Período:</strong> {obterNomeMes(estatisticas.piorMes.mes)}/{estatisticas.piorMes.ano}</p>
                  <p><strong>Vendas:</strong> {formatarMoeda(estatisticas.piorMes.vendas)}</p>
                  <p><strong>Lucro:</strong> {formatarMoeda(estatisticas.piorMes.lucroLiquido)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
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
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Line type="monotone" dataKey="lucroLiquido" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Análise de Performance Individual */}
          {setorista !== 'todos' && (
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance - {setorista}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosFiltrados.map((dado) => {
                    const desempenho = calcularDesempenho(dado.vendas, estatisticas.mediaVendas);
                    return (
                      <div key={dado.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{obterNomeMes(dado.mes)}/{dado.ano}</p>
                          <p className="text-sm text-gray-600">
                            Vendas: {formatarMoeda(dado.vendas)} | Lucro: {formatarMoeda(dado.lucroLiquido)}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${obterCorDesempenho(desempenho)}`}>
                          {desempenho}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
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
