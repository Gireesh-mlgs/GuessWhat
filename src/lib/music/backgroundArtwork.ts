/**
 * Curated list of high-resolution album covers from official music CDN
 * used for the cinematic animated background wall on the GuessWhat homepage.
 */

export interface BackgroundArtwork {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const BACKGROUND_ARTWORK: BackgroundArtwork[] = [
  // ROW 1 UNIQUE ALBUMS (0-7)
  {
    id: 'art-blonde',
    title: 'Blonde',
    artist: 'Frank Ocean',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/42/62/50/426250f9-7e39-f907-687c-442caa436636/dj.nhptxziz.jpg/600x600bb.jpg',
  },
  {
    id: 'art-damn',
    title: 'DAMN.',
    artist: 'Kendrick Lamar',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ab/16/ef/ab16efe9-e7f1-66ec-021c-5592a23f0f9e/17UMGIM88793.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-happier',
    title: 'Happier Than Ever',
    artist: 'Billie Eilish',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/02/b7/6d/02b76dd3-4006-bc65-9f33-33b70a95222a/21UMGIM36684.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-ram',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e8/43/5f/e8435ffa-b6b9-b171-40ab-4ff3959ab661/886443919266.jpg/600x600bb.jpg',
  },
  {
    id: 'art-1989',
    title: '1989',
    artist: 'Taylor Swift',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8e/35/6c/8e356cc2-0be4-b83b-d29e-b578623df2ac/23UM1IM34052.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-afterhours',
    title: 'After Hours',
    artist: 'The Weeknd',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-sos',
    title: 'SOS',
    artist: 'SZA',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/50/fa/17/50fa1760-8a36-5cef-93bf-aab5b5257b18/196871766913.jpg/600x600bb.jpg',
  },

  // ROW 2 UNIQUE ALBUMS (8-15)
  {
    id: 'art-thriller',
    title: 'Thriller',
    artist: 'Michael Jackson',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg',
  },
  {
    id: 'art-rumours',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg/600x600bb.jpg',
  },
  {
    id: 'art-wall',
    title: 'The Wall',
    artist: 'Pink Floyd',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/17/ec/3e17ec6d-f980-c64f-19e0-a6fd8bbf0c10/886445635850.jpg/600x600bb.jpg',
  },
  {
    id: 'art-ziggy',
    title: 'Ziggy Stardust',
    artist: 'David Bowie',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/5f/fa/56/5ffa56c2-ea1f-7a17-6bad-192ff9b6476d/825646124206.jpg/600x600bb.jpg',
  },
  {
    id: 'art-abbey',
    title: 'Abbey Road',
    artist: 'The Beatles',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/48/53/43/485343e3-dd6a-0034-faec-f4b6403f8108/13UMGIM63890.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-nevermind',
    title: 'MTV Unplugged In New York',
    artist: 'Nirvana',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/46/24/33/462433f9-ee74-2d60-4538-859826a7bed7/00720642472729.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-ledzep',
    title: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5c/15/9b/5c159b27-95ca-b9a7-84e3-28e795fffd39/dj.kvkrpptq.jpg/600x600bb.jpg',
  },
  {
    id: 'art-queen',
    title: 'Greatest Hits',
    artist: 'Queen',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/600x600bb.jpg',
  },

  // ROW 3 UNIQUE ALBUMS (16-23)
  {
    id: 'art-dua',
    title: 'Future Nostalgia',
    artist: 'Dua Lipa',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e9/c5/a8/e9c5a8a0-d698-137b-2e85-cf3a8d9548f8/190295303372.jpg/600x600bb.jpg',
  },
  {
    id: 'art-radiohead',
    title: 'OK Computer',
    artist: 'Radiohead',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/07/60/ba/0760ba0f-148c-b18f-d0ff-169ee96f3af5/634904078164.png/600x600bb.jpg',
  },
  {
    id: 'art-coldplay',
    title: 'A Rush of Blood to the Head',
    artist: 'Coldplay',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b9/b4/2a/b9b42ad1-1e25-5096-da43-497a247e69a3/190295978051.jpg/600x600bb.jpg',
  },
  {
    id: 'art-eminem',
    title: 'The Eminem Show',
    artist: 'Eminem',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/dd/5c/e6/dd5ce621-f7d2-f767-7a08-e7a7eaa7870b/00602537526994.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-miles',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/7f/9f/d6/mzi.vtnaewef.jpg/600x600bb.jpg',
  },
  {
    id: 'art-am',
    title: 'AM',
    artist: 'Arctic Monkeys',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/69/9c/b5/699cb5d6-115c-ff73-9d26-e57ea4350d72/887828031795.png/600x600bb.jpg',
  },
  {
    id: 'art-gorillaz',
    title: 'Demon Days',
    artist: 'Gorillaz',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1c/0f/81/1c0f818a-e458-dd84-6f1b-ccbdf5fe14d6/825646291045.jpg/600x600bb.jpg',
  },
  {
    id: 'art-travis',
    title: 'ASTROWORLD',
    artist: 'Travis Scott',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e7/49/8f/e7498f65-df8f-bead-d6e3-2a8d4d642a79/886447235317.jpg/600x600bb.jpg',
  },

  // ROW 4 UNIQUE ALBUMS (24-31)
  {
    id: 'art-graduation',
    title: 'Graduation',
    artist: 'Kanye West',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/39/25/2d/39252d65-2d50-b991-0962-f7a98a761271/00602517483507.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-beyonce',
    title: 'RENAISSANCE',
    artist: 'Beyoncé',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/fe/ba/43/feba43be-99e8-ad8c-9fad-1bfdea7a4e98/196589344267.jpg/600x600bb.jpg',
  },
  {
    id: 'art-adele',
    title: '21',
    artist: 'Adele',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg',
  },
  {
    id: 'art-drake',
    title: 'Scorpion',
    artist: 'Drake',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/6d/8f/bb6d8f67-6d04-10b5-dd62-eb5809ac54fc/00602567879152.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-lorde',
    title: 'Melodrama',
    artist: 'Lorde',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/58/11/b1/5811b172-e180-25a6-69e6-4385fbbfb5dc/17UM1IM02207.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-bruno',
    title: '24K Magic',
    artist: 'Bruno Mars',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e3/47/a0/e347a0cc-87ce-5d05-d560-176c7d48f66e/075679904119.jpg/600x600bb.jpg',
  },
  {
    id: 'art-post',
    title: "Hollywood's Bleeding",
    artist: 'Post Malone',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/13/27/6c13279a-399b-2631-3cb2-6233a91d7a53/19UMGIM78325.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'art-olivia',
    title: 'SOUR',
    artist: 'Olivia Rodrigo',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/ed/8c/02ed8cab-c089-2fdd-7ce6-ab334a9a4e19/21UMGIM26093.rgb.jpg/600x600bb.jpg',
  },
];
