import {Entity, model, property} from '@loopback/repository';

@model()
export class Alinhamento extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  concertoId: number;

  @property({
    type: 'number',
    required: true,
  })
  artistaId: number;

  constructor(data?: Partial<Alinhamento>) {
    super(data);
  }
}

export interface AlinhamentoRelations {
  // describe navigational properties here
}

export type AlinhamentoWithRelations = Alinhamento & AlinhamentoRelations;