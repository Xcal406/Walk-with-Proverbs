import { ReadingPortion } from "./types";

const chapterVerseCounts = [
  33, 22, 35, 27, 23, 35, 27, 36, 18, 32,
  31, 28, 25, 35, 33, 33, 28, 24, 29, 30,
  31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31
];

// Generates the base list of all verses
const generateAllVerses = () => {
  const list: { chapter: number; verse: number }[] = [];
  for (let c = 1; c <= 31; c++) {
    const count = chapterVerseCounts[c - 1];
    for (let v = 1; v <= count; v++) {
      list.push({ chapter: c, verse: v });
    }
  }
  return list;
};

// Beautiful thematic database of Proverbs
const themesDatabase = [
  {
    theme: "The Call of Wisdom",
    focus: "Listening to the voice of divine wisdom calling out in the public square, inviting us to live with understanding and sound judgment.",
    prompts: [
      "In what area of your life is wisdom currently calling to you? How can you cultivate a more receptive posture to hear it?",
      "Reflecting on today's verses, what is the difference between simply knowing facts and possessing true, living wisdom?",
      "How does recognizing your own need for guidance open your heart to walk in the way of understanding?"
    ]
  },
  {
    theme: "Trusting the Lord",
    focus: "Relinquishing our own self-reliance to place complete trust in the creator's sovereignty, path, and direction.",
    prompts: [
      "What plans or worries are you holding onto tightly today? How can you practice committing them fully to the Lord?",
      "How have you experienced the difference between leaning on your own understanding versus acknowledging God in your steps?",
      "What does 'fearing the Lord' mean to you in the context of your daily choices and interactions?"
    ]
  },
  {
    theme: "Guarding the Heart",
    focus: "Protecting our inner thoughts, motives, and desires, knowing that they form the wellspring of our entire lives.",
    prompts: [
      "What thoughts or environments have been cluttering your mind lately? How can you guard your heart from their influence today?",
      "How do your deep-seated desires shape the words you speak and the actions you take?",
      "What is one practical step you can take today to keep your eyes focused on what is pure and right?"
    ]
  },
  {
    theme: "The Power of the Tongue",
    focus: "Analyzing the weight of our words, striving to speak truth, life, encouragement, and understanding rather than gossip or folly.",
    prompts: [
      "Reflect on a word spoken to you recently that brought life or healing. How can you speak similar words of encouragement today?",
      "Where do you find it most challenging to listen twice as much as you speak? How can silence serve as a form of wisdom today?",
      "Are there words you've spoken recently that require an apology or reconciliation? Write about this restoration process."
    ]
  },
  {
    theme: "Diligence & Discipline",
    focus: "Cultivating steady perseverance, focus, and a noble work ethic, countering laziness with purposeful activity.",
    prompts: [
      "Where in your life or spiritual journey are you tempted to look for shortcuts? What does steady diligence look like there?",
      "How can your daily labor—even the small tasks—become a form of worship and stewardship?",
      "What is one standard of discipline you feel called to re-establish this week to foster personal spiritual growth?"
    ]
  },
  {
    theme: "Humility vs. Pride",
    focus: "Seeking a realistic, modest, and holy view of ourselves, recognizing that pride precedes a fall and humility brings honor.",
    prompts: [
      "In what situations do you feel the urge to prove you are right or superior? How can you respond with humility instead?",
      "How does a humble heart make you more teachable and receptive to correction from others?",
      "Write a prayer or reflection expressing gratitude for your limits, acknowledging that God is the source of all your strengths."
    ]
  },
  {
    theme: "Friendship & Company",
    focus: "Building deep, sincere, and wise friendships that sharpen us, while guarding against toxic influences.",
    prompts: [
      "Who are the 'sharpeners' in your life? How have your friends helped you grow, and how can you be a better friend to them?",
      "How do the companions you spend the most time with influence your daily desires and standards?",
      "What does it mean to offer loyal, quiet support during a friend's season of adversity?"
    ]
  },
  {
    theme: "Integrity & Justice",
    focus: "Living with an undivided heart, matching our public deeds with our private character, and standing up for what is right.",
    prompts: [
      "What does walk in integrity look like when nobody is watching? How can you commit to honesty in small details today?",
      "How can you actively champion fairness, truth, or kindness for someone else in your sphere of influence?",
      "Where is there a misalignment between your core values and your modern practices? Reflect on narrowing that gap."
    ]
  },
  {
    theme: "Generosity & Stewardship",
    focus: "Viewing our money, talents, and resources as trusts to be shared generously with those in need, rather than hoarded.",
    prompts: [
      "How does practicing tangible generosity shift your perspective on what you 'lack' versus what you have been given?",
      "What does it mean to honor God with the firstfruits of your time and wealth today?",
      "In what way can you utilize your unique resources to lift up or comfort someone in your community this week?"
    ]
  },
  {
    theme: "Peace Over Anger",
    focus: "Diffusing volatile conflicts, managing our tempers, and offering gentle responses that turn away wrath.",
    prompts: [
      "Think about what triggers your annoyance or anger. How can you pause and allow wisdom to guide your response next time?",
      "What is the power of a 'soft answer' in a tense family, work, or social situation?",
      "Is there resentment or an old grievance you are nursing? How can you release it to God's care today?"
    ]
  },
  {
    theme: "Wisdom in Family",
    focus: "Nurturing deep respect, instruction, and love within family boundaries, extending legacy, and honoring ancestors.",
    prompts: [
      "How do your daily interactions with family shape the lasting spiritual legacy you wish to leave?",
      "In what way can you show honor, patience, or supportive love to your parents or family members today?",
      "How can family boundaries become a greenhouse for joint wisdom and mutual accountability?"
    ]
  },
  {
    theme: "Sovereign Direction",
    focus: "Resting in the assurance that while humans forge plans, the Lord establishes each step.",
    prompts: [
      "Reflect on a time your plans were redirected, leading to an unexpected blessing or growth. How does that build your faith today?",
      "How do you strike the balance between planning diligently while remaining completely open to God's ultimate path?",
      "Write a declaration of trust concerning a major decision in your future, surrendering the timeline to divine design."
    ]
  }
];

// Beautifully written titles mapped to standard thematic sections of Proverbs
const titlePools = {
  intro: [
    "The Genesis of Wisdom", "The Invitation of Truth", "The Anchor of Insight", "A Father's Golden Counsel",
    "Fleeing the Tangle of Folly", "The Call on the Windy Hills", "The Architecture of Understanding",
    "The Wealth of Discretion", "The Feast of Wisdom vs. Folly"
  ],
  middle: [
    "The Righteous Pathway", "The Scale of Truth", "The Fountain of Understanding", "Words Formed in Grace",
    "Stepping with Integrity", "The Quiet Spirit", "The Guarded Gate", "Legacy of the Noble Heart",
    "The Labor of Faith", "Strength through Humility", "Unshakeable Foundations", "The Golden Apples of Speech",
    "A Shield of Unbroken Trust", "The Compass of Righteousness", "Laying Up Deep Knowledge", "Refining the Inner Gold",
    "A Soft Word in the Storm", "The Harvest of Honest Living", "A Generous Wellspring", "Walking in the Light"
  ],
  outro: [
    "The Humble Cry of Agur", "Finding Wonder in Creation", "Refusing the Royal Snare",
    "The Counsel of Lemuel's Mother", "The Worth of a Noble Life", "Precious Beyond Rubies",
    "The Crown of Wisdom"
  ]
};

// Generates individual day objects programmatically to cover the 365 year
export const generatePlanList = (): ReadingPortion[] => {
  const allVerses = generateAllVerses();
  const readings: ReadingPortion[] = [];

  for (let d = 1; d <= 365; d++) {
    const startIndex = Math.floor(((d - 1) * allVerses.length) / 365);
    const endIndex = Math.floor((d * allVerses.length) / 365);
    const dayVerses = allVerses.slice(startIndex, endIndex);

    if (dayVerses.length === 0) continue;

    const firstVerse = dayVerses[0];
    const lastVerse = dayVerses[dayVerses.length - 1];
    const chapter = firstVerse.chapter;
    const startVerse = firstVerse.verse;
    const endVerse = lastVerse.verse;

    const reference = `Proverbs ${chapter}:${startVerse}${startVerse !== endVerse ? `-${endVerse}` : ""}`;

    // Select theme deterministically based on chapter and day
    let themeObj = themesDatabase[0];
    if (chapter >= 1 && chapter <= 4) {
      // Intro themes
      themeObj = themesDatabase[(chapter - 1) % 4]; // "The Call of Wisdom", "Trusting the Lord", "Guarding the Heart", "The Power of the Tongue"
    } else if (chapter >= 5 && chapter <= 9) {
      themeObj = themesDatabase[((chapter - 1) % 3) + 4]; // "Diligence", "Humility", "Friendship"
    } else if (chapter >= 10 && chapter <= 15) {
      themeObj = themesDatabase[((chapter - 1) % 4) + 3]; // "Tongue", "Diligence", "Humility", "Friendship"
    } else if (chapter >= 16 && chapter <= 22) {
      themeObj = themesDatabase[((chapter) % 4) + 7]; // "Integrity", "Generosity", "Peace", "Family"
    } else if (chapter >= 23 && chapter <= 24) {
      themeObj = themesDatabase[9]; // "Peace Over Anger" or "Guarding the Heart"
    } else if (chapter >= 25 && chapter <= 29) {
      themeObj = themesDatabase[((chapter) % 5) + 3]; // Diligence, Humility, Friendship, Integrity, Generosity
    } else {
      // Outro
      themeObj = themesDatabase[(chapter) % themesDatabase.length];
    }

    // Assign dynamic spiritual title
    let title = "";
    if (d < 50) {
      title = titlePools.intro[(d - 1) % titlePools.intro.length];
    } else if (d > 350) {
      title = titlePools.outro[(365 - d) % titlePools.outro.length];
    } else {
      title = titlePools.middle[(d + chapter) % titlePools.middle.length];
    }
    title = `${title} (${reference})`;

    // Select random prompt deterministically from the theme's prompts
    const promptIndex = (d + chapter) % themeObj.prompts.length;
    const defaultPrompt = themeObj.prompts[promptIndex];

    readings.push({
      dayIndex: d,
      chapter,
      startVerse,
      endVerse,
      reference,
      theme: themeObj.theme,
      title,
      focusMessage: themeObj.focus,
      defaultPrompt
    });
  }

  return readings;
};

export const allReadings = generatePlanList();

export const getReadingForDay = (dayIndex: number): ReadingPortion => {
  if (dayIndex < 1) dayIndex = 1;
  if (dayIndex > 365) dayIndex = 365;
  return allReadings[dayIndex - 1];
};
