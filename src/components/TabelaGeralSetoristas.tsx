
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileDown } from 'lucide-react';
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

  const obterStatus = (porcentagemLucro: number) => {
    if (porcentagemLucro >= 15) return 'Ideal';
    if (porcentagemLucro >= 10) return 'Na média';
    return 'Precisa melhorar';
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'Ideal': return 'bg-green-100 text-green-800';
      case 'Na média': return 'bg-yellow-100 text-yellow-800';
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

  const exportarPDF = () => {
    const resumoSetoristas = calcularResumoSetoristas();
    
    if (resumoSetoristas.length === 0) {
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
        <title>Resumo Comparativo - Setoristas ${anoSelecionado}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 11px; }
          h1 { color: #333; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; font-size: 10px; }
          td { font-size: 10px; }
          .status-ideal { background-color: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .status-media { background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .status-melhorar { background-color: #fecaca; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .lucro-positivo { color: #166534; font-weight: bold; }
          .lucro-negativo { color: #991b1b; font-weight: bold; }
          .posicao { font-weight: bold; text-align: center; }
          
          @media print {
            body { margin: 15px; }
          }
        </style>
      </head>
      <body>
        <h1>Resumo Comparativo de Setoristas - ${anoSelecionado}</h1>
        <p style="text-align: center; margin-bottom: 20px; color: #666;">Total de ${resumoSetoristas.length} setoristas analisados</p>
        
        <table>
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Setorista</th>
              <th>Vendas</th>
              <th>Comissão</th>
              <th>Prêmios</th>
              <th>Despesas</th>
              <th>Lucro (R$)</th>
              <th>Lucro (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumoSetoristas.map((setorista, index) => `
              <tr>
                <td class="posicao">${index + 1}º</td>
                <td style="font-weight: bold;">${setorista.nome}</td>
                <td>${formatarMoeda(setorista.totalVendas)}</td>
                <td>${formatarMoeda(setorista.totalComissao)}</td>
                <td>${formatarMoeda(setorista.totalBonus)}</td>
                <td>${formatarMoeda(setorista.totalDespesas)}</td>
                <td class="${setorista.totalLucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(setorista.totalLucro)}</td>
                <td class="${setorista.totalLucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarPorcentagem(setorista.porcentagemLucro)}</td>
                <td><span class="status-${setorista.status.toLowerCase().replace(' ', '-').replace('ç', 'c')}">${setorista.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <h3 style="margin: 0 0 8px 0; color: #555;">Critérios de Status:</h3>
          <p style="margin: 2px 0; font-size: 10px;"><strong>Ideal:</strong> Lucro ≥ 15% das vendas</p>
          <p style="margin: 2px 0; font-size: 10px;"><strong>Na média:</strong> Lucro entre 10% e 14,9% das vendas</p>
          <p style="margin: 2px 0; font-size: 10px;"><strong>Precisa melhorar:</strong> Lucro < 10% das vendas</p>
        </div>
        
        <p style="margin-top: 20px; font-size: 10px; color: #666; text-align: center;">
          Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
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
      description: "Relatório aberto para impressão/PDF"
    });
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
                Exportar PDF
              </Button>
            </div>
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
                    <TableHead>Posição</TableHead>
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
                  {resumoSetoristas.map((setorista, index) => (
                    <TableRow key={setorista.nome}>
                      <TableCell className="font-medium">{index + 1}º</TableCell>
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
