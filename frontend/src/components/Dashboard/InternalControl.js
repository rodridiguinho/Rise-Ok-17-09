import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { 
  Building2,
  Users,
  CreditCard,
  Plane,
  HandCoins,
  Link,
  Plus,
  Save,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

const InternalControl = () => {
  const { toast } = useToast();
  
  // Estados para cada seção
  const [activeSection, setActiveSection] = useState('investimentos');
  
  // 1. Investimento de Sócios
  const [investimentos, setInvestimentos] = useState([]);
  const [novoInvestimento, setNovoInvestimento] = useState({
    nomeSocio: '',
    negocioInvestimento: '',
    valorInvestido: '',
    dataInvestimento: '',
    prazoPagamento: '',
    informacoesLivres: '',
    quantasVezes: '',
    valoresMensais: '',
    valorFinalPrazo: ''
  });

  // 2. Pagamentos de Clientes Parcelados
  const [pagamentosParcelados, setPagamentosParcelados] = useState([]);
  const [novoPagamentoParcelado, setNovoPagamentoParcelado] = useState({
    nomeCliente: '',
    numeroVenda: '',
    numeroRegistro: '', // NOVO CAMPO ADICIONADO
    valorTotalVenda: '',
    valorEntrada: '',
    dataEntrada: '',
    tipoPagamentoEntrada: '',
    quantasVezes: '',
    valorPorMes: '',
    datasEtiposPagamento: [],
    valorFinalPrestacoes: ''
  });

  // 3. Controle de Cliente com Milhas
  const [controleMilhas, setControleMilhas] = useState([]);
  const [novoControleMilhas, setNovoControleMilhas] = useState({
    nomeCliente: '',
    numeroVenda: '',
    valorVendaCliente: '',
    valorPagoCliente: '',
    tipoPagamentoCliente: '',
    valorNegociadoMilhas: '',
    quantidadeMilhas: '',
    valorMilheiroRise: '',
    programaMilhas: '',
    informacoesAdicionais: ''
  });

  // 4. Contas com Sócios
  const [contasSocios, setContasSocios] = useState([]);
  const [novaContaSocio, setNovaContaSocio] = useState({
    nomeSocio: '',
    valoresRetirados: '',
    dataRetirada: '', // NOVO CAMPO ADICIONADO
    informacoesAdicionais: ''
  });

  // 5. Links de Consolidadoras
  const [linksConsolidadoras, setLinksConsolidadoras] = useState([]);
  const [novoLinkConsolidadora, setNovoLinkConsolidadora] = useState({
    nomeEmpresa: '',
    contatoNumero: '',
    contatoEmail: '',
    loginUsuario: '',
    senha: '',
    linkSite: '',
    informacoesAdicionais: ''
  });

  // 6. Pagamentos Mensais Fixos - NOVA SEÇÃO
  const [pagamentosMensais, setPagamentosMensais] = useState([]);
  const [novoPagamentoMensal, setNovoPagamentoMensal] = useState({
    tipoConta: '',
    nomeEmpresa: '',
    valor: '',
    valorJuros: '',
    dataPagamento: '',
    contaPagamento: '',
    statusPago: false
  });

  // Funções para adicionar registros
  const adicionarInvestimento = () => {
    if (!novoInvestimento.nomeSocio || !novoInvestimento.valorInvestido) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome do sócio e valor investido."
      });
      return;
    }

    setInvestimentos([...investimentos, { ...novoInvestimento, id: Date.now() }]);
    setNovoInvestimento({
      nomeSocio: '',
      negocioInvestimento: '',
      valorInvestido: '',
      dataInvestimento: '',
      prazoPagamento: '',
      informacoesLivres: '',
      quantasVezes: '',
      valoresMensais: '',
      valorFinalPrazo: ''
    });
    
    toast({
      title: "Investimento adicionado",
      description: "Registro salvo com sucesso!"
    });
  };

  const adicionarPagamentoParcelado = () => {
    if (!novoPagamentoParcelado.nomeCliente || !novoPagamentoParcelado.valorTotalVenda) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome do cliente e valor total."
      });
      return;
    }

    setPagamentosParcelados([...pagamentosParcelados, { ...novoPagamentoParcelado, id: Date.now() }]);
    setNovoPagamentoParcelado({
      nomeCliente: '',
      numeroVenda: '',
      numeroRegistro: '',
      valorTotalVenda: '',
      valorEntrada: '',
      dataEntrada: '',
      tipoPagamentoEntrada: '',
      quantasVezes: '',
      valorPorMes: '',
      datasEtiposPagamento: [],
      valorFinalPrestacoes: ''
    });

    toast({
      title: "Pagamento parcelado adicionado",
      description: "Registro salvo com sucesso!"
    });
  };

  const adicionarControleMilhas = () => {
    if (!novoControleMilhas.nomeCliente || !novoControleMilhas.valorVendaCliente) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios", 
        description: "Preencha pelo menos o nome do cliente e valor da venda."
      });
      return;
    }

    setControleMilhas([...controleMilhas, { ...novoControleMilhas, id: Date.now() }]);
    setNovoControleMilhas({
      nomeCliente: '',
      numeroVenda: '',
      valorVendaCliente: '',
      valorPagoCliente: '',
      tipoPagamentoCliente: '',
      valorNegociadoMilhas: '',
      quantidadeMilhas: '',
      valorMilheiroRise: '',
      programaMilhas: '',
      informacoesAdicionais: ''
    });

    toast({
      title: "Controle de milhas adicionado",
      description: "Registro salvo com sucesso!"
    });
  };

  const adicionarContaSocio = () => {
    if (!novaContaSocio.nomeSocio || !novaContaSocio.valoresRetirados) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome do sócio e valores retirados."
      });
      return;
    }

    setContasSocios([...contasSocios, { ...novaContaSocio, id: Date.now() }]);
    setNovaContaSocio({
      nomeSocio: '',
      valoresRetirados: '',
      dataRetirada: '',
      informacoesAdicionais: ''
    });

    toast({
      title: "Conta com sócio adicionada",
      description: "Registro salvo com sucesso!"
    });
  };

  const adicionarLinkConsolidadora = () => {
    if (!novoLinkConsolidadora.nomeEmpresa) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Preencha pelo menos o nome da empresa."
      });
      return;
    }

    setLinksConsolidadoras([...linksConsolidadoras, { ...novoLinkConsolidadora, id: Date.now() }]);
    setNovoLinkConsolidadora({
      nomeEmpresa: '',
      contatoNumero: '',
      contatoEmail: '',
      loginUsuario: '',
      senha: '',
      linkSite: '',
      informacoesAdicionais: ''
    });

    toast({
      title: "Link de consolidadora adicionado",
      description: "Registro salvo com sucesso!"
    });
  };

  // NOVA FUNÇÃO: Adicionar Pagamento Mensal
  const adicionarPagamentoMensal = () => {
    if (!novoPagamentoMensal.tipoConta || !novoPagamentoMensal.nomeEmpresa || !novoPagamentoMensal.valor) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha pelo menos o tipo de conta, empresa e valor."
      });
      return;
    }

    setPagamentosMensais([...pagamentosMensais, { ...novoPagamentoMensal, id: Date.now() }]);
    setNovoPagamentoMensal({
      tipoConta: '',
      nomeEmpresa: '',
      valor: '',
      valorJuros: '',
      dataPagamento: '',
      contaPagamento: '',
      statusPago: false
    });

    toast({
      title: "Sucesso",
      description: "Pagamento mensal adicionado com sucesso!"
    });
  };

  // NOVA FUNÇÃO: Duplicar Pagamento para Próximo Mês
  const duplicarPagamentoProximoMes = (pagamento) => {
    const dataAtual = new Date(pagamento.dataPagamento);
    const proximoMes = new Date(dataAtual.setMonth(dataAtual.getMonth() + 1));
    
    const novoPagamento = {
      ...pagamento,
      id: Date.now(),
      dataPagamento: proximoMes.toISOString().split('T')[0],
      statusPago: false // Resetar status para não pago
    };

    setPagamentosMensais([...pagamentosMensais, novoPagamento]);

    toast({
      title: "Sucesso",
      description: `Pagamento duplicado para ${proximoMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}!`
    });
  };

  const renderInvestimentos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-green-600" />
          Investimento de Sócios
        </h3>
        <span className="text-sm text-gray-500">{investimentos.length} registros</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Novo Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Sócio *</Label>
              <Input
                placeholder="Nome do sócio"
                value={novoInvestimento.nomeSocio}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, nomeSocio: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Negócio para Investimento</Label>
              <Input
                placeholder="Descrição do negócio"
                value={novoInvestimento.negocioInvestimento}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, negocioInvestimento: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Investido *</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoInvestimento.valorInvestido}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, valorInvestido: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Investimento</Label>
              <Input
                type="date"
                value={novoInvestimento.dataInvestimento}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, dataInvestimento: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Prazo de Pagamento</Label>
              <Input
                placeholder="Ex: 12 meses"
                value={novoInvestimento.prazoPagamento}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, prazoPagamento: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Pagamento em Quantas Vezes</Label>
              <Input
                type="number"
                placeholder="Número de parcelas"
                value={novoInvestimento.quantasVezes}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, quantasVezes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valores Mensais</Label>
              <Input
                type="number"
                placeholder="Valor por mês"
                step="0.01"
                value={novoInvestimento.valoresMensais}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, valoresMensais: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Final Pagando a Prazo</Label>
              <Input
                type="number"
                placeholder="Valor total final"
                step="0.01"
                value={novoInvestimento.valorFinalPrazo}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, valorFinalPrazo: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Informações Livres</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Informações adicionais..."
                value={novoInvestimento.informacoesLivres}
                onChange={(e) => setNovoInvestimento({...novoInvestimento, informacoesLivres: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarInvestimento} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Investimento</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de investimentos salvos */}
      {investimentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investimentos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investimentos.map((inv) => (
                <div key={inv.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{inv.nomeSocio}</h4>
                      <p className="text-sm text-gray-600">{inv.negocioInvestimento}</p>
                      <p className="text-lg font-semibold text-green-600">R$ {parseFloat(inv.valorInvestido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {inv.dataInvestimento && <p>Data: {new Date(inv.dataInvestimento).toLocaleDateString('pt-BR')}</p>}
                      {inv.prazoPagamento && <p>Prazo: {inv.prazoPagamento}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPagamentosParcelados = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
          Pagamentos de Clientes Parcelados
        </h3>
        <span className="text-sm text-gray-500">{pagamentosParcelados.length} registros</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Novo Pagamento Parcelado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Cliente *</Label>
              <Input
                placeholder="Nome do cliente"
                value={novoPagamentoParcelado.nomeCliente}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, nomeCliente: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Número da Venda</Label>
              <Input
                placeholder="Número gerado pelo sistema"
                value={novoPagamentoParcelado.numeroVenda}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, numeroVenda: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Registro</Label>
              <Input
                placeholder="Número de registro gerado na venda"
                value={novoPagamentoParcelado.numeroRegistro}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, numeroRegistro: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Total da Venda *</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoPagamentoParcelado.valorTotalVenda}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, valorTotalVenda: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor de Entrada</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoPagamentoParcelado.valorEntrada}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, valorEntrada: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Entrada</Label>
              <Input
                type="date"
                value={novoPagamentoParcelado.dataEntrada}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, dataEntrada: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Pagamento da Entrada</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={novoPagamentoParcelado.tipoPagamentoEntrada}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, tipoPagamentoEntrada: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Quantas Vezes Será Pago</Label>
              <Input
                type="number"
                placeholder="Número de parcelas"
                value={novoPagamentoParcelado.quantasVezes}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, quantasVezes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Por Mês</Label>
              <Input
                type="number"
                placeholder="Valor mensal"
                step="0.01"
                value={novoPagamentoParcelado.valorPorMes}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, valorPorMes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Final em Prestações</Label>
              <Input
                type="number"
                placeholder="Valor total final"
                step="0.01"
                value={novoPagamentoParcelado.valorFinalPrestacoes}
                onChange={(e) => setNovoPagamentoParcelado({...novoPagamentoParcelado, valorFinalPrestacoes: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarPagamentoParcelado} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Pagamento Parcelado</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagamentos parcelados salvos */}
      {pagamentosParcelados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Parcelados Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pagamentosParcelados.map((pag) => (
                <div key={pag.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{pag.nomeCliente}</h4>
                      <p className="text-sm text-gray-600">Venda: {pag.numeroVenda}</p>
                      {pag.numeroRegistro && <p className="text-sm text-gray-600">Registro: {pag.numeroRegistro}</p>}
                      <p className="text-lg font-semibold text-blue-600">Total: R$ {parseFloat(pag.valorTotalVenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {pag.valorEntrada && <p>Entrada: R$ {parseFloat(pag.valorEntrada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                      {pag.quantasVezes && <p>{pag.quantasVezes}x de R$ {parseFloat(pag.valorPorMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Continuarei com as outras seções nos próximos blocos...
  const renderControleMilhas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Plane className="mr-2 h-5 w-5 text-purple-600" />
          Controle de Cliente com Milhas
        </h3>
        <span className="text-sm text-gray-500">{controleMilhas.length} registros</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Novo Controle de Milhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Cliente *</Label>
              <Input
                placeholder="Nome do cliente"
                value={novoControleMilhas.nomeCliente}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, nomeCliente: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Número da Venda</Label>
              <Input
                placeholder="Número gerado pelo sistema"
                value={novoControleMilhas.numeroVenda}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, numeroVenda: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor da Venda do Cliente *</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoControleMilhas.valorVendaCliente}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, valorVendaCliente: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Pago pelo Cliente</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoControleMilhas.valorPagoCliente}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, valorPagoCliente: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Pagamento do Cliente</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={novoControleMilhas.tipoPagamentoCliente}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, tipoPagamentoCliente: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Milhas">Milhas</option>
                <option value="Misto">Misto</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Valor Negociado para Ficar com Milhas</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoControleMilhas.valorNegociadoMilhas}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, valorNegociadoMilhas: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade de Milhas para Uso</Label>
              <Input
                type="number"
                placeholder="Quantidade de milhas"
                value={novoControleMilhas.quantidadeMilhas}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, quantidadeMilhas: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor do Milheiro para Rise Travel</Label>
              <Input
                type="number"
                placeholder="Valor por mil milhas"
                step="0.01"
                value={novoControleMilhas.valorMilheiroRise}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, valorMilheiroRise: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Programa do Banco/Milhas Usado</Label>
              <Input
                placeholder="Ex: Smiles, TudoAzul, LATAM Pass"
                value={novoControleMilhas.programaMilhas}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, programaMilhas: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Informações Adicionais</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Informações extras sobre as milhas..."
                value={novoControleMilhas.informacoesAdicionais}
                onChange={(e) => setNovoControleMilhas({...novoControleMilhas, informacoesAdicionais: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarControleMilhas} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Controle de Milhas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de controles de milhas salvos */}
      {controleMilhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Controles de Milhas Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {controleMilhas.map((ctrl) => (
                <div key={ctrl.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{ctrl.nomeCliente}</h4>
                      <p className="text-sm text-gray-600">Venda: {ctrl.numeroVenda}</p>
                      <p className="text-lg font-semibold text-purple-600">R$ {parseFloat(ctrl.valorVendaCliente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      {ctrl.quantidadeMilhas && <p className="text-sm text-orange-600">{parseInt(ctrl.quantidadeMilhas).toLocaleString('pt-BR')} milhas</p>}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {ctrl.programaMilhas && <p>Programa: {ctrl.programaMilhas}</p>}
                      {ctrl.valorNegociadoMilhas && <p>Valor Milhas: R$ {parseFloat(ctrl.valorNegociadoMilhas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContasSocios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <HandCoins className="mr-2 h-5 w-5 text-orange-600" />
          Contas com Sócios
        </h3>
        <span className="text-sm text-gray-500">{contasSocios.length} registros</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Nova Conta com Sócio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Sócio *</Label>
              <Input
                placeholder="Nome do sócio"
                value={novaContaSocio.nomeSocio}
                onChange={(e) => setNovaContaSocio({...novaContaSocio, nomeSocio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valores Retirados *</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novaContaSocio.valoresRetirados}
                onChange={(e) => setNovaContaSocio({...novaContaSocio, valoresRetirados: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Retirada</Label>
              <Input
                type="date"
                value={novaContaSocio.dataRetirada}
                onChange={(e) => setNovaContaSocio({...novaContaSocio, dataRetirada: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Informações Adicionais</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Detalhes sobre a retirada..."
                value={novaContaSocio.informacoesAdicionais}
                onChange={(e) => setNovaContaSocio({...novaContaSocio, informacoesAdicionais: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarContaSocio} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Conta com Sócio</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contas com sócios salvas */}
      {contasSocios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contas com Sócios Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasSocios.map((conta) => (
                <div key={conta.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{conta.nomeSocio}</h4>
                      <p className="text-lg font-semibold text-orange-600">R$ {parseFloat(conta.valoresRetirados || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      {conta.informacoesAdicionais && <p className="text-sm text-gray-600 mt-1">{conta.informacoesAdicionais}</p>}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {conta.dataRetirada && <p>Data: {new Date(conta.dataRetirada).toLocaleDateString('pt-BR')}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLinksConsolidadoras = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Link className="mr-2 h-5 w-5 text-indigo-600" />
          Links de Consolidadoras/Operadores/Serviços
        </h3>
        <span className="text-sm text-gray-500">{linksConsolidadoras.length} registros</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Novo Link/Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                placeholder="Nome da empresa/serviço"
                value={novoLinkConsolidadora.nomeEmpresa}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, nomeEmpresa: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Contato - Número</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={novoLinkConsolidadora.contatoNumero}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, contatoNumero: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Contato - Email</Label>
              <Input
                type="email"
                placeholder="contato@empresa.com"
                value={novoLinkConsolidadora.contatoEmail}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, contatoEmail: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Login/Usuário</Label>
              <Input
                placeholder="usuário ou email para login"
                value={novoLinkConsolidadora.loginUsuario}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, loginUsuario: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="senha do sistema"
                value={novoLinkConsolidadora.senha}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, senha: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Link do Site/App</Label>
              <Input
                placeholder="https://..."
                value={novoLinkConsolidadora.linkSite}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, linkSite: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Informações Adicionais</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Outras informações sobre o serviço..."
                value={novoLinkConsolidadora.informacoesAdicionais}
                onChange={(e) => setNovoLinkConsolidadora({...novoLinkConsolidadora, informacoesAdicionais: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarLinkConsolidadora} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Link/Serviço</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de links/serviços salvos */}
      {linksConsolidadoras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links/Serviços Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linksConsolidadoras.map((link) => (
                <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{link.nomeEmpresa}</h4>
                      {link.contatoEmail && <p className="text-sm text-gray-600">Email: {link.contatoEmail}</p>}
                      {link.contatoNumero && <p className="text-sm text-gray-600">Tel: {link.contatoNumero}</p>}
                      {link.linkSite && (
                        <a 
                          href={link.linkSite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          🔗 {link.linkSite}
                        </a>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {link.loginUsuario && <p>Login: {link.loginUsuario}</p>}
                      {link.senha && <p>Senha: ••••••••</p>}
                    </div>
                  </div>
                  {link.informacoesAdicionais && (
                    <p className="text-sm text-gray-600 mt-2 border-t pt-2">{link.informacoesAdicionais}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // NOVA SEÇÃO: Render Pagamentos Mensais Fixos
  const renderPagamentosMensais = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-3 h-6 w-6 text-red-600" />
          Pagamentos Mensais Fixos - Contas Rise
        </h2>
        <span className="text-sm text-gray-500">{pagamentosMensais.length} contas cadastradas</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Nova Conta Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Conta *</Label>
              <Input
                placeholder="Ex: Aluguel, Água, Luz, Internet..."
                value={novoPagamentoMensal.tipoConta}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, tipoConta: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                placeholder="Nome da empresa fornecedora"
                value={novoPagamentoMensal.nomeEmpresa}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, nomeEmpresa: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoPagamentoMensal.valor}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, valor: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor de Juros (se houver)</Label>
              <Input
                type="number"
                placeholder="0,00"
                step="0.01"
                value={novoPagamentoMensal.valorJuros}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, valorJuros: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <Input
                type="date"
                value={novoPagamentoMensal.dataPagamento}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, dataPagamento: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Conta Usada para Pagamento</Label>
              <Input
                placeholder="Ex: Itaú, Inter, Mercado Pago..."
                value={novoPagamentoMensal.contaPagamento}
                onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, contaPagamento: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="statusPago"
                  checked={novoPagamentoMensal.statusPago}
                  onChange={(e) => setNovoPagamentoMensal({...novoPagamentoMensal, statusPago: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="statusPago" className="cursor-pointer">
                  ✅ Marcar como pago
                </Label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={adicionarPagamentoMensal} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Conta Mensal</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contas mensais cadastradas */}
      {pagamentosMensais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contas Mensais Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pagamentosMensais.map((pagamento) => (
                <div key={pagamento.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{pagamento.tipoConta}</h4>
                      <p className="text-sm text-gray-600">Empresa: {pagamento.nomeEmpresa}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pagamento.statusPago 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pagamento.statusPago ? '✅ Pago' : '❌ Não Pago'}
                      </span>
                      <Button
                        onClick={() => duplicarPagamentoProximoMes(pagamento)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        📅 Duplicar p/ próximo mês
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Valor:</span>
                      <p className="font-semibold text-blue-600">
                        R$ {parseFloat(pagamento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {pagamento.valorJuros && parseFloat(pagamento.valorJuros) > 0 && (
                      <div>
                        <span className="text-gray-500">Juros:</span>
                        <p className="font-semibold text-red-600">
                          R$ {parseFloat(pagamento.valorJuros).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    
                    {pagamento.dataPagamento && (
                      <div>
                        <span className="text-gray-500">Vencimento:</span>
                        <p className="font-medium">{new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    
                    {pagamento.contaPagamento && (
                      <div>
                        <span className="text-gray-500">Conta:</span>
                        <p className="font-medium">{pagamento.contaPagamento}</p>
                      </div>
                    )}
                  </div>
                  
                  {pagamento.valorJuros && parseFloat(pagamento.valorJuros) > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <span className="text-sm text-gray-700">
                        <strong>Total com juros:</strong> R$ {
                          (parseFloat(pagamento.valor || 0) + parseFloat(pagamento.valorJuros || 0))
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'investimentos':
        return renderInvestimentos();
      case 'pagamentos':
        return renderPagamentosParcelados();
      case 'milhas':
        return renderControleMilhas();
      case 'socios':
        return renderContasSocios();
      case 'links':
        return renderLinksConsolidadoras();
      default:
        return renderInvestimentos();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Building2 className="mr-3 h-7 w-7 text-indigo-600" />
            Controle Interno
          </h2>
          <p className="text-gray-600 mt-2">
            Sistema interno para controle de investimentos, pagamentos e informações da empresa
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection('investimentos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'investimentos'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="inline h-4 w-4 mr-1" />
              Investimento Sócios
            </button>
            
            <button
              onClick={() => setActiveSection('pagamentos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'pagamentos'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="inline h-4 w-4 mr-1" />
              Pagamentos Parcelados
            </button>
            
            <button
              onClick={() => setActiveSection('milhas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'milhas'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Plane className="inline h-4 w-4 mr-1" />
              Controle Milhas
            </button>
            
            <button
              onClick={() => setActiveSection('socios')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'socios'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <HandCoins className="inline h-4 w-4 mr-1" />
              Contas Sócios
            </button>
            
            <button
              onClick={() => setActiveSection('links')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'links'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Link className="inline h-4 w-4 mr-1" />
              Links/Serviços
            </button>
            
            <button
              onClick={() => setActiveSection('pagamentosMensais')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'pagamentosMensais'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-1" />
              Pagamentos Mensais
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default InternalControl;