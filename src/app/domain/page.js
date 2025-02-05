"use client";

export default function DomainSetup() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Domain & Hosting Setup</h1>
        <p className="text-gray-400">
          Configure your domain name and hosting settings.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Domain Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your desired domain name"
              />
              <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              Recommended Hosting Plans
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {["Basic", "Professional", "Enterprise"].map((plan) => (
                <div
                  key={plan}
                  className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h4 className="font-medium mb-2">{plan}</h4>
                  <p className="text-sm text-gray-400">
                    Automated setup with AI-powered optimization
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
