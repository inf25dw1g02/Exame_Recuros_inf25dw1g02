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
import {Palco} from '../models';
import {PalcoRepository} from '../repositories';

export class PalcoController {
  constructor(
    @repository(PalcoRepository)
    public palcoRepository : PalcoRepository,
  ) {}

  @post('/palcos')
  @response(200, {
    description: 'Palco model instance',
    content: {'application/json': {schema: getModelSchemaRef(Palco)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Palco, {
            title: 'NewPalco',
            exclude: ['id'],
          }),
        },
      },
    })
    palco: Omit<Palco, 'id'>,
  ): Promise<Palco> {
    return this.palcoRepository.create(palco);
  }

  @get('/palcos/count')
  @response(200, {
    description: 'Palco model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Palco) where?: Where<Palco>,
  ): Promise<Count> {
    return this.palcoRepository.count(where);
  }

  @get('/palcos')
  @response(200, {
    description: 'Array of Palco model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Palco, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Palco) filter?: Filter<Palco>,
  ): Promise<Palco[]> {
    return this.palcoRepository.find(filter);
  }

  @patch('/palcos')
  @response(200, {
    description: 'Palco PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Palco, {partial: true}),
        },
      },
    })
    palco: Palco,
    @param.where(Palco) where?: Where<Palco>,
  ): Promise<Count> {
    return this.palcoRepository.updateAll(palco, where);
  }

  @get('/palcos/{id}')
  @response(200, {
    description: 'Palco model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Palco, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Palco, {exclude: 'where'}) filter?: FilterExcludingWhere<Palco>
  ): Promise<Palco> {
    return this.palcoRepository.findById(id, filter);
  }

  @patch('/palcos/{id}')
  @response(204, {
    description: 'Palco PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Palco, {partial: true}),
        },
      },
    })
    palco: Palco,
  ): Promise<void> {
    await this.palcoRepository.updateById(id, palco);
  }

  @put('/palcos/{id}')
  @response(204, {
    description: 'Palco PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() palco: Palco,
  ): Promise<void> {
    await this.palcoRepository.replaceById(id, palco);
  }

  @del('/palcos/{id}')
  @response(204, {
    description: 'Palco DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.palcoRepository.deleteById(id);
  }
}
