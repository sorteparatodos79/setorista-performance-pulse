import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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

export const DesempenhoMensal = () => {
  const [dadosVendas, setDadosVendas] = useState<DadoVenda[]>([]);
  const [setoristas, setSetoristas] = useState<any[]>([]);
  const [setorista, setSetorista] = useState<string>('');

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      // Recalcular lucro líquido para dados existentes com a nova fórmula
      const dadosCorrigidos = dados.map((dado: DadoVenda) => ({
        ...dado,
        lucroLiquido: dado.vendas - (dado.comissao + dado.bonus + dado.despesas)
      }));
      setDadosVendas(dadosCorrigidos);
    }

    const setoristasSalvos = localStorage.getItem('setoristas');
    if (setoristasSalvos) {
      setSetoristas(JSON.parse(setoristasSalvos));
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

  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return { percentual: 0, tipo: 'neutro' };
    const percentual = ((atual - anterior) / anterior) * 100;
    const tipo = percentual > 0 ? 'positivo' : percentual < 0 ? 'negativo' : 'neutro';
    return { percentual: Math.abs(percentual), tipo };
  };

  const getIconeVariacao = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'negativo': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCorVariacao = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return 'text-green-600';
      case 'negativo': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const dadosSetorista = dadosVendas
    .filter(d => d.setoristaId === setorista)
    .sort((a, b) => `${a.ano}-${a.mes}`.localeCompare(`${b.ano}-${b.mes}`));

  if (!setorista || dadosSetorista.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comparação de Desempenho Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm font-medium">Selecione um Setorista</label>
            <Select value={setorista} onValueChange={setSetorista}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Escolha um setorista" />
              </SelectTrigger>
              <SelectContent>
                {setoristas.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {setorista && dadosSetorista.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado encontrado para este setorista
            </div>
          )}
          
          {!setorista && (
            <div className="text-center py-8 text-gray-500">
              Selecione um setorista para ver a comparação de desempenho
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Comparação de Desempenho Mensal - {dadosSetorista[0]?.setoristaName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={setorista} onValueChange={setSetorista}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setoristas.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {dadosSetorista.map((dado, index) => {
            const dadoAnterior = index > 0 ? dadosSetorista[index - 1] : null;
            
            const variacaoVendas = dadoAnterior ? calcularVariacao(dado.vendas, dadoAnterior.vendas) : { percentual: 0, tipo: 'neutro' };
            const variacaoComissao = dadoAnterior ? calcularVariacao(dado.comissao, dadoAnterior.comissao) : { percentual: 0, tipo: 'neutro' };
            const variacaoBonus = dadoAnterior ? calcularVariacao(dado.bonus, dadoAnterior.bonus) : { percentual: 0, tipo: 'neutro' };
            const variacaoDespesas = dadoAnterior ? calcularVariacao(dado.despesas, dadoAnterior.despesas) : { percentual: 0, tipo: 'neutro' };
            const variacaoLucro = dadoAnterior ? calcularVariacao(dado.lucroLiquido, dadoAnterior.lucroLiquido) : { percentual: 0, tipo: 'neutro' };

            return (
              <Card key={dado.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {obterNomeMes(dado.mes)}/{dado.ano}
                    </h3>
                    {index === 0 && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Primeiro período
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Vendas</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.vendas)}</p>
                      {index > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoVendas.tipo)}`}>
                          {getIconeVariacao(variacaoVendas.tipo)}
                          {variacaoVendas.percentual.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Comissão</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.comissao)}</p>
                      {index > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoComissao.tipo)}`}>
                          {getIconeVariacao(variacaoComissao.tipo)}
                          {variacaoComissao.percentual.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Prêmios</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.bonus)}</p>
                      {index > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoBonus.tipo)}`}>
                          {getIconeVariacao(variacaoBonus.tipo)}
                          {variacaoBonus.percentual.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Despesas</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.despesas)}</p>
                      {index > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoDespesas.tipo)}`}>
                          {getIconeVariacao(variacaoDespesas.tipo)}
                          {variacaoDespesas.percentual.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Lucro Líquido</p>
                      <p className={`text-lg font-semibold ${dado.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(dado.lucroLiquido)}
                      </p>
                      {index > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoLucro.tipo)}`}>
                          {getIconeVariacao(variacaoLucro.tipo)}
                          {variacaoLucro.percentual.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
