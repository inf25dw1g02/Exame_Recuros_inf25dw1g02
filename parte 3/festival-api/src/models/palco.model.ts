import {Entity, model, property, hasMany} from '@loopback/repository';
import {Concerto} from './concerto.model';

@model()
export class Palco extends Entity {
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
  nome: string;

  @property({
    type: 'number',
    required: true,
  })
  capacidade: number;

  @hasMany(() => Concerto)
  concertos: Concerto[];

  constructor(data?: Partial<Palco>) {
    super(data);
  }
}

export interface PalcoRelations {
  // describe navigational properties here
}

export type PalcoWithRelations = Palco & PalcoRelations;