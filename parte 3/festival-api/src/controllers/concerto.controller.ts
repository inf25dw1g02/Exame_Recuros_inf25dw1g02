import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Concerto} from '../models';
import {ConcertoRepository} from '../repositories';

export class ConcertoController {
  constructor(
    @repository(ConcertoRepository)
    public concertoRepository : ConcertoRepository,
  ) {}

  @post('/concertos')
  @response(200, {
    description: 'Concerto model instance',
    content: {'application/json': {schema: getModelSchemaRef(Concerto)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Concerto, {
            title: 'NewConcerto',
            exclude: ['id'],
          }),
        },
      },
    })
    concerto: Omit<Concerto, 'id'>,
  ): Promise<Concerto> {
    return this.concertoRepository.create(concerto);
  }

  @get('/concertos/count')
  @response(200, {
    description: 'Concerto model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Concerto) where?: Where<Concerto>,
  ): Promise<Count> {
    return this.concertoRepository.count(where);
  }

  @get('/concertos')
  @response(200, {
    description: 'Array of Concerto model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Concerto, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Concerto) filter?: Filter<Concerto>,
  ): Promise<Concerto[]> {
    return this.concertoRepository.find(filter);
  }

  @patch('/concertos')
  @response(200, {
    description: 'Concerto PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Concerto, {partial: true}),
        },
      },
    })
    concerto: Concerto,
    @param.where(Concerto) where?: Where<Concerto>,
  ): Promise<Count> {
    return this.concertoRepository.updateAll(concerto, where);
  }

  @get('/concertos/{id}')
  @response(200, {
    description: 'Concerto model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Concerto, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Concerto, {exclude: 'where'}) filter?: FilterExcludingWhere<Concerto>
  ): Promise<Concerto> {
    return this.concertoRepository.findById(id, filter);
  }

  @patch('/concertos/{id}')
  @response(204, {
    description: 'Concerto PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Concerto, {partial: true}),
        },
      },
    })
    concerto: Concerto,
  ): Promise<void> {
    await this.concertoRepository.updateById(id, concerto);
  }

  @put('/concertos/{id}')
  @response(204, {
    description: 'Concerto PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() concerto: Concerto,
  ): Promise<void> {
    await this.concertoRepository.replaceById(id, concerto);
  }

  @del('/concertos/{id}')
  @response(204, {
    description: 'Concerto DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.concertoRepository.deleteById(id);
  }
}
