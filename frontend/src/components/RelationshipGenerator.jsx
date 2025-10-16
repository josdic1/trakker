import React, { useReducer } from 'react';
import { Plus, Trash2, ArrowRight, Code, Database } from 'lucide-react';
import { generateFullSchema } from '../utils/schemaGenerator';

const initialState = {
  step: 1,
  projectName: '',
  entities: [{ name: '', fields: [] }],
  currentEntityIndex: 0,
  relationships: [],
  generatedCode: { models: '', schemas: '' },
};

function reducer(state, action) {
  // This reducer logic remains the same
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };
    case 'ADD_ENTITY':
      return { ...state, entities: [...state.entities, { name: '', fields: [] }] };
    case 'REMOVE_ENTITY':
      if (state.entities.length <= 1) return state;
      return { ...state, entities: state.entities.filter((_, i) => i !== action.payload) };
    case 'UPDATE_ENTITY_NAME':
      return { ...state, entities: state.entities.map((e, i) => i === action.payload.index ? { ...e, name: action.payload.name } : e) };
    case 'SET_CURRENT_ENTITY_INDEX':
        return { ...state, currentEntityIndex: action.payload };
    case 'ADD_FIELD': {
        const newEntities = [...state.entities];
        newEntities[action.payload].fields.push({ name: '', type: 'String' });
        return { ...state, entities: newEntities };
    }
    case 'REMOVE_FIELD': {
        const newEntities = [...state.entities];
        newEntities[action.payload.entityIndex].fields = newEntities[action.payload.entityIndex].fields.filter((_, i) => i !== action.payload.fieldIndex);
        return { ...state, entities: newEntities };
    }
    case 'UPDATE_FIELD': {
        const newEntities = [...state.entities];
        newEntities[action.payload.entityIndex].fields[action.payload.fieldIndex][action.payload.key] = action.payload.value;
        return { ...state, entities: newEntities };
    }
    case 'SET_RELATIONSHIPS':
        return { ...state, relationships: action.payload };
    case 'UPDATE_RELATIONSHIP':
      return { ...state, relationships: state.relationships.map((r, i) => i === action.payload.index ? { ...r, [action.payload.key]: action.payload.value } : r) };
    case 'SET_GENERATED_CODE':
      return { ...state, generatedCode: action.payload };
    case 'RESET':
      return initialState;
    default:
      throw new Error();
  }
}

function FullSchemaGenerator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, projectName, entities, currentEntityIndex, relationships, generatedCode } = state;

  const askRelationships = () => {
    const rels = [];
    const validEntities = entities.filter(e => e.name);
    for (let i = 0; i < validEntities.length; i++) {
      for (let j = i + 1; j < validEntities.length; j++) {
        rels.push({
          entity1: validEntities[i].name,
          entity2: validEntities[j].name,
          entity1HasMany: null,
          entity2HasMany: null
        });
      }
    }
    dispatch({ type: 'SET_RELATIONSHIPS', payload: rels });
    dispatch({ type: 'SET_STEP', payload: 3 });
  };

  const handleGenerateCode = () => {
    const code = generateFullSchema(entities, relationships, projectName);
    dispatch({ type: 'SET_GENERATED_CODE', payload: code });
    dispatch({ type: 'SET_STEP', payload: 4 });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
              <Database className="w-10 h-10 text-indigo-600" />
              Complete Schema Generator
            </h1>
            <p className="text-gray-600">Build your database models and Marshmallow schemas</p>
          </div>

           <div className="flex justify-center mb-8">
             <div className="flex items-center gap-2">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
               <ArrowRight className="w-5 h-5 text-gray-400" />
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
               <ArrowRight className="w-5 h-5 text-gray-400" />
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
               <ArrowRight className="w-5 h-5 text-gray-400" />
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>4</div>
             </div>
           </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Define Your Main Tables</h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                <input type="text" value={projectName} onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })} placeholder="e.g., Music Tracker, Event Manager" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Main Tables (Entities)</label>
                <p className="text-sm text-gray-600 mb-2">What are the main "things" in your app? (e.g., Event, Speaker, Track, Link)</p>
                <p className="text-sm text-indigo-600 font-semibold mb-4">💡 You need at least 2 tables to create relationships</p>
                {entities.map((entity, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input type="text" value={entity.name} onChange={(e) => dispatch({ type: 'UPDATE_ENTITY_NAME', payload: { index, name: e.target.value } })} placeholder="Entity name (e.g., Event, Book)" className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                    {entities.length > 1 && (<button onClick={() => dispatch({ type: 'REMOVE_ENTITY', payload: index })} className="px-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>)}
                  </div>
                ))}
                <button onClick={() => dispatch({ type: 'ADD_ENTITY' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"><Plus className="w-5 h-5" /> Add Another Table</button>
              </div>
              {(!projectName || entities.filter(e => e.name).length < 2) && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-semibold">⚠️ Before you continue:</p>
                  <ul className="list-disc list-inside text-yellow-700 mt-2">
                    {!projectName && <li>Enter a project name</li>}
                    {entities.filter(e => e.name).length < 2 && <li>Add at least 2 tables (you have {entities.filter(e => e.name).length})</li>}
                  </ul>
                </div>
              )}
              <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} disabled={!projectName || entities.filter(e => e.name).length < 2} className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition">Next: Add Fields →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 2: Add Fields to Each Table</h2>
              <div className="flex gap-2 mb-6">
                {entities.filter(e => e.name).map((entity, index) => (<button key={index} onClick={() => dispatch({ type: 'SET_CURRENT_ENTITY_INDEX', payload: index })} className={`px-4 py-2 rounded-lg font-semibold transition ${currentEntityIndex === index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{entity.name}</button>))}
              </div>
              {entities[currentEntityIndex] && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Fields for {entities[currentEntityIndex].name}</h3>
                  <p className="text-sm text-gray-600 mb-4">💡 Don't add id, created_at, or updated_at - those are automatic!</p>
                  {entities[currentEntityIndex].fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex gap-2 mb-3">
                      <input type="text" value={field.name} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', payload: { entityIndex: currentEntityIndex, fieldIndex, key: 'name', value: e.target.value } })} placeholder="Field name (e.g., title, name, bio)" className="flex-1 px-3 py-2 border border-gray-300 rounded" />
                      <select value={field.type} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', payload: { entityIndex: currentEntityIndex, fieldIndex, key: 'type', value: e.target.value } })} className="px-3 py-2 border border-gray-300 rounded">
                        <option value="String">String</option><option value="Integer">Integer</option>
                      </select>
                      <button onClick={() => dispatch({ type: 'REMOVE_FIELD', payload: { entityIndex: currentEntityIndex, fieldIndex } })} className="px-3 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <button onClick={() => dispatch({ type: 'ADD_FIELD', payload: currentEntityIndex })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"><Plus className="w-5 h-5" /> Add Field</button>
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100">← Back</button>
                <button onClick={askRelationships} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Next: Define Relationships →</button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 3: Define Relationships</h2>
              <p className="text-gray-600 mb-6">Answer these simple questions about how your tables connect:</p>
              {relationships.map((rel, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border-2 border-indigo-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">{rel.entity1} ↔ {rel.entity2}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-700 font-semibold mb-3">Can one {rel.entity1} have multiple {pluralize(rel.entity2)}?</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { index, key: 'entity1HasMany', value: false } })} className={`py-3 px-6 rounded-lg font-bold border-2 transition ${rel.entity1HasMany === false ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300 hover:border-gray-400'}`}>❌ No</button>
                        <button onClick={() => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { index, key: 'entity1HasMany', value: true } })} className={`py-3 px-6 rounded-lg font-bold border-2 transition ${rel.entity1HasMany === true ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300 hover:border-gray-400'}`}>✅ Yes</button>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold mb-3">Can one {rel.entity2} have multiple {pluralize(rel.entity1)}?</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { index, key: 'entity2HasMany', value: false } })} className={`py-3 px-6 rounded-lg font-bold border-2 transition ${rel.entity2HasMany === false ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300 hover:border-gray-400'}`}>❌ No</button>
                        <button onClick={() => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { index, key: 'entity2HasMany', value: true } })} className={`py-3 px-6 rounded-lg font-bold border-2 transition ${rel.entity2HasMany === true ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300 hover:border-gray-400'}`}>✅ Yes</button>
                      </div>
                    </div>
                    {rel.entity1HasMany !== null && rel.entity2HasMany !== null && (
                      <div className="bg-white p-3 rounded border-2 border-indigo-300">
                        <p className="font-semibold text-indigo-700">
                          {rel.entity1HasMany && rel.entity2HasMany && '🔗 Many-to-Many (will create bridge table)'}
                          {rel.entity1HasMany && !rel.entity2HasMany && `➡️ One-to-Many (${rel.entity1} has many ${pluralize(rel.entity2)})`}
                          {!rel.entity1HasMany && rel.entity2HasMany && `⬅️ One-to-Many (${rel.entity2} has many ${pluralize(rel.entity1)})`}
                          {!rel.entity1HasMany && !rel.entity2HasMany && '❌ No direct relationship'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-4">
                <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100">← Back</button>
                <button onClick={handleGenerateCode} disabled={relationships.some(r => r.entity1HasMany === null || r.entity2HasMany === null)} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Generate Complete Schema →</button>
              </div>
            </div>
          )}

          {step === 4 && (
             <div>
               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Code className="w-8 h-8 text-green-600" />Your Complete Schema is Ready!</h2>
               <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm mb-6 max-h-96 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 pb-2">
                   <h3 className="text-white font-bold">app/models.py</h3>
                   <button onClick={() => { navigator.clipboard.writeText(generatedCode.models); alert('Models code copied!'); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-xs">📋 Copy Models</button>
                 </div>
                 <pre className="whitespace-pre-wrap leading-relaxed">{generatedCode.models}</pre>
               </div>
               <div className="bg-gray-900 text-blue-400 p-6 rounded-lg font-mono text-sm mb-6 max-h-96 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 pb-2">
                   <h3 className="text-white font-bold">app/schemas.py</h3>
                   <button onClick={() => { navigator.clipboard.writeText(generatedCode.schemas); alert('Schemas code copied!'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-xs">📋 Copy Schemas</button>
                 </div>
                 <pre className="whitespace-pre-wrap leading-relaxed">{generatedCode.schemas}</pre>
               </div>
               <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                 <h3 className="font-bold text-blue-900 mb-2">📝 Next Steps:</h3>
                 <ol className="list-decimal list-inside space-y-1 text-blue-800">
                   <li>Copy the <strong>models</strong> code into your <code className="bg-blue-200 px-2 py-1 rounded">app/models.py</code> file.</li>
                   <li>Copy the <strong>schemas</strong> code into a new <code className="bg-blue-200 px-2 py-1 rounded">app/schemas.py</code> file.</li>
                   <li>Ensure you have a <code className="bg-blue-200 px-2 py-1 rounded">app/extensions.py</code> with Marshmallow initialized (<code className="bg-blue-200 px-2 py-1 rounded">ma = Marshmallow()</code>).</li>
                   <li>Run migrations: <code className="bg-blue-200 px-2 py-1 rounded">flask db migrate</code></li>
                   <li>Apply migrations: <code className="bg-blue-200 px-2 py-1 rounded">flask db upgrade</code></li>
                 </ol>
               </div>
               <button onClick={() => dispatch({ type: 'RESET' })} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Create Another Schema</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default FullSchemaGenerator;