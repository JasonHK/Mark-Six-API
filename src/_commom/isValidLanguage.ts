export type Language = "zh-HK" | "en-US";

export const LANGUAGES = ["zh-HK", "en-US"];

export default function isValidLanguage(language: string): language is Language
{
    return LANGUAGES.includes(language);
}
