import { generateBusinessName } from "@/lib/ai";
import { generateLogo } from "@/lib/ai";

export async function generateBranding(data, state) {
  // Generate business name
  const names = await generateBusinessName(state.business_idea);

  // Generate logo for the first name
  const logo = await generateLogo(names[0]);

  return {
    name: names[0],
    generated_names: {
      names,
      generated_at: new Date().toISOString(),
    },
    logo_url: logo.imageUrl,
  };
}
