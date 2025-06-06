import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, AlertTriangle, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      console.log('Dados carregados:', dados);
      setDadosVendas(dados);
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
    
    console.log('Dados filtrados para o ano', anoSelecionado, ':', dadosFiltrados);
    
    if (dadosFiltrados.length === 0) return null;

    // Agrupar por setorista
    const setoristas = dadosFiltrados.reduce((acc, dado) => {
      const key = `${dado.setoristaId} - ${dado.setoristaName}`;
      if (!acc[key]) {
        acc[key] = {
          nome: key,
          totalVendas: 0,
          totalLucro: 0,
          totalDespesas: 0,
          totalComissao: 0,
          totalBonus: 0,
          porcentagensLucro: [],
          porcentagensDespesas: [],
          mesesComDados: 0
        };
      }
      
      // Somar valores absolutos
      acc[key].totalVendas += dado.vendas;
      acc[key].totalLucro += dado.lucroLiquido;
      acc[key].totalDespesas += dado.despesas;
      acc[key].totalComissao += dado.comissao;
      acc[key].totalBonus += dado.bonus;
      acc[key].mesesComDados += 1;
      
      // Calcular porcentagens por mês
      const porcentagemLucroMes = dado.vendas > 0 ? (dado.lucroLiquido / dado.vendas) * 100 : 0;
      const porcentagemDespesasMes = dado.vendas > 0 ? (dado.despesas / dado.vendas) * 100 : 0;
      
      acc[key].porcentagensLucro.push(porcentagemLucroMes);
      acc[key].porcentagensDespesas.push(porcentagemDespesasMes);
      
      console.log(`${key} - Mês ${dado.mes}:`, {
        vendas: dado.vendas,
        lucroLiquido: dado.lucroLiquido,
        despesas: dado.despesas,
        porcentagemLucro: porcentagemLucroMes,
        porcentagemDespesas: porcentagemDespesasMes
      });
      
      return acc;
    }, {} as any);

    const listSetoristas = Object.values(setoristas) as any[];

    // Calcular médias das porcentagens
    const setoristasComMedias = listSetoristas.map(setorista => {
      const mediaLucro = setorista.porcentagensLucro.length > 0 
        ? setorista.porcentagensLucro.reduce((sum: number, perc: number) => sum + perc, 0) / setorista.porcentagensLucro.length 
        : 0;
      
      const mediaDespesas = setorista.porcentagensDespesas.length > 0
        ? setorista.porcentagensDespesas.reduce((sum: number, perc: number) => sum + perc, 0) / setorista.porcentagensDespesas.length
        : 0;
      
      console.log(`${setorista.nome} - Totais:`, {
        totalLucro: setorista.totalLucro,
        totalVendas: setorista.totalVendas,
        mediaLucro: mediaLucro,
        mediaDespesas: mediaDespesas,
        mesesComDados: setorista.mesesComDados
      });
      
      return {
        ...setorista,
        mediaPorcentagemLucro: mediaLucro,
        mediaPorcentagemDespesas: mediaDespesas
      };
    });

    // Rankings separados
    const rankingLucroAbsoluto = [...setoristasComMedias]
      .sort((a, b) => {
        console.log(`Comparando lucro: ${a.nome} (${a.totalLucro}) vs ${b.nome} (${b.totalLucro})`);
        return b.totalLucro - a.totalLucro;
      });

    const rankingPorcentagemLucro = [...setoristasComMedias]
      .sort((a, b) => {
        console.log(`Comparando % lucro: ${a.nome} (${a.mediaPorcentagemLucro}%) vs ${b.nome} (${b.mediaPorcentagemLucro}%)`);
        return b.mediaPorcentagemLucro - a.mediaPorcentagemLucro;
      });

    const rankingPorcentagemDespesas = [...setoristasComMedias]
      .sort((a, b) => {
        console.log(`Comparando % despesas: ${a.nome} (${a.mediaPorcentagemDespesas}%) vs ${b.nome} (${b.mediaPorcentagemDespesas}%)`);
        return b.mediaPorcentagemDespesas - a.mediaPorcentagemDespesas;
      });

    console.log('Ranking Lucro Absoluto:', rankingLucroAbsoluto.map(s => ({ nome: s.nome, valor: s.totalLucro })));
    console.log('Ranking % Lucro:', rankingPorcentagemLucro.map(s => ({ nome: s.nome, valor: s.mediaPorcentagemLucro })));
    console.log('Ranking % Despesas:', rankingPorcentagemDespesas.map(s => ({ nome: s.nome, valor: s.mediaPorcentagemDespesas })));

    return {
      rankingLucroAbsoluto,
      rankingPorcentagemLucro,
      rankingPorcentagemDespesas
    };
  };

  const exportarPDF = () => {
    const rankings = calcularRankings();
    
    if (!rankings) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    // Criar conteúdo HTML para impressão
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rankings de Setoristas - ${anoSelecionado}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
          h1 { color: #333; text-align: center; margin-bottom: 20px; }
          h2 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .lucro-positivo { color: #166534; font-weight: bold; }
          .lucro-negativo { color: #991b1b; font-weight: bold; }
          .ranking-lucro { background-color: #f0fdf4; }
          .ranking-porcentagem { background-color: #eff6ff; }
          .ranking-despesas { background-color: #fef2f2; }
          .posicao { font-weight: bold; text-align: center; }
          
          @media print {
            body { margin: 15px; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <h1>Rankings Completos de Setoristas - ${anoSelecionado}</h1>
        
        <h2 style="color: #166534;">🏆 Ranking por Lucro Absoluto (Soma dos Meses)</h2>
        <table class="ranking-lucro">
          <thead>
            <tr>
              <th class="posicao">Posição</th>
              <th>Setorista</th>
              <th>Lucro Total</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.rankingLucroAbsoluto.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td>${setorista.nome}</td>
                <td class="${setorista.totalLucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(setorista.totalLucro)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="page-break"></div>

        <h2 style="color: #2563eb;">📈 Ranking por Porcentagem de Lucro (Média dos Meses)</h2>
        <table class="ranking-porcentagem">
          <thead>
            <tr>
              <th class="posicao">Posição</th>
              <th>Setorista</th>
              <th>Porcentagem de Lucro (Média)</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.rankingPorcentagemLucro.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td>${setorista.nome}</td>
                <td class="${setorista.mediaPorcentagemLucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarPorcentagem(setorista.mediaPorcentagemLucro)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2 style="color: #dc2626;">⚠️ Ranking por Porcentagem de Despesas (Média dos Meses)</h2>
        <table class="ranking-despesas">
          <thead>
            <tr>
              <th class="posicao">Posição</th>
              <th>Setorista</th>
              <th>Porcentagem de Despesas (Média)</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.rankingPorcentagemDespesas.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td>${setorista.nome}</td>
                <td style="color: #dc2626; font-weight: bold;">${formatarPorcentagem(setorista.mediaPorcentagemDespesas)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p style="margin-top: 30px; font-size: 11px; color: #666; text-align: center;">
          Relatório de Rankings gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </p>
      </body>
      </html>
    `;

    // Abrir nova janela para impressão
    const novaJanela = window.open('', '_blank');
    if (novaJanela) {
      novaJanela.document.write(conteudoHTML);
      novaJanela.document.close();
      novaJanela.focus();
      setTimeout(() => {
        novaJanela.print();
      }, 500);
    }

    toast({
      title: "Sucesso",
      description: "Relatório de rankings aberto para impressão/PDF"
    });
  };

  const rankings = calcularRankings();

  return (
    <div className="space-y-6">
      {/* Filtro de Ano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rankings de Setoristas por Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
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
            <div className="flex items-end">
              <Button onClick={exportarPDF} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Exportar Rankings PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {rankings ? (
        <div className="space-y-6">
          {/* Ranking por Lucro Absoluto em Reais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Trophy className="h-6 w-6 text-green-600" />
                🏆 Ranking por Maior Lucro (Valor em R$)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Soma total dos lucros de todos os meses preenchidos
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead className="text-right">Lucro Total (R$)</TableHead>
                    <TableHead className="text-right">Vendas Totais (R$)</TableHead>
                    <TableHead className="text-right">Meses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingLucroAbsoluto.map((setorista, index) => (
                    <TableRow key={setorista.nome} className={index < 3 ? 'bg-green-50' : ''}>
                      <TableCell className="font-bold text-center">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}º`}
                      </TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className={`font-bold text-right ${setorista.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(setorista.totalLucro)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatarMoeda(setorista.totalVendas)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {setorista.mesesComDados}
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
                📈 Ranking por Maior Porcentagem de Lucro
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Média das porcentagens de lucro dos meses preenchidos
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead className="text-right">% de Lucro (Média)</TableHead>
                    <TableHead className="text-right">Lucro Total (R$)</TableHead>
                    <TableHead className="text-right">Meses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingPorcentagemLucro.map((setorista, index) => (
                    <TableRow key={setorista.nome} className={index < 3 ? 'bg-blue-50' : ''}>
                      <TableCell className="font-bold text-center">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}º`}
                      </TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className={`font-bold text-right ${setorista.mediaPorcentagemLucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatarPorcentagem(setorista.mediaPorcentagemLucro)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatarMoeda(setorista.totalLucro)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {setorista.mesesComDados}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ranking por Porcentagem de Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                ⚠️ Ranking por Maior Porcentagem de Despesas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Média das porcentagens de despesas dos meses preenchidos (requer atenção)
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Posição</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead className="text-right">% de Despesas (Média)</TableHead>
                    <TableHead className="text-right">Despesas Totais (R$)</TableHead>
                    <TableHead className="text-right">Meses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankingPorcentagemDespesas.map((setorista, index) => (
                    <TableRow key={setorista.nome} className={index < 3 ? 'bg-red-50' : ''}>
                      <TableCell className="font-bold text-center">
                        {index === 0 && '🚨'}
                        {index === 1 && '⚠️'}
                        {index === 2 && '⚡'}
                        {index > 2 && `${index + 1}º`}
                      </TableCell>
                      <TableCell className="font-medium">{setorista.nome}</TableCell>
                      <TableCell className="font-bold text-right text-red-600">
                        {formatarPorcentagem(setorista.mediaPorcentagemDespesas)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatarMoeda(setorista.totalDespesas)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {setorista.mesesComDados}
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
