import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Concerto, ConcertoRelations, Palco, Artista, Alinhamento} from '../models';
import {PalcoRepository} from './palco.repository';
import {AlinhamentoRepository} from './alinhamento.repository';
import {ArtistaRepository} from './artista.repository';

export class ConcertoRepository extends DefaultCrudRepository<
  Concerto,
  typeof Concerto.prototype.id,
  ConcertoRelations
> {

  public readonly palco: BelongsToAccessor<Palco, typeof Concerto.prototype.id>;

  public readonly artistas: HasManyThroughRepositoryFactory<Artista, typeof Artista.prototype.id,
          Alinhamento,
          typeof Concerto.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('PalcoRepository') protected palcoRepositoryGetter: Getter<PalcoRepository>, @repository.getter('AlinhamentoRepository') protected alinhamentoRepositoryGetter: Getter<AlinhamentoRepository>, @repository.getter('ArtistaRepository') protected artistaRepositoryGetter: Getter<ArtistaRepository>,
  ) {
    super(Concerto, dataSource);
    this.artistas = this.createHasManyThroughRepositoryFactoryFor('artistas', artistaRepositoryGetter, alinhamentoRepositoryGetter,);
    this.palco = this.createBelongsToAccessorFor('palco', palcoRepositoryGetter,);
  }
}
