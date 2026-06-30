export const dailyReminders = [
  {
    day: 1,
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    islamicText: "Indeed, Allah is with the patient.",
    source: "Quran 2:153",
    reflection: "Today is Day 1. Focus on building patience. Every difficult workout and long hour is a form of self-discipline that brings you closer to your Creator.",
    fitnessQuote: "The journey of a thousand miles begins with a single step. Discipline starts today."
  },
  {
    day: 2,
    arabic: "وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ",
    islamicText: "And in yourselves. Then will you not see?",
    source: "Quran 51:21",
    reflection: "Your body is an Amanah (trust) from Allah. Caring for your physical strength is a way of showing gratitude for your health.",
    fitnessQuote: "Take care of your body. It's the only place you have to live."
  },
  {
    day: 3,
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    islamicText: "Indeed, with hardship [will be] ease.",
    source: "Quran 94:6",
    reflection: "When your muscles burn during a workout, remember that physical adaptations require stress. Hardship is where the growth happens.",
    fitnessQuote: "Strength does not come from winning. Your struggles develop your strengths."
  },
  {
    day: 4,
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    islamicText: "A strong believer is better and more beloved to Allah than a weak believer.",
    source: "Sahih Muslim",
    reflection: "Strength isn't just physical; it is spiritual, mental, and physical. Strive to build strength in all areas to serve others better.",
    fitnessQuote: "True strength is a combination of mind, body, and spirit."
  },
  {
    day: 5,
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    islamicText: "And seek help through patience and prayer.",
    source: "Quran 2:45",
    reflection: "If you feel overwhelmed by the challenge goals today, step onto your prayer mat. Find calm and focus in your Salah, then attack your workouts.",
    fitnessQuote: "Quiet the mind and the body will follow. Inner peace drives outer performance."
  },
  {
    day: 6,
    arabic: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
    islamicText: "Indeed, Allah will not change the condition of a people until they change what is in themselves.",
    source: "Quran 13:11",
    reflection: "Change starts from within. The daily choices you make with your meals, hydration, and reading are slowly rewriting your character.",
    fitnessQuote: "Change is not something that happens, it's something you create."
  },
  {
    day: 7,
    arabic: "وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا",
    islamicText: "Eat and drink, but be not excessive.",
    source: "Quran 7:31",
    reflection: "Halal eating combined with portion control is a direct prophetic instruction. Respect your nutrition today.",
    fitnessQuote: "Fuel your body, don't fill it. Clean eating yields clean energy."
  },
  {
    day: 8,
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ الصِّحَّةُ وَالْفَرَاغُ",
    islamicText: "There are two blessings which many people lose: Health and Free Time.",
    source: "Sahih Bukhari",
    reflection: "Do not take your health for granted. Today you have the ability to walk, run, and lift. Use this blessing wisely.",
    fitnessQuote: "Do today what others won't, so tomorrow you can do what others can't."
  },
  {
    day: 9,
    arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
    islamicText: "And when you have decided, then rely upon Allah.",
    source: "Quran 3:159",
    reflection: "Rely on the process and put your trust in Allah. Once your intention (Niyyah) is set, execute the day without hesitation.",
    fitnessQuote: "Action cures fear. Put in the work and trust your preparation."
  },
  {
    day: 10,
    arabic: "إِنَّ لِجَسَدِكَ عَلَيْكَ حَقًّا",
    islamicText: "Indeed, your body has a right over you.",
    source: "Sahih Bukhari",
    reflection: "Give your body the hydration, quality sleep, and clean nutrition it deserves. Rest is not laziness; it's active recovery.",
    fitnessQuote: "Rest when you're tired, but never quit. Recovery is where muscle is built."
  }
];

// Fallback generator for days 11 to 75 to keep payload minimal but fully customized
export const getDailyReminder = (dayNumber) => {
  const index = (dayNumber - 1) % dailyReminders.length;
  const template = dailyReminders[index];
  
  // Custom reflections dynamically modified for day count
  return {
    ...template,
    day: dayNumber,
    reflection: `[Day ${dayNumber}] ${template.reflection.replace(/Day \d+/, `Day ${dayNumber}`)}`
  };
};
