import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Alinhamento, AlinhamentoRelations} from '../models';

export class AlinhamentoRepository extends DefaultCrudRepository<
  Alinhamento,
  typeof Alinhamento.prototype.concertoId,
  AlinhamentoRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Alinhamento, dataSource);
  }
}
