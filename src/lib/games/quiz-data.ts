export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Který druh tučňáka je největší?",
    options: ["Tučňák kroužkový", "Tučňák císařský", "Tučňák patagonský", "Tučňák oslí"],
    correct: 1,
    explanation:
      "Tučňák císařský měří kolem 120 cm a váží přes 40 kg — je to největší druh ze všech.",
  },
  {
    question: "Kde hnízdí tučňák galapážský?",
    options: [
      "Na pobřeží Antarktidy",
      "Na subantarktických ostrovech",
      "Na rovníku (Galapágy)",
      "Na Novém Zélandu",
    ],
    correct: 2,
    explanation:
      "Tučňák galapážský je jediný tučňák hnízdící na rovníku. Přežívá díky studenému Humboldtovu proudu.",
  },
  {
    question: "Kolik druhů tučňáků žije dnes na Zemi?",
    options: ["5 druhů", "12 druhů", "18 druhů", "30 druhů"],
    correct: 2,
    explanation:
      "Podle aktuální taxonomie žije 18 druhů tučňáků, rozdělených do 6 rodů.",
  },
  {
    question: "Co dělá samec tučňáka císařského během zimy?",
    options: [
      "Loví ryby v moři",
      "Dva měsíce zahřívá vejce na nohou",
      "Staví sněhovou noru",
      "Migruje na sever",
    ],
    correct: 1,
    explanation:
      "Samec dva měsíce inkubuje vejce na nohou pod kožní řasou, zatímco samice se krmí v moři.",
  },
  {
    question: "Proč se rockhopper (skalní tučňák) jmenuje tak, jak se jmenuje?",
    options: [
      "Protože zpívá jako rock kapela",
      "Protože šplhá a skáče po strmých skalách",
      "Protože žije na mořském dně",
      "Protože má kámen v žaludku",
    ],
    correct: 1,
    explanation:
      "Rockhoppeři šplhají ke svým koloniím po strmých skalách a skalních útesech — skáčou z kamene na kámen.",
  },
];
