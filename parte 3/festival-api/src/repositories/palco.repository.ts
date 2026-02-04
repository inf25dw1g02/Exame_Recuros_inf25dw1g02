import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Palco, PalcoRelations, Concerto} from '../models';
import {ConcertoRepository} from './concerto.repository';

export class PalcoRepository extends DefaultCrudRepository<
  Palco,
  typeof Palco.prototype.id,
  PalcoRelations
> {

  public readonly concertos: HasManyRepositoryFactory<Concerto, typeof Palco.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ConcertoRepository') protected concertoRepositoryGetter: Getter<ConcertoRepository>,
  ) {
    super(Palco, dataSource);
    this.concertos = this.createHasManyRepositoryFactoryFor('concertos', concertoRepositoryGetter,);
  }
}
