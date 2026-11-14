# Copy deck

Every word on the page, in one place. Updated 2026-11-13.

To change a guide line, edit `content/tour.json`. This file is the readable copy and is generated from it.

## How the tour works

- **30 steps.** Space, the right arrow, a tap, or Next moves forward. The left arrow or Back jumps back.
- **Scrolling is paused during the tour.** The page moves itself to each stop.
- **Just looking** turns the tour off and switches to a plain page: ordinary scrolling, light motion, no pinned scenes. Tapping the guide turns the tour and the full scenes back on.
- **Roaming.** The guide stands near what it is talking about instead of always at the bottom. In `tour.json`, `"roam": false` puts it back on the floor everywhere. `stand` on a beat is a hand-placed spot.
- **Done talking.** When a line finishes, the Next button turns orange, shakes once, and pulses.
- **Pauses.** In `tour.json`, `{p}` is a short pause and `{pp}` is a long one. They sit before punchlines. Below they show as [pause] and [long pause].
- **Actions.** Text between stars, like `*tsk tsk*`, shows above the guide's head. It is not typed into the bubble.
- **Spotlight.** On some steps one part of the page stays lit and the rest dims.

## Page copy (first person)

**Lobby.** Hey, my name’s Aathraey.

I study cognitive science at UCLA, and I’m interested in the psychology behind how people think and what they do.

I love experimenting with AI tools and building products people use. I also enjoy automating repetitive work with my own personal assistants. Always happy to connect with others building with AI or testing its limits.

Placard: Aathraey Shrikanth · Los Angeles. AI product management.

**AI content system.** I built a following across 4 social media platforms talking about AI automation by using AI automation.

Gallery caption: These are real carousels and frames from real reels. The agents made them, and I reviewed every one.

**AI lead generation.** Find local businesses, qualify them, personalize outreach, and send.

**MobLife.** A habit tracker built around quests & rewards to make self-improvement an addiction. Built from feedback across 50+ interviews.

**Promly.** Redesigned their homepage & generated more app downloads.

**Amethyst.** Conducted a product teardown of the popular screen-time app Opal and recreated a more effective prototype.

**Support ticket routing agent.** I built an agent that reads Freshdesk tickets every 15 minutes, asks for missing details, and routes each one to the right queue.

**Skool of Focus.** I ran a productivity community for a year. I did 30+ interviews to find the problems that kept coming up, then built an AI-assisted content and lead system around what I heard.

**Small exhibits.** Things I automated because I didn’t feel like doing them.

Dining hall texter: Texts me high-protein options across my college dining halls every morning.

Class seat watcher: An agent that watches a full class 24/7 and calls me when a seat opens.

**Outside of work.** Four cards, left to right, in the order the guide talks about them.

1. 5:30 workouts: I'm a morning person, so I wake up at 5:30 every day. Exercise, meditation, a cold shower. Then I get to work. *(Your words, 2026-11-14.)*

2. Watching the sunrise: Most people like seeing sunsets, but being a morning person, seeing the sunrise is a huge part of my day, even if it's just for a minute.

3. Baking with friends: I'm actually horrible at baking, so technically, I just give moral support and still get to eat anyway. *(Your words, 2026-11-14.)*

4. Health & productivity: I'm always trying to find science-backed ways to improve my health and focus. *(Your words, 2026-11-14.)*

The side-questing card was removed on 2026-11-13 at your request.

**Exit.** Let’s talk! If you're building with AI, curious about health/productivity, or just want to chat, hit me up!

Footer: Claudelius is fan art. This site is not affiliated with Anthropic, obviously.

## The guide's script (Claudelius)

**Lobby**

1. Hi. I'm Claudelius. [pause] Aathraey built me so he wouldn't have to introduce himself.
2. He calls that efficient. *eye roll* [pause] You'll notice a pattern.

**Lobby, at the portrait**

3. This is him. UCLA, cognitive science. He studies why people do things. [long pause] Then he builds apps so they don’t do those things. *(lights up `#portrait`)*

**The content machine**

4. He says he's proud to be lazy.
5. So he built 5 AI agents to automate his content creation for him. [pause] 13 posts a day. [long pause] That is more work than writing 13 posts a day. [long pause] No one has told him.
6. These are his carousels. He reviewed every one. [long pause] A lot of work for someone who calls himself lazy.

**The lead engine**

7. This is his AI lead generation system. [pause] It found 1,325 local businesses in 2 hours.
8. It wrote 838 cold emails. [pause] It sent about 123.
9. He says "about 123." [pause] He could have said 150. [long pause] I would have said 150.

**MobLife**

10. At 8 he memorized 700+ Pokemon. [pause] Names, types, regions.
11. He calls that [pause] "not the best use of my memory."
12. Then he built a habit tracker where you catch monsters. [long pause] So I guess it worked out.
13. He started by doing 50+ interviews first. The boss battles were really the beta testers' idea.
14. Technically mine, [pause] since I was the one who summarized all those call transcripts for him. *tsk tsk*
15. Somehow he generated 100+ installs in just a week. [long pause] That's how you know it wasn't just him, his brother, and his parents downloading it.

**Promly**

16. This is Promly. [pause] He audited 16 pages of their website. Then handed over 12 ideas and 2 prototypes. [long pause] All thanks to my awesome web design skills, by the way. *(lights up `#work-promly`)*

**Amethyst**

17. This is Amethyst. [pause] He liked a screen-time app called Opal. [pause] But he’s broke and can’t pay the subscription. [long pause] So he took it apart, ended up finding 3 problems, and built his own. [pause] He does that often. *(lights up `#work-amethyst`)*

**Support agent**

18. This is his support ticket routing agent. [pause] It reads support tickets every 15 minutes. [pause] If a ticket is vague, it’ll ask for details politely. *(lights up `#work-support`)*

**Skool of Focus**

19. This is Skool of Focus. [pause] He ran a community of 120+ people for a year and did 30+ interviews to learn what they needed. [pause] He does that a lot. The interviewing. [long pause] Then he makes me analyze everything. *(lights up `#work-skool`)*

**Small exhibits**

20. He’s also lazy with eating. At UCLA, he didn't want to check the dining hall menu. So he made an AI agent text him the high-protein options. Saves him 3 minutes each morning. [long pause] Who gave him a Claude subscription? *(lights up `#small-menu`)*
21. He also built an agent to watch for an open seat in a full class. It found one. It called him. [pause] He was asleep. [long pause] So it called his parents and they signed up for him. *(lights up `#small-seat`)*
22. Then he decided he didn't want the class. [long pause] And they wonder why Mythos won’t be released to kids like him. *(lights up `#small-seat`)*

**Outside of work**

23. That's the work. [long pause] Here's what he does outside of it.
24. He wakes up at 5:30. [pause] On purpose. [long pause] I guess I can respect it. *(lights up `#life-wake`)*
25. Most people like sunsets. He likes sunrises. [pause] Of course he does. 5am… *rolls eyes* *(lights up `#life-sun`)*
26. He tried baking once. Ended up making brownies so hard a friend couldn’t finish chewing after a whole 45-minute class. [long pause] Safe to say, he follows recipes now. [pause] Mostly. *(lights up `#life-bake`)*
27. He once got distracted from work because of a distracting app. So he ended up coding a full productivity chrome extension to block it… for good. [long pause] Someone has to tell him that not everything requires building an app. *(lights up `#life-health`)*

**Exit**

28. That's Aathraey, [pause] the most lazy, yet productive guy I know.
29. Oh, did I mention he's looking for an internship? [long pause] He will build a new AI agent for your business, whether you ask or not. [long pause] Then he'll insist that you need it or you're falling behind.
30. You should email him. [long pause] He'll be awake.

**"Ask Claudelius" chips**

- *What's he best at?* Talking to users before building. 50+ interviews for one app. [long pause] Overkill? Absolutely, but that’s Aathraey.
- *What’s his availability?* He's a first-year at UCLA, graduating June 2030. He's looking for product internships. [pause] He’s taking remote work during the school year and is open to relocating anywhere in the U.S. for summer.
- *Any weaknesses?* Did I mention he’s lazy? [pause] He’ll build a system for everything. [long pause] Besides that, if you wave a Claude subscription in front of his face, you basically own him.
- *Tell me a joke.* Why did the scarecrow get promoted? [long pause] He was outstanding in his field. [long pause] Aathraey told that one on Halloween. Nobody laughed… [pause] naturally. [long pause] He still got candy (he really loves Sour Patch by the way).
- *What happens if I tap on you?* Please don't… [long pause] You don't want to find out.

**Poking the guide.** These play in this order, then start over. I wrote these, so edit them freely.

1. Please don't poke the guide. *(reaction: hop)*
2. Yes, I blink now. [pause] It cost extra. *(reaction: blink)*
3. I'm keeping count. [long pause] It's not looking good for you. *(reaction: facepalm)*
4. Poking me does not make the tour go faster. *(reaction: flip)*
5. Fine. [pause] I'll stand over here. *(reaction: walk)*
6. You followed me. [long pause] Bold. *(reaction: hop)*
7. Every poke costs Aathraey a token. [long pause] So keep going. *(reaction: wave)*
8. I'm sitting down. [pause] This is a protest. *(reaction: sit)*
9. Here's a spin. [long pause] That's the whole trick. *(reaction: spin)*
10. Aathraey built a button for everything. [long pause] He did not build one to stop you. *(reaction: deadpan)*
11. I'm going under the floor. [pause] Don't follow me. *(reaction: duck)*
12. The tour is that way. [pause] Follow the hand. *(reaction: point)*
13. That's all my material. [long pause] We're starting over. *(reaction: shrug)*

**Other asides**

- *(pressing Next very fast)* Slow down. [pause] I didn’t blow this week’s Fable usage for nothing.
- *(wakes up)* I wasn't asleep. [pause] I was thinking about poses.
- *(returning visitor)* You came back. [long pause] I can’t think of any reason why. There’s really a lot of better things you could be doing now.
- *(404 page)* This room doesn't exist. Aathraey hasn't built it yet. Give him a weekend.
- *(picks Just looking)* Fine. I'll be in the corner. [long pause] I will be judging though.

## Wording I changed in your script, per your notes

1. The agents line is now one step: "So he built 5 AI agents to automate his content creation for him. 13 posts a day." Then the punchline, in the same step. "13 posts a day" is on that screen while he says it. The separate 13 posts animation is gone.
2. Promly, Amethyst, the support agent, and Skool of Focus each open with "This is ...".
3. "The boss battles were the beta testers' idea." Then "Technically mine, ..." is its own step.
4. The "about 123" line ends on "I would have said 150." The "honest to employers" sentence is cut.
5. The Skool of Focus line joins two sentences into one to keep it brief.
6. "Imagine how much money he’d waste." (was "blow", per your note).
7. Handoff into Outside of work, your wording: "That's the work. Here's what he does outside of it."
10. The lead engine opens with "This is his AI lead generation system."
11. "Not me though." is cut from the end of the app line.
8. "(he told me to say this)" now comes after a long pause, with *whispers* above his head, in smaller italic grey type.
9. Earlier typo fixes: "its good" to "it's good", and "*scoffs." to "*scoffs*".

## Claim ledger

Source for all rows: `Resume - Aathraey Shrikanth.pdf` (Nov 11, 2026).

| Claim on the page | Resume wording |
|---|---|
| 13 posts a day: 7 X posts, 1 LinkedIn post, 2 YouTube Shorts, 2 Instagram Reels, 1 carousel | "creates 13 posts per day across 4 different social media platforms" and "7 X posts, 1 LinkedIn post, 2 YouTube Shorts, 2 Instagram Reels, and 1 carousel" |
| 30K YouTube views in 7 days | "generate 30K YouTube views in 7 days" |
| 1,325 businesses found in 2 hours | "scraped 1,325 local businesses within just 2 hours" |
| 838 enriched + drafted | "quality scores for 838 businesses" and "draft 838 personalized cold emails" |
| ~123 messages sent | "sent about 123 cold messages" |
| 50+ interviews, 100+ installs, 5 beta testers | MobLife bullets |
| 16 pages, 12 ideas, 2 prototypes | Promly bullets |
| 3 journey issues | "discover 3 key issues in the user journey" |
| 4 queues, every 15 minutes, 25 test scenarios | Support agent bullets |
| 30+ interviews, 120+ members, +84% inbound leads in 30 days | Skool of Focus bullets |

## Lines to double-check before this goes live

Confirmed by you on 2026-11-14: the 100+ installs in one week, 30K YouTube views in 7 days, 1 LinkedIn post, and the Promly app downloads claim.

1. **All actions are shown above the head only** (eye roll, tsk tsk, scoffs, rolls eyes, whispers). You asked for this on tsk tsk. I applied it to all of them so they behave the same.
2. **The two small exhibits still carry the label "Personal agent,"** and the class seat watcher still reads "An agent that watches a full class 24/7." You asked to drop "agent" from the dining hall text only, so I left these.
