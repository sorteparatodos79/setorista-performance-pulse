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

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const obterNomeMes = (numeroMes: string) => {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
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
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background-color: #fafafa;
            page-break-inside: avoid;
          }
          
          .periodo-header {
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #eee;
            font-size: 16px;
            color: #333;
          }
          
          .periodo-dados {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
          }
          
          .dado-coluna {
            text-align: center;
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #e5e5e5;
          }
          
          .dado-titulo {
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
            font-size: 12px;
          }
          
          .dado-valor {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .dado-porcentagem {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          
          .dado-variacao {
            font-size: 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .variacao-percentual {
            font-weight: 600;
          }
          
          .variacao-valor {
            font-size: 9px;
          }
          
          .lucro-positivo { color: #166534; }
          .lucro-negativo { color: #991b1b; }
          .variacao-positiva { color: #166534; }
          .variacao-negativa { color: #991b1b; }
          .variacao-neutra { color: #6b7280; }
          
          .primeiro-periodo {
            background-color: #f0f9ff;
            border-color: #0ea5e9;
          }
          
          @media print {
            body { margin: 10px; font-size: 12px; }
            .periodo-item { page-break-inside: avoid; margin-bottom: 15px; }
            .resumo-container { page-break-after: always; }
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
                <p style="color: #2563eb; font-size: 10px;">100,0%</p>
              </div>
              <div class="resumo-item">
                <h4>Total Comissão</h4>
                <p style="color: #ea580c;">${formatarMoeda(totais.comissao)}</p>
                <p style="color: #ea580c; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(totais.comissao, totais.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Prêmios</h4>
                <p style="color: #9333ea;">${formatarMoeda(totais.bonus)}</p>
                <p style="color: #9333ea; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(totais.bonus, totais.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Total Despesas</h4>
                <p style="color: #dc2626;">${formatarMoeda(totais.despesas)}</p>
                <p style="color: #dc2626; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(totais.despesas, totais.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Lucro Total</h4>
                <p class="${totais.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(totais.lucroLiquido)}</p>
                <p class="${totais.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}" style="font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(totais.lucroLiquido, totais.vendas))}</p>
              </div>
            </div>
          </div>
          
          <div class="resumo-box">
            <h2>Médias Mensais</h2>
            <div class="resumo-grid">
              <div class="resumo-item">
                <h4>Média Vendas</h4>
                <p style="color: #2563eb;">${formatarMoeda(medias.vendas)}</p>
                <p style="color: #2563eb; font-size: 10px;">100,0%</p>
              </div>
              <div class="resumo-item">
                <h4>Média Comissão</h4>
                <p style="color: #ea580c;">${formatarMoeda(medias.comissao)}</p>
                <p style="color: #ea580c; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(medias.comissao, medias.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Prêmios</h4>
                <p style="color: #9333ea;">${formatarMoeda(medias.bonus)}</p>
                <p style="color: #9333ea; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(medias.bonus, medias.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Despesas</h4>
                <p style="color: #dc2626;">${formatarMoeda(medias.despesas)}</p>
                <p style="color: #dc2626; font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(medias.despesas, medias.vendas))}</p>
              </div>
              <div class="resumo-item">
                <h4>Média Lucro</h4>
                <p class="${medias.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(medias.lucroLiquido)}</p>
                <p class="${medias.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}" style="font-size: 10px;">${formatarPorcentagem(calcularPorcentagemSobreVendas(medias.lucroLiquido, medias.vendas))}</p>
              </div>
            </div>
          </div>
        </div>
        
        <h2>Detalhamento por Período com Comparações</h2>
        ${dadosOrdenados.map((dado, index) => {
          const dadoAnterior = index > 0 ? dadosOrdenados[index - 1] : null;
          
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

          const getClasseVariacao = (tipo: string) => {
            switch (tipo) {
              case 'positivo': return 'variacao-positiva';
              case 'negativo': return 'variacao-negativa';
              default: return 'variacao-neutra';
            }
          };

          const getIconeVariacao = (tipo: string) => {
            switch (tipo) {
              case 'positivo': return '↗';
              case 'negativo': return '↘';
              default: return '→';
            }
          };

          return `
          <div class="periodo-item ${index === dadosOrdenados.length - 1 ? 'primeiro-periodo' : ''}">
            <div class="periodo-header">
              ${obterNomeMes(dado.mes)}/${dado.ano}
              ${index === dadosOrdenados.length - 1 ? ' (Período mais antigo)' : ''}
            </div>
            <div class="periodo-dados">
              <div class="dado-coluna">
                <div class="dado-titulo">Vendas</div>
                <div class="dado-valor" style="color: #2563eb;">${formatarMoeda(dado.vendas)}</div>
                <div class="dado-porcentagem" style="color: #2563eb;">100,0%</div>
                ${index > 0 ? `
                  <div class="dado-variacao">
                    <div class="variacao-percentual ${getClasseVariacao(variacaoVendas.tipo)}">
                      ${getIconeVariacao(variacaoVendas.tipo)} ${variacaoVendas.percentual.toFixed(1)}%
                    </div>
                    <div class="variacao-valor ${getClasseVariacao(variacaoVendas.tipo)}">
                      ${formatarMoeda(variacaoRealVendas)}
                    </div>
                  </div>
                ` : '<div class="dado-variacao" style="color: #6b7280;">Base de comparação</div>'}
              </div>

              <div class="dado-coluna">
                <div class="dado-titulo">Comissão</div>
                <div class="dado-valor" style="color: #ea580c;">${formatarMoeda(dado.comissao)}</div>
                <div class="dado-porcentagem" style="color: #ea580c;">${formatarPorcentagem(calcularPorcentagemSobreVendas(dado.comissao, dado.vendas))}</div>
                ${index > 0 ? `
                  <div class="dado-variacao">
                    <div class="variacao-percentual ${getClasseVariacao(variacaoComissao.tipo)}">
                      ${getIconeVariacao(variacaoComissao.tipo)} ${variacaoComissao.percentual.toFixed(1)}%
                    </div>
                    <div class="variacao-valor ${getClasseVariacao(variacaoComissao.tipo)}">
                      ${formatarMoeda(variacaoRealComissao)}
                    </div>
                  </div>
                ` : '<div class="dado-variacao" style="color: #6b7280;">Base de comparação</div>'}
              </div>

              <div class="dado-coluna">
                <div class="dado-titulo">Prêmios</div>
                <div class="dado-valor" style="color: #9333ea;">${formatarMoeda(dado.bonus)}</div>
                <div class="dado-porcentagem" style="color: #9333ea;">${formatarPorcentagem(calcularPorcentagemSobreVendas(dado.bonus, dado.vendas))}</div>
                ${index > 0 ? `
                  <div class="dado-variacao">
                    <div class="variacao-percentual ${getClasseVariacao(variacaoBonus.tipo)}">
                      ${getIconeVariacao(variacaoBonus.tipo)} ${variacaoBonus.percentual.toFixed(1)}%
                    </div>
                    <div class="variacao-valor ${getClasseVariacao(variacaoBonus.tipo)}">
                      ${formatarMoeda(variacaoRealBonus)}
                    </div>
                  </div>
                ` : '<div class="dado-variacao" style="color: #6b7280;">Base de comparação</div>'}
              </div>

              <div class="dado-coluna">
                <div class="dado-titulo">Despesas</div>
                <div class="dado-valor" style="color: #dc2626;">${formatarMoeda(dado.despesas)}</div>
                <div class="dado-porcentagem" style="color: #dc2626;">${formatarPorcentagem(calcularPorcentagemSobreVendas(dado.despesas, dado.vendas))}</div>
                ${index > 0 ? `
                  <div class="dado-variacao">
                    <div class="variacao-percentual ${getClasseVariacao(variacaoDespesas.tipo)}">
                      ${getIconeVariacao(variacaoDespesas.tipo)} ${variacaoDespesas.percentual.toFixed(1)}%
                    </div>
                    <div class="variacao-valor ${getClasseVariacao(variacaoDespesas.tipo)}">
                      ${formatarMoeda(variacaoRealDespesas)}
                    </div>
                  </div>
                ` : '<div class="dado-variacao" style="color: #6b7280;">Base de comparação</div>'}
              </div>

              <div class="dado-coluna">
                <div class="dado-titulo">Lucro Líquido</div>
                <div class="dado-valor ${dado.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarMoeda(dado.lucroLiquido)}</div>
                <div class="dado-porcentagem ${dado.lucroLiquido >= 0 ? 'lucro-positivo' : 'lucro-negativo'}">${formatarPorcentagem(calcularPorcentagemSobreVendas(dado.lucroLiquido, dado.vendas))}</div>
                ${index > 0 ? `
                  <div class="dado-variacao">
                    <div class="variacao-percentual ${getClasseVariacao(variacaoLucro.tipo)}">
                      ${getIconeVariacao(variacaoLucro.tipo)} ${variacaoLucro.percentual.toFixed(1)}%
                    </div>
                    <div class="variacao-valor ${getClasseVariacao(variacaoLucro.tipo)}">
                      ${formatarMoeda(variacaoRealLucro)}
                    </div>
                  </div>
                ` : '<div class="dado-variacao" style="color: #6b7280;">Base de comparação</div>'}
              </div>
            </div>
          </div>
        `;
        }).join('')}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
          <h3 style="color: #555; margin-bottom: 10px;">Legenda:</h3>
          <div style="font-size: 12px; color: #666; line-height: 1.5;">
            <p><strong>Porcentagens:</strong> Representam a proporção de cada valor em relação às vendas totais do período.</p>
            <p><strong>Variações:</strong> Mostram a diferença percentual e em valor absoluto comparado ao período anterior.</p>
            <p><strong>Cores:</strong> 
              <span style="color: #166534;">Verde = crescimento</span> | 
              <span style="color: #991b1b;">Vermelho = redução</span> | 
              <span style="color: #6b7280;">Cinza = estável/base</span>
            </p>
          </div>
        </div>
        
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
      description: `Relatório detalhado de ${nomeSetorista} aberto para impressão/PDF`
    });
  };

  return (
    <Button onClick={exportarComparacao} className="flex items-center gap-2">
      <FileDown className="h-4 w-4" />
      Exportar Relatório Individual
    </Button>
  );
};
