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
import {Artista} from '../models';
import {ArtistaRepository} from '../repositories';

export class ArtistaController {
  constructor(
    @repository(ArtistaRepository)
    public artistaRepository : ArtistaRepository,
  ) {}

  @post('/artistas')
  @response(200, {
    description: 'Artista model instance',
    content: {'application/json': {schema: getModelSchemaRef(Artista)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artista, {
            title: 'NewArtista',
            exclude: ['id'],
          }),
        },
      },
    })
    artista: Omit<Artista, 'id'>,
  ): Promise<Artista> {
    return this.artistaRepository.create(artista);
  }

  @get('/artistas/count')
  @response(200, {
    description: 'Artista model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Artista) where?: Where<Artista>,
  ): Promise<Count> {
    return this.artistaRepository.count(where);
  }

  @get('/artistas')
  @response(200, {
    description: 'Array of Artista model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Artista, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Artista) filter?: Filter<Artista>,
  ): Promise<Artista[]> {
    return this.artistaRepository.find(filter);
  }

  @patch('/artistas')
  @response(200, {
    description: 'Artista PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artista, {partial: true}),
        },
      },
    })
    artista: Artista,
    @param.where(Artista) where?: Where<Artista>,
  ): Promise<Count> {
    return this.artistaRepository.updateAll(artista, where);
  }

  @get('/artistas/{id}')
  @response(200, {
    description: 'Artista model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Artista, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Artista, {exclude: 'where'}) filter?: FilterExcludingWhere<Artista>
  ): Promise<Artista> {
    return this.artistaRepository.findById(id, filter);
  }

  @patch('/artistas/{id}')
  @response(204, {
    description: 'Artista PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artista, {partial: true}),
        },
      },
    })
    artista: Artista,
  ): Promise<void> {
    await this.artistaRepository.updateById(id, artista);
  }

  @put('/artistas/{id}')
  @response(204, {
    description: 'Artista PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() artista: Artista,
  ): Promise<void> {
    await this.artistaRepository.replaceById(id, artista);
  }

  @del('/artistas/{id}')
  @response(204, {
    description: 'Artista DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.artistaRepository.deleteById(id);
  }
}
