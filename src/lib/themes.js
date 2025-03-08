export const landingThemes = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    audience: "SaaS & Enterprise",
    colors: {
      // Base colors
      background: "bg-[#F9FAFB]",
      surface: "bg-[#FFFFFF]",
      border: "border-[#E5E7EB]",

      // Text colors
      text: {
        primary: "text-[#111827]",
        secondary: "text-[#4B5563]",
        muted: "text-[#6B7280]",
        accent: "text-[#2563EB]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-[#2563EB] text-[#FFFFFF]",
          hover: "hover:bg-[#1D4ED8]",
        },
        secondary: {
          base: "bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB]",
          hover: "hover:bg-[#F9FAFB]",
        },
      },

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },

      // Component styles
      card: {
        base: "bg-[#FFFFFF] border border-[#E5E7EB]",
        hover: "hover:shadow-lg hover:border-[#BFDBFE]",
      },

      // Section styles
      section: {
        primary: "bg-[#2563EB]",
        secondary: "bg-[#F3F4F6]",
      },

      // Special elements
      highlight: "bg-[#EFF6FF]",
      overlay: "bg-[#000000]/50",
      divider: "border-[#E5E7EB]",
    },
  },
  {
    id: "pitch-dark",
    name: "Pitch Dark",
    audience: "Modern Tech",
    colors: {
      // Base colors
      background: "bg-black",
      surface: "bg-zinc-900",
      border: "border-zinc-800",

      // Text colors
      text: {
        primary: "text-white",
        secondary: "text-zinc-300",
        muted: "text-zinc-400",
        accent: "text-cyan-400",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-cyan-500 text-black",
          hover: "hover:bg-cyan-400",
        },
        secondary: {
          base: "bg-zinc-800 text-white border border-zinc-700",
          hover: "hover:bg-zinc-700",
        },
      },

      // Component styles
      card: {
        base: "bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/50",
        hover: "hover:shadow-xl hover:shadow-cyan-500/10",
      },

      // Section styles
      section: {
        primary: "bg-cyan-500",
        secondary: "bg-zinc-800",
      },

      // Special elements
      highlight: "bg-cyan-500/10",
      overlay: "bg-black/50",
      divider: "border-zinc-800",

      input: {
        base: "bg-zinc-900/50 text-white border border-zinc-800",
        hover: "hover:border-zinc-700",
        focus: "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50",
        placeholder: "placeholder-zinc-500",
        text: "text-white",
        disabled:
          "disabled:bg-zinc-900/30 disabled:text-zinc-500 disabled:border-zinc-800",
      },
    },
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    audience: "Creative & Modern",
    colors: {
      // Base colors
      background: "bg-orange-50",
      surface: "bg-white",
      border: "border-orange-100",

      // Text colors
      text: {
        primary: "text-orange-900",
        secondary: "text-orange-700",
        muted: "text-gray-500",
        accent: "text-orange-500",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
          hover: "hover:from-orange-600 hover:to-pink-600",
        },
        secondary: {
          base: "bg-white text-orange-700 border border-orange-200",
          hover: "hover:bg-orange-50",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-orange-100",
        hover:
          "hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-orange-500 to-pink-500",
        secondary: "bg-orange-100",
      },

      // Special elements
      highlight: "bg-orange-100",
      overlay: "bg-black/50",
      divider: "border-orange-100",

      input: {
        base: "bg-white/90 text-orange-900 border border-orange-200",
        hover: "hover:border-orange-300",
        focus: "focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50",
        placeholder: "placeholder-orange-300",
        text: "text-orange-900",
        disabled:
          "disabled:bg-orange-50 disabled:text-orange-300 disabled:border-orange-100",
      },
    },
  },
  {
    id: "forest-fresh",
    name: "Forest Fresh",
    audience: "Eco & Wellness",
    colors: {
      // Base colors
      background: "bg-emerald-50",
      surface: "bg-white",
      border: "border-emerald-100",

      // Text colors
      text: {
        primary: "text-emerald-900",
        secondary: "text-emerald-700",
        muted: "text-gray-500",
        accent: "text-emerald-600",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-emerald-600 text-white",
          hover: "hover:bg-emerald-700",
        },
        secondary: {
          base: "bg-white text-emerald-700 border border-emerald-200",
          hover: "hover:bg-emerald-50",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-emerald-100",
        hover:
          "hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200",
      },

      // Section styles
      section: {
        primary: "bg-emerald-600",
        secondary: "bg-emerald-100",
      },

      // Special elements
      highlight: "bg-emerald-100",
      overlay: "bg-black/50",
      divider: "border-emerald-100",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "electric-violet",
    name: "Electric Violet",
    audience: "Tech & Gaming",
    colors: {
      // Base colors
      background: "bg-gray-900",
      surface: "bg-gray-800",
      border: "border-gray-700",

      // Text colors
      text: {
        primary: "text-white",
        secondary: "text-gray-300",
        muted: "text-gray-400",
        accent: "text-violet-400",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-violet-500 text-white shadow-lg shadow-violet-500/20",
          hover: "hover:bg-violet-600",
        },
        secondary: {
          base: "bg-gray-800 text-violet-300 border border-violet-500/20",
          hover: "hover:bg-gray-700",
        },
      },

      // Component styles
      card: {
        base: "bg-gray-800 border border-gray-700",
        hover:
          "hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-500/20",
      },

      // Section styles
      section: {
        primary: "bg-violet-500",
        secondary: "bg-gray-800",
      },

      // Special elements
      highlight: "bg-violet-500/10",
      overlay: "bg-black/50",
      divider: "border-gray-700",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "coral-delight",
    name: "Coral Delight",
    audience: "Fashion & Lifestyle",
    colors: {
      // Base colors
      background: "bg-rose-50",
      surface: "bg-white",
      border: "border-rose-100",

      // Text colors
      text: {
        primary: "text-rose-900",
        secondary: "text-rose-700",
        muted: "text-gray-500",
        accent: "text-rose-500",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-rose-500 text-white",
          hover: "hover:bg-rose-600",
        },
        secondary: {
          base: "bg-white text-rose-700 border border-rose-200",
          hover: "hover:bg-rose-50",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-rose-100",
        hover: "hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-200",
      },

      // Section styles
      section: {
        primary: "bg-rose-500",
        secondary: "bg-rose-100",
      },

      // Special elements
      highlight: "bg-rose-100",
      overlay: "bg-black/50",
      divider: "border-rose-100",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    audience: "Travel & Leisure",
    colors: {
      // Base colors
      background: "bg-sky-50",
      surface: "bg-white",
      border: "border-sky-100",

      // Text colors
      text: {
        primary: "text-sky-900",
        secondary: "text-sky-700",
        muted: "text-gray-500",
        accent: "text-sky-500",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-sky-500 text-white",
          hover: "hover:bg-sky-600",
        },
        secondary: {
          base: "bg-white text-sky-700 border border-sky-200",
          hover: "hover:bg-sky-50",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-sky-100",
        hover: "hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-200",
      },

      // Section styles
      section: {
        primary: "bg-sky-500",
        secondary: "bg-sky-100",
      },

      // Special elements
      highlight: "bg-sky-100",
      overlay: "bg-black/50",
      divider: "border-sky-100",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "golden-luxury-dark",
    name: "Golden Luxury Dark",
    audience: "Premium & Luxury",
    colors: {
      // Base colors
      background: "bg-amber-50",
      surface: "bg-white",
      border: "border-amber-100",

      // Text colors
      text: {
        primary: "text-amber-900",
        secondary: "text-amber-700",
        muted: "text-gray-500",
        accent: "text-amber-500",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
          hover: "hover:from-amber-600 hover:to-yellow-600",
        },
        secondary: {
          base: "bg-white text-amber-700 border border-amber-200",
          hover: "hover:bg-amber-50",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-amber-100",
        hover:
          "hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-200",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-amber-500 to-yellow-500",
        secondary: "bg-amber-100",
      },

      // Special elements
      highlight: "bg-amber-100",
      overlay: "bg-black/50",
      divider: "border-amber-100",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "midnight-galaxy",
    name: "Midnight Galaxy",
    audience: "Space & Future",
    colors: {
      // Base colors
      background: "bg-[#0F172A]",
      surface: "bg-[#1E293B]",
      border: "border-[#334155]",

      // Text colors
      text: {
        primary: "text-[#F8FAFC]",
        secondary: "text-[#CBD5E1]",
        muted: "text-[#94A3B8]",
        accent: "text-[#38BDF8]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-[#38BDF8] to-[#818CF8] text-white",
          hover: "hover:from-[#0EA5E9] hover:to-[#6366F1]",
        },
        secondary: {
          base: "bg-[#1E293B] text-[#F8FAFC] border border-[#334155]",
          hover: "hover:bg-[#334155]",
        },
      },

      // Component styles
      card: {
        base: "bg-[#1E293B] border border-[#334155]",
        hover: "hover:shadow-xl hover:shadow-[#38BDF8]/10",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-[#38BDF8] to-[#818CF8]",
        secondary: "bg-[#1E293B]",
      },

      // Special elements
      highlight: "bg-[#38BDF8]/10",
      overlay: "bg-[#0F172A]/80",
      divider: "border-[#334155]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "neon-synthwave",
    name: "Neon Synthwave",
    audience: "Entertainment & Music",
    colors: {
      // Base colors
      background: "bg-[#2D1B69]",
      surface: "bg-[#1F1147]",
      border: "border-[#6B21A8]",

      // Text colors
      text: {
        primary: "text-[#FFFFFF]",
        secondary: "text-[#E879F9]",
        muted: "text-[#D8B4FE]",
        accent: "text-[#F0ABFC]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-[#F0ABFC] to-[#C084FC] text-[#1F1147]",
          hover: "hover:from-[#E879F9] hover:to-[#A855F7]",
        },
        secondary: {
          base: "bg-[#1F1147] text-[#F0ABFC] border border-[#F0ABFC]",
          hover: "hover:bg-[#2D1B69]",
        },
      },

      // Component styles
      card: {
        base: "bg-[#1F1147] border border-[#6B21A8]",
        hover: "hover:shadow-xl hover:shadow-[#F0ABFC]/20",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-[#F0ABFC] to-[#C084FC]",
        secondary: "bg-[#1F1147]",
      },

      // Special elements
      highlight: "bg-[#F0ABFC]/10",
      overlay: "bg-[#1F1147]/80",
      divider: "border-[#6B21A8]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "arctic-frost",
    name: "Arctic Frost",
    audience: "Minimal & Clean",
    colors: {
      // Base colors
      background: "bg-[#F8FAFC]",
      surface: "bg-[#FFFFFF]",
      border: "border-[#E2E8F0]",

      // Text colors
      text: {
        primary: "text-[#0F172A]",
        secondary: "text-[#334155]",
        muted: "text-[#64748B]",
        accent: "text-[#0EA5E9]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-[#0EA5E9] text-white",
          hover: "hover:bg-[#0284C7]",
        },
        secondary: {
          base: "bg-white text-[#0F172A] border border-[#E2E8F0]",
          hover: "hover:bg-[#F8FAFC]",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-[#E2E8F0]",
        hover: "hover:shadow-lg hover:shadow-[#0EA5E9]/5",
      },

      // Section styles
      section: {
        primary: "bg-[#0EA5E9]",
        secondary: "bg-[#F8FAFC]",
      },

      // Special elements
      highlight: "bg-[#F0F9FF]",
      overlay: "bg-[#0F172A]/50",
      divider: "border-[#E2E8F0]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "golden-luxury-light",
    name: "Golden Luxury Light",
    audience: "Premium & Elegant",
    colors: {
      // Base colors
      background: "bg-[#0C0A09]",
      surface: "bg-[#1C1917]",
      border: "border-[#44403C]",

      // Text colors
      text: {
        primary: "text-[#FAFAF9]",
        secondary: "text-[#E7E5E4]",
        muted: "text-[#A8A29E]",
        accent: "text-[#FCD34D]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-[#0C0A09]",
          hover: "hover:from-[#FBBF24] hover:to-[#D97706]",
        },
        secondary: {
          base: "bg-[#1C1917] text-[#FCD34D] border border-[#FCD34D]",
          hover: "hover:bg-[#292524]",
        },
      },

      // Component styles
      card: {
        base: "bg-[#1C1917] border border-[#44403C]",
        hover: "hover:shadow-xl hover:shadow-[#FCD34D]/10",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-[#FCD34D] to-[#F59E0B]",
        secondary: "bg-[#1C1917]",
      },

      // Special elements
      highlight: "bg-[#FCD34D]/10",
      overlay: "bg-[#0C0A09]/80",
      divider: "border-[#44403C]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "nature-harmony",
    name: "Nature Harmony",
    audience: "Organic & Natural",
    colors: {
      // Base colors
      background: "bg-[#ECFDF5]",
      surface: "bg-white",
      border: "border-[#D1FAE5]",

      // Text colors
      text: {
        primary: "text-[#064E3B]",
        secondary: "text-[#065F46]",
        muted: "text-[#047857]",
        accent: "text-[#059669]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-[#059669] text-white",
          hover: "hover:bg-[#047857]",
        },
        secondary: {
          base: "bg-white text-[#064E3B] border border-[#D1FAE5]",
          hover: "hover:bg-[#ECFDF5]",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-[#D1FAE5]",
        hover: "hover:shadow-lg hover:shadow-[#059669]/10",
      },

      // Section styles
      section: {
        primary: "bg-[#059669]",
        secondary: "bg-[#ECFDF5]",
      },

      // Special elements
      highlight: "bg-[#ECFDF5]",
      overlay: "bg-[#064E3B]/50",
      divider: "border-[#D1FAE5]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    audience: "Feminine & Elegant",
    colors: {
      // Base colors
      background: "bg-[#FDF2F8]",
      surface: "bg-white",
      border: "border-[#FCE7F3]",

      // Text colors
      text: {
        primary: "text-[#831843]",
        secondary: "text-[#9D174D]",
        muted: "text-[#BE185D]",
        accent: "text-[#DB2777]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-[#DB2777] to-[#BE185D] text-white",
          hover: "hover:from-[#BE185D] hover:to-[#9D174D]",
        },
        secondary: {
          base: "bg-white text-[#831843] border border-[#FCE7F3]",
          hover: "hover:bg-[#FDF2F8]",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-[#FCE7F3]",
        hover: "hover:shadow-lg hover:shadow-[#DB2777]/10",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-[#DB2777] to-[#BE185D]",
        secondary: "bg-[#FDF2F8]",
      },

      // Special elements
      highlight: "bg-[#FDF2F8]",
      overlay: "bg-[#831843]/50",
      divider: "border-[#FCE7F3]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "cyber-punk",
    name: "Cyber Punk",
    audience: "Bold & Futuristic",
    colors: {
      // Base colors
      background: "bg-[#18181B]",
      surface: "bg-[#27272A]",
      border: "border-[#3F3F46]",

      // Text colors
      text: {
        primary: "text-[#FAFAFA]",
        secondary: "text-[#E4E4E7]",
        muted: "text-[#A1A1AA]",
        accent: "text-[#FB923C]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-gradient-to-r from-[#FB923C] to-[#EA580C] text-white",
          hover: "hover:from-[#F97316] hover:to-[#C2410C]",
        },
        secondary: {
          base: "bg-[#27272A] text-[#FB923C] border border-[#FB923C]",
          hover: "hover:bg-[#3F3F46]",
        },
      },

      // Component styles
      card: {
        base: "bg-[#27272A] border border-[#3F3F46]",
        hover: "hover:shadow-xl hover:shadow-[#FB923C]/20",
      },

      // Section styles
      section: {
        primary: "bg-gradient-to-r from-[#FB923C] to-[#EA580C]",
        secondary: "bg-[#27272A]",
      },

      // Special elements
      highlight: "bg-[#FB923C]/10",
      overlay: "bg-[#18181B]/80",
      divider: "border-[#3F3F46]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
  {
    id: "lavender-dreams",
    name: "Lavender Dreams",
    audience: "Soft & Calming",
    colors: {
      // Base colors
      background: "bg-[#F5F3FF]",
      surface: "bg-white",
      border: "border-[#EDE9FE]",

      // Text colors
      text: {
        primary: "text-[#4C1D95]",
        secondary: "text-[#5B21B6]",
        muted: "text-[#6D28D9]",
        accent: "text-[#7C3AED]",
      },

      // Interactive elements
      button: {
        primary: {
          base: "bg-[#7C3AED] text-white",
          hover: "hover:bg-[#6D28D9]",
        },
        secondary: {
          base: "bg-white text-[#4C1D95] border border-[#EDE9FE]",
          hover: "hover:bg-[#F5F3FF]",
        },
      },

      // Component styles
      card: {
        base: "bg-white border border-[#EDE9FE]",
        hover: "hover:shadow-lg hover:shadow-[#7C3AED]/10",
      },

      // Section styles
      section: {
        primary: "bg-[#7C3AED]",
        secondary: "bg-[#F5F3FF]",
      },

      // Special elements
      highlight: "bg-[#F5F3FF]",
      overlay: "bg-[#4C1D95]/50",
      divider: "border-[#EDE9FE]",

      input: {
        base: "bg-white text-[#111827] border border-[#E5E7EB]",
        hover: "hover:border-[#BFDBFE]",
        focus: "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
        placeholder: "placeholder-[#9CA3AF]",
        text: "text-[#111827]",
        disabled:
          "disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:border-[#E5E7EB]",
      },
    },
  },
];

export const fontPresets = [
  {
    id: "modernSans",
    name: "Modern Sans",
    description:
      "Clean and contemporary typography using DM Sans + Plus Jakarta Sans",
    styles: {
      heading: "font-bold tracking-tight",
      subheading: "font-semibold",
      body: "font-normal",
      button: "font-medium",
    },
  },
  {
    id: "techMono",
    name: "Tech Mono",
    description: "Modern geometric style using Space Grotesk + Work Sans",
    styles: {
      heading: "font-bold tracking-tight",
      subheading: "font-medium",
      body: "font-normal",
      button: "font-medium",
    },
  },
  {
    id: "elegantSerif",
    name: "Elegant Serif",
    description:
      "Sophisticated serif combination using Crimson Pro + Work Sans",
    styles: {
      heading: "font-bold",
      subheading: "font-semibold",
      body: "font-normal",
      button: "font-medium",
    },
  },
  {
    id: "geometric",
    name: "Geometric Modern",
    description: "Clean geometric shapes using DM Sans + Work Sans",
    styles: {
      heading: "font-bold tracking-tight",
      subheading: "font-medium",
      body: "font-normal",
      button: "font-medium",
    },
  },
];

export const designPresets = [
  {
    id: "modern-default",
    name: "Modern Default",
    description: "Clean and professional with balanced proportions",
    styles: {
      typography: {
        heading: "text-4xl tracking-tight",
        subheading: "text-2xl",
        body: "text-base leading-relaxed",
        button: "text-sm",
      },
      spacing: {
        section: "py-20",
        container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        stack: "space-y-6",
      },
      ui: {
        roundedness: "rounded-lg",
        buttonSize: "px-4 py-2",
        shadows: "shadow-md",
        transitions: "transition duration-200",
      },
    },
  },
  {
    id: "startup-bold",
    name: "Startup Bold",
    description: "Bold typography with generous spacing",
    styles: {
      typography: {
        heading: "text-5xl tracking-tight",
        subheading: "text-3xl",
        body: "text-lg leading-relaxed",
        button: "text-base",
      },
      spacing: {
        section: "py-24",
        container: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
        stack: "space-y-8",
      },
      ui: {
        roundedness: "rounded-xl",
        buttonSize: "px-6 py-3",
        shadows: "shadow-lg",
        transitions: "transition duration-300",
      },
    },
  },
  {
    id: "minimal-sharp",
    name: "Minimal Sharp",
    description: "Clean edges with compact spacing",
    styles: {
      typography: {
        heading: "text-3xl tracking-normal",
        subheading: "text-xl",
        body: "text-base leading-normal",
        button: "text-sm",
      },
      spacing: {
        section: "py-16",
        container: "max-w-7xl mx-auto px-4",
        stack: "space-y-4",
      },
      ui: {
        roundedness: "rounded-none",
        buttonSize: "px-4 py-2",
        shadows: "shadow-sm",
        transitions: "transition duration-150",
      },
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated with refined details",
    styles: {
      typography: {
        heading: "text-4xl tracking-normal",
        subheading: "text-2xl",
        body: "text-base leading-loose",
        button: "text-sm",
      },
      spacing: {
        section: "py-20",
        container: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
        stack: "space-y-6",
      },
      ui: {
        roundedness: "rounded-md",
        buttonSize: "px-5 py-2.5",
        shadows: "shadow-md",
        transitions: "transition duration-200",
      },
    },
  },
  {
    id: "playful",
    name: "Playful",
    description: "Fun and approachable with soft edges",
    styles: {
      typography: {
        heading: "text-4xl tracking-wide",
        subheading: "text-2xl",
        body: "text-lg leading-relaxed",
        button: "text-base",
      },
      spacing: {
        section: "py-20",
        container: "max-w-6xl mx-auto px-6",
        stack: "space-y-8",
      },
      ui: {
        roundedness: "rounded-2xl",
        buttonSize: "px-6 py-3",
        shadows: "shadow-xl",
        transitions: "transition duration-300",
      },
    },
  },
];

// Helper to generate theme classes
export const getThemeClasses = (theme) => ({
  layout: {
    background: theme.colors.background,
    surface: theme.colors.surface,
  },
  text: {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    muted: theme.colors.text.muted,
    accent: theme.colors.text.accent,
  },
  button: {
    primary: `${theme.colors.button.primary.base} ${theme.colors.button.primary.hover}`,
    secondary: `${theme.colors.button.secondary.base} ${theme.colors.button.secondary.hover}`,
  },
  card: `${theme.colors.card.base} ${theme.colors.card.hover}`,
  section: {
    primary: theme.colors.section.primary,
    secondary: theme.colors.section.secondary,
  },
  utils: {
    highlight: theme.colors.highlight,
    overlay: theme.colors.overlay,
    divider: theme.colors.divider,
  },
  input: `${theme.colors.input.base} ${theme.colors.input.hover} ${theme.colors.input.focus} ${theme.colors.input.placeholder} ${theme.colors.input.text} ${theme.colors.input.disabled}`,
});

// Helper to combine theme and design classes
export function getStyles(theme, design, font = fontPresets[0]) {
  console.log("getStyles input:", {
    theme: theme?.name,
    design: design?.name,
    font: font?.name,
  });

  // Ensure required parameters are provided
  if (!theme || !design) {
    console.warn("Missing theme or design:", { theme, design });
    return theme?.colors || {};
  }

  // Get theme classes first
  const themeClasses = getThemeClasses(theme);

  // Combine theme colors with design styles and fonts
  const combinedStyles = {
    layout: {
      ...themeClasses.layout,
      container: `${design.styles.spacing.container}`,
      section: design.styles.spacing.section,
      background: `${themeClasses.layout.background}`,
      surface: `${themeClasses.layout.surface}`,
    },
    text: {
      ...themeClasses.text,
      heading: `${themeClasses.text.primary} ${design.styles.typography.heading} ${font.styles.heading}`,
      subheading: `${themeClasses.text.secondary} ${design.styles.typography.subheading} ${font.styles.subheading}`,
      body: `${themeClasses.text.body} ${design.styles.typography.body} ${font.styles.body}`,
    },
    button: {
      primary: `${themeClasses.button.primary} ${design.styles.ui.buttonSize} ${design.styles.ui.roundedness} ${design.styles.ui.transitions} ${design.styles.typography.button} ${font.styles.button}`,
      secondary: `${themeClasses.button.secondary} ${design.styles.ui.buttonSize} ${design.styles.ui.roundedness} ${design.styles.ui.transitions} ${design.styles.typography.button} ${font.styles.button}`,
    },
    card: `${themeClasses.card} ${design.styles.ui.roundedness} ${design.styles.ui.shadows} ${design.styles.ui.transitions}`,
    section: themeClasses.section,
    utils: {
      ...themeClasses.utils,
      stack: design.styles.spacing.stack,
    },
    input: `${themeClasses.input} ${design.styles.ui.roundedness} ${design.styles.ui.transitions} ${design.styles.typography.body} ${font.styles.body}`,
  };

  console.log("Combined styles:", combinedStyles);
  return combinedStyles;
}
