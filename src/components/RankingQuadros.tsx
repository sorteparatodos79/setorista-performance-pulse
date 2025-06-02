
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
        
        <h2 style="color: #166534;">🏆 Ranking por Lucro Absoluto</h2>
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

        <h2 style="color: #2563eb;">📈 Ranking por Porcentagem de Lucro</h2>
        <table class="ranking-porcentagem">
          <thead>
            <tr>
              <th class="posicao">Posição</th>
              <th>Setorista</th>
              <th>Porcentagem de Lucro</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.rankingPorcentagemLucro.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td>${setorista.nome}</td>
                <td class="${setorista.porcentagemLucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarPorcentagem(setorista.porcentagemLucro)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2 style="color: #dc2626;">⚠️ Ranking por Porcentagem de Despesas</h2>
        <table class="ranking-despesas">
          <thead>
            <tr>
              <th class="posicao">Posição</th>
              <th>Setorista</th>
              <th>Porcentagem de Despesas</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.rankingDespesas.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td>${setorista.nome}</td>
                <td style="color: #dc2626; font-weight: bold;">${formatarPorcentagem(setorista.porcentagemDespesas)}</td>
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
            Rankings Completos de Setoristas
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
