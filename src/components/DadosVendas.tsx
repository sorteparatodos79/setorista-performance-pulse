
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DadoVenda {
  id: string;
  vendedorId: string;
  vendedorNome: string;
  mes: string;
  ano: string;
  vendas: number;
  comissao: number;
  bonus: number;
  despesas: number;
  lucroLiquido: number;
}

export const DadosVendas = () => {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dadosVendas, setDadosVendas] = useState<DadoVenda[]>([]);
  const [formulario, setFormulario] = useState({
    vendedorId: '',
    mes: '',
    ano: new Date().getFullYear().toString(),
    vendas: '',
    comissao: '',
    bonus: '',
    despesas: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const vendedoresSalvos = localStorage.getItem('vendedores');
    if (vendedoresSalvos) {
      setVendedores(JSON.parse(vendedoresSalvos));
    }

    const dadosSalvos = localStorage.getItem('dadosVendas');
    if (dadosSalvos) {
      setDadosVendas(JSON.parse(dadosSalvos));
    }
  }, []);

  const calcularLucroLiquido = () => {
    const vendas = parseFloat(formulario.vendas) || 0;
    const comissao = parseFloat(formulario.comissao) || 0;
    const bonus = parseFloat(formulario.bonus) || 0;
    const despesas = parseFloat(formulario.despesas) || 0;
    
    return (vendas + comissao + bonus) - despesas;
  };

  const adicionarDados = () => {
    if (!formulario.vendedorId || !formulario.mes || !formulario.vendas) {
      toast({
        title: "Erro",
        description: "Vendedor, mês e valor de vendas são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const vendedorSelecionado = vendedores.find(v => v.id === formulario.vendedorId);
    if (!vendedorSelecionado) return;

    // Verificar se já existe dados para este vendedor no mês/ano
    const dadoExistente = dadosVendas.find(d => 
      d.vendedorId === formulario.vendedorId && 
      d.mes === formulario.mes && 
      d.ano === formulario.ano
    );

    if (dadoExistente) {
      toast({
        title: "Erro",
        description: "Já existem dados para este vendedor neste mês/ano",
        variant: "destructive"
      });
      return;
    }

    const novoDado: DadoVenda = {
      id: Date.now().toString(),
      vendedorId: formulario.vendedorId,
      vendedorNome: vendedorSelecionado.nome,
      mes: formulario.mes,
      ano: formulario.ano,
      vendas: parseFloat(formulario.vendas) || 0,
      comissao: parseFloat(formulario.comissao) || 0,
      bonus: parseFloat(formulario.bonus) || 0,
      despesas: parseFloat(formulario.despesas) || 0,
      lucroLiquido: calcularLucroLiquido()
    };

    const novosDados = [...dadosVendas, novoDado];
    localStorage.setItem('dadosVendas', JSON.stringify(novosDados));
    setDadosVendas(novosDados);
    
    setFormulario({
      vendedorId: '',
      mes: '',
      ano: new Date().getFullYear().toString(),
      vendas: '',
      comissao: '',
      bonus: '',
      despesas: ''
    });

    toast({
      title: "Sucesso",
      description: "Dados de vendas adicionados com sucesso!"
    });
  };

  const meses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterNomeMes = (numeroMes: string) => {
    const mes = meses.find(m => m.valor === numeroMes);
    return mes ? mes.nome : numeroMes;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Adicionar Dados de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vendedor">Vendedor *</Label>
              <Select value={formulario.vendedorId} onValueChange={(value) => setFormulario({...formulario, vendedorId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mes">Mês *</Label>
              <Select value={formulario.mes} onValueChange={(value) => setFormulario({...formulario, mes: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={formulario.ano}
                onChange={(e) => setFormulario({...formulario, ano: e.target.value})}
                placeholder="2024"
              />
            </div>

            <div>
              <Label htmlFor="vendas">Vendas (R$) *</Label>
              <Input
                id="vendas"
                type="number"
                step="0.01"
                value={formulario.vendas}
                onChange={(e) => setFormulario({...formulario, vendas: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="comissao">Comissão (R$)</Label>
              <Input
                id="comissao"
                type="number"
                step="0.01"
                value={formulario.comissao}
                onChange={(e) => setFormulario({...formulario, comissao: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="bonus">Bônus (R$)</Label>
              <Input
                id="bonus"
                type="number"
                step="0.01"
                value={formulario.bonus}
                onChange={(e) => setFormulario({...formulario, bonus: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="despesas">Despesas (R$)</Label>
              <Input
                id="despesas"
                type="number"
                step="0.01"
                value={formulario.despesas}
                onChange={(e) => setFormulario({...formulario, despesas: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <Label>Lucro Líquido Previsto</Label>
                <div className="text-lg font-semibold text-green-600">
                  {formatarMoeda(calcularLucroLiquido())}
                </div>
              </div>
            </div>
          </div>

          <Button onClick={adicionarDados} className="mt-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Adicionar Dados
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dados Registrados ({dadosVendas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dadosVendas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado de vendas registrado ainda
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Bônus</TableHead>
                    <TableHead>Despesas</TableHead>
                    <TableHead>Lucro Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosVendas
                    .sort((a, b) => `${b.ano}-${b.mes}`.localeCompare(`${a.ano}-${a.mes}`))
                    .map((dado) => (
                    <TableRow key={dado.id}>
                      <TableCell className="font-medium">{dado.vendedorNome}</TableCell>
                      <TableCell>{obterNomeMes(dado.mes)}/{dado.ano}</TableCell>
                      <TableCell>{formatarMoeda(dado.vendas)}</TableCell>
                      <TableCell>{formatarMoeda(dado.comissao)}</TableCell>
                      <TableCell>{formatarMoeda(dado.bonus)}</TableCell>
                      <TableCell>{formatarMoeda(dado.despesas)}</TableCell>
                      <TableCell className={`font-semibold ${dado.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(dado.lucroLiquido)}
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
