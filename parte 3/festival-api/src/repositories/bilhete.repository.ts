import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Bilhete, BilheteRelations} from '../models';

export class BilheteRepository extends DefaultCrudRepository<
  Bilhete,
  typeof Bilhete.prototype.id,
  BilheteRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Bilhete, dataSource);
  }
}
