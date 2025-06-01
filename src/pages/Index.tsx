
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { SetoristasForm } from '@/components/SetoristasForm';
import { DadosVendas } from '@/components/DadosVendas';
import { RelatoriosAnalise } from '@/components/RelatoriosAnalise';
import { RankingVendedores } from '@/components/RankingVendedores';

const Index = () => {
  const [abaAtiva, setAbaAtiva] = useState('setoristas');

  const abas = [
    { id: 'setoristas', nome: 'Setoristas', icone: Users },
    { id: 'dados', nome: 'Dados de Vendas', icone: TrendingUp },
    { id: 'relatorios', nome: 'Relatórios', icone: FileText },
    { id: 'ranking', nome: 'Ranking', icone: BarChart3 }
  ];

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'setoristas':
        return <SetoristasForm />;
      case 'dados':
        return <DadosVendas />;
      case 'relatorios':
        return <RelatoriosAnalise />;
      case 'ranking':
        return <RankingVendedores />;
      default:
        return <SetoristasForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Análise de Setoristas
          </h1>
          <p className="text-gray-600">
            Gerencie e analise o desempenho da sua equipe de setoristas
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {abas.map((aba) => {
            const Icone = aba.icone;
            return (
              <Button
                key={aba.id}
                variant={abaAtiva === aba.id ? "default" : "outline"}
                onClick={() => setAbaAtiva(aba.id)}
                className="flex items-center gap-2"
              >
                <Icone className="h-4 w-4" />
                {aba.nome}
              </Button>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            {renderizarConteudo()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
