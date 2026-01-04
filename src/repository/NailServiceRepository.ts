import { INailServiceData, NailService } from '@/entity/NailService'
import { PgCrudRepository, singleton } from '@wabot-dev/framework'
import { Pool } from 'pg'


export function getDummyNailServices(): NailService[] {
  const servicesData: INailServiceData[] = [
    { id: '1', name: 'Uñas Acrílicas 💅', durationMinutes: 90, price: 35, isActive: true },
    { id: '2', name: 'Uñas Press on 💖', durationMinutes: 60, price: 25, isActive: true },
    { id: '3', name: 'Manicure tradicional', durationMinutes: 45, price: 15, isActive: true },
    { id: '4', name: 'Manicure Semipermanente ✨', durationMinutes: 60, price: 25, isActive: true },
    { id: '5', name: 'Pedicure tradicional', durationMinutes: 50, price: 20, isActive: true },
    { id: '6', name: 'Pedicure Semipermanente', durationMinutes: 70, price: 30, isActive: true },
    { id: '7', name: 'Corte', durationMinutes: 30, price: 10, isActive: true },
    { id: '8', name: 'Blower', durationMinutes: 25, price: 12, isActive: true },
    { id: '9', name: 'Mechas', durationMinutes: 120, price: 50, isActive: true },
    { id: '10', name: 'Keratina', durationMinutes: 90, price: 45, isActive: true },
    { id: '11', name: 'Tinturación', durationMinutes: 60, price: 30, isActive: true },
    { id: '12', name: 'Repolarización', durationMinutes: 75, price: 40, isActive: true },
    { id: '13', name: 'Cejas semipermanentes', durationMinutes: 40, price: 20, isActive: true },
    { id: '14', name: 'Pestañas punto a punto', durationMinutes: 90, price: 50, isActive: true },
    { id: '15', name: 'Depilación', durationMinutes: 30, price: 15, isActive: true },
    { id: '16', name: 'Combo 💖', durationMinutes: 120, price: 60, isActive: true },
  ]

  return servicesData.map(data => new NailService(data))
}


@singleton()
export class NailServiceRepository extends PgCrudRepository<NailService> {
  constructor(pool: Pool) {
    super(pool, {
      schema: 'edglam',
      table: 'nail_service',
      constructor: NailService,
    })
  }

  async findActive(): Promise<NailService[]> {
    // const query = `
    //   SELECT ${this.columns}
    //   FROM ${this.table}
    //   WHERE data @> $1::jsonb
    // `
    // return this.query(query, [JSON.stringify({ isActive: true })])
    return getDummyNailServices()
  }
}
