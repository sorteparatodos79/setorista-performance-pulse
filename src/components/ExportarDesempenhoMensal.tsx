
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
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

interface ExportarDesempenhoMensalProps {
  dadosVendas: DadoVenda[];
}

export const ExportarDesempenhoMensal = ({ dadosVendas }: ExportarDesempenhoMensalProps) => {
  const { toast } = useToast();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterNomeMes = (numeroMes: string) => {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[parseInt(numeroMes)];
  };

  const exportarComparacao = () => {
    if (dadosVendas.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    // Agrupar dados por mês/ano
    const dadosAgrupados = dadosVendas.reduce((acc, dado) => {
      const chave = `${dado.mes}/${dado.ano}`;
      if (!acc[chave]) {
        acc[chave] = {
          periodo: `${obterNomeMes(dado.mes)}/${dado.ano}`,
          mes: dado.mes,
          ano: dado.ano,
          vendas: 0,
          lucroLiquido: 0,
          comissao: 0,
          bonus: 0,
          despesas: 0,
          setoristas: []
        };
      }
      acc[chave].vendas += dado.vendas;
      acc[chave].lucroLiquido += dado.lucroLiquido;
      acc[chave].comissao += dado.comissao;
      acc[chave].bonus += dado.bonus;
      acc[chave].despesas += dado.despesas;
      acc[chave].setoristas.push({
        nome: dado.setoristaName,
        vendas: dado.vendas,
        lucro: dado.lucroLiquido
      });
      return acc;
    }, {} as any);

    const periodosOrdenados = Object.values(dadosAgrupados)
      .sort((a: any, b: any) => `${b.ano}-${b.mes}`.localeCompare(`${a.ano}-${a.mes}`))
      .slice(0, 6); // Últimos 6 meses

    // Criar conteúdo HTML para impressão
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comparação de Desempenho Mensal</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          h2 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
          .periodo-card { 
            margin-bottom: 30px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            padding: 15px; 
            background-color: #f9f9f9; 
          }
          .resumo-periodo { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 10px; 
            margin-bottom: 15px; 
          }
          .resumo-item { 
            text-align: center; 
            padding: 10px; 
            background-color: white; 
            border-radius: 5px; 
          }
          .resumo-item h4 { margin: 0; color: #666; font-size: 12px; }
          .resumo-item p { margin: 5px 0 0 0; font-weight: bold; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; }
          .lucro-positivo { color: #166534; font-weight: bold; }
          .lucro-negativo { color: #991b1b; font-weight: bold; }
          @media print {
            .periodo-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Comparação de Desempenho Mensal</h1>
        
        ${periodosOrdenados.map((periodo: any) => `
          <div class="periodo-card">
            <h2>${periodo.periodo}</h2>
            
            <div class="resumo-periodo">
              <div class="resumo-item">
                <h4>Total Vendas</h4>
                <p>${formatarMoeda(periodo.vendas)}</p>
              </div>
              <div class="resumo-item">
                <h4>Lucro Líquido</h4>
                <p class="${periodo.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(periodo.lucroLiquido)}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Comissões</h4>
                <p>${formatarMoeda(periodo.comissao)}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Despesas</h4>
                <p>${formatarMoeda(periodo.despesas)}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Setorista</th>
                  <th>Vendas</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                ${periodo.setoristas.map((setorista: any) => `
                  <tr>
                    <td>${setorista.nome}</td>
                    <td>${formatarMoeda(setorista.vendas)}</td>
                    <td class="${setorista.lucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(setorista.lucro)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
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
      description: "Comparação mensal aberta para impressão/PDF"
    });
  };

  return (
    <Button onClick={exportarComparacao} className="flex items-center gap-2">
      <FileDown className="h-4 w-4" />
      Exportar Comparação Mensal
    </Button>
  );
};
