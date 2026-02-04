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
import {Bilhete} from '../models';
import {BilheteRepository} from '../repositories';

export class BilheteController {
  constructor(
    @repository(BilheteRepository)
    public bilheteRepository : BilheteRepository,
  ) {}

  @post('/bilhetes')
  @response(200, {
    description: 'Bilhete model instance',
    content: {'application/json': {schema: getModelSchemaRef(Bilhete)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bilhete, {
            title: 'NewBilhete',
            exclude: ['id'],
          }),
        },
      },
    })
    bilhete: Omit<Bilhete, 'id'>,
  ): Promise<Bilhete> {
    return this.bilheteRepository.create(bilhete);
  }

  @get('/bilhetes/count')
  @response(200, {
    description: 'Bilhete model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Bilhete) where?: Where<Bilhete>,
  ): Promise<Count> {
    return this.bilheteRepository.count(where);
  }

  @get('/bilhetes')
  @response(200, {
    description: 'Array of Bilhete model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Bilhete, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Bilhete) filter?: Filter<Bilhete>,
  ): Promise<Bilhete[]> {
    return this.bilheteRepository.find(filter);
  }

  @patch('/bilhetes')
  @response(200, {
    description: 'Bilhete PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bilhete, {partial: true}),
        },
      },
    })
    bilhete: Bilhete,
    @param.where(Bilhete) where?: Where<Bilhete>,
  ): Promise<Count> {
    return this.bilheteRepository.updateAll(bilhete, where);
  }

  @get('/bilhetes/{id}')
  @response(200, {
    description: 'Bilhete model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Bilhete, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Bilhete, {exclude: 'where'}) filter?: FilterExcludingWhere<Bilhete>
  ): Promise<Bilhete> {
    return this.bilheteRepository.findById(id, filter);
  }

  @patch('/bilhetes/{id}')
  @response(204, {
    description: 'Bilhete PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bilhete, {partial: true}),
        },
      },
    })
    bilhete: Bilhete,
  ): Promise<void> {
    await this.bilheteRepository.updateById(id, bilhete);
  }

  @put('/bilhetes/{id}')
  @response(204, {
    description: 'Bilhete PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bilhete: Bilhete,
  ): Promise<void> {
    await this.bilheteRepository.replaceById(id, bilhete);
  }

  @del('/bilhetes/{id}')
  @response(204, {
    description: 'Bilhete DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bilheteRepository.deleteById(id);
  }
}
