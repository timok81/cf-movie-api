const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  uuid = require("uuid");

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Timo",
    favorites: [3],
  },
];

let directors = [
  {
    name: "Joel Coen",
    description:
      "Joel Daniel Coen (born November 29, 1954) and Ethan Jesse Coen (born September 21, 1957) together known as the Coen brothers, are an American filmmaking duo. Their films span many genres and styles, which they frequently subvert or parody. Among their most acclaimed works are Blood Simple (1984), Raising Arizona (1987), Miller's Crossing (1990), Barton Fink (1991), Fargo (1996), The Big Lebowski (1998), O Brother, Where Art Thou? (2000), No Country for Old Men (2007), A Serious Man (2009), True Grit (2010) and Inside Llewyn Davis (2013).",
    yearBirth: 1954,
  },
  {
    name: "Ridley Scott",
    description:
      "Sir Ridley Scott (born 30 November 1937) is an English film director and producer. He directs films in the science fiction, crime, and historical drama genres, with an atmospheric and highly concentrated visual style. He ranks among the highest-grossing directors, with his films grossing a cumulative $5 billion worldwide. He has received many accolades, including the BAFTA Fellowship for Lifetime Achievement in 2018, two Primetime Emmy Awards, and a Golden Globe Award. He was knighted by Queen Elizabeth II in 2003, and appointed a Knight Grand Cross by King Charles III in 2024.",
    yearBirth: 1937,
  },
  {
    name: "Ethan Coen",
    description:
      "Joel Daniel Coen (born November 29, 1954)[1] and Ethan Jesse Coen (born September 21, 1957),[2] together known as the Coen brothers (/ˈkoʊən/), are an American filmmaking duo. Their films span many genres and styles, which they frequently subvert or parody.[3] Among their most acclaimed works are Blood Simple (1984), Raising Arizona (1987), Miller's Crossing (1990), Barton Fink (1991), Fargo (1996), The Big Lebowski (1998), O Brother, Where Art Thou? (2000), No Country for Old Men (2007), A Serious Man (2009), True Grit (2010) and Inside Llewyn Davis (2013).",
    yearBirth: 1957,
  },
  {
    name: "Denis Villeneuve",
    description:
      "Denis Villeneuve (French: [dəni vilnœv]; born October 3, 1967) is a Canadian filmmaker. He has received seven Canadian Screen Awards as well as nominations for three Academy Awards, five BAFTA Awards, and two Golden Globe Awards. Villeneuve's films have grossed more than $1.8 billion worldwide.",
    yearBirth: 1967,
  },
  {
    name: "Peter Jackson",
    description:
      "Sir Peter Robert Jackson ONZ KNZM (born 31 October 1961) is a New Zealand filmmaker. He is best known as the director, writer and producer of the Lord of the Rings trilogy (2001–2003) and the Hobbit trilogy (2012–2014), both of which are adapted from the novels of the same name by J. R. R. Tolkien. Other notable films include the critically lauded drama Heavenly Creatures (1994), the horror comedy The Frighteners (1996), the epic monster remake film King Kong (2005), the World War I documentary film They Shall Not Grow Old (2018) and the documentary The Beatles: Get Back (2021). He is the fifth-highest-grossing film director of all-time, his films having made over $6.5 billion worldwide.",
    yearBirth: 1961,
  },
  {
    name: "Mamoru Oshii",
    description:
      "Mamoru Oshii (押井 守, Oshii Mamoru, born 8 August 1951) is a Japanese filmmaker, television director and writer. Famous for his philosophy-oriented storytelling, Oshii has directed a number of acclaimed anime films, including Urusei Yatsura 2: Beautiful Dreamer (1984), Angel's Egg (1985), Patlabor 2: The Movie (1993), and Ghost in the Shell (1995). He also holds the distinction of directing the first ever OVA, Dallos (1983). As a writer, Oshii has worked as a screenwriter, and occasionally as a manga writer and novelist. His most notable works as a writer include the manga Kerberos Panzer Cop (1988–2000) and its feature film adaptation Jin-Roh: The Wolf Brigade (1999).",
    yearBirth: 1951,
  },
  {
    name: "Hayao Miyazaki",
    description:
      "Hayao Miyazaki (宮崎 駿 or 宮﨑 駿, Miyazaki Hayao, [mijaꜜzaki hajao]; born January 5, 1941) is a Japanese animator, filmmaker, and manga artist. He co-founded Studio Ghibli and serves as its honorary chairman. Over the course of his career, Miyazaki has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films, and is widely regarded as one of the most accomplished filmmakers in the history of animation",
    yearBirth: 1941,
  },
  {
    name: "James Cameron",
    description:
      "James Francis Cameron CC (born August 16, 1954) is a Canadian filmmaker. He is a major figure in the post-New Hollywood era and often uses novel technologies with a classical filmmaking style. He first gained recognition for writing and directing The Terminator (1984), and found further success with Aliens (1986), The Abyss (1989), Terminator 2: Judgment Day (1991), and True Lies (1994), as well as Avatar (2009) and its sequels. He directed, wrote, co-produced, and co-edited Titanic (1997), winning Academy Awards for Best Picture, Best Director, and Best Film Editing. He is a recipient of various other industry accolades, and three of his films have been selected for preservation in the National Film Registry by the Library of Congress.",
    yearBirth: 1954,
  },
  {
    name: "Takashi Yamazaki",
    description:
      "Takashi Yamazaki (山崎 貴, Yamazaki Takashi, born June 12, 1964) is a Japanese filmmaker and visual effects supervisor. Known for his blockbusters featuring advanced visual effects, he is considered a leading figure in the Japanese film industry.[1] Yamazaki is the recipient of multiple accolades, including an Academy Award, eight Japanese Academy Awards, five Nikkan Sports Film Awards, two Hochi Film Awards, and an Asian Film Award. His films have collectively grossed over $523 million worldwide.",
    yearBirth: 1964,
  },
  {
    name: "Adam Mckay",
    description:
      "Adam McKay (born April 17, 1968) is an American screenwriter, producer, and director. McKay began his career as a head writer for the NBC sketch comedy show Saturday Night Live (SNL) from 1995 to 2001. After leaving SNL, McKay co-wrote with comedian Will Ferrell on his comedy films Anchorman: The Legend of Ron Burgundy (2004), Talladega Nights: The Ballad of Ricky Bobby (2006), and The Other Guys (2010). Ferrell and McKay later co-wrote and co-produced many television series and films, with McKay himself co-producing their website Funny or Die through their company, Gary Sanchez Productions.",
    yearBirth: 1968,
  },
  {
    name: "Rian Johnson",
    description:
      "Rian Craig Johnson (born December 17, 1973) is an American filmmaker. He made his directorial debut with the neo-noir mystery film Brick (2005), which received positive reviews and grossed nearly $4 million on a $450,000 budget. Transitioning to higher-profile films, Johnson achieved mainstream recognition for writing and directing the science-fiction thriller Looper (2012) to critical and commercial success. Johnson landed his largest project when he wrote and directed the space opera Star Wars: The Last Jedi (2017), which grossed over $1 billion. He returned to the mystery genre with Knives Out (2019) and its sequel Glass Onion (2022), both of which earned him Academy Award nominations for Best Original Screenplay and Best Adapted Screenplay, respectively.",
    yearBirth: 1973,
  },
];

let genres = [
  {
    name: "Science fiction",
    description:
      "Defined by a combination of imaginative speculation and a scientific or technological premise, making use of the changes and trajectory of technology and science.",
  },
  {
    name: "Fantasy",
    description:
      "Defined by situations that transcend natural laws and/or by settings inside a fictional universe, with narratives that are often inspired by or involve human myths.",
  },
  {
    name: "Mystery",
    description: "Revolves around the solution of a problem or a crime.",
  },
  {
    name: "Action",
    description:
      "Associated with particular types of spectacle (e.g., explosions, chases, combat).",
  },
  {
    name: "Comedy",
    description:
      "Defined by events that are primarily intended to make the audience laugh.",
  },
];

let movies = [
  {
    id: 1,
    name: "Blade Runner",
    director: "Ridley Scott",
    released: 1982,
    genre: ["Science fiction"],
    description:
      "Blade Runner is a 1982 science fiction film directed by Ridley Scott from a screenplay by Hampton Fancher and David Peoples. Starring Harrison Ford, Rutger Hauer, Sean Young, and Edward James Olmos, it is an adaptation of Philip K. Dick's 1968 novel Do Androids Dream of Electric Sheep? The film is set in a dystopian future Los Angeles of 2019, in which synthetic humans known as replicants are bio-engineered by the powerful Tyrell Corporation to work on space colonies. When a fugitive group of advanced replicants led by Roy Batty (Hauer) escapes back to Earth, burnt-out cop Rick Deckard (Ford) reluctantly agrees to hunt them down",
    imageURL: "",
  },
  {
    id: 2,
    name: "Lord of the rings",
    director: "Peter Jackson",
    released: 2001,
    genre: ["Fantasy"],
    description:
      "The Lord of the Rings is a trilogy of epic fantasy adventure films directed by Peter Jackson, based on the novel The Lord of the Rings by English author J. R. R. Tolkien. The films are titled identically to the three volumes of the novel: The Fellowship of the Ring (2001), The Two Towers (2002), and The Return of the King (2003). Produced and distributed by New Line Cinema with the co-production of WingNut Films, the films feature an ensemble cast including Elijah Wood, Ian McKellen, Liv Tyler, Viggo Mortensen, Sean Astin, Cate Blanchett, John Rhys-Davies, Christopher Lee, Billy Boyd, Dominic Monaghan, Orlando Bloom, Hugo Weaving, Andy Serkis, and Sean Bean. ",
    imageURL: "",
  },
  {
    id: 3,
    name: "Dune",
    director: "Denis Villeneuve",
    released: 2021,
    genre: ["Science fiction"],
    description:
      "Dune (titled on-screen as Dune: Part One) is a 2021 American epic science fiction film directed and co-produced by Denis Villeneuve, who co-wrote the screenplay with Jon Spaihts, and Eric Roth. It is the first of a two-part adaptation of the 1965 novel by Frank Herbert. Set in the distant future, the film follows Paul Atreides as his family, the noble House Atreides, is thrust into a war for the deadly and inhospitable desert planet Arrakis.",
    imageURL: "",
  },
  {
    id: 4,
    name: "Ghost in the shell",
    director: "Mamoru Oshii",
    released: 1995,
    genre: ["Science fiction"],
    description:
      "Ghost in the Shell[a] is a 1995 adult Japanese-animated tech noir cyberpunk action thriller film[8][9] directed by Mamoru Oshii from a screenplay by Kazunori Itō. The film is based on the 1989–90 manga of the same name by Masamune Shirow. It stars the voices of Atsuko Tanaka, Akio Ōtsuka, and Iemasa Kayumi. It is a Japanese-British international co-production between Kodansha, Bandai Visual and Manga Entertainment, with animation provided by Production I.G.",
    imageURL: "",
  },
  {
    id: 5,
    name: "Knives out",
    director: "Rian Johnson",
    released: 2020,
    genre: ["Mystery"],
    description:
      "Knives Out is a 2019 American mystery film written and directed by Rian Johnson. Daniel Craig leads an eleven-actor ensemble cast as Benoit Blanc, a famed private detective who is summoned to investigate the death of the bestselling author Harlan Thrombey (Christopher Plummer). Police rule Harlan's death a suicide but Blanc suspects foul play, and investigates to find the true cause of his death. Johnson produced Knives Out with his longtime collaborator Ram Bergman. Funding came from MRC and a multi-million-dollar tax subsidy from the Government of Massachusetts.",
    imageURL: "",
  },
  {
    id: 6,
    name: "Spirited away",
    director: "Hayao Miyazaki",
    released: 2001,
    genre: ["Fantasy"],
    description:
      "Spirited Away (Japanese: 千と千尋の神隠し, Hepburn: Sen to Chihiro no Kamikakushi, lit. 'Sen and Chihiro's Spiriting Away') is a 2001 Japanese animated fantasy film written and directed by Hayao Miyazaki. Spirited Away tells the story of Chihiro 'Sen' Ogino, a ten-year-old girl who, while moving to a new neighborhood, inadvertently enters the world of kami (spirits of Japanese Shinto folklore). After her parents are turned into pigs by the witch Yubaba, Chihiro takes a job working in Yubaba's bathhouse to find a way to free herself and her parents and return to the human world. The film was animated by Studio Ghibli for Tokuma Shoten, Nippon Television Network, Dentsu, Buena Vista Home Entertainment, Tohokushinsha Film, and Mitsubishi and distributed by Toho. ",
    imageURL: "",
  },
  {
    id: 7,
    name: "The Abyss",
    director: "James Cameron",
    released: 1989,
    genre: ["Science fiction"],
    description:
      "The Abyss is a 1989 American science fiction film written and directed by James Cameron and starring Ed Harris, Mary Elizabeth Mastrantonio, and Michael Biehn. When an American submarine sinks in the Caribbean, a US search and recovery team works with an oil platform crew, racing against Soviet vessels to recover the boat. Deep in the ocean, they encounter something unexpected. The film was released on August 9, 1989, receiving generally positive reviews and grossed $90 million. It was nominated for four Academy Awards and won the Academy Award for Best Visual Effects.",
    imageURL: "",
  },
  {
    id: 8,
    name: "Godzilla minus one",
    director: "Takashi Yamazaki",
    released: 2023,
    genre: ["Science fiction", "Action"],
    description:
      "Godzilla Minus One (Japanese: ゴジラ-1.0, Hepburn: Gojira Mainasu Wan) is a 2023 Japanese epic[i] kaiju film written, directed, and with visual effects by Takashi Yamazaki. It is the 37th film in the Godzilla franchise, Toho's 33rd Godzilla film, and the fifth installment of the Reiwa era.[b] Set in postwar Japan, the film stars Ryunosuke Kamiki as a former kamikaze pilot suffering from post-traumatic stress disorder after encountering a giant monster known as 'Godzilla'. The supporting cast includes Minami Hamabe, Yuki Yamada, Munetaka Aoki, Hidetaka Yoshioka, Sakura Ando, and Kuranosuke Sasaki.",
    imageURL: "",
  },
  {
    id: 9,
    name: "Anchorman",
    director: "Adam McKay",
    released: 2004,
    genre: ["Comedy"],
    description:
      "Anchorman: The Legend of Ron Burgundy is a 2004 American satirical comedy film directed by Adam McKay in his directorial debut, produced by Judd Apatow, starring Will Ferrell and Christina Applegate and written by McKay and Ferrell. The first installment in the Anchorman series, the film is a tongue-in-cheek take on the culture of the 1970s, particularly the new Action News format. It portrays a San Diego television station where Ferrell's title character clashes with his new female counterpart.",
    imageURL: "",
  },
  {
    id: 10,
    name: "The Big Lebowsky",
    director: "Joel & Ethan Coen",
    description:
      "The Big Lebowski (/ləˈbaʊski/) is a 1998 crime comedy film written, directed, produced and co-edited by Joel and Ethan Coen. It follows the life of Jeffrey 'The Dude' Lebowski (Jeff Bridges), a Los Angeles slacker and avid bowler. He is assaulted as a result of mistaken identity then learns that a millionaire, also named Jeffrey Lebowski (David Huddleston), was the intended victim. The millionaire Lebowski's trophy wife is supposedly kidnapped and millionaire Lebowski commissions The Dude to deliver the ransom to secure her release. The plan goes awry when the Dude's friend Walter Sobchak (John Goodman) schemes to keep the ransom money for the Dude and himself. Sam Elliott, Julianne Moore, Steve Buscemi, John Turturro, Philip Seymour Hoffman, Tara Reid, David Thewlis, Peter Stormare, Jimmie Dale Gilmore, Jon Polito and Ben Gazzara also appear in supporting roles. ",
    released: 1998,
    genre: ["Comedy"],
    imageURL: "",
  },
];

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome to the movie database!");
});

//Returns all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//Returns a movie by name
app.get("/movies/:name", (req, res) => {
  const movie = movies.find(
    (movie) => movie.name.toLowerCase() === req.params.name.toLowerCase()
  );
  if (movie) res.status(200).json(movie);
  else res.status(400).send("Movie not found");
});

//Returns a genre by name
app.get("/genres/:name", (req, res) => {
  const genre = genres.find(
    (genre) => genre.name.toLowerCase() === req.params.name.toLowerCase()
  );
  if (genre) res.status(200).json(genre);
  else res.status(400).send("Genre not found");
});

//Returns a director by name
app.get("/directors/:name", (req, res) => {
  const director = directors.find(
    (director) => director.name.toLowerCase() === req.params.name.toLowerCase()
  );
  if (director) res.status(200).json(director);
  else res.status(400).send("Director not found");
});

//Adds a new user account
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else res.status(400).send("Username is required");
});

//Updates username
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else res.status(400).send("User not found");
});

//Removes user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} succesfully deleted`);
  } else res.status(400).send("User not found");
});

//Adds a movie to user's favorites
app.patch("/users/:userId/favorites/:movieId", (req, res) => {
  const { userId, movieId } = req.params;
  const user = users.find(user => user.id == userId);
  const movie = movies.find(movie => movie.id == movieId)

  if (user) {
    user.favorites.push(movie);
    res
      .status(200)
      .send(`Movie ${movie.name} succesfully added to user ${userId} favorites`);
  } else res.status(400).send("User not found");
});

//Deletes a movie from favorites
app.delete("/users/:userId/favorites/:movieId", (req, res) => {
  const { userId, movieId } = req.params;
  const user = users.find(user => user.id == userId);
  const movie = movies.find(movie => movie.id == movieId)

  if (user) {
    user.favorites = user.favorites.filter((movie) => movieId !== movie.id);
    res
      .status(200)
      .send(
        `Movie ${movie.name} succesfully deleted from user ${userId} favorites`
      );
  } else res.status(400).send("User not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  req.status(500).send("Error");
});

app.listen(8080, () => {
  console.log("Listening to port 8080");
});
