"use client";

import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiMove } from "react-icons/fi";
import { SECTION_TYPES, sectionTemplates } from "@/lib/pageBuilder";

export function SectionManager({
  sections,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
}) {
  return (
    <div className="fixed right-6 top-24 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium">Page Sections</h3>
      </div>

      {/* Section List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <FiMove className="text-gray-400 cursor-move" />
            <div className="flex-1">
              <p className="text-sm font-medium">{section.type}</p>
              <p className="text-xs text-gray-500">{section.content.title}</p>
            </div>
            <button
              onClick={() => onUpdateSection(section.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiEdit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => onDeleteSection(section.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiTrash2 className="w-4 h-4 text-gray-500" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Section Button */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(SECTION_TYPES).map((type) => (
            <button
              key={type}
              onClick={() => onAddSection(SECTION_TYPES[type])}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FiPlus className="w-3 h-3" />
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
