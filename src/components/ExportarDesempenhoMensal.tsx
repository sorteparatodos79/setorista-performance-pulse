
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
  setoristaId?: string;
}

export const ExportarDesempenhoMensal = ({ dadosVendas, setoristaId }: ExportarDesempenhoMensalProps) => {
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
    // Filtrar dados apenas do setorista selecionado
    const dadosFiltrados = setoristaId 
      ? dadosVendas.filter(dado => dado.setoristaId === setoristaId)
      : dadosVendas;

    if (dadosFiltrados.length === 0) {
      toast({
        title: "Erro",
        description: setoristaId ? "Não há dados para o setorista selecionado" : "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    // Ordenar por período (mais recente primeiro)
    const dadosOrdenados = dadosFiltrados
      .sort((a, b) => `${b.ano}-${b.mes.padStart(2, '0')}`.localeCompare(`${a.ano}-${a.mes.padStart(2, '0')}`))
      .slice(0, 12); // Últimos 12 meses

    const nomeSetorista = dadosOrdenados[0]?.setoristaName || 'Todos os Setoristas';

    // Calcular totais
    const totais = dadosOrdenados.reduce((acc, dado) => ({
      vendas: acc.vendas + dado.vendas,
      comissao: acc.comissao + dado.comissao,
      bonus: acc.bonus + dado.bonus,
      despesas: acc.despesas + dado.despesas,
      lucroLiquido: acc.lucroLiquido + dado.lucroLiquido
    }), { vendas: 0, comissao: 0, bonus: 0, despesas: 0, lucroLiquido: 0 });

    // Calcular médias
    const medias = {
      vendas: totais.vendas / dadosOrdenados.length,
      comissao: totais.comissao / dadosOrdenados.length,
      bonus: totais.bonus / dadosOrdenados.length,
      despesas: totais.despesas / dadosOrdenados.length,
      lucroLiquido: totais.lucroLiquido / dadosOrdenados.length
    };

    // Criar conteúdo HTML para impressão
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Desempenho - ${nomeSetorista}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 10px; }
          .subtitulo { text-align: center; color: #666; margin-bottom: 30px; font-size: 18px; }
          h2 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
          
          .resumo-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .resumo-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background-color: #f9f9f9;
          }
          
          .resumo-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          }
          
          .resumo-item {
            text-align: center;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
            border: 1px solid #eee;
          }
          
          .resumo-item h4 { margin: 0; color: #666; font-size: 11px; }
          .resumo-item p { margin: 5px 0 0 0; font-weight: bold; font-size: 13px; }
          
          .periodo-item {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            background-color: #fafafa;
          }
          
          .periodo-header {
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          
          .periodo-dados {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            text-align: center;
            font-size: 12px;
          }
          
          .lucro-positivo { color: #166534; font-weight: bold; }
          .lucro-negativo { color: #991b1b; font-weight: bold; }
          
          @media print {
            body { margin: 10px; }
            .periodo-item { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Relatório de Desempenho Mensal</h1>
        <div class="subtitulo">${nomeSetorista}</div>
        
        <div class="resumo-container">
          <div class="resumo-box">
            <h2>Totais Acumulados</h2>
            <div class="resumo-grid">
              <div class="resumo-item">
                <h4>Total Vendas</h4>
                <p style="color: #2563eb;">${formatarMoeda(totais.vendas)}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Comissão</h4>
                <p style="color: #ea580c;">${formatarMoeda(totais.comissao)}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Prêmios</h4>
                <p style="color: #9333ea;">${formatarMoeda(totais.bonus)}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Despesas</h4>
                <p style="color: #dc2626;">${formatarMoeda(totais.despesas)}</p>
              </div>
              <div class="resumo-item">
                <h4>Lucro Total</h4>
                <p class="${totais.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(totais.lucroLiquido)}</p>
              </div>
            </div>
          </div>
          
          <div class="resumo-box">
            <h2>Médias Mensais</h2>
            <div class="resumo-grid">
              <div class="resumo-item">
                <h4>Média Vendas</h4>
                <p style="color: #2563eb;">${formatarMoeda(medias.vendas)}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Comissão</h4>
                <p style="color: #ea580c;">${formatarMoeda(medias.comissao)}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Prêmios</h4>
                <p style="color: #9333ea;">${formatarMoeda(medias.bonus)}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Despesas</h4>
                <p style="color: #dc2626;">${formatarMoeda(medias.despesas)}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Lucro</h4>
                <p class="${medias.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(medias.lucroLiquido)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <h2>Detalhamento por Período</h2>
        ${dadosOrdenados.map((dado) => `
          <div class="periodo-item">
            <div class="periodo-header">${obterNomeMes(dado.mes)}/${dado.ano}</div>
            <div class="periodo-dados">
              <div>
                <strong>Vendas</strong><br>
                ${formatarMoeda(dado.vendas)}
              </div>
              <div>
                <strong>Comissão</strong><br>
                ${formatarMoeda(dado.comissao)}
              </div>
              <div>
                <strong>Prêmios</strong><br>
                ${formatarMoeda(dado.bonus)}
              </div>
              <div>
                <strong>Despesas</strong><br>
                ${formatarMoeda(dado.despesas)}
              </div>
              <div>
                <strong>Lucro Líquido</strong><br>
                <span class="${dado.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(dado.lucroLiquido)}</span>
              </div>
            </div>
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
      description: `Relatório de ${nomeSetorista} aberto para impressão/PDF`
    });
  };

  return (
    <Button onClick={exportarComparacao} className="flex items-center gap-2">
      <FileDown className="h-4 w-4" />
      Exportar Relatório Individual
    </Button>
  );
};
