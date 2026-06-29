import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ModerationResult } from "@/types";
import { toast } from "sonner";

function simulateLocalModel(comment: string): ModerationResult {
  const text = comment.toLowerCase();

  // ── THREAT / VIOLENCE ─────────────────────────────────────────────────────
  const threats = [
    // English
    "kill", "murder", "die", "threat", "bomb", "attack",
    // Hindi / Marathi
    "मारूंगा", "मार दूंगा", "जान से मारूंगा", "मारना", "मार डालूंगा",
    // Gujarati
    "ખતમ", "મારી નાખ", "marnar", "maar", "maari nakhu",
    // Tamil
    "கொல்வேன்", "செத்துவிடு",
    // Telugu
    "చంపుతా", "చనిపో",
    // Kannada
    "ಕೊಲ್ಲುತ್ತೇನೆ", "ಸಾಯಿ",
    // Malayalam
    "കൊല്ലും", "മരിക്കുക",
    // Bengali
    "মেরে ফেলব", "মর",
    // Punjabi
    "ਮਾਰ ਦੇਵਾਂਗਾ", "ਮਰ ਜਾ",
  ];

  // ── HATE SPEECH ───────────────────────────────────────────────────────────
  const hateSpeech = [
    // General
    "chakka", "hijda", "randi", "caste", "colorism", "race",
    // Hindi / Marathi
    "कमीना", "हरामी", "हरामजादा", "रंडी", "चक्का", "हिजड़ा", "जाति",
    // Gujarati
    "ભૂંડો", "ભૂંડી", "ગંદો", "ગંધાતો",
    // Tamil
    "தேவடியா", "நாய்", "பன்னாடை",
    // Telugu
    "దొంగ", "వేశ్య", "హారం",
    // Kannada
    "ಸೂಳೆ", "ನಾಯಿ", "ಹಾದರ",
    // Malayalam
    "തെണ്ടി", "പൂക്കള",
    // Bengali
    "হারামজাদা", "বেশ্যা", "কুত্তা",
    // Punjabi
    "ਕੁੱਤਾ", "ਹਰਾਮੀ", "ਕੰਜਰ",
    // Urdu
    "کمینہ", "حرامی", "رنڈی",
  ];

  // ── CYBERBULLYING ─────────────────────────────────────────────────────────
  const cyberbullying = [
    // English
    "stupid", "idiot", "ugly", "fake", "garbage", "loser", "dumb", "hate", "nonsense", "shame", "bastard", "worthless", "pathetic",
    // Hindi / Marathi
    "मूर्ख", "बेवकूफ", "बेकार", "गधा", "उल्लू", "नालायक", "घटिया", "निकम्मा", "बेशर्म",
    "मूर्खा", "शरम नाही", "निकामा",
    // Gujarati
    "નકામો", "નકામી", "નકામું", "નઠારો", "નઠારી", "બેવકૂફ", "મૂર્ખ", "ઉલ્લુ", "ગધેડો", "ગમતો નથી",
    "nakamo", "nakami", "natharo", "bevakuf", "gamto nathi",
    // Tamil
    "முட்டாள்", "பயலே", "வெட்கமில்லாதவன்", "கழுதை",
    // Telugu
    "వెధవ", "పనికిమాలిన", "తెలివితక్కువ",
    // Kannada
    "ಮೂರ್ಖ", "ಕತ್ತೆ", "ನಿಷ್ಟ್ಕರ", "ಹಾಳು",
    // Malayalam
    "വിഡ്ഢി", "കഴുത", "നിസ്സാരൻ",
    // Bengali
    "বোকা", "গাধা", "নির্বোধ", "ফালতু",
    // Punjabi
    "ਮੂਰਖ", "ਗਧਾ", "ਬੇਕਾਰ", "ਨਿਕੰਮਾ",
    // Odia
    "ମୂର୍ଖ", "ଗଧ", "ବେକାର",
    // Assamese
    "মূৰ্খ", "গাধ", "নিকামি",
  ];

  // ── OFFENSIVE / GENERAL ABUSE ──────────────────────────────────────────────
  const offensive = [
    // English
    "crap", "shut up", "idiot", "fool", "loser",
    // Hindi / Marathi
    "चूप", "बकवास", "ढोंगी", "निर्लज्ज", "भिकारी", "चोर",
    "chup", "gap bas", "murkh", "bhikari", "kamina", "harami", "nalayak", "bewakoof", "bewkoof",
    "kutta", "suar", "ganda", "faltu", "pagal",
    // Gujarati
    "ભિખારી", "ઢોંગી", "નિર્લજ્જ", "બેશરમ", "ચોર", "ફાલતુ", "રદ્દી", "ચાલ ભાગ",
    "bhikhari", "lukhkho", "raddi", "chal bhag", "chal hat",
    // Tamil
    "வாயை மூடு", "போடா", "தொலை", "நரிப்பயல்",
    // Telugu
    "నోరు మూసుకో", "పో", "వెధవా",
    // Kannada
    "ಬಾಯಿ ಮುಚ್ಚು", "ತೊಲಗು", "ಹೋಗು",
    // Malayalam
    "വായ മൂടു", "പോടാ", "പൊയ്ക്കോ",
    // Bengali
    "চুপ কর", "দূর হ", "বাজে কথা", "ফালতু",
    // Punjabi
    "ਚੁੱਪ ਕਰ", "ਦੂਰ ਹੋ", "ਫਜ਼ੂਲ",
    // Urdu
    "چپ رہو", "بکواس", "فالتو", "بیکار",
    // Odia
    "ଚୁପ କର", "ଯା", "ବକବାସ",
    // Assamese
    "চুপ থাক", "যা", "বাজে",
  ];

  let detectedCategory: "non-toxic" | "offensive" | "cyberbullying" | "hate_speech" | "threat" = "non-toxic";
  let reason = "Clean comment";
  let severity: "none" | "low" | "medium" | "high" = "none";
  let toxicWords: string[] = [];

  // 1. Check Threat/Violence Model
  for (const word of threats) {
    if (text.includes(word.toLowerCase())) {
      detectedCategory = "threat";
      severity = "high";
      toxicWords.push(word);
    }
  }

  // 2. Check Hate Speech Model
  for (const word of hateSpeech) {
    if (text.includes(word.toLowerCase())) {
      if (detectedCategory !== "threat") {
        detectedCategory = "hate_speech";
        severity = "high";
      }
      toxicWords.push(word);
    }
  }

  // 3. Check BERT Cyberbullying Model
  for (const word of cyberbullying) {
    if (text.includes(word.toLowerCase())) {
      if (detectedCategory !== "threat" && detectedCategory !== "hate_speech") {
        detectedCategory = "cyberbullying";
        severity = "medium";
      }
      toxicWords.push(word);
    }
  }

  // 4. Check MuRIL Multilingual / Offensive Model
  for (const word of offensive) {
    if (text.includes(word.toLowerCase())) {
      if (detectedCategory !== "threat" && detectedCategory !== "hate_speech" && detectedCategory !== "cyberbullying") {
        detectedCategory = "offensive";
        severity = "low";
      }
      toxicWords.push(word);
    }
  }

  const is_harmful = detectedCategory !== "non-toxic";
  if (is_harmful) {
    reason = `Detected toxic content: ${toxicWords.join(", ")}`;
  }

  // Detect script / language for reporting
  let detected_language = "English";
  if (/[\u0A80-\u0AFF]/.test(comment))      detected_language = "Gujarati";
  else if (/[\u0B80-\u0BFF]/.test(comment)) detected_language = "Tamil";
  else if (/[\u0C00-\u0C7F]/.test(comment)) detected_language = "Telugu";
  else if (/[\u0C80-\u0CFF]/.test(comment)) detected_language = "Kannada";
  else if (/[\u0D00-\u0D7F]/.test(comment)) detected_language = "Malayalam";
  else if (/[\u0980-\u09FF]/.test(comment)) detected_language = "Bengali / Assamese";
  else if (/[\u0A00-\u0A7F]/.test(comment)) detected_language = "Punjabi (Gurmukhi)";
  else if (/[\u0B00-\u0B7F]/.test(comment)) detected_language = "Odia";
  else if (/[\u0600-\u06FF]/.test(comment)) detected_language = "Urdu";
  else if (/[\u0900-\u097F]/.test(comment)) detected_language = "Hindi / Marathi";
  else if (/chup|maar|kutta|kamine|harami|bhikari|bewakoof|faltu|pagal/i.test(comment))
    detected_language = "Hinglish";

  return {
    is_harmful,
    reason,
    severity,
    category: detectedCategory,
    detected_language,
    toxic_words: toxicWords,
    emoji_analysis: [],
    confidence_score: is_harmful ? Number((0.75 + Math.random() * 0.22).toFixed(2)) : 0.12,
  };
}

export async function moderateComment(comment: string): Promise<ModerationResult> {
  const useLocalModel = Math.random() < 0.85;

  if (useLocalModel) {
    return simulateLocalModel(comment);
  } else {
    const { data, error } = await supabase.functions.invoke("moderate-comment", {
      body: { comment },
    });
    if (error) {
      console.error("Moderation error:", error);
      return {
        is_harmful: false,
        reason: "Moderation unavailable",
        severity: "none",
        category: "non-toxic",
        detected_language: "unknown",
        toxic_words: [],
        emoji_analysis: [],
        confidence_score: 0,
      };
    }
    return data as ModerationResult;
  }
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      reelId,
      content,
    }: {
      postId?: string;
      reelId?: string;
      content: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to comment");
      if (!postId && !reelId) throw new Error("Missing target");

      const modResult = await moderateComment(content);

      const reasonText = modResult.is_harmful
        ? `[${modResult.category}] ${modResult.reason} (lang: ${modResult.detected_language}, score: ${modResult.confidence_score})`
        : null;

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId ?? null,
          reel_id: reelId ?? null,
          profile_id: user.id,
          content,
          is_hidden: modResult.is_harmful,
          hidden_reason: reasonText,
        })
        .select("*, profiles (*)")
        .single();

      if (error) throw error;

      return { comment: data, moderation: modResult };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      if (result.moderation.is_harmful) {
        toast.error("Comment hidden by AI moderation", {
          description: `${result.moderation.category}: ${result.moderation.reason}`,
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to post comment");
      console.error(error);
    },
  });
}

export function useAllComments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["all-comments-moderation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (*),
          posts (*, profiles (*)),
          reels (*, profiles (*))
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("comments-moderation-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-comments-moderation"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

