import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
  import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
Concerto,
Alinhamento,
Artista,
} from '../models';
import {ConcertoRepository} from '../repositories';

export class ConcertoArtistaController {
  constructor(
    @repository(ConcertoRepository) protected concertoRepository: ConcertoRepository,
  ) { }

  @get('/concertos/{id}/artistas', {
    responses: {
      '200': {
        description: 'Array of Concerto has many Artista through Alinhamento',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Artista)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Artista>,
  ): Promise<Artista[]> {
    return this.concertoRepository.artistas(id).find(filter);
  }

  @post('/concertos/{id}/artistas', {
    responses: {
      '200': {
        description: 'create a Artista model instance',
        content: {'application/json': {schema: getModelSchemaRef(Artista)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Concerto.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artista, {
            title: 'NewArtistaInConcerto',
            exclude: ['id'],
          }),
        },
      },
    }) artista: Omit<Artista, 'id'>,
  ): Promise<Artista> {
    return this.concertoRepository.artistas(id).create(artista);
  }

  @patch('/concertos/{id}/artistas', {
    responses: {
      '200': {
        description: 'Concerto.Artista PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artista, {partial: true}),
        },
      },
    })
    artista: Partial<Artista>,
    @param.query.object('where', getWhereSchemaFor(Artista)) where?: Where<Artista>,
  ): Promise<Count> {
    return this.concertoRepository.artistas(id).patch(artista, where);
  }

  @del('/concertos/{id}/artistas', {
    responses: {
      '200': {
        description: 'Concerto.Artista DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Artista)) where?: Where<Artista>,
  ): Promise<Count> {
    return this.concertoRepository.artistas(id).delete(where);
  }
}
