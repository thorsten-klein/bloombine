// Bloombine — UI translations.
// Dictionary keys mirror those in src/main.js's t() helper. When a key is
// missing for the current language we fall back to English; missing in
// English too → the raw key string is shown (handy for catching gaps).
window.TRANSLATIONS = {
    en: {
        title:        'Bloombine',
        subtitle:     'Word associations around the flower',
        petals:       'Petals',
        extras:       'Extra (decoy) petals',
        extreme:      'Extreme mode',
        extremeHint:  'Player must also drag the right clue into each badge.',
        language:     'Word language',
        start:        'Create game',
        rules:        'Rules',
        rulesText:    "A flower has N petals in a ring. Each petal carries four words — one per edge. Where two petals meet, two of their words touch (the right one of the left petal, the left one of the right petal). The clue-giver writes one word per boundary that associates both. Other players get the shuffled petals (plus a few decoys) and must rotate and place each one so every boundary matches its clue.",
        clueHeader:   'Write a clue for each boundary',
        clueHint:     'one word that links the two words on either side',
        cluePh:       'Type clue here ...',
        clueContains: 'Clue "{c}" contains the word "{w}".',
        play:         'Play',
        copied:       'Link copied!',
        copyFallback: 'Link is in the address bar (hash).',
        playInstr:    "Drag each petal into the matching slot and tap ↻ to rotate, until each boundary's two words fit its clue.",
        tray:         'Petals (shuffled)',
        reveal:       'Reveal',
        newRound:     'New game',
        score:        '{c} of {t} correct.',
        boundary:     'Boundary',
        slot:         'Slot',
        needAllClues: 'Please fill in every clue.',
        tries:        'Round {c}',
        lockIn:       'Submit',
        exitTitle:    'Exit game?',
        exitMsg:      'Your progress on this flower will be lost.',
        cancel:       'Cancel',
        exit:         'Exit',
        allCorrect:   'All correct!',
        // Settings modal
        settings:        'Settings',
        chooseLanguage:  'Language',
        english:         'English',
        german:          'Deutsch',
        // Generic button labels
        save:            'Save',
        edit:            'Edit',
        reset:           'Reset',
        copy:            'Copy',
        share:           'Share',
        back:            'Back',
        fullscreen:      'Fullscreen',
        exitFullscreen:  'Exit fullscreen',
        backToGame:      'Back to game',
        chooseFile:      'Choose file',
        importBtn:       'Import',
        downloadJson:    'Download JSON',
        simpleDialog:    'Simple dialog',
        fillCluesAi:     'Fill clues with AI',
        fillCluesAiWorking: 'Asking AI…',
        fillCluesAiDone: 'AI filled {c} clue(s)',
        fillCluesAiFailed: 'AI clue fill failed: {m}',
        aiKeyPrompt:     'Enter your Google AI Studio API key (used to call Gemini 2.5 Flash). It is stored only in this browser.',
        aiKeyMissing:    'No API key provided — cancelled.',
        // Create-screen Save banner
        gameSavedToSet:     'Game saved to set',
        gameAlreadyInSet:   'Game already in set',
        gameSavedToSetTip:  'Save to game set',
        // Game-set picker
        playSpecificGame:   'List saved games',
        playRandomUnplayed: 'Play random unplayed game',
        noUnplayedLeft:     'No unplayed games left in the set',
        noGamesYet:         'No games in set yet. Start a game from the main menu to add one.',
        resetGameSetTitle:  'Clear the entire game set',
        resetGameSetConfirm:'Reset the game set? All saved games will be removed.',
        editInCreate:       'Edit in create screen',
        gameMissingClues:   'Game has missing clues — edit to fill them in',
        delete:             'Delete',
        // Share modal
        shareThisGame:   'Share this game',
        shareIntro:      'Send the Play URL so a friend opens the puzzle ready to play, or the Edit URL so they land in the create screen and can tweak the words / clues. The Game ID can be pasted into an existing Bloombine page.',
        gameUrlPlay:     'Game URL (Play)',
        gameUrlEdit:     'Game URL (Edit)',
        gameId:          'Game ID',
        // Import modal
        importGameTitle:    'Import game',
        importGameDesc:     'Paste a game id (base64), a share URL, or decoded JSON — or pick a JSON file.',
        importGamePh:       'Paste game id, share URL, or JSON…',
        importPasteFirst:   'Paste game text or choose a file',
        importGameSet:      'Import game set',
        exportGameSet:      'Export game set',
        importFailed:       'Import failed: {m}',
        // Info button
        howToPlay:          'How to play',
        info:               'Info',
        // Info popup content. Inline HTML so we can keep headings/lists.
        // Placeholders: {play} = play-button label, {extras} = decoy count,
        // {decoysWord} = singular/plural noun (handled in main.js).
        infoSetupHtml: '<h3>Welcome to Bloombine</h3>'
            + '<p>A flower has <strong>N petals</strong> arranged in a ring. Each petal carries four words, one per edge. Where two petals meet, two of their words touch — the right edge of the left petal and the left edge of the right petal. The clue-giver writes one word for every boundary that links those two touching words.</p>'
            + '<p>The other players receive the shuffled petals (plus a few decoys) and have to rotate and place each one so every boundary\'s two visible words fit its clue.</p>'
            + '<h3>Setup options</h3>'
            + '<ul>'
            + '<li><strong>Petals</strong> — how many real petals make up the flower (the ring size).</li>'
            + '<li><strong>Extra (decoy) petals</strong> — additional petals added to the player\'s tray at play-time. They don\'t belong in any slot; the players have to spot them and leave them outside the flower.</li>'
            + '<li><strong>Extreme mode</strong> — flips a much harder switch: the clue badges arrive <em>empty</em>, and the player must drag each clue text into the correct badge in addition to placing the petals. Use this for an extra-challenging variant.</li>'
            + '<li><strong>Word language</strong> — which word pool the petals are drawn from.</li>'
            + '</ul>'
            + '<h3>What the button does</h3>'
            + '<p>Tap <strong>{start}</strong> to draw a fresh flower from the word pool and jump into the clue-giving screen.</p>'
            + '<h3>Saved games</h3>'
            + '<p>The menu below the button lets you import a game (link / file), import or export a whole game set, or browse and replay the games you\'ve already saved.</p>',
        infoCreateHtml: '<h3>Clue-giving phase</h3>'
            + '<p>Each green badge sits between two petals. Read the two words touching that boundary — the right edge of the left petal and the left edge of the right petal — and write one word that links them. Your clue may not contain either petal word.</p>'
            + '<h3>Reshaping the flower</h3>'
            + '<ul>'
            + '<li><strong>Drag</strong> a petal out of its slot if you don\'t like its words — a fresh petal from the language\'s word pool spawns in that slot automatically.</li>'
            + '<li><strong>Click</strong> a petal (even one already sitting in a slot) to rotate it 90° clockwise, so the word you want lands on the edge you want.</li>'
            + '</ul>'
            + '<h3>What happens next</h3>'
            + '<ol>'
            + '<li>Once every clue is filled, the <strong>share</strong> icon and the <strong>{play}</strong> button both unlock.</li>'
            + '<li>Tap <strong>share</strong> to copy a play link other players can open — or tap <strong>{play}</strong> yourself and hand the device on.</li>'
            + '</ol>'
            + '<h3>During play</h3>'
            + '<ol>'
            + '<li><strong>{play}</strong> shuffles the petals and adds {extras} extra {decoysWord}.</li>'
            + '<li>The other players have to find the correct slot and rotation for every petal.</li>'
            + '<li>They drag each petal into a slot and click it to rotate, until they\'re confident that the two words on either side of every boundary fit your clue.</li>'
            + '<li><em>Extreme mode (if enabled on the main screen):</em> the clue badges arrive empty — players must also drag each clue into the right badge.</li>'
            + '<li>Whoever solves the puzzle in the fewest rounds wins.</li>'
            + '</ol>',
        infoPlayHtml: '<h3>Goal</h3>'
            + '<p>Place and rotate every petal so that, at each boundary, the two petal-edges touching the green clue badge are both linked by that clue word.</p>'
            + '<p><em>Note:</em> Only the <strong>top two edges</strong> of a petal (the ones facing a clue badge) count. The bottom two are red herrings — they make the right placement harder to spot.</p>'
            + '<h3>Petal mechanics</h3>'
            + '<ul>'
            + '<li>Each diamond petal has <strong>4 words</strong>, one per edge.</li>'
            + '<li>The two top edges of adjacent petals — the right edge of the left petal and the left edge of the right petal — are what the clue badge between them refers to.</li>'
            + '<li><strong>Drag</strong> a petal onto the slot you think it belongs to; <strong>click</strong> a petal to rotate it 90° clockwise (there is no separate rotate icon).</li>'
            + '<li>Some petals are <strong>decoys</strong>: they don\'t belong in any slot. Try to spot them and leave them outside the flower.</li>'
            + '</ul>'
            + '<h3>Extreme mode</h3>'
            + '<p>If the clue-giver enabled <strong>Extreme mode</strong>, the green badges start out empty — the clue words appear as separate chips floating in the play area. Drag each chip into the badge you think it belongs to. <strong>Lock in</strong> only unlocks once every slot AND every badge is filled, and a wrong-badge clue is returned to the play area along with any wrong petals.</p>'
            + '<h3>Buttons in the top bar</h3>'
            + '<ul>'
            + '<li><strong>Lock in</strong> (green) — enabled once every slot is filled. Checks your guess: any petal in the wrong slot OR at the wrong rotation is returned to the play area. The <em>Round</em> counter ticks up.</li>'
            + '<li><strong>Reveal</strong> (red) — gives up: the flower solves itself and every card snaps into its correct slot.</li>'
            + '<li><strong>Back arrow</strong> — exit the current game (with a confirmation).</li>'
            + '<li><strong>Share</strong> — copy the game link so another player can solve the same flower.</li>'
            + '</ul>',
        decoySingular:      'decoy',
        decoyPlural:        'decoys',
        // Simple-dialog
        apply:              'Apply',
        clue:               'Clue',
        previousBoundary:   'Previous boundary',
        nextBoundary:       'Next boundary',
        otherCards:         'Other cards',
        swap:               'Swap',
        // Banners / errors
        gameAddedToSet:     'Game added to set',
        invalidGameData:    'Invalid game data',
        emptyInput:         'Empty input',
        expectedArray:      'Expected an array',
        gameSetImported:    'Game set imported ({c} games)',
        gameSetEmpty:       'Game set is empty',
        downloadFailed:     'Download failed: {m}',
        // Misc tooltips / banners (also in the German block below + the
        // misc-tooltips patch at end of file)
        zoomIn:             'Zoom in',
        zoomOut:            'Zoom out',
        shareFailed:        'Share failed: {m}',
        fullscreenFailed:   'Fullscreen unavailable: {m}',
        petalsWord:         'petals',
        idWord:             'id',
    },
    de: {
        title:        'Bloombine',
        subtitle:     'Wortassoziationen rund um die Blume',
        petals:       'Blütenblätter',
        extras:       'Zusätzliche (Köder-) Blütenblätter',
        extreme:      'Extrem-Modus',
        extremeHint:  'Die Spieler müssen auch den passenden Hinweis in jedes Schild ziehen.',
        language:     'Wortsprache',
        start:        'Spiel erstellen',
        rules:        'Regeln',
        rulesText:    'Eine Blume hat N Blütenblätter in einem Kreis. Jedes Blütenblatt trägt vier Wörter — eines pro Kante. Wo zwei Blütenblätter aneinanderstoßen, berühren sich zwei ihrer Wörter (das rechte des linken Blütenblatts + das linke des rechten Blütenblatts). Der Hinweisgeber schreibt pro Grenze ein Wort, das beide verbindet. Die anderen Spieler bekommen die gemischten Blütenblätter (plus ein paar Köder) und müssen sie drehen und so platzieren, dass an jeder Grenze die beiden Wörter zum Hinweis passen.',
        clueHeader:   'Schreibe für jede Grenze einen Hinweis',
        clueHint:     'ein Wort, das die beiden benachbarten Wörter verbindet',
        cluePh:       'Hinweis eingeben ...',
        clueContains: 'Hinweis „{c}" enthält das Wort „{w}".',
        play:         'Spielen',
        copied:       'Link kopiert!',
        copyFallback: 'Link steht in der Adresszeile (Hash).',
        playInstr:    'Ziehe jedes Blütenblatt in den passenden Slot und tippe auf ↻ zum Drehen, bis an jeder Grenze die beiden Wörter zum Hinweis passen.',
        tray:         'Blütenblätter (gemischt)',
        reveal:       'Auflösen',
        newRound:     'Neues Spiel',
        score:        '{c} von {t} richtig.',
        boundary:     'Grenze',
        slot:         'Slot',
        needAllClues: 'Bitte fülle jeden Hinweis aus.',
        tries:        'Runde {c}',
        lockIn:       'Prüfen',
        exitTitle:    'Spiel verlassen?',
        exitMsg:      'Dein Fortschritt auf dieser Blume geht verloren.',
        cancel:       'Abbrechen',
        exit:         'Verlassen',
        allCorrect:   'Alles richtig!',
        // Settings modal
        settings:        'Einstellungen',
        chooseLanguage:  'Sprache',
        english:         'English',
        german:          'Deutsch',
        // Generic button labels
        save:            'Speichern',
        edit:            'Bearbeiten',
        reset:           'Zurücksetzen',
        copy:            'Kopieren',
        share:           'Teilen',
        back:            'Zurück',
        fullscreen:      'Vollbild',
        exitFullscreen:  'Vollbild verlassen',
        backToGame:      'Zurück zum Spiel',
        chooseFile:      'Datei wählen',
        importBtn:       'Importieren',
        downloadJson:    'JSON herunterladen',
        simpleDialog:    'Einfacher Dialog',
        fillCluesAi:     'Hinweise mit KI ausfüllen',
        fillCluesAiWorking: 'KI wird befragt…',
        fillCluesAiDone: '{c} Hinweis(e) von KI ausgefüllt',
        fillCluesAiFailed: 'KI-Hinweisbefüllung fehlgeschlagen: {m}',
        aiKeyPrompt:     'Bitte deinen Google-AI-Studio-API-Schlüssel eingeben (für Gemini 2.5 Flash). Wird nur in diesem Browser gespeichert.',
        aiKeyMissing:    'Kein API-Schlüssel angegeben — abgebrochen.',
        // Create-screen Save banner
        gameSavedToSet:     'Spiel zum Set hinzugefügt',
        gameAlreadyInSet:   'Spiel ist bereits im Set',
        gameSavedToSetTip:  'Im Spielset speichern',
        // Game-set picker
        playSpecificGame:   'Gespeicherte Spiele',
        playRandomUnplayed: 'Zufälliges ungespieltes Spiel spielen',
        noUnplayedLeft:     'Keine ungespielten Spiele mehr im Set',
        noGamesYet:         'Noch keine Spiele im Set. Starte über das Hauptmenü ein Spiel, um eines hinzuzufügen.',
        resetGameSetTitle:  'Das gesamte Spielset löschen',
        resetGameSetConfirm:'Spielset zurücksetzen? Alle gespeicherten Spiele werden entfernt.',
        editInCreate:       'Im Erstell-Bildschirm bearbeiten',
        gameMissingClues:   'Im Spiel fehlen Hinweise — zum Ausfüllen bearbeiten',
        delete:             'Löschen',
        // Share modal
        shareThisGame:   'Dieses Spiel teilen',
        shareIntro:      'Sende die Play-URL, damit ein Freund das Rätsel zum Spielen öffnet, oder die Edit-URL, damit er im Erstell-Bildschirm landet und Wörter / Hinweise anpassen kann. Die Spiel-ID kann in eine bestehende Bloombine-Seite eingefügt werden.',
        gameUrlPlay:     'Spiel-URL (Spielen)',
        gameUrlEdit:     'Spiel-URL (Bearbeiten)',
        gameId:          'Spiel-ID',
        // Import modal
        importGameTitle:    'Spiel importieren',
        importGameDesc:     'Füge eine Spiel-ID (base64), eine Teilen-URL oder dekodiertes JSON ein — oder wähle eine JSON-Datei.',
        importGamePh:       'Spiel-ID, Teilen-URL oder JSON einfügen…',
        importPasteFirst:   'Bitte Spieltext einfügen oder eine Datei wählen',
        importGameSet:      'Spielset importieren',
        exportGameSet:      'Spielset exportieren',
        importFailed:       'Import fehlgeschlagen: {m}',
        // Info button
        howToPlay:          'Spielanleitung',
        info:               'Info',
        // Info popup content (HTML). Placeholders match the en block.
        infoSetupHtml: '<h3>Willkommen bei Bloombine</h3>'
            + '<p>Eine Blume hat <strong>N Blütenblätter</strong>, die in einem Ring angeordnet sind. Jedes Blütenblatt trägt vier Wörter, eines pro Kante. Wo zwei Blütenblätter aneinanderstoßen, berühren sich zwei ihrer Wörter — die rechte Kante des linken Blütenblatts und die linke Kante des rechten. Der Hinweisgeber schreibt für jede Grenze ein Wort, das diese beiden Wörter verbindet.</p>'
            + '<p>Die anderen Spieler erhalten die gemischten Blütenblätter (plus ein paar Köder) und müssen jedes so drehen und platzieren, dass an jeder Grenze die beiden sichtbaren Wörter zum Hinweis passen.</p>'
            + '<h3>Einstellungen</h3>'
            + '<ul>'
            + '<li><strong>Blütenblätter</strong> — wie viele echte Blütenblätter die Blume bilden (Ringgröße).</li>'
            + '<li><strong>Zusätzliche (Köder-) Blütenblätter</strong> — zusätzliche Blütenblätter, die beim Spielen in den Vorrat des Spielers gelegt werden. Sie gehören in keinen Slot; die Spieler müssen sie erkennen und außerhalb der Blume liegen lassen.</li>'
            + '<li><strong>Extrem-Modus</strong> — schaltet eine deutlich schwerere Variante ein: die Hinweis-Schilder bleiben <em>leer</em>, und die Spieler müssen zusätzlich zu den Blütenblättern auch jeden Hinweis in das richtige Schild ziehen. Ideal für eine extra knifflige Runde.</li>'
            + '<li><strong>Wortsprache</strong> — aus welchem Wortpool die Blütenblätter gezogen werden.</li>'
            + '</ul>'
            + '<h3>Was der Button macht</h3>'
            + '<p>Tippe auf <strong>{start}</strong>, um eine neue Blume aus dem Wortpool zu ziehen und direkt in den Hinweis-Bildschirm zu springen.</p>'
            + '<h3>Gespeicherte Spiele</h3>'
            + '<p>Über das Menü unter dem Button kannst du ein Spiel importieren (Link / Datei), ein ganzes Spielset importieren oder exportieren oder die bereits gespeicherten Spiele durchsuchen und erneut spielen.</p>',
        infoCreateHtml: '<h3>Hinweisphase</h3>'
            + '<p>Jedes grüne Schild liegt zwischen zwei Blütenblättern. Lies die beiden Wörter, die an dieser Grenze aneinanderstoßen — die rechte Kante des linken Blütenblatts und die linke Kante des rechten — und schreibe ein Wort, das beide verbindet. Dein Hinweis darf keines der beiden Blütenblatt-Wörter enthalten.</p>'
            + '<h3>Blume umgestalten</h3>'
            + '<ul>'
            + '<li><strong>Ziehe</strong> ein Blütenblatt aus seinem Slot, wenn dir die Wörter nicht gefallen — ein frisches Blütenblatt aus dem Wortpool der Sprache erscheint automatisch im Slot.</li>'
            + '<li><strong>Tippe</strong> auf ein Blütenblatt (auch wenn es schon im Slot liegt), um es 90° im Uhrzeigersinn zu drehen, sodass das gewünschte Wort an der gewünschten Kante landet.</li>'
            + '</ul>'
            + '<h3>Wie es weitergeht</h3>'
            + '<ol>'
            + '<li>Sobald alle Hinweise ausgefüllt sind, werden das <strong>Teilen</strong>-Symbol und der <strong>{play}</strong>-Button freigeschaltet.</li>'
            + '<li>Tippe auf <strong>Teilen</strong>, um einen Spiel-Link zu kopieren, den andere Spieler öffnen können — oder tippe selbst auf <strong>{play}</strong> und reiche das Gerät weiter.</li>'
            + '</ol>'
            + '<h3>Im Spielverlauf</h3>'
            + '<ol>'
            + '<li><strong>{play}</strong> mischt die Blütenblätter und fügt {extras} zusätzliche {decoysWord} hinzu.</li>'
            + '<li>Die anderen Spieler müssen für jedes Blütenblatt den richtigen Slot und die richtige Drehung finden.</li>'
            + '<li>Dazu ziehen sie jedes Blütenblatt in einen Slot und tippen zum Drehen darauf, bis sie überzeugt sind, dass die beiden Wörter an jeder Grenze zu deinem Hinweis passen.</li>'
            + '<li><em>Extrem-Modus (falls auf dem Hauptbildschirm aktiviert):</em> Die Hinweis-Schilder kommen leer an — die Spieler müssen zusätzlich jeden Hinweis in das richtige Schild ziehen.</li>'
            + '<li>Wer das Rätsel in den wenigsten Runden löst, gewinnt.</li>'
            + '</ol>',
        infoPlayHtml: '<h3>Ziel</h3>'
            + '<p>Platziere und drehe jedes Blütenblatt so, dass an jeder Grenze die beiden Blütenblatt-Kanten, die das grüne Hinweis-Schild berühren, beide vom Hinweis-Wort verbunden werden.</p>'
            + '<p><em>Hinweis:</em> Nur die <strong>oberen beiden Kanten</strong> eines Blütenblatts (die zu einem Hinweis-Schild zeigen) zählen. Die unteren beiden sind Ablenkungen — sie sollen es schwerer machen, die richtige Platzierung zu erkennen.</p>'
            + '<h3>So funktionieren die Blütenblätter</h3>'
            + '<ul>'
            + '<li>Jedes rautenförmige Blütenblatt hat <strong>4 Wörter</strong>, eines pro Kante.</li>'
            + '<li>Die beiden oberen Kanten benachbarter Blütenblätter — die rechte Kante des linken und die linke Kante des rechten — sind das, worauf sich das Hinweis-Schild dazwischen bezieht.</li>'
            + '<li><strong>Ziehe</strong> ein Blütenblatt in den Slot, in den es deiner Meinung nach gehört; <strong>tippe</strong> darauf, um es 90° im Uhrzeigersinn zu drehen (ein separates Dreh-Symbol gibt es nicht).</li>'
            + '<li>Einige Blütenblätter sind <strong>Köder</strong>: sie gehören in keinen Slot. Versuche, sie zu erkennen, und lasse sie außerhalb der Blume liegen.</li>'
            + '</ul>'
            + '<h3>Extrem-Modus</h3>'
            + '<p>Falls der Hinweisgeber den <strong>Extrem-Modus</strong> aktiviert hat, bleiben die grünen Schilder zunächst leer — die Hinweis-Wörter erscheinen als separate Chips im Spielbereich. Ziehe jeden Chip in das Schild, in das er deiner Meinung nach gehört. <strong>Prüfen</strong> wird erst aktiv, wenn jeder Slot UND jedes Schild belegt ist, und ein Hinweis im falschen Schild wandert zusammen mit falsch platzierten Blütenblättern zurück in den Spielbereich.</p>'
            + '<h3>Buttons in der oberen Leiste</h3>'
            + '<ul>'
            + '<li><strong>Prüfen</strong> (grün) — verfügbar, sobald jeder Slot belegt ist. Prüft deinen Versuch: jedes Blütenblatt im falschen Slot ODER mit falscher Drehung wandert zurück in den Spielbereich. Der <em>Runden</em>-Zähler erhöht sich.</li>'
            + '<li><strong>Auflösen</strong> (rot) — Aufgabe: die Blume löst sich selbst und jede Karte landet in ihrem richtigen Slot.</li>'
            + '<li><strong>Zurück-Pfeil</strong> — das laufende Spiel verlassen (mit Rückfrage).</li>'
            + '<li><strong>Teilen</strong> — den Spiel-Link kopieren, damit ein anderer Spieler dieselbe Blume lösen kann.</li>'
            + '</ul>',
        decoySingular:      'Köder',
        decoyPlural:        'Köder',
        // Simple-dialog
        apply:              'Übernehmen',
        clue:               'Hinweis',
        previousBoundary:   'Vorherige Grenze',
        nextBoundary:       'Nächste Grenze',
        otherCards:         'Weitere Karten',
        swap:               'Tauschen',
        // Banners / errors
        gameAddedToSet:     'Spiel zum Set hinzugefügt',
        invalidGameData:    'Ungültige Spieldaten',
        emptyInput:         'Leere Eingabe',
        expectedArray:      'Ein Array wurde erwartet',
        gameSetImported:    'Spielset importiert ({c} Spiele)',
        gameSetEmpty:       'Spielset ist leer',
        downloadFailed:     'Download fehlgeschlagen: {m}',
        // Misc tooltips / banners
        zoomIn:             'Vergrößern',
        zoomOut:            'Verkleinern',
        info:               'Info',
        playLabel:          'Petals (n petals)',   // unused, but available
        shareFailed:        'Teilen fehlgeschlagen: {m}',
        fullscreenFailed:   'Vollbild nicht verfügbar: {m}',
        petalsWord:         'Blütenblätter',
        idWord:             'ID',
        boundary4Of4:       '{c} / {t}',   // unused, kept for symmetry
    },
};
