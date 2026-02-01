import type { OrderDTO } from '@order-flow/shared';
import type { Order } from '@/types/order';

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

export function mapOrder(dto: OrderDTO): Order {
  return {
    id: dto.id,
    nrDocumento: dto.nrDocumento,
    terceiro: dto.terceiro,
    dataEmissao: parseDate(dto.dataEmissao) ?? new Date(0),
    dataPedida: parseDate(dto.dataPedida) ?? new Date(0),
    item: dto.item,
    po: dto.po,
    codArtigo: dto.codArtigo,
    referencia: dto.referencia,
    cor: dto.cor,
    descricaoCor: dto.descricaoCor,
    tam: dto.tam,
    familia: dto.familia,
    descricaoTam: dto.descricaoTam,
    ean: dto.ean,
    qtdPedida: dto.qtdPedida,
    dataTec: parseDate(dto.dataTec),
    felpoCru: dto.felpoCru,
    dataFelpoCru: parseDate(dto.dataFelpoCru),
    tinturaria: dto.tinturaria,
    dataTint: parseDate(dto.dataTint),
    confeccaoRoupoes: dto.confeccaoRoupoes,
    confeccaoFelpos: dto.confeccaoFelpos,
    dataConf: parseDate(dto.dataConf),
    embAcab: dto.embAcab,
    dataArmExp: parseDate(dto.dataArmExp),
    stockCx: dto.stockCx,
    dataEnt: parseDate(dto.dataEnt),
    dataEspecial: parseDate(dto.dataEspecial),
    dataPrinter: parseDate(dto.dataPrinter),
    dataDebuxo: parseDate(dto.dataDebuxo),
    dataAmostras: parseDate(dto.dataAmostras),
    dataBordados: parseDate(dto.dataBordados),
    facturada: dto.facturada,
    emAberto: dto.emAberto
  };
}
