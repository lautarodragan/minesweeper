# Minesweeper

Solution to the Amazon challenge.

Deployed and playable at https://minesweeper.tarokun.io/.

The game has two modes:
- Offline mode: runs completely in the browser. It's way faster, but has no persistence and can be cheated easily. If I added a highscore screen, wouldn't count.
- Online mode: requires signing up. Uses the API. State is persisted on every action, browser can be safely closed. Can go back and pick up any past game.

The online mode runs rather slowly due to using the free tier of MongoDB Atlas and Heroku, and not having any optimizations whatsoever.  

## How to Play

The goal of the game is to find all of the mines in the board... without triggering any!

You have three tools at your disposal to achieve this goal:

### Reveal

Left-click on unknown tiles to reveal them. 

If the tile was clear, meaning it had no mine in it, it'll be marked so. This means one step closer to winning.

💣  Be careful, though! If the tile had a mine in it, it'll be triggered. This means game-over.

### 🏘️ Neighbours 

Revealed clear tiles may display a number in them. This is the number of mines immediately surrounding said tile. Use this information to your advantage.

### Flags

Right-click on an unrevealed tile you suspect has a mine in it to flag it.

Flagged mines can't be left-clicked, which prevents accidentally triggering a mine, and enable _sweeps_.

### Sweep

Clicking on a tile that has a number in it will trigger a _sweep_.

A sweep works this way:

If you have flagged every surrounding mine correctly, the sweep will automatically reveal all clear tiles surrounding the tile you clicked on.

💣 But if you incorrectly left an unrevealed mine unflagged and flagged a clear tile instead, the mine will be triggered and it's game over.

### Winning

The game is won when the only unrevealed tiles are mines and they are all flagged. 

## Implementation

The game runs on the free tiers of Netlify, Heroku, MongoDB Atlas and Auth0.

It consists of a ReactJS SPA, a NodeJS API and a stand-alone library.

The library has all the abstract Minesweeper logic, and is used both in the frontend, for offline games, and in the backend. It has no run-time dependencies, is framework-agnostic and all exported functions are pure. It's written in TypeScript and exports type definitions along with the compiled JavaScript. It's published to npm at https://www.npmjs.com/@taros-minesweeper/lib. 

The API is very straight-forward and has a very simple layered architecture. All endpoints require authentication, which is expected in the form of a JWT signed with a private key which matches the Signing Certificate that's hard-coded in the Server file of the backend. There are only four exposed endpoints: `GET /games`, `GET /games/:id`, `POST /games` and `PUT /games/:gameId/cells/:cellId`. The first three endpoints are exactly what you imagine when you read the http verb and url. The latter, on the other hand, is rather unintuitive, an unfortunate consequence of forcing the REST philosophy unto the game mechanics, which will probably change.

The frontend uses `create-react-app`. It allows playing in offline mode, which requires no sign up, not even an internet connection after the page is loaded, but does not persist any state; and online mode, which delegates all logic to the API.

## Plan

Note: this is the plan I came up with _before_ I started implementing anything. I've left this section as is so the plan can be contrasted with the results.

The challenge only requires an API, but I used to love minesweeper as a child, before I had internet, and this seems like a really fun challenge, so I decided to implement a frontend for it.

I'm not spending a lot of time in code quality or aesthetics in the frontend though, as it's just an extra and I'm pretty short on time. I decided to go with next due to the simplicity of the framework, and to skip TypeScript because the complexity is going to stay pretty low and I'm going to be working on my own on it. 🤠 Yee-haw!

UPDATE: wound up adding TypeScript and some degree of architecture in the end... and moved away from Next to create-react-app due to the added complexity of SSR (and Next being tightly coupled to it).

1. Implement everything in the frontend
1. Add backend
1. Move game logic to backend. Frontend will then be "blind" to the state of unknown cells, no Chrome Inspector cheating!
1. Add auth
1. Make client library. Using TypeScript, ideally.
1. Refactor frontend to use client library.

## Challenges

Minesweeper is a game with pretty simple mechanics. If you click on a mine, it's game over. If you find all mines, it's a win.

### Challenge 1: Recursion

The only challenging mechanic is triggered when you click on an empty cell: all surrounding empty cells must be cleared, and so on. This is simple recursion, the same used by the [Flood Fill](https://en.wikipedia.org/wiki/Flood_fill) of MS Paint and other simple paint programs. 

Luckily I've already implemented this in the past while developing game engines — flood fill is an useful tool when editting 2D top-down RPG maps. The hidden challenge in the recursion is an easily reachable stack overflow, which can be avoided controlling the max depth of recursive calls and storing temporary state in a list. 

In all likelyhood there are way more efficient solutions to this problem, but this one works pretty well. If the board is small the stack overflow may not even be a problem.

Doing this recursion server-side at scale would probably be a huge challenge, which would require research and experimentation. But we're not going for scalability right now.

### Challenge 2: Persistence

The other challenge is persisting the state of the game. The simplest approach is just storing the entire matrix in MongoDB. This is the approach I'm gonna follow in the challenge. 

A simple optimization on top of that would be serializing the matrix, storing 1 byte indicating the width, 1 for the height, and then 1 byte for each cell. You could even make it smaller by storing cell values in a nibble instead of a byte, using bit-wise operators, since there are only so few possible values for each cell. But this is an optimization, and we don't care about optimizations in code challenges or PoCs. We can literally run the most primitive implementation in the free tiers of Heroku, Mongo Atlas and Netlify / Vercel, and still scale up to tens or maybe even hundreds of concurrent users.

### Challenge 3: Auth

There are many ways to do auth these days. I'd love to implement Auth0, which is pretty simple and very powerful, if time allows. Otherwise, I may just go with email+password and a JWT.

## API

We are going to need a couple of endpoints. 

### GET /games

401 if auth not present or invalid.

200 + array of games "owned" by authenticated user otherwise. Since it's going to be a list of all games, avoid returning game cell state, which is the heaviest property. This is intended for rendering in a list of past and ongoing games.

### GET /games/:id

401 if auth not present or invalid.
403 if game not owned by authenticated user.
200 + game with cell data otherwise.

### POST /games

This is our "new game" endpoint.

The client is required to create and provide the ID of the game. A UUIDv4 will be used for this. 

400, 403 or 422 (Can't make my mind up) if a game with the provided `id` already exists.
201 otherwise.

#### Small Note on Client-Generated IDs

The industry standard up until not so long ago was for DB engines to create ids, so it's pretty common for people to feel alienated by client-generated ids.

Generating IDs on the client-side is a standard practice when following the CQRS / event sourcing philosophy. Mark Seemann wrote [a nice piece on this subject](https://blog.ploeh.dk/2014/08/11/cqs-versus-server-generated-ids/).

UUID collisions are possible, albeit unlikely. Astronomically unlikely, in theory. Here's [a cool read about generating UUIDs at scale, client side](https://medium.com/teads-engineering/generating-uuids-at-scale-on-the-web-2877f529d2a2). 

### PUT /games/:id/cells/:cellId

"Click" on a cell. 

`cellId` is a make-shift id for cells, composed of the x and y coordinates of the cell concatenated, separated with a comma. For example: `1,2` will be the id of the cell at coordinates `(1, 2)`. 

The expected body is an object with a `value` attribute, which indicates the value we want to set that cell to.

```ts
{
  value: CellValue
}
```

`PUT /games/03cd79d7-6c92-4ce7-b29a-790850537ad0/cells/1,2 { value: CellValue.ClearKnown }` would attempt to update the cell at position (1, 2) with the value `CellValue.ClearKnown`. 

Response will always be `202 Accepted`. Client will need to re-request `GET /games/:id` to find out how the state of the game changed in response.

#### Note on REST

The client does not really know whether that is a valid state for the cell, as there could be a mine in that cell, which should transition the state of the game to `lost` instead. Under REST, this could be thought of as an authorization issue: a _regular_ user is not allowed to set that cell to that state if the current state is anything other than `CellValue.ClearUnknown`, but an _admin_ user could. 

This authorization strategy is pretty standard in REST, but an issue raises next: if the requester lacks authorization, the API should respond with `401 Unauthorized`. But if the request is acknowledged and some mutation is performed in return, the API should respond with `200 OK` or `202 Accepted` to indicate so. 

The two issues aforementioned, namely the make-shift id and the authorization strategy, are good indicators of the fact that REST is probably not the best approach for the backend. Nor would be GraphQL, which is practically an evolution of REST built over the same philosophy. 

JSON-RPC or WebSockets would be more fitting.

Having said this, there is nothing intrinsically wrong with this approach in practice, nor is drifting away from standards, if standards lag behind business needs. (i.e. no great hard would come from exposing a verb in the url, such as `POST /games/03cd79d7-6c92-4ce7-b29a-790850537ad0/reveal { x, y }` or `/reveal { x, y }`)

