import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Artista, ArtistaRelations} from '../models';

export class ArtistaRepository extends DefaultCrudRepository<
  Artista,
  typeof Artista.prototype.id,
  ArtistaRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Artista, dataSource);
  }
}
