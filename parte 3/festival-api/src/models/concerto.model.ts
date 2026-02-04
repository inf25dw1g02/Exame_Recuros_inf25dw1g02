import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Palco} from './palco.model';
import {Artista} from './artista.model';
import {Alinhamento} from './alinhamento.model';

@model()
export class Concerto extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'date',
    required: true,
  })
  data: string;

  @property({
    type: 'number',
  })
  duracao?: number;

  @belongsTo(() => Palco)
  palcoId: number;

  @hasMany(() => Artista, {through: {model: () => Alinhamento}})
  artistas: Artista[];

  constructor(data?: Partial<Concerto>) {
    super(data);
  }
}

export interface ConcertoRelations {
  // describe navigational properties here
}

export type ConcertoWithRelations = Concerto & ConcertoRelations;