import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function GenerationProgress({
  parallelTasks,
  integrations,
  onIntegrationComplete,
  onAllComplete,
}) {
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [taskProgress, setTaskProgress] = useState({});
  const [showIntegrations, setShowIntegrations] = useState(false);

  useEffect(() => {
    // Start parallel tasks
    Object.entries(parallelTasks).forEach(([taskId, task]) => {
      runTask(taskId, task);
    });
  }, []);

  const runTask = async (taskId, task) => {
    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: { status: "running", progress: 0 },
    }));

    try {
      await task.handler();
      setCompletedTasks((prev) => new Set([...prev, taskId]));
      setTaskProgress((prev) => ({
        ...prev,
        [taskId]: { status: "completed", progress: 100 },
      }));
    } catch (error) {
      setTaskProgress((prev) => ({
        ...prev,
        [taskId]: { status: "error", error: error.message },
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-12">
        {/* Main Generation Progress */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-medium text-white">
            Building Your Business
          </h2>

          {Object.entries(parallelTasks).map(([taskId, task]) => (
            <div key={taskId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {taskProgress[taskId]?.status === "running" && (
                    <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  )}
                  {taskProgress[taskId]?.status === "completed" && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${taskProgress[taskId]?.progress || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Integrations Section */}
        <div className="border-t border-gray-800 pt-8">
          <h3 className="text-xl font-medium text-white mb-6">
            Optional Integrations
          </h3>
          <div className="grid gap-6">
            {Object.entries(integrations).map(
              ([integrationId, integration]) => (
                <div
                  key={integrationId}
                  className="p-6 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg text-white">
                        {integration.title}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                    <button
                      onClick={() => onIntegrationComplete(integrationId)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Connect
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    You can always set this up later
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Skip/Continue Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onAllComplete}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl text-sm font-medium"
          >
            {completedTasks.size === Object.keys(parallelTasks).length
              ? "Continue to Your Business"
              : "Skip Integrations"}
          </button>
        </div>
      </div>
    </div>
  );
}
