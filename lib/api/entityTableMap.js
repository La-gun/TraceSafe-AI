/** Maps UI entity names (PascalCase) to Postgres / PostgREST table names (snake_case). */
export const ENTITY_TABLE = {
  InspectionReport: 'inspection_reports',
  BatchStatus: 'batch_status',
  ConsumerReport: 'consumer_reports',
  ContactLead: 'contact_leads',
};

export function tableForEntity(entityName) {
  const t = ENTITY_TABLE[entityName];
  if (!t) throw new Error(`Unknown entity: ${entityName}. Add it to lib/api/entityTableMap.js`);
  return t;
}
