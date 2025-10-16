// src/utils/schemaGenerator.js

const toSnakeCase = (str) => {
  if (!str) return '';
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
};

const pluralize = (word) => {
    if (!word) return '';
    if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word.slice(-2, -1).toLowerCase())) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }
    return word + 's';
};

function processRelationships(entities, relationships) {
    const entityRelationships = {};
    entities.forEach(e => { if (e.name) entityRelationships[e.name] = []; });

    relationships.forEach(rel => {
        const { entity1, entity2, entity1HasMany, entity2HasMany } = rel;
        const e1Snake = toSnakeCase(entity1);
        const e2Snake = toSnakeCase(entity2);
        const e1PluralSnake = toSnakeCase(pluralize(entity1));
        const e2PluralSnake = toSnakeCase(pluralize(entity2));

        if (entity1HasMany && entity2HasMany) { // Many-to-Many
            entityRelationships[entity1].push({ type: 'many-to-many', target: entity2, backPopulates: e1PluralSnake });
            entityRelationships[entity2].push({ type: 'many-to-many', target: entity1, backPopulates: e2PluralSnake });
        } else if (entity1HasMany && !entity2HasMany) { // One-to-Many from e1 to e2
            entityRelationships[entity1].push({ type: 'one-to-many', target: entity2, backPopulates: e1Snake });
            entityRelationships[entity2].push({ type: 'many-to-one', target: entity1, backPopulates: e2PluralSnake });
        } else if (!entity1HasMany && entity2HasMany) { // One-to-Many from e2 to e1
            entityRelationships[entity2].push({ type: 'one-to-many', target: entity1, backPopulates: e2Snake });
            entityRelationships[entity1].push({ type: 'many-to-one', target: entity2, backPopulates: e1PluralSnake });
        }
    });
    return entityRelationships;
}

function generateModelsCode(entities, entityRelationships, projectName) {
    let code = `# Generated Models for ${projectName}\n\n`;
    code += `from app.extensions import db\n`;
    code += `from datetime import datetime, timezone\n\n`;
    
    const bridgeTables = new Set();
    Object.values(entityRelationships).flat().filter(r => r.type === 'many-to-many').forEach(r => {
        const entityName = entities.find(e => entityRelationships[e.name].some(rel => rel === r)).name;
        const sortedEntities = [r.target, entityName].sort();
        const bridgeName = `${toSnakeCase(sortedEntities[0])}_${toSnakeCase(pluralize(sortedEntities[1]))}`;

        if (!bridgeTables.has(bridgeName)) {
            bridgeTables.add(bridgeName);
            code += `${bridgeName} = db.Table('${bridgeName}',\n`;
            code += `    db.Column('${toSnakeCase(sortedEntities[0])}_id', db.Integer, db.ForeignKey('${toSnakeCase(pluralize(sortedEntities[0]))}.id'), primary_key=True),\n`;
            code += `    db.Column('${toSnakeCase(sortedEntities[1])}_id', db.Integer, db.ForeignKey('${toSnakeCase(pluralize(sortedEntities[1]))}.id'), primary_key=True)\n)\n\n`;
        }
    });

    entities.forEach(entity => {
        if (!entity.name) return;
        const rels = entityRelationships[entity.name] || [];
        code += `class ${entity.name}(db.Model):\n`;
        code += `    __tablename__ = '${toSnakeCase(pluralize(entity.name))}'\n\n`;
        code += `    id = db.Column(db.Integer, primary_key=True)\n`;
        
        entity.fields.forEach(field => {
            if (field.name) {
                const dbType = field.type === 'String' ? 'db.String(255)' : 'db.Integer';
                let columnArgs = `nullable=False`;
                if (field.name.toLowerCase() === 'name') {
                    columnArgs += `, unique=True`;
                }
                code += `    ${toSnakeCase(field.name)} = db.Column(${dbType}, ${columnArgs})\n`;
            }
        });

        rels.filter(r => r.type === 'many-to-one').forEach(rel => {
            code += `    ${toSnakeCase(rel.target)}_id = db.Column(db.Integer, db.ForeignKey('${toSnakeCase(pluralize(rel.target))}.id'), nullable=False)\n`;
        });
        
        code += `    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))\n`;
        code += `    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))\n\n`;

        if (rels.length > 0) {
            code += `    # --- Relationships ---\n`;
            rels.forEach(rel => {
                const relName = rel.type === 'many-to-one' ? toSnakeCase(rel.target) : toSnakeCase(pluralize(rel.target));
                code += `    ${relName} = db.relationship('${rel.target}', back_populates='${rel.backPopulates}'`;
                if (rel.type === 'one-to-many') code += `, cascade='all, delete-orphan'`;
                if (rel.type === 'many-to-many') {
                    const sortedEntities = [rel.target, entity.name].sort();
                    const bridgeName = `${toSnakeCase(sortedEntities[0])}_${toSnakeCase(pluralize(sortedEntities[1]))}`;
                    code += `, secondary=${bridgeName}`;
                }
                code += `)\n`;
            });
        }
        
        const hasNameField = entity.fields.some(f => f.name.toLowerCase() === 'name');
        code += `\n    def __repr__(self):\n`;
        code += `        return f'<${entity.name} {self.${hasNameField ? 'name' : 'id'}}>'`;
        code += `\n\n\n`;
    });
    return code;
}

function generateSchemasCode(entities, entityRelationships, projectName) {
    let code = `# Generated Schemas for ${projectName}\n\n`;
    code += `from app.extensions import ma\n`;
    code += `from app.models import ${entities.map(e => e.name).filter(Boolean).join(', ')}\n\n`;

    entities.forEach(entity => {
        if (!entity.name) return;
        const rels = entityRelationships[entity.name] || [];
        code += `class ${entity.name}Schema(ma.SQLAlchemyAutoSchema):\n`;
        if (rels.length > 0) code += `    # Nested Relationships\n`;
        
        rels.forEach(rel => {
            const relName = rel.type === 'many-to-one' ? toSnakeCase(rel.target) : toSnakeCase(pluralize(rel.target));
            const isMany = rel.type !== 'many-to-one' ? 'True' : 'False';
            code += `    ${relName} = ma.Nested('${rel.target}Schema', many=${isMany}, exclude=('${rel.backPopulates}',))\n`;
        });

        code += `\n    class Meta:\n`;
        code += `        model = ${entity.name}\n`;
        code += `        load_instance = True\n`;
        code += `        include_fk = True\n`;
        code += `        include_relationships = True\n\n`;
    });

    code += `# Create ready-to-use instances of your schemas\n`;
    entities.forEach(entity => {
        if (entity.name) {
            code += `${toSnakeCase(entity.name)}_schema = ${entity.name}Schema()\n`;
            code += `${toSnakeCase(pluralize(entity.name))}_schema = ${entity.name}Schema(many=True)\n`;
        }
    });
    return code;
}

export function generateFullSchema(entities, relationships, projectName) {
    const entityRelationships = processRelationships(entities, relationships);
    const models = generateModelsCode(entities, entityRelationships, projectName);
    const schemas = generateSchemasCode(entities, entityRelationships, projectName);
    return { models, schemas };
}