import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// AQUI ESTÁ A CONFIGURAÇÃO FLEXÍVEL (DOCKER OU LOCAL)
const config = {
  name: 'db',
  connector: 'mysql',
  url: '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'festival_loopback',
};

// AQUI ESTÁ A PARTE DO LOOPBACK QUE TINHA DESAPARECIDO
@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}