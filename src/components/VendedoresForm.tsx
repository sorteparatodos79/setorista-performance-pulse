
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataContratacao: string;
}

export const VendedoresForm = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataContratacao: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const vendedoresSalvos = localStorage.getItem('vendedores');
    if (vendedoresSalvos) {
      setVendedores(JSON.parse(vendedoresSalvos));
    }
  }, []);

  const salvarVendedores = (novosVendedores: Vendedor[]) => {
    localStorage.setItem('vendedores', JSON.stringify(novosVendedores));
    setVendedores(novosVendedores);
  };

  const adicionarVendedor = () => {
    if (!formulario.nome || !formulario.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const novoVendedor: Vendedor = {
      id: Date.now().toString(),
      ...formulario
    };

    const novosVendedores = [...vendedores, novoVendedor];
    salvarVendedores(novosVendedores);
    limparFormulario();
    
    toast({
      title: "Sucesso",
      description: "Vendedor adicionado com sucesso!"
    });
  };

  const editarVendedor = () => {
    if (!vendedorEditando) return;

    const novosVendedores = vendedores.map(v => 
      v.id === vendedorEditando.id ? { ...vendedorEditando, ...formulario } : v
    );
    
    salvarVendedores(novosVendedores);
    setVendedorEditando(null);
    limparFormulario();
    
    toast({
      title: "Sucesso",
      description: "Vendedor atualizado com sucesso!"
    });
  };

  const excluirVendedor = (id: string) => {
    const novosVendedores = vendedores.filter(v => v.id !== id);
    salvarVendedores(novosVendedores);
    
    toast({
      title: "Sucesso",
      description: "Vendedor removido com sucesso!"
    });
  };

  const iniciarEdicao = (vendedor: Vendedor) => {
    setVendedorEditando(vendedor);
    setFormulario({
      nome: vendedor.nome,
      email: vendedor.email,
      telefone: vendedor.telefone,
      dataContratacao: vendedor.dataContratacao
    });
  };

  const limparFormulario = () => {
    setFormulario({
      nome: '',
      email: '',
      telefone: '',
      dataContratacao: ''
    });
    setVendedorEditando(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {vendedorEditando ? 'Editar Vendedor' : 'Cadastrar Novo Vendedor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formulario.nome}
                onChange={(e) => setFormulario({...formulario, nome: e.target.value})}
                placeholder="Digite o nome do vendedor"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formulario.email}
                onChange={(e) => setFormulario({...formulario, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formulario.telefone}
                onChange={(e) => setFormulario({...formulario, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="dataContratacao">Data de Contratação</Label>
              <Input
                id="dataContratacao"
                type="date"
                value={formulario.dataContratacao}
                onChange={(e) => setFormulario({...formulario, dataContratacao: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={vendedorEditando ? editarVendedor : adicionarVendedor}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {vendedorEditando ? 'Atualizar' : 'Cadastrar'}
            </Button>
            
            {vendedorEditando && (
              <Button variant="outline" onClick={limparFormulario}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendedores Cadastrados ({vendedores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vendedores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum vendedor cadastrado ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Contratação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendedores.map((vendedor) => (
                  <TableRow key={vendedor.id}>
                    <TableCell className="font-medium">{vendedor.nome}</TableCell>
                    <TableCell>{vendedor.email}</TableCell>
                    <TableCell>{vendedor.telefone || '-'}</TableCell>
                    <TableCell>{vendedor.dataContratacao || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => iniciarEdicao(vendedor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirVendedor(vendedor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
