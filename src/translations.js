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
        infoCreateHtml: '<h3>Clue-giving phase</h3>'
            + '<p>Each green badge sits between / above two petals — read the two words touching that boundary (the right edge of the left petal and the left edge of the right petal) and write one word that links them both. Your clue may not contain either petal word.</p>'
            + '<h3>What happens next</h3>'
            + '<ol>'
            + '<li>Tap the <strong>share</strong> icon to copy a link other players can open, or hand the device to them.</li>'
            + '<li>Tap <strong>{play}</strong> to shuffle the petals (plus {extras} {decoysWord}) and start the puzzle.</li>'
            + '<li>The other players drag each petal into a flower-slot and click it to rotate, until every boundary\'s two visible words fit your clue.</li>'
            + '</ol>',
        infoPlayHtml: '<h3>Goal</h3>'
            + '<p>Place every petal in the right slot at the right rotation, so each green clue badge sits between / above the two petal-words it describes.</p>'
            + '<h3>Petal mechanics</h3>'
            + '<ul>'
            + '<li>Each diamond petal has <strong>4 words</strong>, one per edge.</li>'
            + '<li>The two top edges of adjacent petals (right edge of the left petal + left edge of the right petal) are what the clue between / above them refers to.</li>'
            + '<li><strong>Drag</strong> a petal onto a flower-slot to place it.</li>'
            + '<li><strong>Click</strong> a petal to rotate it 90° clockwise — there is no separate rotate icon.</li>'
            + '<li>Some petals are <strong>decoys</strong>: they don\'t belong in any slot. Leave them outside the flower.</li>'
            + '</ul>'
            + '<h3>Buttons in the top bar</h3>'
            + '<ul>'
            + '<li><strong>Lock in</strong> (green) — enabled once every slot is filled. Checks your guess: any petal in the wrong slot OR at the wrong rotation is returned to the play area. The <em>Round</em> counter ticks up.</li>'
            + '<li><strong>Reveal</strong> (red) — gives up: the flower solves itself.</li>'
            + '<li><strong>Back arrow</strong> — exit the current game (with a confirmation).</li>'
            + '<li><strong>Share</strong> — copy the game link so another player can join with the same flower.</li>'
            + '</ul>'
            + '<h3>Tip</h3>'
            + '<p>The bottom-two edges of each petal don\'t have to match anything — only the top-two edges (the ones facing the clue badges) matter for scoring.</p>',
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
        infoCreateHtml: '<h3>Hinweisphase</h3>'
            + '<p>Jedes grüne Schild liegt zwischen bzw- über zwei Blütenblättern — lies die beiden Wörter, die an dieser Grenze aneinanderstoßen (die rechte Kante des linken Blütenblatts und die linke Kante des rechten Blütenblatts), und schreibe ein Wort, das beide verbindet. Dein Hinweis darf keines der beiden Blütenblatt-Wörter enthalten.</p>'
            + '<h3>Wie es weitergeht</h3>'
            + '<ol>'
            + '<li>Tippe auf das <strong>Teilen</strong>-Symbol, um einen Link zu kopieren, den andere Spieler öffnen können, oder reiche das Gerät weiter.</li>'
            + '<li>Tippe auf <strong>{play}</strong>, um die Blütenblätter zu mischen (plus {extras} {decoysWord}) und das Rätsel zu starten.</li>'
            + '<li>Die anderen Spieler ziehen jedes Blütenblatt in einen Slot und tippen zum Drehen darauf, bis an jeder Grenze die beiden sichtbaren Wörter zum Hinweis passen.</li>'
            + '</ol>',
        infoPlayHtml: '<h3>Ziel</h3>'
            + '<p>Platziere jedes Blütenblatt im richtigen Slot mit der richtigen Drehung, sodass jedes grüne Hinweis-Schild zwischen/über den beiden Wörtern liegt, die es beschreibt.</p>'
            + '<h3>So funktionieren die Blütenblätter</h3>'
            + '<ul>'
            + '<li>Jedes rautenförmige Blütenblatt hat <strong>4 Wörter</strong>, eines pro Kante.</li>'
            + '<li>Die beiden oberen Kanten benachbarter Blütenblätter (rechte Kante des linken + linke Kante des rechten Blatts) sind das, worauf sich der Hinweis dazwischen bezieht.</li>'
            + '<li><strong>Ziehe</strong> ein Blütenblatt in einen Slot, um es zu platzieren.</li>'
            + '<li><strong>Tippe</strong> auf ein Blütenblatt, um es 90° im Uhrzeigersinn zu drehen — ein separates Dreh-Symbol gibt es nicht.</li>'
            + '<li>Einige Blütenblätter sind <strong>Köder</strong>: sie gehören in keinen Slot. Lasse sie außerhalb der Blume liegen.</li>'
            + '</ul>'
            + '<h3>Buttons in der oberen Leiste</h3>'
            + '<ul>'
            + '<li><strong>Prüfen</strong> (grün) — verfügbar, sobald jeder Slot belegt ist. Prüft deinen Versuch: jedes Blütenblatt im falschen Slot ODER mit falscher Drehung wandert zurück in den Spielbereich. Der <em>Runden</em>-Zähler erhöht sich.</li>'
            + '<li><strong>Auflösen</strong> (rot) — Aufgabe: die Blume löst sich selbst.</li>'
            + '<li><strong>Zurück-Pfeil</strong> — das laufende Spiel verlassen (mit Rückfrage).</li>'
            + '<li><strong>Teilen</strong> — den Spiel-Link kopieren, damit ein anderer Spieler dieselbe Blume bekommt.</li>'
            + '</ul>'
            + '<h3>Tipp</h3>'
            + '<p>Die unteren beiden Kanten jedes Blütenblatts müssen zu nichts passen — nur die oberen beiden Kanten (die zu den Hinweis-Schildern zeigen) zählen für die Wertung.</p>',
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
