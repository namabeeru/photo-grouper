'use client';

import React from 'react';
import { CollageTemplate } from '@/utils/templates';

interface TemplateStripProps {
    templates: CollageTemplate[];
    selectedId: string;
    onSelect: (template: CollageTemplate) => void;
}

export default function TemplateStrip({ templates, selectedId, onSelect }: TemplateStripProps) {
    return (
        <div className="w-full overflow-x-auto py-4 px-2">
            <div className="flex gap-3 min-w-max px-2">
                {templates.map((template) => {
                    const isSelected = template.id === selectedId;
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={`
                relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200
                ${isSelected
                                    ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                                }
              `}
                        >
                            {/* Template preview using CSS grid simulation */}
                            <div className="absolute inset-1 bg-slate-100 rounded-lg">
                                {template.slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="absolute bg-slate-300 rounded-sm"
                                        style={{
                                            left: `${slot.x}%`,
                                            top: `${slot.y}%`,
                                            width: `${slot.width - 2}%`,
                                            height: `${slot.height - 2}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
