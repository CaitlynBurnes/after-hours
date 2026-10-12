# Afterhours — Song Guessing Game (prototype)

A static, browser-only music guessing game for two friends. It includes playlist selection, rounds, alternating turns, hints, scoring, a results screen, CSV song import, and optional local audio attachments.

## Run it

1. Download and unzip `afterhours-song-guessing-game.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to open it in a modern browser.
4. Choose playlists and start a game.

No installation, account, API key, or server is required. Imported CSV data and attached audio are processed locally in the browser; they are not uploaded by this prototype.

## Add your own songs

1. Click **Download CSV template**.
2. Edit the CSV in a spreadsheet app or text editor. Required columns: `title`, `artist`, `playlist`. Optional columns: `hint`, `year`.
3. Save as CSV and click **Import CSV**.
4. Select the imported playlist(s) and start a game.
5. To play audio for a round, click **Attach audio** and select an audio file you have the right to use. The selected audio is temporary for the current page session.

CSV example:

```csv
title,artist,playlist,hint,year
"Example Song","Example Artist","My Playlist","A clue about the title",2024
```

## GitHub Pages hosting

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site.

## Music provider note

This prototype does **not** call the Spotify API, use Spotify embeds, or stream Spotify content. Spotify's current Developer Policy prohibits using its platform for games and trivia quizzes without written approval. Use your own properly licensed audio files or a music provider that expressly permits quiz/game use. Do not upload or distribute copyrighted music unless you have the necessary rights.

## Scoring

- Correct title without hint: 2 points.
- Correct title after hint: 1 point.
- Correct artist: +1 point.
- Turns alternate between players.
