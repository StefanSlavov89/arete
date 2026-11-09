import { getDayInfo } from './days';

export interface Quote {
  id: string;
  text: string;
  author: string;
}

type Raw = [text: string, author: string];

// Built-in starter quotes. Ids come from position, so append new ones at the end.
const RAW: Raw[] = [
  ['Discipline equals freedom.', 'Jocko Willink'],
  ['Be the hero of your own movie.', 'Joe Rogan'],
  ['One of the most important things you can do is conquer your inner bitch.', 'Joe Rogan'],
  [
    'You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.',
    'David Goggins',
  ],
  ["When you think you're done, you're only at 40% of what your body is capable of.", 'David Goggins'],
  ['Keep hammering.', 'Cameron Hanes'],
  ['Nobody cares. Work harder.', 'Cameron Hanes'],
  ['Denial is the ultimate comfort zone.', 'David Goggins'],
  ["Who's gonna carry the boats?", 'David Goggins'],
  ['Stay hard.', 'David Goggins'],
  ["Push hardest when you want to quit the most. That's how you callus your mind.", 'David Goggins'],
  ["Don't get bummed out, don't get frustrated. Just look at the issue and say: Good.", 'Jocko Willink'],
  ['Hesitation is the enemy.', 'Jocko Willink'],
  ['Get after it.', 'Jocko Willink'],
  ['Discipline is doing what you hate to do, but doing it like you love it.', 'Mike Tyson'],
  ["You don't have to be the best; you just have to keep hammering.", 'Cameron Hanes'],
  ['Surround yourself with those who push you to be a better human.', 'Cameron Hanes'],
  ['There is no easy way.', 'Andy Frisella'],
  ['Master the ability to feel stressed and still get your work done.', 'Andy Frisella'],
  [
    'If you want to be great, you have to surround yourself with greatness and study greatness.',
    'John Danaher',
  ],
  ['Keeping the ego in check is essential for a productive and happy life.', 'John Danaher'],
  [
    'Discipline is sticking to your plan for whatever length of time it takes to reach your goals.',
    'John Danaher',
  ],
  ['The universe rewards calculated risk and passion.', 'Joe Rogan'],
  ['Rest at the end, not in the middle.', 'Kobe Bryant'],
  ["Don't quit. Suffer now and live the rest of your life as a champion.", 'Muhammad Ali'],
  ['The only easy day was yesterday.', 'U.S. Navy SEALs'],
  [
    'No man has the right to be an amateur in the matter of physical training. It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable.',
    'Socrates',
  ],
  ['The impediment to action advances action. What stands in the way becomes the way.', 'Marcus Aurelius'],
  ['Waste no more time arguing about what a good man should be. Be one.', 'Marcus Aurelius'],
  ['Fire tests gold, suffering tests brave men.', 'Seneca'],
  ['We suffer more often in imagination than in reality.', 'Seneca'],
  ['No man is free who is not master of himself.', 'Epictetus'],
  ['First say to yourself what you would be; and then do what you have to do.', 'Epictetus'],
  ['He who has a why to live can bear almost any how.', 'Friedrich Nietzsche'],
  ['The first and best victory is to conquer self.', 'Plato'],
  ["You can't be the master without being an idiot first.", 'Mike Tyson'],
  [
    "I don't care how good you are at anything. If you don't have discipline, you ain't nobody.",
    'Mike Tyson',
  ],
  ["The hero and the coward feel the same fear. It's what you do with it that matters.", 'Mike Tyson'],
  ['Discipline is a form of self-respect.', 'Andy Frisella'],
  ['Real mental toughness comes from keeping the promises you make to yourself.', 'Andy Frisella'],
  ["Want to know how to be tough? Don't quit.", 'Andy Frisella'],
  [
    'Once you make the decision to do something, the time for talking stops, and the time for doing starts.',
    'Andy Frisella',
  ],
  ['Progress breeds self-respect, and self-respect breeds more progress.', 'Andy Frisella'],
  ["There's never a perfect time.", 'Andy Frisella'],
  ['Did you do what you needed to do today?', 'Andy Frisella'],
  ["You are either getting better, or you're getting worse. You're not staying the same.", 'David Goggins'],
  [
    'Incremental progress is still progress. One step is all that is required to take the next one.',
    'David Goggins',
  ],
  ["I'm haunted by my future goals, not my past failures.", 'David Goggins'],
  ["While most people stop when they're tired, I stop when I am done.", 'David Goggins'],
  [
    'A prepared mind craves the worst conditions because it knows that pressure brings out its best.',
    'David Goggins',
  ],
  ['Motivation is crap. Motivation comes and goes.', 'David Goggins'],
  [
    'The ticket to victory often comes down to bringing your very best when you feel your worst.',
    'David Goggins',
  ],
  ['You cannot be afraid to disappoint people.', 'David Goggins'],
  ['The pain of discipline is far less than the pain of regret.', 'David Goggins'],
  ['Everything you want is on the far side of hard work.', 'Tim Kennedy'],
  ['Discipline starts every day when the first alarm clock goes off in the morning.', 'Leif Babin'],
  [
    'Today is victory over yourself of yesterday; tomorrow is your victory over lesser men.',
    'Miyamoto Musashi',
  ],
  ['Do nothing that is of no use.', 'Miyamoto Musashi'],
  ['Think lightly of yourself and deeply of the world.', 'Miyamoto Musashi'],
  [
    'Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.',
    'Sun Tzu',
  ],
  ['In the midst of chaos, there is also opportunity.', 'Sun Tzu'],
  [
    'A good plan violently executed now is better than a perfect plan executed next week.',
    'George S. Patton',
  ],
  ['If it is not right, do not do it; if it is not true, do not say it.', 'Marcus Aurelius'],
  [
    'No man is more unhappy than he who never faces adversity, for he is not permitted to prove himself.',
    'Seneca',
  ],
  ['Sometimes even to live is an act of courage.', 'Seneca'],
  ['No great thing is created suddenly.', 'Epictetus'],
  ['It is difficulties that show what men are.', 'Epictetus'],
  ['Well-being is realized by small steps, but is truly no small thing.', 'Zeno of Citium'],
  [
    'I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.',
    'Bruce Lee',
  ],
  ['Do not pray for an easy life, pray for the strength to endure a difficult one.', 'Bruce Lee'],
  [
    'Fear is like fire. If you control it, it can cook for you; if you let it get out of control, it will burn you.',
    "Cus D'Amato",
  ],
  ['Fear is the friend of exceptional people.', "Cus D'Amato"],
  ["There's no talent here, this is hard work. This is an obsession.", 'Conor McGregor'],
  ['Excellence is not a skill. Excellence is an attitude.', 'Conor McGregor'],
  ['It is hard to fail, but it is worse never to have tried to succeed.', 'Theodore Roosevelt'],
  ['Everything negative — pressure, challenges — is all an opportunity for me to rise.', 'Kobe Bryant'],
  [
    'The mind is the limit. As long as the mind can envision that you can do something, you can do it.',
    'Arnold Schwarzenegger',
  ],
  ['Set your house in perfect order before you criticize the world.', 'Jordan Peterson'],
  ["If everything goes your way, you don't learn that much about yourself.", 'Rich Roll'],
  ["You are not your job. You're not how much money you have in the bank.", 'Tyler Durden'],
  ['The things you own end up owning you.', 'Tyler Durden'],
  ['You can only fight the way you practice.', 'Miyamoto Musashi'],
];

export const BUILT_IN_QUOTES: Quote[] = RAW.map(([text, author], i) => ({
  id: `b${i}`,
  text,
  author,
}));

export const attribution = (q: Quote) => q.author;

/** FNV-1a 32-bit — small, deterministic, good enough for shuffling. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic quote for a date: the combined pool (built-in + yours) is
 * shuffled with a per-year seed, then indexed by day-of-year. Same date → same
 * quote, and no repeats until every quote has been shown once.
 */
export function quoteForDate(date: Date, userQuotes: Quote[]): Quote {
  const { year, day } = getDayInfo(date);
  const ordered = [...BUILT_IN_QUOTES, ...userQuotes]
    .map((q) => ({ q, k: hash(`${year}:${q.id}`) }))
    .sort((a, b) => a.k - b.k);
  return ordered[(day - 1) % ordered.length].q;
}
