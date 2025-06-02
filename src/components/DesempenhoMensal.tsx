import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ArrowUp, ArrowDown, Minus, Calculator } from 'lucide-react';

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

interface DesempenhoMensalProps {
  onSetoristaChange?: (setoristaId: string) => void;
}

export const DesempenhoMensal = ({ onSetoristaChange }: DesempenhoMensalProps) => {
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

  const handleSetoristaChange = (novoSetorista: string) => {
    setSetorista(novoSetorista);
    if (onSetoristaChange) {
      onSetoristaChange(novoSetorista);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const obterNomeMes = (numeroMes: string) => {
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[parseInt(numeroMes)];
  };

  const calcularPorcentagemSobreVendas = (valor: number, vendas: number) => {
    if (vendas === 0) return 0;
    return (valor / vendas) * 100;
  };

  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return { percentual: 0, tipo: 'neutro' };
    const percentual = ((atual - anterior) / anterior) * 100;
    const tipo = percentual > 0 ? 'positivo' : percentual < 0 ? 'negativo' : 'neutro';
    return { percentual: Math.abs(percentual), tipo };
  };

  const calcularVariacaoReal = (atual: number, anterior: number) => {
    return atual - anterior;
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

  const calcularResumo = () => {
    if (dadosSetorista.length === 0) return null;

    const totais = dadosSetorista.reduce((acc, dado) => ({
      vendas: acc.vendas + dado.vendas,
      comissao: acc.comissao + dado.comissao,
      bonus: acc.bonus + dado.bonus,
      despesas: acc.despesas + dado.despesas,
      lucroLiquido: acc.lucroLiquido + dado.lucroLiquido
    }), { vendas: 0, comissao: 0, bonus: 0, despesas: 0, lucroLiquido: 0 });

    const medias = {
      vendas: totais.vendas / dadosSetorista.length,
      comissao: totais.comissao / dadosSetorista.length,
      bonus: totais.bonus / dadosSetorista.length,
      despesas: totais.despesas / dadosSetorista.length,
      lucroLiquido: totais.lucroLiquido / dadosSetorista.length
    };

    return { totais, medias };
  };

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
            <Select value={setorista} onValueChange={handleSetoristaChange}>
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

  const resumo = calcularResumo();

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
          <Select value={setorista} onValueChange={handleSetoristaChange}>
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

            const variacaoRealVendas = dadoAnterior ? calcularVariacaoReal(dado.vendas, dadoAnterior.vendas) : 0;
            const variacaoRealComissao = dadoAnterior ? calcularVariacaoReal(dado.comissao, dadoAnterior.comissao) : 0;
            const variacaoRealBonus = dadoAnterior ? calcularVariacaoReal(dado.bonus, dadoAnterior.bonus) : 0;
            const variacaoRealDespesas = dadoAnterior ? calcularVariacaoReal(dado.despesas, dadoAnterior.despesas) : 0;
            const variacaoRealLucro = dadoAnterior ? calcularVariacaoReal(dado.lucroLiquido, dadoAnterior.lucroLiquido) : 0;

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
                      <p className="text-sm text-blue-600 font-medium">100,0%</p>
                      {index > 0 && (
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoVendas.tipo)}`}>
                            {getIconeVariacao(variacaoVendas.tipo)}
                            {variacaoVendas.percentual.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${getCorVariacao(variacaoVendas.tipo)}`}>
                            {formatarMoeda(variacaoRealVendas)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Comissão</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.comissao)}</p>
                      <p className="text-sm text-orange-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(dado.comissao, dado.vendas))}
                      </p>
                      {index > 0 && (
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoComissao.tipo)}`}>
                            {getIconeVariacao(variacaoComissao.tipo)}
                            {variacaoComissao.percentual.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${getCorVariacao(variacaoComissao.tipo)}`}>
                            {formatarMoeda(variacaoRealComissao)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Prêmios</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.bonus)}</p>
                      <p className="text-sm text-purple-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(dado.bonus, dado.vendas))}
                      </p>
                      {index > 0 && (
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoBonus.tipo)}`}>
                            {getIconeVariacao(variacaoBonus.tipo)}
                            {variacaoBonus.percentual.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${getCorVariacao(variacaoBonus.tipo)}`}>
                            {formatarMoeda(variacaoRealBonus)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Despesas</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dado.despesas)}</p>
                      <p className="text-sm text-red-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(dado.despesas, dado.vendas))}
                      </p>
                      {index > 0 && (
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoDespesas.tipo)}`}>
                            {getIconeVariacao(variacaoDespesas.tipo)}
                            {variacaoDespesas.percentual.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${getCorVariacao(variacaoDespesas.tipo)}`}>
                            {formatarMoeda(variacaoRealDespesas)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Lucro Líquido</p>
                      <p className={`text-lg font-semibold ${dado.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(dado.lucroLiquido)}
                      </p>
                      <p className={`text-sm font-medium ${dado.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(dado.lucroLiquido, dado.vendas))}
                      </p>
                      {index > 0 && (
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-sm ${getCorVariacao(variacaoLucro.tipo)}`}>
                            {getIconeVariacao(variacaoLucro.tipo)}
                            {variacaoLucro.percentual.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${getCorVariacao(variacaoLucro.tipo)}`}>
                            {formatarMoeda(variacaoRealLucro)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumo com Totais e Médias */}
        {resumo && (
          <Card className="mt-6 border-2 border-dashed border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Resumo Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Totais */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Totais Acumulados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Vendas</p>
                      <p className="text-lg font-bold text-blue-600">{formatarMoeda(resumo.totais.vendas)}</p>
                      <p className="text-sm text-blue-600 font-medium">100,0%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Comissão</p>
                      <p className="text-lg font-bold text-orange-600">{formatarMoeda(resumo.totais.comissao)}</p>
                      <p className="text-sm text-orange-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.totais.comissao, resumo.totais.vendas))}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Prêmios</p>
                      <p className="text-lg font-bold text-purple-600">{formatarMoeda(resumo.totais.bonus)}</p>
                      <p className="text-sm text-purple-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.totais.bonus, resumo.totais.vendas))}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Despesas</p>
                      <p className="text-lg font-bold text-red-600">{formatarMoeda(resumo.totais.despesas)}</p>
                      <p className="text-sm text-red-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.totais.despesas, resumo.totais.vendas))}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${resumo.totais.lucroLiquido >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm text-gray-600">Total Lucro Líquido</p>
                      <p className={`text-lg font-bold ${resumo.totais.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(resumo.totais.lucroLiquido)}
                      </p>
                      <p className={`text-sm font-medium ${resumo.totais.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.totais.lucroLiquido, resumo.totais.vendas))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Médias */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Médias Mensais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Média Vendas</p>
                      <p className="text-lg font-bold text-blue-600">{formatarMoeda(resumo.medias.vendas)}</p>
                      <p className="text-sm text-blue-600 font-medium">100,0%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Média Comissão</p>
                      <p className="text-lg font-bold text-orange-600">{formatarMoeda(resumo.medias.comissao)}</p>
                      <p className="text-sm text-orange-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.medias.comissao, resumo.medias.vendas))}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600">Média Prêmios</p>
                      <p className="text-lg font-bold text-purple-600">{formatarMoeda(resumo.medias.bonus)}</p>
                      <p className="text-sm text-purple-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.medias.bonus, resumo.medias.vendas))}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-600">Média Despesas</p>
                      <p className="text-lg font-bold text-red-600">{formatarMoeda(resumo.medias.despesas)}</p>
                      <p className="text-sm text-red-600 font-medium">
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.medias.despesas, resumo.medias.vendas))}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${resumo.medias.lucroLiquido >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-sm text-gray-600">Média Lucro Líquido</p>
                      <p className={`text-lg font-bold ${resumo.medias.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(resumo.medias.lucroLiquido)}
                      </p>
                      <p className={`text-sm font-medium ${resumo.medias.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(calcularPorcentagemSobreVendas(resumo.medias.lucroLiquido, resumo.medias.vendas))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
