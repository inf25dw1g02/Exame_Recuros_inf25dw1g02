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
  Palco,
  Concerto,
} from '../models';
import {PalcoRepository} from '../repositories';

export class PalcoConcertoController {
  constructor(
    @repository(PalcoRepository) protected palcoRepository: PalcoRepository,
  ) { }

  @get('/palcos/{id}/concertos', {
    responses: {
      '200': {
        description: 'Array of Palco has many Concerto',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Concerto)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Concerto>,
  ): Promise<Concerto[]> {
    return this.palcoRepository.concertos(id).find(filter);
  }

  @post('/palcos/{id}/concertos', {
    responses: {
      '200': {
        description: 'Palco model instance',
        content: {'application/json': {schema: getModelSchemaRef(Concerto)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Palco.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Concerto, {
            title: 'NewConcertoInPalco',
            exclude: ['id'],
            optional: ['palcoId']
          }),
        },
      },
    }) concerto: Omit<Concerto, 'id'>,
  ): Promise<Concerto> {
    return this.palcoRepository.concertos(id).create(concerto);
  }

  @patch('/palcos/{id}/concertos', {
    responses: {
      '200': {
        description: 'Palco.Concerto PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Concerto, {partial: true}),
        },
      },
    })
    concerto: Partial<Concerto>,
    @param.query.object('where', getWhereSchemaFor(Concerto)) where?: Where<Concerto>,
  ): Promise<Count> {
    return this.palcoRepository.concertos(id).patch(concerto, where);
  }

  @del('/palcos/{id}/concertos', {
    responses: {
      '200': {
        description: 'Palco.Concerto DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Concerto)) where?: Where<Concerto>,
  ): Promise<Count> {
    return this.palcoRepository.concertos(id).delete(where);
  }
}
