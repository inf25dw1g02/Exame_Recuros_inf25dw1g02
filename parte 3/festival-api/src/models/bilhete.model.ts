import {Entity, model, property} from '@loopback/repository';

@model()
export class Bilhete extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  tipo: string;

  @property({
    type: 'number',
    required: true,
  })
  preco: number;

  @property({
    type: 'boolean',
    default: false,
  })
  vendido?: boolean;

  constructor(data?: Partial<Bilhete>) {
    super(data);
  }
}

export interface BilheteRelations {
  // describe navigational properties here
}

export type BilheteWithRelations = Bilhete & BilheteRelations;