
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Setorista {
  id: string;
  nome: string;
  telefone: string;
  dataContratacao: string;
}

export const SetoristasForm = () => {
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [setoristaEditando, setSetoristaEditando] = useState<Setorista | null>(null);
  const [formulario, setFormulario] = useState({
    nome: '',
    telefone: '',
    dataContratacao: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const setoristasSalvos = localStorage.getItem('setoristas');
    if (setoristasSalvos) {
      setSetoristas(JSON.parse(setoristasSalvos));
    }
  }, []);

  const salvarSetoristas = (novosSetoristas: Setorista[]) => {
    localStorage.setItem('setoristas', JSON.stringify(novosSetoristas));
    setSetoristas(novosSetoristas);
  };

  const adicionarSetorista = () => {
    if (!formulario.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const novoSetorista: Setorista = {
      id: Date.now().toString(),
      ...formulario
    };

    const novosSetoristas = [...setoristas, novoSetorista];
    salvarSetoristas(novosSetoristas);
    limparFormulario();
    
    toast({
      title: "Sucesso",
      description: "Setorista adicionado com sucesso!"
    });
  };

  const editarSetorista = () => {
    if (!setoristaEditando) return;

    const novosSetoristas = setoristas.map(s => 
      s.id === setoristaEditando.id ? { ...setoristaEditando, ...formulario } : s
    );
    
    salvarSetoristas(novosSetoristas);
    setSetoristaEditando(null);
    limparFormulario();
    
    toast({
      title: "Sucesso",
      description: "Setorista atualizado com sucesso!"
    });
  };

  const excluirSetorista = (id: string) => {
    const novosSetoristas = setoristas.filter(s => s.id !== id);
    salvarSetoristas(novosSetoristas);
    
    toast({
      title: "Sucesso",
      description: "Setorista removido com sucesso!"
    });
  };

  const iniciarEdicao = (setorista: Setorista) => {
    setSetoristaEditando(setorista);
    setFormulario({
      nome: setorista.nome,
      telefone: setorista.telefone,
      dataContratacao: setorista.dataContratacao
    });
  };

  const limparFormulario = () => {
    setFormulario({
      nome: '',
      telefone: '',
      dataContratacao: ''
    });
    setSetoristaEditando(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {setoristaEditando ? 'Editar Setorista' : 'Cadastrar Novo Setorista'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formulario.nome}
                onChange={(e) => setFormulario({...formulario, nome: e.target.value})}
                placeholder="Digite o nome do setorista"
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
              onClick={setoristaEditando ? editarSetorista : adicionarSetorista}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {setoristaEditando ? 'Atualizar' : 'Cadastrar'}
            </Button>
            
            {setoristaEditando && (
              <Button variant="outline" onClick={limparFormulario}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setoristas Cadastrados ({setoristas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {setoristas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum setorista cadastrado ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Contratação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {setoristas.map((setorista) => (
                  <TableRow key={setorista.id}>
                    <TableCell className="font-medium">{setorista.nome}</TableCell>
                    <TableCell>{setorista.telefone || '-'}</TableCell>
                    <TableCell>{setorista.dataContratacao || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => iniciarEdicao(setorista)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirSetorista(setorista.id)}
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
