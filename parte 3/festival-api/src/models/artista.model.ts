import {Entity, model, property} from '@loopback/repository';

@model()
export class Artista extends Entity {
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
    type: 'string',
  })
  genero?: string;

  @property({
    type: 'number',
  })
  cachet?: number;

  constructor(data?: Partial<Artista>) {
    super(data);
  }
}

export interface ArtistaRelations {
  // describe navigational properties here
}

export type ArtistaWithRelations = Artista & ArtistaRelations;