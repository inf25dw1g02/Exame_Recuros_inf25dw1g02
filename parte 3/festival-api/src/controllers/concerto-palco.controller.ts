import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Concerto,
  Palco,
} from '../models';
import {ConcertoRepository} from '../repositories';

export class ConcertoPalcoController {
  constructor(
    @repository(ConcertoRepository)
    public concertoRepository: ConcertoRepository,
  ) { }

  @get('/concertos/{id}/palco', {
    responses: {
      '200': {
        description: 'Palco belonging to Concerto',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Palco),
          },
        },
      },
    },
  })
  async getPalco(
    @param.path.number('id') id: typeof Concerto.prototype.id,
  ): Promise<Palco> {
    return this.concertoRepository.palco(id);
  }
}
