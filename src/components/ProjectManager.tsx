import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Settings, 
  Check, 
  X, 
  FileText, 
  ListPlus,
  HelpCircle,
  Download,
  Upload
} from 'lucide-react';
import { ProjectTemplate, FormField, FieldType } from '../types';

interface ProjectManagerProps {
  templates: ProjectTemplate[];
  onSaveTemplate: (template: ProjectTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Builder Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f_codigo', label: 'Código de Elemento', type: 'text', required: true, placeholder: 'Ej: ELE-101' },
    { id: 'f_estado', label: 'Estado de Conservación', type: 'rating', required: true }
  ]);

  // Open modal to create a new template
  const handleOpenNew = () => {
    setEditingTemplateId(null);
    setName('');
    setCategory('General');
    setDescription('');
    setColor('#10b981');
    setFields([
      { id: 'f_codigo', label: 'Código de Identificación', type: 'text', required: true },
      { id: 'f_observacion', label: 'Observaciones de Campo', type: 'textarea', required: false }
    ]);
    setShowBuilderModal(true);
  };

  // Add field to template builder
  const handleAddField = () => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      label: `Nuevo Campo ${fields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFields([...fields, newField]);
  };

  // Update field in builder
  const handleUpdateField = (index: number, key: keyof FormField, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  // Remove field from builder
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Save template
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const templateToSave: ProjectTemplate = {
      id: editingTemplateId || `proj_${Date.now()}`,
      name,
      category,
      description,
      iconName: 'FolderKanban',
      color,
      fields,
      createdAt: new Date().toISOString()
    };

    onSaveTemplate(templateToSave);
    setShowBuilderModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-5 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif italic text-lg text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#3B82F6]" />
            <span>Survey Templates & Projects</span>
          </h2>
          <p className="text-xs text-[#888888]">
            Customize dynamic form templates for any field data collection
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-md text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-950/40 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-[#1A1A1A] border border-[#333333] hover:border-[#3B82F6]/50 rounded-lg p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: tmpl.color }}
                >
                  {tmpl.category}
                </span>

                <span className="text-[11px] font-mono text-[#888888]">
                  {tmpl.fields.length} Fields
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{tmpl.name}</h3>
              <p className="text-xs text-[#888888] line-clamp-2">{tmpl.description}</p>
            </div>

            {/* Form Fields Preview Pills */}
            <div className="pt-2 border-t border-[#333333]">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
                Configured Fields:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tmpl.fields.map((f) => (
                  <span
                    key={f.id}
                    className="px-2 py-0.5 rounded-md bg-[#0D0D0D] text-[#E5E5E5] text-[11px] border border-[#333333] font-mono"
                  >
                    {f.label} ({f.type})
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#333333]">
              <span className="text-[10px] text-[#888888]">Created: {tmpl.createdAt.split('T')[0]}</span>
              
              <button
                onClick={() => onDeleteTemplate(tmpl.id)}
                disabled={templates.length <= 1}
                className="p-1.5 text-[#888888] hover:text-rose-400 rounded-md hover:bg-rose-950/40 transition-colors disabled:opacity-30 cursor-pointer"
                title="Delete Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Builder to Create/Edit Form Template */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in overflow-y-auto">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 max-w-xl w-full my-auto shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-serif italic text-base text-white">Field Template Builder</h3>
              </div>
              <button
                onClick={() => setShowBuilderModal(false)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Basic Template Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bridge Inspection"
                    className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">
                    Category / Sector
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Civil Works"
                    className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instructions for field surveyors..."
                  className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:ring-1 focus:ring-[#3B82F6] resize-none"
                />
              </div>

              {/* Dynamic Fields List */}
              <div className="space-y-3 pt-2 border-t border-[#333333]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#3B82F6]" />
                    <span>Custom Attributes ({fields.length})</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6] rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 bg-[#0D0D0D] border border-[#333333] rounded-md space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                          placeholder="Field label"
                          className="flex-1 px-2.5 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded text-xs font-semibold text-white"
                        />

                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, 'type', e.target.value as FieldType)}
                          className="px-2.5 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded text-xs text-[#E5E5E5] cursor-pointer"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Options List</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="rating">Star Rating</option>
                          <option value="textarea">Textarea</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          disabled={fields.length <= 1}
                          className="p-1.5 text-[#888888] hover:text-rose-400 rounded disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Select Options input if select type */}
                      {field.type === 'select' && (
                        <div>
                          <input
                            type="text"
                            placeholder="Comma-separated options (e.g. Good, Fair, Poor)"
                            value={field.options ? field.options.join(', ') : ''}
                            onChange={(e) =>
                              handleUpdateField(
                                idx,
                                'options',
                                e.target.value.split(',').map((s) => s.trim())
                              )
                            }
                            className="w-full px-2.5 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-[11px] text-[#E5E5E5]"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#888888] pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                            className="rounded text-[#3B82F6] bg-[#1A1A1A] border-[#333333]"
                          />
                          <span>Required Field</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Modal */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 bg-[#0D0D0D] border border-[#333333] text-[#888888] hover:text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-md text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Template
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
